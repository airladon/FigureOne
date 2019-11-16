// @flow
import {
  Point, getPoint,
} from '../../../../tools/g2';
import {
  DiagramElementPrimitive, DiagramElementCollection, DiagramElement,
} from '../../../Element';
// import { roundNum } from '../../../../tools/math';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';
import Bounds from './Bounds';

export default class Root extends Elements {
  root: Elements | null;
  mainContent: Elements | null;
  radicalGlyph: DiagramElementPrimitive | DiagramElementCollection | null;
  glyphLocation: Point;
  glyphStartWidth: number;
  glyphStartHeight: number;
  glyphWidth: number;
  glyphHeight: number;
  glyphLineWidth: number;
  // glyphContentWidth: number;
  rootSpace: Point;
  contentSpace: Point;
  // glyphScale: number;

  constructor(
    content: Elements | null,
    radicalGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    root: Elements | null,
    contentSpace: Point | [number, number] | number = 0.05,
    glyphStartHeight: number = 0.3,
    rootSpace: Point | [number, number] | number = 0.05,
    glpyghStartWidth: number = 0.2,
    glyphLineWidth: number = 0.01,
  ) {
    const glyph = radicalGlyph !== null ? new Element(radicalGlyph) : null;
    super([glyph, root, content]);

    this.root = root;
    this.mainContent = content;
    this.radicalGlyph = radicalGlyph;
    this.contentSpace = getPoint(contentSpace);
    this.rootSpace = getPoint(rootSpace);
    this.glyphStartHeight = glyphStartHeight;
    this.glyphStartWidth = glpyghStartWidth;
    this.glyphLocation = new Point(0, 0);
    this.glyphWidth = 1;
    this.glyphHeight = 1;
    this.glyphLineWidth = glyphLineWidth;
    // this.glyphContentWidth = 0.8;
  }

  _dup(namedCollection?: Object) {
    const root = this.root == null ? null : this.root._dup(namedCollection);
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let glyph = null;
    if (this.radicalGlyph != null && namedCollection) {
      glyph = namedCollection[this.radicalGlyph.name];
    } else {
      glyph = this.radicalGlyph;
    }

    const integralCopy = new Root(
      root,
      content,
      glyph,
    );
    duplicateFromTo(
      this, integralCopy,
      ['root', 'mainContent', 'radicalGlyph'],
    );
    return integralCopy;
  }

  getAllElements() {
    let elements = [];
    if (this.root) {
      elements = [...elements, ...this.root.getAllElements()];
    }
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.radicalGlyph) {
      elements = [...elements, this.radicalGlyph];
    }
    return elements;
  }

  setPositions() {
    const { radicalGlyph } = this;
    if (radicalGlyph) {
      radicalGlyph.custom.setSize(
        this.glyphLocation,
        this.glyphStartWidth,
        this.glyphStartHeight,
        this.glyphWidth,
        this.glyphHeight,
        this.glyphLineWidth,
      );
    }
    // if (radicalGlyph != null) {
    //   radicalGlyph.transform.updateScale(this.glyphScale, this.glyphScale);
    //   radicalGlyph.transform.updateTranslation(
    //     this.glyphLocation.x,
    //     this.glyphLocation.y,
    //   );
    // }
    if (this.root) {
      this.root.setPositions();
    }
    if (this.mainContent) {
      this.mainContent.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    const { radicalGlyph } = this;
    if (radicalGlyph != null) {
      this.glyphLocation = this.glyphLocation.add(offset);
    }
    if (this.mainContent) {
      this.mainContent.offsetLocation(offset);
    }
    if (this.root) {
      this.root.offsetLocation(offset);
    }
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const rootBounds = new Bounds();
    const glyphBounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
    }

    const { root } = this;
    if (root instanceof Elements) {
      root.calcSize(loc._dup(), scale / 2);
      rootBounds.width = root.width;
      rootBounds.height = root.ascent + root.descent;
      rootBounds.ascent = root.ascent;
      rootBounds.descent = root.descent;
    }

    glyphBounds.descent = contentBounds.descent + this.contentSpace.y;
    glyphBounds.ascent = contentBounds.ascent + this.contentSpace.y;
    glyphBounds.width = this.glyphStartWidth
      + this.contentSpace.x + contentBounds.width + this.contentSpace.x;
    glyphBounds.height = glyphBounds.ascent + glyphBounds.descent;

    const glyphStartToTop = glyphBounds.height - this.glyphStartHeight;
    const rootLocation = loc._dup();
    if (glyphStartToTop < rootBounds.height / 2 + this.rootSpace.y) {
      rootLocation.y = loc.y
        - glyphBounds.descent + this.glyphStartHeight
        + this.rootSpace.y + rootBounds.height / 2
        - (rootBounds.height / 2 - rootBounds.descent);
    } else {
      rootLocation.y = loc.y
        + glyphBounds.ascent
        - (rootBounds.height / 2 - rootBounds.descent);
    }

    this.glyphLocation = loc._dup();
    if (rootBounds.width + this.rootSpace.x < this.glyphStartWidth) {
      this.glyphLocation.x = loc.x + rootBounds.width + this.rootSpace.x - this.glyphStartWidth;
    }

    const mainContentLocation = loc._dup();
    mainContentLocation.x = this.glyphLocation.x + this.glyphStartWidth + this.contentSpace.x;

    this.width = this.glyphLocation.x + glyphBounds.width - loc.x;
    this.ascent = Math.max(
      glyphBounds.ascent, rootBounds.ascent + rootLocation.y,
    );
    this.descent = glyphBounds.descent;
    this.height = this.ascent + this.descent;

    if (mainContent instanceof Elements) {
      mainContent.calcSize(mainContentLocation, scale);
    }
    if (root instanceof Elements) {
      root.calcSize(rootLocation, scale / 2);
    }

    const { radicalGlyph } = this;
    this.glyphLocation.y = this.glyphLocation.y - glyphBounds.descent;
    if (radicalGlyph instanceof DiagramElement) {
      radicalGlyph.custom.setSize(
        this.glyphLocation,
        this.glyphStartWidth,
        this.glyphStartHeight,
        glyphBounds.width,
        glyphBounds.height,
        this.glyphLineWidth,
      );
    }

    // const integralMinHeight = contentBounds.ascent + contentBounds.descent
    //                           + limitMinBounds.height + limitMaxBounds.height;
    // const numLines = roundNum(integralMinHeight / scale, 0);
    // const height = numLines * scale * 1.2;
    // const integralSymbolLocation = new Point(
    //   loc.x,
    //   loc.y - height / 2 + scale * 0.45,
    // );

    // const { integralGlyph } = this;
    // if (integralGlyph instanceof DiagramElementPrimitive) {
    //   integralGlyph.show();
    //   integralGlyph.transform.updateScale(
    //     height,
    //     height,
    //   );
    //   integralGlyph.transform.updateTranslation(
    //     integralSymbolLocation.x,
    //     integralSymbolLocation.y,
    //   );
    //   this.glyphLocation = integralSymbolLocation;
    //   this.glyphScale = height;
    //   const bounds = integralGlyph.drawingObject
    //     .getRelativeVertexSpaceBoundingRect();
    //     // .getRelativeGLBoundingRect(integralGlyph.transform.matrix());
    //   integralGlyphBounds.width = (bounds.width) * height;
    //   integralGlyphBounds.height = (-bounds.bottom + bounds.top) * height;
    //   integralGlyphBounds.ascent = bounds.top * height;
    //   integralGlyphBounds.descent = (-bounds.bottom) * height;
    // }

    // const minLimitLocation = new Point(
    //   this.location.x + integralGlyphBounds.width * 0.5,
    //   integralSymbolLocation.y,
    // );

    // const maxLimitLocation = new Point(
    //   this.location.x + integralGlyphBounds.width * 1.2,
    //   integralSymbolLocation.y + integralGlyphBounds.height - limitMaxBounds.height / 2,
    // );

    // const contentLocation = new Point(
    //   this.location.x + integralGlyphBounds.width * 0.8,
    //   this.location.y,
    // );

    // if (mainContent instanceof Elements) {
    //   mainContent.calcSize(contentLocation, scale);
    // }
    // if (limitMin instanceof Elements) {
    //   limitMin.calcSize(minLimitLocation, scale / 2);
    // }
    // if (limitMax instanceof Elements) {
    //   limitMax.calcSize(maxLimitLocation, scale / 2);
    // }

    // this.width = Math.max(
    //   integralGlyphBounds.width,
    //   limitMinBounds.width + minLimitLocation.x - this.location.x,
    //   limitMaxBounds.width + maxLimitLocation.x - this.location.x,
    //   contentBounds.width + contentLocation.x - this.location.x,
    // );
    // this.ascent = Math.max(
    //   integralGlyphBounds.ascent,
    //   limitMaxBounds.ascent + maxLimitLocation.y - this.location.y,
    //   contentBounds.ascent + contentLocation.y - this.location.y,
    // );

    // this.descent = Math.max(
    //   integralGlyphBounds.descent,
    //   limitMinBounds.descent + this.location.y - minLimitLocation.y,
    //   contentBounds.ascent + this.location.y - contentLocation.y,
    // );

    // this.height = this.descent + this.ascent;
  }
}
