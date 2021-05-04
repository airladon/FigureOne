// @flow

// import Figure from '../Figure';
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
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import EquationLabel from './EquationLabel';
import { Equation } from '../Equation/Equation';
import { simplifyArrowOptions, getArrowLength } from '../geometries/arrow';
import type { OBJ_LineArrows, OBJ_LineArrow } from '../geometries/arrow';
import type { OBJ_Pulse } from '../Element';
import type { EQN_Equation } from '../Equation/Equation';
import type { TypeWhen } from '../TimeKeeper';
import type {
  TypeLabelOrientation, TypeLabelLocation, TypeLabelSubLocation,
} from './EquationLabel';
import * as animation from '../Animation/Animation';
import type { OBJ_CustomAnimationStep, OBJ_TriggerAnimationStep } from '../Animation/Animation';
import type { TypeColor } from '../../tools/types';
import type { OBJ_Collection } from '../FigurePrimitives/FigurePrimitives';
import type FigureCollections from './FigureCollections';

// export type TypeAngleLabelOrientation = 'horizontal' | 'tangent';

/**
 * Angle move options object.
 *
 * The angle corner has two arms. The `startArm` is the first arm of the angle
 * (the one defined by <a href="adv_angle#startangle">startAngle</a>),
 * while the `endArm` is the second arm of the corner defined by
 * <a href="adv_angle#angle">angle</a>.
 *
 * Both arms can be set to either rotate the angle (`'rotation'`) or change the
 * size of the angle (`'angle'`). Invisible touch pads are overlaid on the arms
 * with some `width`. When these pads are touched, the corresponding arm will
 * move. The pads extend past the arm ends by `width` as well.
 *
 * If `movePadRadius` is greater than 0, then a pad with that radius will be
 * placed at the corner vertex. When this pad is touched, the angle will
 * translate.
 *
 * @property {'rotation' | 'angle' | null} [startArm]
 * @property {'rotation' | 'angle' | null} [endArm]
 * @property {boolean} [movable] `true` to make movable, `false` to not (`true`)
 * @property {number} [movePadRadius] radius of move pad (`0`)
 * @property {number} [width] width of pads over lines (`0.5`)
 */
export type OBJ_MovableAngle = {
  movable: boolean,
  movePadRadius: number,
  width: number,
  startArm: 'angle' | 'rotation' | null,
  endArm: 'angle' | 'rotation' | null,
}

/**
 * Collections angle label options object.
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
 * @property {TypeLabelLocation} [location] (`'outside'`)
 * @property {TypeLabelSubLocation} [subLocation]
 * @property {TypeLabelOrientation} [orientation] (`'horizontal'`)
 * @property {number} [autoHide] hide label if angle is less than value (`null`)
 * @property {number} [autoHideMax] hide label if angle is greater than value (`null`)
 * @property {boolean} [update] (`false`)
 * @property {number} [scale] size of the label
 * @property {TypeColor} [color]
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
  update?: boolean,
  scale?: number,                 // Text scale
  color?: TypeColor,          // Text color can be different to curve
};

/**
 * Angle Curve options object.
 *
 * The curve annotation of an Collections Angle shape.
 *
 * @property {number} [width] Curve line width (`0.01`)
 * @property {boolean} [fill] Use a fill instead of a line (`false`)
 * @property {number} [sides] Number of sides in full circle curve (`100`)
 * @property {number} [radius] Curve radius (`0.5`)
 * @property {number} [num] Number of curves (`1`)
 * @property {number} [step] Step radius of curves if curve num > 1 (`0`)
 * @property {?number} [autoHide] if angle is less than this, hide curve
 * (`null`)
 * @property {?number} [autoHideMax] if angle is less than this, hide curve
 * (`null`)
 * @property {boolean} [autoRightAngle] Right angle curve displayed when angle
 * = π/2 (`false`)
 * @property {number} [rightAngleRange] Range around π/2 for right angle curve
 * display (`0.01745329...` or 1 degree)
 */
export type OBJ_AngleCurve = {
  width?: number,           // Curve line width
  fill?: boolean,
  sides?: number,           // Number of sides in 360º curve
  radius?: number,          // Curve radius
  num?: number,             // Number of curves
  step?: number,            // Step radius of curves if curve num > 1
  autoHide?: ?number,       // if angle is less than this, hide curve
  autoHideMax?: ?number,    // if angle is less than this, hide curve
  autoRightAngle?: boolean, // Right angle curve displayed when angle = π/2
  rightAngleRange?: number, // Range around π/2 for right angle curve display
};

/**
 * Additional arrow properties specific to collections angle shapes.
 *
 * By default, the arrows are placed at the same radius as the curve, but
 * the radius can be changed with `radius`.
 *
 * By default, the arrows will hide when the angle is small enough where
 * the arrows will touch. To disable this, use `autoHide`.
 *
 * As the curve is a polygon with a finite amount of sides, its actual length
 * can look like it changes when the angle changes and a smaller number of
 * sides are used. This can result in a gap sometimes appearing between the
 * curve and the arrow head. To eliminate this gap, allow the curve to overlap
 * with the arrow head a little with `curveOverlap`. Beware however, if using
 * transparency, a large overlap will be obvious as the semi opaque color will
 * be darker in the overlap area. Also, if pulsing curve thickness, then for
 * small arrow heads, large width pulse scales and large overlap, the curve
 * may break through the pointy edge of the arrow head. Therefore selecting
 * `curveOverlap` can be a delicate balance that depends on application.
 *
 * @property {number} [curveOverlap] the percent of the arrow that the curve
 * overlaps with (`0.3`)
 * @property {boolean} [autoHide] `true` will hide the arrows when the angle is
 * small enough that the arrows start to touch (`true`)
 * @property {number} [radius] location of the arrows, by default they will be
 * at the radius of the curve.
 */
export type OBJ_AngleArrows = {
  curveOverlap?: number,
  autoHide?: boolean,
  radius?: number,
};

/**
 * Arrow definition for advaned angles.
 *
 * `string | (`{@link OBJ_LineArrows} ` & ` {@link OBJ_AngleArrows}`)`
 *
 * Use `single` string to specify head type of two arrows with default
 * dimensions. Otherwise use options object to select and/or customize one or
 * both arrows.
 */
export type TypeAngleArrows = string | OBJ_LineArrows & OBJ_AngleArrows;

/**
 * Collections angle corner definition.
 *
 * @property {number} [length] length of corner's arms - by default it will be
 * twice the length of the curve.
 * @property {number} [width] line width of the corner - by default it will be
 * the same as the curve
 * @property {TypeColor} [color]
 * @property {'fill' | 'auto' | 'none'} [style] style of the corner
 */
export type OBJ_AngleCorner = {
  length?: number,
  width?: number,
  color?: TypeColor,
  style?: 'fill' | 'auto' | 'none',
};

/**
 * Options object for setting properties of `pulseAngle`.
 *
 * The `curve`, `corner`, `label` and `arrow` can all be
 * pulsed with a simple scale number, or customization using
 * the {@type OBJ_Pulse} object.
 *
 * The `thick` property can be used to change the default scale pulse.
 * When a `1` is used, the angle will pulse from the vertex of the corner
 * in scale. When `thick` is greater than 1, then the `curve` will pulse in
 * thickness. Use a much smaller scale for curve when doing this.
 *
 * NB: When pulsing the thickness of a curve, the end corners of the curve
 * may break through when the arrow heads are small or there is a large curve
 * overlap between curve and arrow head. Use {@link OBJ_AngleArrows} to
 * adjust `curveOverlap` and arrow head size, reduce the thickness scale, or
 * increase the arrow scale to compensate.
 *
 * @property {number | OBJ_Pulse} [curve] (`1.5`)
 * @property {number | OBJ_Pulse} [corner] (`1.5`)
 * @property {number | OBJ_Pulse} [label] (`1.5`)
 * @property {number | OBJ_Pulse} [arrow] (`1.5`)
 * @property {number} [thick] (`1`)
 * @property {number} [duration] in seconds
 * @property {number} [frequency] in Hz
 * @property {TypeWhen} [when] when to start the pulse (`'nextFrame'`)
 * @property {function(): void} [done] execute when pulsing is finished
 */
export type OBJ_PulseAngle = {
  curve?: number | OBJ_Pulse,
  corner?: number | OBJ_Pulse,
  label?: number | OBJ_Pulse,
  arrow?: number | OBJ_Pulse,
  thick?: number,
  duration?: number,
  frequency?: number,
  when?: TypeWhen,
  done?: ?() => void,
};


/**
 * {@link CollectionsAngle} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * The Collections Angle is a convient and powerful angle
 * {@link FigureElementCollection} that can draw one or several arcs of an
 * angle annotation, a label, arrows, and the corner of an angle. It also
 * includes some methods to make it convient to use dynamically.
 *
 * There are two ways to define an angle. With a `position`, `startAngle` and
 * `angle`, or with three points. The angle can then be annotated with a curve
 * and a label on either side of the corner using the `direction` property.
 *
 * The first way to define an angle is with `position`, `startAngle` and
 * `angle`. `position` is the location of the vertex of the corner.
 * Two lines join to make a corner, from which an angle annotation can be
 * superimposed. The first line is defined with `startAngle` and the second
 * line defined by `angle` relative to the first line. `angle` can either be
 * positive or negative to define the second line.
 *
 * The second way to define an angle is with three points `p1`, `p2` and `p3`.
 * `p2` is the vertex position of the corner. Line21 is first line of the
 * corner and Line23 is the second.
 *
 * An angle can be annotated with a `curve` (or many multiple curves) and a
 * `label`. `direction` defines which side of the corner the annotations will
 * be drawn. `direction` can either be positive or negative (`1` or `-1`).
 *
 * A positive direction will place the annotations:
 * - on the angle formed between `startAngle` and `angle`
 * - *OR* the angle formed between Line21 and Line23 in the positive rotation
 * direction
 *
 * A negative direction will place the annotations on the other side of the
 * corner.
 *
 * A curve with multiple lines and/or arrows can be defined with `curve`.
 *
 * A label that can be the real angle in degrees or radians, text or an
 * equation can be defined with `label`.
 *
 * The annotations will be placed at some radius from the corner vertex.
 * `offset` can be used to draw the line some offset away from the line
 * definition where a positive offset is on the side of the line that the line
 * rotates toward when rotating in the positive direction.
 *
 * Pulsing this collection normally would pulse the scale of everything.
 * If it often desirable to pulse only parts of the angle in special ways.
 * Therefore this collection provides a method `pulseAngle` to allow this.
 * This options object can define the default values for pulseAngle if desired.
 *
 * @extends OBJ_Collection
 *
 * @property {Point} [position] position of the angle vertex
 * @property {number} [startAngle] rotation where the angle should start
 * @property {number} [angle] size of the angle
 * @property {Point} [p1] alternate way to define startAngle with `p2` and `p3`
 * @property {Point} [p2] alternate way to define position of the angle vertex
 * with `p2` and `p3`
 * @property {Point} [p3] alternate way to define size of angle with `p2` and
 * `p3`
 * @property {1 | -1} [direction] side of the corner the angle annotations
 * reside
 * @property {OBJ_AngleCurve} [curve] options for a curve annotation
 * @property {TypeAngleArrows} [arrow] options for arrow annotations
 * @property {OBJ_AngleCorner} [corner] options for drawing a corner
 * @property {TypeAngleLabelOptions} [label] options for label annotations
 * @property {OBJ_PulseAngle} [pulseAngle] default pulseAngle options
 */
export type COL_Angle = {
  position?: Point,         // Position of angle vertex
  startAngle?: number,      // Start rotation of angle
  angle?: number,           // Angle measure
  p1?: Point,               // Can define angle with p1, p2, p3
  p2?: Point,               // p2 is angle vertex
  p3?: Point,               // Curve goes from P21 to P23 anticlockwise
  direction?: 1 | -1;       // Direction (from P21 to P23, or for angle)
  curve?: OBJ_AngleCurve,
  // autoRightAngle?: boolean, // Right angle curve displayed when angle = π/2
  // rightAngleRange?: number, // Range around π/2 for right angle curve display
  arrow: TypeAngleArrows;
  // Label
  label?: TypeAngleLabelOptions,
  corner?: OBJ_AngleCorner,
  pulseAngle?: OBJ_PulseAngle,
  //
  //
  // Sides - deprecated
  // side1?: {                 // Define side line at start of angle
  //   length?: number,        // Side line length
  //   width?: number,         // Side line width
  //   color?: TypeColor,  // Side line color
  // },
  // side2?: {                 // Define side line at end of angle
  //   length?: number,
  //   width?: number,
  //   color?: TypeColor,
  // },
  // sides?: {                 // Define both side lines - overrides side 1 & 2
  //   length?: number,
  //   width?: number,
  //   color?: TypeColor,
  // },
  // mods?: {};
} & OBJ_Collection;

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
    equation: FigureCollections,
    labelText: string | Equation | Array<string>,
    color: TypeColor,
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
 * These properties are the same as the ones with the same names in
 * {@link COL_Angle}.
 * @property {TypeParsablePoint} [position]
 * @property {number} [startAngle]
 * @property {number} [angle]
 * @property {TypeParsablePoint} [p1]
 * @property {TypeParsablePoint} [p2]
 * @property {TypeParsablePoint} [p3]
 */
export type OBJ_AngleSet = {
  position?: TypeParsablePoint,
  startAngle?: number,
  angle?: number,
  p1?: TypeParsablePoint,
  p2?: TypeParsablePoint,
  p3?: TypeParsablePoint,
}

/**
 * Angle animation step.
 *
 * @property {number} [start] start angle (`current angle`)
 * @property {number} [target] angle to animate to (`current angle`)
 * @extends OBJ_CustomAnimationStep
 */
export type OBJ_AngleAnimationStep = {
  start?: number,
  target?: number,
} & OBJ_CustomAnimationStep;

/**
 * Pulse angle animation step - see {@link OBJ_PulseAngle} for desicription of
 * properties.
 * @property {number | OBJ_Pulse} [curve] (`1.5`)
 * @property {number | OBJ_Pulse} [corner] (`1.5`)
 * @property {number | OBJ_Pulse} [label] (`1.5`)
 * @property {number | OBJ_Pulse} [arrow] (`1.5`)
 * @property {number} [thick] (`1`)
 * @property {number} [duration] in seconds
 * @property {number} [frequency] in Hz
 * @extends OBJ_TriggerAnimationStep
 */
export type OBJ_PulseAngleAnimationStep = {
  curve?: number | OBJ_Pulse,
  corner?: number | OBJ_Pulse,
  label?: number | OBJ_Pulse,
  arrow?: number | OBJ_Pulse,
  thick?: number,
  duration?: number,
  frequency?: number,
} & OBJ_TriggerAnimationStep;

// export type CollectionsAngleAnimationManager =
/*
................###....##....##..######...##.......########
...............##.##...###...##.##....##..##.......##......
..............##...##..####..##.##........##.......##......
.............##.....##.##.##.##.##...####.##.......######..
.............#########.##..####.##....##..##.......##......
.............##.....##.##...###.##....##..##.......##......
.............##.....##.##....##..######...########.########
*/

/**
 * {@link FigureElementCollection} representing an angle.
 *
 * ![](./apiassets/advangle_examples.png)
 *
 * <p class="inline_gif"><img src="./apiassets/advangle_grow.gif" class="inline_gif_image"></p>
 *
 * <p class="inline_gif"><img src="./apiassets/advangle_move.gif" class="inline_gif_image"></p>
 *
 * This object defines a convient and powerful angle
 * {@link FigureElementCollection} that includes one or more curve annotations,
 * arrows, a label annotation that can self align and
 * some methods to make it convient to use dynamically.
 *
 * See {@link COL_Angle} for the options that can be used when creating the
 * angle.
 *
 * The object contains two additional animation steps `angle` and `pulseAngle`
 * that animate a change in angle, and animate a pulsing of the angle
 * respectively. The animation steps are available in
 * the animation manager ({@link FigureElement}.animations),
 * and in the animation builder
 * (<a href="#animationmanagernew">animations.new</a>
 * and <a href="#animationmanagerbuilder">animations.builder</a>).
 *
 * Some of the useful methods included in an collections angle are:
 * - <a href="#collectionsanglepulseangle">pulseAngle</a> - customize pulsing the
 *   angle without
 * - <a href="#collectionsanglesetmovable">setMovable</a> - overrides
 *    <a href="#figureelementsetmovable">FigureElement.setMovable</a> and
 *    allowing for more complex move options.
 *
 *
 * @see See {@link OBJ_AngleAnimationStep} for angle animation step options.
 *
 * See {@link OBJ_PulseAngleAnimationStep} for pulse angle animation step
 * options.
 *
 * To test examples below, append them to the
 * <a href="#drawing-boilerplate">boilerplate</a>.
 *
 * @example
 * // Angle with size label
 * figure.add({
 *   name: 'a',
 *   method: 'collections.angle',
 *   options: {
 *     angle: Math.PI / 4,
 *     label: null,
 *     curve: {
 *       radius: 0.5,
 *       width: 0.01,
 *     },
 *     corner: {
 *       width: 0.01,
 *       length: 1,
 *     },
 *   }
 * });
 *
 * @example
 * // Right angle, created from figure.collections
 * const a = figure.collections.angle({
 *   angle: Math.PI / 2,
 *   curve: {
 *     autoRightAngle: true,
 *     width: 0.01,
 *   },
 *   corner: {
 *     width: 0.01,
 *     length: 1,
 *   },
 * });
 * figure.add('a', a);
 *
 * @example
 * // Multi colored angle with arrows and an equation label
 * figure.add({
 *   name: 'a',
 *   method: 'collections.angle',
 *   options: {
 *     angle: Math.PI / 4 * 3,
 *     label: {
 *       text: {
 *         elements: {
 *           theta: { text: '\u03b8', color: [1, 0, 1, 1] },
 *         },
 *         forms: {
 *           0: { frac: ['theta', 'vinculum', '2']},
 *         },
 *       },
 *       offset: 0.05,
 *       location: 'inside',
 *       color: [0, 0, 1, 1],
 *     },
 *     curve: {
 *       radius: 0.5,
 *       width: 0.01,
 *     },
 *     arrow: 'barb',
 *     corner: {
 *       width: 0.01,
 *       length: 1,
 *       color: [0, 0.5, 0, 1],
 *     },
 *   }
 * });
 *
 * @example
 * // Multiple curve angle, without corner
 * const a = figure.collections.angle({
 *   angle: Math.PI / 4,
 *   curve: {
 *     num: 3,
 *     step: -0.03,
 *     radius: 0.5,
 *     width: 0.01,
 *   },
 *   label: {
 *     text: 'a',
 *     offset: 0.05,
 *   },
 * });
 * figure.add('a', a);
 *
 * @example
 * // Change angle animation
 * figure.add({
 *   name: 'a',
 *   method: 'collections.angle',
 *   options: {
 *     angle: Math.PI / 4,
 *     label: null,
 *     curve: {
 *       radius: 0.5,
 *       width: 0.01,
 *     },
 *     corner: {
 *       width: 0.01,
 *       length: 1,
 *     },
 *   }
 * });
 * figure.elements._a.animations.new()
 *   .angle({ start: Math.PI / 4, target: Math.PI / 4 * 3, duration: 3 })
 *   .start();
 *
 * @example
 * // Movable angle
 * figure.add({
 *   name: 'a',
 *   method: 'collections.angle',
 *   options: {
 *     angle: Math.PI / 4 * 3,
 *     label: {
 *       text: null,
 *       location: 'outside',
 *       orientation: 'horizontal',
 *       offset: 0.1,
 *       update: true,
 *       sides: 200,
 *     },
 *     curve: {
 *       radius: 0.3,
 *       fill: true,
 *     },
 *     corner: {
 *       width: 0.02,
 *       length: 1,
 *       color: [0.4, 0.4, 0.4, 1],
 *     },
 *   }
 * });
 * figure.elements._a.setMovable({
 *   startArm: 'rotation',
 *   endArm: 'angle',
 *   movePadRadius: 0.3,
 * });
 */
// $FlowFixMe
class CollectionsAngle extends FigureElementCollection {
  // Figure elements
  _curve: ?FigureElementPrimitive;
  _curveRight: ?FigureElementPrimitive;
  _arrow1: ?FigureElementPrimitive;
  _arrow2: ?FigureElementPrimitive;
  _side1: ?FigureElementPrimitive;
  _side2: ?FigureElementPrimitive;
  _corner: ?FigureElementPrimitive;
  _label: ?Equation;

  _anglePad: ?FigureElementPrimitive;
  _rotPad: ?FigureElementPrimitive;
  _movePad: ?FigureElementPrimitive;

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
    color: TypeColor,
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
    autoHide: ?number,
    autoHideMax: ?number,
    autoRightAngle: boolean,
    rightAngleRange: number,
  };

  startAngle: number;
  angle: number;
  direction: -1 | 1;
  lastLabelRotationOffset: number;
  // autoRightAngle: boolean;
  // rightAngleRange: number;

  // angle properties - pulic read/write

  // angle properties - private internal use only
  collections: FigureCollections;
  // equation: Object;
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

  animations: {
    pulseAngle: (OBJ_PulseAngle) => animation.TriggerAnimationStep,
    angle: (OBJ_AngleAnimationStep) => animation.CustomAnimationStep,
  } & animation.AnimationManager;

  calculateAngleRotationPosition(options: {
    p1?: TypeParsablePoint,
    p2?: TypeParsablePoint,
    p3?: TypeParsablePoint,
    position?: TypeParsablePoint,
    startAngle?: number,
    angle?: number,
  }) {
    // console.log(this.lastLabelRotationOffset)
    const defaultOptions = {
      angle: 1,
      startAngle: this.startAngle,
    };
    const o = joinObjects({}, defaultOptions, options);
    let { angle, startAngle, position } = o;
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
    // this.startAngle = startAngle;
    this.nextStartAngle = startAngle;
    if (position != null) {
      this.nextPosition = position;
    }
    this.angle = angle;
    // this.startAngle = startAngle;
  }

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: COL_Angle = {},
  ) {
    const defaultOptions = {
      position: new Point(0, 0),
      color: collections.primitives.defaultColor,
      direction: 1,
      curve: null,
      corner: null,
      sides: null,
      sideStart: null,
      sideStop: null,
      pulseAngle: {
        curve: 1.5,
        label: 1.5,
        arrow: 1.5,
        side: 1.5,
        corner: 1.5,
        thick: 1,
      },
      mods: {},
      transform: new Transform('Angle').scale(1, 1).rotate(0).translate(0, 0),
      limits: collections.primitives.limits,
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);

    super(optionsToUse);
    this.setColor(optionsToUse.color);
    this.collections = collections;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.autoUpdateSubscriptionId = 0;
    this.lastLabelRotationOffset = 0;
    if (optionsToUse.direction === 'positive') {
      this.direction = 1;
    } else if (optionsToUse.direction === 'negative') {
      this.direction = -1;
    } else {
      this.direction = optionsToUse.direction;
    }

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
      // $FlowFixMe
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
    if (optionsToUse.label || optionsToUse.label === null) {
      if (optionsToUse.label === null) {
        optionsToUse.label = { text: null };
      }
      if (typeof optionsToUse.label === 'string') {
        optionsToUse.label = { text: optionsToUse.label };
      }
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

    this.animations.angle = (...opt) => {
      const o = joinObjects({}, {
        element: this,
      }, ...opt);
      let target;
      let start;
      let toSetup = true;
      o.callback = (percentage) => {
        if (toSetup) {
          if (o.start == null) {
            start = this.angle;
          } else {
            ({ start } = o);
          }
          if (o.target == null) {
            target = this.angle;
          } else {
            ({ target } = o);
          }
          toSetup = false;
        }
        const a = (target - start) * percentage + start;
        this.setAngle({ angle: a });
      };
      o.timeKeeper = this.timeKeeper;
      return new animation.CustomAnimationStep(o);
    };

    this.animations.customSteps.push({
      step: this.animations.angle.bind(this),
      name: 'angle',
    });

    this.animations.pulseAngle = (...opt) => {
      const o = joinObjects({}, {
        element: this,
        duration: 1,
      }, ...opt);
      o.callback = () => {
        this.pulseAngle({
          curve: o.curve,
          label: o.label,
          arrow: o.arrow,
          corner: o.corner,
          duration: o.duration,
          frequency: o.frequency,
          thick: o.thick,
        });
      };
      o.timeKeeper = this.timeKeeper;
      return new animation.TriggerAnimationStep(o);
    };

    this.animations.customSteps.push({
      step: this.animations.pulseAngle.bind(this),
      name: 'pulseAngle',
    });

    this.update();
    if (optionsToUse.mods != null && optionsToUse.mods !== {}) {
      this.setProperties(optionsToUse.mods);
    }
    // console.log(this.name, t.slice(-1)[0] - t[0], t.map((t1, index) => {
    //   if (index === 0) {
    //     return 0;
    //   }
    //   return t1 - t[index - 1];
    // }))
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

  /**
   * Turn on and off auto label location and orientation updates when angle
   * transform changes. When an angle is created with a label, auto update
   * is turned off by default.
   *
   * Manual updates can be performed with
   * <a href="collectionsangle#udpatelabel">updateLabel</a>
   */
  setAutoUpdate(update: boolean = true) {
    if (update) {
      this.autoUpdateSubscriptionId = this.subscriptions.add('setTransform', () => {
        this.updateLabel(this.getRotation());
        // this.updateMovePads();
      });
    } else {
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
      this.startAngle = this.nextStartAngle || 0;
    }
    this.nextPosition = null;
    this.nextStartAngle = null;
  }

  /**
   * Set the angle. The same direction and angle sign must be used as when
   * originally defined.
   */
  setAngle(options: OBJ_AngleSet = {}) {
    const wasHidden = !this.isShown;
    let labelWasHidden = false;
    if (this._label != null && this._label.isShown === false) {
      labelWasHidden = true;
    }
    // const oldOpacity = this.opacity;
    this.calculateAngleRotationPosition(options);
    const { corner, _corner } = this;
    if (corner != null && _corner != null) {
      const points = this.getCornerPoints(corner.length);
      _corner.custom.updatePoints({ points });
    }
    this.update();
    if (wasHidden) {
      this.hide();
    }
    if (labelWasHidden && this._label != null) {
      this._label.hide();
    }
    // console.log(this.getPath(), oldOpacity)
    // this.setOpacity(oldOpacity);
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
    color: TypeColor,
    style: 'fill' | 'auto' | 'none',
  }) {
    const {
      width, color, length, style,
    } = options;
    const corner = this.collections.primitives.polyline({
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
    color: TypeColor = this.color,
  ) {
    const line = this.collections.primitives.line({
      length: 1,
      width,
      angle: 0,
      color,
      transform: new Transform().scale(1, 1).rotate(0),
    });
    // $FlowFixMe
    this[`side${index}`] = { length, width };
    this.add(`side${index}`, line);
  }

  addLabel(options: TypeAngleLabelOptions = {}) {
    const defaultLabelOptions = {
      text: null,
      radius: 0.4,
      curvePosition: 0.5,
      offset: 0.0001,
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
      this.collections,
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
    this.label.eqn.initialForm = null;
    if (optionsToUse.isTouchable != null) {
      this.label.eqn.isTouchable = optionsToUse.isTouchable;
    }
    if (optionsToUse.touchBorder != null) {
      this.label.eqn.touchBorder = optionsToUse.touchBorder;
    }
    if (optionsToUse.onClick != null) {
      this.label.eqn.onClick = optionsToUse.onClick;
    }
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
      sides: 100,
      radius: 0.5,
      num: 1,
      fill: false,
      step: 0,
      autoHide: null,
      autoHideMax: null,
      autoRightAngle: false,
      rightAngleRange: 1 / 180 * Math.PI,
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
      const o = {
        sides: optionsToUse.sides,
        radius: optionsToUse.radius + i * optionsToUse.step,
        color: this.color,
        direction,
        transform: new Transform('AngleCurve').rotate(0),
        // dash: optionsToUse.dash,
      };
      if (optionsToUse.fill === false) {  // $FlowFixMe
        o.line = {
          width: optionsToUse.width,
          // simple: true,
          // dash: optionsToUse.dash,
        };
      }
      const curve = this.collections.primitives.polygon(o);
      this.curve = optionsToUse;
      let name = 'curve';
      if (i > 0) {
        name = `${name}${i}`;
      }
      this.add(name, curve);
    }

    // Right Angle
    if (this.curve != null && this.curve.autoRightAngle) {
      const right = this.collections.collection();
      const rightLength = optionsToUse.radius * 0.707; // / Math.sqrt(2);
      right.add('line1', this.collections.primitives.line({
        p1: [rightLength, 0],
        length: rightLength + optionsToUse.width / 2,
        width: optionsToUse.width,
        angle: Math.PI / 2 * direction,
        color: this.color,
      }));
      right.add('line2', this.collections.primitives.line({
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
    const a = this.collections.primitives.arrow(joinObjects(
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
        let curveToLine;    // $FlowFixMe
        const radius = this.arrow.start.radius || 0;
        if (
          (this.angle > 0 && this.direction === 1)
          || (this.angle < 0 && this.direction === -1)
        ) {
          curveToLine = new Line(
            polarToRect(radius, arrowLengthAngle), [radius, 0],
          ).angle();
        } else {
          curveToLine = new Line(
            polarToRect(radius, -arrowLengthAngle), [radius, 0],
          ).angle();
        }
        _arrow1.transform.updateRotation(curveToLine);
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
        let curveToLine;    // $FlowFixMe
        const radius = this.arrow.start.radius || 0;
        if (
          (this.angle > 0 && this.direction === 1)
          || (this.angle > 0 && this.direction === -1)
        ) {
          curveToLine = new Line(
            polarToRect(radius, this.angle - this.direction * arrowLengthAngle),
            polarToRect(radius, this.angle),
          ).angle();
        } else {
          curveToLine = new Line(
            polarToRect(radius, this.angle + this.direction * arrowLengthAngle),
            polarToRect(radius, this.angle),
          ).angle();
        }
        _arrow2.transform.updateRotation(curveToLine);
        rotationForArrow1 = arrow1Angle;
      }
    }

    if (labelRotationOffset != null) {
      this.lastLabelRotationOffset = labelRotationOffset;
    }

    this.setNextPositionAndRotation();

    const { _curve, curve, _curveRight } = this;
    if (_curve != null && curve != null) {
      if (
        (curve.autoHide != null && fullCurveAngle < curve.autoHide)
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
      } else if (
        curve != null
        && curve.autoRightAngle
        && fullCurveAngle >= Math.PI / 2 - curve.rightAngleRange / 2
        && fullCurveAngle <= Math.PI / 2 + curve.rightAngleRange / 2
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

    this.updateMovePads();
  }

  checkLabelForRightAngle() {
    if (this.curve != null && this.curve.autoRightAngle === false) {
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

  /**
   * Get the current angle in degrees or radians
   */
  getAngle(units: 'deg' | 'rad' = 'rad') {
    if (units === 'deg') {
      return this.angle * 180 / Math.PI;
    }
    return this.angle;
  }

  /**
   * Set the label text
   */
  setLabel(text: string) {
    const { label } = this;
    if (label != null) {
      label.setText(text);
      label.showRealAngle = false;
    }
    this.updateLabel();
  }

  /**
   * Get the label text
   */
  getLabel() {
    if (this.label != null) {
      return this.label.getText();
    }
    return '';
  }

  /**
   * Set the label to be the real angle
   */
  setLabelToRealAngle() {
    const { label } = this;
    if (label != null) {
      label.showRealAngle = true;
    }
    this.updateLabel();
  }

  /**
   * Manually update the label orientations with a custom rotation offset.
   *
   * Automatic updating can be done with
   * <a href="collectionsangle#setautoupdate">setAutoUpdate</a>
   * @param {number | null} rotationOffset
   */
  updateLabel(rotationOffset: ?number = this.getRotation()) {
    if (rotationOffset != null) {
      this.lastLabelRotationOffset = rotationOffset;
    }
    const { _label, label } = this;
    if (_label && label) {
      if (
        (label.autoHide != null && label.autoHide > Math.abs(this.angle)) // $FlowFixMe
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
            angleText = `${angleText}\u00b0`;
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
        // console.log(label.curvePosition)
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

  /**
   * Pulse the angle where each element can be pulsed in a custom way.
   *
   * The pulse scales of the curve, label, corner and arrows can all be defined
   * separately.
   */
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
    const p = this.getPosition('figure');
    const o = joinObjects(defaultOptions, options);
    let { done } = o;
    const pulse = (elementName, oName, oScale, oThick, centerOn = null) => {
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
        if (centerOn != null) {
          pulseOptions.centerOn = centerOn;
        }
        element.pulse(pulseOptions);
        done = null;
      }
    };
    if (this._curve != null) {
      pulse('curve', 'curve', {}, {});
    }
    if (this._curveRight != null) {
      pulse('curveRight', 'curve', {}, {}, this.getPosition('figure'));
    }
    if (this.corner != null && this._corner != null) {
      // const cornerLength = this.corner.length || 0;
      pulse(
        'corner', 'corner',
        { centerOn: p },
        {
          centerOn: p,
          num: 1,
        },
      );
    }
    pulse('label', 'label', { centerOn: p }, { num: 1 });
    if (this.arrow != null) {
      if (this._arrow1 != null) {
        pulse(
          'arrow1', 'arrow',
          { centerOn: p },
          { centerOn: this._arrow1.getPosition('figure'), num: 1 },
        );
      }
      if (this._arrow2 != null) {
        pulse(
          'arrow2', 'arrow',
          { centerOn: p },
          { centerOn: this._arrow2.getPosition('figure'), num: 1 },
        );
      }
    }
    this.animateNextFrame();
  }

  showAll() {
    super.showAll();
    this.update();
  }

  /**
   * Use this method to enable or disable movability of the line.
   *
   * @param {OBJ_MovableAngle | boolean} [movableOrOptions] `true` to
   * make movable, `false` to make not movable or use options to
   * set different kinds of movability.
   */
  // $FlowFixMe
  setMovable(movableOrOptions: boolean | OBJ_MovableAngle) {
    const defaultOptions = {
      movable: true,
      type: this.move.type,
      width: 0.5,
      movePadRadius: 0,
      startArm: null,
      endArm: null,
    };
    let options;
    if (movableOrOptions === false) {
      options = joinObjects({}, defaultOptions, { movable: false });
    } else if (movableOrOptions === true) {
      options = defaultOptions;
    } else {
      options = joinObjects({}, defaultOptions, movableOrOptions);
    }
    const {
      movable, startArm, endArm, movePadRadius, width,
    } = options;
    if (movable) {
      if (startArm != null && endArm != null) {
        if (startArm === 'rotation') {
          this.addRotPad(1 - movePadRadius, width, 'rotation');
        }
        if (endArm === 'rotation') {
          this.addAnglePad(1 - movePadRadius, width, 'rotation');
        }
        if (startArm === 'angle') {
          this.addRotPad(1 - movePadRadius, width, 'angle');
        }
        if (endArm === 'angle') {
          this.addAnglePad(1 - movePadRadius, width, 'angle');
        }
      } else if (startArm != null) {
        this.addRotPad(1 - movePadRadius, width, startArm);
      } else if (endArm != null) {
        this.addAnglePad(1 - movePadRadius, width, endArm);
      }
      if (movePadRadius > 0) {
        this.addMovePad(movePadRadius);
      }
    } else {
      this.isMovable = false;
      this.isTouchable = false;
      if (this._anglePad != null) {
        this._anglePad.setMovable(false);
      }
      if (this._rotPad != null) {
        this._rotPad.setMovable(false);
      }
    }
    this.updateMovePads();
  }

  getLength() {
    if (this.corner != null && this.corner.length != null) {
      return this.corner.length;
    }
    if (this.curve != null && this.curve.radius != null) {
      return this.curve.radius;
    }
    if (this.label != null && this.label.radius != null) {
      return this.label.radius;
    }
    return 1;
  }

  addAnglePad(percentLength: number = 1, width: number = 0.5, type: 'rotation' | 'angle') {
    if (this._anglePad == null) {
      const length = this.getLength();
      const anglePad = this.collections.primitives.rectangle({
        offset: [length * (1 - percentLength), 0],
        // position: [length * (1 - percentLength), 0],
        xAlign: 'left',
        yAlign: 'middle',
        width: length * percentLength + width,
        height: width,
        color: [0, 0, 1, 0],
        border: [[]],
        touchBorder: 'buffer',
      });
      this.add('anglePad', anglePad);
      anglePad.setMovable();
      anglePad.move.type = 'rotation';
      anglePad.drawingObject.border = [[]];
      if (type === 'rotation') {
        // anglePad.move.element = this;
        anglePad.subscriptions.add('beforeSetTransform', (transformToSet) => {
          const nextR = transformToSet[0].r();
          const currentR = anglePad.getRotation();
          const deltaR = nextR - currentR;
          this.transform.updateRotation(this.getRotation() + deltaR);
          anglePad.cancelSetTransform = true;
        });
      } else {
        anglePad.subscriptions.add('setTransform', () => {
          let angle = anglePad.getRotation();
          if (this.angle > 0) {
            angle = clipAngle(angle, '0to360');
          } else {
            angle = clipAngle(angle, '-360to0');
          }
          this.setAngle({ angle });
        });
      }
    }
  }

  addRotPad(percentLength: number = 1, width: number = 0.5, type: 'rotation' | 'angle') {
    if (this._rotPad == null) {
      const length = this.getLength();
      const rotPad = this.collections.primitives.rectangle({
        xAlign: 'left',
        yAlign: 'middle',
        width: length * percentLength + width,
        height: width,
        color: [1, 0, 1, 0],
        offset: [length * (1 - percentLength), 0],
        border: [[]],
        touchBorder: 'buffer',
      });
      this.add('rotPad', rotPad);
      rotPad.setMovable();
      rotPad.move.type = 'rotation';
      rotPad.drawingObject.border = [[]];
      // rotPad.touchBorder = 'drawBuffer';
      if (type === 'angle') {
        rotPad.move.element = this;
        this.subscriptions.add('beforeSetTransform', (transformToSet) => {
          // $FlowFixMe
          const nextR = transformToSet[0].r();
          const currentR = this.getRotation();
          const deltaR = nextR - currentR;
          let angle = this.angle - deltaR;
          if (this.angle > 0) {
            angle = clipAngle(angle, '0to360');
          } else {
            angle = clipAngle(angle, '-360to0');
          }
          this.setAngle({ angle });
        });
      } else {
        rotPad.move.element = this;
      }
    }
  }

  addMovePad(percentLength: number = 1) {
    if (this._movePad == null) {
      const length = this.getLength();
      const movePad = this.collections.primitives.polygon({
        radius: length * percentLength,
        sides: 8,
        fill: true,
        color: [1, 0, 0, 0],
        border: [[]],
        touchBorder: 'buffer',
      });
      this.add('movePad', movePad);
      movePad.setMovable();
      movePad.move.type = 'translation';
      movePad.drawingObject.border = [[]];
      movePad.move.element = this;
    }
  }

  updateMovePads() {
    if (this._anglePad != null) {
      this._anglePad.transform.updateRotation(this.angle);
    }
  }
}

export default CollectionsAngle;

export type TypeLabelledAngle = {
  _curve: FigureElementPrimitive;
  _label: {
    _base: FigureElementPrimitive;
  } & Equation;
} & CollectionsAngle;

