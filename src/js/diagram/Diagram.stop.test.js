import {
  round,
} from '../tools/math';
import makeDiagram from '../__mocks__/makeDiagram';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Diagram Stop', () => {
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
  describe('Pulsing', () => {
    let state;
    beforeEach(() => {
      a.pulseScale({
        duration: 2, scale: 2, when: 'now', progression: 'tools.math.triangle',
      });
      state = () => [
        diagram.isAnimating(),
        round(diagram.getRemainingAnimationTime()),
        a.pulseTransforms.map(t => t.s().round(3).x),
        a.frozenPulseTransforms.map(t => t.s().round(3).x),
        a.drawTransforms.map(t => t.s().round(3).x),
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        diagram.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, [], [], [1], 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 2, [], [], [1], 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, [2], [], [2], 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, [1], [], [1], 1, 1, false]);
        diagram.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, [], [], [1], 0, 0, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, [2], [], [2], 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, [], [2], [2], 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, [], [], [2], 0, 1, false]);
        diagram.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, [], [], [2], 0, 1, false]);
        diagram.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 1, [2], [], [2], 1, 0, true]);
        diagram.mock.timeStep(0.5);
        expect(state()).toEqual([true, 0.5, [1.5], [], [1.5], 1, 0, true]);
        diagram.mock.timeStep(0.5);
        expect(state()).toEqual([false, 0, [1], [], [1], 1, 1, false]);
        diagram.mock.timeStep(0);
        expect(state()).toEqual([false, 0, [], [], [1], 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, [], [2], [2], 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, [], [2], [2], 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, [], [2], [2], 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, [], [], [1], 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, [], [], [1], 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
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
      diagram.mock.touchDown([0, 0]);
      diagram.mock.timeStep(1);
      diagram.mock.touchMove([2, 0]);
      diagram.mock.touchUp();
      // diagram.mock.timeStep(0);
      // a is now moving at v = 2/s
      // it should come to a complete stop after 2s
      // it should travel: s = 2 * 2 - 0.5 * 1 * 2**2 = 4 - 2 = 2
      state = () => [
        diagram.isAnimating(),
        round(diagram.getRemainingAnimationTime(), 4),
        a.getPosition().round(3).x,
        preparingToStopCallback.mock.calls.length,
        stoppedCallback.mock.calls.length,
        diagram.state.preparingToStop,
      ];
    });
    describe('Start', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
      });
      test('No Stopping', () => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 0, 0, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 2, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 2, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
    });
    describe('Middle', () => {
      beforeEach(() => {
        expect(state()).toEqual([true, 2, 2, 0, 0, false]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 3.5, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 3.5, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 3.5, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 3.5, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 3.5, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 3.5, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
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
        diagram.mock.touchDown([0, 0]);
        diagram.mock.timeStep(1);
        diagram.mock.touchMove([2, 0]);
        diagram.mock.touchUp();

        a.animations.new()
          .position({ start: [0, 0], target: [2, 0], duration: 2 })
          .start('now');
        state = () => [
          diagram.isAnimating(),
          round(diagram.getRemainingAnimationTime()),
          a.getPosition().round(3).x,
          b.getPosition().round(3).x,
          preparingToStopCallback.mock.calls.length,
          stoppedCallback.mock.calls.length,
          diagram.state.preparingToStop,
        ];

        expect(state()).toEqual([true, 2, 0, 2, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 2, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 2, 0, 2, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 1, 3.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 2, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 2, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 2, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 2, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 2, 4, 1, 1, false]);
      });
    });
    describe('Animate, move freely, different times', () => {
      beforeEach(() => {
        b.move.freely.zeroVelocityThreshold = { translation: 0.0000001 };
        b.move.freely.deceleration = { translation: 1 };
        b.setMovable(true);
        diagram.mock.touchDown([0, 0]);
        diagram.mock.timeStep(1);
        diagram.mock.touchMove([2, 0]);
        diagram.mock.touchUp();

        a.animations.new()
          .position({ start: [0, 0], target: [3, 0], duration: 3 })
          .start('now');
        state = () => [
          diagram.isAnimating(),
          round(diagram.getRemainingAnimationTime()),
          a.getPosition().round(3).x,
          b.getPosition().round(3).x,
          preparingToStopCallback.mock.calls.length,
          stoppedCallback.mock.calls.length,
          diagram.state.preparingToStop,
        ];

        expect(state()).toEqual([true, 3, 0, 2, 0, 0, false]);
      });
      test('Freeze', () => {
        diagram.stop('freeze');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Cancel', () => {
        diagram.stop('cancel');
        expect(state()).toEqual([false, 0, 0, 2, 0, 1, false]);
      });
      test('Complete', () => {
        diagram.stop('complete');
        expect(state()).toEqual([false, 0, 3, 4, 0, 1, false]);
      });
      test('Animate To Complete', () => {
        diagram.stop('animateToComplete');
        expect(state()).toEqual([true, 3, 0, 2, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 2, 0.6, 3.5, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([true, 1, 2.4, 4, 1, 0, true]);
        diagram.mock.timeStep(1);
        expect(state()).toEqual([false, 0, 3, 4, 1, 1, false]);
      });
      test('Dissolve To Complete', () => {
        diagram.stop('dissolveToComplete');
        expect(state()).toEqual([true, 1, 0, 2, 1, 0, true]);
        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.6, 0, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.2, 0, 2, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(1);

        diagram.mock.timeStep(0.2);
        expect(state()).toEqual([true, 0.8, 3, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.001);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([true, 0.4, 3, 4, 1, 0, true]);
        expect(round(diagram.elements.opacity)).toBe(0.5005);

        diagram.mock.timeStep(0.4);
        expect(state()).toEqual([false, 0, 3, 4, 1, 1, false]);
      });
    });
  });
});
