import {
  getPoints, Point,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

describe('Polyline', () => {
  let diagram;
  let addElement;
  let t;
  let td;
  let options;
  let tri;
  let triBorder;
  // let corneredRectLineOutside;
  // let corneredRectLineInside;
  // let corneredRectLineMid;
  beforeEach(() => {
    diagram = makeDiagram();
    addElement = (optionsName) => {
      diagram.addElement(joinObjects({
        name: 't',
        method: 'shapes.triangle',
      }, options[optionsName]));
      diagram.initialize();
      t = diagram.elements._t;
      td = t.drawingObject;
    };
    tri = [0, 0, 2, 0, 0, 1];
    triBorder = [
      [new Point(0, 0), new Point(2, 0), new Point(0, 1)],
    ];
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
  });
  // describe('Line', () => {
  //   beforeEach(() => {
  //     options = {
  //       mid: {
  //         options: {
  //           width: 2,
  //           height: 1,
  //           corner: {
  //             radius: 0.3,
  //             sides: 1,
  //           },
  //           line: {
  //             width: 0.2,
  //             widthIs: 'mid',
  //           },
  //           // default is border: 'outline'
  //         },
  //       },
  //     },
  //   });
  //   test('Mid', () => {
  //     // addElement('mid');
  //     // expect(round(rd.points, 3)).toEqual(corneredRectLineMid);
  //     // expect(round(rd.border, 3)).toEqual([getPoints([
  //     //   [-1.1, -0.3], [-0.8, -0.6], [0.8, -0.6],
  //     //   [1.1, -0.3], [1.1, 0.3], [0.8, 0.6],
  //     //   [-0.8, 0.6], [-1.1, 0.3],
  //     // ])]);
  //     // expect(round(rd.touchBorder, 3)).toEqual([getPoints([
  //     //   [-1.1, -0.3], [-0.8, -0.6], [0.8, -0.6],
  //     //   [1.1, -0.3], [1.1, 0.3], [0.8, 0.6],
  //     //   [-0.8, 0.6], [-1.1, 0.3],
  //     // ])]);
  //     // expect(rd.hole).toEqual([]);
  //   });
  //   test('Update', () => {
  //   });
  // });
});
