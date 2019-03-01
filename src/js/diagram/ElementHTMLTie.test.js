import {
  Point, Transform, Rect,
} from '../tools/g2';
import * as tools from '../tools/tools';
import * as math from '../tools/math';
import makeDiagram from '../__mocks__/makeDiagram';
import { JSDOM } from "jsdom"
const dom = new JSDOM()
global.document = dom.window.document

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

// const point = value => new Point(value, value);

// function updateHTMLElement(
//   element,
//   clientRect = new Rect(100, -200, 100, 100),
// ) {
//   element.width = clientRect.width;
//   element.height = clientRect.height;
//   element.getBoundingClientRect = () => clientRect;
//   element.offsetWidth = clientRect.width;
//   element.offsetHeight = clientRect.height;
// }
const makeHTMLElement = (clientRect = new Rect(0, -100, 100, 100)) => {
  const element = document.createElement('div');
  // document.getElementsByTagName('body')[0].appendChild(element);
  // element.style.position = 'absolute';
  // element.style.left = `${clientRect.left}px`;
  // element.style.top = `${clientRect.top}px`;
  // element.style.width = `${clientRect.width}px`;
  // element.style.height = `${clientRect.height}px`;
  element.getBoundingClientRect = () => clientRect;
  // element.offsetWidth = clientRect.width;
  // element.offsetHeight = clientRect.height;
  return element;
};


describe('Diagram html element tie', () => {
  let square;
  let htmlElement;
  let diagram;
  beforeEach(() => {
    htmlElement = makeHTMLElement();
    diagram = makeDiagram(
      new Rect(0, -1000, 1000, 1000),
      new Rect(-1, -1, 2, 2),
    );
    square = diagram.shapes.polygon({
      sides: 4,
      radius: 1,
      transform: new Transform().scale(1, 1).translate(0, 0),
    });
    square.tieToHTML = {
      element: htmlElement,
      scale: 'fit',
      window: square.diagramLimits,
    };
    diagram.elements.add('square', square);
  });
  test('Basic', () => {
    console.log(htmlElement.getBoundingClientRect())
    console.log(htmlElement instanceof HTMLElement)
    // console.log(htmlElement.style)
    
    console.log(square.transform)
    diagram.resize();
    console.log(square.transform)
    // console.log(diagram);
    // console.log(square);
    // console.log(htmlElement);
    // console.log(htmlElement.getBoundingClientRect())
  });
});
