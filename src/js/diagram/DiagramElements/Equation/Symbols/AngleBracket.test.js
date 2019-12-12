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

describe('Equation Symbols - Angle Bracket', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      left: {
        symbol: 'angleBracket',
        side: 'left',
        lineWidth: 0.01,
        width: 0.03,
        staticSize: false,
      },
      right: {
        symbol: 'angleBracket',
        side: 'right',
        lineWidth: 0.01,
        width: 0.03,
        staticSize: true,
      },
    };
    eqn = new EquationNew(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { brac: ['a', 'left', 'right'] } });
    diagram.elements = eqn;
    diagram.setFirstTransform();
  });
  test('Snapshot', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
});
