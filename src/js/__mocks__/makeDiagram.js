// import {
//   DiagramElementPrimitive,
//   DiagramElementCollection,
//   // AnimationPhase,
// } from '../Element';
import Diagram from '../diagram/Diagram';
import {
  Rect,
} from '../tools/g2';
import webgl from './WebGLInstanceMock';
import DrawContext2D from './DrawContext2DMock';
// import VertexPolygon from '../DrawingObjects/VertexObject/VertexPolygon';
import * as tools from '../tools/tools';

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
  diagram.objectsLow = diagram.getObjects(false);
  diagram.objectsHigh = diagram.getObjects(true);
  diagram.objects = diagram.objectsLow;
  diagram.setSpaceTransforms();
  return diagram;
}

