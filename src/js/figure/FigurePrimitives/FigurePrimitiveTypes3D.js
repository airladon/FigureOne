// @flow
import type { TypeGLBufferUsage } from '../DrawingObjects/GLObject/GLObject';
import type { CPY_Step } from '../geometries/copy/copy';
import type { TypeParsablePoint } from '../../tools/geometry/Point';
import type { TypeUserRotationDefinition, TypeParsableTransform } from '../../tools/geometry/Transform';
import type { TypeColor } from '../../tools/types';
import type { TypeParsableLine } from '../../tools/geometry/Line';
import type {
  OBJ_Texture, OBJ_FigurePrimitive,
} from './FigurePrimitiveTypes';

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
};

/**
 * Options object for a {@link FigureElementPrimitive} of a generic 3D shape.
 * Extends and {@link OBJ_FigurePrimitive}
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
 * {@link OBJ_Generic3D} Provides the ability to create many custom shapes that
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
 * figure.scene.setProjection({ style: 'orthographic' });
 * figure.scene.setCamera({ position: [1, 1, 2] });
 * figure.scene.setLight({ directional: [0.7, 0.5, 1] });
 * const { sphere, polygon, revolve } = Fig.tools.g2;
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
 *   transform: ['dir', [0, 1, 0]],
 * });
 * const a = figure.add({
 *   make: 'generic3',
 *   points: [...spherePoints, ...ringPoints],
 *   normals: [...sphereNormals, ...ringNormals],
 *   color: [1, 0, 0, 1],
 *   transform: ['xyz', 0, 0, 0],
 * });
 * // Animate the shape to slowly rotate around the x and y axes
 * a.animations.new()
 *   .rotation({ velocity: ['xyz', 0.15, 0.3, 0], duration: null })
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
 * Sphere shape options object that extends {@link OBJ_Generic3D}
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
 * @property {TypeParsableTransform} [transform] transform to apply to all
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
 *   transform: ['xyz', Math.PI / 2, 0, 0],
 * });
 */
export type OBJ_Sphere = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  center?: TypeParsablePoint,
  transform?: TypeParsableTransform,
} & OBJ_FigurePrimitive;

/**
 * Cube shape options object that extends {@link OBJ_Generic3D}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/cube.png)
 *
 * By default, a cube will be constructed around the origin, with the xyz axes
 * being normal to the cube faces.
 *
 * @property {number} [side] side length (`1`)
 * @property {TypeParsablePoint} [center] center point (`[0, 0]`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
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
  rotation?: TypeUserRotationDefinition,
} & OBJ_Generic3D;

/**
 * Cylinder shape options object that extends {@link OBJ_Generic3D}
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
* @property {TypeParsableLine | number} [line] line that can position and
 * orient the cylinder. First point of line is cylinder base center, and second
 * point is the top center.
 * @property {number} [length] length of the cylinder if `line` isn't
 * defined (`1`)
 * @property {boolean | 1 | 2} [ends] `true` fills both ends of the cylinder.
 * `false` does not fill ends. `1` fills only the first end. `2` fills only the
 * the second end. (`true`)
 * @property {number} [rotation] rotation of base - this is only noticable for
 * small numbers of sides (`0`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
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
  line?: TypeParsableLine | number,
  length?: number,
  ends?: boolean | 1 | 2,
  transform?: TypeParsableTransform,
};

/**
 * Cone shape options object that extends {@link OBJ_Generic3D}
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
 * @property {TypeParsableLine | number} [line] line that can position and
 * orient the cone. First point of line is cone base center, and second point
 * is cone tip.
 * @property {number} [length] length of the cone along the x axis if
 * `line` isn't defined (`1`)
 * @property {number} [rotation] rotation of base - this is only noticable for
 * small numbers of sides (`0`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
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
  line?: TypeParsableLine | number,
  length?: number,
  rotation?: number,
  transform?: TypeParsableTransform,
  lines?: boolean,
};

/**
 * Revolve shape options object that extends {@link OBJ_Generic3D}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/revolve.png)
 *
 * Revolve (or radially sweep) a profile in the XY plane around the x axis to
 * form a 3D surface.
 *
 * Note, if creating a shape with a hole (like the pipe or torus example below)
 *, then ensure the points are defined in the clockwise direction in the XY
 * plane otherwise the lighting normals will be opposite to that expected.
 * One way to think of it is, starting at x = 0, create the outside surface
 * first, then turn back to create the inside surface.
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
 * @property {TypeUserRotationDefinition} [axis] orient the final vertices by
 * rotating their definition around the x axis to an arbitrary rotation
 * @property {TypeParsablePoint} [position] offset the final vertices such that
 * the original (0, 0) point in the profile moves to position (this step
 * happens after the rotation)
 * @property {TypeParsableTransform} [transform] apply a final transform to
 * shape
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
 *   axis: ['dir', 0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 20,
 * });
 *
 * @example
 * // If creating a shell, then also create the inside surface as this will make
 * // lighting more correct (note there is not shaddows).
 * figure.add({
 *   make: 'revolve',
 *   profile: [[0, 0.15], [0.5, 0.3], [0.5, 0.29], [0, 0.14]],
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
 *   profile: [...profile, [0.4, 0]],
 *   axis: ['dir', 0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 30,
 * });
 *
 * @example
 * // Make a torus by revolving a polygon around the axis. As the polygon is above
 * // the x axis, a hole will be created
 * // Try using `normals: 'curve'`, `normals: 'curveProfile'`, and
 * // `normals: 'curveRadial'` to see different curve options.
 * const { polygon } = Fig.tools.g2;
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
 *   axis: ['dir', 0, 1, 0],
 *   color: [1, 0, 0, 1],
 *   sides: 20,
 *   lines: true,
 * });
 */
export type OBJ_Revolve = {
  sides?: number,
  profile?: Array<TypeParsablePoint>,
  normals?: 'flat' | 'curveProfile' | 'curveRadial' | 'curve',
  axis?: TypeUserRotationDefinition,
  rotation?: number,
  position?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  lines?: boolean,
};

/**
 * Revolve shape options object that extends {@link OBJ_Generic3D}
 * and {@link OBJ_FigurePrimitive}
 *
 * ![](./apiassets/surface.png)
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
 * @property {TypeParsableTransform} [transform] apply a final transform to
 * shape
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 *
 * @see To test examples, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * const points = Fig.tools.g2.surfaceGrid({
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
 * const points = Fig.tools.g2.surfaceGrid({
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
 * const points = Fig.tools.g2.surfaceGrid({
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
 */
export type OBJ_Surface = {
  points?: Array<Array<TypeParsablePoint>>,
  normals?: 'curveColumns' | 'curveRows' | 'curve' | 'flat',
  closeRows?: boolean,
  closeColumns?: boolean,
  transform?: TypeParsableTransform,
  lines?: boolean,
};
