// @flow
/* eslint-disable no-param-reassign */
import {
  Rect, Point, Transform, getPoint, getRect, getTransform,
  getBorder, getPoints,
  getBoundingBorder, isBuffer, toNumbers,
  sphere, cube, rod, cone, revolve, surface,
} from '../../tools/g2';
// import {
//   round
// } from '../../tools/math';
import type {
  TypeParsablePoint, TypeParsableRect, TypeParsableTransform,
  TypeParsableBorder, TypeParsableBuffer,
} from '../../tools/g2';
import { setHTML } from '../../tools/htmlGenerator';
// eslint-disable-next-line import/no-cycle
import {
  FigureElementPrimitive, FigureElement,
} from '../Element';
import WebGLInstance from '../webgl/webgl';
import DrawContext2D from '../DrawContext2D';
import * as tools from '../../tools/math';
import { generateUniqueId, joinObjects } from '../../tools/tools';
// eslint-disable-next-line import/no-cycle
import DrawingObject from '../DrawingObjects/DrawingObject';
// eslint-disable-next-line import/no-cycle
import GLObject from '../DrawingObjects/GLObject/GLObject';
import type { TypeGLUniform, TypeGLBufferType, TypeGLBufferUsage } from '../DrawingObjects/GLObject/GLObject';
// eslint-disable-next-line import/no-cycle
import { CustomAnimationStep } from '../Animation/Animation';
// eslint-disable-next-line import/no-cycle
import FigureElementPrimitiveMorph from './FigureElementPrimitiveMorph';
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
// eslint-disable-next-line import/no-cycle
import Generic from './Generic';
// import Box from '../FigureElements/Box';
// import type { TypeRectangleFilledReference } from '../FigureElements/RectangleFilled';
// import Lines from '../FigureElements/Lines';
// import Arrow from '../FigureElements/Arrow';
// import { AxisProperties } from '../FigureElements/Plot/AxisProperties';
// import Axis from '../FigureElements/Plot/Axis';
// eslint-disable-next-line import/no-cycle
import Text from './Text';
// import {
//   FigureText, FigureFont, TextObject, LinesObject,
// } from '../DrawingObjects/TextObject/TextObject';
// eslint-disable-next-line import/no-cycle
import {
  TextObject, TextLineObject, TextLinesObject,
} from '../DrawingObjects/TextObject/TextObject';
// eslint-disable-next-line import/no-cycle
import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
// import type { OBJ_SpaceTransforms } from '../Figure';
// eslint-disable-next-line import/no-cycle
import { makePolyLine, makePolyLineCorners, makeFastPolyLine } from '../geometries/lines/lines';
import { getPolygonPoints, getTrisFillPolygon } from '../geometries/polygon/polygon';
import { rectangleBorderToTris, getRectangleBorder } from '../geometries/rectangle';
// eslint-disable-next-line import/no-cycle
import { ellipseBorderToTris, getEllipseBorder } from '../geometries/ellipse';
// eslint-disable-next-line import/no-cycle
import { arcBorderToTris, getArcBorder } from '../geometries/arc';
import type { OBJ_Ellipse_Defined } from '../geometries/ellipse';
import type { OBJ_Arc_Defined } from '../geometries/arc';
import { getTriangleBorder, getTriangleDirection } from '../geometries/triangle';
import type { OBJ_Triangle_Defined } from '../geometries/triangle';
// eslint-disable-next-line import/no-cycle
import { getArrow, defaultArrowOptions, getArrowTris } from '../geometries/arrow';
import type { OBJ_LineArrows, TypeArrowHead } from '../geometries/arrow';
import getLine from '../geometries/line';
// import type {
//   OBJ_Copy,
// } from './FigurePrimitiveTypes';
import { copyPoints, getCopyCount } from '../geometries/copy/copy';
import type { CPY_Step } from '../geometries/copy/copy';
import type {
  TypeColor, TypeDash, OBJ_CurvedCorner, OBJ_Font,
} from '../../tools/types';
import { getBufferBorder } from '../geometries/buffer';
import type TimeKeeper from '../TimeKeeper';
import type { Recorder } from '../Recorder/Recorder';
import Scene from '../../tools/scene';

/**
 * Line style definition object.
 * @property {'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number} [widthIs]
 * defines how the width is grown from the polyline's points. When using
 * `number`, 0 is the equivalent of 'inside' and 1 is the equivalent of
 * 'outside'.
 * @property {number} [width] line width
 * @property {TypeDash} [dash] select solid or dashed line
 * @property {TypeColor} [color] line color
 */
export type OBJ_LineStyleSimple = {
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number,
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
};

export type OBJ_LineStyleSimple_Defined = {
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number,
  width: number,
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
 * @property {TypeParsableBorder | 'children' | 'rect' | number} [border]
 * defines border of collection. Use `'children'` for the borders of the
 * children. Use 'rect' for bounding rectangle of children. Use `number`
 * for the bounding rectangle with some buffer. Use
 * `Array<Array<TypeParsablePoint>` for a custom border. (`'children'`)
 * @property {TypeParsableBorder | 'border' | number | 'rect'} [touchBorder]
 * defines the touch border of the collection. Use `'border'` to use the same
 * as the border of the collection. Use `'rect'` for the bounding rectangle
 * of the border. Use `number` for the bounding rectangle of the border plus
 * some buffer. Use `Array<Array<TypeParsablePoint>` for a custom touch
 * border (`'border'`).
 *
 * @example
 * figure.add(
 *   {
 *     name: 'c',
 *     make: 'collection',
 *     elements: [         // add two elements to the collection
 *       {
 *         name: 'hex',
 *         make: 'polygon',
 *         sides: 6,
 *         radius: 0.5,
 *       },
 *       {
 *         name: 'text',
 *         make: 'text',
 *         text: 'hexagon',
 *         position: [0, -0.8],
 *         xAlign: 'center',
 *         font: { size: 0.3 },
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
  color?: TypeColor,
  parent?: FigureElement | null,
  border?: TypeParsableBorder | 'children' | 'rect' | number,
  touchBorder?: TypeParsableBorder | 'border' | number | 'rect',
};

/**
 * Texture definition object
 *
 * A texture file is an image file like a jpg, or png.
 *
 * Textures can be used instead of colors to fill a shape in WebGL.
 *
 * Each vertex in a shape is mapped to a color in the texture. A texture
 * coordinate is used to define where to sample the color in the texture.
 * Texture coodinates (x, y) are between 0 and 1 where the bottom left corner of
 * the texture is (0, 0) and the top right corner is (1, 1). Note, even if the
 * texture is being mapped onto a 3D surface, the texture coordinates are
 * always two dimensional as the texture is two dimensional.
 *
 * Texture colors can be mapped to vertices of the shape with either:
 * - `coords` - directly define the texture coordinates for each vertex
 * - `mapFrom`, `mapTo` - automatically map texture coordinates to the (x, y)
 *    draw space components of the shape's vertices. This is only useful for 2D
 *    shapes (3D shapes should use `coords`).
 *
 * To automatically map the texture to a shapes vertices, a rectangular window
 * in the texture (`mapFrom`) and a rectangular window in draw space (`mapTo`)
 * is defined. The texture is then offset and scaled such that its window
 * aligns with the draw space window.
 *
 * Therefore, to make a 1000 x 500 image fill a 2 x 1 rectangle in draw space
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
 * think about the window on the image, and other times the window in draw
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
 * @property {Array<number>} [coords] texture coordinates to map to each vertex
 * in shape. If empty, then the texture coorindates will be automatically
 * generated using `mapTo` and `mapFrom`. (`[]`)
 * @property {TypeParsableRect} [mapFrom] image space window (`new Rect(0, 0, 1, 1)`)
 * @property {TypeParsableRect} [mapTo] draw space window (`new TypeParsableRect(-1, -1, 2, 2)`)
 * @property {TypeParsableRect} [mapToAttribute] attribute name of the vertex
 * definitions to map the texture to (`a_vertex`)
 * @property {boolean} [repeat] `true` will tile the image. Only works with
 * images that are square whose number of side pixels is a power of 2 (`false`)
 * @property {TypeColor} [loadColor] color to display while texture is loading.
 * Use an alpha of 0 if no color is desired. (`[0, 0, 1, 0.5]`)
 * @property {() => void} [onLoad] textures are loaded asynchronously, so this
 * callback can be used to execute code after the texture is loaded. At a
 * minimum, any custom function here should include a call to animate the next
 * frame (`figure.animateNextFrame`)
 */
export type OBJ_Texture = {
  src?: string,
  mapFrom?: Rect,
  mapTo?: Rect,
  mapToAttribute?: string,
  coords?: Array<number>,
  loadColor?: TypeColor,
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
 * GL buffer.
 *
 * @property {string} name name of attribute in shader
 * @property {Array<number>} data array of values
 * @property {number} [size] number of values per attribute (`2`)
 * @property {TypeGLBufferType} [type] (`'FLOAT'`)
 * @property {boolean} [normalize] (`false`)
 * @property {number} [stride] (`0`)
 * @property {number} [offset] (`0`)
 * @property {TypeGLBufferUsage} [usage] (`'STATIC'`)
 */
export type OBJ_GLBuffer = {
  name: string,
  data: Array<number>,
  size?: number,
  type?: TypeGLBufferType,
  normalize?: boolean,
  stride?: number,
  offset?: number,
  usage?: TypeGLBufferUsage,
};

/**
 * GL vertex - associated with attribute 'a_vertex' in shader.
 *
 * Assumes buffer parameters of:
 * - name: 'a_vertex'
 * - size: 2
 * - type: 'FLOAT'
 * - normalize: false
 * - stride: 0
 * - offset: 0
 *
 * @property {Array<number>} data array of values
 * @property {TypeGLBufferUsage} [usage] (`'STATIC'`)
 */
export type OBJ_GLVertexBuffer = {
  data: Array<number>,
  usage: TypeGLBufferUsage,
};

/**
 * GL Uniform
 * @property {string} name name of uniform in shader
 * @property {1 | 2 | 3 | 4} length
 * @property {TypeGLUniform} type
 */
export type OBJ_GLUniform = {
  name: string,
  length: 1 | 2 | 3 | 4,
  type: TypeGLUniform,
};


/**
 * Options object for any {@link DiagramElementPrimitive}.
 *
 * @property {string} [name]  name of figure element
 * @property {TypeParsablePoint} [position] position overrides `transform` translation
 * @property {TypeParsableTransform} [transform] transform to apply to element
 * @property {TypeColor} [color] color to apply to element (is passed as the
 * 'u_color' uniform to the fragment shader)
 * @property {boolean | number | TypeParsablePoint} [touch] `true`, `number` or
 * `TypeParsablePoint` will set the element as touchable. If `number`, then
 * element touch volume is the scaled actual volume in x, y, and z. For
 * example, if `2`, then the touchable volume is twice the actual volume. If
 * `TypeParsablePoint` then the x, y, and z scales can be set independantly
 * (`false`)
 * @property {boolean | OBJ_ElementMove} [move] setting this to anything but
 * `false` will set the element as movable. Use `OBJ_ElementMove` to customize
 * the movement options
 * @property {TypeColor} [dimColor] RGBA is used when vertex colors are from a
 * uniform, otherwise just the alpha channel is used.
 * @property {TypeColor} [defaultColor]
 * @property {TypeScenarios} [scenarios]
 * @property {Scene} [scene] Give the element a custom scene that is independant
 * of the figure scene. For example, use this to create a 3D object in a 2D
 * figure.
 */
export type OBJ_FigurePrimitive = {
  name?: string,
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  color?: TypeColor,
  touch?: boolean | number | TypeParsablePoint,
  move?: boolean | OBJ_ElementMove,
  dimColor?: TypeColor,
  defaultColor?: TypeColor,
  scenarios?: TypeScenarios,
  scene?: Scene,
}

/**
 * Color definition for a gl primitive.
 * @property {Array<number>} data color data
 * @property {boolean} [normalize] if `true`, then color data values are between
 * 0 and 255 (`false`)
 * @property {3 | 4} [size] if `3`, then color data is RGB, if `4` then color
 * data is RGBA
 */
export type OBJ_GLColorData = {
  data: Array<number>,
  normalize?: boolean,
  size?: 3 | 4,
};

/**
 * DiagramElementPrimitive with low level WegGL drawing object.
 *
 * A number of WebGL specific properties can be defined.
 *
 * WebGL specific properties are `glPrimitive`, `vertexShader`, `fragmentShader`
 * `attributes`, `uniforms` and an optional `texture`. The
 * nomencalture for these properties is directly from WebGL.
 *
 * Properties `vertices`, `colors`, `dimension`, `light` and `normals` provide
 * shortcuts for defining the shaders, attributes and uniforms when shaders are
 * not customized.
 *
 * Shaders are programs that run in the GPU and are written in a C-like
 * language. Shaders operate on each vertex of a shape in parallel. The vertex
 * shader transforms each vertex to some specific position, and performs color
 * and lighting related calculations for scenarios when color and/or lighting
 * are vertex specific. The fragment shader computes the final color of each
 * pixel (fragment) between the vertices that make up a `glPrimitive`.
 *
 * Data can be passed from the CPU (JavaScript) to the GPU with attributes and
 * uniforms.
 *
 * Attributes are arrays of numbers that represent data specific for
 * each vertex in a shape. At a minimum, an attribute that defines the (x, y)
 * or (x, y, z) coordinates of each vertex is needed. Other attributes might be
 * color if all verticies do not have the same color, texture coordinates to
 * map vertex color to a 2D image texture, and normal vectors for defining how
 * light reflects from and thus brightens a surface. Each attribute must define
 * data for every vertex in a shape. Attributes are typically defined and loaded
 * into GPU buffers once. On each animation frame, the GPU will pass the
 * buffered attributes to the shaders. Attributes are only passed to the vertex
 * shader.
 *
 * Uniforms are small amounts of data (vectors or square matrices with a maximum
 * dimension/rank of 4) that are passed from the CPU to the GPU on each frame.
 * A uniform value can be passed to both the vertex and fragment shader and is
 * thus available to all vertices and fragments. A uniform is like a
 * global variable whose value can change on each animation frame. Example
 * uniforms are:
 * - transform matrix that transforms all vertices in space the same way
 * - color value that colors all vertices the same (instead of having to define
 *   a color for each vertex)
 * - light source properties like position, direction, and amplitude
 *
 * Data can be passed from the vertex shader to the fragment shader in variables
 * called *varyings*. Example varyings include color attributes (color that is
 * defined for each vertex) and lighting information if the lighting is vertex
 * dependent.
 *
 * Shaders source code can be defined as a string, or composed automatically
 * from options including `dimension`, `color` and `light`. Shader source code
 * contains attribute and uniform variables, and these attributes and uniforms
 * need to be defined with `attributes` and `uniforms`.
 *
 * If using automated shader composition, then only attributes need to be
 * defined. The uniforms will be passed to the shader from the information in
 * the `color` property of the FigureElementPrimitive and the `scene` used to
 * draw the primitive. See {@link OBJ_VertexShader} and
 * {@link OBJ_FragmentShader} for names of attributes and uniforms used in the
 * shaders, and when they are used.
 *
 * @property {'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES'} [glPrimitive]
 * @property {TypeVertexShader} [vertexShader]
 * @property {TypeFragmentShader} [fragmentShader]
 * @property {Array<OBJ_GLBuffer>} [attributes]
 * @property {Array<OBJ_GLUniform>} [uniforms]
 * @property {OBJ_Texture} [texture]
 * @property {2 | 3} [dimension] default value for `dimension in vertex shader
 * if vertex shader is undefined (`2`)
 * @property {'point' | 'directional' | null} [light] default value for `light`
 * in vertex and fragment shader if shaders are not otherwise defined (`null`)
 * @property {Array<number> | OBJ_GLColorData} [colors] default value for
 * `light` in vertex and fragment shader if shaders are not otherwise defined
 * (`uniform`)
 * @property {OBJ_GLVertexBuffer} [vertices] create a `a_vertex` attribute for
 * vertex coordinates
 * @property {OBJ_GLVertexBuffer} [normals] create a `a_normal` attribute
 *
 * @example
 * // Default options are 2D, uniform color, TRIANGLES.
 * // Create two red triangles (6 vertices, 12 values)
 * figure.add({
 *   make: 'gl',
 *   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Simple rotatable element with a custom position
 * figure.add({
 *   make: 'gl',
 *   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
 *   color: [1, 0, 0, 1],
 *   position: [-0.4, -0.4, 0],
 *   move: { type: 'rotation' },
 * });
 *
 * @example
 * // Assign a color to each vertex
 * figure.add({
 *   make: 'gl',
 *   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
 *   colors: [
 *     0, 0, 1, 1,
 *     1, 0, 0, 1,
 *     0, 0, 1, 1,
 *     1, 0, 0, 1,
 *     0, 0, 1, 1,
 *     1, 0, 0, 1,
 *   ],
 * });
 *
 * @example
 * // Assign a color to each vertex, using just 3 numbers per color (no alpha)
 * figure.add({
 *   make: 'gl',
 *   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
 *   colors: {
 *     data: [
 *       0, 0, 1,
 *       1, 0, 0,
 *       0, 0, 1,
 *       1, 0, 0,
 *       0, 0, 1,
 *       1, 0, 0,
 *     ],
 *     size: 3,
 *   },
 * });
 *
 * @example
 * // Texture filled square
 * figure.add({
 *   make: 'gl',
 *   vertices: [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5],
 *   numVertices: 6,
 *   texture: {
 *     src: './flower.jpeg',
 *     coords: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
 *     loadColor: [0, 0, 0, 0],
 *   },
 * });
 *
 * @example
 * // Make a 3D cube using composed shaders
 * const [cubeVertices, cubeNormals] = Fig.tools.g2.cube({ side: 0.5 });
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [2, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 * figure.add({
 *   make: 'gl',
 *   light: 'directional',
 *   dimension: 3,
 *   vertices: cubeVertices,
 *   normals: cubeNormals,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Custom shaders
 * // Make a shader with a custom attribute aVertex and custom uniform uColor,
 * // which are then defined in the options.
 * // Note, the `u_worldViewProjectionMatrix` uniform does not need to be defined
 * // as this will be passed by FigureOne using the Scene information of the
 * // figure (or element if an element has a custom scene attached to it).
 * figure.add({
 *   make: 'gl',
 *   vertexShader: {
 *     src: `
 *       uniform mat4 u_worldViewProjectionMatrix;
 *       attribute vec4 aVertex;
 *       void main() {
 *         gl_Position = u_worldViewProjectionMatrix * aVertex;
 *       }`,
 *     vars: ['aVertex', 'u_worldViewProjectionMatrix'],
 *   },
 *   fragmentShader: {
 *     src: `
 *     precision mediump float;
 *     uniform vec4 uColor;
 *     void main() {
 *       gl_FragColor = uColor;
 *       gl_FragColor.rgb *= gl_FragColor.a;
 *     }`,
 *     vars: ['uColor'],
 *   },
 *   attributes: [
 *     {
 *       name: 'aVertex',
 *       size: 3,
 *       data: [0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0.5, 0.5, 0],
 *     },
 *   ],
 *   uniforms: [
 *     {
 *       name: 'uColor',
 *       length: 4,
 *       value: [1, 0, 0, 1],
 *     },
 *   ],
 * });
 */
export type OBJ_GenericGL = {
  glPrimitive?: 'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES',
  vertexShader?: TypeVertexShader,
  fragmentShader?: TypeFragmentShader,
  attributes?: Array<OBJ_GLBuffer>,
  uniforms?: Array<OBJ_GLUniform>,
  texture?: OBJ_Texture,
  // Helpers
  dimension?: 2 | 3,
  light?: 'directional' | 'point' | null,
  vertices?: OBJ_GLVertexBuffer,
  colors?: Array<number> | OBJ_GLColorData,
  normals?: OBJ_GLVertexBuffer,
} & OBJ_FigurePrimitive;

/**
 * @property {'directional' | 'point' | null} [light] the scene light that will
 * be cast on the shape (`'directional'`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] Create copies the
 * shapes vertices to replicate the shape in space. Copies of normals, colors
 * (if defined) and texture coordinates (if defined) will also be made.
 * @property {TypeGLBufferUsage} [usage] use `'DYNAMIC'` if the shape's vertices
 * will be updated very frequently (`'STATIC'`)
 */
export type OBJ_Generic3DAll = {
  light?: 'directional' | 'point' | null,
  copy?: Array<CPY_Step | string> | CPY_Step,
  usage?: TypeGLBufferUsage,
}

/**
 * Options object for a {@link FigureElementPrimitive} of a generic 3D shape.
 *
 * {@link OBJ_GenericGL} can be used for shape creation with custom shaders.
 *
 * But for many custom shapes, only points and normals of the shape need to be
 * defined, without needing to customize the shaders.
 *
 * This provides the ability to create many custom shapes that don't need shader
 * customization.
 *
 * @property {'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES'} [glPrimitive]
 * (`'TRIANGLES'`)
 * @property {Array<TypeParsablePoint>} [points] positions of vertices of shape
 * @property {Array<TypeParsablePoint>} [normals] normals for each vertex
 * @property {Array<TypeColor>} [colors] define a color for each vertex if the
 * shape will be more than just a single color. Otherwise use `color` if a
 * single color.
 * @property {OBJ_Texture} [texture] use to overlay a texture onto the shape's
 * surfaces
 *
 * @example

 * @example
 * // Cubes with texture on each face
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [1, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 *
 * const [points, normals] = Fig.tools.g2.cube({ side: 0.8 });
 *
 * figure.add({
 *   make: 'generic3',
 *   points,
 *   normals,
 *   texture: {
 *     src: './flowers.jpeg',
 *     coords: [
 *       0, 0, 0.333, 0, 0.333, 0.5,
 *       0, 0, 0.333, 0.5, 0, 0.5,
 *       0.333, 0, 0.666, 0, 0.666, 0.5,
 *       0.333, 0, 0.666, 0.5, 0.333, 0.5,
 *       0.666, 0, 1, 0, 1, 0.5,
 *       0.666, 0, 1, 0.5, 0.666, 0.5,
 *       0, 0.5, 0.333, 1, 0, 1,
 *       0, 0.5, 0.333, 0.5, 0.333, 1,
 *       0.333, 0.5, 0.666, 1, 0.333, 1,
 *       0.333, 0.5, 0.666, 0.5, 0.666, 1,
 *       0.666, 0.5, 1, 1, 0.666, 1,
 *       0.666, 0.5, 1, 0.5, 1, 1,
 *     ],
 *     loadColor: [0, 0, 0, 0],
 *   },
 * });
 *
 * @example
 * // Create a a ring around a sphere.
 *
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [1, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 *
 * const { sphere, polygon, revolve } = Fig.tools.g2;
 * const [spherePoints, sphereNormals] = sphere({ radius: 0.15, sides: 40 });
 *
 * // The ring is a flattened doughnut
 * const [ringPoints, ringNormals] = revolve({
 *   profile: polygon({
 *     close: true,
 *     sides: 20,
 *     radius: 0.05,
 *     center: [0, 0.3],
 *     direction: -1,
 *     transform: ['s', 0.1, 1, 1],
 *   }),
 *   normals: 'curve',
 *   sides: 50,
 *   transform: ['dir', [0, 1, 0]],
 * });
 *
 * const a = figure.add({
 *   make: 'generic3',
 *   points: [...spherePoints, ...ringPoints],
 *   normals: [...sphereNormals, ...ringNormals],
 *   color: [1, 0, 0, 1],
 *   transform: ['xyz', 0, 0, 0],
 * });
 *
 * // Animate the shape to slowly rotate around the x and y axes
 * a.animations.new()
 *   .rotation({ velocity: ['xyz', 0.05, 0.1, 0], duration: null })
 *   .start();
 */

export type OBJ_Generic3D = {
  glPrimitive?: 'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES',
  points?: Array<TypeParsablePoint>,
  normals?: Array<TypeParsablePoint>,
  colors?: Array<TypeColor>,
  texture?: OBJ_Texture,
} & OBJ_Generic3DAll & OBJ_FigurePrimitive;

/**
 * Sphere shape
 */
export type OBJ_Sphere = {
  radius?: number,
  sides?: number,
  normals?: 'curve' | 'flat',
} & OBJ_Generic3D;

/**
 * Cube shape
 */
export type OBJ_Cube = {
  side?: number,
  center?: TypeParsablePoint,
  rotation?: TypeParsableRotation,
} & OBJ_Generic3D;

/**
 * {@link morph} options object.
 *
 * @property {string} name primitive name
 * @property {Array<Array<number>>} pointArrays point arrays to morph between.
 * Each point array is an array of consecutive x, y values of points. For
 * example: [x1, y1, x2, y2, x3, y3, ...].
 * @property {TypeColor | Array<TypeColor | Array<TypeColor>>} color colors to
 * be assigned to the points
 * @property {Array<String>} names optional names for each point array. Names
 * can be used when using the morph animation step instead of point array
 * indeces.
 * @property {'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES'} [glPrimitive]
 * glPrimitive is the same for all point arrays (`'TRIANGLES'`)
 */
export type OBJ_Morph = {
  name?: string,
  pointArrays: Array<Array<number>>,
  color: TypeColor | Array<TypeColor | Array<TypeColor>>,
  names: Array<string>,
  glPrimitive: 'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES',
}

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

type OBJ_Polygon_Defined = {
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
  offset: TypeParsablePoint,
} & OBJ_Generic;

type OBJ_Rectangle_Defined = {
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

type OBJ_PolyLineTris = OBJ_LineStyleSimple & { drawBorderBuffer: number | Array<Array<Point>> };


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

// function processOptions(...optionsIn: Array<Object>) {
//   const options = joinObjects({}, ...optionsIn);
//   if (options.position != null) {
//     const p = getPoint(options.position);
//     if (options.transform == null) {
//       options.transform = new Transform('processOptions')0, 0);
//     }
//     options.transform.updateTranslation(p);
//   }
//   return options;
// }

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
  // spaceTransforms: OBJ_SpaceTransforms;
  animateNextFrame: Function;
  draw2DFigures: Object;
  defaultColor: Array<number>;
  defaultDimColor: Array<number>;
  defaultFont: OBJ_Font;
  defaultLineWidth: number;
  defaultLength: number;
  timeKeeper: TimeKeeper;
  recorder: Recorder;
  scene: Scene;

  /**
    * @hideconstructor
    */
  constructor(
    webgl: Array<WebGLInstance> | WebGLInstance,
    draw2D: Array<DrawContext2D> | DrawContext2D,
    // draw2DFigures: Object,
    htmlCanvas: HTMLElement,
    scene: Scene,
    // spaceTransforms: OBJ_SpaceTransforms,
    animateNextFrame: Function,
    defaultColor: Array<number>,
    defaultDimColor: Array<number>,
    defaultFont: OBJ_Font,
    defaultLineWidth: number,
    defaultLength: number,
    timeKeeper: TimeKeeper,
    recorder: Recorder,
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
    this.scene = scene;
    this.animateNextFrame = animateNextFrame;
    // this.spaceTransforms = spaceTransforms;
    this.defaultColor = defaultColor;
    this.defaultDimColor = defaultDimColor;
    this.defaultFont = defaultFont;
    this.defaultLineWidth = defaultLineWidth;
    this.defaultLength = defaultLength;
    this.timeKeeper = timeKeeper;
    this.recorder = recorder;
    // this.draw2DFigures = draw2DFigures;
  }

  // dimension?: 2 | 3,
  // light?: 'directional' | 'point' | null,
  // colors?: 'texture' | 'vertex' | 'uniform' | Array<number> | {
  //   data: Array<number>,
  //   normalized?: boolean,
  //   size?: 3 | 4,
  // },
  // vertices?: OBJ_GLVertexBuffer,
  // normals?: OBJ_GLVertexBuffer,

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  gl(...optionsIn: Array<OBJ_GenericGL>) {
    // Setup the default options
    const oIn = joinObjects({}, ...optionsIn)
    const defaultOptions = {
      glPrimitive: 'TRIANGLES',
      vertexShader: { dimension: 2 },
      fragmentShader: { color: 'uniform' },
      attributes: [],
      texture: {
        src: '',
        mapTo: new Rect(-1, -1, 2, 2),
        mapFrom: new Rect(0, 0, 1, 1),
        mapToAttribute: 'a_vertex',
        repeat: false,
        onLoad: this.animateNextFrame,
        coords: [],
        loadColor: [0, 0, 1, 0.5],
      },
      name: generateUniqueId('primitive_'),
      color: this.defaultColor,
      transform: [['s', 1], ['r', 0, 0, 0], ['t', 0, 0, 0]],
      dimension: 2,
    };
    if (oIn.texture != null) {
      defaultOptions.vertexShader.color = 'texture';
      defaultOptions.fragmentShader.color = 'texture';
    }
    if (oIn.dimension != null) {
      defaultOptions.vertexShader.dimension = oIn.dimension;
    }
    if (oIn.light != null) {
      defaultOptions.vertexShader.light = oIn.light;
      defaultOptions.fragmentShader.light = oIn.light;
    }
    if (oIn.colors != null) {
      defaultOptions.vertexShader.color = 'vertex';
      defaultOptions.fragmentShader.color = 'vertex';
    }

    const options = joinObjects({}, defaultOptions, oIn);
    options.transform = getTransform(options.transform);
    if (options.position != null) {
      options.position = getPoint(options.position);
      options.transform.updateTranslation(options.position);
    }

    const glObject = new GLObject(
      this.webgl[0],
      options.vertexShader,
      options.fragmentShader,
    );

    // Set the glPrimitive
    glObject.setPrimitive(options.glPrimitive);

    // If vertices helper exists, then add the a_vertex attribute
    if (options.vertices != null) {
      if (Array.isArray(options.vertices)) {
        options.attributes.push({
          name: 'a_vertex', data: options.vertices, size: options.dimension,
        });
      } else {
        options.attributes.push({
          name: 'a_vertex',
          data: options.vertices.data,
          size: options.vertices.size || options.dimension,
          usage: options.vertices.usage,
        });
      }
    }
    if (options.normals != null) {
      if (Array.isArray(options.normals)) {
        // glObject.addNormals(options.colors);
        options.attributes.push({
          name: 'a_normal', data: options.normals, size: 3,
        });
      } else {
        // glObject.addNormals(options.normals.data, options.normals.usage);
        options.attributes.push({
          name: 'a_normal', data: options.normals.data, size: 3, usage: options.normals.usage,
        });
      }
    }
    if (options.colors != null) {
      if (Array.isArray(options.colors)) {
        // glObject.addColors(options.colors);
        options.attributes.push({
          name: 'a_color', data: options.colors, size: 4,
        });
      } else if (options.colors.normalize) {
        options.attributes.push({
          name: 'a_color',
          data: options.colors.data,
          size: options.colors.size || 4,
          usage: options.colors.usage,
          type: 'UNSIGNED_BYTE',
          normalize: true,
        });
      } else {
        options.attributes.push({
          name: 'a_color',
          data: options.colors.data,
          size: options.colors.size || 4,
          usage: options.colors.usage,
          type: 'UNSIGNED_BYTE',
          normalize: false,
        });
      }
    }

    if (options.attributes != null) {
      options.attributes.forEach((buffer) => {
        const defaultAttribute = {
          type: 'FLOAT',
          normalize: false,
          stride: 0,
          offset: 0,
          usage: 'STATIC',
          size: 2,
        };
        const b = joinObjects({}, defaultAttribute, buffer);
        glObject.addAttribute(
          b.name, b.size, b.data, b.type,
          b.normalize, b.stride, b.offset, b.usageIn,
        );
      });
      if (options.uniforms != null) {
        options.uniforms.forEach((uniform) => {
          const defaultUniform = {
            type: 'FLOAT',
            length: 1,
          };
          const u = joinObjects({}, defaultUniform, uniform);
          glObject.addUniform(
            u.name, u.length, u.type, u.value,
          );
        });
      }
    }
    if (options.texture.src !== '') {
      const t = options.texture;
      glObject.addTexture(
        t.src, getRect(t.mapFrom), getRect(t.mapTo), t.mapToAttribute,
        t.coords || [], t.repeat, t.onLoad, t.loadColor,
      );
    }

    const element = new FigureElementPrimitive(
      glObject, options.transform, options.color, null, options.name,
    );
    element.custom.updateAttribute =
      element.drawingObject.updateAttribute.bind(element.drawingObject);
    element.custom.updateVertices =
      element.drawingObject.updateVertices.bind(element.drawingObject);
    element.custom.updateUniform = element.drawingObject.updateUniform.bind(element.drawingObject);
    element.custom.getUniform = element.drawingObject.getUniform.bind(element.drawingObject);
    element.dimColor = this.defaultDimColor.slice();

    if (options.move != null && options.move !== false) {
      element.setTouchable();
      element.setMovable();
      element.setMove(options.move);
    }
    if (options.touch != null) {
      element.setTouchable(options.touch);
    }
    if (options.dimColor != null) {
      element.dimColor = options.dimColor;
    }
    if (options.defaultColor != null) {
      element.defaultColor = options.dimColor;
    }
    if (options.scenarios != null) {
      element.scenarios = options.scenarios;
    }

    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }


  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  generic3(...optionsIn: Array<OBJ_Generic3D>) {
    const options = joinObjects({}, {
      dimension: 3, light: 'directional', usage: 'STATIC',
    }, ...optionsIn);

    const processOptions = (o, u) => {
      if (o.usage == null) {
        o.usage = u;
      }
      if (o.points != null) {
        o.vertices = o.points;
      }
      if (o.copy != null) {
        if (o.vertices != null) {
          o.vertices = copyPoints(o.vertices, o.copy, 'points');
        }
        if (o.normals != null) {
          o.normals = copyPoints(o.normals, o.copy, 'normals');
        }
        if (o.colors != null) {
          const count = getCopyCount(o.copy);
          const out = [];
          for (let i = 0; i < count; i += 1) {
            out.push(...o.colors.map(c => c.slice()));
          }
          o.colors = out;
        }
        if (o.texture != null && o.texture.coords != null) {
          const count = getCopyCount(o.copy);
          const out = [];
          for (let i = 0; i < count; i += 1) {
            out.push(...o.texture.coords.slice());
          }
          o.texture.coords = out;
        }
      }
      if (o.points != null) {
        o.vertices = toNumbers(o.vertices);
        o.vertices = { data: o.vertices, usage: o.usage, size: 3 };
      }
      if (o.normals != null) {
        o.normals = toNumbers(o.normals);
        o.normals = { data: o.normals, usage: o.usage, size: 3 };
      }
      if (o.colors != null) {
        o.colors = toNumbers(o.colors);
      }
    };
    processOptions(options, 'STATIC');
    const u = options.usage;
    const element = this.gl(options);

    element.custom.updateGeneric = function update(updateOptions: {
      points?: Array<TypeParsablePoint>,
      normals?: Array<TypeParsablePoint>,
      colors?: Array<number>,
      copy?: Array<CPY_Step>,
      drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    }) {
      const o = updateOptions;
      processOptions(o, u);
      // element.drawingObject.change(o);
      if (o.vertices) {
        element.custom.updateVertices(o.vertices.data);
      }
      if (o.normals) {
        element.custom.updateAttribute('a_normal', o.normals.data);
      }
      if (o.colors) {
        element.custom.updateAttribute('a_color', o.colors);
      }
    };
    element.custom.updatePoints = element.custom.updateGeneric;
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  generic3DBase(
    defaultOptions: Object,
    optionsIn: Object,
    getPointsFn: (Object) => [Array<Point>, Array<Point>],
  ) {
    const element = this.generic3(optionsIn, {
      points: [],
      normals: [],
    });
    element.custom.options = joinObjects({}, defaultOptions, optionsIn);
    element.custom.getPoints = getPointsFn;
    element.custom.updatePoints = (updateOptions: Object) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      element.custom.options = o;
      const [
        points, normals,
      ] = element.custom.getPoints(o);
      element.custom.updateGeneric(joinObjects({}, o, {
        points,
        normals,
      }));
    };
    element.custom.updatePoints();
    return element;
  }

  sphere(...optionsIn: Array<OBJ_Sphere>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength,
        sides: 10,
        normals: 'flat',
        center: [0, 0, 0],
      },
      joinObjects({}, ...optionsIn),
      o => sphere(o),
    );
  }

  cube(...optionsIn: Array<OBJ_Sphere>) {
    return this.generic3DBase(
      {
        side: this.defaultLength,
      },
      joinObjects({}, ...optionsIn),
      o => cube(o),
    );
  }

  rod(...optionsIn: Array<OBJ_Rod>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength / 20,
        sides: 10,
        normals: 'flat',
      },
      joinObjects({}, ...optionsIn),
      o => rod(o),
    );
  }

  cone(...optionsIn: Array<OBJ_Cone>) {
    return this.generic3DBase(
      {
        radius: this.defaultLength / 20,
        sides: 10,
        normals: 'flat',
        length: 1,
      },
      joinObjects({}, ...optionsIn),
      o => cone(o),
    );
  }

  revolve(...optionsIn: Array<OBJ_Revolve>) {
    return this.generic3DBase(
      {
        sides: 10,
        normals: 'flat',
      },
      joinObjects({}, ...optionsIn),
      o => revolve(o),
    );
  }

  surface(...optionsIn: Array<OBJ_Surface>) {
    return this.generic3DBase(
      {
        normals: 'flat',
        lines: false,
      },
      joinObjects({}, ...optionsIn),
      o => surface.surface(o),
    );
  }
  // cube(...optionsIn: Array<OBJ_Cube>) {
  //   const options = joinObjects(
  //     {
  //       side: this.defaultLength,
  //     },
  //     ...optionsIn,
  //   );
  //   const [points, normals] = cube(options);
  //   return this.generic3D(options, {
  //     points,
  //     normals,
  //   });
  // }

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link FigureElementPrimitiveMorph} and {@link OBJ_Morph} for
   * examples and options.
   */
  morph(...optionsIn: Array<OBJ_Morph>) {
    const defaultOptions = {
      name: generateUniqueId('primitive_'),
      color: this.defaultColor,
      points: [],
      glPrimitive: 'TRIANGLES',
      transform: new Transform('morph').scale(1, 1).rotate(0).translate(0, 0),
      position: [0, 0],
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);

    options.transform = getTransform(options.transform);
    if (options.position != null) {
      options.position = getPoint(options.position);
      options.transform.updateTranslation(options.position);
    }

    let colorVertex = false;
    let fragmentShader = 'simple';
    if (Array.isArray(options.color[0])) {
      colorVertex = true;
      fragmentShader = 'vertexColor';
    }

    const glObject = new GLObject(
      this.webgl[0],
      ['morpher', options.points.length, colorVertex],
      fragmentShader,
    );
    glObject.setPrimitive(options.glPrimitive);

    const shapeNameMap = {};
    if (options.names != null) {
      options.names.forEach((name, index) => { shapeNameMap[name] = index; });
    }
    options.points.forEach((points, index) => {
      const attribute = `a_pos${index}`;
      glObject.numVertices = points.length / 2;
      const defaultBuffer = {
        type: 'FLOAT',
        normalize: false,
        stride: 0,
        offset: 0,
        usage: 'STATIC',
        size: 2,
      };
      const b = joinObjects({}, defaultBuffer);
      glObject.addAttribute(
        attribute, b.size, points, b.type,
        b.normalize, b.stride, b.offset, b.usageIn,
      );
    });
    if (colorVertex) {
      options.color.forEach((colorsIn, index) => {
        let colors = colorsIn;
        if (colors.length === 4) {
          colors = Array(4 * glObject.numVertices);
          for (let i = 0; i < colors.length; i += 4) {
            // eslint-disable-next-line
            colors[i] = colorsIn[0];      // eslint-disable-next-line
            colors[i + 1] = colorsIn[1];  // eslint-disable-next-line
            colors[i + 2] = colorsIn[2];  // eslint-disable-next-line
            colors[i + 3] = colorsIn[3];
          }
        }
        const attribute = `a_col${index}`;
        const defaultBuffer = {
          type: 'FLOAT',
          normalize: false,
          stride: 0,
          offset: 0,
          usage: 'STATIC',
          size: 4,
        };
        const b = joinObjects({}, defaultBuffer);
        glObject.addAttribute(
          attribute, b.size, colors, b.type,
          b.normalize, b.stride, b.offset, b.usageIn,
        );
      });
      options.color = this.defaultColor;
    }
    glObject.addUniform('u_from', 1, 'INT');
    glObject.addUniform('u_to', 1, 'INT');
    glObject.addUniform('u_percent', 1, 'FLOAT');

    const element = new FigureElementPrimitiveMorph(
      glObject, options.transform, options.color, null, options.name,
    );
    element.shapeNameMap = shapeNameMap;

    element.setPoints(0);

    element.fnMap.add('_morphCallback', (percentage: number, customProperties: Object) => {
      const { start, target } = customProperties;
      element.setPointsBetween(start, target, percentage);
    });
    element.animations.morph = (...opt) => {
      const o = joinObjects({}, {
        progression: 'easeinout',
        element,
      }, ...opt);
      o.customProperties = {
        start: o.start == null ? 0 : o.start,
        target: o.target == null ? 1 : o.target,
      };
      o.callback = '_morphCallback';
      o.timeKeeper = this.timeKeeper;
      return new CustomAnimationStep(o);
    };
    element.animations.customSteps.push({
      step: element.animations.morph.bind(this),
      name: 'morph',
    });
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a generic shape.
   * @see {@link OBJ_Generic} for options and examples.
   */
  generic(...optionsIn: Array<OBJ_Generic>) {
    const defaultOptions = {
      name: generateUniqueId('primitive_'),
      color: this.defaultColor,
      transform: new Transform('generic').scale(1).rotate(0).translate(),
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
      this.webgl[0],
      options.color,
      options.transform,
      options.texture.src,
      options.texture.mapTo,
      options.texture.mapFrom,
      options.texture.repeat,
      options.texture.onLoad,
      options.name,
      // this.scene,
    );
    element.dimColor = this.defaultDimColor.slice();
    if (options.move != null && options.move !== false) {
      element.setTouchable();
      element.setMovable();
      element.setMove(options.move);
    }
    if (options.touch != null) {
      element.setTouchable(options.touch);
    }
    if (options.dimColor != null) {
      element.dimColor = options.dimColor;
    }
    if (options.defaultColor != null) {
      element.defaultColor = options.dimColor;
    }
    if (options.scenarios != null) {
      element.scenarios = options.scenarios;
    }

    element.custom.updateGeneric = function update(updateOptions: {
      points?: Array<TypeParsablePoint>,
      drawBorder?: TypeParsableBorder,
      drawBorderBuffer?: TypeParsableBorder,
      border?: TypeParsableBorder | 'draw' | 'buffer' | 'rect' | number,
      touchBorder?: TypeParsableBorder | 'draw' | 'border' | 'rect' | number | 'buffer',
      copy?: Array<CPY_Step>,
      drawType?: 'triangles' | 'strip' | 'fan' | 'lines',
    }) {
      const o = updateOptions;
      if (o.copy != null && !Array.isArray(o.copy)) {
        o.copy = [o.copy];
      }
      if (o.points != null) { // $FlowFixMe
        o.points = getPoints(o.points);
      }
      if (o.drawBorder != null) { // $FlowFixMe
        element.drawBorder = getBorder(o.drawBorder);
      } else if (o.points != null) {
        element.drawBorder = [o.points];
      }
      if (o.drawBorderBuffer != null) { // $FlowFixMe
        element.drawBorderBuffer = getBorder(o.drawBorderBuffer);
      } else element.drawBorderBuffer = element.drawBorder;
      if (o.border != null) { // $FlowFixMe
        element.border = getBorder(o.border);
      }
      if (o.touchBorder != null) { // $FlowFixMe
        element.touchBorder = getBorder(o.touchBorder);
      }
      element.drawingObject.change(o);
    };
    element.custom.updateGeneric(options);
    element.custom.updatePoints = element.custom.updateGeneric;
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;
    setupPulse(element, options);
    return element;
  }

  getPolylineTris(
    optionsIn: OBJ_PolyLineTris,
  ) {
    const defaultOptions = {
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
      drawBorder: 'negative',
      drawBorderBuffer: 0,
      simple: false,
    };
    const o = joinObjects({}, defaultOptions, optionsIn);
    if (o.linePrimitives === false) {
      o.lineNum = 2;
    }
    parsePoints(o, ['points', 'border', 'touchBorder']);

    let points;
    let drawBorder;
    let drawBorderBuffer;
    if (o.simple) {
      [points, drawBorder, drawBorderBuffer] = makeFastPolyLine(
        o.points, o.width, o.close,
      );
    } else if (o.cornersOnly) {
      [points, drawBorder, drawBorderBuffer] = makePolyLineCorners(
        o.points, o.width, o.close, o.cornerLength, o.widthIs, o.cornerStyle,
        o.cornerSize, o.cornerSides, o.minAutoCornerAngle, o.linePrimitives,
        o.lineNum, o.drawBorderBuffer,
      );
    } else {
      [points, drawBorder, drawBorderBuffer] = makePolyLine(
        o.points, o.width, o.close, o.widthIs, o.cornerStyle, o.cornerSize,
        o.cornerSides, o.minAutoCornerAngle, o.dash, o.linePrimitives,
        o.lineNum, o.drawBorder, o.drawBorderBuffer, o.arrow,
      );
    }
    if (Array.isArray(o.drawBorderBuffer)) {
      drawBorderBuffer = getBorder(o.drawBorderBuffer);
    }
    if (Array.isArray(o.drawBorder)) {
      drawBorder = getBorder(o.drawBorder);
    }
    if (drawBorderBuffer == null) {
      drawBorderBuffer = drawBorder;
    }
    let drawType = 'triangles';
    if (o.linePrimitives) {
      drawType = 'lines';
    }
    if (o.simple) {
      drawType = 'strip';
    }
    return [o, points, drawBorder, drawBorderBuffer, drawType];
  }

  /**
   * {@link FigureElementPrimitive} that draws a polyline.
   * @see {@link OBJ_Polyline} for options and examples.
   */
  polyline(...optionsIn: Array<OBJ_Polyline>) {
    const options = joinObjects({}, ...optionsIn);
    const element = this.generic({
      transform: new Transform('polyline').scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border',   // $FlowFixMe
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
      drawBorderBuffer: 0,
    };
    element.custom.updatePoints = (updateOptions: OBJ_Polyline) => {
      const [o, points, drawBorder, drawBorderBuffer, drawType] =
        this.getPolylineTris(joinObjects({}, element.custom.options, updateOptions));
      element.custom.options = o;
      element.custom.updateGeneric(joinObjects({}, o, {
        points, drawBorder, drawBorderBuffer, drawType,
      }));
    };

    element.custom.updatePoints(options);

    // getTris(options);
    // setupPulse(element, options);
    return element;
  }

  getPolygonBorder(optionsIn: OBJ_Polygon_Defined) {
    const o = optionsIn;
    parsePoints(o, ['offset']);
    if (o.angleToDraw != null) {
      o.sidesToDraw = Math.floor(
        o.angleToDraw / (Math.PI * 2 / o.sides),
      );
    }
    if (o.sidesToDraw == null) {
      o.sidesToDraw = o.sides;
    }
    if (o.sidesToDraw > o.sides) {
      o.sidesToDraw = o.sides;
    }
    const points = getPolygonPoints(o);
    // let { drawBorderBuffer } = o;
    let drawBorderOffset = 0;
    let drawBorder;
    if (o.line != null) {
      o.line = joinObjects({}, {
        width: this.defaultLineWidth,
        widthIs: 'mid',
      }, o.line);
      if (o.line.widthIs === 'inside' && o.direction === 1) {
        o.line.widthIs = 'positive';
      } else if (o.line.widthIs === 'inside' && o.direction === -1) {
        o.line.widthIs = 'negative';
      }
      if (o.line.widthIs === 'outside' && o.direction === 1) {
        o.line.widthIs = 'negative';
      } else if (o.line.widthIs === 'outside' && o.direction === -1) {
        o.line.widthIs = 'positive';
      }
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
      if (o.sidesToDraw === o.sides) {
        o.line.close = true;
      } else {
        o.line.close = false;
      }
    } else if (o.sidesToDraw !== o.sides && o.line == null) {
      points.push(o.offset);
    }
    if (drawBorderOffset === 0) {
      drawBorder = [points];
    } else {
      drawBorder = [getPolygonPoints(joinObjects(
        {}, o, { radius: o.radius + drawBorderOffset },
      ))];
    }
    return [o, points, drawBorder, 'triangles'];
  }


  genericBase(
    name: string,
    defaultOptions: Object,
    optionsIn: Object,
  ) {
    const element = this.generic({
      transform: new Transform(name).scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border',   // $FlowFixMe
    }, optionsIn);

    element.custom.options = defaultOptions;

    element.custom.getFill = () => [];
    // element.custom.getLine = () => [];
    element.custom.close = true;
    element.custom.skipConcave = true;
    element.custom.bufferOffset = 'negative';
    element.custom.getLine = (o: OBJ_PolyLineTris) => {  // $FlowFixMe
      if (!element.custom.close && o.drawBorder == null) {   // $FlowFixMe
        o.drawBorder = 'line';
      }
      return this.getPolylineTris(o);
    };
    element.custom.getBorder = () => [];
    element.custom.updatePoints = (updateOptions: Object) => {
      const borderOptions = joinObjects({}, element.custom.options, updateOptions);
      const [o, border] = element.custom.getBorder(borderOptions);
      if (o.line == null) {
        const [
          points, drawType,
        ] = element.custom.getFill(border, o);
        element.custom.options = o;
        element.custom.updateGeneric(joinObjects({}, o, {
          points,
          drawBorder: border,
          drawBorderBuffer: getBufferBorder(
            [border],
            o.drawBorderBuffer,
            element.custom.skipConcave,
            element.custom.bufferOffset,
          ),
          drawType,
        }));
      } else {
        if (
          o.line.widthIs == null
        ) {
          o.line.widthIs = 'mid';
        }
        if (element.custom.close) {
          o.line.close = true;
        }
        let bufferOffsetToUse = 'negative';
        if (element.custom.bufferOffset === 'positive' && o.line.close) {
          o.line.drawBorder = 'positive';
          bufferOffsetToUse = 'positive';
        }
        const [
          polylineOptions, points, drawBorder, , drawType,
        ] = element.custom.getLine(joinObjects(
          {},
          o.line,
          {
            points: border,
          },
        ));
        element.custom.options = o;
        element.custom.options.line = polylineOptions;
        if (element.custom.bufferOffset === 'positive') {
          drawBorder.reverse();
        }
        const drawBorderBuffer = getBufferBorder(
          drawBorder,
          o.drawBorderBuffer,
          element.custom.skipConcave,
          bufferOffsetToUse,
        );
        element.custom.updateGeneric(joinObjects({}, o, {
          points, drawBorder, drawBorderBuffer, drawType,
        }));
      }
    };
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a regular polygon.
   * @see {@link OBJ_Polygon} for options and examples.
   */
  polygon(...options: Array<OBJ_Polygon>) {
    const element = this.genericBase('polygon', {
      radius: 1,
      sides: 4,
      direction: 1,
      rotation: 0,
      offset: new Point(0, 0),
    }, joinObjects({}, ...options));
    element.custom.getBorder = (o: OBJ_Polygon_Defined) => {
      const border = this.getPolygonBorder(o);
      if (o.sidesToDraw !== o.sides) {
        element.custom.close = false;
      } else {
        element.custom.close = true;
      }
      element.custom.skipConcave = false;
      if (o.direction === -1) {
        element.custom.bufferOffset = 'positive';
      } else {
        element.custom.bufferOffset = 'negative';
      }
      return border;
    };
    element.custom.getFill = (border: Array<Point>, fillOptions: OBJ_Polygon_Defined) => [
      getTrisFillPolygon(
        fillOptions.offset,
        border,
        fillOptions.sides, fillOptions.sidesToDraw,
      ),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);

    // $FlowFixMe
    element.drawingObject.getPointCountForAngle = (angle: number) => {
      const optionsToUse = element.custom.options;
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
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a star.
   * @see {@link OBJ_Star} for options and examples.
   */
  star(...options: Array<OBJ_Star>) {
    const element = this.genericBase('star', {
      radius: 1,
      sides: 5,
      direction: 1,
      rotation: 0,
      offset: new Point(0, 0),
    }, joinObjects({}, ...options));
    element.custom.getBorder = (o: OBJ_Polygon_Defined) => {
      if (o.innerRadius == null) {
        o.innerRadius = o.radius / 3;
      }
      o.rotation += Math.PI / 2;
      o.sidesToDraw = o.sides;
      const result = this.getPolygonBorder(o);
      result[0].rotation -= Math.PI / 2;
      return result;
    };
    element.custom.getFill = (border: Array<Point>, fillOptions: OBJ_Polygon_Defined) => [
      getTrisFillPolygon(
        fillOptions.offset, border,
        fillOptions.sides, fillOptions.sidesToDraw,
      ),
      'triangles',
    ];

    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a rectangle.
   * @see {@link OBJ_Rectangle} for options and examples.
   */
  rectangle(...options: Array<OBJ_Rectangle>) {
    const element = this.genericBase('rectangle', {
      width: this.defaultLength,
      height: this.defaultLength / 2,
      xAlign: 'center',
      yAlign: 'middle',
      corner: {
        radius: 0,
        sides: 1,
      },
      offset: [0, 0],
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Rectangle_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      if (o.offset != null) {
        o.offset = getPoint(o.offset);
      }
      return [o, getRectangleBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      rectangleBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws an ellipse.
   * @see {@link OBJ_Ellipse} for options and examples.
   */
  ellipse(...options: Array<OBJ_Ellipse>) {
    const element = this.genericBase('ellipse', {
      width: this.defaultLength,
      height: this.defaultLength / 2,
      xAlign: 'center',
      yAlign: 'middle',
      sides: 20,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Ellipse_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      return [o, getEllipseBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      ellipseBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws an ellipse.
   * @see {@link OBJ_Arc} for options and examples.
   */
  arc(...options: Array<OBJ_Arc>) {
    const element = this.genericBase('arc', {
      radius: this.defaultLength / 2,
      sides: 20,
      startAngle: 0,
      angle: 1,
      offset: [0, 0],
      fillCenter: false,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Arc_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      if (o.offset != null) {
        o.offset = getPoint(o.offset);
      }
      element.custom.close = false;
      return [o, getArcBorder(o)];
    };
    element.custom.getFill = (border: Array<Point>) => [
      arcBorderToTris(border),
      'triangles',
    ];
    // element.custom.getLine = (o: OBJ_PolyLineTris) => this.getPolylineTris(o);
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a triangle.
   * @see {@link OBJ_Triangle} for options and examples.
   */
  triangle(...options: Array<OBJ_Triangle>) {
    const element = this.genericBase('triangle', {
      width: this.defaultLength,
      height: this.defaultLength,
      // xAlign: 'centroid',
      // yAlign: 'centroid',
      top: 'center',
      direction: 1,
      rotation: 0,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Triangle_Defined) => {
      if (o.xAlign == null) {
        if (o.points != null) {
          o.xAlign = 'points';
        } else {
          o.xAlign = 'centroid';
        }
      }
      if (o.yAlign == null) {
        if (o.points != null) {
          o.yAlign = 'points';
        } else {
          o.yAlign = 'centroid';
        }
      }
      // if (o.line != null && o.line.widthIs === 'inside') {
      //   o.line.widthIs = 'positive';
      // }
      // if (o.line != null && o.line.widthIs === 'outside') {
      //   o.line.widthIs = 'negative';
      // }
      // if (o.direction === -1) {
      //   element.custom.bufferOffset = 'positive';
      // } else {
      //   element.custom.bufferOffset = 'negative';
      // }
      const border = getTriangleBorder(o);
      if (o.direction === -1 || getTriangleDirection(border) === -1) {
        border.reverse();
      }

      return [o, border];
    };

    // element.custom.getBorder = (o: OBJ_Triangle_Defined) => [
    //   o, ...getTriangleBorder(o),
    // ];
    element.custom.getFill = (border: Array<Point>) => [
      border,
      'triangles',
    ];
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Arrow} for options and examples.
   */
  arrow(...options: Array<OBJ_Arrow>) {
    const element = this.genericBase('arrow', {
      length: this.defaultLength / 2,
      width: this.defaultLength / 2,
      head: 'triangle',
      sides: 20,
      radius: this.defaultLength / 4,
      rotation: 0,
      angle: 0,
      tail: false,
      drawPosition: new Point(0, 0),
      // barb: this.defaultLength / 8,
    }, joinObjects({}, ...options));

    element.custom.getBorder = (o: OBJ_Triangle_Defined) => {
      if (o.line != null && o.line.widthIs === 'inside') {
        o.line.widthIs = 'positive';
      }
      if (o.line != null && o.line.widthIs === 'outside') {
        o.line.widthIs = 'negative';
      }
      const optionsWithDefaultArrow = defaultArrowOptions(o);
      const [border, borderBuffer] = getArrow(optionsWithDefaultArrow);
      return [
        optionsWithDefaultArrow, border, borderBuffer,
      ];
    };
    element.custom.getFill = (border: Array<Point>, o: Object) => [
      getArrowTris(border, o),
      'triangles',
    ];
    element.custom.updatePoints(joinObjects({}, ...options));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a grid.
   * @see {@link OBJ_Grid} for options and examples.
   */
  grid(...optionsIn: Array<OBJ_Grid>) {
    const element = this.generic({
      transform: new Transform('grid').scale(1).rotate(0).translate(),
      border: 'draw',
      touchBorder: 'border', // $FlowFixMe
    }, ...optionsIn);

    element.custom.options = {
      bounds: new Rect(
        this.scene.left,
        this.scene.bottom,
        this.scene.right - this.scene.left,
        this.scene.top - this.scene.bottom,
      ),
      line: {
        linePrimitives: false,
        width: this.defaultLineWidth,
        lineNum: 2,
        dash: [],
      },
    };

    const getTris = points => makePolyLine(
      points,
      element.custom.options.line.width,
      false,
      'mid',
      'auto', // cornerStyle doesn't matter
      0.1,    // cornerSize doesn't matter
      1,      // cornerSides,
      Math.PI / 7, // minAutoCornerAngle,
      element.custom.options.line.dash,
      element.custom.options.line.linePrimitives,
      element.custom.options.line.lineNum,
      [[]],
      0,
    );

    element.custom.updatePoints = (updateOptions: Object) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      element.custom.options = o;
      // Prioritize Num over Step. Only define Num from Step if Num is undefined.
      const bounds = getRect(o.bounds);

      let {
        xStep, xNum, yStep, yNum,
      } = o;
      let { width } = o.line;
      if (o.line.linePrimitives && o.line.lineNum === 1) {
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
      const border = [
        start.add(-width / 2, -width / 2),
        start.add(totWidth + width / 2, -width / 2),
        start.add(totWidth + width / 2, totHeight + width / 2),
        start.add(-width / 2, totHeight + width / 2),
      ];
      let drawBorder;
      if (o.drawBorder != null) {
        drawBorder = getBorder(o.drawBorder);
      } else {
        drawBorder = [border];
      }
      let { drawBorderBuffer } = o;
      if (typeof o.drawBorderBuffer === 'number') {
        drawBorderBuffer = drawBorder;
        if (o.drawBorderBuffer !== 0) {
          const buf = o.drawBorderBuffer;
          drawBorderBuffer = [[
            border[0].add(-buf, -buf),
            border[1].add(buf, -buf),
            border[2].add(buf, buf),
            border[3].add(-buf, buf),
          ]];
        }
      }
      element.custom.updateGeneric(joinObjects({}, o, {
        points: [...xTris, ...yTris],
        drawBorder,
        drawBorderBuffer,
        drawType: o.line.linePrimitives ? 'lines' : 'triangles',
      }));
    };
    element.custom.updatePoints(joinObjects({}, ...optionsIn));
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws a line.
   * @see {@link OBJ_Line} for options and examples.
   */
  line(...options: OBJ_Line) { // $FlowFixMe
    const element = this.polyline(joinObjects(
      {},
      {
        transform: new Transform('line').scale(1).rotate(0).translate(),
      },
      ...options,
      {
        points: [[0, 0], [0, 1]],
        dash: [],
        arrow: null,
      },
    )); // $FlowFixMe
    const joinedOptions = joinObjects({}, ...options);
    element.custom.options = joinObjects(
      {},
      element.custom.options,
      {
        p1: [0, 0],
        angle: 0,
        length: this.defaultLength,
        width: this.defaultLineWidth,
      },
    );

    // element.custom.setupLine = (p, o) => {
    //   if (o.dash.length > 1) {
    //     const maxLength = p[0].distance(p[1]);
    //     const dashCumLength = [];
    //     let cumLength = 0;
    //     if (o.dash) {
    //       let dashToUse = o.dash;
    //       let offset = 0;
    //       if (o.dash % 2 === 1) {
    //         dashToUse = o.dash.slice(1);
    //         [offset] = o.dash;
    //         // cumLength = offset;
    //       }
    //       while (cumLength < maxLength) {
    //         for (let i = 0; i < dashToUse.length && cumLength < maxLength; i += 1) {
    //           let length = dashToUse[i];
    //           if (length + cumLength > maxLength) {
    //             length = maxLength - cumLength;
    //           }
    //           cumLength += length;
    //           dashCumLength.push(cumLength);
    //         }
    //       }
    //       element.custom.dashCumLength = dashCumLength;
    //       element.custom.maxLength = maxLength;
    //     }
    //   }
    // };

    element.custom.updatePolyline = element.custom.updatePoints;
    element.custom.updatePoints = (updateOptions) => {
      const o = joinObjects({}, element.custom.options, updateOptions);
      const [updatedPoints, updatedBorder, updatedTouchBorder] = getLine(o);
      // element.custom.setupLine(updatedPoints, o);
      element.custom.updatePolyline(joinObjects({}, o, {
        points: updatedPoints,
        border: updatedBorder,
        touchBorder: updatedTouchBorder,
      }));
    };
    // element.drawingObject.getPointCountForLength = (drawLength: number = this.maxLength) => {
    //   if (drawLength >= element.custom.maxLength) { // $FlowFixMe
    //     return element.drawingObject.numPoints;
    //   }
    //   if (drawLength < element.custom.dashCumLength[0]) {
    //     return 0;
    //   }
    //   for (let i = 0; i < element.custom.dashCumLength.length; i += 1) {
    //     const cumLength = element.custom.dashCumLength[i];
    //     if (cumLength > drawLength) {
    //       return (Math.floor((i - 1) / 2) + 1) * 6;
    //     }
    //   } // $FlowFixMe
    //   return element.drawingObject.numPoints;
    // };

    element.custom.updatePoints(joinedOptions);
    return element;
  }


  textGL(options: Object) {
    return Text(
      this.webgl[0],
      options,
    );
  }


  /*
  .......########.########.##.....##.########
  ..........##....##........##...##.....##...
  ..........##....##.........##.##......##...
  ..........##....######......###.......##...
  ..........##....##.........##.##......##...
  ..........##....##........##...##.....##...
  ..........##....########.##.....##....##...
  */
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
      border: 'draw',
      touchBorder: 'buffer',
      defaultTextTouchBorder: 0,
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

    // // Define standard transform if no transform was input
    // if (options.transform == null) {
    //   options.transform = new Transform('text').translate();
    // } else {
    //   options.transform = getTransform(options.transform);
    // }

    // // Override transform if position is defined
    // if (options.position != null) {
    //   const p = getPoint(options.position);
    //   options.transform.updateTranslation(p);
    // }

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
      // parsePoints(options, ['touchBorder']);
      options.touchBorder = getBorder(options.touchBorder);
    }

    if (options.border != null && Array.isArray(options.border)) {
      // parsePoints(options, ['border']);
      options.border = getBorder(options.border);
    }

    return options;
  }

  genericTextPrimitive(
    drawingObject: DrawingObject, optionsIn: Object,
  ) {
    const options = optionsIn;
    // Define standard transform if no transform was input
    if (options.transform == null) {
      options.transform = new Transform('text').scale(1).rotate(0).translate();
    } else {
      options.transform = getTransform(options.transform);
    }

    // Override transform if position is defined
    if (options.position != null) {
      const p = getPoint(options.position);
      options.transform.updateTranslation(p);
    }

    const element = new FigureElementPrimitive(
      drawingObject,
      options.transform,
      options.color,
    );
    element.timeKeeper = this.timeKeeper;
    element.recorder = this.recorder;

    setupPulse(element, options);
    if (options.mods != null && options.mods !== {}) {
      element.setProperties(options.mods);
    }
    element.custom.updateBorders = (o) => {
      element.drawBorder = element.drawingObject.textBorder;
      if (o.drawBorder != null) {
        element.drawBorder = o.drawBorder;
      }
      element.drawBorderBuffer = element.drawingObject.textBorderBuffer;
      if (o.drawBorderBuffer != null) {
        element.drawBorderBuffer = o.drawBorderBuffer;
      }
      if (o.border != null) {
        element.border = o.border;
      }
      if (o.touchBorder != null) {
        element.touchBorder = o.touchBorder;
      }
    }; // $FlowFixMe
    element.getBorderPointsSuper = element.getBorderPoints; // $FlowFixMe
    element.getBorderPoints = (border: 'border' | 'touchBorder' = 'border') => {
      if (border === 'border') { // $FlowFixMe
        return element.getBorderPointsSuper(border);
      }
      // if (border === 'touchBorder') {
      if (element.touchBorder === 'draw') {
        return element.drawBorder;
      }
      if (element.touchBorder === 'buffer') {
        return element.drawBorderBuffer;
      }
      if (element.touchBorder === 'border') {
        return element.getBorderPoints('border');
      }
      if (element.touchBorder === 'rect') {
        return [getBoundingBorder(element.drawBorderBuffer)];
      }
      if (isBuffer(element.touchBorder)) {
        const b = element.drawBorderBuffer; // $FlowFixMe
        return [getBoundingBorder(b, element.touchBorder)];
      }
      return element.touchBorder;
      // }
    };
    element.custom.setText = (o: string | OBJ_TextDefinition, index: number = 0) => {
      element.drawingObject.setText(o, index);
      element.custom.updateBorders({});
    };
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
    const element = this.genericTextPrimitive(to, options);
    element.custom.options = to;
    element.custom.updateText = (o: OBJ_Text) => { // $FlowFixMe
      element.drawingObject.clear();
      const parsed = this.parseTextOptions(
        { border: 'rect', touchBorder: 'rect' },
        element.custom.options,
        o,
      ); // $FlowFixMe
      element.drawingObject.loadText(parsed);
      element.custom.options = parsed;
      element.custom.updateBorders({});
    };
    element.custom.updateBorders(options);
    return element;
  }

  /**
   * {@link FigureElementPrimitive} that draws text lines.
   * @see {@link OBJ_TextLines} for options and examples.
   */
  textLines(...optionsIn: Array<OBJ_TextLines | string>) {
    const joinedOptions = joinObjects({}, { color: this.defaultColor }, ...optionsIn);
    const to = new TextLinesObject(this.draw2D);
    const element = this.genericTextPrimitive(to, joinedOptions);
    element.custom.options = joinedOptions;
    element.custom.updateText = (oIn: OBJ_Text) => {
      // $FlowFixMe
      element.drawingObject.clear();
      let oToUse = oIn; // $FlowFixMe
      if (oIn.length === 1 && typeof oIn[0] === 'string') {
        oToUse = [{ text: [optionsIn[0]] }];
      }
      const o = this.parseTextOptions(
        { border: 'rect', touchBorder: 'rect' },
        element.custom.options,
        oToUse,
      );
      if (o.justify == null) {
        o.justify = 'left';
      }
      if (o.lineSpace == null) {
        o.lineSpace = o.font.size * 1.2;
      }
      element.custom.options = o;  // $FlowFixMe
      element.drawingObject.loadText(o);
      element.custom.updateBorders(o);
    };
    element.custom.updateText(joinedOptions);
    return element;
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
    const element = this.genericTextPrimitive(to, options);
    element.custom.options = options;
    element.custom.updateText = (o: OBJ_Text) => { // $FlowFixMe
      element.drawingObject.clear(); // $FlowFixMe
      element.drawingObject.loadText(this.parseTextOptions(element.custom.options, o));
      element.custom.updateBorders({});
      element.animateNextFrame();
    };
    element.custom.updateBorders(options);
    return element;
  }

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
    );
    figureElement.timeKeeper = this.timeKeeper;
    figureElement.recorder = this.recorder;
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
    );
    figureElement.timeKeeper = this.timeKeeper;
    figureElement.recorder = this.recorder;
    return figureElement;
  }


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
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    const image = document.createElement('img');
    image.src = options.src;

    const {
      id, classes, position, yAlign, xAlign,
    } = options;
    const element = this.htmlElement(image, id, classes, getPoint(position), yAlign, xAlign);
    if (options.color != null) {
      element.setColor(options.color);
    }
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
}

export type TypeFigurePrimitives = FigurePrimitives;
