// @flow
import {
  Point,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracket';

class VertexSquareBracket extends VertexBracket {
  getPoints() {
    let w = 1 / 30;

    if (this.numLines > 1) {
      w /= this.numLines;
    }

    const tail = w * 4;

    const leftPoints = [
      new Point(tail, 0),
      new Point(0, 0),
      new Point(0, this.mainHeight),
      new Point(tail, this.mainHeight),
    ];
    const rightPoints = [
      new Point(tail, w),
      new Point(w, w),
      new Point(w, this.mainHeight - w),
      new Point(tail, this.mainHeight - w),
    ];
    const maxX = tail;
    return { leftPoints, rightPoints, maxX };
  }
}
export default VertexSquareBracket;

