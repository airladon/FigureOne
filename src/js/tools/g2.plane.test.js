import {
  Plane, getPlane, Point,
} from './g2';
// import { round } from './math';

const point = (x, y, z) => new Point(x, y, z);

describe('Rect', () => {
  describe('Creation', () => {
    test('(0,0,0) (0,0,1)', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.p0).toEqual(point(0, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('(1,2,3) (-1,2,4)', () => {
      const p = new Plane([1, 2, 3], [-1, 2, 4]);
      expect(p.p0).toEqual(point(1, 2, 3));
      expect(p.n).toEqual(point(-1, 2, 4));
    });
  });
  describe('getRect', () => {
    test('Array definition', () => {
      const p = new Plane([[1, 0, 0], [0, 0, 1]]);
      expect(p.p0).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('Def definition', () => {
      const pDef = new Plane([[1, 0, 0], [0, 0, 1]])._state();
      const p = getPlane(pDef);
      expect(p.p0).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('JSON definition', () => {
      const p = getPlane('{ "f1Type": "pl", "state": [[1, 0, 0], [0, 0, 1]] }');
      expect(p.p0).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('JSON array', () => {
      const p = getPlane('[[1, 0, 0], [0, 0, 1]]');
      expect(p.p0).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('Fail undefined', () => {
      expect(() => getPlane()).toThrow();
    });
  });
  test('copy', () => {
    const p = new Plane([1, 2, 3], [-1, 2, 4]);
    const p1 = p._dup();
    expect(p).toEqual(p1);
    expect(p).not.toBe(p1);
  });
  test('def', () => {
    const pDef = new Plane([[1, 0, 0], [0, 0, 1]])._state();
    expect(pDef.f1Type).toBe('pl');
    expect(pDef.state).toEqual([[1, 0, 0], [0, 0, 1]]);
  });
  describe('Point on Plane', () => {
    test('Same as p0', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([0, 0, 0])).toBe(true);
    });
    test('On Plane', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([1, 0, 0])).toBe(true);
      expect(p.hasPointOn([0, 1, 0])).toBe(true);
      expect(p.hasPointOn([0, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, 0, 0])).toBe(true);
      expect(p.hasPointOn([1, 1, 0])).toBe(true);
      expect(p.hasPointOn([1, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, 1, 0])).toBe(true);
      expect(p.hasPointOn([10, 0.5, 0])).toBe(true);
      expect(p.hasPointOn([-2, 0.5, 0])).toBe(true);
      expect(p.hasPointOn([-2, -0.5, 0])).toBe(true);
      expect(p.hasPointOn([0, 0, 0.001], 2)).toBe(true);
    });
    test('Off Plane', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([1, 0, 0.001])).toBe(false);
      expect(p.hasPointOn([0, 1, 1])).toBe(false);
      expect(p.hasPointOn([0, -1, -0.1])).toBe(false);
      expect(p.hasPointOn([-1, 0, 0.00001])).toBe(false);
      expect(p.hasPointOn([1, 1, 2])).toBe(false);
      expect(p.hasPointOn([1, -1, -10])).toBe(false);
      expect(p.hasPointOn([-1, -1, 1])).toBe(false);
      expect(p.hasPointOn([-1, 1, 0.1])).toBe(false);
      expect(p.hasPointOn([10, 0.5, -0.3])).toBe(false);
      expect(p.hasPointOn([-2, 0.5, -5])).toBe(false);
      expect(p.hasPointOn([-2, -0.5, 5])).toBe(false);
      expect(p.hasPointOn([0, 0, 0.001], 3)).toBe(false);
    });
  });
});
