
// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class SimpleIntegral extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const contentBounds = new Bounds();
    const originalContentBounds = new Bounds();
    const glyphBounds = new Bounds();
    const {
      minContentDescent, minContentHeight, descent, height,
      topSpace, bottomSpace, space, inSize,
    } = this.options;
    const [glyph] = this.glyphs;
    const [mainContent] = this.contents;
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent);
      originalContentBounds.copyFrom(mainContent);
    }

    // Calculation of descent and height needs to be done in this order to
    // to preserve precedence (larger number overrides smaller number):
    //    1. minContentDescent
    //    2. descent
    //
    //    1. Height based on bracket descent, to content ascent
    //    2. height
    if (minContentDescent != null) {
      contentBounds.descent = Math.max(minContentDescent, contentBounds.descent);
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let glyphDescent = contentBounds.descent + scale * bottomSpace;
    if (descent != null) {
      glyphDescent = descent;
    }

    if (minContentHeight != null) {
      contentBounds.ascent = -contentBounds.descent + Math.max(
        minContentHeight, contentBounds.height,
      );
      contentBounds.height = contentBounds.ascent + contentBounds.descent;
    }

    let totHeight = glyphDescent + contentBounds.ascent + topSpace * scale;
    if (height != null) {
      totHeight = height;
    }
    this.glyphHeights[0] = totHeight;
    this.glyphWidths[0] = totHeight * 0.5;

    let glyphLocation = new Point(
      loc.x,
      loc.y - glyphDescent,
    );
    if (glyph != null) {
      if (inSize === false) {
        glyphLocation = new Point(
          loc.x - space * scale
          // - glyph.custom.getWidth(glyph.custom.type, glyph.custom.options, totHeight),
          - this.glyphWidths[0],
          loc.y - glyphDescent,
        );
      }
      glyph.showAll();
      glyph.transform.updateScale(
        totHeight,
        totHeight,
      );
      glyph.transform.updateTranslation(
        glyphLocation.x,
        glyphLocation.y,
      );
      this.glyphLocations[0] = glyphLocation;
      // glyphBounds.width = glyph.custom.getWidth(
      //   glyph.custom.type, glyph.custom.options, totHeight,
      // );
      [glyphBounds.width] = this.glyphWidths;
      glyphBounds.height = totHeight;
      glyphBounds.ascent = totHeight - glyphDescent;
      glyphBounds.descent = glyphDescent;
    }
    const contentLocation = new Point(
      this.location.x + glyphBounds.width + space * scale,
      this.location.y,
    );
    if (glyph == null) {
      contentLocation.x = location.x;
    }

    if (mainContent != null && inSize) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    if (inSize) {
      this.width = glyphBounds.width + originalContentBounds.width
        + space * scale;
      if (glyph == null) {
        this.width -= space * scale;
      }
      this.ascent = Math.max(
        glyphBounds.height - glyphDescent,
        originalContentBounds.ascent,
      );
      this.descent = Math.max(glyphDescent, originalContentBounds.descent);
      this.height = this.descent + this.ascent;
    } else {
      this.width = originalContentBounds.width;
      this.ascent = originalContentBounds.ascent;
      this.descent = originalContentBounds.descent;
      this.height = originalContentBounds.height;
    }

    if (glyph) {
      glyph.custom.setSize(this.glyphLocations[0], totHeight);
    }
  }
}

// export default class Brackets extends Elements {
//   mainContent: Elements | null;
//   glyph: DiagramElementPrimitive | DiagramElementCollection | null;
//   glyphLocation: Point;
//   glyphWidth: number;
//   glyphHeight: number;
//   space: number;
//   topSpace: number;
//   bottomSpace: number;
//   minContentHeight: number | null;
//   minContentDescent: number | null;
//   height: number | null;
//   descent: number | null;
//   inSize: boolean;

//   constructor(
//     content: Elements | null,
//     glyph: DiagramElementPrimitive | null | DiagramElementCollection,
//     space: number = 0.05,
//     topSpace: number = 0.05,
//     bottomSpace: number = 0.05,
//     minContentHeight: number | null = null,
//     minContentDescent: number | null = null,
//     height: number | null = null,
//     descent: number | null = null,
//     inSize: boolean = true,
//   ) {
//     const glyphElement = glyph !== null ? new Element(glyph) : null;
//     super([glyphElement, content]);
//     this.glyph = glyph;
//     this.mainContent = content;
//     this.glyphLocation = new Point(0, 0);
//     // this.glyphScale = 1;
//     this.glyphWidth = 1;
//     this.glyphHeight = 1;
//     this.space = space;
//     this.topSpace = topSpace;
//     this.bottomSpace = bottomSpace;
//     this.minContentHeight = minContentHeight;
//     this.minContentDescent = minContentDescent;
//     this.height = height;
//     this.descent = descent;
//     // this.heightScale = heightScale;
//     this.inSize = inSize;
//   }

//   _dup(namedCollection?: Object) {
//     const content = this.mainContent == null ? null : this.mainContent._dup(namedCollection);
//     let { glyph } = this;
//     if (this.glyph != null && namedCollection) {
//       glyph = namedCollection[this.glyph.name];
//     }
//     const copy = new Brackets(
//       content,
//       glyph,
//     );
//     duplicateFromTo(
//       this, copy,
//       ['content', 'glyph'],
//     );
//     return copy;
//   }

//   getAllElements() {
//     let elements = [];
//     if (this.mainContent) {
//       elements = [...elements, ...this.mainContent.getAllElements()];
//     }
//     if (this.glyph) {
//       elements = [...elements, this.glyph];
//     }
//     return elements;
//   }

//   setPositions() {
//     const { glyph } = this;
//     if (glyph != null) {
//       const t = glyph.getTransform()._dup();
//       t.updateTranslation(this.glyphLocation.x, this.glyphLocation.y);
//       t.updateScale(this.glyphWidth, this.glyphHeight);
//       glyph.setTransform(t);
//     }

//     if (this.mainContent) {
//       this.mainContent.setPositions();
//     }
//   }

//   offsetLocation(offset: Point = new Point(0, 0)) {
//     this.location = this.location.add(offset);
//     const { glyph } = this;
//     if (glyph != null) {
//       this.glyphLocation = this.glyphLocation.add(offset);
//     }
//     if (this.mainContent) {
//       this.mainContent.offsetLocation(offset);
//     }
//     // console.log(this.glyph.getPosition()._dup(), this.rightGlyph.getPosition()._dup());
//   }

//   calcSize(location: Point, scale: number) {
//     this.location = location._dup();
//     const loc = location._dup();
//     const contentBounds = new Bounds();
//     const originalContentBounds = new Bounds();
//     const glyphBounds = new Bounds();

//     const { mainContent } = this;
//     if (mainContent instanceof Elements) {
//       mainContent.calcSize(loc._dup(), scale);
//       contentBounds.copyFrom(mainContent);
//       originalContentBounds.copyFrom(mainContent);
//     }

//     // Calculation of descent and height needs to be done in this order to
//     // to preserve precedence (larger number overrides smaller number):
//     //    1. minContentDescent
//     //    2. descent
//     //
//     //    1. Height based on bracket descent, to content ascent
//     //    2. height
//     if (this.minContentDescent != null) {
//       contentBounds.descent = Math.max(this.minContentDescent, contentBounds.descent);
//       contentBounds.height = contentBounds.ascent + contentBounds.descent;
//     }

//     let glyphDescent = contentBounds.descent + scale * this.bottomSpace;
//     if (this.descent != null) {
//       glyphDescent = this.descent;
//     }
//     if (this.minContentHeight != null) {
//       contentBounds.ascent = -contentBounds.descent + Math.max(
//         this.minContentHeight, contentBounds.height,
//       );
//       contentBounds.height = contentBounds.ascent + contentBounds.descent;
//     }

//     let height = glyphDescent + contentBounds.ascent + this.topSpace * scale;
//     if (this.height != null) {
//       height = this.height;
//     }
//     this.glyphHeight = height;

//     let glyphLocation = new Point(
//       loc.x,
//       loc.y - glyphDescent,
//     );

//     const { glyph } = this;
//     if (glyph != null) {
//       if (this.inSize === false) {
//         glyphLocation = new Point(
//           loc.x - this.space * scale - glyph.custom.getWidth(
//             glyph.custom.type, glyph.custom.options, height,
//           ),
//           loc.y - glyphDescent,
//         );
//       }
//       glyph.showAll();
//       glyph.transform.updateScale(
//         height,
//         height,
//       );
//       glyph.transform.updateTranslation(
//         glyphLocation.x,
//         glyphLocation.y,
//       );
//       this.glyphLocation = glyphLocation;
//       glyphBounds.width = glyph.custom.getWidth(
//         glyph.custom.type, glyph.custom.options, height,
//       );
//       glyphBounds.height = height;
//       glyphBounds.ascent = height - glyphDescent;
//       glyphBounds.descent = glyphDescent;
//     }

//     const contentLocation = new Point(
//       this.location.x + glyphBounds.width + this.space * scale,
//       this.location.y,
//     );
//     if (this.glyph == null) {
//       contentLocation.x = this.location.x;
//     }

//     if (mainContent instanceof Elements && this.inSize) {
//       mainContent.offsetLocation(contentLocation.sub(mainContent.location));
//     }

//     if (this.inSize) {
//       this.width = glyphBounds.width + originalContentBounds.width
//         + this.space * scale;
//       if (this.glyph == null) {
//         this.width -= this.space * scale;
//       }
//       this.ascent = Math.max(
//         glyphBounds.height - glyphDescent,
//         originalContentBounds.ascent,
//       );
//       this.descent = Math.max(glyphDescent, originalContentBounds.descent);
//       this.height = this.descent + this.ascent;
//     } else {
//       this.width = originalContentBounds.width;
//       this.ascent = originalContentBounds.ascent;
//       this.descent = originalContentBounds.descent;
//       this.height = originalContentBounds.height;
//     }

//     if (glyph) {
//       glyph.custom.setSize(this.glyphLocation, height);
//     }
//   }
// }
