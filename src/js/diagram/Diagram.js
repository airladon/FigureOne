// @flow
import WebGLInstance from './webgl/webgl';
// import getShaders from './webgl/shaders';

import {
  Rect, Point, Transform,
  spaceToSpaceTransform, minAngleDiff,
} from '../tools/g2';
import { isTouchDevice, joinObjects } from '../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimative,
} from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// eslint-disable-next-line import/no-cycle
import Gesture from './Gesture';
import DrawContext2D from './DrawContext2D';
import DiagramPrimatives from './DiagramPrimatives/DiagramPrimatives';
import DiagramEquation from './DiagramEquation/DiagramEquation';
import DiagramObjects from './DiagramObjects/DiagramObjects';
import addElements from './DiagramAddElements/addElements';
import type { TypeAddElementObject } from './DiagramAddElements/addElements';

export type TypeDiagramOptions = {
  htmlId?: string,
  limits?: Rect,
  backgroundColor?: Array<number>,
  fontScale?: number,
  elements?: DiagramElementCollection;
};

export type TypeSpaceTransforms = {
  glToDiagram: Transform;
  diagramToGL: Transform;
  pixelToDiagram: Transform;
  diagramToPixel: Transform;
  pixelToGL: Transform;
  glToPixel: Transform;
  diagramToCSSPercent: Transform;
};
// There are several coordinate spaces that need to be considered for a
// diagram.
//
// In the simplest diagram, there will be in hierarchy:
//  - GL Canvas
//    - Diagram
//      - Element Collection
//        - Element Primative
//          - Drawing Object (e.g. shape, text) from primative vertices
//
// A shape is defined in Drawing Object space.
// It is then transformed by the element primative
// It is then transformed by the element colleciton
// It is then transformed by the diagram
// it is then transformed into GL Space
//
// Diagram elements can also be rendered to an image in a HTML 2D canvas
// element. To do so, pass in:
//    - Diagram Element (primative or collection) to render
//    - HTML element (which is a 2D canvas)
//    - Window of diagram to render
//    - Window scaling (how does the window fit within the HTML Element)
//      - fit: diagram units will be scaled so that diagram window limits
//             aspect ratio fits within the element aspect ratio
//      - 1em: diagram units will be scaled so 0.2 diagram units (default font
//             size) looks like 1em of the html element font size in pixels
//      - 10px: diagram units will be scaled so that the max diagram window
//              limit will be the pixel count
//      - strech: diagram units will be scaled so that the diagram window
//                limits will be stretched to fit the html element width
//                and height
// Then the process is:
//    - html element size in pixels and aspect ratio found
//    - html element size in gl coordinates found

class Diagram {
  htmlId: string;
  canvasLow: HTMLCanvasElement;
  canvasOffscreen: HTMLCanvasElement;
  // canvasHigh: HTMLCanvasElement;
  textCanvasLow: HTMLCanvasElement;
  container: HTMLElement;
  // textCanvasHigh: HTMLCanvasElement;
  draw2DLow: DrawContext2D;
  // draw2DHigh: DrawContext2D;
  htmlCanvas: HTMLElement;
  webglLow: WebGLInstance;
  webglOffscreen: WebGLInstance;
  // webglHigh: WebGLInstance;
  gestureCanvas: HTMLElement;

  elements: DiagramElementCollection;
  globalAnimation: GlobalAnimation;
  gesture: Gesture;
  inTransition: boolean;
  beingMovedElements: Array<DiagramElementPrimative |
                      DiagramElementCollection>;

  beingTouchedElements: Array<DiagramElementPrimative |
                        DiagramElementCollection>;

  moveTopElementOnly: boolean;

  limits: Rect;

  // gestureElement: HTMLElement;
  shapes: Object;
  shapesLow: Object;
  // shapesHigh: Object;
  equation: Object;
  equationLow: Object;
  // equationHigh: Object;
  objects: DiagramObjects;
  objectsLow: DiagramObjects;
  // objectsHigh: DiagramObjects;

  backgroundColor: Array<number>;
  fontScale: number;
  // layout: Object;

  spaceTransforms: {
    glToDiagram: Transform;
    diagramToGL: Transform;
    pixelToDiagram: Transform;
    diagramToPixel: Transform;
    pixelToGL: Transform;
    glToPixel: Transform;
    diagramToCSSPercent: Transform;
  };

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
  // updateFontSize: string;

  isTouchDevice: boolean;

  constructor(
    options: TypeDiagramOptions,
  ) {
    const defaultOptions = {
      htmlId: 'id_figureone_canvases',
      limits: new Rect(-1, -1, 2, 2),
      backgroundColor: [1, 1, 1, 1],
      fontScale: 1,
      // updateFontSize: '',
    };
    this.scrolled = false;
    // this.oldScrollY = 0;
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const {
      htmlId, backgroundColor, limits,
    } = optionsToUse;
    this.htmlId = htmlId;
    // this.layout = layout;
    if (typeof htmlId === 'string') {
      const container = document.getElementById(htmlId);
      if (container instanceof HTMLElement) {
        this.container = container;
        const { children } = container;
        for (let i = 0; i < children.length; i += 1) {
          const child = children[i];
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('diagram__gl')) {
            this.canvasLow = child;
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('diagram__gl__offscreen')) {
            this.canvasOffscreen = child;
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('diagram__text')) {
            this.textCanvasLow = child;
          }
          if (child.classList.contains('diagram__html')
          ) {
            this.htmlCanvas = child;
          }
        }
        this.backgroundColor = backgroundColor;
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

    if (this instanceof Diagram) {
      this.gesture = new Gesture(this);
    }

    this.fontScale = optionsToUse.fontScale;
    this.updateLimits(limits);
    this.drawQueued = false;
    this.lastDrawTime = 0;
    this.inTransition = false;
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    this.moveTopElementOnly = true;
    this.globalAnimation = new GlobalAnimation();
    this.shapesLow = this.getShapes();
    // this.shapesHigh = this.getShapes(true);
    this.shapes = this.shapesLow;
    this.equationLow = this.getEquations();
    // this.equationHigh = this.getEquations(true);
    this.equation = this.equationLow;
    this.objectsLow = this.getObjects();
    // this.objectsHigh = this.getObjects(true);
    this.objects = this.objectsLow;
    this.createDiagramElements();
    if (this.elements.name === '') {
      this.elements.name = 'diagramRoot';
    }

    // this.updateFontSize = optionsToUse.updateFontSize;

    window.addEventListener('resize', this.resize.bind(this));
    this.sizeHtmlText();
    this.initialize();
    this.isTouchDevice = isTouchDevice();
    this.animateNextFrame(true, 'first frame');
    if (optionsToUse.elements) {
      // eslint-disable-next-line new-cap
      this.elements = new optionsToUse.elements(this);
      this.elements.diagramLimits = this.limits;
    }
    this.waitForFrames = 0;
    this.scrollingFast = false;
    this.scrollTimeoutId = null;
    this.drawTimeoutId = null;
    this.oldScroll = window.pageYOffset;
    this.drawAnimationFrames = 0;
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

  addElements(
    rootCollection: DiagramElementCollection,
    layout: Array<TypeAddElementObject>,
    addElementsKey: string = 'addElements',
  ) {
    addElements(
      this.shapes,
      this.equation,
      this.objects,
      rootCollection,
      layout,
      addElementsKey,
    );
  }

  getShapes() {
    const webgl = [this.webglLow];
    if (this.webglOffscreen) {
      webgl.push(this.webglOffscreen);
    }
    const draw2D = this.draw2DLow;
    // if (high) {
    //   webgl = this.webglHigh;
    //   draw2D = this.draw2DHigh;
    // }
    return new DiagramPrimatives(
      webgl, draw2D,
      // this.draw2DFigures,
      this.htmlCanvas,
      this.limits,
      this.spaceTransforms,
      this.animateNextFrame.bind(this, true, 'getShapes'),
    );
  }

  getEquations() {
    const shapes = this.shapesLow;
    // if (high) {
    //   shapes = this.shapesHigh;
    // }
    return new DiagramEquation(shapes, this.animateNextFrame.bind(this, true, 'equations'));
  }

  getObjects() {
    const shapes = this.shapesLow;
    const equation = this.equationLow;
    // if (high) {
    //   shapes = this.shapesHigh;
    //   equation = this.equationHigh;
    // }
    return new DiagramObjects(
      shapes,
      equation,
      this.isTouchDevice,
      this.animateNextFrame.bind(this, true, 'objects'),
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
    const diagramSpace = {
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
      diagramToGL: spaceToSpaceTransform(diagramSpace, glSpace, 'Diagram'),
      glToDiagram: spaceToSpaceTransform(glSpace, diagramSpace),
      pixelToDiagram: spaceToSpaceTransform(pixelSpace, diagramSpace),
      diagramToPixel: spaceToSpaceTransform(diagramSpace, pixelSpace),
      pixelToGL: spaceToSpaceTransform(pixelSpace, glSpace),
      glToPixel: spaceToSpaceTransform(glSpace, pixelSpace),
      diagramToCSSPercent: spaceToSpaceTransform(diagramSpace, percentSpace),
    };
  }

  initialize() {
    // this.setSpaceTransforms();
    this.setFirstTransform();
  }

  setFirstTransform() {
    this.elements.setFirstTransform(this.spaceTransforms.diagramToGL);
  }

  updateLimits(limits: Rect) {
    this.limits = limits._dup();
    this.setSpaceTransforms();
  }

  // Renders all tied elements in the first level of diagram elements
  renderAllElementsToTiedCanvases(force: boolean = false) {
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
      this.draw(-1);
    }
  }

  renderElementToTiedCanvas(elementName: string) {
    // record visibility of top level elements in diagram
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
    elementToRender.updateHTMLElementTie(this.canvasOffscreen);
    elementToRender.setPosition(0, 0);
    // elementToRender.updateHTMLElementTieScale(this.canvasLow);
    // Stop animations and render
    elementToRender.isRenderedAsImage = false;
    elementToRender.stop(true, true);
    
    this.renderToCanvas(elementToRender.tieToHTML.element);
    elementToRender.isRenderedAsImage = true;
    // reset position
    elementToRender.setPosition(oldPosition);
    elementToRender.setScale(oldScale);
    // elementToRender.updateHTMLElementTie(this.canvasLow);
    // this.draw(-1);
    // this.fromWhere = 'reset Position';
    // elementToRender.hide();

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

    // if (!(htmlCanvas instanceof HTMLImageElement)) {
    //   return;
    // }

    this.drawQueued = true;
    // this.fromWhere = 'RenderToCanvas';
    // console.log('drawing')
    this.draw(-1, 1);
    // console.log('done');

    // const { ctx } = new DrawContext2D(htmlCanvas);

    const getDimensions = (c: HTMLElement) => ({
      // width: c.width,
      // height: c.height,
      clientWidth: c.clientWidth,
      clientHeight: c.clientHeight,
    });

    const canvas = getDimensions(htmlCanvas);
    const gl = getDimensions(this.webglOffscreen.gl.canvas);
    const text = getDimensions(this.draw2DLow.canvas);

    // const glWidthOfCanvas = canvas.clientWidth / gl.clientWidth * gl.width;
    // const glHeightOfCanvas = canvas.clientHeight / gl.clientHeight * gl.height;
    // const glStartOfCanavas = new Point(
    //   gl.width / 2 - glWidthOfCanvas / 2,
    //   gl.height / 2 - glHeightOfCanvas / 2,
    // );

    // const textWidthOfCanvas = canvas.clientWidth / text.clientWidth
    //                           * text.width;
    // const textHeightOfCanvas = canvas.clientHeight / text.clientHeight
    //                            * text.height;
    // const textStartOfCanvas = new Point(
    //   text.width / 2 - textWidthOfCanvas / 2,
    //   text.height / 2 - textHeightOfCanvas / 2,
    // );
    // console.log(gl.clientWidth, canvas.clientWidth, this.webglLow.gl.canvas.clientWidth, this.webglLow.gl.canvas.width, this.webglLow.gl.canvas.offsetWidth)
    const w = document.getElementById(`${htmlCanvasElementOrId}_webgl`);
    if (w instanceof HTMLImageElement) {
      w.src = this.webglOffscreen.gl.canvas.toDataURL('image/png', 0.5);
      // w.src = offscreenCanvas.toDataURL();
      w.style.visibility = 'visible';
      w.style.transform = `scale(${gl.clientWidth / canvas.clientWidth},${gl.clientHeight / canvas.clientHeight})`;
      // w.style.transform = `scale(1,${gl.clientHeight / canvas.clientHeight})`;
    }


    const d = document.getElementById(`${htmlCanvasElementOrId}_2d`);
    if (d instanceof HTMLImageElement) {
      d.src = this.draw2DLow.canvas.toDataURL('image/png', 0.5);
      d.style.visibility = 'visible';
      d.style.transform = `scale(${text.clientWidth / canvas.clientWidth},${text.clientHeight / canvas.clientHeight})`;
      // d.style.transform = `scale(1,${text.clientHeight / canvas.clientHeight})`;
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
    // console.log('resize', fromWgere, event)
    // if (this.elements != null) {
    //   this.elements.updateLimits(this.limits, this.spaceTransforms);
    // }
    // if (this.count == null) {
    //   this.count = 0;
    // } else {
    //   this.count += 1
    // }
    // console.log('resize')
    // if (this.count > 2) {
    //   console.log('unrender')
    //   this.elements.unrenderAll();
    // }
    // console.log('before webgl')
    this.webglLow.resize();
    // console.log('after webgl')
    // this.webglHigh.resize();
    this.draw2DLow.resize();
    // this.draw2DHigh.resize();
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
      // this.renderAllElementsToTiedCanvases(true);
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

  // Handle touch down, or mouse click events within the canvas.
  // The default behavior is to be able to move objects that are touched
  // and dragged, then when they are released, for them to move freely before
  // coming to a stop.
  touchDownHandler(clientPoint: Point) {
    if (this.inTransition) {
      return false;
    }

    // Get the touched point in clip space
    const pixelPoint = this.clientToPixel(clientPoint);
    // console.log(pixelPoint)
    const glPoint = pixelPoint.transformBy(this.spaceTransforms.pixelToGL.matrix());

    // console.log(glPoint.transformBy(this.glToDiagramSpaceTransform.matrix()))
    // const clipPoint = this.clientToClip(clientPoint);

    // Get all the diagram elements that were touched at this point (element
    // must have isTouchable = true to be considered)
    this.beingTouchedElements = this.elements.getTouched(glPoint);
    if (this.moveTopElementOnly) {
      if (this.beingTouchedElements.length > 0) {
        this.beingTouchedElements[0].click();
      }
    } else {
      this.beingTouchedElements.forEach(e => e.click());
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

  // Handle touch up, or mouse click up events in the canvas. When an UP even
  // happens, the default behavior is to let any elements being moved to move
  // freely until they decelerate to 0.
  touchUpHandler() {
    // console.log("before", this.elements._circle.transform.t())
    // console.log(this.beingMovedElements)
    for (let i = 0; i < this.beingMovedElements.length; i += 1) {
      const element = this.beingMovedElements[i];
      if (element.state.isBeingMoved) {
        element.stopBeingMoved();
        element.startMovingFreely();
      }
    }
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    // console.log("after", this.elements._circle.transform.t())
  }

  rotateElement(
    element: DiagramElementPrimative | DiagramElementCollection,
    previousClientPoint: Point,
    currentClientPoint: Point,
  ) {
    let centerDiagramSpace = element.getDiagramPosition();
    if (centerDiagramSpace == null) {
      centerDiagramSpace = new Point(0, 0);
    }
    const center = centerDiagramSpace
      .transformBy(this.spaceTransforms.diagramToPixel.matrix());
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    // const previousDiagramPoint =
    //   previousPixelPoint.transformBy(this.pixelToDiagramSpaceTransform.matrix());
    // const currentDiagramPoint =
    //   currentPixelPoint.transformBy(this.pixelToDiagramSpaceTransform.matrix());
    // const currentAngle = Math.atan2(
    //   currentDiagramPoint.y - center.y,
    //   currentDiagramPoint.x - center.x,
    // );
    // const previousAngle = Math.atan2(
    //   previousDiagramPoint.y - center.y,
    //   previousDiagramPoint.x - center.x,
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
    element: DiagramElementPrimative | DiagramElementCollection,
    previousClientPoint: Point,
    currentClientPoint: Point,
  ) {
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    const previousDiagramPoint =
      previousPixelPoint.transformBy(this.spaceTransforms.pixelToDiagram.matrix());
    const currentDiagramPoint =
      currentPixelPoint.transformBy(this.spaceTransforms.pixelToDiagram.matrix());
    const m = element.diagramSpaceToVertexSpaceTransformMatrix();

    const currentVertexSpacePoint = currentDiagramPoint.transformBy(m);
    const previousVertexSpacePoint = previousDiagramPoint.transformBy(m);
    // const delta = currentDiagramPoint.sub(previousDiagramPoint);
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
    element: DiagramElementPrimative | DiagramElementCollection,
    previousClientPoint: Point,
    currentClientPoint: Point,
    type: 'x' | 'y' | '' = '',
  ) {
    const previousPixelPoint = this.clientToPixel(previousClientPoint);
    const currentPixelPoint = this.clientToPixel(currentClientPoint);

    // const previousDiagramPoint =
    //   previousPixelPoint.transformBy(this.pixelToDiagramSpaceTransform.matrix());
    // const currentDiagramPoint =
    //   currentPixelPoint.transformBy(this.pixelToDiagramSpaceTransform.matrix());

    // const center = element.getDiagramPosition();
    // const previousMag = previousDiagramPoint.sub(center).distance();
    // const currentMag = currentDiagramPoint.sub(center).distance();
    const center = element.getDiagramPosition()
      .transformBy(this.spaceTransforms.diagramToPixel.matrix());
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

  // Handle touch/mouse move events in the canvas. These events will only be
  // sent if the initial touch down happened in the canvas.
  // The default behavior is to drag (move) any objects that were touched in
  // the down event to the new location.
  // This function should return true if the move event should NOT be processed
  // by the system. For example, on a touch device, a touch and drag would
  // normally scroll the screen. Typically, you would want to move the diagram
  // element and not the screen, so a true would be returned.
  touchMoveHandler(previousClientPoint: Point, currentClientPoint: Point): boolean {
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
              || element.move.canBeMovedAfterLoosingTouch) {
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

  stop(cancelled: boolean = true, forceSetToEndOfPlan: boolean = false) {
    this.elements.stop(cancelled, forceSetToEndOfPlan);
  }

  // To add elements to a diagram, either this method can be overridden,
  // or the `add` method can be used.
  createDiagramElements() {
    // $FlowFixMe
    this.elements = new DiagramElementCollection();
    this.elements.diagramLimits = this.limits;
  }

  add(
    name: string,
    diagramElement: DiagramElementPrimative | DiagramElementCollection,
  ) {
    this.elements.add(name, diagramElement);
  }

  setElementsToCollection(collection: DiagramElementCollection) {
    this.elements = collection;
    this.setFirstTransform();
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
    this.elements.clear();
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

  draw(nowIn: number, canvasIndex: number = 0): void {
    let now = nowIn;
    if (nowIn === -1) {
      now = this.lastDrawTime;
    }
    // console.log((now - this.lastDrawTime) * 1000);
    this.lastDrawTime = now;

    if (this.scrolled === true) {
      this.scrolled = false;
      if (Math.abs(window.pageYOffset - this.oldScroll)
          > this.webglLow.gl.canvas.clientHeight / 4
      ) {
        if (this.webglLow.gl.canvas.style.top !== '-10000px') {
          this.webglLow.gl.canvas.style.top = '-10000px';
          this.waitForFrames = 1;
        }
        if (this.waitForFrames > 0) {
          this.waitForFrames -= 1;
        } else {
          this.renderAllElementsToTiedCanvases();
        }
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
    this.elements.draw(
      this.spaceTransforms.diagramToGL,
      now,
      canvasIndex,
    );
    // console.log('really done')


    if (this.elements.isMoving()) {
      this.animateNextFrame(true, 'is moving');
    }

    if (this.drawAnimationFrames > 0) {
      this.drawAnimationFrames -= 1;
      this.animateNextFrame(true, 'queued frames');
    }

    // if (this.drawTimeoutId) {
    //   clearTimeout(this.drawTimeoutId);
    //   this.drawTimeoutId = null;
    // }
    // this.drawTimeoutId = setTimeout(this.renderToImages.bind(this), 100);
  }

  // renderToImages() {
  //   console.log('visibility1')
  //   this.drawTimeoutId = null;
  //   if (this.webglLow.gl.canvas.style.top !== '-10000px') {
  //     this.webglLow.gl.canvas.style.top = '-10000px';
  //     this.waitForFrames = 1;
  //   }
  //   this.renderAllElementsToTiedCanvases();
  //   this.centerDrawingLens();
  //   this.webglLow.gl.canvas.style.visibility = 'visible';
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
    return this.elements.isMoving();
  }

  clientToPixel(clientLocation: Point): Point {
    const canvas = this.canvasLow.getBoundingClientRect();
    return new Point(
      clientLocation.x - canvas.left,
      clientLocation.y - canvas.top,
    );
  }
}

export default Diagram;
