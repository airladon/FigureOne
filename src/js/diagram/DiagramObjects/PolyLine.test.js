// import {
//   DiagramElementPrimative,
//   DiagramElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Diagram from '../Diagram';
import {
  Point, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Diagram Objects PolyLine', () => {
  let diagram;
  let ways;
  let points;

  beforeEach(() => {
    diagram = makeDiagram();
    points = [
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
    ];
    ways = {
      numPointsClose: () => diagram.objects.polyLine({
        points,
        close: true,
      }),
      numPointsOpen: () => diagram.objects.polyLine({
        points,
        close: false,
      }),
      SideLabelsClose: () => diagram.objects.polyLine({
        points,
        close: true,
        sideLabel: {
          text: 'a',
        },
      }),
      SideLabelsOpen: () => diagram.objects.polyLine({
        points,
        close: false,
        sideLabel: {
          text: 'a',
        },
      }),
      SideLabelsFullDefine: () => diagram.objects.polyLine({
        points,
        close: true,
        sideLabel: {
          text: ['a', 'b', 'c'],
        },
      }),
      SideLabelsUnderDefine: () => diagram.objects.polyLine({
        points,
        close: true,
        sideLabel: {
          text: ['a', 'b'],
        },
      }),
      SideLabelsOverDefine: () => diagram.objects.polyLine({
        points,
        close: true,
        sideLabel: {
          text: ['a', 'b', 'c', 'd'],
        },
      }),
      SideLabelsSingleDefine: () => diagram.objects.polyLine({
        points,
        close: true,
        sideLabel: {
          text: 'a',
        },
      }),
    };
  });
  test('Number of points in line close', () => {
    const poly = ways.numPointsClose();
    expect(tools.cleanUIDs(poly._line)).toMatchSnapshot();
    expect(poly._line.drawingObject.points).toHaveLength(points.length * 12);
    expect(Object.keys(poly.elements)).toHaveLength(1);
    // console.log(Object.keys(poly.elements))
  });
  test('Number of points in line open', () => {
    const poly = ways.numPointsOpen();
    expect(poly._line.drawingObject.points).toHaveLength((points.length - 1) * 12);
    expect(Object.keys(poly.elements)).toHaveLength(1);
  });
  describe('Side Labels', () => {
    test('Close', () => {
      const poly = ways.SideLabelsClose();
      expect(Object.keys(poly.elements)).toHaveLength(4);
      expect(Object.keys(poly.elements))
        .toEqual(['line', 'side01', 'side12', 'side20']);
      expect(poly.elements.side01.p1).toEqual(points[0]);
      expect(poly.elements.side01.p2).toEqual(points[1]);
      expect(poly.elements.side12.p1).toEqual(points[1]);
      expect(poly.elements.side12.p2).toEqual(points[2]);
      expect(poly.elements.side20.p1).toEqual(points[2]);
      expect(poly.elements.side20.p2.round()).toEqual(points[0]);
    });
    test('Open', () => {
      const poly = ways.SideLabelsOpen();
      expect(Object.keys(poly.elements)).toHaveLength(3);
      expect(Object.keys(poly.elements))
        .toEqual(['line', 'side01', 'side12']);
      expect(poly.elements.side01.p1).toEqual(points[0]);
      expect(poly.elements.side01.p2).toEqual(points[1]);
      expect(poly.elements.side12.p1).toEqual(points[1]);
      expect(poly.elements.side12.p2).toEqual(points[2]);
    });
    test('Full Define', () => {
      const poly = ways.SideLabelsFullDefine();
      const base01 = poly.elements.side01.label.eqn.collection._base;
      const base12 = poly.elements.side12.label.eqn.collection._base;
      const base20 = poly.elements.side20.label.eqn.collection._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('c');
    });
    test('Under Define', () => {
      const poly = ways.SideLabelsUnderDefine();
      const base01 = poly.elements.side01.label.eqn.collection._base;
      const base12 = poly.elements.side12.label.eqn.collection._base;
      const base20 = poly.elements.side20.label.eqn.collection._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('a');
    });
    test('Over Define', () => {
      const poly = ways.SideLabelsOverDefine();
      const base01 = poly.elements.side01.label.eqn.collection._base;
      const base12 = poly.elements.side12.label.eqn.collection._base;
      const base20 = poly.elements.side20.label.eqn.collection._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('c');
    });
    test('Single Define', () => {
      const poly = ways.SideLabelsSingleDefine();
      const base01 = poly.elements.side01.label.eqn.collection._base;
      const base12 = poly.elements.side12.label.eqn.collection._base;
      const base20 = poly.elements.side20.label.eqn.collection._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('a');
      expect(base20.drawingObject.text[0].text).toBe('a');
    });
  });
});
