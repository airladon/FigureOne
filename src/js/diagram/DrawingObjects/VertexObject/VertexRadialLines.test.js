import VertexRadialLines from './VertexRadialLines';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';


describe('Horizontal Line', () => {
  test('Default', () => {
    const lines = new VertexRadialLines(webgl, 0, 1, 0.01, Math.PI / 2, Math.PI);
    const border = [
      [
        new Point(0, -0.005),
        new Point(1, -0.005),
        new Point(1, 0.005),
        new Point(0, 0.005),
        new Point(0, -0.005),
      ],
      [
        new Point(0.005, 0),
        new Point(0.005, 1),
        new Point(-0.005, 1),
        new Point(-0.005, 0),
        new Point(0.005, 0),
      ],
      [
        new Point(0, 0.005),
        new Point(-1, 0.005),
        new Point(-1, -0.005),
        new Point(0, -0.005),
        new Point(0, 0.005),
      ],
    ];
    const points = [
      0, -0.005,
      1, -0.005,
      1, 0.005,
      0, -0.005,
      1, 0.005,
      0, 0.005,
      0.005, 0,
      0.005, 1,
      -0.005, 1,
      0.005, 0,
      -0.005, 1,
      -0.005, 0,
      0, 0.005,
      -1, 0.005,
      -1, -0.005,
      0, 0.005,
      -1, -0.005,
      0, -0.005,
    ];
    expect(round(lines.points)).toEqual(points);
    expect(lines.border[0].map(x => x.round())).toEqual(border[0]);
    expect(lines.border[1].map(x => x.round())).toEqual(border[1]);
    expect(lines.border[2].map(x => x.round())).toEqual(border[2]);
  });
});
