import { rotatePoint } from './quaternion';

describe('quaternion', () => {
  describe('rotatePoint single', () => {
    test('[1, 0, 0] π/2 around z', () => {
      const p = rotatePoint([1, 0, 0], Math.PI / 2, [0, 0, 1]);
      expect(p.round(2).toArray()).toEqual([0, 1, 0]);
    });
    test('[1, 0, 0] -π/2 around z', () => {
      const p = rotatePoint([1, 0, 0], -Math.PI / 2, [0, 0, 1]);
      expect(p.round(2).toArray()).toEqual([0, -1, 0]);
    });
    test('[1, 0, 0] π/2 around y', () => {
      const p = rotatePoint([1, 0, 0], Math.PI / 2, [0, 1, 0]);
      expect(p.round(2).toArray()).toEqual([0, 0, -1]);
    });
    test('[1, 0, 0] -π/2 around y', () => {
      const p = rotatePoint([1, 0, 0], -Math.PI / 2, [0, 1, 0]);
      expect(p.round(2).toArray()).toEqual([0, 0, 1]);
    });
    test('[1, 0, 0] π around y', () => {
      const p = rotatePoint([1, 0, 0], Math.PI, [0, 1, 0]);
      expect(p.round(2).toArray()).toEqual([-1, 0, 0]);
    });
    test('[1, 0, 0] -π around y', () => {
      const p = rotatePoint([1, 0, 0], -Math.PI, [0, 1, 0]);
      expect(p.round(2).toArray()).toEqual([-1, 0, 0]);
    });
    test('[1, 0, 0] 3π/2 around z', () => {
      const p = rotatePoint([1, 0, 0], 3 * Math.PI / 2, [0, 0, 1]);
      expect(p.round(2).toArray()).toEqual([0, -1, 0]);
    });
    test('[1, 0, 0] -3π/2 around z', () => {
      const p = rotatePoint([1, 0, 0], -3 * Math.PI / 2, [0, 0, 1]);
      expect(p.round(2).toArray()).toEqual([0, 1, 0]);
    });
  });
  describe('two rotations', () => {
    test('[1, 0, 0] π/2 around z then x', () => {
      const p = rotatePoint(
        [1, 0, 0],
        [
          [Math.PI / 2, [0, 0, 1]],
          [Math.PI / 2, [1, 0, 0]],
        ],
      );
      expect(p.round(2).toArray()).toEqual([0, 0, 1]);
    });
  });
  describe('three rotations', () => {
    test('[0, 1, 0] π/2 around z then y, then x', () => {
      const p = rotatePoint(
        [0, 1, 0],
        [
          [Math.PI / 2, [0, 0, 1]],
          [Math.PI / 2, [0, 1, 0]],
          [Math.PI / 2, [1, 0, 0]],
        ],
      );
      expect(p.round(2).toArray()).toEqual([0, -1, 0]);
    });
  });
});
