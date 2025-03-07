// @flow
/* eslint-disable no-use-before-define */
import {
  roundNum, clipValue, round,
} from '../math';
import {
  getPrecision, dotProduct, quadraticBezier, cartesianToSpherical,
} from './common';
import type {
  Type2Components, Type3Components,
} from './types';
// import * as m2 from '../m2';
import * as m3 from '../m3';
import type { Type3DMatrix } from '../m3';
// import type { Type2DMatrix } from '../m2';

// Point definition in a state capture
type TypeF1DefPoint = {
  f1Type: 'p',
  state: [number, number, number],
};

/**
 * A {@link Point} can be defined in several ways
 * - As an instantiated {@link Point}
 * - As an x, y tuple: [number, number]
 * - As an x, y, z tuple: [number, number, number]
 * - As an x, y string: '[number, number]'
 * - As an x, y, z string: '[number, number, number]'
 * - As a recorder state definition: { f1Type: 'p', state: [number, number, number] }
 }
 * - A string representation of all options except the first
 *
 * If points are defined with only a `x` and `y` component, then `z` will be
 * set to 0 automatically.
 *
 * @example
 * // p1, p2, p3 and p4 are all the same when parsed by `getPoint`
 * p1 = new Fig.Point(2, 3);
 * p2 = [2, 3];
 * p3 = '[2, 3]';
 * p4 = { f1Type: 'p', state: [2, 3] };
 * p5 = [2, 3, 0];
 */
export type TypeParsablePoint = Type2Components
                                | Type3Components
                                | Point
                                | string
                                | TypeF1DefPoint;


function parsePoint(pIn: TypeParsablePoint): Point {
  if (pIn instanceof Point) {
    return pIn;
  }
  if (pIn == null) {
    throw new Error(`FigureOne could not parse point with no input: '${pIn}'`);
  }

  let p = pIn;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      throw new Error(`FigureOne could not parse point from string: '${p}'`);
    }
  }

  if (Array.isArray(p)) {
    try {
      if (p.length === 3 && typeof p[0] === 'number') {
        return new Point(p[0], p[1], p[2]);
      }
      if (p.length === 2 && typeof p[0] === 'number') {
        return new Point(p[0], p[1], 0);
      }
      throw new Error(`FigureOne could not parse point from array: '${JSON.stringify(pIn)}'`);
    } catch { // $FlowFixMe
      throw new Error(`FigureOne could not parse point from array: '${JSON.stringify(pIn)}'`);
    }
  }

  if (p.f1Type != null) {
    if (
      p.f1Type === 'p'
      && p.state != null
      && Array.isArray([p.state])
    ) {
      if (p.state.length === 3) {
        const [x, y, z] = p.state;
        return new Point(x, y, z);
      }
      if (p.state.length === 2) {
        const [x, y] = p.state;
        return new Point(x, y);
      }
    } // $FlowFixMe
    throw new Error(`FigureOne could not parse point from state: ${pIn}`);
  } // $FlowFixMe
  throw new Error(`FigureOne could not parse point: ${pIn}`);
}

/**
 * Test is a point is parsable
 */
function isParsablePoint(pIn: any): boolean {
  try {
    parsePoint(pIn);
  } catch {
    return false;
  }
  return true;
}

/**
 * Parse a {@link TypeParsablePoint} and return a {@link Point}.
 * @return {Point}
 */
function getPoint(p: TypeParsablePoint): Point {
  let parsedPoint = parsePoint(p);
  if (parsedPoint == null) {
    parsedPoint = new Point(0, 0);
  }
  return parsedPoint;
}


/**
 * Parse an array of parsable point definitions ({@link TypeParsablePoint})
 * returning an array of points.
 * @return {Array<Point>}
 */
function getPoints(points: TypeParsablePoint | Array<TypeParsablePoint>): Array<Point> {
  if (Array.isArray(points)) {
    if (
      (points.length === 2 || points.length === 3)
      && typeof points[0] === 'number'
    ) { // $FlowFixMe
      return [getPoint(points)];
    } // $FlowFixMe
    return points.map(p => getPoint(p));
  }
  return [getPoint(points)];
}

/**
 * Parse a scale definition and return a {@link Point} representing the scale
 * in x and y.
 * Scale can either be defined as a {@link TypeParsablePoint} or a `number` if
 * the x and y scale is equal.
 * @return {Point} x and y scale
 */
function getScale(s: TypeParsablePoint | number) {
  let parsedPoint;
  if (typeof s === 'number') {
    parsedPoint = new Point(s, s, s);
  } else if (Array.isArray(s) && s.length === 2) {
    parsedPoint = new Point(s[0], s[1], 1);
  } else {
    parsedPoint = getPoint(s);
  }
  return parsedPoint;
}

/* eslint-disable comma-dangle */
/**
 * Object representing a point or vector.
 *
 * Contains methods that makes it convenient to work with points and vectors.
 *
 * @see {@link TypeParsablePoint}, {@link isParsablePoint}
 *
 * @example
 * // get Point from Fig
 * const { Point } = Fig;
 *
 * // define a point at (0, 2)
 * const p = new Point(0, 2);
 *
 * // find the distance to another point (0, 1) which will be 1
 * const d = p.distance([0, 1]);
 *
 * // add to another point (3, 1) which will result in (3, 3)
 * const q = p.add(3, 1);
 */
class Point {
  x: number;
  y: number;
  z: number;
  _type: 'point';

  constructor(
    xOrArray: Type3Components | Type2Components | number,
    y: number = 0,
    z: number = 0,
  ) {
    this._type = 'point';
    if (Array.isArray(xOrArray)) {
      try {
        const [_x, _y] = xOrArray;
        let _z = 0;
        if (xOrArray.length === 3) {
          [, , _z] = xOrArray;
        }
        this.x = _x;
        this.y = _y;
        this.z = _z;
      } catch {
        if (xOrArray.length !== 3) {
          throw new Error(`FigureOne Point creation failed - array definition must have length of 3: ${JSON.stringify(xOrArray)}`);
        }
      }
      return;
    }
    this.x = xOrArray;
    this.y = y;
    this.z = z;
  }

  /**
   * Return x, y, z components as a length 3 tuple.
   * @return {[number, number, number]}
   */
  toArray(dimension: 2 | 3 = 3) {
    if (dimension === 2) {
      return [this.x, this.y];
    }
    return [this.x, this.y, this.z];
  }

  /**
   * Convert a cartesian point to polar coordiantes (will use x and y
   * components of point only).
   * @return {{ mag: number, angle: number }}
   */
  toPolar() {
    return {
      mag: Math.sqrt(this.x ** 2 + this.y ** 2),
      angle: Math.atan2(this.y, this.x),
    };
  }

  /**
   * Convert the cartesian point to spherical coordinates.
   * @return {{ mag: number, theta: number, phi: number }}
   */
  toSpherical() {
    const [mag, theta, phi] = cartesianToSpherical(this.x, this.y, this.z);
    return {
      mag, theta, phi,
    };
  }

  _state(options: { precision: number } = { precision: 8 }) {
    const precision = getPrecision(options);
    return {
      f1Type: 'p',
      state: [
        roundNum(this.x, precision),
        roundNum(this.y, precision),
        roundNum(this.z, precision),
      ],
    };
  }

  /**
   * Return a duplicate of the {@link Point} object
   * @return {Point}
   */
  _dup(): Point {
    return new this.constructor(this.x, this.y, this.z);
  }

  /**
   * Multiply values of point by scalar
   * @return {Point}
   * @example
   * p = new Point(1, 1, 1);
   * s = p.scale(3);
   * // s = Point{x: 3, y: 3, z: 3}
   */
  scale(scalar: number): Point {
    return new this.constructor(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Return a point with the negative of each component.
   *
   * @return {Point}
   *
   * @example
   * p = new Point(1, 2, 3);
   * q = p.neg();
   * // q = Point{x: -1, y: -2, z: -3}
   */
  neg(): Point {
    return new this.constructor(-this.x, -this.y, -this.z);
  }

  /**
   * Multiply each corresponding component of two points.
   *
   * @return {Point}
   *
   * @example
   * p = new Point(2, 3, 4);
   * q = new Point(3, 4, 5);
   * m = p.mul(q);
   * // m = Point{x: 6, y: 12, z: 20}
   */
  mul(p: TypeParsablePoint) {
    const q = getPoint(p);
    return new this.constructor(this.x * q.x, this.y * q.y, this.z * q.z);
  }

  /**
   * Complex multiplication.
   *
   * Multiply two 2D points such that x is the real value and
   * y is the imaginary value of a complex number. z is ignored.
   * @return {Point}
   * @example
   * p = new Point(1, 2); // represents 1 + 2i
   * q = new Point(2, 3); // represents 2 + 3i
   * m = p.cmul(q);
   * // m = Point{x: -4, y: 7, z: 0}
   * // which represents the complex value -4 + 7i
   */
  cmul(complexPoint: TypeParsablePoint) {
    const b = getPoint(complexPoint);
    return new this.constructor(
      this.x * b.x - this.y * b.y,
      this.x * b.y + this.y * b.x,
    );
  }

  /**
   * Complex division.
   *
   * Divide this point by `complexPoint`. Each point represents a complex
   * number where x is the real value and y is the imaginary value.
   * z is ignored.
   * @return {Point}
   * @example
   * p = new Point(-4, 7); // represents -4 + 7i
   * q = new Point(1, 2); // represents 1 + 2i
   * m = p.cdiv(q);
   * // m = Point{x: 2, y: 3, z: 0}
   * // which represents the complex value 2 + 3i
   */
  cdiv(complexPoint: TypeParsablePoint) {
    const b = getPoint(complexPoint);
    const den = b.x * b.x + b.y * b.y;
    return new this.constructor(
      (this.x * b.x + this.y * b.y) / den,
      (-this.x * b.y + this.y * b.x) / den,
    );
  }

  /**
   * Subtract (x, y, z) values or a {@link Point} and return the difference as a new {@link Point}
   * @return {Point}
   * @example
   * p = new Point(3, 3, 3);
   * d = p.sub(1, 1, 1)
   * // d = Point{x: 2, y: 2, z: 2}
   *
   * p = new Point(3, 3, 3);
   * q = new Point(1, 1, 1);
   * d = p.sub(q)
   * // d = Point{x: 2, y: 2, z: 2}
   */
  sub(pointOrX: Point | number, y: number = 0, z: number = 0): Point {
    if (typeof pointOrX === 'number') {
      return new this.constructor(this.x - pointOrX, this.y - y, this.z - z);
    }
    return new this.constructor(this.x - pointOrX.x, this.y - pointOrX.y, this.z - pointOrX.z);
  }

  /**
   * Add (x, y, z) values or a {@link Point} and return the sum as a new {@link Point}
   * @return {Point}
   * @example
   * p = new Point(3, 3, 3);
   * d = p.add(1, 1, 1)
   * // d = Point{x: 4, y: 4, z: 4}
   *
   * p = new Point(3, 3, 3);
   * q = new Point(1, 1, 1);
   * d = p.add(q)
   * // d = Point{x: 4, y: 4, z: 4}
   */
  add(pointOrX: Point | number, y: number = 0, z: number = 0): Point {
    if (typeof pointOrX === 'number') {
      return new this.constructor(this.x + pointOrX, this.y + y, this.z + z);
    }
    return new this.constructor(this.x + pointOrX.x, this.y + pointOrX.y, this.z + pointOrX.z);
  }

  /**
   * Return the distance between two points (or point and origin if no input
   * supplied)
   * @return {number}
   * @example
   * p = new Point(1, 1, 1);
   * q = new Point(0, 0, 0);
   * d = q.distance(p);
   * // d = 1.7320508075688772
   *
   */
  distance(toPointIn: TypeParsablePoint | null = null): number {
    if (toPointIn == null) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    const p = getPoint(toPointIn);
    return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2 + (this.z - p.z) ** 2);
  }

  /**
   * Return the distance between (0, 0, 0) and the point. If the point
   * represents a vector, then it is the length of the vector.
   * @return {number}
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Dot product this point (vector) with another.
   * @return {number}
   */
  dotProduct(v: TypeParsablePoint) {
    const q = getPoint(v);
    return dotProduct([this.x, this.y, this.z], [q.x, q.y, q.z]);
  }

  /**
   * Cross product of two points (vectors).
   * @return {Point}
   */
  crossProduct(v: TypeParsablePoint) {
    const q = getPoint(v);
    return new Point(
      this.y * q.z - this.z * q.y,
      -(this.x * q.z - this.z * q.x),
      this.x * q.y - this.y * q.x,
    );
  }

  /**
   * Angle between this vector and vector v.
   * @return {number}
   */
  angleTo(v: TypeParsablePoint) {
    const p = getPoint(v);
    const pLength = p.length();
    const thisLength = this.length();
    if (pLength === 0 || thisLength === 0) {
      return 0;
    }
    let dot = this.dotProduct(p) / pLength / thisLength;
    if (dot < -1) {
      dot = -1;
    } else if (dot > 1) {
      dot = 1;
    }
    return Math.acos(dot);
  }

  /**
   * Scalar projection of this vector in direction of vector v.
   * @return {number}
   */
  projectOn(v: TypeParsablePoint) {
    return this.length() * Math.cos(this.angleTo(v));
  }

  /**
   * Return a vector with magnitude of the scalar projection of this vector on
   * v and direction +/- v (depending on the sign of the scalar projection).
   * @return {Point}
   */
  componentAlong(v: TypeParsablePoint) {
    const mag = this.projectOn(v);
    return getPoint(v).normalize().scale(mag);
  }

  /**
   * Returns `true` if the x, y, z components of the point when rounded
   * with `precision` are zero.
   * @return {boolean}
   */
  isZero(precision: number = 8) {
    if (
      round(this.x, precision) === 0
      && round(this.y, precision) === 0
      && round(this.z, precision) === 0
    ) {
      return true;
    }
    return false;
  }

  /**
   * Return a new point with (x, y, z) values rounded to some precision
   * @return {Point}
   * @example
   * p = new Point(1.234, 1.234, 1.234);
   * q = p.round(2);
   * // q = Point{x: 1.23, y: 1.23, z: 1.23}
   */
  round(precision: number = 8): Point {
    return new this.constructor(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      roundNum(this.z, precision),
    );
  }

  /**
   * Return a new point that is clipped to min and max values from the origin.
   *
   * Use a point as a parameter to define different (x, y) min/max values,
   * a number to define the same (x, y) min/max values, or null to have no
   * min/max values.
   * @return {Point}
   * @example
   * p = new Point(2, 2);
   * q = p.clip(1, 1);
   * // q = Point{x: 1, y: 1}
   *
   * p = new Point(2, 2);
   * q = p.clip(1, null);
   * // q = Point{x: 1, y: 2}
   *
   * p = new Point(-2, -2);
   * minClip = new Point(-1, -1.5);
   * q = p.clip(minClip, null);
   * // q = Point{x: -1, y: -1.5}
   */
  clip(min: Point | number | null, max: Point | number | null): Point {
    let minX;
    let minY;
    let minZ;
    let maxX;
    let maxY;
    let maxZ;
    if (typeof min === 'number' || min == null) {
      minX = min;
      minY = min;
      minZ = min;
    } else {
      minX = min.x;
      minY = min.y;
      minZ = min.z;
    }
    if (typeof max === 'number' || max == null) {
      maxX = max;
      maxY = max;
      maxZ = max;
    } else {
      maxX = max.x;
      maxY = max.y;
      maxZ = max.z;
    }
    const x = clipValue(this.x, minX, maxX);
    const y = clipValue(this.y, minY, maxY);
    const z = clipValue(this.z, minZ, maxZ);
    return new this.constructor(x, y, z);
  }

  /**
   * Transform the point with a 4x4 matrix (3 dimensional transform in
   * homogenous coordinates)
   * @return {Point}
   * @example
   * // Transform a point with a (2, 2, 0) translation then 90º z rotation
   * p = new Point(1, 1);
   * m = new Transform3().translate(2, 2, 0).rotate(0, 0, Math.PI / 2).matrix();
   * // m = [0, -1, 0, -2, 1, 0, 0, 2, 0, 0, 0, 1]
   * q = p.transformBy(m)
   * // q = Point{x: -3, y: 3, 0}
  */
  transformBy(matrix: Type3DMatrix): Point {
    // if (matrix.length === 9) {
    //   const transformedPoint = m2.transform(matrix, this.x, this.y);
    //   return new Point(transformedPoint[0], transformedPoint[1]);
    // }
    // const transformedPoint = m3.transform(matrix, this.x, this.y, this.z);
    const transformedPoint = m3.transform(matrix, this.x, this.y, this.z);
    return new this.constructor(transformedPoint[0], transformedPoint[1], transformedPoint[2]);
  }

  quadraticBezier(p1: Point, p2: Point, t: number) {
    const bx = quadraticBezier(this.x, p1.x, p2.x, t);
    const by = quadraticBezier(this.y, p1.y, p2.y, t);
    const bz = quadraticBezier(this.z, p1.z, p2.z, t);
    return new this.constructor(bx, by, bz);
  }

  /**
   * Rotate a point some angle around a point
   * @param {number} angle - in radians
   * @param center - in radians
   * @return {Point}
   * @example
   * // Rotate a point around the origin
   * p = new Point(1, 0);
   * q = p.rotate(Math.PI)
   * // q = Point{x: -1, y: 0}
   *
   * // Rotate a point around (1, 1)
   * p = new Point(2, 1);
   * q = p.rotate(Math.PI, new Point(1, 1))
   * // q = Point{x: 0, y: 1}
   */
  rotate(
    angle: number,
    center?: TypeParsablePoint = new Point(0, 0, 0),
    axis?: TypeParsablePoint = new Point(0, 0, 1),
  ): Point {
    const a = getPoint(axis);
    const c = getPoint(center);
    const centered = this.sub(c);
    const rotated = centered.transformBy(m3.rotationMatrixAxis(a.toArray(), angle));

    return rotated.add(c);
  }

  /**
   * Return the unit vector of the point (the direction vector of length 1
   * from the origin to the point).
   * @return {Point}
   */
  normalize() {
    const len = this.length();
    return new Point(this.x / len, this.y / len, this.z / len);
  }

  /* eslint-enable comma-dangle */

  /**
   * Compare two points for equality to some precision or delta
   * @param {TypeParsablePoint} p point to compare
   * @param {number} precision precision to compare (`8`)
   * @param {boolean} delta if `true` then precision is the delta value the two
   * points must be within to be equal
   * @return {boolean}
   * @example
   * p = new Point(1.123, 1.123);
   * q = new Point(1.124, 1.124);
   * p.isEqualTo(q)
   * // false
   *
   * p.isEqualTo(q, 2)
   * // true
   */
  isEqualTo(
    p: TypeParsablePoint,
    precision: number = 8,
    delta: boolean = false,
  ) {
    let pr = this;
    let qr = getPoint(p);

    if (delta) {
      return this.isWithinDelta(qr, precision);
    }

    if (typeof precision === 'number') {
      pr = this.round(precision);
      qr = qr.round(precision);
    }
    if (pr.x !== qr.x || pr.y !== qr.y || pr.z !== qr.z) {
      return false;
    }
    return true;
  }

  isWithinDelta(p: Point, delta: number = 0.0000001) {
    const dX = Math.abs(this.x - p.x);
    const dY = Math.abs(this.y - p.y);
    const dZ = Math.abs(this.z - p.z);
    if (dX > delta || dY > delta || dZ > delta) {
      return false;
    }
    return true;
  }

  /**
   * Compare two points for unequality to some precision
   * @example
   * p = new Point(1.123, 1.123);
   * q = new Point(1.124, 1.124);
   * p.isNotEqualTo(q)
   * // true
   *
   * p.isNotEqualTo(q, 2)
   * // false
   */
  isNotEqualTo(p: Point, precision: number = 8, delta: boolean = false) {
    return !this.isEqualTo(p, precision, delta);
  }

  isNotWithinDelta(p: Point, delta: number = 0.0000001) {
    return !this.isWithinDelta(p, delta);
  }
}

export {
  isParsablePoint,
  getPoint,
  getScale,
  getPoints,
  parsePoint,
  Point,
};
