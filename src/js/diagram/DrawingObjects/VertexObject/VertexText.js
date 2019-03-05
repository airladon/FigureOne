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
  diagramToPixelSpaceScale: Point;
  diagramToGLSpaceTransformMatrix: Array<number>;
  text: string;
  size: number;
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  alignH: 'left' | 'center' | 'right';
  alignV: 'top' | 'bottom' | 'middle' | 'alphabetic';
  canvas: HTMLCanvasElement;

  constructor(
    webgl: WebGLInstance,
    diagramToPixelSpaceScale: Point,
    diagramToGLSpaceTransformMatrix: Array<number>,
    textOptions: TypeVertexInputTextOptions,
  ) {
    super(webgl, 'withTexture', 'withTexture');
    this.glPrimative = webgl.gl.TRIANGLE_FAN;
    this.diagramToPixelSpaceScale = diagramToPixelSpaceScale;
    this.diagramToGLSpaceTransformMatrix = diagramToGLSpaceTransformMatrix;

    const defaultTextOptions = {
      text: 'DEFAULT_TEXT',
      size: 20,             // pixels
      family: 'Helvetica',
      style: 'normal',
      weight: 400,
      alignH: 'center',
      alignV: 'alphabetic',
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

    // const center = new Point(0, 0);

    this.texture = {};
    this.texture.id = 'texture_text';

    // const width = options.size * options.text.length * 0.7;
    // const height = options.size * 1.5;
    // this.texture.image = this.makeTextCanvas(options, width, height);
    
    // const data = this.ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    // console.log(data);

    // let aspectRatio = width / height;
    // console.log(width, height)
    // this.points = [
    //   -1, -1 / aspectRatio,
    //   -1, 1 / aspectRatio,
    //   1, 1 / aspectRatio,
    //   1, -1 / aspectRatio,
    // ];
    // this.createTextureMap(-1, 1, -1 / aspectRatio, 1 / aspectRatio);
    // this.setupBuffer();
    this.drawTextIntoBuffer();
  }

  drawTextIntoBuffer() {
    // Font is in diagram space units.
    // Font size relative to M width will vary by font family so start by
    // assuming: M width = font size, and then measure it, and find a scaling
    // correction factor to apply
    const d2pScale = this.diagramToPixelSpaceScale;
    const width = this.text.length * this.size * d2pScale.x;
    const height = this.size * Math.abs(d2pScale.y) * 1.15;

    const pixelFontSize = round(this.size * Math.abs(d2pScale.y), 0);
    console.log(pixelFontSize, this.size * d2pScale.y, d2pScale, this.size);
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;
    // this.ctx.save();
    // this.ctx.font = 'normal 400 12px Helvetica';
    // console.log(this.ctx.measureText(this.text).width)
    // this.ctx.font = 'normal 400 69px Helvetica';
    // console.log(this.ctx.measureText(this.text).width)
    // console.log(this.ctx.font)
    // const mWidth = this.ctx.measureText('M');
    // const scaleCorrection = (pixelFontSize) / mWidth.width;

    // this.ctx.font = `${this.style} ${this.weight} ${this.size * d2pScale.x * scaleCorrection}px ${this.family}`;

    const totalWidth = this.ctx.measureText(this.text);
    console.log(totalWidth.width, width)
    // this.canvas.width = totalWidth.width;
    this.canvas.width = totalWidth.width;
    this.canvas.height = height;
    // this.ctx.restore();
    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillStyle = 'black';
    const startX = 0;
    // if (this.alignH === 'center') {
    //   startX = this.canvas.width / 2;
    // } else if (this.alignH === 'right') {
    //   startX = this.canvas.width;
    // }
    const startY = this.canvas.height * 0.75;
    // this.ctx.font = "40px Helvetica";
    this.ctx.fillText(this.text, startX, startY);

    const aspectRatio = this.canvas.width / this.canvas.height;
    const diagramWidth = this.canvas.width / d2pScale.x;
    const diagramHeight = this.canvas.height / Math.abs(d2pScale.y);
    const points = [
      new Point(0, 0),
      new Point(0, diagramHeight),
      new Point(diagramWidth, diagramHeight),
      new Point(diagramWidth, 0),
    ];
    if (this.alignH === 'center') {
      points.forEach((point) => {
        point.x -= diagramWidth / 2;
      });
    }
    if (this.alignH === 'right') {
      points.forEach((point) => {
        point.x -= diagramWidth;
      });
    }
    this.points = [];
    points.forEach((point) => {
      this.points.push(point.x);
      this.points.push(point.y);
    });
    // this.points = [
    //   0, 0,
    //   0, diagramHeight,
    //   diagramWidth, diagramHeight,
    //   diagramWidth, 0,
    // ];
    console.log("points", points)
    const glBottomLeft = points[0].transformBy(this.diagramToGLSpaceTransformMatrix);
    const glTopRight = points[2].transformBy(this.diagramToGLSpaceTransformMatrix);
    this.createTextureMap(glBottomLeft.x, glTopRight.x, glBottomLeft.y, glTopRight.y);
    console.log(this.texture)

    const { texture } = this;
    if (texture != null) {
      texture.image = this.ctx.canvas;
      console.log(texture.image)
      if (texture.buffer) {
        console.log('resetting buffer')
        this.resetBuffer();
      } else {
        console.log('setting up buffer')
        this.setupBuffer();
      }
    }
  }

  // // Puts text in center of canvas.
  // makeTextCanvas(
  //   options: TypeTextOptions,
  //   width: number,
  //   height: number,
  // ) {
  //   this.ctx.canvas.width = width;
  //   this.ctx.canvas.height = height;
  //   this.ctx.font = `${options.style} ${options.weight} ${options.size}px ${options.family}`;
  //   this.ctx.textAlign = options.alignH;
  //   this.ctx.textBaseline = options.alignV;
  //   this.ctx.fillStyle = 'black';
  //   this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  //   let startX = 0;
  //   if (options.alignH === 'center') {
  //     startX = width / 2;
  //   } else if (options.alignH === 'right') {
  //     startX = width;
  //   }
  //   let startY = height / 2;
  //   this.ctx.fillText(options.text, startX, startY);
  //   return this.ctx.canvas;
  // }
}

export default VertexText;

