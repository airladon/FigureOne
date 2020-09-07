// @flow
import {
  Point, Transform, parsePoint, getPoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
// import { RGBToArray } from '../../../tools/color';
import {
  DiagramElementPrimitive, DiagramElementCollection, DiagramElement,
} from '../../Element';
import {
  DiagramFont,
} from '../../DrawingObjects/TextObject/TextObject';
import type { ElementInterface } from './Elements/Element';
import { Elements } from './Elements/Element';
import BaseAnnotationFunction from './Elements/BaseAnnotationFunction';
import EquationForm from './EquationForm';
import type {
  TypeHAlign, TypeVAlign,
} from './EquationForm';
// import HTMLObject from '../../DrawingObjects/HTMLObject/HTMLObject';
import * as html from '../../../tools/htmlGenerator';
import EquationSymbols from './EquationSymbols';
import type { TypeSymbolOptions } from './EquationSymbols';
import { getDiagramElement, EquationFunctions } from './EquationFunctions';
import type { TypeEquationPhrase } from './EquationFunctions';


// Priority:
//   1. symbol
//   2. text

/**
 * Definition of a text or symbol equation element. Symbol properties take
 * receive priority over text properties, so if 'symbol' is defined, then 'text'
 * will be ignored.
 * @property {string} [text] - Text element only
 * @property {DiagramFont} [font] - Text element only
 * @property {'italic' | 'normal'} [style] - Text element only
 * @property {string} [symbol] - Symbol element only
 * @property {'top' | 'left' | 'bottom' | 'right'} [side] - Symbol element only
 * @property {object} [mods] - Properties to set on instantiated element
 * @property {Array<number>} [color] - Color to set the element
 */
type TypeEquationElement = string | {
    // Text only
    text?: string;
    font?: DiagramFont;
    style?: 'italic' | 'normal' | null;
    // Symbol Only
    symbol?: string;
    numLines?: number;
    side?: 'top' | 'left' | 'bottom' | 'right';
    // Both Text and Symbol
    color?: Array<number>;
    mods?: {};
  } | DiagramElementPrimitive | DiagramElementCollection;

/**
 * Object with multiple equation elements.
 */
export type TypeEquationElements = {
  [elementName: string]: TypeEquationElement;
};

// type TypeFormAlignment = {
//   fixTo?: Point | string,
//   xAlign?: TypeHAlign | null,
//   yAlign?: TypeVAlign | null,
// };

/**
 * Defines how to align a form
 */
type TypeFormAlignment = {
  fixTo: DiagramElementPrimitive | DiagramElementCollection | Point;
  xAlign: TypeHAlign;
  yAlign: TypeVAlign;
};

/**
 * Form translation properties
 *
 * @property {'curved' | 'linear'} style - element should move in a straight
 * line, or through a curve. Default: `"linear"`
 * @property {'up' | 'down'} [direction] - curve only - element should move
 * through an up or down curve
 * @property {number} [mag] - the magnitude of the curve
 */
type TypeFormTranslationProperties = {
  style: 'curved' | 'linear',
  direction?: 'up' | 'down',
  mag: number,
};

/**
 * Duration and translation options for form animation
 *
 * @property {number} [duration] in seconds
 * @property {Object.<TypeFormTranslationProperties>} [translation]
 * @example
 * // for an equation with two of its elements named 'a' and 'b'
 * {
 *   duration: 1,
 *   translation: {
 *     a: {
 *       direction: 'up',
 *       style: 'curved',
 *       mag: 0.5,
 *     },
 *     b: {
 *       direction: 'down',
 *       style: 'curved',
 *       mag: 0.2,
 *     },
 *   },
 * }
 * // Note, not all elements need to be defined - only those that need a custom
 * duration or shouldn't have a linear path
 */
type TypeFormAnimationProperties = {
  duration?: ?number,
  translation?: {
    [elementName: string]: TypeFormTranslationProperties,
  },
}

// A form is a steady state arrangement of elements
// A form's elements can have different properties, but these properties
// are generally the same independent on which form was shown before the
// current form.
// The only exception is the translation movement properties, which can be
// different depending on whether you are going to the current form from
// the previous one, or two the next one.

/**
 * In mathematics, an equation form is a specific arrangement of an equation's
 * terms and operators. Different forms will have different arrangements, that
 * that can be achieved by performing a series of operations to both sides of
 * the equation.
 *
 * For instance, the equation:
 *
 * a + b = c
 *
 * can be rearranged to a different form:
 *
 * a = c - b
 *
 * From the diagram's perspective, a form is a specific layout of equation
 * elements.
 *
 * This object defines a how the elements are laid out, what properties the
 * elements have, and some animation properties for when animating to this form.
 *
 * In the {@link Equation} object, forms are defined with form names, and
 * subForm names. Most of the time, the subForm name can be ignored.
 * However, it is useful when dealing with units. Sometimes you will have a
 * series of forms you want to animate through, that will be slightly different
 * depending on the units (for example degrees vs radians). Defining one subForm
 * as degrees, and a second as radians allows switching between subForms without
 * complicating the overall equation navigation logic.
 *
 * See the examples below for how to define subForms.
 *
 * {@link Equation#addForms}.
 *
 * @property {TypeEquationPhrase} content - the equation phrase of the form
 * defines how the elements are laid out
 * @property {number} [scale] - a scaling factor for this form
 * @property {TypeFormAlignment} [alignment] - how the Equation's position is aligned with
 * this form
 * @property {string} [subForm] - subForm name - default: `"base"`
 * @property {string} [description] - a description associated with this form -
 * used in equation navigator elements (@EquationNavigator)
 * @property {object} [modifiers] - string modifiers for the description
 * @property {TypeFormAnimationProperties} [fromPrev] - form animation
 * properties if animating forward from the previous form in a formSeries
 * @property {TypeFormAnimationProperties} [fromNext] - form animation
 * properties if animating backward from the next form in a formSeries
 * @property {TypeFormAnimationProperties} [duration] - animation move duration
 *  (fromNext and fromPrev are prioritized over this)
 * @property {TypeFormTranslationProperties} [translation] - animation move
 * style (fromNext and fromPrev are prioritized over this)
 * @property {object} [elementMods] - properties to set in the equation element
 * (@DiagramElementPrimitive) when this form is shown
 *
 * @example
 * // Simple form definition of two different forms of the same equation and one
 * // of the elements is colored blue in one form and red in the other
 * forms: {
 *   form1: {
 *     content: ['a', 'plus', 'b', 'equals', 'c'],
 *     elementMods: {
 *       'a': { color: [0, 0, 1, 1] },
 *     }
 *   },
 *   form2: {
 *     content: ['a', 'equals', 'c', 'minus', 'b'],
 *     elementMods: {
 *       'a': { color: [1, 0, 0, 1] },
 *     }
 *   },
 * }
 *
 * @example
 * // Example using subForms all defined at once
 * forms: {
 *   form1: {
 *     deg: ['a', 'deg'],
 *     rad: ['a', 'rad'],
 *   },
 * }
 *
 * @example
 * // Example using subForms all defined separately
 * const eqn = new Equation();
 * eqn.addForms({
 *   deg: {
 *     content: ['a', 'deg'],
 *     subForm:'deg',
 *   }
 * });
 * eqn.addForms({
 *   rad: {
 *     content: ['a', 'rad'],
 *     subForm:'rad',
 *   }
 * });
 * @example
 * // Example showing all form options
 * forms: {
 *   form1: {
 *     content: ['a', 'b', 'c'],
 *     subForm: 'deg',
 *     scale: 1.2,
 *     alignment: {
 *       fixTo: 'b',
 *       xAlign: 'center',
 *       yAlign: 'bottom',
 *     },
 *     description: '|Form| 1 |description|',
 *     modifiers: {
 *       Form: html.highlight([1, 0, 0, 0]),
 *     },
 *     elementMods: {
 *       a: {
 *         color: color1,
 *         isTouchable: true,
 *       },
 *     },
 *     duration: 1,
 *     translation: {
 *       a: {
 *         style: 'curved',
 *         direction: 'up',
 *         mag: 0.95,
 *       },
 *       b: ['curved', 'down', 0.45],
 *     },
 *     fromPrev: {
 *       duration: null,
 *       translation: {
 *         a: ['curved', 'down', 0.2],
 *         b: ['curved', 'down', 0.2],
 *       },
 *     },
 *     fromNext: {
 *       duration: 2,
 *       translation: {
 *         a: ['curved', 'down', 0.2],
 *         b: ['curved', 'down', 0.2],
 *       },
 *     },
 *   },
 * }
 */
type TypeEquationFormObject = {
  content: TypeEquationPhrase,
  scale?: number,
  alignment?: TypeFormAlignment,
  subForm?: string,
  description?: string,           // For equation navigation
  modifiers?: {},                 // Modifiers for description
  // First Priority
  fromPrev?: TypeFormAnimationProperties,
  fromNext?: TypeFormAnimationProperties,
  // Last Priority
  duration?: ?number,               // null means to use velocity
  translation?: TypeFormTranslationProperties,
  elementMods?: {
    [elementName: string]: Object
  },
};

/**
 * A single form definition can either be:
 *
 * * an equation phrase {@link TypeEquationPhrase}
 * * or an equation form object {@link TypeEquationFormObject}
 * * or an object of subforms:
 *
 *    {
 *       subform1: ({@link TypeEquationPhrase} | {@link TypeEquationFormObject}),
 *       subform2: ...
 *    },
 *
 * @type {TypeEquationPhrase | TypeEquationFormObject |
 *   Object.<TypeEquationFormObject | TypeEquationPhrase>}
 */
type TypeEquationForm = TypeEquationPhrase
                        | TypeEquationFormObject
                        | {
                          [subFormName: string]: TypeEquationFormObject
                                                 | TypeEquationPhrase;
                        };

/**
 * An object of equation forms where each key is the form name and each value
 * is a form defintion {@link TypeEquationForm}
 *
 * @type {Object.<TypeEquationForm>}
 */
export type TypeEquationForms = {
  [formName: string]: TypeEquationForm
};

/**
 * When an equation form series is restarted, or cycled back to the first form
 * in the series, then two special animations can be defined with this object:
 * * `moveFrom`: the equation will move from a location (usually another equation of the same form)
 * * `pulse`: An element will be pulsed when the animation is finished.
 *
 * The default values in the pulse object are are:
 * * `duration`: 1s
 * * `scale`: 1.1
 */
type TypeFormRestart = {
  formRestart?: {
    moveFrom?: ?Point | DiagramElementCollection;
    pulse?: {
      duration?: number;
      scale?: number;
      element?: ?DiagramElement;
    }
  }
}

/**
 * Options objects to construct an {@link Equation} class. All properties are optional.
 *
 * @property {Array<number>} [color] - default: [0.5, 0.5, 0.5, 1]
 * @property {number} [scale] - default: 0.7
 * @property {TypeEquationElements} [elements] - default: {}
 * @property {TypeFormAlignment} [defaultFormAlignment] - default:
 * { fixTo: new {@link Point}(0, 0), xAlign: 'left', yAlign: 'baseline}
 * @property {TypeEquationForms} [forms] - default: {}
 * @property {Array<string> | Object.<Array<string>>} [formSeries] - an object
 * with each key being a form series name, and each value an array for form
 * names. If defined as an array, then a form series object is created where
 * the form series name is 'base'. Default: {}
 * @property {string} [defaultFormSeries] - If more than one form series is
 * defined, then a default must be chosen to be the first current one. Default:
 * first form defined
 * @property {TypeFormRestart} [formRestart] - default: null
 * @property {DiagramFont} [fontMath] - default {@link DiagramFont}('Times
 * New Roman', 'normal', 0.2, '200', 'left', 'alphabetic', color)
 * @property {Point} [position] - default: new {@link Point}(0, 0)
 */
export type EQN_Equation = {
  color?: Array<number>;
  scale?: number,
  elements?: TypeEquationElements;
  defaultFormAlignment?: TypeFormAlignment;
  forms?: TypeEquationForms;
  formSeries?: Array<string> | {};
  defaultFormSeries?: string;
  formRestart?: TypeFormRestart;
  fontMath?: DiagramFont;
  position?: Point;
};

/**
 * Options object for {@link Equation#goToForm}.
 *
 * Often, `goToForm` is called to animate from a shown form to a desired form.
 * Therefore there will be some equation elements that:
 * * Are currently shown, but need to be hidden as they are not in the desired form
 * * Are currently shown, are in the desired form, and need to be moved to the
 *   correct layout position for the desired form
 * * Are currently hidden and need to be shown in the desired form
 *
 * The order that elements are shown, hidden and moved is defined by the
 * `animate` property:
 * * `'move'`: Dissolve out elements to hide, move existing elements to new,
 * dissolve in elements that need to be shown
 * * `'dissolveInThenMove'`: Dissolve out the elements to hide, dissolve in the
 * elements that need to be shown in the correct locations of the form, then
 * move existing elements to their correct locations
 * * `'dissolve'`: Dissolve out the entire current form, and then dissolve in the entire new form
 * * `'moveFrom'`: Shows the desired form at the position defined in the
 * formRestart property of {@link EQN_Equation}, then moves it to the
 * current location
 * * `'pulse'`: Same as `'dissolve'`, but once finished will pulse the element
 *  defined in the pulse object in the formRestart property of {@link EQN_Equation}
 *
 * If a form is already animating, then the `ifAnimating` property will define
 * the behavior of the animation:
 * * `cancelGoTo: true`, `skipToTarget: true`: Current animation will skip to
 *   the end, and current goTo call will be cancelled
 * * `cancelGoTo: true`, `skipToTarget: false`: Current animation will stop in
 *   its current state, and current goTo call will be cancelled
 * * `cancelGoTo: false`, `skipToTarget: true`: Current animation will skip to
 *   the end, and current goTo call will then be executed
 * * `cancelGoTo: false`, `skipToTarget: false`: Current animation will stop in
 *   its current state, and current goTo call will be executed
 *
 * @property {string} [name] - form name to goto
 * @property {number} [index] - form index to goto (can be used instead of name)
 * @property {'move' | 'dissolve' | 'moveFrom' | 'pulse' |
 *  'dissolveInThenMove'} [animate] - default: `"dissolve"`
 * @property {number} [delay] - delay before goto start. Default: `0`
 * @property {number} [dissolveOutTime] - Default: 0.4 of duration, or 0.4s if
 * no duration
 * @property {number} [duration] - animation duration. Default: `null`
 * @property {number} [blankTime] - time between dissolve out and dissolve in
 * when animating with `dissolve` or `pulse`. Default: 0.2 of duration, or 0.2s
 * if no duration
 * @property {number} [dissolveInTime] - Default: 0.4 of duration, or 0.4s if
 * no duration
 * @property {boolean} [prioritizeFormDuration] - use duration from the form
 * definition {@link TypeEquationFormObject}. Default: `true`
 * @property {'fromPrev' | 'fromNext'} [fromWhere] - prioritze *fromPrev* or
 * *fromNext* duration from the form definition. {@link TypeEquationFormObject}
 * Default: `null`
 * @property {{cancelGoTo?: boolean, skipToTarget?: boolean}} [ifAnimating] -
 * behavior for if currently animating between forms. Default:
 * `skipToTarget: true`, `cancelGoTo: true`
 * @property {?() => void} [callback] - call when goto finished
 */
type TypeEquationGoToFormOptions = {
  name?: string,
  index?: number,
  animate?: 'move' | 'dissolve' | 'moveFrom' | 'pulse' | 'dissolveInThenMove',
  delay?: number,
  dissolveOutTime?: number,
  duration?: ?number,
  dissolveInTime?: number,
  blankTime?: number,
  prioritizeFormDuration?: boolean,
  fromWhere?: ?'fromPrev' | 'fromNext',
  ifAnimating?: {
    cancelGoTo?: boolean;
    skipToTarget?: boolean;
  },
  callback?: ?(string | (() => void)),
}

// export const foo = () => {};
// An Equation is a collection of elements that can be arranged into different
// forms.
// Equation allows setting of forms, and navigating through form series
// Eqn manages different forms of the

/**
 * An Equation is a collection of elements that can be arranged into different
 * forms.
 * @param {EQN_Equation} options
 * @example
 * // Create with options object
 * eqn = new Equation({
 *    elements: {
 *      a: 'a',
 *      b: 'b',
 *      c: 'c',
 *      equals: ' = ',
 *      plus: ' + ',
 *    },
 *    forms: {
 *      base: ['a', 'equals', 'b', 'plus', 'c'],
 *    },
 * );
 * @example
 * // Create with methods
 * eqn = new Equation();
 * eqn.addElements({
 *    a: 'a',
 *    b: 'b',
 *    c: 'c',
 *    equals: ' = ',
 *    plus: ' + ',
 *  });
 *  eqn.addForms({
 *    base: ['a', 'equals', 'b', 'plus', 'c'],
 *  });
 */
export class Equation extends DiagramElementCollection {
  /**
   * Equation parameters and functions
   * @property {EquationFunctions} functions - equation functions
   */
  eqn: {
    forms: { [formName: string]: {
        base: EquationForm;                   // There is always a base form
        [subFormName: string]: EquationForm;  // Sub forms may differ in units
        name: string;                         // Name of form
      }
    };
    functions: EquationFunctions;
    symbols: EquationSymbols;
    currentForm: string;
    currentSubForm: string;
    fontMath: DiagramFont;
    // fontText: DiagramFont;
    scale: number;

    subFormPriority: Array<string>,

    // formSeries: { [seriesName: String]: Array<EquationForm> };
    formSeries: { [string]: Array<string> };
    currentFormSeries: Array<string>;
    currentFormSeriesName: string;

    //
    defaultFormAlignment: {
      fixTo: DiagramElementPrimitive | DiagramElementCollection | Point;
      xAlign: TypeHAlign;
      yAlign: TypeVAlign;
    };

    isAnimating: boolean;

    descriptionElement: DiagramElementPrimitive | null;
    descriptionPosition: Point;

    formRestart: ?{
      moveFrom?: Point | DiagramElementCollection;
      pulse?: {
        duration: number;
        scale: number;
        element: DiagramElement;
      }
    }
    // formRestartPosition: ?Point | DiagramElementCollection;
    // formRestartAnimation: 'dissolve' | 'moveFrom' | 'pulse';
  };

  // isTouchDevice: boolean;
  // animateNextFrame: void => void;
  shapes: Object;

  getCurrentForm: () => ?EquationForm;

  constructor(
    shapes: Object,
    options: EQN_Equation = {},
  ) {
    let { color } = options;
    if (color == null) {
      color = [0.5, 0.5, 0.5, 1];
    }
    const defaultOptions = {
      color,
      fontMath: new DiagramFont(
        'Times New Roman',
        'normal',
        0.2, '200', 'left', 'alphabetic', color,
      ),
      position: new Point(0, 0),
      scale: 0.7,
      defaultFormAlignment: {
        fixTo: new Point(0, 0),
        xAlign: 'left',
        yAlign: 'baseline',
      },
      elements: {},
      forms: {},
      formSeries: {},
      formRestart: null,
    };

    const optionsToUse = joinObjects({}, defaultOptions, options);
    optionsToUse.position = parsePoint(
      optionsToUse.position, new Point(0, 0),
    );
    optionsToUse.defaultFormAlignment.fixTo = parsePoint(
      optionsToUse.defaultFormAlignment.fixTo,
      optionsToUse.defaultFormAlignment.fixTo,
    );
    if (optionsToUse.formRestart != null
      && optionsToUse.formRestart.pulse != null) {
      optionsToUse.formRestart.pulse = joinObjects({}, {
        scale: 1.1,
        duration: 1,
      }, optionsToUse.formRestart.pulse);
    }

    super(new Transform('Equation')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.setColor(optionsToUse.color);
    // this.isTouchDevice = isTouchDevice;
    // this.animateNextFrame = animateNextFrame;

    // Set default values
    this.eqn = {
      forms: {},
      currentForm: '',
      currentSubForm: '',
      subFormPriority: ['base'],
      formSeries: { base: [] },
      currentFormSeries: [],
      currentFormSeriesName: '',
      scale: optionsToUse.scale,
      defaultFormAlignment: optionsToUse.defaultFormAlignment,
      functions: new EquationFunctions(
        this.elements,
        this.addElementFromKey.bind(this),
        this.getExistingOrAddSymbol.bind(this),
      ),
      symbols: new EquationSymbols(this.shapes, this.color),
      fontMath: optionsToUse.fontMath,
      // fontText: optionsToUse.fontText,
      isAnimating: false,
      descriptionElement: null,
      descriptionPosition: new Point(0, 0),
      formRestart: optionsToUse.formRestart,
    };

    this.setPosition(optionsToUse.position);

    if (optionsToUse.elements != null) {
      this.addElements(optionsToUse.elements);
    }

    if (optionsToUse.forms != null) {
      this.addForms(optionsToUse.forms);
    }

    if (optionsToUse.formSeries != null) {
      if (Array.isArray(optionsToUse.formSeries)) {
        this.eqn.formSeries = { base: optionsToUse.formSeries };
        this.eqn.currentFormSeries = this.eqn.formSeries.base;
        this.eqn.currentFormSeriesName = 'base';
      } else {
        this.eqn.formSeries = optionsToUse.formSeries;
        if (optionsToUse.defaultFormSeries != null) {
          this.setFormSeries(optionsToUse.defaultFormSeries);
        } else {
          this.setFormSeries(Object.keys(this.eqn.formSeries)[0]);
        }
      }
    }
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'eqn.currentForm',
      'eqn.currentSubForm',
      'eqn.isAnimating',
      'eqn.currentFormSeries',
      'eqn.currentFormSeriesName',
    ];
  }

  _getStatePropertiesMin() {
    return [
      ...super._getStatePropertiesMin(),
      'eqn.currentForm',
      'eqn.currentSubForm',
    ];
  }

  // animateToState(
  //   state: Object,
  //   options: Object,
  //   independentOnly: boolean = false,
  //   // countStart: () => void,
  //   // countEnd: () => void,
  // ) {
  //   super.animateToState(state, options, independentOnly);
  //   if (this.eqn.currentForm !== state.eqn.currentForm) {
  //     // countStart();
  //     this.goToForm({ name: state.eqn.currentForm, callback: countEnd });
  //   }
  // }

  /**
    * Set the current form series to 'name'
   */
  setFormSeries(name: string) {
    if (this.eqn.formSeries[name] != null) {
      this.eqn.currentFormSeries = this.eqn.formSeries[name];
      this.eqn.currentFormSeriesName = name;
    }
  }

  /**
    * Get the current form series name
   */
  getFormSeries(): string {
    return this.eqn.currentFormSeriesName;
  }

  makeTextElem(
    options: {
      text?: string,
      font?: DiagramFont,
      style?: 'italic' | 'normal',
      weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      scale?: number,
      size?: number,
      color?: Array<number>
    },
    defaultText: string = '',
  ) {
    let textToUse = defaultText;
    if (options.text != null) {
      textToUse = options.text;
    }
    let fontToUse: DiagramFont = this.eqn.fontMath;
    // if (textToUse.match(/[A-Z,a-z,\u03B8]/)) {
    //   fontToUse = this.eqn.fontText;
    // }
    let style;
    let weight;
    let scale;
    let size;
    if (options.style != null) {
      ({ style } = options);
    } else if (textToUse.match(/[A-Z,a-z,\u03B8]/)) {
      style = 'italic';
    }
    if (options.weight != null) {
      ({ weight } = options);
    }
    if (options.scale != null) {
      ({ scale } = options);
      size = scale * 0.2;
    }
    if (options.size != null) {
      ({ size } = options);
    }
    if (style != null || weight != null || size != null) {
      fontToUse = new DiagramFont(
        'Times New Roman',
        style || 'normal',
        size || 0.2,
        weight || '200',
        'left', 'alphabetic', this.color,
      );
    }
    if (options.font != null) {
      fontToUse = options.font;
    }
    const p = this.shapes.text(
      textToUse,
      { position: new Point(0, 0), font: fontToUse },
    );
    if (options.color != null) {
      p.setColor(options.color);
    } else {
      p.setColor(p.drawingObject.text[0].font.color);
    }
    return p;
  }

  // eslint-disable-next-line class-methods-use-this
  getTextFromKey(key: string) {
    return key.replace(/^_*/, '').replace(/_.*/, '');
  }

  getExistingOrAddSymbol(symbol: string | Object) {
    if (typeof symbol === 'string') {
      return this.getExistingOrAddSymbolFromKey(symbol, {});
    }
    const [key, params] = Object.entries(symbol)[0];  // $FlowFixMe
    return this.getExistingOrAddSymbolFromKey(key, params);
  }

  // 'text'
  // 'text_id'
  // 'id_symbol'
  // 'id_id_symbol'
  // 'symbol'
  getExistingOrAddSymbolFromKey(key: string, options: Object = {}) {
    const existingElement = this.getElement(key);
    if (existingElement != null) {
      return existingElement;
    }

    // Check the key is a symbol
    const cleanKey = key.replace(/^_*/, '');
    let symbol = this.eqn.symbols.get(cleanKey, options);
    if (symbol != null) {
      symbol.setColor(this.color);
      this.add(key, symbol);
      return symbol;
    }
    const ending = cleanKey.match(/_[^_]*$/);
    if (ending != null) {
      symbol = this.eqn.symbols.get(ending[0].replace(/_/, ''), options);
      if (symbol != null) {
        symbol.setColor(this.color);
        this.add(key.replace(/_[^_]*$/, ''), symbol);
        return symbol;
      }
    }
    return null;
  }

  addElementFromKey(key: string, options: Object = {}) {
    let element = this.getExistingOrAddSymbolFromKey(key, options);
    if (element != null) {
      return element;
    }
    const cleanKey = key.replace(/^_*/, '');
    const text = cleanKey.replace(/_.*/, '');
    element = this.makeTextElem(joinObjects({ text }, options));
    this.add(key, element);
    return element;
  }

  // addElementFromObject(key: string, options: Object) {
  //   if (typeof key !== 'string') {
  //     return null;
  //   }
  //   const existingElement = this.getElement(key);
  //   if (existingElement != null) {
  //     return existingElement;
  //   }
  //   const text = this.getTextFromKey(key);
  //   const element = this.makeTextElem({ text });
  //   this.add(key, element);
  //   return element;
  // }

  makeSymbolElem(
    options: {
      symbol: string
    } & TypeSymbolOptions,
  ) {
    let symbol = this.eqn.symbols.get(options.symbol, options);
    // console.log('got', symbol)
    if (symbol == null) {
      symbol = this.makeTextElem({
        text: `Symbol ${options.symbol} not valid`,
      });
    }
    if (options.color == null) {
      symbol.setColor(this.color);
    }
    return symbol;
  }

  /**
   * Add elements to equation.
   */
  addElements(
    elems: TypeEquationElements,
  ) {
    // Go through each element and add it
    Object.keys(elems).forEach((key) => {
      // const [key, elem] = entry;
      const elem = elems[key];
      if (typeof elem === 'string') {
        if (!(key.startsWith('space') && key.startsWith(' '))) {
          this.add(key, this.makeTextElem({ text: elem }));
        }
      } else if (elem instanceof DiagramElementPrimitive) {
        this.add(key, elem);
      } else if (elem instanceof DiagramElementCollection) {
        this.add(key, elem);
      } else {
        let diagramElem;
        if (elem.symbol != null && typeof elem.symbol === 'string') {
          // console.log(elem.symbol)
          // $FlowFixMe
          diagramElem = this.makeSymbolElem(elem);
        } else {
          // $FlowFixMe
          diagramElem = this.makeTextElem(elem, this.getTextFromKey(key));
        }
        if (diagramElem != null) {
          if (elem.mods != null) {
            diagramElem.setProperties(elem.mods);
          }
          this.add(key, diagramElem);
        }
      }
    });

    const fullLineHeightPrimitive = this.makeTextElem({ text: 'gh' });
    const form = this.createForm({ elem: fullLineHeightPrimitive });
    form.content = [this.eqn.functions.contentToElement(fullLineHeightPrimitive)];
    form.arrange(
      this.eqn.scale,
      'left',
      'baseline',
      new Point(0, 0),
    );
    this.eqn.functions.fullLineHeight = form;

    this.setFirstTransform(this.transform);
  }

  addDescriptionElement(
    descriptionElement: DiagramElementPrimitive | null = null,
    descriptionPosition: Point = new Point(0, 0),
  ) {
    this.eqn.descriptionElement = descriptionElement;
    this.eqn.descriptionPosition = descriptionPosition;
    if (this.eqn.descriptionElement) {
      this.eqn.descriptionElement
        .setPosition(this.getPosition('diagram')
          .add(descriptionPosition));
    }
  }

  setPosition(pointOrX: Point | number, y: number = 0) {
    super.setPosition(pointOrX, y);
    const position = this.getPosition('diagram');
    // console.log(this.eqn, this.eqn.descriptionElement)
    if (this.eqn.descriptionElement != null) {
      this.eqn.descriptionElement.setPosition(position.add(this.eqn.descriptionPosition));
    }
  }

  // scaleForm(name: string, scale: number, subForm: string = 'base') {
  //   // console.log(name, this.form, formType, this.form[name][formType])
  //   if (name in this.eqn.forms) {
  //     if (subForm in this.eqn.forms[name]) {
  //       this.eqn.forms[name][subForm].arrange(
  //         scale,
  //         this.eqn.formAlignment.xAlign,
  //         this.eqn.formAlignment.yAlign,
  //         this.eqn.formAlignment.fixTo,
  //       );
  //     }
  //   }
  // }

  // scale(scale: number) {
  //   Object.keys(this.form).forEach((name) => {
  //     Object.keys(this.form[name]).forEach((formType) => {
  //       if (formType !== 'name') {
  //         this.scaleForm(name, scale, formType);
  //       }
  //     });
  //   });
  // }

  addPhrases(phrases: { [phraseName: string]: TypeEquationPhrase }) {
    Object.keys(phrases).forEach((phraseName) => {
      const phrase = phrases[phraseName];
      this.eqn.functions.phrases[phraseName] = phrase;
    });
  }

  /**
   * Add forms to equation.
   */
  addForms(forms: TypeEquationForms) {
    const isFormString = form => typeof form === 'string';
    const isFormArray = form => Array.isArray(form);
    const isFormMethodDefinition = (form) => {
      if (isFormString(form) || isFormArray(form)) {
        return false;
      }
      if (form != null && typeof form === 'object') {
        // $FlowFixMe
        const keys = Object.keys(form);
        if (keys.length === 1 && keys[0] in this.eqn.functions) {
          return true;
        }
      }
      return false;
    };
    // eslint-disable-next-line max-len
    const isFormElements = form => (form instanceof Elements || form instanceof BaseAnnotationFunction);
    const isFormFullObject = (form) => {
      if (isFormString(form) || isFormArray(form)
        || isFormMethodDefinition(form) || isFormElements(form)
      ) {
        return false;
      }
      if (form != null && typeof form === 'object' && form.content != null) {
        return true;
      }
      return false;
    };
    const addFormNormal = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form)];
      this.addForm(name, formContent);
    };
    const addFormFullObject = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form.content)];
      const {   // $FlowFixMe
        subForm, elementMods, duration, alignment, scale, // $FlowFixMe
        description, modifiers, fromPrev, fromNext, translation, // $FlowFixMe
        fromForm,
      } = form;
      const options = {
        subForm,
        // addToSeries,
        elementMods,
        duration,
        translation,
        alignment,
        scale,
        description,
        modifiers,
        fromPrev,
        fromNext,
        fromForm,
      };
      // $FlowFixMe
      this.addForm(name, formContent, options);
    };

    Object.keys(forms).forEach((name) => {
      const form: TypeEquationForm = forms[name];
      if (isFormString(form) || isFormArray(form)
        || isFormMethodDefinition(form) || isFormElements(form)
      ) {
        addFormNormal(name, form);
      } else if (isFormFullObject(form)) {
        addFormFullObject(name, form);
      } else {
        Object.entries(form).forEach((subFormEntry) => {
          const [subFormName: string, subFormValue] = subFormEntry;
          // const subFormOption = { subForm: subFormName };
          if (isFormString(subFormValue) || isFormArray(subFormValue)
            || isFormMethodDefinition(subFormValue) || isFormElements(subFormValue)
          ) { // $FlowFixMe
            addFormFullObject(name, { content: subFormValue, subForm: subFormName });
          } else {
            // $FlowFixMe
            addFormFullObject(name, joinObjects(subFormValue, { subForm: subFormName }));
          }
        });
      }
    });
  }

  checkFixTo(
    fixTo: DiagramElementCollection
          | DiagramElementPrimitive
          | string | Point | null,
  ): DiagramElementPrimitive | DiagramElementCollection | Point {
    if (typeof fixTo === 'string') {
      const element = getDiagramElement(this, fixTo);
      if (element != null) {
        return element;
      }
      return new Point(0, 0);
    }
    if (fixTo instanceof DiagramElementPrimitive
      || fixTo instanceof DiagramElementCollection
      || fixTo instanceof Point
    ) {
      return fixTo;
    }
    return new Point(0, 0);
  }

  createForm(
    elements: { [elementName: string]: DiagramElementPrimitive |
                                       DiagramElementCollection }
    = this.elements,
  ) {
    return new EquationForm(
      elements,
      {
        getAllElements: this.getChildren.bind(this),
        hideAll: this.hideAll.bind(this),
        show: this.show.bind(this),
        showOnly: this.showOnly.bind(this),
        stop: this.stop.bind(this),
        getElementTransforms: this.getElementTransforms.bind(this),
        setElementTransforms: this.setElementTransforms.bind(this),
        animateToTransforms: this.animateToTransforms.bind(this),
      },
    );
  }

  addForm(
    name: string,
    content: Array<ElementInterface>,
    options: {
      subForm?: string,
      scale?: number,
      alignment?: TypeFormAlignment,
      description?: string,
      modifiers?: Object,
      // First Priority
      fromForm?: {
        [formName: string]: {
          duration?: ?number,
          translation?: {
            [elementName: string]: {
              direction?: 'up' | 'down',
              style: 'curved' | 'linear',
              mag: number,
            } | ['curved' | 'linear', 'up' | 'down', number],
          },
        },
      },
      fromPrev?: {
        duration?: ?number,
        translation?: {
          [elementName: string]: {
            direction?: 'up' | 'down',
            style: 'curved' | 'linear',
            mag: number,
          } | ['curved' | 'linear', 'up' | 'down', number],
        },
      },
      fromNext?: {
        duration?: ?number,
        translation?: {
          [elementName: string]: {
            direction?: 'up' | 'down',
            style: 'curved' | 'linear',
            mag: number,
          } | ['curved' | 'linear', 'up' | 'down', number],
        },
      },
      // Last Priority
      duration?: ?number,               // null means to use velocity
      translation?: {
        [elementName: string]: {
          direction?: 'up' | 'down',
          style: 'curved' | 'linear',
          mag: number,
        } | ['curved' | 'linear', 'up' | 'down', number],
      },
      elementMods?: {
        [elementName: string]: Object
      },
    } = {},
  ) {
    if (!(name in this.eqn.forms)) {
      // $FlowFixMe   - its ok for this to start undefined, it will be filled.
      this.eqn.forms[name] = {};
    }
    const defaultOptions = {
      subForm: 'base',
      elementMods: {},
      duration: undefined,
      // duration: null,                // use velocities instead of time
      description: '',
      modifiers: {},
      scale: this.eqn.scale,
      alignment: this.eqn.defaultFormAlignment,
      translation: {},
      fromNext: undefined,
      fromPrev: undefined,
      fromForm: {},
    };
    let optionsToUse = defaultOptions;
    if (options) {
      optionsToUse = joinObjects({}, defaultOptions, options);
    }
    const {
      subForm, description, modifiers, duration,
    } = optionsToUse;
    this.eqn.forms[name].name = name;
    const form = this.eqn.forms[name];
    form[subForm] = this.createForm();
    form[subForm].description = description;
    form[subForm].modifiers = modifiers;
    form[subForm].name = name;
    form[subForm].subForm = subForm;
    form[subForm].duration = duration;

    // Populate element mods
    form[subForm].elementMods = {};
    Object.keys(optionsToUse.elementMods).forEach((elementName) => {
      const mods = optionsToUse.elementMods[elementName];
      const diagramElement = getDiagramElement(this, elementName);
      if (diagramElement != null) {
        form[subForm].elementMods[elementName] = { element: diagramElement, mods };
      }
    });

    const getTranslation = (elementName, modOptions) => {
      const diagramElement = getDiagramElement(this, elementName);
      const mods = modOptions[elementName];
      let direction;
      let style;
      let mag;
      if (Array.isArray(mods)) {
        [style, direction, mag] = mods;
      } else {
        ({ style, direction, mag } = mods);
      }
      if (diagramElement != null) {
        return {
          element: diagramElement, style, direction, mag,
        };
      }
      return null;
    };
    // Populate translation mods
    form[subForm].translation = {};
    Object.keys(optionsToUse.translation).forEach((elementName) => {
      const translation = getTranslation(elementName, optionsToUse.translation);
      if (translation != null) {
        form[subForm].translation[elementName] = translation;
      }
    });

    // Populate translation mods
    const { fromPrev } = optionsToUse;
    if (fromPrev != null) {
      form[subForm].fromPrev = {};
      if (fromPrev.duration !== undefined) {
        form[subForm].fromPrev.duration = fromPrev.duration;
      }
      form[subForm].fromPrev.translation = {};
      if (fromPrev.translation != null) {
        Object.keys(fromPrev.translation).forEach((elementName) => {
          // const mods = fromPrev.translation[elementName];
          // const diagramElement = getDiagramElement(this, elementName);
          // let direction;
          // let style;
          // let mag;
          // if (Array.isArray(mods)) {
          //   [style, direction, mag] = mods;
          // } else {
          //   ({ style, direction, mag } = mods);
          // }
          // if (diagramElement != null) {
          //   // $FlowFixMe
          //   form[subForm].fromPrev.translation[elementName] = {
          //     element: diagramElement, style, direction, mag,
          //   };
          // }
          const translation = getTranslation(elementName, fromPrev.translation);
          if (translation != null) {
            form[subForm].fromPrev.translation[elementName] = translation;
          }
        });
      }
    }

    // Populate translation mods
    const { fromNext } = optionsToUse;
    if (fromNext != null) {
      form[subForm].fromNext = {};
      if (fromNext.duration !== undefined) {
        form[subForm].fromNext.duration = fromNext.duration;
      }
      form[subForm].fromNext.translation = {};
      if (fromNext.translation != null) {
        Object.keys(fromNext.translation).forEach((elementName) => {
          // const mods = fromNext.translation[elementName];
          // const diagramElement = getDiagramElement(this, elementName);
          // let direction;
          // let style;
          // let mag;
          // if (Array.isArray(mods)) {
          //   [style, direction, mag] = mods;
          // } else {
          //   ({ style, direction, mag } = mods);
          // }
          // if (diagramElement != null) {
          //   // $FlowFixMe
          //   form[subForm].fromNext.translation[elementName] = {
          //     element: diagramElement, style, direction, mag,
          //   };
          // }
          const translation = getTranslation(elementName, fromNext.translation);
          if (translation != null) {
            form[subForm].fromNext.translation[elementName] = translation;
          }
        });
      }
    }

    optionsToUse.alignment.fixTo = this.checkFixTo(optionsToUse.alignment.fixTo);
    form[subForm].content = content;
    form[subForm].arrange(
      optionsToUse.scale,
      optionsToUse.alignment.xAlign,
      optionsToUse.alignment.yAlign,
      optionsToUse.alignment.fixTo,
    );
    // const { addToSeries } = optionsToUse;
    // console.log(addToSeries)
    // if (addToSeries != null && addToSeries !== '' && typeof addToSeries === 'string') {
    //   if (this.eqn.formSeries[addToSeries] == null) {
    //     this.eqn.formSeries[addToSeries] = [];
    //   }
    //   this.eqn.formSeries[addToSeries].push(form);
    // }
    // make the first form added also equal to the base form as always
    // need a base form for some functions
    if (this.eqn.forms[name].base === undefined) {
      const baseOptions = joinObjects({}, optionsToUse);
      baseOptions.subForm = 'base';
      this.addForm(name, content, baseOptions);
    }

    if (this.eqn.currentForm === '') {
      this.eqn.currentForm = name;
    }
    if (this.eqn.currentSubForm === '') {
      this.eqn.currentSubForm = 'base';
    }
  }

  /**
   * Get the current equation form
   */
  getCurrentForm(): ?EquationForm {
    if (this.eqn.forms[this.eqn.currentForm] == null) {
      return null;
    }
    if (this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm] == null) {
      return null;
    }
    return this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm];
  }

  render(animationStop: boolean = true) {
    const form = this.getCurrentForm();
    if (form != null) {
      form.setPositions();
      form.showHide(0, 0, null, animationStop);
      this.show();
      // form.setPositions();
      form.applyElementMods();
      // this.updateDescription();
    }
  }

  /**
   * Set current equation form - Note, this does not show the form.
   */
  setCurrentForm(
    formOrName: EquationForm | string,
    subForm: string = 'base',
  ) {
    if (typeof formOrName === 'string') {
      this.eqn.currentForm = '';
      this.eqn.currentSubForm = '';
      if (formOrName in this.eqn.forms) {
        this.eqn.currentForm = formOrName;
        if (subForm in this.eqn.forms[formOrName]) {
          this.eqn.currentSubForm = subForm;
        }
      }
    } else {
      this.eqn.currentForm = formOrName.name;
      this.eqn.currentSubForm = formOrName.subForm;
    }
  }

  /**
   * Show equation form
   */
  showForm(
    formOrName: EquationForm | string,
    subForm: ?string = null,
    animationStop: boolean = true,
  ) {
    this.show();
    let form = formOrName;
    if (typeof formOrName === 'string') {
      form = this.getForm(formOrName, subForm);
    }
    if (form) {
      this.setCurrentForm(form);
      this.render(animationStop);
    }
  }

  /**
   * Get an equation form object from a form name
   */
  getForm(
    formOrName: string | EquationForm,
    subForm: ?string,
  ): null | EquationForm {
    if (formOrName instanceof EquationForm) {
      return formOrName;
    }
    if (formOrName in this.eqn.forms) {
      let formTypeToUse = subForm;
      if (formTypeToUse == null) {
        const possibleFormTypes     // $FlowFixMe
          = this.eqn.subFormPriority.filter(fType => fType in this.eqn.forms[formOrName]);
        if (possibleFormTypes.length) {
          // eslint-disable-next-line prefer-destructuring
          formTypeToUse = possibleFormTypes[0];
        }
      }
      if (formTypeToUse != null) {
        return this.eqn.forms[formOrName][formTypeToUse];
      }
    }
    return null;
  }

  /**
   Start an animation to an equation form
   */
  goToForm(optionsIn: TypeEquationGoToFormOptions = {}) {
    const defaultOptions = {
      duration: null,
      prioritizeFormDuration: true,
      delay: 0,
      fromWhere: null,
      animate: 'dissolve',
      callback: null,
      ifAnimating: {
        skipToTarget: true,
        cancelGoTo: true,
      },
    };
    const options = joinObjects(defaultOptions, optionsIn);

    if (this.eqn.isAnimating) {
      if (options.ifAnimating.skipToTarget) {
        this.stop('complete');
        const currentForm = this.getCurrentForm();
        if (currentForm != null) {
          this.showForm(currentForm);
        }
      } else {
        this.stop('cancel');
      }
      this.eqn.isAnimating = false;
      if (options.ifAnimating.cancelGoTo) {
        return;
      }
    }
    // this.stop(true, true);
    // this.eqn.isAnimating = false;
    // Get the desired form - preference is name, then series index,
    // then next form in the current series
    let form;
    if (options.name != null) {
      form = this.eqn.forms[options.name];
    } else if (options.index != null) {
      form = this.eqn.forms[this.eqn.currentFormSeries[options.index]];
    } else if (this.eqn.currentFormSeries.length > 0) {
      let index = 0;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        index = this.eqn.currentFormSeries.indexOf(currentForm.name);
        if (index < 0) {
          index = 0;
        }
      }
      let formIndex = index + 1;
      if (formIndex === this.eqn.currentFormSeries.length) {
        formIndex = 0;
      }
      form = this.eqn.forms[this.eqn.currentFormSeries[formIndex]];
    }

    if (form == null) {
      return;
    }

    // const nextForm = this.eqn.forms[this.eqn.currentFormSeries[formIndex]];
    let subForm = null;
    let subFormToUse = null;
    const possibleSubForms        // $FlowFixMe - this is already checked above
          = this.eqn.subFormPriority.filter(sf => sf in form);
    if (possibleSubForms.length) {
      // eslint-disable-next-line prefer-destructuring
      subFormToUse = possibleSubForms[0];
    }
    if (subFormToUse != null) {
      subForm = form[subFormToUse];
      let { duration } = options;
      if (options.prioritizeFormDuration) {
        if (options.fromWhere === 'fromPrev' && subForm.fromPrev != null && subForm.fromPrev.duration !== undefined) {
          ({ duration } = subForm.fromPrev);
        } else if (options.fromWhere === 'fromNext' && subForm.fromNext != null && subForm.fromNext.duration !== undefined) {
          ({ duration } = subForm.fromNext);
        } else if (subForm.duration !== undefined) {
          ({ duration } = subForm);
        }
      }

      if (duration != null && duration > 0 && options.animate === 'dissolve') {
        if (options.dissolveOutTime == null) {
          options.dissolveOutTime = duration * 0.4;
        }
        if (options.dissolveInTime == null) {
          options.dissolveInTime = duration * 0.4;
        }
        if (options.blankTime == null) {
          options.blankTime = duration * 0.2;
        }
      } else {
        if (options.dissolveOutTime == null) {
          options.dissolveOutTime = 0.4;
        }
        if (options.dissolveInTime == null) {
          options.dissolveInTime = 0.4;
        }
        if (options.blankTime == null) {
          options.blankTime = 0.2;
        }
      }
      if (duration === 0) {
        this.showForm(subForm);
        this.fnMap.exec(options.callback);
        // if (options.callback != null) {
        //   options.callback();
        // }
      } else {
        this.eqn.isAnimating = true;
        const end = () => {
          this.eqn.isAnimating = false;
          this.fnMap.exec(options.callback);
          // if (options.callback != null) {
          //   options.callback();
          // }
        };
        if (options.animate === 'move') {
          // console.log('move', duration, options, subForm.duration)
          // console.log('******************* animate')
          subForm.animatePositionsTo(
            options.delay,
            options.dissolveOutTime,
            duration,
            options.dissolveInTime,
            end,
            options.fromWhere,
            false,
          );
        } else if (options.animate === 'dissolveInThenMove') {
          // console.log('move', duration, options, subForm.duration)
          // console.log('******************* animate')
          subForm.animatePositionsTo(
            options.delay,
            options.dissolveOutTime,
            duration,
            options.dissolveInTime,
            end,
            options.fromWhere,
            true,
          );
        } else if (
          options.animate === 'moveFrom'
          && this.eqn.formRestart != null
          && this.eqn.formRestart.moveFrom != null
        ) {
          const { moveFrom } = this.eqn.formRestart;
          const target = this.getPosition();
          let start = this.getPosition();
          if (moveFrom instanceof Equation) {
            moveFrom.showForm(subForm.name);
          }
          if (moveFrom instanceof DiagramElementCollection) {
            start = moveFrom.getPosition();
          } else {  // $FlowFixMe
            start = getPoint(this.eqn.formRestart.moveFrom);
          }
          const showFormCallback = () => {  // $FlowFixMe
            this.showForm(subForm.name, subFormToUse, false);
          };
          this.fnMap.add('_equationShowFormCallback', showFormCallback);
          this.animations.new()
            .dissolveOut({ duration: options.dissolveOutTime })
            .position({ target: start, duration: 0 })
            .trigger({
              callback: 'showFormCallback',
              duration: 0.01,
            })
            .position({ target, duration })
            .whenFinished(end)
            .start();
        } else if (
          options.animate === 'pulse'
          && this.eqn.formRestart != null
          && this.eqn.formRestart.pulse != null
        ) {
          const { pulse } = this.eqn.formRestart;
          const newEnd = () => {
            this.pulseScaleNow(pulse.duration, pulse.scale, 0, end);
            if (pulse.element != null
              && pulse.element instanceof Equation  // $FlowFixMe
              && pulse.element.getCurrentForm().name === subForm.name
            ) {
              pulse.element.pulseScaleNow(pulse.duration, pulse.scale);
            }
          };
          subForm.allHideShow(
            options.delay,
            options.dissolveOutTime,
            options.blankTime,
            options.dissolveInTime,
            newEnd,
          );
        } else {
          // console.log('******************* hideshow')
          subForm.allHideShow(
            options.delay,
            options.dissolveOutTime,
            options.blankTime,
            options.dissolveInTime,
            end,
          );
        }
        this.setCurrentForm(subForm);
      }
      // this.updateDescription();
    }
  }

  getFormIndex(formToGet: EquationForm | string) {
    const form = this.getForm(formToGet);
    let index = -1;
    if (form != null) {
      index = this.eqn.currentFormSeries.indexOf(form.name);
    }
    return index;
  }

  /**
   * Animate to previous form in the current form series
   */
  prevForm(duration: number | null = null, delay: number = 0) {
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index -= 1;
      if (index < 0) {
        index = this.eqn.currentFormSeries.length - 1;
      }
      this.goToForm({
        index, duration, delay, fromWhere: 'fromNext',
      });
    }
  }

  /**
   * Animate to next form in the current form series
   */
  nextForm(duration: number | null = null, delay: number = 0) {
    let animate = 'move';

    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index += 1;
      if (index > this.eqn.currentFormSeries.length - 1) {
        index = 0;
        const { formRestart } = this.eqn;
        if (formRestart != null && formRestart.moveFrom != null) {
          animate = 'moveFrom';
        } else if (formRestart != null && formRestart.pulse != null) {
          animate = 'pulse';
        } else {
          animate = 'dissolve';
        }
      }

      this.goToForm({
        index,
        duration,
        delay,
        fromWhere: 'fromPrev',
        animate,
      });
    }
  }

  /**
   * Start from previous form and animate to current form
   */
  replayCurrentForm(duration: number) {
    if (this.eqn.isAnimating) {
      // this.stop(true, true);
      this.stop('complete');
      // this.animations.cancel('complete');
      // this.animations.cancel('complete');
      this.eqn.isAnimating = false;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        this.showForm(currentForm);
      }
      return;
    }
    // this.animations.cancel();
    // this.animations.cancel();
    // this.stop();
    this.stop();
    this.eqn.isAnimating = false;
    this.prevForm(0);
    this.nextForm(duration, 0.5);
  }

  animateToForm(
    name: string,
    duration: number | null = null,
    delay: number = 0,
    callback: null | string | (() => void) = null,
  ) {
    // this.stopAnimatingColor(true, true);
    // this.stopAnimatingColor(true, true);
    // this.stop();
    this.stop();
    // this.animations.cancel();
    // this.animations.cancel();
    const form = this.getForm(name);
    if (form != null) {
      form.animatePositionsTo(delay, 0.4, duration, 0.4, callback);
    }
    this.setCurrentForm(name);
  }


  changeDescription(
    formOrName: EquationForm | string,
    description: string = '',
    modifiers: Object = {},
    subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName, subForm);
    if (form != null) {
      form.description = `${description}`;
      form.modifiers = modifiers;
    }
  }

  getDescription(
    formOrName: EquationForm | string,
    subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName, subForm);
    if (form != null && form.description != null) {
      return html.applyModifiers(form.description, form.modifiers);
    }
    return '';
  }

  // updateDescription(
  //   formOrName: EquationForm | string | null = null,
  //   subForm: string = 'base',
  // ) {
  //   const element = this.eqn.descriptionElement;
  //   if (element == null) {
  //     return;
  //   }
  //   if (element.isShown === false) {
  //     return;
  //   }
  //   let form = null;
  //   if (formOrName == null) {
  //     form = this.getCurrentForm();
  //   } else if (typeof formOrName === 'string') {
  //     form = this.getForm(formOrName, subForm);
  //   } else {
  //     form = formOrName;
  //   }
  //   if (form == null) {
  //     return;
  //   }
  //   if (form.description == null) {
  //     return;
  //   }

  //   const { drawingObject } = element;
  //   if (drawingObject instanceof HTMLObject) {
  //     drawingObject.change(
  //       html.applyModifiers(form.description, form.modifiers),
  //       element.lastDrawTransform.m(),
  //     );
  //     html.setOnClicks(form.modifiers);
  //   }
  // }
}
