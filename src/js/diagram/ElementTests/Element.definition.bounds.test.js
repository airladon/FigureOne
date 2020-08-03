import {
  TransformBounds,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();

describe('Move Freely', () => {
  let diagram;
  let add;
  let a;
  let check;
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
      // Limit to diagram boundary reduced by the shape size
      diagram: {
        bounds: 'diagram',
      },
    };
    diagram = makeDiagram();
    add = (name) => {
      diagram.addElements([
        {
          name: 'a',
          method: 'polygon',
          options: { radius: 0.2, sides: 4 },
          mods: {
            move: bounds[name],
          },
        },
      ]);
      a = diagram.elements._a;
      a.setMovable(true);
      diagram.initialize();
    };
    check = (left, bottom, right, top) => {
      const b = a.move.bounds.getTranslation().boundary;
      expect(round(b.left)).toBe(round(left));
      expect(round(b.bottom)).toBe(round(bottom));
      expect(round(b.right)).toBe(round(right));
      expect(round(b.top)).toBe(round(top));
    }
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
  test('Diagram', () => {
    add('diagram');
    const { bounds } = a.move;
    expect(bounds).toBeInstanceOf(TransformBounds);
    check(-0.8, -0.8, 0.8, 0.8);
  });
});
