
// @flow
import {
  Point, parsePoint,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import { Elements } from './Element';
import BaseEquationFunction from './BaseEquationFunction';

function getMaxAscentDescent(
  numRows,
  numCols,
  matrix: Array<Array<Elements | null>>,
  bounds: Array<Array<Bounds>>,
) {
  const rowAscents = [];
  const rowDescents = [];
  const rowHeights = [];
  let maxAscent = 0;
  let maxDescent = 0;
  let maxHeight = 0;
  for (let row = 0; row < numRows; row += 1) {
    let rowMaxAscent = 0;
    let rowMaxDescent = 0;
    // let rowMaxHeight = 0;
    for (let col = 0; col < numCols; col += 1) {
      const bound = bounds[row][col];
      if (bound.ascent > rowMaxAscent || col === 0) {
        rowMaxAscent = bound.ascent;
      }
      if (bound.descent > rowMaxDescent || col === 0) {
        rowMaxDescent = bound.descent;
      }
    }
    if (rowMaxAscent > maxAscent || row === 0) {
      maxAscent = rowMaxAscent;
    }
    if (rowMaxDescent > maxDescent || row === 0) {
      maxDescent = rowMaxDescent;
    }
    const rowMaxHeight = rowMaxDescent + rowMaxAscent;
    if (rowMaxHeight > maxHeight || row === 0) {
      maxHeight = rowMaxHeight;
    }
    rowHeights.push(rowMaxHeight);
    rowAscents.push(rowMaxAscent);
    rowDescents.push(rowMaxDescent);
  }
  return {
    ascents: rowAscents,
    descents: rowDescents,
    heights: rowHeights,
    maxAscent,
    maxDescent,
    maxHeight,
  };
}

function getMaxColWidth(
  numRows,
  numCols,
  matrix: Array<Array<Elements | null>>,
  bounds: Array<Array<Bounds>>,
) {
  const colWidths = [];
  let maxWidth = 0;
  for (let col = 0; col < numCols; col += 1) {
    let maxColWidth = 0;
    for (let row = 0; row < numRows; row += 1) {
      const elementWidth = bounds[row][col].width;
      if (elementWidth > maxColWidth) {
        maxColWidth = elementWidth;
      }
      if (elementWidth > maxWidth) {
        maxWidth = elementWidth;
      }
    }
    colWidths.push(maxColWidth);
  }
  return [colWidths, maxWidth];
}

// Matrix is centered in y.

export default class Integral extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const aboveBaseline = scale * 0.07;
    const {
      order, fit, space, contentScale, vAlign,
    } = this.options;
    const [numRows, numCols] = order;

    const bounds = [];
    const locs = [];
    let index = 0;
    const matrix: Array<Array<Elements | null>> = [];
    for (let row = 0; row < numRows; row += 1) {
      matrix.push([]);
      bounds.push([]);
      locs.push([]);
      for (let col = 0; col < numCols; col += 1) {
        const elementBounds = new Bounds();
        const element = this.contents[index];
        if (element != null) {
          element.calcSize(loc._dup(), scale * contentScale);
          elementBounds.copyFrom(element);
        }
        matrix[row].push(element);
        bounds[row].push(elementBounds);
        locs[row].push(new Point(0, 0));
        index += 1;
      }
    }

    const rowBounds = getMaxAscentDescent(numRows, numCols, matrix, bounds);
    const [colWidths, maxWidth] = getMaxColWidth(numRows, numCols, matrix, bounds);
    const maxDim = Math.max(maxWidth, rowBounds.maxHeight);
    if (fit !== 'min') {
      let dim;
      if (fit === 'max') {
        dim = new Point(maxDim, maxDim);
      } else {
        dim = parsePoint(fit);
        if (dim == null) {
          dim = new Point(0, 0);
        }
      }

      for (let row = 0; row < numRows; row += 1) {
        rowBounds.heights[row] = dim.x;
      }
      for (let col = 0; col < numCols; col += 1) {
        colWidths[col] = dim.y;
      }
    }

    let cumHeight = 0;
    let cumWidth = 0;
    for (let row = numRows - 1; row >= 0; row -= 1) {
      cumWidth = 0;
      for (let col = 0; col < numCols; col += 1) {
        const bound = bounds[row][col];
        const x = cumWidth + colWidths[col] / 2 - bound.width / 2;
        let y = cumHeight + rowBounds.heights[row] / 2
            - (bound.ascent - bound.descent) / 2;
        if (vAlign === 'baseline') {
          y = cumHeight + rowBounds.descents[row];
        }
        cumWidth += colWidths[col] + space.x * scale;
        locs[row][col] = new Point(x, y);
      }
      if (vAlign === 'baseline') {
        cumHeight += rowBounds.descents[row] + rowBounds.ascents[row] + space.y * scale;
      } else {
        cumHeight += rowBounds.heights[row] + space.y * scale;
      }
    }
    const totalHeight = cumHeight - space.y * scale;
    const totalWidth = cumWidth - space.x * scale;

    for (let row = 0; row < numRows; row += 1) {
      for (let col = 0; col < numCols; col += 1) {
        locs[row][col].x += loc.x;
        locs[row][col].y = loc.y - totalHeight / 2 + locs[row][col].y + aboveBaseline;
        const element = matrix[row][col];
        if (element != null) {
          element.offsetLocation(locs[row][col].sub(element.location));
        }
      }
    }

    this.width = totalWidth;
    this.height = totalHeight;
    this.descent = totalHeight / 2 - aboveBaseline;
    this.ascent = totalHeight / 2 + aboveBaseline;
  }
}
