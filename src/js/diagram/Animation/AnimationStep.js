// @flow
// import {
//   Transform, Point,
//   Rotation, getDeltaAngle, getMaxTimeFromVelocity,
// } from '../tools/g2';
// import * as tools from '../tools/math';
// import type { pathOptionsType } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
// import { DiagramElement } from './Element';
import { joinObjects, duplicateFromTo } from '../../tools/tools';


export type TypeAnimationStepInputOptions = {
  onFinish?: ?(boolean) => void;
  completeOnCancel?: ?boolean;    // true: yes, false: no, null: no preference
};

export default class AnimationStep {
  startTime: number;
  duration: number;
  // animations: Array<AnimationStep>;
  onFinish: ?(boolean) => void;
  completeOnCancel: ?boolean;
  state: 'animating' | 'waitingToStart' | 'idle';
  startTimeOffset: number;

  constructor(optionsIn: TypeAnimationStepInputOptions = {}) {
    const defaultOptions = {
      onFinish: null,
      completeOnCancel: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.onFinish = options.onFinish;
    this.completeOnCancel = options.completeOnCancel;
    this.startTime = -1;
    this.state = 'idle';
    // Each animation frame will typically calculate a percent complete,
    // which is based on the duration, and from the percent complete calculate
    // the position of the current animation.
    // However, if you want to start an animation not from 0 percent, then this
    // value can be used. When startTimeOffset != 0, then the first frame
    // will be calculated at this.progression(startTimeOffset). The animation
    // will still go to 1, but will be reduced in duration by startTimeOffset.
    // When progressions aren't linear, then this time is non-trival.
    this.startTimeOffset = 0;
    return this;
  }

  // returns remaining time if this step completes
  // Return of 0 means this step is still going
  nextFrame(now: number) {
    if (this.startTime === -1) {
      this.startTime = now - this.startTimeOffset;
    }
    let remainingTime = 0;
    let deltaTime = now - this.startTime;
    if (deltaTime > this.duration) {
      remainingTime = deltaTime - this.duration;
      deltaTime = this.duration;
    }
    this.setFrame(deltaTime);
    if (remainingTime > 0) {
      this.finish();
    }
    return remainingTime;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setFrame(deltaTime: number) {
  }

  startWaiting() {
    this.state = 'waitingToStart';
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  start(startTime: number = -1) {
    this.startTime = startTime;
    this.state = 'animating';
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    // this.startTime = -2;
    this.state = 'idle';
    // this.onFinish(false);
  }

  cancel(force: ?'complete' | 'noComplete' = null) {
    this.finish(true, force);
  }

  _dup() {
    const step = new AnimationStep();
    duplicateFromTo(this, step);
    return step;
  }

  whenFinished(callback: (boolean) => void) {
    this.onFinish = callback;
    return this;
  }

  ifCanceledThenComplete() {
    this.completeOnCancel = true;
    return this;
  }

  ifCanceledThenStop() {
    this.completeOnCancel = false;
    return this;
  }
}
