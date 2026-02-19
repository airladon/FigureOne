/* eslint-disable no-use-before-define */
import {
  Point, getPoint,
} from './Point';
import type {
  TypeParsablePoint,
} from './Point';
import { joinObjects } from '../tools';
import { sphericalToCartesian, getPrecision } from './common';
import { clipAngle } from './angle';
import { roundNum } from '../math';

/**
 * Line definition object.
 *
 * Combinations that can be used are:
 * - p1, p2, ends
 * - p1, length, angle, ends (for 2D lines)
 * - p1, length, phi, theta, ends (for 3D lines)
 * - p1, length, direction, ends
 *
 * @property {TypeParsablePoint} [p1] first point of line
 * @property {TypeParsablePoint} [p2] second point of line
 * @property {number} [length] length of line
 * @property {number} [theta] theta (elevation) angle of line in spherical
 * coordinates
 * @property {number} [phi] phi (azimuth) angle of line in spherical coordinates
 * @property {number} [angle] angle of line in 2D definition
 * @property {TypeParsablePoint | number} [direction] direction vector of line
 * from p1
 * @property {0 | 1 | 2} [ends]
 * @interface
 * @group Misc Shapes
 */
export type OBJ_LineDefinition = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  theta?: number,
  angle?: number,
  phi?: number,
  direction?: TypeParsablePoint | number,
  ends?: 0 | 1 | 2,
};

/**
 * Recorder state definition of a {@link Line} that represents the two end
 * points of the line and the number of finite ends.
 *
 * `{ f1Type: 'l', state: [[number, number, number], [number, number, number], 2 | 1 | 0] }`
 * @group Misc Geometry
 */
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
 * @interface
 * @group Misc Geometry
 */
export type OBJ_LineIntersect = {
  intersect?: Point,
  collinear: boolean,
  onLines: boolean,
}


/**
 * A {@link Line} is defined with either:
 * - an instantiated {@link Line}
 * - two points [{@link TypeParsablePoint}, {@link TypeParsablePoint}]
 * - two points and the number of ends
 *   [{@link TypeParsablePoint}, {@link TypeParsablePoint}, `1 | 2 | 0`]
 * - a line definition object {@link OBJ_LineDefinition}
 * - A recorder state definition {@link TypeF1DefLine}
 * - A string representation of all options except the first
 *
 * The `ends` defines whether a line is finite (a line segment between two
 * points - `ends = 2`), a ray (a line extending to infinity in one direction
 * from a point - `ends = 1`), or a infinite line (a line extending to infinity
 * in both directions - `ends = 0`).
 *
 * @example
 * // l1, l2, l3, l4, l5, and l6 are all the same
 * l1 = new Fig.Line([0, 0], [2, 0]);
 * l2 = Fig.getLine([[0, 0], [2, 0]]);
 * l3 = Fig.getLine({ p1: [0, 0], length: 2, direction: [1, 0] });
 * l4 = Fig.getLine({ p1: [0, 0], length: 2, angle: 0 });
 * l5 = Fig.getLine({ p1: [0, 0], length: 2, theta: Math.PI / 2, phi: 0 });
 * l6 = Fig.getLine({ p1: [0, 0], p2: [2, 0] });
 * @group Geometry
 */
export type TypeParsableLine = [TypeParsablePoint, TypeParsablePoint, 2 | 1 | 0]
                                | [TypeParsablePoint, TypeParsablePoint]
                                | OBJ_LineDefinition
                                | TypeF1DefLine
                                | Line;

function parseLine(lIn: TypeParsableLine): Line {
  if (lIn instanceof Line) {
    return lIn;
  }
  if (lIn == null) {
    throw new Error(`FigureOne could not parse line with no input: '${lIn}'`);
  }

  let l: any = lIn;
  if (typeof l === 'string') {
    try {
      l = JSON.parse(l);
    } catch {
      throw new Error(`FigureOne could not parse line from string: '${l}'`);
    }
  }

  if (Array.isArray(l)) {
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
    ) {
      const [p1, p2, ends] = l.state as any;
      return new Line(getPoint(p1), getPoint(p2), ends);
    }
    throw new Error(`FigureOne could not parse line from state: ${JSON.stringify(lIn)}`);
  }

  const {
    p1, p2, length, direction, ends,
  } = l;
  if (p1 != null) {
    if (p2 != null) {
      return new Line(p1, p2, ends);
    }
    if (length != null && direction != null) {
      return new Line({
        p1,
        direction,
        length,
        ends,
      });
    }
    if (l.phi != null && l.theta != null && l.length != null) {
      return new Line({
        p1, phi: l.phi, theta: l.theta, ends, length,
      });
    }
    if (l.angle != null && l.length != null) {
      return new Line({
        p1, angle: l.angle, ends, length,
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
 * @group Misc Geometry
 */
function getLine(l: TypeParsableLine): Line {
  return parseLine(l);
}

/**
 * Object representing a Line.
 *
 * Contains methods that makes it conventient to use lines in calculations.
 *
 * @example
 * // get Line from Fig
 * const { Line } = Fig;
 *
 * // define a line from [0, 0] to [1, 0]
 * const l = new Line([0, 0], [1, 0]);
 *
 * // find the length of the line
 * const len = l.length();
 *
 * // get the point at length 0.2 along the line
 * const p = l.pointAtLength(0.2);
 *
 * // find the intersect with another line
 * const i = l.intersectsWith([[0.5, 0.5], [0.5, -0.5]]);
 * @group Geometry
 */
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
    p1OrOptions: TypeParsablePoint | OBJ_LineDefinition,
    p2: TypeParsablePoint = [0, 0],
    ends: 2 | 1 | 0 = 2,
  ) {
    if (p1OrOptions instanceof Point || Array.isArray(p1OrOptions) || typeof p1OrOptions === 'string') {
      this.p1 = getPoint(p1OrOptions as any);
      this.p2 = getPoint(p2 as any);
      this.ends = ends;
    } else {
      const defaultOptions = {
        p1: new Point(0, 0, 0),
        mag: 1,
        theta: 0,
        phi: 0,
        ends: 2,
      } as any;
  const o = joinObjects<any>({}, defaultOptions, p1OrOptions as any);
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
  }

  _state(options: { precision: number }): TypeF1DefLine {
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
  theta(): number {
    return this.p2.sub(this.p1).toSpherical().theta;
  }

  /**
   * Return the spherical phi angle of p2 relative to p1.
   */
  phi(): number {
    return this.p2.sub(this.p1).toSpherical().phi;
  }

  _dup(): Line {
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
  vector(): Point {
    return this.p2.sub(this.p1);
  }

  /**
   * Get p1 or p2
   * @return {Point}
   */
  getPoint(index: 1 | 2 = 1): Point {
    if (index === 2) {
      return this.p2;
    }
    return this.p1;
  }

  /**
   * Return a line with swapped p1 and p2.
   */
  reverse(): Line {
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
   * Get the 2D angle of the line from p1 to p2
   * @return {number}
   */
  angle(): number {
    return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
  }

  /**
   * Return a duplicate line with values rounded to `precision`
   * @return {Line}
   */
  round(precision: number = 8): Line {
    return new Line(this.p1.round(precision), this.p2.round(precision), this.ends);
  }

  /**
   * Return the distance between p1 and p2. Note, for infinite lines
   * this will still return the distance between p1 and p2 that defines
   * the line.
   * @return {number}
   */
  length(): number {
    const p = this.p2.sub(this.p1);
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  }

  /* eslint-disable comma-dangle */
  /**
   * Return the midpoint between p1 and p2.
   * @return {Point}
   */
  midPoint(): Point {
    return this.pointAtPercent(0.5);
  }

  /**
   * Return the point along some percent of the distance between p1 and p2.
   * @return {Point}
   */
  pointAtPercent(percent: number): Point {
    const length = this.length();
    const n = this.p2.sub(this.p1).normalize();
    return this.p1.add(n.scale(length * percent));
  }

  /**
   * Return the point along the line at some length from p1
   * @return {Point}
   */
  pointAtLength(length: number): Point {
    return this.pointAtPercent(length / this.length());
  }
  /* eslint-enable comma-dangle */

  /**
   * `true` if `point` is along the line extended to infinity on both ends
   * @return {boolean}
   */
  hasPointAlong(point: TypeParsablePoint, precision: number = 8): boolean {
    if (this.p1.isEqualTo(point, precision)) {
      return true;
    }
    const n = this.unitVector();
    const m = getPoint(point).sub(this.p1).normalize();
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
  hasPointOn(point: TypeParsablePoint, precision: number = 8): boolean {
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
  distanceToPoint(point: TypeParsablePoint): number {
    const n = this.unitVector();
    const p = getPoint(point);
    const a = this.p1;
    return p.sub(a).sub(n.scale(p.sub(a).dotProduct(n))).distance();
  }

  /**
   * `true` if `line` is parrallel to this line.
   * @return {boolean}
   */
  isParallelTo(line: TypeParsableLine, precision: number = 8): boolean {
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
  isEqualTo(line2: TypeParsableLine, precision: number = 8, delta: boolean = false): boolean {
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
  hasLineWithin(line: TypeParsableLine, precision: number = 8): boolean {
    return getLine(line).isWithinLine(this, precision);
  }

  /**
   * `true` if this line is along the infinite length of `line2`
   * @return {boolean}
   */
  isAlongLine(line: TypeParsableLine, precision: number = 8): boolean {
    return this.isCollinearTo(line, precision);
  }

  isCollinearTo(line: TypeParsableLine, precision: number = 8): boolean {
    const l = getLine(line);
    const n = this.unitVector();
    const m = l.unitVector();
    const d = roundNum(m.dotProduct(n), precision);
    if (d !== 1 && d !== -1) {
      return false;
    }
    return this.hasPointAlong(l.p1, precision);
  }

  isWithinLine(line: TypeParsableLine, precision: number = 8): boolean {
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
    direction: TypeParsablePoint | 'left' | 'right' | 'top' | 'bottom' | 'positive' | 'negative',
    dist: number | null = null,
    perpendicular: boolean = true,
  ): Line {
    if (typeof direction === 'string') {
      return this.offset2D(direction as 'left' | 'right' | 'top' | 'bottom' | 'positive' | 'negative', dist as any);
    }
    let distToUse: number;
    const dir = getPoint(direction as any);
    if (dist == null) {
      distToUse = dir.distance();
    } else {
      distToUse = dist as number;
    }

    const d = dir.normalize().scale(distToUse as number);

    if (perpendicular === false) {
      const p1 = this.p1.add(d);
      const p2 = this.p2.add(d);
      return new Line(p1, p2, this.ends);
    }
    const u = this.unitVector();
    const normal = d.crossProduct(u);
    const perp = u.crossProduct(normal).normalize().scale(distToUse as number);
    const p1 = this.p1.add(perp);
    const p2 = this.p2.add(perp);
    return new Line(p1, p2, this.ends);
  }

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
  offset2D(
    direction: 'left' | 'right' | 'top' | 'bottom' | 'positive' | 'negative',
    dist: number,
  ): Line {
    let normalizedAngle = this.angle();
    if (normalizedAngle >= Math.PI) {
      normalizedAngle -= Math.PI;
    }
    if (normalizedAngle < 0) {
      normalizedAngle += Math.PI;
    }
    let offsetAngle = normalizedAngle - Math.PI / 2;
    if (direction === 'positive') {
      offsetAngle = clipAngle(this.angle(), '0to360') + Math.PI / 2;
    } else if (direction === 'negative') {
      offsetAngle = clipAngle(this.angle(), '0to360') - Math.PI / 2;
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
      0,
    );
    const p2 = new Point(
      this.p2.x + dist * Math.cos(offsetAngle),
      this.p2.y + dist * Math.sin(offsetAngle),
      0,
    );
    return new Line(p1, p2, this.ends);
  }

  /**
   * Perpendicular distance between two lines extended to infinity
   */
  distanceToLine(line: TypeParsableLine, precision: number = 8): number {
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
  pointProjection(p: TypeParsablePoint): Point {
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
    const l2 = getLine(line);
    const l1 = this;

    const collinear = l1.isAlongLine(l2, precision);

    // If the lines are parallel, they will never intersect
    if (l1.isParallelTo(l2) && !collinear) {
      return {
        intersect: undefined, collinear, onLines: false,
      };
    }
    // If the distance between lines is 0, then they intersect
    // Nomenclature:
    // https://vicrucann.github.io/tutorials/3d-geometry-algorithms/
    // With one exception: if fxg or fxe are 0, then it is possible
    // the lines are parallel OR C or D is the actual intersect. As parallelism
    // has already been tested, we know it is then the latter case.
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
      // If h is 0, then C is the intersect point
      // If k is 0, then D is the intersect point
      if (h === 0) {
        return { intersect: C, collinear, onLines: l2.hasPointOn(C) };
      }
      if (k === 0) {
        return { intersect: D, collinear, onLines: l1.hasPointOn(D) };
      }
      // if (h === 0 || k === 0) {
      //   return { intersect: undefined, collinear, onLines: false };
      // }
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

  /**
   * Clip a point to be on a line.
   *
   * If point is not along line, then it will be projected onto it.
   *
   * If point is not on line, then the closest line end will be returned.
   *
   * @param {TypeParsablePoint} point point to clip
   * @param {number} precision precision to clip to (`8`)
   * @return {Point} clipped point
   */
  clipPoint(point: TypeParsablePoint, precision: number = 8): Point {
    const p = getPoint(point);
    if (this.hasPointOn(p, precision)) {
      return p._dup();
    }
    const projection = this.pointProjection(p);
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
