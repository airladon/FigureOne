// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class Box extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentLoc = loc._dup();
    const glyphLoc = loc._dup();
    const [glyph] = this.glyphs;
    const [mainContent] = this.contents;
    const {
      inSize, space, topSpace,
      rightSpace, bottomSpace, leftSpace,
    } = this.options;
    const contentBounds = new Bounds();
    const fullContentBounds = new Bounds();

    // const { mainContent } = this;
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent);
    }

    let leftSpaceToUse = space;
    let rightSpaceToUse = space;
    let topSpaceToUse = space;
    let bottomSpaceToUse = space;
    if (leftSpace != null) {
      leftSpaceToUse = leftSpace;
    }
    if (topSpace != null) {
      topSpaceToUse = topSpace;
    }
    if (bottomSpace != null) {
      bottomSpaceToUse = bottomSpace;
    }
    if (rightSpace != null) {
      rightSpaceToUse = rightSpace;
    }

    fullContentBounds.width = leftSpaceToUse + rightSpaceToUse + contentBounds.width;
    fullContentBounds.ascent = contentBounds.ascent + topSpaceToUse;
    fullContentBounds.descent = contentBounds.descent + bottomSpaceToUse;
    fullContentBounds.height = fullContentBounds.descent + fullContentBounds.ascent;

    let boxHeight = fullContentBounds.width;
    let boxWidth = fullContentBounds.height;

    if (glyph != null) {
      let { lineWidth } = glyph.custom.options;
      if (glyph.custom.options.fill) {
        lineWidth = 0;
      }
      let widthLineWidth = lineWidth;
      let heightLineWidth = lineWidth;
      if (glyph.custom.options.draw === 'static') {
        let { staticWidth, staticHeight } = glyph.custom.options;
        if (staticWidth === 'first') {
          staticWidth = fullContentBounds.width + lineWidth * 2;
        }
        if (staticHeight === 'first') {
          staticHeight = fullContentBounds.height + lineWidth * 2;
        }
        const heightLineWidthRatio = lineWidth / staticHeight;
        const widthLineWidthRatio = lineWidth / staticWidth;
        boxWidth = fullContentBounds.width / (1 - 2 * widthLineWidthRatio);
        boxHeight = fullContentBounds.height / (1 - 2 * heightLineWidthRatio);
        widthLineWidth = boxWidth * widthLineWidthRatio;
        heightLineWidth = boxHeight * heightLineWidthRatio;
      } else {
        boxWidth = fullContentBounds.width + lineWidth * 2;
        boxHeight = fullContentBounds.height + lineWidth * 2;
      }
      this.glyphHeights[0] = boxHeight;
      this.glyphWidths[0] = boxWidth;
      if (glyph.custom.options.fill) {
        heightLineWidth = 0;
        widthLineWidth = 0;
      }
      glyphLoc.y = loc.y - fullContentBounds.descent - heightLineWidth;
      if (glyph != null && glyph.custom.options.height != null) {
        glyphLoc.y = loc.y - fullContentBounds.descent
                     + fullContentBounds.height / 2
                     - glyph.custom.options.height / 2;
      }
      if (inSize) {
        contentLoc.x = loc.x + widthLineWidth + leftSpaceToUse;
        if (glyph != null && glyph.custom.options.width != null) {
          contentLoc.x = loc.x + glyph.custom.options.width / 2
                       - fullContentBounds.width / 2;
        }
        this.width = boxWidth;
        this.descent = fullContentBounds.descent + heightLineWidth;
        this.ascent = fullContentBounds.ascent + heightLineWidth;
      } else {
        glyphLoc.x = loc.x - widthLineWidth - leftSpaceToUse;
        if (glyph != null && glyph.custom.options.width != null) {
          glyphLoc.x = loc.x + fullContentBounds.width / 2
                       - glyph.custom.options.width / 2;
        }
        this.width = fullContentBounds.width;
        this.descent = fullContentBounds.descent;
        this.ascent = fullContentBounds.ascent;
      }
      this.glyphLocations[0] = glyphLoc;
      glyph.custom.setSize(
        this.glyphLocations[0],
        boxWidth,
        boxHeight,
      );
    } else {
      this.width = fullContentBounds.width;
      this.descent = fullContentBounds.descent;
      this.ascent = fullContentBounds.ascent;
    }

    this.height = this.descent + this.ascent;
    if (mainContent != null && inSize) {
      mainContent.offsetLocation(contentLoc.sub(mainContent.location));
    }
  }
}
