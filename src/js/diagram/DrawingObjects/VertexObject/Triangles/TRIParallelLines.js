// @flow

import { Point } from '../../../../tools/g2';

function TRIParallelLines(
  num: number = 10,
  spacing: number = 0.1,
  start: Point = new Point(0, 0),
  length: number = 0.1,
  width: number = 0.01,
  logarithmic: boolean = false,
  flip: boolean = false,
): Object {
  const points = [];
  const border = [];
  let sign = 1;
  if (flip) {
    sign = -1;
  }
  const cy = start.y;
  for (let i = 0; i < num; i += 1) {
    let cx;
    if (logarithmic) {
      cx = start.x + spacing * Math.floor(i / 10) + Math.log10(i % 10) * spacing;
    } else {
      cx = start.x + spacing * i;
    }
    cx -= width / 2;
    points.push(cx, sign * cy);
    points.push(cx + width, sign * cy);
    points.push(cx + width, sign * (cy + length));
    points.push(cx, cy);
    points.push(cx + width, sign * (cy + length));
    points.push(cx, sign * (cy + length));

    border.push([
      new Point(cx, sign * cy),
      new Point(cx + width, sign * cy),
      new Point(cx + width, sign * (cy + length)),
      new Point(cx, sign * (cy + length)),
    ]);
  }
  return {
    points,
    border,
  };
}

export default TRIParallelLines;
