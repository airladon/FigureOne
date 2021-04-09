// @flow
import { roundNum } from './math';
import { FunctionMap } from './FunctionMap';
// import Worker from '../figure/recorder.worker.js';

const Console = (...msg: Array<any>) => {
  console.log(...msg); // eslint-disable-line no-console
};

// function add(a: number, b: number): number {
//   return a + b;
// }

// function mulToString(a: number, b: number): string {
//   return (a * b).toString();
// }

// const divide = (a: number, b: number): number => a / b;

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
  keySeparator: string = '_',
) {
  const out = [];
  if (typeof keyValues === 'string') {
    if (keyPrefix + keyValues in objectToExtractFrom) {
      return new ObjectKeyPointer(objectToExtractFrom, keyPrefix + keyValues);
    }
    const keyHeirarchy = keyValues.split(keySeparator);
    const keys = keyHeirarchy.filter(k => k.length > 0);
    const prefixAndKey = `${keyPrefix}${keys[0]}`;
    if (keys.length > 1) {
      if (prefixAndKey in objectToExtractFrom) {
        return extractFrom(
          objectToExtractFrom[prefixAndKey],
          keys.slice(1).join(keySeparator),
          keyPrefix,
          keySeparator,
        );
      }
    } else if (keys.length === 1) {
      if (prefixAndKey in objectToExtractFrom) {
        return new ObjectKeyPointer(objectToExtractFrom, prefixAndKey);
      }
    }
    return undefined;
  }

  if (Array.isArray(keyValues)) {
    keyValues.forEach((kv) => {
      const result = extractFrom(objectToExtractFrom, kv, keyPrefix, keySeparator);
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

function getFromObject(
  objectToGetFrom: Object,
  keyPath: string,
  levelSeparator: string = '.',
) {
  if (keyPath.length === 0 || keyPath === levelSeparator) {
    return objectToGetFrom;
  }
  const result = extractFrom(objectToGetFrom, keyPath, '', levelSeparator);
  if (result === undefined) {
    return undefined;
  }
  // $FlowFixMe
  return result.value();
}

// function getObjectValueFromPath(
//   objectToExtractFrom: Object,
//   path: string,
//   pathSeparator: string = '.',
// ) {
//   const result = extractFrom(objectToExtractFrom, path, '', pathSeparator);
//   if (result === undefined) {
//     return undefined;
//   }
//   if (Array.isArray(result)) {
//     return result[0].value();
//   }
//   return result.value();
// }

function getElement(
  collection: Object,
  keyValues: Object | Array<any> | string,
) {
  return extractFrom(collection, keyValues, '_', '_');
}


function addToObject(
  obj: Object,
  keyPath: string,
  valueToAdd: mixed,
  levelSeparator: string = '.',
) {
  const levels = keyPath.split(levelSeparator).filter(a => a.length > 0);
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

function duplicate(value: ?(number | boolean | string | Object)) {
  if (typeof value === 'number'
      || typeof value === 'boolean'
      || typeof value === 'string'
      || value == null
      || value === NaN  // eslint-disable-line
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
  // if (typeof value === 'object') {
  const objectDup = {};
  Object.keys(value).forEach((key) => {
    const v = duplicate(value[key]);
    objectDup[key] = v;
  });
  return objectDup;
  // }
  // return value;
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
    // debugger;
    const keyPath = parentPath !== '' ? `${parentPath}.${key}` : key;
    if (except.indexOf(keyPath) !== -1) {
      return;
    }
    const value = fromObject[key];
    if (typeof value === 'object' && value != null && value._assignAsLinkOnly) {
      // eslint-disable-next-line no-param-reassign
      toObject[key] = fromObject[key];
      return;
    }
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
  inverseMap: Object;
  index: number;
  letters: string;
  undefinedCode: string;

  constructor() {
    this.map = {};
    this.index = 1;
    this.inverseMap = {};
    this.letters = '0abcdefghijklmnopqrstuvwxz';
    this.undefinedCode = '.a';
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
    });
  }

  get(uniqueStr: string) {
    if (uniqueStr === this.undefinedCode) {
      return undefined;
    }
    if (this.inverseMap[uniqueStr] != null) {
      return this.inverseMap[uniqueStr];
    }
    return uniqueStr;
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
    // if (obj === 'do') {
    //   console.log(obj, strValues, uncompress, map.get(obj))
    // }
    if (strValues && uncompress) {
      return map.get(obj);
    }
    if (strValues) {
      return map.add(obj);
    }
    return obj;
  }
  if (typeof obj === 'number') {
    if (precision === null || uncompress) {
      return obj;
    }
    return roundNum(obj, precision);
  }
  if (
    typeof obj === 'boolean'
    || typeof obj === 'function'
    || obj === null
  ) {
    return obj;
  }

  if (obj === undefined) {
    return map.undefinedCode;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      obj[i] = compressObject(obj[i], map, keys, strValues, precision, uncompress);
    }
    return obj;
  }

  if (typeof obj === 'object') {
    const objKeys = Object.keys(obj);
    const obj2 = {};
    for (let i = 0; i < objKeys.length; i += 1) {
      const k = objKeys[i];
      // eslint-disable-next-line no-param-reassign
      obj[k] = compressObject(obj[k], map, keys, strValues, precision, uncompress);
      if (keys && uncompress) {
        const value = map.get(k);
        if (value != null) {
          obj2[value] = obj[k];
        }
      } else if (keys) {
        obj2[map.add(k)] = obj[k];
      } else {
        obj2[k] = obj[k];
      }
    }
    if (keys) {
      return obj2;
    }
    return obj2;
  }
  return obj;
}

function uncompressObject(
  obj: any,
  map: UniqueMap,
  keys: boolean = true,
  strValues: boolean = true,
) {
  return compressObject(obj, map, keys, strValues, null, true);
}

function minify(objectOrArray: any, precision: ?number = 4) {
  const map = new UniqueMap();
  return {
    minified: compressObject(objectOrArray, map, true, true, precision),
    map,
  };
}

function unminify(minObjectOrArray: {
  map: Object | UniqueMap,
  minified: Object,
}) {
  let { map } = minObjectOrArray;
  if (!(map instanceof UniqueMap)) {
    const uMap = new UniqueMap();
    uMap.map = map.map;
    uMap.index = map.index;
    uMap.letters = map.letters;
    map = uMap;
  }
  map.makeInverseMap();
  return uncompressObject(minObjectOrArray.minified, map, true, true);
}

function objectToPaths(
  obj: any,
  path: string = '',
  pathObj: Object = {},
  precision: ?number = null,
) {
  if (
    typeof obj === 'string'
    // || typeof obj === 'number'
    || typeof obj === 'boolean'
    || typeof obj === 'function'
  ) {
    pathObj[`${path}`] = obj; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (typeof obj === 'number') {
    if (precision != null) {
      pathObj[`${path}`] = roundNum(obj, precision); // eslint-disable-line no-param-reassign
    } else {
      pathObj[`${path}`] = obj; // eslint-disable-line no-param-reassign
    }
    return pathObj;
  }
  if (obj === null) {
    pathObj[`${path}`] = null; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (obj === undefined) {
    // pathObj[`${path}`] = undefined; // eslint-disable-line no-param-reassign
    return pathObj;
  }
  if (Array.isArray(obj)) {
    obj.forEach((o, index) => {
      objectToPaths(o, `${path}[${index}]`, pathObj, precision);
    });
    return pathObj;
  }
  Object.keys(obj).forEach((key) => {
    objectToPaths(obj[key], `${path}.${key}`, pathObj, precision);
  });
  return pathObj;
}

function getObjectDiff(
  obj1In: Object,
  diffs: Array<Object>,
  obj2: Object,
  precision: ?number = null,
  debug: boolean = false,
) {
  // const pathMap = {};
  let obj1 = obj1In;
  if (diffs.length > 0) { // eslint-disable-next-line no-use-before-define
    obj1 = refAndDiffToObject(obj1In, ...diffs);
  }
  const paths1 = objectToPaths(obj1, '', {}, precision);
  const paths2 = objectToPaths(obj2, '', {}, precision);
  const added = {};
  const diff = {};
  const removed = {};
  Object.keys(paths1).forEach((key1) => {
    if (paths2[key1] === undefined) {
      removed[key1] = paths1[key1];
      return;
    }
    if (paths1[key1] !== paths2[key1]) {
      if (debug) {
        diff[key1] = [paths1[key1], paths2[key1]];
      } else {
        diff[key1] = paths2[key1];
      }
    }
  });
  Object.keys(paths2).forEach((key2) => {
    if (paths1[key2] === undefined) {
      added[key2] = paths2[key2];
    }
  });
  const out = {};
  if (Object.keys(diff).length > 0) {
    out.diff = diff;
  }
  if (Object.keys(added).length > 0) {
    out.added = added;
  }
  if (Object.keys(removed).length > 0) {
    out.removed = removed;
  }
  return out;
}

function updateObjFromPath(
  remainingPath: Array<string>,
  obj: Object,
  value: any,
  remove: boolean = false,
) {
  // console.log(remainingPath)
  const fullP = remainingPath[0];
  if (fullP.length === 0) {
    return;
  }
  const arrayStringIndeces = fullP.match(/\[[^\]]*\]/g);
  const p = fullP.replace(/\[.*/, '');
  if (remainingPath.length === 1 && remove && !arrayStringIndeces) {
    // eslint-disable-next-line no-param-reassign
    delete obj[p];
    return;
  }
  if (arrayStringIndeces) {
    const arrayIndeces = arrayStringIndeces.map(e => parseInt(e.replace(/\[|\]/g, ''), 10));
    // console.log(arrayIndeces)
    // return;
    if (obj[p] == null || !Array.isArray(obj[p])) {
      obj[p] = [];  // eslint-disable-line no-param-reassign
    }
    // console.log(obj)
    // return
    let currentArray = obj[p];
    let index = 0;
    for (let i = 0; i < arrayIndeces.length; i += 1) {
      index = arrayIndeces[i];
      if (currentArray.length <= index) {
        for (let j = currentArray.length; j < index - currentArray.length + 1; j += 1) {
          currentArray.push(undefined);
        }
      }
      if (i < arrayIndeces.length - 1) {
        // currentArray[index] = currentArray[index][i];
        if (!Array.isArray(currentArray[index])) {
          currentArray[index] = [];
        }
        currentArray = currentArray[index];
      }
    }
    if (remainingPath.length === 1 && remove) {
      currentArray[index] = undefined;
      return;
    }
    if (remainingPath.length === 1) {
      currentArray[index] = value;
      return;
    }
    if (currentArray[index] == null || typeof currentArray[index] !== 'object') {
      currentArray[index] = {};
    }
    updateObjFromPath(remainingPath.slice(1), currentArray[index], value, remove);
    return;
  }

  // if (remainingPath.length === 1 && remove) {
  //   console.log('asdf')
  //   obj[p] = undefined;
  // }
  if (remainingPath.length === 1) {
    obj[p] = value;  // eslint-disable-line no-param-reassign
    return;
  }
  if (obj[p] == null) {
    obj[p] = {};  // eslint-disable-line no-param-reassign
  }
  updateObjFromPath(remainingPath.slice(1), obj[p], value, remove);
}

function pathsToObj(paths: Object) {
  const obj = {};
  Object.keys(paths).forEach((key) => {
    const path = key.split('.').filter(p => p.length > 0);
    const value = paths[key];
    if (Array.isArray(value)) {
      updateObjFromPath(path, obj, value.slice(-1)[0]);
    } else {
      updateObjFromPath(path, obj, value);
    }
  });
  return obj;
}

function refAndDiffToObject(
  referenceIn: Object,
  ...diffsIn: Array<{
    added: Object,
    diff: Object,
    removed: Object,
  }>
) {
  const ref = duplicate(referenceIn);
  const processPaths = (paths: Object, remove: boolean = false) => {
    // console.log(paths)
    Object.keys(paths).forEach((pathStr) => {
      // console.log(pathStr)
      const path = pathStr.split('.').filter(p => p.length > 0);
      const value = paths[pathStr];
      if (Array.isArray(value)) {
        updateObjFromPath(path, ref, value.slice(-1)[0], remove);
      } else {
        updateObjFromPath(path, ref, value, remove);
      }
    });
  };
  // console.log(diffsIn)
  diffsIn.forEach((diffIn) => {
    // console.log(diffIn)
    const { added, removed, diff } = diffIn;
    // console.log(1, removed)
    if (removed != null) {
      processPaths(removed, true);
    }
    // console.log(2)
    if (added != null) {
      processPaths(added);
    }
    // console.log(3)
    if (diff != null) {
      processPaths(diff);
    }
  });
  return ref;
}

function diffPathsToObj(diff: { added: Object, removed: Object, diff: Object }) {
  const out = {};
  if (diff.diff && Object.keys(diff.diff).length > 0) {
    out.diff = pathsToObj(diff.diff);
  }
  if (diff.added && Object.keys(diff.added).length > 0) {
    out.added = pathsToObj(diff.added);
  }
  if (diff.removed && Object.keys(diff.removed).length > 0) {
    out.removed = pathsToObj(diff.removed);
  }
  return out;
}

function diffObjToPaths(diff: { added: Object, removed: Object, diff: Object }) {
  const out = {};
  if (diff.diff && Object.keys(diff.diff).length > 0) {
    out.diff = objectToPaths(diff.diff);
  }
  if (diff.added && Object.keys(diff.added).length > 0) {
    out.added = objectToPaths(diff.added);
  }
  if (diff.removed && Object.keys(diff.removed).length > 0) {
    out.removed = objectToPaths(diff.removed);
  }
  return out;
}

// Class that can track an object's differences over time
class ObjectTracker {
  baseReference: ?Object;
  references: {
    [refName: string]: {
      basedOn: string,
      diff: Object,
    },
  };

  precision: number;
  worker: typeof Worker;

  //             time   refName  diff
  diffs: Array<[number, string, Object, number]>

  lastReferenceName: string;

  constructor(precision: number = 8) {
    this.precision = precision;
    this.reset();
  }

  toObj() {
    const references = {};
    Object.keys(this.references).forEach((refName) => {
      references[refName] = {
        basedOn: this.references[refName].basedOn,
        diff: diffPathsToObj(this.references[refName].diff),
      };
    });
    // $FlowFixMe
    const diffs = this.diffs.map(d => [d[0], d[1], diffPathsToObj(d[2]), d[3]]);
    return {
      baseReference: duplicate(this.baseReference),
      diffs,
      references,
      precision: this.precision,
      lastReferenceName: this.lastReferenceName,
    };
  }

  setFromObj(obj: Object) {
    const references = {};
    Object.keys(obj.references).forEach((refName) => {
      references[refName] = {
        basedOn: obj.references[refName].basedOn,
        diff: diffObjToPaths(obj.references[refName].diff),
      };
    });
    this.references = references;
    this.baseReference = duplicate(obj.baseReference);
    this.precision = obj.precision;
    this.diffs = obj.diffs.map(d => [d[0], d[1], diffObjToPaths(d[2]), d[3]]);
    this.lastReferenceName = obj.lastReferenceName;
  }

  reset() {
    this.baseReference = null;
    this.references = {};
    this.diffs = [];
    this.lastReferenceName = '__base';
  }

  setBaseReference(obj: Object) {
    this.baseReference = duplicate(obj);
    this.lastReferenceName = '__base';
  }

  addReference(
    obj: Object,
    refName: string,
    basedOn: string = '__base',
  ) {
    if (this.baseReference == null || refName === '__base') {
      this.setBaseReference(obj);
    }
    if (refName !== '__base') {
      this.references[refName] = {
        diff: this.getDiffToReference(obj, basedOn),
        basedOn,
      };
      this.lastReferenceName = refName;
    }
  }

  getReferenceChain(name: string, chain: Array<Object>) {
    if (name === '__base') {
      return chain;
    }
    if (this.references[name] == null) {
      return chain;
    }
    return this.getReferenceChain(
      this.references[name].basedOn, [this.references[name].diff, ...chain],
    );
  }

  getReference(refName: string) {
    const referenceChain = this.getReferenceChain(refName, []);
    return refAndDiffToObject(this.baseReference, ...referenceChain);
  }

  getDiffToReference(
    obj: Object,
    refName: string,
  ) {
    // const s1 = performance.now()
    const referenceChain = this.getReferenceChain(refName, []);
    // console.log('ref Chain', performance.now() - s1);
    // const s2 = performance.now()
    const diff = getObjectDiff(this.baseReference, referenceChain, obj, this.precision);
    // console.log('s2', performance.now() - s2);
    return diff;
  }

  getObjFromDiffAndReference(
    diff: Object,
    refName: string,
  ) {
    const referenceChain = this.getReferenceChain(refName, []);
    const diffs = [...referenceChain, diff];
    return refAndDiffToObject(this.baseReference, ...diffs);
  }

  add(time: number, obj: Object, refName: string = this.lastReferenceName, timeCount: number = 0) {
    if (this.baseReference == null) {
      this.setBaseReference(obj);
    }
    const diff = this.getDiffToReference(obj, refName);
    this.diffs.push([time, refName, diff, timeCount]);
  }

  addWithWorker(
    time: number,
    obj: Object,
    refName: string = this.lastReferenceName,
    timeCount: number = 0,
  ) {
    if (this.baseReference == null) {
      this.setBaseReference(obj);
    }
    this.startWorker();
    if (this.worker != null) {  // $FlowFixMe
      this.worker.postMessage([time, refName, obj, timeCount]);
    }
  }

  startWorker() {
    if (this.worker != null) {
      return;
    }
    // $FlowFixMe
    this.worker = new Worker();

    // // $FlowFixMe
    // this.worker.addEventListener('message', function (event) {
    //   console.log(event.data)
    // });
  }

  getFromIndex(index: number) {
    if (index > this.diffs.length || this.diffs.length === 0) {
      return null;
    }
    const [, basedOn, diff] = this.diffs[index];
    return this.getObjFromDiffAndReference(diff, basedOn);
  }
}

/**
 * Subscriber
 * @property {string | function(): void} callback callback to use when
 * subscription is published
 * @property {number} num number of subscriptions
 */
 type OBJ_Subscriber = {
   callback: string | () => void;
   num: number;
 };

 /**
 * Subscriber Map.
 *
 * @property {OBJ_Subscriber} [_id] each key in this object is a unique
 * identifier associated with a subscriber callback.
 */
 type OBJ_Subscribers = {
   _id: OBJ_Subscriber;
 };

/**
 * A single subscription
 *
 * @property {OBJ_Subscribers} subscribers
 * @property {FunctionMap} fnMap
 */
class Subscription {
  fnMap: FunctionMap;
  subscribers: {
    [id: string]: {
      callback: string | () => void;
      num: number;
    }
  };

  order: Array<string>;

  nextId: number;

  /**
   * @property {FunctionMap} fnMap Only needed for {@link Recorder}.
   */
  constructor(fnMap: FunctionMap = new FunctionMap()) {
    this.fnMap = fnMap;
    this.subscribers = {};
    this.nextId = 0;
    this.order = [];
  }

  /**
   * Add a subscriber to an event.
   * @param {string} subscriptionName event name
   * @param {string | function(): void} callback to be called when events
   * are published. If `string`, then {@link FunctionMap} of the {@link Figure}
   * or {@link FigureElement} to which the subscription manager is a property
   * of will be used.
   * @param {number} numberOfSubscriptions how many publications the
   * subscription will receive. `-1` is no limit (`-1`).
   * @return {number} subscirber id
   */
  add(callback: string | () => void, numberOfPublications: number = -1) {
    this.subscribers[`${this.nextId}`] = {
      callback,
      num: numberOfPublications,
    };
    this.order.push(`${this.nextId}`);
    this.nextId += 1;
    return this.nextId - 1;
  }

  /**
   * Publish to all subscribers
   *
   * @param {any} functionArgument argument to pass to subscriber callback
   */
  publish(functionArgument: any) {
    const subscribersToRemove = [];
    for (let i = 0; i < this.order.length; i += 1) {
      const id = this.order[i];
      const { callback, num } = this.subscribers[id];
      if (num === 1) {
        subscribersToRemove.push(id);
      }
      let publishOk = false;
      if (num !== 0) {
        publishOk = true;
      }
      if (num > 0) {
        this.subscribers[`${id}`].num = num - 1;
      }
      if (publishOk) {
        this.fnMap.exec(callback, functionArgument);
      }
    }
    subscribersToRemove.forEach((id) => { this.remove(id); });
  }

  /**
   * Remove subscriber - the subscirber id is returned by this object's `add`
   * method
   */
  remove(subscirberId: string | number) {
    const id = `${subscirberId}`;
    if (this.subscribers[id] != null) {
      delete this.subscribers[id];
    }
    const index = this.order.indexOf(id);
    if (index > -1) {
      this.order.splice(index, 1);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _excludeStateKeys() {
    return ['fnMap'];
  }
}

 /**
 * Subscription Map.
 *
 * @property {Subscription} [_subscriptionName] each key in this object is a
 * unique subscription name associated with a subscription.
 */
 type OBJ_Subscriptions = {
   _subscriptionName: Subscription;
 };
/**
 * Subscription manager.
 *
 * Publishes notifications to event subscribers.
 *
 * {@link Figure}, {@link FigureElement}, {@link Recorder}, and
 * {@link SlideNavigator} all use subscription managers for event nofitications.
 *
 * Subscriptions managers can also be added to custom objects, but it will only
 * publish to subscribers when it is told to publish.
 *
 * @property {OBJ_Subscriptions} subscriptions
 * @property {FunctionMap} fnMap
 *
 * @example
 * // Subscribe to the `setTransform` subscription of `ball1` to move `ball2`
 *
 * // Add ball1 and ball2 to the figure
 * const [ball1, ball2] = figure.add([
 *   {
 *     name: 'ball1',
 *     method: 'primitives.polygon',
 *     options: {
 *       sides: 100, radius: 0.5, color: [1, 0, 0, 1],
 *     },
 *   },
 *   {
 *     name: 'ball2',
 *     method: 'primitives.polygon',
 *     options: {
 *       sides: 100, radius: 0.3, color: [0, 0, 1, 1],
 *     },
 *   },
 * ]);
 *
 * // Subscribe to ball1's `setTransform` publication, and use the set
 * transform to move ball2 with ball1
 * ball1.subscriptions.add('setTransform', (transform) => {
 *   ball2.setTransform(transform[0]);
 * });
 *
 * // Animate ball1 to show ball2 moves with it
 * ball1.animations.new()
 *   .position({ target: [1, 0], duration: 2 })
 *   .start();
 */
class SubscriptionManager {
  fnMap: FunctionMap;
  subscriptions: {
    [subscriptionName: string]: Subscription;
  }

  /**
   * @param {FunctionMap} fnMap default function map to use. Function maps
   * need only be used with {@link Recorder}.
   */
  constructor(fnMap: FunctionMap = new FunctionMap()) {
    this.subscriptions = {};
    this.fnMap = fnMap;
  }

  /**
   * Add a subscriber to an event.
   * @param {string} subscriptionName event name
   * @param {string | function(): void} callback to be called when events
   * are published. If `string`, then {@link FunctionMap} of the {@link Figure}
   * or {@link FigureElement} to which the subscription manager is a property
   * of will be used.
   * @param {number} numberOfSubscriptions how many publications the
   * subscription will receive. `-1` is no limit (`-1`).
   * @return {number} subscriber id
   */
  add(
    subscriptionName: string,
    callback: string | () => void,
    numberOfSubscriptions: number = -1,
  ) {
    if (this.subscriptions[subscriptionName] == null) {
      this.subscriptions[subscriptionName] = new Subscription(this.fnMap);
    }
    return this.subscriptions[subscriptionName].add(callback, numberOfSubscriptions);
  }

  /**
   * Publish to all subscribers
   *
   * @param {string} subscriptionName
   * @param {any} payload payload to pass to subscribers
   */
  publish(subscriptionName: string, payload: any) {
    if (this.subscriptions[subscriptionName] != null) {
      this.subscriptions[subscriptionName].publish(payload);
    }
  }

  /**
  * Remove subscriber from subscription
   * @param {string} subsciptionName
   * @param {string | number} subscriberId
   */
  remove(subscriptionName: string, subscriberId: string | number) {
    if (this.subscriptions[subscriptionName] != null) {
      const subscription = this.subscriptions[subscriptionName];
      subscription.remove(subscriberId);
      if (subscription.order.length === 0) {
        delete this.subscriptions[subscriptionName];
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _excludeStateKeys() {
    return ['fnMap'];
  }
}

function download(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  const { body } = document;
  if (body != null) {
    body.appendChild(element);
    element.click();
    body.removeChild(element);
  }
}

function splitString(str: string, token: string = '|', escape: string = '') {
  const letters = str.split('');
  const split = [];
  let currentSplit = [];
  let escaped = false;
  let escapedEscape = false;
  let tokenStringIndex = 0;
  letters.forEach((letter) => {
    currentSplit.push(letter);
    if (tokenStringIndex === 0 && letter === escape && escaped === false) {
      escaped = true;
    } else if (letter === escape && tokenStringIndex === 0 && escaped) {
      escapedEscape = true;
    } else if (letter === token[tokenStringIndex]) {
      tokenStringIndex += 1;
    } else {
      tokenStringIndex = 0;
      escaped = false;
    }
    if (tokenStringIndex === token.length) {
      if (!escaped) {
        const newSplitString = currentSplit.slice(0, -token.length).join('');
        if (newSplitString.length > 0) {
          split.push(newSplitString);
        }
        currentSplit = [];
      } else {
        const preEscape = currentSplit.slice(0, -token.length - escape.length);
        const postEscape = currentSplit.slice(-token.length);
        currentSplit = [...preEscape, ...postEscape];
      }
      escaped = false;
      tokenStringIndex = 0;
    }
    if (escapedEscape) {
      escapedEscape = false;
      escaped = false;
      currentSplit = currentSplit.slice(0, -1);
    }
  });
  if (currentSplit.length > 0) {
    split.push(currentSplit.join(''));
  }
  return split;
}

class PerformanceTimer {
  stamps: Array<[number, string]>;
  index: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.stamps = [[performance.now(), 'init']];
    this.index = 1;
  }

  stamp(label: string = `m${this.index}`) {
    this.stamps.push([performance.now(), label]);
    this.index += 1;
  }

  deltas() {
    let lastTime;
    const out = [0];
    let cumTime = 0;
    this.stamps.forEach((stamp, i) => {
      const [t, label] = stamp;
      if (i > 0) {
        const delta = t - lastTime;
        out.push([label, Math.round(delta * 100) / 100]);
        cumTime += delta;
      }
      lastTime = t;
    });
    out[0] = Math.round(cumTime * 100) / 100;
    return out;
  }

  log() {
    if (window.figureOneDebug == null) {
      window.figureOneDebug = { misc: [] };
    }
    window.figureOneDebug.misc.push(this.deltas());
  }
}

export {
  diffPathsToObj, diffObjToPaths,
  Console,
  classify, extractFrom, ObjectKeyPointer, getElement,
  addToObject, duplicateFromTo, isTouchDevice,
  generateUniqueId, joinObjects, cleanUIDs, loadRemote, loadRemoteCSS,
  deleteKeys, copyKeysFromTo, generateRandomString,
  duplicate, assignObjectFromTo, joinObjectsWithOptions,
  objectToPaths, getObjectDiff, updateObjFromPath, pathsToObj,
  UniqueMap, compressObject, refAndDiffToObject, uncompressObject,
  unminify, minify, ObjectTracker,
  download,
  Subscription,
  SubscriptionManager,
  getFromObject,
  splitString, PerformanceTimer,
};

