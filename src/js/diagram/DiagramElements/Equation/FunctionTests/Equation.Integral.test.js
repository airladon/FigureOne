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

describe('Equation Functions - Integral', () => {
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
        symbol: 'int', lineWidth: 0.01, draw: 'dynamic',
      },
    };
    functions = {
      inputForms: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const intLimits = e.intLimits.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              intLimits: {
                symbol: 's',
                content: 'a',
                from: 'b',
                to: 'c',
                inSize: true,
                space: 0,
                topSpace: 0.1,
                bottomSpace: 0.1,
                height: null,
                yOffset: 0,
                scale: 1,
                fromScale: 1,
                toScale: 1,
                // fromSpace: 0.1,
                // toSpace: 0.1,
                fromOffset: [0.1, 0.1],
                toOffset: [-0.1, -0.1],
                limitsPosition: 'topBottom',
                limitsAroundContent: true,
              },
            },
          },
          // Method Object
          1: {
            intLimits: {
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
              // fromSpace: 0.1,
              // toSpace: 0.1,
              fromOffset: [0.1, 0.1],
              toOffset: [-0.1, -0.1],
              limitsPosition: 'topBottom',
              limitsAroundContent: true,
            },
          },
          // Method Array
          2: { intLimits: ['s', 'a', 'b', 'c', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, [0.1, 0.1], [-0.1, -0.1], 'topBottom', true] },
          // Function with Method Array
          3: e.intLimits(['s', 'a', 'b', 'c', true, 0, 0.1, 0.1, null, 0, 1, 1, 1, [0.1, 0.1], [-0.1, -0.1], 'topBottom', true]),
          // Bound Function with Object
          4: intLimits({
            symbol: 's',
            content: 'a',
            from: 'b',
            to: 'c',
            inSize: true,
            space: 0,
            topSpace: 0.1,
            bottomSpace: 0.1,
            height: null,
            yOffset: 0,
            scale: 1,
            fromScale: 1,
            toScale: 1,
            fromOffset: [0.1, 0.1],
            toOffset: [-0.1, -0.1],
            limitsPosition: 'topBottom',
            limitsAroundContent: true,
          }),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const intLimits = e.intLimits.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              intLimits: {
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
                fromOffset: [0, 0],
                toOffset: [0, 0],
                limitsPosition: 'topBottomCenter',
                limitsAroundContent: true,
                fromXPosition: 'center',
                fromYPosition: 'bottom',
                fromXAlign: 'center',
                fromYAlign: 'top',
                toXPosition: 'center',
                toYPosition: 'top',
                toXAlign: 'center',
                toYAlign: 'bottom',
              },
            },
            scale: 1,
          },
          inSizeFalse: {
            content: intLimits([
              's', 'a', 'b', 'c', false, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          space: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.1, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          topSpace: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.1, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          bottomSpace: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.1, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          topBottomSpace: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.1, 0.1, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          heightAndOverride: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 1, 1, 1,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          heightYOffset: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, 1,
              0.1, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          yOffsetNegative: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              -0.1, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          scale: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 0.5, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          fromScale: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 0.5, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          toScale: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 0.5, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          fromOffset: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [-0.3, -0.2], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          toOffset: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0.3, 0.2], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          noFrom: {
            content: intLimits([
              's', 'a', '', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          noTo: {
            content: intLimits([
              's', 'a', 'b', '', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'center', 'bottom', 'center', 'top', 'center', 'top',
              'center', 'bottom',
            ]),
            scale: 1,
          },
          limitsPositionSide: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'side', true,
            ]),
            scale: 1,
          },
          limitsPositionSideNotOver: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'side', false,
            ]),
            scale: 1,
          },
          sideOffset: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.01, 0.01, 0.01, null,
              0, 1, 1, 1, [-0.3, -0.2], [0.3, 0.2], 'side', true,
            ]),
            scale: 1,
          },
          reversePositionAndAlign: {
            content: intLimits([
              's', 'a', 'b', 'c', true, 0.1, 0.01, 0.01, null,
              0, 1, 1, 1, [0, 0], [0, 0], 'topBottomCenter', true,
              'left', 'top', 'right', 'bottom', 'left', 'bottom',
              'right', 'top',
            ]),
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
    // let baseSScale;
    let space;
    let spaceDelta;
    let height;
    let yOffset;
    let scale;
    let initialSpace;
    let offset;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      baseS = eqn._s.getBoundingRect('diagram');
      space = 0.1;
      initialSpace = 0.01;
      spaceDelta = space - initialSpace;
      height = 1;
      yOffset = 0.1;
      scale = 0.5;
      offset = new Point(0.3, 0.2);
      // baseSScale = eqn._s.custom.scale._dup();
    });
    // Note, the letter a has the following bounds:
    // width: 0.04000000000000001,
    // height: 0.10300000000000001,
    // descent: -0.008,
    // ascent: top: 0.095,
    // test.only('base', () => {
    //   console.log(baseB)
    //   console.log(baseC)
    //   console.log(baseS)
    //   expect(round(baseS.left)).toBe(0);
    // });
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
    test('Reverse Position And Align', () => {
      eqn.showForm('reversePositionAndAlign');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newC.left)).toBe(0);
      expect(round(newC.top)).toBe(round(newS.bottom));
      expect(round(newB.left)).toBe(0);
      expect(round(newB.bottom)).toBe(round(newS.top));
      expect(round(newS.left)).toBe(round(newC.right));
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
      expect(round(newS.bottom)).toBe(round(baseA.bottom - 1));
      expect(round(newS.top)).toBe(round(newS.bottom + height));
    });
    test('heightYOffset', () => {
      eqn.showForm('heightYOffset');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(height));
      expect(round(newS.bottom)).toBe(round(baseA.bottom - initialSpace + yOffset));
      expect(round(newS.top)).toBe(round(newS.bottom + height));
    });
    test('yOffsetNegative', () => {
      eqn.showForm('yOffsetNegative');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom - yOffset));
      expect(round(newS.top)).toBe(round(baseS.top - yOffset));
    });
    test('scale', () => {
      eqn.showForm('scale');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newA = eqn._a.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseA.height * scale + initialSpace * 2));
      expect(round(newA.height)).toBe(round(baseA.height * scale));
      expect(round(newS.bottom)).toBe(round(newA.bottom - initialSpace));
    });
    test('fromScale', () => {
      eqn.showForm('fromScale');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
      expect(round(newB.top)).toBe(round(baseB.top));
      expect(round(newB.bottom)).toBe(round(baseB.top - baseB.height * scale));
    });
    test('toScale', () => {
      eqn.showForm('toScale');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newC.height)).toBe(round(baseC.height * scale));
      expect(round(newC.bottom)).toBe(round(baseC.bottom));
      expect(round(newC.top)).toBe(round(baseC.bottom + baseC.height * scale));
    });
    // test('fromSpace', () => {
    //   eqn.showForm('fromSpace');
    //   diagram.setFirstTransform();
    //   const newS = eqn._s.getBoundingRect('diagram');
    //   const newB = eqn._b.getBoundingRect('diagram');
    //   expect(round(newS.height)).toBe(round(baseS.height));
    //   expect(round(newS.bottom)).toBe(round(baseS.bottom));
    //   expect(round(newB.height)).toBe(round(baseB.height));
    //   expect(round(newB.top)).toBe(round(baseB.top - spaceDelta));
    //   expect(round(newB.bottom)).toBe(round(baseB.bottom - spaceDelta));
    // });
    // test('toSpace', () => {
    //   eqn.showForm('toSpace');
    //   diagram.setFirstTransform();
    //   const newS = eqn._s.getBoundingRect('diagram');
    //   const newC = eqn._c.getBoundingRect('diagram');
    //   expect(round(newS.height)).toBe(round(baseS.height));
    //   expect(round(newS.bottom)).toBe(round(baseS.bottom));
    //   expect(round(newC.height)).toBe(round(baseC.height));
    //   expect(round(newC.bottom)).toBe(round(baseC.bottom + spaceDelta));
    //   expect(round(newC.top)).toBe(round(baseC.top + spaceDelta));
    // });
    test('fromOffset', () => {
      eqn.showForm('fromOffset');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newB.height)).toBe(round(baseB.height));
      expect(round(newB.top)).toBe(round(newS.bottom - offset.y));
      expect(round(newB.left)).toBe(round(0));
      expect(round(newS.left)).toBe(round(offset.x + newB.width / 2 - baseS.width / 2));
    });
    test('toOffset', () => {
      eqn.showForm('toOffset');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newC.left))
        .toBe(round(baseS.left + baseS.width / 2 + offset.x - baseC.width / 2));
      expect(round(newC.top)).toBe(round(baseC.top + offset.y));
    });
    test('inSizeFalse', () => {
      eqn.showForm('inSizeFalse');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newA = eqn._a.getBoundingRect('diagram');
      expect(round(newS.left)).toBe(round(newA.left - initialSpace - baseS.width));
    });
    test('noFrom', () => {
      eqn.showForm('noFrom');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newC.left)).toBe(round(baseC.left));
      expect(round(newC.bottom)).toBe(round(baseC.bottom));
      expect(round(newC.height)).toBe(round(baseC.height));
    });
    test('noTo', () => {
      eqn.showForm('noTo');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newS.left)).toBe(round(baseS.left));
      expect(round(newS.bottom)).toBe(round(baseS.bottom));
      expect(round(newS.height)).toBe(round(baseS.height));
      expect(round(newB.left)).toBe(round(baseB.left));
      expect(round(newB.bottom)).toBe(round(baseB.bottom));
      expect(round(newB.height)).toBe(round(baseB.height));
    });
    test('limitsPosition Side', () => {
      eqn.showForm('limitsPositionSide');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newA = eqn._a.getBoundingRect('diagram');
      expect(round(newS.left)).toBe(0);
      expect(round(newC.left)).toBe(round(newS.right));
      expect(round(newC.bottom)).toBe(round(newS.top - newC.height / 2));
      expect(round(newB.left)).toBe(round(newS.left + newS.width / 2));
      expect(round(newB.bottom)).toBe(round(newS.bottom - newB.height / 2));
      expect(round(newA.left)).toBe(round(newS.right + initialSpace));
    });
    test('limitsPosition Side Not Over Content', () => {
      eqn.showForm('limitsPositionSideNotOver');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newA = eqn._a.getBoundingRect('diagram');
      expect(round(newS.left)).toBe(0);
      expect(round(newC.left)).toBe(round(newS.right));
      expect(round(newC.bottom)).toBe(round(newS.top - newC.height / 2));
      expect(round(newB.left)).toBe(round(newS.left + newS.width / 2));
      expect(round(newB.bottom)).toBe(round(newS.bottom - newB.height / 2));
      expect(round(newA.left)).toBe(round(newC.right + initialSpace));
    });
    test('sideOffset', () => {
      eqn.showForm('sideOffset');
      diagram.setFirstTransform();
      const newS = eqn._s.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newB.left)).toBe(0);
      expect(round(newC.left)).toBe(round(newS.right + offset.x));
      expect(round(newS.left)).toBe(round(offset.x - newS.width / 2));
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
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
    expect(round(eqn._s.transform.mat)).toMatchSnapshot();
  });
});
