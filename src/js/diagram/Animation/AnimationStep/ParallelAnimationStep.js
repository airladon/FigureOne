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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'parallelAnimationStep';
  }

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    if (this.steps != null) {
      this.steps.forEach((step) => {
        step.setTimeDelta(delta);
      });
    }
  }

  with(step: AnimationStep) {
    this.steps.push(step);
    return this;
  }

  nextFrame(now: number) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining = null;
    if (this.beforeFrame != null) {
      this.beforeFrame(now - this.startTime);
    }
    this.steps.forEach((step) => {
      // console.log(step.state, step)
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

  start(startTime: ?number = null) {
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
      this.fnExec(this.onFinish, cancelled);
    }
  }

  getTotalDuration() {
    let totalDuration = 0;
    this.steps.forEach((step) => {
      const stepDuration = step.getTotalDuration();
      if (stepDuration > totalDuration) {
        totalDuration = stepDuration;
      }
    })
    return totalDuration;
  }

  getRemainingTime(now: number = performance.now() / 1000) {
    const totalDuration = this.getTotalDuration();
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      } else {
        return 0;
      }
    }
    const deltaTime = now - this.startTime;
    return totalDuration - deltaTime;
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
