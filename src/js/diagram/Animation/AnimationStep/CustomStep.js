// @flow
// import * as tools from '../../../tools/math';
import {
  joinObjects, duplicateFromTo,
} from '../../../tools/tools';
import type {
  OBJ_AnimationStep,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import type { DiagramElement } from '../../Element';

export type TypeCustomAnimationStepInputOptions = {
  callback?: string | ((number) => void);
  startPercent?: number;
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number;
} & OBJ_AnimationStep;

export class CustomAnimationStep extends AnimationStep {
  element: ?Object;
  callback: ?(number) => void;
  startPercent: ?number;
  progression: string | ((number, ?boolean) => number);

  constructor(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
    const AnimationStepOptionsIn = joinObjects({}, ...optionsIn);
    super(AnimationStepOptionsIn);
    const defaultPositionOptions = {
      element: null,
      callback: null,
      startPercent: 0,
      progression: 'linear',
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    this.element = options.element;
    this.progression = options.progression;
    if (this.progression === 'linear') {
      this.progression = 'tools.math.linear';
    } else if (options.progression === 'easein') {
      this.progression = 'tools.math.easein';
    } else if (options.progression === 'easeout') {
      this.progression = 'tools.math.easeout';
    } else if (options.progression === 'easeinout') {
      this.progression = 'tools.math.easeinout';
    }
    this.callback = options.callback;
    this.startPercent = options.startPercent;
    // if (typeof this.progression === 'function') {
    //   this.startTimeOffset = this.progression(options.startPercent, true) * options.duration;
    // }
    this.startTimeOffset = this.getPercentComplete(options.startPercent, true) * options.duration;
    this.duration = options.duration;
  }

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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'startPercent',
      'progression',
    ];
  }

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  _state(options: Object) {
    const state = super._state(options);
    if (this.element != null) {
      state.state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    return state;
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'customAnimationStep';
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    this.fnExec(this.callback, percentComplete);
  }

  getPercentComplete(percentTime: number, invert: boolean = false) {
    if (typeof this.progression === 'string') {
      const result = this.fnExec(this.progression, percentTime, invert);
      if (result == null) {
        return 0;
      }
      return result;
    }
    if (typeof this.progression === 'function') {
      return (this.progression(percentTime));
    }
    return 0;
  }

  setToEnd() {
    this.fnExec(this.callback, 1);
  }

  _dup() {
    const step = new CustomAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function custom(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
  return new CustomAnimationStep(...optionsIn);
}

