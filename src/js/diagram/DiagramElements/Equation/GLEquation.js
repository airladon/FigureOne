// @flow

// Deprecate

import {
  Point, Rect, Transform,
} from '../../../tools/g2';
// import { roundNum } from '../../../tools/math';
import { duplicateFromTo } from '../../../tools/tools';
import { RGBToArray } from '../../../tools/color';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../Element';
import {
  DiagramText, DiagramFont, TextObject,
} from '../../DrawingObjects/TextObject/TextObject';
import DrawContext2D from '../../DrawContext2D';
import * as html from '../../../tools/htmlGenerator';
// import { TextObject } from './DrawingObjects/TextObject/TextObject';
import HTMLObject from '../../DrawingObjects/HTMLObject/HTMLObject';
import { BlankElement, Element, Elements } from './Elements/Element';
import Fraction from './Elements/Fraction';
import Strike from './Elements/Strike';
import SuperSub from './Elements/SuperSub';
import { Brackets, Bar } from './Elements/Brackets';
import { Annotation, AnnotationInformation } from './Elements/Annotation';
// // Equation is a class that takes a set of drawing objects (TextObjects,
// // DiagramElementPrimatives or DiagramElementCollections and HTML Objects
// // and arranges their size in a )
import EquationForm from './EquationForm';
import type {
  TypeHAlign, TypeVAlign,
} from './EquationForm';

export function getDiagramElement(
  collection: DiagramElementCollection,
  name: string | DiagramElementPrimative | DiagramElementCollection,
): DiagramElementPrimative | DiagramElementCollection | null {
  if (typeof name === 'string') {
    if (collection && `_${name}` in collection) {
    // $FlowFixMe
      return collection[`_${name}`];
    }
    return null;
  }
  return name;
}

type TypeEquationInput = Array<Elements | Element | string> | Elements | Element | string;

export function createEquationElements(
  elems: Object,
  drawContext2D: DrawContext2D,
  colorOrFont: Array<number> | DiagramFont = [],
  diagramLimits: Rect = new Rect(-1, -1, 2, 2),
  firstTransform: Transform = new Transform(),
  existingCollection: DiagramElementCollection | null = null,
) {
  let color = [1, 1, 1, 1];
  if (Array.isArray(colorOrFont)) {
    color = colorOrFont.slice();
  }
  let font = new DiagramFont(
    'Times New Roman',
    'normal',
    0.2,
    '200',
    'left',
    'alphabetic',
    color,
  );
  let fontItalic = new DiagramFont(
    'Times New Roman',
    'italic',
    0.2,
    '200',
    'left',
    'alphabetic',
    color,
  );
  if (colorOrFont instanceof DiagramFont) {
    font = colorOrFont._dup();
    font.style = 'normal';
    fontItalic = colorOrFont._dup();
    fontItalic.style = 'italic';
    if (font.color != null) {
      color = RGBToArray(font.color);
    }
  }

  let collection;
  if (existingCollection != null) {
    collection = existingCollection;
  } else {
    collection = new DiagramElementCollection(
      new Transform('Equation Elements Collection').scale(1, 1).rotate(0).translate(0, 0),
      diagramLimits,
    );
  }

  const makeElem = (text: string, fontOrStyle: DiagramFont | string | null) => {
    let fontToUse: DiagramFont = font;
    if (fontOrStyle instanceof DiagramFont) {
      fontToUse = fontOrStyle;
    } else if (fontOrStyle === 'italic') {
      fontToUse = fontItalic;
    } else if (fontOrStyle === 'normal') {
      fontToUse = font;
    } else if (text.match(/[A-Z,a-z]/)) {
      fontToUse = fontItalic;
    }
    const dT = new DiagramText(new Point(0, 0), text, fontToUse);
    const to = new TextObject(drawContext2D, [dT]);
    const p = new DiagramElementPrimative(
      to,
      new Transform('Equation Element').scale(1, 1).translate(0, 0),
      color,
      diagramLimits,
    );
    return p;
  };
  Object.keys(elems).forEach((key) => {
    if (typeof elems[key] === 'string') {
      if (!key.startsWith('space')) {
        collection.add(key, makeElem(elems[key], null));
      }
    } else if (elems[key] instanceof DiagramElementPrimative) {
      collection.add(key, elems[key]);
    } else if (elems[key] instanceof DiagramElementCollection) {
      collection.add(key, elems[key]);
    } else if (Array.isArray(elems[key])) {
      const [text, col, isTouchable, onClick, direction, mag, fontOrStyle] = elems[key];
      const elem = makeElem(text, fontOrStyle);
      if (col) {
        elem.setColor(col);
      }
      if (isTouchable) {
        elem.isTouchable = isTouchable;
      }
      if (onClick) {
        elem.onClick = onClick;
      }
      if (direction) {
        elem.animate.transform.translation.style = 'curved';
        elem.animate.transform.translation.options.direction = direction;
      }

      if (mag) {
        elem.animate.transform.translation.style = 'curved';
        elem.animate.transform.translation.options.magnitude = mag;
      }
      collection.add(key, elem);
    } else {
      const {
        text, isTouchable,
        onClick, direction, mag, fontOrStyle, drawPriority,
      } = elems[key];
      let col;
      if (elems[key].color) {
        col = elems[key].color;
      }
      const elem = makeElem(text, fontOrStyle);
      if (col != null) {
        elem.setColor(col);
      }
      if (isTouchable != null) {
        elem.isTouchable = isTouchable;
      }
      if (onClick) {
        elem.onClick = onClick;
      }
      if (direction != null) {
        elem.animate.transform.translation.style = 'curved';
        elem.animate.transform.translation.options.direction = direction;
      }

      if (drawPriority != null) {
        elem.drawPriority = drawPriority;
      }

      if (mag != null) {
        elem.animate.transform.translation.style = 'curved';
        elem.animate.transform.translation.options.magnitude = mag;
      }
      collection.add(key, elem);
    }
  });

  collection.setFirstTransform(firstTransform);
  return collection;
}


export function contentToElement(
  collection: DiagramElementCollection,
  content: TypeEquationInput,
): Elements {
  // If input is alread an Elements object, then return it
  if (content instanceof Elements) {
    // const namedElements = {};
    // collection.getAllElements().forEach((element) => {
    //   namedElements[element.name] = element;
    // });
    return content._dup();
  }

  // If it is not an Elements object, then create an Element(s) array
  // and create a new Elements Object
  const elementArray: Array<Elements | Element | null> = [];

  // If the content is a string, then find the corresponding
  // DiagramElement associated with the string
  if (typeof content === 'string') {
    if (content.startsWith('space')) {
      const spaceNum = parseFloat(content.replace(/space[_]*/, '')) || 0.03;
      elementArray.push(new Element(new BlankElement(spaceNum)));
    } else {
      const diagramElement = getDiagramElement(collection, content);
      if (diagramElement) {
        elementArray.push(new Element(diagramElement));
      }
    }
  // Otherwise, if the input content is an array, then process each element
  // and add it to the ElementArray
  } else if (Array.isArray(content)) {
    content.forEach((c) => {
      if (typeof c === 'string') {
        if (c.startsWith('space')) {
          const spaceNum = parseFloat(c.replace(/space[_]*/, '')) || 0.03;
          elementArray.push(new Element(new BlankElement(spaceNum)));
        } else {
          const diagramElement = getDiagramElement(collection, c);
          if (diagramElement) {
            elementArray.push(new Element(diagramElement));
          }
        }
      } else if (c !== null) {
        elementArray.push(c);
      }
    });
  // Otherwise, if the input is an Element or Elements object, so just add
  // it to the ElementsArray
  } else if (content !== null) {
    elementArray.push(content);
  }
  return new Elements(elementArray);
}

// export type TypeHAlign = 'left' | 'right' | 'center';
// export type TypeVAlign = 'top' | 'bottom' | 'middle' | 'baseline';
// export type TypeEquationForm = {
//   collection: DiagramElementCollection;
//   createEq: (Array<Elements | Element | string>) => void;
//   arrange: (
//     number, TypeHAlign | null, TypeVAlign | null,
//     DiagramElementPrimative | DiagramElementCollection | Point
//   ) => void;
//   dissolveElements: (
//     Array<DiagramElementPrimative | DiagramElementCollection>,
//     boolean, number, number, ?(?boolean)) => void;
//   getElementsToShowAndHide: () => void;
//   showHide: (number, number, ?(?mixed)) => void;
//   hideShow: (number, number, ?(?mixed)) => void;
//   // animateTo: (
//   //   number, number,
//   //   DiagramElementPrimative | DiagramElementCollection | Point,
//   //   ?(?mixed) => void,
//   //   'left' | 'center' | 'right', 'top' | 'bottom' | 'middle' | 'baseline',
//   // ) => void;
//   animatePositionsTo: (number, ?(?mixed) => void) => void;
//   description: string | null;
//   modifiers: Object;
//   type: string;
//   elementMods: Object;
//   time: number | null;
// } & Elements;

// export class EquationForm extends Elements {
//   collection: DiagramElementCollection;
//   name: string;
//   type: string;
//   description: string | null;
//   modifiers: Object;
//   elementMods: Object;
//   time: number | null;

//   constructor(collection: DiagramElementCollection) {
//     super([]);
//     this.collection = collection;
//     this.description = null;
//     this.modifiers = {};
//     this.elementMods = {};
//     this.time = null;
//   }

//   getNamedElements() {
//     const namedElements = {};
//     this.collection.getAllElements().forEach((element) => {
//       namedElements[element.name] = element;
//     });
//     return namedElements;
//   }

//   _dup(collection: DiagramElementCollection = this.collection) {
//     const equationCopy = new EquationForm(collection);
//     const namedElements = {};
//     collection.getAllElements().forEach((element) => {
//       namedElements[element.name] = element;
//     });
//     const newContent = [];
//     this.content.forEach((contentElement) => {
//       newContent.push(contentElement._dup(namedElements));
//     });
//     equationCopy.content = newContent;

//     duplicateFromTo(this, equationCopy, ['content', 'collection', 'form']);
//     return equationCopy;
//   }

//   createEq(content: Array<Elements | Element | string>) {
//     const elements = [];
//     content.forEach((c) => {
//       if (typeof c === 'string') {
//         if (c.startsWith('space')) {
//           const spaceNum = parseFloat(c.replace(/space[_]*/, '')) || 0.03;
//           elements.push(new Element(new BlankElement(spaceNum)));
//         } else {
//           const diagramElement = getDiagramElement(this.collection, c);
//           if (diagramElement) {
//             elements.push(new Element(diagramElement));
//           }
//         }
//       } else {
//         elements.push(c._dup());
//       }
//       this.content = elements;
//     });
//   }

//   // An Equation collection is a flat collection of DiagramElements.
//   //
//   // The form determines how elements are positioned relative to each other.
//   //
//   // A form of an equation takes the form's elements (a subset of the
//   // collection) and applies a translation and scale transformation. This
//   // aligns all the elements of a form relative to each other to render
//   // the desired form.
//   //
//   // Arranging a form of an equation goes through each element in the form
//   // and positions and scales it in the equation's vertex space.
//   // It also saves the locaiton and scale information in the form's element
//   // property.
//   //
//   // The elements are positioned relative to 0,0 in vertex space based on the
//   // fixTo, alignH and alignV parameters.
//   //
//   // fixTo can only be a point in the equation's vertex space, or a
//   // DiagramElement in the equation.
//   //
//   // If fixTo is an element in the equation:
//   //    - the fixTo element is positioned at 0, 0, and all other elements
//   //      repositioned relative to that.
//   //    - The equation collection setPosition (or translation transform) can
//   //      then be used to position the equation in the diagram (or relative
//   //      collection space)
//   //    - if alignH is:
//   //        - 'middle': the fixTo element is centered in x around (0, 0)
//   //        - 'right': the fixTo element right most point is at x = 0
//   //        - 'left': default - the fixTo element x position at 0
//   //    - if alignV is:
//   //        - 'center': the fixTo element is centered in y around (0, 0)
//   //        - 'bottom': the fixTo element bottom most point is at y = 0
//   //        - 'top': the fixTo element top most point is at y = 0
//   //        - 'baseline': default - the fixTo element y position at 0
//   //
//   // If fixTo is a Point, the equation is positioned at that point in the
//   // equation's vertex space.
//   //  - alignH:
//   //    - 'left': The equation's left most element's left most point is at
//   //              Point.x
//   //    - 'right': The equation's right most element's right most point is at
//   //              Point.x
//   //    - 'center': The equation is centered horizontally around Point.x
//   //  - alignV:
//   //    - 'baseline': The equation's baseline is at Point.y
//   //    - 'top': The equation's top most element's top most point is at Point.y
//   //    - 'bottom': The equation's top most element's top most point is at
//   //                Point.y
//   //    - 'middle': The equation is centered vertically around Point.y
//   //
//   arrange(
//     scale: number = 1,
//     alignH: TypeHAlign | null = 'left',
//     alignV: TypeVAlign | null = 'baseline',
//     fixTo: DiagramElementPrimative | DiagramElementCollection | Point = new Point(0, 0),
//   ) {
//     const elementsInCollection = this.collection.getAllElements();
//     const elementsCurrentlyShowing = elementsInCollection.filter(e => e.isShown);
//     this.collection.hideAll();
//     this.collection.show();
//     super.calcSize(new Point(0, 0), scale);

//     let fixPoint = new Point(0, 0);
//     if (fixTo instanceof DiagramElementPrimative
//         || fixTo instanceof DiagramElementCollection) {
//       const t = fixTo.transform.t();
//       if (t != null) {
//         fixPoint = t._dup();
//       }
//     } else {
//       fixPoint = new Point(-fixTo.x, -fixTo.y);
//     }

//     let w = this.width;
//     let h = this.height;
//     let a = this.ascent;
//     let d = this.descent;
//     let p = this.location._dup();

//     if (fixTo instanceof DiagramElementPrimative
//         || fixTo instanceof DiagramElementCollection) {
//       const t = fixTo.transform.t();
//       const s = fixTo.transform.s();
//       if (t != null && s != null) {
//         const rect = fixTo.getVertexSpaceBoundingRect();
//         w = rect.width * s.x;
//         h = rect.height * s.y;
//         a = rect.top * s.y - t.y;
//         d = t.y - rect.bottom * s.y;
//         p = t._dup();
//       }
//     }

//     if (alignH === 'right') {
//       fixPoint.x += w;
//     } else if (alignH === 'center') {
//       fixPoint.x += w / 2;
//     }
//     if (alignV === 'top') {
//       fixPoint.y += p.y + a;
//     } else if (alignV === 'bottom') {
//       fixPoint.y += p.y - d;
//     } else if (alignV === 'middle') {
//       fixPoint.y += p.y - d + h / 2;
//     }

//     const delta = new Point(0, 0).sub(fixPoint);
//     if (delta.x !== 0 || delta.y !== 0) {
//       this.offsetLocation(delta);
//       this.setPositions();
//     }

//     this.collection.showOnly(elementsCurrentlyShowing);
//   }

//   // eslint-disable-next-line class-methods-use-this
//   dissolveElements(
//     elements: Array<DiagramElementPrimative | DiagramElementCollection>,
//     disolve: 'in' | 'out' = 'in',
//     delay: number = 0.01,
//     time: number = 1,
//     callback: ?(boolean) => void = null,
//   ) {
//     if (elements.length === 0) {
//       if (callback) {
//         callback(false);
//         return;
//       }
//     }
//     const count = elements.length;
//     let completed = 0;
//     const end = (cancelled: boolean) => {
//       completed += 1;
//       if (completed === count) {
//         if (callback) {
//           callback(cancelled);
//         }
//       }
//     };
//     elements.forEach((e) => {
//       e.disolveWithDelay(delay, time, disolve, end);
//     });
//   }

//   getElementsToShowAndHide() {
//     const allElements = this.collection.getAllElements();
//     const elementsShown = allElements.filter(e => e.isShown);
//     const elementsShownTarget = this.getAllElements();
//     const elementsToHide =
//       elementsShown.filter(e => elementsShownTarget.indexOf(e) === -1);
//     const elementsToShow =
//       elementsShownTarget.filter(e => elementsShown.indexOf(e) === -1);
//     return {
//       show: elementsToShow,
//       hide: elementsToHide,
//     };
//   }

//   render() {
//     this.hideShow();
//     this.setPositions();
//   }

//   showHide(
//     showTime: number = 0,
//     hideTime: number = 0,
//     callback: ?(?mixed) => void = null,
//   ) {
//     this.collection.stop();
//     this.collection.show();
//     const { show, hide } = this.getElementsToShowAndHide();
//     if (showTime === 0) {
//       show.forEach((e) => {
//         e.showAll();
//       });
//     } else {
//       this.dissolveElements(show, 'in', 0.01, showTime, null);
//     }

//     if (hideTime === 0) {
//       hide.forEach(e => e.hide());
//     } else {
//       this.dissolveElements(hide, 'out', showTime, hideTime, callback);
//     }
//   }

//   hideShow(
//     showTime: number = 0,
//     hideTime: number = 0,
//     callback: ?(?mixed) => void = null,
//   ) {
//     this.collection.stop();
//     this.collection.show();
//     const { show, hide } = this.getElementsToShowAndHide();
//     if (hideTime === 0) {
//       hide.forEach(e => e.hide());
//     } else {
//       this.dissolveElements(hide, 'out', 0.01, hideTime, null);
//     }
//     if (showTime === 0) {
//       show.forEach((e) => {
//         e.showAll();
//       });
//       if (callback != null) {
//         callback();
//       }
//     } else {
//       this.dissolveElements(show, 'in', hideTime, showTime, callback);
//     }
//   }

//   allHideShow(
//     delay: number = 0,
//     hideTime: number = 0.5,
//     blankTime: number = 0.5,
//     showTime: number = 0.5,
//     callback: ?(boolean) => void = null,
//   ) {
//     this.collection.stop();
//     const allElements = this.collection.getAllElements();
//     const elementsShown = allElements.filter(e => e.isShown);
//     const elementsToShow = this.getAllElements();
//     const elementsToDelayShowing = elementsToShow.filter(e => !e.isShown);
//     const elementsToShowAfterDisolve = elementsToShow.filter(e => e.isShown);
//     let cumTime = delay;

//     if (elementsToShow.length === 0 && elementsShown.length === 0) {
//       if (callback != null) {
//         callback(false);
//         return;
//       }
//     }
//     // disolve out
//     // set positions
//     // disolve in

//     let disolveOutCallback = () => {
//       this.setPositions();
//     };
//     if (elementsToShow.length === 0) {
//       disolveOutCallback = (cancelled: boolean) => {
//         this.setPositions();
//         if (callback != null) {
//           callback(cancelled);
//         }
//       };
//     }

//     if (elementsShown.length > 0) {
//       this.dissolveElements(
//         elementsShown, 'out', delay, hideTime, disolveOutCallback,
//       );
//       cumTime += hideTime;
//     } else {
//       this.setPositions();
//     }

//     const count = elementsToShow.length;
//     let completed = 0;
//     const end = (cancelled: boolean) => {
//       completed += 1;
//       if (completed === count - 1) {
//         if (callback) {
//           callback(cancelled);
//         }
//       }
//     };
//     elementsToDelayShowing.forEach((e) => {
//       e.disolveWithDelay(cumTime + blankTime, showTime, 'in', end);
//     });
//     elementsToShowAfterDisolve.forEach((e) => {
//       e.disolveWithDelay(blankTime, showTime, 'in', end);
//     });
//   }

//   animatePositionsTo(
//     delay: number,
//     disolveOutTime: number,
//     moveTime: number | null,
//     disolveInTime: number,
//     callback: ?(?mixed) => void = null,
//   ) {
//     const allElements = this.collection.getAllElements();
//     this.collection.stop();
//     const elementsShown = allElements.filter(e => e.isShown);
//     const elementsShownTarget = this.getAllElements();
//     const elementsToHide =
//       elementsShown.filter(e => elementsShownTarget.indexOf(e) === -1);
//     const elementsToShow =
//       elementsShownTarget.filter(e => elementsShown.indexOf(e) === -1);

//     const currentTransforms = this.collection.getElementTransforms();
//     this.setPositions();
//     const animateToTransforms = this.collection.getElementTransforms();

//     const elementsToMove = [];
//     const toMoveStartTransforms = [];
//     const toMoveStopTransforms = [];
//     Object.keys(animateToTransforms).forEach((key) => {
//       const currentT = currentTransforms[key];
//       const nextT = animateToTransforms[key];
//       if (!currentT.isEqualTo(nextT)) {
//         elementsToMove.push(key);
//         toMoveStartTransforms.push(currentT);
//         toMoveStopTransforms.push(nextT);
//       }
//     });

//     // Find move time to use. If moveTime is null, then a velocity is used.
//     let moveTimeToUse;
//     if (moveTime === null) {
//       moveTimeToUse = getMoveTime(
//         toMoveStartTransforms, toMoveStopTransforms, 0,
//         new Point(0.35, 0.35),      // 0.25 diagram space per s
//         2 * Math.PI / 6,            // 60º per second
//         new Point(0.4, 0.4),            // 100% per second
//       );
//     } else {
//       moveTimeToUse = moveTime;
//     }
//     this.collection.setElementTransforms(currentTransforms);
//     let cumTime = delay;

//     let moveCallback = null;
//     let disolveInCallback = null;
//     let disolveOutCallback = null;

//     if (elementsToMove.length === 0 && elementsToShow.length === 0) {
//       disolveOutCallback = callback;
//     } else if (elementsToShow.length === 0) {
//       moveCallback = callback;
//     } else {
//       disolveInCallback = callback;
//     }

//     if (elementsToHide.length > 0) {
//       this.dissolveElements(elementsToHide, 'out', delay, disolveOutTime, disolveOutCallback);
//       cumTime += disolveOutTime;
//     }

//     Object.keys(this.elementMods).forEach((elementName) => {
//       const mods = this.elementMods[elementName];
//       const {
//         element, color, style, direction, mag,
//       } = mods;
//       if (element != null) {
//         if (color != null) {
//           element.animateColorToWithDelay(color, cumTime, moveTimeToUse);
//         }
//         if (style != null) {
//           element.animate.transform.translation.style = style;
//         }
//         if (direction != null) {
//           element.animate.transform.translation.options.direction = direction;
//         }
//         if (mag != null) {
//           element.animate.transform.translation.options.magnitude = mag;
//         }
//       }
//     });
//     const t = this.collection.animateToTransforms(
//       animateToTransforms,
//       moveTimeToUse,
//       cumTime,
//       0,
//       moveCallback,
//     );
//     if (t > 0) {
//       cumTime = t;
//     }

//     if (elementsToShow.length > 0) {
//       this.dissolveElements(elementsToShow, 'in', cumTime, disolveInTime, disolveInCallback);
//       cumTime += disolveInTime + 0.001;
//     }
//     return cumTime;
//   }
// }


export type TypeEquation = {
  +collection: DiagramElementCollection;
  diagramLimits: Rect;
  firstTransform: Transform;
  _dup: () => TypeEquation;
  form: Object;
  unitsForm: Object;
  currentForm: ?EquationForm;
  // currentFormName: string;
  formAlignment: {
    vAlign: TypeVAlign;
    hAlign: TypeHAlign;
    fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
    scale: number;
  };
  addForm: (string, Array<Elements | Element | string>) => void;
  scaleForm: (string, number) => void;
  setElem: (DiagramElementCollection | DiagramElementPrimative | string,
            Array<number> | null,
            boolean,
            'up' | 'down' | 'left' | 'right' | '',
            number) => void;
  frac: (
      TypeEquationInput,
      TypeEquationInput,
      string | DiagramElementPrimative | DiagramElementCollection,
    ) => Fraction;
  sfrac: (
      TypeEquationInput,
      TypeEquationInput,
      string | DiagramElementPrimative | DiagramElementCollection, number,
    ) => Fraction;
  setCurrentForm: (EquationForm | string) => void;
  render: () => void;
  setPosition: (Point) => void;
  stop: () => void;
  scale: (number) => void;
  isAnimating: boolean;

  +showForm: (EquationForm | string, ?string) => {};
};

export type TypeEquationOptions = {
  defaultFormAlignment?: {
    fixTo?: Point,
    hAlign?: TypeHAlign,
    vAlign?: TypeVAlign,
  };
};

// class EquationFunctions {
//   // eslint-disable-next-line no-use-before-define
//   collection: EquationNew;

//   // eslint-disable-next-line no-use-before-define
//   constructor(collection: EquationNew) {
//     this.collection = collection;
//   }

//   frac(options: {
//       numerator: TypeEquationInput,
//       denominator: TypeEquationInput,
//       vinculum: string | DiagramElementPrimative | DiagramElementCollection,
//     }
//     | [
//         TypeEquationInput,
//         TypeEquationInput,
//         string | DiagramElementPrimative | DiagramElementCollection
//       ]) {
//     let numerator;
//     let denominator;
//     let vinculum;
//     if (Array.isArray(options)) {
//       [numerator, denominator, vinculum] = options;
//     } else {
//       ({ numerator, denominator, vinculum } = options);
//     }
//     return new Fraction(
//       contentToElement(this.collection, numerator),
//       contentToElement(this.collection, denominator),
//       getDiagramElement(this.collection, vinculum),
//     );
//   }
// }

// // An Equation is a collection of elements that can be arranged into different
// // forms.
// // Equation allows setting of forms, and navigating through form series
// // Eqn manages different forms of the
// export class EquationNew extends DiagramElementCollection {
//   eqn: {
//     forms: { [formName: string]: {
//       base: EquationForm;                   // There is always a base form
//       [subFormName: string]: EquationForm;  // Sub forms may differ in units
//       name: string;                         // Name of form
//     } };
//     currentForm: string;
//     currentSubForm: string;
//     getCurrentForm: () => ?EquationForm;
//     subFormPriority: Array<string>,
//     //
//     formSeries: { [seriesName: String]: Array<EquationForm> };
//     currentFormSeries: string;
//     getCurrentFormSeries: () => ?Array<EquationForm>;
//     //
//     defaultFormAlignment: {
//       fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
//       hAlign: TypeHAlign;
//       vAlign: TypeVAlign;
//       scale: number,
//     };
//     //
//     showForm: (EquationForm | string, ?string) => {};
//     //
//   };

//   // isTouchDevice: boolean;
//   // animateNextFrame: void => void;
//   shapes: Object;

//   constructor(
//     shapes: Object,
//     // equations: Object,
//     // equation: Object,
//     // isTouchDevice: boolean,
//     // animateNextFrame: void => void,
//     options: TypeEquationOptions = {},
//   ) {
//     const defaultOptions = {
//       color: [0.5, 0.5, 0.5, 1],
//       position: new Point(0, 0),
//       defaultFormAlignment: {
//         fixTo: new Point(0, 0),
//         hAlign: 'left',
//         vAlign: 'baseline',
//         scale: 0.7,
//       },
//     };
//     const optionsToUse = joinObjects({}, defaultOptions, options);
//     super(new Transform('Equation')
//       .scale(1, 1)
//       .rotate(0)
//       .translate(0, 0), shapes.limits);
//     this.shapes = shapes;
//     this.color = optionsToUse.color;
//     this.setPosition(optionsToUse.position);
//     // this.isTouchDevice = isTouchDevice;
//     // this.animateNextFrame = animateNextFrame;

//     // Set default values
//     this.eqn = {
//       forms: {},
//       currentForm: '',
//       currentSubForm: '',
//       subFormPriority: ['base'],
//       formSeries: {},
//       currentFormSeries: '',
//       defaultFormAlignment: optionsToUse.defaultFormAlignment,
//       functions: new EquationFunctions(this),
//     };

//     if (optionsToUse.elements != null) {
//       this.addElements(optionsToUse.elements, this.color);
//     }
//   }

//   addElements(
//     elems: Object,
//     colorOrFont: Array<number> | DiagramFont = [],
//     // descriptionElement: DiagramElementPrimative | null = null,
//     // descriptionPosition: Point = new Point(0, 0),
//   ) {
//     this.addEquationElements(elems, colorOrFont);
//     // this.addDescriptionElement(descriptionElement, descriptionPosition);
//   }

//   addEquationElements(
//     elems: Object,
//     colorOrFont: Array<number> | DiagramFont = [],
//   ) {
//     let color = [1, 1, 1, 1];
//     if (Array.isArray(colorOrFont)) {
//       color = colorOrFont.slice();
//     }
//     let font = new DiagramFont(
//       'Times New Roman',
//       'normal',
//       0.2, '200', 'left', 'alphabetic', color,
//     );
//     let fontItalic = new DiagramFont(
//       'Times New Roman',
//       'italic',
//       0.2, '200', 'left', 'alphabetic', color,
//     );
//     if (colorOrFont instanceof DiagramFont) {
//       font = colorOrFont._dup();
//       font.style = 'normal';
//       fontItalic = colorOrFont._dup();
//       fontItalic.style = 'italic';
//       if (font.color != null) {
//         color = RGBToArray(font.color);
//       }
//     }

//     const makeElem = (text: string, fontOrStyle: DiagramFont | string | null) => {
//       let fontToUse: DiagramFont = font;
//       if (fontOrStyle instanceof DiagramFont) {
//         fontToUse = fontOrStyle;
//       } else if (fontOrStyle === 'italic') {
//         fontToUse = fontItalic;
//       } else if (fontOrStyle === 'normal') {
//         fontToUse = font;
//       } else if (text.match(/[A-Z,a-z]/)) {
//         fontToUse = fontItalic;
//       }
//       const p = this.shapes.txt(
//         text,
//         { location: new Point(0, 0), font: fontToUse },
//       );
//       return p;
//     };

//     Object.keys(elems).forEach((key) => {
//       if (typeof elems[key] === 'string') {
//         if (!key.startsWith('space')) {
//           this.add(key, makeElem(elems[key], null));
//         }
//       } else if (elems[key] instanceof DiagramElementPrimative) {
//         this.add(key, elems[key]);
//       } else if (elems[key] instanceof DiagramElementCollection) {
//         this.add(key, elems[key]);
//       } else {
//         const {
//           text, fontOrStyle, col, elementOptions,
//         } = elems[key];
//         const elem = makeElem(text, fontOrStyle);
//         if (elementOptions != null) {
//           elem.setProperties(elementOptions);
//         }
//         if (col != null) {
//           elem.setColor(col);
//         }
//         this.add(key, elem);
//       }
//     });

//     this.setFirstTransform(this.transform);
//   }


//   addForm(
//     name: string,
//     content: Array<Elements | Element | string>,
//     options: {
//       subForm?: string,
//       addToSeries?: string,
//       elementMods?: Object,
//       time?: number | null | { fromPrev?: number, fromNext?: number },
//       description?: string,
//       modifiers?: Object,
//     } = {},
//   ) {
//     if (!(name in this.eqn.forms)) {
//       this.eqn.forms[name] = {};
//     }
//     const defaultOptions = {
//       subForm: 'base',
//       addToSeries: '',
//       elementMods: {},
//       animationTime: null,          // use velocities instead of time
//       description: '',
//       modifiers: {},
//     };
//     let optionsToUse = defaultOptions;
//     if (options) {
//       optionsToUse = Object.assign({}, defaultOptions, options);
//     }
//     const {
//       subForm, description, modifiers,
//       animationTime, elementMods, addToSeries,
//     } = optionsToUse;
//     const time = animationTime;
//     this.eqn.forms[name].name = name;
//     const form = this.eqn.forms[name];
//     form[subForm] = new EquationForm(this);
//     // form[subForm].name = subForm;
//     form[subForm].description = description;
//     form[subForm].modifiers = modifiers;
//     form[subForm].name = name;
//     form[subForm].subForm = subForm;
//     form[subForm].elementMods = {};
//     if (typeof time === 'number') {
//       form[name].time = {
//         fromPrev: time, fromNext: time, fromAny: time,
//       };
//     } else {
//       form[subForm].time = time;
//     }
//     Object.keys(elementMods).forEach((elementName) => {
//       const diagramElement = getDiagramElement(this, elementName);
//       if (diagramElement) {
//         let color;
//         let elementOptions;
//         if (Array.isArray(elementMods[elementName])) {
//           [color, elementOptions] = elementMods[elementName];
//         } else {
//           ({
//             color, elementOptions,
//           } = elementMods[elementName]);
//         }
//         form[subForm].elementMods[elementName] = {
//           element: diagramElement,
//           color,
//           elementOptions,
//         };
//       }
//     });
//     // const form = this.form[name][formType];
//     form[subForm].createEq(content);
//     // form[subForm].subForm = formType;
//     form[subForm].arrange(
//       this.eqn.defaultFormAlignment.scale,
//       this.eqn.defaultFormAlignment.hAlign,
//       this.eqn.defaultFormAlignment.vAlign,
//       this.eqn.defaultFormAlignment.fixTo,
//     );
//     // if (addToSeries != null && addToSeries !== '') {
//     //   if (this.eqn.formSeries[addToSeries] == null) {
//     //     this.eqn.formSeries[addToSeries] = [];
//     //   }
//     //   this.eqn.formSeries[addToSeries].push(this.eqn.forms[name]);
//     // }
//     // make the first form added also equal to the base form as always
//     // need a base form for some functions
//     if (this.eqn.forms[name].base === undefined) {
//       const baseOptions = Object.assign({}, options);
//       baseOptions.subForm = 'base';
//       this.addForm(name, content, baseOptions);
//     }

//     if (this.eqn.currentForm === '') {
//       this.eqn.currentForm = name;
//     }
//     if (this.eqn.currentSubForm === '') {
//       this.eqn.currentSubForm = 'base';
//     }
//   }

//   getCurrentForm() {
//     console.log(this.eqn.currentForm, this.eqn.currentSubForm, this.eqn.forms)
//     if (this.eqn.forms[this.eqn.currentForm] == null) {
//       return null;
//     }
//     if (this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm] == null) {
//       return null;
//     }
//     return this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm];
//   }

//   render() {
//     const form = this.getCurrentForm();
//     if (form != null) {
//       form.showHide();
//       this.show();
//       form.setPositions();
//       // this.updateDescription();
//     }
//   }

//   setCurrentForm(
//     formOrName: EquationForm | string,
//     subForm: string = 'base',
//   ) {
//     if (typeof formOrName === 'string') {
//       this.eqn.currentForm = '';
//       this.eqn.currentSubForm = '';
//       if (formOrName in this.eqn.forms) {
//         this.eqn.currentForm = formOrName;
//         if (subForm in this.eqn.forms[formOrName]) {
//           this.eqn.currentSubForm = subForm;
//         }
//       }
//     } else {
//       this.eqn.currentForm = formOrName.name;
//       this.eqn.currentSubForm = formOrName.subForm;
//     }
//   }

//   showForm(
//     formOrName: EquationForm | string,
//     subForm: ?string = null,
//   ) {
//     this.show();
//     let form = formOrName;
//     if (typeof formOrName === 'string') {
//       form = this.getForm(formOrName, subForm);
//     }
//     if (form) {
//       this.setCurrentForm(form);
//       this.render();
//     }
//   }

//   getForm(
//     formOrName: string | EquationForm,
//     subForm: ?string,
//   ): null | EquationForm {
//     if (formOrName instanceof EquationForm) {
//       return formOrName;
//     }
//     // console.log(formType, this.form[formOrName])
//     if (formOrName in this.eqn.forms) {
//       let formTypeToUse = subForm;
//       if (formTypeToUse == null) {
//         const possibleFormTypes
//           = this.eqn.subFormPriority.filter(fType => fType in this.eqn.forms[formOrName]);
//         if (possibleFormTypes.length) {
//           // eslint-disable-next-line prefer-destructuring
//           formTypeToUse = possibleFormTypes[0];
//         }
//       }
//       if (formTypeToUse != null) {
//         return this.eqn.forms[formOrName][formTypeToUse];
//       }
//     }
//     return null;
//   }
// }

// An Equation is tied to a collection of elements.
//
// The Equation class manages equation forms that
// speicify how to lay out the collection of elements.
//
// The Equation class also has a helper that can create a colleciton
// of DiagramElements for an equation
//
// EqnCollection extends DiagramElementCollection
//    eqns: { equations that manage this collection }
//    eqnName: direct access to equation with a particular name

export class Equation {
  collection: DiagramElementCollection;
  diagramLimits: Rect;
  firstTransform: Transform;
  form: Object;
  formSeries: Array<EquationForm>;
  drawContext2D: DrawContext2D;
  // currentForm: ?EquationForm;
  currentForm: string;
  currentFormType: string;
  getCurrentForm: () => ?EquationForm;
  formTypeOrder: Array<string>;
  // currentFormName: string;
  // currentFormType: string;
  formAlignment: {
    vAlign: TypeVAlign;
    hAlign: TypeHAlign;
    fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
    scale: number;
  };

  isAnimating: boolean;

  descriptionElement: DiagramElementPrimative | null;
  descriptionPosition: Point;

  +showForm: (EquationForm | string, ?string) => {};

  constructor(
    drawContext2D: DrawContext2D,
    diagramLimits: Rect = new Rect(-1, -1, 2, 2),
    firstTransform: Transform = new Transform('Equation')
      .scale(1, 1).rotate(0).translate(0, 0),
  ) {
    this.drawContext2D = drawContext2D;
    this.diagramLimits = diagramLimits;
    this.firstTransform = firstTransform;
    this.form = {};
    this.formAlignment = {
      vAlign: 'baseline',
      hAlign: 'left',
      fixTo: new Point(0, 0),
      scale: 1,
    };
    this.currentForm = '';
    this.currentFormType = '';
    this.formTypeOrder = ['base'];
    this.descriptionPosition = new Point(0, 0);
    this.isAnimating = false;
  }

  _dup() {
    const equationCopy = new Equation(
      this.drawContext2D,
      this.diagramLimits._dup(),
      this.firstTransform._dup(),
    );

    duplicateFromTo(
      this, equationCopy,
      ['collection', 'form', 'drawContext2D', 'formAlignment'],
    );

    const newCollection = this.collection._dup();

    equationCopy.collection = newCollection;
    const newForm = {};
    Object.keys(this.form).forEach((name) => {
      if (!(name in newForm)) {
        newForm[name] = {};
      }
      Object.keys(this.form[name]).forEach((formType) => {
        if (formType !== 'name') {
          newForm[name][formType] = this.form[name][formType]._dup(
            newCollection.elements,
            {
              getAllElements: newCollection.getAllElements.bind(newCollection),
              hideAll: newCollection.hideAll.bind(newCollection),
              show: newCollection.show.bind(newCollection),
              showOnly: newCollection.showOnly.bind(newCollection),
              stop: newCollection.stop.bind(newCollection),
              getElementTransforms: newCollection.getElementTransforms.bind(newCollection),
              setElementTransforms: newCollection.setElementTransforms.bind(newCollection),
              animateToTransforms: newCollection.animateToTransforms.bind(newCollection),
            },
          );
        } else {
          newForm[name][formType] = this.form[name][formType];
        }
      });
    });
    equationCopy.form = newForm;

    duplicateFromTo(this.formAlignment, equationCopy.formAlignment, ['fixTo']);
    const { fixTo } = this.formAlignment;
    if (fixTo instanceof Point) {
      equationCopy.formAlignment.fixTo = this.formAlignment.fixTo._dup();
    } else {
      Object.keys(newCollection.elements).forEach((key) => {
        if (newCollection.elements[key].name === fixTo.name) {
          equationCopy.formAlignment.fixTo = newCollection.elements[key];
        }
      });
    }
    return equationCopy;
  }

  createElements(
    elems: Object,
    colorOrFont: Array<number> | DiagramFont = [],
    descriptionElement: DiagramElementPrimative | null = null,
    descriptionPosition: Point = new Point(0, 0),
    existingCollection: DiagramElementCollection | null = null,
  ) {
    this.collection = createEquationElements(
      elems,
      this.drawContext2D,
      colorOrFont,
      this.diagramLimits,
      this.firstTransform,
      existingCollection,
    );
    this.addDescriptionElement(descriptionElement, descriptionPosition);
  }

  addDescriptionElement(
    descriptionElement: DiagramElementPrimative | null = null,
    descriptionPosition: Point = new Point(0, 0),
  ) {
    this.descriptionElement = descriptionElement;
    this.descriptionPosition = descriptionPosition;
    if (this.descriptionElement) {
      this.descriptionElement
        .setPosition(this.collection
          .getDiagramPosition()
          .add(descriptionPosition));
    }
  }

  setPosition(position: Point) {
    this.collection.setPosition(position);
    if (this.descriptionElement) {
      this.descriptionElement.setPosition(position.add(this.descriptionPosition));
    }
  }

  stop() {
    this.collection.stop();
  }

  setElem(
    element: DiagramElementCollection | DiagramElementPrimative | string,
    elementColor: Array<number> | null = null,
    isTouchable: boolean = false,
    direction: 'up' | 'down' | 'left' | 'right' | '' = '',
    mag: number = 0.5,
  ) {
    let elem = element;
    if (typeof elem === 'string') {
      elem = getDiagramElement(this.collection, element);
    }
    if (elem instanceof DiagramElementCollection
      || elem instanceof DiagramElementPrimative) {
      if (elementColor != null) {
        elem.setColor(elementColor);
      }
      elem.isTouchable = isTouchable;
      if (isTouchable) {
        this.collection.hasTouchableElements = true;
      }
      elem.animate.transform.translation.style = 'curved';
      elem.animate.transform.translation.options.direction = direction;
      elem.animate.transform.translation.options.magnitude = mag;
    }
  }

  addForm(
    name: string,
    content: Array<Elements | Element | string>,
    options: {
      formType?: string,
      addToSeries?: boolean,
      elementMods?: Object,
      time?: number | null | { fromPrev?: number, fromNext?: number },
      description?: string,
      modifiers?: Object,
    } = {},
  ) {
    if (!(name in this.form)) {
      this.form[name] = {};
    }
    const defaultOptions = {
      formType: 'base',
      addToSeries: true,
      elementMods: {},
      animationTime: null,          // use velocities instead of time
      description: '',
      modifiers: {},
    };
    let optionsToUse = defaultOptions;
    if (options) {
      optionsToUse = Object.assign({}, defaultOptions, options);
    }
    const {
      formType, description, modifiers,
      animationTime, elementMods, addToSeries,
    } = optionsToUse;
    const time = animationTime;
    this.form[name][formType] = new EquationForm(
      this.collection.elements,
      {
        getAllElements: this.collection.getAllElements.bind(this.collection),
        hideAll: this.collection.hideAll.bind(this.collection),
        show: this.collection.show.bind(this.collection),
        showOnly: this.collection.showOnly.bind(this.collection),
        stop: this.collection.stop.bind(this.collection),
        getElementTransforms: this.collection.getElementTransforms.bind(this.collection),
        setElementTransforms: this.collection.setElementTransforms.bind(this.collection),
        animateToTransforms: this.collection.animateToTransforms.bind(this.collection),
      },
    );
    this.form[name].name = name;
    this.form[name][formType].name = name;
    this.form[name][formType].description = description;
    this.form[name][formType].modifiers = modifiers;
    this.form[name][formType].type = formType;
    this.form[name][formType].elementMods = {};
    if (typeof time === 'number') {
      this.form[name][formType].time = {
        fromPrev: time, fromNext: time, fromAny: time,
      };
    } else {
      this.form[name][formType].time = time;
    }
    Object.keys(elementMods).forEach((elementName) => {
      const diagramElement = getDiagramElement(this.collection, elementName);
      if (diagramElement) {
        let color;
        let style;
        let direction;
        let mag;
        if (Array.isArray(elementMods[elementName])) {
          [color, style, direction, mag] = elementMods[elementName];
        } else {
          ({
            color, style, direction, mag,
          } = elementMods[elementName]);
        }
        this.form[name][formType].elementMods[elementName] = {
          element: diagramElement,
          color,
          style,
          direction,
          mag,
        };
      }
    });
    const form = this.form[name][formType];
    form.createEq(content);
    form.type = formType;
    form.arrange(
      this.formAlignment.scale,
      this.formAlignment.hAlign,
      this.formAlignment.vAlign,
      this.formAlignment.fixTo,
    );
    if (addToSeries) {
      if (this.formSeries == null) {
        this.formSeries = [];
      }
      this.formSeries.push(this.form[name]);
    }
    // make the first form added also equal to the base form as always
    // need a base form for some functions
    if (this.form[name].base === undefined) {
      const baseOptions = Object.assign({}, options);
      baseOptions.formType = 'base';
      this.addForm(name, content, baseOptions);
    }
  }

  getCurrentForm() {
    if (this.form[this.currentForm] == null) {
      return null;
    }
    if (this.form[this.currentForm][this.currentFormType] == null) {
      return null;
    }
    return this.form[this.currentForm][this.currentFormType];
  }

  reArrangeCurrentForm() {
    const form = this.getCurrentForm();
    if (form == null) {
      return;
    }
    form.arrange(
      this.formAlignment.scale,
      this.formAlignment.hAlign,
      this.formAlignment.vAlign,
      this.formAlignment.fixTo,
    );
  }

  scaleForm(name: string, scale: number, formType: string = 'base') {
    // console.log(name, this.form, formType, this.form[name][formType])
    if (name in this.form) {
      if (formType in this.form[name]) {
        this.form[name][formType].arrange(
          scale,
          this.formAlignment.hAlign,
          this.formAlignment.vAlign,
          this.formAlignment.fixTo,
        );
      }
    }
  }

  scale(scale: number) {
    Object.keys(this.form).forEach((name) => {
      Object.keys(this.form[name]).forEach((formType) => {
        if (formType !== 'name') {
          this.scaleForm(name, scale, formType);
        }
      });
    });
  }

  setFormSeries(series: Array<string | EquationForm>) {
    this.formSeries = [];
    series.forEach((form) => {
      if (typeof form === 'string') {
        this.formSeries.push(this.form[form]);
      } else {
        this.formSeries.push(form);
      }
    });
  }

  getFormIndex(formToGet: EquationForm | string) {
    const form = this.getForm(formToGet);
    let index = -1;
    if (form != null) {
      index = this.formSeries.indexOf(this.form[form.name]);
    }
    return index;
  }

  prevForm(time: number | null = null, delay: number = 0) {
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index -= 1;
      if (index < 0) {
        index = this.formSeries.length - 1;
      }
      this.goToForm(index, time, delay, 'fromNext');
    }
  }

  nextForm(time: number | null = null, delay: number = 0) {
    let animate = true;
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index += 1;
      if (index > this.formSeries.length - 1) {
        index = 0;
        animate = false;
      }
      this.goToForm(index, time, delay, 'fromPrev', animate);
    }
  }

  replayCurrentForm(time: number) {
    if (this.isAnimating) {
      this.collection.stop(true, true);
      this.collection.stop(true, true);
      this.isAnimating = false;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        this.showForm(currentForm);
      }
      return;
    }
    this.collection.stop();
    this.collection.stop();
    this.isAnimating = false;
    this.prevForm(0);
    this.nextForm(time, 0.5);
  }

  animateToForm(
    name: string,
    time: number | null = null,
    delay: number = 0,
    callback: null | () => void = null,
  ) {
    this.collection.stopAnimatingColor(true, true);
    this.collection.stopAnimatingColor(true, true);
    this.collection.stop();
    this.collection.stop();
    const form = this.getForm(name);
    if (form != null) {
      form.animatePositionsTo(delay, 0.4, time, 0.4, callback);
    }
    this.setCurrentForm(name);

    // if (this.isAnimating) {
    //   this.collection.stop(true, true);
    //   this.collection.stop(true, true);
    //   this.isAnimating = false;
    //   const currentForm = this.getCurrentForm();
    //   if (currentForm != null) {
    //     this.showForm(currentForm);
    //   }
    //   // return;
    // }
    // this.collection.stop();
    // this.collection.stop();
    // this.isAnimating = false;
  }

  goToForm(
    name: ?string | number = null,
    time: number | null = null,
    delay: number = 0,
    fromWhere: 'fromPrev' | 'fromNext' | 'fromAny' | null = 'fromAny',
    animate: boolean = true,
    callback: null | () => void = null,
  ) {
    if (this.isAnimating) {
      this.collection.stop(true, true);
      this.collection.stop(true, true);
      this.isAnimating = false;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        this.showForm(currentForm);
      }
      return;
    }
    this.collection.stop();
    this.collection.stop();
    this.isAnimating = false;

    // By default go to the next form in a series
    let nextIndex = 0;
    if (name == null) {
      let index = 0;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        index = this.formSeries.indexOf(this.form[currentForm.name]);
        if (index < 0) {
          index = 0;
        }
      }
      nextIndex = index + 1;
      if (nextIndex === this.formSeries.length) {
        nextIndex = 0;
      }
    } else if (typeof name === 'number') {
      nextIndex = name;
    } else {
      this.formSeries.forEach((form, index) => {
        if (form.name === name) {
          nextIndex = index;
        }
      });
    }
    let form = null;
    let formTypeToUse = null;
    const possibleFormTypes
          = this.formTypeOrder.filter(fType => fType in this.formSeries[nextIndex]);
    if (possibleFormTypes.length) {
      // eslint-disable-next-line prefer-destructuring
      formTypeToUse = possibleFormTypes[0];
    }

    if (formTypeToUse != null) {
      // $FlowFixMe
      form = this.formSeries[nextIndex][formTypeToUse];
      if (time === 0) {
        this.showForm(form);
        if (callback != null) {
          callback();
        }
      } else {
        this.isAnimating = true;
        const end = () => {
          this.isAnimating = false;
          if (callback != null) {
            callback();
          }
        };
        if (animate) {
          let timeToUse = null;
          if (form.time != null && form.time[fromWhere] != null) {
            timeToUse = form.time[fromWhere];
          }
          form.animatePositionsTo(delay, 0.4, timeToUse, 0.4, end);
        } else {
          form.allHideShow(delay, 0.5, 0.2, 0.5, end);
        }
        this.setCurrentForm(form);
      }
      this.updateDescription();
    }
  }

  changeDescription(
    formOrName: EquationForm | string,
    description: string = '',
    modifiers: Object = {},
    formType: string = 'base',
  ) {
    const form = this.getForm(formOrName, formType);
    if (form != null) {
      form.description = `${description}`;
      form.modifiers = modifiers;
    }
  }

  updateDescription(
    formOrName: EquationForm | string | null = null,
    formType: string = 'base',
  ) {
    const element = this.descriptionElement;
    if (element == null) {
      return;
    }
    if (element.isShown === false) {
      return;
    }
    let form = null;
    if (formOrName == null) {
      form = this.getCurrentForm();
    } else if (typeof formOrName === 'string') {
      form = this.getForm(formOrName, formType);
    } else {
      form = formOrName;
    }
    if (form == null) {
      return;
    }
    if (form.description == null) {
      return;
    }

    const { drawingObject } = element;
    if (drawingObject instanceof HTMLObject) {
      drawingObject.change(
        html.applyModifiers(form.description, form.modifiers),
        element.lastDrawTransform.m(),
      );
      html.setOnClicks(form.modifiers);
    }
  }

  render() {
    const form = this.getCurrentForm();
    if (form != null) {
      form.showHide();
      this.collection.show();
      form.setPositions();
      this.updateDescription();
    }
  }

  setCurrentForm(
    formOrName: EquationForm | string,
    formType: string = 'base',
  ) {
    if (typeof formOrName === 'string') {
      this.currentForm = '';
      this.currentFormType = '';
      if (formOrName in this.form) {
        this.currentForm = formOrName;
        if (formType in this.form[formOrName]) {
          this.currentFormType = formType;
        }
      }
    } else {
      this.currentForm = formOrName.name;
      this.currentFormType = formOrName.type;
    }
  }


  setUnits(units: 'deg' | 'rad') {
    if (units === 'deg') {
      this.formTypeOrder = ['deg', 'base'];
    }
    if (units === 'rad') {
      this.formTypeOrder = ['rad', 'base'];
    }
    if (this.collection.isShown) {
      this.showForm(this.currentForm);
    }
  }

  showForm(
    formOrName: EquationForm | string,
    formType: ?string = null,
  ) {
    this.collection.show();
    let form = formOrName;
    if (typeof formOrName === 'string') {
      form = this.getForm(formOrName, formType);
    }
    if (form) {
      this.setCurrentForm(form);
      this.render();
    }
  }

  getForm(
    formOrName: string | EquationForm,
    formType: ?string,
  ): null | EquationForm {
    if (formOrName instanceof EquationForm) {
      return formOrName;
    }
    // console.log(formType, this.form[formOrName])
    if (formOrName in this.form) {
      let formTypeToUse = formType;
      if (formTypeToUse == null) {
        const possibleFormTypes
          = this.formTypeOrder.filter(fType => fType in this.form[formOrName]);
        if (possibleFormTypes.length) {
          // eslint-disable-next-line prefer-destructuring
          formTypeToUse = possibleFormTypes[0];
        }
      }
      if (formTypeToUse != null) {
        return this.form[formOrName][formTypeToUse];
      }
    }
    return null;
  }

  phrase(content: TypeEquationInput) {
    return new Elements([contentToElement(this.collection, content)]);
  }

  frac(
    numerator: TypeEquationInput,
    denominator: TypeEquationInput,
    vinculum: string | DiagramElementPrimative | DiagramElementCollection,
  ) {
    return new Fraction(
      contentToElement(this.collection, numerator),
      contentToElement(this.collection, denominator),
      getDiagramElement(this.collection, vinculum),
    );
  }

  strike(
    content: TypeEquationInput,
    strike: string | DiagramElementPrimative | DiagramElementCollection,
    strikeInSize: boolean = false,
  ) {
    return new Strike(
      contentToElement(this.collection, content),
      getDiagramElement(this.collection, strike),
      strikeInSize,
    );
  }

  annotation(
    content: TypeEquationInput,
    annotationArray: Array<AnnotationInformation>,
    annotationInSize: boolean = false,
  ) {
    return new Annotation(
      contentToElement(this.collection, content),
      annotationArray,
      annotationInSize,
    );
  }

  ann(
    content: TypeEquationInput,
    xPosition: 'left' | 'right' | 'center' | number = 'right',
    yPosition: 'bottom' | 'top' | 'middle' | 'baseline' | number = 'top',
    xAlign: 'left' | 'right' | 'center' | number = 'left',
    yAlign: 'bottom' | 'top' | 'middle' | 'baseline' | number = 'bottom',
    annotationScale: number = 0.5,
  ) {
    return new AnnotationInformation(
      contentToElement(this.collection, content),
      xPosition,
      yPosition,
      xAlign,
      yAlign,
      annotationScale,
    );
  }

  sfrac(
    numerator: TypeEquationInput,
    denominator: TypeEquationInput,
    vinculum: DiagramElementPrimative | DiagramElementCollection | string,
    scaleModifier: number = 1,
  ) {
    const f = this.frac(numerator, denominator, vinculum);
    f.scaleModifier = scaleModifier;
    return f;
  }

  sub(
    content: TypeEquationInput,
    subscript: TypeEquationInput,
  ) {
    return new SuperSub(
      contentToElement(this.collection, content),
      null,
      contentToElement(this.collection, subscript),
    );
  }

  sup(
    content: TypeEquationInput,
    superscript: TypeEquationInput,
  ) {
    return new SuperSub(
      contentToElement(this.collection, content),
      contentToElement(this.collection, superscript),
      null,
    );
  }

  supsub(
    content: TypeEquationInput,
    superscript: TypeEquationInput,
    subscript: TypeEquationInput,
  ) {
    return new SuperSub(
      contentToElement(this.collection, content),
      contentToElement(this.collection, superscript),
      contentToElement(this.collection, subscript),
    );
  }

  brac(
    content: TypeEquationInput,
    leftBracket: DiagramElementPrimative | DiagramElementCollection | string,
    rightBracket: DiagramElementPrimative | DiagramElementCollection | string,
    space: number = 0.03,
  ) {
    return new Brackets(
      contentToElement(this.collection, content),
      getDiagramElement(this.collection, leftBracket),
      getDiagramElement(this.collection, rightBracket),
      space,
    );
  }

  topBar(
    content: TypeEquationInput,
    bar: DiagramElementPrimative | DiagramElementCollection | string,
    space: number = 0.03,
    outsideSpace: number = 0.03,
  ) {
    return new Bar(
      contentToElement(this.collection, content),
      getDiagramElement(this.collection, bar),
      space,
      outsideSpace,
      'top',
    );
  }

  bottomBar(
    content: TypeEquationInput,
    bar: DiagramElementPrimative | DiagramElementCollection | string,
    space: number = 0.03,
    outsideSpace: number = 0.03,
  ) {
    return new Bar(
      contentToElement(this.collection, content),
      getDiagramElement(this.collection, bar),
      space,
      outsideSpace,
      'bottom',
    );
  }

  topComment(
    content: TypeEquationInput,
    comment: TypeEquationInput,
    bar: DiagramElementPrimative | DiagramElementCollection | string,
    space: number = 0.03,
    outsideSpace: number = 0.03,
  ) {
    return this.annotation(
      this.topBar(content, bar, space, outsideSpace),
      [this.ann(comment, 'center', 'top', 'center', 'bottom')],
    );
  }

  bottomComment(
    content: TypeEquationInput,
    comment: TypeEquationInput,
    bar: DiagramElementPrimative | DiagramElementCollection | string,
    space: number = 0.0,
    outsideSpace: number = 0.03,
  ) {
    return this.annotation(
      this.bottomBar(content, bar, space, outsideSpace),
      [this.ann(comment, 'center', 'bottom', 'center', 'top')],
    );
  }
}
