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
      vBar: {
        symbol: 'barNew', side: 'left', lineWidth: 0.01,
      },
      hBar: {
        symbol: 'barNew', side: 'top', lineWidth: 0.01,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
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
                barLength: null,
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
              barLength: null,
              left: null,
              right: null,
              top: 0.1,
              bottom: 0.1,
              inSize: true,
            },
          },
          // Method Array
          2: { bar: ['a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true] },
          // Function with Method Array
          3: e.bar(['a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true]),
          // Function with parameters
          4: e.bar('a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true),
          // Bound Function with parameters
          5: bar('a', 'vBar', 'left', 0.1, null, null, null, null, 0.1, 0.1, true),
          // Bound Function with Object
          6: bar({
            content: 'a',
            symbol: 'vBar',
            side: 'left',
            space: 0.1,
            overhang: null,
            barLength: null,
            left: null,
            right: null,
            top: 0.1,
            bottom: 0.1,
            inSize: true,
          }),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        diagram.elements = eqn;
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
            content: [bar(
              'a', 'vBar', 'left', 0.1, null, null, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
          leftOverhangPositive: {
            content: [bar(
              'a', 'vBar', 'left', 0, 0.01, null, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
          leftOverhangNegative: {
            content: [bar(
              'a', 'vBar', 'left', 0, -0.01, null, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
          leftLengthLonger: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, 3, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
          leftLengthShorter: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, 0.01, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
          leftTopPositive: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, null, null, null, 0.01, null, true,
            ), 'b'],
            scale: 1,
          },
          leftTopNegative: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, null, null, null, -0.01, null, true,
            ), 'b'],
            scale: 1,
          },
          leftBottomPositive: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, null, null, null, null, 0.01, true,
            ), 'b'],
            scale: 1,
          },
          leftBottomNegative: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, null, null, null, null, -0.01, true,
            ), 'b'],
            scale: 1,
          },
          leftTopBottom: {
            content: [bar(
              'a', 'vBar', 'left', 0, null, null, null, null, 0.01, 0.01, true,
            ), 'b'],
            scale: 1,
          },
          right: {
            content: [bar(
              'a', 'vBar', 'right', 0, null, null, null, null, null, null, true,
            ), 'b'],
            scale: 1,
          },
        });
      },
    };
  });
  describe('Parameter Steps', () => {
    let bar;
    let a;
    let b;
    let space;
    let overhang;
    let lengthLonger;
    let lengthShorter;
    let offset;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      bar = eqn._vBar.getBoundingRect('diagram');
      a = eqn._a.getBoundingRect('diagram');
      b = eqn._b.getBoundingRect('diagram');
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
    test('left', () => {
      expect(round(a.left)).toBe(round(bar.width));
      expect(round(bar.height)).toBe(round(a.height));
      expect(round(bar.bottom)).toBe(round(a.bottom));
      expect(round(bar.top)).toBe(round(a.top));
    });
    test('leftSpace', () => {
      eqn.showForm('leftSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newA.left)).toBe(round(bar.width + space));
      expect(round(newBar.height)).toBe(round(a.height));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftOverhangPositive', () => {
      eqn.showForm('leftOverhangPositive');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height + overhang * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom - overhang));
      expect(round(newBar.top)).toBe(round(a.top + overhang));
    });
    test('leftOverhangNegative', () => {
      eqn.showForm('leftOverhangNegative');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height - overhang * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom + overhang));
      expect(round(newBar.top)).toBe(round(a.top - overhang));
    });
    test('leftLengthLonger', () => {
      eqn.showForm('leftLengthLonger');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(lengthLonger);
      const lengthDelta = (lengthLonger - a.height) / 2;
      expect(round(newBar.bottom)).toBe(round(a.bottom - lengthDelta));
      expect(round(newBar.top)).toBe(round(a.top + lengthDelta));
    });
    test('leftLengthShorter', () => {
      eqn.showForm('leftLengthShorter');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(lengthShorter);
      const lengthDelta = (a.height - lengthShorter) / 2;
      expect(round(newBar.bottom)).toBe(round(a.bottom + lengthDelta));
      expect(round(newBar.top)).toBe(round(a.top - lengthDelta));
    });
    test('leftTopPositive', () => {
      eqn.showForm('leftTopPositive');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height + offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top + offset));
    });
    test('leftTopNegative', () => {
      eqn.showForm('leftTopNegative');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height - offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom));
      expect(round(newBar.top)).toBe(round(a.top - offset));
    });
    test('leftBottomPositive', () => {
      eqn.showForm('leftBottomPositive');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height + offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom - offset));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftBottomNegative', () => {
      eqn.showForm('leftBottomNegative');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height - offset));
      expect(round(newBar.bottom)).toBe(round(a.bottom + offset));
      expect(round(newBar.top)).toBe(round(a.top));
    });
    test('leftTopBottom', () => {
      eqn.showForm('leftTopBottom');
      diagram.setFirstTransform();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newBar.height)).toBe(round(a.height + offset * 2));
      expect(round(newBar.bottom)).toBe(round(a.bottom - offset));
      expect(round(newBar.top)).toBe(round(a.top + offset));
    });
    test('right', () => {
      eqn.showForm('right');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect();
      const newBar = eqn._vBar.getBoundingRect();
      expect(round(newA.left)).toBe(0);
      expect(round(newBar.left)).toBe(round(a.width));
      expect(round(newBar.height)).toBe(round(a.height));
    });
  //   test('notInSize', () => {
  //     eqn.showForm('notInSize');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     const newB = eqn._b.getPosition();
  //     // 0.1x2 + 0.103 = 0.303
  //     expect(round(newLScale.y)).toBe(0.303);
  //     expect(round(newL.y)).toBe(-0.108);
  //     // 0 - 0.1 - 0.04 = -0.14
  //     expect(round(newL.x)).toBe(round(-0.1 - eqn._lb.getBoundingRect('diagram').width));
  //     expect(round(newB.x)).toBe(0.04);
  //   });
  //   test('forceHeightGreaterThanActualHeight', () => {
  //     eqn.showForm('forceHeightGreaterThanActualHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1
  //     expect(round(newLScale.y)).toBe(1);
  //     expect(round(newL.y)).toBe(-0.108);
  //   });
  //   test('forceHeightLessThanActualHeight', () => {
  //     eqn.showForm('forceHeightLessThanActualHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.005
  //     expect(round(newLScale.y)).toBe(0.05);
  //     expect(round(newL.y)).toBe(-0.108);
  //   });
  //   test('forceDecentGreaterThanActualDescent', () => {
  //     eqn.showForm('forceDecentGreaterThanActualDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.1 + 0.095 + 0.1 = 0.295
  //     expect(round(newLScale.y)).toBe(0.295);
  //     expect(round(newL.y)).toBe(-0.1);
  //   });
  //   test('forceDecentLessThanActualDescent', () => {
  //     eqn.showForm('forceDecentLessThanActualDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.004 + 0.095 + 0.1 = 0.199
  //     expect(round(newLScale.y)).toBe(0.199);
  //     expect(round(newL.y)).toBe(-0.004);
  //   });
  //   test('minContentDescentWithLargeMinHeight', () => {
  //     eqn.showForm('minContentDescentWithLargeMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 1 + 0.1x2 = 2.2
  //     expect(round(newLScale.y)).toBe(2.2);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescentWithSmallLargeHeight', () => {
  //     eqn.showForm('minContentDescentWithSmallMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295 as minHeight doesn't raise above minDescent
  //     // more than old ascent does
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescentWithSmallMinHeight', () => {
  //     eqn.showForm('minContentDescentWithSmallMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescent', () => {
  //     eqn.showForm('minContentDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentHeight', () => {
  //     eqn.showForm('minContentHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.1x2 = 1.2
  //     expect(round(newLScale.y)).toBe(1.2);
  //     expect(round(newL.y)).toBe(round(baseL.y));
  //   });
  //   test('bottomSpace', () => {
  //     eqn.showForm('bottomSpace');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     expect(round(newLScale.y)).toBe(round(baseLScale.y + 0.1));
  //     expect(round(newL.y)).toBe(round(baseL.y - 0.1));
  //   });
  //   test('topSpace', () => {
  //     eqn.showForm('topSpace');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     expect(round(newLScale.y)).toBe(round(baseLScale.y + 0.1));
  //     expect(round(newL.y)).toBe(round(baseL.y));
  //   });
  //   test('outsideSpace', () => {
  //     eqn.showForm('outsideSpace');
  //     const newB = eqn._b.getPosition();
  //     const newL = eqn._lb.getPosition();
  //     const newR = eqn._rb.getPosition();
  //     const newA = eqn._a.getPosition();
  //     expect(round(newL.x)).toBe(round(baseL.x + 0.1));
  //     expect(round(newA.x)).toBe(round(baseA.x + 0.1));
  //     expect(round(newR.x)).toBe(round(baseR.x + 0.1));
  //     expect(round(newB.x)).toBe(round(baseB.x + 0.2));
  //   });
  //   test('insideSpace', () => {
  //     eqn.showForm('insideSpace');
  //     const newB = eqn._b.getPosition();
  //     const newL = eqn._lb.getPosition();
  //     const newR = eqn._rb.getPosition();
  //     const newA = eqn._a.getPosition();
  //     expect(round(newL.x)).toBe(round(baseL.x));
  //     expect(round(newA.x)).toBe(round(baseA.x + 0.1));
  //     expect(round(newR.x)).toBe(round(baseR.x + 0.2));
  //     expect(round(newB.x)).toBe(round(baseB.x + 0.2));
  //   });
  });
  test('Bar', () => {
    functions.single();
    const elems = [eqn._a, eqn._vBar];
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
    expect(round(eqn._vBar.transform.mat)).toMatchSnapshot();
  });
});
