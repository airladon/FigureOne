// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, polarToRect,
  threePointAngle, getPoint, clipAngle,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  roundNum,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import EquationLabel from './EquationLabel';
import type { TypeLabelEquationOptions, TypeLabelOptions } from './EquationLabel';
import { Equation } from '../DiagramElements/Equation/Equation';


export type TypeAngleLabelOrientation = 'horizontal' | 'tangent';
export type TypeAngleLabelOptions = {
  // String goes to eqn,
  text: null | string | Array<string> | Equation | TypeLabelEquationOptions,
                                  // Array<string> into eqn forms
  radius?: number,                // Label radius
  curvePosition?: number,         // Label position along curve in %
  curveOffset?: number,           // Label position along curve in rad
  showRealAngle?: boolean,        // Use angle as label
  units?: 'degrees' | 'radians';  // Real angle units
  precision?: number,         // Num decimal places if using angle label
  orientation?: TypeAngleLabelOrientation,  // horiztonal or tangent
  autoHide?: ?number,         // Auto hide label if angle is less than this
  autoHideMax?: ?number,      // Auto hide label if angle is greater than this
  scale?: number,             // Text scale
  color?: Array<number>,      // Text color can be different to curve
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
    autoHideMin?: ?number,     // if angle is less than this, hide curve
    autoHideMax?: ?number,     // if angle is less than this, hide curve
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
  corner?: {
    length?: number,
    width?: number,
    color?: Array<number>,
    style?: 'fill' | 'auto' | 'none',
  },
  pulse?: number | {
    curve?: number | {
      width?: number,
      num?: number,
    },
    label?: number,
    arrow?: number,
    side?: number,
    collection?: number,
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
  curveOffset: number;
  showRealAngle: boolean;
  orientation: TypeAngleLabelOrientation;
  precision: number;
  units: 'degrees' | 'radians';
  autoHide: ?number;
  autoHideMax: ?number;
  location: 'left' | 'right' | 'top' | 'bottom' | 'outside' | 'inside' | 'positive' | 'negative';
  subLocation: 'left' | 'right' | 'bottom' | 'top';

  constructor(
    equation: Object,
    labelText: string | Equation | Array<string>,
    color: Array<number>,
    radius: number,
    curvePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    curveOffset: number = 0,
    showRealAngle: boolean = false,
    units: 'degrees' | 'radians' = 'degrees',
    precision: number = 0,
    autoHide: ?number = null,
    autoHideMax: ?number = null,
    orientation: TypeAngleLabelOrientation = 'horizontal',
    location: 'left' | 'right' | 'top' | 'bottom' | 'outside' | 'inside' | 'positive' | 'negative',
    subLocation: 'left' | 'right' | 'top' | 'bottom',
    scale: number = 0.7,
  ) {
    super(equation, { label: labelText, color, scale });
    this.radius = radius;
    this.curvePosition = curvePosition;
    this.curveOffset = curveOffset;
    this.showRealAngle = showRealAngle;
    this.units = units;
    this.orientation = orientation;
    this.precision = precision;
    this.autoHide = autoHide;
    this.autoHideMax = autoHideMax;
    this.location = location;
    this.subLocation = subLocation;
  }
}


class DiagramObjectAngle extends DiagramElementCollection {
  // Diagram elements
  _curve: ?DiagramElementPrimitive;
  _curveRight: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;
  _side1: ?DiagramElementPrimitive;
  _side2: ?DiagramElementPrimitive;
  _corner: ?DiagramElementPrimitive;
  _label: null | {
    _base: DiagramElementPrimitive;
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

  corner: ?{
    width: number,
    length: number,
    color: Array<number>,
    style: 'fill' | 'auto' | 'none',
  };

  side1: ?{ width: number, length: number };
  side2: ?{ width: number, length: number };
  curve: ?{
    width: number,
    sides: number,
    radius: number,
    num: number,
    step: number,
    autoHideMin: ?number,
    autoHideMax: ?number,
  };

  // angle properties - pulic read only
  angle: number;
  // rotation: number;
  // position: Point;
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
      position?: TypeParsablePoint,
      rotation?: number,
      angle?: number,
      p1?: TypeParsablePoint,
      p2?: TypeParsablePoint,
      p3?: TypeParsablePoint,
      rotationOffset?: number,
    }) => void;

  update: (?number) => void;

  // nextAngle: ?number;
  nextPosition: ?Point;
  // nextRotation: ?number;
  nextStartAngle: ?number;

  pulseDefaultSettings: {
    curve: number | {
      width?: number,
      num?: number,
    },
    label: number,
    arrow: number,
    side: number,
    collection: number,
  };

  // direction: 'positive' | 'negative';
  clip: '0to360' | '-180to180' | 'neg0to360' | '-360to360' | null;
  startAngle: number;
  angle: number;
  position: Point;

  // An angle can be defined by position, startAngle, angle, direction
  // position - where the corner is
  // startAngle - angle of first line
  // angle - +ve or -ve will draw second line relative to first line
  // direction: will determine where the curve is drawn:
  //    +1 from start to angle in the direction of angle's sign
  //    -1 from start to angle in the reverse direction of angle's sign
  //
  // An angle can also be defined with three points p1, p2, p3 where p2 is
  // the corner point.
  // position: p2
  // first line: Line21
  // secondLine: Line23
  // direction: 1 - curve is from Line21 to Line23 in positive direction
  // direction: -1 - curve is from Line21 to Line23 in negative direction

  // position
  // startAngle,
  // angle
  // curve ('positive' | 'negative')
  // clip: 0to360 | -180to180 | neg0to360 | -360to360 | null

  // position: p2
  // startAngle: Line21
  // angle: Line23
  // curve: ('positive' | 'negative')
  // clip: 0to360 | -180to180 | neg0to360 | -360to360 | null

  calculateAngleRotationPosition(options: {
    p1?: TypeParsablePoint,
    p2?: TypeParsablePoint,
    p3?: TypeParsablePoint,
    position?: TypeParsablePoint,
    startAngle?: number,
    angle?: number,
    direction?: 'positive' | 'negative' | 1 | -1,
    clip?: '0to360' | '-180to180' | 'neg0to360' | '-360to360' | null
  }) {
    const defaultOptions = {
      angle: 1,
      direction: 1,
      startAngle: 0,
      position: new Point(0, 0),
      clip: '-360to360',
    };
    const o = joinObjects({}, defaultOptions, options);
    if (o.direction === 'positive') {
      o.direction = 1;
    }
    if (o.direction === 'negative') {
      o.direction = -1;
    }
    let { angle, startAngle, position } = o;
    const { direction, clip } = o;
    position = getPoint(position);
    if (o.p1 != null && o.p2 != null && o.p3 != null) {
      const p1 = getPoint(o.p1);
      const p2 = getPoint(o.p2);
      const p3 = getPoint(o.p3);
      position = p2._dup();
      const line21 = new Line(p2, p1);
      startAngle = line21.angle();
      angle = threePointAngle(p1, p2, p3);
    }
    this.startAngle = startAngle;
    this.position = getPoint(position);
    this.nextStartAngle = this.startAngle;
    this.nextPosition = this.position;
    this.angle = angle;
    this.startAngle = startAngle;
    this.direction = direction;
    this.clip = clip;
  }

  // // deprecate
  // // eslint-disable-next-line class-methods-use-this
  // calculateFromP1P2P3(
  //   p1: Point,
  //   p2: Point,
  //   p3: Point,
  //   direction: 1 | -1 = 1,
  // ) {
  //   const position = p2._dup();
  //   const angle = threePointAngle(p1, p2, p3);
  //   if (direction === 1) {
  //     const L21 = new Line(p2, p1);
  //     const rotation = L21.angle();
  //     return { position, rotation, angle };
  //   }
  //   const L23 = new Line(p2, p1);
  //   const rotation = L23.angle();
  //   return {
  //     position,
  //     rotation,
  //     angle: clipAngle(Math.PI * 2 - angle, '0to360'),
  //   };
  // }

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
      color: shapes.defaultColor,
      // clockwise: false,
      direction: 1,
      autoRightAngle: false,
      rightAngleRange: 0.001,
      curve: null,
      corner: null,
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
      pulse: {
        curve: 1,
        label: 1,
        arrow: 1,
        side: 1,
        collection: 1.8,
      },
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
    // this.nextPosition = getPoint(optionsToUse.position);
    // this.nextRotation = optionsToUse.rotation;
    // this.direction = optionsToUse.direction;
    // this.angle = optionsToUse.angle;
    this.lastLabelRotationOffset = 0;
    this.autoRightAngle = optionsToUse.autoRightAngle;
    this.rightAngleRange = optionsToUse.rightAngleRange;

    this.calculateAngleRotationPosition(optionsToUse);


    // // this.clockwise = optionsToUse.clockwise;
    // // this.radius = optionsToUse.radius;
    // if (optionsToUse.p1 != null
    //   && optionsToUse.p2 != null
    //   && optionsToUse.p3 != null
    // ) {
    //   const { position, rotation, angle } = this.calculateFromP1P2P3(
    //     getPoint(optionsToUse.p1),
    //     getPoint(optionsToUse.p2),
    //     getPoint(optionsToUse.p3),
    //     this.direction,
    //   );
    //   this.angle = angle;
    //   this.nextRotation = rotation;
    //   this.nextPosition = getPoint(position);
    // }
    this.setNextPositionAndRotation();
    // if (this.nextPosition != null) {
    //   this.transform.updateTranslation(this.nextPosition);
    // }
    // if (this.nextRotation != null) {
    //   this.transform.updateRotation(this.nextRotation);
    // }
    // this.nextPosition = null;
    // this.nextRotation = null;

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

    if (optionsToUse.corner != null) {
      const cornerOptions = joinObjects(
        {}, defaultSideOptions, { style: 'fill' }, optionsToUse.corner,
      );
      this.addCorner(cornerOptions);
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

    if (typeof optionsToUse.pulse === 'number') {
      this.pulseDefaultSettings = {
        curve: defaultOptions.pulse.curve,
        label: defaultOptions.pulse.label,
        arrow: defaultOptions.pulse.arrow,
        side: defaultOptions.pulse.side,
        collection: optionsToUse.pulse,
      };
    } else {
      this.pulseDefaultSettings = {
        curve: optionsToUse.pulse.curve || 1,
        label: optionsToUse.pulse.label || 1,
        arrow: optionsToUse.pulse.arrow || 1,
        side: optionsToUse.pulse.side || 1,
        collection: optionsToUse.pulse.collection || 1,
      };
    }

    // this.pulseDefault = (done) => {
    //   this.pulseScaleNow(1, 1.7, 0, done);
    // };
    this.pulseDefault = (done) => {
      let doneToUse = done;
      const pulseSettings = this.pulseDefaultSettings;
      if (typeof pulseSettings.curve === 'number') {
        if (pulseSettings.curve !== 1 && this._curve != null) {
          this._curve.pulseScaleNow(1, pulseSettings.curve, 0, doneToUse);
          doneToUse = null;
        }
      } else if (this._curve != null && pulseSettings.curve != null) {
        const defaultCurveThickOptions = { width: 2, num: 5 };
        const curveOptions = joinObjects(defaultCurveThickOptions, pulseSettings.curve);
        // $FlowFixMe
        this._curve.pulseThickNow(1, curveOptions.width, curveOptions.num, doneToUse);
        doneToUse = null;
      }
      if (pulseSettings.label !== 1 && this._label != null) {
        this._label.pulseScaleNow(1, pulseSettings.label, 0, doneToUse);
        doneToUse = null;
      }
      if (pulseSettings.arrow !== 1) {
        if (this._arrow1 != null) {
          this._arrow1.pulseScaleNow(1, pulseSettings.arrow, 0, doneToUse);
          doneToUse = null;
        }
        if (this._arrow2 != null) {
          this._arrow2.pulseScaleNow(1, pulseSettings.arrow, 0, doneToUse);
          doneToUse = null;
        }
      }
      if (pulseSettings.side !== 1) {
        if (this._side1 != null) {
          this._side1.pulseScaleNow(1, pulseSettings.side, 0, doneToUse);
          doneToUse = null;
        }
        if (this._side2 != null) {
          this._side2.pulseScaleNow(1, pulseSettings.side, 0, doneToUse);
          doneToUse = null;
        }
      }
      if (pulseSettings.collection !== 1) {
        this.pulseScaleNow(1, pulseSettings.collection, 0, doneToUse);
      }
    };

    this.update();
    if (optionsToUse.mods != null && optionsToUse.mods !== {}) {
      this.setProperties(optionsToUse.mods);
    }
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'angle',
      'lastLabelRotationOffset',
    ];
  }

  _fromState(state: Object) {
    joinObjects(this, state);
    this.setAngle({
      angle: this.angle,
      rotationOffset: this.lastLabelRotationOffset,
    });
    return this;
  }

  setNextPositionAndRotation() {
    if (this.nextPosition != null) {
      this.transform.updateTranslation(this.nextPosition);
    }
    if (this.nextStartAngle != null) {
      this.transform.updateRotation(this.nextStartAngle);
    }
    this.nextPosition = null;
    this.nextStartAngle = null;
  }

  setAngle(options: {
      position?: TypeParsablePoint,
      rotation?: number,
      angle?: number,
      p1?: TypeParsablePoint,
      p2?: TypeParsablePoint,
      p3?: TypeParsablePoint,
      rotationOffset?: number,
    } = {}) {
    if (options.position != null) {
      this.nextPosition = getPoint(options.position);
    }
    if (options.rotation != null) {
      this.nextRotation = options.rotation;
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
      this.nextRotation = rotation;
      this.nextPosition = getPoint(position);
    }
    const { corner, _corner } = this;
    if (corner != null && _corner != null) {
      const points = this.getCornerPoints(corner.length);
      _corner.custom.updatePoints({ points });
    }
    if (options.rotationOffset != null) {
      this.update(options.rotationOffset);
    } else {
      this.update();
    }
  }

  getCornerPoints(length: number) {
    return [
      new Point(length, 0),
      new Point(0, 0),
      new Point(length * Math.cos(this.angle), length * Math.sin(this.angle)),
    ];
  }

  addCorner(options: {
    length: number,
    width: number,
    color: Array<number>,
    style: 'fill' | 'auto' | 'none',
  }) {
    const {
      width, color, length, style,
    } = options;
    const corner = this.shapes.polyline({
      width,
      color,
      points: this.getCornerPoints(length),
      cornerStyle: style,
    });
    this.corner = {
      length, width, color, style,
    };
    this.add('corner', corner);
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
    labelText?: string | Equation | Array<string> | TypeLabelOptions,
    radius?: number,
    curvePosition?: number,
    curveOffset?: number,
    showRealAngle?: boolean,
    units?: 'degrees' | 'radians',
    precision?: number,
    orientation?: TypeAngleLabelOrientation,
    autoHide?: number,
    scale?: number,
  } = {}) {
    const defaultLabelOptions = {
      text: null,
      radius: 0.4,
      curvePosition: 0.5,
      curveOffset: 0,
      showRealAngle: false,
      units: 'degrees',
      precision: 0,
      orientation: 'horizontal',
      autoHide: null,
      autoHideMax: null,
      scale: 0.7,
      color: this.color,
      location: 'outside',
    };
    if (this.curve) {
      defaultLabelOptions.radius = Math.max(
        this.curve.radius,
        this.curve.radius + (this.curve.num - 1) * this.curve.step,
      );
    }

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
      optionsToUse.curveOffset,
      optionsToUse.showRealAngle,
      optionsToUse.units,
      optionsToUse.precision,
      optionsToUse.autoHide,
      optionsToUse.autoHideMax,
      optionsToUse.orientation,
      optionsToUse.location,
      optionsToUse.subLocation,
      optionsToUse.scale,
    );
    if (this.label != null) {
      this.add('label', this.label.eqn);
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
      autoHideMin: null,
      autoHideMax: null,
    };
    const optionsToUse = joinObjects(
      {}, defaultCurveOptions, curveOptions,
    );

    let { direction } = this;
    if (this.angle < 0 && this.direction === -1) {
      direction = 1;
    } else if (this.angle < 0 && this.direction === 1) {
      direction = -1;
    }

    for (let i = 0; i < optionsToUse.num; i += 1) {
      const curve = this.shapes.polygonSweep({
        sides: optionsToUse.sides,
        radius: optionsToUse.radius + i * optionsToUse.step,
        width: optionsToUse.width,
        color: this.color,
        fill: false,
        direction,
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
      const rightLength = optionsToUse.radius * 0.707; // / Math.sqrt(2);
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

  change(options: {
    radius?: number,
    curveRadius?: number,
    curvePosition?: number,
    curveOffset?: number,
  }) {
    if (this._curve != null && options.radius != null) {
      this._curve.custom.update({ radius: options.radius });
    }
    if (this.label != null) {
      if (options.curveRadius != null) {
        this.label.radius = options.curveRadius;
      }
      if (options.curvePosition != null) {
        this.label.curvePosition = options.curvePosition;
      }
      if (options.curveOffset != null) {
        this.label.curveOffset = options.curveOffset;
      }
    }
  }


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
      let { direction } = this;
      if (this.angle < 0 && this.direction === -1) {
        direction = 1;
      } else if (this.angle < 0 && this.direction === 1) {
        direction = -1;
      }
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
                const sideAngle = 2 * Math.PI / this.curve.sides;
                const numSides = Math.floor(roundNum(primaryCurveAngle / sideAngle));
                delta = primaryCurveAngle - numSides * sideAngle;
              }
              element.angleToDraw = clipAngle(primaryCurveAngle, '0to360');
              element.transform.updateRotation(rotation + direction * delta / 2);
            } else {
              let delta = 0;
              if (this.curve) {
                delta = angle % (2 * Math.PI / this.curve.sides);
              }
              element.angleToDraw = clipAngle(angle, '0to360');
              element.transform.updateRotation(direction * delta / 2);
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
    let fullCurveAngle = clipAngle(this.angle, '-360to360');
    if (fullCurveAngle >= 0 && this.direction === -1) {
      fullCurveAngle = Math.PI * 2 - fullCurveAngle;
    } else if (fullCurveAngle < 0 && this.direction === 1) {
      fullCurveAngle = Math.abs(fullCurveAngle);
    } else if (fullCurveAngle < 0 && this.direction === -1) {
      fullCurveAngle = Math.PI * 2 - Math.abs(fullCurveAngle);
    }
    let curveAngle = fullCurveAngle;
    let trueCurveAngle = fullCurveAngle;
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

    this.setNextPositionAndRotation();
    // this.transform.updateTranslation(this.position);
    // this.transform.updateRotation(this.rotation);

    const { _curve, curve, _curveRight } = this;
    if (_curve != null && curve != null) {
      if (
        (curve.autoHideMin != null && fullCurveAngle < curve.autoHideMin)
        || (curve.autoHideMax != null && fullCurveAngle > curve.autoHideMax)
      ) {
        if (_curveRight != null) {
          _curveRight.hide();
        }
        _curve.hide();
        if (_arrow1 != null) {
          _arrow1.hide();
        }
        if (_arrow2 != null) {
          _arrow2.hide();
        }
      } else if (this.autoRightAngle
        && fullCurveAngle >= Math.PI / 2 - this.rightAngleRange / 2
        && fullCurveAngle <= Math.PI / 2 + this.rightAngleRange / 2
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
        this.updateCurve(curveAngle, fullCurveAngle, rotationForArrow1, true);
      }
    }

    // const { _label, label } = this;
    // if (_label && label) {
    //   if (label.autoHide > this.angle) {
    //     _label.hide();
    //   } else {
    //     _label.show();
    //     if (label.showRealAngle) {
    //       let angleText = roundNum(this.angle, label.precision)
    //         .toFixed(label.precision);
    //       if (label.units === 'degrees') {
    //         angleText = roundNum(
    //           this.angle * 180 / Math.PI,
    //           label.precision,
    //         ).toFixed(label.precision);
    //         angleText = `${angleText}º`;
    //       }
    //       label.setText(angleText);
    //       // _label._base.drawingObject.setText(`${angleText}`);
    //       // label.eqn.reArrangeCurrentForm();
    //     }
    //     const labelPosition = polarToRect(label.radius, this.angle * label.curvePosition);
    //     if (label.orientation === 'horizontal') {
    //       label.updateRotation(
    //         -this.rotation - this.lastLabelRotationOffset,
    //         labelPosition,
    //         label.radius / 5,
    //         this.angle * label.curvePosition,
    //       );
    //     }
    //     if (label.orientation === 'tangent') {
    //       label.updateRotation(
    //         this.angle * label.curvePosition - Math.PI / 2,
    //         labelPosition,
    //         label.radius / 50,
    //         this.angle * label.curvePosition,
    //       );
    //     }
    //   }
    // }
    this.updateLabel();

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

  checkLabelForRightAngle() {
    if (this.autoRightAngle === false) {
      return;
    }
    const { label } = this;
    let setRight = false;
    if (label != null) {
      const angle = parseFloat(label.getText());
      if (angle === 90) {
        setRight = true;
      }
    }
    if (setRight === false) {
      return;
    }
    const {
      _curveRight, _curve, _arrow1, _arrow2,
    } = this;
    if (_curveRight != null) {
      _curveRight.showAll();
    }
    if (_curve != null) {
      _curve.hide();
    }
    if (_arrow1 != null) {
      _arrow1.hide();
    }
    if (_arrow2 != null) {
      _arrow2.hide();
    }
  }

  getAngle(units: 'deg' | 'rad' = 'rad') {
    if (units === 'deg') {
      return this.angle * 180 / Math.PI;
    }
    return this.angle;
  }

  setLabel(text: string) {
    const { label } = this;
    if (label != null) {
      label.setText(text);
      label.showRealAngle = false;
    }
    this.updateLabel();
  }

  getLabel() {
    if (this.label != null) {
      return this.label.getText();
    }
    return '';
  }

  setLabelToRealAngle() {
    const { label } = this;
    if (label != null) {
      label.showRealAngle = true;
    }
    this.updateLabel();
  }

  updateLabel(rotationOffset: ?number = null) {
    if (rotationOffset != null) {
      this.lastLabelRotationOffset = rotationOffset;
    }
    const { _label, label } = this;
    if (_label && label) {
      if (
        (label.autoHide != null && label.autoHide > this.angle)
        || (label.autoHideMax != null && this.angle > label.autoHideMax)
      ) {
        _label.hide();
      } else {
        _label.show();
        if (label.showRealAngle) {
          let { angle } = this;
          if (angle >= 0 && this.direction === -1) {
            angle = -(Math.PI * 2 - Math.abs(angle));
          } else if (angle < 0 && this.direction === -1) {
            angle = Math.PI * 2 - Math.abs(angle);
          }
          angle = clipAngle(angle, this.clip);
          let angleText = roundNum(angle, label.precision)
            .toFixed(label.precision);
          if (label.units === 'degrees') {
            let a = roundNum(angle * 180 / Math.PI, label.precision);
            if (a === 360) {
              a = 0;
            }
            angleText = a.toFixed(label.precision);
            angleText = `${angleText}º`;
          }
          label.setText(angleText);
          // _label._base.drawingObject.setText(`${angleText}`);
          // label.eqn.reArrangeCurrentForm();
        }
        let angle = clipAngle(this.angle, '-360to360');
        let lineOffsetAngle = Math.PI / 2;
        if (angle < 0) {
          lineOffsetAngle = -Math.PI / 2;
        }
        if (angle >= 0 && this.direction === -1) {
          angle = -(Math.PI * 2 - angle);
        } else if (angle < 0 && this.direction === -1) {
          angle = Math.PI * 2 - Math.abs(angle);
        }
        const labelPosition = polarToRect(
          label.radius, angle * label.curvePosition,
        );
        let { orientation, location } = label;
        if (orientation === 'tangent') {
          orientation = 'baseToLine';
        }
        if (location === 'outside') {
          location = 'negative';
          if (this.direction === -1) {
            location = 'positive';
          }
        }
        if (location === 'inside') {
          location = 'positive';
          if (this.direction === -1) {
            location = 'negative';
          }
        }
        let lineAngle;
        // if (this.angle >= 0 && this.direction === 1) {
        lineAngle = clipAngle(clipAngle(angle, '0to360') * label.curvePosition + lineOffsetAngle, '0to360');
        // } else if (this.angle >= 0 && this.direction === -1) {
        //   lineAngle = clipAngle(-clipAngle(Math.PI * 2 - this.angle, '0to360') * label.curvePosition - Math.PI / 2, '0to360');
        // }
        console.log(lineAngle * 180 / Math.PI)
        // console.log(
        //   roundNum(lineAngle * 180 / Math.PI, 0),
        //   roundNum (clipAngle(this.angle * label.curvePosition + Math.PI / 2, '0to360') * 180 / Math.PI, 0),
        //   this.getRotation())
        // console.log(roundNum(lineAngle * 180 / Math.PI, 0))
        // console.log(rotationOffset)
        // console.log(rotationOffset)
        label.updateRotation(
          labelPosition, lineAngle, label.curveOffset, location, label.subLocation, orientation,
          this.lastLabelRotationOffset == null ? 0 : this.lastLabelRotationOffset,
          // -lineAngle,
          'oval', false,
        );
        // if (label.orientation === 'horizontal') {
        //   label.updateRotation(
        //     -this.getRotation() - this.lastLabelRotationOffset,
        //     labelPosition,
        //     label.radius / 5,
        //     this.angle * label.curvePosition + label.curveOffset,
        //   );
        // }
        // if (label.orientation === 'tangent') {
        //   label.updateRotation(
        //     this.angle * label.curvePosition + label.curveOffset - Math.PI / 2,
        //     labelPosition,
        //     label.radius / 50,
        //     this.angle * label.curvePosition + label.curveOffset,
        //   );
        // }
      }
    }
  }

  showAll() {
    super.showAll();
    this.update();
  }
}

export default DiagramObjectAngle;

export type TypeLabelledAngle = {
  _curve: DiagramElementPrimitive;
  _label: {
    _base: DiagramElementPrimitive;
  } & Equation;
} & DiagramObjectAngle;

