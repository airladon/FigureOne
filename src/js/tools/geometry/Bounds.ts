/* eslint-disable no-use-before-define */
import { Point, getPoint } from './Point';
import { Plane } from './Plane';
import { joinObjects } from '../tools';
import { getPrecision } from './common';
import { Line, getLine } from './Line';
import { roundNum, round, clipValue } from '../math';
import type { TypeParsablePoint } from './Point';
import type { OBJ_LineDefinition, TypeParsableLine } from './Line';


// export type TypeTransformBounds = Array<Bounds | null>;

/**
 * Bounds intersect result
 *
 * @property {number | Point | null} [intersect] `null` means there is no
 * intersect
 * @property {number | Point} [reflection]
 * @property {number} [distance] distance from value or Point and boundary in
 * direction specified
 */
export type BoundsIntersect = {
  intersect: number | Point | null,
  reflection: number | Point,
  distance: number,
};

/**
 * Point Bounds intersect result
 *
 * @property {Point | null} [intersect]
 * @property {Point} [reflection]
 * @property {number} [distance]
 */
export type BoundsPointIntersect = {
  intersect: Point | null,
  reflection: Point,
  distance: number,
}

/**
 * Bounds value intersect result
 *
 * @property {number | null} [intersect]
 * @property {number} [reflection]
 * @property {number} [distance]
 */
export type BoundsValueIntersect = {
  intersect: number | null,
  reflection: number,
  distance: number,
}

/**
 * Base class for all bounds.
 *
 * Either a value or a {@link Point} can be bounded.
 *
 * A Bounds must be able to:
 * - store a boundary
 * - check if a value or point is contained within the boundary
 * - clip a value or point to within the boundary
 * - find the intersect between the boundary and a value or point in some
 *   direction
 */
class Bounds {
  boundary: any;
  precision: number;
  // bounds: 'inside' | 'outside';

  /**
   * @param {Object} boundary
   * @param {number} precision default precision for calculations
   */
  constructor(
    boundary: any = {},
    precision: number = 8,
  ) {
    this.boundary = boundary;
    // this.bounds = bounds;
    this.precision = precision;
  }

  /**
   * Duplicate the bounds object
   */
  // eslint-disable-next-line class-methods-use-this
  _dup(): Bounds {
    return new Bounds();
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _state(options: { precision: number }): { f1Type: string, state: any[] } {
    return {
      f1Type: 'bounds',
      state: [],
    };
  }

  /**
   * Returns `true` if a value or {@link Point} is within the bounds.
   * @param {number | TypeParsablePoint} valueOrPosition
   * @param {boolean} [projectToPlane] optional flag used by some bounds types
   * @return {boolean}
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  contains(valueOrPosition: number | TypeParsablePoint, projectToPlane?: boolean): boolean {
    return true;
  }

  /**
   * Returns `true` if a value or {@link Point} is within the bounds.
   * @param {number | TypeParsablePoint} valueOrPosition
   * @return {BoundsIntersect}
   */
  // eslint-disable-next-line class-methods-use-this
  intersect(valueOrPosition: number | TypeParsablePoint, direction: number | TypeParsablePoint = 0): BoundsIntersect {
    if (typeof valueOrPosition === 'number') {
      // const dirNum = typeof direction === 'number' ? direction : 0;
      return {
        intersect: valueOrPosition,
        distance: 0,
        reflection: (direction as number) + Math.PI,
      };
    }
    // const dirPoint = typeof direction === 'number' ? getPoint([0, 0, 0]) : getPoint(direction);
    return {
      intersect: getPoint(valueOrPosition),
      distance: 0,
      reflection: (direction as number) + Math.PI,
    };
  }

  /**
   * Clips a value or {@link Point} to be within a boundary.
   * @param {number | TypeParsablePoint} valueOrPosition
   * @return {number | Point}
   */
  // eslint-disable-next-line class-methods-use-this
  clip(valueOrPosition: number | TypeParsablePoint): number | Point {
    if (typeof valueOrPosition === 'number') {
      return valueOrPosition;
    }
    return getPoint(valueOrPosition);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined(): boolean {
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

/**
 * Range bounds object definition.
 *
 * A range bounds defines a minimum and maximum value.
 *
 * @property {number | null} [min] minimum value boundary, null for unbounded
 * (`null`)
 * @property {number | null} [max] maximum value boundary, null for unbounded
 * (`null`)
 * @property {number} [precision] precision with which to calculate boundary
 * `intersect` and `contains` (`8`)
 */
export type OBJ_RangeBounds = {
  min?: number | null,
  max?: number | null,
  precision?: number,
};

/**
 * Recorder state definition of a {@link RangeBounds} that represents the
 * precision, min, and max bounds.
 *
 * ```
 * {
 *   f1Type: 'rangeBounds',
 *   state: [
 *     number, number | null, number | null,
 * }
 * ```
 */
type TypeF1DefRangeBounds = {
  f1Type: 'rangeBounds',
  state: [number, number | null, number | null],
};

/**
 * A RangeBounds defines a bounds for a value or {@link Point} between some
 * minimum and maximum value.
 *
 * When using points, the minimum and maximum value is applied to each component
 * of the point separately.
 */
class RangeBounds extends Bounds {
  override boundary!: { min: number | null, max: number | null };

  /**
   * @param {OBJ_RangeBounds} boundary
   */
  constructor(boundary: OBJ_RangeBounds) {
    const defaultOptions = {
      precision: 8,
      min: null,
      max: null,
    };
  const o = joinObjects<{ precision: number, min: number | null, max: number | null }>({}, defaultOptions, boundary as any);
    const b = {
      min: o.min,
      max: o.max,
    };
    super(b, o.precision);
  }

  override isDefined() {
    if (this.boundary.min == null && this.boundary.max == null) {
      return false;
    }
    return true;
  }

  override _dup() {
    return new RangeBounds({
      precision: this.precision,
      min: this.boundary.min,
      max: this.boundary.max,
    });
  }

  override _state(options: { precision: number }): { f1Type: string, state: [number, number | null, number | null] } {
    const precision = getPrecision(options);
    return {
      f1Type: 'rangeBounds',
      state: [
        this.precision,
        this.boundary.min != null ? roundNum(this.boundary.min, precision) : null,
        this.boundary.max != null ? roundNum(this.boundary.max, precision) : null,
      ],
    };
  }

  /**
   * Returns `true` if a value or each x, y and z component of a {@link Point}
   * is within the max and min bounds (on bounds is considered within).
   *
   * @param {number | TypeParsablePoint} valueOrPosition
   * @return {boolean}
   */
  // Overloads to provide precise return types
  override contains(position: number | TypeParsablePoint): boolean {
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
    if (this.contains(p.x) && this.contains(p.y) && this.contains(p.z)) {
      return true;
    }
    return false;
  }

  /**
   * Returns the max or min bound that is met by a value moving in the positive
   * or negative direction.
   *
   * The return object includes the intersect boundary, the distance to the
   * boundary and the reflected direction.
   *
   * If the value lies outside the bounds, it will first be clipped to the
   * bounds.
   *
   * @param {number} value
   * @return {BoundsIntersect}
   */
  override intersect(
    value: number,
    direction: number = 1,
  ): BoundsValueIntersect {
    // const reflection = direction * -1;
    const { min, max } = this.boundary;
    if (typeof value !== 'number') {
      throw new Error(`FigureOne RangeBounds.intersect only accepts 'number' parameter for value. Provide: ${JSON.stringify(value)}`);
    }
    const v = this.clip(value) as number;

    if (direction === 1) {
      if (max == null) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      return {
        intersect: max,
        distance: Math.abs(v - max),
        reflection: -1,
      };
    }
    if (min == null) {
      return { intersect: null, distance: 0, reflection: direction };
    }
    return {
      intersect: min,
      distance: Math.abs(v - min),
      reflection: 1,
    };
  }

  /**
   * Clip a value or {@link Point} to within a range of bounds.
   *
   * If {@link Point}, then each x, y, and z component of the point will be
   * independently clipped.
   *
   * @param {number | TypeParsablePoint} valueOrPosition
   * @return {number | Point}
   */
  // Overloads to provide precise return types
  override clip(value: number): number;
  override clip(position: TypeParsablePoint): Point;
  override clip(valueOrPosition: number | TypeParsablePoint): number | Point {
    if (typeof valueOrPosition === 'number') {
      return clipValue(valueOrPosition, this.boundary.min, this.boundary.max);
    }
    const p = getPoint(valueOrPosition);
    const clipped = p._dup();
    clipped.x = clipValue(p.x, this.boundary.min, this.boundary.max);
    clipped.y = clipValue(p.y, this.boundary.min, this.boundary.max);
    clipped.z = clipValue(p.z, this.boundary.min, this.boundary.max);
    return clipped;
  }
}

/**
 * Recorder state definition of a {@link RectBounds} that represents the
 * precision, left, right, bottom, top, plane position, top direction and
 * right direction of the rectangle
 *
 * ```
 * {
 *   f1Type: 'rectBounds',
 *   state: [
 *     number, number, number, number, number,
 *     [number, number, number],
 *     [number, number, number],
 *     [number, number, number],
 * }
 * ```
 */
export type TypeF1DefRectBounds = {
  f1Type: 'rectBounds',
  state: [
    number, number, number, number, number,
    [number, number, number], [number, number, number], [number, number, number],
  ],
};

/**
 * A RectBounds is a rectangle bounds around a point in a plane.

 * It is defined by:
 * - a position in plane around which rectangle is formed
 * - topDirection/rightDirection vectors that orient the rectangle
 * - left/right magnitudes that define the width of the rectangle
 * - bottom/top magnitudes that define the height of the rectangle
 *
 * ```
----------------------------------------------     A
|                                            |     |
|        Top Vector                          |     |
|             A                              |     | top
|             |                              |     |
|             |                              |     |
|    position *----->                        |   ---
|                   Right Vector             |     |
|                                            |     | bottom
|                                            |     |
----------------------------------------------     V
.             |
.             |
<-------------|----------------------------->
    left                right
```
 * A rectangle can be defined in one of several ways:
 * - position, plane normal, one direction vecvtor (top or right)
 * - position, top and right direction vectors
 *
 * By default the rectangle will be in the XY plane (+z normal) with a
 * rightDirection vector along the +x axis.
 *
 * @property {TypeParsablePoint} [position]
 * @property {TypeParsablePoint} [normal]
 * @property {TypeParsablePoint} [rightDirection]
 * @property {TypeParsablePoint} [topDirection]
 * @property {number} [left]
 * @property {number} [right]
 * @property {number} [top]
 * @property {number} [bottom]
 * @property {number} [precision] precision with which to calculate boundary
 * `intersect` and `contains` (`8`)
 */
export type OBJ_RectBounds = {
  position?: TypeParsablePoint,
  normal?: TypeParsablePoint,
  rightDirection?: TypeParsablePoint,
  topDirection?: TypeParsablePoint,
  left?: number,
  right?: number,
  // up?: number,
  // down?: number,
  bottom?: number,
  top?: number,
  precision?: number,
};

/**
 * A RectBounds defines a rectangular bounds for a {@link Point}.
 */
class RectBounds extends Bounds {
  plane: Plane;
  rightDirection: Point;
  topDirection: Point;
  left: number;
  right: number;
  bottom: number;
  top: number;
  override boundary!: {
    left: Line;
    right: Line;
    bottom: Line;
    top: Line;
  };

  /**
  * @param {OBJ_RectBounds} boundary
  */
  constructor(boundary: OBJ_RectBounds) {
    const defaultOptions = {
      position: [0, 0, 0],
      normal: [0, 0, 1],
      left: -1,
      right: -1,
      top: 1,
      bottom: 1,
      // bounds: 'inside',
      precision: 8,
    };
    type RectOptions = {
      position: TypeParsablePoint,
      normal: TypeParsablePoint,
      left: number,
      right: number,
      top: number,
      bottom: number,
      precision: number,
      rightDirection?: TypeParsablePoint,
      topDirection?: TypeParsablePoint,
    };
    const o = joinObjects<RectOptions>({}, defaultOptions as any, boundary as any);
    const position = getPoint(o.position);

    // Calculate plane, topDirection and rightDirection of the rectangle
    let plane;
    let rightDirection;
    let topDirection;
    if (o.rightDirection != null && o.topDirection != null) {
      rightDirection = getPoint(o.rightDirection).normalize();
      topDirection = getPoint(o.topDirection).normalize();
      plane = new Plane(position, rightDirection.crossProduct(topDirection));
    } else if (o.rightDirection != null) {
      rightDirection = getPoint(o.rightDirection).normalize();
      plane = new Plane(position, o.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    } else if (o.topDirection != null) {
      topDirection = getPoint(o.topDirection).normalize();
      plane = new Plane(position, o.normal);
      rightDirection = topDirection.crossProduct(plane.n).normalize();
    } else {
      rightDirection = getPoint([1, 0, 0]);
      plane = new Plane(position, o.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    }

    // Calculate the corner points of the rectangle
    let {
      left, right, top, bottom,
    } = o as any;
    let topLeft = null as Point | null;
    let bottomLeft = null as Point | null;
    let topRight = null as Point | null;
    let bottomRight = null as Point | null;
    let centerLeft = null as Point | null;
    let centerRight = null as Point | null;

    centerLeft = position.add(rightDirection.scale(o.left));
    centerRight = position.add(rightDirection.scale(o.right));
    topLeft = centerLeft.add(topDirection.scale(o.top));
    bottomLeft = centerLeft.add(topDirection.scale(o.bottom));
    topRight = centerRight.add(topDirection.scale(o.top));
    bottomRight = centerRight.add(topDirection.scale(o.bottom));
    right = new Line(bottomRight, topRight);
    left = new Line(bottomLeft, topLeft);
    top = new Line(topLeft, topRight);
    bottom = new Line(bottomLeft, bottomRight);

    const b = {
      left,
      right,
      top,
      bottom,
    };
    super(b, o.precision);
    this.plane = plane;
    // this.position = position;
    this.topDirection = topDirection;
    this.rightDirection = rightDirection;
    this.left = o.left;
    this.right = o.right;
    this.bottom = o.bottom;
    this.top = o.top;
  }

  override isDefined() {
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

  override _dup() {
    return new RectBounds({
      // bounds: this.bounds,
      precision: this.precision,
      left: this.left,
      right: this.right,
      bottom: this.bottom,
      top: this.top,
      position: this.plane.p,
      topDirection: this.topDirection,
      rightDirection: this.rightDirection,
    });
  }

  /**
   * Return a bounds copy with all values rounded to a precision.
   *
   * @param {number} precision
   * @return {RectBounds}
   */
  round(precision: number = 8): RectBounds {
    const d = this._dup();
    d.left = round(d.left, precision);
    d.right = round(d.right, precision);
    d.bottom = round(d.bottom, precision);
    d.top = round(d.top, precision);
    d.boundary.left = d.boundary.left.round(precision);
    d.boundary.right = d.boundary.right.round(precision);
    d.boundary.top = d.boundary.top.round(precision);
    d.boundary.bottom = d.boundary.bottom.round(precision);
    d.plane = d.plane.round(precision);
    d.rightDirection = d.rightDirection.round(precision);
    d.topDirection = d.topDirection.round(precision);
    return d;
  }

  override _state(options: { precision: number }): TypeF1DefRectBounds {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
  f1Type: 'rectBounds',
      state: [
        this.precision,
        roundNum(this.left, precision),
        roundNum(this.right, precision),
        roundNum(this.bottom, precision),
        roundNum(this.top, precision),
  this.plane.p.toArray(3) as [number, number, number],
  this.topDirection.toArray(3) as [number, number, number],
  this.rightDirection.toArray(3) as [number, number, number],
      ],
    };
  }

  /*
  We wish to see if some point p is within (or on) a rectangle bounds defined
  by a main position, a rightVector (scaled by left or right) and a topVector
  (scaled by bottom or top).

  **********************************************     A
  *                                            *     |
  *        Top Vector              p           *     |
  *             A                 *            *     | top
  *             |                              *     |
  *             |                              *     |
  *    position *----->                        *   ---
  *                   Right Vector             *     |
  *                                            *     | bottom
  *                                            *     |
  **********************************************     V
                |
                |
  <-------------|----------------------------->
      left                right

  - Create a vector posP and project it onto RightVector
  - If the scalar projection is positive, then it is in the same direciton as
    right vector, and the bound to check will be the right bound
  - The abs value of the scalar projection must be less than or equal to the
    bound to be contained in that direction.
  - Repeat the same for the topDirection.
  */

  /**
   * Return `true` if `position` is within the rectangular bounds.
   *
   * If `projectToPlane` is `false`, then position must be on plane, otherwise
   * if `true` then point will be projected to the plane before checking if it
   * within the rectangle.
   *
   * @param {TypeParsablePoint} position
   * @param {boolean} projectToPlane
   * @return {boolean}
   */
  override contains(position: TypeParsablePoint, projectToPlane: boolean = true): boolean {
    if (projectToPlane === false && !this.plane.hasPointOn(position)) {
      return false;
    }
    const p = this.plane.pointProjection(position).round(this.precision);
    const posP = p.sub(this.plane.p);
    const rightProjection = posP.projectOn(this.rightDirection);
    const topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top || topProjection < this.bottom) {
      return false;
    }
    if (rightProjection > this.right || rightProjection < this.left) {
      return false;
    }
    return true;
  }

  /*
  We wish to clip a point p, in bounds rectangle is defined by a main position,
  a rightVector (scaled by left or right) and topVector (scaled by bottom or
  top).

  **********************************************     A
  *                                            *     |
  *        Top Vector              p           *     |
  *             A                 *            *     | top
  *             |                              *     |
  *             |                              *     |
  *    position *----->                        *   ---
  *                   Right Vector             *     |
  *                                            *     | bottom
  *                                            *     |
  **********************************************     V
                |
                |
  <-------------|----------------------------->
      left                right

  - Create a vector posP
  - Project it onto rightDirection
  - If the projection is > 0 and the projection > right, then clip to right
  - If the projection is < 0 and the abs(projection) > left, then clip to left
  - Find clipped topDirection projection
  - Scale unitVector of posP by clipped projections and add to position

  To do so, first calculate the angle (theta) between right vector and p vector
  (both relative to position).

  |p|cos(theta) will give current right/left magnitude of p
  |p|sin(theta) will give current bottom/top magnitude of p

  To clip, take the minimum of these magnitudes vs right/left or bottom/top
  */

  /**
   * Clip a position to the bounds rectangle. If the position is off plane, then
   * it will first be projected to the plane.
   *
   *
   * @param {TypeParsablePoint} position
   * @return {Point}
   */
  override clip(position: TypeParsablePoint): Point {
    // First project point onto plane
    const p = this.plane.pointProjection(getPoint(position)).round(this.precision);

    // If the point is equal to the plane position, then it is inside (as left,
    // right, top, and bottom cannot be negative)
    if (p.isEqualTo(this.plane.p)) {
      return p._dup();
    }

    const posP = p.sub(this.plane.p);

    let rightProjection = posP.projectOn(this.rightDirection);
    if (rightProjection > this.right) {
      rightProjection = this.right;
    } else if (rightProjection < this.left) {
      rightProjection = this.left;
    }
    let topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top) {
      topProjection = this.top;
    } else if (topProjection < this.bottom) {
      topProjection = this.bottom;
    }

    return this.plane.p
      .add(this.rightDirection.scale(rightProjection))
      .add(this.topDirection.scale(topProjection));
  }


  getBoundIntersect(
    position: Point,
    direction: Point,
    posBound: Line,
    negBound: Line,
    posDirection: Point,
  ): { intersect: Point, distance: number, normal: Point } | null {
    const dMag = direction.length();
    const theta = Math.acos(
      direction.dotProduct(posDirection) / dMag / posDirection.length(),
    );

    const projection = dMag * Math.cos(theta);
    let bound: Line | undefined;
    let boundNormal: Point | undefined;
    if (projection < 0) {
      bound = negBound;
      boundNormal = posDirection;
    }
    if (projection > 0) {
      bound = posBound;
      boundNormal = posDirection.scale(-1);
    }
    if (bound == null) {
      return null;
    }

    const l = new Line({ p1: position, p2: position.add(direction), ends: 1 });
    const i = bound.intersectsWith(l);
    if (
      i.intersect == null
      || i.collinear
      || !bound.hasPointOn(i.intersect, this.precision)
    ) {
      return null;
    }

    return {
      intersect: i.intersect,
      distance: i.intersect.distance(position),
      normal: boundNormal as Point,
    };
  }

  /**
   * Return the intersect between a `position` moving in some `direction` and
   * the four boundaries of the rectangle.
   *
   * @param {TypeParsablePoint} position
   * @param {TypeParsablePoint} direction direction vector
   * @return {BoundsIntersect}
   */
  override intersect(
    position: TypeParsablePoint,
    direction: TypeParsablePoint,
  ): BoundsPointIntersect {
    const p = this.clip(getPoint(position)).round(this.precision);
    const d = this.plane
      .pointProjection(this.plane.p.add(getPoint(direction).normalize()))
      .sub(this.plane.p);

    const {
      left, right, top, bottom,
    } = this.boundary as any;

    // Get the right direction intersect and top direction intersects.
    // If the intersects don't exist, a null will be returned.
    const rI = this.getBoundIntersect(p, d, right, left, this.rightDirection);
    const tI = this.getBoundIntersect(p, d, top, bottom, this.topDirection);

    if (rI == null && tI == null) {
      return { intersect: null, distance: 0, reflection: d };
    }
    let intersect: Point;
    let distance: number;
    let normal: Point;
    // If only the right intersect exists, then it is our intersect
    if (rI != null && tI == null) {
      ({ intersect, distance, normal } = rI);
    // If only the top intersect exists, then it is our intersect
    } else if (tI != null && rI == null) {
      ({ intersect, distance, normal } = tI);
    // If both intersects exist, then take the one with the smallest distance
    } else if (rI && tI && rI.distance > tI.distance) {
      ({ intersect, distance, normal } = tI);
    } else if (rI && tI && tI.distance > rI.distance) {
      ({ intersect, distance, normal } = rI);
    // If the distances (and thus intersect points) are equal, then reflect
    // the direction fully
    } else {
      return {
        intersect: (rI as any).intersect,
        distance: (rI as any).distance,
        reflection: d.scale(-1),
      };
    }

    // Perform a reflection off the boundary.
    // `this.getBoundIntersect` returns a normal vector that defines the
    // boundary as a plane perpendicular to the plane of motion.
    // This perpendicular boundary plane is used to calculate the reflection.
    // From: https://www.3dkingdoms.com/weekly/weekly.php?a=2
    const V = d;
    const N = normal;
    const R = N.scale(-2 * (N.dotProduct(V))).add(V).normalize();
    return {
      distance,
      intersect,
      reflection: R,
    };
  }
}

// export type OBJ_RectBoundsLegacy = {
//   left?: number | null,
//   bottom?: number | null,
//   right?: number | null,
//   top?: number | null,
//   bounds?: 'inside' | 'outside',
//   precision?: number,
// } | Rect;


/**
 * A line bounds defines a line boundary.
 *
 * @property {TypeParsableLine} [line]
 * @property {number} [precision] precision with which to calculate boundary
 * `intersect` and `contains` (`8`)
 */
export type OBJ_LineBounds = OBJ_LineDefinition
  & {
    precision?: number,
    line?: TypeParsableLine,
  };

/**
 * Recorder state definition of a {@link LineBounds} that represents the
 * precision, first point, second point and number of ends.
 *
 * ```
 * {
 *   f1Type: 'lineBounds',
 *   state: [
 *     number,
 *     [number, number, number],
 *     [number, number, number],
 *     2 | 1 | 0,
 * }
 * ```
 */
export type TypeF1DefLineBounds = {
  f1Type: 'lineBounds',
  state: [number, [number, number, number], [number, number, number], 2 | 1 | 0],
};

/**
 * A Line defines a line bounds for a {@link Point}.
 */
class LineBounds extends Bounds {
  override boundary!: Line;
  
  override isDefined(): boolean {
    return true;
  }
  override _dup(): LineBounds {
    return new LineBounds({
      precision: this.precision,
      line: this.boundary,
    });
  }

  /**
   * @param {OBJ_LineBounds} boundary
   */
  constructor(boundary: OBJ_LineBounds) {
    let boundaryToUse;
    const defaultOptions = {
      precision: 8,
    };
    const options = joinObjects({}, defaultOptions, boundary);
    if ((options as any).line != null) {
      boundaryToUse = getLine((options as any).line);
    } else {
      boundaryToUse = getLine(options as any);
    }

    super(boundaryToUse, (options as any).precision);
  }

  override _state(options: { precision: number }): TypeF1DefLineBounds {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'lineBounds' as const,
      state: [
        this.precision,
        [
          roundNum(this.boundary.p1.x, precision),
          roundNum(this.boundary.p1.y, precision),
          roundNum(this.boundary.p1.z, precision),
        ],
        [
          roundNum(this.boundary.p2.x, precision),
          roundNum(this.boundary.p2.y, precision),
          roundNum(this.boundary.p2.z, precision),
        ],
        this.boundary.ends,
      ],
    };
  }

  /**
   * Check if a position is within a line
   *
   * @param {TypeParsablePoint} position
   * @return {boolean}
   */
  override contains(position: TypeParsablePoint): boolean {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.contains only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.hasPointOn(p, this.precision);
  }

  /**
   * Clip a position to a line. The point will be projected to the line before
   * clipping.
   *
   * @param {TypeParsablePoint} position
   * @return {Point}
   */
  override clip(position: number | TypeParsablePoint): Point {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.clip only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.clipPoint(p, this.precision);
  }

  // The intersect of a Line Boundary can be its finite end points
  //  - p1 only if 1 ended
  //  - p1 or p2 if 2 ended

  /**
   * Return the intersect between a `position` moving in some `direction` and
   * the ends of the line boundary.
   *
   * The position and direction vector will first be projected onto the line
   * before finding the intersect.
   *
   * @param {TypeParsablePoint} position
   * @param {TypeParsablePoint} direction direction vector
   * @return {BoundsIntersect}
   */
  override intersect(position: TypeParsablePoint, direction: TypeParsablePoint): BoundsPointIntersect {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.clip only accepts a point: ${position}`);
    }
    // First project the point and velocity onto the boundary line
    const p = this.boundary.clipPoint(position);
    const boundaryDir = this.boundary.unitVector();
    const dir = getPoint(direction).componentAlong(boundaryDir).normalize();

    // If the line is unbounded, then there is no intersect
    if (
      this.boundary.ends === 0   // Unbounded line will have no intersect
    ) {
      return {
        intersect: null,
        distance: 0,
        reflection: dir,
      };
    }

    const b = this.boundary;
    const p1 = this.boundary.p1._dup();
    const p2 = this.boundary.p2._dup();
    const dProjection = dir.projectOn(boundaryDir);

    // Positive dProjection means direction is along p1->p2
    // A one ended line is only bounded at p1, therefore if dProjecttion
    // is positive, there can only be an intersect if there are two lines.
    if (dProjection > 0) {
      if (b.ends === 2) {
        return {
          intersect: p2,
          distance: p.distance(p2),
          reflection: dir.scale(-1),
        };
      }
      return {
        intersect: null,
        distance: 0,
        reflection: dir,
      };
    }

    // Negative dProjection means the dirction is p2->p1
    if (dProjection < 0) {
      return {
        intersect: p1,
        distance: p.distance(p1),
        reflection: dir.scale(-1),
      };
    }

    throw new Error('LineBounds.intersect error - could not find intersect');
  }
}

/**
 * Parsable bounds definition.
 *
 * `null | `{@link Bounds}
  | {@link RectBounds}` | `{@link LineBounds}` | `{@link RangeBounds}
 ` | `{@link OBJ_RectBounds}` | `{@link OBJ_LineBounds}` | `{@link OBJ_RangeBounds}
 ` | `{@link TypeF1DefRangeBounds}` | `{@link TypeF1DefRectBounds}` | `{@link TypeF1DefLineBounds}
 */
export type TypeParsableBounds = null | Bounds
  | RectBounds | LineBounds | RangeBounds
  | OBJ_RectBounds | OBJ_LineBounds | OBJ_RangeBounds
  | TypeF1DefRangeBounds | TypeF1DefRectBounds | TypeF1DefLineBounds

/**
 * Get bounds from a parsable bounds.
 */
function getBounds(
  bounds: TypeParsableBounds,
): Bounds | RectBounds | LineBounds | RangeBounds {
  if (bounds == null) {
    return new Bounds();
  }
  if (bounds instanceof Bounds) {
    return bounds as Bounds;
  }

  const anyBounds: any = bounds as any;
  if (anyBounds.min !== undefined || anyBounds.max !== undefined) {
    return new RangeBounds(anyBounds);
  }
  if (
    anyBounds.left !== undefined
    || anyBounds.right !== undefined
    || anyBounds.top !== undefined
    || anyBounds.bottom !== undefined
    || anyBounds.position !== undefined
    || anyBounds.normal !== undefined
    || anyBounds.rightDirection !== undefined
    || anyBounds.topDirection !== undefined
  ) {
    return new RectBounds(anyBounds);
  }
  if (
    anyBounds.line !== undefined
    || anyBounds.p1 !== undefined
    || anyBounds.p2 !== undefined
    || anyBounds.angle !== undefined
    || anyBounds.mag !== undefined
    || anyBounds.ends !== undefined
  ) {
    return new LineBounds(anyBounds);
  }

  if (anyBounds.f1Type !== undefined && anyBounds.state != null) {
    const { f1Type, state } = anyBounds;
    if (f1Type != null
      && f1Type === 'rangeBounds'
      && state != null
      && Array.isArray(state)
      && state.length === 3
    ) {
      const [precision, min, max] = state as [number, number | null, number | null];
      return new RangeBounds({
        precision, min, max,
      });
    }

    if (f1Type != null
      && f1Type === 'rectBounds'
      && state != null
      && Array.isArray(state)
      && state.length === 8
    ) {
      const [
        precision, left, right, bottom, top, position, topDirection, rightDirection,
      ] = state as [number, number, number, number, number, TypeParsablePoint, TypeParsablePoint, TypeParsablePoint];
      return new RectBounds({
        precision, left, right, bottom, top, position, topDirection, rightDirection,
      });
    }
    if (f1Type != null
      && f1Type === 'lineBounds'
      && state != null
      && Array.isArray(state)
      && state.length === 4
    ) {
      const [precision, p1, p2, ends] = state as [number, TypeParsablePoint, TypeParsablePoint, 2 | 1 | 0];
      return new LineBounds({
        precision,
        p1,
        p2,
        ends,
      });
    }
  }
  throw new Error(`Cannot parse bounds ${JSON.stringify(bounds)}`);
}

export {
  RangeBounds,
  Bounds,
  LineBounds,
  RectBounds,
  getBounds,
};
