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

describe('Equation Functions - Brackets', () => {
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
      lb: {
        symbol: 'squareBracketNew', side: 'left', lineWidth: 0.01, endLength: 0.03,
      },
      rb: {
        symbol: 'squareBracketNew', side: 'right', lineWidth: 0.01, endLength: 0.03,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bracNew = e.bracNew.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bracNew: {
                content: 'a',
                left: 'lb',
                right: 'rb',
                insideSpace: 0.1,
                outsideSpace: 0.1,
                topSpace: 0.1,
                bottomSpace: 0.1,
              },
            },
          },
          // Method Object
          1: {
            bracNew: {
              content: 'a',
              left: 'lb',
              right: 'rb',
              insideSpace: 0.1,
              outsideSpace: 0.1,
              topSpace: 0.1,
              bottomSpace: 0.1,
            },
          },
          // Method Array
          2: { bracNew: ['a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1] },
          // Function with Method Array
          3: e.bracNew(['a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1]),
          // Function with parameters
          4: e.bracNew('a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1),
          // Bound Function with parameters
          5: bracNew('a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1),
          // Bound Function with Object
          6: bracNew({
            content: 'a',
            left: 'lb',
            right: 'rb',
            insideSpace: 0.1,
            outsideSpace: 0.1,
            topSpace: 0.1,
            bottomSpace: 0.1,
          }),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bracNew = e.bracNew.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // without
          //   // Method Object
          base: {
            content: [
              {
                bracNew: {
                  content: 'a',
                  left: 'lb',
                  right: 'rb',
                  insideSpace: 0.1,
                  outsideSpace: 0.1,
                  topSpace: 0.1,
                  bottomSpace: 0.1,
                  minContentHeight: null,
                  minContentDescent: null,
                  height: null,
                  descent: null,
                  inSize: null,
                },
              },
              'b',
            ],
            scale: 1,
          },
          insideSpace: {
            content: [bracNew(
              'a', 'lb', 'rb', 0.2, 0.1, 0.1, 0.1, null, null, null, null, null,
            ), 'b'],
            scale: 1,
          },
          outsideSpace: {
            content: [bracNew(
              'a', 'lb', 'rb', 0.1, 0.2, 0.1, 0.1, null, null, null, null, null,
            ), 'b'],
            scale: 1,
          },
          topSpace: {
            content: [bracNew(
              'a', 'lb', 'rb', 0.1, 0.1, 0.2, 0.1, null, null, null, null, null,
            ), 'b'],
            scale: 1,
          },
          bottomSpace: {
            content: [bracNew(
              'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.2, null, null, null, null, null,
            ), 'b'],
            scale: 1,
          },
        });
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseB;
    let baseL;
    let baseR;
    let baseA;
    let baseLScale;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      baseA = eqn._a.getPosition();
      baseB = eqn._b.getPosition();
      baseL = eqn._lb.getPosition();
      baseR = eqn._rb.getPosition();
      baseLScale = eqn._lb.custom.scale._dup();
    });
    test('bottomSpace', () => {
      eqn.showForm('bottomSpace');
      const newLScale = eqn._lb.custom.scale._dup();
      const newL = eqn._lb.getPosition();
      expect(round(baseLScale.y + 0.1)).toBe(round(newLScale.y));
      expect(round(baseL.y - 0.1)).toBe(round(newL.y));
    });
    test('topSpace', () => {
      eqn.showForm('topSpace');
      const newLScale = eqn._lb.custom.scale._dup();
      const newL = eqn._lb.getPosition();
      expect(round(baseLScale.y + 0.1)).toBe(round(newLScale.y));
      expect(round(baseL.y)).toBe(round(newL.y));
    });
    test('outsideSpace', () => {
      eqn.showForm('outsideSpace');
      const newB = eqn._b.getPosition();
      const newL = eqn._lb.getPosition();
      const newR = eqn._rb.getPosition();
      const newA = eqn._a.getPosition();
      expect(round(baseL.x + 0.1)).toBe(round(newL.x));
      expect(round(baseA.x + 0.1)).toBe(round(newA.x));
      expect(round(baseR.x + 0.1)).toBe(round(newR.x));
      expect(round(baseB.x + 0.2)).toBe(round(newB.x));
    });
    test('insideSpace', () => {
      eqn.showForm('insideSpace');
      const newB = eqn._b.getPosition();
      const newL = eqn._lb.getPosition();
      const newR = eqn._rb.getPosition();
      const newA = eqn._a.getPosition();
      expect(round(baseL.x)).toBe(round(newL.x));
      expect(round(baseA.x + 0.1)).toBe(round(newA.x));
      expect(round(baseR.x + 0.2)).toBe(round(newR.x));
      expect(round(baseB.x + 0.2)).toBe(round(newB.x));
    });
  });
  test('Bracket', () => {
    functions.single();
    const elems = [eqn._a, eqn._lb, eqn._rb];
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
});
