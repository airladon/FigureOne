import {
  Point,
  spaceToSpaceTransform,
  getBoundingRect,
  // pointsToNumbers,
  // pointsToNumbers2,
  // getPoints,
} from './g2';

describe('g2 tests', () => {
  describe('Space to space transform', () => {
    let t;
    const pixelSpace = {
      x: { min: 0, span: 1000 },
      y: { min: 500, span: -500 },
      z: { min: -1, span: 2 },
    };
    const glSpace = {
      x: { min: -1, span: 2 },
      y: { min: -1, span: 2 },
      z: { min: -1, span: 2 },
    };
    const d1Space = {
      x: { min: 0, span: 4 },
      y: { min: 0, span: 2 },
      z: { min: -1, span: 2 },
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
});
