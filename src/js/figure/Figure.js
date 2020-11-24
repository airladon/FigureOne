// @flow
import WebGLInstance from './webgl/webgl';
// import getShaders from './webgl/shaders';

import {
  Rect, Point, Transform, getRect,
  spaceToSpaceTransform, minAngleDiff, getTransform,
} from '../tools/g2';
import type { TypeParsableRect } from '../tools/g2';
// import * as math from '../tools/math';
import { FunctionMap } from '../tools/FunctionMap';
import { setState, getState } from './Recorder/state';
import parseState from './Recorder/parseState';
import { isTouchDevice, joinObjects, SubscriptionManager } from '../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive, FigureElement,
} from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
import { Recorder } from './Recorder/Recorder';
// eslint-disable-next-line import/no-cycle
import Gesture from './Gesture';
import DrawContext2D from './DrawContext2D';
import FigurePrimitives from './FigurePrimitives/FigurePrimitives';
import FigureEquation from './Equation/FigureEquation';
import FigureCollections from './FigureCollections/FigureCollections';
import addElements from './FigureAddElements/addElements';
import type { TypeAddElementObject } from './FigureAddElements/addElements';
import type { OBJ_ScenarioVelocity } from './Animation/AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
import type { TypeColor, OBJ_Font } from '../tools/types';

/**
 * Space Transforms
 *
 * @property {Transform} glToFigure
 * @property {Transform} figureToGL
 * @property {Transform} pixelToFigure
 * @property {Transform} figureToPixel
 * @property {Transform} pixelToGL
 * @property {Transform} glToPixel
 * @property {Transform} figureToCSSPercent
 */
export type OBJ_SpaceTransforms = {
  glToFigure: Transform;
  figureToGL: Transform;
  pixelToFigure: Transform;
  figureToPixel: Transform;
  pixelToGL: Transform;
  glToPixel: Transform;
  figureToCSSPercent: Transform;
}


export type OBJ_FigureForElement = {
  limits: Rect,
  spaceTransforms: OBJ_SpaceTransforms,
  animateNextFrame: () => void,
  animationFinished: () => void,
  recorder: Recorder,
}

/**
  * Figure options object
  * @property {string} [htmlId] HTML `div` tag `id` to tie figure to (`"figureOneContainer"`)
  * @property {TypeParsableRect} [limits] - limits (bottom left
  *  corner at (-1, -1), width 2, height 2)
  * @property {TypeColor} [color] default color (`[0, 0, 0, 1]`)
  * @property {OBJ_Font} [font] default font (`{ family: 'Helvetica,
  * size: 0.2, style: 'normal', weight: 'normal' }`)
  * @property {number} [lineWidth] default line width
  * @property {number} [length] default length to use for shapes
 */
export type OBJ_Figure = {
  htmlId?: string,
  limits?: TypeParsableRect,
  color?: TypeColor,
  font?: OBJ_Font,
  lineWidth?: number,
  length?: number,
};


// There are several coordinate spaces that need to be considered for a
// figure.
//
// In the simplest figure, there will be in hierarchy:
//  - GL Canvas
//    - Figure
//      - Element Collection
//        - Element Primitive
//          - Drawing Object (e.g. shape, text) from primative vertices
//
// A shape is defined in Drawing Object space.
// It is then transformed by the element primative
// It is then transformed by the element colleciton
// It is then transformed by the figure
// it is then transformed into GL Space
//
// Figure elements can also be rendered to an image in a HTML 2D canvas
// element. To do so, pass in:
//    - Figure Element (primative or collection) to render
//    - HTML element (which is a 2D canvas)
//    - Window of figure to render
//    - Window scaling (how does the window fit within the HTML Element)
//      - fit: figure units will be scaled so that figure window limits
//             aspect ratio fits within the element aspect ratio
//      - 1em: figure units will be scaled so 0.2 figure units (default font
//             size) looks like 1em of the html element font size in pixels
//      - 10px: figure units will be scaled so that the max figure window
//              limit will be the pixel count
//      - strech: figure units will be scaled so that the figure window
//                limits will be stretched to fit the html element width
//                and height
// Then the process is:
//    - html element size in pixels and aspect ratio found
//    - html element size in gl coordinates found

//  /**
//   * @typedef FigureOptions
//   * @type {object}
//   * @property {string} [htmlId = 'figureOneContainer'] - div id of figure container.
//   * @property {Rect} [limits = Rect(-1, -1, 2, 2)] - limits of figure.
//   */

/**
 * Class to create a figure.
 *
 * By default, a figure will attach a WebGL canvas and Context2D
 * canvas to the html `div` element with id `"figureOneContainer"`.
 *
 * To attach to a different `div`, use the `htmlId` property in the class
 * constructor.
 *
 * The figure manages all drawing elements, rendering the drawing elements
 * on browser animation frames and listens for guestures from the user.
 *
 * The figure also has a recorder, allowing to record and playback states,
 * and gestures.
 *
 * If a figure is paused, then all drawing element animations will
 * also be paused.
 *
 * It also has a number of convenience functions for create drawing elements
 * already attached to the drawing canvases, and useful transforms for
 * converting between the different spaces (e.g. pixel, GL, figure).
 *
 * @class
 * @param {OBJ_Figure} options
 * @property {FigurePrimitives} create create elements with this
 * @example
 * // Simple html and javascript example to create a figure, and add a
 * // hexagon.
 * //
 * // For additional examples, see https://github.com/airladon/FigureOne
 * //
 * // Two files `index.html` and `index.js` in the same directory
 *
 * // index.html
 * <!doctype html>
 * <html>
 * <body>
 *     <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
 *     </div>
 *     <script type="text/javascript" src='https://cdn.jsdelivr.net/npm figureone@0.3.4/figureone.min.js'></script>
 *     <script type="text/javascript" src='./index.js'></script>
 * </body>
 * </html>
 *
 * // index.js
 * const figure = new Fig.Figure({ limits: [-1, -1, 2, 2 ]});
 * figure.addElement(
 *   {
 *     name: 'p',
 *     method: 'polygon',
 *     options: {
 *       radius: 0.5,
 *       fill: true,
 *       sides: 6,
 *     },
 *   },
 * );
 * figure.initialize();
 *
 * @example
 * // Alternately, an element can be added programatically
 * // index.js
 * const figure = new Fig.Figure({ limits: [-1, -1, 2, 2 ]});
 * const hex = figure.create.polygon({
 *   radius: 0.5,
 *   fill: true,
 *   sides: 6,
 * });
 * figure.add('hexagon', hex);
 */
class Figure {
  htmlId: string;
  canvasLow: HTMLCanvasElement;
  canvasOffscreen: HTMLCanvasElement;
  // canvasHigh: HTMLCanvasElement;
  textCanvasLow: HTMLCanvasElement;
  textCanvasOffscreen: HTMLCanvasElement;
  container: HTMLElement;
  // textCanvasHigh: HTMLCanvasElement;
  draw2DLow: DrawContext2D;
  draw2DOffscreen: DrawContext2D;
  // draw2DHigh: DrawContext2D;
  htmlCanvas: HTMLElement;
  webglLow: WebGLInstance;
  webglOffscreen: WebGLInstance;
  // webglHigh: WebGLInstance;
  gestureCanvas: HTMLElement;

  elements: FigureElementCollection;
  globalAnimation: GlobalAnimation;
  recorder: Recorder;
  gesture: Gesture;
  inTransition: boolean;
  beingMovedElements: Array<FigureElement>;

  beingTouchedElements: Array<FigureElement>;

  moveTopElementOnly: boolean;
  previousCursorPoint: Point;

  limits: Rect;
  stateTime: DOMHighResTimeStamp;

  // gestureElement: HTMLElement;
  shapes: FigurePrimitives;
  shapesLow: Object;
  primitive: Object;
  // shapesHigh: Object;
  equation: Object;
  equationLow: Object;
  // equationHigh: Object;
  collections: FigureCollections;
  collectionsLow: FigureCollections;
  // objectsHigh: FigureCollections;

  backgroundColor: Array<number>;
  fontScale: number;
  // layout: Object;

  /**
   * Useful transforms between spaces at the figure level and above.
   * @property {OBJ_SpaceTransforms} spaceTransforms
   */
  spaceTransforms: OBJ_SpaceTransforms;

  // oldScrollY: number;
  lastDrawTime: number;
  drawQueued: boolean;
  waitForFrames: number;
  scrolled: boolean;
  scrollingFast: boolean;
  scrollTimeoutId: ?TimeoutID;
  drawTimeoutId: ?TimeoutID;
  oldScroll: number;
  fromWhere: string;      // used for drawing debug only
  oldWidth: number;

  drawAnimationFrames: number;
  defaultColor: Array<number>;
  defaultFont: OBJ_Font;
  defaultLineWidth: number;
  defaultLength: number;

  animationFinishedCallback: ?(string | (() => void));
  // updateFontSize: string;

  isTouchDevice: boolean;
  fnMap: FunctionMap;

  isPaused: boolean;
  pauseTime: number;
  cursorShown: boolean;
  cursorElementName: string;
  isTouchDown: boolean;
  setStateCallback: ?(string | (() => void));
  subscriptions: SubscriptionManager;

  state: {
    pause: 'paused' | 'preparingToPause' | 'preparingToUnpause' | 'unpaused';
    preparingToStop: boolean;
    preparingToSetState: boolean;
  };
  // pauseAfterNextDrawFlag: boolean;

  constructor(options: OBJ_Figure = {}) {
    const defaultOptions = {
      htmlId: 'figureOneContainer',
      limits: new Rect(-1, -1, 2, 2),
      fontScale: 1,
      color: [0, 0, 0, 1],
      font: {
        family: 'Helvetica',
        size: 0.2,
        style: 'normal',
        weight: 'normal',
        opacity: 1,
      },
    };
    this.fnMap = new FunctionMap();
    this.isPaused = false;
    this.scrolled = false;
    this.cursorElementName = 'cursor';
    this.setStateCallback = null;
    // this.oldScrollY = 0;
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const {
      htmlId, limits,
    } = optionsToUse;
    this.defaultColor = optionsToUse.color;
    this.defaultFont = optionsToUse.font;
    // this.defaultLineWidth = optionsToUse.lineWidth;
    if (optionsToUse.font.color == null) {
      optionsToUse.font.color = this.defaultColor.slice();
    }
    this.htmlId = htmlId;
    this.animationFinishedCallback = null;
    // this.layout = layout;
    if (typeof htmlId === 'string') {
      const container = document.getElementById(htmlId);
      if (container instanceof HTMLElement) {
        this.container = container;
        const { children } = container;
        for (let i = 0; i < children.length; i += 1) {
          const child = children[i];
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('figureone__gl')) {
            this.canvasLow = child;
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('figureone__gl__offscreen')) {
            this.canvasOffscreen = child;
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('figureone__text')) {
            this.textCanvasLow = child;
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('figureone__text__offscreen')) {
            this.textCanvasOffscreen = child;
          }
          if (child.classList.contains('figureone__html')
          ) {
            this.htmlCanvas = child;
          }
        }
        if (this.canvasLow == null) {
          this.canvasLow = document.createElement('canvas');
          this.canvasLow.classList.add('figureone__gl', 'figureone__canvas');
          container.appendChild(this.canvasLow);
        }
        if (this.textCanvasLow == null) {
          this.textCanvasLow = document.createElement('canvas');
          this.textCanvasLow.classList.add('figureone__text', 'figureone__canvas');
          container.appendChild(this.textCanvasLow);
        }
        if (this.htmlCanvas == null) {
          this.htmlCanvas = document.createElement('div');
          this.htmlCanvas.classList.add('figureone__html', 'figureone__canvas');
          container.appendChild(this.htmlCanvas);
        }

        const canvasStyle = document.createElement('style');
        canvasStyle.type = 'text/css';
        container.classList.add('figureone__container');
        canvasStyle.innerHTML = `
          .figureone__container {
            position: relative;
            pointer-events: none;
          }
          .figureone__canvas {
            width: 100%;
            height: 100%;
            position: absolute;
          }
          .figureone__html {
            pointer-events: auto;
          }
        `;
        document.getElementsByTagName('head')[0].appendChild(canvasStyle);

        this.backgroundColor = [1, 1, 1, 1];
        const webglLow = new WebGLInstance(
          this.canvasLow,
          this.backgroundColor,
        );
        this.webglLow = webglLow;
        if (this.canvasOffscreen) {
          const webglOffscreen = new WebGLInstance(
            this.canvasOffscreen,
            this.backgroundColor,
          );
          this.webglOffscreen = webglOffscreen;
        }
        this.draw2DLow = new DrawContext2D(this.textCanvasLow);
        if (this.textCanvasOffscreen) {
          const draw2DOffscreen = new DrawContext2D(this.textCanvasOffscreen);
          this.draw2DOffscreen = draw2DOffscreen;
        }
        // this.draw2DHigh = new DrawContext2D(this.textCanvasHigh);
      }
    }

    if (optionsToUse.gestureCanvas != null) {
      const gestureCanvas = document.getElementById(optionsToUse.gestureCanvas);
      if (gestureCanvas != null) {
        this.gestureCanvas = gestureCanvas;
      }
    }
    if (this.gestureCanvas == null) {
      this.gestureCanvas = this.htmlCanvas;
    }

    if (this instanceof Figure) {  // $FlowFixMe
      this.gesture = new Gesture(this);
    }

    this.previousCursorPoint = new Point(0, 0);
    this.isTouchDown = false;
    // this.pauseAfterNextDrawFlag = false;
    this.fontScale = optionsToUse.fontScale;
    // console.log(this.canvasLow.getClientBoundingRect())
    this.updateLimits(limits);
    this.setDefaultLineWidth(options.lineWidth || null);
    this.setDefaultLength(options.length || null);
    this.drawQueued = false;
    this.lastDrawTime = 0;
    this.inTransition = false;
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    this.moveTopElementOnly = true;
    this.globalAnimation = new GlobalAnimation();
    this.subscriptions = new SubscriptionManager(this.fnMap);
    this.recorder = new Recorder();
    this.recorder.figure = this;
    this.bindRecorder();
    this.pauseTime = this.globalAnimation.now() / 1000;
    this.shapesLow = this.getShapes();
    // this.shapesHigh = this.getShapes(true);
    this.shapes = this.shapesLow;
    this.primitive = this.shapes;
    this.equationLow = this.getEquations();
    // this.equationHigh = this.getEquations(true);
    this.equation = this.equationLow;
    this.collectionsLow = this.getObjects();
    // this.collectionsHigh = this.getObjects(true);
    this.collections = this.collectionsLow;
    this.createFigureElements();
    if (this.elements.name === '') {
      this.elements.name = 'figureRoot';
    }
    this.state = {
      pause: 'unpaused',
      preparingToStop: false,
      preparingToSetState: false,
    };
    this.stateTime = this.globalAnimation.now() / 1000;

    // this.updateFontSize = optionsToUse.updateFontSize;

    window.addEventListener('resize', this.resize.bind(this));
    this.sizeHtmlText();
    this.isTouchDevice = isTouchDevice();
    this.animateNextFrame(true, 'first frame');
    if (optionsToUse.elements) {
      // eslint-disable-next-line new-cap
      this.elements = new optionsToUse.elements(this);
      this.elements.figureLimits = this.limits;
      this.initElements();
    }
    this.waitForFrames = 0;
    this.scrollingFast = false;
    this.scrollTimeoutId = null;
    this.drawTimeoutId = null;
    this.oldScroll = window.pageYOffset;
    this.drawAnimationFrames = 0;
    this.cursorShown = false;
    // /**
    //  * Create built in {@link FigureElement}s
    //  * @property {function(OBJ_Polygon): FigureElementPrimitive} polygon
    //  */
    // deprecate
    // $FlowFixMe
    this.create = {
      collection: this.shapes.collection.bind(this.shapes),
      generic: this.shapes.generic.bind(this.shapes),
      polyline: this.shapes.polyline.bind(this.shapes),
      polygon: this.shapes.polygon.bind(this.shapes),
      grid: this.shapes.grid.bind(this.shapes),
      triangle: this.shapes.triangle.bind(this.shapes),
      rectangle: this.shapes.rectangle.bind(this.shapes),
      // radialLines: this.shapes.radialLines.bind(this.shapes),
      text: this.shapes.text.bind(this.shapes),
      textLine: this.shapes.textLine.bind(this.shapes),
      textLines: this.shapes.textLines.bind(this.shapes),
      // arrow: this.shapes.arrow.bind(this.shapes),
      html: this.shapes.html.bind(this.shapes),
      // htmlImage: this.shapes.htmlImage.bind(this.shapes),
      // htmlText: this.shapes.htmlText.bind(this.shapes),
      line: this.collections.line.bind(this.collections),
      angle: this.collections.angle.bind(this.collections),
      smartPolyLine: this.collections.polyline.bind(this.collections),
      equation: this.equation.equation.bind(this.equation),
    };
  }

  bindRecorder() {
    // this.recorder.figure = {
    //   animateNextFrame: this.animateNextFrame.bind(this),
    //   setState: this.setState.bind(this),
    //   getState: this.getState.bind(this),
    //   getElement: this.getElement.bind(this),
    //   showCursor: this.showCursor.bind(this),
    //   pause: this.pause.bind(this),
    //   unpause: this.unpause.bind(this),
    //   getIsInTransition: this.getIsInTransition.bind(this),
    //   animateToState: this.animateToState.bind(this),
    //   isAnimating: this.isAnimating.bind(this),
    //   setAnimationFinishedCallback: this.setAnimationFinishedCallback.bind(this),
    //   subscriptions: this.subscriptions,
    //   getPauseState: this.getPauseState.bind(this),
    //   dissolveToState: this.dissolveToState.bind(this),
    // };
    const onCursor = (payload) => {
      const [action, x, y] = payload;
      if (action === 'show') {
        this.showCursor('up', new Point(x, y));
      } else {
        this.showCursor('hide');
      }
    };
    const onTouch = (payload) => {
      const [action, x, y] = payload;
      if (!this.isCursorShown()) {
        return;
      }
      if (action === 'down') {
        this.showCursor('down', new Point(x, y));
      } else {
        this.showCursor('up');
      }
    };
    const onCursorMove = (payload) => {
      const [x, y] = payload;
      this.setCursor(new Point(x, y));
    };
    const moved = (payload) => {
      const [elementPath, transform] = payload;
      const element = this.getElement(elementPath);
      if (element == null) {
        return;
      }
      element.moved(getTransform(transform));
    };

    const startBeingMoved = (payload) => {
      const [elementPath] = payload;
      const element = this.getElement(elementPath);
      if (element == null) {
        return;
      }
      element.startBeingMoved();
    };

    const stopBeingMoved = (payload) => {
      const [elementPath, transform, velocity] = payload;
      const element = this.getElement(elementPath);
      if (element == null) {
        return;
      }
      element.stopBeingMoved();
      element.state.movement.velocity = getTransform(velocity);
      element.transform = getTransform(transform);
    };

    const startMovingFreely = (payload) => {
      const [elementPath, transform, velocity] = payload;
      const element = this.getElement(elementPath);
      if (element == null) {
        return;
      }
      element.transform = getTransform(transform);
      element.state.movement.velocity = getTransform(velocity);
      element.startMovingFreely();
    };
    const click = (payload) => {
      const [id] = payload;
      const element = document.getElementById(id);
      if (element != null) {
        element.click();
      }
    };
    const elementClick = (payload) => {
      const [elementPath] = payload;
      const element = this.getElement(elementPath);
      if (element != null) {
        element.click(payload);
      }
    };
    const eqnNavClick = (payload) => {
      const [direction, elementPath] = payload;
      const element = this.getElement(elementPath);
      if (element == null) {
        // element.click();
        return;
      }
      if (direction === 'next') { // $FlowFixMe
        element.clickNext();
      }
      if (direction === 'prev') { // $FlowFixMe
        element.clickPrev();
      }
      if (direction === 'refresh') { // $FlowFixMe
        element.clickRefresh();
      }
    };

    this.recorder.addEventType('cursor', onCursor);
    this.recorder.addEventType('cursorMove', onCursorMove);
    this.recorder.addEventType('touch', onTouch);
    this.recorder.addEventType('moved', moved);
    this.recorder.addEventType('stopBeingMoved', stopBeingMoved);
    this.recorder.addEventType('startMovingFreely', startMovingFreely);
    this.recorder.addEventType('startBeingMoved', startBeingMoved);
    this.recorder.addEventType('click', click);
    this.recorder.addEventType('elementClick', elementClick);
    this.recorder.addEventType('eqnNavClick', eqnNavClick);
  }

  setDefaultLineWidth(userInputLineWidth: number | null) {
    if (userInputLineWidth != null) {
      this.defaultLineWidth = userInputLineWidth;
      return;
    }

    const matrix = this.spaceTransforms.pixelToFigure.matrix();
    this.defaultLineWidth = Math.abs(matrix[0]);
  }

  setDefaultLength(userInputLength: number | null) {
    if (userInputLength != null) {
      this.defaultLength = userInputLength;
      return;
    }

    this.defaultLength = this.limits.width / 4;
  }

  scrollEvent() {
    this.scrolled = true;
    this.animateNextFrame(false, 'scroll event');
  }

  enableScrolling() {
    document.addEventListener(
      'scroll',
      this.scrollEvent.bind(this),
      false,
    );
  }

  disableScrolling() {
    document.removeEventListener(
      'scroll',
      this.scrollEvent.bind(this),
      false,
    );
  }

  getState(options: { precision?: number, ignoreShown?: boolean, min?: boolean }) {
    this.stateTime = this.globalAnimation.now() / 1000;
    return getState(this, [
      'lastDrawTime',
      'elements',
      'stateTime',
    ], options);
  }

  setState(
    stateIn: Object,
    optionsIn: {
      how: 'animate' | 'dissolve' | 'instant',
      duration?: number | {
        dissovlveOut: ?number,
        dissovlveIn: ?number,
        delay: ?number,
      },
      velocity?: OBJ_ScenarioVelocity,
      maxDuration?: number,
      // minDuration?: number,
      zeroDurationThreshold?: boolean,
      allDurationsSame?: boolean,
    } | 'dissolve' | 'animate' | 'instant' = 'instant',
  ) {
    // console.log(stateIn)
    // $FlowFixMe
    const state = parseState(stateIn, this);
    let finishedFlag = false;
    this.state.preparingToSetState = false;
    const finished = () => {
      finishedFlag = true;
      this.state.preparingToSetState = false;
      // if (window.asdf) {
      //   debugger;
      // }
      setState(this, state);
      this.elements.setTimeDelta(this.globalAnimation.now() / 1000 - this.stateTime);
      this.elements.setPointsFromDefinition();
      this.elements.setPrimitiveColors();
      if (this.setStateCallback != null) {
        this.fnMap.exec(this.setStateCallback);
      }
      this.animateNextFrame();
      // console.log('triggered')
      this.subscriptions.publish('stateSet');
    };

    let options = {
      how: 'instant',
      maxDuration: 6,
      // velocity: {
      //   position: 2,
      //   rotation: Math.PI * 2 / 2,
      //   scale: 1,
      //   opacity: 0.8,
      //   color: 0.8,
      // },
      allDurationsSame: true,
      zeroDurationThreshold: 0.00001,
      // minDuration: 0,
      duration: 0,
    };
    if (optionsIn.velocity != null) { // $FlowFixMe
      options.velocity = {
        position: 2,
        rotation: Math.PI * 2 / 2,
        scale: 1,
        opacity: 0.8,
        color: 0.8,
      };
    }

    // console.log(resumeSettings)
    if (typeof optionsIn === 'string') {
      options.how = optionsIn;
    } else {
      options = joinObjects({}, options, optionsIn);
      // velocity trumps duration by default, but if only duration is defined by the
      // user, then remove velocity;
      // if (this.settings.resume.duration != null && this.settings.resume.velocity == null) {
      //   options.velocity = undefined;
      // }
    }
    if (options.how === 'dissolve') {
      const defaultDuration = {
        dissolveIn: 0.8,
        dissolveOut: 0.8,
        delay: 0.2,
      };
      if (options.duration === 0) {
        options.duration = defaultDuration;
      } else if (typeof options.duration === 'number') {
        options.duration = {
          dissolveOut: options.duration / 10 * 4.5,
          dissolveIn: options.duration / 10 * 4.5,
          delay: options.duration / 10 * 1,
        };
      } else {
        options.duration = joinObjects({}, defaultDuration, options.duration);
      }
    } else if (options.duration != null && typeof options.duration !== 'number') {
      // $FlowFixMe
      options.duration = {
        dissolveOut: 0,
        dissolveIn: 0,
        delay: 0,
      };
    }

    if (
      options.how === 'instant' // $FlowFixMe
      || this.elements.isStateSame(state.elements, true, ['cursor'])
    ) {
      finished();
    } else if (options.how === 'animate') {
      this.elements.stop('freeze');  // This is cancelling the pulse
      this.animateToState(
        state,
        options,
        finished,
        'now',
      );
    } else {
      // this.figure.elements.freezePulseTransforms(false);
      this.elements.stop('freeze');
      this.dissolveToState({
        state,
        dissolveInDuration: options.duration.dissolveIn,
        dissolveOutDuration: options.duration.dissolveOut,
        done: finished,
        delay: options.duration.delay,
        startTime: 'now',
      });
    }

    if (!finishedFlag) {
      this.state.preparingToSetState = true;
      this.subscriptions.publish('preparingToSetState');
    }
    this.animateNextFrame();
  }

  animateToState(
    state: Object,
    optionsIn: Object = {},
    done: ?(string | (() => void)),
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    // const defaultOptions = {
    //   // delay: 0,
    //   duration: 1,
    // };
    // if (optionsIn.velocity != null) {
    //   defaultOptions.duration = null;
    // }

    // const options = joinObjects(optionsIn, optionsIn);
    // countStart();
    const duration = this.elements.animateToState(
      state.elements, optionsIn, true, startTime,
    );

    // countEnd();
    if (done != null) {
      if (duration === 0) {
        this.fnMap.exec(done);
      } else if (done != null) {
        this.subscriptions.add('animationsFinished', done, 1);
      }
    }
  }


  dissolveToState(optionsIn: {
    state: Object,
    dissolveOutDuration: number,
    dissolveInDuration: number,
    delay: Number,
    done: ?(string | (() => void)),
    startTime: ?number | 'now' | 'prev' | 'next',
  }) {
    const options = joinObjects({}, {
      dissolveOutDuration: 0.8,
      dissolveInDuration: 0.8,
      delay: 0.2,
      done: null,
      startTime: null,
    }, optionsIn);
    this.elements.animations.new()
      .opacity({ duration: options.dissolveOutDuration, start: 1, target: 0.001 })
      .trigger(
        {
          callback: () => {
            this.elements.hideAll();
            this.elements.show();
            // this.elements.setOpacity(1);
          },
        },
      )
      .delay({ duration: options.delay })
      .trigger({
        callback: () => {
          this.dissolveInToState({
            state: options.state,
            duration: options.dissolveInDuration,
            done: options.done,
            startTime: options.startTime,
          });
          // this.
        },
        // duration: options.dissolveInDuration,
        duration: 0,
      })
      .start(options.startTime);
    // console.log(this.elements)
    // console.log(this.globalAnimation.now())
  }

  // dissolveToComplete(optionsIn: {
  //   dissolveOutDuration: number,
  //   dissolveInDuration: number,
  //   delay: Number,
  //   done: ?(string | (() => void)),
  //   startTime: ?number | 'now' | 'prev' | 'next',
  // }) {
  //   const options = joinObjects({}, {
  //     dissolveOutDuration: 0.8,
  //     dissolveInDuration: 0.8,
  //     delay: 0.2,
  //     done: null,
  //     startTime: null,
  //   }, optionsIn);
  //   const state = this.getState({});
  //   this.stop('complete');
  //   const completeState = this.getState({});
  //   this.setState(state, 'instant');
  //   this.elements.animations.new()
  //     .opacity({ duration: options.dissolveOutDuration, start: 1, target: 0.001 })
  //     .trigger(
  //       {
  //         callback: () => {
  //           this.elements.hideAll();
  //           this.elements.show();
  //           // this.elements.setOpacity(1);
  //         },
  //       },
  //     )
  //     .delay({ duration: options.delay })
  //     .trigger({
  //       callback: () => {
  //         this.dissolveInToState({
  //           state: completeState,
  //           duration: options.dissolveInDuration,
  //           done: options.done,
  //           startTime: options.startTime,
  //         });
  //         // this.
  //       },
  //       // duration: options.dissolveInDuration,
  //       duration: 0,
  //     })
  //     .start(options.startTime);
  // }


  dissolveInToState(optionsIn: {
    state: Object,
    duration: number,
    done: ?(string | (() => void)),
    startTime: ?number | 'now' | 'prev' | 'next',
  }) {
    const options = joinObjects({}, {
      duration: 0.8,
      done: null,
      startTime: null,
    }, optionsIn);
    const {
      state, duration, done, startTime,
    } = options;
    const dissolveDuration = this.elements.dissolveInToState(state.elements, duration, startTime);

    // force update of transforms to update any dependent transforms
    const elements = this.elements.getAllElements();
    elements.forEach((element) => {
      if (element.isShown && element.dependantTransform === false) {
        element.setTransform(element.transform);
      }
    });


    if (done != null) {
      if (dissolveDuration === 0) {
        this.fnMap.exec(done);
      } else if (done != null) {
        this.subscriptions.add('animationsFinished', done, 1);
      }
    }
  }

  /**
   * Add a {@link FigureElement} to the figure with some `name`.
   * @example
   * const hex = figure.create.polygon({
   *   radius: 0.5,
   *   fill: true,
   *   sides: 6,
   * });
   * figure.add('hexagon', hex);
   */
  add(
    name: string,
    figureElement: FigureElementPrimitive | FigureElementCollection,
  ) {
    this.elements.add(name, figureElement);
  }


  /**
   * Add elements from element definitions to the figure.
   *
   * @param {Array<TypeAddElementObject>} elementsToAdd - array of element definitions
   * @param {FigureElementCollection} [collection = this.elements] - the
   * collection to add elements to
   * @param {string} [addElementsKey = 'addElements'] - key to add elements
   *
   * @example
   * figure.addElements([
   *   {
   *     name: 'hex',
   *     method: 'polygon',
   *     options: {
   *       radius: 0.5,
   *       fill: true,
   *       sides: 6,
   *       position: [-0.5, 0],
   *     },
   *   },
   *   {
   *     name: 'tri',
   *     method: 'polygon',
   *     options: {
   *       radius: 0.5,
   *       fill: true,
   *       sides: 3,
   *       position: [0.5, 0],
   *     },
   *   },
   * ]);
   */
  addElements(
    elementsToAdd: Array<TypeAddElementObject>,
    collection: FigureElementCollection = this.elements,
    addElementsKey: string = 'addElements',
  ) {
    addElements(
      this.shapes,
      this.equation,
      this.collections,
      collection,
      elementsToAdd,
      addElementsKey,
    );
  }

  /**
   * Add an element from an element definitions to the figure.
   * @param {TypeAddElementObject} elementDefinition - array of element definitions
   * @param {FigureElementCollection} [collection = this.elements] - the
   * collection to add elements to
   * @param {string} [addElementsKey = 'addElements'] - key to add elements
   *
   * @example
   * figure.addElement({
   *   name: 'hex',
   *   method: 'polygon',
   *   options: {
   *     radius: 0.5,
   *     fill: true,
   *     sides: 6,
   *     position: [-0.5, 0],
   *   },
   * });
   */
  addElement(
    elementDefinition: TypeAddElementObject,
    rootCollection: FigureElementCollection = this.elements,
    addElementsKey: string = 'addElements',
  ) {
    addElements(
      this.shapes,
      this.equation,
      this.collections,
      rootCollection,
      [elementDefinition],
      addElementsKey,
    );
  }

  /**
   * Get element from element name or path.

   * @see <a href="#figureelementcollectiongetelement">element.getElement</a>
   *
   * @example
   * // Get a figure element and rotate it
   * figure.addElements([
   *   {
   *     name: 'hex',
   *     method: 'polygon',
   *     options: {
   *       radius: 0.5,
   *       fill: true,
   *       sides: 6,
   *       position: [-0.5, 0],
   *     },
   *   },
   *   {
   *     name: 'tri',
   *     method: 'polygon',
   *     options: {
   *       radius: 0.5,
   *       fill: true,
   *       sides: 3,
   *       position: [0.5, 0],
   *     },
   *   },
   * ]);
   *
   * const hex = figure.getElement('hex');
   * hex.animations.new()
   *   .rotation({ target: Math.PI, duration: 2, delay: 1 })
   *   .start();
   */
  getElement(elementName: string) {
    if (elementName === this.elements.name) {
      return this.elements;
    }
    return this.elements.getElement(elementName);
  }

  /**
   * Set the figure to be touchable.
   *
   * Using <a href="#figureelementsettouchable">element.setTouchable</a> will
   * automatically set this.
   */
  setTouchable(touchable: boolean = true) {
    if (touchable) {
      this.elements.hasTouchableElements = true;
    } else {
      this.elements.hasTouchableElements = false;
    }
  }

  getShapes() {
    const webgl = [this.webglLow];
    if (this.webglOffscreen) {
      webgl.push(this.webglOffscreen);
    }
    const draw2D = [this.draw2DLow];
    if (this.draw2DOffscreen) {
      draw2D.push(this.draw2DOffscreen);
    }
    // if (high) {
    //   webgl = this.webglHigh;
    //   draw2D = this.draw2DHigh;
    // }
    return new FigurePrimitives(
      webgl, draw2D,
      // this.draw2DFigures,
      this.htmlCanvas,
      this.limits,
      this.spaceTransforms,
      this.animateNextFrame.bind(this, true, 'getShapes'),
      this.defaultColor,
      this.defaultFont,
      this.defaultLineWidth,
      this.defaultLength,
    );
  }

  getEquations() {
    const shapes = this.shapesLow;
    // if (high) {
    //   shapes = this.shapesHigh;
    // }
    return new FigureEquation(shapes, this.animateNextFrame.bind(this, true, 'equations'));
  }

  getObjects() {
    const shapes = this.shapesLow;
    const equation = this.equationLow;
    // if (high) {
    //   shapes = this.shapesHigh;
    //   equation = this.equationHigh;
    // }
    return new FigureCollections(
      shapes,
      equation,
      this.isTouchDevice,
      this.animateNextFrame.bind(this, true, 'collections'),
    );
  }

  sizeHtmlText() {
    const containerRect = this.container.getBoundingClientRect();
    let size = containerRect.width / 35;
    const test = document.getElementById(`${this.htmlId}_measure`);
    if (test != null) {
      test.style.fontSize = `${size}px`;
      const width = (test.clientWidth + 1);
      const ratio = width / containerRect.width;
      if (containerRect.width < 500) {
        size = Math.floor(0.84 / ratio * size * 10000) / 10000;
      } else {
        size = Math.floor(0.85 / ratio * size * 10000) / 10000;
      }
    }

    this.htmlCanvas.style.fontSize = `${size}px`;
  }

  destroy() {
    this.gesture.destroy();
    this.webglLow.gl.getExtension('WEBGL_lose_context').loseContext();
    // this.webglHigh.gl.getExtension('WEBGL_lose_context').loseContext();
  }

  setSpaceTransforms() {
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const figureSpace = {
      x: { bottomLeft: this.limits.left, width: this.limits.width },
      y: { bottomLeft: this.limits.bottom, height: this.limits.height },
    };

    // console.log(this.canvasLow)
    const canvasRect = this.canvasLow.getBoundingClientRect();
    const pixelSpace = {
      x: { bottomLeft: 0, width: canvasRect.width },
      y: { bottomLeft: canvasRect.height, height: -canvasRect.height },
    };

    const percentSpace = {
      x: { bottomLeft: 0, width: 1 },
      y: { bottomLeft: 1, height: -1 },
    };

    this.spaceTransforms = {
      figureToGL: spaceToSpaceTransform(figureSpace, glSpace, 'Figure'),
      glToFigure: spaceToSpaceTransform(glSpace, figureSpace),
      pixelToFigure: spaceToSpaceTransform(pixelSpace, figureSpace),
      figureToPixel: spaceToSpaceTransform(figureSpace, pixelSpace),
      pixelToGL: spaceToSpaceTransform(pixelSpace, glSpace),
      glToPixel: spaceToSpaceTransform(glSpace, pixelSpace),
      figureToCSSPercent: spaceToSpaceTransform(figureSpace, percentSpace),
    };
  }

  // startRecording() {
  //   this.isRecording = true;
  // }

  // stopRecording() {
  //   this.isRecording = false;
  // }

  // deprecate
  // eslint-disable-next-line class-methods-use-this
  initialize() {
    // const elements = this.elements.getAllElements();
    // /* eslint-disable no-param-reassign */
    // elements.forEach((element) => {
    //   element.figure = this;
    //   element.recorder = this.recorder;
    //   element.animationFinishedCallback = this.animationFinished.bind(this, element);
    // });
    // this.elements.setFigure(this);
    // // /* eslint-enable no-param-reassign */
    // this.setFirstTransform();
    // this.animateNextFrame();
    // this.elements.setFigure({
    //   limits: this.limits,
    //   spaceTransforms: this.spaceTransforms,
    //   animateNextFrame: this.animateNextFrame.bind(this),
    //   animationFinished: this.animationFinished.bind(this),
    //   recorder: this.recorder,
    // });
    // this.setFirstTransform();
    // this.animateNextFrame();
  }

  initElements() {
    // const elements = this.elements.getAllElements();
    // /* eslint-disable no-param-reassign */
    // elements.forEach((element) => {
    //   element.figure = this;
    //   element.recorder = this.recorder;
    //   element.animationFinishedCallback = this.animationFinished.bind(this, element);
    // });
    // this.elements.setFigure(this);
    // // /* eslint-enable no-param-reassign */
    // this.setFirstTransform();
    // this.animateNextFrame();
    this.elements.setFigure({
      limits: this.limits,
      spaceTransforms: this.spaceTransforms,
      animateNextFrame: this.animateNextFrame.bind(this),
      animationFinished: this.animationFinished.bind(this),
      recorder: this.recorder,
    });
    this.setFirstTransform();
    this.animateNextFrame();
  }

  setElements(collection: FigureElementCollection) {
    this.elements = collection;
    this.initElements();
    // this.elements.setFigure(this);
    // // /* eslint-enable no-param-reassign */
    // this.setFirstTransform();
    // this.animateNextFrame();
  }

  /**
   * Get remaining animation durations of running animations
   */
  getRemainingAnimationTime(nowIn: number = this.globalAnimation.now() / 1000) {
    const elements = this.elements.getAllElements();
    let now = nowIn;

    if (this.state.pause === 'paused') {
      now = this.pauseTime;
    }
    let remainingTime = 0;

    elements.forEach((element) => {
      const elementRemainingTime = element.animations.getRemainingTime([], now);
      if (elementRemainingTime > remainingTime) {
        remainingTime = elementRemainingTime;
      }
      const remainingPulseTime = element.getRemainingPulseTime(now);
      if (remainingPulseTime > remainingTime) {
        remainingTime = remainingPulseTime;
      }
      const remainingMovingFreelyTime = element.getRemainingMovingFreelyTime(now);
      if (remainingMovingFreelyTime > remainingTime) {
        remainingTime = remainingMovingFreelyTime;
      }
    });
    return remainingTime;
  }

  setAnimationFinishedCallback(callback: ?(string | (() => void))) {
    this.animationFinishedCallback = callback;
  }

  animationFinished() {
    if (this.isAnimating()) {
      return;
    }
    this.fnMap.exec(this.animationFinishedCallback);
    this.subscriptions.publish('animationsFinished');
  }

  setFirstTransform() {
    this.elements.setFirstTransform(this.spaceTransforms.figureToGL);
  }

  updateLimits(limits: TypeParsableRect) {
    const l = getRect(limits);
    this.limits = l._dup();
    this.setSpaceTransforms();
  }

  // Renders all tied elements in the first level of figure elements
  renderAllElementsToTiedCanvases(force: boolean = false) {
    if (this.canvasOffscreen == null) {
      return;
    }
    let needClear = false;
    Object.keys(this.elements.elements).forEach((name) => {
      const element = this.elements.elements[name];
      if (
        element.isShown
        && (element.isRenderedAsImage === false || force)
        && element.tieToHTML.element != null
      ) {
        element.isRenderedAsImage = true;
        this.renderElementToTiedCanvas(name);
        needClear = true;
      }
    });
    if (needClear) {
      this.drawQueued = true;
      this.clearContext();
      this.draw2DLow.ctx.clearRect(0, 0, this.textCanvasLow.width, this.textCanvasLow.height);
      this.draw(-1);
    }
  }

  renderElementToTiedCanvas(elementName: string) {
    // record visibility of top level elements in figure
    const currentVisibility = {};
    Object.keys(this.elements.elements).forEach((name) => {
      const element = this.elements.elements[name];
      currentVisibility[name] = element.isShown;
    });

    // Hide all elements
    Object.keys(this.elements.elements).forEach((name) => {
      this.elements.elements[name].hide();
    });

    // Show the element to render
    const elementToRender = this.elements.elements[elementName];
    elementToRender.show();

    // Move it to the origin to render
    const oldPosition = elementToRender.getPosition();
    const oldScale = elementToRender.getScale();
    const htmlCanvas = document.getElementById(elementToRender.tieToHTML.element);
    if (htmlCanvas instanceof HTMLElement) {
      this.canvasOffscreen.style.width = `${htmlCanvas.clientWidth}px`;
      this.canvasOffscreen.style.height = `${htmlCanvas.clientHeight}px`;
      this.textCanvasOffscreen.style.width = `${htmlCanvas.clientWidth}px`;
      this.textCanvasOffscreen.style.height = `${htmlCanvas.clientHeight}px`;
      this.webglOffscreen.resize();
      this.draw2DOffscreen.resize();
    }

    elementToRender.updateHTMLElementTie(this.canvasOffscreen);
    // Need to reset position as updateHTMLElementTie doesn't set correct
    // position as it uses a figure pixels space transform that is only
    // relavant to the first gl canvas.
    const scale = elementToRender.getScale();
    elementToRender
      .setPosition(0 - scale.x * (elementToRender.tieToHTML.window.left
        + elementToRender.tieToHTML.window.width / 2),
      0 - scale.y * (elementToRender.tieToHTML.window.bottom
        + elementToRender.tieToHTML.window.height / 2));
    // elementToRender.setPosition(0, 0);

    // Stop animations and render
    elementToRender.isRenderedAsImage = false;
    elementToRender.stop('complete');

    this.renderToCanvas(elementToRender.tieToHTML.element);
    elementToRender.isRenderedAsImage = true;
    // elementToRender.setRenderedOnNextDraw();
    // reset position
    elementToRender.setPosition(oldPosition);
    elementToRender.setScale(oldScale);

    // show all elements that were shown previously (except element that was just rendered)
    Object.keys(this.elements.elements).forEach((name) => {
      const element = this.elements.elements[name];
      if (currentVisibility[name] === true) {
        element.show();
      } else {
        element.hide();
      }
    });
  }

  // This method will render the gl and 2d contexts to a canvas
  renderToCanvas(
    htmlCanvasElementOrId: string = '',
  ) {
    let htmlCanvas = htmlCanvasElementOrId;
    if (typeof htmlCanvasElementOrId === 'string') {
      htmlCanvas = document.getElementById(htmlCanvasElementOrId);
    }

    if (!(htmlCanvas instanceof HTMLElement)) {
      return;
    }

    this.drawQueued = true;
    this.draw(-1, 1);

    const w = document.getElementById(`${htmlCanvasElementOrId}_webgl`);
    if (w instanceof HTMLImageElement) {
      w.src = this.webglOffscreen.gl.canvas.toDataURL('image/png', 0.5);
      w.style.display = 'block';
    }


    const d = document.getElementById(`${htmlCanvasElementOrId}_2d`);
    if (d instanceof HTMLImageElement) {
      d.src = this.draw2DOffscreen.canvas.toDataURL('image/png', 0.5);
      d.style.display = 'block';
    }
    this.clearContext(1);
  }

  unrenderAll() {
    // console.log('unrender all', Object.keys(this.elements.drawOrder).length)
    for (let i = 0; i < this.elements.drawOrder.length; i += 1) {
      const element = this.elements.elements[this.elements.drawOrder[i]];
      element.unrender();
    }
  }

  // resize should only be called if the viewport size has changed.
  resize(skipHTMLTie: boolean = false) {
    this.webglLow.resize();
    this.draw2DLow.resize();
    this.setSpaceTransforms();
    if (this.elements != null) {
      this.elements.updateLimits(this.limits, this.spaceTransforms);
    }
    this.sizeHtmlText();
    // this.elements.resizeHtmlObject();
    // this.updateHTMLElementTie();
    if (skipHTMLTie) {
      this.elements.resize();
    } else {
      this.elements.resize(this.canvasLow);
    }
    if (this.oldWidth !== this.canvasLow.clientWidth) {
      // this.unrenderAll();
      // console.log('updating width')
      this.renderAllElementsToTiedCanvases();
      this.oldWidth = this.canvasLow.clientWidth;
    }
    this.animateNextFrame(true, 'resize');
    this.drawAnimationFrames = 2;
    // this.renderAllElementsToTiedCanvases(true);
  }

  updateHTMLElementTie() {
    if (this.elements != null) {
      this.elements.updateHTMLElementTie(
        this.canvasLow,
      );
    }
  }

  // simulateTouchDown(figurePoint: Point) {
  //   // const pixelPoint = figurePoint.transformBy(this.spaceTransforms.figureToPixel.matrix());
  //   // const clientPoint = this.pixelToClient(pixelPoint);
  //   // this.touchDownHandler(clientPoint);

  //   const pointer = this.getElement(this.cursorElementName);
  //   if (pointer == null) {
  //     return;
  //   }
  //   const up = pointer.getElement('up');
  //   const down = pointer.getElement('down');
  //   if (up == null || down == null) {
  //     return;
  //   }
  //   up.hide();
  //   down.show();
  //   pointer.setPosition(figurePoint);
  // }

  toggleCursor() {
    this.cursorShown = !this.cursorShown;
    if (this.recorder.state === 'recording') {
      if (this.cursorShown) {
        this.recorder.recordEvent('cursor', ['show', this.previousCursorPoint.x, this.previousCursorPoint.y]);
        if (this.isTouchDown) {
          this.showCursor('down');
        } else {
          this.showCursor('up');
        }
        this.setCursor(this.previousCursorPoint);
      } else {
        this.recorder.recordEvent('cursor', ['hide']);
        this.showCursor('hide');
      }
    }
  }

  showCursor(show: 'up' | 'down' | 'hide', position: ?Point = null) {
    const cursor = this.getElement(this.cursorElementName);
    if (cursor == null) {
      return;
    }
    const up = cursor.getElement('up');
    const down = cursor.getElement('down');
    if (up == null || down == null) {
      return;
    }
    if (show === 'up') {
      up.showAll();
      down.hide();
    } else if (show === 'down') {
      up.hide();
      down.showAll();
    } else {
      cursor.hide();
    }
    if (position != null) {
      this.setCursor(position);
    }
    this.animateNextFrame();
  }

  isCursorShown() {
    const cursor = this.getElement(this.cursorElementName);
    if (cursor == null) {
      return false;
    }
    return cursor.isShown;
  }

  // Handle touch down, or mouse click events within the canvas.
  // The default behavior is to be able to move objects that are touched
  // and dragged, then when they are released, for them to move freely before
  // coming to a stop.
  touchDownHandler(clientPoint: Point) {
    if (this.recorder.state === 'recording') {
      const pixelP = this.clientToPixel(clientPoint);
      const figurePoint = pixelP.transformBy(this.spaceTransforms.pixelToFigure.matrix());
      this.recorder.recordEvent('touch', ['down', figurePoint.x, figurePoint.y]);
      if (this.cursorShown) {
        this.showCursor('down');
      }
    }

    if (this.isPaused) {
      this.unpause();
    }
    if (this.recorder.state === 'playing') {
      this.recorder.pausePlayback();
      this.showCursor('hide');
    }
    if (this.inTransition) {
      return false;
    }
    this.isTouchDown = true;

    // Get the touched point in clip space
    const pixelPoint = this.clientToPixel(clientPoint);
    // console.log(pixelPoint)
    const glPoint = pixelPoint.transformBy(this.spaceTransforms.pixelToGL.matrix());
    // console.log(glPoint)
    // console.log(glPoint, clientPoint)

    // console.log(glPoint.transformBy(this.glToFigureSpaceTransform.matrix()))
    // const clipPoint = this.clientToClip(clientPoint);

    // Get all the figure elements that were touched at this point (element
    // must have isTouchable = true to be considered)
    this.beingTouchedElements = this.elements.getTouched(glPoint);
    // console.log(this.beingTouchedElements)
    if (this.moveTopElementOnly) {
      if (this.beingTouchedElements.length > 0) {
        this.beingTouchedElements[0].click(glPoint);
      }
    } else {
      this.beingTouchedElements.forEach(e => e.click(glPoint));
    }

    // Make a list of, and start moving elements that are being moved
    // (element must be touched and have isMovable = true to be in list)
    this.beingMovedElements = [];
    for (let i = 0; i < this.beingTouchedElements.length; i += 1) {
      const element = this.beingTouchedElements[i];
      if (element.isMovable) {
        this.beingMovedElements.push(element);
        element.startBeingMoved();
      }
    }
    if (this.beingMovedElements.length > 0) {
      this.animateNextFrame(true, 'touch down handler');
    }
    if (this.beingTouchedElements.length > 0) {
      return true;
    }
    return false;
  }

  // simulateTouchUp() {
  //   // this.touchUpHandler();
  //   const pointer = this.getElement(this.cursorElementName);
  //   if (pointer == null) {
  //     return;
  //   }
  //   const up = pointer.getElement('up');
  //   const down = pointer.getElement('down');
  //   if (up == null || down == null) {
  //     return;
  //   }
  //   up.show();
  //   down.hide();
  // }

  // Handle touch up, or mouse click up events in the canvas. When an UP even
  // happens, the default behavior is to let any elements being moved to move
  // freely until they decelerate to 0.
  touchUpHandler() {
    if (this.recorder.state === 'recording') {
      this.recorder.recordEvent('touch', ['up']);
      if (this.cursorShown) {
        this.showCursor('up');
      }
    }
    // console.log("before", this.elements._circle.transform.t())
    // console.log(this.beingMovedElements)
    for (let i = 0; i < this.beingMovedElements.length; i += 1) {
      const element = this.beingMovedElements[i];
      if (element.state.isBeingMoved) {
        element.stopBeingMoved();
        element.startMovingFreely();
      }
    }
    this.isTouchDown = false;
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    // console.log("after", this.elements._circle.transform.t())
  }

  // simulateCursorMove(figurePoint: Point) {
  //   const pointer = this.getElement(this.cursorElementName);
  //   if (pointer == null) {
  //     return;
  //   }
  //   pointer.setPosition(figurePoint);
  // }

  setCursor(p: Point) {
    const pointer = this.getElement(this.cursorElementName);
    if (pointer == null) {
      return;
    }
    pointer.setPosition(p);
    // console.log(p, pointer.isShown, pointer._up.isShown, pointer);
    this.animateNextFrame();
  }

  touchFreeHandler(clientPoint: Point) {
    if (this.recorder.state === 'recording') {
      const pixelP = this.clientToPixel(clientPoint);
      const figurePoint = pixelP.transformBy(this.spaceTransforms.pixelToFigure.matrix());
      this.previousCursorPoint = figurePoint;
      if (this.cursorShown) {
        this.recorder.recordEvent('cursorMove', [figurePoint.x, figurePoint.y]);
        this.setCursor(figurePoint);
      }
    }
  }

  rotateElement(
    element: FigureElement,
    previousClientPoint: Point,
    currentClientPoint: Point,
  ) {
    let centerFigureSpace = element.getPosition('figure');
    if (centerFigureSpace == null) {
      centerFigureSpace = new Point(0, 0);
    }
    const center = centerFigureSpace
      .transformBy(this.spaceTransforms.figureToPixel.matrix());
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    // const previousFigurePoint =
    //   previousPixelPoint.transformBy(this.pixelToFigureSpaceTransform.matrix());
    // const currentFigurePoint =
    //   currentPixelPoint.transformBy(this.pixelToFigureSpaceTransform.matrix());
    // const currentAngle = Math.atan2(
    //   currentFigurePoint.y - center.y,
    //   currentFigurePoint.x - center.x,
    // );
    // const previousAngle = Math.atan2(
    //   previousFigurePoint.y - center.y,
    //   previousFigurePoint.x - center.x,
    // );
    const currentAngle = Math.atan2(
      currentPixelPoint.y - center.y,
      currentPixelPoint.x - center.x,
    );
    const previousAngle = Math.atan2(
      previousPixelPoint.y - center.y,
      previousPixelPoint.x - center.x,
    );
    const diffAngle = -minAngleDiff(previousAngle, currentAngle);
    const transform = element.transform._dup();
    let rot = transform.r();
    if (rot == null) {
      rot = 0;
    }
    const newAngle = rot - diffAngle;
    // if (newAngle < 0) {
    //   newAngle += 2 * Math.PI;
    // }
    // if (newAngle > 2 * Math.PI) {
    //   newAngle -= 2 * Math.PI;
    // }
    transform.updateRotation(newAngle);
    element.moved(transform._dup());
  }

  translateElement(
    element: FigureElement,
    previousClientPoint: Point,
    currentClientPoint: Point,
  ) {
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    const previousFigurePoint =
      previousPixelPoint.transformBy(this.spaceTransforms.pixelToFigure.matrix());
    const currentFigurePoint =
      currentPixelPoint.transformBy(this.spaceTransforms.pixelToFigure.matrix());
    const m = element.spaceTransformMatrix('figure', 'local');

    const currentVertexSpacePoint = currentFigurePoint.transformBy(m);
    const previousVertexSpacePoint = previousFigurePoint.transformBy(m);
    // const delta = currentFigurePoint.sub(previousFigurePoint);
    const elementSpaceDelta = currentVertexSpacePoint.sub(previousVertexSpacePoint);
    // console.log(delta, elementSpaceDelta)
    const currentTransform = element.transform._dup();
    const currentTranslation = currentTransform.t();
    if (currentTranslation != null) {
      const newTranslation = currentTranslation.add(elementSpaceDelta);
      currentTransform.updateTranslation(newTranslation);
      element.moved(currentTransform);
    }
  }

  scaleElement(
    element: FigureElement,
    previousClientPoint: Point,
    currentClientPoint: Point,
    type: 'x' | 'y' | '' = '',
  ) {
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    // const previousFigurePoint =
    //   previousPixelPoint.transformBy(this.pixelToFigureSpaceTransform.matrix());
    // const currentFigurePoint =
    //   currentPixelPoint.transformBy(this.pixelToFigureSpaceTransform.matrix());

    // const previousMag = previousFigurePoint.sub(center).distance();
    // const currentMag = currentFigurePoint.sub(center).distance();
    const center = element.getPosition('figure')
      .transformBy(this.spaceTransforms.figureToPixel.matrix());
    const previousMag = previousPixelPoint.sub(center).distance();
    const currentMag = currentPixelPoint.sub(center).distance();


    const currentScale = element.transform.s();
    if (currentScale != null) {
      const currentTransform = element.transform._dup();
      const newScaleX = currentScale.x * currentMag / previousMag;
      const newScaleY = currentScale.y * currentMag / previousMag;
      if (type === 'x') {
        currentTransform.updateScale(newScaleX, 1);
      } else if (type === 'y') {
        currentTransform.updateScale(1, newScaleY);
      } else {
        currentTransform.updateScale(newScaleX, newScaleY);
      }
      element.moved(currentTransform);
    }
  }

  getIsInTransition() {
    return this.inTransition;
  }

  // simulateTouchMove(
  //   previousFigurePoint: Point,
  //   currentFigurePoint: Point,
  //   pointerElement: string = 'pointer',
  // ) {
  //   // const previousPixelPoint = previousFigurePoint
  //   //   .transformBy(this.spaceTransforms.figureToPixel.matrix());
  //   // const previousClientPoint = this.pixelToClient(previousPixelPoint);
  //   // const currentPixelPoint = currentFigurePoint
  //   //   .transformBy(this.spaceTransforms.figureToPixel.matrix());
  //   // const currentClientPoint = this.pixelToClient(currentPixelPoint);
  //   // this.touchMoveHandler(previousClientPoint, currentClientPoint);

  //   const pointer = this.getElement(pointerElement);
  //   if (pointer == null) {
  //     return;
  //   }
  //   pointer.setPosition(currentFigurePoint);
  // }

  // Handle touch/mouse move events in the canvas. These events will only be
  // sent if the initial touch down happened in the canvas.
  // The default behavior is to drag (move) any objects that were touched in
  // the down event to the new location.
  // This function should return true if the move event should NOT be processed
  // by the system. For example, on a touch device, a touch and drag would
  // normally scroll the screen. Typically, you would want to move the figure
  // element and not the screen, so a true would be returned.
  touchMoveHandler(previousClientPoint: Point, currentClientPoint: Point): boolean {
    if (this.recorder.state === 'recording') {
      const currentPixelPoint = this.clientToPixel(currentClientPoint);
      const figurePoint = currentPixelPoint
        .transformBy(this.spaceTransforms.pixelToFigure.matrix());
      this.recorder.recordEvent('cursorMove', [figurePoint.x, figurePoint.y]);
      if (this.cursorShown) {
        this.setCursor(figurePoint);
      }
    }

    if (this.inTransition) {
      return false;
    }
    if (this.beingMovedElements.length === 0) {
      return false;
    }
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    // const currentPixelPoint = this.clientToPixel(currentClientPoint);

    const previousGLPoint =
      previousPixelPoint.transformBy(this.spaceTransforms.pixelToGL.matrix());

    // Go through each element being moved, get the current translation
    for (let i = 0; i < this.beingMovedElements.length; i += 1) {
      const element = this.beingMovedElements[i];
      if (element !== this.elements) {
        if (element.isBeingTouched(previousGLPoint)
              || element.move.canBeMovedAfterLosingTouch) {
          const elementToMove = element.move.element == null ? element : element.move.element;
          if (elementToMove.state.isBeingMoved === false) {
            elementToMove.startBeingMoved();
          }
          if (this.beingMovedElements.indexOf(elementToMove) === -1) {
            this.beingMovedElements.push(elementToMove);
          }
          if (element.move.type === 'rotation') {
            this.rotateElement(
              elementToMove,
              previousClientPoint,
              currentClientPoint,
            );
          } else if (element.move.type === 'scale') {
            this.scaleElement(
              elementToMove,
              previousClientPoint,
              currentClientPoint,
            );
          } else if (element.move.type === 'scaleX') {
            this.scaleElement(
              elementToMove,
              previousClientPoint,
              currentClientPoint,
              'x',
            );
          } else if (element.move.type === 'scaleY') {
            this.scaleElement(
              elementToMove,
              previousClientPoint,
              currentClientPoint,
              'y',
            );
          } else {
            this.translateElement(
              elementToMove,
              previousClientPoint,
              currentClientPoint,
            );
          }
        }
      }
      if (this.moveTopElementOnly) {
        i = this.beingMovedElements.length;
      }
    }
    this.animateNextFrame(true, 'touch move handler');
    return true;
  }

  /**
   * Stop all animations, movement and pulses in figure.
   */
  stop(
    how: 'freeze' | 'cancel' | 'complete' | 'animateToComplete' | 'dissolveToComplete' = 'cancel',
  ) {
    const stopped = () => {
      this.subscriptions.publish('stopped');
      this.state.preparingToStop = false;
    };
    if (!this.elements.isAnimating()) {
      stopped();
      return;
    }
    if (how === 'freeze' || how === 'cancel' || how === 'complete') {
      this.elements.stop(how);
      stopped();
      return;
    }

    this.state.preparingToStop = false;
    if (how === 'animateToComplete') {
      this.elements.stop(how);
      const elements = this.elements.getAllElements();
      let preparingToStopCounter = 0;
      const checkAllStopped = () => {
        if (preparingToStopCounter > 0) {
          preparingToStopCounter -= 1;
        }
        if (preparingToStopCounter === 0) {
          stopped();
        }
      };
      elements.forEach((element) => {
        if (element.state.preparingToStop) {
          preparingToStopCounter += 1;
          element.subscriptions.add('stopped', checkAllStopped, 1);
        }
      });
      if (preparingToStopCounter === 0) {
        checkAllStopped();
      } else if (preparingToStopCounter > 0) {
        this.subscriptions.publish('preparingToStop');
        this.state.preparingToStop = true;
      }
      return;
    }
    // console.log('asdf')
    // Otherwise we are dissolving to complete
    const state = this.getState({});
    this.elements.stop('complete');
    const completeState = this.getState({});
    this.setState(state);
    this.elements.stop('freeze');
    this.setState(completeState, 'dissolve');
    if (this.state.preparingToSetState) {
      this.subscriptions.add('stateSet', stopped, 1);
      this.subscriptions.publish('preparingToStop');
      this.state.preparingToStop = true;
    } else {
      stopped();
    }
  }

  // To add elements to a figure, either this method can be overridden,
  // or the `add` method can be used.
  createFigureElements() {
    // this.elements = new FigureElementCollection();
    this.elements = this.primitive.collection();
    this.initElements();
    // this.elements.setFigure({
    //   limits: this.limits,
    //   spaceTransforms: this.spaceTransforms,
    //   animateNextFrame: this.animateNextFrame,
    //   animationFinished: this.animationFinished.bind(this),
    // });
    // this.setFirstTransform();
    // this.animateNextFrame();
    // this.elements.figureLimits = this.limits;
  }


  setElementsToCollection(collection: FigureElementCollection) {
    this.elements = collection;
    // this.elements.setDigram(this);
    // this.setFirstTransform();
    this.initElements();
  }

  clearContext(canvasIndex: number = 0) {
    if (canvasIndex === 0) {
      this.webglLow.gl.clearColor(0, 0, 0, 0);
      this.webglLow.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    } else {
      this.webglOffscreen.gl.clearColor(0, 0, 0, 0);
      this.webglOffscreen.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    }
    // this.webglHigh.gl.clearColor(0, 0, 0, 0);
    // this.webglHigh.gl.clear(this.webglHigh.gl.COLOR_BUFFER_BIT);
    this.elements.clear(canvasIndex);
  }

  // scroll() {
  //   if (this.scrollingFast === false) {
  //     this.webglLow.gl.canvas.style.top = '-10000px';
  //     this.renderAllElementsToTiedCanvases();
  //     this.scrollingFast = true;
  //     if (this.scrollTimeoutId) {
  //       clearTimeout(this.scrollTimeoutId);
  //       this.scrollTimeoutId = null;
  //     }
  //     this.scrollTimeoutId = setTimeout(this.centerDrawingLens.bind(this, true), 100);
  //   }
  // }

  drawNow(time: number = -1) {
    this.drawQueued = true;
    this.draw(time);
  }

  // getPaused() {
  //   return this.elements.getPaused();
  // }

  // getPauseState() {
  //   return this.state.pause;
  // }

  pause() {
    this.state.pause = 'paused';
    this.pauseTime = this.globalAnimation.now() / 1000;
  }

  // pauseLegacy(pauseSettings: TypePauseSettings = { simplePause: true }) {
  //   // forcePause: boolean = true, clearAnimations: boolean = false) {
  //   this.elements.pause(pauseSettings);
  //   if (pauseSettings.simplePause != null && pauseSettings.simplePause) {
  //     this.state.pause = 'paused';
  //     this.pauseTime = this.globalAnimation.now() / 1000;
  //     return;
  //   }

  //   const elements = this.elements.getAllElements();
  //   let preparingToPauseCounter = 0;
  //   const checkAllPaused = () => {
  //     if (preparingToPauseCounter > 0) {
  //       preparingToPauseCounter -= 1;
  //     }
  //     if (preparingToPauseCounter === 0) {
  //       this.state.pause = 'paused';
  //       this.isPaused = true;
  //       this.subscriptions.publish('paused');
  //     }
  //   }
  //   elements.forEach((element) => {
  //     if (element.state.pause === 'preparingToPause') {
  //       preparingToPauseCounter += 1;
  //       element.subscriptions.add('paused', checkAllPaused, 1);
  //     }
  //   });
  //   this.pauseTime = this.globalAnimation.now() / 1000;
  //   if (preparingToPauseCounter === 0 && this.state.pause !== 'paused') {
  //     checkAllPaused();
  //   } else if (preparingToPauseCounter > 0) {
  //     this.state.pause = 'preparingToPause';
  //     this.subscriptions.publish('preparingToPause');
  //   }
  // }

  // pauseAfterNextDraw() {
  //   this.pauseAfterNextDrawFlag = true;
  // }

  unpause() {
    this.state.pause = 'unpaused';
    this.isPaused = false;
    this.elements.setTimeDelta(this.globalAnimation.now() / 1000 - this.pauseTime);
    this.animateNextFrame();
    this.subscriptions.publish('unpaused');
  }

  // unpauseLegacy() {
  //   this.elements.unpause();
  //   const elements = this.elements.getAllElements();
  //   let preparingToUnpauseCounter = 0;
  //   const checkAllUnpaused = () => {
  //     if (preparingToUnpauseCounter > 0) {
  //       preparingToUnpauseCounter -= 1;
  //     }
  //     if (preparingToUnpauseCounter === 0) {
  //       this.state.pause = 'unpaused';
  //       this.isPaused = false;
  //       this.elements.setTimeDelta(this.globalAnimation.now() / 1000 - this.pauseTime);
  //       this.animateNextFrame();
  //       this.subscriptions.publish('unpaused');
  //     }
  //   };
  //   elements.forEach((element) => {
  //     if (element.state.pause === 'preparingToUnpause') {
  //       preparingToUnpauseCounter += 1;
  //       element.subscriptions.add('unpaused', checkAllUnpaused, 1)
  //     }
  //   });
  //   if (preparingToUnpauseCounter === 0 && this.state.pause !== 'unpaused') {
  //     checkAllUnpaused();
  //   } else if (preparingToUnpauseCounter > 0) {
  //     this.state.pause = 'preparingToUnpause';
  //     this.subscriptions.publish('preparingToUnpause');
  //   }
  //   // // this.state.pause = this.elements.getPause();
  //   // this.pauseTime = performance.now() / 1000;


  //   // this.elements.unpause();
  //   // this.isPaused = false;
  //   // this.elements.setTimeDelta(performance.now() / 1000 - this.pauseTime);
  //   this.animateNextFrame();
  // }

  draw(nowIn: number, canvasIndex: number = 0): void {
    // const start = new Date().getTime();
    if (this.state.pause === 'paused') {
      return;
    }
    let now = nowIn;
    if (nowIn === -1) {
      now = this.lastDrawTime;
    }

    this.lastDrawTime = now;

    if (this.scrolled === true) {
      this.scrolled = false;
      if (Math.abs(window.pageYOffset - this.oldScroll)
          > this.webglLow.gl.canvas.clientHeight / 4
      ) {
        this.renderAllElementsToTiedCanvases();
        // }
        this.scrollingFast = true;
        if (this.scrollTimeoutId) {
          clearTimeout(this.scrollTimeoutId);
          this.scrollTimeoutId = null;
        }
        this.scrollTimeoutId = setTimeout(this.centerDrawingLens.bind(this, true), 100);
      }
    }

    // If only a scroll event called draw, then quit before drawing
    if (this.drawQueued === false) {
      return;
    }
    this.drawQueued = false;

    this.clearContext(canvasIndex);
    // console.log('really drawing')
    // const startSetup = new Date().getTime();
    this.elements.setupDraw(
      now,
      canvasIndex,
    );
    // const endSetup = new Date().getTime();
    // const startDraw = endSetup;
    this.elements.draw(now, [this.spaceTransforms.figureToGL], 1, canvasIndex);
    // const endDraw = new Date().getTime();

    if (this.elements.isAnyElementMoving()) {
      this.animateNextFrame(true, 'is moving');
    }

    if (this.drawAnimationFrames > 0) {
      this.drawAnimationFrames -= 1;
      this.animateNextFrame(true, 'queued frames');
    }

    // const end = new Date().getTime();
    // const total = end - start;
    // const setup = endSetup - startSetup;
    // const draw = endDraw - startDraw;
    // console.log(total, setup, draw, total - setup - draw);
  }

  // renderToImages() {
  //   // console.log('visibility1')
  //   this.drawTimeoutId = null;
  //   // if (this.webglLow.gl.canvas.style.top !== '-10000px') {
  //   //   this.webglLow.gl.canvas.style.top = '-10000px';
  //   //   this.waitForFrames = 1;
  //   // }
  //   this.renderAllElementsToTiedCanvases();
  //   // this.centerDrawingLens();
  //   // this.webglLow.gl.canvas.style.visibility = 'visible';
  // }

  centerDrawingLens(fromTimeOut: boolean = false) {
    if (fromTimeOut) {
      this.scrollingFast = false;
    }
    let viewPortHeight = window.innerHeight || 0;
    if (document.documentElement != null) {
      viewPortHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0,
      );
    }
    let newTop = window.pageYOffset + viewPortHeight / 2
                 - this.webglLow.gl.canvas.clientHeight / 2;
    if (newTop < 0) {
      newTop = 0;
    }
    const newTopInPx = `${newTop}px`;
    if (this.webglLow.gl.canvas.style.top !== newTopInPx) {
      this.webglLow.gl.canvas.style.top = `${newTop}px`;
      this.draw2DLow.canvas.style.top = `${newTop}px`;
      this.updateHTMLElementTie();
    }
    this.oldScroll = window.pageYOffset;
  }

  /**
   * Force figure to draw on next available animation frame.
   */
  animateNextFrame(draw: boolean = true, fromWhere: string = '') {
    this.fromWhere = fromWhere;
    if (!this.drawQueued) {
      if (draw) {
        this.drawQueued = true;
      }
      this.globalAnimation.queueNextFrame(this.draw.bind(this));
    }
  }

  isAnimating(): boolean {
    // console.log('asdf')
    return this.elements.isAnimating();
  }

  clientToPixel(clientLocation: Point): Point {
    const canvas = this.canvasLow.getBoundingClientRect();
    return new Point(
      clientLocation.x - canvas.left,
      clientLocation.y - canvas.top,
    );
  }

  pixelToClient(pixelLocation: Point): Point {
    const canvas = this.canvasLow.getBoundingClientRect();
    return new Point(
      pixelLocation.x + canvas.left,
      pixelLocation.y + canvas.top,
    );
  }
}

export default Figure;