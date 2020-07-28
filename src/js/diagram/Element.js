// @flow

import {
  Transform, Point, TransformLimit, Rect,
  Translation, spaceToSpaceTransform, getBoundingRect,
  Scale, Rotation, Line, getMaxTimeFromVelocity, clipAngle,
  getPoint, getTransform, getScale, // calculateStop, calculateStopAngle,
  TransformBounds, RectBounds, RangeBounds, BoundsLine, getTransformValue,
} from '../tools/g2';
// import { areColorsSame } from '../tools/color';
import { getState } from './state';
import type {
  TypeParsablePoint, TypeParsableTransform, TypeTransformationValue, TypeTransformValue,
} from '../tools/g2';
import { Recorder } from './Recorder';
import * as m2 from '../tools/m2';
// import type { pathOptionsType, TypeRotationDirection } from '../tools/g2';
import * as math from '../tools/math';
import HTMLObject from './DrawingObjects/HTMLObject/HTMLObject';
import DrawingObject from './DrawingObjects/DrawingObject';
import VertexObject from './DrawingObjects/VertexObject/VertexObject';
import { TextObject } from './DrawingObjects/TextObject/TextObject';
import {
  duplicateFromTo, joinObjects, joinObjectsWithOptions, SubscriptionManager,
  duplicate,
} from '../tools/tools';
import { colorArrayToRGBA, areColorsSame } from '../tools/color';
import GlobalAnimation from './webgl/GlobalAnimation';
import type { TypeWhen } from './webgl/GlobalAnimation';
// import DrawContext2D from './DrawContext2D';

import type { TypeSpaceTransforms } from './Diagram';
import type {
  TypePositionAnimationStepInputOptions, TypeAnimationBuilderInputOptions,
  TypeColorAnimationStepInputOptions, TypeTransformAnimationStepInputOptions,
  TypeRotationAnimationStepInputOptions, TypeScaleAnimationStepInputOptions,
  TypePulseAnimationStepInputOptions, TypeOpacityAnimationStepInputOptions,
  TypeParallelAnimationStepInputOptions, TypeTriggerStepInputOptions,
  TypeDelayStepInputOptions, TypePulseTransformAnimationStepInputOptions,
} from './Animation/Animation';
// eslint-disable-next-line import/no-cycle
import * as animations from './Animation/Animation';
import WebGLInstance from './webgl/webgl';
// import type Diagram from './Diagram';
import { FunctionMap } from '../tools/FunctionMap';
import type Diagram from './Diagram';
import type { TypePauseSettings, TypeOnPause } from './Recorder';

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

export type TypeScenario = {
  position?: TypeParsablePoint,
  rotation?: number,
  scale?: TypeParsablePoint | number,
  transform?: TypeParsableTransform,
  color?: Array<number>,
  isShown?: boolean,
};

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
    return newTransforms;
  }
  return inputTransforms.map(t => t._dup());
}


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
  pulseTransforms: Array<Transform>;
  frozenPulseTransforms: Array<Transform>;
  copyTransforms: Array<Transform>;
  drawTransforms: Array<Transform>;

  // presetTransforms: Object;       // Convenience dict of transform presets
  lastDrawTransform: Transform; // Transform matrix used in last draw
  lastDrawPulseTransform: Transform; // Transform matrix used in last draw
  parentTransform: Transform;
  // lastDrawParentTransform: Transform;
  // lastDrawElementTransform: Transform;
  // lastDrawPulseTransform: Transform;
  lastDrawElementTransformPosition: {parentCount: number, elementCount: number};

  lastDrawOpacity: number;

  parent: DiagramElement | null;

  isShown: boolean;                  // True if should be shown in diagram
  name: string;                   // Used to reference element in a collection

  isMovable: boolean;             // Element is able to be moved
  isTouchable: boolean;           // Element can be touched
  isInteractive: ?boolean;         // Touch event is not processed by Diagram
  hasTouchableElements: boolean;

  drawPriority: number;

  // Callbacks
  onClick: string | (?(?mixed) => void);
  setTransformCallback: ?(string | ((Transform) => void)); // element.transform is updated
  internalSetTransformCallback: ?(string | ((Transform) => void));
  beforeDrawCallback: string | (?(number) => void);
  afterDrawCallback: string | (?(number) => void);
  // redrawElements: Array<DiagramElement>;

  color: Array<number>;           // For the future when collections use color
  defaultColor: Array<number>;
  dimColor: Array<number>;
  opacity: number;
  // noRotationFromParent: boolean;

  interactiveLocation: Point;   // this is in vertex space
  // recorder: Recorder;
  diagram: Diagram;
  move: {
    // maxTransform: Transform,
    bounds: TransformBounds | Rect | Array<number> | 'diagram',
    // minTransform: Transform,
    // boundary: ?Rect | Array<number> | 'diagram',
    // limitLine: null | Line,
    transformClip: string | (?(Transform) => Transform);
    maxVelocity: TypeTransformValue;            // Maximum velocity allowed
    // When moving freely, the velocity decelerates until it reaches a threshold,
  // then it is considered 0 - at which point moving freely ends.
    freely: {                 // Moving Freely properties
      zeroVelocityThreshold: TypeTransformValue,  // Velocity considered 0
      deceleration: TypeTransformValue,           // Deceleration
      bounceLoss: TypeTransformValue,
      callback: ?(string | ((boolean) => void)),
    };
    // bounce: boolean;
    canBeMovedAfterLosingTouch: boolean;
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
    progression: string | ((number, number, number, number, number) => number),
    num: number,
    delta: TypeParsablePoint,
    transformMethod: string | ((number, ?Point) => Transform),
    callback: ?(string | ((mixed) => void));
    allowFreezeOnStop: boolean,
    // clearFrozenTransforms: boolean,
  };

  pulseDefault: string | ((?() => void) => void) | {
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
      previousTime: ?number,
      previousTransform: Transform,
      velocity: Transform,           // current velocity - will be clipped
                                        // at max if element is being moved
                                        // faster than max.
    },
    isPulsing: boolean,
    pulse: {
      startTime: ?number,
    },
    preparingToStop: boolean;
    // pause: 'paused' | 'preparingToPause' | 'preparingToUnpause' | 'unpaused';
  };

  animations: animations.AnimationManager;
  animationFinishedCallback: ?(string | (() => void));

  // pulse: Object;                  // Pulse animation state

  uid: string;

  // Rename to animate in future
  anim: Object;

  // pulse: (mixed) => void;
  // pulse: (?Array<string | DiagramElement> | mixed) => void;
  +pulse: (any, ?any) => void;
  +exec: (any, any) => void;
  +getElement: (any) => ?DiagramElement;
  +getElements: (any) => Array<DiagramElement>;
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

  custom: { [string]: any };

  stateProperties: Array<string>
  fnMap: FunctionMap;
  // isPaused: boolean;

  // finishAnimationOnPause: boolean;

  subscriptions: SubscriptionManager;

  lastDrawTime: number;

  // pauseSettings: TypePauseSettings;

  dependantTransform: boolean;

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
    diagramLimitsOrDiagram: Diagram | Rect = new Rect(-1, -1, 2, 2),
    parent: DiagramElement | null = null,
  ) {
    this.name = ''; // This is updated when an element is added to a collection
    this.uid = (Math.random() * 1e18).toString(36);
    this.isShown = true;
    this.transform = transform._dup();
    this.dependantTransform = false;
    this.fnMap = new FunctionMap();
    this.subscriptions = new SubscriptionManager(this.fnMap);
    this.isMovable = false;
    this.isTouchable = false;
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
    this.parentTransform = new Transform();
    this.lastDrawPulseTransform = this.transform._dup();
    this.onClick = null;
    this.lastDrawElementTransformPosition = {
      parentCount: 0,
      elementCount: 0,
    };
    // this.redrawElements = [];
    // this.diagram = null;
    this.recorder = new Recorder(true);
    this.custom = {};
    this.parent = parent;
    this.drawPriority = 1;
    this.stateProperties = [];
    // this.finishAnimationOnPause = false;
    this.lastDrawTime = 0;
    // this.noRotationFromParent = false;
    // this.pulseDefault = (callback: ?() => void = null) => {
    //   this.pulseScaleNow(1, 2, 0, callback);
    // };
    this.pulseDefault = {
      frequency: 0,
      scale: 2,
      time: 1,
    };
    // this.isPaused = false;
    // this.copies = [];

    // this.pauseSettings = {};

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
      trigger: (...optionsIn: Array<TypeTriggerStepInputOptions>) => {
        const options = joinObjects({}, ...optionsIn);
        return new animations.TriggerStep(options);
      },
      delay: (...optionsIn: Array<TypeDelayStepInputOptions>) => {
        const options = joinObjects({}, ...optionsIn);
        return new animations.DelayStep(options);
      },
      translation: (...optionsIn: Array<TypePositionAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.PositionAnimationStep(options);
      },
      position: (...optionsIn: Array<TypePositionAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.PositionAnimationStep(options);
      },
      color: (...optionsIn: Array<TypeColorAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.ColorAnimationStep(options);
      },
      opacity: (...optionsIn: Array<TypeOpacityAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.OpacityAnimationStep(options);
      },
      transform: (...optionsIn: Array<TypeTransformAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.TransformAnimationStep(options);
      },
      pulseTransform: (...optionsIn: Array<TypePulseTransformAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.PulseTransformAnimationStep(options);
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
      dim: (timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {}, ...args: Array<TypeColorAnimationStepInputOptions>) => {
        const defaultOptions = { element: this };
        let options;
        if (typeof timeOrOptionsIn === 'number') {
          options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
        } else {
          options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
        }
        return new animations.DimAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      undim: (timeOrOptionsIn: number | TypeColorAnimationStepInputOptions = {}, ...args: Array<TypeColorAnimationStepInputOptions>) => {
        const defaultOptions = { element: this };
        let options;
        if (typeof timeOrOptionsIn === 'number') {
          options = joinObjects({}, defaultOptions, { duration: timeOrOptionsIn }, ...args);
        } else {
          options = joinObjects({}, defaultOptions, timeOrOptionsIn, ...args);
        }
        return new animations.UndimAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      builder: (...optionsIn: Array<TypeAnimationBuilderInputOptions>) => new animations.AnimationBuilder(this, ...optionsIn),
      scenario: (...optionsIn: Array<TypeScenarioAnimationStepInputOptions>) => {
        const options = joinObjects({}, { element: this }, ...optionsIn);
        return new animations.ScenarioAnimationStep(options);
      },
      // eslint-disable-next-line max-len
      // scenario: (...optionsIn: Array<TypeTransformAnimationStepInputOptions
      //                             & {
      //                                 start?: TypeScenario,
      //                                 target: TypeScenario,
      //                                }>) => {
      //   const defaultOptions = { element: this, delay: 0 };
      //   const options = joinObjects({}, defaultOptions, ...optionsIn);

      //   // Retrieve the target scenario
      //   if (options.target != null) {
      //     const target = options.element.getScenarioTarget(options.target);
      //     if (Object.keys(target).length > 0) {
      //       options.target = target;
      //     }
      //   }
      //   // Retrieve the start scenario (if it doesn't exist, then the element's values
      //   // at the time the animation starts will be used).
      //   if (options.start != null) {
      //     const start = options.element.getScenarioTarget(options.start);
      //     if (Object.keys(start).length > 0) {
      //       options.start = start;
      //     }
      //   }

      //   const { start, target, element } = options;
      //   const steps = [];
      //   const duration = this.getTimeToMoveToScenario(target, options, start || '');
      //   options.duration = duration;
      //   const timeOptions = { delay: options.delay, duration: options.duration };
      //   options.delay = 0;
      //   options.velocity = undefined;
      //   let startColor;
      //   let startTransform;
      //   let startIsShown;

      //   if (start != null) {
      //     if (start.color != null) {
      //       startColor = start.color.slice();
      //     }
      //     if (start.transform != null) {
      //       startTransform = start.transform._dup();
      //     }
      //     if (start.isShown != null) {
      //       startIsShown = start.isShown;
      //     }
      //   }

      //   if (target.color != null) {
      //     steps.push(element.anim.color({
      //       start: startColor,
      //       target: target.color,
      //       duration: options.duration,
      //     }));
      //   }

      //   if (target.transform != null) {
      //     steps.push(element.anim.transform(options, {
      //       start: startTransform,
      //       target: target.transform,
      //     }));
      //   }
      //   if (target.isShown != null) {
      //     if (startIsShown != null) {
      //       if (target.isShown === true && startIsShown === true) {
      //         steps.push(element.anim.dissolveIn({ duration: 0 }));
      //       }
      //       if (target.isShown === false && startIsShown === false) {
      //         steps.push(element.anim.dissolveOut({ duration: 0 }));
      //       }
      //       if (target.isShown === false && startIsShown === true) {
      //         steps.push(element.anim.dissolveOut({ duration: options.duration }));
      //       }
      //       if (target.isShown === true && startIsShown === false) {
      //         steps.push(element.anim.dissolveIn({ duration: options.duration }));
      //       }
      //     } else {
      //       let dissolveFromCurrent = true;
      //       if (options.dissolveFromCurrent != null && options.dissolveFromCurrent === false) {
      //         dissolveFromCurrent = false;
      //       }
      //       if (target.isShown) {
      //         steps.push(element.anim.opacity({
      //           duration: options.duration,
      //           dissolve: 'in',
      //           dissolveFromCurrent,
      //         }));
      //       } else {
      //         steps.push(element.anim.opacity({
      //           duration: options.duration,
      //           dissolve: 'out',
      //           dissolveFromCurrent,
      //         }));
      //       }
      //     }
      //   }
      //   return new animations.ParallelAnimationStep(timeOptions, { steps });
      // },
      // scenarioLegacy: (...optionsIn: Array<TypeTransformAnimationStepInputOptions
      //                          & { scenario: string }>) => {
      //   const defaultOptions = { element: this };
      //   const options = joinObjects({}, defaultOptions, ...optionsIn);
      //   if (options.target != null
      //     && options.target in options.element.scenarios
      //   ) {
      //     const target = options.element.getScenarioTargetLegacy(options.target);
      //     options.target = target;
      //   }
      //   if (options.start != null
      //     && options.start in options.element.scenarios
      //   ) {
      //     const start = options.element.getScenarioTargetLegacy(options.start);
      //     options.start = start;
      //   }
      //   if (options.delta != null
      //     && options.delta in options.element.scenarios
      //   ) {
      //     const delta = options.element.getScenarioTargetLegacy(options.delta);
      //     options.delta = delta;
      //   }
      //   return new animations.TransformAnimationStep(options);
      // },
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
    if (diagramLimitsOrDiagram instanceof Rect) {
      this.diagramLimits = diagramLimitsOrDiagram;
    } else if (diagramLimitsOrDiagram != null) {
      this.diagramLimits = this.diagram.limits._dup();
    }
    this.move = {
      // maxTransform: this.transform.constant(1000),
      // minTransform: this.transform.constant(-1000),
      bounds: new TransformBounds(this.transform),
      // bounds: { scale: null, rotation: null, position: null },
      // boundary: null,
      maxVelocity: 5,
      // maxVelocity: new TransformLimit(5, 5, 5),
      freely: {
        zeroVelocityThreshold: 0.0001,
        deceleration: 5,
        callback: null,
        bounceLoss: 0.5,
      },
      // bounce: true, // deprecate
      canBeMovedAfterLosingTouch: false,
      type: 'translation',
      element: null,
      // limitLine: null,
      transformClip: null,
    };

    this.scenarios = {};

    const pulseTransformMethod = (s, d) => {
      if (d == null || (d.x === 0 && d.y === 0)) {
        return new Transform().scale(s, s);
      }
      return new Transform()
        .translate(-d.x, -d.y)
        .scale(s, s)
        .translate(d.x, d.y);
    };
    this.fnMap.add('_elementPulseSettingsTransformMethod', pulseTransformMethod);
    this.fnMap.add('tools.math.easeinout', math.easeinout);
    this.fnMap.add('tools.math.linear', math.linear);
    this.fnMap.add('tools.math.sinusoid', math.sinusoid);
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
      // clearFrozenTransforms: false,
    };

    this.state = {
      isBeingMoved: false,
      isMovingFreely: false,
      movement: {
        previousTime: null,
        previousTransform: this.transform._dup(),
        velocity: this.transform.zero(),
      },

      isPulsing: false,
      pulse: {
        startTime: null,
      },
      pause: 'unpaused',
      preparingToStop: false,
    };
    this.interactiveLocation = new Point(0, 0);
    this.animationFinishedCallback = null;
    this.animations = new animations.AnimationManager({
      element: this,
      finishedCallback: this.animationFinished.bind(this),
    });
    this.tieToHTML = {
      element: null,
      scale: 'fit',
      window: this.diagramLimits,
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
    // console.log('element', this.name, this.animationFinishedCallback)
    this.fnMap.exec(this.animationFinishedCallback);
    this.subscriptions.trigger('animationFinished', typeOfAnimation);
  }

  // animationsFinishedCallback(element: DiagramElement) {
  //   if (this.parent != null) {
  //     this.parent.animationsFinishedCallback(element);
  //   }
  // }

  setProperties(properties: Object, except: Array<string> | string = []) {
    joinObjectsWithOptions({
      except,
    }, this, properties);
  }


  _getStateProperties(options: { ignoreShown: boolean }) {
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
        'isShown',
        'isMovable',
        'isTouchable',
        'state',
        'pulseSettings',
        'setTransformCallback',
        'move',
        'subscriptions',
        // 'finishAnimationOnPause',
        'pulseTransforms',
        'frozenPulseTransforms',
        // 'lastDrawTime',
        ...this.stateProperties,
      ];
    }
    return [
      'isShown',
      'transform',
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

  _state(options: { precision: number, ignoreShown: boolean, min?: boolean }) {
    if (options.min) {
      return getState(this, this._getStatePropertiesMin(options), options);
    }
    return getState(this, this._getStateProperties(options), options);
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

  setTimeDelta(delta: number) {
    if (this.animations.state === 'animating') {
      this.animations.setTimeDelta(delta);
    }
    if (this.state.isPulsing) {
      this.state.pulse.startTime += delta;
    }
    if (this.state.movement.previousTime !== null) {
      this.state.movement.previousTime += delta;
    }
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

  // animateToPulseTransforms(pulseTranforms: Array<Transform>) {
  //   let startTransforms = this.pulseTransforms;
  //   if (pulseTransforms.length != this.startTransforms.length) {
  //     startTransforms = [];
  //     for (let i = 0; i < pulseTranforms.length; i += 1) {
  //       startTransforms.push(this.transform._dup());
  //     }
  //   }
  // }

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
    startTime: ?number | 'now' | 'prev' | 'next' = null,
  ) {
    // if (this.name === 'a') {
    //   console.log(this.frozenPulseTransforms)
    // }
    const target = {};
    if (
      (this.isShown !== state.isShown && this.opacity === 1) 
      || this.opacity !== 1
    ) {
      target.isShown = state.isShown;
    }
    if (!areColorsSame(this.color, state.color)) {
      target.color = state.color;
    }
    const stateTransform = getTransform(state.transform);
    if (
      !this.transform.isEqualTo(stateTransform)
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
      scenarioAnimation = this.anim.scenario(scenarioOptions);
    }
    // let pulseTrigger = null;
    // let pulseDelay = null;
    // let delay = 0;
    let pulseAnimation = null;

    if (!this.arePulseTransformsSame(state)) {
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

      pulseAnimation = this.anim.pulseTransform(joinObjects({}, options, {
        start: startPulseTransforms,
        target: targetPulseTransforms,
      }));
      // console.log(pulseAnimation)
    }

    if (scenarioAnimation != null || pulseAnimation != null) {
      this.animations.new()
        .inParallel([
          scenarioAnimation,
          pulseAnimation,
        ])
        // .then(scenarioAnimation)
        // .then(pulseTrigger)
        // .then(pulseDelay)
        .start(startTime);
    }
    if (scenarioAnimation != null) {
      duration = Math.max(duration, scenarioAnimation.getTotalDuration());
    }
    if (pulseAnimation != null) {
      duration = Math.max(duration, pulseAnimation.getTotalDuration());
    }
    // if (this.name === 'a') {
    //   console.log(this.frozenPulseTransforms)
    // }

    return duration;
  }

  dissolveInToState(
    state: Object,
    duration: number = 0.8,
    startTime: ?number | 'now' | 'prev' | 'next' = null,
  ) {
    if (state.isShown === false) {
      return 0;
    }
    const target = {};
    this.transform = getTransform(state.transform);
    this.color = state.color.slice();
    this.frozenPulseTransforms = [];
    state.pulseTransforms.forEach((t) => this.frozenPulseTransforms.push(getTransform(t)));
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

  isStateSame(state: Object, mergePulseTransforms: boolean = false) {
    if (this.isShown != state.isShown || this.opacity != state.opacity) {
      return false;
    }
    if (!areColorsSame(this.color, state.color)) {
      return false;
    }
    if (!this.transform.isEqualTo(getTransform(state.transform))) {
      return false;
    }

    if (mergePulseTransforms) {
      return this.arePulseTransformsSame(state);
    }
    if (state.pulseTransforms.length !== this.pulseTransforms.length) {
      return false;
    }
    for (let i = 0; i < this.pulseTransforms.length; i += 1) {
      if (!this.pulseTransforms[i].isEqualTo(getTransform(state.pulseTransforms[i]))) {
        return false;
      }
    }
    return true;
  }

  arePulseTransformsSame(state: Object) {
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
      if (!pulseTransforms[i].isEqualTo(statePulseTransforms[i])) {
        return false;
      }
    }
    return true;
  }

  getDrawTransforms(initialTransforms: Array<Transform>) {
    // let drawTransforms = [transform];
    let drawTransforms = transformBy(initialTransforms, this.copyTransforms);
    drawTransforms = transformBy(drawTransforms, this.pulseTransforms);
    drawTransforms = transformBy(drawTransforms, this.frozenPulseTransforms);
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

  // pulseScaleRelativeTo(
  //   e: DiagramElement | TypeParsablePoint | null,
  //   x: 'left' | 'center' | 'right' | 'origin' | number,
  //   y: 'bottom' | 'middle' | 'top' | 'origin' | number,
  //   space: 'diagram' | 'gl' | 'vertex' | 'local',
  //   time: number,
  //   scale: number,
  //   frequency: number = 0,
  //   callback: ?(?mixed) => void = null,
  // ) {
  //   if (e == null || e instanceof DiagramElement) {
  //     this.pulseScaleRelativeToElement(e, x, y, space, time, scale, frequency, callback);
  //   } else {
  //     this.pulseScaleRelativeToPoint(e, space, time, scale, frequency, callback)
  //   }
  // }
  pulse(optionsOrDone: {
      x?: 'left' | 'center' | 'right' | 'origin' | number,
      y?: 'bottom' | 'middle' | 'top' | 'origin' | number,
      space?: 'diagram' | 'gl' | 'local' | 'vertex',
      centerOn?: null | DiagramElement | TypeParsablePoint,
      frequency?: number,
      time?: number,
      scale?: number,
      done?: ?(mixed) => void,
      progression: string | (number) => number,
    } | ?(mixed) => void = null) {
    const defaultPulseOptions = {
      frequency: 0,
      time: 1,
      scale: 2,
    };
    if (
      typeof this.pulseDefault !== 'function'
      && typeof this.pulseDefault !== 'string'
    ) {
      defaultPulseOptions.frequency = this.pulseDefault.frequency;
      defaultPulseOptions.time = this.pulseDefault.time;
      defaultPulseOptions.scale = this.pulseDefault.scale;
    }
    const defaultOptions = {
      x: 'center',
      y: 'middle',
      space: 'diagram',
      centerOn: null,
      frequency: defaultPulseOptions.frequency,
      time: defaultPulseOptions.time,
      scale: defaultPulseOptions.scale,
      done: null,
      progression: 'tools.math.sinusoid',
    };
    let done;
    let options = defaultOptions;

    if (typeof optionsOrDone === 'function' || typeof optionsOrDone === 'string') {
      options = defaultOptions;
      done = optionsOrDone;
    } else if (optionsOrDone == null) {
      options = defaultOptions;
      done = null;
    } else {
      options = joinObjects({}, defaultOptions, optionsOrDone);
      ({ done } = options);
    }
    if (
      typeof this.pulseDefault === 'function'
      || typeof this.pulseDefault === 'string'
    ) {
      this.fnMap.exec(this.pulseDefault, done);
    } else {
      // const { frequency, time, scale } = this.pulseDefault;
      // this.pulseScaleNow(time, scale, frequency, done);
      this.pulseScaleRelativeTo(
        options.centerOn,
        options.x,
        options.y,
        options.space,
        options.time,
        options.scale,
        options.frequency,
        done,
        options.progression,
      );
    }
  }

  // pulseLegacy(done: ?(mixed) => void = null) {
  //   if (
  //     typeof this.pulseDefault === 'function'
  //     || typeof this.pulseDefault === 'string'
  //   ) {
  //     this.execFn(this.pulseDefault, done);
  //   } else {
  //     const { frequency, time, scale } = this.pulseDefault;
  //     this.pulseScaleNow(time, scale, frequency, done);
  //   }
  // }

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

  // getPauseSettings(pauseSettingsIn: TypePauseSettings): {
  //   animation: TypeOnPause,
  //   pulse: TypeOnPause,
  //   movingFreely: TypeOnPause,
  // } {
  //   let pauseSettings;
  //   let defaultPause = 'freeze';
  //   if (typeof pauseSettingsIn === 'string') {
  //     pauseSettings = {
  //       animation: pauseSettingsIn,
  //       pulse: pauseSettingsIn,
  //       movingFreely: pauseSettingsIn,
  //     }
  //     defaultPause = pauseSettingsIn;
  //   } else {
  //     pauseSettings = {
  //       animation: pauseSettingsIn.animation,
  //       pulse: pauseSettingsIn.pulse,
  //       movingFreely: pauseSettingsIn.movingFreely,
  //     }
  //     defaultPause = pauseSettingsIn.default;
  //   };
  //   if (typeof this.pauseSettings === 'string') {
  //     defaultPause = this.pauseSettings;
  //   }
  //   if (defaultPause == null) {
  //     defaultPause = 'freeze';
  //   }
  //   if (typeof this.pauseSettings === 'object' && this.pauseSettings.animation != null) {
  //     pauseSettings.animation = this.pauseSettings.animation;
  //   }
  //   if (typeof this.pauseSettings === 'object' && this.pauseSettings.pulse != null) {
  //     pauseSettings.pulse = this.pauseSettings.pulse;
  //   }
  //   if (typeof this.pauseSettings === 'object' && this.pauseSettings.movingFreely != null) {
  //     pauseSettings.movingFreely = this.pauseSettings.movingFreely;
  //   }
  //   if (pauseSettings.animation == null) {
  //     pauseSettings.animation = defaultPause;
  //   }
  //   if (pauseSettings.pulse == null) {
  //     pauseSettings.pulse = defaultPause;
  //   }
  //   if (pauseSettings.movingFreely == null) {
  //     pauseSettings.movingFreely = defaultPause;
  //   }
  //   return pauseSettings;
  // }

  // pauseLegacy(pauseSettingsIn: TypePauseSettings = {}) {
  //   const pause = () => {
  //     this.isPaused = true;
  //     this.state.pause = 'paused';
  //     this.subscriptions.trigger('paused');
  //   };
  //   if (pauseSettingsIn.simplePause != null && pauseSettingsIn.simplePause) {
  //     pause();
  //     return;
  //   }
  //   // console.log(pauseSettingsIn)
  //   let pauseWhenFinished = false;
  //   const { animation, pulse, movingFreely } = this.getPauseSettings(pauseSettingsIn);
  //   // console.log(animation, pulse)

  //   if (this.animations.isAnimating()) {
  //     if (animation === 'completeBeforePause') {
  //       pauseWhenFinished = true;
  //     } else if (animation === 'complete') {
  //       this.animations.cancelAll('complete');
  //     } else {
  //       this.animations.cancelAll('noComplete');
  //     }
  //   }
  //   // console.log(this.name, pauseWhenFinished)
  //   if (this.state.isPulsing) {
  //     if (pulse === 'completeBeforePause') {
  //       pauseWhenFinished = true;
  //     } else if (pulse === 'complete') {
  //       this.stopPulsing('complete');
  //     } else {
  //       this.stopPulsing('freeze');
  //     }
  //   }
  //   // console.log(this.name, pauseWhenFinished)
  //   if (pauseWhenFinished) {
  //     this.state.pause = 'preparingToPause';
  //     this.subscriptions.trigger('preparingToPause');
  //     this.subscriptions.subscribe('animationFinished', pause, 1);
  //   } else {
  //     pause();
  //   }
  // }

  // unpauseLegacy() {
  //   this.isPaused = false;
  //   if (this.state.pause !== 'unpaused') {
  //     this.subscriptions.trigger('unpaused');
  //   }
  //   this.state.pause = 'unpaused';
  // }

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
    if (this.move.transformClip != null) {
      this.transform = this.fnMap.exec(this.move.transformClip, transform);
    } else {
      // console.log(transform)
      // let { bounds } = this.move;
      // if (bounds === 'diagram') {
      //   bounds = new TransformBounds(this.transform);
      //   bounds.updateTranslation(new RectBounds(this.diagram.limits));
      // }
      if (window.asdf && this.name === 'c') {
        debugger;
      }
      if (!(this.move.bounds instanceof TransformBounds)) {
        this.setMoveBounds();
      }
      if (this.move.bounds instanceof TransformBounds) {
        this.transform = this.move.bounds.clip(transform);
        // if (this.name === 'c') {
          // console.log(transform)
          // console.log(this.transform)
          // console.log(this.move.bounds.boundary[2])
        // }
      }
      // console.log(this.transform)
      // this.transform = transform._dup().clip(
      //   this.move.minTransform,
      //   this.move.maxTransform,
      //   this.move.limitLine,
      // );
    }
    if (this.internalSetTransformCallback) {
      this.fnMap.exec(this.internalSetTransformCallback, this.transform);
    }
    this.fnMap.exec(this.setTransformCallback, this.transform);
    this.subscriptions.trigger('setTransform', [this.transform]);
    // if (this.setTransformCallback) {
    //   this.setTransformCallback(this.transform);
    // }
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
      if (this.state.movement.previousTime === null) {
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

  // getScenarioTargetLegacy(
  //   scenarioName: string,
  // ) {
  //   let target = this.transform._dup();
  //   if (scenarioName in this.scenarios) {
  //     const scenario = this.scenarios[scenarioName];
  //     if (scenario.transform != null) {
  //       target = getTransform(scenario.transform);
  //     }
  //     if (scenario.position != null) {
  //       target.updateTranslation(getPoint(scenario.position));
  //     }

  //     if (scenario.rotation != null) {
  //       target.updateRotation(scenario.rotation);
  //     }
  //     if (scenario.scale != null) {
  //       target.updateScale(getScale(scenario.scale));
  //     }
  //   }
  //   return target;
  // }

  // retrieve a scenario
  getScenarioTarget(
    scenarioIn: string | TypeScenario,
  ): { transform?: Transform, color?: Array<number>, isShown?: boolean } {
    let transform;
    let color;
    let isShown;
    let scenario;
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

  setScenario(scenario: string | TypeScenario) {
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

  setScenarios(scenarioName: string) {
    if (this.scenarios[scenarioName] != null) {
      this.setScenario(scenarioName);
    }
  }

  saveScenario(
    scenarioName: string,
    keys: Array<string> = ['transform', 'color', 'isShown'],
  ) {
    // const scenario = {};
    // keys.forEach((key) => {
    //   if (key === 'transform') {
    //     scenario.transform = this.transform._dup();
    //   } else if (key === 'position') {
    //     scenario.position = this.getPosition();
    //   } else if (key === 'rotation') {
    //     scenario.rotation = this.getRotation();
    //   } else if (key === 'scale') {
    //     scenario.scale = this.getScale();
    //   } else if (key === 'color') {
    //     scenario.color = this.color.slice();
    //   } else if (key === 'isShown') {
    //     scenario.isShown = this.isShown;
    //   }
    // });
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

  // animateToScenario() {

  // }

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
  decelerate(deltaTime: ?number): Object {
    let bounds;
    if (!this.move.bounds instanceof TransformBounds) {
      this.setMoveBounds();
    }
    if (!this.move.bounds instanceof TransformBounds) {
      bounds = new TransformBounds(this.transform);
    } else {
      ({ bounds } = this.move);
    }
    const next = this.transform.decelerate(
      this.state.movement.velocity,
      this.move.freely.deceleration,
      deltaTime,
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
    const { parentCount } = this.lastDrawElementTransformPosition;
    const pLength = this.lastDrawTransform.order.length;
    const transform = this.getTransform();
    transform.order.forEach((t, index) => {
      this.lastDrawTransform.order[pLength - parentCount - index - 1] = t._dup();
    });
    this.lastDrawTransform.calcMatrix();
  }

  getParentLastDrawTransform() {
    const { parentCount } = this.lastDrawElementTransformPosition;
    return new Transform(this.lastDrawTransform.order.slice(-parentCount));
  }

  getPath() {
    if (this.parent == null) {
      return this.name;
    }
    if (this.parent.name === 'diagramRoot' || this.parent.parent == null) {
      return this.name;
    }
    return `${this.parent.getPath()}.${this.name}`;
  }
  
  getPause() {
    return this.state.pause;
  }

  // Being Moved
  startBeingMoved(): void {
    // this.stopAnimating();
    this.animations.cancelAll('noComplete');
    this.stopMovingFreely('freeze');
    this.state.movement.velocity = this.transform.zero();
    this.state.movement.previousTransform = this.transform._dup();
    this.state.movement.previousTime = new GlobalAnimation().now() / 1000;
    this.state.isBeingMoved = true;
    this.unrender();
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent('startBeingMoved', [this.getPath()]);
    }
  }

  moved(newTransform: Transform): void {
    this.calcVelocity(newTransform);
    this.setTransform(newTransform._dup());
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent(
        'moved',
        [
          this.getPath(),
          this.transform.round(this.recorder.precision)._state(),
        ],
        // this.state.movement.velocity.toString(),
      );
    }
  }

  stopBeingMoved(): void {
    if (!this.state.isBeingMoved) {
      return;
    }
    const currentTime = new GlobalAnimation().now() / 1000;
    // Check wether last movement was a long time ago, if it was, then make
    // velocity 0 as the user has stopped moving before releasing touch/click
    if (this.state.movement.previousTime !== null) {
      if ((currentTime - this.state.movement.previousTime) > 0.05) {
        this.state.movement.velocity = this.transform.zero();
      }
    }
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

  calcVelocity(newTransform: Transform): void {
    const currentTime = new GlobalAnimation().now() / 1000;
    if (this.state.movement.previousTime === null) {
      this.state.movement.previousTime = currentTime;
      return;
    }
    // console.log(currentTime, this.state.movement.previousTime)
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

  simulateStartMovingFreely(transform: Transform, velocity: Transform) {
    this.transform = transform;
    this.state.movement.velocity = velocity;
    this.startMovingFreely();
  }

  // Moving Freely
  startMovingFreely(callback: ?(string | ((boolean) => void)) = null): void {
    // this.stopAnimating();
    this.animations.cancelAll('noComplete');
    this.stopBeingMoved();
    if (callback) {
      // this.animate.transform.callback = callback;
      this.move.freely.callback = callback;
    }
    this.state.isMovingFreely = true;
    // this.state.movement.previousTime = null;
    this.state.movement.previousTime = new GlobalAnimation().now() / 1000;
    this.state.movement.velocity = this.state.movement.velocity.clipMag(
      this.move.freely.zeroVelocityThreshold,
      this.move.maxVelocity,
    );
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent(
        'startMovingFreely',
        [
          this.getPath(),
          this.transform._state(),
          this.state.movement.velocity._state(),
        ],
        // this.state.movement.velocity.toString(),
      );
    }
  }

  stopMovingFreely(how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel'): void {
    if (how === 'animateToComplete') {
      return;
    }
    // console.log(how)
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
      this.subscriptions.trigger('stopMovingFreely');
    }
  }

  // stopMovingFreelyLegacy(result: boolean = true): void {
  //   // console.trace()
  //   // console.log('was moving freely', this.name, this.state.isMovingFreely)
  //   let wasMovingFreely = false;
  //   if (this.state.isMovingFreely === true) {
  //     wasMovingFreely = true;
  //   }
  //   this.state.isMovingFreely = false;
  //   this.state.movement.previousTime = null;
  //   if (this.move.freely.callback) {
  //     this.fnMap.exec(this.move.freely.callback, result);
  //     this.move.freely.callback = null;
  //   }
  //   if (wasMovingFreely) {
  //     // console.log('stop moving freely callback', this.animationFinishedCallback)
  //     this.fnMap.exec(this.animationFinishedCallback);
  //     // this.subscriptions.trigger('animationFinished', ['movingFreely']);
  //     this.animationFinished('movingFreely');
  //   }
  // }

  getRemainingPulseTime(now: number = new GlobalAnimation().now() / 1000) {
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
    // If the diagram element is currently pulsing, the calculate the current
    // pulse magnitude, and transform the input matrix by the pulse
    if (this.state.isPulsing) {
      // If this is the first pulse frame, then set the startTime
      if (this.state.pulse.startTime === null) {
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
        );
        // if(this.name === '_radius') {
        // }
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

  pulseScaleNow(
    time: number, scale: number,
    frequency: number = 0, callback: ?(string | ((?mixed) => void)) = null,
    delta: TypeParsablePoint = new Point(0, 0),
    progression: string | (number) => number = 'tools.math.sinusoid',
  ) {
    // this.pulseSettings.time = time;
    // if (frequency === 0 && time === 0) {
    //   this.pulseSettings.frequency = 1;
    // }
    // if (frequency !== 0) {
    //   this.pulseSettings.frequency = frequency;
    // }
    // if (time !== 0 && frequency === 0) {
    //   this.pulseSettings.frequency = 1 / (time * 2);
    // }

    // this.pulseSettings.A = 1;
    // this.pulseSettings.B = scale - 1;
    // this.pulseSettings.C = 0;
    // this.pulseSettings.num = 1;
    // this.pulseSettings.delta = getPoint(delta);
    // // this.pulseSettings.transformMethod = s => new Transform().scale(s, s);
    // this.pulseSettings.callback = callback;
    // this.pulseSettings.progression = progression;
    // this.startPulsing();

    this.pulseScale({
      duration: time,
      scale,
      frequency,
      callback,
      delta,
      progression,
      when: 'nextFrame',
    });
  }

  pulseScale(optionsIn: {
    duration?: number,
    scale?: number,
    callback?: ?(string | ((?mixed) => void)),
    delta?: TypeParsablePoint,
    when?: TypeWhen,
    progression?: string | (number) => number,
  }) {
    const options = joinObjects({}, {
      duration: 1,
      scale: 2,
      callback: null,
      delta: [0, 0],
      when: 'sync',
      progression: 'tools.math.sinusoid',
    }, optionsIn);

    if (
      options.frequency == null
      || (options.frequency === 0 && options.duration !== 0)
    ) {
      options.frequency = 1 / (options.duration * 2);
    }
    if (options.frequency === 0 && options.duration === 0) {
      options.frequency = 1;
    }
    this.pulseSettings.time = options.duration;
    this.pulseSettings.frequency = options.frequency;
    this.pulseSettings.A = 1;
    this.pulseSettings.B = options.scale - 1;
    this.pulseSettings.C = 0;
    this.pulseSettings.num = 1;
    this.pulseSettings.delta = getPoint(options.delta);
    // this.pulseSettings.transformMethod = s => new Transform().scale(s, s);
    this.pulseSettings.callback = options.callback;
    this.pulseSettings.progression = options.progression;
    this.startPulsing(options.when);
  }

  pulseScaleRelativeToPoint(
    p: TypeParsablePoint,
    space: 'diagram' | 'gl' | 'vertex' | 'local',
    time: number,
    scale: number,
    frequency: number = 0,
    callback: ?(string | ((?mixed) => void)) = null,
    progression: string | (number) => number = 'tools.math.sinusoid',
  ) {
    const currentPosition = this.getPosition(space);
    const delta = getPoint(p).sub(currentPosition);
    this.pulseScaleNow(time, scale, frequency, callback, delta, progression);
  }

  pulseScaleRelativeToElement(
    e: ?DiagramElement,
    x: 'left' | 'center' | 'right' | 'origin' | number,
    y: 'bottom' | 'middle' | 'top' | 'origin' | number,
    space: 'diagram' | 'gl' | 'vertex' | 'local',
    time: number,
    scale: number,
    frequency: number = 0,
    callback: ?(string | ((?mixed) => void)) = null,
    progression: string | (number) => number = 'tools.math.sinusoid',
  ) {
    let p;
    if (e == null) {
      p = this.getPositionInBounds(space, x, y);
    } else {
      p = e.getPositionInBounds(space, x, y);
    }
    this.pulseScaleRelativeToPoint(p, space, time, scale, frequency, callback, progression);
  }

  pulseScaleRelativeTo(
    e: DiagramElement | TypeParsablePoint | null,
    x: 'left' | 'center' | 'right' | 'origin' | number,
    y: 'bottom' | 'middle' | 'top' | 'origin' | number,
    space: 'diagram' | 'gl' | 'vertex' | 'local',
    time: number,
    scale: number,
    frequency: number = 0,
    callback: ?(string | ((?mixed) => void)) = null,
    progression: string | (number) => number = 'tools.math.sinusoid',
  ) {
    if (e == null || e instanceof DiagramElement) {
      this.pulseScaleRelativeToElement(e, x, y, space, time, scale, frequency, callback, progression);
    } else {
      this.pulseScaleRelativeToPoint(e, space, time, scale, frequency, callback, progression);
    }
  }

  pulseThickNow(
    time: number, scale: number,
    num: number = 3, callback: ?(string | ((?mixed) => void)) = null,
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
    this.startPulsing();
  }

  pulseThick(optionsIn: {
    duration: number,
    scale: number,
    num: number,
    callback: ?(string | ((?mixed) => void)),
    when: TypeWhen,
  }) {
    const options = joinObjects({}, {
      duration: 1,
      scale: 2,
      callback: null,
      // delta: [0, 0],
      when: 'sync',
      num: 3
    }, optionsIn);
    let bArray = [options.scale];
    this.pulseSettings.num = options.num;
    if (this.pulseSettings.num > 1) {
      const b = Math.abs(1 - options.scale);
      const bMax = b;
      const bMin = -b;
      const range = bMax - bMin;
      const bStep = range / (this.pulseSettings.num - 1);
      bArray = [];
      for (let i = 0; i < this.pulseSettings.num; i += 1) {
        bArray.push(bMax - i * bStep);
      }
    }
    this.pulseSettings.time = options.duration;
    this.pulseSettings.frequency = 1 / (options.duration * 2);
    this.pulseSettings.A = 1;
    this.pulseSettings.B = bArray;
    this.pulseSettings.C = 0;
    this.pulseSettings.callback = options.callback;
    this.startPulsing(options.when);
  }

  startPulsing(when: TypeWhen = 'nextFrame') {
    this.state.isPulsing = true;
    this.state.pulse.startTime = new GlobalAnimation().getWhen(when) / 1000;
    this.unrender();
    this.frozenPulseTransforms = [];
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
      // this.subscriptions.trigger('animationFinished', )
      this.animationFinished('pulsing');
      this.subscriptions.trigger('stopPulsing');
    }
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
        this.subscriptions.trigger('stopped');
      }
    };
    if (how === 'animateToComplete' || how === 'dissolveToComplete') {
      if (this.animations.isAnimating()) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.animations.subscriptions.subscribe('finished', checkStop, 1);
      }
      if (this.state.isPulsing) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.subscriptions.subscribe('stopPulsing', checkStop, 1);
      }
      if (this.state.isMovingFreely) {
        this.state.preparingToStop = true;
        toComplete += 1;
        this.subscriptions.subscribe('stopMovingFreely', checkStop, 1);
      }
    }
    if (this.state.preparingToStop) {
      this.subscriptions.trigger('preparingToStop');
    }
    this.stopAnimating(how);
    this.stopMovingFreely(how);
    this.stopBeingMoved();
    this.stopPulsing(how);
  }


  stopAnimating(how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel') {
    if (how === 'freeze') {
      this.animations.cancelAll('noComplete');
    } else if (how === 'cancel') {
      this.animations.cancelAll(null);
    } else if (how === 'complete') {
      this.animations.cancelAll('complete');
    }
  }

  // stopLegacy(
  //   cancelled?: boolean = true,
  //   forceSetToEndOfPlan?: ?boolean | 'complete' | 'noComplete' = false,
  //   freeze: boolean = false,
  // ) {
  //   if (forceSetToEndOfPlan === true || forceSetToEndOfPlan === 'complete') {
  //     this.animations.cancelAll('complete');
  //   } else if (forceSetToEndOfPlan === false || forceSetToEndOfPlan === 'noComplete') {
  //     this.animations.cancelAll('noComplete');
  //   } else {
  //     this.animations.cancelAll(null);
  //   }
  //   this.stopMovingFreely(cancelled);
  //   this.stopBeingMoved();
  //   this.stopPulsing(cancelled, forceSetToEndOfPlan, freeze);
  // }

  // cancel(forceSetToEndOfPlan?: ?boolean | 'complete' | 'noComplete' = false) {
  //   this.stop(true, forceSetToEndOfPlan);
  // }

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
    // const glToDiagramScale = new Point(
    //   this.diagramLimits.width / 2,
    //   this.diagramLimits.height / 2,
    // );
    const bottomLeft = new Point(gl.left, gl.bottom)
      .transformBy(glToDiagramSpace.matrix());
    const topRight = new Point(gl.right, gl.top)
      .transformBy(glToDiagramSpace.matrix());
    return new Rect(
      bottomLeft.x, bottomLeft.y,
      topRight.x - bottomLeft.x, topRight.y - bottomLeft.y,
    );
    // return new Rect(
    //   gl.left * glToDiagramScale.x,
    //   gl.bottom * glToDiagramScale.y,
    //   gl.width * glToDiagramScale.x,
    //   gl.height * glToDiagramScale.y,
    // );
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
    const bottomLeft = new Point(gl.left, gl.bottom)
      .transformBy(glToDiagramSpace.matrix());
    const topRight = new Point(gl.right, gl.top)
      .transformBy(glToDiagramSpace.matrix());
    return new Rect(
      bottomLeft.x, bottomLeft.y,
      topRight.x - bottomLeft.x, topRight.y - bottomLeft.y,
    );
    // const glToDiagramScale = new Point(
    //   this.diagramLimits.width / 2,
    //   this.diagramLimits.height / 2,
    // );
    // return new Rect(
    //   gl.left * glToDiagramScale.x,
    //   gl.bottom * glToDiagramScale.y,
    //   gl.width * glToDiagramScale.x,
    //   gl.height * glToDiagramScale.y,
    // );
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

  getPositionInBounds(
    space: 'local' | 'diagram' | 'gl' | 'vertex' = 'local',
    x: 'center' | 'left' | 'right' | 'origin' | number,
    y: 'middle' | 'top' | 'bottom' | 'origin' | number,
  ) {
    const bounds = this.getBoundingRect(space);
    const p = this.getPosition(space);
    if (x === 'left') {
      p.x = bounds.left;
    } else if (x === 'right') {
      p.x = bounds.right;
    } else if (x === 'center') {
      p.x = bounds.left + bounds.width / 2;
    } else if (typeof x === 'number') {
      p.x = bounds.left + bounds.width * x;
    }
    if (y === 'top') {
      p.y = bounds.top;
    } else if (y === 'bottom') {
      p.y = bounds.bottom;
    } else if (y === 'middle') {
      p.y = bounds.bottom + bounds.height / 2;
    } else if (typeof y === 'number') {
      p.y = bounds.bottom + bounds.height * y;
    }
    return p;
  }

  getPosition(
    space: 'local' | 'diagram' | 'gl' | 'vertex' = 'local',
    x: 'center' | 'left' | 'right' | 'origin' | number = 'origin',
    y: 'middle' | 'top' | 'bottom' | 'origin' | number = 'origin',
  ) {
    // vertex space position doesn't mean much as it will always be 0, 0
    if (x !== 'origin' || y !== 'origin') {
      this.getPositionInBounds(space, x, y);
    }
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

  setMoveBounds(
    boundaryIn: ?Array<number> | Rect | 'diagram' = null,
    // scale: Point = new Point(1, 1),
  ): void {
    if (!this.isMovable) {
      return;
    }
    let boundary = boundaryIn;
    if (boundaryIn == null) {
      if (this.move.bounds === 'diagram' || Array.isArray(this.move.bounds) || this.move.bounds instanceof Rect) {
        boundary = this.move.bounds;
        this.move.bounds = new TransformBounds(this.transform);
      } else {
        this.move.bounds.updateTranslation(null);
        return;
      }
    }
    if (boundary == null) {
      return;
    }

    if (Array.isArray(boundary)) {
      const [left, bottom, width, height] = boundary;
      boundary = new Rect(left, bottom, width, height);
    } else if (boundary === 'diagram') {
      boundary = this.diagramLimits;
    }
    const rect = this.getRelativeBoundingRect('diagram');
    if (this.move.bounds instanceof TransformBounds) {
      this.move.bounds.updateTranslation(new RectBounds(
        boundary.left - rect.left,
        boundary.bottom - rect.bottom,
        boundary.right - rect.right - (boundary.left - rect.left),
        boundary.top - rect.top - (boundary.bottom - rect.bottom),
      ));
    }
    // if (this.name === 'c') {
    //   console.log(this.move.bounds.boundary[2])
    // }
  }

  // setMoveBoundsLegacy(
  //   boundaryIn: ?Array<number> | Rect | 'diagram' = this.move.bounds,
  //   scale: Point = new Point(1, 1),
  // ): void {
  //   if (!this.isMovable) {
  //     return;
  //   }
  //   if (boundaryIn != null) {
  //     this.move.boundary = boundaryIn;
  //   }
  //   if (this.move.boundary == null) {
  //     return;
  //   }
  //   let boundary;
  //   if (Array.isArray(this.move.boundary)) {
  //     const [left, bottom, width, height] = this.move.boundary;
  //     boundary = new Rect(left, bottom, width, height);
  //   } else if (this.move.boundary === 'diagram') {
  //     boundary = this.diagramLimits;
  //   } else {
  //     ({ boundary } = this.move);
  //   }

  //   const glSpace = {
  //     x: { bottomLeft: -1, width: 2 },
  //     y: { bottomLeft: -1, height: 2 },
  //   };
  //   const diagramSpace = {
  //     x: {
  //       bottomLeft: this.diagramLimits.left,
  //       width: this.diagramLimits.width,
  //     },
  //     y: {
  //       bottomLeft: this.diagramLimits.bottom,
  //       height: this.diagramLimits.height,
  //     },
  //   };
  //   const glToDiagramSpace = spaceToSpaceTransform(glSpace, diagramSpace);
  //   const rect = this.getRelativeGLBoundingRect();
  //   const glToDiagramScaleMatrix = [
  //     glToDiagramSpace.matrix()[0], 0, 0,
  //     0, glToDiagramSpace.matrix()[4], 0,
  //     0, 0, 1];
  //   const minPoint = new Point(rect.left, rect.bottom).transformBy(glToDiagramScaleMatrix);
  //   const maxPoint = new Point(rect.right, rect.top).transformBy(glToDiagramScaleMatrix);

  //   const min = new Point(0, 0);
  //   const max = new Point(0, 0);

  //   min.x = boundary.left - minPoint.x * scale.x;
  //   min.y = boundary.bottom - minPoint.y * scale.y;
  //   max.x = boundary.right - maxPoint.x * scale.x;
  //   max.y = boundary.top - maxPoint.y * scale.y;
  //   // this.move.maxTransform.updateTranslation(
  //   //   max.x,
  //   //   max.y,
  //   // );
  //   // this.move.minTransform.updateTranslation(
  //   //   min.x,
  //   //   min.y,
  //   // );
  //   this.move.bounds.updateTranslation(new RectBounds(min.x, min.y, max.x - min.x, max.y - min.y))
  // }

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
      if (this.recorder.state === 'recording') {
        this.recorder.recordEvent('elementClick', [this.getPath()]);
      }
      this.fnMap.exec(this.onClick, this);
    }
  }

  // setMovable(movable: boolean = true) {
  //   if (movable) {
  //     this.isTouchable = true;
  //     this.isMovable = true;
  //   }
  // }

  getTransform() {
    return this.transform;
  }

  // isAnimating(): boolean {
  //   // console.log(this.name, this.isShown, this.animations.isAnimating())
  //   if (this.isShown === false) {
  //     return false;
  //   }
  //   return this.animations.isAnimating();
  // }

  isMoving(): boolean {
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

  // isAnyElementAnimating() {
  //   return this.isAnimating();
  // }

  isAnyElementMoving() {
    return this.isMoving();
  }
}

// ***************************************************************
// Geometry Object
// ***************************************************************
class DiagramElementPrimitive extends DiagramElement {
  drawingObject: DrawingObject;
  // color: Array<number>;
  // opacity: number;
  pointsToDraw: number;
  angleToDraw: number;
  lengthToDraw: number;
  cannotTouchHole: boolean;
  pointsDefinition: Object;
  setPointsFromDefinition: ?(() => void);
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
    this.pointsDefinition = {};
    this.setPointsFromDefinition = null;
    // this.setMoveBounds();
  }

  _getStateProperties(options: { ignoreShown: boolean }) {
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

  setAngleToDraw(intputAngle: number = -1) {
    this.angleToDraw = intputAngle;
  }

  // setScenario(scenarioName: string) {
  //   super.setScenario(scenarioName);
  //   if (this.scenarios[scenarioName] != null) {
  //     const target = this.getScenarioTarget(scenarioName);
  //     if (target.color != null) {
  //       this.setColor(target.color.slice());
  //     }
  //   }
  // }

  isBeingTouched(glLocation: Point): boolean {
    if (!this.isTouchable) {
      return false;
    }
    // debugger;
    
    const boundaries =
      this.drawingObject.getGLBoundaries(this.lastDrawTransform.matrix());
    // console.log(boundaries)
    const holeBoundaries =
      this.drawingObject.getGLBoundaryHoles(this.lastDrawTransform.matrix());
    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (glLocation.isInPolygon(boundary)) {
        let isTouched = true;
        if (this.cannotTouchHole) {
          for (let j = 0; j < holeBoundaries.length; j += 1) {
            const holeBoundary = holeBoundaries[j];
            if (Array.isArray(holeBoundary) && holeBoundary.length > 2) {
              if (glLocation.isInPolygon(holeBoundary)) {
                isTouched = false;
                j = holeBoundaries.length;
              }
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
    duplicateFromTo(this, primative, ['parent', 'diagram']);
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

  setupDraw(now: number = 0) {
    if (this.isShown) {
      this.lastDrawTime = now;
      // if (this.pulseSettings.clearFrozenTransforms) {
      //   this.frozenPulseTransforms = [];
      //   this.pulseSettings.clearFrozenTransforms = false;
      // }
      // this.pulseTransforms = [];
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      }
      this.subscriptions.trigger('beforeDraw', [now]);
      if (this.beforeDrawCallback != null) {
        this.fnMap.exec(this.beforeDrawCallback, now);
      }
      // console.log(this.name, this.isShown, this.isPaused)
      if (this.state.pause !== 'paused') {
        this.animations.nextFrame(now);
        this.nextMovingFreelyFrame(now);
      }

      // this.lastDrawElementTransformPosition = {
      //   parentCount: parentTransform.order.length,
      //   elementCount: this.transform.order.length,
      // };

      // // const newTransform = parentTransform.transform(this.getTransform());
      // this.parentTransform = parentTransform._dup();
      // this.lastDrawTransform = newTransform._dup();
      // if (!this.isShown) {
      //   this.pulseTransforms = [];
      //   this.
      //   return;
      // }
      // if (this.state.pause !== 'paused') {
      //   this.pulseTransforms = this.getPulseTransforms(now);
      // }
      // this.drawTransforms = this.getDrawTransforms(newTransform);
      // if(now === 1 && this.name === 'p1') {
      //   console.log(this.getPosition('diagram'))
      //   console.log(this.getPosition('local'))
      //   // window.aaa = 1;
      // }

      // eslint-disable-next-line prefer-destructuring
      // this.lastDrawPulseTransform = this.drawTransforms[0];
      // this.lastDrawTransform = pulseTransforms[0];

      // let pointCount = -1;
      // if (this.drawingObject instanceof VertexObject) {
      //   pointCount = this.drawingObject.numPoints;
      //   if (this.angleToDraw !== -1) {
      //     pointCount = this.drawingObject.getPointCountForAngle(this.angleToDraw);
      //   }
      //   if (this.lengthToDraw !== -1) {
      //     pointCount = this.drawingObject.getPointCountForLength(this.lengthToDraw);
      //   }
      //   if (this.pointsToDraw !== -1) {
      //     pointCount = this.pointsToDraw;
      //   }
      // } else {
      //   pointCount = 1;
      // }

      // const colorToUse = [...this.color.slice(0, 3), this.color[3] * this.opacity];
      // if (pointCount > 0) {
      //   this.pulseTransforms.forEach((t) => {
      //     this.drawingObject.drawWithTransformMatrix(
      //       t.matrix(), colorToUse, canvasIndex, pointCount,
      //     );
      //   });
      // }
      // if (this.unrenderNextDraw) {
      //   this.clearRender();
      //   this.unrenderNextDraw = false;
      // }
      // if (this.renderedOnNextDraw) {
      //   this.isRenderedAsImage = true;
      //   this.renderedOnNextDraw = false;
      // }
      // // this.redrawElements.forEach((element) => {
      // //   element.draw(element.getParentLastDrawTransform(), now);
      // // })
      // if (this.afterDrawCallback != null) {
      //   this.fnMap.exec(this.afterDrawCallback, now);
      // }
    }
  }

  draw(
    now: number,
    parentTransform: Array<Transform> = [new Transform()],
    parentOpacity: number = 1,
    canvasIndex: number = 0,
  ) {
    if (this.isShown) {
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
      } else {
        pointCount = 1;
      }

      const colorToUse = [...this.color.slice(0, 3), this.color[3] * this.opacity * parentOpacity];

      // eslint-disable-next-line prefer-destructuring
      this.lastDrawOpacity = colorToUse[3];
      // if (this.getPath().endsWith('eqn.elements._1')) {
      // console.log(this.getPath(), this.opacity, colorToUse);
      // colorToUse = [1, 0, 0, 1];
      // }
      const transform = this.getTransform();
      const newTransforms = transformBy(parentTransform, [transform]);

      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform[0].order.length,
        elementCount: this.transform.order.length,
      };

      // const newTransform = parentTransform.transform(this.getTransform());
      // this.parentTransform = parentTransform._dup();
      // const newTransform = parentTransform.transform(this.getTransform());
      this.pulseTransforms = this.getPulseTransforms(now);
      this.drawTransforms = this.getDrawTransforms(newTransforms);
      this.lastDrawTransform = parentTransform[0].transform(transform);
      this.lastDrawPulseTransform = this.drawTransforms[0];
      if (pointCount > 0) {
        // console.log(this.pulseTransforms, pointCount)
        this.drawTransforms.forEach((t) => {
          // console.log(t.matrix(), colorToUse, canvasIndex, pointCount)
          this.drawingObject.drawWithTransformMatrix(
            t.matrix(), colorToUse, canvasIndex, pointCount,
          );
        });
      }
      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
      // this.redrawElements.forEach((element) => {
      //   element.draw(element.getParentLastDrawTransform(), now);
      // })
      this.subscriptions.trigger('afterDrawDraw', [now]);
      if (this.afterDrawCallback != null) {
        this.fnMap.exec(this.afterDrawCallback, now);
      }
    }
  }

  setFirstTransform(parentTransform: Transform = new Transform()) {
    this.lastDrawElementTransformPosition = {
      parentCount: parentTransform.order.length,
      elementCount: this.transform.order.length,
    };
    // const finalParentTransform = this.processParentTransform(parentTransform);
    const firstTransform = parentTransform.transform(this.getTransform());
    this.lastDrawTransform = firstTransform;
    if (this.drawingObject instanceof HTMLObject) {
      this.drawingObject.transformHtml(firstTransform.matrix());
    }
    this.setMoveBounds();
  }

  // isMoving(): boolean {
  //   if (
  //     // this.state.isAnimating
  //     this.state.isMovingFreely
  //     || this.state.isBeingMoved
  //     || this.state.isPulsing
  //     // || this.state.isAnimatingColor
  //     // || this.state.isAnimatingCustom
  //     || this.animations.willStartAnimating()
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }

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
    return this.drawingObject.getGLBoundaries(this.getTransform().matrix());
  }

  getDiagramBoundaries() {
    return this.drawingObject.getGLBoundaries(this.vertexToDiagramSpaceTransformMatrix());
  }

  getGLBoundaries() {
    return this.drawingObject.getGLBoundaries(this.lastDrawTransform.matrix());
  }


  getVertexSpaceBoundingRect() {
    return this.drawingObject.getVertexSpaceBoundingRect();
  }

  getLocalBoundingRect() {
    return this.drawingObject.getGLBoundingRect(this.getTransform().matrix());
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
    return this.drawingObject.getRelativeGLBoundingRect(this.getTransform().matrix());
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

// ***************************************************************
// Collection of Geometry Objects or Collections
// ***************************************************************
class DiagramElementCollection extends DiagramElement {
  elements: Object;
  drawOrder: Array<string>;
  touchInBoundingRect: boolean;
  eqns: Object;
  +pulse: (?({
      x?: 'left' | 'center' | 'right' | 'origin' | number,
      y?: 'bottom' | 'middle' | 'top' | 'origin' | number,
      space?: 'diagram' | 'gl' | 'local' | 'vertex',
      centerOn?: null | DiagramElement | TypeParsablePoint,
      frequency?: number,
      time?: number,
      scale?: number,
      done?: ?(mixed) => void,
      elements?: Array<string | DiagramElement>
    } | Array<string | DiagramElement> | ((mixed) => void)), ?(mixed) => void) => void;

  +getElement: (?(string | DiagramElement)) => ?DiagramElement;
  +getElements: (Array<string | DiagramElement>) => Array<DiagramElement>;
  +exec: (string | Array<string | Object>, ?Array<string | DiagramElement>) => void;
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

  _getStateProperties(options: { ignoreShown: boolean }) {
    let { ignoreShown } = options;
    if (ignoreShown == null) {
      ignoreShown = false;
    }
    if (this.isShown || ignoreShown) {
      return [...super._getStateProperties(options),
        'touchInBoundingRect',
        'elements',
        'hasTouchableElements',
      ];
    }
    return [
      ...super._getStateProperties(options),
      'elements',
    ];
  }

  _getStatePropertiesMin() {
    return [
      ...super._getStatePropertiesMin(),
      'elements',
    ];
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

  toFront(elements: Array<string | DiagramElement>) {
    const names = [];
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

  toBack(elements: Array<string | DiagramElement>) {
    const names = [];
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

  // isChildMoving(): boolean {
  //   if (this.isShown === false) {
  //     return false;
  //   }
  //   if (this.state.isMovingFreely
  //       || this.state.isBeingMoved
  //       || this.state.isPulsing
  //       || this.animations.state === 'animating') {
  //     return true;
  //   }
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     if (element instanceof DiagramElementCollection) {
  //       if (element.isMoving()) {
  //         return true;
  //       }
  //     } else if (element.isShown && element.color[3] > 0 && element.isMoving()) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

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

  // isAnyElementAnimating(): boolean {
  //   if (this.isShown === false) {
  //     return false;
  //   }
  //   if (this.isAnimating()) {
  //     return true;
  //   }
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     if (element.isAnyElementAnimating()) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // isAnimating(): boolean {
  //   if (this.isShown === false) {
  //     return false;
  //   }
  //   const isThisAnimating = super.isAnimating();
  //   if (isThisAnimating) {
  //     return true;
  //   }
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     if (element.isAnimating()) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

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

  setupDraw(
    // parentTransform: Transform = new Transform(),
    now: number = 0,
    canvasIndex: number = 0,
  ) {
    // console.log('draw', this.name)
    if (this.isShown) {
      this.lastDrawTime = now;
      // if (this.pulseSettings.clearFrozenTransforms) {
      //   this.frozenPulseTransforms = [];
      //   this.pulseSettings.clearFrozenTransforms = false;
      // }
      if (this.isRenderedAsImage === true) {
        if (this.willStartAnimating()) {
          this.unrender();
        } else {
          return;
        }
      }
      if (this.beforeDrawCallback != null) {
        this.fnMap.exec(this.beforeDrawCallback, now);
      }

      if (this.state.pause !== 'paused') {
        this.animations.nextFrame(now);
        this.nextMovingFreelyFrame(now);
      }

      // set next color can end up hiding an element when disolving out
      if (!this.isShown) {
        return;
      }

      // this.lastDrawElementTransformPosition = {
      //   parentCount: parentTransform.order.length,
      //   elementCount: this.transform.order.length,
      // };
      // const newTransform = parentTransform.transform(this.getTransform());
      // this.lastDrawTransform = newTransform._dup();
      // this.pulseTransforms = this.getPulseTransforms(now);
      // this.drawTransforms = this.getDrawTransforms(newTransform);
      // // this.pulseTransforms
      // // eslint-disable-next-line prefer-destructuring
      // this.lastDrawPulseTransform = this.drawTransforms[0];
      // this.lastDrawTransform = pulseTransforms[0];

      // this.lastDrawPulseTransform = pulseTransforms[0]._dup();

      // for (let k = 0; k < this.drawTransforms.length; k += 1) {
      for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
        this.elements[this.drawOrder[i]].setupDraw(now, canvasIndex);
      }
      // }
      // if (this.unrenderNextDraw) {
      //   this.clearRender();
      //   this.unrenderNextDraw = false;
      // }
      // if (this.renderedOnNextDraw) {
      //   this.isRenderedAsImage = true;
      //   this.renderedOnNextDraw = false;
      // }
      // // this.redrawElements.forEach((element) => {
      // //   element.draw(element.getParentLastDrawTransform(), now);
      // // })
      // if (this.afterDrawCallback != null) {
      //   // this.afterDrawCallback(now);
      //   this.fnMap.exec(this.afterDrawCallback, now);
      // }
    }
  }

  draw(
    now: number,
    parentTransform: Array<Transform> = [new Transform()],
    parentOpacity: number = 1,
    canvasIndex: number = 0,
  ) {
    if (this.isShown) {
      // for (let k = 0; k < this.pulseTransforms.length; k += 1) {
      this.lastDrawElementTransformPosition = {
        parentCount: parentTransform[0].order.length,
        elementCount: this.transform.order.length,
      };
      const transform = this.getTransform();
      const newTransforms = transformBy(parentTransform, [transform]);
      // this.lastDrawTransform = transform._dup();
      this.lastDrawTransform = parentTransform[0].transform(transform);
      this.pulseTransforms = this.getPulseTransforms(now);
      this.drawTransforms = this.getDrawTransforms(newTransforms);
      // this.pulseTransforms
      // eslint-disable-next-line prefer-destructuring
      this.lastDrawPulseTransform = this.drawTransforms[0];

      const opacityToUse = this.color[3] * this.opacity * parentOpacity;
      this.lastDrawOpacity = opacityToUse;
      for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
        this.elements[this.drawOrder[i]].draw(
          now, this.drawTransforms, opacityToUse, canvasIndex,
        );
      }
      // }
      if (this.unrenderNextDraw) {
        this.clearRender();
        this.unrenderNextDraw = false;
      }
      if (this.renderedOnNextDraw) {
        this.isRenderedAsImage = true;
        this.renderedOnNextDraw = false;
      }
      // this.redrawElements.forEach((element) => {
      //   element.draw(element.getParentLastDrawTransform(), now);
      // })
      if (this.afterDrawCallback != null) {
        // this.afterDrawCallback(now);
        this.fnMap.exec(this.afterDrawCallback, now);
      }
    }
  }

  // drawNew() {
  //   if (this.isShown) {
  //     for (let k = 0; k < this.pulseTransforms.length; k += 1) {
  //       for (let i = 0, j = this.drawOrder.length; i < j; i += 1) {
  //         this.elements[this.drawOrder[i]].draw(this.pulseTransforms[k], now, canvasIndex);
  //       }
  //     }
  //     if (this.unrenderNextDraw) {
  //       this.clearRender();
  //       this.unrenderNextDraw = false;
  //     }
  //     if (this.renderedOnNextDraw) {
  //       this.isRenderedAsImage = true;
  //       this.renderedOnNextDraw = false;
  //     }
  //     // this.redrawElements.forEach((element) => {
  //     //   element.draw(element.getParentLastDrawTransform(), now);
  //     // })
  //     if (this.afterDrawCallback != null) {
  //       // this.afterDrawCallback(now);
  //       this.fnMap.exec(this.afterDrawCallback, now);
  //     }
  //   }
  // }

  exec(
    execFunctionAndArgs: string | Array<string | Object>,
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
    optionsOrElementsOrDone: ?({
      x?: 'left' | 'center' | 'right' | 'origin' | number,
      y?: 'bottom' | 'middle' | 'top' | 'origin' | number,
      space?: 'diagram' | 'gl' | 'local' | 'vertex',
      centerOn?: null | DiagramElement | TypeParsablePoint,
      frequency?: number,
      time?: number,
      scale?: number,
      done?: ?(mixed) => void,
      elements?: Array<string | DiagramElement>,
      progression: string | (number) => number,
    } | Array<string | DiagramElement> | ((mixed) => void)) = null,
    done: ?(mixed) => void = null,
  ) {
    if (optionsOrElementsOrDone == null
      || typeof optionsOrElementsOrDone === 'function'
      || typeof optionsOrElementsOrDone === 'string'
    ) {
      super.pulse(optionsOrElementsOrDone);
      return;
    }
    const defaultPulseOptions = {
      frequency: 0,
      time: 1,
      scale: 2,
    };
    if (
      typeof this.pulseDefault !== 'function'
      && typeof this.pulseDefault !== 'string'
    ) {
      defaultPulseOptions.frequency = this.pulseDefault.frequency;
      defaultPulseOptions.time = this.pulseDefault.time;
      defaultPulseOptions.scale = this.pulseDefault.scale;
    }
    const defaultOptions = {
      x: 'center',
      y: 'middle',
      space: 'diagram',
      centerOn: null,
      frequency: defaultPulseOptions.frequency,
      time: defaultPulseOptions.time,
      scale: defaultPulseOptions.scale,
      done: null,
      elements: null,
      progression: 'tools.math.sinusoid',
    };

    let doneToUse;
    let options;
    let elements;
    if (Array.isArray(optionsOrElementsOrDone)) {
      options = defaultOptions;
      doneToUse = done;
      elements = optionsOrElementsOrDone;
    } else {
      options = joinObjects({}, defaultOptions, optionsOrElementsOrDone);
      ({ elements } = options);
      doneToUse = options.done;
      if (optionsOrElementsOrDone.scale == null) {
        options.scale = undefined;
      }
      if (optionsOrElementsOrDone.frequency == null) {
        options.frequency = undefined;
      }
      if (optionsOrElementsOrDone.time == null) {
        options.time = undefined;
      }
    }
    options.elements = null;
    if (elements == null || elements.length === 0) {
      super.pulse(optionsOrElementsOrDone);
      return;
    }

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
    // let doneToUse = done;
    elements.forEach((elementToPulse) => {
      let element: ?DiagramElement;
      if (typeof elementToPulse === 'string') {
        element = this.getElement(elementToPulse);
      } else {
        element = elementToPulse;
      }
      if (element != null) {
        // element.pulseDefault(doneToUse);
        element.pulse(options);
        // doneToUse = null;
      }
    });
    // if (doneToUse != null) {
    //   doneToUse();
    // }

    // if (typeof this.pulseDefault === 'function') {
    //   this.pulseDefault(done);
    // } else {
    //   // const { frequency, time, scale } = this.pulseDefault;
    //   // this.pulseScaleNow(time, scale, frequency, done);
    //   this.pulseScaleRelativeTo(
    //     options.centeredOn,
    //     options.x,
    //     options.y,
    //     options.space,
    //     options.time,
    //     options.scale,
    //     options.frequency,
    //     done,
    //   );
    // }
  }

  // pulseLegacy(
  //   elementsOrDone: ?(Array<string | DiagramElement> | (mixed) => void),
  //   // elementsToPulse: Array<string | DiagramElement>,
  //   done: ?(mixed) => void = null,
  // ) {
  //   if (elementsOrDone == null || typeof elementsOrDone === 'function') {
  //     super.pulse(elementsOrDone);
  //     return;
  //   }

  //   let doneToUse = done;
  //   elementsOrDone.forEach((elementToPulse) => {
  //     let element: ?DiagramElement;
  //     if (typeof elementToPulse === 'string') {
  //       element = this.getElement(elementToPulse);
  //     } else {
  //       element = elementToPulse;
  //     }
  //     if (element != null) {
  //       // element.pulseDefault(doneToUse);
  //       element.pulse(doneToUse);
  //       doneToUse = null;
  //     }
  //   });
  //   if (doneToUse != null) {
  //     doneToUse();
  //   }
  // }

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

  getElements(children: Array<string | DiagramElement>) {
    const elements = [];
    children.forEach((child) => {
      const element = this.getElement(child);
      if (element != null) {
        elements.push(element);
      }
    });
    return elements;
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
    const firstTransform = parentTransform.transform(this.getTransform());
    this.lastDrawTransform = firstTransform;

    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setFirstTransform(firstTransform);
    }
    this.setMoveBounds();
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
      return this.getAllBoundaries(space);
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

  getPositionInBounds(
    space: 'local' | 'diagram' | 'gl' | 'vertex' = 'local',
    x: 'center' | 'left' | 'right' | 'origin' | number,
    y: 'middle' | 'top' | 'bottom' | 'origin' | number,
    children: ?Array<string | DiagramElement> = null,
  ) {
    const bounds = this.getBoundingRect(space, children);
    const p = this.getPosition(space);
    if (x === 'left') {
      p.x = bounds.left;
    } else if (x === 'right') {
      p.x = bounds.right;
    } else if (x === 'center') {
      p.x = bounds.left + bounds.width / 2;
    } else if (typeof x === 'number') {
      p.x = bounds.left + bounds.width * x;
    }
    if (y === 'top') {
      p.y = bounds.top;
    } else if (y === 'bottom') {
      p.y = bounds.bottom;
    } else if (y === 'middle') {
      p.y = bounds.bottom + bounds.height / 2;
    } else if (typeof y === 'number') {
      p.y = bounds.bottom + bounds.height * y;
    }
    return p;
  }

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

  stop(
    // cancelled: boolean = true,
    // forceSetToEndOfPlan: ?boolean | 'complete' | 'noComplete' = false,
    // freeze: boolean = false,
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
    // for (let i = 0; i < this.drawOrder.length; i += 1) {
    //   const element = this.elements[this.drawOrder[i]];
    //   element.setOpacity(opacity);
    // }
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

  // animateTo(
  //   elements: {
  //     transform?: Transform,
  //     color?: Array<number>,
  //     show?: boolean,
  //   },
  //   options: {
  //     delay?: number,
  //     time?: {
  //       fadeIn?: number,
  //       move?: number,
  //       fadeOut?: number,
  //     },
  //     order: Array<Array<'fadeIn' | 'fadeOut' | 'move'>>,
  //     rotDirection?: number,
  //     callback?: ?(string | ((?mixed) => void)),
  //     easeFunction: string | ((number) => number),
  //   }
  // ) {

  // }
  animateToTransforms(
    elementTransforms: Object,
    time: number = 1,
    delay: number = 0,
    rotDirection: number = 0,
    callback: ?(string | ((?mixed) => void)) = null,
    easeFunction: string | ((number) => number) = 'tools.math.easeinout',
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

  getAllPrimitives() {
    let elements = [];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (element instanceof DiagramElementCollection) {
        elements = [...elements, ...element.getAllPrimitives()];
      } else {
        elements.push(element);
      }
    }
    return elements;
  }

  getAllElements() {
    const elements = [this];
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      // elements.push(element);
      if (element instanceof DiagramElementCollection) {
        elements.push(...element.getAllElements());
      } else {
        elements.push(element);
      }
    }
    return elements;
  }

  getChildren(directChildrenOnly: boolean = true) {
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
      if (element instanceof DiagramElementPrimitive) {
        element.setColor(element.color);
        element.setOpacity(element.opacity);
      } else {
        element.setPrimitiveColors();
      }
      // if (element.setPointsFromDefinition != null) {
      //   element.setPointsFromDefinition();
      // }
    }
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

  // setScenario(scenarioName: string) {
  //   super.setScenario(scenarioName);
  //   if (this.scenarios[scenarioName] != null) {
  //     const target = this.getScenarioTarget(scenarioName);
  //     this.color = target.color.slice();
  //   }
  // }

  setScenarios(scenarioName: string, onlyIfVisible: boolean = false) {
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
    startTime: ?number | 'now' | 'prev' | 'next' = null,
    // lastDrawTime: number,
    // countStart: () => void,
    // countEnd: () => void,
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
    startTime: ?number | 'now' | 'prev' | 'next' = null
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
          state.elements[this.drawOrder[i]], durationIn, startTime
        );
        if (elementDuration > duration) {
          duration = elementDuration;
        }
      }
    }
    return duration;
  }

  // _finishSetState(diagram: Diagram) {
  //   super._finishSetState(diagram);
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     element._finishSetState(diagram);
  //   }
  // }

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      element.setTimeDelta(delta);
    }
  }

  // pauseLegacy(pauseSettingsIn: TypePauseSettings = {}) {
  //   super.pause(pauseSettingsIn);
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     element.pause(pauseSettingsIn);
  //   }
  // }

  // unpauseLegacy() {
  //   super.unpause();
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     element.unpause();
  //   }
  // }

  // Priority order:
  // unpaused,
  // preparingToPause
  // preparingToUnpause
  // paused
  // getPause() {
  //   let pause = this.state.pause;
  //   if (this.state.pause === 'unpaused') {
  //     return 'unpaused';
  //   }
  //   for (let i = 0; i < this.drawOrder.length; i += 1) {
  //     const element = this.elements[this.drawOrder[i]];
  //     const elementPauseState = element.getPause();
  //     if (elementPauseState === 'unpaused') {
  //       return 'unpaused';
  //     }
  //     if (elementPauseState === 'preparingToPause' || elementPauseState === 'preparingToUnpause') {
  //       pause = elementPauseState;
  //     }
  //   }
  //   return pause;
  // }

  isStateSame(state: Object, mergePulseTransforms: boolean = false) {
    const thisElementResult = super.isStateSame(state, mergePulseTransforms);
    if (thisElementResult === false) {
      return false;
    }
    for (let i = 0; i < this.drawOrder.length; i += 1) {
      const element = this.elements[this.drawOrder[i]];
      if (state.elements != null && state.elements[this.drawOrder[i]] != null) {
        const elementResult = element.isStateSame(
          state.elements[this.drawOrder[i]], mergePulseTransforms,
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
    // const result = super.isAnimating();
    // if (result) {
    //   return true;
    // }
    // for (let i = 0; i < this.drawOrder.length; i += 1) {
    //   const element = this.elements[this.drawOrder[i]];
    //   const r = element.isAnimating();
    //   if (r) {
    //     return true;
    //   }
    // }
    // return false;
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
}

export {
  DiagramElementPrimitive, DiagramElementCollection,
  DiagramElement,
};
