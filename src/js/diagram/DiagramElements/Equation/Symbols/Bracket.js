// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Transform, polarToRect,
} from '../../../../tools/g2';
import Symbol from './Symbol';
// import WebGLInstance from '../../../webgl/webgl';


export default class Bracket extends Symbol {
  symbol: DiagramElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

  // eslint-disable-next-line class-methods-use-this
  getBracketPoints(
    leftPoints: Array<Point>,
    rightPoints: Array<Point>,
    side: 'left' | 'right' | 'top' | 'bottom',
    width: number,
    height: number,
  ) {
    let t;
    if (side === 'right') {
      t = new Transform().scale(-1, 1).translate(width, 0);
    } else if (side === 'top') {
      t = new Transform()
        .translate(0, -height / 2)
        .rotate(-Math.PI / 2)
        .translate(height / 2, width);
    } else if (side === 'bottom') {
      t = new Transform()
        .translate(0, -height / 2)
        .rotate(Math.PI / 2)
        .translate(height / 2, 0);
    } else {
      t = new Transform();
    }
    const newPointsLeft = leftPoints.map(p => p.transformBy(t.m()));
    const newPointsRight = rightPoints.map(p => p.transformBy(t.m()));
    const points = [];
    newPointsLeft.forEach((r1p, index) => {
      const r2p = newPointsRight[index];
      points.push(r1p);
      points.push(r2p);
    });
    if (side === 'top' || side === 'bottom') {
      return [points, height, width];
    }
    return [points, width, height];
  }

  // eslint-disable-next-line class-methods-use-this
  // getWidth() {
  //   return (type: 'static' | 'dynamic', options: Object, height: number) => {
  //     const { width } = options;
  //     if (type === 'static') {
  //       return height * width;
  //     }
  //     return width;
  //   };
  // }

  // This is the same math as for Brace, but the outside radius is only a
  // portion of a half circle

  //                             * *
  //                          *  *
  //                        *   *
  //                      *    *
  //                     *    *
  //                     *    *
  //                    *    *
  //                    *    *
  //                    *    *
  //                     *    *
  //                     *    *
  //                      *    *
  //                        *   *
  //                          *  *
  //                            * *
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //                                     0000000
  //                                0000       |
  //                            000         0000
  //                         00          000
  //                       0           00
  //                      00         000
  //                    0           0
  //                   00         00
  //                 00          0
  //                 0           0
  //                 0           0
  //                 0           0
  //
  //
  //
  //
  //
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    // eslint-disable-next-line no-unused-vars
    return (options: Object, widthIn: number, height: number) => {
      const {
        sides, side,
      } = options;
      const { lineWidth, width, tipWidth } = this.getDefaultValues(height, widthIn, options);
      // width of bracket without linewidth - essentially width of inner radius
      const wInnerRadius = (width - lineWidth);
      const innerRadius = (wInnerRadius ** 2 + (height / 2) ** 2) / (2 * wInnerRadius);

      // top line width is half middle line width
      const wOuterRadius = (width - tipWidth);
      const outerRadius = (wOuterRadius ** 2 + (height / 2) ** 2) / (2 * wOuterRadius);

      const angleInner = Math.asin(height / 2 / innerRadius);
      const stepAngleInner = angleInner * 2 / sides;
      const angleOuter = Math.asin(height / 2 / outerRadius);
      const stepAngleOuter = angleOuter * 2 / sides;

      const innerPoints = [];
      const outerPoints = [];

      for (let i = 0; i < sides + 1; i += 1) {
        innerPoints.push(polarToRect(
          innerRadius, angleInner - stepAngleInner * i + Math.PI,
        ).add(innerRadius + lineWidth, height / 2));
        outerPoints.push(polarToRect(
          outerRadius, angleOuter - stepAngleOuter * i + Math.PI,
        ).add(outerRadius, height / 2));
      }

      // if (side === 'top' || side === 'bottom') {
      //   return this.getBracketPoints(outerPoints, innerPoints, side, height, innerPoints[0].x);
      // }
      return this.getBracketPoints(outerPoints, innerPoints, side, innerPoints[0].x, height);
    };
  }

  // Values that look good:
  // height          width         lineWidth
  //   2              0.2           0.04
  //   1              0.1           0.03
  //   0.5            0.05          0.015
  //   0.3            0.05          0.015
  //   0.2            0.03          0.012
  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
      tipWidth?: number,
    }) {
    const out = {};
    if (width == null && options.width == null) {
      out.width = 97570.78 + (0.004958708 - 97570.78)
                  / (1 + (height / 2399858) ** 0.9383909);
    }
    if (width != null) {
      out.width = width;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    if (options.lineWidth == null) {
      out.lineWidth = 0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (height / 39.01413) ** 0.618041);
    } else {
      out.lineWidth = options.lineWidth;
    }

    if (options.tipWidth == null) {
      out.tipWidth = out.lineWidth / 3;
    } else {
      out.tipWidth = options.tipWidth;
    }
    return out;
  }
}
