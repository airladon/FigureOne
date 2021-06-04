// @flow
/* eslint-disable no-use-before-define */
import {
  roundNum, clipMag, clipValue, rand2D, round,
} from './math';
import { joinObjects } from './tools';
import * as m2 from './m2';
import * as m3 from './m3';
import type { Type3DMatrix } from './m3';
import type { Type2DMatrix } from './m2';
import type { Type3Components, Type2Components } from './g3';
// import { joinObjects } from './tools';


function quadraticBezier(P0: number, P1: number, P2: number, t: number) {
  return (1 - t) * ((1 - t) * P0 + t * P1) + t * ((1 - t) * P1 + t * P2);
}

/**
 * Clip and angle between 0 and 2π (`'0to360'`) or -π to π (`'-180to180'`).
 * `null` will return the angle between -2π to 2π.
 * @example
 * const clipAngle = Fig.clipAngle
 *
 * const a1 = clipAngle(Math.PI / 2 * 5, '0to360');
 * console.log(a1);
 * // 1.5707963267948966
 *
 * const a2 = clipAngle(Math.PI / 4 * 5, '-180to180');
 * console.log(a2);
 * // -2.356194490192345
 *
 * const a3 = clipAngle(-Math.PI / 4 * 10, null);
 * console.log(a3);
 * // -1.5707963267948966
 */
function clipAngle(
  angleToClip: number,
  clipTo: '0to360' | '-180to180' | null | '-360to360' | '-360to0',
) {
  if (clipTo === null) {
    return angleToClip;
  }
  // Modular 2π gives -360to360
  let angle = angleToClip % (Math.PI * 2);
  if (clipTo === '0to360') {
    if (angle < 0) {
      angle += Math.PI * 2;
    }
    if (angle >= Math.PI * 2) {
      angle -= Math.PI * 2;
    }
  }
  if (clipTo === '-180to180') {
    if (angle < -Math.PI) {
      angle += Math.PI * 2;
    }
    if (angle >= Math.PI) {
      angle -= Math.PI * 2;
    }
  }
  if (clipTo === '-360to0') {
    if (angle > 0) {
      angle -= Math.PI * 2;
    }
    if (angle <= -Math.PI * 2) {
      angle += Math.PI * 2;
    }
  }
  return angle;
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

type TypeF1DefPoint = {
  f1Type: 'p',
  state: [number, number],
};

/**
 * A {@link Point} can be defined in several ways
 * - As a Point: new Point()
 * - As an x, y tuple: [number, number]
 * - As an x, y, z tuple: [number, number, number]
 * - As an x, y string: '[number, number]'
 * - As an x, y, z string: '[number, number, number]'
 * - As a definition object: { f1Type: 'p', state: [number, number] }
 }
 * @example
 * // p1, p2, p3 and p4 are all the same when parsed by `getPoint`
 * p1 = new Point(2, 3);
 * p2 = [2, 3];
 * p3 = '[2, 3]';
 * p4 = { f1Type: 'p', state: [2, 3] };
 */
export type TypeParsablePoint = Type2Components
                                | Type3Components
                                | Point
                                | string
                                | TypeF1DefPoint;
// point can be defined as:
//    - Point instance
//    - [1, 1]
//    - { f1Type: 'p', def: [1, 1]}
function parsePoint(pIn: TypeParsablePoint): Point {
  if (pIn instanceof Point) {
    return pIn;
  }
  if (pIn == null) {
    // return new Point(0, 0);
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

function isParsablePoint(pIn: any) {
  try {
    parsePoint(pIn);
  } catch {
    return false;
  }
  return true;
}

// function parsePointLegacy<T>(pIn: TypeParsablePoint, onFail: T): Point | T | null {
//   if (pIn instanceof Point) {
//     return pIn;
//   }
//   let onFailToUse = onFail;
//   if (onFailToUse == null) {
//     onFailToUse = null;
//   }
//   if (pIn == null) {
//     return onFailToUse;
//   }

//   let p = pIn;
//   if (typeof p === 'string') {
//     try {
//       p = JSON.parse(p);
//     } catch {
//       return onFailToUse;
//     }
//   }

//   if (Array.isArray(p)) {
//     if (p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
//       return new Point(p[0], p[1]);
//     }
//     return onFailToUse;
//   }

//   if (p.f1Type != null) {
//     if (
//       p.f1Type === 'p'
//       && p.state != null
//       && Array.isArray([p.state])
//       && p.state.length === 2
//     ) {
//       const [x, y] = p.state;
//       return new Point(x, y);
//     }
//     return onFailToUse;
//   }
//   if (typeof p === 'number') {
//     return new Point(p, p);
//   }
//   // if (typeof (p) === 'object') {
//   //   const keys = Object.keys(p);
//   //   if (keys.indexOf('x') > -1 && keys.indexOf('y') > -1) {
//   //     return new Point(p.x, p.y);
//   //   }
//   // }
//   return onFailToUse;
// }

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

/**
 * An object representing a rectangle.
 *
 * @example
 * // get Rect from Fig
 * const { Rect } = Fig;
 *
 * // define a rect centered at origin with width 4 and height 2
 * const r = new Rect(-2, -1, 4, 2);
 */
class Rect {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
  right: number;

  /**
   * Constructor
   * @constructor
   * @param {number} left - left location
   * @param {number} bottom - bottom location
   * @param {number} width - rectangle width
   * @param {number} height - rectangle height
   */
  constructor(left: number, bottom: number, width: number, height: number) {
    /**
      Left side x coordinate
     */
    this.left = left;
    /**
      Rectange width
     */
    this.width = width;
    /**
      Rectangle height
     */
    this.height = height;
    /**
      Bottom side y coordinate
     */
    this.bottom = bottom;
    /**
      Top side y coordinate
     */
    this.top = bottom + height;
    /**
      Right side x coordinate
     */
    this.right = left + width;
  }

  /**
   * Return a duplicate rectangle object
   */
  _dup() {
    return new Rect(this.left, this.bottom, this.width, this.height);
  }

  _state(options: { precision: number}) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'rect',
      state: [
        roundNum(this.left, precision),
        roundNum(this.bottom, precision),
        roundNum(this.width, precision),
        roundNum(this.height, precision),
      ],
    };
  }

  /**
   * Returns `true` if `point` is within or on the border of the rectangle
   * @param {TypeParsablePoint} point point to test
   * @param {number} precision precision to test
   * @example
   * const r = new Rect(-2, -1, 4, 2);
   *
   * // check if point is within the rectangle (will return `true`)
   * const result = r.isPointInside([0, 1]);
   */
  isPointInside(point: TypeParsablePoint, precision: number = 8) {
    const p = getPoint(point).round(precision);
    const top = roundNum(this.top, precision);
    const bottom = roundNum(this.bottom, precision);
    const left = roundNum(this.left, precision);
    const right = roundNum(this.right, precision);
    if (p.x < left || p.x > right || p.y < bottom || p.y > top) {
      return false;
    }
    return true;
  }

  /**
   * Returns a rectangle with coordinates rounded to `precision`
   * @param {number} precision precision to test
   */
  round(precision: number = 8) {
    const newRect = new Rect(
      roundNum(this.left, precision), roundNum(this.bottom, precision),
      roundNum(this.width, precision), roundNum(this.height, precision),
    );
    newRect.width = roundNum(newRect.width, precision);
    newRect.height = roundNum(newRect.height, precision);
    newRect.top = roundNum(newRect.top, precision);
    newRect.right = roundNum(newRect.right, precision);
    return newRect;
  }

  /**
   * Find the intersect of the line from the center of the rectangle to the
   * point, with the rectangle border.
   * @param {TypeParsablePoint} point
   * @return {Point | null} intersect
   */
  intersectsWith(point: TypeParsablePoint) {
    const p = getPoint(point);
    const center = this.center();
    const centerToP = new Line(center, p);
    const centerOut = new Line(center, this.width + this.height, centerToP.angle());
    const left = new Line([this.left, this.bottom], [this.left, this.top]);
    let i = centerOut.intersectsWith(left);
    if (i.withinLine) { return i.intersect; }

    const top = new Line([this.left, this.top], [this.right, this.top]);
    i = centerOut.intersectsWith(top);
    if (i.withinLine) { return i.intersect; }

    const right = new Line([this.right, this.top], [this.right, this.bottom]);
    i = centerOut.intersectsWith(right);
    if (i.withinLine) { return i.intersect; }

    const bottom = new Line([this.left, this.bottom], [this.right, this.bottom]);
    i = centerOut.intersectsWith(bottom);
    if (i.withinLine) { return i.intersect; }
    return null;
  }


  /**
   * Find the intersect between a line and the rectangle
   */
  intersectsWithLine(lineIn: TypeParsableLine) {
    const l = getLine(lineIn);
    const left = new Line([this.left, this.bottom], [this.left, this.top]);
    const top = new Line([this.left, this.top], [this.right, this.top]);
    const right = new Line([this.right, this.top], [this.right, this.bottom]);
    const bottom = new Line([this.left, this.bottom], [this.right, this.bottom]);
    const intersects = [];
    const leftIntersect = l.intersectsWith(left);
    if (leftIntersect.withinLine) { intersects.push(leftIntersect.intersect); }
    const topIntersect = l.intersectsWith(top);
    if (topIntersect.withinLine) { intersects.push(topIntersect.intersect); }
    const bottomIntersect = l.intersectsWith(bottom);
    if (bottomIntersect.withinLine) { intersects.push(bottomIntersect.intersect); }
    const rightIntersect = l.intersectsWith(right);
    if (rightIntersect.withinLine) { intersects.push(rightIntersect.intersect); }
    return intersects;
  }

  // Return the center point of the rectangle
  center() {
    return new Point(this.left + this.width / 2, this.bottom + this.height / 2);
  }
}

// /**
//  JSON definition of a rect.
//  @property {'rect'} f1Type rect identifier
//  @property {[number, number, number, number]} state left, bottom, width
//  * and height definition
//  */
type TypeF1DefRect = {
  f1Type: 'rect',
  state: [number, number, number, number],
};

/**
 * A [Rectangle]{@link Rect} can be defined as either as an
 * - Array (left, bottom, width, height)
 * - a {@link Rect} class
 * - a string representing the json definition of the
 *   array form, or a {@link TypeF1DefRect}.
 *
 * @example
 * // All rectangles are the same when parsed by `getRect` and have a lower
 * left corner of `(-2, -1)`, a width of `4`, and a height of `2`
 * const r1 = [-2, -1, 4, 2];
 * const r2 = new Fig.Rect(-2, -1, 4, 2);
 * const r3 = '[-2, -1, 4, 2]';
 * const r4 = {
 *   f1Type: 'rect',
 *   state: [-2, -1, 4, 2],
 * };
 */
export type TypeParsableRect = [number, number, number, number]
                               | Rect
                               | TypeF1DefRect
                               | string;


function parseRect<T>(rIn: TypeParsableRect, onFail: T): Rect | T | null {
  if (rIn instanceof Rect) {
    return rIn;
  }

  let onFailToUse = onFail;
  if (onFailToUse == null) {
    onFailToUse = null;
  }

  if (rIn == null) {
    return onFailToUse;
  }

  let r = rIn;
  if (typeof r === 'string') {
    try {
      r = JSON.parse(r);
    } catch {
      return onFailToUse;
    }
  }

  if (Array.isArray(r) && r.length === 4) {
    return new Rect(r[0], r[1], r[2], r[3]);
  }
  const { f1Type, state } = r;

  if (f1Type != null
      && f1Type === 'rect'
      && state != null
      && Array.isArray([state])
      && state.length === 4
  ) {
    const [l, b, w, h] = state;
    return new Rect(l, b, w, h);
  }

  return onFailToUse;
}

/**
 * Convert a parsable rectangle definition to a {@link Rect}.
 * @param {TypeParsableRect} r parsable rectangle definition
 * @return {Rect} rectangle object
 */
function getRect(r: TypeParsableRect): Rect {
  let parsedRect = parseRect(r);
  if (parsedRect == null) {
    parsedRect = new Rect(0, 0, 1, 1);
  }
  return parsedRect;
}


/* eslint-disable comma-dangle */
/**
 * Object representing a point.
 *
 * Contains methods that makes it conventient to add, subtract and
 * transform points.
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

  /**
   * Return a point at (0, 0)
   */
  static zero(): Point {
    return new Point(0, 0, 0);
  }

  /**
   * Return a point at (1, 1)
   */
  static Unity(): Point {
    return new Point(1, 1, 1);
  }

  constructor(xOrArray: Type3Components | Type2Components | number, y: number, z: number = 0) {
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
          throw new Error(`FigureOne Point creation failed - array definition must have length of 3: ${xOrArray}`);
        }
      }
      return;
    }
    this.x = xOrArray;
    this.y = y;
    this.z = z;
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'p',
      state: [
        roundNum(this.x, precision),
        roundNum(this.y, precision),
      ],
    };
  }

  /**
   * Return a duplicate of the {@link Point} object
   */
  _dup(): Point {
    return new this.constructor(this.x, this.y, this.z);
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
    angle: number | Type3DComponents,
    center?: TypeParsablePoint = new Point(0, 0, 0),
  ): Point {
    let a = [0, 0, 0];
    if (typeof angle === 'number') {
      a[2] = angle;
    } else {
      a = angle;
    }
    const c = getPoint(center);
    const centered = this.sub(c);
    const rotated = centered.transformBy(m3.rotationMatrix(a[0], a[1], a[2]));

    return rotated.add(c);
  }

  /* eslint-enable comma-dangle */

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
      const l = line(v[i], v[i + 1]);
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
    return {
      mag: Math.sqrt(this.x ** 2 + this.y ** 2),
      angle: Math.atan2(this.y, this.x),
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


function linearPath(
  start: Point,
  delta: Point,
  percent: number,
) {
  return start.add(delta.x * percent, delta.y * percent);
}

// type linearPathOptionsType = {
// };

/**
 * Curved translation path options, that defineds the control
 * point of a quadratic bezier curve.
 *
 * Use `controlPoint` to define the control point directly. This
 * will override all other properties.
 *
 * Otherwise `direction`, `magnitude` and `offset` can be used
 * to calculate the control point based on the start and end
 * points of the curve.
 *
 * The control point is calculated by:
 * - Define a line from start to target - it will have length `d`
 * - Define a point `P` on the line
 * - Define a control line from point `P` with length `d` and some
 *   angle delta from the original line.
 *
 * The properties then customize this calculation:
 * - `magnitude` will scale the distance d
 * - `offset` will define where on the line point `P` is where `0.5` is
 *   the midpoint and `0.1` is 10% along the line from the start location
 * - `direction` will define which side of the line the control line should be
 *   drawn
 * - `angle` defines the angle delta between the line and the control line - by
 *    default this a right angle (Math.PI / 2)
 *
 * The directions `'up'`, `'down'`, `'left'`, `'right'` all reference the side
 * of the line. The `'positive'`
 * direction is the side of the line that the line would move toward when
 * rotated in the positive direction around the start point. The
 * '`negative`' side of the line is then the opposite side.
 *
 * These directions only work when the `angle` is between `0` and `Math.PI`.
 *
 * @property {TypeParsablePoint | null} controlPoint
 * @property {number} magnitude
 * @property {number} offset
 * @property {number} angle (`Math.PI / 2`)
 * @property {'positive' | 'negative' | 'up' | 'left' | 'down' | 'right'} direction
 */
export type OBJ_QuadraticBezier = {
  // path: '(Point, Point, number) => Point';
  controlPoint: TypeParsablePoint | null;
  angle: number;
  magnitude: number;
  offset: number;
  direction: 'up' | 'left' | 'down' | 'right' | 'positive' | 'negative';
};

/**
 * Translation path options object
 */
export type OBJ_TranslationPath = {
  style: 'curve' | 'linear' | 'curved',
  // curve options
  angle?: number,
  magnitude?: number,
  offset?: number,
  controlPoint?: TypeParsablePoint | null,
  direction?: 'positive' | 'negative' | 'up' | 'down' | 'left' | 'right',
}


// export type pathOptionsType = OBJ_QuadraticBezier & linearPathOptionsType;

function curvedPath(
  start: Point,
  delta: Point,
  percent: number,
  options: OBJ_TranslationPath,
) {
  const o = options;
  // const angle = Math.atan2(delta.y, delta.x);
  // const midPoint = start.add(new Point(delta.x * o.offset, delta.y * o.offset));
  // const dist = delta.toPolar().mag * o.magnitude;

  let { controlPoint } = options;

  // const o = options;

  // const dist = delta.toPolar().mag * o.magnitude;

  if (controlPoint == null) {
    // let angleDelta = Math.PI / 2;
    // if (o.angle != null) {
    //   angleDelta = o.angle;
    // }
    // const { direction } = options;
    // let xDelta = Math.cos(angle + angleDelta);
    // let yDelta = Math.sin(angle + angleDelta);
    // if (direction === 'up') {
    //   if (yDelta < 0) {
    //     yDelta = Math.sin(angle + angleDelta + Math.PI);
    //   }
    //   if (xDelta < 0) {
    //     xDelta = Math.cos(angle + angleDelta + Math.PI);
    //   }
    // } else if (direction === 'down') {
    //   if (yDelta > 0) {
    //     yDelta = Math.sin(angle + angleDelta + Math.PI);
    //   }
    //   if (xDelta > 0) {
    //     xDelta = Math.cos(angle + angleDelta + Math.PI);
    //   }
    // } else if (direction === 'left') {
    //   if (yDelta > 0) {
    //     yDelta = Math.sin(angle + angleDelta + Math.PI);
    //   }
    //   if (xDelta > 0) {
    //     xDelta = Math.cos(angle + angleDelta + Math.PI);
    //   }
    // } else if (direction === 'right') {
    //   if (yDelta < 0) {
    //     yDelta = Math.sin(angle + angleDelta + Math.PI);
    //   }
    //   if (xDelta < 0) {
    //     xDelta = Math.cos(angle + angleDelta + Math.PI);
    //   }
    // }
    let angleDelta = Math.PI / 2;
    if (o.angle != null) {
      angleDelta = o.angle;
    }
    let offsetToUse = 0;
    if (o.offset != null) {
      offsetToUse = o.offset;
    }
    if (o.direction == null) {
      o.direction = 'positive';
    }
    let magToUse = 1;
    if (o.magnitude != null) {
      magToUse = o.magnitude;
    }
    const displacementLine = new Line(start, start.add(delta));
    const lineAngle = clipAngle(displacementLine.angle(), '0to360');
    const linePoint = start.add(new Point(delta.x * offsetToUse, delta.y * offsetToUse));

    // norm line angle is between 0 and 180
    let normLineAngle = lineAngle; // clipAngle(lineAngle, '0to360');
    if (normLineAngle >= Math.PI) {
      normLineAngle -= Math.PI;
    }
    // if (lineAngle < 0) {
    //   lineAngle += Math.PI;
    // }
    let controlAngle = lineAngle + angleDelta;
    const { direction } = o;

    if (direction === 'positive') {
      controlAngle = lineAngle + angleDelta;
    } else if (direction === 'negative') {
      controlAngle = lineAngle - angleDelta;
    } else if (direction === 'up') {
      if (lineAngle <= Math.PI / 2 || lineAngle >= Math.PI / 2 * 3) {
        controlAngle = lineAngle + angleDelta;
      } else {
        controlAngle = lineAngle - angleDelta;
      }
    } else if (direction === 'down') {
      if (lineAngle <= Math.PI / 2 || lineAngle >= Math.PI / 2 * 3) {
        controlAngle = lineAngle - angleDelta;
      } else {
        controlAngle = lineAngle + angleDelta;
      }
    } else if (direction === 'left') {
      if (lineAngle <= Math.PI) {
        controlAngle = lineAngle + angleDelta;
      } else {
        controlAngle = lineAngle - angleDelta;
      }
    } else if (direction === 'right') {
      if (lineAngle <= Math.PI) {
        controlAngle = lineAngle - angleDelta;
      } else {
        controlAngle = lineAngle + angleDelta;
      }
    }

    const dist = magToUse * displacementLine.length();
    controlPoint = new Point(
      linePoint.x + dist * Math.cos(controlAngle),
      linePoint.y + dist * Math.sin(controlAngle),
      // midPoint.x + dist * xDelta,
      // midPoint.y + dist * yDelta,
    );
  }

  const p0 = start;
  const p1 = getPoint(controlPoint);
  const p2 = start.add(delta);
  const t = percent;
  const bx = quadraticBezier(p0.x, p1.x, p2.x, t);
  const by = quadraticBezier(p0.y, p1.y, p2.y, t);
  return new Point(bx, by);
}


function translationPath(
  pathType: 'linear' | 'curved' | 'curve' = 'linear',
  start: Point,
  delta: Point,
  percent: number,
  options: OBJ_TranslationPath,
) {
  if (pathType === 'linear') {
    return linearPath(start, delta, percent);
  }
  if (pathType === 'curved' || pathType === 'curve') {
    return curvedPath(start, delta, percent, options);
  }
  return new Point(0, 0);
}

// function point(x: number, y: number) {
//   return new Point(x, y);
// }

function pointinRect(q: Point, p1: Point, p2: Point, precision?: number) {
  if (precision === undefined || precision === null) {
    if (q.x >= Math.min(p1.x, p2.x)
      && q.x <= Math.max(p1.x, p2.x)
      && q.y >= Math.min(p1.y, p2.y)
      && q.y <= Math.max(p1.y, p2.y)) {
      return true;
    }
  } else if (
    roundNum(q.x, precision) >= roundNum(Math.min(p1.x, p2.x), precision)
    && roundNum(q.x, precision) <= roundNum(Math.max(p1.x, p2.x), precision)
    && roundNum(q.y, precision) >= roundNum(Math.min(p1.y, p2.y), precision)
    && roundNum(q.y, precision) <= roundNum(Math.max(p1.y, p2.y), precision)) {
    return true;
  }
  return false;
}

function distance(p1: Point, p2: Point) {
  return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
}
function deg(angle: number) {
  return angle * 180 / Math.PI;
}

/**
 * Get the minimum absolute angle difference between two angles
 *
 * @example
 * const minAngleDiff = Fig.minAngleDiff;
 * const d1 = minAngleDiff(0.1, 0.2);
 * console.log(d1);
 * // -0.1
 *
 * const d2 = minAngleDiff(0.2, 0.1);
 * console.log(d2);
 * // 0.1
 *
 * const d3 = minAngleDiff(0.1, -0.1);
 * console.log(d3);
 * // 0.2
 */
function minAngleDiff(angle1: number, angle2: number) {
  if (angle1 === angle2) {
    return 0;
  }
  return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2));
}

function normAngle(angle: number) {
  let newAngle = angle;
  while (newAngle >= Math.PI * 2.0) {
    newAngle -= Math.PI * 2.0;
  }
  while (newAngle < 0) {
    newAngle += Math.PI * 2.0;
  }
  return newAngle;
}

function normAngleTo90(angle: number) {
  let newAngle = normAngle(angle);
  if (newAngle > Math.PI / 2 && newAngle < Math.PI) {
    newAngle += Math.PI;
  }
  if (newAngle === Math.PI) {
    newAngle = 0;
  }
  if (newAngle > Math.PI && newAngle < Math.PI * 3 / 2) {
    newAngle -= Math.PI;
  }
  return newAngle;
}

export type TypeRotationDirection = 0 | 1 | 2 | -1;

// 0 is quickest direction
// 1 is positive direction CCW
// -1 is negative direction CW
// 2 is not through 0
// 3 is numerical
function getDeltaAngle(
  startAngle: number,
  targetAngle: number,
  rotDirection: TypeRotationDirection = 0,
) {
  const start = normAngle(startAngle);
  const target = normAngle(targetAngle);
  let dir = rotDirection;

  if (start === target) {
    return 0;
  }

  if (dir === 2) {
    if (start > target) {
      dir = -1;
    } else {
      dir = 1;
    }
  }

  if (dir === 0) {
    return minAngleDiff(target, start);
  }

  if (dir === 1) {
    if (start > target) {
      return Math.PI * 2 - start + target;
    }
  }

  if (dir === -1) {
    if (target > start) {
      return -start - (Math.PI * 2 - target);
    }
  }

  return target - start;

  // if (rotDirection === 2) {
  //   if (target > start) {
  //     return target - start;
  //   }
  // }
  // if (rotDirection === 2) {
  //   if (start + rotDiff < 0) {
  //     rotDiff = Math.PI * 2 + rotDiff;
  //   } else if (start + rotDiff > Math.PI * 2) {
  //     rotDiff = -(Math.PI * 2 - rotDiff);
  //   }
  // } else if (rotDiff * rotDirection < 0) {
  //   rotDiff = rotDirection * Math.PI * 2.0 + rotDiff;
  // }
  // return rotDiff;
}

// Line definition: Ax + By = C
//
// So if we have two points: (x1, y1) and (x2, y2) on the same line, they must
// both satisfy the same equation:
//
//    Ax1 + By1 = C   - 1
//    Ax2 + By2 = C   - 2
//
// Both 1 and 2 equal C, so can equate left hand sides:
//    Ax1 + By1 = Ax2 + By2
//    A(x1 - x2) = B(y2 - y1)
//    A / B = (y2 - y1) / (x1 - x2)
//
//    So A = (y2 - y1) and B = x1 - x2
//
//  Then C from 1 is:
//    C = (y2 - y1)x1 + (x1 - x2)y1
//
//  So calculating y from x:
//    y = (C - Ax) / B   for B != 0
//      If B == 0, then x1 == x2, and so we have a vertical line at x1
//      and so y is not dependent on x
//  And calculating x from y:
//    x = (C - By) / A    for A != 0
//      If A == 0, then y1 == y2, and so we have a horizontal line at y1
//      and so x is not dependent on y
//
//  To find the y intercept:
//    if B != 0: y intercept = Ax + By = C => y = C / B
//    if B == 0, there is no single y intercept
//      - is either no intercept, or along the y axis
//
//  To find the x intercept:
//    if A != 0: x intercept = Ax + By = C => x = C / A
//    if A == 0, there is no single x intercept
//      - is either no intercept, or along the x axis
//
//  Another form of the line equation is y = mx + c where:
//   - c is the y intercept (or C / B)
//   - m = y2 - y1 / x2 - x1 = A / (-B) = - A / B
//

/**
 * Line intersection result object with keys:
 * @property {undefined | Point} intersect will be `undefined` if there is
 * no intersect
 * @property {boolean} alongLine `true` if `intersect` is along line calling
 * `intersectsWith`
 * @property {boolean} withinLine `true` if `intersect` is within line calling
 * `intersectsWith`
 */
type Intersect = {
  intersect?: Point,
  alongLine: boolean,
  withinLine: boolean,
}

/**
 * Object representing a line.
 *
 * A line is defined by two points, or a point and the distance and
 * angle to another point.
 *
 * A finite line exists only between these two points.
 *
 * An infinite line can extend beyond either or both of the points to infinity.
 *
 * A line can also be defined as an infinite line by saying it extends beyond one
 * @example
 * // get Line from Fig
 * const { Line } = Fig;
 *
 * // define a finite line from [0, 0] to [1, 0] with a point, magnitude and
 * // angle
 * const l1 = new Line([0, 0], 1, 0)
 *
 * // define a finite line from [0, 0] to [1, 0] with two points
 * const l2 = new Line([0, 0], [1, 0])
 *
 * // define an infinite line from [0, 0], through [1, 0] and to infinity
 * const l3 = new Line([0, 0], [1, 0], 1)
 *
 * // define an infinite line trough [0, 0] and [1, 0]
 * const l4 = new Line([0, 0], [1, 0], 0)
 */
class Line {
  p1: Point;
  p2: Point;
  ang: number;
  A: number;
  B: number;
  C: number;
  distance: number;
  ends: 2 | 1 | 0;

  /**
   * @param {0 | 1 | 2} ends number of ends the line has. `2` ends is a finite
   * line. `1` end is an infinite line that terminates at the first point, and
   * goes through the second point to infinity. `0` ends is an infinite line
   * that goes through both first and second points to infinity.
   */
  constructor(
    p1: TypeParsablePoint,
    p2OrMag: TypeParsablePoint | number | null,
    angle: number = 0,
    ends: 2 | 1 | 0 = 2,
  ) {
    this.p1 = getPoint(p1);
    if (p2OrMag == null) {
      this.ang = angle;
      this.p2 = this.p1.add(1 * Math.cos(this.ang), 1 * Math.sin(this.ang));
    } else if (typeof p2OrMag === 'number') {
      this.p2 = this.p1.add(
        p2OrMag * Math.cos(angle),
        p2OrMag * Math.sin(angle),
      );
      this.ang = angle;
    } else {
      this.p2 = getPoint(p2OrMag);
      this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    }
    this.ends = ends;
    this.setupLine();
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'l',
      state: [
        [roundNum(this.p1.x, precision), roundNum(this.p1.y, precision)],
        [roundNum(this.p2.x, precision), roundNum(this.p2.y, precision)],
        this.ends,
      ],
    };
  }

  setupLine() {
    this.A = this.p2.y - this.p1.y;
    this.B = this.p1.x - this.p2.x;
    this.C = this.A * this.p1.x + this.B * this.p1.y;
    this.distance = distance(this.p1, this.p2);
  }

  _dup() {
    return new Line(this.p1, this.p2, 0, this.ends);
  }

  /**
   * Change p1 of the line
   */
  setP1(p1: TypeParsablePoint) {
    this.p1 = getPoint(p1);
    this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    this.setupLine();
  }

  /**
   * Change p2 of the line
   */
  setP2(p2: Point | [number, number]) {
    this.p2 = getPoint(p2);
    this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    this.setupLine();
  }

  /**
   * Get p1 or p2
   * @return {Point}
   */
  getPoint(index: 1 | 2 = 1) {
    if (index === 2) {
      return this.p2;
    }
    return this.p1;
  }

  reverse() {
    return new Line(this.p2, this.p1, 0, this.ends);
  }

  /**
   * Get the y coordinate of a point on the line with a given x coordinate
   * @return {number | null} where `null` is returned if the line is vertical
   */
  getYFromX(x: number) {
    if (this.B !== 0) {
      return (this.C - this.A * x) / this.B;
    }
    return null;
  }

  /**
   * Get the x coordinate of a point on the line with a given y coordinate
   * @return {number | null} where `null` is returned if the line is horiztonal
   */
  getXFromY(y: number) {
    if (this.A !== 0) {
      return (this.C - this.B * y) / this.A;
    }
    return null;
  }

  /**
   * Get the y intercept (at x = 0) of line
   * @return {number | null} where `null` is returned if the line is vertical
   */
  getYIntercept() {
    return this.getYFromX(0);
  }

  /**
   * Get the x intercept (at y = 0) of line
   * @return {number | null} where `null` is returned if the line is horizontal
   */
  getXIntercept() {
    return this.getXFromY(0);
  }

  /**
   * Get the gradient of the line
   * @return {number}
   */
  getGradient() {
    if (this.B === 0) {
      return null;
    }
    return -this.A / this.B;
  }

  /**
   * Get the angle of the line from p1 to p2
   * @return {number}
   */
  angle() {
    return this.ang;
  }

  /**
   * Return a duplicate line with values rounded to `precision`
   * @return {Line}
   */
  round(precision?: number = 8) {
    const lineRounded = new Line(this.p1, this.p2, 0, this.ends);
    lineRounded.A = roundNum(lineRounded.A, precision);
    lineRounded.B = roundNum(lineRounded.B, precision);
    lineRounded.C = roundNum(lineRounded.C, precision);
    lineRounded.ang = roundNum(lineRounded.ang, precision);
    lineRounded.distance = roundNum(lineRounded.distance, precision);
    return lineRounded;
  }

  /**
   * Return the distance between p1 and p2. Note, for infinite lines
   * this will still return the distance between p1 and p2 that defines
   * the line.
   * @return {number}
   */
  length() {
    // return this.p1.sub(this.p2).distance();
    return this.distance;
  }

  /* eslint-disable comma-dangle */
  /**
   * Return the midpoint between p1 and p2.
   * @return {Point}
   */
  midPoint() {
    // const length = this.length();
    // const direction = this.p2.sub(this.p1);
    // const angle = Math.atan2(direction.y, direction.x);
    // const midPoint = point(
    //   this.p1.x + length / 2 * Math.cos(angle),
    //   this.p1.y + length / 2 * Math.sin(angle)
    // );
    // return midPoint;
    return this.pointAtPercent(0.5);
  }

  /**
   * Return the point along some percent of the distance between p1 and p2.
   * @return {Point}
   */
  pointAtPercent(percent: number) {
    const length = this.length();
    const direction = this.p2.sub(this.p1);
    const angle = Math.atan2(direction.y, direction.x);
    const p = new Point(
      this.p1.x + length * percent * Math.cos(angle),
      this.p1.y + length * percent * Math.sin(angle)
    );
    return p;
  }

  /**
   * Return the point along the line at some length from p1
   * @return {Point}
   */
  pointAtLength(length: number) {
    const totalLength = this.p2.sub(this.p1).distance();
    return this.pointAtPercent(length / totalLength);
    // const angle = Math.atan2(direction.y, direction.x);
    // const p = new Point(
    //   this.p1.x + length * Math.cos(angle),
    //   this.p1.y + length * Math.sin(angle)
    // );
    // return p;
  }
  /* eslint-enable comma-dangle */

  /**
   * `true` if `point` is along the line extended to infinity on both ends
   * @return {boolean}
   */
  hasPointAlong(point: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(point);
    if (precision === undefined || precision === null) {
      if (this.C === this.A * p.x + this.B * p.y) {
        return true;
      }
    } else if (
      roundNum(this.C, precision) === roundNum(this.A * p.x + this.B * p.y, precision)
    ) {
      return true;
    }
    return false;
  }


  /**
   * Perpendicular distance from `point` to line
   * @return {number}
   */
  distanceToPoint(point: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(point);
    return roundNum(
      Math.abs(this.A * p.x + this.B * p.y - this.C) / Math.sqrt(this.A ** 2 + this.B ** 2),
      precision,
    );
  }

  /**
   * `true` if `point` is on the line.
   *
   * If the line has 2 or 1 finite ends, point must be on or between the
   * defined ends.
   * @return {boolean}
   */
  hasPointOn(point: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(point);
    if (this.hasPointAlong(p, precision)) {
      if (this.ends === 2) {
        if (pointinRect(p, this.p1, this.p2, precision)) {
          return true;
        }
        return false;
      }
      if (this.ends === 1) {
        if (this.p1.isEqualTo(p, precision)) {
          return true;
        }
        const p1ToP = new Line(this.p1, p);
        if (round(clipAngle(p1ToP.ang, '0to360'), precision) === round(clipAngle(this.ang, '0to360'), precision)) {
          return true;
        }
        return false;
      }
      return true;  // if this.ends === 0 and point is along, then it is on.
    }
    return false;
  }

  /**
   * `true` if two lines are equal to within some rounding `precision`.
   * @return {boolean}
   */
  isEqualTo(line2: Line, precision?: number = 8) {
    const l1 = this;
    const l2 = line2;
    if (l1.ends !== l2.ends) {
      return false;
    }
    if (l1.ends === 2) {
      if (l1.p1.isNotEqualTo(l2.p1, precision) && l1.p1.isNotEqualTo(l2.p2, precision)) {
        return false;
      }
      if (l1.p2.isNotEqualTo(l2.p1, precision) && l1.p2.isNotEqualTo(l2.p2, precision)) {
        return false;
      }
      return true;
    }

    if (l1.ends === 1) {
      if (l1.p1.isNotEqualTo(l2.p1, precision)) {
        return false;
      }
      if (!l1.hasPointOn(l2.p2, precision)) {
        return false;
      }
      return true;
    }

    // otherwise ends === 0
    if (!l1.hasPointOn(l2.p1)) {
      return false;
    }
    return true;
  }

  /**
   * `true` if two lines are within a delta of each other.
   *
   * This is distinct from a rounding precision as it is an absolute
   * delta.
   *
   * @return {boolean}
   */
  isWithinDelta(line2: Line, delta: number = 0.00000001) {
    const l1 = this;
    const l2 = line2;
    if (l1.ends !== l2.ends) {
      return false;
    }
    if (l1.ends === 2) {
      if (l1.p1.isNotWithinDelta(l2.p1, delta) && l1.p1.isNotWithinDelta(l2.p2, delta)) {
        return false;
      }
      if (l1.p2.isNotWithinDelta(l2.p1, delta) && l1.p2.isNotWithinDelta(l2.p2, delta)) {
        return false;
      }
      return true;
    }

    if (l1.ends === 1) {
      if (l1.p1.isNotWithinDelta(l2.p1, delta)) {
        return false;
      }
      if (!l1.hasPointOn(l2.p2, delta)) {
        return false;
      }
      return true;
    }

    // otherwise ends === 0
    if (!l1.hasPointOn(l2.p1)) {
      return false;
    }
    return true;
  }

  // isWithinLine
  // hasLineWithin
  // isAlongLine
  // isParrallelToLine
  // isPerpendicularToLine

  // hasLineOn(line2: Line, precision: number = 8) {
  //   return line2.isOn(this, precision);
  // }

  /**
   * `true` if this line is within `line2`
   * @return {boolean}
   */
  hasLineWithin(line2: Line, precision: number = 8) {
    return line2.isWithinLine(this, precision);
  }

  /**
   * `true` if this line is along the infinite length of `line2`
   * @return {boolean}
   */
  isAlongLine(line2: Line, precision: number = 8) {
    const l1 = this.round(precision);
    const l2 = line2.round(precision);
    // If A and B are zero, then this is not a line
    if ((l1.A === 0 && l1.B === 0)
      || (l2.A === 0 && l2.B === 0)) {
      return false;
    }
    // If A is 0, then it must be 0 on the other line. Similar with B
    if (l1.A !== 0) {
      const scale = l2.A / l1.A;
      if (l1.B * scale !== l2.B) {
        return false;
      }
      if (l1.C * scale !== l2.C) {
        return false;
      }
      return true;
    }
    if (l2.A !== 0) {
      const scale = l1.A / l2.A;
      if (l2.B * scale !== l1.B) {
        return false;
      }
      if (l2.C * scale !== l1.C) {
        return false;
      }
      return true;
    }
    if (l1.B !== 0) {
      const scale = l2.B / l1.B;
      if (l1.A * scale !== l2.A) {
        return false;
      }
      if (l1.C * scale !== l2.C) {
        return false;
      }
      return true;
    }
    if (l2.B !== 0) {
      const scale = l1.B / l2.B;
      if (l2.A * scale !== l1.A) {
        return false;
      }
      if (l2.C * scale !== l1.C) {
        return false;
      }
      return true;
    }
    return true;
  }

  /**
   * `true` if this line is contained within `line2`
   * @return {boolean}
   */
  isWithinLine(line2: Line, precision: number = 8) {
    const l1 = this.round(precision);
    const l2 = line2.round(precision);
    if (!l1.isAlongLine(l2, precision)) {
      return false;
    }
    if (line2.ends === 0) {
      return true;
    }
    const withinEnds = () => l2.hasPointOn(this.p1, precision) && l2.hasPointOn(this.p2, precision);
    if (this.ends < line2.ends) {
      return false;
    }
    if (this.ends === 2) {
      return withinEnds();
    }
    return withinEnds();
  }

  // left, right, top, bottom is relative to cartesian coordinates
  // 'outside' is the outside of a polygon defined in the positive direction
  // (CCW).
  /**
   * Create a line that is offset by some distance from this line.
   *
   * `'left'`, `'right'`, `'top'` and `'bottom'` are relative to cartesian
   * coordinates.
   *
   * `'positive'` to the right of a vertical line defined from bottom to top and
   * above a horizontal line defined from right to left. Another way to think of
   * it is if lines are used to create a polygon in the positive rotation
   * direction (CCW), the the `'positive'` side will be on the outside of the
   * polygon.
   *
   * `'negative'` is then the inside of the same polygon.
   * @return  {Line}
   */
  offset(
    direction: 'left' | 'right' | 'top' | 'bottom' | 'positive' | 'negative',
    dist: number,
  ) {
    let normalizedAngle = this.ang;
    if (normalizedAngle >= Math.PI) {
      normalizedAngle -= Math.PI;
    }
    if (normalizedAngle < 0) {
      normalizedAngle += Math.PI;
    }
    let offsetAngle = normalizedAngle - Math.PI / 2;
    if (direction === 'positive') {
      offsetAngle = clipAngle(this.ang, '0to360') + Math.PI / 2;
    } else if (direction === 'negative') {
      offsetAngle = clipAngle(this.ang, '0to360') - Math.PI / 2;
    } else if (normalizedAngle < Math.PI / 2) {
      if (direction === 'left' || direction === 'top') {
        offsetAngle = normalizedAngle + Math.PI / 2;
      }
    } else if (direction === 'left' || direction === 'bottom') {
      offsetAngle = normalizedAngle + Math.PI / 2;
    }
    const p1 = new Point(
      this.p1.x + dist * Math.cos(offsetAngle),
      this.p1.y + dist * Math.sin(offsetAngle),
    );
    const p2 = new Point(
      this.p2.x + dist * Math.cos(offsetAngle),
      this.p2.y + dist * Math.sin(offsetAngle),
    );
    return new Line(p1, p2, 0, this.ends);
  }

  // If two lines are parallel, their determinant is 0
  /**
   * `true` if this line is parralel with `line2`
   * @return {boolean}
   */
  isParallelWith(line2: Line, precision: number = 8) {
    const l2 = line2; // line2.round(precision);
    const l1 = this;  // this.round(precision);
    const det = l1.A * l2.B - l2.A * l1.B;
    if (roundNum(det, precision) === 0) {
      return true;
    }
    return false;
  }

  // This needs to be tested somewhere as p1ToShaddow = line was updated
  shaddowOn(l: Line, precision: number = 8) {
    const { intersect } = this.intersectsWith(l, precision);
    if (intersect == null) {
      return null;
    }
    const perpendicular = new Line(intersect, 1, l.ang + Math.PI / 2);
    const shaddow = this.p1.getShaddowOnLine(perpendicular, precision);
    const p1ToShaddow = new Line(this.p1, shaddow);
    const dist = p1ToShaddow.distance;
    // const distance = shaddow.distance(this.p1);
    const projection = new Point(
      this.p1.x + dist * 2 * Math.cos(p1ToShaddow.ang),
      this.p1.y + dist * 2 * Math.sin(p1ToShaddow.ang),
    );
    return new Line(intersect, projection);
  }

  // At two lines intersection, the x and y values must be equal
  //   A1x + B1y = C1 => y = -A1/B1x + C1/B1      - Eq 1
  //   A2x + B2y = C2 => y = -A2/B2x + C2/B2      - Eq 2
  // Right hand sides are equal:
  //   -A1/B1x + C1/B1 = -A2/B2x + C2/B2
  //   x(-A1/B1 + A2/B2) = C2/B2 - C1/B1
  //   x(-A1B2 + A2B1)/B1B2 = (C2B1 - C1B2)/B1B2
  //   x = (C2B1 - C1B2) / (-A1B2 + A2B1)
  //   y = -A1/B1x + C1/B1
  // If however B1 is 0, then y can be found from eqn 2
  //   y = -A2/B2x + C2/B2

  /**
   * The intersection between this line and `line2`.
   *
   * The returned result is an {@link Intersect} object with keys `intersect`,
   * `alongLine` and `withinLine`. The `intersect` is found by extending both
   * lines to infinity and recording where they cross. If the two lines never
   * cross, and are not collinear, then the result will be `undefined`.
   * `alongLine` and `withinLine` can then be used as metadata to defermine if
   * the intersection is within finite lines or not.
   *
   * The properties of the two lines, such as whether they have zero, finite,
   * or infinite length, and are parallel or collinear will define the result.
   *
   * If the lines are not parallel and/or collinear then the returned intercept
   * will be the point where the two lines, extended to infinity, cross. The
   * `withinLine` returned property can then be used to determine if the
   * intercept point is within this line.
   *
   * If one of the lines has zero length, then `intersect` will only be
   * defined if p1 of the zero length line lies along the other line.
   *
   * If both of the lines have zero length, then `intersect` will only be
   * defined if p1 of both lines is the same.
   *
   * If the lines are parallel and not collinear, then `intercept` will be
   * undefined.
   *
   * If lines are collinear then the `intercept` point will be defined by how
   * many finite ends the lines have and wheter the lines are overlapping or
   * not
   *
   * Lines are equal:
   *    - 0 ends: take the yIntercept (or xIntercept if vertical)
   *    - 1 ends: take the p1 point
   *    - 2 ends: take the midPoint
   *
   * One line within the other: take mid point between mid points
   *    - 2 ends around 2 ends: take the midPoint of the two midPoints
   *    - 0 ends around 2 ends: take the midPoint of the 2 ends
   *    - 0 ends around 1 ends: take the p1 of the 1 ends
   *    - 1 end around 1 end: take the midPoint between the p1s
   *    - 1 end around 2 ends: take the midPoint of the two ends
   *
   * Lines are not overlapping:
   *    - Both 2 ends - take midPoint between 2 closest ends
   *    - Both 1 ends - take midPoint between 2 p1s
   *    - One 1 end and 2 end - take midPoint between p1 and closest point
   *
   * Lines are partially overlapping:
   *    - Both 2 ends - take midPoint between 2 overlapping ends
   *    - Both 1 ends - take midPoint between both p1s
   *    - One 1 end and 2 end - take midPoint between overlapping end and p1
   * @return {Intersect}
   */
  intersectsWith(line2: Line, precision: number = 8): Intersect {
    const l2 = line2; // line2.round(precision);
    const l1 = this;  // this.round(precision);

    const d1 = roundNum(this.distance, precision);
    const d2 = roundNum(l2.distance, precision);
    if (d1 === 0 || d2 === 0) {
      let i;
      let alongLine = false;
      let withinLine = false;
      if (d1 === 0 && d2 === 0) {
        if (l1.p1.isEqualTo(l2.p1, precision)) {
          i = l1.p1._dup();
          alongLine = true;
          withinLine = true;
        }
      }
      if (d1 > 0) {
        if (l1.hasPointOn(l2.p1, precision)) {
          i = l2.p1._dup();
          withinLine = true;
          alongLine = true;
        } else if (l1.hasPointAlong(l2.p1, precision)) {
          i = l2.p1._dup();
          alongLine = true;
        }
      }
      if (d2 > 0) {
        if (l2.hasPointOn(l1.p1, precision)) {
          i = l1.p1._dup();
          withinLine = true;
          alongLine = true;
        } else if (l2.hasPointAlong(l1.p1, precision)) {
          i = l1.p1._dup();
          alongLine = true;
        }
      }
      return {
        intersect: i,
        alongLine,
        withinLine,
      };
    }

    if (!l1.isParallelWith(l2)) {
      let i;
      if (roundNum(l1.A, precision) === 0 && roundNum(l2.B, precision) === 0) {
        i = new Point(l2.p1.x, l1.p1.y);
      } else if (roundNum(l1.B, precision) === 0 && roundNum(l2.A, precision) === 0) {
        i = new Point(l1.p1.x, l2.p1.y);
      // if l1.B is 0, then l1 has constant x
      } else if (roundNum(l1.B, precision) === 0) {
        const x = (l2.C * l1.B - l1.C * l2.B) / (-l1.A * l2.B + l2.A * l1.B);
        const y = -l2.A / l2.B * x + l2.C / l2.B;
        i = new Point(x, y);
      } else {
        const x = (l2.C * l1.B - l1.C * l2.B) / (-l1.A * l2.B + l2.A * l1.B);
        const y = -l1.A / l1.B * x + l1.C / l1.B;
        i = new Point(x, y);
      }
      if (
        l1.hasPointOn(i, precision) && l2.hasPointOn(i, precision)
      ) {
        return {
          alongLine: true,
          withinLine: true,
          intersect: i,
        };
      }
      return {
        alongLine: true,
        withinLine: false,
        intersect: i,
      };
    }
    if (!l1.isAlongLine(l2, precision)) {
      return {
        alongLine: false,
        withinLine: false,
        intersect: undefined,
      };
    }

    // If lines are collinear they could be either:
    //   - equal:
    //      - 0 ends: take the yIntercept (or xIntercept if vertical)
    //      - 1 ends: take the p1 point
    //      - 2 ends: take the midPoint
    //   - one within the other: take mid point between mid points
    //      - 2 ends around 2 ends: take the midPoint of the two midPoints
    //      - 0 ends around 2 ends: take the midPoint of the 2 ends
    //      - 0 ends around 1 ends: take the p1 of the 1 ends
    //      - 1 end around 1 end: take the midPoint between the p1s
    //      - 1 end around 2 ends: take the midPoint of the two ends
    //   - not overlapping:
    //      - Both 2 ends - take midPoint between 2 closest ends
    //      - Both 1 ends - take midPoint between 2 p1s
    //      - One 1 end and 2 end - take midPoint between p1 and closest point
    //   - partially overlapping:
    //      - Both 2 ends - take midPoint between 2 overlapping ends
    //      - Both 1 ends - take midPoint between both p1s
    //      - One 1 end and 2 end - take midPoint between overlapping end and p1

    // If Equal
    const xIntercept = this.getXIntercept();
    const yIntercept = this.getYIntercept();
    let defaultIntercept;
    if (yIntercept != null) {
      defaultIntercept = new Point(0, yIntercept);
    } else if (xIntercept != null) {
      defaultIntercept = new Point(xIntercept, 0);
    } else {
      defaultIntercept = new Point(0, 0);
    }
    // const defaultIntercept = yIntercept == null ? new Point(
    // xIntercept == null ? 0 : xIntercept, 0) : new Point(0, yIntercept);

    if (l1.isEqualTo(l2, precision)) {
      let i;
      if (l1.ends === 2) {
        i = l1.midPoint();
      } else if (l1.ends === 1) {
        i = l1.p1._dup();
      } else {
        i = defaultIntercept;
      }
      return {
        alongLine: true,
        withinLine: true,
        intersect: i,
      };
    }

    // If one line is fully within the other
    let i;
    const lineIsWithin = (li1, li2) => {
      // If fully overlapping
      if (li1.hasLineWithin(li2, precision)) {
        if (li1.ends === 2) {
          i = new Line(li1.midPoint(), li2.midPoint()).midPoint();
        }
        if (li1.ends === 1 && li2.ends === 1) {
          i = new Line(li1.p1, li2.p1);
        }
        if (li1.ends === 1 && li2.ends === 2) {
          i = li2.midPoint();
        }
        if (li1.ends === 0 && li2.ends === 2) {
          i = li2.midPoint();
        }
        if (li1.ends === 0 && li2.ends === 1) {
          i = li2.p1._dup();
        }
        if (li1.ends > li2.ends) {
          if (li1.ends === 2) {
            i = li1.midPoint();
          } else {
            i = li1.p1;
          }
        }
        if (li1.ends === 1 && li2.ends === 1) {
          i = new Line(li1.p1, li2.p1).midPoint();
        }
        return true;
      }
      return false;
    };
    if (lineIsWithin(l1, l2)) {
      return { alongLine: true, withinLine: true, intersect: i };
    }
    if (lineIsWithin(l2, l1)) {
      return { alongLine: true, withinLine: true, intersect: i };
    }

    // Two finite lines
    if (l1.ends === 2 && l2.ends === 2) {
      // Not overlapping
      if (
        !l1.p1.isWithinLine(l2, precision)
        && !l1.p2.isWithinLine(l2, precision)
        && !l2.p1.isWithinLine(l1, precision)
        && !l2.p2.isWithinLine(l1, precision)
      ) {
        const line11 = new Line(l1.p1, l2.p1);
        const line12 = new Line(l1.p1, l2.p2);
        const line21 = new Line(l1.p2, l2.p1);
        const line22 = new Line(l1.p2, l2.p2);

        i = line11.midPoint();
        let len = line11.length();
        if (line12.length() < len) {
          i = line12.midPoint();
          len = line12.length();
        }
        if (line21.length() < len) {
          i = line21.midPoint();
          len = line21.length();
        }
        if (line22.length() < len) {
          i = line22.midPoint();
          len = line22.length();
        }
        return {
          alongLine: true,
          withinLine: false,
          intersect: i,
        };
      }
      // Partial overlap
      if (l1.p1.isWithinLine(l2, precision)) {
        if (l2.p1.isWithinLine(l1, precision)) {
          i = new Line(l1.p1, l2.p1).midPoint();
        } else {
          i = new Line(l1.p1, l2.p2).midPoint();
        }
      } else if (l2.p1.isWithinLine(l1, precision)) {
        i = new Line(l1.p2, l2.p1).midPoint();
      } else {
        i = new Line(l1.p2, l2.p2).midPoint();
      }
      return {
        alongLine: true,
        withinLine: true,
        intersect: i,
      };
    }

    // Two 1 end lines
    if (l1.ends === 1 && l2.ends === 1) {
      // Both not overlapping and partial overlap will have an intersect as
      // the midPoint between the p1s
      return {
        alongLine: true,
        withinLine: false,
        intersect: new Line(l1.p1, l2.p1).midPoint(),
      };
    }

    // One 1 end, one 2 end is the only remaining possibility
    let withinLine = false;
    const checkOverlap = (li1: Line, li2: Line) => {
      // partial overlap
      if (li1.p1.isWithinLine(li2)) {
        withinLine = true;
        if (li2.p1.isWithinLine(li1)) {
          i = new Line(li1.p1, li2.p1).midPoint();
        } else {
          i = new Line(li1.p1, li2.p2).midPoint();
        }
      // No Overlap
      } else {
        withinLine = false;
        const l11 = new Line(li1.p1, li2.p1);
        const l12 = new Line(li1.p1, li2.p2);

        if (l11.length() < l12.length()) {
          i = l11.midPoint();
        } else {
          i = l12.midPoint();
        }
      }
    };
    if (l1.ends === 1 && l2.ends === 2) {
      checkOverlap(l1, l2);
    } else {
      checkOverlap(l2, l1);
    }
    return {
      alongLine: true,
      withinLine,
      intersect: i,
    };
  }
}

class Vector extends Line {
  i: number;
  j: number;

  constructor(
    p1OrLine: TypeParsablePoint | Line,
    p2OrMag: TypeParsablePoint | number,
    angle: number = 0,
  ) {
    if (p1OrLine instanceof Line) {
      super(p1OrLine.p1, p1OrLine.distance, p1OrLine.ang);
    } else {
      super(p1OrLine, p2OrMag, angle);
    }
    this.i = this.distance * Math.cos(this.ang);
    this.j = this.distance * Math.sin(this.ang);
  }

  unit() {
    return new Vector(this.p1, 1, this.ang);
  }

  dotProduct(v: Vector, precision: number = 8) {
    return roundNum(this.i * v.i + this.j * v.j, precision);
  }
}

function line(p1: Point, p2: Point) {
  return new Line(p1, p2);
}


type TypeF1DefLine = {
  f1Type: 'l',
  state: [[number, number], [number, number], 2 | 1 | 0],
};


/**
 * A {@link Line} is defined with either two points, or a point, magbintude and angle.
 * The end definitions define if the line is finite or infinite. And end
 * definition of `2` means both ends are finite and the line stops at its
 * definition. `1` means the first end is finite, and the line extends through
 * the second point to infinity. `0` means the line extends through both
 * points to infinite on either side.
 *
 * A line can be defined in several ways.
 *
 * As a Line: `new Line()`
 * - As two points: `[{@link TypeParsablePoint}, {@link TypeParsablePoint}]`
 * - As two points and end definitions:
 *   `[{@link TypeParsablePoint}, {@link TypeParsablePoint}, 2 | 1 | 0]`
 * - As a point, mag angle: `[{@link TypeParsablePoint}, number, number]`
 * - As a point, mag angle and end definitions: '[number, number, 2, 1, 0]'
 * - As a definition object where state is
 *   [[p1.x, p1.y], [p2.x, p2.y], endDefinition]:
 *   { f1Type: 'l', state: [[number, number], [number, number], 2 | 1 | 0 }
 * @example
 * // l1, l2, l3, l4, l5 and l6 are all the same if parsed by `getLine`
 * l1 = new Line([0, 0], [2, 2]);
 * l2 = new Line([0, 0], 2 * Math.sqrt(2), Math.PI / 4);
 * l3 = new Line([0, 0], [2, 2], 2);
 * l4 = [[0, 0], [2, 2]];
 * l5 = [[0, 0], 2 * Math.sqrt(2), Math.PI / 4];
 * l6 = [[0, 0], [2, 2], 2];
 */
export type TypeParsableLine = [TypeParsablePoint, TypeParsablePoint, 2 | 1 | 0]
                                | [TypeParsablePoint, TypeParsablePoint]
                                | [TypeParsablePoint, number, number, 2 | 1 | 0]
                                | [TypeParsablePoint, number, number]
                                | TypeF1DefLine
                                | Line;
// line can be defined as:
//    - [[0, 0], [1, 0]]
//    - [[0, 0], 1, 0]

function parseLine<T>(lIn: TypeParsableLine, onFail: T): Line | T | null {
  if (lIn instanceof Line) {
    return lIn;
  }
  let onFailToUse = onFail;
  if (onFailToUse == null) {
    onFailToUse = null;
  }

  if (lIn == null) {
    return onFailToUse;
  }

  let l = lIn;
  if (typeof l === 'string') {
    try {
      l = JSON.parse(l);
    } catch {
      return onFailToUse;
    }
  }

  if (Array.isArray(l)) {
    if (l.length === 4) {
      return new Line(getPoint(l[0]), l[1], l[2], l[3]);
    }
    if (l.length === 3) {
      if (typeof l[1] === 'number') {
        return new Line(getPoint(l[0]), l[1], l[2]);
      } // $FlowFixMe
      return new Line(getPoint(l[0]), getPoint(l[1]), 0, l[2]);
    }
    if (l.length === 2) {
      return new Line(getPoint(l[0]), getPoint(l[1]));
    }
    return onFailToUse;
  }
  if (l.f1Type != null) {
    if (
      l.f1Type === 'l'
      && l.state != null
      && Array.isArray([l.state])
      && l.state.length === 3
    ) {
      const [p1, p2, ends] = l.state;
      return new Line(getPoint(p1), getPoint(p2), 0, ends);
    }
    return onFailToUse;
  }
  return onFailToUse;
}

/**
 * Convert a parsable line definition to a {@link Line}.
 * @param {TypeParsableLine} l parsable line definition
 * @return {Line} `Line` object
 */
function getLine(l: TypeParsableLine): Line {
  let parsedLine = parseLine(l);
  if (parsedLine == null) {
    parsedLine = new Line(new Point(0, 0), new Point(1, 0));
  }
  return parsedLine;
}

type TypeF1DefRotation = {
  f1Type: 'r',
  state: [string, number],
};

/**
 * Rotation transform element
 */
class Rotation {
  r: number;
  name: string;
  /**
   * @param {number | string} rotationAngle
   * @param {string} name name to give to rotation to identify it in a more
   * complex {@link Transform}
   */
  constructor(rotationAngle: number | TypeF1DefRotation | string, name: string = '') {
    let nameToUse: string = name;
    let angle = rotationAngle;
    if (typeof angle === 'string') {
      try {
        angle = JSON.parse(angle);
      } catch {
        angle = 0;
      }
    }

    if (typeof angle === 'number') {
      this.r = angle;
    } else if (
      angle.f1Type != null
      && angle.f1Type === 'r'
      && angle.state != null
      && Array.isArray(angle.state)
      && angle.state.length === 2
    ) {
      const [n, r] = angle.state;
      nameToUse = n;
      this.r = r;
    } else {
      this.r = 0;
    }
    this.name = nameToUse;
  }

  isUnity() {
    if (this.r !== 0) {
      return false;
    }
    return true;
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'r',
      state: [this.name, roundNum(this.r, precision)],
    };
  }

  /**
   * Return a rotation matrix representing the rotation
   * @return {Array<number>}
   */
  matrix(): Array<number> {
    return m2.rotationMatrix(this.r);
  }

  transform(m: Array<number>) {
    return m2.rotate(m, this.r);
  }

  /**
   * Subtract `rotToSub` from this rotation
   * @return {Rotation}
   */
  sub(rotToSub: Rotation = new Rotation(0, this.name)): Rotation {
    return new Rotation(this.r - rotToSub.r, this.name);
  }

  /**
   * Round this rotation to some `precision`
   * @return {Rotation}
   */
  round(precision: number = 8): Rotation {
    return new Rotation(roundNum(this.r, precision), this.name);
  }

  /**
   * Add `rotToAdd` to this rotation
   * @return {Rotation}
   */
  add(rotToAdd: Rotation = new Rotation(0, this.name)): Rotation {
    return new Rotation(this.r + rotToAdd.r, this.name);
  }

  /**
   * Multiply `rotToMul` to this rotation
   * @return {Rotation}
   */
  mul(rotToMul: Rotation = new Rotation(1, this.name)): Rotation {
    return new Rotation(this.r * rotToMul.r, this.name);
  }

  /**
   * Return a duplicate rotation
   * @return {Rotation}
   */
  _dup() {
    return new Rotation(this.r, this.name);
  }
}


type TypeF1DefTranslation = {
  f1Type: 't',
  state: [string, number, number],
};

/**
 * Translation transform element
 */
class Translation extends Point {
  x: number;
  y: number;
  name: string;

  /**
   * @param {Point | number} txOrTranslation translation or x value of
   * translation
   * @param {number} ty y value of translation (only used if `txOrTranslation`
   * is a `number`)
   * @param {string} name name to identify translation when included in a more
   * complex {@link Transform}
   */
  constructor(
    txOrTranslation: Point | number | TypeF1DefTranslation,
    ty: number = 0,
    name: string = '',
  ) {
    let nameToUse: string = name;
    let tx = txOrTranslation;
    let tyToUse = ty;
    if (typeof tx === 'string') {
      try {
        tx = JSON.parse(tx);
      } catch {
        tx = 0;
      }
      if (Array.isArray(tx) && tx.length === 2) {
        [tx, tyToUse] = tx;
      }
    }
    if (tx instanceof Point) {
      super(tx.x, tx.y);
    } else if (typeof tx === 'number') {
      super(tx, tyToUse);
    } else if (
      tx.f1Type != null
      && tx.f1Type === 't'
      && tx.state != null
      && Array.isArray(tx.state)
      && tx.state.length === 3
    ) {
      const [n, x, y] = tx.state;
      nameToUse = n;
      super(x, y);
    } else {
      super(0, 0);
    }
    this.name = nameToUse;
  }

  isUnity() {
    if (this.x !== 0 || this.y !== 0) {
      return false;
    }
    return true;
  }

  _state(options: { precision: number }) {
    const precision = getPrecision(options);
    return {
      f1Type: 't',
      state: [
        this.name,
        roundNum(this.x, precision),
        roundNum(this.y, precision),
      ],
    };
  }

  /**
   * Returns a translation matrix
   * @return {Array<number>}
   */
  matrix(): Array<number> {
    return m2.translationMatrix(this.x, this.y);
  }

  transform(m: Array<number>) {
    return m2.translate(m, this.x, this.y);
  }

  /**
   * Subtract `translationToSub` from this translation
   * @return {Translation}
   */
  sub(
    translationToSub: Translation | Point | number = new Translation(0, 0),
    y: number = 0,
  ): Translation {
    let t = new Point(0, 0);
    if (typeof translationToSub === 'number') {
      t = new Translation(translationToSub, y);
    } else {
      t = translationToSub;
    }
    return new Translation(
      this.x - t.x,
      this.y - t.y,
      this.name,
    );
  }

  /**
   * Add `translationToAdd` to this translation
   * @return {Translation}
   */
  add(
    translationToAdd: Translation | Point | number = new Translation(0, 0),
    y: number = 0,
  ): Translation {
    let t = new Point(0, 0);
    if (typeof translationToAdd === 'number') {
      t = new Translation(translationToAdd, y);
    } else {
      t = translationToAdd;
    }
    return new Translation(
      this.x + t.x,
      this.y + t.y,
      this.name,
    );
  }

  /**
   * Multiply `translationToMul` to this translation
   * @return {Translation}
   */
  mul(translationToMul: Translation = new Translation(1, 1)): Translation {
    return new Translation(
      this.x * translationToMul.x,
      this.y * translationToMul.y,
      this.name,
    );
  }

  /**
   * Round this translation to some `precision`
   * @return {Translation}
   */
  round(precision: number = 8): Translation {
    return new Translation(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      this.name,
    );
  }

  /**
   * Return a duplicate translation
   */
  _dup() {
    return new Translation(this.x, this.y, this.name);
  }
}

type TypeF1DefScale = {
  f1Type: 't',
  state: [string, number, number],
};

/**
 * Scale transform element
 */
class Scale extends Point {
  x: number;
  y: number;
  name: string;

  /**
   * @param {Point | number} sxOrScale scale or x value of
   * scale
   * @param {number} ty y value of scale (only used if `sxOrScale`
   * is a `number`)
   * @param {string} name name to identify scale when included in a more
   * complex {@link Transform}
   */
  constructor(sxOrScale: Point | number | TypeF1DefScale, sy: ?number, nameIn: string = '') {
    let name: string = nameIn;
    let sx = sxOrScale;
    let syToUse = sy;
    if (typeof sx === 'string') {
      try {
        sx = JSON.parse(sx);
      } catch {
        sx = 0;
      }
      if (Array.isArray(sx) && sx.length === 2) {
        [sx, syToUse] = sx;
      }
    }
    if (sx instanceof Point) {
      super(sx.x, sx.y);
    } else if (typeof sx === 'number') {
      if (syToUse != null) {
        super(sx, syToUse);
      } else {
        super(sx, sx);
      }
    } else if (
      sx.f1Type != null
      && sx.f1Type === 's'
      && sx.state != null
      && Array.isArray(sx.state)
      && sx.state.length === 3
    ) {
      const [n, x, y] = sx.state;
      name = n;
      super(x, y);
    } else {
      super(1, 1);
    }
    this.name = name;
  }

  isUnity() {
    if (this.x !== 1 || this.y !== 1) {
      return false;
    }
    return true;
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 's',
      state: [
        this.name,
        roundNum(this.x, precision),
        roundNum(this.y, precision),
      ],
    };
  }

  /**
   * Returns a scale matrix
   * @return {Array<number>}
   */
  matrix(): Array<number> {
    return m2.scaleMatrix(this.x, this.y);
  }

  transform(m: Array<number>) {
    return m2.scale(m, this.x, this.y);
  }

  /**
   * Subtract `scaleToSub` from this scale
   * @return {Scale}
   */
  sub(
    scaleToSub: Scale | Point | number = new Scale(0, 0),
    y: number = 0,
  ): Scale {
    let s = new Point(0, 0);
    if (typeof scaleToSub === 'number') {
      s = new Scale(scaleToSub, y);
    } else {
      s = scaleToSub;
    }
    return new Scale(
      this.x - s.x,
      this.y - s.y,
      this.name,
    );
  }

  /**
   * Round this scale to some `precision`
   * @return {Scale}
   */
  round(precision: number = 8): Scale {
    return new Scale(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      this.name,
    );
  }

  /**
   * Add `scaleToAdd` to this scale
   * @return {Scale}
   */
  add(
    scaleToAdd: Scale | Point | number = new Scale(0, 0),
    y: number = 0,
  ): Scale {
    let s = new Point(0, 0);
    if (typeof scaleToAdd === 'number') {
      s = new Scale(scaleToAdd, y);
    } else {
      s = scaleToAdd;
    }
    return new Scale(
      this.x + s.x,
      this.y + s.y,
      this.name,
    );
  }

  /**
   * Multiply `scaleToMul` to this scale
   * @return {Scale}
   */
  mul(scaleToMul: Scale | Point | number = new Scale(1, 1)): Scale {
    if (scaleToMul instanceof Scale || scaleToMul instanceof Point) {
      return new Scale(
        this.x * scaleToMul.x,
        this.y * scaleToMul.y,
      );
    }
    return new Scale(
      this.x * scaleToMul,
      this.y * scaleToMul,
      this.name,
    );
  }

  /**
   * Return a duplicate of this scale
   * @return {Scale}
   */
  _dup() {
    return new Scale(this.x, this.y, this.name);
  }
}

export type TypeTransformValue = number | Array<number> | {
  scale?: number,
  position?: number,
  translation?: number,
  rotation?: number,
};

function isTransformArrayZero(
  transformValue: TypeTransformValue,
  threshold: number = 0.00001,
) {
  const isZero = (v: number) => (v > -threshold && v < threshold);
  const isArrayZero = (values: Array<number>) => {
    for (let i = 0; i < values.length; i += 1) {
      if (!isZero(values[i])) {
        return false;
      }
    }
    return true;
  };
  if (typeof transformValue === 'number') {
    return isZero(transformValue);
  }
  if (Array.isArray(transformValue)) {
    return isArrayZero(transformValue);
  }
  // $FlowFixMe
  const values = Object.values(transformValue).filter(v => v != null);
  // $FlowFixMe
  return isArrayZero(values);
}

export type ScaleTransform3DComponent = ['s', number, number, number];
export type TranslateTransform3DComponent = ['t', number, number, number];
export type RotateTransform3DComponent = ['r', number, number, number];
export type CustomTransform3DComponent = ['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export type ScaleTransform2DComponent = ['s', number, number];
export type TranslateTransform2DComponent = ['t', number, number];
export type RotateTransform2DComponent = ['r', number];
// export type CustomTransform2DComponent = ['r', number, number, number, number, number, number, number, number, number];

export type TransformComponent = ScaleTransform3DComponent | ScaleTransform2DComponent
  | TranslateTransform3DComponent | TranslateTransform2DComponent
  | RotateTransform3DComponent | RotateTransform2DComponent
  | CustomTransform3DComponent;

export type Transform3DComponent = ScaleTransform3DComponent
  | TranslateTransform3DComponent
  | RotateTransform3DComponent
  | CustomTransform3DComponent;
export type TransformDefinition = Array<TransformComponent>;

// function parseTransformComponent(component: TransformComponent): Transform3DComponent {
//   const [type] = component;
//   if (type === 't') {
//     if (component.length === 4) {
//       return component;
//     }
//     const [, x, y] = component;
//     return ['t', x, y, 0];
//   }

//   if (type === 'r') {
//     if (component.length === 4) {
//       return component;
//     }
//     const [, r] = component;
//     return ['r', 0, 0, r];
//   }

//   if (type === 's') {
//     if (component.length === 4) {
//       return component;
//     }
//     const [, x, y] = component;
//     return ['s', x, y, 0];
//   }

//   if (type === 'c') {
//     return component;
//   }
//   throw new Error(`Could not parse transform component ${JSON.stringify(component)}`);
// }

// function getTransformComponentMatrix(component: Transform3DComponent) {
//   const [type] = component;
//   if (type === 't') {
//     const [, x, y, z] = component;
//     return m3.translationMatrix(x, y, z);
//   }

//   if (type === 'r') {
//     const [, rx, ry, rz] = component;
//     return m3.rotationMatrix(rx, ry, rz);
//   }

//   if (type === 's') {
//     const [, sx, sy, sz] = component;
//     return m3.rotationMatrix(sx, sy, sz);
//   }
//   if (type === 'c') {
//     return component.slice(1);
//   }
// }

function makeTransformComponent(
  component: Transform3DComponent,
  operation: (index: number) => number,
) {
  const newDef = Array(component.length);
  // eslint-disable-next-line prefer-destructuring
  newDef[0] = component[0];
  newDef[newDef.length - 1] = component[component.length - 1];
  for (let j = 1; j < component.length - 1; j += 1) {
    newDef[j] = operation(j);
  }
  return newDef;
}

/**
 * Object that represents a chain of {@link Rotation}, {@link Translation} and
 * {@link Scale} transforms
 *
 * Use `translate`, `scale` and `rotate` methods to create chains (see example).
 *
 * @example
 * // Create a tranform that first scales, then rotates then translates
 * const t1 = new Transform().scale(2, 2).rotate(Math.PI).translate(1, 1)
 */
class Transform {
  def: TransformDefinition;
  // order: Array<Translation | Rotation | Scale>;
  mat: Array<number>;
  index: number;
  translationIndex: number;
  name: string;
  _type: 'transform';

  /**
   * @param {Array<Translation | Rotation | Scale> | string} chainOrName chain
   * of transforms to initialize this Transform with, or name of transform if
   * not initializing with transforms.
   * @param {string} name transform name if `chainOrName` defines initializing
   * transforms
   */
  constructor(defOrName: TransformDefinition | string = '', name: string = '') {
    if (typeof defOrName === 'string') {
      // this.order = [];
      this.def = [];
      this.name = defOrName;
    } else {
      // for (let i = 0; i < orderOrName.length; i += 1 ) {
      //   const t = orderOrName[i];
      //   if (
      //     !(t instanceof Translation)
      //     && !(t instanceof Scale)
      //     && !(t instanceof Rotation)
      //   ) {
      //     debugger;
      //   }
      // }
      // debugger;
      // this.order = chainOrName.map(t => t._dup());
      this.def = defOrName.map(d => d.slice());
      // this.def = chainOrName.map(t => parseTransformComponent(t));
      this.name = name;
    }
    // this.order = order.slice();
    this.index = this.def.length;
    this._type = 'transform';
    this.calcAndSetMatrix();
  }

  // createFromDef(def: TransformDefinition, name: string) {
  //   const order = [];
  //   for (let i = 0; i < def.length; i += 1) {
  //     const [type] = def[i];
  //     if (type === 't') {
  //       const t = new Translation(def[i][1], def[i][2], name);
  //       // t.z = def[i][3];
  //       order.push(t);
  //     } else if (type === 's') {
  //       const s = new Scale(def[i][1], def[i][2], name);
  //       // s.z = def[i][3];
  //       order.push(s);
  //     }
  //     if (type === 'r') {
  //       order.push(new Rotation(def[i][3], name));
  //     }
  //   }
  //   return new Transform(order, name);
  // }


  _state(options: { precision: number } = { precision: 8 }) {
    // const { precision } = options;
    // const out = [];
    // this.order.forEach((transformElement) => {
    //   out.push(transformElement._state(options));
    // });
    // this.def.forEach(d => out.push)
    // if (this.name !== '') {
    //   // return [this.name, ...out];
    //   out = [this.name, ...out];
    // }
    return {
      f1Type: 'tf',
      state: [
        this.name,
        ...this.def.slice(),
      ],
    };
  }

  /**
   * Return a standard unity transform chain that includes scale, rotation and
   * translation blocks
   * @return {Transform}
   */
  standard() {
    return this.scale(1, 1, 1).rotate(0, 0, 0).translate(0, 0, 0);
  }

  /**
   * Return a duplicate transform with an added {@link Translation} transform
   * @param {number | Point} xOrTranslation
   * @return {Transform}
   */
  translate(
    xOrTranslation: number | Point,
    y: number = 0,
    z: number = 0,
    // name: string = this.name,
  ) {
    let _x = xOrTranslation;
    let _y = y;
    let _z = z;
    if (typeof xOrTranslation !== 'number') {
      _x = xOrTranslation.x;
      _y = xOrTranslation.y;
      _z = xOrTranslation.z;
    }
    const t = ['t', _x, _y, _z];
    // const translation = new Translation(xOrTranslation, y, name);
    // const order = this.order.slice();

    if (this.index === this.def.length) {
      this.def.push(t);
    } else {
      this.def[this.index] = t;
    }
    this.index += 1;
    this.calcAndSetMatrix();
    return this;
    // return new Transform(order, name);
  }

  /**
   * Return a duplicate transform with an added {@link Rotation} transform
   * @param {number} r
   * @return {Transform}
   */
  rotate(rOrRxOrPoint: number | Point, ry: number | null = null, rz: number = 0) {
    let _rx = rOrRxOrPoint;
    let _ry = ry;
    let _rz = rz;
    if (typeof rOrRxOrPoint === 'number') {
      if (ry == null) {
        _rx = 0;
        _ry = 0;
        _rz = rOrRxOrPoint;
      }
    } else {
      _rx = rOrRxOrPoint.x;
      _ry = rOrRxOrPoint.y;
      _rz = rOrRxOrPoint.z;
    }
    const r = ['r', _rx, _ry, _rz];

    if (this.index === this.def.length) {
      this.def.push(r);
    } else {
      this.def[this.index] = r;
    }
    this.index += 1;
    this.calcAndSetMatrix();
    return this;
  }

  /**
   * Return a duplicate transform with an added {@link Scale} transform
   * @param {number | Point} xOrScale
   * @return {Transform}
   */
  scale(
    sOrSxOrPoint: number | Point,
    sy: number | null = null,
    sz: number = 1,
  ) {
    let _sx = sOrSxOrPoint;
    let _sy = sy;
    let _sz = sz;
    if (typeof sOrSxOrPoint === 'number') {
      if (sy == null) {
        _sx = sOrSxOrPoint;
        _sy = sOrSxOrPoint;
        _sz = sOrSxOrPoint;
      }
    } else {
      _sx = sOrSxOrPoint.x;
      _sy = sOrSxOrPoint.y;
      _sz = sOrSxOrPoint.z;
    }
    const s = ['s', _sx, _sy, _sz];

    if (this.index === this.def.length) {
      this.def.push(s);
    } else {
      this.def[this.index] = s;
    }
    this.index += 1;
    this.calcAndSetMatrix();
    return this;
  }

  /**
   * Remove some transforms from this transform chain
   * @return {Transform}
   */
  remove(transformNames: string | Array<string>) {
    const newOrder = [];
    let names;
    if (typeof transformNames === 'string') {
      names = [transformNames];
    } else {
      names = transformNames;
    }
    this.order.forEach((transformElement) => {
      if (names.indexOf(transformElement.name) === -1) {
        newOrder.push(transformElement._dup());
      }
    });
    return new Transform(newOrder, this.name);
  }

  /**
   * Transform matrix of the transform chain
   * @return {Array<number>}
   */
  calcMatrix(
    defStart: number = 0,
    defEnd: number = this.def.length - 1,
  ) {
    let defEndToUse = defEnd;
    if (defEnd < 0) {
      defEndToUse = this.def.length + defEnd;
    }
    let m = m3.identity();
    for (let i = defEndToUse; i >= defStart; i -= 1) {
      // let n1 = this.order[i].matrix();
      // let n2;
      // if (!this.order[i].isUnity()) {
      //   m = m3.mul(m, this.order[i].matrix());
      //   // m = this.order[i].transform(m);
      // }
      const [type, x, y, z] = this.def[i];
      if (type === 't' && (x !== 0 || y !== 0 || z !== 0)) {
        // n2 = m3.translationMatrix(x, y);
        // if (x !== 0 && y !== 0 && z !== 0) {
        m = m3.mul(m, m3.translationMatrix(x, y, z));
        // }
      } else if (type === 's' && (x !== 1 || y !== 1 || z !== 1)) {
        // n2 = m3.scaleMatrix(x, y);
        m = m3.mul(m, m3.scaleMatrix(x, y, z));
      } else if (type === 'r' && (x !== 0 || y !== 0 || z !== 0)) {
        // n2 = m3.rotationMatrix(x, y);
        m = m3.mul(m, m3.rotationMatrix(x, y, z));
      }
      // console.log(type, n1, n2)
    }
    return m;
  }

  calcAndSetMatrix() {
    this.mat = this.calcMatrix();
  }


  update(index: number) {
    if (index < this.def.length) {
      this.index = index;
    }
    return this;
  }

  /**
   * Retrieve the nth {@link Translation} transform value from this transform
   * chain where n = `translationIndex`. If `translationIndex` is invalid
   * (like if it is larger than the number of `Translation` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  t(translationIndex: number = 0): ?Point {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      const [type] = this.def[i];
      if (type === 't') {
        if (count === translationIndex) {
          const [, x, y, z] = this.def[i];
          return new Point(x, y, z);
        }
        count += 1;
      }
    }
    throw new Error(`Cannot get ${translationIndex}-index translation from transform`);
  }

  /**
   * Clip all {@link Rotation} transforms within this transform chain to
   * angles between 0º-360º, -180º-180º, or not at all (`null`)
   */
  clipRotation(clipTo: '0to360' | '-180to180' | null) {
    for (let i = 0; i < this.order.length; i += 1) {
      const transformStep = this.order[i];
      if (transformStep instanceof Rotation) {
        transformStep.r = clipAngle(transformStep.r, clipTo);
        this.def[i][3] = clipAngle(transformStep.r, clipTo);
      }
    }
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Translation} transform where n = `index`
   * @return {Transform}
   */
  updateTranslation(
    p: TypeParsablePoint,
    index: number = 0,
  ) {
    return this.updateComponent('t', getPoint(p), index);
    // let count = 0;
    // let actualIndex = translationIndex;
    // let _x = xOrPoint;
    // let _y = yOrIndex;
    // let _z = z;
    // if (typeof xOrPoint !== 'number') {
    //   const p = getPoint(xOrPoint);
    //   actualIndex = yOrIndex;
    //   _x = p.x;
    //   _y = p.y;
    //   _z = p.z;
    // }
    // for (let i = 0; i < this.def.length; i += 1) {
    //   const [type] = this.def[i];
    //   if (type === 't') {
    //     if (count === actualIndex) {
    //       this.def[i] = ['t', _x, _y, _z];
    //       this.calcAndSetMatrix();
    //       return this;
    //     }
    //     count += 1;
    //   }
    // }
    // throw new Error(`Cannot update translation in transform: ${this.def}`);
  }

  updateComponent(
    type: 't' | 's' | 'r',
    p: Point,
    index: number,
  ) {
    let count = 0;
    // let actualIndex = translationIndex;
    // let _x = xOrPoint;
    // let _y = yOrIndex;
    // let _z = z;
    // if (typeof xOrPoint !== 'number') {
    //   const p = getPoint(xOrPoint);
    //   actualIndex = yOrIndex;
    //   _x = p.x;
    //   _y = p.y;
    //   _z = p.z;
    // }
    for (let i = 0; i < this.def.length; i += 1) {
      const [componentType] = this.def[i];
      if (componentType === type) {
        if (count === index) {
          this.def[i] = [type, p.x, p.y, p.z];
          this.calcAndSetMatrix();
          return this;
        }
        count += 1;
      }
    }
    let message = 'translation';
    if (type === 'r') {
      message = 'rotation';
    }
    if (type === 's') {
      message = 'scale';
    }
    throw new Error(`Cannot update ${message} in transform: ${this.def}`);
  }


  /**
   * Retrieve the nth {@link Scale} transform value from this transform
   * chain where n = `scaleIndex`. If `scaleIndex` is invalid
   * (like if it is larger than the number of `Scale` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  s(scaleIndex: number = 0): ?Point {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      // const t = this.order[i];
      const [type] = this.def[i];
      if (type === 's') {
        if (count === scaleIndex) {
          const [, x, y, z] = this.def[i];
          return new Point(x, y, z);
        }
        count += 1;
      }
    }
    throw new Error(`Cannot get ${scaleIndex}-index scale from transform`);
  }

  /**
   * Return an interpolated transform between this transform and `delta` at
   * some `percent` between the two.
   *
   * Interpolation can either be `'linear'` or '`curved'`.
   * @return {Transform}
   */
  toDelta(
    delta: Transform,
    percent: number,
    translationStyle: 'linear' | 'curved' | 'curve',
    translationOptions: OBJ_TranslationPath,
    // translationPath: (Point, Point, number, ?number, ?number) => Point,
    // direction: number = 1,
    // mag: number = 0.5,
    // offset: number = 0.5,
  ) {
    const calcTransform = this._dup();
    for (let i = 0; i < this.order.length; i += 1) {
      const stepStart = this.order[i];
      const stepDelta = delta.order[i];
      if (stepStart instanceof Scale && stepDelta instanceof Scale) {
        calcTransform.order[i] = stepStart.add(stepDelta.mul(percent));
        const s = stepStart.add(stepDelta.mul(percent));
        calcTransform.def[i] = ['s', s.x, s.y, 1, stepStart.name];
      }
      if (stepStart instanceof Rotation && stepDelta instanceof Rotation) {
        calcTransform.order[i] = new Rotation(stepStart.r + stepDelta.r * percent, stepStart.name);
        const r = stepStart.r + stepDelta.r * percent;
        calcTransform.def[i] = ['r', 0, 0, r, stepStart.name];
      }
      if (stepStart instanceof Translation && stepDelta instanceof Translation) {
        calcTransform.order[i] =
          new Translation(translationPath(
            translationStyle,
            stepStart, stepDelta, percent,
            translationOptions,
          ), 0, stepStart.name);
        const t = translationPath(
          translationStyle,
          stepStart, stepDelta, percent,
          translationOptions,
        );
        calcTransform.def[i] = ['t', t.x, t.y, t.z, stepStart.name];
      }
    }
    return calcTransform;
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Scale} transform where n = `index`
   * @return {Transform}
   */
  updateScale(
    s: number | TypeParsablePoint,
    index: number = 0,
  ) {
    return this.updateComponent('s', getScale(s), index);
  }

  // updateScale1(x: number | Point, yOrIndex: ?number = null, index: number = 0) {
  //   let count = 0;
  //   let actualIndex = index;
  //   let scale = new Point(1, 1, 1);
  //   if (x instanceof Point) {
  //     if (yOrIndex == null) {
  //       actualIndex = 0;
  //     } else {
  //       actualIndex = yOrIndex;
  //     }
  //     scale = x;
  //   } else if (yOrIndex == null) {
  //     scale.x = x;
  //     scale.y = x;
  //   } else {
  //     scale.x = x;
  //     scale.y = yOrIndex;
  //   }
  //   for (let i = 0; i < this.order.length; i += 1) {
  //     const t = this.order[i];
  //     if (t instanceof Scale) {
  //       if (count === actualIndex) {
  //         this.order[i] = new Scale(scale.x, scale.y, this.name);
  //         this.def[i] = ['s', scale.x, scale.y, 1, this.name];
  //         this.calcAndSetMatrix();
  //         return this;
  //       }
  //       count += 1;
  //     }
  //   }
  //   return this;
  // }

  /**
   * Retrieve the nth {@link Rotation} transform value from this transform
   * chain where n = `rotationIndex`. If `scaleIndex` is invalid
   * (like if it is larger than the number of `Rotation` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  r(rotationIndex: number = 0): ?number {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] === 'r') {
        if (count === rotationIndex) {
          return this.def[i][3];
        }
        count += 1;
      }
    }
    throw new Error(`Cannot get ${rotationIndex}-index rotation from transform`);
  }

  r3(rotationIndex: number = 0) {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] === 'r') {
        if (count === rotationIndex) {
          const [, x, y, z] = this.def[i];
          return new Point(x, y, z);
        }
        count += 1;
      }
    }
    throw new Error(`Cannot get ${rotationIndex}-index rotation from transform`);
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Rotation} transform where n = `index`
   * @return {Transform}
   */
  updateRotation(
    r: number | TypeParsablePoint,
    index: number = 0,
  ) {
    if (typeof r === 'number') {
      return this.updateComponent('r', getPoint([0, 0, r]), index);
    }
    return this.updateComponent('r', getPoint(r), index);
  }
  // updateRotation(r: number, index: number = 0) {
  //   let count = 0;
  //   for (let i = 0; i < this.order.length; i += 1) {
  //     const t = this.order[i];
  //     if (t instanceof Rotation) {
  //       if (count === index) {
  //         this.order[i] = new Rotation(r, this.name);
  //         this.def[i] = ['r', 0, 0, r, this.name];
  //         this.calcAndSetMatrix();
  //         return this;
  //       }
  //       count += 1;
  //     }
  //   }
  //   return this;
  // }

  /**
   * Return the matrix that respresents the cascaded transform chain
   * @return {Array<number>}
   */
  m(): Array<number> {
    return this.mat;
  }

  /**
   * Return the matrix that respresents the cascaded transform chain
   * @return {Array<number>}
   */
  matrix(): Array<number> {
    return this.mat;
  }

  /**
   * `true` if `transformToCompare` has the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements in the transform
   * chain.
   * @return {boolean}
   */
  isSimilarTo(transformToCompare: Transform): boolean {
    if (transformToCompare.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== transformToCompare.def[i][0]) {
        return false;
      }
    }
    return true;
  }

  /**
   * `true` if `transformToCompare` is equal to this transform within some
   * `precision`.
   * @return {boolean}
   */
  isEqualTo(transformToCompare: Transform, precision: number = 8): boolean {
    // if (transformToCompare.order.length !== this.order.length) {
    //   return false;
    // }
    if (!this.isSimilarTo(transformToCompare)) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const compare = transformToCompare.def[i];
      const thisTrans = this.def[i];
      const [thisType] = thisTrans;
      const [compareType] = compare;
      if (thisType !== compareType) {
        return false;
      }
      if (thisType === 't' || thisType === 's' || thisType === 'r') {
        const [, x, y, z] = thisTrans;
        const [, x1, y1, z1] = compare;
        if (roundNum(x, precision) !== roundNum(x1, precision)) {
          return false;
        }
        if (roundNum(y, precision) !== roundNum(y1, precision)) {
          return false;
        }
        if (roundNum(z, precision) !== roundNum(z1, precision)) {
          return false;
        }
      } else if (thisType === 'c') {
        for (let j = 1; j < thisTrans.length - 1; j += 1) {
          if (roundNum(thisTrans[j], precision) !== roundNum(compare[j], precision)) {
            return false;
          }
        }
      }
      // if ((thisTrans instanceof Translation && compare instanceof Translation
      // ) || (
      //   thisTrans instanceof Scale && compare instanceof Scale
      // )) {
      //   if (compare.isNotEqualTo(thisTrans, precision)) {
      //     return false;
      //   }
      // }
      // if (thisTrans instanceof Rotation) {  // $FlowFixMe
      //   if (roundNum(compare.r, precision) !== roundNum(thisTrans.r, precision)) {
      //     return false;
      //   }
      // }
    }
    return true;
  }

  /**
   * `true` if `transformToCompare` is wihtin some `delta` of this transform.
   * `isEqualTo` rounds the values to some precision to compare values. In
   * comparison this will directly compare the delta between values. This may
   * be more useful than rounding when values are close to rounding thresholds.
   * @return {boolean}
   */
  isWithinDelta(transformToCompare: Transform, delta: number = 0.00000001) {
    if (!this.isSimilarTo(transformToCompare)) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const compare = transformToCompare.def[i];
      const thisTrans = this.def[i];
      const [thisType] = thisTrans;
      const [compareType] = compare;
      if (thisType !== compareType) {
        return false;
      }
      if (thisType === 't' || thisType === 's' || thisType === 'r') {
        const [, x, y, z] = thisTrans;
        const [, x1, y1, z1] = compare;
        if (Math.abs(x - x1) > delta) {
          return false;
        }
        if (Math.abs(y - y1) > delta) {
          return false;
        }
        if (Math.abs(z - z1) > delta) {
          return false;
        }
      } else if (thisType === 'c') {
        for (let j = 1; j < thisTrans.length - 1; j += 1) {
          if (Math.abs(thisTrans[j] - compare[j])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Subtract a transform from the current one.
  // If the two transforms have different order types, then just return
  // the current transform.
  /**
   * Subtract each chain element in `transformToSubtract` from each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isSimilarTo</a>
   */
  sub(transformToSubtract: Transform = new Transform()): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== transformToSubtract.def[i][0]) {
        throw new Error(`Cannot subtract transforms with different shapes: '${this.def}' - '${transformToSubtract.def}'`);
      }
      def.push(makeTransformComponent(
        this.def[i],
        j => this.def[i][j] - transformToSubtract.def[i][j],
      ));
      // const newDef = Array(this.def[i].length);
      // // eslint-disable-next-line prefer-destructuring
      // newDef[0] = this.def[i][0];
      // newDef[newDef.length - 1] = this.name;
      // for (let j = 1; j < this.def[i].length - 1; j += 1) {
      //   newDef[j] = this.def[i][j] - transformToSubtract.def[i][j];
      // }
      // def.push(newDef);
    }
    return this.createFromDef(def, this.name);
  }

  // Add a transform to the current one.
  // If the two transforms have different order types, then just return
  // the current transform.
  /**
   * Add each chain element in `transformToSubtract` to each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isSimilarTo</a>
   */
  add(transformToAdd: Transform = new Transform()): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== transformToAdd.def[i][0]) {
        throw new Error(`Cannot add transforms with different shapes: '${this.def}' - '${transformToAdd.def}'`);
      }
      def.push(makeTransformComponent(
        this.def[i],
        j => this.def[i][j] + transformToAdd.def[i][j],
      ));
      // const newDef = Array(this.def[i].length);
      // // eslint-disable-next-line prefer-destructuring
      // newDef[0] = this.def[i][0];
      // newDef[newDef.length - 1] = this.name;
      // for (let j = 1; j < this.def[i].length - 1; j += 1) {
      //   newDef[j] = this.def[i][j] + transformToAdd.def[i][j];
      // }
      // def.push(newDef);
    }
    return this.createFromDef(def, this.name);
  }

  // transform step wise multiplication
  /**
   * Multiply each chain element in `transformToSubtract` with each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isSimilarTo</a>
   */
  mul(transformToMultiply: Transform = new Transform()): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== transformToMultiply.def[i][0]) {
        throw new Error(`Cannot multiply transforms with different shapes: '${this.def}' - '${transformToMultiply.def}'`);
      }
      def.push(makeTransformComponent(
        this.def[i],
        j => this.def[i][j] * transformToMultiply.def[i][j],
      ));
      // const newDef = Array(this.def[i].length);
      // // eslint-disable-next-line prefer-destructuring
      // newDef[0] = this.def[i][0];
      // newDef[newDef.length - 1] = this.name;
      // for (let j = 1; j < this.def[i].length - 1; j += 1) {
      //   newDef[j] = this.def[i][j] * transformToMultiply.def[i][j];
      // }
      // def.push(newDef);
    }
    return this.createFromDef(def, this.name);
  }

  /**
   * Return a transform chain whose order is `initialTransform` and then this
   * transform chain
   * @return {Transform}
   * @example
   * // rotate and then translate
   * const rotation = new Transform().rotate(Math.PI / 2);
   * const translation = new Transform().translate(0.5, 0);
   * const t = translation.transform(rotation)
   */
  transform(initialTransform: Transform) {
    const t = new Transform([], this.name);
    t.order = initialTransform.order.concat(this.order);
    t.def = initialTransform.def.concat(this.def.map(d => d.slice()));
    // t.order = Array(initialTransform.order.length + this.order.length);
    // for (let i = 0; i < initialTransform.order.length; i += 1) {
    //   t.order[i] = initialTransform.order[i];
    // }
    // for (let i = 0; i < this.order.length; i += 1) {
    //   t.order[i + initialTransform.order.length] = this.order[i];
    // }
    t.mat = m2.mul(this.matrix(), initialTransform.matrix());
    return t;
  }

  /**
   * Return a transform chain whose order is this transform chain, then the
   * `t` chain.
   * @return {Transform}
   * @example
   * // rotate and then translate
   * const rotation = new Transform().rotate(Math.PI / 2);
   * const translation = new Transform().translate(0.5, 0);
   * const t = rotation.transformBy(translation)
   */
  transformBy(t: Transform): Transform {
    const t1 = new Transform([], this.name);
    t1.order = this.order.concat(t.order);
    t.def = this.def.concat(t.def);
    t1.mat = m2.mul(t.matrix(), this.matrix());
    return t1;
  }

  /**
   * Return a duplicate transform with all values rounded
   */
  round(precision: number = 8): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      def.push(makeTransformComponent(
        this.def[i],
        j => round(this.def[i][j], precision),
      ));
      // const newDef = Array(this.def[i].length);
      // // eslint-disable-next-line prefer-destructuring
      // newDef[0] = this.def[i][0];
      // newDef[newDef.length - 1] = this.name;
      // for (let j = 1; j < this.def[i].length - 1; j += 1) {
      //   newDef[j] = roundNum(this.def[i][j], precision);
      // }
      // def.push(newDef);
      // order.push(this.def[i].round(precision));
    }
    return this.createFromDef(def, this.name);
    // return new Transform(order, this.name);
  }

  /**
   * Return a duplicate transform that is clipped to `minTransform` and
   * `maxTransform`. Both `minTransform` and `maxTransform` must be similar
   * to this transform meaning they must all share the same order of
   * {@link Rotation}, {@link Scale} and {@link Translation} transform elements.
   *
   * Use `limitLine` to clip the first {@link Translation} transform in the
   * chain to within a {@link Line}.
   * @see <a href="#transformissimilarto">Transform.isSimilarTo</a>
   */
  clip(
    minTransform: Transform,
    maxTransform: Transform,
    limitLine: null | Line,
  ) {
    if (!this.isSimilarTo(minTransform) || !this.isSimilarTo(maxTransform)) {
      return this._dup();
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const t = this.def[i];
      if (t[0] !== minTransform.def[i][0] || t[0] !== maxTransform.def[i][0]) {
        throw new Error(`Cannot clip transforms of different shapes: transform: '${this.def}', min: '${minTransform.def}', max: '${maxTransform}'`);
      }
      def.push(makeTransformComponent(
        this.def[i],
        j => clipValue(this.def[i][j], minTransform.def[i][j], maxTransform.def[i][j]),
      ));
    }
    const clippedTransform = this.createFromDef(def, this.name);
    if (limitLine != null) {
      const t = clippedTransform.t();
      if (t != null) {
        const perpLine = new Line(t, 1, limitLine.angle() + Math.PI / 2);
        const { intersect } = perpLine.intersectsWith(limitLine);
        if (intersect) {
          if (intersect.isWithinLine(limitLine, 4)) {
            clippedTransform.updateTranslation(intersect);
          } else {
            const p1Dist = distance(intersect, limitLine.p1);
            const p2Dist = distance(intersect, limitLine.p2);
            if (p1Dist < p2Dist) {
              clippedTransform.updateTranslation(limitLine.p1);
            } else {
              clippedTransform.updateTranslation(limitLine.p2);
            }
          }
        }
      }
    }
    return clippedTransform;
  }

  clipMag(
    zeroThresholdTransform: TypeTransformValue,
    maxTransform: TypeTransformValue,
    vector: boolean = true,
  ): Transform {
    // const order = [];
    const zero = transformValueToArray(zeroThresholdTransform, this);
    const max = transformValueToArray(maxTransform, this);
    const def = [];

    for (let i = 0; i < this.def.length; i += 1) {
      const t = this.def[i];
      const [type, x, y, z] = t;
      if (type === 't' && vector) {
        // if (vector) {
        const { r, phi, theta } = rectToPolar(x, y, z);
        const rc = clipMag(r, zero[i], max[i]);
        const xc = rc * Math.cos(phi) * Math.sin(theta);
        const yc = rc * Math.sin(phi) * Math.sin(theta);
        const zc = rc * Math.cos(theta);
        def.push(['t', xc, yc, zc, this.name]);
      } else if (type === 'r' || type === 's' || type === 't') {
        const xc = clipMag(x, zero[i], max[i]);
        const yc = clipMag(y, zero[i], max[i]);
        const zc = clipMag(z, zero[i], max[i]);
        def.push([t[0], xc, yc, zc, this.name]);
      }
    }
    return this.createFromDef(def, this.name);
  }

  constant(constant: number = 0): Transform {
    // const def = [];
    // for (let i = 0; i < this.def.length; i += 1) {
    //   def.push(makeTransformComponent(
    //     this.def[i],
    //     () => constant,
    //   ));
    // }
    // const t = this.createFromDef(def, this.name);
    // return t;

    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        order.push(new Translation(constant, constant, this.name));
      } else if (t instanceof Rotation) {
        order.push(new Rotation(constant, this.name));
      } else if (t instanceof Scale) {
        order.push(new Scale(constant, constant, this.name));
      }
    }
    return new Transform(order, this.name);
  }

  zero(): Transform {
    return this.constant(0);
  }

  /**
   * `true` if all transforms within the transform chain are below the
   * `zeroThreshold`
   */
  isZero(zeroThreshold: number = 0): boolean {
    // for (let i = 0; i < this.def.length; i += 1) {
    //   const [type, x, y, z] = this.def[i];
    //   if (type === 't' || type === 's') {
    //     if (
    //       Math.abs(x) > zeroThreshold
    //       || Math.abs(y) > zeroThreshold
    //       || Math.abs(z) > zeroThreshold) {
    //       return false;
    //     }
    //   } else if (type === 'r') {
    //     if (
    //       clipAngle(x, '0to360') > zeroThreshold
    //       || clipAngle(y, '0to360') > zeroThreshold
    //       || clipAngle(z, '0to360') > zeroThreshold
    //     ) {
    //       return false;
    //     }
    //   }
    // }
    // return true;

    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation || t instanceof Scale) {
        if (Math.abs(t.x) > zeroThreshold || Math.abs(t.y) > zeroThreshold) {
          return false;
        }
      } else if (t instanceof Rotation) {
        if (clipAngle(t.r, '0to360') > zeroThreshold) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Return a duplicate transform.
   */
  _dup(): Transform {
    const t = new Transform();
    t.name = this.name;
    t.order = this.order.map(o => o._dup());
    t.mat = this.mat.slice();
    t.index = this.index;
    t.def = this.def.map(d => d.slice());
    // // this.order = order.slice();
    // this.index = this.order.length;
    // this._type = 'transform';
    // this.calcAndSetMatrix();
    // const t = new Transform(this.order, this.name);
    // t.index = this.index;
    return t;
  }

  decelerate(
    velocity: Transform,
    decelerationIn: TypeTransformValue,
    deltaTime: number | null,
    boundsIn: TypeTransformBounds | TypeTransformBoundsDefinition | 'none',
    bounceLossIn: TypeTransformValue,
    zeroVelocityThresholdIn: TypeTransformValue,
    precision: number = 8,
  ): { velocity: Transform, transform: Transform, duration: null | number } {
    const deceleration = transformValueToArray(decelerationIn, this);
    const bounceLoss = transformValueToArray(bounceLossIn, this);
    const zeroVelocityThreshold = transformValueToArray(zeroVelocityThresholdIn, this);
    let bounds;
    if (boundsIn instanceof TransformBounds) {
      bounds = boundsIn;
    } else if (boundsIn === 'none') {
      bounds = new TransformBounds(this);
    } else {
      bounds = new TransformBounds(this, boundsIn);
    }
    // const bounds = getTransformBoundsLimit(boundsIn, this);
    const result = decelerateTransform(
      this, velocity, deceleration, deltaTime, bounds, bounceLoss, zeroVelocityThreshold, precision,
    );
    return {
      velocity: result.velocity,
      transform: result.transform,
      duration: result.duration,
    };
  }

  timeToZeroV(
    velocity: Transform,
    deceleration: TypeTransformValue,
    bounds: TypeTransformBounds | TypeTransformBoundsDefinition,
    bounceLoss: TypeTransformValue,
    zeroVelocityThreshold: TypeTransformValue,
    precision: number = 8,
  ): { velocity: Transform, transform: Transform, duration: null | number } {
    return this.decelerate(
      velocity, deceleration, null, bounds, bounceLoss, zeroVelocityThreshold,
      precision,
    );
  }

  // Return the velocity of each element in the transform
  // If the current and previous transforms are inconsistent in type order,
  // then a transform of value 0, but with the same type order as "this" will
  // be returned.
  velocity(
    previousTransform: Transform,
    deltaTime: number,
    zeroThreshold: TypeTransformValue,
    maxTransform: TypeTransformValue,
  ): Transform {
    const order = [];
    if (!this.isSimilarTo(previousTransform)) {
      return this.zero();
    }

    const deltaTransform = this.sub(previousTransform);
    for (let i = 0; i < deltaTransform.order.length; i += 1) {
      const t = deltaTransform.order[i];
      if (t instanceof Translation) {
        order.push(new Translation(t.x / deltaTime, t.y / deltaTime));
      } else if (t instanceof Rotation) {
        order.push(new Rotation(t.r / deltaTime));
      } else if (t instanceof Scale) {
        order.push(new Scale(t.x / deltaTime, t.y / deltaTime));
      }
    }
    const v = new Transform(order);

    return v.clipMag(zeroThreshold, maxTransform);
  }

  /**
   * Return a duplicate transform chain where all transforms are
   * identity transforms.
   */
  identity() {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const [type] = this.def[i];
      if (type === 't' || type === 'r') {
        def.push([type, 0, 0, 0, this.name]);
      } else if (type === 's') {
        def.push([type, 1, 1, 1, this.name]);
      } else if (type === 'c' && this.def[i].length === 18) {
        def.push([
          'c',
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
          this.name,
        ]);
      } else if (type === 'c' && this.def[i].length === 11) {
        def.push([
          'c',
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          this.name,
        ]);
      }
    }
    return this.createFromDef(def, this.name);
  }
}

export type TypeF1DefTransform = {
  f1Type: 'tf',
  state: Array<string | TypeF1DefTranslation | TypeF1DefRotation | TypeF1DefScale>,
};

/**
 * A {@link Transform} can be defined in several ways
 * As a Transform: new Transform()
 * As an array of ['s', number, number], ['r', number] and/or ['t', number, number] arrays
 * As a string representing the JSON of the array form
 }
 * @example
 * // t1, t2, and t3 are all the same when parsed by `getTransform`
 * t1 = new Transform().scale(1, 1).rotate(0).translate(2, 2);
 * t2 = [['s', 1, 1], ['r', 0], ['t', 2, 2]];
 * t3 = '[['s', 1, 1], ['r', 0], ['t', 2, 2]]';
 */
export type TypeParsableTransform = Array<string | ['s', number, number] | ['r', number] | ['t', number, number]> | string | Transform | TypeF1DefTransform;

function isParsableTransform(value: any) {
  if (value instanceof Transform) {
    return true;
  }
  if (
    Array.isArray(value)
    && Array.isArray(value[0])
    && (
      value[0][0] === 'r' || value[0][0] === 's' || value[0][0] === 't'
    )
  ) {
    return true;
  }
  if (value.f1Type != null && value.f1Type === 'tf') {
    return true;
  }
  if (typeof value === 'string') {
    let newValue;
    try {
      newValue = JSON.parse(value);
    } catch {
      return false;
    }
    return isParsableTransform(newValue);
  }
  return false;
}

function parseTransform<T>(inTransform: TypeParsableTransform, onFail: T): Transform | T | null {
  if (inTransform instanceof Transform) {
    return inTransform;
  }
  let onFailToUse = onFail;
  if (onFailToUse == null) {
    onFailToUse = null;
  }
  if (inTransform == null) {
    return onFailToUse;
  }

  let tToUse = inTransform;
  if (typeof tToUse === 'string') {
    try {
      tToUse = JSON.parse(tToUse);
    } catch {
      return onFailToUse;
    }
  }

  if (Array.isArray(tToUse)) {
    let t = new Transform();
    tToUse.forEach((transformElement) => {
      if (typeof transformElement === 'string') {
        t.name = transformElement;
        return;
      }
      if (transformElement.length === 3) {
        const [type, x, y] = transformElement;
        if (type === 's') {
          t = t.scale(x, y);
        } else {
          t = t.translate(x, y);
        }
        return;
      }
      const [type, value] = transformElement;
      if (type === 's') {
        t = t.scale(value, value);
      } else if (type === 't') {
        t = t.translate(value, value);
      } else {
        t = t.rotate(value);
      }
    });
    return t;
  }
  const { f1Type, state } = tToUse;
  if (
    f1Type != null
    && f1Type === 'tf'
    && state != null
    && Array.isArray(state)
  ) {
    let t = new Transform();
    tToUse.state.forEach((transformElement) => {
      if (typeof transformElement === 'string') {
        t.name = transformElement;
        return;
      }
      const teF1Type = transformElement.f1Type;
      if (teF1Type != null) {
        if (teF1Type === 's') {  // $FlowFixMe
          t = t.scale(transformElement);
        } else if (teF1Type === 't') {  // $FlowFixMe
          t = t.translate(transformElement);
        } else if (teF1Type === 'r') {  // $FlowFixMe
          t = t.rotate(transformElement);
        }
      }
    });
    return t;
  }
  return onFailToUse;
}

/**
 * Convert a parsable transform definition to a {@link Transform}.
 * @param {TypeParsableTransform} t parsable transform definition
 * @return {Transform} transform object
 */
function getTransform(t: TypeParsableTransform): Transform {
  let parsedTransform = parseTransform(t);
  if (parsedTransform == null) {
    parsedTransform = new Transform();
  }
  return parsedTransform;
}


function spaceToSpaceTransform(
  s1: {
    x: {bottomLeft: number, width: number},
    y: {bottomLeft: number, height: number}
  },
  s2: {
    x: {bottomLeft: number, width: number},
    y: {bottomLeft: number, height: number}
  },
  name: string = '',
) {
  const xScale = s2.x.width / s1.x.width;
  const yScale = s2.y.height / s1.y.height;
  const t = new Transform(name)
    .scale(xScale, yScale)
    .translate(
      s2.x.bottomLeft - s1.x.bottomLeft * xScale,
      s2.y.bottomLeft - s1.y.bottomLeft * yScale,
    );
  return t;
}

function spaceToSpaceScale(
  s1: {
    x: {bottomLeft: number, width: number},
    y: {bottomLeft: number, height: number}
  },
  s2: {
    x: {bottomLeft: number, width: number},
    y: {bottomLeft: number, height: number}
  },
) {
  const xScale = s2.x.width / s1.x.width;
  const yScale = s2.y.height / s1.y.height;
  return new Point(xScale, yScale);
}

function comparePoints(
  p: Point,
  currentMin: Point,
  currentMax: Point,
  firstPoint: boolean,
) {
  const min = new Point(0, 0);
  const max = new Point(0, 0);
  if (firstPoint) {
    min.x = p.x;
    min.y = p.y;
    max.x = p.x;
    max.y = p.y;
  } else {
    min.x = p.x < currentMin.x ? p.x : currentMin.x;
    min.y = p.y < currentMin.y ? p.y : currentMin.y;
    max.x = p.x > currentMax.x ? p.x : currentMax.x;
    max.y = p.y > currentMax.y ? p.y : currentMax.y;
  }
  return { min, max };
}

/**
 * Polar coordinates to cartesian coordinates conversion
 *
 * @example
 * const polarToRect = Fig.polarToRect;
 * const p = polarToRect(Math.sqrt(2), Math.PI / 4);
 * console.log(p);
 * // Point {x: 1, y: 1)
 */
function polarToRect(mag: number, angle: number) {
  return new Point(
    mag * Math.cos(angle),
    mag * Math.sin(angle),
  );
}

/**
 * Cartesian coordinates to polar coordinates conversion
 *
 * @example
* const rectToPolar = Fig.rectToPolar;
* const p = rectToPolar(0, 1);
* console.log(p);
* // {mag: 1, angle: 1.5707963267948966}
 */
function rectToPolar(x: number | Point, y: number = 0, z: number = 0) {
  let rect;
  if (typeof x === 'number') {
    rect = new Point(x, y, z);
  } else {
    rect = x;
  }
  const mag = rect.distance();
  let angle = Math.atan2(rect.y, rect.x);
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  const theta = Math.acos(z / mag);
  return {
    mag,
    angle,
    phi: angle,
    theta,
    r: mag,
  };
}


/**
 * Buffer for rectangle, where `left`, `bottom`, `right` and `top` are
 * the buffer values for a rectangle's left, bottom, right and top sides
 * respectively.
 */
export type OBJ_Buffer = {
  left: number,
  bottom: number,
  right: number,
  top: number,
};

/**
 * Buffer for rectangle can be:
 *
 * - `number`: left, bottom, right, top buffer all the same
 * - [`number`, `number`]: left/right and bottom/top buffer values
 * - [`number`, `number`, `number`, `number`]: left, bottom, right,
 *   top buffer values
 * - `{ left? number, bottom?: number, right?: number, top?: number}`:
 *   object definition where default values are `0`.
 *
 * Can use {@link getBuffer} to convert the parsable buffer into
 */
export type TypeParsableBuffer = number
  | [number, number]
  | [number, number, number, number]
  | {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
  };

/**
 * Convert a parsable buffer into a buffer.
 * @return {OBJ_Buffer}
 */
function getBuffer(buffer: TypeParsableBuffer): OBJ_Buffer {
  let left;
  let right;
  let top;
  let bottom;
  if (typeof buffer === 'number') {
    left = buffer;
    right = buffer;
    top = buffer;
    bottom = buffer;
  } else if (Array.isArray(buffer)) {
    if (buffer.length === 2) {
      [left, top] = buffer;
      right = left;
      bottom = top;
    } else {
      [left, bottom, right, top] = buffer;
    }
  } else {
    const o = joinObjects({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }, buffer);
    ({
      left, right, top, bottom,
    } = o);
  }
  return {
    left, right, top, bottom,
  };
}

function isBuffer(input: any) {
  if (typeof input === 'number') {
    return true;
  }
  if (Array.isArray(input)) {
    if (
      (input.length === 4 || input.length === 2)
      && typeof input[0] === 'number'
    ) {
      return true;
    }
  } else {
    return false;
  }
  if (typeof input === 'object') {
    const keys = Object.keys(input);
    if (keys.length > 4) {
      return false;
    }
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (
        key !== 'left'
        && key !== 'right'
        && key !== 'top'
        && key !== 'bottom'
      ) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function getBoundingRect(
  pointArrays: Array<Point> | Array<Array<Point>>,
  buffer: TypeParsableBuffer = 0,
) {
  let firstPoint = true;
  let result = { min: new Point(0, 0), max: new Point(0, 0) };

  pointArrays.forEach((pointOrArray) => {
    if (Array.isArray(pointOrArray)) {
      pointOrArray.forEach((p) => {
        result = comparePoints(p, result.min, result.max, firstPoint);
        firstPoint = false;
      });
    } else {
      result = comparePoints(pointOrArray, result.min, result.max, firstPoint);
    }

    firstPoint = false;
  });
  const {
    left, right, top, bottom,
  } = getBuffer(buffer);

  return new Rect(
    result.min.x - left,
    result.min.y - bottom,
    result.max.x - result.min.x + right + left,
    result.max.y - result.min.y + top + bottom,
  );
}

function getBoundingBorder(
  pointArrays: Array<Point> | Array<Array<Point>>,
  buffer: TypeParsableBuffer = 0,
) {
  const r = getBoundingRect(pointArrays, buffer);
  return [
    new Point(r.left, r.bottom),
    new Point(r.right, r.bottom),
    new Point(r.right, r.top),
    new Point(r.left, r.top),
  ];
}

// // Finds the min angle between three points
// function threePointAngleMin(p2: Point, p1: Point, p3: Point) {
//   const p12 = distance(p1, p2);
//   const p13 = distance(p1, p3);
//   const p23 = distance(p2, p3);
//   return Math.acos((p12 ** 2 + p13 ** 2 - p23 ** 2) / (2 * p12 * p13));
// }

// Finds the angle between three points for p12 to p13 in the positive
// angle direction

/**
 * Returns the angle from the line (p1, p2) to the line (p1, p3) in the positive
 * rotation direction and normalized from 0 to Math.PI * 2.
 *
 * @example
 * const threePointAngle = Fig.threePointAngle;
 * const getPoint = Fig.getPoint;
 *
 * const p1 = threePointAngle(getPoint([1, 0]), getPoint([0, 0]), getPoint([0, 1]));
 * console.log(p1);
 * // 1.5707963267948966
 *
 * const p2 = threePointAngle(getPoint([0, 1]), getPoint([0, 0]), getPoint([1, 0]));
 * console.log(p2);
 * // 4.71238898038469
 */
function threePointAngle(p2: Point, p1: Point, p3: Point) {
  const r12 = p2.sub(p1);
  const r13 = p3.sub(p1);
  // const p12 = distance(p1, p2);
  // const p13 = distance(p1, p3);
  // const p23 = distance(p2, p3);
  // const minAngle = Math.acos((p12 ** 2 + p13 ** 2 - p23 ** 2) / (2 * p12 * p13));
  let angle12 = r12.toPolar().angle;
  let angle13 = r13.toPolar().angle;
  angle13 -= angle12;
  angle12 = 0;
  return clipAngle(angle13, '0to360');
}

/**
 * Returns the minimum angle from the line (p1, p2) to the line (p1, p3).
 *
 * @example
 * const threePointAngleMin = Fig.threePointAngleMin;
 * const getPoint = Fig.getPoint;
 *
 * const p1 = threePointAngleMin(getPoint([1, 0]), getPoint([0, 0]), getPoint([0, 1]));
 * console.log(p1);
// 1.5707963267948966
 *
 * const p2 = threePointAngleMin(getPoint([0, 1]), getPoint([0, 0]), getPoint([1, 0]));
 * console.log(p2);
 * // -1.5707963267948966
 */
function threePointAngleMin(p2: Point, p1: Point, p3: Point) {
  const a12 = clipAngle(Math.atan2(p2.y - p1.y, p2.x - p1.x), '0to360');
  const a13 = clipAngle(Math.atan2(p3.y - p1.y, p3.x - p1.x), '0to360');
  let delta = a13 - a12;
  if (delta > Math.PI) {
    delta = -(Math.PI * 2 - delta);
  } else if (delta < -Math.PI) {
    delta = Math.PI * 2 + delta;
  }
  return delta;
}

function randomPoint(withinRect: Rect) {
  const randPoint = rand2D(
    withinRect.left,
    withinRect.bottom,
    withinRect.right,
    withinRect.top,
  );
  return new Point(randPoint.x, randPoint.y);
}

function getMaxTimeFromVelocity(
  startTransform: Transform,
  stopTransform: Transform,
  velocityTransform: Transform | number,
  rotDirection: 0 | 1 | -1 | 2 = 0,
) {
  const deltaTransform = stopTransform.sub(startTransform);
  let time = 0;
  let velocityTransformToUse;
  if (typeof velocityTransform === 'number') {
    velocityTransformToUse = startTransform._dup().constant(velocityTransform);
  } else {
    velocityTransformToUse = velocityTransform;
  }
  deltaTransform.order.forEach((delta, index) => {
    if (delta instanceof Translation || delta instanceof Scale) {
      const v = velocityTransformToUse.order[index];
      if (
        (v instanceof Translation || v instanceof Scale)
        && v.x !== 0
        && v.y !== 0
      ) {
        const xTime = Math.abs(delta.x / v.x);
        const yTime = Math.abs(delta.y / v.y);
        time = xTime > time ? xTime : time;
        time = yTime > time ? yTime : time;
      }
    }
    const start = startTransform.order[index];
    const target = stopTransform.order[index];
    if (delta instanceof Rotation
        && start instanceof Rotation
        && target instanceof Rotation) {
      const rotDiff = getDeltaAngle(start.r, target.r, rotDirection);
      // eslint-disable-next-line no-param-reassign
      delta.r = rotDiff;
      const v = velocityTransformToUse.order[index];
      if (v instanceof Rotation && v !== 0) {
        const rTime = Math.abs(delta.r / v.r);
        time = rTime > time ? rTime : time;
      }
    }
  });
  return time;
}

function getMoveTime(
  startTransform: Transform | Array<Transform>,
  stopTransform: Transform | Array<Transform>,
  rotDirection: 0 | 1 | -1 | 2 = 0,
  translationVelocity: Point = new Point(0.25, 0.25),   // 0.5 figure units/s
  rotationVelocity: number = 2 * Math.PI / 6,    // 60º/s
  scaleVelocity: Point = new Point(1, 1),   // 100%/s
) {
  let startTransforms: Array<Transform>;
  if (startTransform instanceof Transform) {
    startTransforms = [startTransform];
  } else {
    startTransforms = startTransform;
  }
  let stopTransforms: Array<Transform>;
  if (stopTransform instanceof Transform) {
    stopTransforms = [stopTransform];
  } else {
    stopTransforms = stopTransform;
  }
  if (stopTransforms.length !== startTransforms.length) {
    return 0;
  }
  let maxDuration = 0;
  startTransforms.forEach((startT, index) => {
    const stopT = stopTransforms[index];
    const velocity = startT._dup();
    for (let i = 0; i < velocity.order.length; i += 1) {
      const v = velocity.order[i];
      if (v instanceof Translation) {
        v.x = translationVelocity.x;
        v.y = translationVelocity.y;
      } else if (v instanceof Rotation) {
        v.r = rotationVelocity;
      } else {
        v.x = scaleVelocity.x;
        v.y = scaleVelocity.y;
      }
    }
    const time = getMaxTimeFromVelocity(
      startT, stopT, velocity, rotDirection,
    );
    if (time > maxDuration) {
      maxDuration = time;
    }
  });
  return maxDuration;
}


function quadBezierPoints(p0: Point, p1: Point, p2: Point, sides: number) {
  const step = 1 / sides;
  if (sides === 0 || sides === 1 || sides === 2) {
    return [p0, p1, p2];
  }
  const points = [];
  for (let i = 0; i < sides + 1; i += 1) {
    const t = 0 + i * step;
    points.push(new Point(
      (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
      (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
    ));
  }
  return points;
}

class Bounds {
  boundary: Object;
  precision: number;
  bounds: 'inside' | 'outside';

  constructor(
    boundary: Object,
    bounds: 'inside' | 'outside' = 'inside',
    precision: number = 8,
  ) {
    this.boundary = boundary;
    this.bounds = bounds;
    this.precision = precision;
  }

  // eslint-disable-next-line class-methods-use-this
  _dup() {
    return new Bounds();
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _state(options: { precision: number }) {
    return {
      f1Type: 'bounds',
      state: [
      ],
    };
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  contains(position: number | TypeParsablePoint) {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  intersect(position: number | TypeParsablePoint, direction: number = 0) {
    if (typeof position === 'number') {
      return {
        intersect: position,
        distance: 0,
        reflection: direction + Math.PI,
      };
    }
    return {
      intersect: getPoint(position),
      distance: 0,
      reflection: direction + Math.PI,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return position;
    }
    return getPoint(position);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  // clipVelocity(velocity: TypeParsablePoint | number) {
  //   if (typeof velocity === 'number') {
  //     return velocity;
  //   }
  //   return getPoint(velocity);
  // }
}

// class ValueBounds extends Bounds {
//   boundary: ?number;
// }
export type TypeRangeBoundsDefinition = {
  min?: number | null,
  max?: number | null,
  precision?: number,
  bounds?: 'inside' | 'outside',
};

type TypeF1DefRangeBounds = {
  f1Type: 'rangeBounds',
  state: ['outside' | 'inside', number, number | null, number | null],
};

class RangeBounds extends Bounds {
  boundary: { min: number | null, max: number | null };

  constructor(optionsIn: TypeRangeBoundsDefinition) {
    const defaultOptions = {
      bounds: 'inside',
      precision: 8,
      min: null,
      max: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const boundary = {
      min: options.min,
      max: options.max,
    };
    super(boundary, options.bounds, options.precision);
  }

  isDefined() {
    if (this.boundary.min == null && this.boundary.max == null) {
      return false;
    }
    return true;
  }

  _dup() {
    return new RangeBounds({
      bounds: this.bounds,
      precision: this.precision,
      min: this.boundary.min,
      max: this.boundary.max,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'rangeBounds',
      state: [
        this.bounds,
        this.precision,
        this.boundary.min != null ? roundNum(this.boundary.min, precision) : null,
        this.boundary.max != null ? roundNum(this.boundary.max, precision) : null,
      ],
    };
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      const p = roundNum(position, this.precision);
      if (
        (
          this.boundary.min == null
          || p >= roundNum(this.boundary.min, this.precision)
        )
        && (
          this.boundary.max == null
          || p <= roundNum(this.boundary.max, this.precision)
        )
      ) {
        return true;
      }
      return false;
    }
    const p = getPoint(position);
    if (this.contains(p.x) && this.contains(p.y)) {
      return true;
    }
    return false;
    // const p = getPoint(position);
    // if (
    //   (this.boundary.min == null
    //     || (p.x >= this.boundary.min && p.y >= this.boundary.min))
    //   && (this.boundary.max == null
    //     || (p.x <= this.boundary.max && p.y <= this.boundary.max))
    // ) {
    //   return true;
    // }
    // return false;
  }

  intersect(
    position: number | TypeParsablePoint,
    direction: number = 1,
  ) {
    const reflection = direction * -1;
    const { min, max } = this.boundary;
    if (!(typeof position === 'number')) {
      return {
        intersect: null,
        distance: 0,
        reflection: direction,
      };
    }

    if (this.contains(position)) {
      if (
        max != null
        && round(position, this.precision) === round(max, this.precision)
        && this.bounds === 'outside'
      ) {
        if (direction === -1) {
          return { intersect: max, distance: 0, reflection: 1 };
        }
        return { intersect: null, distance: 0, reflection: 1 };
      }
      if (
        min != null
        && round(position, this.precision) === round(min, this.precision)
        && this.bounds === 'outside'
      ) {
        if (direction === 1) {
          return { intersect: min, distance: 0, reflection: -1 };
        }
        return { intersect: null, distance: 0, reflection: -1 };
      }
      if (direction === 1) {
        if (max == null) {
          return { intersect: null, distance: 0, reflection: direction };
        }
        return {
          intersect: max,
          distance: Math.abs(position - max),
          reflection: -1,
        };
      }
      if (min == null) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      return {
        intersect: min,
        distance: Math.abs(position - min),
        reflection: 1,
      };
    }
    if (
      min != null
      && position < min
      && direction === 1
    ) {
      return {
        intersect: min,
        distance: Math.abs(position - min),
        reflection,
      };
    }
    if (
      max != null
      && position > max
      && direction === -1
    ) {
      return {
        intersect: max,
        distance: Math.abs(position - max),
        reflection,
      };
    }
    return {
      intersect: null,
      distance: 0,
      reflection: direction,
    };
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return clipValue(position, this.boundary.min, this.boundary.max);
    }
    const p = getPoint(position);
    const clipped = p._dup();
    clipped.x = clipValue(p.x, this.boundary.min, this.boundary.max);
    clipped.y = clipValue(p.y, this.boundary.min, this.boundary.max);
    return clipped;
  }
}

export type TypeRectBoundsDefinition = {
  left?: number | null,
  bottom?: number | null,
  right?: number | null,
  top?: number | null,
  bounds?: 'inside' | 'outside',
  precision?: number,
} | Rect;


export type TypeF1DefRectBounds = {
  f1Type: 'rectBounds',
  state: ['outside' | 'inside', number, number | null, number | null, number | null, number | null],
};

class RectBounds extends Bounds {
  boundary: {
    left: null | number,
    right: null | number,
    bottom: null | number,
    top: null | number,
  };

  constructor(optionsOrRect: TypeRectBoundsDefinition) {
    const defaultOptions = {
      left: null,
      right: null,
      top: null,
      bottom: null,
      bounds: 'inside',
      precision: 8,
    };

    const options = joinObjects({}, defaultOptions, optionsOrRect);

    const boundary = {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
    };
    super(boundary, options.bounds, options.precision);
  }

  isDefined() {
    if (
      this.boundary.left == null
      && this.boundary.right == null
      && this.boundary.top == null
      && this.boundary.bottom == null
    ) {
      return false;
    }
    return true;
  }

  _dup() {
    return new RectBounds({
      bounds: this.bounds,
      precision: this.precision,
      left: this.boundary.left,
      right: this.boundary.right,
      top: this.boundary.top,
      bottom: this.boundary.bottom,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'rectBounds',
      state: [
        this.bounds,
        this.precision,
        this.boundary.left != null ? roundNum(this.boundary.left, precision) : null,
        this.boundary.bottom != null ? roundNum(this.boundary.bottom, precision) : null,
        this.boundary.right != null ? roundNum(this.boundary.right, precision) : null,
        this.boundary.top != null ? roundNum(this.boundary.top, precision) : null,
      ],
    };
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return false;
    }
    const p = getPoint(position).round(this.precision);
    if (this.boundary.left != null && p.x < roundNum(this.boundary.left, this.precision)) {
      return false;
    }
    if (this.boundary.right != null && p.x > roundNum(this.boundary.right, this.precision)) {
      return false;
    }
    if (this.boundary.bottom != null && p.y < roundNum(this.boundary.bottom, this.precision)) {
      return false;
    }
    if (this.boundary.top != null && p.y > roundNum(this.boundary.top, this.precision)) {
      return false;
    }
    return true;
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return position;
    }
    const clipped = getPoint(position);
    if (this.boundary.left != null && clipped.x < this.boundary.left) {
      clipped.x = this.boundary.left;
    }
    if (this.boundary.right != null && clipped.x > this.boundary.right) {
      clipped.x = this.boundary.right;
    }
    if (this.boundary.bottom != null && clipped.y < this.boundary.bottom) {
      clipped.y = this.boundary.bottom;
    }
    if (this.boundary.top != null && clipped.y > this.boundary.top) {
      clipped.y = this.boundary.top;
    }
    return clipped;
  }

  intersect(position: number | TypeParsablePoint, direction: number = 0) {
    if (typeof position === 'number') {
      return {
        intersect: null,
        distance: 0,
        reflection: direction,
      };
    }
    const a = roundNum(clipAngle(direction, '0to360'), this.precision);
    const pi = roundNum(Math.PI, this.precision);
    const threePiOnTwo = roundNum(3 * Math.PI / 2, this.precision);
    const piOnTwo = roundNum(Math.PI / 2, this.precision);
    const p = getPoint(position);
    const {
      top, bottom, left, right,
    } = this.boundary;

    // let zeroHeight = false;
    // if (
    //   top != null && bottom != null
    //   && roundNum(top, this.precision) === roundNum(bottom, this.precision)
    // ) {
    //   zeroHeight = true;
    // }
    // let zeroWdith = false;
    // if (
    //   left != null && right != null
    //   && roundNum(left, this.precision) === roundNum(right, this.precision)
    // ) {
    //   zeroWdith = true;
    // }
    const calcHBound = (h) => {
      if (h != null) {
        if (bottom != null && top != null) {
          return new Line([h, bottom], [h, top]);
        }
        if (bottom == null && top != null) {
          return new Line([h, top], null, -Math.PI / 2, 1);
        }
        if (bottom != null && top == null) {
          return new Line([h, bottom], null, Math.PI / 2, 1);
        }
        if (bottom == null && top == null) {
          return new Line([h, 0], null, Math.PI / 2, 0);
        }
      }
      return null;
    };
    const calcVBound = (v) => {
      if (v != null) {
        if (left != null && right != null) {
          return new Line([left, v], [right, v]);
        }
        if (left == null && right != null) {
          return new Line([right, v], null, -Math.PI, 1);
        }
        if (left != null && right == null) {
          return new Line([left, v], null, 0, 1);
        }
        if (left == null && right == null) {
          return new Line([0, v], null, Math.PI, 0);
        }
      }
      return null;
    };

    // Get the lines for each bound
    const boundBottom = calcVBound(bottom);
    const boundTop = calcVBound(top);
    const boundLeft = calcHBound(left);
    const boundRight = calcHBound(right);

    // Get the closest boundary intersect
    const trajectory = new Line(p, null, direction, 1);
    const getIntersect = (boundLine: Line | null, id) => {
      if (boundLine == null) {
        return null;
      }
      if (boundLine.hasPointOn(p, this.precision)) {
        return {
          intersect: p._dup(),
          distance: 0,
          id,
        };
      }
      const result = trajectory.intersectsWith(boundLine, this.precision);
      if (result.withinLine && result.intersect != null) {
        return {
          intersect: result.intersect,
          distance: round(p.distance(result.intersect), this.precision),
          id,
        };
      }
      return null;
    };

    const bottomIntersect = getIntersect(boundBottom, 'bottom');
    const topIntersect = getIntersect(boundTop, 'top');
    const leftIntersect = getIntersect(boundLeft, 'left');
    const rightIntersect = getIntersect(boundRight, 'right');

    const getClosestIntersect = (intersect1, intersect2) => {
      let closestIntersect = null;
      if (intersect1 != null && intersect2 != null) {
        if (intersect1.distance === 0 && this.bounds === 'inside') {
          closestIntersect = intersect2;
        } else if (intersect2.distance === 0 && this.bounds === 'inside') {
          closestIntersect = intersect1;
        } else if (intersect1.distance < intersect2.distance) {
          closestIntersect = intersect1;
        } else {
          closestIntersect = intersect2;
        }
      } else if (intersect1 != null) {
        closestIntersect = intersect1;
      } else if (intersect2 != null) {
        closestIntersect = intersect2;
      }
      return closestIntersect;
    };

    const vIntersect = getClosestIntersect(bottomIntersect, topIntersect);
    const hIntersect = getClosestIntersect(leftIntersect, rightIntersect);

    let intersects = [];
    if (
      vIntersect != null
      && hIntersect != null
      && vIntersect.distance === hIntersect.distance
    ) {
      intersects = [vIntersect, hIntersect];
    } else {
      const result = getClosestIntersect(vIntersect, hIntersect);
      if (result != null) {
        intersects = [result];
      }
    }

    if (intersects.length === 0) {
      return { intersect: null, distance: 0, reflection: direction };
    }

    let i;
    let d = 0;
    let xMirror = 1;
    let yMirror = 1;
    intersects.forEach((intersect) => {
      if (intersect.id === 'left' || intersect.id === 'right') {
        xMirror = -1;
      } else {
        yMirror = -1;
      }
      i = intersect.intersect;
      d = intersect.distance;
    });
    const reflection = polarToRect(1, direction);
    if (xMirror === -1) {
      reflection.x *= -1;
    }
    if (yMirror === -1) {
      reflection.y *= -1;
    }

    if (d === 0) {
      i = p;
    }

    let r = rectToPolar(reflection).angle;
    let noIntersect = false;

    // Test for if the point is on the border, trajectory is along the border
    // and the cross bound is null
    if (d === 0 && this.bounds === 'inside' && intersects.length === 1) {
      if (
        (intersects[0].id === 'bottom' || intersects[0].id === 'top')
        && (this.boundary.left == null || this.boundary.right == null)
        && (a === 0 || a === pi)
      ) {
        noIntersect = true;
      }
      if (
        (intersects[0].id === 'right' || intersects[0].id === 'left')
        && (this.boundary.top == null || this.boundary.bottom == null)
        && (a === piOnTwo || a === threePiOnTwo)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'right'
        && (this.boundary.left == null)
        && (a === pi)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'left'
        && (this.boundary.right == null)
        && (a === 0)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && (this.boundary.bottom == null)
        && (a === threePiOnTwo)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'bottom'
        && (this.boundary.top == null)
        && (a === piOnTwo)
      ) {
        noIntersect = true;
      }
    }

    if (d === 0 && this.bounds === 'inside' && intersects.length === 2) {
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'left'
        && this.boundary.right == null
        && a === 0
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'left'
        && this.boundary.top == null
        && a === piOnTwo
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'left'
        && this.boundary.right == null
        && a === 0
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'left'
        && this.boundary.bottom == null
        && a === threePiOnTwo
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'right'
        && this.boundary.left == null
        && a === pi
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'right'
        && this.boundary.bottom == null
        && a === threePiOnTwo
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'right'
        && this.boundary.left == null
        && a === pi
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'right'
        && this.boundary.top == null
        && a === piOnTwo
      ) {
        noIntersect = true;
      }
    }

    // Test for if the point is on the border, bounds is outside, and the
    // trajectory is away from the border
    if (d === 0 && this.bounds === 'outside' && intersects.length === 2) {
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'left'
        && (a >= piOnTwo || a === 0)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'left'
        && a >= 0 && a <= threePiOnTwo
      ) {
        noIntersect = true;
      }

      if (
        intersects[0].id === 'top'
        && intersects[1].id === 'right'
        && (a <= pi || a >= threePiOnTwo)
      ) {
        noIntersect = true;
      }
      if (
        intersects[0].id === 'bottom'
        && intersects[1].id === 'right'
        && (a <= piOnTwo || a >= pi)
      ) {
        noIntersect = true;
      }
    }
    if (d === 0 && this.bounds === 'outside' && intersects.length === 1) {
      const [intersect] = intersects;
      if (
        intersect.id === 'left'
        && a >= piOnTwo && a <= threePiOnTwo
      ) {
        noIntersect = true;
      }
      if (
        intersect.id === 'right'
        && (a <= piOnTwo || a >= threePiOnTwo)
      ) {
        noIntersect = true;
      }
      if (
        intersect.id === 'bottom'
        && (a >= pi || a === 0)
      ) {
        noIntersect = true;
      }
      if (
        intersect.id === 'top'
        && a <= pi
      ) {
        noIntersect = true;
      }
    }
    if (noIntersect) {
      i = null;
      r = direction;
    }

    return {
      intersect: i,
      distance: d,
      reflection: r,
    };
  }
}

export type TypeLineBoundsDefinition = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  line?: TypeParsableLine,
  mag?: number,
  angle?: number,
  bounds?: 'inside' | 'outside',
  ends?: 2 | 1 | 0,
  precision?: number,
};

export type TypeF1DefLineBounds = {
  f1Type: 'lineBounds',
  state: ['outside' | 'inside', number, number, number, number, number, 2 | 1 | 0],
};

class LineBounds extends Bounds {
  boundary: Line;

  constructor(optionsIn: TypeLineBoundsDefinition) {
    let boundary;
    const defaultOptions = {
      angle: 0,
      mag: 1,
      bounds: 'inside',
      precision: 8,
      ends: 2,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.line != null) {
      boundary = getLine(options.line);
    } else if (options.p1 != null && options.p2 != null) {
      boundary = new Line(options.p1, options.p2, 0, options.ends);
    } else if (options.p1 != null) {
      boundary = new Line(options.p1, options.mag, options.angle, options.ends);
    }
    super(boundary, options.bounds, options.precision);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined() {
    return true;
  }

  _dup() {
    return new LineBounds({
      bounds: this.bounds,
      precision: this.precision,
      p1: this.boundary.p1._dup(),
      p2: this.boundary.p2._dup(),
      mag: this.boundary.distance,
      angle: this.boundary.ang,
      ends: this.boundary.ends,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'lineBounds',
      state: [
        this.bounds,
        this.precision,
        roundNum(this.boundary.p1.x, precision),
        roundNum(this.boundary.p1.y, precision),
        roundNum(this.boundary.p2.x, precision),
        roundNum(this.boundary.p2.y, precision),
        this.boundary.ends,
      ],
    };
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return false;
    }
    const p = getPoint(position);
    return p.isWithinLine(this.boundary, this.precision);
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return position;
    }
    const p = getPoint(position);
    return p.clipToLine(this.boundary, this.precision);
  }

  // The intersect of a Line Boundary can be its finite end points
  //  - p1 only if 1 ended
  //  - p1 or p2 if 2 ended
  intersect(position: number | TypeParsablePoint, direction: number = 0) {
    if (
      typeof position === 'number'
      || this.boundary.ends === 0   // Unbounded line will have no intersect
    ) {
      return {
        intersect: null,
        distance: 0,
        reflection: direction,
      };
    }

    // If the point is not along the line, then it is invalid
    const p = getPoint(position);

    if (!this.boundary.hasPointAlong(p, this.precision)) {
      return {
        intersect: null,
        distance: 0,
        reflection: direction,
      };
    }

    let onLine = false;
    if (this.boundary.hasPointOn(p, this.precision)) {
      onLine = true;
    }

    const b = this.boundary;
    const p1 = this.boundary.p1._dup();
    const p2 = this.boundary.p2._dup();
    const angleDelta = round(Math.abs(clipAngle(direction, '0to360') - clipAngle(b.ang, '0to360')), this.precision);

    const d1 = p.distance(p1);
    const d2 = p.distance(p2);

    // If the point is on p1, unless it is inside and going towards p2 the
    // result can be given immediately
    if (p.isEqualTo(p1, this.precision)) {
      if (this.bounds === 'inside' && angleDelta !== 0) {
        return { intersect: p1, distance: 0, reflection: b.ang };
      }
      if (this.bounds === 'outside' && angleDelta !== 0) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      if (this.bounds === 'outside' && angleDelta === 0) {
        return { intersect: p1, distance: 0, reflection: b.ang + Math.PI };
      }
    }

    // If it is a one ended line, then only p1 is an intersect
    if (b.ends === 1) {
      if (
        (onLine === true && angleDelta === 0)
        || (onLine === false && angleDelta !== 0)
      ) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      return { intersect: p1, distance: d1, reflection: direction + Math.PI };
    }

    // We are now left with a two ended line
    // So if the point is on p2, then unless it is inside and going toward
    // p1, the answer can be given now
    if (p.isEqualTo(p2, this.precision)) {
      if (this.bounds === 'inside' && angleDelta === 0) {
        return { intersect: p2, distance: 0, reflection: b.ang + Math.PI };
      }
      if (this.bounds === 'outside' && angleDelta === 0) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      if (this.bounds === 'outside' && angleDelta !== 0) {
        return { intersect: p2, distance: 0, reflection: b.ang };
      }
      // return { intersect: p2, distance: 0, reflection };
    }

    if (onLine && angleDelta === 0) {
      return { intersect: p2, distance: d2, reflection: direction + Math.PI };
    }

    if (onLine) {
      return { intersect: p1, distance: d1, reflection: direction + Math.PI };
    }

    // We now know the point is off a 2 ended line
    let i;
    let d;
    if (d1 < d2 && angleDelta === 0) {
      i = p1;
      d = d1;
    } else if (d2 < d1 && angleDelta !== 0) {
      i = p2;
      d = d2;
    } else {
      return { intersect: null, distance: 0, reflection: direction };
    }
    return { intersect: i, distance: d, reflection: direction + Math.PI };
  }

  clipVelocity(velocity: number | TypeParsablePoint) {
    if (typeof velocity === 'number') {
      return velocity;
    }
    if (this.boundary == null) {
      return velocity;
    }
    const v = getPoint(velocity); // $FlowFixMe
    const unitVector = new Vector(this.boundary).unit();
    let projection = unitVector.dotProduct(new Vector([0, 0], v));
    let { ang } = this.boundary;
    if (projection < -1) {
      ang += Math.PI;
      projection = -projection;
    }
    return polarToRect(projection, ang);
  }
}

export type TypeBoundsDefinition = Bounds | null | TypeRectBoundsDefinition
  | TypeLineBoundsDefinition | TypeRangeBoundsDefinition
  | { type: 'rect', bounds: TypeRectBoundsDefinition }
  | { type: 'range', bounds: TypeRangeBoundsDefinition }
  | { type: 'line', bounds: TypeLineBoundsDefinition }
  | TypeTransformBoundsDefinition
  | { type: 'transform', bounds: TypeTransformBoundsDefinition }
  | TypeF1DefRangeBounds | TypeF1DefRectBounds | TypeF1DefLineBounds;

function getBounds(
  bounds: TypeBoundsDefinition,
  type: 'rect' | 'range' | 'line' | 'transform' | null = null,
  transform: Transform = new Transform(),
) {
  if (bounds == null) {
    return new Bounds();
  }
  if (bounds instanceof Bounds) {
    return bounds;
  }
  if (bounds.type != null) {  // $FlowFixMe
    return getBounds(bounds.bounds, bounds.type);
  }
  if (type === 'rect') {  // $FlowFixMe
    return new RectBounds(bounds);
  }
  if (type === 'range') {  // $FlowFixMe
    return new RangeBounds(bounds);
  }
  if (type === 'line') {  // $FlowFixMe
    return new LineBounds(bounds);
  }
  if (type === 'transform') {  // $FlowFixMe
    return new TransformBounds(transform, bounds);
  }
  if (bounds.min !== undefined || bounds.max !== undefined) {
    return getBounds(bounds, 'range');
  }
  if (bounds instanceof Rect) {
    return new RectBounds(bounds);
  }
  if (bounds instanceof Line) {
    return new LineBounds({ line: bounds });
  }
  if (
    bounds.left !== undefined
    || bounds.right !== undefined
    || bounds.top !== undefined
    || bounds.bottom !== undefined
  ) {
    return getBounds(bounds, 'rect');
  }
  if (
    bounds.line !== undefined
    || bounds.p1 !== undefined
    || bounds.p2 !== undefined
    || bounds.angle !== undefined
    || bounds.mag !== undefined
    || bounds.ends !== undefined
  ) {
    return getBounds(bounds, 'line');
  }
  if (
    bounds.translation !== undefined
    || bounds.scale !== undefined
    || bounds.rotation !== undefined
  ) {
    return getBounds(bounds, 'transform', transform);
  }

  if (bounds.f1Type !== undefined && bounds.state != null) {
    const { f1Type, state } = bounds;
    if (f1Type != null
      && f1Type === 'rangeBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 4
    ) { // $FlowFixMe
      const [b, precision, min, max] = state;
      return new RangeBounds({
        bounds: b, precision, min, max,
      });
    }
    if (f1Type != null
      && f1Type === 'rectBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 6
    ) { // $FlowFixMe
      const [b, precision, left, bottom, right, top] = state;
      return new RectBounds({
        bounds: b, precision, left, bottom, right, top,
      });
    }
    if (f1Type != null
      && f1Type === 'lineBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 7
    ) { // $FlowFixMe
      const [b, precision, x, y, x2, y2, ends] = state;
      return new LineBounds({
        bounds: b,
        precision,
        p1: new Point(x, y),
        p2: new Point(x2, y2),
        ends,
      });
    }

    if (f1Type != null
      && f1Type === 'transformBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 3
    ) { // $FlowFixMe
      const [precision, order, boundsArray] = state;
      const t = new TransformBounds(new Transform(), {}, precision);
      t.order = order.slice();
      const boundary = [];
      boundsArray.forEach((b) => {
        if (b == null) {
          boundary.push(null);
        } else {
          boundary.push(getBounds(b));
        }
      });
      t.boundary = boundary;
      return t;
    }
  }
  return null;
}


function transformValueToArray(
  transformValue: TypeTransformValue,
  transform: Transform,
  // defaultTransformationValue: TypeTransformValue = {},
): Array<number> {
  if (Array.isArray(transformValue)) {
    return transformValue;
  }
  const order = [];
  // debugger;
  if (typeof transformValue === 'number') {
    for (let i = 0; i < transform.order.length; i += 1) {
      order.push(transformValue);
    }
    return order;
  }

  for (let i = 0; i < transform.order.length; i += 1) {
    const transformation = transform.order[i];
    if (transformation instanceof Translation) {
      let value = 0;
      if (transformValue.position != null) {
        value = transformValue.position;
      }
      if (transformValue.translation != null) {
        value = transformValue.translation;
      }
      order.push(value);
    } else if (transformation instanceof Scale) {
      let value = 0;
      if (transformValue.scale != null) {
        value = transformValue.scale;
      }
      order.push(value);
    } else if (transformation instanceof Rotation) {
      let value = 0;
      if (transformValue.rotation != null) {
        value = transformValue.rotation;
      }
      order.push(value);
    }
  }
  return order;
}

// bounds: null
// bounds: { translation: [-1, -1, 2, 2], scale: [-1, 1], rotation: [-1, 1] }
// bounds: 'figure',
// bounds: new TransformBounds(transform, [null, null] | { translation: null })
// bounds: [null, [-1, -1, 2, 2], null]
// bounds: [null, [null, -1, null, 2], null]
// bounds: TransformBounds | Rect | Array<number> | 'figure',

// type TypeBoundsDefinition = null | ;

type TypeTranslationBoundsDefinition = Bounds
                                       | TypeRectBoundsDefinition
                                       | TypeLineBoundsDefinition
                                       | TypeRangeBoundsDefinition;
type TypeRotationBoundsDefinition = Bounds | TypeRangeBoundsDefinition;
type TypeScaleBoundsDefinition = Bounds | TypeRangeBoundsDefinition | TypeRectBoundsDefinition;

export type TypeTransformBoundsDefinition = Array<Bounds | null> | {
  position?: TypeTranslationBoundsDefinition;
  translation?: TypeTranslationBoundsDefinition;
  rotation?: TypeRotationBoundsDefinition;
  scale?: TypeScaleBoundsDefinition;
};

export type TypeF1DefTransformBounds = {
  f1Type: 'transformBounds',
  state: [number, Array<'s' | 'r' | 'r'>, Array<TypeF1DefLineBounds | TypeF1DefRectBounds | TypeF1DefRangeBounds>],
};

class TransformBounds extends Bounds {
  boundary: Array<Bounds | null>;
  order: Array<'t' | 'r' | 's'>;

  constructor(
    transform: Transform,
    bounds: TypeTransformBoundsDefinition = {},
    precision: number = 8,
  ) {
    // let boundary = [];
    const order = [];
    for (let i = 0; i < transform.order.length; i += 1) {
      const transformation = transform.order[i];
      if (transformation instanceof Translation) {
        order.push('t');
      } else if (transformation instanceof Scale) {
        order.push('s');
      } else {
        order.push('r');
      }
    }
    super([], 'inside', precision);
    this.order = order;
    this.createBounds(bounds);
  }

  isUnbounded() {
    for (let i = 0; i < this.boundary.length; i += 1) {
      if (this.boundary[i] !== null) {
        return false;
      }
    }
    return true;
  }

  _dup() {
    const t = new TransformBounds(new Transform(), {}, this.precision);
    t.order = this.order.slice();
    t.boundary = [];
    this.boundary.forEach((b) => {
      if (b == null) {
        t.boundary.push(null);
      } else {
        t.boundary.push(b._dup());
      }
    });
    return t;
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    const bounds = [];
    this.boundary.forEach((b) => {
      if (b == null) {
        bounds.push(null);
      } else {
        bounds.push(b._state({ precision }));
      }
    });
    return {
      f1Type: 'transformBounds',
      state: [
        this.precision,
        this.order.slice(),
        bounds,
      ],
    };
  }

  createBounds(
    bounds: TypeTransformBoundsDefinition | Bounds | null,
    index: number = 0,
  ) {
    if (bounds == null || bounds instanceof Bounds) {
      this.boundary[index] = bounds;
      return;
    }
    if (Array.isArray(bounds)) {
      this.boundary = bounds;
      return;
    }
    const boundary = [];
    this.order.forEach((o) => {
      let bound = null;
      if (o === 't' && bounds.position != null) {
        bound = getBounds(bounds.position);
      }
      if (o === 't' && bounds.translation != null) {
        bound = getBounds(bounds.translation);
      }
      if (o === 'r' && bounds.rotation != null) {
        bound = getBounds(bounds.rotation);
      }
      if (o === 's' && bounds.scale != null) {
        bound = getBounds(bounds.scale);
      }
      boundary.push(bound);
    });
    this.boundary = boundary;
  }

  update(
    type: 'r' | 's' | 't',
    bound: TypeBoundsDefinition,
    typeIndex: ?number = 0,
  ) {
    let index = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const o = this.order[i];
      if (o === type) {
        if (typeIndex == null || typeIndex === index) {
          this.boundary[i] = getBounds(bound);
        }
        index += 1;
      }
      // if (o === type && (typeIndex == null || typeIndex === index)) {
      //   this.boundary[i] = getBounds(bound);
      //   index += 1;
      // }
    }
  }

  updateTranslation(
    bound: Bounds | TypeTranslationBoundsDefinition,
    translationIndex: ?number = 0,
  ) {
    let b = getBounds(bound);
    if (b instanceof RangeBounds) {
      b = new RectBounds({
        left: b.boundary.min,
        bottom: b.boundary.min,
        top: b.boundary.max,
        right: b.boundary.max,
      });
    }
    this.update('t', b, translationIndex);
  }

  updateRotation(
    bound: Bounds | TypeRotationBoundsDefinition,
    translationIndex: ?number = 0,
  ) {
    this.update('r', bound, translationIndex);
  }

  updateScale(
    bound: Bounds | TypeScaleBoundsDefinition,
    translationIndex: ?number = 0,
  ) {
    this.update('s', bound, translationIndex);
  }

  getBound(type: 'r' | 's' | 't', index: number = 0) {
    let typeIndex = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const o = this.order[i];
      if (o === type) {
        if (typeIndex === index) {
          return this.boundary[i];
        }
        typeIndex += 1;
      }
    }
    return null;
  }

  getTranslation(index: number = 0) {
    return this.getBound('t', index);
  }

  getScale(index: number = 0) {
    return this.getBound('s', index);
  }

  getRotation(index: number = 0) {
    return this.getBound('r', index);
  }

  // $FlowFixMe
  contains(t: Transform) {
    for (let i = 0; i < t.order.length; i += 1) {
      const transformElement = t.order[i];
      const b = this.boundary[i];                       // $FlowFixMe
      if (transformElement instanceof Rotation) {
        if (b != null && !b.contains(transformElement.r)) {
          return false;
        }
      } else if (b != null && !b.contains(new Point(transformElement.x, transformElement.y))) {
        return false;
      }
    }
    return true;
  }

  // $FlowFixMe
  clip(t: Transform) {
    const order = [];
    for (let i = 0; i < t.order.length; i += 1) {
      const transformElement = t.order[i];
      const b = this.boundary[i];
      if (b != null) {
        let clipped;
        if (transformElement instanceof Rotation) {
          clipped = b.clip(transformElement.r);
        } else {
          clipped = b.clip(new Point(transformElement.x, transformElement.y));
        }
        let newElement;
        if (transformElement instanceof Translation) {
          newElement = new Translation(clipped.x, clipped.y, transformElement.name);
        } else if (transformElement instanceof Scale) {
          newElement = new Scale(clipped.x, clipped.y, transformElement.name);
        } else {
          newElement = new Rotation(clipped, transformElement.name);
        }

        // clipped.name = transformElement.name;
        order.push(newElement);
      } else {
        order.push(transformElement._dup());
      }
    }
    return new Transform(order, t.name);
  }
}

function deceleratePoint(
  positionIn: Point,
  velocityIn: Point,
  decelerationIn: number,
  deltaTimeIn: number | null = null,
  boundsIn: ?Bounds = null,  // ?(Rect | Line) = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
): {
  velocity: Point,
  duration: null | number,
  position: Point,
} {
  let bounds;
  if (boundsIn instanceof RangeBounds) {
    bounds = new RectBounds({
      left: boundsIn.boundary.min,
      right: boundsIn.boundary.max,
      bottom: boundsIn.boundary.min,
      top: boundsIn.boundary.max,
    });
  } else {
    bounds = boundsIn;
  }
  if (round(decelerationIn, precision) === 0) {
    if (bounceLossIn === 0 || bounds == null || !bounds.isDefined()) {
      if (deltaTimeIn == null) {
        return {
          velocity: velocityIn,
          position: positionIn,
          duration: null,
        };
      }
      // const { mag, angle } = velocityIn.toPolar();
      // const distanceTravelled = mag * deltaTimeIn;
      // return {
      //   velocity: velocityIn,
      //   position: polarToRect(distanceTravelled, angle).add(positionIn),
      //   duration: null,
      // };
    }
  }
  // clip velocity to the dimension of interest
  let velocity = velocityIn;    // $FlowFixMe
  if (bounds != null && bounds.clipVelocity != null) {  // $FlowFixMe
    velocity = bounds.clipVelocity(velocityIn);
  }
  // const velocity = velocityIn;

  let stopFlag = false;
  if (deltaTimeIn == null) {
    stopFlag = true;
  }

  // Get the mag and angle of the velocity and check if under the zero threshold
  const { mag, angle } = velocity.toPolar();
  if (mag <= zeroVelocityThreshold) {
    return {
      velocity: new Point(0, 0),
      position: positionIn,
      duration: 0,
    };
  }

  // Clip position in the bounds
  let position = positionIn._dup();
  if (bounds != null) {
    position = bounds.clip(positionIn);
  }

  // Initial Velocity
  const v0 = mag;
  // Total change in velocity to go to zero threshold
  const deltaV = Math.abs(v0) - zeroVelocityThreshold;

  let deltaTime = deltaTimeIn;

  const deceleration = Math.max(decelerationIn, 0.0000001);
  if (deltaTime == null || deltaTime > Math.abs(deltaV / deceleration)) {
    deltaTime = Math.abs(deltaV / deceleration);
  }

  // Calculate distance traveeled over time and so find the new Position
  const distanceTravelled = v0 * deltaTime - 0.5 * deceleration * (deltaTime ** 2);
  const newPosition = polarToRect(distanceTravelled, angle).add(position);

  // If the new position is within the bounds, then can return the result.
  if (bounds == null || bounds.contains(newPosition)) {
    if (stopFlag) {
      return {
        duration: deltaTime,
        position: newPosition,
        velocity: new Point(0, 0),
      };
    }
    let v1 = v0 - deceleration * deltaTime;
    if (round(v1, precision) <= round(zeroVelocityThreshold, precision)) {
      v1 = 0;
    }
    return {
      position: newPosition,
      velocity: polarToRect(v1, angle),
      duration: deltaTime,
    };
  }

  // if we got here, the new position is out of bounds
  const bounceScaler = 1 - bounceLossIn;
  const result = bounds.intersect(position, clipAngle(angle, '0to360'));

  // if newPosition is not contained within bounds, but the intersect distance
  // is larger than the distance travelled in deltaTime, then there is likely a
  // rounding error...
  if (result.distance != null && result.distance > distanceTravelled) {
    throw new Error('Error in calculating intersect');
  }

  let intersectPoint;
  if (typeof result.intersect === 'number') {
    intersectPoint = new Point(result.intersect, 0);
  } else if (result.intersect == null) {
    return {
      position: newPosition,
      velocity: new Point(0, 0),
      duration: deltaTime,
    };
  } else {
    intersectPoint = result.intersect;
  }
  // const intersectPoint = result.position;
  const distanceToBound = result.distance;
  const reflectionAngle = result.reflection;

  // if (intersectPoint == null) {
  //   return {
  //     duration: timeToZeroV,
  //     position: newPosition,
  //   };
  // }

  // Calculate the time to the intersect point
  const acc = -v0 / Math.abs(v0) * deceleration;
  const s = distanceToBound;
  const b = v0;
  const a = 0.5 * acc;
  const c = -s;
  const t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

  // If there is no bounce (all energy is lost) then return the result
  if (bounceLossIn === 1) {
    return {
      velocity: new Point(0, 0),
      position: intersectPoint,
      duration: t,
    };
  }

  const velocityAtIntersect = v0 + acc * t; // (s - 0.5 * a * (t ** 2)) / t;
  const bounceVelocity = velocityAtIntersect * bounceScaler;
  const rectBounceVelocity = new Point(
    bounceVelocity * Math.cos(reflectionAngle),
    bounceVelocity * Math.sin(reflectionAngle),
  );

  if (stopFlag) {
    const newStop = deceleratePoint(
      intersectPoint, rectBounceVelocity, deceleration, deltaTimeIn,
      bounds, bounceLossIn, zeroVelocityThreshold, precision,
    );
    if (newStop.duration == null) {
      return {
        duration: null,
        position: newStop.position,
        velocity: new Point(0, 0),
      };
    }
    return {
      duration: t + newStop.duration,
      position: newStop.position,
      velocity: new Point(0, 0),
    };
  }
  return deceleratePoint(
    intersectPoint, rectBounceVelocity, deceleration, deltaTime - t, bounds,
    bounceLossIn, zeroVelocityThreshold, precision,
  );
}

function decelerateValue(
  value: number,
  velocity: number,
  deceleration: number,
  deltaTime: number | null = null,
  boundsIn: ?RangeBounds = null,
  bounceLoss: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
  let bounds = boundsIn;
  if (round(deceleration, precision) === 0) {
    if (
      bounceLoss === 0
      || boundsIn == null
      || (boundsIn != null && !boundsIn.isDefined())
    ) {
      if (deltaTime == null) {
        return {
          velocity,
          value,
          duration: null,
        };
      }
      // const distanceTravelled = velocity * deltaTime;
      // return {
      //   velocity,
      //   position: value + distanceTravelled,
      //   duration: null,
      // };
    }
  }
  if (boundsIn != null) {
    // let { min, max } = boundsIn.boundary;
    // if (min == null) {
    // }
    bounds = new LineBounds({
      p1: [boundsIn.boundary.min != null ? boundsIn.boundary.min : 0, 0],
      p2: [boundsIn.boundary.max != null ? boundsIn.boundary.max : 0, 0],
    });
  }
  const result = deceleratePoint(
    new Point(value, 0),
    new Point(velocity, 0),
    deceleration,
    deltaTime,
    bounds,
    bounceLoss,
    zeroVelocityThreshold,
    precision,
  );

  return {
    duration: result.duration,
    value: result.position.x,
    velocity: result.velocity.x,
  };
}

function decelerateIndependantPoint(
  value: Point,
  velocity: Point,
  deceleration: number,
  deltaTime: number | null = null,
  boundsIn: ?RectBounds = null,
  bounceLoss: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
  let xBounds = null;
  let yBounds = null;
  if (boundsIn != null) {
    xBounds = new RangeBounds({
      min: boundsIn.boundary.left, max: boundsIn.boundary.right,
    });
    yBounds = new RangeBounds({
      min: boundsIn.boundary.bottom, max: boundsIn.boundary.top,
    });
  }

  const xResult = decelerateValue(
    value.x, velocity.x, deceleration, deltaTime,
    xBounds, bounceLoss, zeroVelocityThreshold, precision,
  );
  const yResult = decelerateValue(
    value.y, velocity.y, deceleration, deltaTime,
    yBounds, bounceLoss, zeroVelocityThreshold, precision,
  );
  if (xResult.duration == null || yResult.duration == null) {
    return {
      duration: null,
      point: new Point(xResult.value, yResult.value),
      velocity: new Point(xResult.velocity, yResult.velocity),
    };
  }

  return {
    duration: Math.max(xResult.duration, yResult.duration),
    point: new Point(xResult.value, yResult.value),
    velocity: new Point(xResult.velocity, yResult.velocity),
  };
}

export type TypeTransformationValue = {
  rotation?: number;
  position?: number;
  translation?: number;
  scale?: number;
}

// type TypeTransformationBoundsDefinition = {
//   rotation?: RangeBounds | TypeParsablePoint;
//   position?: RectBounds | TypeParsableRect;
//   translation?: RectBounds | TypeParsableRect;
//   scale?: RectBounds | TypeParsablePoint;
// }

type TypeTransformDeceleration = Array<number>;
type TypeTransformBounds = Array<Bounds | null>;
type TypeTransformZeroThreshold = Array<number>;
type TypeTransformBounce = Array<number>;


// function getTransformBoundsLimit(
//   boundsDefinition: TypeTransformLinkBoundsDefinition | TypeTransformBounds,
//   transform: Transform,
// ): TypeTransformBounds {
//   if (Array.isArray(boundsDefinition)) {
//     return boundsDefinition;
//   }
//   const order = [];
//   for (let i = 0; i < transform.order.length; i += 1) {
//     const transformation = transform.order[i];
//     if (transformation instanceof Translation) {
//       let position = null;
//       if (boundsDefinition.position != null) {
//         ({ position } = boundsDefinition);
//       }
//       if (boundsDefinition.translation != null) {
//         position = boundsDefinition.translation;
//       }
//       order.push(position);
//     } else if (transformation instanceof Scale) {
//       let scale = null;
//       if (boundsDefinition.scale != null) {
//         ({ scale } = boundsDefinition);
//       }
//       order.push(scale);
//     } else if (transformation instanceof Rotation) {
//       let rotation = null;
//       if (boundsDefinition.rotation != null) {
//         ({ rotation } = boundsDefinition);
//       }
//       order.push(rotation);
//     }
//   }
//   return order;
// }

function decelerateTransform(
  transform: Transform,
  velocity: Transform,
  deceleration: TypeTransformDeceleration,
  deltaTime: number | null,
  boundsIn: TransformBounds | TypeTransformBoundsDefinition,
  bounceLoss: TypeTransformBounce,
  zeroVelocityThreshold: TypeTransformZeroThreshold,
  precision: number = 8,
) {
  let duration = 0;
  const newOrder = [];
  const newVOrder = [];

  let bounds;
  if (boundsIn instanceof TransformBounds) {
    bounds = boundsIn;
  } else {
    bounds = new TransformBounds(transform, boundsIn);
  }
  for (let i = 0; i < transform.order.length; i += 1) {
    const transformation = transform.order[i];
    let result;
    let newTransformation;
    let newVTransformation;
    if (transformation instanceof Translation) {
      result = deceleratePoint( // $FlowFixMe
        transformation, velocity.order[i], deceleration[i], deltaTime,
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Translation(result.position.x, result.position.y);
      newVTransformation = new Translation(result.velocity.x, result.velocity.y);
    } else if (transformation instanceof Scale) {
      result = decelerateIndependantPoint( // $FlowFixMe
        transformation, velocity.order[i], deceleration[i], deltaTime, // $FlowFixMe
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Scale(result.point.x, result.point.y);
      newVTransformation = new Scale(result.velocity.x, result.velocity.y);
    } else {
      result = decelerateValue( // $FlowFixMe
        transformation.r, velocity.order[i].r, deceleration[i], deltaTime,   // $FlowFixMe
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Rotation(result.value);
      newVTransformation = new Rotation(result.velocity);
    }
    if (deltaTime === null) {
      // $FlowFixMe
      if (result.duration == null || result.duration > duration) {
        ({ duration } = result);
      }
    }
    newVOrder.push(newVTransformation);
    newOrder.push(newTransformation);
  }

  if (deltaTime != null) {
    duration = deltaTime;
  }
  return {
    transform: new Transform(newOrder, transform.name),
    velocity: new Transform(newVOrder, transform.name),
    duration,
  };
}

/**
 * Get center of a triangle
 *
 * @example
 * const getTriangleCenter = Fig.getTriangleCenter;
 *
 * const center = getTriangleCenter([0, 0], [1, 0], [0, 1]);
 * console.log(center);
 * // Point {x: 0.3333333333333333, y: 0.3333333333333333}
 */
function getTriangleCenter(
  p1: TypeParsablePoint,
  p2: TypeParsablePoint,
  p3: TypeParsablePoint,
) {
  const A = getPoint(p1);
  const B = getPoint(p2);
  const C = getPoint(p3);
  const Ox = (A.x + B.x + C.x) / 3;
  const Oy = (A.y + B.y + C.y) / 3;
  return new Point(Ox, Oy);
}

// function isParsablePoint(value: any) {
//   if (
//     Array.isArray(value) && value.length === 2
//     && typeof value[0] === 'number'
//     && typeof value[1] === 'number'
//   ) {
//     return true;
//   }
//   if (value instanceof Point) {
//     return true;
//   }
//   if (value.f1Type != null && value.f1Type === 'p') {
//     return true;
//   }
//   if (typeof value === 'string' && value.charAt(0) === '[') {
//     let newValue;
//     try {
//       newValue = JSON.parse(value);
//     } catch {
//       return false;
//     }
//     return isParsablePoint(newValue);
//   }
//   return false;
// }


/**
 * A border is an array of points defining a contigous, closed border.
 *
 * `Array<TypeParsablePoint> | Array<Array<TypeParsablePoint>>`
 *
 * If a border is not contigous, but rather is several "islands" of contigous,
 * closed borders, then an array of point arrays can be used, where each point
 * array is one island.
 */
export type TypeParsableBorder = Array<TypeParsablePoint> | Array<Array<TypeParsablePoint>>;

/**
 * A border is an array of point arrays. Each point array is a contigous, closed
 * border. Several pointa arrays represent a border that is several separate
 * borders.
 */
export type TypeBorder = Array<Array<Point>>;

function getBorder(
  border: Array<TypeParsablePoint> | Array<Array<TypeParsablePoint>>
          | string | number,
): Array<Array<Point>> | string | number {
  if (typeof border === 'string' || typeof border === 'number') {
    return border;
  } // $FlowFixMe
  if (isParsablePoint(border[0])) {  // $FlowFixMe
    return [border.map(p => getPoint(p))];
  } // $FlowFixMe
  return border.map(b => b.map(p => getPoint(p)));
}

export type TypeXAlign = 'left' | 'right' | 'center' | 'string' | number;

export type TypeYAlign = 'bottom' | 'top' | 'middle' | 'string' | number;

function getPositionInRect(
  r: TypeParsableRect,
  xAlign: TypeXAlign = 0,
  yAlign: TypeYAlign = 0,
  // offset: TypeParsablePoint = new Point(0, 0),
) {
  const rect = getRect(r);
  const position = new Point(rect.left, rect.bottom);
  if (xAlign === 'center') {
    position.x += rect.width / 2;
  } else if (xAlign === 'right') {
    position.x = rect.right;
  } else if (typeof xAlign === 'number') {
    position.x += rect.width * xAlign;
  } else if (xAlign.startsWith('o')) {
    position.x += parseFloat(xAlign.slice(1));
  }
  if (yAlign === 'middle') {
    position.y += rect.height / 2;
  } else if (yAlign === 'top') {
    position.y = rect.top;
  } else if (typeof yAlign === 'number') {
    position.y += rect.height * yAlign;
  } else if (yAlign.startsWith('o')) {
    position.y += parseFloat(yAlign.slice(1));
  }
  return position;
}
// function getBorder(borders: Array<Array<TypeParsablePoint>>) {
//   if (!Array.isArray(borders)) {
//     return borders;
//   }
//   const borderOut: Array<Array<Point>> = [];
//   borders.forEach((b) => {
//     borderOut.push(b.map((bElement: TypeParsablePoint) => getPoint(bElement)));
//   });
//   return borderOut;
// }

export {
  // point,
  Point,
  line,
  Line,
  distance,
  minAngleDiff,
  deg,
  normAngle,
  Transform,
  Rect,
  Translation,
  Scale,
  Rotation,
  spaceToSpaceTransform,
  getBoundingRect,
  linearPath,
  curvedPath,
  quadraticBezier,
  translationPath,
  polarToRect,
  rectToPolar,
  getDeltaAngle,
  normAngleTo90,
  threePointAngle,
  threePointAngleMin,
  randomPoint,
  getMaxTimeFromVelocity,
  getMoveTime,
  parsePoint,
  clipAngle,
  spaceToSpaceScale,
  getPoint,
  getScale,
  getPoints,
  quadBezierPoints,
  getRect,
  getTransform,
  getLine,
  deceleratePoint,
  decelerateValue,
  decelerateTransform,
  RectBounds,
  LineBounds,
  RangeBounds,
  // ValueBounds,
  TransformBounds,
  Vector,
  transformValueToArray,
  getBounds,
  Bounds,
  getTriangleCenter,
  getBoundingBorder,
  getBorder,
  comparePoints,
  isBuffer,
  getPositionInRect,
  isParsablePoint,
  isParsableTransform,
  isTransformArrayZero,
};
