// @flow
// import type { Transform } from '../tools/g2';
// import { Point, getTransform, Transform } from '../tools/g2';
// import { round } from '../tools/math';
// import type { FigureElement } from './Element';
// import TimeKeeper from './webgl/TimeKeeper';

// Singleton class that contains projects global functions

class GeneralFunctionMap {
  map: { [id: string]: {
    fn: Function,
  }}

  constructor() {
    this.map = {};
  }

  add(id: string, fn: Function) {
    if (this.map == null) {
      this.map = {};
    }
    this.map[id] = {
      fn,
    };
  }

  exec(idOrFn: string | Function | null, ...args: any) {
    if (idOrFn == null) {
      return null;
    }
    if (typeof idOrFn === 'string') {
      // return this.fnMap.exec(fn, ...args);
      if (this.map[idOrFn] != null) {
        if (args.length === 0) {
          return this.map[idOrFn].fn();
        }
        return this.map[idOrFn].fn(...args);
      }
    }
    if (typeof idOrFn === 'function') {
      return idOrFn(...args);
    }
    throw new Error(`${idOrFn} needs to be a function or a string`);
  }

  execOnMaps(idOrFn: string | Function | null, mapsIn: Array<Object>, ...args: any) {
    if (idOrFn == null) {
      return null;
    }
    if (typeof idOrFn === 'string') {
      const maps = [this.map, ...mapsIn];
      for (let i = 0; i < maps.length; i += 1) {
        const map = maps[i];
        if (map[idOrFn] != null) {
          if (args.length === 0) {
            return map[idOrFn].fn();
          }
          return map[idOrFn].fn(...args);
        }
      }
      throw new Error(`FunctionMap Error: '${idOrFn}' does not exist in map`);
    }
    if (typeof idOrFn === 'function') {
      return idOrFn(...args);
    }
    throw new Error(`FunctionMap Error: '${idOrFn}' needs to be a function or a string`);
    // return null;
  }
}


class GlobalFunctionMap extends GeneralFunctionMap {
  static instance: Object;
  constructor() {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!GlobalFunctionMap.instance) {
      super();
      GlobalFunctionMap.instance = this;
      this.map = {};
    }
    return GlobalFunctionMap.instance;
  }
}

/**
 * Function Map
 *
 * In FigureOne {@link Recorder}, state is saved in stringified javascript
 * objects. When the state includes a function (like a trigger method in an
 * animation for example) then that function is referenced in the state object
 * as a unique string id.
 *
 * When a geometry is loaded, functions that will be captured in state objects
 * need to be added to a function map. Both {@link Figure} and
 * {@link FigureElement} have attached function maps as the property `fnMap`.
 * Therefore, the method is added to either the figure or element function map,
 * with an associated unique string id, and that string id is used when the
 * function is used. For example as defined callbacks, triggerAnimationStep and
 * customAnimationStep callbacks, or recorder slide definitions (`entryState`,
 * `steadyState`, `leaveState`, `exec`, `execDelta`).
 *
 * The funciton map has:
 * - A map of functions
 * - A link to a global map of functions (a singleton)
 * - The ability to execute a function within the map
 *
 * @property {FunctionMap} global global function map
 * @property {Object} map local function map where keys are unique identifiers
 * and values are the associated functions
 *
 * @example
 * // Add a console function to a FunctionMap and execute it with a parameter
 * figure.fnMap.add('toConsole', s => console.log(s));
 * figure.fnMap.exec('toConsole', 'hello');
 */
class FunctionMap extends GeneralFunctionMap {
  map: { [id: string]: {
    fn: Function,
  }}

  global: GlobalFunctionMap;

  constructor() {
    super();
    this.global = new GlobalFunctionMap();
  }

  /**
   * Execute function with arguments.
   *
   * @param {string | Function | null} idOrFn If `string`, then a function
   * in the local map or global map will be executed (local map takes
   * precedence). If `Function`, then the
   * function will be exectuted. If `null`, then nothing will happen.
   * @param {any} ...args arguments to pass to function.
   */
  exec(idOrFn: string | Function | null, ...args: any) {
    return this.execOnMaps(idOrFn, [this.global.map], ...args);
  }

  execOnMaps(idOrFn: string | Function | null, mapsIn: Array<Object>, ...args: any) {
    return super.execOnMaps(idOrFn, [...mapsIn, this.global.map], ...args);
  }

  /**
   * Add a function to the map.
   * @param {string} id unique identifier
   * @param {Function} fn function to add
   */
  add(id: string, fn: Function) {
    return super.add(id, fn);
  }
}

export { FunctionMap, GlobalFunctionMap };
