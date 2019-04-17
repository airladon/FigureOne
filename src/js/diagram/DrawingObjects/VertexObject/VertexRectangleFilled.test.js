import VertexRectangleFilled from './VertexRectangleFilled';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';


describe('Rectangle', () => {
  test('left bottom', () => {
    const rect = new VertexRectangleFilled(webgl, 'left', 'bottom', 1, 1, 0, 0);
    expect(rect.points).toEqual([0.5, 0.5, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1]);
  });
  test('center', () => {
    const rect = new VertexRectangleFilled(webgl, 'center', 'middle', 1, 1, 0, 0);
    expect(rect.points).toEqual([
      0, 0,
      0.5, 0.5,
      -0.5, 0.5,
      -0.5, -0.5,
      0.5, -0.5,
      0.5, 0.5,
    ]);
  });
  test('Champfer', () => {
    const rect = new VertexRectangleFilled(webgl, 'left', 'bottom', 1, 1, 0.1, 1);
    expect(round(rect.points)).toEqual([
      0.5, 0.5,
      1, 0.9,
      0.9, 1,
      0.1, 1,
      0, 0.9,
      0, 0.1,
      0.1, 0,
      0.9, 0,
      1, 0.1,
      1, 0.9,
    ]);
  });
});
