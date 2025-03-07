// @flow
/* eslint-disable no-use-before-define */
import { rand2D } from './math';
import { joinObjects } from './tools';
import type { TypeParsablePoint } from './geometry/Point';
import {
  getPoint, isParsablePoint, getPoints, getScale, parsePoint, Point,
} from './geometry/Point';
import { toDelta } from './geometry/Path';
import {
  Plane, getPlane, isParsablePlane, getNormal,
} from './geometry/Plane';
import type { TypeParsablePlane } from './geometry/Plane';
import type { OBJ_TranslationPath } from './geometry/Path';
import { Line, getLine } from './geometry/Line';
import {
  Transform, getTransform, isParsableTransform,
  angleFromVectors, directionToAxisAngle,
} from './geometry/Transform';
import {
  decelerateValue, decelerateVector,
} from './geometry/deceleration';
import type { TypeParsableLine } from './geometry/Line';
import type { TypeParsableRect } from './geometry/Rect';
import type { TypeTransformValue, TypeParsableTransform } from './geometry/Transform';
import { Rect, getRect } from './geometry/Rect';
import { rectToPolar, polarToRect } from './geometry/coordinates';
import {
  RectBounds, LineBounds, Bounds, RangeBounds, getBounds,
} from './geometry/Bounds';
import type { TypeParsableBounds } from './geometry/Bounds';
import {
  deg, minAngleDiff, getDeltaAngle3D, getDeltaAngle, normAngleTo90,
  threePointAngle, threePointAngleMin, normAngle, clipAngle,
} from './geometry/angle';
import type { TypeRotationDirection } from './geometry/angle';
import { sphericalToCartesian, cartesianToSpherical } from './geometry/common';
import sphere from './d3/sphere';
import { revolve, getLathePoints } from './d3/revolve';
import cone from './d3/cone';
import line3 from './d3/line3';
import cylinder from './d3/cylinder';
// import { polygon } from './geometry/polygon';
import cube from './d3/cube';
import prism from './d3/prism';
import * as surface from './d3/surface';
import {
  pointsToNumbers, numbersToPoints, toNumbers, toPoints,
} from './geometry/tools';
import { polygon, polygonLine } from './d2/polygon';


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
  TypeRotationDirection,
  OBJ_TranslationPath,
  TypeParsableBounds,
};

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
) {
  const xScale = s2.x.span / s1.x.span;
  const yScale = s2.y.span / s1.y.span;
  const zScale = s2.z.span / s1.z.span;
  const t = new Transform()
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
          if (v[i] !== 0) {  // $FlowFixMe
            const t = Math.abs(delta[i] / v[i]);
            time = t > time ? t : time;
          }
        }
      }
    }
    const start = startTransform.def[index];
    const target = stopTransform.def[index];
    if (delta[0] === 'r' && start[0] === 'r' && target[0] === 'r') {
      for (let i = 1; i < 4; i += 1) {  // $FlowFixMe
        const rotDiff = getDeltaAngle(start[i], target[i], rotDirection);
        // eslint-disable-next-line no-param-reassign
        // delta = rotDiff;
        const v = velocityTransformToUse.def[index][i];
        if (v !== 0) {  // $FlowFixMe
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
  rotationVelocity: Point = new Point(0, 0, 2 * Math.PI / 6),    // 60º/s
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
        v[1] = translationVelocity.x; // $FlowFixMe
        v[2] = translationVelocity.y; // $FlowFixMe
        v[3] = translationVelocity.z;
      } else if (v[0] === 'r') {
        v[1] = rotationVelocity.x; // $FlowFixMe
        v[2] = rotationVelocity.y; // $FlowFixMe
        v[3] = rotationVelocity.z;
      } else {
        v[1] = scaleVelocity.x; // $FlowFixMe
        v[2] = scaleVelocity.y; // $FlowFixMe
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
 * border. Several point arrays represent a border that is several separate
 * borders.
 *
 * `TypeBorder = Array<Array<Point>>`
 */
export type TypeBorder = Array<Array<Point>>;

function getBorder(
  border: Array<TypeParsablePoint> | Array<Array<TypeParsablePoint>>
          | string | number | TypeParsableBuffer,
): Array<Array<Point>> | string | TypeParsableBuffer {
  if (
    typeof border === 'string'
    || typeof border === 'number'
    || isBuffer(border)
  ) { // $FlowFixMe
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

/**
 * Surface grid options object.
 *
 * Two components must be a fixed [min, max, step].
 *
 * One component must be a function that takes in two components
 * (x, y), (x, z), or (y, z) and outputs the third (z, y or x repsectively).
 */
export type OBJ_SurfaceGrid = {
  x: ((number, number) => number) | [number, number, number],
  y: ((number, number) => number) | [number, number, number],
  z: ((number, number) => number) | [number, number, number],
};

/**
 * Create a matrix of points that define a surface.
 *
 * ![](./apiassets/sufacegrid.png)
 *
 * Start with a grid of points in two components (x, y), (x, z), or (y, z), and
 * define the third component (z, y or x repsectively) based on the first two.
 *
 * Resulting matrix can be used to create a 3D surface.
 *
 * @see {OBJ_Surface}
 *
 * @param {OBJ_SurfaceGrid} [components]
 * @return {<Array<Array<Point>>}
 *
 * @example
 * const { Figure, surfaceGrid } = Fig;
 *
 * // Orthographic scene with camera oriented so z is up
 * const figure = new Figure({
 *   scene: {
 *     style: 'orthographic',
 *     camera: { up: [0, 0, 1], position: [1, 0.5, 0.5] },
 *   },
 * });
 *
 * // Use surfaceGrid to generate a 3D surface from an xy grid
 * const points = surfaceGrid({
 *   x: [-0.8, 0.8, 0.02],
 *   y: [-0.8, 0.8, 0.02],
 *   z: (x, y) => 1 / ((x * 5) ** 2 + (y * 5) ** 2 + 1),
 * });
 *
 * figure.add([
 *   {
 *     make: 'surface',
 *     points,
 *     color: [1, 0, 0, 1],
 *     normals: 'curve',
 *   },
 *   {
 *     make: 'surface',
 *     points,
 *     lines: true,
 *     color: [0, 0, 0, 1],
 *     position: [0, 0, 0.0001],
 *   },
 *   { make: 'cameraControl', axis: [0, 0, 1] },
 * ]);
 */
function surfaceGrid(components: OBJ_SurfaceGrid) {
  const surfacePoints = [];
  if (Array.isArray(components.x) && Array.isArray(components.y)) {
    if (typeof components.z !== 'function') {
      throw new Error('surfaceGrid must have two components as ranges, and the third as a function');
    }
    for (let x = components.x[0]; x <= components.x[1]; x += components.x[2]) {
      const row = [];
      for (let y = components.y[0]; y <= components.y[1]; y += components.y[2]) {
        row.push(new Point(x, y, components.z(x, y)));
      }
      surfacePoints.push(row);
    }
    return surfacePoints;
  }
  if (Array.isArray(components.x) && Array.isArray(components.z)) {
    if (typeof components.y !== 'function') {
      throw new Error('surfaceGrid must have two components as ranges, and the third as a function');
    }
    for (let x = components.x[0]; x <= components.x[1]; x += components.x[2]) {
      const row = [];
      for (let z = components.z[0]; z <= components.z[1]; z += components.z[2]) {
        row.push(new Point(x, components.y(x, z), z));
      }
      surfacePoints.push(row);
    }
    return surfacePoints;
  }
  if (Array.isArray(components.y) && Array.isArray(components.z)) {
    if (typeof components.x !== 'function') {
      throw new Error('surfaceGrid must have two components as ranges, and the third as a function');
    }
    for (let y = components.y[0]; y <= components.y[1]; y += components.y[2]) {
      const row = [];
      for (let z = components.z[0]; z <= components.z[1]; z += components.z[2]) {
        row.push(new Point(components.x(y, z), y, z));
      }
      surfacePoints.push(row);
    }
    return surfacePoints;
  }
  throw new Error('surfaceGrid must have two components as ranges, and the third as a function');
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
  decelerateValue,
  RectBounds,
  LineBounds,
  RangeBounds,
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
  toDelta,
  sphericalToCartesian,
  cartesianToSpherical,
  getNormal,
  sphere,
  revolve,
  cylinder,
  cone,
  line3,
  cube,
  prism,
  surface,
  getLathePoints,
  decelerateVector,
  numbersToPoints,
  pointsToNumbers,
  toNumbers,
  toPoints,
  polygon,
  polygonLine,
  angleFromVectors,
  directionToAxisAngle,
  surfaceGrid,
  getBuffer,
};
