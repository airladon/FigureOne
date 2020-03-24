// import {
//   Point,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { Point, Transform } from '../../tools/g2';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

function processPoints(points: Array<number>) {
  const out = [];
  for (let i = 0; i < points.length; i += 2) {
    out.push(new Point(points[i], points[i + 1]));
  }
  return out;
}

describe('Diagram Primitive Generic Copy', () => {
  let diagram;
  let copy;
  let points;
  let addElement;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (copyOption) => {
      diagram.addElement({
        name: 'a',
        method: 'shapes.generic',
        options: {
          points: [[0, 0], [0.1, 0.1]],
          copy: copyOption,
        },
      });
      diagram.initialize();
      points = processPoints(diagram.getElement('a').drawingObject.points);
    };

    copy = {
      point: new Point(1, 0),
      arrayPoint: [1, 0],
      numberPoint: 1,
      transform: new Transform().translate(1, 0),
      transformArray: [
        new Transform().translate(1, 0), new Transform().translate(2, 0),
      ],
      pointArray: [new Point(1, 0), new Point(2, 0)],
      pointPointArray: [[1, 0], [2, 0]],
      moveOffset: { offset: [1, 0] },
      moveTransform: { offset: new Transform().translate(1, 0) },
      xAxis: { num: 1, axis: 'x', step: 2 },
    };
  });
  test('Point', () => {
    addElement(copy.point);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
  });
  test('Array Point', () => {
    addElement(copy.arrayPoint);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
  });
  test('Number Point', () => {
    addElement(copy.numberPoint);
    expect(points[2]).toEqual(new Point(1, 1));
    expect(points[3]).toEqual(new Point(1.1, 1.1));
  });
  test('Transform', () => {
    addElement(copy.transform);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
  });
  test('Transform Array', () => {
    addElement(copy.transformArray);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
    expect(points[4]).toEqual(new Point(2, 0));
    expect(points[5]).toEqual(new Point(2.1, 0.1));
  });
  test('Point Array', () => {
    addElement(copy.pointArray);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
    expect(points[4]).toEqual(new Point(2, 0));
    expect(points[5]).toEqual(new Point(2.1, 0.1));
  });
  test('Array Point Array', () => {
    addElement(copy.pointPointArray);
    expect(points[2]).toEqual(new Point(1, 0));
    expect(points[3]).toEqual(new Point(1.1, 0.1));
    expect(points[4]).toEqual(new Point(2, 0));
    expect(points[5]).toEqual(new Point(2.1, 0.1));
  });
  test('Move Offset', () => {
    addElement(copy.moveOffset);
    expect(points[0]).toEqual(new Point(1, 0));
    expect(points[1]).toEqual(new Point(1.1, 0.1));
    expect(points).toHaveLength(2);
  });
  test('Move Transform', () => {
    addElement(copy.moveTransform);
    expect(points[0]).toEqual(new Point(1, 0));
    expect(points[1]).toEqual(new Point(1.1, 0.1));
    expect(points).toHaveLength(2);
  });
});
