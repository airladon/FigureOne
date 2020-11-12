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
import { Equation } from '../DiagramElements/Equation/Equation';
import { simplifyArrowOptions, getArrowLength } from '../DrawingObjects/Geometries/arrow';
import type { OBJ_LineArrows, OBJ_LineArrow } from '../DrawingObjects/Geometries/arrow';
import type { OBJ_Pulse } from '../Element';
import type { EQN_Equation } from '../DiagramElements/Equation/Equation';
import type { TypeWhen } from '../webgl/GlobalAnimation';
import type {
  TypeLabelOrientation, TypeLabelLocation, TypeLabelSubLocation,
} from './EquationLabel';

// export type TypeAngleLabelOrientation = 'horizontal' | 'tangent';

/**
 * Advanced angle label options object.
 *
 * An angle can be annotated with a label using the `text` property and can be:
 * - text (`string`, or Array<`string`)
 * - an equation (`Equation`, `EQN_Equation`)
 * - real length of line (`null`)
 *
 * In all cases, an actual {@link Equation} is created as the label. The
 * equation can have multiple forms, which can be set using the `showForm`
 * method.
 *
 * If `text`: `string`, then an equation with a single form named `base` will
 * be created with a single element being the string text.
 *
 * If `text`: `Array<string>`, then an equation with a form for each element
 * of the array is created. Each form is named '0', '1', '2'... corresponding
 * with the index of the array. Each form is has a single element, being the
 * text at that index.
 *
 * Use `text`: `Equation` or `EQN_Equation` to create completely custom
 * equations with any forms desirable.
 *
 * If the label text is the real angle (`null`), then the number
 * of decimal places can be selected with `precision` and the units with
 * `units`.
 *
 * By default, the label is placed at the same radius as the curve (if
 * a curve exists). An independant radius can be selected with `radius`.
 *
 * The space between the radius and the label is defined with `offset`. An
 * `offset` of 0 puts the center of the label on the radius. Any
 * positive or negative value of offset will move the label so no part of the
 * label overlaps the line, and then the closest part of the label is separated
 * from the line by `offset`.
 *
 * To situate the label, use `curvePosition`, `location` and
 * `subLocation`. By default the label will be a percentage `curvePosition`
 * of the angle. `location` then defines which side of the radius the label is
 * on, while `subLocation` defines the backup location for invalid cases of
 * `location`. See {@link TypeLabelLocation} and
 * {@link TypeLabelSubLocation}. `location` can additionaly place the
 * labels off the ends of the angle.
 *
 * To automatically update the label location and orientation as the line
 * transform (translation, rotation or scale) changes then use `update: true`.
 *
 * @property {null | string | Array<string> | Equation | EQN_Equation } text
 * or equation to show. Use `null` to show real angle.
 * @property {'degrees' | 'radians'} units (`'degrees'`)
 * @property {number} [precision] (`0`)
 * @property {number} [radius] overwrite default radius
 * @property {number} [offset] space to radius (`0`)
 * @property {number} [curvePosition] where the label is along the curve of the
 * angle, in percent of curve from the start of the angle (`0.5`)
 * @property {TypeLabelLocation} [location]
 * @property {TypeLabelSubLocation} [subLocation]
 * @property {TypeLabelOrientation} [orientation]
 * @property {boolean} [update] (`false`)
 * @property {number} [scale] size of the label
 * @property {Array<number>} [color]
 */
export type TypeAngleLabelOptions = {
  text: null | string | Array<string> | Equation | EQN_Equation,
  units?: 'degrees' | 'radians';  // Real angle units
  precision?: number,             // Num decimal places if using angle label
  radius?: number,                // Label radius
  offset?: number,                // Label position along curve in rad
  curvePosition?: number,         // Label position along curve in %
  location?: TypeLabelLocation,
  subLocation?: TypeLabelSubLocation,
  orientation?: TypeLabelOrientation,
  autoHide?: ?number,             // Auto hide label if angle is less than this
  autoHideMax?: ?number,          // Auto hide label if angle greater than this
  scale?: number,                 // Text scale
  color?: Array<number>,          // Text color can be different to curve
};

/**
 *
 */
export type ADV_Angle = {
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
  // arrow1?: {                // Define arrow at start of curve
  //   width?: number,           // Arrow width
  //   height?: number,          // Arrow height
  //   radius?: number,          // Arrow radius (can be different to curve rad)
  //   autoHide?: boolean,       // Autohide arrow when arrow(s) height > angle
  //   curveOverlap?: number,    // Percentage height to overlap curve
  // },
  // arrow2?: {                  // Define arrow at end of curve
  //   width?: number,
  //   height?: number,
  //   radius?: number,
  //   autoHide?: boolean,
  //   curveOverlap?: number,    // Percentage height to overlap curve
  // },
  // arrows?: {                // Define both arrows - overwrites arrow1 and 2
  //   width?: number,
  //   height?: number,
  //   radius?: number,
  //   autoHide?: boolean,
  //   curveOverlap?: number,    // Percentage height to overlap curve
  // } | boolean,
  arrow: string | OBJ_LineArrows & {
    curveOverlap?: number,
    autoHide?: boolean,
    radius?: number,
  };
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
  pulseAngle?: number | {
    curve?: number | OBJ_Pulse,
    label?: number | OBJ_Pulse,
    arrow?: number,
    side?: number,
    corner?: number | OBJ_Pulse,
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
  offset: number;
  showRealAngle: boolean;
  orientation: TypeLabelOrientation;
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
    offset: number = 0,
    showRealAngle: boolean = false,
    units: 'degrees' | 'radians' = 'degrees',
    precision: number = 0,
    autoHide: ?number = null,
    autoHideMax: ?number = null,
    orientation: TypeLabelOrientation = 'horizontal',
    location: 'left' | 'right' | 'top' | 'bottom' | 'outside' | 'inside' | 'positive' | 'negative',
    subLocation: 'left' | 'right' | 'top' | 'bottom',
    scale: number = 0.7,
  ) {
    super(equation, { label: labelText, color, scale });
    this.radius = radius;
    this.curvePosition = curvePosition;
    this.offset = offset;
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

/**
 * Angle pulse options object
 *
 * @property {number | OBJ_Pulse} [curve] curve scale or pulse options object
 * @property {number | OBJ_Pulse} [label] label scale or pulse options object
 * @property {number | OBJ_Pulse} [arrow] arrow scale or pulse options object
 * @property {number | OBJ_Pulse} [corner] corner scale or pulse options object
 * @property {number} [thick] if more than one, the the curve, arrow and corner
 * pulse defaults will be for thick pulses, otherwise they will default to
 * pulsing scale from the corner of the angle (`1`)
 * @property {function(): void} [done] execute when pulsing is finished
 * @property {number} [duration] pulse duration in seconds
 * @property {number} [frequency] pulse frequency in pulses per second
 * @property {TypeWhen} [when] when to start the pulse (`'nextFrame'`)
 */
export type OBJ_PulseAngle = {
  curve: number | OBJ_Pulse,
  corner: number | OBJ_Pulse,
  arrow: number | OBJ_Pulse,
  label: number | OBJ_Pulse,
  thick: number,
  done?: ?() => void,
  duration?: number,
  when?: TypeWhen,
  frequency?: number,
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

  label: ?AngleLabel;
  arrow: ?{
    start?: OBJ_LineArrow & {
      radius: number, curveOverlap: number, autoHide: boolean, height: number,
    },
    end?: OBJ_LineArrow & {
      radius: number, curveOverlap: number, autoHide: boolean, height: number,
    },
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

  startAngle: number;
  angle: number;
  direction: -1 | 1;
  lastLabelRotationOffset: number;
  autoRightAngle: boolean;
  rightAngleRange: number;

  // angle properties - pulic read/write

  // angle properties - private internal use only
  shapes: Object;
  equation: Object;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;

  nextPosition: ?Point;
  nextStartAngle: ?number;

  pulseAngleDefaults: {
    curve: number | OBJ_Pulse,
    corner: number | OBJ_Pulse,
    label: number | OBJ_Pulse,
    arrow: number | OBJ_Pulse,
    thick: number,
    duration: number,
    frequency: number,
  }

  autoUpdateSubscriptionId: number;

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
    // direction?: 'positive' | 'negative' | 1 | -1,
    // clip?: '0to360' | '-180to180' | 'neg0to360' | '-360to360' | null
  }) {
    const defaultOptions = {
      angle: 1,
      // direction: 1,
      startAngle: 0,
      // position: new Point(0, 0),
      // clip: '-360to360',
    };
    const o = joinObjects({}, defaultOptions, options);
    // if (o.direction === 'positive') {
    //   o.direction = 1;
    // }
    // if (o.direction === 'negative') {
    //   o.direction = -1;
    // }
    let { angle, startAngle, position } = o;
    // const { direction } = this;
    if (position != null) {
      position = getPoint(position);
    }
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
    this.nextStartAngle = this.startAngle;
    if (position != null) {
      this.nextPosition = position;
    }
    this.angle = angle;
    this.startAngle = startAngle;
    // this.direction = direction;
    // this.clip = clip;
  }

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: ADV_Angle = {},
  ) {
    const defaultOptions = {
      position: new Point(0, 0),
      color: shapes.defaultColor,
      direction: 1,
      autoRightAngle: false,
      rightAngleRange: 0.001,
      curve: null,
      corner: null,
      sides: null,
      sideStart: null,
      sideStop: null,
      label: null,
      pulseAngle: {
        curve: 1.5,
        label: 1.5,
        arrow: 1.5,
        side: 1.5,
        corner: 1.5,
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
    this.autoUpdateSubscriptionId = 0;

    // Calculate and store the angle geometry
    // this.nextPosition = getPoint(optionsToUse.position);
    // this.nextRotation = optionsToUse.rotation;
    // this.direction = optionsToUse.direction;
    // this.angle = optionsToUse.angle;
    this.lastLabelRotationOffset = 0;
    this.autoRightAngle = optionsToUse.autoRightAngle;
    this.rightAngleRange = optionsToUse.rightAngleRange;
    if (optionsToUse.direction === 'positive') {
      this.direction = 1;
    } else if (optionsToUse.direction === 'negative') {
      this.direction = -1;
    } else {
      this.direction = optionsToUse.direction;
    }
    // this.clip = optionsToUse.clip;

    this.calculateAngleRotationPosition(optionsToUse);
    this.setNextPositionAndRotation();

    // Setup default values for sides, arrows, curve and label
    this.side1 = null;
    this.side2 = null;
    this.curve = null;
    this.label = null;

    // If the curve is to be shown (and not just a label) then make it
    this._curve = null;
    if (optionsToUse.curve) {
      this.addCurve(optionsToUse.curve);
    }

    // Arrow related properties
    this._arrow1 = null;
    this._arrow2 = null;
    if (optionsToUse.arrow != null) {
      let width = 0.01;
      if (this.curve) {
        width = this.curve.width;
      }
      let autoHide = true;
      if (typeof optionsToUse.arrow !== 'string' && optionsToUse.arrow.autoHide != null) {
        autoHide = optionsToUse.arrow.autoHide;
      }
      let defaultArrowRadius = 0.1;
      if (this.curve) {
        defaultArrowRadius = this.curve.radius;
      }
      if (typeof optionsToUse.arrow !== 'string' && optionsToUse.arrow.radius != null) {
        defaultArrowRadius = optionsToUse.arrow.radius;
      }
      let curveOverlap = 0.3;
      if (typeof optionsToUse.arrow !== 'string' && optionsToUse.arrow.curveOverlap != null) {
        curveOverlap = optionsToUse.arrow.curveOverlap;
      }
      const arrowOptions = simplifyArrowOptions(optionsToUse.arrow, width);
      this.arrow = arrowOptions;
      if (this.arrow == null) {
        return;
      }

      const defaultO = {
        radius: defaultArrowRadius,
        autoHide,
        curveOverlap,
      };

      if (this.arrow.start != null) { // $FlowFixMe
        this.arrow.start = joinObjects({}, defaultO, this.arrow.start);
      }
      if (this.arrow.end != null) { // $FlowFixMe
        this.arrow.end = joinObjects({}, defaultO, this.arrow.end);
      }
      this.addArrow('start');
      this.addArrow('end');
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

    this.pulseAngleDefaults = {
      curve: optionsToUse.pulseAngle.curve || 1.5,
      corner: optionsToUse.pulseAngle.corner || 1.5,
      label: optionsToUse.pulseAngle.label || 1.5,
      arrow: optionsToUse.pulseAngle.arrow || 1.5,
      duration: optionsToUse.pulseAngle.duration || 1.5,
      frequency: optionsToUse.pulseAngle.frequency || 0,
      thick: optionsToUse.pulseAngle.thick || 1,
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

  setAutoUpdate(update: boolean = true) {
    if (update) {
      this.autoUpdateSubscriptionId = this.subscriptions.add('setTransform', () => {
        this.updateLabel(this.getRotation());
        // this.updateMovePads();
      });
    } else {
      // console.log(this.autoUpdateSubscriptionId)
      this.subscriptions.remove('setTransform', this.autoUpdateSubscriptionId);
      this.autoUpdateSubscriptionId = -1;
    }
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
      startAngle?: number,
      angle?: number,
      p1?: TypeParsablePoint,
      p2?: TypeParsablePoint,
      p3?: TypeParsablePoint,
    } = {}) {
    this.calculateAngleRotationPosition(options);
    const { corner, _corner } = this;
    if (corner != null && _corner != null) {
      const points = this.getCornerPoints(corner.length);
      _corner.custom.updatePoints({ points });
    }
    // if (options.rotationOffset != null) {
    //   this.update(options.rotationOffset);
    // } else {
    this.update();
    // }
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

  addLabel(options: TypeAngleLabelOptions = {}) {
    const defaultLabelOptions = {
      text: null,
      radius: 0.4,
      curvePosition: 0.5,
      offset: 0,
      showRealAngle: false,
      units: 'degrees',
      precision: 0,
      orientation: 'horizontal',
      autoHide: null,
      autoHideMax: null,
      scale: 0.7,
      color: this.color,
      location: 'outside',
      update: false,
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
      optionsToUse.offset,
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
    this.setAutoUpdate(optionsToUse.update);
    this.updateLabel();
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
      const curve = this.shapes.polygon({
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
      right.add('line1', this.shapes.line({
        p1: [rightLength, 0],
        length: rightLength + optionsToUse.width / 2,
        width: optionsToUse.width,
        angle: Math.PI / 2 * direction,
        color: this.color,
      }));
      right.add('line2', this.shapes.line({
        p1: [0, rightLength * direction],
        length: rightLength + optionsToUse.width / 2,
        width: optionsToUse.width,
        angle: 0,
        color: this.color,
      }));
      this.add('curveRight', right);
    }
  }

  change(options: {
    radius?: number,
    curveRadius?: number,
    curvePosition?: number,
    offset?: number,
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
      if (options.offset != null) {
        this.label.offset = options.offset;
      }
    }
  }


  addArrow(
    lineEnd: 'start' | 'end',
  ) {
    // $FlowFixMe
    if (this.arrow[lineEnd] == null) {
      return;
    }
    const o = this.arrow[lineEnd];
    const a = this.shapes.arrow(joinObjects(
      {},
      o,
      {
        // angle: r,
        color: this.color,
        transform: new Transform().rotate(0).translate(0, 0),
      },
    ));
    // $FlowFixMe
    const arrowLength = getArrowLength(o)[1];
    let index = 1;
    if (lineEnd === 'end') {
      index = 2;
    }
    // $FlowFixMe
    this.arrow[lineEnd] = {
      height: arrowLength,
      radius: o.radius || 0,
      autoHide: o.autoHide,
      curveOverlap: o.curveOverlap,
    };
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
      let r = rotation;
      if (this.direction === -1) {
        r *= -1;
      }
      if (this.angle < 0) {
        r *= -1;
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
              element.transform.updateRotation(r + direction * delta / 2);
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
    const { _arrow1 } = this;
    const { _arrow2 } = this;
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
    if (this.arrow != null && this.arrow.start != null) {
      const { start } = this.arrow;
      const radius = start.radius || 0;
      arrow1Angle = start.height / radius * (1 - start.curveOverlap);
      curveAngle -= arrow1Angle;
      trueCurveAngle -= start.height / radius;
    }
    if (this.arrow != null && this.arrow.end != null) {
      const { end } = this.arrow;
      const radius = end.radius || 0;
      arrow2Angle = end.height / radius * (1 - end.curveOverlap);
      curveAngle -= arrow2Angle;
      trueCurveAngle -= end.height / radius;
    }

    if (this.arrow != null && trueCurveAngle < 0) {
      if (this.arrow.start != null && this.arrow.start.autoHide) {
        const radius = this.arrow.start.radius || 0;
        arrow1Hide = true;
        trueCurveAngle += this.arrow.start.height / radius;
        curveAngle += arrow1Angle;
      }
      if (this.arrow.end != null && this.arrow.end.autoHide) {
        const radius = this.arrow.end.radius || 0;
        arrow2Hide = true;
        trueCurveAngle += this.arrow.end.height / radius;
        curveAngle += arrow2Angle;
      }
    }

    if (_arrow1 && this.arrow != null && this.arrow.start != null) {
      if (arrow1Hide) {
        _arrow1.hide();
      } else {
        _arrow1.show();
        // $FlowFixMe
        _arrow1.transform.updateTranslation(this.arrow.start.radius, 0);
        // $FlowFixMe
        const arrowLengthAngle = this.arrow.start.height / this.arrow.start.radius;
        let r = Math.PI;
        if (this.direction === -1) {
          r += Math.PI;
        }
        if (this.angle < 0) {
          r += Math.PI;
        }
        _arrow1.transform.updateRotation(r + Math.PI / 2 + arrowLengthAngle);
        rotationForArrow1 = arrow1Angle;
      }
    }

    if (_arrow2 && this.arrow != null && this.arrow.end != null) {
      if (arrow2Hide) {
        _arrow2.hide();
      } else {
        _arrow2.show();
        // $FlowFixMe
        _arrow2.transform.updateTranslation(polarToRect(this.arrow.end.radius, this.angle));
        // $FlowFixMe
        const arrowLengthAngle = this.arrow.end.height / this.arrow.end.radius;
        let r = 0;
        if (this.direction === -1) {
          r += Math.PI;
        }
        if (this.angle < 0) {
          r += Math.PI;
        }
        _arrow2.transform.updateRotation(
          r + this.angle + Math.PI / 2 - arrowLengthAngle,
        );
        // curveAngle += arrowLengthAngle * (1 - arrow2LengthModifier);
      }
    }

    if (labelRotationOffset != null) {
      this.lastLabelRotationOffset = labelRotationOffset;
    }

    this.setNextPositionAndRotation();

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
        (label.autoHide != null && label.autoHide > Math.abs(this.angle))
        || (label.autoHideMax != null && Math.abs(this.angle) > label.autoHideMax)
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
          // angle = clipAngle(angle, this.clip);
          angle = Math.abs(angle);
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
        let labelPosition = polarToRect(
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
        let lineAngle = clipAngle(clipAngle(angle, '0to360') * label.curvePosition + lineOffsetAngle, '0to360');
        if (location === 'start') {
          labelPosition = new Point(label.radius, 0);
          lineAngle = 0;
        }
        if (location === 'end') {
          labelPosition = polarToRect(
            label.radius, angle,
          );
          lineAngle = clipAngle(angle, '0to360');
        }
        label.updateRotation(
          labelPosition, lineAngle, label.offset, location, label.subLocation, orientation,
          this.lastLabelRotationOffset == null ? 0 : this.lastLabelRotationOffset,
          'oval', false, Math.PI / 2, -Math.PI / 2,
        );
      }
    }
  }

  pulseAngle(options?: OBJ_PulseAngle = {}) {
    const defaultOptions = {
      curve: this.pulseAngleDefaults.curve,
      label: this.pulseAngleDefaults.label,
      arrow: this.pulseAngleDefaults.arrow,
      corner: this.pulseAngleDefaults.corner,
      done: null,
      duration: this.pulseAngleDefaults.duration,
      frequency: this.pulseAngleDefaults.frequency,
      when: 'nextFrame',
      thick: this.pulseAngleDefaults.thick,
    };
    const o = joinObjects(defaultOptions, options);
    let { done } = o;
    const pulse = (elementName, oName, oScale, oThick) => {
      const element = this.elements[elementName];
      if (element != null && element.isShown) {
        let pulseOptions;
        const defaultThick = joinObjects({ num: o.thick }, o.thick > 1 ? oThick : oScale);
        if (typeof o[oName] === 'number') {
          pulseOptions = joinObjects(
            {}, defaultThick, o, { scale: o[oName], callback: done },
          );
        } else {
          pulseOptions = joinObjects(
            {}, defaultThick, o, o[oName], { callback: done },
          );
        }
        if (pulseOptions.num > 1 && pulseOptions.min == null) {
          pulseOptions.min = 1 / pulseOptions.scale;
        }
        element.pulse(pulseOptions);
        done = null;
      }
    };
    if (this._curve != null) {
      pulse('curve', 'curve', {}, {});
    }
    if (this._curveRight != null) {
      pulse('curveRight', 'curve', {}, {});
    }
    if (this.corner != null && this._corner != null) {
      const cornerLength = this.corner.length || 0;
      pulse(
        'corner', 'corner',
        { centerOn: [0, 0] },
        { centerOn: this._corner.getPosition('diagram').add(polarToRect(cornerLength / 2, this.angle / 2)) },
      );
    }
    pulse('label', 'label', { centerOn: [0, 0] }, { num: 1 });
    if (this.arrow != null) {
      if (this._arrow1 != null) {
        pulse(
          'arrow1', 'arrow',
          { centerOn: [0, 0] },
          { centerOn: this._arrow1.getPosition('diagram') },
        );
      }
      if (this._arrow2 != null) {
        pulse(
          'arrow2', 'arrow',
          { centerOn: [0, 0] },
          { centerOn: this._arrow2.getPosition('diagram') },
        );
      }
    }
    this.animateNextFrame();
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

