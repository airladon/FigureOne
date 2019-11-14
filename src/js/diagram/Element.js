// @flow

import {
  Transform, Point, TransformLimit, Rect,
  Translation, spaceToSpaceTransform, getBoundingRect,
  Scale, Rotation, Line, getMaxTimeFromVelocity, clipAngle,
  getPoint,
} from '../tools/g2';
import type { TypeParsablePoint } from '../tools/g2';
import * as m2 from '../tools/m2';
// import type { pathOptionsType, TypeRotationDirection } from '../tools/g2';
import * as tools from '../tools/math';
import HTMLObject from './DrawingObjects/HTMLObject/HTMLObject';
import DrawingObject from './DrawingObjects/DrawingObject';
import VertexObject from './DrawingObjects/VertexObject/VertexObject';
import { TextObject } from './DrawingObjects/TextObject/TextObject';
import { duplicateFromTo, joinObjects } from '../tools/tools';
import { colorArrayToRGBA } from '../tools/color';
// import GlobalAnimation from './webgl/GlobalAnimation';
// import DrawContext2D from './DrawContext2D';

import type { TypeSpaceTransforms } from './Diagram';
import type {
  TypePositionAnimationStepInputOptions, TypeAnimationBuilderInputOptions,
  TypeColorAnimationStepInputOptions, TypeTransformAnimationStepInputOptions,
  TypeRotationAnimationStepInputOptions, TypeScaleAnimationStepInputOptions,
  TypePulseAnimationStepInputOptions, TypeOpacityAnimationStepInputOptions,
  TypeParallelAnimationStepInputOptions,
} from './Animation/Animation';
import * as animations from './Animation/Animation';
import WebGLInstance from './webgl/webgl';

// eslint-disable-next-line import/no-cycle
// import {
//   AnimationPhase, ColorAnimationPhase, CustomAnimationPhase,
// } from './AnimationPhase';

// function checkCallback(callback: ?(boolean) => void): (boolean) => void {
//   let callbackToUse = () => {};
//   if (typeof callback === 'function') {
//     callbackToUse = callback;
//   }
//   return callbackToUse;
// }

export type TypeScenario = {
  position?: TypeParsablePoint,
  rotation?: number,
  scale?: TypeParsablePoint,
};


// A diagram is composed of multiple diagram elements.
//
// A diagram element can either be a:
//  - Primitive: a basic element that has the webGL vertices, color
//  - Collection: a group of elements (either primatives or collections)
//
// A diagram element can be:
//  - transformed (resized, offset, rotated)
//  - animated (planned transform over time)
//  - moved with control (like dragging)
//  - moving freely (dragged then let go with an initial velocity)
//  - Pulsed
//
// This class manages:
//  - The diagram element
//  - Its current transformation
//  - Its animation plan, animation control and animation state
//  - Its movement state
//  - Its pulsing parameters
//
// A diagram element has an associated persistant transform that describes how
// to draw it. The transform includes any translation, rotation and/or scaling
// the element should be transformed by before drawing.
//
// If the diagram element is a collection of elements, then this transform is
// applied to all the child elements. Each child element will have it's own
// transform as well, and it will be multiplied by the parent transform.
//
// Whenever an element animated or moved, it's persistant transform is updated.
//
// Pulsing does not update an element's persistant transform, but does alter
// the element's current transform used for drawing itself and any children
// elements it has.
//
class DiagramElement {
  transform: Transform;        // Transform of diagram element
  // presetTransforms: Object;       // Convenience dict of transform presets
  lastDrawTransform: Transform; // Transform matrix used in last draw
  // lastDrawParentTransform: Transform;
  // lastDrawElementTransform: Transform;
  // lastDrawPulseTransform: Transform;
  lastDrawElementTransformPosition: {parentCount: number, elementCount: number};

  parent: DiagramElement | null;

  isShown: boolean;                  // True if should be shown in diagram
  name: string;                   // Used to reference element in a collection

  isMovable: boolean;             // Element is able to be moved
  isTouchable: boolean;           // Element can be touched
  isInteractive: ?boolean;         // Touch event is not processed by Diagram
  hasTouchableElements: boolean;

  drawPriority: number;

  // Callbacks
  onClick: ?(?mixed) => void;
  setTransformCallback: (Transform) => void; // element.transform is updated

  color: Array<number>;           // For the future when collections use color
  defaultColor: Array<number>;
  dimColor: Array<number>;
  opacity: number;
  noRotationFromParent: boolean;

  interactiveLocation: Point;   // this is in vertex space

  move: {
    maxTransform: Transform,
    minTransform: Transform,
    boundary: ?Rect | Array<number> | 'diagram',
    limitLine: null | Line,
    maxVelocity: TransformLimit;            // Maximum velocity allowed
    // When moving freely, the velocity decelerates until it reaches a threshold,
  // then it is considered 0 - at which point moving freely ends.
    freely: {                 // Moving Freely properties
      zeroVelocityThreshold: TransformLimit,  // Velocity considered 0
      deceleration: TransformLimit,           // Deceleration
      callback: ?(boolean) => void,
    };
    bounce: boolean;
    canBeMovedAfterLoosingTouch: boolean;
    type: 'rotation' | 'translation' | 'scaleX' | 'scaleY' | 'scale';
    // eslint-disable-next-line no-use-before-define
    element: DiagramElementCollection | DiagramElementPrimitive | null;
  };

  scenarios: {
    [scenarioName: string]: TypeScenario;
  };

  type: 'collection' | 'primitive';

  pulseSettings: {
    time: number,
    frequency: number,
    A: number | Array<number>,
    B: number | Array<number>,
    C: number | Array<number>,
    style: (number, number, number, number, number) => number,
    num: number,
    transformMethod: (number) => Transform,
    callback: ?(mixed) => void;
  };

  pulseDefault: ((?() => void) => void) | {
    scale: number,
    time: number,
    frequency: number,
  };


  diagramLimits: Rect;
  diagramTransforms: TypeSpaceTransforms;

  // Current animation/movement state of element
  state: {
    isBeingMoved: boolean,
    isMovingFreely: boolean,
    movement: {
      previousTime: number,
      previousTransform: Transform,
      velocity: Transform,           // current velocity - will be clipped
                                        // at max if element is being moved
                                        // faster than max.
    },
    isPulsing: boolean,
    pulse: {
      startTime: number,
    },
  };

  animations: animations.AnimationManager;

  // pulse: Object;                  // Pulse animation state

  uid: string;

  // Rename to animate in future
  anim: Object;

  // pulse: (mixed) => void;
  // pulse: (?Array<string | DiagramElement> | mixed) => void;
  +pulse: (any, ?any) => void;
  +exec: (any, any) => void;
  +getElement: (any) => ?DiagramElement;
  +highlight: (any) => void;
  // +pulse: (Array<string | DiagramElement>) => void;

  // This will scale and position this element such that the center of the
  // diagram limits will will look like it is centered on a html element
  // when this figurone element is drawn.
  // Scale can be:
  //  1em: diagram units will be scaled so 0.2 diagram units (default
  //       font size) looks like 1em of the element font size in pixels
  //  100px: diagram units will be scaled so that the max diagram limit
  //         with be the pixel count
  //  stretch: diagram units be stretched so diagram limits extend to
  //           element dimensions independently in x and y
  //  max: -1 to 1 diagram units will be scaled to max dimension of element
  //  fit: diagram units will be scaled so that diagram limits aspect ratio
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

  constructor(
    transform: Transform = new Transform(),
    diagramLimits: Rect = new Rect(-1, -1, 2, 2),
    parent: DiagramElement | null = null,
  ) {
    this.name = ''; // This is updated when an element is added to a collection
    this.uid = (Math.random() * 1e18).toString(36);
    this.isShown = true;
    this.transform = transform._dup();
    this.isMovable = false;
    this.isTouchable = false;
    this.isInteractive = undefined;
    this.hasTouchableElements = false;
    this.color = [1, 1, 1, 1];
    this.dimColor = [0.5, 0.5, 0.5, 1];
    this.defaultColor = this.color.slice();
    this.opacity = 1;
    this.setTransformCallback = () => {};
    this.lastDrawTransform = this.transform._dup();
    this.onClick = null;
    this.lastDrawElementTransformPosition = {
      parentCount: 0,
      elementCount: 0,
    };
    this.parent = parent;
    this.drawPriority = 1;
    this.noRotationFromParent = false;
    // this.pulseDefault = (callback: ?() => void = null) => {
    //   this.pulseScaleNow(1, 2, 0, callback);
    // };
    this.pulseDefault = {
      frequency: 0,
      scale: 2,
      time: 1,
    };

    // Rename to animate in future
    this.anim = {
      rotation: (...optionsIn: Array<TypeRotationAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.RotationAnimationStep(options);
      },
      scale: (...optionsIn: Array<TypeScaleAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.ScaleAnimationStep(options);
      },
      position: (...optionsIn: Array<TypePositionAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.PositionAnimationStep(options);
      },
      color: (...optionsIn: Array<TypeColorAnimationStepInputOptions>) => {
        const options = joinObjects({}, { elements: this }, ...optionsIn);
        return new animations.ColorAnimationStep(options);
      },
      opacity: (...optionsIn: Array<TypeOpacityAnimationStepInputOptions>) => {
        const options = joinObjects({}, { elements: this }, ...optionsIn);
        return new animations.OpacityAnimationStep(options);
      },
      transform: (...optionsIn: Array<TypeTransformAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.TransformAnimationStep(options);
      },
      pulse(...optionsIn: Array<TypePulseAnimationStepInputOptions>) {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.PulseAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      dissolveIn: (timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {}, ...args: Array<TypeOpacityAnimationStepInputOptions>) => {
        const defaultOptions = { element: this };
        let options;
        if (typeof timeOrOptionsIn === 'number') {
          options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
        } else {
          options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
        }
        return new animations.DissolveInAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      dissolveOut: (timeOrOptionsIn: number | TypeOpacityAnimationStepInputOptions = {}, ...args: Array<TypeOpacityAnimationStepInputOptions>) => {
        const defaultOptions = { element: this };
        let options;
        if (typeof timeOrOptionsIn === 'number') {
          options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
        } else {
          options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
        }
        return new animations.DissolveOutAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      builder: (...optionsIn: Array<TypeAnimationBuilderInputOptions>) => new animations.AnimationBuilder(this, ...optionsIn),
      // eslint-disable-next-line max-len
      scenario: (...optionsIn: Array<TypeTransformAnimationStepInputOptions & { scenario: string }>) => {
        const defaultOptions = { element: this };
        const options = joinObjects({}, defaultOptions, ...optionsIn);
        if (options.target != null
          && options.target in options.element.scenarios
        ) {
          const target = options.element.getScenarioTarget(options.target);
          options.target = target;
        }
        if (options.start != null
          && options.start in options.element.scenarios
        ) {
          const start = options.element.getScenarioTarget(options.start);
          options.start = start;
        }
        if (options.delta != null
          && options.delta in options.element.scenarios
        ) {
          const delta = options.element.getScenarioTarget(options.delta);
          options.delta = delta;
        }
        return new animations.TransformAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      scenarios: (...optionsIn: Array<TypeParallelAnimationStepInputOptions & TypeTransformAnimationStepInputOptions>) => {
        const defaultOptions = {};
        const options = joinObjects({}, defaultOptions, ...optionsIn);
        const elements = this.getAllElementsWithScenario(options.target);
        const steps = [];
        const simpleOptions = {};
        duplicateFromTo(options, simpleOptions, ['steps', 'element']);
        elements.forEach((element) => {
          steps.push(element.anim.scenario(simpleOptions));
        });
        return new animations.ParallelAnimationStep(simpleOptions, { steps });
      },
    };
    this.diagramLimits = diagramLimits;
    this.move = {
      maxTransform: this.transform.constant(1000),
      minTransform: this.transform.constant(-1000),
      boundary: null,
      maxVelocity: new TransformLimit(5, 5, 5),
      freely: {
        zeroVelocityThreshold: new TransformLimit(0.001, 0.001, 0.001),
        deceleration: new TransformLimit(5, 5, 5),
        callback: null,
      },
      bounce: true,
      canBeMovedAfterLoosingTouch: false,
      type: 'translation',
      element: null,
      limitLine: null,
    };

    this.scenarios = {};

    this.pulseSettings = {
      time: 1,
      frequency: 0.5,
      A: 1,
      B: 0.5,
      C: 0,
      style: tools.sinusoid,
      num: 1,
      transformMethod: s => new Transform().scale(s, s),
      callback: () => {},
    };

    this.state = {
      isBeingMoved: false,
      isMovingFreely: false,
      movement: {
        previousTime: -1,
        previousTransform: this.transform._dup(),
        velocity: this.transform.zero(),
      },

      isPulsing: false,
      pulse: {
        startTime: -1,
      },
    };
    this.interactiveLocation = new Point(0, 0);
    this.animations = new animations.AnimationManager(this);
    this.tieToHTML = {
      element: null,
      scale: 'fit',
      window: this.diagramLimits,
      updateOnResize: true,
    };
    this.isRenderedAsImage = false;
    this.unrenderNextDraw = false;
    this.renderedOnNextDraw = false;
  }

  setProperties(properties: Object) {
    joinObjects(this, properties);
  }

  // Space definition:
  //   * Pixel space: css pixels
  //   * GL Space: x,y = -1 to 1
  //   * Diagram Space: x,y = diagram limits
  //   * Element space: Combination of element transform and its
  //     parent transform's

  // A diagram element primative vertex object lives in GL SPACE.
  //
  // A diagram element has its own DIAGRAM ELEMENT SPACE, which is
  // the GL space transformed by `this.transform`.
  //
  // A diagram element is drawn in the DIAGRAM SPACE, by transforming
  // the DIAGRAM ELEMENT SPACE by an incoming transformation matrix in the draw
  // method. This incoming transformation matrix originates in the diagram
  // and waterfalls through each parent diagram collection element to the
  // current diagram element.
  //
  // this.lastDrawTransformationMatrix captures how a vertex was drawn in
  // the last frame, in DIAGRAM space as:
  //   vertex
  //     transformed by: DIAGRAM ELEMENT SPACE
  //     transfromed by: DIAGRAM SPACE transform
  //
  // By default, webgl clip space is a unit space from (-1, 1) to (1, 1)
  // independent of the aspect ratio of the canvas it is drawn on.
  //
  // A diagram object can have its own clip space with arbitrary limits. e.g.:
  //    * (-1, -1) to (1, 1)    similar to gl clip space
  //    * (0, 0) to (2, 2)      similar to gl clip space but offset
  //    * (0, 0) to (4, 2)      for rectangular aspect ratio diagram
  //
  // The diagram object clip space definition is stored in this.diagramLimits.
  //
  // To therefore transform a vertex (from GL SPACE) to DIAGRAM CLIP SPACE:
  //   * Take the vertex
  //   * Transform it to DIAGRAM SPACE (by transforming it with the
  //     lastDrawTransformMatrix)
  //   * Transform it to DIAGRAM CLIP SPACE by scaling and offsetting it
  //     to the clip space.
  //
  // Each diagram element holds a DIAGRAM ELMENT CLIP space

  updateHTMLElementTie(
    diagramCanvas: HTMLElement,
  ) {
    let tieToElement;
    if (typeof this.tieToHTML.element === 'string') {
      tieToElement = document.getElementById(this.tieToHTML.element);
    }
    if (tieToElement != null) {
      const tie = tieToElement.getBoundingClientRect();
      const canvas = diagramCanvas.getBoundingClientRect();
      const diagram = this.diagramLimits;
      const dWindow = this.tieToHTML.window;
      const cAspectRatio = canvas.width / canvas.height;
      const dAspectRatio = diagram.width / diagram.height;
      const tAspectRatio = tie.width / tie.height;
      const wAspectRatio = dWindow.width / dWindow.height;

      const topLeftPixels = new Point(
        tie.left - canvas.left,
        tie.top - canvas.top,
      );
      const bottomRightPixels = topLeftPixels.add(new Point(
        tie.width, tie.height,
      ));

      const { pixelToDiagram } = this.diagramTransforms;
      const topLeft = topLeftPixels.transformBy(pixelToDiagram.m());
      const bottomRight = bottomRightPixels.transformBy(pixelToDiagram.m());
      const width = bottomRight.x - topLeft.x;
      const height = topLeft.y - bottomRight.y;
      const center = topLeft.add(new Point(width / 2, -height / 2));

      const scaleString = this.tieToHTML.scale.trim().toLowerCase();

      let scaleX = 1;
      let scaleY = 1;
      const diagramToWindowScaleX = diagram.width / dWindow.width;
      const diagramToWindowScaleY = diagram.height / dWindow.height;

      // Window has no scaling impact on em, it only has impact on translation
      if (scaleString.endsWith('em')) {
        const scale = parseFloat(scaleString);
        const em = parseFloat(getComputedStyle(tieToElement).fontSize);
        // 0.2 is default font size in diagram units
        const defaultFontScale = diagram.width / 0.2;
        scaleX = scale * em * defaultFontScale / canvas.width;
        scaleY = scale * em * defaultFontScale / dAspectRatio / canvas.height;
      }

      // Scale the maximum dimension of the window to the pixel value
      if (scaleString.endsWith('px')) {
        const maxPixels = parseFloat(scaleString);
        if (wAspectRatio > 1) {
          const scale = maxPixels / canvas.width;
          scaleX = scale * diagramToWindowScaleX;
          scaleY = scale * cAspectRatio / dAspectRatio * diagramToWindowScaleX;
        } else {
          const scale = maxPixels / canvas.height;
          scaleX = scale / cAspectRatio * dAspectRatio * diagramToWindowScaleY;
          scaleY = scale * diagramToWindowScaleY;
        }
      }

      // Scale the window x to tie x, and window y to tie y
      if (scaleString === 'stretch') {
        scaleX = tie.width / canvas.width * diagramToWindowScaleX;
        scaleY = tie.height / canvas.height * diagramToWindowScaleY;
      }

      // Scale so window either fits within the tie element, or fits only
      // within the max dimension of the tie element
      if (scaleString === 'max' || scaleString === 'fit') {
        const fitHeightScale = new Point(
          tie.height / canvas.height / cAspectRatio * dAspectRatio * diagramToWindowScaleY,
          tie.height / canvas.height * diagramToWindowScaleY,
        );

        const fitWidthScale = new Point(
          tie.width / canvas.width * diagramToWindowScaleX,
          tie.width / canvas.width * cAspectRatio / dAspectRatio * diagramToWindowScaleX,
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

  exec(
    execFunctionAndArgs: string | Array<Object>,
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

  pulse(done: ?(mixed) => void = null) {
    if (typeof this.pulseDefault === 'function') {
      this.pulseDefault(done);
    } else {
      const { frequency, time, scale } = this.pulseDefault;
      this.pulseScaleNow(time, scale, frequency, done);
    }
  }

  getElement() {
    return this;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  highlight() {
    this.undim();
  }

  setPosition(pointOrX: Point | number, y: number = 0) {
    let position = getPoint(pointOrX);
    if (typeof pointOrX === 'number') {
      position = new Point(pointOrX, y);
    }
    const currentTransform = this.transform._dup();
    currentTransform.updateTranslation(position);
    this.setTransform(currentTransform);
  }

  setRotation(rotation: number) {
    const currentTransform = this.transform._dup();
    currentTransform.updateRotation(rotation);
    this.setTransform(currentTransform);
  }

  setScale(scaleOrX: Point | number, y: ?number = null) {
    let scale = getPoint(scaleOrX);
    if (typeof scaleOrX === 'number') {
      if (y == null) {
        scale = new Point(scaleOrX, scaleOrX);
      } else {
        scale = new Point(scaleOrX, y);
      }
    }
    const currentTransform = this.transform._dup();
    currentTransform.updateScale(scale);
    this.setTransform(currentTransform);
  }

  // Use this method to set the element's transform in case a callback has been
  // connected that is tied to an update of the transform.
  setTransform(transform: Transform): void {
    this.transform = transform._dup().clip(
      this.move.minTransform,
      this.move.maxTransform,
      this.move.limitLine,
    );
    if (this.setTransformCallback) {
      this.setTransformCallback(this.transform);
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
      if (this.state.movement.previousTime < 0) {
        this.state.movement.previousTime = now;
        return;
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
        this.stopMovingFreely(false);
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

  setColor(color: Array<number>, setDefault: boolean = true) {
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
  }

  dim() {
    this.setColor(this.dimColor, false);
  }

  setDimColor(color: Array<number>) {
    this.dimColor = color != null ? color.slice() : [0, 0, 0, 0];
  }

  undim() {
    this.setColor(this.defaultColor, true);
  }

  setOpacity(opacity: number) {
    // this.color[3] = opacity;
    this.opacity = opacity;
  }

  getScenarioTarget(
    scenarioName: string,
  ) {
    const target = this.transform._dup();
    if (scenarioName in this.scenarios) {
      const scenario = this.scenarios[scenarioName];
      if (scenario.position != null) {
        target.updateTranslation(getPoint(scenario.position));
      }

      if (scenario.rotation != null) {
        target.updateRotation(scenario.rotation);
      }
      if (scenario.scale != null) {
        target.updateScale(getPoint(scenario.scale));
      }
    }
    return target;
  }

  setScenario(scenarioName: string) {
    if (this.scenarios[scenarioName] != null) {
      const target = this.getScenarioTarget(scenarioName);
      this.setTransform(target._dup());
    }
  }

  setScenarios(scenarioName: string) {
    if (this.scenarios[scenarioName] != null) {
      this.setScenario(scenarioName);
    }
  }

  getAllElementsWithScenario(scenarioName: string) {
    if (this.scenarios[scenarioName] != null) {
      return [this];
    }
    return [];
  }

  getTimeToMoveToScenario(
    scenarioName: string,
    rotDirection: -1 | 1 | 0 | 2 = 0,
  ) {
    const target = this.getScenarioTarget(scenarioName);
    const velocity = this.transform.constant(0);
    velocity.updateTranslation(new Point(1 / 2, 1 / 2));
    velocity.updateRotation(2 * Math.PI / 6);
    velocity.updateScale(1, 1);
    const time = getMaxTimeFromVelocity(this.transform._dup(), target, velocity, rotDirection);
    return time;
  }

  // Decelerate over some time when moving freely to get a new element
  // transform and movement velocity
  decelerate(deltaTime: number): Object {
    const next = this.transform.decelerate(
      this.state.movement.velocity,
      this.move.freely.deceleration,
      deltaTime,
      this.move.freely.zeroVelocityThreshold,
    );
    if (deltaTime > 0) {
      for (let i = 0; i < next.t.order.length; i += 1) {
        const t = next.t.order[i];
        const min = this.move.minTransform.order[i];
        const max = this.move.maxTransform.order[i];
        const v = next.v.order[i];
        if ((t instanceof Translation
            && v instanceof Translation
            && max instanceof Translation
            && min instanceof Translation)
          || (t instanceof Scale
            && v instanceof Scale
            && max instanceof Scale
            && min instanceof Scale)
        ) {
          let onLine = true;
          if (this.move.limitLine != null) {
            onLine = t.shaddowIsOnLine(this.move.limitLine, 4);
          }
          if (min.x >= t.x || max.x <= t.x || !onLine) {
            if (this.move.bounce) {
              v.x = -v.x * 0.5;
            } else {
              v.x = 0;
            }
          }
          if (min.y >= t.y || max.y <= t.y || !onLine) {
            if (this.move.bounce) {
              v.y = -v.y * 0.5;
            } else {
              v.y = 0;
            }
          }
          next.v.order[i] = v;
        }
        if (t instanceof Rotation
            && v instanceof Rotation
            && max instanceof Rotation
            && min instanceof Rotation) {
          if (min.r >= t.r || max.r <= t.r) {
            if (this.move.bounce) {
              v.r = -v.r * 0.5;
            } else {
              v.r = 0;
            }
          }
          next.v.order[i] = v;
        }
      }
      next.v.calcMatrix();
    }
    return {
      velocity: next.v,
      transform: next.t,
    };
  }

  updateLastDrawTransform() {
    const { parentCount } = this.lastDrawElementTransformPosition;
    const pLength = this.lastDrawTransform.order.length;
    this.transform.order.forEach((t, index) => {
      this.lastDrawTransform.order[pLength - parentCount - index - 1] = t._dup();
    });
    this.lastDrawTransform.calcMatrix();
  }

  getParentLastDrawTransform() {
    const { parentCount } = this.lastDrawElementTransformPosition;
    return new Transform(this.lastDrawTransform.order.slice(-parentCount));
  }

  // Being Moved
  startBeingMoved(): void {
    // this.stopAnimating();
    this.animations.cancelAll('noComplete');
    this.stopMovingFreely();
    this.state.movement.velocity = this.transform.zero();
    this.state.movement.previousTransform = this.transform._dup();
    this.state.movement.previousTime = Date.now() / 1000;
    this.state.isBeingMoved = true;
    this.unrender();
  }

  moved(newTransform: Transform): void {
    this.calcVelocity(newTransform);
    this.setTransform(newTransform._dup());
  }

  stopBeingMoved(): void {
    const currentTime = Date.now() / 1000;
    // Check wether last movement was a long time ago, if it was, then make
    // velocity 0 as the user has stopped moving before releasing touch/click
    if (this.state.movement.previousTime !== -1) {
      if ((currentTime - this.state.movement.previousTime) > 0.05) {
        this.state.movement.velocity = this.transform.zero();
      }
    }
    this.state.isBeingMoved = false;
    this.state.movement.previousTime = -1;
  }

  calcVelocity(newTransform: Transform): void {
    const currentTime = Date.now() / 1000;
    if (this.state.movement.previousTime < 0) {
      this.state.movement.previousTime = currentTime;
      return;
    }
    const deltaTime = currentTime - this.state.movement.previousTime;

    // If the time is too small, weird calculations may happen
    if (deltaTime < 0.0001) {
      return;
    }
    this.state.movement.velocity = newTransform.velocity(
      this.transform,
      deltaTime,
      this.move.freely.zeroVelocityThreshold,
      this.move.maxVelocity,
    );
    this.state.movement.previousTime = currentTime;
  }

  // Moving Freely
  startMovingFreely(callback: ?(boolean) => void = null): void {
    // this.stopAnimating();
    this.animations.cancelAll('noComplete');
    this.stopBeingMoved();
    if (callback) {
      // this.animate.transform.callback = callback;
      this.move.freely.callback = callback;
    }
    this.state.isMovingFreely = true;
    this.state.movement.previousTime = -1;
    this.state.movement.velocity = this.state.movement.velocity.clipMag(
      this.move.freely.zeroVelocityThreshold,
      this.move.maxVelocity,
    );
  }

  stopMovingFreely(result: boolean = true): void {
    this.state.isMovingFreely = false;
    this.state.movement.previousTime = -1;
    if (this.move.freely.callback) {
      this.move.freely.callback(result);
      // if (result !== null && result !== undefined) {
      //   this.animate.transform.callback(result);
      // } else {
      //   this.animate.transform.callback();
      // }
      this.move.freely.callback = null;
    }
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
  transformWithPulse(now: number, transform: Transform): Array<Transform> {
    const pulseTransforms = [];    // To output list of transform matrices

    // If the diagram element is currently pulsing, the calculate the current
    // pulse magnitude, and transform the input matrix by the pulse
    if (this.state.isPulsing) {
      // If this is the first pulse frame, then set the startTime
      if (this.state.pulse.startTime === -1) {
        this.state.pulse.startTime = now;
      }
      // Calculate how much time has elapsed between this frame and the first
      // pulse frame
      let deltaTime = now - this.state.pulse.startTime;
      // If the elapsed time is larger than the planned pulse time, then
      // clip the elapsed time to the pulse time, and end pulsing (after this
      // draw). If the pulse time is 0, that means pulsing will loop
      // indefinitely.
      if (deltaTime > this.pulseSettings.time && this.pulseSettings.time !== 0) {
        // this.state.isPulsing = false;
        this.stopPulsing(true);
        deltaTime = this.pulseSettings.time;
      }

      // Go through each pulse matrix planned, and transform the input matrix
      // with the pulse.
      for (let i = 0; i < this.pulseSettings.num; i += 1) {
        // Get the current pulse magnitude
        const pulseMag = this.pulseSettings.style(
          deltaTime,
          this.pulseSettings.frequency,
          this.pulseSettings.A instanceof Array ? this.pulseSettings.A[i] : this.pulseSettings.A,
          this.pulseSettings.B instanceof Array ? this.pulseSettings.B[i] : this.pulseSettings.B,
          this.pulseSettings.C instanceof Array ? this.pulseSettings.C[i] : this.pulseSettings.C,
        );

        // Use the pulse magnitude to get the current pulse transform
        const pTransform = this.pulseSettings.transformMethod(pulseMag);
        // if(this.name === '_radius') {
        // }
        // Transform the current transformMatrix by the pulse transform matrix
        // const pMatrix = m2.mul(m2.copy(transform), pTransform.matrix());

        // Push the pulse transformed matrix to the array of pulse matrices
        pulseTransforms.push(transform.transform(pTransform));
      }
    // If not pulsing, then make no changes to the transformMatrix.
    } else {
      pulseTransforms.push(transform._dup());
    }
    return pulseTransforms;
  }

  pulseScaleNow(
    time: number, scale: number,
    frequency: number = 0, callback: ?(?mixed) => void = null,
  ) {
    this.pulseSettings.time = time;
    if (frequency === 0 && time === 0) {
      this.pulseSettings.frequency = 1;
    }
    if (frequency !== 0) {
      this.pulseSettings.frequency = frequency;
    }
    if (time !== 0 && frequency === 0) {
      this.pulseSettings.frequency = 1 / (time * 2);
    }

    this.pulseSettings.A = 1;
    this.pulseSettings.B = scale - 1;
    this.pulseSettings.C = 0;
    this.pulseSettings.num = 1;
    this.pulseSettings.callback = callback;
    this.pulseNow();
  }

  pulseThickNow(
    time: number, scale: number,
    num: number = 3, callback: ?(?mixed) => void = null,
  ) {
    let bArray = [scale];
    this.pulseSettings.num = num;
    if (this.pulseSettings.num > 1) {
      const b = Math.abs(1 - scale);
      const bMax = b;
      const bMin = -b;
      const range = bMax - bMin;
      const bStep = range / (this.pulseSettings.num - 1);
      bArray = [];
      for (let i = 0; i < this.pulseSettings.num; i += 1) {
        bArray.push(bMax - i * bStep);
      }
    }
    this.pulseSettings.time = time;
    this.pulseSettings.frequency = 1 / (time * 2);
    this.pulseSettings.A = 1;
    this.pulseSettings.B = bArray;
    this.pulseSettings.C = 0;
    this.pulseSettings.callback = callback;
    this.pulseNow();
  }

  // pulse(done: ?(mixed) => void = null) {
  //   this.pulseDefault(done);
  // }

  pulseNow() {
    this.state.isPulsing = true;
    this.state.pulse.startTime = -1;
    this.unrender();
  }

  stopPulsing(result: ?mixed) {
    this.state.isPulsing = false;
    if (this.pulseSettings.callback) {
      const { callback } = this.pulseSettings;
      this.pulseSettings.callback = null;
      callback(result);
    }
  }

  stop(
    cancelled?: boolean = true,
    forceSetToEndOfPlan?: ?boolean | 'complete' | 'noComplete' = false,
  ) {
    if (forceSetToEndOfPlan === true || forceSetToEndOfPlan === 'complete') {
      this.animations.cancelAll('complete');
    } else if (forceSetToEndOfPlan === false || forceSetToEndOfPlan === 'noComplete') {
      this.animations.cancelAll('noComplete');
    } else {
      this.animations.cancelAll(null);
    }
    this.stopMovingFreely(cancelled);
    this.stopBeingMoved();
    this.stopPulsing(cancelled);
  }

  cancel(forceSetToEndOfPlan?: ?boolean | 'complete' | 'noComplete' = false) {
    this.stop(true, forceSetToEndOfPlan);
  }

  updateLimits(
    limits: Rect,
    transforms: TypeSpaceTransforms = this.diagramTransforms,
  ) {
    this.diagramLimits = limits;
    this.diagramTransforms = transforms;
  }


  resize(diagramHTMLElement: ?HTMLElement = null) {
    if (diagramHTMLElement && this.tieToHTML.updateOnResize) {
      this.updateHTMLElementTie(diagramHTMLElement);
    }
  }

  // ***************************************************************
  // Boundaries
  // ***************************************************************
  // eslint-disable-next-line class-methods-use-this
  getVertexSpaceBoundaries() {
    return [[]];
  }

  // eslint-disable-next-line class-methods-use-this
  getGLBoundaries() {
    return [[]];
  }

  // eslint-disable-next-line class-methods-use-this
  getLocalBoundaries() {
    return [[]];
  }

  // eslint-disable-next-line class-methods-use-this
  getDiagramBoundaries() {
    return [[]];
  }

  getBoundaries(space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local') {
    if (space === 'local') {
      return this.getLocalBoundaries();
    }
    if (space === 'diagram') {
      return this.getDiagramBoundaries();
    }
    if (space === 'vertex') {
      return this.getVertexSpaceBoundaries();
    }
    if (space === 'gl') {
      return this.getGLBoundaries();
    }
    return [[]];
  }

  // ***************************************************************
  // Bounding Rect
  // ***************************************************************
  // eslint-disable-next-line class-methods-use-this
  getGLBoundingRect() {
    return new Rect(0, 0, 1, 1);
  }

  // eslint-disable-next-line class-methods-use-this
  getLocalBoundingRect() {
    return new Rect(0, 0, 1, 1);
  }

  // eslint-disable-next-line class-methods-use-this
  getVertexSpaceBoundingRect() {
    return new Rect(0, 0, 1, 1);
  }

  // eslint-disable-next-line class-methods-use-this
  getDiagramBoundingRect() {
    const gl = this.getGLBoundingRect();
    const glToDiagramScale = new Point(
      this.diagramLimits.width / 2,
      this.diagramLimits.height / 2,
    );
    return new Rect(
      gl.left * glToDiagramScale.x,
      gl.bottom * glToDiagramScale.y,
      gl.width * glToDiagramScale.x,
      gl.height * glToDiagramScale.y,
    );
  }

  getBoundingRect(
    space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local',
  ) {
    if (space === 'local') {
      return this.getLocalBoundingRect();
    }
    if (space === 'diagram') {
      return this.getDiagramBoundingRect();
    }
    if (space === 'vertex') {
      return this.getVertexSpaceBoundingRect();
    }
    if (space === 'gl') {
      return this.getGLBoundingRect();
    }
    return new Rect(0, 0, 1, 1);
  }

  // ***************************************************************
  // Size
  // ***************************************************************
  getRelativeBoundingRect(
    space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local',
  ) {
    const rect = this.getBoundingRect(space);
    const position = this.getPosition(space);
    return new Rect(
      rect.left - position.x,
      rect.bottom - position.y,
      rect.width,
      rect.height,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getRelativeGLBoundingRect() {
    return new Rect(0, 0, 1, 1);
  }

  getRelativeDiagramBoundingRect() {
    const gl = this.getRelativeGLBoundingRect();
    const glToDiagramScale = new Point(
      this.diagramLimits.width / 2,
      this.diagramLimits.height / 2,
    );
    return new Rect(
      gl.left * glToDiagramScale.x,
      gl.bottom * glToDiagramScale.y,
      gl.width * glToDiagramScale.x,
      gl.height * glToDiagramScale.y,
    );
  }

  getCenterDiagramPosition() {
    const rect = this.getDiagramBoundingRect();
    return new Point(
      rect.left + rect.width / 2,
      rect.bottom + rect.height / 2,
    );
  }

  getScale() {
    const s = this.transform.s();
    let scale = new Point(0, 0);
    if (s != null) {
      scale = s._dup();
    }
    return scale;
  }

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

  getVertexSpaceDiagramPosition(vertexSpacePoint: Point) {
    const location = vertexSpacePoint.transformBy(this.lastDrawTransform.matrix());
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const diagramSpace = {
      x: {
        bottomLeft: this.diagramLimits.left,
        width: this.diagramLimits.width,
      },
      y: {
        bottomLeft: this.diagramLimits.bottom,
        height: this.diagramLimits.height,
      },
    };
    const glToDiagramSpace = spaceToSpaceTransform(glSpace, diagramSpace);
    // console.log(location, glToDiagramSpace)
    return location.transformBy(glToDiagramSpace.matrix());
  }

  getLocalPosition() {
    const t = this.transform.t();
    let position = new Point(0, 0);
    if (t != null) {
      position = t._dup();
    }
    return position;
  }

  // // deprecated
  // getDiagramPosition() {
  //   // Note, this should be 0,0 as the current transform's translation will
  //   // be included in getVertexSpaceDiagramPosition
  //   return this.getVertexSpaceDiagramPosition(new Point(0, 0));
  // }

  // // eslint-disable-next-line class-methods-use-this
  // getGLPosition() {
  //   return new Point(0, 0);
  // }

  getPosition(space: 'local' | 'diagram' | 'gl' | 'vertex' = 'local') {
    // vertex space position doesn't mean much as it will always be 0, 0
    if (space === 'vertex') {
      return new Point(0, 0);
    }
    if (space === 'local') {
      return this.getLocalPosition();
    }
    if (space === 'diagram') {
      // Note, this should be 0,0 as the current transform's translation will
      // be included in getVertexSpaceDiagramPosition
      return this.getVertexSpaceDiagramPosition(new Point(0, 0));
    }
    if (space === 'gl') {
      // Note, this should be 0,0 as the current transform's translation will
      // be included in getVertexSpaceDiagramPosition
      return (new Point(0, 0)).transformBy(this.lastDrawTransform.matrix());
    }
    return new Point(0, 0);
  }

  getPixelToVertexSpaceScale() {
    const pixelToDiagram = this.diagramTransforms.pixelToDiagram.matrix();
    const diagramToVertex = this.diagramSpaceToVertexSpaceTransformMatrix();
    const scaleX = pixelToDiagram[0] * diagramToVertex[0];
    const scaleY = pixelToDiagram[4] * diagramToVertex[4];
    return new Point(scaleX, scaleY);
  }

  getVertexToPixelSpaceScale() {
    const pixelToVertexSpaceScale = this.getPixelToVertexSpaceScale();
    return new Point(
      1 / pixelToVertexSpaceScale.x,
      1 / pixelToVertexSpaceScale.y,
    );
  }

  getDiagramPositionInVertexSpace(diagramPosition: Point) {
    return diagramPosition.transformBy(this.diagramSpaceToVertexSpaceTransformMatrix());
  }

  diagramSpaceToVertexSpaceTransformMatrix() {
    // Diagram transform will always be two
    const t = new Transform(this.lastDrawTransform.order.slice(
      this.lastDrawElementTransformPosition.elementCount,
      this.lastDrawTransform.order.length - 2,
    ));
    return m2.inverse(t.matrix());
  }

  vertexToDiagramSpaceTransformMatrix() {
    const t = new Transform(this.lastDrawTransform.order.slice(
      0,
      this.lastDrawTransform.order.length - 2,
    ));
    return t.matrix();
  }

  setDiagramPosition(diagramPosition: Point) {
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const diagramSpace = {
      x: {
        bottomLeft: this.diagramLimits.left,
        width: this.diagramLimits.width,
      },
      y: {
        bottomLeft: this.diagramLimits.bottom,
        height: this.diagramLimits.height,
      },
    };
    const diagramToGLSpace = spaceToSpaceTransform(diagramSpace, glSpace);
    const glLocation = diagramPosition.transformBy(diagramToGLSpace.matrix());
    const t = new Transform(this.lastDrawTransform.order.slice(this.transform.order.length));
    const newLocation = glLocation.transformBy(m2.inverse(t.matrix()));
    this.setPosition(newLocation._dup());
  }

  setDiagramPositionToElement(element: DiagramElement) {
    const p = element.getPosition('diagram');
    this.setDiagramPosition(p._dup());
  }

  setPositionToElement(element: DiagramElement) {
    const p = element.transform.t();
    if (p != null) {
      this.setPosition(p._dup());
    }
  }

  setMoveBoundaryToDiagram(
    boundaryIn: ?Array<number> | Rect | 'diagram' = this.move.boundary,
    scale: Point = new Point(1, 1),
  ): void {
    if (!this.isMovable) {
      return;
    }
    if (boundaryIn != null) {
      this.move.boundary = boundaryIn;
    }
    if (this.move.boundary == null) {
      return;
    }
    let boundary;
    if (Array.isArray(this.move.boundary)) {
      const [left, bottom, width, height] = this.move.boundary;
      boundary = new Rect(left, bottom, width, height);
    } else if (this.move.boundary === 'diagram') {
      boundary = this.diagramLimits;
    } else {
      ({ boundary } = this.move);
    }

    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const diagramSpace = {
      x: {
        bottomLeft: this.diagramLimits.left,
        width: this.diagramLimits.width,
      },
      y: {
        bottomLeft: this.diagramLimits.bottom,
        height: this.diagramLimits.height,
      },
    };
    const glToDiagramSpace = spaceToSpaceTransform(glSpace, diagramSpace);

    const rect = this.getRelativeGLBoundingRect();
    const glToDiagramScaleMatrix = [
      glToDiagramSpace.matrix()[0], 0, 0,
      0, glToDiagramSpace.matrix()[4], 0,
      0, 0, 1];

    const minPoint = new Point(rect.left, rect.bottom).transformBy(glToDiagramScaleMatrix);
    const maxPoint = new Point(rect.right, rect.top).transformBy(glToDiagramScaleMatrix);

    const min = new Point(0, 0);
    const max = new Point(0, 0);

    min.x = boundary.left - minPoint.x * scale.x;
    min.y = boundary.bottom - minPoint.y * scale.y;
    max.x = boundary.right - maxPoint.x * scale.x;
    max.y = boundary.top - maxPoint.y * scale.y;

    this.move.maxTransform.updateTranslation(
      max.x,
      max.y,
    );
    this.move.minTransform.updateTranslation(
      min.x,
      min.y,
    );
  }

  show(): void {
    this.isShown = true;
    this.setOpacity(1);
    if (this.parent != null) {
      if (!this.parent.isShown) {
        this.parent.show();
      }
    }
  }

  makeTouchable(makeThisElementTouchable: boolean = true): void {
    if (makeThisElementTouchable) {
      this.isTouchable = true;
    } else {
      this.hasTouchableElements = true;
    }
    if (this.parent != null) {
      this.parent.makeTouchable(false);
    }
  }

  setMovable(movable: boolean = true) {
    if (movable) {
      this.isMovable = true;
      this.makeTouchable(true);
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

  hide(): void {
    this.isShown = false;
  }

  hideAll(): void {
    this.hide();
  }

  toggleShow(): void {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  }

  click(): void {
    if (this.onClick !== null && this.onClick !== undefined) {
      this.onClick(this);
    }
  }

  // setMovable(movable: boolean = true) {
  //   if (movable) {
  //     this.isTouchable = true;
  //     this.isMovable = true;
  //   }
  // }
}

// ***************************************************************
// Geometry Object
// ***************************************************************
class DiagramElementPrimitive extends DiagramElement {
  drawingObject: DrawingObject;
  color: Array<number>;
  opacity: number;
  pointsToDraw: number;
  angleToDraw: number;
  lengthToDraw: number;
  cannotTouchHole: boolean;
  +pulse: (?(mixed) => void) => void;

  constructor(
    drawingObject: DrawingObject,
    transform: Transform = new Transform(),
    color: Array<number> = [0.5, 0.5, 0.5, 1],
    diagramLimits: Rect = new Rect(-1, -1, 2, 2),
    parent: DiagramElement | null = null,
  ) {
    super(transform, diagramLimits, parent);
    this.drawingObject = drawingObject;
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    this.defaultColor = this.color.slice();
    this.dimColor = [0.5, 0.5, 0.5, 1];
    this.pointsToDraw = -1;
    this.angleToDraw = -1;
    this.lengthToDraw = -1;
    this.cannotTouchHole = false;
    this.type = 'primitive';
    // this.setMoveBoundaryToDiagram();
  }

  setAngleToDraw(intputAngle: number = -1) {
    this.angleToDraw = intputAngle;
  }

  isBeingTouched(glLocation: Point): boolean {
    if (!this.isTouchable) {
      return false;
    }
    const boundaries =
      this.drawingObject.getGLBoundaries(this.lastDrawTransform.matrix());
    const holeBoundaries =
      this.drawingObject.getGLBoundaryHoles(this.lastDrawTransform.matrix());
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (glLocation.isInPolygon(boundary)) {
        let isTouched = true;
        if (this.cannotTouchHole) {
          for (let j = 0; j < holeBoundaries.length; j += 1) {
            const holeBoundary = holeBoundaries[j];
            if (glLocation.isInPolygon(holeBoundary)) {
              isTouched = false;
              j = holeBoundaries.length;
            }
          }
        }
        if (isTouched) {
          return true;
        }
      }
    }
    return false;
  }

  // updateContext(context: DrawContext2D) {
  //   if (this.drawingObject instanceof TextObject) {
  //     this.drawingObject.drawContext2D = context;
  //   }
  // }

  _dup(transform: Transform | null = null) {
    // const vertices = this.drawingObject._dup();
    const primative = new DiagramElementPrimitive(this.drawingObject._dup());
    // const primative = new DiagramElementPrimitive(
    //   vertices,
    //   transform,
    //   color,
    //   this.diagramLimits._dup(),
    // );
    // primative.pointsToDraw = this.pointsToDraw;
    // primative.angleToDraw = this.angleToDraw;
    // primative.copyFrom(this);
    duplicateFromTo(this, primative, ['parent']);
    if (transform != null) {
      primative.transform = transform._dup();
    }
    return primative;
  }

  clear(canvasIndex: number = 0) {
    if (this.drawingObject instanceof TextObject) {
      this.drawingObject.clear(canvasIndex);
    }
  }

  resize(diagramHTMLElement: ?HTMLElement = null) {
    this.resizeHtmlObject();
    super.resize(diagramHTMLElement);
    // If gl canvas is resized, webgl text will need to be updated.
    if (this.drawingObject.type === 'vertexText') {
      const pixelToVertexScale = this.getPixelToVertexSpaceScale();
      // $FlowFixMe
      this.drawingObject.drawTextIntoBuffer(
        new Point(pixelToVertexScale.x, Math.abs(pixelToVertexScale.y)),
      );
    }
  }

  setColor(color: Array<number>, setDefault: boolean = true) {
    this.color = color != null ? color.slice() : [0, 0, 0, 0];
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
    if (this instanceof DiagramElementPrimitive) {
      if (this.drawingObject instanceof TextObject) {
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
    if (this instanceof DiagramElementPrimitive) {
      if (this.drawingObject instanceof TextObject) {
        this.drawingObject.setOpacity(opacity);
      }
      if (this.drawingObject instanceof HTMLObject) {
        // console.log(this.name, this.drawingObject)
        // $FlowFixMe
        // this.drawingObject.element.style.color =
        // colorArrayToRGBA([...this.color.slice(0, 2), opacity]);
        // console.log(this.drawingObject.element)
        this.drawingObject.element.style.opacity = `${opacity}`;
      }
    }
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
      // Therefore, should use diagram.setFirstTransform before using this,
      // or in the future remove this line, and the line in hide(), and
      // somehow do the hide in the draw call
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }

  // showAll() {
  //   this.show();
  // }

  hide() {
    super.hide();
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.show = false;
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }

  // hideAll() {
  //   this.hide();
  // }

  getTouched(glLocation: Point): Array<DiagramElementPrimitive> {
    if (!this.isTouchable) {
      return [];
    }
    if (this.isBeingTouched(glLocation)) {
      return [this];
    }
    return [];
  }

  setFont(fontSize: number) {
    if (this.drawingObject instanceof TextObject) {
      this.drawingObject.setFont(fontSize);
    }
  }

  resizeHtmlObject() {
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.transformHtml(this.lastDrawTransform.matrix());
    }
  }

  draw(parentTransform: Transform = new Transform(), now: number = 0, canvasIndex: number = 0) {
    if (this.isShown) {
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      }
      this.animations.nextFrame(now);
      this.nextMovingFreelyFrame(now);

      if (!this.isShown) {
        return;
      }
      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform.order.length,
        elementCount: this.transform.order.length,
      };

      const newTransform = parentTransform.transform(this.transform);
      const pulseTransforms = this.transformWithPulse(now, newTransform);

      // eslint-disable-next-line prefer-destructuring
      this.lastDrawTransform = pulseTransforms[0];

      let pointCount = -1;
      if (this.drawingObject instanceof VertexObject) {
        pointCount = this.drawingObject.numPoints;
        if (this.angleToDraw !== -1) {
          pointCount = this.drawingObject.getPointCountForAngle(this.angleToDraw);
        }
        if (this.lengthToDraw !== -1) {
          pointCount = this.drawingObject.getPointCountForLength(this.lengthToDraw);
        }
        if (this.pointsToDraw !== -1) {
          pointCount = this.pointsToDraw;
        }
      }
      const colorToUse = [...this.color.slice(0, 3), this.color[3] * this.opacity];
      pulseTransforms.forEach((t) => {
        this.drawingObject.drawWithTransformMatrix(t.matrix(), colorToUse, canvasIndex, pointCount);
      });
      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
    }
  }

  setFirstTransform(parentTransform: Transform = new Transform()) {
    this.lastDrawElementTransformPosition = {
      parentCount: parentTransform.order.length,
      elementCount: this.transform.order.length,
    };
    // const finalParentTransform = this.processParentTransform(parentTransform);
    const firstTransform = parentTransform.transform(this.transform);
    this.lastDrawTransform = firstTransform;

    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.transformHtml(firstTransform.matrix());
    }
    this.setMoveBoundaryToDiagram();
  }

  isMoving(): boolean {
    if (
      // this.state.isAnimating
      this.state.isMovingFreely
      || this.state.isBeingMoved
      || this.state.isPulsing
      // || this.state.isAnimatingColor
      // || this.state.isAnimatingCustom
      || this.animations.willStartAnimating()
    ) {
      return true;
    }
    return false;
  }

  // setupWebGLBuffers(newWebgl: WebGLInstance) {
  //   const { drawingObject } = this;
  //   if (drawingObject instanceof VertexObject) {
  //     const oldWebgl = drawingObject.webgl;
  //     drawingObject.webgl = newWebgl;
  //     drawingObject.gl = newWebgl.gl;
  //     drawingObject.setupBuffer();
  //     drawingObject.webgl = oldWebgl;
  //     drawingObject.gl = oldWebgl.gl;
  //   }
  // }

  // changeWebGLInstance(newWebgl: WebGLInstance) {
  //   let oldWebgl;
  //   const { drawingObject } = this;
  //   if (drawingObject instanceof VertexObject) {
  //     oldWebgl = drawingObject.webgl;
  //     drawingObject.webgl = newWebgl;
  //     drawingObject.gl = newWebgl.gl;
  //   }
  //   return oldWebgl;
  // }

  getVertexSpaceBoundaries() {
    return this.drawingObject.border;
  }

  getLocalBoundaries() {
    return this.drawingObject.getGLBoundaries(this.transform.matrix());
  }

  getGLBoundaries() {
    return this.drawingObject.getGLBoundaries(this.lastDrawTransform.matrix());
  }


  getVertexSpaceBoundingRect() {
    return this.drawingObject.getVertexSpaceBoundingRect();
  }

  getLocalBoundingRect() {
    return this.drawingObject.getGLBoundingRect(this.transform.matrix());
  }

  getGLBoundingRect() {
    return this.drawingObject.getGLBoundingRect(this.lastDrawTransform.matrix());
  }

  getRelativeVertexSpaceBoundingRect(): Rect {
    return this.drawingObject.getRelativeVertexSpaceBoundingRect();
  }

  getRelativeGLBoundingRect(): Rect {
    return this.drawingObject.getRelativeGLBoundingRect(this.lastDrawTransform.matrix());
  }

  getRelativeLocalBoundingRect(): Rect {
    return this.drawingObject.getRelativeGLBoundingRect(this.transform.matrix());
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
      for (let i = 0; i < this.drawingObject.border[0].length; i += 1) {
        this.drawingObject.border[0][i].x *= xMulToUse;
        this.drawingObject.border[0][i].y *= yMulToUse;
      }
    }
  }
}

// ***************************************************************
// Collection of Geometry Objects or Collections
// ***************************************************************
class DiagramElementCollection extends DiagramElement {
  elements: Object;
  drawOrder: Array<string>;
  touchInBoundingRect: boolean;
  eqns: Object;
  +pulse: (?(Array<string | DiagramElement> | (mixed) => void), ?(mixed) => void) => void;
  +getElement: (?(string | DiagramElement)) => ?DiagramElement;
  +exec: (string | Array<Object>, ?Array<string | DiagramElement>) => void;
  +highlight: (elementsToDim: ?Array<string | DiagramElement>) => void;

  constructor(
    transform: Transform = new Transform(),
    diagramLimits: Rect = new Rect(-1, 1, 2, 2),
    parent: DiagramElement | null = null,
  ): void {
    super(transform, diagramLimits, parent);
    this.elements = {};
    this.drawOrder = [];
    this.touchInBoundingRect = false;
    this.eqns = {};
    this.type = 'collection';
  }

  _dup() {
    const collection = new DiagramElementCollection(
      // transform,
      // diagramLimits,
    );
    // collection.touchInBoundingRect = this.touchInBoundingRect;
    // collection.copyFrom(this);
    const doNotDuplicate = this.drawOrder.map(e => `_${e}`);
    duplicateFromTo(this, collection, ['elements', 'drawOrder', 'parent', ...doNotDuplicate]);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const name = this.drawOrder[i];
      collection.add(name, this.elements[name]._dup());
    }

    return collection;
  }

  isMoving(): boolean {
    if (this.isShown === false) {
      return false;
    }
    if (this.state.isMovingFreely
        || this.state.isBeingMoved
        || this.state.isPulsing
        || this.animations.state === 'animating') {
      return true;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof DiagramElementCollection) {
        if (element.isMoving()) {
          return true;
        }
      } else if (element.isShown && element.color[3] > 0 && element.isMoving()) {
        return true;
      }
    }
    return false;
  }

  add(
    name: string,
    diagramElement: DiagramElementPrimitive | DiagramElementCollection,
    index: number = -1,
  ) {
    // eslint-disable-next-line no-param-reassign
    diagramElement.parent = this;
    this.elements[name] = diagramElement;
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

  draw(parentTransform: Transform = new Transform(), now: number = 0, canvasIndex: number = 0) {
    if (this.isShown) {
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      }
      this.animations.nextFrame(now);
      this.nextMovingFreelyFrame(now);

      // set next color can end up hiding an element when disolving out
      if (!this.isShown) {
        return;
      }

      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform.order.length,
        elementCount: this.transform.order.length,
      };
      const newTransform = parentTransform.transform(this.transform);
      const pulseTransforms = this.transformWithPulse(now, newTransform);

      // eslint-disable-next-line prefer-destructuring
      this.lastDrawTransform = pulseTransforms[0];
      // this.lastDrawPulseTransform = pulseTransforms[0]._dup();

      for (let k = 0; k < pulseTransforms.length; k += 1) {
        for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
          this.elements[this.drawOrder[i]].draw(pulseTransforms[k], now, canvasIndex);
        }
      }
      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
    }
  }

  exec(
    execFunctionAndArgs: string | Array<Object>,
    elementsToExec: ?Array<string | DiagramElement> = null,
  ) {
    if (elementsToExec == null) {
      super.exec(execFunctionAndArgs);
      return;
    }

    if (Array.isArray(elementsToExec) && elementsToExec.length === 0) {
      return;
    }

    elementsToExec.forEach((elementToExec) => {
      let element: ?DiagramElement;
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
    elementsOrDone: ?(Array<string | DiagramElement> | (mixed) => void),
    // elementsToPulse: Array<string | DiagramElement>,
    done: ?(mixed) => void = null,
  ) {
    if (elementsOrDone == null || typeof elementsOrDone === 'function') {
      super.pulse(elementsOrDone);
      return;
    }

    let doneToUse = done;
    elementsOrDone.forEach((elementToPulse) => {
      let element: ?DiagramElement;
      if (typeof elementToPulse === 'string') {
        element = this.getElement(elementToPulse);
      } else {
        element = elementToPulse;
      }
      if (element != null) {
        // element.pulseDefault(doneToUse);
        element.pulse(doneToUse);
        doneToUse = null;
      }
    });
    if (doneToUse != null) {
      doneToUse();
    }
  }

  getElement(elementPath: ?(string | DiagramElement) = null) {
    if (elementPath == null) {
      return this;
    }
    if (typeof elementPath !== 'string') {
      return elementPath;
    }
    // if (elementPath instanceof DiagramElement) {
    //   return elementPath;
    // }
    const getElement = (inputElementPath, parent) => {
      const ep = inputElementPath.split('.');
      let newParent = parent.elements[ep[0]];
      if (newParent == null) {
        // $FlowFixMe
        newParent = parent[ep[0]];
      }
      if (newParent == null) {
        return null;
      }
      if (ep.length > 1) {
        return getElement(ep.slice(1).join('.'), newParent);
      }
      return newParent;
    };
    return getElement(elementPath, this);
  }

  show(listToShow: Array<DiagramElementPrimitive | DiagramElementCollection> = []): void {
    super.show();
    listToShow.forEach((element) => {
      if (element instanceof DiagramElementCollection) {
        element.showAll();
      } else {
        element.show();
      }
    });
  }

  hide(listToShow: Array<DiagramElementPrimitive | DiagramElementCollection> = []): void {
    super.hide();
    listToShow.forEach((element) => {
      if (element instanceof DiagramElementCollection) {
        element.hideAll();
      } else {
        element.show();
      }
    });
  }

  showAll(): void {
    this.show();
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.show();
      if (typeof element.hideAll === 'function') {
        element.showAll();
      }
    }
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

  showOnly(listToShow: Array<DiagramElementPrimitive | DiagramElementCollection>): void {
    this.hideAll();
    this.show();
    for (let i = 0, j = listToShow.length; i < j; i += 1) {
      const element = listToShow[i];
      if (element) {
        element.show();
      } else {
        throw Error(`Diagram Element Error: Element does not exist at position ${i}`);
      }
    }
  }

  hideOnly(listToHide: Array<DiagramElementPrimitive | DiagramElementCollection>): void {
    this.showAll();
    for (let i = 0, j = listToHide.length; i < j; i += 1) {
      const element = listToHide[i];
      element.hide();
    }
  }

  // This will only search elements within the collection for a touch
  // if the collection is touchable. Note, the elements can be queried
  // directly still, and will return if they are touched if they themselves
  // are touchable.
  isBeingTouched(glLocation: Point) {
    if (!this.isTouchable) {
      return false;
    }
    if (this.touchInBoundingRect) {
      const boundingRect = this.getGLBoundingRect();
      if (glLocation.x >= boundingRect.left
        && glLocation.x <= boundingRect.right
        && glLocation.y <= boundingRect.top
        && glLocation.y >= boundingRect.bottom
      ) {
        return true;
      }
    }
    for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown === true) {
        if (element.isBeingTouched(glLocation)) {
          return true;
        }
      }
    }
    return false;
  }

  resizeHtmlObject() {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.resizeHtmlObject();
    }
  }

  resize(diagramHTMLElement: ?HTMLElement = null) {
    super.resize(diagramHTMLElement);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.resize(diagramHTMLElement);
    }
  }

  clear(canvasIndex: number = 0) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.clear(canvasIndex);
    }
  }

  setFirstTransform(parentTransform: Transform = new Transform()) {
    // const finalParentTransform = this.processParentTransform(parentTransform);
    const firstTransform = parentTransform.transform(this.transform);
    this.lastDrawTransform = firstTransform;

    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFirstTransform(firstTransform);
    }
    this.setMoveBoundaryToDiagram();
  }

  getAllBoundaries(space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local') {
    let boundaries = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown) {
        const elementBoundaries = element.getBoundaries(space);
        boundaries = boundaries.concat(elementBoundaries);
      }
    }
    return boundaries;
  }

  getBoundaries(
    space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local',
    children: ?Array<string | DiagramElement> = null,
  ) {
    let boundaries = [];
    if (children == null) {
      return this.getAllBoundaries();
    }
    children.forEach((child) => {
      const e = this.getElement(child);
      if (e == null) {
        return;
      }
      const elementBoundaries = e.getBoundaries(space);
      boundaries = boundaries.concat(elementBoundaries);
    });
    return boundaries;
  }

  // deprecated
  getGLBoundaries() {
    let boundaries = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown) {
        const elementBoundaries = element.getGLBoundaries();
        boundaries = boundaries.concat(elementBoundaries);
      }
    }
    return boundaries;
  }

  // deprecated
  getVertexSpaceBoundaries() {
    let boundaries = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown) {
        const elementBoundaries = element.getVertexSpaceBoundaries();
        boundaries = boundaries.concat(elementBoundaries);
      }
    }
    return boundaries;
  }

  // getBoundaries() {
  //   let boundaries = [];
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     if (element.isShown) {
  //       const elementBoundaries = element.getBoundaries();
  //       boundaries = boundaries.concat(elementBoundaries);
  //     }
  //   }
  //   return boundaries;
  // }

  getBoundingRect(
    space: 'local' | 'diagram' | 'vertex' | 'gl' = 'local',
    children: ?Array<string | DiagramElement> = null,
  ) {
    if (children == null) {
      const boundaries = this.getBoundaries(space);
      return getBoundingRect(boundaries);
    }

    const points = [];
    children.forEach((child) => {
      const e = this.getElement(child);
      if (e == null) {
        return;
      }
      const bound = e.getBoundingRect();
      points.push(new Point(bound.left, bound.bottom));
      points.push(new Point(bound.right, bound.top));
    });
    return getBoundingRect(points);
  }

  getGLBoundingRect() {
    const glAbsoluteBoundaries = this.getGLBoundaries();
    return getBoundingRect(glAbsoluteBoundaries);
  }

  getVertexSpaceBoundingRect(elementsToBound: ?Array<string | DiagramElement> = null) {
    if (elementsToBound == null) {
      // return super.getDiagramBoundingRect();
      const boundaries = this.getVertexSpaceBoundaries();
      return getBoundingRect(boundaries);
    }
    const points = [];
    elementsToBound.forEach((element) => {
      const e = this.getElement(element);
      if (e == null) {
        return;
      }
      const bound = e.getBoundingRect();
      points.push(new Point(bound.left, bound.bottom));
      points.push(new Point(bound.right, bound.top));
    });
    return getBoundingRect(points);
  }

  getRelativeGLBoundingRect() {
    const boundingRect = this.getGLBoundingRect();

    const location = new Point(0, 0).transformBy(this.lastDrawTransform.matrix());

    return new Rect(
      boundingRect.left - location.x,
      boundingRect.bottom - location.y,
      boundingRect.width,
      boundingRect.height,
    );
  }

  // deprecated
  getRelativeVertexSpaceBoundingRect(): Rect {
    const boundingRect = this.getVertexSpaceBoundingRect();

    const location = new Point(0, 0);

    return new Rect(
      boundingRect.left - location.x,
      boundingRect.bottom - location.y,
      boundingRect.width,
      boundingRect.height,
    );
  }

  updateLimits(
    limits: Rect,
    transforms: TypeSpaceTransforms = this.diagramTransforms,
  ) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.updateLimits(limits, transforms);
    }
    this.diagramLimits = limits;
    this.diagramTransforms = transforms;
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
  getTouched(glLocation: Point): Array<DiagramElementPrimitive | DiagramElementCollection> {
    if (!this.isTouchable && !this.hasTouchableElements) {
      return [];
    }
    let touched = [];
    if (this.touchInBoundingRect || this.isTouchable) {
      if (this.isBeingTouched(glLocation)) {
        touched.push(this);
      }
    }
    for (let i = this.drawOrder.length - 1; i >= 0; i -= 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.isShown === true) {
        touched = touched.concat(element.getTouched(glLocation));
      }

      // If there is an element that is touched, then this collection should
      // also be touched.
      // if (touched.length > 0 && this.isTouchable) {
      //   touched = [this].concat(touched);
      // }
    }
    return touched;
  }

  stop(cancelled: boolean = true, forceSetToEndOfPlan: ?boolean | 'complete' | 'noComplete' = false) {
    super.stop(cancelled, forceSetToEndOfPlan);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.stop(cancelled, forceSetToEndOfPlan);
      // element.cancel(forceSetToEndOfPlan);
    }
  }

  setFont(fontSize: number) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFont(fontSize);
    }
  }

  setColor(color: Array<number> = [0, 0, 0, 1], setDefault: boolean = true) {
    const nonNullColor = color != null ? color : [0, 0, 0, 0];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setColor(nonNullColor, setDefault);
    }
    this.color = nonNullColor.slice();
    if (setDefault) {
      this.defaultColor = this.color.slice();
    }
    // this.color = [color[0], color[1], color[2], color[3]];
  }

  setDimColor(color: Array<number> = [0, 0, 0, 1]) {
    const nonNullColor = color != null ? color : [0, 0, 0, 0];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setDimColor(nonNullColor);
    }
    this.dimColor = nonNullColor.slice();
  }

  undim() {
    this.color = this.defaultColor.slice();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.undim();
    }
  }

  dim(elementsToDim: ?Array<string | DiagramElement>) {
    if (elementsToDim == null
      || (Array.isArray(elementsToDim) && elementsToDim.length === 0)) {
      // super.dim();
      this.color = this.dimColor.slice();
      for (let i = 0; i < this.drawOrder.length; i += 1) {
        const element = this.elements[this.drawOrder[i]];
        element.dim();
      }
      return;
    }
    this.exec('dim', elementsToDim);
  }

  highlight(elementsToHighlight: ?Array<string | DiagramElement> = null) {
    if (elementsToHighlight == null) {
      this.undim();
      return;
    }

    if (Array.isArray(elementsToHighlight) && elementsToHighlight.length === 0) {
      return;
    }

    this.dim();
    this.exec('undim', elementsToHighlight);
  }

  getDiagramBoundingRect(elementsToBound: ?Array<string | DiagramElement> = null) {
    if (elementsToBound == null) {
      return super.getDiagramBoundingRect();
    }
    const points = [];
    elementsToBound.forEach((element) => {
      let e;
      if (typeof element === 'string') {
        e = this.getElement(element);
      } else {
        e = element;
      }
      if (e == null) {
        return;
      }
      const bound = e.getDiagramBoundingRect();
      points.push(new Point(bound.left, bound.bottom));
      points.push(new Point(bound.right, bound.top));
    });
    return getBoundingRect(points);
  }

  setOpacity(opacity: number) {
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setOpacity(opacity);
    }
    // this.color[3] = opacity;
    this.opacity = opacity;
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
      }
    }
  }

  reorder() {
    this.drawOrder.sort((a, b) => {
      const elemA = this.elements[a];
      const elemB = this.elements[b];
      return elemB.drawPriority - elemA.drawPriority;
    });
    // this.elements.sort((a, b) => {
    //   const elemA
    //   b.z - a.z});
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof DiagramElementCollection) {
        element.reorder();
      }
    }
  }

  animateToTransforms(
    elementTransforms: Object,
    time: number = 1,
    delay: number = 0,
    rotDirection: number = 0,
    callback: ?(?mixed) => void = null,
    easeFunction: (number) => number = tools.easeinout,
    // translationPath: (Point, Point, number) => Point = linearPath,
  ) {
    let callbackMethod = callback;
    let timeToAnimate = 0;
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element.name in elementTransforms) {
        if (element.isShown) {
          if (!elementTransforms[element.name].isEqualTo(element.transform)) {
            element.animations.new()
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
        }
      }
    }
    if (timeToAnimate === 0 && callbackMethod != null) {
      callbackMethod(true);
    }
    return timeToAnimate;
  }

  getAllPrimitives() {
    let elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof DiagramElementCollection) {
        elements = [...elements, ...element.getAllElements()];
      } else {
        elements.push(element);
      }
    }
    return elements;
  }

  getAllElements() {
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
      if (element.scenarios[scenario] != null) {
        elements.push(element);
      }
      if (element instanceof DiagramElementCollection) {
        elements = [...elements, ...element.getAllElementsWithScenario(scenario)];
      }
    }
    return elements;
  }

  // // Get all ineractive elemnts, but only go as deep as a
  // // DiagramElementColleciton if it is touchable or movable
  // getAllCurrentlyInteractiveElements() {
  //   let elements = [];
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     // if (element.isShown) {
  //     if (element instanceof DiagramElementCollection) {
  //       if (!element.isTouchable
  //         && !element.isMovable
  //         && element.hasTouchableElements
  //         && (!element.isInteractive || element.isInteractive == null)
  //       ) {
  //         elements = [...elements, ...element.getAllCurrentlyInteractiveElements()];
  //       }
  //     }
  //     if (element.isInteractive !== false
  //       && (element.isTouchable || element.isMovable || element.isInteractive)) {
  //       elements.push(element);
  //     }
  //     // }
  //   }
  //   return elements;
  // }

  // Get all ineractive elemnts, but only go as deep as a
  // DiagramElementColleciton if it is touchable or movable
  getAllPossiblyInteractiveElements() {
    let elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      // if (element.isShown) {
      if (element instanceof DiagramElementCollection) {
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
      // this.isMovable = true;
    }
  }

  // updateContext(context: DrawContext2D) {
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     element.updateContext(context);
  //   }
  // }

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
      if (element instanceof DiagramElementPrimitive) {
        if (element.drawingObject.state === 'loading') {
          elems.push(element);
        }
      } else {
        elems = [...elems, ...element.getLoadingElements()];
      }
    }
    return elems;
  }

  unrenderAll() {
    this.unrender();
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof DiagramElementPrimitive) {
        element.unrender();
      } else {
        element.unrenderAll();
      }
    }
  }

  setScenarios(scenarioName: string, onlyIfVisible: boolean = false) {
    super.setScenarios(scenarioName);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if ((onlyIfVisible && element.isShown) || onlyIfVisible === false) {
        element.setScenarios(scenarioName, onlyIfVisible);
      }
    }
  }
}

export {
  DiagramElementPrimitive, DiagramElementCollection,
  DiagramElement,
};
