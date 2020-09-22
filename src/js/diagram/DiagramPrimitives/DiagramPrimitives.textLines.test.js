import {
  Point,
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
  // let g;
  beforeEach(() => {
    diagram = makeDiagram();
    textOptions = {
      allOptions: {
        text: [
          'This is the first line',
          'Second line has a |superscript| modifier that isn\'t inline',
          [
            {
              font: {
                family: 'Times New Roman',
                weight: 'bold',
                style: 'italic',
                size: 0.1,
                color: [1, 1, 0, 1],
              },
              lineSpace: -0.3,
              justification: 'center',
            },
            'A line with new defaults',
          ],
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
        transform: [['s', 1, 1], ['r', 1], ['t', 0, 0]],
      },
      abLeftBaseline: {
        text: ['a', 'b'],
        lineSpace: -0.2,
      },
      centerJustification: {
        text: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'center',
      },
      rightJustification: {
        text: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'right',
      },
      alignCenterMiddle: {
        text: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'center',
        xAlign: 'center',
        yAlign: 'middle',
      },
      alignRightTop: {
        text: ['aaaaa', 'b'],
        lineSpace: -0.2,
        justification: 'right',
        xAlign: 'right',
        yAlign: 'top',
      },
      // abCenterMiddle: {
      //   text: ['a', 'b'],
      //   xAlign: 'center',
      //   yAlign: 'middle',
      // },
      // abRightTop: {
      //   text: ['a', 'b'],
      //   xAlign: 'right',
      //   yAlign: 'top',
      // },
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
      diagram.addElement({
        name: 't',
        method: 'textLines',
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
    // g = {
    //   ascent: 0.095,
    //   descent: 0.05,
    //   width: 0.1,
    //   height: 0.145,
    // };
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
  
  // test('ab, center, middle', () => {
  //   loadText('abCenterMiddle');
  //   const t = diagram.elements._t.getBoundingRect('diagram');
  //   const ta = diagram.elements._t.drawingObject.text[0].bounds;
  //   const tb = diagram.elements._t.drawingObject.text[1].bounds;
  //   const w = a.width + b.width;
  //   const h = b.height;
  //   expect(round(t.left)).toBe(-w / 2);
  //   expect(round(t.bottom)).toBe(-h / 2);
  //   expect(round(t.width)).toBe(w);
  //   expect(round(t.height)).toBe(h);
  //   expect(round(t.top)).toBe(h / 2);
  //   expect(round(t.right)).toBe(w / 2);
  //   expect(ta.left).toBe(-w / 2);
  //   expect(ta.right).toBe(ta.left + a.width);
  //   expect(tb.left).toBe(ta.right);
  //   expect(tb.right).toBe(ta.right + b.width);
  //   expect(ta.bottom).toBe(tb.bottom);
  // });
  // test('ab, right, top', () => {
  //   loadText('abRightTop');
  //   const t = diagram.elements._t.getBoundingRect('diagram');
  //   const ta = diagram.elements._t.drawingObject.text[0].bounds;
  //   const tb = diagram.elements._t.drawingObject.text[1].bounds;
  //   const w = a.width + b.width;
  //   const h = b.height;
  //   expect(round(t.left)).toBe(-w);
  //   expect(round(t.bottom)).toBe(-h);
  //   expect(round(t.width)).toBe(w);
  //   expect(round(t.height)).toBe(h);
  //   expect(round(t.top)).toBe(0);
  //   expect(round(t.right)).toBe(0);
  //   expect(ta.left).toBe(-w);
  //   expect(ta.right).toBe(ta.left + a.width);
  //   expect(tb.left).toBe(ta.right);
  //   expect(tb.right).toBe(ta.right + b.width);
  //   expect(ta.bottom).toBe(tb.bottom);
  // });
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
  // describe('All Options', () => {
  //   let tb;
  //   let tg;
  //   let ta;
  //   beforeEach(() => {
  //     loadText('allOptions');
  //     [tb, tg, ta] = diagram.elements._t.drawingObject.text;
  //   });
  //   test('color', () => {
  //     expect(tb.font.color).toEqual([1, 0, 0, 1]);
  //     expect(tg.font.color).toEqual([1, 1, 0, 1]);
  //     expect(ta.font.color).toEqual([1, 0, 0, 1]);
  //   });
  //   test('style', () => {
  //     expect(tb.font.style).toEqual('normal');
  //     expect(tg.font.style).toEqual('italic');
  //     expect(ta.font.style).toEqual('normal');
  //   });
  //   test('size', () => {
  //     expect(tb.font.size).toEqual(0.2);
  //     expect(tg.font.size).toEqual(0.5);
  //     expect(ta.font.size).toEqual(0.2);
  //   });
  //   test('family', () => {
  //     expect(tb.font.family).toEqual('Helvetica Neue');
  //     expect(tg.font.family).toEqual('Helvetica');
  //     expect(ta.font.family).toEqual('Helvetica Neue');
  //   });
  //   test('weight', () => {
  //     expect(tb.font.weight).toEqual('200');
  //     expect(tg.font.weight).toEqual('bold');
  //     expect(ta.font.weight).toEqual('200');
  //   });
  //   test('bounds', () => {
  //     const _b = tb.bounds;
  //     const _g = tg.bounds;
  //     const _a = ta.bounds;
  //     expect(round(_b.left)).toBe(0);
  //     expect(round(_b.bottom)).toBe(0);
  //     expect(round(_b.right)).toBe(round(_b.left + _b.width));
  //     expect(round(_b.width)).toBe(0.1);
  //     expect(round(_a.width)).toBe(0.1);
  //     expect(round(_g.width)).toBe(0.1 * 0.5 / 0.2);
  //     expect(round(_a.left)).toBe(round(_b.right));
  //     expect(round(_a.right)).toBe(round(_a.left + _a.width));
  //     expect(round(_g.left)).toBe(round(_b.right + 0.2));
  //     expect(round(_g.bottom))
  //       .toBe(round(tb.measure.descent + _b.bottom + 0.2 - tg.measure.descent));
  //     expect(round(_g.top)).toBe(round(_g.bottom + tg.measure.ascent + tg.measure.descent));

  //     const t = diagram.elements._t.getBoundingRect('diagram');
  //     expect(t.left).toBe(_b.left);
  //     expect(t.right).toBe(_g.right);
  //     expect(t.bottom).toBe(_b.bottom);
  //     expect(t.top).toBe(_g.top);
  //   });
  // });
});
