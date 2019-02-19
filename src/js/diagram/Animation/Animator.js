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
import { joinObjects } from '../../tools/tools';

export type TypeAnimatorInputOptions = {
  element: DiagramElement;
} & TypeSerialAnimationStepInputOptions;

export default class Animator extends animation.SerialAnimationStep {
  element: DiagramElement;

  constructor(optionsIn: TypeAnimatorInputOptions) {
    super(optionsIn);
    const defaultOptions = {};
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    return this;
  }

  moveTo(optionsIn: TypePositionAnimationStepInputOptions) {
    const defaultOptions = { element: this.element };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.then(new animation.PositionAnimationStep(options));
    return this;
  }

  inParallel(optionsIn: TypeParallelAnimationStepInputOptions) {
    this.then(new animation.ParallelAnimationStep(optionsIn));
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
}
