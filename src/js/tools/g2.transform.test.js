import {
  Point, Transform,
  TransformLimit,
  getTransform, Translation, Rotation, Scale,
} from './g2';
import { round } from './math';

describe('Transform', () => {
  describe('Create', () => {
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
  describe('Update and get', () => {
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
      expect(t.r(2)).toBe(null);
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

      t.updateRotation(7, 2);
      expect(t.r(0)).toBe(5);
      expect(t.r(1)).toBe(6);
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
      t.updateTranslation(1, 1);
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
      t.updateTranslation(1, 1, 1);
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
      t.updateScale(1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale with point checking matrix', () => {
      const t = new Transform().scale(0, 0);
      const matrix = t.m();
      t.updateScale(new Point(1, 1));
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale(1, 1, 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Update scale at index with Point', () => {
      const t = new Transform().scale(1, 1).scale(-1, 1);
      const matrix = t.m();
      t.updateScale(new Point(1, 1), 1);
      expect(t.m()).not.toEqual(matrix);
      expect(t.m()).toEqual(new Transform().scale(1, 1).m());
    });
    test('Get translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      expect(t.t()).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.t(0)).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.t(1)).toEqual({ x: 1, y: 1, _type: 'point' });
      expect(t.t(2)).toEqual(null);
    });
    test('Update translation', () => {
      const t = new Transform()
        .translate(0, 0).scale(2, 2).rotate(1)
        .translate(1, 1)
        .rotate(2);
      t.updateTranslation(new Point(2, 2));
      expect(t.t()).toEqual({ x: 2, y: 2, _type: 'point' });

      t.updateTranslation(3, 3);
      expect(t.t()).toEqual({ x: 3, y: 3, _type: 'point' });

      t.updateTranslation(4, 4, 0);
      expect(t.t()).toEqual({ x: 4, y: 4, _type: 'point' });

      t.updateTranslation(5, 5, 1);
      expect(t.t(1)).toEqual({ x: 5, y: 5, _type: 'point' });

      t.updateTranslation(5, 5, 2);
      expect(t.t(0)).toEqual({ x: 4, y: 4, _type: 'point' });
      expect(t.t(1)).toEqual({ x: 5, y: 5, _type: 'point' });
    });
    test('Get Scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      expect(t.s()).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.s(0)).toEqual({ x: 0, y: 0, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 1, y: 1, _type: 'point' });
      expect(t.s(2)).toEqual(null);
    });
    test('Update scale', () => {
      const t = new Transform()
        .scale(0, 0).translate(2, 2).rotate(1)
        .scale(1, 1)
        .rotate(2);
      t.updateScale(new Point(2, 2));
      expect(t.s()).toEqual({ x: 2, y: 2, _type: 'point' });

      t.updateScale(3, 3);
      expect(t.s()).toEqual({ x: 3, y: 3, _type: 'point' });

      t.updateScale(4, 4, 0);
      expect(t.s()).toEqual({ x: 4, y: 4, _type: 'point' });

      t.updateScale(5, 5, 1);
      expect(t.s(1)).toEqual({ x: 5, y: 5, _type: 'point' });

      t.updateScale(5, 5, 2);
      expect(t.s(0)).toEqual({ x: 4, y: 4, _type: 'point' });
      expect(t.s(1)).toEqual({ x: 5, y: 5, _type: 'point' });
    });
  });
  describe('Functions', () => {
    test('isEqualTo', () => {
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
    test('is Similar to - single transform in order', () => {
      const t1 = new Transform().scale(1, 1);
      const t2 = new Transform().scale(2, 2);
      const t3 = new Transform().translate(1, 1);
      const t4 = new Transform().rotate(1);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
    });
    test('is Similar to - two transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2);
      const t2 = new Transform().scale(2, 2).rotate(4);
      const t3 = new Transform().translate(1, 1).rotate(1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
      expect(t1.isSimilarTo(t5)).toBe(false);
      expect(t1.isSimilarTo(t6)).toBe(false);
    });
    test('is Similar to - three transforms in order', () => {
      const t1 = new Transform().scale(1, 1).rotate(2).translate(1, 1);
      const t2 = new Transform().scale(2, 2).rotate(4).translate(2, 2);
      const t3 = new Transform().translate(1, 1).rotate(1).scale(1, 1);
      const t4 = new Transform().rotate(1);
      const t5 = new Transform().scale(1, 1).rotate(2).rotate(3);
      const t6 = new Transform().scale(1, 1).scale(2, 2);
      expect(t1.isSimilarTo(t2)).toBe(true);
      expect(t1.isSimilarTo(t3)).toBe(false);
      expect(t1.isSimilarTo(t4)).toBe(false);
      expect(t1.isSimilarTo(t5)).toBe(false);
      expect(t1.isSimilarTo(t6)).toBe(false);
    });
    test('Subtraction happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.sub(t2);
      expect(ts.s()).toEqual(new Point(1, 1));
      expect(ts.r()).toEqual(1);
      expect(ts.t()).toEqual(new Point(1, 1));
    });
    test('Subtraction sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.sub(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.sub(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Addition happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.add(t2);
      expect(ts.s()).toEqual(new Point(1, 3));
      expect(ts.r()).toEqual(5);
      expect(ts.t()).toEqual(new Point(7, 9));
    });
    test('Addition sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.add(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.add(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Multiply happy case', () => {
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().scale(0, 1).rotate(2).translate(3, 4);
      const ts = t1.mul(t2);
      expect(ts.s()).toEqual(new Point(0, 2));
      expect(ts.r()).toEqual(6);
      expect(ts.t()).toEqual(new Point(12, 20));
    });
    test('Multiply sad case', () => {
      // Sad cases should just return the initial transform
      const t1 = new Transform().scale(1, 2).rotate(3).translate(4, 5);
      const t2 = new Transform().rotate(0, 1).rotate(2).translate(3, 4);
      const t3 = new Transform().scale(0, 1).rotate(2);
      let ts = t1.mul(t2);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());

      ts = t1.mul(t3);
      expect(ts.s()).toEqual(t1.s());
      expect(ts.r()).toEqual(t1.r());
      expect(ts.t()).toEqual(t1.t());
    });
    test('Transform', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t2.transform(t1).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Transform By', () => {
      const t1 = new Transform().translate(1, 0);
      const t2 = new Transform().rotate(Math.PI / 2);
      const t = round(t1.transformBy(t2).matrix(), 5);
      const expected = new Transform().translate(1, 0).rotate(Math.PI / 2);
      expect(t).toEqual(round(expected.matrix(), 5));
    });
    test('Zero', () => {
      const t1 = new Transform().scale(1, 1).rotate(1).translate(1, 1);
      const t2 = t1.zero();
      expect(t2).toEqual(t1.sub(t1));
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
      expect(t2).toEqual(t1.add(t1));
    });
    test('Rounding', () => {
      const t1 = new Transform()
        .scale(1.123456789, 1.12345678)
        .rotate(1.123456789)
        .translate(1.123456789, 1.12345678);
      let tr = t1.round();
      expect(tr.s()).toEqual(new Point(1.12345679, 1.12345678));
      expect(tr.r()).toEqual(1.12345679);
      expect(tr.t()).toEqual(new Point(1.12345679, 1.12345678));

      tr = t1.round(2);
      expect(tr.s()).toEqual(new Point(1.12, 1.12));
      expect(tr.r()).toEqual(1.12);
      expect(tr.t()).toEqual(new Point(1.12, 1.12));

      tr = t1.round(0);
      expect(tr.s()).toEqual(new Point(1, 1));
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
      const clipZero = new TransformLimit(0.1, 0.1, 0.1);
      const clipMax = new TransformLimit(20, 20, 20);
      let tc = t1.clipMag(clipZero, clipMax, false);
      expect(tc.s(0)).toEqual(new Point(20, 20));
      expect(tc.s(1)).toEqual(new Point(0, 0));
      expect(tc.s(2)).toEqual(new Point(20, 0));
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
      expect(tc.s(0).round(2)).toEqual(new Point(14.48, 13.79));
      expect(tc.s(1).round(2)).toEqual(new Point(0.1, 0.05));
      expect(tc.s(2).round(2)).toEqual(new Point(20, 0));
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
      expect(t.order).not.toBe(b.order);
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
      const zero = new TransformLimit(0.2, 0.2, 0.2);
      const max = new TransformLimit(20, 20, 20);
      const v = t1.velocity(t0, deltaTime, zero, max);

      expect(v.s(0).round()).toEqual(new Point(-1, 1));
      expect(v.s(1).round()).toEqual(new Point(0, 0));
      expect(v.s(2).round(4)).toEqual(new Point(14.1421, 14.1421));
      expect(v.s(3).round(4)).toEqual(new Point(-14.1421, -14.1421));
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
        zero = new TransformLimit(0.2, 0.2, 0.2);
        max = new TransformLimit(20, 20, 20);
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
        const v = t1.velocity(t0, deltaTime, zero, max);
        expect(v.s()).toEqual(new Point(0, 0));
        expect(v.r()).toEqual(0);
        expect(v.t()).toEqual(new Point(0, 0));
      });
      // // If a transform element is missing from the zero transform, then no
      // // minimum will be applied
      // test('zero missing a transform element', () => {
      //   zero = new Transform().rotate(0.2).scale(0.2, 0.2);
      //   t1 = new Transform()
      //     .scale(0.2, -0.00001)
      //     .rotate(0.00001)
      //     .translate(0.2, 0.00001);
      //   const v = t1.velocity(t0, deltaTime, zero, max);
      //   expect(v).toEqual(t1);
      // });
      // // If a transform element is missing from the max transform, then
      // // no maximum will be applied.
      // test('max missing a transform element', () => {
      //   max = new Transform().rotate(20).scale(20, 20);
      //   t1 = new Transform()
      //     .scale(30, -100001)
      //     .rotate(100001)
      //     .translate(30, 100001);
      //   let v = t1.velocity(t0, deltaTime, zero, max);
      //   expect(v).toEqual(t1);

      //   // Test missing max when zero threshold is enforced.
      //   t1 = new Transform()
      //     .scale(30, -100001)
      //     .rotate(100001)
      //     .translate(0.1, 100001);
      //   v = t1.velocity(t0, deltaTime, zero, max);
      //   const vExpected = t1._dup();
      //   vExpected.updateTranslation(0, 100001);
      //   expect(v).toEqual(vExpected);
      // });
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
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        // Transform().scale(1, 1).rotate(1).translate(1, 1);
        v = new Transform().scale(10, 10).rotate(10).translate(10, 10);
        t = new Transform().scale(0, 0).rotate(0).translate(0, 0);
        z = new TransformLimit(5, 5, 5);
        // Transform().scale(5, 5).rotate(5).translate(5, 5);
      });
      test('Simple deceleration', () => {
        const n = t.decelerate(v, d, 1, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(9, 9).rotate(9).translate(9, 9));
        expect(n.t).toEqual(new Transform()
          .scale(9.5, 9.5).rotate(9.5).translate(9.5, 9.5));
      });
      test('Negatives in deceleration and velocity', () => {
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        const n = t.decelerate(v, d, 1, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(9, -9).rotate(-9).translate(9, -9));
        expect(n.t.round()).toEqual(new Transform()
          .scale(9.5, -9.5).rotate(-9.5).translate(9.5, -9.5));
      });
      test('Zero thresholds', () => {
        d = new TransformLimit(Math.sqrt(2), 1, Math.sqrt(2));
        v = new Transform().scale(10, -10).rotate(-10).translate(10, -10);
        z = new TransformLimit(5, 5, 5);
        const n = t.decelerate(v, d, 10, z);     // next v and t
        expect(n.v.round()).toEqual(new Transform()
          .scale(0, 0).rotate(0).translate(0, 0));
        expect(n.t.round()).toEqual(new Transform()
          .scale(43.75, -43.75).rotate(-37.5).translate(43.75, -43.75));
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
      test('Remove string', () => {
        const ta = new Transform('a').scale(1, 1).rotate(1).translate(1, 1);
        const tb = new Transform('b').scale(-1, -1).rotate(-1).translate(-1, -1);
        const tab = ta.transform(tb);
        expect(tab.order).toHaveLength(6);
        const tabRemoveA = tab.remove('a');
        expect(tabRemoveA.order).toHaveLength(3);
        expect(tabRemoveA.order[0].name).toBe('b');
        expect(tabRemoveA.order[0].x).toBe(-1);
      });
      test('Remove Array', () => {
        const ta = new Transform('a').scale(1, 1).rotate(1).translate(1, 1);
        const tb = new Transform('b').scale(-1, -1).rotate(-1).translate(-1, -1);
        const tc = new Transform('c').scale(-2, -2).rotate(-2).translate(-2, -2);
        const tab = ta.transform(tb).transform(tc);
        expect(tab.order).toHaveLength(9);
        const tabRemoveA = tab.remove('a');
        expect(tabRemoveA.order).toHaveLength(6);
        expect(tabRemoveA.order[0].name).toBe('c');
      });
    });
  });
  describe('Translation', () => {
    test('Simple', () => {
      const t = new Translation(1, 1);
      expect(t.x).toBe(1);
      expect(t.y).toBe(1);
    });
    test('Def', () => {
      const tDef = new Translation(1, 1)._def();
      const t = new Translation(tDef);
      expect(t.x).toBe(1);
      expect(t.y).toBe(1);
    });
  });
  describe('Scale', () => {
    test('Simple', () => {
      const s = new Scale(1, 1);
      expect(s.x).toBe(1);
      expect(s.y).toBe(1);
    });
    test('Def', () => {
      const sDef = new Scale(1, 1)._def();
      const s = new Scale(sDef);
      expect(s.x).toBe(1);
      expect(s.y).toBe(1);
    });
  });
  describe('Rotation', () => {
    test('Simple', () => {
      const r = new Rotation(1);
      expect(r.r).toBe(1);
    });
    test('Def', () => {
      const rDef = new Rotation(1)._def();
      const r = new Rotation(rDef);
      expect(r.r).toBe(1);
    });
  });
  describe('Get Transform', () => {
    test('Array', () => {
      const t = getTransform([['t', 1, 2]]);
      expect(t.t()).toEqual(new Point(1, 2));
      expect(t.order).toHaveLength(1);
    });
    test('Named Array', () => {
      const t = getTransform([['t', 1], 'Name1', ['s', 0.5]]);
      expect(t.t()).toEqual(new Point(1, 1));
      expect(t.s()).toEqual(new Point(0.5, 0.5));
      expect(t.order).toHaveLength(2);
      expect(t.name).toBe('Name1');
    });
    test('Def', () => {
      const tIn = new Transform().translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn._def());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
    });
    test('Named String Def', () => {
      const tIn = new Transform('Name1').translate(1, 0.5).scale(1, 1).rotate(0.5);
      const t = getTransform(tIn._def());
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
    test('Named String from String', () => {
      const tIn = '["Name1", ["t", 1, 0.5], ["s", 1, 1], ["r", 0.5]]';
      const t = getTransform(tIn);
      expect(t.t()).toEqual(new Point(1, 0.5));
      expect(t.s()).toEqual(new Point(1, 1));
      expect(t.r()).toEqual(0.5);
      expect(t.order).toHaveLength(3);
      expect(t.name).toBe('Name1');
    });
  });
});
