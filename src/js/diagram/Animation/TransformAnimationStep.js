// @flow
import {
  Transform,
  Rotation, getDeltaAngle, getMaxTimeFromVelocity,
} from '../../tools/g2';
import type { pathOptionsType } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from './ElementAnimationStep';
import ElementAnimationStep from './ElementAnimationStep';

export type TypeTransformAnimationStepInputOptions = {
  transform: {
    start?: Transform;      // default is element transform
    target?: Transform;     // Either target or delta must be defined
    delta?: Transform;      // delta overrides target if both are defined
    translationStyle?: 'linear' | 'curved'; // default is linear
    translationOptions?: pathOptionsType;
    rotDirection: 0 | 1 | -1 | 2;
  };
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
    velocity: ?Transform;
  };

  constructor(optionsIn: TypeTransformAnimationStepInputOptions) {
    super(joinObjects({}, optionsIn, { type: 'transform' }));
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
    };
    let options = defaultTransformOptions;
    if (optionsIn.transform != null) {
      options = joinObjects({}, defaultTransformOptions, optionsIn.transform);
    }
    // $FlowFixMe
    this.transform = {};
    this.transform.rotDirection = options.rotDirection;
    this.transform.start = options.start;
    this.transform.target = options.target;
    this.transform.delta = options.delta;
    this.transform.translationStyle = options.translationStyle;
    this.transform.translationOptions = options.translationOptions;
    this.transform.velocity = options.velocity;
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start() {
    super.start();
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
  }

  setFrame(deltaTime: number) {
    // const start = phase.startTransform._dup();
    // const delta = phase.deltaTransform._dup();
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;
    // let next = delta._dup().constant(p);

    // next = start.add(delta.mul(next));
    const next = this.transform.start.toDelta(
      this.transform.delta, p,
      this.transform.translationStyle,
      this.transform.translationOptions,
    );
    if (this.element != null) {
      this.element.setTransform(next);
    }
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    const setToEnd = () => {
      if (this.element != null) {
        this.element.setTransform(this.transform.target);
      }
    };
    if (cancelled && force === 'complete') {
      setToEnd();
    }
    if (cancelled && force == null && this.completeOnCancel === true) {
      setToEnd();
    }
    if (cancelled === false) {
      setToEnd();
    }

    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}
