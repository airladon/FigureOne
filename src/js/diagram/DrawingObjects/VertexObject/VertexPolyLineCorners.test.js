import VertexPolyLineCorners from './VertexPolyLineCorners';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';

/* eslint-disable comma-spacing,no-multi-spaces,space-in-parens */
describe('Corners', () => {
  test('Corner at origin', () => {
    const cornerCoords = [
      new Point(1, 0), new Point(0, 0),
      new Point(0, 1),
    ];
    const corner = new VertexPolyLineCorners([webgl], cornerCoords, false, 1, 0.1);

    const border = [
      new Point(1, -0.05),
      new Point(1, 0.05),
      new Point(0.05, 0.05),
      new Point(0.05, 1),
      new Point(-0.05, 1),
      new Point(-0.05, -0.05),
      new Point(1, -0.05),
    ];
    const points = [
      1, -0.05,
      1, 0.05,
      0.05, 0.05,
      1, -0.05,
      0.05, 0.05,
      -0.05, -0.05,
      -0.05, -0.05,
      0.05, 0.05,
      0.05, 1,
      -0.05, -0.05,
      0.05, 1,
      -0.05, 1,
    ];
    expect(round(corner.points)).toEqual(points);
    expect(corner.border[0].map(x => x.round())).toEqual(border);
  });
  test('Corners on a square', () => {
    const cornerCoords = [
      new Point(1, 0),
      new Point(0, 0),
      new Point(0, 1),
      new Point(1, 1),
    ];
    const corner = new VertexPolyLineCorners([webgl], cornerCoords, true, 1, 0.1);

    const border = [
      [
        new Point(1, -0.05),
        new Point(1, 0.05),
        new Point(0.05, 0.05),
        new Point(0.05, 1),
        new Point(-0.05, 1),
        new Point(-0.05, -0.05),
        new Point(1, -0.05),
      ],
      [
        new Point(-0.05, 0),
        new Point(0.05, 0),
        new Point(0.05, 0.95),
        new Point(1, 0.95),
        new Point(1, 1.05),
        new Point(-0.05, 1.05),
        new Point(-0.05, 0),
      ],
      [
        new Point(0, 1.05),
        new Point(0, 0.95),
        new Point(0.95, 0.95),
        new Point(0.95, 0),
        new Point(1.05, 0),
        new Point(1.05, 1.05),
        new Point(0, 1.05),
      ],
      [
        new Point(1.05, 1),
        new Point(0.95, 1),
        new Point(0.95, 0.05),
        new Point(0, 0.05),
        new Point(0, -0.05),
        new Point(1.05, -0.05),
        new Point(1.05, 1),
      ],
    ];
    const points = [
      1, -0.05,
      1, 0.05,
      0.05, 0.05,
      1, -0.05,
      0.05, 0.05,
      -0.05, -0.05,
      -0.05, -0.05,
      0.05, 0.05,
      0.05, 1,
      -0.05, -0.05,
      0.05, 1,
      -0.05, 1,
      -0.05, 0,
      0.05, 0,
      0.05, 0.95,
      -0.05, 0,
      0.05, 0.95,
      -0.05, 1.05,
      -0.05, 1.05,
      0.05, 0.95,
      1, 0.95,
      -0.05, 1.05,
      1, 0.95,
      1, 1.05,
      0, 1.05,
      0, 0.95,
      0.95, 0.95,
      0, 1.05,
      0.95, 0.95,
      1.05, 1.05,
      1.05, 1.05,
      0.95, 0.95,
      0.95, 0,
      1.05, 1.05,
      0.95, 0,
      1.05, 0,
      1.05, 1,
      0.95, 1,
      0.95, 0.05,
      1.05, 1,
      0.95, 0.05,
      1.05, -0.05,
      1.05, -0.05,
      0.95, 0.05,
      0, 0.05,
      1.05, -0.05,
      0, 0.05,
      0, -0.05,
    ];
    expect(round(corner.points)).toEqual(points);
    expect(corner.border[0].map(x => x.round())).toEqual(border[0]);
    expect(corner.border[1].map(x => x.round())).toEqual(border[1]);
    expect(corner.border[2].map(x => x.round())).toEqual(border[2]);
    expect(corner.border[3].map(x => x.round())).toEqual(border[3]);
  });
});

