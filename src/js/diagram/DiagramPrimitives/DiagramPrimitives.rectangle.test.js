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
  let corneredRectLineOutside;
  let corneredRectLineInside;
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
    corneredRectLineOutside = [
      -0.9, -0.2, -0.7, -0.4, -1, -0.241, -1, -0.241,
      -0.7, -0.4, -0.741, -0.5, -0.7, -0.4, 0.7, -0.4,
      -0.741, -0.5, -0.741, -0.5, 0.7, -0.4, 0.741, -0.5,
      0.7, -0.4, 0.9, -0.2, 0.741, -0.5, 0.741, -0.5,
      0.9, -0.2, 1, -0.241, 0.9, -0.2, 0.9, 0.2,
      1, -0.241, 1, -0.241, 0.9, 0.2, 1, 0.241,
      0.9, 0.2, 0.7, 0.4, 1, 0.241, 1, 0.241,
      0.7, 0.4, 0.741, 0.5, 0.7, 0.4, -0.7, 0.4,
      0.741, 0.5, 0.741, 0.5, -0.7, 0.4, -0.741, 0.5,
      -0.7, 0.4, -0.9, 0.2, -0.741, 0.5, -0.741, 0.5,
      -0.9, 0.2, -1, 0.241, -0.9, 0.2, -0.9, -0.2,
      -1, 0.241, -1, 0.241, -0.9, -0.2, -1, -0.241,
    ];
    corneredRectLineInside = [
      -1, -0.059, -0.559, -0.5, -1, -0.2, -1, -0.2,
      -0.559, -0.5, -0.7, -0.5, -0.8, -0.4, 0.8, -0.4,
      -0.7, -0.5, -0.7, -0.5, 0.8, -0.4, 0.7, -0.5,
      0.559, -0.5, 1, -0.059, 0.7, -0.5, 0.7, -0.5,
      1, -0.059, 1, -0.2, 0.9, -0.3, 0.9, 0.3,
      1, -0.2, 1, -0.2, 0.9, 0.3, 1, 0.2,
      1, 0.059, 0.559, 0.5, 1, 0.2, 1, 0.2,
      0.559, 0.5, 0.7, 0.5, 0.8, 0.4, -0.8, 0.4,
      0.7, 0.5, 0.7, 0.5, -0.8, 0.4, -0.7, 0.5,
      -0.559, 0.5, -1, 0.059, -0.7, 0.5, -0.7, 0.5,
      -1, 0.059, -1, 0.2, -0.9, 0.3, -0.9, -0.3,
      -1, 0.2, -1, 0.2, -0.9, -0.3, -1, -0.2
    ];
  });
  describe('Filled', () => {
    beforeEach(() => {
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
    test('Update', () => {
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

      r.custom.update({
        width: 4,
        height: 3,
      });
      expect(round(rd.points, 3)).toEqual(corneredRect.map(n => n + n / Math.abs(n)));
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
    });
  });
  describe('Line', () => {
    beforeEach(() => {
      options = {
        inside: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'inside',
            },
            // default is border: 'outline'
          },
        },
        positive: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'positive',
            },
            // default is border: 'outline'
          },
        },
        insideTouchBorderBuffer: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'inside',
            },
            border: 'outline',
            touchBorder: 0.1,
          },
        },
        insideTouchBorderRect: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'inside',
            },
            border: 'outline',
            touchBorder: 'rect',
          },
        },
        outside: {
          options: {
            width: 1.8,
            height: 0.8,
            corner: {
              radius: 0.2,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            // default is border: 'outline'
          },
        },
        negative: {
          options: {
            width: 1.8,
            height: 0.8,
            corner: {
              radius: 0.2,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'negative',
            },
            // default is border: 'outline'
          },
        },
        outsideTouchBuffer: {
          options: {
            width: 1.8,
            height: 0.8,
            corner: {
              radius: 0.2,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            border: 'outline',
            touchBorder: 0.1,
          },
        },
        outsideTouchRect: {
          options: {
            width: 1.8,
            height: 0.8,
            corner: {
              radius: 0.2,
              sides: 1,
            },
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            border: 'outline',
            touchBorder: 'rect',
          },
        },
      };
    });
    test('Inside', () => {
      addElement('inside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
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
    test('Positive', () => {
      addElement('positive');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
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
    test('Inside touch buffer', () => {
      addElement('insideTouchBorderBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
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
    test('Inside touch rect', () => {
      addElement('insideTouchBorderRect');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
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
    test('Outside', () => {
      addElement('outside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Negative touch rect', () => {
      addElement('negative');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Outside touch buffer', () => {
      addElement('outsideTouchBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1.1, -0.4], [-0.9, -0.6], [0.9, -0.6],
        [1.1, -0.4], [1.1, 0.4], [0.9, 0.6],
        [-0.9, 0.6], [-1.1, 0.4],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Outside touch rect', () => {
      addElement('outsideTouchRect');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-1, -0.3], [-0.8, -0.5], [0.8, -0.5],
        [1, -0.3], [1, 0.3], [0.8, 0.5],
        [-0.8, 0.5], [-1, 0.3],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(rd.hole).toEqual([]);
    });
    test('Update', () => {
      addElement('inside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
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
      r.custom.update({
        width: 4,
        height: 3,
      });
      expect(round(rd.points, 3))
        .toEqual(corneredRectLineInside.map(n => round(n + n / Math.abs(n), 3)));
      expect(round(rd.border, 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(round(rd.touchBorder, 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(rd.hole).toEqual([]);
    });
  });
});
