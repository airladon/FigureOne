// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

// Isosceles triangle defined from `tip` point, down `height` with base `width`
class IsoTriangle extends VertexObject {
  height: number;
  constructor(
    webgl: Array<WebGLInstance>,
    width: number = 1,
    height: number = 2,
    tip: Point = new Point(0, 0),
    rotation: number = 0,
  ): void {
    super(webgl);
    this.height = height;
    this.points = [
      0, 0,
      -width / 2, -height,
      +width / 2, -height];
    let i;
    for (i = 0; i < this.points.length; i += 2) {
      let point = new Point(this.points[i], this.points[i + 1]);
      point = point.rotate(rotation);
      point = point.add(tip);
      this.points[i] = point.x;
      this.points[i + 1] = point.y;
      this.border[0].push(point);
    }
    this.border[0].push(this.border[0][0]._dup());
    this.setupBuffer();
  }
}
export default IsoTriangle;
