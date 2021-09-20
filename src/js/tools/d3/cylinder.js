// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsableLine } from '../geometry/Line';
import { joinObjects } from '../tools';
import { revolve } from './revolve';
import type { TypeParsableTransform } from '../geometry/Transform';

/**
 * Cylinder options object.
 *
 * By default, a cylinder along the x axis will be created.
 *
 * @property {number} [sides] number of cylinder sides (`10`)
 * @property {number} [radius] radius of cylinder (`1`)
 * @property {'curve' | 'flat'} [normals] `flat` normals will make
 * shading (from light source) across a face cone constant.
 * `curve` will gradiate the shading. Use `curve` to make a surface look more
 * round with fewer number of sides. (`flat`)
 * @property {TypeParsableLine} [line] line that can position and
 * orient the cylinder. First point of line is cylinder base center, and second
 * point is the top center.
 * @property {number} [length] length of the cylinder if `line` isn't
 * defined (`1`)
 * @property {boolean | 1 | 2} [ends] `true` fills both ends of the cylinder.
 * `false` does not fill ends. `1` fills only the first end. `2` fills only the
 * the second end. (`true`)
 * @property {number} [rotation] rotation of base - this is only noticable for
 * small numbers of sides (`0`)
 * @property {TypeParsableTransform} [transform] transform to apply to all
 * points of cube
 * @property {boolean} [lines] if `true` then points representing
 * the edes of the faces will be returned. If `false`, then points
 * representing two triangles per face and an
 * associated normal for each point will be returned.
 */
export type OBJ_CylinderPoints = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine,
  length?: number,
  ends?: boolean | 1 | 2,
  transform?: TypeParsableTransform,
}

export default function cylinder(options: OBJ_CylinderPoints) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'flat',
      ends: true,
      rotation: 0,
      length: 1,
      lines: false,
    },
    options,
  );
  const {
    ends, rotation, sides, radius, normals, length, transform, lines,
  } = o;
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [length, 0, 0]);
  } else {
    line = getLine(o.line);
  }

  const profile = [];
  if (ends === true || ends === 1) {
    profile.push([0, 0]);
  }
  profile.push([0, radius], [line.length(), radius]);
  if (ends === true || ends === 2) {
    profile.push([line.length(), 0]);
  }

  return revolve({
    sides,
    rotation,
    normals: normals === 'curve' ? 'curveRadial' : 'flat',
    axis: line.unitVector().toArray(),
    position: line.p1,
    profile,
    transform,
    lines,
  });
}
