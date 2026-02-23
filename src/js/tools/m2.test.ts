import * as m2 from './m2';
import { round } from './math';

describe('m2', () => {
  test('Create an identity matrix', () => {
    expect(m2.identity()).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });
  test('Transpose an identity matrix', () => {
    expect(m2.t(m2.identity())).toEqual(m2.identity());
  });

  // Matrix multiplication
  test('I x I', () => {
    expect(m2.mul(m2.identity(), m2.identity()))
      .toEqual(m2.identity());
  });
  test('I x A', () => {
    expect(m2.mul(m2.identity(), [1, 2, 3, 4, 5, 6, 7, 8, 9]))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  test('A x I', () => {
    expect(m2.mul([1, 2, 3, 4, 5, 6, 7, 8, 9], m2.identity()))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  test('A x B', () => {
    expect(m2.mul([1, 2, 3, 4, 5, 6, 7, 8, 9], [5, 4, 3, 7, 6, 5, 8, 7, 8]))
      .toEqual([43, 37, 37, 103, 88, 85, 163, 139, 133]);
  });
  test('B x A', () => {
    expect(m2.mul([5, 4, 3, 7, 6, 5, 8, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8, 9]))
      .toEqual([42, 54, 66, 66, 84, 102, 92, 115, 138]);
  });
  test('BT x AT', () => {
    expect(m2.mul(m2.t([5, 4, 3, 7, 6, 5, 8, 7, 8]), m2.t([1, 2, 3, 4, 5, 6, 7, 8, 9])))
      .toEqual(m2.t([43, 37, 37, 103, 88, 85, 163, 139, 133]));
  });

  // Translate a point
  test('Tranlsate 0, 0 to 0, 0', () => {
    const transformMatrix = m2.translate(m2.identity(), 0, 0);
    expect(m2.transform(transformMatrix, 0, 0)).toEqual([0, 0]);
  });
  test('Tranlsate 0, 0 to 1, 0', () => {
    const transformMatrix = m2.translate(m2.identity(), 1, 0);
    expect(m2.transform(transformMatrix, 0, 0)).toEqual([1, 0]);
  });
  test('Tranlsate 1, 2 to -2, -4', () => {
    const transformMatrix = m2.translate(m2.identity(), -3, -6);
    expect(m2.transform(transformMatrix, 1, 2)).toEqual([-2, -4]);
  });

  // Rotate a point
  test('Rotate 0, 0 by 0 deg', () => {
    const transformMatrix = m2.rotate(m2.identity(), 0);
    expect(m2.transform(transformMatrix, 0, 0)).toEqual([0, 0]);
  });
  test('Rotate 1, 0 by 90 deg around 0, 0', () => {
    const transformMatrix = m2.rotate(m2.identity(), Math.PI / 2);
    const result = m2.transform(transformMatrix, 1, 0);
    expect(round(result)).toEqual([0, 1]);
  });
  test('Rotate 1, 1 by -45 deg around 0, 0', () => {
    const transformMatrix = m2.rotate(m2.identity(), -Math.PI / 4);
    const result = m2.transform(transformMatrix, 1, 1);
    expect(round(result)).toEqual([round(Math.sqrt(2)), 0]);
  });

  // Scale a point
  test('Scale 1, 1 by 1', () => {
    const transformMatrix = m2.scale(m2.identity(), 1, 1);
    expect(m2.transform(transformMatrix, 1, 1)).toEqual([1, 1]);
  });
  test('Scale 1, 1 by 2', () => {
    const transformMatrix = m2.scale(m2.identity(), 2, 2);
    expect(m2.transform(transformMatrix, 1, 1)).toEqual([2, 2]);
  });

  // Combine rotation, tranlsation and scale
  test('Rotate 2, 0 by 90 deg around 0, 0 then move 1, 0, then scale by 2', () => {
    let transformMatrix = m2.identity();
    transformMatrix = m2.scale(transformMatrix, 2, 2);
    transformMatrix = m2.translate(transformMatrix, 1, 0);
    transformMatrix = m2.rotate(transformMatrix, Math.PI / 2);
    const result = m2.transform(transformMatrix, 2, 0);
    expect(round(result)).toEqual([2, 4]);
  });

  // Matrix inversion
  test('Inverse I', () => {
    // let transformMatrix = m2.identity();
    expect(m2.inverse(m2.identity())).toEqual(m2.identity());
  });
  test('Inverse Matrix 1', () => {
    expect(round(m2.inverse([3, 0, 2, 2, 0, -2, 0, 1, 1])))
      .toEqual([0.2, 0.2, 0, -0.2, 0.3, 1, 0.2, -0.3, 0]);
  });

  // Copy
  test('Copy of A', () => {
    expect(m2.copy([1, 2, 3, 4, 5, 6, 7, 8, 9]))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
