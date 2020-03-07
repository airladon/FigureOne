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

describe('Equation Symbols - Brace', () => {
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
        symbol: 'brace',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        width: 0.04,
        tipWidth: 0.01,
        draw: 'dynamic',
      },
      right: {
        symbol: 'brace',
        side: 'right',
        lineWidth: 0.01,
        sides: 10,
        width: 0.04,
        tipWidth: 0.01,
        draw: 'static',
        staticHeight: 'first',
      },
    };
    eqn = new Equation(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { brac: ['left', 'a', 'right'] } });
    diagram.elements = eqn;
  });
  test('Snapshot 1', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    // console.log(eqn._left.getBoundingRect('diagram'))
    // console.log(eqn._right.transform)
    // console.log(eqn._right.getBoundingRect('diagram'))
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
});
