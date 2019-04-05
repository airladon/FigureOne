// @flow
// import {
//   Transform, Point, getMaxTimeFromVelocity,
// } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

export type TypeOpacityAnimationStepInputOptions = {
  start?: number;      // default is element transform
  target?: number;     // Either target or delta must be defined
  delta?: number;      // delta overrides target if both are defined
  dissolve?: 'in' | 'out' | null
} & TypeElementAnimationStepInputOptions;


export class OpacityAnimationStep extends ElementAnimationStep {
  opacity: {
    start: number;     // null means use element color
    delta: number;
    target: number;
    whenComplete: number;  // Color after dissolving
    dissolve?: 'in' | 'out' | null;
  };

  constructor(...optionsIn: Array<TypeOpacityAnimationStepInputOptions>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, ...optionsIn, { type: 'color' });
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'dissolve',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      dissolve: null,
    };
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    // $FlowFixMe
    this.opacity = {};
    copyKeysFromTo(options, this.opacity, [
      'start', 'delta', 'target', 'dissolve',
    ]);
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime?: number) {
    const { element } = this;
    if (element != null) {
      super.start(startTime);
      if (this.opacity.start == null) {
        // eslint-disable-next-line prefer-destructuring
        this.opacity.start = element.opacity;
      }
      if (this.opacity.delta == null && this.opacity.target == null) {
        this.opacity.target = this.opacity.start;
      } else if (this.opacity.delta != null) {
        this.opacity.target = this.opacity.start + this.opacity.delta;
      }
      this.opacity.whenComplete = this.opacity.target;

      if (this.opacity.dissolve === 'out') {
        this.opacity.start = 1;
        this.opacity.target = 0.001;
        this.opacity.whenComplete = 0.001;
        element.setOpacity(this.opacity.start);
        // this.opacity.target = 0.001;
      }
      if (this.opacity.dissolve === 'in') {
        this.opacity.start = 0.001;
        this.opacity.target = 1;
        this.opacity.whenComplete = 1;
        element.showAll();
        element.setOpacity(this.opacity.start);
      }
      this.opacity.delta = this.opacity.target - this.opacity.start;
    } else {
      this.duration = 0;
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;
    let next = this.opacity.start + this.opacity.delta * p;
    if (next > 1) {
      next = 1;
    }
    if (next < 0) {
      next = 0;
    }
    if (this.element != null) {
      this.element.setOpacity(next);
    }
  }

  // cancelledWithNoComplete() {
  //   const { element } = this;
  //   console.log('cancel with no complete')
  //   if (element != null) {
  //     if (this.color.fullOpacity) {
  //       element.setColor([...element.color.slice(0, 3), 1]);
  //     }
  //   }
  // }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      // console.log(this.name, this.color.whenComplete)
      element.setOpacity(this.opacity.whenComplete);
      if (this.opacity.dissolve === 'out') {
        element.hide();
      }
    }
  }

  _dup() {
    const step = new OpacityAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}

export class DissolveInAnimationStep extends OpacityAnimationStep {
  constructor(
    timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
    ...args: Array<TypeElementAnimationStepInputOptions>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, dissolve: 'in', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dissolveIn(
  timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {},
  ...args: Array<TypeOpacityAnimationStepInputOptions>
) {
  return new DissolveInAnimationStep(timeOrOptionsIn, ...args);
}

export class DissolveOutAnimationStep extends OpacityAnimationStep {
  constructor(
    timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
    ...args: Array<TypeElementAnimationStepInputOptions>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, dissolve: 'out', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dissolveOut(
  timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {},
  ...args: Array<TypeOpacityAnimationStepInputOptions>
) {
  return new DissolveOutAnimationStep(timeOrOptionsIn, ...args);
}
