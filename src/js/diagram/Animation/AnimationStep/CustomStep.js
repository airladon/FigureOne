// @flow
// import * as tools from '../../../tools/math';
import {
  joinObjects, duplicateFromTo,
} from '../../../tools/tools';
import type {
  TypeAnimationStepInputOptions,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';

export type TypeCustomAnimationStepInputOptions = {
  callback?: string | ((number) => void);
  startPercent?: number;
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number;
} & TypeAnimationStepInputOptions;

export class CustomAnimationStep extends AnimationStep {
  callback: ?(number) => void;
  startPercent: ?number;
  progression: string | ((number, ?boolean) => number);

  constructor(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
    const AnimationStepOptionsIn = joinObjects({}, ...optionsIn);
    super(AnimationStepOptionsIn);
    const defaultPositionOptions = {
      callback: null,
      startPercent: 0,
      progression: 'linear',
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
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

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'startPercent',
      'progression',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'customAnimationStep';
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    if (this.callback != null) {
      if (typeof this.callback === 'string') {
        this.fnMap.exec(this.callback, percentComplete);
      } else {
        this.callback(percentComplete);
      }
    }
  }

  getPercentComplete(percentTime: number, invert: boolean = false) {
    if (typeof this.progression === 'string') {
      const result = this.fnMap.exec(this.progression, percentTime, invert);
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
    if (this.callback != null) {
      // this.callback(1);
      if (typeof this.callback === 'string') {
        this.fnMap.exec(this.callback, 1);
      } else {
        this.callback(1);
      }
    }
  }
  // finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
  //   if (this.state === 'idle') {
  //     return;
  //   }
  //   super.finish(cancelled, force);
  //   const setToEnd = () => {
  //     if (this.callback != null) {
  //       this.callback(1);
  //     }
  //   };
  //   if (cancelled && force === 'complete') {
  //     setToEnd();
  //   }
  //   if (cancelled && force == null && this.completeOnCancel === true) {
  //     setToEnd();
  //   }
  //   if (cancelled === false) {
  //     setToEnd();
  //   }

  //   if (this.onFinish != null) {
  //     this.onFinish(cancelled);
  //   }
  // }

  _dup() {
    const step = new CustomAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function custom(...optionsIn: Array<TypeCustomAnimationStepInputOptions>) {
  return new CustomAnimationStep(...optionsIn);
}

