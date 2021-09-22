// @flow
import type { TypeGLBufferUsage } from '../DrawingObjects/GLObject/GLObject';
import type { CPY_Step } from '../geometries/copy/copy';
import type { TypeParsablePoint } from '../../tools/geometry/Point';
import type Scene from '../../tools/geometry/scene';
import type { TypeColor } from '../../tools/types';
import type { TypeParsableLine } from '../../tools/geometry/Line';
import type { OBJ_Line3Arrow } from '../../tools/d3/line3';
import type {
  OBJ_Texture, OBJ_FigurePrimitive,
} from './FigurePrimitiveTypes';

/**
 * @property {'directional' | 'point' | null} [light] the scene light that will
 * be cast on the shape. Use `null` for no lighting - all surfaces will have
 * the defined color. (`'directional'`)
 * @property {Array<CPY_Step | string> | CPY_Step} [copy] Create copies the
 * shapes vertices to replicate the shape in space. Copies of normals, colors
 * (if defined) and texture coordinates (if defined) will also be made.
 * @property {TypeGLBufferUsage} [usage] use `'DYNAMIC'` if the shape's vertices
 * will be updated very frequently (`'STATIC'`)
 */
export type OBJ_Generic3All = {
  light?: 'directional' | 'point' | 'ambient' | null,
  copy?: Array<CPY_Step | string> | CPY_Step,
  usage?: TypeGLBufferUsage,
  touchScale?: number | TypeParsablePoint,
};

/**
 * Options object for a {@link FigureElementPrimitive} of a generic 3D shape.
 * Extends {@link OBJ_Generic3All} and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/generic3.png)
 *
 * ![](./apiassets/generic3.gif)
 *
 * {@link OBJ_GenericGL} can be used for shape creation with custom shaders.
 *
 * But for many custom shapes, only points and normals of the shape need to be
 * defined, without needing to customize the shaders.
 *
 * {@link OBJ_Generic3} Provides the ability to create many custom shapes that
 * don't need shader customization.
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
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Cubes with texture on each face
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [1, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 *
 * const [points, normals] = Fig.cube({ side: 0.8 });
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
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [1, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 * const { sphere, polygon, revolve } = Fig;
 * const [spherePoints, sphereNormals] = sphere({ radius: 0.15 });
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
 *   transform: ['d', 0, 1, 0],
 * });
 * const a = figure.add({
 *   make: 'generic3',
 *   points: [...spherePoints, ...ringPoints],
 *   normals: [...sphereNormals, ...ringNormals],
 *   color: [1, 0, 0, 1],
 *   transform: [['r', 0.15, 1, 0, 0], ['r', 0.3, 0, 1, 0]],
 * });
 * // Animate the shape to slowly rotate around the x and y axes
 * a.animations.new()
 *   .custom({
 *     callback: (t) => {
 *       a.transform.updateRotation(t * 0.15);
 *       a.transform.updateRotation(t * 0.3, null, 1);
 *     },
 *     duration: null,
 *   })
 *   .start();
 */

export type OBJ_Generic3 = {
  glPrimitive?: 'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES',
  points?: Array<TypeParsablePoint>,
  normals?: Array<TypeParsablePoint>,
  colors?: Array<TypeColor>,
  texture?: OBJ_Texture,
} & OBJ_Generic3All & OBJ_FigurePrimitive;

/**
 * Sphere shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/sphere.png)
 *
 * By default, a sphere with its center at the origin will be created.
 *
 * @property {number} [sides] number of sides around sphere's half great circle
 * (`10`)
 * @property {number} [radius] radius of sphere (`1`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make light
 * shading across a face cone constant. `curve` will gradiate the shading. Use
 * `curve` to make a surface look more round with fewer number of sides.
 * (`flat`)
 * @property {TypeParsablePoint} [center] center position of sphere (`[0, 0]`)
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add({
 *   make: 'sphere',
 *   radius: 0.5,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Sphere with 'curve' normals
 * figure.add({
 *   make: 'sphere',
 *   radius: 0.5,
 *   normals: 'curve',
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Wire mesh sphere
 * figure.add({
 *   make: 'sphere',
 *   radius: 0.5,
 *   sides: 30,
 *   lines: true,
 *   normals: 'curve',
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Ring of spheres, rotated to by in xz plane
 * figure.add({
 *   make: 'sphere',
 *   radius: 0.1,
 *   color: [1, 0, 0, 1],
 *   center: [0.3, 0, 0],
 *   normals: 'curve',
 *   copy: [
 *     { along: 'rotation', num: 10, step: Math.PI * 2 / 10 },
 *   ],
 *   transform: ['r', Math.PI / 2, 1, 0, 0],
 * });
 */
export type OBJ_Sphere = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  center?: TypeParsablePoint,
  lines?: boolean,
} & OBJ_Generic3All & OBJ_FigurePrimitive;

/**
 * Cube shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/cube.png)
 *
 * By default, a cube will be constructed around the origin, with the xyz axes
 * being normal to the cube faces.
 *
 * @property {number} [side] side length (`1`)
 * @property {TypeParsablePoint} [center] center point (`[0, 0]`)
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the 12 edges of the cube will be returned. If `false`, then points
 * representing two triangles per face (12 triangles, 36 points) and an
 * associated normal for each point will be returned. (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add({
 *   make: 'cube',
 *   side: 0.5,
 *   color: [1, 0, 0, 1],
 * });
 *
 *
 * @example
 * // 3x3 grid of cubes
 * figure.add({
 *   make: 'cube',
 *   side: 0.2,
 *   color: [1, 0, 0, 1],
 *   copy: [
 *     { along: 'x', num: 2, step: 0.22 },
 *     { along: 'y', num: 2, step: 0.22 },
 *     { along: 'z', num: 2, step: 0.22 },
 *   ],
 * });
 *
 * @example
 * // Wire mesh cube
 * figure.add({
 *   make: 'cube',
 *   side: 0.5,
 *   lines: true,
 *   color: [1, 0, 0, 1],
 * });
 */
export type OBJ_Cube = {
  side?: number,
  center?: TypeParsablePoint,
  lines?: boolean,
} & OBJ_FigurePrimitive & OBJ_Generic3All;

/**
 * Cylinder shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/cylinder.png)
 *
 * By default, a cylinder along the x axis will be created.
 *
 * @property {number} [sides] number of cylinder sides (`10`)
 * @property {number} [radius] radius of cylinder (`1`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make
 * shading (from light source) across a face cone constant.
 * `curve` will gradiate the shading. Use `curve` to make a surface look more
 * round with fewer number of sides. (`flat`)
* @property {TypeParsableLine} [line] line that can position and
 * orient the cylinder. First point of line is cylinder base center, and second
 * point is the top center.
 * @property {number} [length] length of the cylinder if `line` isn't
 * defined (`1`)
 * @property {boolean | 1 | 2} [ends] `true` fills both ends of the cylinder.
 * `false` does not fill ends. `1` fills only the first end. `2` fills only the
 * the second end. (`true`)
 * @property {number} [rotation] rotation of base - this is only noticable for
 * small numbers of sides (`0`)
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add({
 *   make: 'cylinder',
 *   radius: 0.2,
 *   length: 0.5,
 *   sides: 20,
 *   color: [1, 0, 0, 1],
 * });
 *
 *
 * @example
 * // Use curve normals to give rounder looks for same number of sides
 * figure.add({
 *   make: 'cylinder',
 *   radius: 0.2,
 *   length: 0.5,
 *   sides: 20,
 *   normals: 'curve',
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Wire mesh cylinder
 * figure.add({
 *   make: 'cylinder',
 *   radius: 0.2,
 *   length: 0.2,
 *   lines: true,
 *   sides: 50,
 *   ends: false,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Three cylinders as x, y, z axes
 * figure.add([
 *   {
 *     make: 'cylinder',
 *     radius: 0.02,
 *     line: [[0, 0, 0], [0.5, 0, 0]],
 *     color: [1, 0, 0, 1],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.02,
 *     line: [[0, 0, 0], [0, 0.5, 0]],
 *     color: [0, 1, 0, 1],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.02,
 *     line: [[0, 0, 0], [0, 0, 0.5]],
 *     color: [0, 0, 1, 1],
 *   },
 * ]);
 */
export type OBJ_Cylinder = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine,
  length?: number,
  ends?: boolean | 1 | 2,
  rotation?: number,
} & OBJ_FigurePrimitive & OBJ_Generic3All;


/**
 * 3D Line options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/line3.png)
 *
 * A 3D line is a cylinder with optional arrows on the end. Unlike a 2D line,
 * the arrow profiles can only be simple triangles.
 *
 * @property {TypeParsablePoint} [p1] (`[0, 0, 0]`)
 * @property {TypeParsablePoint} [p2] (default: `p1 + [1, 0, 0]`)
 * @property {number} [width] width of line
 * @property {OBJ_Line3Arrow | boolean} [arrow] define to use arrows at one or both ends
 * of the line
 * @property {number} [sides] number of sides (`10`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make light
 * shading across a line face constant. `curve` will gradiate the shading. Use
 * `curve` to make a surface look more round with fewer number of sides.
 * (`curve`)
 * @property {number} [rotation] rotation of line around its axis - this is
 * only noticable for small numbers of sides (`0`)
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Simple line
 * figure.add({
 *   make: 'line3',
 *   p1: [0, 0, 0],
 *   p2: [0, 1, 0],
 *   color: [1, 0, 0, 1],
 * });
 *
 *
 * @example
 * // Thick line with arrows on both ends
 * figure.add({
 *   make: 'line3',
 *   p1: [0, 0, 0],
 *   p2: [0, 1, 0],
 *   arrow: { ends: 'all', width: 0.1, length: 0.1 },
 *   sides: 30,
 *   width: 0.05,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Wire mesh line with arrow
 * figure.add({
 *   make: 'line3',
 *   p1: [0, 0, 0],
 *   p2: [0, 1, 0],
 *   arrow: { ends: 'end' },
 *   color: [1, 0, 0, 1],
 *   lines: true,
 * });
 *
 * @example
 * // Ball of arrows
 * figure.add(
 *   {
 *     make: 'line3',
 *     p1: [0, 0, 0],
 *     p2: [0, 0.4, 0],
 *     color: [1, 0, 0, 1],
 *     width: 0.01,
 *     arrow: { end: 'end', width: 0.02 },
 *     copy: [
 *       { along: 'rotation', num: 20, step: Math.PI * 2 / 20 },
 *       { along: 'rotation', axis: [0, 1, 0], num: 20, step: Math.PI * 2 / 20 },
 *     ],
 *   },
 * );
 */
export type OBJ_Line3 = {
  sides?: number,
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  width?: number,
  arrow?: OBJ_Line3Arrow,
  rotation?: number,
  normals?: 'curve' | 'flat',
} & OBJ_FigurePrimitive & OBJ_Generic3All;


/**
 * Cone shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/cone.png)
 *
 * By default, a cone with its base at the origin and its tip along the x axis
 * will be created.
 *
 * @property {number} [sides] number of sides (`10`)
 * @property {number} [radius] radius of cube base
 * @property {'curve' | 'flat'} [normals] `flat` normals will make light
 * shading across a face cone constant. `curve` will gradiate the shading. Use
 * `curve` to make a surface look more round with fewer number of sides.
 * (`flat`)
 * @property {TypeParsableLine} [line] line that can position and
 * orient the cone. First point of line is cone base center, and second point
 * is cone tip.
 * @property {number} [length] length of the cone along the x axis if
 * `line` isn't defined (`1`)
 * @property {number} [rotation] rotation of base - this is only noticable for
 * small numbers of sides (`0`)
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add({
 *   make: 'cone',
 *   radius: 0.2,
 *   sides: 20,
 *   color: [1, 0, 0, 1],
 *   line: [[0, 0, 0], [0, 0.5, 0]],
 * });
 *
 * @example
 * // Cone with curve normals
 * figure.add({
 *   make: 'cone',
 *   radius: 0.2,
 *   normals: 'curve',
 *   sides: 20,
 *   color: [1, 0, 0, 1],
 *   line: [[0, 0, 0], [0, 0.5, 0]],
 * });
 *
 * @example
 * // Wire mesh cone
 * figure.add({
 *   make: 'cone',
 *   radius: 0.2,
 *   normals: 'curve',
 *   sides: 20,
 *   color: [1, 0, 0, 1],
 *   line: [[0, 0, 0], [0, 0.5, 0]],
 *   lines: true,
 * });
 */
export type OBJ_Cone = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine,
  length?: number,
  rotation?: number,
  lines?: boolean,
} & OBJ_FigurePrimitive & OBJ_Generic3All;


/**
 * Prism shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/prism.png)
 *
 * A prism base is defined in the XY plane, and it's length extends
 * into +z. Use `transform` to orient it in any other way.
 *
 * Triangles will be created for the ends if the base is convex. If the base
 * is not convex, use `baseTriangles` to define the triangles.
 *
 * @property {number} [base] base border points defined in the XY plane - the
 * points should be defined in the counter-clock-wise direction.
 * @property {Array<TypeParsablePoint>} baseTriangles triangles in the XY plane
 * that create the base fill. If the base is convex, then the triangles can be
 * auto-generated and this property left undefined.
 * @property {number} [length] length of the prism
 * @property {boolean} [lines] if `true` then points representing
 * the edges of the prism will be returned. If `false`, then points
 * representing triangle faces and associated normals will be returned.
 * (`false`)
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Create a rectangular prism
 * figure.add(
 *   {
 *     make: 'prism',
 *     base: [[0, 0], [0.5, 0], [0.5, 0.2], [0, 0.2]],
 *     color: [1, 0, 0, 1],
 *   },
 * );
 *
 * @example
 * // Create a hexagonal prism along the x axis with lines
 * figure.add(
 *   {
 *     make: 'prism',
 *     base: Fig.polygon({ radius: 0.1, sides: 6 }),
 *     color: [1, 0, 0, 1],
 *     transform: ['r', Math.PI / 2, 0, 1, 0],
 *     lines: true,
 *   },
 * );
 *
 * @example
 * // Create a bow tie prism defining the base triangles
 * figure.add(
 *   {
 *     make: 'prism',
 *     base: [[0, 0], [0.25, 0.1], [0.5, 0], [0.5, 0.3], [0.25, 0.2], [0, 0.3]],
 *     baseTriangles: [
 *       [0, 0], [0.25, 0.1], [0.25, 0.2],
 *       [0, 0], [0.25, 0.2], [0, 0.3],
 *       [0.25, 0.1], [0.5, 0], [0.5, 0.3],
 *       [0.25, 0.1], [0.5, 0.3], [0.25, 0.2],
 *     ],
 *     color: [1, 0, 0, 1],
 *     transform: ['r', Math.PI / 2, 0, 1, 0],
 *   },
 * );
 */
export type OBJ_Prism = {
  base?: Array<TypeParsablePoint>,
  baseTriangles?: Array<TypeParsablePoint>,
  length?: number,
  lines?: boolean,
} & OBJ_FigurePrimitive & OBJ_Generic3All;


/**
 * Revolve shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}.
 *
 * ![](./apiassets/revolve.png)
 *
 * Revolve (or radially sweep) a profile in the XY plane around the x axis to
 * form a 3D surface. The profile y values must be greater than or equal to 0.
 *
 * Profiles can be open (start and end point are different) or closed (start
 * and end point are equal).
 *
 * For predictable lighting results, profiles should be created with the
 * following rules:
 *
 * - An open profile's start points should have an x value less than its end
 *   point
 * - Closed profiles where all points have y > 0 should be defined in the
 *   clockwise direction when looking at the XY plane from the +z axis.
 *
 * If an open profile's start and ends points are at y = 0, then the final shape
 * will look solid.
 *
 * If an open profile's start and/or ends points have y > 0, then the final
 * shape will look like a surface open at the ends with y > 0. As a surface can
 * have only one color, then looking inside the shape the surface lighting will
 * be opposite to that expected. To create open ended solids with lighting that
 * is as expected, create the outside and inside surface with a closed profile.
 *
 * ![](./apiassets/revolveexplanation.png)
 *
 * @property {Array<TypeParsablePoint>} profile XY plane profile to be radially
 * swept around the x axis
 * @property {number} [sides] number of sides in the radial sweep
 * @property {'flat' | 'curveRows' | 'curveRadial' | 'curve'} [normals]
 * `flat` normals will make shading (from a light source) across a face of the
 * object a constant color. `curveProfile` will gradiate the shading along the
 * profile. `curveRadial` will gradiate the shading around the radial sweep.
 * `curve` will gradiate the shading both around the radial sweep and along the
 * profile. Use `curve`, `curveProfile`, or `curveRadial` to make a surface
 * look more round with fewer number of sides.
 * @property {number} [rotation] by default the profile will start in the XY
 * plane and sweep around the x axis following the right hand rule. Use
 * `rotation` to start the sweep at some angle where 0º is in the XY for +y and
 * 90º is in the XZ plane for +z. initial angle of the revolve rotation
 * @property {TypeParsablePoint} [axis] orient the draw space vertices of the
 * shape so its axis is along this vector
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0], [0, 0.05], [0.5, 0.05], [0.6, 0.1], [0.7, 0]],
 *   axis: [0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 20,
 * });
 *
 * @example
 * // If creating a shell, then also create the inside surface as this will make
 * // lighting more correct (note there is not shaddows).
 * // Ensure to close the shell by adding the first point to the end of the
 * // profile
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0.15], [0.5, 0.3], [0.5, 0.29], [0, 0.14], [0, 0.15]],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 *   normals: 'curveRadial',
 * });
 *
 * @example
 * // Curvy vase like shape
 * const x = Fig.range(0, 0.5, 0.01);
 * const profile = x.map(_x => [_x, 0.1 + 0.05 * Math.sin(_x * 2 * Math.PI * 2)]);
 * figure.add({
 *   make: 'revolve',
 *   profile: [...profile, [0.4, 0], [0, 0], [0, 0.1]],
 *   axis: [0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 *
 * @example
 * // Make a torus by revolving a polygon around the axis. As the polygon is above
 * // the x axis, a hole will be created
 * // Try using `normals: 'curve'`, `normals: 'curveProfile'`, and
 * // `normals: 'curveRadial'` to see different curve options.
 * const { polygon } = Fig;
 * figure.add({
 *   make: 'revolve',
 *   profile: polygon({
 *     radius: 0.1, center: [0, 0.3], sides: 20, direction: -1, close: true,
 *   }),
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 *
 * @example
 * // Wire mesh arrow
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0.03], [0.4, 0.03], [0.4, 0.09], [0.7, 0]],
 *   axis: [0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 20,
 *   lines: true,
 * });
 *
 * @example
 * // Open profile y = 0 at ends
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0], [0, 0.3], [0.5, 0.2], [1, 0.3], [1, 0]],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 *
 * @example
 * // Open profile y > 0 at ends
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0.3], [0.5, 0.2], [1, 0.3]],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 *
 * @example
 * // Closed Profile
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0.3], [0.5, 0.2], [1, 0.3], [1, 0.29], [0.5, 0.19], [0, 0.29], [0, 0.3]],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 */
export type OBJ_Revolve = {
  sides?: number,
  profile?: Array<TypeParsablePoint>,
  normals?: 'flat' | 'curveProfile' | 'curveRadial' | 'curve',
  axis?: TypeParsablePoint,
  rotation?: number,
  lines?: boolean,
} & OBJ_FigurePrimitive & OBJ_Generic3All;

/**
 * Surface shape options object that extends {@link OBJ_Generic3All}
 * and {@link OBJ_FigurePrimitive}.
 *
 * ![](./apiassets/surface.png)
 *
 * ![](./apiassets/surfaceclosed.png)
 *
 * A surface is defined with a 2D matrix of points. Triangles that fill the
 * surface are created between neighboring points in the matrix.
 *
 * If a surface is defined with 9 points (an array or arrays in JavaScript):
 *
 * ![](./apiassets/surfacematrix.png)
 *
 * Then triangles will be created between `adb`, `deb`, `bec`, `efc`, `dge`,
 * `ghe`, `ehf`, and `hif`.
 *
 * The normal for triangle 'adb' is in the direction of the cross product
 * of vector 'ad' with vector 'ab' (use the right hand rule where the fingers
 * of the right hand curl from vector 'ad' to 'ab', and the thumb will then be
 * the direction of the normal). Similarly, the normal of `hif` will be the
 * direction of the cross product of `hi` with `hf`.
 *
 * Use the property `invertNormals` to make all the normals go in the reverse
 * direction.
 *
 * A surface can be open or closed at the end rows or columns of the matrix.
 * For example, a surface has closed columns if the first and last column
 * of the matrix have identical points. A surface is has open rows if the first
 * and last row of the matrix have different points.
 *
 * If using curved normals (`'curve'`, `'curveRows'` or `'curveColumns'`) with
 * closed surfaces, use `closeRows` or `closeColumns` to ensure normal
 * curvature is maintained at the end rows
 * and columns.
 *
 * @property {Array<Array<TypeParsablePoint>>} [points] A grid of points that
 * define a 3D surface
 * @property {'curveColumns' | 'curveRows' | 'curve' | 'flat'} [normals]
 * `flat` normals will make shading (from a light source) across a face of the
 * object a constant color. `curveRows` will gradiate the shading along the
 * rows of the grid. `curveColumns` will gradiate the shading along the columns
 * of the grid. `curve` will gradiate the shading along both rows and columns.
 * Use `curve`, `curveRows`, or `curveColumns` to make a surface
 * look more round with fewer number of sides.
 * @property {boolean} [closeRows] Set to `true` if first row and last row are
 * the same, and normals is `'curveRows'` or `'curve'` to get correct normal
 * calculations (`false`)
 * @property {boolean} [closeColumns] Set to `true` if first row and last
 * column are the same, and normals is `'curveColumns'` or `'curve'` to get
 * correct normal calculations (`false`)
 * shape
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 * @property {boolean} [invertNormals] if `true` then all normals will be
 * inverted
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * const points = Fig.surfaceGrid({
 *   x: [-0.8, 0.7, 0.03],
 *   y: [-0.8, 0.7, 0.03],
 *   z: x => 0.2 * Math.cos(x * 2 * Math.PI),
 * });
 * figure.scene.setCamera({ up: [0, 0, 1] });
 * figure.add({
 *   make: 'surface',
 *   points,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Surface wire mesh
 * const points = Fig.surfaceGrid({
 *   x: [-0.8, 0.8, 0.03],
 *   y: [-0.8, 0.8, 0.03],
 *   z: (x, y) => y * 0.2 * Math.cos(x * 2 * Math.PI),
 * });
 * figure.scene.setCamera({ position: [-1, -1, 0.7], up: [0, 0, 1] });
 * figure.add({
 *   make: 'surface',
 *   points,
 *   lines: true,
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Surface with wire mesh and fill
 * const points = Fig.surfaceGrid({
 *   x: [-0.8, 0.8, 0.03],
 *   y: [-0.8, 0.8, 0.03],
 *   z: (x, y) => {
 *     const r = Math.sqrt(x * x + y * y) * Math.PI * 2 * 2;
 *     return Math.sin(r) / r;
 *   },
 * });
 * // Orient the camera so z is up
 * figure.scene.setCamera({ up: [0, 0, 1] });
 * figure.add({
 *   make: 'surface',
 *   points,
 *   color: [1, 0, 0, 1],
 * });
 * figure.add({
 *   make: 'surface',
 *   points,
 *   lines: true,
 *   color: [0, 0, 0, 1],
 * });
 *
 * @example
 * // Simple Closed surface around the x axis
 * figure.add({
 *   make: 'surface',
 *   normals: 'curveColumns',
 *   closeRows: true,
 *   points: [
 *     [[0, 0, 0.5], [1, 0, 0.5]],
 *     [[0, -0.5, 0], [1, -0.5, 0]],
 *     [[0, 0, -0.5], [1, 0, -0.5]],
 *     [[0, 0.5, 0], [1, 0.5, 0]],
 *     [[0, 0, 0.5], [1, 0, 0.5]],
 *   ],
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Simple Closed surface around the x axis with curved normals
 * figure.add({
 *   make: 'surface',
 *   normals: 'curveColumns',
 *   closeRows: true,
 *   points: [
 *     [[0, 0, 0.5], [1, 0, 0.5]],
 *     [[0, -0.5, 0], [1, -0.5, 0]],
 *     [[0, 0, -0.5], [1, 0, -0.5]],
 *     [[0, 0.5, 0], [1, 0.5, 0]],
 *     [[0, 0, 0.5], [1, 0, 0.5]],
 *   ],
 *   color: [1, 0, 0, 1],
 * });
 *
 * @example
 * // Create a matrix of points by taking a profile in XY and rotating
 * // it around the x axis
 * const { Point, Transform } = Fig;
 * const points = [];
 *
 * // Rotation step
 * const dr = Math.PI * 2 / 50;
 * for (let r = 0; r < Math.PI * 2 + dr / 2; r += dr) {
 *   // Rotation matrix of rotation step around x axis
 *   const m = new Transform().rotate(r, 1, 0, 0).matrix();
 *
 *   // A row of points is a profile rotated by some amount r
 *   points.push([]);
 *   // Make a profile for x values from 0 to 1
 *   for (let x = 0; x < 1; x += 0.05) {
 *     // The y coordinate of the profile changes with both x value, and
 *     // rotation value
 *     const y = 0.1 * Math.sin(6 * x) + 0.25 + 0.1 * Math.cos(3 * r);
 *     const p = new Point(x, y).transformBy(m);
 *     points[points.length - 1].push(p);
 *   }
 * }
 * figure.add({
 *   make: 'surface',
 *   points,
 *   color: [1, 0, 0, 1],
 * });
 */
export type OBJ_Surface = {
  points?: Array<Array<TypeParsablePoint>>,
  normals?: 'curveColumns' | 'curveRows' | 'curve' | 'flat',
  closeRows?: boolean,
  closeColumns?: boolean,
  lines?: boolean,
} & OBJ_FigurePrimitive & OBJ_Generic3All;

/**
 * Camera control definition object that extends
 * and {@link OBJ_FigurePrimitive}
 *
 * A camera control is a transparent rectangle that uses touch and drag
 * gestures to rotate the position of the camera in a 3D scene around a vertical
 * axis.
 *
 * The vertical axis will always remain vertical. Left/right movements will
 * rotate the scene around the vertical axis (in the azimuth of the vertical
 * axis), while up/down movements will change the elevation relative to the
 * vertical axis.
 *
 * The transparent rectangle will be positioned relative to the 2D HTML canvas
 * the figure is drawn in on the screen. The `left`, `bottom`, `width` and
 * `height` properties are numbers from 0 to 1 which represent percentage of
 * the screen width and height.
 *
 * Thus for the rectangle to cover the entire screen, values of `left: 0`,
 * `bottom: 0`, `width: 1` and `height: 1` would be used (these are the default
 * values as well).
 *
 * By default, the figure's {@link Scene} camera position is modified. If an
 * element's custom scene is to be controlled, use the `scene` property to link
 * to it.
 *
 * How fast the camera is rotated in the aziumuth and elevation is controlled by
 * the `sensitivity`, `xSensitivity` and `ySensitivity` properties.
 * A higher sensitivity value will result in more rotation for the same user
 * movement. If only azimuthal or elevation rotation is desired set
 * `ySensitivity` or `xSensitivity` to 0 respectively.
 *
 * @property {number} [left] screen left position to place the control
 * rectangle. 0 is the left edge, while 1 is the right edge (`0`).
 * @property {number} [bottom] screen bottom position to place the control
 * rectangle. 0 is the bottom edge, while 1 is the top edge (`0`).
 * @property {number} [width] width of control rectangle. 1 is the full
 * width of the drawing canvas (`1`).
 * @property {number} [height] height of control rectangle. 1 is the full
 * height of the drawing canvas (`1`).
 * @property {TypeParsablePoint} [axis] Axis to keep vertical as camera is
 * rotated. The axis vector and scene.camera.up vector should be in the same
 * plane (`[0, 1, 0]`)
 * @property {Scene | string} [controlScene] Use this to control a scene that is not
 * the default Figure scene.
 * @property {number} sensitivity sensitivity of camera position relative to
 * user movement where larger numbers result in more rotation for the same
 * movement (`5`)
 * @property {number} xSensitivity sensitivity to a horizontal user movement.
 * Setting this to 0 will mean the scene doesn't not rotate aziumthally (`1`)
 * @property {number} ySensitivity sensitivity to a vertical user movement.
 * Setting this to 0 will mean the elevation does not change (`1`)
 *
 * @example
 * // Add a camera control that will cover the whole screen
 *
 * figure.add([
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [1, 0, 0, 1],
 *     line: [[-1, 0, 0], [1, 0, 0]],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [0, 1, 0, 1],
 *     line: [[0, -1, 0], [0, 1, 0]],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [0, 0, 1, 1],
 *     line: [[0, 0, -1], [0, 0, 1]],
 *   },
 *   {
 *     make: 'grid',
 *     bounds: [-0.8, -0.8, 1.6, 1.6],
 *     xStep: 0.05,
 *     yStep: 0.05,
 *     line: { width: 0.002 },
 *     color: [0.7, 0.7, 0.7, 1],
 *     transform: ['r', Math.PI / 2, 1, 0, 0],
 *   },
 * ]);
 *
 * // Add camera control
 * figure.add({
 *   make: 'cameraControl',
 * });
 *
 * @example
 * // Add a thin bar at the bottom of the figure that rotates the scene in the
 * // azimuth only
 *
 * figure.add([
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [1, 0, 0, 1],
 *     line: [[-1, 0, 0], [1, 0, 0]],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [0, 1, 0, 1],
 *     line: [[0, -1, 0], [0, 1, 0]],
 *   },
 *   {
 *     make: 'cylinder',
 *     radius: 0.01,
 *     color: [0, 0, 1, 1],
 *     line: [[0, 0, -1], [0, 0, 1]],
 *   },
 *   {
 *     make: 'grid',
 *     bounds: [-0.8, -0.8, 1.6, 1.6],
 *     xStep: 0.05,
 *     yStep: 0.05,
 *     line: { width: 0.002 },
 *     color: [0.7, 0.7, 0.7, 1],
 *     transform: ['r', Math.PI / 2, 1, 0, 0],
 *   },
 * ]);
 *
 * // Add a moveable cube
 * figure.add({
 *   make: 'cube',
 *   side: 0.3,
 *   color: [1, 0, 0, 1],
 *   center: [0.3, 0, 0],
 *   move: {
 *     plane: [[0, 0, 0], [0, 1, 0]],
 *   },
 * });
 *
 * // Add camera control bar at the bottom of the screen that only allows
 * // rotation in the azimuth. As the camera control bar does not overlap the
 * // cube, then both the cube can moved, and the scene rotated with the bar.
 * figure.add({
 *   make: 'cameraControl',
 *   color: [0, 0, 0, 0.2],
 *   ySensitivity: 0,
 *   height: 0.1,
 * });

 */
export type OBJ_CameraControl = {
  left?: number,
  bottom?: number,
  width?: number,
  height?: number,
  axis?: TypeParsablePoint,
  controlScene?: Scene | string,
  sensitivity?: number,
  xSensitivity?: number,
  ySensitivity?: number,
} & OBJ_FigurePrimitive;
