// @flow

// import Figure from '../Figure';
import {
  Transform, Point, Line, normAngle, getBoundingBorder, getPositionInRect,
} from '../../tools/g2';
// import {
//   mul,
// } from '../../tools/m2';
import type {
  TypeParsablePoint, TypeParsableBuffer, TypeBorder, TypeXAlign, TypeYAlign,
} from '../../tools/g2';
import {
  roundNum,
} from '../../tools/math';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import EquationLabel from './EquationLabel';
import type {
  TypeLabelOrientation, TypeLabelLocation, TypeLabelSubLocation,
} from './EquationLabel';
// import type { TypeLabelEquationOptions } from './EquationLabel';
import { joinObjects } from '../../tools/tools';
import { Equation } from '../Equation/Equation';
import type { TypeWhen } from '../TimeKeeper';
import { simplifyArrowOptions, getArrowLength } from '../geometries/arrow';
import type { OBJ_LineArrows, OBJ_LineArrow, TypeArrowHead } from '../geometries/arrow';
import type { OBJ_Pulse, FigureElement } from '../Element';
import type { EQN_Equation } from '../Equation/Equation';
import * as animation from '../Animation/Animation';
import type { OBJ_CustomAnimationStep, OBJ_TriggerAnimationStep } from '../Animation/Animation';
import type { TypeColor, TypeDash } from '../../tools/types';
import type FigurePrimitives, { OBJ_Collection } from '../FigurePrimitives/FigurePrimitives';
import type FigureCollections from './FigureCollections';


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
 * Collections line label options object.
 *
 * A line can be annotated with a label using the `text` property and can be:
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
 * If the label text is the real length of the line (`null`), then the number
 * of decimal places can be selected with `precision`.
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
 * on, while `subLocation` defines the backup location for invalid cases of
 * `location`. See {@link TypeLabelLocation} and
 * {@link TypeLabelSubLocation}. `location` can additionaly place the
 * labels off the ends of the line.
 *
 * To automatically update the label location and orientation as the line
 * transform (translation, rotation or scale) changes then use `update: true`.
 *
 * @see {@link COL_Line}
 *
 * @property {null | string | Array<string> | Equation | EQN_Equation } text
 * @property {number} [precision]
 * @property {number} [offset]
 * @property {number} [linePosition]
 * @property {TypeLabelLocation} [location]
 * @property {TypeLabelSubLocation} [subLocation]
 * @property {TypeLabelOrientation} [orientation]
 * @property {boolean} [update] (`false`)
 * @property {number} [scale] size of the label
 * @property {TypeColor} [color]
 */
export type OBJ_LineLabel = {
  text: null | string | Array<string> | Equation | EQN_Equation,
  precision?: number,
  offset?: number,
  linePosition?: number,
  location?: TypeLabelLocation,
  subLocation?: TypeLabelSubLocation,
  orientation?: TypeLabelOrientation,
  update?: boolean,
  scale?: number,
  color?: TypeColor,
};


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
export type OBJ_LineMove = {
  // movable?: boolean,
  type?: 'translation' | 'rotation' | 'centerTranslateEndRotation' | 'scale',
  middleLength?: number,
  includeLabelInTouchBoundary?: boolean,
}

/**
 * setMovable options object for {@link COL_Line}.
 *
 * @extends OBJ_LineMove
 *
 * @property {boolean} [movable] `true` to make movable (`true`)
 */
export type OBJ_MovableLine = {
  movable?: boolean,
} & OBJ_LineMove;

/**
 * {@link CollectionsLine} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 *
 * The Collections Line is a convient and powerful line
 * {@link FigureElementCollection} that includes the line, arrows, a label
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
 * fixes the point from which the line changes length. This is also the point
 * where the line collection position will be if `getPosition` is called on the
 * element.
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
 *
 * @extends OBJ_Collection
 *
 * @property {TypeParsablePoint} [p1] First point of line
 * @property {TypeParsablePoint} [p2] Will override `length`/`angle` definition
 * @property {number} [angle] line angle
 * @property {number} [length]  line length
 * @property {number} [offset] line offset
 * @property {'start' | 'end' | 'center' | number} [align] rotation center of
 * line (only needed if rotating line)
 * @property {number} [width] line width
 * @property {OBJ_LineLabel} [label] label annotation
 * @property {OBJ_LineArrows | TypeArrowHead} [arrow] line arrow(s)
 * @property {TypeDash} [dash] make the line dashed
 * @property {OBJ_PulseWidth} [pulseWidth] default options for pulseWidth pulse
 * @property {OBJ_Pulse} [pulse] default options for normal pulse
 * @property {OBJ_LineMove} [move] line move options
 */
export type COL_Line = {
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  length?: number,
  angle?: number,
  offset?: number,
  align?: 'start' | 'end' | 'center' | number,
  width?: number,
  label?: OBJ_LineLabel,
  arrow?: OBJ_LineArrows | TypeArrowHead;
  dash?: TypeDash,
  pulseWidth?: OBJ_PulseWidth,
  pulse?: OBJ_Pulse;
  move?: OBJ_LineMove;
} & OBJ_Collection;


// Line is a class that manages:
//   A straight line
//   Arrows
//   Label
//   Future: Dimension posts
//
// In the straight line draw space, the line is defined from 0,0 to 1,0 if
// solid, and 0,0 to maxLength,0 if dashed. The length is changed by scaling
// the solid line, and changing the number of points drawn for the dashed line.
// The straight line position transform is then used to position the horiztonal
// line to make its 'start', 'center', 'end' or number align at (0, 0).
//
// Arrows are defined in draw space so their tip is at (0, 0). Their position
// transform then places their tips at p1 and p2 of the line.
//

class LineLabel extends EquationLabel {
  offset: number;
  location: TypeLabelLocation;
  subLocation: TypeLabelSubLocation;
  orientation: TypeLabelOrientation;
  linePosition: number;
  precision: number;

  constructor(
    collections: FigureCollections,
    labelText: string | Equation | EQN_Equation | Array<string>,
    color: TypeColor,
    offset: number,
    location: TypeLabelLocation = 'top',
    subLocation: TypeLabelSubLocation = 'left',
    orientation: TypeLabelOrientation = 'horizontal',
    linePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    scale: number = 0.7,
    precision: number = 1,
  ) {
    super(collections, { label: labelText, color, scale });
    this.offset = offset;
    this.location = location;
    this.subLocation = subLocation;
    this.orientation = orientation;
    this.linePosition = linePosition;
    this.precision = precision;
  }
}

function makeStraightLine(
  primitives: FigurePrimitives,
  length: number,
  width: number,
  color: TypeColor,
  dash: TypeDash,
  // maxLength: number,
  // touchBorder: number | { width: number, start: number, end: number },
): FigureElement {  // $FlowFixMe
  const straightLine = primitives.line({
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
 * @property {number} [start] line length to grow from (`current length`)
 * @property {number} [target] line length to grow to (`current length`)
 * @extends OBJ_CustomAnimationStep
 */
export type OBJ_LengthAnimationStep = {
  start?: number,
  target?: number,
} & OBJ_CustomAnimationStep;

/**
 * Pulse Width animation step.
 *
 *
 * @property {number} [line] width scale
 * @property {number | OBJ_Pulse} [label] label pulse options or scale. Use
 * the options object for more control of how the label is pulsed (for example
 * if the label should be pulsed from its bottom rather than its center).
 * @property {number} [arrow] arrow pulse scale
 * @property {function(): void} [done] execute when pulsing is finished
 * @property {number} [duration] pulse duration in seconds
 * @property {number} [frequency] pulse frequency in pulses per second
 * @extends OBJ_TriggerAnimationStep
 */
export type OBJ_PulseWidthAnimationStep = {
  line?: number,
  label?: number | OBJ_Pulse,
  arrow?: number,
  done?: ?() => void,
  duration?: number,
  frequency?: number,
} & OBJ_TriggerAnimationStep;


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
 * {@link FigureElementCollection} representing a line.
 *
 * <p class="inline_gif"><img src="./apiassets/advline_pulse.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/advline_grow.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/advline_multimove.gif" class="inline_gif_image"></p>
 *
 * This object defines a convient and powerful line
 * {@link FigureElementCollection} that includes a solid or dashed line,
 * arrows, a label annotation that can self align with line orientation, and
 * some methods to make it convient to use dynamically.
 *
 * See {@link COL_Line} for the options that can be used when creating the line.
 *
 * The object contains a two additional animation steps. `length`
 * animates changing the line length, and `pulseWidth` animates the
 * `pulseWidth` method. The animation steps are available in
 * the animation manager ({@link FigureElement}.animations),
 * and in the animation builder
 * (<a href="#animationmanagernew">animations.new</a>
 * and <a href="#animationmanagerbuilder">animations.builder</a>).
 *
 * Some of the useful methods included in an collections line are:
 * - <a href="#collectionslinepulsewidth">pulseWidth</a> - pulses the line without
 *   changing its length
 * - <a href="#collectionslinegrow">grow</a> - starts and animation that executes
 *   a single `length` animation
 *    step
 * - <a href="#collectionslinesetmovable">grow</a> - overrides
 *    <a href="#figureelementsetmovable">FigureElement.setMovable</a> and
 *    allowing for more complex move options.
 *
 * @see See {@link OBJ_LengthAnimationStep} for angle animation step options.
 *
 * See {@link OBJ_PulseWidthAnimationStep} for pulse angle animation step
 * options.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 *
 * @example
 * // Pulse an annotated line
 * figure.add({
 *   name: 'l',
 *   method: 'collections.line',
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
 * figure.elements._l.pulseWidth({ duration: 2 });
 *
 * @example
 * // Animate growing a line while showing it's length
 * figure.add({
 *   name: 'l',
 *   method: 'collections.line',
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
 * const l = figure.elements._l;
 * l.animations.new()
 *   .length({ start: 0.5, target: 2, duration: 2 })
 *   .start();
 *
 * @example
 * // Example showing dashed line with an equation label that stays horizontal
 * const l = figure.collections.line({
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
 * figure.add('l', l);
 * l.setMovable({ type: 'centerTranslateEndRotation'})
 * l.setAutoUpdate();
 *
 */
// $FlowFixMe
export default class CollectionsLine extends FigureElementCollection {
  // Figure elements
  _line: ?FigureElementPrimitive;
  _movePad: ?FigureElementPrimitive;
  _rotPad: ?FigureElementPrimitive;
  _startPad: ?FigureElementPrimitive;
  _arrow1: ?FigureElementPrimitive;
  _arrow2: ?FigureElementPrimitive;
  _label: null | {
    _base: FigureElementPrimitive;
  } & FigureElementCollection;

  label: ?LineLabel;
  arrow1: ?{ height: number; };
  arrow2: ?{ height: number; };

  line: Line;

  width: number;
  localXPosition: number;
  alignDraw: 'start' | 'end' | 'center' | number;
  dash: TypeDash;
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

  animations: {
    length: (OBJ_LengthAnimationStep) => animation.CustomAnimationStep,
    pulseWidth: (OBJ_PulseWidth) => animation.TriggerAnimationStep,
  } & animation.AnimationManager;

  lastParentRotationOffset: number;
  /**
   * @hideconstructor
   */
  constructor(
    // shapes: Object,
    // equation: Object,
    collections: FigureCollections,
    isTouchDevice: boolean,
    // animateNextFrame: void => void,
    options: COL_Line = {},
  ) {
    const defaultOptions = {
      // position: new Point(0, 0),
      width: 0.01,
      align: 'start',
      color: collections.primitives.defaultColor,
      dash: [],
      mods: {},
      pulseWidth: {
        line: 6,
        label: 2,
        arrow: 3,
        duration: 1,
        frequency: 0,
      },
      transform: new Transform('Line').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
      // touchBorder: 'children',
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    // if (optionsToUse.touchBorder == null) {
    //   if (isTouchDevice) {
    //     optionsToUse.touchBorder = optionsToUse.width * 16;
    //   } else {
    //     optionsToUse.touchBorder = optionsToUse.width * 8;
    //   }
    // }
    super(optionsToUse);
    this.setColor(optionsToUse.color);

    // this.shapes = shapes;
    // this.equation = equation;
    this.collections = collections;
    // this.touchBorder = optionsToUse.touchBorder;
    this.isTouchDevice = isTouchDevice;
    this.dash = optionsToUse.dash;
    this.width = optionsToUse.width;
    this.line = getLineFromOptions(optionsToUse);
    this.alignDraw = optionsToUse.align;
    this.localXPosition = 0;
    this.autoUpdateSubscriptionId = -1;
    this.lastParentRotationOffset = 0;


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
        this.collections.primitives, this.line.length(), this.width,
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
      // $FlowFixMe
      this.arrow = arrowOptions;
      this.addArrow('start');
      this.addArrow('end');
    }

    this.setupLine();


    const defaultLabelOptions = {
      text: null,
      offset: 0.00001,
      location: 'positive',
      subLocation: 'left',
      orientation: 'horizontal',
      linePosition: 0.5,
      scale: 0.7,
      color: optionsToUse.color,
      precision: 1,
      update: false,
    };
    if (optionsToUse.label !== undefined) {
      let labelOptions;
      if (typeof optionsToUse.label === 'string' || optionsToUse.label === null) {
        labelOptions = joinObjects({}, defaultLabelOptions, { text: optionsToUse.label });
      } else {
        labelOptions = joinObjects({}, defaultLabelOptions, optionsToUse.label);
      }
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
        labelOptions,
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

    this.fnMap.add('_lengthCallback', (percentage: number, customProperties: Object) => {
      const { start, target } = customProperties;
      const l = (target - start) * percentage + start;
      this.setLength(l);
    });
    this.animations.length = (...opt) => {
      const o = joinObjects({}, {
        element: this,
      }, ...opt);
      o.customProperties = {
        start: o.start == null ? this.line.length() : o.start,
        target: o.target == null ? this.line.length() : o.target,
      };
      o.callback = '_lengthCallback';
      o.timeKeeper = this.timeKeeper;
      return new animation.CustomAnimationStep(o);
    };

    // this.animations.form = (...opt) => {
    //   const o = joinObjects({}, { element: this }, ...opt);

    // }

    this.fnMap.add('_pulseWidth', (percentage: number, customProperties: Object) => {
      const {
        line, label, arrow, duration, frequency,
      } = customProperties;
      this.pulseWidth({
        line, label, arrow, duration, frequency,
      });
    });
    this.animations.pulseWidth = (...opt) => {
      const o = joinObjects({}, {
        element: this,
        duration: 1,
      }, ...opt);
      o.callback = '_pulseWidth';
      o.customProperties = {
        line: o.line,
        label: o.label,
        arrow: o.arrow,
        duration: o.duration,
        frequency: o.frequency,
      };
      o.timeKeeper = this.timeKeeper;
      // o.callback = () => {
      //   this.pulseWidth({
      //     line: o.line,
      //     label: o.label,
      //     arrow: o.arrow,
      //     duration: o.duration,
      //     frequency: o.frequency,
      //   });
      // };
      return new animation.TriggerAnimationStep(o);
    };

    this.animations.customSteps.push({
      step: this.animations.length.bind(this),
      name: 'length',
    });
    this.animations.customSteps.push({
      step: this.animations.pulseWidth.bind(this),
      name: 'pulseWidth',
    });
    // trigger(...options: Array<OBJ_TriggerAnimationStep>) {
    //   const optionsToUse = joinObjects({}, ...options);
    //   return new anim.TriggerAnimationStep(optionsToUse);
    // }
    this.fnMap.add('transformToLine', this.transformToLine.bind(this));
    this.subscriptions.add('setTransform', 'transformToLine');
  }

  /** A line has:
   *    - length
   *    - p1, p2
   *    - angle
   *    - position
   *    - reference alignment
   *
   * Two ways to define a line:
   *  - p1, p2
   *  - position, align, length, angle
   *
   * Line is defined by:
   *  - primitive line: full length, angle = 0, aligned in draw space with align
   *  - transform.translate: moves align position
   *  - transform.rotate: changes angle
   */
  transformToLine() {
    const r = this.transform.r() || 0;
    const t = this.transform.t() || new Point(0, 0);
    const length = this.line.length();
    const l = new Line(t, length, r);
    let p1 = [0, 0];
    if (this.alignDraw === 'start') {
      p1 = t._dup();
    } else if (this.alignDraw === 'end') {
      p1 = l.pointAtPercent(-1);
    } else if (this.alignDraw === 'center') {
      p1 = l.pointAtPercent(-0.5);
    } else if (typeof this.alignDraw === 'number') {
      p1 = l.pointAtPercent(-this.alignDraw);
    }

    // if (align === 'start') {
    //   this.line = new Line(this.line.p1, newLen, this.line.angle());
    // } else if (align === 'end') {
    //   this.line = new Line(
    //     this.line.pointAtLength(this.line.length() - newLen),
    //     newLen, this.line.angle(),
    //   );
    // } else if (align === 'center') {
    //   this.line = new Line(
    //     this.line.pointAtLength((this.line.length() - newLen) / 2),
    //     newLen, this.line.angle(),
    //   );
    // } else if (typeof align === 'number') {
    //   // console.log(align)
    //   this.line = new Line(
    //     this.line.pointAtLength((this.line.length() - newLen) * align),
    //     newLen, this.line.angle(),
    //   );
    // }
    this.line = new Line(p1, length, r);
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'line',
      'alignDraw',
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

  stateSet() {
    // if (this.name === 'rotator') {
    //   debugger;
    // }
    super.stateSet();
    this.setupLine();
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
        centerOn: arrow1.getPosition('figure'),
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
        centerOn: arrow2.getPosition('figure'),
      });
      done = null;
    }

    const label = this._label;
    if (label != null) {
      // label.pulseScaleNow(o.duration, o.label, 0, done);
      let labelOptions;
      if (typeof o.label === 'number') {
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
    const a = this.collections.primitives.arrow(joinObjects(
      {},
      o,
      {
        angle: r,
        color: this.color,
        transform: new Transform().translate(position),
      },
    ));
    // $FlowFixMe
    const arrowLength = getArrowLength(o)[1];
    let index = 1;
    if (lineEnd === 'end') {
      index = 2;
    }
    // $FlowFixMe
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
  //   const matrix = this.spaceTransformMatrix('draw', 'figure');
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
  //         const matrix = this.spaceTransformMatrix('figure', 'local');
  //         const p = startPad.getPosition('figure').transformBy(matrix);
  //         // const p = startPad.getPosition('draw')
  //         // console.log(Math.round(p.x * 100) / 100 , Math.round(p.y * 100) / 100)
  //         this.setEndPoints(p, this.line.p2._dup());
  //       } else {
  //         flag -= 1;
  //       }
  //       // const p = startPad.getPosition('figure');
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
      const rotPad = this.collections.primitives.rectangle({
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
      const movePad = this.collections.primitives.rectangle({
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
    // const { bounds } = this.move;
    // console.log('qqwer')
    if (r != null) {
      // const w = Math.abs(this.line.length() / 2 * Math.cos(r));
      // const h = Math.abs(this.line.length() / 2 * Math.sin(r));
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
    labelText: string | Equation | EQN_Equation | Array<string>,
    offset: number,
    location: TypeLabelLocation = 'top',
    subLocation: TypeLabelSubLocation = 'left',
    orientation: TypeLabelOrientation = 'horizontal',
    linePosition: number = 0.5,     // number where 0 is end1, and 1 is end2
    scale: number = 0.7,
    color: TypeColor = this.color,
    precision: number = 1,
    update: boolean = false,
    otherOptions: {
      isTouchable?: boolean,
      touchBorder?: TypeParsableBuffer | TypeBorder,
      onClick?: null | string | (() => void)
    } = {},
  ) {
    this.label = new LineLabel(
      this.collections, labelText, color,
      offset, location, subLocation, orientation, linePosition, scale,
      precision,
    );
    this.label.eqn.initialForm = null;
    if (otherOptions.isTouchable != null) {
      this.label.eqn.isTouchable = otherOptions.isTouchable;
    }
    if (otherOptions.touchBorder != null) {
      this.label.eqn.touchBorder = otherOptions.touchBorder;
    }
    if (otherOptions.onClick != null) {
      this.label.eqn.onClick = otherOptions.onClick;
    }
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

  /**
   * Manually update the label orientations with a custom rotation offset.
   *
   * Automatic updating can be done with
   * <a href="collectionsline#setautoupdate">setAutoUpdate</a>
   * @param {number | null} rotationOffset
   */
  updateLabel(rotationOffset: number | null = null) {
    if (rotationOffset != null) {
      this.lastParentRotationOffset = rotationOffset;
    }

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
      this.lastParentRotationOffset, 'oval', true,
      Math.PI * 2, Math.PI,
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
  setLength(
    length: number,
    align: 'start' | 'end' | 'center' | number = this.alignDraw,
  ) {
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
    this.alignDraw = align;
    this.setupLine();
  }

  // setRotation(angle: number) {
  //   super.setRotation(angle);
  //   this.line = new Line(this.)
  // }

  setupLine() {
    const wasHidden = !this.isShown;
    let labelWasHidden = false;
    if (this._label != null && this._label.isShown === false) {
      labelWasHidden = true;
    }
    const set = (key, x) => {
      // $FlowFixMe
      if (this[`_${key}`] != null) {  // $FlowFixMe
        this[`_${key}`].transform.updateTranslation(x);
      }
    };
    let xPosition = 0;
    let position = this.line.p1._dup();
    // const { align } = this;
    const align = this.alignDraw;
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
    straightLineLength = Math.max(straightLineLength, 0);
    const line = this._line;
    if (line) {
      line.transform.updateTranslation(xPosition + startOffset);
      line.custom.updatePoints({ p1: [0, 0], p2: [straightLineLength, 0], dash: this.dash });
      // if (Array.isArray(this.dash) && this.dash.length > 0) {
      //   line.lengthToDraw = straightLineLength;
      //   line.drawBorder = [[
      //     new Point(0, -this.width / 2),
      //     new Point(straightLineLength, -this.width / 2),
      //     new Point(straightLineLength, this.width / 2),
      //     new Point(0, this.width / 2),
      //   ]];
      //   line.drawBorderBuffer = line.drawingObject.border;
      // } else {
      //   line.transform.updateScale(straightLineLength, 1);
      // }
    }

    this.transform.updateRotation(this.line.angle());
    this.transform.updateTranslation(position);
    this.updateLabel();
    this.updateMovePads();
    if (wasHidden) {
      this.hide();
    }
    if (labelWasHidden && this._label != null) {
      this._label.hide();
    }
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

  pointFromTo(
    from: {
      element: FigureElement,
      xAlign: TypeXAlign,
      yAlign: TypeYAlign,
      space: number,
    },
    to: {
      element: FigureElement,
      xAlign: TypeXAlign,
      yAlign: TypeYAlign,
      space: number,
    },
    autoOutside: boolean = true,
  ) {
    const figureToLocal = this.spaceTransformMatrix('figure', 'local');
    const fromBounds = from.element.getBoundingRect('figure');
    const toBounds = to.element.getBoundingRect('figure');

    const defaults: {
      from: { xAlign: TypeXAlign, yAlign: TypeYAlign, space: number},
      to: { xAlign: TypeXAlign, yAlign: TypeYAlign, space: number},
    } = {
      from: { xAlign: 'center', yAlign: 'middle', space: 0 },
      to: { xAlign: 'center', yAlign: 'middle', space: 0 },
    };
    if (autoOutside) {
      const fromIntersect = fromBounds.intersectsWith(toBounds.center());
      const toIntersect = toBounds.intersectsWith(fromBounds.center());
      if (fromIntersect != null) {
        defaults.from.xAlign = (fromIntersect.x - fromBounds.left) / fromBounds.width;
        defaults.from.yAlign = (fromIntersect.y - fromBounds.bottom) / fromBounds.height;
      }
      if (toIntersect != null) {
        defaults.to.xAlign = (toIntersect.x - toBounds.left) / toBounds.width;
        defaults.to.yAlign = (toIntersect.y - toBounds.bottom) / toBounds.height;
      }
    }

    const o = joinObjects({}, defaults, { from, to });

    const fromPos = getPositionInRect(fromBounds, o.from.xAlign, o.from.yAlign)
      .transformBy(figureToLocal);
    const toPos = getPositionInRect(toBounds, o.to.xAlign, o.to.yAlign)
      .transformBy(figureToLocal);
    const line = new Line(fromPos, toPos);
    this.setEndPoints(
      line.pointAtLength(o.from.space),
      line.pointAtLength(line.length() - o.to.space),
    );
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
  grow(options: OBJ_LengthAnimationStep) {
    const o = joinObjects({}, { start: 0 }, options);
    this.animations.new()
      .then(this.animations.length(o))
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
   * Return a geometric {@link Line} object that represents the line
   * @return {Line}
   */
  getLine(
    // space: TypeSpace = 'local'
  ) {
    return new Line(this.getP1(), this.getP2());
  }

  /**
   * Return the start point of the line
   * @return {Point}
   */
  getP1(
    // space: TypeSpace = 'local'
  ) {
    // return this.line.p1._dup();
    // const matrix = this.spaceTransformMatrix('draw', space);
    // if (this._line != null) {
    //   matrix = mul(matrix, this._line.spaceTransformMatrix('draw', 'local'));
    //   // return this._line.getPosition(space);
    // }
    // return this.getPosition(space);

    // // if (space === 'draw') {
    // //   return this.line.p1._dup();
    // // }
    // // return this.line.p1.transformBy(this.spaceTransformMatrix('draw', space));
    // return new Point(0, 0).transformBy(matrix);
    return this.line.p1._dup();
  }

  /**
   * Return the end point of the line
   * @return {Point}
   */
  getP2(
    // space: TypeSpace = 'local'
  ) {
    return this.line.p2._dup();
    // if (space === 'draw') {
    //   return this.line.p2._dup();
    // }
    // return this.line.p2.transformBy(this.spaceTransformMatrix('draw', space));
    // return new Point(this.line.length(), 0)
    //   .transformBy(this.spaceTransformMatrix('draw', space));
  }
}

// export type TypeLine = CollectionsLine;

// export class MovableLine extends CollectionsLine {
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
  _line: FigureElementPrimitive;
  _label: {
    _base: FigureElementPrimitive;
  } & Equation;
} & CollectionsLine;
