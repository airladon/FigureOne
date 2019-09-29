// @flow
import {
  Point, Transform, polarToRect,
} from '../../../../tools/g2';
import WebGLInstance from '../../../webgl/webgl';
import VertexObject from '../../../DrawingObjects/VertexObject/VertexObject';

class VertexBracket extends VertexObject {
  mainHeight: number;
  numLines: number;

  getPoints() {
    const w = 1 / this.numLines / 16;
    const r1 = w * 16 * this.numLines;
    const r2 = r1 * (1.4 - 0.4 * (1 - 1 / this.numLines));
    // let r1 = 1;
    // let r2 = 1.5;
    // let w = 1 / 16;

    // if (this.numLines === 2) {
    //   r1 = 1.5;
    //   r2 = 2;
    //   w = 1 / 25;
    // }

    const { mainHeight } = this;
    const p1 = new Point(r1, mainHeight / 2);
    const p2 = new Point(r2 + w, mainHeight / 2);
    const r1Angle = Math.asin(mainHeight / 2 / r1);
    const r2Angle = Math.asin(mainHeight / 2 / r2);
    const numSegments = 10 * this.numLines;
    const r1AngleStep = r1Angle * 2 / numSegments;
    const r2AngleStep = r2Angle * 2 / numSegments;

    const r1Points = [];
    const r2Points = [];
    for (let i = 0; i <= numSegments; i += 1) {
      r1Points.push(polarToRect(r1, Math.PI - r1Angle + i * r1AngleStep).add(p1));
      r2Points.push(polarToRect(r2, Math.PI - r2Angle + i * r2AngleStep).add(p2));
    }
    const maxX = polarToRect(r2, Math.PI - r2Angle).add(p2).x;
    return { leftPoints: r1Points, rightPoints: r2Points, maxX };
  }

  constructor(
    webgl: Array<WebGLInstance>,
    side: 'left' | 'right' | 'top' | 'bottom',
    numLines: number = 1,
  ) {
    super(webgl);
    this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    this.numLines = numLines;
    this.mainHeight = 1;

    const { leftPoints, rightPoints, maxX } = this.getPoints();

    let points1 = [];
    let points2 = [];
    let t;
    // const maxX = polarToRect(r2, Math.PI - r2Angle).add(p2).x;
    if (side === 'right') {
      t = new Transform().scale(-1, 1).translate(maxX, 0);
    } else if (side === 'top') {
      t = new Transform()
        .translate(0, -this.mainHeight / 2)
        .rotate(-Math.PI / 2)
        .translate(this.mainHeight / 2, maxX);
    } else if (side === 'bottom') {
      t = new Transform()
        .translate(0, -this.mainHeight / 2)
        .rotate(Math.PI / 2)
        .translate(this.mainHeight / 2, -maxX);
    } else {
      t = new Transform();
    }
    points1 = leftPoints.map(p => p.transformBy(t.m()));
    points2 = rightPoints.map(p => p.transformBy(t.m()));

    this.points = [];
    points1.forEach((r1p, index) => {
      const r2p = points2[index];
      this.points.push(r1p.x);
      this.points.push(r1p.y);
      this.points.push(r2p.x);
      this.points.push(r2p.y);
    });
    this.border[0] = [];
    points1.forEach((p) => {
      this.border[0].push(p);
    });
    for (let i = points2.length - 1; i >= 0; i -= 1) {
      this.border[0].push(points2[i]);
    }

    this.setupBuffer();
  }
}
export default VertexBracket;

