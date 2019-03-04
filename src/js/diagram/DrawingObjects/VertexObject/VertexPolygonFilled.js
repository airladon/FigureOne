// @flow

import {
  Point, Rect,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class PolygonFilled extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  radius: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines

  constructor(
    webgl: WebGLInstance,
    numSides: number,
    radius: number,
    rotation: number = 0,
    center: Point = new Point(0, 0),
    numSidesToDraw: number = numSides,
    textureLocation: string = '',
    textureCoords: Rect = new Rect(0, 0, 1, 1),
  ) {
    if (textureLocation !== '') {
      super(webgl, 'withTexture', 'withTexture');
    } else {
      super(webgl);
    }
    this.glPrimative = webgl.gl.TRIANGLE_FAN;

    // Check potential errors in constructor input
    let sides = numSides;
    let sidesToDraw = numSidesToDraw;
    if (sides < 3) {
      sides = 3;
    }

    if (numSidesToDraw < 0) {
      sidesToDraw = 0;
    } else if (numSidesToDraw > sides) {
      sidesToDraw = sides;
    }

    this.points = [center.x, center.y];
    this.dAngle = 0;
    this.radius = radius;
    this.center = center;

    this.dAngle = Math.PI * 2.0 / sides;

    let i;
    let j = 2;
    // let b = 0;

    // Make the encapsulating border
    if (sidesToDraw < sides) {
      this.border[0].push(center._dup());
      // b = 1;
    }
    for (i = 0; i < sidesToDraw + 1; i += 1) {
      this.points[j] = center.x + radius * Math.cos(i * this.dAngle + rotation);
      this.points[j + 1] = center.y + radius * Math.sin(i * this.dAngle + rotation);
      this.border[0].push(new Point(this.points[j], this.points[j + 1]));
      // b += 1;
      j += 2;
    }
    if (sidesToDraw < sides) {
      this.border[0].push(center._dup());
    }

    if (textureLocation) {
      this.texture = {};
      this.texture.src = textureLocation;
      this.texture.id = 'texture_image';

      this.createTextureMap(
        -this.radius * 1.01 + center.x,
        this.radius * 1.01 + center.x,
        -this.radius * 1.01 + center.y,
        this.radius * 1.01 + center.y,
        textureCoords.left, textureCoords.right,
        textureCoords.bottom, textureCoords.top,
      );
    }

    this.setupBuffer();
  }

  drawToAngle(
    offset: Point,
    rotate: number,
    scale: Point,
    drawAngle: number,
    color: Array<number>,
  ) {
    let count = Math.floor(drawAngle / this.dAngle) * 2.0 + 2;
    if (drawAngle >= Math.PI * 2.0) {
      count = this.numPoints;
    }
    this.draw(offset, rotate, scale, count, color);
  }

  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    let count = Math.floor(drawAngle / this.dAngle) + 1;
    if (drawAngle >= Math.PI * 2.0) {
      count = this.numPoints;
    }
    return count;
  }
}

export default PolygonFilled;
