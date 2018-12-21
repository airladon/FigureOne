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

describe('Equation Functions - Bar', () => {
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
      x: { symbol: 'strike' },
    };
    functions = {
      topStrike: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topStrike = e.topStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              topStrike: {
                content: 'a',
                comment: 'b',
                symbol: 'x',
              },
            },
          },
          //   // Method Object
          1: {
            topStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
            },
          },
          // Method Array
          2: { topStrike: ['a', 'b', 'x'] },
          // Function with Method Array
          3: e.topStrike(['a', 'b', 'x']),
          // Function with parameters
          4: e.topStrike('a', 'b', 'x'),
          // Bound Function with parameters
          5: topStrike('a', 'b', 'x'),
          // Bound Function with Object
          6: topStrike({
            content: 'a',
            comment: 'b',
            symbol: 'x',
          }),
        });
      },
      bottomStrike: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomStrike = e.bottomStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bottomStrike: {
                content: 'a',
                comment: 'b',
                symbol: 'x',
              },
            },
          },
          //   // Method Object
          1: {
            bottomStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
            },
          },
          // Method Array
          2: { bottomStrike: ['a', 'b', 'x'] },
          // Function with Method Array
          3: e.bottomStrike(['a', 'b', 'x']),
          // Function with parameters
          4: e.bottomStrike('a', 'b', 'x'),
          // Bound Function with parameters
          5: bottomStrike('a', 'b', 'x'),
          // Bound Function with Object
          6: bottomStrike({
            content: 'a',
            comment: 'b',
            symbol: 'x',
          }),
        });
      },
      topStrikeParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topStrike = e.topStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: topStrike('a', 'b', 'x'),
          // With parameters
          0: {
            topStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
              space: 0.1,
              scale: 2,
            },
          },
          // Method Array
          1: { topStrike: ['a', 'b', 'x', 0.1, 2] },
          // Function with parameters
          2: e.topStrike('a', 'b', 'x', 0.1, 2),
        });
      },
      bottomStrikeParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomStrike = e.bottomStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: bottomStrike('a', 'b', 'x'),
          // With parameters
          0: {
            bottomStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
              space: 0.1,
              scale: 2,
            },
          },
          // Method Array
          1: { bottomStrike: ['a', 'b', 'x', 0.1, 2] },
          // Function with parameters
          2: e.bottomStrike('a', 'b', 'x', 0.1, 2),
        });
      },
    };
  });
  test('Top Strike', () => {
    functions.topStrike();
    const elems = [eqn._a, eqn._b, eqn._x];
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
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._x.transform.mat)).toMatchSnapshot();
  });
  test('Bottom Strike', () => {
    functions.bottomStrike();
    const elems = [eqn._a, eqn._b, eqn._x];
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
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._x.transform.mat)).toMatchSnapshot();
  });
  test('Top Strike Parameters', () => {
    functions.topStrikeParameters();
    const elems = [eqn._a, eqn._b, eqn._x];
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
  test('Bottom Strike Parameters', () => {
    functions.bottomStrike();
    const elems = [eqn._a, eqn._b, eqn._x];
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
