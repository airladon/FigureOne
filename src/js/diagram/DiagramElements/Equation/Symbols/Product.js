
// @flow
import {
  Point, quadBezierPoints,
} from '../../../../tools/g2';
import Symbol from './Symbol';


export default class Product extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      return height * 0.93;
    };
  }

  //                                            w
  //             |<--------------------------------------------------------->|
  //             |                                                           |
  //             |   a                                                       |
  //             |<---->|                                                    |
  //             |      |                     thick1                         |
  //             |      |                     /                              |
  //             |      |                    /                               |
  //       ---- 00000000000000000000000000000000000000000000000000000000000000
  //       A         000000000000000000000000000000000000000000000000000000
  //       |           00000000000000000000000000000000000000000000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000   \                 /   00000000000
  //    h  |            00000000000    \              /     00000000000
  //       |            00000000000      \          /       00000000000
  //       |            00000000000        \      /         00000000000
  //       |            00000000000         thick2          00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |            00000000000                         00000000000
  //       |           0000000000000                       00000000000000
  //       V         00000000000000000                   000000000000000000
  //       ----- 0000000000000000000000000           00000000000000000000000000

  //
  //                         10 0000000000000000000000000 11
  //                          8 0000000000000000000000000 9
  //                                 6 00000000000 7
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                   00000000000
  //                                 4 00000000000 5
  //                          2 00000000000000000000000000  3
  //                          0 00000000000000000000000000  1
  //                        (0, 0)

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

      const thick1 = lineWidthToUse;
      const thick2 = lineWidthToUse * 3;
      const tipWidth = lineWidthToUse / 2
      const a = thick2;

      const p0 = new Point(0, 0);
      const p1 = new Point(thick2 + a * 2, 0);
      const p2 = new Point(p0.x, tipWidth);
      const p3 = new Point(p1.x, tipWidth);
      const p4 = new Point(a, p2.y);
      const p5 = new Point(a + thick2, p4.y);
      const p6 = new Point(p4.x, height - tipWidth);
      const p7 = new Point(p5.x, height - tipWidth);
      const p8 = new Point(p2.x, height - tipWidth);
      const p9 = new Point(p3.x, height - tipWidth);
      const p10 = new Point(p2.x, height);
      const p11 = new Point(p3.x, height);

      const leg = [
        p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11,
      ];
      const leg2 = [];
      for (let i = leg.length - 1; i > 0; i -= 2) {
        console.log(i)
        leg2.push(new Point(width - leg[i - 1].x, leg[i - 1].y));
        leg2.push(new Point(width - leg[i].x, leg[i].y));
      }
      const transition = [
        new Point(a + thick2, height),
        new Point(a + thick2, height - thick1),
        new Point(width - a - thick2, height),
        new Point(width - a - thick2, height - thick1),
      ];
      const points = [
        ...leg,
        ...transition,
        ...leg2,
      ];
      console.log(points)
      // const p40 = p2;
      // const p41 = p4;
      // const p42 = new Point(p4.x, p4.y + a);
      // const p50 = p3;
      // const p51 = p5;
      // const p52 = new Point(p5.x, p4.y + a);
      // const p4Curve = quadBezierPoints(p40, p41, p42, sides);
      // const p5Curve = quadBezierPoints(p50, p51, p52, sides);
      // const bottomCurve = [];
      // p4Curve.forEach((p, index) => {
      //   bottomCurve.push(p);
      //   bottomCurve.push(p5Curve[index]);
      // })

      // const p60 = new Point(p6.x, p6.y - a);
      // const p61 = p6;
      // const p61 = p8
      // const p70 = new Point(p7.x, p7.y - a);
      // const p71 = p7;
      // const p71 = p9;
      // const p6Curve = quadBezierPoints(p60, p61, p62, sides);
      // const p7Curve = quadBezierPoints(p70, p71, p72, sides);
      // const topCurve = [];
      // p6Curve.forEach((p, index) => {
      //   topCurve.push(p);
      //   topCurve.push(p7Curve[index]);
      // })
      

      // const p0 = new Point(width - a, 0);

      //   p1.x - (cBottom - thick3) / Math.tan(bottomTipAngle), thick3,
      // );
      // const p4 = new Point(0, 0);
      // const p5 = new Point(thick2 / Math.sin(lineA.ang) + thick3 / Math.tan(lineA.ang), thick3);
      // const p6 = new Point(a, e);
      // const p7 = intersection;
      // const p8 = new Point(0, height);
      // const p9 = new Point(
      //   -thick1 / Math.sin(lineB.ang) - thick2 / Math.tan(lineB.ang),
      //   height - thick2,
      // );
      // const p10 = new Point(width - bTop, height);
      // const p12 = new Point(width, height - cTop);
      // const p13 = new Point(width - tipWidth, height - cTop);
      // const p11 = new Point(
      //   p13.x - (cTop - thick2) / Math.tan(topTipAngle),
      //   height - thick2,
      // );

      // const p30 = p1;
      // const p31 = p3;
      // const p32 = new Point(p31.x - (cBottom - thick3), thick3);
      // const bottomCurve = quadBezierPoints(p30, p31, p32, sides);
      // const bottomCurvePairs = [];
      // bottomCurve.forEach((p) => {
      //   bottomCurvePairs.push(p2);
      //   bottomCurvePairs.push(p);
      // });

      // const p111 = p11;
      // const p110 = new Point(p111.x - cTop + thick2, height - thick2);
      // const p112 = p13;
      // const topCurve = quadBezierPoints(p110, p111, p112, sides);
      // const topCurvePairs = [];
      // topCurve.forEach((p) => {
      //   topCurvePairs.push(p10);
      //   topCurvePairs.push(p);
      // });
      // const points = [
      //   p0,
      //   p1,
      //   ...bottomCurvePairs,
      //   p4,
      //   p5,
      //   p6,
      //   p7,
      //   p8,
      //   p9,
      //   ...topCurvePairs,
      //   p12,
      //   p13,
      // ];
      return [points, width, height];
    };
  }
}
