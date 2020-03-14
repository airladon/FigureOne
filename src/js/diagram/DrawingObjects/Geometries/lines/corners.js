import {
  Point, Line, threePointAngleMin,
} from '../../../../tools/g2';


//
// Make a circular corner between points - P2 and p3 must be the same
// distance from p1
//
//               .....................................
//          p3  0                                     0 center
//              0                                  0  .
//              0                               0   b .
//              0                            0        .
//              0                         0           .
//              0                C     0              .
//              0                   0                 .
//              0                0                    .  A
//              0             0                       .
//              0          0                          .
//              0       0                             .
//              0    0                                .
//              0 0  a                              c .
//              000000000000000000000000000000000000000
//          p1                     B                    p2
//
//
function circleCorner(p2in: Point, p1: Point, p3in: Point, sides: number): Array<Point> {
  // If sides is 0 or negative, then return the original points
  if (sides < 1) {
    return [p2in._dup(), p1._dup(), p3in._dup()];
  }

  // If sides is 1, then return the chamfer
  if (sides === 1) {
    return [p2in._dup(), p3in._dup()];
  }

  const p2 = p2in._dup();
  const p3 = p3in._dup();
  const points: Array<Point> = [];

  let _2a = threePointAngleMin(p2, p1, p3);
  if (_2a === Math.PI) {
    points.push(p2in._dup());
    for (let i = 0; i < sides - 2; i += 1) {
      points.push(p1._dup());
    }
    points.push(p3in._dup());
    return points;
  }

  // if equal to 0, that means the lines are going back on top of each other
  // in which case we still want a radius at the end, so make it small and
  // unnoticable
  if (_2a === 0) {
    _2a = 0.00000001;
  }
  const direction = _2a / Math.abs(_2a);

  const line12 = new Line(p1, p2);
  const a = Math.abs(_2a / 2);
  const c = Math.PI / 2;
  const b = Math.PI - a - c;
  const B = line12.length();
  const C = Math.sin(c) / Math.sin(b) * B;
  // const C = B / Math.cos(a);
  const center = new Point(
    p1.x + C * Math.cos(a * direction + line12.angle()),
    p1.y + C * Math.sin(a * direction + line12.angle()),
  );

  const _2b = b * 2;
  const delta = _2b / sides * direction * -1;

  const lineC2 = new Line(center, p2);
  const angleC2 = lineC2.angle();
  const magC2 = lineC2.length();
  points.push(p2);
  for (let i = 0; i < sides - 1; i += 1) {
    const angle = angleC2 + (i + 1) * delta;
    points.push(new Point(
      center.x + magC2 * Math.cos(angle),
      center.y + magC2 * Math.sin(angle),
    ));
  }
  points.push(p3);
  // if (reverse) {
  //   return points.reverse();
  // }
  return points;
}

function cutCorner(
  p2: Point, p1: Point, p3: Point,
  sides: number, style: 'radius' | 'fromVertex' | 'max', value: number,
): Array<Point> {
  const line12 = new Line(p1, p2);
  const line13 = new Line(p1, p3);
  let cut;
  if (style === 'fromVertex') {
    cut = value;
    cut = Math.min(cut, line12.length() / 2 * 0.99, line13.length() / 2 * 0.99);
  } else if (style === 'radius') {
    const angle = Math.abs(threePointAngleMin(p2, p1, p3)) / 2;
    cut = value / Math.tan(angle);
    cut = Math.min(cut, line12.length() / 2 * 0.99, line13.length() / 2 * 0.99);
  } else if (style === 'max') {
    cut = Math.min(line12.length(), line13.length());
  }
  // cut = Math.min(cut, line12.length() / 2 * 0.99, line13.length() / 2 * 0.99);

  const p2Max = line12.pointAtPercent(cut / line12.length());
  const p3Max = line13.pointAtPercent(cut / line13.length());

  return circleCorner(p2Max, p1, p3Max, sides);
}


function cornerLine(
  pointsIn: Array<Point>,
  close: boolean,
  type: 'fromVertex' | 'radius',
  sides: number,
  size: number,
) {
  let points = [];
  if (close) {
    points = cutCorner(
      pointsIn[pointsIn.length - 1], pointsIn[0], pointsIn[1],
      sides, type, size,
    );
  } else {
    points.push(pointsIn[0]);
  }

  for (let i = 1; i < pointsIn.length - 1; i += 1) {
    const corner = cutCorner(
      pointsIn[i - 1], pointsIn[i], pointsIn[i + 1],
      sides, type, size,
    );
    points = [...points, ...corner];
  }

  if (close) {
    points = [...points, ...cutCorner(
      pointsIn[pointsIn.length - 2], pointsIn[pointsIn.length - 1], pointsIn[0],
      sides, type, size,
    )];
  } else {
    points.push(pointsIn[pointsIn.length - 1]._dup());
  }
  return points;
}

function makeCorner(
  p2: Point, p1: Point, p3: Point, length: number, forceLength: boolean = false,
) {
  const line12 = new Line(p1, p2);
  const line13 = new Line(p1, p3);
  let newP2 = line12.pointAtPercent(length / line12.length());
  let newP3 = line13.pointAtPercent(length / line13.length());
  if (forceLength === false) {
    if (length > line12.length()) {
      newP2 = p2._dup();
    }
    if (length > line13.length()) {
      newP3 = p3._dup();
    }
  }
  return [newP2, p1._dup(), newP3];
}

function lineToCorners(
  pointsIn: Array<Point>,
  close: boolean,
  length: number,
  forceLength: boolean = false,
) {
  const corners = [];
  for (let i = 1; i < pointsIn.length - 1; i += 1) {
    corners.push(makeCorner(
      pointsIn[i - 1], pointsIn[i], pointsIn[i + 1], length, forceLength,
    ));
  }
  if (close) {
    corners.push(makeCorner(
      pointsIn[pointsIn.length - 2], pointsIn[pointsIn.length - 1], pointsIn[0], length, forceLength,
    ));
    corners.push(makeCorner(
      pointsIn[pointsIn.length - 1], pointsIn[0], pointsIn[1], length, forceLength,
    ));
  }
  return corners;
}

export {
  circleCorner,
  cutCorner,
  cornerLine,
  makeCorner,
  lineToCorners,
};