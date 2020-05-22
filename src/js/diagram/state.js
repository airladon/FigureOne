// @flow
// import {
//   PositionAnimationStep, AnimationBuilder,
// } from './Animation/Animation';

// import type Diagram from './Diagram';

// import {
//   getPoint, getTransform, getRect, getLine, Translation, Rotation, Scale,
// } from '../tools/g2';
// import parseState from './parseState';

import {
  joinObjects,
} from '../tools/tools';

// import parseState from './parseState';


function getState(
  obj: Object,
  stateProperties: Array<string>,
  precision: number = 5,
  payload: any,
) {
  // const stateProperties = this._getStateProperties();
  // const path = this.getPath();
  const state: Object = {};
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
    if (value._state != null) {
      return value._state(precision, payload);
    }
    if (Array.isArray(value)) {
      const dupArray = [];
      value.forEach((v) => {
        // console.log('array v', v);
        dupArray.push(processValue(v));
      });
      return dupArray;
    }
    // if (value._getState != null) {
    //   console.log('v', value)
    //   return value._getState();
    // }
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
  // console.log(stateProperties)
  stateProperties.forEach((prop) => {
    const processPath = (currentState, currentObj, remainingPath) => {
      const [nextLevel] = remainingPath;
      if (remainingPath.length === 1) {
        return [currentState, currentObj, remainingPath[0]];
      }
      if (currentState[nextLevel] == null) {
        currentState[nextLevel] = {}; // eslint-disable-line no-param-reassign
      }
      if (currentObj[nextLevel] == null) {
        return null;
      }
      return processPath(currentState[nextLevel], currentObj[nextLevel], remainingPath.slice(1));
    };
    const result = processPath(state, obj, prop.split('.'));
    if (result == null) {
      return;
    }
    const [statePath, objPath, remainingProp] = result;
    statePath[remainingProp] = processValue(objPath[remainingProp]);
  });
  return state;
}

// function parseState(state: Object, diagram: Diagram) {
//   if (typeof state === 'number') {
//     return state;
//   }
//   if (typeof state === 'string') {
//     return state;
//   }
//   if (typeof state === 'boolean') {
//     return state;
//   }
//   if (state == null) {
//     return state;
//   }

//   if (Array.isArray(state)) {
//     const out = [];
//     state.forEach((stateElement) => {
//       out.push(parseState(stateElement, diagram));
//     });
//     return out;
//   }
//   if (state.f1Type != null) {
//     if (state.f1Type === 'rect') {
//       return getRect(state);
//     }
//     if (state.f1Type === 'p') {
//       return getPoint(state);
//     }
//     if (state.f1Type === 'tf') {
//       return getTransform(state);
//     }
//     if (state.f1Type === 't') {
//       return new Translation(state);
//     }
//     if (state.f1Type === 's') {
//       return new Scale(state);
//     }
//     if (state.f1Type === 'r') {
//       return new Rotation(state);
//     }
//     if (state.f1Type === 'l') {
//       return getLine(state);
//     }
//     if (state.f1Type === 'de') {
//       return diagram.getElement(state.state);
//     }
//     if (state.f1Type === 'positionAnimationStep') {
//       return new PositionAnimationStep()._fromState(
//         parseState(state.state, diagram),
//         diagram.getElement.bind(diagram),
//       );
//     }
//     if (state.f1Type === 'animationBuilder') {
//       return new AnimationBuilder()._fromState(
//         parseState(state.state, diagram),
//         diagram.getElement.bind(diagram),
//       );
//     }
//   }
//   const out = {};
//   Object.keys(state).forEach((property) => {
//     out[property] = parseState(state[property], diagram);
//   });
//   return out;
// }

// function assignStateToObject(
//   state: Object,
//   obj: Object,
//   exceptIn: Array<string> | string = [],
//   parentPath: string = '',
//   diagram: Diagram,
// ) {
//   const except = typeof exceptIn === 'string' ? [exceptIn] : exceptIn;
//   Object.keys(state).forEach((key) => {
//     const keyPath = parentPath !== '' ? `${parentPath}.${key}` : key;
//     if (except.indexOf(keyPath) !== -1) {
//       return;
//     }
//     const value = state[key];
//     if (typeof value === 'number'
//       || typeof value === 'boolean'
//       || typeof value === 'string'
//       || value == null
//       || typeof value === 'function'
//       || Array.isArray(value)
//     ) {
//       // Only assign the value if:
//       //    * Value is not undefined OR
//       //    * Value is undefined and toObject[key] is undefined
//       if (value !== undefined || obj[key] === undefined) {
//         obj[key] = value;
//       }
//       return;
//     }
//     if (value.f1Type != null) {
//       obj[key] = parseState(value, diagram);
//       return;
//     }
//     // If the fromObject[key] value is an object, but the toObject[key] value
//     // is not an object, but then make toObject[key] an empty object
//     const toValue = obj[key];
//     if (typeof toValue === 'number'
//       || typeof toValue === 'boolean'
//       || typeof toValue === 'string'
//       || toValue == null
//       || typeof toValue === 'function'
//       || Array.isArray(toValue)
//     ) {
//       // eslint-disable-next-line no-param-reassign
//       obj[key] = {};
//     }
//     assignStateToObject(value, obj[key], except, keyPath, diagram);
//   });
// }
function setState(obj: Object, stateIn: Object) {
  joinObjects(obj, stateIn);
  // assignStateToObject(stateIn, obj, [], '', diagram);
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

export { setState, getState };
