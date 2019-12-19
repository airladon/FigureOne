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

describe('Equation Functions - Matrix', () => {
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
      left: { symbol: 'bracket', side: 'left' },
      right: { symbol: 'bracket', side: 'right' },
    };
    functions = {
      inputForms: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const matrix = e.matrix.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              matrix: {
                order: [2, 2],
                left: 'left',
                content: ['a', 'b', 'c', 'd'],
                right: 'right',
              },
            },
          },
          // Method Object
          1: {
            matrix: {
              order: [2, 2],
              left: 'left',
              content: ['a', 'b', 'c', 'd'],
              right: 'right',
            },
          },
          // Method Array
          2: { matrix: [[2, 2], 'left', ['a', 'b', 'c', 'd'], 'right'] },
          // Function with Method Array
          3: e.matrix([[2, 2], 'left', ['a', 'b', 'c', 'd'], 'right']),
          // Bound Function with Object
          4: matrix({
            order: [2, 2],
            left: 'left',
            content: ['a', 'b', 'c', 'd'],
            right: 'right',
          }),
        });
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const matrix = e.matrix.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              matrix: {
                content: ['a', 'b', 'c', 'd'],
                left: 'left',
                right: 'right',
                order: [2, 2],
                scale: 1,
                fit: 'rowCol',
                space: [0.1, 0.1],
              },
            },
            scale: 1,
          },
          order: {
            content: matrix([
              [1, 4], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'rowCol', [0.1, 0.1],
            ]),
            scale: 1,
          },
        });
        diagram.elements = eqn;
        diagram.setFirstTransform();
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseB;
    let baseC;
    let baseD;
    let initialSpace;
    beforeEach(() => {
      functions.parameterSteps();
      console.log('asdfasdfasdf')
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      baseD = eqn._d.getBoundingRect('diagram');
      initialSpace = 0.1;
    });
    test.only('order', () => {
      // console.log(baseA)
      eqn.showForm('order');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newD = eqn._d.getBoundingRect('diagram');
      console.log(newA);
      console.log(newB);
      console.log(newC);
      console.log(newD);
      // expect(round(newA.left)).toBe(round(baseA.left + spaceDelta));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._d];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    diagram.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._d.transform.mat)).toMatchSnapshot();
  });
});
