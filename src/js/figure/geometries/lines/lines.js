// @flow
import { cornerLine, lineToCorners } from './corners';
import { lineToDash } from './dashes';
import {
  Line, Point, threePointAngleMin, threePointAngle,
} from '../../../tools/g2';
import {
  joinObjects,
} from '../../../tools/tools';
import {
  getArrow, getArrowLength, simplifyArrowOptions,
} from '../arrow';
import type { TypeDash } from '../../../tools/types';
import type { TypeArrowHead } from '../arrow';
import type { OBJ_Arrow } from '../../FigurePrimitives/FigurePrimitives';

/* eslint-disable yoda */

// A thick line is defined from:
//  * A reference line
//  * A width
//  * Where the reference line is relative to the width
//    ('mid', 'inside', 'outside')
//  * How to deal with the corners in the line
//

// Convert line segments that define the outer boundaries of a line into
// triangles for drawing in WebGL
//
//                        outside
// p1    ----------------------------------------------   p2
//       2, 4
//
//       1                                         3, 5
// p1    ----------------------------------------------   p2
//                        inside
//
function lineSegmentsToPoints(
  lineSegments: Array<Array<Line>>,
  linePrimitives: boolean,
  borderIs: 'negative' | 'positive' | 'line' | Array<Array<Point>> = 'line',
  holeIs: 'negative' | 'positive' | Array<Array<Point>> = [[]],
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const tris = [];
  let border = [];
  let hole = [[]];
  lineSegments.forEach((lineSegment) => {
    const negative = lineSegment[0];
    const positive = lineSegment.slice(-1)[0];
    if (linePrimitives) {
      for (let l = 0; l < lineSegment.length; l += 1) {
        tris.push(lineSegment[l].p1._dup());
        tris.push(lineSegment[l].p2._dup());
      }
    } else {
      tris.push(positive.p1._dup());
      tris.push(positive.p2._dup());
      tris.push(negative.p1._dup());
      tris.push(negative.p1._dup());
      tris.push(positive.p2._dup());
      tris.push(negative.p2._dup());
    }
    if (borderIs === 'line') {
      border.push([
        negative.p1._dup(),
        negative.p2._dup(),
        positive.p2._dup(),
        positive.p1._dup(),
      ]);
    } else if (borderIs === 'negative') {
      if (border.length === 0) {
        border.push([]);
      }
      border[0].push(
        negative.p1._dup(),
        negative.p2._dup(),
      );
    } else if (borderIs === 'positive') {
      if (border.length === 0) {
        border.push([]);
      }
      border[0].push(
        positive.p1._dup(),
        positive.p2._dup(),
      );
    }
    if (holeIs === 'positive') {
      hole[0].push(positive.p1._dup(), positive.p2._dup());
    } else if (holeIs === 'negative') {
      hole[0].push(negative.p1._dup(), negative.p2._dup());
    }
  });
  if (Array.isArray(borderIs)) {
    border = borderIs;
  }
  if (Array.isArray(holeIs)) {
    hole = holeIs;
  }
  return [tris, border, hole];
}

// Extend two lines to their intersection point
function joinLinesInPoint(line1: Line, lineNext: Line) {
  const intersect = line1.intersectsWith(lineNext);
  if (intersect.intersect != null) {
    line1.setP2(intersect.intersect._dup());  // $FlowFixMe
    lineNext.setP1(intersect.intersect._dup());
  }
}

//                    2       2        2
//                    N     o N        N
//                       No      N        N
//                      o   N       N        N
//                    o        N       N        N
//                   o            N       N        N
//            angle o                N       N        N
//                 o                    N       N        N        / Tangent
//                 o                       N  1    N        N  1 /
//                o                           N       N        N/
//  in   000000000o000000000000000000000000000000        N  1  /
//       1        o                            2            N /
//  mid  0000000000000000000000000000000000000000000000000000/
//       1                                                2 /
//  out  00000000000000000000000000000000000000000000000000/
//       1                                              2 /
//                                                       /
//
// Note, for simplicity, both inside and outside can intercept with tangent
// and geometry is valid.
function joinLinesInTangent(
  // inside: Line,
  // insideNext: Line,
  mid: Line,
  midNext: Line,
  outside: Line,
  outsideNext: Line,
) {
  const angle = threePointAngleMin(mid.p1, mid.p2, midNext.p2);
  const tangent = new Line(mid.p2, 1, mid.angle() + angle / 2 + Math.PI / 2);
  const intercept = outside.intersectsWith(tangent);
  const interceptNext = outsideNext.intersectsWith(tangent);
  if (intercept.withinLine === false && interceptNext.withinLine === false) {
    const i = outside.intersectsWith(outsideNext);
    if (i.intersect != null) {
      outside.setP2(i.intersect);
      outsideNext.setP1(interceptNext.intersect);
      return;
    }
  }
  // let intercept = tangent.intersectsWith(outside);
  if (intercept.intersect != null) {
    outside.setP2(intercept.intersect);
  }

  // intercept = tangent.intersectsWith(outsideNext);
  if (interceptNext.intersect != null) {
    outsideNext.setP1(interceptNext.intersect);
  }
}

function joinLinesAcuteInside(
  mid: Line,
  midNext: Line,
  inside: Line,
  insideNext: Line,
) {
  let intercept = inside.intersectsWith(midNext);
  if (intercept.intersect != null) {
    inside.setP2(intercept.intersect);
  }
  intercept = insideNext.intersectsWith(mid);
  if (intercept.intersect != null) {
    insideNext.setP1(intercept.intersect);
  }
}

function joinLinesObtuseInside(
  mid: Line,
  midNext: Line,
  inside: Line,
  insideNext: Line,
) {
  let intercept = inside.intersectsWith(midNext);
  if (intercept.intersect != null && intercept.intersect.isWithinLine(midNext, 8)) {
    inside.setP2(intercept.intersect);
  }
  intercept = insideNext.intersectsWith(mid);
  if (intercept.intersect != null && intercept.intersect.isWithinLine(mid, 8)) {
    insideNext.setP1(intercept.intersect);
  }
}

function makeLineSegments(
  points: Array<Point>,
  width: number,
  close: boolean,
  cornerStyle: 'auto' | 'none' | 'fill',
  widthIs: 'mid' | 'positive' | 'negative' | number,
  isInside: boolean,
  numLines: number = 2,
): [Array<Line>, Array<Array<Line>>] {
  const idealLines = [];
  const makeLine = (p1, p2) => new Line(p1, p2);
  for (let i = 0; i < points.length - 1; i += 1) {
    idealLines.push(makeLine(points[i], points[i + 1]));
  }
  if (close) {
    idealLines.push(makeLine(points[points.length - 1], points[0]));
  }

  // lineSegments should be more negative to more positive
  const lineSegments: Array<Array<Line>> = [];
  const makeOffset = (prev, current, next, offset: number, index: number) => {
    let minNegativeOffset = offset;
    let minPositiveOffset = offset;
    let prevAngle = Math.PI;
    if (prev != null) {
      prevAngle = threePointAngle(prev.p1, current.p1, current.p2);
      const minPrevAngle = threePointAngleMin(prev.p1, current.p1, current.p2);
      const minPrevOffset = current.distanceToPoint(prev.p1);
      const minOffset = Math.min(
        minPrevOffset, Math.tan(Math.abs(minPrevAngle)) * current.length(),
      );
      // Negative side is inside angle
      if (prevAngle < Math.PI / 2) {
        minNegativeOffset = Math.min(minNegativeOffset, minOffset);
      } else if (prevAngle > Math.PI / 2 * 3) {
        minPositiveOffset = Math.min(minPositiveOffset, minOffset);
      }
    }
    let nextAngle = Math.PI;
    if (next != null) {
      nextAngle = threePointAngle(current.p1, current.p2, next.p2);
      const minNextAngle = threePointAngleMin(current.p1, current.p2, next.p2);
      const minNextOffset = current.distanceToPoint(next.p2);
      const minOffset = Math.min(
        minNextOffset, Math.tan(Math.abs(minNextAngle)) * current.length(),
      );
      if (nextAngle < Math.PI / 2) {
        minNegativeOffset = Math.min(minNegativeOffset, minOffset);
      } else if (nextAngle > Math.PI / 2 * 3) {
        minPositiveOffset = Math.min(minPositiveOffset, minOffset);
      }
    }
    // let negativeLine;
    // let positiveLine;
    let offsetLine;
    // console.log(widthIs)
    // console.log(prevAngle, nextAngle)
    if (widthIs === 'negative') {
      if (cornerStyle === 'auto' && (isInside || prevAngle < Math.PI || nextAngle < Math.PI)) {
        offsetLine = current.offset('negative', minNegativeOffset);
      } else {
        offsetLine = current.offset('negative', offset);
      }
    } else if (widthIs === 'positive') {
      if (cornerStyle === 'auto' && (isInside || prevAngle > Math.PI || nextAngle > Math.PI)) {
        // console.log('min')
        offsetLine = current.offset('positive', minPositiveOffset);
      } else {
        offsetLine = current.offset('positive', offset);
      }
    // otherwise widthIs === 'mid'
    } else {
      offsetLine = current.offset('positive', offset);
    }
    // if (cornerStyle === 'auto' && widthIs !== 'mid') {
    //   negativeLine = current.offset('negative', minNegativeOffset);
    //   positiveLine = current.offset('positive', minPositiveOffset);
    // } else {
    //   negativeLine = current.offset('negative', offset);
    //   positiveLine = current.offset('positive', offset);
    // }
    lineSegments[index].push(offsetLine);
  };

  const step = width / (numLines - 1);
  for (let i = 0; i < idealLines.length; i += 1) {
    let prev = i > 0 ? idealLines[i - 1] : null;
    const current = idealLines[i];
    let next = i < idealLines.length - 1 ? idealLines[i + 1] : null;
    if (close && i === 0) {
      prev = idealLines[idealLines.length - 1];
    }
    if (close && i === idealLines.length - 1) {
      // eslint-disable-next-line prefer-destructuring
      next = idealLines[0];
    }
    lineSegments.push([]);
    if (widthIs === 'negative' || widthIs === 'positive') {
      lineSegments[i].push(current._dup());
    } else if (numLines === 1) {
      lineSegments[i].push(current._dup());
    } else if (typeof widthIs === 'number') {
      const offsetLine = current.offset('negative', widthIs * width);
      lineSegments[i].push(offsetLine);
    } else {
      const offsetLine = current.offset('negative', width / 2);
      lineSegments[i].push(offsetLine);
    }
    for (let l = 1; l < numLines; l += 1) {
      if (widthIs === 'negative' || widthIs === 'positive') {
        makeOffset(prev, current, next, l * step, i);
      } else if (typeof widthIs === 'number') {
        makeOffset(prev, current, next, -widthIs * width + l * step, i);
      } else {
        makeOffset(prev, current, next, -width / 2 + l * step, i);
      }
    }
    if (widthIs === 'negative') {
      lineSegments[i].reverse();
    }
  }
  return [idealLines, lineSegments];
}

function getWidthIs(
  points: Array<Point>,
  close: boolean,
  widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid' | number,
) {
  if (widthIs === 'mid' || widthIs === 'negative' || widthIs === 'positive' || typeof widthIs === 'number') {
    return widthIs;
  }

  let numInsideNegativeAngles = 0;
  let totAngles = close ? points.length : points.length - 2;
  const testAngle = (p2: Point, p1: Point, p3: Point) => {
    const angle = threePointAngle(p2, p1, p3);
    if (angle < Math.PI) {
      numInsideNegativeAngles += 1;
    }
    if (angle === Math.PI) {
      totAngles -= 1;
    }
  };
  for (let i = 1; i < points.length - 1; i += 1) {
    testAngle(points[i - 1], points[i], points[i + 1]);
  }
  if (close) {
    testAngle(points[points.length - 1], points[0], points[1]);
    testAngle(points[points.length - 2], points[points.length - 1], points[0]);
  }

  if (numInsideNegativeAngles >= totAngles / 2) {
    if (widthIs === 'inside') {
      return 'negative';
    }
    return 'positive';
  }

  if (widthIs === 'inside') {
    return 'positive';
  }
  return 'negative';
}

function makeThickLine(
  points: Array<Point>,
  width: number = 0.01,
  widthIsIn: 'mid' | 'negative' | 'positive' | 'outside' | 'inside' | number,
  close: boolean = false,
  corner: 'auto' | 'fill' | 'none',
  minAngleIn: ?number = Math.PI / 7,
  linePrimitives: boolean = false,
  lineNum: number = 2,
  borderIs: 'negative' | 'positive' | 'line' | Array<Array<Point>> = 'line',
  holeIs: 'negative' | 'positive' | Array<Array<Point>> = [[]],
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const widthToUse = width;
  // if (widthIsIn === 'mid') {
  //   widthToUse = width / 2;
  // }
  let widthIs = getWidthIs(points, close, widthIsIn);
  const [idealLines, lineSegments] = makeLineSegments(
    points, widthToUse, close, corner, widthIs, widthIsIn === 'inside', lineNum,
  );
  if (typeof widthIs === 'number') {
    widthIs = 'mid';
  }
  // console.log(points, idealLines, lineSegments)

  // Join line segments based on the angle between them
  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (currentIndex: number, nextIndex: number, lineIndex: number) => {
    const mid = idealLines[currentIndex];
    const midNext = idealLines[nextIndex];
    const lineSegment = lineSegments[currentIndex][lineIndex];
    const lineSegmentNext = lineSegments[nextIndex][lineIndex];
    // const [positive, mid, negative] = lineSegments[current];
    // const [positiveNext, midNext, negativeNext] = lineSegments[next];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    // If the angle is less than 180, then the 'negative' line segments are
    // on the outside of the angle.
    // console.log(currentIndex, lineIndex, angle)
    if (0 < angle && angle < minAngle) {
      if (widthIs === 'mid') {
        joinLinesInTangent(mid, midNext, lineSegment, lineSegmentNext);
        // joinLinesInTangent(mid, midNext, positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesAcuteInside(mid, midNext, lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesInTangent(mid, midNext, lineSegment, lineSegmentNext);
      }
    } else if (minAngle <= angle && angle <= Math.PI / 2) {
      if (widthIs === 'mid') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
        // joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'negative') {
        joinLinesAcuteInside(mid, midNext, lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
      }
    // If the angle is greater than the minAngle, then the line segments can
    // be connected directly
    } else if (Math.PI / 2 <= angle && angle < Math.PI) {
      if (widthIs === 'mid') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
        // joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'negative') {
        joinLinesObtuseInside(mid, midNext, lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
      }
    } else if (angle === Math.PI) {
      if (widthIs === 'negative') {
        if (widthIsIn === 'inside') {
          joinLinesObtuseInside(mid, midNext, lineSegment, lineSegmentNext);
        } else {
          joinLinesInPoint(lineSegment, lineSegmentNext);
        }
      } else if (widthIs === 'positive') {
        if (widthIsIn === 'inside') {
          joinLinesObtuseInside(mid, midNext, lineSegment, lineSegmentNext);
        } else {
          joinLinesInPoint(lineSegment, lineSegmentNext);
        }
      }
    // If the angle is greater than 180, then the positive side is on the
    // inside of the angle
    } else if (Math.PI < angle && angle < Math.PI / 2 * 3) {
      if (widthIs === 'mid') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
        joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'negative') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesObtuseInside(mid, midNext, lineSegment, lineSegmentNext);
      }
    //
    } else if (Math.PI / 2 * 3 <= angle && angle <= Math.PI * 2 - minAngle) {
      if (widthIs === 'mid') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
        // joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'negative') {
        joinLinesInPoint(lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesAcuteInside(mid, midNext, lineSegment, lineSegmentNext);
      }
    //
    } else if (Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      if (widthIs === 'mid') {
        joinLinesInTangent(mid, midNext, lineSegment, lineSegmentNext);
        // joinLinesInTangent(mid, midNext, lineSegment, lineSegmentNext);
      } else if (widthIs === 'negative') {
        joinLinesInTangent(mid, midNext, lineSegment, lineSegmentNext);
      } else if (widthIs === 'positive') {
        joinLinesAcuteInside(mid, midNext, lineSegment, lineSegmentNext);
      }
    } else if ((angle === Math.PI * 2 || angle === 0)) {
      // do nothing

      // if (widthIs === 'mid') {
      //   joinLinesInPoint(lineSegment, lineSegmentNext);
      //   // joinLinesInPoint(lineSegment, lineSegmentNext);
      // } else if (widthIs === 'negative') {
      //   joinLinesInPoint(lineSegment, lineSegmentNext);
      // } else if (widthIs === 'positive') {
      //   joinLinesInPoint(lineSegment, lineSegmentNext);
      // }
    }
    // if (lineSegments.length >= 2) {
    //   console.log(currentIndex, lineIndex, lineSegments[2][0]._dup())
    // }
  };

  // Create fill triangles between the positive & mid, and negative and mid lines
  const cornerFills = [];
  const createFill = (currentIndex, nextIndex) => {
    const mid = idealLines[currentIndex];
    const midNext = idealLines[nextIndex];
    const positive = lineSegments[currentIndex].slice(-1)[0];
    const positiveNext = lineSegments[nextIndex].slice(-1)[0];
    const negative = lineSegments[currentIndex][0];
    const negativeNext = lineSegments[nextIndex][0];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    if (linePrimitives) {
      for (let i = 0; i < lineSegments[currentIndex].length; i += 1) {
        cornerFills.push(lineSegments[currentIndex][i].p2._dup());
        cornerFills.push(lineSegments[nextIndex][i].p1._dup());
      }
    } else if (angle < Math.PI) {
      if (widthIsIn !== 'inside') {
        cornerFills.push(positive.p2._dup());
        cornerFills.push(mid.p2._dup());
        cornerFills.push(positiveNext.p1._dup());
      }
    } else if (angle > Math.PI) {
      if (widthIsIn !== 'inside') {
        cornerFills.push(negative.p2._dup());
        cornerFills.push(mid.p2._dup());
        cornerFills.push(negativeNext.p1._dup());
      }
    }
  };

  // NB: this all assumes the GL primitive is TRIANGLES. Thus the order the
  // triangles is drawn is not important, and so fills can happen in chunks.
  if (corner !== 'none') {
    for (let l = 0; l < lineNum; l += 1) {
      for (let i = 0; i < lineSegments.length - 1; i += 1) {
        if (corner === 'auto') {
          joinLineSegments(i, i + 1, l);
        } else if (l === 0) {
          createFill(i, i + 1);
        }
      }
      if (close) {
        if (corner === 'auto') {
          joinLineSegments(lineSegments.length - 1, 0, l);
        } else if (l === 0) {
          createFill(lineSegments.length - 1, 0);
        }
      }
    }
  }
  const [tris, border, hole] = lineSegmentsToPoints(
    lineSegments, linePrimitives, borderIs, holeIs,
  );
  // if (close === false) {
  //   return [[...tris, ...cornerFills], [[...border[0]], [...hole]];
  // }
  return [[...tris, ...cornerFills], border, hole];
}


// from https://mathworld.wolfram.com/Circle-LineIntersection.html
function circleLineIntersection(
  center: Point,
  radius: number,
  lineIn: Line,
) {
  const offsetToZero = new Point(-center.x, -center.y);
  const line = new Line(lineIn.p1.add(offsetToZero), lineIn.p2.add(offsetToZero));
  const x1 = line.p1.x;
  const y1 = line.p1.y;
  const x2 = line.p2.x;
  const y2 = line.p2.y;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dr = Math.sqrt(dx * dx + dy * dy);
  const D = x1 * y2 - x2 * y1;
  const r = radius;
  const sgn = value => (value < 0 ? -1 : 1);

  const i1x = (D * dy + sgn(dy) * dx * Math.sqrt(r * r * dr * dr - D * D)) / (dr * dr);
  const i2x = (D * dy - sgn(dy) * dx * Math.sqrt(r * r * dr * dr - D * D)) / (dr * dr);
  const i1y = (-D * dx + Math.abs(dy) * Math.sqrt(r * r * dr * dr - D * D)) / (dr * dr);
  const i2y = (-D * dx - Math.abs(dy) * Math.sqrt(r * r * dr * dr - D * D)) / (dr * dr);

  const intersections = [];
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(i1x) && !isNaN(i1y)) {
    const i = new Point(i1x, i1y).sub(offsetToZero);
    if (lineIn.hasPointOn(i)) {
      intersections.push(i);
    }
  }
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(i2x) && !isNaN(i2y)) {
    const i = new Point(i2x, i2y).sub(offsetToZero);
    if (lineIn.hasPointOn(i)) {
      intersections.push(i);
    }
  }

  return intersections;
}


// From end of line
// Go back lines until distance to p1 is > arrow length
// Find intersection between circle (arrow length) and line
// That is the end of the line, and defines the arrow start

function shortenLineForArrows(
  points: Array<Point>,
  arrow: {
    start?: {
      head: TypeArrowHead,
      length: number,
      width: number,
      barb: number,
      tailWidth: number,
      align: 'mid' | 'start',
      tail: number | boolean,
      radius: number,
    },
    end?: {
      head: TypeArrowHead,
      length: number,
      width: number,
      barb: number,
      tailWidth: number,
      align: 'mid' | 'start',
      tail: number | boolean,
      radius: number,
    },
  },
) {
  const { start, end } = arrow;

  let shortenedPoints = [];

  // let addStartArrow = false;
  if (start != null) {
    const startPoint = points[0];
    let index = 0;
    const [, arrowLength] = getArrowLength(start);
    let pointFound = false;
    while (index < points.length - 1 && pointFound === false) {
      index += 1;
      const distanceToEnd = startPoint.distance(points[index]);
      if (arrowLength < distanceToEnd) {
        pointFound = true;
      }
    }

    if (pointFound) {
      const line = new Line(points[index - 1], points[index]);
      const [intersect] = circleLineIntersection(startPoint, arrowLength, line);
      if (intersect != null) {
        shortenedPoints = [intersect, ...points.slice(index)];
        // addStartArrow = true;
      }
    }
  } else {
    shortenedPoints = points;
  }

  // let addEndArrow = false;
  if (end != null) {
    const endPoint = points[points.length - 1];
    let index = points.length - 1;
    const [, arrowLength] = getArrowLength(end);
    let pointFound = false;
    while (index > 0 && pointFound === false) {
      index -= 1;
      const distanceToEnd = endPoint.distance(points[index]);
      if (arrowLength < distanceToEnd) {
        pointFound = true;
      }
    }
    if (pointFound) {
      const line = new Line(points[index + 1], points[index]);
      const [intersect] = circleLineIntersection(endPoint, arrowLength, line);
      if (intersect != null) {
        shortenedPoints = [...shortenedPoints.slice(0, index + 1), intersect];
        // addEndArrow = true;
      }
    }
  }

  return shortenedPoints;
}

function makePolyLine(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' | number = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number = 0.1,
  cornerSides: number = 10,
  minAutoCornerAngle: number = Math.PI / 7,
  dash: TypeDash = [],
  linePrimitives: boolean = false,
  lineNum: number = 2,
  borderIs: 'positive' | 'negative' | 'line' | Array<Array<Point>> = 'line',
  touchBorderBuffer: number = 0,
  holeIs: 'positive' | 'negative' | Array<Array<Point>> = [[]],
  arrowIn: null | TypeArrowHead | {
    start: OBJ_Arrow | TypeArrowHead,
    end: OBJ_Arrow | TypeArrowHead,
  } & OBJ_Arrow = null,
  precision: number = 8,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>, Array<Array<Point>>] {
  let points = [];
  let cornerStyleToUse;
  let orderedPoints = pointsIn;

  const arrow = simplifyArrowOptions(arrowIn, width);

  if (close === false && arrowIn != null) { // $FlowFixMe
    orderedPoints = shortenLineForArrows(pointsIn, arrow);
  }
  // console.log(orderedPoints)
  // Convert line to line with corners
  if (cornerStyle === 'auto') {
    points = orderedPoints.map(p => p._dup());
    cornerStyleToUse = 'auto';
  } else if (cornerStyle === 'radius') {
    points = cornerLine(orderedPoints, close, 'fromVertex', cornerSides, cornerSize);
    cornerStyleToUse = 'fill';
  } else {
    cornerStyleToUse = cornerStyle;
    points = orderedPoints.map(p => p._dup());
  }

  // Convert line to dashed line
  let dashedTris = [];
  let onLine = true;
  if (dash.length > 1) {
    const [dashes, onDash] = lineToDash(points, dash, close, 0, precision);
    onLine = onDash;
    let closeDashes = false;
    if (dashes.length === 1) {
      closeDashes = close;
    }
    dashes.forEach((d) => {
      const [tris] = makeThickLine(
        d, width, widthIs, closeDashes, cornerStyleToUse, minAutoCornerAngle,
        linePrimitives, lineNum, borderIs, holeIs,
      );
      dashedTris = [...dashedTris, ...tris];
    });
  }

  // Get tris and border of solid line
  const [tris, border, hole] = makeThickLine(
    points, width, widthIs, close, cornerStyleToUse, minAutoCornerAngle,
    linePrimitives, lineNum, borderIs, holeIs,
  );

  // Get touch border if there is a buffer
  let touchBorder = border;
  if (touchBorderBuffer !== 0) {
    let widthIsBuffer = 0.5;
    const widthBuffer = width + touchBorderBuffer * 2;
    if (widthIs === 'positive' || widthIs === 'inside') {
      widthIsBuffer = touchBorderBuffer / widthBuffer;
    } else if (widthIs === 'negative' || widthIs === 'outside') {
      widthIsBuffer = (width + touchBorderBuffer) / widthBuffer;
    } else if (widthIs === 'mid') {
      widthIsBuffer = 0.5;
    } else {
      widthIsBuffer = (touchBorderBuffer + widthIs * width) / widthBuffer;
    }
    [, touchBorder] = makeThickLine(
      points, widthBuffer, widthIsBuffer, close, cornerStyleToUse, minAutoCornerAngle,
      linePrimitives, lineNum, borderIs, holeIs,
    );
  }

  const trisToUse = dash.length > 1 ? dashedTris : tris;
  // if (dash.length > 1) {
  //   if (arrow != null && close === false) {
  //     return addArrows(arrow, dashedTris, border, touchBorder, hole);
  //   }
  //   return [dashedTris, border, touchBorder, hole];
  // }
  if (arrowIn != null && close === false) {
    // eslint-disable-next-line no-use-before-define
    return addArrows(
      arrow,
      [orderedPoints[0], pointsIn[0]],
      [orderedPoints[orderedPoints.length - 1], pointsIn[pointsIn.length - 1]],
      trisToUse, border, touchBorder, hole, touchBorderBuffer, width,
      onLine,
    );
  }
  return [trisToUse, border, touchBorder, hole];
}

function makePolyLineCorners(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  cornerLength: number,
  // forceCornerLength: boolean,
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
  linePrimitives: boolean = false,
  lineNum: number = 1,
) {
  // split line into corners
  const corners = lineToCorners(pointsIn, close, cornerLength, false);

  let tris = [];
  let borders = [];
  let holes = [];
  corners.forEach((corner) => {
    const [t, b, h] = makePolyLine(
      corner, width, false, widthIs, cornerStyle, cornerSize,
      cornerSides, minAutoCornerAngle, [], linePrimitives, lineNum, 'line', 0, 'none',
    );
    tris = [...tris, ...t];
    borders = [...borders, ...b];
    holes = [...holes, ...h];
  });
  return [tris, borders, holes];
}

function addArrows(
  arrowIn: ?{
    start?: {
      head: TypeArrowHead,
      length: number,
      width: number,
      barb: number,
      tailWidth: number,
    },
    end?: {
      head: TypeArrowHead,
      length: number,
      width: number,
      barb: number,
      tailWidth: number,
    },
  },
  startArrow: [Point, Point],
  endArrow: [Point, Point],
  existingTriangles: Array<Point>,
  existingBorder: Array<Array<Point>>,
  existingTouchBorder: Array<Array<Point>>,
  holeBorder: Array<Array<Point>>,
  drawBorderBuffer: number,
  lineWidth: number,
  onLine: boolean,
) {
  let arrow = {};
  if (arrowIn != null) {
    arrow = arrowIn;
  }
  let updatedTriangles = existingTriangles;
  let updatedBorder = existingBorder;
  let updatedTouchBorder = existingTouchBorder;
  const count = updatedTriangles.length;
  if (arrow.start != null) {
    const [points, border, touchBorder, tail] = getArrow(joinObjects(
      {},
      arrow.start,
      {
        // start: startArrow[0],
        // end: startArrow[1],
        align: 'tail',
        drawPosition: startArrow[0],
        angle: new Line(startArrow[0], startArrow[1]).angle(),
        drawBorderBuffer,
        tailWidth: lineWidth,
      },
    ));
    updatedTriangles = [
      ...updatedTriangles, ...points,
      updatedTriangles[0]._dup(), updatedTriangles[1]._dup(), tail[0]._dup(),
      tail[0]._dup(), updatedTriangles[1]._dup(), tail[1]._dup(),
    ];
    updatedBorder = [...updatedBorder, border];
    updatedTouchBorder = [...updatedTouchBorder, touchBorder];
  }
  if (arrow.end != null) {
    const [points, border, touchBorder, tail] = getArrow(joinObjects(
      {},
      arrow.end,
      {
        // start: endArrow[0],
        // end: endArrow[1],
        align: 'tail',
        drawPosition: endArrow[0],
        angle: new Line(endArrow[0], endArrow[1]).angle(),
        drawBorderBuffer,
        tailWidth: lineWidth,
      },
    ));
    let connection = [];
    if (onLine) {
      const l = count;
      connection = [
        updatedTriangles[l - 2]._dup(), updatedTriangles[l - 1]._dup(), tail[0]._dup(),
        tail[0]._dup(), updatedTriangles[l - 1]._dup(), tail[1]._dup(),
      ];
    }
    updatedTriangles = [
      ...updatedTriangles, ...points, ...connection,
    ];
    updatedBorder = [...updatedBorder, border];
    updatedTouchBorder = [...updatedTouchBorder, touchBorder];
  }
  return [
    updatedTriangles,
    updatedBorder,
    updatedTouchBorder,
    holeBorder,
  ];
}

export {
  joinLinesInPoint,
  lineSegmentsToPoints,
  joinLinesInTangent,
  // makeThickLineMid,
  // makeThickLineInsideOutside,
  makePolyLine,
  makePolyLineCorners,
  addArrows,
};


// TODO
// inside and dash
// inside and radius


// Inside and radius
// const figure = new Fig.Figure();
// const { Point } = Fig;

// const line = [
//     new Point(0.5, 0),
//     new Point(0, 0.024286),
//     new Point(-0.5, 0),
//     // new Point(0, 1),
// ];

// figure.add([
//   {
//     name: 'pad',
//     method: 'polygon',
//     options: {
//       radius: 0.2,
//       color: [0.5, 0.5, 0.5, 0.5],
//       sides: 100,
//     },
//   },
//   {
//     name: 'r',
//     method: 'polyline',
//     options: {
//       points: line,
//       width: 0.03,
//       close: true,
//       pointsAt: 'inside',
//       cornerStyle: 'radius',
//       cornerSize: 0.05,
//       cornerSides: 10,
//     },
//   },
//   {
//     name: 'x2',
//     method: 'line',
//     options: {
//       p1: [-1, 0],
//       p2: [1, 0],
//       width: 0.005,
//       color: [0.5, 0.5, 0.5, 0.5],
//     }
//   },
// ]);

// const pad = figure.getElement('pad');
// pad.setMovable();
// pad.setTransformCallback = () => {
//   line[1] = pad.getPosition();
//   const r = figure.getElement('r');
//   r.updatePoints(line);
//   figure.animateNextFrame();
// }
// figure.initialize();
// pad.setPosition(0, 0.1);


// Inside and dash
// {
//   name: 'r',
//   method: 'polyline',
//   options: {
//     points: line,
//     width: 0.03,
//     close: true,
//     pointsAt: 'inside',
//     dash: [0.1, 0.03],
//   },
// },
