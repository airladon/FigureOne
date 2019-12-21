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
import { BlankElement, Element, Elements } from './Elements/Element';
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
  | [
    TypeEquationPhrase,
    TypeEquationPhrase,
    string,
    ?number,
  ]
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
};
export type TypeFracArray = [
  TypeEquationPhrase,
  TypeEquationPhrase,
  string,
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
  content: TypeEquationPhrase;
  symbol: string;
  inSize?: boolean;
  space?: ?([number, number] | Point | number) ;
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
  ?([number, number] | Point | number),
];

export type TypeBarObject = {
  content: TypeEquationPhrase;
  // comment?: TypeEquationPhrase;
  symbol?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  insideSpace?: number,
  // outsideSpace?: number,    // Only used if a comment exists
  barOverhang?: number,
  barLength?: number,     // prioritized over barOverhang
  minLeft?: number,  // If minLeft and minRight are specified, overwrites length
  minRight?: number,
  minAscent?: number, // If ascent and descent are specified, overwrites length
  minDescent?: number,
  inSize?: boolean
}

export type TypeBarArray = [
  TypeEquationPhrase,
  ?string,
  ?number,
  ?number,
  ?number,     // prioritized over barOverhang
  ?number,  // If minLeft and minRight are specified, overwrites length
  ?number,
  ?number, // If ascent and descent are specified, overwrites length
  ?number,
  ?boolean,
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
    if (typeof content === 'string') {
      return this.stringToElement(content);
    }
    if (Array.isArray(content)) {
      let elementArray = [];
      content.forEach((c) => {
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
    // If it is not a known function, then it must be a new text or symbol element
    const elem = this.addElementFromKey(method, params);
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
    if (name === 'matrix') { return this.matrix(params); }
    // Add container - where you fix the ascent, descent, and width
    // (content is centered in width) - Content spills out of container by default
    return null;
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
        numerator, symbol, denominator, scale,       // $FlowFixMe
        numeratorSpace, denominatorSpace, overhang,  // $FlowFixMe
        offsetY,
      ] = optionsOrArray;
    } else {
      ({
        numerator, symbol, denominator, scale,      // $FlowFixMe
        numeratorSpace, denominatorSpace, overhang, // $FlowFixMe
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
    return new Fraction(                         // $FlowFixMe
      [this.contentToElement(numerator), this.contentToElement(denominator)],       // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),
      options,
    );
    // if (scale != null) {                            // $FlowFixMe
    //   f.scaleModifier = scale;
    // }
    // return f;
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
      this.contentToElement(superscript),                   // $FlowFixMe
      null,                                                 // $FlowFixMe
      scale,                                                // $FlowFixMe
      superscriptBias,                                      // $FlowFixMe
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
      this.contentToElement(content),                       // $FlowFixMe
      null,                                                 // $FlowFixMe
      this.contentToElement(subscript),                     // $FlowFixMe
      scale,                                                // $FlowFixMe
      null,                                                 // $FlowFixMe
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
    optionsOrContent: TypeBoxObject | TypeBoxArray | TypeEquationPhrase,
    sym: string | null = null,
    boxInSize: boolean | null = null,
    spaceIn: ?([number, number] | Point | number) = null,
    // options: TypeStrikeObject | TypeStrikeArray) {
  ) {
    let content;
    let symbol;
    let inSize;
    let space;
    if (!(sym == null && boxInSize == null && spaceIn == null)) {
      content = optionsOrContent;
      symbol = sym;
      inSize = boxInSize;
      space = spaceIn;
    } else if (Array.isArray(optionsOrContent)) {         // $FlowFixMe
      [content, symbol, inSize, space] = optionsOrContent;
    } else {
      ({                                                  // $FlowFixMe
        content, symbol, inSize, space,
      } = optionsOrContent);
    }
    return new Box(                                       // $FlowFixMe
      this.contentToElement(content),                     // $FlowFixMe
      this.getExistingOrAddSymbol(symbol),           // $FlowFixMe
      inSize,                                             // $FlowFixMe
      space,
    );
  }


  annotate(
    optionsOrContent: TypeAnnotateObject
                      | TypeAnnotateArray
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
          }
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
        } else {                                                 // $FlowFixMe
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
      [
        annotation, relativeToContentH, relativeToContentV,   // $FlowFixMe
        relativeToAnnotationH, relativeToAnnotationV, scale,  // $FlowFixMe
        xOffset, yOffset,                                     // $FlowFixMe
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
    optionsOrContent: TypePaddingObject | TypePaddingArray
                      | TypeEquationPhrase,
    topPad: number | null = null,
    rightPad: number | null = null,
    bottomPad: number | null = null,
    leftPad: number | null = null,
  ) {
    let content;
    let top;
    let right;
    let bottom;
    let left;
    if (!(topPad == null
          && rightPad == null
          && leftPad == null
          && bottomPad == null)
    ) {
      content = optionsOrContent;
      top = topPad;
      left = leftPad;
      right = rightPad;
      bottom = bottomPad;
    } else if (Array.isArray(optionsOrContent)) {
      [                                                    // $FlowFixMe
        content, top, right, bottom, left,
      ] = optionsOrContent;
    } else {
      ({                                                   // $FlowFixMe
        content, top, right, bottom, left,
      } = optionsOrContent);
    }
    return new Padding(                                   // $FlowFixMe
      this.contentToElement(content),                     // $FlowFixMe
      top,                                                // $FlowFixMe
      right,                                              // $FlowFixMe
      bottom,                                             // $FlowFixMe
      left,
    );
  }

  topBar(optionsOrArray: TypeBarObject | TypeBarArray) {
    return this.bar(optionsOrArray, { side: 'top' });
  }

  bottomBar(optionsOrArray: TypeBarObject | TypeBarArray) {
    return this.bar(optionsOrArray, { side: 'bottom' });
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
    };
    if (Array.isArray(optionsOrArray)) {
      [                                                    // $FlowFixMe
        content, symbol, inSize, space, overhang,   // $FlowFixMe
        length, left, right, top,           // $FlowFixMe
        bottom, side,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, symbol, space, overhang,   // $FlowFixMe
        length, left, right, top,           // $FlowFixMe
        bottom, inSize, side,
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
    };
    const options = joinObjects({}, defaultOptions, optionsIn, forceOptions);
    let symbolToUse = null;
    if (symbol != null) {                                    // $FlowFixMe
      symbolToUse = this.getExistingOrAddSymbol(symbol);
    }

    return new Bar(                                         // $FlowFixMe
      [this.contentToElement(content)],
      symbolToUse,
      options,
    );
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
      [                                                    // $FlowFixMe
        order, left, content, right,                       // $FlowFixMe
        scale, fit, space, vAlign, brac,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        order, left, content, right,                       // $FlowFixMe
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
    if (content != null) {
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
      [                                                    // $FlowFixMe
        symbol, content, inSize, space,                    // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
        height, yOffset, scale,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, symbol, inSize, space,                    // $FlowFixMe
        topSpace, bottomSpace,                             // $FlowFixMe
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
    if (symbol != null) {                                    // $FlowFixMe
      symbolToUse = this.getExistingOrAddSymbol(symbol);
    }
    const contentArray = [];
    if (content != null) {                           // $FlowFixMe
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
      [                                                    // $FlowFixMe
        symbol, content, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,           // $FlowFixMe
        height, yOffset, scale,         // $FlowFixMe
        fromScale, toScale, fromSpace, toSpace, fromOffset, toOffset,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        symbol, content, from, to, inSize, space,          // $FlowFixMe
        topSpace, bottomSpace,           // $FlowFixMe
        height, yOffset,                // $FlowFixMe
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

    return new SumProd(
      contentArray,
      symbolToUse,
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
      [                                                    // $FlowFixMe
        content, left, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight, minContentDescent, height, descent,
      ] = optionsOrArray;
    } else {
      ({                                                   // $FlowFixMe
        content, left, right, inSize, insideSpace, outsideSpace,   // $FlowFixMe
        topSpace, bottomSpace, minContentHeight,           // $FlowFixMe
        minContentDescent, height, descent,
      } = optionsOrArray);
    }
    let leftBracket = null;
    if (left != null) {                                    // $FlowFixMe
      leftBracket = this.getExistingOrAddSymbol(left);
    }
    let rightBracket = null;
    if (right != null) {                                   // $FlowFixMe
      rightBracket = this.getExistingOrAddSymbol(right);
    }
    const contentArray = [];
    if (content != null) {                           // $FlowFixMe
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
    return new Brackets(                                // $FlowFixMe
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
    if (Array.isArray(optionsOrArray)) {             // $FlowFixMe
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
      contentToUse = new Bar(                                // $FlowFixMe
        [this.contentToElement(content)],             // $FlowFixMe
        this.getExistingOrAddSymbol(symbol),
        {
          side: 'bottom',                                   // $FlowFixMe
          space: contentSpaceToUse,                          // $FlowFixMe
          inSize,
        },
      );
    } else {
      contentToUse = this.pad(                               // $FlowFixMe
        content, 0, 0, contentSpaceToUse + commentSpaceToUse,
      );
    }
    return this.annotate({                                   // $FlowFixMe
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'bottom'],
          relativeToAnnotation: ['center', 'top'],
          scale: scaleToUse,                                // $FlowFixMe
          yOffset: -commentSpaceToUse,
        }),
      ],                                                    // $FlowFixMe
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
      contentToUse = new Bar(                                // $FlowFixMe
        [this.contentToElement(content)],             // $FlowFixMe
        this.getExistingOrAddSymbol(symbol),
        {
          side: 'top',                                   // $FlowFixMe
          space: contentSpaceToUse,                      // $FlowFixMe
          inSize,
        },
      );
    } else {
      contentToUse = this.pad(                               // $FlowFixMe
        content, contentSpaceToUse + commentSpaceToUse,
      );
    }
    return this.annotate({                                   // $FlowFixMe
      content: contentToUse,
      withAnnotations: [                                     // $FlowFixMe
        this.annotation({
          annotation: comment,
          relativeToContent: ['center', 'top'],
          relativeToAnnotation: ['center', 'bottom'],
          scale: scaleToUse,
          yOffset: commentSpaceToUse,
        }),
      ],                                                    // $FlowFixMe
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
        this.getExistingOrAddSymbol(symbol),            // $FlowFixMe
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
        this.getExistingOrAddSymbol(symbol),            // $FlowFixMe
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
