// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform } from '../tools/g2';
import { round } from '../tools/math';
import {
  getObjectDiff, UniqueMap,
  duplicate, refAndDiffToObject,
  diffPathsToObj, diffObjToPaths, minify, unminify,
} from '../tools/tools';
import type { DiagramElement } from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

type TypeEvent = ['touchUp']
                 | ['touchDown', number, number]
                 | ['start']
                 | ['startBeingMoved', string]
                 | ['moved', string, Object]
                 | ['startMovingFreely', string, Object, Object]
                 | ['stopBeingMoved', string, Object, Object]
                 | ['cursorMove', number, number]
                 | ['showCursor', number, number]
                 | ['hideCursor']
                 | ['click', string];

type TypeState = [number, Object];

type TypeSlide = ['goto' | 'next' | 'prev', string, number];

type TypeEvents = Array<[number, TypeEvent]>;
type TypeSlides = Array<[number, TypeSlide]>;
type TypeStates = Array<[number, TypeState]>;

function download(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  const { body } = document;
  if (body != null) {
    body.appendChild(element);
    element.click();
    body.removeChild(element);
  }
}

function getIndexOfEarliestTime(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  index: number,
) {
  if (index < 1) {
    return index;
  }
  let i = index;
  let same = true;
  const time = recordedData[index][0];
  while (i > 0 && same) {
    const prevTime = recordedData[i - 1][0];
    if (prevTime !== time) {
      same = false;
    } else {
      i -= 1;
    }
  }
  return i;
}

function getIndexOfLatestTime(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  index: number,
) {
  const time = recordedData[index][0];
  let i = index;
  let loop = true;
  while (loop) {
    if (i === recordedData.length - 1) {
      loop = false;
    } else if (recordedData[i + 1][0] === time) {
      i += 1;
    } else {
      loop = false;
    }
  }
  return Math.max(i, index);
}

function getLastUniqueIndeces(
  recordedData: TypeEvents,
  startIndex: number,
  endIndex: number,
) {
  // const indeces = [];
  const types = {};
  let start = startIndex;
  if (start < 0) {
    start = 0;
  }
  for (let i = start; i <= endIndex; i += 1) {
    const data = recordedData[i];
    const [, event] = data;
    const [type] = event;
    types[type] = i;
  }
  return Object.values(types);
}

function getIndexRangeForTime(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
) {
  if (recordedData.length === 0) {
    return [-1, -1];
  }
  const startTime = parseFloat(recordedData[startSearch][0]);
  if (time === startTime) {
    return [startSearch, startSearch];
  }
  if (time < startTime) {
    return [-1, startSearch];
  }

  const endTime = parseFloat(recordedData[endSearch][0]);
  if (time === endTime) {
    return [endSearch, endSearch];
  }
  if (time > endTime) {
    return [endSearch, -1];
  }

  const searchRange = endSearch - startSearch;

  if (searchRange < 2) {
    return [startSearch, endSearch];
  }

  const midSearch = startSearch + Math.floor(searchRange / 2);
  const midTime = parseFloat(recordedData[midSearch][0]);
  if (time === midTime) {
    return [midSearch, midSearch];
  }
  if (time < midTime) {
    return getIndexRangeForTime(recordedData, time, startSearch, midSearch);
  }
  return getIndexRangeForTime(recordedData, time, midSearch, endSearch);
}

function getNextIndexForTime(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
) {
  const nextIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[1];
  return getIndexOfEarliestTime(recordedData, nextIndex);
}

function getPrevIndexForTime(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
) {
  const prevIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[0];
  return getIndexOfEarliestTime(recordedData, prevIndex);
}

function getTimeToIndex(
  recordedData: TypeEvents | TypeSlides | TypeStates,
  eventIndex: number,
  time: number,
) {
  if (eventIndex === -1 || eventIndex > recordedData.length - 1) {
    return -1;
  }
  const nextTime = recordedData[eventIndex][0];
  return nextTime - time;
}

function getCursorState(
  recordedData: TypeEvents,
  eventIndex: number,
) {
  let i = eventIndex;
  let touchUp = null;
  let cursorPosition = null;
  let showCursor = null;
  while (i >= 0 && (cursorPosition == null || touchUp == null || showCursor == null)) {
    const [, event] = recordedData[i];
    const [eventType] = event;
    if (cursorPosition == null && eventType === 'cursorMove') { // $FlowFixMe
      const [, x, y] = event;
      cursorPosition = new Point(x, y);
    }
    if (touchUp == null && eventType === 'touchUp') {
      touchUp = true;
    }
    if (touchUp == null && eventType === 'touchDown') {
      touchUp = false;
      if (cursorPosition == null) {  // $FlowFixMe
        const [, x, y] = event;
        cursorPosition = new Point(x, y);
      }
    }
    if (showCursor == null && eventType === 'showCursor') {
      showCursor = true;
    }
    if (showCursor == null && eventType === 'hideCursor') {
      showCursor = false;
    }
    i -= 1;
  }
  return {
    show: showCursor == null ? false : showCursor,
    up: touchUp == null ? true : touchUp,
    position: cursorPosition == null ? new Point(0, 0) : cursorPosition,
  };
}

class Recorder {
  events: Array<[number, TypeEvent]>;
  slides: Array<[number, TypeSlide]>;
  states: {
    reference: Array<Object>,
    map: UniqueMap,
    states: Array<[number, TypeState]>,
  };

  eventsCache: Array<[number, TypeEvent]>;
  slidesCache: Array<[number, TypeSlide]>;
  statesCache: Array<[number, TypeState]>;

  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  currentTime: number;
  precision: number;

  touchDown: (Point) => void;
  touchUp: void => void;
  // touchMoveDown: (Point, Point) => boolean;
  cursorMove: (Point) => void;
  getDiagramState: () => Object;
  setDiagramState: (Object) => void;
  pauseDiagram: () => void;
  unpauseDiagram: () => void;

  eventIndex: number;
  stateIndex: number;
  slideIndex: number;

  animation: GlobalAnimation;
  previousPoint: ?Point;
  animateDiagramNextFrame: () => void;
  getDiagramElement: (string) => ?DiagramElement;
  diagramIsInTransition: () => boolean;
  diagramShowCursor: ('up' | 'down' | 'hide') => void;

  nextEventTimeout: TimeoutID;
  nextStateTimeout: TimeoutID;
  nextSlideTimeout: TimeoutID;

  stateTimeout: TimeoutID;
  stateTimeStep: number;

  lastShownEventIndex: number;
  lastShownStateIndex: number;
  lastShownSlideIndex: number;
  isAudioPlaying: boolean;

  nextSlide: ?() => void;
  prevSlide: ?() => void;
  goToSlide: ?(number) => void;
  getCurrentSlide: ?() => number;

  playbackStopped: ?() =>void;

  lastTime: number;

  audio: ?HTMLAudioElement;

  static instance: Object;

  // All slides, events and states are relative to 0, where 0 is the start of a recording.
  // Slides, events and states do not have to have a 0 time, maybe the first event will not happen till 1s in
  //
  constructor(
    // diagramTouchDown?: (Point) => boolean,
    // diagramTouchUp?: void => void,
    // diagramCursorMove?: (Point) => void,
    // diagramTouchMoveDown?: (Point, Point) => boolean,
    // diagramCursorMove?: (Point) => void,
    // animateDiagramNextFrame?: () => void,
    // getDiagramElement?: (string) => DiagramElement,
    // getDiagramState?: () => Object,
    // setDiagramState?: (Object) => void,
    // pauseDiagram: () => void,
    // unpauseDiagram: () => void,
  ) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.events = [];
      this.slides = [];
      this.states = {
        states: [],
        map: new UniqueMap(),
        reference: [],
      };
      this.currentTime = 0;
      this.isRecording = false;
      this.precision = 5;
      this.stateTimeStep = 1000;
      this.lastShownEventIndex = -1;
      this.lastShownStateIndex = -1;
      this.lastShownSlideIndex = -1;
      this.animation = new GlobalAnimation();
      this.previousPoint = null;
      this.touchDown = () => {};
      this.touchUp = () => {};
      this.cursorMove = () => {};
      this.animateDiagramNextFrame = () => {};
      this.getDiagramElement = () => null;
      this.getDiagramState = () => {};
      this.setDiagramState = () => {};
      this.pauseDiagram = () => {};
      this.unpauseDiagram = () => {};
      this.nextSlide = null;
      this.prevSlide = null;
      this.goToSlide = null;
      this.audio = null;
      this.isAudioPlaying = false;
      this.playbackStopped = null;
      this.getCurrentSlide = null;
      this.startTime = 0;
      this.diagramIsInTransition = () => false;
      this.diagramShowCursor = () => {};
    }
    return Recorder.instance;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Time
  // ////////////////////////////////////
  // ////////////////////////////////////
  timeStamp() {   // eslint-disable-line class-methods-use-this
    // return (new Date()).getTime();
    return performance.now();
  }

  now() {   // eslint-disable-line class-methods-use-this
    return this.timeStamp() - this.startTime;
  }

  getCurrentTime() {
    if (this.isPlaying) {
      return this.now() / 1000;
    }
    return this.currentTime;
  }

  setStartTime(fromTime: number = 0) {
    this.startTime = this.timeStamp() - fromTime * 1000;
  }

  getTotalTime() {
    let time = 0;
    if (this.slides.length > 0) {
      const endTime = this.slides.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    if (this.events.length > 0) {
      const endTime = this.events.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    // if (this.states.length > 0) {
    //   const endTime = this.states.slice(-1)[0][0];
    //   time = Math.max(time, endTime);
    // }
    // eslint-disable-next-line no-restricted-globals
    if (this.audio != null && !isNaN(this.audio.duration)) {
      time = Math.max(time, this.audio.duration);
    }
    return time;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Recording
  // ////////////////////////////////////
  // ////////////////////////////////////
  reset() {
    this.resetStates();
    this.eventsCache = [];
    this.slidesCache = [];
    this.statesCache = [];
    this.events = [];
    this.slides = [];
    this.startTime = 0;
    this.isPlaying = false;
    this.isRecording = false;
  }

  resetStates() {
    this.states = {
      states: [],
      map: new UniqueMap(),
      reference: [],
    };
  }

  start(startTime: number = 0) {
    this.eventsCache = [];
    this.slidesCache = [];
    this.unpauseDiagram();
    this.statesCache = [];
    this.startTime = this.timeStamp();
    this.isPlaying = false;
    this.isRecording = true;
    if (startTime === 0) {
      this.recordSlide('goto', '', 0);
      this.recordEvent('start');
    }
    this.queueRecordState(0);
  }

  stop() {
    this.isRecording = false;
    clearTimeout(this.stateTimeout);
    this.events = this.eventsCache;
    this.states.state = this.statesCache;
    this.slides = this.slidesCache;
  }

  recordEvent(...args: Array<number | string>) {
    const out = [];
    args.forEach((arg) => {
      if (typeof arg === 'number' && this.precision > -1) {
        out.push(round(arg, this.precision));
        return;
      }
      out.push(arg);
    });
    // $FlowFixMe
    this.eventsCache.push([this.now() / 1000, [...out]]);
  }

  recordCurrentState() {
    this.recordState(this.getDiagramState());
  }

  // States are recorded every second
  queueRecordState(time: number = 0) {
    const recordAndQueue = () => {
      if (this.isRecording) {
        this.recordCurrentState();
        this.queueRecordState(this.stateTimeStep * 1000);
      }
    };
    if (time === 0) {
      recordAndQueue();
    } else {
      this.stateTimeout = setTimeout(() => {
        recordAndQueue();
      }, time);
    }
  }

  loadEvents(
    minifiedEvents: {
      map: UniqueMap | Object,
      minified: Object,
    } | Array<TypeEvents>,
    isMinified: boolean = false,
  ) {
    this.events = [];
    if (isMinified) { // $FlowFixMe
      this.events = unminify(minifiedEvents);
    } else {  // $FlowFixMe
      this.events = minifiedEvents;
    }
  }

  loadStates(
    states: {
      states: TypeStates,
      reference: Array<Object>,
      map?: UniqueMap,
    },
    unminifyFlag: boolean = false,
  ) {
    this.resetStates();
    if (unminifyFlag) {
      this.states = this.unminifyStates(states);
    } else {
      this.states.states = states.states;
      this.states.reference = states.reference;
    }
  }


  addReferenceState(state: Object, precision: ?number = 4) {
    if (this.states.reference.length === 0) {
      this.states.reference.push(duplicate(state));
      return;
    }
    const diff = getObjectDiff(this.states.reference[0], [], state, precision);
    this.states.reference.push(diff);
  }

  getReferenceState(index: number = 0) {
    if (this.states.reference.length === 0) {
      return {};
    }
    if (index === 0 || this.states.reference.length === 1) {
      return this.states.reference[0];
    }
    if (index === -1) {
      return refAndDiffToObject(
        this.states.reference[0],
        this.states.reference[this.states.reference.length - 1],
      );
    }
    return refAndDiffToObject(this.states.reference[0], this.states.reference[index]);
  }

  addState(state: Object, precision: ?number = 4) {
    const ref = this.getReferenceState(-1);
    const diff = getObjectDiff(ref, [], state, precision);
    this.states.states.push([
      this.now() / 1000,
      [
        this.states.reference.length - 1,
        diff,
      ],
    ]);
  }

  getState(index: number) {
    const state = this.states.states[index];
    const [time, stateTimeAndObject] = state;
    const [refIndex, diff] = stateTimeAndObject;
    // const [time, refIndex, diff] = state;
    // console.log('Index', refIndex)
    const ref = this.getReferenceState(refIndex);
    // console.log(diff)
    const stateObj = refAndDiffToObject(ref, diff);
    return [time, stateObj];
  }

  // minifyEvents(precision: ?number = 4) {
  //   const map = new UniqueMap();
  //   return {
  //     events: compressObject(this.events, map, true, true, precision),
  //     map,
  //   };
  // }

  minifyStates(
    asObject: boolean = false,
    precision: ?number = 4,
  ) {
    // const map = new UniqueMap();
    const ref = duplicate(this.states.reference[0]);
    const refsDiffPaths = this.states.reference.slice(1);
    const statesDiffPaths = this.states.states;

    let refDiff;
    let statesDiff;

    if (asObject) {
      refDiff = refsDiffPaths.map(d => diffPathsToObj(d));
      statesDiff = statesDiffPaths.map(d => [d[0], d[1][0], diffPathsToObj(d[1][1])]);
    } else {
      refDiff = refsDiffPaths.map(d => duplicate(d));
      statesDiff = statesDiffPaths.map(d => [d[0], d[1][0], duplicate(d[1][1])]);
    }

    const states = {
      reference: [ref, ...refDiff],
      states: statesDiff,
      isObject: asObject,
    };
    // return {
    //   states: compressObject(states, map, true, true, precision),
    //   map,
    // };
    return minify(states);
  }

  // eslint-disable-next-line class-methods-use-this
  unminifyStates(compressedStates: Object) {
    const states = unminify(compressedStates);
    if (typeof states !== 'object' || states.reference.length == null || states.states == null) {
      return {
        reference: [],
        states: [],
      };
    }
    const ref = states.reference[0];
    let refDiff = states.reference.slice(1);
    let statesDiff = states.states;
    if (states.isObject) {
      refDiff = refDiff.map(d => diffObjToPaths(d));
      statesDiff = statesDiff.map(d => [d[0], [d[1], diffObjToPaths(d[2])]]);
    } else {
      statesDiff = statesDiff.map(d => [d[0], [d[1], d[2]]]);
    }
    return {
      reference: [ref, ...refDiff],
      states: statesDiff,
    };
  }

  recordState(state: Object, precision: number = 4) {
    if (this.states.reference.length === 0) {
      this.addReferenceState(state);
    }
    this.addState(state, precision);
  }

  recordSlide(direction: 'goto' | 'next' | 'prev', message: string, slide: number) {
    this.slidesCache.push([this.now() / 1000, [direction, message, slide]]);
  }

  // recordClick(id: string) {
  //   this.eventsCache.push([this.now(), [id]]);
  // }

  save() {
    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    const minifiedStates = this.minifyStates(true, 4);
    download(`${dateStr} ${location}.vidslides.json`, JSON.stringify(this.slides));
    download(`${dateStr} ${location}.videvents.json`, JSON.stringify(minify(this.events)));
    download(`${dateStr} ${location}.vidstates.json`, JSON.stringify(minifiedStates));
  }

  show() {
    const wnd = window.open('about:blank', '', '_blank');
    this.slides.forEach((slide) => {
      wnd.document.write(JSON.stringify(slide), '<br>');
    });

    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');

    this.events.forEach((event) => {
      const rounded = event.map((e) => {
        if (typeof e === 'number') {
          return round(e, this.precision);
        }
        return e;
      });
      wnd.document.write(JSON.stringify(rounded), '<br>');
    });
    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');
    this.states.states.forEach((state) => {
      wnd.document.write(JSON.stringify(state), '<br>');
    });
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Seeking
  // ////////////////////////////////////
  // ////////////////////////////////////
  seek(percentTime: number) {
    if (this.states.states.length === 0) {
      return;
    }
    this.pausePlayback();
    // this.unpauseDiagram();
    const totalTime = this.getTotalTime();
    const timeTarget = percentTime * totalTime;
    this.setToTime(timeTarget);
    this.pauseDiagram();
  }

  setToTime(time: number) {
    this.slideIndex = getPrevIndexForTime(this.slides, time);
    this.stateIndex = getPrevIndexForTime(this.states.states, time);
    this.eventIndex = getPrevIndexForTime(this.events, time);

    let slideTime = null;
    if (this.slideIndex > -1) {
      [slideTime] = this.slides[this.slideIndex];
    }
    let stateTime = null;
    if (this.stateIndex > -1) {
      [stateTime] = this.states.states[this.stateIndex];
    }

    const cursorState = getCursorState(this.events, this.eventIndex);
    if (this.states.states[this.stateIndex][0] < this.slides[this.slideIndex][0]) {
      this.setState(this.stateIndex);
    }
    this.setSlide(this.slideIndex, true);
    if (this.states.states[this.stateIndex][0] >= this.slides[this.slideIndex][0]) {
      this.setState(this.stateIndex);
    }
    this.animateDiagramNextFrame();
    // console.log(time)
    if (this.audio) {
      this.audio.currentTime = time;
    }
    this.currentTime = time;
    if (cursorState.show && cursorState.up) {
      this.diagramShowCursor('up');
      this.cursorMove(cursorState.position);
    } else if (cursorState.show && cursorState.up === false) {
      this.diagramShowCursor('down');
      this.cursorMove(cursorState.position);
    } else {
      this.diagramShowCursor('hide');
    }
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Playback
  // ////////////////////////////////////
  // ////////////////////////////////////
  startPlayback(fromTimeIn: number = this.getCurrentTime()) {
    let fromTime = fromTimeIn;
    if (fromTimeIn === this.getTotalTime()) {
      fromTime = 0;
    }
    this.lastShownEventIndex = -1;
    this.lastShownStateIndex = -1;
    this.lastShownSlideIndex = -1;
    this.isRecording = false;
    this.isPlaying = true;
    this.previousPoint = null;
    this.setStartTime(fromTime);
    this.touchUp();
    this.currentTime = fromTime;
    this.unpauseDiagram();

    this.slideIndex = Math.max(getPrevIndexForTime(this.slides, fromTime), 0);
    this.stateIndex = Math.max(getPrevIndexForTime(this.states.states, fromTime), 0);
    this.eventIndex = Math.max(getPrevIndexForTime(this.events, fromTime), 0);
    this.playbackSlide();
    this.setState(this.stateIndex);
    this.queuePlaybackEvent(getTimeToIndex(this.events, this.eventIndex, fromTime));
    if (this.audio) {
      this.isAudioPlaying = true;
      this.audio.currentTime = fromTime;
      this.audio.play();
      const audioEnded = () => {
        this.isAudioPlaying = false;
        this.checkStopPlayback();
      };
      const { audio } = this;
      if (audio != null) {
        audio.removeEventListener('ended', audioEnded.bind(this), false);
        audio.addEventListener('ended', audioEnded.bind(this), false);
      }
    }

    this.animateDiagramNextFrame();
  }

  setPointerPosition(pos: Point) {
    const pointer = this.getDiagramElement('pointer');
    if (pointer == null) {
      return;
    }
    pointer.setPosition(pos);
  }

  showPointer() {
    if (this.isRecording) {
      return;
    }
    if (this.slides.length === 0 || this.states.states.length === 0 || this.events.length === 0) {
      return;
    }
    if (
      this.slideIndex > this.slides.length - 1
      || this.eventIndex > this.events.length - 1
    ) {
      return;
    }
    const p = this.getMostRecentPointerPosition();
    const pointer = this.getDiagramElement('pointer');
    if (pointer == null) {
      return;
    }

    this.setPointerPosition(p);
    const isPointerUp = this.getIsPointerUp();

    if (pointer != null && pointer._up != null && isPointerUp) {
      pointer._up.showAll();
    }
    if (pointer != null && pointer._down != null && !isPointerUp) {
      pointer._down.showAll();
    }
  }

  getMostRecentPointerPosition(): ?Point {
    if (this.isRecording) {
      return null;
    }
    let i = this.eventIndex;
    while (i >= 0 && i < this.events.length) {
      const eventAction = this.events[i][1];
      if (
        eventAction === 'touchDown'
        || eventAction === 'touchUp'
        || eventAction === 'cursorMove'
      ) {
        const [, , x, y] = this.events[i];
        if (x != null && y != null) {
          return new Point(x, y);
        }
        return null;
      }
      if (i <= this.eventIndex) {
        i -= 1;
      } else {
        i += 1;
      }
      if (i === -1) {
        i = this.eventIndex + 1;
      }
    }
    return null;
  }

  getIsPointerUp() {
    if (this.isRecording) {
      return false;
    }
    const slideTime = this.slides[this.slideIndex][0];
    let i = this.eventIndex;
    let eventTime;
    while (i > 0) {
      const eventAction = this.events[i][1];
      ([eventTime] = this.events[i]);
      if (eventTime < slideTime) {
        return true;
      }
      if (eventAction === 'touchDown') {
        return false;
      }
      if (eventAction === 'touchUp') {
        return true;
      }
      i -= 1;
    }
    return true;
  }

  checkStopPlayback() {
    if (this.isAudioPlaying) {
      return;
    }
    if (this.eventIndex < this.events.length) {
      return;
    }
    if (this.slideIndex < this.slides.length) {
      return;
    }
    this.pausePlayback();
  }

  pausePlayback() {
    this.pauseDiagram();
    this.currentTime = this.getCurrentTime();
    this.isPlaying = false;
    clearTimeout(this.nextEventTimeout);
    clearTimeout(this.stateTimeout);
    const pointer = this.getDiagramElement('pointer');
    if (pointer != null) {
      pointer.hide();
    }
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }
    if (this.playbackStopped != null) {
      this.playbackStopped();
    }
    // this.pauseDiagram();
  }

  playFrame() {
    const time = this.getCurrentTime();

    const prevStateIndex = Math.max(getPrevIndexForTime(this.states.states, time), 0);
    if (prevStateIndex > this.lastShownStateIndex) {
      const lastIndexWithSameTime = getIndexOfLatestTime(this.states.states, prevStateIndex);
      this.setState(lastIndexWithSameTime);
      this.lastShownStateIndex = lastIndexWithSameTime;
    }
    const prevEventIndex = Math.max(getPrevIndexForTime(this.events, time), 0);
    if (prevEventIndex > this.lastShownEventIndex) {
      const lastIndexWithSameTime = getIndexOfLatestTime(this.events, prevEventIndex);
      const indexRange = getLastUniqueIndeces(
        this.events,
        this.lastShownEventIndex,
        lastIndexWithSameTime,
      ).sort();
      for (let i = 0; i < indexRange.length; i += 1) {
        this.setEvent(indexRange[i]);
      }
      this.lastShownEventIndex = indexRange[indexRange.length - 1];
    }
    if (
      (
        this.lastShownEventIndex >= this.events.length - 1
        || this.lastShownEventIndex === -1
      )
      && (
        this.lastShownStateIndex >= this.states.states.length - 1
        || this.lastShownStateIndex === -1
      )
    ) {
      this.pausePlayback();
    } else {
      this.animation.queueNextFrame(this.playFrame.bind(this));
    }
    this.animateDiagramNextFrame();
    // console.log(this.getCurrentTime() - time);
    // const prevSlideIndex = getPrevIndexForTime(this.slides, time);
  }

  queuePlaybackEvent(delay: number = 0) {
    this.nextEventTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.eventIndex += 1;
        this.playbackEvent();
      }
    }, delay);
  }

  playbackEvent() {
    if (this.eventIndex > this.events.length - 1) {
      this.checkStopPlayback();
      return;
    }
    // const event = this.events[this.eventIndex];
    this.setEvent(this.eventIndex);
    // this.lastTime = this.getCurrentTime();
    this.animateDiagramNextFrame();
    // this.eventIndex += 1;
    if (this.eventIndex + 1 === this.events.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.events[this.eventIndex + 1][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackEvent(Math.max(nextTime, 0));
  }

  setEvent(index: number = this.eventIndex) {
    if (index > this.events.length - 1) {
      return;
    }
    const event = this.events[index][1];
    const [eventType] = event;
    switch (eventType) {
      case 'touchDown': {
        const [, x, y] = event;
        this.touchDown(new Point(x, y));
        break;
      }
      case 'touchUp':
        this.touchUp();
        break;
      case 'cursorMove': {
        const [, x: number, y: number] = event;
        this.cursorMove(new Point(x, y));
        break;
      }
      case 'startBeingMoved': {
        const [, elementPath] = event;
        const element = this.getDiagramElement(elementPath);
        if (element != null) {
          element.startBeingMoved();
        }
        break;
      }
      case 'moved': {
        const [, elementPath, transformDefinition] = event;
        const element = this.getDiagramElement(elementPath);
        if (element != null) {
          const transform = getTransform(transformDefinition);
          element.moved(transform);
        }
        break;
      }
      case 'click': {
        const [, id] = event;
        const element = document.getElementById(id);
        if (element != null) {
          element.click();
        }
        break;
      }
      case 'showCursor': {
        const [, x: number, y: number] = event;
        this.diagramShowCursor('up');
        this.cursorMove(new Point(x, y));
        break;
      }
      case 'hideCursor': {
        this.diagramShowCursor('hide');
        break;
      }

      // case 'cursorMoved': {
      //   const [, x, y] = event;
      //   this.
      // }
      case 'stopBeingMoved': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getDiagramElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.transform = transform;
        element.state.movement.velocity = velocity;
        element.stopBeingMoved();
        break;
      }
      case 'startMovingFreely': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getDiagramElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.simulateStartMovingFreely(transform, velocity);
        break;
      }
      default:
        break;
    }
  }

  queuePlaybackState(time: number = 0) {
    this.nextStateTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.stateIndex += 1;
        this.playbackState();
      }
    }, time);
  }

  playbackState() {
    if (this.stateIndex > this.states.states.length - 1) {
      this.checkStopPlayback();
      return;
    }
    this.setState(this.stateIndex);
    this.animateDiagramNextFrame();
    if (this.stateIndex + 1 === this.states.states.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.states.states[this.stateIndex + 1][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackState(nextTime);
  }

  setState(index: number) {
    if (index > this.states.states.length - 1) {
      return;
    }
    const state = this.getState(index);

    this.setDiagramState(state[1]);
  }

  queuePlaybackSlide(delay: number = 0) {
    this.nextSlideTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.slideIndex += 1;
        this.playbackSlide();
      }
    }, delay);
  }

  playbackSlide(forceGoTo: boolean = false) {
    if (this.slideIndex > this.slides.length - 1) {
      this.checkStopPlayback();
      return;
    }
    // const event = this.events[this.slideIndex];
    this.setSlide(this.slideIndex, forceGoTo);
    this.animateDiagramNextFrame();

    if (this.slideIndex + 1 === this.slides.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.slides[this.slideIndex + 1][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackSlide(Math.max(nextTime, 0));
  }

  setSlide(index: number, forceGoTo: boolean = false) {
    if (index > this.slides.length - 1) {
      return;
    }
    const slide = this.slides[index][1];
    const [direction, message, slideNumber] = slide;
    const currentSlide = this.getCurrentSlide();
    if (direction === 'next' && forceGoTo === false && currentSlide === slideNumber - 1) {
      if (this.nextSlide != null) {
        this.nextSlide(message);
      }
    } else if (direction === 'prev' && forceGoTo === false && currentSlide === slideNumber + 1) {
      if (this.prevSlide != null) {
        this.prevSlide(message);
      }
    } else if (this.goToSlide != null) {
      this.goToSlide(slideNumber);
    }
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export {
  Recorder,
  getIndexOfEarliestTime,
  download,
  getIndexOfLatestTime,
  getLastUniqueIndeces,
  getNextIndexForTime,
  getPrevIndexForTime,
  getCursorState,
};
