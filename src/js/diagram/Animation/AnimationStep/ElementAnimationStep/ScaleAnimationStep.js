// @flow
import {
  Transform, Point, getMaxTimeFromVelocity, getPoint,
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
  maxTime: ?number;
} & TypeElementAnimationStepInputOptions;

export default class ScaleAnimationStep extends ElementAnimationStep {
  scale: {
    start: ?Point;  // null means use element transform when unit is started
    delta: ?Point;
    target: ?Point;
    velocity: ?Point;
    maxTime: ?number;
  };

  constructor(...optionsIn: Array<TypeScaleAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'position' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'velocity', 'maxTime',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      velocity: null,
      maxTime: null,
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    // $FlowFixMe
    this.scale = {};
    if (options.start != null) {
      options.start = getPoint(options.start);
    }
    if (options.target != null) {
      options.target = getPoint(options.target);
    }
    if (options.delta != null) {
      options.delta = getPoint(options.delta);
    }

    copyKeysFromTo(options, this.scale, [
      'start', 'delta', 'target', 'translationStyle',
      'velocity', 'maxTime',
    ]);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'scale',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'scaleAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
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
    const { target, start, velocity } = this.scale;
    if (velocity != null
      && target != null
      && start != null
    ) {
      const velocityToUse = getPoint(velocity);
      // if (typeof velocity === 'number') {
      //   velocityToUse = new Point(velocity, velocity);
      // }
      this.duration = getMaxTimeFromVelocity(
        new Transform().scale(start),
        new Transform().scale(target),
        new Transform().scale(velocityToUse),
      );
    }
    if (this.scale.maxTime != null) {
      if (this.duration > this.scale.maxTime) {
        this.duration = this.scale.maxTime;
      }
    }
    if (startTime === 'now' || startTime === 'prev') {
      this.setFrame(0);
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;

    if (this.scale.start != null && this.scale.delta != null) {
      const next = this.scale.start.toDelta(this.scale.delta, p);
      if (this.element != null) {
        this.element.setScale(next);
      }
    }
  }

  setToEnd() {
    if (this.element != null) {
      this.element.setScale(this.scale.target);
    }
  }

  _dup() {
    const step = new ScaleAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
