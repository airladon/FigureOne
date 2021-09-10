// @flow

import type { CPY_Step } from '../geometries/copy/copy';
import type {
  OBJ_Texture, OBJ_LineStyleSimple,
} from './FigurePrimitiveTypes';
// @flow
import type {
  TypeParsablePoint, TypeParsableTransform,
  TypeParsableBorder, Point, TypeParsableRect,
  TypeParsableBuffer,
} from '../../tools/g2';
import type { TypeScenarios, OBJ_ElementMove } from '../Element';
import type {
  TypeColor, TypeDash, OBJ_CurvedCorner, OBJ_Font,
} from '../../tools/types';
import type { OBJ_LineArrows, TypeArrowHead } from '../geometries/arrow';

/* eslint-disable max-len */
/**
 * ![](./apiassets/generic.png)
 *
 * Options object for a {@link FigureElementPrimitive} of a generic shape
 *
 * `points` will define either triangles or lines which combine
 * to make the shape.
 *
 * `drawType` defines what sort of triangles or lines the `points` make
 * and is analagous to WebGL [drawing primitives](https://webglfundamentals.org/webgl/lessons/webgl-points-lines-triangles.html)
 * where the mapping between the two are:
 * - `'triangles'`: TRIANGLES
 * - `'strip'`: TRIANGLE_STRIP
 * - `'fan'`: TRIANGLE_FAN
 * - `'lines'`: LINES
 *
 * The most useful, common and generic `drawType` is `'triangles'`
 * which can be used to create any shape.
 *
 * The shape's points can be duplicated using the `copy` property
 * to conveniently create multiple copies (like grids) of shapes.
 *
 * The shape is colored with either `color` or `texture`.
 *
 * When shapes move, or are touched, borders are needed to bound their
 * movement, and figure out if a touch happened within the shape. Shapes
 * that do not move, or are not interactive, do not need borders.
 *
 * A shape can have several kinds of borders. "Draw borders" (`drawBorder` and
 * `drawBorderBuffer`) are sets of points that define reference
 * borders for a shape. The shapes higher level borders `border` and
 * `touchBorder` may then use these draw borders to define how a shape will
 * interact with a figure's bounds, or where a shape can be touched.
 *
 * `drawBorder` and `drawBorderBuffer` are each point arrays
 * that define the outer limits of the shape. For non-contigous shapes
 * (like islands of shapes), an array of point arrays can be used.
 * Both borders can be anything, but typically a `drawBorder` would define the
 * border of the visible shape, and a `drawBorderBuffer` would define some
 * extra space, or buffer, around the visible shape (particulaly useful for
 * defining the `touchBorder` later).
 *
 * `border` is used for checking if the shape is within some bounds. When
 * shapes are moved, if their bounds are limited, this border will define when
 * the shape is at a limit. The `border` property can be:
 * - `draw`: use `drawBorder` points
 * - `buffer`: use `drawBorderBuffer` points
 * - `rect`: use a rectangle bounding `drawBorder`
 * - `number`: use a rectangle that is `number` larger than the rectangle
 *    bounding `drawBorder`
 * - `Array<TypeParsablePoint>`: a custom contiguous border
 * - `Array<Array<TypeParsablePoint>>`: a custom border of several contiguous
 *    portions
 *
 * `touchBorder` is used for checking if a shape is touched. The `touchBorder`
 * property can be:
 * - `draw`: use `drawBorder` points
 * - `buffer`: use `drawBorderBuffer` points
 * - `border`: use same as `border`
 * - `rect`: use a rectangle bounding `border`
 * - `number`: use a rectangle that is `number` larger than the rectangle
 *    bounding `border`
 * - `Array<TypeParsablePoint>`: a custom contiguous border
 * - `Array<Array<TypeParsablePoint>>`: a custom border of several contiguous
 *    portions
 *
 *
 * @property {Array<TypeParsablePoint>} points
 * @property {'triangles' | 'strip' | 'fan' | 'lines'} [drawType]
 * (`'triangles'`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] use `drawType` as
 * `'triangles'` when using copy (`[]`)
 * @property {TypeColor} [color] (`[1, 0, 0, 1])
 * @property {OBJ_Texture} [texture] override `color` with a texture if defined
 * @property {TypeParsableBorder} [drawBorder],
 * @property {TypeParsableBorder} [drawBorderBuffer],
 * @property {TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number} [border]
 * border used for
 * keeping shape within limits
 * @property {TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw'} [touchBorder]
 * border used for determining shape was touched
 * @property {TypeParsablePoint} [position] will overwrite first translation
 * transform of `transform` chain
 * @property {Transform} [transform]
 * @property {OBJ_PulseScale | number} [pulse] set default scale pulse options
 * (`OBJ_PulseScale`) or pulse scale directly (`number`)
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Square and triangle
 * figure.add({
 *   name: 'squareAndTri',
 *   make: 'generic',
 *   points: [
 *     [-1, 0.5], [-1, -0.5], [0, 0.5],
 *     [0, 0.5], [-1, -0.5], [0, -0.5],
 *     [0, -0.5], [1, 0.5], [1, -0.5],
 *   ],
 * });
 * @example
 * // rhombus with larger touch borders
 * figure.add({
 *   name: 'rhombus',
 *   make: 'generic',
 *   points: [
 *     [-0.5, -0.5], [0, 0.5], [1, 0.5],
 *     [-0.5, -0.5], [1, 0.5], [0.5, -0.5],
 *   ],
 *   border: [[
 *     [-1, -1], [-0.5, 1], [1.5, 1], [1, -1],
 *   ]],
 *   mods: {
 *     isMovable: true,
 *     move: {
 *       bounds: 'figure',
 *     },
 *   },
 * });
 *
 * @example
 * // Grid of triangles
 * figure.add({
 *   name: 'gridOfTris',
 *   make: 'generic',
 *   points: [
 *     [-1, -1], [-0.7, -1], [-1, -0.7],
 *   ],
 *   copy: [
 *     { along: 'x', num: 5, step: 0.4 },
 *     { along: 'y', num: 5, step: 0.4 },
 *   ],
 * });
 */
/* eslint-enable max-len */
export type OBJ_Generic = {
  points?: Array<TypeParsablePoint> | Array<Point>,
  drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
  copy?: Array<CPY_Step | string> | CPY_Step,
  color?: TypeColor,
  texture?: OBJ_Texture,
  drawBorder?: TypeParsableBorder,
  drawBorderBuffer?: TypeParsableBorder,
  border?: TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw',
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  pulse?: number,

  touch?: boolean | number | TypeParsablePoint,
  move?: boolean | OBJ_ElementMove,
  dimColor?: TypeColor,
  defaultColor?: TypeColor,
  scenarios?: TypeScenarios,
}

/**
 * Polyline shape options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/polyline.png)
 *
 * A polyline is a series of lines that are connected end to end. It is defined
 * by a series of points which are the ends and corners of the polyline.
 *
 * The series of points is a zero width ideal polyline, and so to see it we must
 * give it some `width`. This width can either be grown on one side of the
 * ideal polyline or grown on both sides of it equally using `widthIs`.
 *
 * A polyline can have a "positive" or "negative" side, and an "inside" or "outside".
 *
 * If a line is defined from p1 to p2, then the *positive* side is the
 * side where the line moves if it is rotated around p1 in the positive (counter
 * clockwise) direction. Thus the order of the points that define the line
 * defines which side is positive and negative. A polyline is made up of many
 * lines end to end, and thus itself will have a positive and negative side
 * dependent on the order of points.
 *
 * Similarly we can define a line's side as either *inside* or *outside*. Each
 * corner in the polyline will have an angle on the negative side of the line
 * and a explementary angle on the positive side of the line. The *inside* side
 * of the line is the same as the *negative* side if the sum of all the negative
 * side angles is smaller than the sum of all *positive* side angles.
 *
 * Both positive/negative and inside/outside are provided to define a line's
 * side as different situations make different side definitions more intuitive.
 * For instance, a closed, simple polygon has an obvious "inside" and "outside",
 * but how the points are ordered would define if the "inside" is "positive" or
 * "negative". In comparison, it would be more intuitive to use "positive" or
 * "negative" for a polyline that has an overall trend in a single direction.
 *
 * Therefore, the polyline width can be grown on either the `'positive'`,
 * `'negative'`, `'inside'`, or `'outside'` side of the line or around the
 * middle of the line with `'mid'`. In addition, a `number` between 0 and 1 can
 * be used where `0` is the same as `'positive'`, `1` the same as `'negative'`
 * and `0.5` the same as `'mid'`.
 *
 * Each point, or line connection, creates a corner that will have an *inside*
 * angle (<180º) and an *outside* angle (>180º or reflex angle).
 *
 * Growing width on an outside corner can be challenging. As the corner becomes
 * sharper, the outside width joins at a point further and further from the
 * ideal corner. Eventually trucating the corner makes more visual sense
 * and therefore, a minimum angle (`minAutoCornerAngle`) is used to
 * specify when the corner should be drawn, and when it should be truncated.
 *
 * By default, the border of the polyline is the line itself (`border` =
 * `'line'`). The border can also just be the points on the positive side of
 * the line, or the negative side of the line. This is useful for capturing
 * the hole shape of a closed polyline within a border. The border can also
 * be the encompassing rectangle of the polyline (`border` = `'rect'`) or
 * defined as a custom set of points.
 *
 * The touch border can either be the same as the border (`'border'`), the
 * encompassing rect (`'rect'`), a custom set of points, or the same as the
 * line but with some buffer that effectively increases the width on both sides
 * of the line.
 *
 * @property {Array<TypeParsablePoint>} points
 * @property {number} [width] (`0.01`)
 * @property {boolean} [close] close the polyline on itself (`false`)
 * @property {boolean} [simple] simple and minimum computation polyline. Good
 * for large numbers of points that need to be updated every animation frame.
 * `widthIs`, `dash`, `arrow` and all corner and line primitive properties are
 * not available when a polyline is simple. (`false`)
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number} [widthIs]
 * defines how the width is grown from the polyline's points.
 * Only `"mid"` is fully compatible with all options in
 * `cornerStyle` and `dash`. (`"mid"`)
 * @property {'line' | 'positive' | 'negative' | TypeParsableBorder} [drawBorder]
 * override OBJ_Generic `drawBorder` with `'line'` to make the drawBorder just
 * the line itself, `'positive'` to make the drawBorder the positive side
 * of the line, and `'negative'` to make the drawBorder the negative side
 * of the line. Use array definition for custom drawBorder (`'line'`)
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer the same as the line with additional `number` thickness
 * on either side (`0`)
 * @property {'auto' | 'none' | 'radius' | 'fill'} [cornerStyle] - `"auto"`:
 * sharp corners sharp when angle is less than `minAutoCornerAngle`, `"none"`: no
 * corners, `"radius"`: curved corners, `"fill"`: fills the gapes between the line
 * ends, (`"auto"`)
 * @property {number} [cornerSize] only used when `cornerStyle` = `radius` (`0.01`)
 * @property {number} [cornerSides] number of sides in curve - only used when
 *  `cornerStyle` = `radius` (`10`)
 * @property {boolean} [cornersOnly] draw only the corners with size `cornerSize` (`false`)
 * @property {number} [cornerLength] use only with `cornersOnly` = `true` -
 * length of corner to draw (`0.1`)
 * @property {number} [minAutoCornerAngle] see `cornerStyle` = `auto` (`π/7`)
 * @property {TypeDash} [dash] leave empty for solid line - use array of
 * numbers for dash line where first number is length of line, second number is
 * length of gap and then the pattern repeats - can use more than one dash length
 * and gap  - e.g. [0.1, 0.01, 0.02, 0.01] produces a lines with a long dash,
 * short gap, short dash, short gap and then repeats.
 * @property {OBJ_LineArrows | TypeArrowHead} [arrow] either an object defining custom
 * arrows or a string representing the name of an arrow head style can be used.
 * If a string is used, then the line will have an arrow at both ends.
 * Arrows are only available for `close: false`,
 * `widthIs: 'mid'` and `linePrimitives: false`
 * @property {boolean} [linePrimitives] Use WebGL line primitives instead of
 * triangle primitives to draw the line (`false`)
 * @property {number} [lineNum] Number of line primitives to use when
 * `linePrimitivs`: `true` (`2`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Line
 * figure.add(
 *   {
 *     name: 'p',
 *     make: 'polyline',
 *     points: [[-0.5, -0.5], [-0.1, 0.5], [0.3, -0.2], [0.5, 0.5]],
 *     width: 0.05,
 *   },
 * );
 *
 * @example
 * // Square with rounded corners and dot-dash line
 * figure.add(
 *   {
 *     name: 'p',
 *     make: 'polyline',
 *     points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
 *     width: 0.05,
 *     dash: [0.17, 0.05, 0.05, 0.05],
 *     close: true,
 *     cornerStyle: 'radius',
 *     cornerSize: 0.1,
 *   },
 * );
 * @example
 * // Corners only of a triangle
 * figure.add(
 *  {
 *    name: 'p',
 *    make: 'polyline',
 *    points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
 *    width: 0.05,
 *    close: true,
 *    cornersOnly: true,
 *    cornerLength: 0.2,
 *  },
 *);
 * @example
 * // Zig zag with arrows
 * figure.add({
 *   name: 'arrowedLine',
 *   make: 'polyline',
 *   points: [[0, 0], [1, 0], [0, 0.7], [1, 0.7]],
 *   width: 0.05,
 *   cornerStyle: 'fill',
 *   arrow: {
 *     scale: 0.7,
 *     start: {
 *       head: 'triangle',
 *       reverse: true,
 *     },
 *     end: 'barb',
 *   },
 * });
 */
export type OBJ_Polyline = {
  points?: Array<TypeParsablePoint> | Array<Point>,
  width?: number,
  close?: boolean,
  simple?: boolean,
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number,
  drawBorder?: 'line' | 'positive' | 'negative' | TypeParsableBorder,
  drawBorderBuffer?: number | TypeParsableBorder,
  cornerStyle?: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize?: number,
  cornerSides?: number,
  cornersOnly?: boolean,
  cornerLength?: number,
  forceCornerLength?: boolean,
  minAutoCornerAngle?: number,
  dash?: TypeDash,
  arrow?: OBJ_LineArrows | TypeArrowHead,
  linePrimitives?: boolean,
  lineNum?: number,
} & OBJ_Generic;

/**
 * Line style object
 *
 * These properties are a subset of {@link OBJ_Polyline} which has more details
 * on how a line is defined.
 *
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative'} [widthIs]
 * defines how the width is grown from the polyline's points.
 * Only `"mid"` is fully compatible with all options in
 * `cornerStyle` and `dash`. (`"mid"`)
 * @property {'auto' | 'none' | 'radius' | 'fill'} [cornerStyle] - `"auto"`:
 * sharp corners sharp when angle is less than `minAutoCornerAngle`, `"none"`: no
 * corners, `"radius"`: curved corners, `"fill"`: fills the gapes between the line
 * ends, (`"auto"`)
 * @property {number} [cornerSize] only used when `cornerStyle` = `radius` (`0.01`)
 * @property {number} [cornerSides] number of sides in curve - only used when
 *  `cornerStyle` = `radius` (`10`)
 * @property {boolean} [cornersOnly] draw only the corners with size `cornerSize` (`false`)
 * @property {number} [cornerLength] use only with `cornersOnly` = `true` -
 * length of corner to draw (`0.1`)
 * @property {number} [minAutoCornerAngle] see `cornerStyle` = `auto` (`π/7`)
 * @property {Array<number>} [dash] leave empty for solid line - use array of
 * numbers for dash line where first number is length of line, second number is
 * length of gap and then the pattern repeats - can use more than one dash length
 * and gap  - e.g. [0.1, 0.01, 0.02, 0.01] produces a lines with a long dash,
 * short gap, short dash, short gap and then repeats.
 * @property {boolean} [linePrimitives] Use WebGL line primitives instead of
 * triangle primitives to draw the line (`false`)
 * @property {boolean} [lineNum] Number of line primitives to use when
 * `linePrimitivs`: `true` (`2`)
 */
export type OBJ_LineStyle = {
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
  cornerStyle?: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize?: number,
  cornerSides?: number,
  cornersOnly?: boolean,
  cornerLength?: number,
  forceCornerLength?: boolean,
  minAutoCornerAngle?: number,
  dash?: Array<number>,
  linePrimitives?: boolean,
  lineNum?: number,
};

/**
 * Polygon or partial polygon shape options object that extends
 * {@link OBJ_Generic} (without `drawType`)
 *
 * ![](./apiassets/polygon.png)
 *
 * @property {number} [sides] (`4`)
 * @property {number} [radius] (`1`)
 * @property {number} [rotation] shape rotation during vertex definition
 * (different to a rotation step in a trasform) (`0`)
 * @property {TypeParsablePoint} [offset] shape center offset from origin
 * during vertex definition (different to a translation step in a transform)
 * (`[0, 0]`)
 * @property {number} [sidesToDraw] number of sides to draw (all sides)
 * @property {number} [angleToDraw] same as `sidesToDraw` but using angle for
 * the definition (`2π`)
 * @property {-1 | 1} [direction] direction to draw polygon where 1 is
 * counter clockwise and -1 is clockwise (`1`)
 * center. This is different to position or transform as these translate the
 * vertices on each draw. (`[0, 0]`)
 * @property {OBJ_LineStyleSimple} [line] line style options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override the OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer a polygon that is wider by `number` (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple filled hexagon
 * figure.add({
 *   name: 'hexagon',
 *   make: 'polygon',
 *   sides: 6,
 *   radius: 0.5,
 * });
 *
 * @example
 * // Circle from dashed line
 * const circ = figure.primitives.polygon({
 *   sides: 100,
 *   radius: 0.5,
 *   line: {
 *     width: 0.03,
 *     dash: [0.1, 0.03 ],
 *   },
 * });
 * figure.elements.add('circle', circ);
 *
 * @example
 * // Half octagon rotated
 * figure.add({
 *   name: 'halfOctagon',
 *   make: 'polygon',
 *   sides: 8,
 *   radius: 0.5,
 *   angleToDraw: Math.PI,
 *   line: {
 *     width: 0.03,
 *   },
 *   direction: -1,
 *   rotation: Math.PI / 2,
 * });
 */
export type OBJ_Polygon = {
  sides?: number,
  radius?: number,
  rotation?: number,
  offset?: TypeParsablePoint,
  sidesToDraw?: number,
  angleToDraw?: number,
  direction?: -1 | 1,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer?: number | TypeParsableBorder,
} & OBJ_Generic;

export type OBJ_Polygon_Defined = {
  sides: number,
  radius: number,
  rotation: number,
  offset: Point,
  sidesToDraw: number,
  angleToDraw: number,
  direction: -1 | 1,
  line?: OBJ_LineStyleSimple,
  innerRadius?: number,
  drawBorderBuffer: number | TypeParsableBorder,
} & OBJ_Generic;

/**
 * Star options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/star.png)
 *
 * @property {number} [sides] (`4`)
 * @property {number} [radius] (`1`)
 * @property {number} [innerRadius] (`radius / 2`)
 * @property {number} [rotation] shape rotation during vertex definition
 * (different to a rotation step in a trasform) (`0`)
 * @property {TypeParsablePoint} [offset] shape center offset from origin
 * during vertex definition (different to a translation step in a transform)
 * (`[0, 0]`)
 * @property {OBJ_LineStyleSimple} [line] line style options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override the OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer a polygon that is `number` thicker than the radius (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple 5 pointed star
 * figure.add({
 *   name: 's',
 *   make: 'star',
 *   radius: 0.5,
 *   sides: 5,
 * });
 *
 * @example
 * // 7 pointed dashed line star
 * figure.add({
 *   name: 's',
 *   make: 'star',
 *   radius: 0.5,
 *   innerRadius: 0.3,
 *   sides: 7,
 *   line: {
 *     width: 0.02,
 *     dash: [0.05, 0.01],
 *   },
 * });
 *
 * @example
 * // Star surrounded by stars
 * figure.add({
 *   name: 's',
 *   make: 'star',
 *   radius: 0.1,
 *   sides: 5,
 *   rotation: -Math.PI / 2,
 *   // line: { width: 0.01 },
 *   copy: [
 *     {
 *       to: [0.6, 0],
 *       original: false,
 *     },
 *     {
 *       along: 'rotation',
 *       num: 16,
 *       step: Math.PI * 2 / 16,
 *       start: 1,
 *     },
 *     {
 *       to: new Fig.Transform().scale(3, 3).rotate(Math.PI / 2),
 *       start: 0,
 *       end: 1,
 *     },
 *   ],
 * });
 */
export type OBJ_Star = {
  sides?: number,
  radius?: number,
  innerRadius?: number,
  rotation?: number,
  offset?: TypeParsablePoint,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer?: TypeParsableBorder | number,
} & OBJ_Generic;

export type OBJ_Star_Defined = {
  sides: number,
  radius: number,
  innerRadius: number,
  rotation: number,
  offset: Point,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer: TypeParsableBorder | number,
} & OBJ_Generic;

/**
 * Rectangle shape options object that extends {@link OBJ_Generic} (without
 * `drawType)
 *
 * ![](./apiassets/rectangle.png)
 *
 * @property {number} [width] (`1`)
 * @property {number} [height] (`1`)
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] (`'middle'`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {OBJ_CurvedCorner} [corner] define for rounded corners
 * @property {OBJ_LineStyleSimple} [line] line style options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override the OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer a rectangle that is `number` wider and higher on each side
 * (`0`)
 * @property {TypeParsablePoint} [offset]
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Filled rectangle
 * figure.add({
 *   name: 'r',
 *   make: 'rectangle',
 *   width: 1,
 *   height: 0.5,
 * });
 *
 * @example
 * // Corners with radius and dashed line
 * figure.add({
 *   name: 'r',
 *   make: 'rectangle',
 *   width: 0.5,
 *   height: 0.5,
 *   line: {
 *     width: 0.02,
 *     dash: [0.05, 0.03]
 *   },
 *   corner: {
 *     radius: 0.1,
 *     sides: 10,
 *   },
 * });
 *
 * @example
 * // Rectangle copies rotated
 * figure.add({
 *   name: 'r',
 *   make: 'rectangle',
 *   width: 0.5,
 *   height: 0.5,
 *   line: {
 *     width: 0.01,
 *   },
 *   copy: {
 *     along: 'rotation',
 *     num: 3,
 *     step: Math.PI / 2 / 3
 *   },
 * });
 */
export type OBJ_Rectangle = {
  width?: number,
  height?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | number,
  corner?: OBJ_CurvedCorner,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer?: TypeParsableBorder | number,
  offset?: TypeParsablePoint,
} & OBJ_Generic;

export type OBJ_Rectangle_Defined = {
  width: number,
  height: number,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'middle' | 'top' | number,
  corner: {
    radius: number,
    sides: number,
  },
  line?: {
    widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid' | number,
    width: number,
  },
  // border: 'rect' | 'outline' | Array<Array<Point>>,
  drawBorderBuffer: number | Array<Array<Point>>,
  offset: Point,
} & OBJ_Generic;


/**
 * Ellipse shape options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/ellipse.png)
 *
 * @property {number} [width] (`1`)
 * @property {number} [height] (`1`)
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] (`'middle'`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {number} [sides] number of sides to draw ellipse with (`20`)
 * @property {OBJ_LineStyleSimple} [line] line style options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override the OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer a ellipse that is `number` thicker around its border (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Filled ellipse
 * figure.add({
 *   name: 'e',
 *   make: 'ellipse',
 *   height: 1,
 *   width: 0.5,
 *   sides: 100,
 * });
 *
 * @example
 * // Dashed line circle
 * figure.add({
 *   name: 'e',
 *   make: 'ellipse',
 *   height: 1,
 *   width: 1,
 *   sides: 100,
 *   line: {
 *     width: 0.02,
 *     dash: [0.05, 0.02],
 *   },
 * });
 *
 * @example
 * // Ellipse grid
 * figure.add({
 *   name: 'e',
 *   make: 'ellipse',
 *   height: 0.08,
 *   width: 0.2,
 *   sides: 20,
 *   copy: [
 *     { along: 'x', step: 0.25, num: 5 },
 *     { along: 'y', step: 0.15, num: 5 },
 *   ]
 * });
 */
export type OBJ_Ellipse = {
  width?: number,
  height?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | number,
  sides?: number,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer?: TypeParsableBorder | number,
} & OBJ_Generic;

/**
 * Arc shape options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/arc.png)
 *
 * @property {number} [radius]
 * @property {number} [sides] (`20`)
 * @property {number} [startAngle] (`0`)
 * @property {number} [angle] (`1`)
 * @property {OBJ_LineStyleSimple} [line] line style options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override the OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer a ellipse that is `number` thicker around its border (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple fill
 * figure.add({
 *   make: 'arc',
 *   angle: Math.PI * 2 / 3,
 *   radius: 1,
 * });
 *
 * @example
 * // Fill to center
 * figure.add({
 *   make: 'arc',
 *   angle: Math.PI * 2 / 3,
 *   startAngle: Math.PI / 3,
 *   radius: 1,
 *   fillCenter: true,
 * });
 *
 * @example
 * // Arc line
 * figure.add({
 *   make: 'arc',
 *   angle: Math.PI / 3,
 *   radius: 1,
 *   line: { width: 0.05, widthIs: 'inside' },
 * });
 *
 * @example
 * // Arc dashed line
 * figure.add({
 *   make: 'arc',
 *   angle: Math.PI * 3 / 2,
 *   radius: 1,
 *   sides: 100,
 *   line: { width: 0.05, dash: [0.3, 0.1, 0.1, 0.1] },
 * });
 */
export type OBJ_Arc = {
  radius?: number,
  sides?: number,
  startAngle?: number,
  angle?: number,
  line?: OBJ_LineStyleSimple,
  offset?: TypeParsablePoint,
  drawBorderBuffer?: TypeParsableBorder | number,
  fillCenter?: boolean,
} & OBJ_Generic;

/**
 * @property {'s1' | 's2' | 's3'} [side] ('s1')
 * @property {number} [angle] (0)
 */
export type OBJ_TriangleSideRotationAlignment = {
  side?: 's1' | 's2' | 's3',
  angle?: number,
};

/* eslint-disable max-len */
/**
 * Triangle shape options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/triangle.png)
 *
 * The most generic way to define a triangle is with three points (`points`
 * property). When using `points`, all the other properties that can also
 * define a triangle are ignored: `width`, `height`, `top`,
 * `SSS`, `ASA`, `AAS`, `SAS`, `direction`, `rotation`, `xAlign` and `yAlign`.
 *
 * The other ways to define a triangle are (in order of highest override
 * preference to lowest if more than one is defined in the object):
 * - `ASA` or Angle-Side-Angle
 * - `SAS` or Side-Angle-Side
 * - `AAS` or Angle-Angle-Side
 * - `SSS` or Side-Side-Side
 * - `width`, `height` and `top` location
 *
 * All these methods also use `direction` to define the triangles, and
 * `rotation`, `xAlign` and `yAlign` to position the triangles. Each corner
 * and side of the triangle is indexed, and can be used for positioning.
 *
 * ![](./apiassets/triangle_definition.png)
 *
 * A triangle starts with an angle (a1) at (0, 0) and base side extending along
 * the x axis to a second angle a2. The base side is side 1 (s1).
 *
 * Angles a1 and a2 extend the triangle above s1 if `direction` is `1`, and
 * below s1 when `direction` is `-1`.
 *
 * s2, a3, and s3 are then the consecutive sides and angles.
 *
 * Triangles can be defined with a combination of side length and angle using
 * `ASA`, `SAS`, `AAS` and `SSS`, where the first side or angle is s1 or a1
 * respectively, and the subsequent sides and angles progress consecutively.
 * For instance, `ASA` defines the angle a1, then side length s1, then angle
 * a2. `SSS` defines the side lenghts s1, s2 then s3. All these combinations of
 * three properties are sufficient to define a unique triangle completely.
 *
 * When defining the triangle with `width`, `height` and `top`, the base side
 * s1 is the width, and the top point is either aligned with the `left`,
 * `center` or `right` of the base at some `height` above s1.
 *
 * When defined, a triangle's a1 corner will be at (0, 0), and s1 will be along
 * the x axis. Next, a `rotation` can be applied to the triangle. A `rotation`
 * can either be a `number` rotating it relative to its definition, or relative
 * to one of its sides: s1, s2 or s3.
 *
 * Finally, the triangle can be positioned (in draw space) using `xAlign` and
 * `yAlign`. An `xAlign` of `'left'` will position the triangle so that it's
 * left most point will be at (0, 0). Similarly, a `yAlign` of `'top'` will
 * position the triangle so its top most point is at (0, 0). Triangles
 * can also be aligned by angles (corners) and side mid points. For instance, an
 * `xAlign` of `'a2'`, will position the a2 corner at x = 0. Similarly a
 * `yAlign` of `'s3'` will position the triangle vertically such that the mid
 * point of s3 is at y = 0. `'centroid'` is relative to the geometric center of
 * the triangle.
 *
 * Once a triangle is defined and positioned in draw space, it can then be
 * copied (`copy`) if more than one triangle is desired.
 *
 * The triangle(s) can then be positioned (`position`) or transformed
 * (`transform`) in the FigureElementPrimitive local space.
 *
 * Triangles can either be a solid fill, texture fill or outline. When `line`
 * is not defined, the triangle will be filled.
 *
 * @property {Array<Point>} [points] defining points will take precedence over
 * all other ways to define a triangle.
 * @property {number} [width]
 * @property {number} [height]
 * @property {'left' | 'right' | 'center'} [top] (`center`)
 * @property {[number, number, number]} [SSS]
 * @property {[number, number, number]} [ASA]
 * @property {[number, number, number]} [AAS]
 * @property {[number, number, number]} [SAS]
 * @property {1 | -1} [direction]
 * @property {number | 's1' | 's2' | 's3' | OBJ_TriangleSideRotationAlignment} [rotation]
 * @property {'left' | 'center' | 'right' | number | 'a1' | 'a2' | 'a3' | 's1' | 's2' | 's3' | 'centroid' | 'points'} [xAlign] (`'centroid'`)
 * @property {'bottom' | 'middle' | 'top' | number | 'a1' | 'a2' | 'a3' | 's1'| 's2' | 's3' | 'centroid' | 'points'} [yAlign] (`'centroid'`)
 * @property {OBJ_LineStyleSimple} [line] line style options - do not use any corner
 * options
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Right angle triangle
 * figure.add({
 *   name: 't',
 *   make: 'triangle',
 *   width: 0.5,
 *   height: 1,
 *   top: 'right',
 * });
 *
 * @example
 * // 30-60-90 triangle with dashed line
 * const t = figure.primitives.triangle({
 *   ASA: [Math.PI / 2, 1, Math.PI / 6],
 *   line: {
 *     width: 0.02,
 *     dash: [0.12, 0.04],
 *   },
 * });
 * figure.elements.add('t', t);
 *
 * @example
 * // Star from 4 equilateral triangles
 * figure.add({
 *   name: 'star',
 *   make: 'triangle',
 *   SSS: [1, 1, 1],
 *   xAlign: 'centroid',
 *   yAlign: 'centroid',
 *   copy: {
 *     along: 'rotation',
 *     num: 3,
 *     step: Math.PI / 6,
 *   },
 * });
 */
export type OBJ_Triangle = {
  width?: number,
  height?: number,
  top?: 'left' | 'right' | 'center',
  SSS?: [number, number, number],
  ASA?: [number, number, number],
  AAS?: [number, number, number],
  SAS?: [number, number, number],
  direction?: 1 | -1,
  points?: Array<Point>,
  rotation?: number | 's1' | 's2' | 's3' | { side?: 's1' | 's2' | 's3', angle?: number },
  xAlign: 'left' | 'center' | 'right' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'centroid' | 'points',
  yAlign: 'bottom' | 'middle' | 'top' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'centroid' | 'points',
  line?: OBJ_LineStyleSimple,
} & OBJ_Generic;
/* eslint-enable max-len */

/**
 * Line definition options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/line.png)
 *
 * A line can either be defined as two points `p1` and `p2`, or
 * a single point `p1`, a `length` and an `angle`.
 *
 * The line has some `width` that will be filled on both sides
 * of the line points evenly (`'mid'`), or on one side only.
 * The line's `'positive'` side is the side to which it rotates toward
 * when rotating in the positive angle direction around `p1`.
 * Similarly the line's `'negative'` side is the opposite.
 *
 * The line can be solid or dashed using the `dash` property.
 *
 * The line can have arrows at one or both ends using the `arrow` property.
 *
 * @property {TypeParsablePoint} [p1] start point of line
 * @property {TypeParsablePoint} [p2] end point of line
 * @property {number} [length] length of line from `p1`
 * @property {number} [angle] angle of line from `p1`
 * @property {number} [width] (`0.01`)
 * @property {'mid' | 'positive' | 'negative' | number} [widthIs]
 * defines how the width is grown from the polyline's points.
 * Only `"mid"` is fully compatible with all options in
 * `arrow`. (`"mid"`)
 * @property {TypeDash} [dash] leave empty for solid line - use array of
 * numbers for dash line where first number is length of line, second number is
 * length of gap and then the pattern repeats - can use more than one dash length
 * and gap  - e.g. [0.1, 0.01, 0.02, 0.01] produces a lines with a long dash,
 * short gap, short dash, short gap and then repeats.
 * @property {OBJ_LineArrows | TypeArrowHead} [arrow] either an object defining custom
 * arrows or a string representing the name of an arrow head style can be used.
 * If a string is used, then the line will have an arrow at both ends.
 * Arrows are only available for `widthIs: 'mid'` and `linePrimitives: false`
 * @property {boolean} [linePrimitives] Use WebGL line primitives instead of
 * triangle primitives to draw the line (`false`)
 * @property {number} [lineNum] Number of line primitives to use when
 * `linePrimitivs`: `true` (`2`)
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer the same as the line with additional `number` thickness
 * on each side and the ends (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple line defined by two points
 * figure.add({
 *   name: 'l',
 *   make: 'line',
 *   p1: [0, 0],
 *   p2: [0, 1],
 *   width: 0.02,
 * });
 *
 * @example
 * // Dashed line defined by a point, a length and an angle
 * figure.add({
 *   name: 'l',
 *   make: 'line',
 *   p1: [0, 0],
 *   length: 1,
 *   angle: Math.PI / 2,
 *   width: 0.03,
 *   dash: [0.1, 0.02, 0.03, 0.02],
 * });
 *
 * @example
 * // Line with two different arrows on ends
 * figure.add({
 *   name: 'l',
 *   make: 'line',
 *   p1: [0, 0],
 *   p2: [0, 1],
 *   width: 0.03,
 *   arrow: {
 *     start: 'rectangle',
 *     end: 'barb',
 *   },
 * });
 */
export type OBJ_Line = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  angle?: number,
  width?: number,
  widthIs?: 'positive' | 'negative' | 'mid' | number,
  dash?: TypeDash,
  arrow?: OBJ_LineArrows | TypeArrowHead,
  linePrimitives?: boolean,
  lineNum?: number,
  drawBorderBuffer?: number | TypeParsableBorder,
} & OBJ_Generic;

/**
 * Grid shape options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/grid.png)
 *
 * A grid is a rectangle divided into a series of vertical and horizontal lines.
 *
 * The rectangle is defined by `bounds`.
 *
 * `xNum` and `yNum` can be used to defined a number of equally spaced lines
 * in the rectangle (including the edges).
 *
 * Alternatively `xStep` and `yStep` can be used to define the spacing between
 * lines from the bottom left corner.
 *
 * The line width and style is defined with `line`.
 *
 * @property {TypeParsableRect} [bounds] rectangle definition
 * @property {number} [xStep] distance between vertical lines in grid from
 * left - use this instead of `xNum`.
 * @property {number} [yStep] distance between horizontal lines in grid from
 * bottom - use this instead of `yNum`
 * @property {number} [xNum] number of vertical lines in grid including top and
 * bottom lines - overrides xStep
 * @property {number} [yNum] number of horizontal lines in grid including left
 * and right lines - overrides yStep
 * @property {OBJ_LineStyle} [line] line style options - do not use any corner
 * options
 * @property {number | TypeParsableBorder} [drawBorderBuffer]
 * override OBJ_Generic `drawBorderBuffer` with `number` to make the
 * drawBorderBuffer the same as the grid outline with additional `number`
 * buffer each side (`0`)
 *
 * @extends OBJ_Generic
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Grid defined by xStep and yStep
 * figure.add({
 *   name: 'g',
 *   make: 'grid',
 *   bounds: [-0.5, -0.5, 1, 1],
 *   xStep: 0.25,
 *   yStep: 0.25,
 *   line: {
 *     width: 0.03,
 *   },
 * });
 *
 * @example
 * // Grid defined by xNum and yNum with dashed lines
 * const grid = figure.primitives.grid({
 *   bounds: [-0.5, -0.5, 1, 1],
 *   xNum: 4,
 *   yNum: 4,
 *   line: {
 *     width: 0.03,
 *     dash: [0.1, 0.02],
 *   },
 * });
 * figure.elements.add('g', grid);
 *
 * @example
 * // Grid of grids
 * figure.add({
 *   name: 'g',
 *   make: 'grid',
 *   bounds: [-0.7, -0.7, 0.6, 0.6],
 *   xNum: 4,
 *   yNum: 4,
 *   line: {
 *     width: 0.03,
 *   },
 *   copy: [
 *     { along: 'x', num: 1, step: 0.8},
 *     { along: 'y', num: 1, step: 0.8},
 *   ],
 * });
 */
export type OBJ_Grid = {
  bounds?: TypeParsableRect,
  xStep?: number,
  yStep?: number,
  xNum?: number,
  yNum?: number,
  line?: OBJ_LineStyleSimple,
  drawBorderBuffer?: number | TypeParsableBorder,
} & OBJ_Generic;

/**
 * Arrow options object that extends {@link OBJ_Generic} (without
 * `drawType`)
 *
 * ![](./apiassets/arrow_heads.png)
 *
 * An arrow has a head, tail, length and width. The `head` defines the head
 * style of the arrow. The `length`, `width` (or `radius` for polygon and circle
 * head styles) define the size of the arrow and `tail` defines wether it has a
 * tail and how long it is.
 *
 * All properties have default values that can be scaled with the `scale`
 * property. So a `scale` of 2 will double the size of the default arrow.
 *
 * An arrow can be aligned and oriented with `align` and `angle`. `align`
 * positions the tip, start, tail or middle part of the arrow at (0, 0) in
 * draw space. This part of the arrow will therefore be at the `position`
 * or translation of the `transform`. `angle` then gives the arrow some drawn
 * rotation.
 *
 * Alignment definitions are:
 * - `tip`: arrow tip
 * - `start`: opposite side of `tip`
 * - `mid`: mid points between `start` and `tip` - useful for polygon, circle
 *   and bar arrows without tails when the head should be on a point, not next
 *   to it
 * - `tail`: the end of the tail when a tail exists, or where a tail would start
 *   if it doesn't exist.
 *
 * Setting the `tail` property to `false` will draw only the arrow head,
 * `true` will draw a tail of length 0, and a tail with a custom length
 * can be defined with a `number`. A tail length of 0 will only extend a tail
 * to the boundaries of the head. A positive tail, will extend it beyond the
 * boundaries.
 *
 * For arrow heads that use `length` and `width` properties, the `length` is the
 * dimension along the line. It includes both the head and the tail, so an arrow
 * with length 1 and tailLength 0.4 will have a head length of 0.6.
 *
 * For `polygon` and `circle` arrows, only `radius` and `tail` are used to
 * determine the dimension of the arrow (`length` and `width` are ignored).
 *
 * @property {TypeArrowHead} [head] head style (`'triangle'`)
 * @property {number} [scale] scale the default dimensions of the arrow
 * @property {number} [length] dimension of the arrow head along the line
 * @property {number} [width] dimension of the arrow head along the line width
 * @property {number} [rotation] rotation of the polygon when `head = 'polygon'`
 * @property {number} [sides] number of sides in polygon or circle arrow head
 * @property {number} [radius] radius of polygon or circle arrow head
 * @property {number} [barb] barb length (along the length of the line) of the
 * barb arrow head
 * @property {number} [tailWidth] width of the line that joins the arrow - if
 * defined this will create minimum dimensions for the arrow
 * @property {boolean | number} [tail] `true` includes a tail in the arrow of
 * with `tailWidth`. A `number` gives the tail a length where 0 will not
 * extend the tail beyond the boundaries of the head
 * @property {'tip' | 'start' | 'mid' | 'tail'} [align] define which part of
 * the arrow is aligned at (0, 0) in draw space (`'tip'`)
 * @property {number} [angle] angle the arrow is drawn at (`0`)
 *
 * @extends OBJ_Generic
 *
 * @example
 * // Triangle arrow with tail
 * figure.add({
 *   name: 'a',
 *   make: 'arrow',
 *   head: 'triangle',
 *   tail: 0.15,
 *   length: 0.5,
 * });
 *
 * @example
 * // Barb arrow with 0 tail
 * figure.add({
 *   name: 'a',
 *   make: 'arrow',
 *   head: 'barb',
 *   angle: Math.PI / 2,
 *   tail: 0,
 * });
 *
 * @example
 * // Create a vector map with arrows by copying an original arrow by a
 * // transforms defining the position, rotation and scale of the arrows
 *
 * // Create transforms to apply to each arrow
 * const r = Fig.range(0, Math.PI / 2, Math.PI / 18);
 * const x = [0, 1, 2, 0, 1, 2, 0, 1, 2];
 * const y = [0, 0, 0, 1, 1, 1, 2, 2, 2];
 * const s = [0.5, 0.8, 0.4, 0.6, 0.8, 0.6, 0.5, 0.8, 0.6];
 * const transforms = [];
 * for (let i = 0; i < 9; i += 1) {
 *   transforms.push(new Fig.Transform().scale(s[i], s[i]).rotate(r[i]).translate(x[i], y[i]));
 * }
 *
 * // Create arrow and copy to transforms
 * figure.add({
 *   name: 'a',
 *   make: 'arrow',
 *   head: 'barb',
 *   align: 'mid',
 *   length: 0.7,
 *   copy: {
 *     to: transforms,
 *     original: false,
 *   },
 * });
 */
export type OBJ_Arrow = {
  head?: TypeArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  sides?: number,
  radius?: number,
  barb?: number,
  tailWidth?: number,
  tail?: boolean,
  align?: 'tip' | 'start' | 'mid' | 'tail',
  angle?: number,
} & OBJ_Generic;


/**
 * Text Definition object
 *
 * Used within {@link OBJ_Text} to define a single string
 *
 * @property {string} text string to show
 * @property {OBJ_Font} [font] font to apply to string
 * @property {TypeParsablePoint} [location] draw space location to draw text
 * (default: `[0, 0]`)
 * @property {'left' | 'right' | 'center'} [xAlign] how to align text
 * horizontally relative to `location` (default: from {@link OBJ_Text})
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] how to align
 * text vertically relative to `location` (default: from {@link OBJ_Text})
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder`
 * @property {TypeParsableBuffer | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom points (`Array<TypeParsablePoint>`), set to
 * or set to some buffer (`number`) around the rext (default: `0`)
 */
export type OBJ_TextDefinition = {
  text: string,
  font?: OBJ_Font,
  location?: TypeParsablePoint,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  onClick?: string | () => void,
  touchBorder?: TypeParsableBuffer | Array<TypeParsablePoint>,
};

/**
 * One or more text strings.
 *
 * ![](./apiassets/text_ex1.png)
 *
 * ![](./apiassets/text_ex2.png)
 *
 * Simple text options object.
 *
 * Use this to make a {@link FigureElementPrimitive} that renders text.
 *
 * `text` can either be a single string, or an array of
 * {@link OBJ_TextDefinition} objects to define multiple strings. Each string
 * can have a different location, alignment (`xAlign`, `yAlign`) and formatting.
 *
 * {@link FigureElementPrimitive} objects allow for a callback to be defined
 * when they are touched by a user. In text {@link FigureElementPrimitive},
 * each string can have its own callback assigned using the `onClick` property
 * of {@link OBJ_TextDefinition}. In addition custom touch borders to make it
 * easier to click the strings can be defined.
 *
 * Note: there is a slight performance improvement in including multiple
 * strings at different locations in the same {@link FigureElementPrimitive},
 * rather than creating a {@link FigureElementPrimitive} for each string.
 *
 * @property {string | OBJ_TextDefinition | Array<string | OBJ_TextDefinition>} text
 * text to draw, either as a single string or multiple strings in an array
 * @property {OBJ_Font} [font] default font to apply to all text
 * @property {'left' | 'right' | 'center'} [xAlign] default horizontal text
 * alignment for `text` relative to `location` (default: `"left"`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] default
 * vertical text alignment for `text` relative to `location` (default: `"baseline"`)
 * @property {TypeParsableBuffer} [defaultTextTouchBorder]?: default buffer for
 * `touchBorder` property in `text`
 * @property {TypeColor} [color] (default: `[1, 0, 0, 1`])
 * @property {TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number} [border]
 * border used for keeping shape within limits (`'draw'`)
 * @property {TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw'} [touchBorder]
 * border used for determining shape was touched. `number` and `'rect'` use
 * the the points in `'buffer'` to calculate the bounding rects (`'buffer'`).
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * @property {boolean} [fixColor] If `true`, {@link FigureElement}`.setColor`
 * method will not change the color of text
 * (default: `Transform('text'))`)
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // Single string
 * figure.add(
 *   {
 *     name: 't',
 *     make: 'text',
 *     text: 'hello',
 *     xAlign: 'center',
 *     yAlign: 'middle',
 *   },
 * );
 *
 * @example
 * // Multi string
 * figure.add(
 *   {
 *     name: 't',
 *     make: 'text',
 *     text: [
 *       {
 *         text: 'hello',
 *         font: { style: 'italic', color: [0, 0.5, 1, 1], size: 0.1 },
 *         xAlign: 'left',
 *         yAlign: 'bottom',
 *         location: [-0.35, 0],
 *       },
 *       {
 *         text: 'world',
 *         location: [0, -0.1],
 *       },
 *     ],
 *     xAlign: 'center',
 *     yAlign: 'middle',
 *     font: { size: 0.3 },
 *     color: this.defaultColor,
 *   },
 * );
 */
export type OBJ_Text = {
  text: string | OBJ_TextDefinition | Array<string | OBJ_TextDefinition>;
  font?: OBJ_Font,                    // default font
  xAlign?: 'left' | 'right' | 'center',                // default xAlign
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
  defaultTextTouchBorder?: TypeParsableBuffer,
  color?: TypeColor,
  border?: TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw',
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  fixColor?: boolean,
}


/**
 * Line Text Definition object
 *
 * Used to define a string within a text line primitive {@link OBJ_TextLine}.
 *
 * @property {string} [text] string to show
 * @property {OBJ_Font} [font] font to apply to string
 * @property {TypeParsablePoint} [offset] offset to draw text (default: `[0, 0]`)
 * @property {boolean} [followOffsetY] `true` will make any subsequent text
 * have the same y offset as a starting point (`false`)
 * @property {boolean} [inLine] `false` means next text will follow previous
 * and not this (default: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of string
 * @property {TypeParsableBuffer | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), or be set to some
 * buffer (`TypeParsableBuffer`) around the rectangle (default: `'0'`)
 * @property {boolean} [fixColor] If `true`, {@link FigureElement}`.setColor`
 * method will not change the color of text
 */
export type OBJ_TextLineDefinition = {
  text: string,
  font?: OBJ_Font,
  offset?: TypeParsablePoint,
  followOffsetY?: boolean,
  inLine?: boolean,
  onClick?: string | () => void,
  touchBorder?: TypeParsableBuffer | Array<TypeParsablePoint>,
  fixColor?: boolean,
};

/**
 * Text Line
 *
 * ![](./apiassets/textLine.png)
 *
 * Array of strings that are arranged into a line. Each string is arranged so
 * that it is to the right of the previous string.
 *
 * Strings can be arranged out of the line flow by using the `inLine` property
 * in {@link OBJ_TextLineDefinition}.
 *
 * @property {Array<string | OBJ_TextLineDefinition>} [text] array of strings,
 * to layout into a line
 * @property {OBJ_Font} [font] Default font for strings in line
 * @property {TypeColor} [color] Default color for strings in line
 * (`[1, 0, 0, 1`])
 * @property {TypeParsableBuffer} [defaultTextTouchBorder]?: default buffer for
 * `touchBorder` property in `text`
 * @property {'left' | 'right' | 'center'} [xAlign] horizontal alignment of
 * line with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of line with `position` (`baseline`)
 * @property {TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number} [border]
 * border used for keeping shape within limits (`'draw'`)
 * @property {TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw'} [touchBorder]
 * border used for determining shape was touched. `number` and `'rect'` use
 * the the points in `'buffer'` to calculate the bounding rects (`'buffer'`).
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text'))`)
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // "Hello to the world1" with highlighted "to the" and superscript "1"
 * figure.add(
 *   {
 *     name: 'line',
 *     make: 'text.line',
 *     text: [
 *       'Hello ',
 *       {
 *         text: 'to the',
 *         font: {
 *           style: 'italic',
 *           color: [0, 0.5, 1, 1],
 *         },
 *       },
 *       ' world',
 *       {
 *         text: '1',
 *         offset: [0, 0.1],
 *         font: { size: 0.1, color: [0, 0.6, 0, 1] },
 *       },
 *     ],
 *     xAlign: 'center',
 *     yAlign: 'bottom',
 *     font: {
 *       style: 'normal',
 *       size: 0.2,
 *     },
 *     color: this.defaultColor,
 *   },
 * );
 */
export type OBJ_TextLine = {
  text: Array<string | OBJ_TextLineDefinition>;
  font: OBJ_Font,
  color: TypeColor,
  defaultTextTouchBorder?: TypeParsableBuffer,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  border?: TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw',
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
}

/**
 * Lines Text Definition object.
 *
 * Used to define a string within a text lines primitive {@link OBJ_TextLines}.
 *
 * @property {string} [text] string representing a line of text
 * @property {OBJ_Font} [font] line specific default font
 * @property {'left' | 'right' | 'center'} [justify] line specific justification
 * @property {number} [lineSpace] line specific separation from baseline of
 * this line to baseline of previous line
 * @property {boolean} [fixColor] If `true`, {@link FigureElement}`.setColor`
 * method will not change the color of text
 */
export type OBJ_TextLinesDefinition = {
  text: string,
  font?: OBJ_Font,
  justify?: 'left' | 'right' | 'center',
  lineSpace?: number,
  fixColor?: boolean,
};

/**
 * Modifier Text Definition object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextLines}.
 *
 * @property {string} [text] text to replace `modifierId` with - if `undefined`
 * then `modifierId` is used
 * @property {TypeParsablePoint} [offset] text offset
 * @property {boolean} [followOffsetY] `true` will make any subsequent text
 * have the same y offset as a starting point (`false`)
 * @property {OBJ_Font} [font] font changes for modified text
 * @property {boolean} [inLine] `false` if modified text should not contribute
 * to line layout (defqult: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of the modified text
 * @property {TypeParsableBuffer | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), or be set to some
 * buffer (`TypeParsableBuffer`) around the rectangle (default: `'0'`)
 */
export type OBJ_TextModifierDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  touchBorder?: TypeParsableBuffer | Array<TypeParsablePoint>,
  onClick?: string | () => void,
  followOffsetY?: boolean,
}

/**
 * Modifier object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextLines}.
 *
 * @property {OBJ_TextModifierDefinition} [modifierId] modifierId can be any
 * key
 */
export type OBJ_TextModifiersDefinition = {
  [modifierId: string]: OBJ_TextModifierDefinition,
}

/**
 * Text Lines
 *
 * ![](./apiassets/textLines_ex1.png)
 *
 * ![](./apiassets/textLines_ex2.png)
 *
 * Layout multiple lines of text, justified to the `left`,
 * `center` or `right`.
 *
 * Each line is defined by a string in `lines`.
 *
 * A word or phrase within the line can have custom formatting by defining a
 * unique ID surrounded in “|” characters. The unique id is then used as a key
 * in the modifiers object to define the formatting and replacement text. By
 * default, the unique id will be used as the replacement text.
 *
 * Each line can have custom formatting or justification by defining a
 * {@link OBJ_TextLinesDefinition} object instead or a string in the lines
 * array.
 *
 * To escape the modifier special character "|", use a forward slash. e.g.
 *
 * `"This line has a uses the special char: /|"`
 *
 * @property {Array<string | OBJ_TextLinesDefinition>} [text] array of line
 * strings
 * @property {OBJ_TextModifiersDefinition} [modifiers] modifier definitions
 * @property {OBJ_Font} [font] Default font to use in lines
 * @property {TypeColor} [color] Default color to use in lines
 * (`[1, 0, 0, 1`])
 * @property {TypeParsableBuffer} [defaultTextTouchBorder]?: default buffer for
 * `touchBorder` property in `text`
 * @property {'left' | 'right' | 'center} [justify] justification of lines
 * (`left`)
 * @property {number} [lineSpace] Space between baselines of lines
 * (`font.size * 1.2`)
 * @property {'left' | 'right' | 'center'} [xAlign] horizontal alignment of
 * lines with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of lines with `position` (`baseline`)
 * @property {TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number} [border]
 * border used for keeping shape within limits (`'draw'`)
 * @property {TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw'} [touchBorder]
 * border used for determining shape was touched. `number` and `'rect'` use
 * the the points in `'buffer'` to calculate the bounding rects (`'buffer'`).
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text'))`)
 * @property {OBJ_Font} [defaultAccent] default font for text modifiers that
 * are not defined.
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // "Two justified lines"
 * figure.add(
 *   {
 *     name: 't',
 *     make: 'text.lines',
 *     text: [
 *       'First line',
 *       'This is the second line',
 *     ],
 *     font: {
 *       style: 'normal',
 *       size: 0.2,
 *     },
 *     justify: 'center',
 *     color: this.defaultColor,
 *   },
 * );
 *
 * @example
 * // "Example showing many features of textLines"
 * figure.add(
 *   {
 *     name: 'lines',
 *     make: 'textLines',
 *     text: [
 *       'Lines justified to the left',
 *       'A |line| with a |modified_phrase|',
 *       {
 *         text: 'A |line| with custom defaults',
 *         font: {
 *           style: 'italic',
 *           color: [0, 0.5, 1, 1],
 *         },
 *       },
 *     ],
 *     modifiers: {
 *       modified_phrase: {
 *         text: 'modified phrase',
 *         font: {
 *           style: 'italic',
 *           color: [0, 0.5, 1, 1],
 *         },
 *       },
 *       line: {
 *         font: {
 *           family: 'Times New Roman',
 *           color: [0, 0.6, 0, 1],
 *           style: 'italic',
 *         },
 *       },
 *     },
 *     font: {
 *       family: 'Helvetica Neue',
 *       weight: '200',
 *       style: 'normal',
 *       size: 0.2,
 *     },
 *     justify: 'left',
 *     lineSpace: -0.4,
 *     position: [-0.5, 0.1],
 *   },
 * );
 */
export type OBJ_TextLines = {
  text: Array<string | OBJ_TextLinesDefinition>,
  modifiers: OBJ_TextModifiersDefinition,
  font?: OBJ_Font,
  defaultTextTouchBorder?: TypeParsableBuffer,
  justify?: 'left' | 'center' | 'right',
  lineSpace?: number,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  color: TypeColor,
  border?: TypeParsableBorder | 'buffer' | 'draw' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'rect' | 'border' | 'buffer' | number | 'draw',
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
  defaultAccent?: OBJ_Font,
};

