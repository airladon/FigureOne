import {
  Point,
} from '../../../tools/g2';
import Symbol from './SymbolNew';


export default class Vinculum extends Symbol {
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
  override getPoints(options: Record<string, any>, widthIn: number, heightIn: number): [Array<Point>, number, number, 'STRIP' | 'TRIANGLES' | 'FAN'] {
    const { lineWidth, width, height } = this.getDefaultValues(
      heightIn, widthIn, options,
    );

    const points = [
      new Point(0, 0),
      new Point(0, lineWidth),
      new Point(width, 0),
      new Point(width, lineWidth),
    ];
    return [points, width, height, 'STRIP'];
  }

  override getDefaultValues(height: number, width: number | null | undefined, options: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
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
