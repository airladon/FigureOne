// @flow
import {
  Point,
} from '../../tools/g2';
import type {
  OBJ_Generic,
} from '../FigurePrimitives/FigurePrimitives';

export type OBJ_Ellipse_Defined = {
  width: number,
  height: number,
  xAlign: 'left' | 'center' | 'right' | number,
  yAlign: 'bottom' | 'middle' | 'top' | number,
  sides: number,
  line?: {
    widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid',
    width: number,
  },
  drawBorderBuffer: number | Array<Array<Point>>
} & OBJ_Generic;

// import {
//   round,
// } from '../../../../tools/math';

function getEllipsePoints(
  width: number,
  height: number,
  sides: number,
  x: number,
  y: number,
): Array<Point> {
  const points = [];
  const deltaAngle = Math.PI * 2 / sides;
  for (let i = 0; i < sides; i += 1) {
    points.push(new Point(
      width / 2 * Math.cos(deltaAngle * i) + x,
      height / 2 * Math.sin(deltaAngle * i) + y,
    ));
  }
  return points;
}

function getEllipseBorder(options: OBJ_Ellipse_Defined) {
  const {
    width, height, xAlign, yAlign, sides,
  } = options;
  let x = 0;
  let y = 0;
  if (xAlign === 'left') {
    x = width / 2;
  } else if (xAlign === 'right') {
    x = -width / 2;
  } else if (typeof xAlign === 'number') {
    x = width / 2 - width * xAlign;
  }
  if (yAlign === 'bottom') {
    y = height / 2;
  } else if (yAlign === 'top') {
    y = -height / 2;
  } else if (typeof yAlign === 'number') {
    y = -height / 2 + height * yAlign;
  }

  const points = getEllipsePoints(width, height, sides, x, y);
  // let lineDelta = 0;
  // if (line != null && line.widthIs === 'mid') {
  //   lineDelta = line.width / 2;
  // }
  // if (line != null && (line.widthIs === 'outside' || line.widthIs === 'negative')) {
  //   lineDelta = line.width;
  // }
  // let outline: Array<Point>;
  // if (lineDelta > 0) {
  //   outline = getEllipsePoints(
  //     width + lineDelta * 2,
  //     height + lineDelta * 2,
  //     sides, x, y,
  //   );
  // } else {  // $FlowFixMe
  //   outline = points.map(p => p._dup());
  // }

  // const border = [outline];
  // const { drawBorderBuffer } = options;
  // let borderBuffer = drawBorderBuffer;
  // if (typeof drawBorderBuffer === 'number') {
  //   borderBuffer = [getEllipsePoints(
  //     width + lineDelta * 2 + drawBorderBuffer * 2,
  //     height + lineDelta * 2 + drawBorderBuffer * 2,
  //     sides, x, y,
  //   )];
  // }

  return [points];
}

function ellipseBorderToTris(border: Array<Point>) {
  const points = [border[0]._dup(), border[1]._dup(), border[2]._dup()];
  for (let i = 2; i < border.length - 1; i += 1) {
    points.push(border[0]);
    points.push(border[i]);
    points.push(border[i + 1]);
  }
  return points;
}

export {
  getEllipseBorder,
  ellipseBorderToTris,
};

