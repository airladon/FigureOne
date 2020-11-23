
// @flow
import {
  Point, quadBezierPoints,
} from '../../../../tools/g2';
import Symbol from './SymbolNew';
// import Bounds from '../Elements/Bounds';

export default class Product extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'strip';
  // }

  // eslint-disable-next-line class-methods-use-this
  // getWidth() {
  //   return (options: Object, height: number) => {
  //     // The width should be 7 times the thick2 linewidth;
  //     // const { lineWidth } = options;
  //     let width;
  //     if (options.draw === 'static') {
  //       let { staticHeight } = options;
  //       if (typeof staticHeight !== 'number') {
  //         staticHeight = height;
  //       }
  //       ({ width } = this.getDefaultValues(staticHeight, null, options));
  //       return width / staticHeight * height;
  //     }
  //     ({ width } = options);
  //     ({ width } = this.getDefaultValues(height, width, options));
  //     return width;
  //   };
  // }

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

  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object, widthIn: number, height: number) {
    const { serif, sides } = options;
    const { lineWidth, width } = this.getDefaultValues(
      height,
      widthIn,
      options,
    );
    let sidesToUse = sides;
    if (serif === 'false') {
      sidesToUse = 2;
    }
    // const { lineWidth, sides } = options;
    // let lineWidthToUse = lineWidth;
    // if (lineWidth == null) {
    //   // lineWidthToUse = width / (25 * height + 15);
    //   lineWidthToUse = width / 21;
    // }

    const thick1 = lineWidth * 1.2;
    const thick2 = lineWidth * 3;
    const tipWidth = lineWidth / 2;
    const a = thick2 * 0.9;

    const p0 = new Point(0, 0);
    const p1 = new Point(thick2 + a * 2, 0);
    const p2 = new Point(p0.x, tipWidth);
    const p3 = new Point(p1.x, tipWidth);
    const p4 = new Point(a, p2.y);
    const p5 = new Point(a + thick2, p4.y);
    const p6 = new Point(p4.x, height - tipWidth);
    const p7 = new Point(p5.x, height - tipWidth);
    const p8 = new Point(p2.x, height - tipWidth);
    // const p9 = new Point(p3.x, height - tipWidth);
    const p10 = new Point(p2.x, height);
    const p11 = new Point(p3.x, height);

    const p40 = p2;
    const p41 = p4;
    const p42 = new Point(p4.x, p4.y + a);
    const p50 = p3;
    const p51 = p5;
    const p52 = new Point(p5.x, p4.y + a);
    const p4Curve = quadBezierPoints(p40, p41, p42, sidesToUse);
    const p5Curve = quadBezierPoints(p50, p51, p52, sidesToUse);
    const bottomCurve = [];
    p4Curve.forEach((p, index) => {
      bottomCurve.push(p);
      bottomCurve.push(p5Curve[index]);
    });

    const p60 = new Point(p6.x, p6.y - a);
    const p61 = p6;
    const p62 = p8;
    // const p70 = new Point(p7.x, p7.y - a);
    // const p71 = p7;
    // const p72 = p9;
    const p6Curve = quadBezierPoints(p60, p61, p62, sidesToUse);
    // const p7Curve = quadBezierPoints(p70, p71, p72, sides);
    const topCurve = [];
    p6Curve.forEach((p) => {
      topCurve.push(p);
      // topCurve.push(p7Curve[index]);
      topCurve.push(new Point(p7.x, p.y));
    });

    const leg = [
      p0,
      p1,
      // p2,
      // p3,
      // p4,
      // p5,
      ...bottomCurve,
      // p6,
      // p7,
      // p8,
      // p9,
      ...topCurve,
      p10,
      p11,
    ];
    const leg2 = [];
    for (let i = leg.length - 1; i > 0; i -= 2) {
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
    return [points, width, height];
  }

  // Linewidths that look good:
  // height          width         lineWidth
  //   2              1.6            0.05
  //   1              0.8            0.025
  //   0.5            0.4            0.012
  //   0.3            0.25           0.009
  //   0.2            0.2           0.008
  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
    }) {
    const out: {
      lineWidth: number,
      width: number,
      height: number,
    } = {
      lineWidth: options.lineWidth || 1, // height * 0.93 / (25 * height + 15),
      width: width || 1,
      height,
    };
    if (options.lineWidth == null && width != null) {
      out.lineWidth = width / 7 / 3;
    } else if (options.lineWidth == null && width == null) {
      // out.lineWidth = height * 0.93 / (25 * height + 15);
      out.lineWidth = 12902.65 + (0.001053004 - 12902.65) / (1 + (height / 573148) ** 0.9938213);
      out.width = 1704804 + (0.002184303 - 1704804) / (1 + (height / 2234236) ** 0.9967453);
    } else if (options.lineWidth != null && width == null) {
      out.width = options.lineWidth * 7 * 3;
    }
    return out;
  }
}
