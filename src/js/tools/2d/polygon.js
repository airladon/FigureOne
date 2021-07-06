// @flow
/* eslint-disable prefer-destructuring */
import { Point, getPoint } from '../geometry/Point';
import { getMatrix } from '../geometry/Transform';
import { pointsToArray } from '../geometry/tools';
import { joinObjects } from '../tools';

/**
 * @property {number} [radius] distance from center to polygon corner (`1`)
 * @property {number} [sides] number of polygon sides (`4`)
 * @property {number} [rotation] rotation offset for first polygon corner (`0`)
 * @property {1 | -1} [direction] angular direction of corners - 1 is CCW in the
 * XY plane (`1`)
 * @property {TypeParsablePoint} [position] center position of the polygon
 * (`[0,, 0, 0]`)
 * @property {Type3DMatrix | TypeParsableTransform} [transform] transform
 * to apply to all polygon points
 * @property {2 | 3} [tris] if defined, return an array of numbers representing
 * the interlaced x/y/z components of points that define triangles that can draw
 * the polygon. `2` returns just x/y components and `3` returns x/y/z
 * components.
 */
export type OBJ_GEOPolygon = {
  radius?: number,
  sides?: number,
  rotation?: number,
  direction?: 1 | -1,
  position?: TypeParsablePoint,
  tris?: 2 | 3,
  sidesToDraw?: number,
  angleToDraw?: number,
  transform?: Type3DMatrix | TypeParsableTransform,
};

/**
 * @property {number} [innerRadius] distance from center to inside polygon
 * corner
 *
 * @extends OBJ_GEOPolygon
 */
export type OBJ_GEOPolygonLine = {
  innerRadius?: number,
} & OBJ_GEOPolygon;

function getPolygonCorners(
  radius: number,
  sides: number,
  rotation: number,
  direction: 1 | -1,
  position: Point,
  transformMatrix: Type3DMatrix | null,
) {
  const points = Array(sides);
  const deltaAngle = Math.PI * 2 / sides;
  for (let i = 0; i < sides; i += 1) {
    const theta = rotation + i * deltaAngle * direction;
    points[i] = new Point(
      radius * Math.cos(theta) + position.x,
      radius * Math.sin(theta) + position.y,
    );
  }
  if (transformMatrix != null) {
    for (let i = 0; i < sides; i += 1) {
      points[i] = points[i].transformBy(transformMatrix);
    }
  }
  return points;
}

function processOptions(options: OBJ_GEOPolygon) {
  const o = joinObjects(
    {
      sides: 4,
      radius: 1,
      rotation: 0,
      direction: 1,
      position: [0, 0, 0],
    },
    options,
  );
  const p = getPoint(o.position);
  let matrix = null;
  if (o.transform != null) {
    matrix = getMatrix(o.transform);
  }
  let { innerRadius } = o;
  if (o.innerRadius == null) {
    innerRadius = o.radius * 0.5;
  }
  return [
    o.radius, o.sides, o.rotation, o.direction, p, matrix, o.tris, innerRadius,
  ];
}

/**
 * Create points a regular polygon.
 *
 * Can return either:
 * - Array<{@link Point}> - corners of a polygon
 * - Array<`number`> - interlaced points of triangles used to a polygon fill
 */
function polygon(options: OBJ_GEOPolygon): Array<Point> | Array<number> {
  const [
    radius, sides, rotation, direction, position, matrix, tris,
  ] = processOptions(options);

  const points = getPolygonCorners(radius, sides, rotation, direction, position, matrix);
  if (tris == null) {
    return points;
  }

  const triangles = Array(sides * 3);
  for (let i = 0; i < sides - 1; i += 1) {
    triangles[i * 3] = position;
    triangles[i * 3 + 1] = points[i];
    triangles[i * 3 + 2] = points[i + 1];
  }
  triangles[sides * 3 - 3] = position;
  triangles[sides * 3 - 2] = points[sides - 1];
  triangles[sides * 3 - 1] = points[0];
  return pointsToArray(triangles, tris);
}

/**
 * Create a solid regular polygon line.
 *
 * Can return either:
 * - Array<{@link Point}> - [inner corner 0, outer corner 0, inner corner 1,
 *   outer corner 1, inner corner 2...]
 * - Array<`number`> - interlaced points of triangles used to a polygon line
 */
function polygonLine(options: OBJ_GEOPolygon): Array<Point> | Array<number> {
  const [
    radius, sides, rotation, direction, position, matrix, tris, innerRadius,
  ] = processOptions(options);

  const points = getPolygonCorners(radius, sides, rotation, direction, position, matrix);

  const inPoints = getPolygonCorners(innerRadius, sides, rotation, direction, position, matrix);

  if (tris == null) {
    const out = Array(sides * 2);
    for (let i = 0; i < sides; i += 1) {
      out[i * 2] = inPoints[i];
      out[i * 2 + 1] = points[i];
    }
    return out;
  }

  const triangles = Array(sides * 6);
  for (let i = 0; i < sides - 1; i += 1) {
    triangles[i * 6 + 0] = inPoints[i];
    triangles[i * 6 + 1] = points[i];
    triangles[i * 6 + 2] = points[i + 1];
    triangles[i * 6 + 3] = inPoints[i];
    triangles[i * 6 + 4] = points[i + 1];
    triangles[i * 6 + 5] = inPoints[i + 1];
  }
  triangles[sides * 6 - 6] = inPoints[sides - 1];
  triangles[sides * 6 - 5] = points[sides - 1];
  triangles[sides * 6 - 4] = points[0];
  triangles[sides * 6 - 3] = inPoints[sides - 1];
  triangles[sides * 6 - 2] = points[0];
  triangles[sides * 6 - 1] = inPoints[0];
  return pointsToArray(triangles, tris);
}

export {
  polygon,
  polygonLine,
};
