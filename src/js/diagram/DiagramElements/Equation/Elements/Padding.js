// @flow
import {
  Point,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
// import {
//   DiagramElementPrimative, DiagramElementCollection,
// } from '../../../Element';
import { Elements } from './Element';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // DiagramElementPrimatives or DiagramElementCollections and HTML Objects
// // and arranges their size in a )

export default class Padding extends Elements {
  mainContent: Elements;
  top: number;
  bottom: number;
  left: number;
  right: number;

  constructor(
    mainContent: Elements,
    top: ?number = 0,
    right: ?number = 0,
    bottom: ?number = 0,
    left: ?number = 0,
  ) {
    super([mainContent]);
    this.left = left == null ? 0 : left;
    this.right = right == null ? 0 : right;
    this.top = top == null ? 0 : top;
    this.bottom = bottom == null ? 0 : bottom;
    this.mainContent = mainContent;
  }

  _dup(namedCollection?: Object) {
    const paddingCopy = new Padding(
      this.mainContent._dup(namedCollection),
      this.top,
      this.right,
      this.bottom,
      this.left,
    );
    duplicateFromTo(this, paddingCopy, ['mainContent']);
    return paddingCopy;
  }

  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    this.mainContent.calcSize(location.add(this.left, 0), scale);
    this.descent = this.mainContent.descent + this.bottom;
    this.ascent = this.mainContent.ascent + this.top;
    this.width = this.mainContent.width + this.left + this.right;
  }

  getAllElements() {
    let elements = [];
    if (this.mainContent) {
      elements = [...elements, ...this.mainContent.getAllElements()];
    }
    return elements;
  }

  setPositions() {
    this.mainContent.setPositions();
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.mainContent.offsetLocation(offset);
  }
}
