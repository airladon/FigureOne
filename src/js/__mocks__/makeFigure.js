// import {
//   FigureElementPrimitive,
//   FigureElementCollection,
//   // AnimationPhase,
// } from '../Element';
import Figure from '../figure/Figure';
import {
  Rect, getPoint, Point,
} from '../tools/g2';
import webgl from './WebGLInstanceMock';
import DrawContext2D from './DrawContext2DMock';
import * as tools from '../tools/tools';
import { round } from '../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../figure/Gesture');
jest.mock('../figure/webgl/webgl');
jest.mock('../figure/DrawContext2D');
jest.mock('../figure/DrawingObjects/HTMLObject/HTMLObject');

const generateRandomStringMock = jest.spyOn(tools, 'generateRandomString');
generateRandomStringMock.mockImplementation(() => '000000');

export default function makeFigure(
  inputCanvas = new Rect(100, -300, 1000, 500),
  inputLimits = new Rect(-1, -1, 2, 2),
) {
  document.body.innerHTML =
    '<div id="c">'
    + '  <canvas class="figureone__gl" id="id_figureone__gl__low">'
    + '  </canvas>'
    + '  <canvas class="figureone__text" id="id_figureone__text__low">'
    + '  </canvas>'
    + '  <div class="figureone__html">'
    + '  </div>'
    + '  <canvas class="figureone__gl" id="id_figureone__gl__high">'
    + '  </canvas>'
    + '  <canvas class="figureone__text" id="id_figureone__text__high">'
    + '  </canvas>'
    + '</div>';
  // canvas = document.getElementById('c');
  const definition = {
    width: inputCanvas.width,
    height: inputCanvas.height,
    limits: inputLimits,
  };

  const canvasMock = {
    width: definition.width,
    height: definition.height,
    // offsetLeft: 100,
    left: inputCanvas.left,
    // offsetTop: 200,
    top: inputCanvas.top,
    // width: definition.width,
    // height: definition.height,
    offsetWidth: definition.width,
    offsetHeight: definition.height,
    scrollLeft: 0,
    scrollTop: 0,
    // eslint-disable-next-line arrow-body-style
    getBoundingClientRect: () => {
      return {
        left: inputCanvas.left,
        top: inputCanvas.top,
        width: definition.width,
        height: definition.height,
      };
    },
  };
  const htmlCanvasMock = {
    style: {
      fontsize: 1,
    },
    offsetWidth: 100,
    appendChild: () => {},
  };
  const { limits } = definition;
  const figure = new Figure({ htmlId: 'c', limits, color: [1, 0, 0, 1] });
  figure.webglLow = webgl;
  figure.webglHigh = webgl;
  figure.webgl = webgl;
  figure.canvasLow = canvasMock;
  figure.canvasHigh = canvasMock;
  figure.htmlCanvas = htmlCanvasMock;
  figure.isTouchDevice = false;
  figure.draw2DLow = new DrawContext2D(definition.width, definition.height);
  figure.draw2DHigh = new DrawContext2D(definition.width, definition.height);
  figure.draw2D = figure.draw2DLow;
  figure.shapesLow = figure.getShapes(false);
  figure.shapesHigh = figure.getShapes(true);
  figure.shapes = figure.shapesLow;
  figure.primitives = figure.shapes;
  // figure.equationLow = figure.getEquations(false);
  // figure.equationHigh = figure.getEquations(true);
  figure.equation = figure.equationLow;
  figure.collectionsLow = figure.getObjects(false);
  figure.collectionsHigh = figure.getObjects(true);
  figure.collections = figure.collectionsLow;
  figure.setSpaceTransforms();
  figure.createFigureElements();
  figure.defaultLineWidth = 0.01;
  figure.primitives.defaultLineWidth = 0.01;
  // needed as the first element needs to be set with the space Transforms
  figure.initElements();
  figure.mock = {
    initialTime: 0,
    duration: 0,
    previousTouchPoint: new Point(0, 0),
    timersBeforeDraw: true,
    timeStep: (deltaTimeInSecondsIn, frameTimeIn = null, draw = true) => {
      const { duration, initialTime } = figure.mock;
      const deltaTimeInSeconds = round(deltaTimeInSecondsIn, 8);
      let frameTime = deltaTimeInSeconds;
      // let deltaTime = 0;
      if (frameTimeIn != null && frameTimeIn < deltaTimeInSeconds) {
        frameTime = frameTimeIn;
        // deltaTime = frameTime;
      }
      let deltaTime = frameTime;

      // let delta = Math.min(deltaTimeInSeconds, frameTime);
      let lastTime = 0;
      deltaTime = round(deltaTime, 8);
      while (deltaTime <= round(deltaTimeInSeconds, 8)) {
        const newNow = round((duration + deltaTime + initialTime) * 1000, 8);
        global.performance.now = () => newNow;
        if (figure.mock.timersBeforeDraw) {
          jest.advanceTimersByTime(round((deltaTime - lastTime) * 1000, 8));
        }
        if (draw) {
          figure.draw(round(newNow / 1000, 8));
        }
        if (!figure.mock.timersBeforeDraw) {
          jest.advanceTimersByTime(round((deltaTime - lastTime) * 1000, 8));
        }
        lastTime = deltaTime;
        if (deltaTime === deltaTimeInSeconds || frameTime === 0) {
          deltaTime += 1;
        } else if (deltaTime + frameTime > deltaTimeInSeconds) {
          deltaTime = deltaTimeInSeconds;
        } else {
          deltaTime += frameTime;
        }
        deltaTime = round(deltaTime, 8);
      }
      figure.mock.duration += deltaTimeInSeconds;
    },
    touchDown: (figurePosition) => {
      const p = getPoint(figurePosition);
      figure.touchDownHandler(p);
      figure.mock.previousTouchPoint = p;
      // const pixelPoint = p.transformBy(figure.spaceTransforms.figureToPixel.m());
      // const clientPoint = figure.pixelToClient(pixelPoint);
      // figure.touchDownHandlerClient(clientPoint);
      // figure.mock.previousTouchPoint = clientPoint;
    },
    touchUp: () => {
      figure.touchUpHandler();
    },
    touchMove: (figurePosition) => {
      const p = getPoint(figurePosition);
      // const pixelPoint = p.transformBy(figure.spaceTransforms.figureToPixel.m());
      // const clientPoint = figure.pixelToClient(pixelPoint);
      figure.touchMoveHandler(figure.mock.previousTouchPoint, p);
      figure.mock.previousTouchPoint = p;
    },
  };
  figure.timeKeeper.reset();
  return figure;
}

