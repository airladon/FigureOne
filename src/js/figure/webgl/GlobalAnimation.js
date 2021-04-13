// @flow

/**
 * `'nextFrame'` | `'prevFrame'` | `'syncNow'` | `'now'`
 *
 *
 * `'syncNow'` is a synchronized 'now' time. The
 * first time 'syncNow' is used, the current time will be stored and used
 * for all subsequent calls to 'syncNow'. 'syncNow' is reset every
 * time a new animation frame is drawn, or 100ms after a first syncNow call
 * has been made after a reset.
 *
 * 'now' is the instantaneous time
 *
 * `'nextFrame'` will be the time of the next animation frame
 *
 * `'prevFrame'` is the time of the last animation frame
 * @typedef {'now' | 'nextFrame' | 'prevFrame' | 'syncNow'} TypeWhen
 */
export type TypeWhen = 'now' | 'nextFrame' | 'prevFrame' | 'syncNow';

// Singleton class that contains projects global variables
class GlobalAnimation {
  // Method for requesting the next animation frame
  requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  animationId: ?AnimationFrameID;    // used to cancel animation frames
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
  manual: boolean;
  manualTimers: Object;
  manualTimerIds: number;
  manualQueueCounter: number;
  manualOneFrameOnly: boolean;

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
    this.manual = false;
    this.manualTimers = {};
    this.manualTimerIds = 0;
    this.manualQueueCounter = 0;
    this.manualOneFrameOnly = true;
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
      this.synchronizedNow = this.now();
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
    if (this.animationId != null) {
      cancelAnimationFrame(this.animationId);
    }
    this.simulatedFPS = simulatedFPS;
    this.debugFrameTime = frameTime;
    this.debug = true;
    this.nowTime = performance.now();
    this.now = () => this.nowTime;
    this.queueNextDebugFrame();
  }

  setManualFrames() {
    // console.log('start manual')
    this.manual = true;
    this.nowTime = performance.now();
    this.now = () => this.nowTime;
  }

  endManualFrames() {
    // console.log('end manual')
    this.manual = false;
    this.now = () => performance.now();
  }

  frame(duration: number) {
    this.manualQueueCounter = 0;
    const targetTime = this.nowTime + duration * 1000;
    // console.log('before')
    this.incrementManualTimers(this.nowTime + duration * 1000);
    // console.log('after')
    this.nowTime = targetTime;
    this.animateNextFrame();
  }

  incrementManualTimers(maxTime: number) {
    const timersToFire = [];
    Object.keys(this.manualTimers).forEach((id) => {
      const {
        duration, startTime, f, stateTimer, description,
      } = this.manualTimers[id];
      const endTime = startTime + duration;
      if (maxTime >= endTime) {
        timersToFire.push([id, endTime, f, stateTimer, description]);
      }
    });
    if (timersToFire.length === 0) {
      return 0;
    }
    timersToFire.sort((t1, t2) => {
      if (t1[1] === t2[1] && (t1[3] || t2[3])) {
        if (t1[3]) {
          return 1;
        }
        return -1;
      }
      return t1[1] - t2[1];
    });

    const [id, endTime, f] = timersToFire[0];
    this.nowTime = endTime;
    f();
    this.draw(this.nowTime);
    // console.log(endTime, maxTime, preLength, Object.keys(this.manualTimers).length)
    // console.log(timersToFire[0], timersToFire[1], timersToFire[2], this.nowTime, maxTime)
    delete this.manualTimers[`${id}`];
    return this.incrementManualTimers(maxTime);
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

  setupTimeout(f: function, time: number, description: string, stateTimer: boolean): TimeoutID {
    let id;
    if (this.manual) {
      id = this.manualTimerIds;
      this.manualTimerIds += 1;
      this.manualTimers[`${id}`] = ({
        duration: time,
        f,
        startTime: this.nowTime,
        stateTimer,
        description,
      });
      // $FlowFixMe
      return id;
    }
    id = setTimeout(f, time);
    this.timers.push(id);
    return id;
  }

  setTimeout(
    f: function, time: number, description: string,
    stateTimer: boolean = false,
  ): TimeoutID {
    if (this.debug) {
      let timeScale = 0;
      if (this.debugFrameTime != null) {
        timeScale = (this.debugFrameTime || 0) / (1 / this.simulatedFPS);
      }
      if (timeScale > 0) {
        return this.setupTimeout(f, time * timeScale, description, stateTimer);
      }
      return this.setupTimeout(f, 0, description, stateTimer);
    }
    return this.setupTimeout(f, time, description, stateTimer);
  }

  clearTimeout(id: TimeoutID | null) {
    if (id == null) {
      return;
    }
    if (this.manual) {
      if (this.manualTimers[id] != null) {
        delete this.manualTimers[id];
      }
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
    this.animationId = null;
    clearTimeout(this.syncNowTimer);
    this.updateSyncNow = true;
    this.drawQueue = this.nextDrawQueue;
    this.nextDrawQueue = [];
    let nowSeconds = now * 0.001;
    if (this.manual) {
      nowSeconds = this.now() * 0.001;
    }
    for (let i = 0; i < this.drawQueue.length; i += 1) {
      this.drawQueue[i](nowSeconds);
    }
    this.drawQueue = [];
    this.lastFrame = now;
  }

  queueNextFrame(func: (?number) => void) {
    this.nextDrawQueue.push(func);
    if (this.manual && this.manualOneFrameOnly) {
      if (this.manualQueueCounter >= 1) {
        return;
      }
      this.manualQueueCounter += 1;
    }
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
    // console.log('animate next frame', this.animationId)
    if (this.animationId == null) {
      // console.log('request animation frame')
    // cancelAnimationFrame(this.animationId);
    // $FlowFixMe
      this.animationId = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
      // this.animationId = nextFrame;
    }
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default GlobalAnimation;
