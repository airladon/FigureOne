// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class Brackets extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const [mainContent] = this.contents;
    const {
      left, top, right, bottom,
    } = this.options;
    const contentBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent);
    }

    const contentLocation = new Point(loc.x + left, loc.y);
    if (mainContent != null) {
      mainContent.offsetLocation(contentLocation.sub(mainContent.location));
    }

    this.descent = contentBounds.descent + bottom;
    this.ascent = contentBounds.ascent + top;
    this.width = contentBounds.width + left + right;
    this.height = this.descent + this.ascent;
  }
}
