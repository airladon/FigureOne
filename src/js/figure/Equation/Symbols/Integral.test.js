// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

describe('Equation Functions - Integral', () => {
  let figure;
  let eqn;
  let functions;
  beforeEach(() => {
    figure = makeFigure();
    functions = {
      symbols: () => {
        figure.addElement({
          name: 'eqn',
          method: 'equation',
          options: {
            color: [0, 0.95, 0, 1],
            elements: {
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
            },
            forms: {
              s1: { content: { int: ['s1', 'a'] } },
              s2: { content: { int: ['s2', 'a'] } },
            },
          },
        });
        figure.initialize();
        eqn = figure.elements._eqn;
      },
    };
  });
  test('Symbol 1', () => {
    functions.symbols();
    eqn.showForm('s1');
    figure.setFirstTransform();
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s1.transform.mat)).toMatchSnapshot();
  });
  test('Symbol 2', () => {
    functions.symbols();
    eqn.showForm('s2');
    figure.setFirstTransform();
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s2.transform.mat)).toMatchSnapshot();
  });
});
