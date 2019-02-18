// @flow

import {
  Transform,
  Rotation, getDeltaAngle, getMaxTimeFromVelocity,
} from '../tools/g2';
import * as tools from '../tools/math';
import type { pathOptionsType } from '../tools/g2';
// eslint-disable-next-line import/no-cycle
import { DiagramElement } from './Element';
import { joinObjects } from '../tools/tools';

type TypeColor = [number, number, number, number];

type TypeAnimationStepInputOptions = {
  // eslint-disable-next-line no-use-before-define
  animations: AnimationStep | Array<AnimationStep>,
  onFinish: ?(boolean) => void;
  finishOnCancel: boolean;
};

export class AnimationStep {
  startTime: number;
  duration: number;
  animations: Array<AnimationStep>;
  onFinish: ?(boolean) => void;
  finishOnCancel: boolean;

  constructor(optionsIn: TypeAnimationStepInputOptions) {
    const defaultOptions = {
      onFinish: null,
      finishOnCancel: true,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (!Array.isArray(options.animations)) {
      this.duration = options.animations.duration;
      this.animations = [options.animations];
    } else {
      this.animations = options.animations;
    }
    // this.calcDuration();
    // this.animations = options.animations;
    this.onFinish = options.onFinish;
    // this.onCancel = options.onCancel;
    this.finishOnCancel = options.finishOnCancel;
    this.startTime = -1;
  }

  // // eslint-disable-next-line class-methods-use-this
  // calcDuration() {
  // }

  // returns remaining time if this step completes
  // Return of 0 means this step is still going
  nextFrame(now: number) {
    if (this.startTime < 0) {
      this.startTime = now;
      return 0;
    }
    let remainingTime = 0;
    let deltaTime = now - this.startTime;
    if (deltaTime > this.duration) {
      remainingTime = deltaTime - this.duration;
      deltaTime = this.duration;
    }
    this.setFrame(deltaTime);
    if (remainingTime > 0) {
      this.finish();
    }
    return remainingTime;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setFrame(deltaTime: number) {
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  start() {
    this.startTime = -1;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  finish() {
    // this.onFinish(false);
  }
}

type TypeAnimationUnitInputOptions = {
  element?: DiagramElement;
  type?: 'transform' | 'color' | 'custom'; // default is transform
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number; // default is dependent on type
  // onFinish?: ?(boolean) => void;
  // onCancel?: ?(boolean) => void;  // Default is onFinish
  // duration?: number;    // Either duration or velocity must be defined
  // velocity?: number | Transform | TypeColor;  // velocity overrides duration
} & TypeAnimationStepInputOptions;

export class AnimationUnit extends AnimationStep {
  element: ?DiagramElement;
  type: 'transform' | 'color' | 'custom';
  duration: number;
  progression: (number) => number;

  constructor(optionsIn: TypeAnimationUnitInputOptions) {
    super(optionsIn);
    let defaultProgression = 'linear';
    if (optionsIn.type === 'transform') {
      defaultProgression = 'easeinout';
    }
    const defaultOptions = {
      element: null,
      type: 'custom',
      progression: defaultProgression,
      duration: 0,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    this.type = options.Type;
    this.onFinish = options.onFinish;
    this.duration = options.duration;
    if (options.progression === 'linear') {
      this.progression = tools.linear;
    } else if (options.progression === 'easein') {
      this.progression = tools.easein;
    } else if (options.progression === 'easeout') {
      this.progression = tools.easeout;
    } else if (options.progression === 'easeinout') {
      this.progression = tools.easeinout;
    } else {
      this.progression = options.progression;
    }
  }

  // // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // _dup() {

  // }

  // // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // start() {
  // }

  // // eslint-disable-next-line class-methods-use-this, no-unused-vars
  // finish() {
  // }
}

type TypeTransformAnimationUnitInputOptions = {
  transform: {
    start?: Transform;      // default is element transform
    target?: Transform;     // Either target or delta must be defined
    delta?: Transform;      // delta overrides target if both are defined
    translationStyle?: 'linear' | 'curved'; // default is linear
    translationOptions?: pathOptionsType;
    rotDirection: 0 | 1 | -1 | 2;
  };
} & TypeAnimationUnitInputOptions;

// A transform animation unit manages a transform animation on an element.
//
// The start transform can either be defined initially, or null. Null means
// the start transform is whatever the current element transform is when the
// unit is started with start().
//
// The transform target is defined with either the target or delta properties.
// Target is used to predefine the target.
// Delta is used to calculate the target when the unit is started with start()
//
export class TransformAnimationUnit extends AnimationUnit {
  transform: {
    start: Transform;  // null means use element transform when unit is started
    delta: Transform;
    target: Transform;
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?Transform;
  };

  constructor(optionsIn: TypeTransformAnimationUnitInputOptions) {
    super(joinObjects({}, optionsIn, { type: 'transform' }));
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: null,
      translationStyle: 'linear',
      rotDirection: 0,
      translationOptions: {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: '',
      },
      velocity: null,
    };
    let options = defaultTransformOptions;
    if (optionsIn.transform != null) {
      options = joinObjects({}, optionsIn.transform, defaultTransformOptions);
    }
    // $FlowFixMe
    this.transform = {};
    this.transform.rotDirection = options.rotDirection;
    this.transform.start = options.start;
    this.transform.target = options.target;
    this.transform.delta = options.delta;
    this.transform.translationStyle = options.translationStyle;
    this.transform.translationOptions = options.translationOptions;
    this.transform.velocity = options.velocity;
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start() {
    if (this.start === null) {
      if (this.element != null) {
        this.transform.start = this.element.transform._dup();
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.transform.delta == null && this.transform.target != null) {
      const delta = this.transform.target.sub(this.transform.start);
      delta.order.forEach((deltaStep, index) => {
        const startStep = this.transform.start.order[index];
        const targetStep = this.transform.target.order[index];
        if (deltaStep instanceof Rotation
          && startStep instanceof Rotation
          && targetStep instanceof Rotation) {
          const rotDiff = getDeltaAngle(
            startStep.r,
            targetStep.r,
            this.transform.rotDirection,
          );
          // eslint-disable-next-line no-param-reassign
          deltaStep.r = rotDiff;
        }
      });
      this.transform.delta = delta;
    } else if (this.transform.delta != null) {
      this.transform.target = this.transform.start.add(this.transform.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    if (this.transform.velocity != null) {
      this.duration = getMaxTimeFromVelocity(
        this.transform.start,
        this.transform.target,
        this.transform.velocity,
        this.transform.rotDirection,
      );
    }
  }

  setFrame(deltaTime: number) {
    // const start = phase.startTransform._dup();
    // const delta = phase.deltaTransform._dup();
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.progression(percentTime);
    const p = percentComplete;
    // let next = delta._dup().constant(p);

    // next = start.add(delta.mul(next));
    const next = this.transform.start.toDelta(
      this.transform.delta, p,
      this.transform.translationStyle,
      this.transform.translationOptions,
    );
    if (this.element != null) {
      this.element.setTransform(next);
    }
  }

  finish(cancelled: boolean = false) {
    // console.log('finished', this.callback)
    const setToEnd = () => {
      if (this.element != null) {
        this.element.setTransform(this.transform.target);
      }
    };
    if (cancelled) {
      if (this.finishOnCancel) {
        setToEnd();
      }
    } else {
      setToEnd();
    }

    if (this.onFinish != null) {
      this.onFinish(cancelled);
    }
  }
}


// Animations get started from a parent, but finish themselves
export class AnimationParallel extends AnimationStep {
  // constructor(optionsIn: TypeAnimationStepInputOptions) {
  //   super(optionsIn);
  //   this.index = 0;
  // }

  // calcDuration() {
  //   let duration = 0;
  //   this.animations.forEach((animationStep) => {
  //     if (animationStep.duration > duration) {
  //       ({ duration } = animationStep);
  //     }
  //   });
  //   this.duration = duration;
  // }

  nextFrame(now: number) {
    let remaining = 0;
    this.animations.forEach((animationStep) => {
      const stepRemaining = animationStep.nextFrame(now);
      if (stepRemaining < remaining) {
        remaining = stepRemaining;
      }
    });
    if (remaining > 0) {
      this.finish();
    }
    return remaining;
  }

  start() {
    this.animations.forEach((animationStep) => {
      animationStep.start();
    });
  }
}

export class AnimationSerial extends AnimationStep {
  index: number;

  constructor(optionsIn: TypeAnimationStepInputOptions) {
    super(optionsIn);
    this.index = 0;
  }

  // calcDuration() {
  //   let duration = 0;
  //   this.animations.forEach((animation) => {
  //     duration += animation.duration;
  //   });
  //   this.duration = duration;
  // }

  start() {
    this.index = 0;
    this.animations[0].start();
  }

  nextFrame(now: number) {
    const remaining = this.animations[this.index].nextFrame(now);
    if (remaining > 0) {
      if (this.index === this.animations.length - 1) {
        this.finish();
        return remaining;
      }
      this.index += 1;
      this.animations[this.index].start();
      this.animations[this.index].startTime = now - remaining;
    }
    return 0;
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
