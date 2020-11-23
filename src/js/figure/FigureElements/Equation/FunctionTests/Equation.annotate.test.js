// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Functions - Ann', () => {
  let figure;
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
    figure = makeFigure();
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
      box1: {
        symbol: 'box',
        fill: true,
      },
      boxStatic: {
        symbol: 'box',
        lineWidth,
        draw: 'static',
        staticHeight,
        staticWidth,
      },
      left: {
        symbol: 'bracket',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      right: {
        symbol: 'bracket',
        side: 'right',
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
      bottom: {
        symbol: 'bracket',
        side: 'bottom',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
    };
    functions = {
      single: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          simpleAnnotation: {
            annotate: {
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
            annotate: {
              content: 'a',
              annotation: {
                content: ['b', 'c'],
                yPosition: 'bottom',
                yAlign: 'top',
              },
            },
          },
          noAnnotationContent: {
            annotate: {
              content: 'a',
              annotation: {
                yPosition: 'top',
                yAlign: 'bottom',
                xPosition: 'right',
                xAlign: 'left',
              },
            },
          },
          nested: {
            annotate: {
              content: 'a',
              annotation: {
                content: {
                  annotate: {
                    content: 'b',
                    annotation: {
                      content: 'c',
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    },
                  },
                },
                xPosition: 'right',
                yPosition: 'top',
                xAlign: 'left',
                yAlign: 'bottom',
              },
            },
          },
          simpleEncompass: {
            annotate: {
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
            content: {
              annotate: {
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
            scale: 1,
          },
          encompassNotInSize: {
            content: {
              annotate: {
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
            scale: 1,
          },
          simpleStaticEncompass: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  encompass: {
                    symbol: 'boxStatic',
                    space: 0, // { left: 0 }
                  },
                },
              },
            },
            scale: 1,
          },
          encompassWithAnnotation: {
            content: {
              annotate: {
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
            scale: 1,
          },
          left: {
            content: {
              annotate: {
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
          leftWithLeftAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  left: {
                    symbol: 'left',
                    annotations: [{
                      content: 'b',
                      xPosition: 'left',
                      yPosition: 'top',
                      xAlign: 'right',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          leftWithRightAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  left: {
                    symbol: 'left',
                    annotations: [{
                      content: 'b',
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          leftWithNoAnnotationContent: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  left: {
                    symbol: 'left',
                    annotations: [{
                      // content: 'b',
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          leftWithRightAnnotationOverContent: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  left: {
                    symbol: 'left',
                    annotationsOverContent: true,
                    annotations: [{
                      content: 'b',
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          rightWithRightAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  right: {
                    symbol: 'right',
                    annotations: [{
                      content: 'b',
                      xPosition: 'right',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          rightWithLeftAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  right: {
                    symbol: 'right',
                    annotations: [{
                      content: 'b',
                      xPosition: 'left',
                      yPosition: 'top',
                      xAlign: 'right',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          rightWithLeftAnnotationOverContent: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  right: {
                    symbol: 'right',
                    annotationsOverContent: true,
                    annotations: [{
                      content: 'b',
                      xPosition: 'left',
                      yPosition: 'top',
                      xAlign: 'left',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          topWithTopAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  top: {
                    symbol: 'top',
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'top',
                      xAlign: 'center',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          topWithBottomAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  top: {
                    symbol: 'top',
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'bottom',
                      xAlign: 'center',
                      yAlign: 'top',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          topWithBottomAnnotationOverContent: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  top: {
                    symbol: 'top',
                    annotationsOverContent: true,
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'bottom',
                      xAlign: 'center',
                      yAlign: 'top',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          bottomWithBottomAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  bottom: {
                    symbol: 'bottom',
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'bottom',
                      xAlign: 'center',
                      yAlign: 'top',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          bottomWithTopAnnotation: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  bottom: {
                    symbol: 'bottom',
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'top',
                      xAlign: 'center',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          bottomWithTopAnnotationOverContent: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  bottom: {
                    symbol: 'bottom',
                    annotationsOverContent: true,
                    annotations: [{
                      content: 'b',
                      xPosition: 'center',
                      yPosition: 'top',
                      xAlign: 'center',
                      yAlign: 'bottom',
                    }],
                  },
                },
              },
            },
            scale: 1,
          },
          brac: {
            content: {
              brac: {
                content: 'a',
                left: 'left',
                right: 'right',
              },
            },
            scale: 1,
          },
          topBottom: {
            content: {
              annotate: {
                content: 'a',
                glyphs: {
                  top: {
                    symbol: 'top',
                  },
                  bottom: {
                    symbol: 'bottom',
                  },
                },
              },
            },
            scale: 1,
          },
          twoAnnotations: {
            content: {
              annotate: {
                content: 'a',
                annotations: [
                  {
                    content: 'b',
                    xPosition: 'right',
                    yPosition: 'top',
                    xAlign: 'left',
                    yAlign: 'bottom',
                    offset: [0, 0],
                    scale: 0.5,
                  },
                  {
                    content: 'c',
                    xPosition: 'right',
                    yPosition: 'bottom',
                    xAlign: 'left',
                    yAlign: 'top',
                    offset: [0, 0],
                    scale: 0.5,
                  },
                ],
              },
            },
            scale: 1,
          },
        });
        figure.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              box: [
                {
                  annotate: {
                    content: 'a',
                    annotation: {
                      content: 'b',
                      yPosition: 'top',
                      yAlign: 'bottom',
                      xPosition: 'right',
                      xAlign: 'left',
                      offset: [0, 0],
                      scale: 1,
                      fullContentBounds: false,
                    },
                    inSize: true,
                    space: 0,
                    topSpace: null,
                    rightSpace: null,
                    bottomSpace: null,
                    leftSpace: null,
                    fullContentBounds: false,
                    useFullBounds: false,
                  },
                },
                'box1',
              ],
            },
            scale: 1,
          },
          space: {
            content: {
              box: [
                {
                  annotate: {
                    content: 'a',
                    annotation: {
                      content: 'b',
                      yPosition: 'top',
                      yAlign: 'bottom',
                      xPosition: 'right',
                      xAlign: 'left',
                      offset: [0, 0],
                      scale: 1,
                      fullContentBounds: false,
                    },
                    inSize: true,
                    space: 1,
                    topSpace: null,
                    rightSpace: null,
                    bottomSpace: null,
                    leftSpace: null,
                    fullContentBounds: false,
                    useFullBounds: false,
                  },
                },
                'box1',
              ],
            },
            scale: 1,
          },
          individualSpace: {
            content: {
              box: [
                {
                  annotate: {
                    content: 'a',
                    annotation: {
                      content: 'b',
                      yPosition: 'top',
                      yAlign: 'bottom',
                      xPosition: 'right',
                      xAlign: 'left',
                      offset: [0, 0],
                      scale: 1,
                      fullContentBounds: false,
                    },
                    inSize: true,
                    space: 0,
                    topSpace: 1,
                    rightSpace: 2,
                    bottomSpace: 3,
                    leftSpace: 4,
                    fullContentBounds: false,
                    useFullBounds: false,
                  },
                },
                'box1',
              ],
            },
            scale: 1,
          },
          offset: {
            content: {
              box: [
                {
                  annotate: {
                    content: 'a',
                    annotation: {
                      content: 'b',
                      yPosition: 'top',
                      yAlign: 'bottom',
                      xPosition: 'right',
                      xAlign: 'left',
                      offset: [1, 1],
                      scale: 1,
                      fullContentBounds: false,
                    },
                    inSize: true,
                    space: 0,
                    topSpace: null,
                    rightSpace: null,
                    bottomSpace: null,
                    leftSpace: null,
                    fullContentBounds: false,
                    useFullBounds: false,
                  },
                },
                'box1',
              ],
            },
            scale: 1,
          },
          scale: {
            content: {
              box: [
                {
                  annotate: {
                    content: 'a',
                    annotation: {
                      content: 'b',
                      yPosition: 'top',
                      yAlign: 'bottom',
                      xPosition: 'right',
                      xAlign: 'left',
                      offset: [0, 0],
                      scale: 0.5,
                      fullContentBounds: false,
                    },
                    inSize: true,
                    space: 0,
                    topSpace: null,
                    rightSpace: null,
                    bottomSpace: null,
                    leftSpace: null,
                    fullContentBounds: false,
                    useFullBounds: false,
                  },
                },
                'box1',
              ],
            },
            scale: 1,
          },
        });
        figure.elements = eqn;
      },
    };
  });
  test('Simple Annotation', () => {
    functions.single();
    eqn.showForm('simpleAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    expect(round(a.top)).toBe(round(b.bottom));
    expect(round(a.right)).toBe(round(b.left));
  });
  test('No Annotation Content', () => {
    functions.single();
    eqn.showForm('noAnnotationContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
  });
  test('Simple Left', () => {
    functions.single();
    eqn.showForm('left');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    const right = eqn._right.getBoundingRect('figure');
    expect(round(left.left)).toBe(0);
    expect(round(a.left)).toBe(round(left.right));
    expect(round(right.left)).toBe(round(a.right));
  });
  test('Left with Left Annotation', () => {
    functions.single();
    eqn.showForm('leftWithLeftAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    expect(round(b.left)).toBe(0);
    expect(round(left.left)).toBe(round(b.right));
    expect(round(a.left)).toBe(round(left.right));
    expect(round(b.bottom)).toBe(round(left.top));
  });
  test('Left with Right Annotation', () => {
    functions.single();
    eqn.showForm('leftWithRightAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    expect(round(left.left)).toBe(0);
    expect(round(b.left)).toBe(round(left.right));
    expect(round(a.left)).toBe(round(b.right));
    expect(round(b.bottom)).toBe(round(left.top));
  });
  test('Left with No Annotation Content', () => {
    functions.single();
    eqn.showForm('leftWithNoAnnotationContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    expect(round(left.left)).toBe(0);
    expect(round(a.left)).toBe(round(left.right));
  });
  test('Left with Right Annotation Over Content', () => {
    functions.single();
    eqn.showForm('leftWithRightAnnotationOverContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    expect(round(left.left)).toBe(0);
    expect(round(b.left)).toBe(round(left.right));
    expect(round(a.left)).toBe(round(left.right));
    expect(round(b.bottom)).toBe(round(left.top));
  });
  test('Right with Right Annotation', () => {
    functions.single();
    eqn.showForm('rightWithRightAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const right = eqn._right.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
    expect(round(right.left)).toBe(round(a.right));
    expect(round(b.left)).toBe(round(right.right));
    expect(round(b.bottom)).toBe(round(right.top));
  });
  test('Right with Left Annotation', () => {
    functions.single();
    eqn.showForm('rightWithLeftAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const right = eqn._right.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
    expect(round(b.left)).toBe(round(a.right));
    expect(round(right.left)).toBe(round(b.right));
    expect(round(b.bottom)).toBe(round(right.top));
  });
  test('Right with Left Annotation Over Content', () => {
    functions.single();
    eqn.showForm('rightWithLeftAnnotationOverContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const right = eqn._right.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
    expect(round(b.left)).toBe(round(a.right));
    expect(round(right.left)).toBe(round(a.right));
    expect(round(b.bottom)).toBe(round(right.top));
  });
  test('Top with Top Annotation', () => {
    functions.single();
    eqn.showForm('topWithTopAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const top = eqn._top.getBoundingRect('figure');
    expect(round(top.bottom)).toBe(round(a.top));
    expect(round(b.bottom)).toBe(round(top.top));
    expect(round(b.left)).toBe(round(top.left + top.width / 2 - b.width / 2));
  });
  test('Top with Bottom Annotation', () => {
    functions.single();
    eqn.showForm('topWithBottomAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const top = eqn._top.getBoundingRect('figure');
    expect(round(b.bottom)).toBe(round(a.top));
    expect(round(top.bottom)).toBe(round(b.top));
    expect(round(b.left)).toBe(round(top.left + top.width / 2 - b.width / 2));
  });
  test('Top with Bottom Annotation Over Content', () => {
    functions.single();
    eqn.showForm('topWithBottomAnnotationOverContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const top = eqn._top.getBoundingRect('figure');
    expect(round(top.bottom)).toBe(round(a.top));
    expect(round(b.top)).toBe(round(top.bottom));
    expect(round(b.left)).toBe(round(top.left + top.width / 2 - b.width / 2));
  });
  test('Bottom with Bottom Annotation', () => {
    functions.single();
    eqn.showForm('bottomWithBottomAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const bottom = eqn._bottom.getBoundingRect('figure');
    expect(round(bottom.top)).toBe(round(a.bottom));
    expect(round(b.top)).toBe(round(bottom.bottom));
    expect(round(b.left)).toBe(round(bottom.left + bottom.width / 2 - b.width / 2));
  });
  test('Bottom with Top Annotation', () => {
    functions.single();
    eqn.showForm('bottomWithTopAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const bottom = eqn._bottom.getBoundingRect('figure');
    expect(round(b.top)).toBe(round(a.bottom));
    expect(round(bottom.top)).toBe(round(b.bottom));
    expect(round(b.left)).toBe(round(bottom.left + bottom.width / 2 - b.width / 2));
  });
  test('Bottom with Top Annotation Over Content', () => {
    functions.single();
    eqn.showForm('bottomWithTopAnnotationOverContent');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const bottom = eqn._bottom.getBoundingRect('figure');
    expect(round(b.bottom)).toBe(round(bottom.top));
    expect(round(bottom.top)).toBe(round(a.bottom));
    expect(round(b.left)).toBe(round(bottom.left + bottom.width / 2 - b.width / 2));
  });
  test('Bracket Annotation', () => {
    functions.single();
    eqn.showForm('brac');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const left = eqn._left.getBoundingRect('figure');
    const right = eqn._right.getBoundingRect('figure');
    expect(round(left.left)).toBe(0.03);
    expect(round(a.left)).toBe(round(left.right + 0.03));
    expect(round(right.left)).toBe(round(a.right + 0.03));
  });
  test('Simple Top Bottom', () => {
    functions.single();
    eqn.showForm('topBottom');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const top = eqn._top.getBoundingRect('figure');
    const bottom = eqn._bottom.getBoundingRect('figure');
    // console.log(a)
    // console.log(bottom)
    expect(round(top.bottom)).toBe(a.top);
    expect(round(bottom.top)).toBe(round(a.bottom));
  });
  test('Multi Annotation', () => {
    functions.single();
    eqn.showForm('multiAnnotation');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    expect(round(a.bottom)).toBe(round(b.top));
    expect(round(b.bottom)).toBe(round(c.bottom));
    expect(round(a.left)).toBe(round((b.width + c.width) / 2 - a.width / 2));
  });
  test('Simple Encompass', () => {
    functions.single();
    eqn.showForm('simpleEncompass');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    expect(round(box.left)).toBe(round(a.left - lineWidth));
    expect(round(box.right)).toBe(round(a.right + lineWidth));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth));
    expect(round(box.top)).toBe(round(a.top + lineWidth));
  });
  test('Simple Encompass With Space', () => {
    functions.single();
    eqn.showForm('simpleEncompassWithSpace');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    expect(round(box.left)).toBe(round(a.left - lineWidth - space));
    expect(round(box.right)).toBe(round(a.right + lineWidth + space));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth - space));
    expect(round(box.top)).toBe(round(a.top + lineWidth + space));
    expect(round(box.left)).toBe(0);
  });
  test('Encompass Not InSize', () => {
    functions.single();
    eqn.showForm('encompassNotInSize');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    expect(round(box.left)).toBe(round(a.left - lineWidth - space));
    expect(round(box.right)).toBe(round(a.right + lineWidth + space));
    expect(round(box.bottom)).toBe(round(a.bottom - lineWidth - space));
    expect(round(box.top)).toBe(round(a.top + lineWidth + space));
    expect(round(box.left)).toBe(-lineWidth - space);
  });
  test('Simple Static Encompass', () => {
    functions.single();
    eqn.showForm('simpleStaticEncompass');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const box = eqn._boxStatic.getBoundingRect('figure');
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
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const box = eqn._box.getBoundingRect('figure');
    expect(round(box.left)).toBe(round(a.left - space - lineWidth));
    expect(round(box.bottom)).toBe(round(a.bottom - space - lineWidth));
    expect(round(box.right)).toBe(round(a.right + space + lineWidth));
    expect(round(box.top)).toBe(round(a.top + space + lineWidth));
    expect(round(b.left)).toBe(round(box.right));
    expect(round(b.bottom)).toBe(round(box.top));
  });
  test('Two Annotations', () => {
    functions.single();
    eqn.showForm('twoAnnotations');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    expect(round(b.left)).toBe(round(a.right));
    expect(round(b.bottom)).toBe(round(a.top));
    expect(round(c.left)).toBe(round(a.right));
    expect(round(c.top)).toBe(round(a.bottom));
  });
  test('Nested', () => {
    functions.single();
    eqn.showForm('nested');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    const c = eqn._c.getBoundingRect('figure');
    expect(round(b.left)).toBe(round(a.right));
    expect(round(b.bottom)).toBe(round(a.top));
    expect(round(c.left)).toBe(round(b.right));
    expect(round(c.bottom)).toBe(round(b.top));
  });
  describe('Parameter Steps', () => {
    let baseB;
    let allSpace;
    let leftSpace;
    let topSpace;
    let bottomSpace;
    let rightSpace;
    let offset;
    let scale;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseB = eqn._b.getBoundingRect('figure');
      allSpace = 1;
      topSpace = 1;
      rightSpace = 2;
      bottomSpace = 3;
      leftSpace = 4;
      offset = 1;
      scale = 0.5;
    });
    test('space', () => {
      eqn.showForm('space');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newB = eqn._b.getBoundingRect('figure');
      const newBox = eqn._box1.getBoundingRect('figure');
      expect(round(newB.left)).toBe(round(newA.right));
      expect(round(newB.bottom)).toBe(round(newA.top));
      expect(round(newBox.width)).toBe(round(newA.width + newB.width + allSpace * 2));
      expect(round(newBox.height)).toBe(round(newA.height + newB.height + allSpace * 2));
      expect(round(newBox.bottom)).toBe(round(newA.bottom - allSpace));
      expect(round(newBox.top)).toBe(round(newB.top + allSpace));
    });
    test('Individual Space', () => {
      eqn.showForm('individualSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newB = eqn._b.getBoundingRect('figure');
      const newBox = eqn._box1.getBoundingRect('figure');
      expect(round(newA.left)).toBe(round(newBox.left + leftSpace));
      expect(round(newA.bottom)).toBe(round(newBox.bottom + bottomSpace));
      expect(round(newB.left)).toBe(round(newA.right));
      expect(round(newB.bottom)).toBe(round(newA.top));
      expect(round(newBox.right)).toBe(round(newB.right + rightSpace));
      expect(round(newBox.top)).toBe(round(newB.top + topSpace));
    });
    test('Annotation Offset', () => {
      eqn.showForm('offset');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newB = eqn._b.getBoundingRect('figure');
      expect(round(newB.left)).toBe(round(newA.right + offset));
      expect(round(newB.bottom)).toBe(round(newA.top + offset));
    });
    test('Annotation Scale', () => {
      eqn.showForm('scale');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newB = eqn._b.getBoundingRect('figure');
      expect(round(newB.left)).toBe(round(newA.right));
      expect(round(newB.bottom)).toBe(round(newA.top));
      expect(round(newB.width)).toBe(round(baseB.width * scale));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
    });
  });
});
