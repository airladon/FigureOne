
// @flow
import {
  Point, Line, quadBezierPoints,
} from '../../../../tools/g2';
import Symbol from './Symbol';


export default class Sum extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  // // eslint-disable-next-line class-methods-use-this
  // getWidth() {
  //   return (type: 'static' | 'dynamic', options: Object, height: number) => {
  //     const { width } = options;
  //     if (type === 'static') {
  //       return height * width;
  //     }
  //     return width;
  //   };
  // }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      return height * 0.88;
    };
  }


  //                   8                                    10
  //          ---------- 00000000000000000000000000000000000_______________
  //          A            0000000 9         \      11 000000           *
  //          |              0000000          \           000           *
  //          |                0000000         thick2       00  12     *
  //          |                  0000000  D             13    \       * tipAngle
  //          |                    0000000                     \    *
  //          |                  B   0000000       thick1        \*
  //          |                        0000000    /
  //          |                          0000000 /
  //          |                            0000000
  //          |                              0000000
  //          |                                000000  -- 7
  //          |      -------------------------6  000
  //          |      A                         00|0
  //       h  |      |                       0000|
  //          |      |                     0000  |\
  //          |      |                   0000    | \
  //          |      | e               0000      |  thick2
  //          |      |               0000  C     |
  //          |      |         A   0000          |             0
  //          |      |           0000            |         1   |____
  //          |      |         0000       thick3 |           00    A
  //          |      |       0000        /       |      3  000|    |
  //          |      |     0000  5      /        |      000000|    |  c
  //          V      V   000000000000000000000000|00000000000 |    |
  //          --------  0000000000000000000000000|0000000000__|____V
  //                 4 |                         |        2|  |
  //                   |                         |         |  |
  //                   |                         |         |  |
  //                   |<----------------------->|         |  |
  //                   |           a                       |  |
  //                   |                                   |  |
  //                   |                                   |  |  b
  //                   |                              ---->|  |<---
  //                   |                                      |
  //                   |                                      |
  //                   |                  w                   |
  //                   |<------------------------------------>|
  //

  // Linewidths that look good:
  // height = 0.2, linewWidth = width / 20
  // height = 0.6, linewWidth = width / 30
  // height = 1, linewWidth = width / 40
  // height = 1.4, linewWidth = width / 50
  // height = 1.8, linewWidth = width / 60
  // Therefore default lineWidth =  width / (25 * height + 15)
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, width: number, height: number) => {
      const { lineWidth, sides } = options;
      let lineWidthToUse = lineWidth;
      if (lineWidth == null) {
        lineWidthToUse = width / (25 * height + 15);
      }
      const bottomTipAngle = Math.PI / 2 * 0.9;
      const topTipAngle = Math.PI / 2 * 0.95;
      const a = 0.431 * width;
      const e = height / 2 - lineWidthToUse;
      const cBottom = 0.176 * height;
      const cTop = 0.153 * height;
      const bBottom = cBottom / Math.tan(bottomTipAngle);
      const bTop = cTop / Math.tan(topTipAngle);

      const thick2 = lineWidthToUse;
      const thick3 = lineWidthToUse * 2;
      const thick1 = lineWidthToUse * 3;
      const tipWidth = lineWidthToUse * 0.6;

      const lineA = new Line(new Point(0, 0), new Point(a, e));
      const CxOffset = thick2 / Math.sin(lineA.ang);
      const lineC = new Line(new Point(CxOffset, 0), height, lineA.ang);
      const lineB = new Line(new Point(0, height), new Point(a, e));
      const DxOffset = -thick1 / Math.sin(lineB.ang);
      const lineD = new Line(new Point(DxOffset, height), height, lineB.ang);

      const intersection = lineC.intersectsWith(lineD).intersect;

      const p0 = new Point(width, cBottom);
      const p1 = new Point(width - tipWidth, cBottom);
      const p2 = new Point(width - bBottom, 0);
      const p3 = new Point(
        p1.x - (cBottom - thick3) / Math.tan(bottomTipAngle), thick3,
      );
      const p4 = new Point(0, 0);
      const p5 = new Point(thick2 / Math.sin(lineA.ang) + thick3 / Math.tan(lineA.ang), thick3);
      const p6 = new Point(a, e);
      const p7 = intersection;
      const p8 = new Point(0, height);
      const p9 = new Point(
        -thick1 / Math.sin(lineB.ang) - thick2 / Math.tan(lineB.ang),
        height - thick2,
      );
      const p10 = new Point(width - bTop, height);
      const p12 = new Point(width, height - cTop);
      const p13 = new Point(width - tipWidth, height - cTop);
      const p11 = new Point(
        p13.x - (cTop - thick2) / Math.tan(topTipAngle),
        height - thick2,
      );

      const p30 = p1;
      const p31 = p3;
      const p32 = new Point(p31.x - (cBottom - thick3), thick3);
      const bottomCurve = quadBezierPoints(p30, p31, p32, sides);
      const bottomCurvePairs = [];
      bottomCurve.forEach((p) => {
        bottomCurvePairs.push(p2);
        bottomCurvePairs.push(p);
      });

      const p111 = p11;
      const p110 = new Point(p111.x - cTop + thick2, height - thick2);
      const p112 = p13;
      const topCurve = quadBezierPoints(p110, p111, p112, sides);
      const topCurvePairs = [];
      topCurve.forEach((p) => {
        topCurvePairs.push(p10);
        topCurvePairs.push(p);
      });
      const points = [
        p0,
        p1,
        ...bottomCurvePairs,
        p4,
        p5,
        p6,
        p7,
        p8,
        p9,
        ...topCurvePairs,
        p12,
        p13,
      ];
      return [points, width, height];
    };
  }
}
