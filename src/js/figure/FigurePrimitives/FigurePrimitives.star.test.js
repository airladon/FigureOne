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
        method: 'shapes.star',
      }, options[optionsName]));
      figure.initialize();
      p = figure.elements._p;
      pd = p.drawingObject;
    };
    points = [
      0, 0, -0.4, 0.4, 0, 1, 0, 0, -1, 0, -0.4, 0.4, 0, 0, -0.4, -0.4, -1, 0,
      0, 0, 0, -1, -0.4, -0.4, 0, 0, 0.4, -0.4, 0, -1, 0, 0, 1, 0, 0.4, -0.4,
      0, 0, 0.4, 0.4, 1, 0, 0, 0, 0, 1, 0.4, 0.4,
    ];
    border = [
      new Point(0, 1),
      new Point(-0.4, 0.4),
      new Point(-1, 0),
      new Point(-0.4, -0.4),
      new Point(0, -1),
      new Point(0.4, -0.4),
      new Point(1, 0),
      new Point(0.4, 0.4),
    ];
    buffer = [
      new Point(0, 1.1),
      new Point(-1.1, 0),
      new Point(0, -1.1),
      new Point(1.1, 0),
    ];
    rect = [
      new Point(-1, -1),
      new Point(1, -1),
      new Point(1, 1),
      new Point(-1, 1),
    ];
    update = [
      new Point(0, 1.2),
      new Point(-0.4, 0.4),
      new Point(-1.2, 0),
      new Point(-0.4, -0.4),
      new Point(0, -1.2),
      new Point(0.4, -0.4),
      new Point(1.2, 0),
      new Point(0.4, 0.4),
    ];
  });
  describe('Filled', () => {
    beforeEach(() => {
      options = {
        default: {
          options: {
            radius: 1,
            sides: 4,
            innerRadius: 0.5 * Math.sqrt(2) - 0.1 * Math.sqrt(2),
          },
        },
        buffer: {
          options: {
            radius: 1,
            sides: 4,
            innerRadius: 0.5 * Math.sqrt(2) - 0.1 * Math.sqrt(2),
            drawBorderBuffer: 0.1 / Math.sqrt(2),
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
      expect(round(p.drawBorderBuffer)).toEqual([buffer]);
      expect(p.getBorder('draw', 'holeBorder')).toEqual([[]]);
    });
    test('Update', () => {
      addElement('default');
      p.custom.updatePoints({ radius: 1.2 });
      expect(round(p.getBorder('draw', 'border'), 3)).toEqual([update]);
    });
  });
});
