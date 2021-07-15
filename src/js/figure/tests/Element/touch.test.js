/* eslint-disable object-curly-newline, object-property-newline */
// import {
//   Point, Line, // Rect, RectBounds,
// } from '../../../tools/g2';
// import {
//   round,
// } from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Element Touch 2D', () => {
  let figure;
  let a;
  let b;
  let result;
  beforeEach(() => {
    result = undefined;
    figure = makeFigure();
    figure.add({
      name: 'a',
      make: 'polygon',
      radius: 0.5,
      touch: { onClick: () => { result = 'a'; } },
    });
    b = figure.add({
      name: 'b',
      make: 'polygon',
      radius: 0.5,
      touch: { onClick: () => { result = 'b'; } },
    });
  });
  describe('2D', () => {
    test('Simple', () => {
      expect(result).toBe(undefined);
      figure.mock.touchDown([0, 0]);
      expect(result).toBe('b');
    });
    test('Hide b', () => {
      expect(result).toBe(undefined);
      b.hide();
      figure.mock.touchDown([0, 0]);
      expect(result).toBe('a');
    });
  });
});
