import { Point, getPoint } from './Point';
import { Transform, getTransform } from './Transform';
import { round } from '../math';

/* eslint-disable object-curly-newline */

describe('Transform', () => {
  describe('Create 2D', () => {
    test('Create rotation', () => {
      const t = new Transform().rotate(Math.PI / 2);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(0, 1));
    });
    test('Create translation', () => {
      const t = new Transform().translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.m());
      expect(p1.round()).toEqual(new Point(2, 1));
    });
    test('Create scale', () => {
      const t = new Transform().scale(2, 2);
      const p0 = new Point(1, 0.5);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(2, 1));
    });
    test('Create R, T', () => {
      const t = new Transform().rotate(Math.PI / 2).translate(1, 1);
      const p0 = new Point(2, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, T', () => {
      const t = new Transform().scale(2, 2).rotate(Math.PI / 2).translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, then T', () => {
      const t1 = new Transform().scale(2, 2).rotate(Math.PI / 2);
      const t2 = t1.translate(1, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t2.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
    test('Create S, R, T, T, S', () => {
      let t1 = new Transform().scale(2, 2).rotate(Math.PI / 2);
      t1 = t1.translate(1, 1).translate(-5, 0).scale(2, 1);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t1.matrix());
      expect(p1.round()).toEqual(new Point(-8, 3));
    });
    test('Create axis angle rotation', () => {
      const t1 = new Transform().rotate(Math.PI / 2, [0, 1, 0]);
      const p0 = new Point(1, 0, 0);
      const p1 = p0.transformBy(t1.matrix());
      expect(p1.round()).toEqual(new Point(0, 0, -1));
    });
    test('Create direction rotation', () => {
      const t1 = new Transform().direction(0, 1, 0);
      const p0 = new Point(1, 0, 0);
      const p1 = p0.transformBy(t1.matrix());
      expect(p1.round()).toEqual(new Point(0, 1, 0));
    });
  });
  describe('Create 3D', () => {
    test('Create rotation', () => {
      const t = new Transform().rotate(Math.PI / 2, 'z');
      const p0 = new Point(1, 0, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(0, 1, 0));
    });
    test('Create translation', () => {
      const t = new Transform().translate(1, 1, 2);
      const p0 = new Point(1, 0, -1);
      const p1 = p0.transformBy(t.m());
      expect(p1.round()).toEqual(new Point(2, 1, 1));
    });
    test('Create scale', () => {
      const t = new Transform().scale(2, 2, 3);
      const p0 = new Point(1, 0.5, 0.2);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(2, 1, 0.6));
    });
    test('Create R, T', () => {
      const t = new Transform().rotate(Math.PI / 2, 'x').translate(1, 2, 3);
      const p0 = new Point(2, 1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(3, 2, 4));
    });
    test('Create S, R, T', () => {
      const t = new Transform().scale(2, 2, 2).rotate(Math.PI / 2, 'x').translate(1, 2, 3);
      const p0 = new Point(1, 1, 1);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(3, 0, 5));
    });
    test('Create S, R, then T', () => {
      const t1 = new Transform().scale(2, 2, 3).rotate(Math.PI / 2, 'z');
      const t2 = t1.translate(1, 1, 2);
      const p0 = new Point(1, 1, 1);
      const p1 = p0.transformBy(t2.matrix());
      expect(p1.round()).toEqual(new Point(-1, 3, 5));
    });
    test('Create S, R, T, T, S', () => {
      let t1 = new Transform().scale(2, 2, 2).rotate(Math.PI / 2);
      t1 = t1.translate(1, 1, 1).translate(-5, 0, 2).scale(2, 1, 0.5);
      const p0 = new Point(1, 1, 1);
      const p1 = p0.transformBy(t1.matrix());
      expect(p1.round()).toEqual(new Point(-12, 3, 2.5));
    });
    test('Create Custom', () => {
      const t = new Transform().custom([
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1,
      ]);
      expect(t.mat).toEqual([
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1,
      ]);
    });
  });
  describe('Update and get 2D', () => {
    test('Get rotation', () => {
      const t = new Transform().scale(2, 2).rotate(1).translate(1, 1)
        .rotate(2);
      expect(t.r()).toBe(1);
      expect(t.r(0)).toBe(1);
      expect(t.r(1)).toBe(2);
      expect(() => t.r(2)).toThrow();
    });
    test('Update rotation', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateRotation(4);
      expect(t.r()).toBe(4);

      t.updateRotation(5, null, 0);
      expect(t.r(0)).toBe(5);

      t.updateRotation(6, null, 1);
      expect(t.r(1)).toBe(6);

      expect(() => t.updateRotation(7, null, 2)).toThrow();
    });
    test('Update rotation checking matrix', () => {
      const t = new Transform().rotate(0);
      const matrix = t.m();
      t.updateRotation(1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(1).m());
    });
    test('Update rotation at index matrix', () => {
      const t = new Transform().rotate(0).rotate(1);
      const matrix = t.m();
      t.updateRotation(2, null, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(2).m());
    });
    test('Update translation checking matrix', () => {
      const t = new Transform().translate(0, 0);
      const matrix = t.m();
      t.updateTranslation([1, 1]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(1, 1).m());
    });
    test('Update translation with point checking matrix', () => {
      const t = new Transform().translate(0, 0);
      const matrix = t.m();
      t.updateTranslation(new Point(1, 1));
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(1, 1).m());
    });
    test('Update translation at index', () => {
      const t = new Transform().translate(1, 1).translate(-1, 1);
      const matrix = t.m();
      t.updateTranslation([1, 1, 0], 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(2, 2).m());
    });
    test('Update translation at index with Point', () => {
      const t = new Transform().translate(1, 1).translate(-1, 1);
      const matrix = t.m();
      t.updateTranslation(new Point(1, 1), 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(2, 2).m());
    });
    test('Update scale checking matrix', () => {
      const t = new Transform().scale(0, 0);
      const matrix = t.m();
      t.updateScale(1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale with point checking matrix', () => {
      const t = new Transform().scale(0, 0);
      const matrix = t.m();
      t.updateScale([1, 1]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale([1, 1, 1], 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index with Point', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale([1, 1], 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Get translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      expect(t.t()).toEqual({ x: 0, y: 0, z: 0, _type: 'point' });
      expect(t.t(0)).toEqual({ x: 0, y: 0, z: 0, _type: 'point' });
      expect(t.t(1)).toEqual({ x: 1, y: 1, z: 0, _type: 'point' });
      expect(() => t.t(2)).toThrow();
    });
    test('Update translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateTranslation(new Point(2, 2));
      expect(t.t()).toEqual({ x: 2, y: 2, z: 0, _type: 'point' });

      t.updateTranslation([3, 3]);
      expect(t.t()).toEqual({ x: 3, y: 3, z: 0, _type: 'point' });

      t.updateTranslation([4, 4], 0);
      expect(t.t()).toEqual({ x: 4, y: 4, z: 0, _type: 'point' });

      t.updateTranslation([5, 5], 1);
      expect(t.t(1)).toEqual({ x: 5, y: 5, z: 0, _type: 'point' });

      expect(() => t.updateTranslation([5, 5], 2)).toThrow();
    });
    test('Get Scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      expect(t.s()).toEqual({ x: 0, y: 0, z: 1, _type: 'point' });
      expect(t.s(0)).toEqual({ x: 0, y: 0, z: 1, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 1, y: 1, z: 1, _type: 'point' });
      expect(() => t.s(2)).toThrow();
    });
    test('Update scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      t.updateScale([2, 2]);
      expect(t.s()).toEqual({ x: 2, y: 2, z: 1, _type: 'point' });

      t.updateScale([3, 3]);
      expect(t.s()).toEqual({ x: 3, y: 3, z: 1, _type: 'point' });

      t.updateScale([4, 4], 0);
      expect(t.s()).toEqual({ x: 4, y: 4, z: 1, _type: 'point' });

      t.updateScale([5, 5], 1);
      expect(t.s(1)).toEqual({ x: 5, y: 5, z: 1, _type: 'point' });

      expect(() => t.updateScale(5, 5, 2)).toThrow();
    });
  });
  describe('Update and get 3D', () => {
    test('Get rotation X', () => {
      const t = new Transform().scale(2, 2).rotate(1, 'x').translate(1, 1)
        .rotate(2, 'x');
      expect(t.r()).toEqual(1);
      expect(t.r(0)).toEqual(1);
      expect(t.r(1)).toEqual(2);
      expect(() => t.rx(2)).toThrow();
    });
    test('Get rotation Y', () => {
      const t = new Transform().scale(2, 2).rotate(1, 'y').translate(1, 1)
        .rotate(2, 'y');
      expect(t.r()).toEqual(1);
      expect(t.r(0)).toEqual(1);
      expect(t.r(1)).toEqual(2);
      expect(() => t.ry(2)).toThrow();
    });
    test('Get rotation Z', () => {
      const t = new Transform().scale(2, 2).rotate(1, 'z').translate(1, 1)
        .rotate(2, 'z');
      expect(t.r()).toEqual(1);
      expect(t.r(0)).toEqual(1);
      expect(t.r(1)).toEqual(2);
      expect(() => t.rz(2)).toThrow();
    });
    test('Get rotation A', () => {
      const t = new Transform().scale(2, 2).rotate(1, 2, 3, 4).translate(1, 1)
        .rotate(2, 4, 5, 6);
      expect(t.r()).toEqual(1);
      expect(t.r(0)).toEqual(1);
      expect(t.r(1)).toEqual(2);
      expect(t.ra().toArray()).toEqual([2, 3, 4]);
      expect(t.ra(0).toArray()).toEqual([2, 3, 4]);
      expect(t.ra(1).toArray()).toEqual([4, 5, 6]);
      expect(() => t.ra(2)).toThrow();
    });
    test('Update rotationX', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1, 'x')
        .translate(1, 1)
        .rotate(2, 'x');
      t.updateRotation(4);
      expect(t.r()).toEqual(4);
      t.updateRotation(5, null, 0);
      expect(t.r(0)).toEqual(5);
      t.updateRotation(6, null, 1);
      expect(t.r(1)).toEqual(6);
      expect(() => t.updateRotation(7, null, 2)).toThrow();
    });
    test('Update rotationY', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1, 'y')
        .translate(1, 1)
        .rotate(2, 'y');
      t.updateRotation(4);
      expect(t.r()).toEqual(4);
      t.updateRotation(5, null, 0);
      expect(t.r(0)).toEqual(5);
      t.updateRotation(6, null, 1);
      expect(t.r(1)).toEqual(6);
      expect(() => t.updateRotation(7, null, 2)).toThrow();
    });
    test('Update rotationZ', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateRotation(4);
      expect(t.r()).toEqual(4);
      t.updateRotation(5, null, 0);
      expect(t.r(0)).toEqual(5);
      t.updateRotation(6, null, 1);
      expect(t.r(1)).toEqual(6);
      expect(() => t.updateRotation(7, null, 2)).toThrow();
    });
    test('Update rotationA', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1, 2, 3, 4)
        .translate(1, 1)
        .rotate(5, 6, 7, 8);
      t.updateRotation(9, [10, 11, 12]);
      expect(t.r()).toEqual(9);
      expect(t.ra().toArray()).toEqual([10, 11, 12]);
      t.updateRotation(-1, [1, 2, 3], 0);
      expect(t.r(0)).toEqual(-1);
      expect(t.ra(0).toArray()).toEqual([1, 2, 3]);
      t.updateRotation(-2, [2, 2, 2], 1);
      expect(t.r(1)).toEqual(-2);
      expect(t.ra(1).toArray()).toEqual([2, 2, 2]);
      expect(() => t.updateRotation(7, [4, 2, 6], 2)).toThrow();
    });
    test('Update rotation checking matrix', () => {
      const t = new Transform().rotate(0);
      const matrix = t.m();
      t.updateRotation(1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(1).m());
    });
    test('Update rotation at index matrix', () => {
      const t = new Transform().rotate(0).rotate(1);
      const matrix = t.m();
      t.updateRotation(2);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(2).rotate(1).m());
    });
    test('Update translation checking matrix', () => {
      const t = new Transform().translate(0, 0, 0);
      const matrix = t.m();
      t.updateTranslation([1, 2, 3]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(1, 2, 3).m());
    });
    test('Update translation at index', () => {
      const t = new Transform().translate(1, 1, 1).translate(-1, 1, 2);
      const matrix = t.m();
      t.updateTranslation([1, 1, 0], 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().translate(2, 2, 1).m());
    });
    test('Update scale checking matrix', () => {
      const t = new Transform().scale(0, 0, 0);
      const matrix = t.m();
      t.updateScale([1, 2, 3]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 2, 3).m());
    });
    test('Update scale at index', () => {
      const t = new Transform().scale(1, 2, 3).scale(-1, 1, -2);
      const matrix = t.m();
      t.updateScale([1, 1, 1], 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 2, 3).m());
    });
    test('Get translation', () => {
      const t = new Transform()
        .translate(0, 0, 0).scale(2, 2, 2).rotate(1)
        .translate(1, 1, 1)
        .rotate(2);
      expect(t.t()).toEqual(new Point(0, 0, 0));
      expect(t.t(0)).toEqual(new Point(0, 0, 0));
      expect(t.t(1)).toEqual(new Point(1, 1, 1));
      expect(() => t.t(2)).toThrow();
    });
    test('Update translation', () => {
      const t = new Transform()
        .translate(0, 0, 0).scale(2).rotate(1)
        .translate(1, 1, 1)
        .rotate(2);
      t.updateTranslation(new Point(2, 2, 2));
      expect(t.t()).toEqual({ x: 2, y: 2, z: 2, _type: 'point' });

      t.updateTranslation([3, 3, 3]);
      expect(t.t()).toEqual({ x: 3, y: 3, z: 3, _type: 'point' });

      t.updateTranslation([4, 4, 4], 0);
      expect(t.t()).toEqual({ x: 4, y: 4, z: 4, _type: 'point' });

      t.updateTranslation([5, 5, 5], 1);
      expect(t.t(1)).toEqual({ x: 5, y: 5, z: 5, _type: 'point' });

      expect(() => t.updateTranslation([5, 5, 5], 2)).toThrow();
    });
    test('Get Scale', () => {
      const t = new Transform()
        .scale(0, 0, 0).translate(2, 2, 2).rotate(1)
        .scale(1, 2, 3)
        .rotate(2);
      expect(t.s()).toEqual({ x: 0, y: 0, z: 0, _type: 'point' });
      expect(t.s(0)).toEqual({ x: 0, y: 0, z: 0, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 1, y: 2, z: 3, _type: 'point' });
      expect(() => t.s(2)).toThrow();
    });
    test('Update scale', () => {
      const t = new Transform()
        .scale(0, 0, 0).translate(2, 2, 2).rotate(1)
        .scale(1, 2, 3)
        .rotate(2);
      t.updateScale([2, 1, -1]);
      expect(t.s()).toEqual({ x: 2, y: 1, z: -1, _type: 'point' });

      t.updateScale([2, 3, 4]);
      expect(t.s()).toEqual({ x: 2, y: 3, z: 4, _type: 'point' });

      t.updateScale([4, 5, 6], 0);
      expect(t.s()).toEqual({ x: 4, y: 5, z: 6, _type: 'point' });

      t.updateScale([5, 4, 3], 1);
      expect(t.s(1)).toEqual({ x: 5, y: 4, z: 3, _type: 'point' });

      expect(() => t.updateScale(5, 5, 2)).toThrow();
    });
  });
  describe('Functions', () => {
    test('isEqualTo 2D', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const e1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const ne1 = new Transform().scale(1, 2).rotate(1).translate(1, 1);
      const ne2 = new Transform().scale(2, 1).rotate(1).translate(1, 1);
      const ne3 = new Transform().scale(1, 1).rotate(2).translate(1, 1);
      const ne4 = new Transform().scale(1, 1).rotate(1).translate(2, 1);
      const ne5 = new Transform().scale(1, 1).rotate(1).translate(1, 2);
      const ne6 = new Transform().rotate(1).translate(1, 1).scale(1, 1);
      const ne7 = new Transform().rotate(1).translate(1, 1);
      expect(t1.isEqualTo(e1)).toBe(true);
      expect(t1.isEqualTo(ne1)).toBe(false);
      expect(t1.isEqualTo(ne2)).toBe(false);
      expect(t1.isEqualTo(ne3)).toBe(false);
      expect(t1.isEqualTo(ne4)).toBe(false);
      expect(t1.isEqualTo(ne5)).toBe(false);
      expect(t1.isEqualTo(ne6)).toBe(false);
      expect(t1.isEqualTo(ne7)).toBe(false);
    });
    test('isEqualTo 3D', () => {
      const tf = (s, r, ra, rx, ry, rz, t) => new Transform()
        .scale(s)
        .rotate(r)
        .rotate(...ra)
        .rotate(rx, 'x')
        .rotate(ry, 'y')
        .rotate(rz, 'z')
        .translate(t);
      const t1 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const e1 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne1 = tf([2, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne2 = tf([1, 1, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne3 = tf([1, 2, 1], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne4 = tf([1, 2, 3], 1, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne5 = tf([1, 2, 3], 4, [1, [6, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne6 = tf([1, 2, 3], 4, [5, [1, 7, 8]], 9, 10, 11, [12, 13, 14]);
      const ne7 = tf([1, 2, 3], 4, [5, [6, 1, 8]], 9, 10, 11, [12, 13, 14]);
      const ne8 = tf([1, 2, 3], 4, [5, [6, 7, 1]], 9, 10, 11, [12, 13, 14]);
      const ne9 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 1, 10, 11, [12, 13, 14]);
      const ne10 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 1, 11, [12, 13, 14]);
      const ne11 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 1, [12, 13, 14]);
      const ne12 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [1, 13, 14]);
      const ne13 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 1, 14]);
      const ne14 = tf([1, 2, 3], 4, [5, [6, 7, 8]], 9, 10, 11, [12, 13, 1]);
      expect(t1.isEqualTo(e1)).toBe(true);
      expect(t1.isEqualTo(ne1)).toBe(false);
      expect(t1.isEqualTo(ne2)).toBe(false);
      expect(t1.isEqualTo(ne3)).toBe(false);
      expect(t1.isEqualTo(ne4)).toBe(false);
      expect(t1.isEqualTo(ne5)).toBe(false);
      expect(t1.isEqualTo(ne6)).toBe(false);
      expect(t1.isEqualTo(ne7)).toBe(false);
      expect(t1.isEqualTo(ne8)).toBe(false);
      expect(t1.isEqualTo(ne9)).toBe(false);
      expect(t1.isEqualTo(ne10)).toBe(false);
      expect(t1.isEqualTo(ne11)).toBe(false);
      expect(t1.isEqualTo(ne12)).toBe(false);
      expect(t1.isEqualTo(ne13)).toBe(false);
      expect(t1.isEqualTo(ne14)).toBe(false);
    });
    test('is Similar to - single transform in order', () => {
      const t1 = new Transform().scale(1, 1);
      const t2 = new Transform().scale(2, 2);
      const t3 = new Transform().translate(1, 1);
      const t4 = new Transform().rotate(1);
      expect(t1.isEqualShapeTo(t2)).toBe(true);
      expect(t1.isEqualShapeTo(t3)).toBe(false);
      expect(t1.isEqualShapeTo(t4)).toBe(false);
    });
    test('is Similar to - two transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2);
      const t2 = new Transform().scale(2, 2).rotate(4);
      const t3 = new Transform().translate(1, 1).rotate(1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isEqualShapeTo(t2)).toBe(true);
      expect(t1.isEqualShapeTo(t3)).toBe(false);
      expect(t1.isEqualShapeTo(t4)).toBe(false);
      expect(t1.isEqualShapeTo(t5)).toBe(false);
      expect(t1.isEqualShapeTo(t6)).toBe(false);
    });
    test('is Similar to - three transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2).translate(1, 1);
      const t2 = new Transform().scale(2, 2).rotate(4).translate(2, 2);
      const t3 = new Transform().translate(1, 1).rotate(1).scale(1, 1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isEqualShapeTo(t2)).toBe(true);
      expect(t1.isEqualShapeTo(t3)).toBe(false);
      expect(t1.isEqualShapeTo(t4)).toBe(false);
      expect(t1.isEqualShapeTo(t5)).toBe(false);
      expect(t1.isEqualShapeTo(t6)).toBe(false);
    });
    test('Subtraction happy case 2D', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.sub(t2);
      expect(ts.s()).toEqual(new Point(1, 1, 0));
      expect(ts.r()).toEqual(1);
      expect(ts.t()).toEqual(new Point(1, 1));
    });
    test('Subtraction happy case 3D', () => {
      const t1 = new Transform().scale(1, 2, 3).rotate(1, 4, 5, 6).translate(7, 8, 9, 5);
      const t2 = new Transform().scale(0, 1, 2).rotate(0, 3, 4, 5).translate(6, 7, 8);
      const ts = t1.sub(t2);
      expect(ts.s()).toEqual(new Point(1, 1, 1));
      expect(ts.r()).toEqual(1);
      expect(ts.ra().toArray()).toEqual([1, 1, 1]);
      expect(ts.t()).toEqual(new Point(1, 1, 1));
    });
    test('Subtraction sad case', () => {
      // Sad cases should throw an error
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      expect(() => t1.sub(t2)).toThrow();
      expect(() => t1.sub(t3)).toThrow();
    });
    test('Addition happy case - 2D', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.add(t2);
      expect(ts.s()).toEqual(new Point(1, 3, 2));
      expect(ts.r()).toEqual(5);
      expect(ts.t()).toEqual(new Point(7, 9));
    });
    test('Addition happy case - 3D', () => {
      const t1 = new Transform().scale(1, 2, 3).rotate(3, 4, 5, 6).translate(7, 8, 9);
      const t2 = new Transform().scale(0, 1, 2).rotate(2, 3, 4, 5).translate(6, 7, 8);
      const ts = t1.add(t2);
      expect(ts.s()).toEqual(new Point(1, 3, 5));
      expect(ts.r()).toEqual(5);
      expect(ts.ra().toArray()).toEqual([7, 9, 11]);
      expect(ts.t()).toEqual(new Point(13, 15, 17));
    });
    test('Addition sad case', () => {
      // Sad cases should throw an error
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      expect(() => t1.add(t2)).toThrow();
      expect(() => t1.add(t3)).toThrow();
    });
    test('Multiply happy case - 2D', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.mul(t2);
      expect(ts.s()).toEqual(new Point(0, 2, 1));
      expect(ts.r()).toEqual(6);
      expect(ts.t()).toEqual(new Point(12, 20));
    });
    test('Multiply happy case - 3D', () => {
      const t1 = new Transform().scale(1, 2, 3).rotate(2, 3, 4, 5).translate(4, 5, 6);
      const t2 = new Transform().scale(0, 1, 2).rotate(1, 2, 3, 4).translate(3, 4, 5);
      const ts = t1.mul(t2);
      expect(ts.s()).toEqual(new Point(0, 2, 6));
      expect(ts.r()).toEqual(2);
      expect(ts.ra().toArray()).toEqual([6, 12, 20]);
      expect(ts.t()).toEqual(new Point(12, 20, 30));
    });
    test('Multiply sad case', () => {
      // Sad cases should throw an error
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      expect(() => t1.mul(t2)).toThrow();
      expect(() => t1.mul(t3)).toThrow();
    });
    test('Transform - 2D', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t2.transform(t1).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Transform - 3D', () => {
      const t1 = new Transform().translate(1, 0, 2);
      const t2 = new Transform().rotate(Math.PI / 2, 0, 1);
      const t = round(t2.transform(t1).matrix(), 5);
      const expected = new Transform().translate(1, 0, 2).rotate(Math.PI / 2, 0, 1);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Transform By - 2D', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t1.transformBy(t2).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Transform By - 3D', () => {
      const t1 = new Transform().translate(1, 0, 2);
      const t2 = new Transform().rotate(Math.PI / 2, 1, 2);
      const t = round(t1.transformBy(t2).matrix(), 5);
      const expected = new Transform().translate(1, 0, 2).rotate(Math.PI / 2, 1, 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Zero', () => {
      const t1 = new Transform().scale(1, 1, 1).rotate('xyz', 1, 1, 1).translate(1, 1, 1);
      const t2 = t1.zero();
      expect(t2.isZero()).toBe(true);
    });
    test('isZero', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      expect(t1.isZero()).toBe(false);
      const t2 = t1.zero();
      expect(t2.isZero()).toBe(true);
      const t3 = new Transform().scale(0, 0).rotate(0).scale(1, 0);
      expect(t3.isZero()).toBe(false);
    });
    test('Constant', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const t2 = t1.constant(2);
      // This will need to change when 3D is properly supported
      expect(t2.def).toEqual([['s', 2, 2, 2], ['r', 2, 2, 2, 2], ['t', 2, 2, 2]]);
    });
    test('Rounding', () => {
      const t1 = new Transform()
        .scale(1.123456789, 1.12345678)
        .rotate(1.123456789)
        .translate(1.123456789, 1.12345678);
      let tr = t1.round();
      expect(tr.s()).toEqual(new Point(1.12345679, 1.12345678, 1));
      expect(tr.r()).toEqual(1.12345679);
      expect(tr.t()).toEqual(new Point(1.12345679, 1.12345678));

      tr = t1.round(2);
      expect(tr.s()).toEqual(new Point(1.12, 1.12, 1));
      expect(tr.r()).toEqual(1.12);
      expect(tr.t()).toEqual(new Point(1.12, 1.12));

      tr = t1.round(0);
      expect(tr.s()).toEqual(new Point(1, 1, 1));
      expect(tr.r()).toEqual(1);
      expect(tr.t()).toEqual(new Point(1, 1));
    });
    test('Clipping', () => {
      const t1 = new Transform()
        .scale(21, 20)
        .scale(0.1, 0.05)
        .scale(20, 0)
        .rotate(21)
        .rotate(20)
        .rotate(0.1)
        .rotate(0.05)
        .translate(21, 20)
        .translate(0.1, 0.05)
        .translate(0, 20)
        .translate(0, 21);
      const clipZero = 0.1;
      const clipMax = 20;
      let tc = t1.clipMag(clipZero, clipMax, false);
      expect(tc.s(0)).toEqual(new Point(20, 20, 1));
      expect(tc.s(1)).toEqual(new Point(0, 0, 1));
      expect(tc.s(2)).toEqual(new Point(20, 0, 1));
      expect(tc.r(0)).toBe(20);
      expect(tc.r(1)).toBe(20);
      expect(tc.r(2)).toBe(0);
      expect(tc.r(3)).toBe(0);
      expect(tc.t(0)).toEqual(new Point(20, 20));
      expect(tc.t(1)).toEqual(new Point(0, 0));
      expect(tc.t(2)).toEqual(new Point(0, 20));
      expect(tc.t(3)).toEqual(new Point(0, 20));

      // vector clipping
      tc = t1.clipMag(clipZero, clipMax);
      expect(tc.s(0)).toEqual(new Point(20, 20, 1));
      expect(tc.s(1)).toEqual(new Point(0, 0, 1));
      expect(tc.s(2)).toEqual(new Point(20, 0, 1));
      expect(tc.r(0)).toBe(20);
      expect(tc.r(1)).toBe(20);
      expect(tc.r(2)).toBe(0);
      expect(tc.r(3)).toBe(0);
      expect(tc.t(0).round(2)).toEqual(new Point(14.48, 13.79));
      expect(tc.t(1).round(2)).toEqual(new Point(0.1, 0.05));
      expect(tc.t(2).round(2)).toEqual(new Point(0, 20));
      expect(tc.t(3).round(2)).toEqual(new Point(0, 20));
    });
    test('Copy', () => {
      const t = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const b = t._dup();
      expect(t).toEqual(b);
      expect(t).not.toBe(b);
    });
    test('Velocity - Happy case', () => {
      const deltaTime = 1;
      const t0 = new Transform()
        .scale(0, 0)          // to test velocity
        .scale(-1, -40)       // to test zero
        .scale(0, 0)         // to test max
        .scale(0, 0)         // to test max
        .rotate(0)            // to test velocity
        .rotate(1)            // to test zero
        .rotate(-1)           // to test max
        .translate(0, 0)      // to test velocity
        .translate(-1, -40)   // to test zero
        .translate(0, 0)     // to test max
        .translate(0, 0);    // to test max
      const t1 = new Transform()
        .scale(-1, 1)
        .scale(-1.1414, -40.1414)
        .scale(14.1422, 14.1422)
        .scale(-14.1422, -14.1422)
        .rotate(-1)
        .rotate(1.1)
        .rotate(40)
        .translate(-1, 1)
        .translate(-1.1414, -40.1414)
        .translate(14.1422, 14.1422)
        .translate(-14.1422, -14.1422);
      const zero = 0.2;
      const max = 20;
      const v = t1.velocity(t0, deltaTime, zero, max);

      expect(v.s(0).round()).toEqual(new Point(-1, 1, 0));
      expect(v.s(1).round()).toEqual(new Point(0, 0, 0));
      expect(v.s(2).round(4)).toEqual(new Point(14.1422, 14.1422, 0));
      expect(v.s(3).round(4)).toEqual(new Point(-14.1422, -14.1422, 0));
      expect(v.r(0)).toBe(-1);
      expect(v.r(1)).toBe(0);
      expect(v.r(2)).toBe(20);
      expect(v.t(0).round()).toEqual(new Point(-1, 1));
      expect(v.t(1).round()).toEqual(new Point(0, 0));
      expect(v.t(2).round(4)).toEqual(new Point(14.1421, 14.1421));
    });
    describe('Velocity - Sad case', () => {
      let deltaTime;
      let zero;
      let max;
      let t0;
      let t1;
      beforeEach(() => {
        deltaTime = 1;
        zero = 0.2;
        max = 20;
        t0 = new Transform()
          .scale(0, 0)
          .rotate(0)
          .translate(0, 0);
        t1 = new Transform()
          .scale(1, 1)
          .rotate(1)
          .translate(1, 1);
      });
      test('t0 not similar to t1', () => {
        t1 = new Transform().rotate(1).scale(1, 1).translate(1, 1);
        expect(() => t1.velocity(t0, deltaTime, zero, max)).toThrow();
      });
    });
    describe('Rotation transforms', () => {
      let check;
      beforeEach(() => {
        check = (r, p, q) => {
          const t = getTransform(r);
          const p1 = getPoint(p).transformBy(t.matrix()).round().toArray();
          expect(p1).toEqual(getPoint(q).round().toArray());
        };
      });
      describe('Axis Angle', () => {
        test('[0, 1, 0] +π/2 around x = [0, 0, 1]', () => {
          check(['r', Math.PI / 2, 1, 0, 0], [0, 1, 0], [0, 0, 1]);
        });
        test('[0, 1, 0] -π/2 around x = [0, 0, -1]', () => {
          check(['r', -Math.PI / 2, 1, 0, 0], [0, 1, 0], [0, 0, -1]);
        });
        test('[0, 1, 0] π/2 around -x = [0, 0, -1]', () => {
          check(['r', Math.PI / 2, -1, 0, 0], [0, 1, 0], [0, 0, -1]);
        });
        test('[1, 0, 0] +3π around z = [-1, 0, 0]', () => {
          check(['r', 3 * Math.PI, 0, 0, 1], [1, 0, 0], [-1, 0, 0]);
        });
      });
      describe('xyz', () => {
        test('x +ve', () => {
          check(['r', Math.PI / 2, 1, 0, 0], [0, 1, 0], [0, 0, 1]);
        });
        test('x -ve', () => {
          check(['r', -Math.PI / 2, 1, 0, 0], [0, 1, 0], [0, 0, -1]);
        });
        test('y +ve', () => {
          check(['r', Math.PI / 2, 0, 1, 0], [1, 0, 0], [0, 0, -1]);
        });
        test('y -ve', () => {
          check(['r', -Math.PI / 2, 0, 1, 0], [1, 0, 0], [0, 0, 1]);
        });
        test('z +ve', () => {
          check(['r', Math.PI / 2, 0, 0, 1], [1, 0, 0], [0, 1, 0]);
        });
        test('z -ve', () => {
          check(['r', -Math.PI / 2, 0, 0, 1], [1, 0, 0], [0, -1, 0]);
        });
        test('xyz', () => {
          check([['r', Math.PI / 2, 1, 0, 0], ['r', Math.PI / 2, 0, 1, 0], ['r', Math.PI / 2, 0, 0, 1]], [0, 1, 0], [0, 1, 0]);
        });
        test('xyz 2', () => {
          check([['r', -Math.PI / 2, 1, 0, 0], ['r', Math.PI / 2, 0, 1, 0], ['r', Math.PI / 2, 0, 0, 1]], [0, 1, 0], [0, -1, 0]);
        });
      });
      describe('dir', () => {
        test('y', () => {
          check(['d', 0, 1, 0], [0, 1, 0], [-1, 0, 0]);
          check(['d', 0, 1, 0], [0, 0, 1], [0, 0, 1]);
          check(['d', 0, 1, 0], [1, 0, 0], [0, 1, 0]);
        });
        test('-x', () => {
          check(['d', -1, 0, 0], [1, 0, 0], [-1, 0, 0]);
          check(['d', -1, 0, 0], [0, 1, 0], [0, -1, 0]);
        });
      });
    });
  });
  describe('Get Transform', () => {
    test('Array', () => {
      const t = getTransform([['t', 1, 2]]);
      expect(t.t()).toEqual(new Point(1, 2));
      expect(t.def).toHaveLength(1);
    });
    test('Translation', () => {
      const t1 = getTransform(['t', 2, 2]);
      const t2 = getTransform(['t', 2, 2, 2]);
      const t3 = new Transform().translate(2, 2);
      const t4 = new Transform().translate(2, 2, 2);
      const t5 = new Transform().translate([2, 2]);
      const t6 = new Transform().translate([2, 2, 2]);
      expect(t1.def[0]).toEqual(['t', 2, 2]);
      expect(t2.def[0]).toEqual(['t', 2, 2, 2]);
      expect(t3.def[0]).toEqual(['t', 2, 2, 0]);
      expect(t4.def[0]).toEqual(['t', 2, 2, 2]);
      expect(t5.def[0]).toEqual(['t', 2, 2, 0]);
      expect(t6.def[0]).toEqual(['t', 2, 2, 2]);
    });
    test('Scale', () => {
      const t1 = getTransform(['s', 2]);
      const t2 = getTransform(['s', 2, 2]);
      const t3 = getTransform(['s', 2, 2, 2]);
      const t4 = new Transform().scale(2);
      const t5 = new Transform().scale(2, 2);
      const t6 = new Transform().scale(2, 2, 2);
      const t7 = new Transform().scale([2, 2]);
      const t8 = new Transform().scale([2, 2, 2]);
      expect(t1.def[0]).toEqual(['s', 2]);
      expect(t2.def[0]).toEqual(['s', 2, 2]);
      expect(t3.def[0]).toEqual(['s', 2, 2, 2]);
      expect(t4.def[0]).toEqual(['s', 2, 2, 2]);
      expect(t5.def[0]).toEqual(['s', 2, 2, 1]);
      expect(t6.def[0]).toEqual(['s', 2, 2, 2]);
      expect(t7.def[0]).toEqual(['s', 2, 2, 1]);
      expect(t8.def[0]).toEqual(['s', 2, 2, 2]);
    });
    test('Direction', () => {
      const t = getTransform([['d', 1, 2, 3]]);
      const t1 = getTransform(['d', 1, 2, 3]);
      const t2 = new Transform().direction(1, 2, 3);
      const t3 = new Transform().direction([1, 2, 3]);
      const t4 = new Transform().direction(new Point(1, 2, 3));
      expect(t.def[0]).toEqual(['d', 1, 2, 3]);
      expect(t1.def[0]).toEqual(t.def[0]);
      expect(t2.def[0]).toEqual(t.def[0]);
      expect(t3.def[0]).toEqual(t.def[0]);
      expect(t4.def[0]).toEqual(t.def[0]);
    });
    test('Def', () => {
      const tIn = new Transform().translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn._state());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.def).toHaveLength(3);
    });
    test('Fail undefined', () => {
      expect(() => getTransform()).toThrow();
    });
    test('Fail bad json', () => {
      expect(() => getTransform('asdf')).toThrow();
    });
    test('Fail bad value', () => {
      expect(() => getTransform(1)).toThrow();
    });
    describe('Rotation', () => {
      test('2D', () => {
        const t = getTransform([['r', 1]]);
        const t1 = getTransform(['r', 1]);
        const t2 = new Transform().rotate(1);
        expect(t.def[0]).toEqual(['r', 1, 0, 0, 1]);
        expect(t1.def[0]).toEqual(t.def[0]);
        expect(t2.def[0]).toEqual(t.def[0]);
      });
      test('axis', () => {
        const t = getTransform([['r', 1, 0, 1, 0]]);
        const t1 = getTransform(['r', 1, 0, 1, 0]);
        const t2 = new Transform().rotate(1, 0, 1, 0);
        const t3 = new Transform().rotate(1, [0, 1, 0]);
        const t4 = new Transform().rotate(1, new Point(0, 1, 0));
        expect(t.def[0]).toEqual(['r', 1, 0, 1, 0]);
        expect(t1.def[0]).toEqual(t.def[0]);
        expect(t2.def[0]).toEqual(t.def[0]);
        expect(t3.def[0]).toEqual(t.def[0]);
        expect(t4.def[0]).toEqual(t.def[0]);
      });
      test('x', () => {
        const t = getTransform([['r', 1, 1, 0, 0]]);
        const t1 = getTransform(['r', 1, 1, 0, 0]);
        const t2 = new Transform().rotate(1, 'x');
        expect(t.def[0]).toEqual(['r', 1, 1, 0, 0]);
        expect(t1.def[0]).toEqual(t.def[0]);
        expect(t2.def[0]).toEqual(t.def[0]);
      });
      test('y', () => {
        const t = getTransform([['r', 1, 0, 1, 0]]);
        const t1 = getTransform(['r', 1, 0, 1, 0]);
        const t2 = new Transform().rotate(1, 'y');
        expect(t.def[0]).toEqual(['r', 1, 0, 1, 0]);
        expect(t1.def[0]).toEqual(t.def[0]);
        expect(t2.def[0]).toEqual(t.def[0]);
      });
      test('z', () => {
        const t = getTransform([['r', 1, 0, 0, 1]]);
        const t1 = getTransform(['r', 1, 0, 0, 1]);
        const t2 = new Transform().rotate(1, 'z');
        expect(t.def[0]).toEqual(['r', 1, 0, 0, 1]);
        expect(t1.def[0]).toEqual(t.def[0]);
        expect(t2.def[0]).toEqual(t.def[0]);
      });
    });
    describe('basis', () => {
      describe('parse', () => {
        test('x => z, z => -x', () => {
          // Various combinations of i, j, k
          const t1 = getTransform([['b', { i: [0, 0, 1], j: [0, 1, 0] }]]);
          const t2 = getTransform([['b', { i: [0, 0, 1], k: [-1, 0, 0] }]]);
          const t3 = getTransform([['b', { j: [0, 1, 0], k: [-1, 0, 0] }]]);

          // Various combinations of right, top, normal
          const t4 = getTransform([['b', { right: [0, 0, 1], top: [0, 1, 0] }]]);
          const t5 = getTransform([['b', { right: [0, 0, 1], normal: [-1, 0, 0] }]]);
          const t6 = getTransform([['b', { top: [0, 1, 0], normal: [-1, 0, 0] }]]);

          // Mix i, j, k and right, top, normal
          const t7 = getTransform([['b', { j: [0, 1, 0], normal: [-1, 0, 0] }]]);

          // Array form
          const t8 = getTransform([['b', 0, 0, 1, 0, 1, 0, -1, 0, 0]]);

          // Transform.basis
          const t9 = new Transform().basis({ i: [0, 0, 1], j: [0, 1, 0] });

          expect(round(t1.def[0])).toEqual(
            ['b', 0, 0, 1, 0, 1, 0, -1, 0, 0],
          );
          expect(round(t1.def[0])).toEqual(round(t2.def[0]));
          expect(round(t1.def[0])).toEqual(round(t3.def[0]));
          expect(round(t1.def[0])).toEqual(round(t4.def[0]));
          expect(round(t1.def[0])).toEqual(round(t5.def[0]));
          expect(round(t1.def[0])).toEqual(round(t6.def[0]));
          expect(round(t1.def[0])).toEqual(round(t7.def[0]));
          expect(round(t1.def[0])).toEqual(round(t8.def[0]));
          expect(round(t1.def[0])).toEqual(round(t9.def[0]));
          expect(t1.matrix()).toEqual([
            0, 0, -1, 0,
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 1,
          ]);
        });
        test('ik, y => z, z => -y', () => {
          const t = getTransform([['b', { i: [1, 0, 0], k: [0, -1, 0] }]]);
          expect(round(t.def[0])).toEqual(
            ['b', 1, 0, 0, 0, 0, 1, 0, -1, 0],
          );
          expect(t.matrix()).toEqual([
            1, 0, 0, 0,
            0, 0, -1, 0,
            0, 1, 0, 0,
            0, 0, 0, 1,
          ]);
        });
        test('jk, x => y, y => -x', () => {
          const t = getTransform([['b', { j: [-1, 0, 0], k: [0, 0, 1] }]]);
          expect(round(t.def[0])).toEqual(
            ['b', 0, 1, 0, -1, 0, 0, 0, 0, 1],
          );
          expect(t.matrix()).toEqual([
            0, -1, 0, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ]);
        });
      });
      describe('Basis to Basis', () => {
        test('parse', () => {
          const t1 = getTransform([
            'bb',
            { i: [0, 1, 0], j: [-1, 0, 0] },
            { i: [-1, 0, 0], j: [0, -1, 0] },
          ]);
          const t2 = getTransform([
            'bb',
            { i: [0, 1, 0], j: [-1, 0, 0] },
            { right: [-1, 0, 0], top: [0, -1, 0] },
          ]);
          const t3 = getTransform([
            'bb',
            { i: [0, 1, 0], k: [0, 0, 1] },
            { normal: [0, 0, 1], top: [0, -1, 0] },
          ]);
          const t4 = getTransform([
            'bb',
            0, 1, 0, -1, 0, 0, 0, 0, 1,
            -1, 0, 0, 0, -1, 0, 0, 0, 1,
          ]);
          const t5 = new Transform().basisToBasis(
            { i: [0, 1, 0], j: [-1, 0, 0] },
            { right: [-1, 0, 0], top: [0, -1, 0] },
          );
          expect(round(t1.def)).toEqual(round(t2.def));
          expect(round(t1.def)).toEqual(round(t3.def));
          expect(round(t1.def)).toEqual(round(t4.def));
          expect(round(t1.def)).toEqual(round(t5.def));
        });
        test('from i = y, j = -x, to i => -x, j => -y', () => {
          // This test is the equivalent of Math.PI / 2 rotation
          const t = getTransform([
            'bb',
            { i: [0, 1, 0], j: [-1, 0, 0] },
            { i: [-1, 0, 0], j: [0, -1, 0] },
          ]);
          expect(round(t.matrix())).toEqual([
            0, -1, 0, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ]);
        });
      });
    });
  });
});
