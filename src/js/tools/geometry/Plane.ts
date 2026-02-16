/* eslint-disable no-use-before-define */
import { Line, getLine } from './Line';
import { Point, getPoint, getPoints } from './Point';
import { round } from '../math';
import { getPrecision, dotProduct } from './common';
import type { TypeParsablePoint } from './Point';
import type { TypeParsableLine } from './Line';

/**
 * Recorder state definition of a {@link Plane} that represents a position
 * and normal vector
 *
 * ```
 * {
 *   f1Type: 'pl',
 *   state: [[number, number, number], [number, number, number]],
 * }
 * ```
 * @group Misc Geometry
 */
export type TypeF1DefPlane = {
  f1Type: 'pl',
  state: [[number, number, number], [number, number, number]],
}

/**
 * A {@link Plane} is defined with either:
 * - an instantiated {@link Plane}
 * - a position and normal vector
 *   [{@link TypeParsablePoint}, {@link TypeParsablePoint}]
 * - three points [{@link TypeParsablePoint}, {@link TypeParsablePoint},
 *   {@link TypeParsablePoint}]
 * - A recorder state definition {@link TypeF1DefPlane}
 * - A string representation of all options except the first
 *
 * When defining 3 points p1, p2 and p3, the normal will be in the direction of
 * the cross product of p12 with p13.
 *
 *
 * @example
 * // p1, p2, and p3 are all equal planes
 * p1 = new Fig.Plane([0, 0, 0], [0, 1, 0]);
 * p2 = Fig.getPlane([[0, 0, 0], [0, 1, 0]]);
 * p3 = Fig.getPlane([[0, 0, 0], [1, 0, 0], [0, 0, 1]]);
 * @group Geometry
 */
export type TypeParsablePlane = [TypeParsablePoint, TypeParsablePoint]
                | [TypeParsablePoint, TypeParsablePoint, TypeParsablePoint] |
                Plane | string;

function parsePlane(pIn: TypeParsablePlane): Plane {
  if (pIn instanceof Plane) {
    return pIn;
  }
  if (pIn == null) {
    throw new Error(`FigureOne could not parse plane with no input: '${pIn}'`);
  }

  let p: any = pIn as any;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      throw new Error(`FigureOne could not parse plane from string: '${p}'`);
    }
  }

  if (Array.isArray(p) && p.length === 2) {
    return new Plane(p[0], p[1] as any);
  }
  if (Array.isArray(p) && p.length === 3) {
    return new Plane(p[0], p[1], p[2]);
  }

  if ((p as any).f1Type != null) {
    if (
      (p as any).f1Type === 'pl'
      && (p as any).state != null
      && Array.isArray((p as any).state)
    ) {
      const [p0, n] = (p as any).state as any;
      return new Plane(p0, n);
    }
    throw new Error(`FigureOne could not parse point from state: ${JSON.stringify(pIn)}`);
  }
  throw new Error(`FigureOne could not parse point: ${JSON.stringify(pIn)}`);
}

/**
 * Chech if input parameter can be parsed as a {@link Plane}.
 * @return {boolean}
 * @group Misc Geometry
 */
function isParsablePlane(pIn: any): boolean {
  try {
    parsePlane(pIn as any);
  } catch {
    return false;
  }
  return true;
}

/**
 * Parse a {@link TypeParsablePoint} and return a {@link Point}.
 * @return {Point}
 * @group Misc Geometry
 */
function getPlane(p: TypeParsablePlane): Plane {
  return parsePlane(p);
}

/**
 * Object representing a plane.
 *
 * Contains methods that makes it convenient to operate on planes,
 * points and lines.
 *
 * A plane can either be created with:
 * - a point on the plane and a normal
 * - 3 points on the plane
 *
 * If defined with 3 points P1, P2, and P3, then the normal will be in the
 * direction of the cross product of vectors P1P2 and P1P3.
 *
 * @example
 * // define a plane at the origin in the XZ plane
 * const p = new Plane([0, 0, 0], [0, 1, 0]);
 *
 * // see if a point is on the plane
 * const result = p.hasPointOn([1, 0, 1]);
 *
 * // find the intersect with a line
 * const i = lineIntersect([[0, -0.5, 0], [0, 0.5, 0]])
 * @group Geometry
 */
class Plane {
  p: Point;  // Point on plane
  n: Point;  // Plane normal

  /**
   * @return {Plane} a XY plane through the origin
   */
  static xy() {
    return new Plane([0, 0, 0], [0, 0, 1]);
  }

  /**
   * @return {Plane} a XZ plane through the origin
   */
  static xz() {
    return new Plane([0, 0, 0], [0, 1, 0]);
  }

  /**
   * @return {Plane} a YZ plane through the origin
   */
  static yz() {
    return new Plane([0, 0, 0], [1, 0, 0]);
  }

  /**
   * @param {TypeParsablePlane | TypeParsablePoint} p1OrDef position of plane
   * or parsable plane definition
   * @param {TypeParsablePoint | null} normalOrP2 if `p1OrDef` is a point and
   * `p3` is `null`, then
   * this parameter will define the plane normal (`null`)
   * @param {TypeParsablePoint | null} p3 if defined, then `p1OrDef` and
   * `normalOrP2` will define the first two points of a three point plane
   * definition
   */
  constructor(
    p1OrDef: TypeParsablePlane | TypeParsablePoint = [[0, 0, 0], [0, 0, 1]],
    normalOrP2: null | TypeParsablePoint = null,
    p3: null | TypeParsablePoint = null,
  ) {
    if (normalOrP2 == null && p3 == null) {
      const parsed = parsePlane(p1OrDef as TypeParsablePlane);
      this.p = parsed.p;
      this.n = parsed.n;
      return;
    }
    if (p3 == null) {
      this.p = getPoint(p1OrDef as TypeParsablePoint);
      this.n = getPoint(normalOrP2 as TypeParsablePoint).normalize();
    } else {
      this.p = getPoint(p1OrDef as TypeParsablePoint);
      const p2 = getPoint(normalOrP2 as TypeParsablePoint);
      this.n = p2.sub(this.p).crossProduct(getPoint(p3 as TypeParsablePoint).sub(this.p)).normalize();
    }
  }

  _dup() {
    return new Plane(this.p, this.n);
  }

  _state(options: { precision: number }) {
    const precision = getPrecision(options);
    return {
      f1Type: 'pl',
      state: [
        [
          round(this.p.x, precision),
          round(this.p.y, precision),
          round(this.p.z, precision),
        ],
        [
          round(this.n.x, precision),
          round(this.n.y, precision),
          round(this.n.z, precision),
        ],
      ],
    };
  }

  /**
   * Return a plane with all values rounded to a precision.
   * @param {number} precision
   * @return {Plane}
   */
  round(precision: number = 8) {
    return new Plane(this.p.round(precision), this.n.round(precision));
  }

  /**
   * `true` if point p lies on plane
   * @param {TypeParsablePoint} p
   * @param {number} precision
   * @return {boolean}
   */
  hasPointOn(p: TypeParsablePoint, precision: number = 8) {
    const pnt = getPoint(p);
    const pDelta = pnt.sub(this.p);
    const d = round(
      dotProduct(
        pDelta.toArray(3) as [number, number, number],
        this.n.toArray(3) as [number, number, number],
      ),
      precision,
    );
    if (d === 0) {
      return true;
    }
    return false;
  }

  /**
   * Two planes are considered equal if they are parallel, and the same
   * point exists on both planes.
   *
   * If the plane normal direction also needs to be compared, then use `includeNormal = true`.
   *
   * @param {TypeParsablePlane} plane
   * @param {boolean} includeNormal
   * @param {number} precision
   * @return {boolean}
   */
  isEqualTo(plane: TypeParsablePlane, includeNormal: boolean = false, precision: number = 8) {
    const p = getPlane(plane);
    if (this.hasPointOn(p.p, precision) && this.isParallelTo(p, precision)) {
      if (includeNormal) {
        if (this.n.isNotEqualTo(p.n, precision)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * `true` if two planes are parallel to each other.
   * @param {TypeParsablePlane} plane
   * @param {number} precision
   * @return {boolean}
   */
  isParallelTo(plane: TypeParsablePlane, precision: number = 8) {
    const p = getPlane(plane);
    const d = round(this.n.dotProduct(p.n), precision);
    if (d === 1 || d === -1) {
      return true;
    }
    return false;
  }

  /**
   * Returns intersect line of two planes. Returns `null` if planes are parallel
   * and have no intersect.
   *
   * @param {TypeParsablePlane} plane
   * @param {number} precision
   * @return {null | Line} intersect line
   */
  intersectsWith(plane: TypeParsablePlane, precision: number = 8) {
    // https://vicrucann.github.io/tutorials/3d-geometry-algorithms/
    const p = getPlane(plane);
    if (this.isParallelTo(p, precision)) {
      return null;
    }
    const u = this.n.crossProduct(p.n).normalize();
    const ax = Math.abs(u.x);
    const ay = Math.abs(u.y);
    const az = Math.abs(u.z);

    let max;
    if (ax > ay) {
      max = ax > az ? 1 : 3;
    } else {
      max = ay > az ? 2 : 3;
    }

    const n1 = this.n;
    const n2 = p.n;

    const d1 = -n1.dotProduct(this.p);
    const d2 = -n2.dotProduct(p.p);
    let xi: number;
    let yi: number;
    let zi: number;

    if (max === 1) {
      xi = 0;
      yi = (d2 * n1.z - d1 * n2.z) / u.x;
      zi = (d1 * n2.y - d2 * n1.y) / u.x;
    } else if (max === 2) {
      xi = (d1 * n2.z - d2 * n1.z) / u.y;
      yi = 0;
      zi = (d2 * n1.x - d1 * n2.x) / u.y;
    } else {
      xi = (d2 * n1.y - d1 * n2.y) / u.z;
      yi = (d1 * n2.x - d2 * n1.x) / u.z;
      zi = 0;
    }
    const p0 = new Point(xi, yi, zi);
    return new Line({
      p1: p0, direction: u, length: 1, ends: 0,
    });
  }

  /**
   * `true` if line is parallel to plane.
   *
   * @param {TypeParsableLine} line
   * @param {number} precision
   * @return {boolean}
   */
  isParallelToLine(line: TypeParsableLine, precision: number = 8) {
    const l = getLine(line);
    const d = round(this.n.dotProduct(l.vector()), precision);
    if (d === 0) {
      return true;
    }
    return false;
  }

  /**
   * Returns the intersect point for a line (extended to infinity) with a plane.
   * @param {TypeParsableLine} line
   * @param {number} precision
   * @return {Point | null} intersect point. `null` if the line does not
   * intersect
   */
  lineIntersect(line: TypeParsableLine, precision: number = 8) {
    // https://vicrucann.github.io/tutorials/3d-geometry-algorithms/
    const l = getLine(line);
    if (this.isParallelToLine(l, precision)) {
      return null;
    }
    const C = this.p;
    const F = l.p1;
    const N = l.p2;
    const FN = N.sub(F);
    const { n } = this;
    const x = C.sub(N).dotProduct(n) / FN.dotProduct(n);
    return FN.scale(x).add(N);
  }

  /**
   * `true` if a line lies within the plane
   * @param {TypeParsableLine} line
   * @param {number} precision
   * @return {Point | null} intersect point. `null` if the line does not
   * intersect
   */
  hasLineOn(line: TypeParsableLine, precision: number = 8) {
    const l = getLine(line);
    if (!this.isParallelToLine(l, precision)) {
      return false;
    }
    if (!this.hasPointOn(l.p1, precision)) {
      return false;
    }
    return true;
  }

  /**
   * Project a point onto the plane
   * @param {TypeParsablePoint} p
   * @return {Point}
   */
  pointProjection(p: TypeParsablePoint) {
    // https://stackoverflow.com/questions/9605556/how-to-project-a-point-onto-a-plane-in-3d - Mr H
    const o = this.p;
    const { n } = this;
    const q = getPoint(p);
    return q.sub(n.scale(n.dotProduct(q.sub(o))));
  }

  /**
   * Distance between plane and point
   * @param {TypeParsablePoint} p
   * @return {number}
   */
  distanceToPoint(p: TypeParsablePoint) {
    const projection = this.pointProjection(p);
    return projection.distance(p);
  }

  // TODO - test this
  reflect(vector: TypeParsablePoint) {
    const V = getPoint(vector);
    return this.n.scale(-2 * (this.n.dotProduct(V))).add(V).normalize();
  }
}

/**
 * Get plane created with three points.
 *
 * Normal is in the direction of the cross product of p12 and p13
 * @param {TypeParsablePoint | [TypeParsablePoint, TypeParsablePoint, TypeParsablePoint]} p1OrPoints
 * @param {TypeParsablePoint} p2
 * @param {TypeParsablePoint} p3
 * @group Misc Geometry
 */
function getNormal(
  p1OrPoints: TypeParsablePoint | [TypeParsablePoint, TypeParsablePoint, TypeParsablePoint],
  p2: null | TypeParsablePoint = null,
  p3: null | TypeParsablePoint = null,
): Point {
  let p = getPoints(p1OrPoints);
  if (p.length === 1 && p2 != null && p3 != null) {
    p = [p[0], getPoint(p2), getPoint(p3)];
  }
  const m = p[1].sub(p[0]);
  const n = p[2].sub(p[0]);
  return m.crossProduct(n).normalize();
}

export {
  isParsablePlane,
  Plane,
  getPlane,
  getNormal,
};
