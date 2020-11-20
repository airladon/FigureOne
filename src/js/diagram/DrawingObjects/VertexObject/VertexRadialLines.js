// @flow

import { Point } from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

class VertexRadialLines extends VertexObject {
  innerRadius: number;
  outerRadius: number;
  dAngle: number;
  maxAngle: number;

  constructor(
    webgl: Array<WebGLInstance>,
    innerRadius: number = 0,
    outerRadius: number = 1,
    width: number = 0.05,
    dAngle: number = Math.PI / 4,
    maxAngle: number = Math.PI * 2,
  ): void {
    super(webgl);
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.dAngle = dAngle;
    this.maxAngle = maxAngle;
    let currentAngle = 0;
    let j = -1;
    let b = -1;
    const referenceLine = [
      innerRadius, -width / 2.0,
      outerRadius, -width / 2.0,
      outerRadius, width / 2.0,
      innerRadius, -width / 2.0,
      outerRadius, width / 2.0,
      innerRadius, width / 2.0,
    ];

    while (currentAngle <= maxAngle) {
      for (let i = 0; i < 6; i += 1) {
        const newPoint = new Point(
          referenceLine[i * 2],
          referenceLine[i * 2 + 1],
        ).rotate(currentAngle);
        // let newPoint = rotate(new coord(referenceLine[i*2],referenceLine[i*2+1]), currentAngle);
        this.points[j += 1] = newPoint.x;
        this.points[j += 1] = newPoint.y;
      }
      const radialLineBorder = [
        new Point(this.points[j - 11], this.points[j - 10]),
        new Point(this.points[j - 9], this.points[j - 8]),
        new Point(this.points[j - 7], this.points[j - 6]),
        new Point(this.points[j - 1], this.points[j - 0]),
        new Point(this.points[j - 11], this.points[j - 10]),
      ];
      this.border[b += 1] = radialLineBorder;
      currentAngle += dAngle;
    }
    this.setupBuffer();
  }

  drawToAngle(
    offset: Point,
    rotate: number,
    scale: Point,
    drawAngle: number,
    color: TypeColor,
  ): void {
    let count = Math.floor(drawAngle / this.dAngle) * 6.0 + 6.0;
    if (drawAngle >= this.maxAngle) {
      count = this.numPoints;
    }
    this.draw(offset, rotate, scale, count, color);
  }

  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    let count = Math.floor(drawAngle / this.dAngle) * 6.0 + 6;
    if (drawAngle >= Math.PI * 2.0) {
      count = this.numPoints;
    }
    return count;
  }
}

export default VertexRadialLines;
