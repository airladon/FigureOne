// @flow
import {
  Point,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../../Element';
import { Element, Elements } from './Element';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // DiagramElementPrimatives or DiagramElementCollections and HTML Objects
// // and arranges their size in a )

export default class Fraction extends Elements {
  numerator: Elements;
  denominator: Elements;
  vSpaceNum: number;
  vSpaceDenom: number;
  lineWidth: number;
  lineVAboveBaseline: number;
  vinculum: DiagramElementPrimative | null | DiagramElementCollection;
  // mini: boolean;
  scaleModifier: number
  vinculumPosition: Point;
  vinculumScale: Point;

  constructor(
    numerator: Elements,
    denominator: Elements,
    vinculum: DiagramElementPrimative | null | DiagramElementCollection,
  ) {
    if (vinculum) {
      super([numerator, denominator, new Element(vinculum)]);
    } else {
      super([numerator, denominator]);
    }
    this.vinculum = vinculum;
    this.numerator = numerator;
    this.denominator = denominator;

    this.vSpaceNum = 0;
    this.vSpaceDenom = 0;
    this.lineVAboveBaseline = 0;
    this.lineWidth = 0;
    // this.mini = false;
    this.scaleModifier = 1;
    this.vinculumPosition = new Point(0, 0);
    this.vinculumScale = new Point(1, 0.01);
  }

  _dup(namedCollection?: Object) {
    let { vinculum } = this;
    if (this.vinculum != null && namedCollection) {
      vinculum = namedCollection[this.vinculum.name];
    }
    const fractionCopy = new Fraction(
      this.numerator._dup(namedCollection),
      this.denominator._dup(namedCollection),
      vinculum,
    );
    duplicateFromTo(this, fractionCopy, ['numerator', 'denominator', 'vinculum', 'content']);
    return fractionCopy;
  }

  calcSize(location: Point, incomingScale: number) {
    const scale = incomingScale * this.scaleModifier;
    this.location = location._dup();
    this.numerator.calcSize(location, scale);
    this.denominator.calcSize(location, scale);

    this.width = Math.max(this.numerator.width, this.denominator.width) * 1.3;

    const xNumerator = (this.width - this.numerator.width) / 2;
    const xDenominator = (this.width - this.denominator.width) / 2;
    this.vSpaceNum = scale * 0.05;
    this.vSpaceDenom = scale * 0.05;
    this.lineVAboveBaseline = scale * 0.07 / this.scaleModifier;
    this.lineWidth = Math.max(scale * 0.01, 0.008);

    const yNumerator = this.numerator.descent
                        + this.vSpaceNum + this.lineVAboveBaseline;

    const yDenominator = this.denominator.ascent
                         + this.vSpaceDenom - this.lineVAboveBaseline;

    const yScale = 1;

    const loc = this.location;
    this.numerator.calcSize(
      new Point(loc.x + xNumerator, loc.y + yScale * yNumerator),
      scale,
    );

    this.denominator.calcSize(
      new Point(loc.x + xDenominator, loc.y - yScale * yDenominator),
      scale,
    );

    this.descent = this.vSpaceNum + this.lineWidth / 2
                   - this.lineVAboveBaseline
                   + this.denominator.ascent + this.denominator.descent;
    if (this.descent < 0) {
      this.descent = 0;
    }
    this.ascent = this.vSpaceNum + this.lineWidth / 2
                  + this.lineVAboveBaseline + this.numerator.ascent
                  + this.numerator.descent;
    this.height = this.descent + this.ascent;

    const { vinculum } = this;
    if (vinculum) {
      this.vinculumPosition = new Point(
        this.location.x,
        this.location.y + this.lineVAboveBaseline,
      );
      this.vinculumScale = new Point(this.width, this.lineWidth);
      vinculum.transform.updateScale(this.vinculumScale);
      vinculum.transform.updateTranslation(this.vinculumPosition);

      vinculum.show();
    }
  }

  getAllElements() {
    let elements = [];
    if (this.numerator) {
      elements = [...elements, ...this.numerator.getAllElements()];
    }
    if (this.denominator) {
      elements = [...elements, ...this.denominator.getAllElements()];
    }
    if (this.vinculum) {
      elements = [...elements, this.vinculum];
    }
    return elements;
  }

  setPositions() {
    this.numerator.setPositions();
    this.denominator.setPositions();
    const { vinculum } = this;
    if (vinculum) {
      vinculum.transform.updateScale(this.vinculumScale);
      vinculum.transform.updateTranslation(this.vinculumPosition);
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.numerator.offsetLocation(offset);
    this.denominator.offsetLocation(offset);
    this.vinculumPosition = this.vinculumPosition.add(offset);
  }
}
