// @flow
import { getPoint } from '../geometry/Point';
import { Transform, getTransform } from '../geometry/Transform';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import * as m3 from '../m3';
import { toPoints } from '../geometry/tools';
import type { TypeParsableTransform } from '../geometry/Transform';

export type OBJ_Cube = {
  side?: number,
  center?: TypeParsablePoint,
  rotation?: TypeParsableRotation,
  transform?: TypeParsableTransform,
}

function toLines(
  side: number,
  center: TypeParsablePoint,
  rotation: TypeParsableRotation,
  transform: TypeParsableTransform,
) {
  const s = side;
  console.log([
    -s, -s, s, s, -s, s,
    s, -s, s, s, s, s,
    s, s, s, -s, s, s,
    -s, s, s, -s, -s, s,
    -s, -s, s, -s, -s, -s,
    -s, s, s, -s, s, -s,
    s, s, s, s, s, -s,
    s, -s, s, s, -s, -s,
    -s, -s, -s, s, -s, -s,
    s, -s, -s, s, s, -s,
    s, s, -s, -s, s, -s,
    -s, s, -s, -s, -s, -s,
  ])
  const points = toPoints([
    -s, -s, s, s, -s, s,
    s, -s, s, s, s, s,
    s, s, s, -s, s, s,
    -s, s, s, -s, -s, s,
    -s, -s, s, -s, -s, -s,
    -s, s, s, -s, s, -s,
    s, s, s, s, s, -s,
    s, -s, s, s, -s, -s,
    -s, -s, -s, s, -s, -s,
    s, -s, -s, s, s, -s,
    s, s, -s, -s, s, -s,
    -s, s, -s, -s, -s, -s,
  ]);
  if (center == null && rotation == null && transform == null) {
    return points;
  }
  let t = new Transform();
  if (center != null) {
    t = t.translate(center);
  }
  if (rotation != null) {
    t = t.rotate(rotation);
  }
  if (transform != null) {
    t = new Transform([...t.def, ...getTransform(transform).def]);
  }
  const matrix = t.matrix();
  return points.map(p => p.transformBy(matrix));
}

export default function cube(options: OBJ_Cube) {
  const o = joinObjects(
    {
      side: 1,
    },
    options,
  );
  const {
    side, center, rotation, transform,
  } = o;
  if (o.lines) {
    return [toLines(side, center, rotation, transform)];
  }

  const s = side / 2;
  const pointsRaw = toPoints([
    // face +z
    -s, -s, s,
    s, -s, s,
    s, s, s,
    -s, -s, s,
    s, s, s,
    -s, s, s,
    // face +x
    s, -s, s,
    s, -s, -s,
    s, s, -s,
    s, -s, s,
    s, s, -s,
    s, s, s,
    // face +y
    s, s, s,
    s, s, -s,
    -s, s, -s,
    s, s, s,
    -s, s, -s,
    -s, s, s,
    // face -z
    -s, -s, -s,
    s, s, -s,
    s, -s, -s,
    -s, -s, -s,
    -s, s, -s,
    s, s, -s,
    // face -x
    -s, -s, s,
    -s, s, -s,
    -s, -s, -s,
    -s, -s, s,
    -s, s, s,
    -s, s, -s,
    // face -y
    s, -s, s,
    -s, -s, -s,
    s, -s, -s,
    s, -s, s,
    -s, -s, s,
    -s, -s, -s,
  ]);
  const normalsRaw = toPoints([
    // +z
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // +x
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // +y
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    // -z
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // -x
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    // -y
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ]);
  if (center == null && rotation == null && transform == null) {
    return [pointsRaw, normalsRaw];
  }
  let matrix;
  if (rotation != null) {
    matrix = new Transform().rotate(rotation).matrix();
  }

  let transformMatrix;
  let normalTransformMatrix;
  if (transform != null) {
    transformMatrix = getTransform(transform).matrix();
    normalTransformMatrix = m3.transpose(m3.inverse(transformMatrix));
  }

  let c;
  if (center != null) {
    c = getPoint(center);
  }
  const points = [];
  let xNormal = matrix == null ? [1, 0, 0] : m3.transform(matrix, 1, 0, 0);
  let xNegNormal = matrix == null ? [-1, 0, 0] : m3.transform(matrix, -1, 0, 0);
  let yNormal = matrix == null ? [0, 1, 0] : m3.transform(matrix, 0, 1, 0);
  let yNegNormal = matrix == null ? [0, -1, 0] : m3.transform(matrix, 0, -1, 0);
  let zNormal = matrix == null ? [0, 0, 1] : m3.transform(matrix, 0, 0, 1);
  let zNegNormal = matrix == null ? [0, 0, -1] : m3.transform(matrix, 0, 0, -1);
  if (transform != null) {
    xNormal = m3.transform(normalTransformMatrix, ...xNormal);
    xNegNormal = m3.transform(normalTransformMatrix, ...xNegNormal);
    yNormal = m3.transform(normalTransformMatrix, ...yNormal);
    yNegNormal = m3.transform(normalTransformMatrix, ...yNegNormal);
    zNormal = m3.transform(normalTransformMatrix, ...zNormal);
    zNegNormal = m3.transform(normalTransformMatrix, ...zNegNormal);
  }
  for (let i = 0; i < 36; i += 1) {
    let p = pointsRaw[i];
    if (matrix != null) {
      p = getPoint(m3.transform(matrix, p.x, p.y, p.z));
    }
    if (c != null) {
      p = p.add(c);
    }
    if (transform != null) {
      p = p.transformBy(transformMatrix);
    }
    points.push(p);
  }
  const normals = [
    // +z
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    getPoint(zNormal),
    // +x
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    getPoint(xNormal),
    // +y
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    getPoint(yNormal),
    // -z
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    getPoint(zNegNormal),
    // -x
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    getPoint(xNegNormal),
    // -y
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
    getPoint(yNegNormal),
  ];
  return [points, normals];
}
