import {
  Point, // Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
// import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import Worker from '../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
// jest.useFakeTimers();

describe('Seek', () => {
  let diagram;
  let recorder;
  let a;
  let b;
  let transforms;
  let frameStep;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.globalAnimation.reset();
    jest.useFakeTimers();
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
    diagram.mock.timersBeforeDraw = false;
    ({ recorder } = diagram);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    recorder.stateTimeStep = 0.5;
    a.pulseSettings.style = 'tools.math.triangle';

    const startPulse = () => {
      a.pulseScaleNow(2, 2);
    };
    recorder.addEventType('startPulse', startPulse.bind(this));
    const startAnimation = () => {
      a.animations.new()
        .position({ target: [2, 2], duration: 2, progression: 'linear' })
        .start();
    };
    recorder.addEventType('startAnimation', startAnimation.bind(this));

    frameStep = 0.1;
    // setup
    diagram.mock.timeStep(0, frameStep);  // Ok
    recorder.startRecording();
    diagram.mock.timeStep(0.5, frameStep);             // 0.5
    diagram.mock.timeStep(0.5, frameStep);             // 1

    // Start animation at time 1
    startAnimation();
    recorder.recordEvent('startAnimation');

    diagram.mock.timeStep(0.5, frameStep);             // 1.5
    diagram.mock.timeStep(0.5, frameStep);             // 2

    // Start pulse at time 2
    startPulse();
    recorder.recordEvent('startPulse');

    diagram.mock.timeStep(0.5, frameStep);             // 2.5
    diagram.mock.timeStep(0.5, frameStep);             // 3
    diagram.mock.timeStep(0.5, frameStep);             // 3.5
    diagram.mock.timeStep(0.5, frameStep);             // 4
    diagram.mock.timeStep(0.5, frameStep);             // 4.5
    diagram.mock.timeStep(0.5, frameStep);             // 5
    recorder.recordEvent('touch', ['up']);
    recorder.stopRecording();

    recorder.seek(0);

    transforms = () => [
      recorder.state,
      a.getPosition().round(3).x,
      a.pulseTransforms.map(t => t.s().round(3).x),
      a.frozenPulseTransforms.map(t => t.s().round(3).x),
      a.drawTransforms.map(t => t.s().round(3).x),
      round(diagram.getRemainingAnimationTime(), 3),
    ];
  });
  test('Just playback', () => {
    // Note, the animation and pulse are starting on the frame after the desired
    // time. As the frame time is 0.1, then the animations will be 0.1s behind
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.9, [], [], [1], 2]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 1.9, [1.9], [], [1.9], 1.1]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 2, [1.1], [], [1.1], 0.1]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  });
  test('Seek to before animation', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(0.5);
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  });
  test('Seek to start of animation', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(1);
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 2]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  });
  test('Seek to middle of animation, before pulse', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(1.5);
    expect(transforms()).toEqual(['idle', 0.4, [], [], [1], 1.6]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.9, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 1.4, [1.4], [], [1.4], 1.6]);
  });
  test('Seek to end of animation, middle of pulse', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(3);
    expect(transforms()).toEqual(['idle', 1.9, [1.9], [], [1], 1.1]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 1.9, [1.9], [], [1], 1.1]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [1.6], [], [1.6], 0.6]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [1.1], [], [1.1], 0.1]);
  });
  // test('Seek to before pulse', () => {});
  test('Seek to start of pulse', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(2);
    expect(transforms()).toEqual(['idle', 0.9, [], [], [1], 2]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0.9, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 1.4, [1.4], [], [1.4], 1.6]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 1.9, [1.9], [], [1.9], 1.1]);
  });
  // test('Seek to middle of pulse', () => {});
  test('Seek to end of pulse', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(4);
    expect(transforms()).toEqual(['idle', 2, [1.1], [], [1], 0.1]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 2, [1.1], [], [1], 0.1]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
  });
  test('Seek to after end of pulse', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(4.5);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  });
  test('Seek to before animation and change state', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(0.5);
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    a.setPosition(4, 0);
    recorder.settings.play = 'animate';
    recorder.startPlayback();
    expect(transforms()).toEqual(['preparingToPlay', 4, [], [], [1], 2]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  });
  test('Seek to start of animation and change state', () => {});
  test('Seek to middle of animation and change state', () => {});
  test('Seek to end of animation and change state', () => {});
  test('Seek to before pulse and change state', () => {});
  test('Seek to start of pulse and change state', () => {});
  test('Seek to middle of pulse and change state', () => {});
  test('Seek to end of pulse and change state', () => {});
});