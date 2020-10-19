import {
  getPoints,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

describe('Polyline', () => {
  let diagram;
  let addElement;
  let p;
  let pd;
  let options;
  let diamond;
  let square;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (optionsName) => {
      diagram.addElement(joinObjects({
        name: 'p',
        method: 'shapes.polygon',
      }, options[optionsName]));
      diagram.initialize();
      p = diagram.elements._p;
      pd = p.drawingObject;
    };
    square = [
      0, 0, -1, 1, 1, 1,
      0, 0, -1, -1, -1, 1,
      0, 0, 1, -1, -1, -1,
      0, 0, 1, 1, 1, -1,
    ];
    diamond = [
      0, 0, 0, 1, 1, 0, 0, 0,
      -1, 0, 0, 1, 0, 0, 0, -1,
      -1, 0, 0, 0, 1, 0, 0, -1,
    ];
  });
  describe.only('Filled', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            // default is border: 'outline'
          },
        },
        borderRect: {
          options: {
            radius: 1,
            border: 'rect',
          },
        },
        touchBorderRect: {
          options: {
            radius: 1,
            touchBorder: 'rect',
          },
        },
        touchBorderBuffer: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            touchBorder: 0.1,
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(square);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Border Rect', () => {
      addElement('borderRect');
      expect(round(pd.points, 3)).toEqual(diamond);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Touch Border Rect', () => {
      addElement('touchBorderRect');
      expect(round(pd.points, 3)).toEqual(diamond);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1, 0], [0, 1], [-1, 0], [0, -1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Touch Border Buffer', () => {
      addElement('touchBorderBuffer');
      expect(round(pd.points, 3)).toEqual(square);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
  });
  describe('Closed Triangle', () => {
    beforeEach(() => {
      options = {
        lineBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            // default is border: 'line'
          },
        },
        outsideBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            border: 'negative',
          },
        },
        insideBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            border: 'positive',
          },
        },
        rectBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            border: 'rect',
          },
        },
        touchRectBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            touchBorder: 'rect',
          },
        },
        bufferBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            touchBorder: 0.1,
          },
        },
        dashedBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            dash: [0.3, 0.3],
          },
        },
      };
    });
    test('Default Border', () => {
      addElement('lineBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.border[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.border[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.touchBorder[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.touchBorder[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('outside Border', () => {
      addElement('outsideBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, 1.241],
        [-0.1, -0.1],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, 1.241],
        [-0.1, -0.1],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('inside Border', () => {
      addElement('insideBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [0.1, 0.1],
        [0.759, 0.1],
        [0.759, 0.1],
        [0.1, 0.759],
        [0.1, 0.759],
        [0.1, 0.1],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [0.1, 0.1],
        [0.759, 0.1],
        [0.759, 0.1],
        [0.1, 0.759],
        [0.1, 0.759],
        [0.1, 0.1],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('Rect Border', () => {
      addElement('rectBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('Touch Rect Border', () => {
      addElement('touchRectBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.border[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.border[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('Buffer Border', () => {
      addElement('bufferBorder');
      expect(round(pd.points, 3)).toEqual([
        0.1, 0.1, 0.759, 0.1, -0.1, -0.1,
        -0.1, -0.1, 0.759, 0.1, 1.241, -0.1,
        0.759, 0.1, 0.1, 0.759, 1.241, -0.1,
        1.241, -0.1, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.1, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.1, -0.1, -0.1,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.border[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.border[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.2, -0.2],
        [1.483, -0.2],
        [0.517, 0.2],
        [0.2, 0.2],
      ]));
      expect(round(pd.touchBorder[1], 3)).toEqual(getPoints([
        [1.483, -0.2],
        [-0.2, 1.483],
        [0.2, 0.517],
        [0.517, 0.2],
      ]));
      expect(round(pd.touchBorder[2], 3)).toEqual(getPoints([
        [-0.2, 1.483],
        [-0.2, -0.2],
        [0.2, 0.2],
        [0.2, 0.517],
      ]));

      expect(pd.hole).toEqual([]);
    });
    test('Dashed Border', () => {
      addElement('dashedBorder');
      expect(round(pd.points, 3)).toEqual([
        0, 0.1, 0.3, 0.1, 0, -0.1,
        0, -0.1, 0.3, 0.1, 0.3, -0.1,
        0.6, 0.1, 0.9, 0.1, 0.6, -0.1,
        0.6, -0.1, 0.9, 0.1, 0.9, -0.1,
        0.788, 0.071, 0.576, 0.283, 0.929, 0.212,
        0.929, 0.212, 0.576, 0.283, 0.717, 0.424,
        0.364, 0.495, 0.151, 0.707, 0.505, 0.636,
        0.505, 0.636, 0.151, 0.707, 0.293, 0.849,
        -0.061, 0.919, 0.1, 0.759, 0.081, 1.061,
        0.081, 1.061, 0.1, 0.759, -0.1, 1.241,
        0.1, 0.759, 0.1, 0.714, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.714, -0.1, 0.714,
        0.1, 0.414, 0.1, 0.114, -0.1, 0.414,
        -0.1, 0.414, 0.1, 0.114, -0.1, 0.114,
      ]);

      expect(round(pd.border[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.border[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.border[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(round(pd.touchBorder[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [0.759, 0.1],
        [0.1, 0.1],
      ]));
      expect(round(pd.touchBorder[1], 3)).toEqual(getPoints([
        [1.241, -0.1],
        [-0.1, 1.241],
        [0.1, 0.759],
        [0.759, 0.1],
      ]));
      expect(round(pd.touchBorder[2], 3)).toEqual(getPoints([
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
      ]));

      expect(pd.hole).toEqual([]);
    });
  });
});
