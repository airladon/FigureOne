// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import GlobalAnimation from '../../webgl/GlobalAnimation';
import type { AnimationStartTime } from '../AnimationManager';


/**
 * Parallel animation step options object
 * @extends OBJ_AnimationStep
 * @property {Array<AnimationStep>} steps animation steps to perform in parallel
 */
export type OBJ_ParallelAnimationStep = {
  steps?: Array<AnimationStep>;
} & OBJ_AnimationStep;

/**
 * Execute an array of `{@link AnimationStep}`s in parallel.
 *
 * ![](./assets1/parallel_animation.gif)
 *
 * The parallel animation step will not complete till all steps are finished.
 *
 * @param {Array<AnimationStep> | OBJ_SerialAnimationStep} steps
 * animation steps to perform in serial
 * @extends AnimationStep
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Use `AnimationBuilder` for a more clean look
 * p.animations.new()
 *   .delay(1)
 *   .inParallel([
 *     p.animations.builder()
 *       .scale({ target: 0.5, duration: 1 })
 *       .scale({ target: 2, duration: 1 })
 *       .scale({ target: 1, duration: 2 }),
 *     p.animations.color({ target: [0, 0, 1, 1], duration: 4 }),
 *     p.animations.rotation({ target: Math.PI, duration: 4 }),
 *   ])
 *   .start();
 */
// Animations get started from a parent, but finish themselves
export class ParallelAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;

  /**
   * @hideconstructor
   */
  constructor(
    stepsOrOptionsIn: Array<AnimationStep | null> | OBJ_ParallelAnimationStep = {},
    ...optionsIn: Array<OBJ_ParallelAnimationStep>
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
    let steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      steps = [options.steps];
    } else if (options.steps != null) {
      ({ steps } = options);
    }
    this.steps = [];
    steps.forEach((step) => {
      if (step != null) {
        this.steps.push(step);
      }
    });
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
    if (step != null) {
      this.steps.push(step);
    }
    return this;
  }

  nextFrame(now: number) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining = null;
    if (this.beforeFrame != null) { // $FlowFixMe - as this has been confirmed
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
    if (this.afterFrame != null) { // $FlowFixMe - as this has been confirmed
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

  start(startTime: ?AnimationStartTime = null) {
    this.startWaiting();
    super.start(startTime);
    this.steps.forEach((step) => {
      step.start(startTime);
      step.finishIfZeroDuration();
    });
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'freeze' = null) {
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
      forceToUse = 'freeze';
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
    });
    return totalDuration;
  }

  getRemainingTime(now: number = new GlobalAnimation().now() / 1000) {
    const totalDuration = this.getTotalDuration();
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      }
      return 0;
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
  stepsOrOptionsIn: Array<AnimationStep | null> | OBJ_ParallelAnimationStep = {},
  ...optionsIn: Array<OBJ_ParallelAnimationStep>
) {
  return new ParallelAnimationStep(stepsOrOptionsIn, ...optionsIn);
}
