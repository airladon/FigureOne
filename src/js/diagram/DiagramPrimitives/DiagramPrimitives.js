// @flow
import {
  Rect, Point, Transform, getPoint, getRect, getTransform, getPoints,
} from '../../tools/g2';
// import {
//   round
// } from '../../tools/math';
import type {
  TypeParsablePoint, TypeParsableRect, TypeParsableTransform,
} from '../../tools/g2';
import { setHTML } from '../../tools/htmlGenerator';
import {
  DiagramElementCollection, DiagramElementPrimitive, DiagramElement,
} from '../Element';
import WebGLInstance from '../webgl/webgl';
import DrawContext2D from '../DrawContext2D';
import * as tools from '../../tools/math';
import { generateUniqueId, joinObjects } from '../../tools/tools';
import DrawingObject from '../DrawingObjects/DrawingObject';
import VertexObject from '../DrawingObjects/VertexObject/VertexObject';
// import {
//   PolyLine, PolyLineCorners,
// } from '../DiagramElements/PolyLine';
import Fan from '../DiagramElements/Fan';
// import {
//   Polygon, PolygonFilled, PolygonLine,
// } from '../DiagramElements/Polygon';
import RadialLines from '../DiagramElements/RadialLines';
import HorizontalLine from '../DiagramElements/HorizontalLine';
import DashedLine from '../DiagramElements/DashedLine';
import RectangleFilled from '../DiagramElements/RectangleFilled';
import Rectangle from '../DiagramElements/Rectangle';
import Generic from '../DiagramElements/Generic';
import Box from '../DiagramElements/Box';
// import type { TypeRectangleFilledReference } from '../DiagramElements/RectangleFilled';
import Lines from '../DiagramElements/Lines';
import Arrow from '../DiagramElements/Arrow';
import { AxisProperties } from '../DiagramElements/Plot/AxisProperties';
import Axis from '../DiagramElements/Plot/Axis';
import Text from '../DiagramElements/Text';
// import {
//   DiagramText, DiagramFont, TextObject, LinesObject,
// } from '../DrawingObjects/TextObject/TextObject';

import {
  TextObject, TextLineObject, TextLinesObject, DiagramFont,
} from '../DrawingObjects/TextObject/TextObject';
import type {
  OBJ_Font,
} from '../DrawingObjects/TextObject/TextObject';
import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
import type { TypeSpaceTransforms } from '../Diagram';
import { makePolyLine, makePolyLineCorners } from '../DrawingObjects/Geometries/lines/lines';
import { getPolygonPoints, getFanTrisPolygon, getTrisFillPolygon } from '../DrawingObjects/Geometries/polygon/polygon';
import { rectangleBorderToTris, getRectangleBorder } from '../DrawingObjects/Geometries/rectangle';
import getTriangle from '../DrawingObjects/Geometries/triangle';
import type {
  OBJ_Copy,
} from './DiagramPrimitiveTypes';
import { copyPoints } from '../DrawingObjects/Geometries/copy/copy';
import type { CPY_Step } from '../DrawingObjects/Geometries/copy/copy';


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
 * and then the rectangle repeated throughout the diagram.
 *
 * @property {string} src The url or location of the image
 * @property {Rect} [mapTo] vertex space window (`new Rect(-1, -1, 2, 2)`)
 * @property {Rect} [mapFrom] image space window (`new Rect(0, 0, 1, 1)`)
 * @property {boolean} [repeat] `true` will tile the image. Only works with
 * images that are square whose number of side pixels is a power of 2 (`false`)
 * @property {() => void} [onLoad] textures are loaded asynchronously, so this
 * callback can be used to execute code after the texture is loaded. At a
 * minimum, any custom function here should include a call to animate the next
 * frame (`diagram.animateNextFrame`)
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
 * ![](./assets1/generic.png)
 *
 * Options object for a {@link DiagramElementPrimitive} of a generic shape
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
 * @property {Array<number>} [color] (`[1, 0, 0, 1])
 * @property {OBJ_Texture} [texture] override `color` with a texture if defined
 * @property {Array<Array<TypeParsablePoint>>} [border]
 * @property {Array<Array<TypeParsablePoint>> | Array<Array<Point>>} [hole]
 * @property {TypeParsablePoint} [position] will overwrite first translation
 * transform of `transform` chain
 * @property {Transform} [transform]
 * @property {OBJ_PulseScale | number} [pulse] set default scale pulse options
 * (`OBJ_PulseScale`) or pulse scale directly (`number`)
 *
 * @example
 * // Square and triangle
 * diagram.addElement({
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
 * diagram.addElement({
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
 *     isTouchable: true,
 *     isMovable: true,
 *     move: {
 *       bounds: 'diagram',
 *     },
 *   },
 * });
 * diagram.setTouchable();
 *
 * @example
 * // Grid of triangles
 * diagram.addElement({
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
  color?: Array<number>,
  texture?: OBJ_Texture,
  border?: Array<Array<TypeParsablePoint>>,
  hole?: Array<Array<TypeParsablePoint>> | Array<Array<Point>>,
  position?: TypeParsablePoint,
  transform?: Transform,
  pulse?: number,
}

/**
  Curved Corner Definition
 */
export type OBJ_CurvedCorner = {
  radius?: number,
  sides?: number,
};


//  */
// export type OBJ_Rectangle = {
//   yAlign?: 'bottom' | 'middle' | 'top' | number,
//   xAlign?: 'left' | 'center' | 'right' | number,
//   width?: number,
//   height?: number,
//   fill?: boolean,
//   corner?: {
//     radius?: number,
//     sides?: number,
//   },
//   color?: Array<number>,
//   transform?: Transform,
//   position?: Point,
//   pulse?: number,
// }

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
 * Polyline shape options object
 *
 * ![](./assets1/polyline.png)
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
 * @property {Array<number>} [dash] leave empty for solid line - use array of
 * numbers for dash line where first number is length of line, second number is
 * length of gap and then the pattern repeats - can use more than one dash length
 * and gap  - e.g. [0.1, 0.01, 0.02, 0.01] produces a lines with a long dash,
 * short gap, short dash, short gap and then repeats.
 * @property {boolean} [linePrimitives] Use WebGL line primitives instead of
 * triangle primitives to draw the line (`false`)
 * @property {boolean} [lineNum] Number of line primitives to use when
 * `linePrimitivs`: `true` (`2`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the polyline
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {number} [pulse] set the default pulse scale
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('polyline').standard()`)
 * @property {'line' | 'positive' | 'negative' | Array<Array<TypeParsablePoint>>} [border]
 * touch border of the line can be the points on the `positive`, `negative`
 * or boths sides (`line`) of the line, or completely custom (`line`)
 * @property {'none' | 'positive' | 'negative' | Array<Array<TypeParsablePoint>>} [hole]
 * hole border of the line can be the points on the `positive` or `negative`
 * side of the line or completely custom (`none`)
 * @example
 * // Line
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'shapes.polyline',
 *     options: {
 *       points: [[-0.5, -0.5], [-0.1, 0.5], [0.3, -0.2], [0.5, 0.5]],
 *       width: 0.05,
 *   },
 * );
 *
 * @example
 * // Square with rounded corners and dot-dash line
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'shapes.polyline',
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
 * diagram.addElement(
 *  {
 *    name: 'p',
 *    method: 'shapes.polyline',
 *    options: {
 *      points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
 *      width: 0.05,
 *      close: true,
 *      cornersOnly: true,
 *      cornerLength: 0.2,
 *    },
 *  },
 *);
 */
export type OBJ_Polyline = {
  points: Array<TypeParsablePoint> | Array<Point>,
  width?: number,
  close?: boolean,
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative',
  cornerStyle?: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize?: number,
  cornerSides?: number,
  cornersOnly?: boolean,
  cornerLength?: number,
  forceCornerLength?: boolean,
  minAutoCornerAngle?: number,
  dash?: Array<number>,
  color?: Array<number>,
  texture?: OBJ_Texture,
  pulse?: number,
  position?: ?Point,
  transform?: Transform,
  border?: 'line' | 'positive' | 'negative' | Array<Array<TypeParsablePoint>>,
  hole?: 'none' | 'positive' | 'negative' | Array<Array<TypeParsablePoint>>,
  linePrimitives?: boolean,
  lineNum?: number,
  copy?: Array<CPY_Step | string> | CPY_Step,
};

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
 * Polygon or partial polygon shape options object
 *
 * ![](./assets1/polygon.png)
 *
 * @property {number} [sides] (`4`)
 * @property {number} [radius] (`1`)
 * @property {number} [width] line width - line will be drawn on inside of radius (`0.01`)
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
 * @property {OBJ_LineStyle} [line] line style options
 * @property {boolean | 'tris'} [fill] `true` will fill polygon with efficient
 * fan vertices. `'tris'` will fill polygon with less efficient separate
 * triangle vertices. Use `'tris'` if copying a filled polygon with
 * copy steps (`false`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the polygon if defined. If using fill and copying, use `fill`: `'tris'`
 * @property {Array<number>} [color] (`[1, 0, 0, 1`])
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {number | OBJ_PulseScale} [pulse] set the default pulse scale
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('polygon').standard()`)
 * @example
 * // Simple filled polygon
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'polygon',
 *     options: {
 *       radius: 0.5,
 *       fill: true,
 *       sides: 6,
 *     },
 *   },
 * );
 * @example
 * // Quarter circle
 * diagram.addElement(
 *   {
 *     name: 'p',
 *     method: 'polygon',
 *     options: {
 *       radius: 0.4,
 *       sides: 100,
 *       width: 0.08,
 *       angleToDraw: Math.PI / 2,
 *       color: [1, 1, 0, 1],
 *     },
 *   },
 * );
 */
export type OBJ_Polygon = {
  sides?: number,
  radius?: number,
  width?: number,
  rotation?: number,
  direction?: -1 | 1,
  line?: OBJ_LineStyle,
  sidesToDraw?: number,
  angleToDraw?: number,
  color?: Array<number>,
  fill?: boolean | 'tris',
  transform?: Transform,
  position?: TypeParsablePoint,
  texture?: OBJ_Texture,
  copy?: Array<CPY_Step | string> | CPY_Step,
  pulse?: number | OBJ_PulseScale,
  offset?: TypeParsablePoint,
};

/**
 * Rectangle shape options object
 *
 * ![](./assets1/rectangle.png)
 *
 * @property {number} [width] (`1`)
 * @property {number} [height] (`1`)
 * @property {'bottom' | 'middle' | 'top' | number} [yAlign] (`'middle'`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {OBJ_CurvedCorner} [corner] define for rounded corners
 * @property {OBJ_LineStyle} [line] line style options - do not use any corner
 * options
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the rectangle
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {number | OBJ_PulseScale} [pulse] set the default pulse scale
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('rectangle').standard()`)
 * @example
 * // Filled rectangle
 * diagram.addElement({
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
 * diagram.addElement({
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
 * diagram.addElement({
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
  corner?: {
    radius: 0,
    sides: 1,
  },
  fill?: boolean,
  line?: OBJ_LineStyle,
  color?: Array<number>,
  transform?: Transform,
  position?: TypeParsablePoint,
  texture?: OBJ_Texture,
  copy?: Array<CPY_Step | string> | CPY_Step,
  pulse?: number | OBJ_PulseScale,
}

/* eslint-disable max-len */
/**
 * Triangle shape options object
 *
 * ![](./assets1/triangle.png)
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
 * ![](./assets1/triangle_definition.png)
 *
 * A triangle starts with an angle (a1) at (0, 0) and base side extending along
 * the x axis to a second angle a2. The base side is side 1 (s1).
 *
 * Angles a1 and a2 exten the triangle above s1 if `direction` is `1`, and
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
 * (`transform`) in the DiagramElementPrimitive local space.
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
 * @property {OBJ_CurvedCorner} [corner] define for rounded corners
 * @property {OBJ_LineStyle} [line] line style options - do not use any corner
 * options
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the rectangle
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('rectangle').standard()`)
 * @property {number | OBJ_PulseScale} [pulse] set the default pulse scale
 *
 * @example
 * // Right angle triangle
 * diagram.addElement({
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
 * const t = diagram.create.triangle({
 *   options: {
 *     ASA: [Math.PI / 2, 1, Math.PI / 6],
 *     line: {
 *       width: 0.02,
 *       dash: [0.12, 0.04],
 *     },
 *   },
 * });
 * diagram.elements.add('t', t);
 *
 * @example
 * // Star from 4 equilateral triangles
 * diagram.addElement({
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
  line?: OBJ_LineStyle,
  copy?: Array<CPY_Step | string> | CPY_Step,
  color?: Array<number>,
  texture?: OBJ_Texture,
  position?: TypeParsablePoint,
  transform?: Transform,
  pulse?: number | OBJ_PulseScale,
}
/* eslint-enable max-len */


/**
 * Grid shape options object
 *
 * ![](./assets1/grid.png)
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
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] make copies of
 * the rectangle
 * @property {Array<number>} [color] (`[1, 0, 0, 1]`)
 * @property {OBJ_Texture} [texture] Override color with a texture
 * @property {Point} [position] convenience to override Transform translation
 * @property {Transform} [transform] (`Transform('rectangle').standard()`)
 * @property {number | OBJ_PulseScale} [pulse] set the default pulse scale
 *
 *
 * @example
 * // Grid defined by xStep and yStep
 * diagram.addElement({
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
 * const grid = diagram.create.grid({
 *   bounds: [-0.5, -0.5, 1, 1],
 *   xNum: 4,
 *   yNum: 4,
 *   line: {
 *     width: 0.03,
 *     dash: [0.1, 0.02],
 *   },
 * });
 * diagram.elements.add('g', grid);
 *
 * @example
 * // Grid of grids
 * diagram.addElement({
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
  line?: OBJ_LineStyle,
  copy?: OBJ_Copy | Array<OBJ_Copy>,
  color?: Array<number>,
  texture?: OBJ_Texture,
  position?: TypeParsablePoint,
  transform?: Transform,
  pulse?: OBJ_PulseScale | number,
}

/**
 * Text Definition object
 *
 * Used within {@link OBJ_Text} to define a single string
 *
 * @property {string} text string to show
 * @property {OBJ_Font} [font]
 * @property {TypeParsablePoint} [location] location to draw text (`[0, 0]`)
 * @property {'left' | 'right' | 'center'} [xAlign] how to align text
 * horizontally with `location` (`"left"`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] how to align
 * text vertically with `location` (`"left"`)
 * @property {() => void} [onClick] function to execute on click
 */
export type OBJ_TextDefinition = {
  text: string,
  font?: OBJ_Font,
  location?: TypeParsablePoint,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  onClick?: () => void,
};

/**
 * One or more text strings.
 *
 * ![](./assets1/textLines_ex1.png)
 *
 * ![](./assets1/text_ex2.png)
 *
 * Use this to make a DiagramElementPrimitive that renders simple text.
 *
 * If you need multiple strings, in different locations but all with the same
 * transform, then use this to assign multiple strings to the same primitive.
 * Different strings can have different fonts, colors, alignments, and
 * locations.
 *
 * @property {string | OBJ_TextDefinition | Array<string | OBJ_TextDefinition>} text text to draw,
 * either as a single string or multiple strings in an array(`4`)
 * @property {OBJ_Font} [font]
 * @property {'left' | 'right' | 'center'} [xAlign] default horizontal text
 * alignment for `text` relative to `location` (`"left"`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] default
 * vertical text alignment for `text` relative to `location` (`"baseline"`)
 * @property {Array<number>} [color] (`[1, 0, 0, 1`])
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text').standard()`)
 * @example
 * // Single string
 * diagram.addElement(
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
 * diagram.addElement(
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
 *       color: [1, 0, 0, 1],
 *     },
 *   },
 * );
 */
export type OBJ_Text = {
  text: string | OBJ_TextDefinition | Array<string | OBJ_TextDefinition>;
  font?: OBJ_Font,                    // default font
  xAlign?: 'left' | 'right' | 'center',                // default xAlign
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',   // default yAlign
  color?: Array<number>,
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
}


/**
 * Line Text Definition object
 *
 * Used to define a string within a text line primitive {@link OBJ_TextLine}.
 *
 * @property {string} [text] string to show
 * @property {OBJ_Font} [font]
 * @property {TypeParsablePoint} [offset] offset to draw text (`[0, 0]`)
 * @property {boolean} [inLine] `false` means next text will follow previous
 * and not this (`true`)
 * @property {() => void} [onClick] function to execute on click
 */
export type OBJ_TextLineDefinition = {
  text: string,
  font?: OBJ_Font,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  onClick?: () => void,
};

/**
 * Text Line
 *
 * ![](./assets1/textLine.png)
 *
 * Array of strings that are arranged into a line. Each string is arranged so
 * that it is to the right of the previous string.
 *
 * Strings can be arranged out of the line flow by using the `inLine` property
 * in {@link OBJ_TextLineDefinition}.
 *
 * @property {Array<string | OBJ_TextLineDefinition>} [line] array of strings,
 * to layout into a line
 * @property {OBJ_Font} [font] Default font for strings in line
 * @property {Array<number>} [color] Default color for strings in line
 * (`[1, 0, 0, 1`])
 * @property {'left' | 'right' | 'center} [xAlign] horizontal alignment of
 * line with `position` (`left`)
 * @property {'bottom' | 'baseline' | 'middle' | 'top'} [yAlign] vertical
 * alignment of line with `position` (`baseline`)
 * @property {TypeParsablePoint} [position] if defined, overrides translation
 * in transform
 * @property {TypeParsableTransform} [transform]
 * (`Transform('text').standard()`)
 * @example
 * // "Hello to the world1" with highlighted "to the" and superscript "1"
 * diagram.addElement(
 *   {
 *     name: 'line',
 *     method: 'text.line',
 *     options: {
 *       line: [
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
 *           offset: [0, 0.05],
 *           font: { size: 0.05, color: [0, 0.6, 0, 1] },
 *         },
 *       ],
 *       xAlign: 'center',
 *       yAlign: 'bottom',
 *       font: {
 *         style: 'normal',
 *         size: 0.1,
 *       },
 *       color: [1, 0, 0, 1],
 *     },
 *   },
 * );
 */
export type OBJ_TextLine = {
  line: Array<string | OBJ_TextLineDefinition>;
  font: OBJ_Font,
  color: Array<number>,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
}

/**
 * Lines Text Definition object.
 *
 * Used to define a string within a text lines primitive {@link OBJ_TextLines}.
 *
 * @property {string} [line] string representing a line of text
 * @property {OBJ_Font} [font] line specific default font
 * @property {'left' | 'right' | 'center'} [justification] line specific justification
 * @property {number} [lineSpace] line specific separation from baseline of
 * this line to baseline of next line
 * @property {() => void} [onClick] function to execute on click
 */
export type OBJ_TextLinesDefinition = {
  line: string,
  font?: OBJ_Font,
  justification?: 'left' | 'right' | 'center',
  lineSpace?: number,
};

/**
 * Modifier Text Definition object.
 *
 * Used to define the modifiers of a string within a text lines primitive
 * {@link OBJ_TextModifiersDefinition}.
 *
 * @property {string} [text] text to replace modifier id with - if `undefined`
 * then modifier id is used
 * @property {OBJ_Font} [font] font changes for modified text
 * @property {boolean} [inLine] `false` if modified text should not contribute
 * to line layout (`true`)
 * @property {() => void} [onClick] function to execute on click of modified
 * text
 */
export type OBJ_TextModifierDefinition = {
  text?: string,
  offset?: TypeParsablePoint,
  inLine?: boolean,
  font?: OBJ_Font,
  onClick?: () => {},
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
 * ![](./assets1/textLines_ex1.png)
 *
 * ![](./assets1/textLines_ex2.png)
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
 * @property {Array<string | OBJ_TextLinesDefinition>} [lines] array of line
 * strings
 * @property {OBJ_TextModifiersDefinition} [modifiers] modifier definitions
 * @property {OBJ_Font} [font] Default font to use in lines
 * @property {Array<number>} [color] Default color to use in lines
 * (`[1, 0, 0, 1`])
 * @property {'left' | 'right' | 'center} [justification] justification of lines
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
 * @example
 * // "Two justified lines"
 * diagram.addElement(
 *   {
 *     name: 't',
 *     method: 'text.lines',
 *     options: {
 *       line: [
 *         'First line',
 *         'This is the second line',
 *         },
 *       ],
 *       font: {
 *         style: 'normal',
 *         size: 0.1,
 *       },
 *       justification: 'center'
 *       color: [1, 0, 0, 1],
 *     },
 *   },
 * );
 * @example
 * // "Example showing many features of textLines"
 * diagram.addElement(
 *   {
 *     name: 'lines',
 *     method: 'textLines',
 *     options: {
 *        lines: [
 *          'Lines justified to the left',
 *          'A |line| with a |modified_phrase|',
 *          {
 *            line: 'A |line| with custom defaults',
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
 *          size: 0.1,
 *        },
 *        justification: 'left',
 *        lineSpace: -0.2,
 *        position: [-0.5, 0.1],
 *      },
 *   },
 * );
 */
export type OBJ_TextLines = {
  lines: Array<string | OBJ_TextLinesDefinition>,
  modifiers: OBJ_TextModifiersDefinition,
  font?: OBJ_Font,
  justification?: 'left' | 'center' | 'right',
  lineSpace?: number,
  position: TypeParsablePoint,
  transform: TypeParsableTransform,
  xAlign: 'left' | 'right' | 'center',
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top',
  color: Array<number>,
};

// export type TypeGridOptions = {
//   bounds?: Rect,
//   xStep?: number,
//   yStep?: number,
//   numLinesThick?: number,
//   color?: Array<number>,
//   position?: Point,
//   transform?: Transform,
//   pulse?: number,
// };

export type TypeRepeatPatternVertex = {
  element?: DiagramElementPrimitive,
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

function setupPulse(element: DiagramElement, options: Object) {
  if (options.pulse != null) {
    if (
      typeof element.pulseDefault !== 'function'
      && typeof element.pulseDefault !== 'string'
    ) {
      if (typeof options.pulse === 'number') {
        // eslint-disable-next-line no-param-reassign
        element.pulseDefault.scale = options.pulse;
      } else {
        const { scale, frequency, duration } = options.pulse;
        // eslint-disable-next-line no-param-reassign
        if (scale != null) { element.pulseDefault.scale = scale; }
        // eslint-disable-next-line no-param-reassign
        if (frequency != null) { element.pulseDefault.frequency = frequency; }
        // eslint-disable-next-line no-param-reassign
        if (duration != null) { element.pulseDefault.time = duration; }
      }
    }
  }
}

/**
 * Built in dagiagram primitives.
 *
 * Including simple shapes, grid and text.
 */
export default class DiagramPrimitives {
  webgl: Array<WebGLInstance>;
  draw2D: Array<DrawContext2D>;
  htmlCanvas: HTMLElement;
  limits: Rect;
  spaceTransforms: TypeSpaceTransforms;
  animateNextFrame: Function;
  draw2DFigures: Object;

  /**
    * This is a big big test
    * @hideconstructor
    */
  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    draw2D: Array<DrawContext2D> | DrawContext2D,
    // draw2DFigures: Object,
    htmlCanvas: HTMLElement,
    limits: Rect,
    spaceTransforms: TypeSpaceTransforms,
    animateNextFrame: Function,
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
    // this.draw2DFigures = draw2DFigures;
  }

  generic(...optionsIn: Array<{
    points?: Array<TypeParsablePoint> | Array<Point>,
    border?: Array<Array<TypeParsablePoint>>,
    hole?: Array<Array<TypeParsablePoint>> | Array<Array<Point>>,
    drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    color?: Array<number>,
    texture?: {
      src?: string,
      mapTo?: Rect,
      mapFrom?: Rect,
      repeat?: boolean,
      onLoad?: () => void,
    },
    copy?: Array<CPY_Step | string> | CPY_Step,
    position?: TypeParsablePoint,
    transform?: Transform,
    pulse?: number,
  }>) {
    const defaultOptions = {
      points: [],
      border: null,
      hole: null,
      drawType: 'triangles',
      color: [1, 0, 0, 1],
      transform: new Transform('generic').standard(),
      position: null,
      texture: {
        src: '',
        mapTo: new Rect(-1, -1, 2, 2),
        mapFrom: new Rect(0, 0, 1, 1),
        repeat: false,
        onLoad: this.animateNextFrame,
      },
    };

    const options = joinObjects(defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }
    const parsedPoints = options.points.map(p => getPoint(p));
    const parseBorder = (borders) => {
      if (borders == null || !Array.isArray(borders)) {
        return null;
      }
      const borderOut = [];
      borders.forEach((b) => {
        if (Array.isArray(b)) {
          borderOut.push(b.map(bElement => getPoint(bElement)));
        }
      });
      return borderOut;
    };

    const parsedBorder = parseBorder(options.border);
    const parsedBorderHoles = parseBorder(options.hole);
    let copyToUse = options.copy;
    if (options.copy != null && !Array.isArray(options.copy)) {
      copyToUse = [options.copy];
    }

    const element = Generic(
      this.webgl,
      parsedPoints,
      parsedBorder,
      parsedBorderHoles,
      options.drawType,
      options.color,
      options.transform,
      this.limits,
      options.texture.src,
      options.texture.mapTo,
      options.texture.mapFrom,
      options.texture.repeat,
      options.texture.onLoad,
      copyToUse,
    );

    setupPulse(element, options);

    return element;
  }

  polyline(...optionsIn: Array<OBJ_Polyline>) {
    const defaultOptions = {
      width: 0.01,
      color: [1, 0, 0, 1],
      close: false,
      widthIs: 'mid',
      cornerStyle: 'auto',
      cornerSize: 0.01,
      cornerSides: 10,
      cornersOnly: false,
      cornerLength: 0.1,
      // forceCornerLength: false,
      minAutoCornerAngle: Math.PI / 7,
      dash: [],
      linePrimitives: false,
      lineNum: 1,
      transform: new Transform('polyline').standard(),
      border: 'line',
      hole: 'none',
      // repeat: null,
    };
    const options = processOptions(defaultOptions, ...optionsIn);
    parsePoints(options, ['points', 'border', 'hole']);
    if (options.linePrimitives === false) {
      options.lineNum = 2;
    }

    let getTris;
    if (options.cornersOnly) {
      getTris = points => makePolyLineCorners(
        points,
        options.width,
        options.close,
        options.cornerLength,
        // options.forceCornerLength,
        options.widthIs,
        options.cornerStyle,
        options.cornerSize,
        options.cornerSides,
        options.minAutoCornerAngle,
        options.linePrimitives,
        options.lineNum,
      );
    } else {
      getTris = points => makePolyLine(
        points,
        options.width,
        options.close,
        options.widthIs,
        options.cornerStyle,
        options.cornerSize,
        options.cornerSides,
        options.minAutoCornerAngle,
        options.dash,
        options.linePrimitives,
        options.lineNum,
        options.border,
        options.hole,
      );
    }
    const [triangles, borders, holes] = getTris(options.points);
    const element = this.generic(options, {
      drawType: options.linePrimitives ? 'lines' : 'triangles',
      points: triangles,    // $FlowFixMe
      border: Array.isArray(options.border) ? options.border : borders,
      holeBorder: Array.isArray(options.hole) ? options.hole : holes,
      // repeat: options.repeat,
    });

    element.custom.updatePoints = (points) => {
      element.drawingObject.change(...getTris(points));
    };

    // if (options.pulse != null) {
    //   if (typeof element.pulseDefault !== 'function') {
    //     element.pulseDefault.scale = options.pulse;
    //   }
    // }
    setupPulse(element, options);

    return element;
  }

  /**
   * Polygon or partial polygon shape options object
   *
   * ![](./assets1/polygon.png)
   */
  polygon(...options: Array<OBJ_Polygon>) {
    const defaultOptions = {
      radius: 1,
      sides: 4,
      direction: 1,
      // sidesToDraw: 4,
      rotation: 0,
      width: 0.01,
      // line: {
      //   widthIs: 'mid',
      // },
      // angle: Math.PI * 2,
      offset: new Point(0, 0),
      transform: new Transform('polygon').standard(),
      touchableLineOnly: false,
    };
    let radiusMod = 0;
    const optionsToUse = processOptions(defaultOptions, ...options);

    if (
      optionsToUse.line == null
      || (optionsToUse.line != null && optionsToUse.line.widthIs == null)
    ) {
      if (optionsToUse.line == null) {
        optionsToUse.line = {};
      }
      optionsToUse.line.widthIs = 'mid';
      const sideAngle = Math.PI * 2 / optionsToUse.sides;
      const theta = (Math.PI - sideAngle) / 2;
      radiusMod = optionsToUse.width / 2 / Math.sin(theta);
    }

    parsePoints(optionsToUse, ['offset']);
    let element;
    if (optionsToUse.angleToDraw != null) {
      optionsToUse.sidesToDraw = Math.floor(
        optionsToUse.angleToDraw / (Math.PI * 2 / optionsToUse.sides),
      );
    }
    if (optionsToUse.sidesToDraw == null) {
      optionsToUse.sidesToDraw = optionsToUse.sides;
    }
    if (optionsToUse.fill === true) {
      const fan = getFanTrisPolygon(
        optionsToUse.radius, optionsToUse.rotation, optionsToUse.offset,
        optionsToUse.sides, optionsToUse.sidesToDraw, optionsToUse.direction,
      );
      element = this.generic(optionsToUse, {
        drawType: 'fan',
        points: fan, // $FlowFixMe
        border: [[...fan.slice(1, -1)]],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const points = getFanTrisPolygon(
          o.radius, o.rotation, o.offset,
          o.sides, o.sidesToDraw, o.direction,
        );
        element.drawingObject.change(
          points, [[...points.slice(1, -1)]], [],
        );
      };
    } else if (optionsToUse.fill === 'tris') {
      const tris = getTrisFillPolygon(
        optionsToUse.radius, optionsToUse.rotation, optionsToUse.offset,
        optionsToUse.sides, optionsToUse.sidesToDraw, optionsToUse.direction,
      );
      const border = getPolygonPoints(
        optionsToUse.radius, optionsToUse.rotation, optionsToUse.offset,
        optionsToUse.sides, optionsToUse.sidesToDraw, optionsToUse.direction,
      );
      element = this.generic(optionsToUse, {
        points: tris, // $FlowFixMe
        border: [border],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const points = getTrisFillPolygon(
          o.radius, o.rotation, o.offset,
          o.sides, o.sidesToDraw, o.direction,
        );
        const borderPoints = getPolygonPoints(
          o.radius, o.rotation, o.offset,
          o.sides, o.sidesToDraw, o.direction,
        );
        element.drawingObject.change(
          points, [borderPoints], [],
        );
      };
    } else {
      const polygonPoints = getPolygonPoints(
        optionsToUse.radius - radiusMod, optionsToUse.rotation, optionsToUse.offset,
        optionsToUse.sides, optionsToUse.sidesToDraw, optionsToUse.direction,
      );
      let border = 'line';
      let hole;
      if (optionsToUse.direction === 1) {
        border = 'negative';
        hole = 'positive';
      }
      if (optionsToUse.direction === -1) {
        border = 'positive';
        hole = 'negative';
      }
      // console.log(polygonPoints)
      element = this.polyline(optionsToUse, optionsToUse.line, {
        points: polygonPoints,
        close: optionsToUse.sides === optionsToUse.sidesToDraw,
        border,
        hole,
      });
      const simplifyBorder = (e) => {
        const simpleBorder = [];
        for (let i = 0; i < e.drawingObject.border[0].length; i += 2) {
          simpleBorder.push(e.drawingObject.border[0][i]._dup());
        }
        e.drawingObject.border = [simpleBorder];
      };
      simplifyBorder(element);
      // element.drawingObject.border = [simpleBorder];
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const points = getPolygonPoints(
          o.radius - radiusMod, o.rotation, o.offset,
          o.sides, o.sidesToDraw, o.direction,
        );
        element.custom.updatePoints(points);
        // element.border = [points];
        simplifyBorder(element);
      };
    }
    // element.drawingObject.getPointCountForAngle = (angle: number) => {
    //   const sidesToDraw = Math.floor(
    //     tools.round(angle, 8) / tools.round(Math.PI * 2, 8) * optionsToUse.sides,
    //   );
    //   if (optionsToUse.fill === true) {
    //     return sidesToDraw + 2;
    //   }
    //   if (optionsToUse.fill === 'tris') {
    //     return sidesToDraw * 3;
    //   }
    //   if (optionsToUse.line && optionsToUse.line.linePrimitives) {
    //     return sidesToDraw * optionsToUse.line.lineNum * 2;
    //   }
    //   return sidesToDraw * 6;
    // };
    return element;
  }

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
    };
    const optionsToUse = processOptions(defaultOptions, ...options);

    if (
      optionsToUse.line != null && optionsToUse.line.widthIs == null
    ) {
      optionsToUse.line.widthIs = 'mid';
    }

    const border = getRectangleBorder(optionsToUse);
    let element;
    if (optionsToUse.line == null) {
      element = this.generic(optionsToUse, {
        points: rectangleBorderToTris(border),
        border: [border],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const updatedBorder = getRectangleBorder(o);
        element.drawingObject.change(
          rectangleBorderToTris(updatedBorder), [updatedBorder], [],
        );
      };
    } else {
      element = this.polyline(optionsToUse, optionsToUse.line, {
        points: border,
        close: true,
        border: [border],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const updatedBorder = getRectangleBorder(o);
        element.custom.updatePoints(updatedBorder);
      };
    }
    return element;
  }

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
    };
    const optionsToUse = processOptions(defaultOptions, ...options);
    if (optionsToUse.points != null) {
      optionsToUse.points = getPoints(optionsToUse.points);
    }

    if (
      optionsToUse.line != null && optionsToUse.line.widthIs == null
    ) {
      optionsToUse.line.widthIs = 'mid';
    }

    const border = getTriangle(optionsToUse);
    let element;
    if (optionsToUse.line == null) {
      element = this.generic(optionsToUse, {
        points: border,
        border: [border.map(b => b._dup())],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const updatedBorder = getTriangle(o);
        element.drawingObject.change(
          updatedBorder, [updatedBorder.map(b => b._dup())], [],
        );
      };
    } else {
      element = this.polyline(optionsToUse, optionsToUse.line, {
        points: border,
        close: true,
        border: [border.map(b => b._dup())],
      });
      element.custom.update = (updateOptions) => {
        const o = joinObjects({}, optionsToUse, updateOptions);
        const updatedBorder = getRectangleBorder(o);
        element.custom.updatePoints(updatedBorder);
      };
    }
    return element;
  }

  grid(...optionsIn: Array<{
    bounds?: TypeParsableRect,
    xStep?: number,
    yStep?: number,
    xNum?: number,
    yNum?: number,
    line?: OBJ_LineStyle,
    copy?: OBJ_Copy | Array<OBJ_Copy>,
    color?: Array<number>,
    texture?: OBJ_Texture,
    position?: TypeParsablePoint,
    transform?: Transform,
    pulse?: OBJ_PulseScale | number,
  }>) {
    const defaultOptions = {
      bounds: new Rect(-1, -1, 2, 2),
      transform: new Transform('grid').standard(),
      line: {
        linePrimitives: false,
        width: 0.005,
        lineNum: 2,
        dash: [],
      },
    };
    const options = processOptions(defaultOptions, ...optionsIn);
    parsePoints(options, []);
    options.bounds = getRect(options.bounds);
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
      [[]],
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

  gridLegacy(...optionsIn: Array<{
    bounds?: TypeParsableRect,
    xStep?: number,
    yStep?: number,
    xNum?: number,
    yNum?: number,
    // start?: TypeParsablePoint,
    width?: number,
    linePrimitives?: boolean,
    lineNum?: number,
    dash?: Array<number>,
    texture?: OBJ_Texture,
    color?: Array<number>,
    position?: TypeParsablePoint,
    transform?: Transform,
    copy?: OBJ_Copy | Array<OBJ_Copy>,
  }>) {
    const defaultOptions = {
      bounds: new Rect(-1, -1, 2, 2),
      width: 0.005,
      transform: new Transform('grid').standard(),
      dash: [],
      linePrimitives: false,
      lineNum: 2,
    };
    const options = processOptions(defaultOptions, ...optionsIn);
    parsePoints(options, []);
    options.bounds = getRect(options.bounds);
    const getTris = points => makePolyLine(
      points,
      options.width,
      false,
      'mid',
      'auto', // cornerStyle doesn't matter
      0.1,    // cornerSize doesn't matter
      1,      // cornerSides,
      Math.PI / 7, // minAutoCornerAngle,
      options.dash,
      options.linePrimitives,
      options.lineNum,
      [[]],
      [[]],
    );

    // Prioritize Num over Step. Only define Num from Step if Num is undefined.
    const { bounds } = options;
    let {
      xStep, xNum, yStep, yNum, width,
    } = options;
    if (options.linePrimitives && options.lineNum === 1) {
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
      drawType: options.linePrimitives ? 'lines' : 'triangles',    // $FlowFixMe
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

  polygonSweep(...optionsIn: Array<{
    radius?: number,
    rotation?: number,
    sides?: number,
    offset?: TypeParsablePoint,
    width?: number,
    direction?: -1 | 1,
    fill?: boolean,
    color?: Array<number>,
    texture?: OBJ_Texture,
    position?: TypeParsablePoint,
    transform?: Transform,
    pulse?: number,
  }>) {
    const defaultOptions = {
      sides: 4,
      fill: false,
      transform: new Transform('polygonSweep').standard(),
      line: {
        linePrimitives: false,
        lineNum: 2,
      },
    };
    const forceOptions = {
      line: {
        cornerStyle: 'auto',
        cornersOnly: false,
      },
    };
    const options = processOptions(defaultOptions, ...optionsIn, forceOptions);
    const element = this.polygon(options);
    // $FlowFixMe
    element.drawingObject.getPointCountForAngle = (angle: number) => {
      const sidesToDraw = Math.floor(
        tools.round(angle, 8) / tools.round(Math.PI * 2, 8) * options.sides,
      );
      if (options.fill) {
        return sidesToDraw + 2;
      }
      if (options.line && options.line.linePrimitives) {
        return sidesToDraw * options.line.lineNum * 2;
      }
      return sidesToDraw * 6;
    };
    return element;
  }

  fan(...optionsIn: Array<{
    points?: Array<Point>,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
    mods?: {},
  }>) {
    const defaultOptions = {
      points: [],
      color: [1, 0, 0, 1],
      transform: new Transform('fan').standard(),
      position: null,
    };
    const options = Object.assign({}, defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    const element = Fan(
      this.webgl,
      options.points.map(p => getPoint(p)),
      options.color,
      options.transform,
      this.limits,
    );

    // if (options.pulse != null) {
    //   if (typeof element.pulseDefault !== 'function') {
    //     element.pulseDefault.scale = options.pulse;
    //   }
    // }
    setupPulse(element, options);

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

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
        family: 'Times New Roman',
        style: 'normal',
        size: 0.2,
        weight: '200',
      },
      xAlign: 'left',
      yAlign: 'baseline',
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
      options.color = [1, 0, 0, 1];
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

    return options;
  }

  createPrimitive(
    drawingObject: DrawingObject, options: Object,
  ) {
    const element = new DiagramElementPrimitive(
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

  textLine(...optionsIn: Array<OBJ_TextLine>) {
    const options = this.parseTextOptions(...optionsIn);
    const to = new TextLineObject(this.draw2D);
    to.loadText(options);
    return this.createPrimitive(to, options);
  }

  textLines(...optionsIn: Array<OBJ_TextLines>) {
    const options = this.parseTextOptions(...optionsIn);
    if (options.justification == null) {
      options.justification = 'left';
    }
    if (options.lineSpace == null) {
      options.lineSpace = -options.font.size * 1.2;
    }
    // console.log('qwerty')
    const to = new TextLinesObject(this.draw2D);
    to.loadText(options);
    return this.createPrimitive(to, options);
  }

  text(...optionsIn: Array<OBJ_Text>) {
    const options = this.parseTextOptions(...optionsIn);
    const to = new TextObject(
      this.draw2D,
    );
    to.loadText(options);
    // console.log(to.text[0].font)
    return this.createPrimitive(to, options);
  }

  arrow(...optionsIn: Array<{
    width?: number;
    legWidth?: number;
    height?: number;
    legHeight?: number;
    color?: Array<number>;
    transform?: Transform;
    position?: Point;
    tip?: Point;
    rotation?: number;
    pulse?: number,
    mods?: {},
  }>) {
    const defaultOptions = {
      width: 0.5,
      legWidth: 0,
      height: 0.5,
      legHeight: 0,
      color: [1, 0, 0, 1],
      transform: new Transform('arrow').standard(),
      tip: new Point(0, 0),
      rotation: 0,
    };
    const options = Object.assign({}, defaultOptions, ...optionsIn);

    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }
    const element = new Arrow(
      this.webgl,
      options.width,
      options.legWidth,
      options.height,
      options.legHeight,
      getPoint(options.tip),
      options.rotation,
      options.color,
      options.transform,
      this.limits,
    );

    // if (options.pulse != null) {
    //   if (typeof element.pulseDefault !== 'function') {
    //     element.pulseDefault.scale = options.pulse;
    //   }
    // }
    setupPulse(element, options);

    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }

    return element;
  }

  // arrowLegacy(
  //   width: number = 1,
  //   legWidth: number = 0.5,
  //   height: number = 1,
  //   legHeight: number = 0.5,
  //   color: Array<number>,
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
  //   color: Array<number>,
  //   fontInput: DiagramFont | null = null,
  // ) {
  //   let font = new DiagramFont(
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
  //   const dT = new DiagramText(new Point(0, 0), textInput, font);
  //   const to = new TextObject(this.draw2D, [dT]);
  //   return new DiagramElementPrimitive(
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
    const diagramElement = new DiagramElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(p.x, p.y),
      [1, 1, 1, 1],
      this.limits,
    );
    return diagramElement;
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
    const diagramElement = new DiagramElementPrimitive(
      hT,
      new Transform().scale(1, 1).translate(location.x, location.y),
      [1, 1, 1, 1],
      this.limits,
    );
    // console.log('html', diagramElement.transform.mat, location)
    // diagramElement.setFirstTransform();
    return diagramElement;
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
    color?: Array<number>,
    pulse?: number,
  }>) {
    const defaultOptions = {
      id: generateUniqueId('id__html_image_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      src: '',
      // color: [1, 0, 0, 1],
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
    color?: Array<number>,
    pulse?: number,
  }>) {
    const defaultOptions = {
      text: '',
      id: generateUniqueId('id__html_text_'),
      classes: '',
      position: new Point(0, 0),
      yAlign: 'middle',
      xAlign: 'left',
      // color: [1, 0, 0, 1],
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

  lines(
    linePairs: Array<Array<Point>>,
    numLinesThick: number = 1,
    color: Array<number>,
    transform: Transform | Point = new Transform(),
  ) {
    return Lines(this.webgl, linePairs, numLinesThick, color, transform, this.limits);
  }

  // gridLegacy(...optionsIn: Array<TypeGridOptions>) {
  //   const defaultOptions = {
  //     bounds: new Rect(-1, -1, 2, 2),
  //     xStep: 0.1,
  //     yStep: 0.1,
  //     xOffset: 0,
  //     yOffset: 0,
  //     numLinesThick: 1,
  //     color: [1, 0, 0, 1],
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

  horizontalLine(
    start: Point,
    length: number,
    width: number,
    rotation: number,
    color: Array<number>,
    transform: Transform | Point = new Transform(),
  ) {
    return HorizontalLine(
      this.webgl, start, length, width,
      rotation, color, transform, this.limits,
    );
  }

  dashedLine(...optionsIn: Array<{
    start?: Point,
    length?: number,
    width?: number,
    rotation?: number,
    dashStyle?: Array<number>,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
  }>) {
    const defaultOptions = {
      start: [0, 0],
      length: 1,
      width: 0.01,
      rotation: 0,
      dashStyle: [0.1, 0.1],
      transform: new Transform('dashedLine').scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const element = DashedLine(
      this.webgl, getPoint(options.start), options.length, options.width,
      options.rotation, options.dashStyle, options.color,
      options.transform, this.limits,
    );
    setupPulse(element, options);
    return element;
  }

  // dashedLine(
  //   start: Point,
  //   length: number,
  //   width: number,
  //   rotation: number,
  //   dashStyle: Array<number>,
  //   color: Array<number>,
  //   transform: Transform | Point = new Transform(),
  // ) {
  //   return DashedLine(
  //     this.webgl, start, length, width,
  //     rotation, dashStyle, color, transform, this.limits,
  //   );
  // }

  rectangleLegacy(...optionsIn: Array<OBJ_Rectangle>) {
    const defaultOptions = {
      yAlign: 'middle',
      xAlign: 'center',
      width: 1,
      height: 1,
      lineWidth: 0.01,
      corner: {
        radius: 0,
        sides: 1,
      },
      fill: false,
      color: [1, 0, 0, 1],
      transform: new Transform('rectangle').scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    if (typeof options.reference !== 'string') {
      options.reference = getPoint(options.reference);
    }
    let element;
    if (options.fill) {
      element = RectangleFilled(
        this.webgl, options.xAlign, options.yAlign, options.width, options.height,
        options.corner.radius, options.corner.sides, options.color, options.transform, this.limits,
      );
    } else {
      element = Rectangle(
        this.webgl, options.xAlign, options.yAlign, options.width,
        options.height, options.lineWidth, options.corner.radius,
        options.corner.sides, options.color, options.transform, this.limits,
      );
    }

    setupPulse(element, options);

    return element;
  }

  box(...optionsIn: Array<{
    width?: number,
    height?: number,
    fill?: boolean,
    lineWidth?: number,
    colors?: Array<number>,
    transform?: Transform,
    position?: TypeParsablePoint,
    pulse?: number,
  }>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      fill: false,
      lineWidth: 0.01,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    if (typeof options.reference !== 'string') {
      options.reference = getPoint(options.reference);
    }
    const element = Box(
      this.webgl, options.width, options.height, options.lineWidth,
      options.fill, options.color, options.transform, this.limits,
    );
    setupPulse(element, options);

    return element;
  }

  radialLines(...optionsIn: Array<{
    innerRadius?: number,
    outerRadius?: number,
    width?: number,
    dAngle?: number,
    angle?: number,
    color?: Array<number>,
    transform?: Transform,
    position?: Point,
    pulse?: number,
  }>) {
    const defaultOptions = {
      innerRadius: 0,
      outerRadius: 1,
      width: 0.05,
      dAngle: Math.PI / 4,
      angle: Math.PI * 2,
      transform: new Transform().standard(),
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const element = RadialLines(
      this.webgl, options.innerRadius, options.outerRadius,
      options.width, options.dAngle, options.angle, options.color,
      options.transform, this.limits,
    );

    setupPulse(element, options);


    return element;
  }

  repeatPatternVertex(...optionsIn: Array<TypeRepeatPatternVertex>) {
    const defaultOptions = {
      element: null,
      xNum: 2,
      yNum: 2,
      xStep: 1,
      yStep: 1,
      transform: new Transform('repeatPattern').standard(),
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }
    const {
      element, transform, xNum, yNum, xStep, yStep,
    } = options;
    if (element == null) {
      return this.collection();
    }
    const copy = element._dup();
    const { drawingObject } = element;
    // console.log(element.drawingObject.points)
    if (drawingObject instanceof VertexObject) {
      copy.transform = transform._dup();
      const newPoints = [];
      const { points } = drawingObject;
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          for (let p = 0; p < points.length; p += 2) {
            newPoints.push(new Point(
              points[p] + x * xStep,
              points[p + 1] + y * yStep,
            ));
            // console.log(points[p], points[p+1], newPoints.slice(-1))
          }
        }
      }
      // console.log(newPoints)
      copy.drawingObject.changeVertices(newPoints);
    }
    if (options.pulse != null && typeof element.pulseDefault !== 'function') {
      copy.pulseDefault.scale = options.pulse;
    }
    return copy;
  }

  cursor(
    optionsIn: {
      color: Array<number>,
      width: number,
      radius: number,
    },
  ) {
    const defaultOptions = {
      color: [1, 1, 0, 0.5],
      width: 0.01,
      radius: 0.05,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    const cursor = this.collection();
    const polygon = {
      width: options.width,
      color: options.color,
      radius: options.radius,
      sides: 50,
    };
    const up = this.polygon(polygon);
    const down = this.polygon(joinObjects({}, polygon, { fill: true }));
    cursor.add('up', up);
    cursor.add('down', down);
    return cursor;
  }

  collection(
    transformOrPointOrOptions: Transform | Point | {
      transform?: Transform,
      position?: Point,
      color?: Array<number>,
      pulse?: number,
    } = {},
    ...moreOptions: Array<{
      transform?: Transform,
      position?: Point,
      color?: Array<number>,
      pulse?: number,
    }>
  ) {
    let transform = new Transform('collection').scale(1, 1).rotate(0).translate(0, 0);
    let color = [1, 0, 0, 1];
    let pulse = null;
    if (transformOrPointOrOptions instanceof Point) {
      transform.updateTranslation(transformOrPointOrOptions);
    } else if (transformOrPointOrOptions instanceof Transform) {
      transform = transformOrPointOrOptions._dup();
    } else {
      const optionsToUse = joinObjects(transformOrPointOrOptions, ...moreOptions);
      if (optionsToUse.transform != null) {
        ({ transform } = optionsToUse);
      }
      if (optionsToUse.position != null) {
        transform.updateTranslation(getPoint(optionsToUse.position));
      }
      if (optionsToUse.color != null) {
        ({ color } = optionsToUse);
      }
      if (optionsToUse.pulse != null) {
        ({ pulse } = optionsToUse);
      }
    }
    const element = new DiagramElementCollection(transform, this.limits);
    element.setColor(color);
    if (
      pulse != null
      && typeof element.pulseDefault !== 'function'
      && typeof element.pulseDefault !== 'string'
    ) {
      element.pulseDefault.scale = pulse;
    }
    return element;
  }

  repeatPattern(
    element: DiagramElementPrimitive,
    xNum: number,
    yNum: number,
    xStep: number,
    yStep: number,
    transform: Transform | Point = new Transform(),
  ) {
    let group;
    if (transform instanceof Transform) {
      group = this.collection({ transform });
    } else {
      group = this.collection({ transform: new Transform().translate(transform) });
    }
    let t = element.transform.t();
    let transformToUse = element.transform._dup();
    if (t === null) {
      t = new Point(0, 0);
      transformToUse = transformToUse.translate(0, 0);
    }
    if (t) {
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          const copy = element._dup();
          copy.transform = transformToUse._dup();
          copy.transform.updateTranslation(t.x + xStep * x, t.y + yStep * y);
          group.add(`xy${x}${y}`, copy);
        }
      }
    }
    return group;
  }

  // eslint-disable-next-line class-methods-use-this
  repeatPatternVertexLegacy(
    element: DiagramElementPrimitive,
    xNum: number,
    yNum: number,
    xStep: number,
    yStep: number,
    transform: Transform | Point = new Transform(),
  ) {
    const copy = element._dup();
    const { drawingObject } = element;
    // console.log(element.drawingObject.points)
    if (drawingObject instanceof VertexObject) {
      copy.transform = transform._dup();
      const newPoints = [];
      const { points } = drawingObject;
      for (let x = 0; x < xNum; x += 1) {
        for (let y = 0; y < yNum; y += 1) {
          for (let p = 0; p < points.length; p += 2) {
            newPoints.push(new Point(
              points[p] + x * xStep,
              points[p + 1] + y * yStep,
            ));
            // console.log(points[p], points[p+1], newPoints.slice(-1))
          }
        }
      }
      // console.log(newPoints)
      copy.drawingObject.changeVertices(newPoints);
    }
    return copy;
  }

  axes(...optionsIn: Array<{
    width?: number,
    height?: number,
    limits?: Rect,
    yAxisLocation?: number,
    xAxisLocation?: number,
    stepX?: number,
    stepY?: number,
    fontSize?: number,
    showGrid?: boolean,
    color?: Array<number>,
    fontColor?: Array<number>,
    gridColor?: Array<number>,
    location?: Transform | Point,
    decimalPlaces?: number,
    lineWidth?: number,
    pulse?: number,
  }>) {
    const defaultOptions = {
      width: 1,
      height: 1,
      limits: new Rect(-1, -1, 2, 2),
      yAxisLocation: 0,
      xAxisLocation: 0,
      stepX: 0.1,
      stepY: 0.1,
      fontSize: 0.13,
      showGrid: true,
      color: [1, 1, 1, 0],
      location: new Transform(),
      decimalPlaces: 1,
      lineWidth: 0.01,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    if (options.fontColor == null) {
      options.fontColor = options.color.slice();
    }
    if (options.gridColor == null) {
      options.gridColor = options.color.slice();
    }

    const {
      width, lineWidth, limits, color, stepX, decimalPlaces,
      yAxisLocation, xAxisLocation, fontSize, height, stepY,
      location, showGrid, gridColor, fontColor,
    } = options;

    const xProps = new AxisProperties('x', 0);

    xProps.minorTicks.mode = 'off';
    xProps.minorGrid.mode = 'off';
    xProps.majorGrid.mode = 'off';

    xProps.length = width;
    xProps.width = lineWidth;
    xProps.limits = { min: limits.left, max: limits.right };
    xProps.color = color.slice();
    xProps.title = '';

    xProps.majorTicks.start = limits.left;
    xProps.majorTicks.step = stepX;
    xProps.majorTicks.length = lineWidth * 5;
    xProps.majorTicks.offset = -xProps.majorTicks.length / 2;
    xProps.majorTicks.width = lineWidth * 2;
    xProps.majorTicks.labelMode = 'off';
    xProps.majorTicks.color = color.slice();
    xProps.majorTicks.labels = tools.range(
      xProps.limits.min,
      xProps.limits.max,
      stepX,
    ).map(v => v.toFixed(decimalPlaces)).map((v) => {
      if (v === yAxisLocation.toString() && yAxisLocation === xAxisLocation) {
        return `${v}     `;
      }
      return v;
    });

    // xProps.majorTicks.labels[xProps.majorTicks.labels / 2] = '   0';
    xProps.majorTicks.labelOffset = new Point(
      0,
      xProps.majorTicks.offset - fontSize * 0.1,
    );
    xProps.majorTicks.labelsHAlign = 'center';
    xProps.majorTicks.labelsVAlign = 'top';
    xProps.majorTicks.fontColor = fontColor.slice();
    xProps.majorTicks.fontSize = fontSize;
    xProps.majorTicks.fontWeight = '400';

    const xAxis = new Axis(
      this.webgl, this.draw2D, xProps,
      new Transform().scale(1, 1).rotate(0)
        .translate(0, xAxisLocation - limits.bottom * height / 2),
      this.limits,
    );

    const yProps = new AxisProperties('x', 0);
    yProps.minorTicks.mode = 'off';
    yProps.minorGrid.mode = 'off';
    yProps.majorGrid.mode = 'off';

    yProps.length = height;
    yProps.width = xProps.width;
    yProps.limits = { min: limits.bottom, max: limits.top };
    yProps.color = xProps.color;
    yProps.title = '';
    yProps.rotation = Math.PI / 2;

    yProps.majorTicks.step = stepY;
    yProps.majorTicks.start = limits.bottom;
    yProps.majorTicks.length = xProps.majorTicks.length;
    yProps.majorTicks.offset = -yProps.majorTicks.length / 2;
    yProps.majorTicks.width = xProps.majorTicks.width;
    yProps.majorTicks.labelMode = 'off';
    yProps.majorTicks.color = color.slice();
    yProps.majorTicks.labels = tools.range(
      yProps.limits.min,
      yProps.limits.max,
      stepY,
    ).map(v => v.toFixed(decimalPlaces)).map((v) => {
      if (v === xAxisLocation.toString() && yAxisLocation === xAxisLocation) {
        return '';
      }
      return v;
    });

    // yProps.majorTicks.labels[3] = '';
    yProps.majorTicks.labelOffset = new Point(
      yProps.majorTicks.offset - fontSize * 0.2,
      0,
    );
    yProps.majorTicks.labelsHAlign = 'right';
    yProps.majorTicks.labelsVAlign = 'middle';
    yProps.majorTicks.fontColor = xProps.majorTicks.fontColor;
    yProps.majorTicks.fontSize = fontSize;
    yProps.majorTicks.fontWeight = xProps.majorTicks.fontWeight;

    const yAxis = new Axis(
      this.webgl, this.draw2D, yProps,
      new Transform().scale(1, 1).rotate(0)
        .translate(yAxisLocation - limits.left * width / 2, 0),
      this.limits,
    );

    let transform = new Transform();
    if (location instanceof Point) {
      transform = transform.translate(location.x, location.y);
    } else {
      transform = location._dup();
    }
    const xy = this.collection(transform);
    if (showGrid) {
      const gridLines = this.grid({
        bounds: new Rect(0, 0, width, height),
        xStep: tools.roundNum(stepX * width / limits.width, 8),
        yStep: tools.roundNum(stepY * height / limits.height, 8),
        numThickLines: 1,
        // linePrimitives: true,
        // lineNum: 2,
        width: options.lineWidth * 0.6,
        color: gridColor,
        transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      });
      xy.add('grid', gridLines);
    }
    xy.add('y', yAxis);
    xy.add('x', xAxis);
    if (
      options.pulse != null
      && typeof xy.pulseDefault !== 'function'
      && typeof xy.pulseDefault !== 'string'
    ) {
      xy.pulseDefault.scale = options.pulse;
    }
    return xy;
  }

  parallelMarks(...optionsIn: Array<{
    num?: number,
    width?: number,
    length?: number,
    angle?: number,
    step?: number,
    rotation?: number,
    color?: Array<number>,
    pulse?: number,
    transform?: Transform,
    position?: Point,
  }>) {
    const defaultOptions = {
      width: 0.01,
      num: 1,
      length: 0.1,
      angle: Math.PI / 4,
      step: 0.04,
      rotation: 0,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }

    const x = options.length * Math.cos(options.angle);
    const y = options.length * Math.sin(options.angle);
    const wx = Math.abs(options.width * Math.cos(options.angle + Math.PI / 2));
    const wy = options.width * Math.sin(options.angle + Math.PI / 2);
    const single = [
      new Point(0, 0),
      new Point(0 - x, 0 - y),
      new Point(-x - wx, -y + wy),
      new Point(-Math.abs(options.width / Math.cos(options.angle + Math.PI / 2)), 0),
      new Point(-x - wx, y - wy),
      new Point(0 - x, 0 + y),
    ];

    const collection = this.collection(
      options.transform,
    );
    collection.setColor(options.color);
    if (
      options.pulse != null
      && typeof collection.pulseDefault !== 'function'
      && typeof collection.pulseDefault !== 'string'
    ) {
      collection.pulseDefault.scale = options.pulse;
    }

    const start = -((options.num - 1) / 2) * options.step;
    for (let i = 0; i < options.num; i += 1) {
      const points = single.map(
        p => (new Point(p.x + start + i * options.step, p.y)).rotate(options.rotation),
      );
      collection.add(`${i}`, this.fan({
        points,
        color: options.color,
      }));
    }
    return collection;
  }

  marks(...optionsIn: Array<{
    num?: number,
    width?: number,
    length?: number,
    angle?: number,
    step?: number,
    rotation?: number,
    color?: Array<number>,
    pulse?: number,
    transform?: Transform,
    position?: Point,
  }>) {
    const defaultOptions = {
      width: 0.01,
      num: 1,
      length: 0.2,
      angle: Math.PI / 2,
      step: 0.04,
      rotation: 0,
      color: [1, 0, 0, 1],
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
      position: null,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    if (options.position != null) {
      options.transform.updateTranslation(getPoint(options.position));
    }

    const single = [
      new Point(options.length / 2, options.width / 2),
      new Point(options.length / 2, -options.width / 2),
      new Point(-options.length / 2, -options.width / 2),
      new Point(-options.length / 2, options.width / 2),
    ];

    const collection = this.collection(
      options.transform,
    );
    collection.setColor(options.color);
    if (
      options.pulse != null
      && typeof collection.pulseDefault !== 'function'
      && typeof collection.pulseDefault !== 'string'
    ) {
      collection.pulseDefault.scale = options.pulse;
    }

    const start = -((options.num - 1) / 2) * options.step;
    for (let i = 0; i < options.num; i += 1) {
      const t = new Transform()
        .rotate(options.angle)
        .translate(start + i * options.step, 0)
        .rotate(options.rotation);

      const points = single.map(
        p => (p._dup().transformBy(t.matrix())),
      );
      collection.add(`${i}`, this.fan({
        points,
        color: options.color,
      }));
    }
    return collection;
  }
}

export type TypeDiagramPrimitives = DiagramPrimitives;
