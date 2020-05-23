// @flow
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type {
  TypeAnimationStepInputOptions,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';

export type TypeTriggerStepInputOptions = {
  callback?: Function;      // default is element transform
  payload?: Object;
} & TypeAnimationStepInputOptions;

export class TriggerStep extends AnimationStep {
  element: ?Object;
  callback: ?(string | Function);
  payload: ?Object;

  constructor(
    triggerOrOptionsIn: Function | TypeTriggerStepInputOptions = {},
    ...optionsIn: Array<TypeTriggerStepInputOptions>
  ) {
    const defaultOptions = {
      payload: null,
      duration: 0,
    };
    let options;
    if (
      typeof triggerOrOptionsIn === 'function'
      || typeof triggerOrOptionsIn === 'string'
    ) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.callback = triggerOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, triggerOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.element = options.element;
    this.callback = options.callback;
    this.payload = options.payload;
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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'payload',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'triggerAnimationStep';
  }

  setFrame() {
    this.fnExec(this.callback, this.payload);
    this.callback = null;
    // if (this.callback != null) {
    //   this.callback(this.payload);
    //   this.callback = null;
    // }
  }

  setToEnd() {
    // if (this.callback != null) {
    //   this.callback(this.payload);
    //   this.callback = null;
    // }
    this.fnExec(this.callback, this.payload);
    this.callback = null;
  }

  _dup() {
    const step = new TriggerStep();
    duplicateFromTo(this, step, ['element']);
    return step;
  }
}

export function trigger(
  triggerOrOptionsIn: Function | TypeTriggerStepInputOptions = {},
  ...optionsIn: Array<TypeTriggerStepInputOptions>
) {
  return new TriggerStep(triggerOrOptionsIn, ...optionsIn);
}
