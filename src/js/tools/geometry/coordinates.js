// @flow
import { Point } from './Point';

/**
 * Polar coordinates to cartesian coordinates conversion
 *
 * @example
 * const polarToRect = Fig.polarToRect;
 * const p = polarToRect(Math.sqrt(2), Math.PI / 4);
 * console.log(p);
 * // Point {x: 1, y: 1)
 */
function polarToRect(mag: number, angle: number, theta: number | null = null) {
  if (theta === null) {
    return new Point(
      mag * Math.cos(angle),
      mag * Math.sin(angle),
    );
  }
  return new Point(
    mag * Math.cos(angle) * Math.sin(theta),
    mag * Math.sin(angle) * Math.sin(theta),
    mag * Math.cos(theta),
  );
}

/**
 * Cartesian coordinates to polar coordinates conversion
 *
 * @example
* const rectToPolar = Fig.rectToPolar;
* const p = rectToPolar(0, 1);
* console.log(p);
* // {mag: 1, angle: 1.5707963267948966}
 */
function rectToPolar(x: number | Point, y: number = 0, z: number = 0) {
  let rect;
  if (typeof x === 'number') {
    rect = new Point(x, y, z);
  } else {
    rect = x;
  }
  const mag = rect.distance();
  if (mag === 0) {
    return {
      mag: 0,
      angle: 0,
      phi: 0,
      theta: 0,
      r: 0,
    };
  }
  let angle = Math.atan2(rect.y, rect.x);
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  const theta = Math.acos(z / mag);
  return {
    mag,
    angle,
    phi: angle,
    theta,
    r: mag,
  };
}

export {
  rectToPolar,
  polarToRect,
};
