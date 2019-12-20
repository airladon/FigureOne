// @flow
import {
  Point, polarToRect,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class SquareBracket extends Bracket {
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

  //                            width
  //                  |<--------------------->|
  //
  //            ___   ._______________________    ____
  //           A      |                       |      A
  //           |      |                       |      | tipWidth
  //           |      |      .________________|   ___V
  //           |      |      |
  //           |      |      |
  //           |      |      |
  //           |      |      |
  //  height   |      |      |
  //           |      |      |
  //           |      |      |
  //           |      |      |
  //           |      |      |
  //           |      |      |________________
  //           |      |                       |
  //           |      |                       |
  //           V___   |_______________________|
  //
  //                  |      |
  //                  |      |
  //                  |<---->|
  //                 line width
  //
  // If radius is defined, then lineEndWidth = lineWidth
  //
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, widthIn: number, height: number) => {
      // const {
      //   lineWidth, width, endLineWidth, radius, sides,
      // } = options;

      const {
        sides, side, radius,
      } = options;

      const { lineWidth, width, tipWidth } = this.getDefaultValues(height, widthIn, options);

      if (radius === 0) {
        const outsidePoints = [
          new Point(width, 0),
          new Point(0, 0),
          new Point(0, height),
          new Point(width, height),
        ];
        const insidePoints = [
          new Point(width, tipWidth),
          new Point(lineWidth, tipWidth),
          new Point(lineWidth, height - tipWidth),
          new Point(width, height - tipWidth),
        ];
        return this.getBracketPoints(outsidePoints, insidePoints, side, width, height);
      }

      const radiusToUse = Math.min(radius, width, height / 2);
      const rOutside = radiusToUse;
      const rInside = radiusToUse - lineWidth;

      const outsidePoints = [new Point(width, 0)];
      const insidePoints = [new Point(width, lineWidth)];

      const lowCenter = new Point(rOutside, rOutside);
      const highCenter = new Point(rOutside, height - rOutside);

      for (let i = 0; i <= sides; i += 1) {
        const angle = Math.PI / 2 / sides * i;
        outsidePoints.push(polarToRect(rOutside, Math.PI / 2 * 3 - angle).add(lowCenter));
        insidePoints.push(polarToRect(rInside, Math.PI / 2 * 3 - angle).add(lowCenter));
      }

      for (let i = 0; i <= sides; i += 1) {
        const angle = Math.PI / 2 / sides * i;
        outsidePoints.push(polarToRect(rOutside, Math.PI - angle).add(highCenter));
        insidePoints.push(polarToRect(rInside, Math.PI - angle).add(highCenter));
      }

      outsidePoints.push(new Point(width, height));
      insidePoints.push(new Point(width, height - lineWidth));
      return this.getBracketPoints(outsidePoints, insidePoints, side, width, height);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
      tipWidth?: number,
    }) {
    const out = {};
    if (width == null && options.width == null) {
      out.width = (97570.78 + (0.004958708 - 97570.78)
                  / (1 + (height / 2399858) ** 0.9383909)) * 0.8;
    }
    if (width != null) {
      out.width = width;
    }
    if (options.width != null) {
      out.width = options.width;
    }
    if (options.lineWidth == null) {
      out.lineWidth = (0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (height / 39.01413) ** 0.618041)) * 0.8;
    } else {
      out.lineWidth = options.lineWidth;
    }

    if (options.tipWidth == null) {
      out.tipWidth = out.lineWidth * 0.7;
    } else {
      out.tipWidth = options.tipWidth;
    }
    return out;
  }
}
