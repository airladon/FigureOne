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

describe('Equation Symbols - Radical', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  let space;
  let lineWidth;
  let width;
  let height;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    space = 0.1;
    lineWidth = 0.01;
    width = 1;
    height = 1;
    elements = {
      a: 'a',
      root: '3',
      rad: {
        symbol: 'radicalNew',
        color: color1,
        lineWidth,
        lineWidth2: lineWidth * 2,
        startWidth: 0.3,
        startHeight: 0.3,
        tickHeight: 0.1,
        tickWidth: 0.1,
        downWidth: 0.1,
        maxStartWidth: null,
        maxStartHeight: null,
        proportionalToHeight: true,
        draw: 'dynamic',
      },
      // boxWidthHeight: {
      //   symbol: 'box',
      //   color: color1,
      //   fill: false,
      //   width,
      //   height,
      //   lineWidth,
      //   draw: 'dynamic',
      //   // staticWidth: 'first',
      //   // staticHeight: 'first',
      // },
      // boxStaticFirst: {
      //   symbol: 'box',
      //   color: color1,
      //   fill: false,
      //   width: null,
      //   height: null,
      //   lineWidth,
      //   draw: 'static',
      //   staticWidth: 'first',
      //   staticHeight: 'first',
      // },
      // boxStatic1: {
      //   symbol: 'box',
      //   color: color1,
      //   fill: false,
      //   width: null,
      //   height: null,
      //   lineWidth,
      //   draw: 'static',
      //   staticWidth: 1,
      //   staticHeight: 1,
      // },
      // boxFill: {
      //   symbol: 'box',
      //   color: color1,
      //   fill: true,
      //   width: null,
      //   height: null,
      //   // lineWidth,
      //   draw: 'dynamic',
      //   staticWidth: 'first',
      //   staticHeight: 'first',
      // },
    };
    eqn = new EquationNew(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ default: { content: { root: ['a', 'rad', true, space] }, scale: 1 } });
    // eqn.addForms({ boxWidthHeight: { box: ['a', 'boxWidthHeight', true, space] } });
    // eqn.addForms({ boxStaticFirst: { box: ['a', 'boxStaticFirst', true, space] } });
    // eqn.addForms({ boxStatic1: { box: ['a', 'boxStatic1', true, space] } });
    // eqn.addForms({ boxFill: { box: ['a', 'boxFill', true, space] } });
    diagram.elements = eqn;
  });
  test.only('Default', () => {
    eqn.showForm('default');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const rad = eqn._rad.getBoundingRect('diagram');
    expect(round(rad.height)).toBe(round(a.height + space * 2 + lineWidth));
    const h = rad.height;

    const startHeight = eqn._rad.drawingObject.points[5];
    expect(round(startHeight)).toBe(round(h * 0.3));

    const startWidth = eqn._rad.drawingObject.points[12];
    expect(round(startWidth)).toBe(round(h * 0.3));

    const tickHeight = startHeight - eqn._rad.drawingObject.points[1];
    expect(round(tickHeight)).toBe(round(0.1 * startHeight));

    const tickWidth = eqn._rad.drawingObject.points[4];
    expect(round(tickWidth)).toBe(round(0.1 * startWidth));

    const downWidth = eqn._rad.drawingObject.points[4];
    expect(round(downWidth)).toBe(round(0.1 * startWidth));

    console.log(eqn._rad.drawingObject.points)
    console.log(a)
    console.log(rad)

    // expect(round(a.left)).toBe(round(startWidth + space));
    // expect(round(a.left)).toBe(round(0.3 * height));
    
  });
  // test('Box Dynamic', () => {
  //   eqn.showForm('boxDynamic');
  //   diagram.setFirstTransform();
  //   const box = eqn._boxDynamic.getBoundingRect('diagram');
  //   const a = eqn._a.getBoundingRect('diagram');
  //   expect(round(box.left)).toBe(0);
  //   expect(round(box.width)).toBe(space * 2 + lineWidth * 2 + a.width);
  //   expect(round(box.height)).toBe(space * 2 + lineWidth * 2 + a.height);
  //   expect(round(a.left)).toBe(round(space + lineWidth));
  //   expect(round(eqn._a.drawingObject.points)).toMatchSnapshot();
  //   expect(round(eqn._boxDynamic.drawingObject.points)).toMatchSnapshot();
  // });
  // test('Box WidthHeight', () => {
  //   eqn.showForm('boxWidthHeight');
  //   diagram.setFirstTransform();
  //   const box = eqn._boxWidthHeight.getBoundingRect('diagram');
  //   const a = eqn._a.getBoundingRect('diagram');
  //   expect(round(box.left)).toBe(0);
  //   expect(round(box.width)).toBe(width);
  //   expect(round(box.height)).toBe(height);
  //   // expect(round(a.left)).toBe(round(width / 2 - a.width / 2 - space));
  //   expect(round(a.left)).toBe(round(lineWidth + width / 2 - a.width / 2));
  //   expect(round(box.bottom)).toBe(round(a.bottom + a.height / 2 - height / 2 - lineWidth));
  // });
  // test('Box Static First', () => {
  //   eqn.showForm('boxStaticFirst');
  //   diagram.setFirstTransform();
  //   const box = eqn._boxStaticFirst.getBoundingRect('diagram');
  //   const a = eqn._a.getBoundingRect('diagram');
  //   expect(round(box.left)).toBe(0);
  //   expect(round(box.width)).toBe(space * 2 + lineWidth * 2 + a.width);
  //   expect(round(box.height)).toBe(space * 2 + lineWidth * 2 + a.height);
  // });
  // test('Box Static 1', () => {
  //   eqn.showForm('boxStatic1');
  //   diagram.setFirstTransform();
  //   const box = eqn._boxStatic1.getBoundingRect('diagram');
  //   const a = eqn._a.getBoundingRect('diagram');
  //   expect(round(box.left)).toBe(0);
  //   const widthLineWidthRatio = lineWidth / 1;
  //   const heightLineWidthRatio = lineWidth / 1;
  //   expect(round(box.width)).toBe(round((space * 2 + a.width) / (1 - 2 * widthLineWidthRatio)));
  //   expect(round(box.height)).toBe(round((space * 2 + a.height) / (1 - 2 * heightLineWidthRatio)));
  // });
  // test('Box Fill', () => {
  //   eqn.showForm('boxFill');
  //   diagram.setFirstTransform();
  //   const box = eqn._boxFill.getBoundingRect('diagram');
  //   const a = eqn._a.getBoundingRect('diagram');
  //   expect(round(box.left)).toBe(0);
  //   expect(round(box.width)).toBe(round(a.width + space * 2));
  //   expect(round(box.height)).toBe(round(a.height + space * 2));
  // });
});
