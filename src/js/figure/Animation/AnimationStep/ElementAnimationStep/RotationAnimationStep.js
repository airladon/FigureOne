// @flow
import {
  getTransform,
} from '../../../../tools/g2';
import { parseRotation } from '../../../../tools/geometry/Transform';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';

type TypeRotation = number
                  | [number, number]
                  | TypeParsablePoint
                  | [TypeParsablePoint, number]
                  | [number, number, number, number];

// function parseRotation(r: TypeRotation) {
//   if (typeof r === 'number') {
//     return [r];
//   }
//   if (r.length === 4) {
//     return r;
//   }
//   if (r.length === 2) {
//     if (typeof r[0] === 'number') {
//       return r;
//     }
//     return [...getPoint(r[0]).toArray(), r[1]];
//   }
//   return getPoint(r).toArray();
// }

/**
 * {@link RotationAnimationStep} step options object.
 *
 * The {@link RotationAnimationStep} animates the first rotation component
 * of a {@link Transform}.
 *
 * To rotate from a `start` rotation to a `target` rotation use the
 * `start`, `delta` and/or `target` properties.
 *
 * If `start` is not defined, the current rotation angle (when the animation
 * is started) will be used as `start`.
 *
 * Either `target` or `delta` (from start) can be used to define the target.
 *
 * `start`, `delta` and `target` must all be the same rotation type as the
 * element's transform rotation component. For example, if the element's
 * transform is `['axis', 1, 0, 0, 0]`, then `start`, `delta` and `target`
 * must all be angle/axis rotations.
 *
 * The animation can either move to the target with a `duration`, or the
 * `duration` can be determined by a `velocity`. The `velocity` must be
 * the same rotation type as `start`, `delta` and `target`.
 *
 * Rotation animation targets can also be created with `velocity`, `start` and
 * `duration`. In this case, the rotation angles will grow with `velocity`. If
 * `duration` is null, then rotation duration will continue indefinitely until
 * the animation is cancelled.
 *
 * Animations are simply interpolating each value within a rotation definition
 * independently (either between a `start` and `target` or from a `start` with
 * `velocity`). Therefore, animating any values that belong to vectors
 * (direction ('dir' or 'rd'), change of basis ('rbasis' or 'rb'), or the axis
 * of axis/angle) may result in unexpected animations. For example, if animating
 * a rotation direction from [1, 0, 0] to [-1, 0, 0] it might be expected that
 * a π radians rotation would occur. Instead, it will look like no rotation
 * will have started, then a π rotation will happen in a single frame, and then
 * it will look stationary again. This is because only the x component of the
 * direction vector will change each animation frame. As a rotation direciton
 * that is [0.5, 0, 0] is the same as [1, 0, 0], then for half the animation it
 * will look like nothing is changing. When the x component cross from the 0
 * point, the element's rotation will instantly flip. Then for the second have
 * of the rotation as the x component gets more negative it will once again
 * look stationary.
 *
 * If wanting to animate a direction vector, use {@link directionToAxisAngle}
 * or {@link vectorToVectorToAxisAngle} and then use a axis/angle rotation
 * keeping the axis constant. If wanting to animate a change of basis rotation,
 * then use a {@link CustomAnimationStep} to manage how to change the basis
 * vectors over time.
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {TypeUserRotationDefinition} [start] start rotation - current
 * rotation used if undefined
 * @property {TypeUserRotationDefinition} [target] target rotation
 * @property {TypeUserRotationDefinition} [delta] a delta rotation that can be
 * used to define `target` if `target` is undefined
 * @property {null | TypeUserRotationDefinition} [velocity] velocity of
 * rotation can either define the `duration` of a rotation if `target` or
 * `delta` is defined, or can define the `target` of a rotation if `duration`
 * is defined. If `duration` is null, then velocity determines the change in
 * rotation over time (`null`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 *
 * @see {@link RotationAnimationStep} for description and examples
 */
export type OBJ_RotationAnimationStep = {
  start?: TypeRotation;      // default is element transform
  target?: TypeRotation;     // Either target or delta must be defined
  delta?: TypeRotation;      // delta overrides target if both are defined
  // 1 is CCW, -1 is CW, 0 is fastest, 2 is not through 0
  // direction: 0 | 1 | -1 | 2;
  // clipTo: '0to360' | '-180to180' | null;
  velocity?: ?number,
  maxDuration?: ?number;
} & OBJ_ElementAnimationStep;

/*
 * @property {'0to360' | '-180to180' | null} [clipTo] (`null`)
 * @property {0 | 1 | -1 | 2} [direction] For 2D rotation, `1` is CCW,
 * `-1` is CW and `2` is whichever direction doesn't pass through 0 and `0` is
 * the direction of shortest rotation. For 'xyz' rotation, direction `1` follows
 * the right hand rule around the (x, y, z), `-1` is the left hand rule, `2`
 * doesn't pass through 0 and `0` is the direction of shortest rotation.
 * For 'axis' rotation,
 * axis vectors. For 'sph' rotation,
 * is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0 (`0`).
 */

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
    start: Array<number>;  // null means use element transform when unit is started
    delta: Array<number>;
    target: Array<number>;
    direction: 0 | 1 | -1 | 2;
    velocity: Array<number> | number;
    maxDuration: ?number;
    clipTo: '0to360' | '-180to180' | null;
    type: 'r' | 'ra' | 'rd' | 'rc' | 'rb';
    tempAxis: Point;
    tempAngle: number;
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

    let type = 'r';
    if (this.element != null) {
      [type] = this.element.transform.rDef();
    }
    let typeStart;
    let typeTarget;
    let typeDelta;
    if (options.start != null) {
      [typeStart, ...options.start] = parseRotation(options.start);
      if (typeStart !== type) {
        throw new Error(`RotationAnimationStep start type and element rotation type are different: ${type}, start: ${typeStart}`);
      }
    }
    if (options.target != null) {
      [typeTarget, ...options.target] = parseRotation(options.target);
      if (typeTarget !== type) {
        throw new Error(`RotationAnimationStep target type and element rotation type are different: ${type}, start: ${typeTarget}`);
      }
    }
    if (options.delta != null) {
      [typeDelta, ...options.delta] = parseRotation(options.delta);
      if (typeDelta !== type) {
        throw new Error(`RotationAnimationStep delta type and element rotation type are different: ${type}, start: ${typeDelta}`);
      }
    }
    if (options.velocity != null) {
      [typeDelta, ...options.velocity] = parseRotation(options.velocity);
      if (typeDelta !== type) {
        throw new Error(`RotationAnimationStep velocity type and element rotation type are different: ${type}, start: ${typeDelta}`);
      }
    }

    // $FlowFixMe
    this.rotation = {};
    copyKeysFromTo(options, this.rotation, [
      'start', 'delta', 'target', 'velocity', 'direction', 'clipTo',
      'maxDuration',
    ]);
    this.rotation.type = type;
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
        this.rotation.start = this.element.transform.rDef().slice(1);
      } else {
        this.duration = 0;
        return;
      }
    }
    // const direction = 1;
    const {
      start, velocity, // type,
    } = this.rotation;
    let { target, delta } = this.rotation;
    // if a target is defined, then it takes priority over target definition
    // from delta or velocity
    if (target != null) {
      const targetVal = target;
      const startVal = start;
      const deltaVal = targetVal.map((t, i) => t - startVal[i]);
      // if (type === 'r') {
      //   deltaVal[0] = getDeltaAngle(startVal[0], targetVal[0], direction);
      // } else if (type === 'rc') {
      //   deltaVal[0] = getDeltaAngle(startVal[0], targetVal[0], direction);
      //   deltaVal[1] = getDeltaAngle(startVal[1], targetVal[1], direction);
      //   deltaVal[2] = getDeltaAngle(startVal[2], targetVal[2], direction);
      // } else if (type === 'ra') {
      //   deltaVal[4] = getDeltaAngle(startVal[4], targetVal[4], direction);
      // }
      this.rotation.delta = deltaVal;
    // Delta takes priority to define target over velocity
    } else if (delta != null) {
      const deltaVal = delta;
      const startVal = start;
      this.rotation.target = startVal.map((s, i) => s + deltaVal[i]);
    // If duration is defined and velocity exists, (and target is yet to be
    // defined), then velocity and duration can define the target
    } else if (velocity != null && this.duration != null) {
      this.rotation.target = start.map((s, i) => s + velocity[i] * this.duration);
      this.rotation.delta = velocity.map(v => v * this.duration);
    // If we've got here then there is a finite duration and we have no target,
    // so reset duration to 0.
    } else if (this.duration != null) {
      this.duration = 0;
    }

    ({ target, delta } = this.rotation);

    // If target and velocity is defined, but duration hasn't been defined so
    // far, then use velocity to find duration.
    if (
      this.duration === undefined
      && velocity != null
      && start != null
      && target != null
    ) {
      const v = velocity;
      const durations = start.map((s, k) => (target[k] - s) / v[k]);
      this.duration = Math.max(...durations);
    }

    // Check if the duration is longer than the maxDuration
    if (this.rotation.maxDuration != null && this.duration != null) {
      if (this.duration > this.rotation.maxDuration) {
        this.duration = this.rotation.maxDuration;
      }
    }
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
  }

  setFrame(deltaTime: number) {
    if (this.duration == null || this.rotation.delta == null) {
      const { start } = this.rotation;
      const v = start.map((s, i) => s + deltaTime * this.rotation.velocity[i]);
      if (this.element != null) {
        this.element.setRotation([this.rotation.type, ...v]);
      }
      return;
    }
    const percentTime = deltaTime / (this.duration + 0.000001);
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    const { start, delta, type } = this.rotation;
    const startT = getTransform([type, ...start]);
    const deltaT = getTransform([type, ...delta]);
    const nextR = startT.toDelta(deltaT, p, 'linear');
    // const nextR = start.map((s, k) => clipAngle(s + delta[k] * p, this.rotation.clipTo));
    const { element } = this;
    if (element != null) {
      // console.log(nextR)
      element.setRotation(nextR.rDef());
    }
    //   const i = this.element.transform.getComponentIndex('r');
    //   const type = this.element.transform.def[i][0];
    //   if (type === 'rd' || type === 'ra') {
    //     nextR[0] = start[0] + delta[0] * p;
    //     nextR[1] = start[1] + delta[1] * p;
    //     nextR[2] = start[2] + delta[2] * p;
    //   }
    //   element.setRotation(nextR);
    // }
    // element.setRotation(nextR.rDef());
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      // element.transform.updateRotationValues(0, this.rotation.target);
      if (this.rotation.target != null) {
        element.transform.updateRotation([this.rotation.type, ...this.rotation.target]);
      }
      // element.transform.clipRotation(this.rotation.clipTo);
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
