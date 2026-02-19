import {
  Point,
} from '../../../tools/g2';
import Bracket from './Bracket';


export default class Bar extends Bracket {
  override getLeftPoints(options: Record<string, any>, widthIn: number, height: number): [Array<Point>, Array<Point>, number, number] {
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

  override getVerticalDefaultValues(height: number, width: number | null | undefined, options: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
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
