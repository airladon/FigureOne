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

describe('Equation Symbols - Radical', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  let space;
  let lineWidth;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    space = 0.1;
    lineWidth = 0.01;
    elements = {
      a: 'a',
      root: '3',
      rad: {
        symbol: 'radical',
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
      rad1: {
        symbol: 'radical',
        color: color1,
        lineWidth,
        lineWidth2: lineWidth * 2,
        startWidth: 0.04,
        startHeight: 0.04,
        tickHeight: 0.01,
        tickWidth: 0.01,
        downWidth: 0.01,
        maxStartWidth: 0.03,
        maxStartHeight: 0.03,
        proportionalToHeight: false,
        draw: 'dynamic',
      },
    };
    // eqn = figure.add({ make: 'equation', color: color1 });
    eqn = new Equation(figure.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ default: { content: { root: ['rad', 'a', true, space] }, scale: 1 } });
    eqn.addForms({ notProportional: { content: { root: ['rad1', 'a', true, space] }, scale: 1 } });
    figure.elements = eqn;
  });
  test('Default', () => {
    eqn.showForm('default');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('local');
    const rad = eqn._rad.getBoundingRect('local');
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

    expect(round(a.left)).toBe(round(startWidth + space));

    expect(round(rad.right)).toBe(round(a.right + space));
    expect(round(rad.top)).toBe(round(a.top + space + lineWidth));
    expect(round(rad.bottom)).toBe(round(a.bottom - space));
  });
  test('Not Proportaional', () => {
    eqn.showForm('notProportional');
    figure.setFirstTransform();
    const a = eqn._a.getBoundingRect('local');
    const rad = eqn._rad1.getBoundingRect('local');
    expect(round(rad.height)).toBe(round(a.height + space * 2 + lineWidth));
    const startHeight = eqn._rad1.drawingObject.points[5];
    expect(round(startHeight)).toBe(round(0.03));

    const startWidth = eqn._rad1.drawingObject.points[12];
    expect(round(startWidth)).toBe(round(0.03));

    const tickHeight = startHeight - eqn._rad1.drawingObject.points[1];
    expect(round(tickHeight)).toBe(round(0.01));

    const tickWidth = eqn._rad1.drawingObject.points[4];
    expect(round(tickWidth)).toBe(round(0.01));

    const downWidth = eqn._rad1.drawingObject.points[4];
    expect(round(downWidth)).toBe(round(0.01));

    expect(round(a.left)).toBe(round(startWidth + space));

    expect(round(rad.right)).toBe(round(a.right + space));
    expect(round(rad.top)).toBe(round(a.top + space + lineWidth));
    expect(round(rad.bottom)).toBe(round(a.bottom - space));
  });
});
