// eslint-disable-next-line import/no-extraneous-dependencies
import { JSDOM } from 'jsdom';
import {
  Point, Transform, Rect,
} from '../tools/g2';
import * as tools from '../tools/tools';
// import * as math from '../tools/math';
import makeFigure from '../__mocks__/makeFigure';

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

describe('Figure html element tie', () => {
  let square;
  let htmlElement;
  let figure;
  let htmlElementRect;
  let figureRect;
  let figureLimits;
  let windowLimits;
  let scenarios;
  let scaleType;
  beforeEach(() => {
    const createScenario = () => {
      htmlElement = makeHTMLElement(htmlElementRect);
      htmlElement.id = 'htmlElementId';
      figure = makeFigure(figureRect, figureLimits);
      document.body.appendChild(htmlElement);
      square = figure.primitives.polygon({
        sides: 4,
        radius: 1,
        transform: new Transform().scale(1, 1).translate(0, 0),
      });
      square.tieToHTML = {
        element: 'htmlElementId',
        scale: scaleType,
        window: windowLimits,
        updateOnResize: true,
      };
      figure.elements.add('square', square);
    };
    scenarios = {
      simple: () => {
        figureRect = pixelRect(0, 0, 1000, 1000);
        htmlElementRect = pixelRect(0, 0, 100, 100);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = figureLimits._dup();
        createScenario();
      },
      figurePortraitElementLandscapeFit: () => {
        htmlElementRect = pixelRect(0, 0, 200, 100);
        figureRect = pixelRect(0, 0, 1000, 2000);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = figureLimits._dup();
        createScenario();
      },
      figureLandscapeElementPortraitFit: () => {
        htmlElementRect = pixelRect(0, 0, 100, 200);
        figureRect = pixelRect(0, 0, 2000, 1000);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = figureLimits._dup();
        createScenario();
      },
      figurePortraitElementLandscapeWindowWiderLandscapeFit: () => {
        figureRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'fit';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      figurePortraitElementLandscapeMax: () => {
        htmlElementRect = pixelRect(0, 0, 200, 100);
        figureRect = pixelRect(0, 0, 1000, 2000);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'max';
        windowLimits = figureLimits._dup();
        createScenario();
      },
      figureLandscapeElementPortraitMax: () => {
        htmlElementRect = pixelRect(0, 0, 100, 200);
        figureRect = pixelRect(0, 0, 2000, 1000);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'max';
        windowLimits = figureLimits._dup();
        createScenario();
      },
      figurePortraitElementLandscapeWindowWiderLandscapeStretch: () => {
        figureRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = 'stretch';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      figurePortraitElementLandscapeWindowWiderLandscapePixels: () => {
        figureRect = pixelRect(0, 0, 1000, 2000);
        htmlElementRect = pixelRect(0, 0, 200, 100);
        figureLimits = new Rect(-1, -1, 2, 2);
        scaleType = '200px';
        windowLimits = new Rect(-1, -0.1, 2, 0.2);
        createScenario();
      },
      complex: () => {
        htmlElementRect = pixelRect(20, 20, 200, 100);
        figureRect = pixelRect(10, 10, 1000, 2000);
        figureLimits = new Rect(-2, -1, 4, 2);
        scaleType = 'fit';
        windowLimits = figureLimits._dup();
        createScenario();
      },
    };
  });
  test('Basic', () => {
    scenarios.simple();
    expect(square.getScale()).toEqual(new Point(1, 1, 1));
    expect(square.getPosition()).toEqual(new Point(0, 0));
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.1, 1));
    expect(square.getPosition()).toEqual(new Point(-0.9, 0.9));
  });
  test('Figure portrait, element landscape, fit, no window', () => {
    scenarios.figurePortraitElementLandscapeFit();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.05, 1));
    expect(square.getPosition()).toEqual(new Point(1 / 5 - 1, 1 - 1 / 20));
  });
  test('Figure landscape, element portrait, fit, no window', () => {
    scenarios.figureLandscapeElementPortraitFit();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.05, 0.1, 1));
    expect(square.getPosition()).toEqual(new Point(-0.95, 0.8));
  });
  test('Figure portrait, element landscape, window wider landscape, fit', () => {
    scenarios.figurePortraitElementLandscapeWindowWiderLandscapeFit();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1, 1));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Figure portrait, element landscape, max, no window', () => {
    scenarios.figurePortraitElementLandscapeMax();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1, 1));
    expect(square.getPosition()).toEqual(new Point(1 / 5 - 1, 1 - 1 / 20));
  });
  test('Figure landscape, element portrait, max, no window', () => {
    scenarios.figureLandscapeElementPortraitMax();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.1, 0.2, 1));
    expect(square.getPosition()).toEqual(new Point(-0.95, 0.8));
  });
  test('Figure portrait, element landscape, window wider landscape, stretch', () => {
    scenarios.figurePortraitElementLandscapeWindowWiderLandscapeStretch();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.5, 1));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Figure portrait, element landscape, window wider landscape, pixels', () => {
    scenarios.figurePortraitElementLandscapeWindowWiderLandscapePixels();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.1, 1));
    expect(square.getPosition()).toEqual(new Point(-0.8, 0.95));
  });
  test('Complex', () => {
    scenarios.complex();
    figure.resize();
    expect(square.getScale()).toEqual(new Point(0.2, 0.05, 1));
    expect(square.getPosition()).toEqual(new Point(-1.56, 0.94));
  });
});
