// @flow
import {
  Point,
} from '../../../../tools/g2';
// import {
//   DiagramElementPrimitive, DiagramElementCollection,
// } from '../../../Element';
// import { duplicateFromTo } from '../../../../tools/tools';
import { Elements } from './Element';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class Brackets extends BaseEquationFunction {

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const [leftGlyph, rightGlyph] = this.glyphs;
    const [mainContent] = this.contents;
    const {
      insideSpace, outsideSpace, topSpace,
      bottomSpace, minContentHeight, minContentDescent, descent, height, inSize,
    } = this.options;
    const loc = location._dup();
    const contentBounds = new Bounds();
    const originalContentBounds = new Bounds();
    const leftGlyphBounds = new Bounds();
    const rightGlyphBounds = new Bounds();

    // const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent);
      originalContentBounds.copyFrom(mainContent);
    }

    // Calculation of descent and height needs to be done in this order to
    // to preserve precedence (larger number overrides smaller number):
    //    1. minContentDescent
    //    2. forceDescent
    //
    //    1. Height based on bracket descent, to content ascent
    //    2. forceHeight
    if (minContentDescent != null) {
      contentBounds.descent = Math.max(minContentDescent, contentBounds.descent);
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let glyphDescent = contentBounds.descent + scale * bottomSpace;
    if (descent != null) {
      glyphDescent = descent;
    }
    if (minContentHeight != null) {
      contentBounds.ascent = -contentBounds.descent + Math.max(
        minContentHeight, contentBounds.height,
      );
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let glyphHeight = glyphDescent + contentBounds.ascent + topSpace * scale;
    if (height != null) {
      glyphHeight = height;
    }
    // this.glyphHeight = glyphHeight;

    let leftSymbolLocation = new Point(
      loc.x + outsideSpace * scale,
      loc.y - glyphDescent,
    );

    // const { leftGlyph } = this;
    if (leftGlyph != null) {
      if (inSize === false) {
        leftSymbolLocation = new Point(
          loc.x - insideSpace * scale - leftGlyph.custom.getWidth(
            leftGlyph.custom.options, glyphHeight,
          ),
          loc.y - glyphDescent,
        );
      }
      leftGlyph.showAll();
      leftGlyph.transform.updateScale(
        glyphHeight,
        glyphHeight,
      );
      leftGlyph.transform.updateTranslation(
        leftSymbolLocation.x,
        leftSymbolLocation.y,
      );
      this.glyphLocations[0] = leftSymbolLocation;
      leftGlyphBounds.width = leftGlyph.custom.getWidth(
        leftGlyph.custom.options, glyphHeight,
      );
      leftGlyphBounds.height = glyphHeight;
      leftGlyphBounds.ascent = glyphHeight - glyphDescent;
      leftGlyphBounds.descent = glyphDescent;
      this.glyphHeights[0] = glyphHeight;
      this.glyphWidths[0] = leftGlyphBounds.width;
    }

    let rightSymbolLocation = new Point(
      loc.x + contentBounds.width + leftGlyphBounds.width
        + (insideSpace * 2 + outsideSpace) * scale,
      leftSymbolLocation.y,
    );

    if (leftGlyph === null) {
      rightSymbolLocation.x = loc.x + contentBounds.width + insideSpace * scale;
    }

    if (inSize === false) {
      rightSymbolLocation = new Point(
        loc.x + contentBounds.width + insideSpace * scale,
        leftSymbolLocation.y,
      );
    }

    if (rightGlyph != null) {
      rightGlyph.showAll();
      rightGlyph.transform.updateScale(
        glyphHeight,
        glyphHeight,
      );
      rightGlyph.transform.updateTranslation(
        rightSymbolLocation.x,
        rightSymbolLocation.y,
      );
      this.glyphLocations[1] = rightSymbolLocation;
      rightGlyphBounds.width = rightGlyph.custom.getWidth(
        rightGlyph.custom.options, glyphHeight,
      );
      rightGlyphBounds.height = glyphHeight;
      rightGlyphBounds.ascent = glyphHeight - glyphDescent;
      rightGlyphBounds.descent = glyphDescent;
      this.glyphHeights[1] = glyphHeight;
      this.glyphWidths[1] = rightGlyphBounds.width;
    }
    const contentLocation = new Point(
      this.location.x + leftGlyphBounds.width + (insideSpace + outsideSpace) * scale,
      this.location.y,
    );
    if (leftGlyph == null) {
      contentLocation.x = this.location.x;
    }

    if (mainContent != null && inSize) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    if (inSize) {
      this.width = leftGlyphBounds.width + originalContentBounds.width
        + rightGlyphBounds.width + insideSpace * scale * 2
        + outsideSpace * scale * 2;
      if (leftGlyph == null) {
        this.width -= (insideSpace + outsideSpace) * scale;
      }
      this.ascent = Math.max(
        leftGlyphBounds.height - glyphDescent,
        rightGlyphBounds.height - glyphDescent,
        originalContentBounds.ascent,
      );
      this.descent = Math.max(glyphDescent, originalContentBounds.descent);
      this.height = this.descent + this.ascent;
    } else {
      this.width = originalContentBounds.width;
      this.ascent = originalContentBounds.ascent;
      this.descent = originalContentBounds.descent;
      this.height = originalContentBounds.height;
    }

    if (leftGlyph) {
      leftGlyph.custom.setSize(
        this.glyphLocations[0],
        leftGlyphBounds.width,
        leftGlyphBounds.height,
      );
    }
    if (rightGlyph) {
      rightGlyph.custom.setSize(
        this.glyphLocations[1],
        rightGlyphBounds.width,
        rightGlyphBounds.height,
      );
    }
  }
}
