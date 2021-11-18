// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
// import FontManager from '../FontManager';
import {
  Point, Rect, getBoundingBorder, isBuffer, getPoints,
} from '../../tools/g2';
import type {
  TypeParsableBuffer, TypeParsableBorder,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import type { OBJ_FigurePrimitive } from './FigurePrimitiveTypes';
import type GLObject from '../DrawingObjects/GLObject/GLObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { OBJ_Font, TypeColor } from '../../tools/types';

/**
 * Define the width, descent or ascent of a text element. This can be used if
 * the estimated width, descent or ascent is not what is desired.
 * @property {number} [width]
 * @property {number} [descent]
 * @property {number} [ascent]
 */
export type OBJ_TextAdjustments = {
  width?: number,
  descent?: number,
  ascent?: number,
};

/* eslint-disable max-len */
/**
 * Text options object that extends {@link OBJ_FigurePrimitive}.
 *
 * Text can be rendered into a [2D canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * or into the WebGL canvas using the texture atlas.
 *
 * A texture atlas can either be supplied as an image, or generated
 * automatically by FigureOne based on css font definitions.
 *
 * Choosing how to render text depends on the application.
 *
 * If text size is to be animated through a large scale range, then rendering
 * on the 2D canvas is advantageous as it can scale text to any size without a
 * loss of sharpness. The main disadvantage of the 2D canvas is the fact that
 * it's a different HTML canvas element to the WebGL canvas. Thus all text on
 * the 2D canvas will always be above (default) or below the WebGl canvas
 * independent of when it is drawn. This means text will always be above or
 * below shapes. regenerated each time the size changes by some threshold.
 *
 * Conversely, drawing text on the WebGL canvas provides control on which
 * shapes can hide text and vise versa. The disadvantage is that text is drawn
 * from a texture atlas of bitmapped fonts. This means as text is progressively
 * scaled up or down, the the text will look more pixelated or blurry. For many
 * scalings (like common scalings in an equation), this will likely not be a
 * problem. But for large changes in animated scale, it will be better to use
 * the 2D canvas. Scaling also needs to be considered if the WebGL canvas is
 * expected to be resized. On a desktop browser, a canvas element can be
 * resized a lot, and so if using the WebGL atlas, it may need to be
 *
 *
 * By default, text is drawn on the WebGL canvas, and text atlases are
 * automatically generated from the font selected. Use the `type` property to
 * choose where to render the text.
 *
 * Rendering text on the 2D canvas is advantages if the text needs to be scaled a lot in animation.
 *
 * Note, the choice of where to render text can be made for each text element.
 * Therefore it is possible to have some text rendered to the 2D canvas, and
 * other text rendered to the WebGL canvas in the same figure.
 *
 * @property {string} [text]
 * @property {OBJ_Font} [font]
 * @property {'left' | 'center' | 'right'} [xAlign]
 * @property {'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline'} [yAlign]
 * @property {OBJ_TextAdjustments} [adjustments]
 * @property {TypeParsableBuffer | TypeParsableBorder | 'buffer' | 'draw' | 'rect'} [border]
 * @property {TypeParsableBuffer | TypeParsableBorder | 'rect' | 'border' | 'buffer' | 'draw'} [touchBorder]
 * @property {'bmp' | '2d'} [type]
 */
/* eslint-enable max-len */
export type OBJ_Text = {
  text?: string | Array<string>,
  location?: TypeParsablePoint | Array<TypeParsablePoint>,
  font?: OBJ_Font,
  xAlign?: 'left' | 'center' | 'right';
  yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments?: OBJ_TextAdjustments;
  border?: TypeParsableBuffer | TypeParsableBorder | 'buffer' | 'draw' | 'rect';
  touchBorder?: TypeParsableBuffer | TypeParsableBorder | 'rect' | 'border' | 'buffer' | 'draw';
  type: 'bmp' | '2d'
} & OBJ_FigurePrimitive;

export type OBJ_Text_Fixed = {
  text: Array<string>,
  location: Array<Point>,
  font: OBJ_Font,
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments: OBJ_TextAdjustments;
};

/**
 * Options object for setting new text in a {@link FigureElementPrimitiveGLText}.
 *
 * @property {string} [text] new text to use
 * @property {OBJ_Font} [font] define if font needs to be changed
 * @property {'left' | 'center' | 'right'} [xAlign] xAlignment of text
 * @property {'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline'} [yAlign]
 * y alignment of text
 * @property {OBJ_TextAdjustments} [adjustments] adjustments to the calculated
 * borders of the text
 * @property {TypeColor} [color] text color (will be overriden by a font color
 * if it is specified)
 */
export type OBJ_SetText = {
  text?: string | Array<string>,
  location?: TypeParsablePoint | Array<TypeParsablePoint>,
  font?: OBJ_Font,
  xAlign?: 'left' | 'center' | 'right';
  yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  adjustments?: OBJ_TextAdjustments;
  color?: TypeColor;
}


/**
 * FigureElementPrimitive that handles drawing text in WebGL.
 *
 * WebGL text is rendered using a texture atlas of fonts - an image
 * with all the glyphs, and a map of the locations, ascent, descent and width
 * of each glyph.
 */
// $FlowFixMe
export default class FigureElementPrimitiveGLText extends FigureElementPrimitive {
  text: Array<string>;
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
    left: number,
    right: number,
    top: number,
    bottom: number,
  };

  location: Array<Point>;

  fontSize: number;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';

  // $FlowFixMe
  drawingObject: GLObject;
  // textBorder: Array<Point>;
  // textBorderBuffer: Array<Point>;
  atlasNotificationsID: number;

  setup(options: OBJ_Text_Fixed) {
    this.font = new FigureFont(options.font);
    this.atlas = {};
    if (typeof options.text[0] === 'object') {
      this.text = [options.text[0].text];
    } else {
      this.text = options.text;
    }
    // if (typeof options.text[0] === 'string') {
    //   // eslint-disable-next-line
    //   this.text = options.text[0];
    // } else {
    //   this.text = options.text[0].text;
    // }
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    // this.verticals = options.verticals;
    this.adjustments = options.adjustments;
    this.drawBorder = [[new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)]];
    this.drawBorderBuffer = this.drawBorder;
    this.color = this.font.color;
    if (options.location != null) {
      this.location = getPoints(options.location);
    } else {
      this.location = this.text.map(() => new Point(0, 0));
    }
    // this.location = new Point(0, 0);
    this.measure = {
      width: 1,
      descent: 0,
      ascent: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    this.createAtlas(options.scene);
    // this.atlas = this.drawingObject.webgl.getAtlas({
    //   scene: options.scene,
    //   font: this.font,
    // });

    // if (this.drawingObject.texture == null) {
    //   this.drawingObject.addTexture(this.atlas.font.getTextureID());
    // } else {
    //   this.drawingObject.texture.id = this.atlas.font.getTextureID());
    // }
    // // console.log(this.atlas)
    // this.setText(this.text);

    // this.atlasNotificationsID = this.atlas.notifications.add('updated', this.loaded.bind(this));
  }

  createAtlas(scene: Scene = this.getScene()) {
    if (this.atlas != null && this.atlasNotificationsID != null) {
      this.atlas.notifications.remove('updated', this.atlasNotificationsID);
    }

    this.atlas = this.drawingObject.webgl.getAtlas({
      scene,
      font: this.font,
    });

    if (this.drawingObject.texture == null) {
      this.drawingObject.addTexture(this.atlas.font.getTextureID());
    } else {
      this.drawingObject.texture.id = this.atlas.font.getTextureID();
    }
    // console.log(this.atlas)
    this.setText(this.text);

    this.atlasNotificationsID = this.atlas.notifications.add('updated', this.loaded.bind(this));
  }

  /**
   * Debug method - will replace the drawn text with the texture atlas so it
   * can be reviewed.
   *
   * @param {number} dimension size of the texture atlas to draw (`1`)
   */
  showMap(dimension: number = 1) {
    const d = dimension;
    this.drawingObject.updateVertices([0, 0, d, 0, d, d, 0, 0, d, d, 0, d]);
    const points = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
    this.drawingObject.updateTextureMap(points);
    this.animateNextFrame();
  }

  // setFigure(figure: OBJ_FigureForElement) {
  //   // this.figure = figure;
  //   // if (figure != null) {
  //   //   this.recorder = figure.recorder;
  //   //   this.animationFinishedCallback = figure.animationFinished;
  //   //   this.timeKeeper = figure.timeKeeper;
  //   //   this.animations.timeKeeper = figure.timeKeeper;
  //   //   this.animations.recorder = figure.recorder;
  //   // }
  //   // if (this.isTouchable) {
  //   //   this.setTouchable();
  //   // }
  //   // if (this.isMovable) {
  //   //   this.setMovable();
  //   // }
  //   super.setFigure(figure, false);
  //   // this.createAtlas();
  //   // console.log('creating atlas')
  //   this.atlas = this.drawingObject.webgl.getAtlas({
  //     scene: this.getScene(),
  //     font: this.font,
  //   });

  //   this.drawingObject.addTexture(this.atlas.font.getTextureID());
  //   // console.log(this.atlas)
  //   this.setText(this.text);

  //   this.atlas.notifications.add('updated', this.loaded.bind(this));
  //   // this.drawingObject.updateTexture(atlas.);
  //   // this.drawingObject.texture.data =
  //   // this.setText(this.text);
  //   this.notifications.publish('setFigure');
  // }

  /**
   * Recreate texture atlas.
   *
   * This is useful if a font has changed after an atlas has been
   * auto-generated. Recreating the atlas will use the new version of the
   * font.
   */
  recreateAtlas() {
    this.atlas.recreate();
  }

  loaded() {
    this.setText(this.text);
    this.animateNextFrame();
  }

  measureAndAlignText() {
    if (Object.keys(this.atlas).length === 0) {
      return;
    }
    // const { text } = this;
    const vertices = [];
    const texCoords = [];
    const r = this.font.size / this.atlas.fontSize;
    let overallMaxAscent = 0;
    let overallMaxDescent = 0;
    // let overallWidth = 0;
    let left = null;
    let bottom = null;
    let top = null;
    let right = null;
    const border = [];
    for (let t = 0; t < this.text.length; t += 1) {
      let x = 0;
      const numVertices = vertices.length;
      const text = this.text[t];
      let totalWidth = 0;
      let maxDescent = 0;
      let maxAscent = 0;
      for (let i = 0; i < text.length; i += 1) {
        if (this.atlas.map[text[i]] == null) {
          throw new Error(`Atlas Error: Character '${text[i]} (0x${text.charCodeAt(i).toString(16)})' is missing in atlas`);
        }
        const {
          width, ascent, descent, offsetX, offsetY,
        } = this.atlas.map[text[i]];

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
      for (let i = numVertices; i < vertices.length; i += 2) {
        vertices[i] += ox + this.location[t].x;
      }
      for (let i = numVertices + 1; i < vertices.length; i += 2) {
        vertices[i] += oy + this.location[t].y;
      }
      if (left == null || ox + this.location[t].x < left) {
        left = ox + this.location[t].x;
      }
      if (right == null || ox + this.location[t].x + totalWidth > right) {
        right = ox + this.location[t].x + totalWidth;
      }
      if (bottom == null || oy + this.location[t].y - maxDescent < bottom) {
        bottom = oy + this.location[t].y - maxDescent;
      }
      if (top == null || oy + this.location[t].y + maxAscent > top) {
        top = oy + this.location[t].y + maxAscent;
      }
      border.push([
        new Point(ox + this.location[t].x, oy + this.location[t].y - maxDescent),
        new Point(ox + this.location[t].x + totalWidth, oy + this.location[t].y - maxDescent),
        new Point(ox + this.location[t].x + totalWidth, oy + this.location[t].y + maxAscent),
        new Point(ox + this.location[t].x, oy + this.location[t].y + maxAscent),
      ]);
      // console.log(vertices)
      // console.log(texCoords)
      if (maxAscent > overallMaxAscent) {
        overallMaxAscent = maxAscent;
      }
      if (maxDescent > overallMaxDescent) {
        overallMaxDescent = maxDescent;
      }
      // if (totalWidth > overallWidth) {
      //   overallWidth = totalWidth;
      // }
    }

    this.drawingObject.updateVertices(vertices);
    this.drawingObject.updateTextureMap(texCoords.map(v => v / this.atlas.dimension));
    // this.location = new Point(ox, oy);
    this.measure = {
      ascent: overallMaxAscent,
      descent: overallMaxDescent,
      width: right - left,
      left,
      bottom,
      top,
      right,
      border,
    };
    // console.log(this.adjustments)
  }

  /**
   * Change the text in the primitive.
   *
   * @param {string | OBJ_SetText} text
   */
  setText(text: string | Array<string> | OBJ_SetText) {
    if (typeof text === 'string') {
      this.text = [text];
    } else if (Array.isArray(text)) {
      this.text = text;
    } else {
      if (text.font != null) {
        this.font = new FigureFont(joinObjects({}, this.font.definition(), text.font));
        this.createAtlas();
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
        if (typeof text.text === 'string') {
          this.text = [text.text];
        } else {
          this.text = text.text;
        }
      }
      if (text.location != null) {
        this.location = getPoints(text.location);
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
   * @return {string}
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
    // this.recreateAtlas();
    this.createAtlas();
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
    // const bounds = new Rect(
    //   // this.location.x,
    //   // this.location.y - this.measure.descent,
    //   this.measure.left,
    //   this.measure.bottom,
    //   // this.measure.width,
    //   this.measure.right - this.measure.left,
    //   this.measure.top - this.measure.bottom,
    //   // this.measure.ascent + this.measure.descent,
    // );
    // this.drawBorder = [[
    //   new Point(bounds.left, bounds.bottom),
    //   new Point(bounds.right, bounds.bottom),
    //   new Point(bounds.right, bounds.top),
    //   new Point(bounds.left, bounds.top),
    // ]];
    this.drawBorder = this.measure.border;
    // this.drawBorder = [[
    //   new Point(this.measure.left, this.measure.bottom),
    //   new Point(this.measure.right, this.measure.bottom),
    //   new Point(this.measure.right, this.measure.top),
    //   new Point(this.measure.left, this.measure.top),
    // ]];
  }

  calcTouchBorder() {
    if (isBuffer(this.touchBorder)) { // $FlowFixMe
      this.drawBorderBuffer = [getBoundingBorder(this.drawBorder, this.touchBorder)];
    } else { // $FlowFixMe
      this.drawBorderBuffer = this.drawBorder;
    }
  }

  _getStateProperties(options: { ignoreShown?: boolean }) {
    // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'text',
      'font',
      'adjustments',
      'location',
      'fontSize',
      'xAlign',
      'yAlign',
    ];
  }

  getFonts() {
    return [[this.font.getFontID(true), this.font, true]];
  }
}
