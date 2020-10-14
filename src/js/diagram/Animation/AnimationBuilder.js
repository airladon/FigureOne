// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from '../Element';
import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
import type {
  OBJ_PositionAnimationStep, TypeParallelAnimationStepInputOptions,
  OBJ_AnimationStep, OBJ_TriggerAnimationStep,
  OBJ_ColorAnimationStep, OBJ_CustomAnimationStep,
  OBJ_TransformAnimationStep,
  OBJ_RotationAnimationStep, OBJ_ScaleAnimationStep,
  TypePulseAnimationStepInputOptions, OBJ_OpacityAnimationStep,
  TypePulseTransformAnimationStepInputOptions,
} from './Animation';
// import PositionAnimationStep from './AnimationStep/ElementAnimationStep/PositionAnimationStep';
// import SerialAnimationStep from './AnimationStep/SerialAnimationStep';
// eslint-disable-next-line import/no-cycle
import * as animation from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';
// import { getState, setState } from '../state';
// import type Diagram from '../Diagram';

export type TypeAnimationBuilderInputOptions = {
  element?: DiagramElement;
} & TypeSerialAnimationStepInputOptions;

/**
 * Animation Builder
 *
 * Use to build a series of animation steps. Each step will return the same
 * builder object.
 * @extends SerialAnimationStep
 * @see <a href="#animationmanagernew">AnimationManager.new</a>
 */
export default class AnimationBuilder extends animation.SerialAnimationStep {
  element: ?DiagramElement;

  /**
   * @private
   */
  constructor(
    elementOrOptionsIn: DiagramElement | TypeAnimationBuilderInputOptions = {},
    ...optionsIn: Array<TypeAnimationBuilderInputOptions>
  ) {
    const defaultOptions = {};
    let options;
    if (elementOrOptionsIn instanceof DiagramElement) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.element = elementOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, elementOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.element = options.element;
    this._stepType = 'builder';
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  // _finishSetState(diagram: Diagram) {
  //   if (this.element != null && typeof this.element === 'string') {
  //     const element = diagram.getElement(this.element);
  //     if (element != null) {
  //       this.element = element;
  //     }
  //   }
  // }

  // _getState() {
  //   const state = super._getState();

  //   // const state = getState(this, keys);
  //   if (this.element != null) {
  //     state.element = this.element.getPath();
  //   }
  //   return state;
  // }

  // fnExec(idOrFn: string | Function | null, ...args: any) {
  //   const result = this.fnMap.exec(idOrFn, ...args);
  //   if (result == null && this.element != null) {
  //     return this.element.fnMap.exec(idOrFn, ...args);
  //   }
  //   return result;
  // }
  fnExec(idOrFn: string | Function | null, ...args: any) {
    // const result = this.fnMap.exec(idOrFn, ...args);
    // if (result == null && this.element != null) {
    //   return this.element.fnMap.exec(idOrFn, ...args);
    // }
    // return result;
    if (this.element != null) {
      return this.fnMap.execOnMaps(
        idOrFn, [this.element.fnMap.map], ...args,
      );
    }
    return this.fnMap.exec(idOrFn, ...args);
  }

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    // const obj = new this.constructor();
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  // _getStateProperties() {  // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(),
  //     'steps',
  //   ];
  // }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'animationBuilder';
  }

  _state(options: Object) {
    const state = super._state(options);
    // definition.f1Type = 'animationBuilder';
    // if (this.element != null) {
    //   definition.state.element = this.element.getPath();
    // }
    if (this.element != null) {
      state.state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    // if (this.steps.length > 0) {
    //   definition.def.steps = getState()
    // }
    return state;
  }

  /**
   * Add a custom animation step that uses this element by default
   * @param {OBJ_CustomAnimationStep} options
   * @return {AnimationBuilder}
   */
  custom(...optionsIn: Array<OBJ_CustomAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.CustomAnimationStep(options));
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
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.RotationAnimationStep(optionsToUse));
    }
    return this;
  }

  /**
   * Add a position animation step that uses this element by default
   * @param {OBJ_PositionAnimationStep} options
   * @return {AnimationBuilder}
   */
  position(...options: Array<OBJ_PositionAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.PositionAnimationStep(optionsToUse));
    }
    return this;
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
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.ScaleAnimationStep(optionsToUse));
    }
    return this;
  }

  // moveTo(...optionsIn: Array<OBJ_PositionAnimationStep>) {
  //   return this.moveToPosition(...optionsIn);
  // }

  // positionTo(...optionsIn: Array<OBJ_PositionAnimationStep>) {
  //   return this.moveToPosition(...optionsIn);
  // }

  /**
   * Add a transform animation step that uses this element by default
   * @param {OBJ_ScaleAnimaOBJ_TransformAnimationStepionStep} options
   * @return {AnimationBuilder}
   */
  transform(...options: Array<OBJ_TransformAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.TransformAnimationStep(optionsToUse));
    }
    return this;
  }

  pulseTransforms(...options: Array<TypePulseTransformAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.PulseTransformAnimationStep(optionsToUse));
    }
    return this;
  }

  /**
   * Add a scenario animation step that uses this element by default
   * @param {OBJ_ScenarioAnimationStep} options
   * @return {AnimationBuilder}
   */
  scenario(
    ...options: Array<OBJ_ScenarioAnimationStep & { scenario: string }>
  ) {
    // if (this.element != null) {
    //   const defaultOptions = { element: this.element };
    //   const optionsToUse = joinObjects({}, defaultOptions, ...options);
    //   this.then(optionsToUse.element.anim.scenario(optionsToUse));
    // }
    // return this;
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.ScenarioAnimationStep(optionsToUse));
    }
    return this;
  }

  /**
   * Add a scenarios animation step that uses this element by default
   * @param {OBJ_ScenariosAnimationStep} options
   * @return {AnimationBuilder}
   */
  scenarios(    // eslint-disable-next-line max-len
    ...options: Array<OBJ_TransformAnimationStep & TypeParallelAnimationStepInputOptions>
  ) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(optionsToUse.element.anim.scenarios(optionsToUse));
    }
    return this;
  }

  /**
   * Add a color animation step that uses this element by default
   * @param {OBJ_ColorAnimationStep} options
   * @return {AnimationBuilder}
   */
  color(...options: Array<OBJ_ColorAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.ColorAnimationStep(optionsToUse));
    }
    return this;
  }

  /**
   * Add an opacity animation step that uses this element by default
   * @param {OBJ_OpacityAnimationStep} options
   * @return {AnimationBuilder}
   */
  opacity(...options: Array<OBJ_OpacityAnimationStep>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const optionsToUse = joinObjects({}, defaultOptions, ...options);
      this.then(new animation.OpacityAnimationStep(optionsToUse));
    }
    return this;
  }

  /**
   * Add an dissolve out animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dissolveOut(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof durationOrOptions === 'number') {
      options = joinObjects({}, defaultOptions, { duration: durationOrOptions }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, durationOrOptions, ...args);
    }
    this.then(animation.dissolveOut(options));
    return this;
  }

  /**
   * Add an dissolve in animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dissolveIn(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof durationOrOptions === 'number') {
      options = joinObjects({}, defaultOptions, { duration: durationOrOptions }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, durationOrOptions, ...args);
    }
    this.then(animation.dissolveIn(options));
    return this;
  }

  /**
   * Add an dim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  dim(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof durationOrOptions === 'number') {
      options = joinObjects({}, defaultOptions, { duration: durationOrOptions }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, durationOrOptions, ...args);
    }
    this.then(animation.dim(options));
    return this;
  }

  /**
   * Add an undim animation step that uses this element by default
   * @param {OBJ_ElementAnimationStep} durationOrOptions
   * @return {AnimationBuilder}
   */
  undim(
    durationOrOptions: number | OBJ_ElementAnimationStep = {},
    ...args: Array<OBJ_ElementAnimationStep>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof durationOrOptions === 'number') {
      options = joinObjects({}, defaultOptions, { duration: durationOrOptions }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, durationOrOptions, ...args);
    }
    this.then(animation.undim(options));
    return this;
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
    this.then(animation.delay(delayOrOptions, ...args));
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
      const defaultOptions = { element: this.element };
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
   * @param {Array<AnimationStep | null> | TypeParallelAnimationStepInputOptions} stepsOrOptions
   * @return {AnimationBuilder}
   */
  inParallel(
    stepsOrOptions: Array<animation.AnimationStep | null>
                      | TypeParallelAnimationStepInputOptions = {},
    ...options: Array<TypeParallelAnimationStepInputOptions>
  ) {
    this.then(animation.inParallel(stepsOrOptions, ...options));
    return this;
  }

  /**
   * Add a serial animation step
   * @param {Array<AnimationStep | null> | TypeSerialAnimationStepInputOptions} stepsOrOptions
   * @return {AnimationBuilder}
   */
  inSerial(
    stepsOrOptions: Array<animation.AnimationStep> | TypeSerialAnimationStepInputOptions = {},
    ...options: Array<TypeSerialAnimationStepInputOptions>
  ) {
    this.then(animation.inSerial(stepsOrOptions, ...options));
    return this;
  }

  pulse(...optionsIn: Array<TypePulseAnimationStepInputOptions>) {
    const defaultOptions = { element: this.element };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    this.then(new animation.PulseAnimationStep(options));
    return this;
  }

  reset() {
    this.steps = [];
    this.state = 'idle';
  }

  // whenFinished(callback: (boolean) => void) {
  //   super.whenFinished(callback);
  //   return this;
  // }

  _dup() {
    const newBuilder = new AnimationBuilder();
    duplicateFromTo(this, newBuilder, ['element']);
    newBuilder.element = this.element;
    return newBuilder;
  }
}
