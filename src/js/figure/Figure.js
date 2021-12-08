// @flow
import WebGLInstance from './webgl/webgl';

import {
  Point, Transform,
  getPoint,
} from '../tools/g2';
import Scene from '../tools/geometry/scene';
import type { OBJ_Scene } from '../tools/geometry/scene';
// import * as m3 from '../tools/m3';
import type { TypeParsableRect, TypeParsablePoint } from '../tools/g2';
import type { Type3DMatrix } from '../tools/m3';
// import * as math from '../tools/math';
import { round } from '../tools/math';
import { FunctionMap } from '../tools/FunctionMap';
import { setState, getState } from './Recorder/state';
// eslint-disable-next-line import/no-cycle
import parseState from './Recorder/parseState';
import {
  isTouchDevice, joinObjects, NotificationManager, Console, PerformanceTimer,
} from '../tools/tools';
import { CustomAnimationStep } from './Animation/Animation';
// eslint-disable-next-line import/no-cycle
import {
  FigureElementCollection, FigureElement,
} from './Element';
import type {
  OBJ_AddElement, TypeElementPath,
} from './Element';
import TimeKeeper from './TimeKeeper';
// eslint-disable-next-line import/no-cycle
import { Recorder } from './Recorder/Recorder';
// eslint-disable-next-line import/no-cycle
import Gesture from './Gesture';
import type { TypeParsablePlane } from '../tools/geometry/Plane';
import DrawContext2D from './DrawContext2D';
// eslint-disable-next-line import/no-cycle
import FigurePrimitives from './FigurePrimitives/FigurePrimitives';
import type { OBJ_Polyline, OBJ_TextLinesDefinition, OBJ_TextLines } from './FigurePrimitives/FigurePrimitiveTypes2D';
// eslint-disable-next-line import/no-cycle
import FigureCollections from './FigureCollections/FigureCollections';
// eslint-disable-next-line import/no-cycle
import AnimationManager from './Animation/AnimationManager';
import type { OBJ_ScenarioVelocity } from './Animation/AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
import type { TypeColor, OBJ_Font } from '../tools/types';
import type { COL_SlideNavigator } from './FigureCollections/SlideNavigator';
import type FigureElementPrimitiveGesture from './FigurePrimitives/FigureElementPrimitiveGesture';
import FontManager from './FontManager';

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
 */
export type OBJ_SpaceTransforms = {
  glToFigure: Transform;
  figureToGL: Transform;
  pixelToFigure: Transform;
  figureToPixel: Transform;
  pixelToGL: Transform;
  glToPixel: Transform;
  glToPixelMatrix: Type3DMatrix;
  figureToGLMatrix: Type3DMatrix;
  figureToPixelMatrix: Type3DMatrix;
}

export type OBJ_FigureLimits = {
  x: { min: number, max: number },
  y: { min: number, max: number },
  z: { min: number, max: number },
}

export type OBJ_FigureForElement = {
  // spaceTransformMatrix: (string, string) => Type3DMatrix,
  animateNextFrame: (?boolean, ?string) => void,
  animationFinished: () => void,
  recorder: Recorder,
  timeKeeper: TimeKeeper,
  notifications: NotificationManager,
  pixelToGL: (Point) => Point,
  preventDefault: () => void,
}

/**
  * Figure options object
  * @property {string} [htmlId] HTML `div` tag `id` to tie figure to (`"figureOneContainer"`)
  * @property {OBJ_Scene | TypeParsableRect} [scene] define 2D or 3D scene. 3D
  * can be orthographic or perspective projection, and include camera position
  * and lighting definition. A 2D scene can be defined using `left`, `right`,
  * `bottom` and `top`, or the short hand rectangle definition.
  * @property {TypeColor} [color] default shape color (`[0, 0, 0, 1]`)
  * @property {OBJ_Font} [font] default shape font (`{ family: 'Helvetica,
  * size: 0.2, style: 'normal', weight: 'normal' }`)
  * @property {number} [lineWidth] default shape line width
  * @property {number} [length] default shape primary dimension
  * @property {TypeColor} [backgroundColor] background color for the figure.
  * Use [r, g, b, 1] for opaque and [0, 0, 0, 0] for transparent.
 */
export type OBJ_Figure = {
  htmlId?: string,
  scene?: OBJ_Scene | TypeParsableRect,
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
 *     <script type="text/javascript" src='https://cdn.jsdelivr.net/npm figureone@0.13.0/figureone.min.js'></script>
 *     <script type="text/javascript" src='./index.js'></script>
 * </body>
 * </html>
 *
 * // index.js
 * const figure = new Fig.Figure({ scene: [-1, -1, 1, 1 ]});
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
 * const figure = new Fig.Figure({ scene: [-1, -1, 1, 1 ]});
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

  beingMovedElement: null | FigureElement;

  beingTouchedElement: null | FigureElement | FigureElementPrimitiveGesture;


  previousCursorPoint: Point;
  originalScalePoint: Point | null;

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


  isTouchDevice: boolean;
  fnMap: FunctionMap;
  moveBuffer: Array<[Point, Point]>;

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

  pixelSpace: {
    x: { min: number, span: number },
    y: { min: number, span: number },
  };

  defaultPrevented: boolean;

  mousePixelPosition: null | Point;
  lostContextMessage: HTMLElement;
  // zoom: {
  //   last: {
  //     mag: number,
  //     position: Point,
  //     angle: number,
  //     distance: number,
  //   },
  //   current: {
  //     position: Point,
  //     angle: number,
  //     distance: number,
  //   },
  //   max: null | number,
  //   min: null | number,
  //   scale: number,
  //   mag: number,
  //   cumOffset: Point,
  //   cumAngle: number,
  //   pinching: boolean,
  // }

  scene: Scene;
  fonts: FontManager;

  animations: AnimationManager;

  state: {
    pause: 'paused' | 'preparingToPause' | 'preparingToUnpause' | 'unpaused';
    preparingToStop: boolean;
    preparingToSetState: boolean;
  };


  constructor(options: OBJ_Figure = {}) {
    const defaultOptions = {
      htmlId: 'figureOneContainer',
      fontScale: 1,
      color: [0, 0, 0, 1],
      dimColor: [0.5, 0.5, 0.5, 1],
      font: {
        family: 'Helvetica',
        size: 0.2,
        style: 'normal',
        weight: '100',
        opacity: 1,
        glyphs: 'mathlatin',
        render: '2d',
      },
      backgroundColor: [1, 1, 1, 1],
      // scene: {
      //   style: '2D',
      //   left: -1,
      //   right: 1,
      //   bottom: -1,
      //   top: 1,
      // },
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
    this.mousePixelPosition = null;
    this.defaultPrevented = false;

    const optionsToUse = joinObjects({}, defaultOptions, options);
    const {
      htmlId,
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

        this.lostContextMessage = document.createElement('div');
        this.lostContextMessage.classList.add('figureone__lostcontext', 'figureone__canvas');
        container.appendChild(this.lostContextMessage);
        this.lostContextMessage.style.display = 'none';

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
          .figureone__lostcontext {
            display: table;
            background-color: white;
          }
          .figureone__lostcontext_message {
            text-align: center;
            vertical-align: middle;
            display: table-cell;
            border: 1px solid #444;
            color: #444;
            padding: 2em;
          }
        `;
        document.getElementsByTagName('head')[0].appendChild(canvasStyle);

        this.backgroundColor = optionsToUse.backgroundColor;
        const webglLow = new WebGLInstance(
          this.canvasLow,
          this.backgroundColor,
        );
        this.webglLow = webglLow;
        this.canvasLow.addEventListener(
          'webglcontextlost',
          this.contextLost.bind(this),
          false,
        );
        this.canvasLow.addEventListener(
          'webglcontextrestored', this.contextRestored.bind(this), false,
        );
        // TODO in future, if still using canvasOffScreen then need to have it
        // handle context lost and restored events
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
    this.getPixelSpace();

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


    // if (optionsToUse.limits != null) {
    //   const limits = getRect(optionsToUse.limits);
    //   optionsToUse.scene = {
    //     style: '2D',
    //     left: limits.left,
    //     right: limits.right,
    //     top: limits.top,
    //     bottom: limits.bottom,
    //   };
    // }
    if (Array.isArray(optionsToUse.scene)) {
      const [
        left, bottom, right, top,
      ] = optionsToUse.scene;
      optionsToUse.scene = {
        style: '2D',
        left,
        right,
        top,
        bottom,
      };
    }
    if (optionsToUse.scene == null) {
      // const width = this.canvasLow.clientWidth;
      // const height = this.canvasLow.clientHeight;
      // let w;
      // let h;
      // if (width > height) {
      //   w = width / height * 2;
      //   h = 2;
      // } else {
      //   w = 2;
      //   h = height / width * 2;
      // }
      optionsToUse.scene = {
        style: '2D',
        // left: -w / 2,
        // right: w / 2,
        // bottom: -h / 2,
        // top: h / 2,
      };
    }
    if (
      optionsToUse.scene.style === '2D'
      || optionsToUse.scene.style === 'orthographic'
    ) {
      const { // $FlowFixMe
        left, right, top, bottom,
      } = optionsToUse.scene;

      if (left == null && right == null && top == null && bottom == null) {
        const width = this.canvasLow.clientWidth;
        const height = this.canvasLow.clientHeight;
        let w;
        let h;
        if (width > height) {
          w = width / height * 2;
          h = 2;
        } else {
          w = 2;
          h = height / width * 2;
        } // $FlowFixMe
        optionsToUse.scene.left = -w / 2; // $FlowFixMe
        optionsToUse.scene.right = w / 2; // $FlowFixMe
        optionsToUse.scene.bottom = -h / 2; // $FlowFixMe
        optionsToUse.scene.top = h / 2;
      }
    } else {
      const {
        fieldOfView, aspectRatio,
      } = optionsToUse.scene;
      if (fieldOfView == null && aspectRatio == null) {
        const width = this.canvasLow.clientWidth;
        const height = this.canvasLow.clientHeight || 1;
        optionsToUse.scene.fieldOfView = 27 * Math.PI / 180;
        optionsToUse.scene.aspectRatio = width / height;
      }
    }

    if (
      optionsToUse.scene.style === 'perspective'
      || optionsToUse.scene.style === 'orthographic'
    ) {
      const {
        camera, near, far, light,
      } = optionsToUse.scene;
      if (camera == null) {
        optionsToUse.scene.camera = {};
      }
      if (camera == null || camera.position == null) {
        optionsToUse.scene.camera.position = [1, 0.5, 2];
      }
      if (near == null && far == null) {
        optionsToUse.scene.near = 0.1;
        optionsToUse.scene.far = 20;
      }
      if (light == null) {
        optionsToUse.scene.light = {
          directional: [1, 0.5, 0.2],
        };
      }
    }

    this.scene = new Scene(optionsToUse.scene);
    // this.zoom = {
    //   min: null,
    //   max: null,
    //   last: {
    //     mag: 1,
    //     position: new Point(0, 0),
    //     angle: 0,
    //     distance: 0,
    //   },
    //   current: {
    //     position: new Point(0, 0),
    //     angle: 0,
    //     distance: 0,
    //   },
    //   mag: 1,
    //   cumOffset: new Point(0, 0),
    //   cumAngle: new Point(0, 0),
    //   pinching: false,
    //   scale: 1,
    //   // current: 1,
    //   // position: new Point(0, 0),
    //   // scale: 1,
    //   // zooming: false,
    //   // angle: 0,
    //   // lastAngle: 0,
    //   // lastDistance: 0,
    //   // space: new Rect(
    //   //   this.scene.left,
    //   //   this.scene.bottom,
    //   //   this.scene.right - this.scene.left,
    //   //   this.scene.top - this.scene.bottom,
    //   // ),
    // };
    this.previousCursorPoint = new Point(0, 0);
    this.isTouchDown = false;
    this.fontScale = optionsToUse.fontScale;
    this.setDefaultLineWidth(options.lineWidth || null);
    this.setDefaultLength(options.length || null);
    this.drawQueued = false;
    this.lastDrawTime = 0;
    this.beingMovedElement = null;
    this.beingTouchedElement = null;
    this.moveBuffer = [];
    this.timeKeeper = new TimeKeeper();
    this.notifications = new NotificationManager(this.fnMap);
    this.fonts = new FontManager(this.fnMap, this.notifications);
    this.fonts.notifications.add('fontsLoaded', () => {
      this.fontsLoaded();
    });
    this.fonts.addAnimateFrameCallback(this.animateNextFrame.bind(this));
    this.recorder = new Recorder(this.timeKeeper);
    // $FlowFixMe
    this.recorder.figure = this;
    this.bindRecorder();
    this.pauseTime = this.timeKeeper.now() / 1000;
    this.shapesLow = this.getShapes();
    this.shapes = this.shapesLow;
    this.primitives = this.shapes;
    this.collectionsLow = this.getObjects();
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
      this.initElements();
    }
    this.waitForFrames = 0;
    this.scrollingFast = false;
    this.scrollTimeoutId = null;
    this.drawTimeoutId = null;
    this.oldScroll = window.pageYOffset;
    this.drawAnimationFrames = 0;
    this.cursorShown = false;
    this.originalScalePoint = null;
  }

  fontsLoaded() {
    this.elements.fontUpdated();
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

  // setScene(options: OBJ_SceneOptions) {
  //   this.scene = new Scene(options);
  //   this.elements.scene = this.
  // }
  //   const o = joinobjects({}, this.scene, options);


  // }

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
    const onTouchElement = (payload) => {
      const [element, x, y, z] = payload;
      this.selectElement(element, new Point(x, y, z));
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
      // this.setCursorGLPoint(new Point(x, y));
      this.setCursor(new Point(x, y));
      this.touchMove(new Point(x, y));
    };
    const onAutoCursorMove = (payload) => {
      const [x, y] = payload;
      // this.setCursorGLPoint(new Point(x, y));
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

    this.recorder.addEventType('touchElement', onTouchElement);
    this.recorder.addEventType('_autoTouchElement', onTouchElement);
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

    const figureWidth = this.scene.right - this.scene.left;
    const pixelWidth = this.webglLow.gl != null ? this.webglLow.gl.canvas.width : 100;
    this.defaultLineWidth = Math.max(figureWidth / pixelWidth, figureWidth / 800);
    // const zero = this.transformPoint([0, 0], 'gl', 'figure');
    // const one = this.transformPoint([1, 0], 'gl', 'figure');
    // this.defaultLineWidth = Math.abs(one.distance(zero) / 10);
  }

  setDefaultLength(userInputLength: number | null) {
    if (userInputLength != null) {
      this.defaultLength = userInputLength;
      return;
    }

    this.defaultLength = (this.scene.right - this.scene.left) / 4;
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

  init(webgl: WebGLInstance) {
    // this.webglLow.recreateAtlases();
    this.elements.init(webgl);
    this.animateNextFrame();
  }

  getState(options: { precision?: number, ignoreShown?: boolean, min?: boolean }) {
    this.notifications.publish('getState');
    this.stateTime = this.timeKeeper.now() / 1000;
    const o = joinObjects({}, options, { returnF1Type: false });
    const state = getState(this, [
      'lastDrawTime',
      'elements',
      'stateTime',
      'mockPreviousTouchPoint',
      'isTouchDown',
      'scene',
      'originalScalePoint',
    ], o);
    state.beingTouchedElement = null;
    state.beingMovedElement = null;

    if (this.beingTouchedElement != null) {
      state.beingTouchedElement = {
        f1Type: 'de',
        state: this.beingTouchedElement.getPath(),
      };
    }
    // if (this.beingMovedElements != null) {
    //   state.beingMovedElement = {
    //     f1Type: 'de',
    //     state: this.beingMovedElements.getPath(),
    //   };
    // }
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
      this.notifications.publish('setStateInit');
      this.elements.setTimeDelta(this.timeKeeper.now() / 1000 - this.stateTime);
      // this.elements.updateDrawTransforms([new Transform()], this.scene);
      this.elements.stateSet();
      this.elements.setPointsFromDefinition();
      this.elements.setPrimitiveColors();
      if (this.setStateCallback != null) {
        this.fnMap.exec(this.setStateCallback);
      }
      this.animateNextFrame();
      this.notifications.publish('setState', this.timeKeeper.now() / 1000 - this.stateTime);
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

  // /**
  //  * Set the figure to be touchable.
  //  *
  //  * Using <a href="#figureelementsettouchable">element.setTouchable</a> will
  //  * automatically set this.
  //  */
  // setTouchable(touchable: boolean = true) {
  //   if (touchable) {
  //     this.elements.hasTouchableElements = true;
  //   } else {
  //     this.elements.hasTouchableElements = false;
  //   }
  // }

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
      this.scene,
      this.animateNextFrame.bind(this, true, 'getShapes'),
      this.defaultColor,
      this.defaultDimColor,
      this.defaultFont,
      this.defaultLineWidth,
      this.defaultLength,
      this.timeKeeper,
      this.recorder,
      0.7,
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

  /*
  For some reason unknown to me, the 'WEBGL_lose_context' extension is removed
  from the context when the webgl context is forced lost.

  As such, the extension has to be backed up to this.ext
  ```
  */
  loseContext() {
    // $FlowFixMe
    this.ext = this.webglLow.gl.getExtension('WEBGL_lose_context');
    this.webglLow.gl.getExtension('WEBGL_lose_context').loseContext();
    if (this.webglOffscreen) {
      this.webglOffscreen.gl.getExtension('WEBGL_lose_context').loseContext();
    }
  }

  contextLost(event: WebGLContextEvent) {
    event.preventDefault();
    this.lostContextMessage.innerHTML = '<div class="figureone__lostcontext_message"><p>Browser removed WebGL context from FigureOne and has yet to return it.</p> <p>Reload page to restore.</p></div>';
    this.lostContextMessage.style.display = 'table';
    this.elements.contextLost();
    this.webglLow.contextLost();
  }

  contextRestored() {
    this.lostContextMessage.innerHTML = '<div class="figureone__lostcontext_message"><p>Browser removed WebGL context from FigureOne and just returned it.</p> <p>FigureOne is reinitializing...</p></div>';
    // this.webglLow.init(this.canvasLow.getContext('webgl', { antialias: true }));
    this.webglLow.init(this.webglLow.gl);
    this.webglLow.recreateAtlases();
    this.init(this.webglLow);
    this.lostContextMessage.style.display = 'none';
    Console('FigureOne context restored!');
  }

  restoreContext() {
    // this.canvasLow.getContext('webgl').getExtension('WEBGL_lose_context').restoreContext();
    // $FlowFixMe
    this.ext.restoreContext();
    if (this.webglOffscreen) {
      this.webglOffscreen.gl.getExtension('WEBGL_lose_context').restoreContext();
    }
  }

  destroy() {
    this.gesture.destroy();
    this.loseContext();
  }

  /**
   * Recreate all automatically generated atlases.
   *
   * This would be typically used after loading custom fonts.
   */
  recreateAtlases() {
    this.webglLow.recreateAtlases();
  }

  recreateAtlas(atlasID: string) {
    this.webglLow.atlases[atlasID].recreate();
  }

  getAtlases() {
    return this.webglLow.atlases;
  }

  /**
   * Return matrix that can convert between 'pixel', 'figure' and 'gl' spaces.
   *
   * These matrices would be generally used to transform points between spaces.
   * `transformPoint` can be used to do this for individual points, but if
   * converting many points, then generating the transform matrix once and
   * applying it to each point can be more efficient.
   *
   * Depending on the type of figure scene, not all space combinations are
   * possible.
   *
   * For 2D scenes, all combinations are possible.
   *
   * For 3D scenes:
   * - 'pixel' to 'gl' will transform a point in pixel space to a point on the
   *    XY plane at Z = 0 in GL space.
   * - 'pixel' to 'figure' is not valid. Use `transformPoint` instead where a
   *   plane can be defined to intersect with.
   * - Conversions between 'gl' and 'figure' are only valid for 'orthographic'
   *   projections. For perspective projections, the transform matrix is not
   *   general and depends coordinates of the point to be transformed. Use
   *   `transformPoint` for each point to be transformed.
   */
  spaceTransformMatrix(
    from: 'figure' | 'gl' | 'pixel',
    to: 'figure' | 'gl' | 'pixel',
  ) {
    return this.elements.spaceTransformMatrix(from, to);
  }

  /**
   * Transform a point between 'figure', 'gl' and 'pixel' spaces.
   *
   * `plane` is only needed when converting from pixel space (a 2D space) to
   * 'figure' space or 'gl' space (a 3D space). A ray from the pixel is drawn
   * into the screen and the intersection with the defined `plane` is returned.
   *
   * @param {TypeParsablePoint} point
   * @param {'figure' | 'gl' | 'pixel'} fromSpace space to convert point from
   * @param {'figure' | 'gl' | 'pixel'} toSpace space to convert point to
   * @param {TypeParsablePlane} plane figure space intersection plane for
   * 'pixel' to 'figure' conversion (default: xy plane at z = 0)
   */
  transformPoint(
    point: TypeParsablePoint,
    fromSpace: 'figure' | 'gl' | 'pixel',
    toSpace: 'figure' | 'gl' | 'pixel',
    plane: TypeParsablePlane = [[0, 0, 0], [0, 0, 1]],
  ) {
    return this.elements.transformPoint(point, fromSpace, toSpace, plane);
  }

  // pixelToPlane(
  //   pixel: TypeParsablePoint,
  //   figureSpacePlane: TypeParsablePlane,
  //   // figureToLocalMatrix: Type3DMatrix = m3.identity(),
  // ) {
  //   const glPoint = getPoint(pixel).transformBy(this.spaceTransformMatrix('pixel', 'gl'));
  //   return this.glToPlane(glPoint, figureSpacePlane);
  // }

  /*
  A figure is projected into clip space (gl space) through a view matrix
  and projection matrix.

  The view matrix simulates a camera at some postion with some orientation
  looking at the figure.

  The projection matrix transforms all vertices that are to be seen to within
  the GL coordinates (-1 to +1)

  The near plane (gl space z = -1) represents a rectange in figure space where
  the center of the rectangle is the point between the camera position and the
  look at point a distance `near` from the camera. `scene.rightVector` and
  `scene.upVector` define the figure space directions of gl space x+ and y+.

  Therefore, a point on the near gl plane can be converted to figure space by
  scaling the `scene.rightVector` and `scene.upVector`s and adding them to the
  `scene.nearCenter`.

  A similar process can be done with the far gl plane.

  Therefore, this method takes the XY coordinate of a GL point and draws a line
  from -1 to 1 in z in GL space. The near point (z = -1) and far point (z = 1)
  is transformed into figure space. The line in figure space is then
  intersected with a plane in figure space.
  */
  // glToPlane(
  //   glPoint: TypeParsablePoint,
  //   figureSpacePlane: TypeParsablePlane,
  // ) {
  //   const gl = getPoint(glPoint);
  //   const nearPoint = this.scene.nearCenter
  //     .add(this.scene.rightVector.scale(this.scene.widthNear / 2 * gl.x))
  //     .add(this.scene.upVector.scale(this.scene.heightNear / 2 * gl.y));
  //   const farPoint = this.scene.farCenter
  //     .add(this.scene.rightVector.scale(this.scene.widthFar / 2 * gl.x))
  //     .add(this.scene.upVector.scale(this.scene.heightFar / 2 * gl.y));
  //   return getPlane(figureSpacePlane).lineIntersect([nearPoint, farPoint]);
  // }

  // pixelToGLPlane(
  //   pixelPoint: TypeParsablePoint,
  //   glSpacePlane: TypeParsablePlane,
  // ) {
  //   const pixel = getPoint(pixelPoint);
  //   const gl = pixel.transformBy(this.spaceTransformMatrix('pixel', 'gl'));
  //   const nearPoint = new Point(gl.x, gl.y, -1);
  //   const farPoint = new Point(gl.x, gl.y, 1);
  //   return getPlane(glSpacePlane).lineIntersect([nearPoint, farPoint]);
  // }


  // deprecate
  // eslint-disable-next-line class-methods-use-this
  initialize() {
  }

  initElements() {
    this.animations = this.elements.animations;
    this.elements.scene = this.scene;
    // $FlowFixMe
    this.elements.getCanvas = () => this.canvasLow;
    this.setupAnimations();
    this.elements.setFigure({
      spaceTransformMatrix: this.spaceTransformMatrix.bind(this),
      animateNextFrame: this.animateNextFrame.bind(this),
      animationFinished: this.animationFinished.bind(this),
      recorder: this.recorder,
      timeKeeper: this.timeKeeper,
      notifications: this.notifications,
      pixelToGL: this.pixelToGL.bind(this),
      preventDefault: this.preventDefault.bind(this),
    });
    this.setFirstTransform();
    this.animateNextFrame();
  }

  setElements(collection: FigureElementCollection) {
    this.elements = collection;
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

    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      const elementRemainingTime = element.animations.getRemainingTime([], now);
      if (elementRemainingTime == null) {
        return null;
      }
      if (elementRemainingTime > remainingTime) {
        remainingTime = elementRemainingTime;
      }
      const remainingPulseTime = element.getRemainingPulseTime(now);
      if (remainingPulseTime == null) {
        return null;
      }
      if (remainingPulseTime > remainingTime) {
        remainingTime = remainingPulseTime;
      }
      const remainingMovingFreelyTime = element.getRemainingMovingFreelyTime(now);
      if (remainingMovingFreelyTime == null) {
        return null;
      }
      if (remainingMovingFreelyTime > remainingTime) {
        remainingTime = remainingMovingFreelyTime;
      }
    }
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
    this.elements.setFirstTransform(new Transform());
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
    this.getPixelSpace();
    this.notifications.publish('resize');
    this.animateNextFrame(true, 'resize');
    this.drawAnimationFrames = 2;
    // this.renderAllElementsToTiedCanvases(true);
  }

  getPixelSpace() {
    const canvasRect = this.canvasLow.getBoundingClientRect();
    this.pixelSpace = {
      x: { min: 0, span: canvasRect.width },
      y: { min: canvasRect.height, span: -canvasRect.height },
    };
  }

  pixelToGL(pixelPoint: Point) {
    return new Point(
      pixelPoint.x / this.pixelSpace.x.span * 2 - 1,
      (1 - (-pixelPoint.y / this.pixelSpace.y.span)) * 2 - 1,
    );
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
        this.setCursorGLPoint(this.previousCursorPoint);
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

  mousePosition(pixelPoint: Point) {
    // if (
    //   this.beingTouchedElement != null
    //   && this.beingTouchedElement.mousePixelPosition != null
    // ) {
    //   this.beingTouchedElement.mousePixelPosition(pixelPoint);
    // }
    this.notifications.publish('mousePosition', pixelPoint);
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  wheelHandler(deltaX: number, deltaY: number, deltaMode: 0x00 | 0x01 | 0x02) {
    this.notifications.publish('gestureWheel', [new Point(deltaX, deltaY), deltaMode], false);
    if (this.defaultPrevented) {
      this.defaultPrevented = false;
      return true;
    }
    return false;
  }

  startPinchZoom(touch1ClientPos: Point, touch2ClientPos: Point) {
    const pixelPoints = this.clientsToPixel([touch1ClientPos, touch2ClientPos]);
    this.notifications.publish(
      'gestureStartPinch',
      [pixelPoints[0], pixelPoints[1], this.beingTouchedElement],
      false,
    );
  }

  pinchZoom(touch1ClientPos: Point, touch2ClientPos: Point) {
    // const oldZoom = this.zoom.last.mag;
    const pixelPoints = this.clientsToPixel([touch1ClientPos, touch2ClientPos]);
    this.notifications.publish(
      'gesturePinching',
      [pixelPoints[0], pixelPoints[1], this.beingTouchedElement],
      false,
    );
    // const line = new Line(pixelPoints[0], pixelPoints[1]);

    // const d = line.length();
    // // const { current, lastDistance, scale } = this.zoom;
    // let mag = this.zoom.mag
    //   + (d - this.zoom.current.distance) / 5 * this.zoom.scale * this.zoom.mag / 100;
    // if (this.zoom.min != null) {
    //   mag = Math.max(mag, this.zoom.min);
    // }
    // if (this.zoom.max != null) {
    //   mag = Math.min(mag, this.zoom.max);
    // }
    // const position = this.transformPoint(line.pointAtPercent(0.5), 'pixel', 'figure');
    // this.updateZoom(mag, position, d, line.angle());
    // this.notifications.publish('zoom', [this.zoom.mag]);
  }


  endPinchZoom() {
    this.notifications.publish('gesturePinchEnd');
    // this.zoom.pinching = false;
  }

  // /**
  //  * Set zoom gesture options for figure.
  //  *
  //  * @param {OBJ_ZoomOptions} options
  //  */
  // setZoomOptions(options: OBJ_ZoomOptions) {
  //   if (options.min !== undefined) { this.zoom.min = options.min; }
  //   if (options.max !== undefined) { this.zoom.max = options.max; }
  //   if (options.scale !== undefined) { this.zoom.scale = options.scale; }
  // }

  // /**
  //  * Set zoom
  //  *
  //  * @param {OBJ_Zoom} zoom
  //  * @param {boolean} notify `true` to send `'zoom'` notification after set
  //  */
  // setZoom(zoom: OBJ_Zoom, notify: boolean = false) {
  //   const z = joinObjects({
  //     mag: this.zoom.mag,
  //     angle: this.zoom.current.angle,
  //     distance: this.zoom.current.distance,
  //     pinching: this.zoom.pinching,
  //   }, zoom);
  //   this.updateZoom(z.mag, z.position, z.distance, z.angle);
  //   this.zoom.pinching = z.pinching;
  //   if (notify) {
  //     this.notifications.publish('zoom', [this.zoom.mag]);
  //   }
  // }

  // /**
  //  * @return {OBJ_Zoom}
  //  */
  // getZoom() {
  //   return {
  //     last: this.zoom.last,
  //     current: this.zoom.current,
  //     mag: this.zoom.mag,
  //     offset: this.zoom.cumOffset,
  //     angle: this.zoom.cumAngle,
  //   };
  // }

  touchDownHandlerClient(clientPoint: Point, eventFromPlayback: boolean = false) {
    const pixel = this.clientToPixel(clientPoint);
    // const glPoint = pixelP.transformBy(this.spaceTransformMatrix('pixel', 'gl'));
    const glPoint = this.transformPoint(pixel, 'pixel', 'gl');
    // glPoint.z = -1;
    this.touchDownHandler(glPoint, eventFromPlayback);
    return true;
    // if (e != null) {
    //   // console.log(e.getPosition('figure'))
    //   const drawPosition = e.getPosition('draw');
    //   const worldViewProjectionMatrix = m3.mul(
    //     m3.mul(
    //       this.scene.projectionMatrix,
    //       this.scene.viewMatrix,
    //     ),
    //     e.lastDrawTransform.matrix(),
    //   );
    //   const n = m3.transformVector(worldViewProjectionMatrix, [0, 0, 0, 1]);
    //   const perspectiveWVPMatrix = worldViewProjectionMatrix.map(a => a / n[3]);
    //   const drawToPixel = m3.mul(this.spaceTransformMatrix('gl', 'pixel'), perspectiveWVPMatrix);

    //   const p = drawPosition.transformBy(drawToPixel);

    //   const q = pixelP.round(0);
    //   console.log(e.name, [p.x, p.y], [q.x, q.y]);
    //   console.log(e.getPosition('pixel'))
    // }
    // console.log('xz', this.pixelToPlane(pixelP, [[0, 0, 0], [1, 0, 0]]));

    // const figurePoint = pixelP.transformBy(this.spaceTransformMatrix('pixel', 'figure'));
    // return this.touchDownHandler(figurePoint, eventFromPlayback);
  }

  touchDownHandler(
    glPoint: Point,
    eventFromPlayback: boolean = false,
    autoEvent: boolean = false,
  ) {
    if (this.recorder.state === 'recording') {
      if (!autoEvent) {
        this.recorder.recordEvent('touch', ['down', glPoint.x, glPoint.y]);
      }
      if (this.cursorShown) {
        this.showCursor('down');
      }
    }

    // this.currentCursorPoint = figurePoint._dup();
    this.previousCursorPoint = this.transformPoint(glPoint, 'gl', 'figure');

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


    let element;
    let backCameraControl;
    element = this.elements.getSelectionFromBorders(glPoint);

    if (
      element != null
      && element._custom != null
      && element._custom.cameraControlBack
    ) {
      backCameraControl = element;
    }
    if (element == null || backCameraControl) {
      element = this.getSelectionFromDraw(glPoint);
    }
    if (element == null && backCameraControl) {
      element = backCameraControl;
    }

    if (element == null) {
      return false;
    }

    // console.log(element)
    this.selectElement(element, glPoint, autoEvent);
    // element.click(glPoint);
    // if (this.recorder.state === 'recording') {
    //   if (!autoEvent) {
    //     this.recorder.recordEvent('touchElement', [element.getPath(), glPoint.x, glPoint.y]);
    //   }
    // }

    // this.beingTouchedElement = element;
    // if (element.isMovable) {
    //   this.beingMovedElement = element;
    //   element.startBeingMoved();
    // }

    // if (this.beingMovedElement != null) {
    //   this.animateNextFrame(true, 'touch down handler');
    // }
    return true;
  }

  selectElement(
    element: string | FigureElement,
    glPoint: Point,
    autoEvent: boolean = false,
  ) {
    let e: FigureElement;
    if (typeof element === 'string') {
      // $FlowFixMe
      e = this.get(element);
    } else {
      e = element;
    }
    if (e == null) {
      return;
    }
    if (this.recorder.state === 'recording') {
      if (!autoEvent) { // $FlowFixMe
        this.recorder.recordEvent('touchElement', [e.getPath(), glPoint.x, glPoint.y, glPoint.z]);
      }
    }
    // $FlowFixMe
    e.click(glPoint); // $FlowFixMe
    this.beingTouchedElement = e;
    if (e.isMovable) { // $FlowFixMe
      this.beingMovedElement = e;// $FlowFixMe
      e.startBeingMoved();
    }

    if (this.beingMovedElement != null) {
      this.animateNextFrame(true, 'touch down handler');
    }
  }

  // // Handle touch down, or mouse click events within the canvas.
  // // The default behavior is to be able to move objects that are touched
  // // and dragged, then when they are released, for them to move freely before
  // // coming to a stop.
  // touchDownHandlerLegacy(
  //   figurePoint: Point,
  //   eventFromPlayback: boolean = false,
  //   autoEvent: boolean = false,
  // ) {
  //   if (this.recorder.state === 'recording') {
  //     if (!autoEvent) {
  //       this.recorder.recordEvent('touch', ['down', figurePoint.x, figurePoint.y]);
  //     }
  //     if (this.cursorShown) {
  //       this.showCursor('down');
  //     }
  //   }

  //   // this.currentCursorPoint = figurePoint._dup();
  //   this.previousCursorPoint = figurePoint._dup();

  //   if (this.isPaused) {
  //     this.unpause();
  //   }
  //   if (this.recorder.state === 'idle') {
  //     this.recorder.lastSeekTime = null;
  //   }
  //   if (this.recorder.state === 'playing' && !eventFromPlayback) {
  //     this.recorder.pausePlayback();
  //     this.showCursor('hide');
  //   }
  //   this.isTouchDown = true;

  //   // Get the touched point in clip space
  //   const glPoint = figurePoint.transformBy(this.spaceTransformMatrix('figure', 'gl'));

  //   // Get all the figure elements that were touched at this point (element
  //   // must have isTouchable = true to be considered)
  //   // debugger;
  //   this.beingTouchedElements = this.elements.getTouched(glPoint);

  //   if (this.touchTopElementOnly && this.beingTouchedElements.length > 1) {
  //     this.beingTouchedElements = [this.beingTouchedElements[0]];
  //   }

  //   this.beingTouchedElements.forEach(e => e.click(glPoint));

  //   // Make a list of, and start moving elements that are being moved
  //   // (element must be touched and have isMovable = true to be in list)
  //   this.beingMovedElements = [];
  //   for (let i = 0; i < this.beingTouchedElements.length; i += 1) {
  //     const element = this.beingTouchedElements[i];
  //     if (element.isMovable) {
  //       this.beingMovedElements.push(element);
  //       element.startBeingMoved();
  //     }
  //   }

  //   if (this.beingMovedElements.length > 0) {
  //     this.animateNextFrame(true, 'touch down handler');
  //   }
  //   if (this.beingTouchedElements.length > 0) {
  //     return true;
  //   }
  //   return false;
  // }

  flushMoveBuffer() {
    if (this.moveBuffer.length > 0) {
      this.touchMoveHandler(
        this.moveBuffer[0][0],
        this.moveBuffer[this.moveBuffer.length - 1][1],
        false,
      );
      this.moveBuffer = [];
    }
  }

  // Handle touch up, or mouse click up events in the canvas. When an UP even
  // happens, the default behavior is to let any elements being moved to move
  // freely until they decelerate to 0.
  touchUpHandler(autoEvent: boolean = false, fromGesture: boolean = false) {
    if (this.isTouchDown === false) {
      return;
    }
    // If the recorder is playing and there is a touchup even outside of the
    // figure, then unless this check is here, then if the cursor is down, it
    // will be lifted.
    if (
      (this.recorder.state === 'playing' || this.recorder.state === 'preparingToPlay')
      && fromGesture
    ) {
      return;
    }
    if (this.recorder.state === 'recording' && !autoEvent) {
      this.recorder.recordEvent('touch', ['up']);
      if (this.cursorShown) {
        this.showCursor('up');
      }
    }
    this.flushMoveBuffer();
    if (this.beingMovedElement != null) {
      let elementToMove;
      if (this.beingMovedElement.move.element == null) {
        elementToMove = this.beingMovedElement;
      } else if (typeof this.beingMovedElement.move.element === 'string') {
        elementToMove = this.getElement(this.beingMovedElement.move.element);
      } else {
        elementToMove = this.beingMovedElement.move.element;
      }
      if (elementToMove != null && elementToMove.state.isBeingMoved) {
        elementToMove.stopBeingMoved();
        elementToMove.startMovingFreely();
      }
    }
    // if (
    //   this.beingMovedElement != null
    //   && this.beingMovedElement.state.isBeingMoved
    // ) {
    //   this.beingMovedElement.stopBeingMoved();
    //   this.beingMovedElement.startMovingFreely();
    // }
    this.originalScalePoint = null;
    this.isTouchDown = false;
    this.beingMovedElement = null;
    if (this.beingTouchedElement != null) {
      this.beingTouchedElement.notifications.publish('touchUp');
    }
    this.beingTouchedElement = null;
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

  setCursorGLPoint(p: Point, animateNextFrame: boolean = true) {
    const cursor = this.getElement(this.cursorElementName);
    if (cursor == null) {
      return;
    }
    cursor.setPosition(cursor.transformPoint(p, 'gl', 'figure'));
    if (animateNextFrame) {
      this.animateNextFrame();
    }
  }

  touchFreeHandler(clientPoint: Point) {
    // const cursor = this.getCursor();
    if (this.recorder.state === 'recording') {
      const pixelP = this.clientToPixel(clientPoint);
      const cursorGLPoint = this.transformPoint(pixelP, 'pixel', 'gl');
      this.previousCursorPoint = cursorGLPoint;
      if (this.cursorShown) {
        this.recorder.recordEvent('cursorMove', [cursorGLPoint.x, cursorGLPoint.y]);
        this.setCursorGLPoint(cursorGLPoint);
      } else {
        this.setCursorGLPoint(cursorGLPoint, false);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  rotateElement(
    element: FigureElement,
    previousGLPoint: Point,
    currentGLPoint: Point,
  ) {
    const previousLocalPoint = element.glToPlane(previousGLPoint, 'local');
    const currentLocalPoint = element.glToPlane(currentGLPoint, 'local');

    const center = element.getPosition('local');
    const prev = previousLocalPoint.sub(center);
    const curr = currentLocalPoint.sub(center);
    let deltaAngle;
    if (prev.isEqualTo(curr)) {
      deltaAngle = 0;
    } else {
      deltaAngle = curr.angleTo(prev);
      const norm = prev.crossProduct(curr).normalize();
      if (!norm.isEqualTo(element.move.plane.n)) {
        deltaAngle *= -1;
      }
    }
    const r = element.transform.r();
    if (typeof r === 'number') {
      element.moved(r + deltaAngle);
    } else {
      element.moved(r[1] + deltaAngle);
    }

    // const currentAngle = Math.atan2(
    //   currentLocalPoint.y - center.y,
    //   currentLocalPoint.x - center.x,
    // );
    // const previousAngle = Math.atan2(
    //   previousLocalPoint.y - center.y,
    //   previousLocalPoint.x - center.x,
    // );
    // const diffAngle = minAngleDiff(currentAngle, previousAngle);
    // const transform = element.transform._dup();
    // let rot = transform.r();
    // if (rot == null) {
    //   rot = 0;
    // }
    // const newAngle = rot + diffAngle;
    // // console.log(rot, diffAngle, newAngle);
    // transform.updateRotation(newAngle);
    // element.moved(transform);
  }

  // eslint-disable-next-line class-methods-use-this
  translateElement(
    element: FigureElement,
    previousGLPoint: Point,
    currentGLPoint: Point,
  ) {
    const previousLocalPoint = element.glToPlane(previousGLPoint, 'local', element.move.plane);
    const currentLocalPoint = element.glToPlane(currentGLPoint, 'local', element.move.plane);
    const delta = currentLocalPoint.sub(previousLocalPoint);
    const transform = element.transform._dup();
    const translation = transform.t();
    if (translation != null) {
      // transform.updateTranslation(translation.add(delta));
      // element.moved(transform);
      element.moved(translation.add(delta));
    }

    // const m = element.spaceTransformMatrix('figure', 'local');

    // const currentVertexSpacePoint = currentFigurePoint.transformBy(m);
    // const previousVertexSpacePoint = previousFigurePoint.transformBy(m);
    // const elementSpaceDelta = currentVertexSpacePoint.sub(previousVertexSpacePoint);
    // const currentTransform = element.transform._dup();
    // const currentTranslation = currentTransform.t();
    // if (currentTranslation != null) {
    //   const newTranslation = currentTranslation.add(elementSpaceDelta);
    //   currentTransform.updateTranslation(newTranslation);
    //   element.moved(currentTransform);
    // }
  }

  // TODO There is some weird behavior here when a boundary limit min is
  // set. When draggin toward the center, the min will be reached. Just beyond
  // the center might have a previousMag << currentMag meaning a very large
  // scale will result so the scale will jump from min to max instantly.

  // eslint-disable-next-line class-methods-use-this
  scaleElement(
    element: FigureElement,
    previousGLPoint: Point,
    currentGLPoint: Point,
    type: 'x' | 'y' | 'z' | '' = '',
  ) {
    const previousLocalPoint = element.glToPlane(previousGLPoint);
    const currentLocalPoint = element.glToPlane(currentGLPoint);
    // if (this.originalScalePoint == null) {
    //   this.originalScalePoint = previousLocalPoint;
    // }
    const center = element.getPosition('local');
    let previousMag = previousLocalPoint.sub(center).distance();
    if (previousMag === 0) {
      previousMag = 0.000001;
    }
    const currentMag = currentLocalPoint.sub(center).distance();
    // if (element.move.bounds !== null) {
    //   currentMag = element.move.bounds.clip(currentMag);
    //   previousMag = Math.max(element.move.bounds.clip(previousMag), 0.0000001);
    //   console.log(currentMag, previousMag)
    // }


    const currentScale = element.transform.s();
    // element.moved(currentMag / previousMag);
    if (currentScale != null) {
      // const currentTransform = element.transform._dup();
      // const newScaleY = currentScale.y * currentMag / previousMag;
      // const newScaleZ = currentScale.z * currentMag / previousMag;
      if (type === 'x') {
        // currentTransform.updateScale([newScaleX, 1, 1]);
        const newScaleX = currentScale.x * currentMag / previousMag;
        element.moved(newScaleX);
      } else if (type === 'y') {
        // currentTransform.updateScale([1, newScaleY, 1]);
        const newScaleY = currentScale.y * currentMag / previousMag;
        element.moved(newScaleY);
      } else if (type === 'z') {
        // currentTransform.updateScale([1, 1, newScaleZ]);
        const newScaleZ = currentScale.z * currentMag / previousMag;
        element.moved(newScaleZ);
      } else {
        // currentTransform.updateScale([newScaleX, newScaleY, newScaleZ]);
        const newScaleX = currentScale.x * currentMag / previousMag;
        element.moved(newScaleX);
      }
      // element.moved(currentTransform);
    }
  }


  touchMoveHandlerClient(previousClientPoint: Point, currentClientPoint: Point) {
    const currentPixelPoint = this.clientToPixel(currentClientPoint);
    const currentGLPoint = currentPixelPoint
      .transformBy(this.spaceTransformMatrix('pixel', 'gl'));
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const previousGLPoint = previousPixelPoint
      .transformBy(this.spaceTransformMatrix('pixel', 'gl'));
    currentGLPoint.z = -1;
    previousGLPoint.z = -1;
    if (this.beingMovedElement == null || this.beingMovedElement === this.elements) {
      return this.touchMoveHandler(previousGLPoint, currentGLPoint);
    }
    this.moveBuffer.push([previousGLPoint, currentGLPoint]);
    return true;
  }


  touchMoveHandler(
    previousGLPoint: Point,
    currentGLPoint: Point,
    fromAutoEvent: boolean = false,
  ): boolean {
    this.previousCursorPoint.x = currentGLPoint.x;
    this.previousCursorPoint.y = currentGLPoint.y;
    if (this.recorder.state === 'recording' && !fromAutoEvent) {
      this.recorder.recordEvent('cursorMove', [currentGLPoint.x, currentGLPoint.y]);
      if (this.cursorShown) {
        this.setCursorGLPoint(currentGLPoint);
      }
    }

    // this.previousCursorPoint = currentCusorPoint;
    // let e;
    // e = this.elements.getSelectionFromBorders(currentGLPoint);
    // if (e == null) {
    //   e = this.getSelectionFromDraw(currentGLPoint);
    // }
    // if (e == null) {
    //   return false;
    // }

    this.notifications.publish('gestureMove', [previousGLPoint, currentGLPoint, this.beingTouchedElement], false);

    if (this.beingMovedElement == null || this.beingMovedElement === this.elements) {
      return false;
    }

    const element = this.beingMovedElement;
    const moveType = element.move.type;

    let elementToMove: FigureElement;
    if (element.move.element == null) {
      elementToMove = element;
    } else if (typeof element.move.element === 'string') {  // $FlowFixMe
      elementToMove = this.getElement(element.move.element);
    } else {
      elementToMove = element.move.element;
    } // $FlowFixMe
    if (elementToMove.state.isBeingMoved === false) {  // $FlowFixMe
      elementToMove.startBeingMoved();
    } // $FlowFixMe
    elementToMove.move.type = moveType;
    if (moveType === 'rotation') {
      this.rotateElement( // $FlowFixMe
        elementToMove, previousGLPoint, currentGLPoint,
      );
    } else if (moveType === 'scale') {
      this.scaleElement( // $FlowFixMe
        elementToMove, previousGLPoint, currentGLPoint,
      );
    } else if (moveType === 'scaleX') {
      this.scaleElement( // $FlowFixMe
        elementToMove, previousGLPoint, currentGLPoint, 'x',
      );
    } else if (moveType === 'scaleY') {
      this.scaleElement( // $FlowFixMe
        elementToMove, previousGLPoint, currentGLPoint, 'y',
      );
    } else if (moveType === 'scaleZ') {
      this.scaleElement( // $FlowFixMe
        elementToMove, previousGLPoint, currentGLPoint, 'z',
      );
    } else {
      this.translateElement( // $FlowFixMe
        elementToMove,
        previousGLPoint,
        currentGLPoint,
      );
    }

    this.animateNextFrame(true, 'touch move handler');
    return true;
  }

  // // Handle touch/mouse move events in the canvas. These events will only be
  // // sent if the initial touch down happened in the canvas.
  // // The default behavior is to drag (move) any objects that were touched in
  // // the down event to the new location.
  // // This function should return true if the move event should NOT be processed
  // // by the system. For example, on a touch device, a touch and drag would
  // // normally scroll the screen. Typically, you would want to move the figure
  // // element and not the screen, so a true would be returned.
  // touchMoveHandlerLegacy(
  //   previousFigurePoint: Point,
  //   currentFigurePoint: Point,
  //   fromAutoEvent: boolean = false,
  // ): boolean {
  //   if (this.recorder.state === 'recording' && !fromAutoEvent) {
  //     this.recorder.recordEvent('cursorMove', [currentFigurePoint.x, currentFigurePoint.y]);
  //     if (this.cursorShown) {
  //       this.setCursor(currentFigurePoint);
  //     }
  //   }

  //   this.previousCursorPoint.x = currentFigurePoint.x;
  //   this.previousCursorPoint.y = currentFigurePoint.y;

  //   if (this.beingMovedElements.length === 0) {
  //     return false;
  //   }
  //   const previousGLPoint = previousFigurePoint
  //     .transformBy(this.spaceTransformMatrix('figure', 'gl'));
  //   // Go through each element being moved, get the current translation
  //   for (let i = 0; i < this.beingMovedElements.length; i += 1) {
  //     const element = this.beingMovedElements[i];
  //     if (element !== this.elements) {
  //       if (element.isBeingTouched(previousGLPoint)
  //             || element.move.canBeMovedAfterLosingTouch) {
  //         let elementToMove;
  //         if (element.move.element == null) {
  //           elementToMove = element;
  //         } else if (typeof element.move.element === 'string') {
  //           elementToMove = this.getElement(element.move.element);
  //         } else {
  //           elementToMove = element.move.element;
  //         }
  //         // $FlowFixMe
  //         if (elementToMove.state.isBeingMoved === false) {
  //           // $FlowFixMe
  //           elementToMove.startBeingMoved();
  //         }
  //         if (this.beingMovedElements.indexOf(elementToMove) === -1) {
  //           // $FlowFixMe
  //           this.beingMovedElements.push(elementToMove);
  //         }
  //         if (element.move.type === 'rotation') {
  //           this.rotateElement( // $FlowFixMe
  //             elementToMove,
  //             previousFigurePoint,
  //             currentFigurePoint,
  //           );
  //         } else if (element.move.type === 'scale') {
  //           this.scaleElement( // $FlowFixMe
  //             elementToMove,
  //             previousFigurePoint,
  //             currentFigurePoint,
  //           );
  //         } else if (element.move.type === 'scaleX') {
  //           this.scaleElement( // $FlowFixMe
  //             elementToMove,
  //             previousFigurePoint,
  //             currentFigurePoint,
  //             'x',
  //           );
  //         } else if (element.move.type === 'scaleY') {
  //           this.scaleElement( // $FlowFixMe
  //             elementToMove,
  //             previousFigurePoint,
  //             currentFigurePoint,
  //             'y',
  //           );
  //         } else {
  //           this.translateElement( // $FlowFixMe
  //             elementToMove,
  //             previousFigurePoint,
  //             currentFigurePoint,
  //           );
  //         }
  //       }
  //     }
  //     if (this.touchTopElementOnly) {
  //       i = this.beingMovedElements.length;
  //     }
  //   }
  //   this.animateNextFrame(true, 'touch move handler');
  //   return true;
  // }

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
      this.notifications.add('setState', stopped, 1);
      this.notifications.publish('preparingToStop');
      this.state.preparingToStop = true;
    } else {
      stopped();
    }
  }

  getScene() {
    return this.scene;
  }

  setupAnimations() {
    this.elements.fnMap.add('_cameraCallback', (p: number, customProperties: Object) => {
      const { start, target } = customProperties;
      const camera = {
        position: start.position.add(target.position.sub(start.position).scale(p)),
        lookAt: start.lookAt.add(target.lookAt.sub(start.lookAt).scale(p)),
        up: start.up.add(target.up.sub(start.up).scale(p)),
      };
      this.scene.setCamera(camera);
    }); // $FlowFixMe
    this.animations.camera = (...opt) => {
      const o = joinObjects({}, {
        progression: 'easeinout',
      }, ...opt);
      o.customProperties = {
        start: joinObjects({}, this.scene.camera, o.start || {}),
        target: joinObjects({}, this.scene.camera, o.target || {}),
      };
      o.customProperties.start.position = getPoint(o.customProperties.start.position);
      o.customProperties.start.lookAt = getPoint(o.customProperties.start.lookAt);
      o.customProperties.start.up = getPoint(o.customProperties.start.up);
      o.customProperties.target.position = getPoint(o.customProperties.target.position);
      o.customProperties.target.lookAt = getPoint(o.customProperties.target.lookAt);
      o.customProperties.target.up = getPoint(o.customProperties.target.up);
      o.callback = '_cameraCallback';
      o.timeKeeper = this.timeKeeper;
      return new CustomAnimationStep(o);
    };
    this.animations.customSteps.push({
      step: this.animations.camera.bind(this),
      name: 'camera',
    });
  }

  // To add elements to a figure, either this method can be overridden,
  // or the `add` method can be used.
  createFigureElements() {
    this.elements = this.collections.collection({ name: 'rootCollection' });
    // this.elements.scene = this.scene;
    // this.animations = this.elements.animations;
    // this.elements.getCanvas = () => this.canvasLow;
    // this.setupAnimations();
    this.initElements();
  }


  setElementsToCollection(collection: FigureElementCollection) {
    this.elements = collection;
    // this.elements.scene = this.scene;
    // this.animations = this.elements.animations;
    // this.elements.getCanvas = () => this.canvasLow;
    // this.setupAnimations();
    this.initElements();
  }

  clearContext(canvasIndex: number = 0) {
    if (canvasIndex === 0) {
      const { gl } = this.webglLow;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      this.webglLow.gl.clearColor(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3],
      );
      // eslint-disable-next-line no-bitwise
      this.webglLow.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT | this.webglLow.gl.DEPTH_BUFFER_BIT);
    } else {
      this.webglOffscreen.gl.clearColor(0, 0, 0, 0);
      this.webglOffscreen.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    }
    this.elements.clear(canvasIndex);
  }

  setupForSelectionDraw(canvasIndex: number = 0) {
    if (canvasIndex === 0) {
      const { gl } = this.webglLow;
      if (this.webglLow.targetTexture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.webglLow.targetTexture.fb);
      }
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      // gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      // Clear the canvas AND the depth buffer.
      // eslint-disable-next-line no-bitwise
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  }

  // TODO in future - convert this to just one pixel as in
  // https://webglfundamentals.org/webgl/lessons/webgl-picking.html
  // but make sure it also works for orthographic projection
  getSelectionFromPixel(xPixel: number, yPixel: number, debug: boolean = false) {
    const { gl } = this.webglLow;
    this.setupForSelectionDraw();
    this.elements.draw(
      0,
      this.scene,
      [new Transform()],
      1,
      true,
    );
    const x = xPixel / gl.canvas.clientWidth * gl.canvas.width;
    const y = gl.canvas.height - yPixel * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(
      x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data,
    );
    if (!debug) {
      this.animateNextFrame();
    } // $FlowFixMe
    return this.elements.getUniqueColorElement(data);
  }

  /**
   * Debug - 3D Shapes
   *
   * Show touchable 3D shapes in figure. This will only last for one animation
   * frame, so it will not work if an animation is ongoing.
   *
   * Note, the shown borders will be for the instant this method is called
   * only. If animation is ongoing, the shown borders will not move with the
   * animation. To update the borders, call this method again.
   */
  showTouchable() {
    this.getSelectionFromPixel(0, 0, true);
  }

  /**
   * Debug - 2D Shapes
   *
   * Show the touchBorders of selected elements in the figure or all
   * elements in the figure.
   *
   * Note, the shown borders will be for the instant this method is called
   * only. If animation is ongoing, the shown borders will not move with the
   * animation. To update the borders, call this method again.
   *
   * @param {TypeElementPath | null | 'touchable'} element use `null` for all
   * elements, `touchable` for all touchable elements or define specific
   * elements to show (`'touchable'`)
   * @param {Array<TypeColor>} colors array of colors to cycle through for each
   * shape ([blue, cyan, purple, green, red, yellow, black])
   */
  showTouchBorders(
    element: TypeElementPath | null | 'touchable' = 'touchable',
    colors: Array<TypeColor> = [
      [0, 0, 1, 1],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [0, 1, 0, 1],
      [1, 0, 0, 1],
      [1, 0.5, 0, 1],
      // [0, 0, 0, 1],
    ],
  ) {
    this.showBorders('touchBorder', element, colors);
  }

  /**
   * Debug - 2D Shapes
   *
   * Show the borders or touchBorders of selected elements in the figure or all
   * elements in the figure.
   *
   * @param {'border' | 'touchBorder'} border (`'border'`)
   * @param {TypeElementPath | null | 'touchable'} element use `null` for all
   * elements, `touchable` for all touchable elements or define specific
   * elements to show (`null`)
   * @param {Array<TypeColor>} colors array of colors to cycle through for each
   * shape ([blue, cyan, purple, green, red, yellow, black])
   */
  showBorders(
    border: 'border' | 'touchBorder' = 'border',
    element: TypeElementPath | null | 'touchable' = null,
    colors: Array<TypeColor> = [
      [0, 0, 1, 1],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [0, 1, 0, 1],
      [1, 0, 0, 1],
      [1, 0.5, 0, 1],
      // [0, 0, 0, 1],
    ],
  ) {
    let elements = [];
    if (element == null || element === 'touchable') {
      elements = this.elements.getAllElements().slice(1);
      if (element === 'touchable') {
        elements = elements.filter(e => e.isTouchable);
      }
    } else if (typeof element === 'string') {
      elements = this.getElements(element);
    } else {
      elements = [element];
    }
    let colorIndex = 0;
    for (let i = 0; i < elements.length; i += 1) {
      const e = elements[i];
      if (!e.isShown) { // eslint-disable-next-line no-continue
        continue;
      }

      // $FlowFixMe
      const borderPoints = e.getBorder('figure', border);
      if (borderPoints.length > 0 && borderPoints[0].length > 0) {
        for (let j = 0; j < borderPoints.length; j += 1) {
          const name = `__${border}${i}${j}`;
          const el = this.get(name);
          if (el != null) { // $FlowFixMe
            el.custom.updatePoints({ points: borderPoints[j] });
            // $FlowFixMe
            el.showAll();
          } else {
            this.add({
              name: `__${border}${i}${j}`,
              make: 'polyline',
              options: {
                points: borderPoints[j],
                width: 0.01,
                color: colors[colorIndex % colors.length],
                dash: [0.02, 0.02],
                close: true, // $FlowFixMe
                scene: e.scene,
              },
            });
          }
        }
        colorIndex += 1;
      }
    }
    this.animateNextFrame();
  }

  getSelectionFromDraw(glPoint: Point) {
    const pixelPoint = glPoint.transformBy(this.spaceTransformMatrix('gl', 'pixel'));
    return this.getSelectionFromPixel(pixelPoint.x, pixelPoint.y);
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
    const gl = p.transformBy(this.spaceTransformMatrix('figure', 'gl'));
    this.touchDownHandler(gl, eventFromPlayback, autoEvent);
    this.mockPreviousTouchPoint = gl;
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
    const p = getPoint(figurePosition).transformBy(this.spaceTransformMatrix('figure', 'gl'));
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
    this.flushMoveBuffer();
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('m1'); }

    this.notifications.publish('beforeDraw');
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('beforeDraw'); }
    // $FlowFixMe
    if (this.elements.__frameRate_ != null && this.frameRate.information != null) {
      // $FlowFixMe
      this.elements.__frameRate_.setText({ text: this.frameRate.information, reform: false });
    }
    this.elements.setupDraw(
      now,
      canvasIndex,
    );
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('setupDraw'); }

    this.clearContext(canvasIndex);
    // $FlowFixMe
    if (this.elements.__frameRate_ != null || FIGURE1DEBUG) { timer.stamp('clearContext'); }
    this.elements.draw(
      now,
      this.scene,
      [new Transform()],
      1,
      false,
    );

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
      // console.log(timerDuration)
    }
    // console.log(timerDuration)
    if (timerDuration == null) {
      timerDuration = 0.1;
    }
    if (timerDuration > 0.00000001) {
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
    this.notifications.publish('beforeDraw');
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

  /**
   * Check if any element in the figure is animating.
   * @return {boolean}
   */
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


  clientsToPixel(clientLocations: Array<Point>): Array<Point> {
    const canvas = this.canvasLow.getBoundingClientRect();
    return clientLocations.map(p => new Point(p.x - canvas.left, p.y - canvas.top));
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
        make: 'collections.text',
        // mods: { isShown: true },
        text: ['Ave:', 'Max:'],
        position: [
          this.scene.left,
          this.scene.bottom,
        ],
        xAlign: 'left',
        yAlign: 'bottom',
        font: { size: (this.scene.right - this.scene.left) / 30, type: '2d' },
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


  addZoomPanControl(options: {
    zoom?: {
      min?: number | null,
      max?: number | null,
      sensitivity?: number,
    },
    pan?: {
      bounds?: {
        left?: number | null,
        bottom?: number | null,
        right?: number | null,
        top?: number | null,
      }
    }
  }) {
    const control = this.add(joinObjects(
      {},
      {
        name: '_zoomPan_',
        make: 'primitives.gesture',
        zoom: {},
        pan: {},
        back: true,
        width: 2,
        height: 2,
        scene: new Scene({}),
      },
      options,
    ));
    control.notifications.add('zoom', () => {
      control.zoomScene(this.scene);
    });
    control.notifications.add('pan', () => {
      control.panScene(this.scene);
    });
  }
}

export default Figure;
