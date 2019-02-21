import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
// import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';
import * as anim from './Animation';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const point = value => new Point(value, value);

describe('Two Element Animation Examples', () => {
  let elem1;
  let elem2;
  let examples;
  const p0 = new Point(0, 0);
  const p1 = new Point(1, 1);
  // const p2 = new Point(2, 2);
  let animation;
  let tester;
  let animationCallback;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem2 = diagram.objects.line();
    elem1.setPosition(p0);
    elem2.setPosition(p0);
    animationCallback = jest.fn(() => {});
    examples = {
      simple: () => {
        elem1.animations.new()
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .delay(1)
          .move({
            element: elem2, target: p1, duration: 1, progression: 'linear',
          })
          .whenFinished(animationCallback)
          .ifCanceledThenComplete()
          .start();
        ([animation] = elem1.animations.animations);
      },
      complete: () => {
        // Single element move, complete
        // create new animation and tie it to an element that will execute it on draw
        animation = new anim.AnimationBuilder({
          element: elem1,
          onFinish: animationCallback,
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
        animation.then(step1).then(step2).then(step3);
        animation.start();
      },
    };
    tester = () => {
      expect(animationCallback.mock.calls.length).toBe(0);
      expect(elem1.getPosition().round()).toEqual(p0);
      expect(elem2.getPosition().round()).toEqual(p0);
      animation.nextFrame(100);
      animation.nextFrame(100.5);
      expect(elem1.getPosition().round()).toEqual(point(0.5));
      expect(elem2.getPosition().round()).toEqual(p0);
      animation.nextFrame(101.5);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(p0);
      animation.nextFrame(102.5);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(point(0.5));
      animation.nextFrame(103);
      expect(elem1.getPosition().round()).toEqual(p1);
      expect(elem2.getPosition().round()).toEqual(p1);
      expect(animationCallback.mock.calls.length).toBe(0);
      animation.nextFrame(103.01);
      expect(animationCallback.mock.calls.length).toBe(1);
    };
  });
  test('Animation Complete', () => {
    examples.complete();
    tester();
  });
  test('Animation Simple', () => {
    examples.simple();
    tester();
  });
});
