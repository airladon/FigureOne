// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform } from '../tools/g2';
import { round } from '../tools/math';
import {
  getObjectDiff, UniqueMap,
  duplicate, refAndDiffToObject,
  diffPathsToObj, diffObjToPaths, minify, unminify,
  ObjectTracker,
} from '../tools/tools';
import type { DiagramElement } from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

// type TypeEvent = ['touchUp']
//                  | ['touchDown', number, number]
//                  | ['start']
//                  | ['startBeingMoved', string]
//                  | ['moved', string, Object]
//                  | ['startMovingFreely', string, Object, Object]
//                  | ['stopBeingMoved', string, Object, Object]
//                  | ['cursorMove', number, number]
//                  | ['showCursor', number, number]
//                  | ['hideCursor']
//                  | ['click', string];

type TypeStateDiff = [number, string, Object];

// type TypeSlide = ['goto' | 'next' | 'prev', string, number];
type TypeEvent = [
  number,
  ?(Array<number | string | Object> | string | number | Object),
];
type TypeEvents = Array<TypeEvent>;
type TypeStateDiffs = Array<TypeStateDiff>;
// type TypeEvents = Array<[number, TypeEvent]>;
// type TypeSlides = Array<[number, TypeSlide]>;
// type TypeStates = Array<[number, TypeState]>;

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
  recordedData: TypeEvents | TypeStateDiffs,
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
  recordedData: TypeEvents | TypeStateDiffs,
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

// deprecated
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
  recordedData: TypeEvents | TypeStateDiffs,
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
  recordedData: TypeEvents | TypeStateDiffs,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
) {
  const nextIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[1];
  // console.log(nextIndex)
  return getIndexOfEarliestTime(recordedData, nextIndex);
}

function getPrevIndexForTime(
  recordedData: TypeEvents | TypeStateDiffs,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
) {
  const prevIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[0];
  return getIndexOfEarliestTime(recordedData, prevIndex);
}

function getTimeToIndex(
  recordedData: TypeEvents | TypeStateDiffs,
  eventIndex: number,
  time: number,
) {
  if (eventIndex === -1 || eventIndex > recordedData.length - 1) {
    return -1;
  }
  const nextTime = recordedData[eventIndex][0];
  return nextTime - time;
}


// revist
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
  states: ObjectTracker;
  events: {
    [eventName: string]: {
      setOnSeek: boolean,
      playbackAction: () => void,
      list: TypeEvents;
    };
  };

  statesCache: ObjectTracker;
  eventsCache: {
    [eventName: string]: {
      // setOnSeek: boolean,
      // playbackAction: () => void,
      list: TypeEvents;
    };
  };

  
  // events: {
  //   [eventName: string]: Array<[number, Array<number | string | Object>]>;
  // }
  // states: {
  //   referenceBase: Object;
  //   reference: {
  //     [referenceName: string]: [string, Object];  // diff objects to another reference
  //   };
  //   // map: UniqueMap,
  //   states: Array<[number, TypeState]>,
  // };

  // eventsCache: Array<[number, TypeEvent]>;
  // slidesCache: Array<[number, TypeSlide]>;
  // statesCache: ObjectTracker;

  state: 'recording' | 'playing' | 'idle';
  isAudioPlaying: boolean;
  videoToNowDelta: number;     // performance.now() - deltaToNow = video time
  currentTime: number;    // The current video time location
  duration: number;       // The duration of the video
  precision: number;      // The precision with which to record numbers

  stateIndex: number;
  eventIndex: {
    [eventName: string]: number;
  };
  // eventIndex: number;
  // stateIndex: number;
  // slideIndex: number;

  // lastShownEventIndex: number;
  // lastShownStateIndex: number;
  // lastShownSlideIndex: number;

  stateTimeStep: number;      // in seconds

  // touchDown: (Point) => void;
  // touchUp: void => void;
  // touchMoveDown: (Point, Point) => boolean;
  // cursorMove: (Point) => void;
  getDiagramState: () => Object;
  setDiagramState: (Object) => void;
  pauseDiagram: () => void;
  unpauseDiagram: () => void;

  // animation: GlobalAnimation;
  // previousPoint: ?Point;
  animateDiagramNextFrame: () => void;
  getDiagramElement: (string) => ?DiagramElement;
  // diagramIsInTransition: () => boolean;
  diagramShowCursor: ('up' | 'down' | 'hide') => void;

  nextEventTimeout: {
    [eventName: string]: ?TimeoutID;
  };

  // nextEventTimeout: TimeoutID;
  nextStateTimeout: ?TimeoutID;
  // nextSlideTimeout: TimeoutID;

  recordStateTimeout: ?TimeoutID;

  // nextSlide: ?() => void;
  // prevSlide: ?() => void;
  // goToSlide: ?(number) => void;
  // getCurrentSlide: ?() => number;

  playbackStopped: ?() =>void;

  // lastTime: number;

  audio: ?HTMLAudioElement;

  static instance: Object;

  // All slides, events and states are relative to 0, where 0 is the start of a recording.
  // Slides, events and states do not have to have a 0 time, maybe the first event will not happen till 1s in
  //
  constructor() {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      // reset all data
      this.reset();

      // default recording values
      this.precision = 4;
      this.stateTimeStep = 1;

      // diagram and topic functions
      // this.animation = new GlobalAnimation();
      this.touchDown = () => {};
      this.touchUp = () => {};
      this.cursorMove = () => {};
      this.animateDiagramNextFrame = () => {};
      this.getDiagramElement = () => null;
      this.getDiagramState = () => {};
      this.setDiagramState = () => {};
      this.pauseDiagram = () => {};
      this.unpauseDiagram = () => {};
      // this.nextSlide = null;
      // this.prevSlide = null;
      // this.goToSlide = null;
      this.audio = null;
      this.playbackStopped = null;
      // this.getCurrentSlide = null;
      // this.diagramIsInTransition = () => false;
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
    return (this.timeStamp() - this.videoToNowDelta) / 1000;
  }

  getCurrentTime() {
    if (this.state !== 'idle') {
      return this.now();
    }
    return this.currentTime;
  }

  setVideoToNowDeltaTime(fromTime: number = 0) {
    this.videoToNowDelta = this.timeStamp() - fromTime * 1000;
  }

  calcDuration(cache: boolean = false) {
    // let time = 0;
    let eventsTime = 0;
    let eventsCacheTime = 0;
    let statesTime = 0;
    let statesCacheTime = 0;
    let audioTime = 0;
    Object.keys(this.events).forEach((eventName) => {
      const event = this.events[eventName];
      if (event.list.length > 0) {
        eventsTime = Math.max(eventsTime, event.list[event.list.length - 1][0]);
      }
    });
    Object.keys(this.eventsCache).forEach((eventName) => {
      const event = this.eventsCache[eventName];
      if (event.list.length > 0) {
        eventsCacheTime = Math.max(eventsCacheTime, event.list[event.list.length - 1][0]);
      }
    });
    if (this.states.diffs.length > 0) {
      [statesTime] = this.states.diffs[this.states.diffs.length - 1];
      // time = Math.max(time, statesTime);
    }
    if (this.statesCache.diffs.length > 0) {
      [statesCacheTime] = this.statesCache.diffs[this.statesCache.diffs.length - 1];
      // time = Math.max(time, statesCacheTime);
    }
    // eslint-disable-next-line no-restricted-globals
    if (this.audio != null && !isNaN(this.audio.duration)) {
      audioTime = this.audio.duration;
    }
    if (cache) {
      return Math.max(eventsCacheTime, statesCacheTime);
    }
    return Math.max(eventsTime, eventsCacheTime, statesTime, statesCacheTime, audioTime);
  }

  // getTotalTime() {
  //   let time = 0;
  //   if (this.slides.length > 0) {
  //     const endTime = this.slides.slice(-1)[0][0];
  //     time = Math.max(time, endTime);
  //   }
  //   if (this.events.length > 0) {
  //     const endTime = this.events.slice(-1)[0][0];
  //     time = Math.max(time, endTime);
  //   }
  //   // if (this.states.length > 0) {
  //   //   const endTime = this.states.slice(-1)[0][0];
  //   //   time = Math.max(time, endTime);
  //   // }
  //   // eslint-disable-next-line no-restricted-globals
  //   if (this.audio != null && !isNaN(this.audio.duration)) {
  //     time = Math.max(time, this.audio.duration);
  //   }
  //   return time;
  // }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Initialization
  // ////////////////////////////////////
  // ////////////////////////////////////
  reset() {
    this.states = new ObjectTracker();
    this.statesCache = new ObjectTracker();
    this.events = {};
    this.eventsCache = {};
    this.stateIndex = -1;
    this.eventIndex = {};
    this.nextEventTimeout = {};
    this.recordStateTimeout = null;
    this.nextStateTimeout = null;
    // this.slides = [];
    this.videoToNowDelta = 0;
    this.state = 'idle';
    // this.lastShownEventIndex = -1;
    // this.lastShownStateIndex = -1;
    // this.lastShownSlideIndex = -1;
    // this.previousPoint = null;
    this.isAudioPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    // this.isPlaying = false;
    // this.isRecording = false;
  }

  // resetStates() {
  //   this.states.reset();
  // }

  loadEvents(
    minifiedEvents: {
      map: UniqueMap | Object,
      minified: Object,
    } | Array<TypeEvents>,
    isMinified: boolean = false,
  ) {
    this.events = {};
    if (isMinified) { // $FlowFixMe
      this.events = unminify(minifiedEvents);
    } else {  // $FlowFixMe
      this.events = minifiedEvents;
    }
    this.duration = this.calcDuration();
  }

  // loadSlides(
  //   minifiedSlides: {
  //     map: UniqueMap | Object,
  //     minified: Object,
  //   } | Array<TypeEvents>,
  //   isMinified: boolean = false,
  // ) {
  //   this.slides = [];
  //   if (isMinified) { // $FlowFixMe
  //     this.slides = unminify(minifiedSlides);
  //   } else {  // $FlowFixMe
  //     this.slides = minifiedSlides;
  //   }
  //   this.duration = this.calcDuration();
  // }

  loadStates(
    states: {
      states: TypeStates,
      reference: { [referenceName: string]: Object },
      map?: UniqueMap,
    },
    unminifyFlag: boolean = false,
  ) {
    // this.resetStates();
    if (unminifyFlag) {  // $FlowFixMe
      this.states = this.unminifyStates(states);
    } else {
      this.states.states = states.states;
      this.states.reference = states.reference;
    }
    this.duration = this.calcDuration();
  }

  minifyStates(
    asObject: boolean = false,
    precision: ?number = this.precision,
  ) {
    const ref = duplicate(this.states.reference.base);
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
    return minify(states, precision);
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

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Editing
  // ////////////////////////////////////
  // ////////////////////////////////////
  // deleteFromTime(time: number) {
  //   if (time === 0) {
  //     this.reset();
  //     return;
  //   }
  //   const slidesIndex = getNextIndexForTime(this.slides, time);
  //   const eventsIndex = getNextIndexForTime(this.events, time);
  //   const statesIndex = getNextIndexForTime(this.states.diffs, time);
  //   if (slidesIndex > 1) {
  //     this.slides = this.slides.slice(0, slidesIndex);
  //   } else if (slidesIndex === 0) {
  //     this.slides = [];
  //   }
  //   if (eventsIndex > 1) {
  //     this.events = this.events.slice(0, eventsIndex);
  //   } else if (eventsIndex === 0) {
  //     this.events = [];
  //   }
  //   if (statesIndex > 1) {
  //     this.states.diffs = this.states.diffs.slice(0, statesIndex);
  //   } else if (statesIndex === 0) {
  //     this.states.diffs = [];
  //   }
  // }

  // insert(
  //   fromTime: number,
  //   toTime: number,
  //   events: TypeEvents,
  //   slides: TypeSlides,
  //   states: ObjectTracker,
  // ) {
  //   if (fromTime === 0)
  // }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Recording
  // ////////////////////////////////////
  // ////////////////////////////////////
  startRecording(startTime: number = 0) {
    this.eventsCache = {};
    // this.slidesCache = [];
    this.statesCache = new ObjectTracker();
    this.statesCache.baseReference = duplicate(this.states.baseReference);
    this.statesCache.references = duplicate(this.states.references);
    this.unpauseDiagram();
    this.setVideoToNowDeltaTime(startTime);
    this.state = 'recording';
    // if (startTime === 0) {
    //   this.recordSlide('goto', '', 0);
    //   this.recordEvent('start');
    // }

    this.queueRecordState(0);
  }

  getCacheStartTime() {
    let time = null;
    if (this.statesCache.diffs.length > 0) {
      time = this.statesCache.diffs[0][0];
    }
    Object.keys(this.eventsCache).forEach((eventName) => {
      const event = this.eventsCache[eventName];
      if (event.list.length > 0) {
        const [eventTime] = event.list[0];
        if (time == null) {
          time = eventTime;
        } else {
          time = Math.min(eventTime, time);
        }
      }
    });
    return time;
  }

  getCacheEndTime() {
    return this.calcDuration(true);
  }

  mergeEventsCache() {
    const startTime = this.getCacheStartTime();
    const endTime = this.getCacheEndTime();
    if (startTime == null || endTime === 0) {
      return;
    }
    Object.keys(this.eventsCache).forEach((eventName) => {
      if (this.events[eventName] == null) {
        return;
      }
      let sliceStart = getPrevIndexForTime(this.events[eventName].list, startTime);
      if (sliceStart > -1 && this.events[eventName].list[sliceStart][0] === startTime) {
        sliceStart = getIndexOfEarliestTime(this.events[eventName].list, sliceStart) - 1;
        if (sliceStart < 0) {
          sliceStart = -1;
        }
      }
      let sliceEnd = getNextIndexForTime(this.events[eventName].list, endTime);
      if (sliceEnd > -1 && this.events[eventName].list[sliceEnd][0] === endTime) {
        sliceEnd = getIndexOfLatestTime(this.events[eventName].list, sliceEnd) + 1;
        if (sliceEnd > this.events[eventName].list.length - 1) {
          sliceEnd = -1;
        }
      }
      let beforeEvents = [];
      let afterEvents = [];
      if (sliceStart >= 0) {
        beforeEvents = this.events[eventName].list.slice(0, sliceStart + 1);
      }
      if (sliceEnd >= 0) {
        afterEvents = this.events[eventName].list.slice(sliceEnd);
      }
      this.events[eventName].list = [
        ...beforeEvents, ...this.eventsCache[eventName].list, ...afterEvents,
      ];
    });
  }

  mergeStatesCache() {
    const startTime = this.getCacheStartTime();
    const endTime = this.getCacheEndTime();
    if (startTime == null || endTime === 0) {
      return;
    }
    let sliceStart = getPrevIndexForTime(this.states.diffs, startTime);
    if (sliceStart > -1 && this.states.diffs[sliceStart][0] === startTime) {
      sliceStart = getIndexOfEarliestTime(this.states.diffs, sliceStart) - 1;
      if (sliceStart < 0) {
        sliceStart = -1;
      }
    }
    let sliceEnd = getNextIndexForTime(this.states.diffs, endTime);
    if (sliceEnd > -1 && this.states.diffs[sliceEnd][0] === endTime) {
      sliceEnd = getIndexOfLatestTime(this.states.diffs, sliceEnd) + 1;
      if (sliceEnd > this.states.diffs.length - 1) {
        sliceEnd = -1;
      }
    }
    let beforeEvents = [];
    let afterEvents = [];
    if (sliceStart >= 0) {
      beforeEvents = this.states.diffs.slice(0, sliceStart + 1);
    }
    if (sliceEnd >= 0) {
      afterEvents = this.states.diffs.slice(sliceEnd);
    }
    this.states.diffs = [
      ...beforeEvents, ...this.statesCache.diffs, ...afterEvents,
    ];
    this.states.baseReference = duplicate(this.statesCache.baseReference);
    this.states.references = duplicate(this.statesCache.references);
  }

  stopRecording() {
    this.state = 'idle';
    if (this.recordStateTimeout != null) {
      clearTimeout(this.recordStateTimeout);
      this.recordStateTimeout = null;
    }
    this.mergeEventsCache();
    this.states = this.statesCache;
    // this.slides = this.slidesCache;
    this.duration = this.calcDuration();
  }

  addEventType(
    eventName: string,
    playbackAction: (any) => void,
    setOnSeek: boolean = false,
  ) {
    this.events[eventName] = {
      setOnSeek,
      list: [],
      playbackAction,
    };
    this.eventIndex[eventName] = -1;
    this.nextEventTimeout[eventName] = null;
  }

  recordState(state: Object, precision: ?number = this.precision) {
    this.statesCache.add(this.now(), state);
    this.duration = this.calcDuration();
  }

  recordCurrentState() {
    this.recordState(this.getDiagramState());
  }

  recordEvent(
    eventName: string,
    payload: Array<string | number | Object>,
  ) {
    if (this.events[eventName] == null) {
      return;
    }
    if (this.eventsCache[eventName] == null) {
      this.eventsCache[eventName] = {
        list: [],
      };
    }
    this.eventsCache[eventName].list.push([this.now(), payload]);
  }

  // recordEvent(...args: Array<number | string>) {
  //   const out = [];
  //   args.forEach((arg) => {
  //     if (typeof arg === 'number' && this.precision > -1) {
  //       out.push(round(arg, this.precision));
  //       return;
  //     }
  //     out.push(arg);
  //   });
    // $FlowFixMe
    // this.eventsCache.push([this.now(), [...out]]);
  // }

  // States are recorded every second
  queueRecordState(time: number = 0) {
    const recordAndQueue = () => {
      if (this.state === 'recording') {
        this.recordCurrentState();
        this.queueRecordState(this.stateTimeStep * 1000);
      }
    };
    if (time === 0) {
      recordAndQueue();
      return;
    }
    this.recordStateTimeout = setTimeout(() => {
      recordAndQueue();
    }, time);
  }

  // addReferenceState(state: Object, precision: ?number = 4) {
  //   if (this.states.reference.length === 0) {
  //     this.states.reference.push(duplicate(state));
  //     return;
  //   }
  //   const diff = getObjectDiff(this.states.reference[0], [], state, precision);
  //   this.states.reference.push(diff);
  // }

  // getReferenceState(index: number = 0) {
  //   if (this.states.reference.length === 0) {
  //     return {};
  //   }
  //   if (index === 0 || this.states.reference.length === 1) {
  //     return this.states.reference[0];
  //   }
  //   if (index === -1) {
  //     return refAndDiffToObject(
  //       this.states.reference[0],
  //       this.states.reference[this.states.reference.length - 1],
  //     );
  //   }
  //   return refAndDiffToObject(this.states.reference[0], this.states.reference[index]);
  // }

  // getState(index: number) {
  //   const state = this.states.getFromIndex(index);
  //   const [time] = this.states.diffs[index];
  //   return [time, state];
  //   // const state = this.states.states[index];
  //   // const [time, stateTimeAndObject] = state;
  //   // const [refIndex, diff] = stateTimeAndObject;
  //   // const ref = this.getReferenceState(refIndex);
  //   // const stateObj = refAndDiffToObject(ref, diff);
  //   // return [time, stateObj];
  // }

  save() {
    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    const minifiedStates = this.minifyStates(true, 4);
    // download(`${dateStr} ${location}.vidslides.json`, JSON.stringify(this.slides));
    download(`${dateStr} ${location}.videvents.json`, JSON.stringify(minify(this.events)));
    download(`${dateStr} ${location}.vidstates.json`, JSON.stringify(minifiedStates));
  }

  show() {
    // const wnd = window.open('about:blank', '', '_blank');
    // // this.slides.forEach((slide) => {
    // //   wnd.document.write(JSON.stringify(slide), '<br>');
    // // });

    // wnd.document.write('<br><br>');
    // wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    // wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    // wnd.document.write('<br><br>');

    // Object.keys(this.events).forEach((eventName) => {
    //   const event = this.events[eventName];
    //   const rounded = event.map((e) => {
    //     if (typeof e === 'number') {
    //       return round(e, this.precision);
    //     }
    //     return e;
    //   });
    //   wnd.document.write(JSON.stringify(rounded), '<br>');
    // });
    // wnd.document.write('<br><br>');
    // wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    // wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    // wnd.document.write('<br><br>');
    // this.states.states.forEach((state) => {
    //   wnd.document.write(JSON.stringify(state), '<br>');
    // });
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Seeking
  // ////////////////////////////////////
  // ////////////////////////////////////
  seek(percentTime: number) {
    if (this.states.diffs.length === 0) {
      return;
    }
    this.pausePlayback();
    const duration = this.calcDuration();
    const timeTarget = percentTime * duration;
    this.setToTime(timeTarget);
    this.pauseDiagram();
  }

  setToTime(time: number) {
    this.stateIndex = getPrevIndexForTime(this.states.diffs, time);
    Object.keys(this.events).forEach((eventName) => {
      this.eventIndex[eventName] = getPrevIndexForTime(this.events[eventNames].list, time);
    });
    // const cursorState = getCursorState(this.events, this.eventIndex);

    let slideTime = null;
    if (this.slideIndex > -1) {
      [slideTime] = this.slides[this.slideIndex];
    }
    let stateTime = null;
    if (this.stateIndex > -1) {
      [stateTime] = this.states.states[this.stateIndex];
    }

    if (slideTime != null && stateTime != null && stateTime < slideTime) {
      this.setState(this.stateIndex);
      this.setSlide(this.slideIndex);
    } else if (slideTime != null && stateTime != null && stateTime >= slideTime) {
      this.setSlide(this.slideIndex);
      this.setState(this.stateIndex);
    } else if (slideTime != null) {
      this.setSlide(this.slideIndex);
    } else if (stateTime != null) {
      this.setState(this.stateIndex);
    }

    // if (cursorState.show && cursorState.up) {
    //   this.diagramShowCursor('up');
    //   this.cursorMove(cursorState.position);
    // } else if (cursorState.show && cursorState.up === false) {
    //   this.diagramShowCursor('down');
    //   this.cursorMove(cursorState.position);
    // } else {
    //   this.diagramShowCursor('hide');
    // }

    if (this.audio) {
      this.audio.currentTime = time;
    }
    this.currentTime = time;

    this.animateDiagramNextFrame();
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Playback
  // ////////////////////////////////////
  // ////////////////////////////////////
  startPlayback(fromTimeIn: number = 0) {
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
    this.touchUp();
    this.setStartTime(fromTime);
    this.currentTime = fromTime;
    this.unpauseDiagram();

    this.setToTime(fromTime);
    // this.slideIndex = getPrevIndexForTime(this.slides, fromTime);
    // this.stateIndex = getPrevIndexForTime(this.states.states, fromTime);
    // this.eventIndex = getPrevIndexForTime(this.events, fromTime);
    // this.playbackSlide();
    // this.setState(this.stateIndex);
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

  clearPlaybackTimeouts() {
    if (this.nextStateTimeout != null) {
      clearTimeout(this.nextStateTimeout);
    }
    Object.keys(this.nextEventTimeout).forEach((eventName) => {
      const timeoutId = this.nextEventTimeout[eventName];
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        this.nextEventTimeout[eventName] = null;
      }
    });
  }

  pausePlayback() {
    this.pauseDiagram();
    this.currentTime = this.getCurrentTime();
    this.state = 'idle';
    // clearTimeout(this.nextEventTimeout);
    // clearTimeout(this.nextStateTimeout);
    this.clearPlaybackTimeouts();
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

  // playFrame() {
  //   const time = this.getCurrentTime();

  //   const prevStateIndex = Math.max(getPrevIndexForTime(this.states.states, time), 0);
  //   if (prevStateIndex > this.lastShownStateIndex) {
  //     const lastIndexWithSameTime = getIndexOfLatestTime(this.states.states, prevStateIndex);
  //     this.setState(lastIndexWithSameTime);
  //     this.lastShownStateIndex = lastIndexWithSameTime;
  //   }
  //   const prevEventIndex = Math.max(getPrevIndexForTime(this.events, time), 0);
  //   if (prevEventIndex > this.lastShownEventIndex) {
  //     const lastIndexWithSameTime = getIndexOfLatestTime(this.events, prevEventIndex);
  //     const indexRange = getLastUniqueIndeces(
  //       this.events,
  //       this.lastShownEventIndex,
  //       lastIndexWithSameTime,
  //     ).sort();
  //     for (let i = 0; i < indexRange.length; i += 1) {
  //       this.setEvent(indexRange[i]);
  //     }
  //     this.lastShownEventIndex = indexRange[indexRange.length - 1];
  //   }
  //   if (
  //     (
  //       this.lastShownEventIndex >= this.events.length - 1
  //       || this.lastShownEventIndex === -1
  //     )
  //     && (
  //       this.lastShownStateIndex >= this.states.states.length - 1
  //       || this.lastShownStateIndex === -1
  //     )
  //   ) {
  //     this.pausePlayback();
  //   } else {
  //     this.animation.queueNextFrame(this.playFrame.bind(this));
  //   }
  //   this.animateDiagramNextFrame();
  //   // console.log(this.getCurrentTime() - time);
  //   // const prevSlideIndex = getPrevIndexForTime(this.slides, time);
  // }

  queuePlaybackEvent(eventName: string, delay: number = 0) {
    const incrementIndexAndPlayEvent = () => {
      if (this.state === 'playing') {
        this.eventIndex[eventName] += 1;
        this.playbackEvent(eventName);
      }
    }
    if (delay === 0) {
      incrementIndexAndPlayEvent();
      return;
    }
    this.nextEventTimeout[eventName] = setTimeout(incrementIndexAndPlayEvent, delay);
  }

  playbackEvent(eventName: string) {
    if (this.eventIndex[eventName] > this.events[eventName].list.length - 1) {
      this.checkStopPlayback();
      return;
    }
    // const event = this.events[this.eventIndex];
    this.setEvent(eventName, this.eventIndex[eventName]);
    // this.lastTime = this.getCurrentTime();
    this.animateDiagramNextFrame();
    // this.eventIndex += 1;
    const nextIndex = this.eventIndex[eventName] + 1;
    if (nextIndex === this.events[eventName].list.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.events[eventName].list[nextIndex][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackEvent(eventName, Math.max(nextTime, 0));
  }

  setEvent(eventName: string, index: number) {
    const event = this.events[eventName];
    if (event == null) {
      return;
    }
    event.playbackAction(event.list[index][1], event.list[index][0]);
  }

  setEventLegacy(index: number = this.eventIndex) {
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

  queuePlaybackState(delay: number = 0) {
    const incrementIndexAndPlayState = () => {
      if (this.state === 'playing') {
        this.stateIndex += 1;
        this.playbackState();
      }
    }
    if (delay === 0) {
      incrementIndexAndPlayState();
      return;
    }
    this.nextStateTimeout = setTimeout(incrementIndexAndPlayState, delay);
  }

  playbackState() {
    if (this.stateIndex > this.states.diffs.length - 1) {
      this.checkStopPlayback();
      return;
    }
    this.setState(this.stateIndex);
    this.animateDiagramNextFrame();
    if (this.stateIndex + 1 === this.states.diffs.length) {
      this.checkStopPlayback();
      return;
    }
    const nextTime = (this.states.diffs[this.stateIndex + 1][0] - this.getCurrentTime()) * 1000;
    this.queuePlaybackState(nextTime);
  }

  setState(index: number) {
    if (index > this.states.diffs.length - 1) {
      return;
    }
    const state = this.states.getFromIndex(index);
    this.setDiagramState(state);
  }

  // queuePlaybackSlide(delay: number = 0) {
  //   if (this.slideIndex + 1 > this.slides.length - 1) {
  //     return;
  //   }
  //   this.nextSlideTimeout = setTimeout(() => {
  //     if (this.isPlaying) {
  //       this.slideIndex += 1;
  //       this.playbackSlide();
  //     }
  //   }, delay);
  // }

  // playbackSlide(forceGoTo: boolean = false) {
  //   if (this.slideIndex > this.slides.length - 1) {
  //     this.checkStopPlayback();
  //     return;
  //   }
  //   // const event = this.events[this.slideIndex];
  //   this.setSlide(this.slideIndex, forceGoTo);
  //   this.animateDiagramNextFrame();

  //   if (this.slideIndex + 1 === this.slides.length) {
  //     this.checkStopPlayback();
  //     return;
  //   }
  //   const nextTime = (this.slides[this.slideIndex + 1][0] - this.getCurrentTime()) * 1000;
  //   this.queuePlaybackSlide(Math.max(nextTime, 0));
  // }

  // setSlide(index: number, forceGoTo: boolean = false) {
  //   if (index > this.slides.length - 1) {
  //     return;
  //   }
  //   const slide = this.slides[index][1];
  //   const [direction, message, slideNumber] = slide;
  //   const currentSlide = this.getCurrentSlide();
  //   if (direction === 'next' && forceGoTo === false && currentSlide === slideNumber - 1) {
  //     if (this.nextSlide != null) {
  //       this.nextSlide(message);
  //     }
  //   } else if (direction === 'prev' && forceGoTo === false && currentSlide === slideNumber + 1) {
  //     if (this.prevSlide != null) {
  //       this.prevSlide(message);
  //     }
  //   } else if (this.goToSlide != null) {
  //     this.goToSlide(slideNumber);
  //   }
  // }
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
