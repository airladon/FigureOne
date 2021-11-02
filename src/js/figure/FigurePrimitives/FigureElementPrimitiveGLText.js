// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
// import {
//   Point, getPoint, Line,
// } from '../../tools/g2';
import type DrawingObject from '../DrawingObjects/DrawingObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
// import type { TypeColor, OBJ_Font_Fixed } from '../../tools/types';

// $FlowFixMe
export default class FigureElementPrimitiveGLText extends FigureElementPrimitive {
  text: string;
  font: FigureFont;
  atlas: Object;
  verticals: {
    maxAscent: number,
    midAscent: number,
    maxDescent: number,
    midDescent: number,
    descent: number,
  };

  fontSize: number;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  dimension: number;

  constructor(
    drawingObject: DrawingObject,
    options,
  ) {
    super(
      drawingObject, options.transform, options.color,
      options.parent, options.name, options.timeKeeper,
    );
    this.font = new FigureFont(options.font);
    this.atlas = {};
    this.text = options.text;
    this.drawingObject.addVertices([0, 0, 4, 0, 4, 4, 0, 0, 4, 4, 0, 4], 2);
    const points = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
    this.drawingObject.updateTextureMap(points);
    this.xAlign = options.xAlign;
    this.yAlign = options.yAlign;
    this.verticals = {
      maxAscent: 1.5,
      midAscent: 0.95,
      maxDescent: 0.5,
      midDescent: 0.2,
      descent: 0.08,
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
    this.createAtlas();
    this.setText(this.text);
    this.notifications.publish('setFigure');
  }
  // setText(text: string) {
  //   this.text = text;
  // }

  measureText(text: string, fontSize: number, width: number) {
    const aWidth = fontSize / 2;
    let ascent = aWidth * this.verticals.maxAscent;
    let descent = aWidth * this.verticals.descent;
    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp: ]/g;
    const midDecentRe = /[;,$]/g;
    let maxDescentRe = /[gjyqp@Q(){}[\]|]/g;
    if (this.font.family === 'Times New Roman') {
      if (this.font.style === 'italic') {
        maxDescentRe = /[gjyqp@Q(){}[\]|f]/g;
      }
    }

    const midAscentMatches = this.text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === this.text.length) {
        ascent = aWidth * this.verticals.midAscent;
      }
    }

    const midDescentMatches = this.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * this.verticals.midDescent;
      }
    }

    const maxDescentMatches = this.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * this.verticals.maxDescent;
      }
    }
    return {
      ascent, descent, width,
    };
  }

  createAtlas() {
    const { gl, webgl } = this.drawingObject;
    const scene = this.getScene();
    if (scene == null) {
      return;
    }
    const fontSize = this.font.size / scene.heightNear * gl.canvas.height;
    this.fontSize = fontSize;
    const id = `${this.font.family}${fontSize}${this.font.style}${this.font.weight}`;
    this.drawingObject.addTexture(`${this.font.family}${fontSize}${this.font.style}${this.font.weight}`);
    if (webgl.textures[id] != null) {
      this.drawingObject.texture.id = id;
      this.atlas = webgl.textures[id].atlas;
      this.dimension = webgl.textures[id].atlasDimension;
      return;
    }


    const atlasString = `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm,./<>?;':"[]\{}|1234567890!@#$%^&*()-=_+" \u00d7\u00f7\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03c9`;

    const dimension = Math.ceil(Math.sqrt(atlasString.length) + 1) * fontSize * 1.2;

    const canvas = document.createElement('canvas');
    canvas.width = dimension;
    canvas.height = dimension;
    this.dimension = dimension;

    const ctx = canvas.getContext('2d');
    ctx.font = `${this.font.style} ${this.font.weight} ${fontSize}px ${this.font.family}`;
    let x = fontSize;
    let y = fontSize;
    for (let i = 0; i < atlasString.length; i += 1) {
      ctx.fillText(atlasString[i], x, y);
      const {
        width, ascent, descent,
      } = this.measureText(
        atlasString[i], fontSize, ctx.measureText(atlasString[i]).width,
      );
      const offsetX = x;
      const offsetY = this.dimension - y;
      // x += ctx.measureText(atlasString[i]).width;
      this.atlas[atlasString[i]] = {
        width, ascent, descent, offsetX, offsetY,
      };
      x += width * 2;
      if (x >= dimension - fontSize) {
        x = fontSize;
        y += fontSize * 1.2;
      }
    }
    this.drawingObject.texture.data = ctx.canvas;
    this.drawingObject.initTexture();
    // const glTexture = gl.createTexture();
    // webgl.addTexture(id, glTexture, 'image', this.atlas, this.dimension);
    // gl.activeTexture(
    //   gl.TEXTURE0 + webgl.textures[id].index,
    // );
    // gl.bindTexture(gl.TEXTURE_2D, glTexture);
    // this.drawingObject.texture.id = id;
    // this.drawingObject.addTextureToBuffer(glTexture, ctx.canvas, false);
  }

  setText(text: string) {
    this.text = text;
    const vertices = [];
    const texCoords = [];
    let x = 0;
    const r = this.font.size / this.fontSize;
    for (let i = 0; i < text.length; i += 1) {
      const {
        width, ascent, descent, offsetX, offsetY,
      } = this.atlas[this.text[i]];
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
    }
    this.drawingObject.updateVertices(vertices);
    this.drawingObject.updateTextureMap(texCoords.map(v => v / this.dimension));
  }

  _getStateProperties(options: { ignoreShown?: boolean }) {
    // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'zoom',
      'pan',
      'onlyWhenTouched',
      'originalPosition',
    ];
  }
}
