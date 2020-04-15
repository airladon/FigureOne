// @flow
// import * as tools from '../../../tools/math';
// import { DiagramElement } from '../../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type { DiagramElement } from '../../Element';

export type TypeElementAnimationStepInputOptions = {
  element?: Object; // Can't use DiagramElement as importing it makes a loop
  type?: 'transform' | 'color' | 'custom' | 'position' | 'rotation' | 'scale';
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number; // default is easeinout except color and custom which is linear
} & TypeAnimationStepInputOptions;

export default class ElementAnimationStep extends AnimationStep {
  element: ?Object;
  type: 'transform' | 'color' | 'custom' | 'position' | 'setPosition';
  duration: number;
  progression: ((number, ?boolean) => number) | string;

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
    if (this.progression === 'linear') {
      this.progression = 'tools.math.linear';
    } else if (options.progression === 'easein') {
      this.progression = 'tools.math.easein';
    } else if (options.progression === 'easeout') {
      this.progression = 'tools.math.easeout';
    } else if (options.progression === 'easeinout') {
      this.progression = 'tools.math.easeinout';
    } else {
      this.progression = options.progression;
    }
  }

  _getDefProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'element',
      'type',
      'duration',
      'progression',
    ];
  }

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    // const obj = new this.constructor();
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  _state() {
    const state = super._state();
    if (this.element != null) {
      state.state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    // if (this.element != null) {
    //   definition.state.element = this.element.getPath();
    // }
    return state;
  }

  getPercentComplete(percentTime: number) {
    if (typeof this.progression === 'string') {
      const result = this.fnMap.exec(this.progression, percentTime);
      if (result == null) {
        return 1;
      }
      return result;
    }
    if (typeof this.progression === 'function') {
      return (this.progression(percentTime));
    }
    return 1;
  }

  _dup() {
    const step = new ElementAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
