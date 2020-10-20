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
  let r;
  let rd;
  let options;
  let corneredRect;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (optionsName) => {
      diagram.addElement(joinObjects({
        name: 'r',
        method: 'shapes.rectangle',
      }, options[optionsName]));
      diagram.initialize();
      r = diagram.elements._r;
      rd = r.drawingObject;
    };
    corneredRect = [
      -1, -0.2, -0.7, -0.5, 0.7, -0.5, -1,
      -0.2, -0.7, -0.5, 0.7, -0.5, -1, -0.2,
      0.7, -0.5, 1, -0.2, -1, -0.2, 1,
      -0.2, 1, 0.2, -1, -0.2, 1, 0.2,
      0.7, 0.5, -1, -0.2, 0.7, 0.5, -0.7,
      0.5, -1, -0.2, -0.7, 0.5, -1, 0.2,
    ];
  });
  describe('Filled', () => {
    beforeEach(() => {
      // border 'outline', 'rect'
      // touchBorder 'border', buffer, 'rect'
      options = {
        default: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            // default is border: 'outline'
          },
        },
        rectBorder: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            border: 'rect',
          },
        },
        touchBorderRect: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            border: 'outline',
            touchBorder: 'rect',
          },
        },
        touchBorderBuffer: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            border: 'outline',
            touchBorder: 0.1,
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Rect border', () => {
      addElement('rectBorder');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Touch border rect', () => {
      addElement('touchBorderRect');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Touch border buffer', () => {
      addElement('touchBorderBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1.1, -0.3], [-0.8, -0.6], [0.8, -0.6],
        [1.1, -0.3], [1.1, 0.3], [0.8, 0.6],
        [-0.8, 0.6], [-1.1, 0.3],
      ])]);
      expect(rd.hole).toEqual([]);
    });
  });
  describe('Line', () => {
  });
});
