import {
  Point, Rect, getPoints,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeFigure from '../../__mocks__/makeFigure';

describe('Figure Primitives TextLine', () => {
  let figure;
  let textOptions;
  let loadText;
  let a;
  let b;
  // let g;
  beforeEach(() => {
    figure = makeFigure();
    textOptions = {
      allOptions: {
        text: [
          'b',
          {
            offset: [0.2, 0.2],
            inLine: false,
            font: {
              family: 'Helvetica',
              weight: 'bold',
              style: 'italic',
              size: 0.5,
              color: [1, 1, 0, 1],
            },
            text: 'g',
          },
          'a',
        ],
        xAlign: 'left',
        yAlign: 'bottom',
        font: {
          family: 'Helvetica Neue',
          weight: '200',
          style: 'normal',
          size: 0.2,
        },
        color: [1, 0, 0, 1],
        position: [0, 0],
        transform: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
      },
      abLeftBaseline: {
        text: ['a', 'b'],
      },
      abCenterMiddle: {
        text: ['a', 'b'],
        xAlign: 'center',
        yAlign: 'middle',
      },
      abRightTop: {
        text: ['a', 'b'],
        xAlign: 'right',
        yAlign: 'top',
      },
      transform: {
        text: ['a', 'b'],
        transform: [['s', 2, 3], ['r', 4], ['t', 5, 6]],
      },
      positionOverride: {
        text: ['a', 'b'],
        position: [9, 10],
        transform: [['s', 1, 1], ['r', 0], ['t', 5, 6]],
      },
    };
    loadText = (option) => {
      figure.addElement({
        name: 't',
        method: 'textLine',
        options: textOptions[option],
      });
      figure.initialize();
      figure.setFirstTransform();
    };
    a = {
      ascent: 0.095,
      descent: 0.008,
      width: 0.1,
      height: 0.103,
    };
    b = {
      ascent: 0.14,
      descent: 0.008,
      width: 0.1,
      height: 0.148,
    };
    // g = {
    //   ascent: 0.095,
    //   descent: 0.05,
    //   width: 0.1,
    //   height: 0.145,
    // };
  });
  test('ab, left, baseline', () => {
    loadText('abLeftBaseline');
    const t = figure.elements._t.getBoundingRect('figure');
    const ta = figure.elements._t.drawingObject.text[0].bounds;
    const tb = figure.elements._t.drawingObject.text[1].bounds;
    expect(round(t.left)).toBe(0);
    expect(round(t.bottom)).toBe(-a.descent);
    expect(round(t.width)).toBe(a.width + b.width);
    expect(round(t.height)).toBe(b.height);
    expect(round(t.top)).toBe(b.ascent);
    expect(round(t.right)).toBe(a.width + b.width);
    expect(ta.left).toBe(0);
    expect(ta.right).toBe(ta.left + a.width);
    expect(tb.left).toBe(ta.right);
    expect(tb.right).toBe(ta.right + b.width);
    expect(ta.bottom).toBe(tb.bottom);
  });
  test('ab, center, middle', () => {
    loadText('abCenterMiddle');
    const t = figure.elements._t.getBoundingRect('figure');
    const ta = figure.elements._t.drawingObject.text[0].bounds;
    const tb = figure.elements._t.drawingObject.text[1].bounds;
    const w = a.width + b.width;
    const h = b.height;
    expect(round(t.left)).toBe(-w / 2);
    expect(round(t.bottom)).toBe(-h / 2);
    expect(round(t.width)).toBe(w);
    expect(round(t.height)).toBe(h);
    expect(round(t.top)).toBe(h / 2);
    expect(round(t.right)).toBe(w / 2);
    expect(ta.left).toBe(-w / 2);
    expect(ta.right).toBe(ta.left + a.width);
    expect(tb.left).toBe(ta.right);
    expect(tb.right).toBe(ta.right + b.width);
    expect(ta.bottom).toBe(tb.bottom);
  });
  test('ab, right, top', () => {
    loadText('abRightTop');
    const t = figure.elements._t.getBoundingRect('figure');
    const ta = figure.elements._t.drawingObject.text[0].bounds;
    const tb = figure.elements._t.drawingObject.text[1].bounds;
    const w = a.width + b.width;
    const h = b.height;
    expect(round(t.left)).toBe(-w);
    expect(round(t.bottom)).toBe(-h);
    expect(round(t.width)).toBe(w);
    expect(round(t.height)).toBe(h);
    expect(round(t.top)).toBe(0);
    expect(round(t.right)).toBe(0);
    expect(ta.left).toBe(-w);
    expect(ta.right).toBe(ta.left + a.width);
    expect(tb.left).toBe(ta.right);
    expect(tb.right).toBe(ta.right + b.width);
    expect(ta.bottom).toBe(tb.bottom);
  });
  test('Transform', () => {
    loadText('transform');
    const p = figure.elements._t.getPosition();
    const s = figure.elements._t.getScale();
    const r = figure.elements._t.getRotation();
    expect(s).toEqual(new Point(2, 3));
    expect(r).toEqual(4);
    expect(p).toEqual(new Point(5, 6));
  });
  test('Position override', () => {
    loadText('positionOverride');
    const p = figure.elements._t.getPosition();
    expect(p).toEqual(new Point(9, 10));
  });
  describe('All Options', () => {
    let tb;
    let tg;
    let ta;
    beforeEach(() => {
      loadText('allOptions');
      [tb, tg, ta] = figure.elements._t.drawingObject.text;
    });
    test('color', () => {
      expect(tb.font.color).toEqual([1, 0, 0, 1]);
      expect(tg.font.color).toEqual([1, 1, 0, 1]);
      expect(ta.font.color).toEqual([1, 0, 0, 1]);
    });
    test('style', () => {
      expect(tb.font.style).toEqual('normal');
      expect(tg.font.style).toEqual('italic');
      expect(ta.font.style).toEqual('normal');
    });
    test('size', () => {
      expect(tb.font.size).toEqual(0.2);
      expect(tg.font.size).toEqual(0.5);
      expect(ta.font.size).toEqual(0.2);
    });
    test('family', () => {
      expect(tb.font.family).toEqual('Helvetica Neue');
      expect(tg.font.family).toEqual('Helvetica');
      expect(ta.font.family).toEqual('Helvetica Neue');
    });
    test('weight', () => {
      expect(tb.font.weight).toEqual('200');
      expect(tg.font.weight).toEqual('bold');
      expect(ta.font.weight).toEqual('200');
    });
    test('bounds', () => {
      const _b = tb.bounds;
      const _g = tg.bounds;
      const _a = ta.bounds;
      expect(round(_b.left)).toBe(0);
      expect(round(_b.bottom)).toBe(0);
      expect(round(_b.right)).toBe(round(_b.left + _b.width));
      expect(round(_b.width)).toBe(0.1);
      expect(round(_a.width)).toBe(0.1);
      expect(round(_g.width)).toBe(0.1 * 0.5 / 0.2);
      expect(round(_a.left)).toBe(round(_b.right));
      expect(round(_a.right)).toBe(round(_a.left + _a.width));
      expect(round(_g.left)).toBe(round(_b.right + 0.2));
      expect(round(_g.bottom))
        .toBe(round(tb.measure.descent + _b.bottom + 0.2 - tg.measure.descent));
      expect(round(_g.top)).toBe(round(_g.bottom + tg.measure.ascent + tg.measure.descent));

      const t = figure.elements._t.getBoundingRect('figure');
      expect(t.left).toBe(_b.left);
      expect(t.right).toBe(_g.right);
      expect(t.bottom).toBe(_b.bottom);
      expect(t.top).toBe(_g.top);
    });
  });
});
describe('Text Borders', () => {
  let figure;
  let addElement;
  let t;
  let td;
  // let tr;
  let buffer;
  let callback;
  let bot;
  let top;
  let w;
  beforeEach(() => {
    const char = new Rect(0, -0.008, 0.1, 0.148).round(3);
    bot = char.bottom;
    w = char.width;
    ({ top } = char);
    buffer = 0.5;
    figure = makeFigure();
    callback = jest.fn();
    const options = {
      simple: {
        text: [
          't',
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'rect',  // default
        // touchBorder: 'rect',  // default
      },
      touchBuffer: {
        text: [
          't',
          {
            text: 't',
            touchBorder: 0.5,
          },
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'rect',  // default
        // touchBorder: 'rect',  // default
      },
      highMiddle: {
        text: [
          't',
          {
            text: 't',
            offset: [0, 1],
            inLine: false,
          },
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'rect',  // default
        // touchBorder: 'rect',  // default
      },
      highMiddleText: {
        text: [
          't',
          {
            text: 't',
            offset: [0, 1],
            inLine: false,
          },
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'text',
        touchBorder: 'text',
      },
      customFigureObjectBorder: {
        text: [
          't',
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-1, -1], [1, -1], [1, 1], [-1, 1]]],
        touchBorder: 'border',
      },
      customFigureObjectTouchBorder: {
        text: [
          't',
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-1, -1], [1, -1], [1, 1], [-1, 1]]],
        touchBorder: [[[-2, -2], [2, -2], [2, 2], [-2, 2]]],
      },
      customTextBorder: {
        text: [
          't',
          {
            text: 't',
            border: [[0.1, -1], [0.2, -1], [0.2, 1], [0.1, 1]],
            touchBorder: 'rect',
          },
          {
            text: 't',
            touchBorder: [[0.2, -2], [0.3, -2], [0.3, 2], [0.2, 2]],
          },
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      click: {
        text: [
          't',
          {
            text: 't',
            onClick: callback,
          },
          't',
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
        method: 'text.line',
        options: options[option],
      });
      figure.initialize();
      t = figure.elements._t;
      td = t.drawingObject;
      // tr = t.getBoundingRect('figure');
      t.fnMap.add('testFn', callback);
    };
  });
  test('Simple', () => {
    addElement('simple');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, bot], [w * 3, bot], [w * 3, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [0, bot], [w * 3, bot], [w * 3, top], [0, top],
    ]), 3)]);
  });
  test('Touch buffer', () => {
    addElement('touchBuffer');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w - buffer, bot - buffer],
      [w * 2 + buffer, bot - buffer],
      [w * 2 + buffer, top + buffer],
      [w - buffer, top + buffer],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, bot], [w * 3, bot], [w * 3, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [w - buffer, bot - buffer],
      [w * 2 + buffer, bot - buffer],
      [w * 2 + buffer, top + buffer],
      [w - buffer, top + buffer],
    ]), 3)]);
  });
  test('High middle', () => {
    addElement('highMiddle');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, bot], [w * 2, bot], [w * 2, top + 1], [0, top + 1],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [0, bot], [w * 2, bot], [w * 2, top + 1], [0, top + 1],
    ]), 3)]);
  });
  test('High middle text border', () => {
    addElement('highMiddleText');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([
      round(getPoints([
        [0, bot], [w, bot], [w, top], [0, top],
      ]), 3),
      round(getPoints([
        [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
      ]), 3),
      round(getPoints([
        [w, bot], [w * 2, bot], [w * 2, top], [w, top],
      ]), 3),
    ]);
    expect(round(td.touchBorder, 3)).toEqual([
      round(getPoints([
        [0, bot], [w, bot], [w, top], [0, top],
      ]), 3),
      round(getPoints([
        [w, bot + 1], [w * 2, bot + 1], [w * 2, top + 1], [w, top + 1],
      ]), 3),
      round(getPoints([
        [w, bot], [w * 2, bot], [w * 2, top], [w, top],
      ]), 3),
    ]);
  });
  test('customFigureObjectBorder', () => {
    addElement('customFigureObjectBorder');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]), 3)]);
  });
  test('customFigureObjectTouchBorder', () => {
    addElement('customFigureObjectTouchBorder');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-2, -2], [2, -2], [2, 2], [-2, 2],
    ]), 3)]);
  });
  test('customTextBorder', () => {
    addElement('customTextBorder');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0.1, -1], [0.2, -1], [0.2, 1], [0.1, 1],
    ]), 3));
    expect(round(td.text[2].border, 3)).toEqual(round(getPoints([
      [w * 2, bot], [w * 3, bot], [w * 3, top], [w * 2, top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [w, bot], [w * 2, bot], [w * 2, top], [w, top],
    ]), 3));
    expect(round(td.text[2].touchBorder, 3)).toEqual(round(getPoints([
      [0.2, -2], [0.3, -2], [0.3, 2], [0.2, 2],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -1], [w * 3, -1], [w * 3, 1], [0, 1],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [0, -2], [w * 3, -2], [w * 3, 2], [0, 2],
    ]), 3)]);
  });
  test('Click', () => {
    addElement('click');
    t.makeTouchable();
    expect(callback.mock.calls.length).toBe(0);
    figure.mock.touchDown([-2, -2]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(0);

    figure.mock.touchDown([0.15 - 2, -2]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(1);

    figure.mock.touchDown([0.25 - 2, -2]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(1);

    figure.mock.touchDown([0.15, 0]);
    figure.mock.touchUp();
    expect(callback.mock.calls.length).toBe(1);
  });
});
