import {
  Point, Transform,
  // TransformLimit,
  getTransform, Translation, Rotation, Scale,
} from './g2';
import { round } from './math';

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
  });
  describe('Create 3D', () => {
    test('Create rotation', () => {
      const t = new Transform().rotate(0, 0, Math.PI / 2);
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
      const t = new Transform().rotate(Math.PI / 2, 0, 0).translate(1, 2, 3);
      const p0 = new Point(2, 1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(3, 2, 4));
    });
    test('Create S, R, T', () => {
      const t = new Transform().scale(2, 2, 2).rotate(Math.PI / 2, 0, 0).translate(1, 2, 3);
      const p0 = new Point(1, 1, 1);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(3, 0, 5));
    });
    test('Create S, R, then T', () => {
      const t1 = new Transform().scale(2, 2, 3).rotate(0, 0, Math.PI / 2);
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
  });
  describe('Update and get 2D', () => {
    test('Update R in S, R, T', () => {
      const t = new Transform().scale(2, 2).rotate(Math.PI).translate(1, 1);
      t.update(1).rotate(Math.PI / 2);
      const p0 = new Point(1, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3));
    });
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

      t.updateRotation(5, 0);
      expect(t.r(0)).toBe(5);

      t.updateRotation(6, 1);
      expect(t.r(1)).toBe(6);

      expect(() => t.updateRotation(7, 2)).toThrow();
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
      t.updateRotation(2, 1);
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
      expect(() => t.s(2)).toThrow()
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
    test('Update R in S, R, T', () => {
      const t = new Transform().scale(2, 2, 2).rotate(0, 0, Math.PI).translate(1, 1, 1);
      t.update(1).rotate(0, 0, Math.PI / 2);
      const p0 = new Point(1, 0, 0);
      const p1 = p0.transformBy(t.matrix());
      expect(p1.round()).toEqual(new Point(1, 3, 1));
    });
    test('Get rotation', () => {
      const t = new Transform().scale(2, 2).rotate(1, 2, 3).translate(1, 1)
        .rotate(2);
      expect(t.r3()).toEqual(new Point(1, 2, 3));
      expect(t.r3(0)).toEqual(new Point(1, 2, 3));
      expect(t.r3(1)).toEqual(new Point(0, 0, 2));
      expect(() => t.r3(2)).toThrow();
    });
    test('Update rotation', () => {
      const t = new Transform()
        .scale(2, 2)
        .rotate(1, 2, 3)
        .translate(1, 1)
        .rotate(4, 5, 6);
      t.updateRotation([2, 3, 4]);
      expect(t.r3()).toEqual(new Point(2, 3, 4));

      t.updateRotation(5, 0);
      expect(t.r3(0)).toEqual(new Point(0, 0, 5));

      t.updateRotation([6, 7, 8], 1);
      expect(t.r3(1)).toEqual(new Point(6, 7, 8));

      expect(() => t.updateRotation(7, 2)).toThrow();
    });
    test('Update rotation checking matrix', () => {
      const t = new Transform().rotate(0);
      const matrix = t.m();
      t.updateRotation([1, 2, 3]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(1, 2, 3).m());
    });
    test('Update rotation at index matrix', () => {
      const t = new Transform().rotate(0).rotate(1, 2, 3);
      const matrix = t.m();
      t.updateRotation([2, 1, 0]);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().rotate(2, 1, 0).rotate(1, 2, 3).m());
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
      const t1 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 8, 9);
      const e1 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 8, 9);
      const ne1 = new Transform().scale(2, 2, 3).rotate(4, 5, 6).translate(7, 8, 9);
      const ne2 = new Transform().scale(1, 1, 3).rotate(4, 5, 6).translate(7, 8, 9);
      const ne3 = new Transform().scale(1, 2, 1).rotate(4, 5, 6).translate(7, 8, 9);
      const ne4 = new Transform().scale(1, 2, 3).rotate(1, 5, 6).translate(7, 8, 9);
      const ne5 = new Transform().scale(1, 2, 3).rotate(4, 1, 6).translate(7, 8, 9);
      const ne6 = new Transform().scale(1, 2, 3).rotate(4, 5, 1).translate(7, 8, 9);
      const ne7 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(1, 8, 9);
      const ne8 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 1, 9);
      const ne9 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 8, 1);
      const ne10 = new Transform().rotate(4, 5, 6).translate(7, 8, 9).scale(1, 2, 3);
      const ne11 = new Transform().rotate(4, 5, 6).translate(7, 8, 9);
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
      const t1 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 8, 9, 5);
      const t2 = new Transform().scale(0, 1, 2).rotate(3, 4, 5).translate(6, 7, 8);
      const ts = t1.sub(t2);
      expect(ts.s()).toEqual(new Point(1, 1, 1));
      expect(ts.r3()).toEqual(new Point(1, 1, 1));
      expect(ts.t()).toEqual(new Point(1, 1, 1));
    });
    test('Subtraction sad case', () => {
      // Sad cases should throw an error
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
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
      const t1 = new Transform().scale(1, 2, 3).rotate(4, 5, 6).translate(7, 8, 9);
      const t2 = new Transform().scale(0, 1, 2).rotate(3, 4, 5).translate(6, 7, 8);
      const ts = t1.add(t2);
      expect(ts.s()).toEqual(new Point(1, 3, 5));
      expect(ts.r3()).toEqual(new Point(7, 9, 11));
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
      const t1 = new Transform().scale(1, 2, 3).rotate(3, 4, 5).translate(4, 5, 6);
      const t2 = new Transform().scale(0, 1, 2).rotate(2, 3, 4).translate(3, 4, 5);
      const ts = t1.mul(t2);
      expect(ts.s()).toEqual(new Point(0, 2, 6));
      expect(ts.r3()).toEqual(new Point(6, 12, 20));
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
      const t1 = new Transform().scale(1, 1, 1).rotate(1, 1, 1).translate(1, 1, 1);
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
      expect(t2.def).toEqual([['s', 2, 2, 2,], ['r', 2, 2, 2], ['t', 2, 2, 2]]);
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
      t.index = 0;
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
    // Calculation for deceleration:
    // s = function(sx, sy, vx, vy, d, t) {
    //   vel = sqrt(vx*vx+vy*vy);
    //   vNext = vel-d*t;
    //   angle = atan2(vy, vx);
    //   vx = vNext * cos(angle);
    //   vy = vNext * sin(angle);
    //   dist = vel*t - 0.5*d*t*t;
    //   x = sx + dist*cos(angle);
    //   y = sy + dist*sin(angle);
    //   return {vx, vy, x, y}
    // }
    describe('Deceleration', () => {
      let d;
      let t;
      let v;
      let z;
      beforeEach(() => {
        // d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        d = { scale: 1, translation: Math.sqrt(2), rotation: 1 };
        // Transform().scale(1, 1).rotate(1).translate(1, 1);
        v = new Transform().scale(10, 10).rotate(10).translate(10, 10);
        t = new Transform().scale(0, 0).rotate(0).translate(0, 0);
        // z = new TransformLimit(5, 5, 5);
        z = { scale: 5, translation: 5, rotation: 5 };
        // Transform().scale(5, 5).rotate(5).translate(5, 5);
      });
      test('Simple deceleration', () => {
        const n = t.decelerate(v, d, 1, {}, {}, z);     // next v and t
        expect(n.velocity.round()).toEqual(new Transform()
          .scale(9, 9, 0).rotate(9).translate(9, 9, 0));
        expect(n.transform).toEqual(new Transform()
          .scale(9.5, 9.5, 1).rotate(9.5).translate(9.5, 9.5));
      });
      test('Negatives in deceleration and velocity', () => {
        // d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        // d = { scale: Math.sqrt(2), translation: Math.sqrt(2), rotation: 1 };
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        const n = t.decelerate(v, d, 1, {}, {}, z);     // next v and t
        expect(n.velocity.round()).toEqual(new Transform()
          .scale(9, -9, 0).rotate(-9).translate(9, -9));
        expect(n.transform.round()).toEqual(new Transform()
          .scale(9.5, -9.5, 1).rotate(-9.5).translate(9.5, -9.5));
      });
      test('Zero thresholds', () => {
        // d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        // z = new TransformLimit(5, 5, 5);
        const n = t.decelerate(v, d, 10, {}, {}, z);     // next v and t
        expect(n.velocity.round()).toEqual(new Transform()
          .scale(0, 0, 0).rotate(0).translate(0, 0));
        expect(n.transform.round()).toEqual(new Transform()
          .scale(37.5, -37.5, 1).rotate(-37.5).translate(43.75, -43.75));
      });
    });
    describe('Clipping', () => {
      test('Not clipped', () => {
        let min;
        let max;
        let t0;
        t0 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
        min = new Transform().scale(0, 0).rotate(0).translate(-2, -2);
        max = new Transform().scale(2, 2).rotate(2).translate(2, 2);
        expect(t0.clip(min, max)).toEqual(t0);

        t0 = new Transform().scale(-1, -1).rotate(-1).translate(-1, -1);
        min = new Transform().scale(-2, -2).rotate(-2).translate(-2, -2);
        max = new Transform().scale(0, 2).rotate(2).translate(0, 2);
        expect(t0.clip(min, max)).toEqual(t0);

        t0 = new Transform().scale(-1, 1).rotate(-1).translate(-1, 1);
        min = new Transform().scale(-1, -2).rotate(-1).translate(-1, -2);
        max = new Transform().scale(0, 1).rotate(2).translate(0, 1);
        expect(t0.clip(min, max)).toEqual(t0);
      });
      test('Clipped', () => {
        let min;
        let max;
        let t0;
        let t1;
        // Clip max
        t0 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
        min = new Transform().scale(-1, 0).rotate(0).translate(-2, -2);
        max = new Transform().scale(0, 0.5).rotate(0.5).translate(0, -1.5);
        t1 = new Transform().scale(0, 0.5).rotate(0.5).translate(0, -1.5);
        expect(t0.clip(min, max)).toEqual(t1);

        // Clip min
        t0 = new Transform().scale(1, -1).rotate(1).translate(1, -1);
        min = new Transform().scale(1.5, 0).rotate(2).translate(1.5, 0);
        max = new Transform().scale(2, 0.5).rotate(3).translate(2, 0.5);
        t1 = new Transform().scale(1.5, 0).rotate(2).translate(1.5, 0);
        expect(t0.clip(min, max)).toEqual(t1);
      });
    });
  });
  describe('Get Transform', () => {
    test('Array', () => {
      const t = getTransform([['t', 1, 2]]);
      expect(t.t()).toEqual(new Point(1, 2));
      expect(t.def).toHaveLength(1);
    });
    test('Named Array', () => {
      const t = getTransform([['t', 1, 1], 'Name1', ['s', 0.5]]);
      expect(t.t()).toEqual(new Point(1, 1, 0));
      expect(t.s()).toEqual(new Point(0.5, 0.5, 0.5));
      expect(t.def).toHaveLength(2);
      expect(t.name).toBe('Name1');
    });
    test('Def', () => {
      const tIn = new Transform().translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn._state());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.def).toHaveLength(3);
    });
    test('Named String Def', () => {
      const tIn = new Transform('Name1').translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn._state());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.def).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
    test('Named String from String', () => {
      const tIn = '["Name1", ["t", 1, 0.5], ["s", 1, 1], ["r", 0.5]]';
      const t = getTransform(tIn);
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.def).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
    test('Fail undefined', () => {
      expect(() => t = getTransform()).toThrow();
    });
    test('Fail bad json', () => {
      expect(() => getTransform('asdf')).toThrow();
    });
    test('Fail bad value', () => {
      expect(() => getTransform(1)).toThrow();
    });
  });
});
