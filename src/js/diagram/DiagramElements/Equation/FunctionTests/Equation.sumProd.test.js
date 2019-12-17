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

describe('Equation Functions - SumPro', () => {
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
      s: {
        symbol: 'int', lineWidth: 0.01, draw: 'static', staticHeight: 0.5,
      },
    };
    functions = {
      // single: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   const e = eqn.eqn.functions;
      //   const sum = e.sum.bind(e);
      //   eqn.addElements(elements);
      //   eqn.addForms({
      //     // Full Object
      //     0: {
      //       sumProd: {
      //         brac: {
      //           content: 'a',
      //           left: 'lb',
      //           right: 'rb',
      //           inSize: true,
      //           insideSpace: 0.1,
      //           outsideSpace: 0.1,
      //           topSpace: 0.1,
      //           bottomSpace: 0.1,
      //         },
      //       },
      //     },
      //     // Method Object
      //     1: {
      //       brac: {
      //         content: 'a',
      //         left: 'lb',
      //         right: 'rb',
      //         inSize: true,
      //         insideSpace: 0.1,
      //         outsideSpace: 0.1,
      //         topSpace: 0.1,
      //         bottomSpace: 0.1,
      //       },
      //     },
      //     // Method Array
      //     2: { brac: ['a', 'lb', 'rb', true, 0.1, 0.1, 0.1, 0.1] },
      //     // Function with Method Array
      //     3: e.brac(['a', 'lb', 'rb', true, 0.1, 0.1, 0.1, 0.1]),
      //     // Function with parameters
      //     4: e.brac('a', 'lb', 'rb', true, 0.1, 0.1, 0.1, 0.1),
      //     // Bound Function with parameters
      //     5: brac('a', 'lb', 'rb', true, 0.1, 0.1, 0.1, 0.1),
      //     // Bound Function with Object
      //     6: brac({
      //       content: 'a',
      //       left: 'lb',
      //       right: 'rb',
      //       inSize: true,
      //       insideSpace: 0.1,
      //       outsideSpace: 0.1,
      //       topSpace: 0.1,
      //       bottomSpace: 0.1,
      //     }),
      //   });
      // },
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              sumProd: ['a', 'b', 'c', 's'],
            },
            scale: 1,
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('test', () => {
    functions.single();
    // const elems = [eqn._a, eqn._s];
    eqn.showForm('0');
    diagram.setFirstTransform();
    console.log(eqn._s.getScale())
    console.log(eqn._s.getTransform())
    // console.log(eqn._a.getBoundingRect('diagram'))
    // console.log(eqn._s.getBoundingRect('diagram'));
    // console.log(eqn._b.getBoundingRect('diagram'));
    // console.log(eqn._c.getBoundingRect('diagram'));
  });
});
