// @flow
import { getPoint } from '../geometry/Point';
import { Transform, getTransform } from '../geometry/Transform';
import type { TypeParsablePoint, Point } from '../geometry/Point';
import { joinObjects } from '../tools';
import * as m3 from '../m3';
import { toPoints } from '../geometry/tools';
import type { TypeParsableTransform } from '../geometry/Transform';

/**
 * Cube options object.
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
 */
export type OBJ_CubePoints = {
  side?: number,
  center?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  lines?: boolean,
}

function toLines(
  side: number,
  center: TypeParsablePoint,
  transform: TypeParsableTransform,
): Array<Point> {
  const s = side / 2;
  const sidePoints: Array<number> = [
    -s, -s, s, s, -s, s,
    s, -s, s, s, s, s,
    s, s, s, -s, s, s,
    -s, s, s, -s, -s, s,
    -s, -s, s, -s, -s, -s,
    -s, s, s, -s, s, -s,
    s, s, s, s, s, -s,
    s, -s, s, s, -s, -s,
    -s, -s, -s, s, -s, -s,
    s, -s, -s, s, s, -s,
    s, s, -s, -s, s, -s,
    -s, s, -s, -s, -s, -s,
  ];
  const points: Array<Point> = toPoints(sidePoints);
  if (center == null && transform == null) {
    return points;
  }
  let t = new Transform();
  if (center != null) {
    t = t.translate(center);
  }
  if (transform != null) {
    t = new Transform([...t.def, ...getTransform(transform).def]);
  }
  const matrix = t.matrix();
  return points.map((p: Point) => p.transformBy(matrix));
}

/**
 * Return points of a cube.
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points lines that are the edges of the cube.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_CubePoints} options cube options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 */
export default function cube(options: OBJ_CubePoints) {
  const o = joinObjects(
    {
      side: 1,
    },
    options,
  );
  const {
    side, center, transform,
  } = o;
  if (o.lines) {
    return [toLines(side, center, transform)];
  }

  const s = side / 2;
  const triPoints: Array<number> = [
    // face +z
    -s, -s, s,
    s, -s, s,
    s, s, s,
    -s, -s, s,
    s, s, s,
    -s, s, s,
    // face +x
    s, -s, s,
    s, -s, -s,
    s, s, -s,
    s, -s, s,
    s, s, -s,
    s, s, s,
    // face +y
    s, s, s,
    s, s, -s,
    -s, s, -s,
    s, s, s,
    -s, s, -s,
    -s, s, s,
    // face -z
    -s, -s, -s,
    s, s, -s,
    s, -s, -s,
    -s, -s, -s,
    -s, s, -s,
    s, s, -s,
    // face -x
    -s, -s, s,
    -s, s, -s,
    -s, -s, -s,
    -s, -s, s,
    -s, s, s,
    -s, s, -s,
    // face -y
    s, -s, s,
    -s, -s, -s,
    s, -s, -s,
    s, -s, s,
    -s, -s, s,
    -s, -s, -s,
  ];
  const pointsRaw = toPoints(triPoints);
  const normalPoints: Array<number> = [
    // +z
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // +x
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // +y
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    // -z
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // -x
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    // -y
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ];

  const normalsRaw = toPoints(normalPoints);

  if (center == null && transform == null) {
    return [pointsRaw, normalsRaw];
  }
  let matrix;

  let transformMatrix;
  let normalTransformMatrix;
  if (transform != null) {
    transformMatrix = getTransform(transform).matrix();
    normalTransformMatrix = m3.transpose(m3.inverse(transformMatrix));
  }

  let c;
  if (center != null) {
    c = getPoint(center);
  }
  const points = [];
  let xNormal = [1, 0, 0];
  let xNegNormal = [-1, 0, 0];
  let yNormal = [0, 1, 0];
  let yNegNormal = [0, -1, 0];
  let zNormal = [0, 0, 1];
  let zNegNormal = [0, 0, -1];
  if (normalTransformMatrix != null) {
    xNormal = m3.transform(normalTransformMatrix, ...xNormal);
    xNegNormal = m3.transform(normalTransformMatrix, ...xNegNormal);
    yNormal = m3.transform(normalTransformMatrix, ...yNormal);
    yNegNormal = m3.transform(normalTransformMatrix, ...yNegNormal);
    zNormal = m3.transform(normalTransformMatrix, ...zNormal);
    zNegNormal = m3.transform(normalTransformMatrix, ...zNegNormal);
  }
  for (let i = 0; i < 36; i += 1) {
    let p = pointsRaw[i];
    if (matrix != null) {
      p = getPoint(m3.transform(matrix, p.x, p.y, p.z));
    }
    if (c != null) {
      p = p.add(c);
    }
    if (transformMatrix != null) {
      p = p.transformBy(transformMatrix);
    }
    points.push(p);
  }
  const normals = [
    // +z
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    // +x
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    // +y
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    // -z
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    // -x
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    // -y
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
  ];
  return [points, normals];
}
