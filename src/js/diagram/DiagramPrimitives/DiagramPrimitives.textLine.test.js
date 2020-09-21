// import {
//   Rect,
// } from '../../tools/g2';
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
        text: [
          'b',
          [{
            offset: [0.1, 0.1],
            inLine: false,
            font: {
              family: 'Helvetica',
              weight: 'bold',
              style: 'italic',
              size: 0.5,
              color: [1, 1, 0, 1],
            },
          }, 'g'],
          'a',
        ],
        xAlign: 'left',
        yAlign: 'bottom',
        font: {
          family: 'Helvetica Neue',
          weight: '300',
          style: 'normal',
          size: 0.2,
        },
        color: [1, 0, 0, 1],
        position: [0, 0],
        transform: [['s', [1, 1]], ['r', 0], ['t', [0, 0]]],
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
    };
    loadText = (option) => {
      diagram.addElement({
        name: 't',
        method: 'textLine',
        options: textOptions[option],
      });
      diagram.initialize();
      diagram.setFirstTransform();
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
    g = {
      ascent: 0.095,
      descent: 0.05,
      width: 0.1,
      height: 0.145,
    };
  });
  test('ab, left, baseline', () => {
    loadText('abLeftBaseline');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
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
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
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
    const t = diagram.elements._t.getBoundingRect('diagram');
    const ta = diagram.elements._t.drawingObject.text[0].bounds;
    const tb = diagram.elements._t.drawingObject.text[1].bounds;
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
  // describe('All options', () => {
  //   let tb;
  //   let tg;
  //   beforeEach(() => {
  //     loadText('allOptions');
  //     [tb, tg] = diagram.elements._t.drawingObject.text;
  //   });
  //   test('color', () => {
  //     expect(tb.font.color).toEqual([1, 0, 0, 1]);
  //     expect(tg.font.color).toEqual([1, 1, 0, 1]);
  //   });
  //   test('style', () => {
  //     expect(tb.font.style).toBe('normal');
  //     expect(tg.font.style).toBe('italic');
  //   });
  //   test('family', () => {
  //     expect(tb.font.family).toBe('Helvetica Neue');
  //     expect(tg.font.family).toBe('Helvetica');
  //   });
  //   test('weight', () => {
  //     expect(tb.font.weight).toBe('300');
  //     expect(tg.font.weight).toBe('bold');
  //   });
  //   test('size', () => {
  //     expect(tb.font.size).toBe(0.2);
  //     expect(tg.font.size).toBe(0.5);
  //   });
  //   test('bounds', () => {
  //     expect(round(tb.bounds.left)).toBe(-b.width / 2);
  //     expect(round(tb.bounds.bottom)).toBe(-b.height / 2);
  //     expect(round(tb.bounds.width)).toBe(b.width);
  //     expect(round(tb.bounds.height)).toBe(b.height);
  //     expect(round(tb.bounds.top)).toBe(b.height / 2);
  //     expect(round(tb.bounds.right)).toBe(b.width / 2);

  //     expect(round(tg.bounds.left)).toBe(round(-0.1));
  //     expect(round(tg.bounds.bottom)).toBe(round(-0.1));
  //     expect(round(tg.bounds.width)).toBe(round(g.width * 0.5 / 0.2));
  //     expect(round(tg.bounds.height)).toBe(round(g.height * 0.5 / 0.2));
  //     expect(round(tg.bounds.top)).toBe(round(-0.1 + g.height * 0.5 / 0.2));
  //     expect(round(tg.bounds.right)).toBe(round(-0.1 + g.width * 0.5 / 0.2));
  //   });
  // });
});
