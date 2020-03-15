// @flow
import { cornerLine, lineToCorners } from './corners';
import { lineToDash } from './dashes';
import {
  Line, Point, threePointAngleMin, threePointAngle,
} from '../../../../tools/g2';

/* eslint-disable yoda */

// A thick line is defined from:
//  * A reference line
//  * A width
//  * Where the reference line is relative to the width
//    ('mid', 'inside', 'outside')
//  * How to deal with the corners in the line
//


// Extend two lines to their intersection point
function joinLinesInPoint(line1: Line, lineNext: Line) {
  const intersect = line1.intersectsWith(lineNext);
  if (intersect.intersect != null) {
    line1.setP2(intersect.intersect._dup());
    lineNext.setP1(intersect.intersect._dup());
  }
}

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
  lineSegments: Array<[Line, Line, Line]>,
  insideIndex: number,
  outsideIndex: number,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const tris = [];
  const border = [];
  const hole = [];
  lineSegments.forEach((lineSegment) => {
    const inside = lineSegment[insideIndex];
    const outside = lineSegment[outsideIndex];
    border.push(lineSegment[outsideIndex].p1._dup());
    border.push(lineSegment[outsideIndex].p2._dup());
    hole.push(lineSegment[insideIndex].p1._dup());
    hole.push(lineSegment[insideIndex].p2._dup());
    tris.push(inside.p1._dup());
    tris.push(outside.p1._dup());
    tris.push(inside.p2._dup());
    tris.push(outside.p1._dup());
    tris.push(inside.p2._dup());
    tris.push(outside.p2._dup());
  });
  return [tris, [border], [hole]];
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
  inside: Line,
  insideNext: Line,
  mid: Line,
  midNext: Line,
  outside: Line,
  outsideNext: Line,
) {
  const angle = threePointAngleMin(mid.p1, mid.p2, midNext.p2);
  const tangent = new Line(mid.p2, 1, mid.angle() + angle / 2 + Math.PI / 2);
  let intercept = tangent.intersectsWith(outside);
  if (intercept.intersect != null) {
    outside.setP2(intercept.intersect);
  }
  intercept = tangent.intersectsWith(inside);
  if (intercept.intersect != null) {
    inside.setP2(intercept.intersect);
  }

  intercept = tangent.intersectsWith(outsideNext);
  if (intercept.intersect != null) {
    outsideNext.setP1(intercept.intersect);
  }
  intercept = tangent.intersectsWith(insideNext);
  if (intercept.intersect != null) {
    insideNext.setP1(intercept.intersect);
  }
}

function makeLineSegments(
  points: Array<Point>,
  insideWidth: number,
  outsideWidth: number,
  close: boolean,
) {
  const lineSegments = [];
  const makeLineSegment = (p1, p2) => {
    const lineSegment = new Line(p1, p2);
    const insideOffset = lineSegment.offset('inside', insideWidth);
    const outsideOffset = lineSegment.offset('outside', outsideWidth);
    lineSegments.push([insideOffset, lineSegment, outsideOffset]);
  };

  // Go through all points, and generate inside, mid and outside line segments
  for (let i = 0; i < points.length - 1; i += 1) {
    makeLineSegment(points[i], points[i + 1]);
  }
  if (close) {
    makeLineSegment(points[points.length - 1], points[0]);
  }
  return lineSegments;
}

function makeLineSegmentsOutside(
  points: Array<Point>,
  offset: number,
  close: boolean,
) {
  const mainLines = [];
  const makeLine = (p1, p2) => new Line(p1, p2);
  for (let i = 0; i < points.length - 1; i += 1) {
    mainLines.push(makeLine(points[i], points[i + 1]));
  }
  if (close) {
    mainLines.push(makeLine(points[points.length - 1], points[0]));
  }

  const lineSegments = [];
  const makeOutsideLine = (prev, current, next) => {
    let minOffset = offset;
    if (prev != null) {
      const prevAngle = threePointAngle(prev.p1, current.p1, current.p2);
      const minPrevOffset = current.distanceToPoint(prev.p1);
      if (prevAngle < Math.PI) {
        minOffset = Math.min(minOffset, minPrevOffset);
      }
    }
    if (next != null) {
      const nextAngle = threePointAngle(current.p1, current.p2, next.p2);
      const minNextOffset = current.distanceToPoint(next.p2);
      if (nextAngle < Math.PI) {
        minOffset = Math.min(minOffset, minNextOffset);
      }
    }
    const outsideLine = current.offset('outside', minOffset);
    lineSegments.push([current, current, outsideLine]);
  };

  for (let i = 0; i < mainLines.length; i += 1) {
    let prev = i > 0 ? mainLines[i - 1] : null;
    const current = mainLines[i];
    let next = i < mainLines.length - 1 ? mainLines[i + 1] : null;
    if (close && i === 0) {
      prev = mainLines[mainLines.length - 1];
    }
    if (close && i === mainLines.length - 1) {
      // eslint-disable-next-line prefer-destructuring
      next = mainLines[0];
    }
    makeOutsideLine(prev, current, next);
  }

  return lineSegments;
}

function makeThickLineMid(
  points: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  // makeCorner: boolean = true,
  // cornerStyle: 'autoPoint' | 'fill',
  corner: 'auto' | 'fill' | 'none',
  minAngleIn: ?number = Math.PI / 7,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const lineSegments = makeLineSegments(points, width / 2, width / 2, close);

  // Join line segments based on the angle between them
  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (current, next) => {
    const [inside, mid, outside] = lineSegments[current];
    const [insideNext, midNext, outsideNext] = lineSegments[next];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    // If the angle is less than 180, then the 'inside' line segments are
    // actually on the outside.
    if (0 < angle && angle < minAngle) {
      joinLinesInTangent(outside, outsideNext, mid, midNext, inside, insideNext);
    } else if (minAngle < angle && angle < Math.PI) {
      joinLinesInPoint(inside, insideNext);
    // If the angle is greater than 180, then the 'inside' line segments are
    // properly on the inside.
    } else if (Math.PI < angle && angle < Math.PI * 2 - minAngle) {
      joinLinesInPoint(outside, outsideNext);
    } else if (Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      joinLinesInTangent(inside, insideNext, mid, midNext, outside, outsideNext);
    }
  };

  // Create fill triangles between the inside & mid, and outside and mid lines
  const cornerFills = [];
  const createFill = (current, next) => {
    const [inside, mid, outside] = lineSegments[current];
    const [insideNext, , outsideNext] = lineSegments[next];
    cornerFills.push(outside.p2._dup());
    cornerFills.push(mid.p2._dup());
    cornerFills.push(outsideNext.p1._dup());
    cornerFills.push(inside.p2._dup());
    cornerFills.push(mid.p2._dup());
    cornerFills.push(insideNext.p1._dup());
  };

  // NB: this all assumes the GL primitive is TRIANGLES. Thus the order the
  // triangles is drawn is not important, and so fills can happen in chunks.
  if (corner !== 'none') {
    for (let i = 0; i < lineSegments.length - 1; i += 1) {
      if (corner === 'auto') {
        joinLineSegments(i, i + 1);
      } else {
        createFill(i, i + 1);
      }
    }
    if (close) {
      if (corner === 'auto') {
        joinLineSegments(lineSegments.length - 1, 0);
      } else {
        createFill(lineSegments.length - 1, 0);
      }
    }
  }
  const [tris, border, hole] = lineSegmentsToPoints(lineSegments, 0, 2);
  if (close === false) {
    return [[...tris, ...cornerFills], [[...border[0], ...hole[0].reverse()]], [[]]];
  }
  return [[...tris, ...cornerFills], border, hole];
  // return [...lineSegmentsToPoints(lineSegments, 0, 2), ...cornerFills];
}

function makeThickLineInsideOutside(
  points: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  corner: 'auto' | 'fill' | 'none',
  minAngleIn: ?number = Math.PI / 7,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const lineSegments = makeLineSegments(points, width, width, close);

  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (current, next) => {
    const [, inside, outside] = lineSegments[current];
    const [, insideNext, outsideNext] = lineSegments[next];
    const angle = threePointAngle(inside.p1, inside.p2, insideNext.p2);
    // If angle is 0 to 180, then it is an inside angle
    if (0 < angle && angle < Math.PI) {
      let intercept = outside.intersectsWith(insideNext);
      if (intercept.intersect != null && intercept.intersect.isOnLine(insideNext, 8)) {
        outside.setP2(intercept.intersect);
      }
      intercept = outsideNext.intersectsWith(inside);
      if (intercept.intersect != null && intercept.intersect.isOnLine(inside, 8)) {
        outsideNext.setP1(intercept.intersect);
      }
    // otherwise its an outside angle
    } else if (corner === 'auto' && Math.PI < angle && angle < Math.PI * 2 - minAngle) {
      joinLinesInPoint(outside, outsideNext);
    } else if (corner === 'auto' && Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      joinLinesInTangent(inside, insideNext, inside, insideNext, outside, outsideNext);
    }
  };

  // Create fill triangles between the inside & mid, and outside and mid lines
  const cornerFills = [];
  const createFill = (current, next) => {
    const [, mid, outside] = lineSegments[current];
    const [, , outsideNext] = lineSegments[next];
    cornerFills.push(outside.p2._dup());
    cornerFills.push(mid.p2._dup());
    cornerFills.push(outsideNext.p1._dup());
  };

  if (corner !== 'none') {
    for (let i = 0; i < lineSegments.length - 1; i += 1) {
      joinLineSegments(i, i + 1);
      if (corner === 'fill') {
        createFill(i, i + 1);
      }
    }
    if (close) {
      joinLineSegments(lineSegments.length - 1, 0);
      if (corner === 'fill') {
        createFill(lineSegments.length - 1, 0);
      }
    }
  }
  const [tris, border, hole] = lineSegmentsToPoints(lineSegments, 1, 2);
  if (close === false) {
    return [[...tris, ...cornerFills], [[...border[0], ...hole[0].reverse()]], [[]]];
  }
  return [[...tris, ...cornerFills], border, hole];
  // return [...lineSegmentsToPoints(lineSegments, 1, 2), ...cornerFills];
}

function makeThickLine(
  points: Array<Point>,
  width: number = 0.01,
  pointsAre: 'mid' | 'outside' | 'inside',
  close: boolean = false,
  corner: 'auto' | 'fill' | 'none',
  minAngle: ?number = Math.PI / 7,
): [Array<Point>, Array<Array<Point>>, Array<Array<Points>>] {
  if (pointsAre === 'mid') {
    return makeThickLineMid(points, width, close, corner, minAngle);
  }
  if (pointsAre === 'outside') {
    return makeThickLineInsideOutside(points, width, close, corner, minAngle);
  }
  const reversedCopy = [];
  for (let i = points.length - 1; i >= 0; i -= 1) {
    reversedCopy.push(points[i]._dup());
  }
  return makeThickLineInsideOutside(reversedCopy, width, close, corner, minAngle);
}

function makePolyLine(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  pointsAre: 'mid' | 'outside' | 'inside' = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
  dash: Array<number> = [],
): [Array<Point>, Array<Array<Point>>, Array<Array<Points>>] {
  let points = [];
  let cornerStyleToUse = cornerStyle;

  // Convert line to line with corners
  if (cornerStyle === 'auto') {
    points = pointsIn.map(p => p._dup());
  } else if (cornerStyle === 'radius') {
    points = cornerLine(pointsIn, close, 'fromVertex', cornerSides, cornerSize);
    cornerStyleToUse = 'fill';
  } else {
    // autoCorners = 'none';
    points = pointsIn.map(p => p._dup());
  }

  // Convert line to dashed line
  if (dash.length > 1) {
    const dashes = lineToDash(points, dash, close, 0);
    let closeDashes = false;
    if (dashes.length === 1) {
      closeDashes = close;
    }
    let dashedTris = [];
    let dashedBorder = [[]];
    let dashedHole = [[]];
    dashes.forEach((d) => {
      const [tris, border, hole] = makeThickLine(
        d, width, pointsAre, closeDashes, cornerStyleToUse, minAutoCornerAngle,
      );
      dashedTris = [...dashedTris, ...tris];
      dashedBorder = [[...dashedBorder[0], ...border[0]]];
      dashedHole = [[...dashedHole[0], ...hole[0]]];
    });
    return [dashedTris, dashedBorder, dashedHole];
  }

  return makeThickLine(
    points, width, pointsAre, close, cornerStyleToUse, minAutoCornerAngle,
  );
}

function makePolyLineCorners(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  cornerLength: number,
  forceCornerLength: boolean,
  pointsAre: 'mid' | 'outside' | 'inside' = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
) {

  // split line into corners
  const corners = lineToCorners(pointsIn, close, cornerLength, forceCornerLength);

  let tris = [];
  let borders = [];
  let holes = [];
  corners.forEach((corner) => {
    const [t, b, h] = makePolyLine(
      corner, width, false, pointsAre, cornerStyle, cornerSize,
      cornerSides, minAutoCornerAngle,
      );
    tris = [...tris, ...t];
    borders = [...borders, ...b];
    holes = [...holes, ...h];
    // tris = [...tris, ...makePolyLine(corner, width, false, pointsAre, cornerStyle, cornerSize, cornerSides, minAutoCornerAngle)];
  });
  return [tris, borders, holes];
}

export {
  joinLinesInPoint,
  lineSegmentsToPoints,
  joinLinesInTangent,
  makeThickLineMid,
  makeThickLineInsideOutside,
  makePolyLine,
  makePolyLineCorners,
};