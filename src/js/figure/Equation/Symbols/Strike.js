// @flow
import { FigureElementPrimitive } from '../../Element';
import {
  Point,
} from '../../../tools/g2';
import Symbol from './SymbolNew';
import Bounds from '../Elements/Bounds';
// import WebGLInstance from '../../../webgl/webgl';


export default class Strike extends Symbol {
  symbol: FigureElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'strip';
  // }

  //                             X Strike
  //               2    3                  4      5
  //             --- 000                     000
  //             A     000                 000
  //             |       000             000
  //             |         000         000
  //             |           000     000
  //             |             000 000
  //     height  |               000
  //             |             000 000
  //             |           000     000
  //             |         000         000
  //             |       000             000
  //             V     000                 000
  //             --- 000                     000
  //               0 |   1                 6   |  7
  //                 |                         |
  //                 |<----------------------->|
  //                           width
  //
  //
  //                          Forward Strike
  //
  //                                         000
  //                                       000
  //                                     000
  //                                   000
  //                                 000
  //                               000
  //                             000
  //                           000
  //                         000
  //                       000
  //                     000
  //                   000
  //                 000

  //                          Back Strike
  //                 000
  //                   000
  //                     000
  //                       000
  //                         000
  //                           000
  //                             000
  //                               000
  //                                 000
  //                                   000
  //                                     000
  //                                       000
  //                                         000


  //                1      Horizontal Strike     3
  //                 000000000000000000000000000
  //                 000000000000000000000000000
  //                0                            2
  //
  //              |
  //              |           \      00000000000000
  //              |             \  00000000000000
  //              |              00000000000000
  //              |            00000000000000
  //              |          00000000000000
  //              |        00000000000000
  //              |      00000000000000  \
  //              |    00000000000000      \ LineWidth
  //              |  00000000000000   o
  //           -- |00000000000000       o   theta
  //           A  |  0000000000          o
  //         b |  |    000000             o
  //           V  |    g 00               o
  //           --- -------------------------------
  //              |       |
  //              |<----->|
  //                  a
  //
  // theta = atan(height / width)
  //
  // angle g = 180 - theta - 90
  // b = lineWidth * sin(g)
  // a = lineWidth * cos(g)


  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object, widthIn: number, heightIn: number) {
    const { style } = options;
    const { lineWidth, width, height } = this.getDefaultValues(
      heightIn, widthIn, options,
    );
    let points;
    const theta = Math.atan2(height, width);
    const g = Math.PI / 2 - theta;
    const a = lineWidth * Math.cos(g);
    const b = lineWidth * Math.sin(g);
    const p0 = new Point(0, b);
    const p1 = new Point(a, 0);
    const p2 = new Point(0, height - b);
    const p3 = new Point(a, height);
    const p4 = new Point(width - a, height);
    const p5 = new Point(width, height - b);
    const p6 = new Point(width - a, 0);
    const p7 = new Point(width, b);

    const h0 = new Point(0, height / 2 - lineWidth / 2);
    const h1 = new Point(0, height / 2 + lineWidth / 2);
    const h2 = new Point(width, height / 2 - lineWidth / 2);
    const h3 = new Point(width, height / 2 + lineWidth / 2);

    if (style === 'forward') {
      points = [
        p0, p1, p5,
        p0, p5, p4,
      ];
    } else if (style === 'back') {
      points = [
        p2, p3, p7,
        p2, p7, p6,
      ];
    } else if (style === 'cross') {
      points = [
        p0, p1, p5,
        p0, p5, p4,
        p2, p3, p7,
        p2, p7, p6,
      ];
    } else {
      points = [
        h0, h2, h3,
        h0, h3, h1,
      ];
    }
    return [points, width, height, 'triangles'];
  }

  /* eslint-disable class-methods-use-this */
  getBounds(
    options: {
      lineWidth?: number,
      height?: number,
      width?: number,
    },
    leftIn: number,
    bottomIn: number,
    widthIn: number,
    heightIn: number,
  ) {
    const { width, height } = this.getDefaultValues(
      heightIn, widthIn, options,
    );
    const bounds = new Bounds();
    bounds.left = leftIn;
    bounds.bottom = bottomIn;
    bounds.width = width;
    bounds.height = height;
    bounds.right = bounds.left + bounds.width;
    bounds.top = bounds.bottom + bounds.height;
    bounds.descent = 0;
    bounds.ascent = bounds.height;
    return bounds;
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      height?: number,
      width?: number,
    }): {
      height: number,
      width: number,
      lineWidth: number,
    } {
    const out = {};
    if (options.lineWidth != null && typeof options.lineWidth === 'number') {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.015;
    }
    if (options.height != null && typeof options.height === 'number') {
      out.height = options.height;
    } else if (height != null) {
      out.height = height;
    } else {
      out.height = 1;
    }
    if (options.width != null && typeof options.width === 'number') {
      out.width = options.width;
    } else if (width != null) {
      out.width = width;
    } else {
      out.width = 1;
    }
    return out;
  }
}
