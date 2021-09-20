// @flow
import type { TypeParsablePoint, Point } from './Point';
import { getPoint } from './Point';

export type TypeQuaternion = {
  a: number,
  b: number,
  c: number,
  d: number,
}

function quaternion(a: number, b: number, c: number, d: number): TypeQuaternion {
  return {
    a, b, c, d,
  };
}

function quaternionFromPoint(p: TypeParsablePoint): TypeQuaternion {
  const pp = getPoint(p);
  return {
    a: 0, b: pp.x, c: pp.y, d: pp.z,
  };
}

function quaternionFromAngleAxis(angle: number, x: number, y: number, z: number): TypeQuaternion {
  const a = Math.cos(angle / 2);
  const u = getPoint([x, y, z]).normalize().scale(Math.sin(angle / 2));
  const b = u.x;
  const c = u.y;
  const d = u.z;
  return {
    a, b, c, d,
  };
}

function mul(q1: TypeQuaternion, q2: TypeQuaternion): TypeQuaternion {
  const a = q1.a * q2.a - q1.b * q2.b - q1.c * q2.c - q1.d * q2.d;
  const b = q1.a * q2.b + q1.b * q2.a + q1.c * q2.d - q1.d * q2.c;
  const c = q1.a * q2.c - q1.b * q2.d + q1.c * q2.a + q1.d * q2.b;
  const d = q1.a * q2.d + q1.b * q2.c - q1.c * q2.b + q1.d * q2.a;
  return {
    a, b, c, d,
  };
}

function inverse(q: TypeQuaternion): TypeQuaternion {
  return {
    a: q.a, b: -q.b, c: -q.c, d: -q.d,
  };
}

function transformPoint(p: TypeParsablePoint, q: TypeQuaternion): Point {
  const pq = quaternionFromPoint(p);
  const qInv = inverse(q);
  const p1 = mul(q, mul(pq, qInv));
  return getPoint([p1.b, p1.c, p1.d]);
}

function rotatePoint(
  p: TypeParsablePoint,
  angleOrRotations: number | Array<[number, TypeParsablePoint]>,
  axis: TypeParsablePoint = [1, 0, 0],
): Point {
  if (typeof angleOrRotations === 'number') {
    const q1 = quaternionFromAngleAxis(angleOrRotations, ...getPoint(axis).toArray());
    return transformPoint(p, q1);
  }
  if (angleOrRotations.length === 0) {
    throw new Error(`rotatePoint must have more than one angle to rotate around ${JSON.stringify(angleOrRotations)}`);
  }
  let q = quaternionFromAngleAxis(
    angleOrRotations[angleOrRotations.length - 1][0],
    ...getPoint(angleOrRotations[angleOrRotations.length - 1][1]).toArray(),
  );
  for (let i = angleOrRotations.length - 2; i >= 0; i -= 1) {
    q = mul(q, quaternionFromAngleAxis(
      angleOrRotations[i][0], ...getPoint(angleOrRotations[i][1]).toArray(),
    ));
  }
  return transformPoint(p, q);
}
// function doubleRotation(
//   p: TypeParsablePoint,
//   angle1: number,
//   axis1: TypeParsablePoint,
//   angle2: number,
//   axis2: TypeParsablePoint,
// ): Point {
//   const q1 = quaternionFromAngleAxis(angle1, ...getPoint(axis1).toArray());
//   const q2 = quaternionFromAngleAxis(angle2, ...getPoint(axis2).toArray());
//   return transformPoint(p, mul(q1, q2));
// }

export {
  quaternion,
  quaternionFromPoint,
  quaternionFromAngleAxis,
  mul,
  inverse,
  transformPoint,
  rotatePoint,
};
