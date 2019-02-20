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
  constructor(
    numOrOptionsIn: number | TypeDelayStepInputOptions = {},
    ...args: Array<TypeDelayStepInputOptions>
  ) {
    let options = {};
    const defaultOptions = { duration: 0 };
    if (typeof numOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: numOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, numOrOptionsIn, ...args);
    }
    super(options);
    this.duration = options.duration;
  }

  _dup() {
    const delay = new DelayStep();
    duplicateFromTo(this, delay);
    return delay;
  }
}
