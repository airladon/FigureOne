// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect, Point, Transform,
} from '../../tools/g2';
import {
  DiagramElementCollection,
} from '../Element';
import { joinObjects } from '../../tools/tools';
import DrawContext2D from '../DrawContext2D';
import {
  DiagramFont,
} from '../DrawingObjects/TextObject/TextObject';
import Integral from '../DiagramElements/Equation/Symbols/Integral';
import Bracket from '../DiagramElements/Equation/Symbols/Bracket';
import Bar from '../DiagramElements/Equation/Symbols/Bar';
import SquareBracket from '../DiagramElements/Equation/Symbols/SquareBracket';
import Brace from '../DiagramElements/Equation/Symbols/Brace';
import RoundedSquareBracket from '../DiagramElements/Equation/Symbols/RoundedSquareBracket';
import EquationForm from '../DiagramElements/Equation/EquationForm';
import {
  createEquationElements, Equation, getDiagramElement,
} from '../DiagramElements/Equation/GLEquation';
import { EquationNew } from '../DiagramElements/Equation/Equation';
import type {
  TypeHAlign, TypeVAlign,
} from '../DiagramElements/Equation/EquationForm';
import HTMLEquation from '../DiagramElements/Equation/HTMLEquation';
import type { TypeEquationOptions } from '../DiagramElements/Equation/Equation';
import type { TypeNavigatorOptions } from '../DiagramObjects/EqnNavigator';
import EqnNavigator from '../DiagramObjects/EqnNavigator';

export type TypeEquationPhrase =
  string
  | Array<string
    | TypeEquationPhrase
    | {                                 // Fraction and SmallFraction
      numerator: TypeEquationPhrase;
      denominator: TypeEquationPhrase;
      symbol: string;
      scaleModifier?: number;
    }
    | {                                 // Superscript and Subscript
      content: TypeEquationPhrase;
      subscript?: TypeEquationPhrase;
      superscript?: TypeEquationPhrase;
    }
    | {                                 // Strike
      content: TypeEquationPhrase;
      symbol: string;
      strikeInSize?: boolean;
    }
    | {                                 // Annotation
      content: TypeEquationPhrase;
      annotationArray: Array<{
        content: TypeEquationPhrase;
        xPosition?: 'left' | 'right' | 'center';
        yPosition?: 'bottom' | 'top' | 'middle' | 'baseline';
        xAlign?: 'left' | 'right' | 'center';
        yAlign?: 'bottom' | 'top' | 'middle' | 'baseline';
        scale?: number;
      }>;
      annotationInSize?: boolean;
    }
    | {                                 // Bracket
      content: TypeEquationPhrase;
      symbol: string;
      symbol: string;
      space?: number;
    }
    | {                                 // Top and Bottom Bar
      content: TypeEquationPhrase;
      symbol: string;
      space?: number;
      outsideSpace?: number;
    }
    | {                                 // Top and Bottom Comment
      content: TypeEquationPhrase;
      comment: TypeEquationPhrase;
      symbol: string;
      space?: number;
      outsideSpace?: number;
    }>;

export default class DiagramEquation {
  webgl: WebGLInstance;
  draw2D: DrawContext2D;
  limits: Rect;
  shapes: Object;
  animateNextFrame: () => void;

  constructor(
    shapes: Object,
    animateNextFrame: () => void,
  ) {
    this.webgl = shapes.webgl;
    this.draw2D = shapes.draw2D;
    this.limits = shapes.limits;
    this.shapes = shapes;
    this.animateNextFrame = animateNextFrame;
  }

  // // deprecate
  // elements(
  //   elems: Object,
  //   colorOrFont: Array<number> | DiagramFont = [],
  //   firstTransform: Transform = new Transform('elements'),
  // ): DiagramElementCollection {
  //   return createEquationElements(
  //     elems,
  //     this.draw2D,
  //     colorOrFont,
  //     this.limits,
  //     firstTransform,
  //   );
  // }

  // // deprecate
  // vinculum(color: Array<number> = [1, 1, 1, 1]) {
  //   return this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('vinculum').scale(1, 1).translate(0, 0),
  //   );
  // }

  // // deprecate
  // strike(color: Array<number> = [1, 1, 1, 1]) {
  //   return this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('strike').scale(1, 1).rotate(0).translate(0, 0),
  //   );
  // }

  // // deprecate
  // xStrike(color: Array<number> = [1, 1, 1, 1]) {
  //   const cross = this.shapes.collection(new Transform('strike').scale(1, 1).rotate(0).translate(0, 0));
  //   cross.color = color;
  //   const strike1 = this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('strike').scale(1, 1).rotate(0).translate(0, 0),
  //   );
  //   const strike2 = strike1._dup();
  //   cross.add('s1', strike1);
  //   cross.add('s2', strike2);
  //   return cross;
  // }

  // // deprecate
  // integral(
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new Integral(
  //     this.webgl,
  //     color,
  //     numLines,
  //     new Transform('integral').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // bracket(
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new Bracket(
  //     this.webgl,
  //     color,
  //     side,
  //     numLines,
  //     new Transform('bracket').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // bar(
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new Bar(
  //     this.webgl, color, side, numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // squareBracket(
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new SquareBracket(
  //     this.webgl, color, side, numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // brace(
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new Brace(
  //     this.webgl, color, side, numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // roundedSquareBracket(
  //   side: 'left' | 'right' | 'top' | 'bottom',
  //   numLines: number = 1,
  //   color: Array<number> = [1, 1, 1, 1],
  // ) {
  //   return new RoundedSquareBracket(
  //     this.webgl, color, side, numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.limits,
  //   );
  // }

  // // deprecate
  // // eslint-disable-next-line class-methods-use-this
  // make(equationCollection: DiagramElementCollection) {
  //   return new EquationForm(
  //     equationCollection.elements,
  //     {
  //       getAllElements: equationCollection.getAllElements.bind(equationCollection),
  //       hideAll: equationCollection.hideAll.bind(equationCollection),
  //       show: equationCollection.show.bind(equationCollection),
  //       showOnly: equationCollection.showOnly.bind(equationCollection),
  //       stop: equationCollection.stop.bind(equationCollection),
  //       getElementTransforms: equationCollection.getElementTransforms.bind(equationCollection),
  //       setElementTransforms: equationCollection.setElementTransforms.bind(equationCollection),
  //       animateToTransforms: equationCollection.animateToTransforms.bind(equationCollection),
  //     },
  //   );
  // }

  // // eslint-disable-next-line class-methods-use-this
  // makeHTML(id: string = '', classes: string | Array<string> = []) {
  //   return new HTMLEquation(id, classes);
  // }

  makeEqn() {                               // Deprecate
    return new Equation(
      this.draw2D,
      this.limits,
      // diagram.diagramToGLSpaceTransform,
    );
  }

  // makeDescription(id: string) {             // Deprecate
  //   return this.shapes.htmlElement(
  //     document.createElement('div'),
  //     id,
  //     'lesson__equation_description',
  //     new Point(0, 0), 'middle', 'left',
  //   );
  // }

  // eslint-disable-next-line class-methods-use-this
  // makeEqnFromOptions(...options: Array<{
  //   color?: Array<number>,
  //   position?: Point,
  //   currentForm?: string,
  //   addToCollection?: DiagramElementCollection;
  //   name?: string,
  //   elements: {
  //     [elementName: string]: string | {
  //       text: string,
  //       color?: Array<number>,
  //       isTouchable?: boolean,
  //       onClick?: () => void | null,
  //       direction?: '' | 'up' | 'left' | 'down' | 'right',
  //       mag?: number,
  //       drawPriority?: number,      // higher numbers are above lower numbers
  //       fontOrStyle?: DiagramFont | null,
  //       diagramElement: string | null,
  //       side?: 'up' | 'left' | 'down' | 'right',
  //       numLines?: number,
  //       diagramObj?: string,
  //     };
  //   };
  //   formAlignment?: {
  //     fixTo?: Point | string,
  //     scale?: number,
  //     alignH?: TypeHAlign | null,
  //     alignV?: TypeVAlign | null,
  //   },
  //   forms?: {
  //     // $FlowFixMe
  //     [formName: string]: TypeEquationArray | {
  //       content: TypeEquationArray,
  //       elementMods?: {
  //         [elementName: string]: {
  //           style?: 'linear' | 'curved',
  //           color?: Array<number>,
  //           direction?: '' | 'up' | 'left' | 'down' | 'right',
  //           mag?: number,
  //         }
  //       },
  //       type?: string,
  //       alignment?: {
  //         fixTo?: Point | string,
  //         scale?: number,
  //         alignH?: TypeHAlign | null,
  //         alignV?: TypeVAlign | null,
  //       },
  //     },
  //   },
  //   formSeries?: {
  //     [seriesName: string]: Array<string>,
  //   },
  // }>) {
  //   const eqn = this.makeEqn();
  //   const defaultOptions = {
  //     color: [0.5, 0.5, 0.5, 1],
  //     position: new Point(0, 0),
  //     currentForm: 'base',
  //     formAlignment: {
  //       fixTo: new Point(0, 0),
  //       scale: 0.7,
  //       alignH: 'left',     // applies to fixTo if fixTo is a DiagramElement
  //       alignV: 'baseline', // applies to fixTo if fixTo is a DiagramElement
  //     },
  //     elements: {},
  //     forms: {},
  //     formSeries: null,
  //   };
  //   const optionsToUse = joinObjects({}, defaultOptions, ...options);

  //   // Create Equation Elements
  //   const defElementOptions = {
  //     text: '',
  //     color: optionsToUse.color,
  //     isTouchable: false,
  //     onClick: null,
  //     direction: '',
  //     mag: 0,
  //     fontOrStyle: null,
  //     drawPriority: 1,
  //     diagramElement: null,
  //     side: 'left',
  //     numLines: 1,
  //   };
  //   Object.keys(optionsToUse.elements).forEach((elementName, index) => {
  //     const elementValue = optionsToUse.elements[elementName];
  //     let elementOptions;
  //     if (typeof elementValue === 'string') {
  //       elementOptions = joinObjects({}, defElementOptions, { text: elementValue });
  //     } else {
  //       elementOptions = joinObjects({}, defElementOptions, elementValue);
  //     }
  //     if (elementOptions.diagramObj != null) {
  //       let diagramElement;
  //       if (elementOptions.diagramObj === 'vinculum') {
  //         diagramElement = this.vinculum(elementOptions.color);
  //       }
  //       if (elementOptions.diagramObj === 'bracket') {
  //         diagramElement = this.bracket(
  //           elementOptions.side, elementOptions.numLines, elementOptions.color,
  //         );
  //       }
  //       if (elementOptions.diagramObj === 'brace') {
  //         diagramElement = this.brace(
  //           elementOptions.side, elementOptions.numLines, elementOptions.color,
  //         );
  //       }
  //       if (elementOptions.diagramObj === 'bar') {
  //         diagramElement = this.bar(
  //           elementOptions.side, elementOptions.numLines, elementOptions.color,
  //         );
  //       }
  //       if (elementOptions.diagramObj === 'squareBracket') {
  //         diagramElement = this.squareBracket(
  //           elementOptions.side, elementOptions.numLines, elementOptions.color,
  //         );
  //       }
  //       if (elementOptions.diagramObj === 'roundedSquareBracket') {
  //         diagramElement = this.roundedSquareBracket(
  //           elementOptions.side, elementOptions.numLines, elementOptions.color,
  //         );
  //       }
  //       if (elementOptions.diagramObj === 'strike') {
  //         diagramElement = this.strike(elementOptions.color);
  //       }
  //       if (elementOptions.diagramObj === 'xStrike') {
  //         diagramElement = this.xStrike(elementOptions.color);
  //       }
  //       if (elementOptions.diagramObj === 'integral') {
  //         diagramElement = this.integral(elementOptions.color);
  //       }
  //       if (diagramElement != null) {
  //         diagramElement.isTouchable = elementOptions.isTouchable;
  //         diagramElement.onClick = elementOptions.onClick;
  //         diagramElement.animate.transform.translation
  //           .options.direction = elementOptions.direction;
  //         diagramElement.animate.transform.translation
  //           .options.magnitude = elementOptions.mag;
  //         diagramElement.drawPriority = elementOptions.drawPriority;
  //         elementOptions = diagramElement;
  //       }
  //     }
  //     const elementObject = {};
  //     elementObject[elementName] = elementOptions;

  //     if (index === 0) {
  //       eqn.createElements(elementObject);
  //     } else {
  //       eqn.createElements(
  //         elementObject,
  //         [], null, new Point(0, 0),
  //         eqn.collection,
  //       );
  //     }
  //     eqn.collection.reorder();
  //   });

  //   // Create Equation Forms
  //   const defElementMods = {
  //     style: 'linear',
  //     color: defElementOptions.color,
  //     direction: defElementOptions.direction,
  //     mag: defElementOptions.mag,
  //   };
  //   const defForm = {
  //     alignment: defaultOptions.formAlignment,
  //     type: 'base',
  //     elementMods: {},
  //     animationTime: null,
  //     addToSeries: false,
  //   };
  //   const makePhrase = (phrase: TypeEquationArray) => {
  //     const out = [];
  //     if (typeof phrase === 'string') {
  //       return [phrase];
  //     }
  //     for (let i = 0; i < phrase.length; i += 1) {
  //       const element = phrase[i];
  //       if (typeof element === 'string') {
  //         if (element.startsWith('.') && i < phrase.length - 1) {
  //           if (element === '.frac') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [num, den, vinculum] = parameters;
  //               out.push(eqn.frac(  // $FlowFixMe
  //                 makePhrase(num),  // $FlowFixMe
  //                 makePhrase(den),  // $FlowFixMe
  //                 vinculum,
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { numerator, denominator, vinculum } = parameters;
  //               out.push(eqn.frac(
  //                 makePhrase(numerator),
  //                 makePhrase(denominator),
  //                 vinculum,
  //               ));
  //             }
  //           }
  //           if (element === '.sfrac') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [num, den, vinculum, scale] = parameters;
  //               out.push(eqn.sfrac(     // $FlowFixMe
  //                 makePhrase(num),      // $FlowFixMe
  //                 makePhrase(den),      // $FlowFixMe
  //                 vinculum,             // $FlowFixMe
  //                 scale,
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { numerator, denominator } = parameters;  // $FlowFixMe
  //               const { vinculum, scale } = parameters;
  //               out.push(eqn.sfrac(
  //                 makePhrase(numerator),
  //                 makePhrase(denominator),
  //                 vinculum,
  //                 scale,
  //               ));
  //             }
  //           }
  //           if (element === '.strike') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [content, strike, strikeInSize] = parameters;
  //               out.push(eqn.strike(                   // $FlowFixMe
  //                 makePhrase(content),              // $FlowFixMe
  //                 strike,
  //                 strikeInSize,
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { content, strike, strikeInSize } = parameters;  // $FlowFixMe
  //               out.push(eqn.strike(
  //                 makePhrase(content),                        // $FlowFixMe
  //                 strike,
  //                 strikeInSize,
  //               ));
  //             }
  //           }
  //           if (element === '.sub') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [content, subscript] = parameters;
  //               out.push(eqn.sub(                   // $FlowFixMe
  //                 makePhrase(content),              // $FlowFixMe
  //                 makePhrase(subscript),            // $FlowFixMe
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { content, subscript } = parameters;  // $FlowFixMe
  //               out.push(eqn.sub(
  //                 makePhrase(content),                        // $FlowFixMe
  //                 makePhrase(subscript),
  //               ));
  //             }
  //           }
  //           if (element === '.sup') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [content, superscript] = parameters;
  //               out.push(eqn.sup( // $FlowFixMe
  //                 makePhrase(content),  // $FlowFixMe
  //                 makePhrase(superscript),  // $FlowFixMe
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { content, superscript } = parameters;  // $FlowFixMe
  //               out.push(eqn.sup(
  //                 makePhrase(content),                        // $FlowFixMe
  //                 makePhrase(superscript),
  //               ));
  //             }
  //           }
  //           if (element === '.supsub') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [content, subscript, superscript] = parameters;
  //               out.push(eqn.supsub(        // $FlowFixMe
  //                 makePhrase(content),      // $FlowFixMe
  //                 makePhrase(subscript),    // $FlowFixMe
  //                 makePhrase(superscript),  // $FlowFixMe
  //               ));
  //             } else {
  //               // $FlowFixMe
  //               const { content, subscript, superscript } = parameters;  // $FlowFixMe
  //               out.push(eqn.supsub(
  //                 makePhrase(content),  // $FlowFixMe
  //                 makePhrase(subscript),  // $FlowFixMe
  //                 makePhrase(superscript),  // $FlowFixMe
  //               ));
  //             }
  //           }
  //           if (element === '.brac') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [content, left, right, space] = parameters;
  //               out.push(eqn.brac(      // $FlowFixMe
  //                 makePhrase(content),  // $FlowFixMe
  //                 left,                 // $FlowFixMe
  //                 right,                // $FlowFixMe
  //                 space,
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, left, right, space,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.brac(
  //                 makePhrase(content),          // $FlowFixMe
  //                 left,                         // $FlowFixMe
  //                 right,                        // $FlowFixMe
  //                 space,
  //               ));
  //             }
  //           }
  //           if (element === '.topComment') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                       // $FlowFixMe
  //                 content, comment, bar, space, outsideSpace,
  //               ] = parameters;
  //               out.push(eqn.topComment(      // $FlowFixMe
  //                 makePhrase(content),        // $FlowFixMe
  //                 makePhrase(comment),        // $FlowFixMe
  //                 bar,                        // $FlowFixMe
  //                 space,                      // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, comment, bar, space, outsideSpace,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.topComment(
  //                 makePhrase(content),          // $FlowFixMe
  //                 makePhrase(comment),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             }
  //           }
  //           if (element === '.bottomComment') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                         // $FlowFixMe
  //                 content, comment, bar, space, outsideSpace,
  //               ] = parameters;
  //               out.push(eqn.bottomComment(     // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 makePhrase(comment),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, comment, bar, space, outsideSpace,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.bottomComment(
  //                 makePhrase(content),          // $FlowFixMe
  //                 makePhrase(comment),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             }
  //           }
  //           if (element === '.topBar') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                         // $FlowFixMe
  //                 content, bar, space, outsideSpace,
  //               ] = parameters;
  //               out.push(eqn.topBar(     // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, bar, space, outsideSpace,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.topBar(
  //                 makePhrase(content),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             }
  //           }
  //           if (element === '.bottomBar') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                         // $FlowFixMe
  //                 content, bar, space, outsideSpace,
  //               ] = parameters;
  //               out.push(eqn.bottomBar(     // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, bar, space, outsideSpace,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.bottomBar(
  //                 makePhrase(content),          // $FlowFixMe
  //                 bar,                          // $FlowFixMe
  //                 space,                        // $FlowFixMe
  //                 outsideSpace,
  //               ));
  //             }
  //           }
  //           if (element === '.ann') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                         // $FlowFixMe
  //                 content, xPosition, yPosition, xAlign,  // $FlowFixMe
  //                 yAlign, annotationScale,
  //               ] = parameters;
  //               out.push(eqn.ann(               // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 xPosition,                    // $FlowFixMe
  //                 yPosition,                    // $FlowFixMe
  //                 xAlign,                       // $FlowFixMe
  //                 yAlign,                       // $FlowFixMe
  //                 annotationScale,              // $FlowFixMe
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, xPosition, yPosition, xAlign,  // $FlowFixMe
  //                 yAlign, annotationScale,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.ann(               // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 xPosition,                    // $FlowFixMe
  //                 yPosition,                    // $FlowFixMe
  //                 xAlign,                       // $FlowFixMe
  //                 yAlign,                       // $FlowFixMe
  //                 annotationScale,              // $FlowFixMe
  //               ));
  //             }
  //           }
  //           if (element === '.annotation') {
  //             const parameters = phrase[i + 1];
  //             if (Array.isArray(parameters)) {
  //               const [                         // $FlowFixMe
  //                 content, annotationArray, annotationInSize,
  //               ] = parameters;
  //               out.push(eqn.annotation(        // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 makePhrase(annotationArray),  // $FlowFixMe
  //                 annotationInSize,             // $FlowFixMe
  //               ));
  //             } else {
  //               const {                         // $FlowFixMe
  //                 content, annotationArray, annotationInSize,
  //               } = parameters;                 // $FlowFixMe
  //               out.push(eqn.annotation(        // $FlowFixMe
  //                 makePhrase(content),          // $FlowFixMe
  //                 makePhrase(annotationArray),  // $FlowFixMe
  //                 annotationInSize,             // $FlowFixMe
  //               ));
  //             }
  //           }
  //         } else {
  //           out.push(element);
  //         }
  //       }
  //     }
  //     return out;
  //   };

  //   Object.keys(optionsToUse.forms).forEach((name) => {
  //     const form = optionsToUse.forms[name];
  //     const formOptionsArray = [];
  //     if (Array.isArray(form)) {
  //       formOptionsArray.push(joinObjects({}, defForm, { content: form }));
  //     } else if (form.content == null) {
  //       Object.keys(form).forEach((formType) => {
  //         formOptionsArray.push(joinObjects(
  //           {}, defForm, form[formType], { type: formType },
  //         ));
  //       });
  //     } else {
  //       formOptionsArray.push(joinObjects({}, defForm, form));
  //     }
  //     formOptionsArray.forEach((formOptions) => {
  //       Object.keys(formOptions.elementMods).forEach((key) => {
  //         // eslint-disable-next-line no-param-reassign
  //         formOptions.elementMods[key] = joinObjects(
  //           {}, defElementMods,
  //           formOptions.elementMods[key],
  //         );
  //       });

  //       if (typeof formOptions.alignment.fixTo === 'string') {
  //         const elem = getDiagramElement(eqn.collection, formOptions.alignment.fixTo);
  //         if (elem != null) {
  //           eqn.formAlignment.fixTo = elem;
  //         }
  //       } else {
  //         eqn.formAlignment.fixTo = formOptions.alignment.fixTo;
  //       }
  //       eqn.formAlignment.hAlign = formOptions.alignment.hAlign;
  //       eqn.formAlignment.vAlign = formOptions.alignment.vAlign;
  //       eqn.formAlignment.scale = formOptions.alignment.scale;
  //       eqn.addForm(
  //         name,
  //         makePhrase(formOptions.content),
  //         {
  //           animationTime: formOptions.animationTime,
  //           elementMods: formOptions.elementMods,
  //           formType: formOptions.type,
  //           addToSeries: formOptions.addToSeries,
  //         },
  //       );
  //     });
  //   });

  //   if (optionsToUse.formSeries != null) {
  //     eqn.setFormSeries(optionsToUse.formSeries);
  //   }

  //   eqn.collection.setPosition(optionsToUse.position);
  //   eqn.setCurrentForm(optionsToUse.currentForm);
  //   const { addToCollection } = optionsToUse;
  //   if (addToCollection != null) {
  //     addToCollection.eqns[optionsToUse.name] = eqn;
  //     addToCollection.add(optionsToUse.name, eqn.collection);
  //   }
  //   eqn.formTypeOrder = ['rad', 'deg', 'base'];
  //   return eqn;
  // }

  addEquation(
    parent: DiagramElementCollection,
    name: string,
    options: TypeEquationOptions = {},
  ) {
    // $FlowFixMe
    const equation = new EquationNew(this.shapes, options);
    parent.add(name, equation);
    return equation;
  }

  addNavigator(
    parent: DiagramElementCollection,
    name: string,
    options: TypeNavigatorOptions,
  ) {
    let navNameToUse = name;
    const optionsToUse = joinObjects({}, options);
    if (optionsToUse.equation == null) {                // $FlowFixMe
      const equation = this.addEquation(parent, `${name}Eqn`, options);
      optionsToUse.equation = equation;
      navNameToUse = `${name}Nav`;
    }
    // $FlowFixMe
    const navigator = new EqnNavigator(
      this.shapes,
      this.animateNextFrame,
      optionsToUse,
    );
    parent.add(navNameToUse, navigator);
    return navigator;
  }

  // deprecate
  // Make an Equation Diagram Collection
  // eslint-disable-next-line class-methods-use-this
  // addEquationLegacy(
  //   parent: DiagramElementCollection, // Parent collection
  //   ...options: Array<{
  //     name: string,                   // Element name within parent collection
  //     color?: Array<number>,          // Default color for all elements
  //     position?: Point,               // Position of collection
  //     firstForm?: string | null,      // First form to set
  //     //
  //     elements: {                     // Elements to add to collection
  //       [elementName: string]: string | {
  //         // All
  //         color?: Array<number>,      // Color of element
  //         elementOptions?: {},        // Additional options for final element
  //         // Either
  //         text?: string,              // Text Element
  //         textOptions?: {
  //           fontOrStyle?: DiagramFont | null | 'italic' | 'normal',
  //         };
  //         // Or
  //         symbol?: string,            // Symbol Element
  //         symbolOptions?: {
  //           side?: 'up' | 'left' | 'down' | 'right',
  //           numLines?: number,
  //         },
  //       };
  //     };
  //     //
  //     defaultFormAlignment?: {               // Default form alignment
  //       fixTo?: Point | string,
  //       scale?: number,
  //       alignH?: TypeHAlign | null,
  //       alignV?: TypeVAlign | null,
  //     },
  //     //
  //     forms?: {                       // $FlowFixMe
  //       [formName: string]: TypeEquationArray | {
  //         content: TypeEquationArray,
  //         elementMods?: {
  //           [elementName: string]: {
  //             color?: Array<number>,
  //             direction: 'fromPrev' | 'fromNext' | 'fromAny' | null,
  //             elementOptions?: {},
  //           }
  //         },
  //         subForm?: string,
  //         alignment?: {
  //           fixTo?: Point | string,
  //           scale?: number,
  //           alignH?: TypeHAlign | null,
  //           alignV?: TypeVAlign | null,
  //         },
  //       },
  //     },
  //     //
  //     formSeries?: {
  //       [seriesName: string]: Array<string>,
  //     },
  //   }>
  // ) {
  //   const defaultEquationOptions = {
  //     color: [0.5, 0.5, 0.5, 1],
  //     position: new Point(0, 0),
  //     elements: {},
  //     //
  //     defaultFormAlignment: {
  //       fixTo: new Point(0, 0),
  //       scale: 0.7,
  //       alignH: 'left',     // applies to fixTo if fixTo is a DiagramElement
  //       alignV: 'baseline', // applies to fixTo if fixTo is a DiagramElement
  //     },
  //     forms: {},
  //     firstForm: null,
  //     formSeries: [],
  //   };

  //   const equationOptionsToUse = joinObjects({}, defaultEquationOptions, ...options);
  //   // $FlowFixMe
  //   const equation = new EquationNew(this.shapes, {
  //     defaultFormAlignment: equationOptionsToUse.defaultFormAlignment,
  //   });
  //   parent.add(equationOptionsToUse.name, equation);

  //   // Create Equation Elements
  //   const defEqnElementOptions = {
  //     color: equationOptionsToUse.color,
  //     elementOptions: {},
  //     //
  //     text: '',
  //     textOptions: {
  //       fontOrStyle: null,
  //     },
  //     symbol: null,
  //     symbolOptions: {
  //       side: 'left',
  //       numLines: 1,
  //     },
  //   };
  //   const { elements } = equationOptionsToUse;
  //   Object.keys(elements).forEach((elementName) => {
  //     const element = elements[elementName];
  //     let elementToAdd;
  //     let eqnElementOptions;
  //     // If element is defined as string, then it is a text element
  //     if (typeof element === 'string') {
  //       eqnElementOptions = joinObjects({}, defEqnElementOptions, { text: element });
  //     // Otherwise it's an object of options
  //     } else {
  //       eqnElementOptions = joinObjects({}, defEqnElementOptions, element);
  //     }
  //     // See if the eqnElementOptions object has a defined symbol. If it
  //     // does, then create the element.
  //     const { symbol } = eqnElementOptions;
  //     if (symbol != null) {
  //       const { color, numLines, side } = eqnElementOptions.symbolOptions;
  //       let diagramElement;
  //       if (symbol === 'vinculum') {
  //         diagramElement = this.vinculum(color);
  //       }
  //       if (symbol === 'bracket') {
  //         diagramElement = this.bracket(side, numLines, color);
  //       }
  //       if (symbol === 'brace') {
  //         diagramElement = this.brace(side, numLines, color);
  //       }
  //       if (symbol === 'bar') {
  //         diagramElement = this.bar(side, numLines, color);
  //       }
  //       if (symbol === 'squareBracket') {
  //         diagramElement = this.squareBracket(side, numLines, color);
  //       }
  //       if (symbol === 'roundedSquareBracket') {
  //         diagramElement = this.roundedSquareBracket(side, numLines, color);
  //       }
  //       if (symbol === 'strike') {
  //         diagramElement = this.strike(color);
  //       }
  //       if (symbol === 'xStrike') {
  //         diagramElement = this.xStrike(color);
  //       }
  //       if (symbol === 'integral') {
  //         diagramElement = this.integral(color);
  //       }
  //       if (diagramElement != null) {
  //         diagramElement.setProperties(eqnElementOptions.elementOptions);
  //         elementToAdd = diagramElement;
  //       }
  //     } else {
  //       elementToAdd = eqnElementOptions;
  //     }

  //     if (elementToAdd != null) {
  //       const elementObject = {};
  //       elementObject[elementName] = elementToAdd;
  //       equation.addElements(elementObject);
  //     }
  //   });
  //   equation.reorder();

  //   // Create Equation Forms
  //   const defElementMods = {
  //     color: equationOptionsToUse.color,
  //     elementOptions: {},
  //     // fromNext: {
  //     //   color: equationOptionsToUse.color,
  //     //   elementOptions: {},
  //     // },
  //     // fromPrev: {
  //     //   color: equationOptionsToUse.color,
  //     //   elementOptions: {},
  //     // },
  //     // color: equationOptionsToUse.color,
  //     // direction: null,                    // Will populate all from* options
  //     // elementOptions: {},
  //   };
  //   const defForm = {
  //     alignment: equationOptionsToUse.defaultFormAlignment,
  //     subForm: 'base',
  //     elementMods: {},
  //     animationTime: null,
  //     // addToSeries: false,
  //   };

  //   const makePhrase = (phrase: TypeEquationArray) => {
  //     const out = [];
  //     if (typeof phrase === 'string') {
  //       return [phrase];
  //     }
  //     for (let i = 0; i < phrase.length; i += 1) {
  //       const element = phrase[i];
  //       if (typeof element === 'string') {
  //         if (i < phrase.length - 1) {
  //           // eslint-disable-next-line
  //           const methodName = element;
  //           if (element === '.frac') {
  //             const parameters = phrase[i + 1];
  //             out.push(equation.eqn.functions.frac(parameters));
  //             i += 1;
  //           }
  //           // if (element === '.sfrac') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [num, den, vinculum, scale] = parameters;
  //           //     out.push(eqn.sfrac(     // $FlowFixMe
  //           //       makePhrase(num),      // $FlowFixMe
  //           //       makePhrase(den),      // $FlowFixMe
  //           //       vinculum,             // $FlowFixMe
  //           //       scale,
  //           //     ));
  //           //   } else {
  //           //     // $FlowFixMe
  //           //     const { numerator, denominator } = parameters;  // $FlowFixMe
  //           //     const { vinculum, scale } = parameters;
  //           //     out.push(eqn.sfrac(
  //           //       makePhrase(numerator),
  //           //       makePhrase(denominator),
  //           //       vinculum,
  //           //       scale,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.strike') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [content, strike, strikeInSize] = parameters;
  //           //     out.push(eqn.strike(                   // $FlowFixMe
  //           //       makePhrase(content),              // $FlowFixMe
  //           //       strike,
  //           //       strikeInSize,
  //           //     ));
  //           //   } else {
  //           //     // $FlowFixMe
  //           //     const { content, strike, strikeInSize } = parameters;  // $FlowFixMe
  //           //     out.push(eqn.strike(
  //           //       makePhrase(content),                        // $FlowFixMe
  //           //       strike,
  //           //       strikeInSize,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.sub') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [content, subscript] = parameters;
  //           //     out.push(eqn.sub(                   // $FlowFixMe
  //           //       makePhrase(content),              // $FlowFixMe
  //           //       makePhrase(subscript),            // $FlowFixMe
  //           //     ));
  //           //   } else {
  //           //     // $FlowFixMe
  //           //     const { content, subscript } = parameters;  // $FlowFixMe
  //           //     out.push(eqn.sub(
  //           //       makePhrase(content),                        // $FlowFixMe
  //           //       makePhrase(subscript),
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.sup') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [content, superscript] = parameters;
  //           //     out.push(eqn.sup( // $FlowFixMe
  //           //       makePhrase(content),  // $FlowFixMe
  //           //       makePhrase(superscript),  // $FlowFixMe
  //           //     ));
  //           //   } else {
  //           //     // $FlowFixMe
  //           //     const { content, superscript } = parameters;  // $FlowFixMe
  //           //     out.push(eqn.sup(
  //           //       makePhrase(content),                        // $FlowFixMe
  //           //       makePhrase(superscript),
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.supsub') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [content, subscript, superscript] = parameters;
  //           //     out.push(eqn.supsub(        // $FlowFixMe
  //           //       makePhrase(content),      // $FlowFixMe
  //           //       makePhrase(subscript),    // $FlowFixMe
  //           //       makePhrase(superscript),  // $FlowFixMe
  //           //     ));
  //           //   } else {
  //           //     // $FlowFixMe
  //           //     const { content, subscript, superscript } = parameters;  // $FlowFixMe
  //           //     out.push(eqn.supsub(
  //           //       makePhrase(content),  // $FlowFixMe
  //           //       makePhrase(subscript),  // $FlowFixMe
  //           //       makePhrase(superscript),  // $FlowFixMe
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.brac') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [content, left, right, space] = parameters;
  //           //     out.push(eqn.brac(      // $FlowFixMe
  //           //       makePhrase(content),  // $FlowFixMe
  //           //       left,                 // $FlowFixMe
  //           //       right,                // $FlowFixMe
  //           //       space,
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, left, right, space,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.brac(
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       left,                         // $FlowFixMe
  //           //       right,                        // $FlowFixMe
  //           //       space,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.topComment') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                       // $FlowFixMe
  //           //       content, comment, bar, space, outsideSpace,
  //           //     ] = parameters;
  //           //     out.push(eqn.topComment(      // $FlowFixMe
  //           //       makePhrase(content),        // $FlowFixMe
  //           //       makePhrase(comment),        // $FlowFixMe
  //           //       bar,                        // $FlowFixMe
  //           //       space,                      // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, comment, bar, space, outsideSpace,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.topComment(
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       makePhrase(comment),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.bottomComment') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                         // $FlowFixMe
  //           //       content, comment, bar, space, outsideSpace,
  //           //     ] = parameters;
  //           //     out.push(eqn.bottomComment(     // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       makePhrase(comment),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, comment, bar, space, outsideSpace,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.bottomComment(
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       makePhrase(comment),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.topBar') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                         // $FlowFixMe
  //           //       content, bar, space, outsideSpace,
  //           //     ] = parameters;
  //           //     out.push(eqn.topBar(     // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, bar, space, outsideSpace,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.topBar(
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.bottomBar') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                         // $FlowFixMe
  //           //       content, bar, space, outsideSpace,
  //           //     ] = parameters;
  //           //     out.push(eqn.bottomBar(     // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, bar, space, outsideSpace,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.bottomBar(
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       bar,                          // $FlowFixMe
  //           //       space,                        // $FlowFixMe
  //           //       outsideSpace,
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.ann') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                         // $FlowFixMe
  //           //       content, xPosition, yPosition, xAlign,  // $FlowFixMe
  //           //       yAlign, annotationScale,
  //           //     ] = parameters;
  //           //     out.push(eqn.ann(               // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       xPosition,                    // $FlowFixMe
  //           //       yPosition,                    // $FlowFixMe
  //           //       xAlign,                       // $FlowFixMe
  //           //       yAlign,                       // $FlowFixMe
  //           //       annotationScale,              // $FlowFixMe
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, xPosition, yPosition, xAlign,  // $FlowFixMe
  //           //       yAlign, annotationScale,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.ann(               // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       xPosition,                    // $FlowFixMe
  //           //       yPosition,                    // $FlowFixMe
  //           //       xAlign,                       // $FlowFixMe
  //           //       yAlign,                       // $FlowFixMe
  //           //       annotationScale,              // $FlowFixMe
  //           //     ));
  //           //   }
  //           // }
  //           // if (element === '.annotation') {
  //           //   const parameters = phrase[i + 1];
  //           //   if (Array.isArray(parameters)) {
  //           //     const [                         // $FlowFixMe
  //           //       content, annotationArray, annotationInSize,
  //           //     ] = parameters;
  //           //     out.push(eqn.annotation(        // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       makePhrase(annotationArray),  // $FlowFixMe
  //           //       annotationInSize,             // $FlowFixMe
  //           //     ));
  //           //   } else {
  //           //     const {                         // $FlowFixMe
  //           //       content, annotationArray, annotationInSize,
  //           //     } = parameters;                 // $FlowFixMe
  //           //     out.push(eqn.annotation(        // $FlowFixMe
  //           //       makePhrase(content),          // $FlowFixMe
  //           //       makePhrase(annotationArray),  // $FlowFixMe
  //           //       annotationInSize,             // $FlowFixMe
  //           //     ));
  //           //   }
  //           // }
  //         } else {
  //           out.push(element);
  //         }
  //       } else if (Array.isArray(element)) {
  //         out.push(element);
  //       } else {
  //         const methodName = Object.keys(element)[0];
  //         const methodParams = Object.values(element)[0];
  //         // $FlowFixMe
  //         if (equation.eqn.functions[methodName]) {
  //           // $FlowFixMe
  //           out.push(equation.eqn.functions[methodName](methodParams));
  //         }
  //       }
  //     }
  //     return out;
  //   };

  //   // Go through each form and create it
  //   Object.keys(equationOptionsToUse.forms).forEach((name) => {
  //     const form = equationOptionsToUse.forms[name];
  //     const formOptionsArray = [];
  //     // If the form is an array
  //     if (Array.isArray(form)) {
  //       formOptionsArray.push(joinObjects({}, defForm, { content: form }));
  //     // Otherwise if it's an object without a content field (meaning it's keys
  //     // will just be formTypes)
  //     } else if (form.content == null) {
  //       Object.keys(form).forEach((subForm) => {
  //         formOptionsArray.push(joinObjects(
  //           defForm, form[subForm], { subForm },
  //         ));
  //       });
  //     // Otherwise it's a form fully defined as an object
  //     } else {
  //       formOptionsArray.push(joinObjects({}, defForm, form));
  //     }
  //     // Populate the elementMods with default values when values are missing
  //     formOptionsArray.forEach((formOptions) => {
  //       Object.keys(formOptions.elementMods).forEach((key) => {
  //         // eslint-disable-next-line no-param-reassign
  //         formOptions.elementMods[key] = joinObjects(
  //           {},
  //           defElementMods,
  //           formOptions.elementMods[key],
  //         );
  //       });
  //       if (typeof formOptions.alignment.fixTo === 'string') {
  //         const elem = getDiagramElement(equation, formOptions.alignment.fixTo);
  //         if (elem != null) {
  //           equation.eqn.defaultFormAlignment.fixTo = elem;
  //         }
  //       } else {
  //         equation.eqn.defaultFormAlignment.fixTo = formOptions.alignment.fixTo;
  //       }
  //       equation.eqn.defaultFormAlignment.alignH = formOptions.alignment.alignH;
  //       equation.eqn.defaultFormAlignment.alignV = formOptions.alignment.alignV;
  //       equation.eqn.scale = formOptions.alignment.scale;
  //       equation.addForm(
  //         name, // $FlowFixMe
  //         makePhrase(formOptions.content),
  //         {
  //           animationTime: formOptions.animationTime,
  //           elementMods: formOptions.elementMods,
  //           subForm: formOptions.subForm,
  //           addToSeries: formOptions.addToSeries,
  //         },
  //       );
  //     });
  //   });

  //   // if (optionsToUse.formSeries != null) {
  //   //   eqn.setFormSeries(optionsToUse.formSeries);
  //   // }

  //   // eqn.collection.setPosition(optionsToUse.position);
  //   // eqn.setCurrentForm(optionsToUse.currentForm);
  //   // const { addToCollection } = optionsToUse;
  //   // if (addToCollection != null) {
  //   //   addToCollection.eqns[optionsToUse.name] = eqn;
  //   //   addToCollection.add(optionsToUse.name, eqn.collection);
  //   // }
  //   // eqn.formTypeOrder = ['rad', 'deg', 'base'];
  //   // return eqn;
  // }

  // fraction(...options: Array<{
  //     numerator?: string,
  //     denominotor?: string,
  //     color?: Array<number>,
  //     scale?: number,
  //   }>) {
  //   const defaultOptions = {
  //     numerator: '1',
  //     denominator: 'NOT DEFINED',
  //     color: [1, 0, 0, 1],
  //     scale: 0.5,
  //   };
  //   const optionsToUse = joinObjects({}, defaultOptions, ...options);

  //   const eqn = this.makeEqn();
  //   eqn.createElements({
  //     num: optionsToUse.numerator,
  //     den: optionsToUse.denominator,
  //     v: this.vinculum(optionsToUse.color),
  //   }, optionsToUse.color);
  //   eqn.formAlignment.hAlign = 'center';
  //   eqn.formAlignment.vAlign = 'baseline';
  //   eqn.formAlignment.scale = optionsToUse.scale;
  //   eqn.addForm('base', [eqn.frac('num', 'den', 'v')]);
  //   eqn.setCurrentForm('base');
  //   return eqn;
  // }

  // fractionPre(...options: Array<{
  //     numerator?: string,
  //     denominotor?: string,
  //     main?: string,
  //     color?: Array<number>,
  //     scale?: number,
  //     fracScale?: number,
  //   }>) {
  //   const defaultOptions = {
  //     numerator: '1',
  //     denominator: 'NOT DEFINED',
  //     main: 'NOT DEFINED',
  //     color: [1, 0, 0, 1],
  //     scale: 0.5,
  //     fracScale: 0.6,
  //   };
  //   const optionsToUse = joinObjects({}, defaultOptions, ...options);

  //   const eqn = this.makeEqn();
  //   eqn.createElements({
  //     num: optionsToUse.numerator,
  //     den: optionsToUse.denominator,
  //     main: optionsToUse.main,
  //     v: this.vinculum(optionsToUse.color),
  //   }, optionsToUse.color);
  //   eqn.formAlignment.hAlign = 'center';
  //   eqn.formAlignment.vAlign = 'baseline';
  //   eqn.formAlignment.scale = optionsToUse.scale;
  //   eqn.addForm('base', [eqn.sfrac('num', 'den', 'v', optionsToUse.fracScale), 'space', 'main']);
  //   eqn.setCurrentForm('base');
  //   return eqn;
  // }
}
