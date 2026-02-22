import * as m3 from './m3';
import { round } from './math';

describe('m3', () => {
  test('Create an identity matrix', () => {
    expect(m3.identity()).toEqual([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  });
  test('Transpose an identity matrix', () => {
    expect(m3.transpose(m3.identity())).toEqual(m3.identity());
  });

  // Matrix multiplication
  test('I x I', () => {
    expect(m3.mul(m3.identity(), m3.identity()))
      .toEqual(m3.identity());
  });
  test('I x A', () => {
    expect(m3.mul(m3.identity(), [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]))
      .toEqual([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16,
      ]);
  });
  test('A x I', () => {
    expect(m3.mul([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], m3.identity()))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  test('A x B', () => {
    expect(m3.mul(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      [8, 6, 3, 7, 6, 3, 7, 9, 3, 5, 8, 6, 3, 6, 9, 6],
    ))
      .toEqual([
        41, 51, 77, 67,
        121, 131, 185, 179,
        201, 211, 293, 291,
        281, 291, 401, 403,
      ]);
  });
  test('B x A', () => {
    expect(m3.mul(
      [8, 6, 3, 7, 6, 3, 7, 9, 3, 5, 8, 6, 3, 6, 9, 6],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    ))
      .toEqual([
        156, 180, 204, 228,
        201, 226, 251, 276,
        178, 200, 222, 244,
        192, 216, 240, 264,
      ]);
  });

  test('BT x AT', () => {
    expect(m3.mul(
      m3.transpose([8, 6, 3, 7, 6, 3, 7, 9, 3, 5, 8, 6, 3, 6, 9, 6]),
      m3.transpose([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    ))
      .toEqual(m3.transpose([
        41, 51, 77, 67,
        121, 131, 185, 179,
        201, 211, 293, 291,
        281, 291, 401, 403,
      ]));
  });

  // Translate a point
  test('Tranlsate (0, 0, 0) to (0, 0, 0)', () => {
    const transformMatrix = m3.translate(m3.identity(), 0, 0, 0);
    expect(m3.transform(transformMatrix, 0, 0, 0)).toEqual([0, 0, 0]);
  });
  test('Tranlsate (0, 0, 0) to (1, 0, 0)', () => {
    const transformMatrix = m3.translate(m3.identity(), 1, 0, 0);
    expect(m3.transform(transformMatrix, 0, 0, 0)).toEqual([1, 0, 0]);
  });
  test('Tranlsate (1, 2, 3) to (-2, -4, -6)', () => {
    const transformMatrix = m3.translate(m3.identity(), -3, -6, -9);
    expect(m3.transform(transformMatrix, 1, 2, 3)).toEqual([-2, -4, -6]);
  });

  // Rotate a point around z
  test('Rotate (0, 0, 0) by 0 deg around z', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, 0, 0);
    expect(m3.transform(transformMatrix, 0, 0, 0)).toEqual([0, 0, 0]);
  });
  test('Rotate (1, 0, 0) by 90 deg around z', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, 0, Math.PI / 2);
    expect(round(m3.transform(transformMatrix, 1, 0, 0))).toEqual([0, 1, 0]);
  });
  test('Rotate (1, 0, 0) by -90 deg around z', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, 0, -Math.PI / 2);
    expect(round(m3.transform(transformMatrix, 1, 0, 0))).toEqual([0, -1, 0]);
  });
  test('Rotate (0, 1, 0) by 90 deg around z', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, 0, Math.PI / 2);
    expect(round(m3.transform(transformMatrix, 0, 1, 0))).toEqual([-1, 0, 0]);
  });
  test('Rotate (0, 1, 0) by 90 deg around x', () => {
    const transformMatrix = m3.rotate(m3.identity(), Math.PI / 2, 0, 0);
    expect(round(m3.transform(transformMatrix, 0, 1, 0))).toEqual([0, 0, 1]);
  });
  test('Rotate (1, 0, 1) by 90 deg around y', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, Math.PI / 2, 0);
    expect(round(m3.transform(transformMatrix, 1, 0, 1))).toEqual([1, 0, -1]);
  });
  test('Rotate (1, 0, 0) by 30 deg around z', () => {
    const transformMatrix = m3.rotate(m3.identity(), 0, 0, Math.PI / 6);
    expect(round(m3.transform(transformMatrix, 1, 0, 0)))
      .toEqual(round([Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0]));
  });

  // // Scale a point
  test('Scale (1, 1, 1) by 1', () => {
    const transformMatrix = m3.scale(m3.identity(), 1, 1, 1);
    expect(m3.transform(transformMatrix, 1, 1, 1)).toEqual([1, 1, 1]);
  });
  test('Scale (1, 1, 1) by 2', () => {
    const transformMatrix = m3.scale(m3.identity(), 2, 2, 2);
    expect(m3.transform(transformMatrix, 1, 1, 1)).toEqual([2, 2, 2]);
  });

  // Combine rotation, tranlsation and scale
  test('Rotate (2, 0, 0) by 90 deg around z at (0, 0, 0) then move (1, 0, 0) then scale by 2', () => {
    let transformMatrix = m3.identity();
    transformMatrix = m3.scale(transformMatrix, 2, 2, 2);
    transformMatrix = m3.translate(transformMatrix, 1, 0, 0);
    transformMatrix = m3.rotate(transformMatrix, 0, 0, Math.PI / 2);
    const result = m3.transform(transformMatrix, 2, 0, 0);
    expect(round(result)).toEqual([2, 4, 0]);
  });

  // Copy
  test('Copy of A', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const copy = m3.copy(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
  });
});
