// @flow
// import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
// import FontManager from '../FontManager';
import {
  Point, getBoundingBorder, isBuffer, getPoints,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import type GLObject from '../DrawingObjects/GLObject/GLObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { OBJ_Font, TypeColor } from '../../tools/types';
import Scene from '../../tools/geometry/scene';
import type { OBJ_Text_Fixed, OBJ_SetText } from './FigurePrimitiveTypes';


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
    border: Array<Array<Point>>,
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
    // $FlowFixMe
    this.adjustments = options.adjustments;
    this.drawBorder = [[new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)]];
    this.drawBorderBuffer = this.drawBorder;
    this.color = this.font.color;
    if (options.location != null) { // $FlowFixMe
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
      border: [[new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1)]],
    }; // $FlowFixMe
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

  createAtlas(sceneIn: Scene = this.getScene()) {
    let scene;
    if (sceneIn instanceof Scene) {
      scene = sceneIn;
    } else {
      scene = new Scene(sceneIn);
    }
    if (this.atlas != null && this.atlasNotificationsID != null) {
      this.atlas.notifications.remove('updated', this.atlasNotificationsID);
    }

    this.atlas = this.drawingObject.webgl.getAtlas({
      scene,
      font: this.font,
    });

    if (this.drawingObject.texture == null) {
      this.drawingObject.addTexture(this.atlas.font.getTextureID());
    } else { // $FlowFixMe
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
      descent: overallMaxDescent, // $FlowFixMe
      width: right - left, // $FlowFixMe
      left, // $FlowFixMe
      bottom, // $FlowFixMe
      top, // $FlowFixMe
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
    return this.text[0];
  }

  /**
   * Get the font of the text.
   *
   * @return {FigureFont}
   */
  getFont() {
    return this.font;
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

  stateSet() {
    super.stateSet();
    this.measureAndAlignText();
    this.calcBorderAndBounds();
  }

  cleanup() {
    super.cleanup();
    if (this.atlas != null && this.atlasNotificationsID != null) {
      this.atlas.notifications.remove('updated', this.atlasNotificationsID);
    }
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
      // 'measure',
    ];
  }

  getFonts() {
    return [[this.font.getFontID(true), this.font, true]];
  }
}
