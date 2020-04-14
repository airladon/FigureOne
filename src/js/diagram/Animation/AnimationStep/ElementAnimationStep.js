// @flow
import * as tools from '../../../tools/math';
// import { DiagramElement } from '../../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';

export type TypeElementAnimationStepInputOptions = {
  element?: Object; // Can't use DiagramElement as importing it makes a loop
  type?: 'transform' | 'color' | 'custom' | 'position' | 'rotation' | 'scale';
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number; // default is easeinout except color and custom which is linear
} & TypeAnimationStepInputOptions;

export default class ElementAnimationStep extends AnimationStep {
  element: ?Object;
  type: 'transform' | 'color' | 'custom' | 'position' | 'setPosition';
  duration: number;
  progression: (number) => number;

  constructor(optionsIn: TypeElementAnimationStepInputOptions = {}) {
    super(optionsIn);
    let defaultProgression = 'easeinout';
    if (optionsIn.type === 'color' || optionsIn.type === 'custom') {
      defaultProgression = 'linear';
    }
    const defaultOptions = {
      element: null,
      type: 'custom',
      progression: defaultProgression,
      duration: 0,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    this.type = options.type;
    this.onFinish = options.onFinish;
    this.duration = options.duration;
    this.progression = options.progression;
    // if (options.progression === 'linear') {
    //   this.progression = tools.linear;
    // } else if (options.progression === 'easein') {
    //   this.progression = tools.easein;
    // } else if (options.progression === 'easeout') {
    //   this.progression = tools.easeout;
    // } else if (options.progression === 'easeinout') {
    //   this.progression = tools.easeinout;
    // } else {
    //   this.progression = options.progression;
    // }
  }

  getPercentComplete(percentTime: number) {
    if (typeof this.progression === 'function') {
      return (this.progression(percentTime));
    }
    if (this.progression === 'linear') {
      return tools.linear(percentTime);
    }
    if (this.progression === 'easein') {
      return tools.easein(percentTime);
    }
    if (this.progression === 'easeout') {
      return tools.easeout(percentTime);
    }
    return tools.easeinout(percentTime);
  }

  _dup() {
    const step = new ElementAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
