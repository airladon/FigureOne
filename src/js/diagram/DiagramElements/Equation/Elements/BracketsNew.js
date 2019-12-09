// @flow
import {
  Point,
} from '../../../../tools/g2';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';
import Bounds from './Bounds';

export class BracketsNew extends Elements {
  mainContent: Elements | null;
  leftGlyph: DiagramElementPrimitive | DiagramElementCollection | null;
  rightGlyph: DiagramElementPrimitive | DiagramElementCollection | null;
  leftGlyphLocation: Point;
  rightGlyphLocation: Point;
  glyphHeight: number; // ?
  insideSpace: number;
  outsideSpace: number;
  topSpace: number;
  bottomSpace: number;
  minContentHeight: number | null;
  minContentDescent: number | null;
  forceHeight: number | null;
  forceDescent: number | null;
  inSize: boolean;

  constructor(
    content: Elements | null,
    leftGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    rightGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    insideSpace: number = 0.03,
    outsideSpace: number = 0.05,
    topSpace: number = 0.05,
    bottomSpace: number = 0.05,
    minContentHeight: number | null = null,
    minContentDescent: number | null = null,
    forceHeight: number | null = null,
    forceDescent: number | null = null,
    inSize: boolean = true,
  ) {
    const left = leftGlyph !== null ? new Element(leftGlyph) : null;
    const right = rightGlyph !== null ? new Element(rightGlyph) : null;
    super([left, content, right]);
    this.leftGlyph = leftGlyph;
    this.rightGlyph = rightGlyph;
    this.mainContent = content;
    this.leftGlyphLocation = new Point(0, 0);
    this.rightGlyphLocation = new Point(0, 0);
    // this.glyphScale = 1;
    this.glyphHeight = 1;
    this.insideSpace = insideSpace;
    this.outsideSpace = outsideSpace;
    this.topSpace = topSpace;
    this.bottomSpace = bottomSpace;
    this.minContentHeight = minContentHeight;
    this.minContentDescent = minContentDescent;
    this.forceHeight = forceHeight;
    this.forceDescent = forceDescent;
    // this.heightScale = heightScale;
    this.inSize = inSize;
  }

  _dup(namedCollection?: Object) {
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let lglyph = this.leftGlyph;
    if (this.leftGlyph != null && namedCollection) {
      lglyph = namedCollection[this.leftGlyph.name];
    }
    let rglyph = this.rightGlyph;
    if (this.rightGlyph != null && namedCollection) {
      rglyph = namedCollection[this.rightGlyph.name];
    }
    const bracketCopy = new BracketsNew(
      content,
      lglyph,
      rglyph,
      this.insideSpace,
      this.outsideSpace,
    );
    duplicateFromTo(
      this, bracketCopy,
      ['content', 'leftGlyph', 'rightGlyph'],
    );
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
    return bracketCopy;
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.leftGlyph) {
      elements = [...elements, this.leftGlyph];
    }
    if (this.rightGlyph) {
      elements = [...elements, this.rightGlyph];
    }
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
    return elements;
  }

  setPositions() {
    const { leftGlyph, rightGlyph } = this;
    if (leftGlyph != null) {
      const t = leftGlyph.getTransform()._dup();
      t.updateTranslation(this.leftGlyphLocation.x, this.leftGlyphLocation.y);
      t.updateScale(this.glyphHeight, this.glyphHeight);
      leftGlyph.setTransform(t);
    }
    if (rightGlyph != null) {
      const t = rightGlyph.getTransform()._dup();
      t.updateTranslation(this.rightGlyphLocation.x, this.rightGlyphLocation.y);
      t.updateScale(this.glyphHeight, this.glyphHeight);
      rightGlyph.setTransform(t);
    }
    if (this.mainContent) {
      this.mainContent.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    const { leftGlyph, rightGlyph } = this;
    if (leftGlyph != null) {
      this.leftGlyphLocation = this.leftGlyphLocation.add(offset);
    }
    if (rightGlyph != null) {
      this.rightGlyphLocation = this.rightGlyphLocation.add(offset);
    }
    if (this.mainContent) {
      this.mainContent.offsetLocation(offset);
    }
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const originalContentBounds = new Bounds();
    const leftGlyphBounds = new Bounds();
    const rightGlyphBounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
      originalContentBounds.width = mainContent.width;
      originalContentBounds.height = mainContent.height;
      originalContentBounds.ascent = mainContent.ascent;
      originalContentBounds.descent = mainContent.descent;
    }

    // Calculation of descent and height needs to be done in this order to
    // to preserve precedence (larger number overrides smaller number):
    //    1. minContentDescent
    //    2. forceDescent
    //
    //    1. Height based on bracket descent, to content ascent
    //    2. forceHeight
    if (this.minContentDescent != null) {
      contentBounds.descent = Math.max(this.minContentDescent, contentBounds.descent);
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let glyphDescent = contentBounds.descent + scale * this.bottomSpace;
    if (this.forceDescent != null) {
      glyphDescent = this.forceDescent;
    }
    if (this.minContentHeight != null) {
      contentBounds.ascent = -contentBounds.descent + Math.max(
        this.minContentHeight, contentBounds.height,
      );
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let height = glyphDescent + contentBounds.ascent + this.topSpace * scale;
    if (this.forceHeight != null) {
      height = this.forceHeight;
    }

    let leftSymbolLocation = new Point(
      loc.x + this.outsideSpace * scale,
      loc.y - glyphDescent,
    );

    const { leftGlyph } = this;
    if (leftGlyph != null) {
      if (this.inSize === false) {
        leftSymbolLocation = new Point(
          loc.x - this.insideSpace * scale - leftGlyph.custom.getWidth(
            leftGlyph.custom.type, leftGlyph.custom.options, height,
          ),
          loc.y - glyphDescent,
        );
      }
      leftGlyph.showAll();
      leftGlyph.transform.updateScale(
        height,
        height,
      );
      leftGlyph.transform.updateTranslation(
        leftSymbolLocation.x,
        leftSymbolLocation.y,
      );
      this.leftGlyphLocation = leftSymbolLocation;
      this.glyphHeight = height;
      leftGlyphBounds.width = leftGlyph.custom.getWidth(
        leftGlyph.custom.type, leftGlyph.custom.options, height,
      );
      leftGlyphBounds.height = height;
      leftGlyphBounds.ascent = height - glyphDescent;
      leftGlyphBounds.descent = glyphDescent;
    }

    let rightSymbolLocation = new Point(
      loc.x + contentBounds.width + leftGlyphBounds.width
        + (this.insideSpace * 2 + this.outsideSpace) * scale,
      leftSymbolLocation.y,
    );

    if (this.inSize === false) {
      rightSymbolLocation = new Point(
        loc.x + contentBounds.width + this.insideSpace * scale,
        leftSymbolLocation.y,
      );
    }

    const { rightGlyph } = this;
    if (rightGlyph != null) {
      rightGlyph.showAll();
      rightGlyph.transform.updateScale(
        height,
        height,
      );
      rightGlyph.transform.updateTranslation(
        rightSymbolLocation.x,
        rightSymbolLocation.y,
      );
      this.rightGlyphLocation = rightSymbolLocation;
      rightGlyphBounds.width = rightGlyph.custom.getWidth(
        rightGlyph.custom.type, rightGlyph.custom.options, height,
      );
      rightGlyphBounds.height = height;
      rightGlyphBounds.ascent = height - glyphDescent;
      rightGlyphBounds.descent = glyphDescent;
    }
    const contentLocation = new Point(
      this.location.x + leftGlyphBounds.width + (this.insideSpace + this.outsideSpace) * scale,
      this.location.y,
    );

    if (mainContent instanceof Elements && this.inSize) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    if (this.inSize) {
      this.width = leftGlyphBounds.width + originalContentBounds.width
        + rightGlyphBounds.width + this.insideSpace * scale * 2
        + this.outsideSpace * scale * 2;
      this.ascent = Math.max(leftGlyphBounds.height - glyphDescent, originalContentBounds.ascent);
      this.descent = Math.max(glyphDescent, originalContentBounds.descent);
      this.height = this.descent + this.ascent;
    } else {
      this.width = originalContentBounds.width;
      this.ascent = originalContentBounds.ascent;
      this.descent = originalContentBounds.descent;
      this.height = originalContentBounds.height;
    }

    if (leftGlyph) {
      leftGlyph.custom.setSize(this.leftGlyphLocation, height);
    }
    if (rightGlyph) {
      rightGlyph.custom.setSize(this.rightGlyphLocation, height);
    }
  }
}

// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// Make brackets have a custom setabble ascent and descent instead of auto scale
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
export class BarNew extends BracketsNew {
  barPosition: 'top' | 'bottom';
  inSize: boolean;
  // outsideSpace: number;

  constructor(
    content: Elements | null,
    barGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    space: number = 0.03,
    outsideSpace: number = 0.03,
    barPosition: 'top' | 'bottom' = 'top',
    inSize: boolean = true,
  ) {
    super(content, barGlyph, null, space, outsideSpace);
    this.barPosition = barPosition;
    this.inSize = inSize;
    // this.outsideSpace = outsideSpace;
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const glyphBounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
    }

    const widthScale = 1;
    const width = contentBounds.width * widthScale;
    const bracketScale = width;

    const leftSymbolLocation = new Point(
      loc.x - (widthScale - 1) * width / 2,
      loc.y + contentBounds.ascent + this.insideSpace * scale,
    );
    if (this.barPosition === 'bottom') {
      leftSymbolLocation.y = loc.y - contentBounds.descent - this.insideSpace * scale;
    }
    const { glyph } = this;
    if (glyph instanceof DiagramElementPrimitive) {
      glyph.show();
      glyph.transform.updateScale(
        bracketScale,
        bracketScale,
      );
      glyph.transform.updateTranslation(
        leftSymbolLocation.x,
        leftSymbolLocation.y,
      );
      this.glyphLocation = leftSymbolLocation;
      this.glyphScale = bracketScale;
      const bounds = glyph.drawingObject
        .getRelativeVertexSpaceBoundingRect();
      glyphBounds.width = bounds.width * bracketScale;
      glyphBounds.height = (-bounds.bottom + bounds.top) * bracketScale;
      glyphBounds.ascent = (bounds.top) * bracketScale;
      glyphBounds.descent = (-bounds.bottom) * bracketScale;
    }
    this.width = contentBounds.width;
    if (this.inSize) {
      if (this.barPosition === 'top') {
        this.ascent = contentBounds.ascent + glyphBounds.height
          + this.insideSpace * scale + this.outsideSpace * scale;
        this.descent = contentBounds.descent;
      } else {
        this.ascent = contentBounds.ascent;
        this.descent = contentBounds.descent + glyphBounds.height
          + this.insideSpace * scale + this.outsideSpace * scale;
      }
    } else {
      this.ascent = contentBounds.ascent;
      this.descent = contentBounds.descent;
    }
    this.height = this.descent + this.ascent;
  }

  // Must make a dup method in a subclass or else the parent class will
  // create a new copy of its own class type
  _dup(namedCollection?: Object) {
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let { glyph } = this;
    if (this.glyph != null && namedCollection) {
      glyph = namedCollection[this.glyph.name];
    }
    const barCopy = new Bar(
      content,
      glyph,
      this.insideSpace,
      this.outsideSpace,
      this.barPosition,
    );
    duplicateFromTo(
      this, barCopy,
      ['content', 'glyph'],
    );
    return barCopy;
  }
}
