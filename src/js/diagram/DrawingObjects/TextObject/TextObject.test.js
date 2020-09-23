
import {
  TextObject, DiagramFont, DiagramText,
} from './TextObject';
import {
  Point, Transform,
} from '../../../tools/g2';
import * as m2 from '../../../tools/m2';
import { round } from '../../../tools/math';
import DrawContext2D from '../../../__mocks__/DrawContext2DMock';
import makeDiagram from '../../../__mocks__/makeDiagram';

describe('Diagram Text Object', () => {
  let font;
  beforeEach(() => {
    font = new DiagramFont({
      family: 'Helvetica Neue',
      style: '',
      size: 1,
      weight: '200',
      color: [1, 0, 0, 1],
    });
  });
  describe('DiagramFont', () => {
    test('Instantiate default', () => {
      const df = new DiagramFont();
      const expected = new DiagramFont({
        family: 'Times New Roman',
        style: '',
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
    let diagram;
    let addText;
    let t;
    beforeEach(() => {
      diagram = makeDiagram();
      const ways = {
        singleDefaults: {
          text: 'a',
        },
      };
      addText = (way) => {
        diagram.addElement({ name: 'text', method: 'text', options: ways[way] });
        diagram.initialize();
        t = diagram.elements._text.drawingObject;
      };
    });
    test('Single Text', () => {
      addText('singleDefaults');
      const [t0] = t.text;
      expect(t0.text).toBe('a');
      expect(t0.font).toEqual({
        family: 'Times New Roman',
        size: 0.2,
        color: null,
        style: 'normal',
        weight: '200',
        opacity: 1,
      });
      expect(t0.location).toEqual(new Point(0, 0));
      expect(t0.xAlign).toBe('left');
      expect(t0.yAlign).toBe('baseline');
    });
  });
});
