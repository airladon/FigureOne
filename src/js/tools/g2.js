// @flow

import {
  roundNum, decelerate, clipMag, clipValue, rand2D, round,
} from './math';
// import { Console } from '../../tools/tools';
import * as m2 from './m2';
// import { joinObjects } from './tools';


function quadraticBezier(P0: number, P1: number, P2: number, t: number) {
  return (1 - t) * ((1 - t) * P0 + t * P1) + t * ((1 - t) * P1 + t * P2);
}

function clipAngle(
  angleToClip: number,
  clipTo: '0to360' | '-180to180' | null,
) {
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
  return angle;
}

/**
 * Rect
 * @class
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
   * @param {number} bottom - rectangle height
   */
  constructor(left: number, bottom: number, width: number, height: number) {
    this.left = left;
    this.width = width;
    this.height = height;
    this.bottom = bottom;
    this.top = bottom + height;
    this.right = left + width;
  }

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

  isPointInside(pointIn: TypeParsablePoint, precision: number = 8) {
    const p = getPoint(pointIn).round(precision);
    const top = roundNum(this.top, precision);
    const bottom = roundNum(this.bottom, precision);
    const left = roundNum(this.left, precision);
    const right = roundNum(this.right, precision);
    if (p.x < left || p.x > right || p.y < bottom || p.y > top) {
      return false;
    }
    return true;
  }
}

type TypeF1DefRect = {
  f1Type: 'rect',
  state: [number, number, number, number],
};

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

function getRect(r: TypeParsableRect): Rect {
  let parsedRect = parseRect(r);
  if (parsedRect == null) {
    parsedRect = new Rect(0, 0, 1, 1);
  }
  return parsedRect;
}


/* eslint-disable comma-dangle */
/**
 * Point class
 *
 */
class Point {
  /**
   * x value of point
  */
  x: number;

  /** y value of point */
  y: number;
  _type: 'point';

  /**
   * Return a point at (0, 0)
   */
  static zero(): Point {
    return new Point(0, 0);
  }

  /**
   * Return a point at (1, 1)
   */
  static Unity(): Point {
    return new Point(1, 1);
  }

  /**
   * Constructor
   * @constructor
   * @param x x coordinate of point
   * @param y y coordinate of point
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._type = 'point';
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
    return new Point(this.x, this.y);
  }

  /**
   * Scale x and y values of point by scalar
   * @example
   * p = new Point(1, 1);
   * s = p.scale(3);
   * // s = Point{x: 3, y: 3};
   */
  scale(scalar: number): Point {
    return new Point(this.x * scalar, this.y * scalar);
  }

  /**
   * Subtract (x, y) values or a {@link Point} and return the difference as a new {@link Point}
   * @example
   * p = new Point(3, 3);
   * d = p.sub(1, 1)
   * // d = Point{x: 2, y: 2}
   *
   * p = new Point(3, 3);
   * q = new Point(1, 1);
   * d = p.sub(q)
   * // d = Point{x: 2, y: 2}
   */
  sub(pointOrX: Point | number, y: number = 0): Point {
    if (pointOrX instanceof Point) {
      return new Point(this.x - pointOrX.x, this.y - pointOrX.y);
    }
    return new Point(this.x - pointOrX, this.y - y);
  }

  /**
   * Add (x, y) values or a {@link Point} and return the sum as a new {@link Point}
   * @example
   * p = new Point(3, 3);
   * d = p.add(1, 1)
   * // d = Point{x: 4, y: 4}
   *
   * p = new Point(3, 3);
   * q = new Point(1, 1);
   * d = p.add(q)
   * // d = Point{x: 4, y: 4}
   */
  add(pointOrX: Point | number, y: number = 0): Point {
    if (pointOrX instanceof Point) {
      return new Point(this.x + pointOrX.x, this.y + pointOrX.y);
    }
    return new Point(this.x + pointOrX, this.y + y);
  }

  /**
   * Return the distance between the point and the origin
   * @example
   * p = new Point(1, 1);
   * d = p.distance();
   * // d = 1.4142135623730951
   */
  distance(toPointIn: TypeParsablePoint | null = null): number {
    if (toPointIn == null) {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    const toPoint = getPoint(toPointIn);
    if (toPoint == null) {
      return this.distance();
    }
    return this.sub(toPoint).distance();
  }

  /**
   * Return a new point with (x, y) values rounded to some precision
   * @example
   * p = new Point(1.234, 1.234);
   * q = p.round(2);
   * // q = Point{x: 1.23, y: 1.23}
   */
  round(precision: number = 8): Point {
    return new Point(roundNum(this.x, precision), roundNum(this.y, precision));
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
    let maxX;
    let maxY;
    if (min instanceof Point) {
      minX = min.x;
      minY = min.y;
    } else {
      minX = min;
      minY = min;
    }
    if (max instanceof Point) {
      maxX = max.x;
      maxY = max.y;
    } else {
      maxX = max;
      maxY = max;
    }
    const x = clipValue(this.x, minX, maxX);
    const y = clipValue(this.y, minY, maxY);
    return new Point(x, y);
  }

  /**
   * Transform the point with a 3x3 matrix (2 dimensional transform)
   * @example
   * // Transform a point with a (2, 2) translation then 90º rotation
   * p = new Point(1, 1);
   * m = new Transform().translate(2, 2).rotate(Math.PI / 2).matrix();
   * // m = [0, -1, -2, 1, 0, 2, 0, 0, 1]
   * q = p.transformBy(m)
   * // q = Point{x: -3, y: 3}
   */
  transformBy(matrix: Array<number>): Point {
    const transformedPoint = m2.transform(matrix, this.x, this.y);
    return new Point(transformedPoint[0], transformedPoint[1]);
  }

  quadraticBezier(p1: Point, p2: Point, t: number) {
    const bx = quadraticBezier(this.x, p1.x, p2.x, t);
    const by = quadraticBezier(this.y, p1.y, p2.y, t);
    return new Point(bx, by);
  }

  /**
   * Rotate a point some angle around a center point
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
  rotate(angle: number, center?: Point = new Point(0, 0)): Point {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const matrix = [c, -s,
                    s, c]; // eslint-disable-line indent
    const centerPoint = center;
    const pt = this.sub(centerPoint);
    return new Point(
      matrix[0] * pt.x + matrix[1] * pt.y + centerPoint.x,
      matrix[2] * pt.x + matrix[3] * pt.y + centerPoint.y
    );
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
    if (pr.x === qr.x && pr.y === qr.y) {
      return true;
    }
    return false;
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

  /* eslint-disable no-use-before-define */
  isOnLine(l: Line, precision?: number) {
    return l.hasPointOn(this, precision);
  }

  getShaddowOnLine(l: Line, precision: number = 8) {
    const shaddow = new Line(this, 1, l.angle() + Math.PI / 2);
    const { intersect } = shaddow.intersectsWith(l);
    // console.log(intersect, inLine, onLine, )
    if (intersect != null && intersect.isOnLine(l, precision)) {
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
    if (this.shaddowIsOnLine(l, precision)) {
      return this.getShaddowOnLine(l, precision);
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

  /* eslint-enable no-use-before-define */
  // console(text?: string) {
  //   Console(`${text || ''} + ${this.x}, ${this.y}`);
  // }

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
      /* eslint-disable-next-line  no-use-before-define */
      const l = line(v[i], v[i + 1]);
      if (p.isOnLine(l)) {
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
    translationStyle: 'linear' | 'curved' = 'linear',
    // eslint-disable-next-line no-use-before-define
    translationOptions: pathOptionsType = {
      rot: 1,
      magnitude: 0.5,
      offset: 0.5,
      controlPoint: null,
      direction: '',
    },
  ) {                 // eslint-disable-next-line no-use-before-define
    const pathPoint = translationPath(
      translationStyle,
      this._dup(), delta, percent,
      translationOptions,
    );
    return pathPoint;
  }
}

type TypeF1DefPoint = {
  f1Type: 'p',
  state: [number, number],
};

export type TypeParsablePoint = [number, number]
                                | Point
                                // | { x: number, y: number}
                                | string
                                | TypeF1DefPoint;
// point can be defined as:
//    - Point instance
//    - [1, 1]
//    - { f1Type: 'p', def: [1, 1]}

function parsePoint<T>(pIn: TypeParsablePoint, onFail: T): Point | T | null {
  if (pIn instanceof Point) {
    return pIn;
  }
  let onFailToUse = onFail;
  if (onFailToUse == null) {
    onFailToUse = null;
  }
  if (pIn == null) {
    return onFailToUse;
  }

  let p = pIn;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      return onFailToUse;
    }
  }

  if (Array.isArray(p)) {
    if (p.length === 2) {
      return new Point(p[0], p[1]);
    }
    return onFailToUse;
  }

  if (p.f1Type != null) {
    if (
      p.f1Type === 'p'
      && p.state != null
      && Array.isArray([p.state])
      && p.state.length === 2
    ) {
      const [x, y] = p.state;
      return new Point(x, y);
    }
    return onFailToUse;
  }
  if (typeof p === 'number') {
    return new Point(p, p);
  }
  // if (typeof (p) === 'object') {
  //   const keys = Object.keys(p);
  //   if (keys.indexOf('x') > -1 && keys.indexOf('y') > -1) {
  //     return new Point(p.x, p.y);
  //   }
  // }
  return onFailToUse;
}

function getPoint(p: TypeParsablePoint): Point {
  let parsedPoint = parsePoint(p);
  if (parsedPoint == null) {
    parsedPoint = new Point(0, 0);
  }
  return parsedPoint;
}

function getPoints(points: TypeParsablePoint | Array<TypeParsablePoint>): Array<Point> {
  if (Array.isArray(points)) {
    if (points.length === 2 && typeof points[0] === 'number') { // $FlowFixMe
      return [getPoint(points)];
    } // $FlowFixMe
    return points.map(p => getPoint(p));
  }
  return [getPoint(points)];
}

function getScale(s: TypeParsablePoint | number) {
  let parsedPoint;
  if (typeof s === 'number') {
    parsedPoint = new Point(s, s);
  } else {
    parsedPoint = getPoint(s);
  }
  return parsedPoint;
}

function linearPath(
  start: Point,
  delta: Point,
  percent: number,
) {
  return start.add(delta.x * percent, delta.y * percent);
}

type linearPathOptionsType = {
};
type curvedPathOptionsType = {
  // path: '(Point, Point, number) => Point';
  rot: number;
  magnitude: number;
  offset: number;
  controlPoint: Point | null;
  direction: '' | 'up' | 'left' | 'down' | 'right';
};
export type pathOptionsType = curvedPathOptionsType & linearPathOptionsType;

function curvedPath(
  start: Point,
  delta: Point,
  percent: number,
  options: pathOptionsType,
) {
  const o = options;
  const angle = Math.atan2(delta.y, delta.x);
  const midPoint = start.add(new Point(delta.x * o.offset, delta.y * o.offset));
  const dist = delta.toPolar().mag * o.magnitude;
  let { controlPoint } = options;
  if (controlPoint == null) {
    const { direction } = options;
    let xDelta = Math.cos(angle + o.rot * Math.PI / 2);
    let yDelta = Math.sin(angle + o.rot * Math.PI / 2);
    if (direction === 'up') {
      if (yDelta < 0) {
        yDelta = Math.sin(angle + o.rot * Math.PI / 2 + Math.PI);
      }
    } else if (direction === 'down') {
      if (yDelta > 0) {
        yDelta = Math.sin(angle + o.rot * Math.PI / 2 + Math.PI);
      }
    } else if (direction === 'left') {
      if (xDelta > 0) {
        xDelta = Math.cos(angle + o.rot * Math.PI / 2 + Math.PI);
      }
    } else if (direction === 'right') {
      if (xDelta < 0) {
        xDelta = Math.cos(angle + o.rot * Math.PI / 2 + Math.PI);
      }
    }

    controlPoint = new Point(
      midPoint.x + dist * xDelta,
      midPoint.y + dist * yDelta,
    );
  }

  const p0 = start;
  const p1 = controlPoint;
  const p2 = start.add(delta);
  const t = percent;
  const bx = quadraticBezier(p0.x, p1.x, p2.x, t);
  const by = quadraticBezier(p0.y, p1.y, p2.y, t);
  return new Point(bx, by);
}


function translationPath(
  pathType: 'linear' | 'curved' = 'linear',
  start: Point,
  delta: Point,
  percent: number,
  options: pathOptionsType,
) {
  if (pathType === 'linear') {
    return linearPath(start, delta, percent);
  }
  if (pathType === 'curved') {
    return curvedPath(start, delta, percent, options);
  }
  return new Point(0, 0);
}

function point(x: number, y: number) {
  return new Point(x, y);
}

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

  if (rotDirection === 0) {
    return minAngleDiff(target, start);
  }

  if (rotDirection === 1) {
    if (start > target) {
      return Math.PI * 2 - start + target;
    }
  }

  if (rotDirection === -1) {
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

class Line {
  p1: Point;
  p2: Point;
  ang: number;
  A: number;
  B: number;
  C: number;
  distance: number;

  constructor(
    p1: TypeParsablePoint,
    p2OrMag: TypeParsablePoint | number,
    angle: number = 0,
  ) {
    this.p1 = getPoint(p1);
    if (typeof p2OrMag === 'number') {
      this.p2 = this.p1.add(
        p2OrMag * Math.cos(angle),
        p2OrMag * Math.sin(angle),
      );
      this.ang = angle;
    } else {
      this.p2 = getPoint(p2OrMag);
      this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    }
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
    return new Line(this.p1, this.p2);
  }

  setP1(p1: Point | [number, number]) {
    this.p1 = getPoint(p1);
    this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    this.setupLine();
  }

  setP2(p2: Point | [number, number]) {
    this.p2 = getPoint(p2);
    this.ang = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    this.setupLine();
  }

  getPoint(index: number = 1) {
    if (index === 2) {
      return this.p2;
    }
    return this.p1;
  }

  getYFromX(x: number) {
    if (this.B !== 0) {
      return (this.C - this.A * x) / this.B;
    }
    return null;
  }

  getXFromY(y: number) {
    if (this.A !== 0) {
      return (this.C - this.B * y) / this.A;
    }
    return null;
  }

  angle() {
    return this.ang;
  }

  round(precision?: number = 8) {
    const lineRounded = new Line(this.p1, this.p2);
    lineRounded.A = roundNum(lineRounded.A, precision);
    lineRounded.B = roundNum(lineRounded.B, precision);
    lineRounded.C = roundNum(lineRounded.C, precision);
    lineRounded.ang = roundNum(lineRounded.ang, precision);
    lineRounded.distance = roundNum(lineRounded.distance, precision);
    return lineRounded;
  }

  length() {
    // return this.p1.sub(this.p2).distance();
    return this.distance;
  }

  /* eslint-disable comma-dangle */
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

  pointAtPercent(percent: number) {
    const length = this.length();
    const direction = this.p2.sub(this.p1);
    const angle = Math.atan2(direction.y, direction.x);
    const midPoint = point(
      this.p1.x + length * percent * Math.cos(angle),
      this.p1.y + length * percent * Math.sin(angle)
    );
    return midPoint;
  }

  pointAtLength(length: number) {
    const direction = this.p2.sub(this.p1);
    const angle = Math.atan2(direction.y, direction.x);
    const midPoint = point(
      this.p1.x + length * Math.cos(angle),
      this.p1.y + length * Math.sin(angle)
    );
    return midPoint;
  }
  /* eslint-enable comma-dangle */

  hasPointAlong(p: Point, precision?: number) {
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

  // perpendicular distance of line to point
  distanceToPoint(p: Point, precision?: number) {
    return roundNum(
      Math.abs(this.A * p.x + this.B * p.y - this.C) / Math.sqrt(this.A ** 2 + this.B ** 2),
      precision,
    );
  }

  hasPointOn(p: Point, precision?: number) {
    if (this.hasPointAlong(p, precision)) {
      if (pointinRect(p, this.p1, this.p2, precision)) {
        return true;
      }
    }
    return false;
  }

  isEqualTo(line2: Line, precision?: number) {
    let l1 = this;
    let l2 = line2;
    if (typeof precision === 'number') {
      l1 = l1.round(precision);
      l2 = l2.round(precision);
      l1.p1 = l1.p1.round(precision);
      l1.p2 = l1.p2.round(precision);
      l2.p1 = l2.p1.round(precision);
      l2.p2 = l2.p2.round(precision);
    }
    if (l1.A !== l2.A) {
      return false;
    }
    if (l1.B !== l2.B) {
      return false;
    }
    if (l1.C !== l2.C) {
      return false;
    }
    if (l1.p1.isNotEqualTo(l2.p1) && l1.p1.isNotEqualTo(l2.p2)) {
      return false;
    }
    if (l1.p2.isNotEqualTo(l2.p1) && l1.p2.isNotEqualTo(l2.p2)) {
      return false;
    }
    return true;
  }

  isOnSameLineAs(line2: Line, precision: number = 8) {
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

  // left, right, top, bottom is relative to cartesian coordinates
  // 'outside' is the outside of a polygon defined in the positive direction
  // (CCW).
  offset(
    direction: 'left' | 'right' | 'top' | 'bottom' | 'positive' | 'negative',
    space: number,
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
      this.p1.x + space * Math.cos(offsetAngle),
      this.p1.y + space * Math.sin(offsetAngle),
    );
    const p2 = new Point(
      this.p2.x + space * Math.cos(offsetAngle),
      this.p2.y + space * Math.sin(offsetAngle),
    );
    return new Line(p1, p2);
  }

  reflectsOn(l: Line, precision: number = 8) {
    const { intersect } = this.intersectsWith(l, precision);
    if (intersect == null) {
      return null;
    }
    const perpendicular = new Line(intersect, 1, l.ang + Math.PI / 2);
    const shaddow = this.p1.getShaddowOnLine(perpendicular, precision);
    const p1ToShaddow = new Line(p1, shaddow);
    const distance = p1ToShaddow.distance;
    // const distance = shaddow.distance(this.p1);
    const projection = Point(
      this.p1.x + distance * 2 * Math.cos(p1ToShaddow.ang),
      this.p1.y + distance * 2 * Math.sin(p1ToShaddow.ang),
    );
    return new Line(intersect, project);
  }

  intersectsWith(line2: Line, precision: number = 8) {
    const l2 = line2; // line2.round(precision);
    const l1 = this;  // this.round(precision);
    const det = l1.A * l2.B - l2.A * l1.B;
    if (roundNum(det, precision) !== 0) {
      const i = point(0, 0);
      i.x = (l2.B * l1.C - l1.B * l2.C) / det;
      i.y = (l1.A * l2.C - l2.A * l1.C) / det;
      if (
        pointinRect(i, l1.p1, l1.p2, precision)
        && pointinRect(i, l2.p1, l2.p2, precision)
      ) {
        return {
          onLine: true,
          inLine: true,
          intersect: i,
        };
      }
      return {
        onLine: true,
        inLine: false,
        intersect: i,
      };
    }
    if (det === 0 && (l1.isOnSameLineAs(l2, precision))) {
      // if the lines are colliner then:
      //   - if overlapping,
      //   - if partially overlapping: the intersect point is halfway between
      //     overlapping ends
      //   - if one line is within the other line, the intersect point is
      //     halfway between the midpoints
      //   - if not overlapping, the intersect point is halfway between the nearest ends
      // let l1 = this;
      if (
        !l1.p1.isOnLine(l2, precision)
        && !l1.p2.isOnLine(l2, precision)
        && !l2.p1.isOnLine(l1, precision)
        && !l2.p2.isOnLine(l1, precision)
      ) {
        const line11 = new Line(l1.p1, l2.p1);
        const line12 = new Line(l1.p1, l2.p2);
        const line21 = new Line(l1.p2, l2.p1);
        const line22 = new Line(l1.p2, l2.p2);

        let i = line11.midPoint();
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
          onLine: true,
          inLine: false,
          intersect: i,
        };
      }
      if (
        (
          l1.p1.isOnLine(l2, precision)
          && l1.p2.isOnLine(l2, precision)
          && (!l2.p1.isOnLine(l1, precision) || !l2.p2.isOnLine(l1, precision))
        )
        || (
          l2.p1.isOnLine(l1, precision)
          && l2.p2.isOnLine(l1, precision)
          && (!l1.p1.isOnLine(l2, precision) || !l1.p2.isOnLine(l2, precision))
        )
      ) {
        const midLine = new Line(l1.midPoint(), l2.midPoint());
        return {
          onLine: true,
          inLine: true,
          intersect: midLine.midPoint(),
        };
      }
      let midLine;
      if (
        l1.p1.isOnLine(l2, precision)
        && !l1.p2.isOnLine(l2, precision)
        && l2.p1.isOnLine(l1, precision)
        && !l2.p2.isOnLine(l1, precision)
      ) {
        midLine = new Line(l1.p1, l2.p1);
      }
      if (
        l1.p1.isOnLine(l2, precision)
        && !l1.p2.isOnLine(l2, precision)
        && !l2.p1.isOnLine(l1, precision)
        && l2.p2.isOnLine(l1, precision)
      ) {
        midLine = new Line(l1.p1, l2.p2);
      }
      if (
        !l1.p1.isOnLine(l2, precision)
        && l1.p2.isOnLine(l2, precision)
        && l2.p1.isOnLine(l1, precision)
        && !l2.p2.isOnLine(l1, precision)
      ) {
        midLine = new Line(l1.p2, l2.p1);
      }
      if (
        !l1.p1.isOnLine(l2, precision)
        && l1.p2.isOnLine(l2, precision)
        && !l2.p1.isOnLine(l1, precision)
        && l2.p2.isOnLine(l1, precision)
      ) {
        midLine = new Line(l1.p2, l2.p2);
      }

      let i;

      if (midLine instanceof Line) {
        i = midLine.midPoint();
      }

      return {
        onLine: true,
        inLine: true,
        intersect: i,
      };
    }
    return {
      onLine: false,
      inLine: false,
      intersect: undefined,
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
  f1Type: 'p',
  state: [[number, number], [number, number]],
};

export type TypeParsableLine = [TypeParsablePoint, TypeParsablePoint]
                                | [Point, number, number]
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
    if (l.length === 3) {
      return new Line(getPoint(l[0]), l[1], l[2]);
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
      && l.state.length === 2
    ) {
      const [p1, p2] = l.state;
      return new Line(getPoint(p1), getPoint(p2));
    }
    return onFailToUse;
  }
  return onFailToUse;
}

function getLine(p: TypeParsableLine): Line {
  let parsedLine = parseLine(p);
  if (parsedLine == null) {
    parsedLine = new Line(new Point(0, 0), new Point(1, 0));
  }
  return parsedLine;
}

type TypeF1DefRotation = {
  f1Type: 'r',
  state: [string, number],
};
class Rotation {
  r: number;
  name: string;
  constructor(angleIn: number | TypeF1DefRotation | string, nameIn: string = '') {
    let name: string = nameIn;
    let angle = angleIn;
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
      name = n;
      this.r = r;
    } else {
      this.r = 0;
    }
    this.name = name;
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'r',
      state: [this.name, roundNum(this.r, precision)],
    };
  }

  matrix(): Array<number> {
    return m2.rotationMatrix(this.r);
  }

  sub(rotToSub: Rotation = new Rotation(0, this.name)): Rotation {
    return new Rotation(this.r - rotToSub.r, this.name);
  }

  round(precision: number = 8): Rotation {
    return new Rotation(roundNum(this.r, precision), this.name);
  }

  add(rotToAdd: Rotation = new Rotation(0, this.name)): Rotation {
    return new Rotation(this.r + rotToAdd.r, this.name);
  }

  mul(rotToMul: Rotation = new Rotation(1, this.name)): Rotation {
    return new Rotation(this.r * rotToMul.r, this.name);
  }

  _dup() {
    return new Rotation(this.r, this.name);
  }
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

type TypeF1DefTranslation = {
  f1Type: 't',
  state: [string, number, number],
};
class Translation extends Point {
  x: number;
  y: number;
  name: string;

  constructor(
    txIn: Point | number | TypeF1DefTranslation,
    tyIn: number = 0,
    nameIn: string = '',
  ) {
    let name: string = nameIn;
    let tx = txIn;
    let ty = tyIn;
    if (typeof tx === 'string') {
      try {
        tx = JSON.parse(tx);
      } catch {
        tx = 0;
      }
      if (Array.isArray(tx) && tx.length === 2) {
        [tx, ty] = tx;
      }
    }
    if (tx instanceof Point) {
      super(tx.x, tx.y);
    } else if (typeof tx === 'number') {
      super(tx, ty);
    } else if (
      tx.f1Type != null
      && tx.f1Type === 't'
      && tx.state != null
      && Array.isArray(tx.state)
      && tx.state.length === 3
    ) {
      const [n, x, y] = tx.state;
      name = n;
      super(x, y);
    } else {
      super(0, 0);
    }
    this.name = name;
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

  matrix(): Array<number> {
    return m2.translationMatrix(this.x, this.y);
  }

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

  mul(translationToMul: Translation = new Translation(1, 1)): Translation {
    return new Translation(
      this.x * translationToMul.x,
      this.y * translationToMul.y,
      this.name,
    );
  }

  round(precision: number = 8): Translation {
    return new Translation(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      this.name,
    );
  }

  _dup() {
    return new Translation(this.x, this.y, this.name);
  }
}

type TypeF1DefScale = {
  f1Type: 't',
  state: [string, number, number],
};
class Scale extends Point {
  x: number;
  y: number;
  name: string;

  constructor(sxIn: Point | number | TypeF1DefScale, syIn: ?number, nameIn: string = '') {
    let name: string = nameIn;
    let sx = sxIn;
    let sy = syIn;
    if (typeof sx === 'string') {
      try {
        sx = JSON.parse(sx);
      } catch {
        sx = 0;
      }
      if (Array.isArray(sx) && sx.length === 2) {
        [sx, sy] = sx;
      }
    }
    if (sx instanceof Point) {
      super(sx.x, sx.y);
    } else if (typeof sx === 'number') {
      if (sy != null) {
        super(sx, sy);
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

  matrix(): Array<number> {
    return m2.scaleMatrix(this.x, this.y);
  }

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

  round(precision: number = 8): Scale {
    return new Scale(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      this.name,
    );
  }

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

  _dup() {
    return new Scale(this.x, this.y, this.name);
  }
}


class TransformLimit {
  rotation: number | null;
  translation: number | null;
  scale: number | null;
  constructor(
    scale: number | null,
    rotation: number | null,
    translation: number | null,
  ) {
    this.scale = scale;
    this.rotation = rotation;
    this.translation = translation;
  }

  _dup() {
    return new TransformLimit(this.scale, this.rotation, this.translation);
  }
}

class Transform {
  order: Array<Translation | Rotation | Scale>;
  mat: Array<number>;
  index: number;
  name: string;
  _type: 'transform';
  custom: ?Object;

  constructor(orderOrName: Array<Translation | Rotation | Scale> | string = [], name: string = '') {
    if (typeof orderOrName === 'string') {
      this.order = [];
      this.name = orderOrName;
    } else {
      this.order = orderOrName.map(t => t._dup());
      this.name = name;
    }
    // this.order = order.slice();
    this.index = this.order.length;
    this._type = 'transform';
    this.calcMatrix();
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const out = [];
    this.order.forEach((transformElement) => {
      out.push(transformElement._state(options));
    });
    // if (this.name !== '') {
    //   // return [this.name, ...out];
    //   out = [this.name, ...out];
    // }
    return {
      f1Type: 'tf',
      state: [
        this.name,
        ...out,
      ],
    };
  }

  standard() {
    return this.scale(1, 1).rotate(0).translate(0, 0);
  }

  translate(x: number | Point | TypeF1DefTranslation, y: number = 0, name: string = this.name) {
    const translation = new Translation(x, y, name);
    const order = this.order.slice();

    if (this.index === this.order.length) {
      order.push(translation);
    } else {
      this.order[this.index] = translation;
      this.index += 1;
      this.calcMatrix();
      return this;
    }
    return new Transform(order, name);
  }

  rotate(r: number | TypeF1DefRotation, name: string = this.name) {
    const rotation = new Rotation(r, name);
    // rotation.name = name;
    const order = this.order.slice();
    if (this.index === this.order.length) {
      order.push(rotation);
    } else {
      this.order[this.index] = rotation;
      this.index += 1;
      this.calcMatrix();
      return this;
    }
    // this.order.push(new Rotation(r));
    // this.calcMatrix();
    return new Transform(order, name);
  }

  scale(x: number | Point | TypeF1DefScale, y: number = 0, name: string = this.name) {
    const scale = new Scale(x, y, name);
    const order = this.order.slice();

    if (this.index === this.order.length) {
      order.push(scale);
    } else {
      this.order[this.index] = scale;
      this.index += 1;
      this.calcMatrix();
      return this;
    }
    return new Transform(order, name);
  }

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

  calcMatrix() {
    let m = m2.identity();
    for (let i = this.order.length - 1; i >= 0; i -= 1) {
      m = m2.mul(m, this.order[i].matrix());
    }
    // this.mat = m2.copy(m);
    // return m;
    this.mat = m;
  }

  update(index: number) {
    if (index < this.order.length) {
      this.index = index;
    }
    return this;
  }

  t(index: number = 0): ?Point {
    let count = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        if (count === index) {
          return new Point(t.x, t.y);
        }
        count += 1;
      }
    }
    return null;
  }

  clipRotation(clipTo: '0to360' | '-180to180' | null) {
    for (let i = 0; i < this.order.length; i += 1) {
      const transformStep = this.order[i];
      if (transformStep instanceof Rotation) {
        transformStep.r = clipAngle(transformStep.r, clipTo);
      }
    }
  }

  updateTranslation(x: number | Point, yOrIndex: number = 0, index: number = 0) {
    let count = 0;
    let actualIndex = index;
    if (x instanceof Point) {
      actualIndex = yOrIndex;
    }
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        if (count === actualIndex) {
          this.order[i] = new Translation(x, yOrIndex, this.name);
          this.calcMatrix();
          return this;
        }
        count += 1;
      }
    }
    return this;
  }

  s(index: number = 0): ?Point {
    let count = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Scale) {
        if (count === index) {
          return new Point(t.x, t.y);
        }
        count += 1;
      }
    }
    return null;
  }

  toDelta(
    delta: Transform,
    percent: number,
    translationStyle: 'linear' | 'curved',
    translationOptions: pathOptionsType,
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
      }
      if (stepStart instanceof Rotation && stepDelta instanceof Rotation) {
        calcTransform.order[i] = new Rotation(stepStart.r + stepDelta.r * percent);
      }
      if (stepStart instanceof Translation && stepDelta instanceof Translation) {
        calcTransform.order[i] =
          new Translation(translationPath(
            translationStyle,
            stepStart, stepDelta, percent,
            translationOptions,
          ));
      }
    }
    return calcTransform;
  }

  updateScale(x: number | Point, yOrIndex: ?number = null, index: number = 0) {
    let count = 0;
    let actualIndex = index;
    let scale = new Point(1, 1);
    if (x instanceof Point) {
      if (yOrIndex == null) {
        actualIndex = 0;
      } else {
        actualIndex = yOrIndex;
      }
      scale = x;
    } else if (yOrIndex == null) {
      scale.x = x;
      scale.y = x;
    } else {
      scale.x = x;
      scale.y = yOrIndex;
    }
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Scale) {
        if (count === actualIndex) {
          this.order[i] = new Scale(scale.x, scale.y, this.name);
          this.calcMatrix();
          return this;
        }
        count += 1;
      }
    }
    return this;
  }

  r(index: number = 0): ?number {
    let count = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Rotation) {
        if (count === index) {
          return t.r;
        }
        count += 1;
      }
    }
    return null;
  }

  updateRotation(r: number, index: number = 0): void {
    let count = 0;
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Rotation) {
        if (count === index) {
          this.order[i] = new Rotation(r, this.name);
          this.calcMatrix();
          return this;
        }
        count += 1;
      }
    }
    return this;
  }

  m(): Array<number> {
    return this.mat;
  }

  matrix(): Array<number> {
    return this.mat;
  }

  isSimilarTo(transformToCompare: Transform): boolean {
    if (transformToCompare.order.length !== this.order.length) {
      return false;
    }
    for (let i = 0; i < this.order.length; i += 1) {
      if (this.order[i].constructor.name !==
          transformToCompare.order[i].constructor.name) {
        return false;
      }
    }
    return true;
  }

  isEqualTo(transformToCompare: Transform, precision: number = 8): boolean {
    // if (transformToCompare.order.length !== this.order.length) {
    //   return false;
    // }
    if (!this.isSimilarTo(transformToCompare)) {
      return false;
    }
    for (let i = 0; i < this.order.length; i += 1) {
      const compare = transformToCompare.order[i];
      const thisTrans = this.order[i];
      if (thisTrans.constructor.name !== compare.constructor.name) {
        return false;
      }
      if ((thisTrans instanceof Translation && compare instanceof Translation
      ) || (
        thisTrans instanceof Scale && compare instanceof Scale
      )) {
        if (compare.isNotEqualTo(thisTrans, precision)) {
          return false;
        }
      }
      if (thisTrans instanceof Rotation) {
        if (compare.r !== thisTrans.r) {
          return false;
        }
      }
    }
    return true;
  }

  // Subtract a transform from the current one.
  // If the two transforms have different order types, then just return
  // the current transform.
  sub(transformToSubtract: Transform = new Transform()): Transform {
    if (!this.isSimilarTo(transformToSubtract)) {
      return new Transform(this.order, this.name);
    }
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      // $FlowFixMe (this is already fixed in isSimilarTo check above)
      order.push(this.order[i].sub(transformToSubtract.order[i]));
    }
    return new Transform(order, this.name);
  }

  // Add a transform to the current one.
  // If the two transforms have different order types, then just return
  // the current transform.
  add(transformToAdd: Transform = new Transform()): Transform {
    if (!this.isSimilarTo(transformToAdd)) {
      return new Transform(this.order, this.name);
    }
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      // $FlowFixMe (this is already fixed in isSimilarTo check above)
      order.push(this.order[i].add(transformToAdd.order[i]));
    }
    return new Transform(order, this.name);
  }

  // transform step wise multiplication
  mul(transformToMul: Transform = new Transform()): Transform {
    if (!this.isSimilarTo(transformToMul)) {
      return new Transform(this.order, this.name);
    }
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      // $FlowFixMe (this is already fixed in isSimilarTo check above)
      order.push(this.order[i].mul(transformToMul.order[i]));
    }
    return new Transform(order, this.name);
  }

  transform(transform: Transform) {
    const t = new Transform([], this.name);
    t.order = transform.order.concat(this.order);
    t.mat = m2.mul(this.matrix(), transform.matrix());
    return t;
  }

  transformBy(transform: Transform): Transform {
    const t = new Transform([], this.name);
    t.order = this.order.concat(transform.order);
    t.mat = m2.mul(transform.matrix(), this.matrix());
    return t;
  }

  round(precision: number = 8): Transform {
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      order.push(this.order[i].round(precision));
    }
    return new Transform(order, this.name);
  }

  clip(
    minTransform: Transform,
    maxTransform: Transform,
    limitLine: null | Line,
  ) {
    if (!this.isSimilarTo(minTransform) || !this.isSimilarTo(maxTransform)) {
      return this._dup();
    }
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      const min = minTransform.order[i];
      const max = maxTransform.order[i];
      if (t instanceof Translation
          && min instanceof Translation
          && max instanceof Translation) {
        const x = clipValue(t.x, min.x, max.x);
        const y = clipValue(t.y, min.y, max.y);
        order.push(new Translation(x, y, this.name));
      } else if (t instanceof Rotation
                 && min instanceof Rotation
                 && max instanceof Rotation) {
        order.push(new Rotation(clipValue(t.r, min.r, max.r), this.name));
      } else if (t instanceof Scale
                 && min instanceof Scale
                 && max instanceof Scale) {
        const x = clipValue(t.x, min.x, max.x);
        const y = clipValue(t.y, min.y, max.y);
        order.push(new Scale(x, y, this.name));
      }
    }

    const clippedTransform = new Transform(order, this.name);
    if (limitLine != null) {
      const t = clippedTransform.t();
      if (t != null) {
        const perpLine = new Line(t, 1, limitLine.angle() + Math.PI / 2);
        const { intersect } = perpLine.intersectsWith(limitLine);
        if (intersect) {
          if (intersect.isOnLine(limitLine, 4)) {
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
    zeroThresholdTransform: TransformLimit,
    maxTransform: TransformLimit,
    vector: boolean = true,
  ): Transform {
    // const min = 0.00001;
    // const max = 1 / min;
    // const zeroS = zeroThresholdTransform.s() || new Point(min, min);
    // const zeroR = zeroThresholdTransform.r() || min;
    // const zeroT = zeroThresholdTransform.t() || new Point(min, min);
    // const maxS = maxTransform.s() || new Point(max, max);
    // const maxR = maxTransform.r() || max;
    // const maxT = maxTransform.t() || new Point(max, max);
    // if (!this.isSimilarTo(zeroThresholdTransform) ||
    //     !this.isSimilarTo(maxTransform)) {
    //   return new Transform(this.order);
    // }
    const order = [];
    const z = zeroThresholdTransform;
    const max = maxTransform;

    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        if (vector) {
          const { mag, angle } = t.toPolar();
          const clipM = clipMag(mag, z.translation, max.translation);
          order.push(new Translation(
            clipM * Math.cos(angle),
            clipM * Math.sin(angle),
            this.name,
          ));
        } else {
          const x = clipMag(t.x, z.translation, max.translation);
          const y = clipMag(t.y, z.translation, max.translation);
          order.push(new Translation(x, y, this.name));
        }
      } else if (t instanceof Rotation) {
        const r = clipMag(t.r, z.rotation, max.rotation);
        order.push(new Rotation(r, this.name));
      } else if (t instanceof Scale) {
        if (vector) {
          const { mag, angle } = t.toPolar();
          const clipM = clipMag(mag, z.scale, max.scale);
          order.push(new Scale(
            clipM * Math.cos(angle),
            clipM * Math.sin(angle),
            this.name,
          ));
        } else {
          const x = clipMag(t.x, z.scale, max.scale);
          const y = clipMag(t.y, z.scale, max.scale);
          order.push(new Scale(x, y, this.name));
        }
      }
    }
    return new Transform(order, this.name);
  }

  constant(constant: number = 0): Transform {
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

  isZero(zeroThreshold: number = 0): boolean {
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation || t instanceof Scale) {
        if (t.x > zeroThreshold || t.y > zeroThreshold) {
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

  _dup(): Transform {
    const t = new Transform(this.order, this.name);
    t.index = this.index;
    return t;
  }

  decelerate(
    velocity: Transform,
    deceleration: Transform,
    deltaTime: number,
    zeroThreshold: Transform,
  ): { v: Transform, t: Transform } {
    let nextV = new Transform();
    let nextT = new Transform();
    // const z = zeroThreshold;
    // const d = deceleration;
    const makeMag = (transformation: Translation | Scale | Rotation) => {
      if (transformation instanceof Rotation) {
        return transformation.r;
      }
      return Math.sqrt(transformation.x ** 2 + transformation.y ** 2);
    };
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      const v = velocity.order[i];
      const d = deceleration.order[i];
      const z = zeroThreshold.order[i];
      // const z = zeroThreshold.order[i];
      if (t instanceof Translation && v instanceof Translation) {
        const { mag, angle } = v.toPolar();
        const next = decelerate(0, mag, makeMag(d), deltaTime, makeMag(z));
        nextV = nextV.translate(next.v * Math.cos(angle), next.v * Math.sin(angle));
        nextT = nextT.translate(t.x + next.p * Math.cos(angle), t.y + next.p * Math.sin(angle));
      } else if (t instanceof Rotation && v instanceof Rotation) {
        const r = decelerate(t.r, v.r, makeMag(d), deltaTime, makeMag(z));
        nextV = nextV.rotate(r.v);
        nextT = nextT.rotate(r.p);
      } else if (t instanceof Scale && v instanceof Scale) {
        const { mag, angle } = v.toPolar();
        const next = decelerate(0, mag, makeMag(d), deltaTime, makeMag(z));
        nextV = nextV.scale(next.v * Math.cos(angle), next.v * Math.sin(angle));
        nextT = nextT.scale(t.x + next.p * Math.cos(angle), t.y + next.p * Math.sin(angle));
      } else {
        return { v: new Transform(), t: new Transform() };
      }
    }
    return { v: nextV, t: nextT };
  }

  decelerateLegacy(
    velocity: Transform,
    deceleration: TransformLimit,
    deltaTime: number,
    zeroThreshold: TransformLimit,
  ): { v: Transform, t: Transform } {
    let nextV = new Transform();
    let nextT = new Transform();
    const z = zeroThreshold;
    const d = deceleration;
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      const v = velocity.order[i];
      // const z = zeroThreshold.order[i];
      if (t instanceof Translation && v instanceof Translation) {
        const { mag, angle } = v.toPolar();
        const next = decelerate(0, mag, d.translation, deltaTime, z.translation);
        nextV = nextV.translate(next.v * Math.cos(angle), next.v * Math.sin(angle));
        nextT = nextT.translate(t.x + next.p * Math.cos(angle), t.y + next.p * Math.sin(angle));
      } else if (t instanceof Rotation && v instanceof Rotation) {
        const r = decelerate(t.r, v.r, d.rotation, deltaTime, z.rotation);
        nextV = nextV.rotate(r.v);
        nextT = nextT.rotate(r.p);
      } else if (t instanceof Scale && v instanceof Scale) {
        const { mag, angle } = v.toPolar();
        const next = decelerate(0, mag, d.scale, deltaTime, z.scale);
        nextV = nextV.scale(next.v * Math.cos(angle), next.v * Math.sin(angle));
        nextT = nextT.scale(t.x + next.p * Math.cos(angle), t.y + next.p * Math.sin(angle));
      } else {
        return { v: new Transform(), t: new Transform() };
      }
    }
    return { v: nextV, t: nextT };
  }

  // Return the velocity of each element in the transform
  // If the current and previous transforms are inconsistent in type order,
  // then a transform of value 0, but with the same type order as "this" will
  // be returned.
  velocity(
    previousTransform: Transform,
    deltaTime: number,
    zeroThreshold: TransformLimit,
    maxTransform: TransformLimit,
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

    // let z = zeroThreshold;
    // let m = maxTransform;
    // if (!this.isSimilarTo(zeroThreshold)) {
    //   z = this.constant(0);
    // }
    // if (!this.isSimilarTo(maxTransform)) {
    //   m = v._dup();
    // }
    return v.clipMag(zeroThreshold, maxTransform);
  }

  identity() {
    const order = [];
    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        order.push(new Translation(0, 0, this.name));
      } else if (t instanceof Rotation) {
        order.push(new Rotation(0, this.name));
      } else if (t instanceof Scale) {
        order.push(new Scale(1, 1, this.name));
      }
    }
    return new Transform(order, this.name);
  }
}

export type TypeF1DefTransform = {
  f1Type: 'tf',
  state: Array<string | TypeF1DefTranslation | TypeF1DefRotation | TypeF1DefScale>,
};

export type TypeParsableTransform = Array<string | ['s', number, number] | ['r', number] | ['t', number, number]> | string | Transform | TypeF1DefTransform;

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

function polarToRect(mag: number, angle: number) {
  return new Point(
    mag * Math.cos(angle),
    mag * Math.sin(angle),
  );
}

function rectToPolar(x: number | Point, y: number = 0) {
  let rect;
  if (typeof x === 'number') {
    rect = new Point(x, y);
  } else {
    rect = x;
  }
  const mag = rect.distance();
  let angle = Math.atan2(rect.y, rect.x);
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  return {
    mag,
    angle,
  };
}
// $FlowFixMe
function getBoundingRect(pointArrays: Array<Point> | Array<Array<Point>>) {
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
  return new Rect(
    result.min.x,
    result.min.y,
    result.max.x - result.min.x,
    result.max.y - result.min.y,
  );
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
        const xTime = Math.abs(delta.x) / v.x;
        const yTime = Math.abs(delta.y) / v.y;
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
  translationVelocity: Point = new Point(0.25, 0.25),   // 0.5 diagram units/s
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
  let maxTime = 0;
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
    if (time > maxTime) {
      maxTime = time;
    }
  });
  return maxTime;
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

  constructor(boundary: Object, precision: number = 8) {
    this.boundary = boundary;
    this.precision = precision;
  }

  contains(position: number | Point) {
    return true;
  }

  intersect(position: number | Point, direction: number = 0) {
    return {
      position,
      distance: 0,
      direction,
    }
  }

  clip(position: number | Point) {
    return position;
  }

  clipVelocity(velocity: Point | number) {
    return velocity;
  }
}

class BoundsRange extends Bounds {
  boundary: { min: number, max: number }

  contains(position: number | Point) {
    if (!(typeof position === 'number')) {
      return false;
    }
    if (position >= this.boundary.min && position <= this.boundary.max) {
      return true;
    }
    return false;
  }

  containsShaddow() {
    return true;
  }

  intersect(position: number | Point, direction: number = 1) {
    if (!(typeof position === 'number')) {
      return {
        position,
        distance: 0,
        direction: -1,
      };
    }
    if (direction === -1 || round(direction, this.precision) === round(Math.PI, this.precision)) {
      return {
        position: this.boundary.min,
        distance: Math.abs(position - this.boundary.min),
        direction: 1,
      };
    }
    return {
      position: this.boundary.max,
      distance: Math.abs(this.boundary.max - position),
      direciton: -1,
    };
  }

  clip(position: number | Point) {
    if (!(typeof position === 'number')) {
      return position;
    }
    if (position < this.boundary.min) {
      return this.boundary.min;
    }
    if (position > this.boundary.max) {
      return this.boundary.max;
    }
    return position;
  }

  clipVelocity(position: number | Point) {
    return position;
  }
}

class BoundsRect extends Bounds {
  boundary: Rect;

  constructor(
    leftOrRect: number | Rect,
    bottomOrPrecision: number = 8,
    width: number = 0,
    height: number = 0,
    precisionIn: 8,
  ) {
    let boundary;
    let precision;
    if (typeof leftOrRect === 'number') {
      boundary = new Rect(leftOrRect, bottomOrPrecision, width, height);
      precision = precisionIn;
    } else {
      boundary = leftOrRect;
      precision = bottomOrPrecision;
    }
    super(boundary, precision);
  }

  contains(position: number | Point) {
    if (typeof position === 'number') {
      return false;
    }
    return this.boundary.isPointInside(position, this.precision);
  }

  clip(position: number | Point) {
    if (typeof position === 'number') {
      return position;
    }
    const bounds = this.boundary;
    let { x, y } = position;
    if (position.x < bounds.left) {
      x = bounds.left;
    } else if (position.x > bounds.right) {
      x = bounds.right;
    }
    if (position.y < bounds.bottom) {
      y = bounds.bottom;
    } else if (position.y > bounds.top) {
      y = bounds.top;
    }
    return new Point(x, y);
  }

  intersect(position: number | Point, direction: number = 0) {
    if (typeof position === 'number') {
      return {
        position,
        distance: 0,
        direction,
      };
    }
    const ang = direction;
    const trajectory = new Line(position, 1, ang);
    let hBound;
    let vBound;
    let xMirror = 1;
    let yMirror = 1;
    let intersectPoint;
    let distanceToBound = 0;
    const bounds = this.boundary;
    if (ang > 0 && ang < Math.PI) {
      hBound = new Line([bounds.left, bounds.top], [bounds.right, bounds.top]);
    } else if (ang > Math.PI) {
      hBound = new Line([bounds.left, bounds.bottom], [bounds.right, bounds.bottom]);
    }
    if (ang > Math.PI / 2 && ang < Math.PI / 2 * 3) {
      vBound = new Line([bounds.left, bounds.bottom], [bounds.left, bounds.top]);
    } else if ((ang >= 0 && ang < Math.PI / 2) || ang > Math.PI / 2 * 3) {
      vBound = new Line([bounds.right, bounds.bottom], [bounds.right, bounds.top]);
    }
    if (vBound != null) {
      const result = trajectory.intersectsWith(vBound);
      if (result.intersect != null) {
        intersectPoint = result.intersect;
        distanceToBound = distance(position, intersectPoint);
        xMirror = -1;
      }
    }
    if (hBound != null) {
      const result = trajectory.intersectsWith(hBound);
      if (result.intersect != null) {
        const distanceToBoundH = distance(position, result.intersect);
        if (intersectPoint == null) {
          intersectPoint = result.intersect;
          distanceToBound = distanceToBoundH;
          xMirror = 1;
          yMirror = -1;
        } else if (distanceToBoundH < distanceToBound) {
          intersectPoint = result.intersect;
          distanceToBound = distanceToBoundH;
          xMirror = 1;
          yMirror = -1;
        } else if (
          roundNum(distanceToBoundH, this.precision) === roundNum(distanceToBound, this.precision)
        ) {
          xMirror = -1;
          yMirror = -1;
        }
      }
    }
    if (intersectPoint == null) {
      return {
        position,
        distance: 0,
        direction: ang,
      };
    }
    // let reflectionAngle = ang;
    const reflection = polarToRect(1, ang);
    if (xMirror === -1) {
      reflection.x *= -1;
    }
    if (yMirror === -1) {
      reflection.y *= -1;
    }

    return {
      position: intersectPoint,
      distance: intersectPoint.distance(position),
      direction: rectToPolar(reflection).angle,
    };
  }

  clipVelocity(velocity: Point | number) {
    return velocity;
  }
}

class BoundsLine extends Bounds {
  boundary: Line;

  constructor(
    pointOrLine: TypeParsablePoint | Line,
    p2OrMagOrPrecision: TypeParsablePoint | number,
    angle: number = 0,
    precisionIn: 8,
  ) {
    let boundary;
    let precision;
    if (!(pointOrLine instanceof Line)) {
      boundary = new Line(pointOrLine, p2OrMagOrPrecision, angle);
      precision = precisionIn;
    } else {
      boundary = pointOrLine;
      precision = p2OrMagOrPrecision;
    }
    super(boundary, precision);
  }

  contains(position: number | Point) {
    if (typeof position === 'number') {
      return false;
    }
    return position.isOnLine(this.boundary, this.precision);
  }

  containsShaddow(position: Point) {
    return position.shaddowIsOnLine(this.boundary, this.precision);
  }

  clip(position: number | Point) {
    if (typeof position === 'number') {
      return position;
    }
    return position.clipToLine(this.boundary, this.precision);
  }

  intersect(p: number | Point, direction: number = 0) {
    if (typeof p === 'number') {
      return { p, distance: 0, direction };
    }
    const bounds = this.boundary;
    const v1 = new Line(p, bounds.p1);
    const v2 = new Line(p, bounds.p2);
    if (Math.abs(v1.ang - direction) < Math.abs(v2.ang - direction)) {
      return {
        position: bounds.p1._dup(),
        direction: direction + Math.PI,
        distance: p.distance(bounds.p1),
      };
    }
    return {
      position: bounds.p2._dup(),
      direction: direction + Math.PI,
      distance: p.distance(bounds.p2),
    };
    // debugger;
    // const ang = direction;
    // // const trajectory = new Line(p, 1, ang);
    // let xMirror = 1;
    // let yMirror = 1;
    // let intersectPoint;
    // let distanceToBound = 0;

    // if (bounds instanceof Line) {
    //   xMirror = -1;
    //   yMirror = -1;
    //   const distanceToP1 = distance(p, bounds.p1);
    //   const distanceToP2 = distance(p, bounds.p2);
    //   // let boundPoint;
    //   if (distanceToP1 > distanceToP2) {
    //     intersectPoint = bounds.p2._dup();
    //   } else {
    //     intersectPoint = bounds.p1._dup();
    //   }
    //   if (intersectPoint != null) {
    //     distanceToBound = distance(p, intersectPoint);
    //   }
    // }
    // if (intersectPoint == null) {
    //   return {
    //     position: p,
    //     distance: 0,
    //     direction,
    //   };
    // }

    // const reflection = polarToRect(1, ang);
    // if (xMirror === -1) {
    //   reflection.x *= -1;
    // }
    // if (yMirror === -1) {
    //   reflection.y *= -1;
    // }

    // return {
    //   position: intersectPoint,
    //   distance: distanceToBound,
    //   direction: rectToPolar(reflection).angle,
    // };
  }

  clipVelocity(velocity: number | Point) {
    if (typeof velocity === 'number') {
      return velocity;
    }
    const unitVector = new Vector(this.boundary).unit();
    let projection = unitVector.dotProduct(new Vector([0, 0], velocity));
    let { ang } = this.boundary;
    if (projection < -1) {
      ang += Math.PI;
      projection = -projection;
    }
    return polarToRect(projection, ang);
  }
}

// class Bounds {
//   boundary: Rect | Line | { min: number, max: number } | Object;

//   constructor(boundary: Rect | Line |  { min: number, max: number } | Object) {
//     this.boundary = boundary;
//   }

//   contains(position: number | TypeParsablePoint) {
//     if (position )
//   }
// }

// function clipPointToBounds(
//   p: Point,
//   bounds: Bounds | null,
//   precision: number = 8,
// ) {
//   if (bounds == null) {
//     return point;
//   }
//   let { x, y } = p;
//   if (bounds instanceof Line && !p.shaddowIsOnLine(bounds, precision)) {
//     const p1Distance = p.distance(bounds.p1);
//     const p2Distance = p.distance(bounds.p2);
//     if (p1Distance < p2Distance) {
//       ({ x, y } = bounds.p1);
//     } else {
//       ({ x, y } = bounds.p2);
//     }
//     return new Point(x, y);
//   }
//   if (bounds instanceof Rect && !bounds.isPointInside(p)) {
//     if (p.x < bounds.left) {
//       x = bounds.left;
//     } else if (p.x > bounds.right) {
//       x = bounds.right;
//     }
//     if (p.y < bounds.bottom) {
//       y = bounds.bottom;
//     } else if (p.y > bounds.top) {
//       y = bounds.top;
//     }
//   }
//   return new Point(x, y);
// }

function intersectWithBounds(
  p: Point,
  ang: number,
  bounds: Rect | Line,
  precision: number = 8,
) {
  const trajectory = new Line(p, 1, ang);
  let hBound;
  let vBound;
  let xMirror = 1;
  let yMirror = 1;
  let intersectPoint;
  let distanceToBound = 0;
  if (bounds instanceof Rect) {
    if (ang > 0 && ang < Math.PI) {
      hBound = new Line([bounds.left, bounds.top], [bounds.right, bounds.top]);
    } else if (ang > Math.PI) {
      hBound = new Line([bounds.left, bounds.bottom], [bounds.right, bounds.bottom]);
    }
    if (ang > Math.PI / 2 && ang < Math.PI / 2 * 3) {
      vBound = new Line([bounds.left, bounds.bottom], [bounds.left, bounds.top]);
    } else if ((ang >= 0 && ang < Math.PI / 2) || ang > Math.PI / 2 * 3) {
      vBound = new Line([bounds.right, bounds.bottom], [bounds.right, bounds.top]);
    }
    if (vBound != null) {
      const result = trajectory.intersectsWith(vBound);
      if (result.intersect != null) {
        intersectPoint = result.intersect;
        distanceToBound = distance(p, intersectPoint);
        xMirror = -1;
      }
    }
    if (hBound != null) {
      const result = trajectory.intersectsWith(hBound);
      if (result.intersect != null) {
        const distanceToBoundH = distance(p, result.intersect);
        if (intersectPoint == null) {
          intersectPoint = result.intersect;
          distanceToBound = distanceToBoundH;
          xMirror = 1;
          yMirror = -1;
        } else if (distanceToBoundH < distanceToBound) {
          intersectPoint = result.intersect;
          distanceToBound = distanceToBoundH;
          xMirror = 1;
          yMirror = -1;
        } else if (roundNum(distanceToBoundH, precision) === roundNum(distanceToBound, precision)) {
          xMirror = -1;
          yMirror = -1;
        }
      }
    }
  }
  if (bounds instanceof Line) {
    xMirror = -1;
    yMirror = -1;
    const distanceToP1 = distance(p, bounds.p1);
    const distanceToP2 = distance(p, bounds.p2);
    let boundPoint;
    if (distanceToP1 > distanceToP2) {
      intersectPoint = bounds.p2._dup();
    } else {
      intersectPoint = bounds.p1._dup();
    }
    if (intersectPoint != null) {
      distanceToBound = distance(p, intersectPoint);
    }
  }
  if (intersectPoint == null) {
    return {
      intersect: p,
      distance: 0,
    };
  }
  return {
    intersect: intersctPoint,
    distance: distanceToBound,
  };
}

function decelerateValue(
  value: number,
  velocity: number,
  deceleration: number,
  deltaTime: number | null = null,
  bounds: ?Bounds = null,
  bounceLoss: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
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
  if (result.duration != null) {
    return {
      duration: result.duration,
      value: result.position.x,
    };
  }
  return {
    value: result.position.x,
    velocity: result.velocity.x,
  };
}

// class Position {
//   position
//   // type: 'value' | 'point';
//   // mag: number;
//   // angle: number;

//   constructor(magOrValueOrPoint: TypeParsablePoint | number, angleIn: ?number = null) {
//     if (typeof magOrValueOrPoint === 'number' && angleIn == null) {
//       this.mag = magOrValueOrPoint;
//       this.type = 'value';
//       this.angle = 0;
//     } else if (typeof magOrValueOrPoint === 'number' && angleIn != null) {
//       this.mag = magOrValueOrPoint;
//       this.angle = angleIn;
//       this.type = 'point';
//     } else {
//       const { mag, angle } = rectToPolar(magOrValueOrPoint);
//       this.mag = mag;
//       this.angle = angle;
//       this.type = 'point';
//     }
//   }

//   polar() {
//     return { mag: this.mag, angle: this.angle };
//   }

//   rect() {
//     return polarToRect(this.mag, this.angle);
//   }

  
//   decelerate(
//     initialPosition: Point | number,
//     deceleration: number,
//     deltaTime: number,
//     zeroPointThreshold: number = 0,
//     bounds: Bounds | null = null,
//   ): { position: Point | number } {}

//   atZero(
//     deceleration: number,
//     zeroPointThreshold: number = 0,
//   ): { duration: number, displacement: number } {}
// }

function deceleratePoint(
  positionIn: Point,
  velocityIn: Point,
  deceleration: number,
  deltaTimeIn: number | null = null,
  bounds: ?Bounds = null,  // ?(Rect | Line) = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {

  // clip velocity to the dimension of interest
  let velocity = velocityIn;
  if (bounds != null) {
    velocity = bounds.clipVelocity(velocityIn);
  }

  let stopFlag = false;
  if (deltaTimeIn == null) {
    stopFlag = true;
  }

  // Get the mag and angle of the velocity and check if under the zero threshold
  const { mag, angle } = velocity.toPolar();
  if (mag <= zeroVelocityThreshold) {
    if (stopFlag) {
      return {
        duration: 0,
        positionIn,
      };
    }
    return {
      velocity: new Point(0, 0),
      positionIn,
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
  // if (deltaTimeIn == null) {
  //   deltaTime = Math.abs(deltaV / deceleration);
  // } else {
  //   deltaTime = deltaTimeIn;
  // }

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
      };
    }
    let v1 = v0 - deceleration * deltaTime;
    if (v1 <= zeroVelocityThreshold) {
      v1 = 0;
    }
    return {
      position: newPosition,
      velocity: polarToRect(v1, angle),
    };
  }

  // if we got here, the new position is out of bounds
  const bounceScaler = 1 - bounceLossIn;
  const result = bounds.intersect(position, clipAngle(angle, '0to360'));
  const intersectPoint = result.position;
  const distanceToBound = result.distance;
  const reflectionAngle = result.direction;

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
    if (stopFlag) {
      return {
        duration: t,
        position: intersectPoint,
      }
    }
    return {
      velocity: new Point(0, 0),
      position: intersectPoint,
    }
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
    return {
      duration: t + newStop.duration,
      position: newStop.position,
    };
  }
  return deceleratePoint(
    intersectPoint, rectBounceVelocity, deceleration, deltaTime - t, bounds,
    bounceLossIn, zeroVelocityThreshold, precision,
  );
}


// function calculateStopAngle(
//   angle: number,
//   velocity: number,
//   deceleration: number,
//   bounds: [number, number],
//   bounceLossIn: number = 0,
//   zeroVelocityThreshold: number = 0,
//   precision: number = 8,
// ) {
//   return calculateStop(
//     new Point(angle, 0),
//     new Point(angle, 0),
//     deceleration,
//     new Rect(bounds[0], -1, bounds[1] - bounds[0], 2),
//     bounceLossIn,
//     zeroVelocityThreshold,
//     precision,
//   );
// }

type TypeSimpleDefinition = {
  rotation?: number;
  position?: number;
  translation?: number;
  transform?: Transform;    // mag of (x, y) is used
  scale?: number;
}

type TypeVelocity = TypeSimpleDefinition; // where for transform mag of (x, y) is used as velocity

type TypeDeceleration = TypeSimpleDefinition; // where for transform mag of (x, y) is used as velocity


// type TypeValueDefinition = {
//   rotation?: number;
//   position?: TypeParsablePoint;
//   translation?: TypeParsablePoint;
//   transform?: TypeParsableTransform;
//   scale?: TypeParsablePoint | number;
//   color?: Array<number>;
//   opacity?: number;
// }

class Limit {
  max: TypeSimpleDefinition;
  min: TypeSimpleDefinition;
  boundary: Rect;
  line: Line;
};

function simpleDefinitionToTransform(
  transform: Transform,
  simpleDefinition: TypeSimpleDefinition | TypeParsableTransform = {},
  defaultSimpleDefinition: {
    rotation: number,
    position: TypeParsablePoint,
    scale: number,
  } = {
    rotation: 0,
    position: [0, 0],
    scale: 1,
  },
) {
  const parsedTransform = parseTransform(simpleDefinition, null);
  if (parsedTransform != null) {
    return parsedTransform;
  }

  if (simpleDefinition.transform != null) {
    return simpleDefinition.transform._dup();
  }

  const values = joinObjects({}, defaultSimpleDefinition, simpleDefinition);

  const newTransform = transform._dup();
  for (let i = 0; i < transform.order.length; i += 1) {
    const transformation = transform.order[i];
    if (transformation instanceof Translation) {
      transform.order[i] = new Translation(getPosition(value.position));
      if (value.translation != null) {
        transform.order[i] = new Translation(getPosition(value.translation));
      }
    } else if (transformation instanceof Scale) {

    } else if (transformation instanceof Rotation) {
      
    }
  }
  return newTransform;
}

class MovingFreelyTransform {
  // transform: Transform;
  velocity: Transform;
  deceleration: Transform;
  zeroVelocityThreshold: Transform;
  bounds: {
    max?: Transform;
    min?: Transform;
    line?: Line;
    bounce?: boolean;
    bounceLoss?: Transform;
  };

  constructor(optionsIn: {
    transform: TypeParsableTransform,
    velocity?: TypeParsableTransform | TypeSimpleDefinition,
    deceleration?: TypeParsableTransform | TypeSimpleDefinition,
    zeroVelocityThreshold?: TypeParsableTransform | TypeSimpleDefinition,
    bounds?: {
      max?: TypeParsableTransform | TypeSimpleDefinition,
      min?: TypeParsableTransform | TypeSimpleDefinition,
      line?: TypeParsableLine,
      bounce?: boolean,
      bounceLoss?: TypeParsableTransform | TypeSimpleDefinition,
    }
  }) {
    const transform = getTransform(optionsIn.transform);
    this.velocity = simpleDefinitionToTransform(
      transform,
      optionsIn.velocity,
      { rotation: 0, position: [0, 0], scale: 0 },
    );
    this.deceleration = simpleDefinitionToTransform(
      transform,
      optionsIn.deceleration,
      { rotation: 1, position: [1, 0], scale: 1 },
    );
    this.zeroVelocityThreshold = simpleDefinitionToTransform(
      transform,
      optionsIn.zeroVelocityThreshold,
      { rotation: 0.0001, position: [0.0001, 0.0001], scale: 0.0001 },
    );
    const { bounds } = optionsIn;
    if (bounds != null) {
      this.bounds = {};
      if (bounds.max != null) {
        this.bounds.max = simpleDefinitionToTransform(
          transform,
          bounds.max,
          { position: [1000, 1000], rotation: 1000, scale: 1000 },
        );
      }
      if (bounds.min != null) {
        this.bounds.min = simpleDefinitionToTransform(
          transform,
          bounds.max,
          { position: [-1000, -1000], rotation: -1000, scale: -1000 },
        );
      }
      if (bounds.line != null) {
        this.bounds.line = getLine(bounds.line);
      }
      if (bounds.bounce != null) {
        this.bounds.bounce = bounds.bounce;
      } else {
        this.bounds.bounds = false;
      }
      if (bounds.bounceLoss != null) {
        this.bounds.bounceLoss = bounds.bounceLoss;
      } else {
        this.bounds.bounceLoss = 0;
      }
    }
  }

  decelerate(transform: Transform, deltaTime: number) {
    const next = transform.decelerate(
      this.velocity,
      this.deceleration,
      deltaTime,
      this.zeroVelocityThreshold,
    );
    if (deltaTime > 0) {
      for (let i = 0; i < next.t.order.length; i += 1) {
        const t = next.t.order[i];
        const min = this.move.minTransform.order[i];
        const max = this.move.maxTransform.order[i];
        const v = next.v.order[i];
        if ((t instanceof Translation
            && v instanceof Translation
            && max instanceof Translation
            && min instanceof Translation)
          || (t instanceof Scale
            && v instanceof Scale
            && max instanceof Scale
            && min instanceof Scale)
        ) {
          let onLine = true;
          if (this.move.limitLine != null) {
            onLine = t.shaddowIsOnLine(this.move.limitLine, 4);
          }
          if (min.x >= t.x || max.x <= t.x || !onLine) {
            if (this.move.bounce) {
              v.x = -v.x * 0.5;
            } else {
              v.x = 0;
            }
          }
          if (min.y >= t.y || max.y <= t.y || !onLine) {
            if (this.move.bounce) {
              v.y = -v.y * 0.5;
            } else {
              v.y = 0;
            }
          }
          next.v.order[i] = v;
        }
        if (t instanceof Rotation
            && v instanceof Rotation
            && max instanceof Rotation
            && min instanceof Rotation) {
          if (min.r >= t.r || max.r <= t.r) {
            if (this.move.bounce) {
              v.r = -v.r * 0.5;
            } else {
              v.r = 0;
            }
          }
          next.v.order[i] = v;
        }
      }
      next.v.calcMatrix();
    }
    return {
      velocity: next.v,
      transform: next.t,
    };
  }

  calculateEnd() {}

  isStopped() {}
}

export {
  point,
  Point,
  line,
  Line,
  distance,
  minAngleDiff,
  deg,
  normAngle,
  Transform,
  TransformLimit,
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
  // getState,
  // getDef,
  getLine,
  // calculateStop,
  // calculateStopAngle,
  deceleratePoint,
  decelerateValue,
  BoundsRect,
  BoundsLine,
  Vector,
  // pointDeceleration,
  // setState,
};
