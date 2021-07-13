// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsableLine } from '../geometry/Line';
import type { TypeParsableTransform } from '../geometry/Transform';
import { joinObjects } from '../tools';
import { revolve } from './revolve';

export type OBJ_Cone = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine | number,
  length?: number,
  rotation?: number,
  transform?: TypeParsableTransform,
}

export default function cone(options: OBJ_Cone) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'flat',
      rotation: 0,
      length: 1,
    },
    options,
  );
  const {
    rotation, sides, radius, normals, length, transform,
  } = o;
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [length, 0, 0]);
  } else {
    line = getLine(o.line);
  }
  const profile = [];
  profile.push([0, 0], [0, radius], [line.length(), 0]);

  return revolve({
    sides,
    rotation,
    normals: normals === 'curve' ? 'curveLathe' : 'flat',
    axis: ['dir', line.unitVector()],
    position: line.p1,
    profile,
    transform,
  });
}
