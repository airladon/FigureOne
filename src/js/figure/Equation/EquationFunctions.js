// @flow
import {
  Point, getPoint,
} from '../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementPrimitive, FigureElementCollection,
} from '../Element';
import {
  BlankElement, Element, Elements,
} from './Elements/Element';
import Fraction from './Elements/Fraction';
// eslint-disable-next-line import/no-cycle
import EquationForm from './EquationForm';
import Matrix from './Elements/Matrix';
import Lines from './Elements/Lines';
import Scale from './Elements/Scale';
import Container from './Elements/Container';
import BaseAnnotationFunction from './Elements/BaseAnnotationFunction';
import EquationLine from './Symbols/Line';
import Offset from './Elements/Offset';
// eslint-disable-next-line import/no-cycle
// import type {
//   EQN_Annotation, EQN_EncompassGlyph, EQN_LeftRightGlyph, EQN_TopBottomGlyph,
// } from './Elements/BaseAnnotationFunction';

export function getFigureElement(
  elementsObject: { [string: string]: FigureElementPrimitive |
                    FigureElementCollection }
                  | FigureElementCollection,
  name: string | FigureElementPrimitive | FigureElementCollection,
): FigureElementPrimitive | FigureElementCollection | null {
  if (typeof name !== 'string') {
    return name;
  }
  if (elementsObject instanceof FigureElementCollection) {
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
 * An equation phrase is used to define an equation form and can be any of the
 * below:
 *
 *  - `string` (which represents the unique identifier of an equation element)
 *  - `{ frac: `{@link EQN_Fraction} `}`
 *  - `{ strike: `{@link EQN_Strike} `}`
 *  - `{ box: `{@link EQN_Box} `}`
 *  - `{ tBox: `{@link EQN_TouchBox} `}`
 *  - `{ root: `{@link EQN_Root} `}`
 *  - `{ brac: `{@link EQN_Bracket} `}`
 *  - `{ sub: `{@link EQN_Subscript} `}`
 *  - `{ sup: `{@link EQN_Superscript} `}`
 *  - `{ supSub: `{@link EQN_SuperscriptSubscript} `}`
 *  - `{ topBar: `{@link EQN_Bar} `}`
 *  - `{ bottomBar: `{@link EQN_Bar} `}`
 *  - `{ annotate: `{@link EQN_Annotate} `}`
 *  - `{ topComment: `{@link EQN_Comment} `}`
 *  - `{ bottomComment: `{@link EQN_Comment} `}`
 *  - `{ pad: `{@link EQN_Pad} `}`
 *  - `{ bar: `{@link EQN_Bar} `}`
 *  - `{ scale: `{@link EQN_Scale} `}`
 *  - `{ container: `{@link EQN_Container} `}`
 *  - `{ offset: `{@link EQN_Offset} `}`
 *  - `{ matrix: `{@link EQN_Matrix} `}
 *  - `{ lines: `{@link EQN_Lines} `}`
 *  - `{ int: `{@link EQN_Integral} `}`
 *  - `{ sumOf: `{@link EQN_SumOf} `}`
 *  - `{ prodOf: `{@link EQN_ProdOf} `}`
 *  - `{ topStrike: `{@link EQN_StrikeComment} `}`
 *  - `{ bottomStrike: `{@link EQN_StrikeComment} `}`
 *  - `Array<TypeEquationPhrase>`
 *
 *
 * @example
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: { equals: ' = ' },
 *     forms: {
 *       form1: 'a',
 *       form2: ['a', 'equals', 'b'],
 *       form3: [{
 *         frac: {
 *           numerator: 'a',
 *           symbol: 'vinculum',
 *           denominator: 'c',
 *         },
 *       }, 'equals', 'b'],
 *       form4: { frac: ['a', 'vinculum', 'c'] },
 *     },
 *   },
 * });
 *
 * figure.getElement('eqn').animations.new()
 *   .goToForm({ target: 'form2', animate: 'move', delay: 1 })
 *   .goToForm({ target: 'form3', animate: 'move', delay: 1 })
 *   .goToForm({ target: 'form4', animate: 'move', delay: 1 })
 *   .start();
 */
export type TypeEquationPhrase =
  string
  | number
  | { frac: EQN_Fraction }
  | { strike: EQN_Strike }
  | { box: EQN_Box }
  | { tBox: EQN_TouchBox }
  | { root: EQN_Root }
  | { brac: EQN_Bracket }
  | { sub: EQN_Subscript }
  | { sup: EQN_Superscript }
  | { supSub: EQN_SuperscriptSubscript }
  | { topBar: EQN_Bar }
  | { bottomBar: EQN_Bar }
  | { annotate: EQN_Annotate }
  | { topComment: EQN_Comment }
  | { bottomComment: EQN_Comment }
  | { pad: EQN_Pad }
  | { bar: EQN_Bar }
  | { scale: EQN_Scale }
  | { container: EQN_Container }
  | { offset: EQN_Offset }
  | { matrix: EQN_Matrix }
  | { matrix: EQN_Lines }
  | { int: EQN_Integral }
  | { sumOf: EQN_SumOf }
  | { prodOf: EQN_ProdOf }
  | { topStrike: EQN_StrikeComment }
  | { bottomStrike: EQN_StrikeComment }
  | Array<TypeEquationPhrase>
  | FigureElementPrimitive
  | FigureElementCollection
  | Elements
  | Element
  | BaseAnnotationFunction;

/**
 * Equation container options
 *
 * ![](./apiassets/eqn_container.gif)
 *
 * A container is useful to fix spacing around content as it changes between
 * equation forms.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [width] (`null`)
 * @property {boolean} [inSize] (`true)
 * @property {number} [descent] (`null`)
 * @property {number} [ascent] (`null`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | 'baseline' | number} [yAlign]  (`'baseline'`)
 * @property {'width' | 'height' | 'contain'} [fit] - fit width,
 * ascent and descent to either match width, height or fully contain the content (`null`)
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] - (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Example showing the difference between with and without container
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // Container object definition
 *       1: [
 *         'length',
 *         {
 *           container: {
 *             content: 'width',
 *             width: 0.5,
 *           },
 *         },
 *         'height',
 *       ],
 *       // Container array definition
 *       2: ['length', { container: ['w', 0.5] }, 'height'],
 *       // No container
 *       3: ['length', ' ', 'w', ' ', 'height']
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 *
 * @example
 * // Create equation object then add to figure
 * const eqn = figure.collections.equation({
 *   forms: {
 *     1: [
 *       'length',
 *       { container: { content: 'width', width: 0.5 } },
 *       'height',
 *     ],
 *     2: ['length', { container: ['w', 0.5] }, 'height'],
 *     3: ['length', ' ', 'w', ' ', 'height']
 *   },
 *   formSeries: ['1', '2', '3'],
 * });
 * figure.add('eqn', eqn);
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Container = {
  content: TypeEquationPhrase,
  width?: number,
  inSize?: boolean,
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
  ?boolean,
  ?number,
  ?number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'middle' | 'top' | 'baseline' | number,
  ?'width' | 'height' | 'contain',
  ?number,
  ?boolean,
];

/**
 * Equation offset options
 *
 * ![](./apiassets/eqn_offset_ex1.png)
 *
 * Offset a phrase from the position it would normally be.
 * An offest phrase will not contribute to layout of subsequent equation
 * elements and phrases.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeParsablePoint} [offset] (`[0, 0]`)
 * @property {boolean} [fullContentBounds] - (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add([
 *   {
 *     name: 'rect1',
 *     method: 'equation',
 *     options: {
 *       forms: {
 *         0: [
 *           'a', '_ = ', 'n',
 *           { offset: ['for a > 0', [0.3, 0]] },
 *         ],
 *       },
 *     },
 *   },
 * ]);
 */
export type EQN_Offset = {
  content: TypeEquationPhrase,
  offset?: TypeParsablePoint,
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?TypeParsablePoint,
  ?boolean,
];

/**
 * Equation fraction options
 *
 * ![](./apiassets/eqn_fraction.gif)
 *
 * A fraction has a numerator and denominator separated by a vinculum
 * symbol {@link EQN_VinculumSymbol}.
 *
 * Options can be an object, or an array in the property order below
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { frac: ['a', 'vinculum', 'b'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing object and array fraction definitions, and nesting
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       v1: { symbol: 'vinculum' },
 *       v2: { symbol: 'vinculum' },
 *       plus: '  +  ',
 *     },
 *     forms: {
 *       // Fraction object form
 *       1: {
 *         frac: {
 *           numerator: 'a',
 *           denominator: 'b',
 *           symbol: 'v1',
 *         },
 *       },
 *       // Fraction array form
 *       2: { frac: ['a', 'v1', 'd'] },
 *       // Nested
 *       3: {
 *         frac: {
 *           numerator: [{ frac: ['a', 'v1', 'd', 0.7] }, 'plus', '_1'],
 *           symbol: 'v2',
 *           denominator: 'b',
 *         }
 *       },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 *
 * @example
 * // Create equation object then add to figure
 * const eqn = figure.collections.equation({
 *   elements: {
 *       v1: { symbol: 'vinculum' },
 *       v2: { symbol: 'vinculum' },
 *       plus: '  +  ',
 *     },
 *     forms: {
 *       1: {
 *         frac: {
 *           numerator: 'a',
 *           denominator: 'b',
 *           symbol: 'v1',
 *         },
 *       },
 *       2: { frac: ['a', 'v1', 'd'] },
 *       3: {
 *         frac: {
 *           numerator: [{ frac: ['a', 'v1', 'd', 0.7] }, 'plus', '_1'],
 *           symbol: 'v2',
 *           denominator: 'b',
 *         }
 *       },
 *     },
 *     formSeries: ['1', '2', '3'],
 * });
 * figure.add('eqn', eqn);
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Fraction = {
  numerator: TypeEquationPhrase;
  symbol: string;
  denominator: TypeEquationPhrase;
  scale?: number;
  numeratorSpace?: number;
  denominatorSpace?: number;
  overhang?: number;
  offsetY?: number;
  baseline?: 'numerator' | 'denominator' | 'vinculum',
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
  ?('numerator' | 'denominator' | 'vinculum'),
  ?boolean,
];

/**
 * Equation scale
 *
 * ![](./apiassets/eqn_scale.gif)
 *
 * Scale an equation phrase
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] Use full bounds with content (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       2: ['a', { scale: ['b', 2] }, 'c'],
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * // Some different bracket examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // Default
 *       1: ['a', 'b', 'c'],
 *       // Array definition magnify
 *       2: ['a', { scale: ['b', 2] }, 'c'],
 *       // Object definition shrink
 *       3: [
 *         'a',
 *         {
 *           scale: {
 *             content: ['b', 1],
 *             scale: 0.5,
 *           },
 *         },
 *         'c',
 *       ],
 *       // Back to start
 *       4: ['a', { scale: ['b', 1] }, 'c'],
 *     },
 *     formSeries: ['1', '2', '3']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Scale = {
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
 * ![](./apiassets/eqn_bracket.gif)
 *
 * Surround an equation phrase with brackets.
 *
 * Symbols that can be used with bracket are:
 * - {@link EQN_BarSymbol}
 * - {@link EQN_ArrowSymbol}
 * - {@link EQN_BraceSymbol}
 * - {@link EQN_BracketSymbol}
 * - {@link EQN_SquareBracketSymbol}
 * - {@link EQN_AngleBracketSymbol}
 *
 * Options can be an object, or an array in the property order below
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       lb: { symbol: 'bracket', side: 'left' },
 *       rb: { symbol: 'bracket', side: 'right' },
 *     },
 *     forms: {
 *       1: ['a', { brac: ['lb', ['b', '_ + ', 'c'], 'rb'] }],
 *     },
 *   },
 * });
 *
 * @example
 * // Some different bracket examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       lb: { symbol: 'bracket', side: 'left' },
 *       rb: { symbol: 'bracket', side: 'right' },
 *       lsb: { symbol: 'squareBracket', side: 'left' },
 *       rsb: { symbol: 'squareBracket', side: 'right' },
 *       leftBrace: { }
 *     },
 *     forms: {
 *       // Array definition
 *       1: ['a', { brac: ['lb', ['b', '_ + ', 'c'], 'rb'] }],
 *       // Object definition
 *       2: ['a', {
 *         brac: {
 *           left: 'lb',
 *           content: { frac: ['b', 'vinculum', 'c'] },
 *           right: 'rb',
 *         },
 *       }],
 *       // Square brackets
 *       3: ['a', { brac: ['lsb', ['b', '_ + ', 'c'], 'rsb'] }],
 *     },
 *     formSeries: ['1', '2', '3']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 */

export type EQN_Bracket = {
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
 * ![](./apiassets/eqn_root.gif)
 *
 * Surround an equation phrase with a radical symbol {@link EQN_RadicalSymbol}
 * and add a custom root if needed
 *
 * Options can be an object, or an array in the property order below.
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { root: ['radical', 'a'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing object and array root definitions, and custom roots
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       r: { symbol: 'radical' },
 *       plus: '  +  ',
 *     },
 *     formDefaults: { alignment: { fixTo: 'd' } },
 *     forms: {
 *       // Root object form
 *       1: {
 *         root: {
 *           symbol: 'r',
 *           content: ['a', 'plus', 'd'],
 *         },
 *       },
 *       // Root array form
 *       2: { root: ['r', 'd'] },
 *       // Cube root
 *       3: { root: { content: 'd', symbol: 'r', root: '_3' } },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 *
 * @example
 * // Create equation object then add to figure
 * const eqn = figure.collections.equation({
 *   elements: {
 *     r: { symbol: 'radical' },
 *     plus: '  +  ',
 *   },
 *   formDefaults: {
 *     alignment: { fixTo: 'd' },
 *   },
 *   forms: {
 *     1: {
 *       root: {
 *         symbol: 'r',
 *         content: ['a', 'plus', 'd'],
 *       },
 *     },
 *     2: { root: ['r', 'd'] },
 *     3: { root: { content: 'd', symbol: 'r', root: '_3' } },
 *   },
 *   formSeries: ['1', '2', '3'],
 * });
 * figure.add('eqn', eqn);
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */

export type EQN_Root = {
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
 * ![](./apiassets/eqn_strike.gif)
 *
 * Overlay a strike symbol on an equation phrase.
 *
 * Use with {@link EQN_Strike} symbol.
 *
 * Options can be an object, or an array in the property order below
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       x: { symbol: 'strike', color: [0.6, 0.6, 0.6, 1] },
 *     },
 *     forms: {
 *       1: [{ strike: ['a', 'x']}, ' ', 'b'],
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different strike examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       s1: { symbol: 'strike', color: [0.6, 0.6, 0.6, 1] },
 *       s2: { symbol: 'strike', style: 'forward', color: [0.6, 0.6, 0.6, 1] },
 *     },
 *     forms: {
 *       // Array definition
 *       1: [{ strike: ['a', 's1']}, ' ', 'b'],
 *       // Object definition
 *       2: {
 *         strike: {
 *           content: ['a', '_ + ', 'b'],
 *           symbol: 's1',
 *         },
 *       },
 *       // Additional options to make strike overhang more
 *       3: {
 *         strike: {
 *           content: ['a', 'b'],
 *           symbol: 's1',
 *           topSpace: 0.2,
 *           rightSpace: 0.2,
 *           leftSpace: 0.2,
 *           bottomSpace: 0.2,
 *         },
 *       },
 *       // Forward strike
 *       4: { strike: [['a', '_ +', 'b'], 's2'] },
 *     },
 *     formSeries: ['1', '2', '3', '4']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Strike = {
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
 * ![](./apiassets/eqn_box.gif)
 *
 * Place a {@link EQN_BoxSymbol} around an equation phrase
 *
 *
 * Options can be an object, or an array in the property order below
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
 *
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { box: ['a', 'box', true, 0.1] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different box examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       box: { symbol: 'box' },
 *     },
 *     forms: {
 *       // Array equation
 *       1: ['a', { box: ['b', 'box'] }, 'c'],
 *       // Object definition
 *       2: {
 *         box: {
 *           content: ['a', 'b', 'c'],
 *           symbol: 'box',
 *         },
 *       },
 *       // Additional options for layout
 *       3: {
 *         box: {
 *           content: ['a', 'b', 'c'],
 *           symbol: 'box',
 *           space: 0.2,
 *         },
 *       },
 *       // Box is included in the layout spacing
 *       4: [
 *         'a',
 *         {
 *           box: {
 *             content: 'b',
 *             symbol: 'box',
 *             space: 0.2,
 *             inSize: true,
 *           },
 *         },
 *         'c'
 *       ],
 *     },
 *     formSeries: ['1', '2', '3', '4']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Box = {
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
 * Equation touch box
 *
 * Place a box symbol around an equation phrase
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {string} symbol
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
 *
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 */
export type EQN_TouchBox = {
  content: TypeEquationPhrase,
  symbol: string,
  space?: number,
  topSpace?: number,
  rightSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
} | [
  TypeEquationPhrase,
  string,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
];

/**
 * Equation bar
 *
 * ![](./apiassets/eqn_bar.gif)
 *
 * Place a bar (or bracket) symbol to the side of an equation phrase.
 *
 * Symbols that can be used with bar are:
 * - {@link EQN_BarSymbol}
 * - {@link EQN_ArrowSymbol}
 * - {@link EQN_BraceSymbol}
 * - {@link EQN_BracketSymbol}
 * - {@link EQN_SquareBracketSymbol}
 * - {@link EQN_AngleBracketSymbol}
 *
 * Options can be an object, or an array in the property order below
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
 * @property {number} [right] amount symbol extends beyond content to the right
 * (overrides `overhang` and `length`, and only for side `'top'` or `'bottom'`)
 * @property {number} [top] amount symbol extends beyond content to the top
 * (overrides `overhang` and `length`, and only for side `'left'` or `'right'`)
 * @property {number} [bottom] amount symbol extends beyond content to the
 * bottom (overrides `overhang` and `length`, and only for side `'left'` or
 * `'right'`)
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       bar: { symbol: 'bar', side: 'top' },
 *     },
 *     forms: {
 *       1: { bar: ['a', 'bar', 'top'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different bar examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       hBar: { symbol: 'bar', side: 'top' },
 *       vBar: { symbol: 'bar', side: 'right' },
 *       hArrow: { symbol: 'arrow', direction: 'right' },
 *     },
 *     forms: {
 *       // Array equation
 *       1: { bar: [['a', 'b'], 'hBar', 'top'] },
 *       // Object definition
 *       2: {
 *         bar: {
 *           content: ['a', 'b'],
 *           symbol: 'hBar',
 *           side: 'bottom',
 *         },
 *       },
 *       // Additional options for layout
 *       3: {
 *         bar: {
 *           content: ['a', 'b'],
 *           symbol: 'vBar',
 *           side: 'right',
 *           overhang: 0.1,
 *         },
 *       },
 *       // Vector arrow
 *       4: {
 *         bar: {
 *           content: ['a', 'b'],
 *           symbol: 'hArrow',
 *           side: 'top',
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3', '4']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Bar = {
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
 * ![](./apiassets/eqn_integral.gif)
 *
 * Place an integral (with optional limits) before an equation phrase
 *
 * Use with a {@link EQN_IntegralSymbol} symbol.
 *
 * Options can be an object, or an array in the property order below.
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { int: ['int', 'x dx', 'a', 'b'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing different integral options
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       i: { symbol: 'int' },
 *       // ic: { symbol: 'int', num: 1, type: 'line' },
 *     },
 *     formDefaults: { alignment: { fixTo: 'x' } },
 *     forms: {
 *       // Root object form
 *       1: {
 *         int: {
 *           symbol: 'i',
 *           content: ['x', ' ', 'dx'],
 *           from: 'a',
 *           to: 'b',
 *         },
 *       },
 *       // Root array form
 *       2: { int: ['i', ['x', '  ', '+', ' ', '_1', ' ', 'dx'], 'a', 'b'] },
 *       // Indefinite tripple integral
 *       3: { int: ['i', ['x', '  ', '+', ' ', '_1', ' ', 'dx']] },
 *       // Custom spacing
 *       4: {
 *         int: {
 *           symbol: 'i',
 *           content: ['x', '  ', '+', ' ', '_1', ' ', 'dx'],
 *           to: 'b',
 *           from: { frac: ['a', 'vinculum', 'd + 2'] },
 *           topSpace: 0.2,
 *           bottomSpace: 0.2,
 *           limitsAroundContent: false,
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3', '4'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Integral = {
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
 * ![](./apiassets/eqn_sumof.gif)
 *
 * Place an equation phrase in a sum of operation with the symbol
 * {@link EQN_SumSymbol}.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {string} symbol
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} [from]
 * @property {TypeEquationPhrase} [to]
 * @property {boolean} [inSize] `false` excludes sum of operator from size of
 * resulting phrase (`true`)
 * @property {number} [space] horiztonaly space between symbol and content (`0.1`)
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { sumOf: ['sum', 'x', 'b', 'a'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing different options
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       s: { symbol: 'sum', draw: 'dynamic' },
 *       inf: '\u221e',
 *     },
 *     forms: {
 *       // Object form
 *       1: {
 *         sumOf: {
 *           symbol: 's',
 *           content: [{ sup: ['x', 'n'] }],
 *           from: ['n_1', ' ', '=', ' ', '_0'],
 *           to: '_10',
 *         },
 *       },
 *       // Array form
 *       2: { sumOf: ['s', [{ sup: ['x', 'm'] }], 'm_1', null]},
 *       // Styling with options
 *       3: {
 *         sumOf: {
 *           symbol: 's',
 *           content: { frac: [['x', ' ', '+', ' ', 'm'], 'vinculum', 'a'] },
 *           from: ['m_1', ' ', '=', ' ', '_0'],
 *           to: 'inf',
 *           fromScale: 0.8,
 *           toScale: 0.8,
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_SumOf = {
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
 * Place an equation phrase in a product of operation with the symbol
 * {@link EQN_ProdSymbol}.
 *
 * ![](./apiassets/eqn_prodof.gif)
 *
 * Place an equation phrase in a product of operation
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {string} symbol
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} [from]
 * @property {TypeEquationPhrase} [to]
 * @property {boolean} [inSize] `false` excludes product of operator from size of
 * resulting phrase (`true`)
 * @property {number} [space] horiztonaly space between symbol and content (`0.1`)
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
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { prodOf: ['prod', 'x', 'b', 'a'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing different options
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       p: { symbol: 'prod', draw: 'dynamic' },
 *       inf: '\u221e',
 *     },
 *     forms: {
 *       // Object form
 *       1: {
 *         prodOf: {
 *           symbol: 'p',
 *           content: [{ sup: ['x', 'n'] }],
 *           from: ['n_1', ' ', '=', ' ', '_0'],
 *           to: '_10',
 *         },
 *       },
 *       // Array form
 *       2: { prodOf: ['p', [{ sup: ['x', 'm'] }], 'm_1', null]},
 *       // Styling with options
 *       3: {
 *         prodOf: {
 *           symbol: 'p',
 *           content: { frac: [['x', ' ', '+', ' ', 'm'], 'vinculum', 'a'] },
 *           from: ['m_1', ' ', '=', ' ', '_0'],
 *           to: 'inf',
 *           fromScale: 0.8,
 *           toScale: 0.8,
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_ProdOf = {
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
 * ![](./apiassets/eqn_subscript.gif)
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} subscript
 * @property {number} [scale] scale of subscript (`0.5`)
 * @property {TypeParsablePoint} [offset] offset of subscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes subscript from size of
 * resulting phrase (`true`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * //Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { sub: ['x', '_2'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Example showing different subscript options
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // Object form
 *       1: {
 *         sub: {
 *           content: 'x',
 *           subscript: 'b',
 *         },
 *       },
 *       // Array form
 *       2: [{ sub: ['x', 'b'] }, ' ', { sub: ['y', 'd'] }],
 *       3: { sub: ['x', ['b', '  ', '+', '  ', 'd']] },
 *       // Subscript offset to adjust layout to keep animation smooth
 *       4: {
 *         sub: {
 *           content: 'x',
 *           subscript: { frac: [['b', '  ', '+', '  ', 'd'], 'vinculum', '_2'] },
 *           offset: [-0.025, -0.02],
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3', '4'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Subscript = {
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
 * ![](./apiassets/eqn_superscript.gif)
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} superscript
 * @property {number} [scale] scale of superscript (`0.5`)
 * @property {TypeParsablePoint} [offset] offset of superscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes superscript from size of
 * resulting phrase (`true`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { sup: ['e', 'x'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Examples of superscript animations
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // Object form
 *       1: {
 *         sup: {
 *           content: 'e',
 *           superscript: 'x',
 *         },
 *       },
 *       // Array form
 *       2: [{ sup: ['e', 'x'] }, '  ', { sup: ['e_1', 'y'] }],
 *       3: { sup: ['e', ['x', '  ', '+', '  ', 'y']] },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Superscript = {
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
 * ![](./apiassets/eqn_supsub.gif)
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} superscript
 * @property {TypeEquationPhrase} subscript
 * @property {number} [scale] scale of superscript (`0.5`)
 * @property {TypeParsablePoint} [superscriptOffset] offset of superscript (`[0, 0]`)
 * @property {TypeParsablePoint} [subscriptOffset] offset of subscript (`[0, 0]`)
 * @property {boolean} [inSize] `true` excludes superscript from size of
 * resulting phrase (`true`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { supSub: ['x', 'b', 'a'] },
 *     },
 *   },
 * });
 *
 * @example
 * // Example showing different super-sub script options
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // Object form
 *       1: {
 *         supSub: {
 *           content: 'x',
 *           superscript: 'b',
 *           subscript: 'a',
 *         },
 *       },
 *       // Array form
 *       2: [{ supSub: ['x', 'b', 'a'] }, '  ', { supSub: ['x_1', 'c', 'a_1'] }],
 *       3: { supSub: ['x', ['b', '  ', '+', '  ', 'c'], 'a'] },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 */
export type EQN_SuperscriptSubscript = {
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
 * ![](./apiassets/eqn_comment.gif)
 *
 * A symbol between the content and comment is optional.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {TypeEquationPhrase} comment
 * @property {string} [symbol] optional symbol between content and comment
 * @property {number} [contentSpace] space from content to symbol (`0.03`)
 * @property {number} [commentSpace] space from symbol to comment (`0.03`)
 * @property {number} [contentLineSpace] space between a line symbol and
 * content (`0.03`)
 * @property {number} [commentLineSpace] space between a line symbol and
 * comment (`0.03`)
 * @property {number} [scale] comment scale (`0.6`)
 * @property {boolean} [inSize] `false` excludes the symbol and comment from
 * thre resulting size of the equation phrase (`true`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: { topComment: ['radius', 'r = 1'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different comment examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       bBkt: { symbol: 'bracket', side: 'bottom' },
 *       tBrc: { symbol: 'brace', side: 'top' },
 *       bSqr: { symbol: 'squareBracket', side: 'bottom' },
 *     },
 *     forms: {
 *       // Array equation
 *       1: { topComment: ['a \u00d7 b \u00d7 c', 'b = 1, c = 1', 'tBrc'] },
 *       // Object definition
 *       2: {
 *         bottomComment: {
 *           content: 'a \u00d7 b \u00d7 c',
 *           symbol: 'bBkt',
 *           comment: 'b = 1, c = 1',
 *         },
 *       },
 *       // Additional options for layout
 *       3: {
 *         bottomComment: {
 *           content: 'a \u00d7 b \u00d7 c',
 *           symbol: 'bSqr',
 *           comment: 'b = 1, c = 1',
 *           contentSpace: 0.1,
 *           commentSpace: 0.1,
 *           scale: 0.7,
 *         },
 *       },
 *       // Just comment
 *       4: {
 *         bottomComment: {
 *           content: 'a \u00d7 b \u00d7 c',
 *           comment: 'for a > 3',
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3', '4']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Comment = {
  content: TypeEquationPhrase;
  comment: TypeEquationPhrase;
  symbol?: string;
  contentSpace?: number;
  commentSpace?: number;
  contentLineSpace?: number;
  commentLineSpace?: number;
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

/**
 * Equation strike with comment options used with `topStrike` and `bottomStrike`
 * functions.
 *
 * ![](./apiassets/eqn_strikecomment.gif)
 *
 * Use with {@link EQN_Strike} symbol.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {string} symbol strike symbol
 * @property {TypeEquationPhrase} comment
 * @property {boolean} [inSize] `false` excludes the symbol and comment from
 * thre resulting size of the equation phrase (`true`)
 * @property {number} [space] top, right, bottom and left extension of symbol
 * beyond content (`0.03`)
 * @property {number} [scale] comment scale (`0.6`)
 * @property {number} [commentSpace] space from symbol to comment (`0.03`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       x: { symbol: 'strike', color: [0.6, 0.6, 0.6, 1] },
 *     },
 *     forms: {
 *       1: { topStrike: ['radius', 'x', 'radius = 1'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different strike examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       s1: { symbol: 'strike', style: 'forward', color: [0.6, 0.6, 0.6, 1] },
 *     },
 *     forms: {
 *       // Array equation
 *       1: { topStrike: ['radius', 's1', 'radius = 1'] },
 *       // Object definition
 *       2: {
 *         bottomStrike: {
 *           content: 'radius',
 *           symbol: 's1',
 *           comment: 'radius = 1',
 *         },
 *       },
 *       // Additional options for layout
 *       3: {
 *         bottomStrike: {
 *           content: 'radius',
 *           comment: 'radius = 1',
 *           symbol: 's1',
 *           scale: 0.8,
 *           space: 0.1,
 *           commentSpace: 0.01,
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_StrikeComment = {
  content?: TypeEquationPhrase,
  symbol?: string,
  comment?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  scale?: number,
  commentSpace?: number,
} | [
  ?TypeEquationPhrase,
  ?string,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
];


/**
 * Equation padding options.
 *
 * ![](./apiassets/eqn_pad.gif)
 *
 * Pads the size of the equation phrase with space.
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [top] (`0`)
 * @property {number} [right] (`0`)
 * @property {number} [bottom] (`0`)
 * @property {number} [left] (`0`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       1: ['a', { pad: ['b', 0.1, 0.1, 0.1, 0.1] }, 'c'],
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different padding examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       // No padding
 *       1: ['a', 'b', 'c'],
 *       // Array form
 *       2: ['a', { pad: ['b', 0.1, 0.1, 0.1, 0.1] }, 'c'],
 *       // Object form
 *       3: [
 *         'a',
 *         {
 *           pad: {
 *             content: 'b',
 *             left: 0.3,
 *             right: 0.1,
 *           },
 *         },
 *         'c',
 *       ],
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Pad = {
  content: TypeEquationPhrase;
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
} | [
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?number,
];

/**
 * Equation matrix
 *
 * ![](./apiassets/eqn_matrix.gif)
 *
 * Options can be an object, or an array in the property order below
 *
 * @property {[number, number]} [order] (`[1, length-of-content]`)
 * @property {string} [left] left bracket symbol
 * @property {Array<TypeEquationPhrase>} [content] Array of equation phrases
 * where each element is a matrix element
 * @property {string} [right] right bracket symbol
 * @property {number} [scale] scale of matrix elements (`0.7`)
 * @property {'max' | 'min' | TypeParsablePoint} [fit] cell size -
 * `min` each cell is a rectangle with width equal to largest width in its
 * column, and height equal to largest height in its row - `max`
 * all cells are a square with dimension equal to the largest dimension of the
 * largest cell - `point` all cells are a rectangle with width as point.x and
 * height as point.y - note - `max` and `point` only work with
 * `yAlign`=`'middle'` (`'min'`)
 * @property {TypeParsablePoint} [space] space between each cell
 * (`[0.05, 0.05]`)
 * @property {'baseline' | 'middle'} [yAlign] align cells in a row with the
 * text baseline, or middle of the cell (`baseline`)
 * @property {EQN_Bracket} [brac] bracket options not including
 * the symbols (`{}`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       lb: { symbol: 'squareBracket', side: 'left' },
 *       rb: { symbol: 'squareBracket', side: 'right' },
 *     },
 *     forms: {
 *       1: { matrix: [[2, 2], 'lb', ['a', 'b', 'c', 'd'], 'rb'] },
 *     },
 *   },
 * });
 * figure.elements._eqn.showForm('1');
 *
 * @example
 * // Some different equation examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       lb: { symbol: 'squareBracket', side: 'left' },
 *       rb: { symbol: 'squareBracket', side: 'right' },
 *       v: { symbol: 'vinculum' },
 *     },
 *     phrases: {
 *       f: { frac: ['a', 'v', 'b'] },
 *     },
 *     forms: {
 *       // Array equation 2x2 matrix
 *       1: { matrix: [[2, 2], 'lb', ['a', 'b', 'c', 'd'], 'rb'] },
 *       // Object definition vector
 *       2: {
 *         matrix: {
 *           content: ['a', 'b', 'c', 'd'],
 *           left: 'lb',
 *           right: 'rb',
 *           order: [1, 4],
 *         },
 *       },
 *       // Additional options for layout
 *       3: {
 *         matrix: {
 *           content: ['f', 'wxyz', 'c', 'd'],
 *           symbol: 'bSqr',
 *           left: 'lb',
 *           right: 'rb',
 *           order: [2, 2],
 *         },
 *       },
 *       // Fixed size matrix cells
 *       4: {
 *         matrix: {
 *           content: ['f', 'wxyz', 'c', 'd'],
 *           symbol: 'bSqr',
 *           left: 'lb',
 *           right: 'rb',
 *           order: [2, 2],
 *           fit: [0.2, 0.2],
 *           yAlign: 'middle',
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3', '4']
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Matrix = {
  order?: [number, number],
  left?: string,
  content: TypeEquationPhrase,
  right?: string,
  scale?: number,
  fit?: 'max' | 'min' | TypeParsablePoint,
  space?: TypeParsablePoint,
  yAlign?: 'baseline' | 'middle',
  brac?: EQN_Bracket,
  fullContentBounds?: boolean,
} | [
  ?[number, number],
  ?string,
  TypeEquationPhrase,
  ?string,
  ?number,
  ?'max' | 'min',
  ?TypeParsablePoint,
  ?'baseline' | 'middle',
  ?EQN_Bracket,
  ?boolean,
];


/**
 * Single equation line definition
 *
 * Overrides default values of `baselineSpace` and `space` from
 * {@link EQN_Lines}.
 *
 * Use `justify` to define a specific element of the line to align the other
 * lines with.
 *
 * @property {TypeEquationPhrase} content Array of equation
 * phrases or equation line objects
 * @property {string} [justify] when {@link EQN_Lines}`.justify` is `'element'`,
 * use this property to define which element of the line to justify with. If
 * no element is specified, then left justification will be used.
 * @property {number} [space] default space between descent of previous line and
 * ascent of the this line (`0`).
 * @property {number | null} [baselineSpace] default space between baseline of
 * previous line and ascent of this line. If not `null` then will override
 * `space` (`null`).
 * @property {number} [offset] x Offset of line from justification position
 * (`0`)
 *
 * @see {@link EQN_Lines}
 *
 */
export type EQN_Line = {
  content: TypeEquationPhrase,
  baselineSpace?: null | number,
  space?: number,
  justify?: string,
  offset?: number,
}

/**
 * Equation lines.
 *
 * ![](./apiassets/eqn_lines_anim.gif)
 *
 * Options can be an object, or an array in the property order below
 *
 * The equation lines function can split an equation into multiple lines.
 * This might be because one line is too long, or it might be convenient to
 * display different forms of the same equation simultaneously on different
 * lines and then animate between them.
 *
 * Lines can be justified to the left, center or right, or lines can be aligned
 * with a specific element from each line (for instance an equals sign). To
 * justify to a specific element, use `justify: 'element'` and then define the
 * element name in the `justify` property of each line.
 *
 * Lines can be aligned in y with either the top most part of the top line, the
 * bottom most part of the bottom line, the middle of the lines or any of the
 * line's baselines.
 *
 * Spacing between lines is defined as either the space between the lowest
 * point (descent) of one line to the highest point (ascent) of the next,
 * or as the space between line baselines.
 * @property {Array<EQN_Line | TypeEquationPhrase>} content Array of equation
 * phrases or equation line objects
 * @property {'left' | 'center' | 'right' | 'element'} [justify] how to align
 * the lines in x. Use 'element' to align the lines with a specific element
 * from each line (that is defined with the `justify` property in each line)
 * (`'left'`)
 * @property {number | null} [baselineSpace] default space between baselines
 * of lines. If not `null` then will override `space` (`null`).
 * @property {number} [space] default space between descent of one line and
 * ascent of the next line (`0`).
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] How to align the
 * lines in y. `number` can be any line index, and it will align the baseline
 * of that line. So, using `0` will align the first line's baseline. (`0`)
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Two lines, array definition
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       0: {
 *         lines: [
 *           [
 *             ['a', '_ = ', 'b', '_ + _1', 'c', '_ - _1', 'd'],
 *             ['_ + _2', 'e', '_ - _2', 'f'],
 *           ],
 *           'right',
 *           0.2,
 *         ],
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Two lines animating to 1
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       equals1: ' = ',
 *       equals2: ' = ',
 *     },
 *     forms: {
 *       0: {
 *         lines: {
 *           content: [
 *             {
 *               content: ['a_1', 'equals1', 'b', '_ + ', 'c'],
 *               justify: 'equals1',
 *             },
 *             {
 *               content: ['d', '_ - ', 'e', 'equals2', 'a_2'],
 *               justify: 'equals2',
 *             },
 *           ],
 *           space: 0.08,
 *           justify: 'element',
 *         },
 *       },
 *       1: ['d', '_ - ', 'e', 'equals1', 'b', '_ + ', 'c'],
 *     },
 *   },
 * });
 *
 * figure.getElement('eqn').showForm(0);
 * figure.getElement('eqn').animations.new()
 *   .goToForm({
 *     delay: 1, target: '1', duration: 1, animate: 'move',
 *   })
 *   .start();
 */
export type EQN_Lines = {
  content: Array<TypeEquationPhrase | EQN_Line>,
  justify?: 'left' | 'right' | 'center' | 'element',
  baselineSpace?: null | number,
  space?: number,
  yAlign?: 'bottom' | 'top' | 'middle' | number,
  fullContentBounds?: boolean,
};

/**
 * Annotation options object.
 *
 * ![](./apiassets/eqn_annotation_1.png)
 *
 * ![](./apiassets/eqn_annotation_2.png)
 *
 * An annotation's layout is defined by its *position* and *alignement*.
 * For instance, an annotation at the top right of the content:
 * <pre>
 *                  AAAA
 *                  AAAA
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 * </pre>
 * has a *position* relative to the content:
 * * `xPosition`: `'right'`
 * * `yPosition`: `'top'`
 *
 * and an *alignment* relative to the annotation:
 * * `xAlign`: `'left'`
 * * `yAlign`: `'bottom'`
 *
 *
 * In comparison, if `yAlign` were equal to `'top'`, then it would result in:
 * <pre>
 *          CCCCCCCCAAAA
 *          CCCCCCCCAAAA
 *          CCCCCCCC
 *          CCCCCCCC
 * </pre>
 * @property {TypeEquationPhrase} content
 * @property {'left' | 'center' | 'right' | number} [xPosition] where number is
 *  the percentage width of the content (`'center'`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top' | number} [yPosition]
 * where number is the percentage height of the content (`'top'`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] where number is
 * the percentage width of the annotation (`'center'`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top' | number} [yAlign] where
 * number is the percentage width of the annotation (`'bottom'`)
 * @property {Point} [offset] annotation offset (`[0, 0]`)
 * @property {number} [scale] annotation scale (`1`)
 * @property {boolean} [inSize] (`true`)
 * @property {boolean} [fullContentBounds] (`false`)
 * @property {string} [reference] calling getBounds on a glyph can return a
 * suggested position, alignment and offset of an annotation with some name. If
 * this name is defined here, then `xPosition`, `yPosition`, `xAlign`, `yAlign`
 * and `offset` will be overwritten with the glyph's suggestion.
 *
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           annotation: {
 *             content: 'b',
 *             xPosition: 'left',
 *             yPosition: 'top',
 *             xAlign: 'right',
 *             yAlign: 'bottom',
 *             scale: 0.5,
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 *
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           annotations: [
 *             {
 *               content: 'b',
 *               xPosition: 'left',
 *               yPosition: 'bottom',
 *               xAlign: 'right',
 *               yAlign: 'top',
 *               scale: 0.5,
 *             },
 *             {
 *               content: 'c',
 *               offset: [0, 0.05],
 *               scale: 0.5,
 *             },
 *           ],
 *         },
 *       },
 *     },
 *   },
 * });
 */
export type EQN_Annotation = {
  xPosition: 'left' | 'center' | 'right' | number,
  yPosition: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  offset: Point,
  scale: number,
  content: TypeEquationPhrase,
  inSize: boolean,
  fullContentBounds: boolean,
  reference?: string,
};

/**
 * Encompass glyph options object.
 *
 * ![](./apiassets/eqn_encompass_glyph.png)
 *
 * A glyph can encompass (surround or overlay) an equation phrase (*content*). The glyph
 * can also be annotated.
 * <pre>
 *
 *       gggggggggggggg
 *       gggCCCCCCCCggg
 *       gggCCCCCCCCggg
 *       gggCCCCCCCCggg
 *       gggCCCCCCCCggg
 *       gggggggggggggg
 *
 * </pre>
 * @property {string} symbol
 * @property {EQN_Annotation} [annotation] use for one annotation only instead
 * of property `annotations`
 * @property {Array<EQN_Annotation>} [annotations] use for one or more
 * annotations
 * @property {number} [space] default space the glyph should extend beyond the
 * top, right, left and bottom sides of the content (`0`)
 * @property {number} [topSpace] space the glyph extends beyond the content top
 * @property {number} [rightSpace] space the glyph extends beyond the content
 * right
 * @property {number} [bottomSpace] space the glyph extends beyond the content
 * bottom
 * @property {number} [leftSpace] space the glyph extends beyond the content
 * left
 * @example
 *  // surrounding content with a box glyph
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       box: { symbol: 'box', lineWidth: 0.005 },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           glyphs: {
 *             encompass: {
 *               symbol: 'box',
 *               space: 0.1, // e.g. only, this will be overwritten by next props
 *               topSpace: 0.1,
 *               rightSpace: 0.1,
 *               bottomSpace: 0.1,
 *               leftSpace: 0.1,
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 */
export type EQN_EncompassGlyph = {
  symbol?: string,
  annotation?: EQN_Annotation,
  annotations?: Array<EQN_Annotation>,
  space: number;
  topSpace?: number;
  rightSpace?: number;
  bottomSpace?: number;
  leftSpace?: number;
};

/**
 * Left/Right glyph options object.
 *
 * ![](./apiassets/eqn_leftrightglyph1.png)
 *
 * ![](./apiassets/eqn_leftrightglyph2.png)
 *
 * ![](./apiassets/eqn_leftrightglyph3.png)
 *
 * A glyph can be to the left or right of an equation phrase (*content*).
 * The glyph can also be annotated.
 * <pre>
 *
 *       ggg   CCCCCCCC   ggg
 *       ggg   CCCCCCCC   ggg
 *       ggg   CCCCCCCC   ggg
 *       ggg   CCCCCCCC   ggg
 *
 * </pre>
 * @property {string} symbol
 * @property {EQN_Annotation} [annotation] use for one annotation only instead
 * of property `annotations`
 * @property {Array<EQN_Annotation>} [annotations] use for one or more
 * annotations
 * @property {number} [space] horizontal space between glyph and content (`0`)
 * @property {number} [overhang] amount glyph extends above content top and
 * below content bottom (`0`)
 * @property {number} [topSpace] amount glyph extends above content top
 * (overrids `overhang`)
 * @property {number} [bottomSpace] amount glyph extends below content bottom
 * (overrids `overhang`)
 * @property {number} [minContentHeight] force min content height for auto
 * glyph scaling
 * @property {number} [minContentDescent] force min content descent for auto
 * glyph scaling
 * @property {number} [minContentAscent] force min content ascent for auto
 * scaling
 * @property {number} [descent] force descent of glyph
 * @property {number} [height] force height of glyph (overrides `overhang`,
 * `topSpace`, `bottomSpace`)
 * @property {number} [yOffset] offset glyph in y (`0`)
 * @property {boolean} [annotationsOverContent] `true` means only glyph is
 * separated from content by `space` and not annotations (false`)
 *
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       rb: { symbol: 'angleBracket', side: 'right', width: 0.1 },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           glyphs: {
 *             right: {
 *               symbol: 'rb',
 *               space: 0.05,
 *               overhang: 0.1,
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       arrow: { symbol: 'arrow', direction: 'down' },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           glyphs: {
 *             left: {
 *               symbol: 'arrow',
 *               space: 0.05,
 *               overhang: 0.1,
 *               annotations: [
 *                 {
 *                   content: 'b',
 *                   xPosition: 'center',
 *                   yPosition: 'top',
 *                   xAlign: 'center',
 *                   yAlign: 'bottom',
 *                   scale: 0.7,
 *                   offset: [0, 0.05],
 *                 },
 *                 {
 *                   content: 'n',
 *                   xPosition: 'center',
 *                   yPosition: 'bottom',
 *                   xAlign: 'center',
 *                   yAlign: 'top',
 *                   scale: 0.7,
 *                   offset: [0, -0.05],
 *                 },
 *               ],
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       brace: { symbol: 'brace', side: 'right', width: 0.05 },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'c',
 *           glyphs: {
 *             left: {
 *               symbol: 'brace',
 *               space: 0.05,
 *               overhang: 0.2,
 *               annotations: [
 *                 {
 *                   content: 'a',
 *                   xPosition: 'left',
 *                   yPosition: 'top',
 *                   xAlign: 'right',
 *                   yAlign: 'middle',
 *                   offset: [-0.05, 0],
 *                 },
 *                 {
 *                   content: 'b',
 *                   xPosition: 'left',
 *                   yPosition: 'bottom',
 *                   xAlign: 'right',
 *                   yAlign: 'middle',
 *                   offset: [-0.05, 0],
 *                 },
 *               ],
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 */
export type EQN_LeftRightGlyph = {
  symbol?: string,
  annotation?: EQN_Annotation,
  annotations?: Array<EQN_Annotation>,
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
};

/**
 * Top/Bottom glyph options object.
 *
 * ![](./apiassets/eqn_topbottomglyph1.png)
 *
 * ![](./apiassets/eqn_topbottomglyph2.png)
 *
 * A glyph can be to the top or bottom of an equation phrase (*content*).
 * The glyph can also be annotated.
 * <pre>
 *
 *          gggggggg
 *          gggggggg
 *
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 *
 *          gggggggg
 *          gggggggg
 *
 * </pre>
 * @property {string} symbol
 * @property {EQN_Annotation} [annotation] use for one annotation only instead
 * of property `annotations`
 * @property {Array<EQN_Annotation>} [annotations] use for one or more
 * annotations
 * @property {number} [space] vertical space between glyph and content (`0`)
 * @property {number} [overhang] amount glyph extends above content top and
 * below content bottom (`0`)
 * @property {number} [width] force width of glyph
 * @property {number} [leftSpace] amount glyph extends beyond content left
 * @property {number} [rightSpace] amount glyph extends beyond content right
 * @property {number} [xOffset] offset glyph in x (`0`)
 * @property {boolean} [annotationsOverContent] `true` means only glyph is
 * separated from content by `space` and not annotations (false`)
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       rarrow: { symbol: 'arrow', direction: 'right' },
 *       larrow: { symbol: 'arrow', direction: 'left' },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: 'a',
 *           glyphs: {
 *             top: {
 *               symbol: 'rarrow',
 *               space: 0.05,
 *               overhang: 0.1,
 *             },
 *             bottom: {
 *               symbol: 'larrow',
 *               space: 0.05,
 *               overhang: 0.02,
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * figure.add({
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       brace: { symbol: 'brace', side: 'top' },
 *     },
 *     forms: {
 *       form1: {
 *         annotate: {
 *           content: ['2_1', 'x_1'],
 *           glyphs: {
 *             bottom: {
 *               symbol: 'brace',
 *               space: 0.05,
 *               overhang: 0.2,
 *               annotations: [
 *                 {
 *                   content: '2_2',
 *                   xPosition: 'left',
 *                   yPosition: 'bottom',
 *                   xAlign: 'center',
 *                   yAlign: 'baseline',
 *                   offset: [0, -0.2],
 *                 },
 *                 {
 *                   content: 'x_2',
 *                   xPosition: 'right',
 *                   yPosition: 'bottom',
 *                   xAlign: 'center',
 *                   yAlign: 'baseline',
 *                   offset: [0, -0.2],
 *                 },
 *               ],
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 */
export type EQN_TopBottomGlyph = {
  symbol?: string,
  annotation?: EQN_Annotation,
  annotations?: Array<EQN_Annotation>,
  space?: number;
  overhang?: number,
  width?: number,
  leftSpace?: number,
  rightSpace?: number,
  xOffset?: number,
  annotationsOverContent?: boolean,
};

/**
 * Options object that aligns a line glyph with either the content or
 * annotation.
 *
 * @property {'left' | 'center' | 'right' | number | string} [xAlign]
 * @property {'bottom' | 'baseline' | 'middle' | 'top' | number | string,} [yAlign]
 * @property {0} [space]
 */
export type EQN_LineGlyphAlign = {
  xAlign?: 'left' | 'center' | 'right' | number | string,
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top' | number | string,
  space?: 0,
}

/**
 * A glyph can be a line {@link EQN_LineSymbol} between some content and an
 * annotation.
 *
 * ![](./apiassets/eqn_lineglyph.png)
 *
 * <pre>
 *
 *                         aaaaa
 *                         aaaaa
 *                       g
 *                     g
 *                   g
 *          CCCCCCCCC
 *          CCCCCCCCC
 *          CCCCCCCCC
 *          CCCCCCCCC
 *
 * </pre>
 * @property {string} symbol
 * @property {EQN_LineGlyphAlign} [content] alignment and spacing to content
 * @property {EQN_LineGlyphAlign} [annotation] alignment and spacing to annotation
 * @property {number} [annotationIndex] annotation index to draw line to
 *
 * @example
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       l: {
 *         symbol: 'line',
 *         width: 0.005,
 *         dash: [0.005, 0.005],
 *         arrow: { start: 'barb' },
 *       },
 *     },
 *     forms: {
 *       0: {
 *         annotate: {
 *           content: 'abc',
 *           annotation: {
 *             content: 'def',
 *             xPosition: 'right',
 *             yPosition: 'top',
 *             xAlign: 'left',
 *             yAlign: 'bottom',
 *             scale: 0.6,
 *             offset: [0.2, 0.2],
 *           },
 *           glyphs: {
 *             line: {
 *               annotationIndex: 0,
 *               symbol: 'l',
 *               content: {
 *                 xAlign: 'right',
 *                 yAlign: 'top',
 *                 space: 0.02,
 *               },
 *               annotation: {
 *                 xAlign: 'left',
 *                 yAlign: 'bottom',
 *                 space: 0.02,
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * });
 */
export type EQN_LineGlyph = {
  symbol: string,
  content?: EQN_LineGlyphAlign,
  annotation?: EQN_LineGlyphAlign,
  annotationIndex?: number,
}

/**
 * Object defining all the glyphs annotating some content.
 *
 * Multiple glyphs are ok, but only one per position.
 *
 * @property {EQN_EncompassGlyph} [encompass]
 * @property {EQN_TopBottomGlyph} [top]
 * @property {EQN_LeftRightGlyph} [right]
 * @property {EQN_TopBottomGlyph} [bottom]
 * @property {EQN_LeftRightGlyph} [left]
 * @property {EQN_LineGlyph} [line]
 */
export type EQN_Glyphs = {
  left?: EQN_LeftRightGlyph;
  right?: EQN_LeftRightGlyph;
  top?: EQN_TopBottomGlyph;
  bottom?: EQN_TopBottomGlyph;
  encompass?: EQN_EncompassGlyph;
  line?: EQN_LineGlyph;
};


/**
 * Equation annotation
 *
 * ![](./apiassets/eqn_annotate.gif)
 *
 * An annotation is an equation phrase ('annotation') which is laid out relative
 * to another equation phrase ('content'). For example:
 * <pre>
 *                  AAAA
 *                  AAAA
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 *          CCCCCCCC
 * </pre>
 *
 * The options for defining how to annotate one equation phrase with another is
 * {@link EQN_Annotation}
 *
 * Content can also be annotated with a glyph (that itself may also be
 * annotated). The glyph can either encompass the content, or can be to the
 * top, bottom, left or right of the content
 *
 * <pre>
 *                         Top Glyph
 *                  GGGGGGGGGGGGGGGGGGGGGGG
 *                  GGGGGGGGGGGGGGGGGGGGGGG     Encompassing Glyph
 *                                            /
 *                                          /
 *        GGG       GGGGGGGGGGGGGGGGGGGGGGG        GGG
 *        GGG       GGG                 GGG        GGG
 *        GGG       GGG     CCCCCCC     GGG        GGG
 * Left   GGG       GGG     CCCCCCC     GGG        GGG   Right
 * Glyph  GGG       GGG     CCCCCCC     GGG        GGG   Glyph
 *        GGG       GGG                 GGG        GGG
 *        GGG       GGGGGGGGGGGGGGGGGGGGGGG        GGG
 *
 *
 *                  GGGGGGGGGGGGGGGGGGGGGGG
 *                  GGGGGGGGGGGGGGGGGGGGGGG
 *                       Bottom Glyph
 * </pre>
 *
 * This function is used internally by almost all equation functions
 * (except for fraction) for their layout. As such, it is very generic and
 * powerful. It should also almost never neeed to be used as most layouts
 * can be achieved with a different functions that will have more succinct
 * code that is more readable.
 *
 * This is provided so all layout corner cases not covered by the functions
 * above are possible - including with custom glyphs.
 *
 * Options can *only* be an object.
 *
 * @property {TypeEquationPhrase} content
 * @property {EQN_Annotation} [annotation] use for just one annotation
 * @property {Array<EQN_Annotation>} [annotations] use for multiple annotations
 * @property {boolean} [inSize] `true` means resulting size includes
 * annotations (`true`)
 * @property {number} [space] extend resulting equation phrase size by space on
 * top, right, bottom and left sides (`0`)
 * @property {number} [topSpace] extend resulting equation phrase size by space
 * on top
 * @property {number} [bottomSpace] extend resulting equation phrase size by
 * space on bottom
 * @property {number} [leftSpace] extend resulting equation phrase size by space
 * on left
 * @property {number} [rightSpace] extend resulting equation phrase size by
 * space on right
 * @property {number} [contentScale] scale content (`1`)
 * @property {EQN_Glyphs} [glyphs] glyphs to annotate content with
 * @property {boolean} [fullContentBounds] use full bounds of content,
 * overriding any `inSize=false` properties in the content (`false`)
 * @property {boolean} [useFullBounds] make the bounds of this phrase equal to
 * the full bounds of the content even if `fullContentBounds=false` and the
 * brackets only surround a portion of the content (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Some different annotation examples
 * figure.add({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       bar: { symbol: 'bar', side: 'right' },
 *     },
 *     forms: {
 *       // Single annotation
 *       1: {
 *         annotate: {
 *           content: 'a',
 *           annotation: {
 *             content: 'bbb',
 *             yPosition: 'top',
 *             yAlign: 'bottom',
 *             xPosition: 'left',
 *             xAlign: 'right',
 *             scale: 0.5,
 *           },
 *         },
 *       },
 *       // Multiple annotations
 *       2: {
 *         annotate: {
 *           content: 'a',
 *           annotations: [
 *             {
 *               content: 'bbb',
 *               yPosition: 'top',
 *               yAlign: 'bottom',
 *               xPosition: 'left',
 *               xAlign: 'right',
 *               scale: 0.5,
 *             },
 *             {
 *               content: 'ccc',
 *               xPosition: 'right',
 *               yPosition: 'middle',
 *               xAlign: 'left',
 *               yAlign: 'middle',
 *               scale: 0.5,
 *               offset: [0.05, 0],
 *             },
 *           ],
 *         },
 *       },
 *       // With glyph
 *       3: {
 *         annotate: {
 *           content: 'a',
 *           glyphs: {
 *             left:{
 *               symbol: 'bar',
 *               overhang: 0.1,
 *               annotation: {
 *                 content: 'bbb',
 *                 xPosition: 'right',
 *                 yPosition: 'bottom',
 *                 xAlign: 'left',
 *                 yAlign: 'middle',
 *                 scale: 0.5,
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *     formSeries: ['1', '2', '3'],
 *   },
 * });
 * const eqn = figure.elements._eqn;
 * eqn.onClick = () => eqn.nextForm();
 * eqn.setTouchable();
 * eqn.showForm('1');
 */
export type EQN_Annotate = {
  content: TypeEquationPhrase,
  annotation?: EQN_Annotation,
  annotations?: Array<EQN_Annotation>,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
  glyphs?: EQN_Glyphs,
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
 * Equation Functions.
 *
 * Contains methods for all equation functions.
 */
export class EquationFunctions {
  // eslint-disable-next-line no-use-before-define
  elements: { [name: string]: FigureElementCollection | FigureElementPrimitive };
  shapes: {};
  contentToElement: (TypeEquationPhrase | Elements) => Elements;
  phrases: {
    [phraseName: string]: TypeEquationPhrase,
  };

  phraseElements: {
    [phraseName: string]: Array<FigureElementPrimitive>;
  };

  fullLineHeight: EquationForm | null;
  addElementFromKey: (string, Object) => ?FigureElementPrimitive;
  getExistingOrAddSymbol: (string | Object) => ?FigureElementPrimitive;

  // [methodName: string]: (TypeEquationPhrase) => {};

  /**
   * @hideconstructor
   */
  // eslint-disable-next-line no-use-before-define
  constructor(
    elements: { [name: string]: FigureElementCollection | FigureElementPrimitive },
    addElementFromKey: (string) => ?FigureElementPrimitive,
    getExistingOrAddSymbol: (string | Object) => ?FigureElementPrimitive,
  ) {
    this.elements = elements;
    this.phrases = {};
    this.fullLineHeight = null;
    this.addElementFromKey = addElementFromKey;
    this.getExistingOrAddSymbol = getExistingOrAddSymbol;
    this.phraseElements = {};
  }

  // eslint-disable-next-line class-methods-use-this
  stringToElement(content: string) {
    if (content.length === 0) {
      return null;
    }
    if (content.startsWith('space')) {
      const spaceNum = parseFloat(content.replace(/space[_]*/, '')) || 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    if (content.startsWith(' ')) {
      const spaceNum = content.length * 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    const figureElement = getFigureElement(this.elements, content);
    if (figureElement) {
      return new Element(figureElement);
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
      const c = this.stringToElement(content);
      if (c == null || this.phraseElements[content] != null) {
        return c;
      }
      if (c.getAllElements != null) { // $FlowFixMe
        this.phraseElements[content] = c.getAllElements();
      } else {
        const elements = []; // $FlowFixMe
        c.forEach((e) => { // $FlowFixMe
          if (e.getAllElements != null) { // $FlowFixMe
            elements.push(...e.getAllElements());
          } else {
            elements.push(e);
          }
        }); // $FlowFixMe
        this.phraseElements[content] = elements;
      }
      return c;
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
    content: TypeEquationPhrase | Elements | FigureElementPrimitive | FigureElementCollection,
  ): Elements {
    // If input is alread an Elements object, then return it
    if (content instanceof Elements) {
      return content._dup();
    }
    if (content instanceof FigureElementCollection
      || content instanceof FigureElementPrimitive
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
    if (name === 'tBox') { return this.touchBox(params); }          // $FlowFixMe
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
    if (name === 'lines') { return this.lines(params); }   // $FlowFixMe
    if (name === 'scale') { return this.scale(params); }   // $FlowFixMe
    if (name === 'container') { return this.container(params); }   // $FlowFixMe
    if (name === 'offset') { return this.offset(params); }
    return null;
  }

  /**
   * Equation container function
   * @see {@link EQN_Container} for description and examples
   */
  container(
    options: EQN_Container,
  ) {
    let content;
    let scale;
    let fit; // fits content to container - width, height, contain, null
    let width;
    let ascent;
    let descent;
    let xAlign; // left, center, right, multiplier (to left)
    let yAlign; // bottom, baseline, middle, top, multiplier (to bottom)
    let inSize;
    let fullContentBounds;

    const defaultOptions = {
      scaleModifier: 1,
      fit: null,
      width: null,
      ascent: null,
      descent: null,
      xAlign: 'center',
      yAlign: 'baseline',
      inSize: true,
      fullContentBounds: false,
    };
    if (Array.isArray(options)) {
      [
        content, width, inSize, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      ] = options;
    } else {
      ({
        content, width, inSize, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      } = options);
    }
    const optionsIn = {
      scaleModifier: scale,
      fit,
      width,
      ascent,
      descent,
      xAlign,
      yAlign,
      inSize,
      fullContentBounds,
    };
    const o = joinObjects(defaultOptions, optionsIn);
    return new Container(
      [this.contentToElement(content)],
      [],
      o,
    );
  }

  /**
   * Equation container function
   * @see {@link EQN_Offset} for description and examples
   */
  offset(
    options: EQN_Offset,
  ) {
    let content;
    let offset;
    // let inSize;
    let fullContentBounds;

    const defaultOptions = {
      offset: [0, 0],
      // inSize: false,
      fullContentBounds: false,
    };
    if (Array.isArray(options)) {
      [
        content, offset, fullContentBounds,
      ] = options;
    } else {
      ({
        content, offset, fullContentBounds,
      } = options);
    }
    const optionsIn = {
      offset: getPoint(offset || [0, 0]),
      // inSize,
      fullContentBounds,
    };
    const o = joinObjects(defaultOptions, optionsIn);
    return new Offset(
      [this.contentToElement(content)],
      [],
      o,
    );
  }

  /**
   * Equation bracket function
   * @see {@link EQN_Bracket} for description and examples
   */
  brac(
    options: EQN_Bracket,
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

    if (Array.isArray(options)) {
      [
        left, content, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight,                   // $FlowFixMe
        minContentDescent, height, descent, fullContentBounds,     // $FlowFixMe
        useFullBounds,
      ] = options;
    } else {
      ({
        left, content, right, inSize, insideSpace, outsideSpace,
        topSpace, bottomSpace, minContentHeight,
        minContentDescent, height, descent, fullContentBounds, useFullBounds,
      } = options);
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
    const o = joinObjects({}, defaultOptions, optionsIn);
    const glyphs = {};
    if (left) {
      glyphs.left = {
        symbol: left,
        space: o.insideSpace,
        topSpace: o.topSpace,
        bottomSpace: o.bottomSpace,
        minContentHeight: o.minContentHeight,
        minContentDescent: o.minContentDescent,
        descent: o.descent,
        height: o.height,
      };
    }
    if (right) {
      glyphs.right = {
        symbol: right,
        space: o.insideSpace,
        topSpace: o.topSpace,
        bottomSpace: o.bottomSpace,
        minContentHeight: o.minContentHeight,
        minContentDescent: o.minContentDescent,
        descent: o.descent,
        height: o.height,
      };
    }
    return this.annotate({
      content,
      glyphs,
      inSize: o.inSize,
      leftSpace: o.outsideSpace,
      rightSpace: o.outsideSpace,
      useFullBounds: o.useFullBounds,
      fullContentBounds: o.fullContentBounds,
    });
  }

  /**
   * Equation bar function
   * @see {@link EQN_Bar} for description and examples
   */
  bar(
    options: EQN_Bar,
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
    if (Array.isArray(options)) {
      [
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      ] = options;
    } else {
      ({
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      } = options);
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
    const o = joinObjects({}, defaultOptions, optionsIn, forceOptions);

    const glyphs = {};
    if (o.side === 'top') {
      glyphs.top = {
        symbol,
        space: o.space,
        overhang: o.overhang,
        leftSpace: o.left,
        rightSpace: o.right,
        width: o.length,
      };
    }
    if (o.side === 'bottom') {
      glyphs.bottom = {
        symbol,
        space: o.space,
        overhang: o.overhang,
        leftSpace: o.left,
        rightSpace: o.right,
        width: o.length,
      };
    }
    if (o.side === 'left') {
      glyphs.left = {
        symbol,
        space: o.space,
        overhang: o.overhang,
        topSpace: o.top,
        bottomSpace: o.bottom,
        height: o.length,
        minContentHeight: o.minContentHeight,
        minContentDescent: o.minContentDescent,
        minContentAscent: o.minContentAscent,
        descent: o.descent,
      };
    }
    if (o.side === 'right') {
      glyphs.right = {
        symbol,
        space: o.space,
        overhang: o.overhang,
        topSpace: o.top,
        bottomSpace: o.bottom,
        height: o.length,
        minContentHeight: o.minContentHeight,
        minContentDescent: o.minContentDescent,
        minContentAscent: o.minContentAscent,
        descent: o.descent,
      };
    }
    return this.annotate({
      content,                            // $FlowFixMe
      glyphs,
      inSize: o.inSize,
      fullContentBounds: o.fullContentBounds,
      useFullBounds: o.useFullBounds,
    });
  }

  // /**
  //  */
  // pointer(options: EQN_Pointer) {
  //   const defaultOptions = {
  //     xPosition: 'center',
  //     yPosition: 'top',
  //     xAlign: 'center',
  //     yAlign: 'bottom',
  //     offset: new Point(0, 0),
  //     scale: 1,
  //     inSize: true,
  //     fullContentBounds: false,
  //     glyph: {
  //       content: {
  //         xPosition: 'center',
  //         yPosition: 'top',
  //         offset: new Point(0, 0),
  //         space: 0.05,
  //       },
  //       comment: {
  //         xPosition: 'center',
  //         yPosition: 'top',
  //         offset: new Point(0, 0),
  //         space: 0.05,
  //       }
  //     }
  //   }
  // }

  /**
   * Equation annotate function
   * @see {@link EQN_Annotate} for description and examples
   */
  annotate(options: EQN_Annotate) {
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
      line: {
        content: {
          xAlign: 'left',
          yAlign: 'bottom',
          space: 0,
        },
        annotation: {
          xAlign: 'left',
          yAlign: 'bottom',
          space: 0,
        },
        annotationIndex: 0,
      },
    };
    const {
      content, annotation, annotations, glyphs,
    } = options;

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
      annCopy.offset = getPoint(annCopy.offset);     // $FlowFixMe
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
      glyphsToUse[side] = {}; // $FlowFixMe
      let glyphAnnotationsToProcess = glyphSide.annotations;
      // $FlowFixMe
      if (glyphSide.annotation != null) {      // $FlowFixMe
        glyphAnnotationsToProcess = [glyphSide.annotation];
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
    fillGlyphAnnotation('line');

    const o = joinObjects(defaultOptions, options);
    return new BaseAnnotationFunction(
      this.contentToElement(content),
      annotationsToUse,       // $FlowFixMe
      glyphsToUse,
      o,
    );
  }


  /**
   * Equation annotate function
   * @see {@link EQN_Scale} for description and examples
   */
  scale(
    options: EQN_Scale,
  ) {
    let content;
    let scale;
    let fullContentBounds;
    const defaultOptions = {
      scaleModifier: 1,
      fullContentBounds: false,
    };
    if (Array.isArray(options)) {
      [
        content, scale, fullContentBounds,
      ] = options;
    } else {
      ({
        content, scale, fullContentBounds,
      } = options);
    }
    const optionsIn = {
      scaleModifier: scale,
      fullContentBounds,
    };
    const o = joinObjects(defaultOptions, optionsIn);
    return new Scale(
      [this.contentToElement(content)],
      [],
      o,
    );
  }

  /**
   * Equation fraction function
   * @see {@link EQN_Fraction} for description and examples
   */
  frac(
    options: EQN_Fraction,
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
    let baseline;

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
      baseline: 'vinculum',
    };
    if (Array.isArray(options)) {
      [
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, baseline, fullContentBounds,
      ] = options;
    } else {
      ({
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, baseline, fullContentBounds,
      } = options);
    }
    const optionsIn = {
      scaleModifier: scale,
      overhang,
      numeratorSpace,
      denominatorSpace,
      offsetY,
      fullContentBounds,
      baseline,
    };
    const o = joinObjects(defaultOptions, optionsIn);

    return new Fraction(
      [this.contentToElement(numerator), this.contentToElement(denominator)],       // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),
      o,
    );
  }

  root(optionsOrArray: EQN_Root) {
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

  /**
   * Equation super-sub script function
   * @see {@link EQN_SuperscriptSubscript} for description and examples
   */
  supSub(options: EQN_SuperscriptSubscript) {
    let content;
    let superscript = null;
    let subscript = null;
    let scale = null;
    let subscriptOffset = null;
    let superscriptOffset = null;
    let inSize;
    if (Array.isArray(options)) {
      [           // $FlowFixMe
        content, superscript, subscript, scale,            // $FlowFixMe
        superscriptOffset, subscriptOffset, inSize,
      ] = options;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, subscript, scale, superscriptOffset, subscriptOffset, inSize,
      } = options);
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
    const o = joinObjects(defaultOptions, optionsIn);

    const annotations = [];
    if (superscript != null) {
      annotations.push({
        content: o.superscript,
        xPosition: 'right',
        yPosition: '0.7a',
        xAlign: 'left',
        yAlign: 'baseline',
        offset: getPoint(o.superscriptOffset).add(new Point(o.scale * 0.04, 0)),
        scale: o.scale,
      });
    }
    if (subscript != null) {
      annotations.push({
        content: o.subscript,
        xPosition: 'right',
        yPosition: 'baseline',
        xAlign: 'left',
        yAlign: '0.7a',
        offset: o.subscriptOffset,
        scale: o.scale,
      });
    }
    return this.annotate({
      content,      // $FlowFixMe
      annotations,
      inSize: o.inSize,
    });
  }

  /**
   * Equation superscript function
   * @see {@link EQN_Superscript} for description and examples
   */
  sup(options: EQN_Superscript) {
    let content;
    let superscript;
    let scale;
    let offset;
    // let superscriptOffset = null;
    let inSize;
    if (Array.isArray(options)) {
      [           // $FlowFixMe
        content, superscript, scale, offset, inSize,           // $FlowFixMe
      ] = options;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, scale, offset, inSize,
      } = options);
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

  /**
   * Equation subscript function
   * @see {@link EQN_Subscript} for description and examples
   */
  sub(options: EQN_Subscript) {
    let content;
    let subscript;
    let scale;
    let offset;
    let inSize;
    if (Array.isArray(options)) {
      [           // $FlowFixMe
        content, subscript, scale, offset, inSize,           // $FlowFixMe
      ] = options;
    } else {
      ({                                                    // $FlowFixMe
        content, subscript, scale, offset, inSize,
      } = options);
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

  /**
   * Equation touch box function
   * @see {@link EQN_TouchBox} for description and examples
   */
  touchBox(
    options: EQN_TouchBox,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let leftSpace;
    let rightSpace;
    const defaultOptions = {
      inSize: false,
      space: 0,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
    };
    if (Array.isArray(options)) {
      [
        content, symbol, space, topSpace,
        rightSpace, bottomSpace, leftSpace,
      ] = options;
    } else {
      ({
        content, symbol, space, topSpace,
        rightSpace, bottomSpace, leftSpace,
      } = options);
    }
    const optionsIn = {
      content,
      symbol,
      space,
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
    };
    const o = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: false,
      fullContentBounds: false,
      useFullBounds: false,
      glyphs: {
        encompass: {
          symbol,
          space: o.space,
          leftSpace: o.leftSpace,
          rightSpace: o.rightSpace,
          topSpace: o.topSpace,
          bottomSpace: o.bottomSpace,
        },
      },
    });
  }

  /**
   * Equation box function
   * @see {@link EQN_Box} for description and examples
   */
  box(
    options: EQN_Box,
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
    if (Array.isArray(options)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = options;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = options);
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
    const o = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: o.inSize,
      fullContentBounds: o.fullContentBounds,
      useFullBounds: o.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          space: o.space,
          leftSpace: o.leftSpace,
          rightSpace: o.rightSpace,
          topSpace: o.topSpace,
          bottomSpace: o.bottomSpace,
        },
      },
    });
  }

  /**
   * Equation pad function
   * @see {@link EQN_Pad} for description and examples
   */
  pad(
    options: EQN_Pad,
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
    if (Array.isArray(options)) {
      [
        content, top, right, bottom, left,
      ] = options;
    } else {
      ({
        content, top, right, bottom, left,
      } = options);
    }
    const optionsIn = {
      top,
      right,
      bottom,
      left,
    };
    const o = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      topSpace: o.top,
      bottomSpace: o.bottom,
      rightSpace: o.right,
      leftSpace: o.left,
    });
  }

  /**
   * Equation top bar function
   * @see {@link EQN_Bar} for description and examples
   */
  topBar(options: EQN_Bar) {
    return this.bar(options, { side: 'top' });
  }

  /**
   * Equation bottom bar function
   * @see {@link EQN_Bar} for description and examples
   */
  bottomBar(options: EQN_Bar) {
    return this.bar(options, { side: 'bottom' });
  }

  /**
   * Equation matrix function
   * @see {@link EQN_Matrix} for description and examples
   */
  matrix(options: EQN_Matrix) {
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
      contentScale: 0.7,
      fit: 'min',
      space: [0.05, 0.05],
      yAlign: 'baseline',
      brac: {},
      fullContentBounds: false,
    };
    if (Array.isArray(options)) {
      [
        order, left, content, right,
        scale, fit, space, yAlign, brac, fullContentBounds,
      ] = options;
    } else {
      ({
        order, left, content, right,
        scale, fit, space, yAlign, brac, fullContentBounds,
      } = options);
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
    const o = joinObjects({}, defaultOptions, optionsIn);

    let contentArray = [];
    if (content != null) {      // $FlowFixMe
      contentArray = content.map(c => this.contentToElement(c));
    }

    if (o.order == null
      || o.order[0] * o.order[1] !== contentArray.length) {
      o.order = [1, contentArray.length];
    }

    if (o.space != null) {
      o.space = getPoint(o.space);
    }

    const matrixContent = new Matrix(
      contentArray,
      [],
      o,
    );
    if (left != null && right != null) {
      return this.brac(joinObjects({}, o.brac, {
        content: matrixContent,
        left,
        right,
      }));
    }
    return matrixContent;
  }

  /**
   * Equation matrix function
   * @see {@link EQN_Matrix} for description and examples
   */
  lines(options: EQN_Lines) {
    let content;
    let justify;
    let yAlign;
    let baselineSpace;
    let space;
    let fullContentBounds;
    const defaultOptions = {
      justify: 'center',
      yAlign: 0,
      baselineSpace: null,
      space: 0,
      // offset: 0,
      fullContentBounds: false,
    };
    if (Array.isArray(options)) {
      [
        content, justify, baselineSpace, space, yAlign, fullContentBounds,
      ] = options;
    } else {
      ({
        content, justify, baselineSpace, space, yAlign, fullContentBounds,
      } = options);
    }
    const optionsIn = {
      justify,
      baselineSpace,
      space,
      yAlign,
      fullContentBounds,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    const contentArray = [];
    const lineArray = [];
    if (content != null) {      // $FlowFixMe
      content.forEach((c) => {
        let baselineSpaceLine = o.baselineSpace;
        let spaceLine = o.space;
        let justifyLine = null;
        if (Array.isArray(c) || c.content == null) { // $FlowFixMe
          contentArray.push(this.contentToElement(c));
        } else {      // $FlowFixMe
          contentArray.push(this.contentToElement(c.content));
          if (c.baselineSpace != null) { baselineSpaceLine = c.baselineSpace; }
          if (c.space != null) { spaceLine = c.space; }
          if (c.justify != null) { // $FlowFixMe
            justifyLine = this.elements[c.justify];
          }
        }
        lineArray.push({
          baselineSpace: baselineSpaceLine,
          space: spaceLine,
          justify: justifyLine,
          offset: c.offset || 0,
        });
      });
      // contentArray = content.map(c => this.contentToElement(c));
      o.lineOptions = lineArray;
    }

    const lines = new Lines(
      contentArray,
      [],
      o,
    );
    return lines;
  }

  /**
   * Equation integral function
   * @see {@link EQN_Integral} for description and examples
   */
  int(
    options: EQN_Integral,
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
      space: 0.01,
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
    if (Array.isArray(options)) {
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
      ] = options;
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
      } = options);
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
    const o = joinObjects({}, defaultOptions, optionsIn);
    o.fromOffset = getPoint(o.fromOffset);
    o.toOffset = getPoint(o.toOffset);

    const annotations = [
      {
        content: to,
        xPosition: o.toXPosition,
        yPosition: o.toYPosition,
        xAlign: o.toXAlign,
        yAlign: o.toYAlign,
        offset: o.toOffset,
        scale: o.toScale,
      },
      {
        content: from,
        xPosition: o.fromXPosition,
        yPosition: o.fromYPosition,
        xAlign: o.fromXAlign,
        yAlign: o.fromYAlign,
        offset: o.fromOffset,
        scale: o.fromScale,
      },
    ];
    return this.annotate({  // $FlowFixMe
      content,
      inSize: o.inSize,
      contentScale: o.contentScale,
      fullBoundsContent: o.fullBoundsContent,
      useFullBounds: o.useFullBounds,
      glyphs: {
        left: {   // $FlowFixMe
          symbol,
          space: o.space,
          topSpace: o.topSpace,
          bottomSpace: o.bottomSpace,
          height: o.height,
          yOffset: o.yOffset,
          annotationsOverContent: o.limitsAroundContent,
          // $FlowFixMe
          annotations,
        },
      },
    });
  }

  /**
   * Equation sum of function
   * @see {@link EQN_SumOf} for description and examples
   */
  sumOf(options: EQN_SumOf) {
    return this.sumProd(options);
  }

  /**
   * Equation product of function
   * @see {@link EQN_ProdOf} for description and examples
   */
  prodOf(options: EQN_ProdOf) {
    return this.sumProd(options);
  }

  sumProd(
    optionsOrArray: EQN_SumOf | EQN_ProdOf,
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
      space: 0.1,
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
          space: options.space,
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
    optionsOrArray: EQN_Comment,
  ) {
    let content;
    let comment;
    let symbol;
    let contentSpace;
    let commentSpace;
    let contentLineSpace;
    let commentLineSpace;
    let scale;
    let inSize;
    let fullContentBounds;
    let useFullBounds;
    if (Array.isArray(optionsOrArray)) {
      [
        content, comment, symbol, contentSpace, commentSpace,
        scale, inSize, contentLineSpace, commentLineSpace,     // $FlowFixMe
        fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                       // $FlowFixMe
        content, comment, symbol, contentSpace, commentSpace,
        scale, inSize, contentLineSpace, commentLineSpace,     // $FlowFixMe
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
      contentLineSpace,
      commentLineSpace,
    };
    const defaultOptions = {
      contentSpace: 0.03,
      commentSpace: 0.03,
      scale: 0.6,
      inSize: true,
      fullContentBounds: false,
      useFullBounds: false,
      contentLineSpace: 0.03,
      commentLineSpace: 0.03,
    };

    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, comment, symbol,
      options.contentSpace, options.commentSpace, options.scale,
      options.inSize, options.contentLineSpace, options.commentLineSpace,
      options.fullContentBounds, options.useFullBounds,
    ];
  }

  /**
   * Equation top comment of function
   * @param {EQN_Comment} options
   * @see {@link EQN_Comment} for description and examples
   */
  // $FlowFixMe
  topComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, contentLineSpace, commentLineSpace, fullContentBounds,
      useFullBounds,
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
    const glyph = this.getExistingOrAddSymbol(symbol);
    if (glyph instanceof EquationLine) {
      annotations[0].offset = [0, commentSpaceToUse + contentSpaceToUse];
      return this.annotate({
        content,
        fullContentBounds,
        useFullBounds,   // $FlowFixMe
        annotations,
        glyphs: {
          line: {
            symbol,              // $FlowFixMe
            content: { xAlign: 'center', yAlign: 'top', space: contentLineSpace },
            annotation: { xAlign: 'center', yAlign: 'bottom', space: commentLineSpace },
            annotationIndex: 0,
          },
        },
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

  /**
   * Equation bottom comment of function
   * @param {EQN_Comment} options
   * @see {@link EQN_Comment} for description and examples
   */
  // $FlowFixMe
  bottomComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, contentLineSpace, commentLineSpace, fullContentBounds,
      useFullBounds,
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
    const glyph = this.getExistingOrAddSymbol(symbol);
    if (glyph instanceof EquationLine) {
      annotations[0].offset = [0, -commentSpaceToUse - contentSpaceToUse];
      return this.annotate({
        content,
        fullContentBounds,
        useFullBounds,    // $FlowFixMe
        annotations,
        glyphs: {
          line: {
            symbol,              // $FlowFixMe
            content: { xAlign: 'center', yAlign: 'bottom', space: contentLineSpace },
            annotation: { xAlign: 'center', yAlign: 'top', space: commentLineSpace },
            annotationIndex: 0,
          },
        },
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

  /**
   * Equation strike of function
   * @see {@link EQN_Strike} for description and examples
   */
  strike(
    options: EQN_Strike,
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
    if (Array.isArray(options)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = options;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = options);
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
    const o = joinObjects(defaultOptions, optionsIn);
    // console.log(glyph, o)
    return this.annotate({
      content,
      inSize: o.inSize,
      fullContentBounds: o.fullContentBounds,
      useFullBounds: o.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          topSpace: o.topSpace,
          bottomSpace: o.bottomSpace,
          leftSpace: o.leftSpace,
          rightSpace: o.rightSpace,
          space: o.space,
        },
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processStrike(
    optionsOrContent: EQN_StrikeComment,
  ) {
    let content;
    let comment;
    let symbol;
    let commentSpace;
    let scale;
    let space;
    let inSize;
    if (Array.isArray(optionsOrContent)) {             // $FlowFixMe
      [content, symbol, comment, inSize, space, scale, commentSpace] = optionsOrContent;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, inSize, space, scale, commentSpace,
      } = optionsOrContent);
    }
    const optionsIn = {
      inSize,
      commentSpace,
      scale,
      space,
    };
    const defaultOptions = {
      space: 0,
      scale: 0.5,
      commentSpace: 0.1,
      inSize: true,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, symbol, comment, options.inSize,
      options.commentSpace, options.scale, options.space,
    ];
  }

  /**
   * Equation top strike of function
   * @param {EQN_Strike} options
   * @see {@link EQN_Strike} for description and examples
   */
  // $FlowFixMe
  topStrike(...args) {
    const [
      content, symbol, comment, inSize,
      commentSpace, scale, space,
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
          space,    // $FlowFixMe
          annotations,
        },
      },
    });
  }

  /**
   * Equation bottom strike of function
   * @param {EQN_Strike} options
   * @see {@link EQN_Strike} for description and examples
   */
  // $FlowFixMe
  bottomStrike(...args) {
    const [
      content, symbol, comment, inSize,
      commentSpace, scale, space,
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
          space,    // $FlowFixMe
          annotations,
        },
      },
    });
  }
}
