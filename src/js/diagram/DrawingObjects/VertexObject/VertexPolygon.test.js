import VertexPolygon from './VertexPolygon';
import * as g2 from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';

/* eslint-disable comma-spacing,no-multi-spaces,space-in-parens */
describe('Polygon', () => {
  test('Initialization', () => {
    const polygon = new VertexPolygon([webgl], 5, 0.5, 0.02, 0, new g2.Point(0, 0));
    expect(polygon.radius).toBe(0.5);
    // expect(polygon.outRad).toBe(0.51);
    // expect(polygon.inRad).toBe(0.49);
    expect(polygon.numPoints).toBe(12);
    expect(polygon.center).toEqual(new g2.Point(0, 0));
    expect(round(polygon.dAngle)).toEqual(round(Math.PI * 2 / 5));
  });
  test('Square with corner radius 1 and thickness 0.1', () => {
    const square = new VertexPolygon([webgl], 4, 1.1, 0.2, 0, g2.point(0,0));
    const targetSquare = [
      0.9,  0,
      1.1,  0,
      0  ,  0.9,
      0  ,  1.1,
      -0.9,  0,
      -1.1,  0,
      0  , -0.9,
      0  , -1.1,
      0.9,  0,
      1.1,  0,
    ];
    const targetBorder = [
      g2.point( 1.1,  0),
      g2.point( 0  ,  1.1),
      g2.point(-1.1,  0),
      g2.point( 0  , -1.1),
      g2.point( 1.1,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });

  test('Square: corner radius 1, thickness 0.2, and only 3 sides drawn', () => {
    const square = new VertexPolygon([webgl], 4, 1.1,0.2, 0, g2.point(0,0), 3);
    const targetSquare = [
      0.9,  0,
      1.1,  0,
      0  ,  0.9,
      0  ,  1.1,
      -0.9,  0,
      -1.1,  0,
      0  , -0.9,
      0  , -1.1,
    ];
    const targetBorder = [
      g2.point( 1.1,  0),
      g2.point( 0  ,  1.1),
      g2.point(-1.1,  0),
      g2.point( 0  , -1.1),
      g2.point( 0  , -0.9),
      g2.point(-0.9,  0),
      g2.point( 0  ,  0.9),
      g2.point( 0.9,  0),
      g2.point( 1.1,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });
  test('Square: corner radius 2 and thickness 1', () => {
    const square = new VertexPolygon([webgl],4, 2.5, 1.0, 0, g2.point(0,0));
    const targetSquare = [
      1.5,  0,
      2.5,  0,
      0  ,  1.5,
      0  ,  2.5,
      -1.5,  0,
      -2.5,  0,
      0  , -1.5,
      0  , -2.5,
      1.5,  0,
      2.5,  0,
    ];
    const targetBorder = [
      g2.point(2.5,  0),
      g2.point(0  ,  2.5),
      g2.point(-2.5,  0),
      g2.point(0  , -2.5),
      g2.point(2.5,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });
  test('Square: corner radius 2, thickness 1, rotated by 45 degrees', () => {
    const square = new VertexPolygon(
      [webgl],
      4,
      Math.sqrt(2) * 2.5,
      Math.sqrt(2) * 1.0,
      Math.PI / 4,
      g2.point(0,0),
    );
    const targetSquare = [
      1.5,  1.5,
      2.5,  2.5,
      -1.5,  1.5,
      -2.5,  2.5,
      -1.5, -1.5,
      -2.5, -2.5,
      1.5 , -1.5,
      2.5 , -2.5,
      1.5,  1.5,
      2.5,  2.5,
    ];
    const targetBorder = [
      g2.point(2.5,  2.5),
      g2.point(-2.5, 2.5),
      g2.point(-2.5, -2.5),
      g2.point(2.5 , -2.5),
      g2.point(2.5,  2.5),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });
});

/* eslint-enable indent */
