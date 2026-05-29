import {
  Point, getMoveTime, Transform,
} from '../../tools/g2';
// import { roundNum } from '../../../tools/math';
import { duplicateFromTo, joinObjects } from '../../tools/tools';
import type { TypeColor } from '../../tools/types';
import { areColorsSame } from '../../tools/color';
import {
  FigureElementPrimitive, FigureElementCollection,
} from '../Element';
import { Elements } from './Elements/Element';
// import { getFigureElement } from './EquationFunctions';

/**
 * Horizontal Alignment
 *
 * `TypeHAlign = 'left' | 'right' | 'center' | number`
 *
 * Where `number` is a percentage of the width from the left. So
 * `0` would be equivalent to `'left'`, 0.5 equivalent to
 * `'center'` and 1 equivalent to `'right'`.
 * @group Misc Shapes
 */
export type TypeHAlign = 'left' | 'right' | 'center' | number;

/**
 * Vertical Alignment
 *
 * `TypeHAlign = 'left' | 'right' | 'center' | 'baseline' | number`
 *
 * Where `number` is a percentage of the width from the left. So
 * `0` would be equivalent to `'left'`, 0.5 equivalent to
 * `'center'` and 1 equivalent to `'right'`.
 * @group Misc Shapes
 */
export type TypeVAlign = 'top' | 'bottom' | 'middle' | 'baseline' | number;

export type TypeEquationForm = {
  collection: FigureElementCollection;
  // createEq: (Array<Elements | Element | string>) => void;
  arrange: (
    scale: number, xAlign: TypeHAlign | null, yAlign: TypeVAlign | null,
    fixTo: FigureElementPrimitive | FigureElementCollection | Point
  ) => void;
  dissolveElements: (
    elements: Array<FigureElementPrimitive | FigureElementCollection>,
    dissolve: boolean, delay: number, time: number, callback: ((cancelled?: boolean) => void) | null) => void;
  getElementsToShowAndHide: () => void;
  showHide: (showTime: number, hideTime: number, callback: ((arg?: any) => void) | null) => void;
  hideShow: (showTime: number, hideTime: number, callback: ((arg?: any) => void) | null) => void;
  // animateTo: (
  //   number, number,
  //   FigureElementPrimitive | FigureElementCollection | Point,
  //   ?(?mixed) => void,
  //   'left' | 'center' | 'right', 'top' | 'bottom' | 'middle' | 'baseline',
  // ) => void;
  animatePositionsTo: (delay: number, callback: ((arg?: any) => void) | null) => void;
  description: string | null;
  modifiers: Record<string, any>;
  type: string;
  onShow: string | (() => void);
  elementMods: {
    [key: string]: {
      element: FigureElementPrimitive | FigureElementCollection,
      mods: Record<string, any>,
    }
  };
  time: number | null;
} & Elements;

export type TypeCollectionMethods = {
  getAllElements: () => Array<FigureElementPrimitive | FigureElementCollection>,
  hideAll: () => void,
  show: () => void,
  showOnly: (elements: Array<FigureElementPrimitive | FigureElementCollection>) => void,
  stop(cancelled?: boolean, forceSetToEndOfPlan?: boolean): void;
  getElementTransforms: () => { [key: string]: Transform },
  getElementColors: (includeHidden: boolean) => { [key: string]: TypeColor },
  setElementTransforms: (transforms: { [key: string]: Transform }) => void,
  setElementColors: (colors: { [key: string]: TypeColor }) => void,
  animateToTransforms(
    elementTransforms: Record<string, any>,
    time?: number,
    delay?: number,
    rotDirection?: number,
    callback?: string | ((arg?: any) => void) | null,
    name?: string,
    easeFunction?: string | ((n: number) => number)): number,
  animateToColors(
    elementColors: Record<string, any>,
    time?: number,
    delay?: number,
    callback?: string | ((arg?: any) => void) | null,
    name?: string,
    easeFunction?: string | ((n: number) => number)): number,
};

export type TypeElements = {
  [key: string]: FigureElementCollection | FigureElementPrimitive;
};

export type TypeElementTranslationOptions = {
  [key: string]: {
    element: FigureElementPrimitive | FigureElementCollection;
    direction?: 'up' | 'down',
    style: 'curved' | 'linear',
    mag: number,
  },
};
export default class EquationForm extends Elements {
  elements: { [key: string]: FigureElementCollection | FigureElementPrimitive };
  collectionMethods: TypeCollectionMethods;
  name!: string;
  elementMods: {
    [key: string]: {
      element: FigureElementPrimitive | FigureElementCollection;
      mods: Record<string, any>;
    }
  };

  arranged!: {
    scale: number,
    xAlign: TypeHAlign | null,
    yAlign: TypeVAlign | null,
    fixTo: FigureElementPrimitive | FigureElementCollection | Point,
  };

  // These properties are just saved in the form and not used by this class
  // They are used by external classes using this form
  description: string | null;
  modifiers: Record<string, any>;
  onTransition: null | string | (() => void);
  onShow: null | string | (() => void);
  // subForm: string;
  // animation: {
  duration!: number | null | undefined;
  translation!: TypeElementTranslationOptions;
  positionsSet: boolean;
  layout: 'always' | 'lazy' | 'init';
  ignoreColor: boolean;
  ignoreOpacity: boolean;
  // };

  fromForm: {
    [key: string]: {
      onTransition?: string | (() => void),
      onShow?: string | (() => void),
      // animation?: {
      duration?: number,
      translation?: TypeElementTranslationOptions,
      // },
      elementMods: {
        [key: string]: {
          element: FigureElementPrimitive | FigureElementCollection;
          mods: Record<string, any>;
        }
      },
    },
  };

  constructor(
    elements: TypeElements,
    collectionMethods: TypeCollectionMethods,
  ) {
    super([]);
    this.elements = elements;
    this.collectionMethods = collectionMethods;
    this.description = null;
    this.modifiers = {};
    this.elementMods = {};
    this.onShow = null;
    this.onTransition = null;
    // this.duration = null;
    // this.translation = {};
    // this.animation = {};
    this.fromForm = {};
    this.positionsSet = false;
    this.layout = 'always';
    this.ignoreColor = false;
    this.ignoreOpacity = false;
    // this.subForm = '';
  }

  override cleanup() {
    this.elements = {};
    super.cleanup();
  }

  getNamedElements() {
    const namedElements: Record<string, any> = {};
    this.collectionMethods.getAllElements().forEach((element) => {
      namedElements[element.name] = element;
    });
    return namedElements;
  }

  rearrange() {
    this.arrange(
      this.arranged.scale, this.arranged.xAlign, this.arranged.yAlign, this.arranged.fixTo,
    );
  }

  override setPositions(noArrange: boolean = false) {
    if (!noArrange && (this.layout === 'always' || this.positionsSet === false)) {
      this.arrange(
        this.arranged.scale, this.arranged.xAlign, this.arranged.yAlign, this.arranged.fixTo,
      );
    }
    super.setPositions();
    if (!this.ignoreColor) {
      super.setColor(null, 'form');
    }
    if (!this.ignoreOpacity) {
      super.setOpacity();
    }
    this.setDrawOrder();
  }

  // Collect the `front`/`back` draw-order operations declared on this form's
  // `elementMods` (e.g. `elementMods: { a: { back: {} } }`). These are applied
  // alongside the inline `front`/`back` equation functions, in element-mod key
  // order, so `{ a: { back: {} }, b: { back: {} } }` sends `a` to the back and
  // then `b` to the back.
  collectElementModDrawOrder(ops: Array<any>) {
    Object.keys(this.elementMods).forEach((name) => {
      const entry = this.elementMods[name];
      if (entry == null || entry.element == null || entry.mods == null) {
        return;
      }
      const { element, mods } = entry;
      if (element.isFormIgnored) {
        return;
      }
      const add = (modOption: any, front: boolean) => {
        if (modOption === undefined) {
          return;
        }
        const o = modOption == null ? {} : modOption;
        ops.push({
          front,
          num: o.num,
          before: o.before,
          after: o.after,
          elements: [element],
        });
      };
      add(mods.back, false);
      add(mods.front, true);
    });
  }

  // Apply any `front`/`back` draw-order operations - both the inline equation
  // functions (gathered from the form tree) and those declared on `elementMods`.
  // Operations are applied relative to a baseline (the natural draw order,
  // captured before the first reorder) so the result is deterministic no matter
  // how many times `setPositions` runs. The reorder is performed on the shared
  // equation collection (the common parent of all wrapped elements).
  setDrawOrder() {
    const ops: Array<any> = [];
    super.collectDrawOrder(ops);
    this.collectElementModDrawOrder(ops);
    // Find the equation collection (the common parent of all child elements).
    const children = this.collectionMethods.getAllElements();
    const collection: any = (children != null && children.length > 0)
      ? children[0].parent : null;
    if (collection == null) {
      return;
    }
    // Draw order is color-like: once the equation has used front/back at least
    // once (so a baseline has been captured), every form resets to the natural
    // baseline before applying its ops - so a form with no front/back restores
    // the natural draw order. Equations that never use front/back are left
    // untouched (no baseline, no reset).
    if (ops.length === 0 && collection.equationDrawOrderBaseline == null) {
      return;
    }
    // Lazily capture / extend the baseline draw order on the shared collection
    // (so every form resets to the same natural order). New element names (added
    // after the baseline was captured) are appended in their current order.
    if (collection.equationDrawOrderBaseline == null) {
      collection.equationDrawOrderBaseline = [];
    }
    const baseline: Array<string> = collection.equationDrawOrderBaseline;
    const baselineSet: Set<string> = new Set(baseline);
    collection.drawOrder.forEach((name: string) => {
      if (!baselineSet.has(name)) {
        baseline.push(name);
        baselineSet.add(name);
      }
    });
    // Reset to baseline (dropping any names no longer present) before applying.
    const currentSet: Set<string> = new Set(collection.drawOrder);
    collection.drawOrder = baseline.filter((name: string) => currentSet.has(name));
    ops.forEach((op: any) => {
      this.applyDrawOrderOp(collection, op);
    });
  }

  // Move a single op's element group within the equation collection's draw
  // stack. The group is always kept contiguous and in its current relative
  // order (front/back does not reorder within the group). The target position
  // is determined by `before`/`after` (anchor relative) or `num` (relative for
  // positive, absolute-from-the-extreme for negative), else the full extreme.
  // eslint-disable-next-line class-methods-use-this
  applyDrawOrderOp(collection: any, op: any) {
    const order: Array<string> = collection.drawOrder;
    const inGroup: Record<string, boolean> = {};
    op.elements.forEach((e: any) => { inGroup[e.name] = true; });
    // Group names in their current relative draw order, so the move preserves it
    const group = order.filter(name => inGroup[name]);
    if (group.length === 0) {
      return;
    }
    const groupSize = group.length;
    const minIdx = order.indexOf(group[0]);
    const maxIdx = order.indexOf(group[groupSize - 1]);
    const rest = order.filter(name => !inGroup[name]);
    const restLength = rest.length;

    const anchorNames = (anchor: any): Array<string> => {
      if (anchor == null) {
        return [];
      }
      const arr = Array.isArray(anchor) ? anchor : [anchor];
      return arr
        .map((a: any) => ((a != null && a.name != null) ? a.name : a))
        .filter((n: any) => typeof n === 'string');
    };

    let target;
    if (op.before != null) {
      // Position the group just before the most-back anchor (`num` shifts it
      // further back; defaults to 0 when an anchor is given). If none of the
      // named anchors resolve (typo, or the anchor is itself inside the moved
      // group), leave the group where the baseline placed it rather than
      // silently sending it to an extreme.
      const idxs = anchorNames(op.before)
        .map(n => rest.indexOf(n)).filter(i => i > -1);
      if (idxs.length === 0) {
        return;
      }
      const num = op.num == null ? 0 : op.num;
      target = Math.min(...idxs) - num;
    } else if (op.after != null) {
      // Position the group just after the most-front anchor (`num` shifts it
      // further forward; defaults to 0 when an anchor is given). As with
      // `before`, an unresolved anchor is a no-op.
      const idxs = anchorNames(op.after)
        .map(n => rest.indexOf(n)).filter(i => i > -1);
      if (idxs.length === 0) {
        return;
      }
      const num = op.num == null ? 0 : op.num;
      target = Math.max(...idxs) + 1 + num;
    } else if (op.num == null) {
      target = op.front ? restLength : 0;
    } else {
      // Positive `num` moves the group that many places relative to its current
      // edge; negative `num` positions it absolutely, `|num|` places before the
      // full extreme.
      const n = op.num;
      if (op.front) {
        target = n >= 0 ? (maxIdx + n - groupSize + 1) : restLength + n;
      } else {
        target = n >= 0 ? minIdx - n : -n;
      }
    }
    target = Math.max(0, Math.min(restLength, target));
    collection.drawOrder = [...rest.slice(0, target), ...group, ...rest.slice(target)];
  }

  override _dup(
    elements: TypeElements = this.elements,
    collectionMethods: TypeCollectionMethods = this.collectionMethods,
  ) {
    const equationCopy = new EquationForm(elements, collectionMethods);
    const namedElements: Record<string, any> = {};
    collectionMethods.getAllElements().forEach((element) => {
      namedElements[element.name] = element;
    });
    const newContent: Array<any> = [];
    this.content.forEach((contentElement) => {
      newContent.push(contentElement._dup(namedElements));
    });
    equationCopy.content = newContent;
    duplicateFromTo(this, equationCopy, ['content', 'collectionMethods', 'form', 'elements']);
    return equationCopy;
  }

  // createEq(content: Array<Elements | Element | string>) {
  //   const elements = [];
  //   content.forEach((c) => {
  //     if (typeof c === 'string') {
  //       if (c.startsWith('space')) {
  //         const spaceNum = parseFloat(c.replace(/space[_]*/, '')) || 0.03;
  //         elements.push(new Element(new BlankElement(spaceNum)));
  //       } else if (c.startsWith(' ')) {
  //         const spaceNum = c.length * 0.03;
  //         elements.push(new Element(new BlankElement(spaceNum)));
  //       } else {
  //         const figureElement = getFigureElement(this.elements, c);
  //         if (figureElement) {
  //           elements.push(new Element(figureElement));
  //         }
  //       }
  //     } else {
  //       elements.push(c._dup());
  //     }
  //     this.content = elements;
  //   });
  //   // this.content = content;
  // }

  // An Equation collection is a flat collection of FigureElements.
  //
  // The form determines how elements are positioned relative to each other.
  //
  // A form of an equation takes the form's elements (a subset of the
  // collection) and applies a translation and scale transformation. This
  // aligns all the elements of a form relative to each other to render
  // the desired form.
  //
  // Arranging a form of an equation goes through each element in the form
  // and positions and scales it in the equation's vertex space.
  // It also saves the locaiton and scale information in the form's element
  // property.
  //
  // The elements are positioned relative to 0,0 in vertex space based on the
  // fixTo, xAlign and yAlign parameters.
  //
  // fixTo can only be a point in the equation's vertex space, or a
  // FigureElement in the equation.
  //
  // If fixTo is an element in the equation:
  //    - the fixTo element is positioned at 0, 0, and all other elements
  //      repositioned relative to that.
  //    - The equation collection setPosition (or translation transform) can
  //      then be used to position the equation in the figure (or relative
  //      collection space)
  //    - if xAlign is:
  //        - 'center': the fixTo element is centered in x around (0, 0)
  //        - 'right': the fixTo element right most point is at x = 0
  //        - 'left': default - the fixTo element x position at 0
  //    - if yAlign is:
  //        - 'middle': the fixTo element is centered in y around (0, 0)
  //        - 'bottom': the fixTo element bottom most point is at y = 0
  //        - 'top': the fixTo element top most point is at y = 0
  //        - 'baseline': default - the fixTo element y position at 0
  //
  // If fixTo is a Point, the equation is positioned at that point in the
  // equation's vertex space.
  //  - xAlign:
  //    - 'left': The equation's left most element's left most point is at
  //              Point.x
  //    - 'right': The equation's right most element's right most point is at
  //              Point.x
  //    - 'center': The equation is centered horizontally around Point.x
  //  - yAlign:
  //    - 'baseline': The equation's baseline is at Point.y
  //    - 'top': The equation's top most element's top most point is at Point.y
  //    - 'bottom': The equation's top most element's top most point is at
  //                Point.y
  //    - 'middle': The equation is centered vertically around Point.y
  //
  arrange(
    scale: number = 1,
    xAlign: TypeHAlign | null = 'left',
    yAlign: TypeVAlign | null = 'baseline',
    fixTo: FigureElementPrimitive | FigureElementCollection | Point = new Point(0, 0),
  ) {
    this.arranged = {
      scale,
      xAlign,
      yAlign,
      fixTo,
    };
    // const elementsInCollection = this.collectionMethods.getAllElements();
    // const elementsCurrentlyShowing = elementsInCollection.filter(e => e.isShown);
    // this.collectionMethods.hideAll();
    // this.collectionMethods.show();

    this.positionsSet = true;
    super.calcSize(new Point(0, 0), scale);
    this.setPositions(true);

    let fixPoint = new Point(0, 0);
    if (fixTo instanceof FigureElementPrimitive
        || fixTo instanceof FigureElementCollection) {
      const t = fixTo.transform.t();
      if (t != null) {
        fixPoint = t._dup();
      }
    } else {
      // fixPoint = getPoint(fixTo).scale(-1);
      fixPoint = new Point(-fixTo.x, -fixTo.y);
    }

    let w = this.width;
    let h = this.height;
    let a = this.ascent;
    let d = this.descent;
    let p = this.location._dup();

    if (fixTo instanceof FigureElementPrimitive
        || fixTo instanceof FigureElementCollection) {
      const t = fixTo.transform.t();
      const s = fixTo.transform.s();
      if (t != null && s != null) {
        const rect = fixTo.getBoundingRect('draw');
        w = rect.width * s.x;
        h = rect.height * s.y;
        a = rect.top * s.y - t.y;
        d = t.y - rect.bottom * s.y;
        p = t._dup();
      }
    }

    if (xAlign === 'right') {
      fixPoint.x += w;
    } else if (xAlign === 'center') {
      fixPoint.x += w / 2;
    } else if (typeof xAlign === 'number') {
      fixPoint.x += xAlign * w;
    } else if (xAlign != null && xAlign.slice(-1)[0] === 'o') {
      const offset = parseFloat(xAlign);
      fixPoint.x += offset;
    }

    if (yAlign === 'top') {
      fixPoint.y += p.y + a;
    } else if (yAlign === 'bottom') {
      fixPoint.y += p.y - d;
    } else if (yAlign === 'middle') {
      fixPoint.y += p.y - d + h / 2;
    } else if (typeof yAlign === 'number') {
      fixPoint.y += p.y - d + yAlign * h;
    } else if (yAlign != null && yAlign.slice(-1)[0] === 'o') {
      const offset = parseFloat(yAlign);
      fixPoint.y += p.y + offset;
    }

    const delta = new Point(0, 0).sub(fixPoint);
    if (delta.x !== 0 || delta.y !== 0) {
      this.offsetLocation(delta);
      this.setPositions(true);
    }
    // this.positionsSet = false;
    // this.collectionMethods.showOnly(elementsCurrentlyShowing);
  }

  lazyArrange(
    scale: number = 1,
    xAlign: TypeHAlign | null = 'left',
    yAlign: TypeVAlign | null = 'baseline',
    fixTo: FigureElementPrimitive | FigureElementCollection | Point = new Point(0, 0),
  ) {
    this.arranged = {
      scale,
      xAlign,
      yAlign,
      fixTo,
    };
    this.positionsSet = false;
  }

  // eslint-disable-next-line class-methods-use-this
  dissolveElements(
    elements: Array<FigureElementPrimitive | FigureElementCollection>,
    dissolve: 'in' | 'out' = 'in',
    delay: number = 0.01,
    time: number = 1,
    callback: (string | ((cancelled: boolean) => void)) | null = null,
  ) {
    if (elements.length === 0) {
      if (callback) {
        this.fnMap.exec(callback, false);
        // callback(false);
        return;
      }
    }
    const count = elements.length;
    let completed = 0;
    const onFinish = (cancelled: boolean) => {
      completed += 1;
      if (completed === count) {
        if (callback) {
          // callback(cancelled);
          this.fnMap.exec(callback, cancelled);
        }
      }
    };
    elements.forEach((e) => {
      (e.animations.addTo('_EquationColor') as any)
        .opacity({
          dissolve, onFinish, duration: time, delay, completeOnCancel: true,
        })
        .start();
    });
  }

  getElementsToShowAndHide() {
    const allElements = this.collectionMethods.getAllElements();
    const elementsShown = allElements.filter(e => e.isShown && !e.isFormIgnored);
    const elementsShownTarget = (this.getAllElements(false) as Array<FigureElementPrimitive | FigureElementCollection>)
      .filter(e => !e.isFormIgnored);
    const elementsToHide: Array<FigureElementPrimitive
                                | FigureElementCollection> =
       elementsShown.filter(e => elementsShownTarget.indexOf(e) === -1);
    const elementsToShow: Array<FigureElementCollection | FigureElementPrimitive> =
      elementsShownTarget.filter(e => elementsShown.indexOf(e) === -1);
    return {
      show: elementsToShow,
      hide: elementsToHide,
    };
  }

  render() {
    this.hideShow();
    this.setPositions();
  }

  showHide(
    showTime: number = 0,
    hideTime: number = 0,
    callback: ((arg?: any) => void) | null = null,
    animationStop: boolean = true,
  ) {
    if (animationStop) {
      this.collectionMethods.stop();
    }
    this.collectionMethods.show();
    const { show, hide } = this.getElementsToShowAndHide();
    if (showTime === 0) {
      show.forEach((e) => {
        e.showAll();
      });
    } else {
      this.dissolveElements(show, 'in', 0.01, showTime, null);
    }

    if (hideTime === 0) {
      hide.forEach(e => e.hide());
    } else {
      this.dissolveElements(hide, 'out', showTime, hideTime, callback);
    }
  }

  hideShow(
    showTime: number = 0,
    hideTime: number = 0,
    callback: ((arg?: any) => void) | null = null,
    animationStop: boolean = true,
  ) {
    if (animationStop) {
      this.collectionMethods.stop();
    }
    this.collectionMethods.show();
    const { show, hide } = this.getElementsToShowAndHide();
    if (hideTime === 0) {
      hide.forEach(e => e.hide());
    } else {
      this.dissolveElements(hide, 'out', 0.01, hideTime, null);
    }
    if (showTime === 0) {
      show.forEach((e) => {
        e.showAll();
      });
      if (callback != null) {
        callback();
      }
    } else {
      this.dissolveElements(show, 'in', hideTime, showTime, callback);
    }
  }

  allHideShow(
    delay: number = 0,
    hideTime: number = 0.5,
    blankTime: number = 0.5,
    showTime: number = 0.5,
    callback: ((cancelled: boolean) => void) | null = null,
  ): number {
    this.collectionMethods.stop();
    const allElements = this.collectionMethods.getAllElements();
    const elementsShown = allElements.filter(e => e.isShown && !e.isFormIgnored);
    const elementsToShow = (this.getAllElements(false) as Array<FigureElementPrimitive | FigureElementCollection>)
      .filter(e => !e.isFormIgnored);
    const elementsToDelayShowing = elementsToShow.filter(e => !e.isShown);
    const elementsToShowAfterDissolve = elementsToShow.filter(e => e.isShown);
    let cumTime = delay;

    if (elementsToShow.length === 0 && elementsShown.length === 0) {
      if (callback != null) {
        callback(false);
      }
      return 0;
    }

    let dissolveOutCallback: any = () => {
      this.setPositions();
    };
    if (elementsToShow.length === 0) {
      dissolveOutCallback = (cancelled: boolean) => {
        this.setPositions();
        if (callback != null) {
          callback(cancelled);
        }
      };
    }

    if (elementsShown.length > 0) {
      this.dissolveElements(
        elementsShown, 'out', delay, hideTime, dissolveOutCallback,
      );
      cumTime += hideTime;
    } else {
      this.setPositions();
    }

    this.applyElementMods();

    const count = elementsToShow.length;
    let completed = 0;
    const onFinish = (cancelled: boolean) => {
      completed += 1;
      if (completed === count - 1) {
        if (callback) {
          callback(cancelled);
        }
      }
    };
    elementsToDelayShowing.forEach((e) => {
      (e.animations.addTo('_EquationColor') as any)
        .dissolveIn({
          duration: showTime, onFinish, delay: cumTime + blankTime,
        })
        .start();
    });
    elementsToShowAfterDissolve.forEach((e) => {
      (e.animations.addTo('_EquationColor') as any)
        .dissolveIn({
          duration: showTime, onFinish, delay: blankTime,
        })
        .start();
    });
    if (elementsToShow.length > 0) {
      cumTime += blankTime + showTime;
    }
    // Upper bound on the total animation time: when elementsToDelayShowing
    // finish their dissolveIn. elementsToShowAfterDissolve are scheduled with
    // `delay: blankTime` (not `cumTime + blankTime`) so they may finish earlier.
    return cumTime;
  }

  applyElementMods(fromWhere: null | string = null) {
    const setProps = (elementMods: Record<string, any>) => {
      Object.keys(elementMods).forEach((elementName) => {
        const { element, mods } = elementMods[elementName];
        if (element != null && element.isFormIgnored) {
          return;
        }
        if (element != null && mods != null) {
          // `back`/`front` are draw-order operations handled by setDrawOrder, not
          // element properties, so don't copy them onto the element.
          element.setProperties(mods, ['back', 'front']);
          if (mods.color != null) {
            element.setColor(mods.color);
          }
          if (mods.opacity != null) {
            element.setOpacity(mods.opacity);
          }
        }
      });
    };
    setProps(this.elementMods);
    if (
      fromWhere != null
      && fromWhere.length > 0
      && this.fromForm[fromWhere] != null
      && this.fromForm[fromWhere].elementMods != null
    ) {
      setProps(this.fromForm[fromWhere].elementMods);
    }
  }

  // Check callback is being called
  animatePositionsTo(
    delay: number,
    dissolveOutTime: number,
    moveTime: number | null,
    dissolveInTime: number,
    callback: (string | ((arg?: any) => void)) | null = null,
    fromWhere: string | null | undefined = null,
    dissolveInBeforeMove: boolean = false,
  ) {
    const allElements = this.collectionMethods.getAllElements();
    this.collectionMethods.stop();
    const elementsShownTarget = (this.getAllElements(false) as Array<FigureElementPrimitive | FigureElementCollection>)
      .filter(e => !e.isFormIgnored);
    elementsShownTarget.forEach((e) => {
      if (e.opacity === 0.001) {
        e.hide();
        e.setOpacity(1);
      } else {
        e.setOpacity(1);
      }
    });

    const elementsShown = allElements.filter(e => e.isShown && !e.isFormIgnored);
    const elementsToHide =
      elementsShown.filter(e => elementsShownTarget.indexOf(e) === -1);
    const elementsToShow =
      elementsShownTarget.filter(e => elementsShown.indexOf(e) === -1);

    const currentTransforms = this.collectionMethods.getElementTransforms();
    const currentColors = this.collectionMethods.getElementColors(true);
    this.setPositions();
    const animateToTransforms = this.collectionMethods.getElementTransforms();
    let animateToColors: Record<string, any> = {};
    if (!this.ignoreColor) {
      animateToColors = this.collectionMethods.getElementColors(true);
    }

    const elementsToMove: Array<string> = [];
    const toMoveStartTransforms: Array<Transform> = [];
    const toMoveStopTransforms: Array<Transform> = [];
    Object.keys(animateToTransforms).forEach((key) => {
      const currentT = currentTransforms[key];
      const nextT = animateToTransforms[key];
      if (!currentT.isEqualTo(nextT)) {
        elementsToMove.push(key);
        toMoveStartTransforms.push(currentT);
        toMoveStopTransforms.push(nextT);
      }
    });

    const elementsToChangeColor: Array<string> = [];
    const toColorStart: Array<TypeColor> = [];
    const toColorStop: Array<TypeColor> = [];
    Object.keys(animateToColors).forEach((key) => {
      const currentC = currentColors[key];
      const nextC = animateToColors[key];
      if (!areColorsSame(currentC, nextC)) {
        elementsToChangeColor.push(key);
        toColorStart.push(currentC);
        toColorStop.push(nextC);
      }
    });

    const toShowTransforms: Record<string, any> = {};
    elementsToShow.forEach((element) => {
      toShowTransforms[element.name] = element.transform._dup();
    });

    const toShowColors: Record<string, any> = {};
    elementsToShow.forEach((element) => {
      toShowColors[element.name] = element.color.slice();
    });

    // Find move time to use. If moveTime is null, then a velocity is used.
    let moveTimeToUse;
    if (moveTime === null) {
      moveTimeToUse = getMoveTime(
        toMoveStartTransforms, toMoveStopTransforms, 0,
        new Point(0.35, 0.35),      // 0.25 figure space per s
        new Point(0, 0, 2 * Math.PI / 6),            // 60º per second
        new Point(0.4, 0.4),            // 100% per second
      );
    } else {
      moveTimeToUse = moveTime;
    }
    this.collectionMethods.setElementTransforms(currentTransforms);
    this.collectionMethods.setElementTransforms(toShowTransforms);
    this.collectionMethods.setElementColors(currentColors);
    this.collectionMethods.setElementColors(toShowColors);

    let cumTime = delay;

    let moveCallback: any = null;
    let dissolveInCallback: any = null;
    let dissolveOutCallback: any = null;
    let colorCallback: any = null;

    if (dissolveInBeforeMove) {
      if (elementsToMove.length === 0 && elementsToShow.length === 0) {
        dissolveOutCallback = callback;
      } else if (elementsToMove.length === 0) {
        dissolveInCallback = callback;
      } else {
        moveCallback = callback;
      }
    } else if (elementsToMove.length === 0 && elementsToShow.length === 0) {
      dissolveOutCallback = callback;
    } else if (elementsToShow.length === 0) {
      moveCallback = callback;
    } else {
      dissolveInCallback = callback;
    }
    if (
      elementsToChangeColor.length > 0
      && elementsToMove.length === 0
      && elementsToShow.length === 0
      && elementsToHide.length === 0
    ) {
      colorCallback = callback;
    }
    let colorAnimationsStarted = false;

    if (elementsToHide.length > 0) {
      this.dissolveElements(elementsToHide, 'out', delay, dissolveOutTime, dissolveOutCallback);
      cumTime += dissolveOutTime;
      if (
        elementsToChangeColor.length > 0
        && elementsToShow.length === 0
        && elementsToMove.length === 0
      ) {
        this.collectionMethods.animateToColors(
          animateToColors, dissolveOutTime, delay, null, '_EquationAnimateColor',
        );
        colorAnimationsStarted = true;
      }
    } else if (dissolveOutCallback != null) {
      this.fnMap.exec(dissolveOutCallback);
    }

    this.applyElementMods(fromWhere);

    let translationToUse: Record<string, any> = {};

    if (
      typeof fromWhere === 'string'
      && fromWhere.length !== 0
      && this.fromForm != null
      && this.fromForm[fromWhere] != null
      // && this.fromForm[fromWhere].animation != null
      && this.fromForm[fromWhere].translation !== undefined
    ) {
      translationToUse = joinObjects<any>(
        {},
        this.translation,
        this.fromForm[fromWhere].translation,
      );
    } else {
      translationToUse = joinObjects<any>({}, this.translation);
    }

    Object.keys(translationToUse).forEach((key) => {
      const mods = translationToUse[key];
      const {
        element, style, direction, mag,
      } = mods;
      if (element) {
        if (style != null) {
          element.animations.options.translation.style = style;
        }
        if (direction != null) {
          element.animations.options.translation.direction = direction;
        }
        if (mag != null) {
          element.animations.options.translation.magnitude = mag;
        }
      }
    });

    if (dissolveInBeforeMove) {
      if (elementsToShow.length > 0) {
        if (elementsToChangeColor.length > 0) {
          this.collectionMethods.animateToColors(
            animateToColors, dissolveOutTime, cumTime, null, '_EquationAnimateColor',
          );
          colorAnimationsStarted = true;
        }
        this.dissolveElements(elementsToShow, 'in', cumTime, dissolveInTime, dissolveInCallback);
        cumTime += dissolveInTime + 0.001;
      }
    }
    if (
      elementsToChangeColor.length > 0
      && elementsToShow.length === 0
      && elementsToMove.length > 0
      && !colorAnimationsStarted
    ) {
      this.collectionMethods.animateToColors(
        animateToColors, dissolveOutTime, cumTime, null, '_EquationAnimateColor',
      );
      colorAnimationsStarted = true;
    }
    const t = this.collectionMethods.animateToTransforms(
      animateToTransforms,
      moveTimeToUse,
      cumTime,
      0,
      moveCallback,
      '_Equation',
    );
    if (t > 0) {
      cumTime = t;
    }

    // if (elementsToShow.length > 0) {
    //   this.dissolveElements(elementsToShow, 'in', cumTime, dissolveInTime, dissolveInCallback);
    //   cumTime += dissolveInTime + 0.001;
    // }
    if (!dissolveInBeforeMove) {
      if (elementsToShow.length > 0) {
        if (elementsToChangeColor.length > 0) {
          this.collectionMethods.animateToColors(
            animateToColors, dissolveInTime, cumTime, null, '_EquationAnimateColor',
          );
          colorAnimationsStarted = true;
        }
        // const t = this.collectionMethods.animateToColors(
        //   animateToColors,
        //   dissolveInTime,
        //   cumTime,
        //   null,
        //   '_EquationAnimateColor',
        // );
        this.dissolveElements(elementsToShow, 'in', cumTime, dissolveInTime, dissolveInCallback);
        cumTime += dissolveInTime + 0.001;
      }
    }
    if (
      elementsToChangeColor.length > 0
      && elementsToShow.length === 0
      && elementsToMove.length === 0
      && elementsToHide.length === 0
      && !colorAnimationsStarted
    ) {
      cumTime += this.collectionMethods.animateToColors(
        animateToColors, dissolveInTime, cumTime, colorCallback, '_EquationAnimateColor',
      );
      colorAnimationsStarted = true;
    }
    return cumTime;
  }
}
