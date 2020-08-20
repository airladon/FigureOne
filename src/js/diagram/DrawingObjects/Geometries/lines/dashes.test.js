import {
  Point,
} from '../../../../tools/g2';
import {
  getDashElementAndRemainder, makeDashDefinition, makeDashes,
  lineToDash,
} from './dashes';
import { round } from '../../../../tools/math';

describe('Dash tests', () => {
  describe('makeDashDefinition', () => {
    test('create', () => {
      const dd = makeDashDefinition([1, 0.4, 0.2, 0.1]);
      expect(round(dd.sum)).toBe(1.7);
      expect(round(dd.cum)).toEqual([1, 1.4, 1.6, 1.7]);
      expect(dd.definition).toEqual([1, 0.4, 0.2, 0.1]);
    });
  });
  describe('getDashElementAndRemainder', () => {
    // let calcSumAndCum;
    // beforeEach(() => {
    //   calcSumAndCum = (dd) => {
    //     const cum = [];
    //     const cycleLength = dd.reduce((p, sum) => {
    //       cum.push(p + sum)
    //       return p +sum;
    //     }, 0);
    //     return [cycleLength, cum]
    //   }
    // })
    test('basic', () => {
      const dd = makeDashDefinition([1, 0.5]);
      const [index, remainder] = getDashElementAndRemainder(dd, 0.5);
      expect(index).toBe(0);
      expect(round(remainder)).toBe(0.5);
    });
    test('in second', () => {
      const dd = makeDashDefinition([1, 0.5]);
      const [index, remainder] = getDashElementAndRemainder(dd, 1.25);
      expect(index).toBe(1);
      expect(round(remainder)).toBe(0.25);
    });
    test('Over cycle', () => {
      const dd = makeDashDefinition([1, 0.5]);
      const [index, remainder] = getDashElementAndRemainder(dd, 1.75);
      expect(index).toBe(0);
      expect(round(remainder)).toBe(0.75);
    });
    test('Four part over cycle', () => {
      const dd = makeDashDefinition([1, 0.5, 1, 0.5]);
      const [index, remainder] = getDashElementAndRemainder(dd, 7.2);
      expect(index).toBe(1);
      expect(round(remainder)).toBe(0.3);
    });
  });
  describe('makeDashes', () => {
    test('dash shorter than line', () => {
      const dd = makeDashDefinition([1, 1]);
      const {
        points, continues,
      } = makeDashes(dd, new Point(0, 0), new Point(4, 0), 0);
      expect(round(points[0][0])).toEqual(new Point(0, 0));
      expect(round(points[0][1])).toEqual(new Point(1, 0));
      expect(round(points[1][0])).toEqual(new Point(2, 0));
      expect(round(points[1][1])).toEqual(new Point(3, 0));
      expect(continues).toBe(false);
    });
    test('dash longer than line', () => {
      const dd = makeDashDefinition([1, 1]);
      const dashes = makeDashes(dd, new Point(0, 0), new Point(0.5, 0), 0);
      const { points, continues } = dashes;
      expect(round(points[0][0])).toEqual(new Point(0, 0));
      expect(round(points[0][1])).toEqual(new Point(0.5, 0));
      expect(continues).toBe(true);
    });
    test('dash longer than line 2', () => {
      const dd = makeDashDefinition([0.5, 0.4, 0.5, 0.3]);
      const dashes = makeDashes(dd, new Point(0, 0), new Point(1.2, 0), 0);
      const { points, continues } = dashes;
      expect(round(points[0][0])).toEqual(new Point(0, 0));
      expect(round(points[0][1])).toEqual(new Point(0.5, 0));
      expect(round(points[1][0])).toEqual(new Point(0.9, 0));
      expect(round(points[1][1])).toEqual(new Point(1.2, 0));
      expect(continues).toBe(true);
    });
    test('offset in dash', () => {
      const dd = makeDashDefinition([0.5, 0.4, 0.5, 0.3]);
      const dashes = makeDashes(dd, new Point(0, 0), new Point(1.2, 0), 1);
      const { points, continues } = dashes;
      expect(round(points[0][0])).toEqual(new Point(0, 0));
      expect(round(points[0][1])).toEqual(new Point(0.4, 0));
      expect(round(points[1][0])).toEqual(new Point(0.7, 0));
      expect(round(points[1][1])).toEqual(new Point(1.2, 0));
      expect(continues).toBe(false);
    });
    test('offset in gap', () => {
      const dd = makeDashDefinition([0.5, 0.4, 0.5, 0.3]);
      const dashes = makeDashes(dd, new Point(0, 0), new Point(1.2, 0), 0.6);
      const { points, continues } = dashes;
      expect(round(points[0][0])).toEqual(new Point(0.3, 0));
      expect(round(points[0][1])).toEqual(new Point(0.8, 0));
      expect(round(points[1][0])).toEqual(new Point(1.1, 0));
      expect(round(points[1][1])).toEqual(new Point(1.2, 0));
      expect(continues).toBe(true);
    });
    test('45 deg line', () => {
      const dd = makeDashDefinition([0.5, 0.4, 0.5, 0.3]);
      const c45 = Math.cos(Math.PI / 4);
      const s45 = Math.sin(Math.PI / 4);
      const dashes = makeDashes(dd, new Point(0, 0), new Point(1.5 * c45, 1.5 * s45), 0);
      const { points, continues } = dashes;

      expect(round(points[0][0])).toEqual(round(new Point(0, 0)));
      expect(round(points[0][1])).toEqual(round(new Point(0.5 * c45, 0.5 * s45)));
      expect(round(points[1][0])).toEqual(round(new Point(0.9 * c45, 0.9 * s45)));
      expect(round(points[1][1])).toEqual(round(new Point(1.4 * c45, 1.4 * s45)));
      expect(continues).toBe(false);
    });
  });
  describe('lineToDash', () => {
    test('Two Points', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0)],
        [0.25, 0.25], false, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.25, 0));
      expect(round(d[1][0])).toEqual(new Point(0.5, 0));
      expect(round(d[1][1])).toEqual(new Point(0.75, 0));
    });
    test('Three Points', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)],
        [0.3, 0.3], false, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.3, 0));
      expect(round(d[1][0])).toEqual(new Point(0.6, 0));
      expect(round(d[1][1])).toEqual(new Point(0.9, 0));
      expect(round(d[2][0])).toEqual(new Point(1, 0.2));
      expect(round(d[2][1])).toEqual(new Point(1, 0.5));
      expect(round(d[3][0])).toEqual(new Point(1, 0.8));
      expect(round(d[3][1])).toEqual(new Point(1, 1));
    });
    test('Three Points - dash ends on corner', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)],
        [0.2, 0.2], false, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.2, 0));
      expect(round(d[1][0])).toEqual(new Point(0.4, 0));
      expect(round(d[1][1])).toEqual(new Point(0.6, 0));
      expect(round(d[2][0])).toEqual(new Point(0.8, 0));
      expect(round(d[2][1])).toEqual(new Point(1.0, 0));
      expect(round(d[3][0])).toEqual(new Point(1, 0.2));
      expect(round(d[3][1])).toEqual(new Point(1, 0.4));
      expect(round(d[4][0])).toEqual(new Point(1, 0.6));
      expect(round(d[4][1])).toEqual(new Point(1, 0.8));
    });
    test('Three Points - dash starts on corner', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)],
        [0.5, 0.5], false, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.5, 0));
      expect(round(d[1][0])).toEqual(new Point(1, 0));
      expect(round(d[1][1])).toEqual(new Point(1, 0.5));
    });
    test('Three Points Angle Join', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)],
        [0.4, 0.4], false, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.4, 0));
      expect(round(d[1][0])).toEqual(new Point(0.8, 0));
      expect(round(d[1][1])).toEqual(new Point(1, 0));
      expect(round(d[1][2])).toEqual(new Point(1, 0.2));
      expect(round(d[2][0])).toEqual(new Point(1, 0.6));
      expect(round(d[2][1])).toEqual(new Point(1, 1));
    });
    test('Three Points with offset', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1)],
        [0.3, 0.3], false, 0.05,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.25, 0));
      expect(round(d[1][0])).toEqual(new Point(0.55, 0));
      expect(round(d[1][1])).toEqual(new Point(0.85, 0));
      expect(round(d[2][0])).toEqual(new Point(1, 0.15));
      expect(round(d[2][1])).toEqual(new Point(1, 0.45));
      expect(round(d[3][0])).toEqual(new Point(1, 0.75));
      expect(round(d[3][1])).toEqual(new Point(1, 1));
    });
    test('Four Points with close not on dash', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)],
        [0.6, 0.5], true, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0));
      expect(round(d[0][1])).toEqual(new Point(0.6, 0));
      expect(round(d[1][0])).toEqual(new Point(1, 0.1));
      expect(round(d[1][1])).toEqual(new Point(1, 0.7));
      expect(round(d[2][0])).toEqual(new Point(0.8, 1));
      expect(round(d[2][1])).toEqual(new Point(0.2, 1));
      expect(round(d[3][0])).toEqual(new Point(0, 0.7));
      expect(round(d[3][1])).toEqual(new Point(0, 0.1));
    });
    test('Four Points with close on dash', () => {
      const d = lineToDash(
        [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)],
        [0.6, 0.6], true, 0,
      );
      expect(round(d[0][0])).toEqual(new Point(0, 0.4));
      expect(round(d[0][1])).toEqual(new Point(0, 0));
      expect(round(d[0][2])).toEqual(new Point(0.6, 0));
      expect(round(d[1][0])).toEqual(new Point(1, 0.2));
      expect(round(d[1][1])).toEqual(new Point(1, 0.8));
      expect(round(d[2][0])).toEqual(new Point(0.6, 1));
      expect(round(d[2][1])).toEqual(new Point(0, 1));
    });
  });
});
