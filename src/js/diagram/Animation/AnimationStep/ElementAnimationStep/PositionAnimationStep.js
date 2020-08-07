// @flow
import {
  Transform, Point, getMaxTimeFromVelocity, getPoint,
} from '../../../../tools/g2';
import type { pathOptionsType } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
  // joinObjectsWithOptions,
} from '../../../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
// import type { DiagramElement } from '../../../Element';

export type TypePositionAnimationStepInputOptions = {
  start?: Point;      // default is element transform
  target?: Point;     // Either target or delta must be defined
  delta?: Point;      // delta overrides target if both are defined
  translationStyle?: 'linear' | 'curved'; // default is linear
  translationOptions?: pathOptionsType;
  velocity?: Point;
  maxTime?: number;
} & TypeElementAnimationStepInputOptions;

export default class PositionAnimationStep extends ElementAnimationStep {
  position: {
    start: ?Point;  // null means use element transform when unit is started
    delta: ?Point;
    target: ?Point;
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?Point;
    maxTime: ?number;
  };

  constructor(...optionsIn: Array<TypePositionAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'position' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'translationStyle', 'translationOptions',
      'velocity', 'maxTime',
    ]);
    super(ElementAnimationStepOptionsIn);
    this._stepType = 'position';
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      translationStyle: 'linear',
      translationOptions: {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: '',
        maxTime: null,
      },
      velocity: null,
    };
    if (this.element && this.element.animations.options.translation) {
      const translationOptions = this.element.animations.options.translation;
      if (translationOptions.style != null) {
        // $FlowFixMe - this is messy, but deal with it
        defaultPositionOptions.style = translationOptions.style;
      }
      joinObjects(defaultPositionOptions.translationOptions, translationOptions);
    }
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    if (options.start != null) {
      options.start = getPoint(options.start);
    }
    if (options.target != null) {
      options.target = getPoint(options.target);
    }
    if (options.delta != null) {
      options.delta = getPoint(options.delta);
    }
    // $FlowFixMe
    this.position = { translationOptions: {} };
    copyKeysFromTo(options, this.position, [
      'start', 'delta', 'target', 'translationStyle',
      'velocity', 'maxTime',
    ]);
    duplicateFromTo(options.translationOptions, this.position.translationOptions);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'position',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'positionAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    super.start(startTime);
    if (this.position.start == null) {
      if (this.element != null) {
        this.position.start = this.element.getPosition();
      } else {
        this.duration = 0;
        return;
      }
    } else if (startTime === 'now' || startTime === 'prev') {
      if (this.element != null) {
        this.element.setPosition(getPoint(this.position.start));
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.position.delta == null
      && this.position.target != null
      && this.position.start != null
    ) {
      const delta = this.position.target.sub(this.position.start);
      this.position.delta = delta;
    } else if (this.position.delta != null && this.position.start != null) {
      this.position.target = this.position.start.add(this.position.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    const { target, start, velocity } = this.position;
    if (velocity != null && start != null && target != null) {
      const velocityToUse = getPoint(velocity);
      this.duration = getMaxTimeFromVelocity(
        new Transform().translate(start),
        new Transform().translate(target),
        new Transform().translate(velocityToUse),
      );
    }
    if (this.position.maxTime != null) {
      if (this.duration > this.position.maxTime) {
        this.duration = this.position.maxTime;
      }
    }
  }

  setFrame(deltaTime: number) {
    // console.log('setFrame', deltaTime);
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;

    if (this.position.delta != null && this.position.start != null) {
      const next = this.position.start.toDelta(
        this.position.delta, p,
        this.position.translationStyle,
        this.position.translationOptions,
      );
      if (this.element != null) {
        this.element.setPosition(next);
      }
    }
  }

  setToEnd() {
    if (this.element != null && this.position.target != null) {
      this.element.setPosition(this.position.target);
    }
  }

  _dup() {
    const step = new PositionAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
