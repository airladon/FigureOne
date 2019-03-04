// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { generateUniqueId, joinObjects } from '../../../tools/tools';

type TypeVertexInputTextOptions = {
  text: ?string;
  size: ?number;
  family: ?string;
  weight: ?number;
  style: ?'normal' | 'italic',
  alignH: ?'left' | 'center' | 'right',
  alignV: ?'top' | 'bottom' | 'middle' | 'alphabetic',
};

type TypeTextOptions = {
  text: string;
  size: number;
  family: string;
  weight: number;
  style: 'normal' | 'italic',
  alignH: 'left' | 'center' | 'right',
  alignV: 'top' | 'bottom' | 'middle' | 'alphabetic',
};

class VertexText extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  text: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines
  ctx: Object;

  constructor(
    webgl: WebGLInstance,
    textOptions: TypeVertexInputTextOptions,
  ) {
    super(webgl, 'withTexture', 'withTexture');
    this.glPrimative = webgl.gl.TRIANGLE_FAN;

    const defaultTextOptions = {
      text: 'DEFAULT_TEXT',
      size: '20',             // pixels
      family: 'Helvetica',
      style: 'normal',
      weight: 400,
      alignH: 'center',
      alignV: 'alphabetic',
    };
    const options = joinObjects({}, defaultTextOptions, textOptions);

    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    const center = new Point(0, 0);

    this.texture = {};
    const width = options.size * options.text.length * 0.7;
    const height = options.size * 1.5;
    this.texture.image = this.makeTextCanvas(options, width, height);
    this.texture.id = 'texture_text';
    const data = this.ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    console.log(data);

    let aspectRatio = width / height;
    console.log(width, height)
    this.points = [
      -1, -1 / aspectRatio,
      -1, 1 / aspectRatio,
      1, 1 / aspectRatio,
      1, -1 / aspectRatio,
    ];
    this.createTextureMap(-1, 1, -1 / aspectRatio, 1 / aspectRatio);
    this.setupBuffer();
  }

  // Puts text in center of canvas.
  makeTextCanvas(
    options: TypeTextOptions,
    width: number,
    height: number,
  ) {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    this.ctx.font = `${options.style} ${options.weight} ${options.size}px ${options.family}`;
    this.ctx.textAlign = options.alignH;
    this.ctx.textBaseline = options.alignV;
    this.ctx.fillStyle = 'black';
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let startX = 0;
    if (options.alignH === 'center') {
      startX = width / 2;
    } else if (options.alignH === 'right') {
      startX = width;
    }
    let startY = height / 2;
    this.ctx.fillText(options.text, startX, startY);
    return this.ctx.canvas;
  }
}

export default VertexText;

