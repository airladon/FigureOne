// @flow
// import * as tools from '../../tools/math';
import { DiagramElement } from '../Element';
import type { TypeSerialAnimationStepInputOptions } from './SerialAnimationStep';
import type {
  TypePositionAnimationStepInputOptions,
} from './PositionAnimationStep';
import PositionAnimationStep from './PositionAnimationStep';
import SerialAnimationStep from './SerialAnimationStep';
import { joinObjects } from '../../tools/tools';

type TypeAnimatorInputOptions = {
  element: DiagramElement;
} & TypeSerialAnimationStepInputOptions;

export default class Animator extends SerialAnimationStep {
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
    this.then(new PositionAnimationStep(options));
    return this;
  }
}
