
// @flow
import {
  Point, // parsePoint,
} from '../../../tools/g2';
import Bounds from './Bounds';
// import { Elements } from './Element';
import BaseEquationFunction from './BaseEquationFunction';

export default class Lines extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();

    const {
      lineOptions, yAlign, fullContentBounds, justify,
    } = this.options;
    const numLines = lineOptions.length;

    const bounds: Array<Bounds> = [];
    const locs: Array<Point> = [];
    let maxWidth = 0;
    for (let lineNum = 0; lineNum < numLines; lineNum += 1) {
      const elementBounds = new Bounds();
      const element = this.contents[lineNum];
      if (element != null) {
        element.calcSize(loc._dup(), scale);
        elementBounds.copyFrom(element.getBounds(fullContentBounds));
      }
      bounds.push(elementBounds);
      locs.push(new Point(0, 0));
      if (elementBounds.width > maxWidth) {
        maxWidth = elementBounds.width;
      }
    }

    // All lines are now left justified with baselines at y = 0
    // First let's separate them all in y
    // const yOffsets = [];
    let maxY = locs[0].y + bounds[0].ascent;
    let minY = locs[0].y - bounds[0].descent;
    for (let lineNum = 1; lineNum < numLines; lineNum += 1) {
      const previousY = locs[lineNum - 1].y;
      const { space, baselineSpace } = lineOptions[lineNum];
      if (baselineSpace != null) {
        locs[lineNum].y = previousY - baselineSpace;
      } else {
        const prevDesc = bounds[lineNum - 1].descent;
        const asc = bounds[lineNum].ascent;
        locs[lineNum].y = previousY - asc - prevDesc - space;
      }
      const lineMaxY = locs[lineNum].y + bounds[lineNum].ascent;
      const lineMinY = locs[lineNum].y - bounds[lineNum].descent;
      if (lineMaxY > maxY) { maxY = lineMaxY; }
      if (lineMinY < minY) { minY = lineMinY; }
    }

    // Align all ys
    let yOffset = 0;
    const height = maxY - minY;
    if (yAlign === 'top') {
      yOffset = -maxY;
    } else if (yAlign === 'middle') {
      yOffset = -maxY + height / 2;
    } else if (yAlign === 'bottom') {
      yOffset -= minY;
    } else if (typeof yAlign === 'number' && yAlign < numLines) {
      yOffset -= locs[yAlign].y;
    }

    // All lines are currently left justified
    // Justify them in x
    let minX = 0;
    for (let lineNum = 0; lineNum < numLines; lineNum += 1) {
      if (justify === 'right') {
        locs[lineNum].x = -bounds[lineNum].width;
      } else if (justify === 'center') {
        locs[lineNum].x = -bounds[lineNum].width / 2;
      } else if (justify === 'element' && lineOptions[lineNum].justify != null) {
        locs[lineNum].x = -lineOptions[lineNum].justify.transform.t().x;
      }
      locs[lineNum].x += lineOptions[lineNum].offset;
      if (locs[lineNum].x < minX) { minX = locs[lineNum].x; }
    }

    // Align so left most is at 0
    for (let lineNum = 0; lineNum < numLines; lineNum += 1) {
      locs[lineNum].x -= minX;
    }

    const fullBounds = new Bounds();
    for (let lineNum = 0; lineNum < numLines; lineNum += 1) {
      const element = this.content[lineNum];
      if (element != null) {
        element.offsetLocation(locs[lineNum].add(0, yOffset));
        if (fullBounds.width === 0) {
          fullBounds.copyFrom(element.getBounds(true));
        }
        fullBounds.growWithSameBaseline(element.getBounds(true));
      }
    }

    this.width = fullBounds.width;
    this.height = fullBounds.height;
    this.descent = fullBounds.descent;
    this.ascent = fullBounds.ascent;
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }
}
