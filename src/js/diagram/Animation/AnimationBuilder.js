// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from '../Element';
import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
import type {
  TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
  TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
  TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
  TypeTransformAnimationStepInputOptions,
  TypeRotationAnimationStepInputOptions, TypeScaleAnimationStepInputOptions,
  TypePulseAnimationStepInputOptions, TypeOpacityAnimationStepInputOptions,
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

export default class AnimationBuilder extends animation.SerialAnimationStep {
  element: ?DiagramElement;

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

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    // const obj = new this.constructor();
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'animationBuilder';
  }

  _state() {
    const state = super._state();
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

  custom(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
    this.then(new animation.CustomAnimationStep(...optionsIn));
    return this;
  }

  rotation(...optionsIn: Array<TypeRotationAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.RotationAnimationStep(options));
    }
    return this;
  }

  position(...optionsIn: Array<TypePositionAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.PositionAnimationStep(options));
    }
    return this;
  }

  scale(...optionsIn: Array<TypeScaleAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.ScaleAnimationStep(options));
    }
    return this;
  }

  // moveTo(...optionsIn: Array<TypePositionAnimationStepInputOptions>) {
  //   return this.moveToPosition(...optionsIn);
  // }

  // positionTo(...optionsIn: Array<TypePositionAnimationStepInputOptions>) {
  //   return this.moveToPosition(...optionsIn);
  // }

  transform(...optionsIn: Array<TypeTransformAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.TransformAnimationStep(options));
    }
    return this;
  }

  scenario(
    ...optionsIn: Array<TypeTransformAnimationStepInputOptions & { scenario: string }>
  ) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(options.element.anim.scenario(options));
    }
    return this;
  }

  scenarios(    // eslint-disable-next-line max-len
    ...optionsIn: Array<TypeTransformAnimationStepInputOptions & TypeParallelAnimationStepInputOptions>
  ) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(options.element.anim.scenarios(options));
    }
    return this;
  }

  color(...optionsIn: Array<TypeColorAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.ColorAnimationStep(options));
    }
    return this;
  }

  opacity(...optionsIn: Array<TypeOpacityAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.OpacityAnimationStep(options));
    }
    return this;
  }

  dissolveOut(
    timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
    ...args: Array<TypeColorAnimationStepInputOptions>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    this.then(animation.dissolveOut(options));
    return this;
  }

  dissolveIn(
    timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
    ...args: Array<TypeColorAnimationStepInputOptions>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    this.then(animation.dissolveIn(options));
    return this;
  }

  dim(
    timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
    ...args: Array<TypeColorAnimationStepInputOptions>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    this.then(animation.dim(options));
    return this;
  }

  undim(
    timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
    ...args: Array<TypeColorAnimationStepInputOptions>
  ) {
    const defaultOptions = { element: this.element };
    let options;
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    this.then(animation.undim(options));
    return this;
  }

  delay(
    numOrOptionsIn: number | TypeDelayStepInputOptions = {},
    ...args: Array<TypeDelayStepInputOptions>
  ) {
    this.then(animation.delay(numOrOptionsIn, ...args));
    return this;
  }

  trigger(
    triggerOrOptionsIn: Function | TypeTriggerStepInputOptions = {},
    ...optionsIn: Array<TypeTriggerStepInputOptions>
  ) {
    this.then(animation.trigger(triggerOrOptionsIn, ...optionsIn));
    return this;
  }

  inParallel(
    stepsOrOptionsIn: Array<animation.AnimationStep> | TypeParallelAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeParallelAnimationStepInputOptions>
  ) {
    this.then(animation.inParallel(stepsOrOptionsIn, ...optionsIn));
    return this;
  }

  inSerial(
    stepsOrOptionsIn: Array<animation.AnimationStep> | TypeSerialAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeSerialAnimationStepInputOptions>
  ) {
    this.then(animation.inSerial(stepsOrOptionsIn, ...optionsIn));
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
