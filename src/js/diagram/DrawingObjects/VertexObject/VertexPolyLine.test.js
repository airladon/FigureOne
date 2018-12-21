// import VertexPolyLine from './VertexPolyLine';
// import { Point } from '../../../tools/g2';
// import webgl from '../../../__mocks__/WebGLInstanceMock';
// import { round } from '../../../tools/math';

test('dummy', () => {
  expect(true).toBe(true);
});
// describe('VertexPolyLine', () => {
//   test('Corner at origin', () => {
//     const cornerCoords = [
//       new Point(1, 0), new Point(0, 0),
//       new Point(0, 1),
//     ];
//     const corner = new VertexPolyLine(webgl, cornerCoords, false, 0.1);

//     const border = [
//       new Point(1, -0.05),
//       new Point(1, 0.05),
//       new Point(0.05, 0.05),
//       new Point(0.05, 1),
//       new Point(-0.05, 1),
//       new Point(-0.05, -0.05),
//       new Point(1, -0.05),
//     ];
//     const points = [
//       1, -0.05,
//       1, 0.05,
//       0.05, 0.05,
//       1, -0.05,
//       0.05, 0.05,
//       -0.05, -0.05,
//       -0.05, -0.05,
//       0.05, 0.05,
//       0.05, 1,
//       -0.05, -0.05,
//       0.05, 1,
//       -0.05, 1,
//     ];
//     expect(round(corner.points)).toEqual(points);
//     expect(corner.border[0].map(x => x.round())).toEqual(border);
//   });
//   test('Square', () => {
//     const coords = [
//       new Point(0, 0),
//       new Point(0, 1),
//       new Point(1, 1),
//       new Point(1, 0),
//     ];
//     const square = new VertexPolyLine(webgl, coords, true, 0.1);

//     const border = [
//       new Point(-0.05, -0.05),
//       new Point(-0.05, 1.05),
//       new Point(1.05, 1.05),
//       new Point(1.05, -0.05),
//       new Point(-0.05, -0.05),
//     ];
//     const points = [
//       -0.05, -0.05,
//       0.05, 0.05,
//       0.05, 0.95,
//       -0.05, -0.05,
//       0.05, 0.95,
//       -0.05, 1.05,
//       -0.05, 1.05,
//       0.05, 0.95,
//       0.95, 0.95,
//       -0.05, 1.05,
//       0.95, 0.95,
//       1.05, 1.05,
//       1.05, 1.05,
//       0.95, 0.95,
//       0.95, 0.05,
//       1.05, 1.05,
//       0.95, 0.05,
//       1.05, -0.05,
//       1.05, -0.05,
//       0.95, 0.05,
//       0.05, 0.05,
//       1.05, -0.05,
//       0.05, 0.05,
//       -0.05, -0.05,
//     ];
//     expect(round(square.points)).toEqual(points);
//     expect(square.border[0].map(x => x.round())).toEqual(border);
//   });
// });
