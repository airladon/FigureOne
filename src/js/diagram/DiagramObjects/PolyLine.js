// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, polarToRect,
  threePointAngle,
} from '../../tools/g2';
import {
  roundNum,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimative,
} from '../Element';
import EquationLabel from './EquationLabel';
import type { TypeLabelEquationOptions } from './EquationLabel';
import { Equation } from '../DiagramElements/Equation/GLEquation';
import type {
  TypePolyLineBorderToPoint,
} from '../DiagramElements/PolyLine';
import type {
  TypeLineLabelLocation, TypeLineLabelSubLocation, TypeLineLabelOrientation,
} from './Line';

export type TypePolyLineOptions = {
  position?: Point,
  points?: Array<Point>,
  close?: boolean,
  showLine?: boolean,
  color?: Array<number>,
  borderToPoint?: TypePolyLineBorderToPoint,
  width?: number,
  sideLabel?: {
    //                             null is show real length
    text?: string | Array<string | null> | Array<Equation | null>,
    offset?: number | Array<number>,
    location?: TypeLineLabelLocation | Array<TypeLineLabelLocation>,
    subLocation?: TypeLineLabelSubLocation | Array<TypeLineLabelSubLocation>,
    orientation?: TypeLineLabelOrientation | Array<TypeLineLabelOrientation>,
    linePosition?: number | Array<number>,
  };
  angleLabel?: {
    //                             null is show real length
    text?: string | Array<string | null> | Array<Equation | null>,
  },
};

export default class DiagramObjectPolyLine extends DiagramElementCollection {
  shapes: Object;
  equation: Object;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;
  position: Point;

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: TypePolyLineOptions = {},
  ) {
    const defaultOptions = {
      position: new Point(0, 0),
      color: [0, 1, 0, 1],
      points: [new Point(1, 0), new Point(0, 0), new Point(0, 1)],
      close: false,
      showLine: true,
      borderToPoint: 'never',
      width: 0.01,
      sideLabel: {
        text: 'a',
        offset: 0.1,
        location: 'outside',
        subLocation: 'top',
        orientation: 'horizontal',
        linePosition: 0.5,
      },
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    super(new Transform('PolyLine')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;

    this.position = optionsToUse.position;
    this.transform.updateTranslation(this.position);
    if (optionsToUse.showLine) {
      const line = this.shapes.polyLine({
        points: optionsToUse.points,
        color: optionsToUse.color,
        close: optionsToUse.close,
        borderToPoint: optionsToUse.borderToPoint,
        width: optionsToUse.width,
      });
      this.add('line', line);
    }
  }

}
