// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bracket from './BracketNew';


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
      const { lineWidth, endLength } = options;
      const leftPoints = [
        new Point(lineWidth + endLength, 0),
        new Point(0, 0),
        new Point(0, height),
        new Point(lineWidth + endLength, height),
      ];
      const rightPoints = [
        new Point(lineWidth + endLength, lineWidth),
        new Point(lineWidth, lineWidth),
        new Point(lineWidth, height - lineWidth),
        new Point(lineWidth + endLength, height - lineWidth),
      ];
      return [leftPoints, rightPoints, lineWidth + endLength, height];
    };
  }
}
