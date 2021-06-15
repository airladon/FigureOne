// @flow
/* eslint-disable no-use-before-define */
import { rand2D } from './math';
import { joinObjects } from './tools';
import type { TypeParsablePoint } from './geometry/Point';
import {
  getPoint, isParsablePoint, getPoints, getScale, parsePoint, Point,
} from './geometry/Point';
import { clipAngle } from './geometry/common';
import { toDelta } from './geometry/Path';
import { Plane, getPlane, isParsablePlane } from './geometry/Plane';
import type { TypeParsablePlane } from './geometry/Plane';
import { Line, getLine } from './geometry/Line';
import {
  Transform, getTransform, isParsableTransform,
} from './geometry/Transform';
import {
  deceleratePoint, decelerateValue, decelerateTransform,
} from './geometry/deceleration';
import type { TypeParsableLine } from './geometry/Line';
import type { TypeParsableRect } from './geometry/Rect';
import type { TypeTransformValue, TypeParsableTransform } from './geometry/Transform';
import { Rect, getRect } from './geometry/Rect';
import { rectToPolar, polarToRect } from './geometry/coordinates';
import {
  RectBounds, LineBounds, Bounds, TransformBounds, RangeBounds, getBounds,
} from './geometry/Bounds';


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
