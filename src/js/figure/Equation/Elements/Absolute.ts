import {
  Point,
} from '../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';
import type {
  FigureElementPrimitive, FigureElementCollection,
} from '../../Element';

// Layout-neutral wrapper that pins its contents to a fixed position instead of
// letting the surrounding equation layout place them.
//
// The contents contribute no width, height, ascent or descent (not even to the
// full content bounds), and they ignore `offsetLocation` - including the
// whole-form offset `EquationForm.arrange` applies for the form's `xAlign` and
// `yAlign`. So the equation lays out exactly as it would without this function.
//
// The position is a point in one of three spaces:
//  - 'local':  the equation's own layout space (no conversion needed)
//  - 'figure': figure space
//  -  element: the draw space of some other figure element
// and is resolved by `EquationForm.setAbsolutePositions` after the form has
// been laid out and aligned - the figure and element spaces need the equation's
// place in the figure, and a 'local' percentage needs the form's final bounds.
export default class Absolute extends BaseEquationFunction {
  override calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const [mainContent] = this.contents;
    if (mainContent != null) {
      mainContent.calcSize(location._dup(), scale);
    }
    this.width = 0;
    this.height = 0;
    this.descent = 0;
    this.ascent = 0;
    this.fullSize = {
      leftOffset: 0,
      width: 0,
      ascent: 0,
      descent: 0,
      height: 0,
    };
  }

  // The contents are positioned absolutely, so surrounding layout must not move
  // them. Only this function's own bookkeeping location tracks the offset.
  override offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
  }

  override collectAbsolutes(absolutes: Array<Absolute>) {
    super.collectAbsolutes(absolutes);
    absolutes.push(this);
  }

  // Move the contents so their `xAlign`/`yAlign` point sits on the target
  // position. Recomputing the content bounds each time makes this idempotent,
  // so it can be re-run on every form render (and every frame when
  // `update: true`) without accumulating offsets.
  //
  // Returns `false` if the space could not be resolved (the equation is not in
  // a figure yet, or the target element has not been added yet), so the caller
  // can retry on a later frame.
  resolve(
    equation: FigureElementCollection | null,
    formBounds: Bounds | null,
  ): boolean {
    const [mainContent] = this.contents;
    if (mainContent == null) {
      return true;
    }
    const target = this.getTargetPosition(equation, formBounds);
    if (target == null) {
      return false;
    }
    const { xAlign, yAlign, fullContentBounds } = this.options;
    const b = mainContent.getBounds(fullContentBounds);

    let x = b.left;
    if (xAlign === 'center') {
      x = b.left + b.width / 2;
    } else if (xAlign === 'right') {
      x = b.right;
    } else if (typeof xAlign === 'number') {
      x = b.left + b.width * xAlign;
    }

    let y = b.bottom;
    if (yAlign === 'middle') {
      y = b.bottom + b.height / 2;
    } else if (yAlign === 'top') {
      y = b.top;
    } else if (yAlign === 'baseline') {
      y = mainContent.location.y;
    } else if (typeof yAlign === 'number') {
      y = b.bottom + b.height * yAlign;
    }

    mainContent.offsetLocation(new Point(target.x - x, target.y - y));
    return true;
  }

  // Target position in the equation's layout (draw) space, or `null` if the
  // space cannot be resolved yet.
  getTargetPosition(
    equation: FigureElementCollection | null,
    formBounds: Bounds | null,
  ): Point | null {
    const {
      x, y, unit, space,
    } = this.options;
    const percent = unit === 'percent';
    if (space === 'local') {
      if (!percent) {
        return new Point(x, y);
      }
      if (formBounds == null) {
        return null;
      }
      return new Point(
        formBounds.left + x * formBounds.width,
        formBounds.bottom + y * formBounds.height,
      );
    }
    // Figure and element spaces are only defined once the equation is part of a
    // figure with a scene. Until it is, leave the contents where the layout put
    // them - the position resolves on a later render. Any other failure (an
    // unsupported scene projection, say) is left to surface rather than being
    // silently turned into unpositioned content.
    if (equation == null || equation.getScene() == null) {
      return null;
    }
    if (space === 'figure') {
      let p = new Point(x, y);
      if (percent) {
        const scene = equation.getScene()!;
        p = new Point(
          scene.left + x * (scene.right - scene.left),
          scene.bottom + y * (scene.top - scene.bottom),
        );
      }
      return equation.transformPoint(p, 'figure', 'draw');
    }
    const element = this.getSpaceElement(equation);
    if (element == null || element.getScene() == null) {
      return null;
    }
    let p = new Point(x, y);
    if (percent) {
      const r = element.getBoundingRect('draw');
      p = new Point(r.left + x * r.width, r.bottom + y * r.height);
    }
    return equation.transformPoint(
      element.transformPoint(p, 'draw', 'figure'), 'figure', 'draw',
    );
  }

  // `options.space` is either a figure element, or the name (or path) of one.
  // A name is looked up in the equation first, then from the figure root so
  // elements outside the equation can be targeted with a full path.
  //
  // The lookup is deliberately not cached: with `update: true` this runs every
  // frame precisely so the content tracks the current target, and a cache would
  // keep pinning to an element that has since been removed and replaced.
  getSpaceElement(
    equation: FigureElementCollection,
  ): FigureElementPrimitive | FigureElementCollection | null {
    const { space } = this.options;
    if (typeof space !== 'string') {
      return space as FigureElementPrimitive | FigureElementCollection;
    }
    const element = equation.getElement(space);
    if (element != null && element !== equation) {
      return element as FigureElementPrimitive | FigureElementCollection;
    }
    const root = equation.getRootElement();
    if (root == null || root === equation) {
      return null;
    }
    return (root.getElement(space) as FigureElementPrimitive
      | FigureElementCollection | undefined) ?? null;
  }
}
