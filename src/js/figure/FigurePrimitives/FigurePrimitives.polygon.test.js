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
  let diamond;
  let square;
  let midLineSquare;
  let insideLineSquare;
  let outsideLineSquare;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      figure.add(joinObjects({
        name: 'p',
        make: 'shapes.polygon',
      }, options[optionsName]));
      figure.initialize();
      p = figure.elements._p;
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
    midLineSquare = [
      0.95, 0.95, -0.95, 0.95, 1.05, 1.05,
      1.05, 1.05, -0.95, 0.95, -1.05, 1.05,
      -0.95, 0.95, -0.95, -0.95, -1.05, 1.05,
      -1.05, 1.05, -0.95, -0.95, -1.05, -1.05,
      -0.95, -0.95, 0.95, -0.95, -1.05, -1.05,
      -1.05, -1.05, 0.95, -0.95, 1.05, -1.05,
      0.95, -0.95, 0.95, 0.95, 1.05, -1.05,
      1.05, -1.05, 0.95, 0.95, 1.05, 1.05,
    ];

    insideLineSquare = [
      0.9, 0.9, -0.9, 0.9, 1, 1, 1, 1,
      -0.9, 0.9, -1, 1, -0.9, 0.9, -0.9, -0.9,
      -1, 1, -1, 1, -0.9, -0.9, -1, -1,
      -0.9, -0.9, 0.9, -0.9, -1, -1, -1, -1,
      0.9, -0.9, 1, -1, 0.9, -0.9, 0.9, 0.9,
      1, -1, 1, -1, 0.9, 0.9, 1, 1,
    ];
    outsideLineSquare = [
      1, 1, -1, 1, 1.1, 1.1,
      1.1, 1.1, -1, 1, -1.1, 1.1,
      -1, 1, -1, -1, -1.1, 1.1,
      -1.1, 1.1, -1, -1, -1.1, -1.1,
      -1, -1, 1, -1, -1.1, -1.1,
      -1.1, -1.1, 1, -1, 1.1, -1.1,
      1, -1, 1, 1, 1.1, -1.1,
      1.1, -1.1, 1, 1, 1.1, 1.1,
    ];
  });
  describe('Filled', () => {
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
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(square);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
    });
    test('Border Rect', () => {
      addElement('borderRect');
      expect(round(pd.points, 3)).toEqual(diamond);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
    });
    test('Touch Border Rect', () => {
      addElement('touchBorderRect');
      expect(round(pd.points, 3)).toEqual(diamond);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 0], [0, 1], [-1, 0], [0, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
    });
    test('Touch Border Buffer', () => {
      addElement('touchBorderBuffer');
      expect(round(pd.points, 3)).toEqual(square);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.070, -1.1],
        [1.1, -1.070],
        [1.1, 1.070],
        [1.070, 1.1],
        [-1.070, 1.1],
        [-1.1, 1.070],
        [-1.1, -1.070],
        [-1.070, -1.1],
      ])]);
    });
    test('Update', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(square);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);

      p.custom.updatePoints({ radius: 2 * Math.sqrt(2) });
      expect(round(pd.points, 3)).toEqual([
        0, 0, -2, 2, 2, 2,
        0, 0, -2, -2, -2, 2,
        0, 0, 2, -2, -2, -2,
        0, 0, 2, 2, 2, -2,
      ]);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [2, 2], [-2, 2], [-2, -2], [2, -2],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [2, 2], [-2, 2], [-2, -2], [2, -2],
      ])]);
    });
  });
  describe('Line', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1 }, // default widthIs: 'mid'
            // default is border: 'outline'
          },
        },
        lineInsideBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'inside' },
            // border: 'outline',
          },
        },
        linePositiveBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'positive' },
            // border: 'outline',
          },
        },
        lineOutsideBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'outside' },
            // border: 'outline',
          },
        },
        lineNegativeBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'negative' },
            // border: 'outline',
          },
        },
        midLineTouchBuffer: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'mid' },
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
        insideLineTouchBuffer: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'inside' },
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
        outsideLineTouchBuffer: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'outside' },
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
        midLineBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'mid' },
            border: 'rect',
          },
        },
        outsideLineBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'outside' },
            border: 'rect',
          },
        },
        insideLineBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'inside' },
            border: 'rect',
          },
        },
        midLineTouchBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'mid' },
            touchBorder: 'rect',
          },
        },
        outsideLineTouchBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'outside' },
            touchBorder: 'rect',
          },
        },
        insideLineTouchBorderRect: {
          options: {
            radius: 1,
            line: { width: 0.1, widthIs: 'inside' },
            touchBorder: 'rect',
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(midLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
    });
    test('Line inside, border outline', () => {
      addElement('lineInsideBorderOutline');
      expect(round(pd.points, 3)).toEqual(insideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
    });
    test('Line positive, border outline', () => {
      addElement('linePositiveBorderOutline');
      expect(round(pd.points, 3)).toEqual(insideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
    });
    test('Line outside, border outline', () => {
      addElement('lineOutsideBorderOutline');
      expect(round(pd.points, 3)).toEqual(outsideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
    });
    test('Line negative, border outline', () => {
      addElement('lineNegativeBorderOutline');
      expect(round(pd.points, 3)).toEqual(outsideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
    });
    test('Line mid, touch buffer', () => {
      addElement('midLineTouchBuffer');
      expect(round(pd.points, 3)).toEqual(midLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.12, -1.15],
        [1.15, -1.12],
        [1.15, 1.12],
        [1.12, 1.15],
        [-1.12, 1.15],
        [-1.15, 1.12],
        [-1.15, -1.12],
        [-1.12, -1.15],
      ])]);
    });
    test('Line outside, touch buffer', () => {
      addElement('outsideLineTouchBuffer');
      expect(round(pd.points, 3)).toEqual(outsideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.17, -1.2],
        [1.2, -1.17],
        [1.2, 1.17],
        [1.17, 1.2],
        [-1.17, 1.2],
        [-1.2, 1.17],
        [-1.2, -1.17],
        [-1.17, -1.2],
      ])]);
    });
    test('Line inside, touch buffer', () => {
      addElement('insideLineTouchBuffer');
      expect(round(pd.points, 3)).toEqual(insideLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.07, -1.1],
        [1.1, -1.07],
        [1.1, 1.07],
        [1.07, 1.1],
        [-1.07, 1.1],
        [-1.1, 1.07],
        [-1.1, -1.07],
        [-1.07, -1.1],
      ])]);
    });
    test('Mid line border rect', () => {
      addElement('midLineBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1.071, -1.071], [1.071, -1.071], [1.071, 1.071], [-1.071, 1.071],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.071, -1.071], [1.071, -1.071], [1.071, 1.071], [-1.071, 1.071],
      ])]);
    });
    test('Outside line border rect', () => {
      addElement('outsideLineBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1.141, -1.141], [1.141, -1.141], [1.141, 1.141], [-1.141, 1.141],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.141, -1.141], [1.141, -1.141], [1.141, 1.141], [-1.141, 1.141],
      ])]);
    });
    test('Inside line border rect', () => {
      addElement('insideLineBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
    });
    test('Mid line touch border rect', () => {
      addElement('midLineTouchBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.071, 0], [0, 1.071], [-1.071, 0], [0, -1.071],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.071, -1.071], [1.071, -1.071], [1.071, 1.071], [-1.071, 1.071],
      ])]);
    });
    test('Outside line touch border rect', () => {
      addElement('outsideLineTouchBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.141, 0], [0, 1.141], [-1.141, 0], [0, -1.141],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.141, -1.141], [1.141, -1.141], [1.141, 1.141], [-1.141, 1.141],
      ])]);
    });
    test('Inside line touch border rect', () => {
      addElement('insideLineTouchBorderRect');
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1, 0], [0, 1], [-1, 0], [0, -1],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -1], [1, -1], [1, 1], [-1, 1],
      ])]);
    });
    test('Update', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(midLineSquare);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);

      p.custom.updatePoints({ radius: 2 * Math.sqrt(2) });

      expect(round(pd.points, 3)).toEqual([
        1.95, 1.95, -1.95, 1.95, 2.05, 2.05,
        2.05, 2.05, -1.95, 1.95, -2.05, 2.05,
        -1.95, 1.95, -1.95, -1.95, -2.05, 2.05,
        -2.05, 2.05, -1.95, -1.95, -2.05, -2.05,
        -1.95, -1.95, 1.95, -1.95, -2.05, -2.05,
        -2.05, -2.05, 1.95, -1.95, 2.05, -2.05,
        1.95, -1.95, 1.95, 1.95, 2.05, -2.05,
        2.05, -2.05, 1.95, 1.95, 2.05, 2.05,
      ]);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [2.05, 2.05], [-2.05, 2.05], [-2.05, -2.05], [2.05, -2.05],
      ])]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [2.05, 2.05], [-2.05, 2.05], [-2.05, -2.05], [2.05, -2.05],
      ])]);
    });
  });
});
