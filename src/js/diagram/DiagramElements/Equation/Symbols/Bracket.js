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
  // constructor(
  //   webgl: Array<WebGLInstance>,
  //   color: Array<number>,
  //   transformOrLocation: Transform | Point,
  //   diagramLimits: Rect,
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   staticSize: ?boolean,
  //   symbolOptions: Object,
  // ) {
  //   const getPoints = this.getPoints();
  //   const getWidth = this.getWidth();
  //   const vertexObject = new VertexBracket(webgl, side);
  //   const [leftPoints, rightPoints, width, height] = getPoints(symbolOptions, 1);
  //   vertexObject.updatePoints(leftPoints, rightPoints, width, height);
  //   let initialT;
  //   if (transformOrLocation instanceof Transform) {
  //     initialT = transformOrLocation;
  //   } else {
  //     initialT = new Transform('Bracket').scale(1, 1).translate(0, 0);
  //   }
  //   const symbol = new DiagramElementPrimitive(
  //     vertexObject, initialT, color, diagramLimits,
  //   );
  //   symbol.custom.options = symbolOptions;
  //   symbol.custom.getWidth = getWidth;

  //   if (staticSize) {
  //     symbol.custom.type = 'static';
  //   } else {
  //     symbol.custom.scale = new Point(1, 1);
  //     symbol.internalSetTransformCallback = () => {
  //       const s = symbol.getScale();
  //       if (symbol.custom.scale.isNotEqualTo(s, 8)) {
  //         const [
  //           leftPointsNew, rightPointsNew, widthNew, heightNew,
  //         ] = getPoints(symbol.custom.options, s.y);
  //         symbol.drawingObject.updatePoints(
  //           leftPointsNew,
  //           rightPointsNew,
  //           widthNew,
  //           heightNew,
  //         );
  //         symbol.custom.scale = s;
  //       }
  //     };
  //     symbol.getTransform = () => {
  //       const t = symbol.transform._dup();
  //       t.updateScale(1, 1);
  //       return t;
  //     };
  //     symbol.custom.type = 'dynamic';
  //   }

  //   // eslint-disable-next-line max-len
  //   symbol.custom.setSize = (location: Point, heightIn: number) => {
  //     const t = symbol.transform._dup();
  //     t.updateScale(heightIn, heightIn);
  //     t.updateTranslation(location.x, location.y);
  //     symbol.setTransform(t);
  //   };
  //   this.symbol = symbol;
  // }

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
        sides, tipWidth, side,
      } = options;
      const { lineWidth, width } = this.getDefaultValues(height, widthIn, options);
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

      return this.getBracketPoints(outerPoints, innerPoints, side, innerPoints[0].x, height);
      // return [outerPoints, innerPoints, innerPoints[0].x, height];
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
    }) {
    const out = {
      lineWidth: 0.01,
      width: 0.03,
    };
    if (options.lineWidth != null) {
      out.lineWidth = options.lineWidth;
      out.width = options.lineWidth * 3;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    return out;
  }
}
