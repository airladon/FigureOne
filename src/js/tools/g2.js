// @flow

import {
  roundNum, decelerate, clipMag, clipValue, rand2D, round,
} from './math';
import { joinObjects } from './tools';
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

  round(precision: number = 8) {
    return new Rect(
      roundNum(this.left, precision), roundNum(this.bottom, precision),
      roundNum(this.width, precision), roundNum(this.height, precision),
    );
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
  isWithinLine(l: Line, precision?: number) {
    return l.hasPointOn(this, precision);
  }

  getShaddowOnLine(l: Line, precision: number = 8) {
    const shaddow = new Line(this, 1, l.angle() + Math.PI / 2);
    const { intersect } = shaddow.intersectsWith(l);
    // console.log(intersect, inLine, alongLine, )
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

class Line {
  p1: Point;
  p2: Point;
  ang: number;
  A: number;
  B: number;
  C: number;
  distance: number;
  ends: 2 | 1 | 0;

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

  getYIntercept() {
    return this.getYFromX(0);
  }

  getXIntercept() {
    return this.getXFromY(0);
  }

  getGradient() {
    if (this.B === 0) {
      return null;
    }
    return -this.A / this.B
  }

  angle() {
    return this.ang;
  }

  round(precision?: number = 8) {
    const lineRounded = new Line(this.p1, this.p2, 0, this.ends);
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

  hasPointAlong(pIn: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(pIn);
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
  distanceToPoint(pIn: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(pIn);
    return roundNum(
      Math.abs(this.A * p.x + this.B * p.y - this.C) / Math.sqrt(this.A ** 2 + this.B ** 2),
      precision,
    );
  }

  hasPointOn(pIn: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(pIn);
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

  // isWithinLine
  // hasLineWithin
  // isAlongLine
  // isParrallelToLine
  // isPerpendicularToLine

  // hasLineOn(line2: Line, precision: number = 8) {
  //   return line2.isOn(this, precision);
  // }

  hasLineWithin(line2: Line, precision: number = 8) {
    return line2.isWithinLine(this, precision);
  }

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
    return new Line(p1, p2, 0, this.ends);
  }

  // If two lines are parallel, their determinant is 0
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
  reflectsOn(l: Line, precision: number = 8) {
    const { intersect } = this.intersectsWith(l, precision);
    if (intersect == null) {
      return null;
    }
    const perpendicular = new Line(intersect, 1, l.ang + Math.PI / 2);
    const shaddow = this.p1.getShaddowOnLine(perpendicular, precision);
    const p1ToShaddow = new Line(this.p1, shaddow);
    const distance = p1ToShaddow.distance;
    // const distance = shaddow.distance(this.p1);
    const projection = Point(
      this.p1.x + distance * 2 * Math.cos(p1ToShaddow.ang),
      this.p1.y + distance * 2 * Math.sin(p1ToShaddow.ang),
    );
    return new Line(intersect, project);
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
  intersectsWith(line2: Line, precision: number = 8) {
    const l2 = line2; // line2.round(precision);
    const l1 = this;  // this.round(precision);

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
    const defaultIntercept = yIntercept == null ? new Point(xIntercept, 0) : new Point(0, yIntercept);

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
    let withinLine;
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
  f1Type: 'p',
  state: [[number, number], [number, number], 2 | 1 | 0],
};

export type TypeParsableLine = [TypeParsablePoint, TypeParsablePoint, 2 | 1 | 0]
                                | [TypeParsablePoint, TypeParsablePoint]
                                | [Point, number, number, 2 | 1 | 0]
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
    if (l.length === 4) {
      return new Line(getPoint(l[0]), l[1], l[2], l[3]);
    }
    if (l.length === 3) {
      if (typeof l[1] === 'number') {
        return new Line(getPoint(l[0]), l[1], l[2]);
      }
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

// To Update tests
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
        calcTransform.order[i] = new Rotation(stepStart.r + stepDelta.r * percent, stepStart.name);
      }
      if (stepStart instanceof Translation && stepDelta instanceof Translation) {
        calcTransform.order[i] =
          new Translation(translationPath(
            translationStyle,
            stepStart, stepDelta, percent,
            translationOptions,
          ), 0, stepStart.name);
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
    const z = transformValueToArray(zeroThresholdTransform, this);
    // const max = maxTransform;
    const max = transformValueToArray(maxTransform, this);

    for (let i = 0; i < this.order.length; i += 1) {
      const t = this.order[i];
      if (t instanceof Translation) {
        if (vector) {
          const { mag, angle } = t.toPolar();
          const clipM = clipMag(mag, z[i], max[i]);
          order.push(new Translation(
            clipM * Math.cos(angle),
            clipM * Math.sin(angle),
            this.name,
          ));
        } else {
          const x = clipMag(t.x, z[i], max[i]);
          const y = clipMag(t.y, z[i], max[i]);
          order.push(new Translation(x, y, this.name));
        }
      } else if (t instanceof Rotation) {
        const r = clipMag(t.r, z[i], max[i]);
        order.push(new Rotation(r, this.name));
      } else if (t instanceof Scale) {
        const x = clipMag(t.x, z[i], max[i]);
        const y = clipMag(t.y, z[i], max[i]);
        order.push(new Scale(x, y, this.name));
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
    decelerationIn: TypeTransformValue,
    deltaTime: number | null,
    boundsIn: TypeTransformBounds | TypeTransformBoundsDefinition,
    bounceLossIn: TypeTransformValue,
    zeroVelocityThresholdIn: TypeTransformValue,
    precision: number = 8,
  ): { velocity: Transform, transform: Transform, duration: number } {
    const deceleration = transformValueToArray(decelerationIn, this);
    const bounceLoss = transformValueToArray(bounceLossIn, this);
    const zeroVelocityThreshold = transformValueToArray(zeroVelocityThresholdIn, this);
    let bounds;
    if (boundsIn instanceof TransformBounds) {
      bounds = boundsIn;
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
    bounds: TypeTransformBounds | TypeTransformationBoundsDefinition,
    bounceLoss: TypeTransformValue,
    zeroVelocityThreshold: TypeTransformValue,
    precision: number = 8,
  ): { velocity: Transform, transform: Transform, duration: number } {
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
type TypeRangeBoundsDefinition = {
  min?: number,
  max?: number,
  precision?: number,
  bounds?: 'inside' | 'outside',
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

type TypeRectBoundsDefinition = {
  left?: number | null,
  bottom?: number | null,
  right?: number | null,
  top?: number | null,
  bounds?: 'inside' | 'outside',
  precision?: number,
};

class RectBounds extends Bounds {
  boundary: {
    left: null | number,
    right: null | number,
    bottom: null | number,
    top: null | number,
  };

  constructor(optionsIn: TypeRectBoundsDefinition) {
    const defaultOptions = {
      left: null,
      right: null,
      top: null,
      bottom: null,
      bounds: 'inside',
      precision: 8,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);

    const boundary = {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
    };
    super(boundary, options.bounds, options.precision);
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return false;
    }
    const p = getPoint(position);
    if (this.boundary.left != null && p.x < this.boundary.left) {
      return false;
    }
    if (this.boundary.right != null && p.x > this.boundary.right) {
      return false;
    }
    if (this.boundary.bottom != null && p.y < this.boundary.bottom) {
      return false;
    }
    if (this.boundary.top != null && p.y > this.boundary.top) {
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
    let d;
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

type TypeLineBoundsDefinition = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  line?: TypeParsableLine,
  mag?: number,
  angle?: number,
  bounds?: 'inside' | 'outside',
  ends?: 2 | 1 | 0,
  precision: number,
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
    } else if (d2 < d1 && angleDelta !== 0 ) {
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
    const v = getPoint(velocity);
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

type TypeBoundsDefinition = Bounds | null | TypeRectBoundsDefinition
  | TypeLineBoundsDefinition | TypeRangeBoundsDefinition
  | { type: 'rect', bounds: TypeRectBoundsDefinition }
  | { type: 'range', bounds: TypeRangeBoundsDefinition }
  | { type: 'line', bounds: TypeLineBoundsDefinition };

function makeBounds(
  bounds: TypeBoundsDefinition,
  type: 'rect' | 'range' | 'line' | null = null,
) {
  if (bounds == null) {
    return new Bounds();
  }
  if (bounds instanceof Bounds) {
    return bounds;
  }
  if (bounds.type != null) {
    return makeBounds(bounds.bounds, bounds.type);
  }
  if (type === 'rect') {
    return new RectBounds(bounds);
  }
  if (type === 'range') {
    return new RangeBounds(bounds);
  }
  if (type === 'line') {
    return new RectBounds(bounds);
  }
  if (bounds.min !== undefined || bounds.max !== undefined) {
    return makeBounds(bounds, 'range');
  }
  if (
    bounds.left !== undefined
    || bounds.right !== undefined
    || bounds.top !== undefined
    || bounds.bottom !== undefined
  ) {
    return makeBounds(bounds, 'rect');
  }
  if (
    bounds.line !== undefined
    || bounds.p1 !== undefined
    || bounds.p2 !== undefined
    || bounds.angle !== undefined
    || bounds.mag !== undefined
    || bounds.ends !== undefined
  ) {
    return makeBounds(bounds, 'line');
  }
  return null;
}

export type TypeTransformValue = number | Array<number> | {
  scale?: number,
  position?: number,
  translation?: number,
  rotation?: number,
};

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
// bounds: 'diagram',
// bounds: new TransformBounds(transform, [null, null] | { translation: null })
// bounds: [null, [-1, -1, 2, 2], null]
// bounds: [null, [null, -1, null, 2], null]
// bounds: TransformBounds | Rect | Array<number> | 'diagram',

// type TypeBoundsDefinition = null | ;

type TypeTranslationBoundsDefinition = Bounds | TypeRectBoundsDefinition | TypeLineBoundsDefinition;
type TypeRotationBoundsDefinition = Bounds | TypeRangeBoundsDefinition;
type TypeScaleBoundsDefinition = Bounds | TypeRangeBoundsDefinition | TypeRectBoundsDefinition;

type TypeTransformBoundsDefinition = Array<Bounds | null> | {
  position?: TypeTranslationBoundsDefinition;
  translation?: TypeTranslationBoundsDefinition;
  rotation?: TypeRotationBoundsDefinition;
  scale?: TypeScaleBoundsDefinition;
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
    super([], precision);
    this.order = order;
    this.createBounds(bounds);
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
        bound = makeBounds(bounds.position);
      }
      if (o === 't' && bounds.translation != null) {
        bound = makeBounds(bounds.translation);
      }
      if (o === 'r' && bounds.rotation != null) {
        bound = makeBounds(bounds.rotation);
      }
      if (o === 's' && bounds.scale != null) {
        bound = makeBounds(bounds.scale);
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
          this.boundary[i] = makeBounds(bound);
        }
        index += 1;
      }
      // if (o === type && (typeIndex == null || typeIndex === index)) {
      //   this.boundary[i] = makeBounds(bound);
      //   index += 1;
      // }
    }
  }

  updateTranslation(
    bound: Bounds | TypeTranslationBoundsDefinition,
    translationIndex: ?number = 0,
  ) {
    this.update('t', bound, translationIndex);
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
  deceleration: number,
  deltaTimeIn: number | null = null,
  boundsIn: ?Bounds = null,  // ?(Rect | Line) = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
): {
  velocity: Point,
  duration: number,
  position: Point,
} {
  let bounds;
  if (boundsIn instanceof RangeBounds) {
    bounds = new RectBounds({
      left: boundsIn.min, right: boundsIn.max,
      bottom: boundsIn.min, top: boundsIn.max,
    });
  } else {
    bounds = boundsIn;
  }
  // clip velocity to the dimension of interest
  let velocity = velocityIn;
  if (bounds != null && bounds.clipVelocity != null) {
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
  let intersectPoint;
  if (typeof result.position === 'number') {
    intersectPoint = new Point(result.intersect, 0);
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
  if (boundsIn != null) {
    // let { min, max } = boundsIn.boundary;
    // if (min == null) {
    // }
    bounds = new LineBounds({
      p1: [boundsIn.boundary.min, 0],
      p2: [boundsIn.boundary.max, 0],
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
      min: boundsIn.boundary.left, max: boundsIn.boundary.right
    });
    yBounds = new RangeBounds({
      min: boundsIn.boundary.bottom, max: boundsIn.boundary.top
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

type TypeTransformationBoundsDefinition = {
  rotation?: RangeBounds | TypeParsablePoint;
  position?: RectBounds | TypeParsableRect;
  translation?: RectBounds | TypeParsableRect;
  scale?: RectBounds | TypeParsablePoint;
}

type TypeTransformDeceleration = Array<number>;
type TypeTransformBounds = Array<Bounds | null>;
type TypeTransformZeroThreshold = Array<number>;
type TypeTransformBounce = Array<number>;


function getTransformBoundsLimit(
  boundsDefinition: TypeTransformLinkBoundsDefinition | TypeTransformBounds,
  transform: Transform,
): TypeTransformBounds {
  if (Array.isArray(boundsDefinition)) {
    return boundsDefinition;
  }
  const order = [];
  for (let i = 0; i < transform.order.length; i += 1) {
    const transformation = transform.order[i];
    if (transformation instanceof Translation) {
      let position = null;
      if (boundsDefinition.position != null) {
        ({ position } = boundsDefinition);
      }
      if (boundsDefinition.translation != null) {
        position = boundsDefinition.translation;
      }
      order.push(position);
    } else if (transformation instanceof Scale) {
      let scale = null;
      if (boundsDefinition.scale != null) {
        ({ scale } = boundsDefinition);
      }
      order.push(scale);
    } else if (transformation instanceof Rotation) {
      let rotation = null;
      if (boundsDefinition.rotation != null) {
        ({ rotation } = boundsDefinition);
      }
      order.push(rotation);
    }
  }
  return order;
}

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
      result = deceleratePoint(
        transformation, velocity.order[i], deceleration[i], deltaTime,
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Translation(result.position.x, result.position.y);
      newVTransformation = new Translation(result.velocity.x, result.velocity.y);
    } else if (transformation instanceof Scale) {
      result = decelerateIndependantPoint(
        transformation, velocity.order[i], deceleration[i], deltaTime,
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Scale(result.point.x, result.point.y);
      newVTransformation = new Scale(result.velocity.x, result.velocity.y)
    } else {
      result = decelerateValue(
        transformation.r, velocity.order[i].r, deceleration[i], deltaTime,
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = new Rotation(result.value);
      newVTransformation = new Rotation(result.velocity);
    }
    if (deltaTime === null) {
      if (result.duration > duration) {
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
    transform: new Transform(newOrder),
    velocity: new Transform(newVOrder),
    duration,
  };
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
};
