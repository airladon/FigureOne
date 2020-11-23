// @flow
import {
  Point, Line, getPoint,
} from '../../../tools/g2';
import type { TypeParsablePoint } from '../../../tools/g2';

// import {
//   round,
// } from '../../../../tools/math';

// function getLineBorder(options: {
//   p1: Point,
//   p2: Point,
//   width: number,
//   length: number | {
//     p1: number,
//     p2: number,
//   },
// }) {
//   const {
//     p1, p2, width, length,
//   } = options;
//   const line = new Line(p1, p2);
//   let p1Length = 0;
//   let p2Length = 0;
//   if (typeof length === 'number') {
//     const deltaLength = length - line.length();
//     p1Length = -deltaLength / 2;
//     p2Length = deltaLength / 2;
//   } else {
//     const p1L = length.p1;
//     const p2L = length.p2;
//     if (p1L != null) {
//       p1Length = p1L;
//     } else {
//       p1Length = 0;
//     }
//     if (p2L != null) {
//       p2Length = p2L;
//     } else {
//       p2Length = 0;
//     }
//   }
//   const horizontalBorder = [
//     new Point(p1Length, -width / 2),
//     new Point(p1Length, width / 2),
//     new Point(line.length() + p2Length, width / 2),
//     new Point(line.length() + p2Length, -width / 2),
//   ];

//   const matrix = new Transform().rotate(line.angle()).translate(p1).matrix();
//   return horizontalBorder.map(p => p.transformBy(matrix));
// }

function getLine(options: {
  p1: Point,
  p2?: Point,
  length: number,
  width: number,
  angle: number,
  widthIs: 'mid' | 'positive' | 'negative',
  border: 'rect' | 'outline' | Array<Array<TypeParsablePoint>>,
  touchBorder: 'rect' | 'border' | Array<Array<TypeParsablePoint>>,
}) {
  const {
    p1, p2, length, width, angle, border, touchBorder, widthIs,
  } = options;
  const points = [getPoint(p1)];
  if (p2 == null) {
    points.push(new Point(
      points[0].x + length * Math.cos(angle),
      points[0].y + length * Math.sin(angle),
    ));
  } else {
    points.push(getPoint(p2));
  }

  let borderToUse = border;
  let touchBorderToUse = touchBorder;
  if (border === 'outline') {
    borderToUse = 'line';
  }

  if (typeof touchBorderToUse === 'number') {
    const line = new Line(points[0], points[1]);
    const extendedLine = new Line(
      line.pointAtLength(-touchBorderToUse),
      line.pointAtLength(line.length() + touchBorderToUse),
    );
    let negOffset;
    let posOffset;
    if (widthIs === 'positive') {
      negOffset = extendedLine.offset('negative', touchBorderToUse);
      posOffset = extendedLine.offset('positive', width + touchBorderToUse);
    } else if (widthIs === 'negative') {
      negOffset = extendedLine.offset('negative', width + touchBorderToUse);
      posOffset = extendedLine.offset('positive', touchBorderToUse);
    } else {
      negOffset = extendedLine.offset('negative', width / 2 + touchBorderToUse);
      posOffset = extendedLine.offset('positive', width / 2 + touchBorderToUse);
    }
    touchBorderToUse = [[negOffset.p1, negOffset.p2, posOffset.p2, posOffset.p1]];
  }
  return [points, borderToUse, touchBorderToUse];
}

export default getLine;
