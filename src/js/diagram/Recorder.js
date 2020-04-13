// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform, Transform } from '../tools/g2';
import { round } from '../tools/math';
import type { DiagramElement } from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables
class Recorder {
  // Method for requesting the next animation frame
  events: Array<Array<number | string | null>>
  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  precision: number;
  touchDown: (Point) => boolean;
  touchUp: void => void;
  // touchMoveDown: (Point, Point) => boolean;
  cursorMove: (Point) => void;
  eventIndex: number;
  queueNextFrame: GlobalAnimation;
  previousPoint: ?Point;
  animateNextFrame: () => void;
  getElement: () => DiagramElement;
  nextTimeout: TimeoutID;

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
  ) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.events = [];
      this.isRecording = false;
      this.precision = 5;
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
    this.startTime = this.timeStamp();
    this.isRecording = true;
    this.events = [];
  }

  stop() {
    this.isRecording = false;
  }

  recordEvent(...args: Array<number | string>) {
    // const out = [];
    // args.forEach((arg) => {
    //   if (arg instanceof Transform) {
    //     out.push(arg.toString(5));
    //   } else if (typeof arg === 'string') {
    //     out.push(`${arg}`);
    //   } else if (typeof arg === 'number') {
    //     out.push(round(arg, this.precision));
    //   } else {
    //     out.push(arg);
    //   }
    // });
    this.events.push([this.now() / 1000, ...args]);
  }

  show() {  // eslint-disable-line class-methods-use-this
    const wnd = window.open('about:blank', '', '_blank');
    this.events.forEach((event) => {
      const out = [];
      event.forEach((arg) => {
        if (arg instanceof Transform) {
          out.push(arg.toString(5));
        } else if (typeof arg === 'string') {
          out.push(`"${arg}"`);
        } else if (typeof arg === 'number') {
          out.push(round(arg, this.precision));
        } else {
          out.push(arg);
        }
      });
      wnd.document.write(`[${out.join(',')}],`, '<br>');
    });
  }

  recordClick(id: string) {
    this.events.push([this.now(), id]);
  }

  startPlayback(fromTime: number = 0) {
    this.isRecording = false;
    this.isPlaying = true;
    this.eventIndex = 0;
    this.previousPoint = null;
    this.touchUp();
    this.eventIndex = this.getNextIndexForTime(fromTime);
    this.queuePlaybackEvent(this.getTimeToIndex(fromTime));
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
    clearTimeout(this.nextTimeout);
  }

  processEvent(event: Array<string | number>) {
    const [eventType] = event;
    console.log(eventType)
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
        console.log(id)
        console.log(element)
        console.log(id,'asdfasdfasdf');
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
    if (time === 0) {
      this.playbackEvent();
      return;
    }
    this.nextTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackEvent();
      }
    }, time);
  }

  playbackEvent() {
    const event = this.events[this.eventIndex];
    const [currentTime] = event;
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
