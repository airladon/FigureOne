// @flow
import {
  Transform, Point, getMaxTimeFromVelocity, getPoint,
} from '../../../../tools/g2';
import type { OBJ_TranslationPath } from '../../../../tools/g2';
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
  // joinObjectsWithOptions,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';
import type { AnimationStartTime } from '../../AnimationManager';
// import type { OBJ_QuadraticBezier } from
// import type { FigureElement } from '../../../Element';

/**
 * {@link PositionAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 *
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
 * @property {OBJ_TranslationPath} [path] (`{ style: 'linear' }`)
 * @property {number | null} [maxDuration] maximum duration to clip animation
 * to where `null` is unlimited (`null`)
 *
 * @see {@link PositionAnimationStep} for description and examples
 */
export type OBJ_PositionAnimationStep = {
  start?: Point;      // default is element transform
  target?: Point;     // Either target or delta must be defined
  delta?: Point;      // delta overrides target if both are defined
  // path?: 'linear' | 'curved'; // default is linear
  // pathOptions?: pathOptionsType;
  path?: OBJ_TranslationPath;
  velocity?: Point;
  maxDuration?: number;
} & OBJ_ElementAnimationStep;

/**
 * Position animation step
 *
 * ![](./apiassets/position_animation.gif)
 *
 * The position animation step animates the first {@link Translation} transform
 * in the {@link FigureElement}'s {@link Transform}.
 *
 * By default, the position will start with the element's current position.
 *
 * Use either `delta` or `target` to define it's end point.
 *
 * The path of travel between `start` and `target` can either be a straight
 * line (`'linear'`) or a quadratic bezier curve (`'curve'`)
 *
 * For custom paths, the {@link CustomAnimationStep} can be used.
 *
 *
 * @extends ElementAnimationStep
 *
 * @param {OBJ_PositionAnimationStep} options
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
 *
 * @example
 * // Linear and curved path
 * p.animations.new()
 *   .delay(1)
 *   .position({ target: [1, 0], duration: 2 })
 *   .position({
 *     target: [0, 0],
 *     duration: 2,
 *     path: {
 *       style: 'curve',
 *       magnitude: 0.8,
 *       direction: 'up',
 *     },
 *   })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.position({ target: [1, 0], duration: 2 });
 * const step2 = new Fig.Animation.PositionAnimationStep({
 *   element: p,
 *   target: [0, 0],
 *   duration: 2,
 * });
 *
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export default class PositionAnimationStep extends ElementAnimationStep {
  position: {
    start: ?Point;  // null means use element transform when unit is started
    delta: ?Point;
    target: ?Point;
    // rotDirection: 0 | 1 | -1 | 2;
    path: OBJ_TranslationPath;
    // pathOptions: OBJ_QuadraticBezier;
    velocity: ?Point;
    maxDuration: ?number;
  };

  /**
   * @hideconstructor
   */
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
      path: {
        style: 'linear',
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
      joinObjects(defaultPositionOptions.path, pathOptions);
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
    this.position = { path: {} };
    copyKeysFromTo(options, this.position, [
      'start', 'delta', 'target', 'path',
      'velocity', 'maxDuration',
    ]);
    // duplicateFromTo(options.path, this.position.path);
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
  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (this.position.start == null) {
      if (this.element != null) {
        this.position.start = this.element.getPosition();
      } else {
        this.duration = 0;
        return;
      }
    } else if (startTime === 'now' || startTime === 'prevFrame') {
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
        this.position.path.style,
        this.position.path,
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
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
