
// @flow
import {
  Point,
} from '../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';


export default class Offset extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const {
      offset, // inSize,
      fullContentBounds,
    } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    // const containerBounds = new Bounds();
    const fullBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent.getBounds(fullContentBounds));
    }

    if (mainContent != null) {
      mainContent.offsetLocation(offset);
      fullBounds.copyFrom(mainContent.getBounds(true));
    }

    // if (inSize) {
    //   this.width = offset.x + contentBounds.width;
    //   this.height = contentBounds.height;
    //   this.descent = contentBounds.descent;
    //   this.ascent = contentBounds.ascent;
    // } else {
    this.width = 0;
    this.height = 0;
    this.descent = 0;
    this.ascent = 0;
    // }
    this.fullSize = {
      leftOffset: location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }
}
