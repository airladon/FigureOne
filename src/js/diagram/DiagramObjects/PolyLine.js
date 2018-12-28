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
import DiagramPrimatives from '../DiagramPrimatives/DiagramPrimatives';
import DiagramObjects from './DiagramObjects';
import DiagramEquation from '../DiagramEquation/DiagramEquation';

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

function makeArray<T>(
  possibleArray: T | Array<T>,
  count: number,
): Array<T> {
  if (Array.isArray(possibleArray)) {
    if (count === possibleArray.length) {
      return possibleArray;
    }
    const outArray = [];
    for (let i = 0; i < count; i += 1) {
      outArray.push(possibleArray[i % possibleArray.length]);
    }
    return outArray;
  }
  const outArray = [];
  for (let i = 0; i < count; i += 1) {
    outArray.push(possibleArray);
  }
  return outArray;
  // return [...Array(count)].map(() => possibleArray);
}

export default class DiagramObjectPolyLine extends DiagramElementCollection {
  shapes: DiagramPrimatives;
  equation: DiagramEquation;
  objects: DiagramObjects;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;
  position: Point;

  constructor(
    shapes: DiagramPrimatives,
    equation: DiagramEquation,
    objects: DiagramObjects,
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
      sideLabel: null,
    };
    const defaultSideLabelOptions = {
      text: 'a',
      offset: 0.1,
      location: 'outside',
      subLocation: 'top',
      orientation: 'horizontal',
      linePosition: 0.5,
    };
    if (options.sideLabel) {        // $FlowFixMe
      defaultOptions.sideLabel = defaultSideLabelOptions;
    }

    const optionsToUse = joinObjects({}, defaultOptions, options);
    super(new Transform('PolyLine')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.objects = objects;
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
    if (optionsToUse.sideLabel) {
      const { sideLabel } = optionsToUse;
      let pCount = optionsToUse.points.length - 1;
      if (optionsToUse.close) {
        pCount += 1;
      }
      const textArray = makeArray(sideLabel.text, pCount);
      const offsetArray = makeArray(sideLabel.offset, pCount);
      const locationArray = makeArray(sideLabel.location, pCount);
      const subLocationArray = makeArray(sideLabel.subLocation, pCount);
      const orientationArray = makeArray(sideLabel.orientation, pCount);
      const linePositionArray = makeArray(sideLabel.linePosition, pCount);
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1) {
          j = 0;
        }
        const name = `side${i}${j}`;
        const text = textArray[i] == null ? '' : textArray[i];
        const label = this.objects.line({
          p1: optionsToUse.points[i],
          p2: optionsToUse.points[j],
          showLine: false,
          label: {
            text,
            offset: offsetArray[i],
            location: locationArray[i],
            subLocation: subLocationArray[i],
            orientation: orientationArray[i],
            linePosition: linePositionArray[i],
          },
        });
        if (textArray[i] === null) {
          label.showRealLength = true;
        }
        this.add(name, label);
      }
    }
  }
}
