// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';

export type TypeSerialAnimationStepInputOptions = {
  steps?: Array<AnimationStep>;
} & TypeAnimationStepInputOptions;

export default class SerialAnimationStep extends AnimationStep {
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
    this.startWaiting();
    super.start(startTime);
    this.index = 0;
    if (this.steps.length > 0) {
      this.steps[0].start(startTime);
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
      this.steps[this.index].start(now - remaining);
      this.nextFrame(now);
    }
    return 0;
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
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
      if (step.state !== 'idle') {
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
