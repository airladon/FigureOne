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

type TypeColor = Array<number>;

/**
 * Color animation step options object
 *
 * By default, the color will start with the element's current color.
 *
 * Use either `delta` or `target` to define it's end color
 *
 * @extends OBJ_ElementAnimationStep
 * @property {Array<number>} [start]
 * @property {Array<number> | 'dim' | 'undim'} [target] use `dim` to animate to
 * element's `dimColor`, and `undim` to animate to element's `defaultColor`
 * @property {Array<number>} [delta]
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
 * Color Animation Step
 * @extends ElementAnimationStep
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
  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    const { element } = this;
    // console.log('starting', element)
    if (element != null) {
      super.start(startTime);
      if (this.color.start == null) {
        this.color.start = element.color.slice();
      } else if (startTime === 'now' || startTime === 'prev') {
        element.setColor(this.color.start);
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
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}


/**
 * Dim color animation step
 * @extends ColorAnimationStep
 */
export class DimAnimationStep extends ColorAnimationStep {
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
 * @extends ColorAnimationStep
 */
export class UndimAnimationStep extends ColorAnimationStep {
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
