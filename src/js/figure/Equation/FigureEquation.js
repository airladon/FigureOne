// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect,
} from '../../tools/g2';
import {
  FigureElementCollection,
} from '../Element';
import { joinObjects } from '../../tools/tools';
import DrawContext2D from '../DrawContext2D';
import { Equation } from './Equation';
import type { EQN_Equation } from './Equation';
import type { TypeNavigatorOptions } from '../FigureCollections/EqnNavigator';
import EqnNavigator from '../FigureCollections/EqnNavigator';

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
      inSize?: boolean;
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
      inSize?: boolean;
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

export default class FigureEquation {
  webgl: Array<WebGLInstance>;
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
    options: EQN_Equation,
  ) {
    const equation = new Equation(this.shapes, options);
    return equation;
  }

  addEquation(
    parent: FigureElementCollection,
    name: string,
    options: EQN_Equation = {},
  ) {
    // $FlowFixMe
    const equation = new Equation(this.shapes, options);
    parent.add(name, equation);
    return equation;
  }

  addNavigator(
    parent: FigureElementCollection,
    name: string,
    options: TypeNavigatorOptions,
  ) {
    let navNameToUse = name;
    const optionsToUse = joinObjects({}, options);
    if (optionsToUse.equation == null) {                // $FlowFixMe
      const equation = this.addEquation(parent, `${name}Eqn`, options);
      optionsToUse.equation = equation;
      navNameToUse = `${name}Nav`;
    } else if (!(optionsToUse.equation instanceof Equation)) {
      // let methodPathToUse;
      let nameToUse;
      // let pathToUse;
      let eqnOptions;
      let elementModsToUse;
      // let addElementsToUse;
      let firstScenario;
      if (Array.isArray(optionsToUse.equation)) {
        [, nameToUse, , eqnOptions,
          elementModsToUse, , firstScenario,
        ] = optionsToUse.equation;
      } else {
        nameToUse = optionsToUse.equation.name;
        // pathToUse = optionsToUse.equation.path;
        eqnOptions = optionsToUse.equation.options;
        // methodPathToUse = optionsToUse.equation.method;
        elementModsToUse = optionsToUse.equation.mods;
        firstScenario = optionsToUse.equation.scenario;
      }

      let equation;
      if (Array.isArray(eqnOptions)) {
        equation = this.addEquation(parent, nameToUse, ...eqnOptions);
      } else {
        equation = this.addEquation(parent, nameToUse, eqnOptions);
      }

      if (elementModsToUse != null && elementModsToUse !== {}) {
        equation.setProperties(elementModsToUse);
      }
      if (firstScenario != null && firstScenario in equation.scenarios) {
        equation.setScenario(firstScenario);
      }
      optionsToUse.equation = equation;
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
