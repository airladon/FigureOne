// @flow
import {
  Point,
} from '../../../tools/g2';

function getTriangleBorder(
  options: {
    width: number,
    height: number,
    xAlign: 'left' | 'center' | 'right' | number,
    yAlign: 'bottom' | 'middle' | 'top' | number,
    top: 'left' | 'right' | 'center',
    points?: Array<Point>,
    SSS?: [number, number, number],
    ASA?: [number, number, number],
  },
): Array<Point> {
  if (options.points != null) {
    return options.points;
  }
  if (options.ASA != null) {
    return getASAPoints(options);
  }
  const {
    width, height, xAlign, yAlign, top,
  } = options;
  let x = 0;
  let y = 0;
  if (xAlign === 'center') {
    x = -width / 2;
  } else if (xAlign === 'right') {
    x = -width;
  } else if (typeof xAlign === 'number') {
    x = -width * xAlign;
  }
  if (yAlign === 'middle') {
    y = -height / 2;
  } else if (yAlign === 'top') {
    y = -height;
  } else if (typeof yAlign === 'number') {
    y = -height * yAlign;
  }

  let xTop = x;
  if (top === 'center') {
    xTop += width / 2;
  } else if (top === 'right') {
    xTop += width;
  }

  const points = [
    new Point(x, y),
    new Point(x + width, y),
    new Point(xTop, y + height),
  ];

  return points;
}

//                             c3
//                              .
//                            .   .
//                         .   a3   .
//                       .            .
//                s3   .                .   s2
//                   .                    .
//                 .                        .
//               /                           \
//             /  a1                       a2  \
//         c1  ---------------------------------   c2
//                           s1
//
//
function getASAPoints(
  options: {
    xAlign: 'left' | 'center' | 'right' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'triCenter',
    yAlign: 'bottom' | 'middle' | 'top' | number | 'c1' | 'c2' | 'c3' | 's1' | 's2' | 's3' | 'triCenter',
    ASA?: [number, number, number],
    direction: 1 | -1,
  },
) {
  const {
    xAlign, yAlign, direction,
  } = options;

  const [a1, s1, a2] = options.ASA;
  const points = [new Point(0, 0), new Point(s1, 0)];
  const a3 = Math.PI - a1 - a2;
  const s2 = s1 / Math.sin(a3) * Math.sin(a1);
  points.push(new Point(
    s1 + s2 * Math.cos((Math.PI - a2) * direction),
    0 + s2 * Math.sin((Math.PI - a2) * direction),
  ));
  return points;
}

export default getTriangleBorder;
