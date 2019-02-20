// @flow
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type {
  TypeAnimationStepInputOptions,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';

export type TypeTriggerStepInputOptions = {
  trigger?: Function;      // default is element transform
} & TypeAnimationStepInputOptions;

export class TriggerStep extends AnimationStep {
  trigger: ?Function;

  constructor(
    triggerOrOptionsIn: Function | TypeTriggerStepInputOptions = {},
    ...optionsIn: Array<TypeTriggerStepInputOptions>
  ) {
    const defaultOptions = {};
    let options;
    if (typeof triggerOrOptionsIn === 'function') {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.trigger = triggerOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, triggerOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.trigger = options.trigger;
    this.duration = 0;
  }

  setFrame() {
    if (this.trigger != null) {
      this.trigger(this.startTime);
    }
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
