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
 * {@link OpacityAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {number} [start]
 * @property {number} [target]
 * @property {number} [delta]
 * @property {null | 'in' | 'out'} dissolve will override target opacity if not
 * `null` (`null`)
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
 *
 * ![](./assets1/opacity_animation.gif)
 *
 * A {@link DiagramElement} has `color` and `opacity` properties. The `color`
 * property has an alpha channel that defines opacity, but it should be used
 * as a base color definition, and not used to dissolve an element in and out.
 *
 * Therefore, to animate an element's opacity or temporarily dissolve in or out
 * an element, use an opacity animation step.
 *
 * The `opacity` is multiplied by the
 * `color` alpha channel to get the final opacity of the element.
 *
 * By default, the opacity will start with the {@link DiagramElement}'s current
 * opacity unless dissolving. If dissolving, the opacity will start at `0` if
 * dissolving in, or `1` if dissolving out unless `dissolveFromCurrent` is
 * `true` in which case the opacity will start from the current opacity.
 *
 * The {@link DissolveInAnimationStep} and {@link DissolveOutAnimationStep}
 * extend the `OpacityAnimationStep` to make it even more convenient to
 * dissolve.
 *
 * @extends ElementAnimationStep
 * @param {OBJ_OpacityAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using numerical values for opacity
 * p.animations.new()
 *   .opacity({ target: 0.4, duration: 2 })
 *   .opacity({ target: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Dissolve out then in
 * p.animations.new()
 *   .opacity({ dissolve: 'out', duration: 2 })
 *   .opacity({ dissolve: 'in', duration: 2 })
 *   .start();
 *
 * @example
 * // Using the dissolve animation step
 * p.animations.new()
 *   .dissolveOut(2)
 *   .dissolveIn({ delay: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.opacity({
 *   target: 0,
 *   duration: 2,
 * });
 * const step2 = new Fig.Animation.OpacityAnimationStep({
 *   element: p,
 *   target: 1,
 *   duration: 2,
 * });
 * const step3 = p.animations.dissolveOut({
 *   duration: 2,
 * });
 * const step4 = new Fig.Animation.DissolveInAnimationStep({
 *   element: p,
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .then(step3)
 *   .then(step4)
 *   .start();
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

  /**
   * @hideconstructor
   */
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
 *
 * ![](./assets1/dissolvein_animation.gif)
 *
 * Animates opacity of element to dissolve in.
 *
 * @extends OpacityAnimationStep
 * @param {number | OBJ_ElementAnimationStep} durationOrOptions
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple dissolve in
 * p.setOpacity(0)
 * p.animations.new()
 *   .dissolveIn(2)
 *   .start();
 *
 * @example
 * // Dissolve in using options object
 * p.setOpacity(0);
 * p.animations.new()
 *   .dissolveIn({ delay: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.dissolveIn(2);
 * const step2 = new Fig.Animation.DissolveInAnimationStep({
 *   element: p,
 *   duration: 2,
 * });
 *
 * p.setOpacity(0);
 * p.animations.new()
 *   .then(step1)
 *   .dissolveOut(1)
 *   .then(step2)
 *   .start();
 */
export class DissolveInAnimationStep extends OpacityAnimationStep {
  /**
   * @hideconstructor
   */
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
 *
 * ![](./assets1/dissolveout_animation.gif)
 *
 * Animates opacity of element to dissolve out.
 *
 * @extends OpacityAnimationStep
 * @param {number | OBJ_ElementAnimationStep} durationOrOptions
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple dissolve out
 * p.animations.new()
 *   .dissolveOut(2)
 *   .start();
 *
 * @example
 * // Dissolve out using options object
 * p.animations.new()
 *   .dissolveOut({ delay: 1, duration: 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.dissolveOut(2);
 * const step2 = new Fig.Animation.DissolveOutAnimationStep({
 *   element: p,
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .dissolveIn(1)
 *   .then(step2)
 *   .start();
 */
export class DissolveOutAnimationStep extends OpacityAnimationStep {
  /**
   * @hideconstructor
   */
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
