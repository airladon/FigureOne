// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from '../Element';
// import type { OBJ_SerialAnimationStep } from './AnimationStep/SerialAnimationStep';
// import type {
//   OBJ_PositionAnimationStep, OBJ_ParallelAnimationStep,
//   OBJ_AnimationStep, OBJ_TriggerAnimationStep,
//   OBJ_ColorAnimationStep, OBJ_CustomAnimationStep,
// } from './Animation';
// eslint-disable-next-line import/no-cycle
import * as anim from './Animation';
// eslint-disable-next-line import/no-cycle
// import {
//   AnimationStep,
// } from './Animation';
import GlobalAnimation from '../webgl/GlobalAnimation';
import { joinObjects, duplicateFromTo, SubscriptionManager } from '../../tools/tools';
import { getState } from '../state';
import { FunctionMap } from '../../tools/FunctionMap';
import type { TypeWhen } from '../webgl/GlobalAnimation';
// import type Diagram from '../Diagram';

/**
 * Scenarios animation step options object
 * @extends OBJ_AnimationStep
 * @property {string} target name of scenario
 */
export type OBJ_ScenariosAnimationStep = {
  target: string;
} & OBJ_AnimationStep;

/**
 * Animation start time options.
 *
 * {@link TypeWhen} | number | null
 *
 * When multiple animations need to be started, it is often
 * desirable to synchronise their start times.
 *
 * `'nextFrame'` will start the animation on the
 * next animation frame. Starting several animations with `nextFrame`
 * will ensure they are all synchronized to that frame time.
 *
 * Similarly `'prevFrame'` starts the animation on the last animation
 * frame.
 *
 * `'syncNow'` will start an animation at a synchronized 'now' time. The
 * first time 'syncNow' is used, the current time will be stored and used
 * for all subsequent calls to 'syncNow'. 'syncNow' is reset every
 * time a new animation frame is drawn.
 *
 * Alternately, `'now'` can be used which will use the current time as
 * the animation start time. As javascript is single threaded, using `'now`
 * on multiple animations will result in them all having slightly different
 * start times.
 *
 * A custom time can be used if a `number` is defined.
 *
 * `null` will result in `'nextFrame'` being used
 * @typedef {TypeWhen | number | null} AnimationStartTime
 */
export type AnimationStartTime = TypeWhen | number | null;

/**
 * Start animation options object.
 *
 * @property {null | string} [name] name of animation to start - f null, then
 * all animations associated with this animation manager will start (`null`)
 * @property {AnimationStartTime} startTime when to
 * start the animation
 */
export type OBJ_AnimationStart = {
  name?: string,
  // startTIme?: 'nextFrame' | 'prevFrame' | 'now' | 'syncNow',
  startTime: AnimationStartTime,
};

export type TypeAnimationManagerInputOptions = {
  element?: DiagramElement;
  finishedCallback?: ?(string | (() => void)),
};

/* eslint-disable max-len */
/**
 * Animation Manager
 *
 * This class manages animations and creates animation steps for use in
 * animations.
 *
 * Animation managers are the `animations` property of a {@link DiagramElement}.
 *
 * The `animations` property is an array that contains a number of parallel
 * animation steps.
 *
 * @property {'animating' | 'idle' | 'waitingToStart'} state
 * @property {Array<AnimationStep>} animations
 * @property {SubscriptionManager} subscriptions
 * @see {@link DiagramElement}
 * @example
 * // animate a position animation step, then rotation animation step
 * p.animations.new()
 *   .then(p.animations.position({ target: [0.5, 0], duration: 2 }))
 *   .then(p.animations.rotation({ target: Math.PI, duration: 2 }))
 *   .start();
 *
 * @example
 * // simple animations can create animation steps more elegantly
 * p.animations.new()
 *   .position({ target: [0.5, 0], duration: 2 })
 *   .rotation({ target: Math.PI, duration: 2 })
 *   .start();
 *
 * @example
 * // parallel animations must use explicit animation steps
 * p.animations.new()
 *   .inParallel([
 *      p.animations.position({ target: [-0.5, 0.5], duration: 2 }),
 *      p.animations.scale({ target: 0.5, duration: 2 })
 *    ])
 *   .start();
 */
export default class AnimationManager {
  element: ?DiagramElement;
  animations: Array<anim.AnimationStep>;
  state: 'animating' | 'idle' | 'waitingToStart';
  fnMap: FunctionMap;
  finishedCallback: ?(string | (() => void));
  subscriptions: SubscriptionManager;
  options: {
    translation?: {
      style: 'curve' | 'linear',
      rot: number,
      magnitude: number,
      offset: number,
      controlPoint: number | null,
      direction: '' | 'up' | 'down' | 'left' | 'right',
    },
  };

  /* eslint-enable max-len */

  /**
   * @private
   */
  constructor(
    elementOrOptionsIn: DiagramElement | TypeAnimationManagerInputOptions = {},
    ...optionsIn: Array<TypeAnimationManagerInputOptions>
  ) {
    const defaultOptions = {
      finishedCallback: null,
    };
    let options;
    if (elementOrOptionsIn instanceof DiagramElement) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.element = elementOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, elementOrOptionsIn, ...optionsIn);
    }
    this.element = options.element;
    this.animations = [];
    this.state = 'idle';      // $FlowFixMe
    this.options = { translation: {} };
    this.fnMap = new FunctionMap();
    this.finishedCallback = options.finishedCallback;
    this.subscriptions = new SubscriptionManager();
    // this.setupAnimationSteps();
    return this;
  }

  /**
   * New animation builder attached to this animation manager
   * @return AnimationBuilder
   * @example
   * p.animations.new()
   *   .position({ target: [0.5, 0], duration: 2 })
   *   .rotation({ target: Math.PI, duration: 2 })
   *   .start();
   *
   */
  new(name: ?string) {
    const options = {};
    if (this.element != null) {
      options.element = this.element;
    }
    if (name != null) {
      options.name = name;
    }
    const animation = new anim.AnimationBuilder(options);
    this.animations.push(animation);
    return animation;
  }


  /**
   * Animation builder object
   * @param {OBJ_AnimationBuilder} options
   * @return {AnimationBuilder}
   */
  // eslint-disable-next-line max-len
  builder(...options: Array<OBJ_AnimationBuilder>) {
    return new anim.AnimationBuilder(this, ...options);
  }

  /**
   * Create a Rotation animation step that uses this element by default
   * @param {OBJ_RotationAnimationStep} options
   * @return {RotationAnimationStep}
   * @example
   * const rot = p.animations.rotation({ target: Math.PI, duration: 2 });
   * p.animations.new()
   *   .then(rot)
   *   .start();
   */
  rotation(...options: Array<OBJ_RotationAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.RotationAnimationStep(optionsToUse);
  }

  /**
   * Create a Scale animation step tied to this element
   * @param {OBJ_ScaleAnimationStep} options
   * @return {ScaleAnimationStep}
   */
  scale(...options: Array<OBJ_ScaleAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ScaleAnimationStep(optionsToUse);
  }

  /**
   * Create a Trigger animation step
   * @param {OBJ_TriggerAnimationStep} options
   * @return {TriggerAnimationStep}
   */
  // eslint-disable-next-line class-methods-use-this
  trigger(...options: Array<OBJ_TriggerAnimationStep>) {
    const optionsToUse = joinObjects({}, ...options);
    return new anim.TriggerAnimationStep(optionsToUse);
  }

  /**
   * Create a Delay animation step
   * Use the `duration` value in `options` to define delay duration
   * @param {number | OBJ_AnimationStep} delayOrOptions
   * @return {DelayAnimationStep}
   */
  // eslint-disable-next-line class-methods-use-this
  delay(
    delayOrOptions: number | OBJ_AnimationStep = {},
    // ...args: Array<OBJ_AnimationStep>
  ) {
    // let optionsToUse;
    // if (typeof delayOrOptions === 'number') {
    //   optionsToUse = joinObjects({}, { duration: delayOrOptions }, ...args);
    // } else {
    //   optionsToUse = joinObjects({}, delayOrOptions, ...args);
    // }
    return new anim.DelayAnimationStep(delayOrOptions);
  }

  /**
   * Create a Translation or Position animation step tied to this element
   * @param {OBJ_PositionAnimationStep} options
   * @return {PositionAnimationStep}
   */
  translation(...options: Array<OBJ_PositionAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PositionAnimationStep(optionsToUse);
  }

  /**
   * Create a Translation or Position animation step tied to this element
   * @param {OBJ_PositionAnimationStep} options
   * @return {PositionAnimationStep}
   */
  position(...options: Array<OBJ_PositionAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PositionAnimationStep(optionsToUse);
  }

  /**
   * Create a Color animation step tied to this element
   * @param {OBJ_ColorAnimationStep} options
   * @return {ColorAnimationStep}
   */
  color(...options: Array<OBJ_ColorAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ColorAnimationStep(optionsToUse);
  }

  /**
   * Create a Opacity animation step tied to this element
   * @param {OBJ_OpacityAnimationStep} options
   * @return {OpacityAnimationStep}
   */
  opacity(...options: Array<OBJ_OpacityAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.OpacityAnimationStep(optionsToUse);
  }

  /**
   * Create a Transform animation step tied to this element
   * @param {OBJ_TransformAnimationStep} options
   * @return {TransformAnimationStep}
   */
  transform(...options: Array<OBJ_TransformAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.TransformAnimationStep(optionsToUse);
  }

  pulseTransform(...options: Array<TypePulseTransformAnimationStepInputOptions>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PulseTransformAnimationStep(optionsToUse);
  }

  pulse(...options: Array<TypePulseAnimationStepInputOptions>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PulseAnimationStep(optionsToUse);
  }

  /**
   * Create a Dissolve in animation step
   * Use the `duration` value in `options` to define dissolving duration
   * @param {number | OBJ_ElementAnimationStep} timeOrOptions
   * @return {DissolveInAnimationStep}
   */
  dissolveIn(durationOrOptions: number | OBJ_ElementAnimationStep = {}) {
    const defaultOptions = { element: this.element };
    let optionsToUse;
    if (typeof timeorOptions === 'number') {
      optionsToUse = joinObjects({}, defaultOptions, { duration: durationOrOptions });
    } else {
      optionsToUse = joinObjects({}, defaultOptions, durationOrOptions);
    }
    return new anim.DissolveInAnimationStep(optionsToUse);
  }

  /**
   * Create a Dissolve out animation step
   * Use the `duration` value in `options` to define dissolving duration
   * @param {number | OBJ_ElementAnimationStep} durationOrOptions
   * @return {DissolveOutAnimationStep}
   */
  dissolveOut(durationOrOptions: number | OBJ_ElementAnimationStep = {}) {
    const defaultOptions = { element: this.element };
    let optionsToUse;
    if (typeof durationOrOptions === 'number') {
      optionsToUse = joinObjects({}, defaultOptions, { duration: durationOrOptions });
    } else {
      optionsToUse = joinObjects({}, defaultOptions, durationOrOptions);
    }
    return new anim.DissolveOutAnimationStep(optionsToUse);
  }

  /**
   * Create a Dim color animation step
   * Use the `duration` value in `options` to define dimming duration
   * @param {number | OBJ_ElementAnimationStep} durationOrOptions
   * @return {DimAnimationStep}
   */
  dim(durationOrOptions: number | OBJ_ElementAnimationStep = {}) {
    const defaultOptions = { element: this.element };
    let optionsToUse;
    if (typeof durationOrOptions === 'number') {
      optionsToUse = joinObjects({}, defaultOptions, { duration: durationOrOptions });
    } else {
      optionsToUse = joinObjects({}, defaultOptions, durationOrOptions);
    }
    return new anim.DimAnimationStep(optionsToUse);
  }

  /**
   * Create a Undim color animation step
   * Use the `duration` value in `options` to define undimming duration
   * @param {number | OBJ_ElementAnimationStep} durationOrOptions
   * @return {UndimAnimationStep}
   */
  undim(durationOrOptions: number | OBJ_ColorAnimationStep = {}) {
    const defaultOptions = { element: this.element };
    let optionsToUse;
    if (typeof durationOrOptions === 'number') {
      optionsToUse = joinObjects({}, defaultOptions, { duration: durationOrOptions });
    } else {
      optionsToUse = joinObjects({}, defaultOptions, durationOrOptions);
    }
    return new anim.UndimAnimationStep(optionsToUse);
  }

  /**
   * Create a Scenario animation step tied to this element
   * @param {OBJ_ScenarioAnimationStep} options
   * @return {ScenarioAnimationStep}
   */
  scenario(...options: Array<OBJ_ScenarioAnimationStepInputOptions>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ScenarioAnimationStep(optionsToUse);
  }

  /**
   * Create a Parallel animation step that animates
   * all child elements with the target scenario name
   * @param {OBJ_ScenariosAnimationStep} options
   * @return {ParallelAnimationStep}
   */
  scenarios(...options: Array<OBJ_ParallelAnimationStep & OBJ_TransformAnimationStep>) {
    const defaultOptions = { element: this.element };
    const optionsToUse = joinObjects({}, defaultOptions, ...options);
    const elements = optionsToUse.element.getAllElementsWithScenario(optionsToUse.target);
    const steps = [];
    const simpleOptions = {};
    duplicateFromTo(optionsToUse, simpleOptions, ['steps', 'element']);
    elements.forEach((element) => {
      steps.push(element.animations.scenario(simpleOptions));
    });
    return new anim.ParallelAnimationStep(simpleOptions, { steps });
  }

  _state(options: Object) {
    const state = getState(this, [
      'animations',
      'state',
      'options',
    ], options);
    if (this.element != null) {
      state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    return state;
  }

  // _finishSetState(diagram: Diagram) {
  //   for (let i = 0; i < this.animations.length; i += 1) {
  //     const animationStepState = this.animations[i];
  //     let animationStep = {};
  //     if (animationStepState._stepType === 'builder') {
  //       animationStep = new anim.AnimationBuilder();
  //     }
  //     if (animationStepState._stepType === 'position') {
  //       animationStep = new anim.PositionAnimationStep();
  //     }
  //     joinObjects(animationStep, animationStepState);
  //     animationStep._finishSetState(diagram);
  //     this.animations[i] = animationStep;
  //   }
  //   // this.animations.forEach((animation) => {
  //   //   let animationStep = {};
  //   //   if (animation.type === 'builder') {
  //   //     animationStep = new anim.AnimationBuilder();
  //   //   }
  //   //   if (animation.type === 'position') {
  //   //     animationStep = new anim.PositionAnimationStep();
  //   //   }
  //   //   joinObjects(animationStep, animation);
  //   //   animation._finishSetState(diagram);
  //   //   // }
  //   // });
  // }

  setTimeDelta(delta: number) {
    this.animations.forEach((animation) => {
      animation.setTimeDelta(delta);
    });
  }

  willStartAnimating() {
    if (this.state === 'animating') {
      return true;
    }

    let isAnimating = false;
    this.animations.forEach((animation) => {
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        isAnimating = true;
      }
    });
    return isAnimating;
  }

  isAnimating() {
    if (this.state === 'animating' || this.state === 'waitingToStart') {
      return true;
    }
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        return true;
      }
    }
    return false;
  }

  nextFrame(now: number) {
    // console.log('animation manager', now)
    // console.log(this.element.name, this.state, this.animations)
    const animationsToRemove = [];
    let remaining = null;
    let isAnimating = false;
    this.animations.forEach((animation, index) => {
      let animationIsAnimating = false;
      // console.log(this.element.name, animation.state)
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        const stepRemaining = animation.nextFrame(now);
        if (remaining === null) {
          remaining = stepRemaining;
        }
        if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
        animationIsAnimating = true;
      }
      if (animation.state === 'finished' && animation.removeOnFinish) {
        animationIsAnimating = false;
        animationsToRemove.push(index);
      }
      if (animationIsAnimating) {
        isAnimating = true;
      }
    });

    let callback = null;
    if (isAnimating) {
      this.state = 'animating';
    } else {
      if (this.state === 'animating') {
        this.state = 'idle';
        callback = this.finishedCallback;
        this.subscriptions.publish('finished');
        // this.fnMap.exec(this.finishedCallback);
      }
      this.state = 'idle';
    }
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    // if (callback != null) {
    //   console.log('finished', this.element.name, callback)
    // }
    this.fnMap.exec(callback);
    return remaining;
  }

  cleanAnimations() {
    const animationsToRemove = [];
    let isAnimating = false;
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.state === 'finished' && animation.removeOnFinish) {
        animationsToRemove.push(i);
      } else if (animation.state === 'animating' || animation.state === 'waitingToStart') {
        isAnimating = true;
      }
    }
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    if (isAnimating) {
      this.state = 'animating';
    } else {
      if (this.state === 'animating') {
        this.state = 'idle';
        // console.log('clean finished', this.element.name, this.finishedCallback)
        this.fnMap.exec(this.finishedCallback);
        this.subscriptions.publish('finished');
      }
      this.state = 'idle';
    }
  }

  // Cancel all primary animations with the name
  // animations will be cleaned up on next frame
  /**
   * Cancel one or all animations managed by this manager (in the `animations`
   * array).
   * @param {null | string} name name of animation or `null` to cancel all
   * (`null`)
   * @param {null | 'complete' | 'freeze'} force force the animation to complete
   * or freeze - `null` will perform the default operation (`null`)
   */
  cancel(name: ?string, force: ?'complete' | 'freeze' = null) {
    if (name == null) {
      this.cancelAll(force);
    } else {
      for (let i = 0; i < this.animations.length; i += 1) {
        const animation = this.animations[i];
        if (animation.name === name) {
          animation.cancel(force);
        }
      }
      this.cleanAnimations();
    }
  }

  cancelAll(force: ?'complete' | 'freeze' = null) {
    for (let i = 0; i < this.animations.length; i += 1) {
      this.animations[i].cancel(force);
    }
    this.cleanAnimations();
  }

  // eslint-disable-next-line class-methods-use-this
  getFrameTime(frame: 'nextFrame' | 'prevFrame' | 'now' | 'syncNow') {
    new GlobalAnimation().getWhen(frame);
  }

  /**
   * Start one or all animations managed by this manager (in the `animations`
   * array).
   *
   * @param {OBJ_AnimationStart} [options]
   */
  start(options: OBJ_AnimationStart) {
    const optionsToUse = joinObjects({}, options, { name: null, startTime: 'nextFrame' });
    const { name, startTime } = optionsToUse;
    const frameTime = this.getFrameTime(startTime);
    if (name == null) {
      this.startAll(startTime);
    } else {
      for (let i = 0; i < this.animations.length; i += 1) {
        const animation = this.animations[i];
        if (animation.name === name) {
          if (animation.state !== 'animating') {
            animation.start(frameTime);
            animation.finishIfZeroDuration();
            if (animation.state === 'animating') {
              this.state = 'animating';
            }
          }
        }
      }
    }
    if (this.state === 'idle') {
      this.fnMap.exec(this.finishedCallback);
      this.subscriptions.publish('finished');
    }
  }

  startAll(optionsIn: { startTime?: AnimationStartTime}) {
    const options = joinObjects({}, optionsIn, { startTime: 'nextFrame' });
    const { startTime } = options;
    const frameTime = this.getFrameTime(startTime);
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.state !== 'animating') {
        animation.start(frameTime);
        animation.finishIfZeroDuration();
        if (animation.state === 'animating') {
          this.state = 'animating';
        }
      }
    }
    if (this.state === 'idle') {
      this.fnMap.exec(this.finishedCallback);
      this.subscriptions.publish('finished');
    }
  }

  getTotalDuration() {
    let duration = 0;
    this.animations.forEach((animation) => {
      const animationDuration = animation.getTotalDuration();
      if (animationDuration > duration) {
        duration = animationDuration;
      }
    });
    return duration;
  }

  /**
   * Get remaining duration of all animations
   * @param {number} now define this if you want remaining duration from a
   * custom time
   */
  getRemainingTime(now: number = new GlobalAnimation().now() / 1000) {
    let remainingTime = 0;
    this.animations.forEach((animation) => {
      const animationRemainingTime = animation.getRemainingTime(now);
      if (animationRemainingTime > remainingTime) {
        remainingTime = animationRemainingTime;
      }
    });
    // console.log(this.element.name, remainingTime, this.animations);
    return remainingTime;
  }

  addTo(name: string) {
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.name === name) {
        return animation;
      }
    }
    return this.new(name);
  }

  newFromStep(nameOrStep: anim.AnimationStep) {
    this.animations.push(nameOrStep);
    return nameOrStep;
  }

  _dup() {
    const newManager = new AnimationManager();
    duplicateFromTo(this, newManager, ['element']);
    newManager.element = this.element;
    return newManager;
  }
}
