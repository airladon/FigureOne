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
    return this;
  }

  nextFrame(now: number) {
    const animationsToRemove = [];
    let remaining = -1;
    this.animations.forEach((animation, index) => {
      if (animation.state === 'waitingToStart' || animation.state === 'animating') {
        const stepRemaining = animation.nextFrame(now);
        if (remaining === -1) {
          remaining = stepRemaining;
        }
        if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
      }
      if (animation.state === 'finished' && animation.removeOnFinish) {
        animationsToRemove.push(index);
      }
    });
    for (let i = animationsToRemove.length - 1; i >= 0; i -= 1) {
      this.animations.splice(animationsToRemove[i], 1);
    }
    return remaining;
  }

  // Cancel all primary animations with the name
  // animations will be cleaned up on next frame
  cancel(name: string, force: ?'complete' | 'noComplete' = null) {
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.name === name) {
        animation.cancel(force);
      }
    }
  }

  cancelAll(force: ?'complete' | 'noComplete' = null) {
    for (let i = 0; i < this.animations.length; i += 1) {
      this.animations[i].cancel(force);
    }
  }

  // Cancel all primary animations with the name
  // animations will be cleaned up on next frame
  start(name: string) {
    for (let i = 0; i < this.animations.length; i += 1) {
      const animation = this.animations[i];
      if (animation.name === name) {
        animation.start();
      }
    }
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
