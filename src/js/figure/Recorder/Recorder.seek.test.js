// import {
//   Point, // Transform,
// } from '../tools/g2';
import {
  round,
} from '../../tools/math';
// import * as tools from '../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import Worker from '../../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
// jest.useFakeTimers();

describe('Seek', () => {
  let figure;
  let recorder;
  let a;
  // let b;
  let transforms;
  let frameStep;
  let dissolveTester;
  beforeEach(() => {
    // Disable requestAnimationFrame calling draw as it does so at a time
    // interval and figure.mock.timeStep does it precisely
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});

    figure = makeFigure();
    figure.timeKeeper.reset();
    jest.useFakeTimers();
    figure.add([
      {
        name: 'a',
        make: 'polygon',
        options: {
          radius: 1,
          sides: 4,
          rotation: Math.PI / 4,
        },
      },
      {
        name: 'b',
        make: 'polygon',
      },
    ]);
    a = figure.elements._a;
    // b = figure.elements._b;
    figure.initialize();
    figure.mock.timersBeforeDraw = false;
    ({ recorder } = figure);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    recorder.stateTimeStep = 0.5;

    // a.pulseSettings.progression = 'tools.math.triangle';

    const startPulse = () => {
      a.pulse({
        duration: 2, scale: 2, when: 'syncNow', progression: 'tools.math.triangle',
      });
    };
    recorder.addEventType('startPulse', startPulse.bind(this));
    const startAnimation = () => {
      a.animations.new()
        .position({ target: [2, 2], duration: 2, progression: 'linear' })
        .start('syncNow');
    };
    recorder.addEventType('startAnimation', startAnimation.bind(this));

    frameStep = 0.1;
    // setup
    figure.mock.timeStep(0, frameStep);  // Ok
    recorder.startRecording();
    figure.mock.timeStep(0.5, frameStep);             // 0.5
    figure.mock.timeStep(0.5, frameStep);             // 1

    // Start animation at time 1
    startAnimation();
    recorder.recordEvent('startAnimation');

    figure.mock.timeStep(0.5, frameStep);             // 1.5
    figure.mock.timeStep(0.5, frameStep);             // 2

    // Start pulse at time 2
    startPulse();
    recorder.recordEvent('startPulse');
    // debugger;
    figure.mock.timeStep(0.5, frameStep);             // 2.5
    figure.mock.timeStep(0.5, frameStep);             // 3
    figure.mock.timeStep(0.5, frameStep);             // 3.5
    figure.mock.timeStep(0.5, frameStep);             // 4
    figure.mock.timeStep(0.5, frameStep);             // 4.5
    figure.mock.timeStep(0.5, frameStep);             // 5
    recorder.recordEvent('touch', ['up']);
    recorder.stopRecording();

    recorder.seek(0);

    transforms = () => [
      recorder.state,
      a.getPosition().round(3).x,
      a.pulseTransforms.map(t => t.s().round(3).x),
      a.frozenPulseTransforms.map(t => t.s().round(3).x),
      a.drawTransforms.map(t => t.s().round(3).x),
      round(figure.getRemainingAnimationTime(), 3),
    ];

    dissolveTester = (outState, inState, endState, remainingAnimTime) => {
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 1]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(1);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(1);

      figure.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 0.6]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(0.5005);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(0.5005);

      figure.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 0.2]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(0.001);
      expect(a.isShown).toBe(false);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(0.12588);

      figure.mock.timeStep(0.2, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...inState, 0.8]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(0.001);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(0.001);
      expect(round(a.lastDrawOpacity)).toBe(0);

      figure.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...inState, 0.4]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(0.5005);
      expect(a.isShown).toBe(true);
      expect(round(a.opacity)).toBe(0.5005);
      expect(round(a.lastDrawOpacity)).toBe(round(0.5005 * 0.5005));

      figure.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['playing', ...endState, remainingAnimTime]);
      expect(figure.elements.isShown).toBe(true);
      expect(round(figure.elements.opacity)).toBe(1);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(1);
    };
  });
  afterEach(() => {
    figure.timeKeeper.reset();
    window.requestAnimationFrame.mockRestore();
  });
  test('Just playback', () => {
    // Note, the animation and pulse are starting on the frame after the desired
    // time. As the frame time is 0.1, then the animations will be 0.1s behind
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.startPlayback();
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
    figure.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
    figure.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    figure.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  });
  describe('Seek with no state change', () => {
    test('Seek to before animation', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(0.5);
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    test('Seek to start of animation', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1);
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    test('Seek to middle of animation, before pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1.5);
      expect(transforms()).toEqual(['idle', 0.5, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1.5, [1.5], [], [1.5], 1.5]);
    });
    test('Seek to end of animation, middle of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(3);
      expect(transforms()).toEqual(['idle', 2, [], [2], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [2], [], [1], 1]);
      figure.mock.timeStep(0, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
    });
    test('Seek to start of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(2);
      expect(transforms()).toEqual(['idle', 1, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1.5, [1.5], [], [1.5], 1.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
    });
    test('Seek to end of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(4);
      expect(transforms()).toEqual(['idle', 2, [1], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    });
    test('Seek to after end of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(4.5);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
  });
  describe('Seek to before animation', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(0.5);
    });
    afterEach(() => {
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2, 2);
        figure.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [], [1], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [], [1]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          0,
        );
        // First animation is dissolve out for 0.8s, and delay for 0.2s
        // expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(1);

        // figure.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.6]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(0.5005);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(0.5005);

        // figure.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.2]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(false);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(0.12587);

        // figure.mock.timeStep(0.2, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 0, [], [], [1], 0.8]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(0.001);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(0.001);
        // expect(round(a.lastDrawOpacity)).toBe(0);

        // figure.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 0, [], [], [1], 0.4]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(0.5005);
        // expect(a.isShown).toBe(true);
        // expect(round(a.opacity)).toBe(0.5005);
        // expect(round(a.lastDrawOpacity)).toBe(round(0.5005 * 0.5005));

        // figure.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
        // expect(figure.elements.isShown).toBe(true);
        // expect(round(figure.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(1);
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();

        expect(transforms()).toEqual(['playing', 0, [], [], [2], 0]);
        // So let's update it so the afterEach works
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [0, [], [2], [2]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          0,
        );
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        a.setPosition(2, 2);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // The old drawTransform scale is not yet updated
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 0]);
        // So let's update it so the afterEach works
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [2], [2]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          0,
        );
      });
    });
  });
  describe('Seek to start of animation', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1);
    });
    afterEach(() => {
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2, 2);
        figure.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [], [1], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [], [1]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          2,
        );
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ scale: 2, duration: 2, when: 'syncNow' });
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // The old drawTransform scale will be updated on the next draw
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 2]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [0, [], [2], [2]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          2,
        );
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ scale: 2, duration: 2, when: 'syncNow' });
        a.setPosition(2, 2);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // drawTransforms will update on next draw frame
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 2]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [2], [2]],
          [0, [], [], [1]],
          [0, [], [], [1]],
          2,
        );
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
    });
  });
  describe('Seek to middle of animation', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1.5);
    });
    afterEach(() => {
      // expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2.5, 2.5);
        figure.mock.timeStep(1, frameStep);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2.5, [], [], [1], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1.5, [], [], [1], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2.5, [], [], [1]],
          [0.5, [], [], [1]],
          [0.5, [], [], [1]],
          1.5,
        );
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        // figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0.5, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 0.5, [], [], [2], 1.5]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0.5, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0.5, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [0.5, [], [2], [2]],
          [0.5, [], [], [1]],
          [0.5, [], [], [1]],
          1.5,
        );
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        a.setPosition(2.5, 2.5);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2.5, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 0.5, [], [], [2], 1.5]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2.5, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1.5, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2.5, [], [2], [2]],
          [0.5, [], [], [1]],
          [0.5, [], [], [1]],
          1.5,
        );
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
    });
  });
  describe('Seek to start of pulse', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(2);
      expect(transforms()).toEqual(['idle', 1, [], [], [1], 0]);
    });
    afterEach(() => {
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      figure.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(3, 3);
        figure.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 3, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      });
      // only next
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        // debugger;
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [], [1], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.5]);
        figure.mock.timeStep(0.4, frameStep);
        figure.mock.timeStep(0.1, frameStep);
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [3, [], [], [1]],
          [1, [], [], [1]],
          [1, [1], [], [1]],
          2,
        );
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 1, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 1, [], [], [2], 2]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 1, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [1, [], [2], [2]],
          [1, [], [], [1]],
          [1, [1], [], [1]],
          2,
        );
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        a.setPosition(3, 3);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 3, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 1, [], [], [2], 2]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [3, [], [2], [2]],
          [1, [], [], [1]],
          [1, [1], [], [1]],
          2,
        );
        expect(transforms()).toEqual(['playing', 1, [1], [], [1], 2]);
      });
    });
  });
  describe('Seek to middle of pulse', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(3.5);
      expect(transforms()).toEqual(['idle', 2, [], [1.5], [1], 0]);
      figure.mock.timeStep(0, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [1.5], [1.5], 0]);
    });
    afterEach(() => {
      expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
      figure.mock.timeStep(0);
      expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        // expect(transforms()).toEqual(['idle', 2, [], [1.5], [1], 0]);
        // figure.mock.timeStep(0, frameStep);
        // expect(transforms()).toEqual(['idle', 2, [], [1.5], [1.5], 0]);
        a.setPosition(4, 4);
        expect(transforms()).toEqual(['idle', 4, [], [1.5], [1.5], 0]);
        figure.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 4, [], [1.5], [1.5], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      // only next
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        // debugger;
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 4, [], [1.5], [1.5], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.4, frameStep);
        figure.mock.timeStep(0.1, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [4, [], [1.5], [1.5]],
          [2, [], [1.5], [1.5]],
          [2, [1.5], [], [1.5]],
          0.5,
        );
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        a.pulse({ duration: 2, scale: 2.5, when: 'syncNow' });
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2.5], [], [2.5], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1.5], [], [2.5], 0.5]);
        figure.mock.timeStep(0);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2.5], [2.5], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [2.5], [2.5]],
          [2, [], [1.5], [1.5]],
          [2, [1.5], [], [1.5]],
          0.5,
        );
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        // a.pulseNow(2, 2);
        a.pulse({ duration: 2, scale: 2.5, when: 'syncNow' });
        a.setPosition(4, 4);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 4, [2.5], [], [2.5], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1.5], [], [2.5], 0.5]);
        figure.mock.timeStep(0);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 4, [], [2.5], [2.5], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [2], [2], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [4, [], [2.5], [2.5]],
          [2, [], [1.5], [1.5]],
          [2, [1.5], [], [1.5]],
          0.5,
        );
      });
    });
  });
  describe('Seek to end of pulse', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(4);
      expect(transforms()).toEqual(['idle', 2, [1], [], [1], 0]);
    });
    afterEach(() => {
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      figure.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    describe('No state change', () => {
      afterEach(() => {
        // recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        // dissolveTester(
        //   [2, [], [], [1]],
        //   [2, [], [1], [1]],
        //   [2, [], [], [1]],
        //   0,
        // );
      });
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(4, 4);
        figure.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 4, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
        figure.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      });
      // only next
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        // debugger;
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 4, [], [1], [1], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [1], [1], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [4, [], [], [1]],
          [2, [], [1], [1]],
          [2, [], [], [1]],
          0,
        );
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1], [], [2], 0]);
        figure.mock.timeStep(0);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [2, [], [2], [2]],
          [2, [], [1], [1]],
          [2, [], [], [1]],
          0,
        );
      });
    });
    describe('Position and Pulse Change', () => {
      beforeEach(() => {
        figure.unpause();
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
        a.setPosition(4, 4);
        figure.mock.timeStep(0);
        figure.mock.timeStep(0.5, frameStep);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 4, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 2, [1], [], [2], 0]);
        figure.mock.timeStep(0);
      });
      test('Animate', () => {
        recorder.settings.play = {
          how: 'animate',
          velocity: {},
        };
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 4, [], [2], [2], 1]);
        figure.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [1.5], [1.5], 0.5]);
        figure.mock.timeStep(0.5, frameStep);
      });
      test('Dissolve', () => {
        recorder.settings.play = 'dissolve';
        recorder.startPlayback();
        dissolveTester(
          [4, [], [2], [2]],
          [2, [], [1], [1]],
          [2, [], [], [1]],
          0,
        );
      });
    });
  });
  test('Seek to middle of animation, touch and move figure element', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(1.5);
    figure.mock.timeStep(0);
    // figure.unpause();
    a.setMovable(true);
    // figure.mock.touchDown([0.5, 0.5]);
    figure.mock.touchDown([0.5, 0.5]);
    figure.mock.touchMove([4, 4]);
    expect(a.getPosition().round().x).toBe(4);
  });
  test('Seek to middle of animation, start another animation', () => {
    expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
    recorder.seek(1.5);
    figure.mock.timeStep(0);
    // figure.unpause();
    a.animations.new()
      .position({ target: [1.5, 1.5], duration: 1 })
      .start();
    figure.mock.timeStep(0);
    expect(a.getPosition().round().x).toBe(0.5);
    figure.mock.timeStep(0.5);
    expect(a.getPosition().round().x).toBe(1);
    figure.mock.timeStep(1);
    expect(a.getPosition().round().x).toBe(1.5);
  });
});
