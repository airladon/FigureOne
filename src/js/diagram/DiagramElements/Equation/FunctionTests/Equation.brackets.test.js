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

describe('Equation Functions - Strike', () => {
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
      g: 'g',
      lb: { symbol: 'bracket', side: 'left' },
      rb: { symbol: 'bracket', side: 'right' },
      lb1: { symbol: 'bracket', side: 'left' },
      rb1: { symbol: 'bracket', side: 'right' },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const brac = e.brac.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              brac: {
                content: 'a',
                left: 'lb',
                right: 'rb',
              },
            },
          },
          //   // Method Object
          1: {
            brac: {
              content: 'a',
              left: 'lb',
              right: 'rb',
            },
          },
          // Method Array
          2: { brac: ['a', 'lb', 'rb'] },
          // Function with Method Array
          3: e.brac(['a', 'lb', 'rb']),
          // Function with parameters
          4: e.brac('a', 'lb', 'rb'),
          // Bound Function with parameters
          5: brac('a', 'lb', 'rb'),
          // Bound Function with Object
          6: brac({
            content: 'a',
            left: 'lb',
            right: 'rb',
          }),
        });
      },
      parameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const brac = e.brac.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: ['a', brac('b', 'lb', 'rb'), 'c'],
          // With parameters
          0: ['a', {
            brac: {
              content: 'b',
              left: 'lb',
              right: 'rb',
              insideSpace: 0.1,
              outsideSpace: 0.2,
              useMinLineHeight: false,
              heightScale: 2,
            },
          }, 'c'],
          // Method Array
          1: ['a', { brac: ['b', 'lb', 'rb', 0.1, 0.2, false, 2] }, 'c'],
          // Function with parameters
          2: ['a', brac('b', 'lb', 'rb', 0.1, 0.2, false, 2), 'c'],
        });
      },
    };
  });
  test('Bracket', () => {
    functions.single();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4', '5', '6'];

    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._lb.transform.mat)).toMatchSnapshot();
    expect(round(eqn._rb.transform.mat)).toMatchSnapshot();
  });
  test('Bracket Parameters', () => {
    functions.parameters();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._lb, eqn._rb];
    const withFormsToTest = ['1', '2'];

    // get without positions
    eqn.showForm('without');
    const withoutPos = elems.map(elem => round(elem.transform.mat).slice());

    // with reference positions
    eqn.showForm('0');
    const withPos = elems.map(elem => round(elem.transform.mat).slice());

    expect(withoutPos).not.toEqual(withPos);

    withFormsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(withPos).toEqual(positions);
    });
  });
});
