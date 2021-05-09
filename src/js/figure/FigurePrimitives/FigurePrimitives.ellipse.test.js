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
  let points;
  let border;
  let buffer;
  let rect;
  let update;
  beforeEach(() => {
    figure = makeFigure();
    addElement = (optionsName) => {
      figure.add(joinObjects({
        name: 'p',
        make: 'primitives.ellipse',
      }, options[optionsName]));
      figure.initialize();
      p = figure.elements._p;
      pd = p.drawingObject;
    };
    points = [1, 0, 0, 0.5, -1, 0, 1, 0, -1, 0, 0, -0.5];
    border = [
      new Point(1, 0),
      new Point(0, 0.5),
      new Point(-1, 0),
      new Point(0, -0.5),
    ];
    buffer = [
      new Point(0, -0.612),
      new Point(1.12, -0.052),
      new Point(1.12, 0.052),
      new Point(0, 0.612),
      new Point(-1.12, 0.052),
      new Point(-1.12, -0.052),
    // buffer = [
    //   new Point(1.1, 0),
    //   new Point(0, 0.6),
    //   new Point(-1.1, 0),
    //   new Point(0, -0.6),
    ];
    rect = [
      new Point(-1, -0.5),
      new Point(1, -0.5),
      new Point(1, 0.5),
      new Point(-1, 0.5),
    ];
    update = [
      new Point(1.2, 0),
      new Point(0, 0.5),
      new Point(-1.2, 0),
      new Point(0, -0.5),
    ];
  });
  describe('Filled', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            width: 2,
            height: 1,
            sides: 4,
          },
        },
        buffer: {
          options: {
            width: 2,
            height: 1,
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
      expect(round(pd.points, 3)).toEqual(points);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([border]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([border]);
      expect(round(p.drawBorderBuffer)).toEqual([border]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Buffer', () => {
      addElement('buffer');
      expect(round(pd.points, 3)).toEqual(points);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([rect]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([buffer]);
      expect(round(p.drawBorderBuffer, 3)).toEqual([buffer]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('default');
      p.custom.updatePoints({ width: 2.4 });
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([update]);
    });
  });
  describe('line', () => {
    beforeEach(() => {
      options = {
        buffer: {
          options: {
            width: 2,
            height: 1,
            sides: 4,
            drawBorderBuffer: 0.1,
            line: { width: 0.1, widthIs: 'inside' },
          },
          mods: {
            // border: 'rect',
            touchBorder: 'buffer',
          },
        },
      };
    });
    test('Buffer', () => {
      addElement('buffer');
      // expect(round(pd.points, 3)).toEqual(points);
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([border]);
      expect(round(p.getBorder('draw', 'touchBorder'), 3)).toEqual([buffer]);
      expect(round(p.drawBorderBuffer, 3)).toEqual([buffer]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('buffer');
      p.custom.updatePoints({ width: 2.4 });
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([update]);
    });
  });
});
