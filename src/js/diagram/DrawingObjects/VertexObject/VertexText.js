// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';
import { generateUniqueId, joinObjects } from '../../../tools/tools';
import { round } from '../../../tools/math';
// import { identity } from '../../../tools/m2';

type TypeVertexInputTextOptions = {
  text: ?string;
  size: ?number;
  family: ?string;
  weight: ?number;
  style: ?'normal' | 'italic',
  alignH: ?'left' | 'center' | 'right',
  alignV: ?'top' | 'bottom' | 'middle' | 'baseline',
};

// type TypeTextOptions = {
//   text: string;
//   size: number;
//   family: string;
//   weight: number;
//   style: 'normal' | 'italic',
//   alignH: 'left' | 'center' | 'right',
//   alignV: 'top' | 'bottom' | 'middle' | 'baseline',
// };

class VertexText extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  text: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines
  ctx: Object;
  diagramToPixelSpaceScale: Point;
  diagramToGLSpaceTransformMatrix: Array<number>;
  text: string;
  size: number | string;
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  alignH: 'left' | 'center' | 'right';
  alignV: 'top' | 'bottom' | 'middle' | 'baseline';
  canvas: HTMLCanvasElement;
  ascent: number;
  descent: number;
  height: number;
  width: number;

  constructor(
    webgl: Array<WebGLInstance>,
    textOptions: TypeVertexInputTextOptions,
  ) {
    super(webgl, 'withTexture', 'text');
    this.glPrimative = webgl[0].gl.TRIANGLE_FAN;

    const defaultTextOptions = {
      text: 'DEFAULT_TEXT',
      size: '20px',               // Text in pixels, or in vertex space units.
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
    this.canvas.id = options.id;
    this.ctx = this.canvas.getContext('2d');
    this.texture = {
      id: options.id,
      points: [],
      type: 'canvasText',
    };
    this.type = 'vertexText';
    this.drawTextIntoBuffer();
  }


  // Text is positioned such that the text baseline will be at
  // vertex space y = 0.
  // The border will then cover the ascent and descent of the text.
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
    } else if (this.alignV === 'middle') {
      start.y = -height / 2;
    }


    const points = [
      start,
      new Point(start.x, start.y + height),
      new Point(start.x + width, start.y + height),
      new Point(start.x + width, start.y),
    ];

    this.width = width;
    this.height = height;
    this.calcAscentDescent();

    this.points = [];
    points.forEach((point) => {
      this.points.push(point.x);
      this.points.push(point.y);
    });

    this.border = [[
      new Point(start.x, -this.descent),
      new Point(start.x, this.ascent),
      new Point(start.x + width, this.ascent),
      new Point(start.x + width, -this.descent),
    ]];

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

  calcAscentDescent() {
    // const aWidth = this.ctx.measureText('a').width;

    // Estimations of FONT ascent and descent for a baseline of "alphabetic"
    let ascent = 0.75;
    let descent = 0;

    const lowAscentRe = /[,.]/g;
    const midAscentRe = /[acemnorsuvwxz*gyq:><;p=]/g;
    const midDecentRe = /[;,$]/g;
    const maxDescentRe = /[gjyqp@Q(){}[\]|]/g;

    const lowAscentMatches = this.text.match(lowAscentRe);
    if (Array.isArray(lowAscentMatches)) {
      if (lowAscentMatches.length === this.text.length) {
        ascent = 0.1;
      }
    }

    const midAscentMatches = this.text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === this.text.length) {
        ascent = 0.5;
      }
    }

    const midDescentMatches = this.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = 0.1;
      }
    }

    const maxDescentMatches = this.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = 0.25;
      }
    }
    this.ascent = ascent * this.height;
    this.descent = descent * this.height;
  }

  // If font size is defined in pixels, then the size will always be the size
  // in pixels independent of how the diagram window or scaling changes
  // If the font size is defined in vertex space units, then the font size
  // will always be scaled to look like the vertex space size, but a new canvas
  // will be drawn each time to minimize aliasing.
  drawTextIntoBuffer(
    pixelToVertexSpaceScale: Point = new Point(1, 1),
  ) {
    let pixelFontSize = 20;
    if (typeof this.size === 'string' && this.size.endsWith('px')) {
      pixelFontSize = parseInt(this.size, 10);
    } else {
      let diagramFontSize;
      if (typeof this.size === 'string') {
        diagramFontSize = parseFloat(this.size);
      } else {
        diagramFontSize = this.size;
      }
      pixelFontSize = round(diagramFontSize / pixelToVertexSpaceScale.x, 0);
    }

    if (pixelFontSize < 1) {
      pixelFontSize = 1;
    }

    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;
    const hBuffer = 0.3;
    const width = this.ctx.measureText(this.text).width
                  + pixelFontSize * hBuffer;
    const height = pixelFontSize * 1.15;
    this.canvas.width = Math.max(width, 1);
    this.canvas.height = Math.max(height, 1);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // need to reset font after a canvas resize
    this.ctx.font = `${this.style} ${this.weight} ${pixelFontSize}px ${this.family}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
    // this.ctx.fillStyle = 'white';
    this.ctx.fillStyle = 'white';
    // this.ctx.fillStyle = 'rgba(200,200,200,255)';   // debug only
    // this.ctx.fillStyle = 'blue';

    const startX = pixelFontSize * hBuffer / 2;
    const baselineHeightFromBottom = 0.25;
    const startY = this.canvas.height * (1 - baselineHeightFromBottom);
    this.ctx.fillText(this.text, startX, startY);

    this.resizeText(pixelToVertexSpaceScale);
  }
}

export default VertexText;

