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
  let midLineSquare;
  let insideLineSquare;
  let outsideLineSquare;
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
      1, 0.9, -1, 0.9, 1, 1,
      1, 1, -1, 0.9, -1, 1,
      -0.9, 1, -0.9, -1, -1, 1,
      -1, 1, -0.9, -1, -1, -1,
      -1, -0.9, 1, -0.9, -1, -1,
      -1, -1, 1, -0.9, 1, -1,
      0.9, -1, 0.9, 1, 1, -1,
      1, -1, 0.9, 1, 1, 1,
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
  describe('Line', () => {
    // Border: rect
    // TouchBorder: buffer, rect
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
            border: 'outline',
          },
        },
        linePositiveBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'positive' },
            border: 'outline',
          },
        },
        lineOutsideBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'outside' },
            border: 'outline',
          },
        },
        lineNegativeBorderOutline: {
          options: {
            radius: 1 * Math.sqrt(2),
            rotation: Math.PI / 4,
            line: { width: 0.1, widthIs: 'negative' },
            border: 'outline',
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(pd.points, 3)).toEqual(midLineSquare);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1.05, 1.05], [-1.05, 1.05], [-1.05, -1.05], [1.05, -1.05],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Line inside, border outline', () => {
      addElement('lineInsideBorderOutline');
      expect(round(pd.points, 3)).toEqual(insideLineSquare);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Line positive, border outline', () => {
      addElement('linePositiveBorderOutline');
      expect(round(pd.points, 3)).toEqual(insideLineSquare);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1, 1], [-1, 1], [-1, -1], [1, -1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Line outside, border outline', () => {
      addElement('lineOutsideBorderOutline');
      expect(round(pd.points, 3)).toEqual(outsideLineSquare);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
    test('Line negative, border outline', () => {
      addElement('lineNegativeBorderOutline');
      expect(round(pd.points, 3)).toEqual(outsideLineSquare);
      expect(round(pd.border, 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(round(pd.touchBorder, 3)).toEqual([getPoints([
        [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1], [1.1, -1.1],
      ])]);
      expect(pd.hole).toEqual([]);
    });
  });
});
