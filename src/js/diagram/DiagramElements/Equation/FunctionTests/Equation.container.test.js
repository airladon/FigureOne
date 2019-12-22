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

describe('Equation Functions - Container', () => {
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
    };
    functions = {
      inputForms: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const container = e.container.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              container: {
                content: ['a', 'b', 'c'],
                width: null,
                descent: null,
                ascent: null,
                xAlign: 'left',
                yAlign: 'baseline',
                fit: null,
                scale: 1,
              },
            },
          },
          // Method Object
          1: {
            container: {
              content: ['a', 'b', 'c'],
              width: null,
              descent: null,
              ascent: null,
              xAlign: 'left',
              yAlign: 'baseline',
              fit: null,
              scale: 1,
            },
          },
          // Method Array
          2: {
            container: [['a', 'b', 'c'], null, null, null, 'left', 'baseline', null, 1],
          },
          // Function with Method Array
          3: e.container([['a', 'b', 'c'], null, null, null, 'left', 'baseline', null, 1]),
          // Bound Function with Object
          4: container([['a', 'b', 'c'], null, null, null, 'left', 'baseline', null, 1]),
        });
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        // const e = eqn.eqn.functions;
        // const scale = e.scale.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: ['a', {
              container: {
                content: ['b'],
                width: null,
                descent: null,
                ascent: null,
                xAlign: 'left',
                yAlign: 'baseline',
                fit: null,
                scale: 1,
              },
            }, 'c'],
            scale: 1,
          },
          widthLeft: {
            content: ['a', { container: ['b', 1, null, null, 'left', 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          widthCenter: {
            content: ['a', { container: ['b', 1, null, null, 'center', 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          widthRight: {
            content: ['a', { container: ['b', 1, null, null, 'right', 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          widthMultiplier: {
            content: ['a', { container: ['b', 1, null, null, 0.2, 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          smallWidthCenter: {
            content: ['a', { container: ['b', 0.01, null, null, 'center', 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          descentAscentBaseline: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 'baseline', null, 1] }, 'c'],
            scale: 1,
          },
          descentAscentBottom: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 'bottom', null, 1] }, 'c'],
            scale: 1,
          },
          descentAscentMiddle: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 'middle', null, 1] }, 'c'],
            scale: 1,
          },
          descentAscentTop: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 'top', null, 1] }, 'c'],
            scale: 1,
          },
          descentAscentMultiplier: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 0.2, null, 1] }, 'c'],
            scale: 1,
          },
          fitWidth: {
            content: ['a', { container: ['b', 1, null, null, 'left', 'baseline', 'width', 1] }, 'c'],
            scale: 1,
          },
          fitHeight: {
            content: ['a', { container: ['b', null, 1, 1, 'left', 'baseline', 'height', 1] }, 'c'],
            scale: 1,
          },
          fitContainWidth: {
            content: ['a', { container: ['b', 1, 10, 10, 'left', 'baseline', 'contain', 1] }, 'c'],
            scale: 1,
          },
          fitContainHeight: {
            content: ['a', { container: ['b', 10, 1, 1, 'left', 'baseline', 'contain', 1] }, 'c'],
            scale: 1,
          },
          scaleDefault: {
            content: ['a', { container: ['b', null, null, null, 'left', 'baseline', null, 0.5] }, 'c'],
            scale: 1,
          },
          scaleFixedContainer: {
            content: ['a', { container: ['b', 1, 1, 1, 'left', 'baseline', null, 0.5] }, 'c'],
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
    let width;
    let smallWidth;
    let multiplier;
    let descent;
    let ascent;
    let scale;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      width = 1;
      multiplier = 0.2;
      smallWidth = 0.01;
      descent = 1;
      ascent = 1;
      scale = 0.5;
    });
    test('Width Left', () => {
      eqn.showForm('widthLeft');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseA.right));
      expect(round(newC.left)).toEqual(round(baseA.right + width));
    });
    test('Width Center', () => {
      eqn.showForm('widthCenter');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseA.right + width / 2 - baseB.width / 2));
      expect(round(newC.left)).toEqual(round(baseA.right + width));
    });
    test('Width Right', () => {
      eqn.showForm('widthRight');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseA.right + width - baseB.width));
      expect(round(newC.left)).toEqual(round(baseA.right + width));
    });
    test('Width Multiplier', () => {
      eqn.showForm('widthMultiplier');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseA.right + width * multiplier));
      expect(round(newC.left)).toEqual(round(baseA.right + width));
    });
    test('Small Width Center', () => {
      eqn.showForm('smallWidthCenter');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseA.right + smallWidth / 2 - baseB.width / 2));
      expect(round(newC.left)).toEqual(round(baseA.right + smallWidth));
    });
    test('Descent Ascent Baseline', () => {
      eqn.showForm('descentAscentBaseline');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newB.left)).toEqual(round(baseB.left));
      expect(round(newC.left)).toEqual(round(baseC.left));
      expect(round(newB.bottom)).toEqual(round(baseB.bottom));
    });
    test('Descent Ascent Bottom', () => {
      eqn.showForm('descentAscentBottom');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.bottom)).toEqual(round(-descent));
    });
    test('Descent Ascent Middle', () => {
      eqn.showForm('descentAscentMiddle');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.bottom)).toEqual(round(-descent + (descent + ascent) / 2 - baseB.height / 2));
    });
    test('Descent Ascent Top', () => {
      eqn.showForm('descentAscentTop');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.top)).toEqual(round(ascent));
    });
    test('Descent Ascent Multiplier', () => {
      eqn.showForm('descentAscentMultiplier');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.bottom)).toEqual(round(-descent + (descent + ascent) * multiplier));
    });
    test('Fit Width', () => {
      eqn.showForm('fitWidth');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.width)).toEqual(round(width));
      expect(round(newB.height)).toEqual(round(width / baseB.width * baseB.height));
    });
    test('Fit Height', () => {
      eqn.showForm('fitHeight');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.height)).toEqual(round(ascent + descent));
      expect(round(newB.width)).toEqual(round((ascent + descent) / baseB.height * baseB.width));
    });
    test('Fit Contain Width', () => {
      eqn.showForm('fitContainWidth');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.width)).toEqual(round(width));
      expect(round(newB.height)).toEqual(round(width / baseB.width * baseB.height));
    });
    test('Fit Contain Height', () => {
      eqn.showForm('fitContainHeight');
      diagram.setFirstTransform();
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newB.height)).toEqual(round(ascent + descent));
      expect(round(newB.width)).toEqual(round((ascent + descent) / baseB.height * baseB.width));
    });
    test('Scale Default', () => {
      eqn.showForm('scaleDefault');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newA.width)).toEqual(round(baseA.width));
      expect(round(newB.left)).toEqual(round(baseA.right));
      expect(round(newB.width)).toEqual(round(baseB.width * scale));
    });
    test('Scale Fixed Container', () => {
      eqn.showForm('scaleFixedContainer');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newA.width)).toEqual(round(baseA.width));
      expect(round(newB.left)).toEqual(round(baseA.right));
      expect(round(newB.width)).toEqual(round(baseB.width * scale));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    diagram.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      diagram.setFirstTransform();
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('base');
    diagram.setFirstTransform();
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._c.transform.mat)).toMatchSnapshot();
  });
});
