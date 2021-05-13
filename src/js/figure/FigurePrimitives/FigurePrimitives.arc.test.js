import {
  Point,
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
  let defaultPoints;
  let fillCenterPoints;
  let fillCenterBorder;
  let border;
  let buffer;
  let rect;
  let update;
  let lineBorder;
  let lineBuffer;
  let lineUpdate;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      p = figure.add(joinObjects({
        make: 'primitives.arc',
      }, options[optionsName]));
      pd = p.drawingObject;
    };
    defaultPoints = [
      0.92, 0, 0.92, 0.38, 0.38, 0.92, 0.92, 0, 0.38, 0.92, -0.38, 0.92,
      0.92, 0, -0.38, 0.92, -0.92, 0.38, 0.92, 0, -0.92, 0.38, -0.92, 0,
    ];
    border = [
      new Point(0.92, 0),
      new Point(0.92, 0.38),
      new Point(0.38, 0.92),
      new Point(-0.38, 0.92),
      new Point(-0.92, 0.38),
      new Point(-0.92, 0),
    ];
    fillCenterPoints = [
      0, 0, 0.92, 0, 0.92, 0.38, 0, 0, 0.92, 0.38, 0.38, 0.92, 0, 0, 0.38,
      0.92, -0.38, 0.92, 0, 0, -0.38, 0.92, -0.92, 0.38, 0, 0, -0.92, 0.38,
      -0.92, 0,
    ];
    fillCenterBorder = [
      new Point(0, 0),
      new Point(0.92, 0),
      new Point(0.92, 0.38),
      new Point(0.38, 0.92),
      new Point(-0.38, 0.92),
      new Point(-0.92, 0.38),
      new Point(-0.92, 0),
    ];
    buffer = [
      new Point(-1.02, -0.07),
      new Point(-0.99, -0.1),
      new Point(0.99, -0.1),
      new Point(1.02, -0.07),
      new Point(1.02, 0.42),
      new Point(0.42, 1.02),
      new Point(-0.42, 1.02),
      new Point(-1.02, 0.42),
    ];
    rect = [
      new Point(-0.92, 0),
      new Point(0.92, 0),
      new Point(0.92, 0.92),
      new Point(-0.92, 0.92),
    ];
    update = [
      new Point(0.46, 0),
      new Point(0.46, 0.19),
      new Point(0.19, 0.46),
      new Point(-0.19, 0.46),
      new Point(-0.46, 0.19),
      new Point(-0.46, 0),
    ];
    lineBorder = [
      new Point(0.92, 0),
      new Point(0.92, 0.38),
      new Point(0.38, 0.92),
      new Point(-0.38, 0.92),
      new Point(-0.92, 0.38),
      new Point(-0.92, 0),
      new Point(-0.82, 0),
      new Point(-0.82, 0.34),
      new Point(-0.34, 0.82),
      new Point(0.34, 0.82),
      new Point(0.82, 0.34),
      new Point(0.82, 0),
    ];
    lineBuffer = [
      new Point(0.99, -0.1),
      new Point(1.02, -0.07),
      new Point(1.02, 0.42),
      new Point(0.42, 1.02),
      new Point(-0.42, 1.02),
      new Point(-1.02, 0.42),
      new Point(-1.02, -0.07),
      new Point(-0.99, -0.1),
    ];
    lineUpdate = [
      new Point(0.46, 0),
      new Point(0.46, 0.19),
      new Point(0.19, 0.46),
      new Point(-0.19, 0.46),
      new Point(-0.46, 0.19),
      new Point(-0.46, 0),
      new Point(-0.36, 0),
      new Point(-0.36, 0.15),
      new Point(-0.15, 0.36),
      new Point(0.15, 0.36),
      new Point(0.36, 0.15),
      new Point(0.36, 0),
    ];
  });
  describe('Filled', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            radius: 1,
            angle: Math.PI,
            sides: 4,
          },
        },
        fillCenter: {
          options: {
            radius: 1,
            angle: Math.PI,
            sides: 4,
            fillCenter: true,
          },
        },
        buffer: {
          options: {
            radius: 1,
            angle: Math.PI,
            sides: 4,
            drawBorderBuffer: 0.1,
          },
          mods: {
            border: 'rect',
            touchBorder: 'buffer',
          },
        },
      };
    });
    test('Default', () => {
      addElement('default');
      expect(round(pd.points, 2)).toEqual(defaultPoints);
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([border]);
      expect(round(p.getBorder('draw', 'touchBorder'), 2)).toEqual([border]);
      expect(round(p.drawBorderBuffer, 2)).toEqual([border]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Fill Center', () => {
      addElement('fillCenter');
      expect(round(pd.points, 2)).toEqual(fillCenterPoints);
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([fillCenterBorder]);
      expect(round(p.getBorder('draw', 'touchBorder'), 2)).toEqual([fillCenterBorder]);
      expect(round(p.drawBorderBuffer, 2)).toEqual([fillCenterBorder]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Buffer', () => {
      addElement('buffer');
      expect(round(pd.points, 2)).toEqual(defaultPoints);
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([rect]);
      expect(round(p.getBorder('draw', 'touchBorder'), 2)).toEqual([buffer]);
      expect(round(p.drawBorderBuffer, 2)).toEqual([buffer]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('default');
      p.custom.updatePoints({ radius: 0.5 });
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([update]);
    });
  });
  describe('line', () => {
    beforeEach(() => {
      options = {
        buffer: {
          options: {
            radius: 1,
            angle: Math.PI,
            sides: 4,
            drawBorderBuffer: 0.1,
            line: { width: 0.1, widthIs: 'inside' },
          },
          mods: {
            touchBorder: 'buffer',
          },
        },
      };
    });
    test('Buffer', () => {
      addElement('buffer');
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([lineBorder]);
      expect(round(p.getBorder('draw', 'touchBorder'), 2)).toEqual([lineBuffer]);
      expect(round(p.drawBorderBuffer, 2)).toEqual([lineBuffer]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('buffer');
      p.custom.updatePoints({ radius: 0.5 });
      expect(round(p.getBorder('draw', 'border'), 2)).toEqual([lineUpdate]);
    });
  });
});
