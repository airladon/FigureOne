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
    describe('Next', () => {
      test('start', () => {
        const index = recorder.getNextEventIndexForTime(0);
        expect(index).toBe(0);
      });
      test('end', () => {
        const index = recorder.getNextEventIndexForTime(10);
        expect(index).toBe(10);
      });
      test('beyondEnd', () => {
        const index = recorder.getNextEventIndexForTime(11);
        expect(index).toBe(-1);
      });
      test('between 0 and 1', () => {
        const index = recorder.getNextEventIndexForTime(0.5);
        expect(index).toBe(1);
      });
      test('on time', () => {
        const index = recorder.getNextEventIndexForTime(5);
        expect(index).toBe(5);
      });
      test('2nd Element', () => {
        const index = recorder.getNextEventIndexForTime(2);
        expect(index).toBe(2);
      });
      test('2nd last Element', () => {
        const index = recorder.getNextEventIndexForTime(9);
        expect(index).toBe(9);
      });
      test('random', () => {
        const index = recorder.getNextEventIndexForTime(6.578);
        expect(index).toBe(7);
      });
      test('double index', () => {
        recorder.events = [[0], [1], [1], [2], [3], [4], [5]];
        const index = recorder.getNextEventIndexForTime(0.45);
        expect(index).toBe(1);
      });
      test('multi index', () => {
        recorder.events = [[0], [1], [1], [1], [2]];
        let index = recorder.getNextEventIndexForTime(0.45);
        expect(index).toBe(1);
        index = recorder.getNextEventIndexForTime(1.45);
        expect(index).toBe(4);
        index = recorder.getNextEventIndexForTime(2.45);
        expect(index).toBe(-1);
      });
      test('3 Event random', () => {
        recorder.events = [[0], [1], [2]];
        const index = recorder.getNextEventIndexForTime(0.45);
        expect(index).toBe(1);
      });
      test('3 Event middle', () => {
        recorder.events = [[0], [1], [2]];
        const index = recorder.getNextEventIndexForTime(1);
        expect(index).toBe(1);
      });
      test('4 Event random', () => {
        recorder.events = [[0], [1], [2], [3]];
        let index = recorder.getNextEventIndexForTime(0.45);
        expect(index).toBe(1);
        index = recorder.getNextEventIndexForTime(1.45);
        expect(index).toBe(2);
      });
      test('4 Event middle', () => {
        recorder.events = [[0], [1], [2], [3]];
        let index = recorder.getNextEventIndexForTime(1);
        expect(index).toBe(1);
        index = recorder.getNextEventIndexForTime(2);
        expect(index).toBe(2);
        index = recorder.getNextEventIndexForTime(1.5);
        expect(index).toBe(2);
        index = recorder.getNextEventIndexForTime(2.5);
        expect(index).toBe(3);
      });
      test('earlier than first', () => {
        recorder.events = [[1], [2], [3]];
        const index = recorder.getNextEventIndexForTime(0.45);
        expect(index).toBe(0);
      });
    });
    describe('Prev', () => {
      test('start', () => {
        const index = recorder.getPrevEventIndexForTime(0);
        expect(index).toBe(0);
      });
      test('end', () => {
        const index = recorder.getPrevEventIndexForTime(10);
        expect(index).toBe(10);
      });
      test('beyondEnd', () => {
        const index = recorder.getPrevEventIndexForTime(11);
        expect(index).toBe(10);
      });
      test('between 0 and 1', () => {
        const index = recorder.getPrevEventIndexForTime(0.5);
        expect(index).toBe(0);
      });
      test('on time', () => {
        const index = recorder.getPrevEventIndexForTime(5);
        expect(index).toBe(5);
      });
      test('2nd Element', () => {
        const index = recorder.getPrevEventIndexForTime(2);
        expect(index).toBe(2);
      });
      test('2nd last Element', () => {
        const index = recorder.getPrevEventIndexForTime(9);
        expect(index).toBe(9);
      });
      test('random', () => {
        const index = recorder.getPrevEventIndexForTime(6.578);
        expect(index).toBe(6);
      });
      test('double index', () => {
        recorder.events = [[0], [1], [1], [2], [3], [4], [5]];
        let index = recorder.getPrevEventIndexForTime(0.45);
        expect(index).toBe(0);
        index = recorder.getPrevEventIndexForTime(1.45);
        expect(index).toBe(1);
      });
      test('multi index', () => {
        recorder.events = [[0], [1], [1], [1], [2]];
        let index = recorder.getPrevEventIndexForTime(0.45);
        expect(index).toBe(0);
        index = recorder.getPrevEventIndexForTime(1.45);
        expect(index).toBe(1);
        index = recorder.getPrevEventIndexForTime(2.45);
        expect(index).toBe(4);
      });
      test('earlier than first', () => {
        recorder.events = [[1], [2], [3]];
        const index = recorder.getPrevEventIndexForTime(0.45);
        expect(index).toBe(-1);
      });
      test('3 Event random', () => {
        recorder.events = [[0], [1], [2]];
        const index = recorder.getPrevEventIndexForTime(0.45);
        expect(index).toBe(0);
      });
      test('3 Event middle', () => {
        recorder.events = [[0], [1], [2]];
        const index = recorder.getPrevEventIndexForTime(1);
        expect(index).toBe(1);
      });
      test('4 Event random', () => {
        recorder.events = [[0], [1], [2], [3]];
        let index = recorder.getPrevEventIndexForTime(0.45);
        expect(index).toBe(0);
        index = recorder.getPrevEventIndexForTime(1.45);
        expect(index).toBe(1);
      });
      test('4 Event middle', () => {
        recorder.events = [[0], [1], [2], [3]];
        let index = recorder.getPrevEventIndexForTime(1);
        expect(index).toBe(1);
        index = recorder.getPrevEventIndexForTime(2);
        expect(index).toBe(2);
        index = recorder.getPrevEventIndexForTime(1.5);
        expect(index).toBe(1);
        index = recorder.getPrevEventIndexForTime(2.5);
        expect(index).toBe(2);
      });
    });
  });
});
