// import {
//   Rect,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

describe('Diagram Primitives Text', () => {
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
            xAlign: 'left',
            yAlign: 'bottom',
            location: [-0.1, -0.1],
            font: {
              family: 'Helvetica',
              weight: 'bold',
              style: 'italic',
              size: 0.5,
              color: [1, 1, 0, 1],
            },
          }, 'g'],
        ],
        xAlign: 'center',
        yAlign: 'middle',
        font: {
          family: 'Helvetica Neue',
          weight: '300',
          style: 'normal',
          size: 0.2,
        },
        color: [1, 0, 0, 1],
        position: [0, 0],
        // transform: [['s', [1, 1]], ['r', 0], ['t', [0, 0]]],
      },
      aLeftBaseline: {
        text: 'a',
      },
      bLeftBaseline: {
        text: 'b',
      },
      gLeftBaseline: {
        text: 'g',
      },
      aCenterMiddle: {
        text: 'a',
        xAlign: 'center',
        yAlign: 'middle',
      },
      aCenterMiddleFromText: {
        text: [{ xAlign: 'center', yAlign: 'middle' }, 'a'],
      },
      gTopRight: {
        text: 'g',
        xAlign: 'right',
        yAlign: 'top',
      },
      gBottomLeft: {
        text: 'g',
        xAlign: 'left',
        yAlign: 'bottom',
      },
      threeCharString: {
        text: 'abg',
        xAlign: 'center',
        yAlign: 'middle',
      },
    };
    loadText = (option) => {
      diagram.addElement({
        name: 't',
        method: 'text',
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
  // A single 'a' will have:
  //   width: 0.1
  //   ascent: 0.095
  //   descent: 0.008
  //   height: 0.103
  // A single 'b' will have:
  //   width: 0.1
  //   ascent: 0.14
  //   descent: 0.008
  //   height: 0.148
  // A single 'g' will have:
  //   width: 0.1
  //   ascent: 0.095
  //   descent: 0.05
  //   height: 0.145
  test('one character a, left, baseline', () => {
    loadText('aLeftBaseline');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(0);
    expect(round(t.bottom)).toBe(-a.descent);
    expect(round(t.width)).toBe(a.width);
    expect(round(t.height)).toBe(a.height);
    expect(round(t.top)).toBe(a.ascent);
    expect(round(t.right)).toBe(a.width);
  });
  test('one character b, left, baseline', () => {
    loadText('bLeftBaseline');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(0);
    expect(round(t.bottom)).toBe(-b.descent);
    expect(round(t.width)).toBe(b.width);
    expect(round(t.height)).toBe(b.height);
    expect(round(t.top)).toBe(b.ascent);
    expect(round(t.right)).toBe(b.width);
  });
  test('one character g, left, baseline', () => {
    loadText('gLeftBaseline');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(0);
    expect(round(t.bottom)).toBe(-g.descent);
    expect(round(t.width)).toBe(g.width);
    expect(round(t.height)).toBe(g.height);
    expect(round(t.top)).toBe(g.ascent);
    expect(round(t.right)).toBe(g.width);
  });
  test('one character a, center, middle defined as default', () => {
    loadText('aCenterMiddle');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(-a.width / 2);
    expect(round(t.bottom)).toBe(-a.height / 2);
    expect(round(t.width)).toBe(a.width);
    expect(round(t.height)).toBe(a.height);
    expect(round(t.top)).toBe(a.height / 2);
    expect(round(t.right)).toBe(a.width / 2);
  });
  test('one character a, center, middle defined in text', () => {
    loadText('aCenterMiddleFromText');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(-a.width / 2);
    expect(round(t.bottom)).toBe(-a.height / 2);
    expect(round(t.width)).toBe(a.width);
    expect(round(t.height)).toBe(a.height);
    expect(round(t.top)).toBe(a.height / 2);
    expect(round(t.right)).toBe(a.width / 2);
  });
  test('one character g, top, right', () => {
    loadText('gTopRight');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(-g.width);
    expect(round(t.bottom)).toBe(-g.height);
    expect(round(t.width)).toBe(g.width);
    expect(round(t.height)).toBe(g.height);
    expect(round(t.top)).toBe(0);
    expect(round(t.right)).toBe(0);
  });
  test('one character g, bottom, left', () => {
    loadText('gBottomLeft');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(0);
    expect(round(t.bottom)).toBe(0);
    expect(round(t.width)).toBe(g.width);
    expect(round(t.height)).toBe(g.height);
    expect(round(t.top)).toBe(g.height);
    expect(round(t.right)).toBe(g.width);
  });
  test('three char string, abg, center, middle', () => {
    loadText('threeCharString');
    const t = diagram.elements._t.getBoundingRect('diagram');
    const w = round(a.width + b.width + g.width);
    const h = round(
      Math.max(a.ascent, b.ascent, g.ascent)
      + Math.max(a.descent, b.descent, g.descent),
    );
    expect(round(t.left)).toBe(-w / 2);
    expect(round(t.bottom)).toBe(-h / 2);
    expect(round(t.width)).toBe(w);
    expect(round(t.height)).toBe(h);
    expect(round(t.top)).toBe(h / 2);
    expect(round(t.right)).toBe(w / 2);
  });
  describe('All options', () => {
    let tb;
    let tg;
    let t;
    beforeEach(() => {
      loadText('allOptions');
      [tb, tg] = diagram.elements._t.drawingObject.text;
      t = diagram.elements._t.getBoundingRect('diagram');
    });
    test('color', () => {
      expect(tb.font.color).toEqual([1, 0, 0, 1]);
      expect(tg.font.color).toEqual([1, 1, 0, 1]);
    });
    test('style', () => {
      expect(tb.font.style).toBe('normal');
      expect(tg.font.style).toBe('italic');
    });
    test('family', () => {
      expect(tb.font.family).toBe('Helvetica Neue');
      expect(tg.font.family).toBe('Helvetica');
    });
    test('weight', () => {
      expect(tb.font.weight).toBe('300');
      expect(tg.font.weight).toBe('bold');
    });
    test('size', () => {
      expect(tb.font.size).toBe(0.2);
      expect(tg.font.size).toBe(0.5);
    });
    test('bounds', () => {
      expect(round(tb.bounds.left)).toBe(-b.width / 2);
      expect(round(tb.bounds.bottom)).toBe(-b.height / 2);
      expect(round(tb.bounds.width)).toBe(b.width);
      expect(round(tb.bounds.height)).toBe(b.height);
      expect(round(tb.bounds.top)).toBe(b.height / 2);
      expect(round(tb.bounds.right)).toBe(b.width / 2);

      expect(round(tg.bounds.left)).toBe(round(-0.1));
      expect(round(tg.bounds.bottom)).toBe(round(-0.1));
      expect(round(tg.bounds.width)).toBe(round(g.width * 0.5 / 0.2));
      expect(round(tg.bounds.height)).toBe(round(g.height * 0.5 / 0.2));
      expect(round(tg.bounds.top)).toBe(round(-0.1 + g.height * 0.5 / 0.2));
      expect(round(tg.bounds.right)).toBe(round(-0.1 + g.width * 0.5 / 0.2));
    });
    test('Bounding Rect', () => {
      expect(round(t.left)).toBe(-0.1);
      expect(round(t.bottom)).toBe(-0.1);
      expect(round(t.width)).toBe(round(tg.bounds.width));
      expect(round(t.height)).toBe(round(tg.bounds.height));
      expect(round(t.top)).toBe(round(tg.bounds.top));
      expect(round(t.right)).toBe(round(tg.bounds.right));
    });
  });
});
