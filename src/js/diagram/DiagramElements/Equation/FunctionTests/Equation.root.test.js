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
      root: { symbol: 'radical', color: [0, 0.9, 0, 1] },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const root = e.root.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              root: {
                content: 'a',
                symbol: 'root',
              },
            },
          },
          //   // Method Object
          // 1: {
          //   box: {
          //     content: 'a',
          //     symbol: 'box',
          //   },
          // },
          // // Method Array
          // 2: { box: ['a', 'box'] },
          // // Function with Method Array
          // 3: e.box(['a', 'box']),
          // // Function with parameters
          // 4: e.box('a', 'box'),
          // // Bound Function with parameters
          // 5: box('a', 'box'),
          // // Bound Function with Object
          // 6: box({
          //   content: 'a',
          //   symbol: 'box',
          // }),
        });
      },
      // parameters: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   const e = eqn.eqn.functions;
      //   const box = e.box.bind(e);
      //   eqn.addElements(elements);
      //   eqn.addForms({
      //     // without
      //     //   // Method Object
      //     without: box('a', 'box'),
      //     with0True: box('a', 'box', true),
      //     with0False: box('a', 'box', false),
      //     with1False: box('a', 'box', false, 0.1),
      //     // With parameters
      //     0: {
      //       box: {
      //         content: 'a',
      //         symbol: 'box',
      //         inSize: true,
      //         space: 0.1,
      //       },
      //     },
      //     // Method Array
      //     1: { box: ['a', 'box', true, 0.1] },
      //     // Function with parameters
      //     2: e.box('a', 'box', true, 0.1),
      //   });
      // },
      // box: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   eqn.addElements(elements);
      // },
    };
  });
  test('Root', () => {
    functions.single();
    // const elems = [eqn._a, eqn._b, eqn._c];
    // const formsToTest = ['1', '2', '3', '4', '5', '6'];


    eqn.showForm('0');
    // const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    // formsToTest.forEach((f) => {
    //   eqn.showForm(f);
    //   const positions = elems.map(elem => round(elem.transform.mat).slice());
    //   expect(positions0).toEqual(positions);
    // });

    // // Snapshot test on most simple layout
    // eqn.showForm('0');
    // tools.cleanUIDs(eqn);
    // expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    // expect(round(eqn._box.transform.mat)).toMatchSnapshot();
  });
  // test('Box Parameters', () => {
  //   functions.parameters();
  //   const elems = [eqn._a];
  //   const withoutFormsToTest = ['with0True', 'with0False', 'with1False'];
  //   const withFormsToTest = ['1', '2'];

  //   // get without positions
  //   eqn.showForm('without');
  //   const withoutPos = elems.map(elem => round(elem.transform.mat).slice());

  //   withoutFormsToTest.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(withoutPos).toEqual(positions);
  //   });

  //   // with reference positions
  //   eqn.showForm('0');
  //   const withPos = elems.map(elem => round(elem.transform.mat).slice());
  //   expect(withoutPos).not.toEqual(withPos);

  //   withFormsToTest.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(withPos).toEqual(positions);
  //   });
  // });
  // test('Box Line Element', () => {
  //   functions.box();
  //   const w = 0.1;
  //   const box = eqn._box;
  //   const a = eqn._a.getBoundingRect();
  //   box.custom.setSize(a);

  //   let bx = box.getBoundingRect();
  //   // console.log(box.drawingObject.points)
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2));
  //   expect(round(bx.width)).toEqual(round(a.width + w));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2));
  //   expect(round(bx.height)).toEqual(round(a.height + w));

  //   let s = 0.1; // space
  //   box.custom.setSize(a, s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));

  //   s = 0.2;
  //   box.custom.setSize(eqn, ['a'], s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));
  // });
  // test('Box Fill Element', () => {
  //   functions.box();
  //   const w = 0;
  //   const box = eqn._box1;
  //   const a = eqn._a.getBoundingRect();
  //   box.custom.setSize(a);

  //   let bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2));
  //   expect(round(bx.width)).toEqual(round(a.width + w));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2));
  //   expect(round(bx.height)).toEqual(round(a.height + w));

  //   let s = 0.1; // space
  //   box.custom.setSize(a, s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));

  //   s = 0.2;
  //   box.custom.setSize(eqn, ['a'], s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));
  // });
});
