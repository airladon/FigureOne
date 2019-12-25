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

describe('Equation Functions - Box', () => {
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
      box: { symbol: 'box', color: [0, 0.9, 0, 1], lineWidth: 0.01 },
      boxFill: { symbol: 'box', color: [0, 0.9, 0, 1], fill: true },
      boxStatic: {
        symbol: 'box',
        color: [0, 0.9, 0, 1],
        lineWidth: 0.1,
        draw: 'static',
        staticHeight: 1,
        staticWidth: 2,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const box = e.box.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              box: {
                content: 'a',
                symbol: 'box',
              },
            },
          },
          //   // Method Object
          1: {
            box: {
              content: 'a',
              symbol: 'box',
            },
          },
          // Method Array
          2: { box: ['a', 'box'] },
          // Function with Method Array
          3: e.box(['a', 'box']),
          // Bound Function with Object
          4: box({
            content: 'a',
            symbol: 'box',
          }),
        });
      },
      parameterSteps: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        // const e = eqn.eqn.functions;
        eqn.addElements(elements);
        diagram.elements = eqn;
        eqn.addForms({
          // Full Object
          base: {
            content: {
              box: {
                content: 'a',
                symbol: 'box',
                inSize: true,
                space: 0.1,
                topSpace: null,
                bottomSpace: null,
                leftSpace: null,
                rightSpace: null,
                fill: false,
              },
            },
            scale: 1,
          },
          topSpace: {
            content: { box: ['a', 'box', true, 0.1, 0.2, null, null, null] },
            scale: 1,
          },
          rightSpace: {
            content: { box: ['a', 'box', true, 0.1, null, 0.2, null, null] },
            scale: 1,
          },
          bottomSpace: {
            content: { box: ['a', 'box', true, 0.1, null, null, 0.2, null] },
            scale: 1,
          },
          leftSpace: {
            content: { box: ['a', 'box', true, 0.1, null, null, null, 0.2] },
            scale: 1,
          },
          notInSize: {
            content: { box: ['a', 'box', false, 0.1, null, null, null, null] },
            scale: 1,
          },
        });
      },
    };
  });
  describe('Parameter Steps', () => {
    let baseA;
    let baseBox;
    let space;
    let lineWidth;
    let newSpace;
    beforeEach(() => {
      functions.parameterSteps();
      eqn.showForm('base');
      diagram.setFirstTransform();
      baseA = eqn._a.getBoundingRect('diagram');
      baseBox = eqn._box.getBoundingRect('diagram');
      space = 0.1;
      lineWidth = 0.01;
      newSpace = 0.2;
    });
    test('Base', () => {
      expect(round(baseBox.width)).toBe(round(baseA.width + space * 2 + lineWidth * 2));
      expect(round(baseBox.height)).toBe(round(baseA.height + space * 2 + lineWidth * 2));
      expect(round(baseBox.left)).toBe(0);
      expect(round(baseBox.bottom)).toBe(round(baseA.bottom - space - lineWidth));
      expect(round(baseA.left)).toBe(round(baseBox.left + space + lineWidth));
    });
    test('Top Space', () => {
      eqn.showForm('topSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newBox = eqn._box.getBoundingRect('diagram');
      expect(round(newBox.width)).toBe(round(newA.width + space * 2 + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space + newSpace + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Left Space', () => {
      eqn.showForm('leftSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newBox = eqn._box.getBoundingRect('diagram');
      expect(round(newBox.width)).toBe(round(newA.width + space + newSpace + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space * 2 + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + newSpace + lineWidth));
    });
    test('Bottom Space', () => {
      eqn.showForm('bottomSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newBox = eqn._box.getBoundingRect('diagram');
      expect(round(newBox.width)).toBe(round(newA.width + space * 2 + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space + newSpace + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - newSpace - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Right Space', () => {
      eqn.showForm('rightSpace');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newBox = eqn._box.getBoundingRect('diagram');
      expect(round(newBox.width)).toBe(round(newA.width + space + newSpace + lineWidth * 2));
      expect(round(newBox.height)).toBe(round(newA.height + space * 2 + lineWidth * 2));
      expect(round(newBox.left)).toBe(0);
      expect(round(newBox.bottom)).toBe(round(newA.bottom - space - lineWidth));
      expect(round(newA.left)).toBe(round(newBox.left + space + lineWidth));
    });
    test('Not In Size', () => {
      eqn.showForm('notInSize');
      diagram.setFirstTransform();
      const newA = eqn._a.getBoundingRect('diagram');
      const newBox = eqn._box.getBoundingRect('diagram');
      expect(round(newA.left)).toBe(round(0));
      expect(round(newBox.left)).toBe(-space - lineWidth)
    });
  });
  test('Box', () => {
    functions.single();
    const elems = [eqn._a];
    const formsToTest = ['1', '2', '3', '4'];

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
    expect(round(eqn._box.transform.mat)).toMatchSnapshot();
  });
  // test('Box Parameters', () => {
  //   functions.parameters();
  //   const elems = [eqn._a];
  //   const noMoveCases = ['true0fill', 'false0_1', 'false0p1'];
  //   const moveCases = ['1', '2'];

  //   // get without positions
  //   eqn.showForm('false0');
  //   const false0 = elems.map(elem => round(elem.transform.mat).slice());

  //   noMoveCases.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(false0).toEqual(positions);
  //   });

  //   // with reference positions
  //   eqn.showForm('0');
  //   const true0p1 = elems.map(elem => round(elem.transform.mat).slice());
  //   expect(false0).not.toEqual(true0p1);

  //   moveCases.forEach((f) => {
  //     eqn.showForm(f);
  //     const positions = elems.map(elem => round(elem.transform.mat).slice());
  //     expect(true0p1).toEqual(positions);
  //   });
  // });
  // test('Box Line Element', () => {
  //   functions.box();
  //   const w = 0.1;
  //   const box = eqn._box;
  //   const a = eqn._a.getBoundingRect();
  //   box.custom.setSize(a);

  //   let bx = box.getBoundingRect();
  //   // console.log(box.drawingObject.points)
  //   expect(round(bx.left)).toEqual(round(a.left - w));
  //   expect(round(bx.width)).toEqual(round(a.width + w * 2));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w));
  //   expect(round(bx.height)).toEqual(round(a.height + w * 2));

  //   let s = 0.1; // space
  //   box.custom.setSize(a, s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w * 2 + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w * 2 + 2 * s));

  //   s = 0.2;
  //   box.custom.setSize(eqn, ['a'], s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w * 2 + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w * 2 + 2 * s));
  // });
  // test('Box Fill Element', () => {
  //   functions.box();
  //   const w = 0;
  //   const box = eqn._box1;
  //   const a = eqn._a.getBoundingRect();
  //   box.custom.setSize(a);

  //   let bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2));
  //   expect(round(bx.width)).toEqual(round(a.width + w));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2));
  //   expect(round(bx.height)).toEqual(round(a.height + w));

  //   let s = 0.1; // space
  //   box.custom.setSize(a, s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));

  //   s = 0.2;
  //   box.custom.setSize(eqn, ['a'], s);
  //   bx = box.getBoundingRect();
  //   expect(round(bx.left)).toEqual(round(a.left - w / 2 - s));
  //   expect(round(bx.width)).toEqual(round(a.width + w + 2 * s));
  //   expect(round(bx.bottom)).toEqual(round(a.bottom - w / 2 - s));
  //   expect(round(bx.height)).toEqual(round(a.height + w + 2 * s));
  // });
});
