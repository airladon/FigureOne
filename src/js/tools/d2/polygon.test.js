import { getPoints } from '../geometry/Point';
import {
  polygon, polygonLine,
} from './polygon';
import { round } from '../math';

describe('polygon geometry tests', () => {
  describe('polygon', () => {
    describe('Corners', () => {
      test('simple', () => {
        const points = polygon({
          sides: 4,
          radius: 2,
        });
        expect(round(points)).toEqual(getPoints([
          [2, 0, 0],
          [0, 2, 0],
          [-2, 0, 0],
          [0, -2, 0],
        ]));
      });
      test('rotated and offset', () => {
        const points = polygon({
          sides: 4,
          radius: Math.sqrt(2),
          rotation: Math.PI / 4,
          position: [1, 1],
        });
        expect(round(points)).toEqual(getPoints([
          [2, 2, 0],
          [0, 2, 0],
          [0, 0, 0],
          [2, 0, 0],
        ]));
      });
      test('rotated and offset, cw', () => {
        const points = polygon({
          sides: 4,
          radius: Math.sqrt(2),
          rotation: Math.PI / 4,
          position: [1, 1],
          direction: -1,
        });
        expect(round(points)).toEqual(getPoints([
          [2, 2, 0],
          [2, 0, 0],
          [0, 0, 0],
          [0, 2, 0],
        ]));
      });
    });
  });
  describe('2D Tris', () => {
    test('simple', () => {
      const points = polygon({
        sides: 4,
        radius: 2,
        tris: 2,
      });
      expect(round(points)).toEqual([
        0, 0, 2, 0, 0, 2,
        0, 0, 0, 2, -2, 0,
        0, 0, -2, 0, 0, -2,
        0, 0, 0, -2, 2, 0,
      ]);
    });
  });
  describe('3D Tris', () => {
    test('simple', () => {
      const points = polygon({
        sides: 4,
        radius: 2,
        tris: 3,
      });
      expect(round(points)).toEqual([
        0, 0, 0, 2, 0, 0, 0, 2, 0,
        0, 0, 0, 0, 2, 0, -2, 0, 0,
        0, 0, 0, -2, 0, 0, 0, -2, 0,
        0, 0, 0, 0, -2, 0, 2, 0, 0,
      ]);
    });
  });
  describe('polygonLine', () => {
    describe('Corners', () => {
      test('simple', () => {
        const points = polygonLine({
          sides: 4,
          radius: 2,
          innerRadius: 1,
        });
        expect(round(points)).toEqual(getPoints([
          [1, 0, 0],
          [2, 0, 0],
          [0, 1, 0],
          [0, 2, 0],
          [-1, 0, 0],
          [-2, 0, 0],
          [0, -1, 0],
          [0, -2, 0],
        ]));
      });
      test('rotated and offset', () => {
        const points = polygonLine({
          sides: 4,
          radius: Math.sqrt(2),
          rotation: Math.PI / 4,
          position: [1, 1],
          innerRadius: Math.sqrt(2) * 0.5,
        });
        expect(round(points)).toEqual(getPoints([
          [1.5, 1.5, 0],
          [2, 2, 0],
          [0.5, 1.5, 0],
          [0, 2, 0],
          [0.5, 0.5, 0],
          [0, 0, 0],
          [1.5, 0.5, 0],
          [2, 0, 0],
        ]));
      });
      test('rotated and offset, cw', () => {
        const points = polygonLine({
          sides: 4,
          radius: Math.sqrt(2),
          innerRadius: Math.sqrt(2) * 0.5,
          rotation: Math.PI / 4,
          position: [1, 1],
          direction: -1,
        });
        expect(round(points)).toEqual(getPoints([
          [1.5, 1.5, 0],
          [2, 2, 0],
          [1.5, 0.5, 0],
          [2, 0, 0],
          [0.5, 0.5, 0],
          [0, 0, 0],
          [0.5, 1.5, 0],
          [0, 2, 0],
        ]));
      });
    });
    describe('2D Tris', () => {
      test('simple', () => {
        const points = polygonLine({
          sides: 4,
          radius: 2,
          innerRadius: 1,
          tris: 2,
        });
        expect(round(points)).toEqual([
          1, 0,
          2, 0,
          0, 2,
          1, 0,
          0, 2,
          0, 1,
          //
          0, 1,
          0, 2,
          -2, 0,
          0, 1,
          -2, 0,
          -1, 0,
          //
          -1, 0,
          -2, 0,
          0, -2,
          -1, 0,
          0, -2,
          0, -1,
          //
          0, -1,
          0, -2,
          2, 0,
          0, -1,
          2, 0,
          1, 0,
        ]);
      });
    });
    describe('3D Tris', () => {
      test('simple', () => {
        const points = polygonLine({
          sides: 4,
          radius: 2,
          innerRadius: 1,
          tris: 3,
        });
        expect(round(points)).toEqual([
          1, 0, 0,
          2, 0, 0,
          0, 2, 0,
          1, 0, 0,
          0, 2, 0,
          0, 1, 0,
          //
          0, 1, 0,
          0, 2, 0,
          -2, 0, 0,
          0, 1, 0,
          -2, 0, 0,
          -1, 0, 0,
          //
          -1, 0, 0,
          -2, 0, 0,
          0, -2, 0,
          -1, 0, 0,
          0, -2, 0,
          0, -1, 0,
          //
          0, -1, 0,
          0, -2, 0,
          2, 0, 0,
          0, -1, 0,
          2, 0, 0,
          1, 0, 0,
        ]);
      });
    });
  });
});
