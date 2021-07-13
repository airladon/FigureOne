// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsableLine } from '../geometry/Line';
import type { TypeParsableTransform } from '../geometry/Transform';
import { joinObjects } from '../tools';
import { revolve } from './revolve';

/**
 * Cone options object.
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
}

/**
 * Return points of a cone.
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points lines that are the edges of each face of
 * the cone.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_CubePoints} options cone options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 */
export default function cone(options: OBJ_Cone) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'flat',
      rotation: 0,
      length: 1,
      lines: false,
    },
    options,
  );
  const {
    rotation, sides, radius, normals, length, transform, lines,
  } = o;
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [length, 0, 0]);
  } else {
    line = getLine(o.line);
  }
  const profile = [];
  profile.push([0, 0], [0, radius], [line.length(), 0]);

  return revolve({
    sides,
    rotation,
    normals: normals === 'curve' ? 'curveRadial' : 'flat',
    axis: ['dir', line.unitVector()],
    position: line.p1,
    profile,
    transform,
    lines,
  });
}
