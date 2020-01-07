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

describe('Equation Functions - Integral', () => {
  let diagram;
  let eqn;
  let elements;
  let functions;
  beforeEach(() => {
    diagram = makeDiagram();
    functions = {
      symbols: () => {
        eqn = new EquationNew(diagram.shapes, { color: [0, 0.95, 0, 1] });
        elements = {
          a: 'a',
          s1: {
            symbol: 'int',
            color: [0.95, 0, 0, 1], // override default equation color
            lineWidth: 0.01,        // lineWidth
            sides: 20,              // sides in integral s-curve
            width: null,            // symbol width
            tipWidth: null,         // s-curve tip width
            draw: 'static',         // or 'dynamic'
            staticHeight: 'first',  // or number (only use if draw = static)
            serif: true,            // serifs on s-curve
            num: 2,                 // number of s-curves
            type: 'generic',        // or 'line' for line integral symbol
            serifSides: 10,         // sides on serifs
            lineIntegralSides: 20,  // sides on line integral symbol
          },
          s2: {
            symbol: 'int',
            color: [0.95, 0, 0, 1], // override default equation color
            lineWidth: 0.01,        // lineWidth
            sides: 20,              // sides in integral s-curve
            width: null,            // symbol width
            tipWidth: null,         // s-curve tip width
            draw: 'dynamic',        // or 'dynamic'
            serif: false,           // serifs on s-curve
            num: 1,                 // number of s-curves
            type: 'line',           // or 'line' for line integral symbol
            serifSides: 10,         // sides on serifs
            lineIntegralSides: 20,  // sides on line integral symbol
          },
        };
        eqn.addElements(elements);
        eqn.addForms({
          s1: { content: { int: ['s1', 'a'] } },
          s2: { content: { int: ['s2', 'a'] } },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Symbol 1', () => {
    functions.symbols();
    eqn.showForm('s1');
    diagram.setFirstTransform();
    tools.cleanUIDs(eqn);
    // console.log(eqn._s1.drawingObject.points);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s1.transform.mat)).toMatchSnapshot();
  });
  test('Symbol 2', () => {
    functions.symbols();
    eqn.showForm('s2');
    diagram.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s2.transform.mat)).toMatchSnapshot();
  });
});
