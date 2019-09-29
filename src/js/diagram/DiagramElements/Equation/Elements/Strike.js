// @flow
import {
  Point, Line,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { Element, Elements } from './Element';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // DiagramElementPrimitives or DiagramElementCollections and HTML Objects
// // and arranges their size in a )

export default class Strike extends Elements {
  mainContent: Elements;
  strike: DiagramElementPrimitive | null | DiagramElementCollection;
  scaleModifier: number;
  lineWidth: number;
  strikeScale: Point;
  strikeRotation: number;
  strikePosition: Point;
  strikeInSize: boolean;
  space: number;

  constructor(
    mainContent: Elements,
    strike: DiagramElementPrimitive | null | DiagramElementCollection,
    strikeInSize: ?boolean = false,
    space: ?number = 0,
  ) {
    if (strike) {
      super([mainContent, new Element(strike)]);
    } else {
      super([mainContent]);
    }
    this.strike = strike;
    this.scaleModifier = 1;
    this.lineWidth = 0.1;
    this.mainContent = mainContent;
    if (strikeInSize == null) {
      this.strikeInSize = false;
    } else {
      this.strikeInSize = strikeInSize;
    }
    this.space = space == null ? 0 : space;
  }

  _dup(namedCollection?: Object) {
    let strike = null;
    if (this.strike != null && namedCollection) {
      strike = namedCollection[this.strike.name];
    } else {
      ({ strike } = this);
    }
    const strikeCopy = new Strike(
      this.mainContent._dup(namedCollection),
      strike,
    );
    duplicateFromTo(this, strikeCopy, ['strike', 'mainContent']);
    return strikeCopy;
  }

  calcSize(location: Point, incomingScale: number) {
    const scale = incomingScale * this.scaleModifier;
    this.location = location._dup();
    this.mainContent.calcSize(location, scale);
    this.lineWidth = scale * 0.02;
    const lineExtension = this.lineWidth * 1;
    const bottomLeft = new Point(
      location.x,
      location.y - this.mainContent.descent,
    );
    const topRight = new Point(
      location.x + this.mainContent.width,
      location.y + this.mainContent.ascent * 0.8,
    );
    const strikeLine = new Line(bottomLeft, topRight);
    const strikeBottomLeft = new Line(
      bottomLeft, lineExtension,
      strikeLine.angle() + Math.PI,
    ).getPoint(2);

    const strikeLength = strikeLine.length() + lineExtension * 2;
    if (this.strikeInSize) {
      const strikeTopRight = new Line(
        topRight, lineExtension,
        strikeLine.angle(),
      ).getPoint(2);
      this.width = strikeTopRight.x - strikeBottomLeft.x;
      this.ascent = Math.max(
        this.mainContent.ascent,
        strikeTopRight.y - location.y,
      ) + this.space;
      this.descent = Math.max(
        this.mainContent.descent,
        location.y - strikeBottomLeft.y,
      ) + this.space;
      const xOffset = this.mainContent.location.x - strikeBottomLeft.x;
      this.mainContent.offsetLocation(new Point(xOffset, 0));
      strikeBottomLeft.x += xOffset;
    } else {
      this.width = this.mainContent.width;
      this.ascent = this.mainContent.ascent + this.space;
      this.descent = this.mainContent.descent + this.space;
    }
    this.height = this.descent + this.ascent;

    const { strike } = this;
    if (strike) {
      if (strike instanceof DiagramElementCollection) {
        this.strikePosition = strikeBottomLeft._dup();
        this.strikeScale = new Point(strikeLength, this.lineWidth * 0.8);
        this.strikeRotation = strikeLine.angle();
        const width = this.strikeScale.x * Math.cos(this.strikeRotation);
        // $FlowFixMe
        strike._s1.transform.updateScale(this.strikeScale);
        // $FlowFixMe
        strike._s1.transform.updateTranslation(this.strikePosition);
        // $FlowFixMe
        strike._s1.transform.updateRotation(this.strikeRotation);
        // $FlowFixMe
        strike._s2.transform.updateScale(this.strikeScale);
        // $FlowFixMe
        strike._s2.transform.updateTranslation(this.strikePosition.add(width, 0));
        // $FlowFixMe
        strike._s2.transform.updateRotation(Math.PI - this.strikeRotation);
        strike.showAll();
      } else {
        this.strikePosition = strikeBottomLeft._dup();
        this.strikeScale = new Point(strikeLength, this.lineWidth);
        this.strikeRotation = strikeLine.angle();
        strike.transform.updateScale(this.strikeScale);
        strike.transform.updateTranslation(this.strikePosition);
        strike.transform.updateRotation(this.strikeRotation);
        strike.show();
      }
    }
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.strike) {
      elements = [...elements, this.strike];
    }
    return elements;
  }

  setPositions() {
    this.mainContent.setPositions();
    const { strike } = this;
    if (strike) {
      if (strike instanceof DiagramElementCollection) {
        const width = this.strikeScale.x * Math.cos(this.strikeRotation);
        // $FlowFixMe
        strike._s1.transform.updateScale(this.strikeScale);
        // $FlowFixMe
        strike._s1.transform.updateTranslation(this.strikePosition);
        // $FlowFixMe
        strike._s1.transform.updateRotation(this.strikeRotation);
        // $FlowFixMe
        strike._s2.transform.updateScale(this.strikeScale);
        // $FlowFixMe
        strike._s2.transform.updateTranslation(this.strikePosition.add(width, 0));
        // $FlowFixMe
        strike._s2.transform.updateRotation(Math.PI - this.strikeRotation);
      } else {
        strike.transform.updateScale(this.strikeScale);
        strike.transform.updateTranslation(this.strikePosition);
        strike.transform.updateRotation(this.strikeRotation);
      }
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.mainContent.offsetLocation(offset);
    this.strikePosition = this.strikePosition.add(offset);
  }
}
