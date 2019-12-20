// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class Bar extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getPoints() {
    return (options: Object, widthIn: number, height: number) => {
      // const { lineWidth } = options;
      const { side } = options;

      const { lineWidth, width } = this.getDefaultValues(height, widthIn, options);

      const leftPoints = [
        new Point(0, 0),
        new Point(0, height),
      ];
      const rightPoints = [
        new Point(lineWidth, 0),
        new Point(lineWidth, height),
      ];

      return this.getBracketPoints(leftPoints, rightPoints, side, width, height);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
      tipWidth?: number,
    }) {
    const out = {};
    if (options.lineWidth == null) {
      out.lineWidth = (0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (height / 39.01413) ** 0.618041)) * 0.8;
    } else {
      out.lineWidth = options.lineWidth;
    }
    out.width = out.lineWidth;
    return out;
  }
}
