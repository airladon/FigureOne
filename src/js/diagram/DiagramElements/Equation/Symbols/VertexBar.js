// @flow
import {
  Point,
} from '../../../../tools/g2';
import VertexBracket from './VertexBracket';

class VertexBar extends VertexBracket {
  getPoints() {
    let w = 1 / 15;

    if (this.numLines > 1) {
      w /= this.numLines;
    }

    const leftPoints = [
      new Point(0, 0),
      new Point(0, this.mainHeight),
    ];
    const rightPoints = [
      new Point(w, 0),
      new Point(w, this.mainHeight),
    ];
    const maxX = w;
    return { leftPoints, rightPoints, maxX };
  }
}
export default VertexBar;

