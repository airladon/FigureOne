// @flow
// import type { Transform } from '../tools/g2';
import { Point } from '../../tools/g2';
import { round } from '../../tools/math';
import {
  duplicate, minify, unminify, joinObjects,
  ObjectTracker, download, SubscriptionManager, // PerformanceTimer,
} from '../../tools/tools';
import GlobalAnimation from '../webgl/GlobalAnimation';
// import type { FigureElement } from './Element';
import Worker from './recorder.worker';
import type Figure from '../Figure';
import type { OBJ_ScenarioVelocity } from '../Animation/AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
// import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

type TypeStateDiff = [number, string, Object];

type TypeEventPayload = number | string | Object;
type TypeEvent = [
  number,
  Array<TypeEventPayload>,
  number,
];
type TypeEvents = Array<TypeEvent>;
type TypeStateDiffs = Array<TypeStateDiff>;


export type TypePauseSettings = 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete';

export type TypePlaySettings = {
  how: 'dissolve' | 'animate' | 'instant',
  duration?: number | {
    dissovlveOut: ?number,
    dissovlveIn: ?number,
    delay: ?number,
  },
  velocity?: OBJ_ScenarioVelocity,
  maxDuration?: number,
  // minDuration?: number,
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

function getMostRecentForTime(
  recordedData: Array<TypeEvents | TypeStateDiffs>,
  time: number,
) {
  let latestTime = null;
  let latestEventOrState = null;
  recordedData.forEach((data) => {
    // console.log(data)
    const index = getPrevIndexForTime(data, time);
    if (index < 0) {
      return;
    }
    const t = data[index][0];
    if (latestTime == null) {
      latestTime = t;
      latestEventOrState = data[index];
    } else if (t > latestTime) {
      latestTime = t;
      latestEventOrState = data[index];
    }
  });
  return latestEventOrState;
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

/**
 * The Recorder class provides functionality to record and playback video like
 * experiences. It can:
 *
 * - record and playback events, such as function calls, mouse movements, mouse
 *   clicks and slide navigation - these can either be recorded by a user, or
 *   programmed for specific times
 * - overlay an audio track on playback
 * - record entire figure state at regular intervals (like 1 second) as seek
 *   frames for the video
 * - allow a user to pause video at any time and interact with the figure in its
 *   current state - on resuming playback, the figure will revert to its paused
 *   state
 *
 * For performance during recording, a separate javascript worker is used to
 * parallelize state encoding. Therefore, in addition to the FigureOne library,
 * a FigureOne worker file will need to be loaded. See the tutorials for
 * examples on how this is done.
 *
 * For tutorials and examples of how to use Recorder, see
 *
 * - <a href="https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2015%20-%20-Recorder%20Introduction/index.html">Tutorial 15 - Recorder Introduction</a>
 * - [Tutorial 16 - Recording Manual Events](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2016%20-%20-Recording%20Manual%20Events/index.html)
 * - [Tutorial 17 - Recording Slides](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2017%20-%20-Recording%20Slides/index.html)
 * - [Tutorial 18 - Recording Planned Events](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2018%20-%20-Recording%20Planned%20Events/index.html)
 * - [Trig 1 - Trig Functions](https://github.com/airladon/FigureOne/docs/examples/Trig%201%20-%20Trig%20Functions/index.html)
 * - [Trig 2 - Names](https://github.com/airladon/FigureOne/docs/examples/Trig%202%20-%20Names/index.html)
 * - [Trig 3 - Relationships](https://github.com/airladon/FigureOne/docs/examples/Trig%203%20-%20Relationships/index.html)
 *
 * Notifications - The subscription manager property `subscriptions` will
 * publish the following events:
 * - `timeUpdate`: updated at period defined in property `timeUpdates`
 * - `durationUpdated`: updated whenever audio or video are loaded, or when
 *    recording goes beyond the current duration
 * - `audioLoaded`
 * - `videoLoaded`
 * - `recordingStarted`
 * - `recordingStopped`
 * - `preparingToPlay`
 * - `playbackStarted`
 * - `preparingToPause`
 * - `playbackStopped`
 * - `seek`
 * - `recordingStatesComplete` - recording completed and recorded states ready
 *
 * @class
 *
 * @property {'recording' | 'playing' | 'idle' | 'preparingToPlay' | 'preparingToPause'} state
 * @property {boolean} isAudioPlaying
 * @property {number} duration in seconds
 * @property {number} stateTimeStep in seconds - change this to change the
 * duration between recorded seek frames
 * @property {number} timeUpdates in seconds - how often to publish the
 * 'timeUpdate' notification
 * @property {SubscriptionManager} subscriptions - use to subscribe to
 * notifications
 */
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

  recordingStates: boolean;
  // useAutoEvents: boolean;

  pauseState: ?Object;
  startRecordingTime: number;

  queueSeekId: null | TimeoutID;
  queueSeekTime: number;

  stateTimeStep: number;      // in seconds
  figure: Figure;

  timeoutID: ?number;
  timeUpdatesTimeoutID: ?TimeoutID;

  // playbackStoppedCallback: ?() =>void;

  lastRecordTime: ?number;
  lastRecordTimeCount: number;

  audio: ?HTMLAudioElement;
  reference: string;
  referenceIndex: number;
  lastSeekTime: ?number;
  timeUpdates: number;  // milliseconds

  settings: {
    pause: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete',
    play: TypePlaySettings,
  };

  worker: ?(typeof Worker);

  // static instance: Object;

  timeKeeper: GlobalAnimation;

  // All slides, events and states are relative to 0, where 0 is the start of a recording.
  // Slides, events and states do not have to have a 0 time,
  // maybe the first event will not happen till 1s in
  // constructor(singleton: boolean = false) {
  //   // If the instance alread exists, then don't create a new instance.
  //   // If it doesn't, then setup some default values.
  //   if (singleton) {
  //     if (!Recorder.instance) {
  //       this.initialize();
  //     }
  //     return Recorder.instance;
  //   }
  //   this.initialize();
  // }
  constructor(timeKeeper: GlobalAnimation) {
    this.timeKeeper = timeKeeper;
    this.initialize();
  }

  initialize() {
    this.subscriptions = new SubscriptionManager();
    this.events = {};
    this.eventsCache = {};
    this.reset();
    // default recording values
    this.precision = 8;
    this.stateTimeStep = 1;
    this.audio = null;
    // this.playbackStoppedCallback = null;
    this.worker = null;
    this.pauseState = null;
    this.settings = {
      pause: 'freeze',
      play: 'instant',
    };
    this.queueSeekTime = 0;
    this.queueSeekId = null;
    // this.useAutoEvents = false;
    this.timeUpdates = 100; // ms
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Time
  // ////////////////////////////////////
  // ////////////////////////////////////
  timeStamp() {   // eslint-disable-line class-methods-use-this
    return this.timeKeeper.now();
  }

  now() {   // eslint-disable-line class-methods-use-this
    return round((this.timeStamp() - this.videoToNowDelta) / 1000, 8);
  }

  /**
   * Current time in seconds
   * @return {number} seconds
   */
  getCurrentTime() {
    if (this.state !== 'idle') {
      return this.now();
    }
    return this.currentTime;
  }

  getDeltaTime(delta: number = 0) {
    const currentTime = this.getCurrentTime();
    const newTime = currentTime + delta;
    if (newTime > this.duration) {
      return this.duration;
    }
    if (newTime < 0) {
      return 0;
    }
    return newTime;
  }

  setCurrentTime(time: number) {
    this.currentTime = time;
    this.subscriptions.publish('timeUpdate', [time]);
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
        // console.log(eventsTime, eventName, event.list[event.list.length - 1])
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
    // this.currentTime = 0;
    this.setCurrentTime(0);
    this.duration = 0;
    this.reference = '__base';
    this.lastRecordTimeCount = 0;
    this.lastRecordTime = null;
    this.eventsToPlay = [];
    this.lastSeekTime = null;
    this.referenceIndex = 0;
  }

  loadAudioTrack(audio: HTMLAudioElement) {
    this.audio = audio;
    this.audio.onloadedmetadata = () => {
      this.duration = this.calcDuration();
      this.subscriptions.publish('durationUpdated', this.duration);
    };
    this.audio.oncanplaythrough = () => {
      this.subscriptions.publish('audioLoaded');
    };
  }

  loadEvents(
    encodedEventsList: Object | Array<TypeEvents>,
    isMinified: boolean = true,
  ) { // $FlowFixMe
    const lists = this.decodeEvents(encodedEventsList, isMinified);

    // Loading, Decoding, Enconding events and states is a flow mess
    // $FlowFixMe
    Object.keys(lists).forEach((eventName) => {
      if (this.events[eventName] == null) {
        return;
      }  // $FlowFixMe
      this.events[eventName].list = lists[eventName];
    });
    this.duration = this.calcDuration();
    this.subscriptions.publish('eventsLoaded');
    this.subscriptions.publish('durationUpdated', this.duration);
  }

  loadStates(
    statesIn: Object,
    isMinified: boolean = true,
    isObjectForm: boolean = true,
  ) {
    this.states = this.decodeStates(statesIn, isMinified, isObjectForm);
    this.duration = this.calcDuration();
    this.subscriptions.publish('statesLoaded');
    this.subscriptions.publish('durationUpdated', this.duration);
  }

  loadSavedData(
    combined: Object,
  ) {
    this.loadStates(combined.states, true, true);
    this.loadEvents(combined.events, true);
    this.subscriptions.publish('videoLoaded');
  }

  encodeEvents(
    minifyEvents: boolean = true,
  ) {
    const lists = {};
    const events = duplicate(this.events);
    // $FlowFixMe
    Object.keys(events).forEach((eventName) => {  // $FlowFixMe
      if (!eventName.startsWith('_auto')) {  // $FlowFixMe
        lists[eventName] = events[eventName].list;
      }
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
    if (startIndex > 0) { // $FlowFixMe
      newListOrDiffs = listOrDiffs.slice(0, startIndex);
    }
    if (stopIndex > -1 && stopIndex + 1 <= listOrDiffs.length - 1) {
      newListOrDiffs = [...newListOrDiffs, ...listOrDiffs.slice(stopIndex + 1)];
    }
    return newListOrDiffs;
  }

  clear(startTime: number, stopTime: number) {
    Object.keys(this.events).forEach((eventName) => {
      const event = this.events[eventName]; // $FlowFixMe
      event.list = this.clearListOrDiffs(event.list, startTime, stopTime);
    }); // $FlowFixMe
    this.states.diffs = this.clearListOrDiffs(this.states.diffs, startTime, stopTime);
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Recording
  // ////////////////////////////////////
  // ////////////////////////////////////
  /**
   * Start Recording
   * @param {number} fromTime when to start recording from in seconds (0)
   * @param {Array<string>} whilePlaying events to play while recording ([])
   * @param {boolean} includeStates record states as well as events (`true`)
   */
  startRecording(
    fromTime: number = 0,
    whilePlaying: Array<string> = [],
    includeStates: boolean = true,
  ) {
    this.state = 'recording';
    this.lastSeekTime = null;
    this.setVideoToNowDeltaTime(fromTime);
    if (this.states.diffs.length > 0) {
      this.setToTime(fromTime, true);
    }

    this.states.precision = this.precision;

    if (fromTime === 0 && this.states.baseReference == null) {
      this.states.setBaseReference(this.figure.getState({
        precision: this.precision,
        ignoreShown: true,
      }));
    }

    if (includeStates) {
      this.recordingStates = true;
    } else {
      this.recordingStates = false;
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

    this.lastRecordTime = null;
    this.duration = this.calcDuration();

    if (this.recordingStates) {
      this.queueRecordState(fromTime % this.stateTimeStep);
    }

    this.eventsToPlay = whilePlaying;
    // this.initializePlayback(fromTime);
    this.startEventsPlayback(fromTime);
    const audioStarted = this.startAudioPlayback(fromTime);
    this.subscriptions.publish('recordingStarted');
    this.startRecordingTime = fromTime;
    this.startTimeUpdates();
    if (!audioStarted) {
      this.pausePlayback();
    }
    // console.log('recorder is', this.state);
  }

  /**
   * Initiate states recording to generate seek frames. Any existing states
   * will be removed before starting, so the initial state at time 0 must be in
   * place (usually this means only start states recording when the figure is
   * first created and not after any changes to the initial state have been
   * made)
   *
   * @param {number} frameTime time between draw frames in seconds. It can be
   * sometimes be useful to have draw frames happen more frequently than the
   * seek frames [0.1s]
   */
  startStatesRecording(
    // fromTime: number = 0,
    // whilePlaying: Array<string> = [],
    // includeStates: boolean = true,
    frameTime: number = 0.1,
  ) {
    this.states.reset();
    this.seek(0);
    this.figure.globalAnimation.setManualFrames();
    // const { duration } = this;
    // this.states.reset();
    this.startRecording(0, Object.keys(this.events), true);
    // this.duration = duration;
    this.autoFrame(frameTime);
    // console.log('recorder is', this.state);
  }

  autoFrame(frameTime: number = 0.1) {
    // console.log(this.state)
    if (this.state === 'recording') {
      this.figure.animateNextFrame();
      this.figure.globalAnimation.frame(frameTime);
      if (this.getCurrentTime() <= this.duration) {
        // console.log('auto')
        setTimeout(
          this.autoFrame.bind(this, frameTime),
          5,
        );
      } else {
        // console.log('stopping')
        this.stopStatesRecording();
      }
    } else {
      this.stopStatesRecording();
    }
  }

  startWorker() {
    if (this.worker == null) {
      this.worker = new Worker();
      this.worker.addEventListener('message', this.parseMessage.bind(this));
    }
  }

  // $FlowFixMe
  parseMessage(event) {
    const { message, payload } = event.data;
    // if (message === 'duration')
    if (message === 'cache') {
      this.statesCache = new ObjectTracker();
      this.statesCache.diffs = payload.diffs;
      this.statesCache.baseReference = payload.baseReference;
      this.statesCache.references = payload.references;
      // console.log(payload)
      this.mergeEventsCache();
      this.mergeStatesCache();
      this.duration = this.calcDuration();
      if (this.recordingStates) {
        if (this.duration % 1 > 0) {
          const lastIndex = this.states.diffs.length - 1;
          const [, ref, diff] = this.states.diffs[lastIndex];
          this.states.diffs.push([Math.ceil(this.duration), ref, duplicate(diff), 0]);
          if (Math.ceil(this.duration) > this.duration) {
            const atEnd = this.duration <= this.getCurrentTime();
            this.duration = Math.ceil(this.duration);
            this.subscriptions.publish('durationUpdated', this.duration);
            if (atEnd) {
              this.setCurrentTime(this.duration);
              this.subscriptions.publish('timeUpdate', [this.duration]);
            }
          }
        }
        this.subscriptions.publish('recordingStatesComplete');
      }
      this.duration = this.calcDuration();
    }
  }

  addCurrentStateAsReference() {
    if (this.state === 'recording') {
      this.referenceIndex += 1;
      this.reference = `ref${this.referenceIndex}`;
      const state = this.figure.getState({
        precision: this.precision,
        ignoreShown: true,
      });
      if (this.worker != null) {
        // console.log('posting')
        this.worker.postMessage({
          message: 'addReference',
          payload: {
            state,
            refName: this.reference,
            basedOn: '__base',
          },
        });
      } else {
        this.states.addReference(state, this.reference);
      }
    }
  }

  getCacheStartTime() {
    let time = null;
    if (this.statesCache.diffs.length > 0) {
      time = this.statesCache.diffs[0][0];  // eslint-disable-line prefer-destructuring
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
      const merged = this.getMergedCacheArray(  // $FlowFixMe
        eventsList, eventsCacheList,
      );
      if (merged.length === 0) {
        return;
      }
      // $FlowFixMe
      this.events[eventName].list = merged;
    });
  }

  mergeStatesCache() {
    if (!this.recordingStates) {
      return;
    }
    const merged = this.getMergedCacheArray(    // $FlowFixMe
      this.states.diffs, this.statesCache.diffs,
    );
    if (merged.length === 0) {
      return;
    }   // $FlowFixMe
    this.states.diffs = merged;
    // this.states.baseReference = duplicate(this.statesCache.baseReference);
    // $FlowFixMe
    this.states.references = duplicate(this.statesCache.references);
  }

  stopTimeouts() {
    this.timeKeeper.clearTimeout(this.timeoutID);
    this.timeKeeper.clearTimeout(this.timeUpdatesTimeoutID);
    this.timeoutID = null;
    this.timeUpdatesTimeoutID = null;
  }

  /**
   * Stop Recording
   */
  stopRecording() {
    // this.currentTime = this.getCurrentTime();
    this.setCurrentTime(this.getCurrentTime());
    this.state = 'idle';
    this.stopTimeouts();

    // $FlowFixMe
    if (this.worker != null) {
      this.worker.postMessage({ message: 'get' });
    }
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }
    this.lastSeekTime = null;
    this.subscriptions.publish('recordingStopped');
  }

  /**
   * Cancel the states recording.
   *
   * Use this only for cancelling recording as states recording will be
   * automatically stopped if the event and audio duration has been reached.
   */
  stopStatesRecording() {
    this.stopRecording();
    this.figure.globalAnimation.endManualFrames();
  }

  addEventType(
    eventName: string,
    playbackAction: (any) => void,
    setOnSeek: boolean = true,
  ) {
    this.events[eventName] = {
      setOnSeek,
      list: [],
      playbackAction,
    };
    this.eventIndex[eventName] = -1;
  }

  recordState(state: Object, time: number = this.getCurrentTime()) {
    const now = time;
    if (this.lastRecordTime == null || now > this.lastRecordTime) {
      this.lastRecordTime = now;
      this.lastRecordTimeCount = 0;
    }
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
    this.lastRecordTimeCount += 1;
    if (now > this.duration && this.figure.globalAnimation.manual === false) {
      this.duration = now;
      this.subscriptions.publish('durationUpdated', this.duration);
    }
  }

  recordCurrentState(time: number = this.getCurrentTime()) {
    const state = this.figure.getState({ precision: this.precision, ignoreShown: true });
    this.recordState(state, time);
  }

  recordCurrentStateAsReference(refName: string, basedOn: string = '__base') {
    const state = this.figure.getState({
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
    // this.statesCache.addReference(this.figure.getState({
    //   precision: this.precision,
    //   ignoreShown: true,
    // }), refName, basedOn);
  }

  recordEvent(
    eventName: string,
    payload: Array<string | number | Object>,
    time: number = this.getCurrentTime(),
  ) {
    // console.log('record event', eventName)
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
    if (time > this.duration && this.figure.globalAnimation.manual === false) {
      this.duration = time;
      this.subscriptions.publish('durationUpdated', this.duration);
    }
  }

  // States are recorded every second
  queueRecordState(time: number = 0) {
    // console.log(time)
    const recordAndQueue = () => {
      if (this.state === 'recording') {
        // if (this.figure.getIsInTransition() === false) {
        this.recordCurrentState();
        // }
        this.queueRecordState(this.stateTimeStep - this.getCurrentTime() % this.stateTimeStep);
      }
    };
    if (round(time, 10) === 0) {
      recordAndQueue();
      return;
    }
    // if (time < 1) {
    //   return
    // }
    this.timeoutID = this.timeKeeper.setTimeout(() => {
      recordAndQueue();
    }, round(time * 1000, 10), 'state', true);
  }

  /**
   * Save events and states to video-track json file
   */
  save() {
    const dateStr = new Date().toISOString().split('.')[0].split('-').join('_');
    // const location = (window.location.pathname).replace('/', '_');
    const location = window.location.pathname.split('/').slice(1, -1).join('_');
    const encodedStates = this.encodeStates();
    const encodedEvents = this.encodeEvents();
    const combined = { states: encodedStates, events: encodedEvents };
    download(`${dateStr}_${location}.json`, JSON.stringify(combined));
    // if (encodedStates != null) {
    //   download(`${dateStr}_${location}_states.json`, JSON.stringify(encodedStates));
    // }
    // if (encodedEvents != null) {
    //   download(`${dateStr}_${location}_events.json`, JSON.stringify(encodedEvents));
    // }
  }

  show() {
    const toJsonHtml = (obj) => {
      let s = JSON.stringify(obj, null, 2);
      s = s.replace(/\n/g, '<br>');
      s = s.replace(/ /g, '&nbsp');
      return s;
    };
    const wnd = window.open('about:blank', '', '_blank');

    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');
    wnd.document.write(toJsonHtml(this.events), '<br>');
    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');
    wnd.document.write(toJsonHtml(this.states.diffs), '<br>');
    wnd.document.write(toJsonHtml(this.states.references), '<br>');
  }

  /**
   * Code generator that takes mouse events, and generates code to load them
   * as auto mouse events
   * @param {string} figureName name of figure used in code ('figure')
   * @param {number} precision precision to save cursor positions to (2)
   */
  genAutoMouseEvents(
    figureName: string = 'figure',
    precision: number = 2,
    encodeMove: boolean = true,
  ) {
    let cursorData;
    if (encodeMove) {
      cursorData = `${figureName}.recorder.loadEventData('_autoCursorMove', ${this.encodeCursorEvent('cursorMove', precision, precision)}, 'cursor', 2, 2);`;
    } else {
      cursorData = `${figureName}.recorder.loadEventData('_autoCursorMove', [
${this.showEvent('cursorMove', precision, 2)}
], false, 2, 2);`;
    }
    return `
${figureName}.recorder.loadEventData('_autoCursor', [
${this.showEvent('cursor', precision, 2)},
]);
${figureName}.recorder.loadEventData('_autoTouch', [
${this.showEvent('touch', precision, 2)},
]);
${cursorData}
    `;
  }

  showEvent(eventName: string, precision: number = 2, space: number = 0) {
    const out = [];
    this.events[eventName].list.forEach((event) => {
      const [time, payload] = event;
      let payloadStr;
      if (Array.isArray(payload)) {
        payloadStr = '';
        const payloadOut = [];
        payload.forEach((item) => {
          if (typeof item === 'string') {
            payloadOut.push(`'${item}'`);
          } else {
            payloadOut.push(round(item, precision));
          }
        });
        payloadStr = payloadOut.join(', ');
      } else {
        payloadStr = payload;
      }
      out.push(`${Array(space + 1).join(' ')}[${round(time, 4)}, [${payloadStr}]]`);
    });
    return out.join(',\n');
  }

  // encodeMoveEvent(
  //   eventName: string,
  //   timePrecision: number = 2,
  //   valuePrecision: number = 2,
  //   minTimeStep: number = 0.01,
  // ) {

  // }

  encodeCursorEvent(
    eventName: string,
    timePrecision: number = 2,
    valuePrecision: number = 2,
    minTimeStep: number = 0.01,
  ) {
    const out = [];
    const firstTime = this.events[eventName].list[0][0];
    // let [lastX, lastY] = this.events[eventName].list[0][1];
    let lastDeltaTime = 0;
    let lastValues = null;
    this.events[eventName].list.forEach((event) => {
      const [time, payload] = event;
      const deltaTime = round(time - firstTime, timePrecision);
      // $FlowFixMe
      const values = payload.map(p => round(p, valuePrecision));
      if (lastValues == null) {
        lastValues = values;
        lastDeltaTime = deltaTime;
        out.push(round(firstTime, timePrecision), ...values);
        return;
      }
      if (deltaTime <= lastDeltaTime + minTimeStep) {
        return;
      }
      let same = true;
      for (let i = 0; i < values.length; i += 1) {
        if (values[i] !== lastValues[i]) {
          same = false;
        }
      }
      if (same) {
        return;
      }
      const deltaValues = Array(values.length);
      for (let i = 0; i < values.length; i += 1) { // $FlowFixMe
        deltaValues[i] = Math.round((values[i] - lastValues[i]) * 10 ** valuePrecision);
      }
      out.push(
        Math.round(round(deltaTime - lastDeltaTime, timePrecision) * 10 ** timePrecision),
        ...deltaValues,
      );
      lastDeltaTime = deltaTime;
      lastValues = values.slice();
    });
    return JSON.stringify(out);
  }

  // encodeEvent(
  //   eventName: string,
  //   timePrecision: number = 2,
  //   valuePrecision: number = 2,
  // ) {
  //   const out = [];
  //   const firstTime = this.events[eventName].list[0][0];
  //   let lastDeltaTime = 0;
  //   let lastValues = null;
  //   this.events[eventName].list.forEach((event) => {
  //     const [time, payload] = event;
  //     const deltaTime = round(time - firstTime, timePrecision);
  //     const values = payload.map(p => round(p, valuePrecision));
  //     if (lastValues == null) {
  //       lastValues = values;
  //       lastDeltaTime = deltaTime;
  //       out.push(round(firstTime, timePrecision), ...values);
  //       return;
  //     }
  //     if (deltaTime <= lastDeltaTime + 0.01) {
  //       return;
  //     }
  //     let same = true;
  //     for (let i = 0; i < values.length; i += 1) {
  //       if (values[i] !== lastValues[i]) {
  //         same = false;
  //       }
  //     }
  //     if (same) {
  //       return;
  //     }
  //     out.push(round(deltaTime - lastDeltaTime, timePrecision), ...values);
  //     lastDeltaTime = deltaTime;
  //     lastValues = values.slice();
  //   });
  //   return JSON.stringify(out);
  // }

  // eslint-disable-next-line class-methods-use-this
  decodeCursorEvent(
    eventName: string,
    eventData: Array<number>,
    timePrecision: number = 2,
    valuePrecision: number = 2,
  ) {
    const firstTime = eventData[0];
    let lastX = eventData[1];
    let lastY = eventData[2];
    const out = [];
    let cumDelta = 0;
    for (let i = 0; i < eventData.length; i += 3) {
      const deltaTime = eventData[i] / 10 ** timePrecision;
      const xDelta = eventData[i + 1];
      const yDelta = eventData[i + 2];
      if (i === 0) {
        out.push([firstTime, [xDelta, yDelta]]);
      } else {
        const x = lastX + xDelta / 10 ** valuePrecision;
        const y = lastY + yDelta / 10 ** valuePrecision;
        lastX = x;
        lastY = y;
        out.push([firstTime + cumDelta + deltaTime, [x, y]]);
        cumDelta += deltaTime;
      }
    }
    return out;
  }

  // eslint-disable-next-line class-methods-use-this
  decodeEvent(eventName: string, eventData: Array<number>) {
    const firstTime = eventData[0];
    const out = [];
    let cumDelta = 0;
    for (let i = 0; i < eventData.length; i += 3) {
      const deltaTime = eventData[i];
      const x = eventData[i + 1];
      const y = eventData[i + 2];
      if (i === 0) {
        out.push([firstTime, [x, y]]);
      } else {
        out.push([firstTime + cumDelta + deltaTime, [x, y]]);
        cumDelta += deltaTime;
      }
    }
    return out;
  }

  loadEventData(
    eventName: string,
    data: any,
    decode: 'cursor' | 'moved' | boolean = false,
    timePrecision: number = 2,
    valuePrecision: number = 2,
  ) {
    if (decode) {
      if (decode === true) {
        this.events[eventName].list.push(...this.decodeEvent(eventName, data));
      } else if (decode === 'cursor') {
        this.events[eventName].list.push(...this.decodeCursorEvent(
          eventName, data, timePrecision, valuePrecision,
        ));
      }
    } else {
      const timeConvertedData = data.map(d => [this.convertTime(d[0]), d[1], 0]);
      this.events[eventName].list.push(...timeConvertedData);
    }
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

  // eslint-disable-next-line class-methods-use-this
  convertTime(timeIn: string | number): number {
    let t;
    if (typeof timeIn === 'string') {
      const splitTime = timeIn.split(':');
      const minutes = parseInt(splitTime[0], 10);
      const seconds = parseFloat(splitTime[1]);
      t = minutes * 60 + seconds;
    } else {
      t = timeIn;
    }
    return t;
  }

  queueSeek(timeIn: number) {
    this.queueSeekTime = timeIn;
    this.figure.globalAnimation.clearTimeout(this.queueSeekId);
    this.queueSeekId = this.figure.globalAnimation.setTimeout(() => {
      this.seek(this.queueSeekTime);
      this.queueSeekId = null;
    }, 100);
  }

  /**
   * Seek to time
   * @param {number} timeIn in seconds
   */
  seek(timeIn: number) {
    this.figure.globalAnimation.clearTimeout(this.queueSeekId);
    let time = this.convertTime(timeIn);
    if (time < 0) {
      time = 0;
    }
    if (this.state === 'recording') {
      this.stopRecording();
    } else if (this.state === 'playing') {
      this.pausePlayback('freeze');
    }
    this.pauseState = null;
    this.setToTime(time);
    // console.log(this.figure.elements.elements.eqn.isShown)
    this.lastSeekTime = this.currentTime;
    this.figure.stop('freeze');
    // console.log('here', this.figure.elements.elements.eqn.isShown)
    this.subscriptions.publish('seek', time);
    // console.log(this.figure.elements.elements.eqn.isShown)
    // this.subscriptions.publish('timeUpdate', time);
  }

  setToTime(timeIn: number, force: boolean = false) {
    if (timeIn === 0 && this.states.diffs.length > 0) {
      this.stateIndex = 0;
    } else {  // $FlowFixMe
      this.stateIndex = getPrevIndexForTime(this.states.diffs, timeIn);
    }
    let stateTime = 0;
    let stateTimeCount = 0;
    if (this.stateIndex !== -1) {
      [stateTime, , , stateTimeCount] = this.states.diffs[this.stateIndex];
    }
    if (stateTime === this.lastSeekTime && !force) {
      return;
    }
    const time = stateTime > 0 ? stateTime : timeIn;
    const timeToUse = time;

    // For each eventName, if it is to be set on seek, then get the previous
    // index (or multiple indexes if multiple are set for the same time)
    // and add them to an eventsToExecuteArray
    const eventsToSetBeforeState = [];
    const eventsToSetAfterState = [];

    const eventNames = Object.keys(this.events);
    eventNames.forEach((eventName) => {
      // if (eventName !== 'slide' && eventName !== '_autoSlide') {
      //   return;
      // }
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
        getPrevIndexForTime(event.list, timeToUse),
      );
      // const lastIndex = getIndexOfLatestTime(event.list, firstIndex);
      for (let i = firstIndex; i <= lastIndex; i += 1) {
        const [eventTime, , timeCount] = event.list[i];
        if (
          (this.stateIndex === -1 || eventTime < stateTime)
          && (eventName === 'slide' || eventName === '_autoSlide')
          // || (eventTime === stateTime && timeCount <= stateTimeCount)
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
    // timer.stamp('m3');
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

    if (this.stateIndex !== -1) {
      this.setState(this.stateIndex);
    }

    playEvents(eventsToSetAfterState);

    this.setCurrentTime(timeToUse);

    // this.setCursor(timeToUse);
    this.figure.animateNextFrame();
    // console.log(t.slice(-1)[0] - t[0], t[1]-t[0],t[2]-t[1],t[3]-t[2])
  }

  setCursor(time: number) {
    const cursorState = this.getCursorState(time);
    if (cursorState == null) {
      return;
    }
    const { show, up, position } = cursorState;
    if (show && up) {
      this.figure.showCursor('up', position);
    } else if (show && up === false) {
      this.figure.showCursor('down', position);
    } else {
      this.figure.showCursor('hide');
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
    // let cursorEvents = this.events._autoCursor;
    // let touchEvents = this.events._autoTouch;
    // let cursorMoveEvents = this.events._autoCursorMove;
    // if (!this.useAutoEvents) {
    //   cursorEvents = this.events.cursor;
    //   touchEvents = this.events.touch;
    //   cursorMoveEvents = this.events.cursorMove;
    // }
    // console.log(this.useAutoEvents)
    const cursorEvent = getMostRecentForTime(
      [this.events.cursor.list, this.events._autoCursor.list], atTime,
    );
    const touchEvent = getMostRecentForTime(
      [this.events.touch.list, this.events._autoTouch.list], atTime,
    );
    const cursorMoveEvent = getMostRecentForTime(
      [this.events.cursorMove.list, this.events._autoCursorMove.list], atTime,
    );

    // const cursorIndex = getPrevIndexForTime(cursorEvents.list, atTime);
    // const touchIndex = getPrevIndexForTime(touchEvents.list, atTime);
    // const cursorMoveIndex = getPrevIndexForTime(cursorMoveEvents.list, atTime);
    let touchUp = null;
    let showCursor = null;
    let cursorPosition = null;
    let cursorTime = null;
    let cursorTimeCount = null;
    // if (touchIndex !== -1) {
    if (touchEvent != null) {
      // const event = touchEvents.list[touchIndex]; // $FlowFixMe
      const [time, [upOrDown, x, y], timeCount] = touchEvent;
      if (upOrDown === 'down') {
        touchUp = false;
        cursorTime = time;
        cursorTimeCount = timeCount; // $FlowFixMe
        cursorPosition = new Point(x, y);
      } else {
        touchUp = true;
      }
    }

    if (cursorEvent != null) {
      // const event = cursorEvents.list[cursorIndex]; // $FlowFixMe
      const [time, [showOrHide, x, y], timeCount] = cursorEvent;
      if (showOrHide === 'show') {
        showCursor = true;
        if (
          cursorTime == null
          || time > cursorTime // $FlowFixMe
          || (time === cursorTime && timeCount > cursorTimeCount)
        ) {
          cursorTime = time;
          cursorTimeCount = timeCount; // $FlowFixMe
          cursorPosition = new Point(x, y);
        }
      } else {
        showCursor = false;
      }
    }

    if (cursorMoveEvent != null) {
      // const event = cursorMoveEvents.list[cursorMoveIndex]; // $FlowFixMe
      const [time, [x, y], timeCount] = cursorMoveEvent;
      if (
        cursorTime == null
        || time > cursorTime // $FlowFixMe
        || (time === cursorTime && timeCount > cursorTimeCount)
      ) { // $FlowFixMe
        cursorPosition = new Point(x, y);
      }
    }

    return {
      show: showCursor == null ? false : showCursor,
      up: touchUp == null ? true : touchUp,
      position: cursorPosition == null ? new Point(0, 0) : cursorPosition,
    };
  }

  getEvents(eventsIn: ?Array<string> = []): Array<string> {
    let events = [];
    if (eventsIn != null && eventsIn.length > 0) {
      events = eventsIn;
    // } else if (this.useAutoEvents) {
    //   events = ['_autoExec', '_autoCursor', '_autoSlide', '_autoCursorMove', '_autoTouch'];
    } else {
      // events = Object.keys(this.events).filter(eventName => !eventName.startsWith('_auto'));
      events = Object.keys(this.events);
    }
    return events;
  }

  // ////////////////////////////////////
  // ////////////////////////////////////
  // Playback
  // ////////////////////////////////////
  // ////////////////////////////////////
  /**
   * Start Playback
   *
   * @param {number} fromTimeIn ib seconds (current time)
   * @param {boolean} allowPauseResume `true` to allow resuming from pause if a
   * pause state exists
   * @param {Array<string>} events list of events to play (all events)
   */
  startPlayback(
    fromTimeIn: number = this.currentTime || 0,
    allowPauseResume: boolean = false,
    events: ?Array<string> = [],
  ) {
    this.lastSeekTime = null;
    let fromTime = this.convertTime(fromTimeIn);
    if (fromTimeIn == null || fromTimeIn >= this.duration) {
      fromTime = 0;
    }
    this.eventsToPlay = this.getEvents(events);

    let stateToStartFrom = this.getStateForTime(fromTime);
    if (
      allowPauseResume
      && this.pauseState != null
    ) {
      stateToStartFrom = this.pauseState;
    }

    const finished = () => {
      if (this.pauseState == null) {
        this.setToTime(fromTime, true);
        fromTime = this.currentTime;
      } else {
        this.pauseState = null;
      }
      this.setVideoToNowDeltaTime(fromTime);
      fromTime = this.getCurrentTime();
      this.state = 'playing';
      this.setCurrentTime(fromTime);
      this.startTimeUpdates();
      this.startEventsPlayback(fromTime);
      this.startAudioPlayback(fromTime);
      this.figure.animateNextFrame();
      if (this.areEventsPlaying() === false && this.isAudioPlaying === false) {
        this.finishPlaying();
      }
      this.subscriptions.publish('playbackStarted');
    };

    this.figure.setState(stateToStartFrom, this.settings.play);
    if (this.figure.state.preparingToSetState) {
      this.state = 'preparingToPlay';
      this.subscriptions.publish('preparingToPlay');
      this.figure.subscriptions.add('stateSet', finished, 1);
      // console.log(this.figure.subscriptions.subscriptions.stateSet)
    } else {
      finished();
    }
  }

  /**
   * Toggle playback (if not recording)
   */
  togglePlayback() {
    if (this.state === 'recording') {
      return;
    }
    if (this.state !== 'idle') {
      this.pausePlayback();
    } else {
      this.resumePlayback();
    }
  }


  getPlaySettings() {
    let onResume = {
      how: 'instant',
      maxDuration: 6,
      velocity: {
        position: 2,
        rotation: Math.PI * 2 / 2,
        scale: 1,
        opacity: 0.8,
        color: 0.8,
      },
      allDurationsSame: true,
      zeroDurationThreshold: 0.00001,
      // minDuration: 0,
      duration: 0,
    };
    // console.log(resumeSettings)
    if (typeof this.settings.play === 'string') {
      onResume.how = this.settings.play;
    } else {
      onResume = joinObjects({}, onResume, this.settings.play);
    }
    if (onResume.how === 'dissolve') {
      const defaultDuration = {
        dissolveIn: 0.8,
        dissolveOut: 0.8,
        delay: 0.2,
      };
      if (onResume.duration === 0) {
        onResume.duration = defaultDuration;
      } else if (typeof onResume.duration === 'number') {
        onResume.duration = {
          dissolveOut: onResume.duration / 10 * 4.5,
          dissolveIn: onResume.duration / 10 * 4.5,
          delay: onResume.duration / 10 * 1,
        };
      } else {
        onResume.duration = joinObjects({}, defaultDuration, onResume.duration);
      }
    } else if (onResume.duration != null && typeof onResume.duration !== 'number') {
      onResume.duration = 1;
    }
    return onResume;
  }

  /**
   * Resume playback if paused.
   */
  resumePlayback() {
    this.startPlayback(this.currentTime, true);
  }

  startAudioPlayback(fromTime: number) {
    const { audio } = this;
    if (audio != null) {
      this.isAudioPlaying = true;
      const playPromise = audio.play();
      if (playPromise === undefined) {
        return false;
      }
      audio.currentTime = this.convertTime(fromTime);
      const audioEnded = () => {
        this.isAudioPlaying = false;
        if (this.state === 'playing') {
          this.finishPlaying();
        }
      };
      audio.removeEventListener('ended', audioEnded.bind(this), false);
      audio.addEventListener('ended', audioEnded.bind(this), false);
    }
    return true;
  }

  startTimeUpdates() {
    this.timeUpdatesTimeoutID = this.timeKeeper.setTimeout(
      () => {
        this.setCurrentTime(this.getCurrentTime());
        this.subscriptions.publish('timeUpdate', [this.getCurrentTime()]);
        this.startTimeUpdates();
      },
      this.timeUpdates,
      'timeUpdates',
    );
  }

  startEventsPlayback(fromTime: number) {
    this.eventsToPlay.forEach((eventName) => {
      if (this.events[eventName] == null) {
        return;
      }
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
        || time < nextTime // $FlowFixMe
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
    if (this.events[eventName].list.length === 0) {
      return;
    }
    const delay = round(this.events[eventName].list[index][0] - this.getCurrentTime(), 8);

    if (delay > 0.0001) {
      this.timeoutID = this.timeKeeper.setTimeout(
        this.playbackEvent.bind(this, eventName),
        round(Math.ceil(delay * 1000), 0),
        `event: ${eventName}`,
      );
      return;
    }

    // console.log('play event', eventName);
    this.setEvent(eventName, index);
    this.figure.animateNextFrame();
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
    if (this.state === 'recording') {
      return false;
    }
    if (this.areEventsPlaying()) {
      return false;
    }

    const remainingTime = this.duration - this.getCurrentTime();
    if (remainingTime > 0.001) {
      this.timeoutID = this.timeKeeper.setTimeout(() => {
        this.finishPlaying();
      }, round(remainingTime * 1000, 0), 'finishPlaying');
      return false;
    }

    if (this.isAudioPlaying) {
      return false;
    }
    // this.pausePlayback('cancel');
    // this.currentTime = this.getCurrentTime();
    this.setCurrentTime(this.getCurrentTime());
    // console.log(this.currentTime)
    this.stop();
    return true;
  }

  // clearPlaybackTimeouts() {
  //   this.timeoutID = null;
  // }

  // animateToState() {

  // }

  stop() {
    this.stopTimeouts();
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }
    this.state = 'idle';
    this.subscriptions.publish('playbackStopped');
  }

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
  /**
   * Pause playback
   * @param {'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete'} how
   * how any animations currently playing should be stopped
   */
  pausePlayback(how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = this.settings.pause) {
    // this.currentTime = this.getCurrentTime();
    this.setCurrentTime(this.getCurrentTime());
    this.pauseState = this.figure.getState({
      precision: this.precision,
      ignoreShown: true,
    });

    const pause = () => {
      // console.log('pause')
      this.state = 'idle';
      this.subscriptions.publish('playbackStopped');
      // this.figure.stop();
    };
    this.stopTimeouts();
    if (this.audio) {
      this.audio.pause();
      this.isAudioPlaying = false;
    }

    this.figure.subscriptions.add('stopped', pause, 1);
    this.figure.stop(how);
    if (this.figure.state.preparingToStop) {
      this.subscriptions.publish('preparingToPause');
      this.state = 'preparingToPause';
      // console.log('recorder prep to pause')
      // this.figure.subscriptions.add('animationsFinished', pause, 1);
    }
    // if (this.figure.isAnimating()) {
    //   this.subscriptions.publish('preparingToPause');
    //   this.state = 'preparingToPause';
    //   // console.log('recorder prep to pause')
    //   this.figure.subscriptions.add('animationsFinished', pause, 1);
    // } else {
    //   pause();
    // }
  }


  setEvent(eventName: string, index: number) {
    const event = this.events[eventName];
    if (event == null) {
      return;
    }
    // Why is this here? When an animation is in progress and the screen loses
    // focus, then draw events stop happening and the animation no longer
    // progresses even though the events still happen. When the window regains
    // focus, the animation finishes, but this is essentially finishing the
    // animation after events that it would normally finish before hand.
    // Therefore setupDraw will finish any animations due to finish when an
    // event occurs.
    //
    // TODO - Long term, animations need to be removed from the draw
    // dependency. Maybe a way to do this is to on each draw (and AFTER each
    // event), remove draw timer, check for soonest animation finish,
    // setTimeout a new draw timer for that.
    // const t = performance.now()
    // this.figure.elements.setupDraw(this.figure.globalAnimation.now() / 1000);
    this.figure.setDrawTimeout(0.05);
    // console.log(performance.now() - t);
    // $FlowFixMe
    event.playbackAction(event.list[index][1], event.list[index][0]);
  }

  /**
   * Fetch and load a video track.
   *
   * When loading is finished, the notification 'videoLoaded' will be published
   *
   * @param {string} path path to load video track from
   * @param {function(): void} callback function to execute when loaded
   */
  loadVideoTrack(path: string, callback: () => void = () => {}) {
    fetch(path, { mode: 'no-cors' })
      .then(response => response.json())
      .then((json) => {
        this.loadSavedData(json);
        callback();
      })
      .catch((error) => {
        throw new Error(`Recorder fetch and load error: ${error}`);
      });
  }

  setState(index: number) {
    if (index > this.states.diffs.length - 1) {
      return;
    }
    const state = this.states.getFromIndex(index);
    if (state == null) {
      return;
    }
    this.figure.setState(state);
  }

  getState(index: number) {
    if (index > this.states.diffs.length - 1) {
      return {};
    }
    return this.states.getFromIndex(index);
  }

  getStateForTime(timeIn: number) {
    let stateIndex;
    const time = this.convertTime(timeIn);
    if (
      this.states.diffs.length > 0
      && (
        time === 0
        || time <= this.states.diffs[0][0]
      )
    ) {
      stateIndex = 0;
    } else {  // $FlowFixMe
      stateIndex = getPrevIndexForTime(this.states.diffs, time);
    }
    return this.getState(stateIndex);
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
