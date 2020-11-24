import {
  Point,
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

describe('Equation Functions - Root', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      root1: {
        symbol: 'radical',
        color: color1,
        lineWidth: 0.01,
        startHeight: 0.5,
        startWidth: 0.7,
        maxStartHeight: 0.15,
        maxStartWidth: 0.15,
        proportionalToHeight: true,
        // staticSize: [3, 1],
      },
      root2: {
        symbol: 'radical',
        color: color1,
        lineWidth: 0.01,
        startHeight: 0.5,
        startWidth: 0.7,
        maxStartHeight: null,
        maxStartWidth: null,
      },
      root3: {
        symbol: 'radical',
      },
      root4: {
        symbol: 'radical',
        color: color1,
        lineWidth: 0.01,
        lineWidth2: 0.02,
        startWidth: 0.04,
        startHeight: 0.04,
        tickHeight: 0.01,
        tickWidth: 0.01,
        downWidth: 0.01,
        proportionalToHeight: false,
        draw: 'dynamic',
      },
    };
    functions = {
      single: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const root = e.root.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          0: {
            content: {
              root: {
                content: 'a',
                symbol: 'root3',
                inSize: true,
                space: 0.1,
                topSpace: 0.1,
                rightSpace: 0.1,
                bottomSpace: 0.1,
                leftSpace: 0.1,
                root: 'b',
                rootOffset: [0, 0],
                rootScale: 1,
              },
            },
          },
          1: {
            root: {
              content: 'a',
              symbol: 'root3',
              inSize: true,
              space: 0.1,
              topSpace: 0.1,
              rightSpace: 0.1,
              bottomSpace: 0.1,
              leftSpace: 0.1,
              root: 'b',
              rootOffset: [0, 0],
              rootScale: 1,
            },
          },
          // Method Array
          2: {
            root: ['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.1, 'b', [0, 0], 1],
          },
          // Function with parameters
          3: e.root(['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.1, 'b', [0, 0], 1]),
          // Bound Function with parameters
          4: root(['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.1, 'b', [0, 0], 1]),
          // Bound Function with Object
          5: root({
            content: 'a',
            symbol: 'root3',
            inSize: true,
            space: 0.1,
            topSpace: 0.1,
            rightSpace: 0.1,
            bottomSpace: 0.1,
            leftSpace: 0.1,
            root: 'b',
            rootOffset: [0, 0],
            rootScale: 1,
          }),
        });
      },
      definedRoot: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          0: {
            content: {
              root: {
                content: 'a',
                symbol: 'root4',
                inSize: true,
                space: 0.1,
                root: 'b',
                rootOffset: [0, 0],
                rootScale: 1,
              },
            },
            scale: 1,
          },
        });
        figure.elements = eqn;
      },
      // contentSpace: () => {
      //   eqn = new Equation(figure.shapes, { color: color1 });
      //   eqn.addElements(elements);
      //   eqn.addForms({
      //     0: { root: ['a', 'root1', null, 0.01] },
      //     1: { root: ['a', 'root1', null, [0.01, 0.01]] },
      //     2: { root: ['a', 'root1', null, new Point(0.01, 0.01)] },
      //     3: {
      //       root: ['a', 'root1', null, {
      //         left: 0.01, bottom: 0.01, top: 0.01, right: 0.01,
      //       }],
      //     },
      //   });
      // },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          base: {
            content: {
              root: {
                content: 'a',
                symbol: 'root3',
                inSize: true,
                space: 0.1,
                topSpace: 0.1,
                rightSpace: 0.1,
                bottomSpace: 0.1,
                leftSpace: 0.1,
                root: 'b',
                rootOffset: [0, 0],
                rootScale: 1,
              },
            },
            scale: 1,
          },
          space: {
            content: {
              root: ['root3', 'a', true, 0.2, null, null, null, null, 'b', [0, 0], 1],
            },
            scale: 1,
          },
          topSpace: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.2, 0.1, 0.1, 0.1, 'b', [0, 0], 1],
            },
            scale: 1,
          },
          rightSpace: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.1, 0.2, 0.1, 0.1, 'b', [0, 0], 1],
            },
            scale: 1,
          },
          bottomSpace: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.1, 0.1, 0.2, 0.1, 'b', [0, 0], 1],
            },
            scale: 1,
          },
          leftSpace: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.2, 'b', [0, 0], 1],
            },
            scale: 1,
          },
          rootOffset: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.1, 'b', [0.1, 0.1], 1],
            },
            scale: 1,
          },
          rootScale: {
            content: {
              root: ['root3', 'a', true, 0.1, 0.1, 0.1, 0.1, 0.1, 'b', [0, 0], 0.5],
            },
            scale: 1,
          },
        });
        figure.elements = eqn;
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseB;
    let baseR;
    let baseA;
    let rootScale;
    let space;
    let spaceDelta;
    let offset;
    let lineWidth;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseA = eqn._a.getBoundingRect('figure');
      baseB = eqn._b.getBoundingRect('figure');
      baseR = eqn._root3.getBoundingRect('figure');
      space = 0.2;
      spaceDelta = 0.1;
      rootScale = 0.5;
      offset = new Point(0.1, 0.1);
      lineWidth = 0.01;
    });
    test('topSpace', () => {
      eqn.showForm('topSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newR = eqn._root3.getBoundingRect('figure');
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newR.top)).toBe(round(newA.top + space + lineWidth));
    });
    test('bottomSpace', () => {
      eqn.showForm('bottomSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newR = eqn._root3.getBoundingRect('figure');
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newR.bottom)).toBe(round(newA.bottom - space));
    });
    test('leftSpace', () => {
      eqn.showForm('leftSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newR = eqn._root3.getBoundingRect('figure');
      expect(round(newR.left)).toBe(round(baseR.left));
      expect(round(newA.left)).toBe(round(baseA.left + spaceDelta));
    });
    test('rightSpace', () => {
      eqn.showForm('rightSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newR = eqn._root3.getBoundingRect('figure');
      expect(round(newR.left)).toBe(round(baseR.left));
      expect(round(newA.left)).toBe(round(baseA.left));
      expect(round(newR.width)).toBe(round(baseR.width + spaceDelta));
    });
    test('space', () => {
      eqn.showForm('space');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newR = eqn._root3.getBoundingRect('figure');
      expect(round(newR.left)).toBe(round(baseR.left));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      // expect(round(newA.left)).toBe(round(baseA.left + spaceDelta));
      expect(round(newR.width)).toBe(round(baseR.width + spaceDelta * 2));
      expect(round(newR.bottom)).toBe(round(newA.bottom - space));
      expect(round(newR.top)).toBe(round(newA.top + space + lineWidth));
    });
    test('rootOffset', () => {
      eqn.showForm('rootOffset');
      figure.setFirstTransform();
      const newB = eqn._b.getBoundingRect('figure');
      expect(round(newB.bottom)).toBe(round(baseB.bottom + offset.y));
      expect(round(newB.left)).toBe(round(offset.x - (baseR.left - baseB.left)));
    });
    test('rootScale', () => {
      eqn.showForm('rootScale');
      figure.setFirstTransform();
      const newB = eqn._b.getBoundingRect('figure');
      expect(round(newB.width)).toBe(round(baseB.width * rootScale));
      expect(round(newB.height)).toBe(round(baseB.height * rootScale));
    });
  });
  test('Root', () => {
    functions.single();
    const elems = [eqn._a, eqn._b];
    const formsToTest = ['1', '2', '3', '4', '5'];
    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._root3.transform.mat)).toMatchSnapshot();
  });
  test('Defined Root', () => {
    functions.definedRoot();
    eqn.showForm('0');
    figure.setFirstTransform();
    const rad = eqn._root4.getBoundingRect('figure');
    const a = eqn._a.getBoundingRect('figure');
    const b = eqn._b.getBoundingRect('figure');
    expect(round(a.left)).toBe(round(rad.left + 0.04 + 0.1));
    expect(round(rad.top)).toBe(round(a.top + 0.1 + 0.01));
    expect(round(rad.bottom)).toBe(round(a.bottom - 0.1));
    // startHeight: 0.04, lineWidth2: 0.02
    expect(round(b.bottom)).toBe(round(rad.bottom + 0.04 + 0.02));
    // downWidth: 0.01, tickWidth: 0.01
    expect(round(b.right)).toBe(round(rad.left + 0.01 + 0.01));
  });
});