// @flow

import {
  Transform, Point, Rect,
  spaceToSpaceTransform, getBoundingRect,
  clipAngle, getPoint, getTransform, getScale,
  TransformBounds, RectBounds, RangeBounds, getBounds,
  getBoundingBorder, isBuffer, getBorder,
} from '../tools/g2';
import { round } from '../tools/math';
// import { areColorsSame } from '../tools/color';
import { getState } from './Recorder/state';
import type {
  TypeParsablePoint, TypeParsableTransform,
  TypeTransformValue, TypeTransformBoundsDefinition,
  TypeBorder, TypeParsableBuffer, Bounds,
} from '../tools/g2';
import { Recorder } from './Recorder/Recorder';
import * as m2 from '../tools/m2';
// import type { pathOptionsType, TypeRotationDirection } from '../tools/g2';
import * as math from '../tools/math';
import HTMLObject from './DrawingObjects/HTMLObject/HTMLObject';
import DrawingObject from './DrawingObjects/DrawingObject';
import VertexGeneric from './DrawingObjects/VertexObject/VertexGeneric';
import GLObject from './DrawingObjects/GLObject/GLObject';
import { TextObjectBase } from './DrawingObjects/TextObject/TextObject';
// import type { OBJ_Font } from './DrawingObjects/TextObject/TextObject';
import {
  duplicateFromTo, joinObjects, joinObjectsWithOptions, NotificationManager,
  generateUniqueId, PerformanceTimer,
} from '../tools/tools';
import { colorArrayToRGBA, areColorsWithinDelta } from '../tools/color';
import TimeKeeper from './TimeKeeper';
import type { TypeWhen } from './TimeKeeper';
// import DrawContext2D from './DrawContext2D';

import type Figure, { OBJ_SpaceTransforms, OBJ_FigureForElement } from './Figure';
// eslint-disable-next-line import/no-cycle
import * as animations from './Animation/Animation';
import WebGLInstance from './webgl/webgl';
// import type Figure from './Figure';
import { FunctionMap } from '../tools/FunctionMap';
import type {
  OBJ_Font, TypeColor,
} from '../tools/types';
// import type FigurePrimitives from './FigurePrimitives/FigurePrimitives';
import type FigureCollections from './FigureCollections/FigureCollections';

const FIGURE1DEBUG = false;

// eslint-disable-next-line import/no-cycle
// import {
//   AnimationPhase, ColorAnimationPhase, CustomAnimationPhase,
// } from './AnimationPhase';

// function checkCallback(callback: ?(boolean) => void): (boolean) => void {
//   let callbackToUse = () => {};
//   if (typeof callback === 'function') {
//     callbackToUse = callback;
//   }
//   return callbackToUse; + width
// }

export type TypeSpace = 'draw' | 'local' | 'figure' | 'gl' | 'pixel';

/**
 * Add element Object
 */
export type OBJ_AddElement = {
  path?: string,
  name?: string,
  make?: string,
  options?: {},   // eslint-disable-next-line no-use-before-define
  elements?: Array<OBJ_AddElement | FigureElement>,
  mods?: {},
  scenario?: string,
};

/**
 * Transform, color and visbility scenario definition
 *
 * `translation` will overwirte `position`, and `translation, `position`,
 * rotation` and `scale` overwrite the first equivalent transforms in
 * `transform`
 *
 * @property {TypeParsablePoint} position
 * @property {TypeParsablePoint} translation
 * @property {TypeParsablePoint | number} scale
 * @property {number} rotation
 * @property {TypeParsableTransform} transform
 * @property {Array<number>} color
 * @property {boolean} isShown
 */
export type OBJ_Scenario = {
  position?: TypeParsablePoint,
  translation?: TypeParsablePoint,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: TypeColor,
  isShown?: boolean,
};

/**
 * Path to a {@link FigureElement} within a {@link FigureElementCollection}.
 *
 * `string | {[name: string]: TypeElementPath } | `{@link FigureElement}` | Array<TypeElementPath>}`
 *
 * Consider a collection with the below heirachy. The collection has two
 * children `diagram` and `description` of which `diagram` is another
 * collection:
 * - diagram
 *   - lineA
 *   - lineB
 *   - lines
 *     - lineC
 *     - lineD
 * - description
 *
 * The ways to define lineC, lineD and description are:
 *
 * - `['description', 'diagram.lines.lineC', 'diagram.lines.lineD']`
 * - `['description', { diagram: ['lines.lineC', 'lines.lineD'] }]`
 * - `['description', { 'diagram.lines': ['lineC', 'lineD'] }]`
 */
/* eslint-disable no-use-before-define */
export type TypeElementPath = string
                              | { [name: string]: TypeElementPath }
                              | FigureElement
                              | Array<TypeElementPath>;
/* eslint-enable no-use-before-define */

const transformBy = (inputTransforms: Array<Transform>, copyTransforms: Array<Transform>) => {
  const newTransforms = [];
  if (copyTransforms.length === 0) {
    return inputTransforms.map(t => t._dup());
  }
  inputTransforms.forEach((it) => {
    copyTransforms.forEach((t) => {
      newTransforms.push(getTransform(it).transform(getTransform(t)));
    });
  });
  if (newTransforms.length > 0) {
    // TODO Test without duping this
    // return newTransforms.map(t => t._dup());
    return newTransforms;
  }
  return inputTransforms.map(t => t._dup());
};

/* eslint-disable no-use-before-define */

/**
 * Pulse options object
 *
 * ![](./apiassets/pulse.gif)
 *
 * Pulsing can be useful to highlight a figure element to a user, without
 * changing its underlying properties.
 *
 * When an element is pulsed, it will be scaled, translated or rotated from
 * a start value (1 for scale, 0 for rotation and translation),
 * to a maximum value (`scale`, `translate` or `rotate`),
 * to a `min` value, and then back to the `start` value. An element can
 * be pulsed through this cycle `frequency` times per second, over some
 * `duration`.
 *
 * The pulse does not change the {@link FigureElement}.transform property, and
 * only changes the draw transform.
 *
 * By default, a scale or rotation pulse will scale or rotate around the the
 * center of the rectangle encompassing the border of the element. `centerOn`
 * can be used to define a different {@link FigureElement} or point to center
 * on. If centering on a {@link FigureElement}, `xAlign` and `yAlign` can be
 * used to center on a point aligned within it. For instance, `xAlign: 'left'`
 * will center on a point on the left edte of the {@link FigureElement}.
 *
 * The pulse can also draw multiple copies of the element with pulse transforms
 * distributed between the `min` and maximum pulse values. This is particularly
 * useful for shapes with outlines that have a regular spacing from a center
 * point (such as regular polygons) as it will look like the thickness of the
 * outlines are becomming thicker.
 *
 * @property {number} [duration] pulse duration in seconds (`1`)
 * @property {number} [frequency] pulse frequency in Hz - a frequency of zero
 * will set the frequency so just one cycle will be performed in the duration
 * (`0`)
 * @property {number} [scale] maximum scale value to pulse to (`1.5`)
 * @property {number} [rotation] maximum rotation value to pulse to
 * @property {number} [translation] maximum translation displacment value to
 * pulse to (`1.5`)
 * @property {number} [angle] translation angle (`0`)
 * @property {number} [min] minimum value to pulse to
 * @property {null | FigureElement | TypeParsablePoint | string | 'this'} [centerOn] center
 * of scale or rotation pulse. `null` is point [0, 0], `string` or
 * `FigureElement` are elements to centerOn, and `'this'` is the calling
 * element (`'this'`)
 * will be the default `centerOn`.
 * @property {'left' | 'center' | 'right' | 'location' | number} [xAlign]
 * if `centerOn` is a {@link FigureElement} then this property can be used to
 * horizontally align the pulse center with the element. `'location'` is the
 * (0, 0) draw space coordinate of the element. `number` defines the percent
 * width from the left of the element (`'center'`)
 * @property {'bottom' | 'middle' | 'top' | 'location' | number} [yAlign]
 * if `centerOn` is a {@link FigureElement} then this property can be used to
 * vertically align the pulse center with the element. `'location'` is the
 * (0, 0) draw space coordinate of the element. `number` defines the percent
 * width from the left of the element (`'center'`)
 * @property {'figure' | 'gl' | 'local' | 'draw' | 'pixel'} [space]
 * if `centerOn` is a point, use this to define the space the point is in
 * (`'figure'`)
 * @property {number} [num] the number of draw copies of the pulse to make (`1`)
 * @property {null | string | function(): void} [done] callback when pulse is
 * finished. If `string` then the element's {@link FunctionMap} `fnMap` will be
 * used (`null`)
 * @property {TypeWhen} [when] when to start the pulse (`'syncNow'`)
 * @property {'sinusoid' | 'triangle'} [progression] function that defines
 * how the scale should progress over time (`sinusoid`)
 *
 * @example
 * // For all examples below, use this to add an element to the figure
 * const p = figure.add({
 *   make: 'polygon',
 *   radius: 0.3,
 *   line: { width: 0.05, },
 * });
 *
 *
 * @example
 * // Scale pulse
 * p.pulse({
 *   duration: 1,
 *   scale: 1.3
 * });
 *
 * @example
 * // Rotation pulse
 * p.pulse({
 *   duration: 1,
 *   rotation: 0.15,
 *   frequency: 4,
 * });
 *
 * @example
 * // Translation pulse
 * p.pulse({
 *   duration: 1,
 *   translation: 0.02,
 *   min: -0.02,
 *   frequency: 4,
 * });
 *
 * @example
 * // Thick pulse
 * p.pulse({
 *   duration: 1,
 *   scale: 1.1,
 *   min: 0.9,
 *   num: 7,
 * });
 */
export type OBJ_Pulse = {
  duration?: number,
  frequency?: number,
  scale?: number,
  rotation?: number,
  translation?: number,
  angle?: number,
  min?: number,
  centerOn?: null | FigureElement | TypeParsablePoint | string | 'this',
  x?: 'left' | 'center' | 'right' | 'origin' | number,
  y?: 'bottom' | 'middle' | 'top' | 'origin' | number,
  space?: 'figure' | 'gl' | 'local' | 'draw',
  done?: ?(mixed) => void,
  num?: number,
  when?: TypeWhen,
  done: string | () => void | null,
  progression?: string | (number) => number,
};

/**
 * Figure element move freely parameters
 *
 * If a figure element is released from moving with some velocity
 * then these parameters will define how it continues to move freely
 *
 * @property {TypeTransformValue} zeroVelocityThreshold used to overcome
 * limitations of floating point numbers not reaching 0
 * @property {TypeTransformValue} deceleration amount to decelerate in local
 * space units per second squared
 * @property {TypeTransformValue} bounceLoss 0.5 results in 50% velocity loss
 * if bouncing of boundary
 * @property {?(string | ((boolean) => void))} callback called each frame of
 * free movement
 */
type OBJ_ElementMoveFreely = {
  zeroVelocityThreshold: TypeTransformValue,  // Velocity considered 0
  deceleration: TypeTransformValue,           // Deceleration
  bounceLoss: TypeTransformValue,
  callback: ?(string | ((boolean) => void)),
}

/**
 * Figure element move parameters
 *
 * @property {TransformBounds} bounds rectangle to limit movement within
 * @property {string | (?(Transform) => Transform)} transformClip user
 * defined method to clip velocity per frame
 * @property {TypeTransformValue} maxVelocity maximum velocity allowed (5)
 * @property {OBJ_ElementMoveFreely} freely free movement parameters
 * @property {boolean} canBeMovedAfterLosingTouch touch or mouse dragging will
 * continue to move element even after the touch/cursor position is outside
 * the element boundary
 * @property {FigureElement | null} element
 */
type OBJ_ElementMove = {
  bounds: TransformBounds | 'none' | 'figure',
  // boundsToUse: TransformBounds,
  sizeInBounds: boolean,
  // limits: TransformBounds,
  // includeSize: boolean,
  transformClip: string | (?(Transform) => Transform);
  maxVelocity: TypeTransformValue;
  freely: OBJ_ElementMoveFreely,
  canBeMovedAfterLosingTouch: boolean;
  type: 'rotation' | 'translation' | 'scaleX' | 'scaleY' | 'scale';
  element: FigureElement | null | string;
};

/* eslint-enable no-use-before-define */

// A figure is composed of multiple figure elements.
//
// A figure element can either be a:
//  - Primitive: a basic element that has the webGL vertices, color
//  - Collection: a group of elements (either primitives or collections)
//
// A figure element can be:
//  - transformed (resized, offset, rotated)
//  - animated (planned transform over time)
//  - moved with control (like dragging)
//  - moving freely (dragged then let go with an initial velocity)
//  - Pulsed
//
// This class manages:
//  - The figure element
//  - Its current transformation
//  - Its animation plan, animation control and animation state
//  - Its movement state
//  - Its pulsing parameters
//
// A figure element has an associated persistant transform that describes how
// to draw it. The transform includes any translation, rotation and/or scaling
// the element should be transformed by before drawing.
//
// If the figure element is a collection of elements, then this transform is
// applied to all the child elements. Each child element will have it's own
// transform as well, and it will be multiplied by the parent transform.
//
// Whenever an element animated or moved, it's persistant transform is updated.
//
// Pulsing does not update an element's persistant transform, but does alter
// the element's current transform used for drawing itself and any children
// elements it has.
//

/**
 * All scenarios set to element.
 *
 * Scenarios are preset transforms, color and visibility settings that can be
 * easily animated to.
 *
 * This is an object where the keys are scenario names and values are
 * {@link OBJ_Scenario} objects defining the scenario.
 *
 * @property {OBJ_Scenario} scenarioName where scenarioName can be any
 * string that names the scenario
 */
type Scenarios = {
  [scenarioName: string]: OBJ_Scenario,
};

/**
 * Element movement state
 */
type ElementMovementState = {
  previousTime: ?number,
  previousTransform: Transform,
  velocity: Transform,           // current velocity - will be clipped
                                    // at max if element is being moved
                                    // faster than max.
};

/**
 * Element pulse state
 */
type ElementPulseState = {
  startTime: ?number,
};

/**
 * Element state
 */
type ElementState = {
  isBeingMoved: boolean,
  isMovingFreely: boolean,
  isChanging: boolean,
  movement: ElementMovementState,
  isPulsing: boolean,
  pulse: ElementPulseState,
  preparingToStop: boolean;
}

/**
 * setTransform event.
 *
 * Fired whenever the transform is changed.
 *
 * @event FigureElement#setTransform
 * @type {[Transform]}
 */

/**
 * Figure Element base class
 *
 * The set of properties and methods shared by all figure elements
 *
 * A figure element has several color related properties. Color is
 * defined as an RGBA array with values between 0 and 1. The alpha
 * channel defines the transparency or opacity of the color where
 * 1 is fully opaque and 0 is fully transparent.
 *
 * The `color` property stores the element's current color, while the
 * `defaultColor` property stores the element's color when not dimmed or
 * dissolving. Color should only be set using the `setColor` method.
 *
 * An element can be "dimmed" or "undimmed". For instance,
 * a red element might turn grey when dimmed. The property
 * `dimColor` stores the desired color to dim to and should be set with
 * `setDimColor()`
 *
 * An element can be dissolved in or out with animation. Dissolving
 * an element out transitions its opacity from its current value to 0.
 * The `opacity` property is used when dissolving. The opacity is multiplied by
 * the alpha channel of `color` to net a final opacity. Opacity should not be
 * set directly as it will be overwritten by dissolve animations.
 *
 * Notifications - The notification manager property `notifications` will
 * publish the following events:
 * - `beforeSetTransform`: published just before the `transform` property is
 * changed
 * - `setTransform`: published whenever the `transform` property is changed
 * - `startBeingMoved`: published when the element starts being moved by touch
 * - `stopBeingMoved`: published when the element stops being moved by touch
 * - `startMovingFreely`
 * - `stopMovingFreely`
 * - `show`: published when element is shown
 * - `hide`: published when element is hidden
 * - `visibility`: published when element element is shown or hidden
 * - `onClick`: published when element is clicked on
 * - `color`: published whenever color is set
 * - `beforeDraw`
 * - `afterDraw`
 * - `setState`: state of element has been set
 *
 * @class
 * @property {string} name reference name of element
 * @property {boolean} isShown if `false` then element will not be processed on
 * next draw
 * @property {Transform} transform transform to apply element
 * @property {Transform} lastDrawTransform transform last used for drawing -
 * includes cascade or all parent transforms
 * @property {FigureElement | null} parent parent figure element - `null` if
 * at top level of figure
 * @property {boolean} isTouchable must be `true` to move or execute `onClick`
 * @property {boolean} isMovable must be `true` to move
 * @property {string | () => void} onClick callback if touched or clicked
 * @property {[number, number, number, number]} color element's current
 * color defined as red, green, blue, alpha with range 0 to 1
 * @property {[number, number, number, number]} dimColor color to use when
 * dimming element
 * @property {[number, number, number, number]} defaultColor color to go to
 * when undimming element
 * @property {number} opacity number between 0 and 1 that is multiplied with
 * `color` alpha channel to get final opacity
 * @property {OBJ_ElementMove} move movement parameters
 * @property {Scenarios} scenarios scenario presets
 * @property {ElementState} state current state of element
 * @property {AnimationManager} animations element animation manager
 * @property {NotificationManager} notifications notification manager for
 * element
 * @property {FunctionMap} fnMap function map for use with {@link Recorder}
 * @property {Object} customState put any custom state information that needs
 * to be captured with recorder here - only stringify-able values can go in this
 * object like strings, numbers, booleans and nested arrays or objects
 * containing these. Functions should not be put in here - use string
 * identifiers to `fnMap` if functions are needed.
 */
class FigureElement {
  transform: Transform;
  pulseTransforms: Array<Transform>;
  frozenPulseTransforms: Array<Transform>;
  copyTransforms: Array<Transform>;
  drawTransforms: Array<Transform>;

  lastDrawTransform: Transform; // Transform matrix used in last draw
  lastDrawPulseTransform: Transform; // Transform matrix used in last draw
  parentTransform: Array<Transform>;
  // transformUpdated: boolean;
  // lastDrawParentTransform: Transform;
  // lastDrawElementTransform: Transform;
  // lastDrawPulseTransform: Transform;
  lastDrawElementTransformPosition: {parentCount: number, elementCount: number};

  lastDrawOpacity: number;

  parent: FigureElement | null;

  isShown: boolean;                  // True if should be shown in figure
  name: string;                   // Used to reference element in a collection

  isMovable: boolean;             // Element is able to be moved
  isTouchable: boolean;           // Element can be touched
  // isTrackable: boolean;
  touchPriority: boolean;
  isInteractive: ?boolean;         // Touch event is not processed by Figure
  hasTouchableElements: boolean;
  // touchInBoundingRect: boolean | number;

  drawPriority: number;
  cancelSetTransform: boolean;

  // Callbacks
  onClick: string | (?(?mixed) => void);
  setTransformCallback: ?(string | ((Transform) => void)); // element.transform is updated
  internalSetTransformCallback: ?(string | ((Transform) => void));
  beforeDrawCallback: string | (?(number) => void);
  afterDrawCallback: string | (?(number) => void);
  // redrawElements: Array<FigureElement>;

  color: TypeColor;           // For the future when collections use color
  defaultColor: Array<number>;
  dimColor: Array<number>;
  opacity: number;
  // noRotationFromParent: boolean;

  interactiveLocation: Point;   // this is in vertex space
  // recorder: Recorder;
  figure: OBJ_FigureForElement;
  // move: {
  //   bounds: TransformBounds,
  //   transformClip: string | (?(Transform) => Transform);
  //   maxVelocity: TypeTransformValue;            // Maximum velocity allowed
  //   // When moving freely, the velocity decelerates until it reaches a threshold,
  // // then it is considered 0 - at which point moving freely ends.
  //   freely: {                 // Moving Freely properties
  //     zeroVelocityThreshold: TypeTransformValue,  // Velocity considered 0
  //     deceleration: TypeTransformValue,           // Deceleration
  //     bounceLoss: TypeTransformValue,
  //     callback: ?(string | ((boolean) => void)),
  //   };
  //   // bounce: boolean;
  //   canBeMovedAfterLosingTouch: boolean;
  //   type: 'rotation' | 'translation' | 'scaleX' | 'scaleY' | 'scale';
  //   // eslint-disable-next-line no-use-before-define
  //   element: FigureElementCollection | FigureElementPrimitive | null;
  // };
  move: OBJ_ElementMove;

  onAdd: null | 'string' | () => void;
  // scenarios: {
  //   [scenarioName: string]: OBJ_Scenario;
  // };
  scenarios: Scenarios;

  type: 'collection' | 'primitive';

  pulseSettings: {
    time: number,
    frequency: number,
    A: number | Array<number>,
    B: number | Array<number>,
    C: number | Array<number>,
    progression: string | ((number, number, number, number, number) => number),
    num: number,
    delta: TypeParsablePoint,
    transformMethod: string | ((number, ?Point) => Transform),
    callback: ?(string | ((mixed) => void));
    allowFreezeOnStop: boolean,
    type: 'scale' | 'rotation' | number,
    // clearFrozenTransforms: boolean,
  };

  pulseDefault: string | ((?() => void) => void) | {
    scale: null | number | Point,
    rotation: null | number,
    translation: null | number | Point,
    angle: number,
    duration: number,
    frequency: number,
    // thick?: {
    //   num: number,
    //   min?: number | Point,
    //   max?: number | Point,
    // },
    num: number,
    // min: number | Point,
    xAlign: 'center' | 'left' | 'right' | number,
    yAlign: 'middle' | 'bottom' | 'top' | number,
    centerOn: null | FigureElement | string,
    space: TypeSpace,
    done: null | () => void,
    progression: string | (number) => number,
    when: TypeWhen,
  };


  figureLimits: Rect;
  figureTransforms: OBJ_SpaceTransforms;

  // Current animation/movement state of element
  state: ElementState;

  animations: animations.AnimationManager;
  animationFinishedCallback: ?(string | (() => void));

  // pulse: Object;                  // Pulse animation state

  uid: string;

  // Rename to animate in future
  anim: Object;

  // pulse: (mixed) => void;
  // pulse: (?Array<string | FigureElement> | mixed) => void;
  +pulse: (any, ?any) => void;
  +exec: (any, any) => void;
  +getElement: (any) => ?FigureElement;
  +getElements: (any) => Array<FigureElement>;
  +highlight: (any) => void;
  // +pulse: (Array<string | FigureElement>) => void;

  // This will scale and position this element such that the center of the
  // figure limits will will look like it is centered on a html element
  // when this figurone element is drawn.
  // Scale can be:
  //  1em: figure units will be scaled so 0.2 figure units (default
  //       font size) looks like 1em of the element font size in pixels
  //  100px: figure units will be scaled so that the max figure limit
  //         with be the pixel count
  //  stretch: figure units be stretched so figure limits extend to
  //           element dimensions independently in x and y
  //  max: -1 to 1 figure units will be scaled to max dimension of element
  //  fit: figure units will be scaled so that figure limits aspect ratio
  //       fits within the element aspect ratio
  //  '': defaults to fit keeping aspect ratio.
  tieToHTML: {
    element: string | null;
    scale: string;   // 1em, 100px, stretch, max, fit
    window: Rect;
    updateOnResize: boolean;
  };

  isRenderedAsImage: boolean;
  renderedOnNextDraw: boolean;
  unrenderNextDraw: boolean;

  custom: { [string]: any };
  _custom: { [string]: any };

  stateProperties: Array<string>
  customState: Object;
  fnMap: FunctionMap;
  // isPaused: boolean;

  // finishAnimationOnPause: boolean;

  notifications: NotificationManager;

  lastDrawTime: number;

  // pauseSettings: TypePauseSettings;

  dependantTransform: boolean;

  recorder: Recorder;
  timeKeeper: TimeKeeper;

  simple: boolean;
  // scenarioSet: {
  //   quiz1: [
  //     { element: xyz, position: (), scale: (), rotation: (), length: () }
  //     { element: abc, position: (), }
  //   ],
  // };
  //  element1.scenarioSet['quiz'] = [
  //     { element: abc, position: [1, 2], scale: 2 },
  //     { element: xyz, position: [2, 2]},
  //  ];
  //  element.setScenarios('center', evenIfNotShown
  //  element.moveToScenarios('center', 1, callback))

  // element.animations.new()
  //    .parallel()
  //

  /**
   * @hideconstructor
   */
  constructor(
    transform: Transform = new Transform(),
    figureLimitsOrFigure: Figure | Rect = new Rect(-1, -1, 2, 2),
    parent: FigureElement | null = null,
    name: string = generateUniqueId('element_'),
    timeKeeper: TimeKeeper = new TimeKeeper(),
  ) {
    // This may be updated if element is added to a collection with a different
    // name
    this.name = name;
    this.uid = (Math.random() * 1e18).toString(36);
    this.isShown = true;
    this.simple = false;
    this.transform = transform._dup();
    this.dependantTransform = false;
    this.fnMap = new FunctionMap();
    this.notifications = new NotificationManager(this.fnMap);
    this.isMovable = false;
    this.isTouchable = false;
    this.touchPriority = false;
    this.isInteractive = undefined;
    this.hasTouchableElements = false;
    this.color = [1, 1, 1, 1];
    this.lastDrawOpacity = 1;
    this.dimColor = [0.5, 0.5, 0.5, 1];
    this.defaultColor = this.color.slice();
    this.opacity = 1;
    this.setTransformCallback = null;
    this.beforeDrawCallback = null;
    this.afterDrawCallback = null;
    this.internalSetTransformCallback = null;
    this.lastDrawTransform = this.transform._dup();
    this.parentTransform = [new Transform()];
    this.lastDrawPulseTransform = this.transform._dup();
    this.onClick = null;
    this.lastDrawElementTransformPosition = {
      parentCount: 0,
      elementCount: 0,
    };
    this.custom = {};
    this._custom = {};
    this.customState = {};
    this.parent = parent;
    this.drawPriority = 1;
    this.stateProperties = [];
    this.lastDrawTime = 0;
    this.cancelSetTransform = false;
    this.onAdd = null;
    this.timeKeeper = timeKeeper;
    this.pulseDefault = {
      scale: 2,
      rotation: null,
      translation: null,
      angle: 0,
      duration: 1,
      frequency: 0,
      xAlign: 'center',
      yAlign: 'middle',
      centerOn: 'this',
      num: 1,
      space: 'figure',
      done: null,
      progression: 'sinusoid',
      when: 'syncNow',
    };

    if (figureLimitsOrFigure instanceof Rect) {
      this.figureLimits = figureLimitsOrFigure;
    } else if (figureLimitsOrFigure != null) {
      this.figureLimits = this.figure.limits._dup();
    }
    this.move = {
      bounds: 'none',
      sizeInBounds: false,
      maxVelocity: 5,
      freely: {
        zeroVelocityThreshold: 0.0001,
        deceleration: 5,
        callback: null,
        bounceLoss: 0.5,
      },
      canBeMovedAfterLosingTouch: true,
      type: 'translation',
      element: null,
      transformClip: null,
    };

    this.scenarios = {};

    const pulseTransformMethod = (mag, d, type) => {
      if (type === 'scale') {
        if (d == null) {
          return new Transform()
            .translate(0, 0)
            .scale(mag, mag)
            .translate(0, 0);
        }
        return new Transform()
          .translate(-d.x, -d.y)
          .scale(mag, mag)
          .translate(d.x, d.y);
      }
      if (type === 'rotation') {
        return new Transform()
          .translate(-d.x, -d.y)
          .rotate(mag)
          .translate(d.x, d.y);
      }
      const x = mag * Math.cos(type);
      const y = mag * Math.sin(type);
      return new Transform().translate(x, y);
    };
    this.fnMap.add('_elementPulseSettingsTransformMethod', pulseTransformMethod);
    this.fnMap.add('tools.math.easeinout', math.easeinout);
    this.fnMap.add('tools.math.linear', math.linear);
    this.fnMap.add('tools.math.sinusoid', math.sinusoid);
    this.fnMap.add('tools.math.sinusoidAbs', math.sinusoidAbs);
    this.fnMap.add('tools.math.triangle', math.triangle);
    this.pulseSettings = {
      time: 1,
      frequency: 0.5,
      A: 1,
      B: 0.5,
      C: 0,
      progression: 'tools.math.sinusoid',
      num: 1,
      delta: new Point(0, 0),
      transformMethod: '_elementPulseSettingsTransformMethod',
      callback: () => {},
      allowFreezeOnStop: false,
      type: 'scale',
    };

    this.state = {
      isBeingMoved: false,
      isMovingFreely: false,
      isChanging: false,
      movement: {
        previousTime: null,
        previousTransform: this.transform._dup(),
        velocity: this.transform.zero(),
      },

      isPulsing: false,
      pulse: {
        startTime: null,
      },
      preparingToStop: false,
    };
    this.interactiveLocation = new Point(0, 0);
    this.animationFinishedCallback = null;
    this.animations = new animations.AnimationManager({
      element: this,
      finishedCallback: this.animationFinished.bind(this),
      timeKeeper: this.timeKeeper,
    });
    this.tieToHTML = {
      element: null,
      scale: 'fit',
      window: this.figureLimits,
      updateOnResize: true,
    };
    this.isRenderedAsImage = false;
    this.unrenderNextDraw = false;
    this.renderedOnNextDraw = false;
    this.pulseTransforms = [];
    this.frozenPulseTransforms = [];
    this.copyTransforms = [];
    this.drawTransforms = [];
  }

  animationFinished(typeOfAnimation: 'pulse' | 'movingFreely' | 'animation' = 'animation') {
    this.fnMap.exec(this.animationFinishedCallback);
    this.notifications.publish('animationFinished', typeOfAnimation);
  }

  animateNextFrame() {
    if (this.figure != null) {
      this.figure.animateNextFrame(true, this.name);
    }
  }

  setProperties(properties: Object, exceptIn: Array<string> | string = []) {
    let except = exceptIn;
    if (properties.move != null) {
      const cleanBounds = (key) => {
        if (typeof except === 'string') {
          except = [except, `move.${key}`];
        } else {
          except.push(`move.${key}`);
        }
        const bounds = getBounds(properties.move[key], 'transform', this.transform);
        if (bounds instanceof TransformBounds) {
          for (let i = 0; i < bounds.boundary.length; i += 1) {
            const bound = bounds.boundary[i];
            const order = bounds.order[i];
            if (
              bounds.boundary[i] != null
              && bound instanceof RangeBounds
              && (order === 't' || order === 's')
            ) {
              bounds.boundary[i] = new RectBounds({
                left: bound.boundary.min,
                bottom: bound.boundary.min,
                right: bound.boundary.max,
                top: bound.boundary.max,
              });
            }
          }
          this.move[key] = bounds;
        }
      };
      // if (properties.move.boundsToUse != null) {
      //   cleanBounds('boundsToUse');
      // }
      if (
        properties.move.bounds != null
        && properties.move.bounds !== 'figure'
        && properties.move.bounds !== 'none'
      ) {
        cleanBounds('bounds');
      }
    }
    joinObjectsWithOptions({
      except,
    }, this, properties);
  }


  _getStateProperties(options: { ignoreShown?: boolean }) {
    let { ignoreShown } = options;
    if (ignoreShown == null) {
      ignoreShown = false;
    }
    if (this.isShown || ignoreShown) {
      return [
        'animations',
        'color',
        'opacity',
        'dimColor',
        'defaultColor',
        'transform',
        '_custom',
        // 'lastDrawTransform',
        // 'parentTransform',
        'isShown',
        'isMovable',
        'isTouchable',
        'state',
        'pulseSettings',
        'setTransformCallback',
        'move',
        'notifications',
        // 'finishAnimationOnPause',
        'pulseTransforms',
        'frozenPulseTransforms',
        'customState',
        // 'lastDrawTime',
        ...this.stateProperties,
      ];
    }
    return [
      'isShown',
      'transform',
      'customState',
    ];
  }

  _getStatePropertiesMin() {
    if (this.isShown) {
      return [
        'color',
        'transform',
        'isShown',
      ];
    }
    return [
      'isShown',
    ];
  }

  _state(
    options: {
      precision?: number,
      ignoreShown?: boolean,
      min?: boolean,
      returnF1Type?: boolean,
    } = {},
  ) {
    let state;
    let { returnF1Type } = options;
    if (returnF1Type == null) {
      returnF1Type = true;
    }
    if (returnF1Type) {
      return {
        f1Type: 'de',
        state: this.getPath(),
      };
    }
    const o = joinObjects({}, options, { returnF1Type: true });
    if (o.min) {
      state = getState(this, this._getStatePropertiesMin(), o);
    } else {
      state = getState(this, this._getStateProperties(o), o);
    }
    return state;
  }

  stateSet() {
    this.notifications.publish('setState');
  }

  // execFn(fn: string | Function | null, ...args: Array<any>) {
  //   if (fn == null) {
  //     return null;
  //   }
  //   if (typeof fn === 'string') {
  //     return this.fnMap.exec(fn, ...args);
  //   }
  //   return fn(...args);
  // }

  setFigure(figure: OBJ_FigureForElement) {
    this.figure = figure;
    if (figure != null) {
      this.recorder = figure.recorder;
      this.animationFinishedCallback = figure.animationFinished;
      this.timeKeeper = figure.timeKeeper;
      this.animations.timeKeeper = figure.timeKeeper;
      this.animations.recorder = figure.recorder;
    }
    if (this.isTouchable) {
      this.setTouchable();
    }
    if (this.isMovable) {
      this.setMovable();
    }
  }

  setTimeDelta(delta: number) {
    if (this.animations.state === 'animating') {
      this.animations.setTimeDelta(delta);
    }
    if (this.state.isPulsing && this.state.pulse.startTime != null) {
      this.state.pulse.startTime += delta;
    }
    if (this.state.movement.previousTime != null) {
      this.state.movement.previousTime += delta;
    }
  }


  // Space definition:
  //   * Pixel space: css pixels
  //   * GL Space: x,y = -1 to 1
  //   * Figure Space: x,y = figure limits
  //   * Element space: Combination of element transform and its
  //     parent transform's

  // A figure element primitive vertex object lives in GL SPACE.
  //
  // A figure element has its own FIGURE ELEMENT SPACE, which is
  // the GL space transformed by `this.transform`.
  //
  // A figure element is drawn in the FIGURE SPACE, by transforming
  // the FIGURE ELEMENT SPACE by an incoming transformation matrix in the draw
  // method. This incoming transformation matrix originates in the figure
  // and waterfalls through each parent figure collection element to the
  // current figure element.
  //
  // this.lastDrawTransformationMatrix captures how a vertex was drawn in
  // the last frame, in FIGURE space as:
  //   vertex
  //     transformed by: FIGURE ELEMENT SPACE
  //     transfromed by: FIGURE SPACE transform
  //
  // By default, webgl clip space is a unit space from (-1, 1) to (1, 1)
  // independent of the aspect ratio of the canvas it is drawn on.
  //
  // A figure object can have its own clip space with arbitrary limits. e.g.:
  //    * (-1, -1) to (1, 1)    similar to gl clip space
  //    * (0, 0) to (2, 2)      similar to gl clip space but offset
  //    * (0, 0) to (4, 2)      for rectangular aspect ratio figure
  //
  // The figure object clip space definition is stored in this.figureLimits.
  //
  // To therefore transform a vertex (from GL SPACE) to FIGURE CLIP SPACE:
  //   * Take the vertex
  //   * Transform it to FIGURE SPACE (by transforming it with the
  //     lastDrawTransformMatrix)
  //   * Transform it to FIGURE CLIP SPACE by scaling and offsetting it
  //     to the clip space.
  //
  // Each figure element holds a FIGURE ELMENT CLIP space

  updateHTMLElementTie(
    figureCanvas: HTMLElement,
  ) {
    let tieToElement;
    if (typeof this.tieToHTML.element === 'string') {
      tieToElement = document.getElementById(this.tieToHTML.element);
    }
    if (tieToElement != null) {
      const tie = tieToElement.getBoundingClientRect();
      const canvas = figureCanvas.getBoundingClientRect();
      const figure = this.figureLimits;
      const dWindow = this.tieToHTML.window;
      const cAspectRatio = canvas.width / canvas.height;
      const dAspectRatio = figure.width / figure.height;
      const tAspectRatio = tie.width / tie.height;
      const wAspectRatio = dWindow.width / dWindow.height;

      const topLeftPixels = new Point(
        tie.left - canvas.left,
        tie.top - canvas.top,
      );
      const bottomRightPixels = topLeftPixels.add(new Point(
        tie.width, tie.height,
      ));

      const { pixelToFigure } = this.figureTransforms;
      const topLeft = topLeftPixels.transformBy(pixelToFigure.m());
      const bottomRight = bottomRightPixels.transformBy(pixelToFigure.m());
      const width = bottomRight.x - topLeft.x;
      const height = topLeft.y - bottomRight.y;
      const center = topLeft.add(new Point(width / 2, -height / 2));

      const scaleString = this.tieToHTML.scale.trim().toLowerCase();

      let scaleX = 1;
      let scaleY = 1;
      const figureToWindowScaleX = figure.width / dWindow.width;
      const figureToWindowScaleY = figure.height / dWindow.height;

      // Window has no scaling impact on em, it only has impact on translation
      if (scaleString.endsWith('em')) {
        const scale = parseFloat(scaleString);
        const em = parseFloat(getComputedStyle(tieToElement).fontSize);
        // 0.2 is default font size in figure units
        const defaultFontScale = figure.width / 0.2;
        scaleX = scale * em * defaultFontScale / canvas.width;
        scaleY = scale * em * defaultFontScale / dAspectRatio / canvas.height;
      }

      // Scale the maximum dimension of the window to the pixel value
      if (scaleString.endsWith('px')) {
        const maxPixels = parseFloat(scaleString);
        if (wAspectRatio > 1) {
          const scale = maxPixels / canvas.width;
          scaleX = scale * figureToWindowScaleX;
          scaleY = scale * cAspectRatio / dAspectRatio * figureToWindowScaleX;
        } else {
          const scale = maxPixels / canvas.height;
          scaleX = scale / cAspectRatio * dAspectRatio * figureToWindowScaleY;
          scaleY = scale * figureToWindowScaleY;
        }
      }

      // Scale the window x to tie x, and window y to tie y
      if (scaleString === 'stretch') {
        scaleX = tie.width / canvas.width * figureToWindowScaleX;
        scaleY = tie.height / canvas.height * figureToWindowScaleY;
      }

      // Scale so window either fits within the tie element, or fits only
      // within the max dimension of the tie element
      if (scaleString === 'max' || scaleString === 'fit') {
        const fitHeightScale = new Point(
          tie.height / canvas.height / cAspectRatio * dAspectRatio * figureToWindowScaleY,
          tie.height / canvas.height * figureToWindowScaleY,
        );

        const fitWidthScale = new Point(
          tie.width / canvas.width * figureToWindowScaleX,
          tie.width / canvas.width * cAspectRatio / dAspectRatio * figureToWindowScaleX,
        );

        if (
          (scaleString === 'max' && tAspectRatio > wAspectRatio)
          || (scaleString === 'fit' && tAspectRatio < wAspectRatio)
        ) {
          scaleX = fitWidthScale.x;
          scaleY = fitWidthScale.y;
        } else {
          scaleX = fitHeightScale.x;
          scaleY = fitHeightScale.y;
        }
      }

      this.setScale(scaleX, scaleY);

      // Offset the element relative to the tie
      this.setPosition(
        center.x - scaleX * (this.tieToHTML.window.left + this.tieToHTML.window.width / 2),
        center.y - scaleY * (this.tieToHTML.window.bottom + this.tieToHTML.window.height / 2),
      );
      this.setFirstTransform(this.getParentLastDrawTransform());
    }
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setFirstTransform(parentTransform: Transform) {
  }

  clearFrozenPulseTransforms() {
    this.frozenPulseTransforms = [];
  }

  freezePulseTransforms(forceOverwrite: boolean = true) {
    if (
      (forceOverwrite && this.pulseTransforms.length === 0)
      || (!forceOverwrite && this.pulseTransforms.length > 0)
    ) {
      this.frozenPulseTransforms = this.pulseTransforms.map(t => t._dup());
    }
  }

  animateToState(
    state: Object,
    options: Object,
    independentOnly: boolean = false,
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    const target = {};
    if (
      (this.isShown !== state.isShown && this.opacity === 1)
      || this.opacity !== 1
    ) {
      target.isShown = state.isShown;
    }
    if (!areColorsWithinDelta(this.color, state.color, 0.001)) {
      target.color = state.color;
    }
    const stateTransform = getTransform(state.transform);
    if (
      !this.transform.isWithinDelta(stateTransform, 0.001)
      && (
        this.dependantTransform === false
        || independentOnly === false
      )
    ) {
      target.transform = stateTransform;
    }

    let scenarioAnimation = null;
    let duration = 0;
    if (Object.keys(target).length > 0) {
      const scenarioOptions = joinObjects({}, options, { target });
      scenarioAnimation = this.animations.scenario(scenarioOptions);
    }
    let pulseAnimation = null;
    if (!this.arePulseTransformsSame(state, 0.001)) {
      let startPulseTransforms = this.pulseTransforms.map(t => t._dup());
      if (this.pulseTransforms.length === 0) {
        startPulseTransforms = this.frozenPulseTransforms.map(t => t._dup());
      }
      let targetPulseTransforms = state.pulseTransforms.map(t => getTransform(t));
      if (targetPulseTransforms.length === 0 && state.frozenPulseTransforms.length > 0) {
        targetPulseTransforms = state.frozenPulseTransforms.map(t => getTransform(t));
      }
      if (targetPulseTransforms.length === 0 && startPulseTransforms.length > 0) {
        targetPulseTransforms = [startPulseTransforms[0].identity()];
      }

      pulseAnimation = this.animations.pulseTransform(joinObjects({}, options, {
        start: startPulseTransforms,
        target: targetPulseTransforms,
      }));
    }

    if (scenarioAnimation != null || pulseAnimation != null) {
      this.animations.new()
        .inParallel([
          scenarioAnimation,
          pulseAnimation,
        ])
        .start(startTime);
    }

    if (scenarioAnimation != null) {
      duration = Math.max(duration, scenarioAnimation.getTotalDuration());
    }
    if (pulseAnimation != null) {
      duration = Math.max(duration, pulseAnimation.getTotalDuration());
    }

    return duration;
  }

  dissolveInToState(
    state: Object,
    duration: number = 0.8,
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    if (state.isShown === false) {
      return 0;
    }
    this.transform = getTransform(state.transform);
    this.color = state.color.slice();
    this.frozenPulseTransforms = [];
    state.pulseTransforms.forEach(t => this.frozenPulseTransforms.push(getTransform(t)));
    this.show();
    this.animations.new()
      .opacity({
        target: state.opacity,
        start: 0.001,
        duration,
      })
      .trigger({
        callback: () => {
          this.frozenPulseTransforms = [];
        },
      })
      .start(startTime);
    return duration;
  }

  isStateSame(
    state: Object,
    mergePulseTransforms: boolean = false,
    exceptions: Array<string> = [],
  ) {
    const p = this.getPath();
    if (exceptions.indexOf(p) > -1) {
      return true;
    }
    if (this.isShown !== state.isShown || Math.abs(this.opacity - state.opacity) > 0.001) {
      return false;
    }
    if (!areColorsWithinDelta(this.color, state.color, 0.001)) {
      return false;
    }
    if (!this.transform.isWithinDelta(getTransform(state.transform), 0.001)) {
      return false;
    }

    if (mergePulseTransforms) {
      if (!this.arePulseTransformsSame(state, 0.001)) {
        return false;
      }
      return true;
    }
    if (state.pulseTransforms.length !== this.pulseTransforms.length) {
      return false;
    }
    for (let i = 0; i < this.pulseTransforms.length; i += 1) {
      if (!this.pulseTransforms[i].isWithinDelta(getTransform(state.pulseTransforms[i]), 0.001)) {
        return false;
      }
    }
    return true;
  }

  arePulseTransformsSame(state: Object, delta: number = 0.001) {
    let statePulseTransforms = [];
    let pulseTransforms = [];
    statePulseTransforms = transformBy([this.transform._dup()], state.pulseTransforms);
    statePulseTransforms = transformBy(statePulseTransforms, state.frozenPulseTransforms);

    pulseTransforms = transformBy([this.transform._dup()], this.pulseTransforms);
    pulseTransforms = transformBy(pulseTransforms, this.frozenPulseTransforms);

    if (pulseTransforms.length !== statePulseTransforms.length) {
      return false;
    }
    for (let i = 0; i < pulseTransforms.length; i += 1) {
      if (!pulseTransforms[i].isWithinDelta(statePulseTransforms[i], delta)) {
        return false;
      }
    }
    return true;
  }

  getDrawTransforms(initialTransforms: Array<Transform>) {
    // let drawTransforms = [transform];
    let drawTransforms = initialTransforms;
    if (this.copyTransforms.length > 0) {
      drawTransforms = transformBy(drawTransforms, this.copyTransforms);
    }
    if (this.pulseTransforms.length > 0) {
      drawTransforms = transformBy(drawTransforms, this.pulseTransforms);
    }
    if (this.frozenPulseTransforms.length > 0) {
      drawTransforms = transformBy(drawTransforms, this.frozenPulseTransforms);
    }
    // drawTransforms = transformBy(drawTransforms, this.pulseTransforms);
    // drawTransforms = transformBy(drawTransforms, this.frozenPulseTransforms);
    return drawTransforms;
  }

  exec(
    execFunctionAndArgs: string | Array<string | Object>,
  ) {
    // if (elementsToExec == null || typeof elementsToExec === 'function') {
    let execFunc;
    let args;
    if (Array.isArray(execFunctionAndArgs)) {
      [execFunc, ...args] = execFunctionAndArgs;
    } else {
      execFunc = execFunctionAndArgs;
    }

    // $FlowFixMe
    if (this[execFunc] != null && typeof this[execFunc] === 'function') {
      if (args === undefined) {
        // $FlowFixMe
        this[execFunc]();
      } else {
        // $FlowFixMe
        this[execFunc](...args);
      }
    }
  }

  getElement() {
    return this;
  }

  getElements() {
    return [this];
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  highlight() {
    this.undim();
  }


  /**
   * Conveniently set the first `translation` of the element's `transform`.
   * @param {TypeParsablePoint | number} pointOrX x coordinate or full point
   * definition
   * @param {number} y y coordinate if `pointOrX` is just the x coordinate (`0`)
   */
  setPosition(pointOrX: TypeParsablePoint | number, y: number = 0) {
    let position;
    if (typeof pointOrX === 'number') {
      position = new Point(pointOrX, y);
    } else {
      position = getPoint(pointOrX);
    }
    const currentTransform = this.transform._dup();
    currentTransform.updateTranslation(position);
    this.setTransform(currentTransform);
  }

  /**
   * Conveniently set the first `rotation` of the element's `transform`.
   * @param {number} rotation
   */
  setRotation(rotation: number) {
    const currentTransform = this.transform._dup();
    currentTransform.updateRotation(rotation);
    this.setTransform(currentTransform);
  }

  /**
   * Conveniently set the first `scale` of the element's `transform`.
   * @param {TypeParsablePoint | number} scaleOrX horizontal scale - either
   * define as full x-y point, or as a number. If scaleOrX is a `number` and
   * `y` is null, then both `x` and `y` will be equally scaled
   * @param {number | null} y y coordinate if `scaleOrX` is a `number` (`null`)
   */
  setScale(scaleOrX: TypeParsablePoint | number, y: ?number = null) {
    let scale;
    if (typeof scaleOrX === 'number') {
      if (typeof y === 'number') {
        scale = new Point(scaleOrX, y);
      } else {
        scale = new Point(scaleOrX, scaleOrX);
      }
    } else {
      scale = getPoint(scaleOrX);
    }
    const currentTransform = this.transform._dup();
    currentTransform.updateScale(scale);
    this.setTransform(currentTransform);
  }

  // Use this method to set the element's transform in case a callback has been
  // connected that is tied to an update of the transform.
  /**
   * Set transform of element. Setting through this method will ensure
   * `setTransfrom` subscription will publish, and transform will be
   * appropriately clipped.
   * @param {Transform} transform
   */
  setTransform(transform: Transform, publish: boolean = true): void {
    if (this.simple === false && this.move.transformClip != null) {
      const clip = this.fnMap.exec(this.move.transformClip, transform);
      if (clip instanceof Transform) {
        this.notifications.publish('beforeSetTransform', [clip]);
        if (this.cancelSetTransform === false) {
          this.transform = clip;
        } else {
          this.cancelSetTransform = false;
        }
      }
    } else if (this.simple === false) {
      const bounds = this.getMoveBounds(); // $FlowFixMe
      const clip = bounds.clip(transform);
      this.notifications.publish('beforeSetTransform', [clip]);
      if (this.cancelSetTransform === false) {
        this.transform = clip;
      } else {
        this.cancelSetTransform = false;
      }
    } else {
      this.notifications.publish('beforeSetTransform', [transform]);
      this.transform = transform;
    }
    if (this.simple === false) {
      this.updateDrawTransforms(this.parentTransform, false);
    }
    if (this.internalSetTransformCallback) {
      this.fnMap.exec(this.internalSetTransformCallback, this.transform);
    }
    if (publish) {
      this.notifications.publish('setTransform', [this.transform]);
      this.fnMap.exec(this.setTransformCallback, this.transform);
    }
  }

  // Set the next transform (and velocity if moving freely) for the next
  // animation frame.
  //
  // If animating, this transform will be the next frame determined by
  // the currently executing animation phase. If time exceeds the current
  // phase, then either the next phase will be started, or if there are no
  // more phases, the animation will complete.
  //
  // If moving freely, this method will set the next velocity and transform
  // based on the current velocity, current transform, elapsed time,
  // deceleration (in freelyProperties) and zeroVelocityThreshold.
  // Once the velocity goes to zero, this metho will stop the element moving
  // freely.
  nextMovingFreelyFrame(now: number): void {
    // If the element is moving freely, then calc it's next velocity and
    // transform. Save the new velocity into state.movement and return the
    // transform.
    if (this.state.isMovingFreely) {
      // If this is the first frame of moving freely, then record the current
      // time so can calculate velocity on next frame
      if (this.state.movement.previousTime == null) {
        this.state.movement.previousTime = now;
        return;
      }
      // console.log(this.state.movement.velocity)
      if (Array.isArray(this.state.movement.velocity)) {
        this.state.movement.velocity = getTransform(this.state.movement.velocity);
      }
      // If got here, then we are now after the first frame, so calculate
      // the delta time from this frame to the previous
      const deltaTime = now - this.state.movement.previousTime;
      // Calculate the new velocity and position
      const next = this.decelerate(deltaTime);
      this.state.movement.velocity = next.velocity;
      this.state.movement.previousTime = now;

      // If the velocity is 0, then stop moving freely and return the current
      // transform
      if (this.state.movement.velocity.isZero()) {
        this.state.movement.velocity = this.state.movement.velocity.zero();
        this.stopMovingFreely('complete');
      }
      this.setTransform(next.transform);
    }
  }

  // Used only to clear 2D context
  // eslint-disable-next-line class-methods-use-this
  clear() {
  }

  willStartAnimating() {
    if (this.animations.willStartAnimating()) {
      return true;
    }
    return false;
  }

  /**
   Set element color.
   @param {[number, number, number, number]} color RGBA color from 0 to 1
   @param {boolean} [setDefault] also set the default color to this color
   */
  setColor(color: TypeColor, setDefault: boolean = true) {
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
    this.notifications.publish('color');
    this.animateNextFrame();
  }

  /**
   * Set element color to `dimColor`
   */
  dim() {
    this.setColor(this.dimColor, false);
    this.animateNextFrame();
  }

  /**
   * Set `dimColor` property
   */
  setDimColor(color: TypeColor) {
    this.dimColor = color != null ? color.slice() : [0, 0, 0, 0];
  }

  /**
   * Set element color to `defaultColor`
   */
  undim() {
    this.setColor(this.defaultColor, false);
    this.animateNextFrame();
  }

  setOpacity(opacity: number) {
    // this.color[3] = opacity;
    this.opacity = opacity;
    this.animateNextFrame();
  }

  // retrieve a scenario
  getScenarioTarget(
    scenarioIn: ?string | OBJ_Scenario,
  ): { transform?: Transform, color?: TypeColor, isShown?: boolean } {
    let transform;
    let color;
    let isShown;
    let scenario;
    if (scenarioIn == null) {
      return {};
    }
    if (typeof scenarioIn === 'string') {
      if (scenarioIn in this.scenarios) {
        scenario = this.scenarios[scenarioIn];
      } else {
        scenario = {};
      }
    } else {
      scenario = scenarioIn;
    }

    if (scenario.transform != null) {
      transform = getTransform(scenario.transform);
    }
    if (scenario.position != null) {
      if (transform == null) {
        transform = this.transform._dup();
      }
      transform.updateTranslation(getPoint(scenario.position));
    }

    if (scenario.translation != null) {
      if (transform == null) {
        transform = this.transform._dup();
      }
      transform.updateTranslation(getPoint(scenario.translation));
    }

    if (scenario.rotation != null) {
      if (transform == null) {
        transform = this.transform._dup();
      }
      transform.updateRotation(scenario.rotation);
    }
    if (scenario.scale != null) {
      if (transform == null) {
        transform = this.transform._dup();
      }
      transform.updateScale(getScale(scenario.scale));
    }
    if (scenario.color) {
      color = scenario.color.slice();
    }
    if (scenario.isShown != null) {
      ({ isShown } = scenario);
    }
    return {
      transform,
      color,
      isShown,
    };
  }

  /**
   * Set transform, color and/or visibility to a predefined scenario.
   *
   * @param {string | Array<string>} [scenarioName] name of the scenario to
   * set. Use an array of names to set multiple scenarios in the array's order.
   * @param {boolean} [onlyIfVisible] `true` to only set scenario if element is
   * visible
   */
  setScenario(scenario: string | OBJ_Scenario) {
    const target = this.getScenarioTarget(scenario);
    if (target.transform != null) {
      this.setTransform(target.transform._dup());
    }
    // this.setColor(target.color.slice());
    if (target.isShown != null) {
      if (target.isShown) {
        this.show();
      } else {
        this.hide();
      }
    }
    if (target.color != null) {
      this.setColor(target.color);
    }
  }

  setScenarios(scenarioName: string | Array<string>) {
    let scenarios = scenarioName;
    if (!Array.isArray(scenarios)) {
      scenarios = [scenarios];
    }
    scenarios.forEach((scenario) => {
      if (this.scenarios[scenario] != null) {
        this.setScenario(scenario);
      }
    });
  }

  /**
   * Save the current transform, color and/or visibility to a scenario.
   */
  saveScenario(
    scenarioName: string,
    keys: Array<string> = ['transform', 'color', 'isShown'],
  ) {
    const scenario = this.getCurrentScenario(keys);
    if (Object.keys(scenario).length > 0) {
      this.scenarios[scenarioName] = scenario;
    }
  }

  getCurrentScenario(
    keys: Array<string> = ['transform', 'color', 'isShown'],
  ) {
    const scenario = {};
    keys.forEach((key) => {
      if (key === 'transform') {
        scenario.transform = this.transform._dup();
      } else if (key === 'position') {
        scenario.position = this.getPosition();
      } else if (key === 'rotation') {
        scenario.rotation = this.getRotation();
      } else if (key === 'scale') {
        scenario.scale = this.getScale();
      } else if (key === 'color') {
        scenario.color = this.color.slice();
      } else if (key === 'isShown') {
        scenario.isShown = this.isShown;
      }
    });
    return scenario;
  }

  saveScenarios(scenarioName: string, keys: Array<string>) {
    this.saveScenario(scenarioName, keys);
  }

  getAllElementsWithScenario(scenarioName: string) {
    if (this.scenarios[scenarioName] != null) {
      return [this];
    }
    return [];
  }

  getMovingFreelyEnd() {
    return this.decelerate(null);
  }

  getRemainingMovingFreelyTime() {
    if (this.state.isMovingFreely) {
      return this.decelerate(null).duration;
    }
    return 0;
  }

  // Decelerate over some time when moving freely to get a new element
  // transform and movement velocity
  decelerate(deltaTime: number | null = null): Object {
    const bounds = this.getMoveBounds();
    // console.log(deltaTime)
    const next = this.transform.decelerate(
      this.state.movement.velocity,
      this.move.freely.deceleration,
      deltaTime,  // $FlowFixMe
      bounds,
      this.move.freely.bounceLoss,
      this.move.freely.zeroVelocityThreshold,
    );
    return {
      velocity: next.velocity,
      transform: next.transform,
      duration: next.duration,
    };
  }


  updateLastDrawTransform() {
    const transform = this.getTransform();
    transform.order.forEach((t, index) => {
      this.lastDrawTransform.order[index] = t._dup();
    });
    this.lastDrawTransform.calcAndSetMatrix();
  }

  getParentLastDrawTransform() {
    const { parentCount } = this.lastDrawElementTransformPosition;
    return new Transform(this.lastDrawTransform.order.slice(-parentCount));
  }

  /**
   * Return figure path of element
   * @return {string} path of element relative to figure
   */
  getPath() {
    if (this.parent == null) {
      return this.name;
    }
    if (this.parent.name === 'figureRoot' || this.parent.parent == null) {
      return this.name;
    }
    return `${this.parent.getPath()}.${this.name}`;
  }


  // Being Moved
  startBeingMoved(): void {
    // this.stopAnimating();
    this.animations.cancelAll('freeze');
    this.stopMovingFreely('freeze');
    this.state.movement.velocity = this.transform.zero();
    this.state.movement.previousTransform = this.transform._dup();
    this.state.movement.previousTime = this.timeKeeper.now() / 1000;
    this.state.isBeingMoved = true;
    this.unrender();
    this.notifications.publish('startBeingMoved');
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent('startBeingMoved', [this.getPath()]);
    }
  }

  moved(newTransform: Transform): void {
    const prevTransform = this.transform._dup();
    this.setTransform(newTransform._dup());
    let tBounds;
    if (this.move.bounds != null) {  // $FlowFixMe
      tBounds = this.move.bounds.getTranslation();
    }
    // In a finite rect bounds, if we calculate the velocity from the clipped
    // transform, the object will skip along the wall if the user lets the
    // object go after intersecting with the wall
    if (
      tBounds instanceof RectBounds
      && tBounds.boundary.right > tBounds.boundary.left
      && tBounds.boundary.top > tBounds.boundary.bottom
    ) {
      this.calcVelocity(prevTransform, newTransform);
    } else {
      this.calcVelocity(prevTransform, this.transform);
    }
  }

  stopBeingMoved(): void {
    if (!this.state.isBeingMoved) {
      return;
    }
    const currentTime = this.timeKeeper.now() / 1000;
    // Check wether last movement was a long time ago, if it was, then make
    // velocity 0 as the user has stopped moving before releasing touch/click
    if (this.state.movement.previousTime != null) {
      if ((currentTime - this.state.movement.previousTime) > 0.05) {
        this.state.movement.velocity = this.transform.zero();
      }
    }
    this.notifications.publish('stopBeingMoved');
    if (this.recorder.state === 'recording' && this.state.isBeingMoved) {
      this.recorder.recordEvent(
        'stopBeingMoved',
        [
          this.getPath(),
          this.transform._state(),
          this.state.movement.velocity._state(),
        ],
        // this.state.movement.velocity.toString(),
      );
    }
    this.state.isBeingMoved = false;
    this.state.movement.previousTime = null;
  }

  calcVelocity(prevTransform: Transform, nextTransform: Transform): void {
    const currentTime = this.timeKeeper.now() / 1000;
    if (this.state.movement.previousTime == null) {
      this.state.movement.previousTime = currentTime;
      return;
    }
    const deltaTime = currentTime - this.state.movement.previousTime;

    // If the time is too small, weird calculations may happen
    if (deltaTime < 0.0001) {
      return;
    }
    this.state.movement.velocity = nextTransform.velocity(
      prevTransform,
      deltaTime,
      this.move.freely.zeroVelocityThreshold,
      this.move.maxVelocity,
    );
    this.state.movement.previousTime = currentTime;
  }

  simulateStartMovingFreely(transform: Transform, velocity: Transform) {
    this.transform = transform;
    this.state.movement.velocity = velocity;
    this.startMovingFreely();
  }

  // Moving Freely
  startMovingFreely(callback: ?(string | ((boolean) => void)) = null): void {
    this.animations.cancelAll('freeze');
    this.stopBeingMoved();
    if (callback) {
      this.move.freely.callback = callback;
    }
    this.state.isMovingFreely = true;
    this.state.movement.previousTime = this.timeKeeper.now() / 1000;
    if (Array.isArray(this.state.movement.velocity)) {
      this.state.movement.velocity = getTransform(this.state.movement.velocity);
    }
    this.state.movement.velocity = this.state.movement.velocity.clipMag(
      this.move.freely.zeroVelocityThreshold,
      this.move.maxVelocity,
    );
    this.notifications.publish('startMovingFreely');
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent(
        'startMovingFreely',
        [
          this.getPath(),
          this.transform._state(),
          this.state.movement.velocity._state(),
        ],
      );
    }
    this.animateNextFrame();
  }

  stopMovingFreely(how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel'): void {
    if (how === 'animateToComplete') {
      return;
    }
    let wasMovingFreely = false;
    if (this.state.isMovingFreely === true) {
      wasMovingFreely = true;
    }
    if (how === 'complete' && wasMovingFreely) {
      const result = this.getMovingFreelyEnd();
      this.setTransform(result.transform);
    }

    this.state.isMovingFreely = false;
    this.state.movement.previousTime = null;
    if (this.move.freely.callback) {
      this.fnMap.exec(this.move.freely.callback, how);
      this.move.freely.callback = null;
    }
    if (wasMovingFreely) {
      this.fnMap.exec(this.animationFinishedCallback);
      this.animationFinished('movingFreely');
      this.notifications.publish('stopMovingFreely');
    }
    this.animateNextFrame();
  }

  getRemainingPulseTime(now: number = this.timeKeeper.now() / 1000) {
    if (this.state.isPulsing === false) {
      return 0;
    }
    if (this.state.pulse.startTime == null) {
      return this.pulseSettings.time;
    }
    return this.pulseSettings.time - (now - this.state.pulse.startTime);
  }

  // Take an input transform matrix, and output a list of transform matrices
  // that have been transformed by a pulse. The first matrix in the list
  // will be the largest, so when saving lastDrawTransformMatrix it can be
  // used to determine if a touch has occured in the object.
  //
  // When an object is animated or moved, it's new transform is saved as the
  // new transform of the object. In contrast, pulsing is not saved as the
  // current transform of the object, and is used only in the current draw
  // of the element.
  getPulseTransforms(now: number): Array<Transform> {
    const pulseTransforms = [];    // To output list of transform matrices
    // If the figure element is currently pulsing, the calculate the current
    // pulse magnitude, and transform the input matrix by the pulse
    if (this.state.isPulsing) {
      // If this is the first pulse frame, then set the startTime
      if (this.state.pulse.startTime == null) {
        this.state.pulse.startTime = now;
      }
      // Calculate how much time has elapsed between this frame and the first
      // pulse frame
      let deltaTime = now - this.state.pulse.startTime;
      // If the elapsed time is larger than the planned pulse time, then
      // clip the elapsed time to the pulse time, and end pulsing (after this
      // draw). If the pulse time is 0, that means pulsing will loop
      // indefinitely.
      if (deltaTime >= this.pulseSettings.time && this.pulseSettings.time !== 0) {
        // this.state.isPulsing = false;
        this.stopPulsing('complete');
        deltaTime = this.pulseSettings.time;
      }

      // Go through each pulse matrix planned, and transform the input matrix
      // with the pulse.
      for (let i = 0; i < this.pulseSettings.num; i += 1) {
        // Get the current pulse magnitude
        const pulseMag = this.fnMap.exec(
          this.pulseSettings.progression,
          deltaTime,
          this.pulseSettings.frequency,
          this.pulseSettings.A instanceof Array ? this.pulseSettings.A[i] : this.pulseSettings.A,
          this.pulseSettings.B instanceof Array ? this.pulseSettings.B[i] : this.pulseSettings.B,
          this.pulseSettings.C instanceof Array ? this.pulseSettings.C[i] : this.pulseSettings.C,
        );

        // Use the pulse magnitude to get the current pulse transform
        const pTransform = this.fnMap.exec(
          this.pulseSettings.transformMethod,
          pulseMag,
          getPoint(this.pulseSettings.delta),
          this.pulseSettings.type,
        );
        // Transform the current transformMatrix by the pulse transform matrix
        // const pMatrix = m2.mul(m2.copy(transform), pTransform.matrix());

        // Push the pulse transformed matrix to the array of pulse matrices\
        if (pTransform != null) {
          pulseTransforms.push(pTransform);
        }
      }
    // If not pulsing, then make no changes to the transformMatrix.
    }
    return pulseTransforms;
  }

  /**
   * Pulse element.
   *
   * An element can be pulsed in scale, a rotation or a translation.
   *
   * The scale pulse can either be a single pulse, or a number of copies with a
   * range of scales - which has the effect of making regular polygons thick.
   *
   * Either pass in a callback, or an options object defining the pulse and
   * callback.
   *
   * @param {null | OBJ_Pulse | () => void} optionsOrDone
   */
  pulse(optionsOrDone: null | OBJ_Pulse | () => void = null) {
    if (
      typeof this.pulseDefault === 'function'
      || typeof this.pulseDefault === 'string'
    ) {
      let done = null;
      if (typeof optionsOrDone === 'function') {
        done = optionsOrDone;
      } else if (optionsOrDone != null && optionsOrDone.done != null) {
        ({ done } = optionsOrDone);
      }
      this.fnMap.exec(this.pulseDefault, done);
      return;
    }

    const defaultOptions = this.pulseDefault;
    let done = null;
    let options;

    if (typeof optionsOrDone === 'function' || typeof optionsOrDone === 'string') {
      options = joinObjects({}, defaultOptions);
      done = optionsOrDone;
    } else if (optionsOrDone == null) {
      options = joinObjects({}, defaultOptions);
      done = null;
    } else {
      options = joinObjects({}, defaultOptions, optionsOrDone);
      ({ done } = options);
    }

    if (options.progression === 'sinusoid') {
      options.progression = 'tools.math.sinusoid';
    } else if (options.progression === 'sinusoidAbs') {
      options.progression = 'tools.math.sinusoidAbs';
    } else if (options.progression === 'triangle') {
      options.progression = 'tools.math.triangle';
    }

    const {
      centerOn, xAlign, yAlign, space,
    } = options;

    let delta;
    if (centerOn == null) {
      delta = new Point(0, 0);
    } else if (centerOn === 'this') {
      delta = this.getPositionInBounds('figure', xAlign, yAlign)
        .transformBy(this.spaceTransformMatrix('figure', 'draw'));
    } else if (centerOn instanceof FigureElement) {
      delta = centerOn.getPositionInBounds('figure', xAlign, yAlign)
        .transformBy(this.spaceTransformMatrix('figure', 'draw'));
    } else {
      delta = getPoint(centerOn)
        .transformBy(this.spaceTransformMatrix(space, 'draw'));
    }

    const {
      duration, scale, progression, when, num, rotation, angle, translation,
    } = options;
    let {
      min, start, frequency,
    } = options;

    if (frequency === 0 || frequency == null) {
      frequency = duration === 0 ? 1 : 1 / duration;
    }

    let max;
    if (translation != null) {
      start = start == null ? 0 : start;
      max = translation;
    } else if (rotation != null) {
      start = start == null ? 0 : start;
      max = rotation;
    } else {
      start = start == null ? 1 : start;
      max = scale;
    }

    min = min == null ? start : min;
    const range = max - min;

    if (num > 1) {
      const bStep = range / (num - 1);
      const BArray = [];
      const CArray = [];
      const AArray = [];
      for (let i = 0; i < num; i += 1) {
        const minMax = max - i * bStep;
        if (minMax < start) {
          const r = start - minMax;
          CArray.push(Math.PI / 2);
          AArray.push(start - r / 2);
          BArray.push(r / 2);
        } else {
          const r = minMax - start;
          CArray.push(-Math.PI / 2);
          AArray.push(start + r / 2);
          BArray.push(r / 2);
        }
      }
      this.pulseSettings.A = AArray;
      this.pulseSettings.B = BArray;
      this.pulseSettings.C = CArray;
    } else {
      const mid = range / 2 + min;
      const startNormalized = range !== 0 ? (start - mid) / (range / 2) : start;
      this.pulseSettings.A = mid;
      this.pulseSettings.B = range / 2;
      this.pulseSettings.C = Math.asin(round(startNormalized, 10));
    }

    this.pulseSettings.time = duration;
    this.pulseSettings.frequency = frequency;
    this.pulseSettings.num = num;
    this.pulseSettings.delta = delta;
    this.pulseSettings.callback = done;
    this.pulseSettings.progression = progression;
    this.pulseSettings.type = 'scale';
    if (rotation != null) {
      this.pulseSettings.type = 'rotation';
    }
    if (translation != null) {
      this.pulseSettings.type = angle;
    }
    this.startPulsing(when);
    this.animateNextFrame();
  }

  startPulsing(when: TypeWhen = 'nextFrame') {
    this.state.isPulsing = true;
    const time = this.timeKeeper.getWhen(when);
    this.state.pulse.startTime = time == null ? time : time / 1000;
    this.unrender();
    this.frozenPulseTransforms = [];
    this.animateNextFrame();
  }

  stopPulsing(
    how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete'
         | 'dissolveToComplete' = 'cancel',
  ) {
    const wasPulsing = this.state.isPulsing;
    if (how === 'animateToComplete') {
      return;
    }
    if (how === 'freeze' && this.state.isPulsing) {
      this.frozenPulseTransforms = this.pulseTransforms.map(t => t._dup());
      this.pulseTransforms = [];
    }
    if (how === 'cancel' || how === 'complete') {
      this.pulseTransforms = [];
    }
    this.state.isPulsing = false;
    this.pulseSettings.num = 1;
    if (this.pulseSettings.callback) {
      const { callback } = this.pulseSettings;
      this.pulseSettings.callback = null;
      this.fnMap.exec(callback, how);
    }
    if (wasPulsing) {
      // this.notifications.publish('animationFinished', )
      this.animationFinished('pulse');
      this.notifications.publish('stopPulsing');
    }
    this.animateNextFrame();
  }

  // isAnimating() {
  //   if (this.state.isPulsing) {
  //     return true;
  //   }
  //   if (this.state.isMovingFreely) {
  //     return true;
  //   }
  //   if (this.animations.isAnimating()) {
  //     return true;
  //   }
  //   return false;
  // }

  stop(how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel') {
    let toComplete = 0;
    const checkStop = () => {
      toComplete -= 1;
      if (toComplete <= 0) {
        this.state.preparingToStop = false;
        this.notifications.publish('stopped');
      }
    };
    if (how === 'animateToComplete' || how === 'dissolveToComplete') {
      if (this.animations.isAnimating()) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.animations.notifications.add('finished', checkStop, 1);
      }
      if (this.state.isPulsing) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.notifications.add('stopPulsing', checkStop, 1);
      }
      if (this.state.isMovingFreely) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.notifications.add('stopMovingFreely', checkStop, 1);
      }
    }
    if (this.state.preparingToStop) {
      this.notifications.publish('preparingToStop');
    }
    this.stopAnimating(how);
    this.stopMovingFreely(how);
    this.stopBeingMoved();
    this.stopPulsing(how);
  }


  stopAnimating(
    how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel',
    name: string | null = null,
  ) {
    if (how === 'freeze') {
      this.animations.cancel(name, 'freeze');
    } else if (how === 'cancel') {
      this.animations.cancel(name, null);
    } else if (how === 'complete') {
      this.animations.cancel(name, 'complete');
    }
  }

  getRemainingAnimationTime(
    animationNames: Array<string> | string = [],
  ) {
    return this.animations.getRemainingTime(animationNames);
  }

  getNextAnimationFinishTime() {
    if (this.simple) {
      return 0;
    }
    const t1 = this.getRemainingMovingFreelyTime();
    const t2 = this.getRemainingPulseTime();
    const t3 = this.animations.getNextAnimationFinishTime();
    let t = null;
    if (t1 != null && t1 > 0) {
      t = t1;
    }
    if (t2 > 0) {
      if (t == null) {
        t = t2;
      } else if (t2 < t) {
        t = t2;
      }
    }
    if (t3 != null && t3 > 0) {
      if (t == null) {
        t = t3;
      } else if (t3 < t) {
        t = t3;
      }
    }
    return t;
  }


  updateLimits(
    limits: Rect,
    transforms: OBJ_SpaceTransforms = this.figureTransforms,
  ) {
    this.figureLimits = limits;
    this.figureTransforms = transforms;
  }


  resize(figureHTMLElement: ?HTMLElement = null) {
    if (figureHTMLElement && this.tieToHTML.updateOnResize) {
      this.updateHTMLElementTie(figureHTMLElement);
    }
  }


  getPixelToVertexSpaceScale() {
    const pixelToFigure = this.figureTransforms.pixelToFigure.matrix();
    const figureToVertex = this.spaceTransformMatrix('figure', 'draw');
    const scaleX = pixelToFigure[0] * figureToVertex[0];
    const scaleY = pixelToFigure[4] * figureToVertex[4];
    return new Point(scaleX, scaleY);
  }

  getVertexToPixelSpaceScale() {
    const pixelToVertexSpaceScale = this.getPixelToVertexSpaceScale();
    return new Point(
      1 / pixelToVertexSpaceScale.x,
      1 / pixelToVertexSpaceScale.y,
    );
  }

  spaceTransformMatrix(from: string, to: string) {
    // All Vertex related conversions
    if (from === to) {
      return new Transform().identity().matrix();
    }
    if (from === 'draw' && to === 'pixel') {
      return m2.mul(
        this.figure.spaceTransforms.glToPixel.matrix(),
        this.lastDrawTransform.matrix(),
      );
    }
    if (from === 'draw' && to === 'gl') {
      return this.lastDrawTransform.matrix();
    }
    if (from === 'draw' && to === 'figure') {
      return this.lastDrawTransform.calcMatrix(0, -3);
    }
    if (from === 'draw' && to === 'local') {
      return this.getTransform().matrix();
    }
    if (from === 'pixel' && to === 'draw') {
      return m2.mul(
        m2.inverse(this.lastDrawTransform.matrix()),
        this.figure.spaceTransforms.pixelToGL.matrix(),
      );
    }
    if (from === 'gl' && to === 'draw') {
      return m2.inverse(this.lastDrawTransform.matrix());
    }
    if (from === 'figure' && to === 'draw') {
      return m2.inverse(this.lastDrawTransform.calcMatrix(0, -3));
    }
    if (from === 'local' && to === 'draw') {
      return m2.inverse(this.getTransform().matrix());
    }

    // Remaining Local related conversions
    if (from === 'local' && to === 'pixel') {
      return m2.mul(
        this.figure.spaceTransforms.glToPixel.matrix(),
        this.lastDrawTransform.calcMatrix(this.transform.order.length),
      );
    }
    if (from === 'local' && to === 'gl') {
      return this.lastDrawTransform.calcMatrix(this.transform.order.length);
    }
    if (from === 'local' && to === 'figure') {
      return this.lastDrawTransform.calcMatrix(this.transform.order.length, -3);
    }
    if (from === 'pixel' && to === 'local') {
      return m2.mul(
        m2.inverse(this.lastDrawTransform.calcMatrix(this.transform.order.length)),
        this.figure.spaceTransforms.pixelToGL.matrix(),
      );
    }
    if (from === 'gl' && to === 'local') {
      return m2.inverse(this.lastDrawTransform.calcMatrix(this.transform.order.length));
    }
    if (from === 'figure' && to === 'local') {
      return m2.inverse(this.lastDrawTransform.calcMatrix(this.transform.order.length, -3));
    }

    // Remaining Figure related conversions
    if (from === 'figure' && to === 'gl') {
      return this.figure.spaceTransforms.figureToGL.matrix();
    }
    if (from === 'figure' && to === 'pixel') {
      return this.figure.spaceTransforms.figureToPixel.matrix();
    }
    if (from === 'gl' && to === 'figure') {
      return this.figure.spaceTransforms.glToFigure.matrix();
    }
    if (from === 'pixel' && to === 'figure') {
      return this.figure.spaceTransforms.pixelToFigure.matrix();
    }

    // Remaining GL related conversions
    if (from === 'gl' && to === 'pixel') {
      return this.figure.spaceTransforms.glToPixel.matrix();
    }
    if (from === 'pixel' && to === 'gl') {
      return this.figure.spaceTransforms.pixelToGL.matrix();
    }
    return new Transform().identity().matrix();
  }

  pointFromSpaceToSpace(
    point: TypeParsablePoint,
    fromSpace: TypeSpace,
    toSpace: TypeSpace,
  ) {
    return getPoint(point).transformBy(this.spaceTransformMatrix(fromSpace, toSpace));
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */
  getBorderPoints(
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ): TypeBorder {
    return [[]];
  }
  /* eslint-enable class-methods-use-this, no-unused-vars */

  // A DrawingObject has borders, touchBorders and and holeBorders
  //
  // A FigureElement's border is then the DrawingObject's border transformed by
  // the element's transform
  //
  // Something can have borders, bounds and a boundingRect
  // * Borders: the points defining the enclosing border
  // * Bounds: The expanse of the object from a drawingSpace of 0, 0
  // * BoundingRect: The rectangle enclosing all the border points
  // * BoundingRectBorder: The perimeter of the boundingRect
  /* eslint-disable class-methods-use-this, no-unused-vars */
  getBorder(
    space: TypeSpace = 'local',
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ) {
    // if (this.name === 'c' && border === 'touchBorder') {
    //   debugger;
    // }
    const borderPoints = this.getBorderPoints(border);
    if (space === 'draw') {
      return borderPoints;
    }
    const transformedBorders = [];
    let matrix;
    if (Array.isArray(space)) {
      matrix = m2.mul(space, this.getTransform().matrix());
    } else {
      matrix = this.spaceTransformMatrix('draw', space);
    }

    borderPoints.forEach((b) => {
      transformedBorders.push(
        b.map(p => p.transformBy(matrix)),
      );
    });
    return transformedBorders;
  }
  /* eslint-enable class-methods-use-this, no-unused-vars */

  getBoundingRect(
    space: TypeSpace = 'local',
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ) {
    const transformedBorder = this.getBorder(space, border);  // $FlowFixMe
    return getBoundingRect(transformedBorder);
  }

  // ***************************************************************
  // Size
  // ***************************************************************
  getRelativeBoundingRect(
    space: TypeSpace = 'local',
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ) {
    const rect = this.getBoundingRect(space, border);
    const position = this.getPosition(space);
    return new Rect(
      rect.left - position.x,
      rect.bottom - position.y,
      rect.width,
      rect.height,
    );
  }

  getCenterFigurePosition() {
    const rect = this.getBoundingRect('figure', 'border');
    // const rect = this.getFigureBoundingRect();
    return new Point(
      rect.left + rect.width / 2,
      rect.bottom + rect.height / 2,
    );
  }

  /**
   * Return the first scale in the element's transform. Will return
   * `[1, 1]` if element's transform doesn't have a scale.
   *
   * @return {Point} scale
   */
  getScale() {
    const s = this.transform.s();
    let scale = new Point(1, 1);
    if (s != null) {
      scale = s._dup();
    }
    return scale;
  }

  /**
   * Return the first rotation in the element's transform. Will return
   * `0` if the element's transform doesn't have a rotation.
   *
   * @param {'0to360' | '-180to180' | ''} normalize how to normalize the
   * returned angle where `''` returns the raw angle
   * @return {Point} scale
   */
  getRotation(normalize: '0to360' | '-180to180' | '' = '') {
    const r = this.transform.r();
    let rotation = 0;
    if (r != null) {
      rotation = r;
    }
    if (normalize !== '' && r != null) {
      rotation = clipAngle(r, normalize);
    }
    return rotation;
  }

  // /**
  //  * Get position relative to bounding rect.
  //  *
  //  * @return {Point} position
  //  */
  getPositionInBounds(
    space: TypeSpace = 'local',
    xAlign: 'center' | 'left' | 'right' | 'location' | number = 'location',
    yAlign: 'middle' | 'top' | 'bottom' | 'location' | number = 'location',
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ) {
    const bounds = this.getBoundingRect(space, border);
    const p = this.getPosition(space);
    if (xAlign === 'left') {
      p.x = bounds.left;
    } else if (xAlign === 'right') {
      p.x = bounds.right;
    } else if (xAlign === 'center') {
      p.x = bounds.left + bounds.width / 2;
    } else if (typeof xAlign === 'number') {
      p.x = bounds.left + bounds.width * xAlign;
    } else if (xAlign != null && xAlign.slice(-1)[0] === 'o') {
      const offset = parseFloat(xAlign);
      p.x = bounds.left + offset;
    }

    if (yAlign === 'top') {
      p.y = bounds.top;
    } else if (yAlign === 'bottom') {
      p.y = bounds.bottom;
    } else if (yAlign === 'middle') {
      p.y = bounds.bottom + bounds.height / 2;
    } else if (typeof yAlign === 'number') {
      p.y = bounds.bottom + bounds.height * yAlign;
    } else if (yAlign != null && yAlign.slice(-1)[0] === 'o') {
      const offset = parseFloat(yAlign);
      p.y = bounds.bottom + offset;
    }
    return p;
  }

  /**
   * Get position of element
   *
   * By default the first translation of the element's transform is returned.
   * This is effectively the element's location in 'local' coordinates.
   *
   * The position of the element relative to its horizontal and vertical bounds
   * can also be returned. Use `xAlign` to find the x coordinate of the left,
   * center, right or percentage width from left of the element. Use `yAlign`
   * to find the bottom, middle, top or percentage height from bottom of the
   * element.
   *
   * @param {'local' | 'figure' | 'gl' | 'draw'} space the space to return
   * the position in
   * @param {'center' | 'left' | 'right' | 'location' | number} xAlign
   * horizontal alignment of position. Use a `number` to define the horizontal
   * position in percentage width from the left.
   * @param {'middle' | 'top' | 'bottom' | 'location' | number} yAlign
   * vertical alignment of position. Use a `number` to define the vertical
   * position in percentage height from the bottom.
   */
  getPosition(
    space: TypeSpace = 'local',
    xAlign: 'center' | 'left' | 'right' | 'location' | number = 'location',
    yAlign: 'middle' | 'top' | 'bottom' | 'location' | number = 'location',
  ) {
    if (xAlign !== 'location' || yAlign !== 'location') {
      return this.getPositionInBounds(space, xAlign, yAlign);
    }
    // vertex space position doesn't mean much as it will always be 0, 0
    if (space === 'draw') {
      return new Point(0, 0);
    }
    return new Point(0, 0).transformBy(this.spaceTransformMatrix('draw', space));
  }

  setFigurePosition(figurePosition: Point) {
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const figureSpace = {
      x: {
        bottomLeft: this.figureLimits.left,
        width: this.figureLimits.width,
      },
      y: {
        bottomLeft: this.figureLimits.bottom,
        height: this.figureLimits.height,
      },
    };
    const figureToGLSpace = spaceToSpaceTransform(figureSpace, glSpace);
    const glLocation = figurePosition.transformBy(figureToGLSpace.matrix());
    const t = new Transform(this.lastDrawTransform.order.slice(this.transform.order.length));
    const newLocation = glLocation.transformBy(m2.inverse(t.matrix()));
    this.setPosition(newLocation._dup());
  }

  setFigurePositionToElement(element: FigureElement) {
    const p = element.getPosition('figure');
    this.setFigurePosition(p._dup());
  }

  setPositionToElement(
    element: FigureElement,
  ) {
    if (element.parent === this.parent) {
      const p = element.transform.t();
      if (p != null) {
        this.setPosition(p._dup());
      }
      return;
    }
    const figurePosition = element.getPosition('figure');
    const local = figurePosition.transformBy(
      this.spaceTransformMatrix('figure', 'local'),
    );
    this.setPosition(local);
  }

  checkMoveBounds() {
    if (this.move.bounds === 'figure') {
      this.setMoveBounds('figure');
      return;
    }
    if (this.move.bounds === 'none' || this.move.bounds === null) {
      this.setMoveBounds('none');
      return;
    }
    if (!(this.move.bounds instanceof TransformBounds)) {
      this.setMoveBounds(this.move.bounds);
    }
  }

  setMoveBounds(
    boundaryIn: TransformBounds | TypeTransformBoundsDefinition | 'figure' | 'none' = 'none',
  ): void {
    if (boundaryIn instanceof TransformBounds) {
      this.move.bounds = boundaryIn;
      return;
    }

    if (boundaryIn === null || boundaryIn === 'none') {
      this.move.bounds = new TransformBounds(this.transform);
      return;
    }

    if (boundaryIn === 'figure') {
      if (!(this.move.bounds instanceof TransformBounds)) {
        this.move.bounds = new TransformBounds(this.transform);
      }
      this.move.sizeInBounds = true;
      const m = this.spaceTransformMatrix('figure', 'local');
      const p0 = new Point(this.figureLimits.left, this.figureLimits.bottom).transformBy(m);
      // const p1 = new Point(this.figureLimits.right, p0.y).transformBy(m);
      const p1 = new Point(this.figureLimits.right, this.figureLimits.top).transformBy(m);
      // $FlowFixMe
      this.move.bounds.updateTranslation(new RectBounds({
        left: p0.x,
        bottom: p0.y,
        right: p1.x,
        top: p1.y,
      }));
      return;
    }
    const bounds = getBounds(boundaryIn, 'transform', this.transform);
    if (bounds instanceof TransformBounds) {
      this.move.bounds = bounds;
    }
  }

  getMoveBounds(): Bounds {
    this.checkMoveBounds();  // $FlowFixMe
    if (this.move.bounds.isUnbounded()) { // $FlowFixMe
      return this.move.bounds;
    }

    if (this.move.sizeInBounds) {
      const rect = this.getRelativeBoundingRect('local');
      // $FlowFixMe
      const dup = this.move.bounds._dup();
      const b = dup.getTranslation();
      if (b != null) {
        b.boundary.left -= rect.left;
        b.boundary.bottom -= rect.bottom;
        b.boundary.right -= rect.right;
        b.boundary.top -= rect.top;
        dup.updateTranslation(b);
        return dup;
      }
    } // $FlowFixMe
    return this.move.bounds;
  }

  getShown() {
    if (this.isShown) {
      return [[this.getPath(), this.uid, this]];
    }
    return [];
  }

  getUid(uid: string) {
    if (uid === this.uid) {
      return this;
    }
    return null;
  }

  /**
   * Show element
   */
  show() {
    this.isShown = true;
    if (this.opacity === 0) {
      this.setOpacity(1);
    }
    if (this.parent != null) {
      if (!this.parent.isShown) {
        this.parent.show();
      }
    }
    this.notifications.publish('show');
    this.notifications.publish('visibility');
    this.animateNextFrame();
  }

  /**
   * `true` set this element as touchable and configures all parent elements
   * to accept touches for their children
   *
   * `false` makes this element not touchable.
   */
  setTouchable(makeThisElementTouchable: boolean = true) {
    if (makeThisElementTouchable) {
      this.isTouchable = true;
    } else {
      this.hasTouchableElements = true;
    }
    if (this.parent != null) {
      this.parent.setTouchable(false);
    }
  }

  /**
   * Configure all parents to make this element touchable, and
   * make this element touchable and movable
   * @param {boolean} movable `true` to make movable, `false` to not
   */
  setMovable(movable: boolean = true) {
    if (movable) {
      this.isMovable = true;
      this.setTouchable(true);
    } else {
      this.isMovable = false;
      this.isTouchable = false;
    }
  }

  clearRender() {
    let tieToElement;
    let elementId = '';
    if (typeof this.tieToHTML.element === 'string') {
      elementId = this.tieToHTML.element;
      tieToElement = document.getElementById(this.tieToHTML.element);
    }

    if (tieToElement) {
      const w = document.getElementById(`${elementId}_webgl`);
      if (w != null) {
        // w.style.visibility = 'hidden';
        w.style.display = 'none';
      }
      const d = document.getElementById(`${elementId}_2d`);
      if (d != null) {
        // d.style.visibility = 'hidden';
        d.style.display = 'none';
      }
    }
  }

  setRenderedOnNextDraw() {
    this.renderedOnNextDraw = true;
  }

  unrender(): void {
    if (this.isRenderedAsImage) {
      this.unrenderNextDraw = true;
      this.isRenderedAsImage = false;
    }
    if (this.parent != null) {
      this.parent.unrender();
    }
  }

  showAll(): void {
    this.show();
  }

  /**
   * Hide element
   */
  hide(): void {
    this.isShown = false;
    this.notifications.publish('hide');
    this.notifications.publish('visibility');
    this.animateNextFrame();
  }

  hideAll(): void {
    this.hide();
  }

  /**
   * Toggle hide/show of element
   */
  toggleShow() {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  }

  // eslint-disable-next-line no-unused-vars
  click(glPoint: Point = new Point(0, 0)) {
    const drawPoint = glPoint.transformBy(this.spaceTransformMatrix('gl', 'draw'));
    if (this.onClick != null) {
      if (this.recorder.state === 'recording') {
        this.recorder.recordEvent('elementClick', [this.getPath(), glPoint.x, glPoint.y]);
      }
      this.fnMap.exec(this.onClick, drawPoint, this);
    }
    this.notifications.publish('onClick', [drawPoint, this]);
  }


  /**
   * Get current transform of element.
   * @return {Transform}
   */
  getTransform() {
    return this.transform;
  }


  /**
   * @return {boolean} `true` if element is moving
   */
  isMoving(): boolean {
    if (this.state.isChanging) {
      return true;
    }
    if (this.isShown === false) {
      return false;
    }
    if (this.isAnimating()) {
      return true;
    }
    if (this.state.isBeingMoved) {
      return true;
    }
    return false;
  }

  /**
   * @return {boolean} `true` if element is animating
   */
  isAnimating(): boolean {
    if (this.isShown === false) {
      return false;
    }
    if (
      this.state.isMovingFreely
      || this.state.isPulsing
      || this.animations.isAnimating()
    ) {
      return true;
    }
    return false;
  }


  isAnyElementMoving() {
    return this.isMoving();
  }

  isBeingTouched(glLocation: Point): boolean {
    if (!this.isTouchable) {
      return false;
    }
    const vertexLocation = glLocation.transformBy(this.spaceTransformMatrix('gl', 'draw'));
    const borders = this.getBorder('draw', 'touchBorder');
    const holeBorders = this.getBorder('draw', 'holeBorder');
    for (let i = 0; i < borders.length; i += 1) {
      const border = borders[i];
      if (border.length > 2) {
        if (vertexLocation.isInPolygon(border)) {
          let isTouched = true;
          // $FlowFixMe
          if (this.cannotTouchHole) {
            for (let j = 0; j < holeBorders.length; j += 1) {
              const holeBorder = holeBorders[j];
              if (holeBorder.length > 2) {
                if (Array.isArray(holeBorder) && holeBorder.length > 2) {
                  if (vertexLocation.isInPolygon(holeBorder)) {
                    isTouched = false;
                    j = holeBorders.length;
                  }
                }
              }
            }
          }
          if (isTouched) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getTouched(glLocation: Point): Array<FigureElement> {
    if (!this.isTouchable) {
      return [];
    }
    if (this.isBeingTouched(glLocation)) {
      return [this];
    }
    return [];
  }

  updateDrawTransforms(
    parentTransform: Array<Transform> = [new Transform()],
    isSame: boolean = false,
  ) {
    if (isSame) {
      return isSame;
    }
    const transform = this.getTransform()._dup();
    const newTransforms = transformBy(parentTransform, [transform]);
    this.parentTransform = parentTransform;
    this.lastDrawElementTransformPosition = {
      parentCount: parentTransform[0].order.length,
      elementCount: this.transform.order.length,
    };
    this.pulseTransforms = this.getPulseTransforms(
      this.timeKeeper.now() / 1000,
    ); // $FlowFixMe
    this.drawTransforms = this.getDrawTransforms(newTransforms);
    // eslint-disable-next-line prefer-destructuring
    this.lastDrawTransform = newTransforms[0];
    // eslint-disable-next-line prefer-destructuring
    this.lastDrawPulseTransform = this.drawTransforms[0];
    return isSame;
  }
}


/*
..........########..########..####.##.....##
..........##.....##.##.....##..##..###...###
..........##.....##.##.....##..##..####.####
..........########..########...##..##.###.##
..........##........##...##....##..##.....##
..........##........##....##...##..##.....##
..........##........##.....##.####.##.....##
*/
// ***************************************************************
// Geometry Object
// ***************************************************************

/**
 * Primitive figure element
 *
 * A primitive figure element is one that handles an object (`drawingObject`)
 * that draws to the screen. This object may be a {@link VertexObject}, a
 * {@link TextObject} or a {@link HTMLObject}}.
 *
 * @class
 * @extends FigureElement
 */
class FigureElementPrimitive extends FigureElement {
  drawingObject: DrawingObject;
  pointsToDraw: number;
  angleToDraw: number;
  lengthToDraw: number;
  cannotTouchHole: boolean;
  pointsDefinition: Object;
  setPointsFromDefinition: ?(() => void);
  border: TypeBorder | 'draw' | 'buffer' | 'rect' | number;
  touchBorder: TypeBorder | 'border' | number | 'rect' | 'draw' | 'buffer';
  holeBorder: TypeBorder;
  drawBorder: TypeBorder;
  drawBorderBuffer: TypeBorder;
  // +pulse: (?(mixed) => void) => void;

  /**
   * Primitive figure element.
   *
   * This type of element is responsible for drawing something
   * to the screen, or managing a HTML element in the DOM
   *
   * @param {DrawingObject} drawingObject an object that handles drawing
   * to the screen or manages a HTML element
   * @param {Transform} transform initial transform to set
   * @param {[number, number, number, number]} color color to set
   * @param {Rect} figureLimits limits of figure
   * @param {FigureElement | null} parent parent element
   * @param
   */
  constructor(
    drawingObject: DrawingObject,
    transform: Transform = new Transform(),
    color: TypeColor = [0.5, 0.5, 0.5, 1],
    figureLimits: Rect = new Rect(-1, -1, 2, 2),
    parent: FigureElement | null = null,
    name: string = generateUniqueId('element_'),
    timeKeeper: TimeKeeper = new TimeKeeper(),
  ) {
    super(transform, figureLimits, parent, name, timeKeeper);
    this.drawingObject = drawingObject;
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    this.defaultColor = this.color.slice();
    this.dimColor = [0.5, 0.5, 0.5, 1];
    this.pointsToDraw = -1;
    this.angleToDraw = -1;
    this.lengthToDraw = -1;
    this.cannotTouchHole = false;
    this.type = 'primitive';
    this.pointsDefinition = {};
    this.setPointsFromDefinition = null;
    this.border = 'draw';
    this.touchBorder = 'draw';
    this.holeBorder = [[]];
  }

  _getStateProperties(options: { ignoreShown?: boolean }) {
    let { ignoreShown } = options;
    if (ignoreShown == null) {
      ignoreShown = false;
    }
    if (this.isShown || ignoreShown) {
      return [...super._getStateProperties(options),
        'pointsToDraw',
        'angleToDraw',
        'lengthToDraw',
        'cannotTouchHole',
        'drawingObject',
        'pointsDefinition',
      ];
    }
    return super._getStateProperties(options);
  }

  /**
   * Set angle to draw.
   *
   * Some primitive elements can be partially drawn to some angle.
   *
   * An angle of -1 represents the maximum angle allowed by the primitive.
   *
   * @param {number} angle Angle to draw
   */
  setAngleToDraw(angle: number = -1) {
    this.angleToDraw = angle;
  }


  click(glPoint: Point = new Point(0, 0)) {
    super.click(glPoint);
    if (this.drawingObject instanceof TextObjectBase) {
      this.drawingObject.click(
        glPoint.transformBy(this.spaceTransformMatrix('gl', 'draw')),
        this.fnMap,
      );
      if (this.recorder.state === 'recording') {
        this.recorder.recordEvent('elementTextClick', [this.getPath(), glPoint.x, glPoint.y]);
      }
    }
  }


  _dup(transform: Transform | null = null) {
    const primitive = new FigureElementPrimitive(this.drawingObject._dup());
    duplicateFromTo(this, primitive, ['parent', 'figure', 'recorder', 'pulseDefault.centerOn', 'timeKeeper']);
    if (transform != null) {
      primitive.transform = transform._dup();
    }
    if (
      typeof this.pulseDefault !== 'string'
      && typeof this.pulseDefault !== 'function'
    ) { // $FlowFixMe
      primitive.pulseDefault.centerOn = this.pulseDefault.centerOn;
    } else {
      primitive.pulseDefault = this.pulseDefault;
    }
    primitive.recorder = this.recorder;
    primitive.timeKeeper = this.timeKeeper;
    return primitive;
  }

  clear(canvasIndex: number = 0) {
    if (this.drawingObject instanceof TextObjectBase) {
      // $FlowFixMe
      this.drawingObject.clear(canvasIndex, this.pulseTransforms);
    }
  }

  resize(figureHTMLElement: ?HTMLElement = null) {
    this.resizeHtmlObject();
    super.resize(figureHTMLElement);
    // If gl canvas is resized, webgl text will need to be updated.
    if (this.drawingObject.type === 'vertexText') {
      const pixelToVertexScale = this.getPixelToVertexSpaceScale();
      // $FlowFixMe
      this.drawingObject.drawTextIntoBuffer(
        new Point(pixelToVertexScale.x, Math.abs(pixelToVertexScale.y)),
      );
    }
  }

  setColor(color: TypeColor, setDefault: boolean = true) {
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
    this.notifications.publish('color');
    if (this instanceof FigureElementPrimitive) {
      if (this.drawingObject instanceof TextObjectBase) {
        this.drawingObject.setColor(this.color);
      }
      if (this.drawingObject instanceof HTMLObject) {
        // $FlowFixMe
        this.drawingObject.element.style.color = colorArrayToRGBA(this.color);
      }
    }
  }

  setOpacity(opacity: number) {
    // this.color[3] = opacity;
    this.opacity = opacity;
    if (this instanceof FigureElementPrimitive) {
      if (this.drawingObject instanceof TextObjectBase) {
        this.drawingObject.setOpacity(opacity);
      }
      if (this.drawingObject instanceof HTMLObject) {
        this.drawingObject.element.style.opacity = `${opacity}`;
      }
    }
    this.animateNextFrame();
  }

  show() {
    super.show();
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.show = true;

      // This line is a challenge.
      // It will show a html element immediately before the next draw frame
      // meaning the draw matrix will be old.
      // If this line is removed, it causes a blanking between lesson pages
      // for html elements that are always on screen
      // Therefore, should use figure.setFirstTransform before using this,
      // or in the future remove this line, and the line in hide(), and
      // somehow do the hide in the draw call
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }

  hide() {
    super.hide();
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.show = false;
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }


  setFont(font: OBJ_Font, index: number = 0) {
    if (this.drawingObject instanceof TextObjectBase) {
      this.drawingObject.setFont(font, index);
    }
  }

  resizeHtmlObject() {
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }

  getBorderPoints(
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
  ): TypeBorder {
    if (border === 'border') {
      if (this.border === 'draw') {
        return this.drawBorder;
      }
      if (this.border === 'buffer') {
        return this.drawBorderBuffer;
      }
      if (this.border === 'rect') {
        return [getBoundingBorder(this.drawBorder)];
      }
      if (isBuffer(this.border)) {
        // $FlowFixMe
        return [getBoundingBorder(this.drawBorder, this.border)];
      } // $FlowFixMe
      return this.border;
    }

    if (border === 'touchBorder') {
      if (this.touchBorder === 'draw') {
        return this.drawBorder;
      }
      if (this.touchBorder === 'buffer') {
        return this.drawBorderBuffer;
      }
      if (this.touchBorder === 'border') {
        return this.getBorderPoints('border');
      }
      if (this.touchBorder === 'rect') {
        const b = this.getBorderPoints('border');
        return [getBoundingBorder(b)];
      }
      if (isBuffer(this.touchBorder)) {
        const b = this.getBorderPoints('border'); // $FlowFixMe
        return [getBoundingBorder(b, this.touchBorder)];
      } // $FlowFixMe
      return this.touchBorder;
    }
    return this.holeBorder;
  }

  setupDraw(now: number = 0) {
    if (this.isShown) {
      let timer;
      if (FIGURE1DEBUG) { timer = new PerformanceTimer(); }
      this.lastDrawTime = now;
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m1'); }
      this.notifications.publish('beforeDraw', [now]);
      if (this.beforeDrawCallback != null) {
        this.fnMap.exec(this.beforeDrawCallback, now);
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('beforeDraw'); }

      if (this.animations.animations.length > 0) {
        this.animations.nextFrame(now); // $FlowFixMe
      }
      if (FIGURE1DEBUG) { timer.stamp('animations'); }
      if (this.state.isMovingFreely) {
        this.nextMovingFreelyFrame(now);
      }

      if (FIGURE1DEBUG) { // $FlowFixMe
        timer.stamp('animations'); // $FlowFixMe
        const deltas = timer.deltas();
        if (window.figureOneDebug == null) {
          window.figureOneDebug = { setupDraw: [] };
        }
        window.figureOneDebug.setupDraw.push([
          this.getPath(),
          deltas[0],
          deltas.slice(1),
        ]);
      }
    }
  }

  draw(
    now: number,
    parentTransform: Array<Transform> = [new Transform()],
    parentOpacity: number = 1,
    canvasIndex: number = 0,
  ) {
    if (this.isShown) {
      let timer;
      if (FIGURE1DEBUG) { timer = new PerformanceTimer(); }
      // if (FIGURE1DEBUG) { debugTimes.push([performance.now(), '']); }
      let pointCount = -1;
      if (this.drawingObject instanceof VertexGeneric) {
        pointCount = this.drawingObject.numVertices;
        if (this.angleToDraw !== -1) {
          pointCount = this.drawingObject.getPointCountForAngle(this.angleToDraw);
        }
        if (this.lengthToDraw !== -1) {
          pointCount = this.drawingObject.getPointCountForLength(this.lengthToDraw);
        }
        if (this.pointsToDraw !== -1) {
          pointCount = this.pointsToDraw;
        }
      } else if (this.drawingObject instanceof GLObject) {
        pointCount = this.drawingObject.numVertices;
      } else {
        pointCount = 1;
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m1'); }

      const colorToUse = [...this.color.slice(0, 3), this.color[3] * this.opacity * parentOpacity];
      // eslint-disable-next-line prefer-destructuring
      this.lastDrawOpacity = colorToUse[3];
      const transform = this.getTransform()._dup();
      const newTransforms = transformBy(parentTransform, [transform]);
      // eslint-disable-next-line prefer-destructuring
      this.parentTransform = parentTransform;
      // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m2'); }

      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform[0].order.length,
        elementCount: this.transform.order.length,
      };

      this.pulseTransforms = this.getPulseTransforms(now); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m3'); }
      this.drawTransforms = this.getDrawTransforms(newTransforms); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m4'); }

      // eslint-disable-next-line prefer-destructuring
      this.lastDrawTransform = newTransforms[0];
      // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m5'); }
      // eslint-disable-next-line prefer-destructuring
      this.lastDrawPulseTransform = this.drawTransforms[0];
      if (pointCount > 0) {
        this.drawTransforms.forEach((t) => {
          this.drawingObject.drawWithTransformMatrix(
            t.matrix(), colorToUse, pointCount,
          );
        });
      }  // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m6'); }

      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
      this.notifications.publish('afterDraw', [now]);
      if (this.afterDrawCallback != null) {
        this.fnMap.exec(this.afterDrawCallback, now);
      }

      if (FIGURE1DEBUG) { // $FlowFixMe
        timer.stamp('m7'); // $FlowFixMe
        const deltas = timer.deltas();
        window.figureOneDebug.draw.push([
          this.getPath(),
          deltas[0],
          deltas.slice(1),
        ]);
      }
    }
  }

  setFirstTransform(parentTransform: Transform = new Transform()) {
    this.lastDrawElementTransformPosition = {
      parentCount: parentTransform.order.length,
      elementCount: this.transform.order.length,
    };
    this.parentTransform = [parentTransform];
    const firstTransform = parentTransform.transform(this.getTransform());
    this.lastDrawTransform = firstTransform._dup();
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.transformHtml(firstTransform.matrix());
    }
    this.checkMoveBounds();
  }

  increaseBorderSize(
    xMultiplierOrPoint: number | Point = 1,
    yMultiplier: number | null = null,
  ) {
    let xMulToUse;
    let yMulToUse;
    if (xMultiplierOrPoint instanceof Point) {
      xMulToUse = xMultiplierOrPoint.x;
      yMulToUse = xMultiplierOrPoint.y;
    } else {
      xMulToUse = xMultiplierOrPoint;
      if (yMultiplier == null) {
        yMulToUse = xMulToUse;
      } else {
        yMulToUse = yMultiplier;
      }
    }
    if (this.drawingObject instanceof VertexObject) {
      for (let b = 0; b < this.drawingObject.border.length; b += 1) {
        const border = this.drawingObject.border[b];
        for (let i = 0; i < border.length; i += 1) {
          border[i].x *= xMulToUse;
          border[i].y *= yMulToUse;
        }
      }
    }
  }
}

/*
...........######...#######..##.......##......
..........##....##.##.....##.##.......##......
..........##.......##.....##.##.......##......
..........##.......##.....##.##.......##......
..........##.......##.....##.##.......##......
..........##....##.##.....##.##.......##......
...........######...#######..########.########
*/
// ***************************************************************
// Collection of Geometry Objects or Collections
// ***************************************************************

/**
 * {@link FigureElementCollection} options object.
 * @property {TypeParsableTransform} [transform]
 * @property {TypeParsablePoint} [position] if defined, will overwrite first
 * translation of `transform`
 * @property {Rect} [limits] figure limits
 * @property {TypeColor} [color] default color
 * @property {FigureElement | null} [parent] parent of collection
 * @property {TypeBorder | 'children' | 'rect' | number} [border]
 * @property {TypeBorder | 'border' | number | 'rect'} [touchBorder]
 * @property {TypeBorder} [holeBorder]
 */
export type OBJ_FigureElementCollection = {
  transform?: TypeParsableTransform,
  position?: TypeParsablePoint,
  limits?: Rect,
  color?: TypeColor,
  parent?: FigureElement | null,
  border?: TypeBorder | 'children' | 'rect' | number,
  touchBorder?: TypeBorder | 'border' | number | 'rect',
  holeBorder?: TypeBorder,
};

/**
 * Collection figure element
 *
 * A collection manages a number of children {@link FigureElements}, be they
 * primitives or collections.
 *
 * A collection's transform will be passed onto all the children elements.
 *
 * @class
 * @extends FigureElement
 */
class FigureElementCollection extends FigureElement {
  elements: Object;
  drawOrder: Array<string>;
  border: TypeBorder | 'children' | 'rect' | number;
  // $FlowFixMe
  touchBorder: TypeParsableBuffer | TypeBorder | 'border' | 'children' | 'rect' | number;
  // $FlowFixMe
  holeBorder: TypeBorder | 'children';
  eqns: Object;
  collections: FigureCollections;

  +getElement: (?(string | FigureElement)) => ?FigureElement;
  +getElements: (TypeElementPath) => Array<FigureElement>;
  +exec: (string | Array<string | Object>, ?Array<string | FigureElement>) => void;
  +highlight: (elementsToDim: ?TypeElementPath) => void;

  childrenCanAnimate: boolean;

  /**
   * @param {OBJ_FigureElementCollection} options
   */
  constructor(options: OBJ_FigureElementCollection = {}): void {
    const defaultOptions = {
      transform: new Transform(),
      // position: [0, 0],
      limits: new Rect(-1, 1, 2, 2),
      parent: null,
      border: 'children',
      touchBorder: 'children',
      holeBorder: [[]],
      color: [0, 0, 0, 1],
      name: generateUniqueId('collection_'),
      timeKeeper: new TimeKeeper(),
    };
    const o = joinObjects({}, defaultOptions, options);
    super(getTransform(o.transform), o.limits, o.parent, o.name, o.timeKeeper);
    if (o.position != null) {
      this.transform.updateTranslation(getPoint(o.position));
    }
    this.elements = {};
    this.drawOrder = [];
    this.childrenCanAnimate = true;
    this.eqns = {};
    this.type = 'collection';
    this.setColor(o.color);

    if (o.border != null) {
      if (!isBuffer(o.border)) { // $FlowFixMe
        this.border = getBorder(o.border);
      } else {
        this.border = o.border;
      }
    }
    if (o.touchBorder != null) {
      if (!isBuffer(o.touchBorder)) { // $FlowFixMe
        this.touchBorder = getBorder(o.touchBorder);
      } else {
        this.touchBorder = o.touchBorder;
      }
    }
    if (o.holeBorder != null) { // $FlowFixMe
      this.holeBorder = getBorder(o.holeBorder);
    }
  }

  _getStateProperties(options: { ignoreShown?: boolean }) {
    let { ignoreShown } = options;
    if (ignoreShown == null) {
      ignoreShown = false;
    }
    if (this.isShown || ignoreShown) {
      return [...super._getStateProperties(options),
        'hasTouchableElements',
      ];
    }
    return [
      ...super._getStateProperties(options),
    ];
  }

  _getStatePropertiesMin() {
    return [
      ...super._getStatePropertiesMin(),
    ];
  }

  _dup(exceptions: Array<string> = []) {
    const collection = new FigureElementCollection({
    });
    const doNotDuplicate = this.drawOrder.map(e => `_${e}`);
    duplicateFromTo(this, collection, [
      'elements', 'drawOrder', 'parent', 'recorder', 'figure',
      'collections', 'pulseDefault.centerOn',
      ...doNotDuplicate, ...exceptions,
    ]);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const name = this.drawOrder[i];
      collection.add(name, this.elements[name]._dup());
    }
    collection.recorder = this.recorder;
    if (
      typeof this.pulseDefault !== 'string'
      && typeof this.pulseDefault !== 'function'
    ) { // $FlowFixMe
      collection.pulseDefault.centerOn = this.pulseDefault.centerOn;
    } else {
      collection.pulseDefault = this.pulseDefault;
    }

    return collection;
  }

  /**
   * Move child elements to end of draw order - effectively moving to the start
   * of the drawn collection. Later elements in the array will be further forward.
   * @param {Array<string | FigureElement> | string | FigureElement} elements
   */
  toFront(elementsIn: Array<string | FigureElement> | string | FigureElement) {
    let elements = elementsIn;
    if (!Array.isArray(elementsIn) || typeof elementsIn === 'string') {
      elements = [elementsIn];
    }
    const names = [];
    // $FlowFixMe
    elements.forEach((element) => {
      if (typeof element === 'string') {
        names.push(element);
      } else {
        names.push(element.name);
      }
    });
    const newOrder = [];
    this.drawOrder.forEach((element) => {
      if (names.indexOf(element) === -1) {
        newOrder.push(element);
      }
    });
    this.drawOrder = [...newOrder, ...names];
  }

  /**
   * Move child elements to start of draw order - effectively moving them to
   * the back of the drawn collection. Later elements in the `elements` array
   * will be drawn further back.
   * @param {Array<string | FigureElement> | string | FigureElement} elements
   */
  toBack(elementsIn: Array<string | FigureElement> | string | FigureElement) {
    let elements = elementsIn;
    if (typeof elementsIn === 'string' || !Array.isArray(elementsIn)) {
      elements = [elementsIn];
    }
    const names = [];
    // $FlowFixMe
    elements.forEach((element) => {
      if (typeof element === 'string') {
        names.push(element);
      } else {
        names.push(element.name);
      }
    });
    const newOrder = [];
    this.drawOrder.forEach((element) => {
      if (names.indexOf(element) === -1) {
        newOrder.push(element);
      }
    });
    this.drawOrder = [...names.reverse(), ...newOrder];
  }

  isAnyElementMoving(): boolean {
    if (this.isShown === false) {
      return false;
    }
    if (this.isMoving()) {
      return true;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isAnyElementMoving()) {
        return true;
      }
    }
    return false;
  }

  addElementWithName(
    name: string,
    element: FigureElement,
    index: number = -1,
  ) {
    // eslint-disable-next-line no-param-reassign
    element.parent = this;
    this.elements[name] = element;
    this.elements[name].name = name;
    // $FlowFixMe
    this[`_${name}`] = this.elements[name];
    if (index !== -1) {
      this.drawOrder = [
        ...this.drawOrder.slice(0, index),
        name,
        ...this.drawOrder.slice(index),
      ];
    } else {
      this.drawOrder.push(name);
    }
    if (this.figure != null) {
      element.setFigure(this.figure);
    }
    element.setFirstTransform(this.lastDrawTransform);
    this.animateNextFrame();
    return element;
  }


  /* eslint-disable max-len */
  /**
   * Add a figure element to this collection.
   *
   * If adding an array of elements, then the added elements will be returned
   * in an array (even if only one element is added). If not adding an array,
   * then that single element will be returned.
   *
   * @param {string | FigureElement | OBJ_AddElement | Array<FigureElement | OBJ_AddElement>} nameOrElementOrElementDefinition
    reference name of element
   * @param {FigureElement} elementToAdd element to add
   *
   * @return {Array<FigureElement> | FigureElement} added element, or array of
   * added elements
   *
   * @example
   * // Add name and element
   * const collection = figure.add({ make: 'collection' });
   * const element = figure.primitives.polygon({ radius: 1 });
   * collection.add('name', element);
   *
   * @example
   * // Element only (name will be autogenerated)
   * const collection = figure.add({ make: 'collection' });
   * const element = figure.primitives.polygon({ radius: 1 });
   * collection.add(element);
   *
   * @example
   * // Element definition (if no name is provided, then name will
   * // be auto generated)
   * const collection = figure.add({ make: 'collection' });
   * collection.add({
   *   make: 'polygon',
   *   radius: 1,
   * });
   *
   * @example
   * // Array of elements
   * const collection = figure.add({ make: 'collection' });
   * const polygon1 = figure.primitives.polygon({ radius: 1 });
   * collection.add([
   *   polygon1,
   *   {
   *     make: 'polygon',
   *     radius: 0.2,
   *     color: [0, 0, 1, 1],
   *   },
   * ]);
   */
  /* eslint-enable max-len */
  add(
    nameOrElementOrElementDefinition: string
        | FigureElement | OBJ_AddElement
        | Array<FigureElement | OBJ_AddElement>,
    elementToAdd: ?FigureElement = null,
  ) {
    if (typeof nameOrElementOrElementDefinition === 'string') {
      if (elementToAdd == null) {
        throw new Error(`Adding element ${nameOrElementOrElementDefinition} fail: Element is null`);
      }
      return this.addElementWithName(nameOrElementOrElementDefinition, elementToAdd);
    }
    let elements;
    if (!Array.isArray(nameOrElementOrElementDefinition)) {
      elements = [nameOrElementOrElementDefinition];
    } else {
      elements = nameOrElementOrElementDefinition;
    }

    const rootCollection = this;
    const addedElements = [];
    elements.forEach((elementDefinition, index) => {
      if (elementDefinition instanceof FigureElement) {
        addedElements.push( // $FlowFixMe
          this.add(elementDefinition.name, elementDefinition),
        );
        return;
      }
      // Extract the parameters from the layout object
      if (elementDefinition == null) {
        throw Error(`Add elements index ${index} does not exist in layout`);
      }
      const addElementsKey = 'elements';
      const nameToUse = elementDefinition.name || generateUniqueId('primitive_');
      const pathToUse = elementDefinition.path;
      let optionsToUse;
      if (elementDefinition.options != null) {
        optionsToUse = elementDefinition.options;
      } else {
        optionsToUse = elementDefinition;
      }
      // const optionsToUse = elementDefinition.options;
      const addElementsToUse = elementDefinition[addElementsKey];
      const methodPathToUse = elementDefinition.make;
      const elementModsToUse = elementDefinition.mods;
      const firstScenario = elementDefinition.scenario;

      let collectionPath;
      if (pathToUse == null || pathToUse === '') {
        collectionPath = rootCollection;
      } else {
        collectionPath = rootCollection.getElement(pathToUse);
      }
      // Check for critical errors
      if (nameToUse == null || nameToUse === '') {
        // $FlowFixMe
        throw new Error(`Figure addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing name property in ${elementDefinition}`);
      }
      if (methodPathToUse == null || methodPathToUse === '') {
        // $FlowFixMe
        throw new Error(`Figure addElement ERROR  at index ${index} in collection ${rootCollection.name}: missing method property in ${elementDefinition}`);
      }
      if (!(collectionPath instanceof FigureElementCollection)) {
        // $FlowFixMe
        throw new Error(`Figure addElement ERROR at index ${index} in collection ${rootCollection.name}: missing or incorrect path property in ${elementDefinition}`);
      }

      const methodPath = methodPathToUse.split('/');

      const method = this.getMethod(methodPathToUse);

      if (typeof method !== 'function') {
        return;
      }

      if (typeof method !== 'function') {
        throw new Error(`Layout addElement at index ${index} in collection ${rootCollection.name}: incorrect method property`);
      }

      let newElement;
      if (methodPath.slice(-1)[0].startsWith('add')) {
        newElement = method(collectionPath, nameToUse, optionsToUse);
        if (newElement == null) {
          return;
        }
        if (elementModsToUse != null && elementModsToUse !== {}) {
          newElement.setProperties(elementModsToUse);
        }
      } else {
        if (Array.isArray(optionsToUse)) {
          newElement = method(...optionsToUse);
        } else {
          newElement = method(optionsToUse);
        }
        if (newElement == null) {
          return;
        }
        if (elementModsToUse != null && elementModsToUse !== {}) {
          newElement.setProperties(elementModsToUse);
        }
        if (collectionPath instanceof FigureElementCollection) {
          collectionPath.add(nameToUse, newElement);
          addedElements.push(newElement);
        }
      }

      if (firstScenario != null && firstScenario in newElement.scenarios) {
        newElement.setScenario(firstScenario);
      }

      if (
        `_${nameToUse}` in rootCollection
          && (addElementsToUse != null && addElementsToUse !== {})
          && !methodPathToUse.endsWith('equation')
      ) {
        newElement.add(addElementsToUse);
        // addedElements.push(addElementsToUse);
      }
    });
    if (Array.isArray(nameOrElementOrElementDefinition)) {
      return addedElements;
    }
    if (addedElements.length === 1) {
      return addedElements[0];
    }

    return addedElements;
  }

  getMethod(make: string) {
    const getPath = (e: {}, remainingPath: Array<string>) => {
      if (!(remainingPath[0] in e)) {
        return null;
      }
      if (remainingPath.length === 1) {          // $FlowFixMe
        return e[remainingPath[0]];
      }                                          // $FlowFixMe
      return getPath(e[remainingPath[0]], remainingPath.slice(1));
    };
    const { collections } = this;
    const shapes = collections.primitives;
    const methods = {
      collection: collections.collection.bind(collections),
      polyline: shapes.polyline.bind(shapes),
      polygon: shapes.polygon.bind(shapes),
      rectangle: shapes.rectangle.bind(shapes),
      ellipse: shapes.ellipse.bind(shapes),
      gl: shapes.gl.bind(shapes),
      arc: shapes.arc.bind(shapes),
      triangle: shapes.triangle.bind(shapes),
      generic: shapes.generic.bind(shapes),
      grid: shapes.grid.bind(shapes),
      arrow: shapes.arrow.bind(shapes),
      line: shapes.line.bind(shapes),
      star: shapes.star.bind(shapes),
      //
      text: shapes.text.bind(shapes),
      textLine: shapes.textLine.bind(shapes),
      textLines: shapes.textLines.bind(shapes),
      'text.line': shapes.textLine.bind(shapes),
      'text.lines': shapes.textLines.bind(shapes),
      //
      textGL: shapes.textGL.bind(shapes),
      textHTML: shapes.htmlText.bind(shapes),
      htmlImage: shapes.htmlImage.bind(shapes),
      //
      opolyline: collections.polyline.bind(collections),
      oline: collections.line.bind(collections),
      angle: collections.angle.bind(collections),
      //
      addEquation: collections.addEquation.bind(collections),
      equation: collections.equation.bind(collections),
      // addNavigator: collections.addNavigator.bind(collections),
    };
    if (make in methods) {
      return methods[make];
    }
    const figure = {
      primitives: shapes,
      shapes,
      collections,
    };
    const splitMethod = make.split('.');
    let methodToUse = getPath(figure, splitMethod);
    if (methodToUse == null) {
      return null;
    }
    methodToUse = methodToUse.bind(getPath(figure, splitMethod.slice(0, -1)));
    return methodToUse;
  }

  setFigure(figure: OBJ_FigureForElement) {
    super.setFigure(figure);
    if (this.onAdd != null) {
      this.fnMap.exec(this.onAdd);
    }
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFigure(figure);
      if (element.onAdd != null) {
        this.fnMap.exec(element.onAdd);
      }
    }
  }

  willStartAnimating() {
    const result = super.willStartAnimating();
    if (result) {
      return true;
    }
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      if (this.elements[this.drawOrder[i]].willStartAnimating()) {
        return true;
      }
    }
    return false;
  }

  setupDraw(
    now: number = 0,
    canvasIndex: number = 0,
  ) {
    if (this.isShown) {
      let timer;
      if (FIGURE1DEBUG) { timer = new PerformanceTimer(); }

      this.lastDrawTime = now;
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      }
      if (this.beforeDrawCallback != null) {
        this.fnMap.exec(this.beforeDrawCallback, now);
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('beforePub'); }
      this.animations.nextFrame(now); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('animations'); }
      this.nextMovingFreelyFrame(now); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('moveFreely'); }

      // set next color can end up hiding an element when disolving out
      if (!this.isShown) {
        return;
      }

      if (this.childrenCanAnimate) {
        for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
          this.elements[this.drawOrder[i]].setupDraw(now, canvasIndex);
        }
      }
      if (FIGURE1DEBUG) { // $FlowFixMe
        timer.stamp('elements'); // $FlowFixMe
        const deltas = timer.deltas();
        window.figureOneDebug.setupDraw.push([
          '>>',
          this.getPath(),
          deltas[0],
          deltas.slice(1),
        ]);
      }
    }
  }

  draw(
    now: number,
    parentTransform: Array<Transform> = [new Transform()],
    parentOpacity: number = 1,
    canvasIndex: number = 0,
  ) {
    if (this.isShown) {
      let timer;
      if (FIGURE1DEBUG) { timer = new PerformanceTimer(); }

      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform[0].order.length,
        elementCount: this.transform.order.length,
      };
      const transform = this.getTransform();
      const newTransforms = transformBy(parentTransform, [transform]);
      // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m1'); }
      // eslint-disable-next-line prefer-destructuring
      this.lastDrawTransform = newTransforms[0];
      this.parentTransform = parentTransform;
      // $FlowFixMe

      if (FIGURE1DEBUG) { timer.stamp('m2'); }
      this.pulseTransforms = this.getPulseTransforms(now); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m3'); }
      this.drawTransforms = this.getDrawTransforms(newTransforms); // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m4'); }

      // eslint-disable-next-line prefer-destructuring
      this.lastDrawPulseTransform = this.drawTransforms[0];

      const opacityToUse = this.color[3] * this.opacity * parentOpacity;
      this.lastDrawOpacity = opacityToUse; // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m5'); }

      let drawTimer;
      if (FIGURE1DEBUG) { drawTimer = new PerformanceTimer(); }
      for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
        this.elements[this.drawOrder[i]].draw(
          now, this.drawTransforms, opacityToUse, canvasIndex,
        ); // $FlowFixMe
        if (FIGURE1DEBUG) { drawTimer.stamp(this.elements[this.drawOrder[i]].name); }
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m6'); }
      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      } // $FlowFixMe
      if (FIGURE1DEBUG) { timer.stamp('m7'); }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
      if (this.afterDrawCallback != null) {
        this.fnMap.exec(this.afterDrawCallback, now);
      }
      if (FIGURE1DEBUG) { // $FlowFixMe
        timer.stamp('m8'); // $FlowFixMe
        const deltas = timer.deltas(); // $FlowFixMe
        const drawDeltas = drawTimer.deltas();
        window.figureOneDebug.draw.push([
          '>>',
          this.getPath(),
          deltas[0],
          deltas.slice(1),
          drawDeltas,
        ]);
      }
    }
  }

  exec(
    execFunctionAndArgs: string | Array<string | Object>,
    elementsToExec: ?Array<string | FigureElement> = null,
  ) {
    if (elementsToExec == null) {
      super.exec(execFunctionAndArgs);
      return;
    }

    if (Array.isArray(elementsToExec) && elementsToExec.length === 0) {
      return;
    }

    elementsToExec.forEach((elementToExec) => {
      let element: ?FigureElement;
      if (typeof elementToExec === 'string') {
        element = this.getElement(elementToExec);
      } else {
        element = elementToExec;
      }
      if (element != null) {
        element.exec(execFunctionAndArgs);
      }
    });
  }

  pulse(
    optionsOrElementsOrDone: ?(
      OBJ_Pulse & { elements?: Array<string | FigureElement> }
      | Array<string | FigureElement>
      | ((mixed) => void)
    ) = null,
    done: ?((mixed) => void) = null,
  ) {
    if (optionsOrElementsOrDone == null
      || typeof optionsOrElementsOrDone === 'function'
      || typeof optionsOrElementsOrDone === 'string'
    ) {
      super.pulse(optionsOrElementsOrDone);
      return;
    }

    if (
      !Array.isArray(optionsOrElementsOrDone)
      && optionsOrElementsOrDone.centerOn != null
      && typeof optionsOrElementsOrDone.centerOn === 'string'
    ) {
      const e = this.getElement(optionsOrElementsOrDone.centerOn);
      if (e != null) {
        // eslint-disable-next-line no-param-reassign
        optionsOrElementsOrDone.centerOn = e;
      }
    }

    if (
      !Array.isArray(optionsOrElementsOrDone)
      && (
        optionsOrElementsOrDone.elements == null
        || optionsOrElementsOrDone.elements.length === 0
      )
    ) {
      super.pulse(optionsOrElementsOrDone);
      return;
    }

    let doneToUse;
    let options;
    let elements;
    if (Array.isArray(optionsOrElementsOrDone)) {
      options = {};
      doneToUse = done;
      elements = optionsOrElementsOrDone;
    } else {
      options = joinObjects({}, optionsOrElementsOrDone);
      ({ elements } = options);
      doneToUse = options.done;
      if (optionsOrElementsOrDone.scale == null) {
        options.scale = undefined;
      }
      if (optionsOrElementsOrDone.frequency == null) {
        options.frequency = undefined;
      }
      if (optionsOrElementsOrDone.duration == null) {
        options.duration = undefined;
      }
    }
    options.elements = null;

    let counter = 0;
    const combinedCallback = () => {
      counter += 1;
      if (counter === elements.length) {
        if (doneToUse != null) {
          doneToUse();
        }
      }
    };
    // $FlowFixMe
    options.done = combinedCallback;
    const m0 = this.spaceTransformMatrix('draw', 'figure');
    const translationBackup = options.translation;
    const minBackup = options.min;
    elements.forEach((elementToPulse) => {
      let element: ?FigureElement;
      if (typeof elementToPulse === 'string') {
        element = this.getElement(elementToPulse);
      } else {
        element = elementToPulse;
      }
      if (element != null) {
        // If different elements have different scales relative to each other
        // then they will move different distances. This is because the
        // pulseTransforms are applied after the full transform (including the
        // draw space elements of order). Therefore, normalize all scales to the
        // same scale as the collection.
        if (options.translation != null) {
          const m1 = element.spaceTransformMatrix('figure', 'draw');
          const scaleFactor = m1[0] / m0[0];
          options.translation *= scaleFactor;
          if (options.min != null) {
            options.min *= scaleFactor;
          }
        }
        element.pulse(options);
        if (translationBackup != null) {
          options.translation = translationBackup;
        }
        if (minBackup != null) {
          options.min = minBackup;
        }
      }
    });
  }

  /**
   * Get element from an element path with '.' separators.
   *
   * For instance, if a collection has a child collection 'a', which
   * has a child primitive 'b', then the path would be: 'a.b'.
   *
   * @see <a href="#figureelementcollectiongetelement">element.getElement</a>
   *
   * @param {null | string} elementPath
   * @return {FigureElement | null } element at path. If `elementPath`
   * is `null`, then this element is returned. If `elementPath` is invalid
   * then `null` is returned.
   *
   * @example
   * // Get all the elements from a figure
   * figure.add(
   *   {
   *     name: 'c',
   *     make: 'collection',
   *     elements: [
   *       {
   *         name: 'tri',
   *         make: 'triangle',
   *         height: 0.4,
   *         width: 0.4,
   *       },
   *       {
   *         name: 'text',
   *         make: 'text',
   *         text: 'triangle',
   *         position: [0, -0.4],
   *         xAlign: 'center',
   *       },
   *     ],
   *   },
   * );
   *
   * const c = figure.getElement('c');
   * // Elements within collections can be found with dot notation
   * const tri = figure.getElement('c.tri');
   * // Or the collection can be queried directly
   * const text = c.getElement('text');
   */
  getElement(elementPath: ?(string | FigureElement) = null) {
    if (elementPath == null) {
      return this;
    }
    if (typeof elementPath !== 'string') {
      return elementPath;
    }
    if (elementPath instanceof FigureElement) {
      return elementPath;
    }
    const getElement = (inputElementPath, parent) => {
      const ep = inputElementPath.split('.');
      let newParent = parent.elements[ep[0]];
      if (newParent == null) {
        // $FlowFixMe
        newParent = parent[ep[0]];
      }
      if (newParent == null) {
        return undefined;
      }
      if (ep.length > 1) {
        return getElement(ep.slice(1).join('.'), newParent);
      }
      return newParent;
    };
    return getElement(elementPath, this);
  }

  /**
   * Returns an array of result from
   * [getElement](#figureelementcollectiongetelement) calls on an
   * array of paths.
   *
   * @param {TypeElementPath} children
   * @return {Array<FigureElement>} Array of
   * [getElement](#figureelementcollectiongetelement) results
   */
  getElements(children: TypeElementPath) {
    // const paths = [];
    if (children == null) {
      return [];
    }
    const processPath = (path, prefix = '') => {
      if (typeof path === 'string') {
        return [`${prefix}${path}`];
      }
      if (path instanceof FigureElement) {
        return [path];
      }
      if (Array.isArray(path)) {
        const out = [];
        path.forEach((p) => {
          out.push(...processPath(p, prefix));
        });
        return out;
      }
      const out = [];
      Object.keys(path).forEach((p) => {
        out.push(...processPath(path[p], `${prefix}${p}.`));
      });
      return out;
    };
    const paths = processPath(children);
    const elements = [];
    paths.forEach((child) => {
      const element = this.getElement(child);
      if (element != null) {
        elements.push(element);
      }
    });
    return elements;
  }

  getShown() {
    if (this.isShown === false) {
      return [];
    }
    const shown = [[this.getPath(), this.uid, this]];
    this.drawOrder.forEach((elementName) => {
      const element = this.elements[elementName];
      shown.push(...element.getShown());
    });
    return shown;
  }

  /**
   * Returns an array of result from
   * [getElement](#figureelementcollectiongetelement) calls on an
   * array of paths. Same as `getElements` but more succinct
   *
   * @param {TypeElementPath} children
   * @return {Array<FigureElement>} Array of
   * [getElement](#figureelementcollectiongetelement) results
   */
  get(children: TypeElementPath) {
    if (typeof children === 'string') {
      return this.getElement(children);
    }
    return this.getElements(children);
  }

  getUid(uid: string) {
    if (uid === this.uid) {
      return this;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
    // this.drawOrder.forEach((elementName) => {
      const element = this.elements[this.drawOrder[i]];
      const result = element.getUid(uid);
      if (result !== null) {
        return result;
      }
    }
    // });
    return null;
  }


  /**
   * Show collection or specific elements within the collection
   */
  show(toShow: TypeElementPath = []): void {
    super.show();
    this.getElements(toShow).forEach((element) => {
      element.showAll();
    });
  }

  showOnly(
    toShow: TypeElementPath = [],
  ): void {
    this.hideAll();
    this.show(toShow);
  }

  showAll(): void {
    super.show();
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.showAll();
    }
  }

  /**
   * Hide collection or specific elements within the collection
   */
  hide(
    toHide: TypeElementPath | null = null,
  ): void {
    if (toHide == null) {
      super.hide();
      return;
    }
    this.getElements(toHide).forEach((element) => {
      element.hide();
    });
  }

  hideAll(): void {
    this.hide();
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.hide();
      if (typeof element.hideAll === 'function') {
        element.hideAll();
      }
    }
  }

  hideOnly(listToHide: TypeElementPath): void {
    this.showAll();
    this.hide(listToHide);
  }


  resizeHtmlObject() {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.resizeHtmlObject();
    }
  }

  resize(figureHTMLElement: ?HTMLElement = null) {
    super.resize(figureHTMLElement);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.resize(figureHTMLElement);
    }
  }

  clear(canvasIndex: number = 0) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.clear(canvasIndex);
    }
  }

  updateDrawTransforms(
    parentTransform: Array<Transform> = [new Transform()],
    isSame: boolean = false,
  ) {
    super.updateDrawTransforms(parentTransform, isSame);
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      this.elements[this.drawOrder[i]].updateDrawTransforms(
        this.drawTransforms, isSame,
      );
    }
  }

  setFirstTransform(parentTransform: Transform = new Transform()) {
    const firstTransform = parentTransform.transform(this.getTransform());
    this.lastDrawTransform = firstTransform._dup();
    this.parentTransform = [parentTransform];

    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFirstTransform(firstTransform);
    }
    this.checkMoveBounds();
  }

  // border is whatever border is
  // children is touch borders of children
  // rect is rect of children touchBorder
  // number is buffer of rect of children touch border
  getBorderPoints(
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
    children: Array<string | FigureElement> | null = null,
    shownOnly: boolean = true,
  ): TypeBorder {
    const getBorderFromChildren = (b) => {
      const childrenBorder = [];
      let childrenToUse = children;
      if (childrenToUse == null) {
        childrenToUse = Object.keys(this.elements);
      }
      if (childrenToUse.length === 0) {
        return [[]];
      }
      childrenToUse.forEach((child) => {
        const e = this.getElement(child);
        if (
          e == null
          || (shownOnly && e.isShown === false)
        ) {
          return;
        }
        // $FlowFixMe
        childrenBorder.push(...e.getBorder('local', b, null, shownOnly));
      });
      return childrenBorder;
    };

    if (border === 'border') {
      if (this.border === 'children') {
        return getBorderFromChildren('border');
      }
      if (this.border === 'rect') { // $FlowFixMe
        return [getBoundingBorder(getBorderFromChildren('border'))];
      }
      if (isBuffer(this.border)) { // $FlowFixMe
        return [getBoundingBorder(getBorderFromChildren('border'), this.border)];
      } // $FlowFixMe
      return this.border;
    }
    if (border === 'touchBorder') {
      if (this.touchBorder === 'border') {
        return this.getBorderPoints('border', children, shownOnly);
      }
      if (this.touchBorder === 'children') {
        return getBorderFromChildren('touchBorder');
      }
      if (this.touchBorder === 'rect') { // $FlowFixMe
        return [getBoundingBorder(getBorderFromChildren('touchBorder'))];
      }
      if (isBuffer(this.touchBorder)) { // $FlowFixMe
        return [getBoundingBorder(getBorderFromChildren('touchBorder'), this.touchBorder)];
      } // $FlowFixMe
      return this.touchBorder;
    }
    if (this.holeBorder === 'children') {
      return getBorderFromChildren('holeBorder');
    }
    return this.holeBorder;
  }

  getBorder(
    space: TypeSpace | Array<number> = 'local',
    border: 'touchBorder' | 'border' | 'holeBorder' = 'border',
    children: ?Array<string | FigureElement> = null,
    shownOnly: boolean = true,
  ) {
    if (shownOnly && this.isShown === false) {
      return [[]];
    }
    let matrix;
    if (Array.isArray(space)) {
      matrix = m2.mul(space, this.getTransform().matrix());
    } else {
      matrix = this.spaceTransformMatrix('draw', space);
    }
    const borderPoints = this.getBorderPoints(border, children, shownOnly);
    return borderPoints.map(b => b.map(p => getPoint(p).transformBy(matrix)));
  }

  getBoundingRect(
    space: TypeSpace = 'local',
    border: 'touchBorder' | 'border' | 'holeBorder' = 'border',
    children: ?Array<string | FigureElement> = null,
    shownOnly: boolean = true,
  ) {
    const transformedBorder = this.getBorder(space, border, children, shownOnly);
    // $FlowFixMe
    return getBoundingRect(transformedBorder);
  }

  getRelativeBoundingRect(
    space: TypeSpace = 'local',
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
    children: ?Array<string | FigureElement> = null,
    shownOnly: boolean = true,
  ) {
    const rect = this.getBoundingRect(space, border, children, shownOnly);
    const position = this.getPosition(space);
    return new Rect(
      rect.left - position.x,
      rect.bottom - position.y,
      rect.width,
      rect.height,
    );
  }

  getPositionInBounds(
    space: TypeSpace = 'local',
    xAlign: 'center' | 'left' | 'right' | 'location' | number = 'location',
    yAlign: 'middle' | 'top' | 'bottom' | 'location' | number = 'location', // $FlowFixMe
    children: ?Array<string | FigureElement> = null,
    border: 'border' | 'touchBorder' | 'holeBorder' = 'border',
    shownOnly: boolean = true,
  ) {
    const bounds = this.getBoundingRect(space, border, children, shownOnly);
    const p = this.getPosition(space);
    if (xAlign === 'left') {
      p.x = bounds.left;
    } else if (xAlign === 'right') {
      p.x = bounds.right;
    } else if (xAlign === 'center') {
      p.x = bounds.left + bounds.width / 2;
    } else if (typeof xAlign === 'number') {
      p.x = bounds.left + bounds.width * xAlign;
    }
    if (yAlign === 'top') {
      p.y = bounds.top;
    } else if (yAlign === 'bottom') {
      p.y = bounds.bottom;
    } else if (yAlign === 'middle') {
      p.y = bounds.bottom + bounds.height / 2;
    } else if (typeof yAlign === 'number') {
      p.y = bounds.bottom + bounds.height * yAlign;
    }
    return p;
  }

  updateLimits(
    limits: Rect,
    transforms: OBJ_SpaceTransforms = this.figureTransforms,
  ) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.updateLimits(limits, transforms);
    }
    this.figureLimits = limits;
    this.figureTransforms = transforms;
  }

  updateHTMLElementTie(
    container: HTMLElement,
  ) {
    super.updateHTMLElementTie(
      container,
    );
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.updateHTMLElementTie(
        container,
      );
    }
  }

  // Returns an array of touched elements.
  // In a collection, elements defined later in the collection.order
  // array are on top of earlier elements. The touched array
  // is sorted to have elements on top first, where the collection containing
  // the elements will be before it's elements. For example, the array
  // would be ordered as:
  //  0: top collection
  //  1 to n: n top elements in collection
  //  n+1: second top collection
  //  n+2 to m: top elements in second top colleciton.
  getTouched(glLocation: Point): Array<FigureElement> {
    if (!this.isTouchable && !this.hasTouchableElements) {
      return [];
    }
    let touched = [];
    if (this.isTouchable) {
      return super.getTouched(glLocation);
    }
    for (let i = this.drawOrder.length - 1; i >= 0; i -= 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown === true) {
        touched = touched.concat(element.getTouched(glLocation));
      }
    }
    return touched;
  }

  stop(
    how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel',
    elementOnly: boolean = false,
  ) {
    super.stop(how);
    if (elementOnly) {
      return;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.stop(how, elementOnly);
    }
  }

  setFont(fontSize: number) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFont(fontSize);
    }
  }

  setColor(color: TypeColor = [0, 0, 0, 1], setDefault: boolean = true) {
    const nonNullColor = color != null ? color : [0, 0, 0, 0];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setColor(nonNullColor, setDefault);
    }
    this.color = nonNullColor.slice();
    this.notifications.publish('color');
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
  }

  setDimColor(color: TypeColor = [0, 0, 0, 1]) {
    const nonNullColor = color != null ? color : [0, 0, 0, 0];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setDimColor(nonNullColor);
    }
    this.dimColor = nonNullColor.slice();
  }

  undim(children: ?TypeElementPath) {
    let elements;
    if (children != null) {
      elements = this.getElements(children);
    } else {
      this.color = this.defaultColor.slice();
      elements = this.drawOrder.map(name => this.elements[name]);
    }
    elements.forEach(element => element.undim());
  }

  dim(children: ?TypeElementPath) {
    let elements;
    if (children != null) {
      elements = this.getElements(children);
    } else {
      this.color = this.dimColor.slice();
      elements = this.drawOrder.map(name => this.elements[name]);
    }
    elements.forEach(element => element.dim());
  }

  highlight(elementsToHighlight: ?TypeElementPath = null) {
    if (elementsToHighlight == null) {
      this.undim();
      return;
    }

    const elements = this.getElements(elementsToHighlight);
    this.dim(); // $FlowFixMe
    this.exec('undim', elements);
  }


  getElementTransforms() {
    const out = {};
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      out[element.name] = element.transform._dup();
    }
    return out;
  }

  setElementTransforms(elementTransforms: Object) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.name in elementTransforms) {
        element.transform = elementTransforms[element.name];
        if (element.internalSetTransformCallback) {
          this.fnMap.exec(element.internalSetTransformCallback, element.transform);
        }
      }
    }
  }

  reorder() {
    this.drawOrder.sort((a, b) => {
      const elemA = this.elements[a];
      const elemB = this.elements[b];
      return elemB.drawPriority - elemA.drawPriority;
    });
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof FigureElementCollection) {
        element.reorder();
      }
    }
  }

  // }
  animateToTransforms(
    elementTransforms: Object,
    time: number = 1,
    delay: number = 0,
    rotDirection: number = 0,
    callback: ?(string | ((?mixed) => void)) = null,
    name: string = '',
    easeFunction: string | ((number) => number) = 'tools.math.easeinout',
  ) {
    let callbackMethod = callback;
    let timeToAnimate = 0;
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.name in elementTransforms) {
        if (element.isShown) {
          if (!elementTransforms[element.name].isEqualTo(element.transform)) {
            element.animations.new(name)
              .delay(delay)
              .transform({
                target: elementTransforms[element.name],
                duration: time,
                rotDirection,
                progression: easeFunction,
                onFinish: callbackMethod,
              })
              .start();
            // only want to send callback once
            callbackMethod = null;
            timeToAnimate = time + delay;
          }
        } else {
          element.transform = elementTransforms[element.name]._dup();
          if (element.internalSetTransformCallback) {
            this.fnMap.exec(element.internalSetTransformCallback, element.transform);
          }
        }
      }
    }
    if (timeToAnimate === 0 && callbackMethod != null) {
      this.fnMap.exec(callbackMethod, true);
      // callbackMethod(true);
    }
    return timeToAnimate;
  }

  /**
   * Get all elements within the collection that are primitives, including
   * any primitives that are children of this element, and any primitives that
   * are children of this element's children and so forth.
   *
   * @return {Array<FigureElement>}
   */
  getAllPrimitives() {
    let elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof FigureElementCollection) {
        elements = [...elements, ...element.getAllPrimitives()];
      } else {
        elements.push(element);
      }
    }
    return elements;
  }

  /**
   * Get an array of all elements of in this collection, including this element,
   * children, children of children and so forth.
   *
   * @return {Array<FigureElement>}
   */
  getAllElements() {
    const elements = [this];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      // elements.push(element);
      if (element instanceof FigureElementCollection) {
        elements.push(...element.getAllElements());
      } else {
        elements.push(element);
      }
    }
    return elements;
  }

  /**
   * Get array of all children elements.
   *
   * @return {Array<FigureElement>}
   */
  getChildren() {
    const elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      elements.push(element);
    }
    return elements;
  }

  getAllElementsWithScenario(scenario: string) {
    let elements = super.getAllElementsWithScenario(scenario);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      elements = [...elements, ...element.getAllElementsWithScenario(scenario)];
    }
    return elements;
  }

  getNextAnimationFinishTime() {
    if (this.simple) {
      return 0;
    }
    // const elements = this.getAllElements();
    let remainingTime = super.getNextAnimationFinishTime();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      if (!this.elements[this.drawOrder[i]].simple) {
        const element = this.elements[this.drawOrder[i]];
        const duration = element.getNextAnimationFinishTime();
        if (
          (remainingTime == null && duration != null && duration > 0)
          || (
            remainingTime != null
            && duration != null
            && duration < remainingTime
            && duration > 0
          )
        ) {
          remainingTime = duration;
        }
      }
    }
    return remainingTime;
  }

  getRemainingAnimationTime(
    animationNames: Array<string> | string = [],
  ) {
    const elements = this.getAllElements();
    let remainingTime = super.getRemainingAnimationTime(animationNames);
    elements.forEach((element) => {
      const duration = element.animations.getRemainingTime(animationNames);
      if (duration > remainingTime) {
        remainingTime = duration;
      }
    });
    return remainingTime;
  }


  // Get all ineractive elemnts, but only go as deep as a
  // FigureElementColleciton if it is touchable or movable
  getAllPossiblyInteractiveElements() {
    let elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      // if (element.isShown) {
      if (element instanceof FigureElementCollection) {
        if (!element.isTouchable
          && !element.isMovable
          && element.hasTouchableElements
          && (!element.isInteractive || element.isInteractive == null)
        ) {
          elements = [...elements, ...element.getAllPossiblyInteractiveElements()];
        }
      }
      if (element.isInteractive !== undefined
        || element.isTouchable
        || element.isMovable
      ) {
        elements.push(element);
      }
    }
    return elements;
  }

  // This method is here as a convenience method for content item selectors
  // eslint-disable-next-line class-methods-use-this
  goToStep(step: number) {
    const elem = document.getElementById('id__figureone_item_selector_0');
    const elems = [];
    if (elem != null) {
      if (elem.children.length > 0) {
        for (let i = 0; i < elem.children.length; i += 1) {
          elems.push(elem.children[i]);
        }
      }
    }
    elems.forEach((e, index) => {
      if (index === step) {
        e.classList.add('figureone__item_selector_selected');
      } else {
        e.classList.remove('figureone__item_selector_selected');
      }
    });
  }

  setMovable(movable: boolean = true) {
    super.setMovable(movable);
    if (movable) {
      this.hasTouchableElements = true;
    }
  }


  setupWebGLBuffers(newWebgl: WebGLInstance) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setupWebGLBuffers(newWebgl);
    }
  }

  changeWebGLInstance(newWebgl: WebGLInstance) {
    let oldInstance;
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      oldInstance = element.changeWebGLInstance(newWebgl);
    }
    return oldInstance;
  }

  getLoadingElements() {
    let elems = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof FigureElementPrimitive) {
        if (element.drawingObject.state === 'loading') {
          elems.push(element);
        }
      } else {
        elems = [...elems, ...element.getLoadingElements()];
      }
    }
    return elems;
  }

  setPointsFromDefinition() {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.setPointsFromDefinition != null) {
        element.setPointsFromDefinition();
      }
    }
  }

  setPrimitiveColors() {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof FigureElementPrimitive) {
        element.setColor(element.color, false);
        element.setOpacity(element.opacity);
      } else {
        element.setPrimitiveColors();
      }
    }
  }

  unrenderAll() {
    this.unrender();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof FigureElementPrimitive) {
        element.unrender();
      } else {
        element.unrenderAll();
      }
    }
  }


  /**
   * Set transform, color and/or visibility to a predefined scenario.
   *
   * @param {string | Array<string>} [scenarioName] name of the scenario to
   * set. Use an array of names to set multiple scenarios in the array's order.
   * @param {boolean} [onlyIfVisible] `true` to only set scenario if element is
   * visible
   */
  setScenarios(
    scenarioName: string | Array<string>,
    onlyIfVisible: boolean = false,
  ) {
    super.setScenarios(scenarioName);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if ((onlyIfVisible && element.isShown) || onlyIfVisible === false) {
        element.setScenarios(scenarioName, onlyIfVisible);
      }
    }
  }

  saveScenarios(scenarioName: string, keys: Array<string>) {
    super.saveScenarios(scenarioName, keys);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.saveScenarios(scenarioName, keys);
    }
  }

  animateToState(
    state: Object,
    options: Object,
    independentOnly: boolean = false,
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    let duration = 0;
    duration = super.animateToState(
      state, options, independentOnly, startTime,
    );
    if (
      this.dependantTransform === false
      || independentOnly === false
    ) {
      for (let i = 0; i < this.drawOrder.length; i += 1) {
        const element = this.elements[this.drawOrder[i]];
        if (state.elements != null && state.elements[this.drawOrder[i]] != null) {
          const elementDuration = element.animateToState(
            state.elements[this.drawOrder[i]], options,
            independentOnly, // countStart, countEnd,
            startTime,
          );
          if (elementDuration > duration) {
            duration = elementDuration;
          }
        }
      }
    }
    return duration;
  }

  dissolveInToState(
    state: Object,
    durationIn: number = 0.8,
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    let duration = 0;
    duration = super.dissolveInToState(state, durationIn, startTime);
    if (duration === 0) {
      return 0;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (state.elements != null && state.elements[this.drawOrder[i]] != null) {
        const elementDuration = element.dissolveInToState(
          state.elements[this.drawOrder[i]], durationIn, startTime,
        );
        if (elementDuration > duration) {
          duration = elementDuration;
        }
      }
    }
    return duration;
  }

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setTimeDelta(delta);
    }
  }

  isStateSame(
    state: Object,
    mergePulseTransforms: boolean = false,
    exceptions: Array<string> = [],
  ) {
    const thisElementResult = super.isStateSame(state, mergePulseTransforms, exceptions);
    if (thisElementResult === false) {
      return false;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (state.elements != null && state.elements[this.drawOrder[i]] != null) {
        const elementResult = element.isStateSame(
          state.elements[this.drawOrder[i]], mergePulseTransforms, exceptions,
        );
        if (elementResult === false) {
          return false;
        }
      }
    }
    return true;
  }

  clearFrozenPulseTransforms() {
    super.clearFrozenPulseTransforms();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.clearFrozenPulseTransforms();
    }
  }

  freezePulseTransforms(forceOverwrite: boolean = true) {
    super.freezePulseTransforms(forceOverwrite);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.freezePulseTransforms(forceOverwrite);
    }
  }

  isAnimating(): boolean {
    if (this.isShown === false) {
      return false;
    }
    if (super.isAnimating()) {
      return true;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isAnimating()) {
        return true;
      }
    }
    return false;
  }

  remove(elementName: string) {
    if (this.elements[elementName] == null) {
      return;
    }
    const element = this.elements[elementName];
    element.animations.cancelAll('freeze', true);
    element.stop();
    element.parent = null;
    element.animations = null;
    element.move.element = null;
    element.recorder = null;
    element.figure = null;
    delete this.elements[`_${elementName}`];
    delete this.elements[elementName];
    const index = this.drawOrder.indexOf(elementName);
    if (index !== -1) {
      this.drawOrder.splice(index, 1);
    }
  }

  stopAnimating(
    how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel',
    name: string | null = null,
    includeChildren: boolean = true,
  ) {
    super.stopAnimating(how, name);
    if (includeChildren) {
      for (let i = 0; i < this.drawOrder.length; i += 1) {
        const element = this.elements[this.drawOrder[i]];
        element.stopAnimating(how, name, includeChildren);
      }
    }
  }

  stateSet() {
    super.stateSet();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      this.elements[this.drawOrder[i]].stateSet();
    }
  }

  _state(
    options: {
      precision?: number,
      ignoreShown?: boolean,
      min?: boolean,
      returnF1Type?: boolean,
    } = {},
  ) {
    let state;
    let { returnF1Type } = options;
    if (returnF1Type == null) {
      returnF1Type = true;
    }
    if (returnF1Type) {
      return {
        f1Type: 'de',
        state: this.getPath(),
      };
    }
    const tempOptions = joinObjects({}, options, { returnF1Type: true });
    if (tempOptions.min) {
      state = getState(this, this._getStatePropertiesMin(), tempOptions);
    } else {
      state = getState(this, this._getStateProperties(tempOptions), tempOptions);
    }
    const elements = getState(this.elements, Object.keys(this.elements), options);
    state.elements = elements;
    return state;
  }

  align(
    xAlign: 'left' | 'center' | 'right' | number,
    yAlign: 'bottom' | 'middle' | 'top' | number,
  ) {
    const bounds = this.getBoundingRect('draw');
    const offset = new Point(0, 0);
    if (xAlign === 'left') {
      offset.x = -bounds.left;
    } else if (xAlign === 'center') {
      offset.x = -bounds.left + bounds.width / 2;
    } else if (xAlign === 'right') {
      offset.x = -bounds.right;
    } else {
      offset.x = -bounds.left + bounds.width * xAlign;
    }
    if (yAlign === 'bottom') {
      offset.y = -bounds.bottom;
    } else if (yAlign === 'middle') {
      offset.y = -bounds.bottom + bounds.height / 2;
    } else if (yAlign === 'top') {
      offset.y = -bounds.top;
    } else {
      offset.y = -bounds.bottom + bounds.height * yAlign;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      const p = element.transform.t();
      element.transform.updateTranslation(p.add(offset));
    }
  }
}

export {
  FigureElementPrimitive, FigureElementCollection,
  FigureElement,
};
