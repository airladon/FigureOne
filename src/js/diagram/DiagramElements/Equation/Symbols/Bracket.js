// @flow
import {
  Transform, polarToRect,
} from '../../../../tools/g2';
import Symbol from './SymbolNew';
// import Bounds from '../Elements/Bounds';


export default class Bracket extends Symbol {
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
  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object, widthIn: number, heightIn: number) {
    const {
      side,
    } = options;
    let leftPoints;
    let rightPoints;
    let width;
    let height;
    if (side === 'left' || side === 'right') {
      [leftPoints, rightPoints, width, height] = this.getLeftPoints(
        options, widthIn, heightIn,
      );
    } else {
      [leftPoints, rightPoints, width, height] = this.getLeftPoints(
        options, heightIn, widthIn,
      );
    }

    // The points of the glyph are for side 'left' by default
    // Transform the glyph to the correct side and have it's lower left corner
    // at (0, 0) and be
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

  getLeftPoints(options: Object, widthIn: number, heightIn: number) {
    const {
      sides,
    } = options;
    const {     // $FlowFixMe
      lineWidth, width, tipWidth,
    } = this.getVerticalDefaultValues(heightIn, widthIn, options);

    // width of bracket without linewidth - essentially width of inner radius
    const wInnerRadius = (width - lineWidth);
    const innerRadius = (wInnerRadius ** 2 + (heightIn / 2) ** 2) / (2 * wInnerRadius);

    // top line width is half middle line width
    const wOuterRadius = (width - tipWidth);
    const outerRadius = (wOuterRadius ** 2 + (heightIn / 2) ** 2) / (2 * wOuterRadius);

    const angleInner = Math.asin(heightIn / 2 / innerRadius);
    const stepAngleInner = angleInner * 2 / sides;
    const angleOuter = Math.asin(heightIn / 2 / outerRadius);
    const stepAngleOuter = angleOuter * 2 / sides;

    const innerPoints = [];
    const outerPoints = [];

    for (let i = 0; i < sides + 1; i += 1) {
      innerPoints.push(polarToRect(
        innerRadius, angleInner - stepAngleInner * i + Math.PI,
      ).add(innerRadius + lineWidth, heightIn / 2));
      outerPoints.push(polarToRect(
        outerRadius, angleOuter - stepAngleOuter * i + Math.PI,
      ).add(outerRadius, heightIn / 2));
    }

    return [outerPoints, innerPoints, innerPoints[0].x, heightIn];
  }


  // Default values are values of width, height, lineWidth
  // Values that look good:
  // height          width         lineWidth
  //   2              0.2           0.04
  //   1              0.1           0.03
  //   0.5            0.05          0.015
  //   0.3            0.05          0.015
  //   0.2            0.03          0.012
  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(contentHeight: ?number, contentWidth: ?number, options: {
      lineWidth?: number,
      width?: number,
      tipWidth?: number,
    }) {
    let out = {};
    if (options.side === 'left' || options.side === 'right') {
      out = this.getVerticalDefaultValues(contentHeight, contentWidth, options);
      // $FlowFixMe
      out.height = contentHeight;
    } else {
      out = this.getVerticalDefaultValues(contentWidth, contentHeight, options);
      const { width } = out;
      out.width = contentWidth;
      // $FlowFixMe
      out.height = width;
    }
    return out;
  }

  getVerticalDefaultValues(contentHeight: number, contentWidth: ?number, options: {
      lineWidth?: number,
      width?: number,
      tipWidth?: number,
    }) {
    const out = {};
    if (contentWidth == null && options.width == null) {
      out.width = 97570.78 + (0.004958708 - 97570.78)
                  / (1 + (contentHeight / 2399858) ** 0.9383909);
    }
    if (contentWidth != null) {
      out.width = contentWidth;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    if (options.lineWidth == null) {
      out.lineWidth = 0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (contentHeight / 39.01413) ** 0.618041);
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

  // getBounds(
  //   options: Object,
  //   leftIn: number,
  //   bottomIn: number,
  //   widthIn: number,
  //   heightIn: number,
  //   side: 'left' | 'right' | 'bottom' | 'top' = 'left',
  // ) {
  //   const { width, height } = this.getDefaultValues(
  //     heightIn, widthIn, options,
  //   );
  //   const bounds = new Bounds();
  //   const glyphWidth = width;
  //   const glyphHeight = height;
  //   // if (options.draw === 'static') {
  //   //   const { staticWidth, staticHeight } = options;
  //   //   if (options.side === 'left' || options.side === 'right') {
  //   //     console.log(widthIn, heightIn, width, height, staticWidth, staticHeight);
  //   //     glyphWidth = height / staticHeight * width / height;
  //   //     // glyphWidth = staticWidth / staticHeight * height;
  //   //   } else {
  //   //     glyphHeight = staticHeight / staticWidth * width;
  //   //   }
  //   // }
  //   // console.log(glyphWidth, glyphHeight)
  //   if (side === 'left') {
  //     bounds.left = leftIn - glyphWidth;
  //     bounds.bottom = bottomIn;
  //     bounds.top = bounds.bottom + glyphHeight;
  //     bounds.right = bounds.left + glyphWidth;
  //   } else if (side === 'right') {
  //     bounds.left = leftIn;
  //     bounds.bottom = bottomIn;
  //     bounds.top = bounds.bottom + glyphHeight;
  //     bounds.right = bounds.left + glyphWidth;
  //   } else if (side === 'top') {
  //     bounds.bottom = bottomIn;
  //     bounds.top = bottomIn + glyphHeight;
  //     bounds.left = leftIn + widthIn / 2 - glyphWidth / 2;
  //     bounds.right = bounds.left + glyphWidth;
  //   } else {
  //     bounds.top = bottomIn;
  //     bounds.bottom = bottomIn - glyphHeight;
  //     bounds.left = leftIn + widthIn / 2 - glyphWidth / 2;
  //     bounds.right = bounds.left + glyphWidth;
  //   }
  //   bounds.width = glyphWidth;
  //   bounds.height = glyphHeight;
  //   bounds.ascent = glyphHeight;
  //   bounds.descent = 0;
  //   return bounds;
  // }
}
