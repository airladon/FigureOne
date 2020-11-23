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

describe('Equation Symbols - Brace', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    figure = makeFigure();
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
    eqn = new Equation(figure.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { brac: ['left', 'a', 'right'] } });
    figure.elements = eqn;
  });
  test('Snapshot 1', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    figure.setFirstTransform();
    // console.log(eqn._left.getBoundingRect('figure'))
    // console.log(eqn._right.transform)
    // console.log(eqn._right.getBoundingRect('figure'))
    expect(round(eqn._left.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._right.drawingObject.points)).toMatchSnapshot();
  });
});
