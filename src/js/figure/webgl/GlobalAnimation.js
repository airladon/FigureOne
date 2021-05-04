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
/**
 * TimeKeeper keeps time for the figure, where time is the number of
 * milliseconds after the page load.
 *
 * The current time can be accessed using the `now` method.
 *
 * In it's default form, `now` is the same as the system times
 * `performance.now()` or the animation time sent through on frames requested
 * from `requestAnimationFrame` .
 *
 * However, these system times diverge from `now` when TimeKeeper's time
 * speed is changed, or manual time deltas are enabled.
 *
 * When time speed is n times faster than real time, `now` will report n times
 * more passage of time from the page load than real time. So if the speed is
 * set to 2, then `now` will report time passing twice as fast.
 */
class GlobalAnimation {
  // Method for requesting the next animation frame
  requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  animationId: ?AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  drawQueue: Array<(number) => void>;
  nextDrawQueue: Array<(number) => void>;
  lastDrawTime: ?number;
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
  // timers: Array<TimeoutID>;
  syncNowTimer: TimeoutID;
  manual: boolean;
  manualTimers: Object;
  manualTimerIds: number;
  manualQueueCounter: number;
  manualOneFrameOnly: boolean;
  animateOnFrame: boolean;
  lastTime: number;
  idCounter: number;

  timers: {
    [id: string]: {
      id: TimeoutID | null;   // if not null, then there is settimeout
      callback: () => void;
      timeout: number;        // timeout target time
      description: string;
      stateTimer: boolean;    // state timers should timeout before other timers
    }
  };

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
    this.lastDrawTime = null;
    this.debug = false;
    this.idCounter = 0;
    this.speed = 1;
    // this.simulatedFPS = 60;
    // this.debugFrameTime = 0.5;
    this.lastTime = performance.now();
    this.nowTime = this.lastTime;
    // if (this.timers != null && this.timers.length > 0) {
    //   this.timers.forEach(id => clearTimeout(id));
    // }
    // if (this.timers != null) {    // Needed for when first instantiated
    //   Object.values(this.timers).forEach((timer) => {
    //     if (timer.id != null) {
    //       clearTimeout(timer.id);
    //     }
    //   });
    // }
    // this.timers = {};
    this.clearTimeouts();
    // this.timers = [];
    // if (this.timeoutId != null) {
    //   clearTimeout(this.timeoutId);
    // }
    this.timeoutId = null;
    // this.now = () => performance.now();
    this.updateSyncNow = true;
    this.manual = false;
    this.manualTimers = {};
    this.manualTimerIds = 0;
    this.manualQueueCounter = 0;
    this.manualOneFrameOnly = true;
    this.animateOnFrame = false;
  }

  clearTimeouts() {
    if (this.timers != null) {    // Needed for when first instantiated
      Object.values(this.timers).forEach((timer) => {
        if (timer.id != null) {
          clearTimeout(timer.id);
        }
      });
    }
    this.timers = {};
  }


  getWhen(when: TypeWhen) {
    if (when === 'now') {
      return this.now();
    }
    if (when === 'prevFrame') {
      return this.lastDrawTime;
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

  updateNow() {
    if (this.manual) {
      return;
    }
    const now = performance.now();
    const delta = now - this.lastTime;
    this.nowTime += delta * this.speed;
    this.lastTime = now;
  }

  // getNow() {
  //   this.updateNow();
  //   return this.nowTime;
  // }

  // getNowManual(deltaInMilliseconds: number = 0) {
  //   this.nowTime += deltaInMilliseconds * this.speed;
  //   this.lastTime = this.nowTime;
  //   return this.nowTime;
  // }

  /**
   * Current relative time.
   *
   * If speed is 1 and manual frames have not been used, then this will return
   * the time in ms after the page is loaded.
   *
   * If speed is not 1, or manual frames have been or are being used, then this
   * will return the relative time in ms taking into account pauses and frame
   * steps from any manual frames, and any speed changes.
   *
   * @param {number} time in ms from page load
   */
  now() {
    if (!this.manual) {
      this.updateNow();
    }
    return this.nowTime;
  }

  /**
   * Set the speed of time. 1 is normal timer, >1 is faster than normal time
   * and <1 is slower than normal time. The speed must be greater than 0.
   *
   * @param {number} speedFactor
   */
  setSpeed(speedFactor: number = 1) {
    if (speedFactor <= 0) {
      throw new Error(`speedFactor ${speedFactor} is not greater than 0`);
    }
    Object.keys(this.timers).map(id => this.timers[id]).forEach((timer) => {
      const remainingTime = timer.timeout - this.nowTime;
      const newRemainingTime = remainingTime / speedFactor;
      if (timer.id != null) {
        clearTimeout(timer.id);
      }
      if (!this.manual) {
        timer.id = setTimeout(timer.callback, newRemainingTime);
      }
    });
    this.speed = speedFactor;
  }

  // setDebugFrameRate(simulatedFPS: number = 60, frameTime: ?number = 1) {
  //   if (this.timeoutId != null) {
  //     clearTimeout(this.timeoutId);
  //   }
  //   if (this.animationId != null) {
  //     cancelAnimationFrame(this.animationId);
  //   }
  //   this.simulatedFPS = simulatedFPS;
  //   this.debugFrameTime = frameTime;
  //   this.debug = true;
  //   this.nowTime = performance.now();
  //   this.now = () => this.nowTime;
  //   this.queueNextDebugFrame();
  // }

  setManualFrames() {
    this.updateNow();
    this.manual = true;
  }

  endManualFrames() {
    this.manual = false;
    this.lastTime = performance.now();
  }

  /**
   * Step manual frames by a delta time in seconds.
   * @param {number} timeStepInSeconds
   */
  frame(timeStepInSeconds: number) {
    this.manualQueueCounter = 0;
    const targetTime = this.nowTime + timeStepInSeconds * 1000;
    this.incrementTimers(targetTime);
    this.nowTime = targetTime;
    this.lastTime = targetTime;
    this.animateOnFrame = true;
    this.animateNextFrame();
  }

  incrementTimers(targetTime: number) {
    if (this.timers == null || Object.keys(this.timers).length === 0) {
      return 0;
    }
    const ids = Object.keys(this.timers);
    let nextTimer = null;
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const timer = this.timers[id];
      if (timer.timeout <= targetTime) {
        if (nextTimer == null) {
          nextTimer = { id, timer };
        } else if (timer.timeout < nextTimer.timeout) {
          nextTimer = { id, timer };
        } else if (timer.timeout === nextTimer.timeout && timer.stateTimer) {
          nextTimer = { id, timer };
        }
      }
    }
    // const nextTimer = Object.keys(this.timers).map(id => this.timers[id]).reduce((acc, val) => {
    //   if (val.timeout === acc.timeout && (val.stateTimer || acc.stateTimer)) {
    //     if (val.stateTimer) {
    //       return val;
    //     }
    //     return acc;
    //   }
    //   if (val.timeout < acc.timeout) {
    //     return val;
    //   }
    //   return acc;
    // });
    // if (nextTimer.timeout > nowTime) {
    //   return;
    // }
    if (nextTimer == null) {
      return 0;
    }

    const { callback, timeout } = nextTimer.timer;
    this.nowTime = timeout;
    this.lastTime = timeout;
    callback();
    this.draw();
    // delete this.manualTimers[`${id}`];
    delete this.timers[nextTimer.id];
    return this.incrementTimers(targetTime);
  }

  incrementManualTimers(maxTimeInMs: number) {
    const timersToFire = [];
    Object.keys(this.manualTimers).forEach((id) => {
      const {
        duration, startTime, f, stateTimer, description,
      } = this.manualTimers[id];
      const endTime = startTime + duration;
      if (maxTimeInMs >= endTime) {
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
    this.lastTime = endTime;
    f();
    this.draw();
    delete this.manualTimers[`${id}`];
    return this.incrementManualTimers(maxTimeInMs);
  }

  // queueNextDebugFrame() {
  //   if (this.debugFrameTime != null) {
  //     this.timeoutId = setTimeout(() => {
  //       this.nowTime += 1 / this.simulatedFPS * 1000;
  //       if (this.nextDrawQueue.length > 0) {
  //         this.draw(this.now());
  //       }
  //       this.queueNextDebugFrame();
  //     }, this.debugFrameTime * 1000);
  //   } else {
  //     this.nowTime += 1 / this.simulatedFPS * 1000;
  //     if (this.nextDrawQueue.length > 0) {
  //       this.draw(this.now());
  //     }
  //   }
  // }

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
    callback: function,
    time: number,
    description: string = '',
    stateTimer: boolean = false,
  ): number {
    // if (this.debug) {
    //   let timeScale = 0;
    //   if (this.debugFrameTime != null) {
    //     timeScale = (this.debugFrameTime || 0) / (1 / this.simulatedFPS);
    //   }
    //   if (timeScale > 0) {
    //     return this.setupTimeout(f, time * timeScale, description, stateTimer);
    //   }
    //   return this.setupTimeout(f, 0, description, stateTimer);
    // }
    // return this.setupTimeout(f, time, description, stateTimer);
    if (!this.manual) {
      this.updateNow();
    }
    this.timers[`${this.idCounter}`] = {
      timeout: this.nowTime + time,
      description,
      stateTimer,
      id: null,
      callback,
    };
    if (!this.manual) {
      this.timers[`${this.idCounter}`].id = setTimeout(callback, time / this.speed);
    }
    this.idCounter += 1;
    return this.idCounter - 1;
  }

  clearTimeout(id: number | null) {
    if (id == null) {
      return;
    }
    // if (this.manual) {
    //   if (this.manualTimers[id] != null) {
    //     delete this.manualTimers[id];
    //   }
    //   return;
    // }
    // clearTimeout(id);

    // const index = this.timers.indexOf(id);
    // if (index > -1) {
    //   this.timers.splice(index, 1);
    // }
    const timer = this.timers[`${id}`]
    if (timer != null) {
      if (timer.id != null) {
        clearTimeout(timer.id);
      }
      delete this.timers[`${id}`];
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

  draw() {
    // console.log(performance.now(), 'draw global', this.nextDrawQueue.length)
    this.animationId = null;
    clearTimeout(this.syncNowTimer);
    this.updateSyncNow = true;
    this.drawQueue = this.nextDrawQueue;
    this.nextDrawQueue = [];
    // let nowSeconds = nowInMs * 0.001;
    // if (this.manual) {
    this.updateNow();
    const nowSeconds = this.now() * 0.001;
    // console.log(nowSeconds)
    // }
    for (let i = 0; i < this.drawQueue.length; i += 1) {
      this.drawQueue[i](nowSeconds);
    }
    this.drawQueue = [];
    this.lastDrawTime = this.nowTime;
    // console.log(performance.now(), 'draw global done')
  }

  queueNextFrame(func: (?number) => void) {
    this.nextDrawQueue.push(func);
    // console.log(performance.now(), 'queue', this.nextDrawQueue.length)
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
    if (this.manual) {
      if (this.animateOnFrame && this.animationId == null) {
        this.animateOnFrame = false;
        this.animationId = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
      }
      this.animateOnFrame = false;
      return;
    }
    if (this.animationId == null) {
    // cancelAnimationFrame(this.animationId);
    // $FlowFixMe
      this.animationId = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
    }
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default GlobalAnimation;
