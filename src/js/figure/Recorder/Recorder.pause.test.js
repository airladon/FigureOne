// import {
//   Point,
// } from '../../tools/g2';
import {
  round,
} from '../../tools/math';
// import * as tools from '../tools/tools';
import makeFigure from '../../__mocks__/makeFigure';
import Worker from '../../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Animate To State', () => {
  let figure;
  let recorder;
  let playbackStartedCallback;
  let preparingToPlayCallback;
  let preparingToPauseCallback;
  let playbackStoppedCallback;
  let a;
  let b;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
    figure = makeFigure();
    figure.timeKeeper.reset();
    figure.add([
      {
        name: 'a',
        make: 'polygon',
      },
      {
        name: 'b',
        make: 'polygon',
      },
    ]);
    a = figure.elements._a;
    b = figure.elements._b;
    figure.initialize();
    ({ recorder } = figure);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    playbackStartedCallback = jest.fn();
    preparingToPlayCallback = jest.fn();
    preparingToPauseCallback = jest.fn();
    playbackStoppedCallback = jest.fn();
    const subs = recorder.notifications;
    subs.add('playbackStarted', playbackStartedCallback);
    subs.add('playbackStopped', playbackStoppedCallback);
    subs.add('preparingToPause', preparingToPauseCallback);
    subs.add('preparingToPlay', preparingToPlayCallback);
    recorder.stateTimeStep = 1;
  });
  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });
  describe('Animation', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      // a.pauseSettings.animation.complete = false;
      // a.pauseSettings.animation.clear = true;
      const startAnimation = () => {
        a.animations.new()
          .position({
            start: [0, 0], target: [1, 1], duration: 2, progression: 'linear',
          })
          .start();
      };
      recorder.addEventType('startAnimation', startAnimation.bind(this));

      // setup
      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      startAnimation();
      recorder.recordEvent('startAnimation');
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      states = () => [
        recorder.state, figure.state.preparingToStop, a.state.preparingToStop,
        figure.isAnimating(), round(figure.getRemainingAnimationTime()),
        a.getPosition().round(3).x,
      ];
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 0]);
      expect(callbacks()).toEqual([0, 0, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      expect(callbacks()).toEqual([0, 1, 0, 1]);
    });
    test('Try to change paused figure during recorder pause', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
      recorder.settings.pause = 'freeze';
      recorder.pausePlayback();

      figure.pause();
      a.animations.new()
        .position({ target: [4.5, 4.5], duration: 2 })
        .start('now');
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3).x).toBe(0.5);
      figure.unpause();
      // Resume
      recorder.settings.play = 'instant';
      recorder.resumePlayback();
      expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
    });
    test('Change upaused figure during recorder pause', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
      recorder.settings.pause = 'freeze';
      recorder.pausePlayback();

      // figure.unpause();
      a.animations.new()
        .position({ target: [4.5, 4.5], duration: 2 })
        .start('now');
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3).x).toBe(2.5);

      // Resume
      recorder.settings.play = 'instant';
      recorder.resumePlayback();
      expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', false, false, false, 0, 0]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 0.5]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 0.5]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      test('Complete before pause', () => {
        recorder.settings.pause = 'animateToComplete';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', true, true, true, 1, 0.5]);
        expect(callbacks()).toEqual([0, 1, 1, 0]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['preparingToPause', true, true, true, 0.5, 0.75]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
      test('Dissolve before pause', () => {
        recorder.settings.pause = 'dissolveToComplete';
        recorder.pausePlayback();
        // a animations frozen and dissolve out starting
        expect(states()).toEqual(['preparingToPause', true, false, true, 1, 0.5]);
        expect(figure.elements.opacity).toBe(1);
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.6, 0.5]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        // Start delay
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.2, 0.5]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(false);

        // Start dissolve in
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.8, 1]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.4, 1]);
        expect(round(figure.elements.opacity)).toBe(0.5005);
        expect(a.isShown).toBe(true);

        // End dissolve in
        figure.mock.timeStep(0.4);
        expect(round(figure.elements.opacity)).toBe(1);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after freeze not on a state time', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        recorder.startPlayback(0);
        figure.mock.timeStep(1);
        figure.mock.timeStep(0.2);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 0.1]);
        expect(callbacks()).toEqual([0, 1, 0, 1]);
      });
      test('Simple', () => {
        expect(states()).toEqual(['idle', false, false, false, 0, 0.1]);
        expect(callbacks()).toEqual([0, 1, 0, 1]);
        recorder.resumePlayback();
        expect(states()).toEqual(['playing', false, false, true, 1.8, 0.1]);
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['playing', false, false, true, 1.6, 0.2]);
      });
    });
    describe('Resume after Freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        recorder.startPlayback(0);
        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 0.5]);
        expect(callbacks()).toEqual([0, 1, 0, 1]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('State Change', () => {
        beforeEach(() => {
          a.setPosition(2.5, 2.5);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume (default velocity)', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2.5]);
          expect(callbacks()).toEqual([1, 1, 0, 1]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 1.5]);
          figure.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and duration', () => {
          // duration should trump
          recorder.settings.play = {
            how: 'animate',
            duration: 2,
            velocity: {
              position: 2,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          figure.mock.timeStep(1);
        });
        test('Animate to resume with custom velocity', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: { position: 1 },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          figure.mock.timeStep(1);
        });
        test('Animate to resume with velocity and maxDuration', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
            maxDuration: 0.5, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 2.5]);
          figure.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.25, 1.5]);
          figure.mock.timeStep(0.25);
        });
        test('Animate to resume with velocity and minDuration', () => {
          recorder.settings.play = {
            how: 'animate',
            duration: 2, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          figure.mock.timeStep(1);
        });
        test('Animate to resume with velocity and zeroThreshold', () => {
          recorder.settings.play = {
            how: 'animate',
            zeroDurationThreshold: 1, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
        });
        test('Animate to resume with velocity and allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.play = {
            how: 'animate',
            allDurationsSame: true, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 1,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(0.95);
          figure.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and NOT allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.play = {
            how: 'animate',
            allDurationsSame: false, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 0.2,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          figure.mock.timeStep(0.25);
          expect(round(a.color[0])).toBe(0.95);
          figure.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(1);
          figure.mock.timeStep(0.5);
        });
        test('Animate to resume with duration', () => {
          recorder.settings.play = {
            how: 'animate',
            duration: 2,
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          figure.mock.timeStep(1);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2.5]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 2.5]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 2.5]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 0.5]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 0.5]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
        test('Dissolve to resume with duration', () => {
          recorder.settings.play = {
            how: 'dissolve',
            duration: {
              dissolveIn: 1,
              dissolveOut: 1,
              delay: 1,
            },
          };

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2.5]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1.5, 2.5]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2.5]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 0.5]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 0.5]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
    });
    describe('Resume after Complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);

        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      describe('No State Change', () => {
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.25, 1]);
          figure.mock.timeStep(0.125);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.125, 0.75]);
          figure.mock.timeStep(0.125);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 1]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 1]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 0.5]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 0.5]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
    });
  });
  describe('Pulse Scale', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      const startPulse = () => {
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      figure.mock.timeStep(0);  // Ok
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      states = () => {
        const scale = a.drawTransforms[0].s().round(3).x;
        return [
          recorder.state, figure.state.preparingToStop, a.state.preparingToStop,
          figure.isAnimating(),
          round(figure.getRemainingAnimationTime()), scale,
        ];
      };
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 2]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 2]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
        recorder.pausePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms.length).toBe(0);
        // This is ok to do a 0 step as the drawTransforms is only updated
        // on the next draw
        figure.mock.timeStep(0);  // ok
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      test('Animate complete before pause', () => {
        recorder.settings.pause = 'animateToComplete';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', true, true, true, 1, 2]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      test('Dissolve complete before pause', () => {
        recorder.settings.pause = 'dissolveToComplete';
        recorder.pausePlayback();
        // a animations frozen and dissolve out starting
        expect(states()).toEqual(['preparingToPause', true, false, true, 1, 2]);
        expect(figure.elements.opacity).toBe(1);
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.6, 2]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        // Start delay
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.2, 2]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(false);

        // Start dissolve in
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.8, 1]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.4, 1]);
        expect(round(figure.elements.opacity)).toBe(0.5005);
        expect(a.isShown).toBe(true);

        // End dissolve in
        figure.mock.timeStep(0.4);
        expect(round(figure.elements.opacity)).toBe(1);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
        expect(a.frozenPulseTransforms.length).toBe(0);
        recorder.pausePlayback();
        // recorder.resumePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);

        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Pulse State Change', () => {
        beforeEach(() => {
          figure.unpause();
          a.pulse({ duration: 2, scale: 4, when: 'syncNow' });
          // This is ok as it kicks off the pulse
          figure.mock.timeStep(0); // Ok
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as drawTransforms won't update will next draw and
          // pulseTransforms is confirmed updated
          figure.mock.timeStep(0); // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Animate to resume with Duration', () => {
          recorder.settings.play = {
            how: 'animate',
            duration: 3,
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 3, 4]);
          figure.mock.timeStep(1.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1.5, 3]);
          figure.mock.timeStep(1.5);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Animate to resume with Velocity', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: { scale: 0.5 },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 4, 4]);
          figure.mock.timeStep(2);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 3]);
          figure.mock.timeStep(2);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Animate to resume with Velocity and Duration', () => {
          recorder.settings.play = {
            how: 'animate',
            duration: 1,
            velocity: { scale: 0.5 },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 4, 4]);
          figure.mock.timeStep(2);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 3]);
          figure.mock.timeStep(2);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 4]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 4]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 4]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
      describe('Position State Change', () => {
        beforeEach(() => {
          a.setPosition(4, 4);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          expect(a.getPosition().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.getPosition().round(3).x).toBe(4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();
          // figure.mock.timeStep(0)

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 2]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 2]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
      describe('Position and Pulse State Change', () => {
        beforeEach(() => {
          figure.unpause();
          a.setPosition(4, 4);
          a.pulse({ duration: 2, scale: 4, when: 'syncNow' });
          // This is ok as it kicks off the pulse
          figure.mock.timeStep(0);  // Ok
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as pulseTransforms is updated and drawTransforms will
          // be updated on the next draw
          figure.mock.timeStep(0);  // Ok
        });
        test('Animate to resume with different durations', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          a.setPosition(2, 2);
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(0.5);
          expect(a.getPosition().round(3).x).toBe(1);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(0);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Animate to resume with same durations', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 4]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 4]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 4]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
    });
    describe('Resume after complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);
        figure.mock.timeStep(0);  // Ok
        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        recorder.pausePlayback();
        figure.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.length).toBe(0);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as pulseTransforms is updated, and drawTransforms will
          // be updated on the next draw
          figure.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          recorder.resumePlayback();
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([1]);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 1.5]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 1]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 1]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          // recorder.resumePlayback();
        });
      });
    });
  });
  describe('Pulse Lines', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      const startPulse = () => {
        // a.pulseThickNow(2, 1.1, 3);
        a.pulse({
          duration: 2, scale: 1.1, min: 0.9, num: 3, when: 'syncNow',
        });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      states = () => {
        const scale = a.drawTransforms.map(t => t.s().round(3).x);
        return [
          recorder.state, figure.state.preparingToStop,
          a.state.preparingToStop, figure.isAnimating(),
          round(figure.getRemainingAnimationTime()), scale,
        ];
      };
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, [1, 1, 1]]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, [1, 1, 1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, [1.1, 1, 0.9]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, [1.1, 1, 0.9]]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
        recorder.pausePlayback();
        expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
        // This is ok as pulseTransforms is updated, and drawTransforms
        // will be updated on next frame
        figure.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
      });
      test('Animate complete before pause', () => {
        recorder.settings.pause = 'animateToComplete';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', true, true, true, 1, [1.1, 1, 0.9]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
      });
      test('Dissolve complete before pause', () => {
        recorder.settings.pause = 'dissolveToComplete';
        recorder.pausePlayback();
        // a animations frozen and dissolve out starting
        expect(states()).toEqual(['preparingToPause', true, false, true, 1, [1.1, 1, 0.9]]);
        expect(figure.elements.opacity).toBe(1);
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.6, [1.1, 1, 0.9]]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        // Start delay
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.2, [1.1, 1, 0.9]]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(false);

        // Start dissolve in
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.8, [1]]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.4, [1]]);
        expect(round(figure.elements.opacity)).toBe(0.5005);
        expect(a.isShown).toBe(true);

        // End dissolve in
        figure.mock.timeStep(0.4);
        expect(round(figure.elements.opacity)).toBe(1);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0);
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, [1, 1, 1]]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, [1.1, 1, 0.9]]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Pulse State Change', () => {
        beforeEach(() => {
          figure.unpause();
          // a.pulseThickNow(2, 1.2, 3);
          a.pulse({
            duration: 2, scale: 1.2, min: 0.8, num: 3, when: 'syncNow',
          });
          // This is Ok as it kicks off pulse
          figure.mock.timeStep(0);  // Ok
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, true, 1, [1.2, 1, 0.8]]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.2, 1, 0.8]);
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
          // This is Ok as pulseTransforms is updated, and drawTransforms will
          // be updated on the next frame
          figure.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.1, [1.2, 1, 0.8]]);
          figure.mock.timeStep(0.05);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.05, [1.15, 1, 0.85]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, [1.2, 1, 0.8]]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, [1.2, 1, 0.8]]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, [1.2, 1, 0.8]]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, [1.1, 1, 0.9]]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, [1.1, 1, 0.9]]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
    });
    describe('Resume after complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);
        figure.mock.timeStep(0);  // Ok
        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        recorder.pausePlayback();
        figure.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, [1]]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
          // This is ok as pulseTransforms is updated and drawTransforms will
          // be updated on next frame
          figure.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([1, 1, 1]);
          // This is ok as frozenPulseTransforms is updated and
          // drawTransforms will be updated on next frame
          figure.mock.timeStep(0);  // Ok
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.1, [1, 1, 1]]);
          figure.mock.timeStep(0.05);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.05, [1.05, 1, 0.95]]);
          figure.mock.timeStep(0.05);
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, [1]]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, [1]]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, [1]]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, [1.1, 1, 0.9]]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, [1.1, 1, 0.9]]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, [1.1, 1, 0.9]]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
    });
  });
  describe('Moving Freely', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      a.move.freely.deceleration = 1;
      a.move.freely.zeroVelocityThreshold = 0.0000001;
      a.setMovable(true);
      // figure.mock.touchDown([0, 0]);
      // figure.mock.timeStep(1);
      // figure.mock.touchMove([2, 0]);
      // figure.mock.touchUp();
      // // a.pauseSettings.animation.complete = false;
      // // a.pauseSettings.animation.clear = true;
      // const startAnimation = () => {
      //   a.animations.new()
      //     .position({ start: [0, 0], target: [1, 1], duration: 2 })
      //     .start();
      // };
      // recorder.addEventType('startAnimation', startAnimation.bind(this));

      // setup
      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      // startAnimation();
      // recorder.recordEvent('startAnimation');
      // recorder.recordEvent('touch', ['down', new Point(0, 0)]);
      figure.mock.touchDown([0, 0]);
      figure.mock.timeStep(1);
      // recorder.recordEvent('moved', ['a', new Point(2, 0)]);
      // recorder.recordEvent('touch', ['up']);
      figure.mock.touchMove([2, 0]);
      figure.mock.touchUp();
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      // recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      states = () => [
        recorder.state, figure.state.preparingToStop, a.state.preparingToStop,
        figure.isAnimating(), round(figure.getRemainingAnimationTime()),
        a.getPosition().round(3).x,
      ];
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 0]);
      expect(callbacks()).toEqual([0, 0, 0, 0]);
      recorder.startPlayback(0);
      // figure.mock.timeStep(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 2]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 4]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 4]);
      expect(callbacks()).toEqual([0, 1, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 0, 0, 0]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 2]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 3.5]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 3.5]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
      });
      test('Animate complete before pause', () => {
        recorder.settings.pause = 'animateToComplete';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', true, true, true, 1, 3.5]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['preparingToPause', true, true, true, 0.5, 3.875]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
      });
      test('Dissolve complete before pause', () => {
        recorder.settings.pause = 'dissolveToComplete';
        recorder.pausePlayback();
        // a animations frozen and dissolve out starting
        expect(states()).toEqual(['preparingToPause', true, false, true, 1, 3.5]);
        expect(figure.elements.opacity).toBe(1);
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.6, 3.5]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        // Start delay
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.2, 3.5]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(false);

        // Start dissolve in
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.8, 4]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.4, 4]);
        expect(round(figure.elements.opacity)).toBe(0.5005);
        expect(a.isShown).toBe(true);

        // End dissolve in
        figure.mock.timeStep(0.4);
        expect(round(figure.elements.opacity)).toBe(1);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0);
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 0, 0, 0]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, false, 0, 0]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 2]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 3.5]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, true, 0.5, 3.875]);
          expect(callbacks()).toEqual([0, 2, 0, 1]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, false, 0, 4]);
          expect(callbacks()).toEqual([0, 2, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 4]);
          expect(callbacks()).toEqual([0, 2, 0, 2]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Position State Change', () => {
        beforeEach(() => {
          a.setPosition([1.5, 0]);
          expect(states()).toEqual(['idle', false, false, false, 0, 1.5]);
        });
        afterEach(() => {
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, true, 0.5, 3.875]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', false, false, false, 0, 4]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 4]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
          expect(callbacks()).toEqual([0, 2, 0, 1]);
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.5, 2.5]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
          expect(callbacks()).toEqual([1, 2, 0, 1]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 1.5]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 1.5]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 1.5]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 3.5]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 3.5]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(callbacks()).toEqual([1, 2, 0, 1]);
        });
      });
    });
    describe('Resume after complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);
        figure.mock.timeStep(0);  // Ok
        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        figure.mock.timeStep(1);
        recorder.pausePlayback();
        figure.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
      });
      afterEach(() => {
        expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['playing', false, false, true, 0.5, 3.875]);
        figure.mock.timeStep(0.5);
        expect(states()).toEqual(['playing', false, false, false, 0, 4]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 4]);
      });
      describe('No State Change', () => {
        // afterEach(() => {
        //   expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
        //   figure.mock.timeStep(1);
        //   expect(states()).toEqual(['playing', false, false, false, 0, 4]);
        //   figure.mock.timeStep(1);
        //   expect(states()).toEqual(['idle', false, false, false, 0, 4]);
        // });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.25, 4]);
          figure.mock.timeStep(0.125);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.125, 3.75]);
          figure.mock.timeStep(0.125);
          expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 4]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 4]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 4]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 3.5]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 3.5]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 3.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          // recorder.resumePlayback();
        });
      });
    });
  });
  describe('Two Elements', () => {
    beforeEach(() => {
      const startPulse = () => {
        a.pulse({ duration: 2, scale: 2, when: 'syncNow' });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      figure.mock.timeStep(0);  // Ok
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      recorder.startPlayback();
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      recorder.settings.pause = 'freeze';
      recorder.settings.play = {
        how: 'animate',
        velocity: {},
      };
      recorder.pausePlayback();
      figure.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
    });
    test('Position Change', () => {
      b.setPosition(4, 0);
      figure.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);

      recorder.resumePlayback();
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);

      figure.mock.timeStep(0);
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);

      figure.mock.timeStep(1);
      expect(recorder.state).toBe('preparingToPlay');
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(2);

      figure.mock.timeStep(1);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      figure.mock.timeStep(0.5);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(1.5);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1.5);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      figure.mock.timeStep(0.5);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(1);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      figure.mock.timeStep(1);
      expect(recorder.state).toBe('idle');
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);
    });
  });
  describe('Pulse Scale of Line', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      figure.add([{
        name: 'l',
        make: 'oline',
        options: {
          length: 1.2,
          width: 0.1,
        },
      }]);
      figure.initialize();
      a = figure.elements._l._line;
      const startPulse = () => {
        figure.elements._l.pulseWidth({ line: 2, duration: 2 });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      figure.mock.timeStep(0);  // Ok
      recorder.startRecording();
      figure.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      figure.mock.timeStep(0);  // Ok
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      figure.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      states = () => {
        const scale = a.drawTransforms[0].s().round(3).y;
        return [
          recorder.state, figure.state.preparingToStop, a.state.preparingToStop,
          figure.isAnimating(),
          round(figure.getRemainingAnimationTime()), scale,
        ];
      };
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 1, 2]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, false, 0, 1]);
      figure.mock.timeStep(1);
      expect(states()).toEqual(['idle', false, false, false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 2]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        expect(a.pulseTransforms[0].s().round(3).y).toBe(2);
        recorder.pausePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms.length).toBe(0);
        // This is ok to do a 0 step as the drawTransforms is only updated
        // on the next draw
        figure.mock.timeStep(0);  // ok
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      test('Animate complete before pause', () => {
        recorder.settings.pause = 'animateToComplete';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', true, true, true, 1, 2]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
      });
      test('Dissolve complete before pause', () => {
        recorder.settings.pause = 'dissolveToComplete';
        recorder.pausePlayback();
        // a animations frozen and dissolve out starting
        expect(states()).toEqual(['preparingToPause', true, false, true, 1, 2]);
        expect(figure.elements.opacity).toBe(1);
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.6, 2]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        // Start delay
        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.2, 2]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(false);

        // Start dissolve in
        figure.mock.timeStep(0.2);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.8, 1]);
        expect(round(figure.elements.opacity)).toBe(0.001);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0.4);
        expect(states()).toEqual(['preparingToPause', true, false, true, 0.4, 1]);
        expect(round(figure.elements.opacity)).toBe(0.5005);
        expect(a.isShown).toBe(true);

        // End dissolve in
        figure.mock.timeStep(0.4);
        expect(round(figure.elements.opacity)).toBe(1);
        expect(a.isShown).toBe(true);

        figure.mock.timeStep(0);
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', false, false, false, 0, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 2, 1]);
        figure.mock.timeStep(1);
        expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        expect(a.pulseTransforms[0].s().round(3).y).toBe(2);
        expect(a.frozenPulseTransforms.length).toBe(0);
        // debugger;
        recorder.pausePlayback();
        // recorder.resumePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms[0].s().round(3).y).toBe(2);

        expect(states()).toEqual(['idle', false, false, false, 0, 2]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Pulse State Change', () => {
        beforeEach(() => {
          figure.elements._l.pulseWidth({ duration: 2, line: 4, when: 'syncNow' });
          // This is ok as it kicks off the pulse
          figure.mock.timeStep(0); // Ok
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          // debugger;
          expect(states()).toEqual(['idle', false, false, true, 1, 4]);
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).y).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).y).toBe(2);
          // This is ok as drawTransforms won't update will next draw and
          // pulseTransforms is confirmed updated
          figure.mock.timeStep(0); // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 4]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 4]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 4]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
        });
      });
      describe('Position State Change', () => {
        beforeEach(() => {
          a.setPosition(4, 4);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          expect(a.getPosition().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.getPosition().round(3).x).toBe(4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();
          // figure.mock.timeStep(0)

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 2]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 2]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 2]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);

          // disolve in
          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
      describe('Position and Pulse State Change', () => {
        beforeEach(() => {
          figure.unpause();
          a.setPosition(4, 4);
          // a.pulseScale({ duration: 2, scale: 4, when: 'syncNow' });
          figure.elements._l.pulseWidth({ duration: 2, line: 4, when: 'syncNow' });
          // This is ok as it kicks off the pulse
          figure.mock.timeStep(0);  // Ok
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, false, 0, 1]);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['idle', false, false, false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).y).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).y).toBe(2);
          // This is ok as pulseTransforms is updated and drawTransforms will
          // be updated on the next draw
          figure.mock.timeStep(0);  // Ok
        });
        test('Animate to resume with different durations', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          a.setPosition(2, 2);
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(0.5);
          expect(a.getPosition().round(3).x).toBe(1);
          figure.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(0);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Animate to resume with same durations', () => {
          recorder.settings.play = {
            how: 'animate',
            velocity: {},
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', false, false, true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(2);
          figure.mock.timeStep(1);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', false, false, true, 1, 4]);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.6, 4]);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.2, 4]);
          expect(round(figure.elements.opacity)).toBe(0.001);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);

          // end delay, start dissolve in
          figure.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.8, 2]);
          // expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);

          // disolve in

          expect(round(figure.elements.opacity)).toBe(0.001);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', false, false, true, 0.4, 2]);
          expect(figure.elements.isShown).toBe(true);
          expect(round(figure.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          figure.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', false, false, true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(figure.elements.opacity)).toBe(1);
          expect(figure.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
    });
  });
});
