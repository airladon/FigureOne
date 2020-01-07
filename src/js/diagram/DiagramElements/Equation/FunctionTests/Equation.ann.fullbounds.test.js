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
  let lineWidth;
  let staticWidth;
  let staticHeight;
  let space;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    lineWidth = 0.01;
    space = 0.1;
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      box: {
        symbol: 'box',
        lineWidth,
      },
      left: {
        symbol: 'bracket',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      top: {
        symbol: 'bracket',
        side: 'top',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      s: {
        symbol: 'strike',
        stlye: 'cross',
      },
    };
    const cStrike = {
      strike: {
        content: 'c',
        symbol: 's',
        space,
        inSize: false,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // annotationNormalBounds: {
          //   content: {
          //     ann: {
          //       content: 'a',
          //       annotation: {
          //         content: cStrike,
          //         xPosition: 'right',
          //         yPosition: 'top',
          //         xAlign: 'left',
          //         yAlign: 'bottom',
          //       },
          //     },
          //   },
          //   scale: 1,
          // },
          annotationFullBoundsAnnotation: {
            content: {
              ann: {
                content: 'a',
                annotation: {
                  content: cStrike,
                  fullContentBounds: true,
                  xPosition: 'right',
                  yPosition: 'top',
                  xAlign: 'left',
                  yAlign: 'bottom',
                },
              },
            },
            scale: 1,
          },
          // example: {
          //   content: {
          //     ann: {
          //       content: 'a',
          //       fullContentBounds: true,
          //       fullBounds: true,
          //       annotation: {
          //         content: 'b',
          //         useFullBounds: true,
          //         yPosition: 'top',
          //         yAlign: 'bottom',
          //         xPosition: 'right',
          //         xAlign: 'left',
          //       },
          //       glyphs: {
          //         left: {
          //           symbol: 'bracket',
          //           annotations: [
          //             {
          //               content: { strike: ['c', 'strike', false, 0.1] },
          //               useFullBounds: true,
          //             },
          //           ],
          //         },
          //       },
          //     },
          //   },
          //   scale: 1,
          // },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Annotation Normal Bounds', () => {
    functions.single();
    eqn.showForm('annotationNormalBounds');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    const s = eqn._s.getBoundingRect('diagram');
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(s.left)).toBe(round(c.left - space));
    expect(round(s.bottom)).toBe(round(c.bottom - space));
  });
  test.only('Annotation with Full Bounds Annotation', () => {
    functions.single();
    eqn.showForm('annotationFullBoundsAnnotation');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    const s = eqn._s.getBoundingRect('diagram');
    expect(round(a.top)).toBe(round(s.bottom));
    expect(round(a.right)).toBe(round(s.left));
    expect(round(c.bottom)).toBe(round(s.bottom + space));
    expect(round(c.left)).toBe(round(s.left + space));
  });
});
