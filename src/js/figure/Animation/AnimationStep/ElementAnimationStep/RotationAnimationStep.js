// @flow
import {
  Transform, getDeltaAngle3D, getMaxTimeFromVelocity, clipAngle, getPoint, getScale, Point,
} from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';

/**
 * {@link RotationAnimationStep} step options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {number} [start] start rotation - current rotation used if
 * undefined
 * @property {number} [target] target rotation - will overwrite `delta` rotation
 * @property {number} [delta] delta rotation that can be used instead of `target`
 * @property {null | number} [velocity] velocity of rotation overrides
 * `duration` - `null` to use `duration` (`null`)
 * @property {0 | 1 | -1 | 2} [direction] where `0` is quickest direction, `1`
 * is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0 (`0`).
 * @property {'0to360' | '-180to180' | null} [clipTo] (`null`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 *
 * @see {@link RotationAnimationStep} for description and examples
 */
export type OBJ_RotationAnimationStep = {
  start?: number;      // default is element transform
  target?: number;     // Either target or delta must be defined
  delta?: number;      // delta overrides target if both are defined
  // 1 is CCW, -1 is CW, 0 is fastest, 2 is not through 0
  direction: 0 | 1 | -1 | 2;
  clipTo: '0to360' | '-180to180' | null;
  velocity?: ?number,
  maxDuration?: ?number;
} & OBJ_ElementAnimationStep;

// A transform animation unit manages a transform animation on an element.
//
// The start transform can either be defined initially, or null. Null means
// the start transform is whatever the current element transform is when the
// unit is started with start().
//
// The transform target is defined with either the target or delta properties.
// Target is used to predefine the target.
// Delta is used to calculate the target when the unit is started with start()
//

/**
 * Rotation animation step
 *
 * ![](./apiassets/rotation_animation.gif)
 *
 * The rotation animation step animates the first {@link Rotation} transform
 * in the {@link FigureElement}'s {@link Transform}.
 *
 * By default, the rotation will start with the element's current rotation.
 *
 * Use either `delta` or `target` to define it's end point
 *
 * `clipTo` will clip the element's rotation during animation
 *
 * @extends ElementAnimationStep
 * @param {OBJ_RotationAnimationStep} options
 *
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using duration
 * p.animations.new()
 *   .rotation({ target: Math.PI, duration: 2 })
 *   .start();
 *
 * @example
 * // Using velocity
 * p.animations.new()
 *   .rotation({ target: Math.PI, velocity: Math.PI / 2 })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.rotation({ target: Math.PI, duration: 2 });
 * const step2 = new Fig.Animation.RotationAnimationStep({
 *   element: p,
 *   target: 0,
 *   direction: -1,
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export default class RotationAnimationStep extends ElementAnimationStep {
  rotation: {
    start: Point;  // null means use element transform when unit is started
    delta: Point;
    target: Point;
    direction: 0 | 1 | -1 | 2;
    velocity: ?Point;
    maxDuration: ?number;
    clipTo: '0to360' | '-180to180' | null;
  };

  /**
   * @hideconstructor
   */
  constructor(...optionsIn: Array<OBJ_RotationAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'rotation' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'direction', 'velocity', 'clipTo', 'maxDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      direction: 0,
      velocity: null,
      clipTo: null,
      maxDuration: null,
    };
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);

    if (options.start != null) {
      if (typeof options.start === 'number') {
        options.start = new Point(0, 0, options.start);
      } else {
        options.start = getPoint(options.start);
      }
    }
    if (options.target != null) {
      if (typeof options.target === 'number') {
        options.target = new Point(0, 0, options.target);
      } else {
        options.target = getPoint(options.target);
      }
    }
    if (options.delta != null) {
      if (typeof options.delta === 'number') {
        options.delta = new Point(0, 0, options.delta);
      } else {
        options.delta = getPoint(options.delta);
      }
    }
    // if (options.target != null) {
    //   options.target = getPoint(options.target);
    // }
    // if (options.delta != null) {
    //   options.delta = getPoint(options.delta);
    // }
    // $FlowFixMe
    this.rotation = {};
    copyKeysFromTo(options, this.rotation, [
      'start', 'delta', 'target', 'velocity', 'direction', 'clipTo',
      'maxDuration',
    ]);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    const a = [...super._getStateProperties(),
      'rotation',
    ];
    return a;
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'rotationAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (this.rotation.start === null) {
      if (this.element != null) {
        this.rotation.start = this.element.transform.r3();
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.rotation.delta == null && this.rotation.target != null) {
      const delta = getDeltaAngle3D(
        this.rotation.start,
        this.rotation.target,
        this.rotation.direction,
      );
      this.rotation.delta = delta;
      // this.rotation.delta = this.rotation.target - this.rotation.start;
    } else if (this.rotation.delta != null) {
      this.rotation.target = this.rotation.start.add(this.rotation.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    const { target, start, velocity } = this.rotation;
    if (velocity != null && start != null && target != null) {
      const velocityToUse = getScale(velocity);
      this.duration = getMaxTimeFromVelocity(
        new Transform().rotate(start),
        new Transform().rotate(target),
        new Transform().rotate(velocityToUse),
        this.rotation.direction,
      );
    }
    if (this.rotation.maxDuration != null) {
      if (this.duration > this.rotation.maxDuration) {
        this.duration = this.rotation.maxDuration;
      }
    }
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }

    // // If Velocity is defined, then use it to calculate duration
    // const { velocity } = this.rotation;
    // if (velocity != null) {
    //   this.duration = getMaxTimeFromVelocity(
    //     new Transform().rotate(this.rotation.start),
    //     new Transform().rotate(this.rotation.target),
    //     new Transform().rotate(velocity),
    //     this.rotation.direction,
    //   );
    // }

    // if (this.rotation.maxDuration != null) {
    //   if (this.duration > this.rotation.maxDuration) {
    //     this.duration = this.rotation.maxDuration;
    //   }
    // }
    // if (startTime === 'now' || startTime === 'prevFrame') {
    //   this.setFrame(0);
    // }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / (this.duration + 0.000001);
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    const nextR = this.rotation.start.add(this.rotation.delta.scale(p));
    // let nextR = this.rotation.start + this.rotation.delta * p;
    nextR.x = clipAngle(nextR.x, this.rotation.clipTo);
    nextR.y = clipAngle(nextR.y, this.rotation.clipTo);
    nextR.z = clipAngle(nextR.z, this.rotation.clipTo);
    const { element } = this;
    if (element != null) {
      element.setRotation(nextR);
    }
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      element.transform.updateRotation([
        clipAngle(this.rotation.target.x, this.rotation.clipTo),
        clipAngle(this.rotation.target.y, this.rotation.clipTo),
        clipAngle(this.rotation.target.z, this.rotation.clipTo),
      ]);
      this.fnExec(element.setTransformCallback, element.transform);
    }
  }

  _dup() {
    const step = new RotationAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
