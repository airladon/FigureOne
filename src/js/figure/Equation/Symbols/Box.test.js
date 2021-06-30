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

describe('Equation Symbols - Box', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let space;
  let lineWidth;
  let width;
  let height;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    space = 0.1;
    lineWidth = 0.01;
    width = 1;
    height = 1;
    elements = {
      a: 'a',
      boxDynamic: {
        symbol: 'box',
        color: color1,
        fill: false,
        width: null,
        height: null,
        lineWidth,
        draw: 'dynamic',
        // staticWidth: 'first',
        // staticHeight: 'first',
      },
      boxWidthHeight: {
        symbol: 'box',
        color: color1,
        fill: false,
        width,
        height,
        lineWidth,
        draw: 'dynamic',
        // staticWidth: 'first',
        // staticHeight: 'first',
      },
      boxStaticFirst: {
        symbol: 'box',
        color: color1,
        fill: false,
        width: null,
        height: null,
        lineWidth,
        draw: 'static',
        staticWidth: 'first',
        staticHeight: 'first',
      },
      boxStatic1: {
        symbol: 'box',
        color: color1,
        fill: false,
        width: null,
        height: null,
        lineWidth,
        draw: 'static',
        staticWidth: 1,
        staticHeight: 1,
      },
      boxFill: {
        symbol: 'box',
        color: color1,
        fill: true,
        width: null,
        height: null,
        // lineWidth,
        draw: 'dynamic',
        staticWidth: 'first',
        staticHeight: 'first',
      },
    };
    eqn = new Equation(figure.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({
      boxDynamic: {
        content: { box: ['a', 'boxDynamic', true, space] },
        scale: 1,
      },
    });
    eqn.addForms({
      boxWidthHeight: {
        content: { box: ['a', 'boxWidthHeight', true, space] },
        scale: 1,
      },
    });
    eqn.addForms({
      boxStaticFirst: {
        content: { box: ['a', 'boxStaticFirst', true, space] },
        scale: 1,
      },
    });
    eqn.addForms({
      boxStatic1: {
        content: { box: ['a', 'boxStatic1', true, space] },
        scale: 1,
      },
    });
    eqn.addForms({
      boxFill: {
        content: { box: ['a', 'boxFill', true, space] },
        scale: 1,
      },
    });
    figure.elements = eqn;
  });
  test('Box Dynamic', () => {
    eqn.showForm('boxDynamic');
    figure.setFirstTransform();
    const box = eqn._boxDynamic.getBoundingRect('local');
    const a = eqn._a.getBoundingRect('local');
    expect(round(box.left)).toBe(0);
    expect(round(box.width)).toBe(space * 2 + lineWidth * 2 + a.width);
    expect(round(box.height)).toBe(space * 2 + lineWidth * 2 + a.height);
    expect(round(a.left)).toBe(round(space + lineWidth));
    expect(round(eqn._a.drawingObject.points)).toMatchSnapshot();
    expect(round(eqn._boxDynamic.drawingObject.points)).toMatchSnapshot();
  });
  test('Box WidthHeight', () => {
    eqn.showForm('boxWidthHeight');
    figure.setFirstTransform();
    const box = eqn._boxWidthHeight.getBoundingRect('local');
    const a = eqn._a.getBoundingRect('local');
    expect(round(box.left)).toBe(0);
    expect(round(box.width)).toBe(width);
    expect(round(box.height)).toBe(height);
    // expect(round(a.left)).toBe(round(width / 2 - a.width / 2 - space));
    expect(round(a.left)).toBe(round(lineWidth + width / 2 - a.width / 2));
    expect(round(box.bottom)).toBe(round(a.bottom + a.height / 2 - height / 2 - lineWidth));
  });
  test('Box Static First', () => {
    eqn.showForm('boxStaticFirst');
    figure.setFirstTransform();
    const box = eqn._boxStaticFirst.getBoundingRect('local');
    const a = eqn._a.getBoundingRect('local');
    expect(round(box.left)).toBe(0);
    expect(round(box.width)).toBe(space * 2 + lineWidth * 2 + a.width);
    expect(round(box.height)).toBe(space * 2 + lineWidth * 2 + a.height);
  });
  test('Box Static 1', () => {
    eqn.showForm('boxStatic1');
    figure.setFirstTransform();
    const box = eqn._boxStatic1.getBoundingRect('local');
    const a = eqn._a.getBoundingRect('local');
    expect(round(box.left)).toBe(0);
    const widthLineWidthRatio = lineWidth / 1;
    const heightLineWidthRatio = lineWidth / 1;
    expect(round(box.width)).toBe(round((space * 2 + a.width) / (1 - 2 * widthLineWidthRatio)));
    expect(round(box.height)).toBe(round((space * 2 + a.height) / (1 - 2 * heightLineWidthRatio)));
  });
  test('Box Fill', () => {
    eqn.showForm('boxFill');
    figure.setFirstTransform();
    const box = eqn._boxFill.getBoundingRect('local');
    const a = eqn._a.getBoundingRect('local');
    expect(round(box.left)).toBe(0);
    expect(round(box.width)).toBe(round(a.width + space * 2));
    expect(round(box.height)).toBe(round(a.height + space * 2));
  });
});
