// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects } from '../../../tools/tools';

export type TypeSerialAnimationStepInputOptions = {
  steps: Array<AnimationStep> | AnimationStep;
} & TypeAnimationStepInputOptions;

export default class SerialAnimationStep extends AnimationStep {
  animationSteps: Array<AnimationStep>;
  index: number;

  constructor(optionsIn: TypeSerialAnimationStepInputOptions) {
    super(optionsIn);
    this.index = 0;
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.animationSteps = [];
    if (!Array.isArray(options.steps)) {
      this.animationSteps = [options.steps];
    } else if (options.steps != null) {
      this.animationSteps = options.steps;
    }
    return this;
  }

  then(step: AnimationStep) {
    this.animationSteps.push(step);
    return this;
  }

  startWaiting() {
    super.startWaiting();
    this.animationSteps.forEach((animationStep) => {
      animationStep.startWaiting();
    });
  }

  start() {
    this.startWaiting();
    super.start();
    this.index = 0;
    if (this.animationSteps.length > 0) {
      this.animationSteps[0].start();
    }
  }

  nextFrame(now: number) {
    const remaining = this.animationSteps[this.index].nextFrame(now);
    if (remaining > 0) {
      if (this.index === this.animationSteps.length - 1) {
        this.finish();
        return remaining;
      }
      this.index += 1;
      this.animationSteps[this.index].start();
      this.animationSteps[this.index].startTime = now - remaining;
      this.nextFrame(now);
    }
    return 0;
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    this.animationSteps.forEach((animationStep) => {
      if (animationStep.state !== 'idle') {
        animationStep.finish(cancelled, force);
      }
    });
    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}
