// @flow
/* eslint-disable no-use-before-define */
import {
  roundNum, clipMag, round,
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

/**
 * Orthonormal basis definition. Use either (i, j, k), (x, y, z) or
 * (right, top, normal). They are identical, but different terminology may
 * be useful for different contexts.
 * @property {TypeParsablePoint} [i]
 * @property {TypeParsablePoint} [j]
 * @property {TypeParsablePoint} [k]
 * @property {TypeParsablePoint} [x]
 * @property {TypeParsablePoint} [y]
 * @property {TypeParsablePoint} [z]
 * @property {TypeParsablePoint} [right]
 * @property {TypeParsablePoint} [top]
 * @property {TypeParsablePoint} [normal]
 */
export type TypeBasisObjectDefinition = {
  i?: TypeParsablePoint,
  j?: TypeParsablePoint,
  k?: TypeParsablePoint,
  x?: TypeParsablePoint,
  y?: TypeParsablePoint,
  z?: TypeParsablePoint,
  right?: TypeParsablePoint,
  top?: TypeParsablePoint,
  normal?: TypeParsablePoint,
}

/**
 * Rotation transform component definition. First number is the rotation value
 * an the next three numbers define the x, y, and z components of the axis
 * vector.
 *
 * `['r', number, number, number, number]`
 */
export type TypeTransformRotation = ['r', number, number, number, number];

/**
 * Direction transform component. The numbers are the xyz components of the
 * vector to direct to.
 *
 * This is equivalent to an axis rotation where the axis is the normal
 * to the plane formed by [1, 0, 0] and `d`
 *
 * `['d', number, number, number]`
 */
export type TypeTransformDirection = ['d', number, number, number];

/**
 * Translation transform component. The numbers are the xy(z) components of the
 * translation.
 *
 * `['t', number, number, number]`
 */
export type TypeTransformTranslation = ['t', number, number, number];

/**
 * Scale transform component. Using just a single number scales xyz components
 * equally. Using two numbers scales the xy components and sets z to 1. Using
 * three numbers defines each xyz component.
 *
 * `['s', number, number, number] | ['s', number, number] | ['s', number]`
 */
export type TypeTransformScale = ['s', number, number, number];

/* eslint-disable max-len */
/**
 * Custom transform component defined by a 4x4 matrix.
 *
 * `['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]`
 */
export type TypeTransformCustom = ['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

/**
 * Change of basis transform component definition. This is a change of basis
 * from the standard basis: i: (1, 0, 0), j: (0, 1, 0), k: (0, 0, 1).
 *
 * `['b', number, number, number, number, number, number, number, number, number]`
 */
export type TypeTransformBasis = ['b', number, number, number, number, number, number, number, number, number];

/**
 * Change of basis transform component definition relative to a specified
 * initial basis.
 *
 * `['bb', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]`
 */
export type TypeTransformBasisToBasis = ['bb', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

/**
 * Change of basis transform component definition. This is a change of basis
 * from the standard basis: i: (1, 0, 0), j: (0, 1, 0), k: (0, 0, 1).
 *
 * A basis can be defined with either the definition object
 * {@link TypeBasisObjectDefinition} where only two vectors need to be defined
 * (the third will be automatically calculated), or with 9 numbers where all
 * three vectors need to be defined in (ix, iy, iz, jx, jy, jz, kx, ky, kz)
 * order.
 *
 * ` ['b', `{@link TypeBasisObjectDefinition}`] | ` {@link TypeTransformBasis}
 */
export type TypeTransformBasisUserDefinition = ['b', TypeBasisObjectDefinition] | TypeTransformBasis;

/**
 * Change of basis transform component definition relative to a specified
 * initial basis.
 *
 * A basis can be defined with either the definition object
 * {@link TypeBasisObjectDefinition} where only two vectors need to be defined
 * (the third will be automatically calculated), or with 9 numbers where all
 * three vectors need to be defined in (ix, iy, iz, jx, jy, jz, kx, ky, kz)
 * order.
 *
 * In either case, the first object or nine numbers define the initial basis
 * and the second object or nin numbers define the basis to move to.
 *
 * ` ['bb', `{@link TypeBasisObjectDefinition}`, `{@link TypeBasisObjectDefinition}`] | ` {@link TypeTransformBasisToBasis}
 */
export type TypeTransformBasisToBasisUserDefinition = ['bb', TypeBasisObjectDefinition, TypeBasisObjectDefinition] | TypeTransformBasisToBasis;


/**
 * Transform Component.
 *
 * {@link TypeTransformRotation} | {@link TypeTransformDirection} | {@link TypeTransformTranslation} | {@link TypeTransformScale} | {@link TypeTransformCustom} | {@link TypeTransformBasis} | {@link TypeTransformBasisToBasis}
*/
export type TypeTransformComponent = TypeTransformRotation
   | TypeTransformDirection | TypeTransformTranslation
   | TypeTransformScale | TypeTransformCustom | TypeTransformBasis
   | TypeTransformBasisToBasis;


/**
 * Transform component defined by a user.
 *
 * {@link TypeTransformRotation} | {@link TypeTransformDirection} | {@link TypeTransformTranslation} | {@link TypeTransformScale} | {@link TypeTransformCustom} | {@link TypeTransformBasisUserDefinition} | {@link TypeTransformBasisToBasisUserDefinition}
*/
export type TypeTransformComponentUserDefinition = TypeTransformRotation
  | TypeTransformDirection | TypeTransformTranslation
  | TypeTransformScale | TypeTransformCustom | TypeTransformBasisUserDefinition
  | TypeTransformBasisToBasisUserDefinition | ['r', number] | ['t', number, number] | ['s', number] | ['s', number, number];

/**
 * Transform array definition.
 *
 *
 *
 * `Array<`{@link TypeTransformComponent}`>`
 */
export type TypeTransformDefinition = Array<TypeTransformComponent>

/**
 * Transform array user definition.
 *
 * `Array<`{@link TypeTransformComponent}` | `{@link TypeTransformBasisUserDefinition}` | `{@link TypeTransformBasisToBasisUserDefinition}`>`
 */
export type TypeTransformUserDefinition = Array<TypeTransformComponentUserDefinition>;

/**
 * Transform state definition of a {@link Transform} that represents an array
 * of transform components.
 *
 * ```
 * {
 *   f1Type: 'pl',
 *   state: TypeTransformDefinition
 * }
 * ```
 * @see {@link TypeTransformDefinition}
 */
export type TypeF1DefTransform = {
  f1Type: 'tf',
  state: TypeTransformDefinition,
};


export type TypeTransformComponentName = 't' | 's' | 'b' | 'bb' | 'c' | 'd' | 'r';


/**
 * A transform is defined with either:
 * - an instantiated {@link Transform}
 * - an array of transform components {@link TypeTransformUserDefinition}
 * - a single transform component {@link TypeTransformComponentUserDefinition}
 * - a recorder state definition {@link TypeF1DefTransform}
 * - A string representation of all options except the first
 *
 * @example
 * // t1, t2 and t3 are all equal transforms
 * const t1 = new Fig.Transform().scale(2).rotate(Math.PI / 2).translate(1, 1);
 * const t2 = new Fig.Transform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
 * const t3 = Fig.getTransform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
 *
 * @see See {@link Transform} for a summary of transfom components available.
 */
export type TypeParsableTransform = TypeTransformUserDefinition | TypeTransformComponentUserDefinition | Transform | TypeF1DefTransform;

/* eslint-enable max-len */


export type TypeTransformValue = number | Array<number> | {
  scale?: number,
  position?: number,
  translation?: number,
  rotation?: number,
};


// Parse a basis definition object and return a full set of (x, y, z) basis
// vectors.
function parseBasisObject(
  basis: TypeBasisObjectDefinition,
  normalize: boolean = false,
) {
  const {
    i, j, k, x, y, z,
  } = basis;
  let {
    right, top, normal,
  } = basis;
  if (x != null) {
    right = x;
  }
  if (i != null) {
    right = i;
  }
  if (right != null) {
    right = getPoint(right);
  }
  if (y != null) {
    top = y;
  }
  if (j != null) {
    top = j;
  }
  if (top != null) {
    top = getPoint(top);
  }
  if (z != null) {
    normal = z;
  }
  if (k != null) {
    normal = k;
  }
  if (normal != null) {
    normal = getPoint(normal);
  }

  if (top == null && right != null && normal != null) {
    top = normal.crossProduct(right).normalize();
  } else if (top != null && right == null && normal != null) {
    right = top.crossProduct(normal).normalize();
  } else if (top != null && right != null && normal == null) {
    normal = right.crossProduct(top).normalize();
  }

  if (top == null || right == null || normal == null) {
    throw new Error(`Parsing basis fail - need at least two orthogonal basis vectors. Input: ${JSON.stringify(basis)}`);
  }

  if (normalize) {
    right = right.normalize();
    top = top.normalize();
    normal = normal.normalize();
  }
  return [
    ...right.toArray(),
    ...top.toArray(),
    ...normal.toArray(),
  ];
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
 * A Transform is a chain or cascade of transform components, such as rotations
 * and translations.
 *
 * The transform components cascade to form a single 3D transform matrix in
 * homogenous coordinates - meaning the result is a 4x4 matrix. This matrix can
 * be used to transform a point in space.
 *
 * There are several built in transform components:
 *
 * - Translation
 * - Scale
 * - Rotation
 * - Direction transform
 * - Custom (where a specific matrix can be defined)
 * - Change of basis from standard basis
 * - Change of basis from an initial basis
 *
 * Matrix multiplication is not commutative, and so chaining transforms is not
 * commutative. This means the order of components is important.
 *
 * For example, if a point (1, 0) is first translated by (1, 0) and then
 * rotated by π / 2, then it will start at (1, 0), then move to (2, 0), then
 * rotate to (0, 2).
 *
 * In comparison if the same point is first rotated by π / 2 then translated by
 * (1, 0) it will start at (1, 0), then rotate to (0, 1), then move to (1, 1).
 *
 * In this Transform object, the order that components are defined, is the order
 * the resulting transform will represent.
 *
 * A transform can be created by either chaining transform component methods on
 * an instantiated Transform object, or using an array definition of
 * components. For example the following two transforms are the same:
 * ```
 * const t1 = new Transform().scale(1).translate(1, 0);
 * const t2 = new Transform([['s', 1], ['t', 1, 0]]);
 * ```
 *
 * @see See {@link TypeParsableTransform} for the different ways to define a transform.
 */
class Transform {
  def: TypeTransformDefinition;
  // order: Array<Translation | Rotation | Scale>;
  mat: Type3DMatrix;
  // index: number;
  translationIndex: number;
  _type: 'transform';

  /**
   * @param {TypeParsableTransform} chain chain of transform components.
   */
  constructor(chain: TypeParsableTransform = []) {
    this.def = [];
    if (chain instanceof Transform) {
      this.def = chain.def.slice();
    } else {
      this.def = parseTransformDef(chain);
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
      state: outDef,
    };
  }

  /**
   * Query if transform has a specific component.
   * @param {TypeTransformComponentName} componentName
   * @return {boolean} `true` if component name exists
   */
  hasComponent(componentName: TypeTransformComponentName) {
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] === componentName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set a component at a speicific index of the transform definition.
   *
   * @param {number} index index to set component
   * @param {TypeTransformComponent} def component definition
   *
   * @return {Transform} this transform
   */
  setComponent(index: number, def: TypeTransformComponent) {
    this.def[index] = def;
    this.calcAndSetMatrix();
    return this;
  }

  /**
   * Add a transform component to the chain
   *
   * @param {TypeTransformComponent} def component definition
   * @return {Transform} this transform
   */
  addComponent(def: TypeTransformComponent) {
    this.def.push(def);
    this.calcAndSetMatrix();
    return this;
  }

  /**
   * Return a duplicate transform with an added translation component.
   *
   * The translation can either be defined as:
   *
   * * A point
   * * x, y values (z will be automatically set to 0)
   * * x, y, and z values
   *
   * @param {number | TypeParsablePoint} xOrTranslation
   * @param {number} y
   * @param {number} z
   *
   * @return {Transform}
   */
  translate(
    xOrTranslation: number | TypeParsablePoint = 0,
    y: number = 0,
    z: number = 0,
  ) {
    let _x;
    let _y = y;
    let _z = z;
    if (typeof xOrTranslation !== 'number') {
      [_x, _y, _z] = getPoint(xOrTranslation).toArray();
    } else {
      _x = xOrTranslation;
    }
    return this.addComponent(['t', _x, _y, _z]);
  }

  /**
   * Return a duplicate transform with an added rotation component.
   * @param {number} rotation
   * @param {number | TypeParsablePoint | 'x' | 'y' | 'z'} axisOrX (`z`)
   * @param {number} y (`0`)
   * @param {number} z (`0`)
   * @return {Transform}
   */
  rotate(
    rotation: number,
    axisOrX: number | TypeParsablePoint | 'x' | 'y' | 'z' = 'z',
    y: number = 0,
    z: number = 0,
  ) {
    let axis;
    if (typeof axisOrX === 'number') {
      axis = [axisOrX, y, z];
    } else if (axisOrX === 'x') {
      axis = [1, 0, 0];
    } else if (axisOrX === 'y') {
      axis = [0, 1, 0];
    } else if (axisOrX === 'z') {
      axis = [0, 0, 1];
    } else {
      axis = getPoint(axisOrX).toArray();
    }
    return this.addComponent(['r', rotation, ...axis]);
  }

  /**
   * Return a duplicate transform with an added direction transform component.
   *
   * @param {number | TypeParsablePoint} xOrDirection
   * @param {number} y
   * @param {number} z
   * @return {Transform}
   */
  direction(xOrDirection: number | TypeParsablePoint, y: number = 0, z: number = 0) {
    let _x;
    let _y;
    let _z;
    if (typeof xOrDirection === 'number') {
      _x = xOrDirection;
      _y = y;
      _z = z;
    } else {
      const direction = getPoint(xOrDirection);
      _x = direction.x;
      _y = direction.y;
      _z = direction.z;
    }

    return this.addComponent(['d', _x, _y, _z]);
  }


  /**
   * Return a duplicate transform with an added change of basis from the
   * standard basis transform component.
   *
   * @param {TypeBasisObjectDefinition} toBasis
   * @return {Transform}
   */
  basis(
    toBasis: TypeBasisObjectDefinition,
  ) {
    const basis = parseBasisObject(toBasis);
    return this.addComponent(['b', ...basis]);
  }

  /**
   * Return a duplicate transform with an added change of basis transform
   * component.
   *
   * @param {TypeBasisObjectDefinition} fromeBasis
   * @param {TypeBasisObjectDefinition} toBasis
   * @return {Transform}
   */
  basisToBasis(
    fromBasis: TypeBasisObjectDefinition,
    toBasis: TypeBasisObjectDefinition,
  ) {
    const from = parseBasisObject(fromBasis);
    const to = parseBasisObject(toBasis);
    return this.addComponent(['bb', ...from, ...to]);
  }

  /**
   * Return a duplicate transform with an added custom transform
   * component.
   *
   * @param {Type3DMatrix} matrix
   * @return {Transform}
   */
  custom(matrix: Type3DMatrix) {
    if (matrix.length !== 16) {
      throw new Error(`Transform custom matrices must be 16 elements (${matrix.length} input): ${JSON.stringify(matrix)}`);
    }
    return this.addComponent(['c', ...matrix]);
  }

  /**
   * Return a duplicate transform with an added scale transform component
   * @param {number | TypeParsablePoint} sOrSxOrPoint
   * @param {number} sy
   * @param {number} sz
   * @return {Transform}
   */
  scale(
    sOrSxOrPoint: number | TypeParsablePoint,
    sy: number | null = null,
    sz: number = 1,
  ) {
    let _sx;
    let _sy = sy;
    let _sz = sz;
    if (typeof sOrSxOrPoint === 'number') {
      _sx = sOrSxOrPoint;
      if (_sy == null) {
        _sy = sOrSxOrPoint;
        _sz = sOrSxOrPoint;
      }
    } else {
      [_sx, _sy, _sz] = getScale(sOrSxOrPoint).toArray();
    }
    return this.addComponent(['s', _sx, _sy, _sz]);
  }

  calcMatrix(
    defStart: number = 0,
    defEnd: number = this.def.length - 1,
  ): Type3DMatrix {
    let defEndToUse = defEnd;
    if (defEnd < 0) {
      defEndToUse = this.def.length + defEnd;
    }
    let m = m3.identity();
    for (let i = defEndToUse; i >= defStart; i -= 1) { // $FlowFixMe
      const [type, v1, v2, v3, v4] = this.def[i];
      if (type === 't' && v1 != null && v2 != null) {
        // if (v3 == null && (v1 !== 0 || v2 !== 0)) {
        //   m = m3.mul(m, m3.translationMatrix(v1, v2, 0));
        // }
        if (v3 != null && (v1 !== 0 || v2 !== 0 || v3 !== 0)) {
          m = m3.mul(m, m3.translationMatrix(v1, v2, v3));
        }
      } else if (type === 's' && (v1 !== 1 || v2 !== 1 || v3 !== 1)) {
        // } else if (v3 != null && (v1 !== 1 || v2 !== 1 || v3 !== 1)) {
        m = m3.mul(m, m3.scaleMatrix(v1, v2, v3));
        // }
        // if (v3 == null && v2 == null && (v1 !== 1)) {
        //   m = m3.mul(m, m3.scaleMatrix(v1, v1, v1));
        // } else if (v3 == null && v2 != null && (v1 !== 1 || v2 !== 1)) {
        //   m = m3.mul(m, m3.scaleMatrix(v1, v2, 1));
        // } else if (v3 != null && (v1 !== 1 || v2 !== 1 || v3 !== 1)) {
        //   m = m3.mul(m, m3.scaleMatrix(v1, v2, v3));
        // }
      } else if (type === 'd' && (v1 !== 1 || v2 !== 0 || v3 !== 0)) {
        m = m3.mul(m, m3.rotationMatrixDirection([v1, v2, v3]));
      } else if (type === 'r' && v1 !== 0) {
        m = m3.mul(m, m3.rotationMatrixAxis([v2, v3, v4], v1));
      } else if (type === 'b') {
        m = m3.mul(m, m3.basisMatrix( // $FlowFixMe
          this.def[i].slice(1, 4),  // $FlowFixMe
          this.def[i].slice(4, 7),  // $FlowFixMe
          this.def[i].slice(7),
        ));
      } else if (type === 'c') {  // $FlowFixMe
        m = m3.mul(m, this.def[i].slice(1));
      } else if (type === 'bb' && this.def[i].length === 19) {
        m = m3.mul(m, m3.basisToBasisMatrix(
          [  // $FlowFixMe
            this.def[i].slice(1, 4),  // $FlowFixMe
            this.def[i].slice(4, 7),  // $FlowFixMe
            this.def[i].slice(7, 10),
          ],
          [  // $FlowFixMe
            this.def[i].slice(10, 13),  // $FlowFixMe
            this.def[i].slice(13, 16),  // $FlowFixMe
            this.def[i].slice(16),
          ],
        ));
      }
    }
    return m;
  }

  calcAndSetMatrix() {
    this.mat = this.calcMatrix();
  }

  /**
   * Get the nth transform component index of `type`.
   * @param {TypeTransformComponentName} type
   * @param {number} n (`0`)
   * @return {number} index of component
   */
  getComponentIndex(
    type: TypeTransformComponentName | Array<TypeTransformComponentName>,
    n: number = 0,
  ) {
    let count = 0;
    let types;
    if (Array.isArray(type)) {
      types = type;
    } else {
      types = [type];
    }
    for (let i = 0; i < this.def.length; i += 1) {
      for (let j = 0; j < types.length; j += 1) {
        if (this.def[i][0] === types[j]) {
          if (count === n) {
            return i;
          }
          count += 1;
        }
      }
    }
    throw new Error(`Cannot get type '${JSON.stringify(type)}-${n}' from transform '${JSON.stringify(this.def)}'`);
  }


  /**
   * Clip all rotation (2D, axis, x, y, z rotations) transform components
   * within this transform chain angles between 0º-360º, -180º-180º, or not at
   * all (`null`)
   *
   * Only angle values are clipped. The axis values of the axis rotation is not
   * changed.
   *
   * @param {'0to360' | '-180to180' | null} clipTo
   */
  clipRotation(clipTo: '0to360' | '-180to180' | null) {
    for (let i = 0; i < this.def.length; i += 1) {
      const component = this.def[i];
      if (component[0] === 'r') {
        // $FlowFixMe
        const [type, r, x, y, z] = component;
        if (type === 'r') {
          this.def[i] = ['r', clipAngle(r, clipTo), x, y, z];
        }
      }
    }
    this.calcAndSetMatrix();
  }

  /**
   * Update the nth translation transform component with a new translation.
   * @param {TypeParsablePoint} translation
   * @param {number} n
   * @return {Transform}
   */
  updateTranslation(
    translation: TypeParsablePoint,
    n: number = 0,
  ) {
    return this.updateComponent(['t', ...getPoint(translation).toArray()], n);
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
    throw new Error(`Cannot update '${JSON.stringify(def)}-${n}' in transform: ${JSON.stringify(this.def)}`);
  }


  /**
   * Return a linearly interpolated transform between this transform and
   * `delta` at some `percent` between the two.
   *
   * For translation transform components, interpolation can either be
   * `'linear'` or '`curved'`.
   * @param {Transform} delta delta transform
   * @param {number} percent percent to interpolate where 0 is this transform
   * and 1 is delta transform
   * @param {'linear' | 'curved' | 'curve' = 'linear'} translationStyle
   * translation style for translation components only
   * @param {OBJ_TranslationPath = {}} translationOptions
   * translation options for translation components only
   * @return {Transform}
   */
  toDelta(
    delta: Transform,
    percent: number,
    translationStyle: 'linear' | 'curved' | 'curve' = 'linear',
    translationOptions: OBJ_TranslationPath = {},
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
          stepStart[0], // $FlowFixMe
          ...stepDelta.slice(1).map((d, j) => d * percent + stepStart[j + 1]),
        ];
      } else if (stepStart[0] === 't' && stepDelta[0] === 't') { // $FlowFixMe
        const start = new Point(stepStart[1], stepStart[2], stepStart[3]); // $FlowFixMe
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
   * Retrieve the nth translation transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  t(n: number = 0): ?Point {
    const i = this.getComponentIndex('t', n);
    // $FlowFixMe
    const [, x, y, z] = this.def[i];
    return new Point(x, y, z);
  }

  /**
   * Retrieve the nth scale transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  s(n: number = 0): ?Point {
    const i = this.getComponentIndex('s', n); // $FlowFixMe
    const [, x, y, z] = this.def[i];
    return new Point(x, y, z);
  }

  /**
   * Retrieve the nth rotation transform component rotation value.
   *
   * @param {number} n (`0`)
   * @return {Point}
   */
  r(n: number = 0) {
    const index = this.getComponentIndex('r', n);
    return this.def[index][1];
  }

  /**
   * Retrieve the nth rotation transform component axis.
   *
   * @param {number} n (`0`)
   * @return {Point}
   */
  ra(n: number = 0) {
    const index = this.getComponentIndex('r', n); // $FlowFixMe
    return getPoint(this.def[index].slice(2));
  }


  /**
   * Retrieve the nth direction transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  d(n: number = 0) {
    return this.def[this.getComponentIndex('d', n)].slice(1);
  }

  /**
   * Retrieve the nth custom transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  c(n: number = 0) {
    return this.def[this.getComponentIndex('c', n)].slice(1);
  }

  /**
   * Retrieve the nth change of basis from standard basis transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  b(n: number = 0) {
    return this.def[this.getComponentIndex('b', n)].slice(1);
  }

  /**
   * Retrieve the nth change of basis transform component.
   * @param {number} n (`0`)
   * @return {Point}
   */
  bb(n: number = 0) {
    return this.def[this.getComponentIndex('bb', n)].slice(1);
  }

  /**
   * Update the nth scale transform component with a new scale.
   * @param {TypeParsablePoint} scale
   * @param {number} n
   * @return {Transform}
   */
  updateScale(
    scale: number | TypeParsablePoint,
    n: number = 0,
  ) {
    return this.updateComponent(['s', ...getScale(scale).toArray()], n);
  }

  /**
   * Update the nth rotation transform component.
   * @param {number} r
   * @param {TypeParsablePoint} axis
   * @param {number} n
   * @return {Transform}
   */
  updateRotation(
    r: number,
    axis: TypeParsablePoint | null = null,
    n: number = 0,
  ) {
    let axisToUse = [];
    if (axis == null) {
      axisToUse = this.def[this.getComponentIndex('r', n)].slice(2);
    } else {
      axisToUse = getPoint(axis).toArray();
    } // $FlowFixMe
    return this.updateComponent(['r', r, ...axisToUse], n);
  }

  /**
   * Update the nth direction transform component.
   * @param {number} d
   * @param {number} n
   * @return {Transform}
   */
  updateDirection(
    d: TypeParsablePoint,
    n: number = 0,
  ) {
    return this.updateComponent(['d', ...getPoint(d).toArray()], n);
  }

  /**
   * Update the nth custom transform component.
   * @param {Type3DMatrix} c
   * @param {number} n
   * @return {Transform}
   */
  updateCustom(
    c: Type3DMatrix,
    n: number = 0,
  ) {
    return this.updateComponent(['c', ...c], n);
  }

  /**
   * Update the nth change of basis from the standard basis transform component.
   * @param {TypeBasisObjectDefinition} b
   * @param {number} n
   * @return {Transform}
   */
  updateBasis(
    b: TypeBasisObjectDefinition,
    n: number = 0,
  ) {
    return this.updateComponent(['b', ...parseBasisObject(b)], n);
  }

  /**
   * Update the nth change of basis transform component.
   * @param {TypeBasisObjectDefinition} fromBasis
   * @param {TypeBasisObjectDefinition} toBasis
   * @param {number} n
   * @return {Transform}
   */
  updateBasisToBasis(
    fromBasis: TypeBasisObjectDefinition,
    toBasis: TypeBasisObjectDefinition,
    n: number = 0,
  ) {
    return this.updateComponent(['bb', ...parseBasisObject(fromBasis), ...parseBasisObject(toBasis)], n);
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
   * @param {number | null} precision round the matrix to some precision or
   * `null` for no rounding (`null`)
   * @return {Type3DMatrix}
   */
  matrix(precision: number | null = null): Type3DMatrix {
    if (precision) { // $FlowFixMe
      return round(this.mat, precision);
    }
    return this.mat;
  }

  /**
   * `true` if `transformToCompare` has the same order of transform components.
   * @param {TypeParsableTransform} transformToCompare
   * @return {boolean}
   */
  isEqualShapeTo(transformToCompare: TypeParsableTransform): boolean {
    const t = getTransform(transformToCompare);
    if (t.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      if (this.def[i][0] !== t.def[i][0]) {
        return false;
      }
    }
    return true;
  }

  /**
   * `true` if `transformToCompare` is equal to this transform within some
   * `precision`.
   * @param {TypeParsableTransform} transformToCompare
   * @return {boolean}
   */
  isEqualTo(transformToCompare: TypeParsableTransform, precision: number = 8): boolean {
    const t = getTransform(transformToCompare);
    if (t.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = t.def[i];
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
   * @param {TypeParsableTransform} transformToCompare
   * @return {boolean}
   */
  isWithinDelta(transformToCompare: TypeParsableTransform, delta: number = 0.00000001): boolean {
    const t = getTransform(transformToCompare);
    if (t.def.length !== this.def.length) {
      return false;
    }
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = t.def[i];
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
   * Subtract each corresponding transform component. Both transforms must
   * have the same shape.
   *
   * @param {TypeParsableTransform} transformToSubtract
   * @see <a href="#transformisequalshapeto">Transform.isEqualShapeTo</a>
   */
  sub(transformToSubtract: TypeParsableTransform = new Transform()): Transform {
    const t = getTransform(transformToSubtract);
    if (!this.isEqualShapeTo(t)) {
      throw new Error(`Cannot subtract transforms of different shape: '${JSON.stringify(this.def)}', '${JSON.stringify(t.def)}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = t.def[i]; // $FlowFixMe
      def.push([a[0], ...a.slice(1).map((v, j) => v - b[j + 1])]);
    } // $FlowFixMe
    return new Transform(def);
  }

  /**
   * Subtract each corresponding transform component. Both transforms must
   * have the same shape.
   *
   * @param {TypeParsableTransform} transformToAdd
   * @see <a href="#transformisequalshapeto">Transform.isEqualShapeTo</a>
   */
  add(transformToAdd: TypeParsableTransform = new Transform()): Transform {
    const t = getTransform(transformToAdd);
    if (!this.isEqualShapeTo(t)) {
      throw new Error(`Cannot add transforms of different shape: '${JSON.stringify(this.def)}', '${JSON.stringify(t.def)}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = t.def[i]; // $FlowFixMe
      def.push([a[0], ...a.slice(1).map((v, j) => v + b[j + 1])]);
    } // $FlowFixMe
    return new Transform(def);
  }

  /**
   * Multiply each corresponding transform component. Both transforms must
   * have the same shape.
   *
   * @param {TypeParsableTransform} transformToMultiply
   * @see <a href="#transformisequalshapeto">Transform.isEqualShapeTo</a>
   */
  mul(transformToMultiply: TypeParsableTransform = new Transform()): Transform {
    const t = getTransform(transformToMultiply);
    if (!this.isEqualShapeTo(t)) {
      throw new Error(`Cannot multiply transforms of different shape: '${JSON.stringify(this.def)}', '${JSON.stringify(t.def)}'`);
    }
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      const a = this.def[i];
      const b = t.def[i]; // $FlowFixMe
      def.push([a[0], ...a.slice(1).map((v, j) => v * b[j + 1])]);
    } // $FlowFixMe
    return new Transform(def);
  }

  /**
   * Cascade two transforms together such that this transform transforms
   * the input transform. In other words, the transform components of the
   * input transform will performed first before this transform.
   *
   * @param {TypeParsableTransform} transform
   * @return {Transform}
   */
  transform(transform: TypeParsableTransform) {
    const t = new Transform([]); // $FlowFixMe
    const it = getTransform(transform);
    t.def = it.def  // $FlowFixMe
      .map(d => d.slice()).concat(this.def.map(d => d.slice()));
    t.mat = m3.mul(this.matrix(), it.matrix());
    return t;
  }

  /**
   * Cascade two transforms together such that this transform is transformed
   * by the input transform. In other words, the this transform's components
   * of will performed first before the input transform transform.
   *
   * @param {TypeParsableTransform} transform
   * @return {Transform}
   */
  transformBy(transform: TypeParsableTransform): Transform {
    const t1 = new Transform([]); // $FlowFixMe
    const it = getTransform(transform);  // $FlowFixMe
    t1.def = this.def.map(d => d.slice()).concat(it.def.map(d => d.slice()));
    t1.mat = m3.mul(it.matrix(), this.matrix());
    return t1;
  }

  /**
   * Return a duplicate transform with all values rounded to some precision.
   *
   * @param {number} precision (`8`)
   * @return Transform
   */
  round(precision: number = 8): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      def.push(makeTransformComponent(
        this.def[i], // $FlowFixMe
        j => roundNum(this.def[i][j], precision),
      ));
    }
    return new Transform(def);
  }

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
      const t = this.def[i]; // $FlowFixMe
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
      }
    }
    return new Transform(def);
  }

  constant(constant: number = 0): Transform {
    const def = [];
    for (let i = 0; i < this.def.length; i += 1) {
      def.push(makeTransformComponent(
        this.def[i],
        () => constant,
      ));
    }
    return new Transform(def);
  }

  zero(): Transform {
    return this.constant(0);
  }

  /**
   * `true` if all transforms within the transform chain are below the
   * `zeroThreshold`
   *
   * @param {number} zeroThreshold (`0`)
   * @return {boolean}
   */
  isZero(zeroThreshold: number = 0): boolean {
    for (let i = 0; i < this.def.length; i += 1) { // $FlowFixMe
      const [type, v1, v2, v3] = this.def[i];
      if (type === 't' || type === 's' || type === 'd') {
        if (
          Math.abs(v1) > zeroThreshold
          || Math.abs(v2) > zeroThreshold
          || Math.abs(v3) > zeroThreshold) {
          return false;
        }
      } else if (type === 'r' && clipAngle(v1, '0to360') > zeroThreshold) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return a duplicate transform.
   * @return {Transform}
   */
  _dup(): Transform {
    const t = new Transform();  // $FlowFixMe
    t.mat = this.mat.slice();  // $FlowFixMe
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
      def.push(makeTransformComponent( // $FlowFixMe
        t, j => t[j] / deltaTime,
      ));
    }
    const v = new Transform(def);
    return v.clipMag(zeroThreshold, maxTransform);
  }

  /**
   * Return a duplicate transform chain where all transform components are
   * the same component type but with identity values.
   * @return {Transform}
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
        def.push([type, 0, 0, 0, 1]);
      } else if (type === 'd') { // $FlowFixMe
        def.push([type, 0, 0, 0]);
      } else if (type === 'b') {
        def.push([
          'b',
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ]);
      } else if (type === 'bb') {
        def.push([
          'bb',
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ]);
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
    return new Transform(def);
  }
}


/**
 * Test if a value can be parsed to create a transform.
 *
 * @see {@link TypeParsableTransform}
 * @param {any} value
 * @return {boolean}
 */
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
      || value[0][0] === 'b'
      || value[0][0] === 'd'
      || value[0][0] === 'bb'
    )
  ) {
    return true;
  }
  if (
    Array.isArray(value)
    && (
      value[0] === 'r'
      || value[0] === 's'
      || value[0] === 't'
      || value[0] === 'c'
      || value[0] === 'b'
      || value[0] === 'bb'
      || value[0] === 'd'
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

function parseTransformDef(
  inTransform: TypeParsableTransform,
): TypeTransformDefinition {
  if (inTransform instanceof Transform) {  // $FlowFixMe
    return inTransform.def.slice();
  }
  if (inTransform == null) {
    throw new Error(`FigureOne could not parse transform with no input: '${JSON.stringify(inTransform)}'`);
  }

  let tToUse = inTransform;
  if (typeof tToUse === 'string') {
    if (tToUse === '') {
      return [];
    }
    try {
      tToUse = JSON.parse(tToUse);
    } catch {
      throw new Error(`FigureOne could not parse transform with no input: '${JSON.stringify(inTransform)}'`);
    }
  }

  if (Array.isArray(tToUse)) { // $FlowFixMe
    if (tToUse.length === 0) {
      return [];
    }
    if (!Array.isArray(tToUse[0])) {
      tToUse = [tToUse];
    }
    const def = [];
    for (let i = 0; i < tToUse.length; i += 1) {  // $FlowFixMe
      if (tToUse[i][0] === 'b' && typeof tToUse[i][1] !== 'number') { // $FlowFixMe
        def.push(['b', ...parseBasisObject(tToUse[i][1])]); // $FlowFixMe
      } else if (tToUse[i][0] === 'bb' && typeof tToUse[i][1] !== 'number') { // $FlowFixMe
        def.push(['bb', ...parseBasisObject(tToUse[i][1]), ...parseBasisObject(tToUse[i][2])]); // $FlowFixMe
      } else if (tToUse[i][0] === 'r' && tToUse[i].length === 2) {  // $FlowFixMe
        def.push(['r', tToUse[i][1], 0, 0, 1]);  // $FlowFixMe
      } else if (tToUse[i][0] === 's' && tToUse[i].length === 2) {  // $FlowFixMe
        def.push(['s', tToUse[i][1], tToUse[i][1], tToUse[i][1]]);  // $FlowFixMe
      } else if (tToUse[i][0] === 's' && tToUse[i].length === 3) {  // $FlowFixMe
        def.push(['s', tToUse[i][1], tToUse[i][2], 1]);  // $FlowFixMe
      } else if (tToUse[i][0] === 't' && tToUse[i].length === 3) {  // $FlowFixMe
        def.push(['t', tToUse[i][1], tToUse[i][2], 0]);
      } else { // $FlowFixMe
        def.push(tToUse[i].slice());
      }
    }  // $FlowFixMe
    return def;
  }
  const { f1Type, state } = tToUse;
  if (
    f1Type != null
    && f1Type === 'tf'
    && state != null
    && Array.isArray(state)
  ) {  // $FlowFixMe
    return tToUse.state;
  }
  throw new Error(`FigureOne could not parse transform: '${JSON.stringify(inTransform)}'`);
}

function parseTransform(
  inTransform: TypeParsableTransform,
): Transform {
  if (inTransform instanceof Transform) {
    return inTransform;
  }
  if (inTransform == null) {
    throw new Error(`FigureOne could not parse transform with no input: '${JSON.stringify(inTransform)}'`);
  }
  const def = parseTransformDef(inTransform);  // $FlowFixMe
  return new Transform(def);
}

function getMatrix(matrixOrTransform: TypeParsableTransform | Type3DMatrix): Type3DMatrix {
  if (Array.isArray(matrixOrTransform) && matrixOrTransform.length === 16 && typeof matrixOrTransform[0] === 'number') {  // $FlowFixMe
    return matrixOrTransform;
  } // $FlowFixMe
  return parseTransform(matrixOrTransform).matrix();
}

/**
 * Convert a parsable transform definition to a Transform.
 * @param {TypeParsableTransform} t
 * @return {Transform}
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
    } else if (type[0] === 'c') {
      let value = 0; // $FlowFixMe
      if (transformValue.custom != null) {
        value = transformValue.custom;
      } // $FlowFixMe
      def.push(value);
    }
  }

  return def;
}

function parseDirectionVector(
  vector: TypeParsablePoint | TypeTransformDirection,
) {
  let v;
  if (!Array.isArray(vector)) {
    v = getPoint(vector);
  } else if (typeof vector[0] === 'string') { // $FlowFixMe
    v = getPoint(vector.slice(1));
  } else { // $FlowFixMe
    v = getPoint(vector);
  }
  return v;
}

function directionToAxisAngle(
  direction: TypeParsablePoint | TypeTransformDirection,
  axisIfCollinear: TypeParsablePoint = [0, 0, 1],
) {
  const d = parseDirectionVector(direction);
  const [axis, angle] = m3.directionToAxisAngle(
    d.toArray(),
    getPoint(axisIfCollinear).toArray(),
  );
  return {
    axis: getPoint(axis),
    angle,
  };
}

/**
 * Calculate the rotation axis and angle required to move from one
 * vector to another.
 *
 * @param {TypeParsablePoint} fromVector
 * @param {TypeParsablePoint} toVector
 * @param {TypeParsablePoint | null} axisIfCollinear
 * @return {{axis: Point, angle: number}}
 */
function angleFromVectors(
  fromVector: TypeParsablePoint | TypeTransformDirection,
  toVector: TypeParsablePoint | TypeTransformDirection,
  axisIfCollinear: TypeParsablePoint | null = null,
) {
  const from = parseDirectionVector(fromVector);
  const to = parseDirectionVector(toVector);

  const [axis, angle] = m3.vectorToVectorToAxisAngle(
    from.toArray(),
    to.toArray(),
    axisIfCollinear == null ? null : getPoint(axisIfCollinear).toArray(),
  );
  return {
    axis: getPoint(axis),
    angle,
  };
}

export {
  getTransform,
  Transform,
  isParsableTransform,
  transformValueToArray,
  getMatrix,
  // parseRotation,
  angleFromVectors,
  directionToAxisAngle,
};

