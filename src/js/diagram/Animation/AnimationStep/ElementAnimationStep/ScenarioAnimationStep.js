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

export type TypeScenario = {
  position?: TypeParsablePoint,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: Array<number>,
  isShown?: boolean,
};

export type TypeScenarioVelocity = {
  position?: TypeParsablePoint,
  rotation?: Number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: number,
  opacity?: number,
} | number | TypeParsablePoint;

export type TypeScenarioAnimationStepInputOptions = {
  start?: string | TypeScenario;
  target?: string | TypeScenario;
  velocity?: TypeScenarioVelocity;
  // minTime?: number,
  maxTime?: number,
  zeroDurationThreshold?: number,
  allDurationsSame?: boolean,
  translationStyle?: 'linear' | 'curved'; // default is linear
  translationOptions?: pathOptionsType;
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
} & TypeElementAnimationStepInputOptions;

export default class ScenarioAnimationStep extends ElementAnimationStep {
  scenario: {
    start: ?(string | TypeScenario);  // null means use element props when unit is started
    target: ?(string | TypeScenario);
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?TypeScenarioVelocity;
    maxTime: ?number;
    zeroDurationThreshold: ?number;
  };

  constructor(...optionsIn: Array<TypeScenarioAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'scenario' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'target', 'translationStyle', 'translationOptions',
      'velocity', 'maxTime', 'allDurationsSame', 'rotDirection', 'clipRotationTo'
    ]);
    super(ElementAnimationStepOptionsIn);
    this._stepType = 'position';
    const defaultScenarioOptions = {
      start: null,
      target: null,
      translationStyle: 'linear',
      translationOptions: {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: '',
      },
      rotDirection: 0,
      maxTime: null,
      clipRotationTo: null,
      velocity: null,
      allDurationsSame: true,
      zeroDurationThreshold: 0,
    };
    if (this.element && this.element.animations.options.translation) {
      const translationOptions = this.element.animations.options.translation;
      if (translationOptions.style != null) {
        // $FlowFixMe - this is messy, but deal with it
        defaultScenarioOptions.translationStyle = translationOptions.style;
      }
      joinObjects(defaultScenarioOptions.translationOptions, translationOptions);
    }
    const options = joinObjects({}, defaultScenarioOptions, ...optionsIn);
    // if (options.start != null) {
    //   options.start = getPoint(options.start);
    // }
    // if (options.target != null) {
    //   options.target = getPoint(options.target);
    // }
    // if (options.delta != null) {
    //   options.delta = getPoint(options.delta);
    // }
    // $FlowFixMe
    this.scenario = { translationOptions: {} };
    copyKeysFromTo(options, this.scenario, [
      'start', 'target', 'translationStyle',
      'velocity', 'maxTime', 'allDurationsSame', 'zeroDurationThreshold',
      'rotDirection', 'clipRotationTo',
    ]);
    duplicateFromTo(options.translationOptions, this.scenario.translationOptions);
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
  start(startTime: ?number = null) {
    super.start(startTime);
    if (this.position.start === null) {
      if (this.element != null) {
        this.position.start = this.element.getPosition();
      } else {
        this.duration = 0;
        return;
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
    if (this.element != null) {
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
