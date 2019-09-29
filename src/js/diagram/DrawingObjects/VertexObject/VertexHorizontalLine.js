// @flow

import {
  Point, Transform,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexHorizontalLine extends VertexObject {
  start: Point;
  constructor(
    webgl: Array<WebGLInstance>,
    start: Point = new Point(0, 0),
    length: number = 1,
    width: number = 0.1,
    rotation: number = 0,
  ): void {
    super(webgl);
    const cx = 0;
    const cy = 0 - width / 2.0;
    const points = [];
    this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    points.push(new Point(cx, cy));
    points.push(new Point(cx, cy + width));
    points.push(new Point(cx + length, cy));
    points.push(new Point(cx + length, cy + width));

    // transform points
    const t = new Transform().rotate(rotation).translate(start.x, start.y);
    const transformedPoints = points.map(p => p.transformBy(t.matrix()));

    transformedPoints.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });

    this.border[0] = [
      transformedPoints[0],
      transformedPoints[1],
      transformedPoints[transformedPoints.length - 1],
      transformedPoints[transformedPoints.length - 2],
    ];

    this.border[0].push(this.border[0][0]._dup());
    this.setupBuffer();
  }
}

export default VertexHorizontalLine;
