// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, polarToRect,
  threePointAngle, getPoint, clipAngle,
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

export type TypeAngleLabelOrientation = 'horizontal' | 'tangent';
export type TypeAngleLabelOptions = {
  text: null | string | Array<string> | Equation | TypeLabelEquationOptions, // String goes to eqn,
                                  // Array<string> into eqn forms
  radius?: number,                // Label radius
  curvePosition?: number,         // Label position along curve in %
  showRealAngle?: boolean,        // Use angle as label
  units?: 'degrees' | 'radians';  // Real angle units
  precision?: number,     // Num decimal places if using angle label
  orientation?: TypeAngleLabelOrientation,  // horiztonal or tangent
  autoHide?: number,              // Auto hide label at this threshold
  textScale?: number,             // Text scale
  color?: Array<number>,          // Text color can be different to curve
};

export type TypeAngleOptions = {
  position?: Point,         // Position of angle vertex
  angle?: number,           // Angle measure
  rotation?: number,        // Start rotation of angle
  color?: Array<number>,    // Default color
  curve?: {                 // Angle annotation curve
    width?: number,           // Curve line width
    sides?: number,           // Number of sides in 360º curve
    radius?: number,          // Curve radius
    num?: number,             // Number of curves
    step?: number,            // Step radius of curves if curve num > 1
  },
  p1?: Point,               // Can define angle with p1, p2, p3
  p2?: Point,               // p2 is angle vertex
  p3?: Point,               // Curve goes from P21 to P23 anticlockwise
  direction?: 1 | -1;       // Direction (from P21 to P23, or for angle)
  autoRightAngle?: boolean, // Right angle curve displayed when angle = π/2
  rightAngleRange?: number, // Range around π/2 for right angle curve display
  //
  // Arrows
  arrow1?: {                // Define arrow at start of curve
    width?: number,           // Arrow width
    height?: number,          // Arrow height
    radius?: number,          // Arrow radius (can be different to curve rad)
    autoHide?: boolean,       // Autohide arrow when arrow(s) height > angle
    curveOverlap?: number,    // Percentage height to overlap curve
  },
  arrow2?: {                  // Define arrow at end of curve
    width?: number,
    height?: number,
    radius?: number,
    autoHide?: boolean,
    curveOverlap?: number,    // Percentage height to overlap curve
  },
  arrows?: {                // Define both arrows - overwrites arrow1 and 2
    width?: number,
    height?: number,
    radius?: number,
    autoHide?: boolean,
    curveOverlap?: number,    // Percentage height to overlap curve
  } | boolean,
  //
  // Label
  label?: TypeAngleLabelOptions,
  //
  // Sides
  side1?: {                 // Define side line at start of angle
    length?: number,        // Side line length
    width?: number,         // Side line width
    color?: Array<number>,  // Side line color
  },
  side2?: {                 // Define side line at end of angle
    length?: number,
    width?: number,
    color?: Array<number>,
  },
  sides?: {                 // Define both side lines - overrides side 1 & 2
    length?: number,
    width?: number,
    color?: Array<number>,
  },
  mods?: {};
};

// Angle is a class that manages:
//   A angle curve
//   Label
//   Arrows
//   Straight Lines
//
// The angle collection comprises:
//   * Positioned at 0, 0 in vertex space
//   * Curve from 0 to angle size (where 0 is along x axis in vertex space)
//   * Label in center of curve
//   * Arrows at ends of curve
//   * Straight lines forming the corner
//
// To give the angle a custom position and rotation from 0, the main class's
// transform is used:
//   - Translation for position
//   - Rotation for rotation
//
// An angle can be defined in two ways:
//   - Angle, rotation, position
//   - p1, p2, p3

class AngleLabel extends EquationLabel {
  radius: number;
  curvePosition: number;
  showRealAngle: boolean;
  orientation: TypeAngleLabelOrientation;
  precision: number;
  units: 'degrees' | 'radians';
  autoHide: number;

  constructor(
    equation: Object,
    labelText: string | Equation | Array<string>,
    color: Array<number>,
    radius: number,
    curvePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    showRealAngle: boolean = false,
    units: 'degrees' | 'radians' = 'degrees',
    precision: number = 0,
    autoHide: number = -1,
    orientation: TypeAngleLabelOrientation = 'horizontal',
    scale: number = 0.7,
  ) {
    super(equation, { label: labelText, color, scale });
    this.radius = radius;
    this.curvePosition = curvePosition;
    this.showRealAngle = showRealAngle;
    this.units = units;
    this.orientation = orientation;
    this.precision = precision;
    this.autoHide = autoHide;
  }
}


class DiagramObjectAngle extends DiagramElementCollection {
  // Diagram elements
  _curve: ?DiagramElementPrimative;
  _curveRight: ?DiagramElementPrimative;
  _arrow1: ?DiagramElementPrimative;
  _arrow2: ?DiagramElementPrimative;
  _side1: ?DiagramElementPrimative;
  _side2: ?DiagramElementPrimative;
  _label: null | {
    _base: DiagramElementPrimative;
  } & DiagramElementCollection;

  // Objects that may or may not exist
  label: ?AngleLabel;
  arrow1: ?{
    height: number;
    width: number,
    radius: number,
    autoHide: boolean,
    curveOverlap: number,
  };

  arrow2: ?{
    height: number;
    width: number,
    radius: number,
    autoHide: boolean,
    curveOverlap: number,
  };

  side1: ?{ width: number, length: number };
  side2: ?{ width: number, length: number };
  curve: ?{
    width: number,
    sides: number,
    radius: number,
    num: number,
    step: number,
  };

  // angle properties - pulic read only
  angle: number;
  rotation: number;
  position: Point;
  radius: number;
  p1: Point;
  p2: Point;
  p3: Point;
  direction: -1 | 1;
  lastLabelRotationOffset: number;
  autoRightAngle: boolean;
  rightAngleRange: number;

  // angle properties - pulic read/write

  // angle properties - private internal use only
  shapes: Object;
  equation: Object;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;

  // Pulic Angle methods
  setAngle: (?{
      position?: Point,
      rotation?: number,
      angle?: number,
      p1?: Point,
      p2?: Point,
      p3?: Point,
    }) => void;

  update: (?number) => void;


  // eslint-disable-next-line class-methods-use-this
  calculateFromP1P2P3(
    p1: Point,
    p2: Point,
    p3: Point,
    direction: 1 | -1 = 1,
  ) {
    const position = p2._dup();
    const angle = threePointAngle(p1, p2, p3);
    if (direction === 1) {
      const L21 = new Line(p2, p1);
      const rotation = L21.angle();
      return { position, rotation, angle };
    }
    const L23 = new Line(p2, p1);
    const rotation = L23.angle();
    return {
      position,
      rotation,
      angle: clipAngle(Math.PI * 2 - angle, '0to360'),
    };
  }

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: TypeAngleOptions = {},
  ) {
    const defaultOptions = {
      position: new Point(0, 0),
      rotation: 0,
      angle: 1,
      // radius: 0.1,
      color: [0, 1, 0, 1],
      // clockwise: false,
      direction: 1,
      autoRightAngle: false,
      rightAngleRange: 0.001,
      curve: null,
      sides: null,
      sideStart: null,
      sideStop: null,
      arrows: null,
      arrow1: null,
      arrow2: null,
      label: null,
      p1: null,       // if p1, p2 and p3 are defined, position, angle and
      p2: null,       // rotation will be overridden
      p3: null,
      mods: {},
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);

    super(new Transform('Line')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;

    // Calculate and store the angle geometry
    this.position = optionsToUse.position;
    this.rotation = optionsToUse.rotation;
    this.direction = optionsToUse.direction;
    this.angle = optionsToUse.angle;
    this.lastLabelRotationOffset = 0;
    this.autoRightAngle = optionsToUse.autoRightAngle;
    this.rightAngleRange = optionsToUse.rightAngleRange;

    // this.clockwise = optionsToUse.clockwise;
    // this.radius = optionsToUse.radius;
    if (optionsToUse.p1 != null
      && optionsToUse.p2 != null
      && optionsToUse.p3 != null
    ) {
      const { position, rotation, angle } = this.calculateFromP1P2P3(
        getPoint(optionsToUse.p1),
        getPoint(optionsToUse.p2),
        getPoint(optionsToUse.p3),
        this.direction,
      );
      this.angle = angle;
      this.rotation = rotation;
      this.position = getPoint(position);
    }
    this.transform.updateTranslation(this.position);
    this.transform.updateRotation(this.rotation);

    // Setup default values for sides, arrows, curve and label
    this.side1 = null;
    this.side2 = null;
    this.arrow1 = null;
    this.arrow2 = null;
    this.curve = null;
    this.label = null;

    // If the curve is to be shown (and not just a label) then make it
    this._curve = null;
    if (optionsToUse.curve) {
      this.addCurve(optionsToUse.curve);
    }

    // Arrows
    if (optionsToUse.arrow1 || optionsToUse.arrows) {
      this.addArrow(1, joinObjects({}, optionsToUse.arrow1, optionsToUse.arrows));
    }
    if (optionsToUse.arrow2 || optionsToUse.arrows) {
      this.addArrow(2, joinObjects({}, optionsToUse.arrow2, optionsToUse.arrows));
    }

    // Label
    if (optionsToUse.label) {
      this.addLabel(optionsToUse.label);
    }

    // Sides
    let defaultSideLength = 0.5;
    if (this.curve) {
      defaultSideLength = this.curve.radius * 2;
    }
    let defaultSideWidth = 0.01;
    if (this.curve) {
      defaultSideWidth = this.curve.width;
    }
    const defaultSideOptions = {
      length: defaultSideLength,
      width: defaultSideWidth,
      color: this.color,
    };
    if (optionsToUse.side1) {
      const sideOptions = joinObjects({}, defaultSideOptions, optionsToUse.side1);
      this.addSide(1, sideOptions.length, sideOptions.width, sideOptions.color);
    }

    if (optionsToUse.side2) {
      const sideOptions = joinObjects({}, defaultSideOptions, optionsToUse.side2);
      this.addSide(2, sideOptions.length, sideOptions.width, sideOptions.color);
    }

    // Sides overrides side1 and side2
    if (optionsToUse.sides) {
      let sides = {};
      if (typeof optionsToUse.sides === 'object') {
        ({ sides } = optionsToUse);
      }
      const sideOptions = joinObjects({}, defaultSideOptions, sides);
      this.addSide(1, sideOptions.length, sideOptions.width, sideOptions.color);
      this.addSide(2, sideOptions.length, sideOptions.width, sideOptions.color);
    }
    this.update();
    if (optionsToUse.mods != null && optionsToUse.mods !== {}) {
      this.setProperties(optionsToUse.mods);
    }
  }

  setAngle(options: {
      position?: Point,
      rotation?: number,
      angle?: number,
      p1?: Point,
      p2?: Point,
      p3?: Point,
    } = {}) {
    if (options.position != null) {
      this.position = options.position;
    }
    if (options.rotation != null) {
      this.rotation = options.rotation;
    }
    if (options.angle != null) {
      this.angle = options.angle;
    }
    const { p1, p2, p3 } = options;
    if (p1 != null
      && p2 != null
      && p3 != null
    ) {
      const { position, rotation, angle } = this.calculateFromP1P2P3(
        getPoint(p1),
        getPoint(p2),
        getPoint(p3),
        this.direction,
      );
      this.angle = angle;
      this.rotation = rotation;
      this.position = getPoint(position);
    }
    this.update();
  }

  addSide(
    index: 1 | 2,
    length: number | null = null,
    width: number | null = null,
    color: Array<number> = this.color,
  ) {
    const line = this.shapes.horizontalLine(
      new Point(0, 0),
      1, width, 0, color, new Transform().scale(1, 1).rotate(0),
    );
    // $FlowFixMe
    this[`side${index}`] = { length, width };
    this.add(`side${index}`, line);
  }

  addLabel(options: {
    labelText?: string | Equation | Array<string> | TypeLabelEquationOptions,
    radius?: number,
    curvePosition?: number,
    showRealAngle?: boolean,
    units?: 'degrees' | 'radians',
    precision?: number,
    orientation?: TypeAngleLabelOrientation,
    autoHide?: number,
    textScale?: number,
  } = {}) {
    const defaultLabelOptions = {
      text: null,
      radius: 0.4,
      curvePosition: 0.5,
      showRealAngle: false,
      units: 'degrees',
      precision: 0,
      orientation: 'horizontal',
      autoHide: -1,
      textScale: 0.7,
      color: this.color,
    };
    if (this.curve) {
      defaultLabelOptions.radius = this.curve.radius;
    }
    // console.log(options)
    const optionsToUse = joinObjects({}, defaultLabelOptions, options);
    if (optionsToUse.text === null) {
      optionsToUse.text = '';
      optionsToUse.showRealAngle = true;
    }
    this.label = new AngleLabel(
      this.equation,
      optionsToUse.text,
      optionsToUse.color,
      optionsToUse.radius,
      optionsToUse.curvePosition,
      optionsToUse.showRealAngle,
      optionsToUse.units,
      optionsToUse.precision,
      optionsToUse.autoHide,
      optionsToUse.orientation,
      optionsToUse.textScale,
    );
    if (this.label != null) {
      this.add('label', this.label.eqn.collection);
    }
    // this.updateLabel();
  }

  addCurve(curveOptions: {
    width?: number,
    sides?: number,
  } = {}) {
    const defaultCurveOptions = {
      width: 0.01,
      sides: 50,
      radius: 0.5,
      num: 1,
      step: 0,
    };
    const optionsToUse = Object.assign(
      {}, defaultCurveOptions, curveOptions,
    );
    for (let i = 0; i < optionsToUse.num; i += 1) {
      const curve = this.shapes.polygon({
        sides: optionsToUse.sides,
        radius: optionsToUse.radius + i * optionsToUse.step,
        width: optionsToUse.width,
        color: this.color,
        fill: false,
        transform: new Transform('AngleCurve').rotate(0),
      });
      this.curve = optionsToUse;
      let name = 'curve';
      if (i > 0) {
        name = `${name}${i}`;
      }
      this.add(name, curve);
    }

    // Right Angle
    if (this.autoRightAngle) {
      const right = this.shapes.collection();
      const rightLength = optionsToUse.radius; // / Math.sqrt(2);
      right.add('line1', this.shapes.horizontalLine(
        new Point(rightLength, 0),
        rightLength + optionsToUse.width / 2, optionsToUse.width,
        Math.PI / 2, this.color,
      ));
      right.add('line2', this.shapes.horizontalLine(
        new Point(0, rightLength),
        rightLength - optionsToUse.width / 2, optionsToUse.width,
        0, this.color,
      ));
      this.add('curveRight', right);
    }
  }

  // pulseWidth() {
  //   const line = this._line;
  //   if (line != null) {
  //     line.stopPulsing();
  //     const oldTransformMethod = line.pulse.transformMethod;
  //     const oldPulseCallback = line.pulse.callback;
  //     const finishPulsing = () => {
  //       line.pulse.transformMethod = oldTransformMethod;
  //       line.pulse.callback = oldPulseCallback;
  //     };
  //     line.pulse.callback = finishPulsing;
  //     line.pulse.transformMethod = s => new Transform().scale(1, s);
  //     line.pulseScaleNow(1, 3);
  //   }
  //   const arrow1 = this._arrow1;
  //   const arrow2 = this._arrow2;
  //   if (arrow1 != null) {
  //     arrow1.pulseScaleNow(1, 2);
  //   }
  //   if (arrow2 != null) {
  //     arrow2.pulseScaleNow(1, 2);
  //   }

  //   const label = this._label;
  //   if (label != null) {
  //     label.pulseScaleNow(1, 1.5);
  //   }
  //   this.animateNextFrame();
  // }

  addArrow(
    index: 1 | 2,
    options: {
      width?: number,
      height?: number,
      radius?: number,
      autoHide?: number,
    } | null = {},
  ) {
    let defaultArrowDimension = 0.04;
    if (this.curve) {
      defaultArrowDimension = this.curve.width * 4;
    }
    let defaultArrowRadius = 0.1;
    if (this.curve) {
      defaultArrowRadius = this.curve.radius;
    }
    const defaultArrowOptions = {
      width: defaultArrowDimension,
      height: defaultArrowDimension,
      radius: defaultArrowRadius,
      autoHide: true,
      curveOverlap: 0.3,
    };
    let optionsToUse = {};
    if (options != null) {
      optionsToUse = options;
    }
    const arrowOptions = joinObjects({}, defaultArrowOptions, optionsToUse);
    const { width, height } = arrowOptions;

    let r = Math.PI / 2;
    if (index === 2) {
      r = Math.PI / 2 * 3;
    }

    const a = this.shapes.arrowLegacy(
      width, 0, height, 0,
      this.color, new Transform().rotate(0).translate(0, 0), new Point(0, 0), r,
    );
    // $FlowFixMe
    this[`arrow${index}`] = arrowOptions;
    this.add(`arrow${index}`, a);
    this.update();
  }

  updateCurve(primaryCurveAngle: number, angle: number, rotation: number, show: boolean) {
    const { curve } = this;
    if (curve) {
      for (let i = 0; i < curve.num; i += 1) {
        let name = '_curve';
        if (i > 0) {
          name = `_curve${i}`;
        }
        // $FlowFixMe
        const element = this[name];
        // console.log(element)
        if (element) {
          if (show) {
            element.show();
            if (i === 0) {
              let delta = 0;
              if (this.curve) {
                delta = primaryCurveAngle % (2 * Math.PI / this.curve.sides);
              }
              element.angleToDraw = primaryCurveAngle;
              element.transform.updateRotation(rotation + delta / 2);
            } else {
              let delta = 0;
              if (this.curve) {
                delta = angle % (2 * Math.PI / this.curve.sides);
              }
              element.angleToDraw = angle;
              element.transform.updateRotation(delta / 2);
            }
          } else {
            element.hide();
          }
        }
      }
    }
  }

  update(labelRotationOffset: number | null = null) {
    const { _arrow1, arrow1 } = this;
    const { _arrow2, arrow2 } = this;
    let arrow1Hide = false;
    let arrow2Hide = false;

    let rotationForArrow1 = 0;
    let curveAngle = this.angle;
    let trueCurveAngle = this.angle;
    // const arrow2LengthModifier = 0.5;
    // const arrowLengthMod = 0.9;

    let arrow1Angle = 0;
    let arrow2Angle = 0;
    if (arrow1 && this.arrow1) {
      arrow1Angle = arrow1.height / arrow1.radius * (1 - this.arrow1.curveOverlap);
      curveAngle -= arrow1Angle;
      trueCurveAngle -= arrow1.height / arrow1.radius;
    }
    if (arrow2 && this.arrow2) {
      arrow2Angle = arrow2.height / arrow2.radius * (1 - this.arrow2.curveOverlap);
      curveAngle -= arrow2Angle;
      trueCurveAngle -= arrow2.height / arrow2.radius;
    }

    if (trueCurveAngle < 0) {
      if (arrow1 && arrow1.autoHide) {
        arrow1Hide = true;
        trueCurveAngle += arrow1.height / arrow1.radius;
        curveAngle += arrow1Angle;
      }
      if (arrow2 && arrow2.autoHide) {
        arrow2Hide = true;
        trueCurveAngle += arrow2.height / arrow2.radius;
        curveAngle += arrow2Angle;
      }
    }

    if (_arrow1 && arrow1) {
      if (arrow1Hide) {
        _arrow1.hide();
      } else {
        _arrow1.show();
        _arrow1.transform.updateTranslation(arrow1.radius, 0);
        const arrowLengthAngle = arrow1.height / arrow1.radius;
        _arrow1.transform.updateRotation(Math.PI / 2 + arrowLengthAngle);
        rotationForArrow1 = arrow1Angle;
      }
    }

    if (_arrow2 && arrow2) {
      if (arrow2Hide) {
        _arrow2.hide();
      } else {
        _arrow2.show();
        _arrow2.transform.updateTranslation(polarToRect(arrow2.radius, this.angle));
        const arrowLengthAngle = arrow2.height / arrow2.radius;
        _arrow2.transform.updateRotation(
          this.angle + Math.PI / 2 - arrowLengthAngle,
        );
        // curveAngle += arrowLengthAngle * (1 - arrow2LengthModifier);
      }
    }

    if (labelRotationOffset != null) {
      this.lastLabelRotationOffset = labelRotationOffset;
    }

    this.transform.updateTranslation(this.position);
    this.transform.updateRotation(this.rotation);

    const { _curve, curve, _curveRight } = this;
    if (_curve != null && curve != null) {
      if (this.autoRightAngle
        && this.angle >= Math.PI / 2 - this.rightAngleRange / 2
        && this.angle <= Math.PI / 2 + this.rightAngleRange / 2
      ) {
        if (_curveRight != null) {
          _curveRight.showAll();
        }
        _curve.hide();
        if (_arrow1 != null) {
          _arrow1.hide();
        }
        if (_arrow2 != null) {
          _arrow2.hide();
        }
      } else {
        if (_curveRight != null) {
          _curveRight.hide();
        }
        if (_arrow1 != null && arrow1Hide === false) {
          _arrow1.show();
        }
        if (_arrow2 != null && arrow2Hide === false) {
          _arrow2.show();
        }
        // _curve.show();
        curveAngle = Math.max(curveAngle, 0);
        // _curve.angleToDraw = curveAngle;
        // _curve.transform.updateRotation(rotationForArrow1);
        this.updateCurve(curveAngle, this.angle, rotationForArrow1, true);
      }
    }

    const { _label, label } = this;
    if (_label && label) {
      if (label.autoHide > this.angle) {
        _label.hide();
      } else {
        _label.show();
        if (label.showRealAngle) {
          let angleText = roundNum(this.angle, label.precision)
            .toFixed(label.precision);
          if (label.units === 'degrees') {
            angleText = roundNum(
              this.angle * 180 / Math.PI,
              label.precision,
            ).toFixed(label.precision);
            angleText = `${angleText}º`;
          }
          _label._base.drawingObject.setText(`${angleText}`);
          label.eqn.reArrangeCurrentForm();
        }
        const labelPosition = polarToRect(label.radius, this.angle * label.curvePosition);
        if (label.orientation === 'horizontal') {
          label.updateRotation(
            -this.rotation - this.lastLabelRotationOffset,
            labelPosition,
            label.radius / 5,
            this.angle * label.curvePosition,
          );
        }
        if (label.orientation === 'tangent') {
          label.updateRotation(
            this.angle * label.curvePosition - Math.PI / 2,
            labelPosition,
            label.radius / 50,
            this.angle * label.curvePosition,
          );
        }
      }
    }

    const { _side1, side1 } = this;
    if (_side1 && side1) {
      // _side1.transform.updateRotation(this.rotation);
      _side1.transform.updateScale(side1.length, 1);
    }

    const { _side2, side2 } = this;
    if (_side2 && side2) {
      _side2.transform.updateRotation(this.angle);
      _side2.transform.updateScale(side2.length, 1);
    }
  }

  showAll() {
    super.showAll();
    this.update();
  }
}

export default DiagramObjectAngle;
