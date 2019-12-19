
// @flow
import {
  Point, parsePoint,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import { Elements } from './Element';
import BaseEquationFunction from './BaseEquationFunction';

function getMaxRowHeight(
  numRows,
  numCols,
  matrix: Array<Array<Elements | null>>,
  bounds: Array<Array<Bounds>>,
) {
  const rowHeights = [];
  let maxHeight = 0;
  for (let row = 0; row < numRows; row += 1) {
    let maxRowHeight = 0;
    for (let col = 0; col < numCols; col += 1) {
      const elementHeight = bounds[row][col].height;
      if (elementHeight > maxRowHeight) {
        maxRowHeight = elementHeight;
      }
      if (elementHeight > maxHeight) {
        maxHeight = elementHeight;
      }
    }
    rowHeights.push(maxRowHeight);
  }
  return [rowHeights, maxHeight];
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
      order, fit, space, contentScale,
    } = this.options;
    const [numRows, numCols] = order;

    const bounds = [];
    let index = 0;
    const matrix: Array<Array<Elements | null>> = [];
    for (let row = 0; row < numRows; row += 1) {
      matrix.push([]);
      bounds.push([]);
      for (let col = 0; col < numCols; col += 1) {
        const elementBounds = new Bounds();
        const element = this.contents[index];
        if (element != null) {
          element.calcSize(loc._dup(), scale * contentScale);
          elementBounds.copyFrom(element);
        }
        matrix[row].push(element);
        bounds[row].push(elementBounds);
        index += 1;
      }
    }

    const [rowHeights, maxHeight] = getMaxRowHeight(numRows, numCols, matrix, bounds);
    const [colWidths, maxWidth] = getMaxColWidth(numRows, numCols, matrix, bounds);
    const maxDim = Math.max(maxWidth, maxHeight);
    if (fit !== 'rowCol') {
      let dim;
      if (fit === 'max') {
        dim = new Point(maxDim, maxDim);
      } else {
        dim = parsePoint(fit);
      }
      for (let row = 0; row < numRows; row += 1) {
        rowHeights[row] = dim.x;
      }
      for (let col = 0; col < numCols; col += 1) {
        colWidths[col] = dim.y;
      }
    }

    const cumHeight = [];
    for (let row = 0; row < numRows; row += 1) {
      const h = rowHeights[row];
      cumHeight.push(row === 0 ? h : cumHeight[row - 1] + space.x + h);
    }
    const cumWidth = [];
    for (let col = 0; col < numCols; col += 1) {
      const w = colWidths[col];
      cumWidth.push(col === 0 ? w : cumWidth[col - 1] + space.x + w);
    }

    const totalHeight = cumHeight.slice(-1)[0];
    const totalWidth = cumWidth.slice(-1)[0];
    index = 0;
    for (let row = 0; row < numRows; row += 1) {
      for (let col = 0; col < numCols; col += 1) {
        const element = matrix[row][col];
        const bound = bounds[row][col];
        const elementLoc = new Point(
          loc.x + cumWidth[col] - colWidths[col] / 2 - bound.width / 2,
          loc.y + totalHeight / 2 - cumHeight[row] + rowHeights[row] / 2
            - (bound.ascent - bound.descent) / 2 + aboveBaseline,
        );
        if (element != null) {
          element.offsetLocation(elementLoc.sub(element.location));
        }
      }
    }

    this.width = totalWidth;
    this.height = totalHeight;
    this.descent = totalHeight / 2 - aboveBaseline;
    this.ascent = totalHeight / 2 + aboveBaseline;
  }
}
