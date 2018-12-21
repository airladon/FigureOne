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
      topComment: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topComment = e.topComment.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              topComment: {
                content: 'a',
                comment: 'b',
                symbol: 'bar',
              },
            },
          },
          //   // Method Object
          1: {
            topComment: {
              content: 'a',
              comment: 'b',
              symbol: 'bar',
            },
          },
          // Method Array
          2: { topComment: ['a', 'b', 'bar'] },
          // Function with Method Array
          3: e.topComment(['a', 'b', 'bar']),
          // Function with parameters
          4: e.topComment('a', 'b', 'bar'),
          // Bound Function with parameters
          5: topComment('a', 'b', 'bar'),
          // Bound Function with Object
          6: topComment({
            content: 'a',
            comment: 'b',
            symbol: 'bar',
          }),
        });
      },
      bottomComment: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomComment = e.bottomComment.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bottomComment: {
                content: 'a',
                comment: 'b',
                symbol: 'bar',
              },
            },
          },
          //   // Method Object
          1: {
            bottomComment: {
              content: 'a',
              comment: 'b',
              symbol: 'bar',
            },
          },
          // Method Array
          2: { bottomComment: ['a', 'b', 'bar'] },
          // Function with Method Array
          3: e.bottomComment(['a', 'b', 'bar']),
          // Function with parameters
          4: e.bottomComment('a', 'b', 'bar'),
          // Bound Function with parameters
          5: bottomComment('a', 'b', 'bar'),
          // Bound Function with Object
          6: bottomComment({
            content: 'a',
            comment: 'b',
            symbol: 'bar',
          }),
        });
      },
      topCommentParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topComment = e.topComment.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: topComment('a', 'b', 'bar'),
          // With parameters
          0: {
            topComment: {
              content: 'a',
              comment: 'b',
              symbol: 'bar',
              contentSpace: 0.1,
              commentSpace: 0.2,
              scale: 2,
            },
          },
          // Method Array
          1: { topComment: ['a', 'b', 'bar', 0.1, 0.2, 2] },
          // Function with parameters
          2: e.topComment('a', 'b', 'bar', 0.1, 0.2, 2),
        });
      },
      bottomCommentParameters: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomComment = e.bottomComment.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          without: bottomComment('a', 'b', 'bar'),
          // With parameters
          0: {
            bottomComment: {
              content: 'a',
              comment: 'b',
              symbol: 'bar',
              contentSpace: 0.1,
              commentSpace: 0.2,
              scale: 2,
            },
          },
          // Method Array
          1: { bottomComment: ['a', 'b', 'bar', 0.1, 0.2, 2] },
          // Function with parameters
          2: e.bottomComment('a', 'b', 'bar', 0.1, 0.2, 2),
        });
      },
    };
  });
  test('Top Comment', () => {
    functions.topComment();
    const elems = [eqn._a, eqn._b, eqn._bar];
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
    expect(round(eqn._bar.transform.mat)).toMatchSnapshot();
  });
  test('Bottom Comment', () => {
    functions.bottomComment();
    const elems = [eqn._a, eqn._b, eqn._bar];
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
  test('Top Comment Parameters', () => {
    functions.topCommentParameters();
    const elems = [eqn._a, eqn._b, eqn._bar];
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
  test('Bottom Comment Parameters', () => {
    functions.bottomComment();
    const elems = [eqn._a, eqn._b, eqn._bar];
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
