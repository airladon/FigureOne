// @flow
// import * as tools from '../../../tools/math';
import {
  joinObjects, duplicateFromTo,
} from '../../../tools/tools';
import type {
  OBJ_AnimationStep,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import type { DiagramElement } from '../../Element';

/**
 * {@link CustomAnimationStep} options object
 *
 * ![](./assets1/custom_animation.gif)
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
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @extends OBJ_AnimationStep
 *
 * @property {string | function(int): void} callback function to run each
 * animation frame
 * @property {number} [startPercent] percent to start animation at (`0`)
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
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
export type OBJ_CustomAnimationStep = {
  callback?: string | ((number) => void);
  startPercent?: number;
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number;
} & OBJ_AnimationStep;

/**
 * Custom animation step
 *
 * @extends AnimationStep
 *
 * @param {OBJ_CustomAnimationStep} options
 */
export class CustomAnimationStep extends AnimationStep {
  element: ?Object;
  callback: ?(number) => void;
  startPercent: ?number;
  progression: string | ((number, ?boolean) => number);

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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'startPercent',
      'progression',
    ];
  }

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  _state(options: Object) {
    const state = super._state(options);
    if (this.element != null) {
      state.state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    return state;
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'customAnimationStep';
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    this.fnExec(this.callback, percentComplete);
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
    this.fnExec(this.callback, 1);
  }

  _dup() {
    const step = new CustomAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function custom(...optionsIn: Array<OBJ_CustomAnimationStep>) {
  return new CustomAnimationStep(...optionsIn);
}

