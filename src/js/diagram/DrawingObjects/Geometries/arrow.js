// @flow
import {
  Point, Line, Transform,
} from '../../../tools/g2';
import {
  joinObjects,
} from '../../../tools/tools';
import { getPolygonPoints, getTrisFillPolygon } from './polygon/polygon';

function orientArrow(
  points: Array<Point>,
  border: Array<Point>,
  touchBorder: Array<Point>,
  start: Point,
  end: Point,
  tail: Array<Point>,
) {
  const line = new Line(start, end);
  const matrix = new Transform().rotate(line.angle()).translate(start).matrix();
  return [
    points.map(p => p.transformBy(matrix)),
    border.map(p => p.transformBy(matrix)),
    touchBorder.map(p => p.transformBy(matrix)),
    tail.map(p => p.transformBy(matrix)),
    // points.length,
  ];
}

function getTriangleArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  lineWidth: number,
  touchBorderBuffer: number,
  reverse: boolean,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth, reverse,
  } = options;
  let points = [
    new Point(0, -width / 2),
    new Point(length, 0),
    new Point(0, width / 2),
  ];
  if (reverse) {
    points = [
      new Point(0, -width / 2),
      new Point(-length, 0),
      new Point(0, width / 2),
    ];
  }
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
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, border, touchBorder, start, end, tail);
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
    new Point(0, 0),
    new Point(-barbLength, -width / 2),
    new Point(length, 0),
    new Point(-barbLength, width / 2),
  ];
  const points = [
    arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
  ];
  const borderToUse = arrowBorder;
  let touchBorder = borderToUse;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer - barbLength, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, width / 2 + touchBorderBuffer),
      new Point(-touchBorderBuffer - barbLength, width / 2 + touchBorderBuffer),
    ];
  }
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}

function getRectangleArrow(options: {
  length: number,
  width: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth,
  } = options;
  const arrowBorder = [
    new Point(0, -width / 2),
    new Point(length, -width / 2),
    new Point(length, width / 2),
    new Point(0, width / 2),
  ];
  const points = [
    arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
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
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}


function getLineArrow(options: {
  length: number,
  width: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth,
  } = options;
  const line = new Line([0, -width / 2], [length, 0]);
  const offset = line.offset('positive', lineWidth);
  const offsetTop = new Line([offset.p1.x, -offset.p1.y], [offset.p2.x, -offset.p2.y]);
  const horizontal = new Line([-1, -lineWidth / 2], [0, -lineWidth / 2]);
  const i = horizontal.intersectsWith(line).intersect;
  const i2 = offset.intersectsWith(offsetTop).intersect;

  const arrowBorder = [
    new Point(-i.x, -width / 2),
    new Point(length - i.x, 0),
    new Point(-i.x, width / 2),
    new Point(offset.p1.x - i.x, -offset.p1.y),
    new Point(i2.x - i.x, 0),
    new Point(offset.p1.x - i.x, offset.p1.y),
  ];
  const points = [
    arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
    arrowBorder[5]._dup(), arrowBorder[0]._dup(), arrowBorder[4]._dup(),
    arrowBorder[4]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    arrowBorder[4]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
  ];
  const borderToUse = arrowBorder;
  let touchBorder = borderToUse;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer + offset.x - i.x, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer - i.x, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer - i.x, width / 2 + touchBorderBuffer),
      new Point(-touchBorderBuffer + offset.x - i.x, width / 2 + touchBorderBuffer),
    ];
  }
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}


function getPolygonArrow(options: {
  length: number,
  width: number,
  radius: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
  sides: number,
  rotation: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth, sides, radius, rotation,
  } = options;

  let r = radius;
  if (options.radius == null) {
    r = Math.max(width, length);
  }
  const s = Math.max(sides, 3);
  const arrowBorder = getPolygonPoints({
    radius: r,
    rotation,
    offset: new Point(0, 0),
    sides: s,
    sidesToDraw: s,
    direction: 1,
  });

  const points = getTrisFillPolygon(new Point(0, 0), arrowBorder, s, s);
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
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}

function getArrow(options: {
  head: 'barb' | 'triangle' | 'rectangle',
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
  if (options.head === 'rectangle') {
    return getRectangleArrow(options);
  }
  if (options.head === 'line') {
    return getLineArrow(options);
  }
  if (options.head === 'polygon') {
    return getPolygonArrow(options);
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
