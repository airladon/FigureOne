// @flow
/* eslint-disable no-use-before-define, prefer-destructuring */
import {
  roundNum, clipValue, // clipMag, clipValue, rand2D, round,
} from './math';
import type { Type3DMatrix } from './m3';
import * as m3 from './m3';

export type Type3Components = [number, number, number];
export type ScaleTransform3DComponent = ['s', number, number, number];
export type TranslateTransform3DComponent = ['t', number, number, number];
export type RotateTransform3DComponent = ['r', number, number, number];
export type CustomTransform3DComponent = ['r', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

// eslint-disable-next-line max-len
export type Transform3DDefinition = Array<ScaleTransform3DComponent | TranslateTransform3DComponent | RotateTransform3DComponent | CustomTransform3DComponent>;

export type Type3DComponents = [number, number, number];

/**
 * A {@link Point3} can be defined in several ways
 * - As a Point3: new Point3()
 * - As an x, y, z tuple: [number, number, number]
 * - As an x, y, z string: '[number, number, number]'
 * - As a definition object: { f1Type: 'p3', state: [number, number, number] }
 }
 * @example
 * // p1, p2, p3 and p4 are all the same when parsed by `getPoint`
 * p1 = new Point(2, 3, 4);
 * p2 = [2, 3, 4];
 * p3 = '[2, 3, 4]';
 * p4 = { f1Type: 'p', state: [2, 3, 4] };
 */
export type TypeParsablePoint3 = Type3Components
                                | Point3
                                | string
                                | TypeF1DefPoint3;

type TypeF1DefPoint3 = {
  f1Type: 'p3',
  state: [number, number, number],
};


function parsePoint3(pIn: TypeParsablePoint3): Point3 {
  if (pIn instanceof Point3) {
    return pIn;
  }
  if (pIn == null) {
    throw new Error(`FigureOne could not parse point with no input: ${pIn}`);
  }

  let p = pIn;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      throw new Error(`FigureOne could not parse point from string: ${p}`);
    }
  }

  if (Array.isArray(p)) {
    try {
      return new Point3(p[0], p[1], p[2]);
    } catch { // $FlowFixMe
      throw new Error(`FigureOne could not parse point from array: ${pIn}`);
    }
  }

  if (p.f1Type != null) {
    if (
      p.f1Type === 'p3'
      && p.state != null
      && Array.isArray([p.state])
      && p.state.length === 3
    ) {
      const [x, y, z] = p.state;
      return new Point3(x, y, z);
    } // $FlowFixMe
    throw new Error(`FigureOne could not parse point from state: ${pIn}`);
  } // $FlowFixMe
  throw new Error(`FigureOne could not parse point: ${pIn}`);
}

/**
 * Parse a {@link TypeParsablePoint} and return a {@link Point}.
 * @return {Point}
 */
function getPoint3(p: TypeParsablePoint3): Point3 {
  // if (p)
  // let parsedPoint = parsePoint3(p);
  // if (parsedPoint == null) {
  //   parsedPoint = new Point3(0, 0, 0);
  // }
  // return parsedPoint;
  return parsePoint3(p);
}


/**
 * Parse an array of parsable point definitions ({@link TypeParsablePoint})
 * returning an array of points.
 * @return {Array<Point>}
 */
function getPoints3(points: TypeParsablePoint3 | Array<TypeParsablePoint3>): Array<Point3> {
  if (Array.isArray(points)) {
    if (points.length === 3 && typeof points[0] === 'number') {   // $FlowFixMe
      return [getPoint3(points)];
    } // $FlowFixMe
    return points.map(p => getPoint3(p));
  }
  return [getPoint3(points)];
}


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

class Point3 {
  x: number;
  y: number;
  z: number;
  _type: string;

  constructor(xOrArray: Type3DComponents | number, y: number, z: number = 0) {
    this._type = 'point';
    if (Array.isArray(xOrArray)) {
      try {
        this.x = xOrArray[0];
        this.y = xOrArray[1];
        this.z = xOrArray[2];
      } catch {
        if (xOrArray.length !== 3) {
          throw new Error(`FigureOne Point creation failed - array definition must have length of 3: ${xOrArray}`);
        }
      }
      return;
    }
    this.x = xOrArray;
    this.y = y;
    this.z = z;
  }

  _dup(): Point3 {
    return new Point3(this.x, this.y, this.z);
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'p3',
      state: [
        roundNum(this.x, precision),
        roundNum(this.y, precision),
        roundNum(this.z, precision),
      ],
    };
  }

  /**
   * Scale x and y values of point by scalar
   * @example
   * p = new Point(1, 1, 1);
   * s = p.scale(3);
   * // s = Point{x: 3, y: 3, z: 3};
   */
  scale(scalar: number): Point3 {
    return new Point3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Subtract (x, y, z) values or a {@link Point3} and return the difference as a new {@link Point3}
   * @example
   * p = new Point(3, 3, 3);
   * d = p.sub(1, 1, 1)
   * // d = Point{x: 2, y: 2, z: 2}
   *
   * p = new Point(3, 3, 3);
   * q = new Point(1, 1, 1);
   * d = p.sub(q)
   * // d = Point{x: 2, y: 2, z: 2}
   */
  sub(pointOrX: Point3 | number, y: number = 0, z: number = 0): Point3 {
    if (pointOrX instanceof Point3) {
      return new Point3(this.x - pointOrX.x, this.y - pointOrX.y, this.z - pointOrX.z);
    }
    return new Point3(this.x - pointOrX, this.y - y, this.z - z);
  }

  /**
   * Add (x, y, z) values or a {@link Point3} and return the sum as a new {@link Point3}
   * @example
   * p = new Point3(3, 3, 3);
   * d = p.add(1, 1, 1)
   * // d = Point{x: 4, y: 4, z: 4}
   *
   * p = new Point3(3, 3, 3);
   * q = new Point3(1, 1, 1);
   * d = p.add(q)
   * // d = Point{x: 4, y: 4, z: 4}
   */
  add(pointOrX: Point3 | number, y: number = 0, z: number = 0): Point3 {
    if (pointOrX instanceof Point3) {
      return new Point3(this.x + pointOrX.x, this.y + pointOrX.y, this.z + pointOrX.z);
    }
    return new Point3(this.x + pointOrX, this.y + y, this.z + z);
  }

  /**
   * Return the distance between two points (or point and origin if no input
   * supplied)
   * @example
   * p = new Point3(1, 1, 1);
   * q = new Point3(0, 0, 0);
   * d = q.distance(p);
   * // d = 1.7320508075688772
   *
   */
  distance(toPointIn: TypeParsablePoint3): number {
    if (toPointIn == null) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    const p = getPoint3(toPointIn);
    return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2 + (this.z - p.z) ** 2);
  }

  /**
   * Return a new point with (x, y, z) values rounded to some precision
   * @example
   * p = new Point(1.234, 1.234, 1.234);
   * q = p.round(2);
   * // q = Point{x: 1.23, y: 1.23, z: 1.23}
   */
  round(precision: number = 8): Point3 {
    return new Point3(
      roundNum(this.x, precision),
      roundNum(this.y, precision),
      roundNum(this.z, precision),
    );
  }

  /**
   * Return a new point that is clipped to min and max values from the origin.
   *
   * Use a point as a parameter to define different (x, y) min/max values,
   * a number to define the same (x, y) min/max values, or null to have no
   * min/max values.
   * @example
   * p = new Point(2, 2);
   * q = p.clip(1, 1);
   * // q = Point{x: 1, y: 1}
   *
   * p = new Point(2, 2);
   * q = p.clip(1, null);
   * // q = Point{x: 1, y: 2}
   *
   * p = new Point(-2, -2);
   * minClip = new Point(-1, -1.5);
   * q = p.clip(minClip, null);
   * // q = Point{x: -1, y: -1.5}
   */
  clip(min: Point3 | number | null, max: Point3 | number | null): Point3 {
    let minX;
    let minY;
    let minZ;
    let maxX;
    let maxY;
    let maxZ;
    if (min instanceof Point3) {
      minX = min.x;
      minY = min.y;
      minZ = min.z;
    } else {
      minX = min;
      minY = min;
      minZ = min;
    }
    if (max instanceof Point3) {
      maxX = max.x;
      maxY = max.y;
      maxZ = max.z;
    } else {
      maxX = max;
      maxY = max;
      maxZ = max;
    }
    const x = clipValue(this.x, minX, maxX);
    const y = clipValue(this.y, minY, maxY);
    const z = clipValue(this.z, minZ, maxZ);
    return new Point3(x, y, z);
  }

  /**
   * Transform the point with a 4x4 matrix (3 dimensional transform)
   * @example
   * // Transform a point with a (2, 2, 0) translation then 90º z rotation
   * p = new Point(1, 1);
   * m = new Transform3().translate(2, 2, 0).rotate(0, 0, Math.PI / 2).matrix();
   * // m = [0, -1, 0, -2, 1, 0, 0, 2, 0, 0, 0, 1]
   * q = p.transformBy(m)
   * // q = Point{x: -3, y: 3, 0}
   */
  transformBy(matrix: Type3DMatrix): Point3 {
    const transformedPoint = m3.transform(matrix, this.x, this.y, this.z);
    return new Point3(transformedPoint[0], transformedPoint[1], transformedPoint[2]);
  }
}


// // Everytime a component is updated, the matrix will re-calculate
// class Transform3D {
//   mat: Array<number>;
//   // order: Array<'t' | 'r' | 's' | 'c'>;
//   // values: Array<Type3DComponents | Type3DMatrix>;
//   order: Array<Transform3DDefinition>;
//   name: string;

//   constructor(definitionOrName: Array<Transform3DDefinition>, name: string) {}
//   _dup() {}
//   translate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   scale(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   rotate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
//   rotatePolar(theta: number, phi: number) {}
//   updateTranslation(x: number, y: number, z: number, index: number) {}
//   updateScale(x: number, y: number, z: number, index: number) {}
//   updateRotation(x: number, y: number, z: number, index: number) {}
//   _calcMatrix() {}
//   udpate(index: number, value: Type3DComponents | Type3DMatrix) {}
//   getScale(index: number) {}
//   getTranslation(index: number) {}
//   getRotation(index: number) {}
//   get(index: number) {}
//   round(precision: number) {}
//   transformBy(transform: Transform3D) {}
//   transform(transform: Transform3D) {}
//   isEqualTo(transform: Transform3D, precision: number) {}
//   isWithinDeltaTo(transform: Transform3D, delta: number) {}
//   isZero(precision: number) {}
//   _state(options: { precision: number }) {}
//   constant(value: number) {}
//   identity() {}
// }

export {
  Point3,
  getPoint3,
  getPoints3,
};
