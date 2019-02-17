// @flow

import {
  Transform,
  Rotation, getDeltaAngle, getMaxTimeFromVelocity,
} from '../tools/g2';
import * as tools from '../tools/math';
import type { pathOptionsType } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from './Element';

export AnimationPhaseBase {

  start() {

  }

  finish() {

  }
  
}

// Planned Animation
export class AnimationPhase {
  targetTransform: Transform;            // The target transform to animate to

  // animation time or velocity.
  // If velocity=0, it is disregarded.
  // Time for all transform operations will be equal to the time of the longest
  // operation.
  timeOrVelocity: number | Transform;
  time: number ;                         // animation time
  rotDirection: 0 | 1 | -1 | 2;               // Direction of rotation
  animationStyle: (number, ?boolean) => number; // Animation style
  animationPath: (number) => number;
  translationStyle: 'linear' | 'curved';
  translationOptions: pathOptionsType;

  startTime: number;                 // Time when phase started
  startTransform: Transform | null;       // Transform at start of phase
  deltaTransform: Transform;       // Transform delta from start to target

  callback: ?(boolean) => void;
  finishOnCancel: boolean;

  constructor(
    startTransform: Transform | null = null,
    targetTransform: Transform = new Transform(),
    timeOrVelocity: number | Transform = 1,
    rotDirection: 0 | 1 | -1 | 2 = 0,
    callback: ?(boolean) => void = null,
    finishOnCancel: boolean = true,
    animationStyle: (number, ?boolean) => number = tools.easeinout,
    translationStyle: 'linear' | 'curved' = 'linear',
    translationOptions: pathOptionsType = {
      rot: 1,
      magnitude: 0.5,
      offset: 0.5,
      controlPoint: null,
      direction: '',
    },
  ) {
    if (startTransform == null) {
      this.startTransform = null;
    } else {
      this.startTransform = startTransform._dup();
    }
    this.targetTransform = targetTransform._dup();
    this.timeOrVelocity = timeOrVelocity;
    this.rotDirection = rotDirection;
    this.animationStyle = animationStyle;
    this.translationStyle = translationStyle;
    this.translationOptions = translationOptions;
    this.callback = callback;
    this.finishOnCancel = finishOnCancel;

    this.startTime = -1;
    // this.startTransform = new Transform();
    this.deltaTransform = new Transform();
  }

  _dup() {
    const c = new AnimationPhase(
      this.startTransform,
      this.targetTransform,
      this.timeOrVelocity,
      this.rotDirection,
      this.callback,
      this.finishOnCancel,
      this.animationStyle,
      this.translationStyle,
      Object.assign({}, this.translationOptions),
    );
    c.startTime = this.startTime;
    // this.startTransform = this.startTransform._dup();
    c.deltaTransform = this.deltaTransform._dup();
    return c;
  }

  start(currentTransform: Transform) {
    if (this.startTransform == null) {
      this.startTransform = currentTransform._dup();
    }
    const { startTransform } = this;
    if (startTransform != null) {
      this.deltaTransform = this.targetTransform.sub(startTransform);
      let time = 0;
      if (typeof this.timeOrVelocity === 'number') {
        time = this.timeOrVelocity;
      } else {
        time = getMaxTimeFromVelocity(
          startTransform,
          this.targetTransform,
          this.timeOrVelocity,
          this.rotDirection,
        );
      }
      if (time === 0) {
        this.time = 1;
      } else {
        this.time = time;
      }
      this.deltaTransform.order.forEach((delta, index) => {
        const start = startTransform.order[index];
        const target = this.targetTransform.order[index];
        if (delta instanceof Rotation
          && start instanceof Rotation
          && target instanceof Rotation) {
          const rotDiff = getDeltaAngle(start.r, target.r, this.rotDirection);
          // eslint-disable-next-line no-param-reassign
          delta.r = rotDiff;
        }
      });

      this.startTime = -1;
    }
  }

  finish(
    // eslint-disable-next-line no-use-before-define
    element: DiagramElement,
    cancelled: boolean = false,
    forceSetToEnd: ?boolean = null,
  ) {
    // console.log('finished', this.callback)
    const setToEnd = () => {
      element.setTransform(this.targetTransform);
    };
    if (forceSetToEnd === null) {
      if (!cancelled || this.finishOnCancel) {
        setToEnd();
      }
    }
    if (forceSetToEnd === true) {
      setToEnd();
    }
    if (this.callback != null) {
      this.callback(cancelled);
    }
  }
}

// Planned Animation
export class ColorAnimationPhase {
  targetColor: Array<number>;         // The target transform to animate to
  time: number;                       // animation time
  animationStyle: (number) => number; // Animation style

  startTime: number;                 // Time when phase started
  startColor: Array<number> | null;
  deltaColor: Array<number>;
  disolve: 'in' | 'out' | null;
  finishOnCancel: boolean;
  // callbackOnCancel: boolean;

  callback: ?(boolean) => void;
  endColor: Array<number>;

  constructor(
    startColor: Array<number> | null = null,
    targetColor: Array<number> = [0, 0, 0, 1],
    time: number = 1,
    disolve: 'in' | 'out' | null = null,
    callback: ?(boolean) => void = null,
    finishOnCancel: boolean = true,
    // callbackOnCancel: boolean = true,
    animationStyle: (number, ?boolean) => number = tools.linear,
  ) {
    this.targetColor = targetColor.slice();
    this.endColor = targetColor.slice();
    if (disolve === 'out') {
      this.targetColor[3] = 0.01;
    }
    this.time = time;
    this.animationStyle = animationStyle;
    this.disolve = disolve;
    this.finishOnCancel = finishOnCancel;
    // this.callbackOnCancel = callbackOnCancel;

    this.startTime = -1;
    this.startColor = startColor;
    this.deltaColor = [0, 0, 0, 1];
    this.callback = callback;
  }

  _dup() {
    const c = new ColorAnimationPhase(
      this.startColor,
      this.targetColor,
      this.time,
      this.disolve,
      this.callback,
      this.finishOnCancel,
      // this.callbackOnCancel,
      this.animationStyle,
    );
    c.startTime = this.startTime;
    // this.startColor = this.startColor.slice();
    c.deltaColor = this.deltaColor.slice();
    return c;
  }

  // eslint-disable-next-line no-use-before-define
  start(element: DiagramElement) {
    if (this.startColor == null) {
      this.startColor = element.color.slice();
    }
    const { startColor } = this;
    if (startColor != null) {
      if (this.disolve === 'in') {
        this.startColor[3] = 0.01;
        element.setColor(startColor.slice());
        element.showAll();
      }
      this.deltaColor = this.targetColor.map((c, index) => c - startColor[index]);
    }
    this.startTime = -1;
  }

  finish(
    // eslint-disable-next-line no-use-before-define
    element: DiagramElement,
    cancelled: boolean = false,
    forceSetToEnd: ?boolean = null,
  ) {
    const setToEnd = () => {
      element.setColor(this.endColor);
      if (this.disolve === 'out') {
        element.hide();
      }
    };
    if (forceSetToEnd === null) {
      if (!cancelled || this.finishOnCancel) {
        setToEnd();
      }
    }
    if (forceSetToEnd === true) {
      setToEnd();
    }
    if (this.callback != null) {
      this.callback(cancelled);
    }
  }
}

// Planned Animation
export class CustomAnimationPhase {
  time: number;                       // animation time
  startTime: number;                 // Time when phase started
  plannedStartTime: number;
  animationCallback: (number) => void;
  animationStyle: (number, ?boolean) => number;
  callback: ?(boolean) => void;
  finishOnCancel: boolean;
  startPercent: number;

  constructor(
    animationCallback: (number) => void,
    time: number = 1,
    startPercent: number = 0,
    callback: ?(boolean) => void = null,
    finishOnCancel: boolean = true,
    animationStyle: (number, ?boolean) => number = tools.easeinout,
  ) {
    this.time = time;
    this.startPercent = startPercent;
    this.animationCallback = animationCallback;
    this.startTime = -1;
    this.animationStyle = animationStyle;
    this.plannedStartTime = animationStyle(startPercent, true) * time;
    this.callback = callback;
    this.finishOnCancel = finishOnCancel;
  }

  _dup() {
    const c = new CustomAnimationPhase(
      this.animationCallback,
      this.time,
      this.startPercent,
      this.callback,
      this.finishOnCancel,
      this.animationStyle,
    );
    c.startTime = this.startTime;
    return c;
  }

  start() {
    // this.startColor = currentColor.slice();
    // this.deltaColor = this.targetColor.map((c, index) => c - this.startColor[index]);
    this.startTime = -1;
  }

  finish(
    // eslint-disable-next-line no-use-before-define
    cancelled: boolean = false,
    forceSetToEnd: ?boolean = null,
  ) {
    const setToEnd = () => {
      this.animationCallback(1);
    };
    if (forceSetToEnd === null) {
      if (!cancelled || this.finishOnCancel) {
        setToEnd();
      }
    }
    if (forceSetToEnd === true) {
      setToEnd();
    }
    if (this.callback != null) {
      this.callback(cancelled);
    }
  }
}
