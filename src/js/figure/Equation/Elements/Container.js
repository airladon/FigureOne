
// @flow
import {
  Point,
} from '../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';


export default class Container extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const {
      width, descent, ascent, xAlign, yAlign, fit, scaleModifier, inSize,
      fullContentBounds,
    } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    const containerBounds = new Bounds();
    const fullBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale * scaleModifier);
      contentBounds.copyFrom(mainContent.getBounds(fullContentBounds));
      // contentBounds.copyFrom(mainContent);
      containerBounds.copyFrom(contentBounds);
    }

    if (width != null) {
      containerBounds.width = width;
    }

    if (descent != null) {
      containerBounds.descent = descent;
    }

    if (ascent != null) {
      containerBounds.ascent = ascent;
    }

    containerBounds.height = containerBounds.descent + containerBounds.ascent;

    if (mainContent != null) {
      if (fit === 'width') {
        mainContent.calcSize(loc._dup(), containerBounds.width / contentBounds.width);
      } else if (fit === 'height') {
        mainContent.calcSize(loc._dup(), containerBounds.height / contentBounds.height);
      } else if (fit === 'contain') {
        const newScale = Math.min(
          containerBounds.width / contentBounds.width,
          containerBounds.height / contentBounds.height,
        );
        mainContent.calcSize(loc._dup(), newScale);
      }
      contentBounds.copyFrom(mainContent);
    }

    const contentLoc = loc._dup();
    if (xAlign === 'center') {
      contentLoc.x = loc.x + containerBounds.width / 2 - contentBounds.width / 2;
    } else if (xAlign === 'right') {
      contentLoc.x = loc.x + containerBounds.width - contentBounds.width;
    } else if (typeof xAlign === 'number') {
      contentLoc.x = loc.x + containerBounds.width * xAlign;
    }

    if (yAlign === 'bottom') {
      contentLoc.y = loc.y - containerBounds.descent + contentBounds.descent;
    } else if (yAlign === 'middle') {
      contentLoc.y = loc.y - containerBounds.descent
                     + containerBounds.height / 2 - contentBounds.height / 2
                     + contentBounds.descent;
    } else if (yAlign === 'top') {
      contentLoc.y = loc.y + containerBounds.ascent
                     - contentBounds.height + contentBounds.descent;
    } else if (typeof yAlign === 'number') {
      contentLoc.y = loc.y - containerBounds.descent
                     + containerBounds.height * yAlign + contentBounds.descent;
    }
    if (mainContent != null) {
      mainContent.offsetLocation(contentLoc.sub(mainContent.location));
    }
    if (mainContent != null) {
      fullBounds.copyFrom(mainContent.getBounds(true));
      fullBounds.growWithSameBaseline(containerBounds);
    } else {
      fullBounds.copyFrom(containerBounds);
    }

    if (inSize) {
      this.width = containerBounds.width;
      this.height = containerBounds.height;
      this.descent = containerBounds.descent;
      this.ascent = containerBounds.ascent;
    } else {
      this.width = 0;
      this.height = 0;
      this.descent = 0;
      this.ascent = 0;
    }
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }
}
