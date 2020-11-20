// @flow
import { DiagramElementPrimitive } from '../../../Element';
import {
  Point, Line,
} from '../../../../tools/g2';
import Symbol from './SymbolNew';
import Bounds from '../Elements/Bounds';
// import WebGLInstance from '../../../webgl/webgl';


export default class Radical extends Symbol {
  symbol: DiagramElementPrimitive;

  // eslint-disable-next-line class-methods-use-this
  // getTriangles() {
  //   return 'strip';
  // }

  //   height                      left space                right space
  //   |                             >|--|<                    >|--|<
  //   |                              |  |                      |  |
  //   |                              |  |                      |  |
  //   |_____________________________ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX____V
  //   A                             X|  |                      |_______|
  //   |   startHeight              X |   CCCCCCCCCCCCCCCCCCCCCCC       A
  //   |   |                       X  |   CCCCCCCCCCCCCCCCCCCCCCC    top space
  //   |   |    tickHeight        X   |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   |    |                X    |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   |____V____           X     |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   A    |    X         X      |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   |    |__X |X       X       |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   |    A |  | X     X        |   CCCCCCCCCCCCCCCCCCCCCCC
  //   |   |      |  |  X   X         |   CCCCCCCCCCCCCCCCCCCCCCC   bottom space
  //   |   |      |  |   X X          |   CCCCCCCCCCCCCCCCCCCCCCC_______V
  //   V___V______|__|____X __________|_________________________________|
  //              |  |    |           |                                 A
  //              |  |    |           |
  //        tick >|--|<   |           |
  //       width  |  |    |           |
  //              |  |<-->|down width |
  //              |                   |
  //              |<------------------|
  //                     startWidth
  //
  //
  //
  //  First define bottom line (B), then offset the lines and find intercepts to
  //  get the top line (T)
  //         RRRRRRRRRRRRRRRR                  7                          9
  //         RRRRRRRRRRRRRRRR                    TTTTTTTTTTTTTTTTTTTTTTTTT
  //         RRRRRRRRRRRRRRRR                   T  BBBBBBBBBBBBBBBBBBBBBBB
  //         RRRRRRRRRRRRRRRR                  T  B 6                     8
  //         RRRRRRRRRRRRRRRR                 T  B
  //         RRRRRRRRRRRRRRRR                T  B
  //         RRRRRRRRRRRRRRRR               T  B
  //                        |              T  B
  //                        |             T  B
  //            3           |            T  B
  //            T           |           T  B
  //           T T          |          T  B
  //          T   T   lineWidth2      T  B\
  //         T     T       /|        T  B  \
  //        T  B    T    /  |       T  B    \
  //       T  B B    T /    |      T  B      lineWidth
  //    1 T  B 2 B    T     |     T  B
  //        B     B    T    |    T  B
  //        0      B    T   |   T  B
  //                B    T  |  T  B
  //                 B    T 5 T  B
  //                  B    T T  B
  //                   B    T  B
  //                    B     B
  //                     B   B
  //                      B B
  //                       B
  //                       4
  //
  // Root aligns with downWidth + tickWidth
  //


  // eslint-disable-next-line class-methods-use-this
  getPoints(options: Object, widthIn: number, heightIn: number) {
    // const { proportionalToHeight } = options;
    const {
      lineWidth, startWidth, tickWidth, tickHeight,
      downWidth, startHeight, lineWidth2, height, width,
    } = this.getDefaultValues(
      heightIn, widthIn, options,
    );

    const p0 = new Point(0, startHeight - tickHeight);
    const p2 = new Point(tickWidth, startHeight);
    const p4 = new Point(downWidth + tickWidth, 0);
    const p6 = new Point(startWidth, height - lineWidth);
    const p8 = new Point(width, height - lineWidth);

    const line02 = new Line(p0, p2);
    const line24 = new Line(p2, p4);
    const line46 = new Line(p4, p6);
    const line68 = new Line(p6, p8);

    const line02Offset = line02.offset('top', lineWidth);
    const line24Offset = line24.offset('top', lineWidth2);
    const line46Offset = line46.offset('top', lineWidth);
    const line68Offset = line68.offset('top', lineWidth);

    const p1 = line02Offset.p1._dup();
    const p3 = line02Offset.intersectsWith(line24Offset).intersect;
    const p5 = line24Offset.intersectsWith(line46Offset).intersect;
    const p7 = line46Offset.intersectsWith(line68Offset).intersect;
    const p9 = p8.add(0, lineWidth);

    const points = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9];

    return [points, widthIn, heightIn];
  }

  // Get Glyph bounds based on content
  /* eslint-disable class-methods-use-this */
  getBounds(
    options: {
      color?: TypeColor,
      lineWidth?: number,
      startHeight?: number,
      startWidth?: number,
      proportionalToHeight?: boolean,
      maxStartWidth?: ?number,
      maxStartHeight?: ?number,
      width?: number,             // contentWidth
      height?: number,            // contentHeight
      draw: 'static' | 'dynamic',
      staticHeight?: number | 'first',
      staticWidth?: number | 'first',
      lineWidth2?: number,
      tickWidth?: number,
      tickHeight?: number,
      downWidth?: number,
    },
    contentX: number,
    contentY: number,
    contentWidthIn: number,
    contentHeightIn: number,
  ) {    // $FlowFixMe
    const height = this.getHeightFromContentHeight(contentHeightIn, options);
    const {
      width, startWidth, lineWidth, startHeight, downWidth, tickWidth, lineWidth2,
    } = this.getDefaultValues(    // $FlowFixMe
      height, contentWidthIn, options,
    );
    const bounds = new Bounds();
    if (options.draw === 'static') {
      let { staticWidth, staticHeight } = options;
      if (staticWidth === 'first') {
        staticWidth = width + startWidth;
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
      const widthStartWidthRatio = startWidth / staticWidth;
      const heightStartHeightRatio = startHeight / staticHeight;
      bounds.width = width / (1 - widthStartWidthRatio);
      bounds.height = height / (1 - heightLineWidthRatio);
      const widthStartWidth = bounds.width * widthStartWidthRatio;
      const heightStartHeight = bounds.height * heightStartHeightRatio;
      const heightLineWidth = bounds.height * heightLineWidthRatio;
      bounds.left = contentX - widthStartWidth;
      bounds.right = bounds.left + bounds.width;
      bounds.bottom = contentY;
      bounds.top = bounds.bottom + bounds.height;
      bounds.ascent = bounds.height;
      bounds.descent = 0;
      // $FlowFixMe
      bounds.annotations = {
        root: {
          xPosition: 'left',
          yPosition: 'bottom',
          xAlign: 'right',
          yAlign: 'bottom',
          offset: new Point(widthStartWidth * 0.5, heightStartHeight + heightLineWidth * 2),
        },
      };
    } else {
      bounds.left = contentX + contentWidthIn / 2 - width / 2 - startWidth;
      bounds.bottom = contentY;
      bounds.width = width + startWidth;
      bounds.height = height;
      bounds.right = bounds.left + bounds.width;
      bounds.top = bounds.bottom + bounds.height;
      bounds.descent = 0;
      bounds.ascent = bounds.height;
      // $FlowFixMe
      bounds.annotations = {
        root: {
          xPosition: 'left',
          yPosition: 'bottom',
          xAlign: 'right',
          yAlign: 'bottom',
          offset: new Point(downWidth + tickWidth, startHeight + lineWidth2),
        },
      };
    }
    return bounds;
  }

  /* eslint-disable class-methods-use-this */
  getHeightFromContentHeight(contentHeightIn: number, options: {
    lineWidth?: number,
    contentHeight?: number,
  }): number {
    let lineWidth;
    let contentHeight;
    if (options.lineWidth != null && typeof options.lineWidth === 'number') {
      ({ lineWidth } = options);
    } else {
      lineWidth = 0.01;
    }

    if (contentHeightIn != null) {
      contentHeight = contentHeightIn;
    } else {
      contentHeight = 1;
    }
    return contentHeight + lineWidth;
  }

  /* eslint-disable class-methods-use-this */
  // $FlowFixMe
  getDefaultValues(
    height: ?number,
    width: ?number,
    options: {
      lineWidth?: number,
      height?: number,
      width?: number,
      lineWidth?: number,
      lineWidth2?: number,
      startWidth?: number,
      startHeight?: number,
      tickHeight?: number,
      tickWidth?: number,
      downWidth?: number,
      maxStartWidth?: number,
      maxStartHeight?: number,
      proportionalToHeight?: boolean,
      downWidth?: number,
    },
  ): {
      height: number,
      width: number,
      lineWidth: number,
      lineWidth2: number,
      startWidth: number,
      startHeight: number,
      tickHeight: number,
      tickWidth: number,
      downWidth: number,
    } {
    const out = {};
    if (options.lineWidth != null && typeof options.lineWidth === 'number') {
      out.lineWidth = options.lineWidth;
    } else {
      out.lineWidth = 0.01;
    }
    if (options.lineWidth2 != null && typeof options.lineWidth2 === 'number') {
      out.lineWidth2 = options.lineWidth2;
    } else {
      out.lineWidth2 = out.lineWidth * 2;
    }

    if (options.height != null && typeof options.height === 'number') {
      out.height = options.height;
    } else if (height != null) {
      out.height = height;
    } else {
      out.height = 1;
    }

    if (options.startHeight != null && typeof options.startHeight === 'number') {
      out.startHeight = options.startHeight;
      if (options.proportionalToHeight) {   // $FlowFixMe
        out.startHeight = options.startHeight * out.height;
      }
    } else {
      out.startHeight = out.height / 3;
    }
    if (options.maxStartHeight != null && options.maxStartHeight < out.startHeight) {
      out.startHeight = options.maxStartHeight;
    }

    if (options.tickHeight != null && typeof options.tickHeight === 'number') {
      out.tickHeight = options.tickHeight;
      if (options.proportionalToHeight) {   // $FlowFixMe
        out.tickHeight = options.tickHeight * out.startHeight;
      }
    } else {
      out.tickHeight = out.startHeight * 0.1;
    }

    if (options.startWidth != null && typeof options.startWidth === 'number') {
      out.startWidth = options.startWidth;
      if (options.proportionalToHeight) {   // $FlowFixMe
        out.startWidth = options.startWidth * out.height;
      }
    } else {
      out.startWidth = out.startHeight / 2;
    }
    if (options.maxStartWidth != null && options.maxStartWidth < out.startWidth) {
      out.startWidth = options.maxStartWidth;
    }

    if (options.tickWidth != null && typeof options.tickWidth === 'number') {
      out.tickWidth = options.tickWidth;
      if (options.proportionalToHeight) {   // $FlowFixMe
        out.tickWidth = options.tickWidth * out.startWidth;
      }
    } else {
      out.tickWidth = out.startWidth / 5;
    }

    if (options.downWidth != null && typeof options.downWidth === 'number') {
      out.downWidth = options.downWidth;
      if (options.proportionalToHeight) {   // $FlowFixMe
        out.downWidth = options.downWidth * out.startWidth;
      }
    } else {
      out.downWidth = out.startWidth / 5 * 2;
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
