// import {
//   Point,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

describe('Equation Functions - Box', () => {
  let diagram;
  let textOptions;
  let loadText;
  let a;
  let b;
  let g;
  beforeEach(() => {
    diagram = makeDiagram();
    textOptions = {
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
      // twoChar: {
      //   text: 'ab',
      // },
    };
    loadText = (option) => {
      diagram.addElement({
        name: 't',
        method: 'text',
        options: textOptions[option]
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
  test('one character a, center, middle', () => {
    loadText('aCenterMiddle');
    const t = diagram.elements._t.getBoundingRect('diagram');
    expect(round(t.left)).toBe(-a.width / 2);
    expect(round(t.bottom)).toBe(-a.height / 2);
    expect(round(t.width)).toBe(a.width);
    expect(round(t.height)).toBe(a.height);
    expect(round(t.top)).toBe(a.height / 2);
    expect(round(t.right)).toBe(a.width / 2);
  });
});
