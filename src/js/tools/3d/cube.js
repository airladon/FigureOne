// @flow
import { getPoint } from '../geometry/Point';
import { Transform } from '../geometry/Transform';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import * as m3 from '../m3';

export type OBJ_Cube = {
  side?: number,
  position?: TypeParsablePoint,
  rotation?: TypeParsableRotation,
}

export default function cube(options: OBJ_Cube) {
  const o = joinObjects(
    {
      side: 1,
    },
    options,
  );
  const { side, position, rotation } = o;

  const s = side / 2;
  const pointsRaw = [
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
  ];
  const normalsRaw = [
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
  ];
  if (position == null && rotation == null) {
    return [pointsRaw, normalsRaw];
  }
  let matrix;
  if (rotation != null) {
    matrix = new Transform().rotate(rotation).matrix();
  }

  let c;
  if (position != null) {
    c = getPoint(position);
  }
  const points = [];
  const xNormal = matrix == null ? [1, 0, 0] : m3.transform(matrix, 1, 0, 0);
  const xNegNormal = matrix == null ? [-1, 0, 0] : m3.transform(matrix, -1, 0, 0);
  const yNormal = matrix == null ? [0, 1, 0] : m3.transform(matrix, 0, 1, 0);
  const yNegNormal = matrix == null ? [0, -1, 0] : m3.transform(matrix, 0, -1, 0);
  const zNormal = matrix == null ? [0, 0, 1] : m3.transform(matrix, 0, 0, 1);
  const zNegNormal = matrix == null ? [0, 0, -1] : m3.transform(matrix, 0, 0, -1);
  for (let i = 0; i < 36; i += 1) {
    let p = [
      pointsRaw[i * 3],
      pointsRaw[i * 3 + 1],
      pointsRaw[i * 3 + 2],
    ];
    if (matrix != null) {
      p = m3.transform(matrix, p[0], p[1], p[2]);
    }
    if (c != null) {
      p[0] += c.x;
      p[1] += c.y;
      p[2] += c.z;
    }
    points.push(...p);
  }
  const normals = [
    // +z
    ...zNormal.slice(),
    ...zNormal.slice(),
    ...zNormal.slice(),
    ...zNormal.slice(),
    ...zNormal.slice(),
    ...zNormal.slice(),
    // +x
    ...xNormal.slice(),
    ...xNormal.slice(),
    ...xNormal.slice(),
    ...xNormal.slice(),
    ...xNormal.slice(),
    ...xNormal.slice(),
    // +y
    ...yNormal.slice(),
    ...yNormal.slice(),
    ...yNormal.slice(),
    ...yNormal.slice(),
    ...yNormal.slice(),
    ...yNormal.slice(),
    // -z
    ...zNegNormal.slice(),
    ...zNegNormal.slice(),
    ...zNegNormal.slice(),
    ...zNegNormal.slice(),
    ...zNegNormal.slice(),
    ...zNegNormal.slice(),
    // -x
    ...xNegNormal.slice(),
    ...xNegNormal.slice(),
    ...xNegNormal.slice(),
    ...xNegNormal.slice(),
    ...xNegNormal.slice(),
    ...xNegNormal.slice(),
    // -y
    ...yNegNormal.slice(),
    ...yNegNormal.slice(),
    ...yNegNormal.slice(),
    ...yNegNormal.slice(),
    ...yNegNormal.slice(),
    ...yNegNormal.slice(),
  ];
  console.log(points, normals)
  return [points, normals];
}
