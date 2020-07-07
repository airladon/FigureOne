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
  describe('Animate to State', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      a.pauseSettings.animation.complete = false;
      a.pauseSettings.animation.clear = true;
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
      states = () => [recorder.state, diagram.state.pause, a.state.pause, diagram.isAnimating(), diagram.getRemainingAnimationTime(), a.getPosition().round(3).x];
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
    test('Freeze on pause, continue on next frame after unpause', () => {
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: false,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: false,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: false,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: true,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: true,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: true,
      }
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
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: true,
      }
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
    test.only('Freeze on pause, change state, dissolve out, then in', () => {
      a.pauseSettings.animation = {
        complete: false,
        clear: false,
        completeBeforePause: false,
      }
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

      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 3, 2.5]);
      expect(diagram.elements.opacity).toBe(1);
      expect(diagram.elements.isShown).toBe(true);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2.5, 2.5]);
      expect(diagram.elements.opacity).toBe(0.5005);
      diagram.mock.timeStep(0.5);
      expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
      expect(diagram.elements.opacity = 1);
      expect(diagram.elements.isShown).toBe(false);



      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
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
