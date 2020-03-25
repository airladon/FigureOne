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

function processPoints(points) {
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
  let copyChain;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (copyOption, copyChainOption) => {
      diagram.addElement({
        name: 'a',
        method: 'shapes.generic',
        options: {
          points: [[0, 0], [0.1, 0.1]],
          copy: copyOption,
          copyChain: copyChainOption,
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
      xAxis: { num: 1, axis: 'x', step: 1 },
      yAxis: { num: 1, axis: 'y', step: 1 },
      angle: { num: 1, angle: Math.PI, step: 1 },
      xAxis2: { num: 2, axis: 'x', step: 1 },
      polar: { numAngle: 1, step: Math.PI / 2, center: [0, -1] },
    };
    copyChain = {
      pointPoint: [[1, 0], [0, 1]],
      offsetPolar: [
        { offset: [0, 1] },
        { numAngle: 1, step: Math.PI / 2 },
      ],
      radialLine: [
        { num: 2, angle: Math.PI / 2, step: 1 },
        { numAngle: 2, step: Math.PI / 2, skip: 1 / 3 },
      ],
    };
  });
  describe('Single Copy', () => {
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
    test('x Axis', () => {
      addElement(copy.xAxis);
      expect(points[0]).toEqual(new Point(0, 0));
      expect(points[1]).toEqual(new Point(0.1, 0.1));
      expect(points[2]).toEqual(new Point(1, 0));
      expect(points[3]).toEqual(new Point(1.1, 0.1));
    });
    test('y Axis', () => {
      addElement(copy.yAxis);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0.1, 0.1));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(0.1, 1.1));
    });
    test('angle', () => {
      addElement(copy.angle);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0.1, 0.1));
      expect(round(points[2])).toEqual(new Point(-1, 0));
      expect(round(points[3])).toEqual(new Point(-0.9, 0.1));
    });
    test('x Axis 2', () => {
      addElement(copy.xAxis2);
      expect(points[0]).toEqual(new Point(0, 0));
      expect(points[1]).toEqual(new Point(0.1, 0.1));
      expect(points[2]).toEqual(new Point(1, 0));
      expect(points[3]).toEqual(new Point(1.1, 0.1));
      expect(points[4]).toEqual(new Point(2, 0));
      expect(points[5]).toEqual(new Point(2.1, 0.1));
      expect(true).toBe(true);
    });
    test('polar', () => {
      addElement(copy.polar);
      expect(points[0]).toEqual(new Point(0, 0));
      expect(points[1]).toEqual(new Point(0.1, 0.1));
      expect(round(points[2])).toEqual(new Point(-1, -1));
    });
  });
  describe('Copy Chain', () => {
    test('Point then Point', () => {
      addElement(null, copyChain.pointPoint);
      expect(points[0]).toEqual(new Point(0, 0));
      expect(points[1]).toEqual(new Point(0.1, 0.1));
      expect(points[2]).toEqual(new Point(1, 0));
      expect(points[3]).toEqual(new Point(1.1, 0.1));
      expect(points[4]).toEqual(new Point(0, 1));
      expect(points[5]).toEqual(new Point(0.1, 1.1));
      expect(points[6]).toEqual(new Point(1, 1));
      expect(points[7]).toEqual(new Point(1.1, 1.1));
    });
    test('Offset then Polar', () => {
      addElement(null, copyChain.offsetPolar);
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(0.1, 1.1));
      expect(round(points[2])).toEqual(new Point(-1, 0));
      expect(round(points[3])).toEqual(new Point(-1.1, 0.1));
    });
    test('Radial Line', () => {
      addElement(null, copyChain.radialLine);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0.1, 0.1));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(0.1, 1.1));
      expect(round(points[4])).toEqual(new Point(0, 2));
      expect(round(points[5])).toEqual(new Point(0.1, 2.1));
      expect(round(points[6])).toEqual(new Point(-1, 0));
      expect(round(points[7])).toEqual(new Point(-1.1, 0.1));
      expect(round(points[8])).toEqual(new Point(-2, 0));
      expect(round(points[9])).toEqual(new Point(-2.1, 0.1));
      expect(round(points[10])).toEqual(new Point(0, -1));
      expect(round(points[11])).toEqual(new Point(-0.1, -1.1));
      expect(round(points[12])).toEqual(new Point(0, -2));
      expect(round(points[13])).toEqual(new Point(-0.1, -2.1));
      expect(points).toHaveLength(14);
    });
  });
});

