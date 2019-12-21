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
      v: { symbol: 'vinculumNew' },
      v1: { symbol: 'vinculumNew' },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        eqn.addElements(elements);
        diagram.elements = eqn;
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
                numeratorSpace: 0.01,
                denominatorSpace: 0.02,
                overhang: 0.03,
                offsetY: 0.04,
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
              numeratorSpace: 0.01,
              denominatorSpace: 0.02,
              overhang: 0.03,
              offsetY: 0.04,
            },
          },
          // Method Array
          2: { frac: ['a', 'v', 'b', s, 0.01, 0.02, 0.03, 0.04] },
          // Function with Method Array
          3: e.frac(['a', 'v', 'b', s, 0.01, 0.02, 0.03, 0.04]),
        });
      },
      scaling: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        // const frac = e.frac.bind(e);
        eqn.addElements(elements);
        diagram.elements = eqn;
        const s = 0.5;
        eqn.addForms({
          // Method Array with scale defined
          s0: { frac: ['a', 'v', 'b', s] },
          // Function with Method Array with scale defined
          s1: e.frac(['a', 'v', 'b', s]),
          // Bound Function with parameters and scale defined
          // s2: frac('a', 'v', 'b', s),

          // Method Array without scale defined
          n0: { frac: ['a', 'v', 'b'] },
          // Function with Method Array without scale defined
          n1: e.frac(['a', 'v', 'b']),
          // Bound Function with parameters without scale defined
          // n2: frac('a', 'v', 'b'),
        });
      },
      nested: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        // const frac = e.frac.bind(e);
        eqn.addElements(elements);
        diagram.elements = eqn;
        const s = 0.5;
        eqn.addForms({
          // Full Object
          0: {
            content: {
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
          },
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
          // // Method Array nested in Method Array
          2: {
            frac: [
              {
                frac: ['a', 'v', 'b', s],
              },
              'v1',
              'c',
            ],
          },
          // // Method Array nested in Method Array, all in an Array
          3: [{ frac: [{ frac: ['a', 'v', 'b', s] }, 'v1', 'c'] }],
          // // Method Array in a Function
          4: e.frac([
            {
              frac: ['a', 'v', 'b', s],
            },
            'v1',
            'c',
          ]),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        // const e = eqn.eqn.functions;
        eqn.addElements(elements);
        diagram.elements = eqn;
        eqn.addForms({
          // Full Object
          base: {
            content: {
              frac: {
                numerator: 'a',
                symbol: 'v',
                denominator: 'b',
                scale: 1,
                numeratorSpace: 0.01,
                denominatorSpace: 0.01,
                overhang: 0.01,
                offsetY: 0.01,
              },
            },
            scale: 1,
          },
          numeratorSpace: {
            content: { frac: ['a', 'v', 'b', 1, 0.02, 0.01, 0.01, 0.01] },
            scale: 1,
          },
          denominatorSpace: {
            content: { frac: ['a', 'v', 'b', 1, 0.01, 0.02, 0.01, 0.01] },
            scale: 1,
          },
          overhang: {
            content: { frac: ['a', 'v', 'b', 1, 0.01, 0.01, 0.02, 0.01] },
            scale: 1,
          },
          offsetY: {
            content: { frac: ['a', 'v', 'b', 1, 0.01, 0.01, 0.01, 0.02] },
            scale: 1,
          },
        });
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseB;
    let baseV;
    let space;
    let overhang;
    let offsetY;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseV = eqn._v.getBoundingRect('diagram');
      space = 0.01;
      overhang = 0.02;
      offsetY = 0.02;
    });
    test('Numerator Space', () => {
      eqn.showForm('numeratorSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newV = eqn._v.getBoundingRect('diagram');
      expect(round(newA.top)).toBe(round(baseA.top + space));
      expect(round(newV.top)).toBe(round(baseV.top));
      expect(round(newB.top)).toBe(round(baseB.top));
    });
    test('Denominator Space', () => {
      eqn.showForm('denominatorSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newV = eqn._v.getBoundingRect('diagram');
      expect(round(newA.top)).toBe(round(baseA.top));
      expect(round(newV.top)).toBe(round(baseV.top));
      expect(round(newB.top)).toBe(round(baseB.top - space));
    });
    test('Overhang', () => {
      eqn.showForm('overhang');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newV = eqn._v.getBoundingRect('diagram');
      expect(round(newA.left)).toBe(round(newV.left + overhang));
      expect(round(newV.left)).toBe(round(baseV.left));
      expect(round(newV.width)).toBe(round(baseV.width + overhang));
      expect(round(newB.left)).toBe(round(newV.left + overhang));
    });
    test('OffsetY', () => {
      eqn.showForm('offsetY');
      diagram.setFirstTransform();
      const newV = eqn._v.getBoundingRect('diagram');
      expect(round(newV.bottom)).toBe(round(offsetY));
    });
  });
  test('Single Fraction', () => {
    functions.single();
    const elems = [eqn._a, eqn._b, eqn._v];
    const formsToTest = ['1', '2', '3'];

    eqn.showForm('0');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });
  });
  test('Scale Fraction', () => {
    functions.scaling();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._v, eqn._v1];
    const scaleFormsToTest = ['s1'];
    const noScaleFormsToTest = ['n1'];

    // Check all forms that were scaled are the same
    eqn.showForm('s0');
    diagram.setFirstTransform();
    let positions0 = elems.map(elem => round(elem.transform.mat).slice());
    scaleFormsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
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
    const sHeight = eqn.eqn.forms.s0.base.content[0].content[0].content[1].height;
    // console.log(eqn.eqn.forms.s0.base.content[0].content[0])
    const nHeight = eqn.eqn.forms.n0.base.content[0].content[0].content[1].height;
    expect(round(nHeight / sHeight)).toBe(2);
  });
  test('Nested Fractions', () => {
    functions.nested();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._v, eqn._v1];
    const formsToTest = ['1', '2', '3', '4', '5'];

    eqn.showForm('0');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
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
