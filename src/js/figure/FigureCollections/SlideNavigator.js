// @flow

// import Figure from '../Figure';
import {
  Transform, Point, getBoundingRect,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsableBuffer } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection,
} from '../Element';
import type { FigureElement, FigureElementPrimitive } from '../Element';
import type {
  OBJ_LineStyleSimple, OBJ_Texture, OBJ_Collection, OBJ_TextLines, OBJ_Arrow,
} from '../FigurePrimitives/FigurePrimitives';
import type {
  TypeColor, OBJ_CurvedCorner,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';
import SlideNavigator from '../SlideNavigator';
import type { OBJ_SlideNavigator, OBJ_SlideNavigatorSlides } from '../SlideNavigator';
import type { COL_Rectangle } from './Rectangle';


export type COL_SlideNavigatorButton = {
  type: 'arrow' | 'rectangle'
} & COL_Rectangle & OBJ_Arrow;

/**
 * {@link CollectionsSlideNavigator} options object that extends
 * {@link OBJ_Collection} options object (without `parent`).
 *
 * This rectangle is similar to {@link OBJ_Rectangle}, except it can accomodate
 * both a fill and a border or line simultaneously with different colors.
 *
 * @extends OBJ_Collection
 *
 * @property {number} [width] rectangle width
 * @property {number} [height] rectangle height
 * @property {'left' | 'center' | 'right' | number} [xAlign] horiztonal
 * alignment of the rectangle
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] vertical alignment
* of the rectangle
 * @property {OBJ_LineStyleSimple} [line] lines style - leave empty if only
 * want fill
 * @property {TypeColor | OBJ_Texture} [fill] fill color or texture
 * @property {OBJ_CurvedCorner} [corner] corner style of rectangle
 * @property {OBJ_TextLines} [label] Rectangle label
 * @property {boolean | TypeColor | OBJ_ButtonColor} [button] `true` to
 * make the rectangle behave like a button when clicked. `TypeColor` to
 * make fill, line and label the same color when clicked or `OBJ_ButtonColor`
 * to specify click colors for each (`false`)
 */
export type COL_SlideNavigator = {
  collection: Figure | FigureElementCollection | string,
  slides: Array<OBJ_NavigatorSlide>,
  prevButton?: COL_SlideNavigatorButton,
  nextButton?: COL_SlideNavigatorButton,
  text?: OBJ_TextLines,
  equation?: Equation | string | Array<string | Equation>,
  equationDefaults: {
    duration?: number,
    animate?: 'move' | 'dissolve' | 'instant',
  },
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
 * <p class="inline_gif"><img src="./apiassets/slideNavigator1.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/slideNavigator2.gif" class="inline_gif_image"></p>
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
 */
/* eslint-enable max-len */
// $FlowFixMe
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
    if (!o.prevButton !== null) {
      this.addButton(o.prevButton || {}, 'Prev');
    }
    if (!o.nextButton !== null) {
      this.addButton(o.nextButton || {}, 'Next');
    }
    if (!o.text !== null) {
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

    if (o.collection == null) {
      this.nav.collection = null;
    }
    this.hasTouchableElements = true;
    this.onAdd = () => {
      this.nav.load({
        collection: this.parent,
        slides: o.slides,
        equation: o.equation,
        equationDefaults: o.equationDefaults,
        prevButton: this._prevButton,
        nextButton: this._nextButton,
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

  setSlides(slides: Array<OBJ_SlideNavigatorSlides>) {
    this.nav.slides = slides;
    this.nav.goToSlide(0);
  }

  goToSlide(slideIndex: number) {
    this.nav.goToSlide(slideIndex);
  }

  // onAdd() {
  //   console.log('asdf', this.parent)
  //   if (this.nav.collection == null && this.parent != null) {
  //     this.nav.collection = this.parent;
  //     this.nav.setEquations();
  //   }
  // }

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
