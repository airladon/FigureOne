// @flow
import { getPoint } from '../geometry/Point';
import { Transform } from '../geometry/Transform';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import * as m3 from '../m3';
import { toPoints } from '../geometry/tools';

export type OBJ_Cube = {
  side?: number,
  center?: TypeParsablePoint,
  rotation?: TypeParsableRotation,
}

export default function cube(options: OBJ_Cube) {
  const o = joinObjects(
    {
      side: 1,
    },
    options,
  );
  const { side, center, rotation } = o;

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
  if (center == null && rotation == null) {
    return [pointsRaw, normalsRaw];
  }
  let matrix;
  if (rotation != null) {
    matrix = new Transform().rotate(rotation).matrix();
  }

  let c;
  if (center != null) {
    c = getPoint(center);
  }
  const points = [];
  const xNormal = matrix == null ? [1, 0, 0] : m3.transform(matrix, 1, 0, 0);
  const xNegNormal = matrix == null ? [-1, 0, 0] : m3.transform(matrix, -1, 0, 0);
  const yNormal = matrix == null ? [0, 1, 0] : m3.transform(matrix, 0, 1, 0);
  const yNegNormal = matrix == null ? [0, -1, 0] : m3.transform(matrix, 0, -1, 0);
  const zNormal = matrix == null ? [0, 0, 1] : m3.transform(matrix, 0, 0, 1);
  const zNegNormal = matrix == null ? [0, 0, -1] : m3.transform(matrix, 0, 0, -1);
  for (let i = 0; i < 36; i += 1) {
    // let p = [
    //   pointsRaw[i * 3],
    //   pointsRaw[i * 3 + 1],
    //   pointsRaw[i * 3 + 2],
    // ];
    let p = pointsRaw[i];
    if (matrix != null) {
      p = getPoint(m3.transform(matrix, p.x, p.y, p.z));
    }
    if (c != null) {
      p = p.add(c);
      // p.x += c.x;
      // p.y += c.y;
      // p.x += c.z;
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
