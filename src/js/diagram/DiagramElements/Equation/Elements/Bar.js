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

export default class Bar extends Elements {
  mainContent: Elements | null;
  glyph: DiagramElementPrimitive | DiagramElementCollection;
  glyphLocation: Point;
  glyphLength: number;
  side: 'left' | 'right' | 'top' | 'bottom';
  space: number;
  overhang: number | null;
  barLength: number | null;
  left: number | null;
  right: number | null;
  top: number | null;
  bottom: number | null;
  inSize: boolean;

  constructor(
    content: Elements | null,
    glyph: DiagramElementPrimitive | DiagramElementCollection,
    side: 'left' | 'right' | 'top' | 'bottom' = 'top',
    space: number = 0.03,
    overhang: number | null = 0,
    barLength: number | null = null,
    left: number | null = null,
    right: number | null = null,
    top: number | null = null,
    bottom: number | null = null,
    inSize: boolean = true,
  ) {
    const bar = glyph !== null ? new Element(glyph) : null;
    super([content, bar]);
    this.glyph = glyph;
    this.glyphLength = 1;
    this.mainContent = content;
    this.glyphLocation = new Point(0, 0);
    this.space = space;
    this.side = side;
    this.overhang = overhang;
    this.barLength = barLength;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.inSize = inSize;
  }

  _dup(namedCollection?: Object) {
    const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
    let { glyph } = this;
    if (glyph != null && namedCollection) {
      glyph = namedCollection[glyph.name];
    }
    const barCopy = new Bar(
      content,
      glyph,
    );
    duplicateFromTo(
      this, barCopy,
      ['content', 'glyph'],
    );
    return barCopy;
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.glyph) {
      elements = [...elements, this.glyph];
    }
    return elements;
  }

  setPositions() {
    const { glyph } = this;
    if (glyph != null) {
      const t = glyph.getTransform()._dup();
      t.updateTranslation(this.glyphLocation.x, this.glyphLocation.y);
      t.updateScale(this.glyphLength, this.glyphLength);
      glyph.setTransform(t);
    }
    if (this.mainContent) {
      this.mainContent.setPositions();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    const { glyph } = this;
    if (glyph != null) {
      this.glyphLocation = this.glyphLocation.add(offset);
    }
    if (this.mainContent) {
      this.mainContent.offsetLocation(offset);
    }
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentLoc = loc._dup();
    const glyphLoc = loc._dup();
    const contentBounds = new Bounds();
    // const originalContentBounds = new Bounds();
    const bounds = new Bounds();

    const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.width = mainContent.width;
      contentBounds.height = mainContent.ascent + mainContent.descent;
      contentBounds.ascent = mainContent.ascent;
      contentBounds.descent = mainContent.descent;
      bounds.width = mainContent.width;
      bounds.height = mainContent.height;
      bounds.ascent = mainContent.ascent;
      bounds.descent = mainContent.descent;
    }
    if (this.side === 'top' || this.side === 'bottom') {
      // Length
      // By default the length is the same width as the content
      this.glyphLength = contentBounds.width;

      // Overhand overrides the length
      if (this.overhang != null) {
        this.glyphLength = contentBounds.width + 2 * this.overhang;
      }

      // Bar length overrides the length
      if (this.barLength != null) {
        this.glyphLength = this.barLength;
      }

      // left or right have the highest priority for length
      if (this.left != null || this.right != null) {
        this.glyphLength = (this.left || 0) + contentBounds.width + (this.right || 0);
      }

      const glyphWidth = this.glyph.custom.getWidth(
        this.glyph.custom.type, this.glyph.custom.options, this.glyphLength,
      );

      // y Location
      if (this.side === 'bottom') {
        glyphLoc.y = loc.y - contentBounds.descent - this.space - glyphWidth;
      } else {
        glyphLoc.y = loc.y + contentBounds.ascent + this.space;
      }

      // x Location moves content if overhang is > 0, glyph if overhang < 0
      if (this.overhang != null) {
        if (this.overhang > 0) {
          contentLoc.x = loc.x + this.overhang;
        } else if (this.overhang < 0) {
          glyphLoc.x = loc.x - this.overhang;
        }
      }

      // x Location moves content if barLength > content width, glyph if smaller
      if (this.barLength != null) {
        if (this.barLength > contentBounds.width) {
          contentLoc.x = loc.x + (this.barLength - contentBounds.width) / 2;
        } else if (this.barLength < contentBounds.width) {
          glyphLoc.x = loc.x + (contentBounds.width - this.barLength) / 2;
        }
      }

      // If left > 0, then content moves, otherwise glyph does
      if (this.left) {
        if (this.left > 0) {
          contentLoc.x = loc.x + this.left;
        } else if (this.left < 0) {
          glyphLoc.x = loc.x - this.left;
        }
      }

      if (this.inSize) {
        bounds.width = Math.max(
          contentBounds.width,
          this.glyphLength,
        );
        if (this.side === 'top') {
          bounds.ascent = contentBounds.ascent + this.space + glyphWidth;
          bounds.descent = contentBounds.descent;
        }
        if (this.side === 'bottom') {
          bounds.ascent = contentBounds.ascent;
          bounds.descent = contentBounds.descent + this.space + glyphWidth;
        }
        bounds.height = bounds.ascent + bounds.descent;
        if (mainContent instanceof Elements) {
          mainContent.offsetLocation(contentLoc.sub(mainContent.location));
        }
      }
    } else {
      // Length is the content height by default
      this.glyphLength = contentBounds.height;

      // Positive overhang makes the glyph longer, negative shorter
      if (this.overhang != null) {
        this.glyphLength = contentBounds.height + 2 * this.overhang;
      }

      // bar length sets the length directly
      if (this.barLength != null) {
        this.glyphLength = this.barLength;
      }

      if (this.top != null || this.bottom != null) {
        this.glyphLength = (this.top || 0) + contentBounds.height + (this.bottom || 0);
      }

      const glyphWidth = this.glyph.custom.getWidth(
        this.glyph.custom.type, this.glyph.custom.options, this.glyphLength,
      );

      // Location
      if (this.side === 'left') {
        contentLoc.x = loc.x + glyphWidth + this.space;
        if (this.inSize === false) {
          glyphLoc.x = loc.x - this.space - glyphWidth;
        }
      } else {
        glyphLoc.x = loc.x + contentBounds.width + this.space;
      }
      glyphLoc.y = loc.y - contentBounds.descent;

      if (this.overhang) {
        glyphLoc.y = loc.y - contentBounds.descent - this.overhang;
      }
      if (this.barLength) {
        glyphLoc.y = loc.y - contentBounds.descent - (this.barLength - contentBounds.height) / 2;
      }

      if (this.bottom) {
        glyphLoc.y = loc.y - contentBounds.descent - this.bottom;
      }

      if (this.inSize) {
        bounds.width = contentBounds.width + this.space + glyphWidth;
        bounds.descent = Math.max(loc.y - glyphLoc.y, contentBounds.descent);
        bounds.ascent = Math.max(
          this.glyphLength - (loc.y - glyphLoc.y),
          contentBounds.ascent,
        );
        bounds.height = bounds.ascent + bounds.descent;
        if (mainContent instanceof Elements) {
          mainContent.offsetLocation(contentLoc.sub(mainContent.location));
        }
      }
    }
    this.width = bounds.width;
    this.height = bounds.height;
    this.ascent = bounds.ascent;
    this.descent = bounds.descent;
    this.glyphLocation = glyphLoc;
    this.glyph.custom.setSize(glyphLoc, this.glyphLength);
  }
}
