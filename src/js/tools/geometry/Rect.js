// @flow
import { roundNum } from '../math';
import { getPrecision } from './common';
import { Point, getPoint } from './Point';
import { Line, getLine } from './Line';
import type { TypeParsablePoint } from './Point';
import type { TypeParsableLine } from './Line';

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
    const centerToP = new Line(center, p); // $FlowFixMe
    const centerOut = new Line(
      { p1: center, length: this.width + this.height, angle: centerToP.angle() },
    );
    const left = new Line([this.left, this.bottom], [this.left, this.top]);
    let i = centerOut.intersectsWith(left);
    if (i.onLines) { return i.intersect; }

    const top = new Line([this.left, this.top], [this.right, this.top]);
    i = centerOut.intersectsWith(top);
    if (i.onLines) { return i.intersect; }

    const right = new Line([this.right, this.top], [this.right, this.bottom]);
    i = centerOut.intersectsWith(right);
    if (i.onLines) { return i.intersect; }

    const bottom = new Line([this.left, this.bottom], [this.right, this.bottom]);
    i = centerOut.intersectsWith(bottom);
    if (i.onLines) { return i.intersect; }
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
    if (leftIntersect.onLines) { intersects.push(leftIntersect.intersect); }
    const topIntersect = l.intersectsWith(top);
    if (topIntersect.onLines) { intersects.push(topIntersect.intersect); }
    const bottomIntersect = l.intersectsWith(bottom);
    if (bottomIntersect.onLines) { intersects.push(bottomIntersect.intersect); }
    const rightIntersect = l.intersectsWith(right);
    if (rightIntersect.onLines) { intersects.push(rightIntersect.intersect); }
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

export {
  getRect,
  Rect,
};
