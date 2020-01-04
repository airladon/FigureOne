// @flow
import {
  Point, parsePoint,
} from '../../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../Element';
import {
  BlankElement, Element, Elements, ElementInterface,
} from './Elements/Element';
import Fraction from './Elements/Fraction';
import Root from './Elements/Root';
import Strike from './Elements/Strike';
// import DiagramPrimitives from '../../DiagramPrimitives/DiagramPrimitives';
import SuperSub from './Elements/SuperSub';
// import { Brackets, Bar } from './Elements/Brackets';
import Brackets from './Elements/Brackets';
import Bar from './Elements/Bar';
import EquationForm from './EquationForm';
import { Annotation, AnnotationInformation } from './Elements/Annotation';
import Padding from './Elements/Padding';
import Box from './Elements/Box';
import Integral from './Elements/Integral';
import SumProd from './Elements/SumProd';
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
export type TypeEquationPhrase =
  string
  | number
  | { frac: TypeFracObject } | TypeFracArray
  | { strike: TypeStrikeObject } | TypeStrikeArray
  | { box: TypeBoxObject } | TypeBoxArray
  | { root: TypeRootObject } | TypeRootArray
  | { brac: TypeBracketObject } | TypeBracketArray
  | { sub: TypeSubObject } | TypeSubArray
  | { sup: TypeSupObject } | TypeSupArray
  | { supSub: TypeSupSubObject } | TypeSupSubArray
  | { topBar: TypeBarObject } | TypeBarArray
  | { bottomBar: TypeBarObject } | TypeBarArray
  | { annotation: TypeAnnotationObject } | TypeAnnotationArray
  | { annotate: TypeAnnotateObject } | TypeAnnotateArray
  | { topComment: TypeCommentObject } | TypeCommentArray
  | { bottomComment: TypeCommentObject } | TypeCommentArray
  | { padding: TypePaddingObject } | TypePaddingArray
  | { bar: TypeBarObject } | TypeBarArray
  | { scale: TypeScaleObject } | TypeScaleArray
  | { container: TypeContainerObject } | TypeContainerArray
  | { matrix: TypeMatrixObject } | TypeMatrixArray
  // | [
  //   TypeEquationPhrase,
  //   TypeEquationPhrase,
  //   string,
  //   ?number,
  // ]
  | Array<TypeEquationPhrase>
  | DiagramElementPrimitive
  | DiagramElementCollection
  | Elements
  | Element;

/* eslint-enable no-use-before-define */
export type TypeFracObject = {
  numerator: TypeEquationPhrase;
  denominator: TypeEquationPhrase;
  symbol: string;
  scale?: number;
  numeratorSpace?: number;
  denominatorSpace?: number;
  overhang?: number;
  offsetY?: number;
};
export type TypeFracArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  string,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeContainerObject = {
  content: TypeEquationPhrase,
  width?: number,
  descent?: number,
  ascent?: number,
  xAlign?: 'left' | 'center' | 'right' | number,
  yAlign?: 'bottom' | 'middle' | 'top' | 'baseline' | number,
  fit?: 'width' | 'height' | 'contain',
  scale?: number,
};

export type TypeContainerArray = [
  TypeEquationPhrase,
  number,
  number,
  number,
  'left' | 'center' | 'right' | number,
  'bottom' | 'middle' | 'top' | 'baseline' | number,
  'width' | 'height' | 'contain',
  number,
];

export type TypeScaleObject = {
  content: TypeEquationPhrase,
  scale?: number,
};

export type TypeScaleArray = [
  TypeEquationPhrase,
  ?number,
];

export type TypeRootObject = {
  content: TypeEquationPhrase;
  root: TypeEquationPhrase;
  symbol?: string;
  contentSpace?: ?({
      left: ?number,
      right: ?number,
      top: ?number,
      bottom: ?number,
    } | Point | [number, number] | number),
  rootSpace?: number,
  rootScale?: number,
};
export type TypeRootArray = [
  TypeEquationPhrase,
  string,
  ?TypeEquationPhrase,
  // ?number,    // line width
  // ?number,    // start width
  // ?number,    // start height
  ?({
      left: ?number,
      right: ?number,
      top: ?number,
      bottom: ?number,
    } | Point | [number, number] | number),    // content space
  ?number,    // root space
  ?number,    // root scale
];
export type TypeStrikeObject = {
  content: TypeEquationPhrase;
  symbol: string;
  inSize?: boolean;
};
export type TypeBoxObject = {
  content: TypeEquationPhrase,
  symbol: string,
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  rightSpace?: number,
  bottomSpace?: number,
  leftSpace?: number,
};
export type TypeStrikeArray = [
  TypeEquationPhrase,
  string,
  ?boolean,
];
export type TypeBoxArray = [
  TypeEquationPhrase,
  string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeBarObject = {
  content: TypeEquationPhrase;
  // comment?: TypeEquationPhrase;
  symbol?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  space?: number,
  overhang?: number,
  length?: number,
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
  inSize?: boolean,
}

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
]

export type TypeBracketObject = {
  content: TypeEquationPhrase;
  left?: string;
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
};
export type TypeBracketArray = [
  TypeEquationPhrase,
  ?string,
  ?string,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeIntegralObject = {
  symbol?: string,
  content?: TypeEquationPhrase;
  inSize?: boolean,
  space?: number,
  topSpace?: number,
  bottomSpace?: number,
  height?: number,
  yOffset?: number,
  scale?: number,
};
export type TypeIntegralArray = [
  ?string,
  TypeEquationPhrase,
  ?boolean,
  ?number,
  ?number,
  ?number,
  ?number,
  ?number,
];

export type TypeLimitsIntegralObject = {
  symbol?: string,
  content?: TypeEquationPhrase;
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
  limitsPosition?: 'side' | 'top' | 'topCenter',
};
export type TypeLimitsIntegralArray = [
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
  ?number,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
  'side' | 'top' | 'topCenter',
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
];

export type TypeSubObject = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  scale?: number,
  bias?: TypeParsablePoint,
};
export type TypeSubArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
];
export type TypeSupObject = {
  content: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number,
  bias?: TypeParsablePoint,
};
export type TypeSupArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
];
export type TypeSupSubObject = {
  content: TypeEquationPhrase;
  subscript: TypeEquationPhrase;
  superscript: TypeEquationPhrase;
  scale?: number;
  superscriptBias?: TypeParsablePoint;
  subscriptBias?: TypeParsablePoint;
};
export type TypeSupSubArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  TypeEquationPhrase,
  ?number,
  ?TypeParsablePoint,
  ?TypeParsablePoint,
];

export type TypeCommentObject = {
  content: TypeEquationPhrase;
  comment: TypeEquationPhrase;
  symbol?: string;
  contentSpace?: number;
  commentSpace?: number;
  scale?: number;
};
export type TypeCommentArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  string,
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
};

export type TypeMatrixArray = [
  [number, number],
  string,
  TypeEquationPhrase,
  string,
  number,
  'max' | 'min',
  TypeParsablePoint,
  'baseline' | 'middle',
  TypeBracketObject,
];

export type TypeAnnotationObject = {
  annotation: TypeEquationPhrase,
  relativeToContent: [
    'left' | 'right' | 'center' | number,
    'bottom' | 'top' | 'middle' | 'baseline' | number,
  ],
  relativeToAnnotation: [
    'left' | 'right' | 'center' | number,
    'bottom' | 'top' | 'middle' | 'baseline' | number,
  ],
  scale?: number,
  xOffset?: number,
  yOffset?: number,
};
export type TypeAnnotationArray = [
  TypeEquationPhrase,
  'left' | 'right' | 'center' | number,
  'bottom' | 'top' | 'middle' | 'baseline' | number,
  'left' | 'right' | 'center' | number,
  'bottom' | 'top' | 'middle' | 'baseline' | number,
  ?number,
  ?number,
  ?number,
];
export type TypeAnnotateObject = {
  content: TypeEquationPhrase,                              // $FlowFixMe
  withAnnotations: Array<TypeEquationPhrase | AnnotationInformation>
                  | AnnotationInformation | TypeEquationPhrase,
  inSize?: boolean,
};
export type TypeAnnotateArray = [
  TypeEquationPhrase,
  Array<TypeEquationPhrase>,
  ?boolean,
];

// There are lots of FlowFixMes in this file. This is not perfect, but
// haven't been able to come up with a quick work around. The problem statement
// is each function can accept as arguements either a full object definition
// or the definition split over parameters.
// The problem is then the first arguement can be so many types, some of which
// are subsets of the other, then when its parameters are extracted, their type
// is all confused.
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
      content.forEach((c) => {       // $FlowFixMe
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
    if (name === 'frac') { return this.frac(params); }        // $FlowFixMe
    if (name === 'strike') { return this.strike(params); }    // $FlowFixMe
    if (name === 'box') { return this.box(params); }    // $FlowFixMe
    if (name === 'root') { return this.root(params); }    // $FlowFixMe
    if (name === 'brac') { return this.brac(params); }        // $FlowFixMe
    if (name === 'sub') { return this.sub(params); }          // $FlowFixMe
    if (name === 'sup') { return this.sup(params); }          // $FlowFixMe
    if (name === 'supSub') { return this.supSub(params); }    // $FlowFixMe
    if (name === 'topBar') { return this.topBar(params); }    // $FlowFixMe
    if (name === 'bottomBar') { return this.bottomBar(params); } // $FlowFixMe
    if (name === 'annotate') { return this.annotate(params); }  // $FlowFixMe
    if (name === 'annotation') { return this.annotation(params); } // $FlowFixMe
    if (name === 'bottomComment') { return this.bottomComment(params); } // $FlowFixMe
    if (name === 'topComment') { return this.topComment(params); } // $FlowFixMe
    if (name === 'bar') { return this.bar(params); }               // $FlowFixMe
    if (name === 'topStrike') { return this.topStrike(params); }   // $FlowFixMe
    if (name === 'bottomStrike') { return this.bottomStrike(params); } // $FlowFixMe
    if (name === 'pad') { return this.pad(params); }   // $FlowFixMe
    if (name === 'intLimits') { return this.intLimits(params); }   // $FlowFixMe
    if (name === 'int') { return this.int(params); }   // $FlowFixMe
    if (name === 'sumOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'prodOf') { return this.sumProd(params); }   // $FlowFixMe
    if (name === 'matrix') { return this.matrix(params); }   // $FlowFixMe
    if (name === 'scale') { return this.scale(params); }   // $FlowFixMe
    if (name === 'container') { return this.container(params); }  // $FlowFixMe
    if (name === 'ann') { return this.ann(params); }
    // if (name === 'annBrac') { return this.annBrac(params); }
    // Add container - where you fix the ascent, descent, and width
    // (content is centered in width) - Content spills out of container by default
    return null;
  }

  container(
    optionsOrArray: TypeContainerObject | TypeContainerArray,
  ) {
    let content;
    let scale;
    let fit; // fits content to container - width, height, contain, null
    let width;
    let ascent;
    let descent;
    let xAlign; // left, center, right, multiplier (to left)
    let yAlign; // bottom, baseline, middle, top, multiplier (to bottom)

    const defaultOptions = {
      scaleModifier: 1,
      fit: null,
      width: null,
      ascent: null,
      descent: null,
      xAlign: 'center',
      yAlign: 'baseline',
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
      ] = optionsOrArray;
    } else {
      ({
        content, width, descent, ascent, xAlign, yAlign, fit, scale,
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

    if (Array.isArray(optionsOrArray)) {
      [
        content, left, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight, minContentDescent, height, descent,
      ] = optionsOrArray;
    } else {
      ({
        content, left, right, inSize, insideSpace, outsideSpace,
        topSpace, bottomSpace, minContentHeight,
        minContentDescent, height, descent,
      } = optionsOrArray);
    }
    const defaultOptions = {
      insideSpace: 0.03,
      outsideSpace: 0,
      topSpace: 0.05,
      bottomSpace: 0.05,
      minContentHeight: null,
      minContentDescent: null,
      descent: null,
      height: null,
      inSize: true,
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
    return this.ann({
      content,
      glyphs,
      inSize,
      leftSpace: options.outsideSpace,
      rightSpace: options.outsideSpace,
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
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, overhang,
        length, left, right, top,
        bottom, side,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, space, overhang,
        length, left, right, top,
        bottom, inSize, side, minContentHeight, minContentDescent,
        minContentAscent, descent,
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
    return this.ann({
      content,
      glyphs,
      inSize,
      // leftSpace: options.outsideSpace,
      // rightSpace: options.outsideSpace,
    });
  }


  ann(optionsIn: {
    content: ElementInterface,
    annotation?: TypeAnnotation,
    annotations?: Array<TypeAnnotation>,
    glyphs?: {
      encompass: {
        symbol: string,
        annotations?: Array<TypeAnnotation>,
        space?: number;
        topSpace?: number;
        leftSpace?: number;
        bottomSpace?: number;
        rightSpace?: number;
      },
      left: {
        symbol: string,
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
      },
      right: {
        symbol: string,
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
      },
      top: {
        symbol: string,
        annotations?: Array<TypeAnnotation>,
        space?: number;
        overhang?: number,
        width?: number,
        leftSpace?: number,
        rightSpace?: number,
      },
      bottom: {
        symbol: string,
        annotations?: Array<TypeAnnotation>,
        space?: number;
        overhang?: number,
        width?: number,
        leftSpace?: number,
        rightSpace?: number,
      },
    },
    inSize?: boolean,
    useFullContent?: boolean,
    space?: number,
    topSpace?: number,
    bottomSpace?: number,
    leftSpace?: number,
    rightSpace?: number,
  }) {
    const defaultOptions = {
      inSize: true,
      useFullContent: false,
      space: 0,
      encompass: {
        space: 0,
      },
      left: {
        space: 0,
        overhang: 0,
      },
      right: {
        space: 0,
        overhang: 0,
      },
      top: {
        space: 0,
        overhang: 0,
      },
      bottom: {
        space: 0,
        overhang: 0,
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
    };
    let annotationsToUse = [];
    if (annotation != null) {
      annotationsToUse.push(annotation);
    } else if (annotations != null) {
      annotationsToUse = annotations;
    }

    const fillAnnotation = (ann) => {
      /* eslint-disable no-param-reassign */
      if (ann.xPosition == null) {
        ann.xPosition = defaultAnnotation.xPosition;
      }
      if (ann.yPosition == null) {
        ann.yPosition = defaultAnnotation.yPosition;
      }
      if (ann.xAlign == null) {
        ann.xAlign = defaultAnnotation.xAlign;
      }
      if (ann.yAlign == null) {
        ann.yAlign = defaultAnnotation.yAlign;
      }
      if (ann.offset == null) {
        ann.offset = defaultAnnotation.offset;
      }
      if (ann.scale == null) {
        ann.scale = defaultAnnotation.scale;
      }
      if (ann.inSize == null) {
        ann.inSize = defaultAnnotation.inSize;
      }
      ann.content = this.contentToElement(ann.content);
      /* eslint-enable no-param-reassign */
    };

    const fillAnnotations = (anns) => {
      if (anns == null || !Array.isArray(anns)) {
        return;
      }
      anns.forEach((ann) => {
        fillAnnotation(ann);
      });
    };
    fillAnnotations(annotationsToUse);

    const glyphsToUse = {};
    if (glyphs != null && glyphs.encompass != null) {
      glyphsToUse.encompass = {};
      fillAnnotations(glyphs.encompass.annotations);
      glyphsToUse.encompass = {};
      fillAnnotations(glyphs.encompass.annotations);
      joinObjects(glyphsToUse.encompass, defaultOptions.encompass, glyphs.encompass);
      glyphsToUse.encompass.annotations = glyphs.encompass.annotations || [];
      glyphsToUse.encompass.glyph = this.getExistingOrAddSymbol(glyphs.encompass.symbol);
    }
    if (glyphs != null && glyphs.left != null) {
      glyphsToUse.left = {};
      fillAnnotations(glyphs.left.annotations);
      joinObjects(glyphsToUse.left, defaultOptions.left, glyphs.left);
      glyphsToUse.left.annotations = glyphs.left.annotations || [];
      glyphsToUse.left.glyph = this.getExistingOrAddSymbol(glyphs.left.symbol);
    }

    if (glyphs != null && glyphs.right != null) {
      glyphsToUse.right = {};
      fillAnnotations(glyphs.right.annotations);
      joinObjects(glyphsToUse.right, defaultOptions.right, glyphs.right);
      glyphsToUse.right.annotations = glyphs.right.annotations || [];
      glyphsToUse.right.glyph = this.getExistingOrAddSymbol(glyphs.right.symbol);
    }

    if (glyphs != null && glyphs.top != null) {
      glyphsToUse.top = {};
      fillAnnotations(glyphs.top.annotations);
      joinObjects(glyphsToUse.top, defaultOptions.top, glyphs.top);
      glyphsToUse.top.annotations = glyphs.top.annotations || [];
      glyphsToUse.top.glyph = this.getExistingOrAddSymbol(glyphs.top.symbol);
    }

    if (glyphs != null && glyphs.bottom != null) {
      glyphsToUse.bottom = {};
      fillAnnotations(glyphs.bottom.annotations);
      joinObjects(glyphsToUse.bottom, defaultOptions.bottom, glyphs.bottom);
      glyphsToUse.bottom.annotations = glyphs.bottom.annotations || [];
      glyphsToUse.bottom.glyph = this.getExistingOrAddSymbol(glyphs.bottom.symbol);
    }
    const options = joinObjects(defaultOptions, optionsIn);
    return new BaseAnnotationFunction(  // $FlowFixMe
      this.contentToElement(content),
      annotationsToUse,
      glyphsToUse,
      options,
    );
  }


  scale(
    optionsOrArray: TypeScaleObject | TypeScaleArray,
  ) {
    let content;
    let scale;
    const defaultOptions = {
      scaleModifier: 1,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, scale,
      ] = optionsOrArray;
    } else {
      ({
        content, scale,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Scale(
      [this.contentToElement(content)],
      [],
      options,
    );
  }

  frac(
    optionsOrArray: TypeFracObject | TypeFracArray,
  ) {
    let numerator;
    let denominator;
    let symbol;
    let scale;
    let overhang;
    let numeratorSpace;
    let denominatorSpace;
    let offsetY;

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
    };
    if (Array.isArray(optionsOrArray)) {
      [
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY,
      ] = optionsOrArray;
    } else {
      ({
        numerator, symbol, denominator, scale,
        numeratorSpace, denominatorSpace, overhang,
        offsetY,
      } = optionsOrArray);
    }
    const optionsIn = {
      scaleModifier: scale,
      overhang,
      numeratorSpace,
      denominatorSpace,
      offsetY,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return new Fraction(
      [this.contentToElement(numerator), this.contentToElement(denominator)],       // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),
      options,
    );
  }

  root(
    optionsOrNum: TypeRootObject | TypeRootArray | TypeEquationPhrase,
    sym: string | null = null,
    rootIn: TypeEquationPhrase | null = null,
    contentSpaceIn: ?({
      left: ?number,
      right: ?number,
      top: ?number,
      bottom: ?number,
    } | Point | [number, number] | number) = null,
    rootSpaceIn: ?number = null,
    rootScaleIn: ?number = null,
  ) {
    let content;
    let root;
    let symbol;
    let contentSpace;
    let rootSpace;
    let rootScale;

    if (!(sym == null && root == null)) {
      content = optionsOrNum;
      root = rootIn;
      symbol = sym;
      contentSpace = contentSpaceIn;
      rootSpace = rootSpaceIn;
      rootScale = rootScaleIn;
    } else if (Array.isArray(optionsOrNum)) {
      [                                                  // $FlowFixMe
        content, symbol, root,                           // $FlowFixMe
        contentSpace, rootSpace, rootScale,
      ] = optionsOrNum;
    } else {
      ({                                            // $FlowFixMe
        content, symbol, root,
        // lineWidth, startWidth, startHeight,    // $FlowFixMe
        contentSpace, rootSpace, rootScale,
      } = optionsOrNum);
    }
    const f = new Root(                         // $FlowFixMe
      this.contentToElement(content),             // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),     // $FlowFixMe
      this.contentToElement(root),           // $FlowFixMe
      contentSpace,           // $FlowFixMe
      rootSpace,           // $FlowFixMe
      rootScale,
    );
    return f;
  }

  supSub(
    optionsOrContent: TypeSupSubObject | TypeSupSubArray | TypeEquationPhrase,
    sup: TypeEquationPhrase | null = null,
    sub: TypeEquationPhrase | null = null,
    scriptScale: number | null = null,
    supBias: TypeParsablePoint | null = null,
    subBias: TypeParsablePoint | null = null,
  ) {
    let content;
    let superscript = null;
    let subscript = null;
    let scale = null;
    let subscriptBias = null;
    let superscriptBias = null;
    if (!(sup == null && sub == null && scriptScale == null)) {
      content = optionsOrContent;
      superscript = sup;
      subscript = sub;
      scale = scriptScale;
      subscriptBias = subBias;
      superscriptBias = supBias;
    } else if (Array.isArray(optionsOrContent)) {           // $FlowFixMe
      [content, superscript, subscript, scale, superscriptBias, subscriptBias] = optionsOrContent;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, subscript, scale, superscriptBias, subscriptBias,
      } = optionsOrContent);
    }

    subscriptBias = subscriptBias == null ? null : parsePoint(
    // $FlowFixMe
      subscriptBias, new Point(0, 0),
    );

    superscriptBias = superscriptBias == null ? null : parsePoint(
      // $FlowFixMe
      superscriptBias, new Point(0, 0),
    );

    return new SuperSub(                                    // $FlowFixMe
      this.contentToElement(content),                       // $FlowFixMe
      this.contentToElement(superscript),                   // $FlowFixMe
      this.contentToElement(subscript),                     // $FlowFixMe
      scale,
      superscriptBias,
      subscriptBias,
    );
  }

  sup(
    optionsOrContent: TypeSupObject | TypeSupArray | TypeEquationPhrase,
    sup: TypeEquationPhrase | null = null,
    scriptScale: number | null = null,
    scriptBias: TypeParsablePoint | null = null,
  ) {
    let content;
    let superscript = null;
    let scale = null;
    let superscriptBias = null;
    if (!(sup == null && scriptScale == null && scriptBias == null)) {
      content = optionsOrContent;
      superscript = sup;
      scale = scriptScale;
      superscriptBias = scriptBias;
    } else if (Array.isArray(optionsOrContent)) {           // $FlowFixMe
      [content, superscript, scale, superscriptBias] = optionsOrContent;
    } else {
      ({                                                    // $FlowFixMe
        content, superscript, scale, superscriptBias,
      } = optionsOrContent);
    }

    superscriptBias = superscriptBias == null ? null : parsePoint(
      // $FlowFixMe
      superscriptBias, new Point(0, 0),
    );

    return new SuperSub(                                    // $FlowFixMe
      this.contentToElement(content),                       // $FlowFixMe
      this.contentToElement(superscript),
      null,                                                 // $FlowFixMe
      scale,
      superscriptBias,
      null,
    );
  }

  sub(
    optionsOrContent: TypeSubObject | TypeSubArray | TypeEquationPhrase,
    sub: TypeEquationPhrase | null = null,
    scriptScale: number | null = null,
    scriptBias: TypeParsablePoint | null = null,
  ) {
    let content;
    let subscript = null;
    let scale = null;
    let subscriptBias = null;
    if (!(sub == null && scriptScale == null && scriptBias == null)) {
      content = optionsOrContent;
      subscript = sub;
      scale = scriptScale;
      subscriptBias = scriptBias;
    } else if (Array.isArray(optionsOrContent)) {           // $FlowFixMe
      [content, subscript, scale, subscriptBias] = optionsOrContent;
    } else {
      ({                                                    // $FlowFixMe
        content, subscript, scale, subscriptBias,
      } = optionsOrContent);
    }

    subscriptBias = subscriptBias == null ? null : parsePoint(  // $FlowFixMe
      subscriptBias, new Point(0, 0),
    );

    return new SuperSub(                                    // $FlowFixMe
      this.contentToElement(content),
      null,                                                 // $FlowFixMe
      this.contentToElement(subscript),                     // $FlowFixMe
      scale,
      null,
      subscriptBias,
    );
  }

  strike(
    optionsOrContent: TypeStrikeObject | TypeStrikeArray | TypeEquationPhrase,
    sym: string | null = null,
    inSizeIn: boolean | null = null,
    // options: TypeStrikeObject | TypeStrikeArray) {
  ) {
    let content;
    let symbol;
    let inSize;
    if (!(sym == null && inSizeIn == null)) {
      content = optionsOrContent;
      symbol = sym;
      inSize = inSizeIn;
    } else if (Array.isArray(optionsOrContent)) {         // $FlowFixMe
      [content, symbol, inSize] = optionsOrContent;
    } else {
      ({                                                  // $FlowFixMe
        content, symbol, inSize,
      } = optionsOrContent);
    }
    return new Strike(                                    // $FlowFixMe
      this.contentToElement(content),                     // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),           // $FlowFixMe
      inSize,
    );
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
    const defaultOptions = {
      inSize: false,
      space: 0,
      topSpace: null,
      bottomSpace: null,
      leftSpace: null,
      rightSpace: null,
    };
    if (Array.isArray(optionsOrArray)) {
      [
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space, topSpace,
        rightSpace, bottomSpace, leftSpace,
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
    };
    const optionsToUse = joinObjects(defaultOptions, optionsIn);
    return new Box(
      [this.contentToElement(content)],
      this.getExistingOrAddSymbol(symbol),
      optionsToUse,
    );
  }


  annotate(
    optionsOrContent: TypeAnnotateObject
                      | TypeAnnotateArray                 // $FlowFixMe
                      | TypeEquationPhrase,               // $FlowFixMe
    withAnnotationsArray: Array<TypeEquationPhrase | AnnotationInformation>
                        | AnnotationInformation | TypeEquationPhrase | null = null,
    inSizeCalc: boolean | null = null,
  ) {
    let content;
    let withAnnotations;
    // let withAnnotation;
    let inSize;
    if (!(withAnnotationsArray == null && inSizeCalc == null)) {
      content = optionsOrContent;
      withAnnotations = withAnnotationsArray;
      inSize = inSizeCalc;
    } else if (Array.isArray(optionsOrContent)) {
      [content, withAnnotations, inSize] = optionsOrContent;
    } else {
      ({                                                    // $FlowFixMe
        content, withAnnotations, inSize,
      } = optionsOrContent);
      // console.log(withAnnotation)
      // if (withAnnotation != null) {
      //   withAnnotations = withAnnotation;
      // }
    }
    let annotations;
    // Case of single annotation in array form or array of annotations
    if (Array.isArray(withAnnotations)) {
      annotations = withAnnotations.map(
        (annotation) => {
          // annotation is an already instantiated AnnotationInformation
          if (annotation instanceof AnnotationInformation) {
            return annotation;
          }       // $FlowFixMe
          const parsedContent = this.parseContent(annotation);
          // case that annotation is a method object
          if (parsedContent instanceof AnnotationInformation) {
            return parsedContent;
          }
          // Case of single annotation in array form
          if (Array.isArray(annotation)) {
            const annotationFromArray = this.annotation(annotation);
            if (annotationFromArray instanceof AnnotationInformation) {
              return annotationFromArray;
            }
          }
          return null;
        },
      );
      // Case of single annotation in array form
      if (annotations[0] === null) {                           // $FlowFixMe
        annotations = [this.annotation(withAnnotations)];
      }
    // Case of annotation as a Method Object, Method Array or
    // AnnotationInformation instantiation
    } else if (withAnnotations != null) {
      if (withAnnotations instanceof AnnotationInformation) {
        annotations = [withAnnotations];
      } else {
        const parsedContent = this.parseContent(withAnnotations);
        // Method Object
        if (parsedContent instanceof AnnotationInformation) {
          annotations = [parsedContent];
        // Array form only
        } else {
          annotations = [this.annotation(withAnnotations)];
        }
      }
    }
    let inSizeToUse = true;
    if (inSize != null) {
      inSizeToUse = inSize;
    }
    return new Annotation(               // $FlowFixMe
      this.contentToElement(content),    // $FlowFixMe
      annotations,                       // $FlowFixMe
      inSizeToUse,
    );
  }

  annotation(
    optionsOrAnnotation: TypeAnnotationObject | TypeAnnotationArray | TypeEquationPhrase,
    positionRelativeToContentH: 'left' | 'right' | 'center' | number | null = null,
    positionRelativeToContentV: 'bottom' | 'top' | 'middle' | 'baseline' | number | null = null,
    positionRelativeToAnnotationH: 'left' | 'right' | 'center' | number | null = null,
    positionRelativeToAnnotationV: 'bottom' | 'top' | 'middle' | 'baseline' | number | null = null,
    annotationScale: number | null = null,
    xOffsetIn: number | null = null,
    yOffsetIn: number | null = null,
  ) {
    let annotation;
    let relativeToContentH;
    let relativeToContentV;
    let relativeToAnnotationH;
    let relativeToAnnotationV;
    let scale;
    let xOffset;
    let yOffset;
    if (!(positionRelativeToContentH == null
          && positionRelativeToContentV == null
          && positionRelativeToAnnotationH == null
          && positionRelativeToAnnotationV == null
          && annotationScale == null
          && xOffsetIn == null
          && yOffsetIn == null)
    ) {
      annotation = optionsOrAnnotation;
      relativeToContentH = positionRelativeToContentH;
      relativeToContentV = positionRelativeToContentV;
      relativeToAnnotationH = positionRelativeToAnnotationH;
      relativeToAnnotationV = positionRelativeToAnnotationV;
      scale = annotationScale;
      xOffset = xOffsetIn;
      yOffset = yOffsetIn;
    } else if (Array.isArray(optionsOrAnnotation)) {
      [   // $FlowFixMe
        annotation, relativeToContentH, relativeToContentV,   // $FlowFixMe
        relativeToAnnotationH, relativeToAnnotationV, scale,  // $FlowFixMe
        xOffset, yOffset,
      ] = optionsOrAnnotation;
    } else {
      let relativeToContent;
      let relativeToAnnotation;
      ({                                                      // $FlowFixMe
        annotation, relativeToContent, relativeToAnnotation, scale, // $FlowFixMe
        xOffset, yOffset,
      } = optionsOrAnnotation);
      [relativeToContentH, relativeToContentV] = relativeToContent;
      [relativeToAnnotationH, relativeToAnnotationV] = relativeToAnnotation;
    }

    let scaleToUse = 0.6;
    if (scale != null) {
      scaleToUse = scale;
    }
    return new AnnotationInformation(           // $FlowFixMe
      this.contentToElement(annotation),        // $FlowFixMe
      relativeToContentH,                       // $FlowFixMe
      relativeToContentV,                       // $FlowFixMe
      relativeToAnnotationH,                    // $FlowFixMe
      relativeToAnnotationV,                    // $FlowFixMe
      scaleToUse,                               // $FlowFixMe
      xOffset,                                  // $FlowFixMe
      yOffset,
    );
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
    return new Padding(
      this.contentToElement(content),
      [],
      options,
    );
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
    const defaultOptions = {
      space: [0.05, 0.05],
      fit: 'min',
      contentScale: 0.7,
      brac: {},
      vAlign: 'baseline',
    };
    if (Array.isArray(optionsOrArray)) {
      [
        order, left, content, right,
        scale, fit, space, vAlign, brac,
      ] = optionsOrArray;
    } else {
      ({
        order, left, content, right,
        scale, fit, space, vAlign, brac,
      } = optionsOrArray);
    }
    const optionsIn = {
      space,
      fit,
      order,
      contentScale: scale,
      brac,
      vAlign,
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
      options.space = parsePoint(options.space);
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
    optionsOrArray: TypeIntegralObject | TypeIntegralArray,
  ) {
    let content;
    let symbol;
    let space;
    let topSpace;
    let bottomSpace;
    let height;
    let yOffset;
    let inSize;
    let scale;
    const defaultOptions = {
      space: 0.05,
      topSpace: 0.07,
      bottomSpace: 0.07,
      height: null,
      yOffset: 0,
      inSize: true,
      contentScale: 1,
      fromScale: 1,
      toScale: 1,
      fromSpace: 0,
      toSpace: 0,
      fromOffset: [0, 0],
      toOffset: [0, 0],
      limitsPosition: 'side',
    };
    if (Array.isArray(optionsOrArray)) {
      [
        symbol, content, inSize, space,
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset, scale,
      ] = optionsOrArray;
    } else {
      ({
        content, symbol, inSize, space,
        topSpace, bottomSpace,
        height, yOffset,
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
    };
    const options = joinObjects({}, defaultOptions, optionsIn);

    let symbolToUse = null;
    if (symbol != null) {
      symbolToUse = this.getExistingOrAddSymbol(symbol);
    }
    const contentArray = [];
    if (content != null) {
      contentArray.push(this.contentToElement(content));
    }

    return new Integral(
      contentArray,
      symbolToUse,
      options,
    );
  }

  intLimits(
    optionsOrArray: TypeLimitsIntegralObject | TypeLimitsIntegralArray | TypeEquationPhrase,
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
    let limitsPosition;
    let limitsAroundContent;
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
      fromSpace: 0.04,
      toSpace: 0.04,
      fromOffset: [0, 0],
      toOffset: [0, 0],
      limitsPosition: 'side',
      limitsAroundContent: true,
    };
    if (Array.isArray(optionsOrArray)) {
      [                                                    // $FlowFixMe
        symbol, content, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset, scale,                            // $FlowFixMe
        fromScale, toScale, fromSpace, toSpace,            // $FlowFixMe
        fromOffset, toOffset, limitsPosition, limitsAroundContent,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, symbol, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset,                                   // $FlowFixMe
        scale, fromScale, toScale, fromSpace, toSpace,     // $FlowFixMe
        fromOffset, toOffset, limitsPosition, limitsAroundContent,
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
      limitsPosition,
      limitsAroundContent,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.fromOffset = parsePoint(options.fromOffset);
    options.toOffset = parsePoint(options.toOffset);
    let symbolToUse = null;
    if (symbol != null) {                                    // $FlowFixMe
      symbolToUse = this.getExistingOrAddSymbol(symbol);
    }
    const contentArray = [];
    if (content != null) {                           // $FlowFixMe
      contentArray.push(this.contentToElement(content));
    }
    if (from != null) {                              // $FlowFixMe
      contentArray.push(this.contentToElement(from));
    }
    if (to != null) {                                // $FlowFixMe
      contentArray.push(this.contentToElement(to));
    }

    return new Integral(
      contentArray,
      symbolToUse,
      options,
    );
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
    };
    if (Array.isArray(optionsOrArray)) {
      [
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset, scale,
        fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        symbol, content, from, to, inSize, space,
        topSpace, bottomSpace,
        height, yOffset,
        scale, fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
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
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    options.fromOffset = parsePoint(options.fromOffset);
    options.toOffset = parsePoint(options.toOffset);
    let symbolToUse = null;
    if (symbol != null) {
      symbolToUse = this.getExistingOrAddSymbol(symbol);
    }
    const contentArray = [];
    if (content != null) {
      contentArray.push(this.contentToElement(content));
    }
    if (from != null) {
      contentArray.push(this.contentToElement(from));
    }
    if (to != null) {
      contentArray.push(this.contentToElement(to));
    }

    return new SumProd(
      contentArray,
      symbolToUse,
      options,
    );
  }

  bracLegacy(
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

    if (Array.isArray(optionsOrArray)) {
      [
        content, left, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight, minContentDescent, height, descent,
      ] = optionsOrArray;
    } else {
      ({
        content, left, right, inSize, insideSpace, outsideSpace,
        topSpace, bottomSpace, minContentHeight,
        minContentDescent, height, descent,
      } = optionsOrArray);
    }
    let leftBracket = null;
    if (left != null) {
      leftBracket = this.getExistingOrAddSymbol(left);
    }
    let rightBracket = null;
    if (right != null) {
      rightBracket = this.getExistingOrAddSymbol(right);
    }
    const contentArray = [];
    if (content != null) {
      contentArray.push(this.contentToElement(content));
    }
    const defaultOptions = {
      insideSpace: 0.03,
      outsideSpace: 0,
      topSpace: 0.05,
      bottomSpace: 0.05,
      minContentHeight: null,
      minContentDescent: null,
      descent: null,
      height: null,
      inSize: true,
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
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    return new Brackets(
      contentArray,
      [leftBracket, rightBracket],
      options,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processComment(
    optionsOrArray: TypeBracketObject | TypeBracketArray,
  ) {
    let content;
    let comment;
    let symbol;
    let contentSpace;
    let commentSpace;
    let scale;
    let inSize;
    if (Array.isArray(optionsOrArray)) {
      [content, comment, symbol, contentSpace, commentSpace, scale, inSize,
      ] = optionsOrArray;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, contentSpace, commentSpace, scale, inSize,
      } = optionsOrArray);
    }
    const optionsIn = {
      contentSpace,
      commentSpace,
      scale,
      inSize,
    };
    const defaultOptions = {
      contentSpace: 0.03,
      commentSpace: 0.03,
      scale: 0.6,
      inSize: true,
    };

    const options = joinObjects(defaultOptions, optionsIn);
    return [
      content, comment, symbol,
      options.contentSpace, options.commentSpace, options.scale,
      options.inSize,
    ];
  }

  // $FlowFixMe
  bottomComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize,
    ] = this.processComment(...args);
    let contentToUse;
    if (symbol) {
      contentToUse = new Bar(
        [this.contentToElement(content)],
        this.getExistingOrAddSymbol(symbol),
        {
          side: 'bottom',
          space: contentSpaceToUse,
          inSize,
        },
      );
    } else {
      contentToUse = this.pad({
        content,
        bottom: contentSpaceToUse + commentSpaceToUse,
      });
    }
    return this.annotate({
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'bottom'],
          relativeToAnnotation: ['center', 'top'],
          scale: scaleToUse,
          yOffset: -commentSpaceToUse,
        }),
      ],
      inSize,
    });
  }

  // $FlowFixMe
  topComment(...args) {
    const [
      content, comment, symbol,
      contentSpaceToUse, commentSpaceToUse, scaleToUse,
      inSize,
    ] = this.processComment(...args);
    let contentToUse;
    if (symbol) {
      contentToUse = new Bar(
        [this.contentToElement(content)],
        this.getExistingOrAddSymbol(symbol),
        {
          side: 'top',
          space: contentSpaceToUse,
          inSize,
        },
      );
    } else {
      contentToUse = this.pad({
        content,
        top: contentSpaceToUse + commentSpaceToUse,
      });
    }
    return this.annotate({
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'top'],
          relativeToAnnotation: ['center', 'bottom'],
          scale: scaleToUse,
          yOffset: commentSpaceToUse,
        }),
      ],
      inSize,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  processStrike(
    optionsOrContent: TypeBracketObject | TypeBracketArray | TypeEquationPhrase,
    commentString: TypeEquationPhrase | null = null,
    sym: string | null = null,
    comSpace: number | null = null,
    comScale: number | null = null,
  ) {
    let content;
    let comment;
    let symbol;
    let space;
    let scale;
    if (!(commentString == null
      && sym == null
      && comSpace == null
      && comScale == null)
    ) {
      content = optionsOrContent;
      comment = commentString;
      symbol = sym;
      space = comSpace;
      scale = comScale;
    } else if (Array.isArray(optionsOrContent)) {             // $FlowFixMe
      [content, comment, symbol, space, scale] = optionsOrContent;
    } else {
      ({                                                      // $FlowFixMe
        content, comment, symbol, space, scale,
      } = optionsOrContent);
    }
    let spaceToUse = 0.1;
    if (space != null) {
      spaceToUse = space;
    }
    let scaleToUse = 0.5;
    if (scale != null) {
      scaleToUse = scale;
    }
    return [
      content, comment, symbol,
      spaceToUse, scaleToUse,
    ];
  }

  // $FlowFixMe
  topStrike(...args) {
    const [
      content, comment, symbol,
      spaceToUse, scaleToUse,
    ] = this.processStrike(...args);
    let contentToUse;
    if (symbol) {
      contentToUse = new Strike(                             // $FlowFixMe
        this.contentToElement(content),             // $FlowFixMe
        this.getExistingOrAddSymbol(symbol),
        false,                                               // $FlowFixMe
        spaceToUse,
      );
    } else {
      contentToUse = content;
    }
    return this.annotate({                                   // $FlowFixMe
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'top'],
          relativeToAnnotation: ['center', 'bottom'],
          scale: scaleToUse,
        }),
      ],
    });
  }

  // $FlowFixMe
  bottomStrike(...args) {
    const [
      content, comment, symbol,
      spaceToUse, scaleToUse,
    ] = this.processStrike(...args);
    let contentToUse;
    if (symbol) {
      contentToUse = new Strike(                             // $FlowFixMe
        this.contentToElement(content),             // $FlowFixMe
        this.getExistingOrAddSymbol(symbol),
        false,                                               // $FlowFixMe
        spaceToUse,
      );
    } else {
      contentToUse = content;
    }
    return this.annotate({                                   // $FlowFixMe
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'bottom'],
          relativeToAnnotation: ['center', 'top'],
          scale: scaleToUse,
        }),
      ],
    });
  }
}
