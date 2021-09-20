// import {
//   Point,
// } from '../../../../tools/g2';
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

describe('Equation Functions - Bar', () => {
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
      vBar: {
        symbol: 'bar', side: 'left', lineWidth: 0.01,
      },
      vBar1: {
        symbol: 'bar', side: 'left', lineWidth: 0.01,
      },
      hBar: {
        symbol: 'bar', side: 'top', lineWidth: 0.01,
      },
      hBar1: {
        symbol: 'bar', side: 'top', lineWidth: 0.01,
      },
      hBar2: {
        symbol: 'bar', side: 'bottom', lineWidth: 0.01,
      },
    };
    functions = {
      single: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bar = e.bar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bar: {
                content: 'a',
                symbol: 'vBar',
                side: 'left',
                space: 0.1,
                overhang: null,
                length: null,
                left: null,
                right: null,
                top: 0.1,
                bottom: 0.1,
                inSize: true,
              },
            },
          },
          // Method Object
          1: {
            bar: {
              content: 'a',
              symbol: 'vBar',
              side: 'left',
              space: 0.1,
              overhang: null,
              length: null,
              left: null,
              right: null,
              top: 0.1,
              bottom: 0.1,
              inSize: true,
            },
          },
          // Method Array
          2: { bar: ['a', 'vBar', true, 0.1, null, null, null, null, 0.1, 0.1, 'left'] },
          // Function with Method Array
          3: e.bar(['a', 'vBar', true, 0.1, null, null, null, null, 0.1, 0.1, 'left']),
          // Function with parameters
          // 4: e.bar('a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true),
          // Bound Function with parameters
          // 5: bar('a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true),
          // Bound Function with Object
          4: bar({
            content: 'a',
            symbol: 'vBar',
            side: 'left',
            space: 0.1,
            overhang: null,
            length: null,
            left: null,
            right: null,
            top: 0.1,
            bottom: 0.1,
            inSize: true,
          }),
        });
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        figure.elements = eqn;
        const e = eqn.eqn.functions;
        const bar = e.bar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: [
              {
                bar: {
                  content: 'a',
                  symbol: 'vBar',
                  side: 'left',
                  space: 0,
                  overhang: null,
                  length: null,
                  left: null,
                  right: null,
                  top: null,
                  bottom: null,
                  inSize: true,
                },
              },
              'b',
            ],
            scale: 1,
          },
          leftSpace: {
            content: [bar([
              'a', 'vBar', true, 0.1, null, null, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftOverhangPositive: {
            content: [bar([
              'a', 'vBar', true, 0, 0.01, null, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftOverhangNegative: {
            content: [bar([
              'a', 'vBar', true, 0, -0.01, null, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftLengthLonger: {
            content: [bar([
              'a', 'vBar', true, 0, null, 3, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftLengthShorter: {
            content: [bar([
              'a', 'vBar', true, 0, null, 0.01, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftTopPositive: {
            content: [bar([
              'a', 'vBar', true, 0, null, null, null, null, 0.01, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftTopNegative: {
            content: [bar([
              'a', 'vBar', true, 0, null, null, null, null, -0.01, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftBottomPositive: {
            content: [bar([
              'a', 'vBar', true, 0, null, null, null, null, null, 0.01, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftBottomNegative: {
            content: [bar([
              'a', 'vBar', true, 0, null, null, null, null, null, -0.01, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftTopBottom: {
            content: [bar([
              'a', 'vBar', true, 0, null, null, null, null, 0.01, 0.01, 'left',
            ]), 'b'],
            scale: 1,
          },
          leftInSize: {
            content: [bar([
              'a', 'vBar', false, 0, null, null, null, null, null, null, 'left',
            ]), 'b'],
            scale: 1,
          },
          right: {
            content: [bar([
              'a', 'vBar1', true, 0, null, null, null, null, null, null, 'right',
            ]), 'b'],
            scale: 1,
          },
          rightSpaceTopBottomInSize: {
            content: [bar([
              'a', 'vBar1', false, 0.1, null, null, null, null, 0.01, 0.01, 'right',
            ]), 'b'],
            scale: 1,
          },
          top: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topSpace: {
            content: [bar([
              'a', 'hBar', true, 0.1, null, null, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topOverhangPositive: {
            content: [bar([
              'a', 'hBar', true, 0, 0.01, null, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topOverhangNegative: {
            content: [bar([
              'a', 'hBar', true, 0, -0.01, null, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topLengthLonger: {
            content: [bar([
              'a', 'hBar', true, 0, 0, 3, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topLengthShorter: {
            content: [bar([
              'a', 'hBar', true, 0, 0, 0.01, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topLeftPositive: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, 0.01, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topLeftNegative: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, -0.01, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topRightPositive: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, null, 0.01, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topRightNegative: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, null, -0.01, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topLeftRight: {
            content: [bar([
              'a', 'hBar', true, 0, null, null, 0.01, 0.01, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          topInSize: {
            content: [bar([
              'a', 'hBar', false, 0, null, 3, null, null, null, null, 'top',
            ]), 'b'],
            scale: 1,
          },
          bottomSpaceLeftRightInSize: {
            content: [bar([
              'a', 'hBar2', false, 0.1, null, null, 0.01, 0.01, null, null, 'bottom',
            ]), 'b'],
            scale: 1,
          },
        });
      },
      topBar: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        figure.elements = eqn;
        // const e = eqn.eqn.functions;
        // const bar = e.bar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              bar: {
                content: 'a',
                symbol: 'hBar',
                side: 'top',
                space: 0.1,
                overhang: null,
                length: null,
                left: null,
                right: null,
                top: null,
                bottom: null,
                inSize: true,
              },
            },
          },
          1: {
            content: {
              topBar: {
                content: 'a',
                symbol: 'hBar',
                space: 0.1,
                inSize: true,
              },
            },
          },
          2: {
            topBar: {
              content: 'a',
              symbol: 'hBar',
              space: 0.1,
              inSize: true,
            },
          },
          3: { topBar: ['a', 'hBar', true, 0.1] },
        });
        figure.elements = eqn;
      },
      bottomBar: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        figure.elements = eqn;
        // const e = eqn.eqn.functions;
        // const bar = e.bar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              bar: {
                content: 'a',
                symbol: 'hBar',
                side: 'bottom',
                space: 0.1,
                overhang: null,
                length: null,
                left: null,
                right: null,
                top: null,
                bottom: null,
                inSize: true,
              },
            },
          },
          1: {
            content: {
              bottomBar: {
                content: 'a',
                symbol: 'hBar',
                space: 0.1,
                inSize: true,
              },
            },
          },
          2: {
            bottomBar: {
              content: 'a',
              symbol: 'hBar',
              space: 0.1,
              inSize: true,
            },
          },
          3: { bottomBar: ['a', 'hBar', true, 0.1] },
        });
      },
    };
  });
  test('topBar', () => {
    functions.topBar();
    const elems = [eqn._a, eqn._hBar];
    const formsToTest = ['1', '2', '3'];
    eqn.showForm('base');
    figure.setFirstTransform();
    const basePositions = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(basePositions).toEqual(positions);
    });
  });
  test('bottomBar', () => {
    functions.bottomBar();
    const elems = [eqn._a, eqn._hBar];
    const formsToTest = ['1', '2', '3'];
    eqn.showForm('base');
    const basePositions = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(basePositions).toEqual(positions);
    });
  });
  describe('Parameter Steps', () => {
    let bar;
    let a;
    // let b;
    let space;
    let overhang;
    let lengthLonger;
    let lengthShorter;
    let offset;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      bar = eqn._vBar.getBoundingRect('local');
      a = eqn._a.getBoundingRect('local');
      // b = eqn._b.getBoundingRect('local');
      space = 0.1;
      overhang = 0.01;
      lengthLonger = 3;
      lengthShorter = 0.01;
      offset = 0.01;
    });
    // Note, the letter a has the following bounds:
    // width: 0.04000000000000001,
    // height: 0.10300000000000001,
    // descent: -0.008,
    // ascent: top: 0.095,
    test('bottomSpaceLeftRightInSize', () => {
      eqn.showForm('bottomSpaceLeftRightInSize');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._hBar2.getBoundingRect('local');
      expect(round(newBar.left)).toBe(-offset);
      expect(round(newBar.bottom)).toBe(round(newA.bottom - space - newBar.height));
      expect(round(newBar.width)).toBe(round(newA.width + offset * 2));
      expect(round(newA.left)).toBe(0);
      expect(round(newB.left)).toBe(round(newA.width));
    });
    test('topInSize', () => {
      eqn.showForm('topInSize');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(round(-(lengthLonger - newA.width) / 2));
      expect(round(newBar.width)).toBe(lengthLonger);
      expect(round(newA.left)).toBe(0);
      expect(round(newB.left)).toBe(round(newA.width));
    });
    test('topLeftRight', () => {
      eqn.showForm('topLeftRight');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(round(newA.width + offset * 2));
      expect(round(newA.left)).toBe(offset);
      expect(round(newB.left)).toBe(round(newA.width + offset * 2));
    });
    test('topRightPositive', () => {
      eqn.showForm('topRightPositive');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(round(newA.width + offset));
      expect(round(newA.left)).toBe(0);
      expect(round(newB.left)).toBe(round(newA.width + offset));
    });
    test('topRightNegative', () => {
      eqn.showForm('topRightNegative');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(round(newA.width - offset));
      expect(round(newA.left)).toBe(0);
      expect(round(newB.left)).toBe(round(newA.width));
    });
    test('topLeftPositive', () => {
      eqn.showForm('topLeftPositive');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(round(newA.width + offset));
      expect(round(newA.left)).toBe(offset);
    });
    test('topLeftNegative', () => {
      eqn.showForm('topLeftNegative');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(offset);
      expect(round(newBar.width)).toBe(round(newA.width - offset));
      expect(round(newA.left)).toBe(0);
    });
    test('topLengthShorter', () => {
      eqn.showForm('topLengthShorter');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(round((a.width - lengthShorter) / 2));
      expect(round(newBar.width)).toBe(lengthShorter);
      expect(round(newA.left)).toBe(0);
    });
    test('topLengthLonger', () => {
      eqn.showForm('topLengthLonger');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(lengthLonger);
      expect(round(newA.left)).toBe(round((lengthLonger - a.width) / 2));
    });
    test('topOverhangPositive', () => {
      eqn.showForm('topOverhangPositive');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(0);
      expect(round(newBar.width)).toBe(round(newA.width + overhang * 2));
      expect(round(newA.left)).toBe(overhang);
    });
    test('topOverhangNegative', () => {
      eqn.showForm('topOverhangNegative');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.left)).toBe(overhang);
      expect(round(newBar.width)).toBe(round(newA.width - overhang * 2));
      expect(round(newA.left)).toBe(0);
    });
    test('topSpace', () => {
      eqn.showForm('topSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newBar.bottom)).toBe(round(newA.top + space));
    });
    test('top', () => {
      eqn.showForm('top');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._hBar.getBoundingRect('local');
      expect(round(newA.left)).toBe(0);
      expect(round(newA.bottom)).toBe(round(a.bottom));
      expect(round(newBar.left)).toBe(round(newA.left));
      expect(round(newBar.bottom)).toBe(round(newA.top));
      expect(round(newBar.width)).toBe(round(newA.width));
    });
    test('left', () => {
      expect(round(a.left)).toBe(round(bar.width));
      expect(round(bar.height)).toBe(round(a.height));
      expect(round(bar.bottom)).toBe(round(a.bottom));
      expect(round(bar.top)).toBe(round(a.top));
    });
    test('leftSpace', () => {
      eqn.showForm('leftSpace');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newA.left)).toBe(round(bar.width + space));
      expect(round(newBar.height)).toBe(round(a.height));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftOverhangPositive', () => {
      eqn.showForm('leftOverhangPositive');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height + overhang * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom - overhang));
      expect(round(newBar.top)).toBe(round(a.top + overhang));
    });
    test('leftOverhangNegative', () => {
      eqn.showForm('leftOverhangNegative');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height - overhang * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom + overhang));
      expect(round(newBar.top)).toBe(round(a.top - overhang));
    });
    test('leftLengthLonger', () => {
      eqn.showForm('leftLengthLonger');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(lengthLonger);
      const lengthDelta = (lengthLonger - a.height) / 2;
      expect(round(newBar.bottom)).toBe(round(a.bottom - lengthDelta));
      expect(round(newBar.top)).toBe(round(a.top + lengthDelta));
    });
    test('leftLengthShorter', () => {
      eqn.showForm('leftLengthShorter');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(lengthShorter);
      const lengthDelta = (a.height - lengthShorter) / 2;
      expect(round(newBar.bottom)).toBe(round(a.bottom + lengthDelta));
      expect(round(newBar.top)).toBe(round(a.top - lengthDelta));
    });
    test('leftTopPositive', () => {
      eqn.showForm('leftTopPositive');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height + offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top + offset));
    });
    test('leftTopNegative', () => {
      eqn.showForm('leftTopNegative');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height - offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top - offset));
    });
    test('leftBottomPositive', () => {
      eqn.showForm('leftBottomPositive');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height + offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom - offset));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftBottomNegative', () => {
      eqn.showForm('leftBottomNegative');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height - offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom + offset));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftTopBottom', () => {
      eqn.showForm('leftTopBottom');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      expect(round(newBar.height)).toBe(round(a.height + offset * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom - offset));
      expect(round(newBar.top)).toBe(round(a.top + offset));
    });
    test('leftInSize', () => {
      eqn.showForm('leftInSize');
      figure.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect('local');
      const newA = eqn._a.getBoundingRect('local');
      expect(round(newBar.left)).toBe(round(newA.left - newBar.width));
      expect(round(newA.left)).toBe(0);
    });
    test('right', () => {
      eqn.showForm('right');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newBar = eqn._vBar1.getBoundingRect('local');
      expect(round(newA.left)).toBe(0);
      expect(round(newBar.left)).toBe(round(a.width));
      expect(round(newBar.height)).toBe(round(a.height));
    });
    test('rightSpaceTopBottomInSize', () => {
      eqn.showForm('rightSpaceTopBottomInSize');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newBar = eqn._vBar1.getBoundingRect('local');
      expect(round(newA.left)).toBe(0);
      expect(round(newBar.left)).toBe(round(a.width + space));
      expect(round(newBar.height)).toBe(round(a.height + offset * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom - offset));
      expect(round(newB.left)).toBe(round(newA.left + newA.width));
    });
  });
  test('Bar', () => {
    functions.single();
    const elems = [eqn._a, eqn._vBar];
    const formsToTest = ['1', '2', '3', '4', '5', '6'];
    eqn.showForm('0');
    figure.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    figure.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._vBar.transform.mat)).toMatchSnapshot();
  });
});
