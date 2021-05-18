// @flow
import WebGLInstance from './webgl/webgl';
// import getShaders from './webgl/shaders';

import {
  Rect, Point, Transform, getRect,
  spaceToSpaceTransform, minAngleDiff,
  getPoint,
} from '../tools/g2';
import type { TypeParsableRect, TypeParsablePoint } from '../tools/g2';
// import * as math from '../tools/math';
import { round } from '../tools/math';
import { FunctionMap } from '../tools/FunctionMap';
import { setState, getState } from './Recorder/state';
import parseState from './Recorder/parseState';
import {
  isTouchDevice, joinObjects, NotificationManager, Console, PerformanceTimer,
} from '../tools/tools';
import {
  FigureElementCollection, FigureElement,
} from './Element';
import type {
  OBJ_AddElement, TypeElementPath,
} from './Element';
import TimeKeeper from './TimeKeeper';
import { Recorder } from './Recorder/Recorder';
// eslint-disable-next-line import/no-cycle
import Gesture from './Gesture';
import DrawContext2D from './DrawContext2D';
import FigurePrimitives from './FigurePrimitives/FigurePrimitives';
import type { OBJ_Polyline, OBJ_TextLinesDefinition, OBJ_TextLines } from './FigurePrimitives/FigurePrimitives';
import FigureCollections from './FigureCollections/FigureCollections';
import AnimationManager from './Animation/AnimationManager';
import type { OBJ_ScenarioVelocity } from './Animation/AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
import type { TypeColor, OBJ_Font } from '../tools/types';
import type { COL_SlideNavigator } from './FigureCollections/SlideNavigator';

const FIGURE1DEBUG = false;


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
  animateNextFrame: (?boolean, ?string) => void,
  animationFinished: () => void,
  recorder: Recorder,
  timeKeeper: TimeKeeper,
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
  * @property {TypeColor} [backgroundColor] background color for the figure.
  * Use [r, g, b, 1] for opaque and [0, 0, 0, 0] for transparent.
 */
export type OBJ_Figure = {
  htmlId?: string,
  limits?: TypeParsableRect,
  color?: TypeColor,
  font?: OBJ_Font,
  lineWidth?: number,
  length?: number,
  backgroundColor?: number,
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
 * Primary Figure class.
 *
 * A figure will attach a WebGL canvas and Context2D
 * canvas to the html `div` element with id `"figureOneContainer"`.
 *
 * The figure manages all drawing elements, renders the drawing elements
 * on a browser's animation frames and listens for guestures from the user.
 *
 * The figure also has a recorder, allowing it to record and playback states,
 * and gestures.
 *
 * To attach to a different `div`, use the `htmlId` property in the class
 * constructor.
 *
 * If a figure is paused, then all drawing element animations will
 * also be paused.
 *
 * `Figure` has a number of convenience methods for creating drawing elements
 * and useful transforms for converting between the different spaces (e.g.
 * pixel, GL, figure).
 *
 * Notifications - The notification manager property `notifications` will
 * publish the following events:
 * - `beforeDraw`: published before a frame is drawn
 * - `afterDraw`: published after a frame is drawn
 * - `resize`: published after a resize event, but before frame drawing
 *
 * @class
 * @param {OBJ_Figure} options
 * @property {FigurePrimitives} primitives create figure primitives such
 * as shapes, lines and grids
 * @property {FigureCollections} collections create figure collections such
 * as advanced lines, shapes, equations and plots
 * @property {NotificationManager} notifications notification manager for
 * element
 *
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
 *     <script type="text/javascript" src='https://cdn.jsdelivr.net/npm figureone@0.8.1/figureone.min.js'></script>
 *     <script type="text/javascript" src='./index.js'></script>
 * </body>
 * </html>
 *
 * // index.js
 * const figure = new Fig.Figure({ limits: [-1, -1, 2, 2 ]});
 * figure.add(
 *   {
 *     name: 'p',
 *     make: 'polygon',
 *     radius: 0.5,
 *     sides: 6,
 *   },
 * );
 *
 * @example
 * // Alternately, an element can be added programatically
 * // index.js
 * const figure = new Fig.Figure({ limits: [-1, -1, 2, 2 ]});
 * const hex = figure.shapes.polygon({
 *   radius: 0.5,
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
  timeKeeper: TimeKeeper;
  recorder: Recorder;
  gesture: Gesture;
  // inTransition: boolean;
  beingMovedElements: Array<FigureElement>;

  beingTouchedElements: Array<FigureElement>;

  touchTopElementOnly: boolean;
  previousCursorPoint: Point;

  limits: Rect;
  stateTime: DOMHighResTimeStamp;

  // gestureElement: HTMLElement;
  shapes: FigurePrimitives;
  shapesLow: Object;

  primitives: FigurePrimitives;
  // shapesHigh: Object;
  // equation: Object;
  // equationLow: Object;
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
  defaultDimColor: Array<number>;
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
  slideNavigatorElementName: string;
  isTouchDown: boolean;
  setStateCallback: ?(string | (() => void));
  notifications: NotificationManager;
  mockPreviousTouchPoint: Point;
  shortcuts: Object;
  nextDrawTimer: number | null;
  nextDrawTimerStart: number;
  nextDrawTimerDuration: number;
  focused: boolean;
  frameRate: {
    information: null | Array<string | OBJ_TextLinesDefinition>,
    history: Array<Array<number>>,
    num: number,
  };
  // frameRateInformation: string;
  // frameRateHistory: Array<number>;
  // frameRate

  animations: AnimationManager;

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
      dimColor: [0.5, 0.5, 0.5, 1],
      font: {
        family: 'Helvetica',
        size: 0.2,
        style: 'normal',
        weight: '100',
        opacity: 1,
      },
      backgroundColor: [1, 1, 1, 1],
    };
    this.frameRate = {
      information: null,
      num: 1,
      history: [],
    };
    this.fnMap = new FunctionMap();
    this.isPaused = false;
    this.scrolled = false;
    this.cursorElementName = '_cursor_';
    this.slideNavigatorElementName = '_nav_';
    this.setStateCallback = null;
    this.shortcuts = {};
    this.mockPreviousTouchPoint = new Point(0, 0);
    this.nextDrawTimer = null;
    this.nextDrawTimerStart = 0;
    this.nextDrawTimerDuration = 0;
    // this.oldScrollY = 0;
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const {
      htmlId, limits,
    } = optionsToUse;
    this.defaultColor = optionsToUse.color;
    // this.defaultLineWidth = optionsToUse.lineWidth;
    if (optionsToUse.font.color == null) {
      optionsToUse.font.color = this.defaultColor.slice();
    }
    this.defaultDimColor = optionsToUse.dimColor;
    this.defaultFont = optionsToUse.font;
    this.htmlId = htmlId;
    this.animationFinishedCallback = null;
    if (FIGURE1DEBUG) {
      window.figureOneDebug = {
        cumTimes: [],
        draw: [],
        setupDraw: [],
        misc: [],
        history: [],
        animationManager: [],
      };
    }
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

        this.backgroundColor = optionsToUse.backgroundColor;
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
    this.updateLimits(limits);
    this.setDefaultLineWidth(options.lineWidth || null);
    this.setDefaultLength(options.length || null);
    this.drawQueued = false;
    this.lastDrawTime = 0;
    // this.inTransition = false;
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    this.touchTopElementOnly = true;
    this.timeKeeper = new TimeKeeper();
    this.notifications = new NotificationManager(this.fnMap);
    this.recorder = new Recorder(this.timeKeeper);
    this.recorder.figure = this;
    this.bindRecorder();
    this.pauseTime = this.timeKeeper.now() / 1000;
    this.shapesLow = this.getShapes();
    // this.shapesHigh = this.getShapes(true);
    this.shapes = this.shapesLow;
    this.primitives = this.shapes;
    // this.equationLow = this.getEquations();
    // this.equationHigh = this.getEquations(true);
    // this.equation = this.equationLow;
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
    this.stateTime = this.timeKeeper.now() / 1000;

    // this.updateFontSize = optionsToUse.updateFontSize;

    this.focused = true;
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('focus', this.focusGained.bind(this));
    window.addEventListener('blur', this.focusLost.bind(this));
    // window.addEventListener('resize', this.resize.bind(this));
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
  }

  /**
   * Add a {@link CollectionsSlideNavigator} that controls the root collection of this figure.
   *
   * @return {CollectionsSlideNavigator}
   */
  addSlideNavigator(options: COL_SlideNavigator) {
    const nav = this.add(joinObjects(
      {},
      {
        name: '_nav_',
        make: 'collections.slideNavigator',
      },
      { options },
    ));
    this.slideNavigatorElementName = '_nav_';
    return nav;
  }

  /**
   * Get the {@link CollectionsSlideNavigator} for the figure (will only return
   * if the navigator was added with `figure.addSlideNavigator`).
   *
   * @return {CollectionsSlideNavigator}
   */
  getSlideNavigator() {
    return this.getElement(this.slideNavigatorElementName);
  }

  /**
   * Add cursor for recording interactive videos. Cursor will be hidden when
   * first added.
   * @return {FigureElement} cursor element
   */
  addCursor(options: Object) {
    const cursor = this.add(joinObjects(
      {},
      {
        name: '_cursor_',
        make: 'collections.cursor',
        mods: { isShown: false },
      },
      { options },
    ));
    this.cursorElementName = '_cursor_';
    return cursor;
  }

  /**
   * Get cursor element.
   @return {FigureElement} cursor element
   */
  getCursor() {
    return this.getElement(this.cursorElementName);
  }

  bindRecorder() {
    const onCursor = (payload) => {
      const [action, x, y] = payload;
      if (action === 'show') {
        this.showCursor('up', new Point(x, y));
        if (this.recorder.state === 'recording') {
          this.recorder.recordEvent('cursor', ['show', x, y]);
        }
      } else {
        this.showCursor('hide');
        if (this.recorder.state === 'recording') {
          this.recorder.recordEvent('cursor', ['hide']);
        }
      }
    };
    const onAutoCursor = (payload) => {
      const [action, x, y] = payload;
      if (action === 'show') {
        this.showCursor('up', new Point(x, y));
      } else {
        this.showCursor('hide');
      }
    };
    const onTouch = (payload) => {
      const [action, x, y] = payload;
      if (action === 'down') {
        this.touchDown(new Point(x, y), true);
      } else {
        this.touchUp();
      }
    };
    const onAutoTouch = (payload) => {
      const [action, x, y] = payload;
      if (action === 'down') {
        this.touchDown(new Point(x, y), true, true);
      } else {
        this.touchUp(true);
      }
    };
    const onCursorMove = (payload) => {
      const [x, y] = payload;
      this.setCursor(new Point(x, y));
      this.touchMove(new Point(x, y));
    };
    const onAutoCursorMove = (payload) => {
      const [x, y] = payload;
      this.setCursor(new Point(x, y));
      this.touchMove(new Point(x, y), true);
    };

    const exec = (payload) => {
      const [functionName, args] = payload;
      this.fnMap.exec(functionName, args);
      if (this.recorder.state === 'recording') {
        this.recorder.recordEvent('exec', payload);
      }
    };

    const autoExec = (payload) => {
      const [functionName, args] = payload;
      this.fnMap.exec(functionName, args);
    };

    this.recorder.addEventType('cursor', onCursor);
    this.recorder.addEventType('_autoCursor', onAutoCursor);
    this.recorder.addEventType('cursorMove', onCursorMove);
    this.recorder.addEventType('_autoCursorMove', onAutoCursorMove);
    this.recorder.addEventType('touch', onTouch);
    this.recorder.addEventType('_autoTouch', onAutoTouch);
    this.recorder.addEventType('exec', exec);
    this.recorder.addEventType('_autoExec', autoExec);
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
    this.stateTime = this.timeKeeper.now() / 1000;
    const o = joinObjects({}, options, { returnF1Type: false });
    const state = getState(this, [
      'lastDrawTime',
      'elements',
      'stateTime',
      'mockPreviousTouchPoint',
      'isTouchDown',
    ], o);
    state.beingTouchedElements = [];
    state.beingMovedElements = [];

    this.beingTouchedElements.forEach((e) => {
      state.beingTouchedElements.push({
        f1Type: 'de',
        state: e.getPath(),
      });
    });
    this.beingMovedElements.forEach((e) => {
      state.beingMovedElements.push({
        f1Type: 'de',
        state: e.getPath(),
      });
    });
    return state;
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
      zeroDurationThreshold?: boolean,
      allDurationsSame?: boolean,
    } | 'dissolve' | 'animate' | 'instant' = 'instant',
  ) {
    // $FlowFixMe
    const state = parseState(stateIn, this);
    let finishedFlag = false;
    this.state.preparingToSetState = false;
    const finished = () => {
      finishedFlag = true;
      this.state.preparingToSetState = false;
      setState(this, state);
      this.beingMovedElements = this.beingMovedElements.filter(e => Object.keys(e).length > 0);
      this.beingTouchedElements = this.beingTouchedElements.filter(e => Object.keys(e).length > 0);
      this.notifications.publish('stateSetInit');
      this.elements.setTimeDelta(this.timeKeeper.now() / 1000 - this.stateTime);
      this.elements.updateDrawTransforms([this.spaceTransforms.figureToGL]);
      this.elements.stateSet();
      this.elements.setPointsFromDefinition();
      this.elements.setPrimitiveColors();
      if (this.setStateCallback != null) {
        this.fnMap.exec(this.setStateCallback);
      }
      this.animateNextFrame();
      this.notifications.publish('stateSet');
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
      this.notifications.publish('preparingToSetState');
    }
    this.animateNextFrame();
  }

  animateToState(
    state: Object,
    optionsIn: Object = {},
    done: ?(string | (() => void)),
    startTime: ?number | 'now' | 'prevFrame' | 'nextFrame' = null,
  ) {
    const duration = this.elements.animateToState(
      state.elements, optionsIn, true, startTime,
    );

    if (done != null) {
      if (duration === 0) {
        this.fnMap.exec(done);
      } else if (done != null) {
        this.notifications.add('animationsFinished', done, 1);
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
        },
        duration: 0,
      })
      .start(options.startTime);
  }


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
        this.notifications.add('animationsFinished', done, 1);
      }
    }
  }


  /* eslint-disable max-len */
  /**
   * Add a figure element to the root collection of the figure.
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
   * const element = figure.primitives.polygon({ radius: 1 });
   * figure.add('name', element);
   *
   * @example
   * // Element only (name will be autogenerated)
   * const element = figure.primitives.polygon({ radius: 1 });
   * figure.add(element);
   *
   * @example
   * // Element definition (if no name is provided, then name will
   * // be auto generated)
   * figure.add({
   *   make: 'polygon',
   *   radius: 1,
   * });
   *
   * @example
   * // Array of elements
   * const element = figure.primitives.polygon({ radius: 1 });
   * figure.add([
   *   element,
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
    return this.elements.add(nameOrElementOrElementDefinition, elementToAdd);
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
   * is `null`, then the figure's base collection is returned. If `elementPath`
   * is invalid then `null` is returned.
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
  getElement(elementName: string) {
    if (elementName === this.elements.name) {
      return this.elements;
    }
    return this.elements.getElement(elementName);
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
    return this.elements.getElements(children);
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
      this.htmlCanvas,
      this.limits,
      this.spaceTransforms,
      this.animateNextFrame.bind(this, true, 'getShapes'),
      this.defaultColor,
      this.defaultDimColor,
      this.defaultFont,
      this.defaultLineWidth,
      this.defaultLength,
      this.timeKeeper,
      this.recorder,
    );
  }


  getObjects() {
    const shapes = this.shapesLow;
    // const equation = this.equationLow;
    // if (high) {
    //   shapes = this.shapesHigh;
    //   equation = this.equationHigh;
    // }
    return new FigureCollections(
      shapes,
      // equation,
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


  // deprecate
  // eslint-disable-next-line class-methods-use-this
  initialize() {
  }

  initElements() {
    this.elements.setFigure({
      limits: this.limits,
      spaceTransforms: this.spaceTransforms,
      animateNextFrame: this.animateNextFrame.bind(this),
      animationFinished: this.animationFinished.bind(this),
      recorder: this.recorder,
      timeKeeper: this.timeKeeper,
    });
    this.setFirstTransform();
    this.animateNextFrame();
  }

  setElements(collection: FigureElementCollection) {
    this.elements = collection;
    this.animations = this.elements.animations;
    this.initElements();
  }

  /**
   * Get remaining animation durations of running animations
   */
  getRemainingAnimationTime(nowIn: number = this.timeKeeper.now() / 1000) {
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
    this.notifications.publish('animationsFinished');
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
    if (skipHTMLTie) {
      this.elements.resize();
    } else {
      this.elements.resize(this.canvasLow);
    }
    if (this.oldWidth !== this.canvasLow.clientWidth) {
      this.renderAllElementsToTiedCanvases();
      this.oldWidth = this.canvasLow.clientWidth;
    }
    this.notifications.publish('resize');
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

  /**
   * Show specific elements within the figure
   */
  show(
    toShow: TypeElementPath = [],
  ): void {
    this.elements.show(toShow);
  }

  /**
   * Hide specific elements within the figure
   */
  hide(
    toShow: TypeElementPath = [],
  ): void {
    this.elements.hide(toShow);
  }

  /**
   * Show specific elements within a figure, while hiding all others
   */
  showOnly(
    toShow: TypeElementPath = [],
  ): void {
    this.elements.showOnly(toShow);
  }

  /**
   * Set scenarios of all elements with scenarioName defined
   */
  setScenarios(scenarioName: string, onlyIfVisible: boolean = false) {
    this.elements.setScenarios(scenarioName, onlyIfVisible);
  }

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
    const cursor = this.getCursor();
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

  touchDownHandlerClient(clientPoint: Point, eventFromPlayback: boolean = false) {
    const pixelP = this.clientToPixel(clientPoint);
    const figurePoint = pixelP.transformBy(this.spaceTransforms.pixelToFigure.matrix());
    return this.touchDownHandler(figurePoint, eventFromPlayback);
  }

  // Handle touch down, or mouse click events within the canvas.
  // The default behavior is to be able to move objects that are touched
  // and dragged, then when they are released, for them to move freely before
  // coming to a stop.
  touchDownHandler(
    figurePoint: Point,
    eventFromPlayback: boolean = false,
    autoEvent: boolean = false,
  ) {
    if (this.recorder.state === 'recording') {
      if (!autoEvent) {
        this.recorder.recordEvent('touch', ['down', figurePoint.x, figurePoint.y]);
      }
      if (this.cursorShown) {
        this.showCursor('down');
      }
    }

    // this.currentCursorPoint = figurePoint._dup();
    this.previousCursorPoint = figurePoint._dup();

    if (this.isPaused) {
      this.unpause();
    }
    if (this.recorder.state === 'idle') {
      this.recorder.lastSeekTime = null;
    }
    if (this.recorder.state === 'playing' && !eventFromPlayback) {
      this.recorder.pausePlayback();
      this.showCursor('hide');
    }
    this.isTouchDown = true;

    // Get the touched point in clip space
    const glPoint = figurePoint.transformBy(this.spaceTransforms.figureToGL.matrix());

    // Get all the figure elements that were touched at this point (element
    // must have isTouchable = true to be considered)
    // debugger;
    this.beingTouchedElements = this.elements.getTouched(glPoint);

    if (this.touchTopElementOnly && this.beingTouchedElements.length > 1) {
      this.beingTouchedElements = [this.beingTouchedElements[0]];
    }

    this.beingTouchedElements.forEach(e => e.click(glPoint));

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


  // Handle touch up, or mouse click up events in the canvas. When an UP even
  // happens, the default behavior is to let any elements being moved to move
  // freely until they decelerate to 0.
  touchUpHandler(autoEvent: boolean = false) {
    if (this.recorder.state === 'recording' && !autoEvent) {
      this.recorder.recordEvent('touch', ['up']);
      if (this.cursorShown) {
        this.showCursor('up');
      }
    }
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
  }


  setCursor(p: Point, animateNextFrame: boolean = true) {
    const cursor = this.getElement(this.cursorElementName);
    if (cursor == null) {
      return;
    }
    cursor.setPosition(p);
    if (animateNextFrame) {
      this.animateNextFrame();
    }
  }

  touchFreeHandler(clientPoint: Point) {
    if (this.recorder.state === 'recording') {
      const pixelP = this.clientToPixel(clientPoint);
      const figurePoint = pixelP.transformBy(this.spaceTransforms.pixelToFigure.matrix());
      this.previousCursorPoint = figurePoint;
      if (this.cursorShown) {
        this.recorder.recordEvent('cursorMove', [figurePoint.x, figurePoint.y]);
        this.setCursor(figurePoint);
      } else {
        this.setCursor(figurePoint, false);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  rotateElement(
    element: FigureElement,
    previousFigurePoint: Point,
    currentFigurePoint: Point,
  ) {
    let center = element.getPosition('figure');
    if (center == null) {
      center = new Point(0, 0);
    }
    const currentAngle = Math.atan2(
      currentFigurePoint.y - center.y,
      currentFigurePoint.x - center.x,
    );
    const previousAngle = Math.atan2(
      previousFigurePoint.y - center.y,
      previousFigurePoint.x - center.x,
    );
    const diffAngle = minAngleDiff(currentAngle, previousAngle);
    const transform = element.transform._dup();
    let rot = transform.r();
    if (rot == null) {
      rot = 0;
    }
    const newAngle = rot + diffAngle;
    transform.updateRotation(newAngle);
    element.moved(transform._dup());
  }

  // eslint-disable-next-line class-methods-use-this
  translateElement(
    element: FigureElement,
    previousFigurePoint: Point,
    currentFigurePoint: Point,
  ) {
    const m = element.spaceTransformMatrix('figure', 'local');

    const currentVertexSpacePoint = currentFigurePoint.transformBy(m);
    const previousVertexSpacePoint = previousFigurePoint.transformBy(m);
    const elementSpaceDelta = currentVertexSpacePoint.sub(previousVertexSpacePoint);
    const currentTransform = element.transform._dup();
    const currentTranslation = currentTransform.t();
    if (currentTranslation != null) {
      const newTranslation = currentTranslation.add(elementSpaceDelta);
      currentTransform.updateTranslation(newTranslation);
      element.moved(currentTransform);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  scaleElement(
    element: FigureElement,
    previousFigurePoint: Point,
    currentFigurePoint: Point,
    type: 'x' | 'y' | '' = '',
  ) {
    const center = element.getPosition('figure');
    const previousMag = previousFigurePoint.sub(center).distance();
    const currentMag = currentFigurePoint.sub(center).distance();


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


  touchMoveHandlerClient(previousClientPoint: Point, currentClientPoint: Point) {
    const currentPixelPoint = this.clientToPixel(currentClientPoint);
    const currentFigurePoint = currentPixelPoint
      .transformBy(this.spaceTransforms.pixelToFigure.matrix());
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const previousFigurePoint = previousPixelPoint
      .transformBy(this.spaceTransforms.pixelToFigure.matrix());
    return this.touchMoveHandler(previousFigurePoint, currentFigurePoint);
  }


  // Handle touch/mouse move events in the canvas. These events will only be
  // sent if the initial touch down happened in the canvas.
  // The default behavior is to drag (move) any objects that were touched in
  // the down event to the new location.
  // This function should return true if the move event should NOT be processed
  // by the system. For example, on a touch device, a touch and drag would
  // normally scroll the screen. Typically, you would want to move the figure
  // element and not the screen, so a true would be returned.
  touchMoveHandler(
    previousFigurePoint: Point,
    currentFigurePoint: Point,
    fromAutoEvent: boolean = false,
  ): boolean {
    if (this.recorder.state === 'recording' && !fromAutoEvent) {
      this.recorder.recordEvent('cursorMove', [currentFigurePoint.x, currentFigurePoint.y]);
      if (this.cursorShown) {
        this.setCursor(currentFigurePoint);
      }
    }

    this.previousCursorPoint.x = currentFigurePoint.x;
    this.previousCursorPoint.y = currentFigurePoint.y;

    if (this.beingMovedElements.length === 0) {
      return false;
    }
    const previousGLPoint = previousFigurePoint
      .transformBy(this.spaceTransforms.figureToGL.matrix());
    // Go through each element being moved, get the current translation
    for (let i = 0; i < this.beingMovedElements.length; i += 1) {
      const element = this.beingMovedElements[i];
      if (element !== this.elements) {
        if (element.isBeingTouched(previousGLPoint)
              || element.move.canBeMovedAfterLosingTouch) {
          let elementToMove;
          if (element.move.element == null) {
            elementToMove = element;
          } else if (typeof element.move.element === 'string') {
            elementToMove = this.getElement(element.move.element);
          } else {
            elementToMove = element.move.element;
          }
          // $FlowFixMe
          if (elementToMove.state.isBeingMoved === false) {
            // $FlowFixMe
            elementToMove.startBeingMoved();
          }
          if (this.beingMovedElements.indexOf(elementToMove) === -1) {
            // $FlowFixMe
            this.beingMovedElements.push(elementToMove);
          }
          if (element.move.type === 'rotation') {
            this.rotateElement( // $FlowFixMe
              elementToMove,
              previousFigurePoint,
              currentFigurePoint,
            );
          } else if (element.move.type === 'scale') {
            this.scaleElement( // $FlowFixMe
              elementToMove,
              previousFigurePoint,
              currentFigurePoint,
            );
          } else if (element.move.type === 'scaleX') {
            this.scaleElement( // $FlowFixMe
              elementToMove,
              previousFigurePoint,
              currentFigurePoint,
              'x',
            );
          } else if (element.move.type === 'scaleY') {
            this.scaleElement( // $FlowFixMe
              elementToMove,
              previousFigurePoint,
              currentFigurePoint,
              'y',
            );
          } else {
            this.translateElement( // $FlowFixMe
              elementToMove,
              previousFigurePoint,
              currentFigurePoint,
            );
          }
        }
      }
      if (this.touchTopElementOnly) {
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
      this.notifications.publish('stopped');
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
          element.notifications.add('stopped', checkAllStopped, 1);
        }
      });
      if (preparingToStopCounter === 0) {
        checkAllStopped();
      } else if (preparingToStopCounter > 0) {
        this.notifications.publish('preparingToStop');
        this.state.preparingToStop = true;
      }
      return;
    }
    // Otherwise we are dissolving to complete
    const state = this.getState({});
    this.elements.stop('complete');
    const completeState = this.getState({});
    this.setState(state);
    this.elements.stop('freeze');
    this.setState(completeState, 'dissolve');
    if (this.state.preparingToSetState) {
      this.notifications.add('stateSet', stopped, 1);
      this.notifications.publish('preparingToStop');
      this.state.preparingToStop = true;
    } else {
      stopped();
    }
  }

  // To add elements to a figure, either this method can be overridden,
  // or the `add` method can be used.
  createFigureElements() {
    this.elements = this.collections.collection({ name: 'rootCollection' });
    this.animations = this.elements.animations;
    this.initElements();
  }


  setElementsToCollection(collection: FigureElementCollection) {
    this.elements = collection;
    this.animations = this.elements.animations;
    this.initElements();
  }

  clearContext(canvasIndex: number = 0) {
    if (canvasIndex === 0) {
      this.webglLow.gl.clearColor(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3],
      );
      this.webglLow.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    } else {
      this.webglOffscreen.gl.clearColor(0, 0, 0, 0);
      this.webglOffscreen.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    }
    this.elements.clear(canvasIndex);
  }


  drawNow(time: number = -1) {
    this.drawQueued = true;
    this.draw(time);
  }


  pause() {
    if (this.state.pause === 'pause' || this.state.pause === 'preparingToPause' || this.state.pause === 'preparingToUnpause') {
      return;
    }
    this.state.pause = 'paused';
    this.pauseTime = this.timeKeeper.now() / 1000;
    this.clearDrawTimeout();
  }


  unpause() {
    if (this.state.pause === 'unpaused' || this.state.pause === 'preparingToPause' || this.state.pause === 'preparingToUnpause') {
      return;
    }
    this.state.pause = 'unpaused';
    this.isPaused = false;
    this.elements.setTimeDelta(this.timeKeeper.now() / 1000 - this.pauseTime);
    this.animateNextFrame();
    this.notifications.publish('unpaused');
  }

  touchDown(
    figurePosition: TypeParsablePoint,
    eventFromPlayback: boolean = false,
    autoEvent: boolean = false,
  ) {
    const p = getPoint(figurePosition);
    this.touchDownHandler(p, eventFromPlayback, autoEvent);
    this.mockPreviousTouchPoint = p;
    // $FlowFixMe
    if (this.elements.elements[this.cursorElementName] != null) {
      this.showCursor('down', p);
    }
  }

  touchUp(autoEvent: boolean = false) {
    this.touchUpHandler(autoEvent);
    // $FlowFixMe
    if (this.elements.elements[this.cursorElementName] != null) {
      this.showCursor('up');
      // cursor.setPosition(p);
    }
  }

  touchMove(figurePosition: TypeParsablePoint, autoEvent: boolean = false) {
    const p = getPoint(figurePosition);
    this.touchMoveHandler(this.mockPreviousTouchPoint, p, autoEvent);
    this.mockPreviousTouchPoint = p;
  }

  clearDrawTimeout() {
    this.timeKeeper.clearTimeout(this.nextDrawTimer);
    this.nextDrawTimer = null;
  }

  draw(nowIn: number, canvasIndex: number = 0): void {
    let timer;
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) {
      timer = new PerformanceTimer();
      window.figureOneDebug.draw = [];
      window.figureOneDebug.setupDraw = [];
      window.figureOneDebug.misc = [];
    }
    this.clearDrawTimeout();
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
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('m1'); }
    this.clearContext(canvasIndex);
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('clearContext'); }
    this.notifications.publish('beforeDraw');
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('beforeDraw'); }
    // $FlowFixMe
    if (this.elements.__frameRate_ != null && this.frameRate.information != null) {
      // $FlowFixMe
      this.elements.__frameRate_.custom.updateText({ text: this.frameRate.information });
    }
    this.elements.setupDraw(
      now,
      canvasIndex,
    );
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('setupDraw'); }

    this.elements.draw(now, [this.spaceTransforms.figureToGL], 1, canvasIndex);
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('draw'); }

    if (this.elements.isAnyElementMoving()) {
      this.animateNextFrame(true, 'is moving');
    }

    if (this.drawAnimationFrames > 0) {
      this.drawAnimationFrames -= 1;
      this.animateNextFrame(true, 'queued frames');
    }
    this.notifications.publish('afterDraw'); // $FlowFixMe
    if (FIGURE1DEBUG || this.elements.__frameRate_ != null) { // $FlowFixMe
      timer.stamp('afterDraw'); // $FlowFixMe
      const deltas = timer.deltas();
      if (FIGURE1DEBUG) {
        if (window.figureOneDebug.cumTimes.length > 50) {
          Console(
            '>>>>>>>>>>> Total',
            round(
              window.figureOneDebug.cumTimes.reduce((sum, time) => sum + time) / 50,
              2,
            ),
            { frameTotal: deltas[0] },
            { frame: deltas.slice(1) },
            { setupDraw: window.figureOneDebug.setupDraw },
            { draw: window.figureOneDebug.draw },
            { misc: window.figureOneDebug.misc },
          );
          window.figureOneDebug.cumTimes = [];
        } else {
          window.figureOneDebug.cumTimes.push(deltas[0]);
        }
        // }
        window.figureOneDebug.history.push({
          now: this.timeKeeper.now(),
          frameTotal: deltas[0],
          frame: deltas.slice(1),
          setupDraw: window.figureOneDebug.setupDraw,
          draw: window.figureOneDebug.draw,
          misc: window.figureOneDebug.misc,
          animationManager: window.figureOneDebug.animationManager,
        });
      }
      // $FlowFixMe
      if (this.elements.__frameRate_ != null) {
        const timeBetweenFrames =
          (this.timeKeeper.now() - (this.timeKeeper.lastDrawTime || 0)) / 1000;
        // const frameRate = 1 / timeBetweenFrames;
        const totalDrawTime = deltas[0];  // $FlowFixMe
        const setupDrawTime = deltas[4][1]; // $FlowFixMe
        const drawTime = deltas[5][1];
        this.frameRate.history.push([timeBetweenFrames, totalDrawTime, setupDrawTime, drawTime]);
        if (this.frameRate.history.length === this.frameRate.num) {
          const averages = this.frameRate.history.reduce(
            (a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2], a[3] + c[3]],
            [0, 0, 0, 0],
          );
          const maximums = this.frameRate.history.reduce(
            (a, c) => [
              c[0] > a[0] ? c[0] : a[0],
              c[1] > a[1] ? c[1] : a[1],
              c[2] > a[2] ? c[2] : a[2],
              c[3] > a[3] ? c[3] : a[3],
            ],
            [0, 0, 0, 0],
          );
          const { num } = this.frameRate;
          const ave = [
            round(1 / (averages[0] / num), 0).toFixed(0).padStart(3),
            round(averages[1] / num, 1).toFixed(1).padStart(5),
            round(averages[2] / num, 1).toFixed(1).padStart(5),
            round(averages[3] / num, 1).toFixed(1).padStart(5),
          ];
          const max = [
            round(1 / (maximums[0]), 0).toFixed(0).padStart(3),
            round(maximums[1], 1).toFixed(1).padStart(5),
            round(maximums[2], 1).toFixed(1).padStart(5),
            round(maximums[3], 1).toFixed(1).padStart(5),
          ];
          this.frameRate.information = [
            `Ave:  ${ave[0]} fps, ${ave[1]} ms, (${ave[2]}, ${ave[3]})`,
            `Max: ${max[0]} fps, ${max[1]} ms, (${max[2]}, ${max[3]})`,
          ];
          this.frameRate.history = [];
        }
      }
    }
    this.setDrawTimeout();
  }


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

  // TimerDuration is in seconds
  setDrawTimeout(
    timerDurationIn: number = -1,
  ) {
    let timerDuration = timerDurationIn;
    if (timerDuration < 0) {
      timerDuration = this.elements.getNextAnimationFinishTime();
    }
    if (timerDuration != null && timerDuration > 0.00000001) {
      const timerStart = this.timeKeeper.now() / 1000;
      if (
        (this.nextDrawTimer == null && timerDuration > 0)
        || (
          this.nextDrawTimer != null
          && this.nextDrawTimerStart > 0
          && this.nextDrawTimerDuration > 0
          && this.nextDrawTimerStart
            + this.nextDrawTimerDuration > timerStart + timerDuration + 0.001
        )
        || (this.nextDrawTimerStart + this.nextDrawTimerDuration <= timerStart)
      ) {
        this.clearDrawTimeout();
        this.nextDrawTimerStart = timerStart;
        this.nextDrawTimerDuration = timerDuration;
        this.nextDrawTimer = this.timeKeeper.setTimeout(() => {
          this.nextDrawTimer = null;
          this.setupDraw();
          this.animateNextFrame();
        }, timerDuration * 1000, 'drawTimeout');
      }
    }
  }

  focusLost() {
    this.focused = false;
    this.setDrawTimeout(0.1);
  }

  focusGained() {
    this.focused = true;
  }

  setupDraw(time: number = this.timeKeeper.now() / 1000) {
    this.elements.setupDraw(time);
    if (!this.focused) {
      this.setDrawTimeout(0.1);
    } else {
      this.setDrawTimeout();
    }
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
      this.timeKeeper.queueNextFrame(this.draw.bind(this));
    }
  }


  isAnimating(): boolean {
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

  debugShowTouchBorders(
    elements: TypeElementPath, // $FlowFixMe
    lineOptions: OBJ_Polyline = {},
    startIndex: number = 0,
  ) {
    this.setFirstTransform();
    const elems = this.elements.getElements(elements);
    elems.forEach((element, index) => {
      const touchBorder = element.getBorder('figure', 'touchBorder');
      const polyline = this.primitives.polyline(joinObjects({}, lineOptions, {
        points: touchBorder[0],
        close: true,
      }));
      this.add(`__touchBorder_${index + startIndex}`, polyline);
    });
  }

  /**
   * Sets manual frames.
   *
   * Normally, when a browser is ready to refresh the screen it will call
   * FigureOne to do a draw. The time between frames is not fixed and depends on
   * a number of factors. This is the most performant way to handle drawing.
   *
   * However, when debugging it can be useful to manually trigger a draw frame
   * with a defined delta time from the last frame.
   *
   * This method turns on manual frames. Use `frame` to trigger a draw.
   */
  setManualFrames() {
    this.timeKeeper.setManualFrames();
  }

  /**
   * End manual frames. Reverts drawing to when browser reqeusts it.
   */
  endManualFrames() {
    this.timeKeeper.endManualFrames();
  }

  /**
   * Manually trigger a draw frame with a specified time step (in seconds) from
   * the last draw frame. Can only be used when `setManualFrames()` has been
   * called.
   *
   * @param {number} timeStep in seconds
   */
  frame(timeStep: number) {
    this.timeKeeper.frame(timeStep);
  }

  /**
   * Add a frame rate annotation to the figure.
   *
   * Each time the browser requests FigureOne to paint the screen, FigureOne
   * performs two main tasks:
   * - setup the figure for a draw (setupDraw) - all visible figure elements
   *   are iterated through and if they are animating or moving then their next
   *   animation or movement frame is calculated
   * - draw the figure elements (draw)
   *
   * Frame rate is determined by FigureOne's total frame processing time
   * (setupDraw time + draw time), and how frequently a browser requests
   * FigureOne to draw a frame.
   *
   * The frame rate will not be faster than the browser wants, but it can be
   * slower if the total frame processing time is too long.
   *
   * The frame rate and time durations are reported as both an average, and
   * worst case (max). The averaging is done over `numFrames` number of frames.
   *
   * The screen output is then:
   * - Ave: F fsp, T ms (S, D)
   * - Max: F fsp, T ms (S, D)
   *
   * Where:
   * - F: Frames per second
   * - T: Total frame processing time
   * - S: setupDraw processing time
   * - D: draw processing time
   *
   * Note: FigureOne only requests animation frame notifications from the
   * browser when an element is animating or moving. If everything is still,
   * then the frame rate will be 0.
   */
  addFrameRate(numFrames: number = 10, options: OBJ_TextLines = {}) {
    this.frameRate.num = numFrames;
    const frame = this.add(joinObjects(
      {},
      {
        name: '_frameRate_',
        make: 'primitives.textLines',
        // mods: { isShown: true },
        text: ['Ave:', 'Max:'],
        position: [
          this.limits.left,
          this.limits.bottom,
        ],
        xAlign: 'left',
        yAlign: 'bottom',
        font: { size: this.limits.width / 30 },
      },
      options,
    ));
    window.figureOneDebug = {
      cumTimes: [],
      draw: [],
      setupDraw: [],
      misc: [],
      history: [],
      animationManager: [],
    };
    return frame;
  }
}

export default Figure;
