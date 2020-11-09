// import {
//   Point, Rect,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Angle', () => {
  let diagram;

  beforeEach(() => {
    diagram = makeDiagram();
  });
  test('Default Angle', () => {
    const angle = diagram.advanced.angle();
    expect(angle.angle).toBe(1);
    expect(angle.getRotation()).toBe(0);
    // expect(angle.rotation).toBe(0);
  });
  test('By Angle', () => {
    const angle = diagram.advanced.angle({
      angle: 2,
      rotation: 1,
    });
    expect(angle.angle).toBe(2);
    expect(angle.getRotation()).toBe(1);
    // expect(angle.rotation).toBe(1);
  });
  test('By Points', () => {
    const angle = diagram.advanced.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(270);
  });
  test('By Points reverse direction', () => {
    const angle = diagram.advanced.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
      direction: -1,
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(90);
  });
  describe('Curve', () => {
    test('5 sides of 50 evenly', () => {
      diagram.addElement({
        name: 'a',
        method: 'angle',
        options: {
          angle: Math.PI / 5,
          curve: {
            radius: 1,
            width: 0.01,
            sides: 50,
          },
        },
      });
      const a = diagram.elements._a;
      expect(a._curve.getRotation()).toBe(0);
    });
    test('5 sides of 50 not even', () => {
      // For 50 sides, each side is 2 * Math.PI / 50 = Math.PI / 25
      // So make the angle one half of one side larger = Math.PI / 50
      diagram.addElement({
        name: 'a',
        method: 'angle',
        options: {
          angle: Math.PI / 5 + Math.PI / 50,
          curve: {
            radius: 1,
            width: 0.01,
            sides: 50,
          },
        },
      });
      const a = diagram.elements._a;
      expect(round(a._curve.getRotation())).toBe(round(Math.PI / 50 / 2));
    });
  });
});
