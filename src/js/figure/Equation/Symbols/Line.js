// @flow
import { FigureElementPrimitive } from '../../Element';
import {
  Point, Line,
} from '../../../tools/g2';
import { makePolyLine } from '../../geometries/lines/lines';
import Symbol from './SymbolNew';
// import WebGLInstance from '../../../webgl/webgl';


export default class EquationLine extends Symbol {
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
  getPoints(options: Object, angle: number, length: number) {
    // const { lineWidth, width, height } = this.getDefaultValues(
    //   null, null, options,
    // );
    // const p1 = options.spacedLine.p1;
    // const p2 = options.spacedLine.p2;
    // console.log(angle, length)
    const line = new Line([0, 0], length, angle);
    // console.log(line)
    const [points] = makePolyLine(
      [new Point(0, 0), line.p2], options.width, false, 'mid', 'none', 0.1,
      1, 0, options.dash, false,
      2, [[]], 0, [[]], options.arrow,
    );

    // const points = [
    //   new Point(0, 0),
    //   new Point(0, lineWidth),
    //   new Point(width, 0),
    //   new Point(width, lineWidth),
    // ];
    return [points, angle, length, 'triangles'];
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  // getDefaultValues(height: number, width: ?number, options: {
  //     lineWidth?: number,
  //   }) {
  //   const out = {};
  //   if (options.lineWidth != null) {
  //     out.lineWidth = options.lineWidth;
  //   } else {
  //     out.lineWidth = 0.01;
  //   }
  //   out.height = out.lineWidth;
  //   if (width != null) {
  //     out.width = width;
  //   } else {
  //     out.width = 1;
  //   }
  //   return out;
  // }
}
