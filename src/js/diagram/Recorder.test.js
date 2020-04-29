// import {
//   Point, Rect, Line,
// } from '../tools/g2';
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
    diagram = makeDiagram();
    ({ recorder } = diagram);
    events = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
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
        events = [[0, 'a'], [1, 'a'], [1, 'b'], [2, 'a']];
        const indeces = getLastUniqueIndeces(events, 1, 2);
        expect(indeces).toEqual([1, 2]);
      });
      test('entire array', () => {
        events = [[0, 'a'], [1, 'a'], [1, 'b'], [2, 'a']];
        const indeces = getLastUniqueIndeces(events, 0, 3);
        expect(indeces.sort()).toEqual([2, 3]);
      });
      test('three', () => {
        events = [[0, 'a'], [1, 'b'], [1, 'b'], [2, 'c']];
        const indeces = getLastUniqueIndeces(events, 0, 3);
        expect(indeces.sort()).toEqual([0, 2, 3]);
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
      recorder.resetStates();
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
      state1 = diagram.getState();

      line = diagram.getElement('line');
      line.transform.updateTranslation(0, 1);
      state2 = diagram.getState();

      line.transform.updateTranslation(0, 2);
      state3 = diagram.getState();
      recorder.states = {
        states: [],
        map: new tools.UniqueMap(),
        reference: null,
      };
      // ({ recorder } = diagram);
    });
    test('addReferenceState', () => {
      line.setEndPoints([1, 1], [2, 1]);
      diagram.setState(state1);
      const state4 = diagram.getState();
      expect(state4.elements).toEqual(state1.elements);

      recorder.addReferenceState(state1);
      recorder.addReferenceState(state2);
      recorder.states.reference[1].diff['.stateTime'] = 3;
      expect(recorder.states.reference[1]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
        // added: {},
        // removed: {},
      });
    });
    test('getReferenceState', () => {
      recorder.addReferenceState(state1);
      recorder.addReferenceState(state2);
      const ref1 = recorder.getReferenceState(0);
      const ref2 = recorder.getReferenceState(1);
      diagram.setState(ref1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);
      diagram.setState(ref2);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 0 reference', () => {
      recorder.addReferenceState(state1);
      recorder.addState(state2);
      recorder.states.states[0][2].diff['.stateTime'] = 3;
      expect(recorder.states.states[0][1]).toBe(0);
      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
        // added: {},
        // removed: {},
      });
      expect(recorder.states.states).toHaveLength(1);
      diagram.setState(state1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      const s = recorder.getState(0);
      diagram.setState(s[1]);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(1);
    });
    test('add State to 1 reference', () => {
      recorder.addReferenceState(state1);
      recorder.addReferenceState(state2);
      recorder.addState(state3);
      recorder.states.states[0][2].diff['.stateTime'] = 3;
      expect(recorder.states.states[0][1]).toBe(1);
      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 2,
          '.stateTime': 3,
        },
        // added: {},
        // removed: {},
      });
      expect(recorder.states.states).toHaveLength(1);
      diagram.setState(state1);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(0);

      const s = recorder.getState(0);
      diagram.setState(s[1]);
      expect(line.transform.t().x).toBe(0);
      expect(line.transform.t().y).toBe(2);
    });
    test('minify simple', () => {
      recorder.addReferenceState({ elements: 1 });
      recorder.addState({ elements: 2 });
      const mini = recorder.minifyStates(false);
      expect(mini.map.map).toEqual({
        elements: 'a',
        reference: 'b',
        '.elements': 'c',
        diff: 'd',
        states: 'e',
        isObject: 'f',
      });
      const state = recorder.getState(0);
      const [time] = state;
      expect(mini.states.b).toEqual([{ a: 1 }]);
      expect(mini.states.f).toBe(false);
      expect(mini.states.e[0][0]).toBe(time);
      expect(mini.states.e[0][1]).toBe(0);
      expect(mini.states.e[0][2]).toEqual({
        d: { c: 2 },
      });
      
      const unmini = recorder.unminifyStates(mini);
      expect(unmini.reference).toEqual([{ elements: 1 }]);
      expect(unmini.states[0][0]).toBe(time);
      expect(unmini.states[0][1]).toBe(0);
      expect(unmini.states[0][2]).toEqual({
        diff: { '.elements': 2 },
      });
    });
    test('minify simple as object', () => {
      recorder.addReferenceState({ elements: 1 });
      recorder.addState({ elements: 2 });
      const mini = recorder.minifyStates(true);

      expect(mini.map.map).toEqual({
        elements: 'a',
        reference: 'b',
        diff: 'c',
        states: 'd',
        isObject: 'e',
      });
      const state = recorder.getState(0);
      const [time] = state;
      expect(mini.states.b).toEqual([{ a: 1 }]);
      expect(mini.states.e).toBe(true);
      expect(mini.states.d[0][0]).toBe(time);
      expect(mini.states.d[0][1]).toBe(0);
      expect(mini.states.d[0][2]).toEqual({
        c: { a: 2 },
      });
      const unmini = recorder.unminifyStates(mini);
      expect(unmini.reference).toEqual([{ elements: 1 }]);
      expect(unmini.states[0][0]).toBe(time);
      expect(unmini.states[0][1]).toBe(0);
      expect(unmini.states[0][2]).toEqual({
        diff: { '.elements': 2 },
      });
    });
    test('minify nested', () => {
      recorder.addReferenceState({ elements: { e1: 1, e2: 2 } });
      recorder.addReferenceState({ elements: { e1: 2, e2: 2 } });
      recorder.addState({ elements: { e1: 2, e2: 3, e3: 5 } });
      recorder.addState({ elements: { e1: 2, e2: 4 } });
      const state0Old = recorder.getState(0);
      const state1Old = recorder.getState(1);

      const mini = recorder.minifyStates(false);
      const unmini = recorder.unminifyStates(mini);

      expect(unmini.reference[0]).toEqual({ elements: { e1: 1, e2: 2 } });
      expect(unmini.reference[1]).toEqual({ diff: { '.elements.e1': 2 } });

      recorder.loadStates(unmini);
      const state0New = recorder.getState(0);
      expect(state0Old).toEqual(state0New);
      const state1New = recorder.getState(1);
      expect(state1Old).toEqual(state1New);
    });
    test('minify nested as object', () => {
      recorder.addReferenceState({ elements: { e1: 1, e2: 2 } });
      recorder.addReferenceState({ elements: { e1: 2, e2: 2 } });
      recorder.addState({ elements: { e1: 2, e2: 3, e3: 5 } });
      recorder.addState({ elements: { e1: 2, e2: 4 } });
      const state0Old = recorder.getState(0);
      const state1Old = recorder.getState(1);

      const mini = recorder.minifyStates(true);
      const unmini = recorder.unminifyStates(mini);
      expect(unmini.reference[0]).toEqual({ elements: { e1: 1, e2: 2 } });
      expect(unmini.reference[1]).toEqual({ diff: { '.elements.e1': 2 } });

      recorder.loadStates(unmini);
      const state0New = recorder.getState(0);
      expect(state0Old).toEqual(state0New);
      const state1New = recorder.getState(1);
      expect(state1Old).toEqual(state1New);
    });
    // test('diagram simple 1', () => {
    //   // recorder.resetStates();
    //   diagram.htmlId = 'aaa'
    //   line.setPosition(0, 0);
    //   global.performance.now = () => 1000;
    //   const ref1 = diagram.getState();
    //   global.performance.now = () => 2000;
    //   const s1 = diagram.getState();
    //   recorder.addReferenceState(ref1);
    //   recorder.recordState(s1);

    //   line.setPosition(0, 1);
    //   global.performance.now = () => 3000;
    //   const s2 = diagram.getState();
    //   recorder.recordState(s2);

    //   expect(recorder.states.states[0][2]).toEqual({
    //     diff: {
    //       '.stateTime': 2,
    //     },
    //   });

    //   expect(recorder.states.states[1][2]).toEqual({
    //     diff: {
    //       '.elements.elements.line.transform.state[3].state[2]': 1,
    //       '.stateTime': 3,
    //     },
    //   });

    //   const mini = recorder.minifyStates(false, 4);
    //   const unmini = recorder.unminifyStates(mini);
    //   recorder.loadStates(unmini);
    //   line.setPosition(10, 10);
      
      
    //   recorder.setState(0);
    //   expect(line.getPosition().y).toBe(0);
    //   recorder.setState(1);
    //   expect(line.getPosition().y).toBe(1);
    // });
    // test('diagram simple 2', () => {
    //   // recorder.resetStates();
    //   line.setPosition(0, 0);
    //   global.performance.now = () => 1000;
    //   const ref1 = diagram.getState();
    //   global.performance.now = () => 2000;
    //   const s1 = diagram.getState();
    //   recorder.addReferenceState(ref1);
    //   recorder.recordState(s1);

    //   line.setPosition(0, 1);
    //   global.performance.now = () => 3000;
    //   const s2 = diagram.getState();
    //   recorder.recordState(s2);

    //   expect(recorder.states.states[0][2]).toEqual({
    //     diff: {
    //       '.stateTime': 2,
    //     },
    //   });

    //   expect(recorder.states.states[1][2]).toEqual({
    //     diff: {
    //       '.elements.elements.line.transform.state[3].state[2]': 1,
    //       '.stateTime': 3,
    //     },
    //   });

    //   const mini = recorder.minifyStates(false, 4);
    //   const unmini = recorder.unminifyStates(mini);
    //   recorder.loadStates(unmini);
    //   line.setPosition(10, 10);
    //   recorder.setState(0);
    //   expect(line.getPosition().y).toBe(0);
    //   recorder.setState(1);
    //   expect(line.getPosition().y).toBe(1);
    // });
    test('diagram simple', () => {
      // recorder.resetStates();
      line.setPosition(0, 0);
      global.performance.now = () => 1000;
      const ref1 = diagram.getState();
      global.performance.now = () => 2000;
      const s1 = diagram.getState();
      recorder.addReferenceState(ref1);
      recorder.recordState(s1);

      line.setPosition(0, 1);
      global.performance.now = () => 3000;
      const s2 = diagram.getState();
      recorder.recordState(s2);

      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.stateTime': 2,
        },
      });

      expect(recorder.states.states[1][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
      });

      const mini = recorder.minifyStates(false, 4);
      const unmini = recorder.unminifyStates(mini);

      recorder.loadStates(unmini);
      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
    test('diagram', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 1000;
      const ref1 = diagram.getState();
      global.performance.now = () => 2000;
      const s1 = diagram.getState();
      recorder.addReferenceState(ref1);
      recorder.recordState(s1);

      line.setPosition(0, 1);
      global.performance.now = () => 3000;
      const s2 = diagram.getState();
      recorder.recordState(s2);

      line.setPosition(1, 2);
      global.performance.now = () => 4000;
      const s3 = diagram.getState();
      global.performance.now = () => 5000;
      const ref2 = diagram.getState();
      recorder.recordState(s3);
      recorder.addReferenceState(ref2);

      line.setPosition(1, 3);
      global.performance.now = () => 6000;
      const s4 = diagram.getState();
      recorder.recordState(s4);

      expect(recorder.states.reference[1]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[1]': 1,
          '.elements.elements.line.transform.state[3].state[2]': 2,
          '.stateTime': 5,
        },
      });

      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.stateTime': 2,
        },
      });

      expect(recorder.states.states[1][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
      });

      expect(recorder.states.states[2][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[1]': 1,
          '.elements.elements.line.transform.state[3].state[2]': 2,
          '.stateTime': 4,
        },
      });

      expect(recorder.states.states[3][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 3,
          '.stateTime': 6,
        },
      });

      // recorder.addState(state3);

      const mini = recorder.minifyStates(false, 4);
      const unmini = recorder.unminifyStates(mini);

      recorder.loadStates(unmini);
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
      global.performance.now = () => 1000;
      const ref1 = diagram.getState();
      global.performance.now = () => 2000;
      const s1 = diagram.getState();
      recorder.addReferenceState(ref1);
      recorder.recordState(s1);

      line.setPosition(0, 1);
      global.performance.now = () => 3000;
      const s2 = diagram.getState();
      recorder.recordState(s2);

      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.stateTime': 2,
        },
      });

      expect(recorder.states.states[1][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
      });

      const mini = recorder.minifyStates(true, 4);
      const unmini = recorder.unminifyStates(mini);

      recorder.loadStates(unmini);
      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
    test('diagram as object', () => {
      line.setPosition(0, 0);
      global.performance.now = () => 1000;
      const ref1 = diagram.getState();
      global.performance.now = () => 2000;
      const s1 = diagram.getState();
      recorder.addReferenceState(ref1);
      recorder.recordState(s1);

      line.setPosition(0, 1);
      global.performance.now = () => 3000;
      const s2 = diagram.getState();
      recorder.recordState(s2);

      line.setPosition(1, 2);
      global.performance.now = () => 4000;
      const s3 = diagram.getState();
      global.performance.now = () => 5000;
      const ref2 = diagram.getState();
      recorder.recordState(s3);
      recorder.addReferenceState(ref2);

      line.setPosition(1, 3);
      global.performance.now = () => 6000;
      const s4 = diagram.getState();
      recorder.recordState(s4);

      expect(recorder.states.reference[1]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[1]': 1,
          '.elements.elements.line.transform.state[3].state[2]': 2,
          '.stateTime': 5,
        },
      });

      expect(recorder.states.states[0][2]).toEqual({
        diff: {
          '.stateTime': 2,
        },
      });

      expect(recorder.states.states[1][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 1,
          '.stateTime': 3,
        },
      });

      expect(recorder.states.states[2][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[1]': 1,
          '.elements.elements.line.transform.state[3].state[2]': 2,
          '.stateTime': 4,
        },
      });

      expect(recorder.states.states[3][2]).toEqual({
        diff: {
          '.elements.elements.line.transform.state[3].state[2]': 3,
          '.stateTime': 6,
        },
      });

      // recorder.addState(state3);

      const mini = recorder.minifyStates(true, 4);
      const unmini = recorder.unminifyStates(mini);

      recorder.loadStates(unmini);
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
      global.performance.now = () => 1000;
      const ref1 = diagram.getState();
      global.performance.now = () => 2000;
      const s1 = diagram.getState();
      recorder.addReferenceState(ref1);
      recorder.recordState(s1);

      line.setPosition(0, 1);
      global.performance.now = () => 3000;
      const s2 = diagram.getState();
      recorder.recordState(s2);

      const mini = recorder.minifyStates(true, 4);
      const jsonMini = JSON.stringify(mini);
      const parsedJSON = JSON.parse(jsonMini);
      const unmini = recorder.unminifyStates(parsedJSON);

      recorder.loadStates(unmini);
      line.setPosition(10, 10);
      recorder.setState(0);
      expect(line.getPosition().y).toBe(0);
      recorder.setState(1);
      expect(line.getPosition().y).toBe(1);
    });
  });
});
