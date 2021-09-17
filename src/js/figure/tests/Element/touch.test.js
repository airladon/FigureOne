/* eslint-disable object-curly-newline, object-property-newline */
// import {
//   Point, Line, // Rect, RectBounds,
// } from '../../../tools/g2';
// import {
//   round,
// } from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Element Touch', () => {
  let figure;
  let b;
  let result;
  let add;
  let testerX;
  let testerY;
  beforeEach(() => {
    result = undefined;
    figure = makeFigure();
    testerX = (miss, touch, offset = 0) => {
      result = 0;
      miss.forEach(x => figure.mock.touchDown([x + offset, 0]));
      expect(result).toBe(0);
      touch.forEach(x => figure.mock.touchDown([x + offset, 0]));
      expect(result).toBe(touch.length);
    };
    testerY = (miss, touch, offset = 0) => {
      result = 0;
      miss.forEach(y => figure.mock.touchDown([0, y + offset]));
      expect(result).toBe(0);
      touch.forEach(y => figure.mock.touchDown([0, y + offset]));
      expect(result).toBe(touch.length);
    };
  });
  describe('2D', () => {
    describe('Primitive Touch Borders', () => {
      beforeEach(() => {
        add = (touchBorder) => {
          result = 0;
          figure.add({
            name: 'a',
            make: 'rectangle',
            width: 1,
            height: 1,
            touch: { onClick: () => { result += 1; } },
            drawBorderBuffer: 0.1,
            touchBorder,
          });
        };
      });
      test('border', () => {
        add('border');
        testerX([0.505], [0.495, 0]);
        testerY([0.505], [0.495, 0]);
      });
      test('draw', () => {
        add('draw');
        testerX([0.505], [0.495, 0]);
        testerY([0.505], [0.495, 0]);
      });
      test('buffer', () => {
        add('buffer');
        testerX([0.605], [0.505, 0.495, 0]);
        testerY([0.605], [0.505, 0.495, 0]);
      });
      test('rect', () => {
        add('rect');
        testerX([0.505], [0.495, 0]);
        testerY([0.505], [0.495, 0]);
      });
      test('buffer: number', () => {
        add(0.1);
        testerX([0.605], [0.505, 0.495, 0]);
        testerY([0.605], [0.505, 0.495, 0]);
      });
      test('buffer: number, number', () => {
        add([0.1, 0.2]);
        testerX([0.605, -0.605], [0.505, 0.495, 0, -0.505]);
        testerY([0.705, -0.705], [0.605, 0.505, 0.495, 0, -0.605]);
      });
      test('buffer: number, number, number, number', () => {
        add([0.1, 0.2, 0.3, 0.4]);
        testerX([0.805, -0.605], [0.795, 0, -0.595]);
        testerY([0.905, -0.705], [0.895, 0, -0.695]);
      });
      test('buffer: left, bottom, right, top', () => {
        add({ left: 0.1, bottom: 0.2, right: 0.3, top: 0.4 });
        testerX([0.805, -0.605], [0.795, 0, -0.595]);
        testerY([0.905, -0.705], [0.895, 0, -0.695]);
      });
      test('buffer: left, bottom only', () => {
        add({ left: 0.1, bottom: 0.2 });
        testerX([0.505, -0.605], [0.495, 0, -0.595]);
        testerY([0.505, -0.705], [0.495, 0, -0.695]);
      });
      test('custom', () => {
        add([[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]]);
        testerX([0.205, -0.205], [0.195, 0, -0.195]);
        testerY([0.205, -0.205], [0.195, 0, -0.195]);
      });
      test('custom 2 borders', () => {
        add([
          [[-0.4, -0.2], [-0.2, -0.2], [-0.2, 0.2], [-0.4, 0.2]],
          [[0.2, -0.2], [0.4, -0.2], [0.4, 0.2], [0.2, 0.2]],
        ]);
        testerX([-0.405, -0.15, 0.15, 0.405], [-0.395, -0.25, 0.25, 0.395]);
      });
    });
    describe('Collection Touch Borders', () => {
      beforeEach(() => {
        add = (touchBorder) => {
          result = 0;
          figure.add({
            make: 'collection',
            elements: [
              {
                make: 'rectangle',
                width: 0.8,
                height: 1,
                position: [-0.5, 0],
                drawBorderBuffer: 0.1,
                touchBorder: 'buffer',
              },
              {
                make: 'rectangle',
                width: 0.8,
                height: 1,
                position: [0.5, 0],
              },
            ],
            touch: { onClick: () => { result += 1; } },
            touchBorder,
          });
        };
      });
      // TypeParsableBuffer | TypeBorder | 'border' | 'children' | 'rect' | number;
      test('border', () => {
        add('border');
        testerX([-0.95, -0.05, 0.05, 0.95], [-0.85, -0.15, 0.15, 0.85]);
      });
      test('children', () => {
        add('children');
        testerX([-1.05, 0.01, 0.05, 0.95], [-0.95, -0.05, 0.15, 0.85]);
      });
      test('rect', () => {
        add('rect');
        testerX([-1.05, 0.95], [-0.95, -0.05, 0.01, 0.05, 0.15, 0.85]);
        testerY([-0.605, 0.605], [-0.595, 0, 0.595]);
      });
      test('buffer: number', () => {
        add(0.1);
        testerX([-1.15, 1.05], [-1.05, -0.05, 0.01, 0.05, 0.15, 0.95]);
        testerY([-0.705, 0.705], [-0.695, 0, 0.695]);
      });
      test('buffer: number, number', () => {
        add([0.1, 0.2]);
        testerX([-1.15, 1.05], [-1.05, 0, 0.95]);
        testerY([-0.805, 0.805], [-0.795, 0, 0.795]);
      });
      test('buffer: number, number, number, number', () => {
        add([0.1, 0.2, 0.3, 0.4]);
        testerX([-1.15, 1.25], [-1.05, 0, 1.15]);
        testerY([-0.805, 1.05], [-0.795, 0, 0.995]);
      });
      test('left, bottom, right, top', () => {
        add({ left: 0.1, bottom: 0.2, right: 0.3, top: 0.4 });
        testerX([-1.15, 1.25], [-1.05, 0, 1.15]);
        testerY([-0.805, 1.05], [-0.795, 0, 0.995]);
      });
      test('left, bottom only', () => {
        add({ left: 0.1, bottom: 0.2 });
        testerX([-1.15, 0.95], [-1.05, 0, 0.85]);
        testerY([-0.805, 0.605], [-0.795, 0, 0.595]);
      });
      test('custom', () => {
        add([[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]]);
        testerX([0.205, -0.205], [0.195, 0, -0.195]);
        testerY([0.205, -0.205], [0.195, 0, -0.195]);
      });
      test('custom 2 borders', () => {
        add([
          [[-0.4, -0.2], [-0.2, -0.2], [-0.2, 0.2], [-0.4, 0.2]],
          [[0.2, -0.2], [0.4, -0.2], [0.4, 0.2], [0.2, 0.2]],
        ]);
        testerX([-0.405, -0.15, 0.15, 0.405], [-0.395, -0.25, 0.25, 0.395]);
      });
    });
    describe('Nested Collection Touch Borders with Offset', () => {
      beforeEach(() => {
        add = (touchBorder) => {
          result = 0;
          figure.add({
            make: 'collection',
            elements: [
              {
                make: 'collection',
                elements: [
                  {
                    make: 'rectangle',
                    width: 0.8,
                    height: 1,
                    position: [-0.5, 0],
                    drawBorderBuffer: 0.1,
                    touchBorder: 'buffer',
                  },
                  {
                    make: 'rectangle',
                    width: 0.8,
                    height: 1,
                    position: [0.5, 0],
                  },
                ],
                position: [0.1, 0.1],
              },
            ],
            touch: { onClick: () => { result += 1; } },
            touchBorder,
          });
        };
      });
      test('border', () => {
        add('border');
        testerX([-0.95, -0.05, 0.05, 0.95], [-0.85, -0.15, 0.15, 0.85], 0.1);
      });
      test('children', () => {
        add('children');
        testerX([-1.05, 0.01, 0.05, 0.95], [-0.95, -0.05, 0.15, 0.85], 0.1);
      });
      test('rect', () => {
        add('rect');
        testerX([-1.05, 0.95], [-0.95, -0.05, 0.01, 0.05, 0.15, 0.85], 0.1);
        testerY([-0.605, 0.605], [-0.595, 0, 0.595], 0.1);
      });
      test('buffer: number', () => {
        add(0.1);
        testerX([-1.15, 1.05], [-1.05, -0.05, 0.01, 0.05, 0.15, 0.95], 0.1);
        testerY([-0.705, 0.705], [-0.695, 0, 0.695], 0.1);
      });
      test('buffer: number, number', () => {
        add([0.1, 0.2]);
        testerX([-1.15, 1.05], [-1.05, 0, 0.95], 0.1);
        testerY([-0.805, 0.805], [-0.795, 0, 0.795], 0.1);
      });
      test('buffer: number, number, number, number', () => {
        add([0.1, 0.2, 0.3, 0.4]);
        testerX([-1.15, 1.25], [-1.05, 0, 1.15], 0.1);
        testerY([-0.805, 1.05], [-0.795, 0, 0.995], 0.1);
      });
      test('left, bottom, right, top', () => {
        add({ left: 0.1, bottom: 0.2, right: 0.3, top: 0.4 });
        testerX([-1.15, 1.25], [-1.05, 0, 1.15], 0.1);
        testerY([-0.805, 1.05], [-0.795, 0, 0.995], 0.1);
      });
      test('left, bottom only', () => {
        add({ left: 0.1, bottom: 0.2 });
        testerX([-1.15, 0.95], [-1.05, 0, 0.85], 0.1);
        testerY([-0.805, 0.605], [-0.795, 0, 0.595], 0.1);
      });
      test('custom', () => {
        add([[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]]);
        testerX([0.205, -0.205], [0.195, 0, -0.195]);
        testerY([0.205, -0.205], [0.195, 0, -0.195]);
      });
      test('custom 2 borders', () => {
        add([
          [[-0.4, -0.2], [-0.2, -0.2], [-0.2, 0.2], [-0.4, 0.2]],
          [[0.2, -0.2], [0.4, -0.2], [0.4, 0.2], [0.2, 0.2]],
        ]);
        testerX([-0.405, -0.15, 0.15, 0.405], [-0.395, -0.25, 0.25, 0.395]);
      });
    });
    describe('Overlapping Elements', () => {
      beforeEach(() => {
        figure.add({
          name: 'a',
          make: 'polygon',
          radius: 0.5,
          touch: { onClick: () => { result = 'a'; } },
        });
        b = figure.add({
          name: 'b',
          make: 'polygon',
          radius: 0.5,
          touch: { onClick: () => { result = 'b'; } },
        });
      });
      test('b on a', () => {
        expect(result).toBe(undefined);
        figure.mock.touchDown([0, 0]);
        expect(result).toBe('b');
      });
      test('Hide b', () => {
        expect(result).toBe(undefined);
        b.hide();
        figure.mock.touchDown([0, 0]);
        expect(result).toBe('a');
      });
    });
  });
});
