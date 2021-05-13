// @flow
import {
  Point,
} from '../../tools/g2';
import type {
  OBJ_Generic,
} from '../FigurePrimitives/FigurePrimitives';

export type OBJ_Arc_Defined = {
  radius: number,
  sides: number,
  startAngle: number,
  angle: number,
  line?: {
    widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid',
    width: number,
  },
  offset: Point,
  fillCenter: boolean,
  drawBorderBuffer: number | Array<Array<Point>>
} & OBJ_Generic;

function getArcBorder(options: OBJ_Arc_Defined): Array<Point> {
  const points = [];
  const {
    radius, startAngle, angle, offset, sides,
  } = options;
  const numSidesInCircle = sides / angle * Math.PI * 2;
  const apothem = radius * Math.cos(Math.PI / numSidesInCircle);
  const deltaAngle = angle / (sides);

  const start = angle >= 0 ? startAngle : startAngle + angle;
  const dAngle = angle >= 0 ? deltaAngle : -deltaAngle;

  if (options.line == null && options.fillCenter) {
    points.push(offset._dup());
  }
  points.push(new Point(
    apothem * Math.cos(start),
    apothem * Math.sin(start),
  ).add(offset));
  for (let i = 0; i < sides; i += 1) {
    points.push(new Point(
      radius * Math.cos(start + dAngle / 2 + dAngle * i) + offset.x,
      radius * Math.sin(start + dAngle / 2 + dAngle * i) + offset.y,
    ));
  }
  points.push(new Point(
    apothem * Math.cos(start + dAngle * sides),
    apothem * Math.sin(start + dAngle * sides),
  ).add(offset));
  return points;
}


function arcBorderToTris(border: Array<Point>) {
  const points = [border[0]._dup(), border[1]._dup(), border[2]._dup()];
  for (let i = 2; i < border.length - 1; i += 1) {
    points.push(border[0]);
    points.push(border[i]);
    points.push(border[i + 1]);
  }
  return points;
}

export {
  getArcBorder,
  arcBorderToTris,
};

