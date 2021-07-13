// @flow
import { getPoint } from '../geometry/Point';
import { getTransform } from '../geometry/Transform';
import * as m3 from '../m3';
import type { TypeParsablePoint } from '../geometry/Point';
import { sphericalToCartesian } from '../geometry/common';
import { joinObjects } from '../tools';

export type OBJ_SpherePoints = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  center?: TypeParsablePoint,
  transform?: TypeParsableTransform,
}

export default function sphere(options: OBJ_SpherePoints) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 1,
      normals: 'curve',
      output: 'points',
    },
    options,
  );
  const {
    sides, radius, normals, transform,
  } = o;
  let center;
  if (o.center == null) {
    center = [0, 0, 0];
  } else {
    center = getPoint(o.center).toArray();
  }
  const dTheta = Math.PI / sides;
  const dPhi = dTheta;
  const arcs = [];
  const curvedNormals = [];
  const points = [];
  const norms = [];
  for (let phi = 0; phi < Math.PI * 2 + 0.0001; phi += dPhi) {
    const thetaArc = [];
    const curvedNormalsArc = [];
    for (let theta = 0; theta < Math.PI + 0.0001; theta += dTheta) {
      thetaArc.push(getPoint(
        sphericalToCartesian(radius, theta, phi).map((v, i) => v + center[i]),
      ));
      curvedNormalsArc.push(getPoint(sphericalToCartesian(1, theta, phi)));
    }
    arcs.push(thetaArc);
    curvedNormals.push(curvedNormalsArc);
  }
  let matrix;
  let inverseTranspose;
  if (transform != null) {
    matrix = getTransform(transform).matrix();
    inverseTranspose = m3.transpose(m3.inverse(matrix));
    for (let i = 0; i < arcs.length; i += 1) {
      const curvedNormalsArc = curvedNormals[i];
      for (let j = 0; j < arcs[0].length; j += 1) {
        arcs[i][j] = arcs[i][j].transformBy(matrix);
        curvedNormalsArc[j] = curvedNormalsArc[j].transformBy(inverseTranspose);
      }
    }
  }

  for (let p = 0; p < sides * 2; p += 1) {
    for (let t = 0; t < sides; t += 1) {
      points.push(arcs[p][t]);
      points.push(arcs[p][t + 1]);
      points.push(arcs[p + 1][t + 1]);
      points.push(arcs[p][t]);
      points.push(arcs[p + 1][t + 1]);
      points.push(arcs[p + 1][t]);
      if (normals === 'curve') {
        norms.push(curvedNormals[p][t]);
        norms.push(curvedNormals[p][t + 1]);
        norms.push(curvedNormals[p + 1][t + 1]);
        norms.push(curvedNormals[p][t]);
        norms.push(curvedNormals[p + 1][t + 1]);
        norms.push(curvedNormals[p + 1][t]);
      } else {
        const normalPhi = p * dPhi + dPhi / 2;
        const normalTheta = t * dTheta + dTheta / 2;
        let normal = getPoint(sphericalToCartesian(1, normalTheta, normalPhi));
        if (transform != null) {
          normal = normal.transformBy(inverseTranspose);
        }
        norms.push(normal);
        norms.push(normal);
        norms.push(normal);
        norms.push(normal);
        norms.push(normal);
        norms.push(normal);
      }
    }
  }
  return [points, norms];
}
