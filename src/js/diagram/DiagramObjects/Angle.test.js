// import {
//   Point, Rect,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
// jest.mock('../../tools/tools');

describe('Angle', () => {
  let diagram;

  beforeEach(() => {
    diagram = makeDiagram();
  });
  test('Default Angle', () => {
    const angle = diagram.objects.angle();
    expect(angle.angle).toBe(1);
    expect(angle.rotation).toBe(0);
  });
  test('By Angle', () => {
    const angle = diagram.objects.angle({
      angle: 2,
      rotation: 1,
    });
    expect(angle.angle).toBe(2);
    expect(angle.rotation).toBe(1);
  });
  test('By Points', () => {
    const angle = diagram.objects.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(270);
  });
  test('By Points reverse direction', () => {
    const angle = diagram.objects.angle({
      p1: [0, 1],
      p2: [0, 0],
      p3: [1, 0],
      direction: -1,
    });
    expect(round(angle.angle * 180 / Math.PI, 5)).toBe(90);
  });
});
