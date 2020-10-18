// @flow
import {
  Point, Transform, Line, minAngleDiff, threePointAngle,
} from '../../../tools/g2';


function getCenter(points: Array<Point>) {
  const [A, B, C] = points;
  const Ox = (A.x + B.x + C.x) / 3;
  const Oy = (A.y + B.y + C.y) / 3;
  return new Point(Ox, Oy);
}

function alignTriangle(
  pointsIn: Array<Point>,
  xAlign: 'left' | 'center' | 'right' | number | 'a1' | 'a2' | 'a3' | 's1' | 's2' | 's3' | 'centroid',
  yAlign: 'bottom' | 'middle' | 'top' | number | 'a1' | 'a2' | 'a3' | 's1' | 's2' | 's3' | 'centroid',
  rotation: number | { side: number, angle: number },
) {
  let rotationMatrix;
  if (typeof rotation === 'number') {
    rotationMatrix = new Transform().rotate(rotation).matrix();
  } else {
    const { side, angle } = rotation;
    let r = 0;
    if (side === 's1') {
      const sideRot = new Line(pointsIn[0], pointsIn[1]).angle();
      r = minAngleDiff(angle, sideRot);
    } else if (side === 's2') {
      const sideRot = new Line(pointsIn[1], pointsIn[2]).angle();
      r = minAngleDiff(angle, sideRot);
    } else if (side === 's3') {
      const sideRot = new Line(pointsIn[2], pointsIn[0]).angle();
      r = minAngleDiff(angle, sideRot);
    }
    rotationMatrix = new Transform().rotate(r).matrix();
  }
  const points = pointsIn.map(p => p.transformBy(rotationMatrix));

  const minX = Math.min(points[0].x, points[1].x, points[2].x);
  const minY = Math.min(points[0].y, points[1].y, points[2].y);
  const maxX = Math.max(points[0].x, points[1].x, points[2].x);
  const maxY = Math.max(points[0].y, points[1].y, points[2].y);
  const width = maxX - minX;
  const height = maxY - minY;
  const center = getCenter(points);
  const s1Center = new Line(points[0], points[1]).midPoint();
  const s2Center = new Line(points[1], points[2]).midPoint();
  const s3Center = new Line(points[2], points[0]).midPoint();
  let x = 0;
  let y = 0;
  if (xAlign === 'left') {
    x = -minX;
  } else if (xAlign === 'center') {
    x = -maxX + width / 2;
  } else if (xAlign === 'right') {
    x = -maxX;
  } else if (xAlign === 'centroid') {
    x = -center.x;
  } else if (xAlign === 'a2') {
    x = -points[1].x;
  } else if (xAlign === 'a3') {
    x = -points[2].x;
  } else if (xAlign === 's1') {
    x = -s1Center.x;
  } else if (xAlign === 's2') {
    x = -s2Center.x;
  } else if (xAlign === 's3') {
    x = -s3Center.x;
  } else if (typeof xAlign === 'number') {
    x = -minX - width * xAlign;
  }

  if (yAlign === 'bottom') {
    y = -minY;
  } else if (yAlign === 'middle') {
    y = -maxY + height / 2;
  } else if (yAlign === 'top') {
    y = -maxY;
  } else if (yAlign === 'centroid') {
    y = -center.y;
  } else if (yAlign === 'c2') {
    y = -points[1].y;
  } else if (yAlign === 'c3') {
    y = -points[2].y;
  } else if (yAlign === 's1') {
    y = -s1Center.y;
  } else if (yAlign === 's2') {
    y = -s2Center.y;
  } else if (yAlign === 's3') {
    y = -s3Center.y;
  } else if (typeof yAlign === 'number') {
    y = -minY - height * yAlign;
  }

  return points.map(p => new Point(p.x + x, p.y + y));
}

//                             c3
//                              .
//                            .   .
//                         .   a3   .
//                       .            .
//                s3   .                .   s2
//                   .                    .
//                 .                        .
//               /                           \
//             /  a1                       a2  \
//         c1  ---------------------------------   c2
//                           s1
//
//
function getASAPoints(
  ASA: [number, number, number],
  direction: 1 | -1,
) {
  const [a1, s1, a2] = ASA;
  const points = [new Point(0, 0), new Point(s1, 0)];
  const a3 = Math.PI - a1 - a2;
  const s2 = s1 / Math.sin(a3) * Math.sin(a1);
  points.push(new Point(
    s1 + s2 * Math.cos((Math.PI - a2) * direction),
    0 + s2 * Math.sin((Math.PI - a2) * direction),
  ));

  return points;
}

//                             c3
//                              .
//                            .   \
//                         .   a3   \
//                       .            \
//                s3   .                \   s2
//                   .                    \
//                 .                       \
//               .                           \
//             .  a1                       a2  \
//         c1  ---------------------------------   c2
//                           s1
//
//
function getSASPoints(
  SAS: [number, number, number],
  direction: 1 | -1,
) {
  const [s1, a2, s2] = SAS;
  const points = [new Point(0, 0), new Point(s1, 0)];
  points.push(new Point(
    s1 + s2 * Math.cos((Math.PI - a2) * direction),
    0 + s2 * Math.sin((Math.PI - a2) * direction),
  ));

  return points;
}


//                             c3
//                              .
//                            .   \
//                         .   a3   \
//                       .            \
//                s3   .                \   s2
//                   .                    \
//                 .                       \
//               .                           \
//             .  a1                       a2  \
//         c1  . . . . . . . . . . . . . . . . . .  c2
//                           s1
//
//
function getAASPoints(
  AAS: [number, number, number],
  direction: 1 | -1,
) {
  const [a1, a2, s2] = AAS;
  const a3 = Math.PI - a1 - a2;
  const s1 = s2 / Math.sin(a1) * Math.sin(a3);
  const points = [new Point(0, 0), new Point(s1, 0)];
  points.push(new Point(
    s1 + s2 * Math.cos((Math.PI - a2) * direction),
    0 + s2 * Math.sin((Math.PI - a2) * direction),
  ));

  return points;
}

//                             c3
//                              .
//                            /   \
//                         /   a3   \
//                       /            \
//                s3   /                \   s2
//                   /                    \
//                 /                       \
//               /                           \
//             /  a1                       a2  \
//         c1  ----------------------------------   c2
//                           s1
//
//
function getSSSPoints(
  SSS: [number, number, number],
  direction: 1 | -1,
) {
  const [s1, s2, s3] = SSS;
  const a2 = Math.acos((s1 * s1 + s2 * s2 - s3 * s3) / (2 * s1 * s2));
  const points = [new Point(0, 0), new Point(s1, 0)];
  points.push(new Point(
    s1 + s2 * Math.cos((Math.PI - a2) * direction),
    0 + s2 * Math.sin((Math.PI - a2) * direction),
  ));
  return points;
}


function getTriangle(
  options: {
    width: number,
    height: number,
    xAlign: 'left' | 'center' | 'right' | number,
    yAlign: 'bottom' | 'middle' | 'top' | number,
    top: 'left' | 'right' | 'center',
    points?: Array<Point>,
    SSS?: [number, number, number],
    ASA?: [number, number, number],
    AAS?: [number, number, number],
    SAS?: [number, number, number],
    direction: 1 | -1,
    rotation: number | { side: number, angle: number },
  },
): Array<Point> {
  if (options.points != null) {
    return options.points;
  }
  let points;
  const { direction } = options;
  if (options.ASA != null) {
    points = getASAPoints(options.ASA, direction);
  } else if (options.SAS != null) {
    points = getSASPoints(options.SAS, direction);
  } else if (options.AAS != null) {
    points = getAASPoints(options.AAS, direction);
  } else if (options.SSS != null) {
    points = getSSSPoints(options.SSS, direction);
  } else {
    const { width, height, top } = options;
    points = [
      new Point(0, 0),
      new Point(width, 0),
    ];
    if (top === 'left') {
      points.push(new Point(0, height * direction));
    } else if (top === 'center') {
      points.push(new Point(width / 2, height * direction));
    } else if (top === 'right') {
      points.push(new Point(width, height * direction));
    }
  }
  return alignTriangle(points, options.xAlign, options.yAlign, options.rotation);
}

function getTriangleDirection(points: Array<Point>) {
  const [p1, p2, p3] = points;
  const angle = threePointAngle(p1, p2, p3);
  if (angle > Math.PI) {
    return -1;
  }
  return 1;
}

export {
  getTriangle,
  getTriangleDirection,
};
