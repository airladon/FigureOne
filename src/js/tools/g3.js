// @flow
/* eslint-disable no-use-before-define, prefer-destructuring */
import {
  roundNum, clipValue, // clipMag, clipValue, rand2D, round,
} from './math';
import type { Type3DMatrix } from './m3';
import * as m3 from './m3';
import * as m2 from './m2';
import { Line } from './g2';

export type Type3Components = [number, number, number];
export type ScaleTransform3DComponent = ['s', number, number, number];
export type TranslateTransform3DComponent = ['t', number, number, number];
export type RotateTransform3DComponent = ['r', number, number, number];
export type CustomTransform3DComponent = ['r', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

// eslint-disable-next-line max-len
export type Transform3DDefinition = Array<ScaleTransform3DComponent | TranslateTransform3DComponent | RotateTransform3DComponent | CustomTransform3DComponent>;

export type Type2Components = [number, number];

/**
 * A {@link Point} can be defined in several ways
 * - As a Point: new Point()
 * - As an x, y, z tuple: [number, number, number]
 * - As an x, y, z string: '[number, number, number]'
 * - As a definition object: { f1Type: 'p3', state: [number, number, number] }
 }
 * @example
 * // p1, p2, p3 and p4 are all the same when parsed by `getPoint`
 * p1 = new Point(2, 3, 4);
 * p2 = [2, 3, 4];
 * p3 = '[2, 3, 4]';
 * p4 = { f1Type: 'p', state: [2, 3, 4] };
 */
export type TypeParsablePoint = Type3Components
                                | Type2Components
                                | Point
                                | string
                                | TypeF1DefPoint;

type TypeF1DefPoint = {
  f1Type: 'p3',
  state: [number, number, number],
};

// function quadraticBezier(P0: number, P1: number, P2: number, t: number) {
//   return (1 - t) * ((1 - t) * P0 + t * P1) + t * ((1 - t) * P1 + t * P2);
// }

function parsePoint(pIn: TypeParsablePoint): Point {
  if (pIn instanceof Point || typeof pIn === 'object') {
    return pIn;
  }
  if (pIn == null) {
    throw new Error(`FigureOne could not parse point with no input: ${pIn}`);
  }

  let p = pIn;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      throw new Error(`FigureOne could not parse point from string: ${p}`);
    }
  }

  if (Array.isArray(p)) {
    try {
      if (p.length === 3) {
        return new Point(p[0], p[1], p[2]);
      }
      return new Point(p[0], p[1], 0);
    } catch { // $FlowFixMe
      throw new Error(`FigureOne could not parse point from array: ${pIn}`);
    }
  }

  if (p.f1Type != null) {
    if (
      p.f1Type === 'p3'
      && p.state != null
      && Array.isArray([p.state])
      && p.state.length === 3
    ) {
      const [x, y, z] = p.state;
      return new Point(x, y, z);
    } // $FlowFixMe
    throw new Error(`FigureOne could not parse point from state: ${pIn}`);
  } // $FlowFixMe
  throw new Error(`FigureOne could not parse point: ${pIn}`);
}

/**
 * Parse a {@link TypeParsablePoint} and return a {@link Point}.
 * @return {Point}
 */
function getPoint(p: TypeParsablePoint): Point {
  // if (p)
  // let parsedPoint = parsePoint(p);
  // if (parsedPoint == null) {
  //   parsedPoint = new Point(0, 0, 0);
  // }
  // return parsedPoint;
  return parsePoint(p);
}


/**
 * Parse an array of parsable point definitions ({@link TypeParsablePoint})
 * returning an array of points.
 * @return {Array<Point>}
 */
function getPoints3(points: TypeParsablePoint | Array<TypeParsablePoint>): Array<Point> {
  if (Array.isArray(points)) {
    if (points.length === 3 && typeof points[0] === 'number') {   // $FlowFixMe
      return [getPoint(points)];
    } // $FlowFixMe
    return points.map(p => getPoint(p));
  }
  return [getPoint(points)];
}


function getPrecision(
  options?: { precision: number },
  defaultPrecision: number = 8,
) {
  let precision;
  if (options) {
    ({ precision } = options);
  }
  let precisionToUse = defaultPrecision;
  if (precision != null) {
    precisionToUse = precision;
  }
  return precisionToUse;
}

class Point {
  x: number;
  y: number;
  z: number;
  _type: string;

  constructor(xOrArray: Type3Components | number, y: number, z: number = 0) {
    this._type = 'point';
    if (Array.isArray(xOrArray)) {
      try {
        this.x = xOrArray[0];
        this.y = xOrArray[1];
        this.z = xOrArray[2];
      } catch {
        if (xOrArray.length !== 3) {
          throw new Error(`FigureOne Point creation failed - array definition must have length of 3: ${xOrArray}`);
        }
      }
      return;
    }
    this.x = xOrArray;
    this.y = y;
    this.z = z;
  }

  _dup(): Point {
    return new this.constructor(this.x, this.y, this.z);
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'p3',
      state: [
        roundNum(this.x, precision),
        roundNum(this.y, precision),
        roundNum(this.z, precision),
      ],
    };
  }

  /**
   * Scale x and y values of point by scalar
   * @example
   * p = new Point(1, 1, 1);
   * s = p.scale(3);
   * // s = Point{x: 3, y: 3, z: 3};
   */
  scale(scalar: number): Point {
    return new this.constructor(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Subtract (x, y, z) values or a {@link Point} and return the difference as a new {@link Point}
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
   * @example
   * p = new Point(1, 1, 1);
   * q = new Point(0, 0, 0);
   * d = q.distance(p);
   * // d = 1.7320508075688772
   *
   */
  distance(toPointIn: TypeParsablePoint): number {
    if (toPointIn == null) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    const p = getPoint(toPointIn);
    return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2 + (this.z - p.z) ** 2);
  }

  /**
   * Return a new point with (x, y, z) values rounded to some precision
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
   * Transform the point with a 4x4 matrix (3 dimensional transform)
   * @example
   * // Transform a point with a (2, 2, 0) translation then 90º z rotation
   * p = new Point(1, 1);
   * m = new Transform3().translate(2, 2, 0).rotate(0, 0, Math.PI / 2).matrix();
   * // m = [0, -1, 0, -2, 1, 0, 0, 2, 0, 0, 0, 1]
   * q = p.transformBy(m)
   * // q = Point{x: -3, y: 3, 0}
   */
  transformBy(matrix: Type3DMatrix | Type2DMatrix): Point {
    if (matrix.length === 9) {
      const transformedPoint = m2.transform(matrix, this.x, this.y);
      return new Point(transformedPoint[0], transformedPoint[1]);
    }
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
   * @param angle - in radians
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
    angle: number | Type3Components,
    center?: TypeParsablePoint = new Point(0, 0, 0),
  ): Point {
    let a = [0, 0, 0];
    if (typeof angle === 'number') {
      a[2] = angle;
    } else {
      a = angle;
    }
    // const c = Math.cos(angle);
    // const s = Math.sin(angle);
    // const matrix = [c, -s,
    //                 s, c]; // eslint-disable-line indent
    // const centerPoint = center;
    // const pt = this.sub(centerPoint);
    // return new Point(
    //   matrix[0] * pt.x + matrix[1] * pt.y + centerPoint.x,
    //   matrix[2] * pt.x + matrix[3] * pt.y + centerPoint.y
    // );
    const c = getPoint(center);
    const centered = this.sub(c);
    const rotated = centered.transformBy(m3.rotationMatrix(a[0], a[1], a[2]));

    return rotated.add(c);
  }

  /**
   * Compare two points for equality to some precision
   * @example
   * p = new Point(1.123, 1.123);
   * q = new Point(1.124, 1.124);
   * p.isEqualTo(q)
   * // false
   *
   * p.isEqualTo(q, 2)
   * // true
   */
  isEqualTo(p: Point, precision?: number = 8) {
    let pr = this;
    let qr = p;

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
  isNotEqualTo(p: Point, precision?: number) {
    return !this.isEqualTo(p, precision);
  }

  isNotWithinDelta(p: Point, delta: number = 0.0000001) {
    return !this.isWithinDelta(p, delta);
  }

  isWithinLine(l: Line, precision?: number) {
    return l.hasPointOn(this, precision);
  }

  getShaddowOnLine(l: Line, precision: number = 8) {
    const shaddow = new Line(this, 1, l.angle() + Math.PI / 2);
    const { intersect } = shaddow.intersectsWith(l);
    if (intersect != null && intersect.isWithinLine(l, precision)) {
      return intersect;
    }
    return null;
  }

  shaddowIsOnLine(l: Line, precision: number = 8) {
    const intersect = this.getShaddowOnLine(l, precision);
    if (intersect != null) {
      return true;
    }
    return false;
  }

  clipToLine(l: Line, precision: number = 8) {
    if (l.hasPointOn(this, precision)) {
      return this._dup();
    }
    const shaddow = this.getShaddowOnLine(l, precision);
    if (shaddow != null) {
      return shaddow;
    }
    const d1 = this.distance(l.p1);
    const d2 = this.distance(l.p2);
    if (d1 <= d2) {
      return l.p1._dup();
    }
    return l.p2._dup();
  }

  isOnUnboundLine(l: Line, precision?: number) {
    return l.hasPointAlong(this, precision);
  }

  static isLeft(p0: Point, p1: Point, p2: Point) {
    return (
      (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)
    );
  }

  isInPolygon(polygonVertices: Array<Point>) {
    let windingNumber = 0;
    let n = polygonVertices.length - 1;
    const v = polygonVertices.slice();
    const p = this;
    let popLastPoint = false;
    // polygonVertices needs to have the last vertex the same as the first vertex
    if (v[0].isNotEqualTo(v[n])) {
      v.push(v[0]);
      popLastPoint = true;
      n += 1;
    }
    for (let i = 0; i < n; i += 1) {
      if (v[i].y <= p.y) {
        if (v[i + 1].y > p.y) {                // an upward crossing
          if (Point.isLeft(v[i], v[i + 1], p) > 0) { // P left of  edge
            windingNumber += 1;                // have  a valid up intersect
          }
        }
      } else if (v[i + 1].y <= p.y) {           // start y > P.y (no test needed)
        // a downward crossing
        if (Point.isLeft(v[i], v[i + 1], p) < 0) {    // P right of  edge
          windingNumber -= 1;      // have  a valid down intersect
        }
      }
    }
    if (popLastPoint) {
      v.pop();
    }
    if (windingNumber === 0) {
      return false;
    }
    return true;
  }

  isOnPolygon(polygonVertices: Array<Point>) {
    let popLastPoint = false;
    const p = this;
    let n = polygonVertices.length - 1;   // Number of sides
    const v = polygonVertices.slice();

    // polygonVertices needs to have the last vertex the same as the first vertex
    if (v[0].isNotEqualTo(v[n])) {
      v.push(v[0]);
      popLastPoint = true;
      n += 1;
    }

    for (let i = 0; i < n; i += 1) {
      // if(p.isEqualTo(v[i])) {
      //   return true;
      // }
      const l = new Line(v[i], v[i + 1]);
      if (p.isWithinLine(l)) {
        if (popLastPoint) {
          v.pop();
        }
        return true;
      }
    }
    if (p.isInPolygon(polygonVertices)) {
      if (popLastPoint) {
        v.pop();
      }
      return true;
    }

    if (popLastPoint) {
      v.pop();
    }
    return false;
  }

  toPolar() {
    const r = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    const phi = Math.atan2(this.y, this.x);
    const theta = Math.acos(this.z / r);
    return {
      mag: r,
      angle: phi,
      phi,
      theta,
      r,
    };
  }

  toDelta(
    delta: Point,
    percent: number,
    translationStyle: 'linear' | 'curved' | 'curve' = 'linear',  // $FlowFixMe
    translationOptions: OBJ_TranslationPath = {
      magnitude: 0.5,
      offset: 0.5,
      controlPoint: null,
    },
  ) {
    const pathPoint = translationPath(
      translationStyle,
      this._dup(), delta, percent,
      translationOptions,
    );
    return pathPoint;
  }
}


// // Everytime a component is updated, the matrix will re-calculate
// class Transform3D {
//   mat: Array<number>;
//   // order: Array<'t' | 'r' | 's' | 'c'>;
//   // values: Array<Type3Components | Type3DMatrix>;
//   order: Array<Transform3DDefinition>;
//   name: string;

//   constructor(definitionOrName: Array<Transform3DDefinition>, name: string) {}
//   _dup() {}
//   translate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   scale(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   rotate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   rotatePolar(theta: number, phi: number) {}
//   updateTranslation(x: number, y: number, z: number, index: number) {}
//   updateScale(x: number, y: number, z: number, index: number) {}
//   updateRotation(x: number, y: number, z: number, index: number) {}
//   _calcMatrix() {}
//   udpate(index: number, value: Type3Components | Type3DMatrix) {}
//   getScale(index: number) {}
//   getTranslation(index: number) {}
//   getRotation(index: number) {}
//   get(index: number) {}
//   round(precision: number) {}
//   transformBy(transform: Transform3D) {}
//   transform(transform: Transform3D) {}
//   isEqualTo(transform: Transform3D, precision: number) {}
//   isWithinDeltaTo(transform: Transform3D, delta: number) {}
//   isZero(precision: number) {}
//   _state(options: { precision: number }) {}
//   constant(value: number) {}
//   identity() {}
// }

export {
  Point,
  getPoint,
  getPoints3,
};
