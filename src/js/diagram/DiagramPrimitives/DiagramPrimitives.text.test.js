// import {
//   Point,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Equation Functions - Box', () => {
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements(diagram.elements, [
      {
        name: 'a',
        method: 'text',
        options: {
          text: 'a',
          hAlign: 'left',
          vAlign: 'baseline',
        },
      },
      {
        name: 'c',
        method: 'text',
        options: {
          text: 'c',
          hAlign: 'left',
          vAlign: 'baseline',
          position: [1, 1],
        },
      },
      {
        name: 'container',
        method: 'collection',
        addElements: [
          {
            name: 'a',
            method: 'text',
            options: {
              text: 'a',
              hAlign: 'left',
              vAlign: 'baseline',
              position: [1, 1],
            },
          },
        ],
        options: {
          position: [2, 2],
        },
      },
    ]);
    diagram.setFirstTransform();
  });
  test('Base', () => {
    const a = diagram.elements._a.getBoundingRect('diagram');
    expect(round(a.left)).toBe(0);
    expect(round(a.bottom)).toBe(-0.008);
    expect(round(a.width)).toBe(0.04);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(0.095);
    expect(round(a.right)).toBe(0.04);
  });
  test('Moved', () => {
    const c = diagram.elements._c.getBoundingRect('diagram');
    expect(round(c.left)).toBe(1);
    expect(round(c.bottom)).toBe(1 - 0.008);
    expect(round(c.width)).toBe(0.04);
    expect(round(c.height)).toBe(0.103);
    expect(round(c.top)).toBe(1 + 0.095);
    expect(round(c.right)).toBe(1 + 0.04);
  });
  test('Moved in Collection', () => {
    diagram.elements._container.showAll();
    const container = diagram.elements._container.getBoundingRect('diagram');
    const a = diagram.elements._container._a.getBoundingRect('diagram');
    expect(round(a.left)).toBe(3);
    expect(round(a.bottom)).toBe(3 - 0.008);
    expect(round(a.width)).toBe(0.04);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(3 + 0.095);
    expect(round(a.right)).toBe(3 + 0.04);
    expect(round(container.left)).toBe(3);
    expect(round(container.bottom)).toBe(3 - 0.008);
    expect(round(container.width)).toBe(0.04);
    expect(round(container.height)).toBe(0.103);
    expect(round(container.top)).toBe(3 + 0.095);
    expect(round(container.right)).toBe(3 + 0.04);
  });
});
