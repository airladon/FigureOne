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

const space = (l, b, r, t) => ({
  left: l,
  bottom: b,
  right: r,
  top: t,
});

export default class Root extends Elements {
  root: Elements | null;
  mainContent: Elements | null;
  radicalGlyph: DiagramElementPrimitive | DiagramElementCollection | null;
  glyphLocation: Point;
  // glyphStartWidth: number;
  // glyphStartHeight: number;
  glyphWidth: number;
  glyphHeight: number;
  // glyphLineWidth: number;
  // glyphContentWidth: number;
  rootSpace: Point;
  contentSpace: {
    left: number,
    bottom: number,
    right: number,
    top: number,
  };

  rootScale: number;
  // glyphScale: number;

  constructor(
    content: Elements | null,
    radicalGlyph: DiagramElementPrimitive | null | DiagramElementCollection,
    root: Elements | null,
    // glyphLineWidth: ?number = null,
    // glyphStartWidth: ?number = null,
    // glyphStartHeight: ?number = null,
    contentSpace: ?({
      left: ?number,
      right: ?number,
      top: ?number,
      bottom: ?number,
    } | Point | [number, number] | number) = null,
    rootSpace: ?(Point | [number, number] | number) = null,
    rootScale: ?number = null,
  ) {
    const glyph = radicalGlyph !== null ? new Element(radicalGlyph) : null;
    super([glyph, root, content]);
    this.root = root;
    this.mainContent = content;
    this.radicalGlyph = radicalGlyph;
    this.contentSpace = space(0.01, 0.01, 0.01, 0.01);
    if (typeof contentSpace === 'number') {
      this.contentSpace = space(
        contentSpace, contentSpace, contentSpace, contentSpace,
      );
    } else if (Array.isArray(contentSpace) && contentSpace.length === 2) {
      this.contentSpace = space(
        contentSpace[0], contentSpace[1], contentSpace[0], contentSpace[1],
      );
    } else if (contentSpace instanceof Point) {
      this.contentSpace = space(
        contentSpace.x, contentSpace.y, contentSpace.x, contentSpace.y,
      );
    } else if (contentSpace != null) {
      this.contentSpace = contentSpace;
    }
    // this.contentSpace = getPoint(contentSpace || 0.05);
    this.rootSpace = getPoint(rootSpace || 0.05);
    // this.glyphStartHeight = glyphStartHeight || 0.1;
    // this.glyphStartWidth = glyphStartWidth || 0.1;
    this.glyphLocation = new Point(0, 0);
    this.rootScale = rootScale || 0.5;
    this.glyphWidth = 1;
    this.glyphHeight = 1;
    // this.glyphLineWidth = glyphLineWidth || 0.01;
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
      content,
      glyph,
      root,
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
    const mainContentLocation = loc._dup();

    const { root } = this;
    if (root instanceof Elements) {
      root.calcSize(loc._dup(), scale * this.rootScale);
      rootBounds.width = root.width;
      rootBounds.height = root.ascent + root.descent;
      rootBounds.ascent = root.ascent;
      rootBounds.descent = root.descent;
    }
    const rootLocation = loc._dup();

    this.glyphLocation = loc._dup();
    const { radicalGlyph } = this;
    if (radicalGlyph) {
      const {
        startHeight, startWidth, proportionalToHeight,
        maxStartWidth, maxStartHeight,
      } = radicalGlyph.custom;

      glyphBounds.descent = contentBounds.descent + this.contentSpace.bottom;
      glyphBounds.ascent = contentBounds.ascent + this.contentSpace.top;
      glyphBounds.height = glyphBounds.ascent + glyphBounds.descent;
      let glyphStartHeight = startHeight;
      let glyphStartWidth = startWidth;
      if (proportionalToHeight) {
        glyphStartHeight = startHeight * glyphBounds.height;
        glyphStartWidth = startWidth * glyphBounds.height;
      }
      if (maxStartHeight != null && glyphStartHeight > maxStartHeight) {
        glyphStartHeight = maxStartHeight;
      }
      if (maxStartWidth != null && glyphStartWidth > maxStartWidth) {
        glyphStartWidth = maxStartWidth;
      }

      glyphBounds.width = glyphStartWidth
        + this.contentSpace.left + contentBounds.width + this.contentSpace.right;
      
      const startTop = glyphBounds.height - glyphStartHeight;
      if (startTop < rootBounds.height / 2 + this.rootSpace.y) {
        rootLocation.y = loc.y
          - glyphBounds.descent + glyphStartHeight
          + this.rootSpace.y + rootBounds.height / 2
          - (rootBounds.height / 2 - rootBounds.descent);
      } else {
        rootLocation.y = loc.y
          + glyphBounds.ascent
          - (rootBounds.height / 2 - rootBounds.descent);
      }

      if (rootBounds.width + this.rootSpace.x > glyphStartWidth) {
        this.glyphLocation.x = loc.x + rootBounds.width + this.rootSpace.x - glyphStartWidth;
      }
      mainContentLocation.x = this.glyphLocation.x + glyphStartWidth + this.contentSpace.left;
      this.width = this.glyphLocation.x + glyphBounds.width - loc.x;
      this.ascent = Math.max(
        glyphBounds.ascent, rootBounds.ascent + rootLocation.y,
      );
      this.descent = glyphBounds.descent;
    } else {
      mainContentLocation.x = rootLocation.x + rootLocation.width;
      this.width = rootBounds.width + this.contentSpace.left + contentBounds.width;
      this.ascent = Math.max(rootBounds.ascent, contentBounds.ascent);
      this.descent = Math.max(rootBounds.descent, contentBounds.descent);
    }
    this.height = this.ascent + this.descent;

    if (mainContent instanceof Elements) {
      mainContent.calcSize(mainContentLocation, scale);
    }
    if (root instanceof Elements) {
      root.calcSize(rootLocation, scale * this.rootScale);
    }
    this.glyphWidth = glyphBounds.width;
    this.glyphHeight = glyphBounds.height;

    this.glyphLocation.y = this.glyphLocation.y - glyphBounds.descent;
    if (radicalGlyph instanceof DiagramElement) {
      radicalGlyph.custom.setSize(
        this.glyphLocation,
        glyphBounds.width,
        glyphBounds.height,
      );
    }
  }
}
