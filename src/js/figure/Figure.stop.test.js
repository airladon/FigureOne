import {
  round,
} from '../tools/math';
import makeFigure from '../__mocks__/makeFigure';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Figure Stop', () => {
  let figure;
  let a;
  let b;
  let stoppedCallback;
  let preparingToStopCallback;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    figure.globalAnimation.reset();
    figure.addElements([
      {
        name: 'a',
        method: 'polygon',
      },
      {
        name: 'b',
        method: 'polygon',
      },
    ]);
    a = figure.elements._a;
    b = figure.elements._b;
    stoppedCallback = jest.fn();
    preparingToStopCallback = jest.fn();
    figure.subscriptions.add('stopped', stoppedCallback);
    figure.subscriptions.add('preparingToStop', preparingToStopCallback);
    figure.initialize();
    figure.mock.timeStep(0);
  });
  describe('Animation', () => {
    let state;
    beforeEach(() => {
      a.animations.new()
        .position({ start: [0, 0], target: [1, 1], duration: 2 })
        .start('now');
      state = () => [
        figure.isAnimating(),
        round(figure.getRemainingAnimationTime()),
        a.getPosition().round(3).x,
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        figure.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 0, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Cancel with animation determining completion as complete', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('complete')
          .start('now');
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Cancel with animation determining completion as freeze', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('freeze')
          .start('now');
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 0, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 1, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 1, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 0, 0, 0, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 0.5, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Cancel with animation determining completion as complete', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('complete')
          .start('now');
        figure.mock.timeStep(1);
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Cancel with animation determining completion as freeze', () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .ifCancelled('freeze')
          .start('now');
        figure.mock.timeStep(1);
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0.5, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 1, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0.5, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0.5, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0.5, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 1, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 1, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 1, 1, 1, false]);
      });
    });
  });
  describe('Pulsing', () => {
    let state;
    beforeEach(() => {
      a.pulse({
        duration: 2, scale: 2, when: 'now', progression: 'tools.math.triangle',
      });
      state = () => [
        figure.isAnimating(),
        round(figure.getRemainingAnimationTime()),
        a.pulseTransforms.map(t => t.s().round(3).x),
        a.frozenPulseTransforms.map(t => t.s().round(3).x),
        a.drawTransforms.map(t => t.s().round(3).x),
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        figure.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, [], [], [1], 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 2, [], [], [1], 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, [2], [], [2], 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, [1], [], [1], 1, 1, false]);
        figure.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, [], [], [1], 0, 0, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, [2], [], [2], 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, [], [2], [2], 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, [], [], [2], 0, 1, false]);
        figure.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, [], [], [2], 0, 1, false]);
        figure.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 1, [2], [], [2], 1, 0, true]);
        figure.mock.timeStep(0.5);
        expect(state()).toEqual([true, 0.5, [1.5], [], [1.5], 1, 0, true]);
        figure.mock.timeStep(0.5);
        expect(state()).toEqual([false, 0, [1], [], [1], 1, 1, false]);
        figure.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, [], [2], [2], 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, [], [2], [2], 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, [], [2], [2], 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, [], [], [1], 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, [], [], [1], 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, [], [], [1], 1, 1, false]);
      });
    });
  });
  describe('Moving Freely', () => {
    let state;
    beforeEach(() => {
      a.move.freely.deceleration = { translation: 1 };
      a.move.freely.zeroVelocityThreshold = { translation: 0.0000001 };
      a.setMovable(true);
      figure.mock.touchDown([0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([2, 0]);
      figure.mock.touchUp();
      // figure.mock.timeStep(0);
      // a is now moving at v = 2/s
      // it should come to a complete stop after 2s
      // it should travel: s = 2 * 2 - 0.5 * 1 * 2**2 = 4 - 2 = 2
      state = () => [
        figure.isAnimating(),
        round(figure.getRemainingAnimationTime(), 4),
        a.getPosition().round(3).x,
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        figure.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
      });
      test('No Stopping', () => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 0, 0, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 2, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 2, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 3.5, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 3.5, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 3.5, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 3.5, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
    });
  });
  describe('Two Elements', () => {
    let state;
    describe('Animate, move freely, same time', () => {
      beforeEach(() => {
        b.move.freely.zeroVelocityThreshold = { translation: 0.0000001 };
        b.move.freely.deceleration = { translation: 1 };
        b.setMovable(true);
        figure.mock.touchDown([0, 0]);
        figure.mock.timeStep(1);
        figure.mock.touchMove([2, 0]);
        figure.mock.touchUp();

        a.animations.new()
          .position({ start: [0, 0], target: [2, 0], duration: 2 })
          .start('now');
        state = () => [
          figure.isAnimating(),
          round(figure.getRemainingAnimationTime()),
          a.getPosition().round(3).x,
          b.getPosition().round(3).x,
          preparingToStopCallback.mock.calls.length,
          stoppedCallback.mock.calls.length,
          figure.state.preparingToStop,
        ];

        expect(state()).toEqual([true, 2, 0, 2, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 2, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 0, 2, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 1, 3.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 2, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 2, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 2, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 2, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 2, 4, 1, 1, false]);
      });
    });
    describe('Animate, move freely, different times', () => {
      beforeEach(() => {
        b.move.freely.zeroVelocityThreshold = { translation: 0.0000001 };
        b.move.freely.deceleration = { translation: 1 };
        b.setMovable(true);
        figure.mock.touchDown([0, 0]);
        figure.mock.timeStep(1);
        figure.mock.touchMove([2, 0]);
        figure.mock.touchUp();

        a.animations.new()
          .position({ start: [0, 0], target: [3, 0], duration: 3 })
          .start('now');
        state = () => [
          figure.isAnimating(),
          round(figure.getRemainingAnimationTime()),
          a.getPosition().round(3).x,
          b.getPosition().round(3).x,
          preparingToStopCallback.mock.calls.length,
          stoppedCallback.mock.calls.length,
          figure.state.preparingToStop,
        ];

        expect(state()).toEqual([true, 3, 0, 2, 0, 0, false]);
      });
      test('Freeze', () => {
        figure.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        figure.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        figure.stop('complete');
        expect(state()).toEqual([false, 0, 3, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        figure.stop('animateToComplete');
        expect(state()).toEqual([true, 3, 0, 2, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 2, 0.6, 3.5, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 2.4, 4, 1, 0, true]);
        figure.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 3, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        figure.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 2, 1, 0, true]);
        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 2, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(1);

        figure.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 3, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.001);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 3, 4, 1, 0, true]);
        expect(round(figure.elements.opacity)).toBe(0.5005);

        figure.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 3, 4, 1, 1, false]);
      });
    });
  });
});
