// @flow
// import {
//   Transform, Point, getMaxTimeFromVelocity,
// } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
// import * as tools from '../../../../tools/math';
import type { OBJ_ElementAnimationStep } from '../ElementAnimationStep';
import type { OBJ_OpacityAnimationStep } from './OpacityAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { TypeColor } from '../../../../tools/types';
import type { AnimationStartTime } from '../../AnimationManager';
// type TypeColor = Array<number>;

/**
 * {@link ColorAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 * @property {Array<number>} [start]
 * @property {Array<number> | 'dim' | 'undim'} [target] use `dim` to animate to
 * element's `dimColor`, and `undim` to animate to element's `defaultColor`
 * @property {Array<number>} [delta]
 *
 */
export type OBJ_ColorAnimationStep = {
  start?: TypeColor;      // default is element transform
  target?: TypeColor | 'dim' | 'undim';     // Either target or delta must be defined
  delta?: TypeColor;      // delta overrides target if both are defined
  dissolve?: 'in' | 'out' | null
} & OBJ_ElementAnimationStep;

const addColors = (color1, color2) => color1.map((c, index) => Math.min(c + color2[index], 1));

const subtractColors = (color1, color2) => color1.map((c, index) => c - color2[index]);

/**
 * Color animation Step
 *
 * ![](./apiassets/color_animation.gif)
 *
 * By default, the color will start with the element's current color.
 *
 * Use either `delta` or `target` to define the end color
 *
 * In an interactive figure, it is often useful to highlight elements of the
 * figure by coloring them and greying out, or dimming the elements not of
 * interest. As such, a {@link FigureElement} has several color attributes:
 * - color - current color
 * - dimColor - color to dim to
 * - defaultColor - color to undim to
 *
 * The `target` property can accept `'dim'` and `'undim'` as shortcuts to dim
 * or undim the element.
 *
 * In addition, the {@link DimAnimationStep} and {@link UndimAnimationStep} can
 * be used to do the same, which is especially useful when trying to build
 * easy to read code in a complex animation.
 *
 * @extends ElementAnimationStep
 * @param {OBJ_ColorAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using duration
 * p.animations.new()
 *   .color({ target: [0, 0, 1, 1], duration: 1 })
 *   .color({ target: [0, 0.8, 0, 1], duration: 1 })
 *   .color({ target: [1, 0, 0, 1], duration: 1 })
 *   .start();
 *
 * @example
 * // dim and undim an element using dim and undim animation steps
 * p.animations.new()
 *   .dim(1)
 *   .delay(1)
 *   .undim(1)
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.color({
 *   target: [0, 0, 1, 1],
 *   duration: 2,
 * });
 * const step2 = new Fig.Animation.ColorAnimationStep({
 *   element: p,
 *   target: [0, 0.8, 0, 1],
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export class ColorAnimationStep extends ElementAnimationStep {
  color: {
    start: TypeColor;     // null means use element color
    delta: TypeColor;
    target: TypeColor;
    whenComplete: TypeColor;  // Color after dissolving
    dissolve?: 'in' | 'out' | null;
    setDefault?: boolean;
  };

  /**
   * @hideconstructor
   */
  constructor(...options: Array<OBJ_ColorAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, ...options, { type: 'color' });
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'dissolve',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      dissolve: null,
    };
    const optionsToUse = joinObjects({}, defaultPositionOptions, ...options);
    // $FlowFixMe
    this.color = {};
    copyKeysFromTo(optionsToUse, this.color, [
      'start', 'delta', 'target', 'dissolve',
    ]);
    if (this.color.target === 'dim') {
      if (this.element != null) {
        this.color.target = this.element.dimColor.slice();
      }
      this.color.setDefault = false;
    } else if (this.color.target === 'undim') {
      if (this.element != null) {
        this.color.target = this.element.defaultColor.slice();
      }
      this.color.setDefault = false;
    } else {
      this.color.setDefault = true;
    }
  }


  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'color',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'colorAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?AnimationStartTime = null) {
    const { element } = this;
    // console.log('starting', element)
    if (element != null) {
      super.start(startTime);
      if (this.color.start == null) {
        this.color.start = element.color.slice();
      }
      if (this.color.delta == null && this.color.target == null) {
        this.color.target = this.color.start.slice();
      } else if (this.color.delta != null) {
        this.color.target = addColors(this.color.start, this.color.delta);
      }
      this.color.whenComplete = this.color.target.slice();

      if (this.color.dissolve === 'out') {
        this.color.target[3] = 0.001;
      }
      if (this.color.dissolve === 'in') {
        this.color.start[3] = 0.001;
        element.setColor(this.color.start, this.color.setDefault);
        element.showAll();
      }
      this.color.delta = subtractColors(this.color.target, this.color.start);
    } else {
      this.duration = 0;
    }
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    const next = this.color.start.map((c, index) => {
      let newColor = c + this.color.delta[index] * p;
      if (newColor > 1) {
        newColor = 1;
      }
      if (newColor < 0) {
        newColor = 0;
      }
      return newColor;
    });
    if (this.element != null) {
      // console.log(this.element.name, next)
      this.element.setColor(next, this.color.setDefault);
    }
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      // console.log(this.name, this.color.whenComplete)
      element.setColor(this.color.whenComplete, this.color.setDefault);
      if (this.color.dissolve === 'out') {
        element.hide();
      }
    }
  }

  _dup() {
    const step = new ColorAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}


/**
 * Dim color animation step
 *
 * ![](./apiassets/dim_animation.gif)
 *
 * Animates color of element to the `dimColor` property of {@link FigureElement}
 *
 * @extends ColorAnimationStep
 * @param {number | OBJ_ElementAnimationStep} durationOrOptions
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple dim
 * p.animations.new()
 *   .dim(2)
 *   .start();
 *
 * @example
 * // Dim using options object
 * p.animations.new()
 *   .dim({ delay: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.dim(2);
 * const step2 = new Fig.Animation.DimAnimationStep({
 *   element: p,
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .undim(1)
 *   .then(step2)
 *   .start();
 */
export class DimAnimationStep extends ColorAnimationStep {
  /**
   * @hideconstructor
   */
  constructor(
    timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, target: 'dim', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dim(
  timeOrOptionsIn: number | OBJ_OpacityAnimationStep = {},
  ...args: Array<OBJ_OpacityAnimationStep>
) {
  return new DimAnimationStep(timeOrOptionsIn, ...args);
}

/**
 * Undim color animation step
 *
 * ![](./apiassets/undim_animation.gif)
 *
 * Animates color of element to the `defaultColor` property of {@link FigureElement}
 *
 * @extends ColorAnimationStep
 * @param {number | OBJ_ElementAnimationStep} durationOrOptions
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple undim
 * p.dim();
 * p.animations.new()
 *   .undim(2)
 *   .start();
 *
 * @example
 * // Undim using options object
 * p.dim();
 * p.animations.new()
 *   .undim({ delay: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.undim(2);
 * const step2 = new Fig.Animation.UndimAnimationStep({
 *   element: p,
 *   duration: 2,
 * });
 *
 * p.dim();
 * p.animations.new()
 *   .then(step1)
 *   .dim(1)
 *   .then(step2)
 *   .start();
 */
export class UndimAnimationStep extends ColorAnimationStep {
  /**
   * @hideconstructor
   */
  constructor(
    timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, target: 'undim', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function undim(
  timeOrOptionsIn: number | OBJ_OpacityAnimationStep = {},
  ...args: Array<OBJ_OpacityAnimationStep>
) {
  return new UndimAnimationStep(timeOrOptionsIn, ...args);
}

// export class DissolveInAnimationStep extends ColorAnimationStep {
//   constructor(
//     timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
//     ...args: Array<OBJ_ElementAnimationStep>
//   ) {
//     let options = {};
//     const defaultOptions = { duration: 1, dissolve: 'in', completeOnCancel: true };
//     if (typeof timeOrOptionsIn === 'number') {
//       options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
//     } else {
//       options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
//     }
//     super(options);
//   }
// }

// export function dissolveIn(
//   timeOrOptionsIn: number | OBJ_ColorAnimationStep = {},
//   ...args: Array<OBJ_ColorAnimationStep>
// ) {
//   return new DissolveInAnimationStep(timeOrOptionsIn, ...args);
// }

// export class DissolveOutAnimationStep extends ColorAnimationStep {
//   constructor(
//     timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
//     ...args: Array<OBJ_ElementAnimationStep>
//   ) {
//     let options = {};
//     const defaultOptions = { duration: 1, dissolve: 'out', completeOnCancel: true };
//     if (typeof timeOrOptionsIn === 'number') {
//       options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
//     } else {
//       options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
//     }
//     super(options);
//   }
// }

// export function dissolveOut(
//   timeOrOptionsIn: number | OBJ_ColorAnimationStep = {},
//   ...args: Array<OBJ_ColorAnimationStep>
// ) {
//   return new DissolveOutAnimationStep(timeOrOptionsIn, ...args);
// }
