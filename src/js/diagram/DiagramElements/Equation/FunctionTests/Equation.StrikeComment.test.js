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

describe('Equation Functions - Bar', () => {
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
      x: { symbol: 'strike', style: 'cross' },
    };
    functions = {
      topStrike: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const topStrike = e.topStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              topStrike: {
                content: 'a',
                comment: 'b',
                symbol: 'x',
              },
            },
          },
          //   // Method Object
          1: {
            topStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
            },
          },
          // Method Array
          2: { topStrike: ['a', 'x', 'b'] },
          // Function with Method Array
          3: e.topStrike(['a', 'x', 'b']),
          // Function with parameters
          // 4: e.topStrike('a', 'b', 'x'),
          // Bound Function with parameters
          4: topStrike(['a', 'x', 'b']),
          // Bound Function with Object
          5: topStrike({
            content: 'a',
            comment: 'b',
            symbol: 'x',
          }),
        });
      },
      bottomStrike: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bottomStrike = e.bottomStrike.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bottomStrike: {
                content: 'a',
                comment: 'b',
                symbol: 'x',
              },
            },
          },
          //   // Method Object
          1: {
            bottomStrike: {
              content: 'a',
              comment: 'b',
              symbol: 'x',
            },
          },
          // Method Array
          2: { bottomStrike: ['a', 'x', 'b'] },
          // Function with Method Array
          3: e.bottomStrike(['a', 'x', 'b']),
          // Function with parameters
          // 4: e.bottomStrike('a', 'b', 'x'),
          // Bound Function with parameters
          4: bottomStrike(['a', 'x', 'b']),
          // Bound Function with Object
          5: bottomStrike({
            content: 'a',
            comment: 'b',
            symbol: 'x',
          }),
        });
      },
      topStrikeParameterSteps: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              topStrike: {
                content: 'a',
                symbol: 'x',
                comment: 'b',
                inSize: true,
                commentSpace: 0,
                scale: 1,
                space: 0,
              },
            },
            scale: 1,
          },
          // Method Array
          inSize: {
            content: { topStrike: ['a', 'x', 'b', false, 1, 1, 0] },
            scale: 1,
          },
          space: {
            content: { topStrike: ['a', 'x', 'b', true, 0, 1, 1] },
            scale: 1,
          },
          scale: {
            content: { topStrike: ['a', 'x', 'b', true, 0, 0.5, 0] },
            scale: 1,
          },
          overhang: {
            content: { topStrike: ['a', 'x', 'b', true, 1, 1, 0] },
            scale: 1,
          },
        });
        diagram.elements = eqn;
      },
      bottomStrikeParameterSteps: () => {
        eqn = new Equation(diagram.shapes, { color: color1 });
        eqn.addElements(elements);
        eqn.addForms({
          base: {
            content: {
              bottomStrike: {
                content: 'a',
                symbol: 'x',
                comment: 'b',
                inSize: true,
                commentSpace: 0,
                scale: 1,
                space: 0,
              },
            },
            scale: 1,
          },
          // Method Array
          inSize: {
            content: { bottomStrike: ['a', 'x', 'b', false, 1, 1, 0] },
            scale: 1,
          },
          space: {
            content: { bottomStrike: ['a', 'x', 'b', true, 0, 1, 1] },
            scale: 1,
          },
          scale: {
            content: { bottomStrike: ['a', 'x', 'b', true, 0, 0.5, 0] },
            scale: 1,
          },
          overhang: {
            content: { bottomStrike: ['a', 'x', 'b', true, 1, 1, 0] },
            scale: 1,
          },
        });
        diagram.elements = eqn;
      },
    };
  });
  test('Top Strike', () => {
    functions.topStrike();
    const elems = [eqn._a, eqn._b, eqn._x];
    const formsToTest = ['1', '2', '3', '4', '5'];

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
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._x.transform.mat)).toMatchSnapshot();
  });
  test('Bottom Strike', () => {
    functions.bottomStrike();
    const elems = [eqn._a, eqn._b, eqn._x];
    const formsToTest = ['1', '2', '3', '4', '5'];

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
    expect(round(eqn._b.transform.mat)).toMatchSnapshot();
    expect(round(eqn._x.transform.mat)).toMatchSnapshot();
  });
  describe('Top Strike Parameters', () => {
    let space;
    let overhang;
    let baseB;
    let scale;
    beforeEach(() => {
      functions.topStrikeParameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      // baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      space = 1;
      scale = 0.5;
      overhang = 1;
    });
    test('inSize', () => {
      eqn.showForm('inSize');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width + overhang * 2));
      expect(round(newX.height)).toBe(round(newA.height + overhang * 2));
      expect(round(newX.left)).toBe(round(newA.left - overhang));
      expect(round(newA.left)).toBe(0);
      expect(round(newX.bottom)).toBe(round(newA.bottom - overhang));
      expect(round(newB.bottom)).toBe(round(newA.top + overhang));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
    test('Space', () => {
      eqn.showForm('space');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width));
      expect(round(newX.height)).toBe(round(newA.height));
      expect(round(newX.left)).toBe(round(newA.left));
      expect(round(newX.bottom)).toBe(round(newA.bottom));
      expect(round(newB.bottom)).toBe(round(newA.top + space));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
    test('Scale', () => {
      eqn.showForm('scale');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width));
      expect(round(newX.height)).toBe(round(newA.height));
      expect(round(newX.left)).toBe(round(newA.left));
      expect(round(newX.bottom)).toBe(round(newA.bottom));
      expect(round(newB.bottom)).toBe(round(newA.top));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
      expect(round(newB.width)).toBe(round(baseB.width * scale));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
    });
    test('Overhang', () => {
      eqn.showForm('overhang');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width + overhang * 2));
      expect(round(newX.height)).toBe(round(newA.height + overhang * 2));
      expect(round(newX.left)).toBe(round(newA.left - overhang));
      expect(round(newX.bottom)).toBe(round(newA.bottom - overhang));
      expect(round(newB.bottom)).toBe(round(newX.top));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
  });
  describe('Bottom Strike Parameters', () => {
    let space;
    let overhang;
    let baseB;
    let scale;
    beforeEach(() => {
      functions.bottomStrikeParameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      // baseA = eqn._a.getBoundingRect('diagram');
      baseB = eqn._b.getBoundingRect('diagram');
      space = 1;
      scale = 0.5;
      overhang = 1;
    });
    test('inSize', () => {
      eqn.showForm('inSize');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width + overhang * 2));
      expect(round(newX.height)).toBe(round(newA.height + overhang * 2));
      expect(round(newX.left)).toBe(round(newA.left - overhang));
      expect(round(newA.left)).toBe(0);
      expect(round(newX.bottom)).toBe(round(newA.bottom - overhang));
      expect(round(newB.top)).toBe(round(newA.bottom - overhang));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
    test('Space', () => {
      eqn.showForm('space');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width));
      expect(round(newX.height)).toBe(round(newA.height));
      expect(round(newX.left)).toBe(round(newA.left));
      expect(round(newX.bottom)).toBe(round(newA.bottom));
      expect(round(newB.top)).toBe(round(newA.bottom - space));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
    test('Scale', () => {
      eqn.showForm('scale');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width));
      expect(round(newX.height)).toBe(round(newA.height));
      expect(round(newX.left)).toBe(round(newA.left));
      expect(round(newX.bottom)).toBe(round(newA.bottom));
      expect(round(newB.top)).toBe(round(newA.bottom));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
      expect(round(newB.width)).toBe(round(baseB.width * scale));
      expect(round(newB.height)).toBe(round(baseB.height * scale));
    });
    test('Overhang', () => {
      eqn.showForm('overhang');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newB = eqn._b.getBoundingRect('diagram');
      const newX = eqn._x.getBoundingRect('diagram');
      expect(round(newX.width)).toBe(round(newA.width + overhang * 2));
      expect(round(newX.height)).toBe(round(newA.height + overhang * 2));
      expect(round(newX.left)).toBe(round(newA.left - overhang));
      expect(round(newX.bottom)).toBe(round(newA.bottom - overhang));
      expect(round(newB.top)).toBe(round(newX.bottom));
      expect(round(newB.left)).toBe(round(newA.left + newA.width / 2 - newB.width / 2));
    });
  });
});
