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

describe('Equation Functions - Scale', () => {
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
    };
    functions = {
      inputForms: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
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
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
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
        diagram.elements = eqn;
        diagram.setFirstTransform();
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
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      scale = 0.5;
    });
    test('Scale', () => {
      eqn.showForm('scale');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
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
  });
});
