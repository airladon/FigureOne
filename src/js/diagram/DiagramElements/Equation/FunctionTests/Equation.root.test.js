import {
  Point,
} from '../../../../tools/g2';
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

describe('Equation Functions - Root', () => {
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
      root1: {
        symbol: 'radical',
        color: color1,
        lineWidth: 0.01,
        startHeight: 0.5,
        startWidth: 0.7,
        maxStartHeight: 0.15,
        maxStartWidth: 0.15,
        proportionalToHeight: true,
        // staticSize: [3, 1],
      },
      root2: {
        symbol: 'radical',
        color: color1,
        lineWidth: 0.01,
        startHeight: 0.5,
        startWidth: 0.7,
        maxStartHeight: null,
        maxStartWidth: null,
      },
      root3: {
        symbol: 'radical',
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const root = e.root.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          0: {
            root: {
              content: 'a',
              symbol: 'root3',
              root: 'b',
              contentSpace: {
                left: 0.01, bottom: 0, top: 0.02, right: 0.1,
              },
              rootSpace: [0.01, 0.01],
              rootScale: 0.8,
            },
          },
          // Method Array
          1: {
            root: ['a', 'root3', 'b', {
              left: 0.01, bottom: 0, top: 0.02, right: 0.1,
            }, [0.01, 0.01], 0.8],
          },
          // Function with Method Array
          2: e.root(['a', 'root3', 'b', {
            left: 0.01, bottom: 0, top: 0.02, right: 0.1,
          }, [0.01, 0.01], 0.8]),
          // Function with parameters
          3: e.root('a', 'root3', 'b', {
            left: 0.01, bottom: 0, top: 0.02, right: 0.1,
          }, [0.01, 0.01], 0.8),
          // Bound Function with parameters
          4: root('a', 'root3', 'b', {
            left: 0.01, bottom: 0, top: 0.02, right: 0.1,
          }, [0.01, 0.01], 0.8),
          // Bound Function with Object
          5: root({
            content: 'a',
            symbol: 'root3',
            root: 'b',
            contentSpace: {
              left: 0.01, bottom: 0, top: 0.02, right: 0.1,
            },
            rootSpace: [0.01, 0.01],
            rootScale: 0.8,
          }),
        });
      },
      symbols: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          0: { root: ['a', 'root1'] },
          1: { root: ['a', 'root2'] },
          2: { root: ['a', 'root3'] },
        });
      },
      contentSpace: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          0: { root: ['a', 'root1', null, 0.01] },
          1: { root: ['a', 'root1', null, [0.01, 0.01]] },
          2: { root: ['a', 'root1', null, new Point(0.01, 0.01)] },
          3: {
            root: ['a', 'root1', null, {
              left: 0.01, bottom: 0.01, top: 0.01, right: 0.01,
            }],
          },
        });
      },
      parameterDeltas: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // Method Object
          a0: {
            root: {
              content: 'a',
              symbol: 'root3',
              root: 'b',
              contentSpace: {
                left: 0.01, bottom: 0, top: 0.02, right: 0.1,
              },
              rootSpace: [0.01, 0.01],
              rootScale: 0.8,
            },
          },
          a1: {
            root: {
              content: 'a',
              symbol: 'root3',
              root: 'b',
              contentSpace: {
                left: 0.02, bottom: 0, top: 0.02, right: 0.1,
              },
              rootSpace: [0.01, 0.01],
              rootScale: 0.8,
            },
          },
        });
      },
    };
  });
  test('', () => {
    expect(true).toBe(true);
  });
  // test('Root', () => {
  //   functions.single();
  //   const elems = [eqn._a, eqn._b];
  //   const formsToTest = ['1', '2', '3', '4', '5'];
  //   eqn.showForm('0');
  //   const positions0 = elems.map(elem => round(elem.transform.mat).slice());
  //   formsToTest.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(positions0).toEqual(positions);
  //   });

  //   // Snapshot test on most simple layout
  //   eqn.showForm('0');
  //   tools.cleanUIDs(eqn);
  //   expect(round(eqn._a.transform.mat)).toMatchSnapshot();
  //   expect(round(eqn._root3.transform.mat)).toMatchSnapshot();
  // });
  // test('Deltas', () => {
  //   functions.parameterDeltas();
  //   eqn.showForm('a0');
  //   const a0 = eqn._a.getPosition();
  //   eqn.showForm('a1');
  //   const a1 = eqn._a.getPosition();
  //   expect(round(a1.x - a0.x)).toBe(0.01);
  // });
  // test('Symbols', () => {
  //   functions.symbols();
  //   eqn.showForm('0');
  //   expect(round(eqn._a.transform.mat)).toMatchSnapshot();
  //   expect(round(eqn._root1.transform.mat)).toMatchSnapshot();

  //   eqn.showForm('1');
  //   expect(round(eqn._a.transform.mat)).toMatchSnapshot();
  //   expect(round(eqn._root2.transform.mat)).toMatchSnapshot();

  //   eqn.showForm('2');
  //   expect(round(eqn._a.transform.mat)).toMatchSnapshot();
  //   expect(round(eqn._root3.transform.mat)).toMatchSnapshot();
  // });
  // test('ContentSpace', () => {
  //   functions.contentSpace();
  //   const elems = [eqn._a, eqn._root1];
  //   const formsToTest = ['1', '2', '3'];
  //   eqn.showForm('0');
  //   const positions0 = elems.map(elem => round(elem.transform.mat).slice());
  //   formsToTest.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(positions0).toEqual(positions);
  //   });
  // });
});
