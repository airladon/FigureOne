// @flow
import { Line, getLine } from '../geometry/Line';
import { Point } from '../geometry/Point';
import type { TypeParsableLine } from '../geometry/Line';
// import { sphericalToCartesian } from '../geometry/common';
import { joinObjects } from '../tools';
// import { getPolygonCorners } from '../morph';
import { polygon } from '../geometry/polygon';
import { Transform } from '../geometry/Transform';
import { getNormal } from '../geometry/Plane';
// import type { TypeRotationDefinition } from '../geometry/Transform';

export type OBJ_Rod = {
  sides?: number,
  radius?: number,
  normals?: 'curved' | 'flat',
  axis?: TypeParsableLine | number,
  ends?: boolean,
}

const rod = (options: OBJ_Rod) => {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'curved',
      ends: true,
      rotation: 0,
    },
    options,
  );
  let axis;
  let length;
  if (o.axis == null) {
    axis = new Line([0, 0, 0], [1, 0, 0]);
  } else {
    axis = getLine(o.axis);
  }
  const {
    radius, sides, ends, rotation,
  } = o;
  const position = axis.p1;
  const matrix = new Transform.rotation(['dir', axis.unitVector()])
  const poly = polygon({ radius, sides, rotation, axis: ['dir', 1, 0, 0] });
  const end1 = poly.map(p => p.transformBy(matrix).add(position));
  const end2 = poly.map(p => p.transformBy(matrix).add(position));
  // const end2 = end1.map(c => c.add(0, 0, axis.length()));
  // const t = new Fig.Transform().rotate(rx, ry, rz);
  // const tc = end1.map(c => c.transformBy(t.mat));
  // const tcZ = end2.map(c => c.transformBy(t.mat));
  const end1Normal = new Fig.Point(-1, 0, 0).transformBy(matrix).add(position);
  const end2Normal = new Fig.Point(1, 0, 0).transformBy(matrix).add(position);
  const sideNormals = [];
  const delta = Math.PI * 2 / sides / 2;
  for (let i = 0; i < sides; i += 1) {
    const angle = delta + i * delta * 2;
    const normal = Fig.tools.g2.polarToRect(1, angle);
    sideNormals.push(normal.transformBy(t.mat));
  }
  const points = [];
  const normals = [];
  for (let i = 0; i < sides; i += 1) {
    const next = i === corners.length - 1 ? 0 : i + 1;
    points.push(new Point(0, 0, 0).transformBy(matrix).add(position));
    points.push(end1[i]._dup());
    points.push(end1[next]._dup());
    normals.push(end1Normal._dup());
    normals.push(end1Normal._dup());
    normals.push(end1Normal._dup());
  }
  for (let i = 0; i < corners.length; i += 1) {
    const next = i === corners.length - 1 ? 0 : i + 1;
    points.push(end1[i]._dup(), end2[i]._dup(), end2[next]._dup());
    points.push(end1[i]._dup(), end2[next]._dup(), end1[next]._dup());
    normals.push(sideNormals[i]._dup());
    normals.push(sideNormals[i]._dup());
    normals.push(sideNormals[i]._dup());
    normals.push(sideNormals[i]._dup());
    normals.push(sideNormals[i]._dup());
    normals.push(sideNormals[i]._dup());
  }
  for (let i = 0; i < sides; i += 1) {
    const next = i === corners.length - 1 ? 0 : i + 1;
    points.push(new Fig.Point(0, 0, length).transformBy(t.mat));
    points.push(end2[i]);
    points.push(end2[next]);
    normals.push(backNormal._dup());
    normals.push(backNormal._dup());
    normals.push(backNormal._dup());
  }
  const vertices = [];
  const norms = [];
  for (let i = 0; i < points.length; i += 1) {
    vertices.push(points[i].x);
    vertices.push(points[i].y);
    vertices.push(points[i].z);
    norms.push(normals[i].x);
    norms.push(normals[i].y);
    norms.push(normals[i].z);
  }
  return [vertices, norms];
};