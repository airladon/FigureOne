// import * as tools from '../../tools/math';
// import { FigureElement } from '../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
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
 * ![](./apiassets/parallel_animation.gif)
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
 * p.animations.new()
 *   .inParallel([
 *     p.animations.position({ target: [1, 0], duration: 2 }),
 *     p.animations.scale({ target: 2, duration: 2 }),
 *   ])
 *   .start();
 *
 * @example
 * // One of the parallel steps is a series of steps
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
    const defaultOptions = { steps: [], duration: 0 };
    let options;
    if (Array.isArray(stepsOrOptionsIn)) {
      options = joinObjects<any>({}, defaultOptions, ...optionsIn);
      options.steps = stepsOrOptionsIn;
    } else {
      options = joinObjects<any>({}, defaultOptions, stepsOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.steps = [];
    let steps: Array<AnimationStep | null> = [];
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

  override _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
    ];
  }

  override _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'parallelAnimationStep';
  }

  override setTimeDelta(delta: number | null | undefined) {
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

  override setTimeSpeed(oldSpeed: number, newSpeed: number, now: number) {
    super.setTimeSpeed(oldSpeed, newSpeed, now);
    this.steps.forEach(step => step.setTimeSpeed(oldSpeed, newSpeed, now));
  }

  override nextFrame(now: number, speed: number = 1) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining: number | null | undefined;
    if (this.beforeFrame != null) {
      this.beforeFrame(now - this.startTime!);
    }
    this.steps.forEach((step) => {
      if (step.state === 'animating' || step.state === 'waitingToStart') {
        const stepRemaining = step.nextFrame(now, speed);
        if (remaining === undefined) {
          remaining = stepRemaining;
        } else if (remaining === null || stepRemaining === null) {
          remaining = null;
        } else if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
      }
    });
    if (this.afterFrame != null) {
      this.afterFrame(now - this.startTime!);
    }
    if (remaining === null) {
      return null;
    }
    if (remaining === undefined) {
      return 0;
    }
    if (remaining >= 0) {
      this.finish();
    }
    return remaining;
  }

  override finishIfZeroDuration() {
    let state: string = 'finished';
    this.steps.forEach((step) => {
      if (step.state !== 'finished') {
        state = 'animating';
      }
    });
    if (state === 'finished') {
      this.finish();
    }
  }

  override startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  override start(startTime: AnimationStartTime | null = null) {
    this.startWaiting();
    super.start(startTime);
    this.steps.forEach((step) => {
      step.start(startTime);
      step.finishIfZeroDuration();
    });
  }

  override finish(cancelled: boolean = false, force: 'complete' | 'freeze' | null = null) {
    if (this.state === 'idle' || this.state === 'finished') {
      return;
    }
    // super.finish(cancelled, force);
    this.state = 'finished';
    let forceToUse: 'complete' | 'freeze' | null = null;
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

  override getTotalDuration() {
    let totalDuration = 0;
    for (let i = 0; i < this.steps.length; i += 1) {
      const step = this.steps[i];
      const stepDuration = step.getTotalDuration();
      if (stepDuration == null) {
        return null;
      }
      if (stepDuration > totalDuration) {
        totalDuration = stepDuration;
      }
    }
    return totalDuration;
  }

  override getRemainingTime(now: number) {
    if (this.state !== 'animating' && this.state !== 'waitingToStart') {
      return 0;
    }
    const totalDuration = this.getTotalDuration();
    if (totalDuration == null) {
      return null;
    }
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      }
      return 0;
    }
    const deltaTime = now - this.startTime;
    return totalDuration - deltaTime;
  }

  override _dup() {
    const step = new ParallelAnimationStep();
    duplicateFromTo(this, step, ['timeKeeper']);
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}

export function inParallel(
  stepsOrOptionsIn: Array<AnimationStep | null> | OBJ_ParallelAnimationStep = {},
  ...optionsIn: Array<OBJ_ParallelAnimationStep>
) {
  return new ParallelAnimationStep(stepsOrOptionsIn, ...optionsIn);
}
