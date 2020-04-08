import {
  Point, Rect, Line,
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

const toLines = (points) => {
  const lines = [];
  for (let i = 0; i < points.length; i += 4) {
    lines.push(new Line(
      [points[i], points[i + 1]],
      [points[i + 2], points[i + 3]],
    ));
  }
  return lines;
};

describe('Equation Functions - Box', () => {
  let diagram;
  let makeGrid;
  beforeEach(() => {
    diagram = makeDiagram();
    const gridType = {
      baseNum: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 3,
          yNum: 3,
          linePrimitives: true,
          lineNum: 1,
        },
      },
      baseStep: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0.5,
          yStep: 0.5,
          linePrimitives: true,
          lineNum: 1,
        },
      },
      xOnly: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0.5,
          yNum: 0,
          linePrimitives: true,
          lineNum: 1,
        },
      },
      yOnly: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          yStep: 0.5,
          xNum: 0,
          linePrimitives: true,
          lineNum: 1,
        },
      },
      defaultNum: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          linePrimitives: true,
          lineNum: 1,
        },
      },
      oneNum: {
        name: 'grid',
        method: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 1,
          yNum: 1,
          linePrimitives: true,
          lineNum: 1,
        },
      },
    };
    makeGrid = (type) => {
      diagram.addElement(gridType[type]);
      diagram.setFirstTransform();
    };
  });
  test('Base Grid from Num', () => {
    makeGrid('baseNum');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0.5));
    expect(round(lines[1].p2)).toEqual(new Point(1, 0.5));
    expect(round(lines[2].p1)).toEqual(new Point(0, 1));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
    expect(round(lines[3].p1)).toEqual(new Point(0, 0));
    expect(round(lines[3].p2)).toEqual(new Point(0, 1));
    expect(round(lines[4].p1)).toEqual(new Point(0.5, 0));
    expect(round(lines[4].p2)).toEqual(new Point(0.5, 1));
    expect(round(lines[5].p1)).toEqual(new Point(1, 0));
    expect(round(lines[5].p2)).toEqual(new Point(1, 1));
  });
  test('Base Grid from Step', () => {
    makeGrid('baseStep');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0.5));
    expect(round(lines[1].p2)).toEqual(new Point(1, 0.5));
    expect(round(lines[2].p1)).toEqual(new Point(0, 1));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
    expect(round(lines[3].p1)).toEqual(new Point(0, 0));
    expect(round(lines[3].p2)).toEqual(new Point(0, 1));
    expect(round(lines[4].p1)).toEqual(new Point(0.5, 0));
    expect(round(lines[4].p2)).toEqual(new Point(0.5, 1));
    expect(round(lines[5].p1)).toEqual(new Point(1, 0));
    expect(round(lines[5].p2)).toEqual(new Point(1, 1));
  });
  test('X Grid', () => {
    makeGrid('xOnly');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(0, 1));
    expect(round(lines[1].p1)).toEqual(new Point(0.5, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0.5, 1));
    expect(round(lines[2].p1)).toEqual(new Point(1, 0));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
  });
  test('Y Grid', () => {
    makeGrid('yOnly');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0.5));
    expect(round(lines[1].p2)).toEqual(new Point(1, 0.5));
    expect(round(lines[2].p1)).toEqual(new Point(0, 1));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
  });
  test('Default Num', () => {
    makeGrid('defaultNum');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 1));
    expect(round(lines[1].p2)).toEqual(new Point(1, 1));
    expect(round(lines[2].p1)).toEqual(new Point(0, 0));
    expect(round(lines[2].p2)).toEqual(new Point(0, 1));
    expect(round(lines[3].p1)).toEqual(new Point(1, 0));
    expect(round(lines[3].p2)).toEqual(new Point(1, 1));
  });
  test('One Num', () => {
    makeGrid('oneNum');
    const lines = toLines(diagram.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0, 1));
  });
});
