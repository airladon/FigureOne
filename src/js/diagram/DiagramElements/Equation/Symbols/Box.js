// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point,
} from '../../../../tools/g2';
import Symbol from './Symbol';
// import WebGLInstance from '../../../webgl/webgl';


export default class Box extends Symbol {
  symbol: DiagramElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  //                                          width
  //                 |<--------------------------------------------------->|
  //                 |                                                     |
  //                 |                                                     |
  //                2                                                       4
  //         ------- 0000000000000000000000000000000000000000000000000000000
  //         A       0000000000000000000000000000000000000000000000000000000
  //         |       0000 3                                           5 0000
  //         |       0000                                               0000
  //         |       0000                                               0000
  //  height |       0000                                               0000
  //         |       0000                                               0000
  //         |       0000                                               0000
  //         |       0000                                               0000
  //         |       0000 1                                           7 0000
  //         |       0000000000000000000000000000000000000000000000000000000
  //         V______ 0000000000000000000000000000000000000000000000000000000
  //                0                                                        6

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    // eslint-disable-next-line no-unused-vars
    return (options: Object, widthIn: number, heightIn: number) => {
      const { fill } = options;
      const { lineWidth, width, height } = this.getDefaultValues(
        heightIn, widthIn, options,
      );
      let points;
      if (fill) {
        points = [
          new Point(0, 0),
          new Point(width, 0),
          new Point(0, height),
          new Point(width, height),
        ];
      } else {
        points = [
          new Point(0, 0),
          new Point(lineWidth, lineWidth),
          new Point(0, height),
          new Point(0, height - lineWidth),
          new Point(width, height),
          new Point(width - lineWidth, height - lineWidth),
          new Point(width, 0),
          new Point(width - lineWidth, lineWidth),
          new Point(0, 0),
          new Point(lineWidth, lineWidth),
        ];
      }
      return [points, width, height];
    };
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
    }) {
    const out = {};
    if (options.lineWidth != null) {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
    }
    if (options.height != null) {
      out.height = options.height;
    } else if (height != null) {
      out.height = height;
    } else {
      out.height = 1;
    }
    if (options.width != null) {
      out.width = options.width;
    } else if (width != null) {
      out.width = width;
    } else {
      out.width = 1;
    }
    return out;
  }
}
