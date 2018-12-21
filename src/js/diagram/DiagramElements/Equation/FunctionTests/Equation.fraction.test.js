// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { EquationNew } from '../Equation';
// import Fraction from './Elements/Fraction';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Functions - Fraction', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
      f: 'f',
      v: { symbol: 'vinculum' },
      v1: { symbol: 'vinculum' },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const frac = e.frac.bind(e);
        eqn.addElements(elements);
        const s = 0.5;
        eqn.addForms({
          // Full Object
          0: {
            content: {
              frac: {
                numerator: 'a',
                denominator: 'b',
                symbol: 'v',
                scale: s,
              },
            },
          },
          // Method Object
          1: {
            frac: {
              numerator: 'a',
              denominator: 'b',
              symbol: 'v',
              scale: s,
            },
          },
          // Method Array
          2: { frac: ['a', 'b', 'v', s] },
          // Function with Method Array
          3: e.frac(['a', 'b', 'v', s]),
          // Function with parameters
          4: e.frac('a', 'b', 'v', s),
          // Bound Function with parameters
          5: frac('a', 'b', 'v', s),
        });
      },
      scaling: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const frac = e.frac.bind(e);
        eqn.addElements(elements);
        const s = 0.5;
        eqn.addForms({
          // Method Array with scale defined
          s0: { frac: ['a', 'b', 'v', s] },
          // Function with Method Array with scale defined
          s1: e.frac(['a', 'b', 'v', s]),
          // Bound Function with parameters and scale defined
          s2: frac('a', 'b', 'v', s),

          // Method Array without scale defined
          n0: { frac: ['a', 'b', 'v'] },
          // Function with Method Array without scale defined
          n1: e.frac(['a', 'b', 'v']),
          // Bound Function with parameters without scale defined
          n2: frac('a', 'b', 'v'),
        });
      },
      nested: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const frac = e.frac.bind(e);
        eqn.addElements(elements);
        const s = 0.5;
        eqn.addForms({
          // Full Object
          0: {
            content: {
              frac: {
                numerator: {
                  content: {
                    frac: {
                      numerator: 'a',
                      denominator: 'b',
                      symbol: 'v',
                      scale: s,
                    },
                  },
                },
                denominator: 'c',
                symbol: 'v1',
              },
            },
          },
          // Method Object nested in Method Object
          1: {
            frac: {
              numerator: {
                frac: {
                  numerator: 'a',
                  denominator: 'b',
                  symbol: 'v',
                  scale: s,
                },
              },
              denominator: 'c',
              symbol: 'v1',
            },
          },
          // Method Array nested in Method Array
          2: {
            frac: [
              {
                frac: ['a', 'b', 'v', s],
              },
              'c',
              'v1',
            ],
          },
          // Method Array nested in Method Array, all in an Array
          3: [{ frac: [{ frac: ['a', 'b', 'v', s] }, 'c', 'v1'] }],
          // Method Array in a Function
          4: e.frac([
            {
              frac: ['a', 'b', 'v', s],
            },
            'c',
            'v1',
          ]),
          // Function in a Function
          5: e.frac([e.frac(['a', 'b', 'v', s]), 'c', 'v1']),
          // Bound function in a bound function
          6: frac(frac('a', 'b', 'v', s), 'c', 'v1'),
        });
      },
    };
  });
  test('Single Fraction', () => {
    functions.single();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._v, eqn._v1];
    const formsToTest = ['1', '2', '3', '4', '5'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });
  });
  test('Scale Fraction', () => {
    functions.scaling();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._v, eqn._v1];
    const scaleFormsToTest = ['s1', 's2'];
    const noScaleFormsToTest = ['n1', 'n2'];

    // Check all forms that were scaled are the same
    eqn.showForm('s0');
    let positions0 = elems.map(elem => round(elem.transform.mat).slice());
    scaleFormsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Check all forms that weren't scaled are the same
    eqn.showForm('n0');
    positions0 = elems.map(elem => round(elem.transform.mat).slice());
    noScaleFormsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Check height is double the scaled form
    const sHeight = eqn.eqn.forms.s0.base.content[0].content[0].content[0].height;
    const nHeight = eqn.eqn.forms.n0.base.content[0].content[0].content[0].height;
    expect(round(nHeight / sHeight)).toBe(2);
  });
  test('Nested Fractions', () => {
    functions.nested();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._v, eqn._v1];
    const formsToTest = ['1', '2', '3', '4', '5', '6'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._v.transform.mat)).toMatchSnapshot();
    expect(round(eqn._v1.transform.mat)).toMatchSnapshot();
  });
});
