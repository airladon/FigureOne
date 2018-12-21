import PolyLineTriangles from './PolyLineTriangles';
import { Point } from '../../../tools/g2';
// import webgl from '../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';

describe('PolygonFilled', () => {
  let corner;
  // let triangle;
  let square;
  let square2;
  beforeEach(() => {
    const cornerLine = [
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ];
    const squareLine = [
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1),
    ];
    const squareLine2 = [
      new Point(0, 0),
      new Point(0, 1),
      new Point(1, 1),
      new Point(1, 0),
    ];
    corner = PolyLineTriangles(cornerLine, false, 0.1);
    // triangle = PolyLineTriangles(cornerLine, true, 0.1);
    square = PolyLineTriangles(squareLine, true, 0.1);
    square2 = PolyLineTriangles(squareLine2, true, 0.1);
  });
  test('Square defined anit-clockwise', () => {
    const points = [
      0.05, 0.05,
      -0.05, -0.05,
      1.05, -0.05,
      0.05, 0.05,
      1.05, -0.05,
      0.95, 0.05,
      0.95, 0.05,
      1.05, -0.05,
      1.05, 1.05,
      0.95, 0.05,
      1.05, 1.05,
      0.95, 0.95,
      0.95, 0.95,
      1.05, 1.05,
      -0.05, 1.05,
      0.95, 0.95,
      -0.05, 1.05,
      0.05, 0.95,
      0.05, 0.95,
      -0.05, 1.05,
      -0.05, -0.05,
      0.05, 0.95,
      -0.05, -0.05,
      0.05, 0.05,
    ];
    const border = [
      new Point(-0.05, -0.05),
      new Point(1.05, -0.05),
      new Point(1.05, 1.05),
      new Point(-0.05, 1.05),
      new Point(-0.05, -0.05),
    ];
    expect(square.points).toEqual(points);
    expect(square.border).toEqual(border);
  });
  test('Square defined clockwise', () => {
    const points = [
      -0.05, -0.05,
      0.05, 0.05,
      0.05, 0.95,
      -0.05, -0.05,
      0.05, 0.95,
      -0.05, 1.05,
      -0.05, 1.05,
      0.05, 0.95,
      0.95, 0.95,
      -0.05, 1.05,
      0.95, 0.95,
      1.05, 1.05,
      1.05, 1.05,
      0.95, 0.95,
      0.95, 0.05,
      1.05, 1.05,
      0.95, 0.05,
      1.05, -0.05,
      1.05, -0.05,
      0.95, 0.05,
      0.05, 0.05,
      1.05, -0.05,
      0.05, 0.05,
      -0.05, -0.05,
    ];
    const border = [
      new Point(-0.05, -0.05),
      new Point(-0.05, 1.05),
      new Point(1.05, 1.05),
      new Point(1.05, -0.05),
      new Point(-0.05, -0.05),
    ];
    expect(square2.points).toEqual(points);
    expect(square2.border).toEqual(border);
  });
  test('Corner', () => {
    const points = [
      0, 0.05,
      0, -0.05,
      1.1207106781186547, -0.05,
      0, 0.05,
      1.1207106781186547, -0.05,
      0.8792893218813451, 0.05,
      0.8792893218813451, 0.05,
      1.1207106781186547, -0.05,
      0.03535533905932738, 1.0353553390593273,
      0.8792893218813451, 0.05,
      0.03535533905932738, 1.0353553390593273,
      -0.03535533905932738, 0.9646446609406726,
    ];
    const border = [
      new Point(0, 0.05),
      new Point(0, -0.05),
      new Point(1.1207106781186547, -0.05),
      new Point(0.03535533905932738, 1.0353553390593273),
      new Point(-0.03535533905932738, 0.9646446609406726),
      new Point(0.8792893218813451, 0.05),
      new Point(0, 0.05),
    ];
    expect(round(corner.points)).toEqual(round(points));
    expect(corner.border.map(x => x.round())).toEqual(border.map(x => x.round()));
  });
});
