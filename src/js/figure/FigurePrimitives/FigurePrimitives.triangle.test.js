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
  let t;
  let td;
  let options;
  let tri;
  let triBorder;
  let mid;
  let midBorder;
  let outside;
  let outsideBorder;
  let inside;
  let insideBorder;
  // let midBorder;
  // let corneredRectLineOutside;
  // let corneredRectLineInside;
  // let corneredRectLineMid;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      figure.addElement(joinObjects({
        name: 't',
        method: 'shapes.triangle',
      }, options[optionsName]));
      figure.initialize();
      t = figure.elements._t;
      td = t.drawingObject;
    };
    tri = [0, 0, 2, 0, 0, 1];
    triBorder = [
      [new Point(0, 0), new Point(2, 0), new Point(0, 1)],
    ];
    mid = [
      0.05, 0.05, 1.788, 0.05, -0.05,
      -0.05, -0.05, -0.05, 1.788, 0.05,
      2.212, -0.05, 1.788, 0.05, 0.05,
      0.919, 2.212, -0.05, 2.212, -0.05,
      0.05, 0.919, -0.05, 1.081, 0.05,
      0.919, 0.05, 0.05, -0.05, 1.081,
      -0.05, 1.081, 0.05, 0.05, -0.05,
      -0.05,
    ];
    midBorder = [[
      new Point(-0.05, -0.05),
      new Point(2.212, -0.05),
      new Point(2.212, -0.05),
      new Point(-0.05, 1.081),
      new Point(-0.05, 1.081),
      new Point(-0.05, -0.05),
    ]];
    outside = [
      0, 0, 2, 0, -0.1, -0.1,
      -0.1, -0.1, 2, 0, 2.424, -0.1,
      2, 0, 0, 1, 2.424, -0.1,
      2.424, -0.1, 0, 1, -0.1, 1.162,
      0, 1, 0, 0, -0.1, 1.162,
      -0.1, 1.162, 0, 0, -0.1, -0.1,
    ];
    outsideBorder = [[
      new Point(-0.1, -0.1),
      new Point(2.424, -0.1),
      new Point(2.424, -0.1),
      new Point(-0.1, 1.162),
      new Point(-0.1, 1.162),
      new Point(-0.1, -0.1),
    ]];

    inside = [
      0, 0.1, 1.8, 0.1, 0, 0,
      0, 0, 1.8, 0.1, 2, 0,
      1.776, 0, 0, 0.888, 2, 0,
      2, 0, 0, 0.888, 0, 1,
      0.1, 0.95, 0.1, 0, 0, 1,
      0, 1, 0.1, 0, 0, 0,
    ];

    insideBorder = triBorder;
  });
  describe('Definitions', () => {
    beforeEach(() => {
      const angle = Math.asin(1 / Math.sqrt(5));
      options = {
        points: {
          options: {
            points: [[0, 0], [2, 0], [0, 1]],
          },
        },
        widthHeightTop: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            xAlign: 'left',
            yAlign: 'bottom',
          },
        },
        ASA: {
          options: {
            ASA: [Math.PI / 2, 2, angle],
            xAlign: 'left',
            yAlign: 'bottom',
          },
        },
        SSS: {
          options: {
            SSS: [2, Math.sqrt(4 + 1), 1],
            xAlign: 'left',
            yAlign: 'bottom',
          },
        },
        SAS: {
          options: {
            SAS: [2, angle, Math.sqrt(5)],
            xAlign: 'left',
            yAlign: 'bottom',
          },
        },
        AAS: {
          options: {
            AAS: [Math.PI / 2, angle, Math.sqrt(5)],
            xAlign: 'left',
            yAlign: 'bottom',
          },
        },
      };
    });
    test('Points', () => {
      addElement('points');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
    test('Width, height, top', () => {
      addElement('widthHeightTop');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
    test('ASA', () => {
      addElement('ASA');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
    test('SSS', () => {
      addElement('SSS');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
    test('SAS', () => {
      addElement('SAS');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
    test('AAS', () => {
      addElement('AAS');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
    });
  });
  describe('Filled', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            xAlign: 'left',
            yAlign: 'bottom',
            // default is border: 'outline'
          },
        },
        borderRect: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'rect',
          },
        },
        touchBorderRect: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'outline',
            touchBorder: 'rect',
          },
        },
        touchBorderBuffer: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'outline',
            touchBorder: 0.1,
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
      expect(round(td.touchBorder, 3)).toEqual(triBorder);
      expect(td.hole).toEqual([]);
    });
    test('Border rect', () => {
      addElement('borderRect');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual([getPoints([
        [0, 0], [2, 0], [2, 1], [0, 1],
      ])]);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [0, 0], [2, 0], [2, 1], [0, 1],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Touch border rect', () => {
      addElement('touchBorderRect');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [0, 0], [2, 0], [2, 1], [0, 1],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Touch border buffer', () => {
      addElement('touchBorderBuffer');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [-0.1, -0.1], [2.424, -0.1], [2.424, -0.1],
        [-0.1, 1.162], [-0.1, 1.162], [-0.1, -0.1],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Update', () => {
      addElement('default');
      expect(round(td.points, 3)).toEqual(tri);
      expect(round(td.border, 3)).toEqual(triBorder);
      expect(round(td.touchBorder, 3)).toEqual(triBorder);
      expect(td.hole).toEqual([]);

      t.custom.update({
        width: 3,
        height: 2,
        top: 'right',
        xAlign: 'right',
        yAlign: 'top',
      });

      expect(round(td.points, 3)).toEqual(
        [-3, -2, 0, -2, 0, 0],
      );
      expect(round(td.border, 3)).toEqual([getPoints([
        [-3, -2], [0, -2], [0, 0],
      ])]);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [-3, -2], [0, -2], [0, 0],
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
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'mid',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            // default is border: 'outline'
          },
        },
        inside: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'inside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            // default is border: 'outline'
          },
        },
        outside: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            // default is border: 'outline'
          },
        },
        outsideBorderRect: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'rect',
          },
        },
        outsideTouchBorderRect: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'outline',
            touchBorder: 'rect',
          },
        },
        outsideTouchBorderBuffer: {
          options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            border: 'outline',
            touchBorder: 0.1,
          },
        },
      };
    });
    test('Mid', () => {
      addElement('mid');
      expect(round(td.points, 3)).toEqual(mid);
      expect(round(td.border, 3)).toEqual(midBorder);
      expect(round(td.touchBorder, 3)).toEqual(midBorder);
      expect(td.hole).toEqual([]);
    });
    test('Inside', () => {
      addElement('inside');
      expect(round(td.points, 3)).toEqual(inside);
      expect(round(td.border, 3)).toEqual(insideBorder);
      expect(round(td.touchBorder, 3)).toEqual(insideBorder);
      expect(td.hole).toEqual([]);
    });
    test('Outside', () => {
      addElement('outside');
      expect(round(td.points, 3)).toEqual(outside);
      expect(round(td.border, 3)).toEqual(outsideBorder);
      expect(round(td.touchBorder, 3)).toEqual(outsideBorder);
      expect(td.hole).toEqual([]);
    });
    test('Outside border rect', () => {
      addElement('outsideBorderRect');
      expect(round(td.points, 3)).toEqual(outside);
      expect(round(td.border, 3)).toEqual([getPoints([
        [-0.1, -0.1], [2.424, -0.1], [2.424, 1.162], [-0.1, 1.162],
      ])]);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [-0.1, -0.1], [2.424, -0.1], [2.424, 1.162], [-0.1, 1.162],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Outside touch border rect', () => {
      addElement('outsideTouchBorderRect');
      expect(round(td.points, 3)).toEqual(outside);
      expect(round(td.border, 3)).toEqual(outsideBorder);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [-0.1, -0.1], [2.424, -0.1], [2.424, 1.162], [-0.1, 1.162],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Outside touch border buffer', () => {
      addElement('outsideTouchBorderBuffer');
      expect(round(td.points, 3)).toEqual(outside);
      expect(round(td.border, 3)).toEqual(outsideBorder);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [-0.2, -0.2],
        [2.847, -0.2],
        [2.847, -0.2],
        [-0.2, 1.324],
        [-0.2, 1.324],
        [-0.2, -0.2],
      ])]);
      expect(td.hole).toEqual([]);
    });
    test('Update', () => {
      addElement('inside');
      expect(round(td.points, 3)).toEqual(inside);
      expect(round(td.border, 3)).toEqual(insideBorder);
      expect(round(td.touchBorder, 3)).toEqual(insideBorder);
      expect(td.hole).toEqual([]);
      t.custom.update({
        width: 4,
        height: 2,
      });
      expect(round(td.points, 3)).toEqual([
        0, 0.1, 3.8, 0.1, 0, 0,
        0, 0, 3.8, 0.1, 4, 0,
        3.776, 0, 0, 1.888, 4, 0,
        4, 0, 0, 1.888, 0, 2,
        0.1, 1.95, 0.1, 0, 0, 2,
        0, 2, 0.1, 0, 0, 0,
      ]);
      expect(round(td.border, 3)).toEqual([getPoints([
        [0, 0],
        [4, 0],
        [0, 2],
      ])]);
      expect(round(td.touchBorder, 3)).toEqual([getPoints([
        [0, 0],
        [4, 0],
        [0, 2],
      ])]);
    });
  });
});
