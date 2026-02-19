import {
  Point,
} from '../../../tools/g2';
import { duplicateFromTo } from '../../../tools/tools';
import { Element, Elements } from './Element';
import Symbol from '../Symbols/SymbolNew';
import type { TypeColor } from '../../../tools/types';

export default class BaseEquationFunction extends Elements {
  contents: Array<Elements | null>;
  glyphs: Array<Symbol | null | undefined>;
  glyphLocations: Array<Point>;
  glyphWidths: Array<number>;
  glyphHeights: Array<number>;
  override showContent: boolean;
  options: Record<string, any>;

  constructor(
    content: Elements | null | Array<Elements | null>,
    glyph: Symbol | null | undefined
      | Array<Symbol | null | undefined>,
    options: Record<string, any>,
    showContent: boolean = true,
  ) {
    const glyphElements: Array<Element | null> = [];
    if (Array.isArray(glyph)) {
      glyph.forEach((g) => {
        glyphElements.push(g != null ? new Element(g) : null);
      });
    } else {
      glyphElements.push(glyph != null ? new Element(glyph) : null);
    }
    let glyphs: Array<Symbol | null | undefined> = [];
    if (Array.isArray(glyph)) {
      glyphs = glyph;
    } else {
      glyphs.push(glyph);
    }

    let contentArray: Array<Elements | null> = [];
    if (Array.isArray(content)) {
      contentArray = content;
    } else {
      contentArray.push(content);
    }
    super([...glyphElements, ...contentArray]);
    this.glyphs = glyphs;
    this.contents = contentArray;
    this.glyphLocations = glyphElements.map(() => new Point(0, 0));
    this.glyphWidths = glyphElements.map(() => 1);
    this.glyphHeights = glyphElements.map(() => 1);
    this.options = options;
    this.showContent = showContent;
  }

  override _dup(namedCollection?: Record<string, any>) {
    const copyContent = this.contents.map(
      content => (content == null ? null : content._dup(namedCollection)),
    );
    let { glyphs } = this;
    if (namedCollection) {
      const newGlyphs: Array<Symbol | null | undefined> = [];
      this.glyphs.forEach((g) => {
        if (g != null) {
          newGlyphs.push(namedCollection[g.name]);
        } else {
          newGlyphs.push(g);
        }
      });
      glyphs = newGlyphs;
    }
    const copy = new (this.constructor as any)(
      copyContent,
      glyphs,
      this.options,
    );
    duplicateFromTo(
      this, copy,
      ['content', 'contents', 'glyphs'],
    );
    return copy;
  }

  override getAllElements(includeHidden: boolean = true) {
    if (!includeHidden && !this.showContent) {
      return [];
    }
    let elements: Array<any> = [];
    this.contents.forEach((c) => {
      if (c != null) {
        elements = [...elements, ...c.getAllElements(includeHidden)];
      }
    });
    this.glyphs.forEach((g) => {
      if (g != null) {
        elements = [...elements, g];
      }
    });
    return elements;
  }

  override setPositions() {
    this.glyphs.forEach((glyph, index) => {
      if (glyph != null) {
        const t = glyph.getTransform()._dup();
        t.updateTranslation([this.glyphLocations[index].x, this.glyphLocations[index].y]);
        t.updateScale([this.glyphWidths[index], this.glyphHeights[index]]);
        glyph.setTransform(t);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.setPositions();
      }
    });
  }

  override setColor(colorIn: TypeColor | null = null) {
    let color: TypeColor | null = null;
    if (this.color != null) {
      color = this.color;
    } else if (colorIn != null) {
      color = colorIn;
    }
    this.glyphs.forEach((glyph) => {
      if (glyph != null && color != null) {
        glyph.setColor(color);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.setColor(color);
      }
    });
  }

  override offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.glyphLocations.forEach((glyphLocation, index) => {
      if (this.glyphs[index] != null) {
        this.glyphLocations[index] = glyphLocation.add(offset);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.offsetLocation(offset);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  override calcSize(location: Point, scale: number) {
  }
}
