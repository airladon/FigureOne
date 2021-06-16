// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsableLine } from '../geometry/Line';
import { sphericalToCartesian } from '../geometry/common';
import { joinObjects } from '../tools';
import { getPolygonCorners } from '../morph';

export type OBJ_RodMesh = {
  sides?: number,
  radius?: number,
  normals?: 'curved' | 'flat',
  rotation?: number,
  line?: TypeParsableLine,
  ends?: boolean,
}

const rod = (options: OBJ_RodMesh) => {
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
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [1, 0, 0]);
  } else {
    line = getLine(o.line);
  }
  const end1 = getPolygonCorners({ radius, sides });
  const end2 = end1.map(c => c.add(0, 0, line.length()));
  const t = new Fig.Transform().rotate(rx, ry, rz);
  const tc = end1.map(c => c.transformBy(t.mat));
  const tcZ = end2.map(c => c.transformBy(t.mat));
  const frontNormal = new Fig.Point(0, 0, -1).transformBy(t.mat);
  const backNormal = new Fig.Point(0, 0, 1).transformBy(t.mat);
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
    points.push(new Fig.Point(0, 0, 0).transformBy(t.mat));
    points.push(tc[i]._dup());
    points.push(tc[next]._dup());
    normals.push(frontNormal._dup());
    normals.push(frontNormal._dup());
    normals.push(frontNormal._dup());
  }
  for (let i = 0; i < corners.length; i += 1) {
    const next = i === corners.length - 1 ? 0 : i + 1;
    points.push(tc[i]._dup(), tcZ[i]._dup(), tcZ[next]._dup());
    points.push(tc[i]._dup(), tcZ[next]._dup(), tc[next]._dup());
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
    points.push(tcZ[i]);
    points.push(tcZ[next]);
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