import {
  Point, Transform,
} from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

describe('Generic', () => {
  let figure;
  let addElement;
  let g;
  let gd;
  beforeEach(() => {
    figure = makeFigure();
    const options = {
      defaultBorder: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
        },
      },
      pointsBorder: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: 'points',
        },
      },
      pointsBorderRectTouchBorder: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: 'points',
          touchBorder: 'rect',
        },
      },
      noTouchBorder: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: 'points',
          touchBorder: 'none',
        },
      },
      customBorder: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: [[[0, 0], [0.5, 0], [0, 0.5]]],
        },
      },
      hole: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: 'points',
          holeBorder: [[[0, 0], [0.5, 0], [0, 0.5]]],
        },
      },
      color: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          color: [0, 0, 1, 1],
        },
      },
      transform: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          transform: [['s', 2, 3], ['r', 4]],
        },
      },
      position: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          transform: [['s', 2, 3], ['r', 4], ['t', 7, 8]],
          position: [2, 3],
        },
      },
      update: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          border: 'points',
          touchBorder: 'border',
          hole: 'none',
        },
      },
    };
    addElement = (optionsName) => {
      figure.add(joinObjects({
        name: 'g',
        method: 'generic',
      }, options[optionsName]));
      figure.initialize();
      g = figure.elements._g;
      gd = g.drawingObject;
    };
  });
  test('Default Border', () => {
    addElement('defaultBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1),
    ]]);
    expect(gd.hole).toEqual([]);
  });
  test('Points Border', () => {
    addElement('pointsBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.hole).toEqual([]);
  });
  test('Points border, rect touch border', () => {
    addElement('pointsBorderRectTouchBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1),
    ]]);
    expect(gd.hole).toEqual([]);
  });
  test('No touch border', () => {
    addElement('noTouchBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([]);
    expect(gd.hole).toEqual([]);
  });
  test('Custom touch border', () => {
    addElement('customBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(0.5, 0),
      new Point(0, 0.5),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(0.5, 0),
      new Point(0, 0.5),
    ]]);
    expect(gd.hole).toEqual([]);
  });
  test('Hole border', () => {
    addElement('hole');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.hole).toEqual([[
      new Point(0, 0),
      new Point(0.5, 0),
      new Point(0, 0.5),
    ]]);
  });
  test('Color', () => {
    addElement('color');
    expect(g.color).toEqual([0, 0, 1, 1]);
  });
  test('Transform', () => {
    addElement('transform');
    expect(g.transform).toEqual(new Transform().scale(2, 3).rotate(4));
  });
  test('Position', () => {
    addElement('position');
    expect(g.transform.t()).toEqual(new Point(2, 3));
  });
  test('Update', () => {
    addElement('update');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(gd.border).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(gd.hole).toEqual([]);

    g.custom.update(
      [[1, 1], [2, 1], [1, 2]],
      'points',
      'rect',
      'none',
    );

    expect(gd.points).toEqual([
      1, 1,
      2, 1,
      1, 2,
    ]);
    expect(gd.border).toEqual([[
      new Point(1, 1),
      new Point(2, 1),
      new Point(1, 2),
    ]]);
    expect(gd.touchBorder).toEqual([[
      new Point(1, 1),
      new Point(2, 1),
      new Point(2, 2),
      new Point(1, 2),
    ]]);
    expect(gd.hole).toEqual([]);
  });
});
