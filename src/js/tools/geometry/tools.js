// @flow
import type { Point } from './Point';

function pointsToArray2(points: Array<Point>) {
  const list = Array(points.length * 2);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 2] = points[i].x;
    list[i * 2 + 1] = points[i].y;
  }
  return list;
}

function pointsToArray(points: Array<Point>, dimension: 2 | 3 = 3) {
  if (dimension === 2) {
    return pointsToArray2(points);
  }
  const list = Array(points.length * 3);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 3] = points[i].x;
    list[i * 3 + 1] = points[i].y;
    list[i * 3 + 2] = points[i].z;
  }
  return list;
}

export {
  pointsToArray2,
  pointsToArray,
};
