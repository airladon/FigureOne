import { Point } from './Point';
import {
  minAngleDiff, getDeltaAngle, threePointAngle, deg, normAngleTo90, threePointAngleMin, normAngle,
} from './angle';
import { round } from '../math';

describe('g2 tests', () => {
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
        expect(round(res, 8)).toEqual(round(Math.PI, 8));
      });
      test('0 - 180 = -180', () => {
        const res = minAngleDiff(0, Math.PI);
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
});
