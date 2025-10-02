import { Line } from '../geometry/Line';
import type { TypeParsablePoint, Point } from '../geometry/Point';
import { getPoint } from '../geometry/Point';
import type { TypeParsableTransform } from '../geometry/Transform';
import { joinObjects } from '../tools';
import { revolve } from './revolve';

/**
 * Arrow definition object for a 3D line.
 *
 * @property {'start' | 'end' | 'all'} [ends] which end to put an arrow where
 * `'start'` is `p1` and `'end'` is `p2` (`'end'`)
 * @property {number} [width] width of arrow (line width * 2.5)
 * @property {number} [length] length of arrow (arrow width * 3)
 */
export type OBJ_Line3Arrow = {
  ends?: 'start' | 'end' | 'all',
  width?: number,
  length?: number,
};

/**
 * 3D line options object.
 *
 * A 3D line is a cylinder with optional arrows on the end. Unlike a 2D line,
 * the arrow profiles can only be simple triangles.
 *
 * @property {TypeParsablePoint} [p1] (`[0, 0, 0]`)
 * @property {TypeParsablePoint} [p2] (default: `p1 + [1, 0, 0]`)
 * @property {number} [width] width of line
 * @property {OBJ_Line3Arrow | boolean} [arrow] define to use arrows at one or
 * both ends of the line
 * @property {number} [sides] number of sides (`10`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make light
 * shading across a line face constant. `curve` will gradiate the shading. Use
 * `curve` to make a surface look more round with fewer number of sides.
 * (`curve`)
 * @property {number} [rotation] rotation of line around its axis - this is
 * only noticable for small numbers of sides (`0`)
 * @property {TypeParsableTransform} [transform] transform to apply to line
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 */
export type OBJ_Line3Points = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  width?: number,
  arrow?: OBJ_Line3Arrow | boolean | null,
  sides?: number,
  normals?: 'curve' | 'flat',
  transform?: TypeParsableTransform,
  lines?: boolean,
  rotation?: number,
}

/**
 * Return points of a 3D line with optional arrows.
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points of lines that are the edges of each face
 * of the shape.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_Line3Points} options line options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 */
type Line3OptionsDefined = {
  p1: TypeParsablePoint,
  p2?: TypeParsablePoint,
  width: number,
  arrow?: OBJ_Line3Arrow | boolean | null,
  sides: number,
  normals: 'curve' | 'flat',
  transform?: TypeParsableTransform,
  lines: boolean,
  rotation: number,
}

export default function line3(options: OBJ_Line3Points): [Point[]] | [Point[], Point[]] {
  const o = joinObjects<Line3OptionsDefined>({
    p1: [0, 0, 0] as TypeParsablePoint,
    sides: 10,
    width: 0.01,
    normals: 'curve' as 'curve' | 'flat',
    rotation: 0,
    lines: false,
  }, options as OBJ_Line3Points);
  const {
    rotation, sides, normals, p1, width, transform, lines,
  } = o;
  let { p2 } = o as { p2?: TypeParsablePoint };
  let arrowToUse = o.arrow as OBJ_Line3Arrow | boolean | null | undefined;
  if (arrowToUse != null) {
    if (typeof arrowToUse === 'boolean') {
      if (arrowToUse) {
        arrowToUse = {
          ends: 'end',
          width: (width as number) * 2.5,
          length: (width as number) * 2.5 * 3,
        };
      } else {
        arrowToUse = null;
      }
    } else {
      if (arrowToUse.ends == null) {
        arrowToUse.ends = 'end';
      }
      if (arrowToUse.width == null) {
        arrowToUse.width = (width as number) * 2.5;
      }
      if (arrowToUse.length == null) {
        arrowToUse.length = arrowToUse.width * 3;
      }
    }
  }
  if (p2 == null) {
    p2 = getPoint(p1).add(1, 0, 0);
  }

  const l = new Line(p1, p2);

  let startLine = 0;
  let endLine = l.length();
  if (arrowToUse != null) {
    if (arrowToUse.ends === 'start' || arrowToUse.ends === 'all') {
      startLine = arrowToUse.length as number;
    }
    if (arrowToUse.ends === 'end' || arrowToUse.ends === 'all') {
      endLine = l.length() - (arrowToUse.length as number);
    }
  }
  const profile: Array<[number, number]> = [];
  profile.push([0, 0]);
  if (arrowToUse != null && (arrowToUse.ends === 'start' || arrowToUse.ends === 'all')) {
    profile.push([startLine, arrowToUse.width as number]);
  }
  profile.push([startLine, width as number]);
  profile.push([endLine, width as number]);
  if (arrowToUse != null && (arrowToUse.ends === 'end' || arrowToUse.ends === 'all')) {
    profile.push([endLine, arrowToUse.width as number]);
  }
  profile.push([l.length(), 0]);

  return revolve({
    sides,
    rotation,
    normals: normals === 'curve' ? 'curveRadial' : 'flat',
    axis: l.unitVector(),
    position: l.p1,
    profile,
    transform,
    lines,
  });
}
