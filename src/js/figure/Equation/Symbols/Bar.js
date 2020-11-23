// @flow
import {
  Point,
} from '../../../tools/g2';
import Bracket from './Bracket';


export default class Bar extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  getLeftPoints(options: Object, widthIn: number, height: number) {
    const { lineWidth, width } = this.getVerticalDefaultValues(height, widthIn, options);

    const leftPoints = [
      new Point(0, 0),
      new Point(0, height),
    ];
    const rightPoints = [
      new Point(lineWidth, 0),
      new Point(lineWidth, height),
    ];

    return [leftPoints, rightPoints, width, height];
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getVerticalDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      width?: number,
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
