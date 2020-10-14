// @flow

export type TypeWhen = 'now' | 'nextFrame' | 'prevFrame' | 'syncNow';

// Singleton class that contains projects global variables
class GlobalAnimation {
  // Method for requesting the next animation frame
  requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  drawQueue: Array<(number) => void>;
  nextDrawQueue: Array<(number) => void>;
  lastFrame: ?number;
  debug: boolean;
  simulatedFPS: number;
  debugFrameTime: ?number;
  nowTime: number;
  now: function;
  timeoutId: ?TimeoutID;
  speed: number;
  // syncNow: () => number;
  synchronizedNow: number;
  updateSyncNow: boolean;
  timers: Array<TimeoutID>;
  syncNowTimer: TimeoutID;

  constructor() {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!GlobalAnimation.instance) {
      this.requestNextAnimationFrame = (
        window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame
      );
      GlobalAnimation.instance = this;
      // this.drawQueue = [];
      // this.nextDrawQueue = [];
      // this.lastFrame = null;
      // this.debug = false;
      // this.simulatedFPS = 60;
      // this.debugFrameTime = 0.5;
      // this.timeoutId = null;
      // this.now = () => performance.now();
      // this.updateSyncNow = false;
      // this.drawScene = this.draw.bind(this);
      this.reset();
    }
    return GlobalAnimation.instance;
  }

  reset() {
    this.drawQueue = [];
    this.nextDrawQueue = [];
    this.lastFrame = null;
    this.debug = false;
    this.simulatedFPS = 60;
    this.debugFrameTime = 0.5;
    if (this.timers != null && this.timers.length > 0) {
      this.timers.forEach(id => clearTimeout(id));
    }
    this.timers = [];
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = null;
    this.now = () => performance.now();
    this.updateSyncNow = true;
  }

  getWhen(when: TypeWhen) {
    if (when === 'now') {
      return this.now();
    }
    if (when === 'prevFrame') {
      return this.lastFrame;
    }
    if (when === 'syncNow') {
      return this.syncNow();
    }
    return null;
  }

  syncNow() {
    if (this.updateSyncNow) {
      this.updateSyncNow = false;
      this.synchronizedNow = performance.now();
      this.syncNowTimer = setTimeout(() => { this.updateSyncNow = true; }, 100);
    }
    return this.synchronizedNow;
  }

  // eslint-disable-next-line class-methods-use-this
  now() {
    return performance.now();
  }

  setDebugFrameRate(simulatedFPS: number = 60, frameTime: ?number = 1) {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }
    cancelAnimationFrame(this.animationId);
    this.simulatedFPS = simulatedFPS;
    this.debugFrameTime = frameTime;
    this.debug = true;
    this.nowTime = performance.now();
    this.now = () => this.nowTime;
    this.queueNextDebugFrame();
  }

  queueNextDebugFrame() {
    if (this.debugFrameTime != null) {
      this.timeoutId = setTimeout(() => {
        this.nowTime += 1 / this.simulatedFPS * 1000;
        if (this.nextDrawQueue.length > 0) {
          this.draw(this.now());
        }
        this.queueNextDebugFrame();
      }, this.debugFrameTime * 1000);
    } else {
      this.nowTime += 1 / this.simulatedFPS * 1000;
      if (this.nextDrawQueue.length > 0) {
        this.draw(this.now());
      }
    }
  }

  setTimeout(f: function, time: number): TimeoutID {
    if (this.debug) {
      let timeScale = 0;
      if (this.debugFrameTime != null) {
        timeScale = (this.debugFrameTime || 0) / (1 / this.simulatedFPS);
      }
      // console.log('setTimeout', time, timeScale)
      if (timeScale > 0) {
        const id = setTimeout(f, time * timeScale);
        this.timers.push(id);
        return id;
      }
      const id = setTimeout(f, 0);
      this.timers.push(id);
      return id;
    }
    const id = setTimeout(f, time);
    this.timers.push(id);
    return id;
  }

  clearTimeout(id: TimeoutID | null) {
    if (id == null) {
      return;
    }
    clearTimeout(id);

    const index = this.timers.indexOf(id);
    if (index > -1) {
      this.timers.splice(index, 1);
    }
  }

  disableDebugFrameRate() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = null;
    this.debug = false;
    if (this.nextDrawQueue.length > 0) {
      this.animateNextFrame();
    }
  }

  draw(now: number) {
    clearTimeout(this.syncNowTimer);
    this.updateSyncNow = true;
    this.drawQueue = this.nextDrawQueue;
    this.nextDrawQueue = [];
    const nowSeconds = now * 0.001;
    for (let i = 0; i < this.drawQueue.length; i += 1) {
      this.drawQueue[i](nowSeconds);
    }
    this.drawQueue = [];
    this.lastFrame = now;
  }

  queueNextFrame(func: (?number) => void) {
    // if (!(func in this.nextDrawQueue)) {
    this.nextDrawQueue.push(func);
    // }

    // if (triggerFrameRequest) {
    //   this.animateNextFrame();
    // }
    if (this.nextDrawQueue.length === 1) {
      if (!this.debug) {
        this.animateNextFrame();
      }
    }
  }

  // simulateNextFrame() {
  //   if (this.timeoutId == null) {
  //     this.queueNextDebugFrame();
  //   }
  // }

  // Queue up an animation frame
  animateNextFrame() {
    cancelAnimationFrame(this.animationId);
    // $FlowFixMe
    const nextFrame = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
    this.animationId = nextFrame;
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default GlobalAnimation;
