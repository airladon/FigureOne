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

type TypeStateDiff = [number, string, Object];

type TypeEvent = [
  number,
  (Array<number | string | Object> | string | number | Object),
  number,
];
type TypeEvents = Array<TypeEvent>;
type TypeStateDiffs = Array<TypeStateDiff>;


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

// function getTimeToIndex(
//   recordedData: TypeEvents | TypeStateDiffs,
//   eventIndex: number,
//   time: number,
// ) {
//   if (eventIndex === -1 || eventIndex > recordedData.length - 1) {
//     return -1;
//   }
//   const nextTime = recordedData[eventIndex][0];
//   return nextTime - time;
// }


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
      list: TypeEvents;
    };
  };

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

  stateTimeStep: number;      // in seconds
  diagram: {
    showCursor: ('up' | 'down' | 'hide', ?Point) => void,
    getElement: (string) => ?DiagramElement,
    pause: () => void,
    unpause: () => void,
    getState: () => Object,
    setState: (Object) => void,
    animateNextFrame: () => void,
  }

  // timeoutID: ?TimeoutID;

  timeoutID: ?TimeoutID;

  playbackStoppedCallback: ?() =>void;

  lastRecordTime: ?number;
  lastRecordTimeCount: number;

  audio: ?HTMLAudioElement;
  reference: string;

  static instance: Object;

  // All slides, events and states are relative to 0, where 0 is the start of a recording.
  // Slides, events and states do not have to have a 0 time, maybe the first event will not happen till 1s in
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

      this.diagram = {
        animateNextFrame: () => {},
        getElement: () => null,
        getState: () => {},
        setState: () => {},
        pause: () => {},
        unpause: () => {},
        showCursor: () => {},
      };
      this.audio = null;
      this.playbackStoppedCallback = null;
    }
    return Recorder.instance;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Time
  // ////////////////////////////////////
  // ////////////////////////////////////
  timeStamp() {   // eslint-disable-line class-methods-use-this
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
    }
    if (this.statesCache.diffs.length > 0) {
      [statesCacheTime] = this.statesCache.diffs[this.statesCache.diffs.length - 1];
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
    this.timeoutID = null;
    this.videoToNowDelta = 0;
    this.state = 'idle';
    this.isAudioPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.reference = '__base';
    this.lastRecordTimeCount = 0;
    this.lastRecordTime = null;
  }


  loadEvents(
    encodedEventsList: Object | Array<TypeEvents>,
    isMinified: boolean = false,
  ) { // $FlowFixMe
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
    let statesToUse: Object = statesIn;
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
    this.statesCache.baseReference = duplicate(this.states.baseReference);  // $FlowFixMe
    this.statesCache.references = duplicate(this.states.references);
    this.diagram.unpause();
    this.setVideoToNowDeltaTime(startTime);
    this.state = 'recording';
    this.lastRecordTime = null;
    this.duration = this.calcDuration();
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
    if (this.timeoutID != null) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
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
    // this.timeoutID[eventName] = null;
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
    if (now > this.duration) {
      this.duration = now;
    }
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
    // console.log(now, this.duration, performance.now(), this.videoToNowDelta)
    if (now > this.duration) {
      this.duration = now;
    }
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
    this.timeoutID = setTimeout(() => {
      recordAndQueue();
    }, time);
  }

  save() {
    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    const encodedStates = this.encodeStates();
    const encodedEvents = this.encodeEvents();
    if (encodedStates != null) {
      download(`${dateStr} ${location}.vidstates.json`, JSON.stringify(encodedStates));
    }
    if (encodedEvents != null) {
      download(`${dateStr} ${location}.videvents.json`, JSON.stringify(encodedEvents));
    }
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
    const duration = this.calcDuration();
    this.seek(duration * percentTime);
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
    this.setToTime(time);
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
      this.timeoutID = setTimeout(
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
    this.timeoutID = null;
  }

  pausePlayback() {
    this.diagram.pause();
    this.currentTime = this.getCurrentTime();
    this.state = 'idle';
    this.clearPlaybackTimeouts();
    const pointer = this.diagram.getElement('pointer');
    if (pointer != null) {
      pointer.hide();
    }
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }
    if (this.playbackStoppedCallback != null) {
      this.playbackStoppedCallback();
    }
  }


  setEvent(eventName: string, index: number) {
    const event = this.events[eventName];
    if (event == null) {
      return;
    }
    event.playbackAction(event.list[index][1], event.list[index][0]);
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
}

export {
  Recorder,
  getIndexOfEarliestTime,
  download,
  getIndexOfLatestTime,
  getNextIndexForTime,
  getPrevIndexForTime,
};
