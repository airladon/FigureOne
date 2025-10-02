// Migrated from prism.js (Flow) to TypeScript. Comments/docstrings preserved and logic unchanged.
import { getPoints, Point } from '../geometry/Point';
import { getTransform } from '../geometry/Transform';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import { getNormal } from '../geometry/Plane';
// import * as m3 from '../m3';
// import { toPoints } from '../geometry/tools';
import type { TypeParsableTransform } from '../geometry/Transform';

/**
 * Prism options object.
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
 * @property {TypeParsableTransform} [transform] transform to apply to all
 * points of prism
 * @property {boolean} [lines] if `true` then points representing
 * the edges of the prism will be returned. If `false`, then points
 * representing triangle bases and associated normals will be returned.
 * (`false`)
 */
export type OBJ_PrismPoints = {
  base?: Array<TypeParsablePoint>,
  baseTriangles?: Array<TypeParsablePoint>,
  length?: number,
  transform?: TypeParsableTransform,
  lines?: boolean,
}

type PrismOptionsDefined = {
  base: Array<TypeParsablePoint>,
  baseTriangles?: Array<TypeParsablePoint>,
  length: number,
  transform?: TypeParsableTransform,
  lines: boolean,
}

function toLines(
  base: Array<TypeParsablePoint>,
  length: number,
  transform?: TypeParsableTransform,
): Array<Point> {
  const frontFace: Point[] = [];
  const basePoints = getPoints(base);

  for (let i = 0; i < basePoints.length - 1; i += 1) {
    frontFace.push(basePoints[i], basePoints[i + 1]);
  }
  frontFace.push(basePoints[basePoints.length - 1], basePoints[0]);
  const backFace = frontFace.map((p: Point) => p.add(0, 0, length));
  const sides: Point[] = [];
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
 * The points can either represent the triangles that make up each base, or
 * represent the start and end points lines that are the edges of the prism.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_PrismPoints} options cube options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 */
export default function prism(options: OBJ_PrismPoints): [Point[]] | [Point[], Point[]] {
  const o = joinObjects<PrismOptionsDefined>({
    base: [],
    length: 1,
    lines: false,
  }, options as any);
  const {
    base, length, transform, lines, baseTriangles,
  } = o;
  // let axisToUse = getPoint(axis);
  // if (depth != null) {
  //   axisToUse = axisToUse.normalize().scale(depth);
  // }
  if (lines) {
    return [toLines(base, length, transform)];
  }

  const baseBorder = getPoints(base);
  const zBaseBorder = baseBorder.map((p: Point) => p.add(0, 0, length));
  let baseFace: Point[] = [];
  if (baseTriangles != null) {
    baseFace = getPoints(baseTriangles);
  } else {
    for (let i = 2; i < baseBorder.length; i += 1) {
      baseFace.push(baseBorder[0], baseBorder[i], baseBorder[i - 1]);
    }
  }
  const zBaseFace = baseFace.map((p: Point) => p.add(0, 0, length));
  const sides: Point[] = [];
  for (let i = 0; i < baseBorder.length - 1; i += 1) {
    sides.push(zBaseBorder[i], baseBorder[i], baseBorder[i + 1]);
    sides.push(zBaseBorder[i], baseBorder[i + 1], zBaseBorder[i + 1]);
  }
  const j = baseBorder.length - 1;
  sides.push(zBaseBorder[j], baseBorder[j], baseBorder[0]);
  sides.push(zBaseBorder[j], baseBorder[0], zBaseBorder[0]);

  let triangles: Point[] = [...baseFace, ...sides, ...zBaseFace];
  let normals: Point[] = [];
  for (let i = 0; i < baseFace.length; i += 1) {
    normals.push(new Point(0, 0, -1));
  }
  for (let i = 0; i < sides.length - 2; i += 3) {
    const normal = getNormal(sides[i], sides[i + 1], sides[i + 2]);
    normals.push(normal._dup(), normal._dup(), normal._dup());
  }
  for (let i = 0; i < baseFace.length; i += 1) {
    normals.push(new Point(0, 0, 1));
  }
  if (transform != null) {
    const matrix = getTransform(transform).matrix();
    triangles = triangles.map((p: Point) => p.transformBy(matrix));
    normals = normals.map((p: Point) => p.transformBy(matrix));
  }

  return [triangles, normals];
}
