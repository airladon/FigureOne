// @flow

import { round } from '../tools/math'; 
// Singleton class that contains projects global variables
class Recorder {
  // Method for requesting the next animation frame
  data: Array<[number, number | null, number | null, 'down' | 'up' | 'move' | 'free'] | [number, string]>
  isRecording: boolean;
  startTime: number;
  precision: number;
  // requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  // animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  // drawQueue: Array<(number) => void>;
  // nextDrawQueue: Array<(number) => void>;

  constructor() {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.data = [];
      this.isRecording = false;
      this.precision = 5;
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
    this.data = [];
  }

  stop() {
    this.isRecording = false;
  }

  recordPointer(x: number | null, y: number | null, state: 'down' | 'up' | 'move' | 'free') {
    const xRound = x == null ? null : round(x, this.precision);
    const yRound = y == null ? null : round(y, this.precision);
    if (this.data.length > 0) {
      const lastPoint = this.data[this.data.length - 1];
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
    this.data.push([this.now(), xRound, yRound, state]);
  }

  show() {  // eslint-disable-line class-methods-use-this
    const wnd = window.open('about:blank', '', '_blank');
    this.data.forEach((event) => {
      if (event.length === 4) {
        const [time, x, y, state] = event;
        wnd.document.write(`[${time}, ${x}, ${y}, '${state}'],<br>`);
      } else {
        const [time, id] = event;
        wnd.document.write(`[${time}, ${id}],<br>`);
      }
    });
    // wnd.document.write(this.data);
  }

  recordClick(id: string) {
    this.data.push([this.now(), id]);
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default Recorder;
