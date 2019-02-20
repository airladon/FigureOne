// @flow
// import * as tools from '../../tools/math';
import { DiagramElement } from '../Element';
import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
import type {
  TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
  TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
  TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
} from './Animation';
// import PositionAnimationStep from './AnimationStep/ElementAnimationStep/PositionAnimationStep';
// import SerialAnimationStep from './AnimationStep/SerialAnimationStep';
import * as animation from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';

export type TypeAnimatorInputOptions = {
  element?: DiagramElement;
} & TypeSerialAnimationStepInputOptions;

export default class Animator extends animation.SerialAnimationStep {
  element: ?DiagramElement;

  constructor(
    elementOrOptionsIn: DiagramElement | TypeAnimatorInputOptions = {},
    ...optionsIn: Array<TypeAnimatorInputOptions>
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
    return this;
  }

  custom(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
    this.then(new animation.CustomAnimationStep(...optionsIn));
    return this;
  }

  moveTo(optionsIn: TypePositionAnimationStepInputOptions) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, optionsIn);
      this.then(new animation.PositionAnimationStep(options));
    }
    return this;
  }

  move(optionsIn: TypePositionAnimationStepInputOptions) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, optionsIn);
      this.then(new animation.PositionAnimationStep(options));
    }
    return this;
  }

  colorTo(...optionsIn: Array<TypeColorAnimationStepInputOptions>) {
    if (this.element != null) {
      const defaultOptions = { element: this.element };
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      this.then(new animation.ColorAnimationStep(options));
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

  // When an animator stops, it is reset
  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    super.finish(cancelled, force);
    this.steps = [];
  }

  reset() {
    this.steps = [];
    this.state = 'idle';
  }

  _dup() {
    const animator = new Animator();
    duplicateFromTo(this, animator, ['element']);
    animator.element = this.element;
    return animator;
  }
}
