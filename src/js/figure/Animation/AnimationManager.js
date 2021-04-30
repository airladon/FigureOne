// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { FigureElement } from '../Element';
// import type { OBJ_SerialAnimationStep } from './AnimationStep/SerialAnimationStep';
// import type {
//   OBJ_PositionAnimationStep, OBJ_ParallelAnimationStep,
//   OBJ_AnimationStep, OBJ_TriggerAnimationStep,
//   OBJ_ColorAnimationStep, OBJ_CustomAnimationStep,
// } from './Animation';
// eslint-disable-next-line import/no-cycle
import * as anim from './Animation';
import type {
  AnimationStep, OBJ_AnimationBuilder, OBJ_AnimationStep,
  OBJ_RotationAnimationStep, OBJ_ScaleAnimationStep, OBJ_TriggerAnimationStep,
  OBJ_PositionAnimationStep, OBJ_ColorAnimationStep, OBJ_OpacityAnimationStep,
  OBJ_TransformAnimationStep, OBJ_PulseTransformAnimationStep,
  OBJ_PulseAnimationStep, OBJ_ElementAnimationStep,
  OBJ_ScenarioAnimationStep, OBJ_ParallelAnimationStep,
} from './Animation';
// eslint-disable-next-line import/no-cycle
// import {
//   AnimationStep,
// } from './Animation';
import GlobalAnimation from '../webgl/GlobalAnimation';
import {
  joinObjects, duplicateFromTo, SubscriptionManager, PerformanceTimer,
} from '../../tools/tools';
import { getState } from '../Recorder/state';
import { FunctionMap } from '../../tools/FunctionMap';
import type { TypeWhen } from '../webgl/GlobalAnimation';
// import type { OBJ_AnimationStep } from './AnimationStep';
import type { TypeParsablePoint } from '../../tools/g2';
// import type Figure from '../Figure';

const FIGURE1DEBUG = false;

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
  element?: FigureElement;
  finishedCallback?: ?(string | (() => void)),
};

/* eslint-disable max-len */
/**
 * Animation Manager
 *
 * This class manages animations and creates animation steps for use in
 * animations.
 *
 * Each {@link FigureElement} has its own `AnimationManager` in the
 * `animations` property, though any
 * animation manager can animate any other element. Therefore all parallel
 * animations can go through the same manager, or be spread throughout
 * different element's animation managers. Spread animations out between
 * elements, or keeping them all in one `AnimationManager` can change how
 * readable code is, how convenient it is to cancel running animations, and
 * what order the animations are performed in (`AnimationManager`s tied
 * to elements drawn earlier will perform their animation steps before those
 * tied to elements drawn later). `AnimationManager`s will only be processed
 * on each animation frame if the element they are tied to is not hidden.
 *
 * The `animations` property within `AnimationManager` is simply an array that
 * contains a number {@link AnimationStep}s that are executed in parallel.
 * Typically, these steps would themselves be {@link SerialAnimationStep}s or a
 * series of animations. This means the animation manager is running a number of
 * animation series in parallel.
 *
 *
 * The `AnimationManager`s on {@link FigureElement}s should be used instead
 * of instantiating this class separately, as those on `FigureElements` will
 * be automatically processed every animation frame.
 *
 * @param
 * @property {'animating' | 'idle' | 'waitingToStart'} state
 * @property {Array<AnimationStep>} animations
 * @property {SubscriptionManager} subscriptions
 * @see {@link FigureElement}
 * @see {@link AnimationBuilder}
 * @example
 * // At its heart the `AnimationManager` is just executing
 * // an array of animation steps.
 *
 * // Create animation steps
 * const position = new Fig.Animation.PositionAnimationStep({
 *   element: p,
 *   target: [1, 0],
 *   duration: 2,
 * });
 * const rotation = new Fig.Animation.RotationAnimationStep({
 *   element: p,
 *   target: Math.PI,
 *   duration: 2,
 * });
 *
 * // Combine the animations into a SerialAnimationStep
 * const series = new Fig.Animation.SerialAnimationStep([
 *   position,
 *   rotation,
 * ]);
 *
 * // Add the animations to the animation manager and start
 * p.animations.animations.push(series);
 * p.animations.start();
 *
 * @example
 * // Using the `new` method in `AnimationManager` creates a convenient
 * // `AnimationBuilder` which extends a `SerialAnimationStep` by using
 * // a fluent API pattern
 * //
 * // Create animation steps
 * const position = new Fig.Animation.PositionAnimationStep({
 *   element: p,
 *   target: [1, 0],
 *   duration: 2,
 * });
 * const rotation = new Fig.Animation.RotationAnimationStep({
 *   element: p,
 *   target: Math.PI,
 *   duration: 2,
 * });
 *
 * // Build and start the animation
 * p.animations.new()
 *   .then(position)
 *   .then(rotation)
 *   .start();
 *
 * @example
 * // `AnimationStep`s can also be created from the `AnimationManager`
 * // with the added convenience that the `FigureElement` that
 * // has the `AnimationManager` will be used as the default
 * // `element` property. This combined with the `AnimationBuilder`
 * // makes defining most animations clean and readable code
 *
 * // Build and start the animation
 * p.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .rotation({ target: Math.PI, duration: 2 })
 *   .start();
 *
 * @example
 * // Parallel animations however still need to use explicit animation steps.
 * // Creating the steps from the `AnimationManager` means the `element` doesn't
 * // need to be defined.
 * //
 * p.animations.new()
 *   .inParallel([
 *     p.animations.position({ target: [1, 0], duration: 2 }),
 *     p.animations.rotation({ target: Math.PI, duration: 2 })
 *   ])
 *   .start();
 */
export default class AnimationManager {
  element: ?FigureElement;
  animations: Array<anim.AnimationStep>;
  state: 'animating' | 'idle' | 'waitingToStart';
  fnMap: FunctionMap;
  finishedCallback: ?(string | (() => void));
  subscriptions: SubscriptionManager;
  options: {
    translation?: {
      style: 'curve' | 'linear',
      angle: number,
      magnitude: number,
      offset: number,
      controlPoint: TypeParsablePoint | null,
      direction: 'positive' | 'negative' | 'up' | 'down' | 'left' | 'right',
    },
  };

  animationSpeed: number;

  customSteps: Array<{
    step: (Object) => AnimationStep,
    name: string,
  }>;

  /* eslint-enable max-len */

  /**
   * @hideconstructor
   */
  constructor(
    elementOrOptionsIn: FigureElement | TypeAnimationManagerInputOptions = {},
    ...optionsIn: Array<TypeAnimationManagerInputOptions>
  ) {
    const defaultOptions = {
      finishedCallback: null,
    };
    let options;
    if (elementOrOptionsIn instanceof FigureElement) {
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
    this.customSteps = [];
    this.animationSpeed = 1;
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
    const options = {
      customSteps: this.customSteps,
    };
    if (this.element != null) { // $FlowFixMe
      options.element = this.element;
    }
    if (name != null) { // $FlowFixMe
      options.name = name;
    }
    const animation = new anim.AnimationBuilder(options);
    this.animations.push(animation);
    if (this.element != null) {
      this.element.animateNextFrame();
    }
    return animation;
  }

  /**
   * Set time speed of animation relative to real time, where 1 is real time,
   * <1 is slower than real time and >1 is faster than real time.
   *
   * @param {number} speed
   */
  setTimeSpeed(speed: number = 1) {
    this.animations.forEach((animation) => {
      animation.setTimeSpeed(
        this.animationSpeed,
        speed,
        new GlobalAnimation().now() / 1000,
      );
    });
    this.animationSpeed = speed;
  }

  /**
   * Animation builder object
   * @param {OBJ_AnimationBuilder} options
   * @return {AnimationBuilder}
   */
  // eslint-disable-next-line max-len
  builder(...options: Array<OBJ_AnimationBuilder>) {  // $FlowFixMe
    return new anim.AnimationBuilder(this, {
      customSteps: this.customSteps,
    }, ...options);
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
    // return new anim.RotationAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'RotationAnimationStep');
  }

  /**
   * Create a Scale animation step tied to this element
   * @param {OBJ_ScaleAnimationStep} options
   * @return {ScaleAnimationStep}
   */
  scale(...options: Array<OBJ_ScaleAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.ScaleAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'ScaleAnimationStep');
  }

  /**
   * Create a Trigger animation step
   * @param {OBJ_TriggerAnimationStep | function(): void} options
   * @return {TriggerAnimationStep}
   */
  // eslint-disable-next-line class-methods-use-this
  trigger(options: (() => void) | Array<OBJ_TriggerAnimationStep>) {
    return new anim.TriggerAnimationStep(options);
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
    // return new anim.PositionAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'PositionAnimationStep');
  }

  /**
   * Create a Translation or Position animation step tied to this element
   * @param {OBJ_PositionAnimationStep} options
   * @return {PositionAnimationStep}
   */
  position(...options: Array<OBJ_PositionAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.PositionAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'PositionAnimationStep');
  }

  /**
   * Create a Color animation step tied to this element
   * @param {OBJ_ColorAnimationStep} options
   * @return {ColorAnimationStep}
   */
  color(...options: Array<OBJ_ColorAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.ColorAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'ColorAnimationStep');
  }

  /**
   * Create a Opacity animation step tied to this element
   * @param {OBJ_OpacityAnimationStep} options
   * @return {OpacityAnimationStep}
   */
  opacity(...options: Array<OBJ_OpacityAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.OpacityAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'OpacityAnimationStep');
  }

  /**
   * Create a Transform animation step tied to this element
   * @param {OBJ_TransformAnimationStep} options
   * @return {TransformAnimationStep}
   */
  transform(...options: Array<OBJ_TransformAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.TransformAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'TransformAnimationStep');
  }

  pulseTransform(...options: Array<OBJ_PulseTransformAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.PulseTransformAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'PulseTransformAnimationStep');
  }

  pulse(...options: Array<OBJ_PulseAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.PulseAnimationStep(optionsToUse);
    // return this.getStep(optionsToUse, 'PulseAnimationStep');

    if (typeof optionsToUse.element === 'string' && this.element != null) {
      optionsToUse.element = this.element.getElement(optionsToUse.element);
    }
    // if (options.elements != null && options.element != null) {
    //   const elements = options.element.getElements(options.elements);
    //   const steps = [];
    //   options.elements = undefined;
    //   elements.forEach((element) => {
    //     options.element = element;
    //     steps.push(new anim[animName](options));
    //   });
    //   return new anim.ParallelAnimationStep(options, { steps });
    // }
    // return new anim[animName](options);
    if (optionsToUse.centerOn) {
      return new anim.PulseAnimationStep(optionsToUse);
    }
    return this.getStep(optionsToUse, 'PulseAnimationStep');
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
    if (typeof durationOrOptions === 'number') {
      optionsToUse = joinObjects({}, defaultOptions, { duration: durationOrOptions });
    } else {
      optionsToUse = joinObjects({}, defaultOptions, durationOrOptions);
    }
    // return new anim.DissolveInAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'DissolveInAnimationStep');
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
    // return new anim.DissolveOutAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'DissolveOutAnimationStep');
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
    // return new anim.DimAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'DimAnimationStep');
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
    // return new anim.UndimAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'UndimAnimationStep');
  }

  /* eslint-disable no-param-reassign */
  getStep(options: Object, animName: string) {
    if (typeof options.element === 'string' && this.element != null) {
      options.element = this.element.getElement(options.element);
    }
    if (options.elements != null && options.element != null) {
      const elements = options.element.getElements(options.elements);
      const steps = [];
      options.elements = undefined;
      elements.forEach((element) => {
        options.element = element;
        steps.push(new anim[animName](options));
      });
      return new anim.ParallelAnimationStep(options, { steps });
    }
    return new anim[animName](options);
  }
  /* eslint-enable no-param-reassign */

  /**
   * Create a Scenario animation step tied to this element
   * @param {OBJ_ScenarioAnimationStep} options
   * @return {ScenarioAnimationStep}
   */
  scenario(...options: Array<OBJ_ScenarioAnimationStep>) {
    const optionsToUse = joinObjects({}, { element: this.element }, ...options);
    // return new anim.ScenarioAnimationStep(optionsToUse);
    return this.getStep(optionsToUse, 'ScenarioAnimationStep');
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
      'element',
    ], options);
    // if (this.element != null) {
    //   state.element = {
    //     f1Type: 'de',
    //     state: this.element.getPath(),
    //   };
    // }
    return state;
  }

  // _finishSetState(figure: Figure) {
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
  //     animationStep._finishSetState(figure);
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
  //   //   animation._finishSetState(figure);
  //   //   // }
  //   // });
  // }

  setTimeDelta(delta: ?number) {
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
    // if (window.qwer === 1 && this.animations.length > 0) {
    //   console.log('animation manager', this.element);
    // }
    let timer;
    if (FIGURE1DEBUG) { timer = new PerformanceTimer(); }
    this.animations.forEach((animation, index) => {
      let animationIsAnimating = false;
      // console.log(this.element.name, animation.state)
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        const stepRemaining = animation.nextFrame(now, this.animationSpeed);
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
    }); // $FlowFixMe
    if (FIGURE1DEBUG) { timer.stamp('animations'); }

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
    // $FlowFixMe
    if (FIGURE1DEBUG) { timer.stamp('finished'); }
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    // if (callback != null) {
    //   console.log('finished', this.element.name, callback)
    // }
    this.fnMap.exec(callback);
    if (FIGURE1DEBUG) { // $FlowFixMe
      timer.stamp('callback'); // $FlowFixMe
      const deltas = timer.deltas();
      if (window.figureOneDebug == null) {
        window.figureOneDebug = { setupDraw: [] };
      } // $FlowFixMe
      if (this.element.name === 'rootCollection') { // $FlowFixMe
        window.figureOneDebug.animationManager.push([  // $FlowFixMe
          this.element.getPath(),
          new GlobalAnimation().now(),
          deltas[0],
          deltas.slice(1),
        ]);
      }
    }
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

  /**
   * Get an animation by name.
   @param {string} name
   @return {AnimationStep | null}
   */
  get(name: string) {
    for (let i = 0; i < this.animations.length; i += 1) {
      if (this.animations[i].name === name) {
        return this.animations[i];
      }
    }
    return null;
  }

  cancelAll(how: ?'complete' | 'freeze' = null, force: boolean = false) {
    for (let i = 0; i < this.animations.length; i += 1) {
      if (force || !this.animations[i].name.startsWith('_noStop_')) {
        this.animations[i].cancel(how);
      }
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
    if (this.element != null) {
      this.element.animateNextFrame();
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
    if (this.element != null) {
      this.element.animateNextFrame();
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
  getRemainingTime(
    animationNames: Array<string> | string = [],
    now: number = new GlobalAnimation().now() / 1000,
  ) {
    let remainingTime = 0;
    let names: Array<string> = [];
    if (typeof animationNames === 'string') {
      names = [animationNames];
    } else {
      names = animationNames;
    }
    this.animations.forEach((animation) => {
      if (names.length > 0 && names.indexOf(animation.name) === -1) {
        return;
      }
      const animationRemainingTime = animation.getRemainingTime(now);
      if (animationRemainingTime > remainingTime) {
        remainingTime = animationRemainingTime;
      }
    });
    // console.log(this.element.name, remainingTime, this.animations);
    return remainingTime;
  }

  getNextAnimationFinishTime(now: number = new GlobalAnimation().now() / 1000): null | number {
    let remainingTime = null;
    this.animations.forEach((animation) => {
      const animationRemainingTime = animation.getRemainingTime(now);
      if (
        (
          animationRemainingTime != null
          && remainingTime == null
          && animationRemainingTime > 0
        )
        || (
          animationRemainingTime != null
          && remainingTime != null
          && animationRemainingTime > 0
          && animationRemainingTime < remainingTime
        )
      ) {
        remainingTime = animationRemainingTime;
      }
    });
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
