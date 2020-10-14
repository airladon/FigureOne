// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from '../Element';
// import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
// import type {
//   OBJ_PositionAnimationStep, TypeParallelAnimationStepInputOptions,
//   OBJ_AnimationStep, TypeTriggerStepInputOptions,
//   OBJ_ColorAnimationStep, TypeCustomAnimationStepInputOptions,
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
// import type Diagram from '../Diagram';

export type TypeAnimationManagerInputOptions = {
  element?: DiagramElement;
  finishedCallback?: ?(string | (() => void)),
};

/* eslint-disable max-len */
/**
 * @class
 * Animation Manager
 *
 * This class manages animations and creates animation steps for use in
 * animations.
 *
 * @property {Array<AnimationStep>} animations list of animations running
 * or about to start
 * @method {(OBJ_RotationAnimationStep) => RotationAnimationStep} rotation
 * @property {(OBJ_ScaleAnimationStep) => anim.ScaleAnimationStep} scale
 * @property {(TypeTriggerStepInputOptions) => TriggerStep} trigger
 * @property {(OBJ_AnimationStep) => anim.DelayAnimationStep} delay
 * @property {(OBJ_PositionAnimationStep) => anim.PositionAnimationStep} translation
 * @property {(OBJ_PositionAnimationStep) => anim.PositionAnimationStep} position
 * @property {(OBJ_ColorAnimationStep) => anim.ColorAnimationStep} color
 * @property {(OBJ_OpacityAnimationStep) => anim.OpacityAnimationStep} opacity
 * @property {(OBJ_TransformAnimationStep) =>  anim.TransformAnimationStep} transform
 * @property {(TypePulseTransformAnimationStepInputOptions) => anim.PulseTransformAnimationStep} pulseTransform
 * @property {(TypePulseAnimationStepInputOptions) => anim.PulseAnimationStep} pulse
 * @property {(OBJ_OpacityAnimationStep = {}) => anim.DissolveInAnimationStep} dissolveIn
 * @property {(number | OBJ_OpacityAnimationStep) => anim.DissolveOutAnimationStep} dissolveOut
 * @property {(number | OBJ_ColorAnimationStep) => anim.DimAnimationStep} dim
 * @property {(number | OBJ_ColorAnimationStep) => anim.UndimAnimationStep} undim
 * @property {(TypeAnimationBuilderInputOptions) => new anim.AnimationBuilder} builder
 * @property {(OBJ_ScenarioAnimationStepInputOptions) => anim.ScenarioAnimationStep} scenario
 * @property {(TypeParallelAnimationStepInputOptions) => anim.ParallelAnimationStep} scenarios
 *
 * @see {@link DiagramElement}
 * @example
 * //index.js
 * const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});
 *
 * diagram.addElement({
 *   name: 'p', method: 'polygon', options: { fill: true, radius: 0.2 },
 * });
 * diagram.initialize();
 *
 * // element to animate
 * const p = diagram.getElement('p');
 * p.animations.new()
 *   .position({ target: [0.5, 0], duration: 2 })
 *   .rotation({ target: Math.PI, duration: 2 })
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
   * Rotation animation step tied to this element
   * @param {OBJ_RotationAnimationStep} options
   * @return {RotationAnimationStep}
   */
  rotation(...options: Array<OBJ_RotationAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.RotationAnimationStep(optionsToUse);
  }

  /**
   * Scale animation step tied to this element
   * @param {OBJ_ScaleAnimationStep} options
   * @return {ScaleAnimationStep}
   */
  scale(...options: Array<OBJ_ScaleAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ScaleAnimationStep(optionsToUse);
  }

  /**
   * Trigger animation step
   * @param {TypeTriggerStepInputOptions} options
   * @return {TriggerStep}
   */
  // eslint-disable-next-line class-methods-use-this
  trigger(...options: Array<TypeTriggerStepInputOptions>) {
    const optionsToUse = joinObjects({}, ...options);
    return new anim.TriggerStep(optionsToUse);
  }

  /**
   * Delay animation step
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
   * Translation or Position animation step tied to this element
   * @param {OBJ_PositionAnimationStep} options
   * @return {PositionAnimationStep}
   */
  translation(...options: Array<OBJ_PositionAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PositionAnimationStep(optionsToUse);
  }

  /**
   * Translation or Position animation step tied to this element
   * @param {OBJ_PositionAnimationStep} options
   * @return {PositionAnimationStep}
   */
  position(...options: Array<OBJ_PositionAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.PositionAnimationStep(optionsToUse);
  }

  /**
   * Color animation step tied to this element
   * @param {OBJ_ColorAnimationStep} options
   * @return {ColorAnimationStep}
   */
  color(...options: Array<OBJ_ColorAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ColorAnimationStep(optionsToUse);
  }

  /**
   * Color animation step tied to this element
   * @param {OBJ_OpacityAnimationStep} options
   * @return {OpacityAnimationStep}
   */
  opacity(...options: Array<OBJ_OpacityAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.OpacityAnimationStep(optionsToUse);
  }

  /**
   * Transform animation step tied to this element
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
   * Dissolve in animation step
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
   * Dissolve out animation step
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
   * Dim color animation step
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
   * Undim color animation step
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

  // eslint-disable-next-line max-len
  builder(...options: Array<TypeAnimationBuilderInputOptions>) {
    return new anim.AnimationBuilder(this, ...options);
  }

  /**
   * Transform animation step tied to this element
   * @param {OBJ_ScenarioAnimationStep} options
   * @return {ScenarioAnimationStep}
   */
  scenario(...options: Array<OBJ_ScenarioAnimationStepInputOptions>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    return new anim.ScenarioAnimationStep(optionsToUse);
  }

  // eslint-disable-next-line max-len
  scenarios(...options: Array<TypeParallelAnimationStepInputOptions & OBJ_TransformAnimationStep>) {
    const defaultOptions = {};
    const optionsToUse = joinObjects({}, defaultOptions, ...options);
    const elements = this.getAllElementsWithScenario(optionsToUse.target);
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
  getFrameTime(frame: 'next' | 'prev' | 'now' | 'sync') {
    new GlobalAnimation().getWhen(frame);
  }

  start(optionsIn: {
    name?: string,
    frame?: 'next' | 'prev' | 'now' | 'syncNow',
  }) {
    const options = joinObjects({}, optionsIn, { name: null, frame: 'next' });
    const { name, frame } = options;
    const frameTime = this.getFrameTime(frame);
    if (name == null) {
      this.startAll(frame);
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

  startAll(optionsIn: { frame?: 'next' | 'prev' | 'now' }) {
    const options = joinObjects({}, optionsIn, { frame: 'next' });
    const { frame } = options;
    const frameTime = this.getFrameTime(frame);
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

  /**
   * New animation builder
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
