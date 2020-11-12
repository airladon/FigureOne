// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect, // Point, Line,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
// import {
//   DiagramElementCollection,
// } from '../Element';
import DrawContext2D from '../DrawContext2D';
// import EquationNavigator from './EquationNavigator';
import AdvancedLine from './Line';
import DiagramObjectAngle from './Angle';
// eslint-disable-next-line import/no-cycle
import DiagramObjectPolyLine from './PolyLine';
import type { ADV_Line } from './Line';
import type { ADV_Angle } from './Angle';
import type { TypeLabelOptions } from './EquationLabel';
import type { TypePolyLineOptions } from './PolyLine';
import EquationLabel from './EquationLabel';

export default class DiagramObjects {
  webgl: Array<WebGLInstance>;
  draw2D: DrawContext2D;
  limits: Rect;
  shapes: Object;
  equation: Object;
  isTouchDevice: boolean;
  animateNextFrame: void => void;

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: () => void,
  ) {
    this.webgl = shapes.webgl;
    this.draw2D = shapes.draw2D;
    this.limits = shapes.limits;
    this.shapes = shapes;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    this.equation = equation;
  }


  line(...options: Array<ADV_Line>) {
    // const optionsToUse = Object.assign({}, ...options);
    // console.log(Object.assign({}, ...options))
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedLine(
      this.shapes, this.equation, this.isTouchDevice,
      optionsToUse,
    );
  }

  angle(...options: Array<ADV_Angle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new DiagramObjectAngle(
      this.shapes, this.equation, this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  label(...options: Array<TypeLabelOptions>) {
    // const optionsToUse = Object.assign({}, ...options);
    const optionsToUse = joinObjects({}, ...options);
    return new EquationLabel(
      this.equation, optionsToUse,
    );
  }

  polyline(...options: Array<TypePolyLineOptions>) {
    const optionsToUse = joinObjects({}, ...options);
    return new DiagramObjectPolyLine(
      this.shapes, this.equation, this,
      this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }
}
