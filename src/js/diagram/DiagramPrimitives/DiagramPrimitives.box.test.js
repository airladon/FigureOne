import {
  Point,
} from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Equation Functions - Box', () => {
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'box',
        method: 'box',
        options: {
          width: 2,
          height: 2,
          lineWidth: 0.1,
        },
      },
      {
        name: 'fill',
        method: 'box',
        options: {
          width: 1,
          height: 1,
          fill: true,
          position: [1, 1],
        },
      },
      {
        name: 'negBox',
        method: 'box',
        options: {
          width: 1,
          height: 1,
          fill: true,
          position: [-1, -1],
        },
      },
      {
        name: 'rightBox',
        method: 'box',
        options: {
          width: 1,
          height: 1,
          fill: true,
          position: [2, 1],
        },
      },
    ]);
    diagram.setFirstTransform();
  });
  test('Base Box', () => {
    const box = diagram.elements._box;
    expect(box.drawingObject.points[0]).toBe(-1);
    expect(box.drawingObject.points[1]).toBe(-1);
    expect(box.drawingObject.points[2]).toBe(-0.9);
    expect(box.drawingObject.points[3]).toBe(-0.9);
    expect(box.drawingObject.points[8]).toBe(1);
    expect(box.drawingObject.points[9]).toBe(1);
    expect(box.drawingObject.points[10]).toBe(0.9);
    expect(box.drawingObject.points[11]).toBe(0.9);
    expect(box.getPosition()).toEqual(new Point(0, 0));
  });
  test('Base Fill', () => {
    const box = diagram.elements._fill;
    expect(box.drawingObject.points[0]).toBe(-0.5);
    expect(box.drawingObject.points[1]).toBe(-0.5);
    expect(box.drawingObject.points[6]).toBe(0.5);
    expect(box.drawingObject.points[7]).toBe(0.5);
    expect(box.getPosition()).toEqual(new Point(1, 1));
  });
  test('Surround', () => {
    const box = diagram.elements._box;
    box.surround(diagram.elements, ['fill', 'negBox', 'rightBox'], 1);
    const width = 2.5 + 1.5 + 1 + 1;
    const height = 1.5 + 1.5 + 1 + 1;
    expect(box.drawingObject.points[0]).toBe(-width / 2);
    expect(box.drawingObject.points[1]).toBe(-height / 2);
    expect(box.drawingObject.points[8]).toBe(width / 2);
    expect(box.drawingObject.points[9]).toBe(height / 2);
    expect(box.getPosition()).toEqual(new Point(-1.5 - 1 + width / 2, -1.5 - 1 + height / 2));
  });
});
