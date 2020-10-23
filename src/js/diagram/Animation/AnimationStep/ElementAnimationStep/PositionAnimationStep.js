// @flow
import {
  Transform, Point, getMaxTimeFromVelocity, getPoint,
} from '../../../../tools/g2';
import type { OBJ_QuadraticBezier } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
  // joinObjectsWithOptions,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
// import type { OBJ_QuadraticBezier } from 
// import type { DiagramElement } from '../../../Element';

/**
 * Position animation step options object
 *
 * By default, the position will start with the element's current position.
 *
 * Use either `delta` or `target` to define it's end point.
 *
 * The path of travel between `start` and `target` can either be a straight
 * line (`'linear'`) or a quadratic bezier curve (`'curved'`)
 *
 * For custom paths, the @{link CustomAnimationStep} can be used.
 *
 * @extends OBJ_ElementAnimationStep
 * @property {TypeParsablePoint} [start] start position - if undefined then
 * current position is used
 * @property {TypeParsablePoint} [target] target position - if undefined then
 * `delta` is used
 * @property {TypeParsablePoint} [delta] target delta - only used if `target`
 * is undefined
 * @property {null | TypeParsablePoint} [velocity] velocity of
 * position overrides `duration` - `null` to use `duration` (`null`)
 * @property {number} [null | maxDuration] maximum duration to cap to -
 * `null` for no cap (`null`)
 * @property {'linear' | 'curved'} [path] (`'linear'`)
 * @property {OBJ_QuadraticBezier} [pathOptions]
 * (`{ magnitude: 0.5, direction: 'positive', offset: 0.5 }`)
 *
 * @extends ElementAnimationStep
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Using duration
 * p.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .start()
 *
 * @example
 * // Using velocity
 * p.animations.new()
 *   .position({ target: [1, 0], velocity: 0.5 })
 *   .start()
 */
export type OBJ_PositionAnimationStep = {
  start?: Point;      // default is element transform
  target?: Point;     // Either target or delta must be defined
  delta?: Point;      // delta overrides target if both are defined
  path?: 'linear' | 'curved'; // default is linear
  pathOptions?: pathOptionsType;
  velocity?: Point;
  maxDuration?: number;
} & OBJ_ElementAnimationStep;

/**
 * Position or Translation Animation Step
 * @extends ElementAnimationStep
 */
export default class PositionAnimationStep extends ElementAnimationStep {
  position: {
    start: ?Point;  // null means use element transform when unit is started
    delta: ?Point;
    target: ?Point;
    // rotDirection: 0 | 1 | -1 | 2;
    path: 'linear' | 'curved';
    pathOptions: OBJ_QuadraticBezier;
    velocity: ?Point;
    maxDuration: ?number;
  };

  constructor(...optionsIn: Array<OBJ_PositionAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'position' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'start', 'delta', 'target', 'path', 'pathOptions',
      'velocity', 'maxDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    this._stepType = 'position';
    const defaultPositionOptions = {
      start: null,
      target: null,
      delta: null,
      path: 'linear',
      pathOptions: {
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'positive',
      },
      maxDuration: null,
      velocity: null,
    };
    if (this.element && this.element.animations.options.translation) {
      const pathOptions = this.element.animations.options.translation;
      if (pathOptions.style != null) {
        // $FlowFixMe - this is messy, but deal with it
        defaultPositionOptions.style = pathOptions.style;
      }
      joinObjects(defaultPositionOptions.pathOptions, pathOptions);
    }
    const options = joinObjects({}, defaultPositionOptions, ...optionsIn);
    if (options.start != null) {
      options.start = getPoint(options.start);
    }
    if (options.target != null) {
      options.target = getPoint(options.target);
    }
    if (options.delta != null) {
      options.delta = getPoint(options.delta);
    }
    // $FlowFixMe
    this.position = { pathOptions: {} };
    copyKeysFromTo(options, this.position, [
      'start', 'delta', 'target', 'path',
      'velocity', 'maxDuration',
    ]);
    duplicateFromTo(options.pathOptions, this.position.pathOptions);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'position',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'positionAnimationStep';
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    super.start(startTime);
    if (this.position.start == null) {
      if (this.element != null) {
        this.position.start = this.element.getPosition();
      } else {
        this.duration = 0;
        return;
      }
    } else if (startTime === 'now' || startTime === 'prev') {
      if (this.element != null) {
        this.element.setPosition(getPoint(this.position.start));
      }
    }
    // if delta is null, then calculate it from start and target
    if (this.position.delta == null
      && this.position.target != null
      && this.position.start != null
    ) {
      const delta = this.position.target.sub(this.position.start);
      this.position.delta = delta;
    } else if (this.position.delta != null && this.position.start != null) {
      this.position.target = this.position.start.add(this.position.delta);
    } else {
      this.duration = 0;
    }

    // If Velocity is defined, then use it to calculate duration
    const { target, start, velocity } = this.position;
    if (velocity != null && start != null && target != null) {
      const velocityToUse = getPoint(velocity);
      this.duration = getMaxTimeFromVelocity(
        new Transform().translate(start),
        new Transform().translate(target),
        new Transform().translate(velocityToUse),
      );
    }
    if (this.position.maxDuration != null) {
      if (this.duration > this.position.maxDuration) {
        this.duration = this.position.maxDuration;
      }
    }
  }

  setFrame(deltaTime: number) {
    // console.log('setFrame', deltaTime);
    const percentTime = deltaTime / this.duration;
    const percentComplete = this.getPercentComplete(percentTime);
    const p = percentComplete;

    if (this.position.delta != null && this.position.start != null) {
      const next = this.position.start.toDelta(
        this.position.delta, p,
        this.position.path,
        this.position.pathOptions,
      );
      if (this.element != null) {
        this.element.setPosition(next);
      }
    }
  }

  setToEnd() {
    if (this.element != null && this.position.target != null) {
      this.element.setPosition(this.position.target);
    }
  }

  _dup() {
    const step = new PositionAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
