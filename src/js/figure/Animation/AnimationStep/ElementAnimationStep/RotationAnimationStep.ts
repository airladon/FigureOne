import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';

/**
 * {@link RotationAnimationStep} step options object.
 *
 * The {@link RotationAnimationStep} animates the rotation value of a the first
 * rotation component in a {@link Transform}.
 *
 * To rotate from a `start` rotation to a `target` rotation use the
 * `start`, `delta` and/or `target` properties.
 *
 * If `start` is not defined, the current rotation angle (when the animation
 * is started) will be used as `start`.
 *
 * Either `target` or `delta` (from start) can be used to define the target.
 *
 *
 * The animation can either move to the target with a `duration`, or the
 * `duration` can be determined by a `velocity`.
 *
 * Rotation animation targets can also be created with `velocity`, `start` and
 * `duration`. In this case, the rotation angles will grow with `velocity`. If
 * `duration` is null, then rotation duration will continue indefinitely until
 * the animation is cancelled.
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {number} [start] start rotation - current
 * rotation used if undefined
 * @property {number} [target] target rotation
 * @property {number} [delta] a delta rotation that can be
 * used to define `target` if `target` is undefined
 * @property {null | number} [velocity] velocity of
 * rotation can either define the `duration` of a rotation if `target` or
 * `delta` is defined, or can define the `target` of a rotation if `duration`
 * is defined. If `duration` is null, then velocity determines the change in
 * rotation over time (`null`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 *
 * @see {@link RotationAnimationStep} for description and examples
 * @interface
 * @group Misc Animation
 */
export type OBJ_RotationAnimationStep = {
  start?: number;      // default is element transform
  target?: number;     // Either target or delta must be defined
  delta?: number;      // delta overrides target if both are defined
  // 1 is CCW, -1 is CW, 0 is fastest, 2 is not through 0
  // direction: 0 | 1 | -1 | 2;
  // clipTo: '0to360' | '-180to180' | null;
  velocity?: number | null;
  maxDuration?: number | null;
} & OBJ_ElementAnimationStep;


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
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 * @group Animation
 */
export default class RotationAnimationStep extends ElementAnimationStep {
  rotation: {
    start: number;  // null means use element transform when unit is started
    delta: number;
    target: number;
    // direction: 0 | 1 | -1 | 2;
    velocity: number;
    maxDuration: number | null | undefined;
    clipTo: '0to360' | '-180to180' | null;
  };

  /**
   * @hideconstructor
   */
  constructor(...optionsIn: Array<OBJ_RotationAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects<any>({}, { type: 'rotation' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'direction', 'velocity', 'clipTo', 'maxDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      // direction: 0,
      velocity: null,
      clipTo: null,
      maxDuration: null,
    };
    const options = joinObjects<any>({}, defaultTransformOptions, ...optionsIn);

    this.rotation = {} as any;
    copyKeysFromTo(options, this.rotation, [
      'start', 'delta', 'target', 'velocity',
      // 'direction',
      'clipTo',
      'maxDuration',
    ]);
  }

  override _getStateProperties() {  // eslint-disable-line class-methods-use-this
    const a = [...super._getStateProperties(),
      'rotation',
    ];
    return a;
  }

  override _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'rotationAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  override start(startTime: AnimationStartTime | null = null) {
    super.start(startTime);
    if (this.rotation.start === null) {
      if (this.element != null) {
        this.rotation.start = this.element.getRotation();
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
      const deltaVal = targetVal - startVal;
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
      this.rotation.target = startVal + deltaVal;
    // If duration is defined and velocity exists, (and target is yet to be
    // defined), then velocity and duration can define the target
    } else if (velocity != null && this.duration != null) {
      this.rotation.target = start + velocity * this.duration;
      this.rotation.delta = velocity * this.duration;
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
      this.duration = (target - start) / velocity;
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

  override setFrame(deltaTime: number) {
    if (this.duration == null || this.rotation.delta == null) {
      const { start } = this.rotation;
      const v = start + deltaTime * this.rotation.velocity;
      if (this.element != null) {
        this.element.setRotation(v);
      }
      return;
    }
    const percentTime = deltaTime / (this.duration + 0.000001);
    const percentComplete = this.getPercentComplete(percentTime);
    const { start, delta } = this.rotation;
    const nextR = start + delta * percentComplete;
    const { element } = this;
    if (element != null) {
      element.setRotation(nextR);
    }
  }

  override setToEnd() {
    const { element } = this;
    if (element != null) {
      if (this.rotation.target != null) {
        element.transform.updateRotation(this.rotation.target);
      }
      this.fnExec(element.setTransformCallback, element.transform);
    }
  }

  override _dup() {
    const step = new RotationAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
