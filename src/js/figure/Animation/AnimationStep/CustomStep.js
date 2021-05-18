// @flow
// import * as tools from '../../../tools/math';
import {
  joinObjects, duplicateFromTo,
} from '../../../tools/tools';
import type {
  OBJ_AnimationStep,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import type { AnimationStartTime } from '../AnimationManager';

/**
 * {@link CustomAnimationStep} options object
 *
 * @extends OBJ_AnimationStep
 *
 * @property {string | function(int): void} callback function to run each
 * animation frame
 * @property {number} [startPercent] percent to start animation at (`0`)
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 */
export type OBJ_CustomAnimationStep = {
  callback?: string | ((number) => void);
  startPercent?: number;
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number;
  duration?: number | null,
} & OBJ_AnimationStep;

/**
 * Custom animation step
 *
 * ![](./apiassets/custom_animation.gif)
 *
 * Custom animation steps are useful for orchestrating complex animations, or
 * performing non-linear animations.
 *
 * This step will execute a custom callback function on each animation frame
 * for the duration of the animation. The callback function will be passed the
 * percentage progress of the animation.
 *
 * The percentage progress can either be linear with time, or non-linear.
 * Built-in non-linear progressions are `'easeinout'`, `'easein`' and
 * `'easeout'` which will slow progress at the start or end of the animation.
 * A function to create a custom non-linear progressor can also be used.
 *
 * @extends AnimationStep
 *
 * @param {OBJ_CustomAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Move an object through a sine wave of wavelength 1 from
 * // x = -1 to x = 1
 * function sine(percentComplete) {
 *   const x = -1 + percentComplete * 2;
 *   const y = 0.5 * Math.sin(Math.PI * 2 * x);
 *   p.setPosition(x, y);
 * }
 *
 * p.animations.new()
 *   .custom({ callback: sine, duration: 5 })
 *   .start();
 */
export class CustomAnimationStep extends AnimationStep {
  element: ?Object;
  callback: ?(number) => void;
  startPercent: ?number;
  progression: string | ((number, ?boolean) => number);
  customProperties: Object;

  /**
   * @hideconstructor
   */
  constructor(...optionsIn: Array<OBJ_CustomAnimationStep>) {
    const AnimationStepOptionsIn = joinObjects({}, ...optionsIn);
    super(AnimationStepOptionsIn);
    const defaultPositionOptions = {
      element: null,
      callback: null,
      startPercent: 0,
      progression: 'linear',
      duration: 1,
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    this.element = options.element;
    this.progression = options.progression;
    if (this.progression === 'linear') {
      this.progression = 'tools.math.linear';
    } else if (options.progression === 'easein') {
      this.progression = 'tools.math.easein';
    } else if (options.progression === 'easeout') {
      this.progression = 'tools.math.easeout';
    } else if (options.progression === 'easeinout') {
      this.progression = 'tools.math.easeinout';
    }
    this.callback = options.callback;
    this.startPercent = options.startPercent;
    // if (typeof this.progression === 'function') {
    //   this.startTimeOffset = this.progression(options.startPercent, true) * options.duration;
    // }
    this.startTimeOffset = this.getPercentComplete(options.startPercent, true) * options.duration;
    this.duration = options.duration;
    this.customProperties = options.customProperties;
  }

  // fnExec(idOrFn: string | Function | null, ...args: any) {
  //   const result = this.fnMap.exec(idOrFn, ...args);
  //   if (result == null && this.element != null) {
  //     return this.element.fnMap.exec(idOrFn, ...args);
  //   }
  //   return result;
  // }
  fnExec(idOrFn: string | Function | null, ...args: any) {
    // const result = this.fnMap.exec(idOrFn, ...args);
    // if (result == null && this.element != null) {
    //   return this.element.fnMap.exec(idOrFn, ...args);
    // }
    // return result;
    if (this.element != null) {
      return this.fnMap.execOnMaps(
        idOrFn, [this.element.fnMap.map], ...args,
      );
    }
    return this.fnMap.exec(idOrFn, ...args);
  }

  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'startPercent',
      'progression',
      'customProperties',
      'element',
    ];
  }

  // _fromState(state: Object, getElement: ?(string) => FigureElement, timeKeeper: TimeKeeper) {
  //   // const obj = new this.constructor();
  //   joinObjects(this, state);
  //   if (this.element != null && typeof this.element === 'string' && getElement != null) {
  //     this.element = getElement(this.element);
  //   }
  //   this.timeKeeper = timeKeeper;
  //   return this;
  // }

  // _state(options: Object) {
  //   const state = super._state(options);
  //   if (this.element != null) {
  //     state.state.element = {
  //       f1Type: 'de',
  //       state: this.element.getPath(),
  //     };
  //   }
  //   return state;
  // }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'customAnimationStep';
  }

  setFrame(deltaTime: number) {
    let cancelled;
    if (this.duration == null) {
      cancelled = this.fnExec(this.callback, deltaTime, this.customProperties);
    } else {
      const percentTime = deltaTime / this.duration;
      const percentComplete = this.getPercentComplete(percentTime);
      cancelled = this.fnExec(this.callback, percentComplete, this.customProperties);
    }
    if (cancelled) {
      this.duration = deltaTime;
    }
  }

  getPercentComplete(percentTime: number, invert: boolean = false) {
    if (typeof this.progression === 'string') {
      const result = this.fnExec(this.progression, percentTime, invert);
      if (result == null) {
        return 0;
      }
      return result;
    }
    if (typeof this.progression === 'function') {
      return (this.progression(percentTime));
    }
    return 0;
  }

  setToEnd() {
    this.fnExec(this.callback, 1, this.customProperties);
  }

  _dup() {
    const step = new CustomAnimationStep();
    duplicateFromTo(this, step, ['timeKeeper']);
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}

export function custom(...optionsIn: Array<OBJ_CustomAnimationStep>) {
  return new CustomAnimationStep(...optionsIn);
}

