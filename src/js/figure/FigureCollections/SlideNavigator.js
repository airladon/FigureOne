// @flow

// import Figure from '../Figure';
import {
  Transform,
  // getPoint, getTransform,
} from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection,
} from '../Element';
import type { FigureElement } from '../Element';
import type {
  OBJ_Collection, OBJ_TextLines, OBJ_Arrow,
} from '../FigurePrimitives/FigurePrimitives';
import type FigureCollections from './FigureCollections';
import SlideNavigator from '../SlideNavigator';
import type { OBJ_SlideNavigatorSlide } from '../SlideNavigator';
import type { COL_Rectangle } from './Rectangle';
import type Figure from '../Figure';
import type { Equation } from '../Equation/Equation';


/**
 * CollectionsSlideNavigator Button.
 * @property {'arrow' | 'rectangle'} type
 * @extends COL_Rectangle
 * @extends OBJ_Arrow
 */
export type COL_SlideNavigatorButton = {
  type: 'arrow' | 'rectangle'
} & COL_Rectangle & OBJ_Arrow;

/**
 * CollectionsSlideNavigator equation animation defaults
 */
export type COL_SlideNavigatorEqnDefaults = {
  duration?: number,
  animate?: 'move' | 'dissolve' | 'instant',
};

/**
 * {@link CollectionsSlideNavigator} options object that extends
 * {@link OBJ_Collection} options object (without `parent`).
 *
 * This rectangle is similar to {@link OBJ_Rectangle}, except it can accomodate
 * both a fill and a border or line simultaneously with different colors.
 *
 * @extends OBJ_Collection
 *
 * @property {Figure | FigureElementCollection | string} [collection]
 * collection to tie slide navigator to. By default will tie to its parent.
 * @property {Array<OBJ_SlideNavigatorSlide>} [slides]
 * @property {COL_SlideNavigatorButton | null} [prevButton] previous button
 * options - use `null` to hide
 * @property {COL_SlideNavigatorButton | null} [nextButton] next button options
 * - use `null` to hide
 * @property {OBJ_TextLines | null} [text] text options - use `null` to hide
 * @property {Equation | string | Array<string | Equation>} [equation] equation
 * to tie to SlideNavigator
 * @property {COL_SlideNavigatorEqnDefaults} [equationDefaults] default
 * equation animation options
 */
export type COL_SlideNavigator = {
  collection?: Figure | FigureElementCollection | string,
  slides?: Array<OBJ_SlideNavigatorSlide>,
  prevButton?: COL_SlideNavigatorButton | null,
  nextButton?: COL_SlideNavigatorButton | null,
  text?: OBJ_TextLines | null,
  equation?: Equation | string | Array<string | Equation>,
  equationDefaults?: COL_SlideNavigatorEqnDefaults,
} & OBJ_Collection;


/*
.............##....##....###....##.....##
.............###...##...##.##...##.....##
.............####..##..##...##..##.....##
.............##.##.##.##.....##.##.....##
.............##..####.#########..##...##.
.............##...###.##.....##...##.##..
.............##....##.##.....##....###...
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} that creates elements to work with {@link SlideNavigator}.
 *
 * <p class="inline_gif"><img src="./apiassets/slidenavigator1.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/slidenavigator2.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/slidenavigator3.gif" class="inline_gif_image"></p>
 *
 * This object defines a rectangle
 * {@link FigureElementCollection} that may include:
 * - previous button
 * - next button
 * - {@link OBJ_TextLines} object
 *
 *
 * @see
 *
 * See {@link SlideNavigator} for information about what a slide navigator is.
 *
 * To test examples below, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>.
 *
 *
 * @example
 * // At its simplest, the SlideNavigator can be used to navigate an equation
 * figure.add([
 *   {
 *     name: 'eqn',
 *     method: 'equation',
 *     options: {
 *       formDefaults: { alignment: { xAlign: 'center' } },
 *       forms: {
 *         0: ['a', '_ + ', 'b', '_ = ', 'c'],
 *         1: ['a', '_ + ', 'b', '_ - b_1', '_ = ', 'c', '_ - ', 'b_2'],
 *         2: ['a', '_ = ', 'c', '_ - ', 'b_2'],
 *       },
 *       formSeries: ['0', '1', '2'],
 *     },
 *   },
 *   {
 *     name: 'nav',
 *     method: 'collections.slideNavigator',
 *     options: {
 *       equation: 'eqn',
 *     },
 *   },
 * ]);
 *
 * @example
 * // Text can be used to describe each slide
 * figure.add([
 *   {
 *     name: 'eqn',
 *     method: 'equation',
 *     options: {
 *       formDefaults: { alignment: { xAlign: 'center' } },
 *       forms: {
 *         0: ['a', '_ + ', 'b', '_ = ', 'c'],
 *         1: ['a', '_ + ', 'b', '_ - b_1', '_ = ', 'c', '_ - ', 'b_2'],
 *         2: ['a', '_ = ', 'c', '_ - ', 'b_2'],
 *       },
 *     },
 *   },
 *   {
 *     name: 'nav',
 *     method: 'collections.slideNavigator',
 *     options: {
 *       equation: 'eqn',
 *       text: { position: [0, 0.3] },
 *       slides: [
 *         { text: 'Start with the equation', form: '0' },
 *         { text: 'Subtract b from both sides' },
 *         { form: '1' },
 *         { text: 'The b terms cancel on the left hand side' },
 *         { form: '2' },
 *       ],
 *     },
 *   },
 * ]);
 *
 * @example
 * // This example creates a story by evolving a description, a diagram
 * // and an equation.
 * figure.add([
 *   {   // Square drawing
 *     name: 'square',
 *     method: 'primitives.rectangle',
 *     options: {
 *       width: 0.4,
 *       height: 0.4,
 *       line: { width: 0.005 },
 *     },
 *   },
 *   {   // Side length label
 *     name: 'label',
 *     method: 'text',
 *     options: {
 *       yAlign: 'middle',
 *       position: [0.3, 0],
 *       font: { size: 0.1 },
 *     },
 *   },
 *   {   // Equation
 *     name: 'eqn',
 *     method: 'equation',
 *     options: {
 *       elements: {
 *         eq1: '  =  ',
 *         eq2: '  =  ',
 *         eq3: '  =  ',
 *       },
 *       phrases: {
 *         sideSqrd: { sup: ['side', '_2'] },
 *         areaEqSide: [{ bottomComment: ['Area', 'square'] }, 'eq1', 'sideSqrd'],
 *       },
 *       formDefaults: { alignment: { xAlign: 'center' } },
 *       forms: {
 *         0: ['areaEqSide'],
 *         1: ['areaEqSide', 'eq2', { sup: ['_1', '_2_1'] }, 'eq3', '_1_1'],
 *         2: ['areaEqSide', 'eq2', { sup: ['_2_2', '_2_1'] }, 'eq3', '4'],
 *       },
 *       position: [0, -0.8],
 *     },
 *   },
 *   {   // Slide Navigator
 *     name: 'nav',
 *     method: 'collections.slideNavigator',
 *     options: {
 *       equation: 'eqn',
 *       nextButton: { type: 'arrow', position: [1.2, -0.8] },
 *       prevButton: { type: 'arrow', position: [-1.2, -0.8] },
 *       text: { position: [0, 0.7], font: { size: 0.12 } },
 *     },
 *   },
 * ]);
 *
 * const square = figure.getElement('square');
 * const label = figure.getElement('label');
 *
 * // Update the square size, and side label for any sideLength
 * const update = (sideLength) => {
 *   square.custom.updatePoints({ width: sideLength, height: sideLength });
 *   label.setPosition(sideLength / 2 + 0.1, 0);
 *   label.custom.updateText({ text: `${(sideLength / 0.4).toFixed(1)}` });
 * };
 *
 * // Add slides to the navigator
 * figure.getElement('nav').loadSlides([
 *   {
 *     showCommon: ['square', 'label', 'eqn'],
 *     text: 'The area of a square is the side length squared',
 *     form: '0',
 *     steadyStateCommon: () => update(0.4),
 *   },
 *   { text: 'So for side length of 1 we have and area of 1' },
 *   { form: '1' },
 *   { form: null, text: 'What is the area for side length 2?' },
 *   {
 *     transition: (done) => {
 *       square.animations.new()
 *         .custom({
 *           duration: 1,
 *           callback: p => update(0.4 + p * 0.4),
 *         })
 *         .whenFinished(done)
 *         .start();
 *     },
 *     steadyStateCommon: () => update(0.8),
 *   },
 *   { form: '2' },
 * ]);
 */
/* eslint-enable max-len */
class CollectionsSlideNavigator extends FigureElementCollection {
  _nextButton: FigureElement | null;
  _prevButton: FigureElement | null;
  _text: FigureElement | null;

  nav: SlideNavigator;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_SlideNavigator,
  ) {
    const defaultOptions = {
      transform: new Transform('SlideNavigator').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
      // slides: [],
      color: collections.primitives.defaultColor,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    super(o);

    this.collections = collections;
    this._nextButton = null;
    this._prevButton = null;
    this._text = null;
    if (o.prevButton !== null) {
      this.addButton(o.prevButton || {}, 'Prev');
    }
    if (o.nextButton !== null) {
      this.addButton(o.nextButton || {}, 'Next');
    }
    if (o.text !== null) {
      this.addText(o.text || {});
    }

    this.nav = new SlideNavigator();
    this.custom.options = o;
    // this.nav = new SlideNavigator(joinObjects({}, {
    //   collection: o.collection || this,
    //   slides: o.slides,
    //   equation: o.equation,
    //   equationDefaults: o.equationDefaults,
    //   prevButton: this._prevButton,
    //   nextButton: this._nextButton,
    //   text: this._text,
    // }));

    // if (o.collection == null) {
    //   this.nav.collection = null;
    // }
    this.hasTouchableElements = true;
    this.onAdd = () => {
      this.nav.load({ // $FlowFixMe
        collection: this.parent,
        slides: o.slides,
        equation: o.equation,
        equationDefaults: o.equationDefaults,
        prevButton: this._prevButton,
        nextButton: this._nextButton,  // $FlowFixMe
        text: this._text,
      });
      this.nav.goToSlide(0);
      // if (this.nav.collection == null && this.parent != null) {
      //   this.nav.equations =
      //     Array.isArray(o.equation) ? o.equation : [o.equation];
      //   this.nav.collection = this.parent;
      //   this.nav.setEquations();
      //   this.nav.goToSlide(0);
      // }
    };
  }

  /**
   * Load slides into navigator
   */
  loadSlides(slides: Array<OBJ_SlideNavigatorSlide>) {
    this.nav.slides = slides;
    this.nav.loadRecorder();
    this.nav.goToSlide(0);
  }

  /**
   * Jump to a specific slide.
   */
  goToSlide(slideIndex: number) {
    this.nav.goToSlide(slideIndex);
  }

  /**
   * Progress to the next slide.
   */
  nextSlide(ignoreTransition: boolean = false) {
    this.nav.nextSlide(ignoreTransition);
  }

  /**
   * Go to the previous slide.
   */
  prevSlide() {
    this.nav.prevSlide();
  }


  addText(textOptions: OBJ_TextLines | string) {
    const defaultOptions = {
      font: joinObjects({}, this.collections.primitives.defaultFont),
      text: '',
      xAlign: 'center',
    };
    // defaultOptions.font.size = this.collections.primti * 0.4;
    defaultOptions.font.color = this.color;

    let optionsIn;
    if (typeof textOptions === 'string') {
      optionsIn = { text: textOptions };
    } else {
      optionsIn = textOptions;
    }
    const o = joinObjects({}, defaultOptions, optionsIn);
    const text = this.collections.primitives.textLines(o);
    text.isTouchable = true;
    this.add('text', text);
  }

  addButton(options: COL_SlideNavigatorButton, type: 'Next' | 'Prev') {
    let button;
    if (options.type === 'arrow') {
      button = this.getArrowButton(options, type);
    } else {
      button = this.getRectangleButton(options, type);
    }
    button.isTouchable = true;
    if (type === 'Next') {
      this.add('nextButton', button);
    } else {
      this.add('prevButton', button);
    }
  }

  getRectangleButton(options: COL_SlideNavigatorButton, type: 'Next' | 'Prev') {
    const length = this.collections.primitives.defaultLength;
    const x = type === 'Next' ? length / 3 : -length / 3;

    const defaultButtonOptions = {
      width: length / 3,
      height: length / 5,
      line: { width: this.collections.primitives.defaultLineWidth },
      corner: { radius: length / 30, sides: 10 },
      button: true,
      label: type,
      position: [x, -length / 4],
    };
    const buttonOptions = joinObjects({}, defaultButtonOptions, options);
    return this.collections.rectangle(buttonOptions);
  }

  getArrowButton(options: COL_SlideNavigatorButton, type: 'Next' | 'Prev') {
    const length = this.collections.primitives.defaultLength / 4;
    let angle = 0;
    let x = length;
    if (type === 'Prev') {
      angle = Math.PI;
      x = -x;
    }

    const defaultButtonOptions = {
      head: 'triangle',
      length,
      width: length,
      angle,
      position: [x, -length],
      align: 'mid',
    };
    const buttonOptions = joinObjects({}, defaultButtonOptions, options);
    return this.collections.primitives.arrow(buttonOptions);
  }
}

export default CollectionsSlideNavigator;
