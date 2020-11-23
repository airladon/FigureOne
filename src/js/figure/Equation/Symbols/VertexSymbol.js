// @flow
import {
  Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from '../../DrawingObjects/VertexObject/VertexObject';

class VertexSymbol extends VertexObject {
  updatePoints(
    points: Array<Point>,
    width: number,
    height: number,
    initialize: boolean = false,
  ) {
    // let t;
    this.points = [];
    points.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });

    this.border[0] = [
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ];

    if (initialize) {
      this.setupBuffer();
    } else {
      this.resetBuffer();
    }
  }

  constructor(
    webgl: Array<WebGLInstance>,
    type: 'strip' | 'triangles' | 'fan',
  ) {
    super(webgl);
    if (type === 'strip') {
      this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    } else if (type === 'fan') {
      this.glPrimitive = this.gl[0].TRIANGLE_FAN;
    } else {
      this.glPrimitive = this.gl[0].TRIANGLES;
    }
    this.points = [];
  }
}
export default VertexSymbol;

