// @flow
import { Point } from './Point';

function pointsToNumbers2(points: Array<Point>) {
  const list = Array(points.length * 2);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 2] = points[i].x;
    list[i * 2 + 1] = points[i].y;
  }
  return list;
}

function pointsToNumbers(points: Array<Point>, dimension: 2 | 3 = 3) {
  if (dimension === 2) {
    return pointsToNumbers2(points);
  }
  const list = Array(points.length * 3);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 3] = points[i].x;
    list[i * 3 + 1] = points[i].y;
    list[i * 3 + 2] = points[i].z;
  }
  return list;
}

function numbersToPoints2(numbers: Array<number>) {
  const points = Array(numbers.length / 2);
  for (let i = 0; i < points.length; i += 1) {
    points[i] = new Point(numbers[i * 2], numbers[i * 2 + 1]);
  }
  return points;
}

function numbersToPoints(numbers: Array<number>, dimension: 2 | 3 = 3) {
  if (dimension === 2) {
    return numbersToPoints2(numbers);
  }
  const points = Array(numbers.length / 3);
  for (let i = 0; i < points.length; i += 1) {
    points[i] = new Point(
      numbers[i * 3],
      numbers[i * 3 + 1],
      numbers[i * 3 + 2],
    );
  }
  return points;
}

export {
  pointsToNumbers2,
  pointsToNumbers,
  numbersToPoints,
  numbersToPoints2,
};
