// @flow
import {
  Point, polarToRect, Transform,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracket';

class VertexRoundedSquareBracket extends VertexBracket {
  getPoints() {
    let w = 1 / 20;

    if (this.numLines > 1) {
      w /= this.numLines;
    }
    const r1 = w * 3;
    const r2 = r1 * 1.3;
    const p1 = new Point(r1, 0);
    const p2 = new Point(w + r2 + w / 4, 0);
    const r1Angle = Math.PI / 2 * 0.8;
    const h = r1 * Math.sin(r1Angle);
    const r2Angle = Math.asin(h / r2);
    const segments = 5;
    const r1AngleStep = r1Angle / segments;
    const r2AngleStep = r2Angle / segments;

    const cornerR1Points = [];
    const cornerR2Points = [];
    for (let i = 0; i <= segments; i += 1) {
      cornerR1Points.push(polarToRect(r1, Math.PI - i * r1AngleStep).add(p1));
      cornerR2Points.push(polarToRect(r2, Math.PI - i * r2AngleStep).add(p2));
    }

    const width = polarToRect(r2, Math.PI - r2Angle).add(p2).x;
    const height = h;

    const top = new Transform()
      .translate(0, this.mainHeight - height);
    const bottom = new Transform()
      .scale(1, -1)
      .translate(0, height);

    const leftPoints: Array<Point> = [
      ...cornerR1Points.map(p => p.transformBy(bottom.m())).reverse(),
      ...cornerR1Points.map(p => p.transformBy(top.m())),
    ];
    const rightPoints: Array<Point> = [
      ...cornerR2Points.map(p => p.transformBy(bottom.m())).reverse(),
      ...cornerR2Points.map(p => p.transformBy(top.m())),
    ];
    return { leftPoints, rightPoints, maxX: width };
  }
}
export default VertexRoundedSquareBracket;

