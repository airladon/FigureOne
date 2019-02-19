// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from './AnimationStep';
import AnimationStep from './AnimationStep';
import { joinObjects } from '../../tools/tools';


type TypeParallelAnimationStepInputOptions = {
  animations: Array<AnimationStep> | AnimationStep;
} & TypeAnimationStepInputOptions;

// Animations get started from a parent, but finish themselves
export default class ParallelAnimationStep extends AnimationStep {
  animationSteps: Array<AnimationStep>;

  constructor(optionsIn: TypeParallelAnimationStepInputOptions) {
    super(optionsIn);
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (!Array.isArray(options.animations)) {
      this.animationSteps = [options.animations];
    } else {
      this.animationSteps = options.animations;
    }
  }

  nextFrame(now: number) {
    let remaining = -1;
    this.animationSteps.forEach((step) => {
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
    this.animationSteps.forEach((step) => {
      step.startWaiting();
    });
  }

  start() {
    this.startWaiting();
    super.start();
    this.animationSteps.forEach((step) => {
      step.start();
    });
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    this.animationSteps.forEach((step) => {
      if (step.state !== 'idle') {
        step.finish(cancelled, force);
      }
    });
    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}
