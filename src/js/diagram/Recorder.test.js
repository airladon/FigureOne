import {
  Point,
} from '../tools/g2';
// import {
//   round,
// } from '../tools/math';
import * as tools from '../tools/tools';
import { Transform } from '../tools/g2';
import makeDiagram from '../__mocks__/makeDiagram';
import {
  getNextIndexForTime,
  getPrevIndexForTime,
  getIndexOfEarliestTime,
  getIndexOfLatestTime,
  getLastUniqueIndeces,
  getCursorState,
} from './Recorder';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

describe('Diagram Recorder', () => {
  let diagram;
  let recorder;
  let events;
  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
    ({ recorder } = diagram);
    recorder.reset();
    recorder.stateTimeStep = 1;
    events = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
    diagram.addElement({
      name: 'a',
      method: 'polygon',
      options: {
        color: [1, 0, 0, 1],
        radius: 1,
        width: 0.1,
      },
    });
    diagram.initialize();
  });
  describe('Find Index', () => {
    describe('Next', () => {
      test('start', () => {
        const index = getNextIndexForTime(events, 0);
        expect(index).toBe(0);
      });
      test('end', () => {
        const index = getNextIndexForTime(events, 10);
        expect(index).toBe(10);
      });
      test('beyondEnd', () => {
        const index = getNextIndexForTime(events, 11);
        expect(index).toBe(-1);
      });
      test('between 0 and 1', () => {
        const index = getNextIndexForTime(events, 0.5);
        expect(index).toBe(1);
      });
      test('on time', () => {
        const index = getNextIndexForTime(events, 5);
        expect(index).toBe(5);
      });
      test('2nd Element', () => {
        const index = getNextIndexForTime(events, 2);
        expect(index).toBe(2);
      });
      test('2nd last Element', () => {
        const index = getNextIndexForTime(events, 9);
        expect(index).toBe(9);
      });
      test('random', () => {
        const index = getNextIndexForTime(events, 6.578);
        expect(index).toBe(7);
      });
      test('double index', () => {
        events = [[0], [1], [1], [2], [3], [4], [5]];
        const index = getNextIndexForTime(events, 0.45);
        expect(index).toBe(1);
      });
      test('multi index', () => {
        events = [[0], [1], [1], [1], [2]];
        let index = getNextIndexForTime(events, 0.45);
        expect(index).toBe(1);
        index = getNextIndexForTime(events, 1.45);
        expect(index).toBe(4);
        index = getNextIndexForTime(events, 2.45);
        expect(index).toBe(-1);
      });
      test('3 Event random', () => {
        events = [[0], [1], [2]];
        const index = getNextIndexForTime(events, 0.45);
        expect(index).toBe(1);
      });
      test('3 Event middle', () => {
        events = [[0], [1], [2]];
        const index = getNextIndexForTime(events, 1);
        expect(index).toBe(1);
      });
      test('4 Event random', () => {
        events = [[0], [1], [2], [3]];
        let index = getNextIndexForTime(events, 0.45);
        expect(index).toBe(1);
        index = getNextIndexForTime(events, 1.45);
        expect(index).toBe(2);
      });
      test('4 Event middle', () => {
        events = [[0], [1], [2], [3]];
        let index = getNextIndexForTime(events, 1);
        expect(index).toBe(1);
        index = getNextIndexForTime(events, 2);
        expect(index).toBe(2);
        index = getNextIndexForTime(events, 1.5);
        expect(index).toBe(2);
        index = getNextIndexForTime(events, 2.5);
        expect(index).toBe(3);
      });
      test('earlier than first', () => {
        events = [[1], [2], [3]];
        const index = getNextIndexForTime(events, 0.45);
        expect(index).toBe(0);
      });
    });
    describe('Prev', () => {
      test('start', () => {
        const index = getPrevIndexForTime(events, 0);
        expect(index).toBe(0);
      });
      test('end', () => {
        const index = getPrevIndexForTime(events, 10);
        expect(index).toBe(10);
      });
      test('beyondEnd', () => {
        const index = getPrevIndexForTime(events, 11);
        expect(index).toBe(10);
      });
      test('between 0 and 1', () => {
        const index = getPrevIndexForTime(events, 0.5);
        expect(index).toBe(0);
      });
      test('on time', () => {
        const index = getPrevIndexForTime(events, 5);
        expect(index).toBe(5);
      });
      test('2nd Element', () => {
        const index = getPrevIndexForTime(events, 2);
        expect(index).toBe(2);
      });
      test('2nd last Element', () => {
        const index = getPrevIndexForTime(events, 9);
        expect(index).toBe(9);
      });
      test('random', () => {
        const index = getPrevIndexForTime(events, 6.578);
        expect(index).toBe(6);
      });
      test('double index', () => {
        events = [[0], [1], [1], [2], [3], [4], [5]];
        let index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(0);
        index = getPrevIndexForTime(events, 1.45);
        expect(index).toBe(1);
      });
      test('multi index', () => {
        events = [[0], [1], [1], [1], [2]];
        let index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(0);
        index = getPrevIndexForTime(events, 1.45);
        expect(index).toBe(1);
        index = getPrevIndexForTime(events, 2.45);
        expect(index).toBe(4);
      });
      test('earlier than first', () => {
        events = [[1], [2], [3]];
        const index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(-1);
      });
      test('Empty events', () => {
        events = [];
        const index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(-1);
      });
      test('3 Event random', () => {
        events = [[0], [1], [2]];
        const index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(0);
      });
      test('3 Event middle', () => {
        events = [[0], [1], [2]];
        const index = getPrevIndexForTime(events, 1);
        expect(index).toBe(1);
      });
      test('4 Event random', () => {
        events = [[0], [1], [2], [3]];
        let index = getPrevIndexForTime(events, 0.45);
        expect(index).toBe(0);
        index = getPrevIndexForTime(events, 1.45);
        expect(index).toBe(1);
      });
      test('4 Event middle', () => {
        events = [[0], [1], [2], [3]];
        let index = getPrevIndexForTime(events, 1);
        expect(index).toBe(1);
        index = getPrevIndexForTime(events, 2);
        expect(index).toBe(2);
        index = getPrevIndexForTime(events, 1.5);
        expect(index).toBe(1);
        index = getPrevIndexForTime(events, 2.5);
        expect(index).toBe(2);
      });
    });
    // broken
    describe('Get Cursor State', () => {
      // let cursorEvents;
      beforeEach(() => {
        global.performance.now = () => 0;
        recorder.startRecording();
        global.performance.now = () => 1000;
        recorder.recordEvent('showCursor', 0, 0);
        global.performance.now = () => 2000;
        recorder.recordEvent('cursorMove', 1, 1);
        global.performance.now = () => 3000;
        recorder.recordEvent('cursorMove', 2, 2);
        global.performance.now = () => 4000;
        recorder.recordEvent('touchDown', 3, 3);
        global.performance.now = () => 5000;
        recorder.recordEvent('cursorMove', 4, 4);
        global.performance.now = () => 6000;
        recorder.recordEvent('cursorMove', 5, 5);
        global.performance.now = () => 7000;
        recorder.recordEvent('touchUp');
        global.performance.now = () => 8000;
        recorder.recordEvent('cursorMove', 7, 7);
        global.performance.now = () => 9000;
        recorder.recordEvent('cursorMove', 8, 8);
        global.performance.now = () => 10000;
        recorder.recordEvent('hideCursor');
        global.performance.now = () => 11000;
        recorder.recordEvent('doNothing');
        recorder.stopRecording();
      });
      test('Negative Index', () => {
        const result = getCursorState(recorder.events, -1);
        expect(result).toEqual({
          show: false, up: true, position: new Point(0, 0),
        });
      });
      test('Start', () => {
        const result = getCursorState(recorder.events, 0);
        expect(result).toEqual({
          show: false, up: true, position: new Point(0, 0),
        });
      });
      test('On Show', () => {
        const result = getCursorState(recorder.events, 1);
        expect(result).toEqual({
          show: true, up: true, position: new Point(0, 0),
        });
      });
      test('Between Show and Down', () => {
        const result = getCursorState(recorder.events, 2);
        expect(result).toEqual({
          show: true, up: true, position: new Point(1, 1),
        });
      });
      test('On Down', () => {
        const result = getCursorState(recorder.events, 4);
        expect(result).toEqual({
          show: true, up: false, position: new Point(3, 3),
        });
      });
      test('Between Down and Up', () => {
        const result = getCursorState(recorder.events, 5);
        expect(result).toEqual({
          show: true, up: false, position: new Point(4, 4),
        });
      });
      test('On Up', () => {
        const result = getCursorState(recorder.events, 7);
        expect(result).toEqual({
          show: true, up: true, position: new Point(5, 5),
        });
      });
      test('Between up and hide', () => {
        const result = getCursorState(recorder.events, 8);
        expect(result).toEqual({
          show: true, up: true, position: new Point(7, 7),
        });
      });
      test('On hide', () => {
        const result = getCursorState(recorder.events, 10);
        expect(result).toEqual({
          show: false, up: true, position: new Point(8, 8),
        });
      });
      test('After hide', () => {
        const result = getCursorState(recorder.events, 11);
        expect(result).toEqual({
          show: false, up: true, position: new Point(8, 8),
        });
      });
    });
    describe('Get index of earliest time', () => {
      test('simple', () => {
        events = [[0], [1], [1], [2]];
        let index = getIndexOfEarliestTime(events, 2);
        expect(index).toBe(1);
        index = getIndexOfEarliestTime(events, 1);
        expect(index).toBe(1);
        index = getIndexOfEarliestTime(events, 3);
        expect(index).toBe(3);
      });
      test('at start', () => {
        events = [[0], [0], [1], [2]];
        let index = getIndexOfEarliestTime(events, 1);
        expect(index).toBe(0);
        index = getIndexOfEarliestTime(events, 0);
        expect(index).toBe(0);
      });
      test('at end', () => {
        events = [[0], [1], [2], [2]];
        let index = getIndexOfEarliestTime(events, 3);
        expect(index).toBe(2);
        index = getIndexOfEarliestTime(events, 2);
        expect(index).toBe(2);
      });
    });
    describe('Get index of latest time', () => {
      test('simple', () => {
        events = [[0], [1], [1], [2]];
        let index = getIndexOfLatestTime(events, 2);
        expect(index).toBe(2);
        index = getIndexOfLatestTime(events, 1);
        expect(index).toBe(2);
        index = getIndexOfLatestTime(events, 0);
        expect(index).toBe(0);
        index = getIndexOfLatestTime(events, 3);
        expect(index).toBe(3);
      });
      test('at start', () => {
        events = [[0], [0], [1], [2]];
        let index = getIndexOfLatestTime(events, 1);
        expect(index).toBe(1);
        index = getIndexOfLatestTime(events, 0);
        expect(index).toBe(1);
      });
      test('at end', () => {
        events = [[0], [1], [2], [2]];
        let index = getIndexOfLatestTime(events, 3);
        expect(index).toBe(3);
        index = getIndexOfLatestTime(events, 2);
        expect(index).toBe(3);
      });
    });
    describe('Get last unique indeces', () => {
      test('simple', () => {
        events = [[0, ['a']], [1, ['a']], [1, ['b']], [2, ['a']]];
        const indeces = getLastUniqueIndeces(events, 1, 2);
        expect(indeces).toEqual([1, 2]);
      });
      test('entire array', () => {
        events = [[0, ['a']], [1, ['a']], [1, ['b']], [2, ['a']]];
        const indeces = getLastUniqueIndeces(events, 0, 3);
        expect(indeces.sort()).toEqual([2, 3]);
      });
      test('three', () => {
        events = [[0, ['a']], [1, ['b']], [1, ['b']], [2, ['c']]];
        const indeces = getLastUniqueIndeces(events, 0, 3);
        expect(indeces.sort()).toEqual([0, 2, 3]);
      });
    });
  });
  describe('Cache', () => {
    describe('Cache recording', () => {
      test('simple', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);

        const cache = recorder.eventsCache.cursorMove.list;
        expect(cache[0]).toEqual([3, [1, 1]]);
        expect(cache[1]).toEqual([4, [2, 2]]);
      });
      test('Two event types', () => {
        recorder.addEventType('cursorMove', () => {}, true);
        recorder.addEventType('touchDown', () => {}, false);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 12000;
        recorder.recordEvent('touchDown', [0.5, 0.5]);
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        const cursorMoveCache = recorder.eventsCache.cursorMove.list;
        expect(cursorMoveCache[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveCache[1]).toEqual([4, [2, 2]]);
        const touchDownCache = recorder.eventsCache.touchDown.list;
        expect(touchDownCache[0]).toEqual([2, [0.5, 0.5]]);
      });
      test('Event type not in events', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 12000;
        recorder.recordEvent('touchDown', [0.5, 0.5]);
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        expect(recorder.eventsCache.touchDown).toBe(undefined);
        const cursorMoveCache = recorder.eventsCache.cursorMove.list;
        expect(cursorMoveCache[0]).toEqual([3, [1, 1]]);
      });
    });
    describe('Cache start and end times', () => {
      test('Simple Start and End', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        const startTime = recorder.getCacheStartTime();
        const endTime = recorder.getCacheEndTime();

        expect(startTime).toBe(0);
        expect(endTime).toBe(4);
      });
      test('Non zero start', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording(2);
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        const startTime = recorder.getCacheStartTime();
        const endTime = recorder.getCacheEndTime();

        expect(startTime).toBe(2);
        expect(endTime).toBe(6);
      });
    });
    describe('Merge States', () => {
      test('Empty States', () => {
        const { a } = diagram.elements.elements;
        global.performance.now = () => 10000;
        a.setRotation(0);
        recorder.startRecording();

        global.performance.now = () => 13000;
        a.setRotation(1);
        recorder.recordCurrentState();
        global.performance.now = () => 14000;
        a.setRotation(2);
        recorder.recordCurrentState();

        recorder.stopRecording();

        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1,
          '.stateTime': 13,
        });

        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2,
          '.stateTime': 14,
        });
      });
      test('New states from 0 to beyond end', () => {
        const { a } = diagram.elements.elements;
        global.performance.now = () => 10000;
        a.setRotation(0);
        recorder.startRecording();
        global.performance.now = () => 13000;
        a.setRotation(1);
        recorder.recordCurrentState();
        global.performance.now = () => 14000;
        a.setRotation(2);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}]);
        expect(recorder.states.diffs[1][0]).toBe(3);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1,
          '.stateTime': 13,
        });
        expect(recorder.states.diffs[2][0]).toBe(4);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2,
          '.stateTime': 14,
        });

        global.performance.now = () => 20000;
        a.setRotation(0.5);
        recorder.startRecording();
        global.performance.now = () => 24000;
        a.setRotation(1.5);
        recorder.recordCurrentState();
        global.performance.now = () => 25000;
        a.setRotation(2.5);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0][0]).toBe(0);
        expect(recorder.states.diffs[0][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 0.5,
          '.stateTime': 20,
        });

        expect(recorder.states.diffs[1][0]).toBe(4);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1.5,
          '.stateTime': 24,
        });
        expect(recorder.states.diffs[2][0]).toBe(5);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2.5,
          '.stateTime': 25,
        });
      });
      test('New states from 0 to before end', () => {
        const { a } = diagram.elements.elements;
        global.performance.now = () => 10000;
        a.setRotation(0);
        recorder.startRecording();
        global.performance.now = () => 13000;
        a.setRotation(1);
        recorder.recordCurrentState();
        global.performance.now = () => 14000;
        a.setRotation(2);
        recorder.recordCurrentState();
        recorder.stopRecording();

        global.performance.now = () => 20000;
        a.setRotation(0.5);
        recorder.startRecording(0);
        global.performance.now = () => 20500;
        a.setRotation(1.5);
        recorder.recordCurrentState();
        global.performance.now = () => 23000;
        a.setRotation(2.5);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0][0]).toBe(0);
        expect(recorder.states.diffs[0][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 0.5,
          '.stateTime': 20,
        });

        expect(recorder.states.diffs[1][0]).toBe(0.5);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1.5,
          '.stateTime': 20.5,
        });
        expect(recorder.states.diffs[2][0]).toBe(3);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2.5,
          '.stateTime': 23,
        });
        expect(recorder.states.diffs[3][0]).toBe(4);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2,
          '.stateTime': 14,
        });
      });
      test('New states from after 0 to before end', () => {
        const { a } = diagram.elements.elements;
        global.performance.now = () => 10000;
        a.setRotation(0);
        recorder.startRecording();
        global.performance.now = () => 13000;
        a.setRotation(1);
        recorder.recordCurrentState();
        global.performance.now = () => 14000;
        a.setRotation(2);
        recorder.recordCurrentState();
        recorder.stopRecording();

        global.performance.now = () => 20000;
        a.setRotation(0.5);
        recorder.startRecording(0.5);
        global.performance.now = () => 20500;
        a.setRotation(1.5);
        recorder.recordCurrentState();
        global.performance.now = () => 23000;
        a.setRotation(2.5);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}]);

        expect(recorder.states.diffs[1][0]).toBe(0.5);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 0.5,
          '.stateTime': 20,
        });
        expect(recorder.states.diffs[2][0]).toBe(1);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1.5,
          '.stateTime': 20.5,
        });
        expect(recorder.states.diffs[3][0]).toBe(3.5);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2.5,
          '.stateTime': 23,
        });
        expect(recorder.states.diffs[4][0]).toBe(4);
        expect(recorder.states.diffs[4][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2,
          '.stateTime': 14,
        });
      });
      test('New states from after 0 to beyond end', () => {
        const { a } = diagram.elements.elements;
        global.performance.now = () => 10000;
        a.setRotation(0);
        recorder.startRecording();
        global.performance.now = () => 13000;
        a.setRotation(1);
        recorder.recordCurrentState();
        global.performance.now = () => 14000;
        a.setRotation(2);
        recorder.recordCurrentState();
        recorder.stopRecording();

        global.performance.now = () => 20000;
        a.setRotation(0.5);
        recorder.startRecording(0.5);
        global.performance.now = () => 20500;
        a.setRotation(1.5);
        recorder.recordCurrentState();
        global.performance.now = () => 26000;
        a.setRotation(2.5);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}]);

        expect(recorder.states.diffs[1][0]).toBe(0.5);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 0.5,
          '.stateTime': 20,
        });
        expect(recorder.states.diffs[2][0]).toBe(1);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 1.5,
          '.stateTime': 20.5,
        });
        expect(recorder.states.diffs[3][0]).toBe(6.5);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[2].state[1]': 2.5,
          '.stateTime': 26,
        });
        expect(recorder.states.diffs).toHaveLength(4);
      });
    });
    describe('Merge Cache', () => {
      test('Empty Events', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        recorder.stopRecording();
        const cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2]]);
      });
      test('New events from start to beyond', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        recorder.stopRecording();

        let cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2]]);

        global.performance.now = () => 20000;
        recorder.startRecording(0);
        global.performance.now = () => 22000;
        recorder.recordEvent('cursorMove', [3, 3]);
        global.performance.now = () => 26000;
        recorder.recordEvent('cursorMove', [4, 4]);
        recorder.stopRecording();


        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([2, [3, 3]]);
        expect(cursorMoveEvents[1]).toEqual([6, [4, 4]]);
      });
      test('New events from start to before end', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        recorder.stopRecording();

        let cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2]]);

        global.performance.now = () => 20000;
        recorder.startRecording(0);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [3, 3]);
        global.performance.now = () => 23000;
        recorder.recordEvent('cursorMove', [4, 4]);
        recorder.stopRecording();


        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([1, [3, 3]]);
        expect(cursorMoveEvents[1]).toEqual([3, [4, 4]]);
        expect(cursorMoveEvents[2]).toEqual([4, [2, 2]]);
      });
      test('New events after start to before end', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        global.performance.now = () => 15000;
        recorder.recordEvent('cursorMove', [3, 3]);
        recorder.stopRecording();

        let cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2]]);
        expect(cursorMoveEvents[2]).toEqual([5, [3, 3]]);

        global.performance.now = () => 20000;
        recorder.startRecording(3.5);
        global.performance.now = () => 20500;
        recorder.recordEvent('cursorMove', [6, 6]);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [7, 7]);
        recorder.stopRecording();

        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [6, 6]]);
        expect(cursorMoveEvents[2]).toEqual([4.5, [7, 7]]);
        expect(cursorMoveEvents[3]).toEqual([5, [3, 3]]);
      });
      test('New events after start to after end', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        global.performance.now = () => 14000;
        recorder.recordEvent('cursorMove', [2, 2]);
        global.performance.now = () => 15000;
        recorder.recordEvent('cursorMove', [3, 3]);
        recorder.stopRecording();

        let cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2]]);
        expect(cursorMoveEvents[2]).toEqual([5, [3, 3]]);

        global.performance.now = () => 20000;
        recorder.startRecording(4);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [6, 6]);
        global.performance.now = () => 23000;
        recorder.recordEvent('cursorMove', [7, 7]);
        recorder.stopRecording();

        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1]]);
        expect(cursorMoveEvents[1]).toEqual([5, [6, 6]]);
        expect(cursorMoveEvents[2]).toEqual([7, [7, 7]]);
      });
    });
  });
  describe('State cycle', () => {
    let state1;
    let state2;
    let state3;
    let line;
    // let recorder;
    beforeEach(() => {
      recorder.reset();
      diagram.addElement({
        name: 'line',
        method: 'line',
        options: {
          width: 0.01,
          p1: [0, 0],
          p2: [0, 1],
          transform: new Transform('lineT')
            .translate(0, 0).rotate(0).scale(1, 1),
        },
      });
      diagram.initialize();
      global.performance.now = () => 1000;
      state1 = diagram.getState();

      line = diagram.getElement('line');
      line.transform.updateTranslation(0, 1);
      global.performance.now = () => 2000;
      state2 = diagram.getState();

      line.transform.updateTranslation(0, 2);
      global.performance.now = () => 3000;
      state3 = diagram.getState();
      // recorder.states = {
      //   states: [],
      //   map: new tools.UniqueMap(),
      //   reference: [],
      // };
      // ({ recorder } = diagram);
    });
    test('addReferenceState', () => {
      line.setEndPoints([1, 1], [2, 1]);
      diagram.setState(state1);
      const state4 = diagram.getState();
      expect(state4.elements).toEqual(state1.elements);

      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      expect(recorder.states.references.ref1.diff).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 2,
        },
      });
    });
    test('getReferenceState', () => {
      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      const ref1 = recorder.states.getReference('__base');
      const ref2 = recorder.states.getReference('ref1');
      diagram.setState(ref1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);
      diagram.setState(ref2);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 0 reference', () => {
      diagram.setState(state1);
      recorder.stateTimeStep = 1;
      global.performance.now = () => 10000;
      recorder.startRecording();
      diagram.setState(state2);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      global.performance.now = () => 12000;
      // jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      expect(recorder.states.diffs[0]).toEqual([0, '__base', {}]);
      expect(recorder.states.diffs[1]).toEqual([
        1,
        '__base',
        {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        },
      ]);
      expect(recorder.states.diffs).toHaveLength(2);
      diagram.setState(recorder.states.getFromIndex(0));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      diagram.setState(recorder.states.getFromIndex(1));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 1 reference', () => {
      diagram.setState(state1);
      recorder.stateTimeStep = 1;
      global.performance.now = () => 10000;
      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      recorder.startRecording();
      diagram.setState(state3);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      global.performance.now = () => 12000;
      recorder.stopRecording();

      expect(recorder.states.diffs[1]).toEqual([
        1,
        '__base',
        {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 2,
            '.stateTime': 11,
          },
        },
      ]);

      expect(recorder.states.diffs).toHaveLength(2);
      diagram.setState(state1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      diagram.setState(recorder.states.getFromIndex(1));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(2);
    });
    test('minify simple', () => {
      recorder.getDiagramState = () => ({ elements: 1 });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.getDiagramState = () => ({ elements: 2.1234567 });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, false, 3);
      const expected = {
        map: {
          map: {
            precision: 'a',
            elements: 'b',
            baseReference: 'c',
            references: 'd',
            __base: 'e',
            '.elements': 'f',
            diff: 'g',
            diffs: 'h',
            lastReferenceName: 'i',
          },
          index: 10,
          inverseMap: {},
          letters: '0abcdefghijklmnopqrstuvwxz',
          undefinedCode: '.a',
        },
        minified: {
          a: 4,
          c: { b: 1 },
          d: {},
          h: [
            [0, 'e', {}],
            [1, 'e', { g: { f: 2.124 } }],
          ],
          i: 'e',
        },
      };

      expect(encoded).toEqual(expected);

      const decoded = recorder.decodeStates(encoded, true, false);
      const decodeExpected = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: { elements: 1 },
        references: {},
        diffs: [
          [0, '__base', {}],
          [1, '__base', { diff: { '.elements': 2.124 } }],
        ],
      };
      expect(decoded).toEqual(decodeExpected);
    });
    test('minify simple as object', () => {
      recorder.getDiagramState = () => ({ elements: 1 });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.getDiagramState = () => ({ elements: 2.1234567 });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, true, 3);
      const expected = {
        map: {
          map: {
            elements: 'a',
            baseReference: 'b',
            __base: 'c',
            diff: 'd',
            diffs: 'e',
            references: 'f',
            precision: 'g',
            lastReferenceName: 'h',
          },
          index: 9,
          inverseMap: {},
          letters: '0abcdefghijklmnopqrstuvwxz',
          undefinedCode: '.a',
        },
        minified: {
          b: { a: 1 },
          e: [
            [0, 'c', {}],
            [1, 'c', { d: { a: 2.124 } }],
          ],
          f: {},
          g: 4,
          h: 'c',
        },
      };

      expect(encoded).toEqual(expected);

      const decoded = recorder.decodeStates(encoded, true, true);
      const decodeExpected = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: { elements: 1 },
        references: {},
        diffs: [
          [0, '__base', {}],
          [1, '__base', { diff: { '.elements': 2.124 } }],
        ],
      };
      expect(decoded).toEqual(decodeExpected);
    });
    test('minify nested', () => {
      recorder.getDiagramState = () => ({ elements: { e1: 1, e2: 2 } });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.getDiagramState = () => ({ elements: { e1: 2, e2: 2 } });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, false, 3);
      const expectedEncoded = {
        minified: {
          a: 4,
          e: { d: { b: 1, c: 2 } },
          f: {},
          j: [
            [0, 'g', {}],
            [1, 'g', { i: { h: 2 } }],
          ],
          k: 'g',
        },
        map: {
          map: {
            precision: 'a',
            e1: 'b',
            e2: 'c',
            elements: 'd',
            baseReference: 'e',
            references: 'f',
            __base: 'g',
            '.elements.e1': 'h',
            diff: 'i',
            diffs: 'j',
            lastReferenceName: 'k',
          },
          index: 12,
          inverseMap: {},
          letters: '0abcdefghijklmnopqrstuvwxz',
          undefinedCode: '.a',
        },
      };
      expect(encoded).toEqual(expectedEncoded);
      const decoded = recorder.decodeStates(encoded, true, false);

      const expectedDecoded = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: { elements: { e1: 1, e2: 2 } },
        references: {},
        diffs: [
          [0, '__base', {}],
          [1, '__base', { diff: { '.elements.e1': 2 } }],
        ],
      };
      expect(decoded).toEqual(expectedDecoded);

      recorder.reset();
      const expectedReset = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: null,
        references: {},
        diffs: [],
      };
      expect(recorder.states).toEqual(expectedReset);

      recorder.loadStates(encoded, true, false);
      expect(recorder.states).toEqual(expectedDecoded);
    });
    test('minify nested as object', () => {
      recorder.getDiagramState = () => ({ elements: { e1: 1, e2: 2 } });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.getDiagramState = () => ({ elements: { e1: 2, e2: 2 } });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, true, 3);
      const expectedEncoded = {
        minified: {
          d: { c: { a: 1, b: 2 } },
          g: [
            [0, 'e', {}],
            [1, 'e', { f: { c: { a: 2 } } }],
          ],
          h: {},
          i: 4,
          j: 'e',
        },
        map: {
          map: {
            e1: 'a',
            e2: 'b',
            elements: 'c',
            baseReference: 'd',
            __base: 'e',
            diff: 'f',
            diffs: 'g',
            references: 'h',
            precision: 'i',
            lastReferenceName: 'j',
          },
          index: 11,
          inverseMap: {},
          letters: '0abcdefghijklmnopqrstuvwxz',
          undefinedCode: '.a',
        },
      };
      expect(encoded).toEqual(expectedEncoded);
      const decoded = recorder.decodeStates(encoded, true, true);

      const expectedDecoded = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: { elements: { e1: 1, e2: 2 } },
        references: {},
        diffs: [
          [0, '__base', {}],
          [1, '__base', { diff: { '.elements.e1': 2 } }],
        ],
      };
      expect(decoded).toEqual(expectedDecoded);

      recorder.reset();
      const expectedReset = {
        lastReferenceName: '__base',
        precision: 4,
        baseReference: null,
        references: {},
        diffs: [],
      };
      expect(recorder.states).toEqual(expectedReset);

      recorder.loadStates(encoded, true, true);
      expect(recorder.states).toEqual(expectedDecoded);
    });
    test('diagram simple', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        }],
      ];
      expect(recorder.states.diffs).toEqual(expectedDiffs);

      const encoded = recorder.encodeStates(true, false, 4);
      recorder.reset();
      recorder.loadStates(encoded, true, false);

      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
    test('diagram', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);

      line.setPosition(1, 2);
      global.performance.now = () => 12000;
      jest.advanceTimersByTime(1000);
      recorder.recordCurrentStateAsReference('ref1');

      line.setPosition(1, 3);
      recorder.reference = 'ref1';
      global.performance.now = () => 13000;
      jest.advanceTimersByTime(1000);

      recorder.stopRecording();

      expect(recorder.states.references).toEqual({
        ref1: {
          diff: {
            diff: {
              '.elements.elements.line.transform.state[3].state[1]': 1,
              '.elements.elements.line.transform.state[3].state[2]': 2,
              '.stateTime': 12,
            },
          },
          basedOn: '__base',
        },
      });
      expect(recorder.states.diffs).toEqual([
        [0, '__base', {}],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        }],
        [2, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[1]': 1,
            '.elements.elements.line.transform.state[3].state[2]': 2,
            '.stateTime': 12,
          },
        }],
        [3, 'ref1', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 3,
            '.stateTime': 13,
          },
        }],
      ]);

      const encoded = recorder.encodeStates(true, false, 4);
      recorder.reset();
      recorder.loadStates(encoded, true, false);

      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().x).toBe(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().x).toBe(0);
      expect(line.getPosition().y).toBe(1);
      recorder.setState(2);
      expect(line.getPosition().x).toBe(1);
      expect(line.getPosition().y).toBe(2);
      recorder.setState(3);
      expect(line.getPosition().x).toBe(1);
      expect(line.getPosition().y).toBe(3);
    });
    test('diagram Simple as Object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        }],
      ];
      expect(recorder.states.diffs).toEqual(expectedDiffs);

      const encoded = recorder.encodeStates(true, true, 4);
      recorder.reset();
      recorder.loadStates(encoded, true, true);

      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
    test('diagram as object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);

      line.setPosition(1, 2);
      global.performance.now = () => 12000;
      jest.advanceTimersByTime(1000);
      recorder.recordCurrentStateAsReference('ref1');

      line.setPosition(1, 3);
      recorder.reference = 'ref1';
      global.performance.now = () => 13000;
      jest.advanceTimersByTime(1000);

      recorder.stopRecording();

      expect(recorder.states.references).toEqual({
        ref1: {
          diff: {
            diff: {
              '.elements.elements.line.transform.state[3].state[1]': 1,
              '.elements.elements.line.transform.state[3].state[2]': 2,
              '.stateTime': 12,
            },
          },
          basedOn: '__base',
        },
      });
      expect(recorder.states.diffs).toEqual([
        [0, '__base', {}],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        }],
        [2, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[1]': 1,
            '.elements.elements.line.transform.state[3].state[2]': 2,
            '.stateTime': 12,
          },
        }],
        [3, 'ref1', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 3,
            '.stateTime': 13,
          },
        }],
      ]);

      const encoded = recorder.encodeStates(true, true, 4);
      recorder.reset();
      recorder.loadStates(encoded, true, true);

      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().x).toBe(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().x).toBe(0);
      expect(line.getPosition().y).toBe(1);
      recorder.setState(2);
      expect(line.getPosition().x).toBe(1);
      expect(line.getPosition().y).toBe(2);
      recorder.setState(3);
      expect(line.getPosition().x).toBe(1);
      expect(line.getPosition().y).toBe(3);
    });
    test('diagram Simple as stringified object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[3].state[2]': 1,
            '.stateTime': 11,
          },
        }],
      ];
      expect(recorder.states.diffs).toEqual(expectedDiffs);

      const encoded = recorder.encodeStates(true, true, 4);
      const jsonEncoded = JSON.stringify(encoded);
      const parsedJSON = JSON.parse(jsonEncoded);
      recorder.reset();
      recorder.loadStates(parsedJSON, true, true);

      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
  });
  describe.only('Recorder Events', () => {
    test.only('Event Simple', () => {
      let x = 0;
      let y = 0;
      const onPlayback = jest.fn((payload) => {
        [x, y] = payload;
      });
      recorder.addEventType('cursorMove', onPlayback, true);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(recorder.events.cursorMove.list).toEqual([
        [0.1, [1, 1], 0],
        [0.2, [2, 2], 0],
      ]);

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1000;
      recorder.startPlayback(0);
      expect(onPlayback.mock.calls.length).toBe(0);
      global.performance.now = () => 1090;
      jest.advanceTimersByTime(90);

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1100;
      jest.advanceTimersByTime(10);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      global.performance.now = () => 1200;
      jest.advanceTimersByTime(100);

      expect(onPlayback.mock.calls.length).toBe(2);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    test('Seek to on event', () => {
      let x = 0;
      let y = 0;
      const onPlayback = jest.fn((payload) => {
        [x, y] = payload;
      });
      recorder.addEventType('cursorMove', onPlayback, true);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1000;
      recorder.startPlayback(0.1);
      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      global.performance.now = () => 1090;
      jest.advanceTimersByTime(90);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      global.performance.now = () => 1100;
      jest.advanceTimersByTime(10);

      expect(onPlayback.mock.calls.length).toBe(2);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    test.only('Seek to after event without set on seek', () => {
      let x = 0;
      let y = 0;
      const onPlayback = jest.fn((payload) => {
        [x, y] = payload;
      });
      recorder.addEventType('cursorMove', onPlayback, false);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1000;
      recorder.startPlayback(0.15);
      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1040;
      jest.advanceTimersByTime(40);

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1050;
      jest.advanceTimersByTime(10);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    test('Seek to after event with set on seek', () => {
      let x = 0;
      let y = 0;
      const onPlayback = jest.fn((payload) => {
        [x, y] = payload;
      });
      recorder.addEventType('cursorMove', onPlayback, true);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      global.performance.now = () => 1000;
      recorder.startPlayback(0.15);
      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      global.performance.now = () => 1040;
      jest.advanceTimersByTime(40);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      global.performance.now = () => 1050;
      jest.advanceTimersByTime(10);

      expect(onPlayback.mock.calls.length).toBe(2);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    // test('Events', () => {
    //   recorder.addEventType('start', () => {});
    //   recorder.addEventType('showCursor', () => {});
    //   recorder.addEventType('TouchDown', () => {});
    //   recorder.addEventType('CursorMove', () => {});
    //   recorder.addEventType('TouchUp', () => {});
    //   recorder.addEventType('hideCursor', () => {});
    //   global.performance.now = () => 0;
    //   recorder.startRecording();
    //   global.performance.now = () => 100;
    //   recorder.recordEvent('showCursor', [1, 1]);
    //   global.performance.now = () => 200;
    //   recorder.recordEvent('TouchDown', [1, 1]);
    //   global.performance.now = () => 250;
    //   recorder.recordEvent('CursorMove', [1.5, 1.5]);
    //   global.performance.now = () => 600;
    //   recorder.recordEvent('TouchUp');
    //   global.performance.now = () => 700;
    //   recorder.recordEvent('hideCursor');
    //   recorder.stopRecording();
    //   console.log(recorder.events);
    //   console.log(recorder.eventsCache);
    //   expect(recorder.events[0]).toEqual([0, ['start']]);
    //   expect(recorder.events[1]).toEqual([0.1, ['showCursor', 1, 1]]);
    //   expect(recorder.events[2]).toEqual([0.2, ['TouchDown', 1, 1]]);
    //   expect(recorder.events[3]).toEqual([0.25, ['CursorMove', 1.5, 1.5]]);
    //   expect(recorder.events[4]).toEqual([0.6, ['TouchUp']]);
    //   expect(recorder.events[5]).toEqual([0.7, ['hideCursor']]);
    //   expect(recorder.events).toHaveLength(6);
    // });
    // test('States', () => {
    //   global.performance.now = () => 0;
    //   recorder.stateTimeStep = 0.5;
    //   recorder.startRecording();
    //   global.performance.now = () => 500;
    //   jest.advanceTimersByTime(500);
    //   global.performance.now = () => 1000;
    //   jest.advanceTimersByTime(500);
    //   recorder.stopRecording();
    //   expect(recorder.states.reference).toHaveLength(1);
    //   expect(recorder.states.reference[0].elements.elements.a.isShown).toBe(true);
    //   expect(recorder.states.states).toHaveLength(3);
    //   expect(recorder.states.states[0][0]).toBe(0);
    //   expect(recorder.states.states[1][0]).toBe(0.5);
    //   expect(recorder.states.states[2][0]).toBe(1);
    // });
    // test('Slides', () => {
    //   global.performance.now = () => 0;
    //   recorder.stateTimeStep = 0.5;
    //   recorder.startRecording();
    //   global.performance.now = () => 500;
    //   recorder.recordSlide('next', '', 1);
    //   global.performance.now = () => 1000;
    //   recorder.recordSlide('next', '', 2);
    //   recorder.stopRecording();
    //   expect(recorder.slides).toHaveLength(3);
    //   expect(recorder.slides[0]).toEqual([0, ['goto', '', 0]]);
    //   expect(recorder.slides[1]).toEqual([0.5, ['next', '', 1]]);
    //   expect(recorder.slides[2]).toEqual([1, ['next', '', 2]]);
    // });
  });
});
