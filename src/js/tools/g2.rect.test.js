import {
  Rect, getRect,
} from './g2';
// import { round } from './math';

describe('Rect', () => {
  describe('Creation', () => {
    test('(0,0) (4,2)', () => {
      const r = new Rect(0, 0, 4, 2);
      expect(r.left).toBe(0);
      expect(r.bottom).toBe(0);
      expect(r.width).toBe(4);
      expect(r.height).toBe(2);
      expect(r.right).toBe(4);
      expect(r.top).toBe(2);
    });
    test('(-1,-1) (4,2)', () => {
      const r = new Rect(-1, -1, 4, 2);
      expect(r.left).toBe(-1);
      expect(r.bottom).toBe(-1);
      expect(r.width).toBe(4);
      expect(r.height).toBe(2);
      expect(r.right).toBe(3);
      expect(r.top).toBe(1);
    });
  });
  describe('getRect', () => {
    test('Array definition', () => {
      const r1 = getRect([-1, -1, 4, 2]);
      const r2 = new Rect(-1, -1, 4, 2);
      expect(r1).toEqual(r2);
    });
    test('Def definition', () => {
      const r1Def = new Rect(-1, -1, 4, 2)._def();
      const r1 = getRect(r1Def);
      const r2 = new Rect(-1, -1, 4, 2);
      expect(r1).toEqual(r2);
    });
    test('JSON definition', () => {
      const r1 = getRect('{ "f1Type": "rect", "def": [-1, -1, 4, 2] }');
      const r2 = new Rect(-1, -1, 4, 2);
      expect(r1).toEqual(r2);
    });
    test('JSON array', () => {
      const r1 = getRect('[-1, -1, 4, 2]');
      const r2 = new Rect(-1, -1, 4, 2);
      expect(r1).toEqual(r2);
    });
    test('Fail undefined', () => {
      const r1 = getRect();
      expect(r1).toEqual(new Rect(0, 0, 1, 1));
    });
    test('Fail bad value', () => {
      const r1 = getRect([1, 1, 1]);
      expect(r1).toEqual(new Rect(0, 0, 1, 1));
    });
    test('Fail bad json', () => {
      const r1 = getRect();
      expect(r1).toEqual(new Rect(0, 0, 1, 1));
    });
  });
  test('copy', () => {
    const r = new Rect(0, 0, 4, 2);
    const c = r._dup();
    expect(r).toEqual(c);
    expect(r).not.toBe(c);
  });
  test('def', () => {
    const r = new Rect(0, 0, 4, 2);
    const c = r._def();
    expect(c.f1Type).toBe('rect');
    expect(c.def).toEqual([0, 0, 4, 2]);
  });
});
