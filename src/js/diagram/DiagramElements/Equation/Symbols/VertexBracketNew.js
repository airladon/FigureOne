// @flow
import {
  Point, Transform,
} from '../../../../tools/g2';
import WebGLInstance from '../../../webgl/webgl';
import VertexObject from '../../../DrawingObjects/VertexObject/VertexObject';

class VertexBracket extends VertexObject {
  // mainHeight: number;
  // numLines: number;
  side: 'left' | 'right' | 'top' | 'bottom';

  updatePoints(
    leftPoints: Array<Point>,
    rightPoints: Array<Point>,
    width: number,
    height: number,
    initialize: boolean = false,
  ) {
    let t;
    if (this.side === 'right') {
      t = new Transform().scale(-1, 1).translate(width, 0);
    } else if (this.side === 'top') {
      t = new Transform()
        .translate(0, -height / 2)
        .rotate(-Math.PI / 2)
        .translate(height / 2, width);
    } else if (this.side === 'bottom') {
      t = new Transform()
        .translate(0, -height / 2)
        .rotate(Math.PI / 2)
        .translate(height / 2, -width);
    } else {
      t = new Transform();
    }
    const newPointsLeft = leftPoints.map(p => p.transformBy(t.m()));
    const newPointsRight = rightPoints.map(p => p.transformBy(t.m()));
    this.points = [];
    newPointsLeft.forEach((r1p, index) => {
      const r2p = newPointsRight[index];
      this.points.push(r1p.x);
      this.points.push(r1p.y);
      this.points.push(r2p.x);
      this.points.push(r2p.y);
    });

    const border = [
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ];
    this.border[0] = border.map(p => p.transformBy(t.m()));

    if (initialize) {
      this.setupBuffer();
    } else {
      this.resetBuffer();
    }
  }

  constructor(
    webgl: Array<WebGLInstance>,
    side: 'left' | 'right' | 'top' | 'bottom',
  ) {
    super(webgl);
    this.glPrimitive = this.gl[0].TRIANGLE_STRIP;
    this.side = side;
  }
}
export default VertexBracket;

