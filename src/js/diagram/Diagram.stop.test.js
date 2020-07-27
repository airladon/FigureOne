// import {
//   Point, Transform,
// } from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import Worker from '../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Animate To State', () => {
  let diagram;
  let a;
  let b;
  let stoppedCallback;
  let preparingToStopCallback;
  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
    diagram.globalAnimation.reset();
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
    stoppedCallback = jest.fn();
    preparingToStopCallback = jest.fn();
    diagram.subscriptions.subscribe('stopped', stoppedCallback)
    diagram.subscriptions.subscribe('preparingToStop', preparingToStopCallback)
    diagram.initialize();
    diagram.mock.timeStep(0);
  });
  describe('Animation', () => {
    let state;
    beforeEach(() => {
      a.animations.new()
        .position({ start: [0, 0], target: [1, 1], duration: 2 })
        .start('now');
      state = () => [
        diagram.isAnimating(),
        round(diagram.getRemainingAnimationTime()),
        a.getPosition().round(3).x,
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        diagram.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 0, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Cancel with animation determining completion as complete', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('complete')
          .start('now');
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Cancel with animation determining completion as freeze', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('freeze')
          .start('now');
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 0, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 1, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 1, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 0, 0, 0, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 0.5, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Cancel with animation determining completion as complete', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('complete')
          .start('now');
        diagram.mock.timeStep(1);
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Cancel with animation determining completion as freeze', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('freeze')
          .start('now');
        diagram.mock.timeStep(1);
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0.5, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0.5, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 1, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 1, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
    });
  });
});
