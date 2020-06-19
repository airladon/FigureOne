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
import { areColorsSame } from '../../../../tools/color';

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
};

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
    allDurationsSame: boolean;
    zeroDurationThreshold: number;
    clipRotationTo:  '0to360' | '-180to180' | null;
  };

  constructor(...optionsIn: Array<TypeScenarioAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'scenario' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'target', 'translationStyle', 'translationOptions',
      'velocity', 'maxTime', 'allDurationsSame', 'rotDirection',
      'clipRotationTo',
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
      clipRotationTo: null,
      velocity: null,
      maxTime: null,
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
      'scenario',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'scenarioAnimationStep';
  }

  getDuration(
    start: { transform?: Transform, color?: color, isShown?: boolean, opacity?: number },
    target: { transform?: Transform, color?: color, isShown?: boolean },
  ) {
    const { element } = this;
    const { velocity } = this.scenario;
    if (velocity == null || element == null) {
      return [this.duration, this.duration, this.duration];
    }

    let transformVelocity = element.transform._dup().constant(1);
    let colorVelocity = velocity.color == null ? 1 : velocity.color;
    let opacityVelocity = velocity.opacity == null ? 1 : velocity.opacity;

    if (velocity)
    if (velocity.transform != null) {
      transformVelocity = velocity.transform._dup();
    }
    if (velocity.position != null) {
      transformVelocity.updateTranslation(velocity.position);
    }
    if (velocity.scale != null) {
      transformVelocity.updateScale(velocity.scale);
    }
    if (velocity.rotation != null) {
      transformVelocity.updateRotation(velocity.rotation);
    }
    if (velocity.color != null) {
      colorVelocity = velocity.color;
    }

    let transformDuration = 0;
    if (start.transform != null && target.transform != null) {
      transformDuration = getMaxTimeFromVelocity(
        start.transform._dup(), target.transform._dup(),
        transformVelocity, this.scenario.rotDirection,
      );
    }

    let colorDuration = 0;
    if (
      start.color != null
      && target.color != null
      && !areColorsSame(target.color, start.color)
    ) {
      const deltaColor = Math.abs(target.color - start.color);
      colorDuration = deltaColor / colorVelocity;
    }
    let opacityDuration = 0;
    if (target.isShown != null && target.isShown != null) {
      if (start.opacity != null && target.isShown === true) {
        const opacityDelta = 1 - start.opacity;
        opacityDuration = opacityDelta / opacityVelocity;
      } else if (start.opacity != null && target.isShown === false) {
        opacityDuration = start.opacity / opacityVelocity;
      } else if (start.isShown != target.isShown) {
        opacityDuration = 1 / opacityVelocity;
      }
    }

    if (this.scenario.maxTime != null) {
      colorDuration = Math.min(colorDuration, this.scenario.maxTime);
      opacityDuration = Math.min(opacityDuration, this.scenario.maxTime);
      transformDuration = Math.min(transformDuration, this.scenario.maxTime);
    }

    if (colorDuration < this.scenario.zeroDurationThreshold) {
      colorDuration = 0;
    }

    if (opacityDuration < this.scenario.zeroDurationThreshold) {
      opacityDuration = 0;
    }

    if (transformDuration < this.scenario.zeroDurationThreshold) {
      transformDuration = 0;
    }

    if (this.scenario.allDurationsSame != null) {
      const maxDuration = Math.max(colorDuration, opacityDuration, transformDuration);
      colorDuration = maxDuration;
      opacityDuration = maxDuration;
      transformDuration = maxDuration;
    }
    return [transformDuration, colorDuration, opacityDuration];
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?number = null) {
    super.start(startTime);
    const { element } = this;
    if (element == null) {
      throw new Error('Missing Element in animation');
    }
    let target = element.getScenarioTarget(this.scenario.target);
    if (Object.keys(target).length === 0) {
      target = element.getCurrentScenario();
    }

    let start = {};
    if (this.scenario.start != null) {
      start = element.getScenarioTarget(this.scenario.start);
    }
    if (Object.keys(start).length === 0) {
      start = element.getCurrentScenario();
      if (element.opacity !== 1) {
        start.opacity = element.opacity;
      }
    }

    let animateOpacity = false;
    let dissolve = null;
    let dissolveFromCurrent = false;
    if (start.isShown === false && target.isShown === true && start.opacity == null) {
      animateOpacity = 'dissolveIn'
    } else if (start.isShown === false && target.isShown === true && start.opacity != null) {
      animateOpacity = 'dissolveInFromCurrent'
    } else if (start.isShown === true && target.isShown === false) {
      animateOpacity = 'dissolveOut';
    }
    if (start.opacity != null) {
      animateOpacity = 'opacity';
    }

    const [transformDuration, colorDuration, opacityDuration] = this.getDuration(start, target);

    const steps = [];
    if (target.transform != null) {
      steps.push(element.anim.transform({
        start: start.transform,
        target: target.transform,
        duration: transformDuration,
        rotDirection: this.scenario.rotDirection,
        translationStyle: this.scenario.translationStyle,
        translationOptions: this.scenario.translationOptions,
        clipRotationTo: this.scenario.clipRotationTo,
      }));
    }

    if (target.color != null) {
      steps.push(element.anim.color({
        start: start.color,
        target: target.color,
        duration: colorDuration,
      }));
    }

    if (animateOpacity === 'dissolveIn') {
      steps.push(element.anim.dissolveIn({ duration: opacityDuration }));
    }
    if (animateOpacity === 'dissolveOut') {
      steps.push(element.anim.dissolveOut({ duration: opacityDuration }));
    }
    if (animateOpacity === 'opacity') {
      steps.push(element.anim.opacity({
        start: start.opacity,
        target: 1,
        duration: opacityDuration }));
    }

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
