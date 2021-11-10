// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
// import FontManager from '../FontManager';
import {
  Point, Rect, getBoundingBorder, isBuffer,
} from '../../tools/g2';
import type {
  TypeParsableBuffer, TypeParsableBorder,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import type { OBJ_FigurePrimitive } from './FigurePrimitiveTypes';
import type GLObject from '../DrawingObjects/GLObject/GLObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { OBJ_Font, TypeColor } from '../../tools/types';

export type OBJ_TextAdjustments = {
  width: number,
  descent: number,
  ascent: number,
};

export type OBJ_GLText = {
  text?: string,
  font?: OBJ_Font,
  xAlign?: 'left' | 'center' | 'right';
  yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments?: OBJ_TextAdjustments;
  border?: TypeParsableBuffer | TypeParsableBorder | 'buffer' | 'draw' | 'rect';
  touchBorder?: TypeParsableBuffer | TypeParsableBorder | 'rect' | 'border' | 'buffer' | 'draw';
  type: 'bmp' | '2d'
} & OBJ_FigurePrimitive;

export type OBJ_GLText_Fixed = {
  text: string,
  font: OBJ_Font,
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments: OBJ_TextAdjustments;
};

export type OBJ_SetText = {
  text?: string,
  font?: OBJ_Font,
  xAlign?: 'left' | 'center' | 'right';
  yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments?: OBJ_TextAdjustments;
  color?: TypeColor;
}

// $FlowFixMe
export default class FigureElementPrimitiveGLText extends FigureElementPrimitive {
  text: string;
  font: FigureFont;
  atlas: Object;

  adjustments: {
    width: number,
    descent: number,
    ascent: number,
  };

  measure: {
    ascent: number,
    descent: number,
    width: number,
  };

  location: Point;
  bounds: Rect;

  fontSize: number;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  dimension: number;

  // $FlowFixMe
  drawingObject: GLObject;
  textBorder: Array<Point>;
  textBorderBuffer: Array<Point>;

  setup(options: OBJ_GLText_Fixed) {
    this.font = new FigureFont(options.font);
    this.atlas = {};
    if (typeof options.text[0] === 'string') {
      // eslint-disable-next-line
      this.text = options.text[0];
    } else {
      this.text = options.text[0].text;
    }
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    // this.verticals = options.verticals;
    this.adjustments = options.adjustments;
    this.drawBorder = [[new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)]];
    this.drawBorderBuffer = this.drawBorder;
    this.color = this.font.color;
    this.location = new Point(0, 0);
    this.measure = {
      width: 1,
      descent: 0,
      ascent: 1,
    };
  }

  showMap(dimension: number = 1) {
    const d = dimension;
    this.drawingObject.updateVertices([0, 0, d, 0, d, d, 0, 0, d, d, 0, d]);
    const points = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
    this.drawingObject.updateTextureMap(points);
    this.animateNextFrame();
  }

  setFigure(figure: OBJ_FigureForElement) {
    this.figure = figure;
    if (figure != null) {
      this.recorder = figure.recorder;
      this.animationFinishedCallback = figure.animationFinished;
      this.timeKeeper = figure.timeKeeper;
      this.animations.timeKeeper = figure.timeKeeper;
      this.animations.recorder = figure.recorder;
    }
    if (this.isTouchable) {
      this.setTouchable();
    }
    if (this.isMovable) {
      this.setMovable();
    }
    // this.createAtlas();
    // console.log('creating atlas')
    this.atlas = this.drawingObject.webgl.getAtlas({
      scene: this.getScene(),
      font: this.font,
    });

    this.drawingObject.addTexture(this.atlas.font.getTextureID());
    // console.log(this.atlas)
    this.setText(this.text);

    this.atlas.notifications.add('updated', this.loaded.bind(this));
    // this.drawingObject.updateTexture(atlas.);
    // this.drawingObject.texture.data =
    // this.setText(this.text);
    this.notifications.publish('setFigure');
  }

  loaded() {
    this.setText(this.text);
  }

  measureAndAlignText() {
    if (Object.keys(this.atlas).length === 0) {
      return;
    }
    const { text } = this;
    const vertices = [];
    const texCoords = [];
    let x = 0;
    const r = this.font.size / this.atlas.fontSize;
    let totalWidth = 0;
    let maxDescent = 0;
    let maxAscent = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (this.atlas.map[this.text[i]] == null) {
        throw new Error(`Atlas Error: Character '${this.text[i]} (0x${this.text.charCodeAt(i).toString(16)})' is missing in atlas`);
      }
      const {
        width, ascent, descent, offsetX, offsetY,
      } = this.atlas.map[this.text[i]];
      const s = 0.5;
      const minX = x - width * r * s;
      const maxX = x + width * r + width * r * s;
      vertices.push(minX, -descent * r, maxX, -descent * r, maxX, ascent * r);
      vertices.push(minX, -descent * r, maxX, ascent * r, minX, ascent * r);
      texCoords.push(
        offsetX - width * s, offsetY - descent,
        offsetX + width + width * s, offsetY - descent,
        offsetX + width + width * s, offsetY + ascent,
      );
      texCoords.push(
        offsetX - width * s, offsetY - descent,
        offsetX + width + width * s, offsetY + ascent,
        offsetX - width * s, offsetY + ascent,
      );
      x += width * r;
      totalWidth += width * r;
      maxDescent = Math.max(descent * r, maxDescent);
      maxAscent = Math.max(ascent * r, maxAscent);
    }

    if (this.font.underline !== false) {
      const uDescent = this.font.underline.descent;
      const uWidth = this.font.underline.width;
      if (uDescent > maxDescent) {
        maxDescent = uDescent;
      }
      if (uDescent < 0) {
        if (-uDescent + uWidth > maxAscent) {
          maxAscent = -uDescent + uWidth;
        }
      }
      vertices.push(
        0, -uDescent, totalWidth, -uDescent, totalWidth, uWidth - uDescent,
        0, -uDescent, totalWidth, uWidth - uDescent, 0, uWidth - uDescent,
      );
      texCoords.push(0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1);
    }

    maxAscent += this.adjustments.ascent;
    maxDescent += this.adjustments.descent;
    totalWidth += this.adjustments.width;
    let ox = 0;
    let oy = 0;
    if (this.xAlign === 'center') {
      ox = -totalWidth / 2;
    } else if (this.xAlign === 'right') {
      ox = -totalWidth;
    }
    if (this.yAlign === 'bottom') {
      oy = maxDescent;
    } else if (this.yAlign === 'top') {
      oy = -maxAscent;
    } else if (this.yAlign === 'middle') {
      oy = maxDescent - (maxAscent + maxDescent) / 2;
    }
    for (let i = 0; i < vertices.length; i += 2) {
      vertices[i] += ox;
    }
    for (let i = 1; i < vertices.length; i += 2) {
      vertices[i] += oy;
    }
    this.drawingObject.updateVertices(vertices);
    this.drawingObject.updateTextureMap(texCoords.map(v => v / this.atlas.dimension));
    this.location = new Point(ox, oy);
    this.measure = {
      ascent: maxAscent,
      descent: maxDescent,
      width: totalWidth,
    };
    // console.log(this.adjustments)
  }

  /**
   * Change the text in the primitive.
   *
   * @param {string | OBJ_SetText} text
   */
  setText(text: string | OBJ_SetText) {
    if (typeof text === 'string') {
      this.text = text;
    } else {
      if (text.font != null) {
        this.font = new FigureFont(joinObjects({}, this.font.definition(), text.font));
      }
      if (text.xAlign != null) {
        this.xAlign = text.xAlign;
      }
      if (text.yAlign != null) {
        this.yAlign = text.yAlign;
      }
      if (text.adjustments != null) {
        this.adjustments = joinObjects({}, this.adjustments, text.adjustments);
      }
      if (text.text != null) {
        this.text = text.text;
      }
    }
    this.measureAndAlignText();
    this.calcBorderAndBounds();
    if (this.font.color != null) {
      this.setColor(this.font.color, true);
    }
  }

  /**
   * Get the text shown by the primitive.
   *
   * @return string
   */
  getText() {
    return this.text;
  }

  /**
   * Change only the font of the text.
   *
   * @param {OBJ_Font} font
   */
  setFont(font: OBJ_Font) {
    const newFont = joinObjects({}, this.font.definition(), font);
    this.font = new FigureFont(newFont);
    this.measureAndAlignText();
    this.calcBorderAndBounds();
    if (this.font.color != null) {
      this.setColor(this.font.color, true);
    }
  }

  setColor(color: TypeColor, setDefault: boolean = true) {
    super.setColor(color, setDefault);
    this.font.color = color.slice();
  }

  calcBorderAndBounds() {
    this.calcBorder();
    this.calcTouchBorder();
  }

  calcBorder() {
    const bounds = new Rect(
      this.location.x,
      this.location.y - this.measure.descent,
      this.measure.width,
      this.measure.ascent + this.measure.descent,
    );
    this.drawBorder = [[
      new Point(bounds.left, bounds.bottom),
      new Point(bounds.right, bounds.bottom),
      new Point(bounds.right, bounds.top),
      new Point(bounds.left, bounds.top),
    ]];
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.drawBorderBuffer = [getBoundingBorder(this.drawBorder, this.touchBorder)];
    } else { // $FlowFixMe
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  // _getStateProperties(options: { ignoreShown?: boolean }) {
  //   // eslint-disable-line class-methods-use-this
  //   return [...super._getStateProperties(options),
  //     'xAlign',
  //     'pan',
  //     'onlyWhenTouched',
  //     'originalPosition',
  //   ];
  // }
}
