// @flow
import { roundNum } from './math';

const Console = (text: string) => {
  console.log(text); // eslint-disable-line no-console
};

function add(a: number, b: number): number {
  return a + b;
}

function mulToString(a: number, b: number): string {
  return (a * b).toString();
}

const divide = (a: number, b: number): number => a / b;

const classify = (key: string, value: string) => {
  const nonEmpty = value || key;
  const withKey = nonEmpty[0] === '-' || nonEmpty.startsWith(`${key}-`)
    ? `${key} ${nonEmpty}` : nonEmpty;
  const joinStr = ` ${key}-`;
  return `${withKey.split(' -').join(joinStr)}`;
};


class ObjectKeyPointer {
  object: Object;
  key: string;
  constructor(object: Object, key: string) {
    this.object = object;
    this.key = '';
    if (key in object) {
      this.key = key;
    }
  }

  setValue(value: mixed) {
    if (this.key) {
      this.object[this.key] = value;
    }
  }

  execute(...args: mixed) {
    if (this.key) {
      return this.object[this.key].apply(null, args);
    }
    return undefined;
  }

  value() {
    if (this.key) {
      return this.object[this.key];
    }
    return undefined;
  }
}
//
function extractFrom(
  objectToExtractFrom: Object,
  keyValues: Object | Array<any> | string,
  keyPrefix: string = '',
) {
  const out = [];
  if (typeof keyValues === 'string') {
    if (keyPrefix + keyValues in objectToExtractFrom) {
      return new ObjectKeyPointer(objectToExtractFrom, keyPrefix + keyValues);
    }
    const keyHeirarchy = keyValues.split('_');
    const keys = keyHeirarchy.filter(k => k.length > 0);
    if (keys.length > 1) {
      if (keyPrefix + keys[0] in objectToExtractFrom) {
        return extractFrom(objectToExtractFrom[keyPrefix + keys[0]], keys.slice(1).join('_'), keyPrefix);
      }
    } else if (keys.length === 1) {
      if (keyPrefix + keys[0] in objectToExtractFrom) {
        return new ObjectKeyPointer(objectToExtractFrom, keyPrefix + keys[0]);
      }
    }
    return undefined;
  }

  if (Array.isArray(keyValues)) {
    keyValues.forEach((kv) => {
      const result = extractFrom(objectToExtractFrom, kv, keyPrefix);
      if (result !== undefined) {
        out.push(result);
      }
    });
  } else {
    Object.keys(keyValues).forEach((key) => {
      if (keyPrefix + key in objectToExtractFrom) {
        out.push({
          obj: new ObjectKeyPointer(objectToExtractFrom, keyPrefix + key),
          // $FlowFixMe
          value: keyValues[key],
        });
      }
    });
  }
  return out;
}

function getElement(
  collection: Object,
  keyValues: Object | Array<any> | string,
) {
  return extractFrom(collection, keyValues, '_');
}


function addToObject(
  obj: Object,
  nameToAdd: string,
  valueToAdd: mixed,
  splitStr: string = '-',
) {
  const levels = nameToAdd.split(splitStr);
  let currentLevel: Object = obj;
  levels.forEach((level, index) => {
    if (index === levels.length - 1) {
      currentLevel[level] = valueToAdd;
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(currentLevel, level)) {
      currentLevel[level] = {};
    }
    currentLevel = currentLevel[level];
  });
}

// function duplicateFromTo(
//   fromObject: Object,
//   toObject: Object,
//   exceptKeys: Array<string> = [],
// ) {
//   const copyValue = (value) => {
//     if (typeof value === 'number'
//         || typeof value === 'boolean'
//         || typeof value === 'string'
//         || value == null
//         || typeof value === 'function') {
//       return value;
//     }
//     if (typeof value._dup === 'function') {
//       return value._dup();
//     }
//     if (Array.isArray(value)) {
//       const arrayCopy = [];
//       value.forEach(arrayElement => arrayCopy.push(copyValue(arrayElement)));
//       return arrayCopy;
//     }
//     if (typeof value === 'object') {
//       const objectCopy = {};
//       Object.keys(value).forEach((key) => {
//         const v = copyValue(value[key]);
//         objectCopy[key] = v;
//       });
//       return objectCopy;
//     }
//     return value;
//   };

//   Object.keys(fromObject).forEach((key) => {
//     if (exceptKeys.indexOf(key) === -1) {
//       // eslint-disable-next-line no-param-reassign
//       toObject[key] = copyValue(fromObject[key]);
//     }
//   });
// }

function duplicate(value: ?number | boolean | string | Object) {
  if (typeof value === 'number'
      || typeof value === 'boolean'
      || typeof value === 'string'
      || value == null
      || typeof value === 'function') {
    return value;
  }
  if (typeof value._dup === 'function') {
    return value._dup();
  }
  if (Array.isArray(value)) {
    const arrayDup = [];
    value.forEach(arrayElement => arrayDup.push(duplicate(arrayElement)));
    return arrayDup;
  }
  if (typeof value === 'object') {
    const objectDup = {};
    Object.keys(value).forEach((key) => {
      const v = duplicate(value[key]);
      objectDup[key] = v;
    });
    return objectDup;
  }
  return value;
}

function assignObjectFromTo(
  fromObject: Object,
  toObject: Object,
  exceptIn: Array<string> | string = [],
  duplicateValues: boolean = false,
  parentPath: string = '',
) {
  const except = typeof exceptIn === 'string' ? [exceptIn] : exceptIn;
  Object.keys(fromObject).forEach((key) => {
    const keyPath = parentPath !== '' ? `${parentPath}.${key}` : key;
    if (except.indexOf(keyPath) !== -1) {
      return;
    }
    const value = fromObject[key];
    if (typeof value === 'number'
      || typeof value === 'boolean'
      || typeof value === 'string'
      || value == null
      || typeof value === 'function'
      || typeof value._dup === 'function'
      || Array.isArray(value)
    ) {
      // Only assign the value if:
      //    * Value is not undefined OR
      //    * Value is undefined and toObject[key] is undefined
      if (value !== undefined || toObject[key] === undefined) {
        if (duplicateValues) {     // eslint-disable-next-line no-param-reassign
          toObject[key] = duplicate(value);
        } else {                   // eslint-disable-next-line no-param-reassign
          toObject[key] = value;
        }
      }
    } else {
      // If the fromObject[key] value is an object, but the toObject[key] value
      // is not an object, but then make toObject[key] an empty object
      const toValue = toObject[key];
      if (typeof toValue === 'number'
        || typeof toValue === 'boolean'
        || typeof toValue === 'string'
        || toValue == null
        || typeof toValue === 'function'
        || Array.isArray(toValue)
      ) {
        // eslint-disable-next-line no-param-reassign
        toObject[key] = {};
      }
      assignObjectFromTo(value, toObject[key], except, duplicateValues, keyPath);
    }
  });
}

function joinObjectsWithOptions(options: {
  duplicate?: boolean,
  except?: Array<string> | string,
}, ...objects: Array<Object>): Object {
  let { except } = options;
  let dup = options.duplicate;
  if (except == null) {
    except = [];
  }
  if (dup == null) {
    dup = false;
  }

  const num = objects.length;
  const out = objects[0];
  for (let i = 1; i < num; i += 1) {
    const o = objects[i];
    if (o != null) {
      assignObjectFromTo(o, out, except, dup, '');
    }
  }
  return out;
}

// joins objects like object.assign but goes as many levels deep as the object
// is. Objects later in the arrawy overwrite objects earlier.
function joinObjects(...objects: Array<Object>): Object {
  // if (typeof objects === 'object') {
  //   return objects;
  // }
  // const assignObjectFromTo1 = (fromObject: Object, toObject: Object) => {
  //   Object.keys(fromObject).forEach((key) => {
  //     const value = fromObject[key];
  //     if (typeof value === 'number'
  //       || typeof value === 'boolean'
  //       || typeof value === 'string'
  //       || value == null
  //       || typeof value === 'function'
  //       || typeof value._dup === 'function'
  //       || Array.isArray(value)
  //     ) {
  //       // console.log(value, toObject[key])
  //       if (value !== undefined || toObject[key] === undefined) {
  //         // eslint-disable-next-line no-param-reassign
  //         toObject[key] = value;
  //       }
  //     } else {
  //       const toValue = toObject[key];
  //       if (typeof toValue === 'number'
  //         || typeof toValue === 'boolean'
  //         || typeof toValue === 'string'
  //         || toValue == null
  //         || typeof toValue === 'function'
  //         || Array.isArray(toValue)
  //       ) {
  //         // eslint-disable-next-line no-param-reassign
  //         toObject[key] = {};
  //       }
  //       assignObjectFromTo1(value, toObject[key]);
  //     }
  //   });
  // };

  // const num = objects.length;
  // const out = objects[0];
  // for (let i = 1; i < num; i += 1) {
  //   const o = objects[i];
  //   if (o != null) {
  //     assignObjectFromTo1(o, out);
  //   }
  // }
  // return out;
  return joinObjectsWithOptions({}, ...objects);
}

function duplicateFromTo(
  fromObject: Object,
  toObject: Object,
  exceptKeys: Array<string> = [],
) {
  joinObjectsWithOptions({ except: exceptKeys, duplicate: true }, toObject, fromObject);
}

function generateUniqueId(seed: string = '') {
  const randomString = s => `${s}${Math.floor(Math.random() * 1000000)}`;
  let seedToUse = seed;
  if (seedToUse.length === 0) {
    seedToUse = 'id_random_';
  }
  let idExists = true;
  let newId = randomString(seedToUse);
  while (idExists) {
    newId = randomString(seedToUse);
    const element = document.getElementById(newId);
    if (element == null) {
      idExists = false;
    }
  }
  return newId;
}

function isTouchDevice() {
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  const mq = query => window.matchMedia(query).matches;

  /* eslint-disable no-undef, no-mixed-operators */
  // $FlowFixMe
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }
  /* eslint-enable no-undef, no-mixed-operators */

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

function loadRemote(
  scriptId: string,
  url: string,
  callback: null | (string, string) => void = null,
) {
  const existingScript = document.getElementById(scriptId);
  if (!existingScript) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.id = scriptId; // e.g., googleMaps or stripe
    if (document.body) {
      document.body.appendChild(script);
    }
    script.onload = () => {
      if (callback != null) {
        callback(scriptId, url);
      }
    };
  } else if (callback != null) {
    callback(scriptId, url);
  }
}

function loadRemoteCSS(
  id: string,
  url: string,
  callback: null | (string, string) => void = null,
) {
  const existingScript = document.getElementById(id);
  if (!existingScript) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.id = id; // e.g., googleMaps or stripe
    if (document.body) {
      document.body.appendChild(link);
    }
    link.onload = () => {
      if (callback != null) {
        callback(id, url);
      }
    };
  } else if (callback != null) {
    callback(id, url);
  }
}

// function remoteLoadToObject(
//   scriptId: string,
//   url: string,
//   toObject: {},
//   callback: null | (string, string) => void = null,
// ) {
//   loadRemote(scriptId, url, callback);

// }

const cleanUIDs = (objectToClean: Object) => {
  const genericUID = '0000000000';
  if (objectToClean == null) {
    return;
  }
  if ('uid' in objectToClean) {
    if (objectToClean.uid === genericUID) {
      return;
    }
    // eslint-disable-next-line no-param-reassign
    objectToClean.uid = genericUID;
  }
  const keys = Object.keys(objectToClean);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = objectToClean[key];
    if (
      typeof value === 'object'
      && !Array.isArray(value)
      && value != null
      && typeof value !== 'function'
      && typeof value !== 'number'
      && typeof value !== 'boolean'
      && typeof value !== 'string'
    ) {
      cleanUIDs(value);
    }
  }
};

function deleteKeys(obj: Object, keys: Array<string>) {
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      // eslint-disable-next-line no-param-reassign
      delete obj[key];
    }
  });
}

function copyKeysFromTo(source: Object, destination: Object, keys: Array<string>) {
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      // eslint-disable-next-line no-param-reassign
      destination[key] = source[key];
    }
  });
}

function generateRandomString() {
  return (Math.random() * 1e18).toString(36);
}

class UniqueMap {
  map: Object;
  index: number;
  letters: string;

  constructor() {
    this.map = {};
    this.index = 1;
    this.inverseMap = {};
    this.letters = '0abcdefghijklmnopqrstuvwxz';
  }

  reset() {
    this.index = 1;
    this.map = {};
  }

  add(pathStr: string) {
    if (this.map[pathStr] != null) {
      return this.map[pathStr];
    }
    const unique = this.getNextUniqueString();
    this.map[pathStr] = unique;
    return unique;
  }

  getNextUniqueString() {
    if (this.index === 0) {
      return 'a';
    }
    const order = Math.floor(Math.log(this.index) / Math.log(this.letters.length));
    let remainder = this.index;
    let out = '';
    for (let i = order; i >= 0; i -= 1) {
      const factor = Math.floor(remainder / this.letters.length ** i);
      remainder -= factor * this.letters.length ** i;
      out = `${out}${this.letters[factor]}`;
    }
    this.index += 1;
    return out;
  }

  makeInverseMap() {
    this.inverseMap = {};
    Object.keys(this.map).forEach((key) => {
      const uniqueStr = this.map[key];
      this.inverseMap[uniqueStr] = key;
    })
  }

  get(uniqueStr: string) {
    if (this.inverseMap[uniqueStr] != null) {
      return this.inverseMap[uniqueStr];
    }
    return null;
  }
}

function compressObject(
  obj: any,
  map: UniqueMap,
  keys: boolean = true,
  strValues: boolean = true,
  precision: ?number = null,
  uncompress: boolean = false,
) {
  if (typeof obj === 'string') {
    if (strValues && uncompress) {
      return map.get(obj);
    }
    if (strValues) {
      return map.add(obj);
    }
    return obj;
  }
  if (typeof obj === 'number') {
    if (precision == null || uncompress) {
      return obj;
    }
    return roundNum(obj, precision);
  }
  if (
    typeof obj === 'boolean'
    || typeof obj === 'function'
    || obj == null
  ) {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      obj[i] = compressObject(obj[i], map, keys, strValues, precision, uncompress);
    }
    return obj;
  }

  if (typeof obj === 'object') {
    const objKeys = Object.keys(obj);
    const obj2 = {};
    for (let i = 0; i < objKeys.length; i += 1) {
      const k = objKeys[i];
      obj[k] = compressObject(obj[k], map, keys, strValues, precision, uncompress);
      if (keys && uncompress) {
        obj2[map.get(k)] = obj[k];
      } else if (keys) {
        obj2[map.add(k)] = obj[k];
      }
    }
    if (keys) {
      return obj2;
    }
    return obj;
  }
  return obj;
  // if (Array.isArray(obj)) {
  //   for (let i = 0; i < obj.length; i += 1) {
  //     const value = obj[i];
  //     if (typeof value === 'string' && strValues) {
  //       const uniqueStr = map.add(value);
  //       obj[i] = uniqueStr;
  //     }
  //     if (typeof value === 'object') {
  //       compressObject(obj[i], map, keys, strValues);
  //     }
  //     if (Array.isArray(value)) {
  //       obj[i] = compressObject(value, map, keys, strValues);
  //     }
  //   }
  //   return obj;
  // }
  // if (typeof obj === 'object') {
  //   const k = Object.keys(obj);
  //   for (let i = 0; i < k.length; i += 1) {
  //     const value = obj[k[i]];
  //     if (typeof value === 'string' && strValues) {
  //       const uniqueStr = map.add(value);
  //       obj[k[i]] = uniqueStr;
  //     }
  //     if (Array.isArray(value)) {
  //       obj[k[i]]
  //     }
  //   }
  // }
}

function getObjectPaths(obj: any, path: string = '', pathObj = {}, pathMap = Object) {
  if (
    typeof obj === 'string'
    || typeof obj === 'number'
    || typeof obj === 'boolean'
    || typeof obj === 'function'
  ) {
    pathObj[`${path}`] = obj; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (obj === null) {
    pathObj[`${path}`] = null; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (obj === undefined) {
    pathObj[`${path}`] = undefined; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (Array.isArray(obj)) {
    obj.forEach((o, index) => {
      getObjectPaths(o, `${path}[${index}]`, pathObj);
    });
    return pathObj;
  }
  Object.keys(obj).forEach((key) => {
    getObjectPaths(obj[key], `${path}.${key}`, pathObj);
  });
  return pathObj;
}

function getObjectDiff(obj1: Object, obj2: Object) {
  const pathMap = {};
  const paths1 = getObjectPaths(obj1);
  const paths2 = getObjectPaths(obj2);
  const added = {};
  const diff = {};
  const removed = {};
  Object.keys(paths1).forEach((key1) => {
    if (paths2[key1] === undefined) {
      removed[key1] = paths1[key1];
      return;
    }
    if (paths1[key1] !== paths2[key1]) {
      diff[key1] = [paths1[key1], paths2[key1]];
    }
  });
  Object.keys(paths2).forEach((key2) => {
    if (paths1[key2] === undefined) {
      added[key2] = paths2[key2];
    }
  });
  return { diff, added, removed };
}

function updateObjFromPath(
  remainingPath: Array<string>,
  obj: Object,
  value: any,
  remove: boolean = false,
) {
  const fullP = remainingPath[0];
  const arrayStringIndeces = fullP.match(/\[[^\]]*\]/g);
  const p = fullP.replace(/\[.*/, '');
  if (remainingPath.length === 1 && remove) {
    obj[p] = undefined;
    return;
  }
  if (arrayStringIndeces) {
    const arrayIndeces = arrayStringIndeces.map(e => parseInt(e.replace(/\[|\]/g, '')));
    // console.log(arrayIndeces)
    // return;
    if (obj[p] == null || !Array.isArray(obj[p])) {
      obj[p] = [];
    }
    // console.log(obj)
    // return
    let currentArray = obj[p];
    let index = 0;
    for (let i = 0; i < arrayIndeces.length; i += 1) {
      index = arrayIndeces[i];
      if (currentArray.length <= index) {
        for (let j = 0; j < index - currentArray.length + 1; j += 1) {
          currentArray.push(undefined);
        }
      }
      if (i < arrayIndeces.length - 1) {
        currentArray[index] = [];
        currentArray = currentArray[index];
      }
    }
    if (remainingPath.length === 1) {
      currentArray[index] = value;
      return;
    }
    if (currentArray[index] == null || typeof currentArray[index] !== 'object') {
      currentArray[index] = {};
    }
    updateObjFromPath(remainingPath.slice(1), currentArray[index], value);
    return;
  }

  if (remainingPath.length === 1) {
    obj[p] = value;
    return;
  }
  if (obj[p] == null) {
    obj[p] = {};
  }
  updateObjFromPath(remainingPath.slice(1), obj[p], value);
}

function toObj(diff: Object) {
  const obj = {};
  Object.keys(diff).forEach((key) => {
    const path = key.split('.').filter(p => p.length > 0);
    const value = diff[key];
    if (Array.isArray(value)) {
      updateObjFromPath(path, obj, value.slice(-1)[0]);
    } else {
      updateObjFromPath(path, obj, value);
    }
  });
  return obj;
}

// function diffToObj(diff: Object, obj: object) {
//   const { added, diff, removed } = diff;

// }

// function addedOrRemovedToObj(addedOrRemoved: Object) {
//   const obj = {};
//   Object.keys(addedOrRemoved).forEach((key) => {
//     const path = key.split('.').filter(p => p.length > 0);
//     const value = addedOrRemoved[key];
//     updateObjFromPath(path, obj, value);
//   });
//   return obj;
// }

// function objDiffOnly(val1: any, val2: any) {
//   if (
//     typeof val1 === 'string'
//     || typeof val1 === 'number'
//     || typeof val1 === 'boolean'
//     || val1 == null
//     || typeof val1 === 'function'
//   ) {
//     if (val1 === val2) {
//       return true;
//     }
//     return false;
//   }
//   if (Array.isArray(val1)) {
//     if (!Array.isArray(val2)) {
//       return false;
//     }
//     if (val1.length !== val2.length) {
//       return false;
//     }
//     return val1.map((v, index) => objDiffOnly(v, val2[index]));
//   }
//   const diffObj = {};
//   Object.keys(val1).forEach((key) => {
//     const diff = objDiffOnly(val1[key], val2[key]);
//     diffObj[key] = diff;
//   });
//   return diffObj;
// }

// function objDiff(obj1: Object, obj2: Object) {
//   const diff = objDiffOnly(obj1, obj2);
//   const summarizedDiff = {};
//   Object.keys(diff).forEach((key) => {
//     const valueDiff = diff[key];
//     if (typeof valueDiff === 'boolean') {
//       if (valueDiff === false) {
//         summarizedDiff[key] = false;
//       }
//     } else if (Array.isArray(valueDiff)) {

//     }
//   });
// }

// // diff of obj2 relative to obj1
// function objDiff(obj1, obj2) {
//   const added = {};
//   const diff = {};
//   const removed = {};
//   Object.keys(obj1).forEach((key) => {
//     const value1 = obj1[key];
//     const value2 = obj2[key];
//     if (value2 === undefined) {
//       removed[key] = obj1[key];
//     }
//     if (
//       typeof value1 === 'string'
//       || typeof value1 === 'boolean'
//       || typeof value1 === 'number'
//       || typeof value1 === null,
//     ) {
//       if ()
//     }
//   });
// }

export {
  divide, mulToString, add, Console,
  classify, extractFrom, ObjectKeyPointer, getElement,
  addToObject, duplicateFromTo, isTouchDevice,
  generateUniqueId, joinObjects, cleanUIDs, loadRemote, loadRemoteCSS,
  deleteKeys, copyKeysFromTo, generateRandomString,
  duplicate, assignObjectFromTo, joinObjectsWithOptions,
  getObjectPaths, getObjectDiff, updateObjFromPath, toObj,
  UniqueMap, compressObject, 
};
