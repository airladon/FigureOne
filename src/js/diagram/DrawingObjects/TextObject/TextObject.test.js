
import {
  TextObject, DiagramFont, DiagramText,
} from './TextObject';
import {
  Point, Transform,
} from '../../../tools/g2';
import * as m2 from '../../../tools/m2';
import { round } from '../../../tools/math';
import DrawContext2D from '../../../__mocks__/DrawContext2DMock';

describe('Diagram Text Object', () => {
  let font;
  beforeEach(() => {
    font = new DiagramFont(
      'Helvetica Neue',
      '',
      1,
      '200',
      'center',
      'middle',
      [1, 0, 0, 1],
    );
  });
  describe('DiagramFont', () => {
    test('Instantiate default', () => {
      const df = new DiagramFont();
      const expected = new DiagramFont(
        'Helvetica Neue',
        '',
        1,
        '200',
        'center',
        'middle',
        null,
      );
      expect(df).toEqual(expected);
    });
    test('Color', () => {
      expect(font.color).toBe('rgba(255,0,0,1)');
    });
    test('Set', () => {
      const ctx = {};
      font.set(ctx, 2);
      expect(ctx.font).toBe(' 200 2px Helvetica Neue');
      expect(ctx.textAlign).toBe('center');
      expect(ctx.textBaseline).toBe('middle');
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
      textArray = [
        new DiagramText(new Point(0, 0), 'test1', font),
        new DiagramText(new Point(1, 1), 'test2', font),
      ];
    });
    test('Instantiation Default', () => {
      const to = new TextObject();
      expect(to.drawContext2D).toBe(undefined);
      expect(to.text).toEqual([]);
    });
    describe('Scaling factor', () => {
      test('Greater than 20', () => {
        textArray[0].font.size = 30;
        textArray[1].font.size = 30;
        const to = new TextObject(draw2D, textArray);
        expect(to.scalingFactor).toBe(1);
      });
      test('At threshold (20)', () => {
        textArray[0].font.size = 20;
        textArray[1].font.size = 20;
        const to = new TextObject(draw2D, textArray);
        expect(to.scalingFactor).toBe(1);
      });
      test('< 20', () => {
        textArray[0].font.size = 19;
        textArray[1].font.size = 19;
        const to = new TextObject(draw2D, textArray);
        expect(to.scalingFactor).toBe(19 * 50);
      });
      test('1', () => {
        textArray[0].font.size = 1;
        textArray[1].font.size = 1;
        const to = new TextObject(draw2D, textArray);
        expect(to.scalingFactor).toBe(1 * 50);
      });

      test('<1', () => {
        textArray[0].font.size = 0.1;
        textArray[1].font.size = 0.1;
        const to = new TextObject(draw2D, textArray);
        expect(round(to.scalingFactor, 5)).toBe(round(10 ** (1 + 2), 5));
      });
      test('variable sizes - but min < 1', () => {
        textArray[0].font.size = 10;
        textArray[1].font.size = 0.1;
        const to = new TextObject(draw2D, textArray);
        expect(round(to.scalingFactor, 5)).toBe(round(10 ** (1 + 2), 5));
      });
    });
    describe('GL Boundaries', () => {
      test('Text Boundary for 0,0 location, no scaling, no transformation', () => {
        const to = new TextObject(draw2D, textArray);
        const b = to.getGLBoundaryOfText(textArray[0], m2.identity());
        expect(b).toEqual([
          new Point(-10, 14.8),
          new Point(10, 14.8),
          new Point(10, -14.8),
          new Point(-10, -14.8),
        ]);
      });
      test('Text Boundary for 1, 1 location, no scaling, 0.5 transformation sacle', () => {
        const to = new TextObject(draw2D, textArray);
        const b = to.getGLBoundaryOfText(
          textArray[1],
          new Transform().scale(0.5, 0.5).matrix(),
        );
        expect(b).toEqual([
          new Point(-4.5, 7.9),
          new Point(5.5, 7.9),
          new Point(5.5, -6.9),
          new Point(-4.5, -6.9),
        ]);
      });
      test('All Text Boundaries', () => {
        const to = new TextObject(draw2D, textArray);
        const b = to.getGLBoundaries(new Transform().scale(0.5, 0.5).translate(1, 1).matrix());
        expect(b).toEqual([
          [
            new Point(-4, 8.4),
            new Point(6, 8.4),
            new Point(6, -6.4),
            new Point(-4, -6.4),
          ],
          [
            new Point(-3.5, 8.9),
            new Point(6.5, 8.9),
            new Point(6.5, -5.9),
            new Point(-3.5, -5.9),
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
            x: 1,
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
          .toEqual([0.68, -0.53, 1.05, 0.34, 1000, 750]);
        expect(draw2D.ctx.fillStyle).toBe('rgba(255,0,0,1)');
        expect(draw2D.ctx.filledText.text).toBe('test2');
        expect(round(draw2D.ctx.filledText.x, 2)).toBe(-600);
        expect(round(draw2D.ctx.filledText.y, 2)).toBe(-200);
      });
    });
  });
});
