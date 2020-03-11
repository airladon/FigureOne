import {
  Point, circleCorner, radiusCorner,
} from './g2';
import { round } from './math';

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
    q145Reverse = q145.slice().reverse();
    getCorner = (p, sides) => circleCorner(p[0], p[1], p[2], sides);
    getRadiusCorner = (p, r, s) => radiusCorner(p[0], p[1], p[2], r, s);
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
      const points = getCorner(q145, 2);
      const _45 = Math.PI / 4;
      expect(round(points)).toEqual(round([
        q145[0],
        new Point(1 / Math.cos(_45) - 1 / Math.sqrt(2), 1 / Math.sin(_45) - 1 / Math.sqrt(2)),
        q145[2],
      ]));
    });
    test('q1 45 Reverse', () => {
      const points = getCorner(q145Reverse, 2);
      const _45 = Math.PI / 4;
      expect(round(points)).toEqual(round([
        q145Reverse[0],
        new Point(1 / Math.cos(_45) - 1 / Math.sqrt(2), 1 / Math.sin(_45) - 1 / Math.sqrt(2)),
        q145Reverse[2],
      ]));
    });
  });
  describe('radiusCorner', () => {
    test('q1Right 0.5 chamfer', () => {
      const points = getRadiusCorner(q1Right, 0.5, 1);
      expect(round(points)).toEqual([
        new Point(0.5, 0),
        new Point(0, 0.5),
      ]);
    });
  });
});
