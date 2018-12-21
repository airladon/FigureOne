import VertexDashedLine from './VertexDashedLine';
import { Point } from '../../../tools/g2';
import webgl from '../../../__mocks__/WebGLInstanceMock';
import { round } from '../../../tools/math';


describe('Dashed Line', () => {
  let makeLine;
  beforeEach(() => {
    makeLine = (dashStyle, maxLength = 1) => new VertexDashedLine(
      webgl, new Point(0, 0), maxLength, 0.2, 0, dashStyle,
    );
  });
  test('Default', () => {
    const line = new VertexDashedLine(webgl);
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
      1, 0.05,
      0, -0.05,
      1, 0.05,
      1, -0.05,
    ];
    expect(round(line.points)).toEqual(points);
    expect(line.border[0].map(x => x.round())).toEqual(border);
  });
  describe('Dash points', () => {
    test('Half dash defined by single length', () => {
      const line = makeLine([0.5]);
      const points = [
        0, -0.1,
        0, 0.1,
        0.5, 0.1,
        0, -0.1,
        0.5, 0.1,
        0.5, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
    test('Half dash defined by two lengths', () => {
      const line = makeLine([0.5, 0.5]);
      // same as single length answer
      const points = [
        0, -0.1,
        0, 0.1,
        0.5, 0.1,
        0, -0.1,
        0.5, 0.1,
        0.5, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
    test('Quarter dash defined by single length', () => {
      const line = makeLine([0.25]);
      const points = [
        0, -0.1,
        0, 0.1,
        0.25, 0.1,
        0, -0.1,
        0.25, 0.1,
        0.25, -0.1,
        // second dash
        0.5, -0.1,
        0.5, 0.1,
        0.75, 0.1,
        0.5, -0.1,
        0.75, 0.1,
        0.75, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
    test('Quarter dash defined by single length border test', () => {
      const line = makeLine([0.25]);
      const border = [
        new Point(0, -0.1),
        new Point(0, 0.1),
        new Point(0.75, 0.1),
        new Point(0.75, -0.1),
        new Point(0, -0.1),
      ];
      expect(line.border[0].map(x => x.round())).toEqual(border);
    });
    test('0.5 dash over 2 length', () => {
      const line = makeLine([0.5], 2);
      const points = [
        0, -0.1,
        0, 0.1,
        0.5, 0.1,
        0, -0.1,
        0.5, 0.1,
        0.5, -0.1,
        // second dash
        1, -0.1,
        1, 0.1,
        1.5, 0.1,
        1, -0.1,
        1.5, 0.1,
        1.5, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
    test('0.5 dash clipped at 1.2 length', () => {
      const line = makeLine([0.5], 1.2);
      const points = [
        0, -0.1,
        0, 0.1,
        0.5, 0.1,
        0, -0.1,
        0.5, 0.1,
        0.5, -0.1,
        // second dash
        1, -0.1,
        1, 0.1,
        1.2, 0.1,
        1, -0.1,
        1.2, 0.1,
        1.2, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
    test('0.5, 0.25 dash over 2 length', () => {
      const line = makeLine([0.5, 0.25], 2);
      const points = [
        0, -0.1,
        0, 0.1,
        0.5, 0.1,
        0, -0.1,
        0.5, 0.1,
        0.5, -0.1,
        // second dash
        0.75, -0.1,
        0.75, 0.1,
        1.25, 0.1,
        0.75, -0.1,
        1.25, 0.1,
        1.25, -0.1,
        // third dash
        1.5, -0.1,
        1.5, 0.1,
        2, 0.1,
        1.5, -0.1,
        2, 0.1,
        2, -0.1,
      ];
      expect(round(line.points)).toEqual(points);
    });
  });
  describe('Draw number of points', () => {
    test('All points', () => {
      const line = makeLine([0.5], 2);
      const num = line.getPointCountForLength(2);
      expect(num).toBe(12);
    });
    test('Break in gap', () => {
      const line = makeLine([0.5], 2);
      const num = line.getPointCountForLength(1.9);
      expect(num).toBe(12);
    });
    test('Break in second line', () => {
      const line = makeLine([0.5], 2);
      const num = line.getPointCountForLength(1.2);
      expect(num).toBe(6);
    });
    test('Break in first line', () => {
      const line = makeLine([0.5], 2);
      const num = line.getPointCountForLength(0.2);
      expect(num).toBe(0);
    });
    test('Break in first gap', () => {
      const line = makeLine([0.5], 2);
      const num = line.getPointCountForLength(0.6);
      expect(num).toBe(6);
    });
  });
});

