import { Point } from './Point';
import { rectToPolar, polarToRect } from './coordinates';
import { round } from '../math';

describe('Coordinate Transformations', () => {
  describe('Rect to Polar', () => {
    test('1, 0 as x, y', () => {
      const p = rectToPolar(1, 0);
      expect(p.mag).toBe(1);
      expect(p.angle).toBe(0);
    });
    test('1, 0 as Point', () => {
      const p = rectToPolar(new Point(1, 0));
      expect(p.mag).toBe(1);
      expect(p.angle).toBe(0);
    });
    test('Quadrant 1', () => {
      const p = rectToPolar(1, 1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(Math.PI / 4, 3));
    });
    test('Quadrant 2', () => {
      const p = rectToPolar(-1, 1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(3 * Math.PI / 4, 3));
    });
    test('Quadrant 3', () => {
      const p = rectToPolar(-1, -1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(5 * Math.PI / 4, 3));
    });
    test('Quadrant 4', () => {
      const p = rectToPolar(1, -1);
      expect(round(p.mag, 3)).toBe(round(Math.sqrt(2), 3));
      expect(round(p.angle, 3)).toBe(round(7 * Math.PI / 4, 3));
    });
  });
  describe('Polar to Rect', () => {
    test('Quadrant 1', () => {
      const r = polarToRect(Math.sqrt(2), Math.PI / 4).round(3);
      expect(r).toEqual(new Point(1, 1));
    });
    test('Quadrant 2', () => {
      const r = polarToRect(Math.sqrt(2), 3 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(-1, 1));
    });
    test('Quadrant 3', () => {
      const r = polarToRect(Math.sqrt(2), 5 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(-1, -1));
    });
    test('Quadrant 4', () => {
      const r = polarToRect(Math.sqrt(2), 7 * Math.PI / 4).round(3);
      expect(r).toEqual(new Point(1, -1));
    });
    test('-x axis', () => {
      const r = polarToRect(1, Math.PI).round(3);
      expect(r).toEqual(new Point(-1, 0));
    });
    test('-y axis', () => {
      const r = polarToRect(1, 3 * Math.PI / 2).round(3);
      expect(r).toEqual(new Point(0, -1));
    });
  });
});
