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
  target?: TypeColor;     // Either target or delta must be defined
  delta?: TypeColor;      // delta overrides target if both are defined
  disolve?: 'in' | 'out' | null
} & TypeElementAnimationStepInputOptions;

const addColors = (color1, color2) => color1.map((c, index) => Math.min(c + color2[index], 1));

const subtractColors = (color1, color2) => color1.map((c, index) => Math.max(c - color2[index], 0));

export default class ColorAnimationStep extends ElementAnimationStep {
  color: {
    start: TypeColor;     // null means use element color
    delta: TypeColor;
    target: TypeColor;
    whenComplete: TypeColor;  // Color after dissolving
    disolve?: 'in' | 'out' | null;
  };

  constructor(optionsIn: TypeColorAnimationStepInputOptions = {}) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, optionsIn, { type: 'color' });
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'disolve',
    ]);
    super(ElementAnimationStepOptionsIn);

    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      disolve: null,
    };
    const options = joinObjects({}, defaultPositionOptions, optionsIn);
    // $FlowFixMe
    this.position = {};
    copyKeysFromTo(options, this.color, [
      'start', 'delta', 'target', 'translationStyle', 'translationOptions',
      'velocity',
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
      if (this.color.start == null) {
        this.color.start = element.color.slice();
      }
      if (this.color.delta == null && this.color.target == null) {
        this.color.target = this.color.start.slice();
      } else if (this.color.delta != null) {
        this.color.target = addColors(this.color.start, this.color.delta);
      }
      this.color.whenComplete = this.color.target.slice();

      if (this.color.disolve === 'out') {
        this.color.target[3] = 0.01;
      }
      if (this.color.disolve === 'in') {
        this.color.start[3] = 0.01;
        element.setColor(this.color.start);
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
    const next = this.color.start.map((c, index) => c + this.color.delta[index] * p);
    if (this.element != null) {
      this.element.setColor(next);
    }
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    const setToEnd = () => {
      const { element } = this;
      if (element != null) {
        element.setColor(this.color.whenComplete);
        if (this.color.disolve === 'out') {
          element.hide();
        }
      }
    };
    if (cancelled && force === 'complete') {
      setToEnd();
    }
    if (cancelled && force == null && this.completeOnCancel === true) {
      setToEnd();
    }
    if (cancelled === false) {
      setToEnd();
    }

    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }

  _dup() {
    const step = new ColorAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
