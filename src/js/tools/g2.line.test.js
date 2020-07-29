import {
  Point, Line, getLine,
} from './g2';
import { round } from './math';

describe('g2 Line', () => {
  describe('Lines can be defined with points', () => {
    test('Line from (0, 0) to (0, 1)', () => {
      const l = new Line(new Point(0, 0), new Point(0, 1));
      expect(l.A).toEqual(1);
      expect(l.B).toEqual(0);
      expect(l.C).toEqual(0);
    });
    test('Line from (0, 0) to (1, 1)', () => {
      const l = new Line(new Point(0, 0), new Point(1, 1));
      expect(l.A).toEqual(1);
      expect(l.B).toEqual(-1);
      expect(l.C).toEqual(0);
    });
    test('Line from (3, -2) to (5, 4)', () => {
      const l = new Line(new Point(3, -2), new Point(5, 4));
      expect(l.A).toEqual(6);
      expect(l.B).toEqual(-2);
      expect(l.C).toEqual(22);
    });
  });
  describe('x can be found from y', () => {
    test('Line from 0, 0 to 1, 1', () => {
      const l = new Line(new Point(0, 0), new Point(1, 1));
      const xResult = l.getXFromY(0.5);
      const yResult = l.getYFromX(0.5);
      expect(xResult).toBe(0.5);
      expect(yResult).toBe(0.5);
    });
    test('Line from 0, 0 to 2, 1', () => {
      const l = new Line(new Point(0, 0), new Point(2, 1));
      const xResult = l.getXFromY(0.5);
      const yResult = l.getYFromX(1);
      expect(xResult).toBe(1);
      expect(yResult).toBe(0.5);
    });
    test('Line from 1, 0 to 1, 1', () => {
      const l = new Line(new Point(1, 0), new Point(1, 1));
      const xResult = l.getXFromY(10);
      const yResult = l.getYFromX(10);
      expect(xResult).toBe(1);
      expect(yResult).toBe(null);
    });
    test('Line from 0, 1 to 1, 1', () => {
      const l = new Line(new Point(0, 1), new Point(1, 1));
      const xResult = l.getXFromY(10);
      const yResult = l.getYFromX(10);
      expect(xResult).toBe(null);
      expect(yResult).toBe(1);
    });
    test('Line from 0, 1 to 2, 0', () => {
      const l = new Line(new Point(0, 1), new Point(2, 0));
      const xResult = l.getXFromY(0.5);
      const yResult = l.getYFromX(1);
      expect(xResult).toBe(1);
      expect(yResult).toBe(0.5);
    });
  });
  describe('Lines can have a length', () => {
    test('Line from 0, 0 to 0, 1 has length 1', () => {
      const l = new Line(new Point(0, 0), new Point(0, 1));
      expect(l.length()).toEqual(1);
    });
    test('Line from 1, 1 to 11, 11 has length 14.7', () => {
      const l = new Line(new Point(1, 1), new Point(11, 11));
      expect(round(l.length(), 5)).toEqual(round(Math.sqrt(2) * 10), 5);
    });
  });
  describe('Lines can have midpoints', () => {
    test('Line from 0, 0 to 0, 2 has midpoint 0, 1', () => {
      const l = new Line(new Point(0, 0), new Point(0, 2));
      expect(l.midPoint().round()).toEqual(new Point(0, 1));
    });
    test('Line from 0, 0 to 2, 2 has midpoint 1, 1', () => {
      const l = new Line(new Point(0, 0), new Point(2, 2));
      expect(l.midPoint().round()).toEqual(new Point(1, 1));
    });
    test('Line from 2, 0 to 4, 0 has midpoint 3, 0', () => {
      const l = new Line(new Point(2, 0), new Point(4, 0));
      expect(l.midPoint().round()).toEqual(new Point(3, 0));
    });
  });
  describe('Lines can be offset', () => {
    let offsetter;
    beforeEach(() => {
      offsetter = (p, mag, angle) => new Point(
        p.x + mag * Math.cos(angle),
        p.y + mag * Math.sin(angle),
      ).round();
    });
    test('Offset 45 to right', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 4));
    });
    test('Offset 45 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 4));
    });
    test('Offset 45 to left', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 3 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 3 * Math.PI / 4));
    });
    test('Offset 45 to top', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 3 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 3 * Math.PI / 4));
    });
    test('Offset 135 to right', () => {
      const l = new Line(new Point(0, 0), 1, 3 * Math.PI / 4);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
    test('Offset 135 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, 3 * Math.PI / 4);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 5 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 5 * Math.PI / 4));
    });
    test('Offset 135 to left', () => {
      const l = new Line(new Point(0, 0), 1, 3 * Math.PI / 4);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 5 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 5 * Math.PI / 4));
    });
    test('Offset 135 to top', () => {
      const l = new Line(new Point(0, 0), 1, 3 * Math.PI / 4);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
    test('Offset 225 to right', () => {
      const l = new Line(new Point(0, 0), 1, 5 * Math.PI / 4);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 4));
    });
    test('Offset 225 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, 5 * Math.PI / 4);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 4));
    });
    test('Offset 225 to left', () => {
      const l = new Line(new Point(0, 0), 1, 5 * Math.PI / 4);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 3 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 3 * Math.PI / 4));
    });
    test('Offset 225 to top', () => {
      const l = new Line(new Point(0, 0), 1, 5 * Math.PI / 4);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 3 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 3 * Math.PI / 4));
    });
    test('Offset 315 to right', () => {
      const l = new Line(new Point(0, 0), 1, 7 * Math.PI / 4);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
    test('Offset 315 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, 7 * Math.PI / 4);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 5 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 5 * Math.PI / 4));
    });
    test('Offset 315 to left', () => {
      const l = new Line(new Point(0, 0), 1, 7 * Math.PI / 4);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 5 * Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 5 * Math.PI / 4));
    });
    test('Offset 315 to top', () => {
      const l = new Line(new Point(0, 0), 1, 7 * Math.PI / 4);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
    test('Offset 0 to right', () => {
      const l = new Line(new Point(0, 0), 1, 0);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 2));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 2));
    });
    test('Offset 0 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, 0);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 2));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 2));
    });
    test('Offset 0 to left', () => {
      const l = new Line(new Point(0, 0), 1, 0);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 2));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 2));
    });
    test('Offset 0 to top', () => {
      const l = new Line(new Point(0, 0), 1, 0);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 2));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 2));
    });
    test('Offset 90 to right', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 2);
      const o = l.offset('right', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 0));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 0));
    });
    test('Offset 90 to bottom', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 2);
      const o = l.offset('bottom', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI));
    });
    test('Offset 90 to left', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 2);
      const o = l.offset('left', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI));
    });
    test('Offset 90 to top', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 2);
      const o = l.offset('top', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, 0));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, 0));
    });
    test('Offset 45 to negative', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('negative', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, -Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, -Math.PI / 4));
    });
    test('Offset 135 to negative', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 3);
      const o = l.offset('negative', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
    test('Offset 225 to negative', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 5);
      const o = l.offset('negative', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4 * 3));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4 * 3));
    });
    test('Offset 315 to negative', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 7);
      const o = l.offset('negative', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4 * 5));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4 * 5));
    });
    test('Offset 45 to positive', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4);
      const o = l.offset('positive', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4 * 3));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4 * 3));
    });
    test('Offset 135 to positive', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 3);
      const o = l.offset('positive', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4 * 5));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4 * 5));
    });
    test('Offset 225 to positive', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 5);
      const o = l.offset('positive', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4 * 7));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4 * 7));
    });
    test('Offset 315 to positive', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 4 * 7);
      const o = l.offset('positive', 0.1);
      expect(o.p1.round()).toEqual(offsetter(l.p1, 0.1, Math.PI / 4));
      expect(o.p2.round()).toEqual(offsetter(l.p2, 0.1, Math.PI / 4));
    });
  });
  describe('Lines can have points within them', () => {
    describe('Two Ends', () => {
      test('Line <0, 0 2, 0> has point 1, 0 within it', () => {
        const l = new Line(new Point(0, 0), new Point(2, 0));
        const p = new Point(1, 0);
        expect(l.hasPointOn(p)).toEqual(true);
      });
      test('Line <0, 0 2, 2> has point 1, 1 within it', () => {
        const l = new Line(new Point(0, 0), new Point(2, 2));
        const p = new Point(1, 1);
        expect(l.hasPointOn(p)).toEqual(true);
      });
      test('Line <0, 0 2, 2> has point 2, 2 within it', () => {
        const l = new Line(new Point(0, 0), new Point(2, 2));
        const p = new Point(2, 2);
        expect(l.hasPointOn(p)).toEqual(true);
      });
      test('Line <0, 0 2, 2> does not have point 3, 3 within it', () => {
        const l = new Line(new Point(0, 0), new Point(2, 2));
        const p = new Point(3, 3);
        expect(l.hasPointOn(p)).toEqual(false);
      });
      test('Line <0, 0 2, 2> has point 3, 3 on it when unbound', () => {
        const l = new Line(new Point(0, 0), new Point(2, 2));
        const p = new Point(3, 3);
        expect(l.hasPointAlong(p)).toEqual(true);
      });
      test('Line <0, 0 2, 2> does not have point 0, 3 on it when unbound', () => {
        const l = new Line(new Point(0, 0), new Point(2, 2));
        const p = new Point(0, 3);
        expect(l.hasPointAlong(p)).toEqual(false);
        expect(l.hasPointAlong(p, 8)).toEqual(false);
      });
    });
    describe('One End', () => {
      test('On line from x = 1, to x = inf', () => {
        const l = new Line([1, 0], null, 0, 1);
        const p = new Point(20, 0);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('Off line from x = 1, to x = inf', () => {
        const l = new Line([1, 0], null, 0, 1);
        const p = new Point(-20, 0);
        expect(l.hasPointOn(p)).toBe(false);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('On line from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 1);
        const p = new Point(-9, 11);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('On end of line from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 1);
        const p = new Point(1, 1);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('Off end of line from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 1);
        const p = new Point(2, 0);
        expect(l.hasPointOn(p)).toBe(false);
        expect(l.hasPointAlong(p)).toBe(true);
      });
    });
    describe('0 Ends', () => {
      test('On line from x = 1, to x = inf', () => {
        const l = new Line([1, 0], null, 0, 0);
        const p = new Point(20, 0);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('Different on line from x = 1, to x = inf', () => {
        const l = new Line([1, 0], null, 0, 0);
        const p = new Point(-20, 0);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('On line from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 0);
        const p = new Point(-9, 11);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('On end of line definition from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 0);
        const p = new Point(1, 1);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
      test('Off end of line definition from (1, 1) to (-inf, inf)', () => {
        const l = new Line([1, 1], null, 3 * Math.PI / 4, 0);
        const p = new Point(2, 0);
        expect(l.hasPointOn(p)).toBe(true);
        expect(l.hasPointAlong(p)).toBe(true);
      });
    });
  });
  describe('Lines can be compared to other lines', () => {
    test('Line 1 is same as Line 2', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(2, 0));
      const res = l1.isEqualTo(l2);
      const res1 = l1.isWithinLine(l2);
      expect(res).toEqual(true);
      expect(res1).toEqual(true);
    });
    test('Line 1 is not same as Line 2', () => {
      const l1 = new Line(new Point(0, 0.01), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(2, 0));
      const res = l1.isEqualTo(l2);
      expect(res).not.toEqual(true);
    });
    test('Line 1 is same as Line 2 with 0 precision', () => {
      const l1 = new Line(new Point(0, 0.1), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(4, 0));
      const res = l1.isEqualTo(l2, 0);
      expect(res).not.toEqual(true);
    });
    test('Line 1 is same as Line 2 with 1 precision', () => {
      const l1 = new Line(new Point(0, 0.01), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(4, 0));
      const res = l1.isEqualTo(l2, 1);
      expect(res).not.toEqual(true);
    });
    test('Line 1 is on the same line as Line 2', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(4, 0));
      const res = l1.isWithinLine(l2);
      expect(res).toEqual(true);
    });
    test('Line 1 is on the same line as Line 2 - test 2', () => {
      const l1 = new Line(new Point(0, 0), new Point(1, 1));
      const l2 = new Line(new Point(2, 2), new Point(3, 3));
      expect(l1.isWithinLine(l2)).toBe(false);
      expect(l2.isWithinLine(l1)).toBe(false);
      expect(l1.isAlongLine(l2)).toBe(true);
    });
    test('Line 1 is on the same line as Line 2 - test 3', () => {
      const l1 = new Line(new Point(0, 0), new Point(1, 1));
      const l2 = new Line(new Point(0, 1), new Point(1, 2));
      const res = l1.isWithinLine(l2);
      expect(res).not.toEqual(true);
    });
    test('Line1 is offset to line 2 in y', () => {
      const l1 = new Line(new Point(0, 0), new Point(1, 1));
      const l2 = new Line(new Point(0, 1), new Point(1, 2));
      const res = l1.isEqualTo(l2);
      expect(res).toEqual(false);
    });
    test('Line1 has different end points to line 2', () => {
      const l1 = new Line(new Point(0, 0), new Point(1, 1));
      const l2 = new Line(new Point(0, 0), new Point(1, 1));
      l2.p1 = new Point(0.5, 0.5);
      const res = l1.isEqualTo(l2);
      expect(res).toEqual(false);
    });
    test('Line2 has different end points to line 1', () => {
      const l1 = new Line(new Point(0, 0), new Point(1, 1));
      const l2 = new Line(new Point(0, 0), new Point(1, 1));
      l2.p2 = new Point(0.5, 0.5);
      const res = l1.isEqualTo(l2);
      expect(res).toEqual(false);
    });
    describe('1 end', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line([0, 0], [2, 0], 0, 1);
        const l2 = new Line([0, 0], [2, 0], 0, 1);
        expect(l1.isEqualTo(l2)).toBe(true);
        expect(l1.isWithinLine(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 finite, same definition', () => {
        const l1 = new Line([0, 0], [2, 0], 0, 1);
        const l2 = new Line([0, 0], [2, 0], 0, 2);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(true);
      });
      test('Line 1 infinite, Line 2 infinite, different ends', () => {
        const l1 = new Line([0, 0], [2, 0], 0, 1);
        const l2 = new Line([1, 0], [2, 0], 0, 1);
        expect(l1.isEqualTo(l2)).toBe(false);
        expect(l1.isWithinLine(l2)).toBe(false);
        expect(l2.isWithinLine(l1)).toBe(true);
      });
    });
  });
  describe('Lines can intersect with other lines', () => {
    test('Line 0, 0<>2, 0 with 1, -1<>1, 1 has intersection 1, 0', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(1, -1), new Point(1, 1));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect).toEqual(new Point(1, 0));
    });
    test('Line 0, 0<>2, 0 with 1, -1<>1, -0.5 has intersection 1, 0 which is outside the line definition', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(1, -1), new Point(1, -0.5));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(false);
      expect(res.intersect).toEqual(new Point(1, 0));
    });
    test('Line 0, 0<>2, 0 with 0, 1<>2, 1 has no intersection', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(0, 1), new Point(2, 1));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(false);
      expect(res.inLine).toEqual(false);
    });
    test('Line 0, 0<>2, 0 with 4, 0<>5, 0 has as intersection at 3, 0', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(4, 0), new Point(5, 0));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(false);
      expect(res.intersect).toEqual(new Point(3, 0));
    });
    test('Line 1, 0<>2, 0 with 0, 0<>4, 0 has as intersection at 2.75, 0', () => {
      const l1 = new Line(new Point(1, 0), new Point(2, 0));
      const l2 = new Line(new Point(0, 0), new Point(4, 0));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect.round()).toEqual(new Point(1.75, 0));
    });
    test('Line 0, 0<>2, 0 with 1, 0<>4, 0 has as intersection at 1.5, 0', () => {
      const l1 = new Line(new Point(0, 0), new Point(2, 0));
      const l2 = new Line(new Point(1, 0), new Point(4, 0));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect.round()).toEqual(new Point(1.5, 0));
    });
    test('Line 1, 0<>2, 0 with 1, 0<>4, 0 has as intersection at 1.5, 0', () => {
      const l1 = new Line(new Point(1, 0), new Point(2, 0));
      const l2 = new Line(new Point(1, 0), new Point(4, 0));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect).toEqual(new Point(2, 0));
    });
    test('Line 1, 0<>2, 0 with 2, 0<>3, 0 has as intersection at 2, 0', () => {
      const l1 = new Line(new Point(1, 0), new Point(2, 0));
      const l2 = new Line(new Point(2, 0), new Point(3, 0));
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect).toEqual(new Point(2, 0));
    });
    // 0.804, y: 0.04029297190976889
    test('Line 1, 0<>2, 0 with 2, 0<>3, 0 has as intersection at (2, 0) 2', () => {
      const l1 = new Line(
        new Point(0.804, 0.04029297190976889),
        new Point(0.804, 0.05036621488721111),
      );
      const l2 = new Line(
        new Point(0.804, 0.05036621488721111),
        new Point(0.804, 0.06043945786465334),
      );
      const res = l1.intersectsWith(l2);
      expect(res.onLine).toEqual(true);
      expect(res.inLine).toEqual(true);
      expect(res.intersect).toEqual(new Point(0.804, 0.05036621488721111));
    });
  });
  describe('Lines Misc', () => {
    test('Line rounding', () => {
      const l = new Line(new Point(0, 0), 1, Math.PI / 3).round();
      expect(l.ang).toBe(1.04719755);
      expect(l.A).toBe(0.8660254);
      expect(l.B).toBe(-0.5);
      expect(l.C).toBe(0);
      expect(l.distance).toBe(1);
    });
    test('Line distance to point', () => {
      const l = new Line(new Point(0, 0), 1, 0);
      expect(l.distanceToPoint(new Point(2, 2))).toBe(2);
    });
  });
  describe('getLine', () => {
    test('Line Object', () => {
      const l = new Line([0, 0], [1, 1]);
      expect(getLine(l)).toEqual(l);
    });
    test('Line two points', () => {
      const l = new Line([0, 0], [1, 1]);
      expect(getLine([[0, 0], [1, 1]])).toEqual(l);
    });
    test('Line one point', () => {
      const l1 = new Line([0, 0], [0, 1]);
      const l2 = getLine([[0, 0], 1, Math.PI / 2]);
      expect(l2.round().A).toBe(l1.round().A);
      expect(l2.round().B).toBe(l1.round().B);
      expect(l2.round().C).toBe(l1.round().C);
      expect(l2.round().ang).toBe(l1.round().ang);
      expect(l2.round().distance).toBe(l1.round().distance);
    });
    test('One End Line Points with same angle', () => {
      const l1 = new Line([0, 0], [1, 0], 0, 1);
      expect(l1.p1).toEqual(new Point(0, 0));
      expect(l1.p2).toEqual(new Point(1, 0));
      expect(l1.ang).toBe(0);
      expect(l1.ends).toBe(1);
    });
    test('One End Line Points with different angle', () => {
      const l1 = new Line([0, 0], [1, 1], 0, 1);
      expect(l1.p1).toEqual(new Point(0, 0));
      expect(l1.p2).toEqual(new Point(1, 1));
      expect(round(l1.ang)).toBe(round(Math.PI / 4));
      expect(l1.ends).toBe(1);
    });
    test('One End Line from Point and angle', () => {
      const l1 = new Line([0, 0], null, 0, 1);
      expect(l1.p1).toEqual(new Point(0, 0));
      expect(l1.p2).toEqual(new Point(1, 0));
      expect(round(l1.ang)).toBe(round(0));
      expect(l1.ends).toBe(1);
    });
    test('No End Line from Point and angle', () => {
      const l1 = new Line([0, 0], null, 0, 0);
      expect(l1.p1).toEqual(new Point(0, 0));
      expect(l1.p2).toEqual(new Point(1, 0));
      expect(round(l1.ang)).toBe(round(0));
      expect(l1.ends).toBe(0);
    });
    test('Def', () => {
      const l = new Line([0, 0], [1, 1]);
      expect(getLine(l._state())).toEqual(l);
    });
    test('JSON array', () => {
      const json = '[[0, 0], [1, 1]]';
      expect(getLine(json)).toEqual(new Line([0, 0], [1, 1]));
    });
    test('JSON Def', () => {
      const json = '{ "f1Type": "l", "state": [[0, 0], [1, 1], 2] }';
      expect(getLine(json)).toEqual(new Line([0, 0], [1, 1]));
    });
    test('Fail Undefined', () => {
      const l = new Line([0, 0], [1, 0]);
      expect(getLine()).toEqual(l);
    });
    test('Fail wrong input', () => {
      const l = new Line([0, 0], [1, 0]);
      expect(getLine(1)).toEqual(l);
    });
    test('Fail bad json', () => {
      const l = new Line([0, 0], [1, 0]);
      expect(getLine('asdf')).toEqual(l);
    });
  });
});
