// @flow
import {
  Point, polarToRect,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class SquareBracket extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { width } = options;
      if (type === 'static') {
        return height * width;
      }
      return width;
    };
  }

  //                            width
  //                  |<--------------------->|
  //
  //            ___   ._______________________    ____
  //           A      |                       |      A
  //           |      |                       |      | line end width
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
    return (options: Object, height: number) => {
      const {
        lineWidth, width, endLineWidth, radius, sides,
      } = options;

      if (radius === 0) {
        const outsidePoints = [
          new Point(width, 0),
          new Point(0, 0),
          new Point(0, height),
          new Point(width, height),
        ];
        const insidePoints = [
          new Point(width, endLineWidth),
          new Point(lineWidth, endLineWidth),
          new Point(lineWidth, height - endLineWidth),
          new Point(width, height - endLineWidth),
        ];
        return [outsidePoints, insidePoints, width, height];
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
      return [outsidePoints, insidePoints, width, height];
    };
  }
}
