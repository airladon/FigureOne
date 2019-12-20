
// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import Bracket from './Bracket';


export default class Arrow extends Bracket {
  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'triangles';
  // }

  //                                                        5 0
  //                                                          000
  //            1                                           3 00000
  //              000000000000000000000000000000000000000000000000000
  //              00000000000000000000000000000000000000000000000000000 6
  //              000000000000000000000000000000000000000000000000000
  //            0                                           2 00000
  //                                                          000
  //                                                        4 0

  //
  //                          6
  //                          0
  //                        00000
  //                       0000000
  //                     00000000000
  //                   000000000000000
  //               5 0000000000000000000 4
  //                       0000000
  //                    3  0000000  2
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                       0000000
  //                      1       0

  // eslint-disable-next-line class-methods-use-this
  getPoints() { // $FlowFixMe
    return (options: Object, widthIn: number, height: number) => {
      const { direction } = options;

      const {
        lineWidth, arrowWidth, arrowHeight, width,
      } = this.getDefaultValues(height, widthIn, options);
      // const p0 = new Point(0, (arrowWidth - lineWidth) / 2);
      // const p1 = new Point(0, p0.y + lineWidth);
      // const p2 = new Point(widthIn - arrowHeight, p0.y);
      // const p3 = new Point(widthIn - arrowHeight, p1.y);
      // const p4 = new Point(p2.x, 0);
      // const p5 = new Point(p2.x, arrowWidth);
      // const p6 = new Point(widthIn, arrowWidth / 2);

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
      let side = 'left';
      if (direction === 'up' || direction === 'down') {
        side = 'left';
      } else if (direction === 'left' || direction === 'right') {
        side = 'top';
      }
      // return [points, widthIn, height];
      return this.getBracketPoints(leftPoints, rightPoints, side, arrowWidth, height);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
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
      out.arrowWidth = options.arrowWidth
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
