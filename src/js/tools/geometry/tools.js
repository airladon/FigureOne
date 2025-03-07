// @flow
import { Point } from './Point';

function pointsToNumbers2(points: Array<Point>): Array<number> {
  const list = Array(points.length * 2);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 2] = points[i].x;
    list[i * 2 + 1] = points[i].y;
  }
  return list;
}

function pointsToNumbers(points: Array<Point>, dimension: 2 | 3 = 3): Array<number> {
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

function numbersToPoints2(numbers: Array<number>): Array<Point> {
  const points = Array(numbers.length / 2);
  for (let i = 0; i < points.length; i += 1) {
    points[i] = new Point(numbers[i * 2], numbers[i * 2 + 1]);
  }
  return points;
}

function numbersToPoints(numbers: Array<number>, dimension: 2 | 3 = 3): Array<Point> {
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

function toNumbers(
  pointsOrNumbers: Array<Point> | Array<Array<number>> | Array<number>,
  dimension: 2 | 3 = 3,
): Array<number> {
  if (pointsOrNumbers.length === 0) {
    return [];
  }
  if (typeof pointsOrNumbers[0] === 'number') { // $FlowFixMe
    return pointsOrNumbers;
  }
  if (Array.isArray(pointsOrNumbers[0])) {
    const out = [];
    for (let i = 0; i < pointsOrNumbers.length; i += 1) {
      out.push(...pointsOrNumbers);
    } // $FlowFixMe
    return out;
  } // $FlowFixMe
  return pointsToNumbers(pointsOrNumbers, dimension);
}

function toPoints(
  pointsOrNumbers: Array<Point> | Array<number>,
  dimension: 2 | 3 = 3,
): Array<Point> {
  if (pointsOrNumbers.length === 0) {
    return [];
  }
  if (typeof pointsOrNumbers[0] !== 'number') { // $FlowFixMe
    return pointsOrNumbers;
  } // $FlowFixMe
  return numbersToPoints(pointsOrNumbers, dimension);
}

export {
  pointsToNumbers2,
  pointsToNumbers,
  numbersToPoints,
  numbersToPoints2,
  toNumbers,
  toPoints,
};
