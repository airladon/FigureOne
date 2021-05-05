// @flow

import {
  joinObjects,
} from '../../tools/tools';


function getState(
  obj: Object,
  stateProperties: Array<string>,
  optionsIn: {
    precision?: number,
    ignoreShown?: boolean,
    min?: boolean,
  },
) {
  const defaultOptions = {
    precision: 5,
    ignoreShown: false,
    min: false,
  };
  const options = joinObjects({}, defaultOptions, optionsIn);
  const { precision } = options;
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
    if (typeof value === 'function') {
      return undefined;
    }
    if (value == null) {
      return value;
    }
    if (value._def != null) {
      return value._def(precision);
    }
    if (value._state != null) {
      return value._state(options);
    }
    if (Array.isArray(value)) {
      const dupArray = [];
      value.forEach((v) => {
        dupArray.push(processValue(v));
      });
      return dupArray;
    }
    if (value._dup != null) {
      return value._dup();
    }
    const out = {};
    let keys = Object.keys(value);
    if (value._stateKeys) {
      keys = value._stateKeys();
    }
    let keysToUse = keys;
    if (value._excludeStateKeys) {
      keysToUse = [];
      const excludedKeys = value._excludeStateKeys();
      keys.forEach((key) => {
        if (excludedKeys.indexOf(key) === -1) {
          keysToUse.push(key);
        }
      });
    }
    keysToUse.forEach((key) => {
      if (typeof value[key] !== 'function') {
        out[key] = processValue(value[key]);
      }
    });
    return out;
    // return joinObjects({}, value);
  };
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

function setState(obj: Object, stateIn: Object) {
  joinObjects(obj, stateIn);
}

export { setState, getState };
