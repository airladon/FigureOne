import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import Worker from '../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
jest.useFakeTimers();

describe('Seek', () => {
  let diagram;
  let recorder;
  let a;
  let b;
  let transforms;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
      },
      {
        name: 'b',
        method: 'polygon',
      },
    ]);
    a = diagram.elements._a;
    b = diagram.elements._b;
    diagram.initialize();
    ({ recorder } = diagram);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    recorder.stateTimeStep = 1;

    const startPulse = () => {
      a.pulseScaleNow(2, 2);
    };
    recorder.addEventType('startPulse', startPulse.bind(this));
    const startAnimation = () => {
      a.animations.new()
        .position({ start: [0, 0], target: [2, 2], duration: 2, progression: 'linear' })
        .start();
    };
    recorder.addEventType('startAnimation', startAnimation.bind(this));

    // setup
    diagram.mock.timeStep(0);  // Ok
    recorder.startRecording();
    diagram.mock.timeStep(1);
    startAnimation();
    recorder.recordEvent('startAnimation');
    diagram.mock.timeStep(1);
    recorder.recordEvent('startPulse');
    diagram.mock.timeStep(1);
    diagram.mock.timeStep(1);
    diagram.mock.timeStep(1);
    recorder.recordEvent('touch', ['up']);
    recorder.stopRecording();
    recorder.seek(0); 

    transforms = () => [
      recorder.state,
      a.getPosition().round(3).x,
      a.pulseTransforms.map(t => t.s().round(3).x),
      a.frozenPulseTransforms.map(t => t.s().round(3).x),
      a.drawTransforms.map(t => t.s().round(3).x),
      diagram.getRemainingAnimationTime(),
    ];
  });
  test('Just playback', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
    diagram.mock.timeStep(1);
    expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
    diagram.mock.timeStep(1);
    expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    diagram.mock.timeStep(0.5);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  });
  // describe('', () => {
  // });
});