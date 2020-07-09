import {
  Point, calculateStop, Rect, Line,
} from './g2';
import { round } from './math';

describe('calculateStop', () => {
  describe('No Bounds', () => {
    test('Along x from origin', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const { duration, position } = calculateStop(p, v, deceleration);
      expect(duration).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(position.round()).toEqual(new Point(12.5, 0));
    });
    test('Along x from point', () => {
      const p = new Point(1, 1);
      const v = new Point(-5, 0);
      const deceleration = 1;
      const { duration, position } = calculateStop(p, v, deceleration);
      expect(duration).toBe(5);
      expect(position.round()).toEqual(new Point(-12.5 + 1, 1));
    });
    test('Along y from point', () => {
      const p = new Point(1, 1);
      const v = new Point(0, -10);
      const deceleration = 2;
      const { duration, position } = calculateStop(p, v, deceleration);
      expect(duration).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 2 * 5^2 = 50 - 25 = 25
      expect(position.round()).toEqual(new Point(1, -25 + 1));
    });
    test('Along 45º', () => {
      const p = new Point(1, 1);
      const v = new Point(5 * 0.707107, 5 * 0.707107);
      const deceleration = 1;
      const { duration, position } = calculateStop(p, v, deceleration);
      expect(round(duration, 3)).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      const xy = round(12.5 * Math.cos(Math.PI / 4), 3)
      expect(position.round(3)).toEqual(new Point(xy + 1, xy + 1));
    });
    test('Simulate Rotation', () => {
      // where x is the rotation
      const p = new Point(0, 0);
      const v = new Point(5, 0); // 5 rad/s
      const deceleration = 1; // 1 rad/s/s
      const { duration, position } = calculateStop(p, v, deceleration);
      expect(round(duration, 3)).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      const xy = round(12.5 * Math.cos(Math.PI / 4), 3)
      expect(position.round(3)).toEqual(new Point(12.5, 0)); // 12.5 rad
    });
  });
  describe('Rect Bounds', () => {
    test('X single bounce, no loss', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new Rect(-4.5, -1, 9, 2);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // Total displacement = 12.5
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.5 - 4.5) = -3.5
      expect(duration).toBe(5);
      expect(position.round()).toEqual(new Point(-3.5, 0));
    });
    test('X single bounce, 0.5 loss', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new Rect(-4.5, -1, 9, 2);
      const bounceLoss = 0.5;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // New velocity will be: v1 = v0 + acc * t = 5 - 1 = 4;
      // Bounce loss of 0.5 => new v1 = 2;
      // Therefore will be 2s remaining - so total time is 3s;
      // Remaining displacement is s = 2 * 2 - 0.5 * 1 * 2^2 = 4 - 2 = 2;
      // Therefore end point will be 4.5 - 2 = 2.5
      expect(duration).toBe(3);
      expect(position.round()).toEqual(new Point(2.5, 0));
    });
    test('X four bounce, no loss', () => {
      const p = new Point(0, 0);
      const v = new Point(10, 0);
      const deceleration = 1;
      const bounds = new Rect(-6, -1, 12, 2);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // Total time:
      //  t = v0 / a = 10s
      //
      // Total displacement:
      //  s = v0*t + 0.5*a*t^2 = 10 * 10 - 0.5 * 100 = 50
      //
      // Bounds width: 12
      // Num Bounces: 4 (50 - 6 - 12 - 12 - 12)
      // Remaining displacement: 8 from negative side
      // End position: (2, 0)
      expect(duration).toBe(10);
      expect(position.round()).toEqual(new Point(2, 0));
    });
    test('Y single bounce, no loss', () => {
      const p = new Point(0, 0);
      const v = new Point(0, 5);
      const deceleration = 1;
      const bounds = new Rect(-4.5, -4.5, 9, 9);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // Total displacement = 12.5
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.5 - 4.5) = -3.5
      expect(duration).toBe(5);
      expect(position.round()).toEqual(new Point(0, -3.5));
    });
    test('45º single bounce right, no loss', () => {
      const p = new Point(0, 0);
      const v = new Point(5 * 0.70710678, 5 * 0.70710678);
      const deceleration = 1;
      const bounds = new Rect(-5.6568542494, -100, 5.6568542494 * 2, 200);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // Velocity mag: 5, angle 45º
      // Total duration: 5
      // Total displacement: 5 * 5 - 0.5 * 25 = 12.5
      // Displacement After 2s: 5 * 2 - 0.5 * 4 = 10 - 2 = 8
      // x displacement after 2s: 8 * cos(45) = 5.6568542494
      // remaining x displacement: 4.5 * cos(45) = 3.1819805153
      // Total y displacement: 12.5 * cos(45) = 8.8388347648
      expect(round(duration, 3)).toBe(5);
      expect(position.round(3)).toEqual(new Point(5.657 - 3.182, 8.839).round(3));
    });
    describe('All angles and sides', () => {
      let p;
      let deceleration;
      let bounceLoss;
      beforeEach(() => {
        p = new Point(0, 0);
        deceleration = 1;
        bounceLoss = 0;
      });
      test('45º single bounce top, no loss', () => {
        const v = new Point(5 * 0.70710678, 5 * 0.70710678);
        const bounds = new Rect(-100, -5.6568542494, 200, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(8.839, 5.657 - 3.182).round(3));
      });
      test('45º single bounce corner, no loss', () => {
        const v = new Point(5 * 0.70710678, 5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -5.6568542494, 5.6568542494 * 2, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(5.657 - 3.182, 5.657 - 3.182).round(3));
      });
      test('135º single bounce top, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new Rect(-100, -5.6568542494, 200, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-8.839, 5.657 - 3.182).round(3));
      });
      test('135º single bounce left, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -100, 5.6568542494 * 2, 200);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), 8.839).round(3));
      });
      test('135º single bounce corner, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -5.6568542494, 5.6568542494 * 2, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), 5.657 - 3.182).round(3));
      });
      test('225º single bounce top, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-100, -5.6568542494, 200, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-8.839, -(5.657 - 3.182)).round(3));
      });
      test('225º single bounce left, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -100, 5.6568542494 * 2, 200);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), -8.839).round(3));
      });
      test('225º single bounce corner, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -5.6568542494, 5.6568542494 * 2, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), -(5.657 - 3.182)).round(3));
      });
      test('315º single bounce top, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-100, -5.6568542494, 200, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(8.839, -(5.657 - 3.182)).round(3));
      });
      test('315º single bounce left, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -100, 5.6568542494 * 2, 200);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point((5.657 - 3.182), -8.839).round(3));
      });
      test('315 single bounce corner, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new Rect(-5.6568542494, -5.6568542494, 5.6568542494 * 2, 5.6568542494 * 2);
        const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point((5.657 - 3.182), -(5.657 - 3.182)).round(3));
      });
    });
  });
  describe('Line Bounds', () => {
    test('No bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5 / Math.sqrt(2), 5 / Math.sqrt(2));
      const deceleration = 1;
      const bounds = new Line([0, 0], 100, 0);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      // Total displacement = 12.5
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.5 - 4.5) = -3.5
      expect(duration).toBe(5);
      expect(position.round(3)).toEqual(new Point(12.5 * Math.cos(Math.PI / 4), 12.5 * Math.sin(Math.PI / 4)).round(3));
    });
    test('One bounce', () => {
      const p = new Point(0, 1);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new Line([-4.5, 0], 9, 0);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds);
      expect(shaddow.round(4)).toEqual(new Point(-3.5, 0))
    });
    test('45º No bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5 / Math.sqrt(2), 5 / Math.sqrt(2));
      const deceleration = 1;
      const bounds = new Line([-100, 0], 200, 0);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds);
      expect(shaddow.round(3)).toEqual(new Point(5.657 + 3.182, 0))
    });
    test('45º One bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5 / Math.sqrt(2), 5 / Math.sqrt(2));
      const deceleration = 1;
      const bounds = new Line([-5.6568542494, 0], 5.6568542494 * 2, 0);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds);
      expect(shaddow.round(3)).toEqual(new Point(5.657 - 3.182, 0))
    });
    test('0º One bounce on 45º line', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new Line([-4.5, -4.5], 9 * Math.sqrt(2), Math.PI / 4);
      const bounceLoss = 0;
      const { duration, position } = calculateStop(p, v, deceleration, bounds, bounceLoss);
      expect(duration).toBe(5);
      
      const xDistance = 12.5;
      expect(position.round(3)).toEqual(new Point(4.5 * 2 - (xDistance - 4.5 * 2), 0));
    });
  })
});
