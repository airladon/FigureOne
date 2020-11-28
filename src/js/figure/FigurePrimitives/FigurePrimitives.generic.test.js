import {
  Point, Transform,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
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
      borderParametric: {
        options: {
          points: [[0, 0], [1, 0], [0, 1]],
          drawBorderBuffer: [[-0.1, -0.1], [1.1, -0.1], [-0.1, 1.1]],
        },
      },
      // customBorder: {
      //   options: {
      //     points: [[0, 0], [1, 0], [1, 1], [1, 0]],
      //   },
      // },
      // pointsBorder: {
      //   options: {
      //     points: [[0, 0], [1, 0], [0, 1]],
      //     border: 'points',
      //   },
      // },
      // pointsBorderRectTouchBorder: {
      //   options: {
      //     points: [[0, 0], [1, 0], [0, 1]],
      //     border: 'points',
      //     touchBorder: 'rect',
      //   },
      // },
      // noTouchBorder: {
      //   options: {
      //     points: [[0, 0], [1, 0], [0, 1]],
      //     border: 'points',
      //     touchBorder: 'none',
      //   },
      // },
      // customBorder: {
      //   options: {
      //     points: [[0, 0], [1, 0], [0, 1]],
      //     border: [[[0, 0], [0.5, 0], [0, 0.5]]],
      //   },
      // },
      // hole: {
      //   options: {
      //     points: [[0, 0], [1, 0], [0, 1]],
      //     border: 'points',
      //     holeBorder: [[[0, 0], [0.5, 0], [0, 0.5]]],
      //   },
      // },
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
  test('Default Border border', () => {
    addElement('defaultBorder');
    expect(gd.points).toEqual([
      0, 0,
      1, 0,
      0, 1,
    ]);
    expect(g.getBorder('draw', 'border')).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(g.getBorder('draw', 'touchBorder')).toEqual([[
      new Point(0, 0),
      new Point(1, 0),
      new Point(0, 1),
    ]]);
    expect(g.getBorder('draw', 'holeBorder')).toEqual([[]]);
  });
  describe.only('Different Borders', () => {
    let tri;
    let rect;
    let buffer;
    let rectBuffer;
    let borderBuffer;
    beforeEach(() => {
      tri = [new Point(0, 0), new Point(1, 0), new Point(0, 1)];
      rect = [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)];
      rectBuffer = [
        new Point(-0.1, -0.1), new Point(1.1, -0.1), new Point(1.1, 1.1), new Point(-0.1, 1.1),
      ];
      borderBuffer = [new Point(-0.1, -0.1), new Point(1.1, -0.1), new Point(-0.1, 1.1)];
      buffer = 0.1;
      addElement('borderParametric');
    });
    test('border: draw', () => {
      g.border = 'draw';
      expect(round(g.getBorder('draw', 'border')[0])).toEqual(tri);
    });
    test('border: rect', () => {
      g.border = 'rect';
      expect(round(g.getBorder('draw', 'border')[0])).toEqual(rect);
    });
    test('border: number', () => {
      g.border = buffer;
      expect(round(g.getBorder('draw', 'border')[0])).toEqual(rectBuffer);
    });
    test('border: buffer', () => {
      g.border = 'buffer';
      expect(round(g.getBorder('draw', 'border')[0])).toEqual(borderBuffer);
    });
    test('border: custom', () => {
      g.border = [[new Point(0, 0)]];
      expect(round(g.getBorder('draw', 'border')[0])).toEqual([new Point(0, 0)]);
    });
    test('touchBorder: draw', () => {
      g.touchBorder = 'draw';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(tri);
    });
    test('touchBorder: rect', () => {
      g.touchBorder = 'rect';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(rect);
    });
    test('touchBorder: number', () => {
      g.touchBorder = buffer;
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(rectBuffer);
    });
    test('touchBorder: buffer', () => {
      g.touchBorder = 'buffer';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(borderBuffer);
    });
    test('touchBorder: border (draw)', () => {
      g.border = 'draw';
      g.touchBorder = 'border';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(tri);
    });
    test('touchBorder: border (rect)', () => {
      g.border = 'rect';
      g.touchBorder = 'border';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(rect);
    });
    test('touchBorder: border (number)', () => {
      g.border = buffer;
      g.touchBorder = 'border';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(rectBuffer);
    });
    test('touchBorder: border (buffer)', () => {
      g.border = 'buffer';
      g.touchBorder = 'border';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual(borderBuffer);
    });
    test('touchBorder: border (custom)', () => {
      g.border = [[new Point(0, 0)]];
      g.touchBorder = 'border';
      expect(round(g.getBorder('draw', 'touchBorder')[0])).toEqual([new Point(0, 0)]);
    });
    test('hole: default', () => {
      expect(round(g.getBorder('draw', 'holeBorder')[0])).toEqual([]);
    });
    test('hole: custom', () => {
      g.holeBorder = [[new Point(0, 0)]];
      expect(round(g.getBorder('draw', 'holeBorder')[0])).toEqual([new Point(0, 0)]);
    });
  });
  // test('Points Border', () => {
  //   addElement('pointsBorder');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.hole).toEqual([]);
  // });
  // test('Points border, rect touch border', () => {
  //   addElement('pointsBorderRectTouchBorder');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(1, 1),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.hole).toEqual([]);
  // });
  // test('No touch border', () => {
  //   addElement('noTouchBorder');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([]);
  //   expect(gd.hole).toEqual([]);
  // });
  // test('Custom touch border', () => {
  //   addElement('customBorder');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(0.5, 0),
  //     new Point(0, 0.5),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(0, 0),
  //     new Point(0.5, 0),
  //     new Point(0, 0.5),
  //   ]]);
  //   expect(gd.hole).toEqual([]);
  // });
  // test('Hole border', () => {
  //   addElement('hole');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.hole).toEqual([[
  //     new Point(0, 0),
  //     new Point(0.5, 0),
  //     new Point(0, 0.5),
  //   ]]);
  // });
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
  // test('Update', () => {
  //   addElement('update');
  //   expect(gd.points).toEqual([
  //     0, 0,
  //     1, 0,
  //     0, 1,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(0, 0),
  //     new Point(1, 0),
  //     new Point(0, 1),
  //   ]]);
  //   expect(gd.hole).toEqual([]);

  //   g.custom.update(
  //     [[1, 1], [2, 1], [1, 2]],
  //     'points',
  //     'rect',
  //     'none',
  //   );

  //   expect(gd.points).toEqual([
  //     1, 1,
  //     2, 1,
  //     1, 2,
  //   ]);
  //   expect(gd.border).toEqual([[
  //     new Point(1, 1),
  //     new Point(2, 1),
  //     new Point(1, 2),
  //   ]]);
  //   expect(gd.touchBorder).toEqual([[
  //     new Point(1, 1),
  //     new Point(2, 1),
  //     new Point(2, 2),
  //     new Point(1, 2),
  //   ]]);
  //   expect(gd.hole).toEqual([]);
  // });
});
