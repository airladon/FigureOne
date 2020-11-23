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

describe('Equation Functions - Scale', () => {
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
    };
    functions = {
      inputForms: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const scale = e.scale.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              scale: {
                content: ['a', 'b', 'c'],
                scale: 1,
              },
            },
          },
          // Method Object
          1: {
            scale: {
              content: ['a', 'b', 'c'],
              scale: 1,
            },
          },
          // Method Array
          2: {
            scale: [['a', 'b', 'c'], 1],
          },
          // Function with Method Array
          3: e.scale([['a', 'b', 'c'], 1]),
          // Bound Function with Object
          4: scale([['a', 'b', 'c'], 1]),
        });
        figure.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const scale = e.scale.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: ['a', {
              scale: {
                content: ['b', 'c'],
                scale: 1,
              },
            }],
            scale: 1,
          },
          scale: {
            content: ['a', scale([['b', 'c'], 0.5])],
            scale: 1,
          },
        });
        figure.elements = eqn;
        figure.setFirstTransform();
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseB;
    let baseC;
    let scale;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseA = eqn._a.getBoundingRect('figure');
      baseB = eqn._b.getBoundingRect('figure');
      baseC = eqn._c.getBoundingRect('figure');
      scale = 0.5;
    });
    test('Scale', () => {
      eqn.showForm('scale');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('figure');
      const newB = eqn._b.getBoundingRect('figure');
      const newC = eqn._c.getBoundingRect('figure');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newA.width)).toEqual(round(baseA.width));
      expect(round(newB.left)).toEqual(round(baseB.left));
      expect(round(newB.width)).toEqual(round(baseB.width * scale));
      expect(round(newC.left)).toEqual(round(baseB.left + newB.width));
      expect(round(newC.width)).toEqual(round(baseC.width * scale));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    figure.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    figure.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
  });
});
