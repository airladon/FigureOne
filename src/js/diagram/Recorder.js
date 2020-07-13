// @flow
// import type { Transform } from '../tools/g2';
import { Point } from '../tools/g2';
import { round } from '../tools/math';
import {
  duplicate, minify, unminify, joinObjects,
  ObjectTracker, download, SubscriptionManager,
} from '../tools/tools';
import GlobalAnimation from './webgl/GlobalAnimation';
import type { DiagramElement } from './Element';
import Worker from './recorder.worker.js';
import type Diagram from './Diagram';
import type { TypeScenarioVelocity } from './Animation/AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
// import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

type TypeStateDiff = [number, string, Object];

type TypeEvent = [
  number,
  (Array<number | string | Object> | string | number | Object),
  number,
];
type TypeEvents = Array<TypeEvent>;
type TypeStateDiffs = Array<TypeStateDiff>;

export type TypeOnPause = 'freeze' | 'complete' | 'completeBeforePause';
export type TypePauseSettings = {
  default?: TypeOnPause;
  animation?: TypeOnPause;
  pulse?: TypeOnPause;
  movingFreely?: TypeOnPause;
} | TypeOnPause;

export type TypeResumeSettings = {
  action: 'dissolve' | 'animate' | 'instant',
  duration?: number | {
    dissovlveOut: ?number,
    dissovlveIn: ?number,
    delay: ?number,
  },
  velocity?: TypeScenarioVelocity,
  maxTime?: number,
  minTime?: number,
  zeroDurationThreshold?: boolean,
  allDurationsSame?: boolean,
} | 'dissolve' | 'animate' | 'instant';

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

  subscriptions: SubscriptionManager;

  eventsToPlay: Array<string>;

  state: 'recording' | 'playing' | 'idle' | 'preparingToPlay' | 'preparingToPause';
  isAudioPlaying: boolean;
  videoToNowDelta: number;     // performance.now() - deltaToNow = video time
  currentTime: number;    // The current video time location
  duration: number;       // The duration of the video
  precision: number;      // The precision with which to record numbers

  stateIndex: number;
  eventIndex: {
    [eventName: string]: number;
  };

  pauseState: ?Object;
  startRecordingTime: number;

  stateTimeStep: number;      // in seconds
  diagram: Diagram;

  timeoutID: ?TimeoutID;

  // playbackStoppedCallback: ?() =>void;

  lastRecordTime: ?number;
  lastRecordTimeCount: number;

  audio: ?HTMLAudioElement;
  reference: string;
  referenceIndex: number;
  lastSeekTime: ?number;

  settings: {
    pause: TypePauseSettings,
    resume: TypeResumeSettings,
  };

  static instance: Object;

  // All slides, events and states are relative to 0, where 0 is the start of a recording.
  // Slides, events and states do not have to have a 0 time,
  // maybe the first event will not happen till 1s in
  constructor(singleton: boolean = false) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (singleton) {
      if (!Recorder.instance) {
        this.initialize();
      }
      return Recorder.instance;
    }
    this.initialize();
  }

  initialize() {
    this.events = {};
    this.eventsCache = {};
    this.reset();

    // default recording values
    this.precision = 4;
    this.stateTimeStep = 1;
    this.subscriptions = new SubscriptionManager();

    // this.diagram = {
    //   animateNextFrame: () => {},
    //   getElement: () => null,
    //   getState: () => {},
    //   setState: () => {},
    //   pause: () => {},
    //   unpause: () => {},
    //   showCursor: () => {},
    //   animateNextFrame: () => void,
    //   setState: (Object) => void,
    //   getState: ({ precision: number, ignoreShown: boolean }) => Object,
    //   getElement: (string) => ?DiagramElement,
    //   showCursor: ('up' | 'down' | 'hide', ?Point) => void,
    //   pause: () => void,
    //   unpause: () => void,
    //   getIsInTransition: () => boolean,
    //   animateToState: (Object, Object, ?(string | (() => void))) => void,
    //   isAnimating: () => boolean,
    //   setAnimationFinishedCallback: ?(string | (() => void)) => void,
    //   subscriptions: SubscriptionManager
    // };
    this.audio = null;
    // this.playbackStoppedCallback = null;
    this.worker = null;
    this.pauseState = null;
    this.settings = {
      pause: 'freeze',
      resume: 'instant',
    }
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Time
  // ////////////////////////////////////
  // ////////////////////////////////////
  timeStamp() {   // eslint-disable-line class-methods-use-this
    return new GlobalAnimation().now();
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
    Object.keys(this.events).forEach((eventName) => {
      this.events[eventName].list = [];
    });
    // this.events.list = [];
    this.eventsCache = {};
    this.stateIndex = -1;
    this.eventIndex = {};
    this.stopTimeouts();
    this.videoToNowDelta = 0;
    this.state = 'idle';
    this.isAudioPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.reference = '__base';
    this.lastRecordTimeCount = 0;
    this.lastRecordTime = null;
    this.eventsToPlay = [];
    this.lastSeekTime = null;
  }

  loadAudio(audio: HTMLAudioElement) {
    this.audio = audio;
    this.audio.onloadedmetadata = () => {
      this.duration = this.calcDuration();
    };
    this.subscriptions.trigger('audioLoaded');
  }

  loadEvents(
    encodedEventsList: Object | Array<TypeEvents>,
    isMinified: boolean = true,
  ) { // $FlowFixMe
    const lists = this.decodeEvents(encodedEventsList, isMinified);

    Object.keys(lists).forEach((eventName) => {
      if (this.events[eventName] == null) {
        return;
      }
      this.events[eventName].list = lists[eventName];
    });
    this.duration = this.calcDuration();
    this.subscriptions.trigger('eventsLoaded');
  }

  loadStates(
    statesIn: Object,
    isMinified: boolean = true,
    isObjectForm: boolean = true,
  ) {
    this.states = this.decodeStates(statesIn, isMinified, isObjectForm);
    this.duration = this.calcDuration();
    this.subscriptions.trigger('statesLoaded');
  }

  encodeEvents(
    minifyEvents: boolean = true,
  ) {
    const lists = {};
    const events = duplicate(this.events);
    Object.keys(events).forEach((eventName) => {
      lists[eventName] = events[eventName].list;
    });
    if (minifyEvents) {
      return minify(lists);
    }
    return duplicate(lists);
  }

  // eslint-disable-next-line class-methods-use-this
  decodeEvents(
    lists: Object,
    isMinified: boolean = true,
  ) {
    if (isMinified) {
      return unminify(lists);
    }
    return duplicate(lists);
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
  // Remove selected events in time range
  // set all state diffs to be the same in time range
  // eslint-disable-next-line class-methods-use-this
  clearListOrDiffs(
    listOrDiffs: TypeEvents | TypeStateDiffs,
    startTime: number,
    stopTime: number,
  ) {
    const startIndex = getNextIndexForTime(listOrDiffs, startTime);
    const stopIndex = getPrevIndexForTime(listOrDiffs, stopTime);
    let newListOrDiffs = [];
    if (startIndex > 0) {
      newListOrDiffs = listOrDiffs.slice(0, startIndex);
    }
    if (stopIndex > -1 && stopIndex + 1 <= listOrDiffs.length - 1) {
      newListOrDiffs = [...newListOrDiffs, ...listOrDiffs.slice(stopIndex + 1)];
    }
    return newListOrDiffs;
  }

  clear(startTime: number, stopTime: number) {
    Object.keys(this.events).forEach((eventName) => {
      const event = this.events[eventName];
      event.list = this.clearListOrDiffs(event.list, startTime, stopTime);
    });
    this.states.diffs = this.clearListOrDiffs(this.states.diffs, startTime, stopTime);
    // const copyStateIndex = getPrevIndexForTime(this.states.diffs, startTime);
    // const replaceStartIndex = getNextIndexForTime(this.states.diffs, startTime);
    // const replaceStopIndex = getPrevIndexForTime(this.states.diffs, startTime);
    // if (copyStateIndex === -1 || replaceStartIndex === -1 || replaceStopIndex === -1) {
    //   return;
    // }
    // const copy = duplicate(this.states.diffs[copyStateIndex]);
    // for (let i = replaceStartIndex; i <= replaceStopIndex; i += 1) {
    //   const [time] = this.states.diffs[i];
    //   this.states.diffs[i] = duplicate(copy);
    //   this.states.diffs[i][0] = time;
    // }
  }
  // deleteFromTime(time: number) {
  // }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Recording
  // ////////////////////////////////////
  // ////////////////////////////////////
  startRecording(fromTime: number = 0, whilePlaying: Array<string> = []) {
    // if (fromTime > 0) {
    this.state = 'recording';
    this.lastSeekTime = null;

    this.setVideoToNowDeltaTime(fromTime);
    if (this.states.diffs.length > 0) {
      this.setToTime(fromTime);
    }

    this.states.precision = this.precision;

    if (fromTime === 0 && this.states.baseReference == null) {
      this.states.setBaseReference(this.diagram.getState({
        precision: this.precision,
        ignoreShown: true,
      }));
    }

    this.startWorker();
    if (this.worker != null) {
      this.worker.postMessage({
        message: 'reset',
        payload: {
          baseReference: this.states.baseReference,
          references: this.states.references,
        },
      });
    }

    this.eventsCache = {};
    // this.slidesCache = [];
    // this.statesCache = new ObjectTracker(this.precision);
    // this.statesCache.baseReference = duplicate(this.states.baseReference);  // $FlowFixMe
    // this.statesCache.references = duplicate(this.states.references);
    this.diagram.unpause();
    // console.log('asdf3', this.diagram.getElement('a').animations.animations[0].steps[0].startTime)

    this.lastRecordTime = null;
    this.duration = this.calcDuration();

    this.queueRecordState(fromTime % this.stateTimeStep);

    this.eventsToPlay = whilePlaying;
    // this.initializePlayback(fromTime);
    this.startEventsPlayback(fromTime);
    this.startAudioPlayback(fromTime);
    this.subscriptions.trigger('startRecording');
    this.startRecordingTime = fromTime;
    // console.log('recorder is', this.state);
  }

  startWorker() {
    if (this.worker == null) {
      this.worker = new Worker();
      // this.worker.onmessage(event => console.log('from Worker: ', event.data))
      // this.worker.addEventListener("message", event => {
      //   const { message, payload } = event.data;
      //   // if (message === 'duration')
      //   if (message === 'cache') {
      //     this.statesCache.diffs = payload.diffs;
      //     this.statesCache.baseReference = payload.baseReference;
      //     this.statesCache.references = payload.references;
      //     this.mergeEventsCache();
      //     this.mergeStatesCache();
      //     this.duration = this.calcDuration();
      //     if (this.duration % 1 > 0) {
      //       const lastIndex = this.states.diffs.length - 1;
      //       const [, ref, diff] = this.states.diffs[lastIndex];
      //       this.states.diffs.push([Math.ceil(this.duration), ref, duplicate(diff), 0]);
      //     }
      //     this.duration = this.calcDuration();
      //     console.log(this)
      //   }
      // });
      this.worker.addEventListener('message', this.parseMessage.bind(this));
    }
    // this.worker = new Worker();
  }

  parseMessage(event) {
    const { message, payload } = event.data;
    // if (message === 'duration')
    if (message === 'cache') {
      this.statesCache = new ObjectTracker();
      this.statesCache.diffs = payload.diffs;
      this.statesCache.baseReference = payload.baseReference;
      this.statesCache.references = payload.references;
      this.mergeEventsCache();
      this.mergeStatesCache();
      this.duration = this.calcDuration();
      if (this.duration % 1 > 0) {
        const lastIndex = this.states.diffs.length - 1;
        const [, ref, diff] = this.states.diffs[lastIndex];
        this.states.diffs.push([Math.ceil(this.duration), ref, duplicate(diff), 0]);
      }
      this.duration = this.calcDuration();
      // console.log(this)
    }
  }

  // startWorker() {
  //   // if (this.worker != null) {
  //   //   return;
  //   // }
  //   // this.worker = new Worker('./worker.js');
  //   // this.worker.addEventListener("message", event => {
  //   //   console.log(event.data);
  //   // });
  //   // this.worker.postMessage([40, 2]);
  //   if (this.worker != null) {
  //     return;
  //   }
  //   this.worker = new Worker();

  //   // this.worker.postMessage([4, 5]);
  //   // this.worker.onmessage = function (event) {
  //   //   console.log('asdfasdf')
  //   // };

  //   this.worker.addEventListener("message", function (event) {
  //     console.log(event.data)
  //   });
  // }

  addCurrentStateAsReference() {
    this.referenceIndex += 1;
    this.reference = `ref${this.referenceIndex}`;
    const state = this.diagram.getState({
      precision: this.precision,
      ignoreShown: true,
    });
    if (this.state === 'recording') {
      // this.statesCache.addReference(state, this.reference);
      if (this.worker != null) {
        this.worker.postMessage({
          message: 'addReference',
          payload: {
            state,
            refName: this.reference,
            basedOn: '__base',
          },
        });
      }
    } else {
      this.states.addReference(state, this.reference);
    }
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
    // const startTime = this.getCacheStartTime();
    // const endTime = this.getCacheEndTime();
    const startTime = this.startRecordingTime;
    const endTime = this.currentTime;
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
    // console.log(sliceStart, sliceEnd)
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
    // Object.keys(this.eventsCache).forEach((eventName) => {
    //   const merged = this.getMergedCacheArray(
    //     this.events[eventName].list, this.eventsCache[eventName].list,
    //   );
    //   if (merged.length === 0) {
    //     return;
    //   }
    //   this.events[eventName].list = merged;
    // });
    const allEventNames = {};
    Object.keys(this.events).forEach((eventName) => {
      allEventNames[eventName] = null;
    });
    Object.keys(this.eventsCache).forEach((eventName) => {
      allEventNames[eventName] = null;
    });
    Object.keys(allEventNames).forEach((eventName) => {
      let eventsCacheList = [];
      if (this.eventsCache[eventName] != null) {
        eventsCacheList = this.eventsCache[eventName].list;
      }
      let eventsList = [];
      if (this.events[eventName] != null) {
        eventsList = this.events[eventName].list;
      }
      // console.log(eventName)
      const merged = this.getMergedCacheArray(
        eventsList, eventsCacheList,
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
    // this.states.baseReference = duplicate(this.statesCache.baseReference);
    this.states.references = duplicate(this.statesCache.references);
  }

  stopTimeouts() {
    if (this.timeoutID != null) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }
  }

  stopRecording() {
    this.currentTime = this.getCurrentTime();
    this.state = 'idle';
    this.stopTimeouts();

    this.worker.postMessage({ message: 'get' });
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }
    this.lastSeekTime = null;
    this.subscriptions.trigger('stopRecording');
    // this.mergeEventsCache();
    // this.mergeStatesCache();
    // this.duration = this.calcDuration();
    // if (this.duration % 1 > 0) {
    //   const lastIndex = this.states.diffs.length - 1;
    //   const [, ref, diff] = this.states.diffs[lastIndex];
    //   this.states.diffs.push([Math.ceil(this.duration), ref, duplicate(diff), 0]);
    // }
    // this.duration = this.calcDuration();
    // console.log(this)
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

  recordState(state: Object, time: number = this.getCurrentTime()) {
    // const now = this.now();
    const now = time;
    if (this.lastRecordTime == null || now > this.lastRecordTime) {
      this.lastRecordTime = now;
      this.lastRecordTimeCount = 0;
    }
    // const start = performance.now();
    // if (this.worker != null) {
    //   this.worker.postMessage(state);
    // }
    if (this.worker != null) {
      this.worker.postMessage({
        message: 'add',
        payload: {
          now,
          state,
          reference: this.reference,
          lastRecordTimeCount: this.lastRecordTimeCount,
        },
      });
    }
    // this.statesCache.add(now, state, this.reference, this.lastRecordTimeCount);
    // console.log('add', performance.now() - start);
    // this.duration = this.calcDuration();
    // if (now > this.duration) {
    //   this.duration = now;
    // }
    this.lastRecordTimeCount += 1;
    if (now > this.duration) {
      this.duration = now;
    }
  }

  recordCurrentState(time: number = this.getCurrentTime()) {
    // const start = performance.now();
    const state = this.diagram.getState({ precision: this.precision, ignoreShown: true });
    // const start1 = performance.now();
    // const str = JSON.stringify(state);
    // console.log('stringify', str.length, performance.now() - start);
    // console.log(state)
    // console.log(str)
    // const unStr = JSON.parse(str)
    // console.log(unStr)
    // console.log(unStr == state)
    this.recordState(state, time);
    // console.log('recordState', performance.now() - start);
  }

  recordCurrentStateAsReference(refName: string, basedOn: '__base') {
    const state = this.diagram.getState({
      precision: this.precision,
      ignoreShown: true,
    });
    if (this.worker != null) {
      this.worker.postMessage({
        message: 'addReference',
        payload: {
          state,
          refName,
          basedOn,
        },
      });
    }
    // this.statesCache.addReference(this.diagram.getState({
    //   precision: this.precision,
    //   ignoreShown: true,
    // }), refName, basedOn);
  }

  recordEvent(
    eventName: string,
    payload: Array<string | number | Object>,
    time: number = this.now(),
  ) {
    // console.log(time)
    if (this.events[eventName] == null) {
      return;
    }
    if (this.eventsCache[eventName] == null) {
      this.eventsCache[eventName] = {
        list: [],
      };
    }
    // const now = this.now();
    if (this.lastRecordTime == null || time > this.lastRecordTime) {
      this.lastRecordTime = time;
      this.lastRecordTimeCount = 0;
    }
    this.eventsCache[eventName].list.push(
      [time, payload, this.lastRecordTimeCount],
    );
    this.lastRecordTimeCount += 1;
    if (time > this.duration) {
      this.duration = time;
    }
  }

  // States are recorded every second
  queueRecordState(time: number = 0) {
    // console.log(time)
    const recordAndQueue = () => {
      if (this.state === 'recording') {
        if (this.diagram.getIsInTransition() === false) {
          this.recordCurrentState();
        }
        // console.log('recording', time, this.stateTimeStep - this.getCurrentTime() % this.stateTimeStep)
        this.queueRecordState(this.stateTimeStep - this.getCurrentTime() % this.stateTimeStep);
      }
    };
    if (round(time, 4) === 0) {
      recordAndQueue();
      return;
    }
    // if (time < 1) {
    //   return
    // }
    this.timeoutID = new GlobalAnimation().setTimeout(() => {
      recordAndQueue();
    }, round(time * 1000, 0));
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
    const toJsonHtml = (obj) => {
      let s = JSON.stringify(obj, null, 2);
      s = s.replace(/\n/g, '<br>');
      s = s.replace(/ /g, '&nbsp');
      return s;
    };
    const wnd = window.open('about:blank', '', '_blank');
    // this.slides.forEach((slide) => {
    //   wnd.document.write(JSON.stringify(slide), '<br>');
    // });

    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');

    // Object.keys(this.events).forEach((eventName) => {
    //   const event = this.events[eventName];
    //   // const rounded = event.map((e) => {
    //   //   if (typeof e === 'number') {
    //   //     return round(e, this.precision);
    //   //   }
    //   //   return e;
    //   // });
    //   wnd.document.write('<br><br>');
    //   wnd.document.write(`${eventName}`);
    //   wnd.document.write(JSON.stringify(event, null, 2), '<br>');
    // });
    wnd.document.write(toJsonHtml(this.events), '<br>');
    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');
    wnd.document.write(toJsonHtml(this.states.diffs), '<br>');
    wnd.document.write(toJsonHtml(this.states.references), '<br>');
    // this.states.diffs.forEach((state) => {
    //   wnd.document.write(JSON.stringify(state, null, 2), '<br>');
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
    this.pauseState = null;
    let time = timeIn;
    if (time < 0) {
      time = 0;
    }
    if (this.states.diffs.length === 0) {
      return;
    }
    if (this.state === 'recording') {
      this.stopRecording();
    } else if (this.state === 'playing') {
      this.pausePlayback(false);
    }
    // console.log(time)
    this.setToTime(time);
    this.diagram.pause();
  }

  setToTime(timeIn: number) {
    // console.log(timeIn)
    // if (this.states.diffs.length === 0) {
    //   return;
    // }
    if (timeIn === 0 && this.states.diffs.length > 0) {
      this.stateIndex = 0;
    } else {
      this.stateIndex = getPrevIndexForTime(this.states.diffs, timeIn);
    }
    // console.log(this.stateIndex)
    let stateTime = 0;
    let stateTimeCount = 0;
    if (this.stateIndex !== -1) {
      [stateTime, , , stateTimeCount] = this.states.diffs[this.stateIndex];
    }

    if (stateTime === this.lastSeekTime) {
      return;
    }
    const time = stateTime;

    this.lastSeekTime = stateTime;

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
      const lastIndex = getIndexOfLatestTime(
        event.list,
        getPrevIndexForTime(event.list, timeIn),
      );
      // const lastIndex = getIndexOfLatestTime(event.list, firstIndex);
      for (let i = firstIndex; i <= lastIndex; i += 1) {
        const [eventTime, , timeCount] = event.list[i];
        if (
          this.stateIndex === -1
          || eventTime < stateTime
          || (eventTime === stateTime && timeCount < stateTimeCount)
        ) {
          eventsToSetBeforeState.push([eventName, i, eventTime, timeCount]);
        } else if (
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
    // console.log(this.stateIndex)
    if (this.stateIndex !== -1) {
      this.setState(this.stateIndex);
    }
    playEvents(eventsToSetAfterState);
    if (this.audio) {
      this.audio.currentTime = time;
    }
    this.currentTime = time;

    this.setCursor(time);
    this.diagram.animateNextFrame();
    // console.log(this.diagram.getElement('a').getRotation())
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
  startPlayback(fromTimeIn: number = this.lastSeekTime, events: ?Array<string> = null) {
    let fromTime = fromTimeIn;
    if (fromTimeIn == null || fromTimeIn >= this.duration) {
      fromTime = 0;
    }
    if (events == null) {
      this.eventsToPlay = Object.keys(this.events);
    } else {
      this.eventsToPlay = events;
    }

    this.state = 'playing';
    this.setVideoToNowDeltaTime(fromTime);
    this.currentTime = fromTime;
    this.diagram.unpause();
    this.setToTime(fromTime);
    this.startEventsPlayback(fromTime);
    this.startAudioPlayback(fromTime);
    this.diagram.animateNextFrame();
    if (this.areEventsPlaying() === false && this.isAudioPlaying === false) {
      this.finishPlaying();
      // return;
    }
    this.subscriptions.trigger('playbackStarted');
  }

  getResumeSettings() {
    let onResume = {
      action: 'instant',
      maxTime: 6,
      velocity: {
        position: 2,
        rotation: Math.PI * 2 / 2,
        scale: 1,
        opacity: 0.8,
        color: 0.8,
      },
      allDurationsSame: true,
      zeroDurationThreshold: 0.00001,
      minTime: 0,
      duration: null,
    }
    // console.log(resumeSettings)
    if (typeof this.settings.resume === 'string') {
      onResume.action = this.settings.resume;
    } else {
      onResume = joinObjects({}, onResume, this.settings.resume);
      // velocity trumps duration by default, but if only duration is defined by the
      // user, then remove velocity;
      // if (this.settings.resume.duration != null && this.settings.resume.velocity == null) {
      //   onResume.velocity = undefined;
      // }
    }
    if (onResume.action === 'dissolve') {
      const defaultDuration = {
        dissolveIn: 0.8,
        dissolveOut: 0.8,
        delay: 0.2,
      }
      if (onResume.duration == null) {
        onResume.duration = defaultDuration;
      } else if (typeof onResume.duration === 'number') {
        onResume.duration = {
          dissolveOut: onResume.duration / 10 * 4.5,
          dissolveIn: onResume.duration / 10 * 4.5,
          delay: onResume.duration / 10 * 1,
        }
      } else {
        onResume.duration = joinObjects({}, defaultDuration, onResume.duration);
      }
    } else if (onResume.duration != null && typeof onResume.duration !== 'number') {
      onResume.duration = 1;
    }
    return onResume;
  }

  resumePlayback() {
    if (this.pauseState == null) {
      this.startPlayback(this.currentTime);
      return;
    }
    const resumeSettings = this.getResumeSettings();
    // const defaultOptions = {
    //   maxTime: 1,
    //   minTime: 0,
    //   dissolve: false,
    //   delay: 0.2,
    // }
    // const options = joinObjects({}, defaultOptions, optionsIn);
    // if (options.dissolve && options.duration == null) {
    //   options.duration = 0.8;
    // }
    this.diagram.unpause();
    let finishedFlag = false;
    const finished = () => {
      finishedFlag = true;
      this.diagram.setState(this.pauseState);
      this.state = 'playing';
      this.setVideoToNowDeltaTime(this.currentTime);
      this.startEventsPlayback(this.currentTime);
      this.startAudioPlayback(this.currentTime);
      this.diagram.animateNextFrame();
      if (this.areEventsPlaying() === false && this.isAudioPlaying === false) {
        this.finishPlaying();
      }
      this.subscriptions.trigger('playbackStarted');
    };

    if (resumeSettings.action === 'instant' || this.diagram.elements.isStateSame(this.pauseState.elements, true)) {
      // this.diagram.stop();
      // this.diagram.elements.clearFrozenPulseTransforms();
      finished();
      return;
    }
    // const id = this.diagram.subscriptions.subscribe('animationsFinished', finished, 1);
    if (resumeSettings.action === 'dissolve') {
      debugger;
      this.diagram.elements.freezePulseTransforms(false);
      this.diagram.stop();
      this.diagram.dissolveToState({
        state: this.pauseState,
        dissolveInDuration: resumeSettings.duration.dissolveIn,
        dissolveOutDuration: resumeSettings.duration.dissolveOut,
        done: finished,
        delay: resumeSettings.duration.delay,
        startTime: 'now',
      });
    } else {
      this.diagram.stop();
      debugger;
      this.diagram.animateToState(
        this.pauseState,
        resumeSettings,
        finished,
        'now',
      );
    }

    // if (this.diagram.isAnimating() && !finishedFlag) {
    // console.log(finishedFlag)
    if (!finishedFlag) {
      this.state = 'preparingToPlay';
      this.subscriptions.trigger('preparingToPlay');
    }
    // if (animationCount === 0) {
    //   this.diagram.subscriptions.unsubscribe('animationsFinished', id);
    //   finished();
    // }
  }

  // initializePlayback(fromTime: number) {
  //   this.currentTime = fromTime;
  //   this.diagram.unpause();
  //   this.setToTime(fromTime);
  //   this.startEventsPlayback(fromTime);
  //   this.startAudioPlayback(fromTime);
  // }

  startAudioPlayback(fromTime: number) {
    if (this.audio) {
      this.isAudioPlaying = true;
      this.audio.currentTime = fromTime;
      this.audio.play();
      const audioEnded = () => {
        this.isAudioPlaying = false;
        if (this.state === 'playing') {
          this.finishPlaying();
        }
      };
      const { audio } = this;
      if (audio != null) {
        audio.removeEventListener('ended', audioEnded.bind(this), false);
        audio.addEventListener('ended', audioEnded.bind(this), false);
      }
    }
  }

  startEventsPlayback(fromTime: number) {
    this.eventsToPlay.forEach((eventName) => {
      if (this.events[eventName].list.length === 0) {
        return;
      }
      const event = this.events[eventName];
      let index = getNextIndexForTime(event.list, fromTime);
      if (index === -1) {
        this.eventIndex[eventName] = -1;
        return;
      }
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
    const nextEventName = this.getNextEvent();
    if (this.events[nextEventName] != null) {
      this.playbackEvent(nextEventName);
    }
  }

  getNextEvent() {
    let nextEventName = '';
    let nextTime = null;
    let nextTimeCount = null;
    this.eventsToPlay.forEach((eventName) => {
      if (
        this.eventIndex[eventName] == null
        || this.eventIndex[eventName] === -1
        || this.events[eventName].list.length <= this.eventIndex[eventName]
      ) {
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
    const index = this.eventIndex[eventName];
    const delay = this.events[eventName].list[index][0] - this.getCurrentTime();

    if (delay > 0.0001) {
      this.timeoutID = new GlobalAnimation().setTimeout(
        this.playbackEvent.bind(this, eventName), round(delay * 1000, 0),
      );
      return;
    }

    // const index = this.eventIndex[eventName];
    this.setEvent(eventName, index);
    this.diagram.animateNextFrame();
    if (index + 1 === this.events[eventName].list.length) {
      this.eventIndex[eventName] = -1;
      if (this.areEventsPlaying() === false && this.isAudioPlaying === false) {
        this.finishPlaying();
        return;
      }
    } else {
      this.eventIndex[eventName] = index + 1;
    }
    const nextEvent = this.getNextEvent();
    if (nextEvent != null && this.events[nextEvent]) {
      this.playbackEvent(nextEvent);
    }
  }

  areEventsPlaying() {
    // const eventNames = Object.keys(this.eventIndex)
    for (let i = 0; i < this.eventsToPlay.length; i += 1) {
      const eventName = this.eventsToPlay[i];
      if (
        this.eventIndex[eventName] < this.events[eventName].list.length
        && this.eventIndex[eventName] > -1
      ) {
        return true;
      }
    }
    return false;
  }

  finishPlaying() {
    if (this.areEventsPlaying()) {
      return false;
    }

    const remainingTime = this.duration - this.getCurrentTime();
    if (remainingTime > 0.0001) {
      this.timeoutID = new GlobalAnimation().setTimeout(() => {
        this.finishPlaying();
      }, round(remainingTime * 1000, 0));
      return false;
    }

    if (this.isAudioPlaying) {
      return false;
    }
    this.pausePlayback();
    return true;
  }

  // clearPlaybackTimeouts() {
  //   this.timeoutID = null;
  // }

  // animateToState() {

  // }

  // On pause, animations and pauses can complete and clear:
  // Complete  Clear
  // True      True     Animations finish and nextFrame nothing will happen
  // True      False    Animations finish and nextFrame nothing will happen
  //                    as by completing animations they will naturally clear
  // False     True     Animations freeze and nextFrame nothing will happen
  // False     False    Animations freeze and nextFrame will continue
  //
  // Pulse
  // True      True     Pulse finish and nextFrame nothing will happen
  // True      False    Pulse finish and nextFrame nothing will happen
  //                    as by completing animations they will naturally clear
  // False     True     Pulse freeze and nextFrame nothing will happen
  // False     False    Pulse freeze and nextFrame will continue
  pausePlayback() {
    this.currentTime = this.getCurrentTime();

    this.pauseState = this.diagram.getState({
      precision: this.precision,
      ignoreShown: true,
    });

    const pause = () => {
      this.state = 'idle';
      this.subscriptions.trigger('playbackStopped');
      this.diagram.stop();
    };
    this.stopTimeouts();
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }

    this.diagram.subscriptions.subscribe('paused', pause, 1);
    this.diagram.pause(this.settings.pause);
    if (this.diagram.getPauseState() === 'preparingToPause') {
      this.subscriptions.trigger('preparingToPause');
      this.state = 'preparingToPause';
      // console.log('recorder prep to pause')
      // this.diagram.subscriptions.subscribe('animationsFinished', pause, 1);
    }
    // if (this.diagram.isAnimating()) {
    //   this.subscriptions.trigger('preparingToPause');
    //   this.state = 'preparingToPause';
    //   // console.log('recorder prep to pause')
    //   this.diagram.subscriptions.subscribe('animationsFinished', pause, 1);
    // } else {
    //   pause();
    // }
  }


  setEvent(eventName: string, index: number) {
    const event = this.events[eventName];
    if (event == null) {
      return;
    }
    event.playbackAction(event.list[index][1], event.list[index][0]);
  }


  // queuePlaybackState(delay: number = 0) {
  //   const incrementIndexAndPlayState = () => {
  //     if (this.state === 'playing') {
  //       this.stateIndex += 1;
  //       this.playbackState();
  //     }
  //   }
  //   if (delay === 0) {
  //     incrementIndexAndPlayState();
  //     return;
  //   }
  //   this.nextStateTimeout = setTimeout(incrementIndexAndPlayState, delay);
  // }

  // playbackState() {
  //   if (this.stateIndex > this.states.diffs.length - 1) {
  //     this.finishPlaying();
  //     return;
  //   }
  //   this.setState(this.stateIndex);
  //   this.diagram.animateNextFrame();
  //   if (this.stateIndex + 1 === this.states.diffs.length) {
  //     this.finishPlaying();
  //     return;
  //   }
  //   const nextTime = (this.states.diffs[this.stateIndex + 1][0] - this.getCurrentTime()) * 1000;
  //   this.queuePlaybackState(nextTime);
  // }

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
