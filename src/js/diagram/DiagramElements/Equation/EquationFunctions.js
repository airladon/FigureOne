// @flow
import {
  Point, getPoint,
} from '../../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../Element';
import {
  BlankElement, Element, Elements,
} from './Elements/Element';
import Fraction from './Elements/Fraction';
// eslint-disable-next-line import/no-cycle
import EquationForm from './EquationForm';
import Matrix from './Elements/Matrix';
import Scale from './Elements/Scale';
import Container from './Elements/Container';
import BaseAnnotationFunction from './Elements/BaseAnnotationFunction';
import type { TypeAnnotation } from './Elements/BaseAnnotationFunction';

export function getDiagramElement(
  elementsObject: { [string: string]: DiagramElementPrimitive |
                    DiagramElementCollection }
                  | DiagramElementCollection,
  name: string | DiagramElementPrimitive | DiagramElementCollection,
): DiagramElementPrimitive | DiagramElementCollection | null {
  if (typeof name !== 'string') {
    return name;
  }
  if (elementsObject instanceof DiagramElementCollection) {
    if (elementsObject && `_${name}` in elementsObject) {
    // $FlowFixMe
      return elementsObject[`_${name}`];
    }
    return null;
  }

  if (elementsObject && name in elementsObject) {
    return elementsObject[name];
  }

  return null;
}

/* eslint-disable no-use-before-define */
/**
 * An equation phrase is used to define an equation form. An equation phrase
 * can either be the entirety of the form definition, or a series of nested
 * phrases.
 *
 *  * An object or array definition (e.g. {@link TypeEquationFunctionFrac})
 *  * A string that represents an equation element
 *  * An array of {@link TypeEquationPhrase}
 *
 * @example:
 * forms: {
 *   form1: 'a'
 *   form2: ['a', 'equals', 'b']
 *   form3: [{
 *     frac: {
 *       numerator: 'a',
 *       symbol: 'v',
 *       denominator: '1'
 *     },
 *   }, 'equals', 'b'],
 *   form4: [{ frac: ['a', 'v', '1'], 'equals', 'b'}],
 * },
 */
export type TypeEquationPhrase =
  string
  | number
  | { frac: TypeEquationFunctionFrac }
  | { strike: TypeStrikeObject } | TypeStrikeArray
  | { box: TypeBoxObject } | TypeBoxArray
  | { root: TypeRootObject } | TypeRootArray
  | { brac: TypeBracketObject } | TypeBracketArray
  | { sub: TypeSubObject } | TypeSubArray
  | { sup: TypeSupObject } | TypeSupArray
  | { supSub: TypeSupSubObject } | TypeSupSubArray
  | { topBar: TypeBarObject } | TypeBarArray
  | { bottomBar: TypeBarObject } | TypeBarArray
  | { annotate: TypeAnnotateObject }
  | { topComment: TypeCommentObject } | TypeCommentArray
  | { bottomComment: TypeCommentObject } | TypeCommentArray
  | { padding: TypePaddingObject } | TypePaddingArray
  | { bar: TypeBarObject } | TypeBarArray
  | { scale: TypeEquationFunctionScale }
  | { container: TypeEquationFunctionContainer }
  | { matrix: TypeMatrixObject } | TypeMatrixArray
  | Array<TypeEquationPhrase>
  | DiagramElementPrimitive
  | DiagramElementCollection
  | Elements
  | Element
  | BaseAnnotationFunction;

/**
 * Equation container
 *
 * A container is useful to fix spacing around content as it changes between
 * equation forms.
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [width] (`null`)
 * @property {number} [descent] (`null`)
 * @property {number} [ascent] (`null`)
 * @property {'left' | 'center' | 'right' | number} [xAlign] (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | 'baseline' | number} [yAlign]  (`'baseline'`)
 * @property {'width' | 'height' | 'contain'} [fit] - fit width,
 * ascent and descent to either match width, height or fully contain the content (`null`)
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] - (`false`)
 * @example
 * // Full object definition
 *  {
 *    container: {
 *      content: 'a',
 *      width: null,
 *      descent: null,
 *      ascent: null,
 *      xAlign: 'left',
 *      yAlign: 'baseline',
 *      fit: null,
 *      scale: 1,
 *      fullContentBounds: false
 *    },
 *  }
 * @example
 * // Example array definition
 *  { container: ['a', 1, 0.2, 0.5] }
 */
export type TypeEquationFunctionContainer = {
  content: TypeEquationPhrase,
  width?: number,
  descent?: number,
  ascent?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | 'baseline' | number,
  fit?: 'width' | 'height' | 'contain',
  scale?: number,
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'middle' | 'top' | 'baseline' | number,
  ?'width' | 'height' | 'contain',
  ?number,
  ?boolean,
];

/**
 * Equation fraction
 *
 * @property {TypeEquationPhrase} numerator
 * @property {string} symbol - Vinculum symbol
 * @property {TypeEquationPhrase} denominator
 * @property {number} [scale] (`1`)
 * @property {number} [numeratorSpace] (`0.05`)
 * @property {number} [denominatorSpace] (`0.05`)
 * @property {number} [overhang] Vinculum extends beyond the content
 * horizontally by the this amount (`0.05`)
 * @property {number} [offsetY] Offset fraction in y (`0.07`)
 * @property {boolean} [fullContentBounds] Use full bounds with content (`false`)
 *
 * @example
 * // Full object definition example
 *  {
 *    frac: {
 *      numerator: 'a',
 *      symbol: 'v',
 *      denominator: 'b',
 *      scale: 0.8,
 *      numeratorSpace: 0.01,
 *      denominatorSpace: 0.02,
 *      overhang: 0.03,
 *      offsetY: 0.04,
 *    },
 *  }
 * @example
 * // Array definition example
 * { frac: ['a', 'v', 'b'] }
 */
export type TypeEquationFunctionFrac = {
  numerator: TypeEquationPhrase;
  symbol: string;
  denominator: TypeEquationPhrase;
  scale?: number;
  numeratorSpace?: number;
  denominatorSpace?: number;
  overhang?: number;
  offsetY?: number;
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  string,
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
];

/**
 * Equation scale
 *
 * Scale an equation phrase
 *
 * @property {TypeEquationPhrase} content
 * @property {number} [scale] - (`1`)
 * @property {boolean} [fullContentBounds] Use full bounds with content (`false`)
 * @example
 * // Full object definition
 *  {
 *    scale: {
 *      content: ['a', 'b'],
 *      scale: 0.5,
 *      fullContentBounds: false,
 *    },
 *  }
 * @example
 * // Example array definition
 *  { scale: [['a', 'b'], 0.5] }
 */
export type TypeEquationFunctionScale = {
  content: TypeEquationPhrase,
  scale?: number,
  fullContentBounds?: boolean,
} | [
  TypeEquationPhrase,
  ?number,
  ?boolean,
];


export type TypeBracketObject = {
  left?: string;
  content: TypeEquationPhrase;
  right?: string;
  inSize?: boolean;
  insideSpace?: number;
  outsideSpace?: number;
  topSpace?: number;
  bottomSpace?: number;
  minContentHeight?: number;
  minContentDescent?: number;
  height?: number;
  descent?: number;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
};
export type TypeBracketArray = [
  ?string,
  TypeEquationPhrase,
  ?string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

export type TypeRootObject = {
  symbol: string;
  content: TypeEquationPhrase;
  inSize?: boolean;
  space?: number;
  topSpace?: number;
  rightSpace?: number;
  bottomSpace?: number;
  leftSpace?: number;
  root: TypeEquationPhrase;
  rootOffset?: number,
  rootScale?: number,
};
export type TypeRootArray = [
  string,
  TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeEquationPhrase,
  ?number,
  ?number,
];

export type TypeStrikeObject = {
  content: TypeEquationPhrase;
  symbol: string;
  inSize?: boolean;
  space?: number;
  topSpace?: number;
  rightSpace?: number;
  bottomSpace?: number;
  leftSpace?: number;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
};

export type TypeStrikeArray = [
  TypeEquationPhrase,
  string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

export type TypeBoxObject = {
  content: TypeEquationPhrase,
  symbol: string,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  rightSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
};

export type TypeBoxArray = [
  TypeEquationPhrase,
  string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

export type TypeBarObject = {
  content: TypeEquationPhrase;
  // comment?: TypeEquationPhrase;
  symbol?: string;
  inSize?: boolean,
  space?: number,
  overhang?: number,
  length?: number,
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
  side?: 'left' | 'right' | 'top' | 'bottom',
  minContentHeight?: number,
  minContentDescent?: number,
  minContentAscent?: number,
  descent?: number,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
};

export type TypeBarArray = [
  TypeEquationPhrase,
  ?string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?'left' | 'right' | 'top' | 'bottom',
  ?number,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
];

export type TypeIntegralObject = {
  symbol?: string,
  content?: TypeEquationPhrase,
  from?: TypeEquationPhrase,
  to?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
  fromScale?: number,
  toScale?: number,
  fromOffset?: TypeParsablePoint,
  toOffset?: TypeParsablePoint,
  limitsPosition?: 'side' | 'topBottom' | 'topBottomCenter',
  limitsAroundContent?: boolean,
  fromXPosition?: 'left' | 'center' | 'right' | number,
  fromYPosition?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  fromXAlign?: 'left' | 'center' | 'right' | number,
  fromYAlign?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  toXPosition?: 'left' | 'center' | 'right' | number,
  toYPosition?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  toXAlign?: 'left' | 'center' | 'right' | number,
  toYAlign?: 'bottom' | 'top' | 'middle' | 'baseline' | number,
  fullBoundsContent?: boolean,
  useFullBounds?: boolean,
  };
export type TypeIntegralArray = [
  ?string,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
  ?'side' | 'topBottom' | 'topBottomCenter',
  ?boolean,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?'left' | 'center' | 'right' | number,
  ?'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?boolean,
  ?boolean,
];

export type TypeSumProdObject = {
  symbolString?: string,
  content: TypeEquationPhrase,
  from?: TypeEquationPhrase,
  to?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
  fromScale?: number,
  toScale?: number,
  fromSpace?: number,
  toSpace?: number,
  fromOffset?: TypeParsablePoint,
  toOffset?: TypeParsablePoint,
  fullBoundsContent?: boolean,
  useFullBounds?: boolean,
};
export type TypeSumProdArray = [
  ?string,
  TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?TypeParsablePoint | null,
  ?TypeParsablePoint | null,
  ?boolean,
  ?boolean,
];

export type TypeSubObject = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  scale?: number,
  offset?: TypeParsablePoint,
  inSize: boolean,
};
export type TypeSubArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?boolean,
];
export type TypeSupObject = {
  content: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number,
  offset?: TypeParsablePoint,
  inSize: boolean,
};
export type TypeSupArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?boolean,
];

export type TypeSupSubObject = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number;
  superscriptOffset?: TypeParsablePoint;
  subscriptOffset?: TypeParsablePoint;
  inSize?: boolean,
};
export type TypeSupSubArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
  ?boolean,
];

export type TypeCommentObject = {
  content: TypeEquationPhrase;
  comment: TypeEquationPhrase;
  symbol?: string;
  contentSpace?: number;
  commentSpace?: number;
  scale?: number;
  inSize?: boolean;
  fullContentBounds?: boolean;
  useFullBounds?: boolean;
};
export type TypeCommentArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  string,
  ?number,
  ?number,
  ?number,
  ?boolean,
  ?boolean,
  ?boolean,
];

export type TypeStrikeCommentObject = {
  content?: TypeEquationPhrase,
  symbol?: string,
  comment?: TypeEquationPhrase,
  inSize?: boolean,
  space?: number,
  scale?: number,
  overhang?: number,
};


export type TypeStrikeCommentArray = [
  ?TypeEquationPhrase,
  ?string,
  ?TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
];


export type TypePaddingObject = {
  content: TypeEquationPhrase;
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
};
export type TypePaddingArray = [
  TypeEquationPhrase,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeMatrixObject = {
  order?: [number, number],
  left?: string,
  content: TypeEquationPhrase,
  right?: string,                       // $FlowFixM: ,
  scale?: number,
  fit?: 'max' | 'min',
  space?: TypeParsablePoint,
  vAlign?: 'baseline' | 'middle',
  brac?: TypeBracketObject,
  fullContentBounds?: boolean,
};

export type TypeMatrixArray = [
  ?[number, number],
  ?string,
  TypeEquationPhrase,
  ?string,
  ?number,
  ?'max' | 'min',
  ?TypeParsablePoint,
  ?'baseline' | 'middle',
  ?TypeBracketObject,
  ?boolean,
];

export type TypeAnnotateObject = {
  content: TypeEquationPhrase,
  annotation?: TypeAnnotation,
  annotations?: Array<TypeAnnotation>,
  fullContentBounds?: boolean,
  useFullBounds?: boolean,
  glyphs?: {
    encompass?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      topSpace?: number;
      leftSpace?: number;
      bottomSpace?: number;
      rightSpace?: number;
    },
    left?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      topSpace?: number;
      bottomSpace?: number;
      minContentHeight?: number,
      minContentDescent?: number;
      minContentAscent?: number,
      descent?: number,
      height?: number,
      yOffset?: number,
      annotationsOverContent?: boolean,
    },
    right?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      topSpace?: number;
      bottomSpace?: number;
      minContentHeight?: number,
      minContentDescent?: number;
      minContentAscent?: number,
      descent?: number,
      height?: number,
      yOffset?: number,
      annotationsOverContent?: boolean,
    },
    top?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      width?: number,
      leftSpace?: number,
      rightSpace?: number,
      xOffset?: number,
      annotationsOverContent?: boolean,
    },
    bottom?: {
      symbol?: string,
      annotations?: Array<TypeAnnotation>,
      space?: number;
      overhang?: number,
      width?: number,
      leftSpace?: number,
      rightSpace?: number,
      xOffset?: number,
      annotationsOverContent?: boolean,
    },
  },
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
  rightSpace?: number,
  contentScale?: number,
};

// There are lots of FlowFixMes in this file. This is not perfect, but
// haven't been able to come up with a quick work around. The problem statement
// is each function can accept as arguements either a full object definition
// or the definition split over parameters.
// The problem is then the first arguement can be so many types, some of which
// are subsets of the other, then when its parameters are extracted, their type
// is all confused.

/**
 * Functions used in making equation forms
 */
export class EquationFunctions {
  // eslint-disable-next-line no-use-before-define
  elements: { [name: string]: DiagramElementCollection | DiagramElementPrimitive };
  shapes: {};
  contentToElement: (TypeEquationPhrase | Elements) => Elements;
  phrases: {
    [phraseName: string]: TypeEquationPhrase,
  };

  fullLineHeight: EquationForm | null;
  addElementFromKey: (string, Object) => ?DiagramElementPrimitive;
  getExistingOrAddSymbol: (string | Object) => ?DiagramElementPrimitive;

  // [methodName: string]: (TypeEquationPhrase) => {};

  // eslint-disable-next-line no-use-before-define
  constructor(
    elements: { [name: string]: DiagramElementCollection | DiagramElementPrimitive },
    addElementFromKey: (string) => ?DiagramElementPrimitive,
    getExistingOrAddSymbol: (string | Object) => ?DiagramElementPrimitive,
  ) {
    this.elements = elements;
    this.phrases = {};
    this.fullLineHeight = null;
    this.addElementFromKey = addElementFromKey;
    this.getExistingOrAddSymbol = getExistingOrAddSymbol;
  }

  // eslint-disable-next-line class-methods-use-this
  stringToElement(content: string) {
    if (content.startsWith('space')) {
      const spaceNum = parseFloat(content.replace(/space[_]*/, '')) || 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    if (content.startsWith(' ')) {
      const spaceNum = content.length * 0.03;
      return new Element(new BlankElement(spaceNum));
    }
    const diagramElement = getDiagramElement(this.elements, content);
    if (diagramElement) {
      return new Element(diagramElement);
    }
    if (content in this.phrases) {
      return this.parseContent(this.phrases[content]);
    }
    const elementFromKey = this.addElementFromKey(content, {});
    if (elementFromKey != null) {
      return new Element(elementFromKey);
    }
    return null;
  }

  parseContent(content: ?TypeEquationPhrase) {
    if (content == null) {
      return null;
    }
    if (typeof content === 'number') {
      return null;
    }
    if (content instanceof Elements) {
      return content;
    }
    if (content instanceof BaseAnnotationFunction) {
      return content;
    }
    if (typeof content === 'string') {
      return this.stringToElement(content);
    }
    if (Array.isArray(content)) {
      let elementArray = [];
      content.forEach((c) => {      // $FlowFixMe
        const result = this.parseContent(c);
        if (Array.isArray(result)) {
          elementArray = [...elementArray, ...result];
        } else {
          elementArray.push(result);
        }
      });
      return elementArray;
    }
    // Otherwise its an object
    const [method, params] = Object.entries(content)[0];
    // if (this[method] != null) {
    // return this[method](params);
    // }
    // $FlowFixMe
    const eqnMethod = this.eqnMethod(method, params);
    if (eqnMethod != null) {
      return eqnMethod;
    }
    // If it is not a known function, then it must be a new text or
    // symbol element           // $FlowFixMe
    const elem = this.addElementFromKey(method, params);     // $FlowFixMe
    return new Element(elem);
  }

  contentToElement(
    content: TypeEquationPhrase | Elements | DiagramElementPrimitive | DiagramElementCollection,
  ): Elements {
    // If input is alread an Elements object, then return it
    if (content instanceof Elements) {
      return content._dup();
    }
    if (content instanceof DiagramElementCollection
      || content instanceof DiagramElementPrimitive
    ) {
      return new Elements([new Element(content)]);
    }
    let elementArray = this.parseContent(content);
    if (!Array.isArray(elementArray)) {
      elementArray = [elementArray];
    }
    return new Elements(elementArray);
  }

  eqnMethod(name: string, params: {}) {
    // $FlowFixMe
    if (name === 'frac') { return this.frac(params); }  // $FlowFixMe
    if (name === 'strike') { return this.strike(params); }    // $FlowFixMe
    if (name === 'box') { return this.box(params); }          // $FlowFixMe
    if (name === 'root') { return this.root(params); }        // $FlowFixMe
    if (name === 'brac') { return this.brac(params); }        // $FlowFixMe
    if (name === 'sub') { return this.sub(params); }          // $FlowFixMe
    if (name === 'sup') { return this.sup(params); }          // $FlowFixMe
    if (name === 'supSub') { return this.supSub(params); }    // $FlowFixMe
    if (name === 'topBar') { return this.topBar(params); }    // $FlowFixMe
    if (name === 'bottomBar') { return this.bottomBar(params); } // $FlowFixMe
    if (name === 'annotate') { return this.annotate(params); } // $FlowFixMe
    if (name === 'bottomComment') { return this.bottomComment(params); } // $FlowFixMe
    if (name === 'topComment') { return this.topComment(params); } // $FlowFixMe
    if (name === 'bar') { return this.bar(params); }               // $FlowFixMe
    if (name === 'topStrike') { return this.topStrike(params); }   // $FlowFixMe
    if (name === 'bottomStrike') { return this.bottomStrike(params); } // $FlowFixMe
    if (name === 'pad') { return this.pad(params); }   // $FlowFixMe
    if (name === 'int') { return this.int(params); }   // $FlowFixMe
    if (name === 'sumOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'prodOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'matrix') { return this.matrix(params); }   // $FlowFixMe
    if (name === 'scale') { return this.scale(params); }   // $FlowFixMe
    if (name === 'container') { return this.container(params); }
    return null;
  }

  /**
   * Equation container function
   * @example
   * e = new Equation();
   * e.addElements({
   *   v: { symbol: 'vinculum' },
   * });
   * frac = e.eqn.functions.frac;
   * eqn.addForms({
   *   base: ['a', 'equals', frac(['b', 'v', 'c'])],
   * });
   */
  container(
    optionsOrArray: TypeEquationFunctionContainer,
  ) {
    let content;
    let scale;
    let fit; // fits content to container - width, height, contain, null
    let width;
    let ascent;
    let descent;
    let xAlign; // left, center, right, multiplier (to left)
    let yAlign; // bottom, baseline, middle, top, multiplier (to bottom)
    let fullContentBounds;

    const defaultOptions = {
      scaleModifier: 1,
      fit: null,
      width: null,
      ascent: null,
      descent: null,
      xAlign: 'center',
      yAlign: 'baseline',
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
        fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      fit,
      width,
      ascent,
      descent,
      xAlign,
      yAlign,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Container(
      [this.contentToElement(content)],
      [],
      options,
    );
  }

  brac(
    optionsOrArray: TypeBracketObject | TypeBracketArray,
  ) {
    let content;
    let left;
    let right;
    let insideSpace;
    let outsideSpace;
    let topSpace;
    let bottomSpace;
    let minContentHeight;
    let minContentDescent;
    let descent;
    let height;
    let inSize;
    let useFullBounds;
    let fullContentBounds;

    if (Array.isArray(optionsOrArray)) {
      [
        left, content, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight,                   // $FlowFixMe
        minContentDescent, height, descent, fullContentBounds,     // $FlowFixMe
        useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        left, content, right, inSize, insideSpace, outsideSpace,
        topSpace, bottomSpace, minContentHeight,
        minContentDescent, height, descent, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const defaultOptions = {
      insideSpace: 0.03,
      outsideSpace: 0.03,
      topSpace: 0.05,
      bottomSpace: 0.05,
      minContentHeight: null,
      minContentDescent: null,
      descent: null,
      height: null,
      inSize: true,
      useFullBounds: false,
      fullContentBounds: false,
    };
    const optionsIn = {
      insideSpace,
      outsideSpace,
      topSpace,
      bottomSpace,
      minContentHeight,
      minContentDescent,
      descent,
      height,
      inSize,
      useFullBounds,
      fullContentBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const glyphs = {};
    if (left) {
      glyphs.left = {
        symbol: left,
        space: options.insideSpace,
        topSpace: options.topSpace,
        bottomSpace: options.bottomSpace,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        descent: options.descent,
        height: options.height,
      };
    }
    if (right) {
      glyphs.right = {
        symbol: right,
        space: options.insideSpace,
        topSpace: options.topSpace,
        bottomSpace: options.bottomSpace,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        descent: options.descent,
        height: options.height,
      };
    }
    return this.annotate({
      content,
      glyphs,
      inSize: options.inSize,
      leftSpace: options.outsideSpace,
      rightSpace: options.outsideSpace,
      useFullBounds: options.useFullBounds,
      fullContentBounds: options.fullContentBounds,
    });
  }

  bar(
    optionsOrArray: TypeBarObject | TypeBarArray,
    forceOptions: Object = {},
  ) {
    let content;
    let symbol;
    let side;
    let space;
    let overhang;
    let length;
    let left;
    let right;
    let top;
    let bottom;
    let inSize;
    let minContentHeight;
    let minContentDescent;
    let minContentAscent;
    let descent;
    let fullContentBounds;
    let useFullBounds;
    const defaultOptions = {
      side: 'top',
      space: 0.03,
      overhang: 0,
      length: null,
      left: null,
      right: null,
      top: null,
      bottom: null,
      inSize: true,
      minContentDescent: null,
      minContentHeight: null,
      minContentAscent: null,
      descent: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, overhang,
        length, left, right, top, bottom,
        side, minContentHeight, minContentDescent,
        minContentAscent, descent, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      side,
      space,
      overhang,
      length,
      left,
      right,
      top,
      bottom,
      inSize,
      minContentHeight,
      minContentDescent,
      minContentAscent,
      descent,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn, forceOptions);

    const glyphs = {};
    if (options.side === 'top') {
      glyphs.top = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        leftSpace: options.left,
        rightSpace: options.right,
        width: options.length,
      };
    }
    if (options.side === 'bottom') {
      glyphs.bottom = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        leftSpace: options.left,
        rightSpace: options.right,
        width: options.length,
      };
    }
    if (options.side === 'left') {
      glyphs.left = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        topSpace: options.top,
        bottomSpace: options.bottom,
        height: options.length,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        minContentAscent: options.minContentAscent,
        descent: options.descent,
      };
    }
    if (options.side === 'right') {
      glyphs.right = {
        symbol,
        space: options.space,
        overhang: options.overhang,
        topSpace: options.top,
        bottomSpace: options.bottom,
        height: options.length,
        minContentHeight: options.minContentHeight,
        minContentDescent: options.minContentDescent,
        minContentAscent: options.minContentAscent,
        descent: options.descent,
      };
    }
    return this.annotate({
      content,                            // $FlowFixMe
      glyphs,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
    });
  }

  annotate(optionsIn: TypeAnnotateObject) {
    const defaultOptions = {
      inSize: true,
      useFullBounds: false,
      fullContentBounds: false,
      space: 0,
      contentScale: 1,
      encompass: {
        space: 0,
      },
      left: {
        space: 0,
        overhang: 0,
        yOffset: 0,
        annotationsOverContent: false,
      },
      right: {
        space: 0,
        overhang: 0,
        yOffset: 0,
        annotationsOverContent: false,
      },
      top: {
        space: 0,
        overhang: 0,
        xOffset: 0,
        annotationsOverContent: false,
      },
      bottom: {
        space: 0,
        overhang: 0,
        xOffset: 0,
        annotationsOverContent: false,
      },
    };
    const {
      content, annotation, annotations, glyphs,
    } = optionsIn;

    const defaultAnnotation = {
      xPosition: 'center',
      yPosition: 'top',
      xAlign: 'center',
      yAlign: 'bottom',
      offset: new Point(0, 0),
      scale: 1,
      inSize: true,
      fullContentBounds: false,
    };
    let annotationsToProcess = [];
    if (annotation != null) {
      annotationsToProcess.push(annotation);
    } else if (annotations != null) {
      annotationsToProcess = annotations;
    }

    const fillAnnotation = (ann) => {
      const annCopy = joinObjects({}, defaultAnnotation, ann);  // $FlowFixMe
      annCopy.content = this.contentToElement(ann.content);
      return annCopy;
    };

    const fillAnnotations = (anns) => {
      if (anns == null || !Array.isArray(anns)) {
        return [];
      }
      const annsCopy = [];
      anns.forEach((ann) => {
        annsCopy.push(fillAnnotation(ann));
      });
      return annsCopy;
    };
    const annotationsToUse = fillAnnotations(annotationsToProcess);

    const glyphsToUse = {};

    const fillGlyphAnnotation = (side) => {
      if (glyphs == null) {
        return;
      }
      const glyphSide = glyphs[side];
      if (glyphSide == null) {
        return;
      }
      glyphsToUse[side] = {};
      let glyphAnnotationsToProcess = glyphSide.annotations;
      // $FlowFixMe
      if (glyphSide.annotate != null) {      // $FlowFixMe
        glyphAnnotationsToProcess = [glyphSide.annotate];
      }
      const glyphAnnotationsToUse = fillAnnotations(glyphAnnotationsToProcess);
      glyphsToUse[side] = joinObjects({}, defaultOptions[side], glyphSide);
      glyphsToUse[side].annotations = glyphAnnotationsToUse;     // $FlowFixMe
      glyphsToUse[side].glyph = this.getExistingOrAddSymbol(glyphSide.symbol || '');
    };

    fillGlyphAnnotation('encompass');
    fillGlyphAnnotation('left');
    fillGlyphAnnotation('right');
    fillGlyphAnnotation('top');
    fillGlyphAnnotation('bottom');
    const options = joinObjects(defaultOptions, optionsIn);
    return new BaseAnnotationFunction(
      this.contentToElement(content),
      annotationsToUse,       // $FlowFixMe
      glyphsToUse,
      options,
    );
  }


  scale(
    optionsOrArray: TypeEquationFunctionScale,
  ) {
    let content;
    let scale;
    let fullContentBounds;
    const defaultOptions = {
      scaleModifier: 1,
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, scale, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, scale, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Scale(
      [this.contentToElement(content)],
      [],
      options,
    );
  }

  /**
   * Equation fraction function
   * @example
   * e = new Equation();
   * e.addElements({
   *   v: { symbol: 'vinculum' },
   * });
   * frac = e.eqn.functions.frac;
   * eqn.addForms({
   *   base: ['a', 'equals', frac(['b', 'v', 'c'])],
   * });
   */
  frac(
    optionsOrArray: TypeEquationFunctionFrac,
  ) {
    let numerator;
    let denominator;
    let symbol;
    let scale;
    let overhang;
    let numeratorSpace;
    let denominatorSpace;
    let offsetY;
    let fullContentBounds;

    // This is imperfect type checking, as the assumption is if den, sym
    // and fractionScale is null, then they weren't defined by the caller
    // and therefore the caller is passing in a TypeFracObject or TypeFracArray
    // All the flow errors go away if TypeEquationPhrase is removed from
    // optionsOrNum (and then also remove the first if statement below)
    const defaultOptions = {
      scaleModifier: 1,
      numeratorSpace: 0.05,
      denominatorSpace: 0.05,
      offsetY: 0.07,
      overhang: 0.05,
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      overhang,
      numeratorSpace,
      denominatorSpace,
      offsetY,
      fullContentBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Fraction(
      [this.contentToElement(numerator), this.contentToElement(denominator)],       // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),
      options,
    );
  }

  root(optionsOrArray: TypeRootObject | TypeRootArray) {
    let content;
    let root;
    let symbol;
    let space;
    let leftSpace;
    let topSpace;
    let bottomSpace;
    let rightSpace;
    let rootScale;
    let rootOffset;
    let inSize = true;
    let fullContentBounds;
    let useFullBounds;
    if (Array.isArray(optionsOrArray)) {
      [                                                            // $FlowFixMe
        symbol, content, inSize,                                   // $FlowFixMe
        space, topSpace, rightSpace, bottomSpace, leftSpace,       // $FlowFixMe
        root, rootOffset, rootScale, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        symbol, content, inSize,                                   // $FlowFixMe
        space, topSpace, rightSpace, bottomSpace, leftSpace,       // $FlowFixMe
        root, rootOffset, rootScale, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }

    const defaultOptions = {
      space: 0.02,
      rootScale: 0.6,
      rootOffset: [0, 0.06],
      inSize: true,
      fullContentBounds: false,
      useFullBounds: false,
    };
    const optionsIn = {
      leftSpace,
      topSpace,
      bottomSpace,
      rightSpace,
      space,
      rootScale,
      rootOffset,
      inSize,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    options.rootOffset = getPoint(options.rootOffset);
    const annotations = [];
    if (root != null) {
      annotations.push({
        content: root,
        offset: options.rootOffset,
        scale: options.rootScale,
        reference: 'root',
      });
    }
    return this.annotate({
      content,
      inSize: options.inSize,
      useFullBounds: options.useFullBounds,
      fullContentBounds: options.fullContentBounds,
      glyphs: {
        encompass: {
          symbol,       // $FlowFixMe
          annotations,
          space: options.space,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
        },
      },
    });
  }

  supSub(optionsOrArray: TypeSupSubObject | TypeSupSubArray) {
    let content;
    let superscript = null;
    let subscript = null;
    let scale = null;
    let subscriptOffset = null;
    let superscriptOffset = null;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, superscript, subscript, scale,            // $FlowFixMe
        superscriptOffset, subscriptOffset, inSize,
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, subscript, scale, superscriptOffset, subscriptOffset, inSize,
      } = optionsOrArray);
    }

    const defaultOptions = {
      scale: 0.5,
      subscriptOffset: [0, 0],
      superscriptOffset: [0, 0],
      inSize: true,
    };
    const optionsIn = {
      superscript,
      subscript,
      scale,
      subscriptOffset,
      superscriptOffset,
      inSize,
    };
    const options = joinObjects(defaultOptions, optionsIn);

    const annotations = [];
    if (superscript != null) {
      annotations.push({
        content: options.superscript,
        xPosition: 'right',
        yPosition: '0.7a',
        xAlign: 'left',
        yAlign: 'baseline',
        offset: options.superscriptOffset,
        scale: options.scale,
      });
    }
    if (subscript != null) {
      annotations.push({
        content: options.subscript,
        xPosition: 'right',
        yPosition: 'baseline',
        xAlign: 'left',
        yAlign: '0.7a',
        offset: options.subscriptOffset,
        scale: options.scale,
      });
    }
    return this.annotate({
      content,      // $FlowFixMe
      annotations,
      inSize: options.inSize,
    });
  }

  sup(optionsOrArray: TypeSupObject | TypeSupArray) {
    let content;
    let superscript;
    let scale;
    let offset;
    // let superscriptOffset = null;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, superscript, scale, offset, inSize,           // $FlowFixMe
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, scale, offset, inSize,
      } = optionsOrArray);
    }
    // $FlowFixMe
    return this.supSub({          // $FlowFixMe
      content,                    // $FlowFixMe
      superscript,                // $FlowFixMe
      superscriptOffset: offset,  // $FlowFixMe
      inSize,                     // $FlowFixMe
      scale,
    });
  }

  sub(optionsOrArray: TypeSubObject | TypeSubArray) {
    let content;
    let subscript;
    let scale;
    let offset;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [           // $FlowFixMe
        content, subscript, scale, offset, inSize,           // $FlowFixMe
      ] = optionsOrArray;
    } else {
      ({                                                    // $FlowFixMe
        content, subscript, scale, offset, inSize,
      } = optionsOrArray);
    }
    // $FlowFixMe
    return this.supSub({          // $FlowFixMe
      content,                    // $FlowFixMe
      subscript,                  // $FlowFixMe
      subscriptOffset: offset,    // $FlowFixMe
      inSize,                     // $FlowFixMe
      scale,
    });
  }


  box(
    optionsOrArray: TypeBoxObject | TypeBoxArray,
  ) {
    let content;
    let symbol;
    let inSize;
    let space;
    let topSpace;
    let bottomSpace;
    let leftSpace;
    let rightSpace;
    let fullContentBounds;
    let useFullBounds;
    const defaultOptions = {
      inSize: false,
      space: 0,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      content,
      symbol,
      inSize,
      space,
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          space: options.space,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
        },
      },
    });
  }

  pad(
    optionsOrContent: TypePaddingObject | TypePaddingArray,
  ) {
    let content;
    let top;
    let right;
    let bottom;
    let left;
    const defaultOptions = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
    if (Array.isArray(optionsOrContent)) {
      [
        content, top, right, bottom, left,
      ] = optionsOrContent;
    } else {
      ({
        content, top, right, bottom, left,
      } = optionsOrContent);
    }
    const optionsIn = {
      top,
      right,
      bottom,
      left,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      topSpace: options.top,
      bottomSpace: options.bottom,
      rightSpace: options.right,
      leftSpace: options.left,
    });
  }

  topBar(optionsOrArray: TypeBarObject | TypeBarArray) {
    return this.bar(optionsOrArray, { side: 'top' });
  }

  bottomBar(optionsOrArray: TypeBarObject | TypeBarArray) {
    return this.bar(optionsOrArray, { side: 'bottom' });
  }


  matrix(optionsOrArray: TypeMatrixObject | TypeMatrixArray) {
    let content;
    let left;
    let right;
    let order;
    let fit;
    let space;
    let scale;
    let vAlign;
    let brac;
    let fullContentBounds;
    const defaultOptions = {
      space: [0.05, 0.05],
      fit: 'min',
      contentScale: 0.7,
      brac: {},
      vAlign: 'baseline',
      fullContentBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        order, left, content, right,
        scale, fit, space, vAlign, brac, fullContentBounds,
      ] = optionsOrArray;
    } else {
      ({
        order, left, content, right,
        scale, fit, space, vAlign, brac, fullContentBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      space,
      fit,
      order,
      contentScale: scale,
      brac,
      vAlign,
      fullContentBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);

    let contentArray = [];
    if (content != null) {      // $FlowFixMe
      contentArray = content.map(c => this.contentToElement(c));
    }

    if (options.order == null
      || options.order[0] * options.order[1] !== contentArray.length) {
      options.order = [1, contentArray.length];
    }

    if (options.space != null) {
      options.space = getPoint(options.space);
    }

    const matrixContent = new Matrix(
      contentArray,
      [],
      options,
    );
    if (left != null && right != null) {
      return this.brac(joinObjects({}, options.brac, {
        content: matrixContent,
        left,
        right,
      }));
    }
    return matrixContent;
  }


  int(
    optionsOrArray: TypeIntegralObject | TypeIntegralArray | TypeEquationPhrase,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let height;
    let yOffset;
    let inSize;
    let from;
    let to;
    let scale;
    let fromScale;
    let toScale;
    // let fromSpace;
    // let toSpace;
    let fromOffset;
    let toOffset;
    let limitsPosition;
    let limitsAroundContent;
    let fromXPosition;
    let fromYPosition;
    let fromXAlign;
    let fromYAlign;
    let toXPosition;
    let toYPosition;
    let toXAlign;
    let toYAlign;
    let fullBoundsContent;
    let useFullBounds;
    const defaultOptions = {
      space: 0.05,
      topSpace: 0.1,
      bottomSpace: 0.1,
      height: null,
      yOffset: 0,
      inSize: true,
      contentScale: 1,
      fromScale: 0.5,
      toScale: 0.5,
      // fromSpace: 0.01,
      // toSpace: 0.01,
      fromOffset: [0, 0],
      toOffset: [0.04, 0],
      limitsPosition: 'side',
      limitsAroundContent: true,
      fromXPosition: 0.5,
      fromYPosition: 'bottom',
      fromXAlign: 'left',
      fromYAlign: 'middle',
      toXPosition: 'right',
      toYPosition: 'top',
      toXAlign: 'left',
      toYAlign: 'middle',
      fullBoundsContent: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [                                                    // $FlowFixMe
        symbol, content, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset, scale,                            // $FlowFixMe
        fromScale, toScale,                                // $FlowFixMe
        fromOffset, toOffset, limitsPosition,              // $FlowFixMe
        limitsAroundContent,                               // $FlowFixMe
        fromXPosition, fromYPosition, fromXAlign, fromYAlign, // $FlowFixMe
        toXPosition, toYPosition, toXAlign, toYAlign, // $FlowFixMe
        fullBoundsContent, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, symbol, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset,                                   // $FlowFixMe
        scale, fromScale, toScale,                         // $FlowFixMe
        fromOffset, toOffset, limitsPosition,              // $FlowFixMe
        limitsAroundContent,                               // $FlowFixMe
        fromXPosition, fromYPosition, fromXAlign, fromYAlign, // $FlowFixMe
        toXPosition, toYPosition, toXAlign, toYAlign, // $FlowFixMe
        fullBoundsContent, useFullBounds,
      } = optionsOrArray);
    }
    if (limitsPosition === 'topBottom') {
      defaultOptions.fromXPosition = 0.1;
      defaultOptions.fromYPosition = 'bottom';
      defaultOptions.fromXAlign = 'center';
      defaultOptions.fromYAlign = 'top';        // $FlowFixMe
      defaultOptions.toXPosition = 0.9;
      defaultOptions.toYPosition = 'top';
      defaultOptions.toXAlign = 'center';
      defaultOptions.toYAlign = 'bottom';
      defaultOptions.fromOffset = [0, -0.04];
      defaultOptions.toOffset = [0, 0.04];
    }
    if (limitsPosition === 'topBottomCenter') {        // $FlowFixMe
      defaultOptions.fromXPosition = 'center';
      defaultOptions.fromYPosition = 'bottom';
      defaultOptions.fromXAlign = 'center';
      defaultOptions.fromYAlign = 'top';
      defaultOptions.toXPosition = 'center';
      defaultOptions.toYPosition = 'top';
      defaultOptions.toXAlign = 'center';
      defaultOptions.toYAlign = 'bottom';
      defaultOptions.fromOffset = [0, -0.04];
      defaultOptions.toOffset = [0, 0.04];
    }
    const optionsIn = {
      space,
      topSpace,
      bottomSpace,
      height,
      yOffset,
      inSize,
      contentScale: scale,
      fromScale,
      toScale,
      // fromSpace,
      // toSpace,
      fromOffset,
      toOffset,
      limitsPosition,
      limitsAroundContent,
      fromXPosition,
      fromYPosition,
      fromXAlign,
      fromYAlign,
      toXPosition,
      toYPosition,
      toXAlign,
      toYAlign,
      fullBoundsContent,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.fromOffset = getPoint(options.fromOffset);
    options.toOffset = getPoint(options.toOffset);

    const annotations = [
      {
        content: to,
        xPosition: options.toXPosition,
        yPosition: options.toYPosition,
        xAlign: options.toXAlign,
        yAlign: options.toYAlign,
        offset: options.toOffset,
        scale: options.toScale,
      },
      {
        content: from,
        xPosition: options.fromXPosition,
        yPosition: options.fromYPosition,
        xAlign: options.fromXAlign,
        yAlign: options.fromYAlign,
        offset: options.fromOffset,
        scale: options.fromScale,
      },
    ];
    return this.annotate({  // $FlowFixMe
      content,
      inSize: options.inSize,
      contentScale: options.contentScale,
      fullBoundsContent: options.fullBoundsContent,
      useFullBounds: options.useFullBounds,
      glyphs: {
        left: {   // $FlowFixMe
          symbol,
          space: options.space,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          height: options.height,
          yOffset: options.yOffset,
          annotationsOverContent: options.limitsAroundContent,
          // $FlowFixMe
          annotations,
        },
      },
    });
  }

  sumOf(options: TypeSumProdObject | TypeSumProdArray) {
    return this.sumProd(options);
  }

  prodOf(options: TypeSumProdObject | TypeSumProdArray) {
    return this.sumProd(options);
  }

  sumProd(
    optionsOrArray: TypeSumProdObject | TypeSumProdArray,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let height;
    let yOffset;
    let inSize;
    let from;
    let to;
    let scale;
    let fromScale;
    let toScale;
    let fromSpace;
    let toSpace;
    let fromOffset;
    let toOffset;
    let fullBoundsContent;
    let useFullBounds;
    const defaultOptions = {
      space: 0.05,
      topSpace: 0.07,
      bottomSpace: 0.07,
      height: null,
      yOffset: 0,
      inSize: true,
      contentScale: 1,
      fromScale: 0.5,
      toScale: 0.5,
      fromSpace: 0.04,
      toSpace: 0.04,
      fromOffset: [0, 0],
      toOffset: [0, 0],
      fullBoundsContent: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset, scale,
        fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
        fullBoundsContent, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset,
        scale, fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
        fullBoundsContent, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      space,
      topSpace,
      bottomSpace,
      height,
      yOffset,
      inSize,
      contentScale: scale,
      fromScale,
      toScale,
      fromSpace,
      toSpace,
      fromOffset,
      toOffset,
      fullBoundsContent,
      useFullBounds,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const annotations = [
      {
        content: to,
        xPosition: 'center',
        yPosition: 'top',
        xAlign: 'center',
        yAlign: 'bottom',
        offset: getPoint(options.toOffset)
          .add(0, options.toSpace),
        scale: options.toScale,
      },
      {
        content: from,
        xPosition: 'center',
        yPosition: 'bottom',
        xAlign: 'center',
        yAlign: 'top',
        offset: getPoint(options.fromOffset)
          .add(0, -options.fromSpace),
        scale: options.fromScale,
      },
    ];
    return this.annotate({
      content,
      contentScale: options.contentScale,
      fullBoundsContent: options.fullBoundsContent,
      useFullBounds: options.useFullBounds,
      glyphs: {
        left: {         // $FlowFixMe
          symbol,         // $FlowFixMe
          annotations,         // $FlowFixMe
          space,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          yOffset: options.yOffset,
          height: options.height,
        },
      },
      inSize: options.inSize,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processComment(
    optionsOrArray: TypeCommentObject | TypeCommentArray,
  ) {
    let content;
    let comment;
    let symbol;
    let contentSpace;
    let commentSpace;
    let scale;
    let inSize;
    let fullContentBounds;
    let useFullBounds;
    if (Array.isArray(optionsOrArray)) {
      [
        content, comment, symbol, contentSpace, commentSpace, scale, inSize,
        fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, contentSpace, commentSpace, scale, inSize,
        fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const optionsIn = {
      contentSpace,
      commentSpace,
      scale,
      inSize,
      useFullBounds,
      fullContentBounds,
    };
    const defaultOptions = {
      contentSpace: 0.03,
      commentSpace: 0.03,
      scale: 0.6,
      inSize: true,
      fullContentBounds: false,
      useFullBounds: false,
    };

    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, comment, symbol,
      options.contentSpace, options.commentSpace, options.scale,
      options.inSize, options.fullContentBounds, options.useFullBounds,
    ];
  }

  // $FlowFixMe
  topComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, fullContentBounds, useFullBounds,
    ] = this.processComment(...args);
    const annotations = [{
      content: comment,
      xPosition: 'center',
      yPosition: 'top',
      xAlign: 'center',
      yAlign: 'bottom',
      scale: scaleToUse,
      offset: [0, commentSpaceToUse],
    }];
    if (symbol === '' || symbol == null) {
      return this.annotate({
        content,           // $FlowFixMe
        annotations,
        inSize,
      });
    }
    return this.annotate({
      content,
      fullContentBounds,
      useFullBounds,
      glyphs: {
        top: {
          symbol,              // $FlowFixMe
          annotations,
          space: contentSpaceToUse,
        },
      },
      inSize,
    });
  }

  // $FlowFixMe
  bottomComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize, fullContentBounds, useFullBounds,
    ] = this.processComment(...args);

    const annotations = [{
      content: comment,
      xPosition: 'center',
      yPosition: 'bottom',
      xAlign: 'center',
      yAlign: 'top',
      scale: scaleToUse,
      offset: [0, -commentSpaceToUse],
    }];

    if (symbol === '' || symbol == null) {
      return this.annotate({
        content,           // $FlowFixMe
        annotations,
        inSize,
      });
    }

    return this.annotate({
      content,
      fullContentBounds,
      useFullBounds,
      glyphs: {
        bottom: {
          symbol,            // $FlowFixMe
          annotations,
          space: contentSpaceToUse,
        },
      },
      inSize,
    });
  }


  strike(
    optionsOrArray: TypeStrikeObject | TypeStrikeArray,
  ) {
    let content;
    let symbol;
    let inSize;
    let space;
    let topSpace;
    let bottomSpace;
    let leftSpace;
    let rightSpace;
    let fullContentBounds;
    let useFullBounds;

    const defaultOptions = {
      inSize: false,
      space: 0.02,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
      fullContentBounds: false,
      useFullBounds: false,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace, fullContentBounds, useFullBounds,
      } = optionsOrArray);
    }
    const glyph = this.getExistingOrAddSymbol(symbol);
    if (glyph != null && glyph.custom.options.style === 'horizontal') {
      defaultOptions.space = 0;           // $FlowFixMe
      defaultOptions.leftSpace = 0.02;    // $FlowFixMe
      defaultOptions.rightSpace = 0.02;   // $FlowFixMe
    }
    const optionsIn = {
      content,
      symbol,
      inSize,
      space,
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
      fullContentBounds,
      useFullBounds,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return this.annotate({
      content,
      inSize: options.inSize,
      fullContentBounds: options.fullContentBounds,
      useFullBounds: options.useFullBounds,
      glyphs: {
        encompass: {
          symbol,
          topSpace: options.topSpace,
          bottomSpace: options.bottomSpace,
          leftSpace: options.leftSpace,
          rightSpace: options.rightSpace,
          space: options.space,
        },
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processStrike(
    optionsOrContent: TypeStrikeCommentObject | TypeStrikeCommentArray,
  ) {
    let content;
    let comment;
    let symbol;
    let space;
    let scale;
    let overhang;
    let inSize;
    if (Array.isArray(optionsOrContent)) {             // $FlowFixMe
      [content, symbol, comment, inSize, space, scale, overhang] = optionsOrContent;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, inSize, space, scale, overhang,
      } = optionsOrContent);
    }
    const optionsIn = {
      inSize,
      space,
      scale,
      overhang,
    };
    const defaultOptions = {
      space: 0.1,
      overhang: 0,
      scale: 0.5,
      inSize: true,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, symbol, comment, options.inSize,
      options.space, options.scale, options.overhang,
    ];
  }

  // $FlowFixMe
  topStrike(...args) {
    const [
      content, symbol, comment, inSize,
      space, scale, overhang,
    ] = this.processStrike(...args);
    const annotations = [
      {
        content: comment,
        xPosition: 'center',
        yPosition: 'top',
        xAlign: 'center',
        yAlign: 'bottom',
        offset: [0, space],
        scale,
      },
    ];
    return this.annotate({    // $FlowFixMe
      content,
      inSize,
      glyphs: {
        encompass: {    // $FlowFixMe
          symbol,
          space: overhang,    // $FlowFixMe
          annotations,
        },
      },
    });
  }

  // $FlowFixMe
  bottomStrike(...args) {
    const [
      content, symbol, comment, inSize,
      space, scale, overhang,
    ] = this.processStrike(...args);
    const annotations = [
      {
        content: comment,
        xPosition: 'center',
        yPosition: 'bottom',
        xAlign: 'center',
        yAlign: 'top',
        offset: [0, -space],
        scale,
      },
    ];
    return this.annotate({    // $FlowFixMe
      content,
      inSize,
      glyphs: {
        encompass: {    // $FlowFixMe
          symbol,
          space: overhang,    // $FlowFixMe
          annotations,
        },
      },
    });
  }
}
