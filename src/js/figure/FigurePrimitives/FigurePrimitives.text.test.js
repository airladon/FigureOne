import {
  getPoints, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
// import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';

// tools.isTouchDevice = jest.fn();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');

describe('Text', () => {
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    figure.addElements([
      {
        name: 'a',
        method: 'text',
        options: {
          text: 'a',
          xAlign: 'left',
          yAlign: 'baseline',
        },
      },
      {
        name: 'c',
        method: 'text',
        options: {
          text: 'c',
          xAlign: 'left',
          yAlign: 'baseline',
          position: [1, 1],
        },
      },
      {
        name: 'container',
        method: 'collection',
        addElements: [
          {
            name: 'a',
            method: 'text',
            options: {
              text: 'a',
              xAlign: 'left',
              yAlign: 'baseline',
              position: [1, 1],
            },
          },
        ],
        options: {
          position: [2, 2],
        },
      },
    ]);
    figure.setFirstTransform();
  });
  test('Base', () => {
    const a = figure.elements._a.getBoundingRect('figure');
    expect(round(a.left)).toBe(0);
    expect(round(a.bottom)).toBe(-0.008);
    expect(round(a.width)).toBe(0.1);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(0.095);
    expect(round(a.right)).toBe(0.1);
  });
  test('Moved', () => {
    const c = figure.elements._c.getBoundingRect('figure');
    expect(round(c.left)).toBe(1);
    expect(round(c.bottom)).toBe(1 - 0.008);
    expect(round(c.width)).toBe(0.1);
    expect(round(c.height)).toBe(0.103);
    expect(round(c.top)).toBe(1 + 0.095);
    expect(round(c.right)).toBe(1 + 0.1);
  });
  test('Moved in Collection', () => {
    figure.elements._container.showAll();
    const container = figure.elements._container.getBoundingRect('figure');
    const a = figure.elements._container._a.getBoundingRect('figure');
    expect(round(a.left)).toBe(3);
    expect(round(a.bottom)).toBe(3 - 0.008);
    expect(round(a.width)).toBe(0.1);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(3 + 0.095);
    expect(round(a.right)).toBe(3 + 0.1);
    expect(round(container.left)).toBe(3);
    expect(round(container.bottom)).toBe(3 - 0.008);
    expect(round(container.width)).toBe(0.1);
    expect(round(container.height)).toBe(0.103);
    expect(round(container.top)).toBe(3 + 0.095);
    expect(round(container.right)).toBe(3 + 0.1);
  });
});
describe('Text Borders', () => {
  let figure;
  let addElement;
  let t;
  let td;
  let tr;
  let a;
  let buffer;
  let callback;
  beforeEach(() => {
    a = new Rect(0, -0.008, 0.1, 0.148).round(3);
    buffer = 0.5;
    figure = makeFigure();
    callback = jest.fn();
    const options = {
      simple: {
        text: 't',
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'text',      // default
        // touchBorder: 'border'  // default
      },
      drawingObjectBuffer: {
        text: 't',
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'text',      // default
        touchBorder: buffer,
      },
      textBuffer: {
        text: {
          text: 't',
          touchBorder: 0.5,
        },
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: 'text',
      },
      textAndDrawingObjectBuffer: {
        text: {
          text: 't',
          touchBorder: 0.5,
        },
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: buffer,
      },
      textCustomBorderDrawingObjectTouchBuffer: {
        text: {
          text: 't',
          border: [[-1, -1], [-1, 1], [1, 1], [-1, 1]],
        },
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: buffer,
      },
      textCustomTouchBorderDrawingObjectCustomBorder: {
        text: {
          text: 't',
          touchBorder: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-2, -2], [2, -2], [2, 2], [-2, 2]]],
        touchBorder: 'text',
      },
      textCustomTouchBorderDrawingObjectCustomBorderTouchBorderBorder: {
        text: {
          text: 't',
          touchBorder: [[-2, -2], [2, -2], [2, 2], [-2, 2]],
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-1, -1], [1, -1], [1, 1], [-1, 1]]],
        touchBorder: 'border',
      },
      twoText: {
        text: [
          {
            text: 't',
          },
          {
            text: 't',
            location: [1, 0],
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
      },
      twoTextBorderRect: {
        text: [
          {
            text: 't',
          },
          {
            text: 't',
            location: [1, 0],
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      twoTextBorderRectWithBuffer: {
        text: [
          {
            text: 't',
          },
          {
            text: 't',
            location: [1, 0],
            touchBorder: 0.5,
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 0.5,
      },
      twoTextCustomBorderText: {
        text: [
          {
            text: 't',
            border: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
          },
          {
            text: 't',
            location: [1, 0],
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      click: {
        text: [
          {
            text: 't',
            border: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
            onClick: 'testFn',
          },
          {
            text: 't',
            location: [1, 0],
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
        position: [-2, -2],
      },
    };
    addElement = (option) => {
      figure.addElement({
        name: 't',
        method: 'text',
        options: options[option],
      });
      figure.initialize();
      t = figure.elements._t;
      td = t.drawingObject;
      tr = t.getBoundingRect('figure');
      t.fnMap.add('testFn', callback);
    };
  });
  test('Simple', () => {
    addElement('simple');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
  });
  test('DrawingObject Buffer', () => {
    addElement('drawingObjectBuffer');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);

    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));

    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ])]);
  });
  test('Text Buffer', () => {
    addElement('textBuffer');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);

    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ]));

    // DrawingObject borders
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ])]);
  });
  test('Text and DrawingObject Buffer', () => {
    addElement('textAndDrawingObjectBuffer');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ]));

    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer * 2, a.bottom - buffer * 2],
      [a.width + buffer * 2, a.bottom - buffer * 2],
      [a.width + buffer * 2, a.top + buffer * 2],
      [-buffer * 2, a.top + buffer * 2],
    ])]);
  });
  test('Text custom border, DrawingObject touch buffer', () => {
    addElement('textCustomBorderDrawingObjectTouchBuffer');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ]));

    expect(td.border).toEqual([getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-1 - buffer, -1 - buffer],
      [1 + buffer, -1 - buffer],
      [1 + buffer, 1 + buffer],
      [-1 - buffer, 1 + buffer],
    ])]);
  });
  test('Text custom touch border, DrawingObject custom border', () => {
    addElement('textCustomTouchBorderDrawingObjectCustomBorder');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]));

    expect(td.border).toEqual([getPoints([
      [-2, -2], [2, -2], [2, 2], [-2, 2],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ])]);
  });
  test('Text custom touch border, DrawingObject custom border and touch border same as border', () => {
    addElement('textCustomTouchBorderDrawingObjectCustomBorderTouchBorderBorder');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-2, -2], [2, -2], [2, 2], [-2, 2],
    ]));

    expect(td.border).toEqual([getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ])]);
  });
  test('Two text', () => {
    addElement('twoText');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));

    expect(td.text[1].border).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));
    expect(td.text[1].touchBorder).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));

    expect(td.border).toEqual([
      getPoints([[0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top]]),
      getPoints([[1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top]]),
    ]);
    expect(td.touchBorder).toEqual([
      getPoints([[0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top]]),
      getPoints([[1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top]]),
    ]);
  });
  test('Two text border rect', () => {
    addElement('twoTextBorderRect');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));

    expect(td.text[1].border).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));
    expect(td.text[1].touchBorder).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));

    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [0, a.top],
    ])]);

    expect(td.touchBorder).toEqual([getPoints([
      [0, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [0, a.top],
    ])]);
  });
  test('Two text border rect with buffer', () => {
    addElement('twoTextBorderRectWithBuffer');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));

    expect(td.text[1].border).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));
    expect(td.text[1].touchBorder).toEqual(getPoints([
      [1 - buffer, a.bottom - buffer],
      [1 + a.width + buffer, a.bottom - buffer],
      [1 + a.width + buffer, a.top + buffer],
      [1 - buffer, a.top + buffer],
    ]));

    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [0, a.top],
    ])]);

    expect(td.touchBorder).toEqual([getPoints([
      [-buffer, a.bottom - buffer * 2],
      [1 + a.width + buffer * 2, a.bottom - buffer * 2],
      [1 + a.width + buffer * 2, a.top + buffer * 2],
      [-buffer, a.top + buffer * 2],
    ])]);
  });
  test('Two text custom border text', () => {
    addElement('twoTextCustomBorderText');
    // FigureText borders
    expect(td.text[0].border).toEqual(getPoints([
      [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5],
    ]));

    expect(td.text[1].border).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));
    expect(td.text[1].touchBorder).toEqual(getPoints([
      [1, a.bottom], [1 + a.width, a.bottom], [1 + a.width, a.top], [1, a.top],
    ]));

    expect(td.border).toEqual([getPoints([
      [-0.5, -0.5], [1 + a.width, -0.5], [1 + a.width, 0.5], [-0.5, 0.5],
    ])]);

    expect(td.touchBorder).toEqual([getPoints([
      [-0.5, -0.5], [1 + a.width, -0.5], [1 + a.width, 0.5], [-0.5, 0.5],
    ])]);
  });
  test('Click', () => {
    addElement('click');
    t.setTouchable();
    expect(callback.mock.calls.length).toBe(0);
    figure.mock.touchDown([-2, -2]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(1);

    figure.mock.touchDown([-1.5000001, -1.50000001]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(2);

    figure.mock.touchDown([-1, -1]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(2);
  });
});
