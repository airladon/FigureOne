// @flow
/* eslint-disable no-use-before-define */
import {
  roundNum, clipMag, clipValue, rand2D, round,
} from './math';
import { joinObjects } from './tools';
import * as m3 from './m3';
import type { Type3DMatrix } from './m3';
import type { TypeParsablePoint } from './geometry/Point';
import {
  getPoint, isParsablePoint, getPoints, getScale, parsePoint, Point,
} from './geometry/Point';
import {
  clipAngle, getPrecision,
} from './geometry/common';
import {
  toDelta, translationPath,
} from './geometry/Path';
import {
  Plane, getPlane, isParsablePlane,
} from './geometry/Plane';
import type { TypeParsablePlane } from './geometry/Plane';
import {
  Line, getLine,
} from './geometry/Line';
// eslint-disable-next-line import/no-cycle
import {
  Transform, getTransform, isParsableTransform, decelerateTransform,
} from './geometry/Transform';
// eslint-disable-next-line import/no-cycle
import {
  deceleratePoint, decelerateValue,
} from './geometry/deceleration';
import type { TypeParsableLine } from './geometry/Line';
import type { TypeParsableRect } from './geometry/Rect';
import type { TypeTransformValue, TypeParsableTransform } from './geometry/Transform';
import { Rect, getRect } from './geometry/Rect';
import { rectToPolar, polarToRect } from './geometry/coordinates';

// import { joinObjects } from './tools';

type Type3Components = [number, number, number];
type Type2Components = [number, number];

export type {
  TypeParsableTransform,
  TypeTransformValue,
  TypeParsablePoint,
  TypeParsableRect,
  TypeParsableLine,
  Type3Components,
  Type2Components,
  TypeParsablePlane,
};

// function distance(p1: Point, p2: Point) {
//   return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
// }

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
}

function getDeltaAngle3D(
  startAngle: Point,
  targetAngle: Point,
  rotDirection: TypeRotationDirection = 0,
) {
  const delta = new Point(0, 0, 0);
  delta.x = getDeltaAngle(startAngle.x, targetAngle.x, rotDirection);
  delta.y = getDeltaAngle(startAngle.y, targetAngle.y, rotDirection);
  delta.z = getDeltaAngle(startAngle.z, targetAngle.z, rotDirection);
  return delta;
}

// export type TypeTransformValue = number | Array<number> | {
//   scale?: number,
//   position?: number,
//   translation?: number,
//   rotation?: number,
// };

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


function spaceToSpaceTransform(
  s1: {
    x: { min: number, span: number },
    y: { min: number, span: number },
    z: { min: number, span: number },
  },
  s2: {
    x: { min: number, span: number },
    y: { min: number, span: number },
    z: { min: number, span: number },
  },
  name: string = '',
) {
  const xScale = s2.x.span / s1.x.span;
  const yScale = s2.y.span / s1.y.span;
  const zScale = s2.z.span / s1.z.span;
  const t = new Transform(name)
    .scale(xScale, yScale, zScale)
    .translate(
      s2.x.min - s1.x.min * xScale,
      s2.y.min - s1.y.min * yScale,
      s2.z.min - s1.z.min * zScale,
    );
  return t;
}

function spaceToSpaceScale(
  s1: {
    x: { bottomLeft: number, width: number },
    y: { bottomLeft: number, height: number },
    z: { bottomLeft: number, height: number },
  },
  s2: {
    x: { bottomLeft: number, width: number },
    y: { bottomLeft: number, height: number },
    z: { bottomLeft: number, height: number },
  },
) {
  const xScale = s2.x.width / s1.x.width;
  const yScale = s2.y.height / s1.y.height;
  const zScale = s2.z.height / s1.z.height;
  return new Point(xScale, yScale, zScale);
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
  deltaTransform.def.forEach((delta, index) => {
    if (delta[0] === 't' || delta[0] === 's') {
      const v = velocityTransformToUse.def[index];
      if (
        (v[0] === 't' || v[0] === 's')
      ) {
        for (let i = 1; i < 4; i += 1) {
          if (v[i] !== 0) {
            const t = Math.abs(delta[i] / v[i]);
            time = t > time ? t : time;
          }
        }
      }
    }
    const start = startTransform.def[index];
    const target = stopTransform.def[index];
    if (delta[0] === 'r' && start[0] === 'r' && target[0] === 'r') {
      for (let i = 1; i < 4; i += 1) {
        const rotDiff = getDeltaAngle(start[i], target[i], rotDirection);
        // eslint-disable-next-line no-param-reassign
        // delta = rotDiff;
        const v = velocityTransformToUse.def[index][i];
        if (v !== 0) {
          const rTime = Math.abs(rotDiff / v);
          time = rTime > time ? rTime : time;
        }
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
    for (let i = 0; i < velocity.def.length; i += 1) {
      const v = velocity.def[i];
      if (v[0] === 't') {
        v[1] = translationVelocity.x;
        v[2] = translationVelocity.y;
        v[3] = translationVelocity.z;
      } else if (v[0] === 'r') {
        v[1] = rotationVelocity.x;
        v[2] = rotationVelocity.y;
        v[3] = rotationVelocity.z;
      } else {
        v[1] = scaleVelocity.x;
        v[2] = scaleVelocity.y;
        v[3] = scaleVelocity.z;
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
    clipped.z = clipValue(p.z, this.boundary.min, this.boundary.max);
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
          return new Line({
            p1: [h, top], length: 1, angle: -Math.PI / 2, ends: 1,
          });
        }
        if (bottom != null && top == null) {
          return new Line({
            p1: [h, bottom], length: 1, angle: Math.PI / 2, ends: 1,
          });
        }
        if (bottom == null && top == null) {
          return new Line({
            p1: [h, 0], length: 1, angle: Math.PI / 2, ends: 0,
          });
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
          return new Line({
            p1: [right, v], length: 1, angle: -Math.PI, ends: 1,
          });
        }
        if (left != null && right == null) {
          return new Line({
            p1: [left, v], length: 1, angle: 0, ends: 1,
          });
        }
        if (left == null && right == null) {
          return new Line({
            p1: [0, v], length: 1, angle: Math.PI, ends: 0,
          });
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
    const trajectory = new Line({
      p1: p, length: 1, angle: direction, ends: 1,
    });
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
      if (result.onLines && result.intersect != null) {
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
      boundary = new Line({
        p1: options.p1, p2: options.p2, ends: options.ends,
      });
    } else if (options.p1 != null) {
      boundary = new Line({
        p1: options.p1, length: options.mag, angle: options.angle, ends: options.ends,
      });
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
      mag: this.boundary.length(),
      angle: this.boundary.angle(),
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
    return this.boundary.hasPointOn(p, this.precision);
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return position;
    }
    const p = getPoint(position);
    return this.boundary.clipPoint(p, this.precision);
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
    const angleDelta = round(Math.abs(clipAngle(direction, '0to360') - clipAngle(b.angle(), '0to360')), this.precision);

    const d1 = p.distance(p1);
    const d2 = p.distance(p2);

    // If the point is on p1, unless it is inside and going towards p2 the
    // result can be given immediately
    if (p.isEqualTo(p1, this.precision)) {
      if (this.bounds === 'inside' && angleDelta !== 0) {
        return { intersect: p1, distance: 0, reflection: b.angle() };
      }
      if (this.bounds === 'outside' && angleDelta !== 0) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      if (this.bounds === 'outside' && angleDelta === 0) {
        return { intersect: p1, distance: 0, reflection: b.angle() + Math.PI };
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
        return { intersect: p2, distance: 0, reflection: b.angle() + Math.PI };
      }
      if (this.bounds === 'outside' && angleDelta === 0) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      if (this.bounds === 'outside' && angleDelta !== 0) {
        return { intersect: p2, distance: 0, reflection: b.angle() };
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
    const unitVector = this.boundary.unitVector();
    let projection = unitVector.dotProduct(v);
    let ang = this.boundary.angle();
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
      const [precision, def, boundsArray] = state;
      const t = new TransformBounds(new Transform(), {}, precision);
      t.def = def.slice();
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
  def: Array<'t' | 'r' | 's'>;

  constructor(
    transform: Transform,
    bounds: TypeTransformBoundsDefinition = {},
    precision: number = 8,
  ) {
    // let boundary = [];
    const def = transform.def.map(d => d[0]);
    // for (let i = 0; i < transform.def.length; i += 1) {
    //   const transformation = transform.def[i];
    //   def.push()
    //   if (transformation instanceof Translation) {
    //     def.push('t');
    //   } else if (transformation instanceof Scale) {
    //     def.push('s');
    //   } else {
    //     def.push('r');
    //   }
    // }
    super([], 'inside', precision);
    this.def = def;
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
    t.def = this.def.slice();
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
        this.def.slice(),
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
    this.def.forEach((o) => {
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
    for (let i = 0; i < this.def.length; i += 1) {
      const o = this.def[i];
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
    for (let i = 0; i < this.def.length; i += 1) {
      const o = this.def[i];
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
    for (let i = 0; i < t.def.length; i += 1) {
      const transformElement = t.def[i];
      const b = this.boundary[i];                       // $FlowFixMe
      if (
        b != null
        && !b.contains(new Point(
          transformElement[1], transformElement[2], transformElement[3],
        ))
      ) {
        return false;
      }
      // if (transformElement[0] === 'r') {
      //   if (b != null && !b.contains(transformElement.r)) {
      //     return false;
      //   }
      // } else if (b != null && !b.contains(new Point(transformElement.x, transformElement.y))) {
      //   return false;
      // }
    }
    return true;
  }

  // $FlowFixMe
  clip(t: Transform) {
    const def = [];
    for (let i = 0; i < t.def.length; i += 1) {
      const transformElement = t.def[i];
      const b = this.boundary[i];
      if (b != null) {
        // let clipped;
        // if (transformElement[0] === 'r' ||) {
        //   clipped = b.clip(transformElement.r);
        // } else {
        const clipped = b.clip(new Point(
          transformElement[1], transformElement[2], transformElement[3],
        ));
        // }
        const newElement = [transformElement[0], clipped.x, clipped.y, clipped.z];
        // if (transformElement instanceof Translation) {
        //   newElement = new Translation(clipped.x, clipped.y, transformElement.name);
        // } else if (transformElement instanceof Scale) {
        //   newElement = new Scale(clipped.x, clipped.y, transformElement.name);
        // } else {
        //   newElement = new Rotation(clipped, transformElement.name);
        // }

        // clipped.name = transformElement.name;
        def.push(newElement);
      } else {
        def.push(transformElement.slice());
      }
    }
    return new Transform(def, t.name);
  }
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

export {
  Point,
  Line,
  // distance,
  minAngleDiff,
  deg,
  normAngle,
  Transform,
  Rect,
  spaceToSpaceTransform,
  getBoundingRect,
  polarToRect,
  rectToPolar,
  getDeltaAngle,
  getDeltaAngle3D,
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
  // Vector,
  // transformValueToArray,
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
  Plane,
  getPlane,
  isParsablePlane,
  // Line3,
  toDelta,
};
