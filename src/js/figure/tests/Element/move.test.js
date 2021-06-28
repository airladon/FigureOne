/* eslint-disable object-curly-newline, object-property-newline */
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
  let move;
  describe('2D', () => {
    beforeEach(() => {
      figure = makeFigure();
      move = (options) => {
        a = figure.add({
          name: 'a',
          make: 'polygon',
          radius: 0.5,
          move: options,
        });
      };
    });
    test('Simple', () => {
      move(true);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([1, 1]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([-1, -1]);
      expect(a.getPosition('figure').toArray()).toEqual([-1, -1, 0]);
    });
    test('Translation with no bounds', () => {
      move({
        type: 'translation',
      });
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([1, 1]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([-1, -1]);
      expect(a.getPosition('figure').toArray()).toEqual([-1, -1, 0]);
    });
    test('Translation with bounds', () => {
      move({
        type: 'translation',
        bounds: { left: 1, bottom: 1, right: 2, top: 2 },
      });
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([3, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([2, 0, 0]);
      // Moving back in left direction moves the shape the same delta
      figure.mock.touchMove([2, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([2, -1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, -1, 0]);
      figure.mock.touchMove([2, -2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, -1, 0]);
      figure.mock.touchMove([2, 0.5]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 1.5, 0]);
      figure.mock.touchMove([2, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 2, 0]);
      figure.mock.touchMove([0, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-1, 2, 0]);
      figure.mock.touchMove([-1, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-1, 2, 0]);
      figure.mock.touchMove([0, 2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 0, 0]);
    });
    test('Translation with bounds in XZ with Y offset', () => {
      move({
        type: 'translation',
        plane: [[0, 1, 0], [0, 1, 0]],
        bounds: {
          left: 1, bottom: 1, right: 2, top: 2,
          position: [0, 1, 0], normal: [0, 1, 0], rightDirection: [0, 0, -1],
        },
      });
      figure.mock.touchElement(a, [0, 1, 0]);
      figure.mock.touchMove([1, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 1, 0]);
    });
  });
});
