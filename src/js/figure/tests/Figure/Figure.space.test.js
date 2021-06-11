import {
  FigureElementCollection,
} from '../../Element';

import * as tools from '../../../tools/tools';
import {
  Point, Transform, Rect,
} from '../../../tools/g2';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

describe('Figure', () => {
  test('1', () => {
    const figure = makeFigure({ limits: [-1, -1, 2, 2] });
    expect(figure.spaceTransformMatrix('figure', 'gl')).toEqual([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ])
  });
});
