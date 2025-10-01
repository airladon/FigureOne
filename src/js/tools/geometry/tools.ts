import { Point } from './Point';

function pointsToNumbers2(points: Point[]): number[] {
  const list = Array(points.length * 2);
  for (let i = 0; i < points.length; i += 1) {
    list[i * 2] = points[i].x;
    list[i * 2 + 1] = points[i].y;
  }
  return list;
}

function pointsToNumbers(points: Point[], dimension: 2 | 3 = 3): number[] {
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

function numbersToPoints2(numbers: number[]): Point[] {
  const points = Array(numbers.length / 2);
  for (let i = 0; i < points.length; i += 1) {
    points[i] = new Point(numbers[i * 2], numbers[i * 2 + 1]);
  }
  return points;
}

function numbersToPoints(numbers: number[], dimension: 2 | 3 = 3): Point[] {
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
  pointsOrNumbers: Point[] | number[][] | number[],
  dimension: 2 | 3 = 3,
): number[] {
  if (pointsOrNumbers.length === 0) {
    return [];
  }
  if (typeof pointsOrNumbers[0] === 'number') {
    return pointsOrNumbers as number[];
  }
  if (Array.isArray(pointsOrNumbers[0])) {
    const out: number[] = [];
    for (let i = 0; i < pointsOrNumbers.length; i += 1) {
      out.push(...(pointsOrNumbers[i] as number[]));
    }
    return out;
  }
  return pointsToNumbers(pointsOrNumbers as Point[], dimension);
}

function toPoints(
  pointsOrNumbers: Point[] | number[],
  dimension: 2 | 3 = 3,
): Point[] {
  if (pointsOrNumbers.length === 0) {
    return [];
  }
  if (typeof pointsOrNumbers[0] !== 'number') {
    return pointsOrNumbers as Point[];
  }
  return numbersToPoints(pointsOrNumbers as number[], dimension);
}

export {
  pointsToNumbers2,
  pointsToNumbers,
  numbersToPoints,
  numbersToPoints2,
  toNumbers,
  toPoints,
};