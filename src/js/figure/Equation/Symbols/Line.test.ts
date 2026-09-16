import {
  Point, getBoundingRect,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

// Vertices of the symbol's generated geometry in draw space
const drawVertices = (element) => {
  const { points } = element.drawingObject;
  const vertices = [];
  for (let i = 0; i < points.length; i += 2) {
    vertices.push(new Point(points[i], points[i + 1]));
  }
  return vertices;
};

describe('Equation Symbols - Line', () => {
  let figure;
  let eqn;
  let length;
  beforeEach(() => {
    figure = makeFigure();
    length = 0.19;
    eqn = new Equation(figure.shapes, { color: [0.95, 0, 0, 1] });
    eqn.addElements({
      plain: { symbol: 'line', width: 0.01 },
      arrow: { symbol: 'line', width: 0.01, arrow: 'triangle' },
    });
    figure.add(eqn);
  });
  describe.each`
    name        | angle
    ${'right'}  | ${0}
    ${'up'}     | ${Math.PI / 2}
    ${'left'}   | ${Math.PI}
    ${'down'}   | ${-Math.PI / 2}
    ${'diag'}   | ${Math.PI / 4}
    ${'-diag'}  | ${-Math.PI / 3}
  `('$name ($angle rad)', ({ angle }) => {
    test.each(['plain', 'arrow'])('%s border encloses geometry', (name) => {
      const element = eqn[`_${name}`];
      element._custom.setSize(new Point(0.5, 0.3), angle, length);
      figure.setFirstTransform();

      const vertices = drawVertices(element);
      expect(vertices.length).toBeGreaterThan(0);
      const geometry = getBoundingRect(vertices);
      const border = element.getBoundingRect('draw');

      // The border encloses the geometry...
      expect(round(border.left)).toBeLessThanOrEqual(round(geometry.left));
      expect(round(border.bottom)).toBeLessThanOrEqual(round(geometry.bottom));
      expect(round(border.right)).toBeGreaterThanOrEqual(round(geometry.right));
      expect(round(border.top)).toBeGreaterThanOrEqual(round(geometry.top));

      // ...and does not extend beyond it. Angle and length are not
      // rectangular dimensions.
      expect(round(border.left)).toBe(round(geometry.left));
      expect(round(border.bottom)).toBe(round(geometry.bottom));
      expect(round(border.right)).toBe(round(geometry.right));
      expect(round(border.top)).toBe(round(geometry.top));
    });

    test('figure space bounds match transformed vertices', () => {
      const element = eqn._arrow;
      const location = new Point(0.5, 0.3);
      element._custom.setSize(location, angle, length);
      figure.setFirstTransform();

      const matrix = element.spaceTransformMatrix('draw', 'figure');
      const geometry = getBoundingRect(drawVertices(element).map(p => p.transformBy(matrix)));
      const border = element.getBoundingRect('figure');
      expect(round(border.left)).toBe(round(geometry.left));
      expect(round(border.bottom)).toBe(round(geometry.bottom));
      expect(round(border.right)).toBe(round(geometry.right));
      expect(round(border.top)).toBe(round(geometry.top));
    });
  });

  test('line thickness is included in the border', () => {
    const element = eqn._plain;
    element._custom.setSize(new Point(0, 0), Math.PI / 2, length);
    figure.setFirstTransform();
    const border = element.getBoundingRect('draw');
    // A vertical 0.01 wide line spans 0.01 horizontally, not `angle`
    expect(round(border.width)).toBe(0.01);
    expect(round(border.height)).toBe(round(length));
  });
});
