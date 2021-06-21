// @flow
/* eslint-disable no-use-before-define */
import {
  roundNum, clipMag,
} from '../math';
import * as m3 from '../m3';
import { clipAngle } from './angle';
import { translationPath } from './Path';
import { Point, getPoint, getScale } from './Point';
// import { Line } from './Line';
import { rectToPolar } from './coordinates';
import type { Type3DMatrix } from '../m3';
import type { TypeParsablePoint } from './Point';
import type { OBJ_TranslationPath } from './Path';


export type TypeScaleTransformComponent = ['s', number, number, number];
export type TypeTranslateTransformComponent = ['t', number, number, number];
export type TypeRotateTransformComponent = ['r', number];
export type TypeRotateCartesianTransformComponent = ['rc', number, number, number];
export type TypeRotateAxisTransformComponent = ['ra', number, number, number, number];
export type TypeRotateDirectionTransformComponent = ['rd', number, number, number];
export type TypeRotateSphericalTransformComponent = ['rs', number, number];
export type TypeCustomTransformComponent = ['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

export type TypeTransformComponent = TypeScaleTransformComponent
  | TypeTranslateTransformComponent
  | TypeRotateTransformComponent
  | TypeRotateAxisTransformComponent
  | TypeRotateSphericalTransformComponent
  | TypeRotateCartesianTransformComponent
  | TypeRotateDirectionTransformComponent
  | TypeCustomTransformComponent;

// export type TransformComponent = ScaleTransformComponent
//   | TranslateTransformComponent
//   | RotateTransformComponent
//   | CustomTransformComponent;

export type TypeTransformDefinition = Array<TypeTransformComponent>;
// export type TransformDefinition = Array<TransformComponent>;

export type TypeTransformValue = number | Array<number> | {
  scale?: number,
  position?: number,
  translation?: number,
  rotation?: number,
};

// function distance(p1: Point, p2: Point) {
//   return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
// }

// export type TypeRotationDefinition = number // 2D
//   | ['r', number] // 2D
//   | ['xyz', TypeParsablePoint]
//   | ['axis', TypeParsablePoint, number]
//   | ['dir', TypeParsablePoint]
//   | ['sph', number, number]
type TypeRotationComponentName = '2D' | 'xyz' | 'axis' | 'dir' | 'sph';

type TypeRotationDefinition = ['2D', number]
  | ['xyz', TypeParsablePoint]
  | ['xyz', number, number, number]
  | ['axis', TypeParsablePoint, number]
  | ['axis', number, number, number, number]
  | ['dir', TypeParsablePoint]
  | ['dir', number, number, number]
  | ['sph', number, number]

type TypeTransformComponentType = 't' | 'c' | 's' | 'r' | 'ra' | 'rd' | 'rc' | 'rs';
// function parseRotation(rDef: TypeRor)

// new Transform().rotate('axis', [1, 2, 3], 4)
// new Transform([['t', 4, 5, 6], ['r', 3, 4, 5])
// transform.r() get first r

function parseRotation(
  typeOr2DOrDef: number | TypeRotationComponentName | TypeRotationDefinition,
  r1: number | TypeParsablePoint | null = null,
  r2: number | null = null,
  r3: number | null = null,
  r4: number | null = null,
) {
  if (typeof typeOr2DOrDef === 'number') {
    return ['r', typeOr2DOrDef];
  }
  if (Array.isArray(typeOr2DOrDef)) {
    return parseRotation(...typeOr2DOrDef);
  }
  const type = typeOr2DOrDef;
  if (type === '2D' && typeof r1 === 'number') {
    return ['r', r1];
  }
  if (typeof r1 === 'number') {
    if (typeof r2 === 'number') {
      if (type === 'sph') {
        return ['rs', r1, r2];
      }
      if (typeof r3 === 'number') {
        if (type === 'xyz') {
          return ['rc', r1, r2, r3];
        }
        if (type === 'dir') {
          return ['rd', r1, r2, r3];
        }
        if (typeof r4 === 'number' && type === 'axis') {
          return ['ra', r1, r2, r3, r4];
        }
      }
    }
  } else if (type === 'xyz') {
    return ['rc', ...getPoint(r1).toArray()];
  } else if (type === 'dir') {
    return ['rd', ...getPoint(r1).toArray()];
  } else if (type === 'axis' && typeof r2 === 'number') {
    return ['ra', ...getPoint(r1).toArray(), r2];
  }
  throw new Error(`Could not parse rotation '${typeOr2DOrDef}', '${r1}', '${r2}', '${r3}', '${r4}'`);
}

function makeTransformComponent(
  component: TypeTransformComponent,
  operation: (index: number) => number,
): TypeTransformComponent {
  const newDef = Array(component.length);
  // eslint-disable-next-line prefer-destructuring
  newDef[0] = component[0];
  for (let j = 1; j < component.length; j += 1) {
    newDef[j] = operation(j);
  }  // $FlowFixMe
  return newDef;
}

/**
 * Object that represents a chain of {@link Rotation}, {@link Translation} and
 * {@link Scale} transforms
 *
 * Use `translate`, `scale` and `rotate` methods to create chains (see example).
 *
 * @example
 * // Create a tranform that first scales, then rotates then translates
 * const t1 = new Transform().scale(2, 2).rotate(Math.PI).translate(1, 1)
 */
class Transform {
  def: TypeTransformDefinition;
  // order: Array<Translation | Rotation | Scale>;
  mat: Type3DMatrix;
  // index: number;
  translationIndex: number;
  name: string;
  _type: 'transform';

  /**
   * @param {Array<Translation | Rotation | Scale> | string} chainOrName chain
   * of transforms to initialize this Transform with, or name of transform if
   * not initializing with transforms.
   * @param {string} name transform name if `chainOrName` defines initializing
   * transforms
   */
  constructor(defOrName: TypeTransformDefinition | string = '', name: string = '') {
    this.def = [];
    this.name = '';
    if (typeof defOrName === 'string') {
      this.def = [];
      this.name = defOrName;
    } else {
      const result = parseArrayTransformDefinition(defOrName);
      this.def = result.def;
      if (name === '' && result.name != null && result.name.length > 0) {
        this.name = result.name;
      } else {
        this.name = name;
      }
    }
    // this.index = this.def.length;
    this._type = 'transform';
    this.calcAndSetMatrix();
  }

  _state(options: { precision: number } = { precision: 8 }) {
    const { precision } = options;
    const outDef = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const component = [];
      for (let j = 0; j < this.def[i].length; j += 1) {
        if (j === 0) {
          component.push(this.def[i][0]);
        } else {  // $FlowFixMe
          component.push(roundNum(this.def[i][j], precision));
        }
      }
      outDef.push(component);
    }
    return {
      f1Type: 'tf',
      state: [
        this.name,
        ...outDef,
      ],
    };
  }

  hasComponent(component: TypeTransformComponentType) {
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] === component) {
        return true;
      }
    }
    return false;
  }

  setComponent(index: number, def: TypeTransformComponent) {
    this.def[index] = def;
    this.calcAndSetMatrix();
    return this;
  }

  addComponent(def: TypeTransformComponent) {
    this.def.push(def);
    this.calcAndSetMatrix();
    return this;
  }

  /**
   * Return a duplicate transform with an added {@link Translation} transform
   * @param {number | Point} xOrTranslation
   * @return {Transform}
   */
  translate(
    xOrTranslation: number | Point = 0,
    y: number = 0,
    z: number = 0,
    // name: string = this.name,
  ) {
    let _x;
    let _y = y;
    let _z = z;
    if (typeof xOrTranslation !== 'number') {
      _x = xOrTranslation.x;
      _y = xOrTranslation.y;
      _z = xOrTranslation.z;
    } else {
      _x = xOrTranslation;
    }
    return this.addComponent(['t', _x, _y, _z]);
  }


  // rotate(
  //   rOrRxOrPoint: number | TypeParsablePoint,
  //   ry: number | null = null,
  //   rz: number = 0,
  // ) {
  //   let _rx;
  //   let _ry;
  //   let _rz;
  //   if (typeof rOrRxOrPoint === 'number') {
  //     if (ry == null) {
  //       _rx = 0;
  //       _ry = 0;
  //       _rz = rOrRxOrPoint;
  //     } else {
  //       _rx = rOrRxOrPoint;
  //       _ry = ry;
  //       _rz = rz;
  //     }
  //   } else {
  //     const p = getPoint(rOrRxOrPoint);
  //     _rx = p.x;
  //     _ry = p.y;
  //     _rz = p.z;
  //   }
  //   const r = ['r', _rx, _ry, _rz];

  //   if (this.index === this.def.length) { // $FlowFixMe
  //     this.def.push(r);
  //   } else { // $FlowFixMe
  //     this.def[this.index] = r;
  //   }
  //   this.index += 1;
  //   this.calcAndSetMatrix();
  //   return this;
  // }

  rotate(
    typeOr2DRotation: number | '2D' | 'xyz' | 'axis' | 'dir' | 'sph',
    r1: number | TypeParsablePoint | null = null,
    r2: number | null = null,
    r3: number | null = null,
    r4: number | null = null,
  ) {
    const def = parseRotation(typeOr2DRotation, r1, r2, r3, r4);

    return this.addComponent(def);
  }

  custom(matrix: Type3DMatrix) {
    if (matrix.length !== 16) {
      throw new Error(`Transform custom matrices must be 16 elements (${matrix.length} input): ${JSON.stringify(matrix)}`);
    }
    return this.addComponent(['c', ...matrix]);
  }

  /**
   * Return a duplicate transform with an added {@link Scale} transform
   * @param {number | Point} xOrScale
   * @return {Transform}
   */
  scale(
    sOrSxOrPoint: number | Point,
    sy: number | null = null,
    sz: number = 1,
  ) {
    let _sx = sOrSxOrPoint;
    let _sy = sy;
    let _sz = sz;
    if (typeof sOrSxOrPoint === 'number') {
      if (sy == null) {
        _sx = sOrSxOrPoint;
        _sy = sOrSxOrPoint;
        _sz = sOrSxOrPoint;
      }
    } else {
      _sx = sOrSxOrPoint.x;
      _sy = sOrSxOrPoint.y;
      _sz = sOrSxOrPoint.z;
    }
    return this.addComponent(['s', _sx, _sy, _sz]);
  }

  // /**
  //  * Remove some transforms from this transform chain
  //  * @return {Transform}
  //  */
  // remove(transformNames: string | Array<string>) {
  //   const newOrder = [];
  //   let names;
  //   if (typeof transformNames === 'string') {
  //     names = [transformNames];
  //   } else {
  //     names = transformNames;
  //   }
  //   this.def.forEach((transformElement) => {
  //     if (names.indexOf(transformElement.name) === -1) {
  //       newOrder.push(transformElement._dup());
  //     }
  //   });
  //   return new Transform(newOrder, this.name);
  // }

  /**
   * Transform matrix of the transform chain
   * @return {Type3DMatrix}
   */
  calcMatrix(
    defStart: number = 0,
    defEnd: number = this.def.length - 1,
  ): Type3DMatrix {
    let defEndToUse = defEnd;
    if (defEnd < 0) {
      defEndToUse = this.def.length + defEnd;
    }
    let m = m3.identity();
    for (let i = defEndToUse; i >= defStart; i -= 1) {
      const [type, x, y, z] = this.def[i];
      if (type === 't' && (x !== 0 || y !== 0 || z !== 0)) {
        m = m3.mul(m, m3.translationMatrix(x, y, z));
      } else if (type === 's' && (x !== 1 || y !== 1 || z !== 1)) {
        m = m3.mul(m, m3.scaleMatrix(x, y, z));
      } else if (type === 'r') {
        m = m3.mul(m, m3.rotationMatrixXYZ(0, 0, x));
      } else if (type === 'rc') {
        m = m3.mul(m, m3.rotationMatrixXYZ(x, y, z));
      } else if (type === 'rd') {
        m = m3.mul(m, m3.rotationMatrixDirection([x, y, z]));
      } else if (type === 'rs') {
        m = m3.mul(m, m3.rotationMatrixSpherical(x, y));
      } else if (type === 'ra') {
        m = m3.mul(m, m3.rotationMatrixAxis([x, y, z], this.def[i][4]));
      } else if (type === 'c') {  // $FlowFixMe
        m = m3.mul(m, this.def[i].slice(1));
      }
    }
    return m;
  }

  calcAndSetMatrix() {
    this.mat = this.calcMatrix();
  }


  // update(index: number) {
  //   if (index < this.def.length) {
  //     this.index = index;
  //   }
  //   return this;
  // }

  getComponentIndex(type: TypeTransformComponentType, n: number = 0) {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      // Checking only the first letter of type so the first rotation will be
      // returned independant of the type of rotation
      if (this.def[i][0][0] === type[0]) {
        if (count === n) {
          return i;
        }
        count += 1;
      }
    }
    throw new Error(`Cannot get type '${type}-${n}' from transform '${JSON.stringify(this.def)}'`);
  }

  /**
   * Retrieve the nth {@link Translation} transform value from this transform
   * chain where n = `translationIndex`. If `translationIndex` is invalid
   * (like if it is larger than the number of `Translation` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  t(translationIndex: number = 0): ?Point {
    const i = this.getComponentIndex('t', translationIndex);
    const [, x, y, z] = this.def[i];
    return new Point(x, y, z);
  }

  /**
   * Clip all {@link Rotation} transforms within this transform chain to
   * angles between 0º-360º, -180º-180º, or not at all (`null`)
   *
   * Note, only angle values are clipped. i.e.:
   *  - axis rotation angle is clipped (but axis is not)
   *  - direction rotation is not clipped as it has no angle
   */
  clipRotation(clipTo: '0to360' | '-180to180' | null) {
    for (let i = 0; i < this.def.length; i += 1) {
      const component = this.def[i];
      const [type] = component;
      if (type[0] === 'r') {
        if (type === 'r') {
          this.def[i] = ['r', clipAngle(component[1], clipTo)];
        } else if (type === 'rc') {
          this.def[i] = [
            'r',
            clipAngle(component[1], clipTo),
            clipAngle(component[2], clipTo),
            clipAngle(component[3], clipTo),
          ];
        } else if (type === 'ra') {
          this.def[i] = [
            'r', component[1], component[2], component[3], clipAngle(component[4], clipTo),
          ];
        } else if (type === 'rs') {
          this.def[i] = [
            'r',
            clipAngle(component[1], clipTo),
            clipAngle(component[2], clipTo),
          ];
        }
      }
    }
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Translation} transform component
   * @return {Transform}
   */
  updateTranslation(
    p: TypeParsablePoint,
    n: number = 0,
  ) {
    return this.updateComponent(['t', ...getPoint(p).toArray()], n);
  }

  updateComponent(
    // type: TypeTransformComponentType,
    def: TypeTransformComponent,
    n: number,
  ) {
    let count = 0;
    for (let i = 0; i < this.def.length; i += 1) {
      // Only the first letter of the types are compared so
      // any rotation can override any existing rotation
      if (def[0][0] === this.def[i][0][0]) {
        if (count === n) { // $FlowFixMe
          this.def[i] = def.slice();
          this.calcAndSetMatrix();
          return this;
        }
        count += 1;
      }
    }
    throw new Error(`Cannot update '${def}-${n}' in transform: ${JSON.stringify(this.def)}`);
  }


  /**
   * Retrieve the nth {@link Scale} transform value from this transform
   * chain where n = `scaleIndex`. If `scaleIndex` is invalid
   * (like if it is larger than the number of `Scale` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  s(scaleIndex: number = 0): ?Point {
    const i = this.getComponentIndex('s', scaleIndex);
    const [, x, y, z] = this.def[i];
    return new Point(x, y, z);
  }

  /**
   * Return a linearly interpolated transform between this transform and
   * `delta` at some `percent` between the two.
   *
   * For translation transform components, interpolation can either be
   * `'linear'` or '`curved'`.
   * @return {Transform}
   */
  toDelta(
    delta: Transform,
    percent: number,
    translationStyle: 'linear' | 'curved' | 'curve',
    translationOptions: OBJ_TranslationPath,
  ) {
    const out = this._dup();
    for (let i = 0; i < this.def.length; i += 1) {
      const stepStart = this.def[i];
      const stepDelta = delta.def[i];
      if (
        stepStart[0] === stepDelta[0]
        && stepStart[0] !== 't'
        && stepStart.length === stepDelta.length
      ) {
        // $FlowFixMe
        out.def[i] = [
          stepStart[0],
          ...stepDelta.slice(1).map((d, j) => d * percent + stepStart[j + 1]),
        ];
      } else if (stepStart[0] === 't' && stepDelta[0] === 't') {
        const start = new Point(stepStart[1], stepStart[2], stepStart[3]);
        const sDelta = new Point(stepDelta[1], stepDelta[2], stepDelta[3]);
        const p = translationPath(
          translationStyle,
          start, sDelta, percent,
          translationOptions,
        );
        out.def[i] = ['t', p.x, p.y, p.z];
      }
    }
    out.calcAndSetMatrix();
    return out;
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Scale} transform component
   * @return {Transform}
   */
  updateScale(
    s: number | TypeParsablePoint,
    n: number = 0,
  ) {
    return this.updateComponent(['s', ...getScale(s).toArray()], n);
  }


  /**
   * Retrieve the nth {@link Rotation} transform value from this transform
   * chain where n = `rotationIndex`. If `scaleIndex` is invalid
   * (like if it is larger than the number of `Rotation` transforms available)
   * then `null` will be returned.
   * @return {Point | null}
   */
  r(rotationIndex: number = 0) {
    const i = this.getComponentIndex('r', rotationIndex);
    const r = this.def[i];
    const [type] = r;
    if (type === 'r') {
      return r[1];
    }
    if (type === 'rs') {
      return [r[1], r[2]];
    }
    if (type === 'rc' || type === 'rd') {
      return new Point(r[1], r[2], r[3]);
    }
    return [new Point(r[1], r[2], r[3]), r[4]];
  }

  rArray(rotationIndex: number = 0) {
    const i = this.getComponentIndex('r', rotationIndex);
    const r = this.def[i];
    const [type] = r;
    if (type === 'r') {
      return [r[1]];
    }
    if (type === 'rs') {
      return [r[1], r[2]];
    }
    if (type === 'rc' || type === 'rd') {
      return [r[1], r[2], r[3]];
    }
    return [r[1], r[2], r[3], r[4]];
  }

  /**
   * Return a duplicate transform chain with an updated the nth
   * {@link Rotation} transform component
   * @return {Transform}
   */
  updateRotation(
    r: number | TypeRotationDefinition,
    n: number = 0,
  ) {
    if (typeof r === 'number') {
      return this.updateComponent(['r', r], n);
    }
    const def = parseRotation(r);
    return this.updateComponent(def, n);
  }

  updateRotationValues(
    n: number = 0,
    values: Array<number>,
  ) {
    const i = this.getComponentIndex('r', n);
    const type = this.def[i][0];
    return this.updateComponent([type, ...values], n);
  }

  /**
   * Return the matrix that respresents the cascaded transform chain
   * @return {Type3DMatrix}
   */
  m(): Type3DMatrix {
    return this.mat;
  }

  /**
   * Return the matrix that respresents the cascaded transform chain
   * @return {Type3DMatrix}
   */
  matrix(): Type3DMatrix {
    return this.mat;
  }

  /**
   * `true` if `transformToCompare` has the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements in the transform
   * chain.
   * @return {boolean}
   */
  isEqualShapeTo(transformToCompare: Transform): boolean {
    if (transformToCompare.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== transformToCompare.def[i][0]) {
        return false;
      }
    }
    return true;
  }

  /**
   * `true` if `transformToCompare` is equal to this transform within some
   * `precision`.
   * @return {boolean}
   */
  isEqualTo(transformToCompare: Transform, precision: number = 8): boolean {
    if (transformToCompare.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = transformToCompare.def[i];
      if (a[0] !== b[0]) {
        return false;
      }
      for (let j = 1; j < a.length; j += 1) {
        if (roundNum(a[j], precision) !== roundNum(b[j], precision)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * `true` if `transformToCompare` is wihtin some `delta` of this transform.
   * `isEqualTo` rounds the values to some precision to compare values. In
   * comparison this will directly compare the delta between values. This may
   * be more useful than rounding when values are close to rounding thresholds.
   * @return {boolean}
   */
  isWithinDelta(transformToCompare: Transform, delta: number = 0.00000001): boolean {
    if (transformToCompare.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = transformToCompare.def[i];
      if (a[0] !== b[0]) {
        return false;
      }
      for (let j = 1; j < a.length; j += 1) {
        if (Math.abs(a[j] - b[j]) > delta) {
          return false;
        }
      }
    }
    return true;
  }


  /**
   * Subtract each chain element in `transformToSubtract` from each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isEqualShapeTo</a>
   */
  sub(transformToSubtract: Transform = new Transform()): Transform {
    if (!this.isEqualShapeTo(transformToSubtract)) {
      throw new Error(`Cannot subtract transforms of different shape: '${this.def}', '${transformToSubtract.def}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = transformToSubtract.def[i];
      def.push([a[0], ...a.slice(1).map((v, j) => v - b[j + 1])]);
    }
    return new Transform(def, this.name);
  }

  // Add a transform to the current one.
  // If the two transforms have different order types, then just return
  // the current transform.
  /**
   * Add each chain element in `transformToSubtract` to each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isEqualShapeTo</a>
   */
  add(transformToAdd: Transform = new Transform()): Transform {
    if (!this.isEqualShapeTo(transformToAdd)) {
      throw new Error(`Cannot add transforms of different shape: '${this.def}', '${transformToAdd.def}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = transformToAdd.def[i];
      def.push([a[0], ...a.slice(1).map((v, j) => v + b[j + 1])]);
    }
    return new Transform(def, this.name);
  }

  // transform step wise multiplication
  /**
   * Multiply each chain element in `transformToSubtract` with each chain
   * element in this transform chain. Both transform
   * chains must be similar and have the same order of {@link Rotation},
   * {@link Scale} and {@link Translation} transform elements
   * @see <a href="#transformissimilarto">Transform.isEqualShapeTo</a>
   */
  mul(transformToMultiply: Transform = new Transform()): Transform {
    if (!this.isEqualShapeTo(transformToMultiply)) {
      throw new Error(`Cannot multiply transforms of different shape: '${this.def}', '${transformToMultiply.def}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = transformToMultiply.def[i];
      def.push([a[0], ...a.slice(1).map((v, j) => v * b[j + 1])]);
    }
    return new Transform(def, this.name);
  }

  /**
   * Return a transform chain whose order is `initialTransform` and then this
   * transform chain
   * @return {Transform}
   * @example
   * // rotate and then translate
   * const rotation = new Transform().rotate(Math.PI / 2);
   * const translation = new Transform().translate(0.5, 0);
   * const t = translation.transform(rotation)
   */
  transform(initialTransform: Transform) {
    const t = new Transform([], this.name); // $FlowFixMe
    t.def = initialTransform.def.map(d => d.slice()).concat(this.def.map(d => d.slice()));
    t.mat = m3.mul(this.matrix(), initialTransform.matrix());
    return t;
  }

  /**
   * Return a transform chain whose order is this transform chain, then the
   * `t` chain.
   * @return {Transform}
   * @example
   * // rotate and then translate
   * const rotation = new Transform().rotate(Math.PI / 2);
   * const translation = new Transform().translate(0.5, 0);
   * const t = rotation.transformBy(translation)
   */
  transformBy(t: Transform): Transform {
    const t1 = new Transform([], this.name); // $FlowFixMe
    t1.def = this.def.map(d => d.slice()).concat(t.def.map(d => d.slice()));
    t1.mat = m3.mul(t.matrix(), this.matrix());
    return t1;
  }

  /**
   * Return a duplicate transform with all values rounded
   */
  round(precision: number = 8): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      def.push(makeTransformComponent(
        this.def[i], // $FlowFixMe
        j => roundNum(this.def[i][j], precision),
      ));
    }
    return new Transform(def, this.name);
    // return new Transform(order, this.name);
  }

  // // Deprecate
  // /**
  //  * Return a duplicate transform that is clipped to `minTransform` and
  //  * `maxTransform`. Both `minTransform` and `maxTransform` must be similar
  //  * to this transform meaning they must all share the same order of
  //  * transform components.
  //  *
  //  * Use `limitLine` to clip the first {@link Translation} transform in the
  //  * chain to within a {@link Line}.
  //  */
  // clip(
  //   minTransform: Transform,
  //   maxTransform: Transform,
  //   limitLine: null | Line,
  // ) {
  //   if (!this.isEqualShapeTo(minTransform) || !this.isEqualShapeTo(maxTransform)) {
  //     throw new Error(`Cannot clip transforms of different shape: t: '${this.def}', min: '${minTransform.def}', max: '${maxTransform.def}'`);
  //   }

  //   const def = [];
  //   for (let i = 0; i < this.def.length; i += 1) {
  //     def.push(makeTransformComponent(
  //       this.def[i], // $FlowFixMe
  //       j => clipValue(this.def[i][j], minTransform.def[i][j], maxTransform.def[i][j]),
  //     ));
  //   }
  //   const clippedTransform = new Transform(def, this.name);
  //   if (limitLine != null) {
  //     const t = clippedTransform.t();
  //     if (t != null) {
  //       const perpLine = new Line({ p1: t, length: 1, angle: limitLine.angle() + Math.PI / 2 });
  //       const { intersect } = perpLine.intersectsWith(limitLine);
  //       if (intersect) {
  //         if (limitLine.hasPointOn(intersect, 4)) {
  //           clippedTransform.updateTranslation(intersect);
  //         } else {
  //           const p1Dist = distance(intersect, limitLine.p1);
  //           const p2Dist = distance(intersect, limitLine.p2);
  //           if (p1Dist < p2Dist) {
  //             clippedTransform.updateTranslation(limitLine.p1);
  //           } else {
  //             clippedTransform.updateTranslation(limitLine.p2);
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return clippedTransform;
  // }

  clipMag(
    zeroThresholdTransform: TypeTransformValue,
    maxTransform: TypeTransformValue,
    vector: boolean = true,
  ): Transform {
    // const order = [];
    const zero = transformValueToArray(zeroThresholdTransform, this);
    const max = transformValueToArray(maxTransform, this);
    const def = [];

    for (let i = 0; i < this.def.length; i += 1) {
      const t = this.def[i];
      const [type, x, y, z] = t;
      if (type === 't' && vector) {
        // if (vector) {
        const { r, phi, theta } = rectToPolar(x, y, z);
        const rc = clipMag(r, zero[i], max[i]);
        const xc = rc * Math.cos(phi) * Math.sin(theta);
        const yc = rc * Math.sin(phi) * Math.sin(theta);
        const zc = rc * Math.cos(theta);
        def.push(['t', xc, yc, zc]);
      } else if (type !== 'c') {
        def.push(makeTransformComponent(
          t, // $FlowFixMe
          j => clipMag(t[j], zero[i], max[i]),
        ));
        // const xc = clipMag(x, zero[i], max[i]);
        // const yc = clipMag(y, zero[i], max[i]);
        // const zc = clipMag(z, zero[i], max[i]);
        // $FlowFixMe
        // def.push([type, xc, yc, zc]);
      }
    }
    return new Transform(def, this.name);
  }

  constant(constant: number = 0): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      def.push(makeTransformComponent(
        this.def[i],
        () => constant,
      ));
    }
    return new Transform(def, this.name);
  }

  zero(): Transform {
    return this.constant(0);
  }

  /**
   * `true` if all transforms within the transform chain are below the
   * `zeroThreshold`
   */
  isZero(zeroThreshold: number = 0): boolean {
    for (let i = 0; i < this.def.length; i += 1) {
      const [type, x, y, z, a] = this.def[i];
      if (type === 't' || type === 's' || type === 'rd') {
        if (
          Math.abs(x) > zeroThreshold
          || Math.abs(y) > zeroThreshold
          || Math.abs(z) > zeroThreshold) {
          return false;
        }
      } else if (type === 'r' && clipAngle(x, '0to360') > zeroThreshold) {
        return false;
      } else if (type === 'rc') {
        if (
          clipAngle(x, '0to360') > zeroThreshold
          || clipAngle(y, '0to360') > zeroThreshold
          || clipAngle(z, '0to360') > zeroThreshold
        ) {
          return false;
        }
      } else if (type === 'rs') {
        if (
          clipAngle(x, '0to360') > zeroThreshold
          || clipAngle(y, '0to360') > zeroThreshold
        ) {
          return false;
        }
      } else if (type === 'ra') {
        if (
          Math.abs(x) > zeroThreshold
          || Math.abs(y) > zeroThreshold
          || Math.abs(z) > zeroThreshold
          || clipAngle(a, '0to360') > zeroThreshold
        ) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Return a duplicate transform.
   */
  _dup(): Transform {
    const t = new Transform();
    t.name = this.name; // $FlowFixMe
    t.mat = this.mat.slice();
    t.index = this.index;  // $FlowFixMe
    t.def = this.def.map(d => d.slice());
    return t;
  }

  // Return the velocity of each element in the transform
  // If the current and previous transforms are inconsistent in type order,
  // then a transform of value 0, but with the same type order as "this" will
  // be returned.
  velocity(
    previousTransform: Transform,
    deltaTime: number,
    zeroThreshold: TypeTransformValue,
    maxTransform: TypeTransformValue,
  ): Transform {
    const def = [];
    if (!this.isEqualShapeTo(previousTransform)) {
      throw new Error(`Cannot calculate velocity for transform - shapes are different: ${JSON.stringify(previousTransform.def)}, ${JSON.stringify(this.def)}`);
    }

    const deltaTransform = this.sub(previousTransform);
    for (let i = 0; i < deltaTransform.def.length; i += 1) {
      const t = deltaTransform.def[i]; // $FlowFixMe
      def.push(makeTransformComponent(
        t, j => t[j] / deltaTime,
      ));
      // if (t[0] === 't' || t[0] === 's' || t[0] === 'r') {  // $FlowFixMe
      //   def.push([t[0], t[1] / deltaTime, t[2] / deltaTime, t[3] / deltaTime]);
      // }
    }

    const v = new Transform(def);
    return v.clipMag(zeroThreshold, maxTransform);
  }

  /**
   * Return a duplicate transform chain where all transforms are
   * identity transforms.
   */
  identity() {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const [type] = this.def[i];
      if (type === 't') { // $FlowFixMe
        def.push([type, 0, 0, 0]);
      } else if (type === 's') { // $FlowFixMe
        def.push([type, 1, 1, 1]);
      } else if (type === 'r') { // $FlowFixMe
        def.push([type, 0]);
      } else if (type === 'rs') { // $FlowFixMe
        def.push([type, 0, 0]);
      } else if (type === 'rc') { // $FlowFixMe
        def.push([type, 0, 0, 0]);
      } else if (type === 'rd') { // $FlowFixMe
        def.push([type, 1, 0, 0]);
      } else if (type === 'ra') { // $FlowFixMe
        def.push([type, 1, 0, 0, 0]);
      } else if (type === 'c') {
        def.push([
          'c',
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ]);
      }
    }  // $FlowFixMe
    return new Transform(def, this.name);
  }
}

export type TypeF1DefTransform = {
  f1Type: 'tf',
  state: TransformDefinition,
};

/**
 * A {@link Transform} can be defined in several ways
 * As a Transform: new Transform()
 * As an array of ['s', number, number], ['r', number] and/or ['t', number, number] arrays
 * As a string representing the JSON of the array form
 }
 * @example
 * // t1, t2, and t3 are all the same when parsed by `getTransform`
 * t1 = new Transform().scale(1, 1).rotate(0).translate(2, 2);
 * t2 = [['s', 1, 1], ['r', 0], ['t', 2, 2]];
 * t3 = '[['s', 1, 1], ['r', 0], ['t', 2, 2]]';
 */
export type TypeParsableTransform = Array<string | ['s', number, number] | ['r', number] | ['t', number, number]> | string | Transform | TypeF1DefTransform;

function isParsableTransform(value: any) {
  if (value instanceof Transform) {
    return true;
  }
  if (
    Array.isArray(value)
    && Array.isArray(value[0])
    && (
      value[0][0] === 'r'
      || value[0][0] === 's'
      || value[0][0] === 't'
      || value[0][0] === 'c'
      || value[0][0] === 'ra'
      || value[0][0] === 'rc'
      || value[0][0] === 'rd'
      || value[0][0] === 'rs'
    )
  ) {
    return true;
  }
  if (value.f1Type != null && value.f1Type === 'tf') {
    return true;
  }
  if (typeof value === 'string') {
    let newValue;
    try {
      newValue = JSON.parse(value);
    } catch {
      return false;
    }
    return isParsableTransform(newValue);
  }
  return false;
}

function parseArrayTransformDefinition(defIn: TransformDefinition) {
  const def = [];
  let name = '';
  for (let i = 0; i < defIn.length; i += 1) {
    if (typeof defIn[i] === 'string') {
      name = defIn[i];  // eslint-disable-next-line no-continue
      continue;
    } // $FlowFixMe
    const [type, x, y] = defIn[i];
    const len = defIn[i].length;
    if (len === 4 || len === 5 || len === 17) {
      def.push(defIn[i]);
    } else if (len === 3 && type === 't') {
      def.push(['t', x, y, 0]);
    } else if (len === 3 && type === 's') {
      def.push(['s', x, y, 1]);
    } else if (len === 3 && type === 'rs') {
      def.push(['rs', x, y]);
    } else if (len === 2 && type === 's') {
      def.push(['s', x, x, x]);
    } else if (len === 2 && type === 'r') {
      def.push(['r', x]);
    } else {
      throw new Error(`Cannot parse transform array definition: ${JSON.stringify(defIn)}`);
    }
  }
  return { name, def };
}

function parseTransform(inTransform: TypeParsableTransform): Transform {
  if (inTransform instanceof Transform) {
    return inTransform;
  }
  if (inTransform == null) {
    throw new Error(`FigureOne could not parse transform with no input: '${JSON.stringify(inTransform)}'`);
  }

  let tToUse = inTransform;
  if (typeof tToUse === 'string') {
    try {
      tToUse = JSON.parse(tToUse);
    } catch {
      throw new Error(`FigureOne could not parse transform with no input: '${JSON.stringify(inTransform)}'`);
    }
  }

  if (Array.isArray(tToUse)) { // $FlowFixMe
    const t = new Transform(tToUse);
    return t;
  }
  const { f1Type, state } = tToUse;
  if (
    f1Type != null
    && f1Type === 'tf'
    && state != null
    && Array.isArray(state)
  ) {  // $FlowFixMe
    const t = new Transform(state.slice(1), tToUse.state[0]);
    return t;
  }
  throw new Error(`FigureOne could not parse transform: '${JSON.stringify(inTransform)}'`);
}

/**
 * Convert a parsable transform definition to a {@link Transform}.
 * @param {TypeParsableTransform} t parsable transform definition
 * @return {Transform} transform object
 */
function getTransform(t: TypeParsableTransform): Transform {
  let parsedTransform = parseTransform(t);
  if (parsedTransform == null) {
    parsedTransform = new Transform();
  }
  return parsedTransform;
}

function transformValueToArray(
  transformValue: TypeTransformValue,
  transform: Transform,
  // defaultTransformationValue: TypeTransformValue = {},
): Array<number> {
  if (Array.isArray(transformValue)) {
    return transformValue;
  }
  const def = [];
  // debugger;
  if (typeof transformValue === 'number') {
    for (let i = 0; i < transform.def.length; i += 1) {
      def.push(transformValue);
    }
    return def;
  }

  for (let i = 0; i < transform.def.length; i += 1) {
    const type = transform.def[i][0];
    if (type === 't') {
      let value = 0;
      if (transformValue.position != null) {
        value = transformValue.position;
      }
      if (transformValue.translation != null) {
        value = transformValue.translation;
      }
      def.push(value);
    } else if (type === 's') {
      let value = 0;
      if (transformValue.scale != null) {
        value = transformValue.scale;
      }
      def.push(value);
    } else if (type[0] === 'r') {
      let value = 0;
      if (transformValue.rotation != null) {
        value = transformValue.rotation;
      }
      def.push(value);
    } else if (type[0] === 'x') {
      let value = 0;
      if (transformValue.custom != null) {
        value = transformValue.custom;
      }
      def.push(value);
    }
  }

  return def;
}


export {
  getTransform,
  Transform,
  isParsableTransform,
  transformValueToArray,
};

