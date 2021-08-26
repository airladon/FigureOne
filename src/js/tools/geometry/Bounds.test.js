import { Point, getPoint } from './Point';
import { Line } from './Line';
import { Plane } from './Plane';
import {
  RectBounds, LineBounds, RangeBounds, getBounds,
} from './Bounds';
import { round } from '../math';

describe('Bounds', () => {
  let bounds;
  let check;

  describe('Rect Bounds', () => {
    describe('Construction', () => {
      test('XY Plane direction vectors', () => {
        bounds = new RectBounds({
          position: [1, 1, 0],
          rightDirection: [2, 0, 0],
          topDirection: [0, 2, 0],
          left: 2,
          right: 3,
          top: 4,
          bottom: 5,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[1, 1, 0], [0, 0, 1]]));
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
        bounds = new RectBounds({
          position: [0, 0, 0],
          topDirection: [0, 2, 0],
          normal: [2, 0, 0],
          left: 1,
          right: 1,
          top: 1,
          bottom: 1,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[0, 0, 0], [1, 0, 0]]));
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
        bounds = new RectBounds({
          position: [0, 1, 0],
          rightDirection: [2, 0, 0],
          normal: [0, 2, 0],
          left: 1,
          right: 1,
          top: 1,
          bottom: 1,
        });
        expect(bounds.plane.round()).toEqual(new Plane([[0, 1, 0], [0, 1, 0]]));
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
        bounds = new RectBounds({
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
    describe('State', () => {
      test('All Values', () => {
        bounds = new RectBounds({
          position: [1, 1, 0],
          rightDirection: [2, 0, 0],
          topDirection: [0, 2, 0],
          left: 2,
          right: 3,
          top: 4,
          bottom: 5,
        });
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('Contains', () => {
      describe('XY Plane', () => {
        beforeEach(() => {
          bounds = new RectBounds({
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
          bounds = new RectBounds({
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
          bounds = new RectBounds({
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
          bounds = new RectBounds({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 1,
            right: 2,
            top: 3,
            bottom: 4,
          });
        });
        test('inside', () => {
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
          bounds = new RectBounds({
            position: [1, 1, 1],
            rightDirection: [2, 0, 0],
            topDirection: [0, 0, -2],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
        });
        test('inside', () => {
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
      beforeEach(() => {
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
      describe('XY Plane', () => {
        beforeEach(() => {
          bounds = new RectBounds({
            position: [0, 0, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 1,
            right: 1,
            top: 1,
            bottom: 1,
          });
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
        describe('Left Bound', () => {
          test('Inside normal direction on boundary', () => {
            expect(intersect([0, 0, 0], [-1, 0, 0])).toEqual([
              [-1, 0, 0], 1, [1, 0, 0],
            ]);
          });
          test('Inside normal', () => {
            expect(intersect([0, 0, 0], [-0.5, 0, 0])).toEqual([
              [-1, 0, 0], 1, [1, 0, 0],
            ]);
          });
          test('26 inside', () => {
            expect(intersect([-0.9, -0.05, 0], [-1, 0.5, 0])).toEqual([
              [-1, 0, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [0.894, 0.447, 0],
            ]);
          });
          test('45º inside', () => {
            expect(intersect([-0.9, -0.1, 0], [-1, 1, 0])).toEqual([
              [-1, 0, 0], round(0.1 * Math.sqrt(2), 3), [0.707, 0.707, 0],
            ]);
          });
          test('63º inside', () => {
            expect(intersect([-0.9, 0.2, 0], [-1, -2, 0])).toEqual([
              [-1, 0, 0],
              round(Math.sqrt(0.1 * 0.1 + 0.2 * 0.2), 3),
              [0.447, -0.894, 0],
            ]);
          });
          test('On Border', () => {
            expect(intersect([-1, 0, 0], [-1, 1, 0])).toEqual([
              [-1, 0, 0], 0, [0.707, 0.707, 0],
            ]);
          });
          test('Outside Border going out', () => {
            expect(intersect([-1.1, 0, 0], [-1, 0, 0])).toEqual([
              [-1, 0, 0], 0, [1, 0, 0],
            ]);
          });
          test('Outside Border going in', () => {
            expect(intersect([-1.1, 0, 0], [1, 0, 0])).toEqual([
              [1, 0, 0], 2, [-1, 0, 0],
            ]);
          });
        });
        describe('Top Bound', () => {
          test('Inside normal direction on boundary', () => {
            expect(intersect([0, 0, 0], [0, 1, 0])).toEqual([
              [0, 1, 0], 1, [0, -1, 0],
            ]);
          });
          test('Inside normal', () => {
            expect(intersect([0, 0, 0], [0, 0.5, 0])).toEqual([
              [0, 1, 0], 1, [0, -1, 0],
            ]);
          });
          test('Inside normal offset', () => {
            expect(intersect([0.5, 0, 0], [0, 0.5, 0])).toEqual([
              [0.5, 1, 0], 1, [0, -1, 0],
            ]);
          });
          test('26º inside', () => {
            expect(intersect([0.05, 0.9, 0], [-1, 2, 0])).toEqual([
              [0, 1, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [-0.447, -0.894, 0],
            ]);
          });
          test('45º inside', () => {
            expect(intersect([-0.2, 0.9, 0], [1, 1, 0])).toEqual([
              [-0.1, 1, 0], round(0.1 * Math.sqrt(2), 3), [0.707, -0.707, 0],
            ]);
          });
          test('63º inside', () => {
            expect(intersect([0.2, 0.95, 0], [-2, 1, 0])).toEqual([
              [0.1, 1, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [-0.894, -0.447, 0],
            ]);
          });
          test('On Border', () => {
            expect(intersect([0, 1, 0], [1, 1, 0])).toEqual([
              [0, 1, 0], 0, [0.707, -0.707, 0],
            ]);
          });
          test('Outside Border going out', () => {
            expect(intersect([0, 1.1, 0], [1, 1, 0])).toEqual([
              [0, 1, 0], 0, [0.707, -0.707, 0],
            ]);
          });
          test('Outside Border corner going out', () => {
            expect(intersect([1.1, 1.1, 0], [1, 1, 0])).toEqual([
              [1, 1, 0], 0, [-0.707, -0.707, 0],
            ]);
          });
          test('Outside Border corner going in', () => {
            expect(intersect([1.1, 1.1, 0], [-1, -1, 0])).toEqual([
              [-1, -1, 0], round(Math.sqrt(2) * 2, 3), [0.707, 0.707, 0],
            ]);
          });
          test('Outside Border corner going in x out y', () => {
            expect(intersect([1.1, 1.1, 0], [-1, 1, 0])).toEqual([
              [1, 1, 0], 0, [-0.707, -0.707, 0],
            ]);
          });
          test('Outside Border corner going in y out x', () => {
            expect(intersect([1.1, 1.1, 0], [1, -1, 0])).toEqual([
              [1, 1, 0], 0, [-0.707, -0.707, 0],
            ]);
          });
          test('Outside Border going in', () => {
            expect(intersect([0, 1.1, 0], [0, -1, 0])).toEqual([
              [0, -1, 0], 2, [0, 1, 0],
            ]);
          });
        });
        describe('Bottom Bound', () => {
          test('Inside normal direction on boundary', () => {
            expect(intersect([0, 0, 0], [0, -1, 0])).toEqual([
              [0, -1, 0], 1, [0, 1, 0],
            ]);
          });
          test('Inside normal', () => {
            expect(intersect([0, 0, 0], [0, -0.5, 0])).toEqual([
              [0, -1, 0], 1, [0, 1, 0],
            ]);
          });
          test('Inside normal offset', () => {
            expect(intersect([0.5, 0, 0], [0, -0.5, 0])).toEqual([
              [0.5, -1, 0], 1, [0, 1, 0],
            ]);
          });
          test('26º inside', () => {
            expect(intersect([0.05, -0.9, 0], [-1, -2, 0])).toEqual([
              [0, -1, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [-0.447, 0.894, 0],
            ]);
          });
          test('45º inside', () => {
            expect(intersect([-0.2, -0.9, 0], [1, -1, 0])).toEqual([
              [-0.1, -1, 0], round(0.1 * Math.sqrt(2), 3), [0.707, 0.707, 0],
            ]);
          });
          test('63º inside', () => {
            expect(intersect([0.2, -0.95, 0], [-2, -1, 0])).toEqual([
              [0.1, -1, 0],
              round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
              [-0.894, 0.447, 0],
            ]);
          });
          test('On Border', () => {
            expect(intersect([0, 1, 0], [1, 1, 0])).toEqual([
              [0, 1, 0], 0, [0.707, -0.707, 0],
            ]);
          });
          test('Outside Border going out', () => {
            expect(intersect([0, -1.1, 0], [1, -1, 0])).toEqual([
              [0, -1, 0], 0, [0.707, 0.707, 0],
            ]);
          });
          test('Outside Border corner going out', () => {
            expect(intersect([1.1, -1.1, 0], [1, -1, 0])).toEqual([
              [1, -1, 0], 0, [-0.707, 0.707, 0],
            ]);
          });
          test('Outside Border corner going in', () => {
            expect(intersect([1.1, -1.1, 0], [-1, 1, 0])).toEqual([
              [-1, 1, 0], round(Math.sqrt(2) * 2, 3), [0.707, -0.707, 0],
            ]);
          });
        });
      });
      describe('Offset XZ Plane', () => {
        beforeEach(() => {
          bounds = new RectBounds({
            position: [1, 1, 1],
            rightDirection: [2, 0, 0],
            topDirection: [0, 0, -2],
            left: 2,
            right: 3,
            top: 4,
            bottom: 5,
          });
        });
        test('Inside normal - right bound', () => {
          expect(intersect([1, 1, 1], [0.5, 0, 0])).toEqual([
            [4, 1, 1], 3, [-1, 0, 0],
          ]);
        });
        test('Right bound 26º inside', () => {
          expect(intersect([3.9, 1, 0.95], [1, 0, 0.5])).toEqual([
            [4, 1, 1],
            round(Math.sqrt(0.1 ** 2 + 0.05 ** 2), 3),
            [-0.894, 0, 0.447],
          ]);
        });
      });
      describe('XY plane with 0 left and bottom', () => {
        beforeEach(() => {
          bounds = new RectBounds({
            position: [1, 1, 0],
            rightDirection: [2, 0, 0],
            topDirection: [0, 2, 0],
            left: 0,
            right: 2,
            top: 2,
            bottom: 0,
          });
        });
        test('Inside normal - right bound', () => {
          expect(intersect([1, 1, 0], [0.5, 0, 0])).toEqual([
            [3, 1, 0], 2, [-1, 0, 0],
          ]);
        });
        test('Inside normal - left bound', () => {
          expect(intersect([2, 2, 0], [-0.5, 0, 0])).toEqual([
            [1, 2, 0], 1, [1, 0, 0],
          ]);
        });
        test('Inside normal - bottom bound', () => {
          expect(intersect([2, 2, 0], [0, -1, 0])).toEqual([
            [2, 1, 0], 1, [0, 1, 0],
          ]);
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
      });
      test('Array', () => {
        bounds = new RangeBounds({ min: -10, max: 10, precision: 5 });
      });
    });
    describe('Duplication', () => {
      test('All Values', () => {
        bounds = new RangeBounds({
          min: -10, max: 10, precision: 5,
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
      test('min null', () => {
        bounds = new RangeBounds({
          min: null, max: 10, precision: 5,
        });
        const d = bounds._dup();
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('State', () => {
      test('All Values', () => {
        bounds = new RangeBounds({
          min: -10, max: 10, precision: 5,
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
            length: 2,
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
            length: 2,
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
        });
        const state = bounds._state();
        const d = getBounds(state);
        expect(d).toEqual(bounds);
        expect(d).not.toBe(bounds);
      });
    });
    describe('2 Ends horizontal - 2D', () => {
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
      test('Contains number - should be error', () => {
        expect(() => bounds.contains(0)).toThrow();
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
        expect(() => bounds.clip(100)).toThrow();
      });
      describe('Intersect', () => {
        beforeEach(() => {
          check = (pos, dir, i, r, d) => {
            const result = bounds.intersect(pos, dir);
            if (i == null) {
              expect(result.intersect).toBe(null);
            } else {
              expect(result.intersect.round(3)).toEqual(getPoint(i).round(3));
            }
            expect(result.reflection.round(3)).toEqual(getPoint(r).round(3));
            expect(round(result.distance, 3)).toBe(round(d, 3));
          };
        });
        test('Inside Bounds', () => {
          // check([0, 0], 0, [10, 0], Math.PI, 10);
          check([1, 0], [1, 0], [10, 0], [-1, 0], 9);
          check([1, 0], [-0.1, 0], [0, 0], [1, 0], 1);
        });
        test('Edges of bounds', () => {
          check([0, 0], [1, 0], [10, 0], [-1, 0], 10);
          check([0, 0], [-1, 0], [0, 0], [1, 0], 0);
          check([10, 0], [1, 0], [10, 0], [-1, 0], 0);
          check([10, 0], [-1, 0], [0, 0], [1, 0], 10);
        });
        test('Outside bounds', () => {
          check([-1, 0], [1, 0], [10, 0], [-1, 0], 10);
          check([-1, 0], [-1, 0], [0, 0], [1, 0], 0);
          check([11, 0], [1, 0], [10, 0], [-1, 0], 0);
          check([11, 0], [-1, 0], [0, 0], [1, 0], 10);
        });
      });
    });
    describe('2 Ends - 3D', () => {
      beforeEach(() => {
        bounds = new LineBounds({ p1: [0, 0, 0], p2: [10, 10, 10] });
      });
      test('Contains value', () => {
        expect(bounds.contains([0, 0, 0])).toBe(true);
        expect(bounds.contains([0.1, 0.1, 0.1])).toBe(true);
        expect(bounds.contains([5, 5, 5])).toBe(true);
        expect(bounds.contains([9.9, 9.9, 9.9])).toBe(true);
        expect(bounds.contains([10, 10, 10])).toBe(true);
        expect(bounds.contains([11, 11, 11])).toBe(false);
        expect(bounds.contains([10, 11, 0])).toBe(false);
        expect(bounds.contains([0, 0, 0.1])).toBe(false);
        expect(bounds.contains([-1, -1, -1])).toBe(false);
      });
      test('Clip Point', () => {
        expect(bounds.clip([0, 0, 0])).toEqual(new Point(0, 0, 0));
        expect(bounds.clip([5, 5, 5])).toEqual(new Point(5, 5, 5));
        expect(bounds.clip([10, 10, 10])).toEqual(new Point(10, 10, 10));
        expect(bounds.clip([11, 12, 13])).toEqual(new Point(10, 10, 10));
        expect(bounds.clip([-1, -1, -1])).toEqual(new Point(0, 0, 0));
      });
      describe('Intersect', () => {
        beforeEach(() => {
          check = (pos, dir, i, r, d) => {
            const result = bounds.intersect(pos, dir);
            if (i == null) {
              expect(result.intersect).toBe(null);
            } else {
              expect(result.intersect.round(3)).toEqual(getPoint(i).round(3));
            }
            expect(result.reflection.round(3)).toEqual(getPoint(r).round(3));
            expect(round(result.distance, 3)).toBe(round(d, 3));
          };
        });
        test('Inside Bounds', () => {
          check([1, 1, 1], [2, 2, 2], [10, 10, 10], [-0.577, -0.577, -0.577], 15.588);
          check([1, 1, 1], [-0.1, -0.2, 0], [0, 0, 0], [0.577, 0.577, 0.577], Math.sqrt(3));
        });
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
