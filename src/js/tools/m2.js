// @flow

// 2D Matrix functions

function mul(a: Array<number>, b: Array<number>) {
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
function t(a: Array<number>) {
  return [
    a[0], a[3], a[6],
    a[1], a[4], a[7],
    a[2], a[5], a[8],
  ];
}
function identity() {
  return [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ];
}
function copy(a: Array<number>) {
  return [
    a[0], a[1], a[2],
    a[3], a[4], a[5],
    a[6], a[7], a[8],
  ];
}
function translationMatrix(tx: number, ty: number) {
  return [
    1, 0, tx,
    0, 1, ty,
    0, 0, 1,
  ];
}
function translate(m: Array<number>, tx: number, ty: number) {
  return mul(m, translationMatrix(tx, ty));
}
function rotationMatrix(angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, -s, 0,
    s, c, 0,
    0, 0, 1,
  ];
}
function rotate(m: Array<number>, angle: number) {
  return mul(m, rotationMatrix(angle));
}

function scaleMatrix(sx: number, sy: number) {
  return [
    sx, 0, 0,
    0, sy, 0,
    0, 0, 1,
  ];
}

function scale(m: Array<number>, sx: number, sy: number) {
  return mul(m, scaleMatrix(sx, sy));
}

function transform(m: Array<number>, px: number, py: number) {
  return [
    (m[0] * px) + (m[1] * py) + m[2],
    (m[3] * px) + (m[4] * py) + m[5],
  ];
}

function inverse(m: Array<number>) {
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

export {
  mul,
  identity,
  t,
  copy,
  translate,
  rotate,
  transform,
  scale,
  inverse,
  rotationMatrix,
  translationMatrix,
  scaleMatrix,
};
