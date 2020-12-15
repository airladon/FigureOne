// import {
//   Point, rectToPolar,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeFigure from '../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Grow Line', () => {
  let figure;
  let a;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'a',
        method: 'oline',
        options: {
          length: 2,
          width: 0.1,
          // vertexSpaceStart: 'left',
        },
      },
    ]);
    a = figure.elements._a;
    figure.initialize();
  });
  test('Grow', () => {
    // expect(round(a._line.transform.s().x)).toBe(2);
    expect(round(a._line.drawingObject.points[2])).toBe(2);
    a.grow({ start: 0, duration: 1 });
    figure.mock.timeStep(0);
    figure.mock.timeStep(0.1);
    expect(round(a._line.drawingObject.points[2])).toBe(0.2);
    // expect(round(a._line.transform.s().x)).toBe(0.2);
    figure.mock.timeStep(0.1);
    expect(round(a._line.drawingObject.points[2])).toBe(0.4);
    // expect(round(a._line.transform.s().x)).toBe(0.4);
    figure.mock.timeStep(0.3);
    expect(round(a._line.drawingObject.points[2])).toBe(1);
    // expect(round(a._line.transform.s().x)).toBe(1);
    figure.mock.timeStep(0.5);
    expect(round(a._line.drawingObject.points[2])).toBe(2);
    // expect(round(a._line.transform.s().x)).toBe(2);
  });
  describe('On Cancel - defined by animation', () => {
    beforeEach(() => {
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
      // a.grow(0, 1, false);
      a.grow({ start: 0, duration: 1 });
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
    });
    test('Complete', () => {
      figure.stop('complete');
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
    });
    test('Cancel', () => {
      figure.stop('cancel');
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      // expect(round(a._line.transform.s().x)).toBe(1);
      figure.mock.timeStep(0.5);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      // expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('Freeze', () => {
      figure.stop('freeze');
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
    });
    test('AnimateToComplete', () => {
      figure.stop('animateToComplete');
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      figure.mock.timeStep(0.1);
      // expect(round(a._line.transform.s().x)).toBe(1.2);
      expect(round(a._line.drawingObject.points[2])).toBe(1.2);
      figure.mock.timeStep(0.4);
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
    });
  });
  describe('On Cancel - Force from grow', () => {
    beforeEach(() => {
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
      a.grow({ start: 0, duration: 1, completeOnCancel: true });
      figure.mock.timeStep(0);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
    });
    test('Complete', () => {
      figure.stop('complete');
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
    });
    test('Cancel', () => {
      figure.stop('cancel');
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
    });
    test('Freeze', () => {
      figure.stop('freeze');
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      figure.mock.timeStep(0.5);
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
    });
    test('AnimateToComplete', () => {
      figure.stop('animateToComplete');
      // expect(round(a._line.transform.s().x)).toBe(1);
      expect(round(a._line.drawingObject.points[2])).toBe(1);
      figure.mock.timeStep(0.1);
      // expect(round(a._line.transform.s().x)).toBe(1.2);
      expect(round(a._line.drawingObject.points[2])).toBe(1.2);
      figure.mock.timeStep(0.4);
      // expect(round(a._line.transform.s().x)).toBe(2);
      expect(round(a._line.drawingObject.points[2])).toBe(2);
    });
  });
  test('Force complete on cancel', () => {
    // expect(round(a._line.transform.s().x)).toBe(2);
    expect(round(a._line.drawingObject.points[2])).toBe(2);
    a.grow({ start: 0, duration: 1, completeOnCancel: true });
    figure.mock.timeStep(0);
    figure.mock.timeStep(0.1);
    // expect(round(a._line.transform.s().x)).toBe(0.2);
    expect(round(a._line.drawingObject.points[2])).toBe(0.2);
    figure.mock.timeStep(0.1);
    // expect(round(a._line.transform.s().x)).toBe(0.4);
    expect(round(a._line.drawingObject.points[2])).toBe(0.4);
    figure.mock.timeStep(0.3);
    figure.stop('cancel');
    // expect(round(a._line.transform.s().x)).toBe(2);
    expect(round(a._line.drawingObject.points[2])).toBe(2);
  });
});
