// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

type TypeVertexText = {
  text: ?string;
  size: ?number;
  family: ?string;
  weight: ?number;
  alignH: ?'left' | 'center' | 'right',
  alignV: ?'top' | 'bottom' | 'middle' | 'alphabetic',
};

class VertexText extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  text: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines
  ctx: Object;

  constructor(
    webgl: WebGLInstance,
    text: TypeVertexText,
  ) {
    super(webgl, 'withTexture', 'withTexture');
    this.glPrimative = webgl.gl.TRIANGLE_FAN;

    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    const center = new Point(0, 0);

    this.points = [
      -1, -1,
      -1, 1,
      1, 1,
      1, -1,
    ];
    this.texture = {};
    this.texture.image = this.makeTextCanvas('Hello!', 100, 26);
    this.texture.id = 'texture_text';
    this.setupBuffer();
  }

  // Puts text in center of canvas.
  makeTextCanvas(text: string, width: number, height: number) {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'black';
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillText(text, width / 2, height / 2);
    return this.ctx.canvas;
  }
}

export default VertexText;

