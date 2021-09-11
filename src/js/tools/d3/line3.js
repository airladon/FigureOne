// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsablePoint } from '../geometry/Point';
import { getPoint } from '../geometry/Point';
import type { TypeParsableLine } from '../geometry/Line';
import { makePolyLine } from '../../figure/geometries/lines/lines';
import { simplifyArrowOptions, getArrow } from '../../figure/geometries/arrow';
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
 * @property {OBJ_Line3Arrow} [arrow] define to use arrows at one or both ends
 * of the line
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
  arrow?: OBJ_Line3Arrow,
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
export default function line3(options: OBJ_Line3Points) {
  const o = joinObjects(
    {
      p1: [0, 0, 0],
      sides: 10,
      width: 0.01,
      normals: 'curve',
      rotation: 0,
      lines: false,
    },
    options,
  );
  const {
    rotation, sides, normals, p1, width, transform, lines, arrow,
  } = o;
  let { p2 } = o;
  if (arrow != null) {
    if (arrow.ends == null) {
      arrow.ends = 'end';
    }
    if (arrow.width == null) {
      arrow.width = width * 2.5;
    }
    if (arrow.length == null) {
      arrow.length = arrow.width * 3;
    }
  }
  if (p2 == null) {
    p2 = p1.add([1, 0, 0]);
  }

  const l = new Line(p1, p2);

  let startLine = 0;
  let endLine = l.length();
  if (arrow != null) {
    if (arrow.ends === 'start' || arrow.ends === 'all') {
      startLine = arrow.length;
    }
    if (arrow.ends === 'end' || arrow.ends === 'all') {
      endLine = l.length() - arrow.length;
    }
  }
  const profile = [];
  profile.push([0, 0]);
  if (arrow != null && (arrow.ends === 'start' || arrow.ends === 'all')) {
    profile.push([startLine, arrow.width]);
  }
  profile.push([startLine, width]);
  profile.push([endLine, width]);
  if (arrow != null && (arrow.ends === 'end' || arrow.ends === 'all')) {
    profile.push([endLine, arrow.width]);
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
