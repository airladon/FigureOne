// @flow
import type { OBJ_FigureForElement } from '../Figure';
import { FigureElementPrimitive } from '../Element';
import {
  Point, getPoint, Line,
} from '../../tools/g2';
import type { FigureElement } from '../Element';
import type { TypeParsablePoint, Transform } from '../../tools/g2';
import Scene from '../../tools/geometry/scene';
// import type { OBJ_Scene } from '../../tools/geometry/scene';
// import type { OBJ_Generic } from './FigurePrimitiveTypes2D';
// import type TimeKeeper from '../TimeKeeper';
import type DrawingObject from '../DrawingObjects/DrawingObject';
import { FigureFont } from '../DrawingObjects/TextObject/TextObject';
import type { TypeColor, OBJ_Font_Fixed } from '../../tools/types';

// $FlowFixMe
export default class FigureElementPrimitiveGLText extends FigureElementPrimitive {
  text: string;
  font: FigureFont;
  atlas: {
    id: string,
    buffer: null,
  };

  constructor(
    drawingObject: DrawingObject,
    options,
  ) {
    super(drawingObject, options.transform, options.color, options.parent, options.name, options.timeKeeper);
    this.font = new FigureFont(options.font);
    this.drawingObject.texture = {
      buffer: this.drawingObject.gl.createBuffer(),
    };
    // this.createAtlas();
    this.drawingObject.addVertices([0, 0, 4, 0, 4, 4, 0, 0, 4, 4, 0, 4], 2);
    const points = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
    this.drawingObject.updateTextureMap(points);
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
    this.notifications.publish('setFigure');
  }
  // setText(text: string) {
  //   this.text = text;
  // }

  createAtlas() {
    const { gl, webgl } = this.drawingObject;
    const scene = this.getScene();
    if (scene == null) {
      return;
    }
    const fontSize = this.font.size / scene.heightNear * gl.canvas.height;
    const id = `${this.font.family}${fontSize}${this.font.style}${this.font.weight}`;
    if (webgl.textures[id] != null) {
      return;
    }
    
    const atlasString = `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm,./<>?;':"[]\{}|1234567890!@#$%^&*()-=_+"`;

    const width = Math.ceil(Math.sqrt(atlasString.length)) * fontSize * 1.2;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width;

    const ctx = canvas.getContext('2d');
    ctx.font = `${this.font.style} ${this.font.weight} ${fontSize}px ${this.font.family}`;
    let x = fontSize;
    let y = fontSize;
    for (let i = 0; i < atlasString.length; i += 1) {
      ctx.fillText(atlasString[i], x, y);
      x += ctx.measureText(atlasString[i]).width;
      if (x >= width - fontSize) {
        x = fontSize;
        y += fontSize * 1.2;
      }
    }

    const glTexture = gl.createTexture();
    webgl.addTexture(id, glTexture, 'image');
    gl.activeTexture(
      gl.TEXTURE0 + webgl.textures[id].index,
    );
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    this.drawingObject.texture.id = id;
    this.drawingObject.addTextureToBuffer(glTexture, ctx.canvas, false);
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
