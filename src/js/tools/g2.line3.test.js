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
});
