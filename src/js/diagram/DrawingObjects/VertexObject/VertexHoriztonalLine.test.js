import VertexHorizontalLine from './VertexHorizontalLine';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';


describe('Horizontal Line', () => {
  test('Default', () => {
    const line = new VertexHorizontalLine([webgl]);
    const border = [
      new Point(0, -0.05),
      new Point(0, 0.05),
      new Point(1, 0.05),
      new Point(1, -0.05),
      new Point(0, -0.05),
    ];
    const points = [
      0, -0.05,
      0, 0.05,
      1, -0.05,
      1, 0.05,
    ];
    expect(round(line.points)).toEqual(points);
    expect(line.border[0].map(x => x.round())).toEqual(border);
  });
  test('Custom', () => {
    const line = new VertexHorizontalLine([webgl], new Point(1, 1), 2, 0.1);
    const border = [
      new Point(1, 0.95),
      new Point(1, 1.05),
      new Point(3, 1.05),
      new Point(3, 0.95),
      new Point(1, 0.95),
    ];
    const points = [
      1, 0.95,
      1, 1.05,
      3, 0.95,
      3, 1.05,
    ];
    expect(round(line.points)).toEqual(points);
    expect(line.border[0].map(x => x.round())).toEqual(border);
  });
  test('Rotated by 90', () => {
    const line = new VertexHorizontalLine([webgl], new Point(1, 1), 2, 0.1, Math.PI / 2);
    const border = [
      new Point(1.05, 1),
      new Point(0.95, 1),
      new Point(0.95, 3),
      new Point(1.05, 3),
      new Point(1.05, 1),
    ];
    const points = [
      1.05, 1,
      0.95, 1,
      1.05, 3,
      0.95, 3,
    ];
    expect(round(line.points)).toEqual(points);
    expect(line.border[0].map(x => x.round())).toEqual(border);
  });
});

