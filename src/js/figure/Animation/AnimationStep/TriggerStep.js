// @flow
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type {
  OBJ_AnimationStep,
} from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import type { AnimationStartTime } from '../AnimationManager';

/**
 * {@link TriggernAnimationStep} options object
 *
 * @extends OBJ_AnimationStep
 *
 * @property {string | function(any): number | void} callback if desired, return
 * a number from `callback` to update the duration of the trigger animation
 * step. Doing so will make any previous calculations of remaining animation
 * time incorrect. Make sure to initialize this step with a non-zero duration
 * for this to work.
 * @property {any} [payload] payload to pass to callback (`null`)
 * @property {FigureElement} element {@link FigureElement} to associate with
 * callback - if the `callback` is a string then this element's
 * {@link FunctionMap} will be searched for the corresponding function
 *
 */
export type OBJ_TriggerAnimationStep = {
  callback?: Function;      // default is element transform
  payload?: any;
  setToEnd?: string | Function
} & OBJ_AnimationStep;

/**
 * Trigger Animation Step
 *
 * ![](./apiassets/trigger_animation.gif)
 *
 * A trigger step executes a custom function
 *
 * A `delay` will delay the triggering of the custom function
 * while `duration` will pad time at the end of the trigger before
 * the animation step finishes.
 *
 * @extends AnimationStep
 * @param {OBJ_TriggerAnimationStep | function(): void} options
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple trigger
 * p.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .trigger(() => { console.log('arrived at (1, 0)') })
 *   .position({ target: [0, 0], duration: 2 })
 *   .trigger(() => { console.log('arrived at (0, 0)') })
 *   .start();
 *
 * @example
 * // Trigger with delay, duration and payload
 * const printPosition = (pos) => {
 *   console.log(`arrived at ${pos}`);
 * };
 *
 * p.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .trigger({
 *     delay: 1,
 *     callback: printPosition,
 *     payload: '(1, 0)',
 *     duration: 1,
 *   })
 *   .position({ target: [0, 0], duration: 2 })
 *   .trigger({ callback: printPosition, payload: '(0, 0)' })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.trigger({
 *   callback: () => { console.log('arrived at (1, 0)') },
 * });
 * const step2 = new Fig.Animation.TriggerAnimationStep({
 *   callback: () => { console.log('arrived at (0, 0)') },
 * });
 *
 * p.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .then(step1)
 *   .position({ target: [0, 0], duration: 2 })
 *   .then(step2)
 *   .start();
 */
export class TriggerAnimationStep extends AnimationStep {
  element: ?Object;
  callback: ?(string | Function);
  payload: ?Object;
  setToEndCallback: ?(string | Function);
  customProperties: Object;
  autoDuration: boolean;

  /**
   * @hideconstructor
   */
  constructor(
    triggerOrOptionsIn: Function | OBJ_TriggerAnimationStep = {},
    ...optionsIn: Array<OBJ_TriggerAnimationStep>
  ) {
    const defaultOptions = {
      payload: null,
      duration: 0,
      setToEnd: null,
      autoDuration: true,
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
    this.autoDuration = options.autoDuration;
    if (options.setToEnd) {
      this.setToEndCallback = options.setToEnd;
    }
    // this.setToEnd = options.setToEnd;
    this.customProperties = options.customProperties;
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

  // _fromState(state: Object, getElement: ?(string) => FigureElement) {
  //   joinObjects(this, state);
  //   if (this.element != null && typeof this.element === 'string' && getElement != null) {
  //     this.element = getElement(this.element);
  //   }
  //   return this;
  // }

  // _state(options: Object) {
  //   const state = super._state(options);
  //   if (this.element != null) {
  //     state.state.element = {
  //       f1Type: 'de',
  //       state: this.element.getPath(),
  //     };
  //   }
  //   return state;
  // }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'callback',
      'payload',
      'customProperties',
      'element',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'triggerAnimationStep';
  }

  setFrame() {
    // if (this.callback != null && this.payload != null) {
    //   console.log(this.payload)
    // }
    const remainingTime = this.fnExec(this.callback, this.payload, this.customProperties);
    if (remainingTime != null && typeof remainingTime === 'number' && this.autoDuration) {
      this.duration = remainingTime;
    }
    // console.log('remaining', remainingTime, this.duration, this.autoDuration)
    this.callback = null;
    // if (this.callback != null) {
    //   this.callback(this.payload);
    //   this.callback = null;
    // }
  }

  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame();
    }
  }

  setToEnd() {
    // if (this.callback != null) {
    //   this.callback(this.payload);
    //   this.callback = null;
    // }
    if (this.setToEndCallback != null) {
      this.fnExec(this.setToEndCallback, this.payload, this.customProperties);
    } else {
      this.fnExec(this.callback, this.payload, this.customProperties);
    }
    this.callback = null;
  }

  _dup() {
    const step = new TriggerAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.timeKeeper = this.timeKeeper;
    step.element = this.element;
    return step;
  }
}

export function trigger(
  triggerOrOptionsIn: Function | OBJ_TriggerAnimationStep = {},
  ...optionsIn: Array<OBJ_TriggerAnimationStep>
) {
  return new TriggerAnimationStep(triggerOrOptionsIn, ...optionsIn);
}
