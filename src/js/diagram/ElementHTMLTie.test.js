// eslint-disable-next-line import/no-extraneous-dependencies
import { JSDOM } from 'jsdom';
import {
  Point, Transform, Rect,
} from '../tools/g2';
import * as tools from '../tools/tools';
// import * as math from '../tools/math';
import makeDiagram from '../__mocks__/makeDiagram';

const dom = new JSDOM();
global.document = dom.window.document;

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

// const point = value => new Point(value, value);

const makeHTMLElement = (clientRect = new Rect(0, -100, 100, 100)) => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => clientRect;
  return element;
};

const pixelRect = (left, top, width, height) => new Rect(left, top - height, width, height);

describe('Diagram html element tie', () => {
  let square;
  let htmlElement;
  let diagram;
  let htmlElementRect;
  let diagramRect;
  let diagramLimits;
  let windowLimits;
  let scenarios;
  let scaleType;
  beforeEach(() => {
    const createScenario = () => {
      htmlElement = makeHTMLElement(htmlElementRect);
      diagram = makeDiagram(diagramRect, diagramLimits);
      square = diagram.shapes.polygon({
        sides: 4,
        radius: 1,
        transform: new Transform().scale(1, 1).translate(0, 0),
      });
      square.tieToHTML = {
        element: htmlElement,
        scale: scaleType,
        window: windowLimits,
      };
      diagram.elements.add('square', square);
    };
    scenarios = {
      simple: () => {
        diagramRect = pixelRect(0, 0, 1000, 1000);
        htmlElementRect = pixelRect(0, 0, 100, 100);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
      diagramPortraitElementLandscapeFit: () => {
        htmlElementRect = pixelRect(0, 0, 200, 100);
        diagramRect = pixelRect(0, 0, 1000, 2000);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
      diagramLandscapeElementPortraitFit: () => {
        htmlElementRect = pixelRect(0, 0, 100, 200);
        diagramRect = pixelRect(0, 0, 2000, 1000);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
      diagramPortraitElementLandscapeWindowWiderLandscapeFit: () => {
        diagramRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      diagramPortraitElementLandscapeMax: () => {
        htmlElementRect = pixelRect(0, 0, 200, 100);
        diagramRect = pixelRect(0, 0, 1000, 2000);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'max';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
      diagramLandscapeElementPortraitMax: () => {
        htmlElementRect = pixelRect(0, 0, 100, 200);
        diagramRect = pixelRect(0, 0, 2000, 1000);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'max';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
      diagramPortraitElementLandscapeWindowWiderLandscapeStretch: () => {
        diagramRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'stretch';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      diagramPortraitElementLandscapeWindowWiderLandscapePixels: () => {
        diagramRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        diagramLimits = new Rect(-1, -1, 2, 2);
        scaleType = '200px';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      complex: () => {
        htmlElementRect = pixelRect(20, 20, 200, 100);
        diagramRect = pixelRect(10, 10, 1000, 2000);
        diagramLimits = new Rect(-2, -1, 4, 2);
        scaleType = 'fit';
        windowLimits = diagramLimits._dup();
        createScenario();
      },
    };
  });
  test('Basic', () => {
    scenarios.simple();
    expect(square.getScale()).toEqual(new Point(1, 1));
    expect(square.getPosition()).toEqual(new Point(0, 0));
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.1));
    expect(square.getPosition()).toEqual(new Point(-0.9, 0.9));
  });
  test('Diagram portrait, element landscape, fit, no window', () => {
    scenarios.diagramPortraitElementLandscapeFit();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.05));
    expect(square.getPosition()).toEqual(new Point(1 / 5 - 1, 1 - 1 / 20));
  });
  test('Diagram landscape, element portrait, fit, no window', () => {
    scenarios.diagramLandscapeElementPortraitFit();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.05, 0.1));
    expect(square.getPosition()).toEqual(new Point(-0.95, 0.8));
  });
  test('Diagram portrait, element landscape, window wider landscape, fit', () => {
    scenarios.diagramPortraitElementLandscapeWindowWiderLandscapeFit();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Diagram portrait, element landscape, max, no window', () => {
    scenarios.diagramPortraitElementLandscapeMax();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1));
    expect(square.getPosition()).toEqual(new Point(1 / 5 - 1, 1 - 1 / 20));
  });
  test('Diagram landscape, element portrait, max, no window', () => {
    scenarios.diagramLandscapeElementPortraitMax();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.2));
    expect(square.getPosition()).toEqual(new Point(-0.95, 0.8));
  });
  test('Diagram portrait, element landscape, window wider landscape, stretch', () => {
    scenarios.diagramPortraitElementLandscapeWindowWiderLandscapeStretch();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.5));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Diagram portrait, element landscape, window wider landscape, pixels', () => {
    scenarios.diagramPortraitElementLandscapeWindowWiderLandscapePixels();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Complex', () => {
    scenarios.complex();
    diagram.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.05));
    expect(square.getPosition()).toEqual(new Point(-1.56, 0.94));
  });
});
