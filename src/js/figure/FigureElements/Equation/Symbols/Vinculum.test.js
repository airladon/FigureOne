import {
  Rect,
} from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
import { Equation } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Symbols - Vinculum', () => {
  let figure;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    figure = makeFigure();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      b: 'b',
      v: {
        symbol: 'vinculum',
        lineWidth: 0.01,
        draw: 'dynamic',
      },
    };
    eqn = new Equation(figure.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { frac: ['a', 'v', 'b'] } });
  });
  test('Snapshot', () => {
    eqn.showForm('0');
    figure.setFirstTransform();
    expect(round(eqn._v.drawingObject.points)).toMatchSnapshot();
  });
  test('Border calculated using getTransform and not this.transform', () => {
    eqn.showForm('0');
    figure.initialize();
    const a = eqn._a.getBoundingRect('local').round(3);
    const b = eqn._b.getBoundingRect('local').round(3);
    const v = eqn._v.getBoundingRect('local').round(3);
    const e = eqn.getBoundingRect('local').round(3);

    expect(a).toEqual(new Rect(0.035, 0.094, 0.07, 0.072).round(3));
    expect(b).toEqual(new Rect(0.035, -0.09, 0.07, 0.104).round(3));
    expect(v).toEqual(new Rect(0, 0.049, 0.14, 0.01).round(3));
    expect(e).toEqual(new Rect(0, -0.09, 0.14, 0.256).round(3));
  });
});
