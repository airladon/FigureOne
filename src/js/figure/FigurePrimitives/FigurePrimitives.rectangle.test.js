import {
  getPoints, Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

describe('Polyline', () => {
  let figure;
  let addElement;
  let r;
  let rd;
  let options;
  let corneredRect;
  let corneredRectLineOutside;
  let corneredRectLineInside;
  let corneredRectLineMid;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      figure.add(joinObjects({
        name: 'r',
        method: 'rectangle',
      }, options[optionsName]));
      figure.initialize();
      r = figure.elements._r;
      rd = r.drawingObject;
    };
    corneredRect = [
      -1, -0.2, -0.7, -0.5, 0.7, -0.5, -1,
      -0.2, 0.7, -0.5, 1, -0.2, -1, -0.2,
      1, -0.2, 1, 0.2, -1, -0.2, 1,
      0.2, 0.7, 0.5, -1, -0.2, 0.7, 0.5,
      -0.7, 0.5, -1, -0.2, -0.7, 0.5, -1,
      0.2,
    ];
    corneredRectLineMid = [
      -0.9, -0.159, -0.659, -0.4, -1.1, -0.241, -1.1, -0.241,
      -0.659, -0.4, -0.741, -0.6, -0.659, -0.4, 0.659, -0.4,
      -0.741, -0.6, -0.741, -0.6, 0.659, -0.4, 0.741, -0.6,
      0.659, -0.4, 0.9, -0.159, 0.741, -0.6, 0.741, -0.6,
      0.9, -0.159, 1.1, -0.241, 0.9, -0.159, 0.9, 0.159,
      1.1, -0.241, 1.1, -0.241, 0.9, 0.159, 1.1, 0.241,
      0.9, 0.159, 0.659, 0.4, 1.1, 0.241, 1.1, 0.241,
      0.659, 0.4, 0.741, 0.6, 0.659, 0.4, -0.659, 0.4,
      0.741, 0.6, 0.741, 0.6, -0.659, 0.4, -0.741, 0.6,
      -0.659, 0.4, -0.9, 0.159, -0.741, 0.6, -0.741, 0.6,
      -0.9, 0.159, -1.1, 0.241, -0.9, 0.159, -0.9, -0.159,
      -1.1, 0.241, -1.1, 0.241, -0.9, -0.159, -1.1, -0.241,
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
      -1, 0.2, -1, 0.2, -0.9, -0.3, -1, -0.2,
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
            // border: 'outline',
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
            // border: 'outline',
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
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Rect border', () => {
      addElement('rectBorder');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Touch border rect', () => {
      addElement('touchBorderRect');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Touch border buffer', () => {
      addElement('touchBorderBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.1, -0.3], [-0.8, -0.6], [0.8, -0.6],
        [1.1, -0.3], [1.1, 0.3], [0.8, 0.6],
        [-0.8, 0.6], [-1.1, 0.3],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('default');
      expect(round(rd.points, 3)).toEqual(corneredRect);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);

      r.custom.updatePoints({
        width: 4,
        height: 3,
      });
      expect(round(rd.points, 3)).toEqual(corneredRect.map(n => n + n / Math.abs(n)));
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
    });
  });
  describe('Line', () => {
    beforeEach(() => {
      options = {
        mid: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.2,
              widthIs: 'mid',
            },
            // default is border: 'outline'
          },
        },
        midRectBorder: {
          options: {
            width: 2,
            height: 1,
            corner: {
              radius: 0.3,
              sides: 1,
            },
            line: {
              width: 0.2,
              widthIs: 'mid',
            },
            border: 'rect',
          },
        },
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
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
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
            // border: 'outline',
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
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
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
            // border: 'outline',
            touchBorder: 'rect',
          },
        },
      };
    });
    test('Mid', () => {
      addElement('mid');
      expect(round(rd.points, 3)).toEqual(corneredRectLineMid);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        new Point(-1.1, -0.241),
        new Point(-0.741, -0.6),
        new Point(0.741, -0.6),
        new Point(1.1, -0.241),
        new Point(1.1, 0.241),
        new Point(0.741, 0.6),
        new Point(-0.741, 0.6),
        new Point(-1.1, 0.241),
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        new Point(-1.1, -0.241),
        new Point(-0.741, -0.6),
        new Point(0.741, -0.6),
        new Point(1.1, -0.241),
        new Point(1.1, 0.241),
        new Point(0.741, 0.6),
        new Point(-0.741, 0.6),
        new Point(-1.1, 0.241),
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Mid rect border', () => {
      addElement('midRectBorder');
      expect(round(rd.points, 3)).toEqual(corneredRectLineMid);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1.1, -0.6], [1.1, -0.6], [1.1, 0.6], [-1.1, 0.6],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1.1, -0.6], [1.1, -0.6], [1.1, 0.6], [-1.1, 0.6],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Inside', () => {
      addElement('inside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Positive', () => {
      addElement('positive');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Inside touch buffer', () => {
      addElement('insideTouchBorderBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        new Point(-1.1, -0.241),
        new Point(-0.741, -0.6),
        new Point(0.741, -0.6),
        new Point(1.1, -0.241),
        new Point(1.1, 0.241),
        new Point(0.741, 0.6),
        new Point(-0.741, 0.6),
        new Point(-1.1, 0.241),
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Inside touch rect', () => {
      addElement('insideTouchBorderRect');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Outside', () => {
      addElement('outside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Negative touch rect', () => {
      addElement('negative');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Outside touch buffer', () => {
      addElement('outsideTouchBuffer');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        new Point(-1.1, -0.283),
        new Point(-0.783, -0.6),
        new Point(0.783, -0.6),
        new Point(1.1, -0.283),
        new Point(1.1, 0.283),
        new Point(0.783, 0.6),
        new Point(-0.783, 0.6),
        new Point(-1.1, 0.283),
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Outside touch rect', () => {
      addElement('outsideTouchRect');
      expect(round(rd.points, 3)).toEqual(corneredRectLineOutside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        new Point(-1, -0.241),
        new Point(-0.741, -0.5),
        new Point(0.741, -0.5),
        new Point(1, -0.241),
        new Point(1, 0.241),
        new Point(0.741, 0.5),
        new Point(-0.741, 0.5),
        new Point(-1, 0.241),
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.5], [1, -0.5], [1, 0.5], [-1, 0.5],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('inside');
      expect(round(rd.points, 3)).toEqual(corneredRectLineInside);
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-1, -0.2], [-0.7, -0.5], [0.7, -0.5],
        [1, -0.2], [1, 0.2], [0.7, 0.5],
        [-0.7, 0.5], [-1, 0.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
      r.custom.updatePoints({
        width: 4,
        height: 3,
      });
      expect(round(rd.points, 3))
        .toEqual(corneredRectLineInside.map(n => round(n + n / Math.abs(n), 3)));
      expect(round(r.getBorder('draw', 'border'), 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(round(r.getBorder('draw', 'touchBorder'), 3)).toEqual([getPoints([
        [-2, -1.2], [-1.7, -1.5], [1.7, -1.5],
        [2, -1.2], [2, 1.2], [1.7, 1.5],
        [-1.7, 1.5], [-2, 1.2],
      ])]);
      expect(r.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
  });
});
