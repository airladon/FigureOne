// @flow
import { FigureElementPrimitive } from '../../Element';
import {
  Point,
} from '../../../tools/g2';
import { makePolyLine } from '../../geometries/lines/lines';
import Symbol from './SymbolNew';
// import WebGLInstance from '../../../webgl/webgl';


export default class Bracket extends Symbol {
  symbol: FigureElementPrimitive;

  // constructor(
  //   webgl: Array<WebGLInstance>,
  //   color: TypeColor,
  //   transformOrLocation: Transform | Point,
  //   figureLimits: Rect,
  //   symbolOptions: Object,
  //   // triangles: 'strip' | 'triangles' | 'fan',
  // ) {
  //   super(webgl, color, transformOrLocation, figureLimits, symbolOptions);
  //   // this.custom.setSize = (location: Point) => {

  //   // }
  // }
  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'strip';
  // }

  //                             width
  //          |<---------------------------------------->|
  //          |                                          |  3
  //        1 |                                          | ____
  //          00000000000000000000000000000000000000000000   A
  //          00000000000000000000000000000000000000000000   |  Line Width
  //          00000000000000000000000000000000000000000000 __V_
  //         0                                            2
  //

  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object) {
    const { lineWidth, width, height } = this.getDefaultValues(
      null, null, options,
    );
    const p1 = options.spacedLine.p1;
    const p2 = options.spacedLine.p2;
    const [points] = makePolyLine(
      [p1, p2], options.width, false, 'mid', 'none', 0.1,
      1, 0, options.dash, false,
      2, [[]], [[]], [[]], options.arrow,
    );

    // const points = [
    //   new Point(0, 0),
    //   new Point(0, lineWidth),
    //   new Point(width, 0),
    //   new Point(width, lineWidth),
    // ];
    return [points, width, height, 'triangles'];
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(height: number, width: ?number, options: {
      lineWidth?: number,
    }) {
    const out = {};
    if (options.lineWidth != null) {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
    }
    out.height = out.lineWidth;
    if (width != null) {
      out.width = width;
    } else {
      out.width = 1;
    }
    return out;
  }
}
