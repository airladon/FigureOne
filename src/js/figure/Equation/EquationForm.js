// @flow
import {
  Point, getMoveTime, Transform,
} from '../../tools/g2';
// import { roundNum } from '../../../tools/math';
import { duplicateFromTo, joinObjects } from '../../tools/tools';
import {
  FigureElementPrimitive, FigureElementCollection,
} from '../Element';
import { Elements } from './Elements/Element';
// eslint-disable-next-line import/no-cycle
// import { getFigureElement } from './EquationFunctions';

/**
 * Horizontal Alignment
 *
 * `TypeHAlign = 'left' | 'right' | 'center' | number`
 *
 * Where `number` is a percentage of the width from the left. So
 * `0` would be equivalent to `'left'`, 0.5 equivalent to
 * `'center'` and 1 equivalent to `'right'`.
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
 */
export type TypeVAlign = 'top' | 'bottom' | 'middle' | 'baseline' | number;

export type TypeEquationForm = {
  collection: FigureElementCollection;
  // createEq: (Array<Elements | Element | string>) => void;
  arrange: (
    number, TypeHAlign | null, TypeVAlign | null,
    FigureElementPrimitive | FigureElementCollection | Point
  ) => void;
  dissolveElements: (
    Array<FigureElementPrimitive | FigureElementCollection>,
    boolean, number, number, ?(?boolean)) => void;
  getElementsToShowAndHide: () => void;
  showHide: (number, number, ?(?mixed)) => void;
  hideShow: (number, number, ?(?mixed)) => void;
  // animateTo: (
  //   number, number,
  //   FigureElementPrimitive | FigureElementCollection | Point,
  //   ?(?mixed) => void,
  //   'left' | 'center' | 'right', 'top' | 'bottom' | 'middle' | 'baseline',
  // ) => void;
  animatePositionsTo: (number, ?(?mixed) => void) => void;
  description: string | null;
  modifiers: Object;
  type: string;
  onShow: string | (() => void);
  elementMods: {
    [string]: {
      element: FigureElementPrimitive | FigureElementCollection,
      mods: Object,
    }
  };
  time: number | null;
} & Elements;

export type TypeCollectionMethods = {
  getAllElements: () => Array<FigureElementPrimitive | FigureElementCollection>,
  hideAll: () => void,
  show: () => void,
  showOnly: (Array<FigureElementPrimitive | FigureElementCollection>) => void,
  stop(cancelled?: boolean, forceSetToEndOfPlan?: boolean): void;
  getElementTransforms: () => { [string: string]: Transform },
  setElementTransforms: ({ [string: string]: Transform }) => void,
  animateToTransforms(
    elementTransforms: Object,
    time?: number,
    delay?: number,
    rotDirection?: number,
    callback?: ?(string | ((?mixed) => void)),
    name?: string,
    easeFunction?: string | ((number) => number)): number,
};

export type TypeElements = {
  [string: string]: FigureElementCollection | FigureElementPrimitive;
};

export type TypeElementTranslationOptions = {
  [elementName: string]: {
    element: FigureElementPrimitive | FigureElementCollection;
    direction?: 'up' | 'down',
    style: 'curved' | 'linear',
    mag: number,
  },
};
export default class EquationForm extends Elements {
  elements: { [string: string]: FigureElementCollection | FigureElementPrimitive };
  collectionMethods: TypeCollectionMethods;
  name: string;
  elementMods: {
    [elementName: string]: {
      element: FigureElementPrimitive | FigureElementCollection;
      mods: Object;
    }
  };

  arranged: {
    scale: number,
    xAlign: TypeHAlign | null,
    yAlign: TypeVAlign | null,
    fixTo: FigureElementPrimitive | FigureElementCollection | Point,
  };

  // These properties are just saved in the form and not used by this class
  // They are used by external classes using this form
  description: string | null;
  modifiers: Object;
  onTransition: null | string | (() => void);
  onShow: null | string | (() => void);
  // subForm: string;
  // animation: {
  duration: ?number;
  translation: TypeElementTranslationOptions;
  positionsSet: boolean;
  lazyLayout: boolean;
  // };

  fromForm: {
    [formName: string]: {
      onTransition?: string | (() => void),
      onShow?: string | (() => void),
      // animation?: {
      duration?: number,
      translation?: TypeElementTranslationOptions,
      // },
      elementMods: {
        [elementName: string]: {
          element: FigureElementPrimitive | FigureElementCollection;
          mods: Object;
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
    this.lazyLayout = false;
    // this.subForm = '';
  }

  getNamedElements() {
    const namedElements = {};
    this.collectionMethods.getAllElements().forEach((element) => {
      namedElements[element.name] = element;
    });
    return namedElements;
  }

  setPositions() {
    if (!this.positionsSet) {
      this.arrange(
        this.arranged.scale, this.arranged.xAlign, this.arranged.yAlign, this.arranged.fixTo,
      );
    }
    super.setPositions();
  }

  _dup(
    elements: TypeElements = this.elements,
    collectionMethods: TypeCollectionMethods = this.collectionMethods,
  ) {
    const equationCopy = new EquationForm(elements, collectionMethods);
    const namedElements = {};
    collectionMethods.getAllElements().forEach((element) => {
      namedElements[element.name] = element;
    });
    const newContent = [];
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
    const elementsInCollection = this.collectionMethods.getAllElements();
    const elementsCurrentlyShowing = elementsInCollection.filter(e => e.isShown);
    this.collectionMethods.hideAll();
    this.collectionMethods.show();

    this.positionsSet = true;
    super.calcSize(new Point(0, 0), scale);
    this.setPositions();

    let fixPoint = new Point(0, 0);
    if (fixTo instanceof FigureElementPrimitive
        || fixTo instanceof FigureElementCollection) {
      const t = fixTo.transform.t();
      if (t != null) {
        fixPoint = t._dup();
      }
    } else {
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
      this.setPositions();
    }

    this.collectionMethods.showOnly(elementsCurrentlyShowing);
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
    callback: (?string | ((boolean) => void)) = null,
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
      e.animations.addTo('_EquationColor')
        .opacity({
          dissolve, onFinish, duration: time, delay, completeOnCancel: true,
        })
        .start();
    });
  }

  getElementsToShowAndHide() {
    const allElements = this.collectionMethods.getAllElements();
    const elementsShown = allElements.filter(e => e.isShown);
    const elementsShownTarget = this.getAllElements(false);
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
    callback: ?(?mixed) => void = null,
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
    callback: ?(?mixed) => void = null,
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
    callback: ?(boolean) => void = null,
  ) {
    this.collectionMethods.stop();
    const allElements = this.collectionMethods.getAllElements();
    const elementsShown = allElements.filter(e => e.isShown);
    const elementsToShow = this.getAllElements(false);
    const elementsToDelayShowing = elementsToShow.filter(e => !e.isShown);
    const elementsToShowAfterDissolve = elementsToShow.filter(e => e.isShown);
    let cumTime = delay;

    if (elementsToShow.length === 0 && elementsShown.length === 0) {
      if (callback != null) {
        callback(false);
        return;
      }
    }

    let dissolveOutCallback = () => {
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
      e.animations.addTo('_EquationColor')
        .dissolveIn({
          duration: showTime, onFinish, delay: cumTime + blankTime,
        })
        .start();
    });
    elementsToShowAfterDissolve.forEach((e) => {
      e.animations.addTo('_EquationColor')
        .dissolveIn({
          duration: showTime, onFinish, delay: blankTime,
        })
        .start();
    });
  }

  applyElementMods(fromWhere: null | string = null) {
    const setProps = (elementMods) => {
      Object.keys(elementMods).forEach((elementName) => {
        const { element, mods } = elementMods[elementName];
        if (element != null && mods != null) {
          element.setProperties(mods);
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
    callback: ?(string | ((?mixed) => void)) = null,
    fromWhere: ?string = null,
    dissolveInBeforeMove: boolean = false,
  ) {
    const allElements = this.collectionMethods.getAllElements();
    this.collectionMethods.stop();
    const elementsShownTarget = this.getAllElements(false);
    elementsShownTarget.forEach((e) => {
      if (e.opacity === 0.001) {
        e.hide();
        e.setOpacity(1);
      } else {
        e.setOpacity(1);
      }
    });

    const elementsShown = allElements.filter(e => e.isShown);
    const elementsToHide =
      elementsShown.filter(e => elementsShownTarget.indexOf(e) === -1);
    const elementsToShow =
      elementsShownTarget.filter(e => elementsShown.indexOf(e) === -1);

    const currentTransforms = this.collectionMethods.getElementTransforms();
    this.setPositions();
    const animateToTransforms = this.collectionMethods.getElementTransforms();

    const elementsToMove = [];
    const toMoveStartTransforms = [];
    const toMoveStopTransforms = [];
    Object.keys(animateToTransforms).forEach((key) => {
      const currentT = currentTransforms[key];
      const nextT = animateToTransforms[key];
      if (!currentT.isEqualTo(nextT)) {
        elementsToMove.push(key);
        toMoveStartTransforms.push(currentT);
        toMoveStopTransforms.push(nextT);
      }
    });

    const toShowTransforms = {};
    elementsToShow.forEach((element) => {
      toShowTransforms[element.name] = element.transform._dup();
    });

    // Find move time to use. If moveTime is null, then a velocity is used.
    let moveTimeToUse;
    if (moveTime === null) {
      moveTimeToUse = getMoveTime(
        toMoveStartTransforms, toMoveStopTransforms, 0,
        new Point(0.35, 0.35),      // 0.25 figure space per s
        2 * Math.PI / 6,            // 60º per second
        new Point(0.4, 0.4),            // 100% per second
      );
    } else {
      moveTimeToUse = moveTime;
    }
    this.collectionMethods.setElementTransforms(currentTransforms);
    this.collectionMethods.setElementTransforms(toShowTransforms);
    let cumTime = delay;

    let moveCallback = null;
    let dissolveInCallback = null;
    let dissolveOutCallback = null;

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

    if (elementsToHide.length > 0) {
      this.dissolveElements(elementsToHide, 'out', delay, dissolveOutTime, dissolveOutCallback);
      cumTime += dissolveOutTime;
    } else if (dissolveOutCallback != null) {
      this.fnMap.exec(dissolveOutCallback);
    }

    this.applyElementMods(fromWhere);

    let translationToUse = {};

    if (
      typeof fromWhere === 'string'
      && fromWhere.length !== 0
      && this.fromForm != null
      && this.fromForm[fromWhere] != null
      // && this.fromForm[fromWhere].animation != null
      && this.fromForm[fromWhere].translation !== undefined
    ) {
      translationToUse = joinObjects(
        {},
        this.translation,
        this.fromForm[fromWhere].translation,
      );
    } else {
      translationToUse = joinObjects({}, this.translation);
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
        this.dissolveElements(elementsToShow, 'in', cumTime, dissolveInTime, dissolveInCallback);
        cumTime += dissolveInTime + 0.001;
      }
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
        this.dissolveElements(elementsToShow, 'in', cumTime, dissolveInTime, dissolveInCallback);
        cumTime += dissolveInTime + 0.001;
      }
    }
    return cumTime;
  }
}
