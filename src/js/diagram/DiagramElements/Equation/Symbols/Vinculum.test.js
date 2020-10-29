import {
  Rect,
} from '../../../../tools/g2';
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

describe('Equation Symbols - Vinculum', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    diagram = makeDiagram();
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
    eqn = new Equation(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms({ 0: { frac: ['a', 'v', 'b'] } });
  });
  test('Snapshot', () => {
    eqn.showForm('0');
    diagram.setFirstTransform();
    expect(round(eqn._v.drawingObject.points)).toMatchSnapshot();
  });
  test('Border calculated using getTransform and not this.transform', () => {
    eqn.showForm('0');
    diagram.initialize();
    const a = eqn._a.getBoundingRect('local').round(3);
    const b = eqn._b.getBoundingRect('local').round(3);
    const v = eqn._v.getBoundingRect('local').round(3);
    const e = eqn.getBoundingRect('local').round(3);

    expect(a).toEqual(new Rect(0.035, 0.094, 0.07, 0.072).round(3));
    expect(b).toEqual(new Rect(0.035, -0.09, 0.07, 0.104).round(3));
    expect(v).toEqual(new Rect(0, 0.049, 0.14, 0.01).round(3));
    expect(e).toEqual(new Rect(0, -0.09, 0.14, 0.256).round(3));
  })
});
