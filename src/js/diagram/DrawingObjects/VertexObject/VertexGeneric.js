// @flow

import { Point, getBoundingRect } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

// export type TypeVertexPolyLineBorderToPoint = TypeBorderToPoint;

class VertexGeneric extends VertexObject {
  width: number;
  close: boolean;
  // borderToPoint: TypeBorderToPoint;

  constructor(
    webgl: Array<WebGLInstance>,
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
    drawType: 'triangles' | 'strip' | 'fan' | 'lines',
  ): void {
    super(webgl);
    if (drawType === 'lines') {
      this.glPrimitive = this.gl[0].LINES;
    } else if (drawType === 'strip') {
      this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    } else if (drawType === 'fan') {
      this.glPrimitive = this.gl[0].TRIANGLE_FAN;
    }

    this.setupPoints(vertices, border, holeBorder);
    this.setupBuffer();
  }

  change(
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
  ) {
    this.setupPoints(vertices, border, holeBorder);
    this.resetBuffer();
  }

  setupPoints(
    vertices: Array<Point>,
    border: ?Array<Array<Point>>,
    holeBorder: ?Array<Array<Point>>,
  ) {
    this.points = [];
    vertices.forEach((v) => {
      this.points.push(v.x);
      this.points.push(v.y);
    });
    if (border == null) {
      const bounds = getBoundingRect(vertices);
      this.border[0] = [
        new Point(bounds.left, bounds.bottom),
        new Point(bounds.right, bounds.bottom),
        new Point(bounds.right, bounds.top),
        new Point(bounds.left, bounds.top),
      ];
    } else {
      this.border = border;
    }
    if (holeBorder != null) {
      this.holeBorder = holeBorder;
    }
  }
}

export default VertexGeneric;
