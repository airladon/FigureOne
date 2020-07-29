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
      test('Contains point', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([10, 10])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([-10, 10])).toBe(true);
        expect(bounds.contains([-11, 10])).toBe(false);
        expect(bounds.contains([-10, 11])).toBe(false);
        expect(bounds.contains([-11, 11])).toBe(false);
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
        // Outside Bounds
        expect(bounds.intersect(-11, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 1 });
        expect(bounds.intersect(-11, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 21 });
        expect(bounds.intersect(11, -1))
          .toEqual({ intersect: -10, reflection: 1, distance: 21 });
        expect(bounds.intersect(11, 1))
          .toEqual({ intersect: 10, reflection: -1, distance: 1 });
      });
      test('Intersect Point', () => {
        // Inside bounds
        expect(bounds.intersect([3, -3], 1)).toEqual({
          intersect: new Point(10, 10),
          reflection: -1,
          distance: new Point(7, 13),
        });
        expect(bounds.intersect([3, -3], -1)).toEqual({
          intersect: new Point(-10, -10),
          reflection: 1,
          distance: new Point(13, 7),
        });
        // Edges of bounds
        expect(bounds.intersect([10, 10], 1)).toEqual({
          intersect: new Point(10, 10),
          reflection: -1,
          distance: new Point(0, 0),
        });
        expect(bounds.intersect([-10, 10], 1)).toEqual({
          intersect: new Point(10, 10),
          reflection: -1,
          distance: new Point(20, 0),
        });
        expect(bounds.intersect([10, -10], 1)).toEqual({
          intersect: new Point(10, 10),
          reflection: -1,
          distance: new Point(0, 20),
        });
        expect(bounds.intersect([-10, -10], -1)).toEqual({
          intersect: new Point(-10, -10),
          reflection: 1,
          distance: new Point(0, 0),
        });
        expect(bounds.intersect([-10, 10], -1)).toEqual({
          intersect: new Point(-10, -10),
          reflection: 1,
          distance: new Point(0, 20),
        });
        expect(bounds.intersect([10, -10], -1)).toEqual({
          intersect: new Point(-10, -10),
          reflection: 1,
          distance: new Point(20, 0),
        });
        // expect(bounds.intersect(10, 1))
        //   .toEqual({ intersect: 10, reflection: -1, distance: 0 });
        // expect(bounds.intersect(10, -1))
        //   .toEqual({ intersect: -10, reflection: 1, distance: 20 });
        // expect(bounds.intersect(-10, 1))
        //   .toEqual({ intersect: 10, reflection: -1, distance: 20 });
        // expect(bounds.intersect(-10, -1))
        //   .toEqual({ intersect: -10, reflection: 1, distance: 0 });
        // Outside Bounds
        // expect(bounds.intersect(-11, -1))
        //   .toEqual({ intersect: -10, reflection: 1, distance: 1 });
        // expect(bounds.intersect(-11, 1))
        //   .toEqual({ intersect: 10, reflection: -1, distance: 21 });
        // expect(bounds.intersect(11, -1))
        //   .toEqual({ intersect: -10, reflection: 1, distance: 21 });
        // expect(bounds.intersect(11, 1))
        //   .toEqual({ intersect: 10, reflection: -1, distance: 1 });
      });
    });
    describe('Bounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(null, 10);
      });
      describe('Contains', () => {
        test('Very low', () => {
          expect(bounds.contains(-1000000)).toBe(true);
        });
        test('Low', () => {
          expect(bounds.contains(0)).toBe(true);
        });
        test('Max boundary', () => {
          expect(bounds.contains(10)).toBe(true);
        });
        test('Higher', () => {
          expect(bounds.contains(11)).toBe(false);
        });
      });
      describe('Clip', () => {
        test('Inside', () => {
          expect(bounds.clip(3)).toBe(3);
        });
        test('Low', () => {
          expect(bounds.clip(-100)).toBe(-100);
        });
        test('Max', () => {
          expect(bounds.clip(10)).toBe(10);
        });
        test('High', () => {
          expect(bounds.clip(11)).toBe(10);
        });
      });
    });
    describe('Unbounded max, bounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(-10, null);
      });
      describe('Contains', () => {
        test('Lower', () => {
          expect(bounds.contains(-11)).toBe(false);
        });
        test('Min Boundary', () => {
          expect(bounds.contains(-10)).toBe(true);
        });
        test('High', () => {
          expect(bounds.contains(0)).toBe(true);
        });
        test('Higher', () => {
          expect(bounds.contains(100000)).toBe(true);
        });
      });
      describe('Clip', () => {
        test('Inside', () => {
          expect(bounds.clip(3)).toBe(3);
        });
        test('High', () => {
          expect(bounds.clip(100)).toBe(100);
        });
        test('Min', () => {
          expect(bounds.clip(-10)).toBe(-10);
        });
        test('Low', () => {
          expect(bounds.clip(-11)).toBe(-10);
        });
      });
    });
    describe('Unbounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds(null, null);
      });
      describe('Contains', () => {
        test('Lower', () => {
          expect(bounds.contains(-10000)).toBe(true);
        });
        test('Low', () => {
          expect(bounds.contains(-10)).toBe(true);
        });
        test('High', () => {
          expect(bounds.contains(0)).toBe(true);
        });
        test('Higher', () => {
          expect(bounds.contains(100000)).toBe(true);
        });
      });
      describe('Clip', () => {
        test('Zero', () => {
          expect(bounds.clip(0)).toBe(0);
        });
        test('High', () => {
          expect(bounds.clip(100)).toBe(100);
        });
        test('Min', () => {
          expect(bounds.clip(-100)).toBe(-100);
        });
      });
    });
  });
});
