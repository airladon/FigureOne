// @flow
import { getPoint, getPoints } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import { getNormal } from '../geometry/Plane';
import { Transform } from '../geometry/Transform';
import { getPolygonCorners } from '../morph';

export type OBJ_LatheMesh = {
  sides?: number,
  profile?: Array<TypeParsablePoint>,
  normals?: 'curved' | 'flat',
  position?: TypeParsablePoint,
  fillEnds?: 'start' | 'end' | boolean,
  rotation?: TypeRotationDefinition,
  latheRotation?: number,
  // sidesToDraw?: number,
  // direction?: 1 | -1,
}

export default function lathe (options: OBJ_LatheMesh) {
  const o = joinObjects(
    {
      sides: 10,
      normals: 'curved',
      ends: true,
      position: [0, 0, 0],
      rotation: 0,
      latheRotation: 0,
    },
    options,
  );
  o.position = getPoint(o.position);
  if (o.profile == null) {
    o.profile = getPoints([0, 0.1, 0], [1, 0.2, 0]);
  } else {
    o.profile = getPoints(o.profile);
  }

  const {
    sides, profile, latheRotation, fillEnds, normals,
  } = o;
  const points = [];
  const dAngle = Math.PI * 2 / sides;
  const matrix = new Transform().rotate(o.rotation).matrix();
  for (let i = 0; i < sides + 1; i += 1) {
    const profilePoints = [];
    for (let j = 0; j < profile.length; j += 1) {
      profilePoints.push(getPoint([
        profile[j].x,
        profile[j].y * Math.cos(dAngle * i + latheRotation),
        profile[j].y * Math.sin(dAngle * i + latheRotation),
      ]).transformBy(matrix).add(o.position));
    }
    points.push(profilePoints);
  }
  // const triangleNorms = [];
  const triangles = [];
  const norms = [];
  const quadNorms = [];
  const quadNorms1 = [];
  const qNorms = [];
  const triNorms = [];
  for (let i = 0; i < sides + 1; i += 1) {
    const q = [];
    const q1 = [];
    for (let j = 0; j < profile.length; j += 1) {
      q.push([]);
      q1.push([]);
    }
    quadNorms.push(q);
    qNorms.push(q1);
  }

  for (let i = 0; i < sides; i += 1) {
    for (let j = 0; j < profile.length - 1; j += 1) {
      const a1 = points[i][j];
      const a2 = points[i][j + 1];
      const b1 = points[i + 1][j];
      const b2 = points[i + 1][j + 1];
      triangles.push(...a1.toArray(), ...b2.toArray(), ...a2.toArray());
      triangles.push(...a1.toArray(), ...b1.toArray(), ...b2.toArray());
      const norm = getNormal(a1, b1, a2);
      if (normals === 'curvedAll') {
        quadNorms[i][j].push(norm);
        quadNorms[i][j + 1].push(norm);
        quadNorms[i + 1][j].push(norm);
        quadNorms[i + 1][j + 1].push(norm);
      }
      if (normals === 'curved') {
        let prevNorm;
        let nextNorm;
        if (i === 0) {
          prevNorm = getNormal(points[sides - 2][j], a1, a2);
          nextNorm = getNormal(b1, points[i + 2][j + 1], b2);
        } else if (i === sides - 1) {
          prevNorm = getNormal(points[i - 1][j], a1, a2);
          nextNorm = getNormal(b1, points[1][j + 1], b2);
        } else {
          prevNorm = getNormal(points[i - 1][j], a1, a2);
          nextNorm = getNormal(b1, points[i + 2][j + 1], b2);
        }
        const aNorm = norm.add(prevNorm).normalize().toArray();
        const bNorm = norm.add(nextNorm).normalize().toArray();
        norms.push(...aNorm, ...bNorm, ...aNorm, ...aNorm, ...bNorm, ...bNorm);
      }
      const n = norm.normalize().toArray();
      if (normals === 'flat') {
        norms.push(...n, ...n, ...n, ...n, ...n, ...n);
      }
    }
  }

  if (normals === 'curvedAll') {
    for (let i = 0; i < sides + 1; i += 1) {
      for (let j = 0; j < profile.length; j += 1) {
        let n = quadNorms[i][j][0];
        for (let k = 1; k < quadNorms[i][j].length; k += 1) {
          n = n.add(quadNorms[i][j][k]);
        }
        if (i === 0) {
          for (let k = 1; k < quadNorms[sides - 1][j].length; k += 1) {
            n = n.add(quadNorms[sides - 1][j][k]);
          }
        }
        if (i === sides - 1) {
          for (let k = 1; k < quadNorms[0][j].length; k += 1) {
            n = n.add(quadNorms[0][j][k]);
          }
        }
        qNorms[i][j] = n.normalize();
      }
    }
    // console.log(quadNorms)
    // return
    for (let i = 0; i < sides; i += 1) {
      for (let j = 0; j < profile.length - 1; j += 1) {
        norms.push(
          ...qNorms[i][j].toArray(),
          ...qNorms[i + 1][j + 1].toArray(),
          ...qNorms[i][j + 1].toArray(),
          ...qNorms[i][j].toArray(),
          ...qNorms[i + 1][j].toArray(),
          ...qNorms[i + 1][j + 1].toArray(),
        );
      }
    }
  }
  console.log(triangles.length)
  // const end1 = getPolygonCorners({ radius: profile[0].y, sides, rotation: latheRotation }).map(p => new Point(0, p.x, -p.y));
  // const end2 = getPolygonCorners({ radius: profile.slice(-1)[0].y, sides, rotation: latheRotation }).map(p => new Point(0, p.x, -p.y));;
  // // const t = new Fig.Transform().rotate(rx, ry, rz);
  // // const tc = end1.map(c => c.transformBy(t.mat));
  // // const tcZ = end2.map(c => c.transformBy(t.mat));
  // const frontNormal = new Fig.Point(0, 0, -1).transformBy(t.mat);
  // const backNormal = new Fig.Point(0, 0, 1).transformBy(t.mat);
  // const sideNormals = [];
  // const delta = Math.PI * 2 / sides / 2;
  // for (let i = 0; i < sides; i += 1) {
  //   const angle = delta + i * delta * 2;
  //   const normal = Fig.tools.g2.polarToRect(1, angle);
  //   sideNormals.push(normal.transformBy(t.mat));
  // }
  // const points = [];
  // const normals = [];
  // for (let i = 0; i < sides; i += 1) {
  //   const next = i === corners.length - 1 ? 0 : i + 1;
  //   points.push(new Fig.Point(0, 0, 0).transformBy(t.mat));
  //   points.push(tc[i]._dup());
  //   points.push(tc[next]._dup());
  //   normals.push(frontNormal._dup());
  //   normals.push(frontNormal._dup());
  //   normals.push(frontNormal._dup());
  // }
  // for (let i = 0; i < corners.length; i += 1) {
  //   const next = i === corners.length - 1 ? 0 : i + 1;
  //   points.push(tc[i]._dup(), tcZ[i]._dup(), tcZ[next]._dup());
  //   points.push(tc[i]._dup(), tcZ[next]._dup(), tc[next]._dup());
  //   normals.push(sideNormals[i]._dup());
  //   normals.push(sideNormals[i]._dup());
  //   normals.push(sideNormals[i]._dup());
  //   normals.push(sideNormals[i]._dup());
  //   normals.push(sideNormals[i]._dup());
  //   normals.push(sideNormals[i]._dup());
  // }
  // for (let i = 0; i < sides; i += 1) {
  //   const next = i === corners.length - 1 ? 0 : i + 1;
  //   points.push(new Fig.Point(0, 0, length).transformBy(t.mat));
  //   points.push(tcZ[i]);
  //   points.push(tcZ[next]);
  //   normals.push(backNormal._dup());
  //   normals.push(backNormal._dup());
  //   normals.push(backNormal._dup());
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
  return [triangles, norms];
}
