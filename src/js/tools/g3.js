// @flow
/* eslint-disable no-use-before-define, prefer-destructuring */
import {
  roundNum, clipValue, // clipMag, clipValue, rand2D, round,
} from './math';
import type { Type3DMatrix } from './m3';
import * as m3 from './m3';
import * as m2 from './m2';
import { Line } from './g2';

export type Type3Components = [number, number, number];
export type ScaleTransform3DComponent = ['s', number, number, number];
export type TranslateTransform3DComponent = ['t', number, number, number];
export type RotateTransform3DComponent = ['r', number, number, number];
export type CustomTransform3DComponent = ['r', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

// eslint-disable-next-line max-len
export type Transform3DDefinition = Array<ScaleTransform3DComponent | TranslateTransform3DComponent | RotateTransform3DComponent | CustomTransform3DComponent>;

export type Type2Components = [number, number];



// Everytime a component is updated, the matrix will re-calculate
class Transform3D {
  mat: Array<number>;
  // order: Array<'t' | 'r' | 's' | 'c'>;
  // values: Array<Type3Components | Type3DMatrix>;
  order: Array<Transform3DDefinition>;
  name: string;

  constructor(definitionOrName: Array<Transform3DDefinition>, name: string) {}
  _dup() {}
  translate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
  scale(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
  rotate(xOrPoint: TypeParsablePoint | number, y: number, z: number) {}
  rotatePolar(theta: number, phi: number) {}
  updateTranslation(x: number, y: number, z: number, index: number) {}
  updateScale(x: number, y: number, z: number, index: number) {}
  updateRotation(x: number, y: number, z: number, index: number) {}
  _calcMatrix() {}
  udpate(index: number, value: Type3Components | Type3DMatrix) {}
  getScale(index: number) {}
  getTranslation(index: number) {}
  getRotation(index: number) {}
  get(index: number) {}
  round(precision: number) {}
  transformBy(transform: Transform3D) {}
  transform(transform: Transform3D) {}
  isEqualTo(transform: Transform3D, precision: number) {}
  isWithinDeltaTo(transform: Transform3D, delta: number) {}
  isZero(precision: number) {}
  _state(options: { precision: number }) {}
  constant(value: number) {}
  identity() {}
}

export {
  Point,
  getPoint,
  getPoints3,
};
