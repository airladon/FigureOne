// @flow
import {
  Point, Transform,
} from '../../tools/g2';
import type {
  TypeBorder,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import FigurePrimitives from '../FigurePrimitives/FigurePrimitives';
// import { FigureElementCollection } from '../Element';
// import Integral from './Symbols/Integral';
// import SuperSub from './Elements/SuperSub';
import Bracket from './Symbols/Bracket';
// import BracketNew from './Symbols/BracketNew';
import Box from './Symbols/Box';
// import Radical from './Symbols/Radical';
import Brace from './Symbols/Brace';
import SquareBracket from './Symbols/SquareBracket';
import AngleBracket from './Symbols/AngleBracket';
// import SquareBracketNew from './Symbols/SquareBracketNew';
import Bar from './Symbols/Bar';
import Sum from './Symbols/Sum';
import Product from './Symbols/Product';
// import SimpleIntegral from './Symbols/SimpleIntegral';
import Integral from './Symbols/Integral';
import Arrow from './Symbols/Arrow';
import VinculumNew from './Symbols/Vinculum';
import Strike from './Symbols/Strike';
import Radical from './Symbols/Radical';
import Line from './Symbols/Line';
import type {
  TypeColor,
} from '../../tools/types';

// import BracketNew from './Symbols/BracketNew';
// import BraceNew from './Symbols/BraceNew';

// import { Annotation, AnnotationInformation } from './Elements/Annotation';
// export type TypeSymbolOptions = {
//   color?: TypeColor,
//   numLines?: number,
//   side?: 'left' | 'right' | 'bottom' | 'top',
//   width?: number,
//   fill?: boolean,
//   staticSize?: ?(Point | [number, number] | number),
//   startWidth?: number,
//   lineWidth?: number,
//   startHeight?: number,
//   maxStartWidth?: ?number,
//   maxStartHeight?: ?number,
//   proportionalToHeight?: boolean,
//   endLength?: number,
//   sides?: number,
//   tipWidth?: number,
//   radius?: number,
//   arrowWidth?: number,
//   arrowHeight?: number,
// }

/**
 * Base object options for all equation symbols
 *
 * `isTouchable`, `touchBorder`, `color` and `onClick` change the corresponding
 * properties on the {@link FigureElementPrimitive}, and could therefore also
 * be set in `mods`. However, as these are commonly used, they are included in
 * the root object for convenience.
 */
export type EQN_Symbol = {
  color?: TypeColor,
  isTouchable?: boolean,
  touchBorder?: TypeBorder | 'border' | number | 'rect' | 'draw' | 'buffer',
  onClick?: () => void | string | null,
  mods?: Object,
};

/**
 * Vinculum equation symbol
 *
 * <pre>
 *                          width
 *       |<---------------------------------------->|
 *       |                                          |
 *       |                                          | ____
 *       00000000000000000000000000000000000000000000   A
 *       00000000000000000000000000000000000000000000   |  lineWidth
 *       00000000000000000000000000000000000000000000 __V_
 *
 * </pre>
 * @property {'vinculum'} symbol
 * @property {number} [lineWidth] (`0.01`)
 * @property {'static' | 'dynamic'} [draw] `'dynamic'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticWidth] used when `draw`=`static`.
 * `number` sets width of static symbol - `'first'` calculates and sets width
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 *   v: {
 *     symbol: 'vinculum',
 *     color: [1, 0, 0, 1],
 *     lineWidth: 0.01,
 *   },
 * })
 */
export type EQN_VinculumSymbol = {
  symbol: 'vinculum',
  lineWidth?: number,
  draw?: 'static' | 'dynamic',
  staticWidth?: number | 'first',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Box equation symbol
 *
 * <pre>
 *                                          width
 *                 |<--------------------------------------------------->|
 *                 |                                                     |
 *                 |                                                     |
 *
 *         ------- 0000000000000000000000000000000000000000000000000000000
 *         A       0000000000000000000000000000000000000000000000000000000
 *         |       0000                                               0000
 *         |       0000                                               0000
 *         |       0000                                               0000
 *  height |       0000                                               0000
 *         |       0000                                               0000
 *         |       0000                                               0000
 *         |       0000                                               0000
 *         |       0000                                               0000
 *         |       0000000000000000000000000000000000000000000000000000000
 *         V______ 0000000000000000000000000000000000000000000000000000000
 *
 * </pre>
 *
 * @property {'box'} symbol
 * @property {number} [lineWidth] (`0.01`)
 * @property {boolean} [fill] (`false`)
 * @property {number} [width] force width instead of auto calculation
 * @property {number} [height] force height instead of auto calculation
 * @property {'static' | 'dynamic'} [draw] `'dynamic'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticWidth] used when `draw`=`static`.
 * `number` sets width of static symbol - `'first'` calculates and sets width
 * based on first use
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 *   b: {
 *     symbol: 'box',
 *     color: [1, 0, 0, 1],
 *     lineWidth: 0.01,
 *     fill: false,
 *   },
 * })
 */
export type EQN_BoxSymbol = {
  symbol: 'box',
  fill?: boolean,
  width?: number,
  height?: number,
  lineWidth?: number,
  draw?: 'static' | 'dynamic',
  staticWidth?: number | 'first',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Arrow equation symbol
 * <pre>
 *                             arrowWidth
 *                         |<--------------->|
 *                         |                 |
 *                         |                 |
 *                  -------|------- 0        |
 *                  A      |      00000      |
 *    arrowHeight   |      |     0000000     |
 *                  |      |   00000000000   |
 *                  V      | 000000000000000 |
 *                  ------ 0000000000000000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               0000000
 *                               |     |
 *                               |     |
 *                               |<--->|
 *                              lineWidth
 * </pre>
 * @property {'arrow'} symbol
 * @property {'up' | 'down' | 'left' | 'right'} [direction] (`'right'`)
 * @property {number} [lineWidth] (`0.01`)
 * @property {number} [arrowWidth] (`0.01`)
 * @property {number} [arrowHeight] (`0.04`)
 * @property {number} [lineWidth] (`0.01`)
 * @property {'static' | 'dynamic'} [draw] `'dynamic'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 *   a: {
 *     symbol: 'arrow',
 *     color: [1, 0, 0, 1],
 *     direction: 'right'
 *     lineWidth: 0.01,
 *     arrowHeight: 0.02,
 *     arrowWidth: 0.02,
 *   },
 * })
 */
export type EQN_ArrowSymbol = {
  symbol: 'arrow',
  direction?: 'up' | 'down' | 'left' | 'right',
  lineWidth?: number,
  arrowHeight?: number,
  arrowWidth?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Sum equation symbol
 * <pre>
 *          ---------- 00000000000000000000000000000000000
 *          A            0000000                     000000
 *          |              0000000                      000
 *          |                0000000                      00
 *          |                  0000000
 *          |                    0000000
 *          |                      0000000
 *          |                        0000000
 *          |                          0000000
 *          |                            0000000
 *          |                              0000000
 *          |                                000000
 *          |                                  000
 *          |                                0000
 *   height |                              0000
 *          |                            0000   \
 *          |                          0000      \
 *          |                        0000         lineWidth
 *          |                      0000
 *          |                    0000
 *          |                  0000
 *          |                0000                          00
 *          |              0000                          000|
 *          |            0000                         000000|
 *          V          000000000000000000000000000000000000 |
 *          --------  000000000000000000000000000000000000  |
 *                   |                                      |
 *                   |                                      |
 *                   |                 width                |
 *                   |<------------------------------------>|
 * </pre>
 * @property {'sum'} symbol
 * @property {number} [lineWidth] (`height * 0.88 / (25 * height + 15)`)
 * @property {number} [sides] number of sides that make up serif curve (`5`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 *   s: {
 *     symbol: 'sum',
 *     color: [1, 0, 0, 1],
 *     lineWidth: 0.01
 *     sides: 5,
 *   },
 * })
 */
export type EQN_SumSymbol ={
  symbol: 'sum',
  lineWidth?: number,
  sides?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Product equation symbol used in {@link EQN_ProdOf}
 * <pre>
 *                                          width
 *                |<--------------------------------------------------------->|
 *                |                                                           |
 *                |                                                           |
 *                |                                                           |
 *                |                          lineWidth                        |
 *                |                            /                              |
 *                |                           /                               |
 *          ---- 00000000000000000000000000000000000000000000000000000000000000
 *          A         000000000000000000000000000000000000000000000000000000
 *          |           00000000000000000000000000000000000000000000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *  height  |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |            00000000000                         00000000000
 *          |           0000000000000                       00000000000000
 *          V         00000000000000000                   000000000000000000
 *          ----- 0000000000000000000000000           00000000000000000000000000
 * </pre>
 * @property {'prod'} symbol
 * @property {number} [lineWidth] (related to height)
 * @property {number} [sides] number of sides that make up serif curve (`5`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 *   p: {
 *     symbol: 'prod',
 *     color: [1, 0, 0, 1],
 *     lineWidth: 0.01
 *     sides: 5,
 *   },
 * })
 */
export type EQN_ProdSymbol = {
  symbol: 'prod',
  lineWidth?: number,
  sides?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Integral equation symbol used in {@link EQN_Integral}
 * <pre>
 *      --------------------------------------------------   0000000
 *     A                                              000000011111111
 *     |                                         0000000   111111111111
 *     |                                       0000000    11111111111111
 *     |                                      0000000     11111111111111
 *     |                                     0000000       111111111111
 *     |                                   000000000         11111111
 *     |                                  000000000
 *     |                                 0000000000
 *     |                                 000000000
 *     |                                0000000000
 *     |                                0000000000
 *     |                               00000000000
 *     |                              00000000000
 *     |                              000000000000
 *     |                             000000000000      lineWidth
 *     | height              ------->000000000000<----------
 *     |                             000000000000
 *     |                             000000000000
 *     |                            000000000000
 *     |                             00000000000
 *     |                            00000000000
 *     |                            0000000000
 *     |                            0000000000
 *     |     Serif                  000000000
 *     |       \                   000000000
 *     |        \                 0000000000
 *     |      11111111           000000000
 *     |    111111111111       00000000
 *     |   11111111111111     0000000
 *     |   11111111111111   0000000
 *     |    111111111111   0000000
 *     V      111111110000000
 *     -------  0000000
* </pre>
 * @property {'int'} symbol
 * @property {number} [lineWidth] (related to height)
 * @property {number} [sides] number of sides that make up s curve (`30`)
 * @property {number} [num] number of integral symbols (`1`)
 * @property {'line' | 'generic'} [type] `line` draws a circle through the
 *  symbols denoting a line integral (`generic`)
 * @property {number} [tipWidth] width of s curve tip (related to lineWidth)
 * @property {boolean} [serif] `false` to remove serifs (`true`)
 * @property {number} [serifSides] number of sides in serif circles (`10`)
 * @property {number} [lineIntegralSides] number of sides in line integral circle (`20`)

 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * eqn.addElements({
 * int: {
 *   symbol: 'int',
 *   color: [0.95, 0, 0, 1],
 *   lineWidth: 0.01,
 *   sides: 20,
 *   num: 2,
 *   type: 'generic',
 *   tipWidth: null,
 *   serif: true,
 *   serifSides: 10,
 *   lineIntegralSides: 20,
 *   draw: 'static',
 *   staticHeight: 'first',
 * },
 */
export type EQN_IntegralSymbol = {
  symbol: 'int',
  lineWidth?: number,
  sides?: number,
  tipWidth?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: number | 'first',
  serif?: boolean,
  num?: number,
  type?: 'line' | 'generic',
  serifSides?: number,
  lineIntegralSides?: number,
} & EQN_Symbol;

/**
 * Radical equation symbol used in {@link EQN_Root}.
 *
 * The radical symbol allows customization on how to draw the radical. Mostly
 * it will not be needed, but for edge case equation layouts it may be useful.
 *
 * <pre>
 *
 *   height
 *   |
 *   |
 *   |_____________________________ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *   A                             X|
 *   |   startHeight              X |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |                       X  |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |    tickHeight        X   |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |    |                X    |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |____V____           X     |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   A    |    X         X      |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |    |__X |X       X       |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |    A |  | X     X        |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |      |  |  X   X         |   CCCCCCCCCCCCCCCCCCCCCCC
 *   |   |      |  |   X X          |   CCCCCCCCCCCCCCCCCCCCCCC
 *   V___V______|__|____X           |
 *              |  |    |           |
 *              |  |    |           |
 *   tickWidth >|--|<   |           |
 *              |  |    |           |
 *              |  |<-->|downWidth  |
 *              |                   |
 *              |<----------------->|
 *                     startWidth
* </pre>

 * @property {'radical'} symbol
 * @property {number} [lineWidth] (`0.01`)
 * @property {number} [width] force width of content area (normally defined by content size)
 * @property {number} [height] force height of content area (normally defined by content size)
 * @property {number} [startWidth] (`0.5`)
 * @property {number} [startHeight] (`0.5`)
 * @property {?number} [maxStartWidth] (`0.15`)
 * @property {?number} [maxStartHeight] (`0.15`)
 * @property {number} [tickHeight]
 * @property {number} [tickWidth]
 * @property {number} [downWidth]
 * @property {boolean} [proportionalToHeight] `true` makes `startHeight`,
 * `startWidth`, `tickHeight`, `tickWidth`, and `downWidth` a percentage of
 * height instead of absolute (`true`)
 * @property {number} [lineWidth2] lineWidth of down stroke (`2 x lineWidth`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 * @property {number | 'first'} [staticWidth] used when `draw`=`static`.
 * `number` sets width of static symbol - `'first'` calculates and sets width
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   rad: {
 *     symbol: 'radical',
 *     color: [1, 0, 0, 1],
 *   },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rad: {
 *      symbol: 'radical',
 *      color: [1, 0, 0, 1],
 *      lineWidth: 0.01,
 *      lineWidth2: 0.02,
 *      width: 1.2,
 *      height: 0.8,
 *      startWidth: 0.04,
 *      startHeight: 0.04,
 *      tickHeight: 0.01,
 *      tickWidth: 0.01,
 *      downWidth: 0.01,
 *      maxStartWidth: 0.03,
 *      maxStartHeight: 0.03,
 *      proportionalToHeight: false,
 *      draw: 'dynamic',
 *    },
 *  });
 */
export type EQN_RadicalSymbol = {
  symbol: 'radical',
  lineWidth?: number,
  width?: number,
  height?: number,
  startWidth?: number,
  startHeight?: number,
  proportionalToHeight?: boolean,
  maxStartWidth?: ?number,
  maxStartHeight?: ?number,
  lineWidth2?: number,
  tickWidth?: number,
  tickHeight?: number,
  downWidth?: number,
  draw: 'static' | 'dynamic',
  staticHeight?: number | 'first',
  staticWidth?: number | 'first',
} & EQN_Symbol;

/**
 * Strike equation symbol used in {@link EQN_Strike}.
 *
 * Four styles of strike symbol are available:
 * <pre>
 *
 *
 *          000         000
 *            000     000
 *              000 000
 *                000                       0000000000000000
 *              000 000
 *            000     000
 *          000         000
 *               cross                         horizontal
 *
 *
 *                      000                 000
 *                    000                     000
 *                  000                         000
 *                000                             000
 *              000                                 000
 *            000                                     000
 *          000                                         000
 *             forward                        backward
 *
 * </pre>
 *
 * @property {'strike'} symbol
 * @property {'cross' | 'forward' | 'back' | 'horizontal'} [style] (`'cross'`)
 * @property {number} [lineWidth] (`0.015`)
 * @property {number} [width] force width of strike (normally defined by
 * content size)
 * @property {number} [height] force height of strike (normally defined by
 * content size)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 * @property {number | 'first'} [staticWidth] used when `draw`=`static`.
 * `number` sets width of static symbol - `'first'` calculates and sets width
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   s: { symbol: 'strike', style: 'forward' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    s: {
 *      symbol: 'strike',
 *      style: 'cross',
 *      lineWidth: 0.01,
 *      width: 0.5,
 *      height: 0.5,
 *      draw: 'static',
 *      staticHeight: 'first',
 *      staticWidth: 'first',
 *    },
 *  });
 */
export type EQN_StrikeSymbol = {
  symbol: 'strike',
  style?: 'cross' | 'forward' | 'back' | 'horizontal',
  lineWidth?: number,
  width?: number,
  height?: number,
  draw: 'static' | 'dynamic',
  staticHeight?: number | 'first',
  staticWidth?: number | 'first',
} & EQN_Symbol;

/**
 * Bracket equation symbol
 *<pre>
 *                    tipWidth
 *                      ----->| |<---
 *                            | |
 *                            | |
 *                            000
 *                          0000
 *                        00000
 *                      000000
 *                     000000
 *                     000000
 *        lineWidth   000000
 *             ------>000000<---
 *                    000000
 *                    |000000
 *                    |000000
 *                    | 000000
 *                    |   00000
 *                    |     0000
 *                    |       000
 *                    |         |
 *                    |         |
 *                    |<------->|
 *                       width
 * </pre>
 *
 * @property {'bracket'} symbol
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] how to orient the
 * bracket ('left')
 * @property {number} [sides] number of sides in bracket curve (`10`)
 * @property {number} [lineWidth] (depends on height)
 * @property {number} [tipWidth] (depends on lineWidth)
 * @property {number} [width] force width bracket (normally depends on height)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   lb: { symbol: 'bracket', side: 'left' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rb: {
 *      symbol: 'bracket',
 *      side: 'right',
 *      sides: 20,
 *      lineWidth: 0.01,
 *      tipWidth: 0.05,
 *      width: 0.5,
 *      draw: 'static',
 *      staticHeight: 'first',
 *    },
 *  });
 */
export type EQN_BracketSymbol = {
  symbol: 'bracket',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  sides?: number,
  width?: number,
  tipWidth?: number,
  draw?: 'static' | 'dynamic',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Angle bracket equation symbol
 *
 * <pre>
 *                      width
 *                   |<------->|
 *                   |         |
 *           --------|----- 0000
 *           A       |     0000
 *           |       |    0000
 *           |       |   0000
 *           |       |  0000
 *           |         0000
 *    height |        0000
 *           |        0000
 *           |         0000
 *           |          0000
 *           |           0000
 *           |            0000
 *           |             0000
 *           V_____________ 0000
 *
 * </pre>
 *
 * @property {'angleBracket'} symbol
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] how to orient the
 * angle bracket ('left')
 * @property {number} [lineWidth] (depends on height)
 * @property {number} [width] force width bracket (normally depends on height)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   lb: { symbol: 'angleBracket', side: 'left' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rb: {
 *      symbol: 'angleBracket',
 *      side: 'right',
 *      lineWidth: 0.01,
 *      width: 0.5,
 *      draw: 'static',
 *      staticHeight: 'first',
 *    },
 *  });
 */
export type EQN_AngleBracketSymbol = {
  symbol: 'angleBracket',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  width?: number,
  draw?: 'dynamic' | 'static',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Brace equation symbol
 *
 * <pre>
 *                width
 *             |<------>|
 *             |        |
 *             |        |
 *             |      000
 *             |    000
 *             |   000
 *             |  0000
 *             |  0000
 *             |  0000
 *             |  0000
 *             |  000
 *             | 000
 *             000
 *               000
 *                000
 *                0000
 *                0000
 *                0000
 *                0000
 *           - - -0000 - - - -
 *          |      000        |
 *          |       000       |
 *          |         000     |
 *           - - - - - - - - -
 *                        \
 *                         \
 *                          \
 *      - - - - - - - - - - - - - - - - - - - - - - - - -
 *     |       00000000000000                            |
 *     |        00000000000000                           |
 *     |          000000000000                 tipWidth  |
 *     |            000000000000               |         |
 *     |              000000000000             |         |
 *     |                 0000000000000  _______V_        |
 *     |                     00000000000                 |
 *     |                         0000000_________        |
 *     |                                       A         |
 *      - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * </pre>
 *
 * @property {'brace'} symbol
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] how to orient the
 * brace ('left')
 * @property {number} [lineWidth] (depends on height)
 * @property {number} [tipWidth] (depends on lineWidth)
 * @property {number} [width] force width bracket (normally depends on height)
 * @property {number} [sides] number of sides in curved sections (`10`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   lb: { symbol: 'brace', side: 'left' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rb: {
 *      symbol: 'brace',
 *      side: 'right',
 *      lineWidth: 0.01,
 *      tipWidth: 0.01,
 *      width: 0.5,
 *      draw: 'static',
 *      staticHeight: 0.5,
 *    },
 *  });
 */
export type EQN_BraceSymbol = {
  symbol: 'brace',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  sides?: number,
  width?: number,
  tipWidth?: number,
  draw?: 'dynamic' | 'static',
  staticHeight?: number | 'first',
} & EQN_Symbol;

/**
 * Bar equation symbol
 *
 * <pre>
 *
 *        >| |<---- lineWidth
 *         | |
 *         | |
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *         000
 *
 * </pre>
 *
 * @property {'bar'} symbol
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] how to orient the
 * bar ('left')
 * @property {number} [lineWidth] (`0.01`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   lb: { symbol: 'bar', side: 'left' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rb: {
 *      symbol: 'bar',
 *      side: 'right',
 *      lineWidth: 0.01,
 *      draw: 'static',
 *      staticHeight: 0.5,
 *    },
 *  });
 */
export type EQN_BarSymbol = {
  symbol: 'bar',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  draw?: 'dynamic' | 'static',
  staticHeight?: number | 'first',
} & EQN_Symbol;


/**
 * Square bracket equation symbol
 *
 * <pre>
 *
 *                            width
 *                  |<--------------------->|
 *                  |                       |
 *            ___                              ____
 *           A      0000000000000000000000000     A
 *           |      0000000000000000000000000     | tipWidth
 *           |      0000000000000000000000000  ___V
 *           |      00000000
 *           |      00000000
 *           |      00000000
 *           |      00000000
 *  height   |      00000000
 *           |      00000000
 *           |      00000000
 *           |      00000000
 *           |      00000000
 *           |      00000000
 *           |      0000000000000000000000000
 *           |      0000000000000000000000000
 *           V___   0000000000000000000000000
 *
 *                  |      |
 *                  |      |
 *                  |<---->|
 *                 line width
 *
 * </pre>
 *
 * @property {'squareBracket'} symbol
 * @property {'left' | 'right' | 'top' | 'bottom'} [side] how to orient the
 * square bracket ('left')
 * @property {number} [lineWidth] (`0.01`)
 * @property {number} [tipWidth] (`0.01`)
 * @property {number} [width] (depends on lineWidth)
 * @property {number} [radius] optional curved corner radius (`0`)
 * @property {number} [sides] number of sides in curve (`5`)
 * @property {'static' | 'dynamic'} [draw] `'static'` updates vertices on
 * resize, `'static'` only changes scale transform (`dynamic`)
 * @property {number | 'first'} [staticHeight] used when `draw`=`static`.
 * `number` sets height of static symbol - `'first'` calculates and sets height
 * based on first use (`'first'`)
 *
 * @extends EQN_Symbol
 *
 * @example
 * // Typical
 * eqn.addElements({
 *   lb: { symbol: 'squareBracket', side: 'left' },
 * });
 * @example
 * // All options
 *  eqn.addElements({
 *    rb: {
 *      symbol: 'squareBracket',
 *      side: 'right',
 *      lineWidth: 0.01,
 *      tipWidth: 0.01,
 *      width: 0.03
 *      radius: 0.05,
 *      sides: 10,
 *      draw: 'static',
 *      staticHeight: 0.5,
 *    },
 *  });
 */
export type EQN_SquareBracketSymbol = {
  symbol: 'squareBracket',
  side?: 'left' | 'right' | 'top' | 'bottom',
  lineWidth?: number,
  width?: number,
  tipWidth?: number,
  radius?: number,
  sides?: number,
  draw?: 'dynamic' | 'static',
  staticHeight?: number | 'first',
} & EQN_Symbol;

export type TypeSymbolOptions = EQN_VinculumSymbol
  & EQN_VinculumSymbol
  & EQN_BoxSymbol
  & EQN_ArrowSymbol
  & EQN_SumSymbol
  & EQN_ProdSymbol
  & EQN_IntegralSymbol
  & EQN_StrikeSymbol
  & EQN_BracketSymbol
  & EQN_AngleBracketSymbol
  & EQN_BraceSymbol
  & EQN_BarSymbol
  & EQN_SquareBracketSymbol;


export default class EquationSymbols {
  shapes: FigurePrimitives;
  defaultColor: Array<number>;

  constructor(
    shapes: FigurePrimitives,
    defaultColor: Array<number>,
  ) {
    this.shapes = shapes;
    this.defaultColor = defaultColor;
  }

  get(
    name: string,
    options: TypeSymbolOptions,
  ) {
    if (name === 'vinculum') {              // $FlowFixMe
      return this.vinculum(options);
    }
    if (name === 'strike') {                // $FlowFixMe
      return this.strike(options);
    }
    if (name === 'bracket') {               // $FlowFixMe
      return this.bracket(options);
    }
    if (name === 'squareBracket') {         // $FlowFixMe
      return this.squareBracket(options);
    }
    if (name === 'brace') {                 // $FlowFixMe
      return this.brace(options);
    }
    if (name === 'bar') {                   // $FlowFixMe
      return this.bar(options);
    }
    if (name === 'tBox') {                   // $FlowFixMe
      return this.touchBox(options);
    }
    if (name === 'box') {                   // $FlowFixMe
      return this.box(options);
    }
    if (name === 'angleBracket') {          // $FlowFixMe
      return this.angleBracket(options);
    }
    if (name === 'radical') {               // $FlowFixMe
      return this.radical(options);
    }
    if (name === 'sum') {                   // $FlowFixMe
      return this.sum(options);
    }
    if (name === 'prod') {                  // $FlowFixMe
      return this.product(options);
    }
    if (name === 'int') {                   // $FlowFixMe
      return this.integral(options);
    }
    if (name === 'arrow') {                 // $FlowFixMe
      return this.arrow(options);
    }
    if (name === 'line') {                 // $FlowFixMe
      return this.line(options);
    }
    return null;
  }

  // vinculumOld(options: { color?: TypeColor } = {}) {
  //   let { color } = options;
  //   if (color == null) {
  //     color = this.defaultColor;
  //   }
  //   return this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('vinculum').scale(1, 1).translate(0, 0),
  //   );
  // }

  vinculum(options: EQN_VinculumSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      staticHeight: null,          // not definable by user
      draw: 'dynamic',
      staticWidth: 'first',
      drawBorderBuffer: 0,
      touchBorder: 0,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new VinculumNew(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('VinculumSymbol').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  box(optionsIn: EQN_BoxSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      fill: false,
      width: null,
      height: null,
      lineWidth: 0.01,
      draw: 'dynamic',
      staticHeight: 'first',
      staticWidth: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, optionsIn);
    return (new Box(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Box').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  line(optionsIn: EQN_LineSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      width: 0.01,
      dash: [],
      arrow: null,
      draw: 'dynamic',
      staticHeight: 'first',
      staticWidth: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, optionsIn);
    return (new Line(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Line').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  touchBox(optionsIn: EQN_BoxSymbol) {
    const defaultOptions = {
      color: [0, 0, 0, 0.0001],
      fill: false,
      width: null,
      height: null,
      lineWidth: 0.01,
      draw: 'static',
      staticHeight: 'first',
      staticWidth: 'first',
      isTouchable: true,
    };
    const optionsToUse = joinObjects(defaultOptions, optionsIn);

    return (new Box(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('TouchBox').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  arrow(options: EQN_ArrowSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      direction: 'right',
      lineWidth: 0.01,
      arrowWidth: 0.03,
      arrowLength: 0.04,
      length: 0.1,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    if (optionsToUse.direction === 'left' || optionsToUse.direction === 'right') {
      optionsToUse.side = 'top';
    } else {
      optionsToUse.side = 'left';
    }
    return (new Arrow(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('ArrowSymbol').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  sum(options: EQN_SumSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      sides: 5,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
      drawBorderBuffer: 0,
      touchBorder: 0,
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return (new Sum(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('sum').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  product(options: EQN_ProdSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      sides: 5,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return (new Product(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Sum').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  integral(options: EQN_IntegralSymbol) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      width: null,
      tipWidth: null,
      // percentage: 0.95,
      sides: 30,
      // staticSize: 'first',
      // radius: 0.03,
      serif: true,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
      num: 1,
      type: 'generic',
      serifSides: 10,
      lineIntegralSides: 20,
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return new Integral(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Integral').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      // optionsToUse.staticSize,
      optionsToUse,
      // 'triangles',
      // {
      //   lineWidth: optionsToUse.lineWidth,
      //   minLineWidth: optionsToUse.minLineWidth,
      //   sides: optionsToUse.sides,
      //   width: optionsToUse.width,
      //   percentage: optionsToUse.percentage,
      //   sigma: optionsToUse.sigma,
      // },
    );
  }

  radical(optionsIn: EQN_RadicalSymbol) {
    const defaultOptions: {
      color: TypeColor,
      lineWidth: number,
      startHeight: number,
      startWidth: number,
      proportionalToHeight: boolean,
      maxStartWidth: ?number,
      maxStartHeight: ?number,
      staticSize: ?(Point | [number, number]),
      draw: 'static' | 'dynamic',
      staticHeight?: number | 'first',
      staticWidth?: number | 'first',
    } = {
      color: this.defaultColor,
      lineWidth: 0.01,
      staticSize: null,
      startHeight: 0.5,
      startWidth: 0.5,
      maxStartWidth: 0.15,
      maxStartHeight: 0.15,
      proportionalToHeight: true,
      draw: 'dynamic',
      staticHeight: 'first',
      staticWidth: 'first',
    };
    if (optionsIn.proportionalToHeight != null
      && optionsIn.proportionalToHeight === false
    ) {
      defaultOptions.startHeight = 0.15;
      defaultOptions.startWidth = 0.15;
      // defaultOptions.maxStartHeight = null;
      // defaultOptions.maxStartWidth = null;
    }
    const optionsToUse = joinObjects(defaultOptions, optionsIn);
    return new Radical(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    );
  }

  strike(options: EQN_StrikeSymbol) {
    const defaultOptions = {
      style: 'cross',
      color: this.defaultColor,
      lineWidth: null,
      draw: 'dynamic',
      staticHeight: 'first',
      width: null,
      height: null,
      staticWidth: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new Strike(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'triangles',
    );
    // let { color } = options;
    // if (color == null) {
    //   color = this.defaultColor;
    // }
    // return this.shapes.horizontalLine(
    //   new Point(0, 0),
    //   1, 1, 0,
    //   color,
    //   new Transform('strike').scale(1, 1).rotate(0).translate(0, 0),
    // );
  }

  // xStrike(options: { color?: TypeColor } = {}) {
  //   let { color } = options;
  //   if (color == null) {
  //     color = this.defaultColor;
  //   }
  //   const cross = this.collections.collection(new Transform('xStrike')
  //     .scale(1, 1).rotate(0).translate(0, 0));
  //   cross.color = color;
  //   const strike1 = this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('strikeLine').scale(1, 1).rotate(0).translate(0, 0),
  //   );
  //   const strike2 = strike1._dup();
  //   cross.add('s1', strike1);
  //   cross.add('s2', strike2);
  //   return cross;
  // }

  bracket(options: EQN_BracketSymbol) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: null,
      sides: 10,
      draw: 'dynamic',
      staticHeight: 'first',
      width: null,
      tipWidth: null,
      staticWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Bracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  angleBracket(options: EQN_AngleBracketSymbol) {
    const defaultOptions = {
      side: 'left',
      lineWidth: null,
      width: null,
      color: this.defaultColor,
      draw: 'dynamic',
      staticHeight: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new AngleBracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  brace(options: EQN_BraceSymbol) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: null,
      sides: 10,
      draw: 'dynamic',
      staticHeight: 'first',
      width: null,
      tipWidth: null,
      staticWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Brace(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('brace').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  bar(options: EQN_BarSymbol) {
    const defaultOptions = {
      side: 'left',
      lineWidth: 0.01,
      color: this.defaultColor,
      draw: 'dynamic',
      staticHeight: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Bar(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }

  squareBracket(options: EQN_SquareBracketSymbol) {
    const defaultOptions = {
      side: 'left',
      lineWidth: null,
      color: this.defaultColor,
      width: null,
      draw: 'dynamic',
      staticHeight: 'first',
      radius: 0,
      sides: 5,
      tipWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    // if (optionsToUse.endLineWidth == null) {
    //   optionsToUse.endLineWidth = optionsToUse.lineWidth * 0.7;
    // }
    return (new SquareBracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
      // 'strip',
    ));
  }
}
