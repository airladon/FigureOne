// @flow

import {
  Point, Transform,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';
import VertexObject from './VertexObject';

function makeDash(
  start: Point,
  length: number,
  width: number,
) {
  const p1 = start._dup();
  const p2 = start.add(new Point(0, width));
  const p3 = start.add(new Point(length, width));
  const p4 = start.add(new Point(length, 0));
  return [
    p1, p2, p3,
    p1, p3, p4,
  ];
}

class VertexDashedLine extends VertexObject {
  start: Point;
  dashCumLength: Array<number>;
  maxLength: number;

  constructor(
    webgl: Array<WebGLInstance>,
    start: Point = new Point(0, 0),
    maxLength: number = 1,
    width: number = 0.1,
    rotation: number = 0,
    dashStyle: Array<number> = [1],
  ): void {
    super(webgl);
    this.glPrimative = this.gl[0].TRIANGLES;
    this.dashCumLength = [];
    this.maxLength = maxLength;
    const cx = 0;
    const cy = 0 - width / 2.0;
    const points = [];

    let cumLength = 0;
    const startVertex = new Point(cx, cy);
    let isGap = false;
    while (cumLength < maxLength) {
      for (let i = 0; i < dashStyle.length && cumLength < maxLength; i += 1) {
        let length = dashStyle[i];
        if (length + cumLength > maxLength) {
          length = maxLength - cumLength;
        }
        if (!isGap) {
          const dash = makeDash(startVertex, length, width);
          dash.forEach((d) => {
            points.push(d);
          });
        }
        cumLength += length;
        startVertex.x += length;
        isGap = !isGap;
        this.dashCumLength.push(cumLength);
      }
    }

    // rotate points
    const t = new Transform().rotate(rotation).translate(start.x, start.y);
    const transformedPoints = points.map(p => p.transformBy(t.matrix()));

    transformedPoints.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
    });

    // const p = this.points;
    this.border[0] = [
      transformedPoints[0],
      transformedPoints[1],
      transformedPoints[transformedPoints.length - 2],
      transformedPoints[transformedPoints.length - 1],
    ];

    this.border[0].push(this.border[0][0]._dup());
    this.setupBuffer();
  }

  getPointCountForLength(drawLength: number = this.maxLength) {
    if (drawLength >= this.maxLength) {
      return this.numPoints;
    }
    if (drawLength < this.dashCumLength[0]) {
      return 0;
    }
    for (let i = 0; i < this.dashCumLength.length; i += 1) {
      const cumLength = this.dashCumLength[i];
      if (cumLength > drawLength) {
        return (Math.floor((i - 1) / 2) + 1) * 6;
      }
    }
    return this.numPoints;
  }
}

export default VertexDashedLine;
