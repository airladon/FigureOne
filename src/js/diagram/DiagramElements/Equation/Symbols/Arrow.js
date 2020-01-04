
// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import Bracket from './Bracket';


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
  getLeftPoints(options: Object, widthIn: number, height: number) {
    const { direction } = options;

    const {
      lineWidth, arrowWidth, arrowHeight,
    } = this.getVerticalDefaultValues(height, widthIn, options);

    const p0 = new Point(arrowWidth / 2 + lineWidth / 2, 0);
    const p1 = new Point(arrowWidth / 2 - lineWidth / 2, 0);
    const p2 = new Point(p0.x, height - arrowHeight);
    const p3 = new Point(p1.x, p2.y);
    const p4 = new Point(arrowWidth, p2.y);
    const p5 = new Point(0, p2.y);
    const p6 = new Point(arrowWidth / 2, height);

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
      const m = new Transform().scale(1, -1).translate(0, height).m();
      leftPoints = leftPoints.map(p => p.transformBy(m));
      rightPoints = rightPoints.map(p => p.transformBy(m));
    }
    // let side = 'left';
    // if (direction === 'up' || direction === 'down') {
    //   side = 'left';
    // } else if (direction === 'left' || direction === 'right') {
    //   side = 'top';
    // }
    // return [points, widthIn, height];
    return [leftPoints, rightPoints, arrowWidth, height];
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getVerticalDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
      arrowWidth?: number,
      arrowHeight?: number,
    }) {
    const out = {};
    if (options.lineWidth == null) {
      out.lineWidth = (0.2933614 + (0.0001418178 - 0.2933614)
                      / (1 + (height / 39.01413) ** 0.618041)) * 0.8;
    } else {
      out.lineWidth = options.lineWidth;
    }
    if (options.arrowWidth == null) {
      out.arrowWidth = out.lineWidth * 3;
    } else {
      out.arrowWidth = options.arrowWidth;
    }
    if (options.arrowHeight == null) {
      out.arrowHeight = out.lineWidth * 3;
    } else {
      out.arrowHeight = options.arrowHeight;
    }
    out.width = out.arrowWidth;
    return out;
  }
}
