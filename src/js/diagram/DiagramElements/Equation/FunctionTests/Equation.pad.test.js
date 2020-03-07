// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { Equation } from '../Equation';

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
        eqn = new Equation(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const pad = e.pad.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          base: {
            content: {
              pad: {
                content: ['a', 'b', 'c'],
                top: 0.1,
                right: 0.2,
                bottom: 0.3,
                left: 0.4,
              },
            },
          },
          // Method Object
          1: {
            pad: {
              content: ['a', 'b', 'c'],
              top: 0.1,
              right: 0.2,
              bottom: 0.3,
              left: 0.4,
            },
          },
          // Method Array
          2: {
            pad: [['a', 'b', 'c'], 0.1, 0.2, 0.3, 0.4],
          },
          // Function with Method Array
          3: e.pad([['a', 'b', 'c'], 0.1, 0.2, 0.3, 0.4]),
          // Bound Function with Object
          4: pad([['a', 'b', 'c'], 0.1, 0.2, 0.3, 0.4]),
        });
        diagram.elements = eqn;
      },
      parameterSteps: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        // const e = eqn.eqn.functions;
        // const scale = e.scale.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: [{ frac: ['a', 'vinculum', 'b'] }, 'c'],
            scale: 1,
          },
          bottom: {
            content: [
              { frac: [{ pad: { content: 'a', bottom: 1 } }, 'vinculum', 'b'] },
              'c'],
            scale: 1,
          },
          top: {
            content: [
              { frac: ['a', 'vinculum', { pad: { content: 'b', top: 1 } }] },
              'c'],
            scale: 1,
          },
          left: {
            content: [
              { frac: [{ pad: { content: 'a', left: 1 } }, 'vinculum', 'b'] },
              'c'],
            scale: 1,
          },
          right: {
            content: [
              { frac: [{ pad: { content: 'a', right: 1 } }, 'vinculum', 'b'] },
              'c'],
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
    let top;
    let left;
    let right;
    let bottom;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      baseC = eqn._c.getBoundingRect('diagram');
      top = 1;
      left = 1;
      right = 1;
      bottom = 1;
    });
    test('Bottom', () => {
      eqn.showForm('bottom');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newA.bottom)).toEqual(round(baseA.bottom + bottom));
      expect(round(newB.left)).toEqual(round(baseB.left));
      expect(round(newB.bottom)).toEqual(round(baseB.bottom));
    });
    test('Top', () => {
      eqn.showForm('top');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newA.bottom)).toEqual(round(baseA.bottom));
      expect(round(newB.left)).toEqual(round(baseB.left));
      expect(round(newB.bottom)).toEqual(round(baseB.bottom - top));
    });
    test('Left', () => {
      eqn.showForm('left');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left + left));
      expect(round(newC.left)).toEqual(round(baseC.left + left));
    });
    test('Right', () => {
      eqn.showForm('right');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newC = eqn._c.getBoundingRect('diagram');
      expect(round(newA.left)).toEqual(round(baseA.left));
      expect(round(newC.left)).toEqual(round(baseC.left + right));
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
