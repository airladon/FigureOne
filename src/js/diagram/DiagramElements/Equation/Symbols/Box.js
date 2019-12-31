// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point,
} from '../../../../tools/g2';
import Symbol from './Symbol';
import Bounds from '../Elements/Bounds';
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
          new Point(lineWidth, height - lineWidth),
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
  getBounds() {
    // eslint-disable-next-line max-len
    return (options: { lineWidth?: number, staticWidth?: number, staticHeight?: number, draw: 'dynamic' | 'static' }, leftIn: number, bottomIn: number, widthIn: number, heightIn: number) => {
      const { lineWidth, width, height } = this.getDefaultValues(
        heightIn, widthIn, options,
      );
      const bounds = new Bounds();
      if (options.draw === 'static') {
        let { staticWidth, staticHeight } = options;
        if (staticWidth === 'first') {
          staticWidth = width + lineWidth * 2;
        }
        if (staticHeight === 'first') {
          staticHeight = height + lineWidth * 2;
        }
        if (staticWidth == null) {
          staticWidth = 1;
        }
        if (staticHeight == null) {
          staticHeight = 1;
        }
        const heightLineWidthRatio = lineWidth / staticHeight;
        const widthLineWidthRatio = lineWidth / staticWidth;
        bounds.width = width / (1 - 2 * widthLineWidthRatio);
        bounds.height = height / (1 - 2 * heightLineWidthRatio);
        const widthLineWidth = bounds.width * widthLineWidthRatio;
        const heightLineWidth = bounds.height * heightLineWidthRatio;
        bounds.left = leftIn - widthLineWidth;
        bounds.right = bounds.left + bounds.width;
        bounds.bottom = bottomIn - heightLineWidth;
        bounds.top = bounds.bottom + bounds.height;
        bounds.ascent = bounds.height;
        bounds.descent = 0;
      } else {
        bounds.left = leftIn - lineWidth;
        bounds.bottom = bottomIn - lineWidth;
        bounds.width = width + lineWidth * 2;
        bounds.height = height + lineWidth * 2;
        bounds.right = bounds.left + bounds.right;
        bounds.top = bounds.bottom + bounds.height;
        bounds.descent = 0;
        bounds.ascent = bounds.height;
      }
      return bounds;
    };
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
    }): {
      height: number,
      width: number,
      lineWidth: number,
    } {
    const out = {};
    if (options.lineWidth != null && typeof options.lineWidth === 'number') {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
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
