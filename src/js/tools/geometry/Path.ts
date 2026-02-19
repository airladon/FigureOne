/* eslint-disable no-use-before-define */
import { Point, getPoint } from './Point';
import type { TypeParsablePoint } from './Point';
import { Line } from './Line';
import { quadraticBezier } from './common';
import { clipAngle } from './angle';

// /**
//  * A path can be:
//  * - linear
//  * - quadratic bezier
//  * - cubic bezier
//  */
// class Path {}

function linearPath(
  start: Point,
  delta: Point,
  percent: number,
): Point {
  return start.add(delta.x * percent, delta.y * percent, delta.z * percent);
}

// type linearPathOptionsType = {
// };

/**
 * Curved translation path options, that defineds the control
 * point of a quadratic bezier curve.
 *
 * Use `controlPoint` to define the control point directly. This
 * will override all other properties.
 *
 * Otherwise `direction`, `magnitude` and `offset` can be used
 * to calculate the control point based on the start and end
 * points of the curve.
 *
 * The control point is calculated by:
 * - Define a line from start to target - it will have length `d`
 * - Define a point `P` on the line
 * - Define a control line from point `P` with length `d` and some
 *   angle delta from the original line.
 *
 * The properties then customize this calculation:
 * - `magnitude` will scale the distance d
 * - `offset` will define where on the line point `P` is where `0.5` is
 *   the midpoint and `0.1` is 10% along the line from the start location
 * - `direction` will define which side of the line the control line should be
 *   drawn
 * - `angle` defines the angle delta between the line and the control line - by
 *    default this a right angle (Math.PI / 2)
 *
 * The directions `'up'`, `'down'`, `'left'`, `'right'` all reference the side
 * of the line. The `'positive'`
 * direction is the side of the line that the line would move toward when
 * rotated in the positive direction around the start point. The
 * '`negative`' side of the line is then the opposite side.
 *
 * These directions only work when the `angle` is between `0` and `Math.PI`.
 *
 * @property {TypeParsablePoint | null} controlPoint
 * @property {number} magnitude
 * @property {number} offset
 * @property {number} angle (`Math.PI / 2`)
 * @property {'positive' | 'negative' | 'up' | 'left' | 'down' | 'right'} direction
 * @interface
 * @group Misc Geometry
 */
export type OBJ_QuadraticBezier = {
  // path: '(Point, Point, number) => Point';
  controlPoint: TypeParsablePoint | null;
  angle: number;
  magnitude: number;
  offset: number;
  direction: 'up' | 'left' | 'down' | 'right' | 'positive' | 'negative';
};

/**
 * Translation path options object
 */
export type OBJ_TranslationPath = {
  style?: 'curve' | 'linear' | 'curved',
  angle?: number,
  magnitude?: number,
  offset?: number,
  controlPoint?: TypeParsablePoint | null,
  direction?: 'positive' | 'negative' | 'up' | 'down' | 'left' | 'right',
}

function curvedPath(
  start: Point,
  delta: Point,
  percent: number,
  options: OBJ_TranslationPath,
) {
  const o = options as any;

  let { controlPoint } = options as any;

  if (controlPoint == null) {
    let angleDelta = Math.PI / 2;
    if (o.angle != null) {
      angleDelta = o.angle;
    }
    let offsetToUse = 0;
    if (o.offset != null) {
      offsetToUse = o.offset;
    }
    if (o.direction == null) {
      o.direction = 'positive';
    }
    let magToUse = 1;
    if (o.magnitude != null) {
      magToUse = o.magnitude;
    }
    const displacementLine = new Line(start, start.add(delta));
    const lineAngle = clipAngle(displacementLine.angle(), '0to360');
    const linePoint = start.add(new Point(delta.x * offsetToUse, delta.y * offsetToUse));

    let normLineAngle = lineAngle;
    if (normLineAngle >= Math.PI) {
      normLineAngle -= Math.PI;
    }
    let controlAngle = lineAngle + angleDelta;
    const { direction } = o;

    if (direction === 'positive') {
      controlAngle = lineAngle + angleDelta;
    } else if (direction === 'negative') {
      controlAngle = lineAngle - angleDelta;
    } else if (direction === 'up') {
      if (lineAngle <= Math.PI / 2 || lineAngle >= Math.PI / 2 * 3) {
        controlAngle = lineAngle + angleDelta;
      } else {
        controlAngle = lineAngle - angleDelta;
      }
    } else if (direction === 'down') {
      if (lineAngle <= Math.PI / 2 || lineAngle >= Math.PI / 2 * 3) {
        controlAngle = lineAngle - angleDelta;
      } else {
        controlAngle = lineAngle + angleDelta;
      }
    } else if (direction === 'left') {
      if (lineAngle <= Math.PI) {
        controlAngle = lineAngle + angleDelta;
      } else {
        controlAngle = lineAngle - angleDelta;
      }
    } else if (direction === 'right') {
      if (lineAngle <= Math.PI) {
        controlAngle = lineAngle - angleDelta;
      } else {
        controlAngle = lineAngle + angleDelta;
      }
    }

    const dist = magToUse * displacementLine.length();
    controlPoint = new Point(
      linePoint.x + dist * Math.cos(controlAngle),
      linePoint.y + dist * Math.sin(controlAngle),
    );
  }

  const p0 = start;
  const p1 = getPoint(controlPoint as any);
  const p2 = start.add(delta);
  const t = percent;
  const bx = quadraticBezier(p0.x, p1.x, p2.x, t);
  const by = quadraticBezier(p0.y, p1.y, p2.y, t);
  return new Point(bx, by);
}

function translationPath(
  pathType: 'linear' | 'curved' | 'curve' = 'linear',
  start: Point,
  delta: Point,
  percent: number,
  options: OBJ_TranslationPath,
) {
  if (pathType === 'linear') {
    return linearPath(start, delta, percent);
  }
  if (pathType === 'curved' || pathType === 'curve') {
    return curvedPath(start, delta, percent, options);
  }
  return new Point(0, 0);
}

function toDelta(
  start: Point,
  delta: Point,
  percent: number,
  translationStyle: 'linear' | 'curved' | 'curve' = 'linear',
  translationOptions: OBJ_TranslationPath = {
    magnitude: 0.5,
    offset: 0.5,
    controlPoint: null,
  },
) {
  const pathPoint = translationPath(
    translationStyle,
    start, delta, percent,
    translationOptions,
  );
  return pathPoint;
}

export {
  curvedPath,
  linearPath,
  translationPath,
  toDelta,
};
