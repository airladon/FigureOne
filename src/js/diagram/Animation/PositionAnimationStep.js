// @flow
import {
  Transform, Point, getMaxTimeFromVelocity,
} from '../../tools/g2';
import type { pathOptionsType } from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from './ElementAnimationStep';
import ElementAnimationStep from './ElementAnimationStep';


export type TypePositionAnimationStepInputOptions = {
  position: {
    start?: Point;      // default is element transform
    target?: Point;     // Either target or delta must be defined
    delta?: Point;      // delta overrides target if both are defined
    translationStyle?: 'linear' | 'curved'; // default is linear
    translationOptions?: pathOptionsType;
  }
} & TypeElementAnimationStepInputOptions;

export default class PositionAnimationStep extends ElementAnimationStep {
  position: {
    start: Point;  // null means use element transform when unit is started
    delta: Point;
    target: Point;
    rotDirection: 0 | 1 | -1 | 2;
    translationStyle: 'linear' | 'curved';
    translationOptions: pathOptionsType;
    velocity: ?Point | number;
  };

  constructor(optionsIn: TypePositionAnimationStepInputOptions) {
    super(joinObjects({}, optionsIn, { type: 'position' }));
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      translationStyle: 'linear',
      translationOptions: {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: '',
      },
      velocity: null,
    };
    let options = defaultPositionOptions;
    if (optionsIn.position != null) {
      options = joinObjects({}, defaultPositionOptions, optionsIn.position);
    }
    // $FlowFixMe
    this.position = {};
    this.position.start = options.start;
    this.position.target = options.target;
    this.position.delta = options.delta;
    this.position.translationStyle = options.translationStyle;
    this.position.translationOptions = options.translationOptions;
    this.position.velocity = options.velocity;
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start() {
    super.start();
    if (this.position.start === null) {
      if (this.element != null) {
        this.position.start = this.element.getPosition();
      } else {
        this.duration = 0;
        return;
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.position.delta == null && this.position.target != null) {
      const delta = this.position.target.sub(this.position.start);
      this.position.delta = delta;
    } else if (this.position.delta != null) {
      this.position.target = this.position.start.add(this.position.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    if (this.position.velocity != null) {
      let { velocity } = this.position;
      if (typeof velocity === 'number') {
        velocity = new Point(velocity, velocity);
      }
      this.duration = getMaxTimeFromVelocity(
        new Transform().translate(this.position.start),
        new Transform().translate(this.position.target),
        new Transform().translate(velocity),
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
    const next = this.position.start.toDelta(
      this.position.delta, p,
      this.position.translationStyle,
      this.position.translationOptions,
    );
    if (this.element != null) {
      this.element.setPosition(next);
    }
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'noComplete' = null) {
    if (this.state === 'idle') {
      return;
    }
    super.finish(cancelled, force);
    const setToEnd = () => {
      if (this.element != null) {
        this.element.setPosition(this.position.target);
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
}
