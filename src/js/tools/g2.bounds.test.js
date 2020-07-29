import {
  Point, Rect, Transform,
  RectBounds, LineBounds, RangeBounds, TransformBounds, ValueBounds,
} from './g2';
import { round } from './math';

describe('Bounds', () => {
  // describe('Value Bounds', () => {
  //   test('Simple', () => {
  //     const bounds = new ValueBounds(4);
  //     expect(bounds.boundary).toBe(4);
  //   });
  // });
  describe('Range Bounds', () => {
    let bounds;
    describe('Bounded max and min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(-10, 10);
      });
      test('Contains value', () => {
        expect(bounds.contains(3)).toBe(true);
        expect(bounds.contains(-10)).toBe(true);
        expect(bounds.contains(10)).toBe(true);
        expect(bounds.contains(-11)).toBe(false);
        expect(bounds.contains(11)).toBe(false);
      });
      test('Contains point - should be false', () => {
        expect(bounds.contains([0, 0])).toBe(false);
        // expect(bounds.contains([10, 10])).toBe(true);
        // expect(bounds.contains([-10, -10])).toBe(true);
        // expect(bounds.contains([-10, 10])).toBe(true);
        // expect(bounds.contains([-11, 10])).toBe(false);
        // expect(bounds.contains([-10, 11])).toBe(false);
        // expect(bounds.contains([-11, 11])).toBe(false);
      });
      test('Clip Value', () => {
        expect(bounds.clip(3)).toBe(3);
        expect(bounds.clip(10)).toBe(10);
        expect(bounds.clip(-10)).toBe(-10);
        expect(bounds.clip(11)).toBe(10);
        expect(bounds.clip(-11)).toBe(-10);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([10, 10])).toEqual(new Point(10, 10));
        expect(bounds.clip([-10, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([-10, 10])).toEqual(new Point(-10, 10));
        expect(bounds.clip([-11, 10])).toEqual(new Point(-10, 10));
        expect(bounds.clip([-10, 11])).toEqual(new Point(-10, 10));
        expect(bounds.clip([-11, 11])).toEqual(new Point(-10, 10));
      });
      test('Intersect Value', () => {
        // Inside bounds
        expect(bounds.intersect(3, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 7 });
        expect(bounds.intersect(3, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 13 });
        // Edges of bounds
        expect(bounds.intersect(10, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 0 });
        expect(bounds.intersect(10, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 20 });
        expect(bounds.intersect(-10, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 20 });
        expect(bounds.intersect(-10, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 0 });
        // Outside Bounds, no intersection
        expect(bounds.intersect(-11, -1)).toBe(null);
        expect(bounds.intersect(11, 1)).toBe(null);
        // Outside Bounds intersection
        expect(bounds.intersect(-11, 1))
          .toEqual({ intersect: -10, reflection: -1, distance: 1 });
        expect(bounds.intersect(11, -1))
          .toEqual({ intersect: 10, reflection: 1, distance: 1 });
      });
    });
    describe('Bounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(null, 10);
      });
      test('Contains', () => {
        expect(bounds.contains(-1000000)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(10)).toBe(true);
        expect(bounds.contains(11)).toBe(false);
        expect(bounds.contains([0, 0])).toBe(false);
        expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Clip Value', () => {
        expect(bounds.clip(3)).toBe(3);
        expect(bounds.clip(-100)).toBe(-100);
        expect(bounds.clip(10)).toBe(10);
        expect(bounds.clip(11)).toBe(10);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, 10])).toEqual(new Point(-11, 10));
        expect(bounds.clip([-10, 11])).toEqual(new Point(-10, 10));
        expect(bounds.clip([-11, 11])).toEqual(new Point(-11, 10));
      });
      test('Intersect Value', () => {
        // Inside bounds, intersect
        expect(bounds.intersect(3, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 7 });
        // Inside bounds, no intersect
        expect(bounds.intersect(3, -1)).toBe(null);
        // Outside bounds intersect
        expect(bounds.intersect(11, -1))
          .toEqual({ intersect: 10, reflection: 1, distance: 1 });
        // Outside bounds no intersect
        expect(bounds.intersect(11, 1)).toBe(null);
      });
    });
    describe('Unbounded max, bounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(-10, null);
      });
      test('Contains', () => {
        expect(bounds.contains(-11)).toBe(false);
        expect(bounds.contains(-10)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(100000)).toBe(true);
        expect(bounds.contains([0, 0])).toBe(false);
        expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Clip', () => {
        expect(bounds.clip(3)).toBe(3);
        expect(bounds.clip(100)).toBe(100);
        expect(bounds.clip(-10)).toBe(-10);
        expect(bounds.clip(-11)).toBe(-10);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, 10])).toEqual(new Point(-10, 10));
        expect(bounds.clip([-10, 11])).toEqual(new Point(-10, 11));
        expect(bounds.clip([-11, 11])).toEqual(new Point(-10, 11));
      });
      test('Intersect Value', () => {
        // Inside bounds, intersect
        expect(bounds.intersect(3, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 13 });
        // Inside bounds, no intersect
        expect(bounds.intersect(3, 1)).toBe(null);
        // Outside bounds intersect
        expect(bounds.intersect(-11, 1))
          .toEqual({ intersect: -10, reflection: -1, distance: 1 });
        // Outside bounds no intersect
        expect(bounds.intersect(-11, -1)).toBe(null);
      });
    });
    describe('Unbounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(null, null);
      });
      test('Contains', () => {
        expect(bounds.contains(-10000)).toBe(true);
        expect(bounds.contains(-10)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(100000)).toBe(true);
        expect(bounds.contains([0, 0])).toBe(false);
        expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Clip Value', () => {
        expect(bounds.clip(0)).toBe(0);
        expect(bounds.clip(100)).toBe(100);
        expect(bounds.clip(-100)).toBe(-100);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, 10])).toEqual(new Point(-11, 10));
        expect(bounds.clip([-10, 11])).toEqual(new Point(-10, 11));
        expect(bounds.clip([-11, 11])).toEqual(new Point(-11, 11));
      });
      test('Intersect Value', () => {
        // Inside bounds, no intersect
        expect(bounds.intersect(3, 1)).toBe(null);
        expect(bounds.intersect(3, -1)).toBe(null);
      });
    });
  });
});
