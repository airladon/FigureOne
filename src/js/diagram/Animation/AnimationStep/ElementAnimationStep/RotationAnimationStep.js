// @flow
import {
  Transform, getDeltaAngle, getMaxTimeFromVelocity,
} from '../../../../tools/g2';
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
  // 1 is CCW, -1 is CW, 0 is fastest, 2 is not through 0
  rotDirection: 0 | 1 | -1 | 2;
  clipTo: '0to360' | '-180to180' | null;
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
    clipTo: '360' | 'plusMinus180' | null;
  };

  constructor(...optionsIn: Array<TypeRotationAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'rotation' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'velocity', 'clipTo',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      rotDirection: 0,
      velocity: null,
      clipTo: '0to360',
    };
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);
    // $FlowFixMe
    this.rotation = {};
    copyKeysFromTo(options, this.rotation, [
      'start', 'delta', 'target', 'velocity', 'rotDirection', 'clipTo'
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

  clipRotation(r: number) {
    let rotation = r;
    if (this.rotation.clipTo === '0to360') {
      if (rotation < 0) {
        rotation += Math.PI * 2;
      }
      if (rotation >= Math.PI * 2) {
        rotation -= Math.PI * 2;
      }
    }
    if (this.rotation.clipTo === '-180to180') {
      if (rotation < -Math.PI) {
        rotation += Math.PI * 2;
      }
      if (rotation >= Math.PI) {
        rotation -= Math.PI * 2;
      }
    }
    return rotation;
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;

    let nextR = this.rotation.start + this.rotation.delta * p;
    nextR = this.clipRotation(nextR);
    const { element } = this;
    if (element != null) {
      element.setRotation(nextR);
    }
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      element.transform.updateRotation(this.clipRotation(this.rotation.target));
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
