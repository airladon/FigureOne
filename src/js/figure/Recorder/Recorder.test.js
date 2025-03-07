import {
  Point, Transform,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import {
  getNextIndexForTime,
  getPrevIndexForTime,
  getIndexOfEarliestTime,
  getIndexOfLatestTime,
} from './Recorder';
import Worker from '../../__mocks__/recorder.worker.mock';

tools.isTouchDevice = jest.fn();

// jest.mock('./webgl/webgl');
jest.mock('./recorder.worker');

describe('Figure Recorder', () => {
  let figure;
  let recorder;
  let events;
  let cursor;
  let timeStep;
  let initialTime;
  let duration;
  let check;
  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
    figure = makeFigure();
    figure.scene.setCamera({ position: [0, 0, 2] });
    figure.scene.setProjection({ near: 1, far: 3 });
    ({ recorder } = figure);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    recorder.stateTimeStep = 1;
    events = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
    figure.add([
      {
        name: 'a',
        make: 'polygon',
        options: {
          color: [1, 0, 0, 1],
          radius: 1,
          width: 0.1,
        },
      },
      {
        name: '_cursor_',
        make: 'collections.cursor',
        options: {
          width: 0.01,
          color: [0, 1, 0, 1],
          radius: 0.1,
        },
      },
    ]);
    figure.initialize();
    cursor = figure.getCursor();

    duration = 0;
    initialTime = 1;

    timeStep = (deltaTimeInSeconds) => {
      const newNow = (duration + deltaTimeInSeconds + initialTime) * 1000;
      global.performance.now = () => newNow;
      jest.advanceTimersByTime((deltaTimeInSeconds * 1000));
      duration += deltaTimeInSeconds;
      figure.animateNextFrame();
      figure.draw(newNow / 1000);
    };
    check = (isShown, up, down, x, y, currentTime) => {
      expect(cursor.isShown).toBe(isShown);
      if (up != null) {
        expect(cursor._up.isShown).toBe(up);
      }
      if (down != null) {
        expect(cursor._down.isShown).toBe(down);
      }
      if (x != null && y != null) {
        expect(cursor.getPosition()).toEqual(new Point(x, y));
      }
      expect(round(recorder.getCurrentTime(), 3)).toEqual(currentTime);
    };
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
        // recorder.addEventType('cursor', () => {}, true);
        // recorder.addEventType('cursorMove', () => {}, true);
        // recorder.addEventType('touch', () => {}, true);
        recorder.addEventType('doNothing', () => {}, true);
        initialTime = 0;
        timeStep(0);
        global.performance.now = () => 0;
        cursor.hide();
        recorder.startRecording();
        timeStep(1);
        // recorder.recordEvent('cursor', ['show', 0, 0]);
        figure.mock.touchMove([0, 0]);
        figure.toggleCursor();
        timeStep(1);
        // recorder.recordEvent('cursorMove', [1, 1]);
        figure.mock.touchMove([1, 1]);
        timeStep(1);
        // recorder.recordEvent('cursorMove', [2, 2]);
        figure.mock.touchMove([2, 2]);
        timeStep(1);
        // recorder.recordEvent('touch', ['down', 3, 3]);
        figure.mock.touchDown([3, 3]);
        timeStep(1);
        // recorder.recordEvent('cursorMove', [4, 4]);
        figure.mock.touchMove([4, 4]);
        timeStep(1);
        // recorder.recordEvent('cursorMove', [5, 5]);
        figure.mock.touchMove([5, 5]);
        timeStep(1);
        // recorder.recordEvent('touch', 'up');
        figure.mock.touchUp();
        timeStep(1);
        // recorder.recordEvent('cursorMove', [7, 7]);
        figure.mock.touchMove([7, 7]);
        timeStep(1);
        // recorder.recordEvent('cursorMove', [8, 8]);
        figure.mock.touchMove([8, 8]);
        timeStep(1);
        // recorder.recordEvent('cursor', ['hide']);
        figure.toggleCursor();
        timeStep(1);
        recorder.recordEvent('doNothing');
        recorder.stopRecording();
      });
      test('Negative Index', () => {
        recorder.seek(-1);
        expect(cursor.isShown).toBe(false);
      });
      test('Start', () => {
        recorder.seek(0);
        expect(cursor.isShown).toBe(false);
      });
      test('On Show', () => {
        recorder.seek(1);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(true);
        expect(cursor._down.isShown).toBe(false);
        expect(cursor.getPosition()).toEqual(new Point(0, 0));
      });
      test('Between Show and Down', () => {
        recorder.seek(2);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(true);
        expect(cursor._down.isShown).toBe(false);
        expect(cursor.getPosition()).toEqual(new Point(1, 1));
      });
      test('On Down', () => {
        recorder.seek(4);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(false);
        expect(cursor._down.isShown).toBe(true);
        expect(cursor.getPosition()).toEqual(new Point(3, 3));
      });
      test('Between Down and Up', () => {
        recorder.seek(5);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(false);
        expect(cursor._down.isShown).toBe(true);
        expect(cursor.getPosition()).toEqual(new Point(4, 4));
      });
      test('On Up', () => {
        recorder.seek(7);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(true);
        expect(cursor._down.isShown).toBe(false);
        expect(cursor.getPosition()).toEqual(new Point(5, 5));
      });
      test('Between up and hide', () => {
        recorder.seek(8);
        expect(cursor.isShown).toBe(true);
        expect(cursor._up.isShown).toBe(true);
        expect(cursor._down.isShown).toBe(false);
        expect(cursor.getPosition()).toEqual(new Point(7, 7));
      });
      test('On hide', () => {
        recorder.seek(10);
        expect(cursor.isShown).toBe(false);
      });
      test('After hide', () => {
        recorder.seek(11);
        expect(cursor.isShown).toBe(false);
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
        recorder.stopRecording();

        const cache = recorder.eventsCache.cursorMove.list;
        expect(cache[0]).toEqual([3, [1, 1], 0]);
        expect(cache[1]).toEqual([4, [2, 2], 0]);
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
        recorder.stopRecording();
        const cursorMoveCache = recorder.eventsCache.cursorMove.list;
        expect(cursorMoveCache[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveCache[1]).toEqual([4, [2, 2], 0]);
        const touchDownCache = recorder.eventsCache.touchDown.list;
        expect(touchDownCache[0]).toEqual([2, [0.5, 0.5], 0]);
      });
      test('Event type not in events', () => {
        recorder.events = {};
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        global.performance.now = () => 10000;
        recorder.startRecording();
        global.performance.now = () => 12000;
        recorder.recordEvent('touchDown', [0.5, 0.5]);
        global.performance.now = () => 13000;
        recorder.recordEvent('cursorMove', [1, 1]);
        recorder.stopRecording();
        expect(recorder.eventsCache.touchDown).toBe(undefined);
        const cursorMoveCache = recorder.eventsCache.cursorMove.list;
        expect(cursorMoveCache[0]).toEqual([3, [1, 1], 0]);
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
        recorder.stopRecording();
        const startTime = recorder.getCacheStartTime();
        const endTime = recorder.getCacheEndTime();

        expect(startTime).toBe(0);
        expect(endTime).toBe(4);
      });
      test('Non zero start', () => {
        recorder.addEventType('cursorMove', () => {}, true);

        // Starting at 10 seconds global time
        initialTime = 10;
        timeStep(0);
        recorder.startRecording(2);
        timeStep(3);
        recorder.recordEvent('cursorMove', [1, 1]);
        timeStep(1);
        recorder.recordEvent('cursorMove', [2, 2]);
        recorder.stopRecording();
        const startTime = recorder.getCacheStartTime();
        const endTime = recorder.getCacheEndTime();

        expect(startTime).toBe(2);
        expect(endTime).toBe(6);
      });
    });
    describe('Merge States', () => {
      test('Empty States', () => {
        const { a } = figure.elements.elements;
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
          '.elements.elements.a.transform.state[1][1]': 1,
          '.stateTime': 13,
        });

        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 2,
          '.stateTime': 14,
        });
      });
      // only
      test('New states from 0 to beyond end', () => {
        const { a } = figure.elements.elements;
        figure.getCursor().hide();
        initialTime = 10;
        timeStep(0);
        a.setRotation(0);
        recorder.startRecording();
        a.setRotation(1);
        timeStep(1);
        timeStep(1);
        a.setRotation(2);
        timeStep(1);
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}, 0]);
        expect(recorder.states.diffs[1][0]).toBe(1);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 1,
          '.stateTime': 11,
        });
        expect(recorder.states.diffs[2][0]).toBe(2);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 1,
          '.stateTime': 12,
          '.lastDrawTime': 11,
        });
        expect(recorder.states.diffs[3][0]).toBe(3);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 2,
          '.stateTime': 13,
          '.lastDrawTime': 12,
        });
        expect(recorder.states.diffs).toHaveLength(4);

        initialTime = 20;
        duration = 0;
        // global.performance.now = () => 20000;
        timeStep(0);
        recorder.startRecording();
        a.setRotation(0.5);
        timeStep(1);
        a.setRotation(1.5);
        timeStep(1);
        timeStep(1);
        a.setRotation(2.5);
        timeStep(1);
        // recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0][0]).toBe(0);
        expect(recorder.states.diffs[0][2].diff).toEqual({
          // '.elements.elements.a.transform.state[1].state[1]': 0.5,
          '.stateTime': 20,
        });

        expect(recorder.states.diffs[1][0]).toBe(1);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 0.5,
          '.stateTime': 21,
        });
        expect(recorder.states.diffs[2][0]).toBe(2);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 1.5,
          '.stateTime': 22,
          '.lastDrawTime': 21,
        });
        expect(recorder.states.diffs[3][0]).toBe(3);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 1.5,
          '.stateTime': 23,
          '.lastDrawTime': 22,
        });
        expect(recorder.states.diffs[4][0]).toBe(4);
        expect(recorder.states.diffs[4][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 2.5,
          '.stateTime': 24,
          '.lastDrawTime': 23,
        });
        expect(recorder.states.diffs).toHaveLength(5);
      });
      test('New states from 0 to before end', () => {
        const { a } = figure.elements.elements;
        figure.getCursor().hide();
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
        recorder.startRecording(0);
        a.setRotation(0.5);
        global.performance.now = () => 20500;
        a.setRotation(1.5);
        recorder.recordCurrentState();
        global.performance.now = () => 23000;
        a.setRotation(2.5);
        recorder.recordCurrentState();
        recorder.stopRecording();

        expect(recorder.states.diffs[0][0]).toBe(0);
        expect(recorder.states.diffs[0][2].diff).toEqual({
          // '.elements.elements.a.transform.state[1].state[1]': 0.5,
          '.stateTime': 20,
        });

        expect(recorder.states.diffs[1][0]).toBe(0.5);
        expect(recorder.states.diffs[1][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 1.5,
          '.stateTime': 20.5,
        });
        expect(recorder.states.diffs[2][0]).toBe(3);
        expect(recorder.states.diffs[2][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 2.5,
          '.stateTime': 23,
        });
        expect(recorder.states.diffs[3][0]).toBe(4);
        expect(recorder.states.diffs[3][2].diff).toEqual({
          '.elements.elements.a.transform.state[1][1]': 2,
          '.stateTime': 14,
        });
      });
      test('New states from after 0 to before end', () => {
        const { a } = figure.elements.elements;
        figure.getCursor().hide();
        // global.performance.now = () => 10000;
        recorder.stateTimeStep = 1;
        initialTime = 10;
        duration = 0;
        timeStep(0);
        a.setRotation(0);
        recorder.startRecording();
        timeStep(1);
        timeStep(1);
        timeStep(1);
        a.setRotation(1);                 // 4
        timeStep(1);
        a.setRotation(2);                 // 5
        timeStep(1);
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}, 0]);
        expect(recorder.states.diffs[1]).toEqual([1, '__base', {
          diff: {
            '.stateTime': 11,
          },
        }, 0]);
        expect(recorder.states.diffs[2]).toEqual([2, '__base', {
          diff: {
            '.stateTime': 12,
            '.lastDrawTime': 11,
          },
        }, 0]);
        expect(recorder.states.diffs[3]).toEqual([3, '__base', {
          diff: {
            '.stateTime': 13,
            '.lastDrawTime': 12,
          },
        }, 0]);
        expect(recorder.states.diffs[4]).toEqual([4, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 1,
            '.stateTime': 14,
            '.lastDrawTime': 13,
          },
        }, 0]);
        expect(recorder.states.diffs[5]).toEqual([5, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 2,
            '.stateTime': 15,
            '.lastDrawTime': 14,
          },
        }, 0]);

        initialTime = 20;
        duration = 0;
        timeStep(0);
        recorder.startRecording(0.5);
        timeStep(0.5);
        timeStep(1);
        a.setRotation(1.6);
        timeStep(1);
        recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}, 0]);
        expect(recorder.states.diffs[1]).toEqual([1, '__base', {
          diff: {
            '.stateTime': 20.5,
          },
        }, 0]);
        expect(recorder.states.diffs[2]).toEqual([2, '__base', {
          diff: {
            '.stateTime': 21.5,
            '.lastDrawTime': 20.5,
          },
        }, 0]);
        expect(recorder.states.diffs[3]).toEqual([3, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 1.6,
            '.stateTime': 22.5,
            '.lastDrawTime': 21.5,
          },
        }, 0]);
        expect(recorder.states.diffs[4]).toEqual([4, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 1,
            '.stateTime': 14,
            '.lastDrawTime': 13,
          },
        }, 0]);
        expect(recorder.states.diffs[5]).toEqual([5, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 2,
            '.stateTime': 15,
            '.lastDrawTime': 14,
          },
        }, 0]);
      });
      test('New states from after 0 to beyond end', () => {
        figure.getCursor().hide();
        const { a } = figure.elements.elements;
        recorder.stateTimeStep = 1;
        initialTime = 10;
        duration = 0;
        timeStep(0);
        a.setRotation(0);
        recorder.startRecording();
        timeStep(1);
        timeStep(1);
        timeStep(1);
        a.setRotation(1);                 // 4
        timeStep(1);
        a.setRotation(2);                 // 5
        timeStep(1);
        recorder.stopRecording();

        initialTime = 20;
        duration = 0;
        timeStep(0);
        recorder.startRecording(0.5);
        timeStep(0.5);
        timeStep(1);
        a.setRotation(5);   // 3
        timeStep(1);
        timeStep(1);
        timeStep(1);
        a.setRotation(1.6);   // 6
        timeStep(1);
        recorder.stopRecording();
        // global.performance.now = () => 10000;
        // a.setRotation(0);
        // recorder.startRecording();
        // global.performance.now = () => 13000;
        // a.setRotation(1);
        // recorder.recordCurrentState();
        // global.performance.now = () => 14000;
        // a.setRotation(2);
        // recorder.recordCurrentState();
        // recorder.stopRecording();

        // global.performance.now = () => 20000;
        // // a.setRotation(0.5);
        // recorder.startRecording(0.5);
        // global.performance.now = () => 20500;
        // a.setRotation(1.5);
        // recorder.recordCurrentState();
        // global.performance.now = () => 26000;
        // a.setRotation(2.5);
        // recorder.recordCurrentState();
        // recorder.stopRecording();

        expect(recorder.states.diffs[0]).toEqual([0, '__base', {}, 0]);
        expect(recorder.states.diffs[1]).toEqual([1, '__base', {
          diff: {
            '.stateTime': 20.5,
          },
        }, 0]);
        expect(recorder.states.diffs[2]).toEqual([2, '__base', {
          diff: {
            '.stateTime': 21.5,
            '.lastDrawTime': 20.5,
          },
        }, 0]);
        expect(recorder.states.diffs[3]).toEqual([3, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 5,
            '.stateTime': 22.5,
            '.lastDrawTime': 21.5,
          },
        }, 0]);
        expect(recorder.states.diffs[4]).toEqual([4, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 5,
            '.stateTime': 23.5,
            '.lastDrawTime': 22.5,
          },
        }, 0]);
        expect(recorder.states.diffs[5]).toEqual([5, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 5,
            '.stateTime': 24.5,
            '.lastDrawTime': 23.5,
          },
        }, 0]);
        expect(recorder.states.diffs[6]).toEqual([6, '__base', {
          diff: {
            '.elements.elements.a.transform.state[1][1]': 1.6,
            '.stateTime': 25.5,
            '.lastDrawTime': 24.5,
          },
        }, 0]);
      });
    });
    describe('Merge Events', () => {
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);

        global.performance.now = () => 20000;
        recorder.startRecording(0);
        global.performance.now = () => 22000;
        recorder.recordEvent('cursorMove', [3, 3]);
        global.performance.now = () => 26000;
        recorder.recordEvent('cursorMove', [4, 4]);
        recorder.stopRecording();


        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([2, [3, 3], 0]);
        expect(cursorMoveEvents[1]).toEqual([6, [4, 4], 0]);
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);

        global.performance.now = () => 20000;
        recorder.startRecording(0);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [3, 3]);
        global.performance.now = () => 23000;
        recorder.recordEvent('cursorMove', [4, 4]);
        recorder.stopRecording();


        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([1, [3, 3], 0]);
        expect(cursorMoveEvents[1]).toEqual([3, [4, 4], 0]);
        expect(cursorMoveEvents[2]).toEqual([4, [2, 2], 0]);
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);
        expect(cursorMoveEvents[2]).toEqual([5, [3, 3], 0]);

        global.performance.now = () => 20000;
        recorder.startRecording(3.5);
        global.performance.now = () => 20500;
        recorder.recordEvent('cursorMove', [6, 6]);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [7, 7]);
        recorder.stopRecording();

        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [6, 6], 0]);
        expect(cursorMoveEvents[2]).toEqual([4.5, [7, 7], 0]);
        expect(cursorMoveEvents[3]).toEqual([5, [3, 3], 0]);
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);
        expect(cursorMoveEvents[2]).toEqual([5, [3, 3], 0]);

        global.performance.now = () => 20000;
        recorder.startRecording(4);
        global.performance.now = () => 21000;
        recorder.recordEvent('cursorMove', [6, 6]);
        global.performance.now = () => 23000;
        recorder.recordEvent('cursorMove', [7, 7]);
        recorder.stopRecording();

        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([5, [6, 6], 0]);
        expect(cursorMoveEvents[2]).toEqual([7, [7, 7], 0]);
      });
      test('New blank events', () => {
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
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([4, [2, 2], 0]);
        expect(cursorMoveEvents[2]).toEqual([5, [3, 3], 0]);

        global.performance.now = () => 20000;
        recorder.startRecording(3.5);
        global.performance.now = () => 21000;
        global.performance.now = () => 21400;
        recorder.stopRecording();

        cursorMoveEvents = recorder.events.cursorMove.list;
        expect(cursorMoveEvents[0]).toEqual([3, [1, 1], 0]);
        expect(cursorMoveEvents[1]).toEqual([5, [3, 3], 0]);
      });
    });
  });
  describe('Reference States, Encoding, basic figure', () => {
    let state1;
    let state2;
    let state3;
    let line;
    // let recorder;
    beforeEach(() => {
      recorder.reset();
      figure.add({
        name: 'line',
        make: 'primitives.line',
        options: {
          width: 0.01,
          p1: [0, 0],
          p2: [0, 1],
          transform: new Transform()
            .scale(1, 1).rotate(0).translate(0, 0),
        },
      });
      figure.initialize();
      global.performance.now = () => 1000;
      state1 = figure.getState();

      line = figure.getElement('line');
      line.transform.updateTranslation([0, 1]);
      global.performance.now = () => 2000;
      state2 = figure.getState();

      line.transform.updateTranslation([0, 2]);
      global.performance.now = () => 3000;
      state3 = figure.getState();
      // recorder.states = {
      //   states: [],
      //   map: new tools.UniqueMap(),
      //   reference: [],
      // };
      // ({ recorder } = figure);
    });
    test('addReferenceState', () => {
      line.setPosition([10, 10]);
      figure.setState(state1);
      const state4 = figure.getState();
      expect(state4.elements).toEqual(state1.elements);

      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      expect(recorder.states.references.ref1.diff).toEqual({
        diff: {
          '.elements.elements.line.transform.state[2][2]': 1,
          '.stateTime': 2,
        },
      });
    });
    test('getReferenceState', () => {
      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      const base = recorder.states.getReference('__base');
      const ref1 = recorder.states.getReference('ref1');
      figure.setState(base);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);
      figure.setState(ref1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 0 reference', () => {
      figure.setState(state1);
      recorder.stateTimeStep = 1;
      global.performance.now = () => 10000;
      recorder.startRecording();
      figure.setState(state2);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      global.performance.now = () => 12000;
      // jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      expect(recorder.states.diffs[0]).toEqual([0, '__base', {}, 0]);
      expect(recorder.states.diffs[1]).toEqual([
        1,
        '__base',
        {
          diff: {
            // '.elements.elements.cursor.isShown': true,
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        },
        0,
      ]);
      expect(recorder.states.diffs).toHaveLength(2);
      figure.setState(recorder.states.getFromIndex(0));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      figure.setState(recorder.states.getFromIndex(1));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 1 reference', () => {
      figure.setState(state1);
      recorder.stateTimeStep = 1;
      global.performance.now = () => 10000;
      recorder.states.setBaseReference(state1);
      recorder.states.addReference(state2, 'ref1');
      recorder.startRecording();
      figure.setState(state3);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      global.performance.now = () => 12000;
      recorder.stopRecording();

      expect(recorder.states.diffs[1]).toEqual([
        1,
        '__base',
        {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 2,
            '.stateTime': 11,
          },
        },
        0,
      ]);

      expect(recorder.states.diffs).toHaveLength(2);
      figure.setState(state1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      figure.setState(recorder.states.getFromIndex(1));
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(2);
    });
    test('encode simple', () => {
      recorder.figure.getState = () => ({ elements: 1 });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.figure.getState = () => ({ elements: 2.1234567 });
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
          a: 8,
          c: { b: 1 },
          d: {},
          h: [
            [0, 'e', {}, 0],
            [1, 'e', { g: { f: 2.123 } }, 0],
          ],
          i: 'e',
        },
      };

      expect(encoded).toEqual(expected);

      const decoded = recorder.decodeStates(encoded, true, false);
      const decodeExpected = {
        lastReferenceName: '__base',
        precision: 8,
        baseReference: { elements: 1 },
        references: {},
        diffs: [
          [0, '__base', {}, 0],
          [1, '__base', { diff: { '.elements': 2.123 } }, 0],
        ],
      };
      expect(decoded).toEqual(decodeExpected);
    });
    test('encode simple as object', () => {
      recorder.figure.getState = () => ({ elements: 1 });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.figure.getState = () => ({ elements: 2.1234567 });
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
            [0, 'c', {}, 0],
            [1, 'c', { d: { a: 2.123 } }, 0],
          ],
          f: {},
          g: 8,
          h: 'c',
        },
      };

      expect(encoded).toEqual(expected);

      const decoded = recorder.decodeStates(encoded, true, true);
      const decodeExpected = {
        lastReferenceName: '__base',
        precision: 8,
        baseReference: { elements: 1 },
        references: {},
        diffs: [
          [0, '__base', {}, 0],
          [1, '__base', { diff: { '.elements': 2.123 } }, 0],
        ],
      };
      expect(decoded).toEqual(decodeExpected);
    });
    test('encode nested', () => {
      recorder.figure.getState = () => ({ elements: { e1: 1, e2: 2 } });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.figure.getState = () => ({ elements: { e1: 2, e2: 2 } });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, false, 3);
      const expectedEncoded = {
        minified: {
          a: 8,
          e: { d: { b: 1, c: 2 } },
          f: {},
          j: [
            [0, 'g', {}, 0],
            [1, 'g', { i: { h: 2 } }, 0],
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
        precision: 8,
        baseReference: { elements: { e1: 1, e2: 2 } },
        references: {},
        diffs: [
          [0, '__base', {}, 0],
          [1, '__base', { diff: { '.elements.e1': 2 } }, 0],
        ],
      };
      expect(decoded).toEqual(expectedDecoded);

      recorder.reset();
      const expectedReset = {
        lastReferenceName: '__base',
        precision: 8,
        baseReference: null,
        references: {},
        diffs: [],
      };
      expect(recorder.states).toEqual(expectedReset);

      recorder.loadStates(encoded, true, false);
      expect(recorder.states).toEqual(expectedDecoded);
    });
    test('encode nested as object', () => {
      recorder.figure.getState = () => ({ elements: { e1: 1, e2: 2 } });
      global.performance.now = () => 10000;
      recorder.startRecording();
      recorder.figure.getState = () => ({ elements: { e1: 2, e2: 2 } });
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const encoded = recorder.encodeStates(true, true, 3);
      const expectedEncoded = {
        minified: {
          d: { c: { a: 1, b: 2 } },
          g: [
            [0, 'e', {}, 0],
            [1, 'e', { f: { c: { a: 2 } } }, 0],
          ],
          h: {},
          i: 8,
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
        precision: 8,
        baseReference: { elements: { e1: 1, e2: 2 } },
        references: {},
        diffs: [
          [0, '__base', {}, 0],
          [1, '__base', { diff: { '.elements.e1': 2 } }, 0],
        ],
      };
      expect(decoded).toEqual(expectedDecoded);

      recorder.reset();
      const expectedReset = {
        lastReferenceName: '__base',
        precision: 8,
        baseReference: null,
        references: {},
        diffs: [],
      };
      expect(recorder.states).toEqual(expectedReset);

      recorder.loadStates(encoded, true, true);
      expect(recorder.states).toEqual(expectedDecoded);
    });
    test('figure simple', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}, 0],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        }, 0],
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
    test('figure', () => {
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
              '.elements.elements.line.transform.state[2][1]': 1,
              '.elements.elements.line.transform.state[2][2]': 2,
              '.stateTime': 12,
            },
          },
          basedOn: '__base',
        },
      });
      expect(recorder.states.diffs).toEqual([
        [0, '__base', {}, 0],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        }, 0],
        [2, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][1]': 1,
            '.elements.elements.line.transform.state[2][2]': 2,
            '.stateTime': 12,
          },
        }, 0],
        [3, 'ref1', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 3,
            '.stateTime': 13,
          },
        }, 0],
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
    test('figure Simple as Object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}, 0],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        }, 0],
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
    test('figure as object', () => {
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
              '.elements.elements.line.transform.state[2][1]': 1,
              '.elements.elements.line.transform.state[2][2]': 2,
              '.stateTime': 12,
            },
          },
          basedOn: '__base',
        },
      });
      expect(recorder.states.diffs).toEqual([
        [0, '__base', {}, 0],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        }, 0],
        [2, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][1]': 1,
            '.elements.elements.line.transform.state[2][2]': 2,
            '.stateTime': 12,
          },
        }, 0],
        [3, 'ref1', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 3,
            '.stateTime': 13,
          },
        }, 0],
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
    test('figure Simple as stringified object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 10000;
      recorder.startRecording();

      line.setPosition(0, 1);
      global.performance.now = () => 11000;
      jest.advanceTimersByTime(1000);
      recorder.stopRecording();

      const expectedDiffs = [
        [0, '__base', {}, 0],
        [1, '__base', {
          diff: {
            '.elements.elements.line.transform.state[2][2]': 1,
            '.stateTime': 11,
          },
        }, 0],
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
  describe('Recorder Events', () => {
    test('Event Simple', () => {
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
      initialTime = 0;
      recorder.stateTimeStep = 0.1;
      timeStep(0);
      recorder.addEventType('cursorMove', onPlayback, true);
      // global.performance.now = () => 0;
      recorder.startRecording();
      // global.performance.now = () => 100;
      timeStep(0.1);
      recorder.recordEvent('cursorMove', [1, 1]);
      timeStep(0.1);
      // global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      // global.performance.now = () => 1000;
      initialTime = 1;
      duration = 0;
      timeStep(0);
      recorder.startPlayback(0.1);
      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      // global.performance.now = () => 1090;
      // jest.advanceTimersByTime(90);
      timeStep(0.09);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      // global.performance.now = () => 1100;
      // jest.advanceTimersByTime(10);
      timeStep(0.01);

      expect(onPlayback.mock.calls.length).toBe(2);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    test('Seek to after event without set on seek', () => {
      let x = 0;
      let y = 0;
      const onPlayback = jest.fn((payload) => {
        [x, y] = payload;
      });
      recorder.addEventType('cursorMove', onPlayback, false);
      figure.mock.timeStep(0);
      recorder.startRecording();
      figure.mock.timeStep(0.1);
      recorder.recordEvent('cursorMove', [1, 1]);
      figure.mock.timeStep(0.1);
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();
      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      figure.mock.timeStep(1);
      recorder.startPlayback(0.15);
      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      figure.mock.timeStep(0.04);

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);
      figure.mock.timeStep(0.01);

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
      initialTime = 0;
      recorder.stateTimeStep = 0.1;
      timeStep(0);
      recorder.addEventType('cursorMove', onPlayback, true);
      recorder.startRecording();
      timeStep(0.1);
      recorder.recordEvent('cursorMove', [1, 1]);
      timeStep(0.1);
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      expect(onPlayback.mock.calls.length).toBe(0);
      expect(x).toBe(0);
      expect(y).toBe(0);

      initialTime = 1;
      duration = 0;
      timeStep(0);
      recorder.startPlayback(0.15);
      // Note the last state is at 0.1, so that is where the current time
      // will start from (not 0.15)
      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);
      timeStep(0.09);

      expect(onPlayback.mock.calls.length).toBe(1);
      expect(x).toBe(1);
      expect(y).toBe(1);

      timeStep(0.01);

      expect(onPlayback.mock.calls.length).toBe(2);
      expect(x).toBe(2);
      expect(y).toBe(2);
    });
    test('Multiple events at same time', () => {
      let x = 5;
      const onPlaybackMul = jest.fn((payload) => {
        x *= payload;
      });
      const onPlaybackSum = jest.fn((payload) => {
        x += payload;
      });
      recorder.addEventType('mul', onPlaybackMul, true);
      recorder.addEventType('sum', onPlaybackSum, true);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('sum', 1);
      recorder.recordEvent('mul', 2);
      recorder.recordEvent('sum', -3);

      global.performance.now = () => 200;
      recorder.recordEvent('mul', 3);
      recorder.recordEvent('sum', 10);
      recorder.stopRecording();
      expect(x).toBe(5);

      global.performance.now = () => 1000;
      recorder.startPlayback(0);
      expect(x).toBe(5);

      global.performance.now = () => 1100;
      jest.advanceTimersByTime(100);
      expect(x).toBe(9);

      global.performance.now = () => 1200;
      jest.advanceTimersByTime(100);
      expect(x).toBe(37);

      expect(onPlaybackMul.mock.calls.length).toBe(2);
      expect(onPlaybackSum.mock.calls.length).toBe(3);
    });
    test('Seek to event with same time as state', () => {
      const a = figure.getElement('a');
      const onPlayback = jest.fn((payload) => {
        a.setPosition(payload[0], payload[1]);
      });
      recorder.addEventType('setPosition', onPlayback, true);
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('setPosition', [1, 1]);
      a.setPosition(-1, -1);
      recorder.recordCurrentState();

      global.performance.now = () => 200;
      a.setPosition(-2, -2);
      recorder.recordCurrentState();
      recorder.recordEvent('setPosition', [2, 2]);

      global.performance.now = () => 300;
      recorder.recordEvent('setPosition', [3, 3]);
      recorder.stopRecording();

      // state comes AFTER event
      recorder.seek(0.15);
      expect(onPlayback.mock.calls.length).toBe(0);
      expect(a.getPosition().x).toBe(-1);

      // state comes BEFORE event
      recorder.seek(0.25);
      expect(onPlayback.mock.calls.length).toBe(1);
      expect(a.getPosition().x).toBe(2);
    });
    test('Encode Events', () => {
      global.performance.now = () => 0;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      const expectedCursorMoveEventsList = [
        [0.1, [1, 1], 0],
        [0.2, [2, 2], 0],
      ];


      expect(recorder.events.cursorMove.list).toEqual(expectedCursorMoveEventsList);
      expect(recorder.events.cursor.list).toEqual([]);
      expect(recorder.events.touch.list).toEqual([]);

      const encoded = recorder.encodeEvents();
      recorder.reset();
      expect(recorder.events.cursorMove.list).toEqual([]);
      expect(recorder.events.cursor.list).toEqual([]);
      expect(recorder.events.touch.list).toEqual([]);

      recorder.loadEvents(encoded);
      expect(recorder.events.cursorMove.list).toEqual(expectedCursorMoveEventsList);
      expect(recorder.events.cursor.list).toEqual([]);
      expect(recorder.events.touch.list).toEqual([]);
    });
  });
  describe('General Record and Playback', () => {
    // let check;
    beforeEach(() => {
      recorder.stateTimeStep = 2;
      // duration = 0;
      cursor = figure.getCursor();
    });
    describe('Record', () => {
      test('Track Duration and current time during record', () => {
        timeStep(0);
        expect(recorder.duration).toBe(0);
        recorder.startRecording();
        expect(recorder.getCurrentTime()).toBe(0);
        timeStep(1);
        expect(recorder.getCurrentTime()).toBe(1);
        recorder.recordEvent('cursor', ['show', 0, 0]);   // 1
        expect(recorder.duration).toBe(1);
        timeStep(1);
        recorder.recordEvent('cursorMove', [2, 2]);       // 2
        expect(recorder.duration).toBe(2);
        timeStep(1);
        recorder.recordEvent('touch', ['down', 3, 3]);    // 3
        expect(recorder.duration).toBe(3);
        timeStep(1);
        recorder.recordEvent('cursorMove', [4, 4]);       // 4
        expect(recorder.duration).toBe(4);
        timeStep(1);
        recorder.recordEvent('cursorMove', [5, 5]);       // 5
        expect(recorder.duration).toBe(5);
        timeStep(1);
        recorder.recordEvent('touch', 'up');              // 6
        expect(recorder.duration).toBe(6);
        timeStep(1);
        recorder.recordEvent('cursorMove', [7, 7]);       // 7
        expect(recorder.duration).toBe(7);
        timeStep(1);
        recorder.recordEvent('cursorMove', [8, 8]);       // 8
        expect(recorder.duration).toBe(8);
        timeStep(1);
        expect(recorder.getCurrentTime()).toBe(9);
        recorder.recordEvent('cursor', ['hide']);         // 9
        expect(recorder.duration).toBe(9);
        timeStep(3);
        recorder.stopRecording();                         // 12
        expect(recorder.getCurrentTime()).toBe(12);
        expect(recorder.duration).toBe(12);
      });
      test('Playback some events during record', () => {
        recorder.stateTimeStep = 0.5;
        cursor.hide();
        timeStep(0);
        expect(recorder.duration).toBe(0);
        recorder.startRecording();
        timeStep(1);
        figure.mock.touchMove([1, 1]);    // 1
        figure.toggleCursor();
        timeStep(1);
        figure.mock.touchMove([2, 2]);    // 2
        timeStep(1);
        figure.mock.touchDown([2, 2]);    // 3
        timeStep(1);
        figure.mock.touchMove([3, 3]);    // 4
        timeStep(1);
        figure.mock.touchUp();            // 5
        timeStep(1);
        recorder.stopRecording();                         // 6
        initialTime = 10;
        duration = 0;
        timeStep(0);
        recorder.startRecording(1.5, ['touch']);
        check(true, true, false, 1, 1, 1.5);
        timeStep(0.1);
        // recorder.recordEvent('cursorMove', [3.5, 3.5]);
        figure.mock.touchMove([3.5, 3.5]);
        timeStep(0.4);
        check(true, true, false, 3.5, 3.5, 2);
        timeStep(1);
        check(true, false, true, 2, 2, 3);
        timeStep(1);
        timeStep(1);
        recorder.stopRecording();

        initialTime = 20;
        duration = 0;
        timeStep(0);
        recorder.startPlayback(0);
        check(false, null, null, null, null, 0);
        timeStep(1);
        check(true, true, false, 1, 1, 1);
        timeStep(0.6);
        check(true, true, false, 3.5, 3.5, 1.6);
        timeStep(0.4);
        check(true, true, false, 3.5, 3.5, 2);
        timeStep(1);
        check(true, false, true, 2, 2, 3);
        timeStep(1);
        check(true, false, true, 2, 2, 4);
        recorder.pausePlayback();
      });
    });
    describe('Playback', () => {
      beforeEach(() => {
        recorder.stateTimeStep = 0.5;
        cursor.hide();
        timeStep(0);
        recorder.startRecording();
        timeStep(1);
        figure.mock.touchMove([1, 1]);    // 1
        figure.toggleCursor();
        timeStep(1);
        figure.mock.touchMove([2, 2]);    // 2
        timeStep(1);
        figure.mock.touchDown([3, 3]);    // 3
        timeStep(1);
        figure.mock.touchMove([4, 4]);    // 4
        timeStep(1);
        figure.mock.touchMove([5, 5]);    // 5
        timeStep(1);
        figure.mock.touchUp();            // 6
        timeStep(1);
        figure.mock.touchMove([7, 7]);    // 7
        timeStep(1);
        figure.mock.touchMove([8, 8]);    // 8
        timeStep(1);
        figure.toggleCursor();
        timeStep(3);
        recorder.stopRecording();                         // 12
      });
      test('Playback from 0', () => {
        expect(recorder.states.diffs).toHaveLength(25);
        expect(recorder.states.diffs[24][0]).toBe(12);
        expect(recorder.state).toBe('idle');
        timeStep(0.01);
        recorder.startPlayback(0);
        expect(recorder.state).toBe('playing');
        check(false, null, null, 0, 0, 0);
        timeStep(1);
        check(true, true, false, 1, 1, 1);
        timeStep(1);
        check(true, true, false, 2, 2, 2);
        timeStep(1);
        check(true, false, true, 3, 3, 3);
        timeStep(1);
        check(true, false, true, 4, 4, 4);
        timeStep(1);
        check(true, false, true, 5, 5, 5);
        timeStep(1);
        check(true, true, false, null, null, 6);
        timeStep(1);
        check(true, true, false, 7, 7, 7);
        timeStep(1);
        check(true, true, false, 8, 8, 8);
        timeStep(1);
        check(false, null, null, null, null, 9);

        expect(recorder.state).toBe('playing');
        timeStep(1);
        check(false, null, null, null, null, 10);
        expect(recorder.state).toBe('playing');
        timeStep(2);
        check(false, null, null, null, null, 12);
        expect(recorder.state).toBe('idle');
      });
      test('Playback only some events', () => {
        recorder.startPlayback(0, true, ['cursor', 'touch']);
        expect(recorder.state).toBe('playing');
        check(false, null, null, 0, 0, 0);
        timeStep(1);
        check(true, true, false, 1, 1, 1);
        timeStep(1);
        check(true, true, false, 1, 1, 2);
        timeStep(1);
        check(true, false, true, 3, 3, 3);
        timeStep(1);
        check(true, false, true, 3, 3, 4);
        timeStep(1);
        check(true, false, true, 3, 3, 5);
        timeStep(1);
        check(true, true, false, 3, 3, 6);
        timeStep(1);
        check(true, true, false, 3, 3, 7);
        timeStep(1);
        check(true, true, false, 3, 3, 8);
        timeStep(1);
        check(false, null, null, null, null, 9);
        expect(recorder.state).toBe('playing');
        timeStep(1);
        check(false, null, null, null, null, 10);
        expect(recorder.state).toBe('playing');
        timeStep(2);
        check(false, null, null, null, null, 12);
        expect(recorder.state).toBe('idle');
      });
      test('Playback from after 0', () => {
        expect(recorder.states.diffs).toHaveLength(25);
        expect(recorder.states.diffs[24][0]).toBe(12);

        expect(recorder.state).toBe('idle');
        timeStep(0.01);
        recorder.startPlayback(3.5);            // Diff start (comp last test)
        expect(recorder.state).toBe('playing'); //
        check(true, false, true, 3, 3, 3);    //
        timeStep(1);                          // Diff end
        check(true, false, true, 4, 4, 4);
        timeStep(1);
        check(true, false, true, 5, 5, 5);
        timeStep(1);
        check(true, true, false, null, null, 6);
        timeStep(1);
        check(true, true, false, 7, 7, 7);
        timeStep(1);
        check(true, true, false, 8, 8, 8);
        timeStep(1);
        check(false, null, null, null, null, 9);

        expect(recorder.state).toBe('playing');
        timeStep(1);
        check(false, null, null, null, null, 10);
        expect(recorder.state).toBe('playing');
        timeStep(2);
        check(false, null, null, null, null, 12);
        expect(recorder.state).toBe('idle');
      });
    });
  });
  describe('Editing', () => {
    beforeEach(() => {
      initialTime = 1000;
      recorder.stateTimeStep = 1;
      timeStep(0);
      recorder.startRecording();
      timeStep(1);
      recorder.recordEvent('cursorMove', [1, 1]);
      timeStep(1);
      recorder.recordEvent('cursorMove', [2, 2]);
      timeStep(1);
      recorder.recordEvent('cursorMove', [3, 3]);
      recorder.stopRecording();
    });
    test('Clear after start to end', () => {
      expect(recorder.events.cursorMove.list).toHaveLength(3);
      expect(recorder.states.diffs).toHaveLength(4);
      recorder.clear(1.5, 3);
      expect(recorder.events.cursorMove.list).toHaveLength(1);
      expect(recorder.states.diffs).toHaveLength(2);
    });
    test('Clear start to end', () => {
      expect(recorder.events.cursorMove.list).toHaveLength(3);
      expect(recorder.states.diffs).toHaveLength(4);
      recorder.clear(0, 3);
      expect(recorder.events.cursorMove.list).toHaveLength(0);
      expect(recorder.states.diffs).toHaveLength(0);
    });
    test('Clear start to before end', () => {
      expect(recorder.events.cursorMove.list).toHaveLength(3);
      expect(recorder.states.diffs).toHaveLength(4);
      recorder.clear(0, 2);
      expect(recorder.events.cursorMove.list).toHaveLength(1);
      expect(recorder.states.diffs).toHaveLength(1);
    });
    test('Clear after start to before end', () => {
      expect(recorder.events.cursorMove.list).toHaveLength(3);
      expect(recorder.states.diffs).toHaveLength(4);
      recorder.clear(1.5, 2);
      expect(recorder.events.cursorMove.list).toHaveLength(2);
      expect(recorder.states.diffs).toHaveLength(3);
    });
    test('Clear after start to before end same time', () => {
      expect(recorder.events.cursorMove.list).toHaveLength(3);
      expect(recorder.states.diffs).toHaveLength(4);
      recorder.clear(2, 2);
      expect(recorder.events.cursorMove.list).toHaveLength(2);
      expect(recorder.states.diffs).toHaveLength(3);
    });
  });
  describe('Save File', () => {
    test('Simple', () => {
      const original = tools.download;
      const names = [];
      const data = [];
      tools.download = (name, jsonified) => {
        names.push(name);
        data.push(jsonified);
      };

      global.performance.now = () => 0;
      recorder.precision = 8;
      recorder.startRecording();
      global.performance.now = () => 100;
      recorder.recordEvent('cursorMove', [1, 1]);
      global.performance.now = () => 200;
      recorder.recordEvent('cursorMove', [2, 2]);
      recorder.stopRecording();

      const expectedCursorMoveEventsList = [
        [0.1, [1, 1], 0],
        [0.2, [2, 2], 0],
      ];
      const expectedStates = tools.duplicate(recorder.states, 8);

      expect(recorder.events.cursorMove.list).toEqual(expectedCursorMoveEventsList);

      recorder.save();
      recorder.reset();
      expect(recorder.events.cursorMove.list).toEqual([]);
      const encodedData = JSON.parse(data[0]);

      recorder.loadEvents(encodedData.events);
      recorder.loadStates(encodedData.states);
      expect(recorder.events.cursorMove.list).toEqual(expectedCursorMoveEventsList);
      expect(recorder.states).toEqual(expectedStates);

      tools.download = original;
    });
  });
});
