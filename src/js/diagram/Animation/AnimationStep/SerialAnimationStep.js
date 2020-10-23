// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import GlobalAnimation from '../../webgl/GlobalAnimation';
import type { AnimationStartTime } from '../AnimationManager';

/**
 * Serial animation step options object
 *
 * @extends OBJ_AnimationStep
 * @property {Array<AnimationStep>} [steps] animation steps to execute in series
 */
export type OBJ_SerialAnimationStep = {
  steps?: Array<AnimationStep>;
} & OBJ_AnimationStep;

/**
 * Execute an array of {@link AnimationStep}s in series.
 *
 * ![](./assets1/serial_animation.gif)
 *
 * Often the {@link AnimationBuilder} class which extends
 * `SerialAnimationStep` can be used to create serial animations
 * in a more clean way.
 *
 * @param {Array<AnimationStep> | OBJ_SerialAnimationStep} steps
 * animation steps to perform in serial
 * @extends AnimationStep
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using a SerialAnimation step can be cumbersome, but
 * // can be useful if modularizing animations between files
 * const Rot = Fig.Animation.RotationAnimationStep;
 * const Delay = Fig.Animation.DelayAnimationStep;
 * const Pos = Fig.Animation.PositionAnimationStep;
 *
 * const series = new Fig.Animation.SerialAnimationStep([
 *   new Rot({ element: p, target: Math.PI / 2, duration: 2 }),
 *   new Delay({ duration: 0.2 }),
 *   new Rot({ element: p, target: Math.PI, duration: 2 }),
 *   new Delay({ duration: 0.2 }),
 *   new Rot({ element: p, target: 0, direction: -1, duration: 1.3, progression: 'easein' }),
 *   new Pos({ element: p, target: [1, 0], duration: 2, progression: 'easeout' }),
 * ]);
 *
 * p.animations.animations.push(series);
 * p.animations.start()
 *
 * @example
 * // Same animation but with `AnimationBuilder` (which is an extension of
 * // `SerialAnimationStep`)
 * p.animations.new()
 *   .rotation({ target: Math.PI / 2, duration: 2 })
 *   .delay(0.2)
 *   .rotation({ target: Math.PI, duration: 2 })
 *   .delay(0.2)
 *   .rotation({ target: 0, duration: 1, direction: -1, progression: 'easein' })
 *   .position({ target: [1, 0], duration: 2, progression: 'easeout' })
 *   .start();
 */
export class SerialAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;
  index: number;

  /**
   * @hideconstructor
   */
  constructor(
    stepsOrOptionsIn: Array<AnimationStep> | OBJ_SerialAnimationStep = {},
    ...optionsIn: Array<OBJ_SerialAnimationStep>
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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
      'index',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'serialAnimationStep';
  }

  // constructor(optionsIn: OBJ_SerialAnimationStep = {}) {
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

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    if (this.steps != null) {
      this.steps.forEach((step) => {
        step.setTimeDelta(delta);
      });
    }
  }

  then(step: ?AnimationStep) {
    if (step != null) {
      this.steps.push(step);
    }
    return this;
  }

  startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  // $FlowFixMe
  start(startTime: ?AnimationStartTime = null) {
    if (this.state !== 'animating') {
      this.startWaiting();
      super.start(startTime);
      this.index = 0;
      if (this.steps.length > 0) {
        this.steps[0].start(startTime);
        this.steps[0].finishIfZeroDuration();
      }
    }
    this.finishIfZeroDuration();
  }

  finishIfZeroDuration() {
    let i = 0;
    let step = this.steps[0];
    while (i < this.steps.length && step.state === 'finished') {
      i += 1;
      if (i < this.steps.length) {
        this.index = i;
        step = this.steps[i];
        step.start(this.steps[i - 1].startTime);
        step.finishIfZeroDuration();
      }
    }
    if (i === this.steps.length) {
      this.finish();
    }
  }

  nextFrame(now: number) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining = -1;
    if (this.beforeFrame != null) { // $FlowFixMe - as this has been confirmed
      this.beforeFrame(now - this.startTime);
    }
    if (this.index <= this.steps.length - 1) {
      remaining = this.steps[this.index].nextFrame(now);
      if (this.afterFrame != null) { // $FlowFixMe - as this has been confirmed
        this.afterFrame(now - this.startTime);
      }
      // console.log('serial', now, this.index, remaining)
      if (remaining >= 0) {
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
      totalDuration += step.getTotalDuration();
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
    const step = new SerialAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function inSerial(
  stepsOrOptionsIn: Array<AnimationStep> | OBJ_SerialAnimationStep = {},
  ...optionsIn: Array<OBJ_SerialAnimationStep>
) {
  return new SerialAnimationStep(stepsOrOptionsIn, ...optionsIn);
}

