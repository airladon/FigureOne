// @flow
import type { TypeGLBufferUsage } from '../DrawingObjects/GLObject/GLObject';
import type { CPY_Step } from '../geometries/copy/copy';
import type { TypeParsablePoint } from '../../tools/geometry/Point';
import type { TypeUserRotationDefinition } from '../../tools/geometry/Transform';
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
  rotation?: TypeUserRotationDefinition,
} & OBJ_Generic3D;
