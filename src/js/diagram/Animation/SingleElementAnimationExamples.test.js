import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';
import * as anim from './Animation';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const point = value => new Point(value, value);

describe('Animator API', () => {
  let elem1;
  let elem2;
  let examples;
  const p0 = new Point(0, 0);
  const p1 = new Point(1, 1);
  const p2 = new Point(2, 2);
  let animator;
  let tester;
  let animatorCallback;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem2 = diagram.objects.line();
    elem1.setPosition(p0);
    elem2.setPosition(p0);
    animatorCallback = jest.fn(() => {});
    examples = {
      simple: () => {
        elem1.animator
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .delay(1)
          .moveTo({
            element: elem2, target: p1, duration: 1, progression: 'linear',
          })
          .whenFinished(animatorCallback)
          .ifCanceledThenComplete()
          .start();
      },
      complete: () => {
        // Single element move, complete
        // create new animator and tie it to an element that will execute it on draw
        animator = new anim.Animator({
          element: elem1,
          onFinish: animatorCallback,
          completeOnCancel: true,
        });
        const step1 = new anim.PositionAnimationStep({
          element: elem1,
          target: p1,
          duration: 1,
          progression: 'linear',
        });
        const step2 = new anim.DelayStep({
          duration: 1,
        });
        const step3 = new anim.PositionAnimationStep({
          element: elem2,
          target: p1,
          duration: 1,
          progression: 'linear',
        });
        animator.then(step1).then(step2).then(step3);
        animator.start();
      },
    };
    tester = () => {
      examples.complete();
      expect(animatorCallback.mock.calls.length).toBe(0);
      expect(elem1.getPosition().round()).toEqual(p0);
      expect(elem2.getPosition().round()).toEqual(p0);
      animator.nextFrame(100);
      animator.nextFrame(100.5);
      expect(elem1.getPosition().round()).toEqual(point(0.5));
      expect(elem2.getPosition().round()).toEqual(p0);
      animator.nextFrame(101.5);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(p0);
      animator.nextFrame(102.5);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(point(0.5));
      animator.nextFrame(103);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(p1);
      expect(animatorCallback.mock.calls.length).toBe(0);
      animator.nextFrame(103.01);
      expect(animatorCallback.mock.calls.length).toBe(1);
    };
  });
  test('Animator Complete', () => {
    examples.complete();
    tester();
  });
  test('Animtor Simple', () => {
    examples.simple();
    tester();
  });
});
