// @flow
import {
  Point,
} from '../../../../tools/g2';

// import {
//   round,
// } from '../../../../tools/math';

function getPolygonPoints(options: {
  radius: number,
  innerRadius?: number,
  rotation: number,
  offset: Point,
  sides: number,
  sidesToDraw: number,
  direction: 1 | -1,
}): Array<Point> {
  const {
    radius, rotation, offset, sides, sidesToDraw, direction, innerRadius,
  } = options;
  let deltaAngle = Math.PI * 2 / sides;

  let sidesMultiplier = 1;
  if (innerRadius != null) {
    deltaAngle /= 2;
    sidesMultiplier = 2;
  }
  const points = [];
  if (sidesToDraw === 0) {
    return [];
  }

  for (let i = 0; i < sidesToDraw * sidesMultiplier; i += sidesMultiplier) {
    points.push(new Point(
      radius * Math.cos(deltaAngle * i * direction + rotation) + offset.x,
      radius * Math.sin(deltaAngle * i * direction + rotation) + offset.y,
    ));
    if (innerRadius != null) {
      points.push(new Point(
        innerRadius * Math.cos(deltaAngle * (i + 1) * direction + rotation) + offset.x,
        innerRadius * Math.sin(deltaAngle * (i + 1) * direction + rotation) + offset.y,
      ));
    }
  }
  if (sidesToDraw < sides) {
    points.push(new Point(
      radius * Math.cos(
        deltaAngle * sidesToDraw * sidesMultiplier * direction + rotation,
      ) + offset.x,
      radius * Math.sin(
        deltaAngle * sidesToDraw * sidesMultiplier * direction + rotation,
      ) + offset.y,
    ));
  }
  return points;
}

// function getFanTrisPolygon(
//   radius: number,
//   rotation: number,
//   offset: Point,
//   sides: number,
//   sidesToDraw: number,
//   direction: -1 | 1,
// ): Array<Point> {
//   const fan = [offset._dup(), ...getPolygonPoints(
//     radius, rotation, offset, sides, sidesToDraw, direction,
//   )];
//   if (sides === sidesToDraw) {
//     fan.push(fan[1]._dup());
//   }
//   return fan;
// }

function getTrisFillPolygon(
  center: Point,
  border: Array<Point>,
  sides: number,
  sidesToDraw: number,
): Array<Point> {
  const points = [];
  for (let i = 1; i < border.length; i += 1) {
    points.push(center._dup());
    points.push(border[i]._dup());
    points.push(border[i - 1]._dup());
  }
  if (sides === sidesToDraw) {
    points.push(center._dup());
    points.push(border[0]._dup());
    points.push(border[border.length - 1]._dup());
  }
  return points;
}

export {
  getPolygonPoints,
  // getFanTrisPolygon,
  getTrisFillPolygon,
};
