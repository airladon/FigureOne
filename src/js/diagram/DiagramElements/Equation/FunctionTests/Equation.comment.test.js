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
      bar: {
        symbol: 'bar', side: 'top', lineWidth: 0.01,
      },
      bar1: {
        symbol: 'bar', side: 'top', lineWidth: 0.01,
      },
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
          // 4: e.topComment('a', 'b', 'bar'),
          // Bound Function with parameters
          // 5: topComment('a', 'b', 'bar'),
          // Bound Function with Object
          4: topComment({
            content: 'a',
            comment: 'b',
            symbol: 'bar',
          }),
        });
        diagram.elements = eqn;
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
          // 4: e.bottomComment('a', 'b', 'bar'),
          // // Bound Function with parameters
          // 5: bottomComment('a', 'b', 'bar'),
          // Bound Function with Object
          4: bottomComment({
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
          2: e.topComment(['a', 'b', 'bar', 0.1, 0.2, 2]),
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
          2: e.bottomComment(['a', 'b', 'bar', 0.1, 0.2, 2]),
        });
      },
      nestedTopComment: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        diagram.elements = eqn;
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              topComment: [
                { topComment: ['a', 'b', 'bar', 0.1, 0.1] },
                'c', 'bar1', 0.1, 0.1,
              ],
            },
            scale: 1,
          },
        });
      },
      nestedBottomComment: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        diagram.elements = eqn;
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              bottomComment: [
                { bottomComment: ['a', 'b', 'bar', 0.1, 0.1] },
                'c', 'bar1', 0.1, 0.1,
              ],
            },
            scale: 1,
          },
        });
      },
    };
  });
  test('nestedTopComment', () => {
    functions.nestedTopComment();
    eqn.showForm('base');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    const bar = eqn._bar.getBoundingRect('diagram');
    const bar1 = eqn._bar1.getBoundingRect('diagram');
    const space = 0.1;
    expect(round(bar.bottom)).toBe(round(a.top + space));
    expect(round(b.bottom)).toBe(round(bar.top + space));
    expect(round(bar1.bottom)).toBe(round(b.top + space));
    expect(round(c.bottom)).toBe(round(bar1.top + space));
  });
  test('nestedBottomComment', () => {
    functions.nestedBottomComment();
    eqn.showForm('base');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const b = eqn._b.getBoundingRect('diagram');
    const c = eqn._c.getBoundingRect('diagram');
    const bar = eqn._bar.getBoundingRect('diagram');
    const bar1 = eqn._bar1.getBoundingRect('diagram');
    const space = 0.1;
    expect(round(bar.top)).toBe(round(a.bottom - space));
    expect(round(b.top)).toBe(round(bar.bottom - space));
    expect(round(bar1.top)).toBe(round(b.bottom - space));
    expect(round(c.top)).toBe(round(bar1.bottom - space));
  });
  test('Top Comment', () => {
    functions.topComment();
    const elems = [eqn._a, eqn._b, eqn._bar];
    const formsToTest = ['1', '2', '3', '4'];

    eqn.showForm('0');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    diagram.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._bar.transform.mat)).toMatchSnapshot();
  });
  test('Bottom Comment', () => {
    functions.bottomComment();
    const elems = [eqn._a, eqn._b, eqn._bar];
    const formsToTest = ['1', '2', '3', '4'];

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
