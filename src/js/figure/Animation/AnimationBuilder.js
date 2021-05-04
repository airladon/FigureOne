// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { FigureElement } from '../Element';
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
} from './Animation';
// eslint-disable-next-line import/no-cycle
import * as animation from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';

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
   * @param {OBJ_RotationAnimationStep} options
   * @return {AnimationBuilder}
   */
  rotation(...options: Array<OBJ_RotationAnimationStep>) {
    return this.addStep('rotation', ...options);
  }


  /**
   * Add a position animation step that uses this element by default
   * @param {OBJ_PositionAnimationStep} options
   * @return {AnimationBuilder}
   */
  position(...options: Array<OBJ_PositionAnimationStep>) {
    return this.addStep('position', ...options);
  }

  /**
   * Add a translation animation step that uses this element by default
   * @param {OBJ_PositionAnimationStep} options
   * @return {AnimationBuilder}
   */
  translation(...options: Array<OBJ_PositionAnimationStep>) {
    return this.position(...options);
  }

  /**
   * Add a scale animation step that uses this element by default
   * @param {OBJ_ScaleAnimationStep} options
   * @return {AnimationBuilder}
   */
  scale(...options: Array<OBJ_ScaleAnimationStep>) {
    return this.addStep('scale', ...options);
  }

  /**
   * Add a transform animation step that uses this element by default
   * @param {OBJ_ScaleAnimaOBJ_TransformAnimationStepionStep} options
   * @return {AnimationBuilder}
   */
  transform(...options: Array<OBJ_TransformAnimationStep>) {
    return this.addStep('transform', ...options);
  }

  pulseTransforms(...options: Array<OBJ_PulseTransformAnimationStep>) {
    return this.addStep('pulseTransform', ...options);
  }

  /**
   * Add a scenario animation step that uses this element by default
   * @param {OBJ_ScenarioAnimationStep} options
   * @return {AnimationBuilder}
   */
  scenario(
    ...options: Array<OBJ_ScenarioAnimationStep & { scenario: string }>
  ) {
    return this.addStep('scenario', ...options);
  }

  /**
   * Add a scenarios animation step that uses this element by default
   * @param {OBJ_ScenariosAnimationStep} options
   * @return {AnimationBuilder}
   */
  scenarios(    // eslint-disable-next-line max-len
    ...options: Array<OBJ_TransformAnimationStep & OBJ_ParallelAnimationStep>
  ) {
    if (this.element != null) {
      const defaultOptions = { element: this.element, timeKeeper: this.timeKeeper };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(optionsToUse.element.animations.scenarios(optionsToUse));
    }
    return this;
  }

  /**
   * Add a color animation step that uses this element by default
   * @param {OBJ_ColorAnimationStep} options
   * @return {AnimationBuilder}
   */
  color(...options: Array<OBJ_ColorAnimationStep>) {
    return this.addStep('color', ...options);
  }

  /**
   * Add an opacity animation step that uses this element by default
   * @param {OBJ_OpacityAnimationStep} options
   * @return {AnimationBuilder}
   */
  opacity(...options: Array<OBJ_OpacityAnimationStep>) {
    return this.addStep('opacity', ...options);
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
  addStep(animName: string, options: Object) {
    if (this.element != null) { // $FlowFixMe
      this.then(this.element.animations[animName](options));
    }
    return this;
  }
  /* eslint-enable no-param-reassign */


  /**
   * Add an dim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dim(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    // ...args: Array<OBJ_ElementAnimationStep>
  ) {
    return this.addStep('dim', durationOrOptions);
  }

  /**
   * Add an undim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
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
   * @param {OBJ_AnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  delay(
    delayOrOptions: number | OBJ_AnimationStep = {},
    ...args: Array<OBJ_AnimationStep>
  ) {
    this.then(animation.delay(delayOrOptions, { timeKeeper: this.timeKeeper }, ...args));
    return this;
  }

  /**
   * Add a trigger animation step
   * @param {OBJ_TriggerAnimationStep} triggerOrOptions
   * @return {AnimationBuilder}
   */
  trigger(
    triggerOrOptions: Function | OBJ_TriggerAnimationStep = {},
    ...args: Array<OBJ_TriggerAnimationStep>
  ) {
    if (this.element != null) {
      const defaultOptions = { element: this.element, timeKeeper: this.timeKeeper };
      const optionsToUse = joinObjects({}, defaultOptions, ...args);
      this.then(animation.trigger(triggerOrOptions, optionsToUse));
    } else {
      this.then(animation.trigger(triggerOrOptions, ...args));
    }
    // this.then(animation.trigger(triggerOrOptionsIn, ...optionsIn));
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

  pulse(...optionsIn: Array<OBJ_PulseAnimationStep>) {
    return this.addStep('pulse', ...optionsIn);
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
