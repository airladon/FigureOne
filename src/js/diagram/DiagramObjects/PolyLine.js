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
  TypeLineLabelOptions, TypeLineOptions,
} from './Line';
import DiagramPrimatives from '../DiagramPrimatives/DiagramPrimatives';
import DiagramObjects from './DiagramObjects';
import DiagramEquation from '../DiagramEquation/DiagramEquation';

type arrowOptions = {
  width?: number,
  height?: number,
} | boolean;
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
    labelOffset?: number | Array<number>,
    lineOffset?: number | Array<number>,
    location?: TypeLineLabelLocation | Array<TypeLineLabelLocation>,
    subLocation?: TypeLineLabelSubLocation | Array<TypeLineLabelSubLocation>,
    orientation?: TypeLineLabelOrientation | Array<TypeLineLabelOrientation>,
    linePosition?: number | Array<number>,
    showLine?: boolean | Array<boolean>,
    width?: number | Array<number>,
    arrows?: arrowOptions | Array<arrowOptions>,
    color?: Array<number> | Array<Array<number>>,
    textScale?: number | Array<number>,
  };
  side?: TypeLineOptions | Array<TypeLineOptions>,
  // angleLabel?: {
  //   //                             null is show real length
  //   text?: string | Array<string | null> | Array<Equation | null>,
  //   color?: Array<number> | Array<Array<number>>,

  // },
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
}

// function makeColorArray(
//   possibleArray: Array<Array<number> | number>,
//   count: number,
// ): Array<Array<number>> {
//   if (Array.isArray(possibleArray[0])) {
//     if (count === possibleArray.length) {                   // $FlowFixMe
//       return possibleArray;
//     }
//     const outArray = [];
//     for (let i = 0; i < count; i += 1) {                    // $FlowFixMe
//       outArray.push(possibleArray[i % possibleArray.length].slice());
//     }
//     return outArray;
//   }
//   const outArray = [];
//   for (let i = 0; i < count; i += 1) {
//     outArray.push(possibleArray.slice());
//   }                                                         // $FlowFixMe
//   return outArray;
// }

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
    const defaultOptions: TypePolyLineOptions = {
      position: new Point(0, 0),
      color: [0, 1, 0, 1],
      points: [new Point(1, 0), new Point(0, 0), new Point(0, 1)],
      close: false,
      showLine: true,
      borderToPoint: 'never',
      width: 0.01,
    };
    const defaultSideOptions: TypeLineOptions = {
      showLine: false,
      offset: 0,
      width: 0.01,
      color: options.color == null ? [0, 1, 0, 1] : options.color,
    };
    const defaultSideLabelOptions: TypeLineLabelOptions = {
      offset: 0.1,
      text: null,
      location: 'outside',
      subLocation: 'top',
      orientation: 'horizontal',
      linePosition: 0.5,
      textScale: 0.7,
    };

    if (options.side != null) {
      defaultOptions.side = defaultSideOptions;
      // $FlowFixMe
      if (options.side.label != null) {
        defaultOptions.side.label = defaultSideLabelOptions;
      }
    }
    const optionsToUse = joinObjects({}, defaultOptions, options);
    if (Array.isArray(options.side)) {
      optionsToUse.side = options.side.map(side => joinObjects({}, defaultOptions.side, side));
    }
    // console.log(optionsToUse)
    // console.log(optionsToUse.side[0].label)
    // console.log(optionsToUse.side[1].label)
    // console.log(optionsToUse.side[2].label)
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
    if (optionsToUse.side) {
      const { side } = optionsToUse;
      let pCount = optionsToUse.points.length - 1;
      if (optionsToUse.close) {
        pCount += 1;
      }
      const sideArray = makeArray(side, pCount);
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && optionsToUse.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        const sideOptions = joinObjects({}, {
          p1: optionsToUse.points[i],
          p2: optionsToUse.points[j],
        }, sideArray[i]);
        // if (sideOptions.label) {
        //   if (sideOptions.label.text === null) {
        //     sideOptions.label.text = '';
        //     sideOptions.label.showRealLength = true;
        //   }
        // }
        const sideLine = this.objects.line(sideOptions);
        this.add(name, sideLine);
      }
    }
    // if (optionsToUse.sideLabel) {
    //   const { sideLabel } = optionsToUse;
    //   let pCount = optionsToUse.points.length - 1;
    //   if (optionsToUse.close) {
    //     pCount += 1;
    //   }
    //   const textArray = makeArray(sideLabel.text, pCount);
    //   const lineOffsetArray = makeArray(sideLabel.lineOffset, pCount);
    //   const labelOffsetArray = makeArray(sideLabel.labelOffset, pCount);
    //   const locationArray = makeArray(sideLabel.location, pCount);
    //   const subLocationArray = makeArray(sideLabel.subLocation, pCount);
    //   const orientationArray = makeArray(sideLabel.orientation, pCount);
    //   const linePositionArray = makeArray(sideLabel.linePosition, pCount);
    //   const colorArray = makeColorArray(sideLabel.color, pCount);
    //   const showLineArray = makeArray(sideLabel.showLine, pCount);
    //   const widthArray = makeArray(sideLabel.width, pCount);
    //   const arrowsArray = makeArray(sideLabel.arrows, pCount);
    //   const textScaleArray = makeArray(sideLabel.textScale, pCount);
    //   for (let i = 0; i < pCount; i += 1) {
    //     let j = i + 1;
    //     if (i === pCount - 1 && optionsToUse.close) {
    //       j = 0;
    //     }
    //     const name = `side${i}${j}`;
    //     const text = textArray[i] == null ? '' : textArray[i];
    //     const label = this.objects.line({
    //       p1: optionsToUse.points[i],
    //       p2: optionsToUse.points[j],
    //       showLine: showLineArray[i],
    //       color: colorArray[i],
    //       width: widthArray[i],
    //       arrows: arrowsArray[i],
    //       offset: lineOffsetArray[i],
    //       label: {
    //         text,
    //         offset: labelOffsetArray[i],
    //         location: locationArray[i],
    //         subLocation: subLocationArray[i],
    //         orientation: orientationArray[i],
    //         linePosition: linePositionArray[i],
    //         textScale: textScaleArray[i],
    //       },
    //     });
    //     if (textArray[i] === null) {
    //       label.showRealLength = true;
    //       label.updateLabel();
    //     }
    //     this.add(name, label);
    //   }
    // }

    // if (optionsToUse.angleLabel) {
    //   const { angleLabel } = optionsToUse;
    //   let pCount = optionsToUse.points.length;
    //   if (optionsToUse.close === false) {
    //     pCount -= 2;
    //   }
    //   const textArray = makeArray(sideLabel.text, pCount);
    //   const lineOffsetArray = makeArray(sideLabel.lineOffset, pCount);
    //   const labelOffsetArray = makeArray(sideLabel.labelOffset, pCount);
    //   const locationArray = makeArray(sideLabel.location, pCount);
    //   const subLocationArray = makeArray(sideLabel.subLocation, pCount);
    //   const orientationArray = makeArray(sideLabel.orientation, pCount);
    //   const linePositionArray = makeArray(sideLabel.linePosition, pCount);
    //   const colorArray = makeColorArray(sideLabel.color, pCount);
    //   const showLineArray = makeArray(sideLabel.showLine, pCount);
    //   const widthArray = makeArray(sideLabel.width, pCount);
    //   const arrowsArray = makeArray(sideLabel.arrows, pCount);
    //   const textScaleArray = makeArray(sideLabel.textScale, pCount);
    //   for (let i = 0; i < pCount; i += 1) {
    //     let j = i + 1;
    //     if (i === pCount - 1 && optionsToUse.close) {
    //       j = 0;
    //     }
    //     const name = `side${i}${j}`;
    //     const text = textArray[i] == null ? '' : textArray[i];
    //     const label = this.objects.line({
    //       p1: optionsToUse.points[i],
    //       p2: optionsToUse.points[j],
    //       showLine: showLineArray[i],
    //       color: colorArray[i],
    //       width: widthArray[i],
    //       arrows: arrowsArray[i],
    //       offset: lineOffsetArray[i],
    //       label: {
    //         text,
    //         offset: labelOffsetArray[i],
    //         location: locationArray[i],
    //         subLocation: subLocationArray[i],
    //         orientation: orientationArray[i],
    //         linePosition: linePositionArray[i],
    //         textScale: textScaleArray[i],
    //       },
    //     });
    //     if (textArray[i] === null) {
    //       label.showRealLength = true;
    //       label.updateLabel();
    //     }
    //     this.add(name, label);
    //   }
    // }
  }
}
