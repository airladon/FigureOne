// @flow
import {
  Transform,
  Rotation, getDeltaAngle, getMaxTimeFromVelocity,
  getTransform,
} from '../../../../tools/g2';
import type { OBJ_TranslationPath } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';

/**
 * {@link TransformAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {TypeParsableTransform} [start]
 * @property {TypeParsableTransform} [target]
 * @property {TypeParsableTransform} [delta]
 * @property {null | TypeParsableTransform} [velocity] velocity of
 * transform overrides `duration` - `null` to use `duration` (`null`)
 * @property {OBJ_TranslationPath} [path] translation path style and options
 * (`{ style: 'linear' }`)
 * @property {0 | 1 | -1 | 2} [rotDirection] where `0` is quickest direction,
 * `1` is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0 (`0`).
 * @property {'0to360' | '-180to180' | null} [clipRotationTo]
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 */
export type OBJ_TransformAnimationStep = {
  start?: Transform;      // default is element transform
  target?: Transform;     // Either target or delta must be defined
  delta?: Transform;      // delta overrides target if both are defined
  path?: OBJ_TranslationPath;       // default is linear
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  velocity: ?Transform | number;
  maxDuration?: number;
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
 * Transform Animation Step
 *
 * ![](./apiassets/transform_animation.gif)
 *
 * By default, the transform will start with the element's current transform.
 *
 * A {@link Transform} chains many transform links where each link might be
 * a {@link Rotation}, {@link Scale} or {@link Translation} transform.
 *
 * `start`, `target` and `delta` should have the same order of transform links
 * as the `element`'s transform.
 *
 * The {@link TransformAnimationStep} will animate each of these links with the
 * same duration. If `velocity` is used to calculate the duration, then the link
 * with the longest duration will define the duration of the animation.
 * `velocity` can either be a transform with the same order of transform links
 * as the `element` or it can be a constant value, which will be applied to
 * all transform links. `velocity` cannot be 0.
 *
 * Use either `delta` or `target` to define it's end point of the animation.
 *
 * @extends ElementAnimationStep
 * @param {OBJ_TransformAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using duration
 * p.animations.new()
 *   .transform({
 *     target: new Fig.Transform().scale(2, 2).rotate(0.5).translate(1, 0),
 *     duration: 2,
 *   })
 *   .start();
 *
 * @example
 * // Using velocity as a transform
 * p.animations.new()
 *   .transform({
 *     target: new Fig.Transform().scale(2, 2).rotate(0.5).translate(1, 0),
 *     velocity: new Fig.Transform().scale(0.5, 0.5).rotate(0.25).translate(0.5, 0.5),
 *   })
 *   .start();
 *
 * @example
 * // Using velocity as a number
 * p.animations.new()
 *   .transform({
 *     target: new Fig.Transform().scale(2, 2).rotate(0.5).translate(1, 0),
 *     velocity: 0.5,
 *   })
 *   .start();
 *
 * @example
 * // Using TypeParsableTransform as transform definition
 * p.animations.new()
 *   .transform({
 *     target: [['s', 1.5, 1.5], ['r', 0.5], ['t', 1, 0]],
 *     duration: 2,
 *   })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.transform({
 *   target: [['s', 1.5, 1.5], ['r', 1], ['t', 1, 0]],
 *   duration: 2,
 * });
 * const step2 = new Fig.Animation.TransformAnimationStep({
 *   element: p,
 *   target: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export default class TransformAnimationStep extends ElementAnimationStep {
  transform: {
    start: Transform;  // null means use element transform when unit is started
    delta: Transform;
    target: Transform;
    rotDirection: 0 | 1 | -1 | 2;
    path: OBJ_TranslationPath;
    velocity: ?Transform | number;
    clipRotationTo: '0to360' | '-180to180' | null;
    maxDuration: ?number;
  };

  /**
   * @hideconstructor
   */
  constructor(...optionsIn: Array<OBJ_TransformAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'transform' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'path',
      'velocity', 'clipRotationTo', 'maxDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      rotDirection: 0,
      path: {
        style: 'linear',
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'positive',
      },
      velocity: null,
      clipRotationTo: null,
      maxDuration: null,
    };
    if (this.element && this.element.animations.options.translation) {
      const pathOptions = this.element.animations.options.translation;
      joinObjects(defaultTransformOptions.path, pathOptions);
    }
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);
    if (options.start != null) {
      options.start = getTransform(options.start);
    }
    if (options.target != null) {
      options.target = getTransform(options.target);
    }
    if (options.delta != null) {
      options.delta = getTransform(options.delta);
    }
    if (options.velocity != null && typeof options.velocity !== 'number') {
      options.velocity = getTransform(options.velocity);
    }
    // $FlowFixMe
    this.transform = {};
    copyKeysFromTo(options, this.transform, [
      'start', 'delta', 'target', 'path',
      'velocity', 'rotDirection', 'clipRotationTo', 'maxDuration',
    ]);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'transform',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'transformAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (this.transform.start === null) {
      if (this.element != null) {
        this.transform.start = this.element.transform._dup();
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.transform.delta == null && this.transform.target != null) {
      const delta = this.transform.target.sub(this.transform.start);
      delta.order.forEach((deltaStep, index) => {
        const startStep = this.transform.start.order[index];
        const targetStep = this.transform.target.order[index];
        if (deltaStep instanceof Rotation
          && startStep instanceof Rotation
          && targetStep instanceof Rotation) {
          const rotDiff = getDeltaAngle(
            startStep.r,
            targetStep.r,
            this.transform.rotDirection,
          );
          // eslint-disable-next-line no-param-reassign
          deltaStep.r = rotDiff;
        }
      });
      this.transform.delta = delta;
    } else if (this.transform.delta != null) {
      this.transform.target = this.transform.start.add(this.transform.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    if (this.transform.velocity != null) {
      this.duration = getMaxTimeFromVelocity(
        this.transform.start,
        this.transform.target,
        this.transform.velocity,
        this.transform.rotDirection,
      );
    }
    if (this.transform.maxDuration != null) {
      if (this.duration > this.transform.maxDuration) {
        this.duration = this.transform.maxDuration;
      }
    }
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
  }

  setFrame(deltaTime: number) {
    // const start = phase.startTransform._dup();
    // const delta = phase.deltaTransform._dup();
    const percentTime = deltaTime / (this.duration + 0.000001);
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    // if (this.element.name === 'polygond6_5') {
    //   console.log('setFrame', p, deltaTime, this.transform.target)
    // }
    // let next = delta._dup().constant(p);

    // next = start.add(delta.mul(next));
    const next = this.transform.start.toDelta(
      this.transform.delta, p,
      this.transform.path.style,
      this.transform.path,
    );

    if (this.transform.clipRotationTo !== null) {
      next.clipRotation(this.transform.clipRotationTo);
    }
    if (this.element != null) {
      this.element.setTransform(next);
    }
  }

  setToEnd() {
    if (this.element != null) {
      this.element.setTransform(this.transform.target);
    }
  }

  _dup() {
    const step = new TransformAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
