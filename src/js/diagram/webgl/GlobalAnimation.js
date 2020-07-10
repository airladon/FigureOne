// @flow

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
  now: number;
  timeoutId: ?TimeoutID;


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
      this.drawQueue = [];
      this.nextDrawQueue = [];
      this.lastFrame = null;
      this.debug = false;
      this.simulatedFPS = 60;
      this.debugFrameTime = 0.5;
      this.timeoutId = null;
      // this.drawScene = this.draw.bind(this);
    }
    return GlobalAnimation.instance;
  }

  setDebugFrameRate(simulatedFPS: number = 60, frameTime: ?number = 1) {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }
    cancelAnimationFrame(this.animationId);
    this.simulatedFPS = simulatedFPS;
    this.debugFrameTime = frameTime;
    this.debug = true;
    this.now = performance.now();
    this.queueNextDebugFrame();
  }

  queueNextDebugFrame() {
    if (this.debugFrameTime != null) {
      this.timeoutId = setTimeout(() => {
        this.now += 1 / this.simulatedFPS * 1000;
        if (this.nextDrawQueue.length > 0) {
          this.draw(this.now);
        }
        console.log(this.now, performance.now())
        this.queueNextDebugFrame();
      }, this.debugFrameTime * 1000);
    } else {
      // debugger;
      this.now += 1 / this.simulatedFPS * 1000;
      if (this.nextDrawQueue.length > 0) {
        this.draw(this.now);
      }
      this.queueNextDebugFrame();
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
    console.log('here')
  }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export default GlobalAnimation;
