import {
  getPoints,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

describe('Polyline', () => {
  let figure;
  let addElement;
  let p;
  let pd;
  let options;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      figure.add(joinObjects({
        name: 'p',
        make: 'shapes.polyline',
      }, options[optionsName]));
      figure.initialize();
      p = figure.elements._p;
      pd = p.drawingObject;
    };
  });
  describe('Straight Line', () => {
    beforeEach(() => {
      options = {
        lineBorder: {
          options: {
            points: [[0, 0], [1, 0]],
            width: 0.2,
          },
        },
        lineBorderWithBuffer: {
          options: {
            points: [[0, 0], [1, 0]],
            width: 0.2,
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
        customBorder: {
          options: {
            points: [[0, 0], [1, 0]],
            width: 0.2,
            border: [[[-0.1, -0.5], [1.1, -0.5], [1.1, 0.5], [-0.1, 0.5]]],
            touchBorder: [[[-0.2, -0.6], [1.2, -0.6], [1.2, 0.6], [-0.2, 0.6]]],
          },
        },
      };
    });
    test('Default Border', () => {
      addElement('lineBorder');
      expect(round(pd.points)).toEqual([
        0, 0.1,
        1, 0.1,
        0, -0.1,
        0, -0.1,
        1, 0.1,
        1, -0.1,
      ]);
      expect(round(p.getBorder('draw', 'border'))).toEqual([getPoints([
        [0, -0.1], [1, -0.1], [1, 0.1], [0, 0.1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'))).toEqual([getPoints([
        [0, -0.1], [1, -0.1], [1, 0.1], [0, 0.1],
      ])]);
    });
    test('Buffer Border', () => {
      addElement('lineBorderWithBuffer');
      expect(round(pd.points)).toEqual([
        0, 0.1,
        1, 0.1,
        0, -0.1,
        0, -0.1,
        1, 0.1,
        1, -0.1,
      ]);
      expect(round(p.getBorder('draw', 'border'))).toEqual([getPoints([
        [0, -0.1], [1, -0.1], [1, 0.1], [0, 0.1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'))).toEqual([getPoints([
        [-0.1, -0.2], [1.1, -0.2], [1.1, 0.2], [-0.1, 0.2],
      ])]);
    });
    test('Custom Border', () => {
      addElement('customBorder');
      expect(round(pd.points)).toEqual([
        0, 0.1,
        1, 0.1,
        0, -0.1,
        0, -0.1,
        1, 0.1,
        1, -0.1,
      ]);
      expect(round(p.getBorder('draw', 'border'))).toEqual([getPoints([
        [-0.1, -0.5], [1.1, -0.5], [1.1, 0.5], [-0.1, 0.5],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'))).toEqual([getPoints([
        [-0.2, -0.6], [1.2, -0.6], [1.2, 0.6], [-0.2, 0.6],
      ])]);
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
            drawBorder: 'negative',
          },
        },
        insideBorder: {
          options: {
            points: [[0, 0], [1, 0], [0, 1]],
            width: 0.2,
            close: true,
            drawBorder: 'positive',
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
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
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

      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);

      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);
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
      expect(round(p.getBorder('draw', 'border')[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
      ]));

      expect(round(p.getBorder('draw', 'touchBorder')[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
      ]));
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

      expect(round(p.getBorder('draw', 'border')[0], 3)).toEqual(getPoints([
        [0.1, 0.1],
        [0.759, 0.1],
        [0.1, 0.759],
      ]));

      expect(round(p.getBorder('draw', 'touchBorder')[0], 3)).toEqual(getPoints([
        [0.1, 0.1],
        [0.759, 0.1],
        [0.1, 0.759],
      ]));
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

      expect(round(p.getBorder('draw', 'border')[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ]));

      expect(round(p.getBorder('draw', 'touchBorder')[0], 3)).toEqual(getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ]));
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

      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);

      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [1.241, 1.241],
        [-0.1, 1.241],
      ])]);
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

      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);

      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-0.2, -0.2],
        [1.483, -0.2],
        [-0.2, 1.483],
        [-0.2, -0.2],
        [0.2, 0.2],
        [0.2, 0.517],
        [0.517, 0.2],
        [0.2, 0.2],
      ])]);
    });
    test('Dashed Border', () => {
      addElement('dashedBorder');
      expect(round(pd.points, 3)).toEqual([
        0, 0.1, 0.3, 0.1, 0, -0.1, 0, -0.1,
        0.3, 0.1, 0.3, -0.1, 0.6, 0.1, 0.9, 0.1,
        0.6, -0.1, 0.6, -0.1, 0.9, 0.1, 0.9, -0.1,
        0.788, 0.071, 0.576, 0.283, 0.929, 0.212, 0.929, 0.212,
        0.576, 0.283, 0.717, 0.424, 0.364, 0.495, 0.151, 0.707,
        0.505, 0.636, 0.505, 0.636, 0.151, 0.707, 0.293, 0.849,
        -0.061, 0.919, -0.071, 0.929, 0.081, 1.061, 0.081, 1.061,
        -0.071, 0.929, -0.1, 1.241, -0.071, 0.929, 0.1, 1,
        -0.1, 1.241, 0.1, 1, 0.1, 0.714, -0.1, 1.241,
        -0.1, 1.241, 0.1, 0.714, -0.1, 0.714, 0.1, 0.414,
        0.1, 0.114, -0.1, 0.414, -0.1, 0.414, 0.1, 0.114,
        -0.1, 0.114,
      ]);

      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);

      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-0.1, -0.1],
        [1.241, -0.1],
        [-0.1, 1.241],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, 0.759],
        [0.759, 0.1],
        [0.1, 0.1],
      ])]);
      // expect(round(p.getBorder('draw', 'border')[0], 3)).toEqual(getPoints([
      //   [-0.1, -0.1],
      //   [1.241, -0.1],
      //   [0.759, 0.1],
      //   [0.1, 0.1],
      // ]));
      // expect(round(p.getBorder('draw', 'border')[1], 3)).toEqual(getPoints([
      //   [1.241, -0.1],
      //   [-0.1, 1.241],
      //   [0.1, 0.759],
      //   [0.759, 0.1],
      // ]));
      // expect(round(p.getBorder('draw', 'border')[2], 3)).toEqual(getPoints([
      //   [-0.1, 1.241],
      //   [-0.1, -0.1],
      //   [0.1, 0.1],
      //   [0.1, 0.759],
      // ]));

      // expect(round(p.getBorder('draw', 'touchBorder')[0], 3)).toEqual(getPoints([
      //   [-0.1, -0.1],
      //   [1.241, -0.1],
      //   [0.759, 0.1],
      //   [0.1, 0.1],
      // ]));
      // expect(round(p.getBorder('draw', 'touchBorder')[1], 3)).toEqual(getPoints([
      //   [1.241, -0.1],
      //   [-0.1, 1.241],
      //   [0.1, 0.759],
      //   [0.759, 0.1],
      // ]));
      // expect(round(p.getBorder('draw', 'touchBorder')[2], 3)).toEqual(getPoints([
      //   [-0.1, 1.241],
      //   [-0.1, -0.1],
      //   [0.1, 0.1],
      //   [0.1, 0.759],
      // ]));
    });
  });
});
