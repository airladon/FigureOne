// @flow
import { Point, getPoints, getPoint } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { getNormal } from '../geometry/Plane';
import { getTransform } from '../geometry/Transform';
import type { TypeParsableTransform } from '../geometry/Transform';
import { joinObjects } from '../tools';

/*
A surface is defined by a grid of points.

The grid is stored in an Array<Array<Point>> where the inner array are column
positions in the same row, and the outer array is then different rows.

 columns
--------->

col0  col1...

   *   *   *   *   *   *       A
   *   *   *   *   *   *       |
   *   *   *   *   *   *       | rows     :
   *   *   *   *   *   *       |        row 1
   *   *   *   *   *   *       |        row 0

Edges may be connected to their opposite edge:
- `closeRows`: connects the first column to the last column
- `closeColums`: connects the first row to the last row

A cyclinder is an example where just one pair of edges is connected.
A torus is an example where both pairs of edges are connected.

A edge may terminate:
- by itself
- closed to the opposed edge
- in a point

If all the points in the edge of a grid are the same, then then edge terminates in a point.

Either the rows or columns can end in a point. Both rows and columns cannot.

Eg:

     *   *   *   *   *        <-- All of these points are the same point, they
   *   *   *   *   *   *          are separated out for visualization
   *   *   *   *   *   *
   *   *   *   *   *   *
   *   *   *   *   *   *
   *   *   *   *   *   *

Surface points can be used to construct three drawing elements:
- 2D or 3D points at each surface point
- 2D or 3D lines between neighbouring surface points
- 3D fills (triangles) between neighbouring surface points

Space between surface points (surface faces) will be quadrilaterals, except on
the edges where it may be triangles if an edge terminates in a single point.

Each quadrilateral is defined by two triangles, or 6 vertices.

The normal for each vertex of each surface face can either be:
- flat: normals are the surface face normal
- curveRows: combination of normals for surfaces that touch the vertex, and are
  in the same row
- curveCols: combination of normals for surfaces that touch the vertex, and are
  in the same column
- curve: combination of normals for all surfaces that touch the vertex

c = current surface
n = next surface
p = previous surface
[row][column]

e.g:
- cc = current surface
- nc = next surface along the revolve rotation, with the same profile position
- cn = next surface along the profile, that has the same revolve rotation


 columns
--------->

np  nc  nn       A
cp  cc  cn       |  rows
pp  pc  pn       |


A quad surface is defined by four points

columns
------->

b1    b2       A
   cc          |  rows
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
- curveRow: cc + cp
- curveColumn: cc + pc
- curve: cc + pc + cp + pp
 */


// Along a row, there will be profilePoints - 1 segements
// Along a rotation, there will be sides segments
function getSurfaceNormals(
  surfacePoints: Array<Array<Point>>,
) {
  const rows = surfacePoints.length;
  const cols = surfacePoints[0].length;
  const surfaceNormals = [];
  for (let r = 0; r < rows - 1; r += 1) {
    const normsAlongRow = [];
    for (let c = 0; c < cols - 1; c += 1) {
      const a1 = surfacePoints[r][c];
      const a2 = surfacePoints[r][c + 1];
      const b1 = surfacePoints[r + 1][c];
      const b2 = surfacePoints[r + 1][c + 1];
      if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
        normsAlongRow.push(getNormal(a1, b2, a2));
      } else {
        normsAlongRow.push(getNormal(a1, b1, b2));
      }
    }
    surfaceNormals.push(normsAlongRow);
  }
  return surfaceNormals;
}

function getTriangles(
  surfacePoints: Array<Array<Point>>,
) {
  const rows = surfacePoints.length;
  const cols = surfacePoints[0].length;
  const triangles = [];
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a1 = surfacePoints[r][c];
      const a2 = surfacePoints[r][c + 1];
      const b1 = surfacePoints[r + 1][c];
      const b2 = surfacePoints[r + 1][c + 1];
      // if ((c === cols - 2 && !endZero) || c < cols - 2) {
      if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
        // triangles.push(...a1.toArray(), ...b2.toArray(), ...a2.toArray());
        triangles.push(a1, b2, a2);
      }
      // if ((c === 0 && !endZero) || c > 0) {
      if (!b1.isEqualTo(b2) && !b1.isEqualTo(a1)) {
        // triangles.push(...a1.toArray(), ...b1.toArray(), ...b2.toArray());
        triangles.push(a1, b1, b2);
      }
    }
  }
  return triangles;
}

function getLines(
  surfacePoints: Array<Array<Point>>,
) {
  if (surfacePoints.length === 0) {
    return [];
  }
  const rows = surfacePoints.length;
  const cols = surfacePoints[0].length;
  const lines = [];
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a1 = surfacePoints[r][c];
      const a2 = surfacePoints[r][c + 1];
      const b1 = surfacePoints[r + 1][c];
      const b2 = surfacePoints[r + 1][c + 1];
      lines.push(a1, a2);
      lines.push(a1, b1);
      if (c === cols - 2) {
        lines.push(a2, b2);
      }
      if (r === rows - 2) {
        lines.push(b1, b2);
      }
      // lines.push(...a1.toArray(), ...a2.toArray());
      // lines.push(...a1.toArray(), ...b1.toArray());
      // if (c === cols - 2) {
      //   lines.push(...a2.toArray(), ...b2.toArray());
      // }
      // if (r === rows - 2) {
      //   lines.push(...b1.toArray(), ...b2.toArray());
      // }
    }
  }
  return lines;
}

function getFlatNormals(
  surfaceNormals: Array<Array<Point>>,
  surfacePoints: Array<Array<Point>>,
) {
  const rows = surfacePoints.length;
  const cols = surfacePoints[0].length;
  const normals = [];
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const n = surfaceNormals[r][c];
      // const n = surfaceNormals[r][c].toArray();
      const a1 = surfacePoints[r][c];
      const a2 = surfacePoints[r][c + 1];
      const b1 = surfacePoints[r + 1][c];
      const b2 = surfacePoints[r + 1][c + 1];
      if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
        normals.push(n, n, n);
      }
      if (!b1.isEqualTo(b2) && !b1.isEqualTo(a1)) {
        normals.push(n, n, n);
      }
      // if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
      //   normals.push(...n, ...n, ...n);
      // }
      // if (!b1.isEqualTo(b2) && !b1.isEqualTo(a1)) {
      //   normals.push(...n, ...n, ...n);
      // }
    }
  }
  return normals;
}

function getCurveNormals(
  surfaceNormals: Array<Array<Point>>,
  surfacePoints: Array<Array<Point>>,
  curve: 'curveColumns' | 'curveRows' | 'curve',
  closeRows: boolean,
  closeColumns: boolean,
) {
  const rows = surfacePoints.length;
  const cols = surfacePoints[0].length;
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
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      nc = new Point(0, 0, 0);
      nn = new Point(0, 0, 0);
      np = new Point(0, 0, 0);
      cn = new Point(0, 0, 0);
      cc = surfaceNormals[r][c];
      cp = new Point(0, 0, 0);
      pn = new Point(0, 0, 0);
      pc = new Point(0, 0, 0);
      pp = new Point(0, 0, 0);
      if (r > 0) {
        prevSideIndex = r - 1;
      } else if (closeColumns) {
        prevSideIndex = surfaceNormals.length - 1;
      } else {
        prevSideIndex = null;
      }
      if (r < rows - 2) {
        nextSideIndex = r + 1;
      } else if (closeColumns) {
        nextSideIndex = 0;
      } else {
        nextSideIndex = null;
      }
      if (c > 0) {
        prevProfileIndex = c - 1;
      } else if (closeRows) {
        prevProfileIndex = surfaceNormals[0].length - 1;
      } else {
        prevProfileIndex = null;
      }
      if (c < cols - 2) {
        nextProfileIndex = c + 1;
      } else if (closeRows) {
        nextProfileIndex = 0;
      } else {
        nextProfileIndex = null;
      }
      if (prevSideIndex != null) {
        pc = surfaceNormals[prevSideIndex][c];
      }
      if (prevProfileIndex != null) {
        cp = surfaceNormals[r][prevProfileIndex];
      }
      if (nextSideIndex != null) {
        nc = surfaceNormals[nextSideIndex][c];
      }
      if (nextProfileIndex != null) {
        cn = surfaceNormals[r][nextProfileIndex];
      }
      if (prevSideIndex != null && prevProfileIndex != null) {
        pp = surfaceNormals[prevSideIndex][prevProfileIndex];
      }
      if (prevSideIndex != null && nextProfileIndex != null) {
        pn = surfaceNormals[prevSideIndex][nextProfileIndex];
      }
      if (nextSideIndex != null && prevProfileIndex != null) {
        np = surfaceNormals[nextSideIndex][prevProfileIndex];
      }
      if (nextSideIndex != null && nextProfileIndex != null) {
        nn = surfaceNormals[nextSideIndex][nextProfileIndex];
      }

      let a1n = cc;
      let a2n = cc;
      let b1n = cc;
      let b2n = cc;
      if (curve === 'curveColumns' || curve === 'curve') {
        a1n = a1n.add(pc);
        a2n = a2n.add(pc);
        b1n = b1n.add(nc);
        b2n = b2n.add(nc);
      }
      if (curve === 'curveRows' || curve === 'curve') {
        a1n = a1n.add(cp);
        b1n = b1n.add(cp);
        a2n = a2n.add(cn);
        b2n = b2n.add(cn);
      }
      if (curve === 'curve') {
        a1n = a1n.add(pp);
        b1n = b1n.add(np);
        a2n = a2n.add(pn);
        b2n = b2n.add(nn);
      }
      a1n = a1n.normalize();
      a2n = a2n.normalize();
      b1n = b1n.normalize();
      b2n = b2n.normalize();
      // a1n = a1n.normalize().toArray();
      // a2n = a2n.normalize().toArray();
      // b1n = b1n.normalize().toArray();
      // b2n = b2n.normalize().toArray();
      const a1 = surfacePoints[r][c];
      const a2 = surfacePoints[r][c + 1];
      const b1 = surfacePoints[r + 1][c];
      const b2 = surfacePoints[r + 1][c + 1];
      if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
        normals.push(a1n, b2n, a2n);
      }
      if (!b1.isEqualTo(b2) && !b1.isEqualTo(a1)) {
        normals.push(a1n, b1n, b2n);
      }
      // if (!a1.isEqualTo(a2) && !b2.isEqualTo(a2)) {
      //   normals.push(...a1n, ...b2n, ...a2n);
      // }
      // if (!b1.isEqualTo(b2) && !b1.isEqualTo(a1)) {
      //   normals.push(...a1n, ...b1n, ...b2n);
      // }
    }
  }
  return normals;
}

/**
 * Options object for defining a 3D surface.
 *
 * @property {Array<Array<TypeParsablePoint>>} [points] A grid of points that
 * define a 3D surface
 * @property {'curveColumns' | 'curveRows' | 'curve' | 'flat'} [normals]
 * `flat` normals will make shading (from a light source) across a face of the
 * object a constant color. `curveRows` will gradiate the shading along the
 * rows of the grid. `curveColumns` will gradiate the shading along the columns
 * of the grid. `curve` will gradiate the shading along both rows and columns.
 * Use `curve`, `curveRows`, or `curveColumns` to make a surface
 * look more round with fewer number of sides.
 * @property {boolean} [closeRows] Set to `true` if first row and last row are
 * the same, and normals is `'curveRows'` or `'curve'` to get correct normal
 * calculations (`false`)
 * @property {boolean} [closeColumns] Set to `true` if first row and last
 * column are the same, and normals is `'curveColumns'` or `'curve'` to get
 * correct normal calculations (`false`)
 * @property {TypeParsableTransform} [transform] apply a final transform to
 * shape
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 */
export type OBJ_SurfacePoints = {
  points?: Array<Array<TypeParsablePoint>>,
  normals?: 'curveColumns' | 'curveRows' | 'curve' | 'flat',
  closeRows?: boolean,
  closeColumns?: boolean,
  transform?: TypeParsableTransform,
  lines?: boolean,
};

/**
 * Return points of a 3D surface. A 3D surface is defined by a 2D matrix of
 * points (a grid).
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points lines that are the edges of each face of
 * the cone.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 */
function surface(options: OBJ_SurfacePoints) {
  const {
    transform, lines, closeColumns, closeRows, normals, points,
  } = joinObjects({
    normals: 'flat',
    lines: false,
    closeRows: false,
    closeColumns: false,
  }, options);

  let surfacePoints = points.map(p => getPoints(p));
  if (transform != null) {
    const matrix = getTransform(transform).matrix();
    surfacePoints = points.map(rows => rows.map(col => getPoint(col).transformBy(matrix)));
  }
  if (lines) {
    return [getLines(surfacePoints), []];
  }
  const triangles = getTriangles(surfacePoints);
  const surfaceNormals = getSurfaceNormals(surfacePoints);
  let norms = surfaceNormals;
  if (normals !== 'flat') {
    norms = getCurveNormals(surfaceNormals, surfacePoints, normals, closeRows, closeColumns);
  } else {
    norms = getFlatNormals(surfaceNormals, surfacePoints);
  }
  return [triangles, norms];
}

export {
  getTriangles,
  getFlatNormals,
  getCurveNormals,
  getSurfaceNormals,
  getLines,
  surface,
};
