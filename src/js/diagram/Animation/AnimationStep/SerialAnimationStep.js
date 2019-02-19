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
  steps: Array<AnimationStep>;
  index: number;

  constructor(optionsIn: TypeSerialAnimationStepInputOptions) {
    super(optionsIn);
    this.index = 0;
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      this.steps = [options.steps];
    } else if (options.steps != null) {
      this.steps = options.steps;
    }
    return this;
  }

  then(step: AnimationStep) {
    this.steps.push(step);
    return this;
  }

  startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  start() {
    this.startWaiting();
    super.start();
    this.index = 0;
    if (this.steps.length > 0) {
      this.steps[0].start();
    }
  }

  nextFrame(now: number) {
    const remaining = this.steps[this.index].nextFrame(now);
    if (remaining > 0) {
      if (this.index === this.steps.length - 1) {
        this.finish();
        return remaining;
      }
      this.index += 1;
      this.steps[this.index].start();
      this.steps[this.index].startTime = now - remaining;
      this.nextFrame(now);
    }
    return 0;
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    this.steps.forEach((step) => {
      if (step.state !== 'idle') {
        step.finish(cancelled, force);
      }
    });
    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}
