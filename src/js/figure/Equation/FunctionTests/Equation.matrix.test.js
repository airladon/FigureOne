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

describe('Equation Functions - Matrix', () => {
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
      d: 'd',
      left: {
        symbol: 'bracket', side: 'left', lineWidth: 0.012, width: 0.03,
      },
      right: {
        symbol: 'bracket', side: 'right', lineWidth: 0.012, width: 0.03,
      },
    };
    functions = {
      inputForms: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const matrix = e.matrix.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              matrix: {
                order: [2, 2],
                left: 'left',
                content: ['a', 'b', 'c', 'd'],
                right: 'right',
                scale: 1,
                fit: 'min',
                space: [0.1, 0.1],
                yAlign: 'baseline',
                brac: {
                  inSize: true,
                  insideSpace: 0.1,
                  outsideSpace: 0.1,
                  topSpace: 0.1,
                  bottomSpace: 0.1,
                  minContentHeight: null,
                  minContentDescent: null,
                  height: null,
                  descent: null,
                },
              },
            },
          },
          // Method Object
          1: {
            matrix: {
              order: [2, 2],
              left: 'left',
              content: ['a', 'b', 'c', 'd'],
              right: 'right',
              scale: 1,
              fit: 'min',
              space: [0.1, 0.1],
              yAlign: 'baseline',
              brac: {
                inSize: true,
                insideSpace: 0.1,
                outsideSpace: 0.1,
                topSpace: 0.1,
                bottomSpace: 0.1,
                minContentHeight: null,
                minContentDescent: null,
                height: null,
                descent: null,
              },
            },
          },
          // Method Array
          2: {
            matrix: [
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right', 1, 'min',
              [0.1, 0.1], 'baseline', {
                inSize: true,
                insideSpace: 0.1,
                outsideSpace: 0.1,
                topSpace: 0.1,
                bottomSpace: 0.1,
                minContentHeight: null,
                minContentDescent: null,
                height: null,
                descent: null,
              },
            ],
          },
          // Function with Method Array
          3: e.matrix([
            [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right', 1, 'min',
            [0.1, 0.1], 'baseline', {
              inSize: true,
              insideSpace: 0.1,
              outsideSpace: 0.1,
              topSpace: 0.1,
              bottomSpace: 0.1,
              minContentHeight: null,
              minContentDescent: null,
              height: null,
              descent: null,
            }]),
          // Bound Function with Object
          4: matrix({
            order: [2, 2],
            left: 'left',
            content: ['a', 'b', 'c', 'd'],
            right: 'right',
            scale: 1,
            fit: 'min',
            space: [0.1, 0.1],
            yAlign: 'baseline',
            brac: {
              inSize: true,
              insideSpace: 0.1,
              outsideSpace: 0.1,
              topSpace: 0.1,
              bottomSpace: 0.1,
              minContentHeight: null,
              minContentDescent: null,
              height: null,
              descent: null,
            },
          }),
        });
        figure.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(figure.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const matrix = e.matrix.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              matrix: {
                content: ['a', 'b', 'c', 'd'],
                left: 'left',
                right: 'right',
                order: [2, 2],
                scale: 1,
                fit: 'min',
                space: [0.1, 0.1],
                yAlign: 'baseline',
                brac: { insideSpace: 0.1 },
              },
            },
            scale: 1,
          },
          rowVector: {
            content: matrix([
              [1, 4], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
            ]),
            scale: 1,
          },
          columnVector: {
            content: matrix([
              [4, 1], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
            ]),
            scale: 1,
          },
          scale: {
            content: matrix([
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
              0.5, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
            ]),
            scale: 1,
          },
          fit: {
            content: matrix([
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'max', [0.1, 0.1], 'middle', { insideSpace: 0.1 },
            ]),
            scale: 1,
          },
          space: {
            content: matrix([
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'min', [0.2, 0.3], 'baseline', { insideSpace: 0.1 },
            ]),
            scale: 1,
          },
          yAlign: {
            content: matrix([
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'min', [0.1, 0.1], 'middle', { insideSpace: 0.1 },
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
    let baseD;
    let baseLeft;
    let initialSpace;
    let insideSpace;
    let scale;
    let space;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      figure.setFirstTransform();
      baseA = eqn._a.getBoundingRect('local');
      baseB = eqn._b.getBoundingRect('local');
      baseC = eqn._c.getBoundingRect('local');
      baseD = eqn._d.getBoundingRect('local');
      baseLeft = eqn._left.getBoundingRect('local');
      initialSpace = 0.1;
      insideSpace = 0.1;
      scale = 0.5;
      space = new Point(0.2, 0.3);
    });
    test('Row Vector', () => {
      eqn.showForm('rowVector');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      const newD = eqn._d.getBoundingRect('local');
      expect(round(newA.left)).toBe(round(baseLeft.right + insideSpace));
      expect(round(newB.left)).toBe(round(newA.right + initialSpace));
      expect(round(newC.left)).toBe(round(newB.right + initialSpace));
      expect(round(newD.left)).toBe(round(newC.right + initialSpace));
      expect(round(newB.bottom)).toBe(round(newA.bottom));
      expect(round(newC.bottom)).toBe(round(newA.bottom));
      expect(round(newD.bottom)).toBe(round(newA.bottom));
    });
    test('Column Vector', () => {
      eqn.showForm('columnVector');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      const newD = eqn._d.getBoundingRect('local');
      expect(round(newA.left)).toBe(round(baseLeft.right + insideSpace));
      expect(round(newB.left)).toBe(round(newA.left));
      expect(round(newC.left)).toBe(round(newB.left));
      expect(round(newD.left)).toBe(round(newC.left));
      expect(round(newA.bottom)).toBe(round(newB.top + initialSpace));
      expect(round(newB.bottom)).toBe(round(newC.top + initialSpace));
      expect(round(newC.bottom)).toBe(round(newD.top + initialSpace));
    });
    test('Scale', () => {
      eqn.showForm('scale');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newC = eqn._c.getBoundingRect('local');
      const newD = eqn._d.getBoundingRect('local');
      expect(round(newA.height)).toBe(round(baseA.height * scale));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
      expect(round(newC.height)).toBe(round(baseC.height * scale));
      expect(round(newD.height)).toBe(round(baseD.height * scale));
    });
    test('max', () => {
      eqn.showForm('fit');
      figure.setFirstTransform();
      // in this case the height of the b or d is the max dimension so the width
      // of all columns becomes it.
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newA.left))
        .toBe(round(baseLeft.right + initialSpace + (newB.height - newA.width) / 2));
    });
    test('Space', () => {
      eqn.showForm('space');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      const newD = eqn._d.getBoundingRect('local');
      expect(round(newB.left)).toBe(round(newA.right + space.x));
      expect(round(newB.bottom)).toBe(round(newD.top + space.y));
    });
    test('yAlign', () => {
      eqn.showForm('yAlign');
      figure.setFirstTransform();
      const newA = eqn._a.getBoundingRect('local');
      const newB = eqn._b.getBoundingRect('local');
      expect(round(newA.bottom))
        .toBe(round(newB.bottom + (newB.height - newA.height) / 2));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._d];
    const formsToTest = ['1', '2', '3', '4'];
    eqn.showForm('base');
    figure.setFirstTransform();
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      figure.setFirstTransform();
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
    expect(round(eqn._d.transform.mat)).toMatchSnapshot();
  });
});
