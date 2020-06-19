// @flow
import {
  Transform, Point, getMaxTimeFromVelocity, getPoint, getScale, getTransform,
} from '../../../../tools/g2';
import type {
  pathOptionsType, TypeParsableTransform, TypeParsablePoint,

} from '../../../../tools/g2';
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
import { ParallelAnimationStep } from  '../ParallelAnimationStep';
import type { DiagramElement } from '../../../Element';

export type TypeScenario = {
  position?: TypeParsablePoint,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: Array<number>,
  isShown?: boolean,
};

export type TypeScenarioVelocity = {
  position?: TypeParsablePoint | number,
  translation?: TypeParsablePoint | number,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: number,
  opacity?: number,
};

export type TypeScenarioAnimationStepInputOptions = {
  element: ?DiagramElement;
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
  progression: ((number, ?boolean) => number) | string;
} & TypeElementAnimationStepInputOptions;

export default class ScenarioAnimationStep extends ParallelAnimationStep {
  element: ?DiagramElement;
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
    clipRotationTo: '0to360' | '-180to180' | null;
    progression: ((number, ?boolean) => number) | string;
  };

  constructor(...optionsIn: Array<TypeScenarioAnimationStepInputOptions>) {
    const AnimationStepOptionsIn =
      joinObjects({}, { type: 'scenario' }, ...optionsIn);
    deleteKeys(AnimationStepOptionsIn, [
      'start', 'target', 'translationStyle', 'translationOptions',
      'velocity', 'maxTime', 'allDurationsSame', 'rotDirection',
      'clipRotationTo', 'element', 'progression',
    ]);
    super(AnimationStepOptionsIn);
    this._stepType = 'position';

    const defaultScenarioOptions = {
      element: null,
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
      progression: 'tools.math.easeinout',
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
    this.element = options.element;

    // $FlowFixMe
    this.scenario = { translationOptions: {} };
    copyKeysFromTo(options, this.scenario, [
      'start', 'target', 'translationStyle',
      'velocity', 'maxTime', 'allDurationsSame', 'zeroDurationThreshold',
      'rotDirection', 'clipRotationTo', 'progression',
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
    start: { transform?: Transform, color?: Array<number>, isShown?: boolean, opacity?: number },
    target: { transform?: Transform, color?: Array<number>, isShown?: boolean },
  ) {
    const { element } = this;
    const { velocity } = this.scenario;
    if (velocity == null || element == null || this.duration > 0) {
      return [this.duration, this.duration, this.duration];
    }

    let transformVelocity = element.transform._dup().constant(1);
    const colorVelocity = velocity.color == null ? 1 : velocity.color;
    const opacityVelocity = velocity.opacity == null ? 1 : velocity.opacity;

    if (velocity.transform != null) {
      transformVelocity = getTransform(velocity.transform)._dup();
    }
    if (velocity.position != null) {
      transformVelocity.updateTranslation(getScale(velocity.position));
    }
    if (velocity.translation != null) {
      transformVelocity.updateTranslation(getScale(velocity.translation));
    }
    if (velocity.scale != null) {
      transformVelocity.updateScale(getScale(velocity.scale));
    }
    if (velocity.rotation != null) {
      transformVelocity.updateRotation(velocity.rotation);
    }
    // if (velocity.color != null) {
    //   colorVelocity = velocity.color;
    // }

    // if (velocity.opacity != null) {
    //   opacityVelocity = velocity.color;
    // }

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
      const deltaColor = Math.max(
        Math.abs(target.color[0] - start.color[0]),
        Math.abs(target.color[1] - start.color[1]),
        Math.abs(target.color[2] - start.color[2]),
        Math.abs(target.color[3] - start.color[3]),
      );
      // const deltaColor = Math.abs(target.color - start.color);
      colorDuration = deltaColor / colorVelocity;
    }
    let opacityDuration = 0;
    if (start.isShown != null && target.isShown != null) {
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

    if (colorDuration <= this.scenario.zeroDurationThreshold) {
      colorDuration = 0;
    }

    if (opacityDuration <= this.scenario.zeroDurationThreshold) {
      opacityDuration = 0;
    }

    if (transformDuration <= this.scenario.zeroDurationThreshold) {
      transformDuration = 0;
    }

    if (this.scenario.allDurationsSame) {
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

    // let animateOpacity = false;
    let dissolve = null;
    let dissolveFromCurrent = false;
    if (start.isShown === false && target.isShown === true && start.opacity == null) {
      dissolve = 'in';
    } else if (target.isShown === true && start.opacity != null) {
      dissolve = 'in';
      dissolveFromCurrent = true;
    } else if (start.isShown === true && target.isShown === false && start.opacity == null) {
      dissolve = 'out';
    } else if (target.isShown === false && start.opacity != null) {
      dissolve = 'out';
      dissolveFromCurrent = true;
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
        progression: this.scenario.progression,
      }));
    }
    // debugger;

    if (target.color != null) {
      steps.push(element.anim.color({
        start: start.color,
        target: target.color,
        duration: colorDuration,
        progression: this.scenario.progression,
      }));
    }

    if (dissolve != null) {
      steps.push(element.anim.opacity({
        dissolve,
        dissolveFromCurrent,
        duration: opacityDuration,
        progression: this.scenario.progression,
      }));
    }
    this.steps = steps;
    super.start(startTime);
  }

  _dup() {
    const step = new ScenarioAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
