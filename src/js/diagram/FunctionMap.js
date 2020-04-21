// @flow
// import type { Transform } from '../tools/g2';
// import { Point, getTransform, Transform } from '../tools/g2';
// import { round } from '../tools/math';
// import type { DiagramElement } from './Element';
// import GlobalAnimation from './webgl/GlobalAnimation';

// Singleton class that contains projects global functions

class FunctionMap {
  map: { [id: string]: {
    fn: Function,
  }}

  static instance: Object;

  constructor() {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!FunctionMap.instance) {
      FunctionMap.instance = this;
      this.map = {};
    }
    return FunctionMap.instance;
  }

  add(id: string, fn: Function) {
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
      return null;
    }
    if (typeof idOrFn === 'function') {
      return idOrFn(...args);
    }
    return null;
    // if (this.map[id] != null) {
    //   if (args.length === 0) {
    //     return this.map[id].fn();
    //   }
    //   return this.map[id].fn(...args);
    // }
    // return null;
  }
}

export default FunctionMap;
