// @flow
import {
  Point, Line, Transform, getPoint,
} from '../../tools/g2';
import {
  joinObjects, joinObjectsWithOptions,
} from '../../tools/tools';
import { getPolygonPoints } from './polygon/polygon';
import type { OBJ_Arrow } from '../FigurePrimitives/FigurePrimitives';
// import { makePolyLine } from './lines/lines';

/**
 * Arrow heads
 *
 * `'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle'`
 *
 * @see {@link OBJ_Arrow} for properties related to each arrow head
 */
export type TypeArrowHead = 'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'reverseTriangle' | 'rectangle';


/**
 * Arrow end for a line or polyline.
 *
 * ![](./apiassets/arrow_line.png)
 *
 * Arrows on the end of lines have many of the same properties as stand
 * alone arrows {@link OBJ_Arrow}.
 *
 * The `align` property descripes where the line stops relative to the arrow.
 * `'start'` will be most useful for pointed arrows. When there is no tail, or
 * a zero length tail, `'mid'` can be useful with '`polygon`', '`circle`' and
 * '`bar`' as then the shapes will be centered on the end of the line. Note
 * that in this case the shape will extend past the line.
 *
 * @property {TypeArrowHead} [head] head style (`'triangle'`)
 * @property {number} [scale] scale the default dimensions of the arrow
 * @property {number} [length] dimension of the arrow head along the line
 * @property {number} [width] dimension of the arrow head along the line width
 * @property {number} [rotation] rotation of the polygon when `head = 'polygon'`
 * @property {number} [sides] number of sides in polygon or circle arrow head
 * @property {number} [radius] radius of polygon or circle arrow head
 * @property {number} [barb] barb length (along the length of the line) of the
 * barb arrow head
 * @property {boolean | number} [tail] `true` includes a tail in the arrow of
 * with `tailWidth`. A `number` gives the tail a length where 0 will not
 * extend the tail beyond the boundaries of the head
 * @property {'start' | 'mid'} [align] define which part of
 * the arrow is aligned at (0, 0) in draw space (`'start'`)
 *
 * @example
 * // Line with triangle arrows on both ends
 * figure.add({
 *   name: 'a',
 *   method: 'polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: 'triangle',
 *   },
 * });
 *
 * @example
 * // Line with customized barb arrow at end only
 * figure.add({
 *   name: 'a',
 *   method: 'shapes.line',
 *   options: {
 *     p1: [0, 0],
 *     p2: [0, 1],
 *     width: 0.02,
 *     arrow: {
 *       end: {
 *         head: 'barb',
 *         width: 0.15,
 *         length: 0.25,
 *         barb: 0.05,
 *         scale: 2
 *       },
 *     },
 *     dash: [0.02, 0.02],
 *   },
 * });
 *
 * @example
 * // Three lines showing the difference between mid align and start align for
 * // circle heads
 * figure.add([
 *   {
 *     name: 'reference',
 *     method: 'polyline',
 *     options: {
 *       points: [[0, 0.3], [0.5, 0.3]],
 *     },
 *   },
 *   {
 *     name: 'start',
 *     method: 'polyline',
 *     options: {
 *       points: [[0, 0], [0.5, 0]],
 *       arrow: {
 *         head: 'circle',
 *         radius: 0.1,
 *       },
 *     },
 *   },
 *   {
 *     name: 'mid',
 *     method: 'polyline',
 *     options: {
 *       points: [[0, -0.3], [0.5, -0.3]],
 *       arrow: {
 *         head: 'circle',
 *         radius: 0.1,
 *         align: 'mid',     // circle mid point is at line end
 *       },
 *     },
 *   },
 * ]);
 */
export type OBJ_LineArrow = {
  head?: TypeArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  sides?: number,
  radius?: number,
  barb?: number,
  tail?: boolean,
  align?: 'start' | 'mid',
}


/**
 * Line end's arrow definition options object.
 *
 * `start` and `end` define the properties of the arrows at the start and
 * end of the line. Instead of defining {@link OBJ_LineArrow} objects for the
 * start and end, a string that is the arrow's `head` property can also be
 * used and the size dimensions will be the default.
 *
 * All other properties will be used as the default for the `start` and
 * `end` objects.
 *
 * If any of the default properties are defined, then the line will have
 * both a start and end arrow.
 *
 * If only one end of the line is to have an arrow, then define only the
 * `start` or `end` properties and no others.
 *
 * @property {OBJ_LineArrow | TypeArrowHead} [start] arrow at start of line
 * @property {OBJ_LineArrow | TypeArrowHead} [end] arrow at end of line
 * @property {TypeArrowHead} [head] default head to use for start and end arrow
 * @property {number} [scale] default scale to use for start and end arrow
 * @property {number} [length] default length to use for start and end arrow
 * @property {number} [width] default width to use for start and end arrow
 * @property {number} [rotation] default rotation to use for start and end arrow
 * @property {number} [sides] default sides to use for start and end arrow
 * @property {number} [radius] default radius to use for start and end arrow
 * @property {number} [barb] default barb to use for start and end arrow
 * @property {number} [tailWidth] width of the line that joins the arrow - if
 * defined this will create minimum dimensions for the arrow
 * @property {boolean | number} [tail] `true` includes a tail in the arrow of
 * with `tailWidth`. A `number` gives the tail a length where 0 will not
 * extend the tail beyond the boundaries of the head
 * @property {'start' | 'mid'} [align] define which part of
 * the arrow is aligned at (0, 0) in draw space (`'start'`)
 */
export type OBJ_LineArrows = {
  start: OBJ_LineArrow | TypeArrowHead,
  end: OBJ_LineArrow | TypeArrowHead,
  head?: TypeArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  sides?: number,
  radius?: number,
  barb?: number,
  tailWidth?: number,
  tail?: boolean | number,
  align?: 'start' | 'mid',
};


function orientArrow(
  // points: Array<Point>,
  border: Array<Point>,
  touchBorder: Array<Point>,
  tail: Array<Point>,
  length: number,
  joinLength: number,
  options: {
    drawPosition: Point,
    align: 'tip' | 'start' | 'mid' | 'tail',
    angle: number,
  },
) {
  let matrix;
  if (options.align === 'start') {
    matrix = new Transform()
      .translate(length, 0)
      .rotate(options.angle)
      .translate(options.drawPosition)
      .matrix();
  } else if (options.align === 'tip') {
    matrix = new Transform()
      .rotate(options.angle)
      .translate(options.drawPosition)
      .matrix();
  } else if (options.align === 'mid') {
    matrix = new Transform()
      .translate(length / 2, 0)
      .rotate(options.angle)
      .translate(options.drawPosition)
      .matrix();
  } else {
    matrix = new Transform()
      .translate(joinLength, 0)
      .rotate(options.angle)
      .translate(options.drawPosition)
      .matrix();
  }
  const newBorder: Array<Point> = border.map(p => p.transformBy(matrix));
  const newTouchBorder: Array<Point> = touchBorder.map(p => p.transformBy(matrix));
  const newTail: Array<Point> = tail.map(p => p.transformBy(matrix));
  return [
    // newPoints,
    newBorder, newTouchBorder, newTail,
    // points.length,
  ];
}

function getTouchBorder(l, w, buffer) {
  return [
    new Point(-l - buffer, -w / 2 - buffer),
    new Point(buffer, -w / 2 - buffer),
    new Point(buffer, w / 2 + buffer),
    new Point(-l - buffer, w / 2 + buffer),
  ];
}

function dup(pnts: Array<Point>): Array<Point> {
  return pnts.map(p => p._dup());
}
/*
.########.########..####....###....##....##..######...##.......########
....##....##.....##..##....##.##...###...##.##....##..##.......##......
....##....##.....##..##...##...##..####..##.##........##.......##......
....##....########...##..##.....##.##.##.##.##...####.##.......######..
....##....##...##....##..#########.##..####.##....##..##.......##......
....##....##....##...##..##.....##.##...###.##....##..##.......##......
....##....##.....##.####.##.....##.##....##..######...########.########
*/
//                    ...............
//                    A              |\
//                    :              |  \
//                    :              |    \
//                    :              |      \
//                    :              |        \
//            width   :              |          \
//                    :              |            \
//                    :              |              \  (0, 0)
//    . . . . . . . . : . . . . . . .| . . . . . . . * . . . . . . . . . . . .
//                    :         end  |              / tip
//                    :              |            /
//                    :              |          /
//                    :              |        /
//                    :              |      /
//                    :              |    /
//                    :              |  /   length
//                    V..............|/<------------->
//
//
function getTriangleArrowTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(0, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const tailX = -o.length;
  return [new Point(tailX, o.tailWidth / 2), headX, tailX];
}


function getTriangleArrowLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  return [o.length, o.length, o.length];
}

function getTriangleDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  scale?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getTriangleArrow(options: {
  length: number,
  width: number,
  tailWidth: number,
  drawBorderBuffer: number,
  tail: boolean | number,
  lineWidth: number,
}) {
  const {
    length, drawBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getTriangleArrowTail(options);
  let arrowBorder;
  // let points: Array<Point>;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(headX, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, 0),
      new Point(headX, width / 2),
      new Point(headX, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    // points = [
    //   arrowBorder[4]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    //   arrowBorder[6]._dup(), arrowBorder[0]._dup(), arrowBorder[1]._dup(),
    //   arrowBorder[6]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    // ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, drawBorderBuffer);
  }
  return [arrowBorder, touchBorder, joinTail];
}

function getTriangleTris(b: Array<Point>) {
  if (b.length === 3) {
    return dup(b);
  }
  return dup([
    b[4], b[2], b[3],
    b[6], b[0], b[1],
    b[6], b[1], b[5],
  ]);
}

/*
.......########..########.##.....##....########.########..####
.......##.....##.##.......##.....##.......##....##.....##..##.
.......##.....##.##.......##.....##.......##....##.....##..##.
.......########..######...##.....##.......##....########...##.
.......##...##...##........##...##........##....##...##....##.
.......##....##..##.........##.##.........##....##....##...##.
.......##.....##.########....###..........##....##.....##.####
*/
function getReverseTriTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const hLine = new Line([-o.length, o.tailWidth / 2], 1, 0);
  let headTop = new Line([-o.length, 0], [0, o.width / 2]);
  let i = hLine.intersectsWith(headTop).intersect || new Point(-o.length, o.tailWidth / 2);
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(i.x, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
    headTop = new Line([headX, 0], [0, o.width / 2]);
    i = hLine.intersectsWith(headTop).intersect || new Point(-o.length + t, o.tailWidth / 2);
  }
  let tailX = -o.length;
  if (t < 0) {
    if (-o.length - t >= i.x) {
      tailX = i.x;
    } else {
      tailX = -o.length - t;
    }
  }
  return [i, headX, tailX];
}

function getReverseTriLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const [, , tailX] = getReverseTriTail(o);
  return [o.length, -tailX, o.length];
}

function getReverseTriDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getReverseTriangleArrow(options: {
  length: number,
  width: number,
  tailWidth: number,
  drawBorderBuffer: number,
  tail: boolean | number,
}) {
  const {
    length, drawBorderBuffer, tailWidth, width, tail,
  } = options;
  const [intersect, headX, tailX] = getReverseTriTail(options);
  let arrowBorder;
  // let points;
  if (tail === false || tailX >= intersect.x) {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(-length, 0),
    ];
    // points = arrowBorder.map(p => p._dup());
  } else if (tailX > headX) {
    const vLine = new Line([tailX, -tailWidth / 2], [tailX, 0]);
    const topLine = new Line([-length, 0], [0, width / 2]);
    const i = vLine.intersectsWith(topLine).intersect || new Point(tailX, -tailWidth / 2);
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
      new Point(i.x, i.y),
      new Point(-length, 0),
      new Point(i.x, -i.y),
      new Point(tailX, -tailWidth / 2),
      new Point(intersect.x, -tailWidth / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[8]._dup(),
    //   arrowBorder[8]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    //   arrowBorder[8]._dup(), arrowBorder[3]._dup(), arrowBorder[7]._dup(),
    //   arrowBorder[6]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    // ];
  } else {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(-length, tailWidth / 2),
      new Point(-length, -tailWidth / 2),
      new Point(intersect.x, -tailWidth / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[5]._dup(),
    //   arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[2]._dup(), arrowBorder[4]._dup(),
    // ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, drawBorderBuffer);
  }
  return [arrowBorder, touchBorder, joinTail];
}

function getReverseTriangleTris(b: Array<Point>) {
  if (b.length === 3) {
    return dup(b);
  }
  if (b.length === 9) {
    return dup([
      b[0], b[1], b[2],
      b[0], b[2], b[8],
      b[8], b[2], b[3],
      b[8], b[3], b[7],
      b[6], b[4], b[5],
    ]);
  }
  return dup([
    b[0], b[1], b[2],
    b[0], b[2], b[5],
    b[2], b[3], b[4],
    b[5], b[2], b[4],
  ]);
}

/*
.............########.....###....########..########.
.............##.....##...##.##...##.....##.##.....##
.............##.....##..##...##..##.....##.##.....##
.............########..##.....##.########..########.
.............##.....##.#########.##...##...##.....##
.............##.....##.##.....##.##....##..##.....##
.............########..##.....##.##.....##.########.
*/
function getBarbTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
  barb: number,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(-o.barb, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  let tailX = -o.length;
  if (t < 0) {
    if (-t < o.barb) {
      tailX = -o.length - t;
    } else {
      tailX = headX + o.barb;
    }
  }
  if (o.tail === false) {
    tailX = headX + o.barb;
  }
  const line1 = new Line([tailX, o.tailWidth / 2], 1, 0);
  const back = new Line([headX + o.barb, 0], [headX, o.width / 2]);
  const backIntersect = line1.intersectsWith(back);
  let i = backIntersect.intersect || new Point(tailX, o.tailWidth / 2);
  if (backIntersect.withinLine === false) {
    i = new Point(headX + o.barb, o.tailWidth / 2);
  }
  return [i, headX, tailX];
}

function getBarbLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
  barb: number,
}) {
  const [, , tailX] = getBarbTail(o);
  return [o.length, -tailX, o.length];
}

function getBarbDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, barb, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else if (barb != null) {
      width = barb * 6 * scale;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  if (barb == null) {
    barb = tailWidth * scale;
  }
  return {
    width, length, barb, tailWidth,
  };
}

function getBarbArrow(options: {
  length: number,
  width: number,
  barb: number,
  drawBorderBuffer: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const {
    length, drawBorderBuffer, tailWidth, barb, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getBarbTail(options);
  let arrowBorder;
  // let points;
  if (tail === false || backIntersect.x >= headX + barb) {
    arrowBorder = [
      new Point(-length + barb, 0),
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    // ];
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(backIntersect.x, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, 0),
      new Point(headX, width / 2),
      new Point(backIntersect.x, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[5]._dup(), arrowBorder[6]._dup(),
    //   arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[1]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[1]._dup(), arrowBorder[3]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    // ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, drawBorderBuffer);
  }
  return [arrowBorder, touchBorder, joinTail];
}

function getBarbTris(b: Array<Point>) {
  if (b.length === 4) {
    return dup([
      b[0], b[1], b[2],
      b[0], b[2], b[3],
    ]);
  }
  return dup([
    b[0], b[1], b[5],
    b[0], b[5], b[6],
    b[2], b[3], b[1],
    b[5], b[1], b[3],
    b[5], b[3], b[4],
  ]);
}

/*
................########..########..######..########
................##.....##.##.......##....##....##...
................##.....##.##.......##..........##...
................########..######...##..........##...
................##...##...##.......##..........##...
................##....##..##.......##....##....##...
................##.....##.########..######.....##...
*/
function getRectTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(0, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const tailX = -o.length;
  return [new Point(tailX, o.tailWidth / 2), headX, tailX];
}

function getRectLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
  align: 'start' | 'mid',
}) {
  if (o.align === 'mid') {
    return [o.length / 2, o.length / 2, o.length];
  }
  return [o.length, o.length, o.length];
}

function getRectDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  // barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getBarDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length * 6;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width / 6;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getRectArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  drawBorderBuffer: number,
  tailWidth: number,
  tail: number | boolean;
}) {
  const {
    length, drawBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getRectTail(options);
  let arrowBorder;
  // let points;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(-length, width / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    // ];
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(headX, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(headX, width / 2),
      new Point(headX, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
    //   arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    //   arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    // ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, drawBorderBuffer);
  }

  return [arrowBorder, touchBorder, joinTail];
}

function getRectTris(b: Array<Point>) {
  if (b.length === 4) {
    return dup([
      b[0], b[1], b[2],
      b[0], b[2], b[3],
    ]);
  }
  return dup([
    b[0], b[1], b[6],
    b[0], b[6], b[7],
    b[2], b[3], b[4],
    b[2], b[4], b[5],
  ]);
}
/*
..........             ...##.......####.##....##.########
..........             ...##........##..###...##.##......
..........             ...##........##..####..##.##......
..........             ...##........##..##.##.##.######..
..........             ...##........##..##..####.##......
..........             ...##........##..##...###.##......
..........             ...########.####.##....##.########
*/
//              |
//              |           \      00000000000000
//              |             \  00000000000000
//              |              00000000000000
//              |            00000000000000
//              |          00000000000000
//              |        00000000000000
//              |      00000000000000  \
//              |    00000000000000      \ LineWidth
//              |  00000000000000   o
//           -- |00000000000000       o   theta
//           A  |  0000000000          o
//         b |  |    000000             o
//           V  |    g 00               o
//           --- -------------------------------
//              |       |
//              |<----->|
//                  a
//
// theta = atan(height / width)
//
// angle g = 180 - theta - 90
// b = lineWidth * sin(g)
// a = lineWidth * cos(g)
function getLineTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }

  const theta = Math.atan(o.width / 2 / o.length);
  const g = Math.PI - theta - Math.PI / 2;
  const a = o.tailWidth * Math.cos(g);

  let headX = -o.length;
  let tailX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const topOutsideLine = new Line([headX + a, o.width / 2], [0, 0]);
  const topInsideLine = topOutsideLine.offset('bottom', o.tailWidth);
  const line = new Line([headX, o.tailWidth / 2], 1, 0);
  const outsideIntersect = topOutsideLine.intersectsWith(line).intersect
    || new Point(headX, o.tailWidth / 2);
  let insideIntersect = topInsideLine.intersectsWith(line).intersect
    || new Point(headX, o.tailWidth / 2);
  if (insideIntersect.x < -o.length) {
    insideIntersect = new Point(-o.length, o.tailWidth / 2);
  }
  let zeroPoint;
  const insideIntersectWithZero = topInsideLine
    .intersectsWith(new Line([-o.length, 0], 1, 0));
  if (!insideIntersectWithZero) {
    zeroPoint = -o.length;
  } else {
    zeroPoint = insideIntersectWithZero.intersect.x;
  }
  if (!insideIntersectWithZero.isWithinLine || o.tail === false) {
    tailX = -o.length;
  }
  let stubTail = false;
  if (t < 0) {
    if (-o.length - t > insideIntersect.x) {
      tailX = insideIntersect.x;
      stubTail = true;
    } else {
      tailX = -o.length - t;
    }
  }
  if (o.tail === false) {
    tailX = zeroPoint;
  }
  return [
    new Point(outsideIntersect.x, o.tailWidth / 2),
    headX, tailX, zeroPoint, topOutsideLine.p1, topInsideLine.p1,
    stubTail, insideIntersect,
  ];
}

function getLineLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const [, , tailX] = getLineTail(o);
  return [o.length, -tailX, o.length];
}

function getLineDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}
function getLineArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  drawBorderBuffer: number,
  tailWidth: number,
  tail: number | boolean,
}) {
  const {
    length, drawBorderBuffer, tailWidth, width, tail,
  } = options;

  const [
    frontIntersect, , tailX, zeroPoint, outsideTop, insideTop, stubTail,
    insideIntersect,
  ] = getLineTail(options);
  let arrowBorder;
  // let points;
  if (tail === false || frontIntersect.x <= tailX) {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(0, 0),
      new Point(outsideTop.x, outsideTop.y),
      new Point(insideTop.x, insideTop.y),
      new Point(zeroPoint, 0),
      new Point(insideTop.x, -insideTop.y),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
    //   arrowBorder[4]._dup(), arrowBorder[1]._dup(), arrowBorder[3]._dup(),
    //   arrowBorder[3]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    // ];
  } else if (stubTail) {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(0, 0),
      new Point(outsideTop.x, outsideTop.y),
      new Point(insideTop.x, insideTop.y),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(insideTop.x, -insideTop.y),
    ];
    // points = [
    //   arrowBorder[3]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[1]._dup(),
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
    //   arrowBorder[6]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
    // ];
  } else {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(0, 0),
      new Point(outsideTop.x, outsideTop.y),
      new Point(insideTop.x, insideTop.y),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(tailX, tailWidth / 2),
      new Point(tailX, -tailWidth / 2),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(insideTop.x, -insideTop.y),
    ];
    // points = [
    //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[8]._dup(),
    //   arrowBorder[8]._dup(), arrowBorder[1]._dup(), arrowBorder[7]._dup(),
    //   arrowBorder[7]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
    //   arrowBorder[4]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[2]._dup(),
    //   arrowBorder[5]._dup(), arrowBorder[7]._dup(), arrowBorder[4]._dup(),
    //   arrowBorder[6]._dup(), arrowBorder[7]._dup(), arrowBorder[5]._dup(),
    // ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, drawBorderBuffer);
  }
  return [arrowBorder, touchBorder, joinTail];
}

function getLineTris(b: Array<Point>) {
  if (b.length === 6) {
    return dup([
      b[0]._dup(), b[1]._dup(), b[5]._dup(),
      b[5]._dup(), b[1]._dup(), b[4]._dup(),
      b[4]._dup(), b[1]._dup(), b[3]._dup(),
      b[3]._dup(), b[1]._dup(), b[2]._dup(),
    ]);
  }
  if (b.length === 7) {
    return dup([
      b[3]._dup(), b[1]._dup(), b[2]._dup(),
      b[3]._dup(), b[4]._dup(), b[1]._dup(),
      b[0]._dup(), b[1]._dup(), b[6]._dup(),
      b[6]._dup(), b[1]._dup(), b[5]._dup(),
      b[5]._dup(), b[1]._dup(), b[4]._dup(),
    ]);
  }
  return dup([
    b[0]._dup(), b[1]._dup(), b[8]._dup(),
    b[8]._dup(), b[1]._dup(), b[7]._dup(),
    b[7]._dup(), b[1]._dup(), b[4]._dup(),
    b[4]._dup(), b[1]._dup(), b[2]._dup(),
    b[3]._dup(), b[4]._dup(), b[2]._dup(),
    b[5]._dup(), b[7]._dup(), b[4]._dup(),
    b[6]._dup(), b[7]._dup(), b[5]._dup(),
  ]);
}

/*
.......########...#######..##.......##....##..######....#######..##....##
.......##.....##.##.....##.##........##..##..##....##..##.....##.###...##
.......##.....##.##.....##.##.........####...##........##.....##.####..##
.......########..##.....##.##..........##....##...####.##.....##.##.##.##
.......##........##.....##.##..........##....##....##..##.....##.##..####
.......##........##.....##.##..........##....##....##..##.....##.##...###
.......##.........#######..########....##.....######....#######..##....##
*/
function getPolygonTail(o: {
  radius: number,
  sides: number,
  tailWidth: number,
  rotation: number,
  tail: boolean | number,
}) {
  if (o.tail === false) {
    return getPolygonPoints({
      radius: o.radius,
      sides: o.sides,
      sidesToDraw: o.sides,
      rotation: 0,
      offset: new Point(-o.radius, 0),
      direction: 1,
    });
  }
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(0, t);
  const topTheta = Math.PI - Math.asin(o.tailWidth / 2 / o.radius);
  const bottomTheta = Math.PI + Math.asin(o.tailWidth / 2 / o.radius);
  const sideAngle = Math.PI * 2 / o.sides;

  const topSideNum = Math.floor(topTheta / sideAngle);
  const bottomSideNum = Math.floor(bottomTheta / sideAngle);

  const points = getPolygonPoints({
    radius: o.radius,
    sides: o.sides,
    sidesToDraw: o.sides,
    rotation: 0,
    offset: new Point(-o.radius, 0),
    direction: 1,
  });
  const topSide = new Line(
    points[topSideNum], points[topSideNum + 1],
  );
  const bottomSide = new Line(
    points[bottomSideNum], points[bottomSideNum + 1],
  );
  const hLineTop = new Line([-o.radius, o.tailWidth / 2], 1, 0);
  const hLineBottom = new Line([-o.radius, -o.tailWidth / 2], 1, 0);

  const topIntersect = hLineTop.intersectsWith(topSide).intersect
    || new Point(-o.radius, o.tailWidth / 2);
  const bottomIntersect = hLineBottom.intersectsWith(bottomSide).intersect
    || new Point(-o.radius, -o.tailWidth / 2);
  const outline = [
    topIntersect,
    new Point(-o.radius * 2 - t, o.tailWidth / 2),
    new Point(-o.radius * 2 - t, -o.tailWidth / 2),
    bottomIntersect,
    ...points.slice(bottomSideNum + 1),
    ...points.slice(0, topSideNum + 1),
  ];
  return outline;
}

function getPolygonLength(o: {
  radius: number,
  tail: boolean | number,
  align: 'mid' | 'start',
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = Math.max(0, o.tail);
  }
  if (o.align === 'mid') {
    if (o.tail === false) {
      return [o.radius, o.radius, o.radius * 2 + t];
    }
    return [o.radius, o.radius, o.radius * 2 + t];
  }
  if (typeof o.tail === 'boolean') {
    return [o.radius * 2, o.radius * 2, o.radius * 2];
  }
  const l = o.radius * 2 + t;
  return [l, l, l];
}

function getPolygonDefaults(o: {
  radius?: number,
  sides?: number,
  tailWidth?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    radius, tailWidth, scale, sides,
  } = o;
  scale = scale == null ? 1 : scale;

  if (radius == null) {
    if (tailWidth != null) {
      radius = tailWidth * 3 * scale;
    } else {
      radius = 1;
    }
  }
  if (tailWidth == null) {
    tailWidth = radius / 3 / scale;
  }
  if (sides == null) {
    sides = 30;
  }
  return {
    radius, tailWidth, sides,
  };
}
function getPolygonArrow(options: {
  // length: number,
  // width: number,
  radius: number,
  start: Point,
  end: Point,
  drawBorderBuffer: number,
  tailWidth: number,
  sides: number,
  rotation: number,
  tail: number | boolean,
}) {
  const {
    drawBorderBuffer, tailWidth, radius, tail,
  } = options;

  const outline = getPolygonTail(options);
  // const points: Array<Point> = [];
  // for (let i = 1; i < outline.length; i += 1) {
  //   points.push(new Point(-radius, 0));
  //   points.push(outline[i - 1]);
  //   points.push(outline[i]);
  // }
  // points.push(new Point(-radius, 0));
  // points.push(outline[outline.length - 1]);
  // points.push(outline[0]);
  let t = 0;
  let tailJoin;
  if (tail === false) {
    tailJoin = [new Point(-radius * 2, tailWidth / 2), new Point(-radius * 2, -tailWidth / 2)];
  } else {
    if (typeof tail === 'number') {
      t = Math.max(tail, 0);
    }
    tailJoin = [
      new Point(-radius * 2 - t, tailWidth / 2),
      new Point(-radius * 2 - t, -tailWidth / 2),
    ];
  }
  let touchBorder = outline;
  if (drawBorderBuffer > 0) {
    touchBorder = getTouchBorder(radius * 2 + t, radius * 2, drawBorderBuffer);
  }
  return [outline, touchBorder, tailJoin];
}

function getPolygonTris(b: Array<Point>) {
  const points: Array<Point> = [];
  for (let i = 1; i < b.length; i += 1) {
    points.push(b[0]);
    points.push(b[i - 1]);
    points.push(b[i]);
  }
  return points;
}


function getArrowLength(options: {
  head: TypeArrowHead,
  length: number,
  tailWidth: number,
  width: number,
  radius: number,
  align: 'mid' | 'start',
  tail: number | boolean,
  barb: number,
  // reverse: boolean,
}) {
  const { head, length } = options;
  if (head === 'circle' || head === 'polygon') {
    return getPolygonLength(options);
  }
  if (head === 'line') {
    return getLineLength(options);
  }
  if (head === 'reverseTriangle') {
    return getReverseTriLength(options);
  }
  if (head === 'triangle') {
    return getTriangleArrowLength(options);
  }
  if (head === 'barb') {
    return getBarbLength(options);
  }
  if (head === 'rectangle' || head === 'bar') {
    return getRectLength(options);
  }
  return [length, length, length];
}


function getArrow(options: {
  head: TypeArrowHead,
  length: number,
  width: number,
  barb: number,
  start: Point,
  end: Point,
  drawBorderBuffer: number,
  tailWidth: number,
  radius: number,
  rotation: number,
  sides: number,
  reverse: boolean,
  tail: number | boolean,
}) {
  // let points;
  let border;
  let touchBorder;
  let tail;
  const o = joinObjects({}, options);
  if (o.drawPosition != null) {
    o.drawPosition = getPoint(o.drawPosition);
  }
  if (o.tailWidth > 0 && o.width < o.tailWidth) {
    o.width = o.tailWidth * 0.001;
  }
  if (o.head === 'barb') {
    [border, touchBorder, tail] = getBarbArrow(o);
  } else if (o.head === 'rectangle' || o.head === 'bar') {
    [border, touchBorder, tail] = getRectArrow(o);
  } else if (o.head === 'line') {
    [border, touchBorder, tail] = getLineArrow(o);
  } else if (o.head === 'polygon' || o.head === 'circle') {
    [border, touchBorder, tail] = getPolygonArrow(o);
  } else if (o.head === 'reverseTriangle') {
    [border, touchBorder, tail] = getReverseTriangleArrow(o);
  } else {
    [border, touchBorder, tail] = getTriangleArrow(o);
  }
  const [, joinLength, fullLength] = getArrowLength(o);
  const [newBorder, borderBuffer, newTail] = orientArrow(
    border, touchBorder, tail, fullLength, joinLength, o,
  );
  // const { line } = o;

  // let lineDelta = 0;
  // if (line != null && line.widthIs === 'mid') {
  //   lineDelta = line.width / 2;
  // }
  // if (line != null && (line.widthIs === 'outside' || line.widthIs === 'negative')) {
  //   lineDelta = line.width;
  // }

  // const increaseArrowByOffset = (pnts: Array<Point>, delta) => {
  //   // if (delta > 0.01) {
  //   //   debugger;
  //   // }
  //   const [, outline] = makePolyLine(
  //     pnts, delta, true, 'negative', 'auto', 0.1,
  //     10, Math.PI / 7, [], false,
  //     2, 'negative', 0, [],
  //   );
  //   // return [outline[0][0], outline[0][1], outline[0][3]];
  //   return outline[0];
  // };

  // let outline: Array<Point>;
  // if (lineDelta > 0) {
  //   outline = increaseArrowByOffset(newBorder, lineDelta);
  // } else {  // $FlowFixMe
  //   outline = newBorder.map(p => p._dup());
  // }
  // const borderOut = [outline];

  // const { drawBorderBuffer } = o;
  // let borderBuffer = drawBorderBuffer;
  // if (typeof drawBorderBuffer === 'number') {
  //   borderBuffer = [increaseArrowByOffset(border, lineDelta + drawBorderBuffer)];
  // }

  // let pointsToUse = newPoints;
  // if (line != null) {
  //   pointsToUse = newBorder;
  // }
  return [newBorder, [borderBuffer], newTail];
}

function getArrowTris(border: Array<Point>, options: { head: TypeArrowHead }) {
  if (options.head === 'triangle') {
    return getTriangleTris(border);
  }
  if (options.head === 'reverseTriangle') {
    return getReverseTriangleTris(border);
  }
  if (options.head === 'barb') {
    return getBarbTris(border);
  }
  if (options.head === 'rectangle' || options.head === 'bar') {
    return getRectTris(border);
  }
  if (options.head === 'polygon' || options.head === 'circle') {
    return getPolygonTris(border);
  }
  // if (options.head === 'line') {
  return getLineTris(border);
  // }
}

function defaultArrowOptions(
  o: Object,
) {
  const defaults = {
    align: 'tip',
    tail: false,
    angle: 0,
    drawPosition: new Point(0, 0),
    scale: 1,
  };
  if (o.head === 'triangle' || o.head == null) {
    return joinObjects({}, defaults, o, getTriangleDefaults(o), {
      head: 'triangle',
    });
  }
  if (o.head === 'polygon' || o.head === 'circle') {
    return joinObjects({}, defaults, o, getPolygonDefaults(o));
  }
  if (o.head === 'barb') {
    return joinObjects({}, defaults, o, getBarbDefaults(o));
  }
  if (o.head === 'reverseTriangle') {
    return joinObjects({}, defaults, o, getReverseTriDefaults(o));
  }
  if (o.head === 'bar') {
    return joinObjects({}, defaults, o, getBarDefaults(o));
  }
  if (o.head === 'line') {
    return joinObjects({}, defaults, o, getLineDefaults(o));
  }
  return joinObjects({}, defaults, o, getRectDefaults(o));
}

function simplifyArrowOptions(
  arrowIn: null | TypeArrowHead | {
    start: OBJ_Arrow | TypeArrowHead,
    end: OBJ_Arrow | TypeArrowHead,
  } & OBJ_Arrow,
  tailWidth: number | null,
  includeTailByDefault: boolean = false,
) {
  if (arrowIn == null) {
    return undefined;
  }
  let arrow;
  if (typeof arrowIn === 'string') {  // $FlowFixMe
    arrow = { // $FlowFixMe
      start: arrowIn, // $FlowFixMe
      end: arrowIn,
    };
  } else {
    arrow = arrowIn;
  }
  const optionsForBoth = joinObjectsWithOptions({ except: ['end', 'start'] }, {}, arrow);

  const out = {};
  const processEnd = (startOrEnd: 'start' | 'end') => {
    if (typeof arrow[startOrEnd] === 'string') {  // $FlowFixMe
      arrow[startOrEnd] = { // $FlowFixMe
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
      const defaults = {};
      // let defaultTailWidth = {};
      if (tailWidth != null) {
        defaults.tailWidth = tailWidth;
      }
      if (includeTailByDefault) {
        defaults.tail = true;
      }
      const o = joinObjectsWithOptions(
        { except: ['end', 'start'] }, defaults, arrow[startOrEnd],
      );
      out[startOrEnd] = joinObjects(
        defaultArrowOptions(o),
        o,
      );
      out[startOrEnd].drawPosition = getPoint(out[startOrEnd].drawPosition);
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
  defaultArrowOptions,
  getArrowTris,
};

// // Draw examples of arrows

// const figure = new Fig.Figure({ limits: [-3, -3, 6, 6]});

// let y = 3;
// let yStep = -0.7;
// let xs = [-1, 0, 1];
// let xStep = 1;
// let index = 0;

// const addArrow = (name, head, length, tail = false, align = 'tip', sides = 100) => {
//   if (index % 3 === 0) {
//     y += yStep;
//   }
//   x = xs[index % 3];
//   index += 1;
//   return {
//     name,
//     method: 'shapes.arrow',
//     options: {
//       head,
//       length,
//       radius: 0.25,
//       tail,
//       position: [x, y],
//       width: 0.5,
//       tailWidth: 0.1,
//       sides,
//       align,
//     },
//   };
// }

// figure.add([
//   addArrow('t1', 'triangle', 0.5, false, 'tip'),
//   addArrow('t2', 'triangle', 0.5, 0),
//   addArrow('t3', 'triangle', 0.7, 0.2),
//   addArrow('b1', 'barb', 0.5, false, 'tip'),
//   addArrow('b2', 'barb', 0.5, 0),
//   addArrow('b3', 'barb', 0.7, 0.2),
//   addArrow('l1', 'line', 0.5, false, 'tip'),
//   addArrow('l2', 'line', 0.5, 0),
//   addArrow('l3', 'line', 0.7, 0.2),
//   addArrow('bar1', 'bar', 0.1, false, 'tip'),
//   addArrow('bar2', 'bar', 0.1, 0),
//   addArrow('bar3', 'bar', 0.7, 0.6),
//   addArrow('c1', 'circle', 1, false, 'tip'),
//   addArrow('c2,', 'circle', 1, 0),
//   addArrow('c3', 'circle', 1, 0.2),
//   addArrow('p1', 'polygon', 1, false, 'tip', 6),
//   addArrow('p2', 'polygon', 1, 0, 'tip', 6),
//   addArrow('p3', 'polygon', 1, 0.2, 'tip', 6),
//   addArrow('rt1', 'reverseTriangle', 0.5, false, 'tip'),
//   addArrow('rt2', 'reverseTriangle', 0.5, 0),
//   addArrow('rt3', 'reverseTriangle', 0.7, 0.2),
// ])
