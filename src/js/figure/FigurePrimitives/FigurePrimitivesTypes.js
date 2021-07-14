// @flow
import type {
  TypeParsablePoint, TypeParsableTransform,
  TypeParsableBorder, Rect,
} from '../../tools/g2';
import type { FigureElement, TypeScenarios, OBJ_ElementMove } from '../Element';
import type { TypeGLUniform, TypeGLBufferType, TypeGLBufferUsage } from '../DrawingObjects/GLObject/GLObject';
import type {
  TypeColor, TypeDash,
} from '../../tools/types';
import type Scene from '../../tools/scene';
import type { TypeVertexShader, TypeFragmentShader } from '../webgl/shaders';

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
type OBJ_LineStyleSimple = {
  widthIs?: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number,
  width?: number,
  dash?: TypeDash,
  color?: TypeColor,
};

type OBJ_LineStyleSimple_Defined = {
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number,
  width: number,
  dash?: TypeDash,
  color?: TypeColor,
};

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
type OBJ_Collection = {
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
type OBJ_Texture = {
  src?: string,
  mapFrom?: Rect,
  mapTo?: Rect,
  mapToAttribute?: string,
  coords?: Array<number>,
  loadColor?: TypeColor,
  repeat?: boolean,
  onLoad?: () => void,
};

/**
 * Pulse options object
 *
 * @property {number} [scale] scale to pulse
 * @property {number} [duration] duration to pulse
 * @property {number} [frequency] frequency to pulse where 0
 */
type OBJ_PulseScale = {
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
type OBJ_GLBuffer = {
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
type OBJ_GLVertexBuffer = {
  data: Array<number>,
  usage: TypeGLBufferUsage,
};

/**
 * GL Uniform
 * @property {string} name name of uniform in shader
 * @property {1 | 2 | 3 | 4} length
 * @property {TypeGLUniform} type
 */
type OBJ_GLUniform = {
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
type OBJ_FigurePrimitive = {
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
};

/**
 * Color definition for a gl primitive.
 * @property {Array<number>} data color data
 * @property {boolean} [normalize] if `true`, then color data values are between
 * 0 and 255 (`false`)
 * @property {3 | 4} [size] if `3`, then color data is RGB, if `4` then color
 * data is RGBA
 */
type OBJ_GLColorData = {
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
type OBJ_GenericGL = {
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

export type {
  OBJ_LineStyleSimple,
  OBJ_LineStyleSimple_Defined,
  OBJ_Collection,
  OBJ_Texture,
  OBJ_PulseScale,
  OBJ_GLBuffer,
  OBJ_GLVertexBuffer,
  OBJ_GLUniform,
  OBJ_FigurePrimitive,
  OBJ_GLColorData,
  OBJ_GenericGL,
};

function a() {

}
export {
  a,
};
