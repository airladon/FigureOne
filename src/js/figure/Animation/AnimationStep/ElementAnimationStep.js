// @flow
// import * as tools from '../../../tools/math';
// import { FigureElement } from '../../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type { FigureElement } from '../../Element';
import type { AnimationStartTime } from '../AnimationManager';

/**
 * Animation progression function.
 *
 * As the animation time progresses, a percentage of the total animation
 * duration will be passed to this function.
 *
 * This function then calculates and returns the percent progress of the
 * animation.
 *
 * This function can be used to make non-linear progressions of an animation.
 * For instance, it could be used to create a progression that is slowed
 * at the start or end of the animation.
 *
 * @param {number} percent percentage of duration
 * @return {number} percent of animation complete
 */
export type AnimationProgression = (number) => number;

/**
 * {@link ElementAnimationStep} options object
 *
 * @extends OBJ_AnimationStep
 * @property {FigureElement} [element]
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 * how the animation progresses - defaults to `linear` for color, opacity and
 * custom animations and `easeinout` for others
 */
export type OBJ_ElementAnimationStep = {
  element?: FigureElement; // Can't use FigureElement as importing it makes a loop
  type?: 'transform' | 'color' | 'custom' | 'position' | 'rotation' | 'scale' | 'opacity';
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression; // default is easeinout except color and custom which is linear
} & OBJ_AnimationStep;

/**
 * Animation Step tied to an element
 *
 * Default values for the animation step will then come from this element.
 *
 * @extends AnimationStep
 */
export default class ElementAnimationStep extends AnimationStep {
  element: ?FigureElement;
  type: 'transform' | 'color' | 'custom' | 'position' | 'setPosition' | 'opacity';
  duration: number;
  progression: ((number, ?boolean) => number) | string;

  constructor(optionsIn: OBJ_ElementAnimationStep = {}) {
    super(optionsIn);
    let defaultProgression = 'easeinout';
    if (optionsIn.type === 'color' || optionsIn.type === 'custom' || optionsIn.type === 'opacity') {
      defaultProgression = 'linear';
    }
    const defaultOptions = {
      element: null,
      type: 'custom',
      progression: defaultProgression,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    this.type = options.type;
    this.onFinish = options.onFinish;
    this.progression = options.progression;
    if (this.progression === 'linear') {
      this.progression = 'tools.math.linear';
    } else if (options.progression === 'easein') {
      this.progression = 'tools.math.easein';
    } else if (options.progression === 'easeout') {
      this.progression = 'tools.math.easeout';
    } else if (options.progression === 'easeinout') {
      this.progression = 'tools.math.easeinout';
    } else {
      this.progression = options.progression;
    }
  }

  fnExec(idOrFn: string | Function | null, ...args: any) {
    if (this.element != null) {
      return this.fnMap.execOnMaps(
        idOrFn, [this.element.fnMap.map], ...args,
      );
    }
    return this.fnMap.exec(idOrFn, ...args);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      // 'element',
      'type',
      // 'duration',
      'progression',
      'element',
    ];
  }


  getPercentComplete(percentTime: number) {
    if (typeof this.progression === 'string') {
      const result = this.fnExec(this.progression, percentTime);
      if (result == null) {
        return 0;
      }
      return result;
    }
    if (typeof this.progression === 'function') {
      return (this.progression(percentTime));
    }
    return 0;
  }

  start(startTime: ?AnimationStartTime = null) {
    super.start(startTime);
    if (this.element != null) {
      this.element.animateNextFrame();
    }
  }

  _dup() {
    const step = new ElementAnimationStep();
    duplicateFromTo(this, step, ['element', 'timeKeeper']);
    step.element = this.element;
    step.timeKeeper = this.timeKeeper;
    return step;
  }
}
