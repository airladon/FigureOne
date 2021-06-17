// @flow
import { Line, getLine } from '../geometry/Line';
// import { Point } from '../geometry/Point';
import type { TypeParsableLine } from '../geometry/Line';
// import { sphericalToCartesian } from '../geometry/common';
import { joinObjects } from '../tools';
// import { getPolygonCorners } from '../morph';
// import { polygon } from '../geometry/polygon';
// import { Transform } from '../geometry/Transform';
// import { getNormal } from '../geometry/Plane';
// import { polarToRect } from '../geometry/coordinates';
import { lathe } from './lathe';
// import type { TypeRotationDefinition } from '../geometry/Transform';

export type OBJ_Rod = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine | number,
  ends?: boolean | 1 | 2,
  length?: number,
}

export default function rod(options: OBJ_Rod) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'curve',
      ends: true,
      rotation: 0,
      length: 1,
    },
    options,
  );
  const {
    ends, rotation, sides, radius, normals, length,
  } = o;
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [length, 0, 0]);
  } else {
    line = getLine(o.line);
  }
  const profile = [];
  if (ends || ends === 1) {
    profile.push([0, 0]);
  }
  profile.push([0, radius], [line.length(), radius]);
  if (ends || ends === 2) {
    profile.push([line.length(), 0]);
  }

  return lathe({
    sides,
    rotation,
    normals: normals === 'curve' ? 'curveLathe' : 'flat',
    axis: ['dir', line.unitVector()],
    position: line.p1,
    profile,
  });
  // let axis;
  // let length;
  // if (o.axis == null) {
  //   axis = new Line([0, 0, 0], [1, 0, 0]);
  // } else {
  //   axis = getLine(o.axis);
  // }
  // const {
  //   radius, sides, ends, rotation,
  // } = o;
  // const position = axis.p1;
  // const matrix = new Transform.rotation(['dir', axis.unitVector()])
  // const poly = polygon({ radius, sides, rotation, axis: ['dir', 1, 0, 0] });
  // const end1 = poly.map(p => p.transformBy(matrix).add(position));
  // const end2 = poly.map(p => p.transformBy(matrix).add(position));
  // const end1Normal = new Point(-1, 0, 0).transformBy(matrix).add(position);
  // const end2Normal = new Point(1, 0, 0).transformBy(matrix).add(position);
  // const sideNormals = [];
  // const vertexNormals = [];
  // if (o.normals === 'flat') {
  //   const delta = Math.PI * 2 / sides / 2;
  //   for (let i = 0; i < sides; i += 1) {
  //     const angle = delta + i * delta * 2;
  //     const normal = polarToRect(1, angle);
  //     sideNormals.push(normal.transformBy(matrix));
  //   }
  // }
  // if (o.normals === 'curved')
  // const points = [];
  // const normals = [];
  // for (let i = 0; i < sides; i += 1) {
  //   const next = i === poly.length - 1 ? 0 : i + 1;
  //   points.push(...new Point(0, 0, 0).transformBy(matrix).add(position).toArray());
  //   points.push(...end1[i].toArray());
  //   points.push(...end1[next].toArray());
  //   normals.push(...end1Normal.toArray());
  //   normals.push(...end1Normal.toArray());
  //   normals.push(...end1Normal.toArray());
  // }
  // for (let i = 0; i < poly.length; i += 1) {
  //   const next = i === poly.length - 1 ? 0 : i + 1;
  //   points.push(...end1[i].toArray(), end2[i].toArray(), end2[next].toArray());
  //   points.push(...end1[i].toArray(), end2[next].toArray(), end1[next].toArray());
  //   normals.push(...sideNormals[i].toArray());
  //   normals.push(...sideNormals[i].toArray());
  //   normals.push(...sideNormals[i].toArray());
  //   normals.push(...sideNormals[i].toArray());
  //   normals.push(...sideNormals[i].toArray());
  //   normals.push(...sideNormals[i].toArray());
  // }
  // for (let i = 0; i < sides; i += 1) {
  //   const next = i === poly.length - 1 ? 0 : i + 1;
  //   points.push(...new Point(0, 0, length).transformBy(matrix).toArray());
  //   points.push(...end2[i].toArray());
  //   points.push(...end2[next].toArray());
  //   normals.push(...end2Normal.toArray());
  //   normals.push(...end2Normal.toArray());
  //   normals.push(...end2Normal.toArray());
  // }
  // const vertices = [];
  // const norms = [];
  // for (let i = 0; i < points.length; i += 1) {
  //   vertices.push(points[i].x);
  //   vertices.push(points[i].y);
  //   vertices.push(points[i].z);
  //   norms.push(normals[i].x);
  //   norms.push(normals[i].y);
  //   norms.push(normals[i].z);
  // }
  // return [vertices, norms];
}
