// import {
//   DiagramElementPrimitive,
//   DiagramElementCollection,
//   // AnimationPhase,
// } from '../Element';
import Diagram from '../diagram/Diagram';
import {
  Rect, getPoint, Point,
} from '../tools/g2';
import webgl from './WebGLInstanceMock';
import DrawContext2D from './DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import * as tools from '../tools/tools';
import { round } from '../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../diagram/Gesture');
jest.mock('../diagram/webgl/webgl');
jest.mock('../diagram/DrawContext2D');
jest.mock('../diagram/DrawingObjects/HTMLObject/HTMLObject');

const generateRandomStringMock = jest.spyOn(tools, 'generateRandomString');
generateRandomStringMock.mockImplementation(() => '000000');

export default function makeDiagram(
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
  const diagram = new Diagram({ htmlId: 'c', limits });
  diagram.webglLow = webgl;
  diagram.webglHigh = webgl;
  diagram.webgl = webgl;
  diagram.canvasLow = canvasMock;
  diagram.canvasHigh = canvasMock;
  diagram.htmlCanvas = htmlCanvasMock;
  diagram.isTouchDevice = false;
  diagram.draw2DLow = new DrawContext2D(definition.width, definition.height);
  diagram.draw2DHigh = new DrawContext2D(definition.width, definition.height);
  diagram.draw2D = diagram.draw2DLow;
  diagram.shapesLow = diagram.getShapes(false);
  diagram.shapesHigh = diagram.getShapes(true);
  diagram.shapes = diagram.shapesLow;
  diagram.equationLow = diagram.getEquations(false);
  diagram.equationHigh = diagram.getEquations(true);
  diagram.equation = diagram.equationLow;
  diagram.advancedLow = diagram.getObjects(false);
  diagram.advancedHigh = diagram.getObjects(true);
  diagram.advanced = diagram.advancedLow;
  diagram.setSpaceTransforms();
  // needed as the first element needs to be set with the space Transforms
  diagram.initElements();
  diagram.mock = {
    initialTime: 0,
    duration: 0,
    previousTouchPoint: new Point(0, 0),
    timersBeforeDraw: true,
    timeStep: (deltaTimeInSecondsIn, frameTimeIn = null) => {
      const { duration, initialTime } = diagram.mock;
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
        // if (window.asdf) {
        //   console.log(duration, deltaTime + 0.00);
        // }
        const newNow = round((duration + deltaTime + initialTime) * 1000, 8);
        global.performance.now = () => newNow;
        if (diagram.mock.timersBeforeDraw) {
          jest.advanceTimersByTime(round((deltaTime - lastTime) * 1000, 8));
        }
        diagram.animateNextFrame();
        diagram.draw(round(newNow / 1000, 8));
        if (!diagram.mock.timersBeforeDraw) {
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
      diagram.mock.duration += deltaTimeInSeconds;
    },
    touchDown: (diagramPosition) => {
      const p = getPoint(diagramPosition);
      const pixelPoint = p.transformBy(diagram.spaceTransforms.diagramToPixel.m());
      const clientPoint = diagram.pixelToClient(pixelPoint);
      diagram.touchDownHandler(clientPoint);
      diagram.mock.previousTouchPoint = clientPoint;
    },
    touchUp: () => {
      diagram.touchUpHandler();
    },
    touchMove: (diagramPosition) => {
      const p = getPoint(diagramPosition);
      const pixelPoint = p.transformBy(diagram.spaceTransforms.diagramToPixel.m());
      const clientPoint = diagram.pixelToClient(pixelPoint);
      diagram.touchMoveHandler(diagram.mock.previousTouchPoint, clientPoint);
      diagram.mock.previousTouchPoint = clientPoint;
    },
  };
  diagram.globalAnimation.reset();
  return diagram;
}

