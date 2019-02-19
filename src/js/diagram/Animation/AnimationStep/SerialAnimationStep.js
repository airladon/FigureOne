// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects } from '../../../tools/tools';

export type TypeSerialAnimationStepInputOptions = {
  animations: Array<AnimationStep> | AnimationStep;
} & TypeAnimationStepInputOptions;

export default class SerialAnimationStep extends AnimationStep {
  animations: Array<AnimationStep>;
  index: number;

  constructor(optionsIn: TypeSerialAnimationStepInputOptions) {
    super(optionsIn);
    this.index = 0;
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (!Array.isArray(options.animations)) {
      this.animations = [options.animations];
    } else {
      this.animations = options.animations;
    }
    return this;
  }

  then(step: AnimationStep) {
    this.animations.push(step);
    return this;
  }

  startWaiting() {
    super.startWaiting();
    this.animations.forEach((animationStep) => {
      animationStep.startWaiting();
    });
  }

  start() {
    this.startWaiting();
    super.start();
    this.index = 0;
    if (this.animations.length > 0) {
      this.animations[0].start();
    }
  }

  nextFrame(now: number) {
    const remaining = this.animations[this.index].nextFrame(now);
    if (remaining > 0) {
      if (this.index === this.animations.length - 1) {
        this.finish();
        return remaining;
      }
      this.index += 1;
      this.animations[this.index].start();
      this.animations[this.index].startTime = now - remaining;
      this.nextFrame(now);
    }
    return 0;
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    this.animations.forEach((animationStep) => {
      if (animationStep.state !== 'idle') {
        animationStep.finish(cancelled, force);
      }
    });
    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}
