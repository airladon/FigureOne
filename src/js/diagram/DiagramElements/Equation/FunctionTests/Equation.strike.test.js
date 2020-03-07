// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Functions - Strike', () => {
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
      // b: 'b',
      // c: 'c',
      // d: 'd',
      // e: 'e',
      // f: 'f',
      // g: 'g',
      x: { symbol: 'strike', style: 'cross' },
      s: { symbol: 'strike', style: 'forward' },
    };
    functions = {
      single: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const strike = e.strike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              strike: {
                content: 'a',
                symbol: 'x',
                inSize: true,
                space: 0,
                topSpace: 0.1,
                rightSpace: 0.2,
                bottomSpace: 0.3,
                leftSpace: 0.4,
              },
            },
          },
          //   // Method Object
          1: {
            strike: {
              content: 'a',
              symbol: 'x',
              inSize: true,
              space: 0,
              topSpace: 0.1,
              rightSpace: 0.2,
              bottomSpace: 0.3,
              leftSpace: 0.4,
            },
          },
          // Method Array
          2: { strike: ['a', 'x', true, 0, 0.1, 0.2, 0.3, 0.4] },
          // Function with Method Array
          3: e.strike(['a', 'x', true, 0, 0.1, 0.2, 0.3, 0.4]),
          // Bound Function with parameters
          4: strike(['a', 'x', true, 0, 0.1, 0.2, 0.3, 0.4]),
          // Bound Function with Object
          5: strike({
            content: 'a',
            symbol: 'x',
            inSize: true,
            space: 0,
            topSpace: 0.1,
            rightSpace: 0.2,
            bottomSpace: 0.3,
            leftSpace: 0.4,
          }),
        });
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const strike = e.strike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              strike: {
                content: 'a',
                symbol: 'x',
                inSize: true,
                space: 0,
                topSpace: null,
                rightSpace: null,
                bottomSpace: null,
                leftSpace: null,
              },
            },
            scale: 1,
          },
          space: {
            content: strike(['a', 'x', true, 1, null, null, null, null]),
            scale: 1,
          },
          topSpace: {
            content: strike(['a', 'x', true, 0, 1, null, null, null]),
            scale: 1,
          },
          rightSpace: {
            content: strike(['a', 'x', true, 0, null, 1, null, null]),
            scale: 1,
          },
          bottomSpace: {
            content: strike(['a', 'x', true, 0, null, null, 1, null]),
            scale: 1,
          },
          leftSpace: {
            content: strike(['a', 'x', true, 0, null, null, null, 1]),
            scale: 1,
          },
          inSize: {
            content: strike(['a', 'x', false, 1, null, null, null, null]),
            scale: 1,
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Strike', () => {
    functions.single();
    const elems = [eqn._a, eqn._x];
    const formsToTest = ['1', '2', '3', '4', '5'];

    eqn.showForm('0');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._x.transform.mat)).toMatchSnapshot();
  });
  describe('Parameters', () => {
    let space;
    let baseA;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      space = 1;
    });
    test('inSize', () => {
      functions.parameterSteps();
      eqn.showForm('inSize');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(round(-space));
      expect(round(newA.left)).toBe(round(0));
      expect(round(newX.width)).toBe(round(baseA.width + space * 2));
      expect(round(newX.height)).toBe(round(baseA.height + space * 2));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom - space));
    });
    test('Space', () => {
      functions.parameterSteps();
      eqn.showForm('space');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(0);
      expect(round(newA.left)).toBe(round(space));
      expect(round(newX.width)).toBe(round(baseA.width + space * 2));
      expect(round(newX.height)).toBe(round(baseA.height + space * 2));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom - space));
    });
    test('topSpace', () => {
      functions.parameterSteps();
      eqn.showForm('topSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(0);
      expect(round(newA.left)).toBe(round(0));
      expect(round(newX.width)).toBe(round(baseA.width));
      expect(round(newX.height)).toBe(round(baseA.height + space));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom));
    });
    test('bottomSpace', () => {
      functions.parameterSteps();
      eqn.showForm('bottomSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(0);
      expect(round(newA.left)).toBe(round(0));
      expect(round(newX.width)).toBe(round(baseA.width));
      expect(round(newX.height)).toBe(round(baseA.height + space));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom - space));
    });
    test('leftSpace', () => {
      functions.parameterSteps();
      eqn.showForm('leftSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(0);
      expect(round(newA.left)).toBe(round(space));
      expect(round(newX.width)).toBe(round(baseA.width + space));
      expect(round(newX.height)).toBe(round(baseA.height));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom));
    });
    test('rightSpace', () => {
      functions.parameterSteps();
      eqn.showForm('rightSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.left)).toBe(0);
      expect(round(newA.left)).toBe(round(0));
      expect(round(newX.width)).toBe(round(baseA.width + space));
      expect(round(newX.height)).toBe(round(baseA.height));
      expect(round(newA.bottom)).toBe(round(baseA.bottom));
      expect(round(newX.bottom)).toBe(round(baseA.bottom));
    });
  });
  // test('Strike Parameters', () => {
  //   functions.parameters();
  //   const elems = [eqn._a, eqn._b, eqn._c];
  //   const withFormsToTest = ['1', '2'];

  //   // get without positions
  //   eqn.showForm('without');
  //   const withoutPos = elems.map(elem => round(elem.transform.mat).slice());

  //   // with reference positions
  //   eqn.showForm('0');
  //   const withPos = elems.map(elem => round(elem.transform.mat).slice());

  //   expect(withoutPos).not.toEqual(withPos);

  //   withFormsToTest.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(withPos).toEqual(positions);
  //   });
  // });
});
