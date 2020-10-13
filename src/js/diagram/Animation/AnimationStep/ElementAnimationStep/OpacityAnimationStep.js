// @flow
// import {
//   Transform, Point, getMaxTimeFromVelocity,
// } from '../../../../tools/g2';
// import * as tools from '../../../../tools/math';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

/**
 * Opacity animation step - this animates the `opacity` property of a
 * {@link DiagramElement}.
 *
 * By default, the opacity will start with the element's current opacity unless
 * dissolving. If dissolving, the opacity will start at `0` if dissolving in, or
 * `1` if dissolving out unless `dissolveFromCurrent` is `true` in which case
 * the opacity will start from the current opacity.
 *
 *
 * @extends OBJ_ElementAnimationStep
 * @property {number} [start]
 * @property {number} [target]
 * @property {number} [delta]
 * @property {null | 'in' | 'out'} dissolve (`null`)
 * @property {boolean} dissolveFromCurrent (`false`)
 */
export type OBJ_OpacityAnimationStep = {
  start?: number;      // default is element transform
  target?: number;     // Either target or delta must be defined
  delta?: number;      // delta overrides target if both are defined
  dissolve?: 'in' | 'out' | null,
  dissolveFromCurrent?: boolean,
} & OBJ_ElementAnimationStep;

/**
 * Opacity Animation Step
 * @extends ElementAnimationStep
 */
export class OpacityAnimationStep extends ElementAnimationStep {
  opacity: {
    start: number;     // null means use element color
    delta: number;
    target: number;
    whenComplete: number;  // Color after dissolving
    dissolve?: 'in' | 'out' | null;
    dissolveFromCurrent: boolean,
  };

  constructor(...optionsIn: Array<OBJ_OpacityAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, ...optionsIn, { type: 'opacity' });
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'dissolve', 'dissolveFromCurrent',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      dissolve: null,
      dissolveFromCurrent: false,
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    // $FlowFixMe
    this.opacity = {};
    copyKeysFromTo(options, this.opacity, [
      'start', 'delta', 'target', 'dissolve', 'dissolveFromCurrent',
    ]);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'opacity',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'opacityAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    const { element } = this;
    if (element != null) {
      super.start(startTime);
      if (this.opacity.start == null) {
        // eslint-disable-next-line prefer-destructuring
        this.opacity.start = element.opacity;
      } else if (startTime === 'now' || startTime === 'prev') {
        element.setOpacity(this.opacity.start);
      }
      if (this.opacity.delta == null && this.opacity.target == null) {
        this.opacity.target = this.opacity.start;
      } else if (this.opacity.delta != null) {
        this.opacity.target = this.opacity.start + this.opacity.delta;
      }
      this.opacity.whenComplete = this.opacity.target;

      if (this.opacity.dissolve === 'out') {
        if (this.opacity.dissolveFromCurrent) {
          if (element.isShown) {
            this.opacity.start = element.opacity;
          } else {
            this.opacity.start = 1;
          }
        } else {
          this.opacity.start = 1;
        }
        this.opacity.target = 0.001;
        this.opacity.whenComplete = 1;
        element.setOpacity(this.opacity.start);
      }
      if (this.opacity.dissolve === 'in') {
        if (this.opacity.dissolveFromCurrent) {
          if (element.isShown) {
            this.opacity.start = element.opacity;
          } else {
            this.opacity.start = 0.001;
          }
        } else {
          this.opacity.start = 0.001;
        }
        // this.opacity.start = 0.001;
        this.opacity.target = 1;
        this.opacity.whenComplete = 1;
        element.showAll();
        element.setOpacity(this.opacity.start);
      }
      this.opacity.delta = this.opacity.target - this.opacity.start;
    } else {
      this.duration = 0;
    }
  }

  cancelledWithNoComplete() {
    const { element } = this;
    if (element != null) {
      if (element.opacity === 0.001) {
        element.hide();
        element.opacity = 1;
      }
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    let next = this.opacity.start + this.opacity.delta * p;
    if (next > 1) {
      next = 1;
    }
    if (next < 0) {
      next = 0;
    }
    if (this.element != null) {
      this.element.setOpacity(next);
    }
  }

  // cancelledWithNoComplete() {
  //   const { element } = this;
  //   console.log('cancel with no complete')
  //   if (element != null) {
  //     if (this.color.fullOpacity) {
  //       element.setColor([...element.color.slice(0, 3), 1]);
  //     }
  //   }
  // }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      // console.log(this.name, this.color.whenComplete)
      element.setOpacity(this.opacity.whenComplete);
      if (this.opacity.dissolve === 'out') {
        element.hide();
      }
    }
  }

  _dup() {
    const step = new OpacityAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}

/**
 * Dissolve in animation step
 * @extends OpacityAnimationStep
 */
export class DissolveInAnimationStep extends OpacityAnimationStep {
  constructor(
    timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, dissolve: 'in', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dissolveIn(
  timeOrOptionsIn: number | OBJ_OpacityAnimationStep = {},
  ...args: Array<OBJ_OpacityAnimationStep>
) {
  return new DissolveInAnimationStep(timeOrOptionsIn, ...args);
}

/**
 * Dissolve out animation step
 * @extends OpacityAnimationStep
 */
export class DissolveOutAnimationStep extends OpacityAnimationStep {
  constructor(
    timeOrOptionsIn: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, dissolve: 'out', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dissolveOut(
  timeOrOptionsIn: number | OBJ_OpacityAnimationStep = {},
  ...args: Array<OBJ_OpacityAnimationStep>
) {
  return new DissolveOutAnimationStep(timeOrOptionsIn, ...args);
}
