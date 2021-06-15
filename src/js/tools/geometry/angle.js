// @flow
import { Point } from './Point';

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
  // Modulo 2π gives -360to360
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

/**
 * Normalize angle to between 0 and 2π.
 */
function normAngle(angle: number) {
  return clipAngle(angle, '0to360');
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

/**
 * TypeRotationDirection = 0 | 1 | 2 | -1 | null
 *
 * - 0: quickest direction
 * - 1: positive direction (CCW in 2D)
 * - -1: negative direction (CW in 2D)
 * - 2: not through zero
 * - null: returns numerical delta angle
 */
export type TypeRotationDirection = 0 | 1 | 2 | -1 | null;

// 0 is quickest direction
// 1 is positive direction (CCW in XY plane)
// -1 is negative direction (CW in XY plane)
// 2 is not through 0
// 3 is numerical
/**
 * Get angle delta based on direction
 */
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

/**
 * Get delta angle of a Point where the x, y, z components are rotations
 * around the x, y, and z axes.
 */
function getDeltaAngle3D(
  startAngle: Point,
  targetAngle: Point,
  rotDirection: TypeRotationDirection
    | [TypeRotationDirection, TypeRotationDirection, TypeRotationDirection] = 0,
) {
  const delta = new Point(0, 0, 0);
  let direction: [TypeRotationDirection, TypeRotationDirection, TypeRotationDirection];
  if (typeof rotDirection === 'number' || rotDirection == null) {
    direction = [rotDirection, rotDirection, rotDirection];
  } else {
    direction = rotDirection;
  }
  delta.x = getDeltaAngle(startAngle.x, targetAngle.x, direction[0]);
  delta.y = getDeltaAngle(startAngle.y, targetAngle.y, direction[1]);
  delta.z = getDeltaAngle(startAngle.z, targetAngle.z, direction[2]);
  return delta;
}


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


export {
  deg,
  minAngleDiff,
  getDeltaAngle3D,
  getDeltaAngle,
  normAngleTo90,
  threePointAngle,
  threePointAngleMin,
  clipAngle,
  normAngle,
};
