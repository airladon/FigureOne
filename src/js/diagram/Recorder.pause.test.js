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

      const check = (recorderState, diagramIsPaused, aIsPaused, isAnimating, remainingAnimationTime, x) => {
        expect(recorderState).toEqual(recorderState)
      }
      states = () => [recorder.state, diagram.isPaused, a.isPaused, diagram.isAnimating(), diagram.getRemainingAnimationTime(), a.getPosition().round(3).x];
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      recorder.startPlayback(0);
      diagram.mock.timeStep(0);
      expect(states()).toEqual(['playing', false, false, false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', false, false, true, 2, 0]);
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
//   //     expect(states()).toEqual(['playing', false, false, false, 0]);
//   //   });
//   // });
// });
