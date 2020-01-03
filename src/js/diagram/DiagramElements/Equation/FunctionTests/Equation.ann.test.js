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
  let staticWidth;
  let staticHeight;
  let space;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    lineWidth = 0.01;
    staticWidth = 2;
    staticHeight = 2;
    space = 0.1;
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      box: {
        symbol: 'box',
        lineWidth,
      },
      boxStatic: {
        symbol: 'box',
        lineWidth,
        draw: 'static',
        staticHeight,
        staticWidth,
      },
      left: {
        symbol: 'bracketNew',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      right: {
        symbol: 'bracketNew',
        side: 'right',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
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
          simpleEncompassWithSpace: {
            ann: {
              content: 'a',
              glyphs: {
                encompass: {
                  symbol: 'box',
                  leftSpace: space,
                  rightSpace: space,
                  bottomSpace: space,
                  topSpace: space,
                },
              },
            },
          },
          encompassNotInSize: {
            ann: {
              content: 'a',
              glyphs: {
                encompass: {
                  symbol: 'box',
                  leftSpace: space,
                  rightSpace: space,
                  bottomSpace: space,
                  topSpace: space,
                },
              },
              inSize: false,
            },
          },
          simpleStaticEncompass: {
            ann: {
              content: 'a',
              glyphs: {
                encompass: {
                  symbol: 'boxStatic',
                  space: 0, // { left: 0 }
                },
              },
            },
          },
          encompassWithAnnotation: {
            ann: {
              content: 'a',
              glyphs: {
                encompass: {
                  symbol: 'box',
                  space,
                  annotations: [{
                    content: 'b',
                    yPosition: 'top',
                    yAlign: 'bottom',
                    xPosition: 'right',
                    xAlign: 'left',
                  }],
                },
              },
            },
          },
          left: {
            content: {
              ann: {
                content: 'a',
                glyphs: {
                  left: {
                    symbol: 'left',
                  },
                  right: {
                    symbol: 'right',
                  },
                },
              },
            },
            scale: 1,
          },
          bracAnnotation: {
            content: {
              annBrac: {
                content: 'a',
                left: 'left',
                right: 'right',
              },
            },
            scale: 1,
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
  test('Simple Left', () => {
    functions.single();
    eqn.showForm('left');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const left = eqn._left.getBoundingRect('diagram');
    const right = eqn._right.getBoundingRect('diagram');
    expect(round(left.left)).toBe(0);
    expect(round(a.left)).toBe(round(left.right));
    expect(round(right.left)).toBe(round(a.right));
  });
  test('Bracket Annotation', () => {
    functions.single();
    eqn.showForm('bracAnnotation');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const left = eqn._left.getBoundingRect('diagram');
    const right = eqn._right.getBoundingRect('diagram');
    expect(round(left.left)).toBe(0);
    expect(round(a.left)).toBe(round(left.right + 0.03));
    expect(round(right.left)).toBe(round(a.right + 0.03));
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
  });
  test('Simple Encompass With Space', () => {
    functions.single();
    eqn.showForm('simpleEncompassWithSpace');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const box = eqn._box.getBoundingRect('diagram');
    expect(round(box.left)).toBe(round(a.left - lineWidth - space));
    expect(round(box.right)).toBe(round(a.right + lineWidth + space));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth - space));
    expect(round(box.top)).toBe(round(a.top + lineWidth + space));
    expect(round(box.left)).toBe(0);
  });
  test('Encompass Not InSize', () => {
    functions.single();
    eqn.showForm('encompassNotInSize');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const box = eqn._box.getBoundingRect('diagram');
    expect(round(box.left)).toBe(round(a.left - lineWidth - space));
    expect(round(box.right)).toBe(round(a.right + lineWidth + space));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth - space));
    expect(round(box.top)).toBe(round(a.top + lineWidth + space));
    expect(round(box.left)).toBe(-lineWidth - space);
  });
  test('Simple Static Encompass', () => {
    functions.single();
    eqn.showForm('simpleStaticEncompass');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const box = eqn._boxStatic.getBoundingRect('diagram');
    const heightLineWidthRatio = lineWidth / staticHeight;
    const widthLineWidthRatio = lineWidth / staticWidth;
    const expectedWidth = a.width / (1 - 2 * widthLineWidthRatio);
    const expectedHeight = a.height / (1 - 2 * heightLineWidthRatio);
    const horiztonalLineWidth = widthLineWidthRatio * expectedWidth;
    const verticalLineHeight = heightLineWidthRatio * expectedHeight;
    expect(round(box.left)).toBe(round(a.left - horiztonalLineWidth));
    expect(round(box.right)).toBe(round(a.right + horiztonalLineWidth));
    expect(round(box.bottom)).toBe(round(a.bottom - verticalLineHeight));
    expect(round(box.top)).toBe(round(a.top + verticalLineHeight));
  });
  test('Annotated Encompass', () => {
    functions.single();
    eqn.showForm('encompassWithAnnotation');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    const box = eqn._box.getBoundingRect('diagram');
    expect(round(box.left)).toBe(round(a.left - space - lineWidth));
    expect(round(box.bottom)).toBe(round(a.bottom - space - lineWidth));
    expect(round(box.right)).toBe(round(a.right + space + lineWidth));
    expect(round(box.top)).toBe(round(a.top + space + lineWidth));
    expect(round(b.left)).toBe(round(box.right));
    expect(round(b.bottom)).toBe(round(box.top));
  });
});
