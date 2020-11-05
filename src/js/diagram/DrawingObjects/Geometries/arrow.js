// @flow
import {
  Point, Line, Transform, getPoint,
} from '../../../tools/g2';
import {
  joinObjects, joinObjectsWithOptions,
} from '../../../tools/tools';
import { getPolygonPoints } from './polygon/polygon';

/**
 * Arrow heads
 *
 * `'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle'`
 *
 * @see {@link OBJ_Arrow} for properties related to each arrow head
 */

/**
 * Arrow end for a line or polyline.
 *
 * ![](./assets1/arrow_line.png)
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
 * @property {ArrowHead} [head] head style (`'triangle'`)
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
 * diagram.addElement({
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
 * diagram.addElement({
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
 * diagram.addElements([
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
  head?: ArrowHead,
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
 * @property {OBJ_LineArrow | ArrowHead} [start] arrow at start of line
 * @property {OBJ_LineArrow | ArrowHead} [end] arrow at end of line
 * @property {ArrowHead} [head] default head to use for start and end arrow
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
  start: OBJ_LineArrow | ArrowHead,
  end: OBJ_LineArrow | ArrowHead,
  head?: ArrowHead,
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

export type ArrowHead = 'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'reverseTriangle';

function orientArrow(
  points: Array<Point>,
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
      .translate(options.drawPosition).matrix();
  } else if (options.align === 'tip') {
    matrix = new Transform()
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  } else if (options.align === 'mid') {
    console.log(length / 2)
    matrix = new Transform()
      .translate(length / 2, 0)
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  } else {
    matrix = new Transform()
      .translate(joinLength, 0)
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  }
  // const line = new Line(start, end);
  // const matrix = new Transform().rotate(line.angle()).translate(start).matrix();
  const newPoints = points.map(p => p.transformBy(matrix));
  const newBorder = border.map(p => p.transformBy(matrix));
  const newTouchBorder = touchBorder.map(p => p.transformBy(matrix));
  const newTail = tail.map(p => p.transformBy(matrix));
  return [
    newPoints, newBorder, newTouchBorder, newTail,
    // points.length,
  ];
}

function getTouchBorder(l, w, buffer) {
  return [
    new Point(-l -buffer, -w / 2 - buffer),
    new Point(buffer, -w / 2 - buffer),
    new Point(buffer, w / 2 + buffer),
    new Point(-l - buffer, w / 2 + buffer),
  ];
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
  tail: boolean,
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
  return [new Point(tailX, o.lineWidth / 2), headX, tailX];
}


function getTriangleArrowLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
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
  touchBorderBuffer: number,
  tail: boolean,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getTriangleArrowTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
    points = arrowBorder.map(p => p._dup());
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
    points = [
      arrowBorder[4]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
      arrowBorder[6]._dup(), arrowBorder[0]._dup(), arrowBorder[1]._dup(),
      arrowBorder[6]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
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
  tail: boolean,
}) {
  const hLine = new Line([-o.length, o.tailWidth / 2], 1, 0);
  let headTop = new Line([-o.length, 0], [0, o.width / 2]);
  let i = hLine.intersectsWith(headTop).intersect;
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(i.x, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
    headTop = new Line([headX, 0], [0, o.width / 2]);
    i = hLine.intersectsWith(headTop).intersect;
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
  tail: boolean,
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
  touchBorderBuffer: number,
  tail: boolean | number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [intersect, headX, tailX] = getReverseTriTail(options);
  let arrowBorder;
  let points;
  if (tail === false || tailX >= intersect.x) {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(-length, 0),
      new Point(0, width / 2),
    ];
    points = arrowBorder.map(p => p._dup());
  } else if (tailX > headX) {
    const vLine = new Line([tailX, -tailWidth / 2], [tailX, 0]);
    const topLine = new Line([-length, 0], [0, width / 2]);
    const i = vLine.intersectsWith(topLine).intersect;
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(intersect.x, -tailWidth / 2),
      new Point(tailX, -tailWidth / 2),
      new Point(i.x, -i.y),
      new Point(-length, 0),
      new Point(i.x, i.y),
      new Point(tailX, tailWidth / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(0, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[8]._dup(),
      arrowBorder[1]._dup(), arrowBorder[7]._dup(), arrowBorder[8]._dup(),
      arrowBorder[1]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[6]._dup(),
      arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(intersect.x, -tailWidth / 2),
      new Point(-length, -tailWidth / 2),
      new Point(-length, tailWidth / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(0, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
      arrowBorder[1]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
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
  tail: boolean,
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
  let i = backIntersect.intersect;
  if (backIntersect.withinLine === false) {
    i = new Point(headX + o.barb, o.tailWidth / 2);
  }
  return [i, headX, tailX];
}

function getBarbLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
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
  touchBorderBuffer: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, barb, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getBarbTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX + barb) {
    arrowBorder = [
      new Point(-length + barb, 0),
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
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
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
      arrowBorder[0]._dup(), arrowBorder[5]._dup(), arrowBorder[6]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[1]._dup(),
      arrowBorder[5]._dup(), arrowBorder[1]._dup(), arrowBorder[3]._dup(),
      arrowBorder[5]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
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
  tail: boolean,
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
  return [new Point(tailX, o.lineWidth / 2), headX, tailX];
}

function getRectLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
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
  touchBorderBuffer: number,
  tailWidth: number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getRectTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(-length, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
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
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
      arrowBorder[0]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }

  return [points, arrowBorder, touchBorder, joinTail];
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
  tail: boolean,
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
  const outsideIntersect = topOutsideLine.intersectsWith(line).intersect;
  let insideIntersect = topInsideLine.intersectsWith(line).intersect;
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
  tail: boolean,
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
  touchBorderBuffer: number,
  tailWidth: number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;

  const [
    frontIntersect, , tailX, zeroPoint, outsideTop, insideTop, stubTail,
    insideIntersect,
  ] = getLineTail(options);
  let arrowBorder;
  let points;
  if (tail === false || frontIntersect.x <= tailX) {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(zeroPoint, 0),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[5]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  } else if (stubTail) {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[6]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[6]._dup(),
      arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[3]._dup(), arrowBorder[5]._dup(), arrowBorder[6]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(tailX, -tailWidth / 2),
      new Point(tailX, tailWidth / 2),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[8]._dup(),
      arrowBorder[2]._dup(), arrowBorder[5]._dup(), arrowBorder[8]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[5]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[5]._dup(), arrowBorder[7]._dup(), arrowBorder[8]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
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
  tail: boolean,
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

  const topIntersect = hLineTop.intersectsWith(topSide).intersect;
  const bottomIntersect = hLineBottom.intersectsWith(bottomSide).intersect;
  const outline = [
    ...points.slice(0, topSideNum + 1),
    topIntersect,
    new Point(-o.radius * 2 - t, o.tailWidth / 2),
    new Point(-o.radius * 2 - t, -o.tailWidth / 2),
    bottomIntersect,
    ...points.slice(bottomSideNum + 1),
  ];
  return outline;
}

function getPolygonLength(o: {
  radius: number,
  tail: boolean,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = Math.max(0, o.tail);
  }
  if (o.align === 'mid') {
    if (o.tail === false) {
      return [0, 0, o.radius * 2 + t];
    }
    return [o.radius, o.radius, o.radius * 2 + t];
  }
  if (typeof o.tail === 'boolean') {
    return [o.radius, o.radius, o.radius];
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
  touchBorderBuffer: number,
  tailWidth: number,
  sides: number,
  rotation: number,
}) {
  const {
    touchBorderBuffer, tailWidth, radius, tail,
  } = options;

  const outline = getPolygonTail(options);
  const points = [];
  for (let i = 1; i < outline.length; i += 1) {
    points.push(new Point(-radius, 0));
    points.push(outline[i - 1]);
    points.push(outline[i]);
  }
  points.push(new Point(-radius, 0));
  points.push(outline[outline.length - 1]);
  points.push(outline[0]);
  let t = 0;
  let tailJoin;
  if (tail === false) {
    tailJoin = [new Point(-radius, tailWidth / 2), new Point(-radius, -tailWidth / 2)];
  } else {
    if (typeof tail === 'number') {
      t = Math.max(tail, 0);
    }
    tailJoin = [new Point(-radius - t, tailWidth / 2), new Point(-radius - t, -tailWidth / 2)];
  }
  let touchBorder = outline;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(radius * 2 + t, radius * 2, touchBorderBuffer);
  }
  return [points, outline, touchBorder, tailJoin];
}


function getArrowLength(options: {
  head: ArrowHead,
  length: number,
  tailWidth: number,
  width: number,
  radius: number,
  // reverse: boolean,
}) {
  const { head, length } = options;
  if (head === 'circle' || head === 'polygon') {
    return getPolygonLength(options);
  }
  if (head === 'line') {
    // const line = new Line([0, -width / 2], [length, 0]);
    // const horizontal = new Line([0, -tailWidth], [length, -tailWidth]);
    // const i = horizontal.intersectsWith(line).intersect;
    // return length - i.x;
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
  // if (head === 'triangle' && reverse) {
  //   return 0;
  // }
  return length;
}


function getArrow(options: {
  head: ArrowHead,
  length: number,
  width: number,
  barb: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
  tailWidth: number,
  radius: number,
  rotation: number,
  sides: number,
  reverse: boolean,
}) {
  let points;
  let border;
  let touchBorder;
  let tail;
  if (options.tailWidth > 0 && options.width < options.tailWidth) {
    options.width = options.tailWidth * 0.001;
  }
  if (options.head === 'barb') {
    [points, border, touchBorder, tail] = getBarbArrow(options);
  } else if (options.head === 'rectangle' || options.head === 'bar') {
    [points, border, touchBorder, tail] = getRectArrow(options);
  } else if (options.head === 'line') {
    [points, border, touchBorder, tail] = getLineArrow(options);
  } else if (options.head === 'polygon' || options.head === 'circle') {
    [points, border, touchBorder, tail] = getPolygonArrow(options);
  } else if (options.head === 'reverseTriangle') {
    [points, border, touchBorder, tail] = getReverseTriangleArrow(options);
  } else {
    [points, border, touchBorder, tail] = getTriangleArrow(options);
  }
  const [, joinLength, fullLength] = getArrowLength(options);
  return orientArrow(
    points, border, touchBorder, tail, fullLength, joinLength, options,
  );
}

function defaultArrowOptions(
  // head: ArrowHead,
  // tailWidth: number,
  // scaleIn: number = 1,
  o: Object,
) {
  // const scale = 6 * o.scale;
  const defaults = {
    align: 'tip',
    tail: false,
    angle: 0,
    drawPosition: new Point(0, 0),
    scale: 1,
    // tailWidth,
  };
  if (o.head === 'triangle' || o.head == null) {
    // return getTriangleDefaults(o);
    return joinObjects({}, defaults, getTriangleDefaults(o), {
      head: 'triangle',
      // width: o.tailWidth * scale,
      // length: o.tailWidth * scale,
      // reverse: false,
    });
  }
  if (o.head === 'polygon' || o.head === 'circle') {
    return joinObjects({}, defaults, getPolygonDefaults(o));
  }
  if (o.head === 'barb') {
    return joinObjects({}, defaults, getBarbDefaults(o));
  }
  if (o.head === 'reverseTriangle') {
    return joinObjects({}, defaults, getReverseTriDefaults(o));
  }
  if (o.head === 'bar') {
    return joinObjects({}, defaults, getBarDefaults(o));
  }
  if (o.head === 'line') {
    return joinObjects({}, defaults, getLineDefaults(o));
  }
  return joinObjects({}, defaults, getRectDefaults(o));
}

function simplifyArrowOptions(
  arrowIn: ?{
    start: OBJ_Arrow | ArrowHead,
    end: OBJ_Arrow | ArrowHead,
  } & OBJ_Arrow | ArrowHead,
  tailWidth: number | null,
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
      let defaultTailWidth = {};
      if (tailWidth != null) {
        defaultTailWidth = { tailWidth };
      }
      const o = joinObjectsWithOptions(
        { except: ['end', 'start'] }, defaultTailWidth, arrow[startOrEnd],
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
};

// // Draw examples of arrows

// const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

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

// diagram.addElements([
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