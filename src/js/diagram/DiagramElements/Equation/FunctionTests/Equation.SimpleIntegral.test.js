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

describe('Equation Functions - Bar', () => {
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
      s: {
        symbol: 'simpleIntegral', lineWidth: 0.01,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            simpleIntegral: ['a', 's']
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
    console.log(eqn._s.getBoundingRect('diagram'));
  });
});
