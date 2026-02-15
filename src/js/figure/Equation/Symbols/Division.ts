import {
  Point,
} from '../../../tools/g2';
import Symbol from './SymbolNew';
import Bounds from '../Elements/Bounds';

export default class Division extends Symbol {
  //                            left space                right space
  //              bend width |<->|<---->|                     >|--|<
  //                         |   |      |                      |  |
  //                         |   |      |                      |  |
  //                 ------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX____V
  //                 A        X  |      |                      |_______|
  //                 |         X |       CCCCCCCCCCCCCCCCCCCCCCC       A
  //                 |          X        CCCCCCCCCCCCCCCCCCCCCCC    top space
  //                 |           X       CCCCCCCCCCCCCCCCCCCCCCC
  //          height |           X       CCCCCCCCCCCCCCCCCCCCCCC
  //                 |           X       CCCCCCCCCCCCCCCCCCCCCCC
  //                 |           X       CCCCCCCCCCCCCCCCCCCCCCC
  //                 |          X        CCCCCCCCCCCCCCCCCCCCCCC
  //                 |         X         CCCCCCCCCCCCCCCCCCCCCCC
  //                 |        X          CCCCCCCCCCCCCCCCCCCCCCC   bottom space
  //                 V       X           CCCCCCCCCCCCCCCCCCCCCCC_______V
  //                 ------ X _________________________________________|
  //                        |                                          A
  //                        |                                          |
  //                        |                  width                   |
  //                        |<----------------------------------------->
  //

  // eslint-disable-next-line class-methods-use-this
  override getPoints(options: Record<string, any>, widthIn: number, heightIn: number): [Array<Point>, number, number, 'STRIP' | 'TRIANGLES' | 'FAN'] {
    const {
      lineWidth, width, height, bendWidth, sides,
    } = this.getDefaultValues(
      heightIn, widthIn, options,
    );
    let points: Array<Point> = [];
    if (bendWidth === 0) {
      points = [
        new Point(0, 0),
        new Point(lineWidth, 0),
        new Point(0, height),
        new Point(lineWidth, height - lineWidth),
        new Point(width, height),
        new Point(width, height - lineWidth),
      ];
    } else {
      const h = bendWidth;
      const w = height;
      const r = h / 2 + w ** 2 / (8 * h);
      const r1 = r + lineWidth;
      const theta1 = Math.asin((height / 2) / r1) * 2;
      const theta2 = Math.asin((height / 2 - lineWidth) / r1);
      const c = new Point(-r + bendWidth, height / 2);
      const deltaTheta1 = theta1 / (sides - 1);
      for (let i = 0; i < sides; i += 1) {
        const t1 = -theta1 / 2 + i * deltaTheta1;
        points.push(new Point(r * Math.cos(t1) + c.x, r * Math.sin(t1) + c.y));
        if (i < sides - 1) {
          points.push(new Point(r1 * Math.cos(t1) + c.x, r1 * Math.sin(t1) + c.y));
        } else {
          points.push(new Point(r1 * Math.cos(theta2) + c.x, r1 * Math.sin(theta2) + c.y));
        }
      }
      points.push(new Point(r1 * Math.cos(theta1 / 2) + c.x, r1 * Math.sin(theta1 / 2) + c.y));
      points.push(points[points.length - 2]._dup());
      points.push(new Point(width + bendWidth, height));
      points.push(new Point(width + bendWidth, height - lineWidth));
    }
    return [points, width, height, 'STRIP'];
  }

  override getBounds(
    options: Record<string, any>,
    leftIn: number,
    bottomIn: number,
    widthIn: number,
    heightIn: number,
  ) {
    const {
      lineWidth, width, height, bendWidth,
    } = this.getDefaultValues(
      heightIn, widthIn, options,
    );
    const bounds = new Bounds();
    if (options.draw === 'static') {
      let { staticWidth, staticHeight } = options;
      if (staticWidth === 'first') {
        staticWidth = width + lineWidth;
      }
      if (staticHeight === 'first') {
        staticHeight = height + lineWidth;
      }
      if (staticWidth == null) {
        staticWidth = 1;
      }
      if (staticHeight == null) {
        staticHeight = 1;
      }
      const heightLineWidthRatio = lineWidth / staticHeight;
      const widthLineWidthRatio = lineWidth / staticWidth;
      bounds.width = width / (1 - 2 * widthLineWidthRatio);
      bounds.height = height / (1 - 2 * heightLineWidthRatio);
      const widthLineWidth = bounds.width * widthLineWidthRatio;
      const heightLineWidth = bounds.height * heightLineWidthRatio;
      bounds.left = leftIn - widthLineWidth;
      bounds.right = bounds.left + bounds.width;
      bounds.bottom = bottomIn - heightLineWidth;
      bounds.top = bounds.bottom + bounds.height;
      bounds.ascent = bounds.height;
      bounds.descent = 0;
    } else {
      bounds.left = leftIn + widthIn / 2 - width / 2 - lineWidth - bendWidth;
      bounds.bottom = bottomIn + heightIn / 2 - height / 2 - lineWidth;
      bounds.width = width + lineWidth * 2;
      bounds.height = height + lineWidth * 2;
      bounds.right = bounds.left + bounds.width;
      bounds.top = bounds.bottom + bounds.height;
      bounds.descent = 0;
      bounds.ascent = bounds.height;
    }
    return bounds;
  }

  override getDefaultValues(height: number, width: number, options: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    if (options.lineWidth != null && typeof options.lineWidth === 'number') {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
    }

    if (options.bendWidth == null) {
      out.bendWidth = 0;
    } else {
      out.bendWidth = options.bendWidth;
    }
    if (options.sides == null) {
      out.sides = 10;
    } else {
      out.sides = options.sides;
    }

    if (options.height != null && typeof options.height === 'number') {
      out.height = options.height;
    } else if (height != null) {
      out.height = height;
    } else {
      out.height = 1;
    }
    if (options.width != null && typeof options.width === 'number') {
      out.width = options.width;
    } else if (width != null) {
      out.width = width;
    } else {
      out.width = 1;
    }
    return out;
  }
}
