// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';


export type TypeParallelAnimationStepInputOptions = {
  steps?: Array<AnimationStep>;
} & TypeAnimationStepInputOptions;

// Animations get started from a parent, but finish themselves
export class ParallelAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;

  constructor(
    stepsOrOptionsIn: Array<AnimationStep> | TypeParallelAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeParallelAnimationStepInputOptions>
  ) {
    const defaultOptions = { steps: [] };
    let options;
    if (Array.isArray(stepsOrOptionsIn)) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.steps = stepsOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, stepsOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      this.steps = [options.steps];
    } else if (options.steps != null) {
      this.steps = options.steps;
    }
  }

  with(step: AnimationStep) {
    this.steps.push(step);
    return this;
  }

  nextFrame(now: number) {
    let remaining = null;
    if (this.beforeFrame != null) {
      this.beforeFrame(now - this.startTime);
    }
    this.steps.forEach((step) => {
      if (step.state === 'animating' || step.state === 'waitingToStart') {
        const stepRemaining = step.nextFrame(now);
        // console.log(step.element.uid, stepRemaining)
        if (remaining === null) {
          remaining = stepRemaining;
        }
        if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
      }
    });
    if (this.afterFrame != null) {
      this.afterFrame(now - this.startTime);
    }
    if (remaining === null) {
      remaining = 0;
    }
    if (remaining >= 0) {
      this.finish();
    }
    return remaining;
  }

  finishIfZeroDuration() {
    let state = 'finished';
    this.steps.forEach((step) => {
      if (step.state !== 'finished') {
        state = 'animating';
      }
    });
    if (state === 'finished') {
      this.finish();
    }
  }

  startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  start(startTime?: number) {
    this.startWaiting();
    super.start(startTime);
    this.steps.forEach((step) => {
      step.start(startTime);
      step.finishIfZeroDuration();
    });
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle' || this.state === 'finished') {
      return;
    }
    // super.finish(cancelled, force);
    this.state = 'finished';
    let forceToUse = null;
    if (this.completeOnCancel === true) {
      forceToUse = 'complete';
    }
    if (this.completeOnCancel === false) {
      forceToUse = 'noComplete';
    }
    if (force != null) {
      forceToUse = force;
    }
    this.steps.forEach((step) => {
      if (step.state !== 'idle' && step.state !== 'finished') {
        step.finish(cancelled, forceToUse);
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

export function inParallel(
  stepsOrOptionsIn: Array<AnimationStep> | TypeParallelAnimationStepInputOptions = {},
  ...optionsIn: Array<TypeParallelAnimationStepInputOptions>
) {
  return new ParallelAnimationStep(stepsOrOptionsIn, ...optionsIn);
}
