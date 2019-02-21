// @flow
// import * as tools from '../../tools/math';
import { DiagramElement } from '../Element';
// import type { TypeSerialAnimationStepInputOptions } from './AnimationStep/SerialAnimationStep';
// import type {
//   TypePositionAnimationStepInputOptions, TypeParallelAnimationStepInputOptions,
//   TypeDelayStepInputOptions, TypeTriggerStepInputOptions,
//   TypeColorAnimationStepInputOptions, TypeCustomAnimationStepInputOptions,
// } from './Animation';
import * as animation from './Animation';
import { joinObjects, duplicateFromTo } from '../../tools/tools';

export type TypeAnimationManagerInputOptions = {
  element?: DiagramElement;
};

export default class AnimationManager {
  element: ?DiagramElement;
  sequences: Array<animation.AnimationStep>;

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
    this.sequences = [];
    return this;
  }

  nextFrame(now: number) {
    const sequencesToRemove = [];
    let remaining = -1;
    this.sequences.forEach((sequence, index) => {
      if (sequence.state === 'waitingToStart' || sequence.state === 'animating') {
        const stepRemaining = sequence.nextFrame(now);
        if (remaining === -1) {
          remaining = stepRemaining;
        }
        if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
      }
      if (sequence.state === 'finished' && sequence.removeOnFinish) {
        sequencesToRemove.push(index);
      }
    });
    for (let i = sequencesToRemove.length - 1; i >= 0; i -= 1) {
      this.sequences.splice(sequencesToRemove[i], 1);
    }
    return remaining;
  }

  // Cancel all primary sequences with the name
  // Sequences will be cleaned up on next frame
  cancel(name: string, force: ?'complete' | 'noComplete' = null) {
    for (let i = 0; i < this.sequences.length; i += 1) {
      const sequence = this.sequences[i];
      if (sequence.name === name) {
        sequence.cancel(force);
      }
    }
  }

  cancelAll(force: ?'complete' | 'noComplete' = null) {
    for (let i = 0; i < this.sequences.length; i += 1) {
      this.sequences[i].cancel(force);
    }
  }

  // Cancel all primary sequences with the name
  // Sequences will be cleaned up on next frame
  start(name: string) {
    for (let i = 0; i < this.sequences.length; i += 1) {
      const sequence = this.sequences[i];
      if (sequence.name === name) {
        sequence.start();
      }
    }
  }

  new(nameOrStep: ?string | animation.AnimationStep) {
    if (typeof nameOrStep === 'string' || nameOrStep == null) {
      const options = {};
      if (this.element != null) {
        options.element = this.element;
      }
      if (nameOrStep != null) {
        options.name = nameOrStep;
      }
      const sequence = new animation.AnimationBuilder(options);
      this.sequences.push(sequence);
      return sequence;
    }
    if (nameOrStep != null) {
      this.sequences.push(nameOrStep);
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
