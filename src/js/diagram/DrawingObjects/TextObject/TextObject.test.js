
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

  describe('DiagramText', () => {
    test('Instantiation', () => {
      const location = new Point(1, 1);
      const text = 'test text';
      const dt = new DiagramText(
        new DrawContext2D(1000, 500),
        location,
        text,
        font,
      );
      expect(dt.location).not.toBe(location);
      expect(dt.location).toEqual(location);
      expect(dt.font).not.toBe(font);
      expect(dt.font).toEqual(font);
      expect(dt.text).toBe(text);
    });
  });

  describe('Text Object', () => {
    let draw2D;
    let textArray;
    beforeEach(() => {
      font.size = 20;
      draw2D = new DrawContext2D(1000, 500);
      // textArray = [
      //   new DiagramText(draw2D, new Point(0, 0), 'test1', font, 'center', 'middle'),
      //   new DiagramText(draw2D, new Point(1, 1), 'test2', font, 'center', 'middle'),
      // ];
      textArray = [
        [{
          font,
          xAlign: 'center',
          yAlign: 'middle',
          location: new Point(0, 0),
        }, 'test1'],
        [{
          font,
          xAlign: 'center',
          yAlign: 'middle',
          location: new Point(0, 0),
        }, 'test2'],
      ];
    });
    describe('Scaling factor', () => {
      test('Greater than 20', () => {
        textArray[0][0].font.size = 30;
        textArray[1][0].font.size = 30;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        expect(round(to.scalingFactor, 3)).toBe(round(20 / 30, 3));
      });
      test('At threshold (20)', () => {
        textArray[0][0].font.size = 20;
        textArray[1][0].font.size = 20;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        expect(to.scalingFactor).toBe(1);
      });
      test('< 20', () => {
        textArray[0][0].font.size = 19;
        textArray[1][0].font.size = 19;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        // expect(to.scalingFactor).toBe(19 * 50);
        expect(round(to.scalingFactor, 3)).toBe(round(20 / 19, 3));
      });
      test('1', () => {
        textArray[0][0].font.size = 1;
        textArray[1][0].font.size = 1;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        // expect(to.scalingFactor).toBe(1 * 50);
        expect(round(to.scalingFactor, 3)).toBe(round(20 / 1, 3));
      });

      test('<1', () => {
        textArray[0][0].font.size = 0.1;
        textArray[1][0].font.size = 0.1;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        // expect(round(to.scalingFactor, 5)).toBe(round(10 ** (1 + 2), 5));
        expect(round(to.scalingFactor, 3)).toBe(round(20 / 0.1, 3));
      });
      test('variable sizes - but min < 1', () => {
        textArray[0][0].font.size = 10;
        textArray[1][0].font.size = 0.1;
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        // expect(round(to.scalingFactor, 5)).toBe(round(10 ** (1 + 2), 5));
        expect(round(to.scalingFactor, 3)).toBe(round(20 / 0.1, 3));
      });
    });
    describe('GL Boundaries', () => {
      test('Text Boundary for 0,0 location, no scaling, no transformation', () => {
        // const to = new TextObject(draw2D, textArray);
        const to = new TextObject(draw2D);
        to.loadText({ text: textArray });
        console.log(to.text[0].bounds);
        console.log(to.text[0].getGLBoundary(m2.identity()));
        const b = to.getGLBoundaryOfText(to.text[0], m2.identity());
        expect(b).toEqual([
          new Point(-5, 7.4),
          new Point(5, 7.4),
          new Point(5, -7.4),
          new Point(-5, -7.4),
        ]);
      });
      test('Text Boundary for 1, 1 location, no scaling, 0.5 transformation sacle', () => {
        const to = new TextObject(draw2D, textArray);
        const b = to.getGLBoundaryOfText(
          textArray[1],
          new Transform().scale(0.5, 0.5).matrix(),
        );
        expect(b).toEqual([
          new Point(-2, 4.2),
          new Point(3, 4.2),
          new Point(3, -3.2),
          new Point(-2, -3.2),
        ]);
      });
      test('All Text Boundaries', () => {
        const to = new TextObject(draw2D, textArray);
        const b = to.getGLBoundaries(new Transform().scale(0.5, 0.5).translate(1, 1).matrix());
        expect(b).toEqual([
          [
            new Point(-1.5, 4.7),
            new Point(3.5, 4.7),
            new Point(3.5, -2.7),
            new Point(-1.5, -2.7),
          ],
          [
            new Point(-1, 5.2),
            new Point(4, 5.2),
            new Point(4, -2.2),
            new Point(-1, -2.2),
          ],
        ]);
      });
    });
    describe('Drawing', () => {
      test('Draw with Identity Transform Matrix', () => {
        const to = new TextObject(draw2D, textArray);
        to.drawWithTransformMatrix(m2.identity());
        expect(draw2D.ctx.transformMatrix)
          .toEqual([500, 0, 0, 250, 500, 250]);
        expect(draw2D.ctx.fillStyle).toBe('rgba(255,0,0,1)');
        expect(draw2D.ctx.filledText)
          .toEqual({
            text: 'test2',
            x: 6,
            y: -1,
            count: 2,
          });
      });
      test('Draw with Real Transform Matrix, location and font size', () => {
        textArray[0].font.size = 0.5;
        textArray[1].font.size = 0.5;
        textArray[1].location.x = -3;
        const to = new TextObject(draw2D, textArray);
        to.drawWithTransformMatrix(new Transform()
          .scale(0.5, 0.5)
          .rotate(1)
          .translate(1, -2)
          .matrix());
        expect(draw2D.ctx.filledText.count).toBe(2);
        expect(round(draw2D.ctx.transformMatrix, 2))
          .toEqual([3.38, -2.63, 5.26, 1.69, 1000, 750]);
        expect(draw2D.ctx.fillStyle).toBe('rgba(255,0,0,1)');
        expect(draw2D.ctx.filledText.text).toBe('test2');
        expect(round(draw2D.ctx.filledText.x, 2)).toBe(5);
        expect(round(draw2D.ctx.filledText.y, 2)).toBe(-40);
      });
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
