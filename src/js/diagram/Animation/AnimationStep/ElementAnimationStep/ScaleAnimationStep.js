// @flow
import {
  Transform, Point, getMaxTimeFromVelocity,
} from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

export type TypeScaleAnimationStepInputOptions = {
  start?: Point | number;      // default is element transform
  target?: Point | number;     // Either target or delta must be defined
  delta?: Point | number;      // delta overrides target if both are defined
  velocity?: Point | number;
} & TypeElementAnimationStepInputOptions;

export default class ScaleAnimationStep extends ElementAnimationStep {
  scale: {
    start: ?Point;  // null means use element transform when unit is started
    delta: ?Point;
    target: ?Point;
    velocity: ?Point;
  };

  constructor(...optionsIn: Array<TypeScaleAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'position' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'velocity',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      velocity: null,
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    // $FlowFixMe
    this.scale = {};
    if (typeof options.start === 'number') {
      options.start = new Point(options.start, options.start);
    }
    if (typeof options.target === 'number') {
      options.target = new Point(options.start, options.start);
    }
    if (typeof options.delta === 'number') {
      options.delta = new Point(options.start, options.start);
    }
    copyKeysFromTo(options, this.scale, [
      'start', 'delta', 'target', 'translationStyle',
      'velocity',
    ]);
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime?: number) {
    super.start(startTime);
    if (this.scale.start === null) {
      if (this.element != null) {
        this.scale.start = this.element.getScale();
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.scale.delta == null
      && this.scale.target != null
      && this.scale.start != null
    ) {
      const delta = this.scale.target.sub(this.scale.start);
      this.scale.delta = delta;
    } else if (this.scale.delta != null && this.scale.start != null) {
      this.scale.target = this.scale.start.add(this.scale.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    if (this.scale.velocity != null
      && this.scale.target != null
      && this.scale.start != null
    ) {
      let { velocity } = this.scale;
      if (typeof velocity === 'number') {
        velocity = new Point(velocity, velocity);
      }
      this.duration = getMaxTimeFromVelocity(
        new Transform().scale(this.scale.start),
        new Transform().scale(this.scale.target),
        new Transform().scale(velocity),
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
    if (this.scale.start != null && this.scale.delta != null) {
      const next = this.scale.start.toDelta(this.scale.delta, p);
      if (this.element != null) {
        this.element.setPosition(next);
      }
    }
  }

  setToEnd() {
    if (this.element != null) {
      this.element.setPosition(this.scale.target);
    }
  }
  // finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
  //   if (this.state === 'idle') {
  //     return;
  //   }
  //   super.finish(cancelled, force);
  //   const setToEnd = () => {
  //     if (this.element != null) {
  //       this.element.setPosition(this.position.target);
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
    const step = new ScaleAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
