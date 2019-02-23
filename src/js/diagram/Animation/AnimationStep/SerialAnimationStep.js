// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';

export type TypeSerialAnimationStepInputOptions = {
  steps?: Array<AnimationStep>;
} & TypeAnimationStepInputOptions;

export class SerialAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;
  index: number;

  constructor(
    stepsOrOptionsIn: Array<AnimationStep> | TypeSerialAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeSerialAnimationStepInputOptions>
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
    this.index = 0;
    this.steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      this.steps = [options.steps];
    } else if (options.steps != null) {
      this.steps = options.steps;
    }
  }

  // constructor(optionsIn: TypeSerialAnimationStepInputOptions = {}) {
  //   super(optionsIn);
  //   this.index = 0;
  //   const defaultOptions = {};
  //   const options = joinObjects({}, defaultOptions, optionsIn);
  //   this.steps = [];
  //   if (!Array.isArray(options.steps) && options.steps != null) {
  //     this.steps = [options.steps];
  //   } else if (options.steps != null) {
  //     this.steps = options.steps;
  //   }
  //   return this;
  // }

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

  start(startTime?: number) {
    if (this.state !== 'animating') {
      this.startWaiting();
      super.start(startTime);
      this.index = 0;
      if (this.steps.length > 0) {
        this.steps[0].start(startTime);
      }
    }
  }

  nextFrame(now: number) {
    let remaining = -1;
    if (this.index <= this.steps.length - 1) {
      remaining = this.steps[this.index].nextFrame(now);
      // console.log('serial', now, this.index, remaining)
      if (remaining > 0) {
        if (this.index === this.steps.length - 1) {
          this.finish();
          return remaining;
        }
        this.index += 1;
        this.steps[this.index].start(now - remaining);
        return this.nextFrame(now);
      }
    }
    return remaining;
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
    const step = new SerialAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function inSerial(
  stepsOrOptionsIn: Array<AnimationStep> | TypeSerialAnimationStepInputOptions = {},
  ...optionsIn: Array<TypeSerialAnimationStepInputOptions>
) {
  return new SerialAnimationStep(stepsOrOptionsIn, ...optionsIn);
}

