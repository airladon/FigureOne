import {
  Point, minAngleDiff, normAngle,
  spaceToSpaceTransform,
  getBoundingRect, polarToRect, rectToPolar, getDeltaAngle,
  normAngleTo90, deg, curvedPath, threePointAngle,
  threePointAngleMin, Rect, Transform, Line,
} from './g2';
import { round } from './math';

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
