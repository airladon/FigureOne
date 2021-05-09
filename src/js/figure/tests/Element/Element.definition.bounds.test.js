import {
  TransformBounds, Rect,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Move Freely', () => {
  let figure;
  let add;
  let a;
  let check;
  let updateBounds;
  beforeEach(() => {
    const bounds = {
      rectBoundsDefinition: {
        bounds: {
          translation: {
            left: -2, bottom: -1, right: 3, top: 4,
          },
        },
      },
      rangeBoundsDefinition: {
        bounds: {
          translation: {
            min: -3, max: 2,
          },
        },
      },
      // Limit to figure boundary reduced by the shape size
      figure: {
        bounds: 'figure',
      },
      // Rect
      rect: {
        bounds: {
          translation: new Rect(-4, -3, 9, 10),
        },
      },
      unit: {
        bounds: {
          translation: {
            left: -1, bottom: -1, right: 1, top: 1,
          },
        },
      },
    };
    updateBounds = {
      rectBoundsDefinition: () => a.move.bounds.updateTranslation({
        left: -2, bottom: -1, right: 3, top: 4,
      }),
      rangeBoundsDefinition: () => a.move.bounds.updateTranslation({
        min: -3, max: 2,
      }),
      rect: () => a.move.bounds.updateTranslation(new Rect(-4, -3, 9, 10)),
    };
    figure = makeFigure();
    add = (name) => {
      figure.add([
        {
          name: 'a',
          make: 'polygon',
          options: { radius: 0.2, sides: 4 },
          mods: {
            move: bounds[name],
          },
        },
      ]);
      a = figure.elements._a;
      a.setMovable(true);
      // figure.initialize();
    };
    check = (left, bottom, right, top) => {
      const b = a.move.bounds.getTranslation().boundary;
      expect(round(b.left)).toBe(round(left));
      expect(round(b.bottom)).toBe(round(bottom));
      expect(round(b.right)).toBe(round(right));
      expect(round(b.top)).toBe(round(top));
    };
  });
  test('RectBoundsDefinition Object', () => {
    add('rectBoundsDefinition');
    const { bounds } = a.move;
    expect(bounds).toBeInstanceOf(TransformBounds);
    check(-2, -1, 3, 4);
  });
  test('RangeBoundsDefinition Object', () => {
    add('rangeBoundsDefinition');
    const { bounds } = a.move;
    expect(bounds).toBeInstanceOf(TransformBounds);
    check(-3, -3, 2, 2);
  });
  test('Figure', () => {
    add('figure');
    // expect(a.move.bounds).toEqual('figure');
    // a.checkMoveBounds();
    expect(a.move.bounds).toBeInstanceOf(TransformBounds);
    check(-1, -1, 1, 1);
  });
  test('Rect', () => {
    add('rect');
    const { bounds } = a.move;
    expect(bounds).toBeInstanceOf(TransformBounds);
    check(-4, -3, 5, 7);
  });
  test('Update with RectBoundsDefinition', () => {
    add('unit');
    updateBounds.rectBoundsDefinition();
    check(-2, -1, 3, 4);
  });
  test('Update with RangeBoundsDefinition', () => {
    add('unit');
    updateBounds.rangeBoundsDefinition();
    check(-3, -3, 2, 2);
  });
  test('Update with rect', () => {
    add('unit');
    updateBounds.rect();
    check(-4, -3, 5, 7);
  });
});
