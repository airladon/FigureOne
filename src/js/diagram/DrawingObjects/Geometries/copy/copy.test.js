import {
  Point, Transform,
} from '../../../../tools/g2';
import {
  copyPoints,
} from './copy';
import { round } from '../../../../tools/math';

describe('Copy tests', () => {
  describe('Copy Offset', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [{ offset: [1, 0] }]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Multi', () => {
      const points = copyPoints([[0, 0]], [{ offset: [[1, 0], [2, 0]] }]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(2, 0));
    });
    test('Multi Three', () => {
      const points = copyPoints(
        [[0, 0], [0.1, 0], [0.2, 0]],
        [{ offset: [[1, 0], [2, 0]] }],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0.1, 0));
      expect(round(points[2])).toEqual(new Point(0.2, 0));
      expect(round(points[3])).toEqual(new Point(1, 0));
      expect(round(points[4])).toEqual(new Point(1.1, 0));
      expect(round(points[5])).toEqual(new Point(1.2, 0));
      expect(round(points[6])).toEqual(new Point(2, 0));
      expect(round(points[7])).toEqual(new Point(2.1, 0));
      expect(round(points[8])).toEqual(new Point(2.2, 0));
    });
    test('Two chain', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: [1, 0] },
          { offset: [0, 1] },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(1, 1));
    });
    test('Three chain', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: [1, 0] },
          { offset: [0, 1] },
          { offset: [2, 0] },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(1, 1));
      expect(round(points[4])).toEqual(new Point(2, 0));
      expect(round(points[5])).toEqual(new Point(3, 0));
      expect(round(points[6])).toEqual(new Point(2, 1));
      expect(round(points[7])).toEqual(new Point(3, 1));
    });
    test('Three chain - selcted copy only', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: { to: [1, 0] } },
          { offset: { to: [0, 1] } },
          { offset: { to: [2, 0], start: 1, end: 2 } },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(1, 1));
      expect(round(points[2])).toEqual(new Point(2, 1));
      expect(round(points[3])).toEqual(new Point(3, 1));
    });
    test('Three chain - selcted copy only with mark', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: { to: [1, 0] } },
          { offset: { to: [0, 1] } },
          'a',
          { offset: { to: [2, 0], start: 1, end: 'a' } },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(1, 1));
      expect(round(points[2])).toEqual(new Point(2, 1));
      expect(round(points[3])).toEqual(new Point(3, 1));
    });
    test('Three chain - selcted copy only with two marks', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: { to: [1, 0] } },
          'a',
          { offset: { to: [0, 1] } },
          'b',
          { offset: { to: [2, 0], start: 'a', end: 'b' } },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(1, 1));
      expect(round(points[2])).toEqual(new Point(2, 1));
      expect(round(points[3])).toEqual(new Point(3, 1));
    });
    test('Three chain - no original', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { offset: { to: [1, 0] } },
          { offset: { to: [0, 1], original: false } },
          { offset: { to: [2, 0] } },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(1, 1));
      expect(round(points[2])).toEqual(new Point(2, 1));
      expect(round(points[3])).toEqual(new Point(3, 1));
    });
  });
  describe('Copy Transform', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [
        {
          transform: new Transform().translate(1, 0),
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Multi', () => {
      const points = copyPoints([[0, 0]], [
        {
          transform: [
            new Transform().translate(1, 0),
            new Transform().translate(2, 0),
          ],
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(2, 0));
    });
  });
  describe('Copy Linear', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [
        {
          linear: {
            num: 1,
            step: 1,
            angle: 0,
          },
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Two step', () => {
      const points = copyPoints([[0, 0]], [
        {
          linear: {
            num: 2,
            step: 1,
            angle: 0,
          },
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(2, 0));
    });
    test('X Axis', () => {
      const points = copyPoints([[0, 0]], [
        {
          linear: {
            num: 1,
            step: 1,
            axis: 'x',
          },
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Y Axis', () => {
      const points = copyPoints([[0, 0]], [
        {
          linear: {
            num: 1,
            step: 1,
            axis: 'y',
          },
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0, 1));
    });
    test('Angle', () => {
      const points = copyPoints([[0, 0]], [
        {
          linear: {
            num: 1,
            step: 1,
            angle: Math.PI,
          },
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(-1, 0));
    });
  });
});
