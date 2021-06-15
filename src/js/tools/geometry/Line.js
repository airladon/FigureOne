// @flow
/* eslint-disable no-use-before-define */
import {
  Point, getPoint,
} from './Point';
import type {
  TypeParsablePoint,
} from './Point';
import { joinObjects } from '../tools';
import { sphericalToCartesian, getPrecision } from './common';
import { roundNum } from '../math';

export type OBJ_Line = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  theta?: number,
  angle?: number,
  phi?: number,
  direction?: TypeParsablePoint | number,
  ends?: 0 | 1 | 2,
};

type TypeF1DefLine = {
  f1Type: 'l',
  state: [[number, number, number], [number, number, number], 2 | 1 | 0],
};

/**
 * Line intersect result.
 *
 * @property {Point} [intersect] the intersection point. Will be undefined if
 * there is no intersection
 * @property {boolean} collinear `true` if the lines are collinear
 * @property {boolean} onLines `true` if the intersection point is on both lines
 */
export type OBJ_LineIntersect = {
  intersect?: Point,
  collinear: boolean,
  onLines: boolean,
}


/**
 * A {@link Line} is defined with either:
 * - two points
 * - a point, direction and length
 * - a point and cartesian delta (equivalent to point and vector)
 * - a point and spherical delta (a length, theta rotation, and phi rotation
 *   from the point)
 * - a length and angle (for a 2D XY plane point)
 *
 * The `ends` defines whether a line is finite (a line segment between two
 * points - `ends = 2`), a ray (a line extending to infinity in one direction
 * from a point - `ends = 1`), or a infinite line (a line extending to infinity
 * in both directions - `ends = 0`).
 *
 * @example
 * // l1, l2, l3, l4, l5 and l6 are all the same if parsed by `getLine`
 * l1 = parseLine([0, 0], [2, 2]);
 * l2 = parseLine{ p1: [0, 0], length: 2, direction: [1, 0] })
 * l3 = parseLine{ p1: [0, 0], length: 2, angle: 0 })
 * l4 = parseLine{ p1: [0, 0], length: 2, theta: Math.PI / 2, phi: 0 })
 */
export type TypeParsableLine = [TypeParsablePoint, TypeParsablePoint, 2 | 1 | 0]
                                | [TypeParsablePoint, TypeParsablePoint]
                                | OBJ_Line
                                | TypeF1DefLine
                                | Line;

function parseLine(lIn: TypeParsableLine): Line {
  if (lIn instanceof Line) {
    return lIn;
  }
  if (lIn == null) {
    throw new Error(`FigureOne could not parse line with no input: '${lIn}'`);
  }

  let l = lIn;
  if (typeof l === 'string') {
    try {
      l = JSON.parse(l);
    } catch {
      throw new Error(`FigureOne could not parse line from string: '${l}'`);
    }
  }

  if (Array.isArray(l)) {
    // point, length, direction, ends
    if (l.length === 3) {
      return new Line(l[0], l[1], l[2]);
    }
    if (l.length === 2) {
      return new Line(l[0], l[1]);
    }
    throw new Error(`FigureOne could not parse line from array: '${JSON.stringify(lIn)}'`);
  }
  if (l.f1Type != null) {
    if (
      l.f1Type === 'l'
      && l.state != null
      && Array.isArray([l.state])
      && l.state.length === 3
    ) { // $FlowFixMe
      const [p1, p2, ends] = l.state;
      return new Line(getPoint(p1), getPoint(p2), ends);
    }
    throw new Error(`FigureOne could not parse line from state: ${JSON.stringify(lIn)}`);
  }
  if (l.p1 != null) {
    if (l.p2 != null) { // $FlowFixMe
      return new Line(l.p1, l.p2, l.ends);
    }
    if (l.length != null && l.direction != null) {
      return new Line({
        p1: l.p1,
        direction: l.direction,
        length: l.length, // $FlowFixMe
        ends: l.ends,
      });
    }
    if (l.phi != null && l.theta != null && l.length != null) {
      return new Line({ // $FlowFixMe
        p1: l.p1, phi: l.phi, theta: l.theta, ends: l.ends,
      });
    }
    if (l.angle != null && l.length != null) {
      return new Line({ // $FlowFixMe
        p1: l.p1, angle: l.angle, ends: l.ends,
      });
    }
    throw new Error(`FigureOne could not parse line from object definition: ${JSON.stringify(lIn)}`);
  }
  throw new Error(`FigureOne could not parse line: ${JSON.stringify(lIn)}`);
}

/**
 * Convert a parsable line definition to a {@link Line}.
 * @param {TypeParsableLine} l parsable line definition
 * @return {Line} `Line` object
 */
function getLine(l: TypeParsableLine): Line {
  return parseLine(l);
}

class Line {
  p1: Point;
  p2: Point;
  ends: 2 | 1 | 0;

  /**
   * @param {0 | 1 | 2} ends number of ends the line has. `2` ends is a finite
   * line. `1` end is an infinite line that terminates at the first point, and
   * goes through the second point to infinity. `0` ends is an infinite line
   * that goes through both first and second points to infinity.
   */
  constructor(
    p1OrOptions: TypeParsablePoint | OBJ_Line,
    p2: TypeParsablePoint,
    ends: 2 | 1 | 0 = 2,
  ) {
    if (p1OrOptions instanceof Point || Array.isArray(p1OrOptions) || typeof p1OrOptions === 'string') {
      this.p1 = getPoint(p1OrOptions);
      this.p2 = getPoint(p2);
      this.ends = ends;
    } else {
      const defaultOptions = {
        p1: new Point(0, 0, 0),
        mag: 1,
        theta: 0,
        phi: 0,
        ends: 2,
      };
      const o = joinObjects({}, defaultOptions, p1OrOptions);
      this.p1 = getPoint(o.p1);
      this.ends = o.ends;
      if (o.p2 != null) {
        this.p2 = getPoint(o.p2);
      } else if (o.direction != null) {
        this.p2 = getPoint(o.direction).normalize().scale(o.length).add(this.p1);
      } else if (o.angle != null) {
        this.p2 = this.p1.add(
          o.length * Math.cos(o.angle),
          o.length * Math.sin(o.angle),
          0,
        );
      } else {
        this.p2 = this.p1.add(new Point(sphericalToCartesian(o.length, o.theta, o.phi)));
      }
    }
    // this.setupLine();
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'l',
      state: [
        [
          roundNum(this.p1.x, precision),
          roundNum(this.p1.y, precision),
          roundNum(this.p1.z, precision),
        ],
        [
          roundNum(this.p2.x, precision),
          roundNum(this.p2.y, precision),
          roundNum(this.p2.z, precision),
        ],
        this.ends,
      ],
    };
  }

  /**
   * Return the spherical theta angle of p2 relative to p1.
   */
  theta() {
    return this.p2.sub(this.p1).toSpherical()[1];
  }

  /**
   * Return the spherical phi angle of p2 relative to p1.
   */
  phi() {
    return this.p2.sub(this.p1).toSpherical()[2];
  }

  _dup() {
    return new Line(this.p1, this.p2, this.ends);
  }

  /**
   * Change p1 of the line
   */
  setP1(p1: TypeParsablePoint) {
    this.p1 = getPoint(p1);
  }

  /**
   * Change p2 of the line
   */
  setP2(p2: TypeParsablePoint) {
    this.p2 = getPoint(p2);
  }

  /**
   * Get the unit vector of the line ((p2 - p1) / length).
   */
  unitVector() {
    return this.p2.sub(this.p1).normalize();
  }

  /**
   * Get the vector of the line (p2 - p1).
   */
  vector() {
    return this.p2.sub(this.p1);
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

  /**
   * Return a line with swapped p1 and p2.
   */
  reverse() {
    return new Line(this.p2, this.p1, this.ends);
  }


  // /**
  //  * Get the gradient of the line
  //  * @return {number}
  //  */
  // getGradient() {
  //   if (this.B === 0) {
  //     return null;
  //   }
  //   return -this.A / this.B;
  // }

  /**
   * Get the angle of the line from p1 to p2
   * @return {number}
   */
  angle() {
    return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
  }

  /**
   * Return a duplicate line with values rounded to `precision`
   * @return {Line}
   */
  round(precision?: number = 8) {
    return new Line(this.p1.round(precision), this.p2.round(precision), this.ends);
  }

  /**
   * Return the distance between p1 and p2. Note, for infinite lines
   * this will still return the distance between p1 and p2 that defines
   * the line.
   * @return {number}
   */
  length() {
    const p = this.p2.sub(this.p1);
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  }

  /* eslint-disable comma-dangle */
  /**
   * Return the midpoint between p1 and p2.
   * @return {Point}
   */
  midPoint() {
    return this.pointAtPercent(0.5);
  }

  /**
   * Return the point along some percent of the distance between p1 and p2.
   * @return {Point}
   */
  pointAtPercent(percent: number) {
    const length = this.length();
    const n = this.p2.sub(this.p1).normalize();
    return this.p1.add(n.scale(length * percent));
  }

  /**
   * Return the point along the line at some length from p1
   * @return {Point}
   */
  pointAtLength(length: number) {
    return this.pointAtPercent(length / this.length());
  }
  /* eslint-enable comma-dangle */

  /**
   * `true` if `point` is along the line extended to infinity on both ends
   * @return {boolean}
   */
  hasPointAlong(point: TypeParsablePoint, precision?: number = 8) {
    if (this.p1.isEqualTo(point, precision)) {
      return true;
    }
    const n = this.unitVector();
    const m = getPoint(point).sub(this.p1).normalize();
    // const d = round(dotProduct3(m.toArray(), n.toArray()), precision);
    const d = roundNum(m.dotProduct(n), precision);
    if (d === 1 || d === -1) {
      return true;
    }
    return false;
  }

  /**
   * `true` if `point` is on the line.
   * If the line has 2 or 1 finite ends, point must be on or between the
   * defined ends.
   * @return {boolean}
   */
  hasPointOn(point: TypeParsablePoint, precision?: number = 8) {
    const p = getPoint(point);
    if (this.ends === 0) {
      return this.hasPointAlong(p, precision);
    }
    if (this.p1.isEqualTo(p, precision)) {
      return true;
    }
    const n = this.unitVector();
    const M = p.sub(this.p1);
    const m = M.normalize();
    const d = roundNum(m.dotProduct(n), precision);
    if (
      d === 1
      && (
        roundNum(M.distance(), precision) <= roundNum(this.length(), precision)
        || this.ends === 1
      )
    ) {
      return true;
    }
    return false;
  }


  /**
   * Perpendicular distance from `point` to line
   * @return {number}
   */
  distanceToPoint(point: TypeParsablePoint) {
    // Equation from https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    const n = this.unitVector();
    const p = getPoint(point);
    const a = this.p1;
    return p.sub(a).sub(n.scale(p.sub(a).dotProduct(n))).distance();
  }

  isParallelTo(line: TypeParsableLine, precision: number = 8) {
    const l = getLine(line);
    const n = this.unitVector();
    const m = l.unitVector();
    const crossProduct = n.crossProduct(m);
    if (crossProduct.isZero(precision)) {
      return true;
    }
    return false;
  }

  /**
   * `true` if two lines are equal to within some rounding `precision`.
   * @return {boolean}
   */
  isEqualTo(line2: TypeParsableLine, precision: number = 8, delta: boolean = false) {
    const l1 = this;
    const l2 = getLine(line2);
    if (l1.ends !== l2.ends) {
      return false;
    }
    if (l1.ends === 2) {
      if (
        l1.p1.isNotEqualTo(l2.p1, precision, delta)
        && l1.p1.isNotEqualTo(l2.p2, precision, delta)
      ) {
        return false;
      }
      if (
        l1.p2.isNotEqualTo(l2.p1, precision, delta)
        && l1.p2.isNotEqualTo(l2.p2, precision, delta)
      ) {
        return false;
      }
      return true;
    }

    if (l1.ends === 1) {
      if (l1.p1.isNotEqualTo(l2.p1, precision, delta)) {
        return false;
      }
      if (!l1.hasPointOn(l2.p2, precision)) {
        return false;
      }
      return true;
    }

    // otherwise ends === 0
    if (!l1.hasPointOn(l2.p1, precision)) {
      return false;
    }
    if (!l1.hasPointOn(l2.p2, precision)) {
      return false;
    }
    return true;
  }


  /**
   * `true` if this line is within `line2`
   * @return {boolean}
   */
  hasLineWithin(line: TypeParsableLine, precision: number = 8) {
    return getLine(line).isWithinLine(this, precision);
  }

  /**
   * `true` if this line is along the infinite length of `line2`
   * @return {boolean}
   */
  isAlongLine(line: TypeParsableLine, precision: number = 8) {
    return this.isCollinearTo(line, precision);
  }

  isCollinearTo(line: TypeParsableLine, precision: number = 8) {
    const l = getLine(line);
    const n = this.unitVector();
    const m = l.unitVector();
    const d = roundNum(m.dotProduct(n), precision);
    if (d !== 1 && d !== -1) {
      return false;
    }
    return this.hasPointAlong(l.p1, precision);
  }

  /**
   * `true` if this line is contained within `line2`
   * @return {boolean}
   */
  isWithinLine(line: TypeParsableLine, precision: number = 8) {
    const l1 = this.round(precision);
    const l2 = getLine(line).round(precision);
    if (!l1.isAlongLine(l2, precision)) {
      return false;
    }
    if (l2.ends === 0) {
      return true;
    }
    const withinEnds = () => l2.hasPointOn(this.p1, precision) && l2.hasPointOn(this.p2, precision);
    if (this.ends < l2.ends) {
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
    direction: TypeParsablePoint,
    dist: number | null = null,
    perpendicular: boolean = true,
  ) {
    let distToUse;
    const dir = getPoint(direction);
    if (dist == null) {
      distToUse = dir.distance();
    } else {
      distToUse = dist;
    }

    const d = dir.normalize().scale(distToUse);

    if (perpendicular === false) {
      const p1 = this.p1.add(d);
      const p2 = this.p2.add(d);
      return new Line(p1, p2, this.ends);
    }
    const u = this.unitVector();
    const normal = d.crossProduct(u);
    const perp = u.crossProduct(normal).normalize().scale(distToUse);
    const p1 = this.p1.add(perp);
    const p2 = this.p2.add(perp);
    return new Line(p1, p2, this.ends);
  }

  /**
   * Perpendicular distance between two lines extended to infinity
   */
  distanceToLine(line: TypeParsableLine, precision: number = 8) {
    const l = getLine(line);
    const u1 = this.unitVector();
    const u2 = l.unitVector();
    const d = l.p1.sub(this.p1);
    const u1CrossU2 = u1.crossProduct(u2);
    // If the lines are parallel, then return the distance between parallel lines
    if (u1CrossU2.isZero(precision)) {
      // https://www.geeksforgeeks.org/shortest-distance-between-two-lines-in-3d-space-class-12-maths/
      return u1.crossProduct(l.p1.sub(this.p1)).distance() / u1.distance();
    }
    // https://vicrucann.github.io/tutorials/3d-geometry-algorithms/
    return d.dotProduct(u1CrossU2) / u1CrossU2.distance();
  }

  /**
   * Return the point projected onto the line by some point off the line.
   * The line from the projected point to the offline point will be
   * perpendicular to the line.
   */
  pointProjection(p: TypeParsablePoint) {
    // https://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2
    const a = getPoint(p).sub(this.p1);
    const b = this.vector();
    return this.pointAtPercent(a.dotProduct(b) / b.dotProduct(b));
  }

  /**
   * The intersection between this line and `line2`.
   *
   * The returned result is an {@link Intersect} object with the keys
   * `intersect`, `offLine` and `colinear`.
   *
   * If no intersect exists, then `intersect` will be undefined.
   *
   * If an intersect exists, and the intersect is within both lines, then
   * `offLine` will be `true`. If at least one of the lines needs to be extended
   * to reach the intersect point, then `offLine` will be `false`.
   *
   * If the lines are collinear but do not overlap, then the intersect point
   * will be the midpoint between the two closest ends. `offLine` will be `true`
   * and `collinear` will be `true`.
   *
   * If the lines are collinear and overlap fully (or are equal), then the
   * intersect will be p1 of the calling line, `offLine` will be `false` and
   * `collinear` will be `true`.
   *
   * If either line has zero length, then an exception will be thrown.
   * @return {Intersect}
   */
  intersectsWith(
    line: TypeParsableLine,
    precision: number = 8,
  ): OBJ_LineIntersect {
    const l2 = getLine(line); // line2.round(precision);
    const l1 = this;  // this.round(precision);

    const collinear = l1.isAlongLine(l2, precision);
    // If the distance between lines is 0, then they intersect
    if (!collinear && l1.distanceToLine(l2, precision) === 0) {
      const C = this.p1;
      const D = l2.p1;
      const e = this.unitVector();
      const f = l2.unitVector();
      const g = D.sub(C);
      const fg = f.crossProduct(g);
      const fe = f.crossProduct(e);
      const h = fg.distance();
      const k = fe.distance();
      if (h === 0 || k === 0) {
        return { intersect: undefined, collinear, onLines: false };
      }
      const l = e.scale(h / k);
      let i;
      if (fg.normalize().isEqualTo(fe.normalize(), precision)) {
        i = C.add(l);
      } else {
        i = C.sub(l);
      }
      if (l1.hasPointOn(i, precision) && l2.hasPointOn(i, precision)) {
        return { intersect: i, collinear, onLines: true };
      }
      return { collinear: false, onLines: false, intersect: i };
    }

    // If the lines not collinear, but do not have an intersect, then
    // they are skew or parallel
    if (!collinear) {
      return { intersect: undefined, collinear, onLines: false };
    }

    // If lines are collinear they could be either:
    //   - equal
    //   - one fully within the other
    //   - partially overlapping
    //   - not overlapping
    const l1P1OnL2 = l2.hasPointOn(l1.p1, precision);
    const l1P2OnL2 = l2.hasPointOn(l1.p2, precision);
    const l2P1OnL1 = l1.hasPointOn(l2.p1, precision);
    const l2P2OnL1 = l1.hasPointOn(l2.p2, precision);

    // Not overlapping - return midpoint between two closest ends
    if (
      !l2P1OnL1 && !l2P2OnL1 && !l1P2OnL2 && !l1P1OnL2
    ) {
      const d11 = l1.p1.distance(l2.p1);
      const d12 = l1.p1.distance(l2.p2);
      const d21 = l1.p2.distance(l2.p1);
      const d22 = l1.p2.distance(l2.p2);
      const min = Math.min(d21, d22, d11, d12);
      let intersect;
      if (min === d11) {
        intersect = new Line(l1.p1, l2.p1).midPoint();
      } else if (min === d12) {
        intersect = new Line(l1.p1, l2.p2).midPoint();
      } else if (min === d21) {
        intersect = new Line(l1.p2, l2.p1).midPoint();
      } else if (min === d22) {
        intersect = new Line(l1.p2, l2.p2).midPoint();
      }
      return { intersect, collinear: true, onLines: false };
    }

    // The remaining case is equal, partially or fully  overlapping
    return { intersect: l1.p1._dup(), collinear: true, onLines: true };
  }

  clipPoint(point: TypeParsablePoint, precision: number = 8) {
    // const p = getPoint(point);
    if (this.hasPointOn(point, precision)) {
      return point._dup();
    }
    const projection = this.pointProjection(point);
    if (this.hasPointOn(projection, precision)) {
      return projection;
    }

    const d1 = projection.distance(this.p1);
    const d2 = projection.distance(this.p2);
    if (d1 <= d2) {
      return this.p1._dup();
    }
    return this.p2._dup();
  }
}

export {
  Line,
  getLine,
};
