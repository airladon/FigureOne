// @flow
import {
  Point, getPoint,
} from '../../../../tools/g2';
import { Elements } from './Element';
import Bounds from './Bounds';
// import BaseEquationFunction from './BaseEquationFunction';
// import type { TypeParsablePoint } from '../../../../tools/g2';
// import type {TypeAnnotation } from './Base'

import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { duplicateFromTo } from '../../../../tools/tools';
// import { Element, Elements } from './Element';

import type { ElementInterface } from './Element';

export type TypeAnnotation = {
  xPosition: 'left' | 'center' | 'right' | number,
  yPosition: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'baseline' | 'middle' | 'top' | number,
  offset: Point,
  scale: number,
  content: ElementInterface,
  inSize: boolean,
};

export type TypeAnnotatedGlyph = {
  glyph: DiagramElementPrimitive | DiagramElementCollection,
  // glyph: ElementInterface,
  annotations: Array<TypeAnnotation>,
  width: number,
  height: number,
  location: Point,
};

export type TypeEncompassGlyph = {
  space: number,
  leftSpace: number,
  bottomSpace: number,
  topSpace: number,
  rightSpace: number,
} & TypeAnnotatedGlyph;

export type TypeGlyphs = {
  left?: TypeAnnotatedGlyph;
  right?: TypeAnnotatedGlyph;
  top?: TypeAnnotatedGlyph;
  bottom?: TypeAnnotatedGlyph;
  encompass?: TypeEncompassGlyph;
};

// export type TypeGlyphsIn = {
//   left?: TypeAnnotatedGlyph;
//   right?: TypeAnnotatedGlyph;
//   top?: TypeAnnotatedGlyph;
//   bottom?: TypeAnnotatedGlyph;
//   encompass?: TypeEncompassGlyphIn;
// };

function copyAnnotation(annotation: TypeAnnotation, namedCollection?: Object) {
  return {
    xPosition: annotation.xPosition,
    yPosition: annotation.yPosition,
    xAlign: annotation.xAlign,
    yAlign: annotation.yAlign,
    offset: annotation.offset._dup(),
    scale: annotation.scale,
    content: annotation.content._dup(namedCollection),
    inSize: annotation.inSize,
  };
}

function copyAnnotations(
  annotations: Array<TypeAnnotation>,
  namedCollection?: Object,
) {
  const copy = [];
  annotations.forEach((annotation) => {
    copy.push(copyAnnotation(annotation, namedCollection));
  });
  return copy;
}

function copyGlyphs(
  glyphs: TypeGlyphs,
  namedCollection?: Object,
) {
  const copy = {};
  Object.keys(glyphs).forEach((key) => {
    if (glyphs[key] == null) {
      return {};
    }
    const glyph = glyphs[key];
    const copyGlyph = {};
    if (namedCollection != null) {
      copyGlyph.glyph = namedCollection[glyph.glyph.name];
    } else {
      copyGlyph.glyph = glyph.glyph;
    }
    copyGlyph.width = glyph.width;
    copyGlyph.height = glyph.height;
    copyGlyph.location = glyph.location;
    copyGlyph.annotations = copyAnnotations(glyph.annotations, namedCollection);
    copy[key] = copyGlyph;
  });
  return copy;
}

function getAllElementsFromAnnotations(annotations: Array<TypeAnnotation>) {
  let elements = [];
  annotations.forEach((annotation) => {
    elements = [...elements, ...annotation.content.getAllElements()];
  });
  return elements;
}

function getAllElementsFromGlyphs(glyphs: TypeGlyphs) {
  let elements = [];
  Object.keys(glyphs).forEach((key) => {
    const glyph = glyphs[key];
    if (glyph == null) {
      return [];
    }
    elements = [
      ...elements,
      glyph.glyph,
      ...getAllElementsFromAnnotations(glyph.annotations),
    ];
  });
  return elements;
}

function setPositionsForAnnotations(annotations: Array<TypeAnnotation>) {
  annotations.forEach((annotation) => {
    annotation.content.setPositions();
  });
}

function offsetLocationForAnnotations(annotations: Array<TypeAnnotation>, offset: Point) {
  annotations.forEach((annotation) => {
    annotation.content.offsetLocation(offset);
  });
}

function setPositionsForGlyphs(glyphs: TypeGlyphs) {
  Object.keys(glyphs).forEach((key) => {
    if (glyphs[key] == null) {
      return;
    }
    const glyph = glyphs[key];
    const t = glyph.glyph.transform._dup();
    t.updateScale(glyph.width, glyph.height);
    t.updateTranslation(glyph.location.x, glyph.location.y);
    glyph.glyph.setTransform(t);
    setPositionsForAnnotations(glyph.annotations);
  });
}

function offsetLocationForGlyphs(glyphs: TypeGlyphs, offset: Point) {
  Object.keys(glyphs).forEach((key) => {
    if (glyphs[key] == null) {
      return;
    }
    const glyph = glyphs[key];
    glyph.location = glyph.location.add(offset);
    offsetLocationForAnnotations(glyph.annotations, offset);
  });
}

export default class BaseAnnotationFunction implements ElementInterface {
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  scale: number;
  fullSize: {
    leftOffset: number,
    width: number,
    descent: number,
    ascent: number,
    height: number,
  };

  content: ElementInterface;
  annotations: Array<TypeAnnotation>;
  glyphs: TypeGlyphs;
  options: Object;

  constructor(
    content: ElementInterface,
    annotations: Array<TypeAnnotation>,
    glyphs: TypeGlyphs,
    options: Object,
  ) {
    // const elements = [content];
    // annotations.forEach((annotation) => {
    //   elements.push(annotation.content);
    // });
    // Object.keys(glyphs).forEach((key) => {
    //   const glyphPosition = glyphs[key];
    //   const glyphElement = new Element(glyphPosition.glyph);
    //   elements.push(glyphElement);
    //   glyphPosition.annotations.forEach((annotation) => {
    //     elements.push(annotation.content);
    //   });
    // });
    // super(elements);
    this.glyphs = glyphs;
    this.content = content;
    this.annotations = annotations;
    this.options = options;
    // console.log(this.glyphs)
  }

  _dup(namedCollection?: Object) {
    const contentCopy = this.content._dup(namedCollection);
    const glyphsCopy = copyGlyphs(this.glyphs);
    const annotationsCopy = copyAnnotations(this.annotations);
    const copy = new this.constructor(
      contentCopy, annotationsCopy, glyphsCopy, this.options,
    );
    duplicateFromTo(
      this, copy,
      ['content', 'glyphs', 'annotations'],
    );
    return copy;
  }

  getAllElements() {
    return [
      ...this.content.getAllElements(),
      ...getAllElementsFromAnnotations(this.annotations),
      ...getAllElementsFromGlyphs(this.glyphs),
    ];
  }

  setPositions() {
    this.content.setPositions();
    setPositionsForAnnotations(this.annotations);
    setPositionsForGlyphs(this.glyphs);
    // Object.keys(this.glyphs).forEach((key) => {
    //   const glyph = this.glpyhs[key];

    // });
    // // setPositionsForGlyphs(this.glyphs);
    // this.glyphs.forEach((glyph, index) => {
    //   if (glyph != null) {
    //     const t = glyph.getTransform()._dup();
    //     t.updateTranslation(this.glyphLocations[index].x, this.glyphLocations[index].y);
    //     t.updateScale(this.glyphWidths[index], this.glyphHeights[index]);
    //     glyph.setTransform(t);
    //   }
    // });
    // this.contents.forEach((content) => {
    //   if (content != null) {
    //     content.setPositions();
    //   }
    // });
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.content.offsetLocation(offset);
    offsetLocationForAnnotations(this.annotations, offset);
    offsetLocationForGlyphs(this.glyphs, offset);
    // this.glyphLocations.forEach((glyphLocation, index) => {
    //   if (this.glyphs[index] != null) {
    //     this.glyphLocations[index] = glyphLocation.add(offset);
    //   }
    // });
    // this.contents.forEach((content) => {
    //   if (content != null) {
    //     content.offsetLocation(offset);
    //   }
    // });
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    // const [encompassGlyph, leftGlyph, bottomGlyph, rightGlyph, topGlyph] = this.glyphs;
    const { content, annotations } = this;
    const {
      inSize, useFullContent, space, topSpace, bottomSpace, leftSpace, rightSpace,
    } = this.options;
    const maxBounds = new Bounds();

    const contentBounds = new Bounds();
    content.calcSize(loc._dup(), scale);
    contentBounds.copyFrom(content.getBounds(useFullContent));
    maxBounds.copyFrom(contentBounds);
    annotations.forEach((annotation) => {
      annotation.content.calcSize(loc, scale * annotation.scale);
      this.setAnnotationPosition(content, loc, annotation);
      const annotationBounds = annotation.content.getBounds();
      maxBounds.growWithSameBaseline(annotationBounds);
    });

    const encompassBounds = this.setEncompassGlyph(scale, contentBounds);
    maxBounds.growWithSameBaseline(encompassBounds);

    const leftBounds = this.setVerticalGlyph(scale, contentBounds, 'left');
    maxBounds.growWithSameBaseline(leftBounds);
    const rightBounds = this.setVerticalGlyph(scale, contentBounds, 'right');
    maxBounds.growWithSameBaseline(rightBounds);

    const topBounds = this.setHorizontalGlyph(scale, contentBounds, 'top');
    maxBounds.growWithSameBaseline(topBounds);
    const bottomBounds = this.setHorizontalGlyph(scale, contentBounds, 'bottom')
    maxBounds.growWithSameBaseline(bottomBounds);

    let xLocationOffset = 0;

    const topSpaceToUse = (topSpace != null ? topSpace : (space || 0)) * scale;
    const bottomSpaceToUse = (bottomSpace != null ? bottomSpace : (space || 0)) * scale;
    const leftSpaceToUse = (leftSpace != null ? leftSpace : (space || 0)) * scale;
    const rightSpaceToUse = (rightSpace != null ? rightSpace : (space || 0)) * scale;
    maxBounds.offset(topSpaceToUse, rightSpaceToUse, -bottomSpaceToUse, -leftSpaceToUse);

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
      leftOffset: maxBounds.left - loc.x,
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
      Object.keys(this.glyphs).forEach((key) => {
        const glyph = this.glyphs[key];
        if (glyph == null) {
          return;
        }
        glyph.location = glyph.location.add(locationOffset);
        glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
        glyph.annotations.forEach((annotation) => {
          annotation.content.offsetLocation(locationOffset);
        });
      });
    }
  }

  setEncompassGlyph(scale: number, contentBoundsIn: Bounds) {
    if (this.glyphs.encompass == null) {
      return contentBoundsIn;
    }
    const {
      leftSpace, rightSpace, bottomSpace, topSpace, space,
    } = this.glyphs.encompass;
    const glyph = this.glyphs.encompass;
    const left = leftSpace != null ? leftSpace : space;
    const right = rightSpace != null ? rightSpace : space;
    const top = topSpace != null ? topSpace : space;
    const bottom = bottomSpace != null ? bottomSpace : space;
    const contentBounds = new Bounds();
    contentBounds.copyFrom(contentBoundsIn);
    contentBounds.offset(top, right, -left, -bottom);
    const glyphBounds = glyph.glyph.custom.getBounds(
      glyph.glyph.custom.options,
      contentBounds.left,
      contentBounds.bottom,
      contentBounds.width,
      contentBounds.height,
    );
    const totalBounds = new Bounds();
    totalBounds.copyFrom(glyphBounds);
    glyph.width = glyphBounds.width;
    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, glyph.location, annotation);
      const annotationBounds = annotation.content.getBounds();
      totalBounds.growWithSameBaseline(annotationBounds);
    });
    return totalBounds;
  }

  setVerticalGlyph(scale: number, contentBounds: Bounds, glyphName: 'left' | 'right') {
    if (this.glyphs[glyphName] == null) {
      return contentBounds;
    }
    const {
      space, overhang, topSpace, bottomSpace, minContentHeight,
      minContentDescent, minContentAscent,
      descent, height,
    } = this.glyphs[glyphName];
    const glyph = this.glyphs[glyphName];
    // const contentBounds = new Bounds();

    // contentBounds.copyFrom(contentBounds);
    let glyphHeight = contentBounds.height;
    let glyphLeft = contentBounds.left;
    let glyphBottom = contentBounds.bottom;
    // let glyphTop = contentBounds.top;
    let glyphDescent = contentBounds.descent;
    let glyphAscent = contentBounds.ascent;

    if (minContentDescent != null) {
      glyphDescent = Math.max(minContentDescent, glyphDescent);
      glyphHeight = contentBounds.ascent + glyphDescent;
    }
    if (minContentAscent != null) {
      glyphAscent = Math.max(minContentAscent, glyphAscent);
      glyphHeight = glyphAscent + glyphDescent;
    }
    if (minContentHeight != null) {
      glyphAscent = -glyphDescent
                             + Math.max(minContentHeight, glyphHeight);
    }
    const topSpaceToUse = topSpace != null ? topSpace : overhang;
    const bottomSpaceToUse = bottomSpace != null ? bottomSpace : overhang;
    glyphDescent += scale * bottomSpaceToUse;
    if (descent != null) {
      glyphDescent = descent;
    }
    glyphAscent += scale * topSpaceToUse;
    glyphHeight = glyphDescent + glyphAscent;
    if (height != null) {
      glyphHeight = height;
      glyphAscent = glyphHeight - glyphDescent;
    }

    glyphBottom = contentBounds.bottom
                           - (glyphDescent - contentBounds.descent);

    // glyphTop = contentBoundsIn.top + (glyphAscent - contentBoundsIn.ascent);

    // glyphLeft = contentBounds.left;
    if (glyphName === 'left') {
      glyphLeft -= space * scale;
    } else {
      glyphLeft = contentBounds.left + contentBounds.width + space * scale;
    }

    // let glyphBottom = contentBounds.bottom;
    if (descent == null && bottomSpace == null && height != null) {
      glyphBottom = contentBounds.bottom + contentBounds.height / 2 - height / 2;
    }

    const glyphBounds = glyph.glyph.getBounds(
      glyph.glyph.custom.options,
      glyphLeft,
      glyphBottom,
      null,
      glyphHeight,
      glyphName,
    );

    const totalBounds = new Bounds();
    totalBounds.copyFrom(contentBounds);
    totalBounds.growWithSameBaseline(glyphBounds);

    glyph.width = glyphBounds.width;
    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, glyph.location, annotation);
      const annotationBounds = annotation.content.getBounds();
      totalBounds.growWithSameBaseline(annotationBounds);
    });
    return totalBounds;
  }

  setHorizontalGlyph(scale: number, contentBoundsIn: Bounds, glyphName: 'top' | 'bottom') {
    if (this.glyphs[glyphName] == null) {
      return contentBoundsIn;
    }
    const {
      space, overhang, width, leftSpace, rightSpace,
    } = this.glyphs[glyphName];

    const glyph = this.glyphs[glyphName];
    const contentBounds = new Bounds();
    contentBounds.copyFrom(contentBoundsIn);
    let glyphLength = contentBounds.width;
    let glyphLeft = contentBounds.left;
    if (overhang != null) {
      glyphLength += 2 * overhang * scale;
      glyphLeft = contentBounds.left - overhang * scale;
    }
    if (width != null) {
      glyphLength = width * scale;
    }

    if (leftSpace != null || rightSpace != null) {
      glyphLength = (leftSpace * scale || 0) + contentBounds.width + (rightSpace * scale || 0);
      if (leftSpace != null) {
        glyphLeft = contentBounds.left - leftSpace * scale;
      }
    }

    if (leftSpace == null && rightSpace == null && width != null) {
      glyphLeft = contentBounds.left + (contentBounds.width - width) / 2;
    } else if (leftSpace == null && rightSpace != null && width != null) {
      glyphLeft = contentBounds.right + rightSpace * scale - width;
    }
    let glyphBottom;
    if (glyphName === 'top') {
      glyphBottom = contentBounds.top + space * scale;
    } else {
      glyphBottom = contentBounds.bottom - space * scale;
    }

    const glyphBounds = glyph.glyph.getBounds(
      glyph.glyph.custom.options,
      glyphLeft,
      glyphBottom,
      glyphLength,
      null,
      glyphName,
    );

    const totalBounds = new Bounds();
    totalBounds.copyFrom(contentBounds);
    totalBounds.growWithSameBaseline(glyphBounds);
    glyph.width = glyphBounds.width;

    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, glyph.location, annotation);
      const annotationBounds = annotation.content.getBounds();
      totalBounds.growWithSameBaseline(annotationBounds);
    });
    return totalBounds;
  }

  // eslint-disable-next-line class-methods-use-this
  setAnnotationPosition(
    contentToAnnotate: ElementInterface | Bounds,
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
    yPos = yPos * contentToAnnotate.height
           + locationContentToAnnotate.y - contentToAnnotate.descent;

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

  getBounds(useFullSize: boolean = false) {
    if (useFullSize && this.fullSize != null) {
      return new Bounds({
        left: this.location.x + this.fullSize.leftOffset,
        right: this.location.x + this.fullSize.leftOffset + this.fullSize.width,
        top: this.location.y + this.fullSize.ascent,
        bottom: this.location.y - this.fullSize.descent,
        width: this.fullSize.width,
        height: this.fullSize.height,
        ascent: this.fullSize.ascent,
        descent: this.fullSize.descent,
      });
    }
    return new Bounds({
      left: this.location.x,
      right: this.location.x + this.width,
      top: this.location.y + this.ascent,
      bottom: this.location.y - this.descent,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    });
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

