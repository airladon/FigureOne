// @flow
// import * as tools from '../../../tools/math';
// import { DiagramElement } from '../../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import type { DiagramElement } from '../../Element';

/**
 * Animation progression function.
 * Function is passed the percent complete of the animation duration and
 * returns the percent complete of the delta between the target and start
 * values of the animation.
 *
 * A linear function would return the same percent as is passed. However,
 * the returned percent would change if some smoothing was desired at the
 * start or end of the animation.
 *
 * @param {number} percent percentage of duration
 * @return {number} percent of animation complete
 */
export type AnimationProgression = (number) => number;

/**
 * Base element animation step
 *
 * @extends TypeAnimationStepInputOptions
 * @property {DiagramElement} [element]
 * @property {'linear' | 'easeinout' | 'easein' | 'easeout' | AnimationProgression} [progression]
 * how the animation progresses - defaults to `linear` for color, opacity and
 * custom animations and `easeinout` for others
 */
export type TypeElementAnimationStepInputOptions = {
  element?: DiagramElement; // Can't use DiagramElement as importing it makes a loop
  type?: 'transform' | 'color' | 'custom' | 'position' | 'rotation' | 'scale' | 'opacity';
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number; // default is easeinout except color and custom which is linear
} & TypeAnimationStepInputOptions;

export default class ElementAnimationStep extends AnimationStep {
  element: ?DiagramElement;
  type: 'transform' | 'color' | 'custom' | 'position' | 'setPosition' | 'opacity';
  duration: number;
  progression: ((number, ?boolean) => number) | string;

  constructor(optionsIn: TypeElementAnimationStepInputOptions = {}) {
    super(optionsIn);
    let defaultProgression = 'easeinout';
    if (optionsIn.type === 'color' || optionsIn.type === 'custom' || optionsIn.type === 'opacity') {
      defaultProgression = 'linear';
    }
    const defaultOptions = {
      element: null,
      type: 'custom',
      progression: defaultProgression,
      duration: 0,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    this.type = options.type;
    this.onFinish = options.onFinish;
    this.duration = options.duration;
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
    // const result = this.fnMap.exec(idOrFn, ...args);
    // if (result == null && this.element != null) {
    //   return this.element.fnMap.exec(idOrFn, ...args);
    // }
    // return result;
    if (this.element != null) {
      return this.fnMap.execOnMaps(
        idOrFn, [this.element.fnMap.map], ...args,
      );
    }
    return this.fnMap.exec(idOrFn, ...args);
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    // console.log('elementstep');
    return [...super._getStateProperties(),
      // 'element',
      'type',
      // 'duration',
      'progression',
    ];
  }

  _fromState(state: Object, getElement: ?(string) => DiagramElement) {
    // const obj = new this.constructor();
    joinObjects(this, state);
    if (this.element != null && typeof this.element === 'string' && getElement != null) {
      this.element = getElement(this.element);
    }
    return this;
  }

  _state(options: Object) {
    const state = super._state(options);
    if (this.element != null) {
      state.state.element = {
        f1Type: 'de',
        state: this.element.getPath(),
      };
    }
    // if (this.element != null) {
    //   definition.state.element = this.element.getPath();
    // }
    return state;
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

  _dup() {
    const step = new ElementAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
