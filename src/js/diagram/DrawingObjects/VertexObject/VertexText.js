// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { generateUniqueId, joinObjects } from '../../../tools/tools';
import { round } from '../../../tools/math';

type TypeVertexInputTextOptions = {
  text: ?string;
  size: ?number;
  family: ?string;
  weight: ?number;
  style: ?'normal' | 'italic',
  alignH: ?'left' | 'center' | 'right',
  alignV: ?'top' | 'bottom' | 'middle' | 'baseline',
};

type TypeTextOptions = {
  text: string;
  size: number;
  family: string;
  weight: number;
  style: 'normal' | 'italic',
  alignH: 'left' | 'center' | 'right',
  alignV: 'top' | 'bottom' | 'middle' | 'baseline',
};

class VertexText extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  text: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines
  ctx: Object;
  diagramToPixelSpaceScale: Point;
  diagramToGLSpaceTransformMatrix: Array<number>;
  text: string;
  size: number;
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  alignH: 'left' | 'center' | 'right';
  alignV: 'top' | 'bottom' | 'middle' | 'baseline';
  canvas: HTMLCanvasElement;

  constructor(
    webgl: WebGLInstance,
    textOptions: TypeVertexInputTextOptions,
  ) {
    super(webgl, 'withTexture', 'text');
    this.glPrimative = webgl.gl.TRIANGLE_FAN;

    const defaultTextOptions = {
      text: 'DEFAULT_TEXT',
      size: 20,             // pixels
      family: 'Helvetica',
      style: 'normal',
      weight: 400,
      alignH: 'center',
      alignV: 'alphabetic',
      id: generateUniqueId('vertexText'),
    };
    const options = joinObjects({}, defaultTextOptions, textOptions);
    this.size = options.size;
    this.text = options.text;
    this.family = options.family;
    this.alignH = options.alignH;
    this.alignV = options.alignV;
    this.style = options.style;
    this.weight = options.weight;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'asdf';
    this.ctx = this.canvas.getContext('2d');
    this.texture = {
      id: options.id,
      points: [],
      type: 'canvasText',
    };
    this.type = 'vertexText';
    this.drawTextIntoBuffer();
  }

  resizeText(
    pixelToVertexSpaceScale: Point = new Point(1, 1),
  ) {
    const width = this.canvas.width * pixelToVertexSpaceScale.x;
    const height = this.canvas.height * pixelToVertexSpaceScale.y;

    const start = new Point(0, 0);
    if (this.alignH === 'center') {
      start.x = -width / 2;
    } else if (this.alignH === 'right') {
      start.x = -width;
    }
    if (this.alignV === 'baseline') {
      start.y = -height * 0.25;
    } else if (this.alignV === 'top') {
      start.y = -height;
    }

    const points = [
      start,
      new Point(start.x, start.y + height),
      new Point(start.x + width, start.y + height),
      new Point(start.x + width, start.y),
    ];

    this.points = [];
    points.forEach((point) => {
      this.points.push(point.x);
      this.points.push(point.y);
    });

    const { texture } = this;
    if (texture != null) {
      texture.points = [
        0, 0,
        0, 1,
        1, 1,
        1, 0,
      ];
      texture.data = this.ctx.canvas;
      if (texture.buffer) {
        this.resetBuffer();
      } else {
        this.setupBuffer();
      }
    }
  }

  drawTextIntoBuffer(
    pixelToVertexSpaceScale: Point = new Point(1, 1),
  ) {
    const pixelFontSize = parseInt(this.size, 10);
    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;

    const hBuffer = 0.3;
    const width = this.ctx.measureText(this.text).width
                  + pixelFontSize * hBuffer;
    const height = pixelFontSize * 1.15;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillStyle = 'white';
    this.ctx.fillStyle = 'red';   // debug only

    const startX = pixelFontSize * hBuffer / 2;
    const baselineHeightFromBottom = 0.25;
    const startY = this.canvas.height * (1 - baselineHeightFromBottom);
    this.ctx.fillText(this.text, startX, startY);

    this.resizeText(pixelToVertexSpaceScale);
  }
}

export default VertexText;

