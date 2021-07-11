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

/**
 * Orthonormal basis definition. Use either (i, j, k), (x, y, z) or
 * (right, top, normal). They are identical, but different terminology may
 * be useful for different contexts.
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
 * Type of rotations possible
 */
export type TypeRotationComponentName = '2D' | 'xyz' | 'axis' | 'dir' | 'rbasis';

/**
 * Rotation definition.
 *
 * FigureOne allows several ways to define a rotation.
 *
 * 1) 2D rotation in XY plane:
 *
 * `number | ['2D', number]`
 *
 * 2) Rotation around x, y, and z axes:
 *
 * `['xyz', number, number, number] | ['xyz', `{@link TypeParsablePoint}`]`
 *
 * 3) Rotation around an axis:
 *
 * `['axis', number, number, number, number] | ['xyz', `{@link TypeParsablePoint}`, number]`
 *
 * The first three numbers, are the axis vector and the
 * last is the rotation (+ve rotation follows the right hand rule around the
 * axis vector)
 *
 * 4) Change of basis rotation - same as a change of basis, but the
 * lengths of the base vectors will be normalized to 1. Change of basis is
 * relative to the standard basis: i: (1, 0, 0), j: (0, 1, 0), k: (0, 0, 1).
 *
 * `['rbasis', ` {@link TypeBasisObjectDefinition} `] | ['rbasis', number,
 * number, number, number, number, number, number, number, number]`
 *
 * Note, when defining with ${@link TypeBasisObjectDefinition}, only two basis
 * vectors need definition - the third can be calculated auatomatically. When
 * using the `number` definition, all basis vectors need to be defined. The
 * basis vectors will be automatically normalized.
 *
 * 5) Vector direction relative to [1, 0, 0]
 *
 * `['dir', `{@link TypeParsablePoint}`] | ['dir', number, number, number]`
 *
 * This is equivalent to an axis rotation where the axis is the normal
 * to the plane where [1, 0, 0] and `dir` form, and the rotation value
 * is that needed to move [1, 0, 0] to `dir`.
 *
 * In a transform, the different rotations are stored in a more compact form:
 * - '2D': 'r'
 * - 'xyz': 'rc'
 * - 'axis': 'ra'
 * - 'rbasis': 'rb'
 * - 'dir': 'rd'
 *
 * All rotation definitions can use either the compact form or the more
 * more descriptive form.
 */
export type TypeUserRotationDefinition = number
  | ['r', number]
  | ['2D', number]
  | ['xyz', TypeParsablePoint]
  | ['xyz', number, number, number]
  | ['rc', TypeParsablePoint]
  | ['rc', number, number, number]
  | ['axis', TypeParsablePoint, number]
  | ['axis', number, number, number, number]
  | ['ra', TypeParsablePoint, number]
  | ['ra', number, number, number, number]
  | ['dir', TypeParsablePoint]
  | ['dir', number, number, number]
  | ['rd', TypeParsablePoint]
  | ['rd', number, number, number]
  | ['rbasis', TypeBasisObjectDefinition]
  | ['rbasis', number, number, number, number, number, number, number, number, number]
  | ['rb', TypeBasisObjectDefinition]
  | ['rb', number, number, number, number, number, number, number, number, number];

/**
 * Translation Definition
 *
 * If two dimensional, then a translation definition will automatically
 * populate `z = 0`.
 *
 * `['t', number, number] | ['t', number, number, number] | ['t', `{@link TypeParsablePoint}` ]`
 */
export type TypeUserTranslationDefinition = ['t', number, number]
  | ['t', number, number, number] | ['t', TypeParsablePoint];

/**
 * Scale Definition
 *
 * A single number will scale (x, y, z) by the same value.
 *
 * A two dimensional scale will scale (x, y, 1).
 *
 * If two dimensional, then a translation definition will automatically
 * populate `z = 0`.
 *
 * `['s', number]
 *  | ['s', number, number]
 *  | ['s', number, number, number]
 *  | ['s', `{@link TypeParsablePoint}`]`
 */
export type TypeUserScaleDefinition = ['s', number]
  | ['s', number, number]
  | ['s', number, number, number]
  | ['s', TypeParsablePoint];

/**
 * Custom Transform Definition
 *
 * A custom 3D matrix using homogonous coordinates (16 elements).
 *
 * `['c', number, number, number, number, number, number, number, number,
 * number, number, number, number, number, number, number, number]`
 */
export type TypeUserCustomDefinition = ['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

/**
 * Change of Basis Definition
 *
 * Change of basis can either be relative to the standard basis
 * i: (1, 0, 0), j: (0, 1, 0), k: (0, 0, 1), or a custom initial basis.
 *
 * A basis can be defined with either the definitino object
 * {@link TypeBasisObjectDefinition} where only two vectors need to be defined
 * (the third will be automatically calculated), or with 9 numbers where all
 * three vectors need to be defined in (ix, iy, iz, jx, jy, jz, kx, ky, kz)
 * order.
 *
 * Relative to standard basis:
 *
 * `['basis', `{@link TypeBasisObjectDefinition}`]
 * | ['basis', number, number, number, number, number, number, number, number, number]`
 * A custom 3D matrix using homogonous coordinates (16 elements).
 *
 * Relative to a custom initial basis (where the first basis is the *from*
 * basis, and the second is the *to* basis):
 *
 * `['basis', `{@link TypeBasisObjectDefinition}`, `{@link TypeBasisObjectDefinition}`]
 * | ['basis', number, number, number, number, number, number, number, number,
 * number, number, number, number, number, number, number, number, number,
 * number]`
 *
 * Note, that 'basis' is stored in a more compact form 'b' in the transform
 * definition, and so 'b' can also be used instead of 'basis' if desired.
 */
export type TypeUserBasisDefinition = ['basis', TypeBasisObjectDefinition]
  | ['basis', TypeBasisObjectDefinition, TypeBasisObjectDefinition]
  | ['b', TypeBasisObjectDefinition]
  | ['b', TypeBasisObjectDefinition, TypeBasisObjectDefinition]
  | ['b', number, number, number, number, number, number, number, number, number]
  | ['basis', number, number, number, number, number, number, number, number, number]
  | ['b', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]
  | ['basis', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

/**
 * Transform internal definition component identifiers
 */
export type TypeTransformComponentType = 't' | 'c' | 's' | 'r' | 'ra' | 'rd' | 'rc' | 'rb';

/**
 * Transform internal definition components
 */
export type TypeScaleTransformComponent = ['s', number, number, number];
export type TypeTranslateTransformComponent = ['t', number, number, number];
export type TypeRotateTransformComponent = ['r', number];
export type TypeRotateCartesianTransformComponent = ['rc', number, number, number];
export type TypeRotateAxisTransformComponent = ['ra', number, number, number, number];
export type TypeRotateDirectionTransformComponent = ['rd', number, number, number];
export type TypeRotationBasisTransformComponent = ['rb', number, number, number, number, number, number, number, number, number]
export type TypeCustomTransformComponent = ['c', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export type TypeTransformBasisComponent = ['b', number, number, number, number, number, number, number, number, number];
export type TypeTransformBasisToBasisComponent = ['b', number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

export type TypeTransformComponent = TypeScaleTransformComponent
  | TypeTranslateTransformComponent
  | TypeRotateTransformComponent
  | TypeRotateAxisTransformComponent
  | TypeRotateCartesianTransformComponent
  | TypeRotateDirectionTransformComponent
  | TypeRotationBasisTransformComponent
  | TypeCustomTransformComponent
  | TypeTransformBasisComponent
  | TypeTransformBasisToBasisComponent;

/**
 * A parsable array transform definition is an array of any number of
 * transform components.
 *
 * {@link Transform} automatically cascades transform components in reverse
 * order. Thus if an array definition has a rotation, then translation, then the
 * resulting transform matrix will transform a point in this same order.
 *
 * `Array<`{@link TypeParsableArrayTransform} | {@link TypeUserRotationDefinition}
 * | {@link TypeUserTranslationDefinition}
 * | {@link TypeUserTranslationDefinition}
 * | {@link TypeUserScaleDefinition}
 * | {@link TypeUserBasisDefinition}
 * | {@link TypeUserCustomDefinition}`>`
 */
export type TypeParsableArrayTransform = Array<TypeUserRotationDefinition
  | TypeUserTranslationDefinition
  | TypeUserScaleDefinition
  | TypeUserBasisDefinition
  | TypeUserCustomDefinition>

/**
 * A parsable transform definition can be either an array of transform
 * components, or just a single component.
 *
 * {@link TypeParsableArrayTransform} | {@link TypeUserRotationDefinition}
 * | {@link TypeUserTranslationDefinition}
 * | {@link TypeUserTranslationDefinition}
 * | {@link TypeUserScaleDefinition}
 * | {@link TypeUserBasisDefinition}
 * | {@link TypeUserCustomDefinition}
 */
export type TypeParsableTransform = TypeParsableArrayTransform
  | TypeUserRotationDefinition
  | TypeUserTranslationDefinition
  | TypeUserScaleDefinition
  | TypeUserBasisDefinition
  | TypeUserCustomDefinition;

export type TypeTransformDefinition = Array<TypeTransformComponent>;
// export type TransformDefinition = Array<TransformComponent>;

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

// Parse a basis definition - either a user definition or a internal transform
// definition
function parseBasisDefinition(def: TypeTransformBasisToBasisComponent) {
  const [type] = def;
  if (def.length === 2) {
    return [type, ...parseBasisObject(def[1])];
  }
  if (def.length === 3) {
    return [type, ...parseBasisObject(def[1]), ...parseBasisObject(def[2])];
  }
  if (def.length === 10 || def.length === 19) {
    return def;
  }
  throw new Error(`Could not parse transform basis definition: ${JSON.stringify(def)}`);
}

function parseRotation(
  typeOr2DOrDef: number | TypeRotationComponentName | TypeRotationDefinition,
  r1: number | TypeParsablePoint | TypeBasisObjectDefinition | null = null,
  r2: number | null = null,
  r3: number | null = null,
  r4: number | null = null,
  r5: number | null = null,
  r6: number | null = null,
  r7: number | null = null,
  r8: number | null = null,
  r9: number | null = null,
) {
  if (typeof typeOr2DOrDef === 'number') {
    return ['r', typeOr2DOrDef];
  }
  if (Array.isArray(typeOr2DOrDef)) {
    return parseRotation(...typeOr2DOrDef);
  }
  const type = typeOr2DOrDef;
  if ((type === '2D' || type === 'r') && typeof r1 === 'number') {
    return ['r', r1];
  }
  if (typeof r1 === 'number') {
    if (typeof r2 === 'number') {
      // if (type === 'sph' || type === 'rs') {
      //   return ['rs', r1, r2];
      // }
      if (typeof r3 === 'number') {
        if (type === 'xyz' || type === 'rc') {
          return ['rc', r1, r2, r3];
        }
        if (type === 'dir' || type === 'rd') {
          return ['rd', r1, r2, r3];
        }
        if (typeof r4 === 'number' && (type === 'axis' || type === 'ra')) {
          return ['ra', r1, r2, r3, r4];
        }
        if (
          (type === 'rb' || type === 'rbasis' || type === 'basis' || type === 'b')
          && typeof r9 === 'number'
        ) {
          return [type, r1, r2, r3, r4, r5, r6, r7, r8, r9];
        }
      }
    }
  } else if (type === 'xyz' || type === 'rc') {
    return ['rc', ...getPoint(r1).toArray()];
  } else if (type === 'dir' || type === 'rd') {
    return ['rd', ...getPoint(r1).toArray()];
  } else if ((type === 'axis' || type === 'ra') && typeof r2 === 'number') {
    return ['ra', ...getPoint(r1).toArray(), r2];
  } else if (type === 'rbasis' || type === 'rb') {
    return ['rb', ...(parseBasisDefinition(['rb', r1], true).slice(1))];
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
  constructor(defOrName: TypeParsableTransform | string = '', name: string = '') {
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
    xOrTranslation: number | TypeParsablePoint = 0,
    y: number = 0,
    z: number = 0,
    // name: string = this.name,
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
   * Add a rotation transformation component to the transform.
   */
  rotate(
    typeOr2DRotation: number | '2D' | 'xyz' | 'axis' | 'dir' | 'basis',
    r1: number | TypeParsablePoint | TypeBasisObjectDefinition | null = null,
    r2: number | null = null,
    r3: number | null = null,
    r4: number | null = null,
  ) {
    const def = parseRotation(typeOr2DRotation, r1, r2, r3, r4);

    return this.addComponent(def);
  }

  /**
   * Add a change of basis transformation component to the transform.
   *
   * If `toBasis` is null, then the change of basis is from the standard
   * basis to `fromOrToBasis`.
   *
   * Otherwise, the change of basis is from `fromOrToBasis` to `toBasis`.
   */
  basis(
    fromOrToBasis: TypeBasisObjectDefinition,
    toBasis: null | TypeBasisObjectDefinition = null,
  ) {
    const basis = parseBasisObject(fromOrToBasis);
    if (toBasis === null) {
      return this.addComponent(['b', ...basis]);
    }
    const to = parseBasisObject(toBasis);
    return this.addComponent(['b', ...basis, ...to]);
  }

  /**
   * Add a custom transformation component to the transform.
   */
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
    sOrSxOrPoint: number | TypeParsablePoint,
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
      [_sx, _sy, _sz] = getScale(sOrSxOrPoint).toArray();
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
      } else if (type === 'r' && x !== 0) {
        // m = m3.mul(m, m3.rotationMatrixXYZ(0, 0, x));
        m = m3.mul(m, m3.rotationMatrixZ(x));
      } else if (type === 'rc' && (x !== 0 || y !== 0 || z !== 0)) {
        m = m3.mul(m, m3.rotationMatrixXYZ(x, y, z));
      } else if (type === 'rd' && (x !== 1 || y !== 0 || z !== 0)) {
        m = m3.mul(m, m3.rotationMatrixDirection([x, y, z]));
      // } else if (type === 'rs' && (x !== 0 || y !== 0)) {
      //   m = m3.mul(m, m3.rotationMatrixSpherical(x, y));
      } else if (type === 'ra' && this.def[i][4] !== 0) {
        m = m3.mul(m, m3.rotationMatrixAxis([x, y, z], this.def[i][4]));
      } else if (type === 'rb') {
        m = m3.mul(m, m3.basisMatrix(
          this.def[i].slice(1, 4),
          this.def[i].slice(4, 7),
          this.def[i].slice(7),
        ));
      } else if (type === 'c') {  // $FlowFixMe
        m = m3.mul(m, this.def[i].slice(1));
      } else if (type === 'b' && this.def[i].length === 10) {
        m = m3.mul(m, m3.basisMatrix(
          this.def[i].slice(1, 4),
          this.def[i].slice(4, 7),
          this.def[i].slice(7),
        ));
      } else if (type === 'b' && this.def[i].length === 19) {
        m = m3.mul(m, m3.basisToBasisMatrix(
          [
            this.def[i].slice(1, 4),
            this.def[i].slice(4, 7),
            this.def[i].slice(7, 10),
          ],
          [
            this.def[i].slice(10, 13),
            this.def[i].slice(13, 16),
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
        } // else if (type === 'rs') {
        //   this.def[i] = [
        //     'r',
        //     clipAngle(component[1], clipTo),
        //     clipAngle(component[2], clipTo),
        //   ];
        // }
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
        && stepStart[0] !== 'rb'
        && stepStart.length === stepDelta.length
      ) {
        // $FlowFixMe
        out.def[i] = [
          stepStart[0],
          ...stepDelta.slice(1).map((d, j) => d * percent + stepStart[j + 1]),
        ];
      } else if (stepStart[0] === 'rb' && stepDelta[0] === 'rb') {
        const iStart = getPoint(stepStart.slice(1, 4));
        const jStart = getPoint(stepStart.slice(4, 7));
        const kStart = getPoint(stepStart.slice(7, 10));
        const iDelta = getPoint(stepDelta.slice(1, 4));
        const jDelta = getPoint(stepDelta.slice(4, 7));
        const kDelta = getPoint(stepDelta.slice(7, 10));

        const iBasis = iStart.add(iDelta.scale(percent)).normalize().toArray();
        const jBasis = jStart.add(jDelta.scale(percent)).normalize().toArray();
        const kBasis = kStart.add(kDelta.scale(percent)).normalize().toArray();
        out.def[i] = ['rb', ...iBasis, ...jBasis, ...kBasis];
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
    // if (type === 'rs') {
    //   return [r[1], r[2]];
    // }
    if (type === 'rc' || type === 'rd') {
      return new Point(r[1], r[2], r[3]);
    }
    if (type === 'rb') {
      return [
        new Point(r[1], r[2], r[3]),
        new Point(r[4], r[5], r[6]),
        new Point(r[7], r[8], r[9]),
      ];
    }
    // ra
    return [new Point(r[1], r[2], r[3]), r[4]];
  }

  rType(rotationIndex: number = 0) {
    const i = this.getComponentIndex('r', rotationIndex);
    const types = {
      r: '2D',
      ra: 'axis',
      rc: 'xyz',
      rd: 'dir',
      rs: 'sph',
      rb: 'basis',
    };
    return types[this.def[i][0]];
  }

  rDef(rotationIndex: number = 0) {
    const i = this.getComponentIndex('r', rotationIndex);
    const r = this.def[i];
    // const [type] = r;
    return r;
    // if (type === 'r') {
    //   return [r[1]];
    // }
    // if (type === 'rs') {
    //   return [r[1], r[2]];
    // }
    // if (type === 'rc' || type === 'rd') {
    //   return [r[1], r[2], r[3]];
    // }
    // return [r[1], r[2], r[3], r[4]];
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
      // } else if (type === 'rs') {
      //   if (
      //     clipAngle(x, '0to360') > zeroThreshold
      //     || clipAngle(y, '0to360') > zeroThreshold
      //   ) {
      //     return false;
      //   }
      } else if (type === 'ra') {
        if (
          Math.abs(x) > zeroThreshold
          || Math.abs(y) > zeroThreshold
          || Math.abs(z) > zeroThreshold
          || clipAngle(a, '0to360') > zeroThreshold
        ) {
          return false;
        }
      } else if (type === 'rb') {
        const [, ix, iy, iz, jx, jy, jz, kx, ky, kz] = this.def[i];
        if (
          ix !== 1 || iy !== 0 || iz !== 0
          || jx !== 0 || jy !== 1 || jz !== 1
          || kx !== 0 || ky !== 0 || kz !== 1
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
    // t.index = this.index;  // $FlowFixMe
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
      // } else if (type === 'rs') { // $FlowFixMe
      //   def.push([type, 0, 0]);
      } else if (type === 'rc') { // $FlowFixMe
        def.push([type, 0, 0, 0]);
      } else if (type === 'rd') { // $FlowFixMe
        def.push([type, 1, 0, 0]);
      } else if (type === 'ra') { // $FlowFixMe
        def.push([type, 1, 0, 0, 0]);
      } else if (type === 'rb') {
        def.push([
          'rb',
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
      } else if (type === 'b' && this.def[i].length === 10) {
        def.push(['b', 1, 0, 0, 0, 1, 0, 0, 0, 1]);
      } else if (type === 'b' && this.def[i].length === 19) {
        def.push(['b', 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
      }
    }  // $FlowFixMe
    return new Transform(def, this.name);
  }
}

export type TypeF1DefTransform = {
  f1Type: 'tf',
  state: TransformDefinition,
};

// /**
//  * A {@link Transform} can be defined in several ways
//  * As a Transform: new Transform()
//  * As an array of ['s', number, number], ['r', number] and/or ['t', number, number] arrays
//  * As a string representing the JSON of the array form
//  }
//  * @example
//  * // t1, t2, and t3 are all the same when parsed by `getTransform`
//  * t1 = new Transform().scale(1, 1).rotate(0).translate(2, 2);
//  * t2 = [['s', 1, 1], ['r', 0], ['t', 2, 2]];
//  * t3 = '[['s', 1, 1], ['r', 0], ['t', 2, 2]]';
//  */
// export type TypeParsableTransform = Array<string | ['s', number, number] | ['r', number] | ['t', number, number]> | string | Transform | TypeF1DefTransform;

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
      || value[0][0] === 'ra'
      || value[0][0] === 'rc'
      || value[0][0] === 'rd'
      // || value[0][0] === 'rs'
      || value[0][0] === 'rb'
      || value[0][0] === 'axis'
      // || value[0][0] === 'sph'
      || value[0][0] === '2D'
      || value[0][0] === 'xyz'
      || value[0][0] === 'dir'
      || value[0][0] === 'basis'
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

function parseArrayTransformDefinition(definition: TransformDefinition) {
  const def = [];
  if (definition.length === 0) {
    return { name: '', def };
  }
  let defIn;
  if (Array.isArray(definition[0])) {
    defIn = definition;
  } else {
    defIn = [definition];
  }

  let name = '';
  for (let i = 0; i < defIn.length; i += 1) {
    // if (typeof defIn[i] === 'string') {
    //   name = defIn[i];  // eslint-disable-next-line no-continue
    //   continue;
    // } // $FlowFixMe
    const [type, x, y] = defIn[i];
    const len = defIn[i].length;
    if (type === 'c') {
      def.push(defIn[i]);
    } else if (type === 'name') {
      [, name] = defIn[i];
    } else if (type === 't') {
      if (len === 4) {
        def.push(defIn[i]);
      } else if (len === 3) {
        def.push(['t', x, y, 0]);
      }
    } else if (type === 's') {
      if (len === 2) {
        def.push(['s', x, x, x]);
      } else if (len === 3) {
        def.push(['s', x, y, 1]);
      } else if (len === 4) {
        def.push(defIn[i]);
      }
    } else if (type === 'rb' || type === 'rbasis') {
      def.push(['rb', ...(parseBasisDefinition(defIn[i]).slice(1))]);
    } else if (type === 'b' || type === 'basis') {
      def.push(['b', ...(parseBasisDefinition(defIn[i]).slice(1))]);
    } else if (type.startsWith('r') || type === 'axis' || type === 'xyz' || type === '2D' || type === 'dir') {
      def.push(parseRotation(defIn[i]));
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

function getMatrix(matrixOrTransform: TypeParsableTransfrom | Type3DMatrix) {
  if (Array.isArray(matrixOrTransform) && matrixOrTransform.length === 16 && typeof matrixOrTransform[0] === 'number') {
    return matrixOrTransform;
  }
  return parseTransform(matrixOrTransform).matrix();
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

function parseDirectionVector(
  vector: TypeParsablePoint | ['dir', TypeParsablePoint]
    | ['dir', number, number, number]
    | ['rd', TypeParsablePoint]
    | ['rd', number, number, number],
) {
  let v;
  if (!Array.isArray(vector)) {
    v = getPoint(vector);
  } else if (typeof vector[0] === 'string') {
    v = getPoint(parseRotation(vector).slice(1));
  } else {
    v = getPoint(vector);
  }
  return v;
}

function directionToAxisAngle(
  direction: TypeParsablePoint | ['dir', TypeParsablePoint]
  | ['dir', number, number, number]
  | ['rd', TypeParsablePoint]
  | ['rd', number, number, number],
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

function vectorToVectorToAxisAngle(
  fromVector: TypeParsablePoint | ['dir', TypeParsablePoint]
  | ['dir', number, number, number]
  | ['rd', TypeParsablePoint]
  | ['rd', number, number, number],
  toVector: TypeParsablePoint | ['dir', TypeParsablePoint]
  | ['dir', number, number, number]
  | ['rd', TypeParsablePoint]
  | ['rd', number, number, number],
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
  parseRotation,
  vectorToVectorToAxisAngle,
  directionToAxisAngle,
};

