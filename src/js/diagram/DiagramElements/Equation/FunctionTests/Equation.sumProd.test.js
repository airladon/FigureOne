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
        symbol: 'sum', lineWidth: 0.01, draw: 'dynamic',
      },
    };
    functions = {
      inputForms: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const sumOf = e.sumOf.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              sumOf: {
                content: 'a',
                from: 'b',
                to: 'c',
                symbol: 's',
                inSize: true,
                space: 0,
                topSpace: 0.1,
                bottomSpace: 0.1,
                height: null,
                yOffset: 0,
                scale: 1,
                fromScale: 1,
                toScale: 1,
                fromSpace: 0.1,
                toSpace: 0.1,
                fromOffset: [0.1, 0.1],
                toOffset: [-0.1, -0.1],
              },
            },
          },
          // Method Object
          1: {
            sumOf: {
              content: 'a',
              from: 'b',
              to: 'c',
              symbol: 's',
              inSize: true,
              space: 0,
              topSpace: 0.1,
              bottomSpace: 0.1,
              height: null,
              yOffset: 0,
              scale: 1,
              fromScale: 1,
              toScale: 1,
              fromSpace: 0.1,
              toSpace: 0.1,
              fromOffset: [0.1, 0.1],
              toOffset: [-0.1, -0.1],
            },
          },
          // Method Array
          2: { sumOf: ['a', 'b', 'c', 's', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]] },
          // Function with Method Array
          3: e.sumOf(['a', 'b', 'c', 's', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]]),
          // Function with parameters
          4: e.sumOf('a', 'b', 'c', 's', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]),
          // Bound Function with parameters
          5: sumOf('a', 'b', 'c', 's', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]),
          // Bound Function with Object
          6: sumOf({
            content: 'a',
            from: 'b',
            to: 'c',
            symbol: 's',
            inSize: true,
            space: 0,
            topSpace: 0.1,
            bottomSpace: 0.1,
            height: null,
            yOffset: 0,
            scale: 1,
            fromScale: 1,
            toScale: 1,
            fromSpace: 0.1,
            toSpace: 0.1,
            fromOffset: [0.1, 0.1],
            toOffset: [-0.1, -0.1],
          }),
        });
      },
      // single: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   eqn.addElements(elements);
      //   eqn.addForms({
      //     // Full Object
      //     0: {
      //       content: {
      //         sumOf: ['a', 'b', 'c', 's'],
      //       },
      //       scale: 1,
      //     },
      //   });
      //   diagram.elements = eqn;
      // },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const sumOf = e.sumOf.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              sumOf: {
                content: 'a',
                from: 'b',
                to: 'c',
                symbol: 's',
                inSize: true,
                space: 0.01,
                topSpace: 0.01,
                bottomSpace: 0.01,
                height: null,
                yOffset: 0,
                scale: 1,
                fromScale: 1,
                toScale: 1,
                fromSpace: 0.01,
                toSpace: 0.01,
                fromOffset: [0, 0],
                toOffset: [0, 0],
              },
            },
            scale: 1,
          },
          space: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.1, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          topSpace: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.1, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          bottomSpace: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.01, 0.1, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          topBottomSpace: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.1, 0.1, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          heightAndOverride: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 1, 1, 1,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          heightYOffset: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.01, 0.01, 1,
              0.1, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          yOffsetNegative: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.01, 0.01, null,
              -0.1, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
          delta: {
            content: sumOf(
              'a', 'b', 'c', 's', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ),
            scale: 1,
          },
        });
        diagram.elements = eqn;
        diagram.setFirstTransform();
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseB;
    let baseC;
    let baseS;
    let baseSScale;
    let space;
    let spaceDelta;
    let height;
    let yOffset;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      baseS = eqn._s.getBoundingRect('diagram');
      space = 0.1;
      spaceDelta = 0.09;
      height = 1;
      yOffset = 0.1;
      // baseSScale = eqn._s.custom.scale._dup();
    });
    // Note, the letter a has the following bounds:
    // width: 0.04000000000000001,
    // height: 0.10300000000000001,
    // descent: -0.008,
    // ascent: top: 0.095,
    test('space', () => {
      eqn.showForm('space');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      expect(round(newA.left)).toBe(round(baseA.left + spaceDelta));
    });
    test('topSpace', () => {
      eqn.showForm('topSpace');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.top)).toBe(round(baseS.top + spaceDelta));
    });
    test('bottomSpace', () => {
      eqn.showForm('bottomSpace');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - spaceDelta));
      expect(round(newS.top)).toBe(round(baseS.top));
    });
    test('topBottomSpace', () => {
      eqn.showForm('topBottomSpace');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta * 2));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - spaceDelta));
      expect(round(newS.top)).toBe(round(baseS.top + spaceDelta));
    });
    test('heightAndOverride', () => {
      eqn.showForm('heightAndOverride');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - (height - baseS.height) / 2));
      expect(round(newS.top)).toBe(round(baseS.top + (height - baseS.height) / 2));
    });
    test('heightYOffset', () => {
      eqn.showForm('heightYOffset');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - (height - baseS.height) / 2 + yOffset));
      expect(round(newS.top)).toBe(round(baseS.top + (height - baseS.height) / 2 + yOffset));
    });
    test('yOffsetNegative', () => {
      eqn.showForm('yOffsetNegative');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - yOffset));
      expect(round(newS.top)).toBe(round(baseS.top - yOffset));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._s];
    const formsToTest = ['1', '2', '3', '4', '5', '6'];
    eqn.showForm('base');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s.transform.mat)).toMatchSnapshot();
  });
  // test('test', () => {
  //   functions.single();
  //   // const elems = [eqn._a, eqn._s];
  //   eqn.showForm('0');
  //   diagram.setFirstTransform();
  //   console.log(eqn._s.getScale())
  //   console.log(eqn._s.getTransform())
  //   // console.log(eqn._a.getBoundingRect('diagram'))
  //   // console.log(eqn._s.getBoundingRect('diagram'));
  //   // console.log(eqn._b.getBoundingRect('diagram'));
  //   // console.log(eqn._c.getBoundingRect('diagram'));
  // });
});
