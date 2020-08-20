import {
  Point, RectBounds, LineBounds, RangeBounds,
  deceleratePoint, decelerateValue, decelerateTransform,
  Transform,
} from './g2';
import { round } from './math';

describe('Decelerate Value', () => {
  describe('No Bounds', () => {
    test('From origin', () => {
      const p = 0;
      const v = 5;
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, value } = decelerateValue(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 1 = 4
      expect(round(velocity)).toBe(4);
      // s = vt + 0.5 * at^2
      // s = 5 * 1 - 0.5 * 1 * 1^2 = 5 - 0.5 = 4.5
      expect(value).toEqual(4.5, 0);
    });
    test('Along x from point, 1s', () => {
      const p = 1;
      const v = 5;
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, value } = decelerateValue(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 1 = 4
      expect(round(velocity)).toBe(4);
      // s = vt + 0.5 * at^2
      // s = 5 * 1 - 0.5 * 1 * 1^2 = 5 - 0.5 = 4.5
      expect(round(value)).toEqual(5.5);
    });
    test('Till Stop', () => {
      const p = 0;
      const v = 5;
      const deceleration = 1;
      const deltaTime = 5;
      const { velocity, value } = decelerateValue(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 5 = 0
      expect(round(velocity)).toBe(0);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(round(value)).toEqual(12.5);
    });
    test('Till after Stop', () => {
      const p = 0;
      const v = 5;
      const deceleration = 1;
      const deltaTime = 10;
      const { velocity, value } = decelerateValue(p, v, deceleration, deltaTime);
      // Max deltaTime = v0 / a = 5 / 1 = 5
      // v1 = v0 - a * t = 5 - 1 * 5 = 0
      expect(round(velocity)).toBe(0);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(round(value)).toEqual(12.5);
    });
    describe('Rect Bounds', () => {
      test('Single bounce, no loss', () => {
        const p = 0;
        const v = 5;
        const deceleration = 1;
        const deltaTime = 2;
        const bounds = new RangeBounds({ min: -4.5, max: 4.5 });
        const bounceLoss = 0;
        const { velocity, value } = decelerateValue(
          p, v, deceleration, deltaTime, bounds, bounceLoss,
        );
        // s = v0*t + 0.5*acc*t^2
        //   = 5 * 2 + 0.5 * 1 * 2 * 2 = 10 - 2 = 8
        // Total displacement = 8
        // For v0 = 5, acc = -1, after 1s, the displaycement will be:
        // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
        // Therefore end point will be 4.5 - (8 - 4.5) = 1
        expect(round(velocity)).toBe(-3);
        expect(round(value)).toEqual(1);
      });
      test('Single bounce, 0.5 loss', () => {
        const p = 0;
        const v = 5;
        const deceleration = 1;
        const deltaTime = 2;
        const bounds = new RangeBounds({ min: -4.5, max: 4.5 });
        const bounceLoss = 0.5;
        const { velocity, value } = decelerateValue(
          p, v, deceleration, deltaTime, bounds, bounceLoss,
        );
        // After 1s, s = 4.5 and v = 4.
        // Boundary is at 4.5
        // So at boundary, new v will be 4 * 0.5 = 2
        // Over the next second, s will be:
        //    = 2 * 1 - 0.5 * 1 * 1 * 1 = 1.5
        //    and v will reduce from 2 to 1
        // Therefore final position will be 4.5 - 1.5 = 3
        expect(round(velocity)).toBe(-1);
        expect(round(value)).toEqual(3);
      });
    });
  });
});
describe('Decelerate Point', () => {
  describe('No Bounds', () => {
    test('Along x from origin, 1s', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 1 = 4
      expect(round(velocity.toPolar().mag)).toBe(4);
      // s = vt + 0.5 * at^2
      // s = 5 * 1 - 0.5 * 1 * 1^2 = 5 - 0.5 = 4.5
      expect(position.round()).toEqual(new Point(4.5, 0));
    });
    test('Along x from point, 1s', () => {
      const p = new Point(1, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 1 = 4
      expect(round(velocity.toPolar().mag)).toBe(4);
      // s = vt + 0.5 * at^2
      // s = 5 * 1 - 0.5 * 1 * 1^2 = 5 - 0.5 = 4.5
      expect(position.round()).toEqual(new Point(5.5, 0));
    });
    test('Along y from point, 1s', () => {
      const p = new Point(0, 1);
      const v = new Point(0, 5);
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 1 = 4
      expect(round(velocity.toPolar().mag)).toBe(4);
      // s = vt + 0.5 * at^2
      // s = 5 * 1 - 0.5 * 1 * 1^2 = 5 - 0.5 = 4.5
      expect(position.round()).toEqual(new Point(0, 5.5));
    });
    test('Along x from origin, till Stop', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const deltaTime = 5;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      // v1 = v0 - a * t = 5 - 1 * 5 = 0
      expect(round(velocity.toPolar().mag)).toBe(0);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(position.round()).toEqual(new Point(12.5, 0));
    });
    test('Along x from origin, till after Stop', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const deltaTime = 10;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      // Max deltaTime = v0 / a = 5 / 1 = 5
      // v1 = v0 - a * t = 5 - 1 * 5 = 0
      expect(round(velocity.toPolar().mag)).toBe(0);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(position.round()).toEqual(new Point(12.5, 0));
    });
    test('Along 45º, 1s', () => {
      const p = new Point(1, 1);
      const v = new Point(5 * 0.707107, 5 * 0.707107);
      const deceleration = 1;
      const deltaTime = 1;
      const { velocity, position } = deceleratePoint(p, v, deceleration, deltaTime);
      expect(round(velocity.toPolar().mag)).toBe(4);
      const xy = round(4.5 * Math.cos(Math.PI / 4), 3);
      expect(position.round(3)).toEqual(new Point(xy + 1, xy + 1));
    });
    test('Along x from origin with zero velocity threshold used', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const zeroVelocityThreshold = 0.1;
      const deltaTime = 10;
      const { velocity, position } = deceleratePoint(
        p, v, deceleration, deltaTime, null, 0, zeroVelocityThreshold,
      );
      expect(round(velocity.toPolar().mag)).toBe(0);
      // maxDeltaTime = dV / q = 4.9
      // s = vt + 0.5 * at^2
      // s = 5 * 4.9 - 0.5 * 1 * 4.9^2 = 25 - 12.5 = 12.5
      expect(position.round()).toEqual(new Point(12.495, 0));
    });
    test('Along x from origin with zero velocity threshold unused', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const zeroVelocityThreshold = 0.1;
      const deltaTime = 1;
      const { velocity, position } = deceleratePoint(
        p, v, deceleration, deltaTime, null, 0, zeroVelocityThreshold,
      );
      expect(round(velocity.toPolar().mag)).toBe(4);
      // s = v*t + 0.5 * at^2 = 4.9
      // s = 5 * 4.9 - 0.5 * 1 * 4.9^2 = 12.495
      expect(position.round()).toEqual(new Point(4.5, 0));
    });
    describe('Rect Bounds', () => {
      test('X single bounce, no loss', () => {
        const p = new Point(0, 0);
        const v = new Point(5, 0);
        const deceleration = 1;
        const deltaTime = 2;
        // const bounds = new RectBounds({ left: -4.5, bottom: -1, right: 4.5, top: 1 });
        const bounds = new RectBounds({
          left: -4.5, bottom: -1, right: 4.5, top: 1,
        });
        const bounceLoss = 0;
        const { velocity, position } = deceleratePoint(
          p, v, deceleration, deltaTime, bounds, bounceLoss,
        );
        // s = v0*t + 0.5*acc*t^2
        //   = 5 * 2 + 0.5 * 1 * 2 * 2 = 10 - 2 = 8
        // Total displacement = 8
        // For v0 = 5, acc = -1, after 1s, the displaycement will be:
        // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
        // Therefore end point will be 4.5 - (8 - 4.5) = 1
        expect(round(velocity.toPolar().mag)).toBe(3);
        expect(position.round()).toEqual(new Point(1, 0));
      });
      test('X single bounce, 0.5 loss', () => {
        const p = new Point(0, 0);
        const v = new Point(5, 0);
        const deceleration = 1;
        const deltaTime = 2;
        const bounds = new RectBounds({
          left: -4.5, bottom: -1, right: 4.5, top: 1,
        });
        const bounceLoss = 0.5;
        const { velocity, position } = deceleratePoint(
          p, v, deceleration, deltaTime, bounds, bounceLoss,
        );
        // After 1s, s = 4.5 and v = 4.
        // Boundary is at 4.5
        // So at boundary, new v will be 4 * 0.5 = 2
        // Over the next second, s will be:
        //    = 2 * 1 - 0.5 * 1 * 1 * 1 = 1.5
        //    and v will reduce from 2 to 1
        // Therefore final position will be 4.5 - 1.5 = 3
        expect(round(velocity.toPolar().mag)).toBe(1);
        expect(position.round()).toEqual(new Point(3, 0));
      });
    });
  });
});
describe('Calculate Stop', () => {
  describe('No Bounds', () => {
    test('Along x from origin', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const { duration, position } = deceleratePoint(p, v, deceleration);
      expect(duration).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 5 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(position.round()).toEqual(new Point(12.5, 0));
    });
    test('Along x from point', () => {
      const p = new Point(1, 1);
      const v = new Point(-5, 0);
      const deceleration = 1;
      const { duration, position } = deceleratePoint(p, v, deceleration);
      expect(duration).toBe(5);
      expect(position.round()).toEqual(new Point(-12.5 + 1, 1));
    });
    test('Along y from point', () => {
      const p = new Point(1, 1);
      const v = new Point(0, -10);
      const deceleration = 2;
      const { duration, position } = deceleratePoint(p, v, deceleration);
      expect(duration).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 2 * 5^2 = 50 - 25 = 25
      expect(position.round()).toEqual(new Point(1, -25 + 1));
    });
    test('Along 45º', () => {
      const p = new Point(1, 1);
      const v = new Point(5 * 0.707107, 5 * 0.707107);
      const deceleration = 1;
      const { duration, position } = deceleratePoint(p, v, deceleration);
      expect(round(duration, 3)).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      const xy = round(12.5 * Math.cos(Math.PI / 4), 3);
      expect(position.round(3)).toEqual(new Point(xy + 1, xy + 1));
    });
    test('Simulate Rotation', () => {
      // where x is the rotation
      const p = new Point(0, 0);
      const v = new Point(5, 0); // 5 rad/s
      const deceleration = 1; // 1 rad/s/s
      const { duration, position } = deceleratePoint(p, v, deceleration);
      expect(round(duration, 3)).toBe(5);
      // s = vt + 0.5 * at^2
      // s = 10 * 5 - 0.5 * 1 * 5^2 = 25 - 12.5 = 12.5
      expect(position.round(3)).toEqual(new Point(12.5, 0)); // 12.5 rad
    });
    test('Along x from origin with zero velocity threshold', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const zeroVelocityThreshold = 0.1;
      const { duration, position } = deceleratePoint(
        p, v, deceleration, null, null, 0, zeroVelocityThreshold,
      );
      expect(duration).toBe(4.9);
      // s = v*t + 0.5 * at^2 = 4.9
      // s = 5 * 4.9 - 0.5 * 1 * 4.9^2 = 12.495
      expect(position.round()).toEqual(new Point(12.495, 0));
    });
  });
  describe('Rect Bounds', () => {
    test('X single bounce, no loss', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new RectBounds({
        left: -4.5, bottom: -1, right: 4.5, top: 1,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(
        p, v, deceleration, null, bounds, bounceLoss,
      );
      // Total displacement = 12.5
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.5 - 4.5) = -3.5
      expect(duration).toBe(5);
      expect(position.round()).toEqual(new Point(-3.5, 0));
    });
    test('X single bounce, no loss, zero velocity threshold', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new RectBounds({
        left: -4.5, bottom: -1, right: 4.5, top: 1,
      });
      const bounceLoss = 0;
      const zeroVelocityThreshold = 0.1;
      const { duration, position } = deceleratePoint(
        p, v, deceleration, null, bounds, bounceLoss, zeroVelocityThreshold,
      );
      // Total displacement = 12.495
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.495 - 4.5) = -3.5
      expect(duration).toBe(4.9);
      expect(position.round()).toEqual(new Point(-3.495, 0));
    });
    test('X single bounce, 0.5 loss', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new RectBounds({
        left: -4.5, bottom: -1, right: 4.5, top: 1,
      });
      const bounceLoss = 0.5;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
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
      const bounds = new RectBounds({
        left: -6, bottom: -1, right: 6, top: 1,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
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
      const bounds = new RectBounds({
        left: -4.5, bottom: -4.5, right: 4.5, top: 4.5,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
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
      const bounds = new RectBounds({
        left: -5.6568542494, bottom: -100, right: 5.6568542494, top: 100,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
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
        const bounds = new RectBounds({
          left: -100, bottom: -5.6568542494, right: 100, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(8.839, 5.657 - 3.182).round(3));
      });
      test('45º single bounce corner, no loss', () => {
        const v = new Point(5 * 0.70710678, 5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -5.6568542494, right: 5.6568542494, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(5.657 - 3.182, 5.657 - 3.182).round(3));
      });
      test('135º single bounce top, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new RectBounds({
          left: -100, bottom: -5.6568542494, right: 100, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-8.839, 5.657 - 3.182).round(3));
      });
      test('135º single bounce left, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -100, right: 5.6568542494, top: 100,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), 8.839).round(3));
      });
      test('135º single bounce corner, no loss', () => {
        const v = new Point(-5 * 0.70710678, 5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -5.6568542494, right: 5.6568542494, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), 5.657 - 3.182).round(3));
      });
      test('225º single bounce top, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -100, bottom: -5.6568542494, right: 100, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-8.839, -(5.657 - 3.182)).round(3));
      });
      test('225º single bounce left, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -100, right: 5.6568542494, top: 100,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), -8.839).round(3));
      });
      test('225º single bounce corner, no loss', () => {
        const v = new Point(-5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -5.6568542494, right: 5.6568542494, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(-(5.657 - 3.182), -(5.657 - 3.182)).round(3));
      });
      test('315º single bounce top, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -100, bottom: -5.6568542494, right: 100, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point(8.839, -(5.657 - 3.182)).round(3));
      });
      test('315º single bounce left, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -100, right: 5.6568542494, top: 100,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point((5.657 - 3.182), -8.839).round(3));
      });
      test('315 single bounce corner, no loss', () => {
        const v = new Point(5 * 0.70710678, -5 * 0.70710678);
        const bounds = new RectBounds({
          left: -5.6568542494, bottom: -5.6568542494, right: 5.6568542494, top: 5.6568542494,
        });
        const { duration, position } = deceleratePoint(
          p, v, deceleration, null, bounds, bounceLoss,
        );
        expect(round(duration, 3)).toBe(5);
        expect(position.round(3)).toEqual(new Point((5.657 - 3.182), -(5.657 - 3.182)).round(3));
      });
    });
  });
  describe('Line Bounds', () => {
    test('No bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new LineBounds({
        p1: [0, 0],
        mag: 100,
        angle: 0,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(
        p, v, deceleration, null, bounds, bounceLoss,
      );
      // Total displacement = 12.5
      expect(duration).toBe(5);
      expect(position.round(3)).toEqual(new Point(12.5, 0));
    });
    test('One bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 0);
      const deceleration = 1;
      const bounds = new LineBounds({
        p1: [-4.5, 0],
        mag: 9,
        angle: 0,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
      // Total displacement = 12.5
      // For v0 = 5, acc = -1, after 1s, the displaycement will be:
      // s = v0*t + 0.5*acc*t^2 = 5 - 0.5 = 4.5
      // Therefore end point will be 4.5 - (12.5 - 4.5) = -3.5
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds.boundary);
      expect(shaddow.round(4)).toEqual(new Point(-3.5, 0));
    });
    test('45º No bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 5);
      const deceleration = 1;
      const bounds = new LineBounds({
        p1: [-100, 0],
        mag: 200,
        angle: 0,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds.boundary);
      expect(shaddow.round(3)).toEqual(new Point(12.5, 0));
    });
    test('45º One bounce', () => {
      const p = new Point(0, 0);
      const v = new Point(5, 5);
      const deceleration = 1;
      const bounds = new LineBounds({
        p1: [-4.5, 0],
        mag: 9,
        angle: 0,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
      expect(duration).toBe(5);
      const shaddow = position.getShaddowOnLine(bounds.boundary);
      expect(shaddow.round(3)).toEqual(new Point(-3.5, 0));
    });
    test('0º One bounce on 45º line', () => {
      const p = new Point(0, 0);
      const v = new Point(5 * Math.sqrt(2), 0);
      const deceleration = 1;
      const f = 4.5 / Math.sqrt(2);
      const bounds = new LineBounds({
        p1: [-f, -f],
        mag: 9,
        angle: Math.PI / 4,
      });
      const bounceLoss = 0;
      const { duration, position } = deceleratePoint(p, v, deceleration, null, bounds, bounceLoss);
      expect(duration).toBe(5);
      // const xDistance = 12.5;
      const _4_5 = 4.5 * Math.cos(Math.PI / 4);
      const _8 = 8 * Math.cos(Math.PI / 4);
      expect(position.round(3)).toEqual(new Point(
        _4_5 - _8,
        _4_5 - _8,
      ).round(3));
    });
  });
});
describe('Decelerate Transform', () => {
  test('Position Only - decelerate over 1s, no bounds', () => {
    const t = new Transform().translate(0, 0);
    const v = new Transform().translate(5, 0);
    const d = [1];
    const z = [0];
    const bounceLoss = [0];
    // const bounds = [new RectBounds({ left: -4.5, bottom: -1, right: 4.5, top: 1 })];
    const bounds = [null];
    const deltaTime = 1;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(deltaTime);
    expect(result.velocity.t().round()).toEqual(new Point(4, 0));
    expect(result.transform.t().round()).toEqual(new Point(4.5, 0));
  });
  test('Position Only - decelerate till end, no bounds', () => {
    const t = new Transform().translate(0, 0);
    const v = new Transform().translate(5, 0);
    const d = [1];
    const z = [0];
    const bounceLoss = [0];
    // const bounds = [new RectBounds({ left: -4.5, bottom: -1, right: 4.5, top: 1 })];
    const bounds = [null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(5);
    expect(result.velocity.t().round()).toEqual(new Point(0, 0));
    expect(result.transform.t().round()).toEqual(new Point(12.5, 0));
  });
  test('Position Only - decelerate till end, one bounce with 0.5 loss', () => {
    const t = new Transform().translate(0, 0);
    const v = new Transform().translate(5, 0);
    const d = [1];
    const z = [0];
    const bounceLoss = [0.5];
    const bounds = [new RectBounds({
      left: -4.5, bottom: -1, right: 4.5, top: 1,
    })];
    // const bounds = [null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(3);
    expect(result.velocity.t().round()).toEqual(new Point(0, 0));
    expect(result.transform.t().round()).toEqual(new Point(2.5, 0));
  });
  test('Position Only - decelerate 2s, one bounce with 0.5 loss', () => {
    const t = new Transform().translate(0, 0);
    const v = new Transform().translate(5, 0);
    const d = [1];
    const z = [0];
    const bounceLoss = [0.5];
    const bounds = [new RectBounds({
      left: -4.5, bottom: -1, right: 4.5, top: 1,
    })];
    // const bounds = [null];
    const deltaTime = 2;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round()).toEqual(new Point(-1, 0));
    expect(result.transform.t().round()).toEqual(new Point(3, 0));
  });
  test('Position and Rotation - Equal, no bounds - find duration', () => {
    const t = new Transform().rotate(0).translate(0, 0);
    const v = new Transform().rotate(5).translate(5, 0);
    const d = [1, 1];
    const z = [0, 0];
    const bounceLoss = [0, 0];
    const bounds = [null, null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(5);
    expect(result.velocity.t().round()).toEqual(new Point(0, 0));
    expect(round(result.velocity.r())).toEqual(0);
    expect(result.transform.t().round()).toEqual(new Point(12.5, 0));
    expect(round(result.transform.r())).toEqual(12.5);
  });
  test('Position and Rotation - Unequal, no bounds - find duration', () => {
    const t = new Transform().rotate(0).translate(0, 0);
    const v = new Transform().rotate(5).translate(1, 0);
    const d = [1, 1];
    const z = [0, 0];
    const bounceLoss = [0, 0];
    const bounds = [null, null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(5);
    expect(result.velocity.t().round()).toEqual(new Point(0, 0));
    expect(round(result.velocity.r())).toEqual(0);
    expect(result.transform.t().round()).toEqual(new Point(0.5, 0));
    expect(round(result.transform.r())).toEqual(12.5);
  });
  test('Position and Rotation - Unequal, no bounds - 2s', () => {
    const t = new Transform().rotate(0).translate(0, 0);
    const v = new Transform().rotate(5).translate(3, 0);
    const d = [1, 1];
    const z = [0, 0];
    const bounceLoss = [0, 0];
    const bounds = [null, null];
    const deltaTime = 2;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round()).toEqual(new Point(1, 0));
    expect(round(result.velocity.r())).toEqual(3);
    expect(result.transform.t().round()).toEqual(new Point(4, 0));
    expect(round(result.transform.r())).toEqual(8);
  });
  test('Position and Rotation - Unequal, bounce', () => {
    const t = new Transform().rotate(0).translate(0, 0);
    const v = new Transform().rotate(10).translate(5, 0);
    const d = [1, 1];
    const z = [0, 0];
    const bounceLoss = [0, 0];
    const bounds = [
      new RangeBounds({ min: -5, max: 5 }),
      new RectBounds({
        left: -4.5, bottom: -1, right: 4.5, top: 1,
      })];
    const deltaTime = 2;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    // After 2s, rotation: v = 8m / s
    //           displacement: s = 10 * 2 - 0.5 * 4 = 18
    // After 2s, translation: v = 3m / s
    //           displacement: s = 5 * 2 - 0.5 * 4 = 8
    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round()).toEqual(new Point(-3, 0));
    expect(round(result.velocity.r())).toEqual(8);
    expect(result.transform.t().round()).toEqual(new Point(1, 0));
    expect(round(result.transform.r())).toEqual(-2);
  });
  test('Position, Scale Rotation - no bounce', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5, 5);
    const d = [1, 1, 1];
    const z = [0, 0, 0];
    const bounceLoss = [0, 0, 0];
    const bounds = [null, null, null];
    const deltaTime = 1;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);

    expect(round(result.duration)).toBe(1);
    expect(result.velocity.t().round(3)).toEqual(new Point(4.293, 4.293));
    expect(result.velocity.s().round()).toEqual(new Point(4, 4));
    expect(round(result.velocity.r())).toEqual(4);
    expect(result.transform.t().round(3)).toEqual(new Point(4.646, 4.646));
    // scale starts at 1
    expect(result.transform.s().round()).toEqual(new Point(5.5, 5.5));
    expect(round(result.transform.r())).toEqual(4.5);
  });
  test('Position, Scale Rotation - bounce', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5, 5);
    const d = [1, 1, 1];
    const z = [0, 0, 0];
    const bounceLoss = [0, 0, 0];
    const bounds = [
      new RectBounds({
        left: -5.5, bottom: -5.5, right: 5.5, top: 5.5,
      }),
      new RangeBounds({ min: -4.5, max: 4.5 }),
      new RectBounds({
        left: -4.5, bottom: -4.5, right: 4.5, top: 4.5,
      }),
    ];
    // const bounds = [null, null, null];
    const deltaTime = 2;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);

    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round(3)).toEqual(new Point(-3.586, -3.586));
    expect(result.velocity.s().round()).toEqual(new Point(-3, -3));
    expect(round(result.velocity.r())).toEqual(-3);
    expect(result.transform.t().round(3)).toEqual(new Point(0.414, 0.414));
    // scale starts at 1
    expect(result.transform.s().round()).toEqual(new Point(2, 2));
    expect(round(result.transform.r())).toEqual(1);
  });
  test('Position, Scale Rotation - bounce with loss', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5 / Math.sqrt(2), 5 / Math.sqrt(2));
    const d = [1, 1, 1];
    const z = [0, 0, 0];
    const bounceLoss = [0.2, 0.3, 0.4];
    const bounds = [
      new RectBounds({
        left: -5.5, bottom: -5.5, right: 5.5, top: 5.5,
      }),
      new RangeBounds({ min: -4.5, max: 4.5 }),
      new RectBounds({
        left: -4.5 / Math.sqrt(2),
        bottom: -4.5 / Math.sqrt(2),
        right: 4.5 / Math.sqrt(2),
        top: 4.5 / Math.sqrt(2),
      }),
    ];
    // const bounds = [null, null, null];
    const deltaTime = 2;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);

    // Position - bounceLoss 0.4
    // v0 = 5
    // after 1s: At corner, v = 4, bounceV = 4 * 0.6 = 2.4
    // s = 2.4 * 1 - 0.5 * 1 * 1 = 1.9
    // From origin  = 4.5 - 1.9 = 3.1
    //
    // Scale - bounceLoss 0.2
    // v0 = 5
    // after 1s: v = 4 * 0.8 = 3.2
    // s = 3.2 * 1 - 0.5 * 1 * 1^2 = 2.7
    // From origin: 5.5 - 3.2 = 1.8
    //
    // Rotation - bounceLoss 0.3
    // v0 = 5
    // after 1s: v = 4 * 0.7 = 2.8
    // s = 2.8 * 1 - 0.5 * 1 * 1^2 = 2.3
    // From origin: 4.5 - 2.3 = 2.2
    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round(3))
      .toEqual(new Point(-1.4 / Math.sqrt(2), -1.4 / Math.sqrt(2)).round(3));
    expect(result.velocity.s().round()).toEqual(new Point(-2.2, -2.2));
    expect(round(result.velocity.r())).toEqual(-1.8);
    expect(result.transform.t().round(3))
      .toEqual(new Point(2.6 / Math.sqrt(2), 2.6 / Math.sqrt(2)).round(3));
    expect(result.transform.s().round()).toEqual(new Point(2.8, 2.8));
    expect(round(result.transform.r())).toEqual(2.2);
  });
  test('Position, Scale Rotation - Change z', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5 / Math.sqrt(2), 5 / Math.sqrt(2));
    const d = [1, 1, 1];
    const z = [0.2, 0.1, 0.3];
    const bounceLoss = [0, 0, 0];
    const bounds = [null, null, null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    // Position
    // v0 = 5
    // DeltaV = 4.7
    // TimeToZero = 4.7
    // s = 5 * 4.7 - 0.5 * 1 * 4.7**2 = 12.455
    //
    //
    // Scale
    // v0 = 5
    // DeltaV = 4.8
    // TimeToZero = 4.8
    // s = 5 * 4.8 - 0.5 * 1 * 4.8**2 = 12.48 + 1
    //
    // Rotation
    // v0 = 5
    // DeltaV = 4.9
    // TimeToZero = 4.9
    // s = 5 * 4.9 - 0.5 * 1 * 4.9**2 = 12.495
    expect(round(result.duration)).toBe(4.9);
    expect(result.velocity.t().round(3))
      .toEqual(new Point(0, 0).round(3));
    expect(result.velocity.s().round()).toEqual(new Point(0, 0));
    expect(round(result.velocity.r())).toEqual(0);
    expect(result.transform.t().round(3))
      .toEqual(new Point(12.455 / Math.sqrt(2), 12.455 / Math.sqrt(2)).round(3));
    expect(result.transform.s().round()).toEqual(new Point(13.48, 13.48));
    expect(round(result.transform.r())).toEqual(12.495);
  });
  test('Position, Scale Rotation - Change d', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5 / Math.sqrt(2), 5 / Math.sqrt(2));
    const d = [0.9, 0.8, 0.7];
    const z = [0, 0, 0];
    const bounceLoss = [0, 0, 0];
    const bounds = [null, null, null];
    const deltaTime = null;
    const result = decelerateTransform(t, v, d, deltaTime, bounds, bounceLoss, z);
    // Position
    // v0 = 5
    // TimeToZero = t = 5 / 0.7 = 7.143
    // s = 5 * t - 0.5 * 0.7 * t**2 = 17.857
    //
    //
    // Scale
    // v0 = 5
    // TimeToZero = t = 5 / 0.9 = 6.25
    // s = 5 * t - 0.5 * 0.8 * t**2 = 15.625
    //
    // Rotation
    // v0 = 5
    // TimeToZero = t = 5 / 0.8 = 5.556
    // s = 5 * t - 0.5 * 0.9 * t**2 = 13.889 + 1
    expect(round(result.duration, 3)).toBe(7.143);
    expect(result.velocity.t().round(3))
      .toEqual(new Point(0, 0).round(3));
    expect(result.velocity.s().round()).toEqual(new Point(0, 0));
    expect(round(result.velocity.r())).toEqual(0);
    expect(result.transform.t().round(3))
      .toEqual(new Point(17.857 / Math.sqrt(2), 17.857 / Math.sqrt(2)).round(3));
    expect(result.transform.s().round(3)).toEqual(new Point(14.889, 14.889));
    expect(round(result.transform.r())).toEqual(15.625);
  });
});
describe('Decelerate Transform from Transform', () => {
  test('Position, Scale, Rotation No Bounds', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5, 5);
    const d = { position: 1, scale: 1, rotation: 1 };
    const z = { position: 0, scale: 0, rotation: 0 };
    const bounceLoss = { position: 0, scale: 0, rotation: 0 };
    const bounds = {};
    const deltaTime = 1;
    const result = t.decelerate(v, d, deltaTime, bounds, bounceLoss, z);

    expect(round(result.duration)).toBe(1);
    expect(result.velocity.t().round(3)).toEqual(new Point(4.293, 4.293));
    expect(result.velocity.s().round()).toEqual(new Point(4, 4));
    expect(round(result.velocity.r())).toEqual(4);
    expect(result.transform.t().round(3)).toEqual(new Point(4.646, 4.646));
    // scale starts at 1
    expect(result.transform.s().round()).toEqual(new Point(5.5, 5.5));
    expect(round(result.transform.r())).toEqual(4.5);
  });
  test('Position, Scale Rotation - bounce', () => {
    const t = new Transform().scale(1, 1).rotate(0).translate(0, 0);
    const v = new Transform().scale(5, 5).rotate(5).translate(5, 5);
    const d = { position: 1, scale: 1, rotation: 1 };
    const z = { position: 0, scale: 0, rotation: 0 };
    const bounceLoss = { position: 0, scale: 0, rotation: 0 };
    const bounds = {
      scale: new RectBounds({
        left: -5.5, bottom: -5.5, right: 5.5, top: 5.5,
      }),
      rotation: new RangeBounds({ min: -4.5, max: 4.5 }),
      position: new RectBounds({
        left: -4.5, bottom: -4.5, right: 4.5, top: 4.5,
      }),
    };
    // const bounds = [null, null, null];
    const deltaTime = 2;
    const result = t.decelerate(v, d, deltaTime, bounds, bounceLoss, z);

    expect(round(result.duration)).toBe(2);
    expect(result.velocity.t().round(3)).toEqual(new Point(-3.586, -3.586));
    expect(result.velocity.s().round()).toEqual(new Point(-3, -3));
    expect(round(result.velocity.r())).toEqual(-3);
    expect(result.transform.t().round(3)).toEqual(new Point(0.414, 0.414));
    // scale starts at 1
    expect(result.transform.s().round()).toEqual(new Point(2, 2));
    expect(round(result.transform.r())).toEqual(1);
  });
});
