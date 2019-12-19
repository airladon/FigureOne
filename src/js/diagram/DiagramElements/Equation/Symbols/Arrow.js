
// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import Symbol from './Symbol';


export default class Arrow extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  getTriangles() {
    return 'triangles';
  }

  //                                                        5 0
  //                                                          000
  //            1                                           3 00000
  //              000000000000000000000000000000000000000000000000000
  //              00000000000000000000000000000000000000000000000000000 6
  //              000000000000000000000000000000000000000000000000000
  //            0                                           2 00000
  //                                                          000
  //                                                        4 0


  // eslint-disable-next-line class-methods-use-this
  getPoints() { // $FlowFixMe
    return (options: Object, widthIn: number, height: number) => {
      const { lineWidth, arrowWidth, arrowHeight, direction } = options;

      const p0 = new Point(0, (arrowWidth - lineWidth) / 2);
      const p1 = new Point(0, p0.y + lineWidth);
      const p2 = new Point(widthIn - arrowHeight, p0.y);
      const p3 = new Point(widthIn - arrowHeight, p1.y);
      const p4 = new Point(p2.x, 0);
      const p5 = new Point(p2.x, arrowWidth);
      const p6 = new Point(widthIn, arrowWidth / 2);

      let points = [
        p0._dup(), p2._dup(), p1._dup(),
        p0._dup(), p3._dup(), p1._dup(),
        p4._dup(), p6._dup(), p5._dup(),
      ];

      if (direction === 'left') {
        const m = new Transform().scale(-1, 0).translate(widthIn, 0).m();
        points = points.map(p => p.transformBy(m));
      }
      return [points, widthIn, height];
    };
  }


  // eslint-disable-next-line class-methods-use-this
  getDefaultValues(height: number, width: ?number, options: {
      arrowWidth?: number,
    }) {
    const out: {
      width: number,
    } = {
      width: options.arrowWidth || 1,
    };
    if (width != null) {
      out.width = width;
    }
    return out;
  }
}
