import {
  Point,
} from '../../../tools/g2';
import {
  FigureElementPrimitive, FigureElementCollection,
} from '../../Element';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

// Layout-neutral wrapper that records a draw-order operation (`front` or
// `back`) for the elements it wraps. The actual reordering of the equation
// collection's draw stack is performed by `EquationForm.setPositions` after the
// ops are gathered with `collectDrawOrder` (paralleling the `color`/`opacity`
// cascade). `front` true moves wrapped elements forward in the draw stack,
// `front` false moves them back. `num` is the number of places to move; when
// `null` the elements are moved completely to the front/back.
export default class DrawOrder extends BaseEquationFunction {
  override calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const { fullContentBounds } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    const fullBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent.getBounds(fullContentBounds));
      fullBounds.copyFrom(mainContent.getBounds(true));
    }
    this.width = contentBounds.width;
    this.height = contentBounds.height;
    this.descent = contentBounds.descent;
    this.ascent = contentBounds.ascent;
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }

  override collectDrawOrder(ops: Array<any>) {
    // Collect nested front/back ops first so they are applied before this one.
    // Each op moves its element group while preserving the group's *current*
    // relative draw order, so a nested front/back reorders the elements and the
    // outer (this) op then moves the reordered group as a unit. This composes
    // consistently: the innermost op runs first, the outermost last.
    super.collectDrawOrder(ops);
    const {
      front, num, before, after,
    } = this.options;
    const elements = this.getAllElements(true).filter(
      e => e instanceof FigureElementPrimitive || e instanceof FigureElementCollection,
    );
    if (elements.length > 0) {
      ops.push({
        front,
        num: num == null ? null : num,
        before: before == null ? null : before,
        after: after == null ? null : after,
        elements,
      });
    }
  }
}
