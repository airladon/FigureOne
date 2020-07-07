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

describe('Animate To State', () => {
  let diagram;
  let recorder;
  let playbackStartedCallback;
  let preparingToPlayCallback;
  let preparingToPauseCallback;
  let playbackStoppedCallback;
  // let p1;
  // let p2;
  // let p3;
  // let c;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
      }
    ]);
    a = diagram.elements._a;
    diagram.initialize();
    ({ recorder } = diagram);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    playbackStartedCallback = jest.fn();
    preparingToPlayCallback = jest.fn();
    preparingToPauseCallback = jest.fn();
    playbackStoppedCallback = jest.fn();
    const subs = recorder.subscriptions;
    subs.subscribe('playbackStarted', playbackStartedCallback);
    subs.subscribe('playbackStopped', playbackStoppedCallback);
    subs.subscribe('preparingToPause', preparingToPauseCallback);
    subs.subscribe('preparingToPlay', preparingToPlayCallback);
    recorder.stateTimeStep = 1;
  });
  describe('Animation', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      // a.pauseSettings.animation.complete = false;
      // a.pauseSettings.animation.clear = true;
      const startAnimation = () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .start();
      };
      recorder.addEventType('startAnimation', startAnimation.bind(this));

      // setup
      
      diagram.mock.timeStep(0);
      recorder.startRecording();
      diagram.mock.timeStep(1);
      startAnimation();
      recorder.recordEvent('startAnimation');
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      const check = (recorderState, diagramIsPaused, aIsPaused, isAnimating, remainingAnimationTime, x) => {
        expect(recorderState).toEqual(recorderState)
      }
      states = () => [recorder.state, diagram.state.pause, a.state.pause, diagram.isAnimating(), round(diagram.getRemainingAnimationTime()), a.getPosition().round(3).x];
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
        recorder.startPlayback(0);
        diagram.mock.timeStep(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
      test('Complete before pause', () => {
        recorder.settings.pause = 'completeBeforePause';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
        diagram.mock.timeStep(0.5);
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
        diagram.mock.timeStep(0.5);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
    });
    describe.only('Resume after Freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = { default: 'freeze' };
        recorder.startPlayback(0);
        diagram.mock.timeStep(0);
        diagram.mock.timeStep(1);
        diagram.mock.timeStep(1);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      });
      describe('No State Change', () => {
        test('Instant resume', () => {
          recorder.settings.resume = 'instant';
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Animate to resume', () => {
          recorder.settings.resume = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.resume = 'dissolve';
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
      });
      describe('State Change', () => {
        beforeEach(() => {
          a.setPosition(2.5, 2.5);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.resume = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume (default velocity)', () => {
          recorder.settings.resume = 'animate';
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and duration', () => {
          // duration should trump
          recorder.settings.resume = {
            action: 'animate',
            duration: 2,
            velocity: {
              position: 2,
            },
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with custom velocity', () => {
          recorder.settings.resume = {
            action: 'animate',
            velocity: { position: 1 },
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with velocity and maxTime', () => {
          recorder.settings.resume = {
            action: 'animate',
            maxTime: 0.5, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 2.5]);
          diagram.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.25, 1.5]);
          diagram.mock.timeStep(0.25);
        });
        test('Animate to resume with velocity and minTime', () => {
          recorder.settings.resume = {
            action: 'animate',
            minTime: 2, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with velocity and zeroThreshold', () => {
          recorder.settings.resume = {
            action: 'animate',
            zeroDurationThreshold: 1, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
        });
        test('Animate to resume with velocity and allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.resume = {
            action: 'animate',
            allDurationsSame: true, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 1,
            },
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(0.95);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and NOT allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.resume = {
            action: 'animate',
            allDurationsSame: false, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 0.2,
            },
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          diagram.mock.timeStep(0.25);
          expect(round(a.color[0])).toBe(0.95);
          diagram.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(1);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with duration', () => {
          recorder.settings.resume = {
            action: 'animate',
            duration: 2,
          };
          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Dissolve to resume', () => {
          recorder.settings.resume = 'dissolve';

          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 0.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in
          diagram.mock.timeStep(0);
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 0.5]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
        test('Dissolve to resume', () => {
          recorder.settings.resume = {
            action: 'dissolve',
            duration: {
              dissolveIn: 1,
              dissolveOut: 1,
              delay: 1,
            },
          };

          recorder.resumePlayback();
          diagram.mock.timeStep(0);
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1.5, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in
          diagram.mock.timeStep(0);
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 0.5]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
        // test('Dissolve to resume with duration', () => {});
        // test('Dissolve to resume with velocity', () => {});
      });
    });
    test('Freeze on pause, continue on next frame after unpause', () => {
      recorder.settings.pause = { default: 'freeze' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);

      recorder.resumePlayback();
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Freeze on pause, change state, instant back to unpause', () => {
      recorder.settings.pause = { default: 'freeze' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);

      a.setPosition(2.5, 2.5);

      recorder.resumePlayback({ maxTime: 0 });
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Freeze on pause, change state, animate to unpause', () => {
      recorder.settings.pause = { default: 'freeze' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);

      a.setPosition(2.5, 2.5);

      recorder.resumePlayback();
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Finish Animating on Pause, instant back to unpause', () => {
      recorder.settings.pause = { default: 'completeBeforePause' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);

      recorder.resumePlayback({ maxTime: 0 });
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Finish Animating on Pause, animate to unpause', () => {
      recorder.settings.pause = { default: 'completeBeforePause' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);

      recorder.resumePlayback();
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.25, 1]);
      diagram.mock.timeStep(0.125);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.125, 0.75]);
      diagram.mock.timeStep(0.125);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Finish Animating on Pause, change state, instant back to unpause', () => {
      recorder.settings.pause = { default: 'completeBeforePause' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);

      a.setPosition(2.5, 2.5);
      recorder.resumePlayback({ maxTime: 0 });
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Finish Animating on Pause, change state, animate to unpause', () => {
      recorder.settings.pause = { default: 'completeBeforePause' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);

      a.setPosition(2.5, 2.5);
      recorder.resumePlayback();
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Freeze on pause, no state change, dissolve set', () => {
      recorder.settings.pause = { default: 'freeze' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);

      recorder.resumePlayback({ dissolve: true, duration: 1, delay: 1, });
      diagram.mock.timeStep(0);

      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Freeze on pause, change state, dissolve out, then in', () => {
      recorder.settings.pause = { default: 'freeze' };
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      
      recorder.pausePlayback();
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', true, 1, 0.5]);

      a.setPosition(2.5, 2.5);

      // debugger;
      recorder.resumePlayback({ dissolve: true, duration: 1, delay: 1, });
      diagram.mock.timeStep(0);

      // dissolve out
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
      expect(diagram.elements.opacity).toBe(1);
      expect(diagram.elements.isShown).toBe(true);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1.5, 2.5]);
      expect(diagram.elements.opacity).toBe(0.5005);
      expect(a.isShown).toBe(true);

      // end dissolve out, start delay
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
      expect(diagram.elements.opacity = 1);
      expect(diagram.elements.isShown).toBe(true);
      expect(a.isShown).toBe(false);
      
      // end delay, start dissolve in
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 0.5]);
      expect(diagram.elements.opacity = 1);
      expect(diagram.elements.isShown).toBe(true);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(0.001);
      
      // disolve in
      diagram.mock.timeStep(0);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 0.5]);
      expect(diagram.elements.opacity = 1);
      expect(diagram.elements.isShown).toBe(true);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(0.5005);

      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      expect(a.isShown).toBe(true);
      expect(a.opacity).toBe(1);
      expect(diagram.elements.opacity = 1);
      expect(diagram.elements.isShown).toBe(true);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
  });
});

// import {
//   Point, Transform,
// } from '../tools/g2';
// import {
//   round,
// } from '../tools/math';
// import * as tools from '../tools/tools';
// import makeDiagram from '../__mocks__/makeDiagram';

// tools.isTouchDevice = jest.fn();

// jest.mock('./recorder.worker');

// describe('Recorder - Pausing', () => {
//   let diagram;
//   let a;
//   let recorder;
//   // beforeEach(() => {
//   //   diagram = makeDiagram();
//   //   diagram.addElements([
//   //     {
//   //       name: 'a',
//   //       method: 'polygon',
//   //     }
//   //   ]);
//   //   a = diagram.elements._a;
//   //   diagram.initialize();
//   //   ({ recorder } = diagram);
//   //   // debugger;
//   // });
//   beforeEach(() => {
//     diagram = makeDiagram();
//     diagram.addElements([
//       {
//         name: 'c',
//         method: 'collection',
//         addElements: [
//           {
//             name: 'p2',
//             method: 'polygon',
//           },
//           {
//             name: 'p3',
//             method: 'polygon',
//             mods: {
//               transformUpdatesIndependantly: false,
//             },
//           },
//         ],
//       },
//       {
//         name: 'p1',
//         method: 'polygon',
//       }
//     ]);
//     c = diagram.elements._c;
//     p1 = diagram.elements._p1;
//     p2 = c._p2;
//     p3 = c._p3;
//     diagram.initialize();
//   });
//   test('', () => {
//     debugger;
//   });
//   // describe('Element Animating', () => {
//   //   let states;
//   //   let callbacks;
//   //   // beforeEach(() => {
//   //   //   // a = diagram.getElement('a');
//   //   //   a.pauseSettings.animation.complete = false;
//   //   //   a.pauseSettings.animation.clear = true;
//   //   //   const startAnimation = () => {
//   //   //     a.animations.new()
//   //   //       .position({ start: [0, 0], target: [1, 1], duration: 2 })
//   //   //       .start();
//   //   //   };
//   //   //   recorder.addEventType('startAnimation', startAnimation.bind(this));
//   //   //   playbackStartedCallback = jest.fn();
//   //   //   preparingToPlayCallback = jest.fn();
//   //   //   preparingToPauseCallback = jest.fn();
//   //   //   playbackStoppedCallback = jest.fn();

//   //   //   const subs = recorder.subscriptions;
//   //   //   subs.subscribe('playbackStarted', playbackStartedCallback);
//   //   //   subs.subscribe('playbackStopped', playbackStoppedCallback);
//   //   //   subs.subscribe('preparingToPause', preparingToPauseCallback);
//   //   //   subs.subscribe('preparingToPlay', preparingToPlayCallback);

//   //   //   // setup
//   //   //   recorder.stateTimeStep = 1;
//   //   //   diagram.mock.timeStep(0);
//   //   //   // diagram.pause();
//   //   //   // recording
//   //   //   recorder.startRecording();
//   //   //   timeStep(1);
//   //   //   startAnimation();
//   //   //   recorder.recordEvent('startAnimation');
//   //   //   timeStep(1);
//   //   //   timeStep(1);
//   //   //   timeStep(1);
//   //   //   recorder.recordEvent('touch', ['up']);
//   //   //   recorder.stopRecording();

//   //   //   const check = (recorderState, diagramIsPaused, aIsPaused, isAnimating, remainingAnimationTime, x) => {
//   //   //     expect(recorderState).toEqual(recorderState)
//   //   //   }
//   //   //   states = () => [recorder.state, diagram.isPaused, a.isPaused, diagram.isAnimating(), diagram.getRemainingAnimationTime(), a.getPosition().round(3).x];
//   //   //   callbacks = () => [
//   //   //     preparingToPlayCallback.mock.calls.length,
//   //   //     playbackStartedCallback.mock.calls.length,
//   //   //     preparingToPauseCallback.mock.calls.length,
//   //   //     playbackStoppedCallback.mock.calls.length,
//   //   //   ];
//   //   // });
//   //   test('Freeze on Pause, unfreeze on next frame', () => {
//   //     // recorder.startPlayback(0);
//   //     debugger;
//   //     expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0]);
//   //   });
//   // });
// });
