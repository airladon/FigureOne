// @flow
import {
  Transform, getMaxTimeFromVelocity, getScale, getTransform,
} from '../../../../tools/g2';
import type {
  pathOptionsType, TypeParsableTransform, TypeParsablePoint,

} from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
  // joinObjectsWithOptions,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
// import ElementAnimationStep from '../ElementAnimationStep';
// import type { DiagramElement } from '../../../Element';
import { areColorsSame } from '../../../../tools/color';
import { ParallelAnimationStep } from '../ParallelAnimationStep';
import type { DiagramElement, OBJ_Scenario } from '../../../Element';
import type { AnimationStartTime } from '../../AnimationManager';


/**
 * Transform, color and visbility scenario definition
 *
 * `translation` will overwirte `position`, and `translation, `position`,
 * rotation` and `scale` overwrite the first equivalent transforms in
 * `transform`
 *
 * @property {TypeParsablePoint} [position]
 * @property {TypeParsablePoint} [translation]
 * @property {TypeParsablePoint | number} [scale]
 * @property {number} [rotation]
 * @property {TypeParsableTransform} [transform]
 * @property {Array<number>} [color]
 * @property {number} [opacity]
 */
export type OBJ_ScenarioVelocity = {
  position?: TypeParsablePoint | number,
  translation?: TypeParsablePoint | number,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: number,
  opacity?: number,
};

/**
 * Scenario animation step options object
 *
 * By default, the scenario will start with the element's current scenario.
 *
 * @extends OBJ_ElementAnimationStep
 * @property {string | OBJ_Scenario} [start]
 * @property {string | OBJ_Scenario} [target]
 * @property {null | string | OBJ_ScenarioVelocity} [velocity] velocity
 * will override duration with a calculated duration based on
 * the `start`, `target` and `velocity`. If `null` is used
 * then `duration` will not be overriden (`null`)
 * @property {number} [maxDuration]
 * @property {number} [zeroDurationThreshold]
 * @property {boolean} [allDurationsSame]
 * @property {'linear' | 'curved'} [translationStyle] (`'linear'`)
 * @property {CurvedPathOptionsType} [translationOptions]
 * @property {0 | 1 | -1 | 2} [rotDirection] where `0` is quickest direction,
 * `1` is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0.
 * @property {'0to360' | '-180to180' | null} [clipRotationTo]
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 * how the animation progresses - defaults to `linear` for color, opacity and
 * custom animations and `easeinout` for others
 */
export type OBJ_ScenarioAnimationStep = {
  start?: string | OBJ_Scenario;
  target?: string | OBJ_Scenario;
  velocity?: OBJ_ScenarioVelocity;
  // minDuration?: number,
  maxDuration?: number,
  zeroDurationThreshold?: number,
  allDurationsSame?: boolean,
  translationStyle?: 'linear' | 'curved'; // default is linear
  translationOptions?: pathOptionsType;
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  progression: 'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression;
} & OBJ_ElementAnimationStep;

/**
 * Scenario Animation Step
 * @extends ElementAnimationStep
 */
export default class ScenarioAnimationStep extends ParallelAnimationStep {
  element: ?DiagramElement;
  scenario: {
    start: ?(string | OBJ_Scenario);  // null means use element props when unit is started
    target: ?(string | OBJ_Scenario);
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?OBJ_ScenarioVelocity;
    maxDuration: ?number;
    allDurationsSame: boolean;
    zeroDurationThreshold: number;
    clipRotationTo: '0to360' | '-180to180' | null;
    progression: ((number, ?boolean) => number) | string;
    // minDuration: number;
  };

  constructor(...optionsIn: Array<OBJ_ScenarioAnimationStep>) {
    const AnimationStepOptionsIn =
      joinObjects({}, { type: 'scenario' }, ...optionsIn);
    deleteKeys(AnimationStepOptionsIn, [
      'start', 'target', 'translationStyle', 'translationOptions',
      'velocity', 'maxDuration', 'allDurationsSame', 'rotDirection',
      'clipRotationTo', 'element', 'progression', // 'minDuration',
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
      maxDuration: null,
      allDurationsSame: true,
      zeroDurationThreshold: 0,
      progression: 'tools.math.easeinout',
      // minDuration: 0,
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
      'velocity', 'maxDuration', 'allDurationsSame', 'zeroDurationThreshold',
      'rotDirection', 'clipRotationTo', 'progression', // 'minDuration',
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
    // console.log(velocity)
    // console.log(this.duration)
    // console.log(element)
    if (velocity == null || element == null) {
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
    const startTransform = start.transform;
    const targetTransform = target.transform;
    if (startTransform != null && targetTransform != null) {
      transformDuration = getMaxTimeFromVelocity(
        startTransform._dup(), targetTransform._dup(),
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
        Math.abs(target.color[0] - start.color[0]),  // $FlowFixMe
        Math.abs(target.color[1] - start.color[1]),  // $FlowFixMe
        Math.abs(target.color[2] - start.color[2]),  // $FlowFixMe
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
      } else if (start.isShown !== target.isShown) {
        opacityDuration = 1 / opacityVelocity;
      }
    }

    const scenarioMaxTime = this.scenario.maxDuration;
    if (scenarioMaxTime != null) {
      colorDuration = Math.min(colorDuration, scenarioMaxTime);
      opacityDuration = Math.min(opacityDuration, scenarioMaxTime);
      transformDuration = Math.min(transformDuration, scenarioMaxTime);
    }

    if (colorDuration <= this.scenario.zeroDurationThreshold) {
      colorDuration = 0;
    }

    if (colorDuration < this.duration) {
      colorDuration = this.duration;
    }

    if (opacityDuration <= this.scenario.zeroDurationThreshold) {
      opacityDuration = 0;
    }

    if (opacityDuration < this.duration) {
      opacityDuration = this.duration;
    }

    if (transformDuration <= this.scenario.zeroDurationThreshold) {
      transformDuration = 0;
    }

    if (transformDuration < this.duration) {
      transformDuration = this.duration;
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
  start(startTime: AnimationStartTime = null) {
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

    // $FlowFixMe
    const [transformDuration, colorDuration, opacityDuration] = this.getDuration(start, target);
    // console.log(transformDuration, colorDuration, opacityDuration);
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
    // if (startTime === 'now' || startTime === 'prev') {
    //   this.setFrame(0);
    // }
  }

  _dup() {
    const step = new ScenarioAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
