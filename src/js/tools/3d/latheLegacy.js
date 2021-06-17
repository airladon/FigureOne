// @flow
import { getPoint, getPoints } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import { getNormal } from '../geometry/Plane';
import { Transform } from '../geometry/Transform';
import type { TypeRotationDefinition } from '../geometry/Transform';

/**
 * Create a surface by lathing a profile.
 */
export type OBJ_LatheMesh = {
  sides?: number,
  profile?: Array<TypeParsablePoint>,
  normals?: 'curved' | 'flat' | 'curved2',
  // position?: TypeParsablePoint,
  axis?: TypeRotationDefinition,
  rotation?: number,
}

/**
 * Create a mesh from a lathe profile
 *
 * The normals can be:
 * - flat: each triangle's vertex has the same normal
 * - curved: normals are averaged around axis of rotation
 * - curved2: normals are averaged around and along axis of rotation.
 */
export default function lathe(options: OBJ_LatheMesh) {
  const o = joinObjects(
    {
      sides: 10,
      normals: 'curved',
      ends: true,
      position: [0, 0, 0],
      axis: 0,
      rotation: 0,
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
    sides, profile, rotation, normals,
  } = o;
  const points = [];
  const dAngle = Math.PI * 2 / sides;
  const matrix = new Transform().rotate(o.axis).matrix();
  let start0 = false;
  let end0 = false;
  if (profile[0].y === 0) {
    start0 = true;
  }
  if (profile[profile.length - 1].y === 0) {
    end0 = true;
  }
  console.log(end0, start0)
  for (let i = 0; i < sides + 1; i += 1) {
    const profilePoints = [];
    for (let j = 0; j < profile.length; j += 1) {
      let p = getPoint([
        profile[j].x,
        Math.max(profile[j].y, -0.00001) * Math.cos(dAngle * i + rotation),
        Math.max(profile[j].y, -0.00001) * Math.sin(dAngle * i + rotation),
      ]);
      if (o.axis !== 0) {
        p = p.transformBy(matrix);
      }
      profilePoints.push(p.add(o.position));
    }
    points.push(profilePoints);
  }
  // const triangleNorms = [];
  const triangles = [];
  const norms = [];
  const quadNorms = [];
  const qNorms = [];
  if (normals === 'curved2') {
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
  }

  for (let i = 0; i < sides; i += 1) {
    for (let j = 0; j < profile.length - 1; j += 1) {
      const a1 = points[i][j];
      const a2 = points[i][j + 1];
      const b1 = points[i + 1][j];
      const b2 = points[i + 1][j + 1];
      let norm;
      if ((j === profile.length - 2 && !end0) || j < profile.length - 2) {
        triangles.push(...a1.toArray(), ...b2.toArray(), ...a2.toArray());
        norm = getNormal(a1, b2, a2);
      }
      if ((j === 0 && !start0) || j > 0) {
        triangles.push(...a1.toArray(), ...b1.toArray(), ...b2.toArray());
        norm = getNormal(a1, b1, b2);
      }
      if (normals === 'curved2') {
        quadNorms[i][j].push(norm);
        quadNorms[i][j + 1].push(norm);
        quadNorms[i + 1][j].push(norm);
        quadNorms[i + 1][j + 1].push(norm);
      }
      if (normals === 'curved') {
        let prevNorm;
        let nextNorm;
        let nextI = i + 2;
        let prevI = i - 1;
        if (i === 0) {
          prevI = sides - 2;
        }
        if (i === sides - 1) {
          nextI = 1;
        }
        if (j === 0) {
          prevNorm = getNormal(points[prevI][j], a2, points[prevI][j + 1]);
          nextNorm = getNormal(b1, points[nextI][j + 1], b2);
        } else if (j === profile.length - 2) {
          prevNorm = getNormal(points[prevI][j], a1, a2);
          nextNorm = getNormal(b1, points[nextI][j], points[nextI][j + 1]);
        } else {
          prevNorm = getNormal(points[prevI][j], a1, a2);
          nextNorm = getNormal(b1, points[nextI][j + 1], b2);
        }
        const aNorm = norm.add(prevNorm).normalize().toArray();
        const bNorm = norm.add(nextNorm).normalize().toArray();
        if ((j === profile.length - 2 && !end0) || j < profile.length - 2) {
          norms.push(...aNorm, ...bNorm, ...aNorm);
        }
        if ((j === 0 && !start0) || j > 0) {
          norms.push(...aNorm, ...bNorm, ...bNorm);
        }
      }
      const n = norm.normalize().toArray();
      if (normals === 'flat') {
        if ((j === profile.length - 2 && !end0) || j < profile.length - 2) {
          norms.push(...n, ...n, ...n);
        }
        if ((j === 0 && !start0) || j > 0) {
          norms.push(...n, ...n, ...n);
        }
        // norms.push(...n, ...n, ...n, ...n, ...n, ...n);
      }
    }
  }

  if (normals === 'curved2') {
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
        if ((j === profile.length - 2 && !end0) || j < profile.length - 2) {
          norms.push(
            ...qNorms[i][j].toArray(),
            ...qNorms[i + 1][j + 1].toArray(),
            ...qNorms[i][j + 1].toArray(),
          );
        }
        if ((j === 0 && !start0) || j > 0) {
          norms.push(
            ...qNorms[i][j].toArray(),
            ...qNorms[i + 1][j].toArray(),
            ...qNorms[i + 1][j + 1].toArray(),
          );
        }
      }
    }
  }
  console.log(triangles.length)
  return [triangles, norms];
}
