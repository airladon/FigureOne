// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Functions - Scale', () => {
  let figure;
  let eqn;
  let color1;
  let color2;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    color2 = [0, 0, 0.95, 1];
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      v: { symbol: 'vinculum' },
    };
    functions = {
      inputForms: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const color = e.color.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              color: {
                content: ['a', 'b', 'c'],
                color: color2,
              },
            },
          },
          // Method Object
          1: {
            color: {
              content: ['a', 'b', 'c'],
              color: color2,
            },
          },
          // Method Array
          2: {
            color: [['a', 'b', 'c'], color2],
          },
          // Function with Method Array
          3: e.color([['a', 'b', 'c'], color2]),
          // Bound Function with Object
          4: color([['a', 'b', 'c'], color2]),
        });
        figure.elements = eqn;
      },
    };
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    figure.setFirstTransform();
    const colors0 = elems.map(elem => round(elem.color).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
      const colors = elems.map(elem => round(elem.color).slice());
      expect(colors0).toEqual(colors);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    figure.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
  });
});
