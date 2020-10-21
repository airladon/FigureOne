// @flow
import {
  Point, Line, Transform,
} from '../../../tools/g2';
import {
  joinObjects, joinObjectsWithOptions,
} from '../../../tools/tools';
import { getPolygonPoints, getTrisFillPolygon } from './polygon/polygon';

export type ArrowHead = 'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle';
export type OBJ_Arrow = {
  head?: ArrowHead,
  length?: number,
  width?: number,
  rotation?: number,
  reverse?: number,
  sides?: number,
  radius?: number,
  barb?: number,
}

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
  barb: number,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  const {
    width, length, start, end, touchBorderBuffer, lineWidth, barb,
  } = options;
  const arrowBorder = [
    new Point(0, 0),
    new Point(-barb, -width / 2),
    new Point(length, 0),
    new Point(-barb, width / 2),
  ];
  const points = [
    arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
  ];
  const borderToUse = arrowBorder;
  let touchBorder = borderToUse;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer - barb, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, -width / 2 - touchBorderBuffer),
      new Point(length + touchBorderBuffer, width / 2 + touchBorderBuffer),
      new Point(-touchBorderBuffer - barb, width / 2 + touchBorderBuffer),
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
  // length: number,
  // width: number,
  radius: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
  sides: number,
  rotation: number,
}) {
  const {
    start, end, touchBorderBuffer, lineWidth, sides, radius, rotation,
  } = options;

  const r = radius;

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
      new Point(-touchBorderBuffer, -r - touchBorderBuffer),
      new Point(r + touchBorderBuffer, -r - touchBorderBuffer),
      new Point(r + touchBorderBuffer, r + touchBorderBuffer),
      new Point(-touchBorderBuffer, r + touchBorderBuffer),
    ];
  }
  const tail = [
    new Point(0, lineWidth / 2),
    new Point(0, -lineWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}

function getArrow(options: {
  head: ArrowHead,
  length: number,
  width: number,
  barb: number,
  start: Point,
  stop: Point,
  touchBorderBuffer: number,
  lineWidth: number,
}) {
  if (options.head === 'barb') {
    return getBarbArrow(options);
  }
  if (options.head === 'rectangle' || options.head === 'bar') {
    return getRectangleArrow(options);
  }
  if (options.head === 'line') {
    return getLineArrow(options);
  }
  if (options.head === 'polygon' || options.head === 'circle') {
    return getPolygonArrow(options);
  }
  return getTriangleArrow(options);
}

function getArrowLength(options: {
  head: ArrowHead,
  length: number,
  lineWidth: number,
}) {
  const {
    head, width, length, lineWidth, radius,
  } = options;
  if (head === 'circle' || head === 'polygon') {
    return radius;
  }
  if (head === 'line') {
    const line = new Line([0, -width / 2], [length, 0]);
    const horizontal = new Line([0, -lineWidth], [length, -lineWidth]);
    const i = horizontal.intersectsWith(line).intersect;
    return length - i.x;
  }
  return length;
}


function defaultArrowOptions(
  head: ArrowHead,
  lineWidth: number,
  scaleIn: number,
) {
  const scale = 4 * scaleIn;
  if (head === 'triangle' || head == null) {
    return {
      head: 'triangle',
      width: lineWidth * scale,
      length: lineWidth * scale,
      reverse: false,
    };
  }
  if (head === 'polygon') {
    return {
      radius: lineWidth * scale / 2,
      sides: 4,
      rotation: 0,
    };
  }
  if (head === 'circle') {
    return {
      radius: lineWidth * scale / 2,
      sides: 30,
      rotation: 0,
    };
  }
  if (head === 'barb') {
    return {
      width: lineWidth * scale,
      length: lineWidth * scale,
      barb: lineWidth,
    };
  }
  if (head === 'bar') {
    return {
      width: lineWidth * scale,
      length: lineWidth,
    };
  }
  if (head === 'line') {
    return {
      width: lineWidth * scale,
      length: lineWidth * scale,
    };
  }
  if (head === 'rectangle') {
    return {
      width: lineWidth * scale,
      length: lineWidth * scale,
    };
  }
  return {
    head: 'triangle',
    width: lineWidth * scale,
    length: lineWidth * scale,
    reverse: false,
  };
}

function simplifyArrowOptions(
  arrowIn: ?{
    start: OBJ_Arrow | ArrowHead,
    end: OBJ_Arrow | ArrowHead,
  } & OBJ_Arrow | ArrowHead,
  lineWidth: number,
) {
  if (arrowIn == null) {
    return undefined;
  }
  let arrow = arrowIn;
  if (typeof arrowIn === 'string') {
    arrow = {
      start: arrowIn,
      end: arrowIn,
    };
  }
  const optionsForBoth = joinObjectsWithOptions({ except: ['end', 'start'] }, {}, arrow);

  const out = {};
  const processEnd = (startOrEnd) => {
    if (typeof arrow[startOrEnd] === 'string') {
      arrow[startOrEnd] = {
        head: arrow[startOrEnd],
      };
    }
    if (Object.keys(optionsForBoth).length > 0) {
      if (arrow[startOrEnd] == null) {
        arrow[startOrEnd] = joinObjects({}, optionsForBoth);
      } else {
        arrow[startOrEnd] = joinObjects({}, optionsForBoth, arrow[startOrEnd]);
      }
    }
    if (
      arrow[startOrEnd] != null
      || (arrow.start == null && arrow.end == null)
    ) {
      const o = joinObjectsWithOptions(
        { except: ['end', 'start'] }, { lineWidth }, arrow[startOrEnd],
      );
      out[startOrEnd] = joinObjects(
        defaultArrowOptions(o.head, o.lineWidth, o.scale),
        o,
      );
    }
  };
  processEnd('start');
  processEnd('end');

  if (Object.keys(out).length > 0) {
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
