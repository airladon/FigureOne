import { getPoint } from '../geometry/Point';
import { getTransform } from '../geometry/Transform';
import type { TypeParsableTransform } from '../geometry/Transform';
import type { Point, TypeParsablePoint } from '../geometry/Point';
import { sphericalToCartesian } from '../geometry/common';
import { getLines } from './surface';
import { joinObjects } from '../tools';
import type { Type3DMatrix } from '../m3';
import * as m3 from '../m3';

/**
 * Sphere options object.
 *
 * By default, a sphere with its base at the origin will be created.
 *
 * @property {number} [sides] number of sides around sphere's half great circle
 * (`10`)
 * @property {number} [radius] radius of sphere (`1`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make light
 * shading across a face cone constant. `curve` will gradiate the shading. Use
 * `curve` to make a surface look more round with fewer number of sides.
 * (`flat`)
 * @property {TypeParsablePoint} [center] center position of sphere (`[0, 0]`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 * @interface
 * @group Misc Geometry Creation
 */
export type OBJ_SpherePoints = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  center?: TypeParsablePoint,
  transform?: TypeParsableTransform,
  lines?: boolean,
}

/**
 * Return points of a sphere.
 *
 * The points can either represent the triangles that make up each face, or
 * represent the start and end points lines that are the edges of each face of
 * the sphere.
 *
 * If the points represent triangles, then a second array of normal vectors
 * for each point will be available.
 *
 * @property {OBJ_CubePoints} options sphere options
 * @return {[Array<Point>, Array<Point>]} an array of points and normals. If
 * the points represent lines, then the array of normals will be empty.
 * @group Geometry Creation
 */
type SphereOptionsDefined = {
  sides: number,
  radius: number,
  normals: 'curve' | 'flat',
  center: TypeParsablePoint,
  transform?: TypeParsableTransform,
  lines: boolean,
}

export default function sphere(options: OBJ_SpherePoints): [Point[]] | [Point[], Point[]] {
  const o = joinObjects<SphereOptionsDefined>({
    sides: 10,
    radius: 1,
    normals: 'flat',
    output: 'points',
    center: [0, 0, 0],
    lines: false,
  } as any, options);
  const {
    sides, radius, normals, transform,
  } = o;
  const center = getPoint(o.center);
  const dAngle = Math.PI / sides;
  const dTheta = dAngle;
  const dPhi = dAngle;
  const arcs: Array<Array<Point>> = [];
  const curvedNormals: Array<Array<Point>> = [];
  const points: Point[] = [];
  const norms: Point[] = [];
  for (let phi = 0; phi < Math.PI * 2 + 0.0001; phi += dPhi) {
    const thetaArc: Array<Point> = [];
    const curvedNormalsArc: Array<Point> = [];
    for (let theta = 0; theta < Math.PI + 0.0001; theta += dTheta) {
      thetaArc.push(getPoint(sphericalToCartesian(radius, theta, phi)).add(center));
      curvedNormalsArc.push(getPoint(sphericalToCartesian(1, theta, phi)));
    }
    arcs.push(thetaArc);
    curvedNormals.push(curvedNormalsArc);
  }
  let matrix: Type3DMatrix | undefined;
  let inverseTranspose: Type3DMatrix | undefined;
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
  if (o.lines) {
    return [getLines(arcs)];
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
        if (inverseTranspose != null) {
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
