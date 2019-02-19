// @flow
// import * as tools from '../../tools/math';
import { DiagramElement } from '../Element';
import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
import type {
  TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
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

  constructor(optionsIn: TypeAnimatorInputOptions = {}) {
    super(optionsIn);
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
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

  inParallel(
    stepsOrOptionsIn: Array<animation.AnimationStep> | TypeParallelAnimationStepInputOptions,
    optionsIn: TypeParallelAnimationStepInputOptions = {},
  ) {
    if (Array.isArray(stepsOrOptionsIn)) {
      const options = optionsIn;
      options.steps = stepsOrOptionsIn;
      this.then(new animation.ParallelAnimationStep(options));
    } else {
      this.then(new animation.ParallelAnimationStep(stepsOrOptionsIn));
    }
    return this;
  }

  // When an animator stops, it is reset
  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    console.log(this.completeOnCancel, cancelled)
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
