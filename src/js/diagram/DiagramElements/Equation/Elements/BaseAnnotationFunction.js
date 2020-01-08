// @flow
import {
  Point, getPoint,
} from '../../../../tools/g2';
// import { Elements } from './Element';
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
  fullContentBounds: boolean,
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
    duplicateFromTo(glyph, copyGlyph, ['glyph', 'annotations']);
    if (namedCollection != null) {
      copyGlyph.glyph = namedCollection[glyph.glyph.name];
    } else {
      copyGlyph.glyph = glyph.glyph;
    }
    // copyGlyph.width = glyph.width;
    // copyGlyph.height = glyph.height;
    // copyGlyph.location = glyph.location;
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
    this.glyphs = glyphs;
    this.content = content;
    this.annotations = annotations;
    this.options = options;
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
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.content.offsetLocation(offset);
    offsetLocationForAnnotations(this.annotations, offset);
    offsetLocationForGlyphs(this.glyphs, offset);
  }


  //                               Top Glyph
  //                  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
  //                  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG     Encompassing Glyph
  //                                                      /
  //                                                    /
  //        GGG       GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG        GGG
  //        GGG       GGG                           GGG        GGG
  //        GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
  //        GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
  // Left   GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG   Right
  // Glyph  GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG   Glyph
  //        GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
  //        GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
  //        GGG       GGG     CCCCCCCCCCCCCCCCC     GGG        GGG
  //        GGG       GGG                           GGG        GGG
  //        GGG       GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG        GGG
  //
  //
  //                  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
  //                  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
  //                            Bottom Glyph
  //
  //
  //
  //
  // |                          GGGGGGGGGGGGGGGGGGGGGGGG
  // |                          GGGGGGGGGGGGGGGGGGGGGGGG
  // |                          GGG                  GGG
  // |                          GGG                  GGG
  // |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
  // |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
  // |        GGG               GGG   CCCCCCCCCCCC   GGG               GGG
  // |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
  // |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
  // |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
  // |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
  // |  AAA   GGG   AAA   AAA   GGG   CCCCCCCCCCCC   GGG   AAA   AAA   GGG   AAA
  // | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
  // | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
  // | |   |  GGG  |   | |   |  GGG   CCCCCCCCCCCC   GGG               GGG
  // | |   |  |  | |   | |   |  GGG   |              GGG
  // | |   |  |  | |   | |   |  GGG   |              GGG
  // | |   |  |  | |   | |   |  GGGGGGGGGGGGGGGGGGGGGGGG
  // | |   |  |  | |   | |   |  GGGGGGGGGGGGGGGGGGGGGGGG
  // | |   |  |  | |   | |   |  |  |  |
  // | |   |  |  | |   | |   |  |  |--|<----  contentEncompassGlyph Space
  // | |   |  |  | |   | |   |  |
  // | |   |  |  | |   | |   |--|<----- EncompassGlyphAnnotation Space
  // | |   |  |  | |   | |
  // | |   |  |  | |   |-|<----- ContentAnnotationGlyphInsideAnnotation Space
  // | |   |  |  | |
  // | |   |  |  |-|<------- GlyphInsideAnnotationGlyph Space
  // | |   |  |
  // | |  >|--|<------ GlypgGlyphOutsideAnnotation Space
  // | |
  // |-|<------ Outside Space


  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    // const [encompassGlyph, leftGlyph, bottomGlyph, rightGlyph, topGlyph] = this.glyphs;
    const { content, annotations } = this;
    const {
      inSize, space, topSpace, bottomSpace, leftSpace, rightSpace,
      contentScale, useFullBounds, fullContentBounds,
    } = this.options;
    const inSizeBounds = new Bounds();
    const fullBounds = new Bounds();

    const contentBounds = new Bounds();
    content.calcSize(loc._dup(), scale * contentScale);
    contentBounds.copyFrom(content.getBounds(fullContentBounds));
    inSizeBounds.copyFrom(contentBounds);
    fullBounds.copyFrom(contentBounds);
    annotations.forEach((annotation) => {
      annotation.content.calcSize(loc, scale * annotation.scale);
      this.setAnnotationPosition(contentBounds, annotation, scale);
      const annotationBounds = annotation.content.getBounds();
      inSizeBounds.growWithSameBaseline(annotationBounds);
      const fullSizeAnnotationBounds = annotation.content.getBounds(true);
      fullBounds.growWithSameBaseline(fullSizeAnnotationBounds);
    });
    const [encompassBounds, encompassFullBounds] = this.setEncompassGlyph(scale, contentBounds);
    inSizeBounds.growWithSameBaseline(encompassBounds);
    fullBounds.growWithSameBaseline(encompassFullBounds);

    const [leftBounds, leftFullBounds] = this.setVerticalGlyph(scale, contentBounds, 'left');
    inSizeBounds.growWithSameBaseline(leftBounds);
    fullBounds.growWithSameBaseline(leftFullBounds);
    const [rightBounds, rightFullBounds] = this.setVerticalGlyph(scale, contentBounds, 'right');
    inSizeBounds.growWithSameBaseline(rightBounds);
    fullBounds.growWithSameBaseline(rightFullBounds);

    const [topBounds, topFullBounds] = this.setHorizontalGlyph(scale, contentBounds, 'top');
    inSizeBounds.growWithSameBaseline(topBounds);
    fullBounds.growWithSameBaseline(topFullBounds);

    const [bottomBounds, bottomFullBounds] = this.setHorizontalGlyph(scale, contentBounds, 'bottom');
    inSizeBounds.growWithSameBaseline(bottomBounds);
    fullBounds.growWithSameBaseline(bottomFullBounds);

    let xLocationOffset = 0;

    const topSpaceToUse = (topSpace != null ? topSpace : (space || 0)) * scale;
    const bottomSpaceToUse = (bottomSpace != null ? bottomSpace : (space || 0)) * scale;
    const leftSpaceToUse = (leftSpace != null ? leftSpace : (space || 0)) * scale;
    const rightSpaceToUse = (rightSpace != null ? rightSpace : (space || 0)) * scale;
    inSizeBounds.offset(topSpaceToUse, rightSpaceToUse, -bottomSpaceToUse, -leftSpaceToUse);
    fullBounds.growWithSameBaseline(inSizeBounds);

    if (useFullBounds) {
      inSizeBounds.copyFrom(fullBounds);
    }

    if (inSize) {
      this.width = inSizeBounds.width;
      this.ascent = inSizeBounds.ascent;
      this.descent = inSizeBounds.descent;
      this.height = inSizeBounds.height;
      xLocationOffset = loc.x - inSizeBounds.left;
    } else {
      this.width = contentBounds.width;
      this.ascent = contentBounds.ascent;
      this.descent = contentBounds.descent;
      this.height = contentBounds.height;
    }
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
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
      const fullBounds = new Bounds();
      fullBounds.copyFrom(contentBoundsIn);
      return [contentBoundsIn, fullBounds];
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
    contentBounds.offset(top, right, -bottom, -left);
    const glyphBounds = glyph.glyph.getBounds(
      glyph.glyph.custom.options,
      contentBounds.left,
      contentBounds.bottom,
      contentBounds.width,
      contentBounds.height,
    );
    const inSizeBounds = new Bounds();
    const fullBounds = new Bounds();
    inSizeBounds.copyFrom(contentBounds);
    inSizeBounds.growWithSameBaseline(glyphBounds);
    fullBounds.copyFrom(inSizeBounds);
    glyph.width = glyphBounds.width;
    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, annotation, scale);
      const annotationBounds = annotation.content.getBounds();
      inSizeBounds.growWithSameBaseline(annotationBounds);
      const fullAnnotationBounds = annotation.content.getBounds(true);
      fullBounds.growWithSameBaseline(fullAnnotationBounds);
    });
    return [inSizeBounds, fullBounds];
  }

  setVerticalGlyph(scale: number, contentBounds: Bounds, glyphName: 'left' | 'right') {
    if (this.glyphs[glyphName] == null) {
      const fullBounds = new Bounds();
      fullBounds.copyFrom(contentBounds);
      return [contentBounds, fullBounds];
    }
    const {
      space, overhang, topSpace, bottomSpace, minContentHeight,
      minContentDescent, minContentAscent,
      descent, height, yOffset,
      annotationsOverContent,
    } = this.glyphs[glyphName];

    const glyph = this.glyphs[glyphName];
    // const contentBounds = new Bounds();
    // contentBounds.copyFrom(contentBounds);
    let glyphHeight = contentBounds.height;
    let contentX = contentBounds.left;
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
      contentX -= space * scale;
    } else {
      contentX = contentBounds.left + contentBounds.width + space * scale;
    }

    // let glyphBottom = contentBounds.bottom;
    if (descent == null && bottomSpace == null && height != null) {
      glyphBottom = contentBounds.bottom + contentBounds.height / 2 - height / 2;
    }

    const glyphBounds = glyph.glyph.getBounds(
      glyph.glyph.custom.options,
      contentX,
      glyphBottom + yOffset,
      null,
      glyphHeight,
      glyphName,
    );

    // const totalBounds = new Bounds();
    const inSizeBounds = new Bounds();
    const fullBounds = new Bounds();
    inSizeBounds.copyFrom(contentBounds);
    inSizeBounds.growWithSameBaseline(glyphBounds);
    fullBounds.copyFrom(inSizeBounds);
    const glyphAndAnnotationBounds = new Bounds();
    glyphAndAnnotationBounds.copyFrom(glyphBounds);
    glyph.width = glyphBounds.width;
    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, annotation, scale);
      const annotationBounds = annotation.content.getBounds();
      inSizeBounds.growWithSameBaseline(annotationBounds);
      glyphAndAnnotationBounds.growWithSameBaseline(annotationBounds);
      const fullAnnotationBounds = annotation.content.getBounds(true);
      fullBounds.growWithSameBaseline(fullAnnotationBounds);
    });

    let xOffset = 0;
    if (glyphName === 'left'
      && glyphAndAnnotationBounds.right > contentX
      && annotationsOverContent === false
    ) {
      xOffset = contentX - glyphAndAnnotationBounds.right;
    }
    if (glyphName === 'right'
      && glyphAndAnnotationBounds.left < contentX
      && annotationsOverContent === false
    ) {
      xOffset = contentX - glyphAndAnnotationBounds.left;
    }
    if (xOffset !== 0) {
      const locationOffset = new Point(xOffset, 0);
      glyph.location = glyph.location.add(locationOffset);
      glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
      glyph.annotations.forEach((annotation) => {
        annotation.content.offsetLocation(locationOffset);
      });
      inSizeBounds.left += xOffset;
      inSizeBounds.right = Math.max(inSizeBounds.right + xOffset, contentBounds.right);
      fullBounds.left += xOffset;
      fullBounds.right = Math.max(inSizeBounds.right + xOffset, contentBounds.right);
    }
    // console.log(inSizeBounds.left, inSizeBounds.width)
    return [inSizeBounds, fullBounds];
  }

  setHorizontalGlyph(scale: number, contentBoundsIn: Bounds, glyphName: 'top' | 'bottom') {
    if (this.glyphs[glyphName] == null) {
      const fullBounds = new Bounds();
      fullBounds.copyFrom(contentBoundsIn);
      return [contentBoundsIn, fullBounds];
    }
    const {
      space, overhang, width, leftSpace, rightSpace, xOffset,
      annotationsOverContent,
    } = this.glyphs[glyphName];

    const glyph = this.glyphs[glyphName];
    const contentBounds = new Bounds();
    contentBounds.copyFrom(contentBoundsIn);
    let glyphLength = contentBounds.width;
    let contentX = contentBounds.left;
    if (overhang != null) {
      glyphLength += 2 * overhang * scale;
      contentX = contentBounds.left - overhang * scale;
    }
    if (width != null) {
      glyphLength = width * scale;
    }

    if (leftSpace != null || rightSpace != null) {
      glyphLength = (leftSpace * scale || 0) + contentBounds.width + (rightSpace * scale || 0);
      if (leftSpace != null) {
        contentX = contentBounds.left - leftSpace * scale;
      }
    }

    if (leftSpace == null && rightSpace == null && width != null) {
      contentX = contentBounds.left + (contentBounds.width - width) / 2;
    } else if (leftSpace == null && rightSpace != null && width != null) {
      contentX = contentBounds.right + rightSpace * scale - width;
    }
    let contentY;
    if (glyphName === 'top') {
      contentY = contentBounds.top + space * scale;
    } else {
      contentY = contentBounds.bottom - space * scale;
    }

    const glyphBounds = glyph.glyph.getBounds(
      glyph.glyph.custom.options,
      contentX + xOffset,
      contentY,
      glyphLength,
      null,
      glyphName,
    );

    const inSizeBounds = new Bounds();
    const fullBounds = new Bounds();
    inSizeBounds.copyFrom(contentBounds);
    inSizeBounds.growWithSameBaseline(glyphBounds);
    fullBounds.copyFrom(inSizeBounds);

    const glyphAndAnnotationBounds = new Bounds();
    glyphAndAnnotationBounds.copyFrom(glyphBounds);
    glyph.width = glyphBounds.width;

    glyph.height = glyphBounds.height;
    glyph.location = new Point(glyphBounds.left, glyphBounds.bottom);
    glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
    glyph.annotations.forEach((annotation) => {
      annotation.content.calcSize(glyph.location, scale * annotation.scale);
      this.setAnnotationPosition(glyphBounds, annotation, scale);
      const annotationBounds = annotation.content.getBounds();
      inSizeBounds.growWithSameBaseline(annotationBounds);
      glyphAndAnnotationBounds.growWithSameBaseline(annotationBounds);
      const fullAnnotationBounds = annotation.content.getBounds(true);
      fullBounds.growWithSameBaseline(fullAnnotationBounds);
    });

    let yOffset = 0;
    if (glyphName === 'top'
      && glyphAndAnnotationBounds.bottom < contentY
      && annotationsOverContent === false
    ) {
      yOffset = contentY - glyphAndAnnotationBounds.bottom;
    }
    if (glyphName === 'bottom'
      && glyphAndAnnotationBounds.top > contentY
      && annotationsOverContent === false
    ) {
      yOffset = contentY - glyphAndAnnotationBounds.top;
    }

    if (yOffset !== 0) {
      const locationOffset = new Point(0, yOffset);
      glyph.location = glyph.location.add(locationOffset);
      glyph.glyph.custom.setSize(glyph.location, glyph.width, glyph.height);
      glyph.annotations.forEach((annotation) => {
        annotation.content.offsetLocation(locationOffset);
      });
      inSizeBounds.top += yOffset;
      inSizeBounds.bottom += yOffset;
      fullBounds.top += yOffset;
      fullBounds.bottom += yOffset;
    }
    return [inSizeBounds, fullBounds];
  }

  // eslint-disable-next-line class-methods-use-this
  setAnnotationPosition(
    contentToAnnotateBounds: Bounds,
    annotation: TypeAnnotation,
    scale: number,
  ) {
    let {
      xPosition, yPosition, xAlign, yAlign, offset,
    } = annotation;
    const { content, fullContentBounds } = annotation;
    const locationContentToAnnotate = new Point(
      contentToAnnotateBounds.left,
      contentToAnnotateBounds.bottom + contentToAnnotateBounds.descent,
    );
    let xPos;
    let yPos;
    if (contentToAnnotateBounds.annotations != null
      && annotation.reference != null) {
      const reference = contentToAnnotateBounds.annotations[annotation.reference];
      if (reference.xPosition != null) {
        ({ xPosition } = reference);
      }
      if (reference.yPosition != null) {
        ({ yPosition } = reference);
      }
      if (reference.xAlign != null) {
        ({ xAlign } = reference);
      }
      if (reference.yAlign != null) {
        ({ yAlign } = reference);
      }
      if (reference.offset != null) {
        offset.add(reference.offset);
      }
    }
    if (xPosition === 'right') {
      xPos = 1;
    } else if (xPosition === 'center') {
      xPos = 0.5;
    } else if (typeof xPosition === 'number') {
      xPos = xPosition;
    } else {  // left
      xPos = 0;
    }
    xPos = xPos * contentToAnnotateBounds.width + locationContentToAnnotate.x;

    if (yPosition === 'bottom') {
      yPos = 0;
    } else if (yPosition === 'middle') {
      yPos = 0.5;
    } else if (yPosition === 'top') {
      yPos = 1;
    } else if (typeof yPosition === 'number') {
      yPos = yPosition;
    } else if (typeof yPosition === 'string' && yPosition.slice(-1)[0] === 'a') {
      const ascentPercentage = parseFloat(yPosition);
      const ascentPercentHeight = contentToAnnotateBounds.ascent / contentToAnnotateBounds.height;
      const descentPercentHeight = contentToAnnotateBounds.descent / contentToAnnotateBounds.height;
      yPos = ascentPercentHeight * ascentPercentage + descentPercentHeight;
    } else {    // baseline
      yPos = contentToAnnotateBounds.descent / contentToAnnotateBounds.height;
    }
    yPos = yPos * contentToAnnotateBounds.height
           + locationContentToAnnotate.y - contentToAnnotateBounds.descent;

    const contentBounds = content.getBounds(fullContentBounds);
    if (xAlign === 'center') {
      xPos -= contentBounds.width * 0.5;
    } else if (xAlign === 'right') {
      xPos -= contentBounds.width;
    } else if (typeof xAlign === 'number') {
      xPos -= contentBounds.width * xAlign;
    }

    if (yAlign === 'bottom') {
      yPos += contentBounds.descent;
    } else if (yAlign === 'middle') {
      yPos = yPos + contentBounds.descent - contentBounds.height / 2;
    } else if (yAlign === 'top') {
      yPos -= contentBounds.ascent;
    } else if (typeof yAlign === 'string' && yAlign.slice(-1)[0] === 'a') {
      const ascentPercentage = parseFloat(yAlign);
      yPos -= contentBounds.ascent * ascentPercentage;
    } else if (typeof yAlign === 'number') {
      yPos += contentBounds.descent - contentBounds.height * yAlign;
    }

    const offsetToUse = getPoint(offset);
    xPos += offsetToUse.x * scale;
    yPos += offsetToUse.y * scale;

    const locationOffset = (new Point(xPos, yPos)).sub(contentBounds.left, contentBounds.bottom + contentBounds.descent);
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
