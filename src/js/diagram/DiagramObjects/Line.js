// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point, Line, normAngle, getBoundingBorder,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  roundNum,
} from '../../tools/math';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';
import EquationLabel from './EquationLabel';
// import type { TypeLabelEquationOptions } from './EquationLabel';
import { joinObjects } from '../../tools/tools';
import { Equation } from '../DiagramElements/Equation/Equation';
import type { TypeWhen } from '../webgl/GlobalAnimation';
import { simplifyArrowOptions, getArrowLength } from '../DrawingObjects/Geometries/arrow';
import type { OBJ_LineArrows, OBJ_LineArrow } from '../DrawingObjects/Geometries/arrow';
import type { OBJ_Pulse } from '../Element';
import type { EQN_Equation } from '../DiagramElements/Equation/Equation';
import * as animation from '../Animation/Animation';
import type { OBJ_CustomAnimationStep } from '../Animation/Animation';

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
/**
 * Label location relative to the line.
 *
 * `'top' | 'left' | 'bottom' | 'right' | 'start' | 'end' | 'positive' | 'negative'`
 *
 * '`top`' is in the positive y direction and `'right'` is in the positive
 * x direction. '`bottom`' and '`left`' are the opposite sides respectively.
 *
 * `'positive'` is on the side of the line that the line rotates toward when
 * rotating in the positive direction. `'negative'` is the opposite side.
 *
 * `'start'` is the start end of the line, while `'end'` is the opposide end
 * of the line.
 */
export type TypeLineLabelLocation = 'top' | 'left' | 'bottom' | 'right'
                                    | 'start' | 'end' | 'outside' | 'inside'
                                    | 'positive' | 'negative';
// top - text is on top of line if line is horiztonal
// bottom - text is on bottom of line if line is horiztonal
// left - text is to left of line if line is vertical
// right - text is to right of line if line is vertical
/**
 * Label sub location relative to line.
 *
 * `'top' | 'left' | 'bottom' | 'right'`
 *
 * The label sub location is a fallback for when an invalid case is encountered
 * by the primary location. When the primary location is `'top'` or `'bottom'`
 * and the line is perfectly vertical, then the sub location would be used.
 *
 * Similarly, if the primary location is `'left'` or `'right'` and the line is
 * perfectly horizontal, then the sub location would be used.
 */
export type TypeLineLabelSubLocation = 'top' | 'left' | 'bottom' | 'right';


// horizontal - text is always horizontal;
// baseToLine - text angle is same as line, with baseline toward line
// baseAway - text angle is same as line, with baseline away from line
// baseUpright - text angle is same as line, with text upright

/**
 * Orientation of the label.
 *
 * `'horizontal' | 'toLine' | 'awayLine' | 'upright'`
 *
 * Where:
 * - `'horizontal'`: Label will be horizontal
 * - `'baseToLine'`: Label will have same angle as line with text base toward
 *   the line
 * - `'baseAway'`: Label will have same angle as line with text base away from
 *   the line
 * - `'upright'`: Label will have same angle as line with text being more
 *   upright than upside down.
 */
export type TypeLineLabelOrientation = 'horizontal' | 'baseAway' | 'baseToLine'
                                      | 'upright';


/**
 * Collection line label options object.
 *
 * A line can be annotated with a label using the `text` property and can be:
 * - text (`string`)
 * - an equation (`Equation`, `EQN_Equation`)
 * - real length of line (`null`)
 *
 *
 * If the label text is the real lenght of the line, then the number of decimal
 * places can be selected with `precision`.
 *
 * The space between the line and the label is defined with `offset`. An
 * `offset` of 0 puts the center of the label on the line. Any
 * positive or negative value of offset will move the label so no part of the
 * label overlaps the line, and then the closest part of the label is separated
 * from the line by `offset`.
 *
 * To situate the label on the line, use `linePosition`, `location` and
 * `subLocation`. By default the label will be a percentage `linePosition`
 * along the line. `location` then defines which side of the line the label is
 * on, while `subLocation` defines the backup location for invalide cases of
 * `location`. See {@link TypeLineLabelLocation} and
 * {@link TypeLineLabelSubLocation}. `location` can additionaly place the
 * labels off the ends of the line.
 *
 * To automatically update the label location and orientation as the line
 * transform (translation, rotation or scale) changes then use `update: true`.
 *
 *
 * @property {null | string | Equation | EQN_Equation } text
 * @property {number} [precision]
 * @property {number} [offset]
 * @property {TypeLineLabelLocation} [location]
 * @property {TypeLineLabelSubLocation} [subLocation]
 * @property {TypeLineLabelOrientation} [orientation]
 * @property {boolean} [update] (`false`)
 * @property {number} [linePosition]
 * @property {number} [scale] size of the label
 * @property {Array<number>} [color]
 */
export type TypeLineLabelOptions = {
  text: null | string | Array<string> | Equation | EQN_Equation,
  precision?: number,
  offset?: number,
  location?: TypeLineLabelLocation,
  subLocation?: TypeLineLabelSubLocation,
  orientation?: TypeLineLabelOrientation,
  update?: boolean,
  linePosition?: number,
  scale?: number,
  color?: Array<number>,
};

/**
 * Advanced Line options object
 *
 *
 * The Advanced Line is a convient and powerful line
 * {@link DiagramElementCollection} that includes the line, arrows, a label
 * annotation and some methods to make it convient to use dynamically.
 *
 * A line can either be defined by its two end points (`p1`, `p2`), or a
 * point (`p1`), `length` and `angle`.
 *
 * `offset` can be used to draw the line some offset away from the line
 * definition where a positive offset is on the side of the line that the line
 * rotates toward when rotating in the positive direction. This is especially
 * useful for creating lines that show dimensions of shapes.
 *
 * The line also has a control point which is positioned on the line with the
 * `align` property. The control point is the line's center of rotation, and
 * fixes the point from which the line changes length.
 *
 * For instance, setting the control point at `align: 'start'` will mean that
 * if the line can rotate, it will rotate around `p1`, and if the length is
 * changed, then `p1` will remain fixed while `p2` changes.
 *
 * `width` sets the width of the line. Setting the width to 0 will hide the
 * line itself, but if arrows or a label are defined they will still be
 * displayed.
 *
 * Use the `label` property to define and position a label relative to the line.
 * The label can be any string, equation or the actual length of the line and
 * be oriented relative to the line or always be horizontal.
 *
 * Use the `arrow` and `dash` properties to define arrows and the line style.
 *
 * Pulsing this collection normally would pulse both the length and width of
 * the line. If it often desirable to pulse a line without changing its length,
 * and so this collection provides a method `pulseWidth` to allow this. This
 * options object can define the default values for pulseWidth if desired.
 *
 * Default pulse values can then be specified with the `pulse` property.
 */
export type ADV_Line = {
  p1?: Point,
  p2?: Point,
  position?: Point,
  length?: number,
  angle?: number,
  offset?: number,
  align?: 'start' | 'end' | 'center' | number,
  width?: number,
  label?: TypeLineLabelOptions,
  color?: Array<number>,
  touchBorder?: Array<Array<Point>> | 'border' | number | 'rect',
  arrow: OBJ_LineArrows;
  dash: Array<number>,
  pulseWidth?: {
    line?: number,
    label?: number,
    arrow?: number,
    duration?: number,
    frequency?: number,
  },
  pulse: OBJ_Pulse;

  move?: {
    type?: 'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scale';
    middleLength?: number;
    includeLabelInTouchBoundary?: boolean;
  }
};

/**
 * Width pulse options object.
 *
 * @property {number} [line] width scale
 * @property {number | OBJ_Pulse} [label] label pulse options or scale. Use
 * the options object for more control of how the label is pulsed (for example
 * if the label should be pulsed from its bottom rather than its center).
 * @property {number} [arrow] arrow pulse scale
 * @property {function(): void} [done] execute when pulsing is finished
 * @property {number} [duration] pulse duration in seconds
 * @property {number} [frequency] pulse frequency in pulses per second
 * @property {TypeWhen} [when] when to start the pulse (`'nextFrame'`)
 */
export type OBJ_PulseWidth = {
  line?: number,
  label?: number | OBJ_Pulse,
  arrow?: number,
  done?: ?() => void,
  duration?: number,
  when?: TypeWhen,
  frequency?: number,
}

/**
 * Line move options object.
 *
 * The `'centerTranslateEndRotation`' movement will move the line
 * when touched within the `middleLength` percentage of the line
 * and rotate it otherwise.
 *
 * @property {boolean} [movable] `true` to make movable (`true`)
 * @property {'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scale'} [type]
 * @property {number} [middleLength] length of the middle section of line that
 * allows for translation movement in percent of total length (`0.333`)
 * @property {boolean} [includeLabelInTouchBoundary] `true` to include the
 * line's label in the touch boundary for `'centerTranslateEndRotation'`
 * ('false`)
 */
export type OBJ_MovableLine = {
  movable?: boolean,
  type?: 'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scale',
  middleLength?: number,
  includeLabelInTouchBoundary?: boolean,
}
// Line is a class that manages:
//   A straight line
//   Arrows
//   Label
//   Future: Dimension posts
//
// In the straight line draw space, the line is defined from 0,0 to 1,0 if
// solid, and 0,0 to maxLength,0 if dashed. The length is changed by scaling
// the solid line, and changing the number of points drawn for the dahsed line.
// The straight line position transform is then used to position the horiztonal
// line to make its 'start', 'center', 'end' or number align at (0, 0).
//
// Arrows are defined in draw space so their tip is at (0, 0). Their position
// transform then places their tips at p1 and p2 of the line.
//

class LineLabel extends EquationLabel {
  offset: number;
  location: TypeLineLabelLocation;
  subLocation: TypeLineLabelSubLocation;
  orientation: TypeLineLabelOrientation;
  linePosition: number;
  precision: number;

  constructor(
    equation: Object,
    labelText: string | Equation | EQN_Equation,
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
  color: Array<number>,
  dash: Array<number>,
  // maxLength: number,
  // touchBorder: number | { width: number, start: number, end: number },
) {
  const straightLine = shapes.line({
    p1: [0, 0],
    length: dash.length < 2 ? 1 : length,
    angle: 0,
    width,
    color,
    dash,
    transform: new Transform().scale(1, 1).translate(0, 0),
    // touchBorder,
  });

  return straightLine;
}

function getLineFromOptions(options: {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  angle?: number,
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
  if (o.offset !== 0) {
    line = line.offset('positive', o.offset);
  }
  return line;
}

/**
 * Grow line animation step.
 *
 * @property {number} [start] line length to grow from (`0`)
 * @property {number} [end] line length to grow to (`current length`)
 * @extends OBJ_CustomAnimationStep
 */
export type OBJ_GrowAnimationStep = {
  start?: number,
  target?: number,
} & OBJ_CustomAnimationStep;


/*
...................##.......####.##....##.########
...................##........##..###...##.##......
...................##........##..####..##.##......
...................##........##..##.##.##.######..
...................##........##..##..####.##......
...................##........##..##...###.##......
...................########.####.##....##.########
*/
// A line is always defined as horiztonal with length 1 in vertex space
// The line's position and rotation is the line collection transform
// translation and rotation respectively.
// The line's length is the _line primative x scale.
/**
 * {@link DiagramElementCollection} representing a line.
 *
 * <p class="inline_gif"><img src="./assets1/advline_pulse.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./assets1/advline_grow.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./assets1/advline_multimove.gif" class="inline_gif_image"></p>
 *
 * This object defines a convient and powerful line
 * {@link DiagramElementCollection} that includes a solid or dashed line,
 * arrows, a label annotation that can self align with line orientation, and
 * some methods to make it convient to use dynamically.
 *
 * See {@link ADV_Line} for the options that can be used when creating the line.
 *
 * The object contains an additional animation step `length` that can be used
 * to animate changing the line length. The animation step is available in
 * the animation manager (`animations` property), and in the animation builder
 * (`animations.new()` and `animations.builder()`).
 *
 * Some of the useful methods included in an advanced line are:
 * - <a href="#advancedlinepulsewidth">pulseWidth</a> - pulses the line without
 *   changing its length
 * - <a href="#advancedlinegrow">grow</a> - starts and animation that executes
 *   a single `length` animation
 *    step
 * - <a href="#advancedlinesetmovable">grow</a> - overrisdes
 *    <a href="#diagramelementsetmovable">DiagramElement.setMovable</a> and
 *    allowing for more complex move options.
 *
 * @see To test examples, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>
 *
 * @example
 * // Pulse an annotated line
 * diagram.addElement({
 *   name: 'l',
 *   method: 'advanced.line',
 *   options: {
 *     p1: [-1, 0],
 *     p2: [1, 0],
 *     arrow: 'triangle',
 *     label: {
 *       text: 'length',
 *       offset: 0.04,
 *     },
 *   },
 * });
 *
 * diagram.elements._l.pulseWidth({ duration: 2 });
 *
 * @example
 * // Animate growing a line while showing it's length
 * diagram.addElement({
 *   name: 'l',
 *   method: 'advanced.line',
 *   options: {
 *     p1: [-1, 0],
 *     p2: [-0.5, 0],
 *     align: 'start',
 *     arrow: { end: { head: 'barb', scale: 2 } },
 *     label: {
 *       text: null,
 *       offset: 0.03,
 *       precision: 2,
 *       location: 'start'
 *     },
 *   },
 * });
 *
 * const l = diagram.elements._l;
 * l.animations.new()
 *   .length({ start: 0.5, target: 2, duration: 2 })
 *   .start();
 *
 * @example
 * // Example showing dashed line with an equation label that stays horizontal
 * const l = diagram.advanced.line({
 *   p1: [0, 0],
 *   p2: [1.4, 0],
 *   align: 'start',
 *   label: {
 *     text: {                             // label text is an equation
 *       elements: {
 *         twopi: '2\u03C0',
 *       },
 *       forms: {
 *         base: ['twopi', ' ', { frac: ['a', 'vinculum', 'b'] } ]
 *       },
 *     },
 *     offset: 0.03,
 *     orientation: 'horizontal',          // keep label horizontal
 *     location: 'top',                    // keep label on top of line
 *   },
 *   dash: [0.08, 0.02, 0.02, 0.02],
 * });
 * diagram.add('l', l);
 * l.setMovable({ type: 'centerTranslateEndRotation'})
 * l.setAutoUpdate();
 *
 */
export default class AdvancedLine extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  _movePad: ?DiagramElementPrimitive;
  _rotPad: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;
  _label: null | {
    _base: DiagramElementPrimitive;
  } & DiagramElementCollection;

  label: ?LineLabel;
  arrow1: ?{ height: number; };
  arrow2: ?{ height: number; };

  line: Line;
  width: number;
  localXPosition: number;
  maxLength: number;
  align: 'start' | 'end' | 'center' | number;
  dash: Array<number>;
  arrow: ?{
    start?: OBJ_LineArrow,
    end?: OBJ_LineArrow,
  };

  showRealLength: boolean;
  autoUpdateSubscriptionId: number;

  shapes: Object;
  equation: Object;

  isTouchDevice: boolean;

  scaleTransformMethodName: string;

  animateLengthToStepFunctionName: string;
  animateLengthToDoneFunctionName: string;
  pulseWidthDoneCallbackName: string;

  pulseWidthDefaults: {
    line: number,
    label: number,
    arrow: number,
    duration: number,
    frequency: number,
  };

  multiMove: {
    midLength: number;
    includeLabelInTouchBoundary: boolean;
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

  // animations: { grow: (...OBJ_GrowAnimationStep) => CustomAnimationStep } & AnimationManager;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    // animateNextFrame: void => void,
    options: ADV_Line = {},
  ) {
    const defaultOptions = {
      // position: new Point(0, 0),
      width: 0.01,
      align: 'start',
      color: [1, 0, 0, 1],
      dash: [],
      mods: {},
      pulseWidth: {
        line: 6,
        label: 2,
        arrow: 3,
        duration: 1,
        frequency: 0,
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
    super(new Transform('Line')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.touchBorder = optionsToUse.touchBorder;
    this.isTouchDevice = isTouchDevice;
    this.dash = optionsToUse.dash;
    this.width = optionsToUse.width;
    this.line = getLineFromOptions(optionsToUse);
    this.align = optionsToUse.align;
    this.localXPosition = 0;
    this.maxLength = optionsToUse.maxLength != null ? optionsToUse.maxLength : this.line.length();
    this.autoUpdateSubscriptionId = -1;


    // this.animateLengthToOptions = {
    //   initialLength: 0,
    //   deltaLength: 1,
    //   finishOnCancel: true,
    //   callback: null,
    //   onStepCallback: null,
    // };

    this.pulseWidthOptions = {
      oldCallback: null,
      oldTransformMethod: null,
    };

    // this.animateLengthToStepFunctionName = '_animateToLengthStep';
    // this.fnMap.add(this.animateLengthToStepFunctionName, this.animateLengthToStep.bind(this));
    // this.animateLengthToDoneFunctionName = '_animateToLengthDone';
    // this.fnMap.add(this.animateLengthToDoneFunctionName, this.animateLengthToDone.bind(this));
    // this.pulseWidthDoneCallbackName = '_pulseWidthDone';
    // this.fnMap.add(this.pulseWidthDoneCallbackName, this.pulseWidthDone.bind(this));

    // this.transform.updateTranslation(this.line.p1);
    // this.transform.updateRotation(this.line.angle);

    // Line is defined in vertex space as horiztonal along the x axis.
    // The reference will define how it is offset where:
    //    - start: line extends from 0 to length in x
    //    - end: line extends from -length to 0 in length
    //    - middle: line extends from -length / 2 to length / 2
    //    - percent: line extends from -length * % to length * (1 - %)

    // MultiMove means the line has a middle section that when touched
    // translates the line collection, and when the rest of the line is
    // touched then the line collection is rotated.
    this.multiMove = {
      midLength: 0,
      includeLabelInTouchBoundary: false,
      // bounds: new RectBounds({
      //   left: -1, bottom: -1, top: 1, right: 1
      // }),
      // bounds: new Rect(-1, -1, 2, 2),
    };

    this.scaleTransformMethodName = '_transformMethod';
    // If the line is to be shown (and not just a label) then make it
    this._line = null;
    if (this.width > 0) {
      const straightLine = makeStraightLine(
        this.shapes, this.maxLength, this.width,
        optionsToUse.color, this.dash, // this.maxLength,
      );
      const scaleTransformMethod = s => new Transform().scale(1, s);
      straightLine.fnMap.add(this.scaleTransformMethodName, scaleTransformMethod);
      this.add('line', straightLine);
    }

    // Arrow related properties
    this._arrow1 = null;
    this._arrow2 = null;

    // Label related properties
    this.label = null;
    this._label = null;
    this.showRealLength = false;

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
      update: false,
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
        labelOptions.update,
      );
    }

    const defaultMoveOptions = {
      type: 'rotation',
      middleLength: 0.22,
      includeLabelInTouchBoundary: false,
    };
    if (optionsToUse.move) {
      const moveOptions = joinObjects({}, defaultMoveOptions, optionsToUse.move);
      this.setMovable({
        movable: true,
        type: moveOptions.type,
        middleLength: moveOptions.middleLength,
      });
    }

    this.pulseWidthDefaults = {
      line: optionsToUse.pulseWidth.line || 1,
      label: optionsToUse.pulseWidth.label || 1,
      arrow: optionsToUse.pulseWidth.arrow || 1,
      duration: optionsToUse.pulseWidth.duration || 1,
      frequency: optionsToUse.pulseWidth.frequency || 0,
    };

    if (optionsToUse.mods != null && optionsToUse.mods !== {}) {
      this.setProperties(optionsToUse.mods);
    }

    this.animations.length = (...options) => {
      const o = joinObjects({}, {
        element: this,
        start: 0,
        target: this.line.length(),
      }, ...options);
      o.callback = (percentage) => {
        const l = (o.target - o.start) * percentage + o.start;
        this.setLength(l);
      };
      return new animation.CustomAnimationStep(o);
    };

    this.animations.customSteps.push(
      {
        step: this.animations.length.bind(this),
        name: 'length',
      },
    );
    // trigger(...options: Array<OBJ_TriggerAnimationStep>) {
    //   const optionsToUse = joinObjects({}, ...options);
    //   return new anim.TriggerAnimationStep(optionsToUse);
    // }
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'line',
      'align',
      // 'length',
      // 'position',
      'width',
      'dash',
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

  /**
   * Pulse the line so that it's width pulses and its length doesn't change.
   *
   * The pulse scales of the line, label and arrows can all be defined
   * separately.
   */
  pulseWidth(options?: OBJ_PulseWidth = {}) {
    const defaultOptions = {
      line: this.pulseWidthDefaults.line,
      label: this.pulseWidthDefaults.label,
      arrow: this.pulseWidthDefaults.arrow,
      done: null,
      duration: this.pulseWidthDefaults.duration,
      frequency: this.pulseWidthDefaults.frequency,
      when: 'nextFrame',
    };
    const o = joinObjects(defaultOptions, options);
    let { done } = o;
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
        duration: o.duration,
        scale: o.line,
        frequency: o.frequency,
        callback: done,
        when: o.when,
      });
      done = null;
    }
    const arrow1 = this._arrow1;
    const arrow2 = this._arrow2;
    if (arrow1 != null) {
      arrow1.pulse({
        duration: o.duration,
        scale: o.arrow,
        frequency: o.frequency,
        callback: done,
        when: o.when,
        centerOn: arrow1.getPosition('diagram'),
      });
      done = null;
    }
    if (arrow2 != null) {
      arrow2.pulse({
        duration: o.duration,
        scale: o.arrow,
        frequency: o.frequency,
        callback: done,
        when: o.when,
        centerOn: arrow2.getPosition('diagram'),
      });
      done = null;
    }

    const label = this._label;
    if (label != null) {
      // label.pulseScaleNow(o.duration, o.label, 0, done);
      let labelOptions;
      if (typeof label === 'number') {
        labelOptions = joinObjects({}, o, { scale: o.label, callback: done });
      } else {
        labelOptions = joinObjects({}, o, o.label, { callback: done });
      }
      label.pulse(labelOptions);
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
    let position = 1;
    if (lineEnd === 'start') {
      r = Math.PI;
      position = 0;
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
  }

  /**
   * Use this method to enable or disable movability of the line.
   *
   * @param {OBJ_MovableLine | boolean} [movableOrOptions] `true` to
   * make movable, `false` to make not movable or use options to
   * set different kinds of movability.
   */
  // $FlowFixMe
  setMovable(movableOrOptions: OBJ_MovableLine | boolean) {
    const defaultOptions = {
      movable: true,
      type: this.move.type,
      middleLength: 0.333,
      includeLabelInTouchBoundary: false,
    };
    let options;
    if (movableOrOptions === false) {
      options = joinObjects({}, defaultOptions, { movable: false });
    } else if (movableOrOptions === true) {
      options = defaultOptions;
    } else {
      options = joinObjects({}, defaultOptions, movableOrOptions);
    }
    const { movable } = options;
    if (movable) {
      const {
        includeLabelInTouchBoundary, type, middleLength,
      } = options;
      this.multiMove.includeLabelInTouchBoundary = includeLabelInTouchBoundary;
      if (type === 'translation' || type === 'rotation'
        || type === 'scale'
      ) {
        this.move.type = type;
        super.setMovable(true);
        this.hasTouchableElements = true;
        if (this._line != null) {
          this._line.isTouchable = true;
          this._line.isMovable = false;
        }
        if (this._movePad) {
          this._movePad.isMovable = false;
        }
      } else if (type === 'centerTranslateEndRotation') {
        this.setMultiMovable(middleLength);
        this.updateMovePads();
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

  // getP1Position() {
  //   const matrix = this.spaceTransformMatrix('draw', 'diagram');
  //   return new Point(this.localXPosition, 0).transformBy(matrix);
  // }

  // setMovableLength() {
  //   // const elements = ['line', 'arrow1', 'arrow2'];
  //   // if (this.multiMove.includeLabelInTouchBoundary) {
  //   //   elements.push('label');
  //   // }
  //   // const touchBorder = getBoundingBorder(this.getBorder('draw', 'touchBorder', elements));
  //   // const width = touchBorder[0].distance(touchBorder[1]);
  //   // const height = touchBorder[0].distance(touchBorder[3]);
  //   const r = 0.1;
  //   if (this._startPad == null) {
  //     const startPad = this.shapes.polygon({
  //       position: new Point(this.localXPosition, 0),
  //       radius: r,
  //       sides: 8,
  //       color: [0, 0, 1, 0.5],
  //     });
  //     // console.log(width, height)
  //     // startPad.transform.updateScale(width, height);
  //     // startPad.transform.updateTranslation(touchBorder[0]);
  //     this.add('startPad', startPad);
  //     startPad.setMovable();
  //     startPad.move.type = 'translation';
  //     // startPad.move.element = this;
  //     let flag = 5;
  //     startPad.subscriptions.add('setTransform', () => {
  //       if (flag === 0) {
  //         flag = 5;
  //         const matrix = this.spaceTransformMatrix('diagram', 'local');
  //         const p = startPad.getPosition('diagram').transformBy(matrix);
  //         // const p = startPad.getPosition('draw')
  //         // console.log(Math.round(p.x * 100) / 100 , Math.round(p.y * 100) / 100)
  //         this.setEndPoints(p, this.line.p2._dup());
  //       } else {
  //         flag -= 1;
  //       }
  //       // const p = startPad.getPosition('diagram');
  //     });
  //     startPad.drawingObject.border = [[]];
  //   }
  //   this.hasTouchableElements = true;
  //   this.isTouchable = false;
  //   this.isMovable = false;
  //   // this.setLength(this.line.length());
  // }

  // Private
  setMultiMovable(middleLengthPercent: number) {
    this.multiMove.midLength = middleLengthPercent;
    if (this._rotPad == null) {
      const rotPad = this.shapes.rectangle({
        position: new Point(0, 0),
        xAlign: 'left',
        yAlign: 'bottom',
        width: 1,
        height: 1,
        color: [0, 0, 1, 0.0005],
      });
      this.add('rotPad', rotPad);
      rotPad.setMovable();
      rotPad.move.type = 'rotation';
      rotPad.move.element = this;
      rotPad.drawingObject.border = [[]];
    }
    if (this._movePad == null) {
      const movePad = this.shapes.rectangle({
        position: new Point(0, 0),
        xAlign: 'left',
        yAlign: 'bottom',
        width: 1,
        height: 1,
        color: [0, 1, 0, 0.0005],
      });

      this.add('movePad', movePad);
      movePad.setMovable();

      movePad.move.type = 'translation';
      movePad.move.element = this;
      movePad.drawingObject.border = [[]];
    }
    this.hasTouchableElements = true;
    this.isTouchable = false;
    this.isMovable = false;
    this.setLength(this.line.length());
  }


  /**
   * Use this to manually update the rotation of the line collection.
   */
  updateMoveTransform(t: Transform = this.transform._dup()) {
    const r = t.r();
    const { bounds } = this.move;
    // console.log('qqwer')
    if (r != null) {
      const w = Math.abs(this.line.length() / 2 * Math.cos(r));
      const h = Math.abs(this.line.length() / 2 * Math.sin(r));
      // if (bounds instanceof TransformBounds) {
      //   bounds.updateTranslation(new RectBounds({
      //     left: bounds.left + w,
      //     bottom: bounds.bottom + h,
      //     right: bounds.right - w,
      //     top: bounds.top - h,
      //   }));
      // }
      if (r > 2 * Math.PI) {
        this.transform.updateRotation(r - 2 * Math.PI);
      }
      if (r < 0) {
        this.transform.updateRotation(r + 2 * Math.PI);
      }
    }
  }

  addLabel(
    labelText: string | Equation | EQN_Equation | null,
    offset: number,
    location: TypeLineLabelLocation = 'top',
    subLocation: TypeLineLabelSubLocation = 'left',
    orientation: TypeLineLabelOrientation = 'horizontal',
    linePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    scale: number = 0.7,
    color: Array<number> = this.color,
    precision: number = 1,
    update: boolean = false,
  ) {
    this.label = new LineLabel(
      this.equation, labelText, color,
      offset, location, subLocation, orientation, linePosition, scale,
      precision,
    );
    if (this.label != null) {
      this.add('label', this.label.eqn);
    }
    // if (update) {
    //   this.subscriptions.add('setTransform', () => {
    //     this.updateLabel();
    //     this.updateMovePads();
    //   });
    // }
    this.setAutoUpdate(update);
    this.updateLabel();
    this.updateMovePads();
  }

  /**
   * Turn on and off auto label location and orientation updates when line
   * transform changes. When a line is created with a label, auto update
   * is turned off by default.
   */
  setAutoUpdate(update: boolean = true) {
    if (update) {
      this.autoUpdateSubscriptionId = this.subscriptions.add('setTransform', () => {
        this.updateLabel();
        this.updateMovePads();
      });
    } else {
      // console.log(this.autoUpdateSubscriptionId)
      this.subscriptions.remove('setTransform', this.autoUpdateSubscriptionId);
      this.autoUpdateSubscriptionId = -1;
    }
  }

  /**
   * Get line length
   * @return {number}
   */
  getLength() {
    return this.line.length();
  }

  /**
   * Get line angle
   * @param {'deg' | 'rad'} [units]
   * @return {number}
   */
  getAngle(units: 'deg' | 'rad' = 'rad') {
    if (units === 'deg') {
      return this.line.angle() * 180 / Math.PI;
    }
    return this.line.angle();
  }

  /**
   * Change the text of the label
   */
  setLabel(text: string) {
    this.showRealLength = false;
    if (this.label != null) {
      this.label.setText(text);
    }
    this.updateLabel();
    this.updateMovePads();
  }

  /**
   * Get the text of the label
   */
  getLabel() {
    if (this.label != null) {
      return this.label.getText();
    }
    return '';
  }

  /**
   * Set the label to be the real length of the line
   */
  setLabelToRealLength() {
    this.showRealLength = true;
    this.updateLabel();
    this.updateMovePads();
  }

  updateLabel(parentRotationOffset: number = 0) {
    const { label } = this;
    if (label == null) {
      return;
    }
    const lineAngle = normAngle(this.transform.r() || 0);
    if (this.showRealLength && this._label) {
      const labelToUse = roundNum(this.line.length(), 2)
        .toFixed(label.precision);
      const current = label.getText();
      if (current !== labelToUse) {
        label.setText(roundNum(this.line.length(), 2)
          .toFixed(label.precision));
      }
    }
    const labelPosition = new Point(
      this.localXPosition + label.linePosition * this.line.length(),
      0,
    );
    if (label.location === 'start') {
      labelPosition.x = this.localXPosition;
    }
    if (label.location === 'end') {
      labelPosition.x = this.localXPosition + this.line.length();
    }

    label.updateRotation(
      labelPosition, lineAngle, label.offset,
      label.location, label.subLocation, label.orientation,
      parentRotationOffset, 'oval',
    );
  }

  // updateLabelLegacy(parentRotationOffset: number = 0) {
  //   const { label } = this;
  //   if (label == null) {
  //     return;
  //   }
  //   const lineAngle = normAngle(this.transform.r() || 0);
  //   let labelAngle = 0;
  //   if (this.showRealLength && this._label) {
  //     const labelToUse = roundNum(this.line.length(), 2)
  //       .toFixed(label.precision);
  //     const current = label.getText();
  //     if (current !== labelToUse) {
  //       label.setText(roundNum(this.line.length(), 2)
  //         .toFixed(label.precision));
  //     }
  //   }
  //   const labelPosition = new Point(
  //     this.localXPosition + label.linePosition * this.line.length(),
  //     0,
  //   );
  //   let labelOffsetAngle = Math.PI / 2;
  //   const labelOffsetMag = label.offset;
  //   if (label.location === 'start' || label.location === 'end') {
  //     if (label.location === 'start') {
  //       labelPosition.x = this.localXPosition - label.offset;
  //       labelOffsetAngle = -Math.PI;
  //     }
  //     if (label.location === 'end') {
  //       labelPosition.x = this.localXPosition + this.line.length() + label.offset;
  //       labelOffsetAngle = 0;
  //     }
  //   } else {
  //     const offsetTop = Math.cos(lineAngle) < 0 ? -Math.PI / 2 : Math.PI / 2;
  //     const offsetBottom = -offsetTop;
  //     const offsetLeft = Math.sin(lineAngle) > 0 ? Math.PI / 2 : -Math.PI / 2;
  //     const offsetRight = -offsetLeft;

  //     if (label.location === 'top') {
  //       labelOffsetAngle = offsetTop;
  //     }
  //     if (label.location === 'bottom') {
  //       labelOffsetAngle = offsetBottom;
  //     }
  //     if (label.location === 'right') {
  //       labelOffsetAngle = offsetRight;
  //     }
  //     if (label.location === 'left') {
  //       labelOffsetAngle = offsetLeft;
  //     }
  //     if (label.location === 'positive') {
  //       labelOffsetAngle = Math.PI / 2;
  //     }
  //     if (label.location === 'negative') {
  //       labelOffsetAngle = -Math.PI / 2;
  //     }
  //     if (roundNum(Math.sin(lineAngle), 4) === 0
  //       && (label.location === 'left' || label.location === 'right')
  //     ) {
  //       if (label.subLocation === 'top') {
  //         labelOffsetAngle = offsetTop;
  //       }
  //       if (label.subLocation === 'bottom') {
  //         labelOffsetAngle = offsetBottom;
  //       }
  //     }
  //     if (roundNum(Math.cos(lineAngle), 4) === 0
  //       && (label.location === 'top' || label.location === 'bottom')
  //     ) {
  //       if (label.subLocation === 'right') {
  //         labelOffsetAngle = offsetRight;
  //       }
  //       if (label.subLocation === 'left') {
  //         labelOffsetAngle = offsetLeft;
  //       }
  //     }
  //     if (label.location === 'inside') {
  //       labelOffsetAngle = -Math.PI / 2;
  //     }
  //     if (label.location === 'outside') {
  //       labelOffsetAngle = Math.PI / 2;
  //     }
  //   }

  //   if (label.orientation === 'horizontal') {
  //     labelAngle = -lineAngle;
  //   }
  //   if (label.orientation === 'baseToLine') {
  //     labelAngle = 0;
  //     if (labelOffsetAngle < 0) {
  //       labelAngle = Math.PI;
  //     }
  //   }
  //   if (label.orientation === 'baseAway') {
  //     labelAngle = Math.PI;
  //     if (labelOffsetAngle < 0) {
  //       labelAngle = 0;
  //     }
  //   }
  //   if (label.orientation === 'upright') {
  //     if (Math.cos(lineAngle) < 0) {
  //       labelAngle = Math.PI;
  //     }
  //   }

  //   label.updateRotation(
  //     labelAngle - parentRotationOffset,
  //     labelPosition, labelOffsetMag, labelOffsetAngle,
  //   );
  // }

  /**
   * Set the length of the line
   */
  setLength(length: number, align: 'start' | 'end' | 'center' | number = this.align) {
    let newLen = length;
    if (length === 0) {
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
  }

  setupLine() {
    const set = (key, x) => {
      if (this[`_${key}`] != null) {
        this[`_${key}`].transform.updateTranslation(x);
      }
    };
    let xPosition = 0;
    let position = this.line.p1._dup();
    const { align } = this;
    if (typeof align === 'number') {
      xPosition = -this.line.length() * align;
      position = this.line.pointAtPercent(align);
    } else if (align === 'end') {
      xPosition = -this.line.length();
      position = this.line.p2._dup();
    } else if (align === 'center') {
      xPosition = -this.line.length() / 2;
      position = this.line.pointAtPercent(0.5);
    }
    this.localXPosition = xPosition;
    set('arrow1', xPosition);
    set('arrow2', xPosition + this.line.length());

    let straightLineLength = this.line.length();
    let startOffset = 0;

    if (this.arrow1 && this._arrow1) {
      straightLineLength -= this.arrow1.height;
      startOffset = this.arrow1.height;
    }
    if (this.arrow2 && this._arrow2) {
      straightLineLength -= this.arrow2.height;
    }
    const line = this._line;
    if (line) {
      line.transform.updateTranslation(xPosition + startOffset);
      if (Array.isArray(this.dash) && this.dash.length > 0) {
        line.lengthToDraw = straightLineLength;
        line.drawingObject.border = [[
          new Point(0, -this.width / 2),
          new Point(straightLineLength, -this.width / 2),
          new Point(straightLineLength, this.width / 2),
          new Point(0, this.width / 2),
        ]];
        line.drawingObject.touchBorder = line.drawingObject.border;
      } else {
        line.transform.updateScale(straightLineLength, 1);
      }
    }

    this.transform.updateRotation(this.line.angle());
    this.transform.updateTranslation(position);
    this.updateLabel();
    this.updateMovePads();
  }

  updateMovePads() {
    if (this._movePad == null || this._rotPad == null) {
      return;
    }
    const elements = ['line', 'arrow1', 'arrow2'];
    if (this.multiMove.includeLabelInTouchBoundary) {
      elements.push('label');
    }
    const touchBorder = getBoundingBorder(this.getBorder('draw', 'touchBorder', elements));
    const width = touchBorder[0].distance(touchBorder[1]);
    const height = touchBorder[0].distance(touchBorder[3]);
    const movePad = this._movePad;
    if (movePad) {
      const midWidth = this.multiMove.midLength * this.line.length();
      movePad.transform.updateScale(midWidth, height);
      // const p = movePad.getPosition();
      movePad.setPosition(
        this.localXPosition + this.line.length() / 2 - midWidth / 2,
        touchBorder[0].y,
      );
    }
    const rotPad = this._rotPad;
    if (rotPad) {
      rotPad.transform.updateScale(width, height);
      // const p = rotPad.getPosition();
      rotPad.setPosition(touchBorder[0].x, touchBorder[0].y);
    }
    const startPad = this._startPad;
    if (startPad) {
      startPad.transform.updateTranslation(this.localXPosition, 0);
    }
  }

  /**
   * Change the line position, length and angle using end points and an offset.
   *
   * For most lines, an offset of 0 will be desired, as this will position the
   * line ends to be at `p1` and `p2`.
   *
   * A non-positive offset will position the line in parallel with `p1` and `p2`
   * but some offset away. A positive offset will position the line on the side
   * it will rotate toward with positive rotation.
   */
  setEndPoints(p1: TypeParsablePoint, p2: TypeParsablePoint, offset: number = 0) {
    this.line = new Line(p1, p2).offset('positive', offset);
    // console.log(p, q)
    this.setupLine();
  }

  // animateLengthToStep(percent: number) {
  //   const { initialLength, deltaLength, onStepCallback } = this.animateLengthToOptions;
  //   this.setLength(initialLength + deltaLength * percent);
  //   if (onStepCallback != null) {
  //     this.fnMap.exec(onStepCallback, percent, initialLength + deltaLength * percent);
  //   }
  // }

  // animateLengthToDone() {
  //   const {
  //     initialLength, callback, deltaLength, finishOnCancel,
  //   } = this.animateLengthToOptions;
  //   if (finishOnCancel) {
  //     this.setLength(initialLength + deltaLength);
  //   }
  //   this.fnMap.exec(callback);
  // }

  // animateLengthTo(
  //   toLength: number = 1,
  //   time: number = 1,
  //   finishOnCancel: boolean = true,
  //   callback: ?(string | (() => void)) = null,
  //   onStepCallback: ?(string | ((number, number) => void)) = null,
  //   stop: ?boolean = true,
  // ) {
  //   if (stop) {
  //     this.stop();
  //   }
  //   this.animateLengthToOptions = {
  //     initialLength: this.line.length(),
  //     deltaLength: toLength - this.line.length(),
  //     callback,
  //     onStepCallback,
  //     finishOnCancel,
  //   };
  //   this.animations.new('Line Length')
  //     .custom({
  //       callback: this.animateLengthToStepFunctionName,
  //       duration: time,
  //     })
  //     .whenFinished(this.animateLengthToDoneFunctionName)
  //     .start();
  //   this.animateNextFrame();
  // }

  // /**
  //  * Grow the line from a length to the current length
  //  */
  // growLegacy(
  //   fromLength: number = 0,
  //   duration: number = 1,
  //   finishOnCancel: boolean = true,
  //   callback: ?(string | (() => void)) = null,
  //   onStepCallback: ?(number, number) => void = null,
  // ) {
  //   this.stop();
  //   const target = this.line.length();
  //   this.setLength(fromLength);
  //   this.animateLengthTo(target, duration, finishOnCancel, callback, onStepCallback);
  // }

  /**
   * Create a new animation that executes a single grow animation step.
   */
  grow(options: OBJ_GrowAnimationStep) {
    this.animations.new()
      .then(this.animations.length(options))
      .start();
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

  /**
   * Return the start point of the line
   * @return {Point}
   */
  getP1() {
    // const m = this.transform.matrix();
    // return this.line.p1.transformBy(m);
    return this.line.p1._dup();
  }

  /**
   * Return the end point of the line
   * @return {Point}
   */
  getP2() {
    // const m = this.transform.matrix();
    // return this.p2.transformBy(m);
    return this.line.p2._dup();
  }
}

// export type TypeLine = AdvancedLine;

// export class MovableLine extends AdvancedLine {
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
} & AdvancedLine;
