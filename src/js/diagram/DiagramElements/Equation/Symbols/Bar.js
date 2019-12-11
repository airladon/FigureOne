// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class Bar extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getWidth() {
    return (type: 'static' | 'dynamic', options: Object, height: number) => {
      const { lineWidth } = options;
      if (type === 'static') {
        return height * lineWidth;
      }
      return lineWidth;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, height: number) => {
      const { lineWidth } = options;

      const leftPoints = [
        new Point(0, 0),
        new Point(0, height),
      ];
      const rightPoints = [
        new Point(lineWidth, 0),
        new Point(lineWidth, height),
      ];
      return [leftPoints, rightPoints, lineWidth, height];
    }
  }
}
