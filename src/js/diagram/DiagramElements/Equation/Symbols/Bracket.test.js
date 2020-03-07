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

describe('Equation Symbols - Bracket', () => {
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
        symbol: 'bracket',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        staticSize: false,
      },
      right: {
        symbol: 'bracket',
        side: 'right',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
      },
      leftStatic: {
        symbol: 'bracket',
        side: 'left',
        lineWidth: 0.01,
        sides: 10,
        tipWidth: 0.003,
        draw: 'static',
        staticHeight: 'first',
      },
    };
    eqn = new Equation(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms(
      {
        0: { brac: ['left', 'a', 'right'] },
        1: { brac: ['leftStatic', 'a', 'right'] },
      },
    );
    diagram.elements = eqn;
  });
  test('Snapshot Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
  test('Static', () => {
    eqn.showForm('1');
    diagram.setFirstTransform();
    expect(round(eqn._leftStatic.drawingObject.points)).toMatchSnapshot();
  });
});
