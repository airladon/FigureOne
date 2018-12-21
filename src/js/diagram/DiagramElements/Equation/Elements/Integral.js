// @flow
import {
  Point,
} from '../../../../tools/g2';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../../Element';
import { roundNum } from '../../../../tools/math';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';
import Bounds from './Bounds';

export default class Integral extends Elements {
  limitMin: Elements | null;
  limitMax: Elements | null;
  mainContent: Elements | null;
  integralGlyph: DiagramElementPrimative | DiagramElementCollection | null;
  glyphLocation: Point;
  glyphScale: number;

  constructor(
    limitMin: Elements | null,
    limitMax: Elements | null,
    content: Elements | null,
    integralGlyph: DiagramElementPrimative | null | DiagramElementCollection,
  ) {
    const glyph = integralGlyph !== null ? new Element(integralGlyph) : null;
    super([glyph, limitMin, limitMax, content]);

    this.limitMin = limitMin;
    this.limitMax = limitMax;
    this.mainContent = content;
    this.integralGlyph = integralGlyph;
    this.glyphLocation = new Point(0, 0);
    this.glyphScale = 1;
  }

  _dup(namedCollection?: Object) {
    const limitMin = this.limitMin == null ? null : this.limitMin._dup(namedCollection);
    const limitMax = this.limitMax == null ? null : this.limitMax._dup(namedCollection);
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let glyph = null;
    if (this.integralGlyph != null && namedCollection) {
      glyph = namedCollection[this.integralGlyph.name];
    } else {
      glyph = this.integralGlyph;
    }

    const integralCopy = new Integral(
      limitMin,
      limitMax,
      content,
      glyph,
    );
    duplicateFromTo(
      this, integralCopy,
      ['limitMin', 'limitMax', 'content', 'integralGlyph', 'content'],
    );
    return integralCopy;
  }

  getAllElements() {
    let elements = [];
    if (this.limitMin) {
      elements = [...elements, ...this.limitMin.getAllElements()];
    }
    if (this.limitMax) {
      elements = [...elements, ...this.limitMax.getAllElements()];
    }
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.integralGlyph) {
      elements = [...elements, this.integralGlyph];
    }
    return elements;
  }

  setPositions() {
    const { integralGlyph } = this;
    if (integralGlyph != null) {
      integralGlyph.transform.updateScale(this.glyphScale, this.glyphScale);
      integralGlyph.transform.updateTranslation(
        this.glyphLocation.x,
        this.glyphLocation.y,
      );
    }
    if (this.limitMin) {
      this.limitMin.setPositions();
    }
    if (this.limitMax) {
      this.limitMax.setPositions();
    }
    if (this.mainContent) {
      this.mainContent.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    const { integralGlyph } = this;
    if (integralGlyph != null) {
      this.glyphLocation = this.glyphLocation.add(offset);
    }
    if (this.mainContent) {
      this.mainContent.offsetLocation(offset);
    }
    if (this.limitMax) {
      this.limitMax.offsetLocation(offset);
    }
    if (this.limitMin) {
      this.limitMin.offsetLocation(offset);
    }
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const limitMinBounds = new Bounds();
    const limitMaxBounds = new Bounds();
    const integralGlyphBounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
    }

    const { limitMax } = this;
    if (limitMax instanceof Elements) {
      limitMax.calcSize(loc._dup(), scale / 2);
      limitMaxBounds.width = limitMax.width;
      limitMaxBounds.height = limitMax.ascent + limitMax.descent;
      limitMaxBounds.ascent = limitMax.ascent;
      limitMaxBounds.descent = limitMax.descent;
    }

    const { limitMin } = this;
    if (limitMin instanceof Elements) {
      limitMin.calcSize(loc._dup(), scale / 2);
      limitMinBounds.width = limitMin.width;
      limitMinBounds.height = limitMin.ascent + limitMin.descent;
      limitMinBounds.ascent = limitMin.ascent;
      limitMinBounds.descent = limitMin.descent;
    }

    const integralMinHeight = contentBounds.ascent + contentBounds.descent
                              + limitMinBounds.height + limitMaxBounds.height;
    const numLines = roundNum(integralMinHeight / scale, 0);
    const height = numLines * scale * 1.2;
    const integralSymbolLocation = new Point(
      loc.x,
      loc.y - height / 2 + scale * 0.45,
    );

    const { integralGlyph } = this;
    if (integralGlyph instanceof DiagramElementPrimative) {
      integralGlyph.show();
      integralGlyph.transform.updateScale(
        height,
        height,
      );
      integralGlyph.transform.updateTranslation(
        integralSymbolLocation.x,
        integralSymbolLocation.y,
      );
      this.glyphLocation = integralSymbolLocation;
      this.glyphScale = height;
      const bounds = integralGlyph.drawingObject
        .getRelativeVertexSpaceBoundingRect();
        // .getRelativeGLBoundingRect(integralGlyph.transform.matrix());
      integralGlyphBounds.width = (bounds.width) * height;
      integralGlyphBounds.height = (-bounds.bottom + bounds.top) * height;
      integralGlyphBounds.ascent = bounds.top * height;
      integralGlyphBounds.descent = (-bounds.bottom) * height;
    }

    const minLimitLocation = new Point(
      this.location.x + integralGlyphBounds.width * 0.5,
      integralSymbolLocation.y,
    );

    const maxLimitLocation = new Point(
      this.location.x + integralGlyphBounds.width * 1.2,
      integralSymbolLocation.y + integralGlyphBounds.height - limitMaxBounds.height / 2,
    );

    const contentLocation = new Point(
      this.location.x + integralGlyphBounds.width * 0.8,
      this.location.y,
    );

    if (mainContent instanceof Elements) {
      mainContent.calcSize(contentLocation, scale);
    }
    if (limitMin instanceof Elements) {
      limitMin.calcSize(minLimitLocation, scale / 2);
    }
    if (limitMax instanceof Elements) {
      limitMax.calcSize(maxLimitLocation, scale / 2);
    }

    this.width = Math.max(
      integralGlyphBounds.width,
      limitMinBounds.width + minLimitLocation.x - this.location.x,
      limitMaxBounds.width + maxLimitLocation.x - this.location.x,
      contentBounds.width + contentLocation.x - this.location.x,
    );
    this.ascent = Math.max(
      integralGlyphBounds.ascent,
      limitMaxBounds.ascent + maxLimitLocation.y - this.location.y,
      contentBounds.ascent + contentLocation.y - this.location.y,
    );

    this.descent = Math.max(
      integralGlyphBounds.descent,
      limitMinBounds.descent + this.location.y - minLimitLocation.y,
      contentBounds.ascent + this.location.y - contentLocation.y,
    );

    this.height = this.descent + this.ascent;
  }
}
