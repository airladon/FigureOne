// @flow
import {
  Point, getBoundingRect, Rect, polarToRect, Transform, getPoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import type { OBJ_Copy, TypeCopyLinear, TypeCopyAngle } from '../../DiagramPrimitives/DiagramPrimitiveTypes';

// export type TypeVertexPolyLineBorderToPoint = TypeBorderToPoint;

// function repeatTransforms(
//   points: Array<Point>,
//   transforms: Array<Transform>,
// ) {
//   const out = [];
//   transforms.forEach((t) => {
//     const matrix = t.matrix();
//     points.forEach((p) => {
//       out.push(p.transformBy(matrix));
//     });
//   });
//   return out;
// }

function linearCopy(
  points: Array<Point>,
  copyIn: TypeCopyLinear,
) {
  const bounds = getBoundingRect(points);
  const defaultCopy = {
    num: 1,
    angle: 0,
  };
  const copy = joinObjects({}, defaultCopy, copyIn);

  if (copy.axis != null && copy.axis === 'y') {
    copy.angle = Math.PI / 2;
  }
  if (copy.axis != null && copy.axis === 'x') {
    copy.angle = 0;
  }


  if (copy.angle !== 0 && copy.step == null) {
    copy.step = Math.abs(bounds.height / Math.sin(copy.angle));
  }

  const out = [];
  for (let i = 0; i < copy.num + 1; i += 1) {
    const step = copy.step * i;
    points.forEach((p) => {
      out.push(p.add(polarToRect(step, copy.angle)));
    });
  }
  return out;
}

function angleCopy(
  points: Array<Point>,
  copyIn: TypeCopyAngle,
) {
  const defaultCopy = {
    num: 1,
    step: Math.PI / 4,
    center: [0, 0],
    skipPoints: 0,
  };

  const copy = joinObjects({}, defaultCopy, copyIn);
  copy.center = getPoint(copy.center);
  const out = [];
  for (let i = 0; i < copy.num; i += 1) {
    const matrix = new Transform()
      .translate(-copy.center.x, -copy.center.y)
      .rotate(i * copy.step)
      .translate(copy.center.x, copy.center.y)
      .matrix();
    const startPoint = i === 0 ? 0 : copy.skipPoints;
    for (let p = startPoint; p < points.length; p += 1) {
      out.push(points[p].transformBy(matrix));
    }
  }
  return out;
}

// Array<Transform> | Array<Point> | TypeCopyAngle
// | TypeCopyLinear | Point | Transform | TypeCopyOffset
// | TypeCopyTransform;

function processCopy(
  points: Array<Point>,
  copy: OBJ_Copy,
) {
  if (copy instanceof Point) {
    return [
      ...points.map(p => p._dup()),
      ...points.map(p => p.add(copy)),
    ];
  }
  if (copy instanceof Transform) {
    const matrix = copy.matrix();
    return [
      ...points.map(p => p._dup()),
      ...points.map(p => p.transformBy(matrix)),
    ];
  }
  if (Array.isArray(copy) && copy.length === 0) {
    return points.map(p => p._dup());
  }
  if ((Array.isArray(copy) && typeof copy[0] === 'number')
      || typeof copy === 'number') {
    return [
      ...points.map(p => p._dup()),
      ...points.map(p => p.add(getPoint(copy))),
    ];
  }
  if (Array.isArray(copy)) {
    const firstElement = copy[0];
    let out = [];
    out = points.map(p => p._dup());
    if (firstElement instanceof Point) {
      copy.forEach((copyPoint) => {
        out = [...out, ...points.map(p => p.add(copyPoint))];
      });
      return out;
    }
    if (firstElement instanceof Transform) {
      copy.forEach((copyTransform) => {
        const matrix = copyTransform.matrix();
        out = [...out, ...points.map(p => p.transformBy(matrix))];
      });
      return out;
    }
    if (Array.isArray(firstElement)) {
      copy.forEach((copyPoint) => {
        const cp = getPoint(copyPoint);
        out = [...out, ...points.map(p => p.add(cp))];
      });
      return out;
    }
    if (typeof firstElement === 'number') {
      copy.forEach((copyPoint) => {
        const cp = getPoint(copyPoint);
        out = [...out, ...points.map(p => p.add(cp))];
      });
      return out;
    }
  }

  if (!Array.isArray(copy) && copy.offset != null) {
    if (copy.offset instanceof Transform) {
      const matrix = copy.offset.matrix();
      return points.map(p => p.transformBy(matrix));
    }
    const offset = getPoint(copy.offset);
    return points.map(p => p.add(getPoint(offset)));
  }

  // if (!Array.isArray(copy) && copy.transform != null) {
  //   const matrix = copy.transform.matrix();
  //   return points.map(p => p.transformBy(matrix));
  // }

  if (!Array.isArray(copy) && copy.num != null) {
    return linearCopy(points, copy);
  }

  if (!Array.isArray(copy) && copy.numAngle != null) {
    return angleCopy(points, copy);
  }
  return points;
}

function copyPoints(
  points: Array<Point>,
  copyChain: ?Array<OBJ_Copy>,
) {
  let out = [];
  let nextPoints = points;
  if (copyChain == null) {
    return points;
  }
  copyChain.forEach((c) => {
    out = [...out, ...processCopy(nextPoints, c)];
    nextPoints = out;
  });
  return out;
}

// function rectRepeatPoints(points: Array<Point>, rectRepeat: {
//   xNum?: number,
//   xStep?: number,
//   yNum?: number,
//   yStep?: number,
// }) {
//   const bounds = getBoundingRect(points);
//   const defaultRectRepeat = {
//     xNum: 1,
//     yNum: 1,
//     xStep: bounds.width,
//     yStep: bounds.height,
//   };
//   const repeat = joinObjects({}, defaultRectRepeat, rectRepeat);
//   const out = [];
//   for (let x = 0; x < repeat.xNum; x += 1) {
//     for (let y = 0; y < repeat.yNum; y += 1) {
//       for (let p = 0; p < points.length; p += 1) {
//         out.push(points[p].add(x * repeat.xStep, y * repeat.yStep));
//       }
//     }
//   }
//   return out;
// }

// function polarRepeatPoints(points: Array<Point>, rectRepeat: {
//   magNum?: number,
//   magStep?: number,
//   angleNum?: number,
//   angleStep?: number,
//   angleStart?: number,
// }) {
//   const bounds = getBoundingRect(points);
//   const defaultRectRepeat = {
//     magNum: 1,
//     angleNum: 1,
//     magStep: Math.max(bounds.width, bounds.height),
//     angleStep: Math.PI / 4,
//     angleStart: 0,
//   };
//   const repeat = joinObjects({}, defaultRectRepeat, rectRepeat);
//   const out = [];
//   for (let mag = 0; mag < repeat.magNum; mag += 1) {
//     for (let angle = 0; angle < repeat.angleNum; angle += 1) {
//       for (let p = 0; p < points.length; p += 1) {
//         out.push(points[p].add(polarToRect(
//           mag * repeat.magStep, angle * repeat.angleStep + repeat.angleStart,
//         )));
//       }
//     }
//   }
//   return out;
// }

class VertexGeneric extends VertexObject {
  width: number;
  close: boolean;
  // borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
    drawType: 'triangles' | 'strip' | 'fan' | 'lines',
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
    copy: ?Array<OBJ_Copy>,
  ): void {
    if (textureLocation !== '') {
      super(webgl, 'withTexture', 'withTexture');
    } else {
      super(webgl);
    }
    // super(webgl);
    if (drawType === 'lines') {
      this.glPrimitive = this.gl[0].LINES;
    } else if (drawType === 'strip') {
      this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    } else if (drawType === 'fan') {
      this.glPrimitive = this.gl[0].TRIANGLE_FAN;
    }

    this.setupPoints(vertices, border, holeBorder, copy);
    this.setupTexture(textureLocation, textureVertexSpace, textureCoords, textureRepeat);
    this.setupBuffer();
  }

  change(
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
  ) {
    this.setupPoints(vertices, border, holeBorder);
    this.resetBuffer();
  }

  setupTexture(
    textureLocation: string = '',
    textureVertexSpace: Rect = new Rect(-1, -1, 2, 2),
    textureCoords: Rect = new Rect(0, 0, 1, 1),
    textureRepeat: boolean = false,
  ) {
    if (textureLocation) {
      this.texture = {
        id: textureLocation,
        src: textureLocation,
        type: 'image',
        points: [],
        repeat: textureRepeat,
      };

      this.createTextureMap(
        textureVertexSpace.left, textureVertexSpace.right,
        textureVertexSpace.bottom, textureVertexSpace.top,
        textureCoords.left, textureCoords.right,
        textureCoords.bottom, textureCoords.top,
      );
    }
  }

  setupPoints(
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
    copy: ?Array<OBJ_Copy>,
  ) {
    this.points = [];
    let newVerts = vertices;
    newVerts = copyPoints(vertices, copy);
    newVerts.forEach((v) => {
      this.points.push(v.x);
      this.points.push(v.y);
    });
    if (border == null) {
      const bounds = getBoundingRect(newVerts);
      this.border[0] = [
        new Point(bounds.left, bounds.bottom),
        new Point(bounds.right, bounds.bottom),
        new Point(bounds.right, bounds.top),
        new Point(bounds.left, bounds.top),
      ];
    } else {
      this.border = border;
    }
    if (holeBorder != null) {
      this.holeBorder = holeBorder;
    }
  }
}

export default VertexGeneric;
