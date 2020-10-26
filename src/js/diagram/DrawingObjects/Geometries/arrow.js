// @flow
import {
  Point, Line, Transform,
} from '../../../tools/g2';
import {
  joinObjects, joinObjectsWithOptions,
} from '../../../tools/tools';
import { getPolygonPoints, getTrisFillPolygon } from './polygon/polygon';

/**
 * Arrow heads
 *
 * `'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle'`
 *
 * @see {@link OBJ_Arrow} for properties related to each arrow head
 */
export type ArrowHead = 'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle';

/**
 * Arrow options object.
 *
 * Lines and polylines can be terminated with different styles of arrows. The
 * `head` parameter is used to define the style of arrow head.
 *
 * ### `head: 'triangle'`
 *
 * ![](./assets1/arrow_triangle.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * Use `reverse` to reverse the triangle:
 *
 * ![](./assets1/arrow_reversetri.png)
 *
 * ### `head: 'barb'`
 *
 * ![](./assets1/arrow_barb.png)
 *
 * Use `length`, `width` and `barb` to customize head shape.
 *
 * ### `head: 'line'`
 *
 * ![](./assets1/arrow_line.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### `head: 'circle'`
 *
 * ![](./assets1/arrow_circle.png)
 *
 * Use `radius` and `sides` to customize head shape.
 *
 * ### `head: 'polygon'`
 *
 * ![](./assets1/arrow_polygon.png)
 *
 * Use `radius`, `sides` and `rotation` to customize head shape.
 *
 * ### `head: 'bar'`
 *
 * ![](./assets1/arrow_bar.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### `head: 'rectangle'`
 *
 * ![](./assets1/arrow_rectangle.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### General
 *
 * For arrow heads that use `length` and `width` properties, the `length` is the
 * dimension along the line.
 *
 * All properties have default values that can be scaled with the `scale`
 * property. So a `scale` of 2 will double the size of the default arrow.
 *
 * @property {ArrowHead} [head]
 * @property {number} [scale] scale the default dimensions of the arrow
 * @property {number} [length] dimension of the arrow head along the line
 * @property {number} [width] dimension of the arrow head along the line width
 * @property {number} [rotation] rotation of the polygon
 * @property {number} [reverse] reverse the direction of the triangle arrow head
 * @property {number} [sides] number of sides in polygon or circle arrow head
 * @property {number} [radius] radius of polygon or circle arrow head
 * @property {number} [barb] barb length (along the length of the line) of the
 * barb arrow head
 *
 * @example
 * // Line with triangle arrows on both ends
 * diagram.addElement({
 *   name: 'a',
 *   method: 'shapes.polyline',
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
 *   method: 'shapes.polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: {
 *       end: {
 *         head: 'barb',
 *         width: 0.15,
 *         length: 0.25,
 *         barb: 0.05,
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Line with two different arrow ends scaled by 0.7x
 * diagram.addElement({
 *   name: 'a',
 *   method: 'shapes.polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: {
 *       scale: 1.2,
 *       start: 'bar',
 *       end: {
 *         head: 'polygon',
 *         sides: 6,
 *       },
 *     },
 *   },
 * });
 */
export type OBJ_Arrow = {
  head?: ArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  reverse?: number,
  sides?: number,
  radius?: number,
  barb?: number,
}

/**
 * Line end's arrow definition options object.
 *
 * `start` and `end` define the properties of the arrows at the start and
 * end of the line. Instead of defining {@link OBJ_Arrow} objects for the
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
 * @property {OBJ_Arrow | ArrowHead} [start] arrow at start of line
 * @property {OBJ_Arrow | ArrowHead} [end] arrow at end of line
 * @property {ArrowHead} [head] default head to use for start and end arrow
 * @property {number} [scale] default scale to use for start and end arrow
 * @property {number} [length] default length to use for start and end arrow
 * @property {number} [width] default width to use for start and end arrow
 * @property {number} [rotation] default rotation to use for start and end arrow
 * @property {number} [reverse] default reverse to use for start and end arrow
 * @property {number} [sides] default sides to use for start and end arrow
 * @property {number} [radius] default radius to use for start and end arrow
 * @property {number} [barb] default barb to use for start and end arrow
 */
export type OBJ_Arrows = {
  start: OBJ_Arrow | ArrowHead,
  end: OBJ_Arrow | ArrowHead,
  head?: ArrowHead,
  scale?: number,
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
  const newPoints = points.map(p => p.transformBy(matrix));
  const newBorder = border.map(p => p.transformBy(matrix));
  const newTouchBorder = touchBorder.map(p => p.transformBy(matrix));
  const newTail = tail.map(p => p.transformBy(matrix));
  return [
    newPoints, newBorder, newTouchBorder, newTail,
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
  let arrowBorder = [
    new Point(0, -width / 2),
    new Point(length, 0),
    new Point(0, width / 2),
  ];
  if (reverse) {
    const tanAngle = width / 2 / length;
    const x = lineWidth / 2 / tanAngle;
    arrowBorder = [
      new Point(0, -lineWidth / 2),
      new Point(x, -lineWidth / 2),
      new Point(length, -width / 2),
      new Point(length, width / 2),
      new Point(x, lineWidth / 2),
      new Point(0, lineWidth / 2),
      // new Point(length, -width / 2),
      // new Point(0, 0),
      // new Point(length, width / 2),
    ];
  }
  let points;
  if (reverse) {
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
      arrowBorder[0]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
      arrowBorder[1]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    ];
  } else {
    points = arrowBorder.map(p => p._dup());
  }
  let touchBorder = arrowBorder;
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
  // if (reverse) {
  //   const tanAngle = width / 2 / length;
  //   const x = lineWidth / 2 / tanAngle;
  //   tail = [
  //     new Point(x / 2, lineWidth / 2),
  //     new Point(x / 2, -lineWidth / 2),
  //   ];
  // }
  return orientArrow(points, arrowBorder, touchBorder, start, end, tail);
}

function getBarbArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
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
  end: Point,
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
  end: Point,
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
  end: Point,
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
  end: Point,
  touchBorderBuffer: number,
  lineWidth: number,
  radius: number,
  rotation: number,
  sides: number,
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
  width: number,
  radius: number,
  reverse: boolean,
}) {
  const {
    head, width, length, lineWidth, radius, reverse,
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
  // if (head === 'triangle' && reverse) {
  //   return 0;
  // }
  return length;
}


function defaultArrowOptions(
  head: ArrowHead,
  lineWidth: number,
  scaleIn: number = 1,
) {
  const scale = 6 * scaleIn;
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
      width: lineWidth * scale * 0.8,
      length: lineWidth * scale * 0.8,
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
