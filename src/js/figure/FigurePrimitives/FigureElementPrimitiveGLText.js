// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
import FontManager from '../FontManager';
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
  // setText(text: string) {
  //   this.text = text;
  // }

  // measureText(text: string, fontSize: number, width: number) {
  //   const aWidth = fontSize / 2;
  //   let ascent = aWidth * this.font.maxAscent;
  //   let descent = aWidth * this.font.descent;
  //   // const maxAscentRe =
  //   //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
  //   const midAscentRe = /[acemnorsuvwxz*gyqp: ]/g;
  //   const midDecentRe = /[;,$]/g;
  //   let maxDescentRe = /[gjyqp@Q(){}[\]|]/g;
  //   if (this.font.family === 'Times New Roman') {
  //     if (this.font.style === 'italic') {
  //       maxDescentRe = /[gjyqp@Q(){}[\]|f]/g;
  //     }
  //   }
  //   const midAscentMatches = text.match(midAscentRe);
  //   if (Array.isArray(midAscentMatches)) {
  //     if (midAscentMatches.length === text.length) {
  //       ascent = aWidth * this.font.midAscent;
  //     }
  //   }

  //   const midDescentMatches = text.match(midDecentRe);
  //   if (Array.isArray(midDescentMatches)) {
  //     if (midDescentMatches.length > 0) {
  //       descent = aWidth * this.font.midDescent;
  //     }
  //   }

  //   const maxDescentMatches = text.match(maxDescentRe);
  //   if (Array.isArray(maxDescentMatches)) {
  //     if (maxDescentMatches.length > 0) {
  //       descent = aWidth * this.font.maxDescent;
  //     }
  //   }

  //   return {
  //     ascent, descent, width,
  //   };
  // }

  // createAtlas(force: boolean = false) {
  //   const { gl, webgl } = this.drawingObject;
  //   const scene = this.getScene();
  //   if (scene == null) {
  //     return;
  //   }
  //   const fontSize = this.font.size / scene.heightNear * gl.canvas.height;
  //   this.fontSize = fontSize;
  //   const id = `${this.font.family}${fontSize}${this.font.style}${this.font.weight}`;
  //   this.drawingObject.addTexture(`${this.font.family}${fontSize}${this.font.style}${this.font.weight}`);
  //   if (!force && webgl.textures[id] != null) {
  //     // this.drawingObject.texture.id = id;
  //     this.atlas = webgl.textures[id].atlas;
  //     this.dimension = webgl.textures[id].atlasDimension;
  //     this.drawingObject.initTexture();
  //     return;
  //   }

  //   /* eslint-disable */
  //   // const atlasString = `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm,./<>?;':"[]\{}|1234567890!@#$%^&*()-=_+" \u00ba\u00b0\u2212\u00d7\u00f7\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9`;
  //   /* eslint-enable */
  //   const atlasString = FontManager.all;

  //   const dimension = Math.ceil(Math.sqrt(atlasString.length) + 2) * fontSize * 1.2;

  //   const canvas = document.createElement('canvas');
  //   canvas.width = dimension;
  //   canvas.height = dimension;
  //   this.dimension = dimension;

  //   const ctx = canvas.getContext('2d');
  //   ctx.font = `${this.font.style} ${this.font.weight} ${fontSize}px ${this.font.family}`;

  //   let x = fontSize;
  //   let y = fontSize;

  //   for (let i = 0; i < atlasString.length; i += 1) {
  //     ctx.fillText(atlasString[i], x, y);
  //     const {
  //       width, ascent, descent,
  //     } = this.measureText(
  //       atlasString[i], fontSize, ctx.measureText(atlasString[i]).width,
  //     );
  //     const offsetX = x;
  //     const offsetY = this.dimension - y;
  //     // x += ctx.measureText(atlasString[i]).width;
  //     this.atlas[atlasString[i]] = {
  //       width, ascent, descent, offsetX, offsetY,
  //     };
  //     x += width * 2.5;
  //     if (x >= dimension - fontSize) {
  //       x = fontSize;
  //       y += fontSize * 1.2;
  //     }
  //   }
  //   // Create a small square to draw color from when drawing the underline
  //   ctx.fillRect(0, this.dimension - 2, 2, 2);
  //   // this.drawingObject.texture.data = ctx.canvas;
  //   // this.drawingObject.initTexture();
  //   this.drawingObject.updateTexture(ctx.canvas);
  //   webgl.textures[id].atlas = joinObjects({}, this.atlas);
  //   webgl.textures[id].atlasDimension = this.dimension;
  // }

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
      const [uDescent, uWidth] = this.font.getUnderline();
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
    // this.calcBounds();
    this.calcBorder();
    this.calcTouchBorder();
  }

  // calcBounds() {
  //   this.bounds = new Rect(
  //     this.location.x,
  //     this.location.y - this.measure.descent,
  //     this.measure.width,
  //     this.measure.ascent + this.measure.descent,
  //   );
  // }

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
    // this.drawBorder = this.textBorder;
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.drawBorderBuffer = [getBoundingBorder(this.drawBorder, this.touchBorder)];
    } else { // $FlowFixMe
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  // // eslint-disable-next-line class-methods-use-this
  // setTextBorder() {}

  // // eslint-disable-next-line class-methods-use-this
  // setTouchBorder() {}

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
