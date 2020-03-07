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

describe('Equation Symbols - Bracket', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      s: {
        symbol: 'strike',
        style: 'cross',
        lineWidth: 0.01,
      },
      sf: {
        symbol: 'strike',
        style: 'forward',
        lineWidth: 0.01,
      },
      sb: {
        symbol: 'strike',
        style: 'back',
        lineWidth: 0.01,
      },
      sh: {
        symbol: 'strike',
        style: 'horizontal',
        lineWidth: 0.01,
      },
      fixedHeightWidth: {
        symbol: 'strike',
        style: 'cross',
        lineWidth: 0.01,
        height: 1,
        width: 1,
      },
      staticFirst: {
        symbol: 'strike',
        style: 'horizontal',
        lineWidth: 0.01,
        draw: 'static',
        staticHeight: 'first',
        staticWidth: 'first',
      },
      static: {
        symbol: 'strike',
        style: 'horizontal',
        lineWidth: 0.01,
        draw: 'static',
        staticHeight: 1,
        staticWidth: 1,
      },
    };
    eqn = new Equation(diagram.shapes, { color: color1 });
    eqn.addElements(elements);
    eqn.addForms(
      {
        cross: { strike: ['a', 's'] },
        forward: { strike: ['a', 'sf'] },
        back: { strike: ['a', 'sb'] },
        horizontal: { strike: ['a', 'sh'] },
        staticFirst: { strike: ['a', 'staticFirst'] },
        static: { strike: ['a', 'static'] },
        fixedHeightWidth: { strike: ['a', 'fixedHeightWidth'] },
      },
    );
    diagram.elements = eqn;
  });
  test('Snapshot Cross', () => {
    eqn.showForm('cross');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const s = eqn._s.getBoundingRect('diagram');
    expect(round(s.width)).toBe(round(a.width + (0.02 * 2) * 0.7));
    expect(round(s.height)).toBe(round(a.height + (0.02 * 2) * 0.7));
    expect(round(eqn._s.drawingObject.points)).toMatchSnapshot();
  });
  test('Snapshot Forward', () => {
    eqn.showForm('forward');
    expect(round(eqn._sf.drawingObject.points)).toMatchSnapshot();
  });
  test('Snapshot Backward', () => {
    eqn.showForm('backward');
    expect(round(eqn._sb.drawingObject.points)).toMatchSnapshot();
  });
  test('Snapshot Horizontal', () => {
    eqn.showForm('horizontal');
    expect(round(eqn._sh.drawingObject.points)).toMatchSnapshot();
  });
  test('Fixed Height Width', () => {
    eqn.showForm('fixedHeightWidth');
    diagram.setFirstTransform();
    // const a = eqn._a.getBoundingRect('diagram');
    const s = eqn._fixedHeightWidth.getBoundingRect('diagram');
    expect(round(s.width)).toBe(round(1));
    expect(round(s.height)).toBe(round(1));
    // expect(round(eqn._s.drawingObject.points)).toMatchSnapshot();
  });
  test('staticFirst', () => {
    eqn.showForm('staticFirst');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const s = eqn._staticFirst.getBoundingRect('diagram');
    expect(round(s.width)).toBe(round(a.width + (0.02 * 2) * 0.7));
    expect(round(s.height)).toBe(round(a.height));
    const yBottom = eqn._staticFirst.drawingObject.points[1];
    const yTop = eqn._staticFirst.drawingObject.points.slice(-1)[0];
    expect(round(yTop - yBottom)).toBe(0.01);
    expect(round(yBottom)).toBe(round(a.height / 2 - 0.005));
  });
  test('static', () => {
    eqn.showForm('static');
    diagram.setFirstTransform();
    const a = eqn._a.getBoundingRect('diagram');
    const s = eqn._static.getBoundingRect('diagram');
    expect(round(s.width)).toBe(round(a.width + (0.02 * 2) * 0.7));
    expect(round(s.height)).toBe(round(a.height));
    const yBottom = eqn._static.drawingObject.points[1];
    const yTop = eqn._static.drawingObject.points.slice(-1)[0];
    expect(round(yTop - yBottom)).toBe(0.01);
    expect(round(yBottom)).toBe(round(0.5 - 0.005));
  });
});
