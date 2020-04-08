// @flow

import { round } from '../tools/math';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables
class Recorder {
  // Method for requesting the next animation frame
  events: Array<[number, number | null, number | null, 'd' | 'u' | 'm' | 'f'] | [number, string]>
  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  precision: number;
  touchDown: (Point) => boolean;
  touchUp: void => void;
  touchMoveDown: (Point, Point) => boolean;
  touchMoveUp: (Point) => void;
  eventIndex: number;
  queueNextFrame: GlobalAnimation;
  previousPoint: ?Point;
  animateNextFrame: () => void;

  // requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  // animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  // drawQueue: Array<(number) => void>;
  // nextDrawQueue: Array<(number) => void>;

  constructor(
    diagramTouchDown: (Point) => boolean,
    diagramTouchUp: void => void,
    diagramTouchMoveDown: (Point, Point) => boolean,
    diagramTouchMoveUp: (Point) => void,
    animateNextFrame: () => void,
  ) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.events = [];
      this.isRecording = false;
      this.precision = 5;
      this.touchDown = diagramTouchDown;
      this.touchUp = diagramTouchUp;
      this.touchMoveDown = diagramTouchMoveDown;
      this.touchMoveUp = diagramTouchMoveUp;
      this.queueNextFrame = new GlobalAnimation();
      this.previousPoint = null;
      this.animateNextFrame = animateNextFrame;
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

  recordPointer(x: number | null, y: number | null, state: 'd' | 'u' | 'm' | 'f') {
    const xRound = x == null ? null : round(x, this.precision);
    const yRound = y == null ? null : round(y, this.precision);
    if (this.events.length > 0) {
      const lastPoint = this.events[this.events.length - 1];
      let lastX;
      let lastY;
      let lastState;
      if (lastPoint.length === 4) {
        [, lastX, lastY, lastState] = lastPoint;
      }
      if (xRound === lastX && yRound === lastY && state === lastState) {
        return;
      }
    }
    this.events.push([this.now() / 1000, xRound, yRound, state]);
  }

  show() {  // eslint-disable-line class-methods-use-this
    const wnd = window.open('about:blank', '', '_blank');
    this.events.forEach((event) => {
      if (event.length === 4) {
        const [time, x, y, state] = event;
        wnd.document.write(`[${time}, ${x || 'null'}, ${y || 'null'}, '${state}'],<br>`);
      } else {
        const [time, id] = event;
        wnd.document.write(`[${time}, ${id}],<br>`);
      }
    });
    // wnd.document.write(this.events);
  }

  recordClick(id: string) {
    this.events.push([this.now(), id]);
  }

  startPlayback() {
    this.isRecording = false;
    this.isPlaying = true;
    this.eventIndex = 0;
    this.previousPoint = null;
    this.touchUp();
    this.playbackEvent();
  }

  stopPlayback() {
    this.isPlaying = false;
  }

  playbackEvent() {
    const event = this.events[this.eventIndex];
    const [currentTime] = event;
    if (event.length === 4) {
      this.playbackTouch();
    } else {
      this.playbackClick();
    }
    this.animateNextFrame();
    this.eventIndex += 1;
    if (this.eventIndex === this.events.length) {
      this.stopPlayback();
      return;
    }
    const nextTime = (this.events[this.eventIndex][0] - currentTime) * 1000;
    setTimeout(() => {
      this.playbackEvent();
    }, nextTime);
  }

  playbackClick() { // eslint-disable-line class-methods-use-this
  }

  playbackTouch() {
    const [, x, y, touch] = this.events[this.eventIndex];
    switch (touch) {
      case 'd':
        this.touchDown(new Point(x, y));
        if (this.previousPoint == null && x != null && y != null) {
          this.previousPoint = new Point(x, y);
        }
        break;
      case 'u':
        this.touchUp();
        this.previousPoint = null;
        break;
      case 'm':
        this.touchMoveDown(this.previousPoint, new Point(x, y));
        break;
      default:
        this.touchMoveUp(new Point(x, y));
        break;
    }
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default Recorder;
