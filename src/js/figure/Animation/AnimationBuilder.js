// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { FigureElement } from '../Element';
import type { OBJ_Scenario } from '../Element';
import type { OBJ_SerialAnimationStep } from './AnimationStep/SerialAnimationStep';
import type {
  OBJ_PositionAnimationStep, OBJ_ParallelAnimationStep,
  OBJ_AnimationStep, OBJ_TriggerAnimationStep,
  OBJ_ColorAnimationStep, OBJ_CustomAnimationStep,
  OBJ_TransformAnimationStep,
  OBJ_RotationAnimationStep, OBJ_ScaleAnimationStep,
  OBJ_PulseAnimationStep, OBJ_OpacityAnimationStep,
  OBJ_PulseTransformAnimationStep,
  AnimationStep, OBJ_ScenarioAnimationStep, OBJ_ElementAnimationStep,
  OBJ_ScenariosAnimationStep,
} from './Animation';
import type { TypeParsablePoint, TypeParsableTransform } from '../../tools/g2';
// eslint-disable-next-line import/no-cycle
import * as animation from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';
import type { TypeColor } from '../../tools/types';

/**
 * Animation builder options object
 * @extends OBJ_SerialAnimationStep
 * @property {FigureElement} [element]
 */
export type OBJ_AnimationBuilder = {
  element?: FigureElement;
  customSteps?: Array<{
    step: (Object) => AnimationStep,
    name: string,
  }>;
} & OBJ_SerialAnimationStep;

/**
 * Animation Builder
 *
 * Convenient way to build animation steps in serial. Each step returns the
 * same builder object, and so chaining in a fluent like API can be achieved.
 *
 * @extends SerialAnimationStep
 * @see <a href="#animationmanagernew">AnimationManager.new</a>
 *
 * @example
 * p.animations.new()
 *   .delay(1)
 *   .position({ target: [1, 0], duration: 2 })
 *   .delay(1)
 *   .rotation({ target: Math.PI, duration: 2 })
 *   .start();
 */
export default class AnimationBuilder extends animation.SerialAnimationStep {
  element: ?FigureElement;

  /**
   * @hideconstructor
   */
  constructor(
    elementOrOptions: FigureElement | OBJ_AnimationBuilder = {},
    ...options: Array<OBJ_AnimationBuilder>
  ) {
    const defaultOptions = {
      customSteps: [],
    };
    let optionsToUse;
    if (elementOrOptions instanceof FigureElement) {
      optionsToUse = joinObjects({}, defaultOptions, ...options);
      optionsToUse.element = elementOrOptions;
    } else {
      optionsToUse = joinObjects({}, defaultOptions, elementOrOptions, ...options);
    }
    super(optionsToUse);
    this.element = optionsToUse.element;
    this._stepType = 'builder';
    optionsToUse.customSteps.forEach((customStep) => {  // $FlowFixMe
      this[customStep.name] = (...optionsIn) => {
        const defOptions = { element: this.element };
        const o = joinObjects({}, defOptions, ...optionsIn);
        this.then(customStep.step(o));
        return this;
      };
    });
    return this;
  }

  fnExec(idOrFn: string | Function | null, ...args: any) {
    if (this.element != null) {
      return this.fnMap.execOnMaps(
        idOrFn, [this.element.fnMap.map], ...args,
      );
    }
    return this.fnMap.exec(idOrFn, ...args);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'element',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'animationBuilder';
  }

  /**
   * Add a custom animation step that uses this element by default
   * @param {OBJ_CustomAnimationStep} options
   * @return {AnimationBuilder}
   */
  custom(...optionsIn: Array<OBJ_CustomAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element, timeKeeper: this.timeKeeper };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.CustomAnimationStep(options));
      // this.addStep(options, 'CustomAnimationStep', true);
    } else {
      this.then(new animation.CustomAnimationStep(...optionsIn));
    }
    return this;
  }

  /**
   * Add a rotation animation step that uses this element by default
   * @param {OBJ_RotationAnimationStep | number} targetOrOptions
   * @return {AnimationBuilder}
   */
  rotation(targetOrOptions: OBJ_RotationAnimationStep | number) {
    return this.addStep('rotation', targetOrOptions);
  }


  /**
   * Add a position animation step that uses this element by default
   * @param {TypeParsablePoint | OBJ_PositionAnimationStep | number} targetOrOptionsOrX
   * @param {number} y define if `targetOrOptionsOrX` is x (number)
   * @return {AnimationBuilder}
   */
  position(
    targetOrOptionsOrX: TypeParsablePoint | OBJ_PositionAnimationStep | number,
    y: number = 0,
  ) {
    return this.addStep('position', targetOrOptionsOrX, y);
  }

  /**
   * Add a translation animation step that uses this element by default
   * @param {TypeParsablePoint | OBJ_PositionAnimationStep | number} targetOrOptionsOrX
   * @param {number} y define if `targetOrOptionsOrX` is x (number)
   * @return {AnimationBuilder}
   */
  translation(
    targetOrOptionsOrX: TypeParsablePoint | OBJ_PositionAnimationStep | number,
    y: number = 0,
  ) {
    return this.position(targetOrOptionsOrX, y);
  }

  /**
   * Add a scale animation step that uses this element by default
   * @param {TypeParsablePoint | OBJ_ScaleAnimationStep | number} targetOrOptionsOrX
   * when a number is used, it will apply to both x and y if y is null
   * @param {number | null} y use a number to define the y scale, or use null
   * to use the `x` value (`null`)
   * @return {AnimationBuilder}
   */
  scale(
    targetOrOptionsOrX: TypeParsablePoint | OBJ_ScaleAnimationStep | number,
    y: null | number = null,
  ) {
    return this.addStep('scale', targetOrOptionsOrX, y);
  }

  /**
   * Add a transform animation step that uses this element by default
   * @param {OBJ_TransformAnimationStep | TypeParsableTransform} transformOrOptions
   * @return {AnimationBuilder}
   */
  transform(transformOrOptions: OBJ_TransformAnimationStep | TypeParsableTransform) {
    return this.addStep('transform', transformOrOptions);
  }

  pulseTransforms(...options: Array<OBJ_PulseTransformAnimationStep>) {
    return this.addStep('pulseTransform', ...options);
  }

  /**
   * Add a scenario animation step that uses this element by default
   * @param {OBJ_ScenarioAnimationStep | OBJ_Scenario | string} scenarioOrOptions
   * @return {AnimationBuilder}
   */
  scenario(
    scenarioOrOptions: string | OBJ_Scenario | OBJ_ScenarioAnimationStep,
  ) {
    return this.addStep('scenario', scenarioOrOptions);
  }

  /**
   * Add a scenarios animation step that uses this element by default
   * @param {string | OBJ_ScenariosAnimationStep} scenarioNameOrOptions
   * @return {AnimationBuilder}
   */
  scenarios(scenarioOrOptions: string | OBJ_ScenariosAnimationStep) {
    return this.addStep('scenarios', scenarioOrOptions);
  }

  /**
   * Add a color animation step that uses this element by default
   * @param {OBJ_ColorAnimationStep | TypeColor} colorOrOptions
   * @return {AnimationBuilder}
   */
  color(colorOrOptions: OBJ_ColorAnimationStep | TypeColor) {
    return this.addStep('color', colorOrOptions);
  }

  /**
   * Add an opacity animation step that uses this element by default
   * @param {OBJ_OpacityAnimationStep | number} opacityOrOptions
   * @return {AnimationBuilder}
   */
  opacity(opacityOrOptions: OBJ_OpacityAnimationStep | number) {
    return this.addStep('opacity', opacityOrOptions);
  }

  /**
   * Add an dissolve out animation step that uses this element by default
   * @param {number | OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dissolveOut(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
  ) {
    return this.addStep('dissolveOut', durationOrOptions);
  }

  /**
   * Add an dissolve in animation step that uses this element by default
   * @param {number | OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dissolveIn(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
  ) {
    return this.addStep('dissolveIn', durationOrOptions);
  }

  /* eslint-disable no-param-reassign */
  addStep(animName: string, ...params: Array<any>) {
    if (this.element != null) { // $FlowFixMe
      this.then(this.element.animations[animName](...params));
    }
    return this;
  }
  /* eslint-enable no-param-reassign */


  /**
   * Add an dim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep | number} durationOrOptions
   * @return {AnimationBuilder}
   */
  dim(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
  ) {
    return this.addStep('dim', durationOrOptions);
  }

  /**
   * Add an undim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep | number} durationOrOptions
   * @return {AnimationBuilder}
   */
  undim(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    // ...args: Array<OBJ_ElementAnimationStep>
  ) {
    return this.addStep('undim', durationOrOptions);
  }

  /**
   * Add a delay animation step
   * @param {OBJ_AnimationStep | number} delayOrOptions
   * @return {AnimationBuilder}
   */
  delay(
    delayOrOptions: number | OBJ_AnimationStep = {},
  ) {
    let optionsToUse;
    if (typeof delayOrOptions === 'number') {
      optionsToUse = joinObjects(
        {}, { timeKeeper: this.timeKeeper }, { duration: delayOrOptions },
      );
    } else {
      optionsToUse = joinObjects(
        {}, { timeKeeper: this.timeKeeper }, delayOrOptions,
      );
    }
    this.then(animation.delay(optionsToUse));
    return this;
  }

  /**
   * Add a trigger animation step
   * @param {OBJ_TriggerAnimationStep | function(): void | string} callbackOrOptions
   * callback can be a function or an id to a function map
   * @return {AnimationBuilder}
   */
  trigger(
    callbackOrOptions: (() => void) | string | OBJ_TriggerAnimationStep,
  ) {
    let optionsIn;
    if (
      typeof callbackOrOptions === 'function'
      || typeof callbackOrOptions === 'string'
    ) {
      optionsIn = { callback: callbackOrOptions };
    } else {
      optionsIn = callbackOrOptions;
    }
    const optionsToUse = joinObjects(
      {}, { element: this.element, timeKeeper: this.timeKeeper }, optionsIn,
    );
    this.then(animation.trigger(optionsToUse));
    return this;
  }

  /**
   * Add a parallel animation step
   * @param {Array<AnimationStep | null> | OBJ_ParallelAnimationStep} stepsOrOptions
   * @return {AnimationBuilder}
   */
  inParallel(
    stepsOrOptions: Array<animation.AnimationStep | null>
                      | OBJ_ParallelAnimationStep = {},
    ...options: Array<OBJ_ParallelAnimationStep>
  ) {
    this.then(animation.inParallel(stepsOrOptions, { timeKeeper: this.timeKeeper }, ...options));
    return this;
  }

  /**
   * Add a serial animation step
   * @param {Array<AnimationStep | null> | OBJ_SerialAnimationStep} stepsOrOptions
   * @return {AnimationBuilder}
   */
  inSerial(
    stepsOrOptions: Array<animation.AnimationStep> | OBJ_SerialAnimationStep = {},
    ...options: Array<OBJ_SerialAnimationStep>
  ) {
    this.then(animation.inSerial(stepsOrOptions, { timeKeeper: this.timeKeeper }, ...options));
    return this;
  }

  /**
   * Add a pulse animation step
   * @param {OBJ_PulseAnimationStep | number} scaleOrOptions pulse scale
   * (number) or pulse animation step options
   * @return {PulseAnimationStep}
   */
  pulse(scaleOrOptions: OBJ_PulseAnimationStep | number) {
    return this.addStep('pulse', scaleOrOptions);
  }

  reset() {
    this.steps = [];
    this.state = 'idle';
  }

  _dup() {
    const newBuilder = new AnimationBuilder();
    duplicateFromTo(this, newBuilder, ['element']);
    duplicateFromTo(this, newBuilder, ['element', 'timeKeeper']);
    newBuilder.timeKeeper = this.timeKeeper;
    newBuilder.element = this.element;
    return newBuilder;
  }
}
