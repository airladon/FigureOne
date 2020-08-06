import {
  Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Polygon', () => {
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'line',
        method: 'polygon',
        options: {
          radius: 1 * Math.sqrt(2),
          sides: 4,
          rotation: Math.PI / 4,
          width: 0.1,
          line: {
            widthIs: 'mid',
          },
        },
      },
      {
        name: 'fill',
        method: 'polygon',
        options: {
          fill: true,
          radius: 1 * Math.sqrt(2),
          rotation: Math.PI / 4,
        },
      },
    ]);
    diagram.setFirstTransform();
  });
  test('Base Line', () => {
    const line = diagram.elements._line;
    expect(round(line.drawingObject.points)).toEqual([
      0.95, 0.95,
      -0.95, 0.95,
      1.05, 1.05,
      1.05, 1.05,
      -0.95, 0.95,
      -1.05, 1.05,
      //
      -0.95, 0.95,
      -0.95, -0.95,
      -1.05, 1.05,
      -1.05, 1.05,
      -0.95, -0.95,
      -1.05, -1.05,
      //
      -0.95, -0.95,
      0.95, -0.95,
      -1.05, -1.05,
      -1.05, -1.05,
      0.95, -0.95,
      1.05, -1.05,
      //
      0.95, -0.95,
      0.95, 0.95,
      1.05, -1.05,
      1.05, -1.05,
      0.95, 0.95,
      1.05, 1.05,
    ]);

    expect(round(line.drawingObject.border)).toEqual([[
      new Point(1.05, 1.05),
      new Point(-1.05, 1.05),
      new Point(-1.05, -1.05),
      new Point(1.05, -1.05),
    ]]);
    expect(line.getPosition()).toEqual(new Point(0, 0));
  });
  test('Line Update', () => {
    const line = diagram.elements._line;
    line.update({ radius: 2 * Math.sqrt(2) });
    expect(round(line.drawingObject.points)).toEqual([
      1.95, 1.95,
      -1.95, 1.95,
      2.05, 2.05,
      2.05, 2.05,
      -1.95, 1.95,
      -2.05, 2.05,
      //
      -1.95, 1.95,
      -1.95, -1.95,
      -2.05, 2.05,
      -2.05, 2.05,
      -1.95, -1.95,
      -2.05, -2.05,
      //
      -1.95, -1.95,
      1.95, -1.95,
      -2.05, -2.05,
      -2.05, -2.05,
      1.95, -1.95,
      2.05, -2.05,
      //
      1.95, -1.95,
      1.95, 1.95,
      2.05, -2.05,
      2.05, -2.05,
      1.95, 1.95,
      2.05, 2.05,
    ]);

    expect(round(line.drawingObject.border)).toEqual([[
      new Point(2.05, 2.05),
      new Point(-2.05, 2.05),
      new Point(-2.05, -2.05),
      new Point(2.05, -2.05),
    ]]);
    expect(line.getPosition()).toEqual(new Point(0, 0));
  });
  test('Base Fill', () => {
    const fill = diagram.elements._fill;
    expect(round(fill.drawingObject.points)).toEqual([
      0, 0,
      1, 1,
      -1, 1,
      -1, -1,
      1, -1,
      1, 1,
    ]);
    expect(round(fill.drawingObject.border)).toEqual([[
      new Point(1, 1),
      new Point(-1, 1),
      new Point(-1, -1),
      new Point(1, -1),
    ]]);
  });
  test('Update Fill', () => {
    const fill = diagram.elements._fill;
    fill.update({ radius: 2 * Math.sqrt(2) });
    expect(round(fill.drawingObject.points)).toEqual([
      0, 0,
      2, 2,
      -2, 2,
      -2, -2,
      2, -2,
      2, 2,
    ]);
    expect(round(fill.drawingObject.border)).toEqual([[
      new Point(2, 2),
      new Point(-2, 2),
      new Point(-2, -2),
      new Point(2, -2),
    ]]);
  });
});
