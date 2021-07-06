import {
  getPoints,
} from './Point';
import {
  pointsToArray,
  pointsToArray2,
} from './tools';

describe('geometry tools', () => {
  describe('pointsToArray2', () => {
    test('3 element', () => {
      expect(pointsToArray2(getPoints([[0, 1], [2, 3], [4, 5]])))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });
    test('1 element', () => {
      expect(pointsToArray2(getPoints([[2, 3]])))
        .toEqual([2, 3]);
    });
    test('0 element', () => {
      expect(pointsToArray2([]))
        .toEqual([]);
    });
  });
  describe('pointsToArray', () => {
    test('3 element 2D', () => {
      expect(pointsToArray(getPoints([[0, 1], [2, 3], [4, 5]])))
        .toEqual([0, 1, 0, 2, 3, 0, 4, 5, 0]);
    });
    test('3 element 3D', () => {
      expect(pointsToArray(getPoints([[0, 1, 2], [3, 4, 5], [6, 7, 8]])))
        .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
    test('1 element', () => {
      expect(pointsToArray(getPoints([[2, 3, 4]])))
        .toEqual([2, 3, 4]);
    });
    test('0 element', () => {
      expect(pointsToArray([]))
        .toEqual([]);
    });
  });
});
