import { Point, getPoint } from './Point';
import { curvedPath } from './Path';
import { round } from '../math';

describe('Path', () => {
  describe('curvedPath', () => {
    let options;
    let curveTest;
    beforeEach(() => {
      options = {
        // rot: 1,
        magnitude: 0.5,
        offset: 0.5,
        controlPoint: null,
        direction: 'up',
      };
      curveTest = (start, stop, direction) => round(curvedPath(
        getPoint(start),
        getPoint(stop),
        0.5,
        {
          magnitude: 0.5,
          offset: 0.5,
          controlPoint: null,
          direction,
        },
      ), 3);
    });
    test('up', () => {
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, 0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('down', () => {
      options.direction = 'down';
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, -0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('left', () => {
      options.direction = 'left';
      const start = new Point(0, 0);
      const stop = new Point(0, 2);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(-0.5, 1));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('right', () => {
      options.direction = 'right';
      const start = new Point(0, 0);
      const stop = new Point(0, 2);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(0.5, 1));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('control', () => {
      options.direction = 'right';
      options.controlPoint = new Point(1, 1);
      const start = new Point(0, 0);
      const stop = new Point(2, 0);
      expect(curvedPath(start, stop, 0, options)).toEqual(start);
      expect(curvedPath(start, stop, 0.5, options)).toEqual(new Point(1, 0.5));
      expect(curvedPath(start, stop, 1, options)).toEqual(stop);
    });
    test('directions Quadrant 1', () => {
      expect(curveTest([0, 0], [1, 1], 'up')).toEqual(new Point(0.25, 0.75));
      expect(curveTest([0, 0], [1, 1], 'left')).toEqual(new Point(0.25, 0.75));
      expect(curveTest([0, 0], [1, 1], 'down')).toEqual(new Point(0.75, 0.25));
      expect(curveTest([0, 0], [1, 1], 'right')).toEqual(new Point(0.75, 0.25));

      expect(curveTest([1, 1], [-1, -1], 'up')).toEqual(new Point(0.25, 0.75));
      expect(curveTest([1, 1], [-1, -1], 'left')).toEqual(new Point(0.25, 0.75));
      expect(curveTest([1, 1], [-1, -1], 'down')).toEqual(new Point(0.75, 0.25));
      expect(curveTest([1, 1], [-1, -1], 'right')).toEqual(new Point(0.75, 0.25));
    });
    test('directions Quadrant 2', () => {
      expect(curveTest([0, 0], [-1, 1], 'up')).toEqual(new Point(-0.25, 0.75));
      expect(curveTest([0, 0], [-1, 1], 'right')).toEqual(new Point(-0.25, 0.75));
      expect(curveTest([0, 0], [-1, 1], 'down')).toEqual(new Point(-0.75, 0.25));
      expect(curveTest([0, 0], [-1, 1], 'left')).toEqual(new Point(-0.75, 0.25));

      expect(curveTest([-1, 1], [1, -1], 'up')).toEqual(new Point(-0.25, 0.75));
      expect(curveTest([-1, 1], [1, -1], 'right')).toEqual(new Point(-0.25, 0.75));
      expect(curveTest([-1, 1], [1, -1], 'down')).toEqual(new Point(-0.75, 0.25));
      expect(curveTest([-1, 1], [1, -1], 'left')).toEqual(new Point(-0.75, 0.25));
    });
    test('directions Quadrant 3', () => {
      expect(curveTest([0, 0], [-1, -1], 'up')).toEqual(new Point(-0.75, -0.25));
      expect(curveTest([0, 0], [-1, -1], 'left')).toEqual(new Point(-0.75, -0.25));
      expect(curveTest([0, 0], [-1, -1], 'down')).toEqual(new Point(-0.25, -0.75));
      expect(curveTest([0, 0], [-1, -1], 'right')).toEqual(new Point(-0.25, -0.75));

      expect(curveTest([-1, -1], [1, 1], 'up')).toEqual(new Point(-0.75, -0.25));
      expect(curveTest([-1, -1], [1, 1], 'left')).toEqual(new Point(-0.75, -0.25));
      expect(curveTest([-1, -1], [1, 1], 'down')).toEqual(new Point(-0.25, -0.75));
      expect(curveTest([-1, -1], [1, 1], 'right')).toEqual(new Point(-0.25, -0.75));
    });
    test('directions Quadrant 4', () => {
      expect(curveTest([0, 0], [1, -1], 'down')).toEqual(new Point(0.25, -0.75));
      expect(curveTest([0, 0], [1, -1], 'left')).toEqual(new Point(0.25, -0.75));
      expect(curveTest([0, 0], [1, -1], 'up')).toEqual(new Point(0.75, -0.25));
      expect(curveTest([0, 0], [1, -1], 'right')).toEqual(new Point(0.75, -0.25));

      expect(curveTest([1, -1], [-1, 1], 'down')).toEqual(new Point(0.25, -0.75));
      expect(curveTest([1, -1], [-1, 1], 'left')).toEqual(new Point(0.25, -0.75));
      expect(curveTest([1, -1], [-1, 1], 'up')).toEqual(new Point(0.75, -0.25));
      expect(curveTest([1, -1], [-1, 1], 'right')).toEqual(new Point(0.75, -0.25));
    });
  });
});
