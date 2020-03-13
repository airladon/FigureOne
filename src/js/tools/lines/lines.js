import { cornerLine } from './corners';
import { lineToDash } from './dashes';
import {
  Line, Point, threePointAngleMin, threePointAngle,
} from '../g2';

function joinLinesInPoint(line1: Line, lineNext: Line) {
  const intersect = line1.intersectsWith(lineNext);
  if (intersect.intersect != null) {
    line1.setP2(intersect.intersect._dup());
    lineNext.setP1(intersect.intersect._dup());
  }
}

function lineSegmentsToPoints(lineSegments: Array<[Line, Line, Line]>) {
  const out = [];
  lineSegments.forEach((lineSegment) => {
    const [inside, outside] = lineSegment;
    out.push(inside.p1._dup());
    out.push(outside.p1._dup());
    out.push(inside.p2._dup());
    out.push(outside.p1._dup());
    out.push(inside.p2._dup());
    out.push(outside.p2._dup());
  });
  return out;
}

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

/* eslint-disable yoda */
function makeThickLineMid(
  points: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  makeCorner: boolean = true,
  cornerStyle: 'autoPoint' | 'fill',
  minAngleIn: ?number = Math.PI / 7,
) {
  const lineSegments = [];

  const makeLineSegment = (p1, p2) => {
    const lineSegment = new Line(p1, p2);
    const outsideOffset = lineSegment.offset('outside', width / 2);
    const insideOffset = lineSegment.offset('inside', width / 2);
    lineSegments.push([insideOffset, outsideOffset, lineSegment]);
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    makeLineSegment(points[i], points[i + 1]);
  }
  if (close) {
    makeLineSegment(points[points.length - 1], points[0]);
  }

  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (current, next) => {
    const [inside, outside, mid] = lineSegments[current];
    const [insideNext, outsideNext, midNext] = lineSegments[next];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    if (0 < angle && angle < minAngle) {
      joinLinesInTangent(outside, outsideNext, mid, midNext, inside, insideNext);
    } else if (minAngle < angle && angle < Math.PI) {
      joinLinesInPoint(inside, insideNext);
    } else if (Math.PI < angle && angle < Math.PI * 2 - minAngle) {
      joinLinesInPoint(outside, outsideNext);
    } else if (Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      joinLinesInTangent(inside, insideNext, mid, midNext, outside, outsideNext);
    }
  };

  const cornerFills = [];
  const createFill = (current, next) => {
    const [inside, outside, mid] = lineSegments[current];
    const [insideNext, outsideNext] = lineSegments[next];
    cornerFills.push(outside.p2._dup());
    cornerFills.push(mid.p2._dup());
    cornerFills.push(outsideNext.p1._dup());
    cornerFills.push(inside.p2._dup());
    cornerFills.push(mid.p2._dup());
    cornerFills.push(insideNext.p1._dup());
  };

  if (makeCorner) {
    for (let i = 0; i < lineSegments.length - 1; i += 1) {
      if (cornerStyle === 'autoPoint') {
        joinLineSegments(i, i + 1);
      } else {
        createFill(i, i + 1)
      }
    }
    if (close) {
      if (cornerStyle === 'autoPoint') {
        joinLineSegments(lineSegments.length - 1, 0);
      } else {
        createFill(lineSegments.length - 1, 0);
      }
    }
  }

  return [...lineSegmentsToPoints(lineSegments), ...cornerFills];
}

function makeThickLineInsideOutside(
  points: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  makeCorner: boolean = true,
  minAngleIn: ?number = Math.PI / 7,
) {
  // const out = [];
  const lineSegments = [];
  const makeLineSegment = (p1, p2) => {
    const lineSegment = new Line(p1, p2);
    const outsideOffset = lineSegment.offset('outside', width);
    lineSegments.push([lineSegment, outsideOffset]);
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    makeLineSegment(points[i], points[i + 1]);
  }
  if (close) {
    makeLineSegment(points[points.length - 1], points[0]);
  }

  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (current, next) => {
    const [inside, outside] = lineSegments[current];
    const [insideNext, outsideNext] = lineSegments[next];
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
    } else if (Math.PI < angle && angle < Math.PI * 2 - minAngle) {
      joinLinesInPoint(outside, outsideNext);
    } else if (Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      joinLinesInTangent(inside, insideNext, inside, insideNext, outside, outsideNext);
    }
  };

  if (makeCorner) {
    for (let i = 0; i < lineSegments.length - 1; i += 1) {
      joinLineSegments(i, i + 1);
    }
    if (close) {
      joinLineSegments(lineSegments.length - 1, 0);
    }
  }
  return lineSegmentsToPoints(lineSegments);
}

function makePolyLine(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  pointsAre: 'mid' | 'outside' | 'inside' = 'mid',
  corners: 'auto' | 'none' | 'radius' | 'chamfer',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
  dash: Array<number> = [],
) {
  let points = [];
  let autoCorners = true;
  let pointStyle = 'fill';

  // Convert line to line with corners
  if (corners === 'auto') {
    points = pointsIn.map(p => p._dup());
    pointStyle = 'autoPoint';
  } else if (corners === 'chamfer') {
    points = cornerLine(pointsIn, close, 'fromVertex', 1, cornerSize);
  } else if (corners === 'radius') {
    points = cornerLine(pointsIn, close, 'fromVertex', cornerSides, cornerSize);
    autoCorners = true;
  } else {
    autoCorners = false;
    points = pointsIn.map(p => p._dup());
  }
  
  // Convert line to dashed line
  let dashes;
  if (dash.length > 1) {
    dashes = lineToDash(points, dash, close, 0);
    let closeDashes = false;
    if (dashes.length === 1) {
      closeDashes = close;
    }
    let dashedTris = [];
    dashes.forEach((d) => {
      dashedTris = [...dashedTris, ...makeThickLineMid(
        d, width, closeDashes, autoCorners, pointStyle, minAutoCornerAngle,
      )];
    });
    return dashedTris;
  }

  if (pointsAre === 'mid') {
    return makeThickLineMid(
      points, width, close, autoCorners, pointStyle, minAutoCornerAngle,
    );
  }

  if (pointsAre === 'outside') {
    return makeThickLineInsideOutside(points, width, close, autoCorners, minAutoCornerAngle);
  }

  return makeThickLineInside(points, width, close, autoCorners);
}

export {
  joinLinesInPoint,
  lineSegmentsToPoints,
  joinLinesInTangent,
  makeThickLineMid,
  makeThickLineInsideOutside,
  makePolyLine,
};