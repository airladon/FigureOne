import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

// jest.mock('../../recorder.worker');
jest.useFakeTimers();

describe('Animate To State', () => {
  let figure;
  let p1;
  let p2;
  let p3;
  let c;
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
          {
            name: 'p3',
            method: 'polygon',
            mods: {
              dependantTransform: true,
            },
          },
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
    p3 = c._p3;
    figure.initialize();
  });
  describe('Animate to State', () => {
    beforeEach(() => {
      p2.setTransformCallback = () => {
        p3.setPosition(p2.getPosition());
      };
    });
    test('Simple', () => {
      p1.setPosition(2, 2);
      p2.setPosition(1, 1);
      c.setPosition(1, 1);
      figure.setFirstTransform();
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      const state = figure.getState();
      p1.setPosition(0, 0);
      p2.setPosition(0, 0);
      c.setPosition(0, 0);
      figure.setFirstTransform();
      let done = false;
      const callback = () => { done = true; };
      figure.animateToState(state, { duration: 1 }, callback);
      figure.draw(0);
      expect(p1.animations.animations).toHaveLength(1);
      expect(p2.animations.animations).toHaveLength(1);
      expect(p3.animations.animations).toHaveLength(0);
      expect(c.animations.animations).toHaveLength(1);
      expect(done).toBe(false);
      figure.draw(0.5);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(p3.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(c.getPosition('figure').round(3)).toEqual(new Point(0.5, 0.5));
      expect(done).toBe(false);
      figure.draw(1);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(done).toBe(true);
    });
    test('Visibility', () => {
      p1.setPosition(2, 2);
      p2.setPosition(1, 1);
      p1.hide();
      c.setPosition(1, 1);
      figure.setFirstTransform();
      const state = figure.getState({ ignoreShown: true });
      p1.setPosition(0, 0);
      p2.setPosition(0, 0);
      c.setPosition(0, 0);
      p3.hide();
      p1.show();
      figure.setFirstTransform();
      figure.animateToState(state, { duration: 1 });
      expect(p3.animations.animations).toHaveLength(1);
      figure.draw(0);
      expect(p1.animations.animations[0].steps[0].steps).toHaveLength(1);
      expect(p2.animations.animations[0].steps[0].steps).toHaveLength(1);
      expect(p3.animations.animations[0].steps[0].steps).toHaveLength(1);
      expect(c.animations.animations[0].steps[0].steps).toHaveLength(1);
      figure.draw(0.5);
      expect(p1.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(p3.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(c.getPosition('figure').round(3)).toEqual(new Point(0.5, 0.5));
      expect(p1.opacity).toBe(0.5.15);
      expect(p1.isShown).toBe(true);
      expect(p3.opacity).toBe(0.5.15);
      expect(p3.isShown).toBe(true);

      // figure.draw(0.9);
      figure.draw(1);
      expect(p1.getPosition('local').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('figure').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('figure').round(3)).toEqual(new Point(1, 1));
      expect(p1.opacity).toBe(1);
      expect(p1.isShown).toBe(false);
      expect(p3.opacity).toBe(1);
      expect(p3.isShown).toBe(true);
    });
  });
  describe('Remaining Time', () => {
    test('Simple', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(figure.isAnimating()).toBe(true);
      expect(figure.getRemainingAnimationTime()).toBe(1);
      figure.draw(0);
      expect(figure.getRemainingAnimationTime(0)).toBe(1);
      figure.draw(0.5);
      expect(figure.getRemainingAnimationTime(0.5)).toBe(0.5);
      figure.draw(1);
      expect(figure.getRemainingAnimationTime(1)).toBe(0);
      figure.draw(1.1);
      expect(figure.getRemainingAnimationTime(1.1)).toBe(0);
    });
    test('Multiple different times', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], delay: 1, duration: 1 })
        .start();
      expect(figure.isAnimating()).toBe(true);
      expect(figure.getRemainingAnimationTime()).toBe(2);
      figure.draw(0);
      expect(figure.getRemainingAnimationTime(0)).toBe(2);
      figure.draw(0.5);
      expect(figure.getRemainingAnimationTime(0.5)).toBe(1.5);
      figure.draw(1);
      expect(figure.getRemainingAnimationTime(1)).toBe(1);
      figure.draw(2.1);
      expect(figure.getRemainingAnimationTime(1.1)).toBe(0);
    });
  });
  describe('Animation Finished Callback', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn(() => {});
      figure.animationFinishedCallback = callback;
    });
    test('Simple', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(figure.isAnimating()).toBe(true);
      figure.draw(0);
      figure.draw(0.5);
      expect(figure.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      figure.draw(1);
      expect(callback.mock.calls).toHaveLength(1);
    });
    test('Multiple animations with same durations', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(figure.isAnimating()).toBe(true);
      figure.draw(0);
      figure.draw(0.5);
      expect(figure.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);

      figure.draw(1);
      expect(figure.isAnimating()).toBe(false);
      expect(callback.mock.calls).toHaveLength(1);
    });
    test('Multiple animations with different durations', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], duration: 2 })
        .start();
      expect(figure.isAnimating()).toBe(true);

      figure.draw(0);
      figure.draw(0.5);
      expect(figure.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);

      figure.draw(1);
      expect(figure.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);

      figure.draw(1.5);
      expect(figure.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);

      figure.draw(2);
      expect(callback.mock.calls).toHaveLength(1);
    });
  });
});
