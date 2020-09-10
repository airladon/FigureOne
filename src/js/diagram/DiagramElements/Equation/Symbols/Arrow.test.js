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

describe('Equation Symbols - Arrow', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      arrow: {
        symbol: 'arrow',
        lineWidth: 0.01,
        arrowWidth: 0.03,
        arrowHeight: 0.04,
        direction: 'right',
        staticSize: false,
      },
    };
    eqn = new Equation(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { bar: ['a', 'arrow', 'top'] } });
  });
  test('Snapshot', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._arrow.drawingObject.points)).toMatchSnapshot();
  });
});
