// @flow
import {
  Point, getPoint,
} from '../../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../Element';
import {
  BlankElement, Element, Elements,
} from './Elements/Element';
import Fraction from './Elements/Fraction';
// eslint-disable-next-line import/no-cycle
import EquationForm from './EquationForm';
import Matrix from './Elements/Matrix';
import Scale from './Elements/Scale';
import Container from './Elements/Container';
import BaseAnnotationFunction from './Elements/BaseAnnotationFunction';
import type { TypeAnnotation } from './Elements/BaseAnnotationFunction';

export function getDiagramElement(
  elementsObject: { [string: string]: DiagramElementPrimitive |
                    DiagramElementCollection }
                  | DiagramElementCollection,
  name: string | DiagramElementPrimitive | DiagramElementCollection,
): DiagramElementPrimitive | DiagramElementCollection | null {
  if (typeof name !== 'string') {
    return name;
  }
  if (elementsObject instanceof DiagramElementCollection) {
    if (elementsObject && `_${name}` in elementsObject) {
    // $FlowFixMe
      return elementsObject[`_${name}`];
    }
    return null;
  }

  if (elementsObject && name in elementsObject) {
    return elementsObject[name];
  }

  return null;
}

/* eslint-disable no-use-before-define */
/**
 * An equation phrase is used to define an equation form. An equation phrase
 * can either be the entirety of the form definition, or a series of nested
 * phrases.
 *
 *  * An object or array definition (e.g. {@link TypeEquationFunctionFraction})
 *  * A string that represents an equation element
 *  * An array of {@link TypeEquationPhrase}
 *
 * @example:
 * forms: {
 *   form1: 'a'
 *   form2: ['a', 'equals', 'b']
 *   form3: [{
 *     frac: {
 *       numerator: 'a',
 *       symbol: 'v',
 *       denominator: '1'
 *     },
 *   }, 'equals', 'b'],
 *   form4: [{ frac: ['a', 'v', '1'], 'equals', 'b'}],
 * },
 */
export type TypeEquationPhrase =
  string
  | number
  | { frac: TypeEquationFunctionFraction }
  | { strike: TypeEquationFunctionStrike }
  | { box: TypeEquationFunctionBox }
  | { root: TypeEquationFunctionRoot }
  | { brac: TypeEquationFunctionBracket }
  | { sub: TypeEquationFunctionSubcript }
  | { sup: TypeEquationFunctionSuperscript }
  | { supSub: TypeEquationFunctionSuperscriptSubscript }
  | { topBar: TypeEquationFunctionBar }
  | { bottomBar: TypeEquationFunctionBar }
  | { annotate: TypeAnnotateObject }
  | { topComment: TypeEquationFunctionComment }
  | { bottomComment: TypeEquationFunctionComment }
  | { padding: TypePaddingObject } | TypePaddingArray
  | { bar: TypeEquationFunctionBar }
  | { scale: TypeEquationFunctionScale }
  | { container: TypeEquationFunctionContainer }
  | { matrix: TypeMatrixObject } | TypeMatrixArray
  | { int: TypeEquationFunctionIntegral }
  | { sumOf: TypeEquationFunctionSumOf }
  | { prodOf: TypeEquationFunctionProdOf }
  | Array<TypeEquationPhrase>
  | DiagramElementPrimitive
  | DiagramElementCollection
  | Elements
  | Element
  | BaseAnnotationFunction;

/**
 * Equation container
 *
 * A container is useful to fix spacing around content as it changes between
 * equation forms.
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [width] (`null`)
 * @property {number} [descent] (`null`)
 * @property {number} [ascent] (`null`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | 'baseline' | number} [yAlign]  (`'baseline'`)
 * @property {'width' | 'height' | 'contain'} [fit] - fit width,
 * ascent and descent to either match width, height or fully contain the content (`null`)
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] - (`false`)
 * @example
 * // Full object definition
 *  {
 *    container: {
 *      content: 'a',
 *      width: null,
 *      descent: null,
 *      ascent: null,
 *      xAlign: 'left',
 *      yAlign: 'baseline',
 *      fit: null,
 *      scale: 1,
 *      fullContentBounds: false
 *    },
 *  }
 * @example
 * // Example array definition
 *  { container: ['a', 1, 0.2, 0.5] }
 */
export type TypeEquationFunctionContainer = {
  content: TypeEquationPhrase,
  width?: number,
  descent?: number,
  ascent?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | 'baseline' | number,
  fit?: 'width' | 'height' | 'contain',
  scale?: number,
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'middle' | 'top' | 'baseline' | number,
  ?'width' | 'height' | 'contain',
  ?number,
  ?boolean,
];

/**
 * Equation fraction
 *
 * @property {TypeEquationPhrase} numerator
 * @property {string} symbol - Vinculum symbol
 * @property {TypeEquationPhrase} denominator
 * @property {number} [scale] (`1`)
 * @property {number} [numeratorSpace] (`0.05`)
 * @property {number} [denominatorSpace] (`0.05`)
 * @property {number} [overhang] Vinculum extends beyond the content
 * horizontally by the this amount (`0.05`)
 * @property {number} [offsetY] Offset fraction in y (`0.07`)
 * @property {boolean} [fullContentBounds] Use full bounds with content (`false`)
 * @example
 * // For examples, a vinculum symbol is defined as an equation element
 * eqn.addElements({
 *   v: { symbol: 'vinculum' }
 * });
 * @example
 * // Full object definition example
 *  {
 *    frac: {
 *      numerator: 'a',
 *      symbol: 'v',
 *      denominator: 'b',
 *      scale: 0.8,
 *      numeratorSpace: 0.01,
 *      denominatorSpace: 0.02,
 *      overhang: 0.03,
 *      offsetY: 0.04,
 *      fullContentBounds: false,
 *    },
 *  }
 * @example
 * // Array definition example
 * { frac: ['a', 'v', 'b'] }
 */
export type TypeEquationFunctionFraction = {
  numerator: TypeEquationPhrase;
  symbol: string;
  denominator: TypeEquationPhrase;
  scale?: number;
  numeratorSpace?: number;
  denominatorSpace?: number;
  overhang?: number;
  offsetY?: number;
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  string,
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
];

/**
 * Equation scale
 *
 * Scale an equation phrase
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] Use full bounds with content (`false`)
 * @example
 * // Full object definition
 *  {
 *    scale: {
 *      content: ['a', 'b'],
 *      scale: 0.5,
 *      fullContentBounds: false,
 *    },
 *  }
 * @example
 * // Example array definition
 *  { scale: [['a', 'b'], 0.5] }
 */
export type TypeEquationFunctionScale = {
  content: TypeEquationPhrase,
  scale?: number,
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?number,
  ?boolean,
];

/**
 * Equation bracket
 *
 * Surround an equation phrase with brackets
 *
 * @property {string} [left] left bracket symbol
 * @property {TypeEquationPhrase} [content]
 * @property {string} [right] right bracket symbol
 * @property {boolean} [inSize] `false` excludes bracket symbols from
 * size of resulting phrase (`true`)
 * @property {number} [insideSpace] space between brackets and content (`0.03`)
 * @property {number} [outsideSpace] space between brackets and neighboring
 * phrases(`0.03`)
 * @property {number} [topSpace] how far the brackets extend above the content
 * (`0.05`)
 * @property {number} [bottomSpace] how far the brackets extend below the
 * content (`0.05`)
 * @property {number} [minContentHeight] if content height is less than this,
 * then this number will be used when sizing the brackets (unless it is `null`)
 * (`null`)
 * @property {number} [minContentDescent] if content descent is less than this,
 * then this number will be used when sizing the brackets (unless it is `null`)
 * (`null`)
 * @property {number} [height] force height of brackets (`null`)
 * @property {number} [descent] force descent of brackets (`null`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 * @example
 * // For examples, two bracket symbols are defined as equation elements
 * eqn.addElements({
 *   lb: { symbol: 'bracket', side: 'left' }
 *   rb: { symbol: 'bracket', side: 'right' }
 * });
 * @example
 * // Full object definition
 *  {
 *    brac: {
 *      left: 'lb',
 *      content: 'a',
 *      right: 'rb',
 *      inSize: true,
 *      insideSpace: 0.1,
 *      outsideSpace: 0.1,
 *      topSpace: 0.1,
 *      bottomSpace: 0.1,
 *      minContentHeight: 0.1,
 *      minContentDescent: 0.1,
 *      height: 0.1,
 *      descent: 0.1,
 *      fullContentBounds: false,
 *      useFullBounds: false,
 *    },
 *  }
 * @example
 * // Example array definition
 *  { brac: ['lb', 'a', 'rb'] }
 */

export type TypeEquationFunctionBracket = {
  left?: string;
  content: TypeEquationPhrase;
  right?: string;
  inSize?: boolean;
  insideSpace?: number;
  outsideSpace?: number;
  topSpace?: number;
  bottomSpace?: number;
  minContentHeight?: number;
  minContentDescent?: number;
  height?: number;
  descent?: number;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
} | [
  string,
  TypeEquationPhrase,
  ?string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

/**
 * Equation root
 *
 * Surround an equation phrase with a radical symbol and add a custom root if
 * needed
 *
 * @property {string} symbol radical symbol
 * @property {TypeEquationPhrase} content
 * @property {boolean} [inSize] `false` excludes radical symbol and root (if
 * defined) from size of resulting phrase (`true`)
 * @property {number} [space] (`0.02`) default space between content and
 * radical symbol in left, right, top and bottom directions.
 * @property {number} [topSpace] space between content top and radical symbol
 * horiztonal line (`space`)
 * @property {number} [rightSpace] radical symbol overhang of content on right
 * (`space`)
 * @property {number} [bottomSpace] radical symbol descent below content
 * (`space`)
 * @property {number} [leftSpace] space between radical symbol up stroke and
 * content (`space`)
 * @property {TypeEquationPhrase} [root] custom root
 * @property {number} [rootOffset] custom root offset (`[0, 0.06]`)
 * @property {number} [rootScale] custom root scale (`0.6`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
* @example
 * // For examples, a radical symbol is defined as an equation element
 * eqn.addElements({
 *   radical: { symbol: 'radical' }
 * });
 * @example
 * // Full object definition
 * {
 *   root: {
 *     content: 'a',
 *     symbol: 'radical',
 *     inSize: true,
 *     space: 0.1,
 *     topSpace: 0.1,
 *     rightSpace: 0.1,
 *     bottomSpace: 0.1,
 *     leftSpace: 0.1,
 *     root: 'b',
 *     rootOffset: [0, 0],
 *     rootScale: 1,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Example array definition
 *  { root: ['radical', 'a'] }
 */

export type TypeEquationFunctionRoot = {
  symbol: string;
  content: TypeEquationPhrase;
  inSize?: boolean;
  space?: number;
  topSpace?: number;
  rightSpace?: number;
  bottomSpace?: number;
  leftSpace?: number;
  root: TypeEquationPhrase;
  rootOffset?: number,
  rootScale?: number,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
} | [
  string,
  TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeEquationPhrase,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

/**
 * Equation strike-through
 *
 * Overlay a strike symbol on an equation phrase
 *
 * @property {TypeEquationPhrase} content
 * @property {string} symbol
 * @property {boolean} [inSize] `false` excludes strike symbol from size of
 * resulting phrase (`false`)
 * @property {number} [space] amount the strike symbol overhangs the content on
 * the left, right, bottom and top sides (`0.02`)
 * @property {number} [topSpace] use when top overhang between content and
 *  strike should be different thant `space` property (`space`)
 * @property {number} [rightSpace] use when right overhang between content and
 *  strike should be different thant `space` property (`space`)
 * @property {number} [bottomSpace] use when bottom overhang between content and
 *  strike should be different thant `space` property (`space`)
 * @property {number} [leftSpace] use when left overhang between content and
 *  strike should be different thant `space` property (`space`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
* @example
 * // For examples, a strike symbol is defined as an equation element
 * eqn.addElements({
 *   x: { symbol: 'strike', style: 'cross' }
 * });
 * @example
 * // Full object definition
 * {
 *   strike: {
 *     content: 'a',
 *     symbol: 'x',
 *     inSize: true,
 *     space: 0,
 *     topSpace: 0.1,
 *     rightSpace: 0.2,
 *     bottomSpace: 0.3,
 *     leftSpace: 0.4,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Example array definition
 *  { strike: ['a', 'x'] }
 */
export type TypeEquationFunctionStrike = {
  content: TypeEquationPhrase;
  symbol: string;
  inSize?: boolean;
  space?: number;
  topSpace?: number;
  rightSpace?: number;
  bottomSpace?: number;
  leftSpace?: number;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
} | [
  TypeEquationPhrase,
  string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

/**
 * Equation box
 *
 * Place a box symbol around an equation phrase
 *
 * @property {TypeEquationPhrase} content
 * @property {string} symbol
 * @property {boolean} [inSize] `false` excludes box symbol from size of
 * resulting phrase (`false`)
 * @property {number} [space] space between box symbol and content on
 * the left, right, bottom and top sides (`0`)
 * @property {number} [topSpace] use when top space between content and
 *  box should be different thant `space` property (`space`)
 * @property {number} [rightSpace] use when right space between content and
 *  box should be different thant `space` property (`space`)
 * @property {number} [bottomSpace] use when bottom space between content and
 *  box should be different thant `space` property (`space`)
 * @property {number} [leftSpace] use when left space between content and
 *  box should be different thant `space` property (`space`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
* @example
 * // For examples, a box symbol is defined as an equation element
 * eqn.addElements({
 *   x: { symbol: 'box' }
 * });
 * @example
 * // Full object definition
 * {
 *   box: {
 *     content: 'a',
 *     symbol: 'box',
 *     inSize: true,
 *     space: 0,
 *     topSpace: 0.1,
 *     rightSpace: 0.2,
 *     bottomSpace: 0.3,
 *     leftSpace: 0.4,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Example array definition
 *  { box: ['a', 'box'] }
 */
export type TypeEquationFunctionBox = {
  content: TypeEquationPhrase,
  symbol: string,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  rightSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
} | [
  TypeEquationPhrase,
  string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

/**
 * Equation bar
 *
 * Place a bar (or bracket) symbol to the side of an equation phrase
 *
 * @property {TypeEquationPhrase} content
 * @property {string} symbol
 * @property {boolean} [inSize] `false` excludes box symbol from size of
 * resulting phrase (`true`)
 * @property {number} [space] space between content and the symbol (`0.03`)
 * @property {number} [overhang] amount symbol extends beyond content (`0`)
 * @property {number} [length] total length of symbol (overrides `overhang`)
 * @property {number} [left] amount symbol extends beyond content to the left
 * (overrides `overhang` and `length`, and only for side `'top'` or `'bottom'`)
 * @property {number} [left] amount symbol extends beyond content to the right
 * (overrides `overhang` and `length`, and only for side `'top'` or `'bottom'`)
 * @property {number} [top] amount symbol extends beyond content to the top
 * (overrides `overhang` and `length`, and only for side `'left'` or `'right'`)
 * @property {number} [top] amount symbol extends beyond content to the bottom
 * (overrides `overhang` and `length`, and only for side `'left'` or `'right'`)
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] (`top`)
 * @property {number} [minContentHeight] custom min content height for auto
 * symbol sizing when side is `'top'` or `'bottom'`
 * @property {number} [minContentDescent] custom min content descent for auto
 * symbol sizing when side is `'top'` or `'bottom'`
 * @property {number} [minContentAscent] custom min content ascent for auto
 * symbol sizing when side is `'top'` or `'bottom'`
 * @property {number} [descent] force descent of symbol when side is `'top'` or
 * `'bottom'` - height is forced with `length` property
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 * @example
 * // For examples, a box symbol is defined as an equation element
 * eqn.addElements({
 *   hBar: { symbol: 'bar', side: 'top' }
 *   vBar: { symbol: 'bar', side: 'left' }
 * });
 * @example
 * // Full object definition for horizontal bar
 * {
 *   bar: {
 *     content: 'a',
 *     symbol: 'hBar',
 *     side: 'top',
 *     inSize: true,
 *     space: 0.1,
 *     overhang: null,
 *     length: null,
 *     left: null,
 *     right: null,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Full object definition for vertical bar
 * {
 *   bar: {
 *     content: 'a',
 *     symbol: 'vBar',
 *     side: 'left',
 *     inSize: true,
 *     space: 0.1,
 *     overhang: null,
 *     length: null,
 *     top: null,
 *     bottom: null,
 *     minContentHeight: null,
 *     minContentDescent: null,
 *     minContentAscent: null,
 *     descent: null,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Example array definition
 *  { bar: ['a', 'hBar', 'top'] }
 */
export type TypeEquationFunctionBar = {
  content: TypeEquationPhrase;
  symbol?: string;
  inSize?: boolean,
  space?: number,
  overhang?: number,
  length?: number,
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
  side?: 'left' | 'right' | 'top' | 'bottom',
  minContentHeight?: number,
  minContentDescent?: number,
  minContentAscent?: number,
  descent?: number,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?'left' | 'right' | 'top' | 'bottom',
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

/**
 * Equation integral
 *
 * Place an integral (with optional limits) before an equation phrase
 *
 * @property {string} symbol
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} [from] bottom limit
 * @property {TypeEquationPhrase} [to] top limit
 * @property {boolean} [inSize] `false` excludes box symbol from size of
 * resulting phrase (`true`)
 * @property {number} [space] horizontal space between symbol and content (`0.05`)
 * @property {number} [topSpace] space between content top and symbol top (`0.1`)
 * @property {number} [bottomSpace] space between content bottom and symbol bottom (`0.1`)
 * @property {number} [height] force height of symbol
 * @property {number} [yOffset] y offset of symbol (`0`)
 * @property {number} [scale] content scale (`1`)
 * @property {number} [fromScale] scale of *from* (bottom) limit (`0.5`)
 * @property {number} [toScale] scale of *to* (top) limit (`0.5`)
 * @property {TypeParsablePoint} [fromOffset] from limit offest ( `side`:
 * `[0, 0]`, `topBottom`: `[0, -0.04]`, `topBottomCenter`: `[0, -0.04]`)
 * @property {TypeParsablePoint} [toOffset] to limit offest (`side`: `[0, 0]`
 * `topBottom`: `[0, 0.04]`, `topBottomCenter`: `[0, 0.04]`)
 * @property {'side' | 'topBottom' | 'topBottomCenter'} [limitsPosition] limits
 * relative to symbol. `side` is to the right of the symbol ends, `topBottom`
 * is above and below the symbol ends and `topBottomCenter` is above and below
 * the integral mid point (`'side'`)
 * @property {boolean} [limitsAroundContent] `false` means content left is
 * aligned with furthest right of limits
 * @property {'left' | 'center' | 'right' | number} [fromXPosition] x position
 * of limit relative to the symbol (`side`: `0.5`, `topBottom`: `0.1`,
 * `topBottomCenter`: `'center'`)
 * @property {'bottom' | 'top' | 'middle' | 'baseline' | number} [fromYPositio]
 * y position of the limit relavite to the symbol (`'bottom'`)
 * @property {'left' | 'center' | 'right' | number} [fromXAlign] limit x
 * alignment (`side`: `'left'`, `topBottom`: `center`,
 * `topBottomCenter`: `'center'`)
 * @property {'bottom' | 'top' | 'middle' | 'baseline' | number} [fromYAlign]
 * limit y alignment (`side`: `'middle'`, `topBottom`: `'top'`,
 * `topBottomCenter`: `'top'`)
 * @property {'left' | 'center' | 'right' | number} [toXPosition] x position
 * of limit relative to the symbol (`side`: `'right'`, `topBottom`: `0.9`,
 * `topBottomCenter`: `'center'`)
 * @property {'bottom' | 'top' | 'middle' | 'baseline' | number} [toYPosition]
 * y position of the limit relavite to the symbol (`side`: `'top'`,
 * `topBottom`: `top`, `topBottomCenter`: `'top'`)
 * @property {'left' | 'center' | 'right' | number} [toXAlign] limit x
 * alignment (`side`: `'left'`, `topBottom`: `center`,
 * `topBottomCenter`: `'center'`)
 * @property {'bottom' | 'top' | 'middle' | 'baseline' | number} [toYAlign]
 * limit y alignment (`side`: `'middle'`, `topBottom`: `bottom`,
 * `topBottomCenter`: `'bottom'`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 * @example
 * // For examples, a box symbol is defined as an equation element
 * eqn.addElements({
 *   integral: { symbol: 'int' }
 * });
 * @example
 * // Full object definition for horizontal bar
 * {
 *   int: {
 *     symbol: 'integral',
 *     content: 'a',
 *     from: 'b',
 *     to: 'c',
 *     inSize: true,
 *     space: 0,
 *     topSpace: 0.1,
 *     bottomSpace: 0.1,
 *     height: null,
 *     yOffset: 0,
 *     scale: 1,
 *     fromScale: 1,
 *     toScale: 1,
 *     fromOffset: [0.1, 0.1],
 *     toOffset: [-0.1, -0.1],
 *     limitsPosition: 'topBottom',
 *     limitsAroundContent: true,
 *     fromXPosition: 'center',
 *     fromYPosition: 'bottom',
 *     fromXAlign: 'center',
 *     fromYAlign: 'top',
 *     toXPosition: 'center',
 *     toYPosition: 'top',
 *     toXAlign: 'center',
 *     toYAlign: 'bottom',
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Example array definition
 *  { int: ['integral', 'a', 'b', 'c'] }
 */
export type TypeEquationFunctionIntegral = {
  symbol?: string,
  content?: TypeEquationPhrase,
  from?: TypeEquationPhrase,
  to?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
  fromScale?: number,
  toScale?: number,
  fromOffset?: TypeParsablePoint,
  toOffset?: TypeParsablePoint,
  limitsPosition?: 'side' | 'topBottom' | 'topBottomCenter',
  limitsAroundContent?: boolean,
  fromXPosition?: 'left' | 'center' | 'right' | number,
  fromYPosition?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  fromXAlign?: 'left' | 'center' | 'right' | number,
  fromYAlign?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  toXPosition?: 'left' | 'center' | 'right' | number,
  toYPosition?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  toXAlign?: 'left' | 'center' | 'right' | number,
  toYAlign?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  fullBoundsContent?: boolean,
  useFullBounds?: boolean,
  } | [
  ?string,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
  ?'side' | 'topBottom' | 'topBottomCenter',
  ?boolean,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?boolean,
  ?boolean,
];

/**
 * Equation sum of
 *
 * Place an equation phrase in a sum of operation
 *
 * @property {string} symbol
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} [from]
 * @property {TypeEquationPhrase} [to]
 * @property {boolean} [inSize] `false` excludes sum of operator from size of
 * resulting phrase (`true`)
 * @property {number} [space] horiztonaly space between symbol and content (`0.05`)
 * @property {number} [topSpace] space symbol extends above content top (`0.07`)
 * @property {number} [bottomSpace] space symbol extends below content bottom (`0.07`)
 * @property {number} [height] force height of symbol overwriting `topSpace`
 * @property {number} [yOffset] offset of symbol in y (`0`)
 * @property {number} [scale] content scale (`1`)
 * @property {number} [fromScale] scale of *from* phrase (`0.5`)
 * @property {number} [toScale] scale of *to* phrase (`0.5`)
 * @property {number} [fromSpace] space between symbol and `from` phrase
 * (`0.04`)
 * @property {number} [toSpace] space between symbol and `to` phrase (`0.04`)
 * @property {TypeParsablePoint} [fromOffset] offset of `from` phrase (`[0, 0]`)
 * @property {TypeParsablePoint} [toOffset] offset of `to` phrase (`[0, 0]`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
* @example
 * // For examples, a sum of symbol (sigma) is defined as an equation element
 * eqn.addElements({
 *   s: { symbol: 'sum' }
 * });
 * @example
 * // Full object definition
 * {
 *   sumOf: {
 *     symbol: 's',
 *     content: 'a',
 *     from: 'b',
 *     to: 'c',
 *     inSize: true,
 *     space: 0,
 *     topSpace: 0.1,
 *     bottomSpace: 0.1,
 *     height: null,
 *     yOffset: 0,
 *     scale: 1,
 *     fromScale: 1,
 *     toScale: 1,
 *     fromSpace: 0.1,
 *     toSpace: 0.1,
 *     fromOffset: [0.1, 0.1],
 *     toOffset: [-0.1, -0.1],
 *   },
 * }
 * @example
 * // Example array definition
 *  { sumOf: ['s', 'a', 'b', 'c'] }
 */
export type TypeEquationFunctionSumOf = {
  symbol?: string,
  content: TypeEquationPhrase,
  from?: TypeEquationPhrase,
  to?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
  fromScale?: number,
  toScale?: number,
  fromSpace?: number,
  toSpace?: number,
  fromOffset?: TypeParsablePoint,
  toOffset?: TypeParsablePoint,
  fullBoundsContent?: boolean,
  useFullBounds?: boolean,
} | [
  ?string,
  TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeParsablePoint | null,
  ?TypeParsablePoint | null,
  ?boolean,
  ?boolean,
];

/**
 * Equation product of
 *
 * Place an equation phrase in a product of operation
 *
 * @property {string} symbol
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} [from]
 * @property {TypeEquationPhrase} [to]
 * @property {boolean} [inSize] `false` excludes product of operator from size of
 * resulting phrase (`true`)
 * @property {number} [space] horiztonaly space between symbol and content (`0.05`)
 * @property {number} [topSpace] space symbol extends above content top (`0.07`)
 * @property {number} [bottomSpace] space symbol extends below content bottom (`0.07`)
 * @property {number} [height] force height of symbol overwriting `topSpace`
 * @property {number} [yOffset] offset of symbol in y (`0`)
 * @property {number} [scale] content scale (`1`)
 * @property {number} [fromScale] scale of *from* phrase (`0.5`)
 * @property {number} [toScale] scale of *to* phrase (`0.5`)
 * @property {number} [fromSpace] space between symbol and `from` phrase
 * (`0.04`)
 * @property {number} [toSpace] space between symbol and `to` phrase (`0.04`)
 * @property {TypeParsablePoint} [fromOffset] offset of `from` phrase (`[0, 0]`)
 * @property {TypeParsablePoint} [toOffset] offset of `to` phrase (`[0, 0]`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 * @example
 * // For examples, a sum of symbol (pi) is defined as an equation element
 * eqn.addElements({
 *   s: { symbol: 'prod' }
 * });
 * @example
 * // Full object definition
 * {
 *   prodOf: {
 *     symbol: 's',
 *     content: 'a',
 *     from: 'b',
 *     to: 'c',
 *     inSize: true,
 *     space: 0,
 *     topSpace: 0.1,
 *     bottomSpace: 0.1,
 *     height: null,
 *     yOffset: 0,
 *     scale: 1,
 *     fromScale: 1,
 *     toScale: 1,
 *     fromSpace: 0.1,
 *     toSpace: 0.1,
 *     fromOffset: [0.1, 0.1],
 *     toOffset: [-0.1, -0.1],
 *   },
 * }
 * @example
 * // Example array definition
 *  { prodOf: ['s', 'a', 'b', 'c'] }
 */
export type TypeEquationFunctionProdOf = {
  symbol?: string,
  content: TypeEquationPhrase,
  from?: TypeEquationPhrase,
  to?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
  fromScale?: number,
  toScale?: number,
  fromSpace?: number,
  toSpace?: number,
  fromOffset?: TypeParsablePoint,
  toOffset?: TypeParsablePoint,
  fullBoundsContent?: boolean,
  useFullBounds?: boolean,
} | [
  ?string,
  TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeParsablePoint | null,
  ?TypeParsablePoint | null,
  ?boolean,
  ?boolean,
];

/**
 * Equation subscript
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} subscript
 * @property {number} [scale] scale of subscript (`0.5`)
 * @property {TypeParsablePoint} [offset] offset of subscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes subscript from size of
 * resulting phrase (`true`)
 * @example
 * // Full object definition
 * {
 *   sub: {
 *     content: 'a',
 *     subscript: 'b',
 *     scale: 0.5,
 *     offset: [0, 0],
 *     inSize: true,
 *   },
 * }
 * @example
 * // Example array definition
 *  { sub: ['a', 'b'] }
 */
export type TypeEquationFunctionSubcript = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  scale?: number,
  offset?: TypeParsablePoint,
  inSize: boolean,
} | [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?boolean,
];

/**
 * Equation superscript
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} superscript
 * @property {number} [scale] scale of superscript (`0.5`)
 * @property {TypeParsablePoint} [offset] offset of superscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes superscript from size of
 * resulting phrase (`true`)
 * @example
 * // Full object definition
 * {
 *   sup: {
 *     content: 'a',
 *     superscript: 'b',
 *     scale: 0.5,
 *     offset: [0, 0],
 *     inSize: true,
 *   },
 * }
 * @example
 * // Example array definition
 *  { sup: ['a', 'b'] }
 */
export type TypeEquationFunctionSuperscript = {
  content: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number,
  offset?: TypeParsablePoint,
  inSize: boolean,
} | [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?boolean,
];

/**
 * Equation superscript and subscript
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} superscript
 * @property {TypeEquationPhrase} subscript
 * @property {number} [scale] scale of superscript (`0.5`)
 * @property {TypeParsablePoint} [superscriptOffset] offset of superscript (`[0, 0]`)
 * @property {TypeParsablePoint} [subscriptOffset] offset of subscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes superscript from size of
 * resulting phrase (`true`)
 * @example
 * // Full object definition
 * {
 *   supSub: {
 *     content: 'a',
 *     superscript: 'b',
 *     subscript: 'c',
 *     scale: 0.5,
 *     superscriptOffset: [0, 0],
 *     subscriptOffset: [0, 0],
 *     inSize: true,
 *   },
 * }
 * @example
 * // Example array definition
 *  { supSub: ['a', 'b', 'c'] }
 */
export type TypeEquationFunctionSuperscriptSubscript = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number;
  superscriptOffset?: TypeParsablePoint;
  subscriptOffset?: TypeParsablePoint;
  inSize?: boolean,
} | [
  TypeEquationPhrase,
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
  ?boolean,
];

/**
 * Equation comment options used with `topComment` and `bottomComment`
 * functions.
 *
 * A symbol between the content and comment is optional.
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} comment
 * @property {string} [symbol] optional symbol between content and comment
 * @property {number} [contentSpace] space from content to symbol (`0.03`)
 * @property {number} [commentSpace] space from symbol to comment (`0.03`)
 * @property {number} [scale] comment scale (`0.6`)
 * @property {boolean} [inSize] `false` excludes the symbol and comment from
 * thre resulting size of the equation phrase (`true`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 * @example
 * // For following examples, a bottom brace is defined as an equation element
 * eqn.addElements({
 *   brace: { symbol: 'brace', side: 'bottom }
 * });
 * @example
 * // BottomComment full object definition
 * {
 *   bottomComment: {
 *     content: 'a',
 *     comment: 'b',
 *     symbol: 'bar',
 *     contentSpace: 0.1,
 *     commentSpace: 0.2,
 *     scale: 2,
 *     inSize: true,
 *     fullContentBounds: false,
 *     useFullBounds: false,
 *   },
 * }
 * @example
 * // Top comment example without symbol
 *  { topComment: ['a', 'b'] }
 * @example
 * // Bottom comment example with symbol
 *  { bottomComment: ['a', 'b', 'brace'] }
 */
export type TypeEquationFunctionComment = {
  content: TypeEquationPhrase;
  comment: TypeEquationPhrase;
  symbol?: string;
  contentSpace?: number;
  commentSpace?: number;
  scale?: number;
  inSize?: boolean;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
} | [
  TypeEquationPhrase,
  TypeEquationPhrase,
  string,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
  ?boolean,
];

export type TypeStrikeCommentObject = {
  content?: TypeEquationPhrase,
  symbol?: string,
  comment?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  scale?: number,
  overhang?: number,
};


export type TypeStrikeCommentArray = [
  ?TypeEquationPhrase,
  ?string,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
];


export type TypePaddingObject = {
  content: TypeEquationPhrase;
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
};
export type TypePaddingArray = [
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeMatrixObject = {
  order?: [number, number],
  left?: string,
  content: TypeEquationPhrase,
  right?: string,                       // $FlowFixM: ,
  scale?: number,
  fit?: 'max' | 'min',
  space?: TypeParsablePoint,
  yAlign?: 'baseline' | 'middle',
  brac?: TypeEquationFunctionBracket,
  fullContentBounds?: boolean,
};

export type TypeMatrixArray = [
  ?[number, number],
  ?string,
  TypeEquationPhrase,
  ?string,
  ?number,
  ?'max' | 'min',
  ?TypeParsablePoint,
  ?'baseline' | 'middle',
  ?TypeEquationFunctionBracket,
  ?boolean,
];

export type TypeAnnotateObject = {
  content: TypeEquationPhrase,
  annotation?: TypeAnnotation,
  annotations?: Array<TypeAnnotation>,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
  glyphs?: {
    encompass?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      topSpace?: number;
      leftSpace?: number;
      bottomSpace?: number;
      rightSpace?: number;
    },
    left?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      topSpace?: number;
      bottomSpace?: number;
      minContentHeight?: number,
      minContentDescent?: number;
      minContentAscent?: number,
      descent?: number,
      height?: number,
      yOffset?: number,
      annotationsOverContent?: boolean,
    },
    right?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      topSpace?: number;
      bottomSpace?: number;
      minContentHeight?: number,
      minContentDescent?: number;
      minContentAscent?: number,
      descent?: number,
      height?: number,
      yOffset?: number,
      annotationsOverContent?: boolean,
    },
    top?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      width?: number,
      leftSpace?: number,
      rightSpace?: number,
      xOffset?: number,
      annotationsOverContent?: boolean,
    },
    bottom?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      width?: number,
      leftSpace?: number,
      rightSpace?: number,
      xOffset?: number,
      annotationsOverContent?: boolean,
    },
  },
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
  rightSpace?: number,
  contentScale?: number,
};

// There are lots of FlowFixMes in this file. This is not perfect, but
// haven't been able to come up with a quick work around. The problem statement
// is each function can accept as arguements either a full object definition
// or the definition split over parameters.
// The problem is then the first arguement can be so many types, some of which
// are subsets of the other, then when its parameters are extracted, their type
// is all confused.

/**
 * Functions used in making equation forms
 */
export class EquationFunctions {
  // eslint-disable-next-line no-use-before-define
  elements: { [name: string]: DiagramElementCollection | DiagramElementPrimitive };
  shapes: {};
  contentToElement: (TypeEquationPhrase | Elements) => Elements;
  phrases: {
    [phraseName: string]: TypeEquationPhrase,
  };

  fullLineHeight: EquationForm | null;
  addElementFromKey: (string, Object) => ?DiagramElementPrimitive;
  getExistingOrAddSymbol: (string | Object) => ?DiagramElementPrimitive;

  // [methodName: string]: (TypeEquationPhrase) => {};

  // eslint-disable-next-line no-use-before-define
  constructor(
    elements: { [name: string]: DiagramElementCollection | DiagramElementPrimitive },
    addElementFromKey: (string) => ?DiagramElementPrimitive,
    getExistingOrAddSymbol: (string | Object) => ?DiagramElementPrimitive,
  ) {
    this.elements = elements;
    this.phrases = {};
    this.fullLineHeight = null;
    this.addElementFromKey = addElementFromKey;
    this.getExistingOrAddSymbol = getExistingOrAddSymbol;
  }

  // eslint-disable-next-line class-methods-use-this
  stringToElement(content: string) {
    if (content.startsWith('space')) {
      const spaceNum = parseFloat(content.replace(/space[_]*/, '')) || 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    if (content.startsWith(' ')) {
      const spaceNum = content.length * 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    const diagramElement = getDiagramElement(this.elements, content);
    if (diagramElement) {
      return new Element(diagramElement);
    }
    if (content in this.phrases) {
      return this.parseContent(this.phrases[content]);
    }
    const elementFromKey = this.addElementFromKey(content, {});
    if (elementFromKey != null) {
      return new Element(elementFromKey);
    }
    return null;
  }

  parseContent(content: ?TypeEquationPhrase) {
    if (content == null) {
      return null;
    }
    if (typeof content === 'number') {
      return null;
    }
    if (content instanceof Elements) {
      return content;
    }
    if (content instanceof BaseAnnotationFunction) {
      return content;
    }
    if (typeof content === 'string') {
      return this.stringToElement(content);
    }
    if (Array.isArray(content)) {
      let elementArray = [];
      content.forEach((c) => {      // $FlowFixMe
        const result = this.parseContent(c);
        if (Array.isArray(result)) {
          elementArray = [...elementArray, ...result];
        } else {
          elementArray.push(result);
        }
      });
      return elementArray;
    }
    // Otherwise its an object
    const [method, params] = Object.entries(content)[0];
    // if (this[method] != null) {
    // return this[method](params);
    // }
    // $FlowFixMe
    const eqnMethod = this.eqnMethod(method, params);
    if (eqnMethod != null) {
      return eqnMethod;
    }
    // If it is not a known function, then it must be a new text or
    // symbol element           // $FlowFixMe
    const elem = this.addElementFromKey(method, params);     // $FlowFixMe
    return new Element(elem);
  }

  contentToElement(
    content: TypeEquationPhrase | Elements | DiagramElementPrimitive | DiagramElementCollection,
  ): Elements {
    // If input is alread an Elements object, then return it
    if (content instanceof Elements) {
      return content._dup();
    }
    if (content instanceof DiagramElementCollection
      || content instanceof DiagramElementPrimitive
    ) {
      return new Elements([new Element(content)]);
    }
    let elementArray = this.parseContent(content);
    if (!Array.isArray(elementArray)) {
      elementArray = [elementArray];
    }
    return new Elements(elementArray);
  }

  eqnMethod(name: string, params: {}) {
    // $FlowFixMe
    if (name === 'frac') { return this.frac(params); }  // $FlowFixMe
    if (name === 'strike') { return this.strike(params); }    // $FlowFixMe
    if (name === 'box') { return this.box(params); }          // $FlowFixMe
    if (name === 'root') { return this.root(params); }        // $FlowFixMe
    if (name === 'brac') { return this.brac(params); }        // $FlowFixMe
    if (name === 'sub') { return this.sub(params); }          // $FlowFixMe
    if (name === 'sup') { return this.sup(params); }          // $FlowFixMe
    if (name === 'supSub') { return this.supSub(params); }    // $FlowFixMe
    if (name === 'topBar') { return this.topBar(params); }    // $FlowFixMe
    if (name === 'bottomBar') { return this.bottomBar(params); } // $FlowFixMe
    if (name === 'annotate') { return this.annotate(params); } // $FlowFixMe
    if (name === 'bottomComment') { return this.bottomComment(params); } // $FlowFixMe
    if (name === 'topComment') { return this.topComment(params); } // $FlowFixMe
    if (name === 'bar') { return this.bar(params); }               // $FlowFixMe
    if (name === 'topStrike') { return this.topStrike(params); }   // $FlowFixMe
    if (name === 'bottomStrike') { return this.bottomStrike(params); } // $FlowFixMe
    if (name === 'pad') { return this.pad(params); }   // $FlowFixMe
    if (name === 'int') { return this.int(params); }   // $FlowFixMe
    if (name === 'sumOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'prodOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'matrix') { return this.matrix(params); }   // $FlowFixMe
    if (name === 'scale') { return this.scale(params); }   // $FlowFixMe
    if (name === 'container') { return this.container(params); }
    return null;
  }

  /**
   * Equation container function
   * @example
   * e = new Equation();
   * e.addElements({
   *   v: { symbol: 'vinculum' },
   * });
   * frac = e.eqn.functions.frac;
   * eqn.addForms({
   *   base: ['a', 'equals', frac(['b', 'v', 'c'])],
   * });
   */
  container(
    optionsOrArray: TypeEquationFunctionContainer,
  ) {
    let content;
    let scale;
    let fit; // fits content to container - width, height, contain, null
    let width;
    let ascent;
    let descent;
    let xAlign; // left, center, right, multiplier (to left)
    let yAlign; // bottom, baseline, middle, top, multiplier (to bottom)
    let fullContentBounds;

    const defaultOptions = {
      scaleModifier: 1,
      fit: null,
      width: null,
      ascent: null,
      descent: null,
      xAlign: 'center',
      yAlign: 'baseline',
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      fit,
      width,
      ascent,
      descent,
      xAlign,
      yAlign,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Container(
      [this.contentToElement(content)],
      [],
      options,
    );
  }

  brac(
    optionsOrArray: TypeEquationFunctionBracket,
  ) {
    let content;
    let left;
    let right;
    let insideSpace;
    let outsideSpace;
    let topSpace;
    let bottomSpace;
    let minContentHeight;
    let minContentDescent;
    let descent;
    let height;
    let inSize;
    let useFullBounds;
    let fullContentBounds;

    if (Array.isArray(optionsOrArray)) {
      [
        left, content, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight,                   // $FlowFixMe
        minContentDescent, height, descent, fullContentBounds,     // $FlowFixMe
        useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        left, content, right, inSize, insideSpace, outsideSpace,
        topSpace, bottomSpace, minContentHeight,
        minContentDescent, height, descent, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const defaultOptions = {
      insideSpace: 0.03,
      outsideSpace: 0.03,
      topSpace: 0.05,
      bottomSpace: 0.05,
      minContentHeight: null,
      minContentDescent: null,
      descent: null,
      height: null,
      inSize: true,
      useFullBounds: false,
      fullContentBounds: false,
    };
    const optionsIn = {
      insideSpace,
      outsideSpace,
      topSpace,
      bottomSpace,
      minContentHeight,
      minContentDescent,
      descent,
      height,
      inSize,
      useFullBounds,
      fullContentBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const glyphs = {};
    if (left) {
      glyphs.left = {
        symbol: left,
        space: options.insideSpace,
        topSpace: options.topSpace,
        bottomSpace: options.bottomSpace,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        descent: options.descent,
        height: options.height,
      };
    }
    if (right) {
      glyphs.right = {
        symbol: right,
        space: options.insideSpace,
        topSpace: options.topSpace,
        bottomSpace: options.bottomSpace,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        descent: options.descent,
        height: options.height,
      };
    }
    return this.annotate({
      content,
      glyphs,
      inSize: options.inSize,
      leftSpace: options.outsideSpace,
      rightSpace: options.outsideSpace,
      useFullBounds: options.useFullBounds,
      fullContentBounds: options.fullContentBounds,
    });
  }

  bar(
    optionsOrArray: TypeEquationFunctionBar,
    forceOptions: Object = {},
  ) {
    let content;
    let symbol;
    let side;
    let space;
    let overhang;
    let length;
    let left;
    let right;
    let top;
    let bottom;
    let inSize;
    let minContentHeight;
    let minContentDescent;
    let minContentAscent;
    let descent;
    let fullContentBounds;
    let useFullBounds;
    const defaultOptions = {
      inSize: true,
      space: 0.03,
      overhang: 0,
      length: null,
      left: null,
      right: null,
      top: null,
      bottom: null,
      side: 'top',
      minContentHeight: null,
      minContentDescent: null,
      minContentAscent: null,
      descent: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      side,
      space,
      overhang,
      length,
      left,
      right,
      top,
      bottom,
      inSize,
      minContentHeight,
      minContentDescent,
      minContentAscent,
      descent,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn, forceOptions);

    const glyphs = {};
    if (options.side === 'top') {
      glyphs.top = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        leftSpace: options.left,
        rightSpace: options.right,
        width: options.length,
      };
    }
    if (options.side === 'bottom') {
      glyphs.bottom = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        leftSpace: options.left,
        rightSpace: options.right,
        width: options.length,
      };
    }
    if (options.side === 'left') {
      glyphs.left = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        topSpace: options.top,
        bottomSpace: options.bottom,
        height: options.length,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        minContentAscent: options.minContentAscent,
        descent: options.descent,
      };
    }
    if (options.side === 'right') {
      glyphs.right = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        topSpace: options.top,
        bottomSpace: options.bottom,
        height: options.length,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        minContentAscent: options.minContentAscent,
        descent: options.descent,
      };
    }
    return this.annotate({
      content,                            // $FlowFixMe
      glyphs,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
    });
  }

  annotate(optionsIn: TypeAnnotateObject) {
    const defaultOptions = {
      inSize: true,
      useFullBounds: false,
      fullContentBounds: false,
      space: 0,
      contentScale: 1,
      encompass: {
        space: 0,
      },
      left: {
        space: 0,
        overhang: 0,
        yOffset: 0,
        annotationsOverContent: false,
      },
      right: {
        space: 0,
        overhang: 0,
        yOffset: 0,
        annotationsOverContent: false,
      },
      top: {
        space: 0,
        overhang: 0,
        xOffset: 0,
        annotationsOverContent: false,
      },
      bottom: {
        space: 0,
        overhang: 0,
        xOffset: 0,
        annotationsOverContent: false,
      },
    };
    const {
      content, annotation, annotations, glyphs,
    } = optionsIn;

    const defaultAnnotation = {
      xPosition: 'center',
      yPosition: 'top',
      xAlign: 'center',
      yAlign: 'bottom',
      offset: new Point(0, 0),
      scale: 1,
      inSize: true,
      fullContentBounds: false,
    };
    let annotationsToProcess = [];
    if (annotation != null) {
      annotationsToProcess.push(annotation);
    } else if (annotations != null) {
      annotationsToProcess = annotations;
    }

    const fillAnnotation = (ann) => {
      const annCopy = joinObjects({}, defaultAnnotation, ann);  // $FlowFixMe
      annCopy.content = this.contentToElement(ann.content);
      return annCopy;
    };

    const fillAnnotations = (anns) => {
      if (anns == null || !Array.isArray(anns)) {
        return [];
      }
      const annsCopy = [];
      anns.forEach((ann) => {
        annsCopy.push(fillAnnotation(ann));
      });
      return annsCopy;
    };
    const annotationsToUse = fillAnnotations(annotationsToProcess);

    const glyphsToUse = {};

    const fillGlyphAnnotation = (side) => {
      if (glyphs == null) {
        return;
      }
      const glyphSide = glyphs[side];
      if (glyphSide == null) {
        return;
      }
      glyphsToUse[side] = {};
      let glyphAnnotationsToProcess = glyphSide.annotations;
      // $FlowFixMe
      if (glyphSide.annotate != null) {      // $FlowFixMe
        glyphAnnotationsToProcess = [glyphSide.annotate];
      }
      const glyphAnnotationsToUse = fillAnnotations(glyphAnnotationsToProcess);
      glyphsToUse[side] = joinObjects({}, defaultOptions[side], glyphSide);
      glyphsToUse[side].annotations = glyphAnnotationsToUse;     // $FlowFixMe
      glyphsToUse[side].glyph = this.getExistingOrAddSymbol(glyphSide.symbol || '');
    };

    fillGlyphAnnotation('encompass');
    fillGlyphAnnotation('left');
    fillGlyphAnnotation('right');
    fillGlyphAnnotation('top');
    fillGlyphAnnotation('bottom');
    const options = joinObjects(defaultOptions, optionsIn);
    return new BaseAnnotationFunction(
      this.contentToElement(content),
      annotationsToUse,       // $FlowFixMe
      glyphsToUse,
      options,
    );
  }


  scale(
    optionsOrArray: TypeEquationFunctionScale,
  ) {
    let content;
    let scale;
    let fullContentBounds;
    const defaultOptions = {
      scaleModifier: 1,
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, scale, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, scale, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Scale(
      [this.contentToElement(content)],
      [],
      options,
    );
  }

  /**
   * Equation fraction function
   * @example
   * e = new Equation();
   * e.addElements({
   *   v: { symbol: 'vinculum' },
   * });
   * frac = e.eqn.functions.frac;
   * eqn.addForms({
   *   base: ['a', 'equals', frac(['b', 'v', 'c'])],
   * });
   */
  frac(
    optionsOrArray: TypeEquationFunctionFraction,
  ) {
    let numerator;
    let denominator;
    let symbol;
    let scale;
    let overhang;
    let numeratorSpace;
    let denominatorSpace;
    let offsetY;
    let fullContentBounds;

    // This is imperfect type checking, as the assumption is if den, sym
    // and fractionScale is null, then they weren't defined by the caller
    // and therefore the caller is passing in a TypeFracObject or TypeFracArray
    // All the flow errors go away if TypeEquationPhrase is removed from
    // optionsOrNum (and then also remove the first if statement below)
    const defaultOptions = {
      scaleModifier: 1,
      numeratorSpace: 0.05,
      denominatorSpace: 0.05,
      offsetY: 0.07,
      overhang: 0.05,
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      overhang,
      numeratorSpace,
      denominatorSpace,
      offsetY,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Fraction(
      [this.contentToElement(numerator), this.contentToElement(denominator)],       // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),
      options,
    );
  }

  root(optionsOrArray: TypeEquationFunctionRoot) {
    let content;
    let root;
    let symbol;
    let space;
    let leftSpace;
    let topSpace;
    let bottomSpace;
    let rightSpace;
    let rootScale;
    let rootOffset;
    let inSize = true;
    let fullContentBounds;
    let useFullBounds;
    if (Array.isArray(optionsOrArray)) {
      [                                                            // $FlowFixMe
        symbol, content, inSize,                                   // $FlowFixMe
        space, topSpace, rightSpace, bottomSpace, leftSpace,       // $FlowFixMe
        root, rootOffset, rootScale, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        symbol, content, inSize,                                   // $FlowFixMe
        space, topSpace, rightSpace, bottomSpace, leftSpace,       // $FlowFixMe
        root, rootOffset, rootScale, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }

    const defaultOptions = {
      space: 0.02,
      rootScale: 0.6,
      rootOffset: [0, 0.06],
      inSize: true,
      fullContentBounds: false,
      useFullBounds: false,
    };
    const optionsIn = {
      leftSpace,
      topSpace,
      bottomSpace,
      rightSpace,
      space,
      rootScale,
      rootOffset,
      inSize,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    options.rootOffset = getPoint(options.rootOffset);
    const annotations = [];
    if (root != null) {
      annotations.push({
        content: root,
        offset: options.rootOffset,
        scale: options.rootScale,
        reference: 'root',
      });
    }
    return this.annotate({
      content,
      inSize: options.inSize,
      useFullBounds: options.useFullBounds,
      fullContentBounds: options.fullContentBounds,
      glyphs: {
        encompass: {
          symbol,       // $FlowFixMe
          annotations,
          space: options.space,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
        },
      },
    });
  }

  supSub(optionsOrArray: TypeEquationFunctionSuperscriptSubscript) {
    let content;
    let superscript = null;
    let subscript = null;
    let scale = null;
    let subscriptOffset = null;
    let superscriptOffset = null;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, superscript, subscript, scale,            // $FlowFixMe
        superscriptOffset, subscriptOffset, inSize,
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, subscript, scale, superscriptOffset, subscriptOffset, inSize,
      } = optionsOrArray);
    }

    const defaultOptions = {
      scale: 0.5,
      subscriptOffset: [0, 0],
      superscriptOffset: [0, 0],
      inSize: true,
    };
    const optionsIn = {
      superscript,
      subscript,
      scale,
      subscriptOffset,
      superscriptOffset,
      inSize,
    };
    const options = joinObjects(defaultOptions, optionsIn);

    const annotations = [];
    if (superscript != null) {
      annotations.push({
        content: options.superscript,
        xPosition: 'right',
        yPosition: '0.7a',
        xAlign: 'left',
        yAlign: 'baseline',
        offset: options.superscriptOffset,
        scale: options.scale,
      });
    }
    if (subscript != null) {
      annotations.push({
        content: options.subscript,
        xPosition: 'right',
        yPosition: 'baseline',
        xAlign: 'left',
        yAlign: '0.7a',
        offset: options.subscriptOffset,
        scale: options.scale,
      });
    }
    return this.annotate({
      content,      // $FlowFixMe
      annotations,
      inSize: options.inSize,
    });
  }

  sup(optionsOrArray: TypeEquationFunctionSuperscript) {
    let content;
    let superscript;
    let scale;
    let offset;
    // let superscriptOffset = null;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, superscript, scale, offset, inSize,           // $FlowFixMe
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, scale, offset, inSize,
      } = optionsOrArray);
    }
    // $FlowFixMe
    return this.supSub({          // $FlowFixMe
      content,                    // $FlowFixMe
      superscript,                // $FlowFixMe
      superscriptOffset: offset,  // $FlowFixMe
      inSize,                     // $FlowFixMe
      scale,
    });
  }

  sub(optionsOrArray: TypeEquationFunctionSubcript) {
    let content;
    let subscript;
    let scale;
    let offset;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, subscript, scale, offset, inSize,           // $FlowFixMe
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, subscript, scale, offset, inSize,
      } = optionsOrArray);
    }
    // $FlowFixMe
    return this.supSub({          // $FlowFixMe
      content,                    // $FlowFixMe
      subscript,                  // $FlowFixMe
      subscriptOffset: offset,    // $FlowFixMe
      inSize,                     // $FlowFixMe
      scale,
    });
  }


  box(
    optionsOrArray: TypeEquationFunctionBox,
  ) {
    let content;
    let symbol;
    let inSize;
    let space;
    let topSpace;
    let bottomSpace;
    let leftSpace;
    let rightSpace;
    let fullContentBounds;
    let useFullBounds;
    const defaultOptions = {
      inSize: false,
      space: 0,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      content,
      symbol,
      inSize,
      space,
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          space: options.space,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
        },
      },
    });
  }

  pad(
    optionsOrContent: TypePaddingObject | TypePaddingArray,
  ) {
    let content;
    let top;
    let right;
    let bottom;
    let left;
    const defaultOptions = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
    if (Array.isArray(optionsOrContent)) {
      [
        content, top, right, bottom, left,
      ] = optionsOrContent;
    } else {
      ({
        content, top, right, bottom, left,
      } = optionsOrContent);
    }
    const optionsIn = {
      top,
      right,
      bottom,
      left,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      topSpace: options.top,
      bottomSpace: options.bottom,
      rightSpace: options.right,
      leftSpace: options.left,
    });
  }

  topBar(optionsOrArray: TypeEquationFunctionBar) {
    return this.bar(optionsOrArray, { side: 'top' });
  }

  bottomBar(optionsOrArray: TypeEquationFunctionBar) {
    return this.bar(optionsOrArray, { side: 'bottom' });
  }


  matrix(optionsOrArray: TypeMatrixObject | TypeMatrixArray) {
    let content;
    let left;
    let right;
    let order;
    let fit;
    let space;
    let scale;
    let yAlign;
    let brac;
    let fullContentBounds;
    const defaultOptions = {
      space: [0.05, 0.05],
      fit: 'min',
      contentScale: 0.7,
      brac: {},
      yAlign: 'baseline',
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        order, left, content, right,
        scale, fit, space, yAlign, brac, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        order, left, content, right,
        scale, fit, space, yAlign, brac, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      space,
      fit,
      order,
      contentScale: scale,
      brac,
      yAlign,
      fullContentBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);

    let contentArray = [];
    if (content != null) {      // $FlowFixMe
      contentArray = content.map(c => this.contentToElement(c));
    }

    if (options.order == null
      || options.order[0] * options.order[1] !== contentArray.length) {
      options.order = [1, contentArray.length];
    }

    if (options.space != null) {
      options.space = getPoint(options.space);
    }

    const matrixContent = new Matrix(
      contentArray,
      [],
      options,
    );
    if (left != null && right != null) {
      return this.brac(joinObjects({}, options.brac, {
        content: matrixContent,
        left,
        right,
      }));
    }
    return matrixContent;
  }


  int(
    optionsOrArray: TypeEquationFunctionIntegral,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let height;
    let yOffset;
    let inSize;
    let from;
    let to;
    let scale;
    let fromScale;
    let toScale;
    // let fromSpace;
    // let toSpace;
    let fromOffset;
    let toOffset;
    let limitsPosition;
    let limitsAroundContent;
    let fromXPosition;
    let fromYPosition;
    let fromXAlign;
    let fromYAlign;
    let toXPosition;
    let toYPosition;
    let toXAlign;
    let toYAlign;
    let fullBoundsContent;
    let useFullBounds;
    const defaultOptions = {
      inSize: true,
      space: 0.05,
      topSpace: 0.1,
      bottomSpace: 0.1,
      height: null,
      yOffset: 0,
      contentScale: 1,
      fromScale: 0.5,
      toScale: 0.5,
      fromOffset: [0, 0],
      toOffset: [0.04, 0],
      limitsPosition: 'side',
      limitsAroundContent: true,
      fromXPosition: 0.5,
      fromYPosition: 'bottom',
      fromXAlign: 'left',
      fromYAlign: 'middle',
      toXPosition: 'right',
      toYPosition: 'top',
      toXAlign: 'left',
      toYAlign: 'middle',
      fullBoundsContent: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [                                                    // $FlowFixMe
        symbol, content, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset, scale,                            // $FlowFixMe
        fromScale, toScale,                                // $FlowFixMe
        fromOffset, toOffset, limitsPosition,              // $FlowFixMe
        limitsAroundContent,                               // $FlowFixMe
        fromXPosition, fromYPosition, fromXAlign, fromYAlign, // $FlowFixMe
        toXPosition, toYPosition, toXAlign, toYAlign, // $FlowFixMe
        fullBoundsContent, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, symbol, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset,                                   // $FlowFixMe
        scale, fromScale, toScale,                         // $FlowFixMe
        fromOffset, toOffset, limitsPosition,              // $FlowFixMe
        limitsAroundContent,                               // $FlowFixMe
        fromXPosition, fromYPosition, fromXAlign, fromYAlign, // $FlowFixMe
        toXPosition, toYPosition, toXAlign, toYAlign, // $FlowFixMe
        fullBoundsContent, useFullBounds,
      } = optionsOrArray);
    }
    if (limitsPosition === 'topBottom') {
      defaultOptions.fromXPosition = 0.1;
      defaultOptions.fromYPosition = 'bottom';
      defaultOptions.fromXAlign = 'center';
      defaultOptions.fromYAlign = 'top';        // $FlowFixMe
      defaultOptions.toXPosition = 0.9;
      defaultOptions.toYPosition = 'top';
      defaultOptions.toXAlign = 'center';
      defaultOptions.toYAlign = 'bottom';
      defaultOptions.fromOffset = [0, -0.04];
      defaultOptions.toOffset = [0, 0.04];
    }
    if (limitsPosition === 'topBottomCenter') {        // $FlowFixMe
      defaultOptions.fromXPosition = 'center';
      defaultOptions.fromYPosition = 'bottom';
      defaultOptions.fromXAlign = 'center';
      defaultOptions.fromYAlign = 'top';
      defaultOptions.toXPosition = 'center';
      defaultOptions.toYPosition = 'top';
      defaultOptions.toXAlign = 'center';
      defaultOptions.toYAlign = 'bottom';
      defaultOptions.fromOffset = [0, -0.04];
      defaultOptions.toOffset = [0, 0.04];
    }
    const optionsIn = {
      space,
      topSpace,
      bottomSpace,
      height,
      yOffset,
      inSize,
      contentScale: scale,
      fromScale,
      toScale,
      // fromSpace,
      // toSpace,
      fromOffset,
      toOffset,
      limitsPosition,
      limitsAroundContent,
      fromXPosition,
      fromYPosition,
      fromXAlign,
      fromYAlign,
      toXPosition,
      toYPosition,
      toXAlign,
      toYAlign,
      fullBoundsContent,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.fromOffset = getPoint(options.fromOffset);
    options.toOffset = getPoint(options.toOffset);

    const annotations = [
      {
        content: to,
        xPosition: options.toXPosition,
        yPosition: options.toYPosition,
        xAlign: options.toXAlign,
        yAlign: options.toYAlign,
        offset: options.toOffset,
        scale: options.toScale,
      },
      {
        content: from,
        xPosition: options.fromXPosition,
        yPosition: options.fromYPosition,
        xAlign: options.fromXAlign,
        yAlign: options.fromYAlign,
        offset: options.fromOffset,
        scale: options.fromScale,
      },
    ];
    return this.annotate({  // $FlowFixMe
      content,
      inSize: options.inSize,
      contentScale: options.contentScale,
      fullBoundsContent: options.fullBoundsContent,
      useFullBounds: options.useFullBounds,
      glyphs: {
        left: {   // $FlowFixMe
          symbol,
          space: options.space,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          height: options.height,
          yOffset: options.yOffset,
          annotationsOverContent: options.limitsAroundContent,
          // $FlowFixMe
          annotations,
        },
      },
    });
  }

  sumOf(options: TypeEquationFunctionSumOf) {
    return this.sumProd(options);
  }

  prodOf(options: TypeEquationFunctionProdOf) {
    return this.sumProd(options);
  }

  sumProd(
    optionsOrArray: TypeEquationFunctionSumOf | TypeEquationFunctionProdOf,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let height;
    let yOffset;
    let inSize;
    let from;
    let to;
    let scale;
    let fromScale;
    let toScale;
    let fromSpace;
    let toSpace;
    let fromOffset;
    let toOffset;
    let fullBoundsContent;
    let useFullBounds;
    const defaultOptions = {
      inSize: true,
      space: 0.05,
      topSpace: 0.07,
      bottomSpace: 0.07,
      height: null,
      yOffset: 0,
      contentScale: 1,
      fromScale: 0.5,
      toScale: 0.5,
      fromSpace: 0.04,
      toSpace: 0.04,
      fromOffset: [0, 0],
      toOffset: [0, 0],
      fullBoundsContent: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset, scale,
        fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
        fullBoundsContent, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset,
        scale, fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
        fullBoundsContent, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      space,
      topSpace,
      bottomSpace,
      height,
      yOffset,
      inSize,
      contentScale: scale,
      fromScale,
      toScale,
      fromSpace,
      toSpace,
      fromOffset,
      toOffset,
      fullBoundsContent,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const annotations = [
      {
        content: to,
        xPosition: 'center',
        yPosition: 'top',
        xAlign: 'center',
        yAlign: 'bottom',
        offset: getPoint(options.toOffset)
          .add(0, options.toSpace),
        scale: options.toScale,
      },
      {
        content: from,
        xPosition: 'center',
        yPosition: 'bottom',
        xAlign: 'center',
        yAlign: 'top',
        offset: getPoint(options.fromOffset)
          .add(0, -options.fromSpace),
        scale: options.fromScale,
      },
    ];
    return this.annotate({
      content,
      contentScale: options.contentScale,
      fullBoundsContent: options.fullBoundsContent,
      useFullBounds: options.useFullBounds,
      glyphs: {
        left: {         // $FlowFixMe
          symbol,         // $FlowFixMe
          annotations,         // $FlowFixMe
          space,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          yOffset: options.yOffset,
          height: options.height,
        },
      },
      inSize: options.inSize,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processComment(
    optionsOrArray: TypeEquationFunctionComment,
  ) {
    let content;
    let comment;
    let symbol;
    let contentSpace;
    let commentSpace;
    let scale;
    let inSize;
    let fullContentBounds;
    let useFullBounds;
    if (Array.isArray(optionsOrArray)) {
      [
        content, comment, symbol, contentSpace, commentSpace, scale, inSize,
        fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, contentSpace, commentSpace, scale, inSize,
        fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      contentSpace,
      commentSpace,
      scale,
      inSize,
      useFullBounds,
      fullContentBounds,
    };
    const defaultOptions = {
      contentSpace: 0.03,
      commentSpace: 0.03,
      scale: 0.6,
      inSize: true,
      fullContentBounds: false,
      useFullBounds: false,
    };

    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, comment, symbol,
      options.contentSpace, options.commentSpace, options.scale,
      options.inSize, options.fullContentBounds, options.useFullBounds,
    ];
  }

  // $FlowFixMe
  topComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, fullContentBounds, useFullBounds,
    ] = this.processComment(...args);
    const annotations = [{
      content: comment,
      xPosition: 'center',
      yPosition: 'top',
      xAlign: 'center',
      yAlign: 'bottom',
      scale: scaleToUse,
      offset: [0, commentSpaceToUse],
    }];
    if (symbol === '' || symbol == null) {
      return this.annotate({
        content,           // $FlowFixMe
        annotations,
        inSize,
      });
    }
    return this.annotate({
      content,
      fullContentBounds,
      useFullBounds,
      glyphs: {
        top: {
          symbol,              // $FlowFixMe
          annotations,
          space: contentSpaceToUse,
        },
      },
      inSize,
    });
  }

  // $FlowFixMe
  bottomComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, fullContentBounds, useFullBounds,
    ] = this.processComment(...args);

    const annotations = [{
      content: comment,
      xPosition: 'center',
      yPosition: 'bottom',
      xAlign: 'center',
      yAlign: 'top',
      scale: scaleToUse,
      offset: [0, -commentSpaceToUse],
    }];

    if (symbol === '' || symbol == null) {
      return this.annotate({
        content,           // $FlowFixMe
        annotations,
        inSize,
      });
    }

    return this.annotate({
      content,
      fullContentBounds,
      useFullBounds,
      glyphs: {
        bottom: {
          symbol,            // $FlowFixMe
          annotations,
          space: contentSpaceToUse,
        },
      },
      inSize,
    });
  }


  strike(
    optionsOrArray: TypeEquationFunctionStrike,
  ) {
    let content;
    let symbol;
    let inSize;
    let space;
    let topSpace;
    let bottomSpace;
    let leftSpace;
    let rightSpace;
    let fullContentBounds;
    let useFullBounds;

    const defaultOptions = {
      inSize: false,
      space: 0.02,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const glyph = this.getExistingOrAddSymbol(symbol);
    if (glyph != null && glyph.custom.options.style === 'horizontal') {
      defaultOptions.space = 0;           // $FlowFixMe
      defaultOptions.leftSpace = 0.02;    // $FlowFixMe
      defaultOptions.rightSpace = 0.02;   // $FlowFixMe
    }
    const optionsIn = {
      content,
      symbol,
      inSize,
      space,
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          space: options.space,
        },
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processStrike(
    optionsOrContent: TypeStrikeCommentObject | TypeStrikeCommentArray,
  ) {
    let content;
    let comment;
    let symbol;
    let commentSpace;
    let scale;
    let overhang;
    let inSize;
    if (Array.isArray(optionsOrContent)) {             // $FlowFixMe
      [content, symbol, comment, inSize, commentSpace, scale, overhang] = optionsOrContent;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, inSize, commentSpace, scale, overhang,
      } = optionsOrContent);
    }
    const optionsIn = {
      inSize,
      commentSpace,
      scale,
      overhang,
    };
    const defaultOptions = {
      commentSpace: 0.1,
      overhang: 0,
      scale: 0.5,
      inSize: true,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, symbol, comment, options.inSize,
      options.commentSpace, options.scale, options.overhang,
    ];
  }

  // $FlowFixMe
  topStrike(...args) {
    const [
      content, symbol, comment, inSize,
      commentSpace, scale, overhang,
    ] = this.processStrike(...args);
    const annotations = [
      {
        content: comment,
        xPosition: 'center',
        yPosition: 'top',
        xAlign: 'center',
        yAlign: 'bottom',
        offset: [0, commentSpace],
        scale,
      },
    ];
    return this.annotate({    // $FlowFixMe
      content,
      inSize,
      glyphs: {
        encompass: {    // $FlowFixMe
          symbol,
          space: overhang,    // $FlowFixMe
          annotations,
        },
      },
    });
  }

  // $FlowFixMe
  bottomStrike(...args) {
    const [
      content, symbol, comment, inSize,
      commentSpace, scale, overhang,
    ] = this.processStrike(...args);
    const annotations = [
      {
        content: comment,
        xPosition: 'center',
        yPosition: 'bottom',
        xAlign: 'center',
        yAlign: 'top',
        offset: [0, -commentSpace],
        scale,
      },
    ];
    return this.annotate({    // $FlowFixMe
      content,
      inSize,
      glyphs: {
        encompass: {    // $FlowFixMe
          symbol,
          space: overhang,    // $FlowFixMe
          annotations,
        },
      },
    });
  }
}
