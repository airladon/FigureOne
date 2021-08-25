// @flow
/* eslint-disable no-use-before-define */
import { Line, getLine } from './Line';
import { Point, getPoint, getPoints } from './Point';
import { round } from '../math';
import { getPrecision, dotProduct } from './common';
import type { TypeParsablePoint } from './Point';
import type { TypeParsableLine } from './Line';

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

  let p = pIn;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      throw new Error(`FigureOne could not parse plane from string: '${p}'`);
    }
  }

  if (Array.isArray(p) && p.length === 2) {
    return new Plane(p[0], p[1]);
  }
  if (Array.isArray(p) && p.length === 3) {
    return new Plane(p[0], p[1], p[2]);
  }

  if (p.f1Type != null) {
    if (
      p.f1Type === 'pl'
      && p.state != null
      && Array.isArray(p.state)
    ) {
      const [p0, n] = p.state;
      return new Plane(p0, n);
    }
    throw new Error(`FigureOne could not parse point from state: ${JSON.stringify(pIn)}`);
  }
  throw new Error(`FigureOne could not parse point: ${JSON.stringify(pIn)}`);
}

function isParsablePlane(pIn: any) {
  try {
    parsePlane(pIn);
  } catch {
    return false;
  }
  return true;
}

/**
 * Parse a {@link TypeParsablePoint} and return a {@link Point}.
 * @return {Point}
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
 * @example TODO
 */
class Plane {
  p: Point;  // Point on plane
  n: Point;  // Plane normal

  static xy() {
    return new Plane([0, 0, 0], [0, 0, 1]);
  }

  static xz() {
    return new Plane([0, 0, 0], [0, 1, 0]);
  }

  static yz() {
    return new Plane([0, 0, 0], [1, 0, 0]);
  }

  constructor(  // $FlowFixMe
    p1OrDef: TypeParsablePlane | TypeParsablePoint = [[0, 0, 0], [0, 0, 1]],
    normalOrP2: null | TypeParsablePoint = null,
    p3: null | TypeParsablePoint = null,
  ) {
    if (normalOrP2 == null && p3 == null) { // $FlowFixMe
      return parsePlane(p1OrDef);
    }
    if (p3 == null) { // $FlowFixMe
      this.p = getPoint(p1OrDef); // $FlowFixMe
      this.n = getPoint(normalOrP2).normalize();
    } else { // $FlowFixMe
      this.p = getPoint(p1OrDef); // $FlowFixMe
      const p2 = getPoint(normalOrP2);
      this.n = p2.sub(this.p).crossProduct(getPoint(p3).sub(this.p)).normalize();
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

  round(precision: number = 8) {
    return new Plane(this.p.round(precision), this.n.round(precision));
  }

  hasPointOn(p: TypeParsablePoint, precision: number = 8) {
    const pnt = getPoint(p);
    const pDelta = pnt.sub(this.p);
    const d = round(dotProduct(pDelta.toArray(), this.n.toArray()), precision);
    if (d === 0) {
      return true;
    }
    return false;
  }

  /**
   * Two planes are considered equal if they are parallel, and the same
   * point exists on both planes.
   */
  isEqualTo(plane: TypeParsablePlane, precision: number = 8) {
    const p = getPlane(plane);
    if (this.hasPointOn(p.p, precision) && this.isParallelTo(p, precision)) {
      return true;
    }
    return false;
  }

  isParallelTo(plane: TypeParsablePlane, precision: number = 8) {
    const p = getPlane(plane);
    const d = round(this.n.dotProduct(p.n), precision);
    if (d === 1 || d === -1) {
      return true;
    }
    return false;
  }

  intersectsWith(plane: Plane, precision: number = 8) {
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
    let xi;
    let yi;
    let zi;

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
    const p0 = new Point(xi, yi, zi); // $FlowFixMe
    return new Line({
      p1: p0, direction: u, length: 1, ends: 0,
    });
  }

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

  pointProjection(p: TypeParsablePoint) {
    // https://stackoverflow.com/questions/9605556/how-to-project-a-point-onto-a-plane-in-3d - Mr H
    const o = this.p;
    const { n } = this;
    const q = getPoint(p);
    return q.sub(n.scale(n.dotProduct(q.sub(o))));
  }

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

function getNormal(
  p1OrPoints: TypeParsablePoint | [TypeParsablePoint, TypeParsablePoint, TypeParsablePoint],
  p2: TypeParsablePoint,
  p3: TypeParsablePoint,
) { // $FlowFixMe
  let p = getPoints(p1OrPoints);
  if (p.length === 1) {
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
