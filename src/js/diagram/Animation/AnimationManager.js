// @flow
// import * as tools from '../../tools/math';
import { DiagramElement } from '../Element';
// import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
// import type {
//   TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
//   TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
//   TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
// } from './Animation';
import * as anim from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';

export type TypeAnimationManagerInputOptions = {
  element?: DiagramElement;
};

export default class AnimationManager {
  element: ?DiagramElement;
  animations: Array<anim.AnimationStep>;
  state: 'animating' | 'idle';
  options: {
    translation: {
      style: 'curve' | 'linear',
      rot: number,
      magnitude: number,
      offset: number,
      controlPoint: number | null,
      direction: '' | 'up' | 'down' | 'left' | 'right',
    }
  }

  constructor(
    elementOrOptionsIn: DiagramElement | TypeAnimationManagerInputOptions = {},
    ...optionsIn: Array<TypeAnimationManagerInputOptions>
  ) {
    const defaultOptions = {};
    let options;
    if (elementOrOptionsIn instanceof DiagramElement) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.element = elementOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, elementOrOptionsIn, ...optionsIn);
    }
    this.element = options.element;
    this.animations = [];
    this.state = 'idle';
    this.options = {};
    return this;
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

  nextFrame(now: number) {
    // console.log('animation manager', now)
    const animationsToRemove = [];
    let remaining = -1;
    let isAnimating = false;
    this.animations.forEach((animation, index) => {
      let animationIsAnimating = false;
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        const stepRemaining = animation.nextFrame(now);
        if (remaining === -1) {
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
    if (isAnimating) {
      this.state = 'animating';
    } else {
      this.state = 'idle';
    }
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    // if (initialState !== 'animating' && this.state === 'animating') {
    //   if (this.element != null) {
    //     this.element.unrender();
    //   }
    // }
    return remaining;
  }

  cleanAnimations() {
    const animationsToRemove = [];
    let isAnimating = false;
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.state === 'finished' && animation.removeOnFinish) {
        animationsToRemove.push(i);
      } else {
        isAnimating = true;
      }
    }
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    if (isAnimating) {
      this.state = 'animating';
    } else {
      this.state = 'idle';
    }
  }

  // Cancel all primary animations with the name
  // animations will be cleaned up on next frame
  cancel(name: ?string, force: ?'complete' | 'noComplete' = null) {
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

  cancelAll(force: ?'complete' | 'noComplete' = null) {
    for (let i = 0; i < this.animations.length; i += 1) {
      this.animations[i].cancel(force);
    }
    this.cleanAnimations();
  }

  start(name?: string) {
    if (name == null) {
      this.startAll();
    } else {
      for (let i = 0; i < this.animations.length; i += 1) {
        const animation = this.animations[i];
        if (animation.name === name) {
          if (animation.state !== 'animating') {
            animation.start();
            this.state = 'animating';
          }
        }
      }
    }
  }

  startAll() {
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.state !== 'animating') {
        animation.start();
        this.state = 'animating';
      }
    }
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

  new(nameOrStep: ?string | anim.AnimationStep) {
    if (typeof nameOrStep === 'string' || nameOrStep == null) {
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
    if (nameOrStep != null) {
      this.animations.push(nameOrStep);
    }
    return nameOrStep;
  }

  _dup() {
    const newManager = new AnimationManager();
    duplicateFromTo(this, newManager, ['element']);
    newManager.element = this.element;
    return newManager;
  }
}
