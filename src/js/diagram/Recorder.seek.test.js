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
  let dissolveTester;
  let skipAfter;
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
      a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
    };
    recorder.addEventType('startPulse', startPulse.bind(this));
    const startAnimation = () => {
      a.animations.new()
        .position({ target: [2, 2], duration: 2, progression: 'linear' })
        .start('sync');
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
    // debugger;
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

    dissolveTester = (outState, inState, endState, remainingAnimTime) => {
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 1]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(1);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(1);

      diagram.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 0.6]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(0.5005);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(0.5005);

      diagram.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...outState, 0.2]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(1);
      expect(a.isShown).toBe(false);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(0.12587);

      diagram.mock.timeStep(0.2, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...inState, 0.8]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(0.001);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(0.001);
      expect(round(a.lastDrawOpacity)).toBe(0);

      diagram.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['preparingToPlay', ...inState, 0.4]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(0.5005);
      expect(a.isShown).toBe(true);
      expect(round(a.opacity)).toBe(0.5005);
      expect(round(a.lastDrawOpacity)).toBe(round(0.5005 * 0.5005));

      diagram.mock.timeStep(0.4, frameStep);
      expect(transforms()).toEqual(['playing', ...endState, remainingAnimTime]);
      expect(diagram.elements.isShown).toBe(true);
      expect(round(diagram.elements.opacity)).toBe(1);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(round(a.lastDrawOpacity)).toBe(1);
    };

    skipAfter = false;
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
    expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
    diagram.mock.timeStep(1, frameStep);
    expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
    diagram.mock.timeStep(0.5, frameStep);
    expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  });
  describe('Seek with no state change', () => {
    test('Seek to before animation', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(0.5);
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    test('Seek to start of animation', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1);
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    test('Seek to middle of animation, before pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(1.5);
      expect(transforms()).toEqual(['idle', 0.5, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1.5, [1.5], [], [1.5], 1.5]);
    });
    test('Seek to end of animation, middle of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(3);
      expect(transforms()).toEqual(['idle', 2, [], [2], [1], 0]);
      // diagram.mock.timeStep(0, frameStep);
      // expect(transforms()).toEqual(['idle', 2, [], [2], [2], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [2], [], [1], 1]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
    });
    // test('Seek to before pulse', () => {});
    test('Seek to start of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(2);
      expect(transforms()).toEqual(['idle', 1, [], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1.5, [1.5], [], [1.5], 1.5]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
    });
    // test('Seek to middle of pulse', () => {});
    test('Seek to end of pulse', () => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(4);
      expect(transforms()).toEqual(['idle', 2, [1], [], [1], 0]);
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
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
  });
  describe('Seek to before animation', () => {
    beforeEach(() => {
      expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
      recorder.seek(0.5);
    });
    afterEach(() => {
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2, 2);
        diagram.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [], [1], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(1);

        // diagram.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.6]);
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(0.5005);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(0.5005);

        // diagram.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.2]);
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(false);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(0.12587);

        // diagram.mock.timeStep(0.2, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 0, [], [], [1], 0.8]);
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(0.001);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(0.001);
        // expect(round(a.lastDrawOpacity)).toBe(0);

        // diagram.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['preparingToPlay', 0, [], [], [1], 0.4]);
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(0.5005);
        // expect(a.isShown).toBe(true);
        // expect(round(a.opacity)).toBe(0.5005);
        // expect(round(a.lastDrawOpacity)).toBe(round(0.5005 * 0.5005));

        // diagram.mock.timeStep(0.4, frameStep);
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
        // expect(diagram.elements.isShown).toBe(true);
        // expect(round(diagram.elements.opacity)).toBe(1);
        // expect(a.isShown).toBe(true);
        // expect(a.opacity).toBe(1);
        // expect(round(a.lastDrawOpacity)).toBe(1);
      });
    });
    describe('Pulse Change', () => {
      beforeEach(() => {
        diagram.unpause();
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();

        // The old drawTransform scale is not yet updated
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 0]);
        // So let's update it so the afterEach works
        diagram.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        diagram.unpause();
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
        a.setPosition(2, 2);
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // The old drawTransform scale is not yet updated
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 0]);
        // So let's update it so the afterEach works
        diagram.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2, 2);
        diagram.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [], [1], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        diagram.unpause();
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ scale: 2, duration: 2, when: 'sync' });
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // The old drawTransform scale will be updated on the next draw
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 2]);
        diagram.mock.timeStep(0);
        // expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        diagram.unpause();
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ scale: 2, duration: 2, when: 'sync' });
        a.setPosition(2, 2);
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        // drawTransforms will update on next draw frame
        expect(transforms()).toEqual(['playing', 0, [], [], [2], 2]);
        diagram.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(2.5, 2.5);
        diagram.mock.timeStep(1, frameStep);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2.5, [], [], [1], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1.5, [], [], [1], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        diagram.unpause();
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
        // diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 0.5, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 0.5, [], [], [2], 1.5]);
        diagram.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);

      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();

        expect(transforms()).toEqual(['preparingToPlay', 0.5, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 0.5, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
        diagram.unpause();
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
        a.setPosition(2.5, 2.5);
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(0.5, frameStep);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['idle', 2.5, [2], [], [2], 1]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 0.5, [], [], [2], 1.5]);
        diagram.mock.timeStep(0);
        expect(transforms()).toEqual(['playing', 0.5, [], [], [1], 1.5]);
      });
      test('Animate', () => {
        recorder.settings.play = 'animate';
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 2.5, [], [2], [2], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 1.5, [], [1.5], [1.5], 0.5]);
        diagram.mock.timeStep(0.5, frameStep);
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
    });
    afterEach(() => {
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [2], [], [2], 1]);
      diagram.mock.timeStep(1, frameStep);
      expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['playing', 2, [], [], [1], 0]);
      diagram.mock.timeStep(0.5, frameStep);
      expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
    });
    test('No state change', () => {
      recorder.startPlayback();
      expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
    });
    describe('Position Change', () => {
      beforeEach(() => {
        a.setPosition(3, 3);
        diagram.mock.timeStep(1, frameStep);
        expect(transforms()).toEqual(['idle', 3, [], [], [1], 0]);
      });
      test('Instant', () => {
        recorder.settings.play = 'instant';
        recorder.startPlayback();
        expect(transforms()).toEqual(['playing', 1, [], [], [1], 2]);
      });
      // only next
      test('Animate', () => {
        recorder.settings.play = 'animate';
        // debugger;
        recorder.startPlayback();
        expect(transforms()).toEqual(['preparingToPlay', 3, [], [], [1], 1]);
        diagram.mock.timeStep(0.5, frameStep);
        expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 0.5]);
        diagram.mock.timeStep(0.4, frameStep);
        diagram.mock.timeStep(0.1, frameStep);
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
  });
  // describe('State change then Animate', () => {
  //   describe('Change Position', () => {
  //     test('Seek to before animation and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(0.5);
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       a.setPosition(4, 0);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 4, [], [], [1], 2]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['playing', 0, [], [], [1], 0]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  //     });
  //     test('Seek to start of animation and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(1);
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       a.setPosition(4, 0);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 4, [], [], [1], 2]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['preparingToPlay', 2, [], [], [1], 1]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['playing', 0, [], [], [1], 2]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  //     });
  //     test('Seek to middle of animation and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(1.5);
  //       expect(transforms()).toEqual(['idle', 0.4, [], [], [1], 0]);
  //       a.setPosition(4.4, 0);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 4.4, [], [], [1], 2]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['preparingToPlay', 2.4, [], [], [1], 1]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['playing', 0.4, [], [], [1], 1.6]);
  //       diagram.mock.timeStep(0.4, frameStep);
  //       expect(transforms()).toEqual(['playing', 0.8, [], [], [1], 1.2]);
  //     });
  //     test('Seek to end of animation and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(3);
  //       a.setPosition(5.9, 0);
  //       expect(transforms()).toEqual(['idle', 5.9, [], [1.9], [1], 0]);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 5.9, [], [1.9], [1], 2]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['preparingToPlay', 3.9, [], [1.9], [1.9], 1]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['playing', 1.9, [1.9], [], [1.9], 1.1]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 2, [1.6], [], [1.6], 0.6]);
  //     });
  //   });
  //   describe('State change then pulse', () => {
  //     test('Seek to start of pulse and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(2);
  //       expect(transforms()).toEqual(['idle', 0.9, [], [], [1], 0]);
  //       diagram.unpause();
  //       a.pulseScaleNow(3, 3);
  //       diagram.mock.timeStep(0);
  //       diagram.mock.timeStep(1);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['idle', 0.9, [3], [], [3], 1.5]);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 0.9, [], [3], [3], 2]);
  //       diagram.mock.timeStep(1);
  //       expect(transforms()).toEqual(['preparingToPlay', 0.9, [], [2], [2], 1]);
  //       diagram.mock.timeStep(1);
  //       expect(transforms()).toEqual(['playing', 0.9, [1], [], [1], 2]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 1.4, [1.5], [], [1.5], 1.5]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 1.9, [2], [], [2], 1]);
  //     });
  //     test('Seek to middle of pulse and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(3);
  //       expect(transforms()).toEqual(['idle', 1.9, [], [1.9], [1], 0]);
  //       diagram.unpause();
  //       a.pulseScaleNow(3, 3);
  //       diagram.mock.timeStep(0);
  //       diagram.mock.timeStep(1);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['idle', 1.9, [3], [], [3], 1.5]);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 1.9, [], [3], [3], 1.1]);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['preparingToPlay', 1.9, [], [2.549], [2.549], 0.6]);
  //       diagram.mock.timeStep(0.6);
  //       expect(transforms()).toEqual(['playing', 1.9, [1.9], [], [1.9], 1.1]);
  //       diagram.mock.timeStep(0.6, frameStep);
  //       expect(transforms()).toEqual(['playing', 2, [1.5], [], [1.5], 0.5]);
  //       diagram.mock.timeStep(0.5, frameStep);
  //       expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
  //     });
  //     test('Seek to end of pulse and change state', () => {
  //       expect(transforms()).toEqual(['idle', 0, [], [], [1], 0]);
  //       recorder.seek(4);
  //       expect(transforms()).toEqual(['idle', 2, [], [1.1], [1], 0]);
  //       diagram.unpause();
  //       a.pulseScaleNow(3, 2.1);
  //       diagram.mock.timeStep(0);
  //       diagram.mock.timeStep(1);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['idle', 2, [2.1], [], [2.1], 1.5]);
  //       recorder.settings.play = 'animate';
  //       recorder.startPlayback();
  //       expect(transforms()).toEqual(['preparingToPlay', 2, [], [2.1], [2.1], 1]);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['preparingToPlay', 2, [], [1.6], [1.6], 0.5]);
  //       diagram.mock.timeStep(0.5);
  //       expect(transforms()).toEqual(['playing', 2, [1.1], [], [1.1], 0.1]);
  //       diagram.mock.timeStep(0.1, frameStep);
  //       expect(transforms()).toEqual(['playing', 2, [1], [], [1], 0]);
  //       diagram.mock.timeStep(1, frameStep);
  //       expect(transforms()).toEqual(['idle', 2, [], [], [1], 0]);
  //     });
  //   });
  // });
  describe('Instant', () => {
  });
  describe('Dissolve', () => {
  });
  test('Seek and dissolve all tests', () => {
  });
  test('Seek to middle of animation, touch and move diagram element, start', () => {});
});
