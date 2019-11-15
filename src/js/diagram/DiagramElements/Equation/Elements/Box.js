// @flow
import {
  Point, Rect,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';
import { Element, Elements } from './Element';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // DiagramElementPrimitives or DiagramElementCollections and HTML Objects
// // and arranges their size in a )

type TypeBoxElement = {
  lineWidth?: number,
  setSize: (Rect) => void,
};

export default class Box extends Elements {
  mainContent: Elements;
  box: TypeBoxElement & DiagramElementPrimitive | null
    | TypeBoxElement & DiagramElementCollection;

  scaleModifier: number;
  lineWidth: number;
  boxWidth: number;
  boxHeight: number;
  // boxScale: Point;
  // boxRotation: number;
  boxPosition: Point;
  boxInSize: boolean;
  space: number;

  constructor(
    mainContent: Elements,
    box: TypeBoxElement & DiagramElementPrimitive | null
       | TypeBoxElement & DiagramElementCollection,
    boxInSize: ?boolean = false,
    space: ?number = 0,
  ) {
    if (box) {
      super([mainContent, new Element(box)]);
    } else {
      super([mainContent]);
    }
    this.box = box;
    this.scaleModifier = 1;
    this.lineWidth = 0.01;
    this.mainContent = mainContent;
    if (boxInSize == null) {
      this.boxInSize = false;
    } else {
      this.boxInSize = boxInSize;
    }
    this.space = space == null ? 0 : space;
    this.boxWidth = 1;
    this.boxHeight = 1;
    this.boxPosition = new Point(0, 0);
  }

  _dup(namedCollection?: Object) {
    let box = null;
    if (this.box != null && namedCollection) {
      box = namedCollection[this.box.name];
    } else {
      ({ box } = this);
    }
    const boxCopy = new Box(
      this.mainContent._dup(namedCollection),
      box,
      this.boxInSize,
      this.space,
    );
    duplicateFromTo(this, boxCopy, ['box', 'mainContent']);
    return boxCopy;
  }

  calcSize(location: Point, incomingScale: number) {
    const scale = incomingScale * this.scaleModifier;
    this.location = location._dup();
    this.mainContent.calcSize(location, scale);

    let lineWidth = 0;
    if (this.box
       && this.box.lineWidth != null && typeof this.box.lineWidth === 'number'
    ) {
      ({ lineWidth } = this.box);
    }

    const boxWidth = this.mainContent.width + this.space * 2;
    const boxHeight = this.mainContent.height + this.space * 2;

    const bottomLeft = new Point(
      location.x - this.space,
      location.y - this.mainContent.descent - this.space,
    );

    if (this.boxInSize) {
      this.width = boxWidth + lineWidth;
      this.height = boxHeight + lineWidth;
      this.ascent = this.mainContent.ascent + this.space + lineWidth / 2;
      this.descent = this.mainContent.descent + this.space + lineWidth / 2;
      this.mainContent.offsetLocation(new Point(this.space, 0));
      bottomLeft.x += this.space;
    } else {
      this.width = this.mainContent.width;
      this.ascent = this.mainContent.ascent + this.space;
      this.descent = this.mainContent.descent + this.space;
    }

    this.height = this.descent + this.ascent;

    const { box } = this;
    if (box) {
      this.boxPosition = bottomLeft._dup();
      this.boxWidth = boxWidth;
      this.boxHeight = boxHeight;
      box.custom.setSize(new Rect(
        this.boxPosition.x,
        this.boxPosition.y,
        this.boxWidth,
        this.boxHeight,
      ));
      box.showAll();
    }
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    if (this.box) {
      elements = [...elements, this.box];
    }
    return elements;
  }

  setPositions() {
    this.mainContent.setPositions();
    const { box } = this;
    if (box) {
      box.custom.setSize(new Rect(
        this.boxPosition.x,
        this.boxPosition.y,
        this.boxWidth,
        this.boxHeight,
      ));
      // box.showAll();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.mainContent.offsetLocation(offset);
    this.boxPosition = this.boxPosition.add(offset);
  }
}
