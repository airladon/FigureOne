
// @flow
import {
  Point,
} from '../../../../tools/g2';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';
// import Bounds from './Bounds';

export default class BaseEquationFunction extends Elements {
  contents: Array<Elements | null>;
  glyphs: Array<DiagramElementPrimitive | DiagramElementCollection | null>;
  glyphLocations: Array<Point>;
  glyphWidths: Array<number>;
  glyphHeights: Array<number>;
  // inSize: boolean;
  options: Object;

  constructor(
    content: Elements | null | Array<Elements | null>,
    glyph: DiagramElementPrimitive | null | DiagramElementCollection
      | Array<DiagramElementPrimitive | null | DiagramElementCollection>,
    // inSize: boolean = true,
    options: Object,
  ) {
    const glyphElements = [];
    if (Array.isArray(glyph)) {
      glyph.forEach((g) => {
        glyphElements.push(g !== null ? new Element(g) : null);
      });
    } else {
      glyphElements.push(glyph !== null ? new Element(glyph) : null);
    }
    const glyphs = [];
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
    // this.inSize = inSize;
  }

  _dup(namedCollection?: Object) {
    const copyContent = this.contents.map(
      content => (content == null ? null : content._dup(namedCollection)),
    );
    let { glyphs } = this;
    // let copyGlyphs = [];
    if (namedCollection) {
      const newGlyphs = [];
      this.glyphs.forEach((g) => {
        if (g != null) {
          newGlyphs.push(namedCollection[g.name]);
        } else {
          newGlyphs.push(g);
        }
      });
      glyphs = newGlyphs;
    }
    const copy = new this.constructor(
      copyContent,
      glyphs,
      // this.inSize,
      this.options,
    );
    duplicateFromTo(
      this, copy,
      ['content', 'contents', 'glyphs'],
    );
    return copy;
  }

  getAllElements() {
    let elements = [];
    this.contents.forEach((c) => {
      if (c != null) {
        elements = [...elements, ...c.getAllElements()];
      }
    });
    this.glyphs.forEach((g) => {
      if (g != null) {
        elements = [...elements, g];
      }
    });
    return elements;
  }

  setPositions() {
    this.glyphs.forEach((glyph, index) => {
      if (glyph != null) {
        const t = glyph.getTransform()._dup();
        t.updateTranslation(this.glyphLocations[index].x, this.glyphLocations[index].y);
        t.updateScale(this.glyphWidths[index], this.glyphHeights[index]);
        glyph.setTransform(t);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.setPositions();
      }
    });
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
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
  calcSize(location: Point, scale: number) {
  }
}
