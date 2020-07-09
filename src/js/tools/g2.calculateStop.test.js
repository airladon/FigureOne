import {
  Point, calculateStop,
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
});
