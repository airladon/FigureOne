import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import {
  getNextIndexForTime,
  getPrevIndexForTime,
  getIndexOfEarliestTime,
  getIndexOfLatestTime,
} from './Recorder';
import Worker from '../__mocks__/recorder.worker.mock';

tools.isTouchDevice = jest.fn();

// jest.mock('./webgl/webgl');
jest.mock('./recorder.worker');

describe('Diagram Recorder', () => {
  let diagram;
  let recorder;
  let events;
  let cursor;
  let timeStep;
  let initialTime;
  let duration;
  let check;
  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
    ({ recorder } = diagram);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    recorder.stateTimeStep = 1;
    events = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          color: [1, 0, 0, 1],
          radius: 1,
          width: 0.1,
        },
      },
      {
        name: 'cursor',
        method: 'shapes.cursor',
        options: {
          width: 0.01,
          color: [0, 1, 0, 1],
          radius: 0.1,
        },
      },
    ]);
    diagram.initialize();
    cursor = diagram.getElement('cursor');

    duration = 0;
    initialTime = 1;

    timeStep = (deltaTimeInSeconds) => {
      const newNow = (duration + deltaTimeInSeconds + initialTime) * 1000;
      global.performance.now = () => newNow;
      jest.advanceTimersByTime((deltaTimeInSeconds * 1000));
      duration += deltaTimeInSeconds;
      diagram.animateNextFrame();
      diagram.draw(newNow / 1000);
    };