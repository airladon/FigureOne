// @flow
import {
  Transform, getScale, getTransform,
  getMaxTimeFromVelocity,
} from '../../../../tools/g2';
import type {
  TypeParsablePoint, TypeParsableTransform,
} from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import {
  round,
} from '../../../../tools/math';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';
import type { OBJ_TranslationPath } from '../../../../tools/geometry/Path';

export type OBJ_PulseTransformAnimationStep = {
  start?: Array<Transform>;      // default is element transform
  target?: Array<Transform>;     // Either target or delta must be defined
  // delta?: Transform;      // delta overrides target if both are defined
  path?: OBJ_TranslationPath;       // default is linear
  rotDirection: 0 | 1 | -1 | 2;
  clipRotationTo: '0to360' | '-180to180' | null;
  velocity: ?Transform | number | {
    position?: TypeParsablePoint | number,
    translation?: TypeParsablePoint | number,
    rotation?: number,
    scale?: TypeParsablePoint | number,
    transform?: TypeParsableTransform,
  };
  maxDuration?: number;
  zeroDurationThreshold?: Number;
  // minDuration?: number;
} & OBJ_ElementAnimationStep;

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
export default class PulseTransformAnimationStep extends ElementAnimationStep {
  transform: {
    start: Array<Transform>;  // null means use element transform when unit is started
    delta: Array<Transform>;
    target: Array<Transform>;
    rotDirection: 0 | 1 | -1 | 2;
    path: OBJ_TranslationPath;
    velocity: ?Transform | number | {
      position?: TypeParsablePoint | number,
      translation?: TypeParsablePoint | number,
      rotation?: number,
      scale?: TypeParsablePoint | number,
      transform?: TypeParsableTransform,
    };
    clipRotationTo: '0to360' | '-180to180' | null;
    maxDuration: ?number;
    // minDuration: number;
    zeroDurationThreshold: number;
  };

  constructor(...optionsIn: Array<OBJ_PulseTransformAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'transform' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'rotDirection', 'path',
      'velocity', 'clipRotationTo', 'maxDuration',
      'zeroDurationThreshold', // 'minDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    const defaultTransformOptions = {
      start: null,
      target: null,
      delta: [],
      path: {
        style: 'linear',
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'positive',
      },
      rotDirection: 0,
      velocity: null,
      clipRotationTo: null,
      maxDuration: null,
      // minDuration: 0,
      zeroDurationThreshold: 0,
    };
    if (this.element && this.element.animations.options.translation) {
      const pathOptions = this.element.animations.options.translation;
      joinObjects(defaultTransformOptions.path, pathOptions);
    }
    const options = joinObjects({}, defaultTransformOptions, ...optionsIn);
    // $FlowFixMe
    this.transform = {};
    copyKeysFromTo(options, this.transform, [
      'start', 'delta', 'target', 'path',
      'velocity', 'rotDirection', 'clipRotationTo', 'maxDuration',
      'zeroDurationThreshold',  // 'minDuration',
    ]);
    if (this.transform.velocity != null && ElementAnimationStepOptionsIn.duration == null) {
      this.duration = 0;
    }
  }

  // If spreading to more transforms, add transforms to before start and after finish.
  // If adding an odd number, more will be added to before start.
  // If spreading to less transforms, subtract transforms from middle. If all but one
  // is being subtracted, then the start transform will be retained.

  // eslint-disable-next-line class-methods-use-this
  spread(transforms: Array<Transform>, toNum: number) {
    if (toNum === transforms.length) {
      return transforms;
    }
    if (toNum <= 1) {
      return [transforms[0]];
    }
    const spreadTransforms = [];
    if (toNum > transforms.length) {
      const delta = toNum - transforms.length;
      const startNum = Math.ceil(delta / 2);
      const endNum = Math.floor(delta / 2);
      const startTransform = transforms[0]._dup();
      const endTransform = transforms[transforms.length - 1]._dup();
      for (let i = 0; i < startNum; i += 1) {
        spreadTransforms.push(startTransform._dup());
      }
      for (let i = 0; i < transforms.length; i += 1) {
        spreadTransforms.push(transforms[i]._dup());
      }
      for (let i = 0; i < endNum; i += 1) {
        spreadTransforms.push(endTransform._dup());
      }
      return spreadTransforms;
    }
    const delta = transforms.length - toNum;
    const startNum = Math.ceil((transforms.length - delta) / 2);
    const endNum = Math.floor((transforms.length - delta) / 2);

    for (let i = 0; i < startNum; i += 1) {
      spreadTransforms.push(transforms[i]._dup());
    }
    for (let i = transforms.length - endNum; i < transforms.length; i += 1) {
      spreadTransforms.push(transforms[i]._dup());
    }
    return spreadTransforms;
  }

  setStartAndTarget() {
    const { start, target } = this.transform;
    const numTransforms = Math.max(start.length, target.length);
    this.transform.start = this.spread(this.transform.start, numTransforms);
    this.transform.target = this.spread(this.transform.target, numTransforms);
  }

  calculateStartTargetDelta() {
    if (this.transform.start.length !== this.transform.target.length) {
      this.transform.delta = [];
      return;
    }
    this.transform.delta = [];
    for (let i = 0; i < this.transform.start.length; i += 1) {
      const start = this.transform.start[i];
      const target = this.transform.target[i];
      const delta = target.sub(start);
      // const { direction } = this.transform;
      // delta.def.forEach((deltaStep, index) => {
      //   const s = start.def[index];
      //   const t = target.def[index];
      //   /* eslint-disable no-param-reassign */
      //   if (deltaStep[0] === 'r') {
      //     deltaStep[1] = getDeltaAngle(s[1], t[1], direction);
      //   } else if (deltaStep[0] === 'rs') {
      //     deltaStep[1] = getDeltaAngle(s[1], t[1], direction);
      //     deltaStep[2] = getDeltaAngle(s[2], t[2], direction);
      //   } else if (deltaStep[0] === 'rc') {
      //     deltaStep[1] = getDeltaAngle(s[1], t[1], direction);
      //     deltaStep[2] = getDeltaAngle(s[2], t[2], direction);
      //     deltaStep[3] = getDeltaAngle(s[3], t[3], direction);
      //   } else if (deltaStep[0] === 'ra') {
      //     deltaStep[4] = getDeltaAngle(s[4], t[4], direction);
      //   }
      //   /* eslint-enable no-param-reassign */
      //   // if (deltaStep[0] === 'r'
      //   //   && startStep[0] === 'r'
      //   //   && targetStep[0] === 'r') {
      //   //   const rotDiff = getDeltaAngle(
      //   //     startStep[3],
      //   //     targetStep[3],
      //   //     this.transform.rotDirection,
      //   //   );
      //   //   // eslint-disable-next-line no-param-reassign
      //   //   deltaStep[3] = rotDiff;
      //   // }
      // });
      this.transform.delta.push(delta);
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'transform',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'transformAnimationStep';
  }

  getVelocityTransform() {
    // const { element } = this;
    // if (element == null) {
    //   return new Transform();
    // }
    const { velocity } = this.transform;
    if (velocity == null) {
      return new Transform();
    }

    if (velocity instanceof Transform) {
      return velocity;
    }

    if (typeof velocity === 'number') {
      return this.transform.start[0]._dup().constant(velocity);
    }

    let transformVelocity = this.transform.start[0]._dup().constant(1);

    if (velocity.transform != null) {
      transformVelocity = getTransform(velocity.transform)._dup();
    }

    for (let i = 0; i < transformVelocity.def.length; i += 1) {
      const t = transformVelocity.def[i];
      if (t[0] === 's' && velocity.scale != null) {
        const s = getScale(velocity.scale);
        t[1] = s.x; // $FlowFixMe
        t[2] = s.y;
      }
      if (t[0] === 't' && velocity.translation != null) {
        const s = getScale(velocity.translation);
        t[1] = s.x; // $FlowFixMe
        t[2] = s.y;
      }
      if (t[0] === 't' && velocity.position != null) {
        const s = getScale(velocity.position);
        t[1] = s.x; // $FlowFixMe
        t[2] = s.y;
      }
      if (velocity.rotation != null) {
        if (t[0] === 'r') {
          transformVelocity.def[i] = ['r', velocity.rotation];
        }
        if (t[0] === 'rc') {
          transformVelocity.def[i] = ['rc', velocity.rotation, velocity.rotation, velocity.rotation];
        }
        if (t[0] === 'rd') {
          transformVelocity.def[i] = ['rc', velocity.rotation, velocity.rotation, velocity.rotation];
        }
        if (t[0] === 'ra') {
          transformVelocity.def[i] = ['ra', velocity.rotation, velocity.rotation, velocity.rotation, velocity.rotation];
        }
        if (t[0] === 'rb') { // $FlowFixMe
          transformVelocity.def[i] = ['rb', velocity.rotation, velocity.rotation, velocity.rotation, velocity.rotation, velocity.rotation, velocity.rotation];
        }
        transformVelocity.calcAndSetMatrix();
      }
      // if (t[0] === 'r' && velocity.rotation != null) {
      //   t[3] = velocity.rotation;
      // }
    }
    return transformVelocity;
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (this.transform.start == null || this.transform.start.length === 0) {
      if (this.element != null) {
        if (this.element.pulseTransforms.length > 0) {
          this.transform.start = this.element.pulseTransforms.map(t => t._dup());
        } else {
          this.transform.start = [this.transform.target[0].identity()];
        }
      } else {
        this.duration = 0;
        return;
      }
    }

    if (this.transform.start.length === 0 && this.element != null) {
      this.transform.start = [this.element.transform._dup()];
    }

    this.setStartAndTarget();

    // if delta is null, then calculate it from start and target
    this.calculateStartTargetDelta();
    if (this.transform.delta.length === 0) {
      this.duration = 0;
    }
    // If Velocity is defined, then use it to calculate duration
    if (this.transform.velocity != null) {
      const velocity = this.getVelocityTransform();
      for (let i = 0; i < this.transform.start.length; i += 1) {
        const start = this.transform.start[i];
        const target = this.transform.target[i];
        const duration = getMaxTimeFromVelocity(
          start,
          target,
          velocity,
          this.transform.rotDirection,
        );
        if (duration > this.duration) {
          this.duration = duration;
        }
      }
    }
    if (this.transform.maxDuration != null) {
      if (this.duration > this.transform.maxDuration) {
        this.duration = this.transform.maxDuration;
      }
    }
    if (this.duration <= this.transform.zeroDurationThreshold) {
      this.duration = 0;
    }
    this.duration = round(this.duration, this.precision);
    if (startTime === 'now' || startTime === 'prevFrame') {
      this.setFrame(0);
    }
  }

  setFrame(deltaTime: number) {
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;
    if (this.element == null) {
      return;
    }
    const { element } = this;
    element.frozenPulseTransforms = [];
    for (let i = 0; i < this.transform.start.length; i += 1) {
      const next = this.transform.start[i].toDelta(
        this.transform.delta[i], p,
        this.transform.path.style,
        this.transform.path,
      );
      if (this.transform.clipRotationTo !== null) {
        next.clipRotation(this.transform.clipRotationTo);
      }
      element.frozenPulseTransforms.push(next);
    }
  }

  setToEnd() {
    if (this.element == null) {
      return;
    }
    const { element } = this;
    element.frozenPulseTransforms = [];
    this.transform.target.forEach((t) => {
      element.frozenPulseTransforms.push(t._dup());
    });
  }

  _dup() {
    const step = new PulseTransformAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
