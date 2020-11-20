// @flow
import {
  joinObjects, duplicateFromTo, deleteKeys, copyKeysFromTo,
} from '../../../../tools/tools';
import type {
  OBJ_ElementAnimationStep,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

/**
 * {@link PulseAnimationStep} options object
 *
 * @extends OBJ_ElementAnimationStep
 * @property {number} [frequency] pulse frequency in Hz - a frequency of zero
 * will set the frequency so just one cycle will be performed in the duration
 * (`0`)
 * @property {number} [scale] maximum scale value to pulse to (`1.5`)
 * @property {number} [rotation] maximum rotation value to pulse to
 * @property {number} [translation] maximum translation displacment value to
 * pulse to (`1.5`)
 * @property {number} [angle] translation angle (`0`)
 * @property {number} [min] minimum value to pulse to
 * @property {null | DiagramElement | TypeParsablePoint} [centerOn] center
 * of scale or rotation pulse. By default, the element calling the pulse
 * will be the default `centerOn`.
 * @property {'left' | 'center' | 'right' | 'location' | number} [xAlign]
 * if `centerOn` is a {@link DiagramElement} then this property can be used to
 * horizontally align the pulse center with the element. `'location'` is the
 * (0, 0) draw space coordinate of the element. `number` defines the percent
 * width from the left of the element (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | 'location' | number} [yAlign]
 * if `centerOn` is a {@link DiagramElement} then this property can be used to
 * vertically align the pulse center with the element. `'location'` is the
 * (0, 0) draw space coordinate of the element. `number` defines the percent
 * width from the left of the element (`'center'`)
 * @property {'diagram' | 'gl' | 'local' | 'draw' | 'pixel'} [space]
 * if `centerOn` is a point, use this to define the space the point is in
 * (`'diagram'`)
 * @property {number} [num] the number of draw copies of the pulse to make (`1`)
 * @property {null | string | function(): void} [done] callback when pulse is
 * finished. If `string` then the element's {@link FunctionMap} `fnMap` will be
 * used (`null`)
 * @property {TypeWhen} [when] when to start the pulse (`'syncNow'`)
 *
 */
export type OBJ_PulseAnimationStep = {
  // scale: ?number;
  // numLines: ?number;
  // frequency: ?number;
  stopAfterDuration: ?boolean;

  frequency?: number,
  scale?: number,
  rotation?: number,
  translation?: number,
  angle?: number,
  min?: number,
  centerOn?: null | DiagramElement | TypeParsablePoint,
  x?: 'left' | 'center' | 'right' | 'origin' | number,
  y?: 'bottom' | 'middle' | 'top' | 'origin' | number,
  space?: 'diagram' | 'gl' | 'local' | 'draw',
  done?: ?(mixed) => void,
  num?: number,
  when?: TypeWhen,
} & OBJ_ElementAnimationStep;

/**
 * Pulse animation step
 *
 * ![](./assets1/pulse_animation.gif)
 *
 * The pulse animation step animates a pulse.
 *
 * The options are the same as those in the * <a href="#diagramelementpulse">pulse</a> method.
 *
 * @extends ElementAnimationStep
 * @param {OBJ_RotationAnimationStep} options
 *
 *
 * @see To test examples, append them to the
 * <a href="#animation-boilerplate">boilerplate</a>
 *
 * @example
 * // Scale pulse, rotation pulse and translation pulse
 * p.animations.new()
 *   .pulse({
 *     scale: 1.5,
 *     duration: 1,
 *   })
 *   .pulse({
 *     duration: 1,
 *     rotation: 0.15,
 *     frequency: 4,
 *   })
 *   .pulse({
 *     duration: 1,
 *     translation: 0.02,
 *     min: -0.02,
 *     frequency: 4,
 *   })
 *   .start();
 *
 * @example
 * // Different ways to create a stand-alone step
 * const step1 = p.animations.pulse({
 *   scale: 1.5,
 *   duration: 1,
 * });
 * const step2 = new Fig.Animation.PulseAnimationStep({
 *   element: p,
 *   rotation: 0.15,
 *   frequency: 4,
 * });
 * p.animations.new()
 *   .then(step1)
 *   .then(step2)
 *   .start();
 */
export default class PulseAnimationStep extends ElementAnimationStep {
  // scale: number;
  // numLines: number;
  // frequency: number;
  pulse: {
    frequency: number;
    scale: number;
    rotation?: number;
    translation?: number;
    angle: number;
    min: number;
    centerOn: null | DiagramElement | TypeParsablePoint;
    x: 'left' | 'center' | 'right' | 'origin' | number;
    y: 'bottom' | 'middle' | 'top' | 'origin' | number;
    space: 'diagram' | 'gl' | 'local' | 'draw';
    done: ?(mixed) => void;
    num: number;
    when: TypeWhen;
    stopAfterDuration: boolean;
    toStart: boolean;
  }

  constructor(...optionsIn: Array<OBJ_PulseAnimationStep>) {
    const ElementAnimationStepOptionsIn =
      joinObjects({}, { type: 'position' }, ...optionsIn);
    deleteKeys(ElementAnimationStepOptionsIn, [
      'stopAfterDuration', 'frequency', 'scale', 'rotation', 'translation',
      'angle', 'min', 'centerOn', 'x', 'y', 'space', 'done', 'num', 'when',
      'stopAfterDuration', 'velocity', 'maxDuration',
    ]);
    super(ElementAnimationStepOptionsIn);
    this._stepType = 'pulse';
    // const ElementAnimationStepOptionsIn =
    //   joinObjects({}, { type: 'pulse' }, ...optionsIn);
    // super(ElementAnimationStepOptionsIn);
    const defaultOptions = {
      scale: 2,
      rotation: null,
      translation: null,
      angle: 0,
      duration: 1,
      frequency: 0,
      xAlign: 'center',
      yAlign: 'middle',
      // centerOn: this,
      num: 1,
      space: 'diagram',
      done: null,
      progression: 'sinusoid',
      when: 'syncNow',
      // scale: 1.5,
      // numLines: 1,
      type: 'pulse',
      // duration: 1,
      // frequency: 0,
      stopAfterDuration: true,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.centerOn == null && this.element != null) {
      options.centerOn = this.element;
    }
    this.pulse = {};
    copyKeysFromTo(options, this.pulse, [
      'stopAfterDuration', 'frequency', 'scale', 'rotation', 'translation',
      'angle', 'min', 'centerOn', 'x', 'y', 'space', 'done', 'num', 'when',
      'stopAfterDuration', 'velocity', 'maxDuration', 'duration',
    ]);
    this.pulse.centerOn = options.centerOn;
    this.duration = options.duration;
    this.toStart = true;
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'scale',
      'numLines',
      'frequency',
      'stopAfterDuration',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'pulseAnimationStep';
  }

  setFrame() {
    if (this.toStart) {
      const { element } = this;
      if (element != null) {
        element.pulse(this.pulse);
      }
      this.toStart = false;
    }
  }

  setToEnd() {
    if (this.element != null) {
      if (this.stopAfterDuration) {
        this.element.stopPulsing();
      }
    }
  }

  _dup() {
    const step = new PulseAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
