// @flow
import {
  Point, Line, Transform,
} from '../../../tools/g2';

// import {
//   round,
// } from '../../../../tools/math';

function getLineBorder(options: {
  p1: Point,
  p2: Point,
  width: number,
  length: number | {
    p1: number,
    p2: number,
  },
}) {
  const {
    p1, p2, width, length,
  } = options;
  const line = new Line(p1, p2);
  let p1Length = 0;
  let p2Length = 0;
  if (typeof length === 'number') {
    const deltaLength = length - line.length();
    p1Length = -deltaLength / 2;
    p2Length = deltaLength / 2;
  } else {
    const p1L = length.p1;
    const p2L = length.p2;
    if (p1L != null) {
      p1Length = p1L;
    } else {
      p1Length = 0;
    }
    if (p2L != null) {
      p2Length = p2L;
    } else {
      p2Length = 0;
    }
  }
  const horizontalBorder = [
    new Point(p1Length, -width / 2),
    new Point(p1Length, width / 2),
    new Point(line.length() + p2Length, width / 2),
    new Point(line.length() + p2Length, -width / 2),
  ];

  const matrix = new Transform().rotate(line.angle()).translate(p1).matrix();
  return horizontalBorder.map(p => p.transformBy(matrix));
}

export default getLineBorder;
