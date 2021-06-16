// @flow
import { getPoint } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { sphericalToCartesian } from '../geometry/common';
import { joinObjects } from '../tools';

export type OBJ_SphereMesh = {
  sides?: number,
  radius?: number,
  normals?: 'curved' | 'flat',
  center?: TypeParsablePoint,
}

export default function sphere(options: OBJ_SphereMesh) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 1,
      normals: 'curved',
    },
    options,
  );
  const { sides, radius, normals } = o;
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
      thetaArc.push(sphericalToCartesian(radius, theta, phi).map((v, i) => v + center[i]));
      curvedNormalsArc.push(sphericalToCartesian(1, theta, phi));
    }
    arcs.push(thetaArc);
    curvedNormals.push(curvedNormalsArc);
  }

  for (let p = 0; p < sides * 2; p += 1) {
    for (let t = 0; t < sides; t += 1) {
      points.push(...arcs[p][t]);
      points.push(...arcs[p][t + 1]);
      points.push(...arcs[p + 1][t + 1]);
      points.push(...arcs[p][t]);
      points.push(...arcs[p + 1][t + 1]);
      points.push(...arcs[p + 1][t]);
      if (normals === 'curved') {
        norms.push(...curvedNormals[p][t]);
        norms.push(...curvedNormals[p][t + 1]);
        norms.push(...curvedNormals[p + 1][t + 1]);
        norms.push(...curvedNormals[p][t]);
        norms.push(...curvedNormals[p + 1][t + 1]);
        norms.push(...curvedNormals[p + 1][t]);
      } else {
        const normalPhi = p * dPhi + dPhi / 2;
        const normalTheta = t * dTheta + dTheta / 2;
        const normal = sphericalToCartesian(1, normalTheta, normalPhi);
        norms.push(...normal);
        norms.push(...normal);
        norms.push(...normal);
        norms.push(...normal);
        norms.push(...normal);
        norms.push(...normal);
      }
    }
  }
  return [points, norms];
}
