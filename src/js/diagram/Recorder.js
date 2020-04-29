// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform, Transform } from '../tools/g2';
import { round } from '../tools/math';
import {
  getObjectDiff, pathsToObj, UniqueMap, compressObject,
  uncompressObject, duplicate, refAndDiffToObject,
  objectToPaths, diffPathsToObj, diffObjToPaths,
} from '../tools/tools';
import type { DiagramElement } from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

function download(filename, text) {
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
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  index: number,
) {
  if (index < 1) {
    return index;
  }
  let i = index;
  let same = true;
  const time = events[index][0];
  while (i > 0 && same) {
    const prevTime = events[i - 1][0];
    if (prevTime !== time) {
      same = false;
    } else {
      i -= 1;
    }
  }
  return i;
}

function getIndexOfLatestTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  index: number,
) {
  const time = events[index][0];
  let i = index;
  let loop = true;
  while (loop) {
    if (i === events.length - 1) {
      loop = false;
    } else if (events[i + 1][0] === time) {
      i += 1;
    } else {
      loop = false;
    }
  }
  return Math.max(i, index);
}

function getLastUniqueIndeces(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
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
    const event = events[i];
    const [, type] = event;
    types[type] = i;
  }
  return Object.values(types);
}

function getIndexRangeForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  if (events.length === 0) {
    return [-1, -1];
  }
  const startTime = parseFloat(events[startSearch][0]);
  if (time === startTime) {
    return [startSearch, startSearch];
  }
  if (time < startTime) {
    return [-1, startSearch];
  }

  const endTime = parseFloat(events[endSearch][0]);
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
  const midTime = parseFloat(events[midSearch][0]);
  if (time === midTime) {
    return [midSearch, midSearch];
  }
  if (time < midTime) {
    return getIndexRangeForTime(events, time, startSearch, midSearch);
  }
  return getIndexRangeForTime(events, time, midSearch, endSearch)
}

function getNextIndexForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  // // console.log(startSearch, endSearch)
  // if (events.length === 0) {
  //   return -1;
  // }
  // if (time === 0) {
  //   return 0;
  // }
  // const startTime = parseFloat(events[startSearch][0]);
  // if (time <= startTime) {
  //   return startSearch;
  // }

  // const endTime = parseFloat(events[endSearch][0]);
  // if (time > endTime) {
  //   return -1;
  // }

  // if (startSearch === endSearch) {
  //   return startSearch;
  // }

  // const searchRange = endSearch - startSearch;
  // let midSearch = startSearch;
  // if (searchRange > 1) {
  //   midSearch = Math.floor(startSearch + searchRange / 2);
  // } else if (searchRange === 1) {
  //   midSearch = endSearch;
  // }

  // // console.log(startSearch, endSearch, midSearch)
  // if (midSearch === 0) {
  //   return 0;
  // }

  // const prevTime = events[midSearch - 1][0];
  // const midTime = events[midSearch][0];
  // if (time === midTime) {
  //   return midSearch;
  // }
  // if (time <= midTime && time > prevTime) {
  //   return midSearch;
  // }
  // if (time < midTime) {
  //   return getNextIndexForTime(events, time, startSearch, midSearch);
  // }
  // return getNextIndexForTime(events, midSearch, endSearch);
  const nextIndex = getIndexRangeForTime(events, time, startSearch, endSearch)[1];
  return getIndexOfEarliestTime(events, nextIndex);
}

function getPrevIndexForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  // if (events.length === 0) {
  //   return -1;
  // }
  // if (events.length < startSearch || events.length < endSearch) {
  //   return -1;
  // }
  // console.log(time, events)
  // const index = getNextIndexForTime(events, time, startSearch, endSearch);
  // if (index === 0 || index === -1) {
  //   return index;
  // }
  // return index - 1;
  const prevIndex = getIndexRangeForTime(events, time, startSearch, endSearch)[0];
  return getIndexOfEarliestTime(events, prevIndex);
}

function getTimeToIndex(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  eventIndex: number,
  time: number,
) {
  if (eventIndex === -1 || eventIndex > events.length - 1) {
    return -1;
  }
  const nextTime = events[eventIndex][0];
  return nextTime - time;
}

class Recorder {
  // Method for requesting the next animation frame
  events: Array<Array<number | string | null>>;
  // states: Array<[number, Object]>;
  slides: Array<[number, 'goto' | 'next' | 'prev', string, number]>;

  states: {
    ref: Array<Object>,
    map: UniqueMap,
    states: Array<[number, Object]>,
  };

  // statesNew1: {
  //   reference: Object,
  //   states: Array<[number, Object]>,
  //   map: UniqueMap;
  // };

  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  currentTime: number;
  precision: number;
  touchDown: (Point) => boolean;
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
  getElement: (string) => DiagramElement;

  nextEventTimeout: TimeoutID;
  nextStateTimeout: TimeoutID;
  nextSlideTimeout: TimeoutID;

  stateTimeout: TimeoutID;
  stateTimeStep: number;
  // currentTime: number;

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

  // requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  // animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  // drawQueue: Array<(number) => void>;
  // nextDrawQueue: Array<(number) => void>;

  constructor(
    diagramTouchDown?: (Point) => boolean,
    diagramTouchUp?: void => void,
    // diagramCursorMove?: (Point) => void,
    // diagramTouchMoveDown?: (Point, Point) => boolean,
    diagramCursorMove?: (Point) => void,
    animateDiagramNextFrame?: () => void,
    getElement?: (string) => DiagramElement,
    getDiagramState?: () => Object,
    setDiagramState?: (Object) => void,
    pauseDiagram: () => void,
    unpauseDiagram: () => void,
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
        reference: null,
      };
      // this.statesNew = {
      //   states: [],
      //   map: new UniqueMap(),
      // };
      // this.statesNew1 = {
      //   states: [],
      //   map: new UniqueMap(),
      // }
      this.currentTime = 0;
      this.isRecording = false;
      this.precision = 5;
      this.stateTimeStep = 1000;
      this.lastShownEventIndex = -1;
      this.lastShownStateIndex = -1;
      this.lastShownSlideIndex = -1;
      if (diagramTouchDown) {
        this.touchDown = diagramTouchDown;
      }
      if (diagramTouchUp) {
        this.touchUp = diagramTouchUp;
      }
      if (diagramCursorMove) {
        this.cursorMove = diagramCursorMove;
      }
      this.animation = new GlobalAnimation();
      this.previousPoint = null;
      if (animateDiagramNextFrame) {
        this.animateDiagramNextFrame = animateDiagramNextFrame;
      }
      if (getElement) {
        this.getElement = getElement;
      }
      if (getDiagramState) {
        this.getDiagramState = getDiagramState;
      }
      if (setDiagramState) {
        this.setDiagramState = setDiagramState;
      }
      if (pauseDiagram) {
        this.pauseDiagram = pauseDiagram;
      }
      if (unpauseDiagram) {
        this.unpauseDiagram = unpauseDiagram;
      }
      this.nextSlide = null;
      this.prevSlide = null;
      this.goToSlide = null;
      this.audio = null;
      this.isAudioPlaying = false;
      this.playbackStopped = null;
      this.getCurrentSlide = null;
      this.startTime = 0;
    }
    return Recorder.instance;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Time
  // ////////////////////////////////////
  // ////////////////////////////////////
  timeStamp() {   // eslint-disable-line class-methods-use-this
    return (new Date()).getTime();
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
    if (this.audio != null) {
      time = Math.max(time, this.audio.duration);
    }
    return time;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Recording
  // ////////////////////////////////////
  // ////////////////////////////////////
  resetStates() {
    this.states.states = [];
    this.states.map.reset();
    this.states.reference = null;
  }

  start(slideStart: number = 0) {
    this.events = [];
    this.slides = [];
    // this.states.states = [];
    // this.states.map.reset();
    // this.states.reference = null;
    this.resetStates();
    this.startTime = this.timeStamp();
    this.isPlaying = false;
    this.isRecording = true;
    // this.unpauseDiagram();
    this.recordSlide('goto', '', slideStart);
    this.queueRecordState(0);
    this.recordEvent('start');
  }

  stop() {
    this.isRecording = false;
    clearTimeout(this.stateTimeout);
  }

  recordEvent(...args: Array<number | string>) {
    const out = [];
    args.forEach((arg) => {
      if (typeof arg === 'number' && this.precision > -1) {
        out.push(round(arg, this.precision));
        return;
      }
      out.push(arg);
    })
    this.events.push([this.now() / 1000, ...out]);
  }

  // States are recorded every second
  queueRecordState(time: number = 0) {
    this.stateTimeout = setTimeout(() => {
      if (this.isRecording) {
        this.recordState(this.getDiagramState());
        this.queueRecordState(this.stateTimeStep * 1000);
      }
    }, time);
  }

  loadStates(
    states: {
      states: Array<Array<number, number, Object>>,
      reference: Array<Object>,
      map?: UniqueMap,
    },
    unminify: boolean = false,
  ) {
    this.resetStates();
    if (unminify) {
      this.states = this.unminifyStates(states);
    } else {
      this.states.states = states.states;
      this.states.reference = states.reference;
    }
    // this.states.map.map = states.map.map;
    // this.states.map.index = states.map.index;
    // this.states.map.letters = states.map.letters;
    // this.states.map.makeInverseMap();
    // this.states.reference = uncompressObject(states.reference, this.states.map, true, true);
    // this.states.states = states.states.map(s => [
    //   s[0],
    //   uncompressObject(s[1], this.states.map, true, true),
    // ]);
  }

  // recordState(state: Object, precision: number = 4) {

  //   const compressed = compressObject(state, this.states.map, true, true, precision);
  //   // const compressed = duplicate(state);
  //   // const compressNew1 = compressObject(duplicate(state), this.statesNew1.map);
  //   if (this.states.reference == null) {
  //     this.states.reference = duplicate(compressed);
  //   }
  //   // if (this.statesNew1.reference == null) {
  //   //   // this.statesNew1.reference = state;
  //   //   this.statesNew1.reference = compressNew1;
  //   // }
  //   // this.states.push([this.now() / 1000, state]);

  //   // StatesNew
  //   // const diffNew1 = getObjectDiff(this.statesNew1.reference, [], compressNew1);
  //   // this.statesNew1.states.push([this.now() / 1000, diffNew1]);
  //   const diff = getObjectDiff(this.states.reference, [], compressed);
  //   // console.log(this.states.reference, state, compressed, diff);
  //   const diffKey = this.states.map.add('diff');
  //   const removedKey = this.states.map.add('removed');
  //   const addedKey = this.states.map.add('added');
  //   const stateToSave = {};
  //   stateToSave[diffKey] = pathsToObj(diff.diff);
  //   stateToSave[removedKey] = pathsToObj(diff.removed);
  //   stateToSave[addedKey] = pathsToObj(diff.added);
  //   // console.log(diff, stateToSave)
  //   this.states.states.push([
  //     this.now() / 1000,
  //     // {
  //     //   diff: pathsToObj(diff.diff),
  //     //   removed: pathsToObj(diff.removed),
  //     //   added: pathsToObj(diff.added),
  //     // },
  //     stateToSave,
  //   ]);
  //   // console.log(this.states.states.slice(-1)[0][1])
  //   // this.states.map.makeInverseMap();
  //   // console.log(uncompressObject(this.states.states.slice(-1)[0][1], this.states.map));
  //   // console.log(getObjectDiff(this.statesNew.reference, state));
  //   // console.log(toObj(getObjectDiff(this.statesNew.reference, state)));
  // }

  addReferenceState(state: Object, precision: ?number = 4) {
    if (this.states.reference == null) {
      this.states.reference = [];
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
      this.states.reference.length - 1,
      diff,
    ]);
  }

  getState(index: number) {
    const state = this.states.states[index];
    const [time, refIndex, diff] = state;
    // console.log('Index', refIndex)
    const ref = this.getReferenceState(refIndex);
    // console.log(diff)
    const stateObj = refAndDiffToObject(ref, diff);
    return [time, stateObj];
  }

  minifyStates(
    asObject: boolean = false,
    precision: ?number = 4,
  ): {
    [reference: string]: Object,
    [isObject: string]: boolean,
    [states: string]: {
      [diff: string]: Object,
      [added: string]: Object,
      [removed: string]: Object,
    }
  } {
    const map = new UniqueMap();
    const ref = duplicate(this.states.reference[0]);
    const refsDiffPaths = this.states.reference.slice(1);
    const statesDiffPaths = this.states.states;

    let refDiff;
    let statesDiff;

    if (asObject) {
      refDiff = refsDiffPaths.map(d => diffPathsToObj(d));
      statesDiff = statesDiffPaths.map(d => [d[0], d[1], diffPathsToObj(d[2])]);
    } else {
      refDiff = refsDiffPaths.map(d => duplicate(d));
      statesDiff = statesDiffPaths.map(d => duplicate(d));
    }

    const states = {
      reference: [ref, ...refDiff],
      states: statesDiff,
      isObject: asObject,
    };
    return {
      states: compressObject(states, map, true, true, precision),
      map,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  unminifyStates(compressedStates: Object) {
    const cStates = compressedStates.states;
    let { map } = compressedStates;
    if (!(map instanceof UniqueMap)) {
      const uMap = new UniqueMap();
      uMap.map = map.map;
      uMap.index = map.index;
      uMap.letters = map.letters;
      map = uMap;
    }
    map.makeInverseMap();
    const states = uncompressObject(cStates, map, true, true);
    const ref = states.reference[0];
    let refDiff = states.reference.slice(1);
    let statesDiff = states.states;
    if (states.isObject) {
      refDiff = refDiff.map(d => diffObjToPaths(d));
      statesDiff = statesDiff.map(d => [d[0], d[1], diffObjToPaths(d[2])]);
    }
    return {
      reference: [ref, ...refDiff],
      states: statesDiff,
    };
  }

  recordState(state: Object, precision: number = 4) {
    if (this.states.reference == null) {
      this.addReferenceState(state);
    }
    this.addState(state, precision);
    // const referenceState = 
    // const diff = getObjectDiff(this.states.reference, [], compressed);
    // // console.log(this.states.reference, state, compressed, diff);
    // const diffKey = this.states.map.add('diff');
    // const removedKey = this.states.map.add('removed');
    // const addedKey = this.states.map.add('added');
    // const stateToSave = {};
    // stateToSave[diffKey] = pathsToObj(diff.diff);
    // stateToSave[removedKey] = pathsToObj(diff.removed);
    // stateToSave[addedKey] = pathsToObj(diff.added);
    // // console.log(diff, stateToSave)
    // this.states.states.push([
    //   this.now() / 1000,
    //   // {
    //   //   diff: pathsToObj(diff.diff),
    //   //   removed: pathsToObj(diff.removed),
    //   //   added: pathsToObj(diff.added),
    //   // },
    //   stateToSave,
    // ]);
    // console.log(this.states.states.slice(-1)[0][1])
    // this.states.map.makeInverseMap();
    // console.log(uncompressObject(this.states.states.slice(-1)[0][1], this.states.map));
    // console.log(getObjectDiff(this.statesNew.reference, state));
    // console.log(toObj(getObjectDiff(this.statesNew.reference, state)));
  }

  recordSlide(direction: 'goto' | 'next' | 'prev', message: string, slide: number) {
    this.slides.push([this.now() / 1000, direction, message, slide]);
  }

  recordClick(id: string) {
    this.events.push([this.now(), id]);
  }

  save() {
    // const slidesOut = [];
    // this.slides.forEach((slide) => {
    //   slidesOut.push(JSON.stringify(slide));
    // });

    // const eventsOut = [];
    // this.events.forEach((event) => {
    //   eventsOut.push(JSON.stringify(event));
    // });

    // const statesOut = [];
    // this.states.forEach((state) => {
    //   statesOut.push(JSON.stringify(state));
    // });

    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    // download(`${dateStr} ${location} slides.txt`, slidesOut.join('\n'));
    // download(`${dateStr} ${location} events.txt`, eventsOut.join('\n'));
    // download(`${dateStr} ${location} states.txt`, statesOut.join('\n'));
    const minifiedStates = this.minifyStates(true, 4);
    // const minifiedEvents = this.minifyEvents(true, 4);
    download(`${dateStr} ${location} slides.json`, JSON.stringify(this.slides));
    download(`${dateStr} ${location} events.json`, JSON.stringify(this.events));
    download(`${dateStr} ${location} states.json`, JSON.stringify(minifiedStates));
    // download(`${dateStr} ${location} statesNew.json`, JSON.stringify(this.statesNew));
    // download(`${dateStr} ${location} statesNew1.json`, JSON.stringify(this.statesNew1));
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
    this.states.forEach((state) => {
      wnd.document.write(JSON.stringify(state), '<br>');
    });
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Scrubbing
  // ////////////////////////////////////
  // ////////////////////////////////////
  seek(percentTime: number) {
    this.pausePlayback();
    // this.unpauseDiagram();
    const totalTime = this.getTotalTime();
    const timeTarget = percentTime * totalTime;
    this.setToTime(timeTarget);
    this.pauseDiagram();
  }

  setToTime(time: number) {
    this.slideIndex = Math.max(getPrevIndexForTime(this.slides, time), 0);
    this.stateIndex = Math.max(getPrevIndexForTime(this.states.states, time), 0);
    this.eventIndex = Math.max(getPrevIndexForTime(this.events, time), 0);
    if (this.states.states[this.stateIndex][0] < this.slides[this.slideIndex][0]) {
      this.setState(this.stateIndex);
    }
    this.setSlide(this.slideIndex, true);
    if (this.states.states[this.stateIndex][0] >= this.slides[this.slideIndex][0]) {
      this.setState(this.stateIndex);
    }
    this.animateDiagramNextFrame();
    if (this.audio) {
      this.audio.currentTime = time;
    }
    this.currentTime = time;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Playback
  // ////////////////////////////////////
  // ////////////////////////////////////
  startPlayback(fromTimeIn: number = this.getCurrentTime(), showPointer: boolean = true) {
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
    // if (this.audio) {
    //   this.audio.currentTime = fromTime;
    // }
    // this.animation.queueNextFrame(this.playFrame.bind(this));
    // this.slideIndex = Math.max(getPrevIndexForTime(this.slides, fromTime), 0);
    // this.stateIndex = Math.max(getPrevIndexForTime(this.states, fromTime), 0);
    // this.eventIndex = Math.max(getPrevIndexForTime(this.events, fromTime), 0);
    this.slideIndex = Math.max(getPrevIndexForTime(this.slides, fromTime), 0);
    this.stateIndex = Math.max(getPrevIndexForTime(this.states.states, fromTime), 0);
    this.eventIndex = Math.max(getPrevIndexForTime(this.events, fromTime), 0);
    this.setSlide(this.slideIndex, true);
    this.queuePlaybackSlide(getTimeToIndex(this.slides, this.slideIndex + 1, fromTime));
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
      this.audio.removeEventListener('ended', audioEnded.bind(this), false);
      this.audio.addEventListener('ended', audioEnded.bind(this), false);
    }
    const pointer = this.getElement('pointer.up');
    if (pointer != null && showPointer) {
      pointer.showAll();
    }
    this.animateDiagramNextFrame();
    // this.unpauseDiagram();
  }

  checkStopPlayback() {
    // console.log(this.isAudioPlaying, this.eventIndex < this.events.length, this.slideIndex < this.slides.length, this.stateIndex < this.states.length)
    if (this.isAudioPlaying) {
      return;
    }
    if (this.eventIndex < this.events.length) {
      return;
    }
    if (this.slideIndex < this.slides.length) {
      return;
    }
    // if (this.stateIndex < this.states.length) {
    //   return;
    // }
    this.pausePlayback();
  }

  pausePlayback() {
    this.pauseDiagram();
    this.currentTime = this.getCurrentTime();
    this.isPlaying = false;
    clearTimeout(this.nextEventTimeout);
    clearTimeout(this.stateTimeout);
    const pointer = this.getElement('pointer');
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
      let indexRange = getLastUniqueIndeces(
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
        this.playbackEvent();
      }
    }, delay);
  }

  playbackEvent() {
    if (this.eventIndex > this.events.length - 1) {
      return;
    }
    // const event = this.events[this.eventIndex];
    this.setEvent(this.eventIndex);
    // this.lastTime = this.getCurrentTime();
    this.animateDiagramNextFrame();
    this.eventIndex += 1;
    if (this.eventIndex === this.events.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.events[this.eventIndex][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackEvent(Math.max(nextTime, 0));
  }

  setEvent(index: number = this.eventIndex) {
    if (index > this.events.length - 1) {
      return;
    }
    const event = this.events[index];
    const [, eventType] = event;
    switch (eventType) {
      case 'touchDown': {
        const [, , x, y] = event;
        this.touchDown(new Point(x, y));
        break;
      }
      case 'touchUp':
        this.touchUp();
        break;
      case 'cursorMove': {
        const [, , x: number, y: number] = event;
        this.cursorMove(new Point(x, y));
        break;
      }
      case 'startBeingMoved': {
        const [, , elementPath] = event;
        const element = this.getElement(elementPath);
        if (element != null) {
          element.startBeingMoved();
        }
        break;
      }
      case 'moved': {
        const [, , elementPath, transformDefinition] = event;
        const element = this.getElement(elementPath);
        if (element != null) {
          const transform = getTransform(transformDefinition);
          element.moved(transform);
        }
        break;
      }
      case 'click': {
        const [, , id] = event;
        const element = document.getElementById(id);
        if (element != null) {
          element.click();
        }
        break;
      }
      // case 'cursorMoved': {
      //   const [, x, y] = event;
      //   this.
      // }
      case 'stopBeingMoved': {
        const [, , elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.transform = transform;
        element.state.movement.velocity = velocity;
        element.stopBeingMoved();
        break;
      }
      case 'startMovingFreely': {
        const [, , elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getElement(elementPath);
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
        this.playbackState();
      }
    }, time);
  }

  playbackState() {
    if (this.stateIndex > this.states.states.length - 1) {
      return;
    }
    this.setState(this.stateIndex);
    this.animateDiagramNextFrame();
    this.stateIndex += 1;
    if (this.stateIndex === this.states.states.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.states.states[this.stateIndex][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackState(nextTime);
  }

  setState(index: number) {
    if (index > this.states.states.length - 1) {
      return;
    }
    const state = this.getState(index);
    // console.log(state[1].elements.elements.line.animations.element)
    // delete state[1].elements.elements.line.animations.element
    // delete state[1].elements.elements.line.elements.line.animations.element

    // console.log(this.states.states[index])
    // console.log(state)
    // console.log(state[1].elements.elements.line.transform.state[3])
    // const diff = this.states.states[index][1];
    // const removed = objectToPaths(diff.removed);
    // const added = objectToPaths(diff.added);
    // const diffPaths = objectToPaths(diff.diff);
    // const state = refAndDiffToObject(
    //   this.states.reference,
    //   // this.states.states[index][1],
    //   {
    //     removed,
    //     added,
    //     diff: diffPaths,
    //   },
    // );
    // console.log(index, this.states.states[index], state)

    this.setDiagramState(state[1]);
  }

  queuePlaybackSlide(delay: number = 0) {
    this.nextSlideTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackSlide();
      }
    }, delay);
  }

  playbackSlide() {
    if (this.slideIndex > this.slides.length - 1) {
      return;
    }
    // const event = this.events[this.slideIndex];
    this.setSlide(this.slideIndex);
    this.animateDiagramNextFrame();
    this.slideIndex += 1;
    if (this.slideIndex === this.slides.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.slides[this.slideIndex][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackSlide(Math.max(nextTime, 0));
  }

  setSlide(index: number, forceGoTo: boolean = false) {
    if (index > this.slides.length - 1) {
      return;
    }
    const slide = this.slides[index];
    const [, direction, message, slideNumber] = slide;
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
};
