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
    this.callback = options.callback;
    this.payload = options.payload;
    this.duration = options.duration;
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
    this.execFn(this.callback, this.payload);
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
    this.execFn(this.callback, this.payload);
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
