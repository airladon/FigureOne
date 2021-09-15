import {
  Point, getPoint, getPoints,
} from './Point';
// import { Line } from './Line';
// import { round } from './math';

describe('g2 Point', () => {
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
      p1 = new Point(1, 1, 1);
      p2 = new Point(-1, -1, -1);
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
      expect(p0.clip(new Point(-2, -2, -2), new Point(2, 2, 2))).toEqual(p0);
      expect(p1.clip(new Point(-2, -2, -2), new Point(2, 2, 2))).toEqual(p1);
      expect(p2.clip(new Point(-2, -2, -2), new Point(2, 2, 2))).toEqual(p2);
      expect(p3.clip(new Point(-2, -2, -2), new Point(2, 2, 2))).toEqual(p3);

      expect(p1.clip(new Point(0.5, 0.5, 0.5), new Point(2, 2, 2))).toEqual(p1);
      expect(p2.clip(new Point(-2, -2, -2), new Point(-0.5, -0.5, -0.5))).toEqual(p2);
      expect(p3.clip(new Point(-2, 0.5, 0), new Point(-0.5, 2, 0))).toEqual(p3);
    });
    test('Unclipped points null input', () => {
      expect(p0.clip(null, null)).toEqual(p0);
      expect(p1.clip(null, null)).toEqual(p1);
      expect(p2.clip(null, null)).toEqual(p2);
      expect(p3.clip(null, null)).toEqual(p3);
    });
    test('Clipped points number input', () => {
      expect(p0.clip(-2, -1)).toEqual(new Point(-1, -1, -1));
      expect(p0.clip(1, 2)).toEqual(new Point(1, 1, 1));
      expect(p1.clip(-3, -2)).toEqual(new Point(-2, -2, -2));
      expect(p1.clip(2, 3)).toEqual(new Point(2, 2, 2));
      expect(p2.clip(-3, -2)).toEqual(new Point(-2, -2, -2));
      expect(p2.clip(2, 3)).toEqual(new Point(2, 2, 2));
      expect(p3.clip(-2, 0)).toEqual(new Point(-1, 0, 0));
      expect(p3.clip(0, 2)).toEqual(new Point(0, 1, 0));
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
      expect(p0.clip(null, -1)).toEqual(new Point(-1, -1, -1));
      expect(p0.clip(-1, null)).toEqual(new Point(0, 0, 0));
      expect(p0.clip(1, null)).toEqual(new Point(1, 1, 1));
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

  describe('Points can be rotated around 0, 0, 0 in 3D', () => {
    test('Rotate (1, 0) by 90 deg = (0, 1)', () => {
      const p = new Point(1, 0, 0);
      const s = p.rotate(Math.PI / 2, [0, 0, 0], [0, 1, 0]);
      expect(s.round()).toEqual(new Point(0, 0, -1).round());
    });
    test('Rotate (1, 0, 1) by -45 deg = (0, sqrt(2))', () => {
      const p = new Point(1, 0, 1);
      const s = p.rotate(-Math.PI / 4, [0, 0, 0], [0, 1, 0]);
      expect(s.round()).toEqual(new Point(0, 0, Math.sqrt(2)).round());
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
    test('Rotate (2, 0, 2) by -45 deg around (1, 0, 1)', () => {
      const p = new Point(2, 0, 2);
      const q = new Point(1, 0, 1);
      const s = p.rotate(-Math.PI / 4, q, [0, 1, 0]);
      expect(s.round()).toEqual(new Point(1, 0, 1 + Math.sqrt(2)).round());
    });
  });

  describe('Points can be compared to other points', () => {
    describe('precision', () => {
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
    describe('Delta', () => {
      test('(0, 0) == (0, 0)', () => {
        const p = new Point(0, 0);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 0, true)).toEqual(true);
      });
      test('(-1, 4) == (-1, 4)', () => {
        const p = new Point(-1, 4);
        const q = new Point(-1, 4);
        expect(p.isEqualTo(q, 0, true)).toEqual(true);
      });
      test('(0, 0) != (1, 0)', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 0);
        expect(p.isEqualTo(q, 0, true)).toEqual(false);
      });
      test('0.001, 0.001 != 0, 0 with precision 3', () => {
        const p = new Point(0.001, 0.001);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 0, true)).toEqual(false);
      });
      test('(0.001, 0.001) == (0, 0) with precision 2', () => {
        const p = new Point(0.001, 0.001);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 0.001, true)).toEqual(true);
      });
      test('(-0, 0) == (0, 0)', () => {
        const p = new Point(-0, 0);
        const q = new Point(0, 0);
        expect(p.isEqualTo(q, 0, true)).toEqual(true);
      });
      test('(0, 0) != (1, 0) using isNotEqualTo', () => {
        const p = new Point(0, 0);
        const q = new Point(1, 0);
        expect(p.isNotEqualTo(q, 0, true)).toEqual(true);
      });
      test('(0, 0) == (0.1, 0) with precision of 0', () => {
        const p = new Point(0, 0);
        const q = new Point(0.1, 0);
        expect(p.isEqualTo(q, 0.1, true)).toEqual(true);
      });
    });
  });
  describe('getPoint', () => {
    test('Array', () => {
      expect(getPoint([1, 1])).toEqual(new Point(1, 1));
    });
    test('Point', () => {
      expect(getPoint(new Point(1, 1))).toEqual(new Point(1, 1));
    });
    test('Def', () => {
      const def = new Point(1, 1)._state();
      expect(getPoint(def)).toEqual(new Point(1, 1));
    });
    test('JSON state', () => {
      const json = '{ "f1Type": "p", "state": [1, 1] }';
      expect(getPoint(json)).toEqual(new Point(1, 1));
    });
    test('JSON array', () => {
      const json = '[1, 1]';
      expect(getPoint(json)).toEqual(new Point(1, 1));
    });
  });
  describe('getPoints', () => {
    test('Array', () => {
      const p0 = new Point(0, 0);
      const p1 = new Point(1, 1)._state();
      const p2 = [2, 2];
      const points = getPoints([p0, p1, p2]);
      expect(points).toHaveLength(3);
      expect(points[0]).toEqual(new Point(0, 0));
      expect(points[1]).toEqual(new Point(1, 1));
      expect(points[2]).toEqual(new Point(2, 2));
    });
    test('Single Point', () => {
      const p0 = new Point(0, 0);
      const points = getPoints([p0]);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual(new Point(0, 0));
    });
    test('Single Array', () => {
      const p0 = [0, 0];
      const points = getPoints([p0]);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual(new Point(0, 0));
    });
  });
  describe('Vector', () => {
    describe('Component Along', () => {
      test('xAxis', () => {
        const p = new Point(1, 0, 0);
        const q = new Point(1, 1, 0);
        const c = q.componentAlong(p);
        expect(c.round(3)).toEqual(new Point(1, 0, 0));
      });
      test('xAxis negative', () => {
        const p = new Point(1, 0, 0);
        const q = new Point(-1, 1, 0);
        const c = q.componentAlong(p);
        expect(c.round(3)).toEqual(new Point(-1, 0, 0));
      });
      test('45º', () => {
        const mag = 0.4;
        const a1 = 20 * Math.PI / 180;
        const a2 = 65 * Math.PI / 180;
        const p = new Point(mag * Math.cos(a1), mag * Math.sin(a1), 0);
        const q = new Point(mag * Math.cos(a2), mag * Math.sin(a2), 0);
        const c = q.componentAlong(p);
        expect(c.round(3)).toEqual(new Point(
          mag / Math.sqrt(2) * Math.cos(a1),
          mag / Math.sqrt(2) * Math.sin(a1),
          0,
        ).round(3));
      });
    });
  });
});
