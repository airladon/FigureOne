import {
  Line3, Point,
} from './g2';
import { round } from './math';

const point = (x, y, z) => new Point(x, y, z);

describe('Line3', () => {
  describe('Creation', () => {
    test('(0,0,0) (0,0,1)', () => {
      const l = new Line3([0, 0, 0], [0, 0, 1]);
      expect(l.p1).toEqual(point(0, 0, 0));
      expect(l.p2).toEqual(point(0, 0, 1));
    });
    test('(1,2,3) (-1,2,4)', () => {
      const l = new Line3([1, 2, 3], [-1, 2, 4]);
      expect(l.p1).toEqual(point(1, 2, 3));
      expect(l.p2).toEqual(point(-1, 2, 4));
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
      const l = new Line3([1, 1, 1], [2, 2, 2], 0, 0, 1);
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
      const l = new Line3([1, 1, 1], [2, 2, 2], 0, 0, 0);
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
  describe('isParallelWith', () => {
    test('[0, 0, 0], [1, 0, 0]', () => {
      const l = new Line3([0, 0, 0], [1, 0, 0]);
      // Same Line
      expect(l.isParallelWith(new Line3([0, 0, 0], [1, 0, 0]))).toBe(true);
      expect(l.reverse().isParallelWith(new Line3([0, 0, 0], [1, 0, 0]))).toBe(true);
      // Collinear
      expect(l.isParallelWith(new Line3([-10, 0, 0], [-11, 0, 0]))).toBe(true);
      // Parallel
      expect(l.isParallelWith(new Line3([0, 1, 0], [1, 1, 0]))).toBe(true);
      expect(l.isParallelWith(new Line3([0, 1, 1], [1, 1, 1]))).toBe(true);
      // Not parallel
      expect(l.isParallelWith(new Line3([0, 1, 0], [1, 1, 1]))).toBe(false);
      expect(l.isParallelWith(new Line3([0, 0, 0], [1, 0, 0.1]))).toBe(false);
    });
    test('[0, 0, 0], [1, 1, 1]', () => {
      const l = new Line3([0, 0, 0], [1, 1, 1]);
      // Same Line
      expect(l.isParallelWith(new Line3([0, 0, 0], [1, 1, 1]))).toBe(true);
      expect(l.reverse().isParallelWith(new Line3([0, 0, 0], [1, 1, 1]))).toBe(true);
      // Collinear
      expect(l.isParallelWith(new Line3([-10, -10, -10], [-11, -11, -11]))).toBe(true);
      // Parallel
      expect(l.isParallelWith(new Line3([0, 1, 1], [1, 2, 2]))).toBe(true);
      // Not parallel
      expect(l.isParallelWith(new Line3([0, 1, 0], [1, 1, 1]))).toBe(false);
      expect(l.isParallelWith(new Line3([0, 0, 0], [1, 0, 0.1]))).toBe(false);
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
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 1);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 1);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is same as Line 2 but with different definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 1);
        const l2 = new Line3([0, 0, 0], [2, 2, 2], 0, 0, 1);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 finite, same definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 1);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 2);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 infinite, different ends', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 1);
        const l2 = new Line3([0.5, 0.5, 0.5], [1, 1, 1], 0, 0, 1);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
    });
    describe('0 ends', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        const l2 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is same as Line 2 but with different definition', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        const l2 = new Line3([0.5, 0.5, 0.5], [1, 1, 1], 0, 0, 0);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 is different to Line 2', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        const l2 = new Line3([0, 1, 0], [1, 1, 1], 0, 0, 0);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(false);
      });
      test('Line 1 has 0 ends, line2 has 1 end and is within', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        const l2 = new Line3([-10, -10, -10], [0, 0, 0], 0, 0, 1);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
      test('Line 1 has 0 ends, line2 has 2 end and is within', () => {
        const l1 = new Line3([0, 0, 0], [1, 1, 1], 0, 0, 0);
        const l2 = new Line3([-10, -10, -10], [0, 0, 0], 0, 0, 2);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isAlongLine(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l1.hasLineWithin(l2)).toBe(true);
      });
    });
  });
  describe('Lines can intersect with other lines', () => {
    let check;
    beforeEach(() => {
      check = (l1, l2, alongLine, inLine, intersect) => {
        const res = l1.intersectsWith(l2);
        expect(res.alongLine).toBe(alongLine);
        expect(res.withinLine).toBe(inLine);
        if (res.intersect == null) {
          expect(intersect == null).toBe(true);
        } else {
          expect(res.intersect.round()).toEqual(getPoint(intersect));
        }
      };
    });
    test('Line 0, 0<>2, 0 with 1, -1<>1, 1 has intersection 1, 0', () => {
      const l1 = new Line3(new Point(0, 0, 0), new Point(2, 0, 0));
      const l2 = new Line3(new Point(1, -1, 0), new Point(1, 1, 0));
      const res = l1.intersectsWith(l2);
      expect(res.collinear).toEqual(false);
      expect(res.onLines).toEqual(true);
      expect(res.intersect).toEqual(new Point(1, 0, 0));
    });
    // test('Line 0, 0<>2, 0 with 1, -1<>1, -0.5 has intersection 1, 0 which is outside the line definition', () => {
    //   const l1 = new Line(new Point(0, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(1, -1), new Point(1, -0.5));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(false);
    //   expect(res.intersect).toEqual(new Point(1, 0));
    // });
    // test('Line 0, 0<>2, 0 with 0, 1<>2, 1 has no intersection', () => {
    //   const l1 = new Line(new Point(0, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(0, 1), new Point(2, 1));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(false);
    //   expect(res.withinLine).toEqual(false);
    // });
    // test('Line 0, 0<>2, 0 with 4, 0<>5, 0 has as intersection at 3, 0', () => {
    //   const l1 = new Line(new Point(0, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(4, 0), new Point(5, 0));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(false);
    //   expect(res.intersect).toEqual(new Point(3, 0));
    // });
    // test('Line 1, 0<>2, 0 with 0, 0<>4, 0 has as intersection at 2.75, 0', () => {
    //   const l1 = new Line(new Point(1, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(0, 0), new Point(4, 0));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(true);
    //   expect(res.intersect.round()).toEqual(new Point(1.75, 0));
    // });
    // test('Line 0, 0<>2, 0 with 1, 0<>4, 0 has as intersection at 1.5, 0', () => {
    //   const l1 = new Line(new Point(0, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(1, 0), new Point(4, 0));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(true);
    //   expect(res.intersect.round()).toEqual(new Point(1.5, 0));
    // });
    // test('Line 1, 0<>2, 0 with 1, 0<>4, 0 has as intersection at 1.5, 0', () => {
    //   const l1 = new Line(new Point(1, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(1, 0), new Point(4, 0));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(true);
    //   expect(res.intersect.round()).toEqual(new Point(2, 0));
    // });
    // test('Line 1, 0<>2, 0 with 2, 0<>3, 0 has as intersection at 2, 0', () => {
    //   const l1 = new Line(new Point(1, 0), new Point(2, 0));
    //   const l2 = new Line(new Point(2, 0), new Point(3, 0));
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(true);
    //   expect(res.intersect.round()).toEqual(new Point(2, 0));
    // });
    // // 0.804, y: 0.04029297190976889
    // test('Line 1, 0<>2, 0 with 2, 0<>3, 0 has as intersection at (2, 0) 2', () => {
    //   const l1 = new Line(
    //     new Point(0.804, 0.04029297190976889),
    //     new Point(0.804, 0.05036621488721111),
    //   );
    //   const l2 = new Line(
    //     new Point(0.804, 0.05036621488721111),
    //     new Point(0.804, 0.06043945786465334),
    //   );
    //   const res = l1.intersectsWith(l2);
    //   expect(res.alongLine).toEqual(true);
    //   expect(res.withinLine).toEqual(true);
    //   expect(res.intersect).toEqual(new Point(0.804, 0.05036621488721111));
    // });
    // describe('Both lines have 2 ends', () => {
    //   describe('Lines are parallel', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0]);
    //       const l2 = new Line([0, 1], [1, 1]);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('vertical', () => {
    //       const l1 = new Line([0, 0], [0, 1]);
    //       const l2 = new Line([1, 0], [1, 1]);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [1, 1]);
    //       const l2 = new Line([1, 0], [2, 1]);
    //       check(l1, l2, false, false, null);
    //     });
    //   });
    //   describe('Lines cross', () => {
    //     test('Lines cross at origin', () => {
    //       const l1 = new Line([-1, -1], [1, 1]);
    //       const l2 = new Line([-1, 1], [1, -1]);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //     test('Lines cross at point', () => {
    //       const l1 = new Line([0, 0], [2, 2]);
    //       const l2 = new Line([0, 2], [2, 0]);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //     test('Lines cross at end of one line', () => {
    //       const l1 = new Line([0, 0], [2, 2]);
    //       const l2 = new Line([1, 1], [2, 0]);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //     test('Lines cross when vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [2, 0]);
    //       const l2 = new Line([1, 0], [1, 1]);
    //       check(l1, l2, true, true, [1, 0]);
    //     });
    //   });
    //   describe('Lines intersect offLine', () => {
    //     test('Intersection is on line 1', () => {
    //       const l1 = new Line([0, 0], [1, 1]);
    //       const l2 = new Line([3, 0], [0, 3]);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Intersection is on line 2', () => {
    //       const l1 = new Line([3, 0], [0, 3]);
    //       const l2 = new Line([0, 0], [1, 1]);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Intersection is off both lines', () => {
    //       const l1 = new Line([3, 0], [2, 1]);
    //       const l2 = new Line([0, 0], [1, 1]);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Lines cross when vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [2, 0]);
    //       const l2 = new Line([1, 1], [1, 2]);
    //       check(l1, l2, true, false, [1, 0]);
    //     });
    //     test('Lines cross when vertical and horizontal at corner', () => {
    //       const l1 = new Line([0, 0], [2, 0]);
    //       const l2 = new Line([2, 1], [2, 2]);
    //       check(l1, l2, true, false, [2, 0]);
    //     });
    //   });
    //   describe('Lines collinear partial overlap', () => {
    //     test('Horizontal', () => {
    //       const l1 = new Line([0, 0], [3, 0]);
    //       const l2 = new Line([2, 0], [3.5, 0]);
    //       check(l1, l2, true, true, [2.5, 0]);
    //     });
    //     test('Vertical', () => {
    //       const l1 = new Line([0, 0], [0, 3]);
    //       const l2 = new Line([0, 2], [0, 3.5]);
    //       check(l1, l2, true, true, [0, 2.5]);
    //     });
    //     test('Angle', () => {
    //       const l1 = new Line([0, 0], [3, 3]);
    //       const l2 = new Line([2, 2], [3.5, 3.5]);
    //       check(l1, l2, true, true, [2.5, 2.5]);
    //     });
    //   });
    //   describe('Lines collinear no overlap', () => {
    //     test('Horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0]);
    //       const l2 = new Line([3, 0], [4, 0]);
    //       check(l1, l2, true, false, [2, 0]);
    //     });
    //     test('Vertical', () => {
    //       const l1 = new Line([0, 0], [0, 1]);
    //       const l2 = new Line([0, 3], [0, 4]);
    //       check(l1, l2, true, false, [0, 2]);
    //     });
    //     test('Angle', () => {
    //       const l1 = new Line([0, 0], [1, 1]);
    //       const l2 = new Line([3, 3], [4, 4]);
    //       check(l1, l2, true, false, [2, 2]);
    //     });
    //   });
    //   describe('Lines collinear within', () => {
    //     test('Horizontal fully within', () => {
    //       const l1 = new Line([0, 0], [10, 0]);
    //       const l2 = new Line([1, 0], [3, 0]);
    //       check(l1, l2, true, true, [3.5, 0]);
    //     });
    //     test('Vertical fully within', () => {
    //       const l1 = new Line([0, 0], [0, 10]);
    //       const l2 = new Line([0, 1], [0, 3]);
    //       check(l1, l2, true, true, [0, 3.5]);
    //     });
    //     test('Angle fully within', () => {
    //       const l1 = new Line([0, 0], [10, 10]);
    //       const l2 = new Line([1, 1], [3, 3]);
    //       check(l1, l2, true, true, [3.5, 3.5]);
    //     });
    //     test('Horizontal on end', () => {
    //       const l1 = new Line([0, 0], [10, 0]);
    //       const l2 = new Line([2, 0], [10, 0]);
    //       check(l1, l2, true, true, [5.5, 0]);
    //     });
    //     test('Vertical on end', () => {
    //       const l1 = new Line([0, 0], [0, 10]);
    //       const l2 = new Line([0, 2], [0, 10]);
    //       check(l1, l2, true, true, [0, 5.5]);
    //     });
    //     test('Angle on end', () => {
    //       const l1 = new Line([0, 0], [10, 10]);
    //       const l2 = new Line([2, 2], [10, 10]);
    //       check(l1, l2, true, true, [5.5, 5.5]);
    //     });
    //   });
    // });
    // describe('One 1 End, One 2 End', () => {
    //   describe('Lines are parallel', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 1);
    //       const l2 = new Line([0, 1], [1, 1]);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('vertical', () => {
    //       const l1 = new Line([0, 0], [0, 1]);
    //       const l2 = new Line([1, 0], [1, 1], 0, 1);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [1, 1], 0, 1);
    //       const l2 = new Line([1, 0], [2, 1]);
    //       check(l1, l2, false, false, null);
    //     });
    //   });
    //   describe('Lines Cross', () => {
    //     test('Lines cross at origin', () => {
    //       const l1 = new Line([-1, -1], [1, 1], 0, 1);
    //       const l2 = new Line([-1, 1], [1, -1]);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //     test('Lines cross at point', () => {
    //       const l1 = new Line([0, 0], [2, 2]);
    //       const l2 = new Line([0, 2], [2, 0], 0, 1);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //     test('Lines cross at end of one line', () => {
    //       const l1 = new Line([0, 0], [2, 2], 0, 1);
    //       const l2 = new Line([1, 1], [2, 0]);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //     test('Lines cross when vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [2, 0]);
    //       const l2 = new Line([1, 0], [1, 1], 0, 1);
    //       check(l1, l2, true, true, [1, 0]);
    //     });
    //     test('Lines cross when point definitions do not', () => {
    //       const l1 = new Line([0, 0], [0.5, 0.5], 0, 1);
    //       const l2 = new Line([0, 2], [2, 0]);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //   });
    //   describe('Lines intersect offLine', () => {
    //     test('Intersection is on line 1', () => {
    //       const l1 = new Line([0, 0], [1, 1]);
    //       const l2 = new Line([3, 0], [0, 3], 0, 1);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Intersection is on line 2', () => {
    //       const l1 = new Line([3, 0], [0, 3]);
    //       const l2 = new Line([1, 1], [0, 0], 0, 1);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Intersection is off both lines', () => {
    //       const l1 = new Line([3, 0], [2, 1]);
    //       const l2 = new Line([1, 1], [0, 0], 0, 1);
    //       check(l1, l2, true, false, [1.5, 1.5]);
    //     });
    //     test('Lines cross when vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [2, 0]);
    //       const l2 = new Line([1, 1], [1, 2], 0, 1);
    //       check(l1, l2, true, false, [1, 0]);
    //     });
    //     test('Lines cross when vertical and horizontal at corner', () => {
    //       const l1 = new Line([0, 0], [2, 0], 0, 1);
    //       const l2 = new Line([2, 1], [2, 2]);
    //       check(l1, l2, true, false, [2, 0]);
    //     });
    //   });
    //   describe('Lines collinear partial overlap', () => {
    //     test('Horizontal', () => {
    //       const l1 = new Line([0, 0], [3, 0]);
    //       const l2 = new Line([2, 0], [3.5, 0], 0, 1);
    //       check(l1, l2, true, true, [2.5, 0]);
    //     });
    //     test('Vertical', () => {
    //       const l1 = new Line([0, 3], [0, 0], 0, 1);
    //       const l2 = new Line([0, 2], [0, 3.5]);
    //       check(l1, l2, true, true, [0, 2.5]);
    //     });
    //     test('Angle', () => {
    //       const l1 = new Line([0, 0], [3, 3]);
    //       const l2 = new Line([2, 2], [3.5, 3.5], 0, 1);
    //       check(l1, l2, true, true, [2.5, 2.5]);
    //     });
    //   });
    //   describe('Lines collinear no overlap', () => {
    //     test('Horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0]);
    //       const l2 = new Line([3, 0], [4, 0], 0, 1);
    //       check(l1, l2, true, false, [2, 0]);
    //     });
    //     test('Vertical', () => {
    //       const l1 = new Line([0, 1], [0, 0], 0, 1);
    //       const l2 = new Line([0, 3], [0, 4]);
    //       check(l1, l2, true, false, [0, 2]);
    //     });
    //     test('Angle', () => {
    //       const l1 = new Line([0, 0], [1, 1]);
    //       const l2 = new Line([3, 3], [4, 4], 0, 1);
    //       check(l1, l2, true, false, [2, 2]);
    //     });
    //   });
    //   describe('Lines collinear within', () => {
    //     test('Horizontal fully within', () => {
    //       const l1 = new Line([0, 0], [10, 0], 0, 1);
    //       const l2 = new Line([1, 0], [3, 0]);
    //       check(l1, l2, true, true, [2, 0]);
    //     });
    //     test('Vertical fully within', () => {
    //       const l1 = new Line([0, 0], [0, 10], 0, 1);
    //       const l2 = new Line([0, 1], [0, 3]);
    //       check(l1, l2, true, true, [0, 2]);
    //     });
    //     test('Angle fully within', () => {
    //       const l1 = new Line([1, 1], [3, 3]);
    //       const l2 = new Line([0, 0], [10, 10], 0, 1);
    //       check(l1, l2, true, true, [2, 2]);
    //     });
    //     test('Horizontal on end', () => {
    //       const l1 = new Line([0, 0], [10, 0], 0, 1);
    //       const l2 = new Line([2, 0], [10, 0]);
    //       check(l1, l2, true, true, [6, 0]);
    //     });
    //     test('Vertical on end', () => {
    //       const l1 = new Line([0, 0], [0, 10], 0, 1);
    //       const l2 = new Line([0, 2], [0, 10]);
    //       check(l1, l2, true, true, [0, 6]);
    //     });
    //     test('Angle on end', () => {
    //       const l1 = new Line([0, 0], [10, 10], 0, 1);
    //       const l2 = new Line([2, 2], [10, 10]);
    //       check(l1, l2, true, true, [6, 6]);
    //     });
    //   });
    // });
    // describe('Two 1 Ends', () => {
    //   describe('Lines are Parallel', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 1);
    //       const l2 = new Line([0, 1], [1, 1], 0, 1);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('horizontal backwards', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 1);
    //       const l2 = new Line([1, 1], [0, 1], 0, 1);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('vertical', () => {
    //       const l1 = new Line([0, 0], [0, 1], 0, 1);
    //       const l2 = new Line([1, 0], [1, 1], 0, 1);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [1, 1], 0, 1);
    //       const l2 = new Line([1, 0], [2, 1], 0, 1);
    //       check(l1, l2, false, false, null);
    //     });
    //   });
    //   describe('Lines are Equal', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 1);
    //       const l2 = new Line([0, 0], [2, 0], 0, 1);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //     test('vertical', () => {
    //       const l1 = new Line([1, 0], [1, 1], 0, 1);
    //       const l2 = new Line([1, 0], [1, 2], 0, 1);
    //       check(l1, l2, true, true, [1, 0]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [1, 1], 0, 1);
    //       const l2 = new Line([0, 0], [2, 2], 0, 1);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //   });
    //   describe('Lines Cross', () => {
    //     test('horiztonal and vertical', () => {
    //       const l1 = new Line([1, 1], [2, 1], 0, 1);
    //       const l2 = new Line([4, 4], [4, 3], 0, 1);
    //       check(l1, l2, true, true, [4, 1]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [0.5, 0.5], 0, 1);
    //       const l2 = new Line([2, 0], [1.5, 0.5], 0, 1);
    //       check(l1, l2, true, true, [1, 1]);
    //     });
    //   });
    //   describe('Lines intersect offline', () => {
    //     test('horiztonal and vertical', () => {
    //       const l1 = new Line([1, 1], [2, 1], 0, 1);
    //       const l2 = new Line([4, 3], [4, 4], 0, 1);
    //       check(l1, l2, true, false, [4, 1]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0.5, 0.5], [0, 0], 0, 1);
    //       const l2 = new Line([2, 0], [1.5, 0.5], 0, 1);
    //       check(l1, l2, true, false, [1, 1]);
    //     });
    //   });
    //   describe('Lines collinear partial overlap', () => {
    //     test('horiztonal', () => {
    //       const l1 = new Line([1, 1], [4, 1], 0, 1);
    //       const l2 = new Line([3, 1], [2.5, 1], 0, 1);
    //       check(l1, l2, true, true, [2, 1]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 1], [10, 10], 0, 1);
    //       const l2 = new Line([9, 9], [8, 8], 0, 1);
    //       check(l1, l2, true, true, [5, 5]);
    //     });
    //   });
    //   describe('Lines collinear no overlap', () => {
    //     test('vertical', () => {
    //       const l1 = new Line([1, 1], [1, 4], 0, 1);
    //       const l2 = new Line([1, 0], [1, -8], 0, 1);
    //       check(l1, l2, true, false, [1, 0.5]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 1], [10, 10], 0, 1);
    //       const l2 = new Line([-3, -3], [-8, -8], 0, 1);
    //       check(l1, l2, true, false, [-1, -1]);
    //     });
    //   });
    //   describe('Lines collinear within', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([1, 1], [4, 1], 0, 1);
    //       const l2 = new Line([2, 1], [4, 1], 0, 1);
    //       check(l1, l2, true, true, [1.5, 1]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 1], [10, 10], 0, 1);
    //       const l2 = new Line([2, 2], [8, 8], 0, 1);
    //       check(l1, l2, true, true, [1.5, 1.5]);
    //     });
    //   });
    // });
    // describe('One 0 End, One 1 End', () => {
    //   describe('Lines are Parallel', () => {
    //     test('vertical', () => {
    //       const l1 = new Line([1, 1], [1, 4], 0, 1);
    //       const l2 = new Line([2, 5], null, Math.PI / 2, 0);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 1], [2, 2], 0, 1);
    //       const l2 = new Line([2, 1], [3, 2], 0, 0);
    //       check(l1, l2, false, false, null);
    //     });
    //   });
    //   describe('Lines Cross', () => {
    //     test('vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 0);
    //       const l2 = new Line([4, -1], [4, -0.5], 0, 1);
    //       check(l1, l2, true, true, [4, 0]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([-1, 1], [-0.5, 0.5], 0, 1);
    //       const l2 = new Line([1, 1], [3, 3], 0, 0);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //   });
    //   describe('Lines intersect offline', () => {
    //     test('vertical and horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 0);
    //       const l2 = new Line([4, -0.5], [4, -1], 0, 1);
    //       check(l1, l2, true, false, [4, 0]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([-0.5, 0.5], [-1, 1], 0, 1);
    //       const l2 = new Line([1, 1], [3, 3], 0, 0);
    //       check(l1, l2, true, false, [0, 0]);
    //     });
    //   });
    //   describe('Lines collinear within', () => {
    //     test('horizontal', () => {
    //       const l1 = new Line([0, 0], [1, 0], 0, 0);
    //       const l2 = new Line([-100, 0], [-101, 0], 0, 1);
    //       check(l1, l2, true, true, [-100, 0]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [-1, -1], 0, 1);
    //       const l2 = new Line([1, 1], [3, 3], 0, 0);
    //       check(l1, l2, true, true, [0, 0]);
    //     });
    //   });
    // });
    // describe('Both 0 ends', () => {
    //   describe('Lines Parallel', () => {
    //     test('vertical', () => {
    //       const l1 = new Line([1, 1], [1, 4], 0, 1);
    //       const l2 = new Line([2, 5], null, Math.PI / 2, 0);
    //       check(l1, l2, false, false, null);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 1], [2, 2], 0, 0);
    //       const l2 = new Line([2, 1], [3, 2], 0, 0);
    //       check(l1, l2, false, false, null);
    //     });
    //   });
    //   describe('Lines Equal', () => {
    //     test('horiztonal', () => {
    //       const l1 = new Line([0, 1], [1, 1], 0, 0);
    //       const l2 = new Line([-100, 1], [-101, 1], 0, 0);
    //       check(l1, l2, true, true, [0, 1]);
    //     });
    //     test('vertical', () => {
    //       const l1 = new Line([1, 0], [1, 1], 0, 0);
    //       const l2 = new Line([1, 10], [1, -11], 0, 0);
    //       check(l1, l2, true, true, [1, 0]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([1, 0], [2, 1], 0, 0);
    //       const l2 = new Line([1, 0], [2, 1], 0, 0);
    //       check(l1, l2, true, true, [0, -1]);
    //     });
    //   });
    //   describe('Lines Cross', () => {
    //     test('horizontal and vertical', () => {
    //       const l1 = new Line([1, 0], [1, 1], 0, 0);
    //       const l2 = new Line([0, 2], [0.5, 2], 0, 0);
    //       check(l1, l2, true, true, [1, 2]);
    //     });
    //     test('angled', () => {
    //       const l1 = new Line([0, 0], [2, 2], 0, 0);
    //       const l2 = new Line([5, 0], [4, 1], 0, 0);
    //       check(l1, l2, true, true, [2.5, 2.5]);
    //     });
    //   });
    // });
  });
});
