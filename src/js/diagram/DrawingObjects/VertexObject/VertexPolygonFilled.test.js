import VertexPolygonFilled from './VertexPolygonFilled';
import * as g2 from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';

/* eslint-disable comma-spacing,no-multi-spaces,space-in-parens */
describe('PolygonFilled', () => {
  test('Initialization', () => {
    const p = new VertexPolygonFilled(webgl, 5, 0.5, 0, new g2.Point(0, 0), 5);
    expect(p.radius).toBe(0.5);
    // expect(VertexPolygonFilled.outRad).toBe(0.51);
    // expect(VertexPolygonFilled.inRad).toBe(0.49);
    expect(p.numPoints).toBe(7);
    expect(p.center).toEqual(new g2.Point(0, 0));
    expect(round(p.dAngle)).toEqual(round(Math.PI * 2 / 5));
  });
  test('Square with corner radius 1', () => {
    const square = new VertexPolygonFilled(webgl, 4, 1, 0, g2.point(0,0));
    const targetSquare = [
      0, 0,
      1, 0,
      0 , 1,
      -1 , 0,
      0, -1,
      1, 0,
    ];
    const targetBorder = [
      g2.point( 1,  0),
      g2.point( 0  ,  1),
      g2.point(-1,  0),
      g2.point( 0  , -1),
      g2.point( 1,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });

  test('Square with 3 sides drawn', () => {
    const square = new VertexPolygonFilled(webgl, 4, 1, 0, g2.point(0,0), 3);
    const targetSquare = [
      0, 0,
      1, 0,
      0 , 1,
      -1 , 0,
      0, -1,
    ];
    const targetBorder = [
      g2.point( 0,  0),
      g2.point( 1,  0),
      g2.point( 0  ,  1),
      g2.point(-1,  0),
      g2.point( 0,  -1),
      g2.point( 0,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });

  test('Rotated and offset', () => {
    const square = new VertexPolygonFilled(webgl, 4, Math.sqrt(2), Math.PI / 4, g2.point(1,1));
    const targetSquare = [
      1, 1,
      2, 2,
      0, 2,
      0, 0,
      2, 0,
      2, 2,
    ];
    const targetBorder = [
      g2.point(2, 2),
      g2.point(0, 2),
      g2.point(0, 0),
      g2.point(2, 0),
      g2.point(2, 2),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });

  test('Too many sides to draw', () => {
    const square = new VertexPolygonFilled(webgl, 4, 1, 0, g2.point(0,0), 10);
    const targetSquare = [
      0, 0,
      1, 0,
      0 , 1,
      -1 , 0,
      0, -1,
      1, 0,
    ];
    const targetBorder = [
      g2.point( 1,  0),
      g2.point( 0  ,  1),
      g2.point(-1,  0),
      g2.point( 0  , -1),
      g2.point( 1,  0),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });

  test('Too few sides', () => {
    const square = new VertexPolygonFilled(webgl, 2, 1, 0, g2.point(0,0), 3);
    const x = Math.abs(Math.cos(Math.PI * 2 / 3));
    const y = Math.abs(Math.sin(Math.PI * 2 / 3));
    const targetSquare = [
      0, 0,
      1, 0,
      -x , y,
      -x , -y,
      1, 0,
    ];
    const targetBorder = [
      g2.point(1, 0).round(),
      g2.point(-x, y).round(),
      g2.point(-x, -y).round(),
      g2.point(1, 0).round(),
    ];
    expect(round(square.points)).toEqual(round(targetSquare));
    const squareBorder = square.border[0].map(p => p.round());
    expect(squareBorder).toEqual(targetBorder);
  });
});
