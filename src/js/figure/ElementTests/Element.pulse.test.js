import {
  FigureElementCollection,
} from '../Element';
// import { AnimationPhase } from './AnimationPhase';
// import {
//   Point, Transform,
// } from '../../tools/g2';
import makeFigure from '../../__mocks__/makeFigure';

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');
jest.useFakeTimers();


// import {
//   linear, round,
// } from '../tools/math';
// import * as m2 from '../tools/m2';

const mockDone = jest.fn(() => {});

const makeSquare = () => {
  const figure = makeFigure();
  const element = figure.shapes.polygon({ sides: 4, radius: 1, color: [0, 0, 1, 1] });
  return element;
};

const makeCollection = () => {
  const collection = new FigureElementCollection();
  const squares = new FigureElementCollection();
  const square1 = makeSquare();
  const square2 = makeSquare();
  const square3 = makeSquare();
  squares.add('s1', square1);
  squares.add('s2', square2);
  collection.add('squares', squares);
  collection.add('s3', square3);
  return collection;
};

describe('Pulse', () => {
  let figure;
  beforeEach(() => {
    jest.clearAllMocks();
    figure = makeFigure();
  });
  // afterEach(() => {
  //   jest.clearAllMocks();
  //   figure = makeFigure();
  // });
  describe('Primitive', () => {
    test('Simple', () => {
      const element = makeSquare();
      expect(element.state.isPulsing).toBe(false);
      element.pulse();
      expect(element.state.isPulsing).toBe(true);
      expect(mockDone.mock.calls).toHaveLength(0);
    });
    test('Callback', () => {
      const element = makeSquare();
      figure.elements.add('e', element);

      // Initial state
      expect(element.state.isPulsing).toBe(false);
      expect(mockDone.mock.calls).toHaveLength(0);
      figure.mock.timeStep(0);
      element.pulse(mockDone);

      // First time stamp
      // element.setupDraw(0);
      figure.mock.timeStep(0);
      expect(element.state.isPulsing).toBe(true);
      expect(mockDone.mock.calls).toHaveLength(0);

      // After 0.5s
      // element.setupDraw(0.5);
      figure.mock.timeStep(0.5);
      expect(element.state.isPulsing).toBe(true);
      expect(mockDone.mock.calls).toHaveLength(0);

      // When complete
      // element.setupDraw(1.1);
      figure.mock.timeStep(1.1);
      expect(mockDone.mock.calls).toHaveLength(1);
      expect(element.state.isPulsing).toBe(false);
    });
  });
  describe('Collections', () => {
    let collection;
    beforeEach(() => {
      collection = makeCollection();
      figure.elements.add('c', collection);
    });
    test('Simple', () => {
      expect(collection.state.isPulsing).toBe(false);
      collection.pulse();
      expect(collection.state.isPulsing).toBe(true);
      expect(mockDone.mock.calls).toHaveLength(0);
    });
    test('Callback', () => {
      expect(mockDone.mock.calls).toHaveLength(0);
      figure.mock.timeStep(0);
      collection.pulse(mockDone);
      figure.mock.timeStep(0);
      figure.mock.timeStep(1.1);
      expect(mockDone.mock.calls).toHaveLength(1);
    });
    test('Specific Elements', () => {
      expect(mockDone.mock.calls).toHaveLength(0);
      figure.mock.timeStep(0);
      collection.pulse(['s3', 'squares.s1'], mockDone);
      expect(collection.state.isPulsing).toBe(false);
      expect(collection._s3.state.isPulsing).toBe(true);
      expect(collection._squares._s1.state.isPulsing).toBe(true);
      expect(collection._squares._s2.state.isPulsing).toBe(false);
      figure.mock.timeStep(0);
      figure.mock.timeStep(1.1);
      // collection.setupDraw(0);
      // collection.setupDraw(1.1);
      expect(mockDone.mock.calls).toHaveLength(1);
    });
  });
});
