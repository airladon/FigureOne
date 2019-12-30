// @flow
import {
  Point, getPoint,
} from '../../../../tools/g2';
import { Elements } from './Element';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';
import type { TypeParsablePoint } from '../../../../tools/g2';
import type {TypeAnnotation } from './Base'

import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { duplicateFromTo } from '../../../../tools/tools';
import { Element, Elements } from './Element';

export type TypeAnnotation = {
  xPosition: 'left' | 'center' | 'right' | number,
  yPosition: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  offset: TypeParsablePoint,
  scale: number,
  content: Elements,
  inSize: boolean,
};

export default class BaseEquationFunction extends Elements {
  contents: Array<Elements | null>;
  annotations: Array<TypeAnnotation>;
  glyphs: {
    left?: {
      glyph: DiagramElementPrimitive | ?DiagramElementCollection,
      annotations: Array<TypeAnnotation>,
      width: number,
      height: number,
      location: Point,
    },
    right?: {
      glyph: DiagramElementPrimitive | ?DiagramElementCollection,
      annotations: Array<TypeAnnotation>,
      width: number,
      height: number,
      location: Point,
    },
    bottom?: {
      glyph: DiagramElementPrimitive | ?DiagramElementCollection,
      annotations: Array<TypeAnnotation>,
      width: number,
      height: number,
      location: Point,
    },
    top?: {
      glyph: DiagramElementPrimitive | ?DiagramElementCollection,
      annotations: Array<TypeAnnotation>,
      width: number,
      height: number,
      location: Point,
    },
    encompass: {
      glyph: DiagramElementPrimitive | ?DiagramElementCollection,
      annotations: Array<TypeAnnotation>,
      width: number,
      height: number,
      location: Point,
    }
  };

  options: Object;

  constructor(
    content: Elements | null | Array<Elements | null>,
    annotations: Array<typeAnnotation>
    glyph: ?(DiagramElementPrimitive | DiagramElementCollection
      | Array<?DiagramElementPrimitive | ?DiagramElementCollection>),
    // inSize: boolean = true,
    options: Object,
  ) {
    const glyphElements = [];
    if (Array.isArray(glyph)) {
      glyph.forEach((g) => {
        glyphElements.push(g != null ? new Element(g) : null);
      });
    } else {
      glyphElements.push(glyph != null ? new Element(glyph) : null);
    }
    let glyphs = [];
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
    this.fullSize = null;
  }

  // getFullSize(useFullSize: boolean) {
  //   if (useFullSize && this.full != null) {
  //     return {
  //       width: this.fullBounds.width,
  //       height: this.fullBounds.height,
  //       ascent: this.fullBounds.ascent,
  //       descent: this.fullBounds.descent,
  //     };
  //   }
  //   return {
  //     width: this.width,
  //     height: this.height,
  //     ascent: this.ascent,
  //     descent: this.descent,
  //   };
  // }

  _dup(namedCollection?: Object) {
    const copyContent = this.contents.map(
      content => (content == null ? null : content._dup(namedCollection)),
    );
    let { glyphs } = this;
    // let copyGlyphs = [];
    if (namedCollection) {
      const newGlyphs = [];
      this.glyphs.forEach((g) => {
        if (g != null) {        // $FlowFixMe
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
    // this.location =
    // this.glyphLocations[] =
    // this.glyphHeights[] =
    // this.glyphWidths[] =
    // this.width =
    // this.ascent =
    // this.descent =
    // this.height =
  }
}


//                                 Top Glyph
//                    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
//                    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     Encompassing Glyph
//                                                        /
//                                                      /
//          GGG       GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG        GGG
//          GGG       GGG                           GGG        GGG
//          GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
//          GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
//   Left   GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG   Right
//   Glyph  GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG   Glyph
//          GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
//          GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
//          GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
//          GGG       GGG                           GGG        GGG
//          GGG       GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG        GGG
//
//
//                    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
//                    GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
//                              Bottom Glyph
//


//
//   |                          GGGGGGGGGGGGGGGGGGGGGGGG
//   |                          GGGGGGGGGGGGGGGGGGGGGGGG
//   |                          GGG                  GGG
//   |                          GGG                  GGG
//   |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
//   |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
//   |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
//   |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
//   |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
//   |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
//   |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
//   |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
//   | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
//   | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
//   | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
//   | |   |  |  | |   | |   |  GGG   |              GGG
//   | |   |  |  | |   | |   |  GGG   |              GGG
//   | |   |  |  | |   | |   |  GGGGGGGGGGGGGGGGGGGGGGGG
//   | |   |  |  | |   | |   |  GGGGGGGGGGGGGGGGGGGGGGGG
//   | |   |  |  | |   | |   |  |  |  |
//   | |   |  |  | |   | |   |  |  |--|<----  contentEncompassGlyph Space
//   | |   |  |  | |   | |   |  |
//   | |   |  |  | |   | |   |--|<----- EncompassGlyphAnnotation Space
//   | |   |  |  | |   | |
//   | |   |  |  | |   |-|<----- ContentAnnotationGlyphInsideAnnotation Space
//   | |   |  |  | |
//   | |   |  |  |-|<------- GlyphInsideAnnotationGlyph Space
//   | |   |  |
//   | |  >|--|<------ GlypgGlyphOutsideAnnotation Space
//   | |
//   |-|<------ Outside Space
//

//  this.glyphs: {
//    encompass: Symbol,
//    left: Symbol,
//    right: Symbol,
//    bottom: Symbol,
//    top: Symbol,
//  }
//
//  this.mainContent: Elements
//
//  annotations: [
//    {
//      xPosition: 'left' | 'center' | 'right' | number,
//      yPosition: 'bottom' | 'baseline' | 'middle' | 'top' | number,
//      xAlign: 'left' | 'center' | 'right' | number,
//      yAlign: 'bottom' | 'baseline' | 'middle' | 'top' | number,
//      offset: parsiblePoint,
//      scale: number,
//      content: Elements,
//      inSize,
//    },
//  ],
//
//  this.options: {
//    inSize: boolean,
//    useFullContent: boolean,
//    space: {
//      left: {
//        contentEncompassGlyph: number,
//        encompassGlyphAnnotation: number,
//        annotationGlyphInsideAnnotation: number,
//        glyphInsideAnnotationGlyph: number,
//        glyphGlyphOutsideAnnotation: number,
//        outside: number,
//      },
//    },
//    leftGlyph, rightGlyph: {
//      contentBottom: 'contentBottom' | 'contentBaseline' | 'minBottom'
//                     | 'minBaseline',
//      contentTop: 'contentTop' | 'maxTop' | 'maxBaseline',
//      minContentDescent: number,
//      minContentAscent: number,
//      height: number,
//      topSpace: number,
//      bottomSpace: number,
//      descent: number,
//      ascent: number,
//      yOffset: number,
//      annotations: []
//    },
//    topGlyph, bottomGlyph: {
//      minContentWidth: number,
//      leftSpace: number,
//      rightSpace: number,
//      width: number,
//      left: number,    // from x = 0
//      right: number,   // from x = 0
//      xOffset: number,
//      annotations: [],
//    },
//    encompassGlyph: {
//      annotations: [],
//    },
//  }

export default class BaseAnnotationFunction extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    // const [encompassGlyph, leftGlyph, bottomGlyph, rightGlyph, topGlyph] = this.glyphs;
    const [content, annotations] = this.contents;
    const {
      inSize, useFullContent,
    } = this.options;

    const maxBounds = new Bounds();

    const contentBounds = new Bounds();
    if (content != null) {
      content.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(content.getBounds(useFullContent));
      maxBounds.copyFrom(contentBounds);
      annotations.forEach((annotation) => {
        annotation.content.calc(loc._dup, scale * annotation.scale);
        this.setAnnotationPosition(content, loc, annotation);
        const annotationBounds = annotation.content.getBounds();
        maxBounds.growWithSameBaseline(annotationBounds);
      });
    }
    let xLocationOffset = 0;

    if (inSize) {
      this.width = maxBounds.width;
      this.ascent = maxBounds.ascent;
      this.descent = maxBounds.descent;
      this.height = maxBounds.height;
      xLocationOffset = loc.x - maxBounds.left;
    } else {
      this.width = contentBounds.width;
      this.ascent = contentBounds.ascent;
      this.descent = contentBounds.descent;
      this.height = contentBounds.height;
    }
    this.fullSize = {
      left: maxBounds.left - loc.x,
      width: maxBounds.width,
      ascent: maxBounds.ascent,
      descent: maxBounds.descent,
      height: maxBounds.height,
    };

    if (xLocationOffset !== 0 && content != null) {
      const locationOffset = new Point(xLocationOffset, 0);
      content.offsetLocation(locationOffset);
      annotations.forEach((annotation) => {
        annotation.content.offsetLocation(locationOffset);
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  setAnnotationPosition(
    contentToAnnotate: Elements,
    locationContentToAnnotate: Point,
    annotation: TypeAnnotation,
  ) {
    const {
      xPosition, yPosition, xAlign, yAlign, offset, content,
    } = annotation;

    let xPos;
    let yPos;

    if (xPosition === 'right') {
      xPos = 1;
    } else if (xPosition === 'center') {
      xPos = 0.5;
    } else if (typeof xPosition === 'number') {
      xPos = xPosition;
    } else {  // left
      xPos = 0;
    }
    xPos = xPos * contentToAnnotate.width + locationContentToAnnotate.x;

    if (yPosition === 'bottom') {
      yPos = 0;
    } else if (yPosition === 'middle') {
      yPos = 0.5;
    } else if (yPosition === 'top') {
      yPos = 1;
    } else if (typeof yPosition === 'number') {
      yPos = yPosition;
    } else {    // baseline
      yPos = contentToAnnotate.descent / contentToAnnotate.height;
    }
    yPos = yPos * contentToAnnotate.height + locationContentToAnnotate.y;

    if (xAlign === 'center') {
      xPos -= content.width * 0.5;
    } else if (xAlign === 'right') {
      xPos -= content.width;
    } else if (typeof xAlign === 'number') {
      xPos -= content.width * xAlign;
    }

    if (yAlign === 'bottom') {
      yPos += content.descent;
    } else if (yAlign === 'middle') {
      yPos = yPos + content.descent - content.height / 2;
    } else if (yAlign === 'top') {
      yPos -= content.ascent;
    }

    const offsetToUse = getPoint(offset);
    xPos += offsetToUse.x;
    yPos += offsetToUse.y;

    const locationOffset = (new Point(xPos, yPos)).sub(content.location);
    content.offsetLocation(locationOffset);
  }
}
