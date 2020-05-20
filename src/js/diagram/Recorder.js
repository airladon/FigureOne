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
  (Array<number | string | Object> | string | number | Object),
  number,
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
  earliestTime: boolean = true,
) {
  const nextIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[1];
  // console.log(nextIndex)
  if (earliestTime) {
    return getIndexOfEarliestTime(recordedData, nextIndex);
  }
  return getIndexOfLatestTime(recordedData, nextIndex);
}

function getPrevIndexForTime(
  recordedData: TypeEvents | TypeStateDiffs,
  time: number,
  startSearch: number = 0,
  endSearch: number = recordedData.length - 1,
  earliestTime: boolean = true,
) {
  const prevIndex = getIndexRangeForTime(recordedData, time, startSearch, endSearch)[0];
  if (earliestTime) {
    return getIndexOfEarliestTime(recordedData, prevIndex);
  }
  return getIndexOfLatestTime(recordedData, prevIndex);
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
  // diagram.getState: () => Object;
  // diagram.setState: (Object) => void;
  // diagram.pause: () => void;
  // diagram.unpause: () => void;

  // animation: GlobalAnimation;
  // previousPoint: ?Point;
  // diagram.animateNextFrame: () => void;
  // diagramIsInTransition: () => boolean;
  diagram: {
    showCursor: ('up' | 'down' | 'hide', ?Point) => void,
    getElement: (string) => ?DiagramElement,
    pause: () => void,
    unpause: () => void,
    getState: () => Object,
    setState: (Object) => void,
    animateNextFrame: () => void,
  }

  nextEventTimeout: ?TimeoutID;

  // nextEventTimeout: TimeoutID;
  // nextStateTimeout: ?TimeoutID;
  // nextSlideTimeout: TimeoutID;

  recordStateTimeout: ?TimeoutID;

  // nextSlide: ?() => void;
  // prevSlide: ?() => void;
  // goToSlide: ?(number) => void;
  // getCurrentSlide: ?() => number;

  playbackStopped: ?() =>void;

  lastRecordTime: number;
  lastRecordTimeCount: number;

  // lastTime: number;

  audio: ?HTMLAudioElement;
  reference: string;

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
      // this.touchDown = () => {};
      // this.touchUp = () => {};
      // this.cursorMove = () => {};
      this.diagram = {
        animateNextFrame: () => {},
        getElement: () => null,
        getState: () => {},
        setState: () => {},
        pause: () => {},
        unpause: () => {},
        showCursor: () => {},
      };
      // this.diagram.animateNextFrame = () => {};
      // this.diagram.getElement = () => null;
      // this.diagram.getState = () => {};
      // this.diagram.setState = () => {};
      // this.diagram.pause = () => {};
      // this.diagram.unpause = () => {};
      // this.nextSlide = null;
      // this.prevSlide = null;
      // this.goToSlide = null;
      this.audio = null;
      this.playbackStopped = null;
      // this.getCurrentSlide = null;
      // this.diagramIsInTransition = () => false;
      // this.diagram.showCursor = () => {};
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

  setVideoToNowDeltaTime(videoSeekTime: number = 0) {
    this.videoToNowDelta = this.timeStamp() - videoSeekTime * 1000;
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
    this.states = new ObjectTracker(this.precision);
    this.statesCache = new ObjectTracker(this.precision);
    this.events = {};
    this.eventsCache = {};
    this.stateIndex = -1;
    this.eventIndex = {};
    this.nextEventTimeout = null;
    this.recordStateTimeout = null;
    // this.nextStateTimeout = null;
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
    this.reference = '__base';
    this.lastRecordTimeCount = 0;
    this.lastRecordTime = null;
    // this.isPlaying = false;
    // this.isRecording = false;
  }

  // resetStates() {
  //   this.states.reset();
  // }

  loadEvents(
    encodedEventsList: Object | Array<TypeEvents>,
    isMinified: boolean = false,
  ) {
    this.events.list = this.decodeEvents(encodedEventsList, isMinified);
    this.duration = this.calcDuration();
  }

  loadStates(
    statesIn: Object,
    isMinified: boolean = true,
    isObjectForm: boolean = true,
  ) {
    this.states = this.decodeStates(statesIn, isMinified, isObjectForm);
    this.duration = this.calcDuration();
  }

  encodeEvents(
    minifyEvents: boolean = true,
  ) {
    if (minifyEvents) {
      return minify(this.events.list);
    }
    return duplicate(this.events.list);
  }

  // eslint-disable-next-line class-methods-use-this
  decodeEvents(
    eventsList: Object | Array<TypeEvents>,
    isMinified: boolean = true,
  ) {
    if (isMinified && !Array.isArray(eventsList)) {
      return unminify(eventsList);
    }
    return eventsList;
  }


  encodeStates(
    minifyStates: boolean = true,
    asObject: boolean = true,
    precision: ?number = this.precision,
  ) {
    let states;
    if (asObject) {
      states = this.states.toObj();
    } else {
      states = duplicate(this.states);
    }
    if (minifyStates) {
      return minify(states, precision);
    }
    return states;
  }

  // eslint-disable-next-line class-methods-use-this
  decodeStates(
    statesIn: Object,
    isMinified: boolean = true,
    asObject: boolean = true,
  ) {
    let statesToUse = statesIn;
    if (isMinified) {
      statesToUse = unminify(statesIn);
    }
    if (asObject) {
      const states1 = new ObjectTracker();
      states1.setFromObj(statesToUse);
      statesToUse = states1;
    }
    const states = new ObjectTracker();
    states.diffs = statesToUse.diffs;
    states.baseReference = statesToUse.baseReference;
    states.references = statesToUse.references;
    states.precision = statesToUse.precision;
    return states;
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
    this.states.precision = this.precision;
    this.eventsCache = {};
    // this.slidesCache = [];
    this.statesCache = new ObjectTracker(this.precision);
    this.statesCache.baseReference = duplicate(this.states.baseReference);
    this.statesCache.references = duplicate(this.states.references);
    this.diagram.unpause();
    this.setVideoToNowDeltaTime(startTime);
    this.state = 'recording';
    this.lastRecordTime = null;
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

  getMergedCacheArray(
    eventListOrStatesDiff: TypeEvents | TypeStateDiffs,
    cacheArray: TypeEvents | TypeStateDiffs,
  ) {
    const startTime = this.getCacheStartTime();
    const endTime = this.getCacheEndTime();
    if (startTime == null || endTime === 0) {
      return [];
    }
    let sliceStart = getPrevIndexForTime(eventListOrStatesDiff, startTime);
    if (sliceStart > -1 && eventListOrStatesDiff[sliceStart][0] === startTime) {
      sliceStart = getIndexOfEarliestTime(eventListOrStatesDiff, sliceStart) - 1;
      if (sliceStart < 0) {
        sliceStart = -1;
      }
    }
    let sliceEnd = getNextIndexForTime(eventListOrStatesDiff, endTime);
    if (sliceEnd > -1 && eventListOrStatesDiff[sliceEnd][0] === endTime) {
      sliceEnd = getIndexOfLatestTime(eventListOrStatesDiff, sliceEnd) + 1;
      if (sliceEnd > eventListOrStatesDiff.length - 1) {
        sliceEnd = -1;
      }
    }
    let beforeEvents = [];
    let afterEvents = [];
    if (sliceStart >= 0) {
      beforeEvents = eventListOrStatesDiff.slice(0, sliceStart + 1);
    }
    if (sliceEnd >= 0) {
      afterEvents = eventListOrStatesDiff.slice(sliceEnd);
    }
    return [...beforeEvents, ...cacheArray, ...afterEvents];
  }

  mergeEventsCache() {
    Object.keys(this.eventsCache).forEach((eventName) => {
      const merged = this.getMergedCacheArray(
        this.events[eventName].list, this.eventsCache[eventName].list,
      );
      if (merged.length === 0) {
        return;
      }
      this.events[eventName].list = merged;
    });
  }

  mergeStatesCache() {
    const merged = this.getMergedCacheArray(
      this.states.diffs, this.statesCache.diffs,
    );
    if (merged.length === 0) {
      return;
    }
    this.states.diffs = merged;
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
    this.mergeStatesCache();
    // this.states = this.statesCache;
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
    // this.nextEventTimeout[eventName] = null;
  }

  recordState(state: Object) {
    const now = this.now();
    if (this.lastRecordTime == null || now > this.lastRecordTime) {
      this.lastRecordTime = now;
      this.lastRecordTimeCount = 0;
    }
    this.statesCache.add(now, state, this.reference, this.lastRecordTimeCount);
    this.duration = this.calcDuration();
    this.lastRecordTimeCount += 1;
  }

  recordCurrentState() {
    this.recordState(this.diagram.getState());
  }

  recordCurrentStateAsReference(refName: string, basedOn: '__base') {
    this.statesCache.addReference(this.diagram.getState(), refName, basedOn);
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
    const now = this.now();
    if (this.lastRecordTime == null || now > this.lastRecordTime) {
      this.lastRecordTime = now;
      this.lastRecordTimeCount = 0;
    }
    this.eventsCache[eventName].list.push(
      [now, payload, this.lastRecordTimeCount],
    );
    this.lastRecordTimeCount += 1;
  }

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
  seekToPercent(percentTime: number) {
    // if (this.states.diffs.length === 0) {
    //   return;
    // }
    // this.pausePlayback();
    const duration = this.calcDuration();
    this.seek(duration * percentTime);
    // const timeTarget = percentTime * duration;
    // this.setToTime(timeTarget);
    // this.diagram.pause();
  }

  seek(timeIn: number) {
    let time = timeIn;
    if (time < 0) {
      time = 0;
    }
    if (this.states.diffs.length === 0) {
      return;
    }
    this.pausePlayback();
    // const duration = this.calcDuration();
    // const timeTarget = percentTime * duration;
    this.setToTime(time);
    // this.getCursorState();
    this.diagram.pause();
  }

  setToTime(time: number) {
    this.stateIndex = getPrevIndexForTime(this.states.diffs, time);
    const [stateTime, , , stateTimeCount] = this.states.diffs[this.stateIndex];

    // For each eventName, if it is to be set on seek, then get the previous
    // index (or multiple indexes if multiple are set for the same time)
    // and add them to an eventsToExecuteArray
    const eventsToSetBeforeState = [];
    const eventsToSetAfterState = [];
    Object.keys(this.events).forEach((eventName) => {
      const event = this.events[eventName];
      if (event.setOnSeek === false) {
        return;
      }
      const firstIndex = getPrevIndexForTime(event.list, time);
      if (firstIndex === -1) {
        return;
      }
      const lastIndex = getIndexOfLatestTime(event.list, firstIndex);
      for (let i = firstIndex; i <= lastIndex; i += 1) {
        const [eventTime, , timeCount] = event.list[i];
        if (
          eventTime < stateTime
          || (eventTime === stateTime && timeCount < stateTimeCount)
        ) {
          eventsToSetBeforeState.push([eventName, i, eventTime, timeCount]);
        }
        if (
          eventTime > stateTime
          || (eventTime === stateTime && timeCount > stateTimeCount)
        ) {
          eventsToSetAfterState.push([eventName, i, eventTime, timeCount]);
        }
      }
    });

    const sortTimes = arrayToSort => arrayToSort.sort((a, b) => {
      if (a[2] < b[2] || (a[2] === b[2] && a[3] < b[3])) {
        return -1;
      }
      if (a[2] > b[2] || (a[2] === b[2] && a[3] > b[3])) {
        return 1;
      }
      return 0;
    });

    // Sort the eventsToSet arrays in time
    sortTimes(eventsToSetBeforeState);
    sortTimes(eventsToSetAfterState);

    const playEvents = (events) => {
      events.forEach((event) => {
        const [eventName, index] = event;
        this.setEvent(eventName, index);
      });
    };
    playEvents(eventsToSetBeforeState);
    this.setState(this.stateIndex);
    playEvents(eventsToSetAfterState);
    if (this.audio) {
      this.audio.currentTime = time;
    }
    this.currentTime = time;

    this.setCursor(time);
    this.diagram.animateNextFrame();
  }

  setCursor(time: number) {
    const cursorState = this.getCursorState(time);
    if (cursorState == null) {
      return;
    }
    const { show, up, position } = cursorState;
    if (show && up) {
      this.diagram.showCursor('up', position);
    } else if (show && up === false) {
      this.diagram.showCursor('down', position);
    } else {
      this.diagram.showCursor('hide');
    }
  }

  getCursorState(atTime: number) {
    if (
      this.events.touch == null
      || this.events.cursor == null
      || this.events.cursorMove == null
    ) {
      return null;
    }

    const cursorIndex = getPrevIndexForTime(this.events.cursor.list, atTime);
    const touchIndex = getPrevIndexForTime(this.events.touch.list, atTime);
    const cursorMoveIndex = getPrevIndexForTime(this.events.cursorMove.list, atTime);

    let touchUp = null;
    let showCursor = null;
    let cursorPosition = null;
    let cursorTime = null;
    let cursorTimeCount = null;
    if (touchIndex !== -1) {
      const event = this.events.touch.list[touchIndex];
      const [time, [upOrDown, x, y], timeCount] = event;
      if (upOrDown === 'down') {
        touchUp = false;
        cursorTime = time;
        cursorTimeCount = timeCount;
        cursorPosition = new Point(x, y);
      } else {
        touchUp = true;
      }
    }

    if (cursorIndex !== -1) {
      const event = this.events.cursor.list[cursorIndex];
      const [time, [showOrHide, x, y], timeCount] = event;
      if (showOrHide === 'show') {
        showCursor = true;
        if (
          cursorTime == null
          || time > cursorTime
          || (time === cursorTime && timeCount > cursorTimeCount)
        ) {
          cursorTime = time;
          cursorTimeCount = timeCount;
          cursorPosition = new Point(x, y);
        }
      } else {
        showCursor = false;
      }
    }

    if (cursorMoveIndex !== -1) {
      const event = this.events.cursorMove.list[cursorMoveIndex];
      const [time, [x, y], timeCount] = event;
      if (
        cursorTime == null
        || time > cursorTime
        || (time === cursorTime && timeCount > cursorTimeCount)
      ) {
        cursorPosition = new Point(x, y);
      }
    }

    return {
      show: showCursor == null ? false : showCursor,
      up: touchUp == null ? true : touchUp,
      position: cursorPosition == null ? new Point(0, 0) : cursorPosition,
    };
  }
  

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Playback
  // ////////////////////////////////////
  // ////////////////////////////////////
  startPlayback(fromTimeIn: number = 0) {

    let fromTime = fromTimeIn;
    if (fromTimeIn === this.duration) {
      fromTime = 0;
    }

    this.state = 'playing';
    this.setVideoToNowDeltaTime(fromTime);

    // this.touchUp();
    this.currentTime = fromTime;
    this.diagram.unpause();

    this.setToTime(fromTime);

    this.startEventsPlayback(fromTime);
    if (this.audio) {
      this.isAudioPlaying = true;
      this.audio.currentTime = fromTime;
      this.audio.play();
      const audioEnded = () => {
        this.isAudioPlaying = false;
        this.isPlayingFinished();
      };
      const { audio } = this;
      if (audio != null) {
        audio.removeEventListener('ended', audioEnded.bind(this), false);
        audio.addEventListener('ended', audioEnded.bind(this), false);
      }
    }

    this.diagram.animateNextFrame();
  }

  startEventsPlayback(fromTime: number) {
    Object.keys(this.events).forEach((eventName) => {
      const event = this.events[eventName];
      let index = getNextIndexForTime(event.list, fromTime);
      const [eventTime] = event.list[index];
      if (eventTime === fromTime) {
        index = getIndexOfLatestTime(event.list, index) + 1;
      }
      if (index > event.list.length - 1) {
        this.eventIndex[eventName] = -1;
      } else {
        this.eventIndex[eventName] = index;
      }
    });
    this.playbackEvent(this.getNextEvent());
  }

  // getFirstEvent() {
  //   Object.keys(this.eventIndex).forEach((eventName) => {
  //     this.eventIndex[eventName] = 0;
  //   });
  //   return this.getNextEvent();
  // }

  getNextEvent() {
    let nextEventName = '';
    let nextTime = null;
    let nextTimeCount = null;
    Object.keys(this.events).forEach((eventName) => {
      if (this.eventIndex[eventName] === -1) {
        return;
      }
      const [time, , timeCount] = this.events[eventName].list[this.eventIndex[eventName]];
      if (
        nextTime == null
        || time < nextTime
        || (time === nextTime && timeCount < nextTimeCount)
      ) {
        nextTime = time;
        nextTimeCount = timeCount;
        nextEventName = eventName;
      }
    });
    return nextEventName;
  }

  playbackEvent(eventName: string) {
    const delay = this.events[eventName].list[this.eventIndex[eventName]][0] - this.getCurrentTime();

    if (delay > 0) {
      this.nextEventTimeout = setTimeout(
        this.playbackEvent.bind(this, eventName), delay * 1000,
      );
      return;
    }

    const index = this.eventIndex[eventName];
    this.setEvent(eventName, index);
    this.diagram.animateNextFrame();
    if (index + 1 === this.events[eventName].list.length) {
      this.eventIndex[eventName] = -1;
      if (this.isPlayingFinished()) {
        return;
      }
    } else {
      this.eventIndex[eventName] = index + 1;
    }
    this.playbackEvent(this.getNextEvent());
  }

  // setPointerPosition(pos: Point) {
  //   const pointer = this.diagram.getElement('pointer');
  //   if (pointer == null) {
  //     return;
  //   }
  //   pointer.setPosition(pos);
  // }

  // showPointer() {
  //   if (this.isRecording) {
  //     return;
  //   }
  //   if (this.slides.length === 0 || this.states.states.length === 0 || this.events.length === 0) {
  //     return;
  //   }
  //   if (
  //     this.slideIndex > this.slides.length - 1
  //     || this.eventIndex > this.events.length - 1
  //   ) {
  //     return;
  //   }
  //   const p = this.getMostRecentPointerPosition();
  //   const pointer = this.diagram.getElement('pointer');
  //   if (pointer == null) {
  //     return;
  //   }

  //   this.setPointerPosition(p);
  //   const isPointerUp = this.getIsPointerUp();

  //   if (pointer != null && pointer._up != null && isPointerUp) {
  //     pointer._up.showAll();
  //   }
  //   if (pointer != null && pointer._down != null && !isPointerUp) {
  //     pointer._down.showAll();
  //   }
  // }

  // getMostRecentPointerPosition(): ?Point {
  //   // if (this.isRecording) {
  //   //   return null;
  //   // }
  //   // const touchDownTime
  //   let i = this.eventIndex;
  //   while (i >= 0 && i < this.events.length) {
  //     const eventAction = this.events[i][1];
  //     if (
  //       eventAction === 'touchDown'
  //       || eventAction === 'touchUp'
  //       || eventAction === 'cursorMove'
  //     ) {
  //       const [, , x, y] = this.events[i];
  //       if (x != null && y != null) {
  //         return new Point(x, y);
  //       }
  //       return null;
  //     }
  //     if (i <= this.eventIndex) {
  //       i -= 1;
  //     } else {
  //       i += 1;
  //     }
  //     if (i === -1) {
  //       i = this.eventIndex + 1;
  //     }
  //   }
  //   return null;
  // }

  // getIsPointerUp() {
  //   if (this.isRecording) {
  //     return false;
  //   }
  //   const slideTime = this.slides[this.slideIndex][0];
  //   let i = this.eventIndex;
  //   let eventTime;
  //   while (i > 0) {
  //     const eventAction = this.events[i][1];
  //     ([eventTime] = this.events[i]);
  //     if (eventTime < slideTime) {
  //       return true;
  //     }
  //     if (eventAction === 'touchDown') {
  //       return false;
  //     }
  //     if (eventAction === 'touchUp') {
  //       return true;
  //     }
  //     i -= 1;
  //   }
  //   return true;
  // }

  isPlayingFinished() {
    if (this.isAudioPlaying) {
      return false;
    }
    const eventNames = Object.keys(this.eventIndex)
    for (let i = 0; i < eventNames.length; i += 1) {
      const eventName = eventNames[i];
      if (
        this.eventIndex[eventName] < this.events[eventName].list.length
        && this.eventIndex[eventName] > -1
      ) {
        return false;
      }
    }

    this.pausePlayback();
    return true;
  }

  clearPlaybackTimeouts() {
    // if (this.nextStateTimeout != null) {
    //   clearTimeout(this.nextStateTimeout);
    // }
    // Object.keys(this.nextEventTimeout).forEach((eventName) => {
    //   const timeoutId = this.nextEventTimeout[eventName];
    //   if (timeoutId != null) {
    //     clearTimeout(timeoutId);
    //     this.nextEventTimeout[eventName] = null;
    //   }
    // });
    this.nextEventTimeout = null;
  }

  pausePlayback() {
    this.diagram.pause();
    this.currentTime = this.getCurrentTime();
    this.state = 'idle';
    // clearTimeout(this.nextEventTimeout);
    // clearTimeout(this.nextStateTimeout);
    this.clearPlaybackTimeouts();
    const pointer = this.diagram.getElement('pointer');
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
    // this.diagram.pause();
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
  //   this.diagram.animateNextFrame();
  //   // console.log(this.getCurrentTime() - time);
  //   // const prevSlideIndex = getPrevIndexForTime(this.slides, time);
  // }


  // queuePlaybackEvent(eventName: string, delay: number = 0) {
  //   const incrementIndexAndPlayEvent = () => {
  //     if (this.state === 'playing') {
  //       // this.eventIndex[eventName] += 1;
  //       this.playbackEvent(eventName);
  //     }
  //   }
  //   if (delay === 0) {
  //     incrementIndexAndPlayEvent();
  //     return;
  //   }
  //   this.nextEventTimeout[eventName] = setTimeout(incrementIndexAndPlayEvent, delay);
  // }

  // playbackEvent(eventName: string) {
  //   if (this.eventIndex[eventName] > this.events[eventName].list.length - 1) {
  //     this.checkStopPlayback();
  //     return;
  //   }
  //   this.setEvent(eventName, this.eventIndex[eventName]);
  //   this.diagram.animateNextFrame();
  //   const nextIndex = this.eventIndex[eventName] + 1;
  //   if (nextIndex === this.events[eventName].list.length) {
  //     this.checkStopPlayback();
  //     return;
  //   }
  //   this.eventIndex[eventName] = nextIndex;
  //   const nextTime = (this.events[eventName].list[nextIndex][0] - this.getCurrentTime()) * 1000;
  //   this.queuePlaybackEvent(eventName, Math.max(nextTime, 0));
  // }

  setEvent(eventName: string, index: number) {
    const event = this.events[eventName];
    if (event == null) {
      return;
    }
    event.playbackAction(event.list[index][1], event.list[index][0]);
  }

  // setEventLegacy(index: number = this.eventIndex) {
  //   if (index > this.events.length - 1) {
  //     return;
  //   }
  //   const event = this.events[index][1];
  //   const [eventType] = event;
  //   switch (eventType) {
  //     case 'touchDown': {
  //       const [, x, y] = event;
  //       this.touchDown(new Point(x, y));
  //       break;
  //     }
  //     case 'touchUp':
  //       this.touchUp();
  //       break;
  //     case 'cursorMove': {
  //       const [, x: number, y: number] = event;
  //       this.cursorMove(new Point(x, y));
  //       break;
  //     }
  //     case 'startBeingMoved': {
  //       const [, elementPath] = event;
  //       const element = this.diagram.getElement(elementPath);
  //       if (element != null) {
  //         element.startBeingMoved();
  //       }
  //       break;
  //     }
  //     case 'moved': {
  //       const [, elementPath, transformDefinition] = event;
  //       const element = this.diagram.getElement(elementPath);
  //       if (element != null) {
  //         const transform = getTransform(transformDefinition);
  //         element.moved(transform);
  //       }
  //       break;
  //     }
  //     case 'click': {
  //       const [, id] = event;
  //       const element = document.getElementById(id);
  //       if (element != null) {
  //         element.click();
  //       }
  //       break;
  //     }
  //     case 'showCursor': {
  //       const [, x: number, y: number] = event;
  //       this.diagram.showCursor('up');
  //       this.cursorMove(new Point(x, y));
  //       break;
  //     }
  //     case 'hideCursor': {
  //       this.diagram.showCursor('hide');
  //       break;
  //     }

  //     // case 'cursorMoved': {
  //     //   const [, x, y] = event;
  //     //   this.
  //     // }
  //     case 'stopBeingMoved': {
  //       const [, elementPath, transformDefinition, velocityDefinition] = event;
  //       const element = this.diagram.getElement(elementPath);
  //       const transform = getTransform(transformDefinition);
  //       const velocity = getTransform(velocityDefinition);
  //       element.transform = transform;
  //       element.state.movement.velocity = velocity;
  //       element.stopBeingMoved();
  //       break;
  //     }
  //     case 'startMovingFreely': {
  //       const [, elementPath, transformDefinition, velocityDefinition] = event;
  //       const element = this.diagram.getElement(elementPath);
  //       const transform = getTransform(transformDefinition);
  //       const velocity = getTransform(velocityDefinition);
  //       element.simulateStartMovingFreely(transform, velocity);
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  // }

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
      this.isPlayingFinished();
      return;
    }
    this.setState(this.stateIndex);
    this.diagram.animateNextFrame();
    if (this.stateIndex + 1 === this.states.diffs.length) {
      this.isPlayingFinished();
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
    this.diagram.setState(state);
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
  //   this.diagram.animateNextFrame();

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
  // getCursorState,
};
