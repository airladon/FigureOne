import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.useFakeTimers();

describe('Animate To State', () => {
  let figure;
  let p1;
  let p2;
  // let p3;
  let c;
  let drawCallback;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'c',
        method: 'collection',
        elements: [
          {
            name: 'p2',
            method: 'polygon',
          },
          // {
          //   name: 'p3',
          //   method: 'polygon',
          //   mods: {
          //     dependantTransform: true,
          //   },
          // },
        ],
      },
      {
        name: 'p1',
        method: 'polygon',
      },
    ]);
    c = figure.elements._c;
    p1 = figure.elements._p1;
    p2 = c._p2;
    // p3 = c._p3;
    figure.initialize();
    drawCallback = jest.fn(() => {});
    figure.notifications.add('beforeDraw', drawCallback);
  });
  describe('Focus and focus loss simulation', () => {
    test('Focus not lost', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      figure.mock.timeStep(1);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(3);
    });
    test('Focus lost', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(3, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
    test('Focus lost multi animations going frames aligned with animation end times', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      p2.animations.new().position({ target: [3, 0], duration: 3, progression: 'linear' }).start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      figure.mock.timeStep(0.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      figure.mock.timeStep(0.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2.5, 0));
      figure.mock.timeStep(0.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(3, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
    test('Focus lost multi animations going frames unaligned with animation end times', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new().position({ target: [2, 0], duration: 2, progression: 'linear' }).start('now');
      p2.animations.new().position({ target: [3, 0], duration: 3, progression: 'linear' }).start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2.5, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(3, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
    test('Chained animation frames aligned with animation end', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new()
        .position({ target: [2, 0], duration: 2, progression: 'linear' })
        .whenFinished(() => {
          p2.animations.new()
            .position({ target: [2, 0], duration: 2, progression: 'linear' })
            .start('now');
        })
        .start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
    test('Chained animation frames not aligned with animation end', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new()
        .position({ target: [2, 0], duration: 2, progression: 'linear' })
        .whenFinished(() => {
          p2.animations.new()
            .position({ target: [2, 0], duration: 2, progression: 'linear' })
            .start('now');
        })
        .start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1, 0));
      figure.mock.timeStep(1, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
    /**
     * This is a questionable test. Jest only updates timers when
     * figure.mock.timeStep() is called. Therefore, if it is called 4.5s after
     * the p1 animation is kicked off, it will update the timers such that the
     * p1 animation finishes, which then starts the p2 animation at the current
     * now() time, which is 4.5s (not 2s) after p1 is started.
     *
     * It is desired that the p2 animation is actually kicked of at 2s after p1
     * starts, but this test can't catch that. In real life, the timers aren't
     * held back, and so they would fire when now() is 2s (or close to
     * it) meaning that p2 is kicked off at the right time.
     *
     * What happens:
     *  - mockFigure sets performance.now to 4500
     *  - jest.advanceTimersByTime(4500)
     *  - timers go to 2000 which finishes p1 animation and kicks of p2
     *  - p2 starts at 4500, and sets a timer for 2000
     *  - timers now have a new timer for 2000 with 2500 left, so it goes
     *    to that time (which should be then end of p2), but p2 doesn't end
     *    as its start time is 4500 and timeKeeper.now() is still 4500,
     *    so another 2000ms timer is set
     *  - timers now have a new timer for 2000 with 500ms left, so 500 ms comes
     *    out of next timer.
     *  - frame draw 1500ms - which is exactly when the 2000-500ms timer
     *    completes, so we get a setupDraw 1500ms into the 2000ms animation
     *    and thus the position of p2 is now 1.5. A new timer is setup for 500
     *    left.
     *  - frame draw 1000 goes past the 500ms remaining p2 end timer, and so
     *    p2 comes to an end.
     */
    test('Chained animation frames, all happen within single frame', () => {
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(0);
      figure.focusLost();
      p1.animations.new()
        .position({ target: [2, 0], duration: 2, progression: 'linear' })
        .whenFinished(() => {
          p2.animations.new()
            .position({ target: [2, 0], duration: 2, progression: 'linear' })
            .start('now');
        })
        .start('now');
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(4.5, null, false);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(0, 0));
      figure.mock.timeStep(1.5, null, false);
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1.5, 0));
      figure.mock.timeStep(1, null, false);
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 0));
      expect(figure.getRemainingAnimationTime()).toBe(0);
      expect(drawCallback.mock.calls).toHaveLength(1);
    });
  });
});
