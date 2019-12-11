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

describe('Equation Symbols - Square Bracket', () => {
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
        symbol: 'squarebracket',
        side: 'left',
        lineWidth: 0.01,
        endLength: 0.03,
        radius: 0,
        sides: 10,
        staticSize: false,
      },
      right: {
        symbol: 'squarebracket',
        side: 'right',
        lineWidth: 0.01,
        endLength: 0.03,
        radius: 0.04,
        sides: 10,
        staticSize: true,
      },
    };
    eqn = new EquationNew(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: ['a', 'left', 'right'] });
  });
  test('Bracket', () => {
    // Snapshot test on most simple layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._left.transform.mat)).toMatchSnapshot();
    expect(round(eqn._right.transform.mat)).toMatchSnapshot();
  });
});
