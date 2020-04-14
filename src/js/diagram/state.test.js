import {
  Point, Rect, Transform, Line,
} from '../tools/g2';
import {
  getState, getDef,
} from './state';
// import { round } from '../tools/math';

describe('state', () => {
  describe('getDef', () => {
    test('number', () => {
      const value = getDef(1);
      expect(value).toBe(1);
    });
    test('string', () => {
      const value = getDef('asdf');
      expect(value).toBe('asdf');
    });
    test('boolean', () => {
      const value = getDef(false);
      expect(value).toBe(false);
    });
    test('undefined', () => {
      const value = getDef();
      expect(value).toBe(undefined);
    });
    test('null', () => {
      const value = getDef(null);
      expect(value).toBe(null);
    });
    test('array', () => {
      const ar = getDef([1, new Point(1, 1)._def()]);
      expect(ar[0]).toBe(1);
      expect(ar[1]).toEqual(new Point(1, 1));
    });
    test('obj', () => {
      const obj = getDef({
        num: 1,
        str: 'asdf',
        bool: false,
        undef: undefined,
        nul: null,
        tf: new Transform().translate(1, 1)._def(),
        p: new Point(1, 1)._def(),
        r: new Rect(0, 0, 2, 2)._def(),
        l: new Line([0, 0], [1, 1])._def(),
        obj: {
          r: new Rect(0, 0, 3, 3)._def(),
        },
        ar: [1, new Point(1, 1)._def()],
      });
      expect(obj.num).toBe(1);
      expect(obj.str).toBe('asdf');
      expect(obj.bool).toBe(false);
      expect(obj.undef).toBe(undefined);
      expect(obj.nul).toBe(null);
      expect(obj.tf).toEqual(new Transform().translate(1, 1));
      expect(obj.p).toEqual(new Point(1, 1));
      expect(obj.r).toEqual(new Rect(0, 0, 2, 2));
      expect(obj.l).toEqual(new Line([0, 0], [1, 1]));
      expect(obj.obj.r).toEqual(new Rect(0, 0, 3, 3));
      expect(obj.ar[0]).toBe(1);
      expect(obj.ar[1]).toEqual(new Point(1, 1));
    });
    test('def to undef', () => {
      const objIn = {
        num: 1,
        str: 'asdf',
        bool: false,
        undef: undefined,
        nul: null,
        tf: new Transform().translate(1, 1),
        p: new Point(1, 1),
        r: new Rect(0, 0, 2, 2),
        l: new Line([0, 0], [1, 1]),
        obj: {
          r: new Rect(0, 0, 3, 3),
        },
        ar: [1, new Point(1, 1)],
      };
      const obj = getDef(getState(objIn, [
        'num', 'str', 'bool', 'undef', 'nul', 'tf', 'p', 'r', 'l', 'obj', 'ar',
      ]));
      expect(obj.num).toBe(1);
      expect(obj.str).toBe('asdf');
      expect(obj.bool).toBe(false);
      expect(obj.undef).toBe(undefined);
      expect(obj.nul).toBe(null);
      expect(obj.tf).toEqual(new Transform().translate(1, 1));
      expect(obj.p).toEqual(new Point(1, 1));
      expect(obj.r).toEqual(new Rect(0, 0, 2, 2));
      expect(obj.l).toEqual(new Line([0, 0], [1, 1]));
      expect(obj.obj.r).toEqual(new Rect(0, 0, 3, 3));
      expect(obj.ar[0]).toBe(1);
      expect(obj.ar[1]).toEqual(new Point(1, 1));
    });
  });
});
