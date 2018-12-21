// @flow
import {
  Point,
} from '../../../../tools/g2';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../../Element';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';
import Bounds from './Bounds';

export class Brackets extends Elements {
  mainContent: Elements | null;
  glyph: DiagramElementPrimative | DiagramElementCollection | null;
  rightGlyph: DiagramElementPrimative | DiagramElementCollection | null;
  glyphLocation: Point;
  rightGlyphLocation: Point;
  glyphScale: number;
  insideSpace: number;
  outsideSpace: number;
  minLineHeight: Elements | null;
  heightScale: number;

  constructor(
    content: Elements | null,
    glyph: DiagramElementPrimative | null | DiagramElementCollection,
    rightGlyph: DiagramElementPrimative | null | DiagramElementCollection,
    insideSpace: number = 0.03,
    outsideSpace: number = 0.05,
    minLineHeight: Elements | null = null,
    heightScale: number = 1.2,
  ) {
    const left = glyph !== null ? new Element(glyph) : null;
    const right = rightGlyph !== null ? new Element(rightGlyph) : null;
    super([left, content, right]);
    this.glyph = glyph;
    this.rightGlyph = rightGlyph;
    this.mainContent = content;
    this.glyphLocation = new Point(0, 0);
    this.rightGlyphLocation = new Point(0, 0);
    this.glyphScale = 1;
    this.insideSpace = insideSpace;
    this.outsideSpace = outsideSpace;
    this.minLineHeight = minLineHeight;
    this.heightScale = heightScale;
  }

  _dup(namedCollection?: Object) {
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let lglyph = this.glyph;
    if (this.glyph != null && namedCollection) {
      lglyph = namedCollection[this.glyph.name];
    }
    let rglyph = this.rightGlyph;
    if (this.rightGlyph != null && namedCollection) {
      rglyph = namedCollection[this.rightGlyph.name];
    }
    const bracketCopy = new Brackets(
      content,
      lglyph,
      rglyph,
      this.insideSpace,
      this.outsideSpace,
    );
    duplicateFromTo(
      this, bracketCopy,
      ['content', 'glyph', 'rightGlyph'],
    );
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
    return bracketCopy;
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.glyph) {
      elements = [...elements, this.glyph];
    }
    if (this.rightGlyph) {
      elements = [...elements, this.rightGlyph];
    }
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
    return elements;
  }

  setPositions() {
    const { glyph, rightGlyph } = this;
    if (glyph != null) {
      glyph.transform.updateScale(this.glyphScale, this.glyphScale);
      glyph.transform.updateTranslation(
        this.glyphLocation.x,
        this.glyphLocation.y,
      );
    }
    if (rightGlyph != null) {
      rightGlyph.transform.updateScale(this.glyphScale, this.glyphScale);
      rightGlyph.transform.updateTranslation(
        this.rightGlyphLocation.x,
        this.rightGlyphLocation.y,
      );
    }
    if (this.mainContent) {
      this.mainContent.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    const { glyph, rightGlyph } = this;
    if (glyph != null) {
      this.glyphLocation = this.glyphLocation.add(offset);
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
    const glyphBounds = new Bounds();
    const rightGlyphBounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
    }

    const lineHeight = this.minLineHeight;
    if (lineHeight != null) {
      lineHeight.calcSize(loc._dup(), scale);
      contentBounds.height = Math.max(lineHeight.height, contentBounds.height);
      contentBounds.descent = Math.max(lineHeight.descent, contentBounds.descent);
    }

    const { heightScale } = this;
    const height = contentBounds.height * heightScale;
    const bracketScale = height;

    const glyphDescent = contentBounds.descent
        + contentBounds.height * (heightScale - 1) / 2;
    const leftSymbolLocation = new Point(
      loc.x + this.outsideSpace * scale,
      loc.y - glyphDescent,
    );
    const { glyph } = this;
    if (glyph instanceof DiagramElementPrimative) {
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

    const rightSymbolLocation = new Point(
      loc.x + contentBounds.width + glyphBounds.width
        + (this.insideSpace * 2 + this.outsideSpace) * scale,
      leftSymbolLocation.y,
    );
    const { rightGlyph } = this;
    if (rightGlyph instanceof DiagramElementPrimative) {
      rightGlyph.show();
      rightGlyph.transform.updateScale(
        bracketScale,
        bracketScale,
      );
      rightGlyph.transform.updateTranslation(
        rightSymbolLocation.x,
        rightSymbolLocation.y,
      );
      this.rightGlyphLocation = rightSymbolLocation;
      const bounds = rightGlyph.drawingObject
        .getRelativeVertexSpaceBoundingRect();
      rightGlyphBounds.width = bounds.width * bracketScale;
      rightGlyphBounds.height = (-bounds.bottom + bounds.top) * bracketScale;
      rightGlyphBounds.ascent = (bounds.top) * bracketScale;
      rightGlyphBounds.descent = (-bounds.bottom) * bracketScale;
    }
    const contentLocation = new Point(
      this.location.x + glyphBounds.width + (this.insideSpace + this.outsideSpace) * scale,
      this.location.y,
    );

    if (mainContent instanceof Elements) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    this.width = glyphBounds.width + contentBounds.width
      + rightGlyphBounds.width + this.insideSpace * scale * 2
      + this.outsideSpace * scale * 2;
    this.ascent = glyphBounds.height - glyphDescent;
    this.descent = glyphDescent;
    this.height = this.descent + this.ascent;
    // console.log(this.glyphLocation, this.rightGlyphLocation)
    // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
  }
}


export class Bar extends Brackets {
  barPosition: 'top' | 'bottom';
  // outsideSpace: number;

  constructor(
    content: Elements | null,
    barGlyph: DiagramElementPrimative | null | DiagramElementCollection,
    space: number = 0.03,
    outsideSpace: number = 0.03,
    barPosition: 'top' | 'bottom' = 'top',
  ) {
    super(content, barGlyph, null, space, outsideSpace);
    this.barPosition = barPosition;
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
    if (glyph instanceof DiagramElementPrimative) {
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
    if (this.barPosition === 'top') {
      this.ascent = contentBounds.ascent + glyphBounds.height
        + this.insideSpace * scale + this.outsideSpace * scale;
      this.descent = contentBounds.descent;
    } else {
      this.ascent = contentBounds.ascent;
      this.descent = contentBounds.descent + glyphBounds.height
        + this.insideSpace * scale + this.outsideSpace * scale;
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
