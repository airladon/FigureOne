// @flow
// import {
//   Transform, Point,
//   Rotation, getDeltaAngle, getMaxTimeFromVelocity,
// } from '../tools/g2';
// import * as tools from '../tools/math';
// import type { pathOptionsType } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
// import { DiagramElement } from './Element';
import {
  joinObjects, duplicateFromTo, generateRandomString,
} from '../../tools/tools';
import { getState } from '../state';
import type { DiagramElement } from '../Element';
// import * as anim from './Animation';

export type TypeAnimationStepInputOptions = {
  onFinish?: ?(boolean) => void;
  completeOnCancel?: ?boolean;    // true: yes, false: no, null: no preference
  removeOnFinish?: boolean;
  name?: string;
  duration?: number;
  delay?: number;
};

export default class AnimationStep {
  startTime: number;
  duration: number;
  // animations: Array<AnimationStep>;
  onFinish: ?(boolean) => void;
  completeOnCancel: ?boolean;
  state: 'animating' | 'waitingToStart' | 'idle' | 'finished';
  startTimeOffset: number;
  removeOnFinish: boolean;
  name: string;
  startDelay: number;
  beforeFrame: ?(number) => void;
  afterFrame: ?(number) => void;
  _stepType: string;

  constructor(optionsIn: TypeAnimationStepInputOptions = {}) {
    const defaultOptions = {
      onFinish: null,
      completeOnCancel: null,
      removeOnFinish: true,
      name: generateRandomString(),
      duration: 0,
      delay: 0,
      beforeFrame: null,
      afterFrame: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.onFinish = options.onFinish;
    this.completeOnCancel = options.completeOnCancel;
    this.duration = options.duration;
    this.startTime = -1;
    this.state = 'idle';
    this.name = options.name;
    this.afterFrame = options.afterFrame;
    this.beforeFrame = options.beforeFrame;
    this.startDelay = options.delay;
    // This is only for it this step is a primary path in an Animation Manager
    this.removeOnFinish = options.removeOnFinish;
    // Each animation frame will typically calculate a percent complete,
    // which is based on the duration, and from the percent complete calculate
    // the position of the current animation.
    // However, if you want to start an animation not from 0 percent, then this
    // value can be used. When startTimeOffset != 0, then the first frame
    // will be calculated at this.progression(startTimeOffset). The animation
    // will still go to 1, but will be reduced in duration by startTimeOffset.
    // When progressions aren't linear, then this time is non-trival.
    this.startTimeOffset = 0;
    return this;
  }

  // _getStateProperties(): Array<string> {  // eslint-disable-line class-methods-use-this
  //   return Object.keys(this);
  // }
  // _getState() {
  //   const keys = [];
  //   Object.keys(this).forEach((key) => {
  //     if (key !== 'element') {
  //       keys.push(key);
  //     }
  //   });
  //   console.log(keys)
  //   const state = getState(this, keys);
  //   return state;
  // }

  // eslint-disable-next-line no-unused-vars
  _fromDef(definition: Object, getElement: ?(string) => DiagramElement = null) {
    joinObjects(this, definition);
    return this;
  }

  // _finishSetState(diagram: Diagram) {
  //   if (this.element != null && typeof this.element === 'string') {
  //     const element = diagram.getElement(this.element);
  //     if (element != null) {
  //       this.element = element;
  //     }
  //   }
  //   if (this.steps != null) {
  //     for (let i = 0; i < this.steps.length; i += 1) {
  //       const animationStepState = this.steps[i];
  //       let animationStep = {};
  //       if (animationStepState._stepType === 'builder') {
  //         animationStep = new anim.AnimationBuilder();
  //       }
  //       if (animationStepState._stepType === 'position') {
  //         animationStep = new anim.PositionAnimationStep();
  //       }
  //       joinObjects(animationStep, animationStepState);
  //       animationStep._finishSetState(diagram);
  //       this.steps[i] = animationStep;
  //     }
  //   }
  // }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // _finishSetState(diagram: Diagram) {
  // }

  setTimeDelta(delta: number) {
    this.startTime += delta;
    if (this.steps != null) {
      this.steps.forEach((step) => {
        step.setTimeDelta(delta);
      });
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      'startTime',
      'duration',
      'onFinish',
      'completeOnCancel',
      'state',
      'startTimeOffset',
      'removeOnFinish',
      'name',
      'startDelay',
      'beforeFrame',
      'afterFrame',
      '_stepType',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'animationStep';
  }

  _state(precision: number = 5) {
    // console.log(this._getStateProperties())
    return {
      f1Type: this._getStateName(),
      // def: {
      //   startTime: this.startTime,
      //   duration: this.duration,
      //   onFinish: this.onFinish,
      //   completeOnCancel: this.completeOnCancel,
      //   state: this.state,
      //   startTimeOffset: this.startTimeOffset,
      //   removeOnFinish: this.removeOnFinish,
      //   name: this.name,
      //   startDelay: this.startDelay,
      //   beforeFrame: this.beforeFrame,
      //   afterFrame: this.afterFrame,
      //   _stepType: this._stepType,
      // },
      state: getState(this, this._getStateProperties(), precision),
    };
  }

  // returns remaining time if this step completes
  // Return of 0 means this step is still going
  nextFrame(now: number) {
    if (this.startTime === -1) {
      this.startTime = now - this.startTimeOffset;
    }

    const deltaTime = now - this.startTime;
    let remainingTime = -(this.duration + this.startDelay - deltaTime);
    if (deltaTime >= this.startDelay) {
      let deltaTimeAfterDelay = deltaTime - this.startDelay;
      if (deltaTimeAfterDelay >= this.duration) {
        remainingTime = deltaTimeAfterDelay - this.duration;
        deltaTimeAfterDelay = this.duration;
      }
      if (this.beforeFrame) {
        this.beforeFrame(deltaTimeAfterDelay / this.duration);
      }
      this.setFrame(deltaTimeAfterDelay);
      if (this.afterFrame) {
        this.afterFrame(deltaTimeAfterDelay / this.duration);
      }
      if (remainingTime >= 0) {
        this.finish();
      }
    }
    return remainingTime;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setFrame(deltaTime: number) {
  }

  startWaiting() {
    this.state = 'waitingToStart';
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  start(startTime: number = -1) {
    this.startTime = startTime;
    this.state = 'animating';
  }

  finishIfZeroDuration() {
    if (this.duration === 0 && this.startDelay === 0) {
      this.finish();
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setToEnd() {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    // this.startTime = -2;
    // this.onFinish(false);
    if (this.state === 'idle' || this.state === 'finished') {
      return;
    }
    const oldState = this.state;
    this.state = 'finished';
    if (cancelled) {
      if (force === 'complete') {
        if (oldState === 'waitingToStart') {
          this.start();
        }
        this.setToEnd();
      } else if (force == null && this.completeOnCancel === true) {
        if (oldState === 'waitingToStart') {
          this.start();
        }
        this.setToEnd();
      } else if (oldState === 'waitingToStart') {
        this.cancelledWithNoComplete();
      }
    }

    if (cancelled === false) {
      if (oldState === 'waitingToStart') {
        this.start();
      }
      this.setToEnd();
    }

    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  cancelledWithNoComplete() {
  }

  cancel(force: ?'complete' | 'noComplete' = null) {
    this.finish(true, force);
  }

  _dup() {
    const step = new AnimationStep();
    duplicateFromTo(this, step);
    return step;
  }

  whenFinished(callback: (boolean) => void) {
    this.onFinish = callback;
    return this;
  }

  ifCanceledThenComplete() {
    this.completeOnCancel = true;
    return this;
  }

  ifCanceledThenStop() {
    this.completeOnCancel = false;
    return this;
  }
}
