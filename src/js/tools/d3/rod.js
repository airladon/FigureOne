// @flow
import { Line, getLine } from '../geometry/Line';
import type { TypeParsableLine } from '../geometry/Line';
import { joinObjects } from '../tools';
import { revolve } from './revolve';
import type { TypeParsableTransform } from '../geometry/Transform';

export type OBJ_Rod = {
  sides?: number,
  radius?: number,
  normals?: 'curve' | 'flat',
  line?: TypeParsableLine | number,
  ends?: boolean | 1 | 2,
  length?: number,
  transform?: TypeParsableTransform,
}

export default function rod(options: OBJ_Rod) {
  const o = joinObjects(
    {
      sides: 10,
      radius: 0.1,
      normals: 'flat',
      ends: true,
      rotation: 0,
      length: 1,
    },
    options,
  );
  const {
    ends, rotation, sides, radius, normals, length, transform,
  } = o;
  let line;
  if (o.line == null) {
    line = new Line([0, 0, 0], [length, 0, 0]);
  } else {
    line = getLine(o.line);
  }

  const profile = [];
  if (ends || ends === 1) {
    profile.push([0, 0]);
  }
  profile.push([0, radius], [line.length(), radius]);
  if (ends || ends === 2) {
    profile.push([line.length(), 0]);
  }

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
