import {
  Point, getBoundingRect, Line,
} from '../../../tools/g2';
import { round } from '../../../tools/math';
import {
  makePolyLine,
} from './lines';

describe('Tools Lines', () => {
  describe('makePolyLine Corners', () => {
    test('simple negative 90º', () => {
      const [tris] = makePolyLine(
        [new Point(0, 0), new Point(0, 1), new Point(1, 1)],
        0.1, false, 'negative', 'auto',
      );
      expect(round(tris)).toEqual([
        new Point(0, 0),
        new Point(0, 1),  // 1 - outside corner
        new Point(0.1, 0),
        new Point(0.1, 0),
        new Point(0, 1),
        new Point(0.1, 0.9), // 5 - inside corner line 1
        //
        new Point(0, 1),
        new Point(1, 1),
        new Point(0.1, 0.9),  // 8 - inside corner line 1
        new Point(0.1, 0.9),
        new Point(1, 1),
        new Point(1, 0.9),
      ]);
    });
    test('simple negative 45º', () => {
      const line1 = new Line(new Point(0, 0), new Point(0, 1));
      const line2 = new Line({
        p1: line1.p2._dup(), length: 1, angle: Math.PI / 2 - Math.PI / 4 * 3,
      });
      const offsetLine1 = line1.offset('negative', 0.1);
      const offsetLine2 = line2.offset('negative', 0.1);
      const [tris] = makePolyLine(
        [line1.p1, line1.p2, line2.p2],
        0.1, false, 'negative', 'auto',
      );
      const outsideCorner = tris[1];
      expect(round(outsideCorner)).toEqual(round(line1.intersectsWith(line2).intersect));

      const insideCorner1 = tris[5];
      expect(round(insideCorner1))
        .toEqual(round(offsetLine1.intersectsWith(offsetLine2).intersect));

      const insideCorner2 = tris[8];
      expect(round(insideCorner2))
        .toEqual(round(offsetLine2.intersectsWith(offsetLine1).intersect));
    });
  });
  describe('makePolyLine', () => {
    let points;
    beforeEach(() => {
      points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1),
      ];
    });
    describe('Negative', () => {
      test('Unclosed', () => {
        const [tris, border] = makePolyLine(points, 0.1, false, 'negative', 'none');
        const line1 = getBoundingRect(tris.slice(0, 6));
        const line2 = getBoundingRect(tris.slice(6, 12));
        const line3 = getBoundingRect(tris.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.1);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(1);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(1);
        expect(round(line3.height)).toBe(0.1);
        expect(round(border[0])).toEqual([
          new Point(0, -0.1),
          new Point(1, -0.1),
          new Point(1.1, 0),
          new Point(1.1, 1),
          new Point(1, 1.1),
          new Point(0, 1.1),
          new Point(0, 1),
          new Point(1, 1),
          new Point(1, 0),
          new Point(0, 0),
        ]);
      });
      test('closed', () => {
        // const out = makePolyLine(points, 0.1, true, 'outside', 'none');
        const [tris, border] = makePolyLine(points, 0.1, true, 'negative', 'none');
        const line1 = getBoundingRect(tris.slice(0, 6));
        const line2 = getBoundingRect(tris.slice(6, 12));
        const line3 = getBoundingRect(tris.slice(12, 18));
        const line4 = getBoundingRect(tris.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.1);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(1);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(1);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(-0.1);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);

        expect(round(border[0])).toEqual([
          new Point(0, -0.1),
          new Point(1, -0.1),
          new Point(1.1, 0),
          new Point(1.1, 1),
          new Point(1, 1.1),
          new Point(0, 1.1),
          new Point(-0.1, 1),
          new Point(-0.1, 0),
          new Point(0, -0.1),
          new Point(0, 0),
          new Point(0, 1),
          new Point(1, 1),
          new Point(1, 0),
          new Point(0, 0),
        ]);
      });
      test('radius', () => {
        const out = makePolyLine(points, 0.1, true, 'negative', 'radius', 0.015, 10);
        expect(round(out)).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'negative', 'fill');
        expect(round(out)).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'negative', 'auto');
        expect(round(out)).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'negative', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        // const r = round(out);
        expect(round(out)).toMatchSnapshot();
      });
    });
    describe('Positive', () => {
      test('Unclosed', () => {
        const [out] = makePolyLine(points, 0.1, false, 'positive', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(0);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.9);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.9);
        expect(round(line3.height)).toBe(0.1);
      });
      test('closed', () => {
        const [out] = makePolyLine(points, 0.1, true, 'positive', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12, 18));
        const line4 = getBoundingRect(out.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(0);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.9);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.9);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(0);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);
      });
      test('radius', () => {
        const out = makePolyLine(points, 0.1, true, 'positive', 'radius', 0.015, 10);
        expect(round(out)).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'positive', 'fill');
        expect(round(out)).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'positive', 'auto');
        expect(round(out)).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'positive', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        expect(round(out)).toMatchSnapshot();
      });
    });
    describe('Mid', () => {
      test('Unclosed', () => {
        const [out] = makePolyLine(points, 0.1, false, 'mid', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.05);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.95);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.95);
        expect(round(line3.height)).toBe(0.1);
      });
      test('closed', () => {
        const [out] = makePolyLine(points, 0.1, true, 'mid', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12, 18));
        const line4 = getBoundingRect(out.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.05);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.95);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.95);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(-0.05);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);
      });
      test('radius', () => {
        const [out] = makePolyLine(points, 0.1, true, 'mid', 'radius', 0.015, 10);
        expect(round(out)).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'fill');
        expect(round(out)).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'auto');
        expect(round(out)).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        expect(round(out)).toMatchSnapshot();
      });
    });
  });
});

// Use below code to show different poly line tests replacing `out =...` with
// with the `out` line from the test
//
// const figure = new Fig.Figure();
// const { Point } = Fig;
// const { makePolyLine } = Fig.tools.lines;

// const line = [
//   new Point(0, 0),
//   new Point(1, 0),
//   new Point(1, 1),
//   new Point(0, 1),
// ];

// const out = makePolyLine(
//   line, 0.01, true, 'inside', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08],
// );

// figure.add([
//   {
//     name: 'r',
//     make: 'shapes.generic',
//     options: {
//       points: out,
//       drawType: 'TRIANGLES',
//       position: [-0.7, -0.5],
//     },
//   },
// ]);

// figure.initialize();
