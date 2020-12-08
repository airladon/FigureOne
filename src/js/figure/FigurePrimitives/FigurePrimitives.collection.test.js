import {
  Point, getPoint, getBorder,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
// import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

describe('Figure Primitives - Grid', () => {
  let figure;
  let makeCollection;
  let c;
  let border;
  let rect;
  let offset;
  let buffer;
  let custom;
  beforeEach(() => {
    figure = makeFigure();
    const customBorder = [[0, 0], [2, 1], [1, 2], [0, 1]];
    custom = getBorder(customBorder);
    const options = {
      default: {},  // border = touchBorder = 'children'
      position: {
        position: [1, 0],
      },
      borderRect: {
        border: 'rect',
      },
      borderBuffer: {
        border: 0.2,
      },
      borderCustom: {
        border: customBorder,
      },
      touchBorderBorder: {
        touchBorder: 'border',
      },
      touchBorderBorderRect: {
        border: 'rect',
        touchBorder: 'border',
      },
      touchBorderRect: {
        touchBorder: 'rect',
      },
      touchBorderBuffer: {
        touchBorder: 0.2,
      },
      touchBorderCustom: {
        touchBorder: customBorder,
      },
    };
    makeCollection = (option) => {
      figure.add({
        name: 'c',
        method: 'collections.collection',
        elements: [
          {
            name: 'p1',
            method: 'polygon',
            options: {
              position: [-1, 0],
              radius: 1,
            },
          },
          {
            name: 'p2',
            method: 'polygon',
            options: {
              position: [1, 0],
              radius: 1,
            },
          },
        ],
        options: options[option],
      });
      c = figure.getElement('c');
    };
    border = [
      [
        new Point(0, 0),
        new Point(-1, 1),
        new Point(-2, 0),
        new Point(-1, -1),
      ],
      [
        new Point(2, 0),
        new Point(1, 1),
        new Point(0, 0),
        new Point(1, -1),
      ],
    ];
    rect = [
      [
        new Point(-2, -1),
        new Point(2, -1),
        new Point(2, 1),
        new Point(-2, 1),
      ],
    ];
    buffer = [
      [
        new Point(-2.2, -1.2),
        new Point(2.2, -1.2),
        new Point(2.2, 1.2),
        new Point(-2.2, 1.2),
      ],
    ];
    offset = (borders, offsetPoint = [0, 0]) => borders
      .map(b => b.map(p => round(p.add(getPoint(offsetPoint)))));
  });
  test('Default borders', () => {
    makeCollection('default');
    expect(round(c.getBorder('figure'))).toEqual(border);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('local'))).toEqual(border);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Position offset borders', () => {
    makeCollection('position');
    expect(round(c.getBorder('figure'))).toEqual(offset(border, [1, 0]));
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(offset(border, [1, 0]));
    expect(round(c.getBorder('local'))).toEqual(offset(border, [1, 0]));
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(offset(border, [1, 0]));
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Border rect', () => {
    makeCollection('borderRect');
    expect(round(c.getBorder('figure'))).toEqual(rect);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('local'))).toEqual(rect);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('draw'))).toEqual(rect);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Border buffer', () => {
    makeCollection('borderBuffer');
    expect(round(c.getBorder('figure'))).toEqual(buffer);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('local'))).toEqual(buffer);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('draw'))).toEqual(buffer);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Border custom', () => {
    makeCollection('borderCustom');
    expect(round(c.getBorder('figure'))).toEqual(custom);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('local'))).toEqual(custom);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('draw'))).toEqual(custom);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Touch border border', () => {
    makeCollection('touchBorderBorder');
    expect(round(c.getBorder('figure'))).toEqual(border);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('local'))).toEqual(border);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(border);
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(border);
  });
  test('Touch Border border rect', () => {
    makeCollection('touchBorderBorderRect');
    expect(round(c.getBorder('figure'))).toEqual(rect);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(rect);
    expect(round(c.getBorder('local'))).toEqual(rect);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(rect);
    expect(round(c.getBorder('draw'))).toEqual(rect);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(rect);
  });
  test('Touch Border rect', () => {
    makeCollection('touchBorderRect');
    expect(round(c.getBorder('figure'))).toEqual(border);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(rect);
    expect(round(c.getBorder('local'))).toEqual(border);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(rect);
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(rect);
  });
  test('Touch Border buffer', () => {
    makeCollection('touchBorderBuffer');
    expect(round(c.getBorder('figure'))).toEqual(border);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(buffer);
    expect(round(c.getBorder('local'))).toEqual(border);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(buffer);
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(buffer);
  });
  test('Touch Border custom', () => {
    makeCollection('touchBorderCustom');
    expect(round(c.getBorder('figure'))).toEqual(border);
    expect(round(c.getBorder('figure', 'touchBorder'))).toEqual(custom);
    expect(round(c.getBorder('local'))).toEqual(border);
    expect(round(c.getBorder('local', 'touchBorder'))).toEqual(custom);
    expect(round(c.getBorder('draw'))).toEqual(border);
    expect(round(c.getBorder('draw', 'touchBorder'))).toEqual(custom);
  });
});
