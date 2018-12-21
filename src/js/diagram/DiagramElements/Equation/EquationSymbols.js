// @flow
import {
  Point, Transform,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import DiagramPrimatives from '../../DiagramPrimatives/DiagramPrimatives';
import Integral from './Symbols/Integral';
// import SuperSub from './Elements/SuperSub';
import Bracket from './Symbols/Bracket';
import RoundedSquareBracket from './Symbols/RoundedSquareBracket';
import Bar from './Symbols/Bar';
import Brace from './Symbols/Brace';
import SquareBracket from './Symbols/SquareBracket';
// import { Annotation, AnnotationInformation } from './Elements/Annotation';

export default class EquationSymbols {
  shapes: DiagramPrimatives;
  defaultColor: Array<number>;

  constructor(
    shapes: DiagramPrimatives,
    defaultColor: Array<number>,
  ) {
    this.shapes = shapes;
    this.defaultColor = defaultColor;
  }

  get(
    name: string,
    options: {
      color?: Array<number>,
      numLines?: number,
      side?: 'left' | 'right' | 'bottom' | 'top',
    },
  ) {
    if (name === 'vinculum') {
      return this.vinculum(options);
    }
    if (name === 'strike') {
      return this.strike(options);
    }
    if (name === 'xStrike') {
      return this.xStrike(options);
    }
    if (name === 'integral') {
      return this.integral(options);
    }
    if (name === 'bracket') {
      return this.bracket(options);
    }
    if (name === 'squareBracket') {
      return this.squareBracket(options);
    }
    if (name === 'brace') {
      return this.brace(options);
    }
    if (name === 'bar') {
      return this.bar(options);
    }
    if (name === 'roundedSquareBracket') {
      return this.roundedSquareBracket(options);
    }
    return null;
  }

  vinculum(options: { color?: Array<number> } = {}) {
    let { color } = options;
    if (color == null) {
      color = this.defaultColor;
    }
    return this.shapes.horizontalLine(
      new Point(0, 0),
      1, 1, 0,
      color,
      new Transform('vinculum').scale(1, 1).translate(0, 0),
    );
  }

  strike(options: { color?: Array<number> } = {}) {
    let { color } = options;
    if (color == null) {
      color = this.defaultColor;
    }
    return this.shapes.horizontalLine(
      new Point(0, 0),
      1, 1, 0,
      color,
      new Transform('strike').scale(1, 1).rotate(0).translate(0, 0),
    );
  }

  xStrike(options: { color?: Array<number> } = {}) {
    let { color } = options;
    if (color == null) {
      color = this.defaultColor;
    }
    const cross = this.shapes.collection(new Transform('xStrike').scale(1, 1).rotate(0).translate(0, 0));
    cross.color = color;
    const strike1 = this.shapes.horizontalLine(
      new Point(0, 0),
      1, 1, 0,
      color,
      new Transform('strikeLine').scale(1, 1).rotate(0).translate(0, 0),
    );
    const strike2 = strike1._dup();
    cross.add('s1', strike1);
    cross.add('s2', strike2);
    return cross;
  }

  integral(options: { color?: Array<number>, numLines?: number}) {
    const defaultOptions = {
      color: this.defaultColor,
      numLines: 1,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new Integral(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.numLines,
      new Transform('integral').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }


  bracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    numLines?: number,
    color?: Array<number>,
  }) {
    const defaultOptions = {
      side: 'left',
      numLines: 1,
      color: this.defaultColor,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new Bracket(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.side,
      optionsToUse.numLines,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }


  bar(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    numLines?: number,
    color?: Array<number>,
  }) {
    const defaultOptions = {
      side: 'top',
      numLines: 1,
      color: this.defaultColor,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new Bar(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.side,
      optionsToUse.numLines,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }

  squareBracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    numLines?: number,
    color?: Array<number>,
  }) {
    const defaultOptions = {
      side: 'left',
      numLines: 1,
      color: this.defaultColor,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new SquareBracket(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.side,
      optionsToUse.numLines,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }

  brace(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    numLines?: number,
    color?: Array<number>,
  }) {
    const defaultOptions = {
      side: 'left',
      numLines: 1,
      color: this.defaultColor,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new Brace(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.side,
      optionsToUse.numLines,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }

  roundedSquareBracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    numLines?: number,
    color?: Array<number>,
  }) {
    const defaultOptions = {
      side: 'left',
      numLines: 1,
      color: this.defaultColor,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return new RoundedSquareBracket(
      this.shapes.webgl,
      optionsToUse.color,
      optionsToUse.side,
      optionsToUse.numLines,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
    );
  }
}
