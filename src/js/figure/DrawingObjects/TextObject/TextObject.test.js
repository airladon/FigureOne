
import {
  FigureFont,
} from './TextObject';
import {
  Point,
} from '../../../tools/g2';
// import * as m2 from '../../../tools/m2';
// import { round } from '../../../tools/math';
// import DrawContext2D from '../../../__mocks__/DrawContext2DMock';
import makeFigure from '../../../__mocks__/makeFigure';

describe('Figure Text Object', () => {
  let font;
  beforeEach(() => {
    font = new FigureFont({
      family: 'Helvetica Neue',
      style: '',
      size: 1,
      weight: '200',
      color: [1, 0, 0, 1],
    });
  });
  describe('FigureFont', () => {
    test('Instantiate default', () => {
      const df = new FigureFont();
      const expected = new FigureFont({
        family: 'Times New Roman',
        style: 'normal',
        size: 1,
        weight: '200',
        color: null,
      });
      expect(df).toEqual(expected);
    });
    test('Color', () => {
      expect(font.color).toEqual([1, 0, 0, 1]);
    });
    test('Set', () => {
      const ctx = {};
      font.setFontInContext(ctx, 2);
      expect(ctx.font).toBe(' 200 2px Helvetica Neue');
    });
    test('Copy', () => {
      const f2 = font._dup();
      expect(font).not.toBe(f2);
      expect(font).toEqual(f2);
      const oldSize = font.size;
      font.size = 100;
      expect(f2.size).toBe(oldSize);
    });
  });
  describe('Text', () => {
    let figure;
    let addText;
    let t;
    beforeEach(() => {
      figure = makeFigure();
      const ways = {
        singleDefaults: {
          text: 'a',
        },
      };
      addText = (way) => {
        figure.addElement({ name: 'text', method: 'text', options: ways[way] });
        figure.initialize();
        t = figure.elements._text.drawingObject;
      };
    });
    test('Single Text', () => {
      addText('singleDefaults');
      const [t0] = t.text;
      expect(t0.text).toBe('a');
      expect(t0.font).toEqual({
        family: 'Helvetica',
        size: 0.2,
        color: null,
        style: 'normal',
        weight: 'normal',
        opacity: 1,
      });
      expect(t0.location).toEqual(new Point(0, 0));
      expect(t0.xAlign).toBe('left');
      expect(t0.yAlign).toBe('baseline');
    });
  });
});
