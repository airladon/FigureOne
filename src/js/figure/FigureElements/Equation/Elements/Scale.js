
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
      scaleModifier, fullContentBounds,
    } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    const fullBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale * scaleModifier);
      contentBounds.copyFrom(mainContent.getBounds(fullContentBounds));
      fullBounds.copyFrom(mainContent.getBounds(true));
    }

    this.width = contentBounds.width;
    this.height = contentBounds.height;
    this.descent = contentBounds.descent;
    this.ascent = contentBounds.ascent;
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }
}
