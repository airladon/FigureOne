// @flow
import {
  Rect, Point, Transform, getPoint, getRect, getTransform,
  parseBorder, getPoints,
} from '../../tools/g2';
// import {
//   round
// } from '../../tools/math';
import type {
  TypeParsablePoint, TypeParsableRect, TypeParsableTransform,
} from '../../tools/g2';
import { setHTML } from '../../tools/htmlGenerator';
import {
  FigureElementPrimitive, FigureElement,
} from '../Element';
import WebGLInstance from '../webgl/webgl';
import DrawContext2D from '../DrawContext2D';
import * as tools from '../../tools/math';
import { generateUniqueId, joinObjects } from '../../tools/tools';
import DrawingObject from '../DrawingObjects/DrawingObject';
// import VertexObject from '../DrawingObjects/VertexObject/VertexObject';
// import {
//   PolyLine, PolyLineCorners,
// } from '../FigureElements/PolyLine';
// import Fan from '../FigureElements/Fan';
// import {
//   Polygon, PolygonFilled, PolygonLine,
// } from '../FigureElements/Polygon';
// import RadialLines from '../FigureElements/RadialLines';
// import HorizontalLine from '../FigureElements/HorizontalLine';
// import DashedLine from '../FigureElements/DashedLine';
// import RectangleFilled from '../FigureElements/RectangleFilled';
// import Rectangle from '../FigureElements/Rectangle';
import Generic from './Generic';
// import Box from '../FigureElements/Box';
// import type { TypeRectangleFilledReference } from '../FigureElements/RectangleFilled';
// import Lines from '../FigureElements/Lines';
// import Arrow from '../FigureElements/Arrow';
// import { AxisProperties } from '../FigureElements/Plot/AxisProperties';
// import Axis from '../FigureElements/Plot/Axis';
import Text from './Text';
// import {
//   FigureText, FigureFont, TextObject, LinesObject,
// } from '../DrawingObjects/TextObject/TextObject';

import {
  TextObject, TextLineObject, TextLinesObject,
} from '../DrawingObjects/TextObject/TextObject';
import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
import type { OBJ_SpaceTransforms } from '../Figure';
import { makePolyLine, makePolyLineCorners } from '../geometries/lines/lines';
import { getPolygonPoints, getTrisFillPolygon } from '../geometries/polygon/polygon';
import { rectangleBorderToTris, getRectangleBorder } from '../geometries/rectangle';
import { ellipseBorderToTris, getEllipseBorder } from '../geometries/ellipse';
import { getTriangle } from '../geometries/triangle';
import { getArrow, defaultArrowOptions } from '../geometries/arrow';
import type { OBJ_LineArrows, TypeArrowHead } from '../geometries/arrow';
import getLine from '../geometries/line';
// import type {
//   OBJ_Copy,
// } from './FigurePrimitiveTypes';
import { copyPoints } from '../geometries/copy/copy';
import type { CPY_Step } from '../geometries/copy/copy';
import type {
  TypeColor, TypeDash, OBJ_CurvedCorner, OBJ_Font,
} from '../../tools/types';

/**
 * Line style definition object.
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative'} [widthIs]
 * defines how the width is grown from the polyline's points.
 * @property {number} [width] line width
 * @property {TypeDash} [dash] select solid or dashed line
 * @property {TypeColor} [color] line color
 */
export type OBJ_LineStyleSimple = {
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
}

/**
 * {@link FigureElementCollection} options object.
 *
 * <p class="inline_gif"><img src="./apiassets/collection.gif" class="inline_gif_image"></p>
 *
 * A collection is a group of other {@link FigureElement}s that will all
 * inherit the parent collections transform.
 *
 * @property {TypeParsableTransform} [transform]
 * @property {TypeParsablePoint} [position] if defined, will overwrite first
 * translation of `transform`
 * @property {TypeColor} [color] default color
 * @property {FigureElement | null} [parent] parent of collection
 * @property {Array<Array<TypeParsablePoint>> | 'children' | 'rect' | number} [border]
 * defines border of collection. Use `'children'` for the borders of the
 * children. Use 'rect' for bounding rectangle of children. Use `number`
 * for the bounding rectangle with some buffer. Use
 * `Array<Array<TypeParsablePoint>` for a custom border. (`'children'`)
 * @property {Array<Array<TypeParsablePoint>> | 'border' | number | 'rect'} [touchBorder]
 * defines the touch border of the collection. Use `'border'` to use the same
 * as the border of the collection. Use `'rect'` for the bounding rectangle
 * of the border. Use `number` for the bounding rectangle of the border plus
 * some buffer. Use `Array<Array<TypeParsablePoint>` for a custom touch
 * border (`'border'`).
 * @property {Array<Array<TypeParsablePoint>> | 'children'} [holeBorder] Hole
 * border of the collection. Use `'children'` to use the children element hole
 * borders, otherwise use `Array<Array<TypeParsablePoint>` for a customizable
 * border.
 *
 * @example
 * figure.add(
 *   {
 *     name: 'c',
 *     method: 'collection',
 *     elements: [         // add two elements to the collection
 *       {
 *         name: 'hex',
 *         method: 'polygon',
 *         options: {
 *           sides: 6,
 *           radius: 0.5,
 *         },
 *       },
 *       {
 *         name: 'text',
 *         method: 'text',
 *         options: {
 *           text: 'hexagon',
 *           position: [0, -0.8],
 *           xAlign: 'center',
 *           font: { size: 0.3 },
 *         },
 *       },
 *     ],
 *   },
 * );
 *
 * // When a collection rotates, then so does all its elements
 * figure.getElement('c').animations.new()
 *   .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
 *   .start();
 *
 * @example
 * // Collections and primitives can also be created from `figure.collections`
 * // and `figure.primitives`.
 * const c = figure.collections.collection();
 * const hex = figure.primitives.polygon({
 *   sides: 6,
 *   radius: 0.5,
 * });
 * const text = figure.primitives.text({
 *   text: 'hexagon',
 *   position: [0, -0.8],
 *   xAlign: 'center',
 *   font: { size: 0.3 },
 * });
 * c.add('hex', hex);
 * c.add('text', text);
 * figure.add('c', c);
 *
 * // When a collection rotates, then so does all its elements
 * c.animations.new()
 *   .delay(1)
 *   .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
 *   .start();
 */
export type OBJ_Collection = {
  transform?: TypeParsableTransform,
  position?: TypeParsablePoint,
  limits?: Rect,
  color?: TypeColor,
  parent?: FigureElement | null,
  border?: Array<Array<TypeParsablePoint>> | 'children' | 'rect' | number,
  touchBorder?: Array<Array<TypeParsablePoint>> | 'border' | number | 'rect',
  holeBorder?: Array<Array<TypeParsablePoint>> | 'children',
};

/**
 * Texture definition object
 *
 * A texture file is an image file like a jpg, or png.
 *
 * Textures can be used instead of colors to fill a shape in WebGL.
 *
 * Textures are effectively overlaid on a shape. Therefore, to overlay the
 * texture with the correct offset, magnification and aspect ratio the texture
 * must be mapped to the space the shape's vertices are defined in
 * (vertex space).
 *
 * This is done by defining a window, or rectangle, for the texture file
 * (`mapFrom`) and a similar window in vertex space (`mapTo`).
 * The texture is then offset and scaled such that its window aligns with the
 * vertex space window.
 *
 * The texture file has coordinates of (0, 0) in the bottom left corner and
 * (1, 1) in the top right corner.
 *
 * Therefore, to make a 1000 x 500 image fill a 2 x 1 rectangle in vertex space
 * centered at (0, 0) you would define:
 *
 * ```
 * mapFrom: new Rect(0, 0, 1, 1)
 * mapTo: new Rect(-1, -0.5, 2, 1)
 * ```
 *
 * If instead you wanted to zoom the image in the same rectange by a factor of 2
 * you could either:
 *
 * ```
 * mapFrom: new Rect(0.25, 0.25, 0.5, 0.5)
 * mapTo: new Rect(-1, -0.5, 2, 1)
 * ```
 *
 * or
 *
 * ```
 * mapFrom: new Rect(0, 0, 1, 1)
 * mapTo: new Rect(-2, -1, 4, 2)
 * ```
 *
 * Two ways of doing this are provided as sometimes it is more convenient to
 * think about the window on the image, and other times the window in vertex
 * space.
 *
 * If the shape has fill outside the texture boundaries then either the
 * texture can be repeated, or a pixel from the border (edge) of the image is
 * used (called clamping to edge).
 * WebGL only allows images that are square with a side length that is a
 * power of 2 (such as 16, 32, 64, 128 etc) to be repeated. All other images
 * can only be clamped to their edge.
 *
 * To repeat all other image resolutions, a texture can be mapped to a rectangle
 * and then the rectangle repeated throughout the figure.
 *
 * @property {string} src The url or location of the image
 * @property {Rect} [mapTo] vertex space window (`new Rect(-1, -1, 2, 2)`)
 * @property {Rect} [mapFrom] image space window (`new Rect(0, 0, 1, 1)`)
 * @property {boolean} [repeat] `true` will tile the image. Only works with
 * images that are square whose number of side pixels is a power of 2 (`false`)
 * @property {() => void} [onLoad] textures are loaded asynchronously, so this
 * callback can be used to execute code after the texture is loaded. At a
 * minimum, any custom function here should include a call to animate the next
 * frame (`figure.animateNextFrame`)
 */
export type OBJ_Texture = {
  src?: string,
  mapTo?: Rect,
  mapFrom?: Rect,
  repeat?: boolean,
  onLoad?: () => void,
}

/**
 * Pulse options object
 *
 * @property {number} [scale] scale to pulse
 * @property {number} [duration] duration to pulse
 * @property {number} [frequency] frequency to pulse where 0
 */
export type OBJ_PulseScale = {
  duration?: number,
  scale?: number,
  frequency?: number,
};

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
 * The shape is colored with either `color` or `texture`.
 *
 * The shape's points can be duplicated using the `copy` property
 * to conveniently create multiple copies (like grids) of shapes.
 *
 * The shape will have a touch `border` which may also have `holes`
 * or areas where touching has no effect.
 *
 * @property {Array<TypeParsablePoint>} points
 * @property {'triangles' | 'strip' | 'fan' | 'lines'} [drawType]
 * (`'triangles'`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] use `drawType` as
 * `'triangles'` when using copy (`[]`)
 * @property {TypeColor} [color] (`[1, 0, 0, 1])
 * @property {OBJ_Texture} [texture] override `color` with a texture if defined
 * @property {Array<Array<TypeParsablePoint>> | null} [border] border used for
 * keeping shape within limits
 * @property {Array<Array<TypeParsablePoint>> | 'rect' | 'border' | null} [touchBorder]
 * border used for touching
 * @property {Array<Array<TypeParsablePoint>> | null} [holeBorder] borders where
 * touching will not work
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
 *   method: 'generic',
 *   options: {
 *     points: [
 *       [-1, 0.5], [-1, -0.5], [0, 0.5],
 *       [0, 0.5], [-1, -0.5], [0, -0.5],
 *       [0, -0.5], [1, 0.5], [1, -0.5],
 *     ],
 *   },
 * });
 * @example
 * // rhombus with larger touch borders
 * figure.add({
 *   name: 'rhombus',
 *   method: 'generic',
 *   options: {
 *     points: [
 *       [-0.5, -0.5], [0, 0.5], [1, 0.5],
 *       [-0.5, -0.5], [1, 0.5], [0.5, -0.5],
 *     ],
 *     border: [[
 *       [-1, -1], [-0.5, 1], [1.5, 1], [1, -1],
 *     ]],
 *   },
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
 *   method: 'generic',
 *   options: {
 *     points: [
 *       [-1, -1], [-0.7, -1], [-1, -0.7],
 *     ],
 *     copy: [
 *       { along: 'x', num: 5, step: 0.4 },
 *       { along: 'y', num: 5, step: 0.4 },
 *     ],
 *   },
 * });
 */
export type OBJ_Generic = {
  points?: Array<TypeParsablePoint> | Array<Point>,
  drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
  copy?: Array<CPY_Step | string> | CPY_Step,
  color?: TypeColor,
  texture?: OBJ_Texture,
  border?: Array<Array<TypeParsablePoint>> | Array<TypeParsablePoint> | 'buffer' | 'draw',
  touchBorder?: Array<Array<TypeParsablePoint>> | Array<TypeParsablePoint> | 'rect' | 'border' | 'buffer' | number,
  holeBorder?: Array<Array<TypeParsablePoint>>,
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  pulse?: number,
}

// generic
// polyline
// rectangle
// polygon
// polygonSweep
// repeat
// grid

// Special
// box (surround)
// shape


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
 * give it some width. This width can either be grown on one side of the
 * ideal polyline or grown on both sides of it equally.
 *
 * Here we define a line's side as either the *positive* side, or *negative*
 * side. If a line is defined from p1 to p2, then the *positive* side is the
 * side where the line moves if it is rotated around p1 in the positive (counter
 * clockwise) direction. Thus the order of the points that define the line
 * defines which side is positive and negative. A polyline is made up of many
 * lines end to end, and thus itself will have a positive and negative side
 * dependent on the order of points.
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
 * the line, or the negative side of the line. This is useful for caturing
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
 *     method: 'polyline',
 *     options: {
 *       points: [[-0.5, -0.5], [-0.1, 0.5], [0.3, -0.2], [0.5, 0.5]],
 *       width: 0.05,
 *     },
 *   },
 * );
 *
 * @example
 * // Square with rounded corners and dot-dash line
 * figure.add(
 *   {
 *     name: 'p',
 *     method: 'polyline',
 *     options: {
 *       points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
 *       width: 0.05,
 *       dash: [0.17, 0.05, 0.05, 0.05],
 *       close: true,
 *       cornerStyle: 'radius',
 *       cornerSize: 0.1,
 *     },
 *   },
 * );
 * @example
 * // Corners only of a triangle
 * figure.add(
 *  {
 *    name: 'p',
 *    method: 'polyline',
 *    options: {
 *      points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
 *      width: 0.05,
 *      close: true,
 *      cornersOnly: true,
 *      cornerLength: 0.2,
 *    },
 *  },
 *);
 * @example
 * // Zig zag with arrows
 * figure.add({
 *   name: 'arrowedLine',
 *   method: 'polyline',
 *   options: {
 *     points: [[0, 0], [1, 0], [0, 0.7], [1, 0.7]],
 *     width: 0.05,
 *     cornerStyle: 'fill',
 *     arrow: {
 *       scale: 0.7,
 *       start: {
 *         head: 'triangle',
 *         reverse: true,
 *       },
 *       end: 'barb',
 *     },
 *   },
 * });
 */
export type OBJ_Polyline = {
  points?: Array<TypeParsablePoint> | Array<Point>,
  width?: number,
  close?: boolean,
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
  drawBorder?: 'line' | 'positive' | 'negative',
  drawBorderBuffer?: number,
  holeBorder?: 'positive' | 'negative' | Array<Array<TypeParsablePoint>>,
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
 *   method: 'polygon',
 *   options: {
 *     sides: 6,
 *     radius: 0.5,
 *   },
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
 *   method: 'polygon',
 *   options: {
 *     sides: 8,
 *     radius: 0.5,
 *     angleToDraw: Math.PI,
 *     line: {
 *       width: 0.03,
 *     },
 *     direction: -1,
 *     rotation: Math.PI / 2,
 *   },
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
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the polygon if defined. If using fill and copying, use `fill`: `'tris'`
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
 *   method: 'star',
 *   options: {
 *     radius: 0.5,
 *     sides: 5,
 *   },
 * });
 *
 * @example
 * // 7 pointed dashed line star
 * figure.add({
 *   name: 's',
 *   method: 'star',
 *   options: {
 *     radius: 0.5,
 *     innerRadius: 0.3,
 *     sides: 7,
 *     line: {
 *       width: 0.02,
 *       dash: [0.05, 0.01],
 *     },
 *   },
 * });
 *
 * @example
 * // Star surrounded by stars
 * figure.add({
 *   name: 's',
 *   method: 'star',
 *   options: {
 *     radius: 0.1,
 *     sides: 5,
 *     rotation: -Math.PI / 2,
 *     // line: { width: 0.01 },
 *     copy: [
 *       {
 *         to: [0.6, 0],
 *         original: false,
 *       },
 *       {
 *         along: 'rotation',
 *         num: 16,
 *         step: Math.PI * 2 / 16,
 *         start: 1,
 *       },
 *       {
 *         to: new Fig.Transform().scale(3, 3).rotate(Math.PI / 2),
 *         start: 0,
 *         end: 1,
 *       },
 *     ],
 *   },
 * });
 */
export type OBJ_Star = {
  sides?: number,
  radius?: number,
  innerRadius?: number,
  rotation?: number,
  offset?: TypeParsablePoint,
  line?: OBJ_LineStyleSimple,
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
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the rectangle
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
 *   method: 'rectangle',
 *   options: {
 *     width: 1,
 *     height: 0.5,
 *   },
 * });
 *
 * @example
 * // Corners with radius and dashed line
 * figure.add({
 *   name: 'r',
 *   method: 'rectangle',
 *   options: {
 *     width: 0.5,
 *     height: 0.5,
 *     line: {
 *       width: 0.02,
 *       dash: [0.05, 0.03]
 *     },
 *     corner: {
 *       radius: 0.1,
 *       sides: 10,
 *     },
 *   },
 * });
 *
 * @example
 * // Rectangle copies rotated
 * figure.add({
 *   name: 'r',
 *   method: 'rectangle',
 *   options: {
 *     width: 0.5,
 *     height: 0.5,
 *     line: {
 *       width: 0.01,
 *     },
 *     copy: {
 *       along: 'rotation',
 *       num: 3,
 *       step: Math.PI / 2 / 3
 *     },
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
 *   method: 'ellipse',
 *   options: {
 *     height: 1,
 *     width: 0.5,
 *     sides: 100,
 *   },
 * });
 *
 * @example
 * // Dashed line circle
 * figure.add({
 *   name: 'e',
 *   method: 'ellipse',
 *   options: {
 *     height: 1,
 *     width: 1,
 *     sides: 100,
 *     line: {
 *       width: 0.02,
 *       dash: [0.05, 0.02],
 *     },
 *   },
 * });
 *
 * @example
 * // Ellipse grid
 * figure.add({
 *   name: 'e',
 *   method: 'ellipse',
 *   options: {
 *     height: 0.08,
 *     width: 0.2,
 *     sides: 20,
 *     copy: [
 *       { along: 'x', step: 0.25, num: 5 },
 *       { along: 'y', step: 0.15, num: 5 },
 *     ]
 *   },
 * });
 */
export type OBJ_Ellipse = {
  width?: number,
  height?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | number,
  sides?: number,
  fill?: boolean,
  line?: OBJ_LineStyleSimple,
} & OBJ_Generic;

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
 * Finally, the triangle can be positioned (in vertex space) using `xAlign` and
 * `yAlign`. An `xAlign` of `'left'` will position the triangle so that it's
 * left most point will be at (0, 0). Similarly, a `yAlign` of `'top'` will
 * position the triangle so its top most point is at (0, 0). Triangles
 * can also be aligned by angles (corners) and side mid points. For instance, an
 * `xAlign` of `'a2'`, will position the a2 corner at x = 0. Similarly a
 * `yAlign` of `'s3'` will position the triangle vertically such that the mid
 * point of s3 is at y = 0. `'centroid'` is relative to the geometric center of
 * the triangle.
 *
 * Once a triangle is defined and positioned in vertex space, it can then be
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
 * @property {number} [width] (`1`)
 * @property {number} [height] (`1`)
 * @property {'left' | 'right' | 'center'} [top] (`center`)
 * @property {[number, number, number]} [SSS]
 * @property {[number, number, number]} [ASA]
 * @property {[number, number, number]} [AAS]
 * @property {[number, number, number]} [SAS]
 * @property {1 | -1} [direction]
 * @property {number | { side: 's1' | 's2' | 's3', angle: number }} [rotation]
 * @property {'left' | 'center' | 'right' | number | 'a1' | 'a2' | 'a3' | 's1' | 's2' | 's3' | 'centroid'} [xAlign] (`'centroid'`)
 * @property {'bottom' | 'middle' | 'top' | number | 'a1' | 'a2' | 'a3' | 's1'| 's2' | 's3' | 'centroid'} [yAlign] (`'centroid'`)
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
 *   method: 'triangle',
 *   options: {
 *     width: 0.5,
 *     height: 1,
 *     top: 'right',
 *   },
 * });
 *
 * @example
 * // 30-60-90 triangle with dashed line
 * const t = figure.primitives.triangle({
 *   options: {
 *     ASA: [Math.PI / 2, 1, Math.PI / 6],
 *     line: {
 *       width: 0.02,
 *       dash: [0.12, 0.04],
 *     },
 *   },
 * });
 * figure.elements.add('t', t);
 *
 * @example
 * // Star from 4 equilateral triangles
 * figure.add({
 *   name: 'star',
 *   method: 'triangle',
 *   options: {
 *     SSS: [1, 1, 1],
 *     xAlign: 'centroid',
 *     yAlign: 'centroid',
 *     copy: {
 *       along: 'rotation',
 *       num: 3,
 *       step: Math.PI / 6,
 *     },
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
  rotation?: number | { side: number, angle: number },
  xAlign: 'left' | 'center' | 'right' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'centroid',
  yAlign: 'bottom' | 'middle' | 'top' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'centroid',
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
 * a single points `p1`, a `length` and an `angle`.
 *
 * The line has some `width` that will be filled on both sides
 * of the line points evenly (`'mid'`), or on one side only.
 * The line's `'positive'` side is the side to which it rotates toward
 * when rotating in the positive angle direction around `p1`.
 * Similarly the line's `'negative'` side is the opposite.
 *
 * The line can be solid or dashed where dashing is defined as an
 * array of numbers. The first number is the length of solid line and the
 * second is the length of the gap. If a third number is defined, then it is
 * the length of the next solid line, and so on. The dash pattern will repeat.
 *
 * The line can have arrows at one or both ends using the `arrow` property.
 *
 * @property {TypeParsablePoint} [p1] start point of line
 * @property {TypeParsablePoint} [p2] end point of line
 * @property {number} [length] length of line from `p1`
 * @property {number} [angle] angle of line from `p1`
 * @property {number} [width] (`0.01`)
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative'} [widthIs]
 * defines how the width is grown from the polyline's points.
 * Only `"mid"` is fully compatible with all options in
 * `arrow` and `dash`. (`"mid"`)
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
 *   method: 'line',
 *   options: {
 *     p1: [0, 0],
 *     p2: [0, 1],
 *     width: 0.02,
 *   },
 * });
 *
 * @example
 * // Dashed line defined by a point, a length and an angle
 * figure.add({
 *   name: 'l',
 *   method: 'line',
 *   options: {
 *     p1: [0, 0],
 *     length: 1,
 *     angle: Math.PI / 2,
 *     width: 0.03,
 *     dash: [0.1, 0.02, 0.03, 0.02],
 *   },
 * });
 *
 * @example
 * // Line with two different arrows on ends
 * figure.add({
 *   name: 'l',
 *   method: 'line',
 *   options: {
 *     p1: [0, 0],
 *     p2: [0, 1],
 *     width: 0.03,
 *     arrow: {
 *       start: 'rectangle',
 *       end: 'barb',
 *     },
 *   },
 * });
 */
export type OBJ_Line = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  angle?: number,
  width?: number,
  widthIs?: 'positive' | 'negative' | 'mid',
  dash?: TypeDash,
  arrow?: OBJ_LineArrows | TypeArrowHead,
  linePrimitives?: boolean,
  lineNum?: number,
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
 *   method: 'grid',
 *   options: {
 *     bounds: [-0.5, -0.5, 1, 1],
 *     xStep: 0.25,
 *     yStep: 0.25,
 *     line: {
 *       width: 0.03,
 *     },
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
 *   method: 'grid',
 *   options: {
 *     bounds: [-0.7, -0.7, 0.6, 0.6],
 *     xNum: 4,
 *     yNum: 4,
 *     line: {
 *       width: 0.03,
 *     },
 *     copy: [
 *       { along: 'x', num: 1, step: 0.8},
 *       { along: 'y', num: 1, step: 0.8},
 *     ],
 *   },
 * });
 */
export type OBJ_Grid = {
  bounds?: TypeParsableRect,
  xStep?: number,
  yStep?: number,
  xNum?: number,
  yNum?: number,
  line?: OBJ_LineStyleSimple,
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
 *   method: 'arrow',
 *   options: {
 *     head: 'triangle',
 *     tail: 0.15,
 *     length: 0.5,
 *   },
 * });
 *
 * @example
 * // Barb arrow with 0 tail
 * figure.add({
 *   name: 'a',
 *   method: 'arrow',
 *   options: {
 *     head: 'barb',
 *     angle: Math.PI / 2,
 *     tail: 0,
 *   },
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
 *   method: 'arrow',
 *   options: {
 *     head: 'barb',
 *     align: 'mid',
 *     length: 0.7,
 *     copy: {
 *       to: transforms,
 *       original: false,
 *     },
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
 * @property {TypeParsablePoint} [location] vertex space location to draw text
 * (default: `[0, 0]`)
 * @property {'left' | 'right' | 'center'} [xAlign] how to align text
 * horizontally relative to `location` (default: from {@link OBJ_Text})
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] how to align
 * text vertically relative to `location` (default: from {@link OBJ_Text})
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder`
 * @property {'rect' | Array<TypeParsablePoint>} [border] border can be custom
 * points (`Array<TypeParsablePoint>`) or set to `'rect'` for the encompassing
 * rectangle of the text (default: `"rect"`)
 * @property {'rect' | number | 'border' | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom points (`Array<TypeParsablePoint>`), set to
 * `'rect'` for the encompassing rectangle of the text, set to `'border'` to be
 * the same as the border of the text, or set to some buffer (`number`) around
 * the rectangle (default: `"rect"`)
 */
export type OBJ_TextDefinition = {
  text: string,
  font?: OBJ_Font,
  location?: TypeParsablePoint,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  onClick?: string | () => void,
  border?: 'rect' | Array<TypeParsablePoint>,
  touchBorder?: 'rect' | number | 'border' | Array<TypeParsablePoint>,
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
 * @property {TypeColor} [color] (default: `[1, 0, 0, 1`])
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (default: `Transform('text').standard()`)
 * @property {'text' | 'rect' | Array<Array<TypeParsablePoint>>} [border]
 * border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for the
 * encompassing rectangle around all text borders combined,
 * or set to `'text'` for the individual text borders (default: `'text'`)
 * @property {'text' | 'rect' | number | 'border' | Array<Array<TypeParsablePoint>>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for
 * the encompassing rectangle around all text touch borders, set to `'text'`
 * for the individual text touch borders (`'text'`), set to `'border'` to be the
 * same as the element border or a (`number`) for a rectangle with some buffer
 * around all text touch borders combined into an encompassing rect (default: `'text'`)
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // Single string
 * figure.add(
 *   {
 *     name: 't',
 *     method: 'text',
 *     options: {
 *       text: 'hello',
 *       xAlign: 'center',
 *       yAlign: 'middle',
 *     },
 *   },
 * );
 *
 * @example
 * // Multi string
 * figure.add(
 *   {
 *     name: 't',
 *     method: 'text',
 *     options: {
 *       text: [
 *         {
 *           text: 'hello',
 *           font: { style: 'italic', color: [0, 0.5, 1, 1], size: 0.1 },
 *           xAlign: 'left',
 *           yAlign: 'bottom',
 *           location: [-0.35, 0],
 *         },
 *         {
 *           text: 'world',
 *           location: [0, -0.1],
 *         },
 *       ],
 *       xAlign: 'center',
 *       yAlign: 'middle',
 *       font: { size: 0.3 },
 *       color: this.defaultColor,
 *     },
 *   },
 * );
 */
export type OBJ_Text = {
  text: string | OBJ_TextDefinition | Array<string | OBJ_TextDefinition>;
  font?: OBJ_Font,                    // default font
  xAlign?: 'left' | 'right' | 'center',                // default xAlign
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
  color?: TypeColor,
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  border?: 'text' | 'rect' | Array<Array<TypeParsablePoint>>,
  touchBorder?: 'text' | 'rect' | number | 'border' | Array<Array<TypeParsablePoint>>,
}


/**
 * Line Text Definition object
 *
 * Used to define a string within a text line primitive {@link OBJ_TextLine}.
 *
 * @property {string} [text] string to show
 * @property {OBJ_Font} [font] font to apply to string
 * @property {TypeParsablePoint} [offset] offset to draw text (default: `[0, 0]`)
 * @property {boolean} [inLine] `false` means next text will follow previous
 * and not this (default: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of string
 * @property {'rect' | Array<TypeParsablePoint>} [border] border can be custom
 * (`Array<TypeParsablePoint>`) or set to `'rect'` for the encompassing
 * rectangle of the text (default: `'rect'`)
 * @property {'rect' | number | 'border' | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for
 * the encompassing rectangle of the text, set to `'border'` to be the same as
 * the border of the text, or set to some buffer (`number`) around
 * the rectangle (default: `'rect'`)
 */
export type OBJ_TextLineDefinition = {
  text: string,
  font?: OBJ_Font,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  onClick?: string | () => void,
  border?: 'rect' | Array<TypeParsablePoint>,
  touchBorder?: 'rect' | number | 'border' | Array<TypeParsablePoint>,
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
 * @property {'left' | 'right' | 'center} [xAlign] horizontal alignment of
 * line with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of line with `position` (`baseline`)
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text').standard()`)
 * @property {'text' | 'rect' | Array<Array<TypeParsablePoint>>} [border]
 * border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for the
 * encompassing rectangle around all text borders combined,
 * or set to `'text'` for the individual text borders (`'rect'`)
 * @property {'text' | 'rect' | number | 'border' | Array<Array<TypeParsablePoint>>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for
 * the encompassing rectangle around all text touch borders, set to `'text'`
 * for the individual text touch borders (`'text'`), set to `'border'` to be the
 * same as the element border or a (`number`) for a rectangle with some buffer
 * around all text touch borders combined into an encompassing rect (`'rect'`)
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // "Hello to the world1" with highlighted "to the" and superscript "1"
 * figure.add(
 *   {
 *     name: 'line',
 *     method: 'text.line',
 *     options: {
 *       text: [
 *         'Hello ',
 *         {
 *           text: 'to the',
 *           font: {
 *             style: 'italic',
 *             color: [0, 0.5, 1, 1],
 *           },
 *         },
 *         ' world',
 *         {
 *           text: '1',
 *           offset: [0, 0.1],
 *           font: { size: 0.1, color: [0, 0.6, 0, 1] },
 *         },
 *       ],
 *       xAlign: 'center',
 *       yAlign: 'bottom',
 *       font: {
 *         style: 'normal',
 *         size: 0.2,
 *       },
 *       color: this.defaultColor,
 *     },
 *   },
 * );
 */
export type OBJ_TextLine = {
  text: Array<string | OBJ_TextLineDefinition>;
  font: OBJ_Font,
  color: TypeColor,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
  border?: 'rect' | 'text' | Array<TypeParsablePoint>,
  touchBorder?: 'rect' | number | 'border' | 'text' | Array<TypeParsablePoint>,
}

/**
 * Lines Text Definition object.
 *
 * Used to define a string within a text lines primitive {@link OBJ_TextLines}.
 *
 * @property {string} [line] string representing a line of text
 * @property {OBJ_Font} [font] line specific default font
 * @property {'left' | 'right' | 'center'} [justify] line specific justification
 * @property {number} [lineSpace] line specific separation from baseline of
 * this line to baseline of previous line
 */
export type OBJ_TextLinesDefinition = {
  line: string,
  font?: OBJ_Font,
  justify?: 'left' | 'right' | 'center',
  lineSpace?: number,
};

/**
 * Modifier Text Definition object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextLines}.
 *
 * @property {string} [text] text to replace `modifierId` with - if `undefined`
 * then `modifierId` is used
 * @property {OBJ_Font} [font] font changes for modified text
 * @property {boolean} [inLine] `false` if modified text should not contribute
 * to line layout (defqult: `true`)
 * @property {string | function(): void} [onClick] function to execute on click
 * within the `touchBorder` of the modified text
 * @property {'rect' | Array<TypeParsablePoint>} [border] border of modified
 * text can be custom (`Array<TypeParsablePoint>`) or set to `'rect'` for the
 * encompassing rectangle of the text (default: `'rect'`)
 * @property {'rect' | number | 'border' | Array<TypeParsablePoint>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for
 * the encompassing rectangle of the text, set to `'border'` to be the same as
 * the border of the text, or set to some buffer (`number`) around
 * the rectangle (default: `'rect'`)
 */
export type OBJ_TextModifierDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  border?: 'rect' | Array<TypeParsablePoint>,
  touchBorder?: 'rect' | number | 'border' | Array<TypeParsablePoint>,
  onClick?: string | () => void,
}

/**
 * Modifier object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextLines}.
 *
 * @property {OBJ_TextModifiersDefinition} [modifierId] modifierId can be any
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
 * @property {'left' | 'right' | 'center} [justify] justification of lines
 * (`left`)
 * @property {number} [lineSpace] Space between baselines of lines
 * (`font.size * 1.2`)
 * @property {'left' | 'right' | 'center} [xAlign] horizontal alignment of
 * lines with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of lines with `position` (`baseline`)
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text').standard()`)
 * @property {'text' | 'rect' | Array<Array<TypeParsablePoint>>} [border]
 * border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for the
 * encompassing rectangle around all text borders combined,
 * or set to `'text'` for the individual text borders (`'rect'`)
 * @property {'text' | 'rect' | number | 'border' | Array<Array<TypeParsablePoint>>} [touchBorder]
 * touch border can be custom (`Array<TypeParsablePoint>`), set to `'rect'` for
 * the encompassing rectangle around all text touch borders, set to `'text'`
 * for the individual text touch borders (`'text'`), set to `'border'` to be the
 * same as the element border or a (`number`) for a rectangle with some buffer
 * around all text touch borders combined into an encompassing rect (`'rect'`)
 *
 * @see To test examples, append them to the
 * <a href="#text-boilerplate">boilerplate</a>
 *
 * @example
 * // "Two justified lines"
 * figure.add(
 *   {
 *     name: 't',
 *     method: 'text.lines',
 *     options: {
 *       text: [
 *         'First line',
 *         'This is the second line',
 *       ],
 *       font: {
 *         style: 'normal',
 *         size: 0.2,
 *       },
 *       justify: 'center',
 *       color: this.defaultColor,
 *     },
 *   },
 * );
 *
 * @example
 * // "Example showing many features of textLines"
 * figure.add(
 *   {
 *     name: 'lines',
 *     method: 'textLines',
 *     options: {
 *        text: [
 *          'Lines justified to the left',
 *          'A |line| with a |modified_phrase|',
 *          {
 *            text: 'A |line| with custom defaults',
 *            font: {
 *              style: 'italic',
 *              color: [0, 0.5, 1, 1],
 *            },
 *          },
 *        ],
 *        modifiers: {
 *          modified_phrase: {
 *            text: 'modified phrase',
 *            font: {
 *              style: 'italic',
 *              color: [0, 0.5, 1, 1],
 *            },
 *          },
 *          line: {
 *            font: {
 *              family: 'Times New Roman',
 *              color: [0, 0.6, 0, 1],
 *              style: 'italic',
 *            },
 *          },
 *        },
 *        font: {
 *          family: 'Helvetica Neue',
 *          weight: '200',
 *          style: 'normal',
 *          size: 0.2,
 *        },
 *        justify: 'left',
 *        lineSpace: -0.4,
 *        position: [-0.5, 0.1],
 *      },
 *   },
 * );
 */
export type OBJ_TextLines = {
  text: Array<string | OBJ_TextLinesDefinition>,
  modifiers: OBJ_TextModifiersDefinition,
  font?: OBJ_Font,
  justify?: 'left' | 'center' | 'right',
  lineSpace?: number,
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  color: TypeColor,
  border?: 'rect' | 'text' | Array<TypeParsablePoint>,
  touchBorder?: 'rect' | number | 'border' | 'text' | Array<TypeParsablePoint>,
};

// export type TypeGridOptions = {
//   bounds?: Rect,
//   xStep?: number,
//   yStep?: number,
//   numLinesThick?: number,
//   color?: TypeColor,
//   position?: Point,
//   transform?: Transform,
//   pulse?: number,
// };

export type TypeRepeatPatternVertex = {
  element?: FigureElementPrimitive,
  xNum?: number,
  yNum?: number,
  xStep?: number,
  yStep?: number,
  pulse?: number;
  position?: Point,
  transform?: Transform,
};


// export type TypePointTransforms = {
//   offset?: TypeParsablePoint,
//   transform?: Transform,
//   repeatRect?: {
//     xNum?: number,
//     xStep?: number,
//     yNum?: number,
//     yStep?: number,
//   },
//   repeatPolar?: {
//     magNum?: number,
//     magStep?: number,
//     angleNum?: number,
//     angleStep?: number,
//     angleStart?: number,
//   },
//   repeatTransforms?: Array<Transform>,
// };

// export type TypeCopyLinear = {
//   num?: number,
//   step?: number,
//   angle?: number,
//   axis?: 'x' | 'y',
// }

// export type TypeCopyRadial = {
//   numMag?: number,
//   numAngle?: number,
//   stepMag?: number,
//   stepAngle?: number,
//   startAngle?: number,
// }

// export type TypeCopyOffset = {
//   offset: TypeParsablePoint,
// };

// export type TypeCopyTransform = {
//   transform: Transform;
// }

// export type TypeCopy = Array<Transform> | Array<Point> | TypeCopyRadial
//                        | TypeCopyLinear | Point | Transform | TypeCopyOffset
//                        | TypeCopyTransform;

// export type TypePointTransforms1 = {
//   offset?: TypeParsablePoint,
//   transform?: Transform,
//   copy: {
//     xNum?: number,
//     xStep?: number,
//     yNum?: number,
//     yStep?: number,
//     magNum?: number,
//     magStep?: number,
//     angleNum?: number,
//     angleStep?: number,
//     angleStart?: number,
//     transforms?: Array<Transform>,
//   },
//   copy: TypeCopy | Array<TypeCopy>,
// };


function parsePoints(
  options: Object,
  keysToParsePointsOrPointArrays: Array<string>,
) {
  const parseKey = (key) => {
    const value = options[key];
    if (value == null) {
      return;
    }
    if (typeof value === 'string') {
      return;
    }
    if (typeof value === 'number') {
      return;
    }
    const processArray = (a) => {
      for (let i = 0; i < a.length; i += 1) {
        if (Array.isArray(a[i]) && !(typeof a[i][0] === 'number')) {
          // eslint-disable-next-line no-param-reassign
          a[i] = processArray(a[i]);
        } else {
          // eslint-disable-next-line no-param-reassign
          a[i] = getPoint(a[i]);
        }
      }
      return a;
    };
    if (Array.isArray(value) && !(typeof value[0] === 'number')) {
      // eslint-disable-next-line no-param-reassign
      options[key] = processArray(value); // value.map(p => getPoint(p));
    } else {
      // eslint-disable-next-line no-param-reassign
      options[key] = getPoint(value);
    }
  };

  if (typeof keysToParsePointsOrPointArrays === 'string') {
    parseKey(keysToParsePointsOrPointArrays);
  } else {
    keysToParsePointsOrPointArrays.forEach(key => parseKey(key));
  }
}

function processOptions(...optionsIn: Array<Object>) {
  const options = joinObjects({}, ...optionsIn);
  if (options.position != null) {
    const p = getPoint(options.position);
    if (options.transform == null) {
      options.transform = new Transform('processOptions').translate(0, 0);
    }
    options.transform.updateTranslation(p);
  }
  return options;
}

function setupPulse(element: FigureElement, options: Object) {
  if (options.pulse != null) {
    if (
      typeof element.pulseDefault !== 'function'
      && typeof element.pulseDefault !== 'string'
    ) {
      if (typeof options.pulse === 'number') {
        // eslint-disable-next-line no-param-reassign
        element.pulseDefault.scale = options.pulse;
      } else {
        // eslint-disable-next-line no-param-reassign
        element.pulseDefault = joinObjects({}, element.pulseDefault, options.pulse);
      }
    }
  }
}

/**
 * Built in figure primitives.
 *
 * Including simple shapes, grid and text.
 */
export default class FigurePrimitives {
  webgl: Array<WebGLInstance>;
  draw2D: Array<DrawContext2D>;
  htmlCanvas: HTMLElement;
  limits: Rect;
  spaceTransforms: OBJ_SpaceTransforms;
  animateNextFrame: Function;
  draw2DFigures: Object;
  defaultColor: Array<number>;
  defaultFont: OBJ_Font;
  defaultLineWidth: number;
  defaultLength: number;

  /**
    * @hideconstructor
    */
  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    draw2D: Array<DrawContext2D> | DrawContext2D,
    // draw2DFigures: Object,
    htmlCanvas: HTMLElement,
    limits: Rect,
    spaceTransforms: OBJ_SpaceTransforms,
    animateNextFrame: Function,
    defaultColor: Array<number>,
    defaultFont: OBJ_Font,
    defaultLineWidth: number,
    defaultLength: number,
  ) {
    if (Array.isArray(webgl)) {
      this.webgl = webgl;
    } else {
      this.webgl = [webgl];
    }

    if (Array.isArray(draw2D)) {
      this.draw2D = draw2D;
    } else {
      this.draw2D = [draw2D];
    }
    /**
     * @private {htmlElement}
     */
    this.htmlCanvas = htmlCanvas;
    this.limits = limits;
    this.animateNextFrame = animateNextFrame;
    this.spaceTransforms = spaceTransforms;
    this.defaultColor = defaultColor;
    this.defaultFont = defaultFont;
    this.defaultLineWidth = defaultLineWidth;
    this.defaultLength = defaultLength;
    // this.draw2DFigures = draw2DFigures;
  }

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  generic(...optionsIn: Array<OBJ_Generic>) {
    const defaultOptions = {
      name: generateUniqueId('primitive_'),
      color: this.defaultColor,
      transform: new Transform('generic').standard(),
      texture: {
        src: '',
        mapTo: new Rect(-1, -1, 2, 2),
        mapFrom: new Rect(0, 0, 1, 1),
        repeat: false,
        onLoad: this.animateNextFrame,
      },
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    options.transform = getTransform(options.transform);
    if (options.position != null) {
      options.position = getPoint(options.position);
      options.transform.updateTranslation(options.position);
    }

    const element = Generic(
      this.webgl,
      options.color,
      options.transform,
      this.limits,
      options.texture.src,
      options.texture.mapTo,
      options.texture.mapFrom,
      options.texture.repeat,
      options.texture.onLoad,
      options.name,
    );

    element.custom.updateGeneric = function update(updateOptions: {
      points?: Array<TypeParsablePoint>,
      drawBorder?: Array<Array<TypeParsablePoint>>,
      drawBorderBuffer?: Array<Array<TypeParsablePoint>>,
      border?: Array<Array<TypeParsablePoint>> | 'drawBorder' | 'buffer',
      touchBorder?: Array<Array<TypeParsablePoint>> | 'border' | 'rect' | number | 'buffer',
      holeBorder?: Array<Array<TypeParsablePoint>>,
      copy?: Array<CPY_Step>,
      drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    }) {
      const o = updateOptions;
      if (o.copy != null && !Array.isArray(o.copy)) {
        o.copy = [o.copy];
      }
      if (o.points != null) {
        o.points = getPoints(o.points);
      }
      if (o.drawBorder != null) {
        element.drawBorder = parseBorder(o.drawBorder)
      }
      if (o.drawBorderBuffer != null) {
        element.drawBorderBuffer = parseBorder(o.drawBorderBuffer);
      }
      if (o.border != null) {
        element.border = parseBorder(o.border);
      }
      if (o.touchBorder != null) {
        element.touchBorder = parseBorder(o.touchBorder);
      }
      if (o.holeBorder != null) {
        element.holeBorder = parseBorder(o.holeBorder);
      }
      element.drawingObject.change(o);
    };
    element.custom.updateGeneric(options);
    element.custom.updatePoints = element.custom.updateGeneric;
    setupPulse(element, options);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a polyline.
   * @see {@link OBJ_Polyline} for options and examples.
   */
  polyline(...optionsIn: Array<OBJ_Polyline>) {
    const options = joinObjects({}, ...optionsIn);
    const element = this.generic({
      transform: new Transform('polyline').standard(),
      border: 'drawBorder',
      touchBorder: 'border',
      holeBorder: [[]],
    }, ...optionsIn);

    element.custom.options = {
      points: [[0, 0], [1, 0]],
      width: this.defaultLineWidth,
      color: this.defaultColor,
      close: false,
      widthIs: 'mid',
      cornerStyle: 'auto',
      cornerSize: 0.01,
      cornerSides: 10,
      cornersOnly: false,
      cornerLength: 0.1,
      minAutoCornerAngle: Math.PI / 7,
      dash: [],
      linePrimitives: false,
      lineNum: 1,
      drawBorder: 'line',
      holeBorder: [[]],
      drawBorderBuffer: 0,
    };

    // Borders will always override old borders

    const getTris = (updateOptions: OBJ_Polyline) => {
      const defaultOptions = element.custom.options;
      const o = processOptions({}, defaultOptions, updateOptions);
      if (o.linePrimitives === false) {
        o.lineNum = 2;
      }
      element.custom.options = o;
      parsePoints(o, ['points', 'border', 'holeBorder', 'touchBorder']);

      // let touchBorderBuffer = 0;
      // if (typeof o.touchBorder === 'number') {
      //   touchBorderBuffer = o.touchBorder;
      // }
      let triangles;
      let drawBorder;
      let holeBorder;
      let drawBorderBuffer;
      if (o.cornersOnly) {
        [triangles, drawBorder, holeBorder] = makePolyLineCorners(
          o.points, o.width, o.close, o.cornerLength, o.widthIs, o.cornerStyle,
          o.cornerSize, o.cornerSides, o.minAutoCornerAngle, o.linePrimitives,
          o.lineNum,
        );
      } else {
        [triangles, drawBorder, drawBorderBuffer, holeBorder] = makePolyLine(
          o.points, o.width, o.close, o.widthIs, o.cornerStyle, o.cornerSize,
          o.cornerSides, o.minAutoCornerAngle, o.dash, o.linePrimitives,
          o.lineNum, o.border, o.drawBorderBuffer, o.hole, o.arrow,
        );
      }
      if (drawBorderBuffer == null) {
        drawBorderBuffer = drawBorder;
      }
      if (updateOptions.holeBorder == null) {
        o.holeBorder = holeBorder;
      }
      let drawType = 'triangles';
      if (o.linePrimitves) {
        drawType = 'lines';
      }
      element.custom.updateGeneric(joinObjects({}, o, {
        points: triangles,
        drawBorder,
        drawBorderBuffer,
        drawType,
      }));
    };

    element.custom.updatePoints = (updatedOptions) => {
      getTris(joinObjects({}, options, updatedOptions));
    };

    getTris(options);
    setupPulse(element, options);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a regular polygon.
   * @see {@link OBJ_Polygon} for options and examples.
   */
  polygon(...options: Array<OBJ_Polygon>) {
    const getBorder = (o) => {
      const defaultOptions = {
        radius: 1,
        sides: 4,
        direction: 1,
        rotation: 0,
        offset: new Point(0, 0),
        transform: new Transform('polygon').standard(),
        touchableLineOnly: false,
        border: 'drawBorder',
        touchBorder: 'border',
      };
      // let radiusMod = 0;
      const optionsToUse = processOptions(defaultOptions, ...options);

      if (optionsToUse.line != null) {
        optionsToUse.line = joinObjects({}, {
          width: this.defaultLineWidth,
          widthIs: 'mid',
        }, optionsToUse.line);
        if (optionsToUse.line.widthIs === 'inside') {
          optionsToUse.line.widthIs = 'positive';
        }
        if (optionsToUse.line.widthIs === 'outside') {
          optionsToUse.line.widthIs = 'negative';
        }
      }
      parsePoints(optionsToUse, ['offset']);
      if (optionsToUse.angleToDraw != null) {
        optionsToUse.sidesToDraw = Math.floor(
          optionsToUse.angleToDraw / (Math.PI * 2 / optionsToUse.sides),
        );
      }
      if (optionsToUse.sidesToDraw == null) {
        optionsToUse.sidesToDraw = optionsToUse.sides;
      }
      const points = getPolygonPoints(o);
      let { touchBorder } = o;
      let { border } = o;
      let drawBorderOffset = 0;
      let drawBorder;
      if (o.line != null) {
        const { width, widthIs } = o.line;
        const dir = o.direction;
        if (
          (dir === 1 && (widthIs === 'negative' || widthIs === 'outside'))
          || (dir === -1 && (widthIs === 'positive' || widthIs === 'inside'))
        ) {
          drawBorderOffset = width;
        } else if (widthIs === 'mid') {
          drawBorderOffset = width / 2;
        }
        if (drawBorderOffset > 0) {
          const cornerAngle = (o.sides - 2) * Math.PI / o.sides;
          drawBorderOffset /= Math.sin(cornerAngle / 2);
        }
      }
      if (drawBorderOffset === 0) {
        drawBorder = [points];
      } else {
        drawBorder = [getPolygonPoints(joinObjects(
          {}, o, { radius: o.radius + drawBorderOffset },
        ))];
      }

      let borderOffset = 0;
      if (typeof o.border === 'number') {
        borderOffset = o.border;
        border = [getPolygonPoints(joinObjects(
          {}, o, { radius: o.radius + drawBorderOffset + borderOffset },
        ))];
      }

      if (typeof o.touchBorder === 'number') {
        touchBorder = [getPolygonPoints(joinObjects(
          {}, o, { radius: o.radius + drawBorderOffset + borderOffset + o.touchBorder },
        ))];
      }

      // let { touchBorder } = o;
      // if (typeof o.touchBorder === 'number') {
      //   const cornerAngle = (o.sides - 2) * Math.PI / o.sides;
      //   const cornerWidth = o.touchBorder / Math.sin(cornerAngle / 2);
      //   touchBorder = [getPolygonPoints(
      //     joinObjects({}, o, {
      //       radius: cornerWidth + o.radius + borderOffset,
      //     }),
      //   )];
      // }
      return [points, drawBorder, border, touchBorder];
    };

    if (optionsToUse.line == null) {
      // const [outline, drawBorder, border, touchBorder] = getBorder(optionsToUse);
      // const tris = getTrisFillPolygon(
      //   optionsToUse.offset, outline, optionsToUse.sides,
      //   optionsToUse.sidesToDraw,
      // );

      element = this.generic(optionsToUse, {});
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedDrawBorder, updatedBorder, updatedTouchBorder] = getBorder(o);

        const updatedTris = getTrisFillPolygon(
          o.offset, updatedPoints,
          o.sides, o.sidesToDraw,
        );
        element.custom.updatePoints({
          points: updatedTris,
          copy: o.copy,
        });
        element.border = updatedBorder;
        element.drawBorder = updatedDrawBorder;
        element.touchBorder = updatedTouchBorder;
        if (o.holeBorder != null) {
          element.holeBorder = o.holeBorder;
        }
      };
    } else {
      const [outline, border, touchBorder] = getBorder(optionsToUse);

      element = this.polyline(optionsToUse, optionsToUse.line, {
        points: outline,
        close: optionsToUse.sides === optionsToUse.sidesToDraw, // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
        holeBorder: optionsToUse.holeBorder,
      });

      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedOutline, updatedBorder, updatedTouchBorder] = getBorder(o);
        element.custom.updatePoints(joinObjects({}, o, {
          points: updatedOutline,
          border: updatedBorder,
          touchBorder: updatedTouchBorder,
          holeBorder: o.holeBorder,
          dash: o.line.dash,
          width: o.line.width,
          widthIs: o.line.widthIs,
        }));
      };
    } // $FlowFixMe
    element.drawingObject.getPointCountForAngle = (angle: number) => {
      const sidesToDraw = Math.floor(
        tools.round(angle, 8) / tools.round(Math.PI * 2, 8) * optionsToUse.sides,
      );
      if (optionsToUse.line == null) {
        return sidesToDraw * 3;
      }
      if (optionsToUse.line && optionsToUse.line.linePrimitives) {
        return sidesToDraw * optionsToUse.line.lineNum * 2;
      }
      return sidesToDraw * 6;
    };
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a star.
   * @see {@link OBJ_Star} for options and examples.
   */
  star(...options: Array<OBJ_Star>) {
    const defaultOptions = {
      radius: 1,
      sides: 5,
      rotation: 0,
      offset: new Point(0, 0),
      transform: new Transform('star').standard(),
      touchableLineOnly: false,
      border: 'outline',
      touchBorder: 'border',
    };
    const optionsToUse = processOptions(defaultOptions, ...options);
    optionsToUse.offset = getPoint(optionsToUse.offset);
    if (optionsToUse.innerRadius == null) {
      optionsToUse.innerRadius = optionsToUse.radius / 3;
    }
    optionsToUse.rotation += Math.PI / 2;
    return this.polygon(optionsToUse);
  }

  /**
   * {@link FigureElementPrimitive} that draws a rectangle.
   * @see {@link OBJ_Rectangle} for options and examples.
   */
  rectangle(...options: Array<OBJ_Rectangle>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      xAlign: 'center',
      yAlign: 'middle',
      corner: {
        radius: 0,
        sides: 1,
      },
      transform: new Transform('rectangle').standard(),
      border: 'outline',
      touchBorder: 'border',
      holeBorder: 'none',
      offset: [0, 0],
    };
    const optionsToUse = processOptions(defaultOptions, ...options);
    optionsToUse.offset = getPoint(optionsToUse.offset);
    if (
      optionsToUse.line != null && optionsToUse.line.widthIs == null
    ) {
      optionsToUse.line.widthIs = 'mid';
    }
    if (optionsToUse.line != null) {
      if (optionsToUse.line.widthIs === 'outside') {
        optionsToUse.line.widthIs = 'negative';
      }
      if (optionsToUse.line.widthIs === 'inside') {
        optionsToUse.line.widthIs = 'positive';
      }
    }

    const [points, border, touchBorder] = getRectangleBorder(optionsToUse);

    let element;
    if (optionsToUse.line == null) {
      element = this.generic(optionsToUse, {
        points: rectangleBorderToTris(points), // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getRectangleBorder(o);
        element.drawingObject.change(
          rectangleBorderToTris(updatedPoints), // $FlowFixMe
          updatedBorder, // $FlowFixMe
          updatedTouchBorder,
          o.holeBorder,
        );
      };
    } else {
      element = this.polyline(optionsToUse, optionsToUse.line, {
        points, // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
        close: true,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getRectangleBorder(o);
        // const updatedBorder = getRectangleBorder(o);
        element.custom.updatePoints(joinObjects({}, o, {
          points: updatedPoints,
          border: updatedBorder,
          touchBorder: updatedTouchBorder,
          holeBorder: o.holeBorder,
          dash: o.line.dash,
          width: o.line.width,
          widthIs: o.line.widthIs,
        }));
      };
    }
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws an ellipse.
   * @see {@link OBJ_Ellipse} for options and examples.
   */
  ellipse(...options: Array<OBJ_Ellipse>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      xAlign: 'center',
      yAlign: 'middle',
      sides: 20,
      transform: new Transform('rectangle').standard(),
      border: 'outline',
      touchBorder: 'border',
      holeBorder: 'none',
    };
    const optionsToUse = processOptions(defaultOptions, ...options);

    if (
      optionsToUse.line != null && optionsToUse.line.widthIs == null
    ) {
      optionsToUse.line.widthIs = 'mid';
    }

    const [points, border, touchBorder] = getEllipseBorder(optionsToUse);
    let element;
    if (optionsToUse.line == null) {
      element = this.generic(optionsToUse, {
        points: ellipseBorderToTris(points), // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getEllipseBorder(o);
        element.drawingObject.change(
          ellipseBorderToTris(updatedPoints), // $FlowFixMe
          updatedBorder, // $FlowFixMe
          updatedTouchBorder,
          o.holeBorder,
        );
      };
    } else {
      element = this.polyline(optionsToUse, optionsToUse.line, {
        points, // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
        close: true,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getEllipseBorder(o);
        // const updatedBorder = getRectangleBorder(o);
        element.custom.updatePoints(joinObjects({}, o, {
          points: updatedPoints,
          border: updatedBorder,
          touchBorder: updatedTouchBorder,
          holeBorder: o.holeBorder,
          dash: o.line.dash,
          width: o.line.width,
          widthIs: o.line.widthIs,
        }));
      };
    }
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a triangle.
   * @see {@link OBJ_Triangle} for options and examples.
   */
  triangle(...options: Array<OBJ_Triangle>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      xAlign: 'centroid',
      yAlign: 'centroid',
      top: 'center',
      transform: new Transform('triangle').standard(),
      direction: 1,
      rotation: 0,
      border: 'outline',
      touchBorder: 'border',
      holeBorder: 'none',
    };
    const optionsToUse = processOptions(defaultOptions, ...options);
    // if (optionsToUse.points != null) {
    //   optionsToUse.points = getPoints(optionsToUse.points);
    // }

    if (
      optionsToUse.line != null && optionsToUse.line.widthIs == null
    ) {
      optionsToUse.line.widthIs = 'mid';
    }

    const [points, border, touchBorder] = getTriangle(optionsToUse);

    let element;
    if (optionsToUse.line == null) {
      element = this.generic(optionsToUse, { // $FlowFixMe
        points, border, touchBorder,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getTriangle(o);
        element.drawingObject.change( // $FlowFixMe
          updatedPoints, updatedBorder, updatedTouchBorder, o.holeBorder,
        );
      };
    } else {
      element = this.polyline(optionsToUse, optionsToUse.line, { // $FlowFixMe
        points,
        close: true, // $FlowFixMe
        border, // $FlowFixMe
        touchBorder,
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const [updatedPoints, updatedBorder, updatedTouchBorder] = getTriangle(o);

        element.custom.updatePoints(joinObjects({}, o, {
          points: updatedPoints,
          border: updatedBorder,
          touchBorder: updatedTouchBorder,
          holeBorder: o.holeBorder,
          dash: o.line.dash,
          width: o.line.width,
          widthIs: o.line.widthIs,
        }));
      };
    }
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a grid.
   * @see {@link OBJ_Grid} for options and examples.
   */
  grid(...optionsIn: Array<OBJ_Grid>) {
    const defaultOptions = {
      bounds: new Rect(-1, -1, 2, 2),
      transform: new Transform('grid').standard(),
      line: {
        linePrimitives: false,
        width: this.defaultLineWidth,
        lineNum: 2,
        dash: [],
      },
    };
    const options = processOptions(defaultOptions, ...optionsIn);
    parsePoints(options, []);
    options.bounds = getRect(options.bounds); // $FlowFixMe
    const getTris = points => makePolyLine(
      points,
      options.line.width,
      false,
      'mid',
      'auto', // cornerStyle doesn't matter
      0.1,    // cornerSize doesn't matter
      1,      // cornerSides,
      Math.PI / 7, // minAutoCornerAngle,
      options.line.dash,
      options.line.linePrimitives,
      options.line.lineNum,
      [[]],
      0,
    );

    // Prioritize Num over Step. Only define Num from Step if Num is undefined.
    const { bounds } = options;
    let {
      xStep, xNum, yStep, yNum,
    } = options;
    let { width } = options.line;
    if (options.line.linePrimitives && options.line.lineNum === 1) {
      width = 0;
    }
    const totWidth = bounds.width;
    const totHeight = bounds.height;
    if (xStep != null && xNum == null) {
      xNum = xStep === 0 ? 1 : 1 + Math.floor((totWidth + xStep * 0.1) / xStep);
    }
    if (yStep != null && yNum == null) {
      yNum = yStep === 0 ? 1 : 1 + Math.floor((totHeight + yStep * 0.1) / yStep);
    }

    if (xNum == null) {
      xNum = 2;
    }
    if (yNum == null) {
      yNum = 2;
    }

    xStep = xNum < 2 ? 0 : totWidth / (xNum - 1);
    yStep = yNum < 2 ? 0 : totHeight / (yNum - 1);

    const start = new Point(
      bounds.left,
      bounds.bottom,
    );
    const xLineStart = start.add(-width / 2, 0);
    const xLineStop = start.add(totWidth + width / 2, 0);
    const yLineStart = start.add(0, -width / 2);
    const yLineStop = start.add(0, totHeight + width / 2);

    let xTris = [];
    let yTris = [];
    if (xNum > 0) {
      const [yLine] = getTris([yLineStart, yLineStop]);
      yTris = copyPoints(yLine, [
        { along: 'x', num: xNum - 1, step: xStep },
      ]);
    }

    if (yNum > 0) {
      const [xLine] = getTris([xLineStart, xLineStop]);
      xTris = copyPoints(xLine, [
        { along: 'y', num: yNum - 1, step: yStep },
      ]);
    }

    const element = this.generic(options, {
      drawType: options.line.linePrimitives ? 'lines' : 'triangles', // $FlowFixMe
      points: [...xTris, ...yTris],
      border: [[
        start.add(-width / 2, -width / 2),
        start.add(totWidth + width / 2, -width / 2),
        start.add(totWidth + width / 2, totHeight + width / 2),
        start.add(-width / 2, totHeight + width / 2),
      ]],
    });
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Line} for options and examples.
   */
  line(...options: OBJ_Line) {
    const defaultOptions = {
      p1: [0, 0],
      angle: 0,
      length: 1,
      width: this.defaultLineWidth,
      widthIs: 'mid',
      dash: [],
      transform: new Transform('line').standard(),
      border: 'outline',
      touchBorder: 'border',
    };  // $FlowFixMe
    const optionsToUse = processOptions(defaultOptions, ...options);
    const [points, border, touchBorder] = getLine(optionsToUse);

    const element = this.polyline(optionsToUse, {
      points, // $FlowFixMe
      border,
      touchBorder,
    });

    element.custom.setupLine = (p, o) => {
      if (o.dash.length > 1) {
        const maxLength = p[0].distance(p[1]);
        const dashCumLength = [];
        let cumLength = 0;
        if (o.dash) {
          while (cumLength < maxLength) {
            for (let i = 0; i < o.dash.length && cumLength < maxLength; i += 1) {
              let length = o.dash[i];
              if (length + cumLength > maxLength) {
                length = maxLength - cumLength;
              }
              cumLength += length;
              dashCumLength.push(cumLength);
            }
          }
          element.custom.dashCumLength = dashCumLength;
          element.custom.maxLength = maxLength;
        }
      }
    };
    element.custom.setupLine(points, optionsToUse);
    element.custom.update = (updateOptions) => {
      const o = joinObjects({}, optionsToUse, updateOptions);
      const [updatedPoints, updatedBorder, updatedTouchBorder] = getLine(o);
      element.custom.setupLine(updatedPoints, o);
      element.custom.updatePoints(joinObjects({}, o, {
        points: updatedPoints,
        border: updatedBorder,
        touchBorder: updatedTouchBorder,
        holeBorder: o.holeBorder,
      }));
    };

    // $FlowFixMe
    element.drawingObject.getPointCountForLength = (drawLength: number = this.maxLength) => {
      if (drawLength >= element.custom.maxLength) { // $FlowFixMe
        return element.drawingObject.numPoints;
      }
      if (drawLength < element.custom.dashCumLength[0]) {
        return 0;
      }
      for (let i = 0; i < element.custom.dashCumLength.length; i += 1) {
        const cumLength = element.custom.dashCumLength[i];
        if (cumLength > drawLength) {
          return (Math.floor((i - 1) / 2) + 1) * 6;
        }
      } // $FlowFixMe
      return element.drawingObject.numPoints;
    };

    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Arrow} for options and examples.
   */
  arrow(...options: Array<OBJ_Arrow>) {
    const defaultOptions = joinObjects(
      {},
      defaultArrowOptions(joinObjects({}, ...options)),
      {
        head: 'triangle',
        sides: 20,
        radius: 0.5,
        rotation: 0,
        angle: 0,
        transform: new Transform('line').standard(),
        border: 'outline',
        touchBorder: 'border',
        align: 'tip',
        tail: false,
        drawPosition: new Point(0, 0),
      },
    );

    const optionsToUse = processOptions(defaultOptions, ...options);

    if (optionsToUse.drawPosition != null) {
      optionsToUse.drawPosition = getPoint(optionsToUse.drawPosition);
    }
    const [points, border] = getArrow(optionsToUse);
    let borderToUse = optionsToUse.border;

    if (optionsToUse.border === 'outline') {
      borderToUse = [border];
    }
    const element = this.generic({}, optionsToUse, {
      points, // $FlowFixMe
      border: borderToUse,
    });

    element.custom.update = (updateOptions) => {
      const o = joinObjects({}, optionsToUse, updateOptions);
      if (o.drawPosition != null) {
        o.drawPosition = getPoint(o.drawPosition);
      }
      const [updatedPoints, updatedBorder, updatedTouchBorder] = getArrow(o);
      element.drawingObject.change( // $FlowFixMe
        updatedPoints, updatedBorder, updatedTouchBorder, o.holeBorder,
      );
    };
    return element;
  }

  // polygonSweep(...optionsIn: Array<{
  //   radius?: number,
  //   rotation?: number,
  //   sides?: number,
  //   offset?: TypeParsablePoint,
  //   width?: number,
  //   direction?: -1 | 1,
  //   fill?: boolean,
  //   color?: TypeColor,
  //   texture?: OBJ_Texture,
  //   position?: TypeParsablePoint,
  //   transform?: Transform,
  //   pulse?: number,
  // }>) {
  //   const defaultOptions = {
  //     sides: 4,
  //     fill: false,
  //     transform: new Transform('polygonSweep').standard(),
  //     line: {
  //       linePrimitives: false,
  //       lineNum: 2,
  //     },
  //   };
  //   const forceOptions = {
  //     line: {
  //       cornerStyle: 'auto',
  //       cornersOnly: false,
  //     },
  //   };
  //   const options = processOptions(defaultOptions, ...optionsIn, forceOptions);
  //   const element = this.polygon(options);
  //   // $FlowFixMe
  //   element.drawingObject.getPointCountForAngle = (angle: number) => {
  //     const sidesToDraw = Math.floor(
  //       tools.round(angle, 8) / tools.round(Math.PI * 2, 8) * options.sides,
  //     );
  //     if (options.fill) {
  //       return sidesToDraw + 2;
  //     }
  //     if (options.line && options.line.linePrimitives) {
  //       return sidesToDraw * options.line.lineNum * 2;
  //     }
  //     return sidesToDraw * 6;
  //   };
  //   return element;
  // }

  // // deprecated
  // fan(...optionsIn: Array<{
  //   points?: Array<Point>,
  //   color?: TypeColor,
  //   transform?: Transform,
  //   position?: Point,
  //   pulse?: number,
  //   mods?: {},
  // }>) {
  //   const defaultOptions = {
  //     points: [],
  //     color: this.defaultColor,
  //     transform: new Transform('fan').standard(),
  //     position: null,
  //   };
  //   const options = Object.assign({}, defaultOptions, ...optionsIn);

  //   if (options.position != null) {
  //     const p = getPoint(options.position);
  //     options.transform.updateTranslation(p);
  //   }

  //   const element = Fan(
  //     this.webgl,
  //     options.points.map(p => getPoint(p)),
  //     options.color,
  //     options.transform,
  //     this.limits,
  //   );

  //   // if (options.pulse != null) {
  //   //   if (typeof element.pulseDefault !== 'function') {
  //   //     element.pulseDefault.scale = options.pulse;
  //   //   }
  //   // }
  //   setupPulse(element, options);

  //   if (options.mods != null && options.mods !== {}) {
  //     element.setProperties(options.mods);
  //   }

  //   return element;
  // }

  textGL(options: Object) {
    return Text(
      this.webgl,
      this.limits,
      options,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  parseTextOptions(...optionsIn: Object) {
    const defaultOptions = {
      text: '',
      font: {
        family: this.defaultFont.family,
        style: this.defaultFont.style,
        size: this.defaultFont.size,
        weight: this.defaultFont.weight,
      },
      xAlign: 'left',
      yAlign: 'baseline',
      border: 'text',
      touchBorder: 'text',
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    // Make default color
    if (options.color == null && options.font.color != null) {
      options.color = options.font.color;
    }
    if (options.font.color == null && options.color != null) {
      options.font.color = options.color;
    }
    if (options.color == null) {
      options.color = this.defaultFont.color;
    }

    // Define standard transform if no transform was input
    if (options.transform == null) {
      options.transform = new Transform('text').standard();
    } else {
      options.transform = getTransform(options.transform);
    }

    // Override transform if position is defined
    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    if (options.text != null && !Array.isArray(options.text)) {
      options.text = [options.text];
    }
    if (options.line != null && !Array.isArray(options.line)) {
      options.line = [options.line];
    }
    if (options.lines != null && !Array.isArray(options.lines)) {
      options.lines = [options.lines];
    }

    if (options.touchBorder != null && Array.isArray(options.touchBorder)) {
      parsePoints(options, ['touchBorder']);
    }

    if (options.border != null && Array.isArray(options.border)) {
      parsePoints(options, ['border']);
    }

    return options;
  }

  createPrimitive(
    drawingObject: DrawingObject, options: Object,
  ) {
    const element = new FigureElementPrimitive(
      drawingObject,
      options.transform,
      options.color,
      this.limits,
    );

    setupPulse(element, options);
    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line of text.
   * @see {@link OBJ_TextLine} for options and examples.
   */
  textLine(...optionsIn: Array<OBJ_TextLine>) {
    const options = this.parseTextOptions({ border: 'rect', touchBorder: 'rect' }, ...optionsIn);
    const to = new TextLineObject(this.draw2D);
    to.loadText(options);
    return this.createPrimitive(to, options);
  }

  /**
   * {@link FigureElementPrimitive} that draws text lines.
   * @see {@link OBJ_TextLines} for options and examples.
   */
  textLines(...optionsIn: Array<OBJ_TextLines | string>) {
    let optionsToUse = optionsIn;
    if (optionsIn.length === 1 && typeof optionsIn[0] === 'string') {
      optionsToUse = [{ text: [optionsIn[0]] }];
    }
    const options = this.parseTextOptions({ border: 'rect', touchBorder: 'rect' }, ...optionsToUse);
    if (options.justify == null) {
      options.justify = 'left';
    }
    if (options.lineSpace == null) {
      options.lineSpace = options.font.size * 1.2;
    }
    // console.log('qwerty')
    const to = new TextLinesObject(this.draw2D);
    to.loadText(options);
    return this.createPrimitive(to, options);
  }

  /**
   * {@link FigureElementPrimitive} that draws text.
   * @see {@link OBJ_Text} for options and examples.
   */
  text(...optionsIn: Array<OBJ_Text>) {
    const options = this.parseTextOptions(...optionsIn);
    const to = new TextObject(
      this.draw2D,
    );
    to.loadText(options);
    // console.log(to.text[0].font)
    return this.createPrimitive(to, options);
  }

  // arrowLegacy(...optionsIn: Array<{
  //   width?: number;
  //   legWidth?: number;
  //   height?: number;
  //   legHeight?: number;
  //   color?: TypeColor;
  //   transform?: Transform;
  //   position?: Point;
  //   tip?: Point;
  //   rotation?: number;
  //   pulse?: number,
  //   mods?: {},
  // }>) {
  //   const defaultOptions = {
  //     width: 0.5,
  //     legWidth: 0,
  //     height: 0.5,
  //     legHeight: 0,
  //     color: this.defaultColor,
  //     transform: new Transform('arrow').standard(),
  //     tip: new Point(0, 0),
  //     rotation: 0,
  //   };
  //   const options = Object.assign({}, defaultOptions, ...optionsIn);

  //   if (options.position != null) {
  //     const p = getPoint(options.position);
  //     options.transform.updateTranslation(p);
  //   }
  //   const element = new Arrow(
  //     this.webgl,
  //     options.width,
  //     options.legWidth,
  //     options.height,
  //     options.legHeight,
  //     getPoint(options.tip),
  //     options.rotation,
  //     options.color,
  //     options.transform,
  //     this.limits,
  //   );

  //   // if (options.pulse != null) {
  //   //   if (typeof element.pulseDefault !== 'function') {
  //   //     element.pulseDefault.scale = options.pulse;
  //   //   }
  //   // }
  //   setupPulse(element, options);

  //   if (options.mods != null && options.mods !== {}) {
  //     element.setProperties(options.mods);
  //   }

  //   return element;
  // }


  // arrowLegacy(
  //   width: number = 1,
  //   legWidth: number = 0.5,
  //   height: number = 1,
  //   legHeight: number = 0.5,
  //   color: TypeColor,
  //   transform: Transform | Point = new Transform(),
  //   tip: Point = new Point(0, 0),
  //   rotation: number = 0,
  // ) {
  //   return Arrow(
  //     this.webgl, width, legWidth, height, legHeight,
  //     tip, rotation, color, transform, this.limits,
  //   );
  // }

  // textLegacy(
  //   textInput: string,
  //   location: Point,
  //   color: TypeColor,
  //   fontInput: FigureFont | null = null,
  // ) {
  //   let font = new FigureFont(
  //     'Times New Roman',
  //     'italic',
  //     0.2,
  //     '200',
  //     'center',
  //     'middle',
  //     color,
  //   );
  //   if (fontInput !== null) {
  //     font = fontInput;
  //   }
  //   const dT = new FigureText(new Point(0, 0), textInput, font);
  //   const to = new TextObject(this.draw2D, [dT]);
  //   return new FigureElementPrimitive(
  //     to,
  //     new Transform().scale(1, 1).translate(location.x, location.y),
  //     color,
  //     this.limits,
  //   );
  // }

  html(optionsIn: {
    element: HTMLElement | Array<HTMLElement>,
    classes?: string,
    position?: TypeParsablePoint,
    xAlign?: 'left' | 'right' | 'center',
    yAlign?: 'top' | 'bottom' | 'middle',
    wrap?: boolean,
    id?: string,
  }) {
    const defaultOptions = {
      classes: '',
      position: [0, 0],
      xAlign: 'center',
      yAlign: 'middle',
      wrap: true,
      id: `id__temp_${Math.round(Math.random() * 10000)}`,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.element = optionsIn.element;
    let element;
    let parent;
    if (options.wrap || Array.isArray(options.element)) {
      element = document.createElement('div');
      element.setAttribute('id', options.id);
      if (Array.isArray(options.element)) {
        options.element.forEach(e => element.appendChild(e));
      } else {
        element.appendChild(options.element);
      }
      this.htmlCanvas.appendChild(element);
      parent = this.htmlCanvas;
    } else {
      element = options.element;
      const id = element.getAttribute('id');
      if (id === '') {
        element.setAttribute('id', options.id);
      } else {
        options.id = id;
      }
      parent = element.parentElement;
    }
    if (parent == null) {
      parent = this.htmlCanvas;
    }

    const hT = new HTMLObject(  // $FlowFixMe
      parent,
      options.id,
      new Point(0, 0),
      options.yAlign,
      options.xAlign,
    );
    const p = getPoint(options.position);
    const figureElement = new FigureElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(p.x, p.y),
      [1, 1, 1, 1],
      this.limits,
    );
    return figureElement;
  }

  htmlElement(
    elementToAdd: HTMLElement | Array<HTMLElement>,
    id: string = `id__temp_${Math.round(Math.random() * 10000)}`,
    classes: string = '',
    location: Point = new Point(0, 0),
    yAlign: 'top' | 'bottom' | 'middle' = 'middle',
    xAlign: 'left' | 'right' | 'center' = 'left',
  ) {
    const element = document.createElement('div');
    if (classes && element) {
      const classArray = classes.split(' ');
      classArray.forEach(c => element.classList.add(c.trim()));
    }
    if (Array.isArray(elementToAdd)) {
      elementToAdd.forEach(e => element.appendChild(e));
    } else {
      element.appendChild(elementToAdd);
    }
    element.style.position = 'absolute';
    element.setAttribute('id', id);
    this.htmlCanvas.appendChild(element);
    const hT = new HTMLObject(this.htmlCanvas, id, new Point(0, 0), yAlign, xAlign);
    const figureElement = new FigureElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(location.x, location.y),
      [1, 1, 1, 1],
      this.limits,
    );
    // console.log('html', figureElement.transform.mat, location)
    // figureElement.setFirstTransform();
    return figureElement;
  }

  // htmlText(
  //   textInput: string,
  //   id: string = generateUniqueId('id__html_text_'),
  //   classes: string = '',
  //   location: Point = new Point(0, 0),
  //   yAlign: 'top' | 'bottom' | 'middle' = 'middle',
  //   xAlign: 'left' | 'right' | 'center' = 'left',
  // ) {
  //   // const inside = document.createTextNode(textInput);
  //   const inside = document.createElement('div');
  //   inside.innerHTML = textInput;
  //   return this.htmlElement(inside, id, classes, location, yAlign, xAlign);
  // }

  htmlImage(...optionsIn: Array<{
    id?: string,
    classes?: string,
    position?: Point,
    yAlign?: 'top' | 'bottom' | 'middle',
    xAlign?: 'left' | 'right' | 'center',
    src?: string,
    color?: TypeColor,
    pulse?: number,
  }>) {
    const defaultOptions = {
      id: generateUniqueId('id__html_image_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      src: '',
      // color: this.defaultColor,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const image = document.createElement('img');
    image.src = options.src;

    // setHTML(inside, options.text, options.modifiers);
    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(image, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    // if (options.pulse != null) {
    //   if (typeof element.pulseDefault !== 'function') {
    //     element.pulseDefault.scale = options.pulse;
    //   }
    // }
    setupPulse(element, options);
    return element;
  }

  htmlText(...optionsIn: Array<{
    textInput?: string,
    id?: string,
    classes?: string,
    position?: Point,
    yAlign?: 'top' | 'bottom' | 'middle',
    xAlign?: 'left' | 'right' | 'center',
    modifiers: Object;
    color?: TypeColor,
    pulse?: number,
  }>) {
    const defaultOptions = {
      text: '',
      id: generateUniqueId('id__html_text_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      // color: this.defaultColor,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const inside = document.createElement('div');
    // const htmlText = toHTML(options.textInput, '', '', options.color);
    // console.log(options.textInput, htmlText)
    setHTML(inside, options.text, options.modifiers);
    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(inside, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
    setupPulse(element, options);
    return element;
  }

  // lines(
  //   linePairs: Array<Array<Point>>,
  //   numLinesThick: number = 1,
  //   color: TypeColor,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   return Lines(this.webgl, linePairs, numLinesThick, color, transform, this.limits);
  // }

  // gridLegacy(...optionsIn: Array<TypeGridOptions>) {
  //   const defaultOptions = {
  //     bounds: new Rect(-1, -1, 2, 2),
  //     xStep: 0.1,
  //     yStep: 0.1,
  //     xOffset: 0,
  //     yOffset: 0,
  //     numLinesThick: 1,
  //     color: this.defaultColor,
  //     position: null,
  //     transform: new Transform('grid').standard(),
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   if (options.position != null) {
  //     const point = getPoint(options.position);
  //     options.transform.updateTranslation(point);
  //   }
  //   const linePairs = [];
  //   // const xLimit = tools.roundNum(bounds.righ + xStep);
  //   const {
  //     bounds, xStep, xOffset, yStep, yOffset, color, numLinesThick, transform,
  //   } = options;
  //   if (options.xStep !== 0) {
  //     for (let x = bounds.left + xOffset; tools.roundNum(x, 8) <= bounds.right; x += xStep) {
  //       linePairs.push([new Point(x, bounds.top), new Point(x, bounds.bottom)]);
  //     }
  //   }
  //   if (yStep !== 0) {
  //     for (let y = bounds.bottom + yOffset; tools.roundNum(y, 8) <= bounds.top; y += yStep) {
  //       linePairs.push([new Point(bounds.left, y), new Point(bounds.right, y)]);
  //     }
  //   }
  //   const element = this.lines(linePairs, numLinesThick, color, transform);
  //   if (options.pulse != null && typeof element.pulseDefault !== 'function') {
  //     element.pulseDefault.scale = options.pulse;
  //   }
  //   return element;
  // }

  // horizontalLine(
  //   start: Point,
  //   length: number,
  //   width: number,
  //   rotation: number,
  //   color: TypeColor,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   return HorizontalLine(
  //     this.webgl, start, length, width,
  //     rotation, color, transform, this.limits,
  //   );
  // }

  // dashedLine(...optionsIn: Array<{
  //   start?: Point,
  //   length?: number,
  //   width?: number,
  //   rotation?: number,
  //   dashStyle?: Array<number>,
  //   color?: TypeColor,
  //   transform?: Transform,
  //   position?: Point,
  //   pulse?: number,
  // }>) {
  //   const defaultOptions = {
  //     start: [0, 0],
  //     length: 1,
  //     width: 0.01,
  //     rotation: 0,
  //     dashStyle: [0.1, 0.1],
  //     transform: new Transform('dashedLine').scale(1, 1).rotate(0).translate(0, 0),
  //     position: null,
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   if (options.position != null) {
  //     options.transform.updateTranslation(getPoint(options.position));
  //   }
  //   const element = DashedLine(
  //     this.webgl, getPoint(options.start), options.length, options.width,
  //     options.rotation, options.dashStyle, options.color,
  //     options.transform, this.limits,
  //   );
  //   setupPulse(element, options);
  //   return element;
  // }

  // dashedLine(
  //   start: Point,
  //   length: number,
  //   width: number,
  //   rotation: number,
  //   dashStyle: Array<number>,
  //   color: TypeColor,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   return DashedLine(
  //     this.webgl, start, length, width,
  //     rotation, dashStyle, color, transform, this.limits,
  //   );
  // }

  // box(...optionsIn: Array<{
  //   width?: number,
  //   height?: number,
  //   fill?: boolean,
  //   lineWidth?: number,
  //   colors?: Array<number>,
  //   transform?: Transform,
  //   position?: TypeParsablePoint,
  //   pulse?: number,
  // }>) {
  //   const defaultOptions = {
  //     width: 1,
  //     height: 1,
  //     fill: false,
  //     lineWidth: 0.01,
  //     color: this.defaultColor,
  //     transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
  //     position: null,
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   if (options.position != null) {
  //     options.transform.updateTranslation(getPoint(options.position));
  //   }
  //   if (typeof options.reference !== 'string') {
  //     options.reference = getPoint(options.reference);
  //   }
  //   const element = Box(
  //     this.webgl, options.width, options.height, options.lineWidth,
  //     options.fill, options.color, options.transform, this.limits,
  //   );
  //   setupPulse(element, options);

  //   return element;
  // }

  // radialLines(...optionsIn: Array<{
  //   innerRadius?: number,
  //   outerRadius?: number,
  //   width?: number,
  //   dAngle?: number,
  //   angle?: number,
  //   color?: TypeColor,
  //   transform?: Transform,
  //   position?: Point,
  //   pulse?: number,
  // }>) {
  //   const defaultOptions = {
  //     innerRadius: 0,
  //     outerRadius: 1,
  //     width: 0.05,
  //     dAngle: Math.PI / 4,
  //     angle: Math.PI * 2,
  //     transform: new Transform().standard(),
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   if (options.position != null) {
  //     options.transform.updateTranslation(getPoint(options.position));
  //   }
  //   const element = RadialLines(
  //     this.webgl, options.innerRadius, options.outerRadius,
  //     options.width, options.dAngle, options.angle, options.color,
  //     options.transform, this.limits,
  //   );

  //   setupPulse(element, options);


  //   return element;
  // }

  // repeatPatternVertex(...optionsIn: Array<TypeRepeatPatternVertex>) {
  //   const defaultOptions = {
  //     element: null,
  //     xNum: 2,
  //     yNum: 2,
  //     xStep: 1,
  //     yStep: 1,
  //     transform: new Transform('repeatPattern').standard(),
  //   };
  //   const options = joinObjects({}, defaultOptions, ...optionsIn);
  //   if (options.position != null) {
  //     options.transform.updateTranslation(getPoint(options.position));
  //   }
  //   const {
  //     element, transform, xNum, yNum, xStep, yStep,
  //   } = options;
  //   if (element == null) {
  //     return this.collection();
  //   }
  //   const copy = element._dup();
  //   const { drawingObject } = element;
  //   // console.log(element.drawingObject.points)
  //   if (drawingObject instanceof VertexObject) {
  //     copy.transform = transform._dup();
  //     const newPoints = [];
  //     const { points } = drawingObject;
  //     for (let x = 0; x < xNum; x += 1) {
  //       for (let y = 0; y < yNum; y += 1) {
  //         for (let p = 0; p < points.length; p += 2) {
  //           newPoints.push(new Point(
  //             points[p] + x * xStep,
  //             points[p + 1] + y * yStep,
  //           ));
  //           // console.log(points[p], points[p+1], newPoints.slice(-1))
  //         }
  //       }
  //     }
  //     // console.log(newPoints)
  //     copy.drawingObject.changeVertices(newPoints);
  //   }
  //   if (options.pulse != null && typeof element.pulseDefault !== 'function') {
  //     copy.pulseDefault.scale = options.pulse;
  //   }
  //   return copy;
  // }

  // repeatPattern(
  //   element: FigureElementPrimitive,
  //   xNum: number,
  //   yNum: number,
  //   xStep: number,
  //   yStep: number,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   let group;
  //   if (transform instanceof Transform) {
  //     group = this.collection({ transform });
  //   } else {
  //     group = this.collection({ transform: new Transform().translate(transform) });
  //   }
  //   let t = element.transform.t();
  //   let transformToUse = element.transform._dup();
  //   if (t === null) {
  //     t = new Point(0, 0);
  //     transformToUse = transformToUse.translate(0, 0);
  //   }
  //   if (t) {
  //     for (let x = 0; x < xNum; x += 1) {
  //       for (let y = 0; y < yNum; y += 1) {
  //         const copy = element._dup();
  //         copy.transform = transformToUse._dup();
  //         copy.transform.updateTranslation(t.x + xStep * x, t.y + yStep * y);
  //         group.add(`xy${x}${y}`, copy);
  //       }
  //     }
  //   }
  //   return group;
  // }

  // eslint-disable-next-line class-methods-use-this
  // repeatPatternVertexLegacy(
  //   element: FigureElementPrimitive,
  //   xNum: number,
  //   yNum: number,
  //   xStep: number,
  //   yStep: number,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   const copy = element._dup();
  //   const { drawingObject } = element;
  //   // console.log(element.drawingObject.points)
  //   if (drawingObject instanceof VertexObject) {
  //     copy.transform = transform._dup();
  //     const newPoints = [];
  //     const { points } = drawingObject;
  //     for (let x = 0; x < xNum; x += 1) {
  //       for (let y = 0; y < yNum; y += 1) {
  //         for (let p = 0; p < points.length; p += 2) {
  //           newPoints.push(new Point(
  //             points[p] + x * xStep,
  //             points[p + 1] + y * yStep,
  //           ));
  //           // console.log(points[p], points[p+1], newPoints.slice(-1))
  //         }
  //       }
  //     }
  //     // console.log(newPoints)
  //     copy.drawingObject.changeVertices(newPoints);
  //   }
  //   return copy;
  // }

  //   axes(...optionsIn: Array<{
  //     width?: number,
  //     height?: number,
  //     limits?: Rect,
  //     yAxisLocation?: number,
  //     xAxisLocation?: number,
  //     stepX?: number,
  //     stepY?: number,
  //     fontSize?: number,
  //     showGrid?: boolean,
  //     color?: TypeColor,
  //     fontColor?: Array<number>,
  //     gridColor?: Array<number>,
  //     location?: Transform | Point,
  //     decimalPlaces?: number,
  //     lineWidth?: number,
  //     pulse?: number,
  //   }>) {
  //     const defaultOptions = {
  //       width: 1,
  //       height: 1,
  //       limits: new Rect(-1, -1, 2, 2),
  //       yAxisLocation: 0,
  //       xAxisLocation: 0,
  //       stepX: 0.1,
  //       stepY: 0.1,
  //       fontSize: 0.13,
  //       showGrid: true,
  //       color: this.defaultColor,
  //       location: new Transform(),
  //       decimalPlaces: 1,
  //       lineWidth: 0.01,
  //     };
  //     const options = joinObjects({}, defaultOptions, ...optionsIn);

  //     if (options.fontColor == null) {
  //       options.fontColor = options.color.slice();
  //     }
  //     if (options.gridColor == null) {
  //       options.gridColor = options.color.slice();
  //     }

  //     const {
  //       width, lineWidth, limits, color, stepX, decimalPlaces,
  //       yAxisLocation, xAxisLocation, fontSize, height, stepY,
  //       location, showGrid, gridColor, fontColor,
  //     } = options;

  //     const xProps = new AxisProperties('x', 0);

  //     xProps.minorTicks.mode = 'off';
  //     xProps.minorGrid.mode = 'off';
  //     xProps.majorGrid.mode = 'off';

  //     xProps.length = width;
  //     xProps.width = lineWidth;
  //     xProps.limits = { min: limits.left, max: limits.right };
  //     xProps.color = color.slice();
  //     xProps.title = '';

  //     xProps.majorTicks.start = limits.left;
  //     xProps.majorTicks.step = stepX;
  //     xProps.majorTicks.length = lineWidth * 5;
  //     xProps.majorTicks.offset = -xProps.majorTicks.length / 2;
  //     xProps.majorTicks.width = lineWidth * 2;
  //     xProps.majorTicks.labelMode = 'off';
  //     xProps.majorTicks.color = color.slice();
  //     xProps.majorTicks.labels = tools.range(
  //       xProps.limits.min,
  //       xProps.limits.max,
  //       stepX,
  //     ).map(v => v.toFixed(decimalPlaces)).map((v) => {
  //       if (v === yAxisLocation.toString() && yAxisLocation === xAxisLocation) {
  //         return `${v}     `;
  //       }
  //       return v;
  //     });

  //     // xProps.majorTicks.labels[xProps.majorTicks.labels / 2] = '   0';
  //     xProps.majorTicks.labelOffset = new Point(
  //       0,
  //       xProps.majorTicks.offset - fontSize * 0.1,
  //     );
  //     xProps.majorTicks.labelsHAlign = 'center';
  //     xProps.majorTicks.labelsVAlign = 'top';
  //     xProps.majorTicks.fontColor = fontColor.slice();
  //     xProps.majorTicks.fontSize = fontSize;
  //     xProps.majorTicks.fontWeight = '400';

  //     const xAxis = new Axis(
  //       this.webgl, this.draw2D, xProps,
  //       new Transform().scale(1, 1).rotate(0)
  //         .translate(0, xAxisLocation - limits.bottom * height / 2),
  //       this.limits,
  //     );

  //     const yProps = new AxisProperties('x', 0);
  //     yProps.minorTicks.mode = 'off';
  //     yProps.minorGrid.mode = 'off';
  //     yProps.majorGrid.mode = 'off';

  //     yProps.length = height;
  //     yProps.width = xProps.width;
  //     yProps.limits = { min: limits.bottom, max: limits.top };
  //     yProps.color = xProps.color;
  //     yProps.title = '';
  //     yProps.rotation = Math.PI / 2;

  //     yProps.majorTicks.step = stepY;
  //     yProps.majorTicks.start = limits.bottom;
  //     yProps.majorTicks.length = xProps.majorTicks.length;
  //     yProps.majorTicks.offset = -yProps.majorTicks.length / 2;
  //     yProps.majorTicks.width = xProps.majorTicks.width;
  //     yProps.majorTicks.labelMode = 'off';
  //     yProps.majorTicks.color = color.slice();
  //     yProps.majorTicks.labels = tools.range(
  //       yProps.limits.min,
  //       yProps.limits.max,
  //       stepY,
  //     ).map(v => v.toFixed(decimalPlaces)).map((v) => {
  //       if (v === xAxisLocation.toString() && yAxisLocation === xAxisLocation) {
  //         return '';
  //       }
  //       return v;
  //     });

  //     // yProps.majorTicks.labels[3] = '';
  //     yProps.majorTicks.labelOffset = new Point(
  //       yProps.majorTicks.offset - fontSize * 0.2,
  //       0,
  //     );
  //     yProps.majorTicks.labelsHAlign = 'right';
  //     yProps.majorTicks.labelsVAlign = 'middle';
  //     yProps.majorTicks.fontColor = xProps.majorTicks.fontColor;
  //     yProps.majorTicks.fontSize = fontSize;
  //     yProps.majorTicks.fontWeight = xProps.majorTicks.fontWeight;

  //     const yAxis = new Axis(
  //       this.webgl, this.draw2D, yProps,
  //       new Transform().scale(1, 1).rotate(0)
  //         .translate(yAxisLocation - limits.left * width / 2, 0),
  //       this.limits,
  //     );

  //     let transform = new Transform();
  //     if (location instanceof Point) {
  //       transform = transform.translate(location.x, location.y);
  //     } else {
  //       transform = location._dup();
  //     }
  //     const xy = this.collection(transform);
  //     if (showGrid) {
  //       const gridLines = this.grid({
  //         bounds: new Rect(0, 0, width, height),
  //         xStep: tools.roundNum(stepX * width / limits.width, 8),
  //         yStep: tools.roundNum(stepY * height / limits.height, 8),
  //         numThickLines: 1,
  //         // linePrimitives: true,
  //         // lineNum: 2,
  //         width: options.lineWidth * 0.6,
  //         color: gridColor,
  //         transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
  //       });
  //       xy.add('grid', gridLines);
  //     }
  //     xy.add('y', yAxis);
  //     xy.add('x', xAxis);
  //     if (
  //       options.pulse != null
  //       && typeof xy.pulseDefault !== 'function'
  //       && typeof xy.pulseDefault !== 'string'
  //     ) {
  //       xy.pulseDefault.scale = options.pulse;
  //     }
  //     return xy;
  //   }

  //   parallelMarks(...optionsIn: Array<{
  //     num?: number,
  //     width?: number,
  //     length?: number,
  //     angle?: number,
  //     step?: number,
  //     rotation?: number,
  //     color?: TypeColor,
  //     pulse?: number,
  //     transform?: Transform,
  //     position?: Point,
  //   }>) {
  //     const defaultOptions = {
  //       width: 0.01,
  //       num: 1,
  //       length: 0.1,
  //       angle: Math.PI / 4,
  //       step: 0.04,
  //       rotation: 0,
  //       color: this.defaultColor,
  //       transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
  //       position: null,
  //     };
  //     const options = joinObjects({}, defaultOptions, ...optionsIn);
  //     if (options.position != null) {
  //       options.transform.updateTranslation(getPoint(options.position));
  //     }

  //     const x = options.length * Math.cos(options.angle);
  //     const y = options.length * Math.sin(options.angle);
  //     const wx = Math.abs(options.width * Math.cos(options.angle + Math.PI / 2));
  //     const wy = options.width * Math.sin(options.angle + Math.PI / 2);
  //     const single = [
  //       new Point(0, 0),
  //       new Point(0 - x, 0 - y),
  //       new Point(-x - wx, -y + wy),
  //       new Point(-Math.abs(options.width / Math.cos(options.angle + Math.PI / 2)), 0),
  //       new Point(-x - wx, y - wy),
  //       new Point(0 - x, 0 + y),
  //     ];

  //     const collection = this.collection(
  //       options.transform,
  //     );
  //     collection.setColor(options.color);
  //     if (
  //       options.pulse != null
  //       && typeof collection.pulseDefault !== 'function'
  //       && typeof collection.pulseDefault !== 'string'
  //     ) {
  //       collection.pulseDefault.scale = options.pulse;
  //     }

  //     const start = -((options.num - 1) / 2) * options.step;
  //     for (let i = 0; i < options.num; i += 1) {
  //       const points = single.map(
  //         p => (new Point(p.x + start + i * options.step, p.y)).rotate(options.rotation),
  //       );
  //       collection.add(`${i}`, this.fan({
  //         points,
  //         color: options.color,
  //       }));
  //     }
  //     return collection;
  //   }

  //   marks(...optionsIn: Array<{
  //     num?: number,
  //     width?: number,
  //     length?: number,
  //     angle?: number,
  //     step?: number,
  //     rotation?: number,
  //     color?: TypeColor,
  //     pulse?: number,
  //     transform?: Transform,
  //     position?: Point,
  //   }>) {
  //     const defaultOptions = {
  //       width: 0.01,
  //       num: 1,
  //       length: 0.2,
  //       angle: Math.PI / 2,
  //       step: 0.04,
  //       rotation: 0,
  //       color: this.defaultColor,
  //       transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
  //       position: null,
  //     };
  //     const options = joinObjects({}, defaultOptions, ...optionsIn);
  //     if (options.position != null) {
  //       options.transform.updateTranslation(getPoint(options.position));
  //     }

  //     const single = [
  //       new Point(options.length / 2, options.width / 2),
  //       new Point(options.length / 2, -options.width / 2),
  //       new Point(-options.length / 2, -options.width / 2),
  //       new Point(-options.length / 2, options.width / 2),
  //     ];

  //     const collection = this.collection(
  //       options.transform,
  //     );
  //     collection.setColor(options.color);
  //     if (
  //       options.pulse != null
  //       && typeof collection.pulseDefault !== 'function'
  //       && typeof collection.pulseDefault !== 'string'
  //     ) {
  //       collection.pulseDefault.scale = options.pulse;
  //     }

  //     const start = -((options.num - 1) / 2) * options.step;
  //     for (let i = 0; i < options.num; i += 1) {
  //       const t = new Transform()
  //         .rotate(options.angle)
  //         .translate(start + i * options.step, 0)
  //         .rotate(options.rotation);

  //       const points = single.map(
  //         p => (p._dup().transformBy(t.matrix())),
  //       );
  //       collection.add(`${i}`, this.fan({
  //         points,
  //         color: options.color,
  //       }));
  //     }
  //     return collection;
  //   }
}

export type TypeFigurePrimitives = FigurePrimitives;
