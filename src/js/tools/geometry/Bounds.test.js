import { Point, getPoint } from './Point';
import { Transform } from './Transform';
import { Line } from './Line';
import { Plane, getPlane } from './Plane';
import {
  RectBounds, LineBounds, RangeBounds, TransformBounds, getBounds,
  RectBoundsNew,
} from './Bounds';
import { clipAngle } from './angle';
import { round } from '../math';

describe('Bounds', () => {
  let bounds;
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
  describe.only('Rect New Bounds', () => {
    describe('Construction', () => {
      test('XY Plane direction vectors', () => {
        bounds = new RectBoundsNew({
          position: [1, 1, 0],
          rightDirection: [2, 0, 0],
          topDirection: [0, 2, 0],
          left: 2,
          right: 3,
          top: 4,
          bottom: 5,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[1, 1, 0], [0, 0, 1]]));
        expect(bounds.position).toEqual(new Point(1, 1, 0));
        expect(bounds.topDirection).toEqual(new Point(0, 1, 0));
        expect(bounds.rightDirection).toEqual(new Point(1, 0, 0));
        expect(bounds.left).toBe(2);
        expect(bounds.right).toBe(3);
        expect(bounds.top).toBe(4);
        expect(bounds.bottom).toBe(5);
        expect(bounds.boundary.left).toEqual(new Line([-1, -4, 0], [-1, 5, 0]));
        expect(bounds.boundary.right).toEqual(new Line([4, -4, 0], [4, 5, 0]));
        expect(bounds.boundary.top).toEqual(new Line([-1, 5, 0], [4, 5, 0]));
        expect(bounds.boundary.bottom).toEqual(new Line([-1, -4, 0], [4, -4, 0]));
      });
      test('YZ Plane top direction', () => {
        bounds = new RectBoundsNew({
          position: [0, 0, 0],
          topDirection: [0, 2, 0],
          normal: [2, 0, 0],
          left: 1,
          right: 1,
          top: 1,
          bottom: 1,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[0, 0, 0], [1, 0, 0]]));
        expect(bounds.position).toEqual(new Point(0, 0, 0));
        expect(bounds.topDirection.round()).toEqual(new Point(0, 1, 0));
        expect(bounds.rightDirection.round()).toEqual(new Point(0, 0, -1));
        expect(bounds.left).toBe(1);
        expect(bounds.right).toBe(1);
        expect(bounds.top).toBe(1);
        expect(bounds.bottom).toBe(1);
        expect(bounds.boundary.left).toEqual(new Line([0, -1, 1], [0, 1, 1]));
        expect(bounds.boundary.right).toEqual(new Line([0, -1, -1], [0, 1, -1]));
        expect(bounds.boundary.top).toEqual(new Line([0, 1, 1], [0, 1, -1]));
        expect(bounds.boundary.bottom).toEqual(new Line([0, -1, 1], [0, -1, -1]));
      });
      test('XZ Plane right direction offset y', () => {
        bounds = new RectBoundsNew({
          position: [0, 1, 0],
          rightDirection: [2, 0, 0],
          normal: [0, 2, 0],
          left: 1,
          right: 1,
          top: 1,
          bottom: 1,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[0, 1, 0], [0, 1, 0]]));
        expect(bounds.position).toEqual(new Point(0, 1, 0));
        expect(bounds.topDirection.round()).toEqual(new Point(0, 0, -1));
        expect(bounds.rightDirection.round()).toEqual(new Point(1, 0, 0));
        expect(bounds.left).toBe(1);
        expect(bounds.right).toBe(1);
        expect(bounds.top).toBe(1);
        expect(bounds.bottom).toBe(1);
        expect(bounds.boundary.left).toEqual(new Line([-1, 1, 1], [-1, 1, -1]));
        expect(bounds.boundary.right).toEqual(new Line([1, 1, 1], [1, 1, -1]));
        expect(bounds.boundary.top).toEqual(new Line([-1, 1, -1], [1, 1, -1]));
        expect(bounds.boundary.bottom).toEqual(new Line([-1, 1, 1], [1, 1, 1]));
      });
    });
    describe('Duplication', () => {
      test('All Values', () => {
        bounds = new RectBoundsNew({
          position: [1, 1, 0],
          rightDirection: [2, 0, 0],
          topDirection: [0, 2, 0],
          left: 2,
          right: 3,
          top: 4,
          bottom: 5,
        });
        const dup = bounds._dup();
        expect(dup.round()).toEqual(bounds.round());
        expect(dup).not.toBe(bounds);
      });
    });
    describe('Contains', () => {
      describe('XY Plane', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
        });
        test('Inside', () => {
          expect(bounds.contains([0, 0, 0])).toBe(true);
          expect(bounds.contains([0.1, 0, 0])).toBe(true);
          expect(bounds.contains([0.1, 0.1, 0])).toBe(true);
          expect(bounds.contains([0.1, -0.1, 0])).toBe(true);
          expect(bounds.contains([-0.1, -0.1, 0])).toBe(true);
        });
        test('On Border', () => {
          expect(bounds.contains([1, 0, 0])).toBe(true);
          expect(bounds.contains([-1, 0, 0])).toBe(true);
          expect(bounds.contains([0, 1, 0])).toBe(true);
          expect(bounds.contains([0, -1, 0])).toBe(true);
          expect(bounds.contains([1, 1, 0])).toBe(true);
          expect(bounds.contains([1, -1, 0])).toBe(true);
          expect(bounds.contains([-1, -1, 0])).toBe(true);
          expect(bounds.contains([-1, 1, 0])).toBe(true);
        });
        test('Outside', () => {
          expect(bounds.contains([1.1, 0, 0])).toBe(false);
          expect(bounds.contains([-1.1, 0, 0])).toBe(false);
          expect(bounds.contains([0, 1.1, 0])).toBe(false);
          expect(bounds.contains([0, -1.1, 0])).toBe(false);
          expect(bounds.contains([1.1, 1.1, 0])).toBe(false);
          expect(bounds.contains([1.1, -1.1, 0])).toBe(false);
          expect(bounds.contains([-1.1, -1.1, 0])).toBe(false);
          expect(bounds.contains([-1.1, 1.1, 0])).toBe(false);
        });
        test('Off Plane - will use projection', () => {
          // Inside
          expect(bounds.contains([0.5, 0.5, 10])).toBe(true);
          expect(bounds.contains([-0.5, 0.5, 10])).toBe(true);
          expect(bounds.contains([0.5, -0.5, 10])).toBe(true);
          expect(bounds.contains([-0.5, -0.5, 10])).toBe(true);
          expect(bounds.contains([0.5, 0.5, -10])).toBe(true);
          expect(bounds.contains([0.5, -0.5, -10])).toBe(true);
          expect(bounds.contains([-0.5, 0.5, -10])).toBe(true);
          expect(bounds.contains([-0.5, -0.5, -10])).toBe(true);
          // On
          expect(bounds.contains([-1, 0, -10])).toBe(true);
          // Outside
          expect(bounds.contains([1.1, 0.5, 10])).toBe(false);
        });
      });
      describe('XY Plane Reverse Normal', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, -2, 0],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
        });
        test('Inside', () => {
          expect(bounds.contains([0, 0, 0])).toBe(true);
          expect(bounds.contains([0.1, 0, 0])).toBe(true);
          expect(bounds.contains([0.1, 0.1, 0])).toBe(true);
          expect(bounds.contains([0.1, -0.1, 0])).toBe(true);
          expect(bounds.contains([-0.1, -0.1, 0])).toBe(true);
        });
        test('On Border', () => {
          expect(bounds.contains([1, 0, 0])).toBe(true);
          expect(bounds.contains([-1, 0, 0])).toBe(true);
          expect(bounds.contains([0, 1, 0])).toBe(true);
          expect(bounds.contains([0, -1, 0])).toBe(true);
          expect(bounds.contains([1, 1, 0])).toBe(true);
          expect(bounds.contains([1, -1, 0])).toBe(true);
          expect(bounds.contains([-1, -1, 0])).toBe(true);
          expect(bounds.contains([-1, 1, 0])).toBe(true);
        });
        test('Outside', () => {
          expect(bounds.contains([1.1, 0, 0])).toBe(false);
          expect(bounds.contains([-1.1, 0, 0])).toBe(false);
          expect(bounds.contains([0, 1.1, 0])).toBe(false);
          expect(bounds.contains([0, -1.1, 0])).toBe(false);
          expect(bounds.contains([1.1, 1.1, 0])).toBe(false);
          expect(bounds.contains([1.1, -1.1, 0])).toBe(false);
          expect(bounds.contains([-1.1, -1.1, 0])).toBe(false);
          expect(bounds.contains([-1.1, 1.1, 0])).toBe(false);
        });
      });
      describe('Offset XZ Plane', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [1, 1, 1],
            rightDirection: [2, 0, 0],
            topDirection: [0, 0, -2],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
        });
        test('Inside', () => {
          expect(bounds.contains([0, 1, 0])).toBe(true);
          expect(bounds.contains([0.5, 1, 0])).toBe(true);
          expect(bounds.contains([1, 0.1, 0.1])).toBe(true);
          expect(bounds.contains([0.1, 1, 1.5])).toBe(true);
          expect(bounds.contains([1.0, 1, 1.9])).toBe(true);
        });
        test('On Border', () => {
          expect(bounds.contains([0, 1, 0])).toBe(true);
          expect(bounds.contains([2, 1, 0])).toBe(true);
          expect(bounds.contains([2, 1, 2])).toBe(true);
          expect(bounds.contains([0, 1, 2])).toBe(true);
          expect(bounds.contains([2, 1, 1])).toBe(true);
          expect(bounds.contains([0, 1, 1])).toBe(true);
          expect(bounds.contains([1, 1, 2])).toBe(true);
          expect(bounds.contains([1, 1, 0])).toBe(true);
        });
        test('Off Plane tested', () => {
          expect(bounds.contains([0, 0.9, 0], false)).toBe(false);
          expect(bounds.contains([0.5, 0, 0], false)).toBe(false);
          expect(bounds.contains([1, 0.1, 0.1], false)).toBe(false);
          expect(bounds.contains([0.1, -10, 1.5], false)).toBe(false);
          expect(bounds.contains([1.0, 1.2, 1.9], false)).toBe(false);
        });
        test('Outside', () => {
          expect(bounds.contains([2.1, 1, 0])).toBe(false);
          expect(bounds.contains([-0.1, 1, 0])).toBe(false);
          expect(bounds.contains([0, 1, 2.1])).toBe(false);
          expect(bounds.contains([0, 1, -0.1])).toBe(false);
          expect(bounds.contains([2.1, 1, -0.1])).toBe(false);
          expect(bounds.contains([-0.1, 1, 2.1])).toBe(false);
        });
        test('Off Plane - will use projection', () => {
          // Inside
          expect(bounds.contains([0, 0, 0])).toBe(true);
          expect(bounds.contains([0.5, 10, 0])).toBe(true);
          expect(bounds.contains([1, 0.1, 0.1])).toBe(true);
          expect(bounds.contains([0.1, -10, 1.5])).toBe(true);
          expect(bounds.contains([1.0, 0.4, 1.9])).toBe(true);
          // On
          expect(bounds.contains([2, -1, 2])).toBe(true);
          // Outside
          expect(bounds.contains([-0.1, 0, 2.1])).toBe(false);
        });
      });
    });
    describe('Clip', () => {
      let clip;
      beforeEach(() => {
        clip = p => bounds.clip(p).round();
      });
      describe('XY Plane', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 1,
            right: 2,
            top: 3,
            bottom: 4,
          });
        });
        test('inside ', () => {
          expect(clip([0, 0, 0])).toEqual(new Point(0, 0, 0));
          expect(clip([0.1, 0.2, 0])).toEqual(new Point(0.1, 0.2, 0));
        });
        test('outside', () => {
          expect(clip([2.1, 0, 0])).toEqual(new Point(2, 0, 0));
          expect(clip([-1.1, 0, 0])).toEqual(new Point(-1, 0, 0));
          expect(clip([0, 3.1, 0])).toEqual(new Point(0, 3, 0));
          expect(clip([0, -4.1, 0])).toEqual(new Point(0, -4, 0));

          expect(clip([2.1, 0.1, 0])).toEqual(new Point(2, 0.1, 0));
          expect(clip([1.9, 3.1, 0])).toEqual(new Point(1.9, 3, 0));

          expect(clip([2.1, 3.1, 0])).toEqual(new Point(2, 3, 0));
          expect(clip([-1.1, 3.1, 0])).toEqual(new Point(-1, 3, 0));
          expect(clip([-1.1, -4.1, 0])).toEqual(new Point(-1, -4, 0));
          expect(clip([2.1, -4.1, 0])).toEqual(new Point(2, -4, 0));
        });
        test('off plane inside', () => {
          expect(clip([0, 0, 1])).toEqual(new Point(0, 0, 0));
          expect(clip([0.1, 0.2, -1])).toEqual(new Point(0.1, 0.2, 0));
        });
        test('off plane outside', () => {
          expect(clip([2.1, 0, 0.1])).toEqual(new Point(2, 0, 0));
          expect(clip([-1.1, 0, -10])).toEqual(new Point(-1, 0, 0));
          expect(clip([-1.1, -4.1, 1])).toEqual(new Point(-1, -4, 0));
          expect(clip([2.1, -4.1, -0.5])).toEqual(new Point(2, -4, 0));
        });
      });
      describe('Offset XZ Plane', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [1, 1, 1],
            rightDirection: [2, 0, 0],
            topDirection: [0, 0, -2],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
        });
        test('inside ', () => {
          expect(clip([0, 1, 0])).toEqual(new Point(0, 1, 0));
          expect(clip([0, 1, 0])).toEqual(new Point(0, 1, 0));
          expect(clip([0.1, 1, 0.2]).round()).toEqual(new Point(0.1, 1, 0.2));
        });
        test('outside', () => {
          expect(clip([-0.1, 0, 0])).toEqual(new Point(0, 1, 0));
          expect(clip([-0.1, 0, -1])).toEqual(new Point(0, 1, 0));
          expect(clip([0, 1, -1])).toEqual(new Point(0, 1, 0));
          expect(clip([0, 1, 3])).toEqual(new Point(0, 1, 2));
          expect(clip([2.1, 1, 3])).toEqual(new Point(2, 1, 2));
          expect(clip([2.1, 1, -1])).toEqual(new Point(2, 1, 0));
        });
        test('off plane inside', () => {
          expect(clip([0, 0, 0])).toEqual(new Point(0, 1, 0));
          expect(clip([0.1, 0.2, 2])).toEqual(new Point(0.1, 1, 2));
        });
        test('off plane outside', () => {
          expect(clip([2.1, 0, -0.1])).toEqual(new Point(2, 1, 0));
          expect(clip([-1.1, 1.1, -10])).toEqual(new Point(0, 1, 0));
          expect(clip([3, -4.1, 2.5])).toEqual(new Point(2, 1, 2));
          expect(clip([2.1, -4.1, -0.5])).toEqual(new Point(2, 1, 0));
        });
      });
    });
    describe('Intersect', () => {
      let intersect;
      describe('XY Plane', () => {
        beforeEach(() => {
          bounds = new RectBoundsNew({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
          intersect = (position, direction) => {
            const result = bounds.intersect(position, direction);
            const out = [];
            if (result.intersect == null) {
              out.push(null);
            } else {
              out.push(result.intersect.round(3).toArray());
            }
            out.push(round(result.distance, 3));
            out.push(result.reflection.round(3).toArray());
            return out;
          };
        });
        describe('Right Bound', () => {
          test('Inside normal direction on boundary', () => {
            expect(intersect([0, 0, 0], [1, 0, 0])).toEqual([
              [1, 0, 0], 1, [-1, 0, 0],
            ]);
          });
          test('Inside normal', () => {
            expect(intersect([0, 0, 0], [0.5, 0, 0])).toEqual([
              [1, 0, 0], 1, [-1, 0, 0],
            ]);
          });
          test('26 inside', () => {
            expect(intersect([0.9, -0.05, 0], [1, 0.5, 0])).toEqual([
              [1, 0, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [-0.894, 0.447, 0],
            ]);
          });
          test('45º inside', () => {
            expect(intersect([0.9, -0.1, 0], [1, 1, 0])).toEqual([
              [1, 0, 0], round(0.1 * Math.sqrt(2), 3), [-0.707, 0.707, 0],
            ]);
          });
          test('63º inside', () => {
            expect(intersect([0.9, 0.2, 0], [1, -2, 0])).toEqual([
              [1, 0, 0],
              round(Math.sqrt(0.1 * 0.1 + 0.2 * 0.2), 3),
              [-0.447, -0.894, 0],
            ]);
          });
          test('84º inside', () => {
            expect(intersect([0.99, 0.1, 0], [1, 10, 0])).toEqual([
              [1, 0.2, 0],
              round(Math.sqrt(0.01 ** 2 + 0.1 ** 2), 3),
              [-0.1, 0.995, 0],
            ]);
          });
          test('On Border', () => {
            expect(intersect([1, 0, 0], [1, 1, 0])).toEqual([
              [1, 0, 0], 0, [-0.707, 0.707, 0],
            ]);
          });
          test('Outside Border going out', () => {
            expect(intersect([1.1, 0, 0], [1, 0, 0])).toEqual([
              [1, 0, 0], 0, [-1, 0, 0],
            ]);
          });
          test('Outside Border going in', () => {
            expect(intersect([1.1, 0, 0], [-1, 0, 0])).toEqual([
              [-1, 0, 0], 2, [1, 0, 0],
            ]);
          });
        });
      });
    });
  });
  describe('Range Bounds', () => {
    describe('Construction', () => {
      afterEach(() => {
        expect(bounds.boundary.min).toBe(-10);
        expect(bounds.boundary.max).toBe(10);
        expect(bounds.precision).toBe(5);
        expect(bounds.bounds).toBe('inside');
      });
      test('Array', () => {
        bounds = new RangeBounds({ min: -10, max: 10, precision: 5 });
      });
    });
    describe('Duplication', () => {
      test('All Values', () => {
        bounds = new RangeBounds({
          min: -10, max: 10, precision: 5, bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
      test('min null', () => {
        bounds = new RangeBounds({
          min: null, max: 10, precision: 5, bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('State', () => {
      test('All Values', () => {
        bounds = new RangeBounds({
          min: -10, max: 10, precision: 5, bounds: 'outside',
        });
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('Bounded max and min - Inside Bounds', () => {
      beforeEach(() => {
        bounds = new RangeBounds({ min: -10, max: 10 });
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
        // Outside Bounds, no intersection
        expect(bounds.intersect(-11, -1))
          .toEqual({ intersect: null, reflection: -1, distance: 0 });
        expect(bounds.intersect(11, 1))
          .toEqual({ intersect: null, reflection: 1, distance: 0 });
        // Outside Bounds intersection
        expect(bounds.intersect(-11, 1))
          .toEqual({ intersect: -10, reflection: -1, distance: 1 });
        expect(bounds.intersect(11, -1))
          .toEqual({ intersect: 10, reflection: 1, distance: 1 });
      });
    });
    describe('Bounded max and min - Outside Bounds', () => {
      beforeEach(() => {
        bounds = new RangeBounds({ min: -10, max: 10, bounds: 'outside' });
      });
      test('Intersect Value', () => {
        // Edges of bounds
        expect(bounds.intersect(10, 1))
          .toEqual({ intersect: null, reflection: 1, distance: 0 });
        expect(bounds.intersect(10, -1))
          .toEqual({ intersect: 10, reflection: 1, distance: 0 });
        expect(bounds.intersect(-10, 1))
          .toEqual({ intersect: -10, reflection: -1, distance: 0 });
        expect(bounds.intersect(-10, -1))
          .toEqual({ intersect: null, reflection: -1, distance: 0 });
      });
    });
    describe('Bounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds({ min: null, max: 10 });
      });
      test('Contains', () => {
        expect(bounds.contains(-1000000)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(10)).toBe(true);
        expect(bounds.contains(11)).toBe(false);
        // expect(bounds.contains([0, 0])).toBe(false);
        // expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Contains Point', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([10, 10])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([-10, 10])).toBe(true);
        expect(bounds.contains([-11, 10])).toBe(true);
        expect(bounds.contains([-10, 11])).toBe(false);
        expect(bounds.contains([-11, 11])).toBe(false);
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
        expect(bounds.intersect(3, -1))
          .toEqual({ intersect: null, reflection: -1, distance: 0 });
        // Outside bounds intersect
        expect(bounds.intersect(11, -1))
          .toEqual({ intersect: 10, reflection: 1, distance: 1 });
        // Outside bounds no intersect
        expect(bounds.intersect(11, 1))
          .toEqual({ intersect: null, reflection: 1, distance: 0 });
      });
    });
    describe('Unbounded max, bounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds({ min: -10, max: null });
      });
      test('Contains', () => {
        expect(bounds.contains(-11)).toBe(false);
        expect(bounds.contains(-10)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(100000)).toBe(true);
        // expect(bounds.contains([0, 0])).toBe(false);
        // expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Contains Point', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([10, 10])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([-10, 10])).toBe(true);
        expect(bounds.contains([-11, 10])).toBe(false);
        expect(bounds.contains([-10, 11])).toBe(true);
        expect(bounds.contains([-11, 11])).toBe(false);
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
        expect(bounds.intersect(3, 1))
          .toEqual({ intersect: null, reflection: 1, distance: 0 });
        // Outside bounds intersect
        expect(bounds.intersect(-11, 1))
          .toEqual({ intersect: -10, reflection: -1, distance: 1 });
        // Outside bounds no intersect
        expect(bounds.intersect(-11, -1))
          .toEqual({ intersect: null, reflection: -1, distance: 0 });
      });
    });
    describe('Unbounded max, unbounded min', () => {
      beforeEach(() => {
        bounds = new RangeBounds({ min: null, max: null });
      });
      test('Contains', () => {
        expect(bounds.contains(-10000)).toBe(true);
        expect(bounds.contains(-10)).toBe(true);
        expect(bounds.contains(0)).toBe(true);
        expect(bounds.contains(100000)).toBe(true);
        // expect(bounds.contains([0, 0])).toBe(false);
        // expect(bounds.contains(new Point(0, 0))).toBe(false);
      });
      test('Contains Point', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([10, 10])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([-10, 10])).toBe(true);
        expect(bounds.contains([-11, 10])).toBe(true);
        expect(bounds.contains([-10, 11])).toBe(true);
        expect(bounds.contains([-11, 11])).toBe(true);
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
        expect(bounds.intersect(3, 1))
          .toEqual({ intersect: null, reflection: 1, distance: 0 });
        expect(bounds.intersect(3, -1))
          .toEqual({ intersect: null, reflection: -1, distance: 0 });
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
          expect(bounds.bounds).toBe('outside');
        });
        test('Array', () => {
          // bounds = new RectBounds([-10, -9, 8, 7], 5);
          bounds = new RectBounds({
            left: -10, bottom: -9, right: 8, top: 7, bounds: 'outside', precision: 5,
          });
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
          // bounds = new RectBounds([-10, -9, null, 7], 5);
          bounds = new RectBounds({
            left: -10, bottom: -9, right: null, top: 7, precision: 5,
          });
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
          // bounds = new RectBounds([null, -9, null, 7], 5);
          bounds = new RectBounds({
            left: null, bottom: -9, right: null, top: 7, precision: 5,
          });
        });
      });
    });
    describe('Duplication', () => {
      test('All Values', () => {
        bounds = new RectBounds({
          left: -10,
          bottom: -11,
          right: 8,
          top: 9,
          precision: 5,
          bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
      test('min null', () => {
        bounds = new RectBounds({
          left: null,
          bottom: -11,
          right: 8,
          top: null,
          precision: 5,
          bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('State', () => {
      test('All Values', () => {
        bounds = new RangeBounds({
          left: -10,
          bottom: -11,
          right: 8,
          top: 9,
          precision: 5,
          bounds: 'outside',
        });
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('Bounded Left, Right, Bottom, Top', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: -10, right: 10, top: 10,
        });
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
        describe('Edges of bounds', () => {
          test('Direction inside from border to opposite border', () => {
            check([-10, 0], 0, [10, 0], Math.PI, 20);
            check([10, 0], Math.PI, [-10, 0], 0, 20);
            check([0, -10], Math.PI / 2, [0, 10], -Math.PI / 2, 20);
            check([0, 10], -Math.PI / 2, [0, -10], Math.PI / 2, 20);

            // Direction inside from border to adjacent side
            check([-10, 0], Math.PI / 4, [0, 10], -Math.PI / 4, 10 * Math.sqrt(2));
            check([10, 0], 5 * Math.PI / 4, [0, -10], 3 * Math.PI / 4, 10 * Math.sqrt(2));
            check([0, -10], Math.PI / 4, [10, 0], 3 * Math.PI / 4, 10 * Math.sqrt(2));
            check([0, 10], 5 * Math.PI / 4, [-10, 0], 7 * Math.PI / 4, 10 * Math.sqrt(2));
          });

          test('Direction inside from corner to side', () => {
            const y = 20 * Math.tan(Math.PI / 6);
            const d = 20 / Math.cos(Math.PI / 6);
            check([-10, -10], Math.PI / 6, [10, y - 10], 5 * Math.PI / 6, d);
            check([-10, 10], -Math.PI / 6, [10, 10 - y], 7 * Math.PI / 6, d);
            check([10, 10], 7 * Math.PI / 6, [-10, 10 - y], 11 * Math.PI / 6, d);
            check([10, -10], 5 * Math.PI / 6, [-10, -10 + y], 1 * Math.PI / 6, d);
          });

          test('Direction along from corner', () => {
            check([-10, -10], Math.PI / 2, [-10, 10], -Math.PI / 2, 20);
            check([-10, -10], 0, [10, -10], Math.PI, 20);
            check([-10, 10], -Math.PI / 2, [-10, -10], Math.PI / 2, 20);
            check([-10, 10], 0, [10, 10], Math.PI, 20);
            check([10, 10], -Math.PI / 2, [10, -10], Math.PI / 2, 20);
            check([10, 10], Math.PI, [-10, 10], 0, 20);
            check([10, -10], Math.PI / 2, [10, 10], -Math.PI / 2, 20);
            check([10, -10], Math.PI, [-10, -10], 0, 20);
          });

          test('Direction inside from corner to corner', () => {
            check([-10, -10], Math.PI / 4, [10, 10], 5 * Math.PI / 4, 20 * Math.sqrt(2));
          });

          test('Direction outside from corner', () => {
            check([-10, -10], 5 * Math.PI / 4, [-10, -10], Math.PI / 4, 0);
          });

          test('Direction outside', () => {
            check([10, 0], 0, [10, 0], Math.PI, 0);
            check([-10, 3], Math.PI / 4 * 3, [-10, 3], Math.PI / 4, 0);
            check([-10, -10], Math.PI / 6 * 7, [-10, -10], Math.PI / 6, 0);
          });

          test('Direction along', () => {
            check([10, 0], Math.PI / 2, [10, 10], -Math.PI / 2, 10);
            check([-10, 0], -Math.PI / 2, [-10, -10], Math.PI / 2, 10);
            check([0, 10], Math.PI, [-10, 10], 0, 10);
            check([0, -10], 0, [10, -10], Math.PI, 10);
          });
        });
        describe('Edges of outside bounds', () => {
          beforeEach(() => {
            bounds.bounds = 'outside';
          });
          test('Direction inside', () => {
            check([-10, 0], 0, [-10, 0], Math.PI, 0);
            check([10, 0], Math.PI, [10, 0], 0, 0);
            check([0, -10], Math.PI / 2, [0, -10], -Math.PI / 2, 0);
            check([0, 10], -Math.PI / 2, [0, 10], Math.PI / 2, 0);
          });

          test('Direction inside from corner', () => {
            check([-10, -10], Math.PI / 6, [-10, -10], 7 * Math.PI / 6, 0);
            check([-10, 10], -Math.PI / 6, [-10, 10], 5 * Math.PI / 6, 0);
            check([10, 10], 7 * Math.PI / 6, [10, 10], 1 * Math.PI / 6, 0);
            check([10, -10], 5 * Math.PI / 6, [10, -10], 11 * Math.PI / 6, 0);
          });

          test('Direction along', () => {
            check([10, 0], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([0, 10], Math.PI, null, Math.PI, 0);
            check([0, -10], 0, null, 0, 0);
          });

          test('Direction along from corner', () => {
            check([-10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, -10], 0, null, 0, 0);
            check([-10, 10], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([-10, 10], 0, null, 0, 0);
            check([10, 10], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([10, 10], Math.PI, null, Math.PI, 0);
            check([10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([10, -10], Math.PI, null, Math.PI, 0);
          });

          test('Direction outside', () => {
            check([10, 0], 0, null, 0, 0);
            check([-10, 0], Math.PI, null, Math.PI, 0);
            check([0, 10], Math.PI / 2, null, Math.PI / 2, 0);
            check([0, -10], -Math.PI / 2, null, -Math.PI / 2, 0);
          });

          test('Direction outside from corner', () => {
            check([-10, -10], 5 * Math.PI / 6, null, 5 * Math.PI / 6, 0);
            check([-10, 10], Math.PI / 6, null, Math.PI / 6, 0);
            check([10, 10], Math.PI / 6, null, Math.PI / 6, 0);
            check([10, -10], -Math.PI / 6, null, -Math.PI / 6, 0);
          });
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
    describe('Bounded Left, Right, Bottom, Unbounded Top', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: -10, right: 10, top: null,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([-10, -10])).toBe(true);
        expect(bounds.contains([10, -10])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(false);
        expect(bounds.contains([10, 11])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-10, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -10])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -10])).toEqual(new Point(10, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 11));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, null, Math.PI / 2, 0);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);

          // From origin corner
          check([0, 0], Math.PI / 4, [10, 10], Math.PI / 4 * 3, 10 * Math.sqrt(2));
          check([0, 0], 3 * Math.PI / 4, [-10, 10], Math.PI / 4 * 1, 10 * Math.sqrt(2));
          check([0, 0], 5 * Math.PI / 4, [-10, -10], Math.PI / 4 * 1, 10 * Math.sqrt(2));
          check([0, 0], 7 * Math.PI / 4, [10, -10], Math.PI / 4 * 3, 10 * Math.sqrt(2));

          // From -1, -1
          check([-1, -1], 0, [10, -1], Math.PI, 11);
          check([-1, -1], Math.PI / 2, null, Math.PI / 2, 0);
          check([-1, -1], Math.PI / 4, [10, 10], Math.PI / 4 * 3, 11 * Math.sqrt(2));
          check(
            [-1, -1], 7 * Math.PI / 6, [-10, -1 - Math.tan(Math.PI / 6) * 9],
            Math.PI / 6 * -1, 9 / Math.cos(Math.PI / 6),
          );
        });
        describe('Edges of bounds', () => {
          test('Trajectory going out', () => {
            check([10, 0], 0, [10, 0], Math.PI, 0);
            check([-10, 100], Math.PI / 4 * 3, [-10, 100], Math.PI / 4, 0);
            check([-10, -10], Math.PI / 6 * 7, [-10, -10], Math.PI / 6, 0);
          });

          test('Trajectory along', () => {
            check([10, 0], Math.PI / 2, null, Math.PI / 2, 0);
            check([10, 0], -Math.PI / 2, [10, -10], Math.PI / 2, 10);
            check([-10, 0], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, 0], -Math.PI / 2, [-10, -10], Math.PI / 2, 10);
            check([0, 10], Math.PI, [-10, 10], 0, 10);
            check([0, -10], Math.PI, [-10, -10], 0, 10);
          });

          test('Trajectory along corners', () => {
            check([-10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, -10], 0, [10, -10], Math.PI, 20);
            check([10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([10, -10], Math.PI, [-10, -10], 0, 20);
          });

          test('Trajectory going in', () => {
            check([10, 0], Math.PI, [-10, 0], 0, 20);
            check([-10, 100], Math.PI / 4, [10, 120], Math.PI / 4 * 3, 20 * Math.sqrt(2));
            check([-10, -10], Math.PI / 4, [10, 10], Math.PI / 4 * 3, 20 * Math.sqrt(2));
          });
        });
        describe('Edges outside', () => {
          beforeEach(() => {
            bounds.bounds = 'outside';
          });
          test('Trajectory along', () => {
            check([10, 0], Math.PI / 2, null, Math.PI / 2, 0);
            check([10, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([-10, 0], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([0, -10], Math.PI, null, Math.PI, 0);
            check([0, -10], 0, null, 0, 0);
          });

          test('Trajectory along corners', () => {
            check([-10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([-10, -10], 0, null, 0, 0);
            check([10, -10], Math.PI / 2, null, Math.PI / 2, 0);
            check([10, -10], Math.PI, null, Math.PI, 0);
          });

          test('Trajectory inside', () => {
            check([10, 0], Math.PI, [10, 0], 0, 0);
            check([-10, 0], 0, [-10, 0], Math.PI, 0);
            check([0, -10], Math.PI / 2, [0, -10], -Math.PI / 2, 0);
          });

          test('Trajectory outside', () => {
            check([10, 0], 0, null, 0, 0);
            check([-10, 0], Math.PI, null, Math.PI, 0);
            check([0, -10], -Math.PI / 2, null, -Math.PI / 2, 0);
          });
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
          check([11, 100], Math.PI, [10, 100], 0, 1);
        });
      });
    });
    describe('Bounded Left, Right, Top, Unbounded Bottom', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: null, right: 10, top: 10,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([-10, -11])).toBe(true);
        expect(bounds.contains([10, -11])).toBe(true);
        expect(bounds.contains([11, -11])).toBe(false);
        expect(bounds.contains([10, 10])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-10, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([11, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, null, -Math.PI / 2, 0);

          // From origin corner
          check([0, 0], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 10 * Math.sqrt(2));
          check([0, 0], 3 * Math.PI / 4, [-10, 10], Math.PI / 4 * 7, 10 * Math.sqrt(2));
          check([0, 0], 5 * Math.PI / 4, [-10, -10], Math.PI / 4 * 7, 10 * Math.sqrt(2));
          check([0, 0], 7 * Math.PI / 4, [10, -10], Math.PI / 4 * 5, 10 * Math.sqrt(2));

          // From -1, -1
          check([-1, -1], 0, [10, -1], Math.PI, 11);
          check([-1, -1], -Math.PI / 2, null, -Math.PI / 2, 0);
          check([-1, -1], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 11 * Math.sqrt(2));
          check(
            [-1, -1], 7 * Math.PI / 6, [-10, -1 - Math.tan(Math.PI / 6) * 9],
            Math.PI / 6 * -1, 9 / Math.cos(Math.PI / 6),
          );
        });
        describe('Edges of bounds', () => {
          test('Trajectory going out', () => {
            check([10, 0], 0, [10, 0], Math.PI, 0);
            check([-10, 10], Math.PI / 4 * 3, [-10, 10], Math.PI / 4 * 7, 0);
            check([-10, -100], Math.PI / 6 * 7, [-10, -100], Math.PI / 6 * 11, 0);
          });

          test('Trajectory along', () => {
            check([10, 0], Math.PI / 2, [10, 10], -Math.PI / 2, 10);
            check([10, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([-10, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([-10, 0], Math.PI / 2, [-10, 10], -Math.PI / 2, 10);
            check([0, 10], 0, [10, 10], Math.PI, 10);
            check([0, 10], Math.PI, [-10, 10], 0, 10);
          });

          test('Trajectory along corners', () => {
            check([-10, 10], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([-10, 10], 0, [10, 10], Math.PI, 20);
            check([10, 10], -Math.PI / 2, null, -Math.PI / 2, 0);
            check([10, 10], Math.PI, [-10, 10], 0, 20);
          });

          test('Trajectory going in', () => {
            check([10, 0], Math.PI, [-10, 0], 0, 20);
            check([-10, -100], Math.PI / 4, [10, -80], Math.PI / 4 * 3, 20 * Math.sqrt(2));
            check([-10, 10], -Math.PI / 4, [10, -10], Math.PI / 4 * 5, 20 * Math.sqrt(2));
          });
        });
        test('Outside bounds no intersection', () => {
          check([11, 0], 0, null, 0, 0);
          check([11, 0], Math.PI / 2, null, Math.PI / 2, 0);
          check([10.1, 10.1], Math.PI * 0.9, null, Math.PI * 0.9, 0);
        });
        test('Outside bounds intersection', () => {
          check([11, 0], Math.PI, [10, 0], 0, 1);
          check([11, 0], Math.PI / 4 * 3, [10, 1], Math.PI / 4, Math.sqrt(2));
          check([-11, 11], Math.PI / 4 * 7, [-10, 10], Math.PI / 4 * 3, Math.sqrt(2));
          check([11, -100], Math.PI, [10, -100], 0, 1);
        });
      });
    });
    describe('Bounded Right, Top, Bottom, Unbounded Left', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: null, bottom: -10, right: 10, top: 10,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([-11, -10])).toBe(true);
        expect(bounds.contains([-11, -11])).toBe(false);
        expect(bounds.contains([10, -10])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(false);
        expect(bounds.contains([10, 10])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-11, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -11])).toEqual(new Point(10, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, null, Math.PI, 0);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);

          // From origin corner
          check([0, 0], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 10 * Math.sqrt(2));
          check([0, 0], 3 * Math.PI / 4, [-10, 10], Math.PI / 4 * 5, 10 * Math.sqrt(2));
          check([0, 0], 5 * Math.PI / 4, [-10, -10], Math.PI / 4 * 3, 10 * Math.sqrt(2));
          check([0, 0], 7 * Math.PI / 4, [10, -10], Math.PI / 4 * 3, 10 * Math.sqrt(2));

          // From -1, -1
          check([-1, -1], 0, [10, -1], Math.PI, 11);
          check([-1, -1], -Math.PI / 2, [-1, -10], Math.PI / 2, 9);
          check([-1, -1], Math.PI / 4, [10, 10], Math.PI / 4 * 5, 11 * Math.sqrt(2));
          check(
            [-1, -1], 7 * Math.PI / 6, [-1 - (9 / Math.tan(Math.PI / 6)), -10],
            Math.PI / 6 * 5, 9 / Math.sin(Math.PI / 6),
          );
        });
        describe('Edges of bounds', () => {
          test('Trajectory going out', () => {
            check([0, 10], Math.PI / 2, [0, 10], -Math.PI / 2, 0);
            check([0, -10], -Math.PI / 2, [0, -10], Math.PI / 2, 0);
            check([10, 0], 0, [10, 0], Math.PI, 0);
          });

          test('Trajectory along', () => {
            check([10, 0], Math.PI / 2, [10, 10], -Math.PI / 2, 10);
            check([10, 0], -Math.PI / 2, [10, -10], Math.PI / 2, 10);
            check([0, 10], 0, [10, 10], Math.PI, 10);
            check([0, 10], Math.PI, null, Math.PI, 0);
            check([0, -10], Math.PI, null, Math.PI, 0);
            check([0, -10], 0, [10, -10], Math.PI, 10);
          });

          test('Trajectory along corners', () => {
            check([10, 10], -Math.PI / 2, [10, -10], Math.PI / 2, 20);
            check([10, 10], Math.PI, null, Math.PI, 0);
            check([10, -10], Math.PI / 2, [10, 10], -Math.PI / 2, 20);
            check([10, -10], Math.PI, null, Math.PI, 0);
          });

          test('Trajectory going in', () => {
            check([10, 0], Math.PI, null, Math.PI, 0);
            check([0, 10], -Math.PI / 2, [0, -10], Math.PI / 2, 20);
            check([0, -10], Math.PI / 2, [0, 10], -Math.PI / 2, 20);
          });
        });
        test('Outside bounds no intersection', () => {
          check([-100, -11], 0, null, 0, 0);
          check([-100, 11], 1, null, 1, 0);
          check([11, 0], Math.PI / 2, null, Math.PI / 2, 0);
        });
        test('Outside bounds intersection', () => {
          check([-100, 11], -Math.PI / 2, [-100, 10], Math.PI / 2, 1);
          check([-100, -11], Math.PI / 2, [-100, -10], -Math.PI / 2, 1);
        });
      });
    });
    describe('Bounded Left, Top, Bottom, Unbounded Right', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: -10, right: null, top: 10,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(true);
        expect(bounds.contains([11, -11])).toBe(false);
        expect(bounds.contains([10, -10])).toBe(true);
        expect(bounds.contains([-11, -10])).toBe(false);
        expect(bounds.contains([10, 10])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -11])).toEqual(new Point(11, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, null, 0, 0);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);
        });
        test('Outside bounds intersection', () => {
          check([100, 11], -Math.PI / 2, [100, 10], Math.PI / 2, 1);
          check([100, -11], Math.PI / 2, [100, -10], -Math.PI / 2, 1);
        });
      });
    });
    describe('Bounded Left, Right, Unbounded Bottom Top', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: null, right: 10, top: null,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(false);
        expect(bounds.contains([-11, -11])).toBe(false);
        expect(bounds.contains([10, -11])).toBe(true);
        expect(bounds.contains([-10, -11])).toBe(true);
        expect(bounds.contains([10, 11])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([11, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 11));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, null, Math.PI / 2, 0);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
        });
        test('Outside bounds intersection', () => {
          check([100, 11], Math.PI, [10, 11], 0, 90);
          check([-100, -11], 0, [-10, -11], Math.PI, 90);
        });
      });
    });
    describe('Bounded Top, Bottom, Unbounded Left Right', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: null, bottom: -10, right: null, top: 10,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(true);
        expect(bounds.contains([-11, -11])).toBe(false);
        expect(bounds.contains([10, -11])).toBe(false);
        expect(bounds.contains([-10, -11])).toBe(false);
        expect(bounds.contains([10, 11])).toBe(false);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-11, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -11])).toEqual(new Point(11, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, null, 0, 0);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, null, Math.PI, 0);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);
        });
        test('Outside bounds intersection', () => {
          check([11, 100], -Math.PI / 2, [11, 10], Math.PI / 2, 90);
          check([-11, -100], Math.PI / 2, [-11, -10], -Math.PI / 2, 90);
        });
      });
    });
    describe('Bounded Bottom, Left, Unbounded Top Right', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: -10, bottom: -10, right: null, top: null,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(true);
        expect(bounds.contains([-11, -11])).toBe(false);
        expect(bounds.contains([10, -11])).toBe(false);
        expect(bounds.contains([-10, -11])).toBe(false);
        expect(bounds.contains([10, 11])).toBe(true);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-10, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -10));
        expect(bounds.clip([11, -11])).toEqual(new Point(11, -10));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 11));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, null, 0, 0);
          check([0, 0], Math.PI / 2, null, Math.PI / 2, 0);
          check([0, 0], Math.PI, [-10, 0], 0, 10);
          check([0, 0], -Math.PI / 2, [0, -10], Math.PI / 2, 10);
        });
        test('Outside bounds intersection', () => {
          check([0, -100], Math.PI / 2, [0, -10], -Math.PI / 2, 90);
          check([-100, 0], 0, [-10, 0], Math.PI, 90);
        });
      });
    });
    describe('Bounded Top, Right, Unbounded Bottom Left', () => {
      beforeEach(() => {
        bounds = new RectBounds({
          left: null, bottom: null, right: 10, top: 10,
        });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([11, -10])).toBe(false);
        expect(bounds.contains([-11, -11])).toBe(true);
        expect(bounds.contains([10, -11])).toBe(true);
        expect(bounds.contains([-10, -11])).toBe(true);
        expect(bounds.contains([10, 11])).toBe(false);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([-11, -10])).toEqual(new Point(-11, -10));
        expect(bounds.clip([10, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([11, -11])).toEqual(new Point(10, -11));
        expect(bounds.clip([10, 11])).toEqual(new Point(10, 10));
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // // From origin horiztonal and vertical
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI / 2, [0, 10], -Math.PI / 2, 10);
          check([0, 0], Math.PI, null, Math.PI, 0);
          check([0, 0], -Math.PI / 2, null, -Math.PI / 2, 0);
        });
        test('Outside bounds intersection', () => {
          check([0, 100], -Math.PI / 2, [0, 10], Math.PI / 2, 90);
          check([100, 0], Math.PI, [10, 0], 0, 90);
        });
      });
    });
  });
  describe('Line Bounds', () => {
    describe('Construction', () => {
      describe('Finite', () => {
        afterEach(() => {
          expect(bounds.boundary.p1).toEqual(new Point(0, 0));
          expect(bounds.boundary.p2).toEqual(new Point(2, 0));
          expect(bounds.boundary.ends).toBe(2);
          expect(bounds.boundary.round(3).angle()).toBe(0);
          expect(bounds.precision).toBe(5);
        });
        test('2 Points Extended', () => {
          bounds = new LineBounds({
            p1: [0, 0],
            p2: [2, 0],
            ends: 2,
            precision: 5,
          });
        });
        test('2 Points Default', () => {
          bounds = new LineBounds({
            p1: [0, 0],
            p2: [2, 0],
            precision: 5,
          });
        });
        test('1 Point', () => {
          bounds = new LineBounds({
            p1: [0, 0],
            mag: 2,
            angle: 0,
            precision: 5,
          });
        });
        test('From Line', () => {
          bounds = new LineBounds({
            line: new Line([0, 0], [2, 0]),
            precision: 5,
          });
        });
        test('From Line deinition', () => {
          bounds = new LineBounds({
            line: [[0, 0], [2, 0]],
            precision: 5,
          });
        });
      });
      describe('1 End', () => {
        afterEach(() => {
          expect(bounds.boundary.p1).toEqual(new Point(0, 0));
          expect(bounds.boundary.p2).toEqual(new Point(2, 0));
          expect(bounds.boundary.ends).toBe(1);
          expect(bounds.boundary.round(3).angle()).toBe(0);
          expect(bounds.precision).toBe(5);
        });
        test('2 Points Extended', () => {
          bounds = new LineBounds({
            p1: [0, 0],
            p2: [2, 0],
            ends: 1,
            precision: 5,
          });
        });
        test('1 Point', () => {
          bounds = new LineBounds({
            p1: [0, 0],
            mag: 2,
            angle: 0,
            ends: 1,
            precision: 5,
          });
        });
        test('From Line', () => {
          bounds = new LineBounds({
            line: new Line([0, 0], [2, 0], 1),
            precision: 5,
          });
        });
        test('From Line Definition', () => {
          bounds = new LineBounds({
            line: [[0, 0], [2, 0], 1],
            precision: 5,
          });
        });
      });
    });
    describe('Duplication', () => {
      test('2 Ends', () => {
        bounds = new LineBounds({
          p1: [1, 1],
          p2: [3, 3],
          ends: 2,
          precision: 5,
          bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
      test('1 End', () => {
        bounds = new LineBounds({
          p1: [1, 1],
          p2: [3, 3],
          ends: 1,
          precision: 5,
          bounds: 'outside',
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('State', () => {
      test('All Values', () => {
        bounds = new LineBounds({
          p1: [1, 1],
          p2: [3, 3],
          ends: 2,
          precision: 5,
          bounds: 'outside',
        });
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('2 Ends horizontal - Inside Bounds', () => {
      beforeEach(() => {
        bounds = new LineBounds({ p1: [0, 0], p2: [10, 0] });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0])).toBe(true);
        expect(bounds.contains([0.1, 0])).toBe(true);
        expect(bounds.contains([5, 0])).toBe(true);
        expect(bounds.contains([9.9, 0])).toBe(true);
        expect(bounds.contains([10, 0])).toBe(true);
        expect(bounds.contains([11, 0])).toBe(false);
        expect(bounds.contains([10, 11])).toBe(false);
      });
      test('Contains number - should be false', () => {
        expect(bounds.contains(0)).toBe(false);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0])).toEqual(new Point(0, 0));
        expect(bounds.clip([5, 0])).toEqual(new Point(5, 0));
        expect(bounds.clip([10, 0])).toEqual(new Point(10, 0));
        expect(bounds.clip([11, 0])).toEqual(new Point(10, 0));
        expect(bounds.clip([5, 2])).toEqual(new Point(5, 0));
        expect(bounds.clip([-10, -10])).toEqual(new Point(0, 0));
      });
      test('Clip Value', () => {
        expect(bounds.clip(100)).toBe(100);
      });
      describe('Intersect', () => {
        test('Inside Bounds', () => {
          // check([0, 0], 0, [10, 0], Math.PI, 10);
          check([1, 0], 0, [10, 0], Math.PI, 9);
          check([1, 0], Math.PI, [0, 0], 0, 1);
        });
        test('Edges of bounds', () => {
          check([0, 0], 0, [10, 0], Math.PI, 10);
          check([0, 0], Math.PI, [0, 0], 0, 0);
          check([10, 0], 0, [10, 0], Math.PI, 0);
          check([10, 0], Math.PI, [0, 0], 0, 10);
        });
        test('Outside bounds', () => {
          check([-1, 0], 0, [0, 0], Math.PI, 1);
          check([-1, 0], Math.PI, null, Math.PI, 0);
          check([11, 0], Math.PI, [10, 0], 0, 1);
          check([11, 0], 0, null, 0, 0);
        });
      });
    });
    describe('2 Ends horizontal - Outside Bounds', () => {
      beforeEach(() => {
        bounds = new LineBounds({ p1: [0, 0], p2: [10, 0], bounds: 'outside' });
      });
      test('Intersect Edges of bounds', () => {
        check([0, 0], 0, [0, 0], Math.PI, 0);
        check([0, 0], Math.PI, null, Math.PI, 0);
        check([10, 0], 0, null, 0, 0);
        check([10, 0], Math.PI, [10, 0], 0, 0);
      });
    });
  });
  describe('Transform Bounds', () => {
    describe('Construction, GetBound and UpdateBound', () => {
      let t;
      beforeEach(() => {
        t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
      });
      test('Update with Bound Definitions', () => {
        bounds = new TransformBounds(t);
        bounds.updateScale({ min: 0.5, max: 1.5 });
        bounds.updateRotation({ min: -2, max: 2 });
        bounds.updateTranslation({
          left: -1, right: 1, bottom: -1, top: 1,
        });
      });
      test('Update with Bounds', () => {
        bounds = new TransformBounds(t);
        bounds.updateScale(new RangeBounds({ min: 0.5, max: 1.5 }));
        bounds.updateRotation(new RangeBounds({ min: -2, max: 2 }));
        bounds.updateTranslation(new RectBounds({
          left: -1, right: 1, bottom: -1, top: 1,
        }));
      });
      test('Update with Indeces', () => {
        bounds = new TransformBounds(t);
        bounds.update('r', { min: -2, max: 2 });
        bounds.update('s', { min: 0.5, max: 1.5 });
        bounds.update('t', {
          left: -1, right: 1, bottom: -1, top: 1,
        });
      });
      test('Implicit transform definitions', () => {
        bounds = new TransformBounds(t, {
          translation: {
            left: -1, right: 1, bottom: -1, top: 1,
          },
          rotation: { min: -2, max: 2 },
          scale: { min: 0.5, max: 1.5 },
        });
      });
      test('Explicit transform definitions', () => {
        bounds = new TransformBounds(t, {
          translation: {
            type: 'rect',
            bounds: {
              left: -1, right: 1, bottom: -1, top: 1,
            },
          },
          rotation: {
            type: 'range',
            bounds: { min: -2, max: 2 },
          },
          scale: {
            type: 'range',
            bounds: { min: 0.5, max: 1.5 },
          },
        });
      });
      test('Bounds transform definitions', () => {
        bounds = new TransformBounds(t, {
          translation: new RectBounds({
            left: -1, right: 1, bottom: -1, top: 1,
          }),
          rotation: new RangeBounds({ min: -2, max: 2 }),
          scale: new RangeBounds({ min: 0.5, max: 1.5 }),
        });
      });
      test('Bounds Array definitions', () => {
        bounds = new TransformBounds(t, [
          new RangeBounds({ min: 0.5, max: 1.5 }),
          new RangeBounds({ min: -2, max: 2 }),
          new RectBounds({
            left: -1, right: 1, bottom: -1, top: 1,
          }),
        ]);
      });
      afterEach(() => {
        const tb = bounds.getTranslation();
        const rb = bounds.getRotation();
        const sb = bounds.getScale();
        expect(tb).toBeInstanceOf(RectBounds);
        expect(rb).toBeInstanceOf(RangeBounds);
        expect(sb).toBeInstanceOf(RangeBounds);
        expect(tb.boundary).toEqual({
          left: -1, bottom: -1, top: 1, right: 1,
        });
        expect(sb.boundary).toEqual({ min: 0.5, max: 1.5 });
        expect(rb.boundary).toEqual({ min: -2, max: 2 });
      });
    });
    describe('Duplication', () => {
      test('Simple', () => {
        const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
        bounds = new TransformBounds(t);
        bounds.updateScale(new RangeBounds({ min: 0.5, max: 1.5 }));
        bounds.updateRotation(new RangeBounds({ min: -2, max: 2 }));
        bounds.updateTranslation(new RectBounds({
          left: -1, right: 1, bottom: -1, top: 1,
        }));
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('State', () => {
      test('All Values', () => {
        const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
        bounds = new TransformBounds(t);
        bounds.updateScale(new RangeBounds({ min: 0.5, max: 1.5 }));
        bounds.updateRotation(new RangeBounds({ min: -2, max: 2 }));
        bounds.updateTranslation(new RectBounds({
          left: -1, right: 1, bottom: -1, top: 1,
        }));
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('Long Transforms', () => {
      let t;
      beforeEach(() => {
        t = new Transform()
          .translate(0, 0)
          .scale(1, 1)
          .rotate(0)
          .translate(1, 1);
        bounds = new TransformBounds(t);
      });
      test('Two Translations widh two DIFFERENT updates', () => {
        bounds.updateTranslation({ left: -1, right: 1 });
        bounds.updateTranslation({ left: -2, right: 2 }, 1);
        expect(bounds.getTranslation().boundary).toEqual({
          left: -1, right: 1, bottom: null, top: null,
        });
        expect(bounds.getTranslation(1).boundary).toEqual({
          left: -2, right: 2, bottom: null, top: null,
        });
      });
      test('Two Translations widh two SAME updates', () => {
        bounds.updateTranslation({ left: -1, right: 1 }, null);

        expect(bounds.getTranslation().boundary).toEqual({
          left: -1, right: 1, bottom: null, top: null,
        });
        expect(bounds.getTranslation(1).boundary).toEqual({
          left: -1, right: 1, bottom: null, top: null,
        });
      });
    });
    describe('Clip', () => {
      test('Simple', () => {
        const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
        bounds = new TransformBounds(t, {
          translation: {
            left: -2, bottom: -1, right: 1, top: 2,
          },
          scale: { min: -3, max: 3 },
          rotation: { min: -4, max: 4 },
        });
        const above = t.constant(5);
        const c = bounds.clip(above);
        expect(c.t()).toEqual(new Point(1, 2, 5));
        expect(c.s()).toEqual(new Point(3, 3, 3));
        expect(c.r()).toBe(4);
      });
      test('Nulls in bounds', () => {
        const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
        bounds = new TransformBounds(t, {
          translation: null,
          scale: null,
          rotation: { min: -4, max: 4 },
        });
        const above = t.constant(5);
        const c = bounds.clip(above);
        expect(c.t()).toEqual(new Point(5, 5, 5));
        expect(c.s()).toEqual(new Point(5, 5, 5));
        expect(c.r()).toBe(4);
      });
    });
    describe('Contains', () => {
      test('Simple', () => {
        const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
        bounds = new TransformBounds(t, {
          translation: {
            left: -2, bottom: -1, right: 1, top: 2,
          },
          scale: { min: -3, max: 3 },
          rotation: { min: -4, max: 4 },
        });

        expect(bounds.contains(
          new Transform().scale(-3, 1).rotate(3).translate(1, 1),
        )).toBe(true);
      });
    });
  });
  describe('Get Bounds', () => {
    describe('Line Bounds', () => {
      afterEach(() => {
        expect(bounds).toBeInstanceOf(LineBounds);
        expect(bounds.boundary.p1).toEqual(new Point(0, 0));
        expect(bounds.boundary.p2).toEqual(new Point(1, 1));
        expect(bounds.boundary.ends).toEqual(2);
      });
      test('From Line', () => {
        bounds = getBounds(new Line([0, 0], [1, 1]));
      });
      test('From Line Definition', () => {
        bounds = getBounds({ p1: [0, 0], p2: [1, 1] });
      });
      test('From Line Definition 1', () => {
        bounds = getBounds({ line: new Line([0, 0], [1, 1]) });
      });
    });
  });
});
