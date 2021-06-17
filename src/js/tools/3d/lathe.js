// @flow
import { getPoint, getPoints, Point } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
import { getNormal } from '../geometry/Plane';
import { Transform } from '../geometry/Transform';
import type { TypeRotationDefinition } from '../geometry/Transform';

/*
This is a general lathe that takes a profile of points in the XY plane, lathe
rotates them around the X axis.

The points can then be transformed such that the x axis points in some
direction, and the [0, 0, (0)] point is translated to an arbitrary [x, y, z]
point.

All profile points must have a y value that is not 0, with the exceptions of
the ends which can be 0.

Normals for each vertex are returned which are either flat, averaged along the
profile ('curveProfile'), averaged along the direction of lathe rotation
('curveLathe'), or averaged by all surfaces touching the vertex ('curve').

Curve normals are combinations of surface normals around a point.

Each surface consists of 3 vertices if on the end of the profile and the
profile goes to 0, or 6 vertices otherwise.

The normals of each vertex of a surface can have 4 possibilities:
- flat: normals are the surface normal
- curveProfile: combination of normals for surfaces that touch the vertex, have
  the same lathe rotation, and are along the profile
- curveLathe: combination of normals for surfaces that touch the vertex, have
  have the same profile location, and are along the lathe rotation
- curve: combination of normals for surfaces that touch the vertex

c = current surface
n = next surface
p = previous surface
[lathe rotation][profile position]

e.g:
- cc = current surface
- nc = next surface along the lathe rotation, with the same profile position
- cn = next surface along the profile, that has the same lathe rotation


 profile
--------->

np  nc  nn       A
cp  cc  cn       |  lathe rotation
pp  pc  pn       |


A quad surface is defined by four points

profile
------->

b1    b2       A
   cc          |  lathe rotation
a1    a2       |

If the profile start is a 0, then the start surface is a triangle:

      b2
   cc
a1    a2


If the profile end is a 0, then the end surface is a triangle:

b1    b2
   cc
a1

So in general we have:

np     nc     nn
    b1    b2
cp     cc     cn
    a1    a2
pp     pc     pn

Which means the normals for vertex a1 will be:
- flat: cc
- curveProfile: cc + cp
- curveLathe: cc + pc
- curve: cc + pc + cp + pp
 */

/**
 * Options object for {@link lathe}.
 *
 * @property {Array<TypeParsablePoint>} profile XY plane profile to be rotated
 * around the x axis
 * @property {number} [sides] number of sides in lathe rotation
 * @property {'flat' | 'curveProfile' | 'curveLathe' | 'curve'} [normals] how
 * the normals for each vertex should be combined
 * @property {number} [rotation] initial angle of the lathe rotation
 * @property {TypeRotationDefinition} [axis] orient the final vertices by
 * rotating their definition around the x axis to an arbitrary rotation
 * @property {TypeParsablePoint} [position] offset the final vertices such that
 * the original (0, 0) point moves to position (this step happens after the
 * rotation)
 */
export type OBJ_Lathe = {
  sides?: number,
  profile?: Array<TypeParsablePoint>,
  normals?: 'flat' | 'curveProfile' | 'curveLathe' | 'curve',
  axis?: TypeRotationDefinition,
  rotation?: number,
  position?: TypeParsablePoint,
}

export type OBJ_LatheDefined = {
  sides: number,
  profile: Array<Point>,
  normals: 'flat' | 'curveProfile' | 'curveLathe' | 'curve',
  matrix: Type3DMatrix,
  rotation: number,
  position: Point,
}


// Return a 2D matrix where a column represents the same profile x position, and
// a row represents the same lathe rotation position.
function getLathePoints(o: OBJ_LatheDefined) {
  const points = [];
  const {
    profile, sides, rotation, matrix,
  } = o;
  const dAngle = Math.PI * 2 / sides;
  for (let i = 0; i < sides + 1; i += 1) {
    const profilePoints = [];
    for (let j = 0; j < profile.length; j += 1) {
      let p = new Point(
        profile[j].x,
        profile[j].y * Math.cos(dAngle * i + rotation),
        profile[j].y * Math.sin(dAngle * i + rotation),
      );
      if (o.axis !== 0) {
        p = p.transformBy(matrix);
      }
      profilePoints.push(p.add(o.position));
    }
    points.push(profilePoints);
  }
  return points;
}

// Along a profile, there will be profilePoints - 1 segements
// Along a rotation, there will be sides segments
function getSurfaceNormals(points: Array<Array<Point>>) {
  const profileSegments = points[0].length - 1;
  const sides = points.length - 1;
  const surfaceNormals = [];
  for (let i = 0; i < sides; i += 1) {
    const normsAlongProfile = [];
    for (let j = 0; j < profileSegments; j += 1) {
      const a1 = points[i][j];
      const a2 = points[i][j + 1];
      const b1 = points[i + 1][j];
      const b2 = points[i + 1][j + 1];
      if (j === 0) {
        normsAlongProfile.push(getNormal(a1, b2, a2));
      } else {
        normsAlongProfile.push(getNormal(a1, b1, b2));
      }
    }
    surfaceNormals.push(normsAlongProfile);
  }
  return surfaceNormals;
}

function getTriangles(
  points: Array<Array<Point>>, startZero: false, endZero: false,
) {
  const profileSegments = points[0].length - 1;
  const sides = points.length - 1;
  const triangles = [];
  for (let i = 0; i < sides; i += 1) {
    for (let j = 0; j < profileSegments; j += 1) {
      const a1 = points[i][j];
      const a2 = points[i][j + 1];
      const b1 = points[i + 1][j];
      const b2 = points[i + 1][j + 1];
      if ((j === profileSegments - 1 && !endZero) || j < profileSegments - 1) {
        triangles.push(...a1.toArray(), ...b2.toArray(), ...a2.toArray());
      }
      if ((j === 0 && !endZero) || j > 0) {
        triangles.push(...a1.toArray(), ...b1.toArray(), ...b2.toArray());
      }
    }
  }
  return triangles;
}

function getFlatNormals(
  surfaceNormals: Array<Array<Point>>, startZero: false, endZero: false,
) {
  const profileSegments = surfaceNormals[0].length;
  const sides = surfaceNormals.length;
  const normals = [];
  for (let i = 0; i < sides; i += 1) {
    for (let j = 0; j < profileSegments; j += 1) {
      const n = surfaceNormals[i][j].toArray();
      if ((j === profileSegments - 1 && !endZero) || j < profileSegments - 1) {
        normals.push(...n, ...n, ...n);
      }
      if ((j === 0 && !startZero) || j > 0) {
        normals.push(...n, ...n, ...n);
      }
    }
  }
  return normals;
}

function getCurveNormals(
  surfaceNormals: Array<Array<Point>>,
  startZero: false,
  endZero: false,
  curve: 'curveProfile' | 'curveLathe' | 'curve',
) {
  const profileSegments = surfaceNormals[0].length;
  const sides = surfaceNormals.length;
  const normals = [];
  let pp;
  let cp;
  let np;
  let pc;
  let cc;
  let nc;
  let pn;
  let cn;
  let nn;
  let nextProfileIndex;
  let prevProfileIndex;
  let nextSideIndex;
  let prevSideIndex;
  for (let i = 0; i < sides; i += 1) {
    for (let j = 0; j < profileSegments; j += 1) {
      if (i > 0) {
        prevSideIndex = i - 1;
      } else {
        prevSideIndex = profileSegments - 2;
      }
      if (i < sides - 1) {
        nextSideIndex = i + 1;
      } else {
        nextSideIndex = 1;
      }
      if (j > 0) {
        prevProfileIndex = j - 1;
        pp = surfaceNormals[prevSideIndex][prevProfileIndex];
        cp = surfaceNormals[i][prevProfileIndex];
        np = surfaceNormals[nextSideIndex][prevProfileIndex];
      }
      if (j < profileSegments - 1) {
        nextProfileIndex = j + 1;
        pn = surfaceNormals[prevSideIndex][nextProfileIndex];
        cn = surfaceNormals[i][nextProfileIndex];
        nn = surfaceNormals[nextSideIndex][nextProfileIndex];
      }
      pc = surfaceNormals[prevSideIndex][j];
      cc = surfaceNormals[i][j];
      nc = surfaceNormals[nextSideIndex][j];
      let a1n = cc;
      let a2n = cc;
      let b1n = cc;
      let b2n = cc;
      if (curve === 'curveLathe' || curve === 'curve') {
        a1n = a1n.add(pc);
        a2n = a2n.add(pc);
        b1n = b1n.add(nc);
        b2n = b2n.add(nc);
      }
      if (curve === 'curveAxis' || curve === 'curve') {
        if (j > 0) {
          a1n = a1n.add(cp);
          b1n = b1n.add(np);
        }
        if (j < profileSegments - 1) {
          a2n = a2n.add(cn);
          b2n = b2n.add(nn);
        }
      }
      if (curve === 'curve') {
        if (j > 0) {
          a1n = a1n.add(pp);
          b1n = b1n.add(cp);
        }
        if (j < profileSegments - 1) {
          a2n = a2n.add(pn);
          b2n = b2n.add(nn);
        }
      }
      a1n = a1n.normalize().toArray();
      a2n = a2n.normalize().toArray();
      b1n = b1n.normalize().toArray();
      b2n = b2n.normalize().toArray();
      if ((j === profileSegments - 1 && !endZero) || j < profileSegments - 1) {
        normals.push(...a1n, ...b2n, ...a2n);
      }
      if ((j === 0 && !startZero) || j > 0) {
        normals.push(...a1n, ...b1n, ...b2n);
      }
    }
  }
  return normals;
}

/**
 * Create a 3D surface by rotating a 2D profile around an axis (analagous to a
 * lathe machine).
 *
 * A profile is defined in the XY plane, and then rotated around the x axis.
 *
 * The resulting points can oriented and positioned by defining a rotation and
 * position. The rotation rotates the x axis (around which the profile was
 * rotated) to any direction. The position then offsets the transformed points
 * in 3D space, there the original (0, 0, [0]) point is translated to
 * (position.x, position.y, position.z)
 *
 * All profile points must have a y value that is not 0, with the exceptions of
 * the ends which can be 0.
 *
 * Normals for each vertex are returned which are either flat, averaged along
 * the profile ('curveProfile'), averaged along the direction of lathe rotation
 * ('curveLathe'), or averaged by all surfaces touching the vertex ('curve').
 *
 * @param {OBJ_Lathe} options
 * @return {[Array<number>, Array<number>]} array of vertices and array of
 * normals
 */
function lathe(options: OBJ_Lathe) {
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

  const matrix = new Transform().rotate(o.axis).matrix();
  const defined = {
    sides,
    profile,
    normals,
    matrix,
    position: o.position,
    rotation,
  };
  let startZero = false;
  let endZero = false;
  if (profile[0].y === 0) {
    startZero = true;
  }
  if (profile[profile.length - 1].y === 0) {
    endZero = true;
  }

  const points = getLathePoints(defined);
  const surfaceNormals = getSurfaceNormals(points);
  const triangles = getTriangles(points, startZero, endZero);
  let norms;
  if (normals === 'flat') {
    norms = getFlatNormals(surfaceNormals, startZero, endZero);
  } else {
    norms = getCurveNormals(surfaceNormals, startZero, endZero, normals);
  }
  return [triangles, norms];
}

export {
  lathe,
  getLathePoints,
};
