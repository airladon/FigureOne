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

describe('Equation Functions - Annotations', () => {
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
      d: 'd',
      e: 'e',
      f: 'f',
      g: 'g',
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        const annotation = ['b', 'right', 'bottom', 'left', 'top', 0.5];
        const annotations = [annotation];

        eqn.addForms({
          // Full Object
          0: {
            content: {
              annotate: {
                content: 'a',
                withAnnotations: annotations,
              },
            },
          },
          //   // Method Object
          1: {
            annotate: {
              content: 'a',
              withAnnotations: annotations,
            },
          },
          // Method Array
          2: {
            annotate: ['a', annotations],
          },
          // Function with Method Array
          3: e.annotate(['a', annotations]),
          // Function with parameters
          4: e.annotate('a', annotations),
          // Bound Function with parameters
          5: annotate('a', annotations),
          // Bound Function with Object
          6: annotate({
            content: 'a',
            withAnnotations: annotations,
          }),
          7: {
            annotate: {
              content: 'a',
              withAnnotations: {
                annotation: {
                  annotation: 'b',
                  relativeToContent: ['right', 'bottom'],
                  relativeToAnnotation: ['left', 'top'],
                  scale: 0.5,
                },
              },
            },
          },
          8: {
            annotate: {
              content: 'a',
              withAnnotations: ['b', 'right', 'bottom', 'left', 'top', 0.5],
            },
          },
          // 7: {
          //   annotate: ['a', annotation],
          // },
        });
      },
      annotations: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotation = e.annotation.bind(e);
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          0: annotate('a', [
            {
              annotation: {
                annotation: 'b',
                relativeToContent: ['right', 'bottom'],
                relativeToAnnotation: ['left', 'top'],
                scale: 0.5,
              },
            },
          ]),
          // Method Array
          1: annotate('a', [
            {
              annotation: ['b', 'right', 'bottom', 'left', 'top', 0.5],
            },
          ]),
          // Array only
          2: annotate('a', [
            'b', 'right', 'bottom', 'left', 'top', 0.5,
          ]),
          // Array of array annotations
          3: annotate('a', [[
            'b', 'right', 'bottom', 'left', 'top', 0.5,
          ]]),
          // Function with method Array
          4: annotate('a', [
            e.annotation(['b', 'right', 'bottom', 'left', 'top', 0.5]),
          ]),
          // Function with parameters
          5: annotate('a', [
            e.annotation('b', 'right', 'bottom', 'left', 'top', 0.5),
          ]),
          // Bound function with parameters
          6: annotate('a', [
            annotation('b', 'right', 'bottom', 'left', 'top', 0.5),
          ]),
          // Bound Function with Object
          7: annotate('a', [
            annotation({
              annotation: 'b',
              relativeToContent: ['right', 'bottom'],
              relativeToAnnotation: ['left', 'top'],
              scale: 0.5,
            }),
          ]),
        });
      },
      multiple: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotation = e.annotation.bind(e);
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          0: annotate('a', [
            {
              annotation: {
                annotation: 'b',
                relativeToContent: ['right', 'bottom'],
                relativeToAnnotation: ['left', 'top'],
                scale: 0.5,
              },
            },
            {
              annotation: {
                annotation: 'c',
                relativeToContent: ['left', 'top'],
                relativeToAnnotation: ['right', 'bottom'],
                scale: 0.5,
              },
            },
          ]),
          // Functions
          1: annotate('a', [
            annotation('b', 'right', 'bottom', 'left', 'top', 0.5),
            annotation('c', 'left', 'top', 'right', 'bottom', 0.5),
          ]),
          // Arrays only
          2: annotate('a', [
            ['b', 'right', 'bottom', 'left', 'top', 0.5],
            ['c', 'left', 'top', 'right', 'bottom', 0.5],
          ]),
        });
      },
      nested: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotation = e.annotation.bind(e);
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          0: annotate('a', [
            {
              annotation: {
                annotation: annotate(
                  'b', ['c', 'center', 'bottom', 'center', 'top'],
                ),
                relativeToContent: ['right', 'bottom'],
                relativeToAnnotation: ['left', 'top'],
                scale: 0.5,
              },
            },
            {
              annotation: {
                annotation: 'd',
                relativeToContent: ['left', 'top'],
                relativeToAnnotation: ['right', 'bottom'],
                scale: 0.5,
              },
            },
          ]),
          // Functions
          1: annotate('a', [
            annotation(annotate(
              'b', ['c', 'center', 'bottom', 'center', 'top'],
            ), 'right', 'bottom', 'left', 'top', 0.5),
            annotation('d', 'left', 'top', 'right', 'bottom', 0.5),
          ]),
          // Arrays only
          2: annotate('a', [
            [
              annotate(
                'b', ['c', 'center', 'bottom', 'center', 'top'],
              ), 'right', 'bottom', 'left', 'top', 0.5,
            ],
            ['d', 'left', 'top', 'right', 'bottom', 0.5],
          ]),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: [
              annotate(
                {
                  content: 'a',
                  withAnnotations: [
                    {
                      annotation: {
                        annotation: 'b',
                        relativeToContent: ['right', 'bottom'],
                        relativeToAnnotation: ['left', 'top'],
                        scale: 1,
                        xOffset: 0,
                        yOffset: 0,
                      },
                    },
                  ],
                  inSize: true,
                },
              ),
              'c',
            ],
            scale: 1,
          },
          offsetXY: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 'left', 'top', 1, 0.01, 0.01], true), 'c',
            ],
            scale: 1,
          },
          contentLeftTop: {
            content: [
              annotate('a', ['b', 'left', 'top', 'left', 'top', 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          contentCenterMiddle: {
            content: [
              annotate('a', ['b', 'center', 'middle', 'left', 'top', 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          content0909: {
            content: [
              annotate('a', ['b', 0.9, 0.9, 'left', 'top', 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          annotationRightBottom: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 'right', 'bottom', 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          annotationCenterMiddle: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 'center', 'middle', 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          annotation0909: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 0.9, 0.9, 1, 0, 0], true), 'c',
            ],
            scale: 1,
          },
          inSize: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 'left', 'top', 1, 0, 0], false), 'c',
            ],
            scale: 1,
          },
          scaleAnnotation: {
            content: [
              annotate('a', ['b', 'right', 'bottom', 'left', 'top', 0.5, 0, 0], true), 'c',
            ],
            scale: 1,
          },
        });
      },
      parameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const annotate = e.annotate.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: [
            annotate(
              {
                content: 'a',
                withAnnotations: [
                  {
                    annotation: {
                      annotation: 'b',
                      relativeToContent: ['right', 'bottom'],
                      relativeToAnnotation: ['left', 'top'],
                      scale: 0.5,
                      xOffset: 0,
                      yOffset: 0,
                    },
                  },
                ],
              },
            ),
            'c',
          ],
          // With parameters
          0: {
            content: [
              annotate(
                {
                  content: 'a',
                  withAnnotations: [
                    {
                      annotation: {
                        annotation: 'b',
                        relativeToContent: ['right', 'bottom'],
                        relativeToAnnotation: ['left', 'top'],
                        scale: 1,
                        xOffset: 0.01,
                        yOffset: 0.01,
                      },
                    },
                  ],
                  inSize: false,
                },
              ),
              'c',
            ],
            scale: 1,
          },
          // Method Array
          1: {
            content: [
              annotate(
                'a',
                ['b', 'right', 'bottom', 'left', 'top', 1, 0.01, 0.01],
                false,
              ),
              'c',
            ],
            scale: 1,
          },
        });
      },
    };
  });
  test('Single', () => {
    functions.single();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4', '5', '6', '7', '8'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });
  });
  test('Annotations', () => {
    functions.annotations();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4', '5', '6', '7'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });
  });
  test('Multiple Annotations', () => {
    functions.multiple();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });
  });
  test('Nested Annotations', () => {
    functions.nested();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most complex layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._d.transform.mat)).toMatchSnapshot();
  });
  test('Annotation Parameters', () => {
    functions.parameters();
    const elems = [eqn._a, eqn._b, eqn._c];
    const withFormsToTest = ['1'];

    // get without positions
    eqn.showForm('without');
    const withoutPos = elems.map(elem => round(elem.transform.mat).slice());

    // with reference positions
    eqn.showForm('0');
    const withPos = elems.map(elem => round(elem.transform.mat).slice());

    expect(withoutPos).not.toEqual(withPos);

    withFormsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(withPos).toEqual(positions);
    });
  });
  describe('Parameter Steps', () => {
    let basePos;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      basePos = eqn._b.getPosition();
    });
    test('OffsetXY', () => {
      eqn.showForm('offsetXY');
      const newPos = eqn._b.getPosition();
      expect(round(basePos.x + 0.01)).toBe(round(newPos.x));
      expect(round(basePos.y + 0.01)).toBe(round(newPos.y));
    });
    test('contentLeftTop', () => {
      eqn.showForm('contentLeftTop');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._a.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height)).toBe(round(newPos.y));
    });
    test('contentCenterMiddle', () => {
      eqn.showForm('contentCenterMiddle');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._a.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width / 2)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height / 2)).toBe(round(newPos.y));
    });
    test('content0909', () => {
      eqn.showForm('content0909');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._a.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width * 0.1)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height * 0.9)).toBe(round(newPos.y));
    });
    test('annotationRightBottom', () => {
      eqn.showForm('annotationRightBottom');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._b.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height)).toBe(round(newPos.y));
    });
    test('annotationCenterMiddle', () => {
      eqn.showForm('annotationCenterMiddle');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._b.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width * 0.5)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height * 0.5)).toBe(round(newPos.y));
    });
    test('annotation0909', () => {
      eqn.showForm('annotation0909');
      const newPos = eqn._b.getPosition();
      const bounds = eqn._b.getBoundingRect('diagram');
      expect(round(basePos.x - bounds.width * 0.9)).toBe(round(newPos.x));
      expect(round(basePos.y + bounds.height * 0.1)).toBe(round(newPos.y));
    });
    test('inSize', () => {
      const baseC = eqn._c.getPosition();
      eqn.showForm('inSize');
      const newC = eqn._c.getPosition();
      const bounds = eqn._b.getBoundingRect('diagram');
      expect(round(baseC.x - bounds.width)).toBe(round(newC.x));
      expect(round(baseC.y)).toBe(round(newC.y));
    });
    test('scaleAnnotation', () => {
      const baseB = eqn._b.getBoundingRect('diagram');
      eqn.showForm('scaleAnnotation');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(baseB.width / 2)).toBe(round(newB.width));
      expect(round(baseB.height / 2)).toBe(round(newB.height));
    });
  });
});
