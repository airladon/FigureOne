
// @flow
import {
  Point,
} from '../../../../tools/g2';
import Symbol from './Symbol';


export default class SimpleIntegral extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'strip';
  }

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
    return (options: Object, width: number, height: number) => {
      const { lineWidth } = options;

      const points = [
        new Point(0, 0),
        new Point(lineWidth, 0),
        new Point(0, height),
        new Point(lineWidth, height),
      ];
      return [points, lineWidth, height];
    };
  }
}
