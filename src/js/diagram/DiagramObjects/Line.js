// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, polarToRect, normAngle, Rect, distance, getPoint,
  TransformBounds, RectBounds, getBoundingBorder,
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
import { simplifyArrowOptions, getArrowLength } from '../DrawingObjects/Geometries/arrow';

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

// export type TypeLineVertexOrigin = 'start' | 'end' | 'center' | number | Point;
// export type TypeLineVertexSpaceStart = 'start' | 'end' | 'center' | number | Point;

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
  p1?: Point,
  p2?: Point,
  position?: Point,
  length?: number,
  angle?: number,
  align?: 'start' | 'end' | 'center' | number,
  offset?: number,
  width?: number,
  // showLine?: boolean,
  // drawCenter?: 'start' | 'end' | 'center' | number,
  //
  color?: Array<number>,
  touchBorder?: Array<Array<Point>> | 'border' | number | 'rect',
  arrow: OBJ_ArrowLines;
  label?: TypeLineLabelOptions,
  dash: Array<number>,
  pulseWidth?: {
    line?: number,
    label?: number,
    arrow?: number,
    duration?: number,
    frequency?: number,
  },
  pulse: OBJ_Pulse;
  // mods?: {},
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
  // position: Point,
  color: Array<number>,
  dash: Array<number>,
  maxLength: number,
  touchBorder: number | { width: number, start: number, end: number },
  // isTouchDevice: boolean,
) {
  // let straightLine;
  // if (dash.length < 2) {
  const straightLine = shapes.line({
    p1: [0, 0],
    length: dash.length < 2 ? 1 : length,
    angle: 0,
    width,
    color,
    dash,
    transform: new Transform().scale(1, 1).translate(0, 0),
    touchBorder,
  });
  // } // else {
  //   straightLine = shapes.line({
  //     p1: [0, 0],
  //     length: maxLength,
  //     angle: 0,
  //     dash,
  //     width,
  //     color,
  //     transform: new Transform().scale(1, 1).translate(0, 0),
  //     touchBorder,
  //   });
  // }

  // // if (touchBorder) {
  //   // const multiplier = isTouchDevice ? 16 : 8;
  // let end = 0;
  // let start = 0;
  // let w = 0;
  // // let padding = multiplier * width;
  // if (typeof touchBorder === 'number') {
  //   start = touchBorder;
  //   end = touchBorder;
  //   w = touchBorder;
  // }
  // if (typeof touchBorder === 'object') {
  //   w = touchBorder.width != null ? touchBorder.width : w;
  //   start = touchBorder.start != null ? touchBorder.start : start;
  //   end = touchBorder.end != null ? touchBorder.end : end;
  // }
  // //   if (touchBorder.width != null) {
  // //     padding = touchBorder.width;
  // //   }
  // //   if (touchBorder.end != null) {
  // //     end = touchBorder.end;
  // //   }
  // //   if (touchBorder.start != null) {
  // //     start = touchBorder.start;
  // //   }
  // // }
  // straightLine.drawingObject.touchBorder[0] = [
  //   new Point(position.x - start, position.y - width / 2 - w),
  //   new Point(position.x + length + end, position.y - width / 2 - w),
  //   new Point(position.x + length + end, position.y + width / 2 + w),
  //   new Point(position.x - start, position.y + width / 2 + w),
  //   // straightLine.drawingObject.touchBorder[0][0].add(-start, -padding),
  //   // straightLine.drawingObject.touchBorder[0][1].add(-start, padding),
  //   // straightLine.drawingObject.touchBorder[0][2].add(end, padding),
  //   // straightLine.drawingObject.touchBorder[0][3].add(end, -padding),
  // ];

  return straightLine;
}

function getLineFromOptions(options: {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  angle?: number,
  // align?: 'start' | 'end' | 'center' | number,
  offset?: number,
}) {
  const defaultOptions = {
    p1: new Point(0, 0),
    length: 1,
    angle: 0,
    align: 'start',
    offset: 0,
  };
  let line;
  const o = joinObjects({}, defaultOptions, options);
  if (o.p1 != null && o.p2 != null) {
    line = new Line(o.p1, o.p2);
  } else {
    line = new Line(o.p1, o.length, o.angle);
  }
  if (o.offset > 0) {
    line = line.offset('positive', o.offset);
  }
  return line;
}


// A line is always defined as horiztonal with length 1 in vertex space
// The line's position and rotation is the line collection transform
// translation and rotation respectively.
// The line's length is the _line primative x scale.
export default class DiagramObjectLine extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  _movePad: ?DiagramElementPrimitive;
  _rotPad: ?DiagramElementPrimitive;
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
  touchBorder: number | { width: number, start: number, end: number };
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

  pulseWidthDefaults: {
    line: number,
    label: number,
    arrow: number,
    duration: number,
    frequency: number,
    // collection: number,
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
      // length: 1,
      // angle: 0,
      width: 0.01,
      align: 'start',
      color: [1, 0, 0, 1],
      // offset: 0,
      dash: [],
      mods: {},
      pulseWidth: {
        line: 6,
        label: 2,
        arrow: 3,
        duration: 1,
        frequency: 0,
        // collection: 1,
      },
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    if (optionsToUse.touchBorder == null) {
      if (isTouchDevice) {
        optionsToUse.touchBorder = optionsToUse.width * 16;
      } else {
        optionsToUse.touchBorder = optionsToUse.width * 8;
      }
    }
    // let line;
    // if (optionsToUse.p1 != null && optionsToUse.p2 != null) {
    //   line = new Line(optionsToUse.p1, optionsToUse.p2);
    // } else {
    //   line = new Line(optionsToUse.p1, optionsToUse.length, optionsToUse.angle);
    // }
    // if (optionsToUse.offset > 0) {
    //   line = line.offset('positive', optionsToUse.offset);
    // }

    // const { dash } = optionsToUse;
    // if (Array.isArray(dash) && dash.length > 0 && optionsToUse.maxLength == null) {
    //   let defaultMaxLength = optionsToUse.length;
    //   if (optionsToUse.p1 != null && optionsToUse.p2 != null) {
    //     optionsToUse.p1 = getPoint(optionsToUse.p1);
    //     optionsToUse.p2 = getPoint(optionsToUse.p2);
    //     defaultMaxLength = distance(optionsToUse.p1, optionsToUse.p2);
    //   }
    //   optionsToUse.maxLength = defaultMaxLength;
    // }
    super(new Transform('Line')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.touchBorder = optionsToUse.touchBorder;
    this.isTouchDevice = isTouchDevice;
    //deprecate
    this.animateNextFrame = animateNextFrame;
    this.dash = optionsToUse.dash;

    this.line = getLineFromOptions(optionsToUse);
    this.align = optionsToUse.align;
    this.localXPosition = 0;
    this.maxLength = optionsToUse.maxLength != null ? optionsToUse.maxLength : this.line.length();
    // this.maxLength = optionsToUse.maxLength;

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

    // this.offset = optionsToUse.offset;
    this.width = optionsToUse.width;
    // this.position = getPoint(optionsToUse.position);
    // this.length = optionsToUse.length;
    // this.angle = optionsToUse.angle;

    this.transform.updateTranslation(this.line.p1);
    this.transform.updateRotation(this.line.angle);

    // Line is defined in vertex space as horiztonal along the x axis.
    // The reference will define how it is offset where:
    //    - start: line extends from 0 to length in x
    //    - end: line extends from -length to 0 in length
    //    - middle: line extends from -length / 2 to length / 2
    //    - percent: line extends from -length * % to length * (1 - %)
    this.vertexSpaceLength = 1;
    this.vertexSpaceStart = new Point(0, 0);
    // if (optionsToUse.align === 'end') {
    //   this.vertexSpaceStart = new Point(-1, 0);
    // } else if (optionsToUse.align === 'center') {
    //   this.vertexSpaceStart = new Point(-0.5, 0);
    // } else if (typeof optionsToUse.align === 'number') {
    //   this.vertexSpaceStart = new Point(-optionsToUse.align, 0);
    // } else if (optionsToUse.align instanceof Point) {
    //   this.vertexSpaceStart = optionsToUse.align;
    // }
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
    // this._movePad = null;
    // this._rotPad = null;
    this.scaleTransformMethodName = '_transformMethod';
    // If the line is to be shown (and not just a label) then make it
    this._line = null;
    if (this.width > 0) {
      // let dashStyleToUse = optionsToUse.dashStyle;
      // if (dashStyleToUse == null) {  // If undefined, make null
      //   dashStyleToUse = null;
      // }
      const straightLine = makeStraightLine(
        this.shapes, this.maxLength, this.width,
        // this.vertexSpaceStart,
        optionsToUse.color, this.dash, // this.maxLength,
        // optionsToUse.touchBorder,
        // optionsToUse.touchBorder, isTouchDevice,
      );
      const scaleTransformMethod = s => new Transform().scale(1, s);
      straightLine.fnMap.add(this.scaleTransformMethodName, scaleTransformMethod);
      this.add('line', straightLine);
    }

    // Arrow related properties
    // this.arrow1 = null;
    // this.arrow2 = null;
    this._arrow1 = null;
    this._arrow2 = null;

    // Label related properties
    this.label = null;
    this._label = null;
    this.showRealLength = false;
    // this.setLength(this.length);

    // if (optionsToUse.p1 != null && optionsToUse.p2 != null) {
    //   this.setEndPoints(optionsToUse.p1, optionsToUse.p2);
    // }
    if (optionsToUse.arrow != null) {
      const arrowOptions = simplifyArrowOptions(optionsToUse.arrow, this.width || 0.01);
      this.arrow = arrowOptions;
      this.addArrow('start');
      this.addArrow('end');
    }

    this.setupLine();


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

    this.pulseWidthDefaults = {
      line: optionsToUse.pulseWidth.line || 1,
      label: optionsToUse.pulseWidth.label || 1,
      arrow: optionsToUse.pulseWidth.arrow || 1,
      duration: optionsToUse.pulseWidth.duration || 1,
      frequency: optionsToUse.pulseWidth.frequency || 0,
    };

    // this.pulseDefault = (done) => {
    //   this.pulseWidth({
    //     line: this.pulseWidthDefaults.line,
    //     label: this.pulseWidthDefaults.label,
    //     arrow: this.pulseWidthDefaults.arrow,
    //     done,
    //   });
    //   if (this.pulseWidthDefaults.collection !== 1) {
    //     this.pulseScaleNow(1, this.pulseWidthDefaults.collection);
    //   }
    // };

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
    this.setupLine();
    // this.setLineDimensions();
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
      frequency?: number,
    } = {}) {
    const defaultOptions = {
      line: this.pulseWidthDefaults.line,
      label: this.pulseWidthDefaults.label,
      arrow: this.pulseWidthDefaults.arrow,
      done: null,
      duration: this.pulseWidthDefaults.duration,
      frequency: this.pulseWidthDefaults.frequency,
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
      line.pulseSettings.callback = this.pulseWidthDoneCallbackName;
      line.pulseSettings.transformMethod = this.scaleTransformMethodName;
      line.pulse({
        duration: options.duration,
        scale: options.line,
        frequency: options.frequency,
        callback: done,
        when: options.when,
      });
      done = null;
    }
    const arrow1 = this._arrow1;
    const arrow2 = this._arrow2;
    if (arrow1 != null) {
      arrow1.pulse({
        duration: options.duration,
        scale: options.arrow,
        frequency: options.frequency,
        callback: done,
        when: options.when,
        centerOn: arrow1.getPosition('diagram'),
      });
      done = null;
    }
    if (arrow2 != null) {
      arrow2.pulse({
        duration: options.duration,
        scale: options.arrow,
        frequency: options.frequency,
        callback: done,
        when: options.when,
        centerOn: arrow2.getPosition('diagram'),
      });
      done = null;
    }

    const label = this._label;
    if (label != null) {
      // label.pulseScaleNow(options.duration, options.label, 0, done);
      label.pulse({
        duration: options.duration,
        scale: options.label,
        frequency: options.frequency,
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
    lineEnd: 'start' | 'end',
  ) {
    if (this.arrow == null || this.arrow[lineEnd] == null) {
      return;
    }
    const o = this.arrow[lineEnd];
    let r = 0;
    let position = this.vertextSpaceStart + this.vertexSpaceLength;
    if (lineEnd === 'start') {
      r = Math.PI;
      position = this.vertexSpaceStart;
    }
    const a = this.shapes.arrow(joinObjects(
      {},
      o,
      {
        angle: r,
        color: this.color,
        transform: new Transform().translate(position),
      },
    ));
    const arrowLength = getArrowLength(o)[1];
    let index = 1;
    if (lineEnd === 'end') {
      index = 2;
    }
    this[`arrow${index}`] = { height: arrowLength };
    this.add(`arrow${index}`, a);
    // this.setLength(this.currentLength);
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
        if (this._movePad) {
          this._movePad.isMovable = false;
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
    const matrix = this._line.spaceTransformMatrix('diagram', 'draw');
    const touchBorder = getBoundingBorder(this.getBorder('diagram', 'touchBorder')).map(p => p.transformBy(matrix));
    const width = touchBorder[1].x - touchBorder[0].x;
    const height = touchBorder[2].y - touchBorder[1].y;
    if (this._rotPad == null) {
      const rotPad = this.shapes.rectangle({
        position: touchBorder[0]._dup(),
        xAlign: 'left',
        yAlign: 'bottom',
        width,
        height,
        color: [0, 0, 1, 0.5],
      });
      this.add('rotPad', rotPad);
      rotPad.setMovable();
      rotPad.move.type = 'rotation';
      rotPad.move.element = this;
    }
    if (this._movePad == null) {
      const movePad = this.shapes.rectangle({
        position: new Point(start.x, touchBorder[0].y),
        xAlign: 'left',
        yAlign: 'bottom',
        width: this.multiMove.vertexSpaceMidLength,
        height,
        color: [0, 1, 0, 0.5],
      });

      this.add('movePad', movePad);
      movePad.setMovable();

      movePad.move.type = 'translation';
      movePad.move.element = this;
    }
    // rotPad.isMovable = true,

    // const movePad = makeStraightLine(
    //   this.shapes, this.multiMove.vertexSpaceMidLength, this.width || 0.01,
    //   start, this.color, [], this.maxLength,
    //   this.touchBorder,
    //   // this.isTouchDevice,
    // );
    // // console.log(movePad)
    // movePad.isTouchable = true;
    // movePad.move.type = 'translation';
    // movePad.move.element = this;
    // movePad.isMovable = true;
    // movePad.move.canBeMovedAfterLosingTouch = true;
    // this.add('movePad', movePad);
    // if (this._line) {
    //   this._line.isTouchable = true;
    //   this._line.move.type = 'rotation';
    //   this._line.move.element = this;
    //   this._line.isMovable = true;
    //   this._line.move.canBeMovedAfterLosingTouch = true;
    // }
    this.hasTouchableElements = true;
    this.isTouchable = false;
    this.isMovable = false;
    this.multiMove.bounds = translationBounds;
    this.setLength(this.line.length());
  }

  updateMoveTransform(t: Transform = this.transform._dup()) {
    const r = t.r();
    const { bounds } = this.multiMove;
    // console.log('qqwer')
    if (r != null) {
      const w = Math.abs(this.line.length() / 2 * Math.cos(r));
      const h = Math.abs(this.line.length() / 2 * Math.sin(r));
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
      label.setText(roundNum(this.line.length(), 2)
        .toFixed(label.precision));
      // label.eqn.reArrangeCurrentForm();
    }
    const labelPosition = new Point(
      this.line.p1.x + label.linePosition * this.line.length(),
      0,
    );
    let labelOffsetAngle = Math.PI / 2;
    const labelOffsetMag = label.offset;
    if (label.location === 'end1' || label.location === 'end2') {
      if (label.location === 'end1') {
        labelPosition.x = -label.offset;
        labelOffsetAngle = -Math.PI;
      }
      if (label.location === 'end2') {
        labelPosition.x = this.line.length() + label.offset;
        labelOffsetAngle = 0;
      }
    } else {
      console.log(labelPosition, this.line, label.linePosition)
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

  setLength(newLength: number, align: 'start' | 'end' | 'center' | number = this.align) {
    let newLen = newLength;
    if (newLength === 0) {
      newLen = 0.0000001;
    }
    if (align === 'start') {
      this.line = new Line(this.line.p1, newLen, this.line.angle());
    } else if (align === 'end') {
      this.line = new Line(
        this.line.pointAtLength(this.line.length() - newLen),
        newLen, this.line.angle(),
      );
    } else if (align === 'center') {
      this.line = new Line(
        this.line.pointAtLength((this.line.length() - newLen) / 2),
        newLen, this.line.angle(),
      );
    } else if (typeof align === 'number') {
      // console.log(align)
      this.line = new Line(
        this.line.pointAtLength((this.line.length() - newLen) * align),
        newLen, this.line.angle(),
      );
    }
    this.setupLine();
    // const lineStart = this.vertexSpaceStart.x * newLength;
    // const lineLength = newLength;
    // let straightLineLength = lineLength;
    // let startOffset = 0;

    // if (this.arrow1 && this._arrow1) {
    //   straightLineLength -= this.arrow1.height;
    //   startOffset = this.arrow1.height;
    //   this._arrow1.setPosition(lineStart);
    // }
    // if (this.arrow2 && this._arrow2) {
    //   straightLineLength -= this.arrow2.height;
    //   this._arrow2.setPosition(lineStart + lineLength, 0);
    // }
    // const line = this._line;
    // if (line) {
    //   if (Array.isArray(this.dash) && this.dash.length > 0) {
    //     line.lengthToDraw = straightLineLength;
    //     // const newStart = this.vertexSpaceStart.x * straightLineLength;
    //     // const delta = lineStart + startOffset - newStart;
    //     line.setPosition(lineStart + startOffset - this.vertexSpaceStart.x, 0);
    //   } else {
    //     line.transform.updateScale(straightLineLength, 1);
    //     const newStart = this.vertexSpaceStart.x * straightLineLength;
    //     const delta = lineStart + startOffset - newStart;
    //     line.setPosition(delta, 0);
    //   }
    // }

    // const movePad = this._movePad;
    // if (movePad) {
    //   movePad.transform.updateScale(newLength, 1);
    //   const p = movePad.getPosition();
    //   movePad.setPosition(p.x * newLength, p.y);
    // }
    // const rotPad = this._rotPad;
    // if (rotPad) {
    //   rotPad.transform.updateScale(newLength, 1);
    //   const p = rotPad.getPosition();
    //   rotPad.setPosition(p.x * newLength, p.y);
    // }

    // // const movePad = this._movePad;
    // // if (movePad) {
    // //   movePad.transform.updateScale(newLength, 1);
    // // }
    // // const rotPad = this._rotPad;
    // // if (rotPad) {
    // //   rotPad.transform.updateScale(newLength, 1);
    // // }

    // this.length = newLength;
    // this.updateLineGeometry();
    // this.currentLength = newLength; // to deprecate?
    // this.updateLabel();
  }

  // updateLineGeometry() {
  //   const t = this.transform.t();
  //   const r = this.transform.r();
  //   if (t != null && r != null) {
  //     this.position = t;
  //     this.angle = r;
  //     const p1 = this.vertexSpaceStart.transformBy(new Transform()
  //       .scale(this.length)
  //       .rotate(this.angle)
  //       .translate(this.position)
  //       .m());
  //     const line = new Line(p1, this.length, this.angle);
  //     this.p1 = line.getPoint(1);
  //     this.p2 = line.getPoint(2);
  //     this.line = line;
  //   }
  // }

  setupLine() {
    const set = (key, x) => {
      if (this[`_${key}`] != null) {
        this[`_${key}`].transform.updateTranslation(x);
      }
    };
    let xPosition = 0;
    let position = this.line.p1._dup();
    if (typeof this.align === 'number') {
      xPosition = -this.line.length() * this.align;
      position = this.line.pointAtPercent(this.align);
    } else if (this.align === 'end') {
      xPosition = -this.line.length();
      position = this.line.p2._dup();
    } else if (this.align === 'center') {
      xPosition = -this.line.length() / 2;
      position = this.line.pointAtPercent(0.5);
    }
    this.localXPosition = xPosition;
    // set('line', xPosition);
    set('arrow1', xPosition);
    set('arrow2', xPosition + this.line.length());
    // set('movePad', xPosition);
    // set('rotPad', xPosition);

    // const lineStart = 0;
    let straightLineLength = this.line.length();
    let startOffset = 0;

    if (this.arrow1 && this._arrow1) {
      straightLineLength -= this.arrow1.height;
      startOffset = this.arrow1.height;
      // this._arrow1.setPosition(lineStart);
    }
    if (this.arrow2 && this._arrow2) {
      straightLineLength -= this.arrow2.height;
      // this._arrow2.setPosition(lineStart + this.line.length(), 0);
    }
    const line = this._line;
    if (this._line) {
      this._line.transform.updateTranslation(xPosition + startOffset);
      if (Array.isArray(this.dash) && this.dash.length > 0) {
        this._line.lengthToDraw = straightLineLength;
        // this._line.transform.updateTranslation(xPosition + startOffset);
        // const newStart = this.vertexSpaceStart.x * straightLineLength;
        // const delta = lineStart + startOffset - newStart;
        // this._line.setPosition(lineStart + startOffset - this.vertexSpaceStart.x, 0);
      } else {
        line.transform.updateScale(straightLineLength, 1);
        // const newStart = this.vertexSpaceStart.x * straightLineLength;
        // const delta = lineStart + startOffset - newStart;
        // line.setPosition(delta, 0);
      }
    }
    this.transform.updateRotation(this.line.angle());
    this.transform.updateTranslation(position);
    this.updateLabel();
    // if (this._label) {
    //   console.log(this._label.getPosition())
    // }
    // set('label', xPosition);

    // const movePad = this._movePad;
    // if (movePad) {
    //   movePad.transform.updateScale(newLength, 1);
    //   const p = movePad.getPosition();
    //   movePad.setPosition(p.x * newLength, p.y);
    // }
    // const rotPad = this._rotPad;
    // if (rotPad) {
    //   rotPad.transform.updateScale(newLength, 1);
    //   const p = rotPad.getPosition();
    //   rotPad.setPosition(p.x * newLength, p.y);
    // }
  }

  // setLineDimensions() {
  //   // const offset = polarToRect(this.offset, this.angle + Math.PI / 2);
  //   // this.transform.updateTranslation(this.position.add(offset));
  //   // this.transform.updateRotation(this.angle);
  //   // this.setPosition(this.line.p1);
  //   // this.setRotation(thi)
  //   const setLine = (p) => {
  //     if (this._line != null) {
  //       this._line.transform.updateTranslation(p);
  //     }
  //   };
  //   const setArrow = (index, p) => {
  //     if (this[`_arrow${index}`] != null) {
  //       this[`_arrow${index}`]._line.transform.updateTranslation(p);
  //     }
  //   }
  //   const setLabel = (p) => {
  //     if (this._line != null) {
  //       this._line.transform.updateTranslation(p);
  //     }
  //   };
  //   if (this.align === 'start') {
  //     if (this._line != null) {}
  //   }
  //   this.transform.updateTranslation(this.line.p1);
  //   this.transform.updateRotation(this.line.angle);
  //   this.setLength(this.line.length);
  //   this.updateLabel();
  // }

  setEndPoints(p: TypeParsablePoint, q: TypeParsablePoint, offset: number = 0) {
    // this.offset = offset;
    // const { length, angle, position } = this.calculateFromP1P2(getPoint(p), getPoint(q));
    // this.angle = angle;
    // this.length = length;
    // this.position = position;
    this.line = new Point(p, q).offset('positive', offset);
    this.setupLine();
    // this.setLineDimensions();

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
      initialLength: this.line.length(),
      deltaLength: toLength - this.line.length(),
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
    const target = this.line.length();
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
