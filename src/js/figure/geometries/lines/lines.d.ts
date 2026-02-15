import { Point } from '../../../tools/g2';

export function makeFastPolyLine(
  pointsIn: Array<Point>,
  width: number,
  close: boolean,
): [Point[], number[][], number[][], number[][]];
