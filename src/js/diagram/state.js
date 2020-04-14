// @flow
import {
  getPoint, getTransform, getRect, getLine, Translation, Rotation, Scale,
} from '../tools/g2';

import {
  joinObjects,
} from '../tools/tools';

function getState(
  obj: Object,
  stateProperties: Array<string>,
  precision: number = 5,
) {
  // const stateProperties = this._getStateProperties();
  // const path = this.getPath();
  const state = {};
  const processValue = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (value == null) {
      return value;
    }
    if (value._def != null) {
      return value._def(precision);
    }
    if (Array.isArray(value)) {
      const dupArray = [];
      value.forEach((v) => {
        dupArray.push(processValue(v));
      });
      return dupArray;
    }
    if (value._getState != null) {
      return value._getState();
    }
    if (value._dup != null) {
      return value._dup();
    }
    const out = {};
    Object.keys(value).forEach((key) => {
      out[key] = processValue(value[key]);
    });
    return out;
    // return joinObjects({}, value);
  };

  stateProperties.forEach((prop) => {
    state[prop] = processValue(obj[prop]);
  });
  return state;
}

function getDef(def: any) {
  if (typeof def === 'number') {
    return def;
  }
  if (typeof def === 'string') {
    return def;
  }
  if (typeof def === 'boolean') {
    return def;
  }
  if (def == null) {
    return def;
  }

  if (Array.isArray(def)) {
    const out = [];
    def.forEach((defElement) => {
      out.push(getDef(defElement));
    });
    return out;
  }
  if (def.f1Type != null) {
    if (def.f1Type === 'rect') {
      return getRect(def);
    }
    if (def.f1Type === 'p') {
      return getPoint(def);
    }
    if (def.f1Type === 'tf') {
      return getTransform(def);
    }
    if (def.f1Type === 't') {
      return new Translation(def);
    }
    if (def.f1Type === 's') {
      return new Scale(def);
    }
    if (def.f1Type === 'r') {
      return new Rotation(def);
    }
    if (def.f1Type === 'l') {
      return getLine(def);
    }
  }
  const out = {};
  Object.keys(def).forEach((property) => {
    out[property] = getDef(def[property]);
  });
  return out;
}

function setState(obj: Object, stateIn: Object) {
  joinObjects(obj, getDef(stateIn));
  // const state = getDef(stateIn);

  // Object.keys(state).forEach((prop) => {
  //   const value = state[prop];
  //   if (
  //     typeof value === 'string'
  //     || typeof value === 'number'
  //     || typeof value === 'boolean'
  //     || value === null) {
  //   ) {
  //     obj[prop] = value;
  //   }
  //   if (Array.isArray(value) && Array.isArray) {
  //     for (let i = 0; i < value.length; i += 1)
  //   }
  //   if (obj[prop] != null && obj[prop]._setState != null) {
  //     obj[prop]._setState(getDef(state[prop]));
  //   } else {
  //     setState(obj[prop], def())
  //   }
  // });
}

// function setState(obj: Object, state: Object) {
//   const processValue = (value) => {
//     if (
//       typeof value === 'number'
//       || typeof value === 'string'
//       || typeof value === 'boolean'
//       || value == null
//     ) {
//       return value;
//     }
//     if (Array.isArray(value)) {
//       const out = [];
//       value.forEach((v) => {
//         out.push(processValue);
//       });
//       return out;
//     }
//     if (value._setState)
//   };

//   Object.keys(state).forEach((prop) => {
//     const value = state[prop];
//     if (
//       typeof value === 'number'
//       || typeof value === 'string'
//       || typeof value === 'boolean'
//       || value == null
//     ) {
//       obj[prop] = value; // eslint-disable-line no-param-reassign
//       return;
//     }
//     if (Array.isArray(value)) {
//       for (let i = 0; i < obj[prop].length; i += 1) {
//         // eslint-disable-next-line no-param-reassign
//         obj[prop][i] = setState(obj[prop][i], value);
//       }
//       return;
//     }
//     if (obj[prop]._setState != null) {
//       obj[prop]._setState(value);
//       return;
//     }
//     obj[prop] = setState(obj[prop], value); // eslint-disable-line no-param-reassign
//   });
// }

export { setState, getState, getDef };
