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

describe('Equation Functions - Ann', () => {
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
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          ann: {
            content: 'a',
            annotations: {
              content: 'b',
            },
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Ann', () => {
    functions.single();
    eqn.showForm('0');
    diagram.setFirstTransform();
    console.log(eqn._a.getBoundingRect('diagram'))
    console.log(eqn._b.getBoundingRect('diagram'))
  });
});
