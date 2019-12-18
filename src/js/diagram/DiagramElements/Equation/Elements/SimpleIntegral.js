
// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class SimpleIntegral extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const fromBounds = new Bounds();
    const toBounds = new Bounds();
    const originalContentBounds = new Bounds();
    const glyphBounds = new Bounds();
    const operatorBounds = new Bounds();

    const fromLoc = location._dup();
    const toLoc = location._dup();
    const glyphLoc = location._dup();
    const {
      height, topSpace, bottomSpace, yOffset,
      space, inSize, contentScale, fromScale, toScale,
      fromSpace, toSpace, fromOffset, toOffset,
      limitsPosition,
    } = this.options;
    const [glyph] = this.glyphs;
    const [mainContent, fromContent, toContent] = this.contents;
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale * contentScale);
      contentBounds.copyFrom(mainContent);
      originalContentBounds.copyFrom(mainContent);
    }
    if (fromContent != null) {
      fromContent.calcSize(loc._dup(), scale * fromScale);
      fromBounds.copyFrom(fromContent);
    }
    if (toContent != null) {
      toContent.calcSize(loc._dup(), scale * toScale);
      toBounds.copyFrom(toContent);
    }

    // Find y position and bounds of glyph, from and to content
    glyphBounds.height = contentBounds.height + (bottomSpace + topSpace) * scale;
    glyphLoc.y = loc.y - contentBounds.descent - bottomSpace * scale + yOffset * scale;

    if (limitsPosition === 'side'
      && fromBounds.height / 2 > glyphBounds.height / 2) {
      const delta = fromBounds.height / 2 - glyphBounds.height / 2;
      glyphLoc.y -= delta;
      glyphBounds.height += delta;
    }

    if (limitsPosition === 'side'
      && toBounds.height / 2 > glyphBounds.height / 2) {
      const delta = toBounds.height / 2 - glyphBounds.height / 2;
      glyphBounds.height += delta;
    }

    // If height is defined it overwrites topSpace and bottomSpace
    if (height != null) {
      const contentMidY = loc.y - contentBounds.descent + contentBounds.height / 2;
      glyphBounds.height = height;
      glyphLoc.y = contentMidY - height / 2 + yOffset * scale;
    }
    glyphBounds.descent = loc.y - glyphLoc.y;
    glyphBounds.ascent = glyphBounds.height - glyphBounds.descent;
    if (limitsPosition === 'side') {
      fromLoc.y = glyphLoc.y - fromBounds.height / 2;
      toLoc.y = glyphLoc.y + glyphBounds.height - toBounds.height / 2;
    } else {
      fromLoc.y = glyphLoc.y
                - (fromSpace - fromOffset.y) * scale - fromBounds.ascent;
      toLoc.y = glyphLoc.y + glyphBounds.height
              + (toSpace + toOffset.y) * scale + toBounds.descent;
    }

    if (toContent != null) {
      operatorBounds.ascent = Math.max(
        toLoc.y + toBounds.height - loc.y,
        glyphLoc.y + glyphBounds.height - loc.y,
      );
    } else {
      operatorBounds.ascent = glyphBounds.ascent;
    }
    if (fromContent != null) {
      operatorBounds.descent = Math.max(
        loc.y - (fromLoc.y - fromBounds.descent),
        loc.y - (glyphLoc.y - glyphBounds.descent),
      );
    } else {
      operatorBounds.descent = glyphBounds.descent;
    }
    operatorBounds.height = operatorBounds.ascent + operatorBounds.descent;

    // Find x position and bounds of glyph, from and to content
    this.glyphHeights[0] = glyphBounds.height;
    // console.log(glyphBounds.height);
    if (glyph != null) {
      glyphBounds.width = glyph.custom.getWidth(glyph.custom.options, glyphBounds.height);
    } else {
      glyphBounds.width = 0;
    }
    this.glyphWidths[0] = glyphBounds.width;

    if (limitsPosition === 'side') {
      glyphLoc.x = loc.x;
      fromLoc.x = loc.x + glyphBounds.width / 2 + fromSpace;
      toLoc.x = loc.x + glyphBounds.width + toSpace;
    } else {
      const maxWidth = Math.max(glyphBounds.width, fromBounds.width, toBounds.width);
      glyphLoc.x = loc.x + (maxWidth - glyphBounds.width) / 2;
      fromLoc.x = loc.x + (maxWidth - fromBounds.width) / 2 + fromOffset.x;
      toLoc.x = loc.x + (maxWidth - toBounds.width) / 2 + toOffset.x;

      const minLocX = Math.min(toLoc.x, fromLoc.x, glyphLoc.x);
      if (minLocX < loc.x) {
        const offset = loc.x - minLocX;
        glyphLoc.x += offset;
        fromLoc.x += offset;
        toLoc.x += offset;
      }
    }

    operatorBounds.width = Math.max(
      glyphLoc.x + glyphBounds.width,
      fromLoc.x + fromBounds.width,
      toLoc.x + toBounds.width,
    ) - loc.x;


    // Final sizing and positioning
    if (inSize === false) {
      const offset = space * scale + operatorBounds.width;
      glyphLoc.x -= offset;
      fromLoc.x -= offset;
      toLoc.x -= offset;
    }


    if (glyph != null) {
      glyph.showAll();
      glyph.transform.updateScale(
        glyphBounds.width,
        glyphBounds.height,
      );
      glyph.transform.updateTranslation(
        glyphLoc.x,
        glyphLoc.y,
      );
      this.glyphLocations[0] = glyphLoc;
    }

    if (fromContent != null) {
      fromContent.offsetLocation(fromLoc.sub(fromContent.location));
    }
    if (toContent != null) {
      toContent.offsetLocation(toLoc.sub(toContent.location));
    }

    const contentLocation = new Point(
      this.location.x + operatorBounds.width + space * scale,
      this.location.y,
    );
    if (glyph == null) {
      contentLocation.x = location.x;
    }
    if (mainContent != null && inSize) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    if (inSize) {
      this.width = operatorBounds.width + originalContentBounds.width
        + space * scale;
      if (operatorBounds.width === 0) {
        this.width -= space * scale;
      }
      this.ascent = Math.max(
        operatorBounds.ascent,
        originalContentBounds.ascent,
      );
      this.descent = Math.max(operatorBounds.descent, originalContentBounds.descent);
      this.height = this.descent + this.ascent;
    } else {
      this.width = originalContentBounds.width;
      this.ascent = originalContentBounds.ascent;
      this.descent = originalContentBounds.descent;
      this.height = originalContentBounds.height;
    }

    if (glyph) {
      glyph.custom.setSize(glyphLoc, glyphBounds.width, glyphBounds.height);
    }
    // console.log(this.width, this.ascent, this.descent, this.height)
  }
}
