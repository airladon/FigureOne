// @flow
import {
  Transform,
  Rotation, getDeltaAngle, getMaxTimeFromVelocity,
} from '../../../../tools/g2';
import type { pathOptionsType } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

export type TypeRotationAnimationStepInputOptions = {
  start?: number;      // default is element transform
  target?: number;     // Either target or delta must be defined
  delta?: number;      // delta overrides target if both are defined
  rotDirection: 0 | 1 | -1 | 2;
} & TypeElementAnimationStepInputOptions;

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
export default class RotationAnimationStep extends ElementAnimationStep {
  rotation: {
    start: number;  // null means use element transform when unit is started
    delta: number;
    target: number;
    rotDirection: 0 | 1 | -1 | 2;
    velocity: ?number;
  };

  constructor(...optionsIn: Array<TypeRotationAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'rotation' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'velocity',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      rotDirection: 0,
      velocity: null,
    };
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);
    // $FlowFixMe
    this.rotation = {};
    copyKeysFromTo(options, this.rotation, [
      'start', 'delta', 'target', 'velocity', 'rotDirection',
    ]);
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime?: number) {
    super.start(startTime);
    if (this.rotation.start === null) {
      if (this.element != null) {
        this.rotation.start = this.element.transform.r() || 0;
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.rotation.delta == null && this.rotation.target != null) {
      const delta = getDeltaAngle(
        this.rotation.start,
        this.rotation.target,
        this.rotation.rotDirection,
      );
      this.rotation.delta = delta;
    } else if (this.rotation.delta != null) {
      this.rotation.target = this.rotation.start + this.rotation.delta;
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    const { velocity } = this.rotation;
    if (velocity != null) {
      this.duration = getMaxTimeFromVelocity(
        new Transform().rotate(this.rotation.start),
        new Transform().rotate(this.rotation.target),
        new Transform().rotate(velocity),
        this.rotation.rotDirection,
      );
    }
  }

  setFrame(deltaTime: number) {
    // const start = phase.startTransform._dup();
    // const delta = phase.deltaTransform._dup();
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;
    // let next = delta._dup().constant(p);

    // next = start.add(delta.mul(next));
    const nextR = this.rotation.start + this.rotation.delta * p;
    const { element } = this;
    if (element != null) {
      element.transform.updateRotation(nextR);
      element.setTransformCallback(element.transform);
    }
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      element.transform.updateRotation(this.rotation.target);
      element.setTransformCallback(element.transform);
    }
  }

  _dup() {
    const step = new RotationAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
