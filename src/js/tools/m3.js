// @flow

// 3D Vector functions
function crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dotProduct(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function length(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalize(v) {
  const len = length(v);
  if (len > 0.00001) {
    return [v[0] / len, v[1] / len, v[2] / len];
  }
  return [0, 0, 0];
}

// 3D Matrix functions
export type Type3DMatrix = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

export type Type3Matrix = [
  number, number, number,
  number, number, number,
  number, number, number,
];

export type Type3Vector = [number, number, number];


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

function mul3(a: Type2DMatrix, b: Type2DMatrix) {
  return [
    (a[0] * b[0]) + (a[1] * b[3]) + (a[2] * b[6]),
    (a[0] * b[1]) + (a[1] * b[4]) + (a[2] * b[7]),
    (a[0] * b[2]) + (a[1] * b[5]) + (a[2] * b[8]),
    (a[3] * b[0]) + (a[4] * b[3]) + (a[5] * b[6]),
    (a[3] * b[1]) + (a[4] * b[4]) + (a[5] * b[7]),
    (a[3] * b[2]) + (a[4] * b[5]) + (a[5] * b[8]),
    (a[6] * b[0]) + (a[7] * b[3]) + (a[8] * b[6]),
    (a[6] * b[1]) + (a[7] * b[4]) + (a[8] * b[7]),
    (a[6] * b[2]) + (a[7] * b[5]) + (a[8] * b[8]),
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

function rotationMatrixUnitAxis(
  axis: [number, number, number],
  angle: number,
) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [x, y, z] = axis;
  const C = 1 - c;
  return [
    x * x * C + c, x * y * C - z * s, x * z * C + y * s, 0,
    y * x * C + z * s, y * y * C + c, y * z * C - x * s, 0,
    z * x * C - y * s, z * y * C + x * s, z * z * C + c, 0,
    0, 0, 0, 1,
  ];
}

// https://en.wikipedia.org/wiki/Rotation_matrix#In_three_dimensions
function rotationMatrixAxis(
  axis: [number, number, number],
  angle: number,
) {
  return rotationMatrixUnitAxis(normalize(axis), angle);
}

// TODO - this will likely fail when the vectors are parallel - see
// rotationMatrixDirection for clue to fix
function rotationMatrixVectorToVector(
  fromVector: [number, number, number],
  toVector: [number, number, number],
) {
  const axis = crossProduct(fromVector, toVector);
  const d = dotProduct(fromVector, toVector);
  const angle = Math.acos(d / (length(fromVector) * length(toVector)));
  return rotationMatrixAxis(axis, angle);
}

function rotationMatrixDirection(
  vector: [number, number, number],
) {
  // If x is the dominant term, then the crossProducts and dotProducts are
  // going to be error prone as the vector will be close to collinear with
  // [1, 0, 0]. Therefore, if the x term accounts for 99.9% of the magnitude,
  // then make the rotation axis the z+ axis, and set the rotation to 0 if
  // vector.x is positive and π if vector.x is negative.
  if (Math.abs(vector[0]) / length(vector) > 0.999999) {
    return rotationMatrixAxis([0, 0, 1], vector[0] > 0 ? 0 : Math.PI);
  }
  const axis = crossProduct([1, 0, 0], vector);
  const d = dotProduct([1, 0, 0], vector);
  const angle = Math.acos(d / length(vector));
  return rotationMatrixAxis(axis, angle);
}

function directionToAxisAngle(
  vector: [number, number, number],
  axisIfCollinear: [number, number, number] = [0, 0, 1],
) {
  if (Math.abs(vector[0]) / length(vector) > 0.999999) {
    return [axisIfCollinear, vector[0] > 0 ? 0 : Math.PI];
  }
  const axis = crossProduct([1, 0, 0], vector);
  const d = dotProduct([1, 0, 0], vector);
  const angle = Math.acos(d / length(vector));
  return [axis, angle];
}

function isEqual(data1: Array<number>, data2: Array<number>, within: number = 0.000001) {
  for (let i = 0; i < data1.length; i += 1) {
    if (Math.abs(data1[i] - data2[i]) > within) {
      return false;
    }
  }
  return true;
}

function vectorToVectorToAxisAngle(
  fromVector: [number, number, number],
  toVector: [number, number, number],
  axisIfCollinear: [number, number, number] | null = null,
) {
  let axis = crossProduct(fromVector, toVector);
  // Check if vectors are collinear
  if (isEqual(axis, [0, 0, 0], 0.000001)) {
    const normFrom = normalize(fromVector);
    const normTo = normalize(toVector);
    // Get a normal axis
    if (axisIfCollinear != null) {
      axis = axisIfCollinear;
    } else {
      axis = crossProduct(fromVector, [1, 0, 0]);
      if (isEqual(axis, [0, 0, 0], 0.000001)) {
        axis = crossProduct(fromVector, [0, 1, 0]);
      }
    }
    if (isEqual(normFrom, normTo, 0.000001)) {
      return [axis, 0];
    }
    return [axis, Math.PI];
  }
  const d = dotProduct(fromVector, toVector);
  const angle = Math.acos(d / (length(fromVector) * length(toVector)));
  return [axis, angle];
}

// function rotationMatrixSpherical(
//   theta: number,
//   phi: number,
// ) {
//   const direction = [
//     Math.cos(phi) * Math.sin(theta),
//     Math.sin(phi) * Math.sin(theta),
//     Math.cos(theta),
//   ];
//   return rotationMatrixDirection(direction);
// }


function rotate(m: Type3DMatrix, rx: number, ry: number, rz: number): Type3DMatrix {
  return mul(m, rotationMatrixXYZ(rx, ry, rz));
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

function transformVectorT(m: Type3DMatrix, v: [number, number, number, number]) {
  const a = [0, 0, 0, 0];
  for (let i = 0; i < 4; i += 1) {
    a[i] = 0.0;
    for (let j = 0; j < 4; j += 1) {
      a[i] += v[j] * m[j * 4 + i];
    }
  }
  return a;
}

function transformVector(m: Type3DMatrix, v: [number, number, number, number]) {
  const a = [0, 0, 0, 0];
  for (let i = 0; i < 4; i += 1) {
    a[i] = 0.0;
    for (let j = 0; j < 4; j += 1) {
      a[i] += v[j] * m[i * 4 + j];
    }
  }
  return a;
}

function orthographic(
  left: number, right: number, bottom: number, top: number, near: number, far: number,
) {
  return [
    2 / (right - left), 0, 0, (left + right) / (left - right),
    0, 2 / (top - bottom), 0, (bottom + top) / (bottom - top),
    0, 0, 2 / (near - far), (near + far) / (near - far),
    0, 0, 0, 1,
  ];
}

function perspective(
  fieldOfView: number, aspectRatio: number, near: number, far: number,
) {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
  const rangeInv = 1.0 / (near - far);
  return [
    f / aspectRatio, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, near * far * rangeInv * 2,
    0, 0, -1, 0,
  ];
}


function lookAt(
  cameraPosition: [number, number, number],
  target: [number, number, number],
  up: [number, number, number],
) {
  const zAxis = normalize(subtract(cameraPosition, target));
  const xAxis = normalize(crossProduct(up, zAxis));
  const yAxis = normalize(crossProduct(zAxis, xAxis));

  return [
    xAxis[0], yAxis[0], zAxis[0], cameraPosition[0],
    xAxis[1], yAxis[1], zAxis[1], cameraPosition[1],
    xAxis[2], yAxis[2], zAxis[2], cameraPosition[2],
    0, 0, 0, 1,
  ];
}


function inverse3(m: Array<number>) {
  const det = (m[0] * ((m[4] * m[8]) - (m[7] * m[5]))) - // eslint-disable-line
              (m[1] * ((m[3] * m[8]) - (m[5] * m[6]))) + // eslint-disable-line
              (m[2] * ((m[3] * m[7]) - (m[4] * m[6])));
  const invdet = 1 / det;

  const minv00 = ((m[4] * m[8]) - (m[7] * m[5])) * invdet;
  const minv01 = ((m[2] * m[7]) - (m[1] * m[8])) * invdet;
  const minv02 = ((m[1] * m[5]) - (m[2] * m[4])) * invdet;
  const minv10 = ((m[5] * m[6]) - (m[3] * m[8])) * invdet;
  const minv11 = ((m[0] * m[8]) - (m[2] * m[6])) * invdet;
  const minv12 = ((m[3] * m[2]) - (m[0] * m[5])) * invdet;
  const minv20 = ((m[3] * m[7]) - (m[6] * m[4])) * invdet;
  const minv21 = ((m[6] * m[1]) - (m[0] * m[7])) * invdet;
  const minv22 = ((m[0] * m[4]) - (m[3] * m[1])) * invdet;

  return [
    minv00, minv01, minv02,
    minv10, minv11, minv12,
    minv20, minv21, minv22,
  ];
}

function toHomogonous(a: Type3Matrix) {
  return [
    a[0], a[1], a[2], 0,
    a[3], a[4], a[5], 0,
    a[6], a[7], a[8], 0,
    0, 0, 0, 1,
  ];
}

function basisToBasisMatrix(
  from: [Type3Vector, Type3Vector, Type3Vector],
  to: [Type3Vector, Type3Vector, Type3Vector],
) {
  const a = [
    from[0][0], from[1][0], from[2][0],
    from[0][1], from[1][1], from[2][1],
    from[0][2], from[1][2], from[2][2],
  ];
  const b = [
    to[0][0], to[1][0], to[2][0],
    to[0][1], to[1][1], to[2][1],
    to[0][2], to[1][2], to[2][2],
  ];
  return toHomogonous(mul3(inverse3(a), b));
}

function basisMatrix(
  i: Type3Vector,
  j: Type3Vector,
  k: Type3Vector,
) {
  return toHomogonous([
    i[0], j[0], k[0],
    i[1], j[1], k[1],
    i[2], j[2], k[2],
  ]);
}


// Guass-Jordan Elimination
function inverseN(A: Array<number>) {
  let m;
  if (A.length === 9) {
    m = 3;
    return inverse3(A);
  }
  if (A.length === 16) {
    if (
      A[3] === 0 && A[7] === 0 && A[11] === 0
      && A[12] === 0 && A[13] === 0 && A[14] === 0
      && A[15] === 1
    ) {
      return toHomogonous(inverse3([
        A[0], A[1], A[2],
        A[4], A[5], A[6],
        A[8], A[9], A[10],
      ]));
    }
    m = 4;
  } else {
    m = Math.sqrt(A.length);
  }

  const n = m * 2;
  const a = new Array(m).fill(0).map(() => new Array(n).fill(0));
  let index = 0;

  // Fill augmented matrix (with matrix plus identity)
  for (let i = 0; i < m; i += 1) {
    for (let j = 0; j < n / 2; j += 1) {
      a[i][j] = A[index];
      index += 1;
    }
    for (let j = n / 2; j < n; j += 1) {
      a[i][j] = i === j - n / 2 ? 1 : 0;
    }
  }

  let h = 0;
  let k = 0;

  // Guassian Elimination
  // from https://en.wikipedia.org/wiki/Gaussian_elimination
  while (h < m && k < n) {
    let iMax = h;
    for (let i = h; i < m; i += 1) {
      const value = Math.abs(a[i][k]);
      if (value > iMax) {
        iMax = i;
      }
    }
    if (a[iMax][k] === 0) {
      k += 1;
    } else {
      const temp = a[h].slice();
      a[h] = a[iMax].slice();
      a[iMax] = temp;
      for (let i = h + 1; i < m; i += 1) {
        const f = a[i][k] / a[h][k];
        a[i][k] = 0;
        for (let j = k + 1; j < n; j += 1) {
          a[i][j] -= a[h][j] * f;
        }
      }
      h += 1;
      k += 1;
    }
  }

  // Back substitution
  for (let row = m - 1; row >= 0; row -= 1) {
    for (let r = m - 1; r > row; r -= 1) {
      const s = a[row][r] / a[r][r];
      for (let col = row; col < n; col += 1) {
        a[row][col] -= s * a[r][col];
      }
    }
    const s = 1 / a[row][row];
    for (let col = row; col < n; col += 1) {
      a[row][col] *= s;
    }
  }
  if (m === 3) {
    return [
      a[0][3], a[0][4], a[0][5],
      a[1][3], a[1][4], a[1][5],
      a[2][3], a[2][4], a[2][5],
    ];
  }
  if (m === 4) {
    return [
      a[0][4], a[0][5], a[0][6], a[0][7],
      a[1][4], a[1][5], a[1][6], a[1][7],
      a[2][4], a[2][5], a[2][6], a[2][7],
      a[3][4], a[3][5], a[3][6], a[3][7],
    ];
  }

  index = 0;
  const B = Array(m * m);
  for (let i = 0; i < m; i += 1) {
    for (let j = m; j < m * 2; j += 1) {
      B[index] = a[i][j];
      index += 1;
    }
  }
  return B;
}

function inverse(A: Type3DMatrix): Type3DMatrix {
  // $FlowFixMe
  return inverseN(A);
}

function dup(A: Type3DMatrix): Type3DMatrix {
  // $FlowFixMe
  return A.slice();
}


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
  basisToBasisMatrix,
  basisMatrix,
  rotationMatrixDirection,
  rotationMatrixXYZ,
  rotationMatrixAxis,
  // rotationMatrixSpherical,
  rotationMatrixVectorToVector,
  rotationMatrixUnitAxis,
  inverse,
  orthographic,
  perspective,
  lookAt,
  transformVector,
  transformVectorT,
  dup,
  directionToAxisAngle,
  vectorToVectorToAxisAngle,
};
