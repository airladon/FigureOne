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
  nowTime: number;
  timeoutId: ?TimeoutID;
  speed: number;
  synchronizedNow: number;
  updateSyncNow: boolean;
  syncNowTimer: TimeoutID;

  manual: boolean;
  animateOnFrame: boolean;
  lastTime: number;
  idCounter: number;
  syncNowTimeout: number;

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
    // if (!GlobalAnimation.instance) {
    this.requestNextAnimationFrame = (
      window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
    );
    //   GlobalAnimation.instance = this;
    //   this.reset();
    // }
    // return GlobalAnimation.instance;
    this.reset();
  }

  /**
   * Reset TimeKeeper to 0 time.
   *
   * All ongoing timers will be cancelled, and all properties reset.
   */
  reset() {
    this.syncNowTimeout = 100;
    this.drawQueue = [];
    this.nextDrawQueue = [];
    this.lastDrawTime = null;
    this.idCounter = 0;
    this.speed = 1;
    this.lastTime = performance.now();
    this.nowTime = this.lastTime;
    this.clearTimeouts();
    if (this.syncNowTimer != null) {
      this.clearTimeout(this.syncNowTimer);
    }
    this.timeoutId = null;
    this.updateSyncNow = true;
    this.manual = false;
    this.animateOnFrame = false;
  }

  clearTimeouts() {
    if (this.timers != null) {    // Needed for when first instantiated
      Object.keys(this.timers).map(id => this.timers[id]).forEach((timer) => {
        if (timer.id != null) {
          clearTimeout(timer.id);
        }
      });
    }
    this.timers = {};
  }


  /**
   * Current relative time now, of most recent animation frame or of most
   * recent synchronized time.
   *
   */
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

  /**
   * Get synchronized relative now time.
   *
   * Each call of `now` when not using manual frames will result in a
   * progressed time value in ms from the page load.
   *
   * This can be a challenge if you want to start two animations at precisely
   * the same time.
   *
   * When syncNow is first called, the actual now time is returned. Each
   * subsequent call of syncNow will return the same number. syncNow is reset
   * on each animation frame, or after `TimeKeeper.syncNowTimeout` is ellapsed
   * (defaults to 100ms).
   */
  syncNow() {
    if (this.updateSyncNow) {
      this.updateSyncNow = false;
      this.synchronizedNow = this.now();
      // this.syncNowTimer = setTimeout(() => { this.updateSyncNow = true; }, this.syncNowTimeout);
      this.syncNowTimer = this.setTimeout(() => { this.updateSyncNow = true; }, this.syncNowTimeout)
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
    Object.keys(this.timers).forEach((id) => {
      const timer = this.timers[id];
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

  /**
   * Set manual frames.
   * When set, all animation frames can only be initiated with `frame`.
   */
  setManualFrames() {
    this.updateNow();
    this.manual = true;
  }

  /**
   * End manual frames.
   * When ended, animation frames will again be triggered by
   * requestAnimationFrame from the browser.
   */
  endManualFrames() {
    this.manual = false;
    this.lastTime = performance.now();
  }

  /**
   * Step manual frames by a delta time in seconds.
   * @param {number} timeStepInSeconds
   */
  frame(timeStepInSeconds: number) {
    // this.manualQueueCounter = 0;
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
        } else if (timer.timeout < nextTimer.timer.timeout) {
          nextTimer = { id, timer };
        } else if (timer.timeout === nextTimer.timer.timeout && timer.stateTimer) {
          nextTimer = { id, timer };
        }
      }
    }
    if (nextTimer == null) {
      return 0;
    }

    const { callback, timeout } = nextTimer.timer;
    this.nowTime = timeout;
    this.lastTime = timeout;
    callback();
    this.draw();
    delete this.timers[nextTimer.id];
    return this.incrementTimers(targetTime);
  }

  /**
   * Use like normal setTimeout in javascript.
   *
   * @param {function(): void} callback function to be called after some time
   * @param {number} time in ms
   * @param {string} description timer description useful for debugging but not
   * requied ('')
   * @param {boolean} stateTime internal use only
   *
   * @return {number} unique identifier that can be used to clear timer with
   * `clearTimeout`
   */
  setTimeout(
    callback: function,
    time: number,
    description: string = '',
    stateTimer: boolean = false,
  ): number {
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

  /**
   * Clear a current timer (the callback will not be called).
   *
   * @param {number | null} id timer identifier return from `setTimeout`. If
   * null, no action occurs.
   */
  clearTimeout(id: number | null) {
    if (id == null) {
      return;
    }
    const timer = this.timers[`${id}`];
    if (timer != null) {
      if (timer.id != null) {
        clearTimeout(timer.id);
      }
      delete this.timers[`${id}`];
    }
  }


  draw() {
    this.animationId = null;
    clearTimeout(this.syncNowTimer);
    this.updateSyncNow = true;
    this.drawQueue = this.nextDrawQueue;
    this.nextDrawQueue = [];
    this.updateNow();
    const nowSeconds = this.now() * 0.001;
    for (let i = 0; i < this.drawQueue.length; i += 1) {
      this.drawQueue[i](nowSeconds);
    }
    this.drawQueue = [];
    this.lastDrawTime = this.nowTime;
  }

  /**
   * Queue function to be called the next time an animation frame is triggered
   *
   * @param {function(number): void} func function that will be passed the
   * current time as an input parameter when it is called
   */
  queueNextFrame(func: (?number) => void) {
    this.nextDrawQueue.push(func);
    if (this.nextDrawQueue.length === 1) {
      this.animateNextFrame();
    }
  }


  animateNextFrame() {
    // When in manual, figure.draw will continue to call animateNextFrame
    // if there is animation remaining. This can quickly spiral out of control
    // so we only want to allow an animation frame to draw when this class's
    // `frame` method is called.
    if (this.manual) {
      if (this.animateOnFrame && this.animationId == null) {
        this.animateOnFrame = false;
        this.animationId = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
      }
      this.animateOnFrame = false;
      return;
    }
    if (this.animationId == null) {
    // $FlowFixMe
      this.animationId = this.requestNextAnimationFrame.call(window, this.draw.bind(this));
    }
  }

  _dup() {
    return this;
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default GlobalAnimation;
