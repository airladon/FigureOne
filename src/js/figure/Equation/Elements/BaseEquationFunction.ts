import {
  Point,
} from '../../../tools/g2';
import { duplicateFromTo } from '../../../tools/tools';
import { Element, Elements, lineagePath } from './Element';
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
  // Optional caller-supplied identifier, assigned post-dispatch by
  // EquationFunctions.eqnMethod. Has no layout effect; used by
  // Equation.getFunctionElements to look up the contents of a sub-tree.
  functionName: string | null;
  // The name of the equation function that created this node (`frac`, `scale`
  // ...), assigned by EquationFunctions when the function is created (whether
  // dispatched from a phrase or called directly). Used to build the lineage of
  // the elements this function positions.
  functionType: string | null;
  // Names of the content and glyph slots of this function, in the order they
  // are held in `contents` and `glyphs` (`['numerator', 'denominator']` for a
  // fraction). Assigned by EquationFunctions. When a slot has no name, its
  // index is used instead.
  contentNames: Array<string> | null;
  glyphNames: Array<string> | null;

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
    this.functionName = null;
    this.functionType = null;
    this.contentNames = null;
    this.glyphNames = null;
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

  // The lineage recorded on the elements below this function is extended by
  // this function's name, and then by the name of the slot each child sits in.
  override setPositions(form: string | null = null, path: string = '') {
    const base = form == null ? '' : lineagePath(path, this.functionType);
    this.glyphs.forEach((glyph, index) => {
      if (glyph != null) {
        const t = glyph.getTransform()._dup();
        t.updateTranslation([this.glyphLocations[index].x, this.glyphLocations[index].y]);
        t.updateScale([this.glyphWidths[index], this.glyphHeights[index]]);
        glyph.setTransform(t);
        if (form != null) {
          const name = this.slotName(this.glyphNames, index, this.glyphs.length, 'symbol');
          glyph.positionedBy = { form, with: lineagePath(base, name) };
        }
      }
    });
    this.contents.forEach((content, index) => {
      if (content != null) {
        const name = form == null
          ? null
          : this.slotName(this.contentNames, index, this.contents.length, null);
        content.setPositions(form, lineagePath(base, name));
      }
    });
  }

  // The name of the slot at `index`. A function's only slot takes the generic
  // name it was given - `null` for content (there is nothing to disambiguate,
  // so it adds nothing to the lineage) and `symbol` for a glyph. Unnamed slots
  // of a multi-slot function are identified by their index.
  // eslint-disable-next-line class-methods-use-this
  slotName(
    names: Array<string> | null, index: number, length: number, singleName: string | null,
  ) {
    if (names != null && names[index] != null) {
      return names[index];
    }
    return length === 1 ? singleName : `${index}`;
  }

  override setColor(colorIn: TypeColor | null = null, from: string | null = null) {
    let color: TypeColor | null = null;
    // An explicit `color` function supplies its own `this.color`; re-stamp the
    // provenance to null so this color is treated as an explicit command and is
    // not ignored by a child that ignores the 'form' default cascade.
    let nextFrom = from;
    if (this.color != null) {
      color = this.color;
      nextFrom = null;
    } else if (colorIn != null) {
      color = colorIn;
    }
    this.glyphs.forEach((glyph) => {
      if (glyph != null && color != null) {
        glyph.setColor(color, true, nextFrom);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.setColor(color, nextFrom);
      }
    });
  }

  override setOpacity(opacityIn: number | null = null) {
    let opacity = opacityIn;
    if (this.opacity != null) {
      opacity = (opacity == null ? 1 : opacity) * this.opacity;
    }
    this.glyphs.forEach((glyph) => {
      if (glyph != null && opacity != null) {
        glyph.setOpacity(opacity);
      }
    });
    this.contents.forEach((content) => {
      if (content != null) {
        content.setOpacity(opacity);
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
