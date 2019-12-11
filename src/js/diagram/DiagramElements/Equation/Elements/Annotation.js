// @flow
import {
  Point,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import { Elements } from './Element';

export class AnnotationInformation {
  content: Elements;
  xPosition: 'left' | 'right' | 'center' | number;
  yPosition: 'bottom' | 'top' | 'middle' | 'baseline' | number;
  xAlign: 'left' | 'right' | 'center' | number;
  yAlign: 'bottom' | 'top' | 'middle' | 'baseline' | number;
  annotationScale: number;
  xOffset: number;
  yOffset: number;

  constructor(
    content: Elements,
    xPosition: 'left' | 'right' | 'center' | number | null = 'right',
    yPosition: 'bottom' | 'top' | 'middle' | 'baseline' | number | null = 'top',
    xAlign: 'left' | 'right' | 'center' | number | null = 'left',
    yAlign: 'bottom' | 'top' | 'middle' | 'baseline' | number | null = 'bottom',
    annotationScale: number | null = 0.5,
    xOffset: number = 0,
    yOffset: number = 0,
  ) {
    this.content = content;
    this.xPosition = xPosition == null ? 'right' : xPosition;
    this.yPosition = yPosition == null ? 'top' : yPosition;
    this.xAlign = xAlign == null ? 'left' : xAlign;
    this.yAlign = yAlign == null ? 'bottom' : yAlign;
    this.annotationScale = annotationScale == null ? 0.5 : annotationScale;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }
}

// Create an annotation to a set of Elements
// x/yPosition: annotation location relative to mainContent
// x/yAlign: annotation alignment relative to its location
// Position and Align can be words or numbers where:
//    left: 0
//    right: 1
//    center: 0.5
//    bottom: 0
//    top: 1
//    middle: 0.5
//    baseline: descent / height
//    numbers can be anything (not just between 0 and 1)
//      For example, xPosition of -1 would position the annotation
//      one mainContent width to the left of the mainContent left point
export class Annotation extends Elements {
  mainContent: Elements;
  annotations: Array<AnnotationInformation>;
  xPosition: 'left' | 'right' | 'center' | number;
  yPosition: 'bottom' | 'top' | 'middle' | 'baseline' | number;
  xAlign: 'left' | 'right' | 'center' | number;
  yAlign: 'bottom' | 'top' | 'middle' | 'baseline' | number;
  annotationInSize: boolean;
  annotationScale: number;
  xOffset: number;
  yOffset: number;

  constructor(
    mainContent: Elements,
    annotationOrAnnotationArray: Elements | Array<AnnotationInformation>,
    xPositionOrAnnotationInSize: 'left' | 'right' | 'center' | number | boolean = 'right',
    yPosition: 'bottom' | 'top' | 'middle' | 'baseline' | number = 'top',
    xAlign: 'left' | 'right' | 'center' | number = 'left',
    yAlign: 'bottom' | 'top' | 'middle' | 'baseline' | number = 'bottom',
    annotationScale: number = 0.5,
    annotationInSize: boolean = false,
    xOffset: number = 0,
    yOffset: number = 0,
  ) {
    if (Array.isArray(annotationOrAnnotationArray)) {
      const annotationElements = [mainContent];
      annotationOrAnnotationArray.forEach((annotationInfo) => {
        annotationElements.push(annotationInfo.content);
      });
      super(annotationElements);
    } else {
      super([mainContent, annotationOrAnnotationArray]);
    }
    // super([mainContent, annotation]);
    this.mainContent = mainContent;
    this.annotations = [];
    if (Array.isArray(annotationOrAnnotationArray)) {
      this.annotations = annotationOrAnnotationArray;
      if (typeof xPositionOrAnnotationInSize === 'boolean') {
        this.annotationInSize = xPositionOrAnnotationInSize;
      } else {
        this.annotationInSize = false;
      }
    } else {
      let xPosition = 'right';
      if (typeof xPositionOrAnnotationInSize !== 'boolean') {
        xPosition = xPositionOrAnnotationInSize;
      }
      this.annotations = [new AnnotationInformation(
        annotationOrAnnotationArray,
        xPosition,
        yPosition,
        xAlign,
        yAlign,
        annotationScale,
        xOffset,
        yOffset,
      )];
      this.annotationInSize = annotationInSize;
    }
  }

  _dup(namedCollection?: Object) {
    // const annotationsCopy = [];
    const annotationsCopy =
      this.annotations.map(annotationInfo => new AnnotationInformation(
        annotationInfo.content._dup(namedCollection),
        annotationInfo.xPosition,
        annotationInfo.yPosition,
        annotationInfo.xAlign,
        annotationInfo.yAlign,
        annotationInfo.annotationScale,
        annotationInfo.xOffset,
        annotationInfo.yOffset,
      ));
    const annotationCopy = new Annotation(
      this.mainContent._dup(namedCollection),
      annotationsCopy,
      this.annotationInSize,
    );
    duplicateFromTo(this, annotationCopy, ['mainContent', 'annotations']);
    return annotationCopy;
  }

  calcSize(location: Point, incomingScale: number) {
    this.location = location._dup();
    this.mainContent.calcSize(location, incomingScale);
    let minX = this.mainContent.location.x;
    let minY = this.mainContent.location.y - this.mainContent.descent;
    let maxX = this.mainContent.location.x + this.mainContent.width;
    let maxY = this.mainContent.location.y + this.mainContent.ascent;
    this.annotations.forEach((annotationInfo) => {
      const annotation = annotationInfo.content;
      const {
        xPosition, yPosition, xAlign,
        yAlign, annotationScale,
      } = annotationInfo;
      const annotationXOffset = annotationInfo.xOffset;
      const annotationYOffset = annotationInfo.yOffset;
      annotation.calcSize(location, incomingScale * annotationScale);

      const annotationLoc = this.location._dup();
      let xPos = 0;
      let yPos = this.mainContent.descent / this.mainContent.height;
      if (xPosition === 'right') {
        xPos = 1;
      } else if (xPosition === 'center') {
        xPos = 0.5;
      } else if (typeof xPosition === 'number') {
        xPos = xPosition;
      }
      annotationLoc.x += this.mainContent.width * xPos;

      if (yPosition === 'bottom') {
        yPos = 0;
      } else if (yPosition === 'top') {
        yPos = 1;
      } else if (yPosition === 'middle') {
        yPos = 0.5;
      } else if (typeof yPosition === 'number') {
        yPos = yPosition;
      }

      annotationLoc.y += -this.mainContent.descent + this.mainContent.height * yPos;

      let xOffset = 0;
      let yOffset = annotation.descent / annotation.height;
      if (xAlign === 'right') {
        xOffset = 1;
      } else if (xAlign === 'center') {
        xOffset = 0.5;
      } else if (typeof xAlign === 'number') {
        xOffset = xAlign;
      }

      if (yAlign === 'bottom') {
        yOffset = 0;
      } else if (yAlign === 'top') {
        yOffset = 1;
      } else if (yAlign === 'middle') {
        yOffset = 0.5;
      } else if (typeof yAlign === 'number') {
        yOffset = yAlign;
      }

      const annotationOffset = new Point(
        -xOffset * annotation.width + annotationXOffset * incomingScale,
        annotation.descent - yOffset * annotation.height + annotationYOffset * incomingScale,
      );

      annotation.calcSize(annotationLoc, incomingScale * annotationScale);
      annotation.offsetLocation(annotationOffset);

      const annotationMaxX = annotation.location.x + annotation.width;
      const annotationMaxY = annotation.location.y + annotation.ascent;
      const annotationMinX = annotation.location.x;
      const annotationMinY = annotation.location.y - annotation.descent;
      maxX = annotationMaxX > maxX ? annotationMaxX : maxX;
      maxY = annotationMaxY > maxY ? annotationMaxY : maxY;
      minX = annotationMinX < minX ? annotationMinX : minX;
      minY = annotationMinY < minY ? annotationMinY : minY;
    });

    if (this.annotationInSize) {
      const bottomLeft = new Point(minX, minY);
      const topRight = new Point(maxX, maxY);
      this.width = topRight.x - bottomLeft.x;
      this.ascent = topRight.y - this.mainContent.location.y;
      this.descent = this.mainContent.location.y - bottomLeft.y;

      const xOffset = this.mainContent.location.x - bottomLeft.x;
      if (xOffset) {
        this.mainContent.offsetLocation(new Point(xOffset, 0));
        this.annotations.forEach(
          annotationInfo => annotationInfo.content
            .offsetLocation(new Point(xOffset, 0)),
        );
      }
    } else {
      this.width = this.mainContent.width;
      this.ascent = this.mainContent.ascent;
      this.descent = this.mainContent.descent;
    }
    this.height = this.descent + this.ascent;
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    this.annotations.forEach((annotationInfo) => {
      elements = [...elements, ...annotationInfo.content.getAllElements()];
    });
    return elements;
  }

  setPositions() {
    this.mainContent.setPositions();
    this.annotations.forEach((annotationInfo) => {
      annotationInfo.content.setPositions();
    });
    // this.annotation.setPositions();
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.mainContent.offsetLocation(offset);
    this.annotations.forEach((annotationInfo) => {
      annotationInfo.content.offsetLocation(offset);
    });
    // this.annotation.offsetLocation(offset);
  }
}
