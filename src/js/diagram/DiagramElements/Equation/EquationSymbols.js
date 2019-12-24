// @flow
import {
  Point, Transform,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import DiagramPrimitives from '../../DiagramPrimitives/DiagramPrimitives';
// import { DiagramElementCollection } from '../../Element';
// import Integral from './Symbols/Integral';
// import SuperSub from './Elements/SuperSub';
import Bracket from './Symbols/Bracket';
import Box from './Symbols/Box';
import Radical from './Symbols/Radical';
import Brace from './Symbols/Brace';
import SquareBracket from './Symbols/SquareBracket';
import AngleBracket from './Symbols/AngleBracket';
// import SquareBracketNew from './Symbols/SquareBracketNew';
import Bar from './Symbols/Bar';
import Sum from './Symbols/Sum';
import Product from './Symbols/Product';
// import SimpleIntegral from './Symbols/SimpleIntegral';
import Integral from './Symbols/Integral';
import Arrow from './Symbols/Arrow';
import VinculumNew from './Symbols/Vinculum';

// import BracketNew from './Symbols/BracketNew';
// import BraceNew from './Symbols/BraceNew';

// import { Annotation, AnnotationInformation } from './Elements/Annotation';
export type TypeSymbolOptions = {
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
  arrowWidth?: number,
  arrowHeight?: number,
}

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
    options: TypeSymbolOptions,
  ) {
    // if (name === 'vinculumOld') {
    //   return this.vinculum(options);
    // }
    if (name === 'vinculum') {         // $FlowFixMe
      return this.vinculum(options);
    }
    if (name === 'strike') {
      return this.strike(options);
    }
    if (name === 'xStrike') {
      return this.xStrike(options);
    }
    // if (name === 'integral') {
    //   return this.integral(options);
    // }
    if (name === 'bracket') {         // $FlowFixMe
      return this.bracket(options);
    }
    if (name === 'squareBracket') {         // $FlowFixMe
      return this.squareBracket(options);
    }
    if (name === 'brace') {         // $FlowFixMe
      return this.brace(options);
    }
    if (name === 'bar') {         // $FlowFixMe
      return this.bar(options);
    }
    if (name === 'box') {         // $FlowFixMe
      return this.box(options);
    }
    if (name === 'angleBracket') {         // $FlowFixMe
      return this.angleBracket(options);
    }
    if (name === 'radical') {         // $FlowFixMe
      return this.radical(options);
    }
    // if (name === 'simpleIntegral') {
    //   return this.simpleIntegral(options);
    // }
    if (name === 'sum') {         // $FlowFixMe
      return this.sum(options);
    }
    if (name === 'prod') {         // $FlowFixMe
      return this.product(options);
    }
    if (name === 'int') {         // $FlowFixMe
      return this.integral(options);
    }
    if (name === 'arrow') {         // $FlowFixMe
      return this.arrow(options);
    }
    return null;
  }

  // vinculumOld(options: { color?: Array<number> } = {}) {
  //   let { color } = options;
  //   if (color == null) {
  //     color = this.defaultColor;
  //   }
  //   return this.shapes.horizontalLine(
  //     new Point(0, 0),
  //     1, 1, 0,
  //     color,
  //     new Transform('vinculum').scale(1, 1).translate(0, 0),
  //   );
  // }

  vinculum(options: {
    color?: Array<number>,
    lineWidth?: number,
    draw?: 'static' | 'dynamic',
    staticWidth?: number | 'first',
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      staticHeight: null,          // not definable by user
      draw: 'dynamic',
      staticWidth: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new VinculumNew(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('ArrowSymbol').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  box(optionsIn: {
    color?: Array<number>,
    fill?: boolean,
    width?: number,
    height?: number,
    lineWidth?: number,
    draw?: 'static' | 'dynamic',
    staticWidth?: number | 'first',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      fill: false,
      width: null,
      height: null,
      lineWidth: 0.01,
      draw: 'dynamic',
      staticHeight: null,
      staticWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, optionsIn);
    return (new Box(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Box').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  // simpleIntegral(optionsIn: {
  //   color?: Array<number>,
  //   lineWidth?: number,
  //   staticSize?: ?(Point | [number, number]),
  // }) {
  //   const defaultOptions: {
  //     color: this.defaultColor,
  //     lineWidth: 0.01,
  //   }
  // }

  // simpleIntegral(options: {
  //   color?: Array<number>,
  //   lineWidth?: number,
  //   staticSize?: boolean,
  // }) {
  //   const defaultOptions = {
  //     color: this.defaultColor,
  //     lineWidth: 0.012,
  //     staticSize: null,
  //   };
  //   const optionsToUse = joinObjects(defaultOptions, options);

  //   return (new SimpleIntegral(
  //     this.shapes.webgl,
  //     optionsToUse.color,
  //     new Transform('brace').scale(1, 1).translate(0, 0),
  //     this.shapes.limits,
  //     optionsToUse,
  //   )).symbol;
  // }

  arrow(options: {
    color?: Array<number>,
    lineWidth?: number,
    arrowHeight?: number,
    arrowWidth?: number,
    draw?: 'static' | 'dynamic',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: 0.01,
      arrowWidth: 0.03,
      arrowHeight: 0.04,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Arrow(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('ArrowSymbol').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  sum(options: {
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    draw?: 'static' | 'dynamic',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      sides: 5,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return (new Sum(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('sum').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  product(options: {
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    draw?: 'static' | 'dynamic',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      sides: 5,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return (new Product(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Sum').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  integral(options: {
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    width?: ?number,
    tipWidth?: number,
    // percentage?: number,
    draw?: 'static' | 'dynamic',
    staticHeight?: number | 'first',
    serif?: boolean,
    num?: number,
    type?: 'line' | 'generic',
    serifSides?: number,
    lineIntegralSides?: number,
  }) {
    const defaultOptions = {
      color: this.defaultColor,
      lineWidth: null,
      width: null,
      tipWidth: null,
      percentage: 0.95,
      sides: 5,
      // staticSize: 'first',
      radius: 0.03,
      serif: true,
      staticHeight: 'first',
      draw: 'static',
      staticWidth: null,          // not definable by user
      num: 1,
      type: 'generic',
      serifSides: 10,
      lineIntegralSides: 20,
    };
    const optionsToUse = joinObjects(defaultOptions, options);

    return (new Integral(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('Integral').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      // optionsToUse.staticSize,
      optionsToUse,
      // {
      //   lineWidth: optionsToUse.lineWidth,
      //   minLineWidth: optionsToUse.minLineWidth,
      //   sides: optionsToUse.sides,
      //   width: optionsToUse.width,
      //   percentage: optionsToUse.percentage,
      //   sigma: optionsToUse.sigma,
      // },
    )).symbol;
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

  bracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    width?: number,
    tipWidth?: number,
    draw?: 'static' | 'dynamic',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: null,
      sides: 10,
      draw: 'dynamic',
      staticHeight: 'first',
      width: null,
      tipWidth: null,
      staticWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Bracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bracket').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  brace(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    sides?: number,
    width?: number,
    tipWidth?: number,
    draw?: 'dynamic' | 'static',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      side: 'left',
      color: this.defaultColor,
      lineWidth: null,
      sides: 10,
      draw: 'dynamic',
      staticHeight: 'first',
      width: null,
      tipWidth: null,
      staticWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Brace(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('brace').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  bar(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    draw?: 'dynamic' | 'static',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      side: 'left',
      lineWidth: 0.01,
      color: this.defaultColor,
      draw: 'dynamic',
      staticHeight: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new Bar(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  squareBracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    width?: number,
    tipWidth?: number,
    draw?: 'dynamic' | 'static',
    staticHeight?: number | 'first',
    radius?: number,
    sides?: number,
  }) {
    const defaultOptions = {
      side: 'left',
      lineWidth: null,
      color: this.defaultColor,
      width: null,
      draw: 'dynamic',
      staticHeight: 'first',
      radius: 0,
      sides: 5,
      tipWidth: null,
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    // if (optionsToUse.endLineWidth == null) {
    //   optionsToUse.endLineWidth = optionsToUse.lineWidth * 0.7;
    // }
    return (new SquareBracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }

  angleBracket(options: {
    side?: 'left' | 'right' | 'top' | 'bottom',
    color?: Array<number>,
    lineWidth?: number,
    width?: number,
    draw?: 'dynamic' | 'static',
    staticHeight?: number | 'first',
  }) {
    const defaultOptions = {
      side: 'left',
      lineWidth: null,
      width: null,
      color: this.defaultColor,
      draw: 'dynamic',
      staticHeight: 'first',
    };
    const optionsToUse = joinObjects(defaultOptions, options);
    return (new AngleBracket(
      this.shapes.webgl,
      optionsToUse.color,
      new Transform('bar').scale(1, 1).translate(0, 0),
      this.shapes.limits,
      optionsToUse,
    )).symbol;
  }
}
