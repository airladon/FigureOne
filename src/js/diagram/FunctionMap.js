// @flow
// import type { Transform } from '../tools/g2';
// import { Point, getTransform, Transform } from '../tools/g2';
// import { round } from '../tools/math';
// import type { DiagramElement } from './Element';
// import GlobalAnimation from './webgl/GlobalAnimation';

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
    return null;
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
    }
    if (typeof idOrFn === 'function') {
      return idOrFn(...args);
    }
    return null;
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

class FunctionMap extends GeneralFunctionMap {
  map: { [id: string]: {
    fn: Function,
  }}

  global: GlbalFunctionMap;

  constructor() {
    super();
    this.global = new GlobalFunctionMap();
  }

  exec(idOrFn: string | Function | null, ...args: any) {
    // const result = super.exec(idOrFn, ...args);
    // if (result === null) {
    //   return this.global.exec(idOrFn, ...args);
    // }
    // return result;
    return this.execOnMaps(idOrFn, [this.global.map], ...args);
  }

  execOnMaps(idOrFn: string | Function | null, mapsIn: Array<Object>, ...args: any) {
    return super.execOnMaps(idOrFn, [...mapsIn, this.global.map], ...args);
  }
}

export { FunctionMap, GlobalFunctionMap };
