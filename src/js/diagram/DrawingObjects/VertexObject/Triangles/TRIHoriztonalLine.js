// @flow

import {
  Point, Transform,
} from '../../../../tools/g2';

function TRIHorizontalLine(
  start: Point = new Point(0, 0),
  length: number = 1,
  width: number = 0.1,
  rotation: number = 0,
): Object {
  const t = new Transform().rotate(rotation).translate(start.x, start.y);

  const cx = 0;
  const cy = 0;
  const pList = [
    new Point(cx, cy - width / 2),
    new Point(cx + length, cy - width / 2),
    new Point(cx + length, cy + width / 2),
    new Point(cx, cy - width / 2),
    new Point(cx + length, cy + width / 2),
    new Point(cx, cy + width / 2),
  ];
  const pListTransformed = pList.map(p => p.transformBy(t.matrix()));
  const points = [];

  pListTransformed.map((p) => {
    points.push(p.x);
    points.push(p.y);
    return true;
  });

  const border = [
    pList[0],
    pList[1],
    pList[2],
    pList[5],
  ];

  return {
    points,
    border,
  };
}

export default TRIHorizontalLine;
