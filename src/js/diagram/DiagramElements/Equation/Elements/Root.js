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
  rootScale: number;
  // glyphScale: number;

  constructor(
    content: Elements | null,
    radicalGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    root: Elements | null,
    glyphLineWidth: ?number = null,
    glyphStartWidth: ?number = null,
    glyphStartHeight: ?number = null,
    contentSpace: ?(Point | [number, number] | number) = null,
    rootSpace: ?(Point | [number, number] | number) = null,
    rootScale: ?number = null,
  ) {
    const glyph = radicalGlyph !== null ? new Element(radicalGlyph) : null;
    super([glyph, root, content]);
    this.root = root;
    this.mainContent = content;
    this.radicalGlyph = radicalGlyph;
    this.contentSpace = getPoint(contentSpace || 0.05);
    this.rootSpace = getPoint(rootSpace || 0.05);
    this.glyphStartHeight = glyphStartHeight || 0.1;
    this.glyphStartWidth = glyphStartWidth || 0.1;
    this.glyphLocation = new Point(0, 0);
    this.rootScale = rootScale || 0.5;
    this.glyphWidth = 1;
    this.glyphHeight = 1;
    this.glyphLineWidth = glyphLineWidth || 0.01;
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

    const rootCopy = new Root(
      root,
      content,
      glyph,
    );
    duplicateFromTo(
      this, rootCopy,
      ['root', 'mainContent', 'radicalGlyph'],
    );
    return rootCopy;
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
      // radicalGlyph.setPosition(this.glyphLocation);
      // radicalGlyph.setScale(this.glyphWidth, this.glyphHeight);
      const t = radicalGlyph.getTransform()._dup();
      t.updateTranslation(this.glyphLocation.x, this.glyphLocation.y);
      t.updateScale(this.glyphWidth, this.glyphHeight);
      radicalGlyph.setTransform(t);
    }
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
      root.calcSize(loc._dup(), scale * this.rootScale);
      console.log(scale, this.rootScale, root.width);
      rootBounds.width = root.width;
      rootBounds.height = root.ascent + root.descent;
      rootBounds.ascent = root.ascent;
      rootBounds.descent = root.descent;
    }

    glyphBounds.descent = contentBounds.descent + this.contentSpace.y;
    glyphBounds.ascent = contentBounds.ascent + this.contentSpace.y;
    glyphBounds.height = glyphBounds.ascent + glyphBounds.descent;
    glyphBounds.width = this.glyphStartWidth
      + this.contentSpace.x + contentBounds.width + this.contentSpace.x;
    

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
    console.log(rootBounds.width, this.rootSpace.x, this.glyphStartWidth)
    if (rootBounds.width + this.rootSpace.x > this.glyphStartWidth) {
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
      root.calcSize(rootLocation, scale * this.rootScale);
    }
    this.glyphWidth = glyphBounds.width;
    this.glyphHeight = glyphBounds.height;

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
  }
}
