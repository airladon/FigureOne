import {
  Line3, Point, getPoint,
} from './g2';
import { round } from './math';

const point = (x, y, z) => new Point(x, y, z);

describe('Line3', () => {
  describe('Creation', () => {
    test('Two Points (0,0,0) (0,0,1)', () => {
      const l = new Line3([0, 0, 0], [0, 0, 1]);
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2).toEqual(point(0, 0, 1));
      expect(l.ends).toBe(2);
    });
    test('Two Points (1,2,3) (-1,2,4)', () => {
      const l = new Line3([1, 2, 3], [-1, 2, 4]);
      expect(l.p1).toEqual(point(1, 2, 3));
      expect(l.p2).toEqual(point(-1, 2, 4));
      expect(l.ends).toBe(2);
    });
    test('Point, Mag, Theta, Phi', () => {
      const l = new Line3({
        p1: [0, 0, 0],
        mag: 2,
        theta: Math.PI / 2,
        phi: Math.PI / 2,
      });
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(0, 2, 0));
      expect(l.ends).toBe(2);
    });
    test('2D Point, Angle', () => {
      const l = new Line3({
        p1: [0, 0],
        mag: 2,
        angle: Math.PI / 2,
      });
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(0, 2, 0));
      expect(l.ends).toBe(2);
    });
    test('2D Point, Angle 2', () => {
      const l = new Line3({
        p1: [0, 0],
        mag: 2 * Math.sqrt(2),
        angle: Math.PI / 4,
      });
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(2, 2, 0));
      expect(l.ends).toBe(2);
    });
    test('Mag and Direction Vector', () => {
      const l = new Line3({
        p1: [0, 0, 0],
        mag: Math.sqrt(8),
        direction: [1, 1, 0],
      });
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(2, 2, 0));
      expect(l.ends).toBe(2);
    });
    test('Mag and Direction Vector 2', () => {
      const l = new Line3({
        p1: [0, 0, 0],
        mag: Math.sqrt(3 * 2 * 2),
        direction: [1, 1, 1],
      });
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(2, 2, 2));
      expect(l.ends).toBe(2);
    });
    test('Ends', () => {
      const l = new Line3([0, 0, 0], [1, 1, 1], 1);
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(1, 1, 1));
      expect(l.ends).toBe(1);
    });
    test('Options Ends override', () => {
      const l = new Line3({
        p1: [0, 0, 0],
        p2: [1, 1, 1],
        ends: 1,
      }, [], 0);
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2.round()).toEqual(point(1, 1, 1));
      expect(l.ends).toBe(1);
    });
  });
  describe('Distance and Angles', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      expect(round(l.theta())).toEqual(round(Math.PI / 2));
      expect(round(l.phi())).toEqual(round(0));
      expect(round(l.length())).toEqual(round(1));
    });
    test('[0, 0, 0], [0, 0, 1]', () => {
      const l = new Line3([0, 0, 0], [0, 0, 1]);
      expect(round(l.theta())).toEqual(round(0));
      expect(round(l.phi())).toEqual(round(0));
      expect(round(l.length())).toEqual(round(1));
    });
    test('[0, 0, 0], [0, 1, 0]', () => {
      const l = new Line3([0, 0, 0], [0, 1, 0]);
      expect(round(l.theta())).toEqual(round(Math.PI / 2));
      expect(round(l.phi())).toEqual(round(Math.PI / 2));
      expect(round(l.length())).toEqual(round(1));
    });
    test('[1, 1, 1], [1, 2, 1]', () => {
      const l = new Line3([1, 1, 1], [1, 2, 1]);
      expect(round(l.theta())).toEqual(round(Math.PI / 2));
      expect(round(l.phi())).toEqual(round(Math.PI / 2));
      expect(round(l.length())).toEqual(round(1));
    });
    test('[1, 1, 1], [0, 0, 0]', () => {
      const l = new Line3([1, 0, 1], [0, 0, 0]);
      expect(round(l.theta())).toEqual(round(Math.PI / 4 * 3));
      expect(round(l.phi())).toEqual(round(Math.PI));
      expect(round(l.length())).toEqual(round(Math.sqrt(2)));
    });
  });
  describe('reverse', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const r = l.reverse();
      expect(r.p1).toEqual(l.p2);
      expect(r.p2).toEqual(l.p1);
    });
    test('[-1, -2, -3], [1, 2, 3]', () => {
      const l = new Line3([-1, -2, -3], [1, 2, 3]);
      const r = l.reverse();
      expect(r.p1).toEqual(l.p2);
      expect(r.p2).toEqual(l.p1);
    });
  });
  describe('midPoint, pointAtPercent, and pointAtLength', () => {
    test('midPoint [0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      expect(l.midPoint().round()).toEqual(point(0.5, 0, 0));
    });
    test('midPoint [-1, -2, -3], [-4, -5, -6]', () => {
      const l = new Line3([-1, -2, -3], [-4, -5, -6]);
      expect(l.midPoint().round()).toEqual(point(-2.5, -3.5, -4.5));
    });
    test('pointAtPercent [0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      expect(l.pointAtPercent(0.5).round()).toEqual(point(0.5, 0, 0));
      expect(l.pointAtPercent(0.2).round()).toEqual(point(0.2, 0, 0));
      expect(l.pointAtPercent(0).round()).toEqual(point(0, 0, 0));
      expect(l.pointAtPercent(1).round()).toEqual(point(1, 0, 0));
      expect(l.pointAtPercent(2).round()).toEqual(point(2, 0, 0));
      expect(l.pointAtPercent(-0.5).round()).toEqual(point(-0.5, 0, 0));
    });
    test('pointAtPercent [1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2]);
      expect(l.pointAtPercent(0.5).round()).toEqual(point(1.5, 1.5, 1.5));
    });
    test('pointAtPercent [-1, -2, -3], [-2, -3, -4]', () => {
      const l = new Line3([-1, -2, -3], [-2, -3, -4]);
      expect(l.pointAtPercent(0.5).round()).toEqual(point(-1.5, -2.5, -3.5));
    });
    test('pointAtLength [1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2]);
      expect(l.pointAtLength(Math.sqrt(3) / 2).round()).toEqual(point(1.5, 1.5, 1.5));
    });
  });
  describe('hasPointAlong', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      // Along Line
      expect(l.hasPointAlong([0, 0, 0])).toBe(true);
      expect(l.hasPointAlong([0.5, 0, 0])).toBe(true);
      expect(l.hasPointAlong([1, 0, 0])).toBe(true);
      expect(l.hasPointAlong([-0.5, 0, 0])).toBe(true);
      expect(l.hasPointAlong([1.5, 0, 0])).toBe(true);
      expect(l.hasPointAlong([1.5, 0, 0.001], 2)).toBe(true);
      // Off Line
      expect(l.hasPointAlong([0.5, 0, 0.1])).toBe(false);
      expect(l.hasPointAlong([0.5, 0, 0.01])).toBe(false);
      expect(l.hasPointAlong([0, 0, 0.01])).toBe(false);
      expect(l.hasPointAlong([-10, 10, 0.01])).toBe(false);
      expect(l.hasPointAlong([-10, 0.01, 0])).toBe(false);
      expect(l.hasPointAlong([0, -0.01, 0])).toBe(false);
    });
    test('[1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2]);
      // Along Line
      expect(l.hasPointAlong([0, 0, 0])).toBe(true);
      expect(l.hasPointAlong([0.5, 0.5, 0.5])).toBe(true);
      expect(l.hasPointAlong([1, 1, 1])).toBe(true);
      expect(l.hasPointAlong([1.5, 1.5, 1.5])).toBe(true);
      expect(l.hasPointAlong([2, 2, 2])).toBe(true);
      expect(l.hasPointAlong([2.5, 2.5, 2.5])).toBe(true);
      // Off Line
      expect(l.hasPointAlong([0, 0, 0.1])).toBe(false);
      expect(l.hasPointAlong([1.1, 1, 1])).toBe(false);
    });
  });
  describe('hasPointOn', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      // Along Line
      expect(l.hasPointOn([0, 0, 0])).toBe(true);
      expect(l.hasPointOn([0.5, 0, 0])).toBe(true);
      expect(l.hasPointOn([1, 0, 0])).toBe(true);
      // Off Line
      expect(l.hasPointOn([-0.5, 0, 0])).toBe(false);
      expect(l.hasPointOn([1.5, 0, 0])).toBe(false);
      expect(l.hasPointOn([1.5, 0, 0.001], 2)).toBe(false);
      expect(l.hasPointOn([0.5, 0, 0.1])).toBe(false);
      expect(l.hasPointOn([0.5, 0, 0.01])).toBe(false);
      expect(l.hasPointOn([0, 0, 0.01])).toBe(false);
      expect(l.hasPointOn([-10, 10, 0.01])).toBe(false);
      expect(l.hasPointOn([-10, 0.01, 0])).toBe(false);
      expect(l.hasPointOn([0, -0.01, 0])).toBe(false);
    });
    test('[1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2]);
      // Along Line
      expect(l.hasPointOn([1, 1, 1])).toBe(true);
      expect(l.hasPointOn([1.5, 1.5, 1.5])).toBe(true);
      expect(l.hasPointOn([2, 2, 2])).toBe(true);
      // Off Line
      expect(l.hasPointOn([0, 0, 0])).toBe(false);
      expect(l.hasPointOn([0.5, 0.5, 0.5])).toBe(false);
      expect(l.hasPointOn([2.5, 2.5, 2.5])).toBe(false);
      expect(l.hasPointOn([0, 0, 0.1])).toBe(false);
      expect(l.hasPointOn([1.1, 1, 1])).toBe(false);
    });
    test('one end [1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2], 1);
      // Along Line
      expect(l.hasPointOn([1, 1, 1])).toBe(true);
      expect(l.hasPointOn([1.5, 1.5, 1.5])).toBe(true);
      expect(l.hasPointOn([2, 2, 2])).toBe(true);
      expect(l.hasPointOn([2.5, 2.5, 2.5])).toBe(true);
      expect(l.hasPointOn([1000, 1000, 1000])).toBe(true);
      // Off Line
      expect(l.hasPointOn([0, 0, 0])).toBe(false);
      expect(l.hasPointOn([0.5, 0.5, 0.5])).toBe(false);
      expect(l.hasPointOn([0, 0, 0.1])).toBe(false);
      expect(l.hasPointOn([1.1, 1, 1])).toBe(false);
    });
    test('no ends [1, 1, 1], [2, 2, 2]', () => {
      const l = new Line3([1, 1, 1], [2, 2, 2], 0);
      // Along Line
      expect(l.hasPointOn([1, 1, 1])).toBe(true);
      expect(l.hasPointOn([1.5, 1.5, 1.5])).toBe(true);
      expect(l.hasPointOn([2, 2, 2])).toBe(true);
      expect(l.hasPointOn([2.5, 2.5, 2.5])).toBe(true);
      expect(l.hasPointOn([1000, 1000, 1000])).toBe(true);
      expect(l.hasPointOn([0, 0, 0])).toBe(true);
      expect(l.hasPointOn([0.5, 0.5, 0.5])).toBe(true);
      expect(l.hasPointOn([-1000, -1000, -1000])).toBe(true);
      // Off Line
      expect(l.hasPointOn([0, 0, 0.1])).toBe(false);
      expect(l.hasPointOn([1.1, 1, 1])).toBe(false);
    });
  });
  describe('distanceToPoint', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      // On line
      expect(round(l.distanceToPoint([0, 0, 0]))).toBe(0);
      expect(round(l.distanceToPoint([1, 0, 0]))).toBe(0);
      expect(round(l.distanceToPoint([0.5, 0, 0]))).toBe(0);
      // Off ends of line
      expect(round(l.distanceToPoint([-1, 0, 0]))).toBe(0);
      expect(round(l.distanceToPoint([2, 0, 0]))).toBe(0);
      // Off line
      expect(round(l.distanceToPoint([0, 1, 0]))).toBe(1);
      expect(round(l.distanceToPoint([0, 1, 1]))).toBe(round(Math.sqrt(2)));
      expect(round(l.distanceToPoint([0, 0, 0.1]))).toBe(round(0.1));
      expect(round(l.distanceToPoint([1, 1, 0]))).toBe(round(1));
    });
    test('[-1, -1, -1], [-2, -2, -2]', () => {
      const l = new Line3([-1, -1, -1], [-2, -2, -2]);
      // On line
      expect(round(l.distanceToPoint([-1, -1, -1]))).toBe(0);
      expect(round(l.distanceToPoint([-2, -2, -2]))).toBe(0);
      expect(round(l.distanceToPoint([-1.5, -1.5, -1.5]))).toBe(0);
      // Off ends of line
      expect(round(l.distanceToPoint([0, 0, 0]))).toBe(0);
      expect(round(l.distanceToPoint([-10, -10, -10]))).toBe(0);
      // Off line
      expect(round(l.distanceToPoint([-1, 1, 0]))).toBe(round(Math.sqrt(2)));
    });
  });
  describe('isParallelTo', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      // Same Line
      expect(l.isParallelTo(new Line3([0, 0, 0], [1, 0, 0]))).toBe(true);
      expect(l.reverse().isParallelTo(new Line3([0, 0, 0], [1, 0, 0]))).toBe(true);
      // Collinear
      expect(l.isParallelTo(new Line3([-10, 0, 0], [-11, 0, 0]))).toBe(true);
      // Parallel
      expect(l.isParallelTo(new Line3([0, 1, 0], [1, 1, 0]))).toBe(true);
      expect(l.isParallelTo(new Line3([0, 1, 1], [1, 1, 1]))).toBe(true);
      // Not parallel
      expect(l.isParallelTo(new Line3([0, 1, 0], [1, 1, 1]))).toBe(false);
      expect(l.isParallelTo(new Line3([0, 0, 0], [1, 0, 0.1]))).toBe(false);
    });
    test('[0, 0, 0], [1, 1, 1]', () => {
      const l = new Line3([0, 0, 0], [1, 1, 1]);
      // Same Line
      expect(l.isParallelTo(new Line3([0, 0, 0], [1, 1, 1]))).toBe(true);
      expect(l.reverse().isParallelTo(new Line3([0, 0, 0], [1, 1, 1]))).toBe(true);
      // Collinear
      expect(l.isParallelTo(new Line3([-10, -10, -10], [-11, -11, -11]))).toBe(true);
      // Parallel
      expect(l.isParallelTo(new Line3([0, 1, 1], [1, 2, 2]))).toBe(true);
      // Not parallel
      expect(l.isParallelTo(new Line3([0, 1, 0], [1, 1, 1]))).toBe(false);
      expect(l.isParallelTo(new Line3([0, 0, 0], [1, 0, 0.1]))).toBe(false);
    });
  });
  describe('Lines can be compared to other lines', () => {
    describe('Two Ends', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([0, 0, 0], [1, 1, 1]);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Collinear Lines, with some overlap', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([-1, -1, -1], [0.5, 0.5, 0.5]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Collinear Lines, with no overlap', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([-1, -1, -1], [-0.5, -0.5, -0.5]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 is not same as Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([0, 0, 0.01], [1, 1, 1]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 is same as Line 2 with 0 precision', () => {
        const l1 = new Line3([0, 0, 0.1], [1, 1, 1]);
        const l2 = new Line3([0, 0, 0], [2, 2, 2]);
        expect(l1.isEqualTo(l2, 0)).toBe(false);
        expect(l1.isAlongLine(l2, 0)).toBe(true);
        expect(l1.isWithinLine(l2, 0)).toBe(true);
        expect(l1.hasLineWithin(l2, 0)).toBe(false);
      });
      test('Line 1 is same as Line 2 with 1 precision', () => {
        const l1 = new Line3([0, 0, 0.01], [1, 1, 1]);
        const l2 = new Line3([0, 0, 0], [2, 2, 2]);
        expect(l1.isEqualTo(l2, 1)).toBe(false);
        expect(l1.isAlongLine(l2, 1)).toBe(true);
        expect(l1.isWithinLine(l2, 1)).toBe(true);
        expect(l1.hasLineWithin(l2, 1)).toBe(false);
      });
      test('Line 1 is within Line 2 with aligned ends', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([0, 0, 0], [2, 2, 2]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 collinear with Line 2 but does not overlap', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([2, 2, 2], [3, 3, 3]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 is parallel but not collinear', () => {
        const l1 = new Line3([0, 0, 0], [1, 0, 0]);
        const l2 = new Line3([0, 0, -1], [1, 0, -1]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line1 is offset to line 2 in y', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1]);
        const l2 = new Line3([0, 1, 0], [1, 2, 1]);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
    });
    describe('1 end', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 1);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 1);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is same as Line 2 but with different definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 1);
        const l2 = new Line3([0, 0, 0], [2, 2, 2], 1);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 finite, same definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 1);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 2);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 infinite, different ends', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 1);
        const l2 = new Line3([0.5, 0.5, 0.5], [1, 1, 1], 1);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
    });
    describe('0 ends', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 0);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is same as Line 2 but with different definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0);
        const l2 = new Line3([0.5, 0.5, 0.5], [1, 1, 1], 0);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is different to Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0);
        const l2 = new Line3([0, 1, 0], [1, 1, 1], 0);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 has 0 ends, line2 has 1 end and is within', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0);
        const l2 = new Line3([-10, -10, -10], [0, 0, 0], 1);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 has 0 ends, line2 has 2 end and is within', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0);
        const l2 = new Line3([-10, -10, -10], [0, 0, 0], 2);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
    });
  });
  describe('Distance between lines', () => {
    test('Two parallel lines', () => {
      const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
      const l2 = new Line3(new Point(0, 0, 1), new Point(2, 0, 1));
      const d = l1.distanceToLine(l2);
      expect(round(d)).toBe(1);
    });
    test('Two parallel lines 2', () => {
      const l1 = new Line3(new Point(1, 0, 1), new Point(2, 0, 2));
      const l2 = new Line3(new Point(1, 1, 1), new Point(2, 1, 2));
      const d = l1.distanceToLine(l2);
      expect(round(d)).toBe(1);
    });
    test('Two skew lines 2', () => {
      const l1 = new Line3(new Point(0, 0, 0), new Point(1, 0, 0));
      const l2 = new Line3(new Point(0, -1, 1), new Point(0, 1, 1));
      const d = l1.distanceToLine(l2);
      expect(round(d)).toBe(1);
    });
    test('Intersecting Lines', () => {
      const l1 = new Line3(new Point(0, 0, 0), new Point(1, 0, 0));
      const l2 = new Line3(new Point(0, -1, 0), new Point(0, 1, 0));
      const d = l1.distanceToLine(l2);
      expect(round(d)).toBe(0);
    });
  });
  describe('Lines can intersect with other lines', () => {
    // let check;
    // beforeEach(() => {
    //   check = (l1, l2, onLines, collinear, intersect) => {
    //     const res = l1.intersectsWith(l2);
    //     expect(res.collinear).toBe(collinear);
    //     expect(res.withinLine).toBe(onLines);
    //     if (res.intersect == null) {
    //       expect(intersect == null).toBe(true);
    //     } else {
    //       expect(res.intersect.round()).toEqual(getPoint(intersect));
    //     }
    //   };
    // });
    describe('Lines with two ends', () => {
      test('On line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, 1, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2));
        const l2 = new Line3(new Point(1, 1, 0), new Point(1, 1, 2));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect negative', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(-2, -2, -2));
        const l2 = new Line3(new Point(-1, -1, 0), new Point(-1, -1, -2));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-1, -1, -1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect non zero', () => {
        const l1 = new Line3(new Point(1, 1, 1), new Point(-2, -2, -2));
        const l2 = new Line3(new Point(-1, -1, 2), new Point(-1, -1, -2));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-1, -1, -1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2));
        const l2 = new Line3(new Point(1, 1, 0), new Point(1, 1, 0.5));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Parallel 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(0, 1, 0), new Point(2, 1, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toBe(undefined);
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Parallel 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2));
        const l2 = new Line3(new Point(1, 0, 0), new Point(3, 2, 2));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toBe(undefined);
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('skew', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(1, -1, 1), new Point(1, 1, 1));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toBe(undefined);
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Collinear No Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(-2, 0, 0), new Point(-1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear No Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(-2, 0, 0), new Point(-1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear No Overlap 3', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(-1, 0, 0), new Point(-2, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear No Overlap 4', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(-1, 0, 0), new Point(-2, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(-2, 0, 0), new Point(0, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(2, 0, 0), new Point(3, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap 3', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(0, 0, 0), new Point(-2, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(-2, 0, 0), new Point(1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(-2, 0, 0), new Point(1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Full Overlap', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(1, 0, 0), new Point(0.5, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Equal', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
    });
    describe('Lines with 2 and 1 ends', () => {
      test('On line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 2);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 2D Reverse', () => {
        const l2 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 2);
        const l1 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 2);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D Reverse', () => {
        const l2 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 2);
        const l1 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 2);
        const l2 = new Line3(new Point(1, 1, 0), new Point(1, 1.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 2);
        const l2 = new Line3(new Point(1, 0.5, 0.5), new Point(1, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Collinear No Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(-2, 0, 0), new Point(-1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear No Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(-1, 0, 0), new Point(-2, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(-2, 0, 0), new Point(0, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
        const l2 = new Line3(new Point(2, 0, 0), new Point(3, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(-2, 0, 0), new Point(1, 0, 0));
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0));
        const l2 = new Line3(new Point(1, 0, 0), new Point(-2, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
    });
    describe('Lines 1 ends', () => {
      test('On line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 2D Reverse', () => {
        const l2 = new Line3(new Point(0, 0, 0), new Point(0.5, 0, 0), 1);
        const l1 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 1);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D Reverse', () => {
        const l2 = new Line3(new Point(0, 0, 0), new Point(0.1, 0.1, 0.1), 1);
        const l1 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 2D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(1, 1, 0), new Point(1, 1.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 3D', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 1);
        const l2 = new Line3(new Point(1, 0.5, 0.5), new Point(1, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Collinear No Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(-1, 0, 0), new Point(-2, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(-0.5, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(0, 0, 0), new Point(-2, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Ends Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0), 1);
        const l2 = new Line3(new Point(2, 0, 0), new Point(3, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 1);
        const l2 = new Line3(new Point(1, 0, 0), new Point(-2, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Partial Overlap 2', () => {
        const l1 = new Line3(new Point(2, 0, 0), new Point(0, 0, 0), 1);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1.5, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(2, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
    });
    describe('Lines with 0, 1 and 2 ends', () => {
      test('On line intersect 2D, Ends: 0 & 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, 0.5, 0), 2);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 2D, Ends: 0 & 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 2);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 2D, Ends: 0 & 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 2D, Ends: 0 & 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -1.5, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 2D, Ends: 0 & 0', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -0.5, 0), 0);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 2D, Ends: 0 & 0 - 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, -1, 0), new Point(1, -1.5, 0), 0);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(1, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Parallel: 0 & 0', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, 0, 1), new Point(2, 0, 1), 0);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(undefined);
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Skew: 0 & 0', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(1, 0, 1), new Point(2, 1, 1), 0);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(undefined);
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D, Ends: 0 & 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 0);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, 1.5, 1.5), 2);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('On line intersect 3D, Ends: 0 & 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 0);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 3D, Ends: 0 & 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 0);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, 0.5, 0.5), 2);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Off line intersect 3D, Ends: 0 & 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 2, 2), 0);
        const l2 = new Line3(new Point(1, 0, 0), new Point(1, -0.5, -0.5), 1);
        const res = l1.intersectsWith(l2);
        expect(round(res.intersect)).toEqual(new Point(1, 1, 1));
        expect(res.onLines).toBe(false);
        expect(res.collinear).toBe(false);
      });
      test('Collinear Full Overlap, Ends: 0 & 2', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(4, 0, 0), new Point(5, 0, 0), 2);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Full Overlap, Ends: 0 & 1', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(4, 0, 0), new Point(5, 0, 0), 1);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
      test('Collinear Full Overlap, Ends: 0 & 0', () => {
        const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0), 0);
        const l2 = new Line3(new Point(4, 0, 0), new Point(5, 0, 0), 0);
        const res = l1.intersectsWith(l2);
        expect(res.intersect).toEqual(new Point(0, 0, 0));
        expect(res.onLines).toBe(true);
        expect(res.collinear).toBe(true);
      });
    });
  });
  describe('offset', () => {
    test('direction and mag - actually perp', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const o = l.offset([0, 1, 0], 2);
      expect(o).toEqual(new Line3([0, 2, 0], [1, 2, 0]));
    });
    test('direction only - actually perp', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const o = l.offset([0, 2, 0]);
      expect(o).toEqual(new Line3([0, 2, 0], [1, 2, 0]));
    });
    test('direction and mag', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const o = l.offset([1, 1, 0], 2);
      expect(o).toEqual(new Line3([0, 2, 0], [1, 2, 0]));
    });
    test('direction only', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const o = l.offset([2, 2, 0]);
      expect(o.round())
        .toEqual(new Line3([0, 2 * Math.sqrt(2), 0], [1, 2 * Math.sqrt(2), 0]).round());
    });
  });
  describe('Point Projection', () => {
    test('1D', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      const p = l.pointProjection([0.5, 0.5, 0]);
      expect(p.round()).toEqual(new Point(0.5, 0, 0))
    });

    test('1D off origin', () => {
      const l = new Line3([0, 1, 0], [1, 1, 0]);
      const p = l.pointProjection([0.5, 0.5, 0]);
      expect(p.round()).toEqual(new Point(0.5, 1, 0));
    });

    test('2D', () => {
      const l = new Line3([-1, -1, 0], [1, 1, 0]);
      const p = l.pointProjection([-1, 1, 0]);
      expect(p.round()).toEqual(new Point(0, 0, 0));
    });
    test('3D', () => {
      const l = new Line3([-1, -1, -1], [1, 1, 1]);
      const p = l.pointProjection([-1, 1, 0]);
      expect(p.round()).toEqual(new Point(0, 0, 0));
    });
  });
});
