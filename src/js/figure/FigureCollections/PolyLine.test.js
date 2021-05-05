// import {
//   FigureElementPrimitive,
//   FigureElementCollection,
//   // AnimationPhase,
// } from '../Element';
// import Figure from '../Figure';
import {
  Point, rectToPolar,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
// import webgl from '../../__mocks__/WebGLInstanceMock';
// import DrawContext2D from '../../__mocks__/DrawContext2DMock';
import makeFigure from '../../__mocks__/makeFigure';

// tools.isTouchDevice = jest.fn();
jest.useFakeTimers();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Figure Objects PolyLine', () => {
  let figure;
  let ways;
  let points;

  beforeEach(() => {
    figure = makeFigure();
    points = [
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
    ];
    ways = {
      numPointsClose: () => figure.collections.polyline({
        points,
        close: true,
      }),
      numPointsOpen: () => figure.collections.polyline({
        points,
        close: false,
      }),
      SideLabelsClose: () => figure.collections.polyline({
        points,
        close: true,
        side: {
          label: {
            text: 'a',
          },
        },
      }),
      SideLabelsOpen: () => figure.collections.polyline({
        points,
        close: false,
        side: {
          label: {
            text: 'a',
          },
        },
      }),
      SideLabelsFullDefine: () => figure.collections.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: null } },
        ],
      }),
      SideLabelsUnderDefine: () => figure.collections.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
        ],
      }),
      SideLabelsOverDefine: () => figure.collections.polyline({
        points,
        close: true,
        side: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: 'c' } },
          { label: { text: 'd' } },
        ],
      }),
      SideLabelsSingleDefine: () => figure.collections.polyline({
        points,
        close: true,
        side: { label: { text: 'a' } },
      }),
      SideLabelsActualLength: () => figure.collections.polyline({
        points,
        close: true,
        side: { label: { text: null } },
      }),
      AngleLabelsClose: () => figure.collections.polyline({
        points,
        close: true,
        angle: {
          label: {
            text: 'a',
          },
        },
      }),
      AngleLabelsOpen: () => figure.collections.polyline({
        points,
        close: false,
        angle: {
          label: {
            text: 'a',
          },
        },
      }),
      AngleLabelsFullDefine: () => figure.collections.polyline({
        points,
        close: true,
        angle: [
          { label: { text: 'a' } },
          { label: { text: 'b' } },
          { label: { text: null } },
        ],
      }),
      PadSimple: () => figure.collections.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
        },
      }),
      PadBoundary: () => figure.collections.polyline({
        points,
        close: true,
        pad: {
          radius: 0.2,
          boundary: {
            translation: {
              left: -3, bottom: -2, right: 3, top: 2,
            },
          },
          isMovable: true,
        },
      }),
      Misc: () => figure.collections.polyline({
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
    // expect(poly._line.drawingObject.points).toHaveLength(points.length * 12);
    expect(tools.cleanUIDs(poly._line)).toMatchSnapshot();
    expect(poly._line.drawingObject.points).toHaveLength(points.length * 12);
    expect(Object.keys(poly.elements)).toHaveLength(1);
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
      const { boundary } = poly._pad0.getMoveBounds().boundary[0];
      expect(round(boundary.left, 3)).toBe(-2.8);
      expect(round(boundary.right, 3)).toBe(2.8);
      expect(round(boundary.bottom, 3)).toBe(-1.8);
      expect(round(boundary.top, 3)).toBe(1.8);
    });
  });
  describe('Side Labels', () => {
    test('Close', () => {
      const poly = ways.SideLabelsClose();
      expect(Object.keys(poly.elements)).toHaveLength(4);
      expect(Object.keys(poly.elements))
        .toEqual(['line', 'side01', 'side12', 'side20']);
      expect(poly.elements.side01.line.p1).toEqual(points[0]);
      expect(poly.elements.side01.line.p2).toEqual(points[1]);
      expect(poly.elements.side12.line.p1).toEqual(points[1]);
      expect(poly.elements.side12.line.p2).toEqual(points[2]);
      expect(poly.elements.side20.line.p1).toEqual(points[2]);
      expect(poly.elements.side20.line.p2.round()).toEqual(points[0]);
    });
    test('Open', () => {
      const poly = ways.SideLabelsOpen();
      expect(Object.keys(poly.elements)).toHaveLength(3);
      expect(Object.keys(poly.elements))
        .toEqual(['line', 'side01', 'side12']);
      expect(poly.elements.side01.line.p1).toEqual(points[0]);
      expect(poly.elements.side01.line.p2).toEqual(points[1]);
      expect(poly.elements.side12.line.p1).toEqual(points[1]);
      expect(poly.elements.side12.line.p2).toEqual(points[2]);
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
        .toEqual(['angle0', 'line']);
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
      expect(base20.drawingObject.text[0].text).toBe('315\u00b0');
    });
  });
  describe('Figure Level', () => {
    test('Pad change shape', () => {
      figure.add({
        method: 'collections.polyline',
        name: 'a',
        options: {
          points,
          close: true,
          pad: {
            radius: 0.2,
            boundary: {
              translation: {
                left: -3, bottom: -2, right: 3, top: 2,
              },
            },
            isMovable: true,
          },
        },
      });
      figure.initialize();
      const a = figure.elements._a;
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
      figure.add({
        method: 'opolyline',
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
            boundary: {
              translation: {
                left: -3, bottom: -2, right: 3, top: 2,
              },
            },
            isMovable: true,
            // move: {
            //   bounds: {
            //     translation: { line: [[0, 0], [9, 9]] },
            //   },
            // },
          },
        },
      });
      figure.initialize();
      const a = figure.elements._a;
      // a.move.freely.bounceLoss = 0;
      // a.move.freely.deceleration = 1;
      expect(a.points[0]).toEqual(new Point(0, 0));
      expect(a.points[1]).toEqual(new Point(10, 0));
      expect(a.points[2]).toEqual(new Point(10, 10));
      const p0 = a._pad0;
      p0.move.bounds.updateTranslation({ line: [[0, 0], [9, 9]] });
      p0.setTouchable();
      p0.move.freely.bounceLoss = 0;
      p0.move.freely.deceleration = 1;
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
      figure.mock.timeStep(0.1);
      figure.mock.touchMove([0.5 * Math.sqrt(2), 0]);
      figure.mock.touchUp();

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
      figure.mock.timeStep(1);
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
      figure.mock.timeStep(1);
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
