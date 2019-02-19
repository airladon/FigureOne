// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';


export type TypeDelayStepInputOptions = {
  duration?: number;
} & TypeAnimationStepInputOptions;

// Animations get started from a parent, but finish themselves
export default class DelayStep extends AnimationStep {
  constructor(optionsIn: TypeDelayStepInputOptions = {}) {
    super(optionsIn);
    const defaultOptions = { duration: 0 };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.duration = options.duration;
  }

  _dup() {
    const delay = new DelayStep();
    duplicateFromTo(this, delay);
    return delay;
  }
}
