// import {
//   Point,
// } from '../../../../tools/g2';
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

describe('Equation Functions - Ann', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let functions;
  let lineWidth;
  let space;
  let smallSpace;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    lineWidth = 0.01;
    space = 0.1;
    smallSpace = 0.02;
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      left: {
        symbol: 'bracket',
        side: 'left',
        lineWidth,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      top: {
        symbol: 'bracket',
        side: 'top',
        lineWidth,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      s: {
        symbol: 'strike',
        stlye: 'cross',
      },
      s1: {
        symbol: 'strike',
        stlye: 'cross',
      },
      box: {
        symbol: 'box',
        fill: true,
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
    const cSmallStrike = {
      strike: {
        content: 'c',
        symbol: 's',
        space: smallSpace,
        inSize: false,
      },
    };
    const aStrike = {
      strike: {
        content: 'a',
        symbol: 's1',
        space,
        inSize: false,
      },
    };
    functions = {
      single: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          annotationNormalBounds: {
            content: {
              annotate: {
                content: 'a',
                annotation: {
                  content: cStrike,
                  xPosition: 'right',
                  yPosition: 'top',
                  xAlign: 'left',
                  yAlign: 'bottom',
                },
              },
            },
            scale: 1,
          },
          annotationFullBoundsAnnotation: {
            content: {
              annotate: {
                content: aStrike,
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
          annotationWithNotInSizeContent: {
            content: {
              annotate: {
                content: aStrike,
                // fullContentBounds: true,
                annotation: {
                  content: cStrike,
                  // fullContentBounds: true,
                  xPosition: 'right',
                  yPosition: 'top',
                  xAlign: 'left',
                  yAlign: 'bottom',
                },
              },
            },
            scale: 1,
          },
          annotationWithFullBoundsContent: {
            content: {
              annotate: {
                content: aStrike,
                fullContentBounds: true,
                annotation: {
                  content: cStrike,
                  // fullContentBounds: true,
                  xPosition: 'right',
                  yPosition: 'top',
                  xAlign: 'left',
                  yAlign: 'bottom',
                },
              },
            },
            scale: 1,
          },
          annotationWithFullBoundsContentAndFullBoundsAnnotation: {
            content: {
              annotate: {
                content: aStrike,
                fullContentBounds: true,
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
          nestedAnnotation: {
            content: {
              annotate: {
                content: 'a',
                annotation: {
                  content: {
                    annotate: {
                      content: cStrike,
                    },
                  },
                  xPosition: 'right',
                  yPosition: 'top',
                  xAlign: 'left',
                  yAlign: 'bottom',
                },
              },
            },
            scale: 1,
          },
          useFullBoundsFalse: {
            content: {
              box: {
                content: {
                  annotate: {
                    content: 'a',
                    useFullBounds: false,
                    annotation: {
                      content: cSmallStrike,
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    },
                  },
                },
                symbol: 'box',
              },
            },
            scale: 1,
          },
          useFullBoundsTrue: {
            content: {
              box: {
                content: {
                  annotate: {
                    content: 'a',
                    useFullBounds: true,
                    annotation: {
                      content: cSmallStrike,
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    },
                  },
                },
                symbol: 'box',
              },
            },
            scale: 1,
          },
        });
        figure.elements = eqn;
      },
    };
  });
  test('Annotation Normal Bounds', () => {
    functions.single();
    eqn.showForm('annotationNormalBounds');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(s.left)).toBe(round(c.left - space));
    expect(round(s.bottom)).toBe(round(c.bottom - space));
  });
  test('Annotation with Full Bounds Annotation', () => {
    functions.single();
    eqn.showForm('annotationFullBoundsAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    expect(round(a.top)).toBe(round(s.bottom));
    expect(round(a.right)).toBe(round(s.left));
    expect(round(c.bottom)).toBe(round(s.bottom + space));
    expect(round(c.left)).toBe(round(s.left + space));
  });
  test('Annotation on Content that is not inSize', () => {
    functions.single();
    eqn.showForm('annotationWithNotInSizeContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    const s1 = eqn._s1.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(s.left)).toBe(round(c.left - space));
    expect(round(s.bottom)).toBe(round(c.bottom - space));
    expect(round(s1.left)).toBe(round(a.left - space));
    expect(round(s1.bottom)).toBe(round(a.bottom - space));
  });
  test('Annotation on Full Bounds Content', () => {
    functions.single();
    eqn.showForm('annotationWithFullBoundsContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    const s1 = eqn._s1.getBoundingRect('figure');
    expect(round(s1.left)).toBe(0);
    expect(round(s1.bottom)).toBe(round(a.bottom - space));
    expect(round(a.left)).toBe(round(space));
    expect(round(a.top + space)).toBe(round(s1.top));
    expect(round(a.right + space)).toBe(round(s1.right));
    expect(round(c.left)).toBe(round(s1.right));
    expect(round(c.bottom)).toBe(round(s1.top));
    expect(round(s.left)).toBe(round(c.left - space));
    expect(round(s.bottom)).toBe(round(c.bottom - space));
  });
  test('Annotation on Full Bounds Content with Full Bounds Annotation', () => {
    functions.single();
    eqn.showForm('annotationWithFullBoundsContentAndFullBoundsAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    const s1 = eqn._s1.getBoundingRect('figure');
    expect(round(s1.left)).toBe(0);
    expect(round(s1.bottom)).toBe(round(a.bottom - space));
    expect(round(a.left)).toBe(round(space));
    expect(round(a.top + space)).toBe(round(s1.top));
    expect(round(a.right + space)).toBe(round(s1.right));
    expect(round(s.left)).toBe(round(s1.right));
    expect(round(s.bottom)).toBe(round(s1.top));
    expect(round(c.left)).toBe(round(s.left + space));
    expect(round(c.bottom)).toBe(round(s.bottom + space));
  });
  test('Nested Annotation', () => {
    functions.single();
    eqn.showForm('nestedAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    const s = eqn._s.getBoundingRect('figure');
    expect(round(a.left)).toBe(round(0));
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(s.left)).toBe(round(c.left - space));
    expect(round(s.bottom)).toBe(round(c.bottom - space));
  });

  //                       X       X
  //                    ____X_____X
  //                   |     XcccX|
  //                   |     cXcXc|
  //                   |     ccXcc|
  //                   |     cXcXc|
  //                   |aaaaaX   X|
  //                   |aaaaX     X
  //                   |aaaaa     |
  //                   |aaaaa     |
  //                   ------------
  test('Use Full Bounds False', () => {
    functions.single();
    eqn.showForm('useFullBoundsFalse');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    expect(round(a.left)).toBe(round(0));
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(box.left)).toBe(0);
    expect(round(box.right)).toBe(round(c.right));
    expect(round(box.bottom)).toBe(round(a.bottom));
    expect(round(box.top)).toBe(round(c.top));
  });

  //                    ____________
  //                   |   X       X|
  //                   |    X     X |
  //                   |     XcccX  |
  //                   |     cXcXc  |
  //                   |     ccXcc  |
  //                   |     cXcXc  |
  //                   |aaaaaX   X  |
  //                   |aaaaX     X |
  //                   |aaaaa       |
  //                   |aaaaa       |
  //                   -------------
  //
  //
  test('Use Full Bounds True', () => {
    functions.single();
    eqn.showForm('useFullBoundsTrue');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    expect(round(a.left)).toBe(round(0));
    expect(round(a.top)).toBe(round(c.bottom));
    expect(round(a.right)).toBe(round(c.left));
    expect(round(box.left)).toBe(0);
    expect(round(box.right)).toBe(round(c.right + smallSpace));
    expect(round(box.bottom)).toBe(round(a.bottom));
    expect(round(box.top)).toBe(round(c.top + smallSpace));
  });
});
