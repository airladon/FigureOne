// import {
//   DiagramElementPrimative,
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

export default function makeDiagram() {
  document.body.innerHTML =
    '<div id="c">'
    + '  <canvas class="diagram__gl" id="id_diagram__gl__low">'
    + '  </canvas>'
    + '  <canvas class="diagram__text" id="id_diagram__text__low">'
    + '  </canvas>'
    + '  <div class="diagram__html">'
    + '  </div>'
    + '  <canvas class="diagram__gl" id="id_diagram__gl__high">'
    + '  </canvas>'
    + '  <canvas class="diagram__text" id="id_diagram__text__high">'
    + '  </canvas>'
    + '</div>';
  // canvas = document.getElementById('c');
  const definition = {
    width: 1000,
    height: 500,
    limits: new Rect(-1, -1, 2, 2),
  };

  const canvasMock = {
    width: definition.width,
    height: definition.height,
    // offsetLeft: 100,
    left: 100,
    // offsetTop: 200,
    top: 200,
    // width: definition.width,
    // height: definition.height,
    offsetWidth: definition.width,
    offsetHeight: definition.height,
    scrollLeft: 0,
    scrollTop: 0,
    // eslint-disable-next-line arrow-body-style
    getBoundingClientRect: () => {
      return {
        left: 100,
        top: 200,
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

