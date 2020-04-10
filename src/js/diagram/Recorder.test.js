// import {
//   Point, Rect, Line,
// } from '../tools/g2';
// import {
//   round,
// } from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

describe('Diagram Recorder', () => {
  let diagram;
  let recorder;
  beforeEach(() => {
    diagram = makeDiagram();
    ({ recorder } = diagram);
    recorder.events = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
  });
  describe('Find Index', () => {
    test('start', () => {
      const index = recorder.getNextIndexForTime(0);
      expect(index).toBe(0);
    });
    test('end', () => {
      const index = recorder.getNextIndexForTime(10);
      expect(index).toBe(10);
    });
    test('beyondEnd', () => {
      const index = recorder.getNextIndexForTime(11);
      expect(index).toBe(-1);
    });
    test('between 0 and 1', () => {
      const index = recorder.getNextIndexForTime(0.5);
      expect(index).toBe(1);
    });
    test('on time', () => {
      const index = recorder.getNextIndexForTime(5);
      expect(index).toBe(5);
    });
    test('2nd Element', () => {
      const index = recorder.getNextIndexForTime(2);
      expect(index).toBe(2);
    });
    test('2nd last Element', () => {
      const index = recorder.getNextIndexForTime(9);
      expect(index).toBe(9);
    });
    test('random', () => {
      const index = recorder.getNextIndexForTime(6.578);
      expect(index).toBe(7);
    });
  });
});
