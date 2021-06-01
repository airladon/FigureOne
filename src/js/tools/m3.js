// @flow

// 3D Matrix functions
export type Type3DMatrix = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];


function mul(a: Type3DMatrix, b: Type3DMatrix): Type3DMatrix {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
    a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
    a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
    a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
  ];
}

function transpose(a: Type3DMatrix): Type3DMatrix {
  return [
    a[0], a[4], a[8], a[12],
    a[1], a[5], a[9], a[13],
    a[2], a[6], a[10], a[14],
    a[3], a[7], a[11], a[15],
  ];
}

function identity(): Type3DMatrix {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function copy(a: Type3DMatrix): Type3DMatrix {
  return [
    a[0], a[1], a[2], a[3],
    a[4], a[5], a[6], a[7],
    a[8], a[9], a[10], a[11],
    a[12], a[13], a[14], a[15],
  ];
}

function translationMatrix(tx: number, ty: number, tz: number): Type3DMatrix {
  return [
    1, 0, 0, tx,
    0, 1, 0, ty,
    0, 0, 1, tz,
    0, 0, 0, 1,
  ];
}

function translate(m: Type3DMatrix, tx: number, ty: number, tz: number): Type3DMatrix {
  return [
    m[0], m[1], m[2], m[3] + m[0] * tx + m[1] * ty + m[2] * tz,
    m[4], m[5], m[6], m[7] + m[4] * tx + m[5] * ty + m[6] * tz,
    m[8], m[9], m[10], m[11] + m[8] * tx + m[9] * ty + m[10] * tz,
    m[12], m[13], m[14], m[15] + m[12] * tx + m[13] * ty + m[14] * tz,
  ];
}

function rotationMatrixX(angle: number): Type3DMatrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    1, 0, 0, 0,
    0, c, -s, 0,
    0, s, c, 0,
    0, 0, 0, 1,
  ];
}

function rotationMatrixY(angle: number): Type3DMatrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    0, 0, 0, 1,
  ];
}

function rotationMatrixZ(angle: number): Type3DMatrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, -s, 0, 0,
    s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function rotationMatrixXYZ(rx: number, ry: number, rz: number): Type3DMatrix {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  return [
    cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx, 0,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx, 0,
    -sy, cy * sx, cy * cx, 0,
    0, 0, 0, 1,
  ];
}

function rotationMatrixUnitVector(angle: number, x: number, y: number, z: number): Type3DMatrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const c1 = 1 - c;
  return [
    x * x * c1 + c, x * y * c1 - z * s, x * z * c1 + y * s, 0,
    x * y * c1 + z * s, y * y * c1 + c, y * z * c1 - x * s, 0,
    x * z * c1 - y * s, y * z * c1 + x * s, z * z * c1 + c, 0,
    0, 0, 0, 1,
  ];
}

function rotationMatrixVector(angle: number, x: number, y: number, z: number): Type3DMatrix {
  const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  return rotationMatrixUnitVector(angle, x / mag, y / mag, z / mag);
}

function rotate(m: Type3DMatrix, rx: number, ry: number, rz: number): Type3DMatrix {
  return mul(m, rotationMatrixXYZ(rx, ry, rz));
  // const c = Math.cos(angle);
  // const s = Math.sin(angle);
  // return [
  //   m[0] * c + m[1] * s, m[0] * -s + m[1] * c, m[2],
  //   m[3] * c + m[4] * s, m[3] * -s + m[4] * c, m[5],
  //   m[6] * c + m[7] * s, m[6] * -s + m[7] * c, m[8],
  // ];
}

function scaleMatrix(sx: number, sy: number, sz: number): Type3DMatrix {
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
  ];
}

function scale(m: Type3DMatrix, sx: number, sy: number, sz: number): Type3DMatrix {
  // return mul(m, scaleMatrix(sx, sy));
  return [
    m[0] * sx, m[1] * sy, m[2] * sz, m[3],
    m[4] * sx, m[5] * sy, m[6] * sz, m[7],
    m[8] * sx, m[9] * sy, m[10] * sz, m[11],
    m[12] * sx, m[13] * sy, m[14] * sz, m[15],
  ];
}

function transform(m: Type3DMatrix, px: number, py: number, pz: number): [number, number, number] {
  return [
    (m[0] * px) + (m[1] * py) + (m[2] * pz) + m[3],
    (m[4] * px) + (m[5] * py) + m[6] * pz + m[7],
    (m[8] * px) + (m[9] * py) + m[10] * pz + m[11],
  ];
}

// function inverse(m: Type3DMatrix) {
// }

export {
  mul,
  identity,
  transpose,
  copy,
  translate,
  rotate,
  transform,
  scale,
  translationMatrix,
  scaleMatrix,
  rotationMatrixX,
  rotationMatrixY,
  rotationMatrixZ,
  rotationMatrixXYZ,
  rotationMatrixVector,
  rotationMatrixUnitVector,
};
