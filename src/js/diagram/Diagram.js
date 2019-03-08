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
  // vertexShader?: string,
  // fragmentShader?: string,
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
//    - 
class Diagram {
  canvasLow: HTMLCanvasElement;
  canvasHigh: HTMLCanvasElement;
  textCanvasLow: HTMLCanvasElement;
  textCanvasHigh: HTMLCanvasElement;
  draw2DLow: DrawContext2D;
  draw2DHigh: DrawContext2D;
  htmlCanvas: HTMLElement;
  webglLow: WebGLInstance;
  webglHigh: WebGLInstance;
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
  shapesHigh: Object;
  equation: Object;
  equationLow: Object;
  equationHigh: Object;
  objects: DiagramObjects;
  objectsLow: DiagramObjects;
  objectsHigh: DiagramObjects;
  // addElements: DiagramAddElements;
  // addElementsLow: DiagramAddElements;
  // addElementsHigh: DiagramAddElements;

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

  scrolled: boolean;
  oldScrollY: number;
  lastDrawTime: number;
  // draw2DFigures: Object;

  // glToDiagramSpaceTransform: Transform;
  // diagramToGLSpaceTransform: Transform;
  // pixelToDiagramSpaceTransform: Transform;
  // diagramToPixelSpaceTransform: Transform;
  // pixelToGLSpaceTransform: Transform;
  // glToPixelSpaceTransform: Transform;
  // diagramToCSSPercentSpaceTransform: Transform;

  // glToDiagramSpaceScale: Point;
  // diagramToGLSpaceScale: Point;
  // pixelToDiagramSpaceScale: Point;
  // diagramToPixelSpaceScale: Point;
  // glToPixelSpaceScale: Point;
  // pixelToGLSpaceScale: Point;

  drawQueued: boolean;

  isTouchDevice: boolean;

  constructor(
    // canvas: HTMLCanvasElement,
    options: TypeDiagramOptions,
    // limitsOrxMin: number | Rect = new Rect(-1, -1, 2, 2),
    // yMin: number = -1,
    // width: number = 2,
    // height: number = 2,
    // backgroundColor: Array<number> = [1, 1, 1, 1],
    // layout: Object = {},
    // vertexShader: string = 'simple',
    // fragmentShader: string = 'simple',
  ) {
    const defaultOptions = {
      htmlId: 'id_figureone_canvases',
      limits: new Rect(-1, -1, 2, 2),
      backgroundColor: [1, 1, 1, 1],
      // layout: {},
      // vertexShader: 'simple',
      // fragmentShader: 'simple',
      fontScale: 1,
    };
    this.scrolled = false;
    this.oldScrollY = 0;
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const {
      htmlId, backgroundColor, limits,
    } = optionsToUse;
    // if (typeof containerIdOrOptions !== 'string') {
    //   optionsToUse = joinObjects(
    //     defaultOptions, containerIdOrOptions,
    //   );
    // } else {
    //   optionsToUse.htmlId = containerIdOrOptions;
    //   if (typeof limitsOrxMin === 'number') {
    //     optionsToUse.limits = new Rect(
    //       limitsOrxMin,
    //       yMin,
    //       width,
    //       height,
    //     );
    //   } else {
    //     optionsToUse.limits = limitsOrxMin;
    //   }
    //   optionsToUse.backgroundColor = backgroundColor;
    //   optionsToUse.layout = layout;
    //   optionsToUse.vertexShader = vertexShader;
    //   optionsToUse.fragmentShader = fragmentShader;
    // }
    // this.layout = layout;
    if (typeof htmlId === 'string') {
      const container = document.getElementById(htmlId);
      if (container instanceof HTMLElement) {
        const { children } = container;
        for (let i = 0; i < children.length; i += 1) {
          const child = children[i];
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('diagram__gl')) {
            if (child.id === 'id_diagram__gl__low') {
              this.canvasLow = child;
            }
            if (child.id === 'id_diagram__gl__high') {
              this.canvasHigh = child;
            }
          }
          if (child instanceof HTMLCanvasElement
            && child.classList.contains('diagram__text')) {
            if (child.id === 'id_diagram__text__low') {
              this.textCanvasLow = child;
            }
            if (child.id === 'id_diagram__text__high') {
              this.textCanvasHigh = child;
            }
          }
          if (child.classList.contains('diagram__html')
          ) {
            this.htmlCanvas = child;
          }
          // if (child.classList.contains('diagram__gesture')) {
          //   this.gestureElement = child;
          // }
        }
        this.backgroundColor = backgroundColor;
        // const shaders = getShaders(vertexShader, fragmentShader);
        const webglLow = new WebGLInstance(
          this.canvasLow,
          // shaders.vertexSource,
          // shaders.fragmentSource,
          // shaders.varNames,
          this.backgroundColor,
        );
        const webglHigh = new WebGLInstance(
          this.canvasHigh,
          // shaders.vertexSource,
          // shaders.fragmentSource,
          // shaders.varNames,
          this.backgroundColor,
        );
        this.webglLow = webglLow;
        this.webglHigh = webglHigh;
        // const draw2D = this.textCanvas.getContext('2d');
        this.draw2DLow = new DrawContext2D(this.textCanvasLow);
        this.draw2DHigh = new DrawContext2D(this.textCanvasHigh);
      }
    }

    // for (let i = 0; i < canvas2Ds.length; i += 1) {
    //   const canvas = canvas2Ds[i];
    //   console.log(i, canvas)
    //   if (canvas instanceof HTMLCanvasElement) {
    //     const draw2D = new DrawContext2D(canvas);
    //     const { id } = canvas;
    //     this.draw2DFigures[id] = draw2D;
    //   }
    // }
    if (optionsToUse.gestureCanvas != null) {
      const gestureCanvas = document.getElementById(optionsToUse.gestureCanvas);
      if (gestureCanvas != null) {
        this.gestureCanvas = gestureCanvas;
      }
    }
    if (this.gestureCanvas == null) {
      this.gestureCanvas = this.htmlCanvas;
    }
    // if (this.textCanvas instanceof HTMLCanvasElement) {
    //   this.draw2D = new DrawContext2D(this.textCanvas);
    // }
    if (this instanceof Diagram) {
      this.gesture = new Gesture(this);
    }

    this.fontScale = optionsToUse.fontScale;
    // let limits;
    // if (limitsOrxMin instanceof Rect) {
    //   const r = limitsOrxMin;
    //   limits = new Rect(r.left, r.bottom, r.width, r.height);
    // } else {
    //   limits = new Rect(limitsOrxMin, yMin, width, height);
    // }
    this.updateLimits(limits);
    this.drawQueued = false;
    this.lastDrawTime = 0;
    this.inTransition = false;
    // console.log(this.limits)
    this.beingMovedElements = [];
    this.beingTouchedElements = [];
    this.moveTopElementOnly = true;
    this.globalAnimation = new GlobalAnimation();
    this.shapesLow = this.getShapes(false);
    this.shapesHigh = this.getShapes(true);
    this.shapes = this.shapesLow;
    this.equationLow = this.getEquations(false);
    this.equationHigh = this.getEquations(true);
    this.equation = this.equationLow;
    this.objectsLow = this.getObjects(false);
    this.objectsHigh = this.getObjects(true);
    this.objects = this.objectsLow;
    // this.addElementsLow = this.getAddElements(false);
    // this.addElementsHigh = this.getAddElements(true);
    // this.addElements = this.getAddElements();
    this.createDiagramElements();
    if (this.elements.name === '') {
      this.elements.name = 'diagramRoot';
    }

    window.addEventListener('resize', this.resize.bind(this));
    this.sizeHtmlText();
    this.initialize();
    this.isTouchDevice = isTouchDevice();
    this.animateNextFrame();
    if (optionsToUse.elements) {
      // eslint-disable-next-line new-cap
      this.elements = new optionsToUse.elements(this);
      this.elements.diagramLimits = this.limits;
    }
  }

  // getFigureCanvases() {
  //   const canvas2Ds = document.getElementsByClassName('single_page_lesson__figure');
  //   console.log(canvas2Ds, canvas2Ds.length)
  //   this.draw2DFigures = {};
  //   // var list= document.getElementsByClassName("events");
  //   [].forEach.call(canvas2Ds, (canvas) => {
  //     console.log(canvas)
  //     if (canvas instanceof HTMLCanvasElement) {
  //       const draw2D = new DrawContext2D(canvas);
  //       const { id } = canvas;
  //       this.draw2DFigures[id] = draw2D;
  //     }
  //   });
  // }

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

  getShapes(high: boolean = false) {
    let webgl = this.webglLow;
    let draw2D = this.draw2DLow;
    if (high) {
      webgl = this.webglHigh;
      draw2D = this.draw2DHigh;
    }
    return new DiagramPrimatives(
      webgl, draw2D,
      // this.draw2DFigures,
      this.htmlCanvas,
      this.limits,
      this.spaceTransforms,
      this.animateNextFrame.bind(this),
    );
  }

  getEquations(high: boolean = false) {
    let shapes = this.shapesLow;
    if (high) {
      shapes = this.shapesHigh;
    }
    return new DiagramEquation(shapes, this.animateNextFrame.bind(this));
  }

  getObjects(high: boolean = false) {
    let shapes = this.shapesLow;
    let equation = this.equationLow;
    if (high) {
      shapes = this.shapesHigh;
      equation = this.equationHigh;
    }
    return new DiagramObjects(
      shapes,
      equation,
      this.isTouchDevice,
      this.animateNextFrame.bind(this),
    );
  }

  // getAddElements(high: boolean = false) {
  //   let shapes = this.shapesLow;
  //   let objects = this.objectsLow;
  //   let equation = this.equationLow;
  //   if (high) {
  //     shapes = this.shapesHigh;
  //     objects = this.objectsHigh;
  //     equation = this.equationHigh;
  //   }
  //   return new DiagramAddElements(
  //     shapes,
  //     objects,
  //     equation,
  //   );
  // }

  sizeHtmlText() {
    const scale = this.fontScale * 1 / 35;
    const size = this.htmlCanvas.offsetWidth * scale - 1;
    this.htmlCanvas.style.fontSize = `${size}px`;

    const style = window.getComputedStyle(document.documentElement);
    if (style) {
      const prop = '--lesson__diagram-font-size';
      const docElem = document.documentElement;
      if (docElem) {
        docElem.style.setProperty(prop, `${size}px`);
      }
    }
  }

  destroy() {
    this.gesture.destroy();
    this.webglLow.gl.getExtension('WEBGL_lose_context').loseContext();
    this.webglHigh.gl.getExtension('WEBGL_lose_context').loseContext();
  }

  // setGLDiagramSpaceTransforms() {
  //   const glSpace = {
  //     x: { bottomLeft: -1, width: 2 },
  //     y: { bottomLeft: -1, height: 2 },
  //   };
  //   const diagramSpace = {
  //     x: { bottomLeft: this.limits.left, width: this.limits.width },
  //     y: { bottomLeft: this.limits.bottom, height: this.limits.height },
  //   };

  //   this.diagramToGLSpaceTransformMatrix =
  //     spaceToSpaceTransformMatrix(glSpace, diagramSpace);
  //   this.glToDiagramSpaceTransformMatrix =
  //     spaceToSpaceTransformMatrix(diagramSpace, glSpace);
  // }

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

  renderToCanvas(
    canvas: HTMLCanvasElement,
    diagramWindow: Rect,
    x,
    y,
    width,
    height,
  ) {
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const windowSpace = {
      x: { bottomLeft: diagramWindow.left, width: diagramWindow.width },
      y: { bottomLeft: diagramWindow.bottom, height: diagramWindow.height },
    };
    const windowToGL = spaceToSpaceTransform(windowSpace, glSpace);
    this.draw(-1, windowToGL);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.webglLow.gl.canvas, x, y, width, height, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.draw2DLow.canvas, x, y, width, height, 0, 0, canvas.width, canvas.height);
  }

  resize() {
    if (this.elements != null) {
      this.elements.updateLimits(this.limits, this.spaceTransforms);
    }
    this.webglLow.resize();
    this.webglHigh.resize();
    this.draw2DLow.resize();
    this.draw2DHigh.resize();
    this.setSpaceTransforms();
    this.sizeHtmlText();
    this.elements.resizeHtmlObject();
    this.updateHTMLElementTie();
    this.elements.resize();
    this.animateNextFrame();
  }

  updateHTMLElementTie() {
    if (this.elements != null) {
      this.elements.updateHTMLElementTie(
        // this.pixelToDiagramSpaceTransform,
        // this.diagramToPixelSpaceScale,
        // this.diagramToGLSpaceTransform.m(),
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
      this.animateNextFrame();
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
    this.animateNextFrame();
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

  clearContext() {
    // const bc = this.backgroundColor;
    // this.webgl.gl.clearColor(bc[0], bc[1], bc[2], bc[3]);

    this.webglLow.gl.clearColor(0, 0, 0, 0);
    this.webglLow.gl.clear(this.webglLow.gl.COLOR_BUFFER_BIT);
    this.webglHigh.gl.clearColor(0, 0, 0, 0);
    this.webglHigh.gl.clear(this.webglHigh.gl.COLOR_BUFFER_BIT);
    // const t = new Date().getTime();
    this.elements.clear();
    // console.log('clear time', new Date().getTime() - t);
    // if (this.draw2DLow) {
    //   this.draw2DLow.ctx.clearRect(
    //     0, 0, this.draw2DLow.ctx.canvas.width,
    //     this.draw2DLow.ctx.canvas.height,
    //   );
    // }
    
    // if (this.draw2DHigh) {
    //   this.draw2DHigh.ctx.clearRect(
    //     0, 0, this.draw2DHigh.ctx.canvas.width,
    //     this.draw2DHigh.ctx.canvas.height,
    //   );
    // }
  }

  draw(now: number, diagramTransform: Transform = this.spaceTransforms.diagramToGL): void {
    if (now === -1) {
      now = this.lastDrawTime;
    } else {
      this.lastDrawTime = now;
    }

    // if (this.globalAnimation.previousNow == null) {
    //   this.globalAnimation.previousNow = now
    // }
    // console.log(this.scrolled)
    // if (this.webglLow.gl.canvas.style.display === 'none') {
    //   this.webglLow.gl.canvas.style.display = 'block';
    //   this.draw2DLow.canvas.style.display = 'block';
    //   this.resize();
    //   console.log('unhide')
    // }
    
    
    if (this.scrolled) {
      if (Math.abs(window.pageYOffset - this.oldScrollY) > this.webglLow.gl.canvas.clientHeight / 8) {
        const viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let newTop = window.pageYOffset + viewPortHeight / 2 - this.webglLow.gl.canvas.clientHeight / 2;

        // console.log('viewport', viewPortHeight)
        // console.log('gl canvas height', this.webglLow.gl.canvas.clientHeight)
        // console.log('old scroll', this.oldScrollY)
        // console.log('gl canvas position', this.webglLow.gl.canvas.getBoundingClientRect().top)
        // console.log('pageY Offset', window.pageYOffset)

        // console.log(newTop), window.pageYOffset, viewPortHeight, this.webglLow.gl.canvas.clientHeight)
        if (newTop < 0) {
          newTop = 0;
        }
        const oldTop = this.webglLow.gl.canvas.style.top;
        this.newTop = `${newTop}px`;
        // this.webglLow.gl.canvas.style.opacity = '0';
        // this.draw2DLow.canvas.style.opacity = '0';
        // this.clearContext();
        this.webglLow.gl.canvas.style.top = `${newTop}px`;
        this.draw2DLow.canvas.style.top = `${newTop}px`;
        this.resize();
        // this.webglLow.gl.canvas.style.top = oldTop;
        // this.draw2DLow.canvas.style.top = oldTop;
        // this.webglLow.gl.canvas.style.opacity = '1';
        this.oldScrollY = window.pageYOffset;
        this.drawQueued = true;
        this.changeTop = 1;
        // console.log('hide4')
      }
      // this.resize();
      
      // console.log(this.webgl)
      this.scrolled = false;
    }
    if (this.drawQueued === false) {
      return;
    }
    // const t = new Date().getTime();
    // console.log('time since last draw:', t - this.globalAnimation.diagramDrawStart)
    // this.globalAnimation.diagramDrawStart = t;

    this.drawQueued = false;
    this.clearContext();

    // console.log(now - this.globalAnimation.previousNow)
    // This transform converts standard gl clip space, to diagram clip space
    // defined in limits.
    // const normWidth = 2 / this.limits.width;
    // const normHeight = 2 / this.limits.height;
    // const clipTransform = new Transform()
    //   .scale(normWidth, normHeight)
    //   .translate(
    //     (-this.limits.width / 2 - this.limits.left) * normWidth,
    //     (this.limits.height / 2 - this.limits.top) * normHeight,
    //   );
    // const t1 = performance.now();
    this.elements.draw(
      diagramTransform,
      now,
    );


    if (this.elements.isMoving()) {
      this.animateNextFrame();
    }
    
    if (this.changeTop > 1) {
      this.changeTop -= 1;
    } else if (this.changeTop === 1) {
      // this.webglLow.gl.canvas.style.opacity = '1';
      // this.draw2DLow.canvas.style.opacity = '1';
      // this.webglLow.gl.canvas.style.top = `${this.newTop}px`;
      // this.draw2DLow.canvas.style.top = `${this.newTop}px`;
      // console.log('show4')
      this.changeTop = 0;
    }
    // console.log('draw end', new Date().getTime() - this.globalAnimation.diagramDrawStart);
  }

  animateNextFrame(draw: boolean = true) {
    if (!this.drawQueued) {
      if (draw) {
        this.drawQueued = true;
      }
      this.globalAnimation.queueNextFrame(this.draw.bind(this));
    }
  }

  isAnimating(): boolean {
    return this.elements.state.isAnimating;
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
