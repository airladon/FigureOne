// @flow

import {
  Transform, Point, getPoint, Rect, clipAngle,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
import { round } from '../../tools/math';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
// import type {
//   TypePolyLineBorderToPoint,
// } from '../DiagramElements/PolyLine';
import type { TypeParsablePoint } from '../../tools/g2';
import type {
  TypeLineLabelOptions, TypeLineOptions,
} from './Line';
import type {
  TypeAngleOptions, TypeAngleLabelOptions,
} from './Angle';
import DiagramPrimitives from '../DiagramPrimitives/DiagramPrimitives';
// eslint-disable-next-line import/no-cycle
import DiagramObjects from './DiagramObjects';
import DiagramEquation from '../DiagramEquation/DiagramEquation';
import type { OBJ_PolyLine } from '../DiagramPrimitives/DiagramPrimitives';

export type TypePadOptions = {
  color?: Array<number>,
  radius?: number,
  sides?: number,
  fill?: boolean,
  isMovable?: boolean,
  touchRadius?: number,
  boundary?: Rect | Array<number> | 'diagram',
  touchRadiusInBoundary?: boolean,
};
export type TypePolyLineOptions = {
  position?: ?Point,
  points: Array<TypeParsablePoint>,
  close?: boolean,
  showLine?: boolean,
  color?: Array<number>,
  // line?: OBJ_PolyLine,
  // borderToPoint?: TypePolyLineBorderToPoint,
  width?: number,
  angle?: TypeAngleOptions | Array<TypeAngleOptions>,
  side?: TypeLineOptions | Array<TypeLineOptions>,
  pad?: TypePadOptions | Array<TypePadOptions>,
  transform?: Transform,
  makeValid?: ?{
    shape: 'triangle',
    hide?: {
      minAngle?: ?number,
      maxAngle?: ?number,
      minSide?: ?number,
    },
  };
} & OBJ_PolyLine;

function makeArray<T>(
  possibleArray: T | Array<T>,
  count: number,
): Array<T> {
  if (Array.isArray(possibleArray)) {
    if (count === possibleArray.length) { // $FlowFixMe
      return possibleArray;
    }
    const outArray = [];
    for (let i = 0; i < count; i += 1) {
      outArray.push(possibleArray[i % possibleArray.length]);
    }
    return outArray;
  }
  const outArray = [];
  let labels = [];

  if (typeof possibleArray === 'object' && possibleArray != null) {
    if (possibleArray.label != null
      && possibleArray.label.text != null
      && Array.isArray(possibleArray.label.text)
    ) {
      labels = possibleArray.label.text.slice();
      // const obj = possibleArray;
      for (let i = 0; i < count; i += 1) {
        // $FlowFixMe
        const obj = { label: { text: labels[i % labels.length] } };
        // console.log(labels, labels[i % labels.length]);
        outArray.push(joinObjects({}, possibleArray, obj));
      }
      // $FlowFixMe
      return outArray;
    }
  }
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
  shapes: DiagramPrimitives;
  equation: DiagramEquation;
  objects: DiagramObjects;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;
  position: Point;
  points: Array<Point>;
  close: boolean;
  _line: ?DiagramElementPrimitive;
  options: TypePolyLineOptions;
  updatePointsCallback: ?() => void;
  reverse: boolean;
  makeValid: ?{
    shape: 'triangle';
    hide: {
      minAngle: ?number,
      maxAngle: ?number,
      minSide: ?number,
    }
  };

  constructor(
    shapes: DiagramPrimitives,
    equation: DiagramEquation,
    objects: DiagramObjects,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: TypePolyLineOptions = {},
  ) {
    const defaultOptions: TypePolyLineOptions = {
      position: null,
      color: [0, 1, 0, 1],
      points: [new Point(1, 0), new Point(0, 0), new Point(0, 1)],
      close: false,
      showLine: true,
      // borderToPoint: 'never',
      width: 0.01,
      reverse: false,
      transform: new Transform('PolyLine').scale(1, 1).rotate(0).translate(0, 0),
      makeValid: null,
    };
    if (options.makeValid != null && options.makeValid.shape != null && options.makeValid.shape === 'triangle') {
      defaultOptions.makeValid = {
        shape: 'triangle',
        hide: {
          minAngle: null,
          maxAngle: null,
          minSide: null,
        },
      };
    }
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
      scale: 0.7,
    };
    const defaultAngleOptions: TypeAngleOptions = {
      color: options.color == null ? [0, 1, 0, 1] : options.color,
      curve: {},
      autoRightAngle: true,
    };
    const defaultAngleLabelOptions: TypeAngleLabelOptions = {
      text: null,
    };
    const defaultPadOptions: TypePadOptions = {
      sides: 20,
      radius: 0.1,
      color: options.color == null ? [0, 1, 0, 1] : options.color,
      fill: true,
      isMovable: false,
      boundary: 'diagram',
      touchRadiusInBoundary: false,
    };

    if (options.side != null) {
      defaultOptions.side = defaultSideOptions;
      // $FlowFixMe
      if (options.side.label != null) {
        defaultOptions.side.label = defaultSideLabelOptions;
      }
    }

    if (options.angle != null) {
      defaultOptions.angle = defaultAngleOptions;
      // $FlowFixMe
      if (options.angle.label != null) {
        defaultOptions.angle.label = defaultAngleLabelOptions;
      }
    }

    if (options.pad != null) {
      defaultOptions.pad = defaultPadOptions;
    }

    const optionsToUse = joinObjects({}, defaultOptions, options);

    if (Array.isArray(options.side)) {      // $FlowFixMe
      optionsToUse.side = options.side.map(side => joinObjects({}, defaultOptions.side, side));
    }

    if (Array.isArray(options.angle)) {      // $FlowFixMe
      optionsToUse.angle = options.angle.map(angle => joinObjects({}, defaultOptions.angle, angle));
    }

    super(optionsToUse.transform, shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.objects = objects;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    this.updatePointsCallback = null;

    if (optionsToUse.position != null) {
      this.transform.updateTranslation(getPoint(optionsToUse.position));
    }
    this.position = this.getPosition();
    this.close = optionsToUse.close;
    this.options = optionsToUse;
    this.reverse = optionsToUse.reverse;
    this.makeValid = optionsToUse.makeValid;

    this.points = optionsToUse.points.map(p => getPoint(p));

    // Add Pads
    if (optionsToUse.pad) {
      const { pad } = optionsToUse;
      const pCount = this.points.length;
      const padArray = makeArray(pad, pCount);
      for (let i = 0; i < pCount; i += 1) {
        const name = `pad${i}`;
        const padOptions = joinObjects({}, {
          transform: new Transform().translate(this.points[i]),
        }, padArray[i]);
        const padShape = this.shapes.polygon(padOptions);
        if (padArray[i].isMovable) {
          padShape.isMovable = true;
          padShape.isTouchable = true;
          if (padArray[i].touchRadius != null) {
            const multiplier = padArray[i].touchRadius / padArray[i].radius;
            padShape.increaseBorderSize(multiplier);
          }
          let { boundary } = padArray[i];
          // console.log(boundary, padArray[i])
          if (boundary === 'diagram') {
            boundary = shapes.limits._dup();
          } else if (Array.isArray(boundary)) {
            const [left, bottom, width, height] = boundary;
            boundary = new Rect(left, bottom, width, height);
          }
          if (padArray[i].touchRadiusInBoundary === false && padArray[i].touchRadius != null) {
            const delta = padArray[i].touchRadius - padArray[i].radius;
            boundary = new Rect(
              boundary.left - delta,
              boundary.bottom - delta,
              boundary.width + 2 * delta,
              boundary.height + 2 * delta,
            );
          }
          padShape.setMoveBoundaryToDiagram(boundary);
          padShape.setTransformCallback = (transform) => {
            const index = parseInt(padShape.name.slice(3), 10);
            const translation = transform.t();
            if (translation != null) {
              this.points[index] = translation._dup();
              this.updatePoints(this.points);
            }
          };
        }
        this.add(name, padShape);
      }
    }

    // Add Angles
    if (optionsToUse.angle) {
      const { angle } = optionsToUse;
      let pCount = this.points.length;
      if (optionsToUse.close === false) {
        pCount -= 2;
      }
      const angleArray = makeArray(angle, pCount);
      let firstIndex = 0;
      if (optionsToUse.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        let j = i + 1;
        let k = i - 1;
        if (i === pCount - 1 && optionsToUse.close) {
          j = 0;
        }
        if (i === 0 && optionsToUse.close) {
          k = pCount - 1;
        }
        const name = `angle${i}`;
        if (this.reverse) {
          const newJ = k;
          k = j;
          j = newJ;
        }
        const angleOptions = joinObjects({}, {
          p1: this.points[k],
          p2: this.points[i],
          p3: this.points[j],
        }, angleArray[i - firstIndex]);
        const angleAnnotation = this.objects.angle(angleOptions);
        this.add(name, angleAnnotation);
      }
    }

    // Add Line
    if (optionsToUse.showLine) {
      const line = this.shapes.polyline({
        points: this.points,
        // color: optionsToUse.color,
        // close: optionsToUse.close,
        // // borderToPoint: optionsToUse.borderToPoint,
        // width: optionsToUse.width,
        width: options.width,
        close: options.close,
        pointsAt: options.pointsAt,
        cornerStyle: options.cornerStyle,
        cornerSize: options.cornerSize,
        cornerSides: options.cornerSides,
        minAutoCornerAngle: options.minAutoCornerAngle,
        dash: options.dash,
        color: options.color,
        pulse: options.pulse,
      });
      this.add('line', line);
    }

    // Add Sides
    if (optionsToUse.side) {
      const { side } = optionsToUse;
      let pCount = this.points.length - 1;
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
        let sideOptions = joinObjects({}, {
          p1: this.points[i],
          p2: this.points[j],
        }, sideArray[i]);
        if (this.reverse) {
          sideOptions = joinObjects({}, {
            p1: this.points[j],
            p2: this.points[i],
          }, sideArray[i]);
        }
        const sideLine = this.objects.line(sideOptions);
        this.add(name, sideLine);
      }
    }
  }

  updateSideLabels(rotationOffset: number = 0) {
    if (this.options.side != null) {
      let pCount = this.points.length - 1;
      if (this.close) {
        pCount += 1;
      }
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          this.elements[name].updateLabel(rotationOffset);
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }
  }

  updateAngleLabels(rotationOffset: number = 0) {
    if (this.options.angle != null) {
      let pCount = this.points.length;
      if (this.close === false) {
        pCount -= 2;
      }
      let firstIndex = 0;
      if (this.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        const name = `angle${i}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          this.elements[name].updateLabel(rotationOffset);
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }
  }

  updatePoints(newPointsIn: Array<Point>, skipCallback: boolean = false) {
    const newPoints = newPointsIn.map(p => getPoint(p));
    if (this._line != null) {
      this._line.custom.updatePoints(newPoints);
    }

    // Add Pads
    let pCount = this.points.length;
    if (this.options.pad) {
      for (let i = 0; i < pCount; i += 1) {
        const name = `pad${i}`;
        if (this.elements[name]) {
          // if (this.elements[name].isMovable === false) {
          this.elements[name].transform.updateTranslation(newPoints[i]);
          // }
        }
      }
    }
    if (this.options.side != null) {
      pCount = this.points.length - 1;
      if (this.close) {
        pCount += 1;
      }
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          if (this.reverse) {
            this.elements[name].setEndPoints(newPoints[j], newPoints[i]);
          } else {
            this.elements[name].setEndPoints(newPoints[i], newPoints[j]);
          }
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }

    if (this.options.angle != null) {
      pCount = this.points.length;
      if (this.close === false) {
        pCount -= 2;
      }
      let firstIndex = 0;
      if (this.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        let j = i + 1;
        let k = i - 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        if (i === 0 && this.close) {
          k = pCount - 1;
        }
        const name = `angle${i}`;
        if (this.elements[name] != null) {
          const wasHidden = !this.elements[name].isShown;
          if (this.reverse) {
            const newJ = k;
            k = j;
            j = newJ;
          }
          this.elements[name].setAngle({
            p1: newPoints[k],
            p2: newPoints[i],
            p3: newPoints[j],
          });
          if (wasHidden) {
            this.elements[name].hide();
          }
        }
      }
    }
    this.points = newPoints;
    if (this.makeValid != null && this.makeValid.shape === 'triangle' && !skipCallback) {
      this.makeValidTriangle();
    }
    if (this.updatePointsCallback != null && !skipCallback) {
      this.updatePointsCallback();
    }
  }

  updateRotation(rotationOffset: number = 0) {
    let i = 0;      // $FlowFixMe
    let angle = this[`_angle${i}`];
    while (angle != null) {
      angle.update(this.getRotation() + rotationOffset);
      i += 1;       // $FlowFixMe
      angle = this[`_angle${i}`];
    }

    i = 0;          // $FlowFixMe
    let side = this[`_side${i}${i + 1}`];
    while (side != null) {
      side.updateLabel(this.getRotation() + rotationOffset);
      i += 1;       // $FlowFixMe
      side = this[`_side${i}${i + 1}`];
    }               // $FlowFixMe
    side = this[`_side${i}${0}`];
    if (side != null) {
      side.updateLabel(this.getRotation() + rotationOffset);
    }
  }

  reversePoints(skipCallback: boolean = true) {
    const newPoints = [];
    for (let i = 0; i < this.points.length; i += 1) {
      newPoints.push(this.points[this.points.length - 1 - i]);
    }
    this.updatePoints(newPoints, skipCallback);
  }

  setPositionWithoutMoving(
    newPositionPointOrX: Point | number,
    newPositionY: number = 0,
  ) {
    let newPosition = new Point(0, 0);
    if (typeof newPositionPointOrX === 'number') {
      newPosition.x = newPositionPointOrX;
      newPosition.y = newPositionY;
    } else {
      newPosition = newPositionPointOrX;
    }
    const currentPosition = this.getPosition();
    const delta = currentPosition.sub(newPosition);
    this.setPosition(newPosition);
    const newPoints = this.points.map(p => p.add(delta));
    this.updatePoints(newPoints);
  }

  setRotationWithoutMoving(newRotation: number) {
    const currentRotation = this.getRotation();
    const delta = currentRotation - newRotation;
    const deltaMatrix = new Transform().rotate(delta).m();
    this.setRotation(newRotation);
    const newPoints = this.points.map(p => p.transformBy(deltaMatrix));
    this.updatePoints(newPoints);
  }

  setScaleWithoutMoving(
    newScalePointOrX: Point | number,
    newScaleY: number = 0,
  ) {
    let newScale = new Point(0, 0);
    if (typeof newScalePointOrX === 'number') {
      newScale.x = newScalePointOrX;
      newScale.y = newScaleY;
    } else {
      newScale = newScalePointOrX;
    }
    const currentScale = this.getScale();
    const delta = new Point(
      currentScale.x / newScale.x,
      currentScale.y / newScale.y,
    );
    const deltaMatrix = new Transform().scale(delta).m();
    this.setScale(newScale);
    const newPoints = this.points.map(p => p.transformBy(deltaMatrix));
    this.updatePoints(newPoints);
  }

  setShow(name: string, show: boolean) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.name.startsWith(name)) {
        if (show) {
          element.showAll();
        } else {
          element.hide();
        }
      }
    }
  }

  hideAngles() {
    this.setShow('angle', false);
  }

  hideSides() {
    this.setShow('side', false);
  }

  showAngles() {
    this.setShow('angle', true);
  }

  showSides() {
    this.setShow('side', true);
  }

  updateLabels(rotationOffset: number = this.getRotation()) {
    this.updateAngleLabels(rotationOffset);
    this.updateSideLabels(rotationOffset);
  }

  makeValidTriangle() {
    // $FlowFixMe
    const angle0 = this._angle0;  // $FlowFixMe
    const angle1 = this._angle1;  // $FlowFixMe
    const angle2 = this._angle2;  // $FlowFixMe
    const side01 = this._side01;  // $FlowFixMe
    const side12 = this._side12;  // $FlowFixMe
    const side20 = this._side20;
    const anglePrecision = angle0.label.precision;
    const sidePrecision = side01.label.precision;

    // $FlowFixMe
    const clipAngle0 = clipAngle(angle0.getAngle(), '0to360') * 180 / Math.PI;
    const clipAngle1 = clipAngle(angle1.getAngle(), '0to360') * 180 / Math.PI;
    const clipAngle2 = clipAngle(angle2.getAngle(), '0to360') * 180 / Math.PI;
    let a0 = round(clipAngle0, anglePrecision);
    let a1 = round(clipAngle1, anglePrecision);
    let a2 = round(clipAngle2, anglePrecision);
    let s01 = round(side01.getLength(), sidePrecision);
    let s12 = round(side12.getLength(), sidePrecision);
    let s20 = round(side20.getLength(), sidePrecision);

    // Reverse the points if the angles are on the outside
    if (a0 > 90 && a1 > 90 && a2 > 90) {
      this.reverse = !this.reverse;
      this.updatePoints(this.points, false);
      a0 = round(clipAngle(angle0.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
      a1 = round(clipAngle(angle1.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
      a2 = round(clipAngle(angle2.getAngle(), '0to360') * 180 / Math.PI, anglePrecision);
    }
    // else {
    // This is a weird case at the 0/360 transition
    if (a0 > 180) {
      a0 = 360 - angle0;
    }
    if (a1 > 180) {
      a1 = 360 - angle1;
    }
    if (a2 > 180) {
      a2 = 360 - angle2;
    }

    // Hide the angles if the triangle is thin or small enough
    // if (
    //   (angle0.label.autoHide > -1 && a0 > angle0.label.autoHide)
    //   || (angle0.label.autoHideMax != null && angle0.label.autoHideMax < a0)
    //   || (angle1.label.autoHide > -1 && a1 > angle1.label.autoHide)
    //   || (angle1.label.autoHideMax != null && angle1.label.autoHideMax < a1)
    //   || (angle2.label.autoHide > -1 && a2 > angle2.label.autoHide)
    //   || (angle2.label.autoHideMax != null && angle2.label.autoHideMax < a2)
    //   || s01 < 0.6 || s12 < 0.6 || s20 < 0.6
    // ) {
    // if (angle0.isShown) {
    // Make angles consistent with 180º
    const tot = a0 + a1 + a2;
    const diff = tot - 180;
    // If the angles are > 180, then find the closet angle
    // to rounding down and reduce it by diff
    // If the angles are < 180 then find the closes angle
    // to round down and round it down
    const remainders = [
      round(clipAngle0, anglePrecision + 1),
      round(clipAngle1, anglePrecision + 1),
      round(clipAngle2, anglePrecision + 1),
    ].map(a => a - Math.floor(a * (10 ** anglePrecision)) / (10 ** anglePrecision));
    const angles = [a0, a1, a2];
    let indexToChange = 0;
    if (tot > 180) {
      indexToChange =
        remainders.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
    } else if (tot < 180) {
      indexToChange =
        remainders.reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 1);
    }
    angles[indexToChange] -= diff;
    [a0, a1, a2] = angles;
    angle0.setLabel(`${a0.toFixed(anglePrecision)}º`);
    angle1.setLabel(`${a1.toFixed(anglePrecision)}º`);
    angle2.setLabel(`${a2.toFixed(anglePrecision)}º`);
    angle0.checkLabelForRightAngle();
    angle1.checkLabelForRightAngle();
    angle2.checkLabelForRightAngle();

    if (this.makeValid != null) {
      const { minSide } = this.makeValid.hide;
      let { minAngle, maxAngle } = this.makeValid.hide;
      let hideAngles = false;
      if (minAngle != null) {
        minAngle *= 180 / Math.PI;
        if (a0 < minAngle || a1 < minAngle || a2 < minAngle) {
          hideAngles = true;
        }
      }
      if (maxAngle != null) {
        maxAngle *= 180 / Math.PI;
        if (a0 > maxAngle || a1 > maxAngle || a2 > maxAngle) {
          hideAngles = true;
        }
      }
      if (
        minSide != null && (s01 < minSide || s12 < minSide || s20 < minSide)
      ) {
        hideAngles = true;
      }
      if (hideAngles) {
        this.hideAngles();
      }
    }

    // Make sides consistent with equilateral or isosceles
    if (
      (side01.isShown || side12.isShown || side20.isShown)
      && a0 > 0 && a0 < 180
      && a1 > 0 && a1 < 180
      && a2 > 0 && a2 < 180
    ) {
      // s12 = round(
      //   s01 / Math.sin(a2 * Math.PI / 180) * Math.sin(a0 * Math.PI / 180),
      //   sidePrecision,
      // );
      // s20 = round(
      //   s01 / Math.sin(a2 * Math.PI / 180) * Math.sin(a1 * Math.PI / 180),
      //   sidePrecision,
      // );
      const leastSigStep = 1 / (10 ** sidePrecision);
      // If Equilateral, make all sides equal
      if (a0 === 60 && a1 === 60 && a2 === 60) {
        s12 = s01;
        s20 = s01;
      // If Isosceles possibility 1:
      } else if (a0 === a1) {
        s20 = s12;
        if (s01 === s12) {
          const moreAccurate = round(side01.getLength(), sidePrecision + 1);
          if (moreAccurate < s01) {
            s01 -= leastSigStep;
          } else {
            s01 += leastSigStep;
          }
        }
      // If Isosceles possibility 2:
      } else if (a0 === a2) {
        s01 = s12;
        if (s20 === s12) {
          const moreAccurate = round(side20.getLength(), sidePrecision + 1);
          if (moreAccurate < s20) {
            s20 -= leastSigStep;
          } else {
            s20 += leastSigStep;
          }
        }
      // If Isosceles possibility 3:
      } else if (a1 === a2) {
        s20 = s01;
        if (s12 === s01) {
          const moreAccurate = round(side12.getLength(), sidePrecision + 1);
          if (moreAccurate < s12) {
            s12 -= leastSigStep;
          } else {
            s12 += leastSigStep;
          }
        }
      // If these are not equilateral, or isosceles, then all sides must be different length
      }
    }

    // if (s01 === Infinity) {
    //   s01 = round(side01.getLength(), sidePrecision);
    // }
    // if (s12 === Infinity) {
    //   s12 = round(side12.getLength(), sidePrecision);
    // }
    // if (s20 === Infinity) {
    //   s20 = round(side20.getLength(), sidePrecision);
    // }
    side01.setLabel(`${s01.toFixed(sidePrecision)}`);
    side12.setLabel(`${s12.toFixed(sidePrecision)}`);
    side20.setLabel(`${s20.toFixed(sidePrecision)}`);
    // }
  }
}
