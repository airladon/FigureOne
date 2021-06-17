// @flow
import { getPoint, getPoints, Point } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { joinObjects } from '../tools';
// import { getNormal } from '../geometry/Plane';
import { Transform } from '../geometry/Transform';
import type { TypeRotationDefinition } from '../geometry/Transform';
import {
  getTriangles, getFlatNormals, getCurveNormals, getSurfaceNormals,
} from './surface';

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
    sides, profile, rotation,
  } = o;

  const matrix = new Transform().rotate(o.axis).matrix();
  const defined = {
    sides,
    profile,
    normals: o.normals,
    matrix,
    position: o.position,
    rotation,
  };

  let norm = o.normals;
  if (norm === 'curveLathe') {
    norm = 'curveRows';
  }
  if (norm === 'curveProfile') {
    norm = 'curveColumns';
  }

  const points = getLathePoints(defined);
  const surfaceNormals = getSurfaceNormals(points);
  const triangles = getTriangles(points);
  let normals;
  if (norm === 'flat') {
    normals = getFlatNormals(surfaceNormals, points);
  } else {
    normals = getCurveNormals(
      surfaceNormals,
      points,
      norm,
      true,
      profile[0].isEqualTo(profile[profile.length - 1]),
    );
  }
  return [triangles, normals];
}

export {
  lathe,
  getLathePoints,
};
