// @flow
import type { Type3Components } from './types';

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

function dotProduct(a: Type3Components, b: Type3Components) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function quadraticBezier(P0: number, P1: number, P2: number, t: number) {
  return (1 - t) * ((1 - t) * P0 + t * P1) + t * ((1 - t) * P1 + t * P2);
}

function cartesianToSpherical(
  x: number, y: number = 0, z: number = 0,
) {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);
  return [r, theta, phi];
}

function sphericalToCartesian(
  r: number, theta: number, phi: number,
) {
  return [
    r * Math.cos(phi) * Math.sin(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(theta),
  ];
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
  // Modular 2π gives -360to360
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

export {
  getPrecision,
  dotProduct,
  quadraticBezier,
  cartesianToSpherical,
  sphericalToCartesian,
  clipAngle,
};
