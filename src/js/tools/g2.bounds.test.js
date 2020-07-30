import {
  Point, Rect, Transform, getPoint,
  RectBounds, LineBounds, RangeBounds, TransformBounds, ValueBounds,
  clipAngle,
} from './g2';
import { round } from './math';

describe('Bounds', () => {
  // describe('Value Bounds', () => {
  //   test('Simple', () => {
  //     const bounds = new ValueBounds(4);
  //     expect(bounds.boundary).toBe(4);
  //   });
  // });
  let bounds;
  describe('Range Bounds', () => {
    describe('Construction', () => {
      afterEach(() => {
        expect(bounds.boundary.min).toBe(-10);
        expect(bounds.boundary.max).toBe(10);
        expect(bounds.precision).toBe(5);
      });
      test('Array', () => {
        bounds = new RangeBounds([-10, 10], 5);
      });
      test('values', () => {
        bounds = new RangeBounds(-10, 10, 5);
      });
    });
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
  describe('Rect Bounds', () => {
    describe('Construction', () => {
      describe('Finite', () => {
        afterEach(() => {
          expect(bounds.boundary.left).toBe(-10);
          expect(bounds.boundary.bottom).toBe(-9);
          expect(bounds.boundary.right).toBe(8);
          expect(bounds.boundary.top).toBe(7);
          expect(bounds.precision).toBe(5);
        });
        test('Array', () => {
          bounds = new RectBounds([-10, -9, 8, 7], 5);
        });
        test('values', () => {
          bounds = new RectBounds(-10, -9, 8, 7, 5);
        });
      });
      describe('Infinite Right', () => {
        afterEach(() => {
          expect(bounds.boundary.left).toBe(-10);
          expect(bounds.boundary.bottom).toBe(-9);
          expect(bounds.boundary.right).toBe(null);
          expect(bounds.boundary.top).toBe(7);
          expect(bounds.precision).toBe(5);
        });
        test('Array', () => {
          bounds = new RectBounds([-10, -9, null, 7], 5);
        });
        test('values', () => {
          bounds = new RectBounds(-10, -9, null, 7, 5);
        });
      });
      describe('Infinite Left and Right', () => {
        afterEach(() => {
          expect(bounds.boundary.left).toBe(null);
          expect(bounds.boundary.bottom).toBe(-9);
          expect(bounds.boundary.right).toBe(null);
          expect(bounds.boundary.top).toBe(7);
          expect(bounds.precision).toBe(5);
        });
        test('Array', () => {
          bounds = new RectBounds([null, -9, null, 7], 5);
        });
        test('values', () => {
          bounds = new RectBounds(null, -9, null, 7, 5);
        });
      });
    });
    describe('Bounded Left, Right, Bottom, Top', () => {
      beforeEach(() => {
        bounds = new RectBounds(-10, -10, 10, 10);
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([10, -10])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(false);
        expect(bounds.contains([10, 11])).toBe(false);
      });
      test('Contains number - should be false', () => {
        expect(bounds.contains(0)).toBe(false);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-10, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -10])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -10])).toEqual(new Point(10, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      test('Clip Value', () => {
        expect(bounds.clip(100)).toBe(100);
      });
      describe('Intersect', () => {
        let check;
        beforeEach(() => {
          check = (p, dir, i, r, d) => {
            const result = bounds.intersect(p, dir);
            if (i == null) {
              expect(result.intersect).toBe(null);
              // return;
            } else {
              expect(result.intersect.round(3)).toEqual(getPoint(i).round(3));
            }
            expect(round(clipAngle(result.reflection, '-180to180'), 3)).toBe(round(clipAngle(r, '-180to180'), 3));
            expect(round(result.distance, 3)).toBe(round(d, 3));
          };
        });
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);

          // From origin corner
          check([0, 0], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 10 * Math.sqrt(2));
          check([0, 0], 3 * Math.PI / 4, [-10, 10], Math.PI / 4 * 7, 10 * Math.sqrt(2));
          check([0, 0], 5 * Math.PI / 4, [-10, -10], Math.PI / 4 * 1, 10 * Math.sqrt(2));
          check([0, 0], 7 * Math.PI / 4, [10, -10], Math.PI / 4 * 3, 10 * Math.sqrt(2));

          // From origin 30º
          check(
            [0, 0], Math.PI / 6, [10, Math.tan(Math.PI / 6) * 10],
            Math.PI / 6 * 5, 10 / Math.cos(Math.PI / 6),
          );
          check(
            [0, 0], 5 * Math.PI / 6, [-10, Math.tan(Math.PI / 6) * 10],
            Math.PI / 6, 10 / Math.cos(Math.PI / 6),
          );
          check(
            [0, 0], 7 * Math.PI / 6, [-10, -Math.tan(Math.PI / 6) * 10],
            Math.PI / 6 * -1, 10 / Math.cos(Math.PI / 6),
          );
          check(
            [0, 0], 11 * Math.PI / 6, [10, -Math.tan(Math.PI / 6) * 10],
            Math.PI / 6 * 7, 10 / Math.cos(Math.PI / 6),
          );

          // From -1, -1
          check([-1, -1], 0, [10, -1], Math.PI, 11);
          check([-1, -1], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 11 * Math.sqrt(2));
          check(
            [-1, -1], 7 * Math.PI / 6, [-10, -1 - Math.tan(Math.PI / 6) * 9],
            Math.PI / 6 * -1, 9 / Math.cos(Math.PI / 6),
          );
        });
        test('Edges of bounds', () => {
          // Trajectory going out
          check([10, 0], 0, [10, 0], Math.PI, 0);
          check([-10, 3], Math.PI / 4 * 3, [-10, 3], Math.PI / 4, 0);
          check([-10, -10], Math.PI / 6 * 7, [-10, -10], Math.PI / 6, 0);

          // Trajectory along
          check([10, 0], Math.PI / 2, [10, 0], Math.PI / 2, 0);
          check([-10, 0], -Math.PI / 2, [-10, 0], -Math.PI / 2, 0);
          check([0, 10], -Math.PI, [0, 10], -Math.PI, 0);
          check([0, -10], Math.PI, [0, -10], Math.PI, 0);

          // Trajectory going in
          check([10, 0], Math.PI, [10, 0], 0, 0);
          check([-10, 3], Math.PI / 4, [-10, 3], Math.PI / 4 * 3, 0);
          check([-10, -10], Math.PI / 6, [-10, -10], Math.PI / 6 * 7, 0);
        });
        test('Outside bounds no intersection', () => {
          check([11, 0], 0, null, 0, 0);
          check([11, 0], Math.PI / 2, null, Math.PI / 2, 0);
          check([-10.1, -10.1], Math.PI * 1.1, null, Math.PI * 1.1, 0);
        });
        test('Outside bounds intersection', () => {
          check([11, 0], Math.PI, [10, 0], 0, 1);
          check([11, 0], Math.PI / 4 * 3, [10, 1], Math.PI / 4, Math.sqrt(2));
          check([-11, -11], Math.PI / 4, [-10, -10], Math.PI / 4 * 5, Math.sqrt(2));
        });
      });
    });
  });
});
