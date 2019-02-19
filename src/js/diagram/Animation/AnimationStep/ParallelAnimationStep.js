// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';


export type TypeParallelAnimationStepInputOptions = {
  steps?: Array<AnimationStep> | AnimationStep;
} & TypeAnimationStepInputOptions;

// Animations get started from a parent, but finish themselves
export default class ParallelAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;

  constructor(optionsIn: TypeParallelAnimationStepInputOptions = {}) {
    super(optionsIn);
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      this.steps = [options.steps];
    } else if (options.steps != null) {
      this.steps = options.steps;
    }
  }

  nextFrame(now: number) {
    let remaining = -1;
    this.steps.forEach((step) => {
      const stepRemaining = step.nextFrame(now);
      if (remaining === -1) {
        remaining = stepRemaining;
      }
      if (stepRemaining < remaining) {
        remaining = stepRemaining;
      }
    });
    if (remaining > 0) {
      this.finish();
    }
    return remaining;
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
    this.steps.forEach((step) => {
      step.start();
    });
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

  _dup() {
    const step = new ParallelAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}
