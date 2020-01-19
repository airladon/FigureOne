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

type TypeColor = Array<number>;
export type TypeColorAnimationStepInputOptions = {
  start?: TypeColor;      // default is element transform
  target?: TypeColor | 'dim' | 'undim';     // Either target or delta must be defined
  delta?: TypeColor;      // delta overrides target if both are defined
  dissolve?: 'in' | 'out' | null
} & TypeElementAnimationStepInputOptions;

const addColors = (color1, color2) => color1.map((c, index) => Math.min(c + color2[index], 1));

const subtractColors = (color1, color2) => color1.map((c, index) => c - color2[index]);

export class ColorAnimationStep extends ElementAnimationStep {
  color: {
    start: TypeColor;     // null means use element color
    delta: TypeColor;
    target: TypeColor;
    whenComplete: TypeColor;  // Color after dissolving
    dissolve?: 'in' | 'out' | null;
    setDefault?: boolean;
  };

  constructor(...optionsIn: Array<TypeColorAnimationStepInputOptions>) {
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
    this.color = {};
    copyKeysFromTo(options, this.color, [
      'start', 'delta', 'target', 'dissolve',
    ]);
    if (this.color.target === 'dim') {
      this.color.target = this.element.dimColor.slice();
      this.color.setDefault = false;
    } else if (this.color.target === 'undim') {
      this.color.target = this.element.defaultColor.slice();
      this.color.setDefault = false;
    } else {
      this.color.setDefault = true;
    }
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime?: number) {
    const { element } = this;
    if (element != null) {
      super.start(startTime);
      if (this.color.start == null) {
        this.color.start = element.color.slice();
      }
      if (this.color.delta == null && this.color.target == null) {
        this.color.target = this.color.start.slice();
      } else if (this.color.delta != null) {
        this.color.target = addColors(this.color.start, this.color.delta);
      }
      this.color.whenComplete = this.color.target.slice();

      if (this.color.dissolve === 'out') {
        this.color.target[3] = 0.001;
      }
      if (this.color.dissolve === 'in') {
        this.color.start[3] = 0.001;
        element.setColor(this.color.start, this.color.setDefault);
        element.showAll();
      }
      this.color.delta = subtractColors(this.color.target, this.color.start);
    } else {
      this.duration = 0;
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;
    const next = this.color.start.map((c, index) => {
      let newColor = c + this.color.delta[index] * p;
      if (newColor > 1) {
        newColor = 1;
      }
      if (newColor < 0) {
        newColor = 0;
      }
      return newColor;
    });
    if (this.element != null) {
      this.element.setColor(next, this.color.setDefault);
    }
  }

  setToEnd() {
    const { element } = this;
    if (element != null) {
      // console.log(this.name, this.color.whenComplete)
      element.setColor(this.color.whenComplete, this.color.setDefault);
      if (this.color.dissolve === 'out') {
        element.hide();
      }
    }
  }

  // finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
  //   if (this.state === 'idle') {
  //     return;
  //   }
  //   super.finish(cancelled, force);
  //   const setToEnd = () => {
  //     const { element } = this;
  //     if (element != null) {
  //       element.setColor(this.color.whenComplete);
  //       if (this.color.dissolve === 'out') {
  //         element.hide();
  //       }
  //     }
  //   };
  //   if (cancelled && force === 'complete') {
  //     setToEnd();
  //   }
  //   if (cancelled && force == null && this.completeOnCancel === true) {
  //     setToEnd();
  //   }
  //   if (cancelled === false) {
  //     setToEnd();
  //   }

  //   if (this.onFinish != null) {
  //     this.onFinish(cancelled);
  //   }
  // }

  _dup() {
    const step = new ColorAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}

export class DimAnimationStep extends ColorAnimationStep {
  constructor(
    timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
    ...args: Array<TypeElementAnimationStepInputOptions>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, target: 'dim', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function dim(
  timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {},
  ...args: Array<TypeOpacityAnimationStepInputOptions>
) {
  return new DimAnimationStep(timeOrOptionsIn, ...args);
}

export class UndimAnimationStep extends ColorAnimationStep {
  constructor(
    timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
    ...args: Array<TypeElementAnimationStepInputOptions>
  ) {
    let options = {};
    const defaultOptions = { duration: 1, target: 'undim', completeOnCancel: true };
    if (typeof timeOrOptionsIn === 'number') {
      options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
    } else {
      options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
    }
    super(options);
  }
}

export function undim(
  timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {},
  ...args: Array<TypeOpacityAnimationStepInputOptions>
) {
  return new UndimAnimationStep(timeOrOptionsIn, ...args);
}

// export class DissolveInAnimationStep extends ColorAnimationStep {
//   constructor(
//     timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
//     ...args: Array<TypeElementAnimationStepInputOptions>
//   ) {
//     let options = {};
//     const defaultOptions = { duration: 1, dissolve: 'in', completeOnCancel: true };
//     if (typeof timeOrOptionsIn === 'number') {
//       options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
//     } else {
//       options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
//     }
//     super(options);
//   }
// }

// export function dissolveIn(
//   timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
//   ...args: Array<TypeColorAnimationStepInputOptions>
// ) {
//   return new DissolveInAnimationStep(timeOrOptionsIn, ...args);
// }

// export class DissolveOutAnimationStep extends ColorAnimationStep {
//   constructor(
//     timeOrOptionsIn: number | TypeElementAnimationStepInputOptions = {},
//     ...args: Array<TypeElementAnimationStepInputOptions>
//   ) {
//     let options = {};
//     const defaultOptions = { duration: 1, dissolve: 'out', completeOnCancel: true };
//     if (typeof timeOrOptionsIn === 'number') {
//       options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
//     } else {
//       options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
//     }
//     super(options);
//   }
// }

// export function dissolveOut(
//   timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {},
//   ...args: Array<TypeColorAnimationStepInputOptions>
// ) {
//   return new DissolveOutAnimationStep(timeOrOptionsIn, ...args);
// }
