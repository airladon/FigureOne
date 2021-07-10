// @flow
import {
  getDeltaAngle, clipAngle, getTransform,
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
 * {@link RotationAnimationStep} step options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {TypeRotation} [start] start rotation - current rotation used if
 * undefined
 * @property {TypeRotation} [target] target rotation - will overwrite `delta` rotation
 * @property {TypeRotation} [delta] delta rotation that can be used instead of `target`
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
  start?: TypeRotation;      // default is element transform
  target?: TypeRotation;     // Either target or delta must be defined
  delta?: TypeRotation;      // delta overrides target if both are defined
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
    start: Array<number>;  // null means use element transform when unit is started
    delta: Array<number>;
    target: Array<number>;
    direction: 0 | 1 | -1 | 2;
    velocity: Array<number> | number;
    maxDuration: ?number;
    clipTo: '0to360' | '-180to180' | null;
    type: 'r' | 'ra' | 'rd' | 'rc' | 'rs' | 'rb';
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
      console.log(options.start.slice())
    }
    if (options.target != null) {
      [typeTarget, ...options.target] = parseRotation(options.target);
      if (typeTarget !== type) {
        throw new Error(`RotationAnimationStep target type and element rotation type are different: ${type}, start: ${typeTarget}`);
      }
      console.log(options.target.slice())
    }
    if (options.delta != null) {
      [typeDelta, ...options.delta] = parseRotation(options.delta);
      if (typeDelta !== type) {
        throw new Error(`RotationAnimationStep delta type and element rotation type are different: ${type}, start: ${typeDelta}`);
      }
      console.log(options.delta.slice())
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
    const {
      start, direction, velocity, type,
    } = this.rotation;
    let { target, delta } = this.rotation;
    // if delta is null, then calculate it from start and target
    if (delta == null && target != null) {
      const targetVal = target;
      const startVal = start;
      const deltaVal = targetVal.map((t, i) => t - startVal[i]);
      if (type === 'r') {
        deltaVal[0] = getDeltaAngle(startVal[0], targetVal[0], direction);
      } else if (type === 'rs') {
        deltaVal[0] = getDeltaAngle(startVal[0], targetVal[0], direction);
        deltaVal[1] = getDeltaAngle(startVal[1], targetVal[2], direction);
      } else if (type === 'rc') {
        deltaVal[0] = getDeltaAngle(startVal[0], targetVal[0], direction);
        deltaVal[1] = getDeltaAngle(startVal[1], targetVal[2], direction);
        deltaVal[2] = getDeltaAngle(startVal[2], targetVal[2], direction);
      } else if (type === 'ra') {
        deltaVal[4] = getDeltaAngle(startVal[4], targetVal[4], direction);
      }
      this.rotation.delta = deltaVal;
      // let delta = target.map((t, k) => getDeltaAngle(start[k], t, direction));
      // if (this.element != null) {
      //   const i = this.element.transform.getComponentIndex('r');
      //   const type = this.element.transform.def[i][0];
      //   if (type === 'rd') {
      //     delta = target.map((t, k) => t - start[k]);
      //   } else if (type === 'ra') {
      //     delta[0] = target[0] - start[0];
      //     delta[1] = target[1] - start[1];
      //     delta[2] = target[2] - start[2];
      //   }
      // }
      // this.rotation.delta = delta;
      // this.rotation.delta = this.rotation.target - this.rotation.start;
    } else if (delta != null) {
      const deltaVal = delta;
      const startVal = start;
      this.rotation.target = startVal.map((s, i) => s + deltaVal[i]);
      // this.rotation.target = start.map((s, k) => s + this.rotation.delta[k]);
    } else {
      this.duration = 0;
    }

    ({ target, delta } = this.rotation);

    // If Velocity is defined, then use it to calculate duration
    if (velocity != null && start != null && target != null) {
      // const velocityToUse = getScale(velocity);
      let v;
      if (typeof velocity === 'number') {
        v = start.map(() => velocity);
      } else {
        v = velocity;
      }
      const durations = start.map((s, k) => (target[k] - s) / v[k]);
      this.duration = Math.max(durations);
      // const velocityToUse = start.map(() => velocity);
      // this.duration = getMaxTimeFromVelocity(
      //   new Transform().rotate(start),
      //   new Transform().rotate(target),
      //   new Transform().rotate(velocityToUse),
      //   this.rotation.direction,
      // );
    }
    if (this.rotation.maxDuration != null) {
      if (this.duration > this.rotation.maxDuration) {
        this.duration = this.rotation.maxDuration;
      }
    }
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
    console.log(this.rotation)
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
    const { start, delta, type } = this.rotation;
    const startT = getTransform([type, ...start]);
    const deltaT = getTransform([type, ...delta]);
    const nextR = startT.toDelta(deltaT, p, 'linear');
    // const nextR = start.map((s, k) => clipAngle(s + delta[k] * p, this.rotation.clipTo));
    const { element } = this;
    if (element != null) {
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

  // TODO DO THIS BELOW
  setToEnd() {
    const { element } = this;
    if (element != null) {
      // element.transform.updateRotationValues(0, this.rotation.target);
      element.transform.updateRotation([this.rotation.type, ...this.rotation.target]);
      element.transform.clipRotation(this.rotation.clipTo);
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
