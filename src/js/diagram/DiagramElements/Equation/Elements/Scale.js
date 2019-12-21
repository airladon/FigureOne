
// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';


export default class Scale extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const {
      contentScale,
    } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale * contentScale);
      contentBounds.copyFrom(mainContent);
    }

    this.width = contentBounds.width;
    this.height = contentBounds.height;
    this.descent = contentBounds.descent;
    this.ascent = contentBounds.ascent;
  }
}
