// @flow
import {
  Point,
} from '../../../tools/g2';

// import {
//   round,
// } from '../../../../tools/math';

function getRectPoints(
  width: number,
  height: number,
  sides: number,
  radius: number,
  x: number,
  y: number,
) {
  if (radius < 0.000000001) {
    return [
      new Point(x, y),
      new Point(x + width, y),
      new Point(x + width, y + height),
      new Point(x, y + height),
    ];
  }
  const points = [];
  const deltaAngle = Math.PI / 2 / sides;
  const r = Math.min(width / 2, height / 2, radius);
  const corners = [
    [x + r, y + r, Math.PI],
    [x - r + width, y + r, Math.PI / 2 * 3],
    [x - r + width, y - r + height, 0],
    [x + r, y - r + height, Math.PI / 2],
  ];
  corners.forEach((corner) => {
    const [cx, cy, angle] = corner;
    for (let i = 0; i < sides + 1; i += 1) {
      points.push(new Point(
        cx + r * Math.cos(i * deltaAngle + angle),
        cy + r * Math.sin(i * deltaAngle + angle),
      ));
    }
  });
  return points;
}

function getRectangleBorder(
  options: {
    width: number,
    height: number,
    xAlign: 'left' | 'center' | 'right' | number,
    yAlign: 'bottom' | 'middle' | 'top' | number,
    corner: {
      radius: 0,
      sides: 1,
    },
    line?: {
      widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid',
      width: number,
    },
    border: 'rect' | 'outline' | Array<Array<Point>>,
    touchBorder: number | 'rect' | 'border' | Array<Array<Point>>
  },
): Array<Point> {
  const {
    width, height, xAlign, yAlign, border, touchBorder, line,
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
  const { radius, sides } = options.corner;
  const points = getRectPoints(width, height, sides, radius, x, y);
  let lineDelta = 0;
  if (line != null && line.widthIs === 'mid') {
    lineDelta = line.width / 2;
  }
  if (line != null && (line.widthIs === 'outside' || line.widthIs === 'negative')) {
    lineDelta = line.width;
  }
  let outline;
  if (lineDelta > 0) {
    outline = getRectPoints(
      width + lineDelta * 2,
      height + lineDelta * 2,
      sides, radius, x - lineDelta, y - lineDelta,
    );
  } else {
    outline = points.map(p => p._dup());
  }

  let borderToUse = border;
  if (border === 'outline') {
    borderToUse = [outline];
  }

  let touchBorderToUse = touchBorder;
  if (typeof touchBorder === 'number') {
    touchBorderToUse = [getRectPoints(
      width + lineDelta * 2 + touchBorder * 2,
      height + lineDelta * 2 + touchBorder * 2,
      sides, radius, x - lineDelta - touchBorder, y - lineDelta - touchBorder,
    )];
  }

  return [points, borderToUse, touchBorderToUse];
}

function rectangleBorderToTris(border: Array<Point>) {
  const points = [border[0]._dup(), border[1]._dup(), border[2]._dup()];
  for (let i = 1; i < border.length - 1; i += 1) {
    points.push(border[0]);
    points.push(border[i]);
    points.push(border[i + 1]);
  }
  return points;
}

export {
  getRectangleBorder,
  rectangleBorderToTris,
};

