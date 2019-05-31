// @flow

import { Point, Line } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexLines extends VertexObject {
  start: Point;
  constructor(
    webgl: WebGLInstance,
    linePairs: Array<Array<Point>>,
    numLinesThick: number = 1,
  ): void {
    super(webgl);
    this.glPrimative = this.gl[0].LINES;

    this.points = [];
    linePairs.forEach((line) => {
      const [p, q] = line;
      const angle = new Line(p, q).angle() + Math.PI / 2;
      const spacing = 0.003;
      const startMag = -spacing * (numLinesThick - 1) / 2;
      for (let i = 0; i < numLinesThick; i += 1) {
        const mag = startMag + i * spacing;
        this.points.push(p.x + mag * Math.cos(angle));
        this.points.push(p.y + mag * Math.sin(angle));
        this.points.push(q.x + mag * Math.cos(angle));
        this.points.push(q.y + mag * Math.sin(angle));
      }
      // this.points.push(p.x);
      // this.points.push(p.y);
      // this.points.push(q.x);
      // this.points.push(q.y);
    });

    this.border = [];

    this.setupBuffer();
  }
}

export default VertexLines;
