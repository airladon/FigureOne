// import {
//   DiagramElementPrimitive,
//   DiagramElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Diagram from '../Diagram';
import {
  Point, rectToPolar,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import makeDiagram from '../../__mocks__/makeDiagram';

// tools.isTouchDevice = jest.fn();
jest.useFakeTimers();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');
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
      numPointsClose: () => diagram.objects.polyline({
        points,
        close: true,
      }),
      numPointsOpen: () => diagram.objects.polyline({
        points,
        close: false,
      }),
      SideLabelsClose: () => diagram.objects.polyline({
        points,
        close: true,
        side: {
          label: {
            text: 'a',
          },
        },
      }),
      SideLabelsOpen: () => diagram.objects.polyline({
        points,
        close: false,
        side: {
          label: {
            text: 'a',
          },
        },
      }),
      SideLabelsFullDefine: () => diagram.objects.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: null } },
        ],
      }),
      SideLabelsUnderDefine: () => diagram.objects.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
        ],
      }),
      SideLabelsOverDefine: () => diagram.objects.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: 'c' } },
          { label: { text: 'd' } },
        ],
      }),
      SideLabelsSingleDefine: () => diagram.objects.polyline({
        points,
        close: true,
        side: { label: { text: 'a' } },
      }),
      SideLabelsActualLength: () => diagram.objects.polyline({
        points,
        close: true,
        side: { label: { text: null } },
      }),
      AngleLabelsClose: () => diagram.objects.polyline({
        points,
        close: true,
        angle: {
          label: {
            text: 'a',
          },
        },
      }),
      AngleLabelsOpen: () => diagram.objects.polyline({
        points,
        close: false,
        angle: {
          label: {
            text: 'a',
          },
        },
      }),
      AngleLabelsFullDefine: () => diagram.objects.polyline({
        points,
        close: true,
        angle: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: null } },
        ],
      }),
      PadSimple: () => diagram.objects.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
        },
      }),
      PadBoundary: () => diagram.objects.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
          boundary: [-3, -2, 3, 2],
          isMovable: true,
        },
      }),
      PadBoundaryWithoutTouchRadius: () => diagram.objects.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
          boundary: [-3, -2, 3, 2],
          isMovable: true,
          touchRadius: 0.4,
        },
      }),
      PadBoundaryWithTouchRadius: () => diagram.objects.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
          boundary: [-3, -2, 3, 2],
          isMovable: true,
          touchRadius: 0.4,
          touchRadiusInBoundary: true,
        },
      }),
      Misc: () => diagram.objects.polyline({
        points,
        close: true,
        color: [1, 0, 0, 1],
        side: {
          color: [1, 0, 0, 1],
          offset: 0.25,
          showLine: true,
          arrows: true,
          width: 0.015,
          label: {
            text: null,
            location: 'outside',
            scale: 0.5,
            color: [0, 1, 0, 1],
          },
          mods: {
            isMovable: true,
            isTouchable: true,
          },
        },
        angle: {
          label: {
            text: null,
            radius: 0.25,
            textScale: 0.5,
            color: [1, 0, 1, 1],
          },
          curve: {
            radius: 0.3,
            sides: 50,
          },
          mods: {
            isMovable: true,
            isTouchable: true,
          },
        },
        pad: {
          color: [1, 0.5, 0.5, 1],
          radius: 0.2,
          isMovable: true,
          touchRadius: 0.4,
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
  test('Misc options', () => {
    const poly = ways.Misc();
    expect(tools.cleanUIDs(poly)).toMatchSnapshot();
  });
  describe('Pads', () => {
    test('Simple', () => {
      const poly = ways.PadSimple();
      expect(poly).toHaveProperty('_pad0');
    });
    test('Boundary', () => {
      const poly = ways.PadBoundary();
      expect(poly).toHaveProperty('_pad0');
      const { boundary } = poly._pad0.move.bounds.getTranslation();
      expect(round(boundary.left, 3)).toBe(-2.8);
      expect(round(boundary.right, 3)).toBe(2.8);
      expect(round(boundary.bottom, 3)).toBe(-1.8);
      expect(round(boundary.top, 3)).toBe(1.8);
    });
    test('Boundary not including touch radius', () => {
      const poly = ways.PadBoundaryWithoutTouchRadius();
      expect(poly).toHaveProperty('_pad0');
      const { boundary } = poly._pad0.move.bounds.getTranslation();
      expect(round(boundary.left, 3)).toBe(-2.8);
      expect(round(boundary.right, 3)).toBe(2.8);
      expect(round(boundary.bottom, 3)).toBe(-1.8);
      expect(round(boundary.top, 3)).toBe(1.8);
      // expect(poly._pad0.move.maxTransform.t().round()).toEqual(new Point(2.8, 1.8));
      // expect(poly._pad0.move.minTransform.t().round()).toEqual(new Point(-2.8, -1.8));
    });
    test('Boundary including touch radius', () => {
      const poly = ways.PadBoundaryWithTouchRadius();
      expect(poly).toHaveProperty('_pad0');
      const { boundary } = poly._pad0.move.bounds.getTranslation();
      expect(round(boundary.left, 3)).toBe(-2.6);
      expect(round(boundary.right, 3)).toBe(2.6);
      expect(round(boundary.bottom, 3)).toBe(-1.6);
      expect(round(boundary.top, 3)).toBe(1.6);
      // expect(poly._pad0.move.maxTransform.t().round()).toEqual(new Point(2.6, 1.6));
      // expect(poly._pad0.move.minTransform.t().round()).toEqual(new Point(-2.6, -1.6));
    });
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
      const base01 = poly.elements.side01.label.eqn._base;
      const base12 = poly.elements.side12.label.eqn._base;
      const base20 = poly.elements.side20.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('1.4');
    });
    test('Under Define', () => {
      const poly = ways.SideLabelsUnderDefine();
      const base01 = poly.elements.side01.label.eqn._base;
      const base12 = poly.elements.side12.label.eqn._base;
      const base20 = poly.elements.side20.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('a');
    });
    test('Over Define', () => {
      const poly = ways.SideLabelsOverDefine();
      const base01 = poly.elements.side01.label.eqn._base;
      const base12 = poly.elements.side12.label.eqn._base;
      const base20 = poly.elements.side20.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('c');
    });
    test('Single Define', () => {
      const poly = ways.SideLabelsSingleDefine();
      const base01 = poly.elements.side01.label.eqn._base;
      const base12 = poly.elements.side12.label.eqn._base;
      const base20 = poly.elements.side20.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('a');
      expect(base20.drawingObject.text[0].text).toBe('a');
    });
    test('Actual Length', () => {
      const poly = ways.SideLabelsActualLength();
      const base01 = poly.elements.side01.label.eqn._base;
      const base12 = poly.elements.side12.label.eqn._base;
      const base20 = poly.elements.side20.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('1.0');
      expect(base12.drawingObject.text[0].text).toBe('1.0');
      expect(base20.drawingObject.text[0].text).toBe('1.4');
    });
  });
  describe('Angle Labels', () => {
    test('Close', () => {
      const poly = ways.AngleLabelsClose();
      expect(Object.keys(poly.elements)).toHaveLength(4);
      expect(Object.keys(poly.elements))
        .toEqual(['angle0', 'angle1', 'angle2', 'line']);
      // expect(poly.elements.angle0.p1).toEqual(points[1]);
      // expect(poly.elements.angle0.p2).toEqual(points[0]);
      // expect(poly.elements.angle0.p3).toEqual(points[2]);
      // expect(poly.elements.side01.p2).toEqual(points[1]);
      // expect(poly.elements.side12.p1).toEqual(points[1]);
      // expect(poly.elements.side12.p2).toEqual(points[2]);
      // expect(poly.elements.side20.p1).toEqual(points[2]);
      // expect(poly.elements.side20.p2.round()).toEqual(points[0]);
    });
    test('Open', () => {
      const poly = ways.AngleLabelsOpen();
      expect(Object.keys(poly.elements)).toHaveLength(2);
      expect(Object.keys(poly.elements))
        .toEqual(['angle1', 'line']);
      // expect(poly.elements.side01.p1).toEqual(points[0]);
      // expect(poly.elements.side01.p2).toEqual(points[1]);
      // expect(poly.elements.side12.p1).toEqual(points[1]);
      // expect(poly.elements.side12.p2).toEqual(points[2]);
    });
    test('Full Define', () => {
      const poly = ways.AngleLabelsFullDefine();
      const base01 = poly.elements.angle0.label.eqn._base;
      const base12 = poly.elements.angle1.label.eqn._base;
      const base20 = poly.elements.angle2.label.eqn._base;
      expect(base01.drawingObject.text[0].text).toBe('a');
      expect(base12.drawingObject.text[0].text).toBe('b');
      expect(base20.drawingObject.text[0].text).toBe('315º');
    });
  });
  describe('Diagram Level', () => {
    test('Pad change shape', () => {
      diagram.addElement({
        method: 'polyline',
        name: 'a',
        options: {
          points,
          close: true,
          pad: {
            radius: 0.2,
            boundary: [-3, -2, 3, 2],
            isMovable: true,
          },
        },
      });
      diagram.initialize();
      const a = diagram.elements._a;
      expect(a.points[0]).toEqual(new Point(0, 0));
      expect(a.points[1]).toEqual(new Point(1, 0));
      expect(a.points[2]).toEqual(new Point(1, 1));
      const p0 = a._pad0;
      p0.setPosition(0, 0.5);
      expect(a.points[0]).toEqual(new Point(0, 0.5));
      expect(a.points[1]).toEqual(new Point(1, 0));
      expect(a.points[2]).toEqual(new Point(1, 1));
    });
    test('Pad Move freely along line shape', () => {
      diagram.addElement({
        method: 'polyline',
        name: 'a',
        options: {
          points: [
            [0, 0],
            [10, 0],
            [10, 10],
          ],
          close: true,
          pad: {
            radius: 0.2,
            boundary: [-3, -2, 3, 2],
            isMovable: true,
            // move: {
            //   bounds: {
            //     translation: { line: [[0, 0], [9, 9]] },
            //   },
            // },
          },
        },
      });
      diagram.initialize();
      const a = diagram.elements._a;
      // a.move.freely.bounceLoss = 0;
      // a.move.freely.deceleration = 1;
      expect(a.points[0]).toEqual(new Point(0, 0));
      expect(a.points[1]).toEqual(new Point(10, 0));
      expect(a.points[2]).toEqual(new Point(10, 10));
      const p0 = a._pad0;
      p0.move.bounds.updateTranslation({ line: [[0, 0], [9, 9]] });
      p0.makeTouchable();
      p0.move.freely.bounceLoss = 0;
      p0.move.freely.deceleration = 1;
      diagram.mock.timeStep(0);
      diagram.mock.touchDown([0, 0]);
      diagram.mock.timeStep(0.1);
      diagram.mock.touchMove([0.5 * Math.sqrt(2), 0]);
      diagram.mock.touchUp();

      // Moving at 5 units/s
      // Total time = 5s
      // Distance: s = v0t - 0.5*1*t^2 = 25 - 12.5 = 12.5;
      const x = 0.5 / Math.sqrt(2);
      expect(round(rectToPolar(p0.state.movement.velocity.t()).mag, 3)).toBe(5);
      expect(p0.getPosition().round(3).x).toEqual(round(x, 3));
      expect(round(p0.getRemainingMovingFreelyTime(), 2)).toBe(5);
      expect(p0.state.isMovingFreely).toBe(true);
      expect(a.points[0].round(3)).toEqual(new Point(x, x).round(3));
      expect(a.points[1]).toEqual(new Point(10, 0));
      expect(a.points[2]).toEqual(new Point(10, 10));

      // After 1s:
      //  v1 = v0 - at = 5 - 1 = 4
      //  s  = 5 - 0.5 = 4.5
      diagram.mock.timeStep(1);
      expect(round(rectToPolar(p0.state.movement.velocity.t()).mag, 3)).toBe(4);
      expect(p0.getPosition().round(3).x).toEqual(round(x + 4.5 / Math.sqrt(2), 3));
      expect(round(p0.getRemainingMovingFreelyTime(), 2)).toBe(4);
      expect(p0.state.isMovingFreely).toBe(true);
      expect(a.points[0].round(3)).toEqual(new Point(
        x + 4.5 / Math.sqrt(2),
        x + 4.5 / Math.sqrt(2),
      ).round(3));
      expect(a.points[1]).toEqual(new Point(10, 0));
      expect(a.points[2]).toEqual(new Point(10, 10));

      // After 2s:
      //  v2 = v1 - at = 4 - 1 = 3
      //  s  = 4 - 0.5 = 3.5 (+4.5)
      diagram.mock.timeStep(1);
      expect(round(rectToPolar(p0.state.movement.velocity.t()).mag, 3)).toBe(3);
      expect(p0.getPosition().round(3).x).toEqual(round(x + (4.5 + 3.5) / Math.sqrt(2), 3));
      expect(round(p0.getRemainingMovingFreelyTime(), 2)).toBe(3);
      expect(p0.state.isMovingFreely).toBe(true);
      expect(a.points[0].round(3)).toEqual(new Point(
        x + 8 / Math.sqrt(2),
        x + 8 / Math.sqrt(2),
      ).round(3));
      expect(a.points[1]).toEqual(new Point(10, 0));
      expect(a.points[2]).toEqual(new Point(10, 10));
    });
  });
});
