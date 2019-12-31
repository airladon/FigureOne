// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { EquationNew } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Functions - Ann', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      box: {
        symbol: 'box',
        lineWidth: 0.01,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          0: {
            ann: {
              content: 'a',
              annotation: {
                content: 'b',
                yPosition: 'top',
                yAlign: 'bottom',
                xPosition: 'right',
                xAlign: 'left',
              },
            },
          },
          1: {
            ann: {
              content: 'a',
              annotation: {
                content: ['b', 'c'],
                yPosition: 'bottom',
                yAlign: 'top',
              },
            },
          },
          // 2: {
          //   ann: {
          //     content: 'a',
          //     glyphs: {
          //       encompass: {
          //         glyph: 'box',

          //       }
          //     }
          //   },
          // },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Simple Element Annotation', () => {
    functions.single();
    eqn.showForm('0');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    expect(round(a.top)).toBe(round(b.bottom));
    expect(round(a.right)).toBe(round(b.left));
  });
  test('Multi Element Annotation', () => {
    functions.single();
    eqn.showForm('1');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    expect(round(a.bottom)).toBe(round(b.top));
    expect(round(b.bottom)).toBe(round(c.bottom));
    expect(round(a.left)).toBe(round((b.width + c.width) / 2 - a.width / 2));
  });
});
