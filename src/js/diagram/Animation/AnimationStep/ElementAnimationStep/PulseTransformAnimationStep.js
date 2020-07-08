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

export type TypePulseTransformAnimationStepInputOptions = {
  start?: Array<Transform>;      // default is element transform
  target?: Array<Transform>;     // Either target or delta must be defined
  // delta?: Transform;      // delta overrides target if both are defined
  translationStyle?: 'linear' | 'curved'; // default is linear
  translationOptions?: pathOptionsType;
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  velocity: ?Transform | number;
  maxTime?: number;
  zeroDurationThreshold?: Number;
  minTime?: number;
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
export default class PulseTransformAnimationStep extends ElementAnimationStep {
  transform: {
    start: Array<Transform>;  // null means use element transform when unit is started
    delta: Array<Transform>;
    target: Array<Transform>;
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?Transform | number;
    clipRotationTo: '0to360' | '-180to180' | null;
    maxTime: ?number;
    minTime: number;
    zeroDurationThreshold: number;
  };

  constructor(...optionsIn: Array<TypePulseTransformAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'transform' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'translationStyle',
      'translationOptions', 'velocity', 'clipRotationTo', 'maxTime',
      'minTime', 'zeroDurationThreshold',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: [],
      translationStyle: 'linear',
      rotDirection: 0,
      translationOptions: {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: '',
      },
      velocity: null,
      clipRotationTo: null,
      maxTime: null,
      minTime: 0,
      zeroDurationThreshold: 0,
    };
    if (this.element && this.element.animations.options.translation) {
      const translationOptions = this.element.animations.options.translation;
      if (translationOptions.style != null) {
        defaultTransformOptions.translationStyle = translationOptions.style;
      }
      joinObjects(defaultTransformOptions.translationOptions, translationOptions);
    }
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);
    // $FlowFixMe
    this.transform = { translationOptions: {} };
    copyKeysFromTo(options, this.transform, [
      'start', 'delta', 'target', 'translationStyle',
      'velocity', 'rotDirection', 'clipRotationTo', 'maxTime',
      'minTime', 'zeroDurationThreshold',
    ]);
    duplicateFromTo(options.translationOptions, this.transform.translationOptions);
  }

  // If spreading to more transforms, add transforms to before start and after finish.
  // If adding an odd number, more will be added to before start.
  // If spreading to less transforms, subtract transforms from middle. If all but one
  // is being subtracted, then the start transform will be retained.
  spread(transforms: Array<Transform>, toNum: number) {
    if (toNum === transforms.length) {
      return transforms;
    }
    if (toNum <= 1) {
      return [transforms[0]];
    }
    let spreadTransforms = [];
    if (toNum > transforms.length) {
      const delta = toNum - transforms.length;
      const startNum = Math.ceil(delta / 2);
      const endNum = Math.floor(delta / 2);
      const startTransform = transforms[0]._dup();
      const endTransform = transforms[transforms.length - 1]._dup();
      for (let i = 0; i < startNum; i += 1) {
        spreadTransforms.push(startTransform._dup());
      }
      for (let i = 0; i < transforms.length; i += 1) {
        spreadTransforms.push(transforms[i]._dup());
      }
      for (let i = 0; i < endNum; i += 1) {
        spreadTransforms.push(endTransform._dup());
      }
      return spreadTransforms;
    }
    const delta = transforms.length - toNum;
    const startNum = Math.ceil((transforms.length - delta) / 2);
    const endNum = Math.floor((transforms.length - delta) / 2);

    for (let i = 0; i < startNum; i += 1) {
      spreadTransforms.push(transforms[i]._dup());
    }
    for (let i = transforms.length - endNum; i < transforms.length; i += 1) {
      spreadTransforms.push(transforms[i]._dup());
    }
    return spreadTransforms;
  }

  setStartAndTarget() {
    const { start, target } = this.transform;
    const numTransforms = Math.max(start.length, target.length);
    this.transform.start = this.spread(this.transform.start, numTransforms);
    this.transform.target = this.spread(this.transform.target, numTransforms);
  }

  calculateStartTargetDelta() {
    if (this.transform.start.length != this.transform.target.length) {
      this.transform.delta = [];
      return;
    }
    this.transform.delta = [];
    for (let i = 0; i < this.transform.start.length; i += 1) {
      const start = this.transform.start[i];
      const target = this.transform.target[i];
      const delta = target.sub(start);
      delta.order.forEach((deltaStep, index) => {
        const startStep = start.order[index];
        const targetStep = target.order[index];
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
      this.transform.delta.push(delta);
    }
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
  start(startTime: ?number = null) {
    super.start(startTime);

    if (this.transform.start === null) {
      if (this.element != null) {
        this.transform.start = this.element.pulseTransforms.map(t => t._dup());
      } else {
        this.duration = 0;
        return;
      }
    }

    this.setStartAndTarget();

    // if delta is null, then calculate it from start and target
    this.calculateStartTargetDelta();
    if (this.transform.delta.length === 0) {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    if (this.transform.velocity != null) {
      for (let i = 0; i < this.transform.start.length; i += 1) {
        const start = this.transform.start[i];
        const target = this.transform.target[i];
        const duration = getMaxTimeFromVelocity(
          start,
          target,
          this.transform.velocity,
          this.transform.rotDirection,
        );
        if (duration > this.duration) {
          this.duration = duration;
        }
      }
    }
    if (this.transform.maxTime != null) {
      if (this.duration > this.transform.maxTime) {
        this.duration = this.transform.maxTime;
      }
    }
    if (this.duration <= this.transform.zeroDurationThreshold) {
      this.duration = 0;
    }
    if (this.duration < this.transform.minTime) {
      this.duration = this.transform.minTime;
    }
  }

  setFrame(deltaTime: number) {
    
    // const start = phase.startTransform._dup();
    // const delta = phase.deltaTransform._dup();
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    // let next = delta._dup().constant(p);

    // next = start.add(delta.mul(next));
    if (this.element == null) {
      return;
    }
    const { element } = this;
    element.frozenPulseTransforms = [];
    for (let i = 0; i < this.transform.start.length; i += 1) {
      const next = this.transform.start[i].toDelta(
        this.transform.delta[i], p,
        this.transform.translationStyle,
        this.transform.translationOptions,
      );
      if (this.transform.clipRotationTo !== null) {
        next.clipRotation(this.transform.clipRotationTo);
      }
      element.frozenPulseTransforms.push(next);  
    }
  }

  setToEnd() {
    if (this.element == null) {
      return;
    }
    const { element } = this;
    element.frozenPulseTransforms = [];
    this.transform.target.forEach((t) => {
      element.frozenPulseTransforms.push(t._dup());
    });
  }

  _dup() {
    const step = new PulseTransformsAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
