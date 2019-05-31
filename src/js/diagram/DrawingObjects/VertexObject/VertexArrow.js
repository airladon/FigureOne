// @flow

import { Point, Transform } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexArrow extends VertexObject {
  height: number;

  constructor(
    webgl: WebGLInstance,
    width: number = 1,
    legWidth: number = 0.5,
    height: number = 1,
    legHeight: number = 0.5,
    tip: Point = new Point(0, 0),
    rotation: number = 0,
  ) {
    super(webgl);
    this.glPrimative = this.gl[0].TRIANGLE_FAN;
    this.height = height;
    const arrowHeight = height - legHeight;
    const points = [];
    points.push(new Point(0, 0));
    points.push(new Point(-width / 2, -arrowHeight));
    if (legHeight) {
      points.push(new Point(-legWidth / 2.0, -arrowHeight));
      points.push(new Point(-legWidth / 2.0, -height));
      points.push(new Point(+legWidth / 2.0, -height));
      points.push(new Point(+legWidth / 2.0, -arrowHeight));
    }
    points.push(new Point(+width / 2, -arrowHeight));
    const t = new Transform().rotate(rotation).translate(tip);
    const transformedPoints = points.map(p => p.transformBy(t.matrix()));
    // this.points = [
    //   0, 0,
    //   -width / 2, -arrowHeight,
    //   -legWidth / 2.0, -arrowHeight,
    //   -legWidth / 2.0, -height,
    //   +legWidth / 2.0, -height,
    //   +legWidth / 2.0, -arrowHeight,
    //   +width / 2, -arrowHeight,
    // ];
    transformedPoints.forEach((p: Point) => {
      this.points.push(p.x);
      this.points.push(p.y);
      this.border[0].push(p);
    });


    // for (let i = 0; i < this.points.length; i += 2) {
    //   // this.points[i] += tip.x;
    //   // this.points[i + 1] += tip.y;
    //   this.border[0].push(new Point(this.points[i], this.points[i + 1]));
    // }
    this.border[0].push(this.border[0][0]._dup());
    this.setupBuffer();
  }
}
export default VertexArrow;

