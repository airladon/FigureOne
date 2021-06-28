import {
  Point, Line, // Rect, RectBounds,
} from '../../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Element Move', () => {
  let figure;
  let a;
  describe('2D', () => {
    beforeEach(() => {
      figure = makeFigure();
      const a = figure.add({
        name: 'a',
        make: 'polygon',
        radius: 0.5,
      });
    });
    test('No Bounds', () => {
      a.setPosition(100, 0);
      expect(a.getPosition().round(3).x).toBe(100);
    });
});
