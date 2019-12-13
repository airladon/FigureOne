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

describe('Equation Functions - SumPro', () => {
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
      s: {
        symbol: 'prod', lineWidth: 0.01,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              sumProd: ['a', 'b', 'c', 's'],
            },
            scale: 1,
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('test', () => {
    functions.single();
    // const elems = [eqn._a, eqn._s];
    eqn.showForm('0');
    diagram.setFirstTransform();
    // console.log(eqn._a.getBoundingRect('diagram'))
    // console.log(eqn._s.getBoundingRect('diagram'));
    // console.log(eqn._b.getBoundingRect('diagram'));
    // console.log(eqn._c.getBoundingRect('diagram'));
  });
});
