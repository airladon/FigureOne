// @flow
import {
  Point, polarToRect,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class SquareBracket extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { lineWidth, endLength } = options;
      if (type === 'static') {
        return height * (lineWidth + endLength);
      }
      return lineWidth + endLength;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const {
        lineWidth, endLength, radius, sides,
      } = options;

      if (radius === 0) {
        const outsidePoints = [
          new Point(lineWidth + endLength, 0),
          new Point(0, 0),
          new Point(0, height),
          new Point(lineWidth + endLength, height),
        ];
        const insidePoints = [
          new Point(lineWidth + endLength, lineWidth),
          new Point(lineWidth, lineWidth),
          new Point(lineWidth, height - lineWidth),
          new Point(lineWidth + endLength, height - lineWidth),
        ];
        return [outsidePoints, insidePoints, lineWidth + endLength, height];
      }

      const radiusToUse = Math.min(radius, endLength + lineWidth, height / 2);
      const rOutside = radiusToUse;
      const rInside = radiusToUse - lineWidth;

      const outsidePoints = [new Point(lineWidth + endLength, 0)];
      const insidePoints = [new Point(lineWidth + endLength, lineWidth)];

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

      outsidePoints.push(new Point(lineWidth + endLength, height));
      insidePoints.push(new Point(lineWidth + endLength, height - lineWidth));
      return [outsidePoints, insidePoints, lineWidth + endLength, height];
    };
  }
}
