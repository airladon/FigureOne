import {
  getPoints,
} from './Point';
import {
  pointsToNumbers,
  pointsToNumbers2,
  numbersToPoints,
} from './tools';

describe('geometry tools', () => {
  describe('pointsToNumbers2', () => {
    test('3 element', () => {
      expect(pointsToNumbers2(getPoints([[0, 1], [2, 3], [4, 5]])))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });
    test('1 element', () => {
      expect(pointsToNumbers2(getPoints([[2, 3]])))
        .toEqual([2, 3]);
    });
    test('0 element', () => {
      expect(pointsToNumbers2([]))
        .toEqual([]);
    });
  });
  describe('pointsToNumbers', () => {
    test('3 element 2D', () => {
      expect(pointsToNumbers(getPoints([[0, 1], [2, 3], [4, 5]])))
        .toEqual([0, 1, 0, 2, 3, 0, 4, 5, 0]);
    });
    test('3 element 3D', () => {
      expect(pointsToNumbers(getPoints([[0, 1, 2], [3, 4, 5], [6, 7, 8]])))
        .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
    test('1 element', () => {
      expect(pointsToNumbers(getPoints([[2, 3, 4]])))
        .toEqual([2, 3, 4]);
    });
    test('0 element', () => {
      expect(pointsToNumbers([]))
        .toEqual([]);
    });
  });
  describe('numbersToPoints', () => {
    test('3 element 2D', () => {
      expect(numbersToPoints([0, 1, 0, 2, 3, 0, 4, 5, 0]))
        .toEqual(getPoints([[0, 1], [2, 3], [4, 5]]));
    });
    test('3 element 3D', () => {
      expect(numbersToPoints([0, 1, 2, 3, 4, 5, 6, 7, 8]))
        .toEqual(getPoints([[0, 1, 2], [3, 4, 5], [6, 7, 8]]));
    });
    test('1 element', () => {
      expect(numbersToPoints([2, 3, 4]))
        .toEqual(getPoints([[2, 3, 4]]));
    });
    test('0 element', () => {
      expect(numbersToPoints([]))
        .toEqual([]);
    });
  });
  describe('numbersToPoints 2D', () => {
    test('3 element', () => {
      expect(numbersToPoints([0, 1, 2, 3, 4, 5], 2))
        .toEqual(getPoints([[0, 1], [2, 3], [4, 5]]));
    });
    test('1 element', () => {
      expect(numbersToPoints([2, 3], 2))
        .toEqual(getPoints([[2, 3]]));
    });
    test('0 element', () => {
      expect(numbersToPoints([], 2))
        .toEqual([]);
    });
  });
});
