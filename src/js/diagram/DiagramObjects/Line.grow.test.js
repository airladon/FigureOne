// import {
//   Point, rectToPolar,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();

describe('Grow Line', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
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
    a = diagram.elements._a;
    diagram.initialize();
  });
  test('Grow', () => {
    expect(round(a._line.transform.s().x)).toBe(2);
    a.grow({ start: 0, duration: 1 });
    diagram.mock.timeStep(0);
    diagram.mock.timeStep(0.1);
    expect(round(a._line.transform.s().x)).toBe(0.2);
    diagram.mock.timeStep(0.1);
    expect(round(a._line.transform.s().x)).toBe(0.4);
    diagram.mock.timeStep(0.3);
    expect(round(a._line.transform.s().x)).toBe(1);
    diagram.mock.timeStep(0.5);
    expect(round(a._line.transform.s().x)).toBe(2);
  });
  describe('On Cancel - defined by animation', () => {
    beforeEach(() => {
      expect(round(a._line.transform.s().x)).toBe(2);
      // a.grow(0, 1, false);
      a.grow({ start: 0, duration: 1 });
      diagram.mock.timeStep(0);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('Complete', () => {
      diagram.stop('complete');
      expect(round(a._line.transform.s().x)).toBe(2);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(2);
    });
    test('Cancel', () => {
      diagram.stop('cancel');
      expect(round(a._line.transform.s().x)).toBe(1);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('Freeze', () => {
      diagram.stop('freeze');
      expect(round(a._line.transform.s().x)).toBe(1);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('AnimateToComplete', () => {
      diagram.stop('animateToComplete');
      expect(round(a._line.transform.s().x)).toBe(1);
      diagram.mock.timeStep(0.1);
      expect(round(a._line.transform.s().x)).toBe(1.2);
      diagram.mock.timeStep(0.4);
      expect(round(a._line.transform.s().x)).toBe(2);
    });
  });
  describe('On Cancel - Force from grow', () => {
    beforeEach(() => {
      expect(round(a._line.transform.s().x)).toBe(2);
      a.grow({ start: 0, duration: 1, completeOnCancel: true });
      diagram.mock.timeStep(0);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('Complete', () => {
      diagram.stop('complete');
      expect(round(a._line.transform.s().x)).toBe(2);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(2);
    });
    test('Cancel', () => {
      diagram.stop('cancel');
      expect(round(a._line.transform.s().x)).toBe(2);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(2);
    });
    test('Freeze', () => {
      diagram.stop('freeze');
      expect(round(a._line.transform.s().x)).toBe(1);
      diagram.mock.timeStep(0.5);
      expect(round(a._line.transform.s().x)).toBe(1);
    });
    test('AnimateToComplete', () => {
      diagram.stop('animateToComplete');
      expect(round(a._line.transform.s().x)).toBe(1);
      diagram.mock.timeStep(0.1);
      expect(round(a._line.transform.s().x)).toBe(1.2);
      diagram.mock.timeStep(0.4);
      expect(round(a._line.transform.s().x)).toBe(2);
    });
  });
  test('Force complete on cancel', () => {
    expect(round(a._line.transform.s().x)).toBe(2);
    a.grow({ start: 0, duration: 1, completeOnCancel: true });
    diagram.mock.timeStep(0);
    diagram.mock.timeStep(0.1);
    expect(round(a._line.transform.s().x)).toBe(0.2);
    diagram.mock.timeStep(0.1);
    expect(round(a._line.transform.s().x)).toBe(0.4);
    diagram.mock.timeStep(0.3);
    diagram.stop('cancel');
    expect(round(a._line.transform.s().x)).toBe(2);
  });
});
