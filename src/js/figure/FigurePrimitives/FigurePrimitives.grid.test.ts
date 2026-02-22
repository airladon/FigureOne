import {
  Point, Rect, Line,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

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

const toPoints = (points) => {
  const p = [];
  for (let i = 0; i < points.length; i += 12) {
    p.push(new Point(points[0], points[1]));
    p.push(new Point(points[2], points[3]));
    p.push(new Point(points[4], points[5]));
    p.push(new Point(points[6], points[7]));
    p.push(new Point(points[8], points[9]));
    p.push(new Point(points[10], points[11]));
  }
  return p;
};

describe('Figure Primitives - Grid', () => {
  let figure;
  let makeGrid;
  beforeEach(() => {
    figure = makeFigure();
    const gridType = {
      baseNum: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 3,
          yNum: 3,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      baseStep: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0.5,
          yStep: 0.5,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      xOnly: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0.5,
          yNum: 0,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      yOnly: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          yStep: 0.5,
          xNum: 0,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      stepZero: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0,
          yStep: 0,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      stepLargerThanBounds: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 2,
          yStep: 2,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      numOverrideStep: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xStep: 0.1,
          yStep: 0.1,
          xNum: 1,
          yNum: 1,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      defaultNum: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      oneNum: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 1,
          yNum: 1,
          line: {
            linePrimitives: true,
            lineNum: 1,
          },
        },
      },
      multiLine: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 1,
          yNum: 1,
          line: {
            width: 0.1,
            linePrimitives: true,
            lineNum: 2,
          },
        },
      },
      triangles: {
        name: 'grid',
        make: 'grid',
        options: {
          bounds: new Rect(0, 0, 1, 1),
          xNum: 1,
          yNum: 1,
          line: {
            linePrimitives: true,
            width: 0.1,
            lineNum: 2,
          },
        },
      },
    };
    makeGrid = (type) => {
      figure.add(gridType[type]);
      figure.setFirstTransform();
    };
  });
  test('Base Grid from Num', () => {
    makeGrid('baseNum');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
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
    const lines = toLines(figure.getElement('grid').drawingObject.points);
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
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(0, 1));
    expect(round(lines[1].p1)).toEqual(new Point(0.5, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0.5, 1));
    expect(round(lines[2].p1)).toEqual(new Point(1, 0));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
  });
  test('Y Grid', () => {
    makeGrid('yOnly');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0.5));
    expect(round(lines[1].p2)).toEqual(new Point(1, 0.5));
    expect(round(lines[2].p1)).toEqual(new Point(0, 1));
    expect(round(lines[2].p2)).toEqual(new Point(1, 1));
  });
  test('Default Num', () => {
    makeGrid('defaultNum');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
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
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0, 1));
  });
  test('StepZero', () => {
    makeGrid('stepZero');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0, 1));
  });
  test('Step Larger than Bounds', () => {
    makeGrid('stepLargerThanBounds');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0, 1));
  });
  test('Num Override Step', () => {
    makeGrid('numOverrideStep');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(0, 0));
    expect(round(lines[0].p2)).toEqual(new Point(1, 0));
    expect(round(lines[1].p1)).toEqual(new Point(0, 0));
    expect(round(lines[1].p2)).toEqual(new Point(0, 1));
  });
  test('Multi Line', () => {
    makeGrid('multiLine');
    const lines = toLines(figure.getElement('grid').drawingObject.points);
    expect(round(lines[0].p1)).toEqual(new Point(-0.05, -0.05));
    expect(round(lines[0].p2)).toEqual(new Point(1.05, -0.05));
    expect(round(lines[1].p1)).toEqual(new Point(-0.05, 0.05));
    expect(round(lines[1].p2)).toEqual(new Point(1.05, 0.05));
    expect(round(lines[2].p1)).toEqual(new Point(0.05, -0.05));
    expect(round(lines[2].p2)).toEqual(new Point(0.05, 1.05));
    expect(round(lines[3].p1)).toEqual(new Point(-0.05, -0.05));
    expect(round(lines[3].p2)).toEqual(new Point(-0.05, 1.05));
  });
  test('Triangles', () => {
    makeGrid('triangles');
    const points = toPoints(figure.getElement('grid').drawingObject.points);
    expect(round(points[0])).toEqual(new Point(-0.05, -0.05));
    expect(round(points[1])).toEqual(new Point(1.05, -0.05));
    expect(round(points[2])).toEqual(new Point(-0.05, 0.05));
    expect(round(points[3])).toEqual(new Point(1.05, 0.05));
    expect(round(points[4])).toEqual(new Point(0.05, -0.05));
    expect(round(points[5])).toEqual(new Point(0.05, 1.05));
    expect(round(points[6])).toEqual(new Point(-0.05, -0.05));
    expect(round(points[7])).toEqual(new Point(1.05, -0.05));
    expect(round(points[8])).toEqual(new Point(-0.05, 0.05));
    expect(round(points[9])).toEqual(new Point(1.05, 0.05));
    expect(round(points[10])).toEqual(new Point(0.05, -0.05));
    expect(round(points[11])).toEqual(new Point(0.05, 1.05));
  });
});
