// @flow
// import {
//   Transform, Point,
//   Rotation, getDeltaAngle, getMaxTimeFromVelocity,
// } from '../tools/g2';
// import * as tools from '../tools/math';
// import type { pathOptionsType } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
// import { FigureElement } from './Element';
import {
  joinObjects, duplicateFromTo, generateRandomString,
} from '../../tools/tools';
import * as math from '../../tools/math';
import { getState } from '../Recorder/state';
import type { FigureElement } from '../Element';
import { FunctionMap } from '../../tools/FunctionMap';
import TimeKeeper from '../TimeKeeper';
import type { AnimationStartTime } from './AnimationManager';
// import * as anim from './Animation';

/**
 * Animation Step options object
 *
 * @property {number} [duration] in seconds (`0`)
 * @property {number} [delay] delay before animation starts in seconds (`0`)
 * @property {string} [name] animation name identifier (a random string)
 * @property {null | (boolean) => void} [onFinish] called when animation is
 * finished - a `true` parameter is passed to the callback if the animation was
 * cancelled
 * @property {boolean} [removeOnFinish] `true` to remove the animation from the
 * animation manager when it is finished (`true`)
 * @property {null | boolean} [completeOnCancel] `true` to skip to end of
 * animation on cancel (`null`)
 * @property {number} [precision] precision to do calculations to (`8`)
 * @property {TimeKeepr} [timeKeeper] animations need to be tied to a time
 * reference. If this is not supplied, then the default browser time reference
 * performance.now will be used and methods with {@link TypeWhen} parameters
 * will allow only `'now'` and `'nextFrame'` and not `'lastFrame'`, `'syncNow'`.
 * When the animation step is created from an element in a figure (using
 * `element.animations` or `element.animations.new()`), then the
 * animation step will automatically inherit the figure's TimeKeeper.
 */
export type OBJ_AnimationStep = {
  onFinish?: ?(boolean) => void;
  completeOnCancel?: ?boolean;    // true: yes, false: no, null: no preference
  removeOnFinish?: boolean;
  name?: string;
  duration?: number;
  delay?: number;
  precision?: number;
  timeKeeper?: TimeKeeper | null;
};

/**
 * Animation step base class. All animation steps extend this class.
 *
 * @property {number} duration in seconds
 * @property {number} startDelay delay before animation starts in seconds
 * @property {string} name animation name identifier
 * @property {null | (boolean) => void} [onFinish] called when animation is
 * finished - a `true` parameter is passed to the callback if the animation was
 * cancelled
 * @property {null | boolean} [completeOnCancel] `true` to skip to end of
 * animation on cancel
 * @property {boolean} [removeOnFinish] `true` to remove the animation from the
 * animation manager when it is finished (`true`)
 * @property {number} [precision] precision to do calculations to (`8`)
 * @property {'animating' | 'waitingToStart' | 'idle' | 'finished'} state
 */
export default class AnimationStep {
  startTime: ?number;
  duration: number;
  // animations: Array<AnimationStep>;
  // onFinish: ?(boolean) => void;
  onFinish: ?(string | (boolean) => void);
  completeOnCancel: ?boolean;
  state: 'animating' | 'waitingToStart' | 'idle' | 'finished';
  startTimeOffset: number;
  removeOnFinish: boolean;
  name: string;
  startDelay: number;
  beforeFrame: ?(number) => void;
  afterFrame: ?(number) => void;
  _stepType: string;
  fnMap: FunctionMap;
  precision: number;
  timeKeeper: TimeKeeper | null;
  element: ?FigureElement;

  constructor(optionsIn: OBJ_AnimationStep = {}) {
    const defaultOptions = {
      onFinish: null,
      completeOnCancel: null,
      removeOnFinish: true,
      name: generateRandomString(),
      duration: 1,
      delay: 0,
      beforeFrame: null,
      afterFrame: null,
      precision: 8,
      element: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.onFinish = options.onFinish;
    this.completeOnCancel = options.completeOnCancel;
    this.duration = options.duration;
    this.element = options.element;
    this.startTime = null;
    this.state = 'idle';
    this.name = options.name;
    this.afterFrame = options.afterFrame;
    this.beforeFrame = options.beforeFrame;
    this.startDelay = options.delay;
    this.precision = options.precision;
    this.timeKeeper = null;
    if (options.timeKeeper != null) {
      this.timeKeeper = options.timeKeeper;
    }
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
    this.fnMap = new FunctionMap();
    this.fnMap.add('tools.math.easein', math.easein);
    this.fnMap.add('tools.math.easeout', math.easeout);
    this.fnMap.add('tools.math.easeinout', math.easeinout);
    this.fnMap.add('tools.math.linear', math.linear);
    this.fnMap.add('tools.math.sinusoid', math.sinusoid);
    return this;
  }


  // eslint-disable-next-line no-unused-vars
  _fromDef(definition: Object, getElement: ?(string) => FigureElement = null) {
    joinObjects(this, definition);
    return this;
  }

  fnExec(idOrFn: string | Function | null, ...args: any) {
    return this.fnMap.exec(idOrFn, ...args);
  }

  setTimeDelta(delta: ?number) {
    if (this.startTime != null && delta != null) {
      this.startTime += delta;
    }
    if (delta == null) {
      this.startTime = null;
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

  _state(options: Object) {
    return {
      f1Type: this._getStateName(),
      state: getState(this, this._getStateProperties(), options),
    };
  }


  _fromState(state: Object, getElement: ?(string) => FigureElement, timeKeeper: TimeKeeper) {
    // const obj = new this.constructor();
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    this.timeKeeper = timeKeeper;
    return this;
  }

  setTimeSpeed(oldSpeed: number, newSpeed: number, now: number) {
    if (this.startTime != null) {
      const deltaTime = (now - this.startTime) * oldSpeed;
      const newDeltaTime = deltaTime / newSpeed;
      this.startTime = now - newDeltaTime;
    }
  }

  // returns remaining time if this step completes
  // Return of 0 means this step is still going
  nextFrame(now: number, speed: number = 1) {
    if (this.startTime == null) {
      this.startTime = now - this.startTimeOffset;
    }
    const deltaTime = (now - this.startTime) * speed;
    if (this.duration == null) {
      if (this.beforeFrame) {
        this.beforeFrame(deltaTime);
      }
      this.setFrame(deltaTime);
      if (this.afterFrame) {
        this.afterFrame(deltaTime);
      }
      return;
    }
    let remainingTime = math.round(-(this.duration + this.startDelay - deltaTime), this.precision);
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

  /**
   * Get remaining duration of the animation.
   * @param {number} now define this if you want remaining duration from a
   * custom time
   */
  getRemainingTime(now: number) {
    if (this.state !== 'animating' && this.state !== 'waitingToStart') {
      return 0;
    }
    if (this.duration == null) {
      return null;
    }
    const totalDuration = this.getTotalDuration();
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      }
      return 0;
    }
    const deltaTime = now - this.startTime;
    return this.duration + this.startDelay - deltaTime;
  }

  getTotalDuration() {
    if (this.duration == null) {
      return null;
    }
    return this.duration + this.startDelay;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setFrame(deltaTime: number) {
  }

  startWaiting() {
    this.state = 'waitingToStart';
  }

  /**
   * Start animation
   * @param {AnimationStartTime} startTime
   */
  start(startTime: ?AnimationStartTime = null) {
    this.state = 'animating';
    if (typeof startTime === 'number' || startTime == null) {
      this.startTime = startTime;
      return;
    }
    if (startTime === 'nextFrame') {
      this.startTime = null;
      return;
    }
    if (this.timeKeeper != null) {
      const when = this.timeKeeper.getWhen(startTime);
      if (when != null) {
        this.startTime = when / 1000;
      } else {
        this.startTime = null;
      }
    } else if (startTime === 'nextFrame') {
      this.startTime = null;
    } else {
      this.startTime = performance.now();
    }
    // const globalAnim = new TimeKeeper();
    // this.startTime = globalAnim.getWhen(startTime) / 1000;
    // if (startTime === 'prev') {
    //   this.startTime = new TimeKeeper().lastFrame;
    // }
    // this.startTime = new TimeKeeper().now() / 1000;
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
  finish(cancelled: boolean = false, force: ?'complete' | 'freeze' = null) {
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
      this.fnExec(this.onFinish, cancelled, force);
      // this.onFinish(cancelled);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  cancelledWithNoComplete() {
  }

  cancel(force: ?'complete' | 'freeze' = null) {
    this.finish(true, force);
  }

  _dup() {
    const step = new AnimationStep();
    duplicateFromTo(this, step, ['timeKeeper', 'element']);
    step.timeKeeper = this.timeKeeper;
    step.element = this.element;
    return step;
  }

  whenFinished(callback: string | (boolean) => void) {
    this.onFinish = callback;
    return this;
  }

  ifCanceledThenComplete() {
    this.completeOnCancel = true;
    return this;
  }

  ifCancelled(then: 'complete' | 'freeze' = 'freeze') {
    if (then === 'complete') {
      this.completeOnCancel = true;
    } else {
      this.completeOnCancel = false;
    }
    return this;
  }

  ifCanceledThenStop() {
    this.completeOnCancel = false;
    return this;
  }
}
