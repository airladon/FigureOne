// import {
//   DiagramElementPrimitive,
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
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Diagram', () => {
  let diagram;

  beforeEach(() => {
    diagram = makeDiagram();
    // document.body.innerHTML =
    //   '<div id="c">'
    //   + '  <canvas class="figureone__gl" id="id_figureone__gl__low">'
    //   + '  </canvas>'
    //   + '  <canvas class="figureone__text" id="id_figureone__text__low">'
    //   + '  </canvas>'
    //   + '  <div class="figureone__html">'
    //   + '  </div>'
    //   + '  <canvas class="figureone__gl" id="id_figureone__gl__high">'
    //   + '  </canvas>'
    //   + '  <canvas class="figureone__text" id="id_figureone__text__high">'
    //   + '  </canvas>'
    //   + '</div>';
    // // canvas = document.getElementById('c');
    // const definition = {
    //   width: 1000,
    //   height: 500,
    //   limits: new Rect(-1, -1, 2, 2),
    // };

    // const canvasMock = {
    //   width: definition.width,
    //   height: definition.height,
    //   // offsetLeft: 100,
    //   left: 100,
    //   // offsetTop: 200,
    //   top: 200,
    //   // width: definition.width,
    //   // height: definition.height,
    //   offsetWidth: definition.width,
    //   offsetHeight: definition.height,
    //   scrollLeft: 0,
    //   scrollTop: 0,
    //   // eslint-disable-next-line arrow-body-style
    //   getBoundingClientRect: () => {
    //     return {
    //       left: 100,
    //       top: 200,
    //       width: definition.width,
    //       height: definition.height,
    //     };
    //   },
    // };
    // const htmlCanvasMock = {
    //   style: {
    //     fontsize: 1,
    //   },
    //   offsetWidth: 100,
    // };
    // const { limits } = definition;
    // diagram = new Diagram('c', limits);
    // diagram.webglLow = webgl;
    // diagram.webglHigh = webgl;
    // diagram.webgl = webgl;
    // diagram.canvasLow = canvasMock;
    // diagram.canvasHigh = canvasMock;
    // diagram.htmlCanvas = htmlCanvasMock;
    // diagram.isTouchDevice = false;
    // diagram.draw2DLow = new DrawContext2D(definition.width, definition.height);
    // diagram.draw2DHigh = new DrawContext2D(definition.width, definition.height);
    // diagram.draw2D = diagram.draw2DLow;
    // diagram.shapesLow = diagram.getShapes(false);
    // diagram.shapesHigh = diagram.getShapes(true);
    // diagram.shapes = diagram.shapesLow;
    // diagram.equationLow = diagram.getEquations(false);
    // diagram.equationHigh = diagram.getEquations(true);
    // diagram.equation = diagram.equationLow;
    // diagram.objectsLow = diagram.getObjects(false);
    // diagram.objectsHigh = diagram.getObjects(true);
    // diagram.objects = diagram.objectsLow;
    // diagram.setSpaceTransforms();
  });
  test('Diagram instantiation', () => {
    expect(diagram.limits).toEqual(new Rect(-1, -1, 2, 2));
  });
  describe('Vertex Origin', () => {
    let position;
    let length;
    let angle;
    let width;
    let makeLine;
    beforeEach(() => {
      position = new Point(1, 1);
      length = 2;
      angle = 5;
      width = 0.2;
      makeLine = vertexOrigin => diagram.objects.line({
        position,
        length,
        angle,
        width,
        color: [1, 0, 0, 1],
        vertexSpaceStart: vertexOrigin,
        showLine: true,
        largerTouchBorder: true,
      });
    });
    test('End', () => {
      const line = makeLine('end');
      expect(line._line.drawingObject.points).toEqual([
        -1, -0.1,
        -1, 0.1,
        0, -0.1,
        0, 0.1,
      ]);
    });
    test('start', () => {
      const line = makeLine('start');
      expect(line._line.drawingObject.points).toEqual([
        0, -0.1,
        0, 0.1,
        1, -0.1,
        1, 0.1,
      ]);
    });
    test('center', () => {
      const line = makeLine('center');
      expect(line._line.drawingObject.points).toEqual([
        -0.5, -0.1,
        -0.5, 0.1,
        0.5, -0.1,
        0.5, 0.1,
      ]);
    });
    test('40%', () => {
      const line = makeLine(0.4);
      expect(line._line.drawingObject.points).toEqual([
        -0.4, -0.1,
        -0.4, 0.1,
        0.6, -0.1,
        0.6, 0.1,
      ]);
    });
    test('Point', () => {
      const line = makeLine(new Point(-1, 2));
      expect(line._line.drawingObject.points).toEqual([
        -1, 1.9,
        -1, 2.1,
        0, 1.9,
        0, 2.1,
      ]);
    });
  });
  describe('Position, angle and length', () => {
    let makeLine;
    beforeEach(() => {
      // const length = 2;
      // const angle = 0;
      const width = 0.2;
      const vertexOrigin = 'start';
      makeLine = (position, angle, length) => diagram.objects.line({
        position,
        length,
        angle,
        width,
        color: [1, 0, 0, 1],
        vertexSpaceStart: vertexOrigin,
        showLine: true,
        largerTouchBorder: true,
      });
    });
    test('(0, 0)', () => {
      const line = makeLine(new Point(0, 0), 0, 2);
      expect(line._line.drawingObject.points).toEqual([
        0, -0.1,
        0, 0.1,
        1, -0.1,
        1, 0.1,
      ]);
      expect(line.transform.t().isEqualTo(new Point(0, 0))).toBe(true);
      expect(line.transform.r()).toBe(0);
      expect(line.length === 2).toBe(true);
    });
    test('(1, 1)', () => {
      const line = makeLine(new Point(1, 1), 1, 1);
      expect(line.transform.t().isEqualTo(new Point(1, 1))).toBe(true);
      expect(line.transform.r()).toBe(1);
      expect(line.length === 1).toBe(true);
    });
  });
  describe('Set End Points', () => {
    let line;
    let setEndPoints;
    beforeEach(() => {
      const position = new Point(0, 0);
      const length = 2;
      const angle = 0;
      const width = 0.2;
      // const vertexOrigin = 'start';
      setEndPoints = (px, py, qx, qy, vertexOrigin, offset = 0) => {
        line = diagram.objects.line({
          position,
          length,
          angle,
          width,
          color: [1, 0, 0, 1],
          vertexSpaceStart: vertexOrigin,
          showLine: true,
          largerTouchBorder: true,
        });
        line.setEndPoints(new Point(px, py), new Point(qx, qy), offset);
      };
    });
    test('0,0 -> 0,2', () => {
      setEndPoints(0, 0, 2, 0, 'start');
      expect(line._line.drawingObject.points).toEqual([
        0, -0.1,
        0, 0.1,
        1, -0.1,
        1, 0.1,
      ]);
      expect(line._line.transform.t().isEqualTo(new Point(0, 0))).toBe(true);
      expect(line._line.transform.s().isEqualTo(new Point(2, 1))).toBe(true);
      expect(line.transform.r()).toBe(0);
      expect(line.transform.t().isEqualTo(new Point(0, 0))).toBe(true);
      expect(line.p1.isEqualTo(new Point(0, 0))).toBe(true);
      expect(line.p2.isEqualTo(new Point(2, 0))).toBe(true);
      expect(line.length === 2).toBe(true);
      expect(round(line.angle, 6)).toBe(0);
      expect(line.width).toBe(0.2);
      expect(line.position.isEqualTo(new Point(0, 0))).toBe(true);
      // expect(line.vertexOrigin).toBe('start');
    });
    test('-1.5,-1.5 -> -1,-1', () => {
      setEndPoints(-1.5, -1.5, -1, -1, 'start');
      expect(line._line.drawingObject.points).toEqual([
        0, -0.1,
        0, 0.1,
        1, -0.1,
        1, 0.1,
      ]);
      expect(line._line.transform.t().isEqualTo(new Point(0, 0))).toBe(true);
      expect(line._line.transform.s()
        .isEqualTo(new Point(Math.sqrt(0.5), 1), 6)).toBe(true);
      expect(round(line.transform.r(), 6)).toBe(round(Math.PI / 4, 6));
      expect(line.transform.t().isEqualTo(new Point(-1.5, -1.5))).toBe(true);
      expect(line.p1.isEqualTo(new Point(-1.5, -1.5))).toBe(true);
      expect(line.p2.isEqualTo(new Point(-1, -1), 6)).toBe(true);
      expect(round(line.length, 6)).toBe(round(Math.sqrt(0.5), 6));
      expect(round(line.angle, 6)).toBe(round(Math.PI / 4, 6));
      expect(line.width).toBe(0.2);
      expect(line.position.isEqualTo(new Point(-1.5, -1.5))).toBe(true);
      // expect(line.vertexOrigin).toBe('start');
    });
    test('1,1 -> 3,3 with vertexOrigin = center', () => {
      setEndPoints(1, 1, 3, 3, 'center');
      expect(line._line.drawingObject.points).toEqual([
        -0.5, -0.1,
        -0.5, 0.1,
        0.5, -0.1,
        0.5, 0.1,
      ]);
      expect(line._line.transform.t().isEqualTo(new Point(0, 0))).toBe(true);
      expect(line._line.transform.s()
        .isEqualTo(new Point(Math.sqrt(2) * 2, 1), 6)).toBe(true);
      expect(round(line.transform.r(), 6)).toBe(round(Math.PI / 4, 6));
      expect(line.transform.t().isEqualTo(new Point(2, 2))).toBe(true);
      expect(line.p1.isEqualTo(new Point(1, 1), 6)).toBe(true);
      expect(line.p2.isEqualTo(new Point(3, 3), 6)).toBe(true);
      expect(round(line.length, 6)).toBe(round(Math.sqrt(2) * 2, 6));
      expect(round(line.angle, 6)).toBe(round(Math.PI / 4, 6));
      expect(line.position.isEqualTo(new Point(2, 2))).toBe(true);
      // expect(line.vertexOrigin).toBe('center');
    });
  });
  describe('Arrows', () => {
    let line;
    let setEndPoints;
    beforeEach(() => {
      const position = new Point(0, 0);
      const length = 1;
      const angle = 0;
      const width = 0.2;
      // const vertexOrigin = 'start';
      setEndPoints = (px, py, qx, qy, vertexOrigin, offset = 0) => {
        line = diagram.objects.line({
          position,
          length,
          angle,
          width,
          color: [1, 0, 0, 1],
          vertexSpaceStart: vertexOrigin,
          showLine: true,
          largerTouchBorder: true,
        });
        line.setEndPoints(new Point(px, py), new Point(qx, qy), offset);
      };
    });
    test('0,0 -> 1,0 start', () => {
      setEndPoints(0, 0, 1, 0, 'start');
      line.addArrows(0.2, 0.2);
      expect(line._line.transform.t().isEqualTo(new Point(0.2, 0), 6)).toBe(true);
      expect(line._line.transform.s().isEqualTo(new Point(0.6, 1), 6)).toBe(true);
    });
    test('0,0 -> 1,0 center', () => {
      setEndPoints(0, 0, 1, 0, 'center');
      line.addArrows(0.2, 0.2);
      expect(line._line.transform.t().isEqualTo(new Point(0, 0), 6)).toBe(true);
      expect(line._line.transform.s().isEqualTo(new Point(0.6, 1), 6)).toBe(true);
    });
    test('0,0 -> 1,0 40%', () => {
      setEndPoints(0, 0, 2, 0, 0.4);
      line.addArrows(0.2, 0.2);
      expect(line._line.transform.t().isEqualTo(new Point(0.04, 0), 6)).toBe(true);
      expect(line._line.transform.s().isEqualTo(new Point(1.6, 1), 6)).toBe(true);
    });
  });
});
