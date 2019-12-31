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
  let lineWidth;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    lineWidth = 0.01;
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      box: {
        symbol: 'box',
        lineWidth,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          simpleAnnotation: {
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
          multiAnnotation: {
            ann: {
              content: 'a',
              annotation: {
                content: ['b', 'c'],
                yPosition: 'bottom',
                yAlign: 'top',
              },
            },
          },
          simpleEncompass: {
            ann: {
              content: 'a',
              glyphs: {
                encompass: {
                  symbol: 'box',
                  space: 0, // { left: 0 }
                },
              },
            },
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Simple Annotation', () => {
    functions.single();
    eqn.showForm('simpleAnnotation');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    expect(round(a.top)).toBe(round(b.bottom));
    expect(round(a.right)).toBe(round(b.left));
  });
  test('Multi Annotation', () => {
    functions.single();
    eqn.showForm('multiAnnotation');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    expect(round(a.bottom)).toBe(round(b.top));
    expect(round(b.bottom)).toBe(round(c.bottom));
    expect(round(a.left)).toBe(round((b.width + c.width) / 2 - a.width / 2));
  });
  test('Simple Encompass', () => {
    functions.single();
    eqn.showForm('simpleEncompass');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const box = eqn._box.getBoundingRect('diagram');
    expect(round(box.left)).toBe(round(a.left - lineWidth));
    expect(round(box.right)).toBe(round(a.right + lineWidth));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth));
    expect(round(box.top)).toBe(round(a.top + lineWidth));
    // console.log(a)
    // console.log(box);
    // const c = eqn._c.getBoundingRect('diagram');
    // expect(round(a.bottom)).toBe(round(b.top));
    // expect(round(b.bottom)).toBe(round(c.bottom));
    // expect(round(a.left)).toBe(round((b.width + c.width) / 2 - a.width / 2));
  });
});
