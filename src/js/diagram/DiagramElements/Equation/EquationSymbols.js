// @flow
import {
  Point, Transform,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import DiagramPrimitives from '../../DiagramPrimitives/DiagramPrimitives';
// import { DiagramElementCollection } from '../../Element';
import Integral from './Symbols/Integral';
// import SuperSub from './Elements/SuperSub';
import Bracket from './Symbols/Bracket';
import Box from './Symbols/Box';
import Radical from './Symbols/Radical';
import Brace from './Symbols/Brace';
import SquareBracket from './Symbols/SquareBracket';
// import SquareBracketNew from './Symbols/SquareBracketNew';
import Bar from './Symbols/Bar';
// import BracketNew from './Symbols/BracketNew';
// import BraceNew from './Symbols/BraceNew';

// import { Annotation, AnnotationInformation } from './Elements/Annotation';

export default class EquationSymbols {
  shapes: DiagramPrimitives;
  defaultColor: Array<number>;

  constructor(
    shapes: DiagramPrimitives,
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
      width?: number,
      fill?: boolean,
      staticSize?: ?(Point | [number, number] | number),
      startWidth?: number,
      lineWidth?: number,
      startHeight?: number,
      maxStartWidth?: ?number,
      maxStartHeight?: ?number,
      proportionalToHeight?: boolean,
      endLength?: number,
      sides?: number,
      tipWidth?: number,
      radius?: number,
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
    // if (name === 'bracketNew') {
    //   return this.bracketNew(options);
    // }
    if (name === 'squareBracket') {
      return this.squareBracket(options);
    }
    // if (name === 'squareBracketNew') {
    //   return this.squareBracketNew(options);
    // }
    if (name === 'brace') {
      return this.brace(options);
    }
    // if (name === 'braceNew') {
    //   return this.braceNew(options);
    // }
    if (name === 'bar') {
      return this.bar(options);
    }
    // if (name === 'barNew') {
    //   return this.barNew(options);
    // }
    // if (name === 'roundedSquareBracket') {
    //   return this.roundedSquareBracket(options);
    // }
    if (name === 'box') {
      return this.box(options);
    }
    if (name === 'radical') {
      return this.radical(options);
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

  box(optionsIn: {
    color?: Array<number>,
    fill?: boolean,
    width?: number,
    staticSize?: ?(Point | [number, number]),
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      fill: false,
      width: 0.01,
      staticSize: null,
    };
    const options = joinObjects(defaultOptions, optionsIn);
    return Box(this.shapes, options.color, options.fill, options.width, options.staticSize);
  }

  radical(optionsIn: {
    color?: Array<number>,
    lineWidth?: number,
    startHeight?: number,
    startWidth?: number,
    proportionalToHeight?: boolean,
    maxStartWidth?: ?number,
    maxStartHeight?: ?number,
    staticSize?: ?(Point | [number, number]),
  }) {
    const defaultOptions: {
      color: Array<number>,
      lineWidth: number,
      startHeight: number,
      startWidth: number,
      proportionalToHeight: boolean,
      maxStartWidth: ?number,
      maxStartHeight: ?number,
      staticSize: ?(Point | [number, number]),
    } = {
      color: this.defaultColor,
      lineWidth: 0.01,
      staticSize: null,
      startHeight: 0.5,
      startWidth: 0.7,
      maxStartWidth: 0.15,
      maxStartHeight: 0.15,
      proportionalToHeight: true,
    };
    if (optionsIn.proportionalToHeight != null
      && optionsIn.proportionalToHeight === false
    ) {
      defaultOptions.startHeight = 0.15;
      defaultOptions.startWidth = 0.15;
      defaultOptions.maxStartHeight = null;
      defaultOptions.maxStartWidth = null;
    }
    const options = joinObjects(defaultOptions, optionsIn);
    return Radical(
      this.shapes, options.color, options.lineWidth,
      options.startWidth, options.startHeight, options.proportionalToHeight,
      options.maxStartWidth, options.maxStartHeight,
      options.staticSize,
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


  // bracket(options: {
  //   side?: 'left' | 'right' | 'top' | 'bottom',
  //   numLines?: number,
  //   color?: Array<number>,
  // }) {
  //   const defaultOptions = {
  //     side: 'left',
  //     numLines: 1,
  //     color: this.defaultColor,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);
  //   return new Bracket(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     optionsToUse.side,
  //     optionsToUse.numLines,
  //     new Transform('bracket').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //   );
  // }

  // bar(options: {
  //   side?: 'left' | 'right' | 'top' | 'bottom',
  //   numLines?: number,
  //   color?: Array<number>,
  // }) {
  //   const defaultOptions = {
  //     side: 'top',
  //     numLines: 1,
  //     color: this.defaultColor,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);
  //   return new Bar(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     optionsToUse.side,
  //     optionsToUse.numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //   );
  // }

  bracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    width?: number,
    tipWidth?: number,
    staticSize?: boolean,
  }) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: 0.012,
      sides: 10,
      staticSize: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    if (optionsToUse.width == null) {
      optionsToUse.width = optionsToUse.lineWidth * 2.5;
    }
    if (optionsToUse.tipWidth == null) {
      optionsToUse.tipWidth = optionsToUse.lineWidth / 3;
    }
    return (new Bracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse.side,
      optionsToUse.staticSize,
      {
        sides: optionsToUse.sides,
        lineWidth: optionsToUse.lineWidth,
        width: optionsToUse.width,
        tipWidth: optionsToUse.tipWidth,
      },
    )).symbol;
  }

  brace(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    width?: number,
    tipWidth?: number,
    staticSize?: boolean,
  }) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: 0.012,
      sides: 10,
      staticSize: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    if (optionsToUse.width == null) {
      optionsToUse.width = optionsToUse.lineWidth * 4.2;
    }
    if (optionsToUse.tipWidth == null) {
      optionsToUse.tipWidth = optionsToUse.lineWidth / 3;
    }
    return (new Brace(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('brace').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse.side,
      optionsToUse.staticSize,
      {
        sides: optionsToUse.sides,
        lineWidth: optionsToUse.lineWidth,
        width: optionsToUse.width,
        tipWidth: optionsToUse.tipWidth,
      },
    )).symbol;
  }

  bar(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    staticSize?: ?boolean,
  }) {
    const defaultOptions = {
      side: 'left',
      lineWidth: 0.01,
      color: this.defaultColor,
      staticSize: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Bar(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse.side,
      optionsToUse.staticSize,
      {
        lineWidth: optionsToUse.lineWidth,
      },
    )).symbol;
  }

  squareBracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    endLength?: number,
    staticSize?: ?boolean,
    radius?: number,
    sides?: number,
  }) {
    const defaultOptions = {
      side: 'left',
      lineWidth: 0.01,
      color: this.defaultColor,
      endLength: 0.04,
      staticSize: null,
      radius: 0,
      sides: 5,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new SquareBracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse.side,
      optionsToUse.staticSize,
      {
        lineWidth: optionsToUse.lineWidth,
        endLength: optionsToUse.endLength,
        radius: optionsToUse.radius,
        sides: optionsToUse.sides,
      },
    )).symbol;
  }

  // squareBracket(options: {
  //   side?: 'left' | 'right' | 'top' | 'bottom',
  //   numLines?: number,
  //   color?: Array<number>,
  // }) {
  //   const defaultOptions = {
  //     side: 'left',
  //     numLines: 1,
  //     color: this.defaultColor,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);
  //   return new SquareBracket(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     optionsToUse.side,
  //     optionsToUse.numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //   );
  // }

  // brace(options: {
  //   side?: 'left' | 'right' | 'top' | 'bottom',
  //   numLines?: number,
  //   color?: Array<number>,
  // }) {
  //   const defaultOptions = {
  //     side: 'left',
  //     numLines: 1,
  //     color: this.defaultColor,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);
  //   return new Brace(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     optionsToUse.side,
  //     optionsToUse.numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //   );
  // }

  // roundedSquareBracket(options: {
  //   side?: 'left' | 'right' | 'top' | 'bottom',
  //   numLines?: number,
  //   color?: Array<number>,
  // }) {
  //   const defaultOptions = {
  //     side: 'left',
  //     numLines: 1,
  //     color: this.defaultColor,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);
  //   return new RoundedSquareBracket(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     optionsToUse.side,
  //     optionsToUse.numLines,
  //     new Transform('bar').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //   );
  // }
}
