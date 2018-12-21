// @flow

import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertextFan extends VertexObject {
  glPrimitive: number;  // WebGL primitive used
  radius: number;       // radius from center to outside of polygon
  center: Point;        // center point
  dAngle: number;       // angle between adjacent verteces to center lines

  constructor(
    webgl: WebGLInstance,
    points: Array<Point>,
  ) {
    super(webgl);
    this.glPrimative = webgl.gl.TRIANGLE_FAN;

    this.points = [];
    points.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
      this.border[0].push(p);
    });

    this.setupBuffer();
  }
}

export default VertextFan;
