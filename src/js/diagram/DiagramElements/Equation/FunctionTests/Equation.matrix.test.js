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

describe('Equation Functions - Matrix', () => {
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
      d: 'd',
      left: { symbol: 'bracket', side: 'left' },
      right: { symbol: 'bracket', side: 'right' },
    };
    functions = {
      inputForms: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
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
                vAlign: 'baseline',
                brac: {
                  inSize: null,
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
              vAlign: 'baseline',
              brac: {
                inSize: null,
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
                inSize: null,
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
              inSize: null,
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
            vAlign: 'baseline',
            brac: {
              inSize: null,
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
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
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
                vAlign: 'baseline',
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
              1, 'max', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
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
          vAlign: {
            content: matrix([
              [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
              1, 'min', [0.1, 0.1], 'middle', { insideSpace: 0.1 },
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
    let baseD;
    let baseLeft;
    let initialSpace;
    let insideSpace;
    let scale;
    let space;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      baseD = eqn._d.getBoundingRect('diagram');
      baseLeft = eqn._left.getBoundingRect('diagram');
      initialSpace = 0.1;
      insideSpace = 0.1;
      scale = 0.5;
      space = new Point(0.2, 0.3);
    });
    test('Row Vector', () => {
      eqn.showForm('rowVector');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newD = eqn._d.getBoundingRect('diagram');
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
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newD = eqn._d.getBoundingRect('diagram');
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
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      const newD = eqn._d.getBoundingRect('diagram');
      expect(round(newA.height)).toBe(round(baseA.height * scale));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
      expect(round(newC.height)).toBe(round(baseC.height * scale));
      expect(round(newD.height)).toBe(round(baseD.height * scale));
    });
    test('max', () => {
      eqn.showForm('fit');
      diagram.setFirstTransform();
      // in this case the height of the b or d is the max dimension so the width
      // of all columns becomes it.
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.left))
        .toBe(round(baseLeft.right + initialSpace + (newB.height - newA.width) / 2));
    });
    test('Space', () => {
      eqn.showForm('space');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newD = eqn._d.getBoundingRect('diagram');
      expect(round(newB.left)).toBe(round(newA.right + space.x));
      expect(round(newB.bottom)).toBe(round(newD.top + space.y));
    });
    test('vAlign', () => {
      eqn.showForm('vAlign');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.bottom))
        .toBe(round(newB.bottom + (newB.height - newA.height) / 2));
    });
  });
  test('Input Forms', () => {
    functions.inputForms();
    const elems = [eqn._a, eqn._b, eqn._c, eqn._d];
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
    expect(round(eqn._d.transform.mat)).toMatchSnapshot();
  });
});
