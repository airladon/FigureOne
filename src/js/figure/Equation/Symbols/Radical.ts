import {
  Point, Line,
} from '../../../tools/g2';
import Symbol from './SymbolNew';
import Bounds from '../Elements/Bounds';

export default class Radical extends Symbol {
  // eslint-disable-next-line class-methods-use-this
  override getPoints(options: Record<string, any>, widthIn: number, heightIn: number): [Array<Point>, number, number, 'STRIP' | 'TRIANGLES' | 'FAN'] {
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
    const p3 = line02Offset.intersectsWith(line24Offset).intersect!;
    const p5 = line24Offset.intersectsWith(line46Offset).intersect!;
    const p7 = line46Offset.intersectsWith(line68Offset).intersect!;
    const p9 = p8.add(0, lineWidth);

    const points = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9];

    return [points, widthIn, heightIn, 'STRIP'];
  }

  override getBounds(
    options: Record<string, any>,
    contentX: number,
    contentY: number,
    contentWidthIn: number,
    contentHeightIn: number,
  ) {
    const height = this.getHeightFromContentHeight(contentHeightIn, options);
    const {
      width, startWidth, lineWidth, startHeight, downWidth, tickWidth, lineWidth2,
    } = this.getDefaultValues(
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
      (bounds as any).annotations = {
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
      (bounds as any).annotations = {
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

  getHeightFromContentHeight(contentHeightIn: number, options: Record<string, any>): number {
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

  override getDefaultValues(
    height: number | null | undefined,
    width: number | null | undefined,
    options: Record<string, any>,
  ): Record<string, any> {
    const out: Record<string, any> = {};
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
      if (options.proportionalToHeight) {
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
      if (options.proportionalToHeight) {
        out.tickHeight = options.tickHeight * out.startHeight;
      }
    } else {
      out.tickHeight = out.startHeight * 0.1;
    }

    if (options.startWidth != null && typeof options.startWidth === 'number') {
      out.startWidth = options.startWidth;
      if (options.proportionalToHeight) {
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
      if (options.proportionalToHeight) {
        out.tickWidth = options.tickWidth * out.startWidth;
      }
    } else {
      out.tickWidth = out.startWidth / 5;
    }

    if (options.downWidth != null && typeof options.downWidth === 'number') {
      out.downWidth = options.downWidth;
      if (options.proportionalToHeight) {
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
