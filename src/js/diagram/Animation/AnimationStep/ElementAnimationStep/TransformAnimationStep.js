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

export type TypeTransformAnimationStepInputOptions = {
  start?: Transform;      // default is element transform
  target?: Transform;     // Either target or delta must be defined
  delta?: Transform;      // delta overrides target if both are defined
  translationStyle?: 'linear' | 'curved'; // default is linear
  translationOptions?: pathOptionsType;
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  velocity: ?Transform | number;
  maxTime?: number;
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
export default class TransformAnimationStep extends ElementAnimationStep {
  transform: {
    start: Transform;  // null means use element transform when unit is started
    delta: Transform;
    target: Transform;
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?Transform | number;
    clipRotationTo: '0to360' | '-180to180' | null;
    maxTime: ?number;
  };

  constructor(...optionsIn: Array<TypeTransformAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'transform' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'translationStyle',
      'translationOptions', 'velocity', 'clipRotationTo', 'maxTime',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
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
    ]);
    duplicateFromTo(options.translationOptions, this.transform.translationOptions);
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
    if (this.transform.maxTime != null) {
      if (this.duration > this.transform.maxTime) {
        this.duration = this.transform.maxTime;
      }
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
    const next = this.transform.start.toDelta(
      this.transform.delta, p,
      this.transform.translationStyle,
      this.transform.translationOptions,
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
  // finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
  //   if (this.state === 'idle') {
  //     return;
  //   }
  //   super.finish(cancelled, force);
  //   const setToEnd = () => {
  //     if (this.element != null) {
  //       this.element.setTransform(this.transform.target);
  //     }
  //   };
  //   if (cancelled && force === 'complete') {
  //     setToEnd();
  //   }
  //   if (cancelled && force == null && this.completeOnCancel === true) {
  //     setToEnd();
  //   }
  //   if (cancelled === false) {
  //     setToEnd();
  //   }

  //   if (this.onFinish != null) {
  //     this.onFinish(cancelled);
  //   }
  // }

  _dup() {
    const step = new TransformAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
