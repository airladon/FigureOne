import {
  Point, Line,
} from '../../../tools/g2';
import { makePolyLine } from '../../geometries/lines/lines';
import Symbol from './SymbolNew';


export default class EquationLine extends Symbol {
  // constructor(
  //   webgl: Array<WebGLInstance>,
  //   color: TypeColor,
  //   transformOrLocation: Transform | Point,
  //   figureLimits: Rect,
  //   symbolOptions: Object,
  // ) {
  //   super(webgl, color, transformOrLocation, figureLimits, symbolOptions);
  //   // this.custom.setSize = (location: Point) => {

  //   // }
  // }
  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'STRIP';
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
  override getPoints(options: Record<string, any>, angle: number, length: number): [Array<Point>, number, number, 'STRIP' | 'TRIANGLES' | 'FAN'] {
    const line = new Line({ p1: [0, 0], length, angle });
    const [points] = makePolyLine(
      [new Point(0, 0), line.p2], options.width, false, 'mid', 'none', 0.1,
      1, 0, options.dash, false,
      2, [[]], 0, options.arrow,
    );

    return [points, angle, length, 'TRIANGLES'];
  }
}
