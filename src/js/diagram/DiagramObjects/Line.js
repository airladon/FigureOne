// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, polarToRect, normAngle, Rect, distance, getPoint,
  TransformBounds, RectBounds,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  roundNum,
} from '../../tools/math';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import EquationLabel from './EquationLabel';
import type { TypeLabelEquationOptions } from './EquationLabel';
import { joinObjects } from '../../tools/tools';
import { Equation } from '../DiagramElements/Equation/Equation';
import type { TypeWhen } from '../webgl/GlobalAnimation';

// top - text is on top of line (except when line is vertical)
// bottom - text is on bottom of line (except when line is vertical)
// left - text is to left of line (except when line is horiztonal)
// right - text is to right of line (except when line is horiztonal)
// end1 - text is on first end of line
// end2 - text is on second end of line
// outside - text is on left of line when line is vertical from 0 to 1
//           or, if a polygon is defined clockwise, outside will be outside.
// inside - text is on right of line when line is vertical from 0 to 1
//           or, if a polygon is defined anti-clockwise, outside will be outside.
export type TypeLineLabelLocation = 'top' | 'left' | 'bottom' | 'right'
                                    | 'end1' | 'end2' | 'outside' | 'inside';
// top - text is on top of line if line is horiztonal
// bottom - text is on bottom of line if line is horiztonal
// left - text is to left of line if line is vertical
// right - text is to right of line if line is vertical
export type TypeLineLabelSubLocation = 'top' | 'left' | 'bottom' | 'right';
// horizontal - text is always horizontal;
// baseToLine - text angle is same as line, with baseline toward line
// baseToLine - text angle is same as line, with baseline away from line
// baseToLine - text angle is same as line, with text upright
export type TypeLineLabelOrientation = 'horizontal' | 'baseToLine' | 'baseAway'
                                      | 'baseUpright';

export type TypeLineVertexOrigin = 'start' | 'end' | 'center' | number | Point;
export type TypeLineVertexSpaceStart = 'start' | 'end' | 'center' | number | Point;

export type TypeLineLabelOptions = {
  text: null | string | Array<string> | Equation | TypeLabelEquationOptions,
  precision?: number,
  offset?: number,
  location?: TypeLineLabelLocation,
  subLocation?: TypeLineLabelSubLocation,
  orientation?: TypeLineLabelOrientation,
  linePosition?: number,
  scale?: number,
  color?: Array<number>,
};

export type TypeLineOptions = {
  position?: Point,
  length?: number,
  angle?: number,
  width?: number,
  vertexSpaceStart?: 'start' | 'end' | 'center' | number | Point,
  color?: Array<number>,
  showLine?: boolean,
  largerTouchBorder?: boolean | number, // number is the size to grow
  offset?: number,
  p1?: Point,
  p2?: Point,
  arrowStart?: {
    width?: number,
    height?: number,
  },
  arrowEnd?: {
    width?: number,
    height?: number,
  },
  arrows?: {
    width?: number,
    height?: number,
  } | boolean,
  label?: TypeLineLabelOptions,
  dashStyle?: {
    style: Array<number>,
    maxLength?: number,
  },
  pulse?: {
    line?: number,
    label?: number,
    arrow?: number,
    collection?: number,
  },
  mods?: {},
  move?: {
    type?: 'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scaleX' | 'scaleY' | 'scale';
    middleLengthPercent?: number;
    translationBounds?: Rect;
  }
};

// Line is a class that manages:
//   A straight line
//   Arrows
//   Label
//   Future: Dimension posts
//
// In vertex space, a line is defined as:
//   - horizontal
//   - length 1
//   - width defined by user
//   - left side (start) of line defined at a point by user
//
// To give the line a custom position, length and angle, the main
// class's transform is used:
//   - Translation for vertex space origin position
//   - Scale for line length
//   - Rotation for line angle
//
// In vertex space, a line would normally be positioned along the x axis.
//
//
// A line can be defined in three ways:
//   - p1, p2, width, vertexSpaceStart
//      - width and vertexSpaceStart used to calculate vertex line
//      - p1, p2 used to calculate length, angle, position
//      - length, angle, position used to modify transform
//   - Length, angle, width, vertexSpaceStart, position of vertexSpaceOrigin
//      - width and vertexSpaceStart used to calculate vertex line
//      - Length, angle, position used to modify transform
//   - p1, length, angle, width, vertexSpaceStart
//      - width and vertexSpaceStart used to calculate vertex line
//      - p1 used to calculate position
//      - length, angle, position used to modify transform

class LineLabel extends EquationLabel {
  offset: number;
  location: TypeLineLabelLocation;
  subLocation: TypeLineLabelSubLocation;
  orientation: TypeLineLabelOrientation;
  linePosition: number;
  precision: number;

  constructor(
    equation: Object,
    labelText: string | Equation | Array<string> | TypeLabelEquationOptions,
    color: Array<number>,
    offset: number,
    location: TypeLineLabelLocation = 'top',
    subLocation: TypeLineLabelSubLocation = 'left',
    orientation: TypeLineLabelOrientation = 'horizontal',
    linePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    scale: number = 0.7,
    precision: number = 1,
  ) {
    super(equation, { label: labelText, color, scale });
    this.offset = offset;
    this.location = location;
    this.subLocation = subLocation;
    this.orientation = orientation;
    this.linePosition = linePosition;
    this.precision = precision;
  }
}

function makeStraightLine(
  shapes: Object,
  length: number,
  width: number,
  position: Point,
  color: Array<number>,
  dashStyle: {
    style: Array<number>,
    maxLength: number } | null,
  largerTouchBorder: boolean | number | { width: number, start: number, end: number },
  isTouchDevice: boolean,
) {
  // let straightLine = shapes.horizontalLine(
  //   position,
  //   length, width,
  //   0, color, new Transform().scale(1, 1).translate(0, 0),
  // );
  let straightLine = shapes.line({
    position,
    length,
    width,
    color,
    transform: new Transform().scale(1, 1).translate(0, 0),
  });
  if (dashStyle) {
    straightLine = shapes.dashedLine({
      position,
      length: dashStyle.maxLength,
      width,
      rotation: 0,
      dashStyle: dashStyle.style,
      color,
      transform: new Transform().scale(1, 1).translate(0, 0),
    });
    //   position,
    //   dashStyle.maxLength, width,
    //   0, dashStyle.style, color, new Transform().scale(1, 1).translate(0, 0),
    // );
    // straightLine = shapes.dashedLine(
    //   position,
    //   dashStyle.maxLength, width,
    //   0, dashStyle.style, color, new Transform().scale(1, 1).translate(0, 0),
    // );
  }
  if (largerTouchBorder) {
    const multiplier = isTouchDevice ? 16 : 8;
    let end = 0;
    let start = 0;
    let padding = multiplier * width;
    // let width = null;
    // const lineWidth = Math.abs(element.drawingObject.border[0][i].y) * 2;
    if (typeof largerTouchBorder === 'number') {
      // multiplier = largerTouchBorder;
      padding = largerTouchBorder;
    }
    if (typeof largerTouchBorder === 'object') {
      if (largerTouchBorder.width != null) {
        padding = largerTouchBorder.width;
      }
      if (largerTouchBorder.end != null) {
        end = largerTouchBorder.end;
      }
      if (largerTouchBorder.start != null) {
        start = largerTouchBorder.start;
      }
    }
    // console.log(padding, end, start)
    straightLine.drawingObject.border[0] = [
      straightLine.drawingObject.border[0][0].add(-start, -padding),
      straightLine.drawingObject.border[0][1].add(-start, padding),
      straightLine.drawingObject.border[0][2].add(end, padding),
      straightLine.drawingObject.border[0][3].add(end, -padding),
    ];
    // const increaseBorderSize = (element: DiagramElementPrimitive) => {
    //   for (let i = 0; i < element.drawingObject.border[0].length; i += 1) {
    //     // eslint-disable-next-line no-param-reassign
    //     element.drawingObject.border[0][i].y *= multiplier;
    //   }
    // };
    // increaseBorderSize(straightLine);
  }
  return straightLine;
}
// export type TypeLine = {
//   _line: DiagramElementPrimitive;
//   currentLength: number;
//   setLength: (number) => void;
//   setEndPoints: (Point, Point, number) => void;
//   animateLengthTo: (number, number, boolean, ?() => void) => void;
//   grow: (number, number, boolean, ?() => void) => void;
//   reference: 'center' | 'end';
//   showRealLength: boolean;
//   label: ?LineLabel;
//   _label: DiagramElementCollection;
//   arrow1: null | {
//     height: number;
//   };
//   arrow2: null | {
//     height: number;
//   };
//   setMovable: (?boolean) => void;

//   addArrow1: (number, number) => void;
//   addArrow2: (number, number) => void;
//   addLabel: (string, number, TypeLineLabelLocation,
//              TypeLineLabelSubLocation, TypeLineLabelOrientation, number
//             ) => void;
//   setEndPoints: (Point, Point, ?number) => void;
//   animateLengthTo: (number, number, boolean, ?() => void) => void;
//   grow: (number, number, boolean, ?() => void) => void;
//   pulseWidth: () => void;
//   updateLabel: (?number) => {};
//   offset: number;
// } & DiagramElementCollection;

// A line is always defined as horiztonal with length 1 in vertex space
// The line's position and rotation is the line collection transform
// translation and rotation respectively.
// The line's length is the _line primative x scale.
export default class DiagramObjectLine extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  _midLine: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;
  _label: null | {
    _base: DiagramElementPrimitive;
  } & DiagramElementCollection;

  // label and arrow objects that exist if labels and arrows exist
  label: ?LineLabel;
  arrow1: ?{ height: number; };
  arrow2: ?{ height: number; };

  // line properties - read only
  line: Line;
  length: number;
  angle: number;
  width: number;
  p1: Point;
  p2: Point;
  position: Point;
  currentLength: number;  // deprecate
  vertexOrigin: 'start' | 'end' | 'center' | number | Point;

  // line properties - read/write
  showRealLength: boolean;

  // line properties - private internal use only
  start: number;
  shapes: Object;
  equation: Object;
  animateNextFrame: void => void;
  vertexSpaceLength: number;
  vertexSpaceStart: Point;
  offset: number;
  isTouchDevice: boolean;
  largerTouchBorder: boolean | number | { width: number, start: number, end: number };
  dashStyle: { style: Array<number>, maxLength: number } | null;

  scaleTransformMethodName: string;

  // line methods
  setLength: (number) => void;
  setEndPoints: (TypeParsablePoint, TypeParsablePoint, ?number) => void;
  // eslint-disable-next-line max-len
  animateLengthTo: (?number, ?number, ?boolean, ?(string | (() => void)), ?(string | ((number, number) => void)), ?boolean) => void;
  animateLengthToStepFunctionName: string;
  animateLengthToDoneFunctionName: string;
  pulseWidthDoneCallbackName: string;
  grow: (?number, ?number, ?boolean, ?(string | (() => void))) => void;
  setMovable: (?boolean, ?('translation' | 'rotation' | 'centerTranslateEndRotation' | 'scaleX' | 'scaleY' | 'scale'), ?number, ?Rect) => void;
  addArrow1: (?number, ?number) => void;
  addArrow2: (?number, ?number) => void;
  addArrowStart: (?number, ?number) => void;
  addArrowEnd: (?number, ?number) => void;
  addArrow: (number, ?number, ?number) => void;
  pulseWidth: (?{
    line?: number,
    label?: number,
    arrow?: number,
  }) => void;

  pulseDefaultSettings: {
    line: number,
    label: number,
    arrow: number,
    collection: number,
  };

  updateLabel: (?number) => {};
  addLabel: (string | Equation | Array<string> | TypeLabelEquationOptions,
             number, ?TypeLineLabelLocation,
             ?TypeLineLabelSubLocation, ?TypeLineLabelOrientation, ?number,
             ?number, ?Array<number>, ?number,
            ) => void;

  multiMove: {
    vertexSpaceMidLength: number;
    bounds: Rect,
  };

  animateLengthToOptions: {
    initialLength: number,
    deltaLength: number,
    callback: ?(string | (() => void)),
    onStepCallback: ?(string | ((number, number) => void)),
    finishOnCancel: boolean,
  };

  pulseWidthOptions: {
    oldCallback: ?(string | (() => void)),
    oldTransformMethod: ?(string | ((number, ?Point) => Transform)),
  };

  calculateFromP1LengthAngle(
    p1: Point,
    length: number,
    angle: number,
  ) {
    const t = new Transform().scale(length, 1).rotate(angle);
    const startTransformed = this.vertexSpaceStart.transformBy(t.matrix());
    const position = p1.sub(startTransformed);
    return { length, angle, position };
  }

  calculateFromP1P2(
    p1: Point,
    p2: Point,
  ) {
    const line = new Line(p1, p2);
    const length = line.length();
    const angle = line.angle();
    const t = new Transform().scale(length, 1).rotate(angle);
    const startTransformed = this.vertexSpaceStart.transformBy(t.matrix());
    const position = p1.sub(startTransformed);
    return { length, angle, position };
  }

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: TypeLineOptions = {},
  ) {
    const defaultOptions = {
      position: new Point(0, 0),
      length: 1,
      angle: 0,
      width: 0.01,
      vertexSpaceStart: 'start',
      color: [0, 0, 1, 1],
      showLine: true,
      largerTouchBorder: true,
      touchBorder: null,
      offset: 0,
      dashStyle: null,
      mods: {},
      pulse: {
        line: 6,
        label: 2,
        arrow: 3,
        collection: 1,
      },
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    let { dashStyle } = optionsToUse;
    if (dashStyle) {
      let defaultMaxLength = optionsToUse.length;
      if (optionsToUse.p1 != null && optionsToUse.p2 != null) {
        optionsToUse.p1 = getPoint(optionsToUse.p1);
        optionsToUse.p2 = getPoint(optionsToUse.p2);
        defaultMaxLength = distance(optionsToUse.p1, optionsToUse.p2);
      }
      dashStyle = joinObjects({}, {
        maxLength: defaultMaxLength,
        dashStyle: [0.1],
      }, options.dashStyle);
    }
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
    this.dashStyle = dashStyle;

    this.animateLengthToOptions = {
      initialLength: 0,
      deltaLength: 1,
      finishOnCancel: true,
      callback: null,
      onStepCallback: null,
    };

    this.pulseWidthOptions = {
      oldCallback: null,
      oldTransformMethod: null,
    };

    this.animateLengthToStepFunctionName = '_animateToLengthStep';
    this.fnMap.add(this.animateLengthToStepFunctionName, this.animateLengthToStep.bind(this));
    this.animateLengthToDoneFunctionName = '_animateToLengthDone';
    this.fnMap.add(this.animateLengthToDoneFunctionName, this.animateLengthToDone.bind(this));
    this.pulseWidthDoneCallbackName = '_pulseWidthDone';
    this.fnMap.add(this.pulseWidthDoneCallbackName, this.pulseWidthDone.bind(this));
    // Calculate and store the line geometry
    //    The length, angle, p1 and p2 properties also exist in this.line,
    //    but are at this level for convenience

    this.offset = optionsToUse.offset;
    this.width = optionsToUse.width;
    this.position = getPoint(optionsToUse.position);
    this.length = optionsToUse.length;
    this.angle = optionsToUse.angle;

    this.transform.updateTranslation(this.position);
    this.transform.updateRotation(this.angle);

    // Line is defined in vertex space as horiztonal along the x axis.
    // The reference will define how it is offset where:
    //    - start: line extends from 0 to length in x
    //    - end: line extends from -length to 0 in length
    //    - middle: line extends from -length / 2 to length / 2
    //    - percent: line extends from -length * % to length * (1 - %)
    this.vertexSpaceLength = 1;
    this.vertexSpaceStart = new Point(0, 0);
    if (optionsToUse.vertexSpaceStart === 'end') {
      this.vertexSpaceStart = new Point(-1, 0);
    } else if (optionsToUse.vertexSpaceStart === 'center') {
      this.vertexSpaceStart = new Point(-0.5, 0);
    } else if (typeof optionsToUse.vertexSpaceStart === 'number') {
      this.vertexSpaceStart = new Point(-optionsToUse.vertexSpaceStart, 0);
    } else if (optionsToUse.vertexSpaceStart instanceof Point) {
      this.vertexSpaceStart = optionsToUse.vertexSpaceStart;
    }
    // this.vertexOrigin = vertexOrigin;

    // MultiMove means the line has a middle section that when touched
    // translates the line collection, and when the rest of the line is
    // touched then the line collection is rotated.
    this.multiMove = {
      vertexSpaceMidLength: 0,
      // bounds: new RectBounds({
      //   left: -1, bottom: -1, top: 1, right: 1
      // }),
      bounds: new Rect(-1, -1, 2, 2),
    };
    this._midLine = null;

    this.scaleTransformMethodName = '_transformMethod';
    // If the line is to be shown (and not just a label) then make it
    this._line = null;
    if (optionsToUse.showLine) {
      // let dashStyleToUse = optionsToUse.dashStyle;
      // if (dashStyleToUse == null) {  // If undefined, make null
      //   dashStyleToUse = null;
      // }
      const straightLine = makeStraightLine(
        this.shapes, this.vertexSpaceLength, this.width,
        this.vertexSpaceStart,
        optionsToUse.color, this.dashStyle,
        optionsToUse.largerTouchBorder, isTouchDevice,
      );
      const scaleTransformMethod = s => new Transform().scale(1, s);
      straightLine.fnMap.add(this.scaleTransformMethodName, scaleTransformMethod);
      this.add('line', straightLine);
    }

    // Arrow related properties
    this.arrow1 = null;
    this.arrow2 = null;
    this._arrow1 = null;
    this._arrow2 = null;

    // Label related properties
    this.label = null;
    this._label = null;
    this.showRealLength = false;
    this.setLength(this.length);

    if (optionsToUse.p1 != null && optionsToUse.p2 != null) {
      this.setEndPoints(optionsToUse.p1, optionsToUse.p2);
    }

    const defaultArrowOptions = {
      width: this.width * 4,
      height: this.width * 4,
    };
    if (optionsToUse.arrowStart) {
      const arrowOptions = joinObjects({}, defaultArrowOptions, optionsToUse.arrowStart);
      this.addArrowStart(arrowOptions.height, arrowOptions.width);
    }

    if (optionsToUse.arrowEnd) {
      const arrowOptions = joinObjects({}, defaultArrowOptions, optionsToUse.arrowEnd);
      this.addArrowEnd(arrowOptions.height, arrowOptions.width);
    }

    // Arrows overrides arrowStart or arrowEnd
    if (optionsToUse.arrows) {
      let arrows = {};
      if (typeof optionsToUse.arrows === 'object') {
        ({ arrows } = optionsToUse);
      }
      const arrowOptions = joinObjects({}, defaultArrowOptions, arrows);
      this.addArrows(arrowOptions.height, arrowOptions.width);
    }

    const defaultLabelOptions = {
      text: null,
      offset: 0,
      location: 'top',
      subLocation: 'left',
      orientation: 'horizontal',
      linePosition: 0.5,
      scale: 0.7,
      color: optionsToUse.color,
      precision: 1,
    };
    if (optionsToUse.label) {
      const labelOptions = joinObjects({}, defaultLabelOptions, optionsToUse.label);
      if (labelOptions.text === null) {
        labelOptions.text = '';
        this.showRealLength = true;
      }
      this.addLabel(
        labelOptions.text,
        labelOptions.offset,
        labelOptions.location,
        labelOptions.subLocation,
        labelOptions.orientation,
        labelOptions.linePosition,
        labelOptions.scale,
        labelOptions.color,
        labelOptions.precision,
      );
    }

    const defaultMoveOptions = {
      type: 'rotation',
      middleLengthPercent: 0.22,
      translationBounds: this.diagramLimits,
    };
    if (optionsToUse.move) {
      const moveOptions = joinObjects({}, defaultMoveOptions, optionsToUse.move);
      this.setMovable(
        true,
        moveOptions.type,
        moveOptions.middleLengthPercent,
        moveOptions.translationBounds,
      );
    }

    this.pulseDefaultSettings = {
      line: optionsToUse.pulse.line || 1,
      label: optionsToUse.pulse.label || 1,
      arrow: optionsToUse.pulse.arrow || 1,
      collection: optionsToUse.pulse.collection || 1,
    };

    this.pulseDefault = (done) => {
      this.pulseWidth({
        line: this.pulseDefaultSettings.line,
        label: this.pulseDefaultSettings.label,
        arrow: this.pulseDefaultSettings.arrow,
        done,
      });
      if (this.pulseDefaultSettings.collection !== 1) {
        this.pulseScaleNow(1, this.pulseDefaultSettings.collection);
      }
    };

    if (optionsToUse.mods != null && optionsToUse.mods !== {}) {
      this.setProperties(optionsToUse.mods);
    }
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'offset',
      'angle',
      'length',
      'position',
      'animateLengthToOptions',
      'pulseWidthOptions',
    ];
  }

  _fromState(state: Object) {
    joinObjects(this, state);
    this.setLineDimensions();
    return this;
  }

  pulseWidthDone() {
    const line = this._line;
    if (line == null) {
      return;
    }
    if (this.pulseWidthOptions.oldTransformMethod) {
      line.pulseSettings.transformMethod = this.pulseWidthOptions.oldTransformMethod;
    }
    line.pulseSettings.callback = this.pulseWidthOptions.oldCallback;
  }

  pulseWidth(optionsIn?: {
      line?: number,
      label?: number,
      arrow?: number,
      done?: ?() => void,
      duration?: number,
      when?: TypeWhen,
    } = {}) {
    const defaultOptions = {
      line: 3,
      label: 1.5,
      arrow: 2,
      done: null,
      duration: 1,
      when: 'nextFrame',
    };
    const options = joinObjects(defaultOptions, optionsIn);
    let { done } = options;
    const line = this._line;
    if (line != null) {
      line.stopPulsing();
      this.pulseWidthOptions = {
        oldTransformMethod: line.pulseSettings.transformMethod,
        oldCallback: line.pulseSettings.callback,
      };
      // const oldTransformMethod = line.pulseSettings.transformMethod;
      // const oldPulseCallback = line.pulseSettings.callback;
      // const finishPulsing = () => {
      //   line.pulseSettings.transformMethod = oldTransformMethod;
      //   line.pulseSettings.callback = oldPulseCallback;
      // };
      // const finishPulsingName = `${this.getPath()}_finishPulsing`;
      // this.fnMap.add(finishPulsingName, finishPulsing);
      line.pulseSettings.callback = this.pulseWidthDoneCallbackName;
      // const scaleTransformMethod = s => new Transform().scale(1, s);
      // const scaleTransformMethodName = `${this.getPath()}_transformMethod`;
      // this.fnMap.add(scaleTransformMethodName, scaleTransformMethod);
      line.pulseSettings.transformMethod = this.scaleTransformMethodName;
      line.pulseScale({
        duration: options.duration,
        scale: options.line,
        frequency: 0,
        callback: done,
        when: options.when,
      });
      done = null;
    }
    const arrow1 = this._arrow1;
    const arrow2 = this._arrow2;
    if (arrow1 != null) {
      arrow1.pulseScale({
        duration: options.duration,
        scale: options.arrow,
        frequency: 0,
        callback: done,
        when: options.when,
      });
      // arrow1.pulseScaleNow(options.duration, options.arrow, 0, done);
      done = null;
    }
    if (arrow2 != null) {
      // arrow2.pulseScaleNow(options.duration, options.arrow, 0, done);
      arrow2.pulseScale({
        duration: options.duration,
        scale: options.arrow,
        frequency: 0,
        callback: done,
        when: options.when,
      });
      done = null;
    }

    const label = this._label;
    if (label != null) {
      // label.pulseScaleNow(options.duration, options.label, 0, done);
      label.pulseScale({
        duration: options.duration,
        scale: options.label,
        frequency: 0,
        callback: done,
        when: options.when,
      });
      done = null;
    }
    if (done != null) {
      done();
    }
    this.animateNextFrame();
  }

  addArrow(
    index: 1 | 2,
    height: number = this.width * 4,
    width: number = height,
  ) {
    let r = 0;
    let start = [-height, 0];
    if (index === 1) {
      r = Math.PI;
      start = [height, 0];
    }
    const a = this.shapes.arrow({
      width,
      legWidth: 0,
      length: height,
      legHeight: 0,
      color: this.color,
      transform: new Transform().translate(this.vertexSpaceStart.x, 0),
      start,

      angle: r,
    });
    // const a = this.shapes.arrowLegacy(
    //   width, 0, height, 0,
    //   this.color, new Transform().translate(this.vertexSpaceStart.x, 0), new Point(0, 0), r,
    // );
    // $FlowFixMe
    this[`arrow${index}`] = { height };
    this.add(`arrow${index}`, a);
    this.setLength(this.currentLength);
  }

  addArrows(
    arrowHeight: number = this.width * 4,
    arrowWidth: number = arrowHeight,
  ) {
    this.addArrow1(arrowHeight, arrowWidth);
    this.addArrow2(arrowHeight, arrowWidth);
  }

  addArrow1(
    arrowHeight: number = this.width * 4,
    arrowWidth: number = arrowHeight,
  ) {
    this.addArrow(1, arrowHeight, arrowWidth);
  }

  addArrow2(
    arrowHeight: number = this.width * 4,
    arrowWidth: number = arrowHeight,
  ) {
    this.addArrow(2, arrowHeight, arrowWidth);
  }

  addArrowStart(
    arrowHeight: number = this.width * 4,
    arrowWidth: number = arrowHeight,
  ) {
    this.addArrow1(arrowHeight, arrowWidth);
  }

  addArrowEnd(
    arrowHeight: number = this.width * 4,
    arrowWidth: number = arrowHeight,
  ) {
    this.addArrow2(arrowHeight, arrowWidth);
  }

  setMovable(
    movable: boolean = true,
    moveType: 'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scaleX' | 'scaleY' | 'scale' = this.move.type,
    middleLengthPercent: number = 0.333,
    translationBounds: Rect = this.diagramLimits._dup(),
  ) {
    if (movable) {
      if (moveType === 'translation' || moveType === 'rotation'
        || moveType === 'scale' || moveType === 'scaleX'
        || moveType === 'scaleY'
      ) {
        this.move.type = moveType;
        super.setMovable(true);
        // this.isTouchable = true;
        // this.isMovable = true;
        this.hasTouchableElements = true;
        if (this._line != null) {
          this._line.isTouchable = true;
          this._line.isMovable = false;
        }
        if (this._midLine) {
          this._midLine.isMovable = false;
        }
        this.multiMove.bounds = translationBounds;
      } else {
        this.setMultiMovable(middleLengthPercent, translationBounds);
      }
    } else {
      this.isMovable = false;
      this.isTouchable = false;
      if (this._line != null) {
        this._line.isTouchable = false;
        this._line.isMovable = false;
      }
    }
  }

  setMultiMovable(middleLengthPercent: number, translationBounds: Rect) {
    this.multiMove.vertexSpaceMidLength = middleLengthPercent * this.vertexSpaceLength;
    const start = new Point(
      this.vertexSpaceStart.x + this.vertexSpaceLength / 2
      - this.multiMove.vertexSpaceMidLength / 2,
      0,
    );
    const midLine = makeStraightLine(
      this.shapes, this.multiMove.vertexSpaceMidLength, this.width,
      start, this.color, null,
      this.largerTouchBorder, this.isTouchDevice,
    );
    // console.log(midLine)
    midLine.isTouchable = true;
    midLine.move.type = 'translation';
    midLine.move.element = this;
    midLine.isMovable = true;
    midLine.move.canBeMovedAfterLosingTouch = true;
    this.add('midLine', midLine);
    if (this._line) {
      this._line.isTouchable = true;
      this._line.move.type = 'rotation';
      this._line.move.element = this;
      this._line.isMovable = true;
      this._line.move.canBeMovedAfterLosingTouch = true;
    }
    this.hasTouchableElements = true;
    this.isTouchable = false;
    this.isMovable = false;
    this.multiMove.bounds = translationBounds;
    this.setLength(this.currentLength);
  }

  updateMoveTransform(t: Transform = this.transform._dup()) {
    const r = t.r();
    const { bounds } = this.multiMove;
    // console.log('qqwer')
    if (r != null) {
      const w = Math.abs(this.currentLength / 2 * Math.cos(r));
      const h = Math.abs(this.currentLength / 2 * Math.sin(r));
      if (this.move.bounds instanceof TransformBounds) {
        this.move.bounds.updateTranslation(new RectBounds({
          left: bounds.left + w,
          bottom: bounds.bottom + h,
          right: bounds.right - w,
          top: bounds.top - h,
        }));
      }
      // this.move.maxTransform.updateTranslation(
      //   bounds.right - w,
      //   bounds.top - h,
      // );
      // this.move.minTransform.updateTranslation(
      //   bounds.left + w,
      //   bounds.bottom + h,
      // );
      if (r > 2 * Math.PI) {
        this.transform.updateRotation(r - 2 * Math.PI);
      }
      if (r < 0) {
        this.transform.updateRotation(r + 2 * Math.PI);
      }
    }
  }

  addLabel(
    labelText: string | Equation | Array<string> | TypeLabelEquationOptions,
    offset: number,
    location: TypeLineLabelLocation = 'top',
    subLocation: TypeLineLabelSubLocation = 'left',
    orientation: TypeLineLabelOrientation = 'horizontal',
    linePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    scale: number = 0.7,
    color: Array<number> = this.color,
    precision: number = 1,
  ) {
    this.label = new LineLabel(
      this.equation, labelText, color,
      offset, location, subLocation, orientation, linePosition, scale,
      precision,
    );
    if (this.label != null) {
      this.add('label', this.label.eqn);
    }
    this.updateLabel();
  }

  getLength() {
    return this.length;
  }

  getAngle(units: 'deg' | 'rad' = 'rad') {
    if (units === 'deg') {
      return this.angle * 180 / Math.PI;
    }
    return this.angle;
  }

  setLabel(text: string) {
    this.showRealLength = false;
    if (this.label != null) {
      this.label.setText(text);
    }
    this.updateLabel();
  }

  getLabel() {
    if (this.label != null) {
      return this.label.getText();
    }
    return '';
  }

  setLabelToRealLength() {
    this.showRealLength = true;
    this.updateLabel();
  }

  updateLabel(parentRotationOffset: number = 0) {
    const { label } = this;
    if (label == null) {
      return;
    }
    const lineAngle = normAngle(this.transform.r() || 0);
    let labelAngle = 0;
    if (this.showRealLength && this._label) {
      // this._label._base.drawingObject.setText(roundNum(this.currentLength, 2)
      //   .toFixed(label.precision));
      label.setText(roundNum(this.currentLength, 2)
        .toFixed(label.precision));
      // label.eqn.reArrangeCurrentForm();
    }
    const labelPosition = new Point(
      this.vertexSpaceStart.x * this.currentLength + label.linePosition * this.currentLength,
      0,
    );
    let labelOffsetAngle = Math.PI / 2;
    const labelOffsetMag = label.offset;
    if (label.location === 'end1' || label.location === 'end2') {
      if (label.location === 'end1') {
        labelPosition.x = this.vertexSpaceStart.x * this.currentLength - label.offset;
        labelOffsetAngle = -Math.PI;
      }
      if (label.location === 'end2') {
        labelPosition.x = this.vertexSpaceStart.x * this.currentLength
          + this.currentLength + label.offset;
        labelOffsetAngle = 0;
      }
    } else {
      const offsetTop = Math.cos(lineAngle) < 0 ? -Math.PI / 2 : Math.PI / 2;
      const offsetBottom = -offsetTop;
      const offsetLeft = Math.sin(lineAngle) > 0 ? Math.PI / 2 : -Math.PI / 2;
      const offsetRight = -offsetLeft;

      if (label.location === 'top') {
        labelOffsetAngle = offsetTop;
      }
      if (label.location === 'bottom') {
        labelOffsetAngle = offsetBottom;
      }
      if (label.location === 'right') {
        labelOffsetAngle = offsetRight;
      }
      if (label.location === 'left') {
        labelOffsetAngle = offsetLeft;
      }
      if (roundNum(Math.sin(lineAngle), 4) === 0
        && (label.location === 'left' || label.location === 'right')
      ) {
        if (label.subLocation === 'top') {
          labelOffsetAngle = offsetTop;
        }
        if (label.subLocation === 'bottom') {
          labelOffsetAngle = offsetBottom;
        }
      }
      if (roundNum(Math.cos(lineAngle), 4) === 0
        && (label.location === 'top' || label.location === 'bottom')
      ) {
        if (label.subLocation === 'right') {
          labelOffsetAngle = offsetRight;
        }
        if (label.subLocation === 'left') {
          labelOffsetAngle = offsetLeft;
        }
      }
      if (label.location === 'inside') {
        labelOffsetAngle = -Math.PI / 2;
      }
      if (label.location === 'outside') {
        labelOffsetAngle = Math.PI / 2;
      }
    }

    if (label.orientation === 'horizontal') {
      labelAngle = -lineAngle;
    }
    if (label.orientation === 'baseToLine') {
      if (labelPosition.y < 0) {
        labelAngle = Math.PI;
      }
    }
    if (label.orientation === 'baseAway') {
      if (labelPosition.y > 0) {
        labelAngle = Math.PI;
      }
    }
    if (label.orientation === 'baseUpright') {
      if (Math.cos(lineAngle) < 0) {
        labelAngle = Math.PI;
      }
    }

    label.updateRotation(
      labelAngle - parentRotationOffset,
      labelPosition, labelOffsetMag, labelOffsetAngle,
    );
  }

  setLength(newLength: number) {
    const lineStart = this.vertexSpaceStart.x * newLength;
    const lineLength = newLength;
    let straightLineLength = lineLength;
    let startOffset = 0;

    if (this.arrow1 && this._arrow1) {
      straightLineLength -= this.arrow1.height;
      startOffset = this.arrow1.height;
      this._arrow1.setPosition(lineStart);
    }
    if (this.arrow2 && this._arrow2) {
      straightLineLength -= this.arrow2.height;
      this._arrow2.setPosition(lineStart + lineLength, 0);
    }
    const line = this._line;
    if (line) {
      if (this.dashStyle) {
        line.lengthToDraw = straightLineLength;
        // const newStart = this.vertexSpaceStart.x * straightLineLength;
        // const delta = lineStart + startOffset - newStart;
        line.setPosition(lineStart + startOffset - this.vertexSpaceStart.x, 0);
      } else {
        line.transform.updateScale(straightLineLength, 1);
        const newStart = this.vertexSpaceStart.x * straightLineLength;
        const delta = lineStart + startOffset - newStart;
        line.setPosition(delta, 0);
      }
    }

    const midLine = this._midLine;
    if (midLine) {
      midLine.transform.updateScale(newLength, 1);
    }

    this.length = newLength;
    this.updateLineGeometry();
    this.currentLength = newLength; // to deprecate?
    this.updateLabel();
  }

  updateLineGeometry() {
    const t = this.transform.t();
    const r = this.transform.r();
    if (t != null && r != null) {
      this.position = t;
      this.angle = r;
      const p1 = this.vertexSpaceStart.transformBy(new Transform()
        .scale(this.length)
        .rotate(this.angle)
        .translate(this.position)
        .m());
      const line = new Line(p1, this.length, this.angle);
      this.p1 = line.getPoint(1);
      this.p2 = line.getPoint(2);
      this.line = line;
    }
  }

  setLineDimensions() {
    const offset = polarToRect(this.offset, this.angle + Math.PI / 2);
    this.transform.updateTranslation(this.position.add(offset));
    this.transform.updateRotation(this.angle);
    this.setLength(this.length);
    this.updateLabel();
  }

  setEndPoints(p: TypeParsablePoint, q: TypeParsablePoint, offset: number = this.offset) {
    this.offset = offset;
    const { length, angle, position } = this.calculateFromP1P2(getPoint(p), getPoint(q));
    this.angle = angle;
    this.length = length;
    this.position = position;
    this.setLineDimensions();

    // const pq = new Line(p, q);
    // this.angle = pq.angle();
    // this.length = pq.length();

    // this.position = p;
    // if (this.vertexOrigin === 'center') {
    //   this.position = pq.midpoint();
    // } else if (this.vertexOrigin === 'end') {
    //   this.position = q;
    // } else if (typeof this.vertexOrigin === 'number') {
    //   this.position = p.add(polarToRect(this.vertexOrigin * this.length, this.angle));
    // } else if (this.vertexOrigin instanceof Point) {
    //   this.position = p.add(this.vertexOrigin);
    // }
    // // this.updateLineGeometry();

    // // const newLength = distance(q, p);
    // // const pq = new Line(p, q);
    // this.transform.updateRotation(pq.angle());
    // const offsetdelta = polarToRect(offset, pq.angle() + Math.PI / 2);
    // // if (this.reference === 'center') {
    // this.transform.updateTranslation(this.position.add(offsetdelta));
    // // } else {
    // //   this.transform.updateTranslation(p.add(offsetdelta));
    // // }
    // this.setLength(this.length);
    // this.updateLabel();
  }

  animateLengthToStep(percent: number) {
    const { initialLength, deltaLength, onStepCallback } = this.animateLengthToOptions;
    this.setLength(initialLength + deltaLength * percent);
    if (onStepCallback != null) {
      this.fnMap.exec(onStepCallback, percent, initialLength + deltaLength * percent);
      // onStepCallback(percent, initialLength + deltaLength * percent);
    }
  }

  animateLengthToDone() {
    const {
      initialLength, callback, deltaLength, finishOnCancel,
    } = this.animateLengthToOptions;
    if (finishOnCancel) {
      this.setLength(initialLength + deltaLength);
    }
    this.fnMap.exec(callback);
    // if (typeof callback === 'function' && callback) {
    //   callback();
    // }
  }

  animateLengthTo(
    toLength: number = 1,
    time: number = 1,
    finishOnCancel: boolean = true,
    callback: ?(string | (() => void)) = null,
    onStepCallback: ?(string | ((number, number) => void)) = null,
    stop: ?boolean = true,
  ) {
    if (stop) {
      this.stop();
    }
    this.animateLengthToOptions = {
      initialLength: this.currentLength,
      deltaLength: toLength - this.currentLength,
      callback,
      onStepCallback,
      finishOnCancel,
    };
    // const initialLength = this.currentLength;
    // const deltaLength = toLength - this.currentLength;
    // const func = (percent) => {
    //   this.setLength(initialLength + deltaLength * percent);
    //   if (onStepCallback != null) {
    //     this.execFn(onStepCallback, percent, initialLength + deltaLength * percent);
    //     // onStepCallback(percent, initialLength + deltaLength * percent);
    //   }
    // };
    // this.fnMap.add('_DiagramObjectsLineAnimateLengthToFunc', func);
    // const done = () => {
    //   if (finishOnCancel) {
    //     this.setLength(initialLength + deltaLength);
    //   }
    //   this.execFn(callback);
    //   // if (typeof callback === 'function' && callback) {
    //   //   callback();
    //   // }
    // };
    // this.fnMap.add('_DiagramObjectsLineAnimateLengthToCallback', done);
    this.animations.new('Line Length')
      .custom({
        callback: this.animateLengthToStepFunctionName,
        duration: time,
      })
      .whenFinished(this.animateLengthToDoneFunctionName)
      .start();
    // this.animations.start();
    this.animateNextFrame();
    // console.log(this)
    // this.animateCustomTo(func, time, 0, done);
  }

  grow(
    fromLength: number = 0,
    time: number = 1,
    finishOnCancel: boolean = true,
    callback: ?(string | (() => void)) = null,
    onStepCallback: ?(number, number) => void = null,
  ) {
    this.stop();
    const target = this.currentLength;
    this.setLength(fromLength);
    this.animateLengthTo(target, time, finishOnCancel, callback, onStepCallback);
  }

  showLineOnly() {
    this.show();
    if (this._line) {
      this._line.show();
    }
    if (this._arrow1) {
      this._arrow1.show();
    }
    if (this._arrow2) {
      this._arrow2.show();
    }
    if (this._label) {
      this._label.hideAll();
    }
  }

  getP1() {
    const m = this.transform.matrix();
    return this.p1.transformBy(m);
  }

  getP2() {
    const m = this.transform.matrix();
    return this.p2.transformBy(m);
  }
}

// export type TypeLine = DiagramObjectLine;

// export class MovableLine extends DiagramObjectLine {
//   // constructor(
//   //   fullLength: number,
//   //   endLength: number,
//   //   width: number,
//   //   boundary: Rect,
//   // ) {

//   // }
// }

// export type TypeMovableLine = MovableLine;

export type TypeLabelledLine = {
  _line: DiagramElementPrimitive;
  _label: {
    _base: DiagramElementPrimitive;
  } & Equation;
} & DiagramObjectLine;
