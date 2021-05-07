// @flow
import {
  Transform, getMaxTimeFromVelocity, getScale, getTransform,
} from '../../../../tools/g2';
import type {
  OBJ_TranslationPath, TypeParsableTransform, TypeParsablePoint,

} from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
  // joinObjectsWithOptions,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep, AnimationProgression,
} from '../ElementAnimationStep';
// import ElementAnimationStep from '../ElementAnimationStep';
// import type { FigureElement } from '../../../Element';
import { areColorsSame } from '../../../../tools/color';
import { ParallelAnimationStep } from '../ParallelAnimationStep';
import type { FigureElement, OBJ_Scenario } from '../../../Element';
import type { AnimationStartTime } from '../../AnimationManager';
import type { TypeColor } from '../../../../tools/types';

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
 * @property {TypeColor} [color]
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
 * {@link ScenarioAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {string | OBJ_Scenario} [start]
 * @property {string | OBJ_Scenario} [target]
 * @property {null | string | OBJ_ScenarioVelocity} [velocity] velocity
 * will override duration with a calculated duration based on
 * the `start`, `target` and `velocity`. If `null` is used
 * then `duration` will not be overriden. Any scenario velocity elements that
 * are undefined will default to 1 (`null`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 * @property {number} [zeroDurationThreshold] value considered 0 to stop
 * animation - this is useful when numbers get very small and rounding problems
 * with javascripts floating point implementation arise
 * @property {OBJ_TranslationPath} [path] translation path style and options
 * (`{ style: 'linear' }`)
 * @property {0 | 1 | -1 | 2} [rotDirection] where `0` is quickest direction,
 * `1` is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0.
 * @property {'0to360' | '-180to180' | null} [clipRotationTo]
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 * (`'easeinout'`)
 */
export type OBJ_ScenarioAnimationStep = {
  start?: string | OBJ_Scenario;
  target?: string | OBJ_Scenario;
  velocity?: OBJ_ScenarioVelocity;
  // minDuration?: number,
  maxDuration?: number,
  zeroDurationThreshold?: number,
  allDurationsSame?: boolean,
  path?: OBJ_TranslationPath,
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  progression: 'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression;
} & OBJ_ElementAnimationStep;

/**
 * {@link ScenarioAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 *
 * @property {string} [target]
 * @property {null | string | OBJ_ScenarioVelocity} [velocity] velocity
 * will override duration with a calculated duration based on
 * the `start`, `target` and `velocity`. If `null` is used
 * then `duration` will not be overriden. Any scenario velocity elements that
 * are undefined will default to 1 (`null`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 * @property {number} [zeroDurationThreshold] value considered 0 to stop
 * animation - this is useful when numbers get very small and rounding problems
 * with javascripts floating point implementation arise
 * @property {OBJ_TranslationPath} [path] translation path style and options
 * (`{ style: 'linear' }`)
 * @property {0 | 1 | -1 | 2} [rotDirection] where `0` is quickest direction,
 * `1` is positive of CCW direction, `-1` is negative of CW direction and `2` is
 * whichever direction doesn't pass through angle 0.
 * @property {'0to360' | '-180to180' | null} [clipRotationTo]
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 * (`'easeinout'`)
 */
export type OBJ_ScenariosAnimationStep = {
  target?: string;
  velocity?: OBJ_ScenarioVelocity;
  maxDuration?: number,
  zeroDurationThreshold?: number,
  allDurationsSame?: boolean,
  path?: OBJ_TranslationPath,
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  progression: 'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression;
} & OBJ_ElementAnimationStep;

/**
 * Scenario Animation Step
 *
 * ![](./apiassets/scenario_animation.gif)
 *
 * A scenario defines an element's transform and color and can be used to make
 * code more readable and reusable.
 *
 * By default, the scenario will start with the element's current transform and
 * color.
 *
 * @extends ElementAnimationStep
 * @param {OBJ_ScenarioAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // NOTE - use these scenario definitions for all examples below
 * p.scenarios['center'] = { position: [0, 0], scale: [1, 1], color: [1, 0, 0, 1] };
 * p.scenarios['right'] = { position: [1, 0], scale: [2, 1], color: [0, 0, 1, 1] };
 * p.scenarios['bottom'] = { position: [0, -0.5], scale: [0.5, 1], color: [0, 0.5, 0, 1] };
 *
 * @example
 * // Using duration
 * p.animations.new()
 *   .scenario({ target: 'right', duration: 2 })
 *   .scenario({ target: 'bottom', duration: 2 })
 *   .scenario({ target: 'center', duration: 2 })
 *   .start();
 *
 * @example
 * // Using velocity
 * p.animations.new()
 *   .scenario({
 *     target: 'right',
 *     velocity: { position: 0.5, scale: 0.2 },
 *   })
 *   .scenario({ target: 'bottom', velocity: { position: 0.5 } })
 *   .scenario({ target: 'center', velocity: { color: 0.2 } })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.scenario({
 *   target: 'right',
 *   duration: 2,
 * });
 * const step2 = new Fig.Animation.ScenarioAnimationStep({
 *   element: p,
 *   target: 'bottom',
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export default class ScenarioAnimationStep extends ParallelAnimationStep {
  element: ?FigureElement;
  scenario: {
    start: ?(string | OBJ_Scenario);  // null means use element props when unit is started
    target: ?(string | OBJ_Scenario);
    rotDirection: 0 | 1 | -1 | 2;
    path: OBJ_TranslationPath;
    velocity: ?OBJ_ScenarioVelocity;
    maxDuration: ?number;
    allDurationsSame: boolean;
    zeroDurationThreshold: number;
    clipRotationTo: '0to360' | '-180to180' | null;
    progression: 'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression;
    // minDuration: number;
  };

  /**
   * @hideconstructor
   */
  constructor(...optionsIn: Array<OBJ_ScenarioAnimationStep>) {
    const AnimationStepOptionsIn =
      joinObjects({}, { type: 'scenario' }, ...optionsIn);
    deleteKeys(AnimationStepOptionsIn, [
      'start', 'target', 'path',
      'velocity', 'maxDuration', 'allDurationsSame', 'rotDirection',
      'clipRotationTo', 'element', 'progression', // 'minDuration',
    ]);
    super(AnimationStepOptionsIn);
    this._stepType = 'position';

    const defaultScenarioOptions = {
      element: null,
      start: null,
      target: null,
      path: {
        style: 'linear',
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'positive',
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
      const pathOptions = this.element.animations.options.translation;
      joinObjects(defaultScenarioOptions.path, pathOptions);
    }
    const options = joinObjects({}, defaultScenarioOptions, ...optionsIn);
    this.element = options.element;

    // $FlowFixMe
    this.scenario = {};
    copyKeysFromTo(options, this.scenario, [
      'start', 'target', 'path',
      'velocity', 'maxDuration', 'allDurationsSame', 'zeroDurationThreshold',
      'rotDirection', 'clipRotationTo', 'progression', // 'minDuration',
    ]);
    if (this.scenario.velocity != null && AnimationStepOptionsIn.duration == null) {
      this.duration = 0;
    } else if (AnimationStepOptionsIn.duration == null) {
      this.duration = 1;
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'scenario',
      'element',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'scenarioAnimationStep';
  }

  // _fromState(state: Object, getElement: ?(string) => FigureElement) {
  //   // const obj = new this.constructor();
  //   joinObjects(this, state);
  //   if (this.element != null && typeof this.element === 'string' && getElement != null) {
  //     this.element = getElement(this.element);
  //   }
  //   return this;
  // }

  // _state(options: Object) {
  //   const state = super._state(options);
  //   if (this.element != null) {
  //     state.state.element = {
  //       f1Type: 'de',
  //       state: this.element.getPath(),
  //     };
  //   }
  //   // if (this.element != null) {
  //   //   definition.state.element = this.element.getPath();
  //   // }
  //   return state;
  // }

  getDuration(
    start: { transform?: Transform, color?: TypeColor, isShown?: boolean, opacity?: number },
    target: { transform?: Transform, color?: TypeColor, isShown?: boolean },
  ) {
    const { element } = this;
    const { velocity } = this.scenario;
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
    if (element == null) { // $FlowFixMe
      throw new Error(`Missing Element in scenario animation - null element for target: ${this.scenario.target}`);
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
    const steps = [];
    if (target.transform != null) {
      steps.push(element.animations.transform({
        delay: this.startDelay,
        start: start.transform,
        target: target.transform,
        duration: transformDuration,
        rotDirection: this.scenario.rotDirection,
        path: this.scenario.path,
        clipRotationTo: this.scenario.clipRotationTo,
        progression: this.scenario.progression,
      }));
    }

    if (target.color != null) {
      steps.push(element.animations.color({
        delay: this.startDelay,
        start: start.color,
        target: target.color,
        duration: colorDuration,
        progression: this.scenario.progression,
      }));
    }

    if (dissolve != null) {
      steps.push(element.animations.opacity({
        delay: this.startDelay,
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
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
