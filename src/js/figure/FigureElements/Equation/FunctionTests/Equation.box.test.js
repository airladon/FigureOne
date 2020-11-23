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

describe('Equation Functions - Box', () => {
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
      box: { symbol: 'box', color: [0, 0.9, 0, 1], lineWidth: 0.01 },
      boxFill: { symbol: 'box', color: [0, 0.9, 0, 1], fill: true },
      boxStatic: {
        symbol: 'box',
        color: [0, 0.9, 0, 1],
        lineWidth: 0.1,
        draw: 'static',
        staticHeight: 1,
        staticWidth: 2,
      },
    };
    functions = {
      single: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const box = e.box.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              box: {
                content: 'a',
                symbol: 'box',
              },
            },
          },
          //   // Method Object
          1: {
            box: {
              content: 'a',
              symbol: 'box',
            },
          },
          // Method Array
          2: { box: ['a', 'box'] },
          // Function with Method Array
          3: e.box(['a', 'box']),
          // Bound Function with Object
          4: box({
            content: 'a',
            symbol: 'box',
          }),
        });
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        // const e = eqn.eqn.functions;
        eqn.addElements(elements);
        figure.elements = eqn;
        eqn.addForms({
          // Full Object
          base: {
            content: {
              box: {
                content: 'a',
                symbol: 'box',
                inSize: true,
                space: 0.1,
                topSpace: null,
                bottomSpace: null,
                leftSpace: null,
                rightSpace: null,
              },
            },
            scale: 1,
          },
          topSpace: {
            content: { box: ['a', 'box', true, 0.1, 0.2, null, null, null] },
            scale: 1,
          },
          rightSpace: {
            content: { box: ['a', 'box', true, 0.1, null, 0.2, null, null] },
            scale: 1,
          },
          bottomSpace: {
            content: { box: ['a', 'box', true, 0.1, null, null, 0.2, null] },
            scale: 1,
          },
          leftSpace: {
            content: { box: ['a', 'box', true, 0.1, null, null, null, 0.2] },
            scale: 1,
          },
          notInSize: {
            content: { box: ['a', 'box', false, 0.1, null, null, null, null] },
            scale: 1,
          },
        });
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseBox;
    let space;
    let lineWidth;
    let newSpace;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseA = eqn._a.getBoundingRect('figure');
      baseBox = eqn._box.getBoundingRect('figure');
      space = 0.1;
      lineWidth = 0.01;
      newSpace = 0.2;
    });
    test('Base', () => {
      expect(round(baseBox.width)).toBe(round(baseA.width + space * 2 + lineWidth * 2));
      expect(round(baseBox.height)).toBe(round(baseA.height + space * 2 + lineWidth * 2));
      expect(round(baseBox.left)).toBe(0);
      expect(round(baseBox.bottom)).toBe(round(baseA.bottom - space - lineWidth));
      expect(round(baseA.left)).toBe(round(baseBox.left + space + lineWidth));
    });
    test('Top Space', () => {
      eqn.showForm('topSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newBox = eqn._box.getBoundingRect('figure');
      expect(round(newBox.width)).toBe(round(newA.width + space * 2 + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space + newSpace + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Left Space', () => {
      eqn.showForm('leftSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newBox = eqn._box.getBoundingRect('figure');
      expect(round(newBox.width)).toBe(round(newA.width + space + newSpace + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space * 2 + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + newSpace + lineWidth));
    });
    test('Bottom Space', () => {
      eqn.showForm('bottomSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newBox = eqn._box.getBoundingRect('figure');
      expect(round(newBox.width)).toBe(round(newA.width + space * 2 + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space + newSpace + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - newSpace - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Right Space', () => {
      eqn.showForm('rightSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newBox = eqn._box.getBoundingRect('figure');
      expect(round(newBox.width)).toBe(round(newA.width + space + newSpace + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space * 2 + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Not In Size', () => {
      eqn.showForm('notInSize');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newBox = eqn._box.getBoundingRect('figure');
      expect(round(newA.left)).toBe(round(0));
      expect(round(newBox.left)).toBe(-space - lineWidth);
    });
  });
  test('Box', () => {
    functions.single();
    const elems = [eqn._a];
    const formsToTest = ['1', '2', '3', '4'];

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
    expect(round(eqn._box.transform.mat)).toMatchSnapshot();
  });
});
