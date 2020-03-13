import {
  Point, polarToRect,
} from '../g2';
import { round } from '../math';
import {
  circleCorner, cutCorner, makeCorner, lineToCorners,
} from './corners';

describe('g2 corner tests', () => {
  let q1Right;
  let q1RightReverse;
  let q2Right;
  let q2RightReverse;
  let q3Right;
  let q3RightReverse;
  let q4Right;
  let q4RightReverse;
  let getCorner;
  let getRadiusCorner;
  let q145;
  let q145Reverse;
  let _60;
  let _60Reverse;
  beforeEach(() => {
    q1Right = [new Point(1, 0), new Point(0, 0), new Point(0, 1)];
    q1RightReverse = q1Right.slice().reverse();
    q2Right = [new Point(0, 1), new Point(0, 0), new Point(-1, 0)];
    q2RightReverse = q2Right.slice().reverse();
    q3Right = [new Point(-1, 0), new Point(0, 0), new Point(0, -1)];
    q3RightReverse = q3Right.slice().reverse();
    q4Right = [new Point(0, -1), new Point(0, 0), new Point(1, 0)];
    q4RightReverse = q4Right.slice().reverse();
    q145 = [
      new Point(1, 0),
      new Point(0, 0),
      new Point(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)),
    ];
    _60 = [
      new Point(1, 0),
      new Point(0, 0),
      new Point(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)),
    ];
    _60Reverse = _60.slice().reverse();
    q145Reverse = q145.slice().reverse();
    getCorner = (p, sides) => circleCorner(p[0], p[1], p[2], sides);
    getRadiusCorner = (p, s, style, v) => cutCorner(p[0], p[1], p[2], s, style, v);
  });
  describe('circelCorner', () => {
    test('0 sides', () => {
      const points = getCorner(q1Right, 0);
      expect(points).toEqual(q1Right);
    });
    test('1 side', () => {
      const points = getCorner(q1Right, 1);
      expect(points).toEqual([q1Right[0], q1Right[2]]);
    });
    test('2 sides', () => {
      const points = getCorner(q1Right, 2);
      expect(round(points)).toEqual(round([
        q1Right[0],
        new Point(1 - 1 / Math.sqrt(2), 1 - 1 / Math.sqrt(2)),
        q1Right[2],
      ]));
    });
    test('3 sides', () => {
      const points = getCorner(q1Right, 3);
      expect(round(points)).toEqual(round([
        q1Right[0],
        new Point(1 + Math.cos(Math.PI / 6 * -4), 1 + Math.sin(Math.PI / 6 * -4)),
        new Point(1 + Math.cos(Math.PI / 6 * -5), 1 + Math.sin(Math.PI / 6 * -5)),
        q1Right[2],
      ]));
    });
    test('2 sides Reverse', () => {
      const points = getCorner(q1RightReverse, 2);
      expect(round(points)).toEqual(round([
        q1RightReverse[0],
        new Point(1 - 1 / Math.sqrt(2), 1 - 1 / Math.sqrt(2)),
        q1RightReverse[2],
      ]));
    });
    test('q2', () => {
      const points = getCorner(q2Right, 2);
      expect(round(points)).toEqual(round([
        q2Right[0],
        new Point(-1 + 1 / Math.sqrt(2), 1 - 1 / Math.sqrt(2)),
        q2Right[2],
      ]));
    });
    test('q2 Reverse', () => {
      const points = getCorner(q2RightReverse, 2);
      expect(round(points)).toEqual(round([
        q2RightReverse[0],
        new Point(-1 + 1 / Math.sqrt(2), 1 - 1 / Math.sqrt(2)),
        q2RightReverse[2],
      ]));
    });
    test('q3', () => {
      const points = getCorner(q3Right, 2);
      expect(round(points)).toEqual(round([
        q3Right[0],
        new Point(-1 + 1 / Math.sqrt(2), -1 + 1 / Math.sqrt(2)),
        q3Right[2],
      ]));
    });
    test('q3 Reverse', () => {
      const points = getCorner(q3RightReverse, 2);
      expect(round(points)).toEqual(round([
        q3RightReverse[0],
        new Point(-1 + 1 / Math.sqrt(2), -1 + 1 / Math.sqrt(2)),
        q3RightReverse[2],
      ]));
    });
    test('q4', () => {
      const points = getCorner(q4Right, 2);
      expect(round(points)).toEqual(round([
        q4Right[0],
        new Point(1 - 1 / Math.sqrt(2), -1 + 1 / Math.sqrt(2)),
        q4Right[2],
      ]));
    });
    test('q4 Reverse', () => {
      const points = getCorner(q4RightReverse, 2);
      expect(round(points)).toEqual(round([
        q4RightReverse[0],
        new Point(1 - 1 / Math.sqrt(2), -1 + 1 / Math.sqrt(2)),
        q4RightReverse[2],
      ]));
    });
    test('q1 45', () => {
      // console.log(q145)
      const points = getCorner(q145, 2);
      const _225 = Math.PI / 8;
      const C = 1 / Math.cos(_225);
      const center = new Point(C * Math.cos(_225), C * Math.sin(_225));
      const r = center.y;
      expect(round(points)).toEqual(round([
        q145[0],
        center.add(new Point(
          r * Math.cos(_225 * -7),
          r * Math.sin(_225 * -7),
        )),
        q145[2],
      ]));
    });
    test('q1 45 Reverse', () => {
      const points = getCorner(q145Reverse, 2);
      const _225 = Math.PI / 8;
      const C = 1 / Math.cos(_225);
      const center = new Point(C * Math.cos(_225), C * Math.sin(_225));
      const r = center.y;
      expect(round(points)).toEqual(round([
        q145Reverse[0],
        center.add(new Point(
          r * Math.cos(_225 * -7),
          r * Math.sin(_225 * -7),
        )),
        q145Reverse[2],
      ]));
    });
  });
  describe('radiusCorner', () => {
    test('q1Right 0.4 chamfer', () => {
      const points = getRadiusCorner(q1Right, 1, 'fromVertex', 0.4);
      expect(round(points)).toEqual([
        new Point(0.4, 0),
        new Point(0, 0.4),
      ]);
    });
    test('q1Right Reverse 0.4 chamfer', () => {
      const points = getRadiusCorner(q1RightReverse, 1, 'fromVertex', 0.4);
      expect(round(points)).toEqual([
        new Point(0, 0.4),
        new Point(0.4, 0),
      ]);
    });
    test('q1Right 0.4 radius chamfer', () => {
      const points = getRadiusCorner(q1Right, 1, 'radius', 0.4);
      const value = 0.4 / Math.tan(Math.PI / 4);
      expect(round(points)).toEqual(round([
        new Point(value, 0),
        new Point(0, value),
      ]));
    });
    test('_60 0.4 chamfer', () => {
      const points = getRadiusCorner(_60, 1, 'fromVertex', 0.4);
      expect(round(points)).toEqual(round([
        new Point(0.4, 0),
        polarToRect(0.4, Math.PI / 3),
      ]));
    });
    test('_60 0.2 radius', () => {
      const points = getRadiusCorner(_60, 2, 'radius', 0.2);
      const center = new Point(0.2 / Math.tan(Math.PI / 6), 0.2);

      expect(round(points)).toEqual(round([
        new Point(center.x, 0),
        polarToRect(0.2, -150 * Math.PI / 180).add(center),
        polarToRect(0.2, -210 * Math.PI / 180).add(center),
      ]));
    });
    test('_60 reversed 0.2 radius', () => {
      const points = getRadiusCorner(_60Reverse, 2, 'radius', 0.2);
      const center = new Point(0.2 / Math.tan(Math.PI / 6), 0.2);

      expect(round(points)).toEqual(round([
        polarToRect(0.2, -210 * Math.PI / 180).add(center),
        polarToRect(0.2, -150 * Math.PI / 180).add(center),
        new Point(center.x, 0),
      ]));
    });
    test('_60 max', () => {
      const points = getRadiusCorner(_60, 2, 'max');
      const center = new Point(1, 1 * Math.tan(Math.PI / 6));
      const mag = center.y;

      expect(round(points)).toEqual(round([
        new Point(center.x, 0),
        polarToRect(mag, -150 * Math.PI / 180).add(center),
        polarToRect(mag, -210 * Math.PI / 180).add(center),
      ]));
    });
  });
  describe('makeCorner', () => {
    test('simple', () => {
      const [p2, p1, p3] = makeCorner(
        new Point(0, 0), new Point(1, 0), new Point(1, 1), 0.5, false,
      );
      expect(round(p2)).toEqual(new Point(0.5, 0));
      expect(round(p1)).toEqual(new Point(1, 0));
      expect(round(p3)).toEqual(new Point(1, 0.5));
    });
    test('No force', () => {
      const [p2, p1, p3] = makeCorner(
        new Point(0, 0), new Point(1, 0), new Point(1, 0.2), 0.5, false,
      );
      expect(round(p2)).toEqual(new Point(0.5, 0));
      expect(round(p1)).toEqual(new Point(1, 0));
      expect(round(p3)).toEqual(new Point(1, 0.2));
    });
    test('Force', () => {
      const [p2, p1, p3] = makeCorner(
        new Point(0, 0), new Point(1, 0), new Point(1, 0.2), 0.5, true,
      );
      expect(round(p2)).toEqual(new Point(0.5, 0));
      expect(round(p1)).toEqual(new Point(1, 0));
      expect(round(p3)).toEqual(new Point(1, 0.5));
    });
  });
  describe('lineToCorners', () => {
    test('simple', () => {
      const corners = lineToCorners(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)], false, 0.5, false,
      );
      expect(round(corners[0][0])).toEqual(new Point(0.5, 0));
      expect(round(corners[0][1])).toEqual(new Point(1, 0));
      expect(round(corners[0][2])).toEqual(new Point(1, 0.5));
    });
    test('No force', () => {
      const corners = lineToCorners(
        [new Point(0, 0), new Point(1, 0), new Point(1, 0.2)], false, 0.5, false,
      );
      expect(round(corners[0][0])).toEqual(new Point(0.5, 0));
      expect(round(corners[0][1])).toEqual(new Point(1, 0));
      expect(round(corners[0][2])).toEqual(new Point(1, 0.2));
    });
    test('Force', () => {
      const corners = lineToCorners(
        [new Point(0, 0), new Point(1, 0), new Point(1, 0.2)], false, 0.5, true,
      );
      expect(round(corners[0][0])).toEqual(new Point(0.5, 0));
      expect(round(corners[0][1])).toEqual(new Point(1, 0));
      expect(round(corners[0][2])).toEqual(new Point(1, 0.5));
    });
    test('Close', () => {
      const corners = lineToCorners(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)], true, 0.5, true,
      );
      expect(round(corners[0][0])).toEqual(new Point(0.5, 0));
      expect(round(corners[0][1])).toEqual(new Point(1, 0));
      expect(round(corners[0][2])).toEqual(new Point(1, 0.5));

      expect(round(corners[1][0])).toEqual(new Point(1, 0.5));
      expect(round(corners[1][1])).toEqual(new Point(1, 1));
      expect(round(corners[1][2])).toEqual(new Point(0.5, 1));

      expect(round(corners[2][0])).toEqual(new Point(0.5, 1));
      expect(round(corners[2][1])).toEqual(new Point(0, 1));
      expect(round(corners[2][2])).toEqual(new Point(0, 0.5));

      expect(round(corners[3][0])).toEqual(new Point(0, 0.5));
      expect(round(corners[3][1])).toEqual(new Point(0, 0));
      expect(round(corners[3][2])).toEqual(new Point(0.5, 0));
    });
  });
});
