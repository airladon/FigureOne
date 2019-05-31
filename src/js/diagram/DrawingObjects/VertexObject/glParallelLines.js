// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class GLParallelLines extends VertexObject {
  num: number;

  constructor(
    webgl: Array<WebGLInstance>,
    num: number = 10,
    spacing: number = 0.1,
    start: Point = new Point(0, 0),
    length: number = 0.1,
    width: number = 0.01,
    logarithmic: boolean = false,
    flip: boolean = false,
  ): void {
    super(webgl);

    this.num = num;
    let sign = 1;
    if (flip) {
      sign = -1;
    }
    const cy = start.y;
    for (let i = 0; i < num; i += 1) {
      let cx;
      if (logarithmic) {
        cx = start.x + spacing * Math.floor(i / 10) + Math.log10(i % 10) * spacing;
      } else {
        cx = start.x + spacing * i;
      }
      this.points.push(cx, sign * cy);
      this.points.push(cx + width, sign * cy);
      this.points.push(cx + width, sign * (cy + length));
      this.points.push(cx, cy);
      this.points.push(cx + width, sign * (cy + length));
      this.points.push(cx, sign * (cy + length));

      this.border.push([
        new Point(cx, sign * cy),
        new Point(cx + width, sign * cy),
        new Point(cx + width, sign * (cy + length)),
        new Point(cx, sign * (cy + length)),
      ]);
    }
    this.setupBuffer();
  }
}

export default GLParallelLines;
