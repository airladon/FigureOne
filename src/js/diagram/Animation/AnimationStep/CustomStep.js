// @flow
import * as tools from '../../../tools/math';
import {
  joinObjects, duplicateFromTo,
} from '../../../tools/tools';
import type {
  TypeAnimationStepInputOptions,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';

export type TypeCustomAnimationStepInputOptions = {
  callback?: (number) => void;
  startPercent?: number;
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number;
} & TypeAnimationStepInputOptions;

export class CustomAnimationStep extends AnimationStep {
  callback: ?(number) => void;
  startPercent: ?number;
  progression: (number) => number;

  constructor(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
    const AnimationStepOptionsIn = joinObjects({}, ...optionsIn);
    super(AnimationStepOptionsIn);
    const defaultPositionOptions = {
      callback: null,
      startPercent: 0,
      progression: 'linear',
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    if (options.progression === 'linear') {
      this.progression = tools.linear;
    } else if (options.progression === 'easein') {
      this.progression = tools.easein;
    } else if (options.progression === 'easeout') {
      this.progression = tools.easeout;
    } else if (options.progression === 'easeinout') {
      this.progression = tools.easeinout;
    } else {
      this.progression = options.progression;
    }
    this.callback = options.callback;
    this.startPercent = options.startPercent;
    if (typeof this.progression === 'function') {
      this.startTimeOffset = this.progression(options.startPercent, true) * options.duration;
    }
    this.duration = options.duration;
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    if (this.callback != null) {
      this.callback(percentComplete);
    }
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    const setToEnd = () => {
      if (this.callback != null) {
        this.callback(1);
      }
    };
    if (cancelled && force === 'complete') {
      setToEnd();
    }
    if (cancelled && force == null && this.completeOnCancel === true) {
      setToEnd();
    }
    if (cancelled === false) {
      setToEnd();
    }

    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
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

