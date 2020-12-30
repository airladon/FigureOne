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
import type { OBJ_SlideNavigator } from '../SlideNavigator';
import type { COL_Rectangle } from './Rectangle';


export type COL_SlideNavigatorButton = {
  type: 'arrow' | 'rectangle'
} & COL_Rectangle & OBJ_Arrow;

/**
 * {@link CollectionsRectangle} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
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
 * {@link FigureElementCollection} representing a rectangle.
 *
 * ![](./apiassets/advrectangle_ex1.png)
 * ![](./apiassets/advrectangle_ex2.png)
 *
 * <p class="inline_gif"><img src="./apiassets/advrectangle.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/advrectangle_button.gif" class="inline_gif_image"></p>
 *
 * This object defines a rectangle
 * {@link FigureElementCollection} that may include:
 * - border (line)
 * - fill
 * - label
 * - ability to surround another {@link FigureElement} with some space
 * - button behavior when clicked
 *
 * Surrounding another element can be executed through either the
 * <a href="#collectionsrectanglesurround">surround</a> method
 * or the {@link OBJ_SurroundAnimationStep} found in the in
 * the animation manager ({@link FigureElement}.animations),
 * and in the animation builder
 * (<a href="#animationmanagernew">animations.new</a>
 * and <a href="#animationmanagerbuilder">animations.builder</a>).
 *
 * Button behavior means the button will temporarily change a different color
 * when it is clicked. By default, the button will become a little more
 * transparent, but colors for the fill, label and border can also be
 * specified.
 *
 * @see
 *
 * See {@link COL_Rectangle} for setup options.
 *
 * See {@link OBJ_SurroundAnimationStep} for surround animation step options.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * @example
 * // Simple rectangle
 * figure.add({
 *   name: 'rect',
 *   method: 'collections.rectangle',
 *   options: {
 *     width: 2,
 *     height: 1,
 *   },
 * });
 *
 * @example
 * // Round corner rectangle with fill and outside line
 * const rect = figure.collections.rectangle({
 *   width: 2,
 *   height: 1,
 *   line: {
 *     width: 0.02,
 *     widthIs: 'outside',
 *     dash: [0.1, 0.02],
 *   },
 *   corner: {
 *     radius: 0.2,
 *     sides: 10,
 *   },
 *   fill: [0.7, 0.7, 1, 1],
 * });
 * figure.add('rect', rect);
 *
 * @example
 * // Rectangle surrounds elements of an equation
 * figure.add([
 *   {
 *     name: 'rect',
 *     method: 'collections.rectangle',
 *     options: {
 *       color: [0.3, 0.3, 1, 1],
 *       line: { width: 0.01 },
 *     },
 *   },
 *   {
 *     name: 'eqn',
 *     method: 'equation',
 *     options: {
 *       forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, ' ', 'c'] },
 *       position: [1, 0],
 *       scale: 1.5,
 *     },
 *   }
 * ]);
 *
 * const rect = figure.getElement('rect');
 * const eqn = figure.getElement('eqn');
 *
 * rect.surround(eqn._a, 0.03);
 * rect.animations.new()
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .surround({ target: eqn._b, space: 0.03, duration: 1 })
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .surround({ target: eqn._c, space: 0.03, duration: 1 })
 *   .pulse({ delay: 1, scale: 1.5 })
 *   .start();
 *
 * @example
 * // Make a rectangle that behaves like a button
 * figure.add([
 *   {
 *     name: 'rect',
 *     method: 'collections.rectangle',
 *     options: {
 *       width: 0.5,
 *       height: 0.3,
 *       color: [0.3, 0.3, 0.3, 1],
 *       label: 'Save',
 *       corner: { radius: 0.05, sides: 10 },
 *       fill: [0.9, 0.9, 0.9, 1],
 *       button: {
 *         fill: [0.95, 0.95, 0.95, 1],
 *       },
 *     },
 *     mods: {
 *       isTouchable: true,
 *       onClick: () => console.log('clicked'),
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
      slides: [],
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    super(options);

    this.collections = collections;
    this._nextButton = null;
    this._prevButton = null;
    this._text = null;
    if (options.prevButton != null) {
      this.addButton(options.prevButton, 'Prev');
    }
    if (options.nextButton != null) {
      this.addButton(options.nextButton, 'Next');
    }
    if (options.text != null) {
      this.addText(options.text);
    }

    this.nav = new SlideNavigator(joinObjects({}, {
      collection: options.collection || this,
      slides: options.slides,
      equation: options.equation,
      equationDefaults: options.equationDefaults,
      prevButton: this._prevButton,
      nextButton: this._nextButton,
      text: this._text,
    }));
  }

  goToSlide(slideIndex: number) {
    this.nav.goToSlide(slideIndex);
  }

  onAdd() {
    if (this.nav.collection == null && this.parent != null) {
      this.nav.collection = this.parent;
    }
  }

  addText(textOptions: OBJ_TextLines | string) {
    const defaultOptions = {
      font: joinObjects({}, this.collections.primitives.defaultFont),
      text: 'asdf',
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
    if (type === 'Next') {
      this.add('nextButton', button);
    } else {
      this.add('prevButton', button);
    }
  }

  getRectangleButton(options: COL_SlideNavigatorButton, type: 'Next' | 'Prev') {
    const length = this.collections.primitives.defaultLength;
    const x = type === 'Next' ? length / 4 : -length / 4;

    const defaultButtonOptions = {
      width: length / 4,
      height: length / 5,
      line: { width: this.collections.primitives.defaultLineWidth },
      corner: { radius: length / 30, sides: 10 },
      button: true,
      label: type,
      position: [x, -length],
      isTouchable: true,
    };
    const buttonOptions = joinObjects({}, defaultButtonOptions, options);
    return this.collections.rectangle(buttonOptions);
  }

  getArrowButton(options: COL_SlideNavigatorButton, type: 'Next' | 'Prev') {
    const length = this.collections.primitives.defaultLength;
    let rotation = 0;
    let x = length / 4;
    if (type === 'Prev') {
      rotation = Math.PI;
      x = -x;
    }

    const defaultButtonOptions = {
      head: 'triangle',
      length,
      width: length,
      rotation,
      position: [x, -length],
      isTouchable: true,
    };
    const buttonOptions = joinObjects({}, defaultButtonOptions, options);
    return this.collections.primitives.arrow(buttonOptions);
  }
}

export default CollectionsSlideNavigator;
