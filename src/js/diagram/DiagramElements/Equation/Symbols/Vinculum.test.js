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

describe('Equation Symbols - Vinculum', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      b: 'b',
      v: {
        symbol: 'vinculum',
        lineWidth: 0.01,
        draw: 'dynamic',
      },
    };
    eqn = new EquationNew(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { frac: ['a', 'v', 'b'] } });
  });
  test('Snapshot', () => {
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._v.drawingObject.points)).toMatchSnapshot();
  });
});
