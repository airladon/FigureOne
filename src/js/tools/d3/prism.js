// @flow
import { getPoint, getPoints } from '../geometry/Point';
import { getTransform } from '../geometry/Transform';
import type { TypeParsablePoint, Point } from '../geometry/Point';
import { joinObjects } from '../tools';
import { getNormal } from '../geometry/Plane';
// import * as m3 from '../m3';
// import { toPoints } from '../geometry/tools';
import type { TypeParsableTransform } from '../geometry/Transform';

/**
 * Prism options object.
 *
 * By default, a prism face is defined in the XY plane, and it's depth extends
 * into -z.
 *
 * Prism supports convex faces only.
 *
 * @property {number} [face] side length (`1`)
 * @property {TypeParsablePoint} [center] center point (`[0, 0]`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the 12 edges of the cube will be returned. If `false`, then points
 * representing two triangles per face (12 triangles, 36 points) and an
 * associated normal for each point will be returned. (`false`)
 */
export type OBJ_PrismPoints = {
  face?: Array<TypeParsablePoint>,
  faceTriangles?: Array<TypeParsablePoint>,
  depth?: number,
  axis?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  lines?: boolean,
}


function toLines(
  face: Array<TypeParsablePoint>,
  axis: Point,
  transform: TypeParsableTransform,
): Array<Point> {
  const frontFace = [];
  const facePoints = getPoints(face);

  for (let i = 0; i < facePoints.length - 1; i += 1) {
    frontFace.push(facePoints[i], facePoints[i + 1]);
  }
  frontFace.push(facePoints[facePoints.length - 1], facePoints[0]);
  const backFace = frontFace.map(p => p.add(axis));
  const sides = [];
  for (let i = 0; i < frontFace.length; i += 2) {
    sides.push(frontFace[i], backFace[i]);
  }
  if (transform != null) {
    const matrix = getTransform(transform).matrix();
    return [...frontFace, ...sides, ...backFace].map((p: Point) => p.transformBy(matrix));
  }
  return [...frontFace, ...sides, ...backFace];
}

/**
 * Return points of a prism.
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points lines that are the edges of the prism.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_CubePoints} options cube options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 */
export default function prism(options: OBJ_PrismPoints) {
  const o = joinObjects({}, {
    axis: [0, 0, -1],
    options,
  }, options);
  const {
    face, depth, axis, transform, lines, faceTriangles,
  } = o;
  let axisToUse = getPoint(axis);
  if (depth != null) {
    axisToUse = axisToUse.normalize().scale(depth);
  }
  if (lines) {
    return [toLines(face, axisToUse, transform)];
  }

  const faceBorder = getPoints(face);
  const backFaceBorder = faceBorder.map(p => p.add(axisToUse));
  let frontFace = [];
  if (faceTriangles != null) {
    frontFace = getPoints(faceTriangles);
  } else {
    for (let i = 2; i < faceBorder.length; i += 1) {
      frontFace.push(faceBorder[0], faceBorder[i - 1], faceBorder[i]);
    }
  }
  const backFace = frontFace.map(p => p.add(axisToUse));
  const sides = [];
  for (let i = 0; i < faceBorder.length - 1; i += 1) {
    sides.push(faceBorder[i], backFaceBorder[i], backFaceBorder[i + 1]);
    sides.push(faceBorder[i], backFaceBorder[i + 1], faceBorder[i + 1]);
  }
  const j = faceBorder.length - 1;
  sides.push(faceBorder[j], backFaceBorder[j], backFaceBorder[0]);
  sides.push(faceBorder[j], backFaceBorder[0], faceBorder[0]);

  let triangles: Array<Point> = [...frontFace, ...sides, ...backFace]
  if (transform != null) {
    const matrix = transform != null ? getTransform(transform).matrix() : [1, 0, 0, 0];
    triangles = triangles.map((p: Point) => p.transformBy(matrix));
  }

  const normals = [];
  for (let i = 0; i < triangles.length - 2; i += 3) {
    const normal = getNormal(triangles[i], triangles[i + 1], triangles[i + 2]);
    normals.push(normal._dup(), normal._dup(), normal._dup());
  }
  return [triangles, normals];
}
