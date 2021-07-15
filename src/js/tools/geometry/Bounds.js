// @flow
/* eslint-disable no-use-before-define */
import { Point, getPoint } from './Point';
import { Rect } from './Rect';
import { Plane } from './Plane';
import { joinObjects } from '../tools';
import { getPrecision } from './common';
import { Line, getLine } from './Line';
import { roundNum, round, clipValue } from '../math';
import type { TypeParsablePoint } from './Point';
import type { OBJ_LineDefinition } from './Line';


export type TypeTransformBounds = Array<Bounds | null>;

class Bounds {
  boundary: Object;
  precision: number;
  // bounds: 'inside' | 'outside';

  constructor(
    boundary: Object,
    // bounds: 'inside' | 'outside' = 'inside',
    precision: number = 8,
  ) {
    this.boundary = boundary;
    // this.bounds = bounds;
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
export type TypeRangeBoundsDefinition = {
  min?: number | null,
  max?: number | null,
  precision?: number,
};

type TypeF1DefRangeBounds = {
  f1Type: 'rangeBounds',
  state: [number, number | null, number | null],
};

class RangeBounds extends Bounds {
  boundary: { min: number | null, max: number | null };

  constructor(optionsIn: TypeRangeBoundsDefinition) {
    const defaultOptions = {
      precision: 8,
      min: null,
      max: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const boundary = {
      min: options.min,
      max: options.max,
    };
    super(boundary, options.precision);
  }

  isDefined() {
    if (this.boundary.min == null && this.boundary.max == null) {
      return false;
    }
    return true;
  }

  _dup() {
    return new RangeBounds({
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
    if (this.contains(p.x) && this.contains(p.y) && this.contains(p.z)) {
      return true;
    }
    return false;
  }

  intersect(
    position: number | TypeParsablePoint,
    direction: number = 1,
  ) {
    const reflection = direction * -1;
    const { min, max } = this.boundary;
    if (typeof position !== 'number') {
      throw new Error(`FigureOne RangeBounds.intersect only accepts 'number' parameter for value. Provide: ${position}`);
    }
    // if (!(typeof position === 'number')) {
    //   return {
    //     intersect: null,
    //     distance: 0,
    //     reflection: direction,
    //   };
    // }

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
    clipped.z = clipValue(p.z, this.boundary.min, this.boundary.max);
    return clipped;
  }
}


/**
 * A RectBounds is a rectangle around a point in a plane.

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
              |
              |
<-------------|----------------------------->
    left                right
```
 * A rectangle can be defined in one of several ways:
 * - position, plane normal, one direction vecvtor (top or right)
 * - position, top and right direction vectors
 *
 * The left, right, up, and down values must all be >= 0.
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
 * @property {number} [up]
 * @property {number} [down]
 * @property {number} [precision] precision with which to calculate boundary
 * `intersect` and `contains` (`8`)
 */
export type TypeRectBoundsDefinition = {
  position?: TypeParsablePoint,
  normal?: TypeParsablePoint,
  rightDirection?: TypeParsablePoint,
  topDirection?: TypeParsablePoint,
  left?: number,
  right?: number,
  up?: number,
  down?: number,
  pecision?: number,
};

// $FlowFixMe
class RectBounds extends Bounds {
  plane: Plane;
  rightDirection: Point;
  topDirection: Point;
  left: number;
  right: number;
  bottom: number;
  top: number;
  boundary: {
    left: Line;
    right: Line;
    bottom: Line;
    top: Line;
  };

  constructor(optionsOrRect: TypeRectBoundsDefinition) {
    const defaultOptions = {
      position: [0, 0, 0],
      normal: [0, 0, 1],
      left: 1,
      right: 1,
      top: 1,
      bottom: 1,
      bounds: 'inside',
      precision: 8,
    };
    const options = joinObjects({}, defaultOptions, optionsOrRect);
    const position = getPoint(options.position);

    // Calculate plane, topDirection and rightDirection of the rectangle
    let plane;
    let rightDirection;
    let topDirection;
    if (options.rightDirection != null && options.topDirection != null) {
      rightDirection = getPoint(options.rightDirection).normalize();
      topDirection = getPoint(options.topDirection).normalize();
      plane = new Plane(position, rightDirection.crossProduct(topDirection));
    } else if (options.rightDirection != null) {
      rightDirection = getPoint(options.rightDirection).normalize();
      plane = new Plane(position, options.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    } else if (options.topDirection != null) {
      topDirection = getPoint(options.topDirection).normalize();
      plane = new Plane(position, options.normal);
      rightDirection = topDirection.crossProduct(plane.n).normalize();
    } else {
      rightDirection = getPoint([1, 0, 0]);
      plane = new Plane(position, options.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    }

    // Calculate the corner points of the rectangle
    let {
      left, right, top, bottom,
    } = options;
    let topLeft = null;
    let bottomLeft = null;
    let topRight = null;
    let bottomRight = null;
    let centerLeft = null;
    let centerRight = null;

    centerLeft = position.add(rightDirection.scale(-1 * options.left));
    centerRight = position.add(rightDirection.scale(options.right));
    topLeft = centerLeft.add(topDirection.scale(options.top));
    bottomLeft = centerLeft.add(topDirection.scale(-1 * options.bottom));
    topRight = centerRight.add(topDirection.scale(options.top));
    bottomRight = centerRight.add(topDirection.scale(-1 * options.bottom));
    right = new Line(bottomRight, topRight);
    left = new Line(bottomLeft, topLeft);
    top = new Line(topLeft, topRight);
    bottom = new Line(bottomLeft, bottomRight);

    const boundary = {
      left,
      right,
      top,
      bottom,
    };
    super(boundary, options.precision);
    this.plane = plane;
    this.position = position;
    this.topDirection = topDirection;
    this.rightDirection = rightDirection;
    this.left = options.left;
    this.right = options.right;
    this.bottom = options.bottom;
    this.top = options.top;
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
      left: this.left,
      right: this.right,
      bottom: this.bottom,
      top: this.top,
      position: this.position,
      topDirection: this.topDirection,
      rightDirection: this.rightDirection,
    });
  }

  round(precision: number = 8) {
    const d = this._dup();
    d.left = round(d.left, precision);
    d.right = round(d.left, precision);
    d.bottom = round(d.left, precision);
    d.top = round(d.left, precision);
    d.boundary.left = d.boundary.left.round(precision);
    d.boundary.right = d.boundary.right.round(precision);
    d.boundary.top = d.boundary.top.round(precision);
    d.boundary.bottom = d.boundary.bottom.round(precision);
    d.plane = d.plane.round(precision);
    d.rightDirection = d.rightDirection.round(precision);
    d.topDirection = d.topDirection.round(precision);
  }

  _state(options: { precision: number }) {
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
        this.position.toArray(),
        this.topDirection.toArray(),
        this.rightDirection.toArray(),
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
  contains(position: TypeParsablePoint, projectToPlane: boolean = true) {
    if (projectToPlane === false && !this.plane.hasPointOn(position)) {
      return false;
    }
    const p = this.plane.pointProjection(position).round(this.precision);
    const posP = p.sub(this.plane.p);
    const rightProjection = posP.projectOn(this.rightDirection);
    const topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top || -topProjection > this.bottom) {
      return false;
    }
    if (rightProjection > this.right || -rightProjection > this.left) {
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
  clip(position: TypeParsablePoint) {
    // First project point onto plane
    const p = this.plane.pointProjection(getPoint(position)).round(this.precision);

    // If the point is equal to the plane position, then it is inside (as left,
    // right, top, and bottom cannot be negative)
    if (p.isEqualTo(this.position)) {
      return p._dup();
    }

    const posP = p.sub(this.plane.p);

    let rightProjection = posP.projectOn(this.rightDirection);
    if (rightProjection > this.right) {
      rightProjection = this.right;
    } else if (rightProjection < -this.left) {
      rightProjection = -this.left;
    }
    let topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top) {
      topProjection = this.top;
    } else if (topProjection < -this.bottom) {
      topProjection = -this.bottom;
    }

    return this.position
      .add(this.rightDirection.scale(rightProjection))
      .add(this.topDirection.scale(topProjection));
  }


  getBoundIntersect(
    position: Point,
    direction: Point,
    posBound: Line,
    negBound: Line,
    posDirection: Point,
  ) {
    const dMag = direction.length();
    const theta = Math.acos(
      direction.dotProduct(posDirection) / dMag / posDirection.length(),
    );

    const projection = dMag * Math.cos(theta);
    let bound;
    let boundNormal;
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
      normal: boundNormal,
    };
  }

  intersect(
    position: TypeParsablePoint,
    direction: TypeParsablePoint,
  ) {
    const p = this.clip(getPoint(position)).round(this.precision);
    const d = this.plane
      .pointProjection(this.plane.p.add(getPoint(direction).normalize()))
      .sub(this.plane.p);

    const {
      left, right, top, bottom,
    } = this.boundary;

    // Get the right direction intersect and top direction intersects.
    // If the intersects don't exist, a null will be returned.
    const rI = this.getBoundIntersect(p, d, right, left, this.rightDirection);
    const tI = this.getBoundIntersect(p, d, top, bottom, this.topDirection);

    if (rI == null && tI == null) {
      return { intersect: null, distance: 0, reflection: d };
    }
    let intersect;
    let distance;
    let normal;
    // If only the right intersect exists, then it is our intersect
    if (rI != null && tI == null) {
      ({ intersect, distance, normal } = rI);
    // If only the top intersect exists, then it is our intersect
    } else if (tI != null && rI == null) {
      ({ intersect, distance, normal } = tI);
    // If both intersects exist, then take the one with the smallest distance
    } else if (rI.distance > tI.distance) {
      ({ intersect, distance, normal } = tI);
    } else if (tI.distance > rI.distance) {
      ({ intersect, distance, normal } = rI);
    // If the distances (and thus intersect points) are equal, then reflect
    // the direction fully
    } else {
      return {
        intersect: rI.intersect,
        distance: rI.distance,
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

export type TypeRectBoundsDefinitionLegacy = {
  left?: number | null,
  bottom?: number | null,
  right?: number | null,
  top?: number | null,
  bounds?: 'inside' | 'outside',
  precision?: number,
} | Rect;


export type TypeF1DefRectBoundsLegacy = {
  f1Type: 'rectBounds',
  state: ['outside' | 'inside', number, number | null, number | null, number | null, number | null],
};

/**
 * A line bounds defines a line boundary.
 *
 * @property {TypeParsableLine} [line]
 * @property {number} [precision] precision with which to calculate boundary
 * `intersect` and `contains` (`8`)
 */
export type TypeLineBoundsDefinition = OBJ_LineDefinition
  & {
    precision?: number,
    line?: TypeParsableLine,
  };

export type TypeF1DefLineBounds = {
  f1Type: 'lineBounds',
  state: [number, [number, number, number], [number, number, number], 2 | 1 | 0],
};

class LineBounds extends Bounds {
  boundary: Line;

  constructor(optionsIn: TypeLineBoundsDefinition) {
    let boundary;
    const defaultOptions = {
      precision: 8,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.line != null) {
      boundary = getLine(options.line);
    } else {
      boundary = getLine(options);
    }

    super(boundary, options.precision);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined() {
    return true;
  }

  _dup() {
    return new LineBounds({
      precision: this.precision,
      line: this.boundary,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'lineBounds',
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

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.contains only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.hasPointOn(p, this.precision);
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.clip only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.clipPoint(p, this.precision);
  }

  // The intersect of a Line Boundary can be its finite end points
  //  - p1 only if 1 ended
  //  - p1 or p2 if 2 ended
  intersect(position: number | TypeParsablePoint, direction: TypeParsablePoint) {
    // First project the point and velocity onto the boundary line
    const p = this.boundary.clipPoint(position);
    const boundaryDir = this.boundary.unitVector();
    const dir = getPoint(direction).componentAlong(boundaryDir).normalize();

    // If the line is unbounded, then there is no intersect
    if (
      typeof position === 'number'
      || this.boundary.ends === 0   // Unbounded line will have no intersect
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
  // transform: Transform = new Transform(),
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
  // if (type === 'transform') {  // $FlowFixMe
  //   return new TransformBounds(transform, bounds);
  // }
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
  // if (
  //   bounds.translation !== undefined
  //   || bounds.scale !== undefined
  //   || bounds.rotation !== undefined
  // ) {
  //   return getBounds(bounds, 'transform', transform);
  // }

  if (bounds.f1Type !== undefined && bounds.state != null) {
    const { f1Type, state } = bounds;
    if (f1Type != null
      && f1Type === 'rangeBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 3
    ) { // $FlowFixMe
      const [precision, min, max] = state;
      return new RangeBounds({
        precision, min, max,
      });
    }

    if (f1Type != null
      && f1Type === 'rectBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 8
    ) { // $FlowFixMe
      const [
        precision, left, right, bottom, top, position, topDirection, rightDirection,
      ] = state;
      return new RectBounds({
        precision, left, bottom, right, top, position, topDirection, rightDirection,
      });
    }
    if (f1Type != null
      && f1Type === 'lineBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 4
    ) { // $FlowFixMe
      const [precision, p1, p2, ends] = state;
      return new LineBounds({
        precision,
        p1,
        p2,
        ends,
      });
    }
  }
  return null;
}

export {
  // TransformBounds,
  RangeBounds,
  Bounds,
  LineBounds,
  RectBounds,
  getBounds,
};
