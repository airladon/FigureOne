import {
  Point, getPoints, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

describe('Diagram Primitives TextLine', () => {
  let diagram;
  let textOptions;
  let loadText;
  let a;
  let b;
  let g;
  beforeEach(() => {
    diagram = makeDiagram();
    textOptions = {
      allOptions: {
        lines: [
          'This is the first line',
          'Second line has a |superscript| modifier that isn\'t inline',
          {
            font: {
              family: 'Times New Roman',
              weight: 'bold',
              style: 'italic',
              size: 0.15,
              color: [1, 1, 0, 1],
            },
            lineSpace: -0.3,
            justification: 'center',
            line: 'A line with new defaults',
          },
          'A spaced |line| with two |line| mods',
          'An escaped special char: /|',
        ],
        modifiers: {
          superscript: {
            text: 'superscript!!',
            offset: [-0.1, 0.1],
            inLine: false,
            font: {
              family: 'Times New Roman',
              weight: 'bold',
              style: 'italic',
              size: 0.05,
              color: [1, 0, 1, 1],
            },
          },
          line: {
            font: {
              color: [0, 1, 1, 1],
              style: 'italic',
            },
          },
        },
        xAlign: 'left',
        yAlign: 'baseline',
        font: {
          family: 'Helvetica Neue',
          weight: '200',
          style: 'normal',
          size: 0.1,
        },
        justification: 'left',
        lineSpace: -0.2,
        color: [1, 0, 0, 1],
        position: [-0.8, 0],
        transform: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
      },
      defaultLineSpace: {
        lines: ['a', 'b'],
        font: {
          size: 0.5,
        },
      },
      abLeftBaseline: {
        lines: ['a', 'b'],
        lineSpace: -0.2,
      },
      centerJustification: {
        lines: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'center',
      },
      rightJustification: {
        lines: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'right',
      },
      alignCenterMiddle: {
        lines: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'center',
        xAlign: 'center',
        yAlign: 'middle',
      },
      alignRightTop: {
        lines: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'right',
        xAlign: 'right',
        yAlign: 'top',
      },
      basicModifier: {
        lines: ['a |b|'],
        modifiers: {
          b: {
            text: 'gg',
          },
        },
      },
      transform: {
        lines: ['a', 'b'],
        transform: [['s', 2, 3], ['r', 4], ['t', 5, 6]],
      },
      positionOverride: {
        lines: ['a', 'b'],
        position: [9, 10],
        transform: [['s', 1, 1], ['r', 0], ['t', 5, 6]],
      },
    };
    loadText = (option) => {
      diagram.addElement({
        name: 't',
        method: 'textLines',
        options: textOptions[option],
      });
      diagram.initialize();
      diagram.setFirstTransform();
    };
    // Dimensions for a, b when fontSize = 0.2
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
    g = {
      ascent: 0.095,
      descent: 0.05,
      width: 0.1,
      height: 0.145,
    };
  });
  test('default line space', () => {
    loadText('defaultLineSpace');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    expect(round(ta.bottom)).toBe(round(-a.descent * 0.5 / 0.2));
    expect(round(tb.bottom)).toBe(round(-0.5 * 1.2 - b.descent * 0.5 / 0.2));
  });
  test('ab, left, baseline', () => {
    loadText('abLeftBaseline');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    expect(round(t.left)).toBe(round(0));
    expect(round(t.bottom)).toBe(round(-0.2 - b.descent));
    expect(round(t.width)).toBe(round(a.width));
    expect(round(t.height)).toBe(round(a.ascent + 0.2 + b.descent));
    expect(round(t.top)).toBe(round(a.ascent));
    expect(round(t.right)).toBe(round(ta.left + a.width));
    expect(round(ta.left)).toBe(0);
    expect(round(ta.right)).toBe(round(ta.left + a.width));
    expect(round(tb.left)).toBe(0);
    expect(round(tb.right)).toBe(round(tb.left + b.width));
    expect(round(ta.bottom)).toBe(round(-a.descent));
    expect(round(tb.bottom)).toBe(round(-0.2 - b.descent));
  });
  test('center justification', () => {
    loadText('centerJustification');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    expect(round(t.left)).toBe(round(0));
    expect(round(t.bottom)).toBe(round(-0.2 - b.descent));
    expect(round(t.width)).toBe(round(a.width * 5));
    expect(round(t.height)).toBe(round(a.ascent + 0.2 + b.descent));
    expect(round(t.top)).toBe(round(a.ascent));
    expect(round(t.right)).toBe(round(ta.left + a.width * 5));
    expect(round(ta.left)).toBe(0);
    expect(round(ta.right)).toBe(round(ta.left + a.width * 5));
    expect(round(tb.left)).toBe(round((ta.right - ta.left) / 2 + ta.left - b.width / 2));
    expect(round(tb.right)).toBe(round(tb.left + b.width));
    expect(round(ta.bottom)).toBe(round(-a.descent));
    expect(round(tb.bottom)).toBe(round(-0.2 - b.descent));
  });
  test('right justification', () => {
    loadText('rightJustification');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    expect(round(t.left)).toBe(round(0));
    expect(round(t.bottom)).toBe(round(-0.2 - b.descent));
    expect(round(t.width)).toBe(round(a.width * 5));
    expect(round(t.height)).toBe(round(a.ascent + 0.2 + b.descent));
    expect(round(t.top)).toBe(round(a.ascent));
    expect(round(t.right)).toBe(round(ta.left + a.width * 5));
    expect(round(ta.left)).toBe(0);
    expect(round(ta.right)).toBe(round(ta.left + a.width * 5));
    expect(round(tb.left)).toBe(round(ta.right - b.width));
    expect(round(tb.right)).toBe(round(ta.right));
    expect(round(ta.bottom)).toBe(round(-a.descent));
    expect(round(tb.bottom)).toBe(round(-0.2 - b.descent));
  });
  test('align center middle', () => {
    loadText('alignCenterMiddle');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    const w = a.width * 5;
    const h = a.ascent + 0.2 + b.descent;
    expect(round(t.left)).toBe(round(-w / 2));
    expect(round(t.bottom)).toBe(round(-h / 2));
    expect(round(t.width)).toBe(round(w));
    expect(round(t.height)).toBe(round(h));
    expect(round(t.top)).toBe(round(h / 2));
    expect(round(t.right)).toBe(round(w / 2));
    expect(round(ta.left)).toBe(round(-w / 2));
    expect(round(ta.right)).toBe(round(ta.left + a.width * 5));
    expect(round(tb.left)).toBe(round(-b.width / 2));
    expect(round(tb.right)).toBe(round(tb.left + b.width));
    expect(round(ta.top)).toBe(round(h / 2));
    expect(round(tb.bottom)).toBe(round(-h / 2));
  });
  test('align right top', () => {
    loadText('alignRightTop');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
    const w = a.width * 5;
    const h = a.ascent + 0.2 + b.descent;
    expect(round(t.left)).toBe(round(-w));
    expect(round(t.bottom)).toBe(round(-h));
    expect(round(t.width)).toBe(round(w));
    expect(round(t.height)).toBe(round(h));
    expect(round(t.top)).toBe(round(0));
    expect(round(t.right)).toBe(round(0));
    expect(round(ta.left)).toBe(round(-w));
    expect(round(ta.right)).toBe(round(0));
    expect(round(tb.left)).toBe(round(-b.width));
    expect(round(tb.right)).toBe(round(0));
    expect(round(ta.top)).toBe(round(0));
    expect(round(tb.bottom)).toBe(round(-h));
  });
  test('basic modifier', () => {
    loadText('basicModifier');
    const t = diagram.elements._t.drawingObject;
    expect(t.text.length).toBe(2);
    expect(t.text[0].text).toBe('a ');
    expect(t.text[1].text).toBe('gg');
    const tr = diagram.elements._t.getBoundingRect('diagram');
    expect(round(tr.left)).toBe(round(0));
    expect(round(tr.right)).toBe(round(a.width * 4));
  });
  test('Transform', () => {
    loadText('transform');
    const p = diagram.elements._t.getPosition();
    const s = diagram.elements._t.getScale();
    const r = diagram.elements._t.getRotation();
    expect(s).toEqual(new Point(2, 3));
    expect(r).toEqual(4);
    expect(p).toEqual(new Point(5, 6));
  });
  test('Position override', () => {
    loadText('positionOverride');
    const p = diagram.elements._t.getPosition();
    expect(p).toEqual(new Point(9, 10));
  });
  describe('All Options', () => {
    let text;
    // let tg;
    // let ta;
    let lineSpace;
    beforeEach(() => {
      loadText('allOptions');
      ({ text } = diagram.elements._t.drawingObject);
      lineSpace = -0.2;
    });
    test('color', () => {
      expect(text[0].font.color).toEqual([1, 0, 0, 1]);
      expect(text[1].font.color).toEqual([1, 0, 0, 1]);
      expect(text[2].font.color).toEqual([1, 0, 1, 1]);
      expect(text[3].font.color).toEqual([1, 0, 0, 1]);
      expect(text[4].font.color).toEqual([1, 1, 0, 1]);
      expect(text[5].font.color).toEqual([1, 0, 0, 1]);
      expect(text[6].font.color).toEqual([0, 1, 1, 1]);
      expect(text[7].font.color).toEqual([1, 0, 0, 1]);
      expect(text[8].font.color).toEqual([0, 1, 1, 1]);
      expect(text[9].font.color).toEqual([1, 0, 0, 1]);
      expect(text[10].font.color).toEqual([1, 0, 0, 1]);
    });
    test('style', () => {
      expect(text[0].font.style).toEqual('normal');
      expect(text[1].font.style).toEqual('normal');
      expect(text[2].font.style).toEqual('italic');
      expect(text[3].font.style).toEqual('normal');
      expect(text[4].font.style).toEqual('italic');
      expect(text[5].font.style).toEqual('normal');
      expect(text[6].font.style).toEqual('italic');
      expect(text[7].font.style).toEqual('normal');
      expect(text[8].font.style).toEqual('italic');
      expect(text[9].font.style).toEqual('normal');
      expect(text[10].font.style).toEqual('normal');
    });
    test('size', () => {
      expect(text[0].font.size).toEqual(0.1);
      expect(text[1].font.size).toEqual(0.1);
      expect(text[2].font.size).toEqual(0.05);
      expect(text[3].font.size).toEqual(0.1);
      expect(text[4].font.size).toEqual(0.15);
      expect(text[5].font.size).toEqual(0.1);
      expect(text[6].font.size).toEqual(0.1);
      expect(text[7].font.size).toEqual(0.1);
      expect(text[8].font.size).toEqual(0.1);
      expect(text[9].font.size).toEqual(0.1);
      expect(text[10].font.size).toEqual(0.1);
    });
    test('family', () => {
      expect(text[0].font.family).toEqual('Helvetica Neue');
      expect(text[1].font.family).toEqual('Helvetica Neue');
      expect(text[2].font.family).toEqual('Times New Roman');
      expect(text[3].font.family).toEqual('Helvetica Neue');
      expect(text[4].font.family).toEqual('Times New Roman');
      expect(text[5].font.family).toEqual('Helvetica Neue');
      expect(text[6].font.family).toEqual('Helvetica Neue');
      expect(text[7].font.family).toEqual('Helvetica Neue');
      expect(text[8].font.family).toEqual('Helvetica Neue');
      expect(text[9].font.family).toEqual('Helvetica Neue');
      expect(text[10].font.family).toEqual('Helvetica Neue');
    });
    test('weight', () => {
      expect(text[0].font.weight).toEqual('200');
      expect(text[1].font.weight).toEqual('200');
      expect(text[2].font.weight).toEqual('bold');
      expect(text[3].font.weight).toEqual('200');
      expect(text[4].font.weight).toEqual('bold');
      expect(text[5].font.weight).toEqual('200');
      expect(text[6].font.weight).toEqual('200');
      expect(text[7].font.weight).toEqual('200');
      expect(text[8].font.weight).toEqual('200');
      expect(text[9].font.weight).toEqual('200');
      expect(text[10].font.weight).toEqual('200');
    });
    test('bounds line 1', () => {
      const line = text[0].bounds;
      expect(round(line.width)).toBe(0.1 * text[0].text.length / 2);
      expect(line.left).toBe(0);
      expect(line.bottom).toBe(-a.descent / 2);
      expect(line.top).toBe(b.ascent / 2);
      expect(line.right).toBe(line.width);
    });
    test('bounds line 2', () => {
      const w0 = text[1].bounds;
      const w1 = text[2].bounds;
      const w2 = text[3].bounds;
      expect(w0.width).toBe(text[1].text.length * a.width * 0.1 / 0.2);
      expect(w1.width).toBe(text[2].text.length * a.width * 0.05 / 0.2);
      expect(w2.width).toBe(text[3].text.length * a.width * 0.1 / 0.2);
      // const width = w0 + w2;
      expect(round(w0.left)).toBe(0);
      expect(round(w0.right)).toBe(round(w0.width));
      expect(round(w2.left)).toBe(round(w0.right));
      expect(round(w2.right)).toBe(round(w0.right + w2.width));
      expect(round(w1.left)).toBe(round(w0.right - 0.1));
      expect(round(w1.bottom)).toBe(round(lineSpace + 0.1 - g.descent * 0.05 / 0.2));
    });
    test('bounds line 3', () => {
      const line = text[4].bounds;
      const totalW = text[1].bounds.width + text[3].bounds.width;
      expect(round(line.width))
        .toBe(round(text[4].text.length * a.width * 0.15 / 0.2));
      expect(round(line.left)).toBe(round(totalW / 2 - line.width / 2));
      expect(round(line.bottom)).toBe(round(lineSpace * 2 - g.descent * 0.15 / 0.2));
      expect(round(line.top)).toBe(round(line.bottom + (g.descent + b.ascent) * 0.15 / 0.2));
    });
    test('bounds line 4', () => {
      const w0 = text[5].bounds;
      const w1 = text[6].bounds;
      const w2 = text[7].bounds;
      const w3 = text[8].bounds;
      const w4 = text[9].bounds;
      expect(round(w0.width))
        .toBe(round(text[5].text.length * a.width * 0.1 / 0.2));
      expect(round(w0.left)).toBe(round(0));
      expect(round(w0.right)).toBe(round(w0.width));
      expect(round(w1.left)).toBe(round(w0.right));
      expect(round(w1.right)).toBe(round(w1.left + w1.width));
      expect(round(w2.left)).toBe(round(w1.right));
      expect(round(w2.right)).toBe(round(w2.left + w2.width));
      expect(round(w3.left)).toBe(round(w2.right));
      expect(round(w3.right)).toBe(round(w3.left + w3.width));
      expect(round(w4.left)).toBe(round(w3.right));
      expect(round(w4.right)).toBe(round(w4.left + w4.width));
      expect(round(w0.bottom)).toBe(round(lineSpace * 2 - 0.3 - g.descent * 0.1 / 0.2));
    });
    test('bounds line 5', () => {
      const line = text[10].bounds;
      expect(round(line.width))
        .toBe(round(text[10].text.length * a.width * 0.1 / 0.2));
      expect(round(line.left)).toBe(round(0));
      expect(round(line.bottom)).toBe(round(lineSpace * 3 - 0.3 - g.descent * 0.1 / 0.2));
      expect(round(line.top)).toBe(round(line.bottom + (g.descent + b.ascent) * 0.1 / 0.2));
    });
  });
});
describe('Text Borders', () => {
  let diagram;
  let addElement;
  let t;
  let td;
  // let tr;
  let buffer;
  let callback;
  let bot;
  let top;
  let w;
  let fontSize;
  let l;  // lineSpace
  beforeEach(() => {
    const char = new Rect(0, -0.008, 0.1, 0.148).round(3);
    bot = char.bottom;
    w = char.width;
    ({ top } = char);
    buffer = 0.5;
    fontSize = 0.2;
    l = fontSize * 1.2;
    diagram = makeDiagram();
    callback = jest.fn();
    const options = {
      simple: {
        lines: [
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        lineSpace: -l,
        // border: 'rect',  // default
        // touchBorder: 'rect',  // default
      },
      customBorder: {
        lines: [
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-1, -1], [1, -1], [1, 1], [-1, 1]]],
        touchBorder: 'rect',
      },
      customTouchBorder: {
        lines: [
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: [[[-1, -1], [1, -1], [1, 1], [-1, 1]]],
      },
      buffer: {
        lines: [
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 0.5,
      },
      bufferText: {
        lines: [
          't',
          '|test|',
        ],
        modifiers: {
          test: {
            text: 't',
            touchBorder: 0.1,
          },
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      customBorderText: {
        lines: [
          't',
          '|test|',
        ],
        modifiers: {
          test: {
            text: 't',
            border: [[-0.1, -0.3], [0.2, -0.3], [0.2, -0.1], [-0.1, -0.1]],
          },
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      customTouchBorderText: {
        lines: [
          't',
          '|test|',
        ],
        modifiers: {
          test: {
            text: 't',
            touchBorder: [[-0.1, -0.3], [0.2, -0.3], [0.2, -0.1], [-0.1, -0.1]],
          },
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
      },
      textBorders: {
        lines: [
          't',
          't',
        ],
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'text',
        touchBorder: 'text',
      },
      click: {
        lines: [
          't',
          '|test|',
        ],
        modifiers: {
          test: {
            text: 't',
            onClick: callback,
          },
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: 'rect',
        touchBorder: 'rect',
        position: [-2, -2],
      },
    };
    addElement = (option) => {
      diagram.addElement({
        name: 't',
        method: 'text.lines',
        options: options[option],
      });
      diagram.initialize();
      t = diagram.elements._t;
      td = t.drawingObject;
      // tr = t.getBoundingRect('diagram');
      t.fnMap.add('testFn', callback);
    };
  });
  test('Simple', () => {
    addElement('simple');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
  });
  test('Custom border', () => {
    addElement('customBorder');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
  });
  test('Custom touch border', () => {
    addElement('customTouchBorder');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]), 3)]);
  });
  test('Buffer', () => {
    addElement('buffer');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-buffer, -l + bot - buffer],
      [w + buffer, -l + bot - buffer],
      [w + buffer, top + buffer],
      [-buffer, top + buffer],
    ]), 3)]);
  });
  test('Buffer text', () => {
    addElement('bufferText');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0 - 0.1, -l + bot - 0.1],
      [w + 0.1, -l + bot - 0.1],
      [w + 0.1, -l + top + 0.1],
      [0 - 0.1, -l + top + 0.1],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-0.1, -l + bot - 0.1], [w + 0.1, -l + bot - 0.1], [w + 0.1, top], [-0.1, top],
    ]), 3)]);
  });
  test('Custom Border Text', () => {
    addElement('customBorderText');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, -0.1], [-0.1, -0.1],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, -0.1], [-0.1, -0.1],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, top], [-0.1, top]
      // [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, top], [-0.1, top]
    ]), 3)]);
  });
  test('Custom Touch Border Text', () => {
    addElement('customTouchBorderText');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, -0.1], [-0.1, -0.1],
    ]), 3));

    expect(round(td.border, 3)).toEqual([round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, top], [0, top],
    ]), 3)]);
    expect(round(td.touchBorder, 3)).toEqual([round(getPoints([
      [-0.1, -0.3], [0.2, -0.3], [0.2, top], [-0.1, top],
    ]), 3)]);
  });
  test('Text border', () => {
    addElement('textBorders');
    expect(round(td.text[0].border, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].border, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));
    expect(round(td.text[0].touchBorder, 3)).toEqual(round(getPoints([
      [0, bot], [w, bot], [w, top], [0, top],
    ]), 3));
    expect(round(td.text[1].touchBorder, 3)).toEqual(round(getPoints([
      [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
    ]), 3));

    expect(round(td.border, 3)).toEqual([
      round(getPoints([
        [0, bot], [w, bot], [w, top], [0, top],
      ]), 3),
      round(getPoints([
        [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
      ]), 3),
    ]);
    expect(round(td.touchBorder, 3)).toEqual([
      round(getPoints([
        [0, bot], [w, bot], [w, top], [0, top],
      ]), 3),
      round(getPoints([
        [0, -l + bot], [w, -l + bot], [w, -l + top], [0, -l + top],
      ]), 3),
    ]);
  });
  test('Click', () => {
    addElement('click');
    t.makeTouchable();
    expect(callback.mock.calls.length).toBe(0);
    diagram.mock.touchDown([-2, -2]);
    diagram.mock.touchUp();
    expect(callback.mock.calls.length).toBe(0);

    diagram.mock.touchDown([-2 + 0.05, -2 - l]);
    diagram.mock.touchUp();
    expect(callback.mock.calls.length).toBe(1);
  });
});
