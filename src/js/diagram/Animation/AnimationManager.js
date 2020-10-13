// @flow
// import * as tools from '../../tools/math';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from '../Element';
// import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
// import type {
//   TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
//   TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
//   TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
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
 * Animation Manager
 *
 * This class manages animations attached to a {@link DiagramElement}.
 *
 * @property {Array<AnimationStep>} animations list of animations running
 * or about to start
 * @property {(OBJ_RotationAnimationStep) => anim.RotationAnimationStep(options)} rotation
 * @property {(TypeScaleAnimationStepInputOptions) => anim.ScaleAnimationStep} scale
 * @property {(TypeTriggerStepInputOptions) => TriggerStep} trigger
 * @property {(TypeDelayStepInputOptions) => anim.DelayStep} delay
 * @property {(TypePositionAnimationStepInputOptions) => anim.PositionAnimationStep} translation
 * @property {(TypePositionAnimationStepInputOptions) => anim.PositionAnimationStep} position
 * @property {(TypeColorAnimationStepInputOptions) => anim.ColorAnimationStep} color
 * @property {(TypeOpacityAnimationStepInputOptions) => anim.OpacityAnimationStep} opacity
 * @property {(TypeTransformAnimationStepInputOptions) =>  anim.TransformAnimationStep} transform
 * @property {(TypePulseTransformAnimationStepInputOptions) => anim.PulseTransformAnimationStep} pulseTransform
 * @property {(TypePulseAnimationStepInputOptions) => anim.PulseAnimationStep} pulse
 * @property {(TypeOpacityAnimationStepInputOptions = {}) => anim.DissolveInAnimationStep} dissolveIn
 * @property {(number | TypeOpacityAnimationStepInputOptions) => anim.DissolveOutAnimationStep} dissolveOut
 * @property {(number | TypeColorAnimationStepInputOptions) => anim.DimAnimationStep} dim
 * @property {(number | TypeColorAnimationStepInputOptions) => anim.UndimAnimationStep} undim
 * @property {(TypeAnimationBuilderInputOptions) => new anim.AnimationBuilder} builder
 * @property {(ScenarioDefinitionAnimationStepInputOptions) => anim.ScenarioAnimationStep} scenario
 * @property {(TypeParallelAnimationStepInputOptions) => anim.ParallelAnimationStep} scenarios
 *
 * @see {@link DiagramElement}
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
    this.setupAnimationSteps();
    return this;
  }

  setupAnimationSteps() {
    this.rotation = (...optionsIn: Array<OBJ_RotationAnimationStep>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.RotationAnimationStep(options);
    };
    this.scale = (...optionsIn: Array<TypeScaleAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.ScaleAnimationStep(options);
    };
    this.trigger = (...optionsIn: Array<TypeTriggerStepInputOptions>) => {
      const options = joinObjects({}, ...optionsIn);
      return new anim.TriggerStep(options);
    };
    this.delay = (...optionsIn: Array<TypeDelayStepInputOptions>) => {
      const options = joinObjects({}, ...optionsIn);
      return new anim.DelayStep(options);
    };
    this.translation = (...optionsIn: Array<TypePositionAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.PositionAnimationStep(options);
    };
    this.position = (...optionsIn: Array<TypePositionAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.PositionAnimationStep(options);
    };
    this.color = (...optionsIn: Array<TypeColorAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.ColorAnimationStep(options);
    };
    this.opacity = (...optionsIn: Array<TypeOpacityAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.OpacityAnimationStep(options);
    };
    this.transform = (...optionsIn: Array<TypeTransformAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.TransformAnimationStep(options);
    };
    this.pulseTransform = (...optionsIn: Array<TypePulseTransformAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.PulseTransformAnimationStep(options);
    };
    this.pulse = (...optionsIn: Array<TypePulseAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.PulseAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.dissolveIn = (timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {}, ...args: Array<TypeOpacityAnimationStepInputOptions>) => {
      const defaultOptions = { element: this.element };
      let options;
      if (typeof timeOrOptionsIn === 'number') {
        options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
      } else {
        options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
      }
      return new anim.DissolveInAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.dissolveOut = (timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {}, ...args: Array<TypeOpacityAnimationStepInputOptions>) => {
      const defaultOptions = { element: this.element };
      let options;
      if (typeof timeOrOptionsIn === 'number') {
        options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
      } else {
        options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
      }
      return new anim.DissolveOutAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.dim = (timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {}, ...args: Array<TypeColorAnimationStepInputOptions>) => {
      const defaultOptions = { element: this.element };
      let options;
      if (typeof timeOrOptionsIn === 'number') {
        options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
      } else {
        options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
      }
      return new anim.DimAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.undim = (timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {}, ...args: Array<TypeColorAnimationStepInputOptions>) => {
      const defaultOptions = { element: this.element };
      let options;
      if (typeof timeOrOptionsIn === 'number') {
        options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
      } else {
        options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
      }
      return new anim.UndimAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.builder = (...optionsIn: Array<TypeAnimationBuilderInputOptions>) => new anim.AnimationBuilder(this, ...optionsIn);
    this.scenario = (...optionsIn: Array<ScenarioDefinitionAnimationStepInputOptions>) => {
      const options = joinObjects({}, { element: this.element }, ...optionsIn);
      return new anim.ScenarioAnimationStep(options);
    };
    // eslint-disable-next-line max-len
    this.scenarios = (...optionsIn: Array<TypeParallelAnimationStepInputOptions & TypeTransformAnimationStepInputOptions>) => {
      const defaultOptions = {};
      const options = joinObjects({}, defaultOptions, ...optionsIn);
      const elements = this.getAllElementsWithScenario(options.target);
      const steps = [];
      const simpleOptions = {};
      duplicateFromTo(options, simpleOptions, ['steps', 'element']);
      elements.forEach((element) => {
        steps.push(element.anim.scenario(simpleOptions));
      });
      return new anim.ParallelAnimationStep(simpleOptions, { steps });
    };
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

  new(nameOrStep: ?string) {
    const options = {};
    if (this.element != null) {
      options.element = this.element;
    }
    if (nameOrStep != null) {
      options.name = nameOrStep;
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
