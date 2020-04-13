import {
  Point, Transform, Line, minAngleDiff, normAngle,
  TransformLimit, spaceToSpaceTransform, Rect, getRect,
  getBoundingRect, polarToRect, rectToPolar, getDeltaAngle,
  normAngleTo90, deg, curvedPath, parsePoint, threePointAngle,
  threePointAngleMin, getTransform,
} from './g2';
import { round } from './math';

describe('g2 tests', () => {
  describe('Points', () => {
    describe('Point Creation', () => {
      test('point(0, 0) creates a point at x=0, y=0', () => {
        const p = new Point(0, 0);
        expect(p.x).toEqual(0);
        expect(p.y).toEqual(0);
      });
      test('point(2, -4) creates a point at x=2, y=-4', () => {
        const p = new Point(2, -4);
        expect(p.x).toEqual(2);
        expect(p.y).toEqual(-4);
      });
      test('zero point', () => {
        const p = Point.zero();
        expect(p).toEqual(new Point(0, 0));
      });
      test('unity point', () => {
        const p = Point.Unity();
        expect(p).toEqual(new Point(1, 1));
      });
    });

    describe('Points can be added to each other', () => {
      test('(0, 0) + (1, 1) = (1, 1)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 1);
        const s = p.add(q);
        expect(s).toEqual(new Point(1, 1));
      });
      test('(0, 0) + (1, 1) = (1, 1) using numbers', () => {
        const p = new Point(0, 0);
        const s = p.add(1, 1);
        expect(s).toEqual(new Point(1, 1));
      });
      test('(0, 0) + (1, -1) = (1, -1)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, -1);
        const s = p.add(q);
        expect(s).toEqual(new Point(1, -1));
      });
      test('(0, 0) + (1, 1) + (1, 1) = (2, 2)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 1);
        const s = p.add(q).add(q);
        expect(s).toEqual(new Point(2, 2));
      });
      test('(0, 0) + (1, 1) = (2, 2) using numbers', () => {
        const p = new Point(0, 0);
        const s = p.add(1, 1).add(1, 1);
        expect(s).toEqual(new Point(2, 2));
      });
    });

    describe('Points can be subtracted from each other', () => {
      test('(0, 0) - (1, 1) = (-1, -1)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 1);
        const s = p.sub(q);
        expect(s).toEqual(new Point(-1, -1));
      });
      test('(0, 0) - (1, 1) = (-1, -1) using numbers', () => {
        const p = new Point(0, 0);
        const s = p.sub(1, 1);
        expect(s).toEqual(new Point(-1, -1));
      });
      test('(0, 0) - (1, -1) = (-1, 1)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, -1);
        const s = p.sub(q);
        expect(s).toEqual(new Point(-1, 1));
      });
      test('(0, 0) - (1, 1) - (1, 1) = (-2, -2)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 1);
        const s = p.sub(q).sub(q);
        expect(s).toEqual(new Point(-2, -2));
      });
      test('(0, 0) - (1, 1) - (1, 1) = (-2, -2) using numbers', () => {
        const p = new Point(0, 0);
        const s = p.sub(1, 1).sub(1, 1);
        expect(s).toEqual(new Point(-2, -2));
      });
    });
    describe('Points can be clipped', () => {
      let p0;
      let p1;
      let p2;
      let p3;
      beforeEach(() => {
        p0 = new Point(0, 0);
        p1 = new Point(1, 1);
        p2 = new Point(-1, -1);
        p3 = new Point(-1, 1);
      });
      test('Unclipped points number input', () => {
        expect(p0.clip(-2, 2)).toEqual(p0);
        expect(p1.clip(-2, 2)).toEqual(p1);
        expect(p2.clip(-2, 2)).toEqual(p2);
        expect(p3.clip(-2, 2)).toEqual(p3);

        expect(p1.clip(0.5, 2)).toEqual(p1);
        expect(p2.clip(-2, -0.5)).toEqual(p2);
      });
      test('Unclipped points Point input', () => {
        expect(p0.clip(new Point(-2, -2), new Point(2, 2))).toEqual(p0);
        expect(p1.clip(new Point(-2, -2), new Point(2, 2))).toEqual(p1);
        expect(p2.clip(new Point(-2, -2), new Point(2, 2))).toEqual(p2);
        expect(p3.clip(new Point(-2, -2), new Point(2, 2))).toEqual(p3);

        expect(p1.clip(new Point(0.5, 0.5), new Point(2, 2))).toEqual(p1);
        expect(p2.clip(new Point(-2, -2), new Point(-0.5, -0.5))).toEqual(p2);
        expect(p3.clip(new Point(-2, 0.5), new Point(-0.5, 2))).toEqual(p3);
      });
      test('Unclipped points null input', () => {
        expect(p0.clip(null, null)).toEqual(p0);
        expect(p1.clip(null, null)).toEqual(p1);
        expect(p2.clip(null, null)).toEqual(p2);
        expect(p3.clip(null, null)).toEqual(p3);
      });
      test('Clipped points number input', () => {
        expect(p0.clip(-2, -1)).toEqual(new Point(-1, -1));
        expect(p0.clip(1, 2)).toEqual(new Point(1, 1));
        expect(p1.clip(-3, -2)).toEqual(new Point(-2, -2));
        expect(p1.clip(2, 3)).toEqual(new Point(2, 2));
        expect(p2.clip(-3, -2)).toEqual(new Point(-2, -2));
        expect(p2.clip(2, 3)).toEqual(new Point(2, 2));
        expect(p3.clip(-2, 0)).toEqual(new Point(-1, 0));
        expect(p3.clip(0, 2)).toEqual(new Point(0, 1));
      });
      test('Fully clipped points Point input', () => {
        expect(p0.clip(new Point(-2, -2), new Point(-1, -1)))
          .toEqual(new Point(-1, -1));
        expect(p0.clip(new Point(1, 1), new Point(2, 2)))
          .toEqual(new Point(1, 1));
        expect(p1.clip(new Point(-3, -3), new Point(-2, -2)))
          .toEqual(new Point(-2, -2));
        expect(p1.clip(new Point(2, 2), new Point(3, 3)))
          .toEqual(new Point(2, 2));
        expect(p2.clip(new Point(-3, -3), new Point(-2, -2)))
          .toEqual(new Point(-2, -2));
        expect(p2.clip(new Point(2, 2), new Point(3, 3)))
          .toEqual(new Point(2, 2));
      });
      test('Partial clipped points Point input', () => {
        expect(p0.clip(new Point(-2, -2), new Point(-1, 2)))
          .toEqual(new Point(-1, 0));
        expect(p1.clip(new Point(-2, -3), new Point(2, -2)))
          .toEqual(new Point(1, -2));
        expect(p2.clip(new Point(-2, -3), new Point(2, -2)))
          .toEqual(new Point(-1, -2));
        expect(p3.clip(new Point(-2, -2), new Point(0, 0)))
          .toEqual(new Point(-1, 0));
        expect(p3.clip(new Point(0, 0), new Point(2, 2)))
          .toEqual(new Point(0, 1));
      });
      test('Partial clipped with null', () => {
        expect(p0.clip(null, -1)).toEqual(new Point(-1, -1));
        expect(p0.clip(-1, null)).toEqual(new Point(0, 0));
        expect(p0.clip(1, null)).toEqual(new Point(1, 1));
      });
    });
    describe('Points can be scaled', () => {
      test('(0, 0) * 2 = (0, 0)', () => {
        const p = new Point(0, 0);
        const s = p.scale(2);
        expect(s).toEqual(p);
      });
      test('(1, -1) * 2 = (2, -2)', () => {
        const p = new Point(1, -1);
        const s = p.scale(2);
        expect(s).toEqual(new Point(2, -2));
      });
    });

    describe('Points can be rotated around 0, 0', () => {
      test('Rotate (1, 0) by 90 deg = (0, 1)', () => {
        const p = new Point(1, 0);
        const s = p.rotate(Math.PI / 2);
        expect(s.round()).toEqual(new Point(0, 1).round());
      });
      test('Rotate (1, 1) by -45 deg = (0, sqrt(2))', () => {
        const p = new Point(1, 1);
        const s = p.rotate(-Math.PI / 4);
        expect(s.round()).toEqual(new Point(Math.sqrt(2), 0).round());
      });
    });

    describe('Points can be rotated around other points', () => {
      test('Rotate (1, 0.5) by 90 deg around (0.5, 0.5) = (0.5, 1)', () => {
        const p = new Point(1, 0.5);
        const q = new Point(0.5, 0.5);
        const s = p.rotate(Math.PI / 2, q);
        expect(s.round()).toEqual(new Point(0.5, 1).round());
      });
      test('Rotate (1, 1) by -45 deg around (-1, -1) = (2 * sqrt(2)-1, -1)', () => {
        const p = new Point(1, 1);
        const q = new Point(-1, -1);
        const s = p.rotate(-Math.PI / 4, q);
        expect(s.round()).toEqual(new Point(2 * Math.sqrt(2) - 1, -1).round());
      });
    });

    describe('Points can be compared to other points', () => {
      test('(0, 0) == (0, 0)', () => {
        const p = new Point(0, 0);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q)).toEqual(true);
      });
      test('(-1, 4) == (-1, 4)', () => {
        const p = new Point(-1, 4);
        const q = new Point(-1, 4);
        expect(p.isEqualTo(q)).toEqual(true);
      });
      test('(0, 0) != (1, 0)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 0);
        expect(p.isEqualTo(q)).toEqual(false);
      });
      test('0.001, 0.001 != 0, 0 with precision 3', () => {
        const p = new Point(0.001, 0.001);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 3)).toEqual(false);
      });
      test('(0.001, 0.001) == (0, 0) with precision 2', () => {
        const p = new Point(0.001, 0.001);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 2)).toEqual(true);
      });
      test('(-0, 0) == (0, 0)', () => {
        const p = new Point(-0, 0);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q)).toEqual(true);
      });
      test('(0, 0) != (1, 0) using isNotEqualTo', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 0);
        expect(p.isNotEqualTo(q)).toEqual(true);
      });
      test('(0, 0) == (0.1, 0) with precision of 0', () => {
        const p = new Point(0, 0);
        const q = new Point(0.1, 0);
        expect(p.isEqualTo(q, 0)).toEqual(true);
      });
    });

    describe('Points can be on a line', () => {
      test('(0, 0) is within the line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(0, 0);
        expect(p.isOnLine(l)).toEqual(true);
      });
      test('(1, 0) is within the line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(1, 0);
        expect(p.isOnLine(l)).toEqual(true);
      });
      test('(0, 1) is not within the line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(0, 1);
        expect(p.isOnLine(l)).toEqual(false);
      });
      test('(2, 0) is not within the line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(2, 0);
        expect(p.isOnLine(l)).toEqual(false);
      });
      test('(2, 0) is on the unbound line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(2, 0);
        expect(p.isOnUnboundLine(l)).toEqual(true);
      });
      test('(2, 2) is not on the unbound line <(-1, 0) (1, 0)>', () => {
        const l = new Line(new Point(-1, 0), new Point(1, 0));
        const p = new Point(2, 2);
        expect(p.isOnUnboundLine(l)).toEqual(false);
      });
    });

    describe('Points can have a shaddow on a line', () => {
      test('(1, 1) has a shaddow on line (0, 0) to (2, 0)', () => {
        const l = new Line(new Point(0, 0), new Point(2, 0));
        const p = new Point(1, 1);
        expect(p.getShaddowOnLine(l).round()).toEqual(new Point(1, 0));
        expect(p.shaddowIsOnLine(l)).toBe(true);
      });
      test('(3, 1) does not have a shaddow on line (0, 0) to (2, 0)', () => {
        const l = new Line(new Point(0, 0), new Point(2, 0));
        const p = new Point(3, 1);
        expect(p.getShaddowOnLine(l)).toBe(null);
        expect(p.shaddowIsOnLine(l)).toBe(false);
      });
      test('(-1, 0) has a shaddow on line (1, 0) to (0, -1)', () => {
        const l = new Line(new Point(1, 0), new Point(0, -1));
        const p = new Point(-1, 0);
        expect(p.getShaddowOnLine(l).round()).toEqual(new Point(0, -1));
        expect(p.shaddowIsOnLine(l)).toBe(true);
      });
    });

    describe('Points can be checked to be on or within a polygon', () => {
      let closedSquare;
      let square;
      beforeEach(() => {
        closedSquare = [
          new Point(-1, -1),
          new Point(-1, 1),
          new Point(1, 1),
          new Point(1, -1),
          new Point(-1, -1),
        ];
        square = [
          new Point(-1, -1),
          new Point(-1, 1),
          new Point(1, 1),
          new Point(1, -1),
        ];
      });
      test('(0, 0) is within the closed unit square', () => {
        const p = new Point(0, 0);
        expect(p.isInPolygon(closedSquare)).toEqual(true);
      });
      test('(2, 2) is not within the closed unit square', () => {
        const p = new Point(2, 2);
        expect(p.isInPolygon(closedSquare)).toEqual(false);
      });
      test('(0, 0) is within the open unit square', () => {
        const poly = [
          new Point(-1, -1),
          new Point(-1, 1),
          new Point(1, 1),
          new Point(1, -1)];
        const p = new Point(0, 0);
        expect(p.isInPolygon(poly)).toEqual(true);
      });
      test('(2, 2) is not within the open unit square', () => {
        const p = new Point(2, 2);
        expect(p.isInPolygon(square)).toEqual(false);
      });
      test('(1, 1) is not within the open unit square', () => {
        const p = new Point(1, 1);
        expect(p.isInPolygon(square)).toEqual(false);
      });
      test('(1, 1) is on the corner of the open unit square', () => {
        const p = new Point(1, 1);
        expect(p.isOnPolygon(square)).toEqual(true);
      });
      test('1, 0 is on the side of the open unit square', () => {
        const p = new Point(1, 0);
        expect(p.isOnPolygon(square)).toEqual(true);
      });
      test('1, 0 is on the side of the closed unit square', () => {
        const p = new Point(1, 0);
        expect(p.isOnPolygon(closedSquare)).toEqual(true);
      });
      test('isOnPolygon when actually in open square', () => {
        const p = new Point(0, 0);
        expect(p.isOnPolygon(square)).toEqual(true);
      });
      test('isOnPolygon when actually in closed square', () => {
        const p = new Point(0, 0);
        expect(p.isOnPolygon(closedSquare)).toEqual(true);
      });
      test('isOnPolygon when not actually in open square', () => {
        const p = new Point(2, 2);
        expect(p.isOnPolygon(square)).toEqual(false);
      });
      test('isOnPolygon when not actually in closed square', () => {
        const p = new Point(2, 2);
        expect(p.isOnPolygon(closedSquare)).toEqual(false);
      });
    });
  });
  describe('Lines', () => {
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
    describe('Lines can be compared to other lines', () => {
      test('Line 1 is same as Line 2', () => {
        const l1 = new Line(new Point(0, 0), new Point(2, 0));
        const l2 = new Line(new Point(0, 0), new Point(2, 0));
        const res = l1.isEqualTo(l2);
        const res1 = l1.isOnSameLineAs(l2);
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
        const res = l1.isOnSameLineAs(l2);
        expect(res).toEqual(true);
      });
      test('Line 1 is on the same line as Line 2 - test 2', () => {
        const l1 = new Line(new Point(0, 0), new Point(1, 1));
        const l2 = new Line(new Point(2, 2), new Point(3, 3));
        const res = l1.isOnSameLineAs(l2);
        expect(res).toEqual(true);
      });
      test('Line 1 is on the same line as Line 2 - test 3', () => {
        const l1 = new Line(new Point(0, 0), new Point(1, 1));
        const l2 = new Line(new Point(0, 1), new Point(1, 2));
        const res = l1.isOnSameLineAs(l2);
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
  });

  describe('Minimum angle difference can be calculated from two angles', () => {
    describe('Normal', () => {
      test('30 - 20 = 10', () => {
        const res = minAngleDiff(30 * Math.PI / 180, 20 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(10 * Math.PI / 180, 8));
      });
      test('20 - 30 = -10', () => {
        const res = minAngleDiff(20 * Math.PI / 180, 30 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-10 * Math.PI / 180, 8));
      });
      test('170 - 190 = -20', () => {
        const res = minAngleDiff(170 * Math.PI / 180, 190 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-20 * Math.PI / 180, 8));
      });
      test('190 - 170 = 20', () => {
        const res = minAngleDiff(190 * Math.PI / 180, 170 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(20 * Math.PI / 180, 8));
      });
    });
    describe('On either size of 0', () => {
      test('10 - -10 = 20', () => {
        const res = minAngleDiff(10 * Math.PI / 180, -10 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(20 * Math.PI / 180, 8));
      });
      test('-10 - 10 = -20', () => {
        const res = minAngleDiff(-10 * Math.PI / 180, 10 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-20 * Math.PI / 180, 8));
      });
      test('10 - 350 = 20', () => {
        const res = minAngleDiff(10 * Math.PI / 180, 350 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(20 * Math.PI / 180, 8));
      });
      test('350 - 10 = -20', () => {
        const res = minAngleDiff(350 * Math.PI / 180, 10 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-20 * Math.PI / 180, 8));
      });
      test('350 - 0 = -10', () => {
        const res = minAngleDiff(350 * Math.PI / 180, 0 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-10 * Math.PI / 180, 8));
      });
      test('370 - 350 = 20', () => {
        const res = minAngleDiff(370 * Math.PI / 180, 350 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(20 * Math.PI / 180, 8));
      });
      test('350 - 370 = -20', () => {
        const res = minAngleDiff(350 * Math.PI / 180, 370 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-20 * Math.PI / 180, 8));
      });
    });
    describe('Same angles', () => {
      test('20 - 20 = 0', () => {
        const res = minAngleDiff(20 * Math.PI / 180, 20 * Math.PI / 180);
        expect(round(res, 8)).toEqual(0);
      });
      test('20 - 380 = 0', () => {
        const res = minAngleDiff(20 * Math.PI / 180, 380 * Math.PI / 180);
        expect(round(res, 8)).toEqual(0);
      });
      test('0 - 360 = 0', () => {
        const res = minAngleDiff(0 * Math.PI / 180, 360 * Math.PI / 180);
        expect(round(res, 8)).toEqual(0);
      });
      test('90 - 450 = 0', () => {
        const res = minAngleDiff(90 * Math.PI / 180, 450 * Math.PI / 180);
        expect(round(res, 8)).toEqual(0);
      });
    });
    describe('180 deg separation', () => {
      test('180 - 0 = 180', () => {
        const res = minAngleDiff(Math.PI, 0);
        // console.log("res:", res, round(res, 8))
        expect(round(res, 8)).toEqual(round(Math.PI, 8));
      });
      test('0 - 180 = -180', () => {
        const res = minAngleDiff(0, Math.PI);
        // console.log("res:", res, round(res, 8))
        expect(round(res, 8)).toEqual(round(-Math.PI, 8));
      });
      test('90 - 270 = -180', () => {
        const res = minAngleDiff(90 * Math.PI / 180, 270 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(-Math.PI, 8));
      });
      test('270 - 90 = 180', () => {
        const res = minAngleDiff(270 * Math.PI / 180, 90 * Math.PI / 180);
        expect(round(res, 8)).toEqual(round(Math.PI, 8));
      });
    });
  });
  describe('Angles can be normalized to between 0 and 360', () => {
    test('30 -> 30', () => {
      const res = normAngle(30 * Math.PI / 180);
      expect(round(res, 8)).toEqual(round(30 * Math.PI / 180, 8));
    });
    test('-30 -> 330', () => {
      const res = normAngle(-30 * Math.PI / 180);
      expect(round(res, 8)).toEqual(round(330 * Math.PI / 180, 8));
    });
    test('360 -> 0', () => {
      const res = normAngle(360 * Math.PI / 180);
      expect(round(res, 8)).toEqual(round(0 * Math.PI / 180, 8));
    });
  });
  describe('Transform', () => {
    test('Create rotation', () => {
      const t = new Transform().rotate(Math.PI / 2);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(0, 1));
    });
    test('Create translation', () => {
      const t = new Transform().translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.m());
      expect(p1.round()).toEqual(new Point(2, 1));
    });
    test('Create scale', () => {
      const t = new Transform().scale(2, 2);
      const p0 = new Point(1, 0.5);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(2, 1));
    });
    test('Create R, T', () => {
      const t = new Transform().rotate(Math.PI / 2).translate(1, 1);
      const p0 = new Point(2, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, T', () => {
      const t = new Transform().scale(2, 2).rotate(Math.PI / 2).translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, then T', () => {
      const t1 = new Transform().scale(2, 2).rotate(Math.PI / 2);
      const t2 = t1.translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t2.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, T, T, S', () => {
      let t1 = new Transform().scale(2, 2).rotate(Math.PI / 2);
      t1 = t1.translate(1, 1).translate(-5, 0).scale(2, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t1.matrix());
      expect(p1.round()).toEqual(new Point(-8, 3));
    });
    test('Update R in S, R, T', () => {
      const t = new Transform().scale(2, 2).rotate(Math.PI).translate(1, 1);
      t.update(1).rotate(Math.PI / 2);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Get rotation', () => {
      const t = new Transform().scale(2, 2).rotate(1).translate(1, 1)
        .rotate(2);
      expect(t.r()).toBe(1);
      expect(t.r(0)).toBe(1);
      expect(t.r(1)).toBe(2);
      expect(t.r(2)).toBe(null);
    });
    test('Update rotation', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateRotation(4);
      expect(t.r()).toBe(4);

      t.updateRotation(5, 0);
      expect(t.r(0)).toBe(5);

      t.updateRotation(6, 1);
      expect(t.r(1)).toBe(6);

      t.updateRotation(7, 2);
      expect(t.r(0)).toBe(5);
      expect(t.r(1)).toBe(6);
    });
    test('Update rotation checking matrix', () => {
      const t = new Transform().rotate(0);
      const matrix = t.m();
      t.updateRotation(1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(1).m());
    });
    test('Update rotation at index matrix', () => {
      const t = new Transform().rotate(0).rotate(1);
      const matrix = t.m();
      t.updateRotation(2, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(2).m());
    });
    test('Update translation checking matrix', () => {
      const t = new Transform().translate(0, 0);
      const matrix = t.m();
      t.updateTranslation(1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(1, 1).m());
    });
    test('Update translation with point checking matrix', () => {
      const t = new Transform().translate(0, 0);
      const matrix = t.m();
      t.updateTranslation(new Point(1, 1));
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(1, 1).m());
    });
    test('Update translation at index', () => {
      const t = new Transform().translate(1, 1).translate(-1, 1);
      const matrix = t.m();
      t.updateTranslation(1, 1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(2, 2).m());
    });
    test('Update translation at index with Point', () => {
      const t = new Transform().translate(1, 1).translate(-1, 1);
      const matrix = t.m();
      t.updateTranslation(new Point(1, 1), 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(2, 2).m());
    });
    test('Update scale checking matrix', () => {
      const t = new Transform().scale(0, 0);
      const matrix = t.m();
      t.updateScale(1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale with point checking matrix', () => {
      const t = new Transform().scale(0, 0);
      const matrix = t.m();
      t.updateScale(new Point(1, 1));
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale(1, 1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index with Point', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale(new Point(1, 1), 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Get translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      expect(t.t()).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.t(0)).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.t(1)).toEqual({ x: 1, y: 1, _type: 'point' });
      expect(t.t(2)).toEqual(null);
    });
    test('Update translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateTranslation(new Point(2, 2));
      expect(t.t()).toEqual({ x: 2, y: 2, _type: 'point' });

      t.updateTranslation(3, 3);
      expect(t.t()).toEqual({ x: 3, y: 3, _type: 'point' });

      t.updateTranslation(4, 4, 0);
      expect(t.t()).toEqual({ x: 4, y: 4, _type: 'point' });

      t.updateTranslation(5, 5, 1);
      expect(t.t(1)).toEqual({ x: 5, y: 5, _type: 'point' });

      t.updateTranslation(5, 5, 2);
      expect(t.t(0)).toEqual({ x: 4, y: 4, _type: 'point' });
      expect(t.t(1)).toEqual({ x: 5, y: 5, _type: 'point' });
    });
    test('Get Scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      expect(t.s()).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.s(0)).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 1, y: 1, _type: 'point' });
      expect(t.s(2)).toEqual(null);
    });
    test('isEqualTo', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const e1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const ne1 = new Transform().scale(1, 2).rotate(1).translate(1, 1);
      const ne2 = new Transform().scale(2, 1).rotate(1).translate(1, 1);
      const ne3 = new Transform().scale(1, 1).rotate(2).translate(1, 1);
      const ne4 = new Transform().scale(1, 1).rotate(1).translate(2, 1);
      const ne5 = new Transform().scale(1, 1).rotate(1).translate(1, 2);
      const ne6 = new Transform().rotate(1).translate(1, 1).scale(1, 1);
      const ne7 = new Transform().rotate(1).translate(1, 1);
      expect(t1.isEqualTo(e1)).toBe(true);
      expect(t1.isEqualTo(ne1)).toBe(false);
      expect(t1.isEqualTo(ne2)).toBe(false);
      expect(t1.isEqualTo(ne3)).toBe(false);
      expect(t1.isEqualTo(ne4)).toBe(false);
      expect(t1.isEqualTo(ne5)).toBe(false);
      expect(t1.isEqualTo(ne6)).toBe(false);
      expect(t1.isEqualTo(ne7)).toBe(false);
    });
    test('Update scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      t.updateScale(new Point(2, 2));
      expect(t.s()).toEqual({ x: 2, y: 2, _type: 'point' });

      t.updateScale(3, 3);
      expect(t.s()).toEqual({ x: 3, y: 3, _type: 'point' });

      t.updateScale(4, 4, 0);
      expect(t.s()).toEqual({ x: 4, y: 4, _type: 'point' });

      t.updateScale(5, 5, 1);
      expect(t.s(1)).toEqual({ x: 5, y: 5, _type: 'point' });

      t.updateScale(5, 5, 2);
      expect(t.s(0)).toEqual({ x: 4, y: 4, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 5, y: 5, _type: 'point' });
    });
    test('is Similar to - single transform in order', () => {
      const t1 = new Transform().scale(1, 1);
      const t2 = new Transform().scale(2, 2);
      const t3 = new Transform().translate(1, 1);
      const t4 = new Transform().rotate(1);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
    });
    test('is Similar to - two transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2);
      const t2 = new Transform().scale(2, 2).rotate(4);
      const t3 = new Transform().translate(1, 1).rotate(1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
      expect(t1.isSimilarTo(t5)).toBe(false);
      expect(t1.isSimilarTo(t6)).toBe(false);
    });
    test('is Similar to - three transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2).translate(1, 1);
      const t2 = new Transform().scale(2, 2).rotate(4).translate(2, 2);
      const t3 = new Transform().translate(1, 1).rotate(1).scale(1, 1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
      expect(t1.isSimilarTo(t5)).toBe(false);
      expect(t1.isSimilarTo(t6)).toBe(false);
    });
    test('Subtraction happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.sub(t2);
      expect(ts.s()).toEqual(new Point(1, 1));
      expect(ts.r()).toEqual(1);
      expect(ts.t()).toEqual(new Point(1, 1));
    });
    test('Subtraction sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.sub(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.sub(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Addition happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.add(t2);
      expect(ts.s()).toEqual(new Point(1, 3));
      expect(ts.r()).toEqual(5);
      expect(ts.t()).toEqual(new Point(7, 9));
    });
    test('Addition sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.add(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.add(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Multiply happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.mul(t2);
      expect(ts.s()).toEqual(new Point(0, 2));
      expect(ts.r()).toEqual(6);
      expect(ts.t()).toEqual(new Point(12, 20));
    });
    test('Multiply sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.mul(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.mul(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Transform', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t2.transform(t1).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Transform By', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t1.transformBy(t2).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Zero', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const t2 = t1.zero();
      expect(t2).toEqual(t1.sub(t1));
    });
    test('isZero', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      expect(t1.isZero()).toBe(false);
      const t2 = t1.zero();
      expect(t2.isZero()).toBe(true);
      const t3 = new Transform().scale(0, 0).rotate(0).scale(1, 0);
      expect(t3.isZero()).toBe(false);
    });
    test('Constant', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const t2 = t1.constant(2);
      expect(t2).toEqual(t1.add(t1));
    });
    test('Rounding', () => {
      const t1 = new Transform()
        .scale(1.123456789, 1.12345678)
        .rotate(1.123456789)
        .translate(1.123456789, 1.12345678);
      let tr = t1.round();
      expect(tr.s()).toEqual(new Point(1.12345679, 1.12345678));
      expect(tr.r()).toEqual(1.12345679);
      expect(tr.t()).toEqual(new Point(1.12345679, 1.12345678));

      tr = t1.round(2);
      expect(tr.s()).toEqual(new Point(1.12, 1.12));
      expect(tr.r()).toEqual(1.12);
      expect(tr.t()).toEqual(new Point(1.12, 1.12));

      tr = t1.round(0);
      expect(tr.s()).toEqual(new Point(1, 1));
      expect(tr.r()).toEqual(1);
      expect(tr.t()).toEqual(new Point(1, 1));
    });
    test('Clipping', () => {
      const t1 = new Transform()
        .scale(21, 20)
        .scale(0.1, 0.05)
        .scale(20, 0)
        .rotate(21)
        .rotate(20)
        .rotate(0.1)
        .rotate(0.05)
        .translate(21, 20)
        .translate(0.1, 0.05)
        .translate(0, 20)
        .translate(0, 21);
      const clipZero = new TransformLimit(0.1, 0.1, 0.1);
      const clipMax = new TransformLimit(20, 20, 20);
      let tc = t1.clipMag(clipZero, clipMax, false);
      expect(tc.s(0)).toEqual(new Point(20, 20));
      expect(tc.s(1)).toEqual(new Point(0, 0));
      expect(tc.s(2)).toEqual(new Point(20, 0));
      expect(tc.r(0)).toBe(20);
      expect(tc.r(1)).toBe(20);
      expect(tc.r(2)).toBe(0);
      expect(tc.r(3)).toBe(0);
      expect(tc.t(0)).toEqual(new Point(20, 20));
      expect(tc.t(1)).toEqual(new Point(0, 0));
      expect(tc.t(2)).toEqual(new Point(0, 20));
      expect(tc.t(3)).toEqual(new Point(0, 20));

      // vector clipping
      tc = t1.clipMag(clipZero, clipMax);
      expect(tc.s(0).round(2)).toEqual(new Point(14.48, 13.79));
      expect(tc.s(1).round(2)).toEqual(new Point(0.1, 0.05));
      expect(tc.s(2).round(2)).toEqual(new Point(20, 0));
      expect(tc.r(0)).toBe(20);
      expect(tc.r(1)).toBe(20);
      expect(tc.r(2)).toBe(0);
      expect(tc.r(3)).toBe(0);
      expect(tc.t(0).round(2)).toEqual(new Point(14.48, 13.79));
      expect(tc.t(1).round(2)).toEqual(new Point(0.1, 0.05));
      expect(tc.t(2).round(2)).toEqual(new Point(0, 20));
      expect(tc.t(3).round(2)).toEqual(new Point(0, 20));
    });
    test('Copy', () => {
      const t = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      t.index = 0;
      const b = t._dup();
      expect(t).toEqual(b);
      expect(t).not.toBe(b);
      expect(t.order).not.toBe(b.order);
    });
    test('Velocity - Happy case', () => {
      const deltaTime = 1;
      const t0 = new Transform()
        .scale(0, 0)          // to test velocity
        .scale(-1, -40)       // to test zero
        .scale(0, 0)         // to test max
        .scale(0, 0)         // to test max
        .rotate(0)            // to test velocity
        .rotate(1)            // to test zero
        .rotate(-1)           // to test max
        .translate(0, 0)      // to test velocity
        .translate(-1, -40)   // to test zero
        .translate(0, 0)     // to test max
        .translate(0, 0);    // to test max
      const t1 = new Transform()
        .scale(-1, 1)
        .scale(-1.1414, -40.1414)
        .scale(14.1422, 14.1422)
        .scale(-14.1422, -14.1422)
        .rotate(-1)
        .rotate(1.1)
        .rotate(40)
        .translate(-1, 1)
        .translate(-1.1414, -40.1414)
        .translate(14.1422, 14.1422)
        .translate(-14.1422, -14.1422);
      const zero = new TransformLimit(0.2, 0.2, 0.2);
      const max = new TransformLimit(20, 20, 20);
      const v = t1.velocity(t0, deltaTime, zero, max);

      expect(v.s(0).round()).toEqual(new Point(-1, 1));
      expect(v.s(1).round()).toEqual(new Point(0, 0));
      expect(v.s(2).round(4)).toEqual(new Point(14.1421, 14.1421));
      expect(v.s(3).round(4)).toEqual(new Point(-14.1421, -14.1421));
      expect(v.r(0)).toBe(-1);
      expect(v.r(1)).toBe(0);
      expect(v.r(2)).toBe(20);
      expect(v.t(0).round()).toEqual(new Point(-1, 1));
      expect(v.t(1).round()).toEqual(new Point(0, 0));
      expect(v.t(2).round(4)).toEqual(new Point(14.1421, 14.1421));
    });
    describe('Velocity - Sad case', () => {
      let deltaTime;
      let zero;
      let max;
      let t0;
      let t1;
      beforeEach(() => {
        deltaTime = 1;
        zero = new TransformLimit(0.2, 0.2, 0.2);
        max = new TransformLimit(20, 20, 20);
        t0 = new Transform()
          .scale(0, 0)
          .rotate(0)
          .translate(0, 0);
        t1 = new Transform()
          .scale(1, 1)
          .rotate(1)
          .translate(1, 1);
      });
      test('t0 not similar to t1', () => {
        t1 = new Transform().rotate(1).scale(1, 1).translate(1, 1);
        const v = t1.velocity(t0, deltaTime, zero, max);
        expect(v.s()).toEqual(new Point(0, 0));
        expect(v.r()).toEqual(0);
        expect(v.t()).toEqual(new Point(0, 0));
      });
      // // If a transform element is missing from the zero transform, then no
      // // minimum will be applied
      // test('zero missing a transform element', () => {
      //   zero = new Transform().rotate(0.2).scale(0.2, 0.2);
      //   t1 = new Transform()
      //     .scale(0.2, -0.00001)
      //     .rotate(0.00001)
      //     .translate(0.2, 0.00001);
      //   const v = t1.velocity(t0, deltaTime, zero, max);
      //   expect(v).toEqual(t1);
      // });
      // // If a transform element is missing from the max transform, then
      // // no maximum will be applied.
      // test('max missing a transform element', () => {
      //   max = new Transform().rotate(20).scale(20, 20);
      //   t1 = new Transform()
      //     .scale(30, -100001)
      //     .rotate(100001)
      //     .translate(30, 100001);
      //   let v = t1.velocity(t0, deltaTime, zero, max);
      //   expect(v).toEqual(t1);

      //   // Test missing max when zero threshold is enforced.
      //   t1 = new Transform()
      //     .scale(30, -100001)
      //     .rotate(100001)
      //     .translate(0.1, 100001);
      //   v = t1.velocity(t0, deltaTime, zero, max);
      //   const vExpected = t1._dup();
      //   vExpected.updateTranslation(0, 100001);
      //   expect(v).toEqual(vExpected);
      // });
    });
    // Calculation for deceleration:
    // s = function(sx, sy, vx, vy, d, t) {
    //   vel = sqrt(vx*vx+vy*vy);
    //   vNext = vel-d*t;
    //   angle = atan2(vy, vx);
    //   vx = vNext * cos(angle);
    //   vy = vNext * sin(angle);
    //   dist = vel*t - 0.5*d*t*t;
    //   x = sx + dist*cos(angle);
    //   y = sy + dist*sin(angle);
    //   return {vx, vy, x, y}
    // }
    describe('Deceleration', () => {
      let d;
      let t;
      let v;
      let z;
      beforeEach(() => {
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        // Transform().scale(1, 1).rotate(1).translate(1, 1);
        v = new Transform().scale(10, 10).rotate(10).translate(10, 10);
        t = new Transform().scale(0, 0).rotate(0).translate(0, 0);
        z = new TransformLimit(5, 5, 5);
        // Transform().scale(5, 5).rotate(5).translate(5, 5);
      });
      test('Simple deceleration', () => {
        const n = t.decelerate(v, d, 1, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(9, 9).rotate(9).translate(9, 9));
        expect(n.t).toEqual(new Transform()
          .scale(9.5, 9.5).rotate(9.5).translate(9.5, 9.5));
      });
      test('Negatives in deceleration and velocity', () => {
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        const n = t.decelerate(v, d, 1, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(9, -9).rotate(-9).translate(9, -9));
        expect(n.t.round()).toEqual(new Transform()
          .scale(9.5, -9.5).rotate(-9.5).translate(9.5, -9.5));
      });
      test('Zero thresholds', () => {
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        z = new TransformLimit(5, 5, 5);
        const n = t.decelerate(v, d, 10, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(0, 0).rotate(0).translate(0, 0));
        expect(n.t.round()).toEqual(new Transform()
          .scale(43.75, -43.75).rotate(-37.5).translate(43.75, -43.75));
      });
    });
    describe('Clipping', () => {
      test('Not clipped', () => {
        let min;
        let max;
        let t0;
        t0 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
        min = new Transform().scale(0, 0).rotate(0).translate(-2, -2);
        max = new Transform().scale(2, 2).rotate(2).translate(2, 2);
        expect(t0.clip(min, max)).toEqual(t0);

        t0 = new Transform().scale(-1, -1).rotate(-1).translate(-1, -1);
        min = new Transform().scale(-2, -2).rotate(-2).translate(-2, -2);
        max = new Transform().scale(0, 2).rotate(2).translate(0, 2);
        expect(t0.clip(min, max)).toEqual(t0);

        t0 = new Transform().scale(-1, 1).rotate(-1).translate(-1, 1);
        min = new Transform().scale(-1, -2).rotate(-1).translate(-1, -2);
        max = new Transform().scale(0, 1).rotate(2).translate(0, 1);
        expect(t0.clip(min, max)).toEqual(t0);
      });
      test('Clipped', () => {
        let min;
        let max;
        let t0;
        let t1;
        // Clip max
        t0 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
        min = new Transform().scale(-1, 0).rotate(0).translate(-2, -2);
        max = new Transform().scale(0, 0.5).rotate(0.5).translate(0, -1.5);
        t1 = new Transform().scale(0, 0.5).rotate(0.5).translate(0, -1.5);
        expect(t0.clip(min, max)).toEqual(t1);

        // Clip min
        t0 = new Transform().scale(1, -1).rotate(1).translate(1, -1);
        min = new Transform().scale(1.5, 0).rotate(2).translate(1.5, 0);
        max = new Transform().scale(2, 0.5).rotate(3).translate(2, 0.5);
        t1 = new Transform().scale(1.5, 0).rotate(2).translate(1.5, 0);
        expect(t0.clip(min, max)).toEqual(t1);
      });
      test('Remove string', () => {
        const ta = new Transform('a').scale(1, 1).rotate(1).translate(1, 1);
        const tb = new Transform('b').scale(-1, -1).rotate(-1).translate(-1, -1);
        const tab = ta.transform(tb);
        expect(tab.order).toHaveLength(6);
        const tabRemoveA = tab.remove('a');
        expect(tabRemoveA.order).toHaveLength(3);
        expect(tabRemoveA.order[0].name).toBe('b');
        expect(tabRemoveA.order[0].x).toBe(-1);
      });
      test('Remove Array', () => {
        const ta = new Transform('a').scale(1, 1).rotate(1).translate(1, 1);
        const tb = new Transform('b').scale(-1, -1).rotate(-1).translate(-1, -1);
        const tc = new Transform('c').scale(-2, -2).rotate(-2).translate(-2, -2);
        const tab = ta.transform(tb).transform(tc);
        expect(tab.order).toHaveLength(9);
        const tabRemoveA = tab.remove('a');
        expect(tabRemoveA.order).toHaveLength(6);
        expect(tabRemoveA.order[0].name).toBe('c');
      });
    });
  });
  describe('Space to space transform', () => {
    let t;
    const pixelSpace = {
      x: { bottomLeft: 0, width: 1000 },
      y: { bottomLeft: 500, height: -500 },
    };
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const d1Space = {
      x: { bottomLeft: 0, width: 4 },
      y: { bottomLeft: 0, height: 2 },
    };
    describe('Pixel to GL', () => {
      beforeEach(() => {
        t = spaceToSpaceTransform(pixelSpace, glSpace).matrix();
      });
      test('pixel 0, 0', () => {
        const p = new Point(0, 0);
        expect(p.transformBy(t)).toEqual(new Point(-1, 1));
      });
      test('pixel 1000, 500', () => {
        const p = new Point(1000, 500);
        expect(p.transformBy(t)).toEqual(new Point(1, -1));
      });
      test('pixel 500, 250', () => {
        const p = new Point(500, 250);
        expect(p.transformBy(t)).toEqual(new Point(0, 0));
      });
    });
    describe('GL to Pixel', () => {
      beforeEach(() => {
        t = spaceToSpaceTransform(glSpace, pixelSpace).matrix();
      });
      test('gl 0, 0', () => {
        const p = new Point(0, 0);
        expect(p.transformBy(t)).toEqual(new Point(500, 250));
      });
      test('gl 1, -1', () => {
        const p = new Point(1, -1);
        expect(p.transformBy(t)).toEqual(new Point(1000, 500));
      });
      test('gl -1, 1', () => {
        const p = new Point(-1, 1);
        expect(p.transformBy(t)).toEqual(new Point(0, 0));
      });
    });
    describe('d1 to gl', () => {
      beforeEach(() => {
        t = spaceToSpaceTransform(d1Space, glSpace).matrix();
      });
      test('0, 0 to -1, -1', () => {
        const d = new Point(0, 0);
        expect(d.transformBy(t)).toEqual(new Point(-1, -1));
      });
      test('4, 2 to 1, 1', () => {
        const d = new Point(4, 2);
        expect(d.transformBy(t)).toEqual(new Point(1, 1));
      });
      test('2, 1 to 0, 0', () => {
        const d = new Point(2, 1);
        expect(d.transformBy(t)).toEqual(new Point(0, 0));
      });
    });
    describe('gl to d1', () => {
      beforeEach(() => {
        t = spaceToSpaceTransform(glSpace, d1Space).matrix();
      });
      test('0, 0 to 2, 1', () => {
        const d = new Point(0, 0);
        expect(d.transformBy(t)).toEqual(new Point(2, 1));
      });
      test('1, 1 to 4, 2', () => {
        const d = new Point(1, 1);
        expect(d.transformBy(t)).toEqual(new Point(4, 2));
      });
      test('-1, -1 to 0, 0', () => {
        const d = new Point(-1, -1);
        expect(d.transformBy(t)).toEqual(new Point(0, 0));
      });
    });
  });
  describe.only('Rect', () => {
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
      test('Fail', () => {
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
  describe('getMinMaxPoints', () => {
    test('Array', () => {
      const points = [
        new Point(0, 0),
        new Point(2, 1),
        new Point(-1, 3),
        new Point(0.5, -3),
      ];
      const result = getBoundingRect(points);
      expect(result.left).toEqual(-1);
      expect(result.bottom).toEqual(-3);
      expect(result.right).toEqual(2);
      expect(result.top).toEqual(3);
    });
    test('Array of Array', () => {
      const points = [
        [
          new Point(0, 0),
          new Point(2, 1),
          new Point(-1, 3),
          new Point(0.5, -3),
        ],
        [
          new Point(1, 0),
          new Point(2, 1),
          new Point(4, 3),
          new Point(0.5, -3),
        ],
      ];
      const result = getBoundingRect(points);
      expect(result.left).toEqual(-1);
      expect(result.bottom).toEqual(-3);
      expect(result.right).toEqual(4);
      expect(result.top).toEqual(3);
      // expect(result.max).toEqual(new Point(4, 3));
    });
  });
  describe('Quadratic Bezier', () => {
    test('flat case', () => {
      const p0 = new Point(0, 0);
      const p1 = new Point(0.5, 0.5);
      const p2 = new Point(1, 0);
      let b = p0.quadraticBezier(p1, p2, 0);
      expect(b).toEqual(p0);

      b = p0.quadraticBezier(p1, p2, 0.5);
      expect(b).toEqual(new Point(0.5, 0.25));

      b = p0.quadraticBezier(p1, p2, 1);
      expect(b).toEqual(p2);
    });
    test('flat 90 deg case', () => {
      const p0 = new Point(1, 1);
      const p1 = new Point(0.5, 1.5);
      const p2 = new Point(1, 2);
      let b = p0.quadraticBezier(p1, p2, 0);
      expect(b).toEqual(p0);

      b = p0.quadraticBezier(p1, p2, 0.5);
      expect(b).toEqual(new Point(0.75, 1.5));

      b = p0.quadraticBezier(p1, p2, 1);
      expect(b).toEqual(p2);
    });
  });
  describe('Rect to Polar', () => {
    test('1, 0 as x, y', () => {
      const p = rectToPolar(1, 0);
      expect(p.mag).toBe(1);
      expect(p.angle).toBe(0);
    });
    test('1, 0 as Point', () => {
      const p = rectToPolar(new Point(1, 0));
      expect(p.mag).toBe(1);
      expect(p.angle).toBe(0);
    });
    test('Quadrant 1', () => {
      const p = rectToPolar(1, 1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(Math.PI / 4, 3));
    });
    test('Quadrant 2', () => {
      const p = rectToPolar(-1, 1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(3 * Math.PI / 4, 3));
    });
    test('Quadrant 3', () => {
      const p = rectToPolar(-1, -1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(5 * Math.PI / 4, 3));
    });
    test('Quadrant 4', () => {
      const p = rectToPolar(1, -1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(7 * Math.PI / 4, 3));
    });
  });
  describe('Polar to Rect', () => {
    test('Quadrant 1', () => {
      const r = polarToRect(Math.sqrt(2), Math.PI / 4).round(3);
      expect(r).toEqual(new Point(1, 1));
    });
    test('Quadrant 2', () => {
      const r = polarToRect(Math.sqrt(2), 3 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(-1, 1));
    });
    test('Quadrant 3', () => {
      const r = polarToRect(Math.sqrt(2), 5 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(-1, -1));
    });
    test('Quadrant 4', () => {
      const r = polarToRect(Math.sqrt(2), 7 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(1, -1));
    });
    test('-x axis', () => {
      const r = polarToRect(1, Math.PI).round(3);
      expect(r).toEqual(new Point(-1, 0));
    });
    test('-y axis', () => {
      const r = polarToRect(1, 3 * Math.PI / 2).round(3);
      expect(r).toEqual(new Point(0, -1));
    });
  });
  describe('getDeltaAngle', () => {
    let dir;
    describe('1 - clockwise', () => {
      beforeEach(() => { dir = 1; });
      test('0 to 1', () => {
        const diff = round(getDeltaAngle(0, 1, dir), 3);
        expect(diff).toBe(1);
      });
      test('1 to 0', () => {
        const diff = round(getDeltaAngle(1, 0, dir), 3);
        const expected = round(Math.PI * 2 - 1, 3);
        expect(diff).toBe(expected);
      });
      test('0 to -1', () => {
        const diff = round(getDeltaAngle(0, -1, dir), 3);
        const expected = round(Math.PI * 2 - 1, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 0', () => {
        const diff = round(getDeltaAngle(-1, 0, dir), 3);
        const expected = round(1, 3);
        expect(diff).toBe(expected);
      });
      test('1 to -1', () => {
        const diff = round(getDeltaAngle(1, -1, dir), 3);
        const expected = round(Math.PI * 2 - 2, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 1', () => {
        const diff = round(getDeltaAngle(-1, 1, dir), 3);
        const expected = round(2, 3);
        expect(diff).toBe(expected);
      });
    });
    describe('-1 - Anti-clockwise', () => {
      beforeEach(() => { dir = -1; });
      test('0 to 1', () => {
        const diff = round(getDeltaAngle(0, 1, dir), 3);
        const expected = round(1 - Math.PI * 2, 3);
        expect(diff).toBe(expected);
      });
      test('1 to 0', () => {
        const diff = round(getDeltaAngle(1, 0, dir), 3);
        const expected = round(-1, 3);
        expect(diff).toBe(expected);
      });
      test('0 to -1', () => {
        const diff = round(getDeltaAngle(0, -1, dir), 3);
        const expected = round(-1, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 0', () => {
        const diff = round(getDeltaAngle(-1, 0, dir), 3);
        const expected = round(1 - Math.PI * 2, 3);
        expect(diff).toBe(expected);
      });
      test('1 to -1', () => {
        const diff = round(getDeltaAngle(1, -1, dir), 3);
        const expected = round(-2, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 1', () => {
        const diff = round(getDeltaAngle(-1, 1, dir), 3);
        const expected = round(2 - Math.PI * 2, 3);
        expect(diff).toBe(expected);
      });
    });
    describe('0 - fastest', () => {
      beforeEach(() => { dir = 0; });
      test('0 to 1', () => {
        const diff = round(getDeltaAngle(0, 1, dir), 3);
        expect(diff).toBe(1);
      });
      test('1 to 0', () => {
        const diff = round(getDeltaAngle(1, 0, dir), 3);
        const expected = round(-1, 3);
        expect(diff).toBe(expected);
      });
      test('0 to -1', () => {
        const diff = round(getDeltaAngle(0, -1, dir), 3);
        const expected = round(-1, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 0', () => {
        const diff = round(getDeltaAngle(-1, 0, dir), 3);
        const expected = round(1, 3);
        expect(diff).toBe(expected);
      });
      test('1 to -1', () => {
        const diff = round(getDeltaAngle(1, -1, dir), 3);
        const expected = round(-2, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 1', () => {
        const diff = round(getDeltaAngle(-1, 1, dir), 3);
        const expected = round(2, 3);
        expect(diff).toBe(expected);
      });
    });
    describe('2 - not through 0', () => {
      beforeEach(() => { dir = 2; });
      test('0 to 1', () => {
        const diff = round(getDeltaAngle(0, 1, dir), 3);
        expect(diff).toBe(1);
      });
      test('1 to 0', () => {
        const diff = round(getDeltaAngle(1, 0, dir), 3);
        const expected = round(-1, 3);
        expect(diff).toBe(expected);
      });
      test('0 to -1', () => {
        const diff = round(getDeltaAngle(0, -1, dir), 3);
        const expected = round(Math.PI * 2 - 1, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 0', () => {
        const diff = round(getDeltaAngle(-1, 0, dir), 3);
        const expected = round(1 - Math.PI * 2, 3);
        expect(diff).toBe(expected);
      });
      test('1 to -1', () => {
        const diff = round(getDeltaAngle(1, -1, dir), 3);
        const expected = round(Math.PI * 2 - 2, 3);
        expect(diff).toBe(expected);
      });
      test('-1 to 1', () => {
        const diff = round(getDeltaAngle(-1, 1, dir), 3);
        const expected = round(2 - Math.PI * 2, 3);
        expect(diff).toBe(expected);
      });
    });
    describe('Special cases', () => {
      test('0 to 1 default values', () => {
        const diff = round(getDeltaAngle(0, 1), 3);
        expect(diff).toBe(1);
      });
      test('Start and Target the same', () => {
        const diff = round(getDeltaAngle(1, 1), 3);
        expect(diff).toBe(0);
      });
    });
  });
  describe('normAngleTo90', () => {
    test('0 = 0', () => {
      expect(normAngleTo90(0)).toBe(0);
    });
    test('45 = 45', () => {
      expect(normAngleTo90(Math.PI / 4)).toBe(Math.PI / 4);
    });
    test('90 = 90', () => {
      expect(normAngleTo90(Math.PI / 2)).toBe(Math.PI / 2);
    });
    test('135 = 315', () => {
      expect(normAngleTo90(Math.PI / 4 * 3)).toBe(Math.PI / 4 * 7);
    });
    test('180 = 0', () => {
      expect(normAngleTo90(Math.PI)).toBe(0);
    });
    test('225 = 45', () => {
      expect(normAngleTo90(Math.PI / 4 * 5)).toBe(Math.PI / 4);
    });
    test('270 = 270', () => {
      expect(normAngleTo90(Math.PI / 4 * 6)).toBe(Math.PI / 4 * 6);
    });
    test('315 = 315', () => {
      expect(normAngleTo90(Math.PI / 4 * 7)).toBe(Math.PI / 4 * 7);
    });
  });
  describe('deg', () => {
    test('pi to 180', () => {
      expect(round(deg(Math.PI), 2)).toBe(180);
    });
  });
  describe('curvedPath', () => {
    let options;
    beforeEach(() => {
      options = {
        rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'up',
      };
    });
    test('up', () => {
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, 0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('down', () => {
      options.direction = 'down';
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, -0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('left', () => {
      options.direction = 'left';
      const start = new Point(0, 0);
      const stop = new Point(0, 2);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(-0.5, 1));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('right', () => {
      options.direction = 'right';
      const start = new Point(0, 0);
      const stop = new Point(0, 2);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(0.5, 1));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('control', () => {
      options.direction = 'right';
      options.controlPoint = new Point(1, 1);
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, 0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
  });
  describe('Parse point', () => {
    test('Array', () => {
      expect(parsePoint([1, 1], new Point(0, 0))).toEqual(new Point(1, 1));
    });
    test('Object', () => {
      expect(parsePoint({ x: 1, y: 1 }, new Point(0, 0))).toEqual(new Point(1, 1));
    });
    test('Point', () => {
      expect(parsePoint(new Point(1, 1), new Point(0, 0))).toEqual(new Point(1, 1));
    });
    test('Number', () => {
      expect(parsePoint(1, new Point(0, 0))).toEqual(new Point(1, 1));
    });
    test('Fail', () => {
      expect(parsePoint('hello', new Point(0, 0))).toEqual(new Point(0, 0));
    });
  });
  describe('Three point angle', () => {
    test('right angle at origin', () => {
      const points = [new Point(1, 0), new Point(0, 0), new Point(0, 1)];
      const angle = threePointAngle(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(Math.PI / 2));
    });
    test('right angle at origin other way', () => {
      const points = [new Point(0, 1), new Point(0, 0), new Point(1, 0)];
      const angle = threePointAngle(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(3 * Math.PI / 2));
    });
  });
  describe('Three point angle Min', () => {
    test('right angle at origin', () => {
      const points = [new Point(1, 0), new Point(0, 0), new Point(0, 1)];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(Math.PI / 2));
    });
    test('right angle at origin other way', () => {
      const points = [new Point(0, 1), new Point(0, 0), new Point(1, 0)];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(-Math.PI / 2));
    });
    test('30, 270', () => {
      const points = [
        new Point(1, 0).rotate(Math.PI / 6),
        new Point(0, 0),
        new Point(1, 0).rotate(Math.PI / 2 * 3),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(-120 * Math.PI / 180));
    });
    test('270, 30', () => {
      const points = [
        new Point(1, 0).rotate(Math.PI / 2 * 3),
        new Point(0, 0),
        new Point(1, 0).rotate(Math.PI / 6),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(120 * Math.PI / 180));
    });
    test('120, 200', () => {
      const points = [
        new Point(1, 0).rotate(120 * Math.PI / 180),
        new Point(0, 0),
        new Point(1, 0).rotate(200 * Math.PI / 180),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(80 * Math.PI / 180));
    });
    test('200, 120', () => {
      const points = [
        new Point(1, 0).rotate(200 * Math.PI / 180),
        new Point(0, 0),
        new Point(1, 0).rotate(120 * Math.PI / 180),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(-80 * Math.PI / 180));
    });
    test('270, 0', () => {
      const points = [
        new Point(1, 0).rotate(270 * Math.PI / 180),
        new Point(0, 0),
        new Point(1, 0).rotate(0 * Math.PI / 180),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(90 * Math.PI / 180));
    });
    test('0, 270', () => {
      const points = [
        new Point(1, 0).rotate(0 * Math.PI / 180),
        new Point(0, 0),
        new Point(1, 0).rotate(270 * Math.PI / 180),
      ];
      const angle = threePointAngleMin(points[0], points[1], points[2]);
      expect(round(angle)).toBe(round(-90 * Math.PI / 180));
    });
  });
  describe('Get Transform', () => {
    test('Array', () => {
      const t = getTransform([['t', 1, 2]]);
      expect(t.t()).toEqual(new Point(1, 2));
      expect(t.order).toHaveLength(1);
    });
    test('Named Array', () => {
      const t = getTransform([['t', 1], 'Name1', ['s', 0.5]]);
      expect(t.t()).toEqual(new Point(1, 1));
      expect(t.s()).toEqual(new Point(0.5, 0.5));
      expect(t.order).toHaveLength(2);
      expect(t.name).toBe('Name1');
    });
    test('String', () => {
      const tIn = new Transform().translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn.toString());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
    });
    test('Named String', () => {
      const tIn = new Transform('Name1').translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn.toString());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
    test('Named String from String', () => {
      const tIn = '["Name1", ["t", 1, 0.5], ["s", 1, 1], ["r", 0.5]]';
      const t = getTransform(tIn);
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
  });
});
