import {
  Point, Transform, getTransform,
} from '../../../tools/g2';
import {
  copyPoints,
} from './copy';
import { round } from '../../../tools/math';

describe('Copy tests', () => {
  describe('Copy Offset', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [{ to: [1, 0] }]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Multi', () => {
      const points = copyPoints([[0, 0]], [{ to: [[1, 0], [2, 0]] }]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(2, 0));
    });
    test('Multi Three', () => {
      const points = copyPoints(
        [[0, 0], [0.1, 0], [0.2, 0]],
        [{ to: [[1, 0], [2, 0]] }],
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
          { to: [1, 0] },
          { to: [0, 1] },
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
          { to: [1, 0] },
          { to: [0, 1] },
          { to: [2, 0] },
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
    test('Three chain - selected copy only', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { to: [1, 0] },
          { to: [0, 1] },
          { to: [2, 0], start: 2, end: 3 },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(1, 1));
      expect(round(points[4])).toEqual(new Point(2, 1));
      expect(round(points[5])).toEqual(new Point(3, 1));
    });
    test('Three chain - selcted copy only with mark', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { to: [1, 0] },
          { to: [0, 1] },
          'a',
          { to: [2, 0], start: 2, end: 'a' },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(1, 1));
      expect(round(points[4])).toEqual(new Point(2, 1));
      expect(round(points[5])).toEqual(new Point(3, 1));
    });
    test('Three chain - selcted copy only with two marks', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { to: [1, 0] },
          'a',
          { to: [0, 1] },
          'b',
          { to: [2, 0], start: 'a', end: 'b' },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(0, 1));
      expect(round(points[3])).toEqual(new Point(1, 1));
      expect(round(points[4])).toEqual(new Point(2, 1));
      expect(round(points[5])).toEqual(new Point(3, 1));
    });
    test('Three chain - no original', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          { to: [1, 0] },
          { to: [0, 1], original: false },
          { to: [2, 0] },
        ],
      );
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(1, 1));
      expect(round(points[2])).toEqual(new Point(2, 1));
      expect(round(points[3])).toEqual(new Point(3, 1));
    });
    test('Copy first element in parallel', () => {
      const points = copyPoints(
        [[0, 0]],
        [
          {
            to: [1, 0], start: 0, end: 1, original: false,
          },
          { to: [0, 1], start: 0, end: 1 },
          // { offset: { to: [2, 0] } },
        ],
      );
      expect(round(points[0])).toEqual(new Point(1, 0));
      expect(round(points[1])).toEqual(new Point(0, 1));
      expect(points).toHaveLength(2);
    });
  });
  describe('Copy Transform', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [
        {
          to: new Transform().translate(1, 0),
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Multi', () => {
      const points = copyPoints([[0, 0]], [
        {
          to: [
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
  describe('Copy Angle', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 1]], [
        {
          along: 'rotation',
          num: 1,
          step: Math.PI / 2,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 1));
      expect(round(points[1])).toEqual(new Point(-1, 0));
    });
    test('ZY', () => {
      const points = copyPoints([[0, 1, 0]], [
        {
          along: 'rotation',
          num: 1,
          step: Math.PI / 2,
          axis: [1, 0, 0],
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 1, 0));
      expect(round(points[1])).toEqual(new Point(0, 0, 1));
    });
    test('Radial', () => {
      const points = copyPoints([[0, 0]], [
        { along: 'y', num: 2, step: 1 },
        {
          along: 'rotation',
          num: 1,
          step: Math.PI / 2,
          start: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0, 1));
      expect(round(points[2])).toEqual(new Point(0, 2));
      expect(round(points[3])).toEqual(new Point(-1, 0));
      expect(round(points[4])).toEqual(new Point(-2, 0));
    });
  });
  describe('Copy Linear', () => {
    test('Simple', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: 0,
          num: 1,
          step: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Two step', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: 0,
          num: 2,
          step: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
      expect(round(points[2])).toEqual(new Point(2, 0));
    });
    test('X Axis', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: 'x',
          num: 1,
          step: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(1, 0));
    });
    test('Y Axis', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: 'y',
          num: 1,
          step: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(0, 1));
    });
    test('Z Axis', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: 'z',
          num: 1,
          step: 2,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0, 0));
      expect(round(points[1])).toEqual(new Point(0, 0, 2));
    });
    test('Angle', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: Math.PI,
          num: 1,
          step: 1,
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0));
      expect(round(points[1])).toEqual(new Point(-1, 0));
    });
    test('Along direction', () => {
      const points = copyPoints([[0, 0]], [
        {
          along: [1, 1, 1],
          num: 1,
          step: Math.sqrt(3),
        },
      ]);
      expect(round(points[0])).toEqual(new Point(0, 0, 0));
      expect(round(points[1])).toEqual(new Point(1, 1, 1));
    });
  });
  describe('normals', () => {
    describe('Copy Linear', () => {
      test('Simple', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: 0,
            num: 1,
            step: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('Two step', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: 0,
            num: 2,
            step: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('X Axis', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: 'x',
            num: 1,
            step: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('Y Axis', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: 'y',
            num: 1,
            step: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('Z Axis', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: 'z',
            num: 1,
            step: 2,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('Angle', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: Math.PI,
            num: 1,
            step: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
      test('Along direction', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            along: [1, 1, 1],
            num: 1,
            step: Math.sqrt(3),
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
      });
    });
    describe('Copy Angle', () => {
      test('Simple', () => {
        const points = copyPoints([[1, 0, 0]], [
          {
            along: 'rotation',
            num: 1,
            step: Math.PI / 2,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 0));
        expect(round(points[1])).toEqual(new Point(0, 1, 0));
      });
      test('ZY', () => {
        const points = copyPoints([[0, 1, 0]], [
          {
            along: 'rotation',
            num: 1,
            step: Math.PI / 2,
            axis: [1, 0, 0],
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(0, 1, 0));
        expect(round(points[1])).toEqual(new Point(0, 0, 1));
      });
      test('Radial', () => {
        const points = copyPoints([[1, 0, 0]], [
          { along: 'y', num: 2, step: 1 },
          {
            along: 'rotation',
            num: 1,
            step: Math.PI / 2,
            start: 1,
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 0));
        expect(round(points[1])).toEqual(new Point(1, 0, 0));
        expect(round(points[2])).toEqual(new Point(1, 0, 0));
        expect(round(points[3])).toEqual(new Point(0, 1, 0));
        expect(round(points[4])).toEqual(new Point(0, 1, 0));
      });
    });
    describe('Copy Transform', () => {
      test('Simple', () => {
        const points = copyPoints([[1, 0, 1]], [
          {
            to: new Transform().translate(1, 0),
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 1));
        expect(round(points[1])).toEqual(new Point(1, 0, 1));
      });
      test('Multi', () => {
        const points = copyPoints([[1, 0, 0]], [
          {
            to: [
              new Transform().translate(1, 0).rotate(Math.PI / 4).rotate(Math.PI / 4),
              new Transform().rotate(Math.PI / 2),
            ],
          },
        ], 'normals');
        expect(round(points[0])).toEqual(new Point(1, 0, 0));
        expect(round(points[1])).toEqual(new Point(0, 1, 0));
        expect(round(points[2])).toEqual(new Point(0, 1, 0));
      });
    });
  });
  describe('Parsable Points and Transforms', () => {
    test('Points', () => {
      const points1 = copyPoints([[0, 0]], [{
        to: [[1, 0], [2, 0], [3, 0]],
      }]);
      const points2 = copyPoints([[0, 0]], [{
        to: [new Point(1, 0), new Point(2, 0), new Point(3, 0)],
      }]);
      const points3 = copyPoints([[0, 0]], [{
        to: [new Point(1, 0), [2, 0], [3, 0]],
      }]);
      const points4 = copyPoints([[0, 0]], [{
        to: [[1, 0], new Point(2, 0), new Point(3, 0)],
      }]);
      expect(round(points1[0])).toEqual(new Point(0, 0));
      expect(round(points1[1])).toEqual(new Point(1, 0));
      expect(round(points1[2])).toEqual(new Point(2, 0));
      expect(round(points1[3])).toEqual(new Point(3, 0));
      expect(round(points1)).toEqual(round(points2));
      expect(round(points1)).toEqual(round(points3));
      expect(round(points1)).toEqual(round(points4));
    });
    test('Transforms', () => {
      const points1 = copyPoints([[0, 0]], [{
        to: [['t', 1, 0], ['t', 2, 0], ['t', 3, 0]],
      }]);
      const points2 = copyPoints([[0, 0]], [{
        to: [new Transform().translate(1, 0), new Transform(['t', 2, 0]), getTransform(['t', 3, 0])],
      }]);
      const points3 = copyPoints([[0, 0]], [{
        to: [['t', 1, 0], new Transform(['t', 2, 0]), getTransform(['t', 3, 0])],
      }]);
      const points4 = copyPoints([[0, 0]], [{
        to: [new Transform().translate(1, 0), ['t', 2, 0], ['t', 3, 0]],
      }]);
      expect(round(points1[0])).toEqual(new Point(0, 0));
      expect(round(points1[1])).toEqual(new Point(1, 0));
      expect(round(points1[2])).toEqual(new Point(2, 0));
      expect(round(points1[3])).toEqual(new Point(3, 0));
      expect(round(points1)).toEqual(round(points2));
      expect(round(points1)).toEqual(round(points3));
      expect(round(points1)).toEqual(round(points4));
    });
    test('Points and Transforms', () => {
      const points1 = copyPoints([[0, 0]], [{
        to: [['t', 1, 0], [2, 0], getTransform(['t', 3, 0])],
      }]);
      const points2 = copyPoints([[0, 0]], [{
        to: [new Point(1, 0), new Transform(['t', 2, 0]), ['t', 3, 0]],
      }]);
      const points3 = copyPoints([[0, 0]], [{
        to: [[1, 0], ['t', 2, 0], ['t', 3, 0]],
      }]);
      const points4 = copyPoints([[0, 0]], [{
        to: [new Transform().translate(1, 0), [2, 0], ['t', 3, 0]],
      }]);
      expect(round(points1[0])).toEqual(new Point(0, 0));
      expect(round(points1[1])).toEqual(new Point(1, 0));
      expect(round(points1[2])).toEqual(new Point(2, 0));
      expect(round(points1[3])).toEqual(new Point(3, 0));
      expect(round(points1)).toEqual(round(points2));
      expect(round(points1)).toEqual(round(points3));
      expect(round(points1)).toEqual(round(points4));
    });
  });
});
