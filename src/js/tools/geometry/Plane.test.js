import {
  Plane, getPlane,
} from './Plane';
import { Line } from './Line';
import { Point } from './Point';
import { round } from '../math';

const point = (x, y, z) => new Point(x, y, z);

describe('Plane', () => {
  describe('Creation', () => {
    test('(0,0,0) (0,0,1)', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.p).toEqual(point(0, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('(1,2,3) (-1,2,4)', () => {
      const p = new Plane([1, 2, 3], [-1, 2, 4]);
      expect(p.p).toEqual(point(1, 2, 3));
      expect(p.n.round()).toEqual(point(-1, 2, 4).normalize().round());
    });
    test('Three points', () => {
      const p = new Plane([0, 0, 0], [1, 0, 0], [1, 1, 0]);
      expect(p.p).toEqual(point(0, 0, 0));
      expect(p.n.round()).toEqual(point(0, 0, 1).normalize());
    });
    test('ParsablePlane - three points', () => {
      const p = new Plane([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
      expect(p.p).toEqual(point(0, 0, 0));
      expect(p.n.round()).toEqual(point(0, 0, 1).normalize());
    });
    test('Parsable Plane - point, normal', () => {
      const p = new Plane([[1, 2, 3], [-1, 2, 4]]);
      expect(p.p).toEqual(point(1, 2, 3));
      expect(p.n.round()).toEqual(point(-1, 2, 4).normalize().round());
    });
  });
  describe('Default planes', () => {
    test('xy', () => {
      const xy = Plane.xy();
      expect(xy.p).toEqual(point(0, 0, 0));
      expect(xy.n).toEqual(point(0, 0, 1));
    });
    test('xz', () => {
      const xz = Plane.xz();
      expect(xz.p).toEqual(point(0, 0, 0));
      expect(xz.n).toEqual(point(0, 1, 0));
    });
    test('yz', () => {
      const yz = Plane.yz();
      expect(yz.p).toEqual(point(0, 0, 0));
      expect(yz.n).toEqual(point(1, 0, 0));
    });
  });
  describe('getPlane', () => {
    test('Array definition', () => {
      const p = new Plane([[1, 0, 0], [0, 0, 1]]);
      expect(p.p).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('Def definition', () => {
      const pDef = new Plane([[1, 0, 0], [0, 0, 1]])._state();
      const p = getPlane(pDef);
      expect(p.p).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('JSON definition', () => {
      const p = getPlane('{ "f1Type": "pl", "state": [[1, 0, 0], [0, 0, 1]] }');
      expect(p.p).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('JSON array', () => {
      const p = getPlane('[[1, 0, 0], [0, 0, 1]]');
      expect(p.p).toEqual(point(1, 0, 0));
      expect(p.n).toEqual(point(0, 0, 1));
    });
    test('Fail undefined', () => {
      expect(() => getPlane()).toThrow();
    });
  });
  test('copy', () => {
    const p = new Plane([1, 2, 3], [-1, 2, 4]);
    const p1 = p._dup();
    expect(p).toEqual(p1);
    expect(p).not.toBe(p1);
  });
  test('def', () => {
    const pDef = new Plane([[1, 0, 0], [0, 0, 1]])._state();
    expect(pDef.f1Type).toBe('pl');
    expect(pDef.state).toEqual([[1, 0, 0], [0, 0, 1]]);
  });
  describe('Point on Plane', () => {
    test('Same as p0', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([0, 0, 0])).toBe(true);
    });
    test('On Plane', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([1, 0, 0])).toBe(true);
      expect(p.hasPointOn([0, 1, 0])).toBe(true);
      expect(p.hasPointOn([0, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, 0, 0])).toBe(true);
      expect(p.hasPointOn([1, 1, 0])).toBe(true);
      expect(p.hasPointOn([1, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, -1, 0])).toBe(true);
      expect(p.hasPointOn([-1, 1, 0])).toBe(true);
      expect(p.hasPointOn([10, 0.5, 0])).toBe(true);
      expect(p.hasPointOn([-2, 0.5, 0])).toBe(true);
      expect(p.hasPointOn([-2, -0.5, 0])).toBe(true);
      expect(p.hasPointOn([0, 0, 0.001], 2)).toBe(true);
    });
    test('Off Plane', () => {
      const p = new Plane([0, 0, 0], [0, 0, 1]);
      expect(p.hasPointOn([1, 0, 0.001])).toBe(false);
      expect(p.hasPointOn([0, 1, 1])).toBe(false);
      expect(p.hasPointOn([0, -1, -0.1])).toBe(false);
      expect(p.hasPointOn([-1, 0, 0.00001])).toBe(false);
      expect(p.hasPointOn([1, 1, 2])).toBe(false);
      expect(p.hasPointOn([1, -1, -10])).toBe(false);
      expect(p.hasPointOn([-1, -1, 1])).toBe(false);
      expect(p.hasPointOn([-1, 1, 0.1])).toBe(false);
      expect(p.hasPointOn([10, 0.5, -0.3])).toBe(false);
      expect(p.hasPointOn([-2, 0.5, -5])).toBe(false);
      expect(p.hasPointOn([-2, -0.5, 5])).toBe(false);
      expect(p.hasPointOn([0, 0, 0.001], 3)).toBe(false);
    });
  });
  describe('Is Parallel To', () => {
    test('normals along x', () => {
      const p = new Plane([0, 0, 0], [1, 0, 0]);
      const q = new Plane([10, 0, 0], [1, 0, 0]);
      expect(p.isParallelTo(q)).toBe(true);
    });
    test('normals along x, y, z', () => {
      const p = new Plane([1, 1, 1], [2, 2, 2]);
      const q = new Plane([10, 10, 10], [8, 8, 8]);
      expect(p.isParallelTo(q)).toBe(true);
    });
    test('Same', () => {
      const p = new Plane([1, 1, 1], [2, 2, 2]);
      const q = new Plane([1, 1, 1], [2, 2, 2]);
      expect(p.isParallelTo(q)).toBe(true);
    });
    test('Not Parallel', () => {
      const p = new Plane([1, 1, 1], [2, 2, 2.1]);
      const q = new Plane([1, 1, 1], [2, 2, 2]);
      expect(p.isParallelTo(q)).toBe(false);
    });
  });
  describe('Is Equal To', () => {
    test('Same planes', () => {
      const p = new Plane([0, 0, 0], [1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(true);
    });
    test('Same planes, opposite directions', () => {
      const p = new Plane([0, 0, 0], [-1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(true);
    });
    test('Same planes, opposite directions, different reference points', () => {
      const p = new Plane([0, 1, 1], [-1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(true);
    });
    test('Different planes - parallel', () => {
      const p = new Plane([1, 0, 0], [1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(false);
    });
    test('Different planes - same point', () => {
      const p = new Plane([0, 0, 0], [0, 1, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(false);
    });
    test('Different planes - different point', () => {
      const p = new Plane([1, 0, 0], [0, 1, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      expect(p.isEqualTo(q)).toBe(false);
    });
  });
  describe('Plane Intersection', () => {
    test('XZ and XY planes', () => {
      const XZ = new Plane([0, 0, 0], [0, 1, 0]);
      const XY = new Plane([0, 0, 0], [0, 0, 1]);
      const l = XZ.intersectsWith(XY);
      expect(l.hasPointOn([0, 0, 0])).toBe(true);
      expect(l.hasPointOn([1, 0, 0])).toBe(true);
    });
    test('Offset YZ and XY planes', () => {
      const p = new Plane([1, 0, 0], [1, 0, 0]);
      const q = new Plane([0, 0, 1], [0, 0, 1]);
      const l = p.intersectsWith(q);
      expect(l.hasPointOn([1, 0, 1])).toBe(true);
      expect(l.hasPointOn([1, 1, 1])).toBe(true);
    });
    test('Parallel Planes', () => {
      const p = new Plane([1, 0, 0], [1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      const l = p.intersectsWith(q);
      expect(l).toBe(null);
    });
    test('Same Planes', () => {
      const p = new Plane([0, 0, 0], [1, 0, 0]);
      const q = new Plane([0, 0, 0], [1, 0, 0]);
      const l = p.intersectsWith(q);
      expect(l).toBe(null);
    });
  });
  describe('line intersect', () => {
    test('YZ plane with x axis, intercept in line', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([-1, 0, 0], [1, 0, 0]);
      const i = YZ.lineIntersect(x);
      expect(i.round()).toEqual(point(0, 0, 0));
    });
    test('YZ plane with x axis, intercept off line', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([0.5, 0, 0], [1, 0, 0]);
      const i = YZ.lineIntersect(x);
      expect(i.round()).toEqual(point(0, 0, 0));
    });
    test('YZ plane with x axis, intercept off line reverse', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([-0.5, 0, 0], [-1, 0, 0]);
      const i = YZ.lineIntersect(x);
      expect(i.round()).toEqual(point(0, 0, 0));
    });
    test('YZ plane with 3D line on plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([0, 1, 1], [1, 2, 3]);
      const i = YZ.lineIntersect(x);
      expect(i.round()).toEqual(point(0, 1, 1));
    });
    test('YZ plane with 3D line off plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([1, 1, 0], [2, 1, 0]);
      const i = YZ.lineIntersect(x);
      expect(i.round()).toEqual(point(0, 1, 0));
    });
    test('Parallel off plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([1, 1, 0], [1, 2, 0]);
      const i = YZ.lineIntersect(x);
      expect(i).toBe(null);
    });
    test('Parallel on plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([0, 1, 3], [0, 2, -1]);
      const i = YZ.lineIntersect(x);
      expect(i).toBe(null);
    });
  });
  describe('has line on', () => {
    test('YZ plane, y axis line', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const y = new Line([0, 0, 0], [0, 1, 0]);
      expect(YZ.hasLineOn(y)).toBe(true);
    });
    test('YZ plane, yz line', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const yz = new Line([0, 2, 4], [0, -1, 10]);
      expect(YZ.hasLineOn(yz)).toBe(true);
    });
    test('YZ plane, x line', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const x = new Line([0, 0, 0], [1, 0, 0]);
      expect(YZ.hasLineOn(x)).toBe(false);
    });
  });
  describe('distance to point', () => {
    test('YZ plane, point at x = 1', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const p = new Point([1, 0, 0]);
      expect(round(YZ.distanceToPoint(p))).toBe(1);
    });
    test('YZ plane, point at x = 10', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const p = new Point([-5, -10, 100]);
      expect(round(YZ.distanceToPoint(p))).toBe(5);
    });
  });
  describe('point projection', () => {
    test('YZ plane off plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const p = new Point([100, 3, -10]);
      expect(YZ.pointProjection(p).round()).toEqual(point(0, 3, -10));
    });
    test('YZ plane on plane', () => {
      const YZ = new Plane([0, 0, 0], [1, 0, 0]);
      const p = new Point([0, 3, -10]);
      expect(YZ.pointProjection(p).round()).toEqual(point(0, 3, -10));
    });
  });
});
