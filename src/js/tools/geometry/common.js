// @flow
import type { Type3Components } from './types';

function getPrecision(
  options?: { precision: number },
  defaultPrecision: number = 8,
): number {
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

function dotProduct(a: Type3Components, b: Type3Components): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function quadraticBezier(P0: number, P1: number, P2: number, t: number): number {
  return (1 - t) * ((1 - t) * P0 + t * P1) + t * ((1 - t) * P1 + t * P2);
}

function cartesianToSpherical(
  x: number, y: number = 0, z: number = 0,
): [number, number, number] {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);
  return [r, theta, phi];
}

function sphericalToCartesian(
  r: number, theta: number, phi: number,
): [number, number, number] {
  return [
    r * Math.cos(phi) * Math.sin(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(theta),
  ];
}

export {
  getPrecision,
  dotProduct,
  quadraticBezier,
  cartesianToSpherical,
  sphericalToCartesian,
};
