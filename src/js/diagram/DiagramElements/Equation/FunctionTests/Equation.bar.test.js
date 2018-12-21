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
      bar: { symbol: 'bar', side: 'top' },
    };
    functions = {
      topBar: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topBar = e.topBar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              topBar: {
                content: 'a',
                symbol: 'bar',
              },
            },
          },
          //   // Method Object
          1: {
            topBar: {
              content: 'a',
              symbol: 'bar',
            },
          },
          // Method Array
          2: { topBar: ['a', 'bar'] },
          // Function with Method Array
          3: e.topBar(['a', 'bar']),
          // Function with parameters
          4: e.topBar('a', 'bar'),
          // Bound Function with parameters
          5: topBar('a', 'bar'),
          // Bound Function with Object
          6: topBar({
            content: 'a',
            symbol: 'bar',
          }),
        });
      },
      bottomBar: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomBar = e.bottomBar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bottomBar: {
                content: 'a',
                symbol: 'bar',
              },
            },
          },
          //   // Method Object
          1: {
            bottomBar: {
              content: 'a',
              symbol: 'bar',
            },
          },
          // Method Array
          2: { bottomBar: ['a', 'bar'] },
          // Function with Method Array
          3: e.bottomBar(['a', 'bar']),
          // Function with parameters
          4: e.bottomBar('a', 'bar'),
          // Bound Function with parameters
          5: bottomBar('a', 'bar'),
          // Bound Function with Object
          6: bottomBar({
            content: 'a',
            symbol: 'bar',
          }),
        });
      },
      topBarParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topBar = e.topBar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: topBar('a', 'bar'),
          // With parameters
          0: {
            topBar: {
              content: 'a',
              symbol: 'bar',
              space: 0.1,
            },
          },
          // Method Array
          1: { topBar: ['a', 'bar', 0.1] },
          // Function with parameters
          2: e.topBar('a', 'bar', 0.1),
        });
      },
      bottomBarParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomBar = e.bottomBar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: bottomBar('a', 'bar'),
          // With parameters
          0: {
            bottomBar: {
              content: 'a',
              symbol: 'bar',
              space: 0.1,
            },
          },
          // Method Array
          1: { bottomBar: ['a', 'bar', 0.1] },
          // Function with parameters
          2: e.bottomBar('a', 'bar', 0.1),
        });
      },
    };
  });
  test('Top Bar', () => {
    functions.topBar();
    const elems = [eqn._a, eqn._bar];
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
    expect(round(eqn._bar.transform.mat)).toMatchSnapshot();
  });
  test('Bottom Bar', () => {
    functions.bottomBar();
    const elems = [eqn._a, eqn._bar];
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
    expect(round(eqn._bar.transform.mat)).toMatchSnapshot();
  });
  test('topBar Parameters', () => {
    functions.topBarParameters();
    const elems = [eqn._a, eqn._bar];
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
  test('bottomBar Parameters', () => {
    functions.bottomBarParameters();
    const elems = [eqn._a, eqn._bar];
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
