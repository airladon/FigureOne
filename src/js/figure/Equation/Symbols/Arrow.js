
// @flow
import {
  Point, Transform,
} from '../../../tools/g2';
import Bracket from './Bracket';
import type { TypeColor } from '../../../tools/types';

export type TypeEquationSymbolArrowBracket = {
  symbol: 'arrow',
  direction?: 'down' | 'left' | 'up' | 'right',
  lineWidth?: number,
  arrowWidth?: number,
  arrowHeight?: number,
  draw?: 'static' | 'dynamic',
  color?: TypeColor;
  mods?: Object;
};

export default class Arrow extends Bracket {
  // eslint-disable-next-line class-methods-use-this

  //                      arrow width
  //                 |<--------------->|
  //                 |                 |
  //                 |        6        |
  //          -------|------- 0 -------|---------
  //          A      |      00000      |        A
  //   arrow  |      |     0000000     |        |
  //   height |      |   00000000000   |        |
  //          V      | 000000000000000 |        |
  //          ---- 5 0000000000000000000 4      |
  //                       0000000              |
  //                    3  0000000 2            |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |  height
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              |
  //                       0000000              V
  //                       0000000 --------------
  //                      1       0
  //                       |     |
  //                       |     |
  //                       |<--->|
  //                     Line Width

  // eslint-disable-next-line class-methods-use-this
  getLeftPoints(options: Object, widthIn: number, lengthIn: number) {
    const { direction } = options;
    let length = lengthIn;
    if (length == null) {
      length = options.length;
    }
    const {
      lineWidth, arrowWidth, arrowLength,
    } = this.getVerticalDefaultValues(length, widthIn, options);
    const p0 = new Point(arrowWidth / 2 + lineWidth / 2, 0);
    const p1 = new Point(arrowWidth / 2 - lineWidth / 2, 0);
    const p2 = new Point(p0.x, length - arrowLength);
    const p3 = new Point(p1.x, p2.y);
    const p4 = new Point(arrowWidth, p2.y);
    const p5 = new Point(0, p2.y);
    const p6 = new Point(arrowWidth / 2, length);

    let leftPoints = [
      p1._dup(),
      p3._dup(),
      p5._dup(),
      p6._dup(),
    ];
    let rightPoints = [
      p0._dup(),
      p2._dup(),
      p4._dup(),
      p6._dup(),
    ];
    if (direction === 'down' || direction === 'left') {
      const m = new Transform().scale(1, -1).translate(0, length).m();
      // $FlowFixMe
      leftPoints = leftPoints.map((p: Point) => p.transformBy(m));
      // $FlowFixMe
      rightPoints = rightPoints.map((p: Point) => p.transformBy(m));
    }
    // $FlowFixMe
    return [leftPoints, rightPoints, arrowWidth, length];
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getVerticalDefaultValues(length: number, width: ?number, options: {
      lineWidth?: number,
      arrowWidth?: number,
      arrowLength?: number,
      length?: number,
    }) {
    const out = {};
    if (options.lineWidth == null) {
      out.lineWidth = (0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (length / 39.01413) ** 0.618041)) * 0.8;
    } else {
      out.lineWidth = options.lineWidth;
    }
    if (options.arrowWidth == null) {
      out.arrowWidth = out.lineWidth * 3;
    } else {
      out.arrowWidth = options.arrowWidth;
    }
    if (options.arrowLength == null) {
      out.arrowLength = out.lineWidth * 3;
    } else {
      out.arrowLength = options.arrowLength;
    }
    out.width = out.arrowWidth;
    // $FlowFixMe
    return out;
  }
}
