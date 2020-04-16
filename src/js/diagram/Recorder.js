// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform, Transform } from '../tools/g2';
import { round } from '../tools/math';
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

function getNextIndexForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  if (time === 0 || events.length === 0) {
    return 0;
  }
  const endTime = parseFloat(events[endSearch][0]);
  if (time > endTime) {
    return -1;
  }
  const searchRange = endSearch - startSearch;
  let midSearch = startSearch;
  if (searchRange > 1) {
    midSearch = Math.floor(startSearch + searchRange / 2);
  } else if (searchRange === 1) {
    midSearch = endSearch;
  }
  // console.log(startSearch, endSearch, midSearch)
  if (midSearch === 0) {
    return 0;
  }
  const prevTime = events[midSearch - 1][0];
  const midTime = events[midSearch][0];
  if (time === midTime) {
    return midSearch;
  }
  if (time <= midTime && time > prevTime) {
    return midSearch;
  }
  if (time < midTime) {
    return getNextIndexForTime(events, time, startSearch, midSearch);
  }
  return getNextIndexForTime(events, midSearch, endSearch);
}

function getTimeToIndex(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  eventIndex: number,
  time: number,
) {
  if (eventIndex === -1 || eventIndex > events.length) {
    return -1;
  }
  const nextTime = events[eventIndex][0];
  return nextTime - time;
}

class Recorder {
  // Method for requesting the next animation frame
  events: Array<Array<number | string | null>>;
  states: Array<[number, Object]>;
  slides: Array<[number, number | 'next' | 'prev']>;
  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  precision: number;
  touchDown: (Point) => boolean;
  touchUp: void => void;
  // touchMoveDown: (Point, Point) => boolean;
  cursorMove: (Point) => void;
  getState: () => Object;
  setState: (Object) => void;
  eventIndex: number;
  stateIndex: number;
  queueNextFrame: GlobalAnimation;
  previousPoint: ?Point;
  animateNextFrame: () => void;
  getElement: () => DiagramElement;
  nextEventTimeout: TimeoutID;
  nextStateTimeout: TimeoutID;
  stateTimeout: TimeoutID;
  stateTimeStep: number;
  currentTime: number;

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
    animateNextFrame?: () => void,
    getElement?: () => DiagramElement,
    getState?: () => Object,
    setState?: (Object) => void,
  ) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.events = [];
      this.isRecording = false;
      this.precision = 5;
      this.stateTimeStep = 1000;
      if (diagramTouchDown) {
        this.touchDown = diagramTouchDown;
      }
      if (diagramTouchUp) {
        this.touchUp = diagramTouchUp;
      }
      // if (diagramTouchMoveDown) {
      //   this.touchMoveDown = diagramTouchMoveDown;
      // }
      if (diagramCursorMove) {
        this.cursorMove = diagramCursorMove;
      }
      this.queueNextFrame = new GlobalAnimation();
      this.previousPoint = null;
      if (animateNextFrame) {
        this.animateNextFrame = animateNextFrame;
      }
      if (getElement) {
        this.getElement = getElement;
      }
      if (getState) {
        this.getState = getState;
      }
      if (setState) {
        this.setState = setState;
      }
      // this.drawScene = this.draw.bind(this);
    }
    return Recorder.instance;
  }

  timeStamp() {   // eslint-disable-line class-methods-use-this
    return (new Date()).getTime();
  }

  now() {   // eslint-disable-line class-methods-use-this
    return this.timeStamp() - this.startTime;
  }

  start() {
    this.events = [];
    this.slides = [];
    this.states = [];
    this.startTime = this.timeStamp();
    this.isRecording = true;
    this.queueRecordState(0);
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

  recordState(state: Object) {
    this.states.push([this.now() / 1000, state]);
  }

  recordSlide(slide: number | 'next' | 'prev') {
    this.slides.push([this.now() / 1000, slide]);
  }

  // showEvents() {
  //   const wnd = window.open('about:blank', '', '_blank');
  //   this.events.forEach((event) => {
  //     const out = [];
  //     event.forEach((arg) => {
  //       if (arg instanceof Transform) {
  //         out.push(arg.toString(5));
  //       } else if (typeof arg === 'string') {
  //         out.push(`"${arg}"`);
  //       } else if (typeof arg === 'number') {
  //         out.push(round(arg, this.precision));
  //       } else {
  //         out.push(arg);
  //       }
  //     });
  //     wnd.document.write(`[${out.join(',')}],`, '<br>');
  //   });
  // }

  // showState() {
  //   const wnd = window.open('about:blank', '', '_blank');
  //   this.states.forEach((state) => {
  //     wnd.document.write(JSON.stringify(state), '<br>');
  //   });
  // }

  save() {
    const slidesOut = [];
    this.slides.forEach((slide) => {
      slidesOut.push(JSON.stringify(slide));
    });

    const eventsOut = [];
    this.events.forEach((event) => {
      eventsOut.push(JSON.stringify(event));
    });

    const statesOut = [];
    this.states.forEach((state) => {
      statesOut.push(JSON.stringify(state));
    });

    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    download(`${dateStr} ${location} slides.txt`, slidesOut.join('\n'));
    download(`${dateStr} ${location} events.txt`, eventsOut.join('\n'));
    download(`${dateStr} ${location} states.txt`, statesOut.join('\n'));
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

  recordClick(id: string) {
    this.events.push([this.now(), id]);
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
    if (this.states.length > 0) {
      const endTime = this.states.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    return time;
  }

  scrub(percentTime: number) {
    this.stopPlayback();
    const totalTime = this.getTotalTime();
    const timeTarget = percentTime * totalTime;
    this.setToTime(timeTarget);
  }

  setToTime(time: number) {
    this.currentTime = time;
    this.stateIndex = Math.max(getNextIndexForTime(this.states, time) - 1, 0);
    // this.playbackState();
    this.setState(this.states[this.stateIndex][1]);
    this.animateNextFrame();
  }

  getCurrentTime() {
    return this.now() / 1000;
  }

  startPlayback(fromTime: number = 0, showPointer: boolean = true) {
    this.currentTime = 0;
    this.isRecording = false;
    this.isPlaying = true;
    this.eventIndex = 0;
    this.stateIndex = 0;
    this.previousPoint = null;
    this.startTime = this.timeStamp();
    this.touchUp();
    this.eventIndex = getNextIndexForTime(this.events, fromTime);
    this.queuePlaybackEvent(this.getTimeToIndex(this.events, this.eventIndex, fromTime));
    this.queuePlaybackState(this.getTimeToIndex(this.states, this.stateIndex, fromTime));
    const pointer = this.getElement('pointer.up');
    if (pointer != null && showPointer) {
      pointer.show();
    }
    // this.playbackEvent(this.getTimeToIndex);
  }

  getTimeToIndex(time: number) {
    if (this.eventIndex === -1 || this.eventIndex > this.events.length) {
      return -1;
    }
    const nextTime = this.events[this.eventIndex][0];
    return nextTime - time;
  }

  getNextIndexForTime(
    time: number,
    startSearch: number = 0,
    endSearch: number = this.events.length - 1,
  ) {
    if (time === 0) {
      return 0;
    }
    const endTime = parseFloat(this.events[endSearch][0]);
    if (time > endTime) {
      return -1;
    }
    const searchRange = endSearch - startSearch;
    let midSearch = startSearch;
    if (searchRange > 1) {
      midSearch = Math.floor(startSearch + searchRange / 2);
    } else if (searchRange === 1) {
      midSearch = endSearch;
    }
    // console.log(startSearch, endSearch, midSearch)
    if (midSearch === 0) {
      return 0;
    }
    const prevTime = this.events[midSearch - 1][0];
    const midTime = this.events[midSearch][0];
    if (time === midTime) {
      return midSearch;
    }
    if (time <= midTime && time > prevTime) {
      return midSearch;
    }
    if (time < midTime) {
      return this.getNextIndexForTime(time, startSearch, midSearch);
    }
    return this.getNextIndexForTime(time, midSearch, endSearch);
  }

  stopPlayback() {
    this.isPlaying = false;
    clearTimeout(this.nextEventTimeout);
    clearTimeout(this.stateTimeout);
    const pointer = this.getElement('pointer');
    if (pointer != null) {
      pointer.hide();
    }
  }

  processEvent(event: Array<string | number>) {
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
        const [, x, y] = event;
        this.cursorMove(new Point(event[1], event[2]));
        break;
      }
      case 'startBeingMoved': {
        const [, elementPath] = event;
        const element = this.getElement(elementPath);
        element.startBeingMoved();
        break;
      }
      case 'moved': {
        const [, elementPath, transformDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        element.moved(transform);
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
      // case 'cursorMoved': {
      //   const [, x, y] = event;
      //   this.
      // }
      case 'stopBeingMoved': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.transform = transform;
        element.state.movement.velocity = velocity;
        element.stopBeingMoved();
        break;
      }
      case 'startMovingFreely': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
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

  queuePlaybackEvent(time: number = 0) {
    // if (time === 0) {
    //   this.playbackEvent();
    //   return;
    // }
    this.nextEventTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackEvent();
      }
    }, time);
  }

  queuePlaybackState(time: number = 0) {
    this.nextStateTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackState();
      }
    }, time);
  }

  queueRecordState(time: number = 0) {
    this.stateTimeout = setTimeout(() => {
      if (this.isRecording) {
        this.recordState(this.getState());
        this.queueRecordState(this.stateTimeStep);
      }
    }, time);
  }

  playbackEvent() {
    const event = this.events[this.eventIndex];
    const [currentTime] = event;
    console.log('event', this.getCurrentTime(), currentTime)
    this.processEvent(event.slice(1));
    this.animateNextFrame();
    this.eventIndex += 1;
    if (this.eventIndex === this.events.length) {
      this.stopPlayback();
      return;
    }
    const nextTime = (this.events[this.eventIndex][0] - currentTime) * 1000;
    this.queuePlaybackEvent(nextTime);
  }

  playbackState() {
    if (this.states.length === 0 || this.stateIndex > this.states.length - 1) {
      return;
    }
    const state = this.states[this.stateIndex];
    const [currentTime] = state;
    console.log('state**********', this.getCurrentTime(), currentTime)
    this.setState(state[1]);
    this.animateNextFrame();
    this.stateIndex += 1;
    if (this.stateIndex === this.states.length) {
      this.stopPlayback();
      return;
    }
    const nextTime = (this.states[this.stateIndex][0] - currentTime) * 1000;
    this.queuePlaybackState(nextTime);
  }

  // playbackClick() { // eslint-disable-line class-methods-use-this
  // }

  // playbackTouch() {
  //   const [, x, y, touch] = this.events[this.eventIndex];
  //   switch (touch) {
  //     case 'd':
  //       this.touchDown(new Point(x, y));
  //       if (this.previousPoint == null && x != null && y != null) {
  //         this.previousPoint = new Point(x, y);
  //       }
  //       break;
  //     case 'u':
  //       this.touchUp();
  //       this.previousPoint = null;
  //       break;
  //     case 'm':
  //       this.touchMoveDown(this.previousPoint, new Point(x, y));
  //       this.previousPoint = new Point(x, y);
  //       break;
  //     default:
  //       this.touchMoveUp(new Point(x, y));
  //       break;
  //   }
  // }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default Recorder;
