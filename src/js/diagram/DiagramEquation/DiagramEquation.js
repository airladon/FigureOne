// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect,
} from '../../tools/g2';
import {
  DiagramElementCollection,
} from '../Element';
import { joinObjects } from '../../tools/tools';
import DrawContext2D from '../DrawContext2D';
import { EquationNew } from '../DiagramElements/Equation/Equation';
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

  equation(
    options: TypeEquationOptions,
  ) {
    const equation = new EquationNew(this.shapes, options);
    return equation;
  }

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
}
