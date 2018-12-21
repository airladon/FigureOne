import VertexArrow from './VertexArrow';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';

describe('Arrow', () => {
  test('Default', () => {
    const arrow = new VertexArrow(webgl);
    const border = [
      new Point(0, 0), new Point(-0.5, -0.5),
      new Point(-0.25, -0.5), new Point(-0.25, -1),
      new Point(0.25, -1), new Point(0.25, -0.5),
      new Point(0.5, -0.5), new Point(0, 0),
    ];
    const points = [
      0, 0,
      -0.5, -0.5,
      -0.25, -0.5,
      -0.25, -1,
      0.25, -1,
      0.25, -0.5,
      0.5, -0.5,
    ];
    expect(round(arrow.points)).toEqual(points);
    expect(arrow.border[0].map(x => x.round())).toEqual(border);
  });
  test('Custom', () => {
    const arrow = new VertexArrow(webgl, 2, 1, 4, 2, new Point(1, -1));
    const border = [
      new Point(1, -1),
      new Point(0, -3),
      new Point(0.5, -3),
      new Point(0.5, -5),
      new Point(1.5, -5),
      new Point(1.5, -3),
      new Point(2, -3),
      new Point(1, -1),
    ];
    const points = [
      1, -1,
      0, -3,
      0.5, -3,
      0.5, -5,
      1.5, -5,
      1.5, -3,
      2, -3,
    ];
    expect(round(arrow.points)).toEqual(points);
    expect(arrow.border[0].map(x => x.round())).toEqual(border);
  });
});

