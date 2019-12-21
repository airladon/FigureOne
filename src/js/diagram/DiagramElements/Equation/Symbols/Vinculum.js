// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point,
} from '../../../../tools/g2';
import Symbol from './Symbol';
// import WebGLInstance from '../../../webgl/webgl';


export default class Bracket extends Symbol {
  symbol: DiagramElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  //                             width
  //          |<---------------------------------------->|
  //          |                                          |  3
  //        1 |                                          | ____
  //          00000000000000000000000000000000000000000000   A
  //          00000000000000000000000000000000000000000000   |  Line Width
  //          00000000000000000000000000000000000000000000 __V_
  //         0                                            2
  //

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    // eslint-disable-next-line no-unused-vars
    return (options: Object, widthIn: number, heightIn: number) => {
      const { lineWidth, width, height } = this.getDefaultValues(
        heightIn, widthIn, options,
      );

      const points = [
        new Point(0, 0),
        new Point(0, lineWidth),
        new Point(width, 0),
        new Point(width, lineWidth),
      ];
      return [points, width, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
    }) {
    const out = {};
    if (options.lineWidth != null) {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
    }
    out.height = out.lineWidth;
    if (width != null) {
      out.width = width;
    } else {
      out.width = 1;
    }
    return out;
  }
}
