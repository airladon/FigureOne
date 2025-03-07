import {
  Point,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Equation Functions - SumPro', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    figure = makeFigure();
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
        eqn = new Equation(figure.shapes, { color: color1 });
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
          2: { sumOf: ['s', 'a', 'b', 'c', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]] },
          // Function with Method Array
          3: e.sumOf(['s', 'a', 'b', 'c', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, 0.1, 0.1, [0.1, 0.1], [-0.1, -0.1]]),
          // Bound Function with Object
          4: sumOf({
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
        figure.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
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
          inSizeFalse: {
            content: sumOf([
              's', 'a', 'b', 'c', false, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          space: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.1, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          topSpace: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.1, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          bottomSpace: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.1, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          topBottomSpace: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.1, 0.1, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          heightAndOverride: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 1, 1, 1,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          heightYOffset: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, 1,
              0.1, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          heightCenterYOffset: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, null, null, 1,
              0.1, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          yOffsetNegative: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              -0.1, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          scale: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 0.5, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          fromScale: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 0.5, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          toScale: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 0.5, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          fromSpace: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.1, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          toSpace: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.1, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          fromOffset: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [-0.3, -0.2], [0, 0],
            ]),
            scale: 1,
          },
          toOffset: {
            content: sumOf([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0.3, 0.2],
            ]),
            scale: 1,
          },
          noFrom: {
            content: sumOf([
              's', 'a', '', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
          noTo: {
            content: sumOf([
              's', 'a', 'b', '', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, 0.01, 0.01, [0, 0], [0, 0],
            ]),
            scale: 1,
          },
        });
        figure.elements = eqn;
        figure.setFirstTransform();
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseB;
    let baseC;
    let baseS;
    // let baseSScale;
    // let space;
    let spaceDelta;
    let height;
    let yOffset;
    let scale;
    let initialSpace;
    let offset;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseA = eqn._a.getBoundingRect('local');
      baseB = eqn._b.getBoundingRect('local');
      baseC = eqn._c.getBoundingRect('local');
      baseS = eqn._s.getBoundingRect('local');
      // space = 0.1;
      spaceDelta = 0.09;
      height = 1;
      yOffset = 0.1;
      scale = 0.5;
      initialSpace = 0.01;
      offset = new Point(0.3, 0.2);
      // baseSScale = eqn._s.custom.scale._dup();
    });
    // Note, the letter a has the following bounds:
    // width: 0.04000000000000001,
    // height: 0.10300000000000001,
    // descent: -0.008,
    // ascent: top: 0.095,
    test('space', () => {
      eqn.showForm('space');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      expect(round(newA.left)).toBe(round(baseA.left + spaceDelta));
    });
    test('topSpace', () => {
      eqn.showForm('topSpace');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.top)).toBe(round(baseS.top + spaceDelta));
    });
    test('bottomSpace', () => {
      eqn.showForm('bottomSpace');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - spaceDelta));
      expect(round(newS.top)).toBe(round(baseS.top));
    });
    test('topBottomSpace', () => {
      eqn.showForm('topBottomSpace');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height + spaceDelta * 2));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - spaceDelta));
      expect(round(newS.top)).toBe(round(baseS.top + spaceDelta));
    });
    test('heightAndOverride', () => {
      eqn.showForm('heightAndOverride');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseA.bottom - 1));
      expect(round(newS.top)).toBe(round(newS.bottom + height));
    });
    test('heightCenterYOffset', () => {
      eqn.showForm('heightCenterYOffset');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - (height - baseS.height) / 2 + yOffset));
      expect(round(newS.top)).toBe(round(baseS.top + (height - baseS.height) / 2 + yOffset));
    });
    test('heightYOffset', () => {
      eqn.showForm('heightYOffset');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom + yOffset));
      expect(round(newS.top)).toBe(round(newS.bottom + height));
    });
    test('yOffsetNegative', () => {
      eqn.showForm('yOffsetNegative');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - yOffset));
      expect(round(newS.top)).toBe(round(baseS.top - yOffset));
    });
    test('scale', () => {
      eqn.showForm('scale');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newA = eqn._a.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseA.height * scale + initialSpace * 2));
      expect(round(newA.height)).toBe(round(baseA.height * scale));
      expect(round(newS.bottom)).toBe(round(newA.bottom - initialSpace));
    });
    test('fromScale', () => {
      eqn.showForm('fromScale');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
      expect(round(newB.top)).toBe(round(baseB.top));
      expect(round(newB.bottom)).toBe(round(baseB.top - baseB.height * scale));
    });
    test('toScale', () => {
      eqn.showForm('toScale');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newC.height)).toBe(round(baseC.height * scale));
      expect(round(newC.bottom)).toBe(round(baseC.bottom));
      expect(round(newC.top)).toBe(round(baseC.bottom + baseC.height * scale));
    });
    test('fromSpace', () => {
      eqn.showForm('fromSpace');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newB.height)).toBe(round(baseB.height));
      expect(round(newB.top)).toBe(round(baseB.top - spaceDelta));
      expect(round(newB.bottom)).toBe(round(baseB.bottom - spaceDelta));
    });
    test('toSpace', () => {
      eqn.showForm('toSpace');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newC.height)).toBe(round(baseC.height));
      expect(round(newC.bottom)).toBe(round(baseC.bottom + spaceDelta));
      expect(round(newC.top)).toBe(round(baseC.top + spaceDelta));
    });
    test('fromOffset', () => {
      eqn.showForm('fromOffset');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newB.height)).toBe(round(baseB.height));
      expect(round(newB.top)).toBe(round(baseB.top - offset.y));
      expect(round(newB.left)).toBe(round(0));
      expect(round(newS.left)).toBe(round(offset.x + newB.width / 2 - baseS.width / 2));
    });
    test('toOffset', () => {
      eqn.showForm('toOffset');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newC.left))
        .toBe(round(baseS.left + baseS.width / 2 + offset.x - baseC.width / 2));
      expect(round(newC.top)).toBe(round(baseC.top + offset.y));
    });
    test('inSizeFalse', () => {
      eqn.showForm('inSizeFalse');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newA = eqn._a.getBoundingRect('local');
      expect(round(newS.left)).toBe(round(newA.left - initialSpace - baseS.width));
    });
    test('noFrom', () => {
      eqn.showForm('noFrom');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newC.left)).toBe(round(baseC.left));
      expect(round(newC.bottom)).toBe(round(baseC.bottom));
      expect(round(newC.height)).toBe(round(baseC.height));
    });
    test('noTo', () => {
      eqn.showForm('noTo');
      figure.setFirstTransform();
      const newS = eqn._s.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newB.left)).toBe(round(baseB.left));
      expect(round(newB.bottom)).toBe(round(baseB.bottom));
      expect(round(newB.height)).toBe(round(baseB.height));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._s];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    figure.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s.transform.mat)).toMatchSnapshot();
  });
});
