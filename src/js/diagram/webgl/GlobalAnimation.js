// @flow

// Singleton class that contains projects global variables
class GlobalAnimation {
  // Method for requesting the next animation frame
  requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  drawQueue: Array<(number) => void>;
  nextDrawQueue: Array<(number) => void>;

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
      // this.drawScene = this.draw.bind(this);
    }
    return GlobalAnimation.instance;
  }

  draw(now: number) {
    this.drawQueue = this.nextDrawQueue;
    this.nextDrawQueue = [];
    const nowSeconds = now * 0.001;
    for (let i = 0; i < this.drawQueue.length; i += 1) {
      this.drawQueue[i](nowSeconds);
    }
    this.drawQueue = [];
  }

  queueNextFrame(func: (number) => void) {
    // if (!(func in this.nextDrawQueue)) {
    this.nextDrawQueue.push(func);
    // }

    // if (triggerFrameRequest) {
    //   this.animateNextFrame();
    // }
    if (this.nextDrawQueue.length === 1) {
      this.animateNextFrame();
    }
  }

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
