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
      const state3 = diagram.getState();
      expect(state3.elements).toEqual(state1.elements);

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
    // test('minify nested', () => {
    //   recorder.addReferenceState({ elements: { e1: 1, e2: 2 } });
    //   recorder.addState({ elements: { e1: 1, e2: 3 } });
    //   const mini = recorder.minifyStates(false);
    //   const unmini = recorder.unminifyStates(mini);
    //   console.log(unmini)
    //   expect(unmini.reference).toEqual({ elements: { e1: 1, e2: 2 } });
    //   // recorder.addReferenceState(state1);
    //   // recorder.addState(state2);
    //   // recorder.addState(state3);
    //   // const mini = recorder.minifyStates(false);
    //   // const statesUnmini = recorder.unminifyStates(mini);
    //   // const { reference, states } = statesUnmini;
    //   // console.log(reference)
    //   // console.log(recorder.states.reference)
    //   // expect(reference).toEqual(recorder.states.reference);
    //   // recorder.states.states[0][2].diff['.stateTime'] = 3;
    //   // expect(recorder.states.states[0][1]).toBe(1);
    //   // expect(recorder.states.states[0][2]).toEqual({
    //   //   diff: {
    //   //     '.elements.elements.line.transform.state[3].state[2]': 2,
    //   //     '.stateTime': 3,
    //   //   },
    //   //   added: {},
    //   //   removed: {},
    //   // });
    //   // expect(recorder.states.states).toHaveLength(1);
    //   // diagram.setState(state1);
    //   // expect(line.transform.t().x).toBe(0);
    //   // expect(line.transform.t().y).toBe(0);

    //   // const s = recorder.getState(0);
    //   // diagram.setState(s[1]);
    //   // expect(line.transform.t().x).toBe(0);
    //   // expect(line.transform.t().y).toBe(2);
    // });
  });
});
