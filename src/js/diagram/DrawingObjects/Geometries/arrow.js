// @flow
import {
  Point, Line, Transform,
} from '../../../tools/g2';
import {
  joinObjects,
} from '../../../tools/tools';

function orientArrow(
  points: Array<Point>,
  border: Array<Point>,
  touchBorder: Array<Point>,
  start: Point,
  end: Point,
) {
  const line = new Line(start, end);
  const matrix = new Transform().rotate(line.angle()).translate(start).matrix();
  return [
    points.map(p => p.transformBy(matrix)),
    border.map(p => p.transformBy(matrix)),
    touchBorder.map(p => p.transformBy(matrix)),
  ];
}
function getTriangleArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer,
  } = options;
  const points = [
    new Point(0, -width / 2),
    new Point(length, 0),
    new Point(0, width / 2),
  ];
  const border = points.map(p => p._dup());
  let touchBorder = border;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, width / 2 + touchBorderBuffer),
      new Point(-touchBorderBuffer, width / 2 + touchBorderBuffer),
    ];
  }
  return orientArrow(points, border, touchBorder, start, end);
}

function getBarbArrow(options: {
  length: number,
  width: number,
  start: Point,
  stop: Point,
  barbLength: number,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth, barbLength,
  } = options;
  const arrowBorder = [
    new Point(0, -lineWidth / 2),
    new Point(barbLength, -lineWidth / 2),
    new Point(0, -width / 2),
    new Point(length, 0),
    new Point(0, width / 2),
    new Point(barbLength, lineWidth / 2),
    new Point(0, lineWidth / 2),
  ];
  const points = [
    arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
    arrowBorder[6]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[1]._dup(),
    arrowBorder[1]._dup(), arrowBorder[3]._dup(), arrowBorder[5]._dup(),
    arrowBorder[5]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
  ];
  const borderToUse = arrowBorder;
  let touchBorder = borderToUse;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, width / 2 + touchBorderBuffer),
      new Point(-touchBorderBuffer, width / 2 + touchBorderBuffer),
    ];
  }
  return orientArrow(points, borderToUse, touchBorder, start, end);
}

function getArrow(options: {
  head: 'barb' | 'triangle',
  length: number,
  width: number,
  barbLength: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  if (options.head === 'barb') {
    return getBarbArrow(options);
  }
  return getTriangleArrow(options);
}

function getArrowLength(options: {
  head: 'barb' | 'triangle' | 'circle' | 'line' | 'bar' | 'square' | 'diamond',
  length: number,
  lineWidth: number,
}) {
  const { head } = options;
  if (head === 'bar') {
    return options.lineWidth;
  }
  return options.length;
}

function simplifyArrowOptions(
  arrow: ?{
    head: 'triangle' | 'circle' | 'line' | 'barb' | 'bar',
    length: number,
    width: number,
    start: {
      head: 'triangle' | 'circle' | 'line' | 'barb' | 'bar',
      length: number,
      width: number,
      barb: number,
    },
    end: {
      head: 'triangle' | 'circle' | 'line' | 'barb' | 'bar',
      length: number,
      width: number,
      barb: number,
    },
  },
  lineWidth: number,
) {
  if (arrow == null) {
    return undefined;
  }
  let start;
  let end;
  const out = {};
  if (
    arrow.start != null
    || (arrow.start == null && arrow.end == null)
  ) {
    start = joinObjects({}, {
      head: arrow.head,
      length: arrow.length,
      width: arrow.width,
      barb: arrow.barb,
      lineWidth,
    }, arrow.start);
    out.start = start;
  }
  if (
    arrow.end != null
    || (arrow.start == null && arrow.end == null)
  ) {
    end = joinObjects({}, {
      head: arrow.head,
      length: arrow.length,
      width: arrow.width,
      barb: arrow.barb,
      lineWidth,
    }, arrow.end);
    out.end = end;
  }
  if (start != null || end != null) {
    return out;
  }
  return undefined;
}

export {
  getTriangleArrow,
  getBarbArrow,
  getArrow,
  getArrowLength,
  simplifyArrowOptions,
};
