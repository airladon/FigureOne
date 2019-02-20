import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';
import { inSerial, delay } from './Animation';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

const point = value => new Point(value, value);

describe('Animator API', () => {
  let elem1;
  let elem2;
  let examples;
  let p1;
  let p2;
  let callbackFlag;
  let callback;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem2 = diagram.objects.line();
    elem1.transform = elem1.transform.zero();
    elem2.transform = elem2.transform.zero();
    p1 = new Point(1, 1);
    p2 = new Point(2, 2);
    callbackFlag = 0;
    callback = () => { callbackFlag = 1; };
    examples = {
      moveElementSimple: () => {
        elem1.animator
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .start();
      },
      // Elements 1 and 2 move together in parallel for first second
      // Then just element 1 moves onward for another second
      moveElementsInParallel: () => {
        elem1.animator
          .inParallel({
            steps: [
              elem1.moveTo({ target: p1, duration: 1, progression: 'linear' }),
              elem2.moveTo({ target: p1, duration: 1, progression: 'linear' }),
            ],
          })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .start();
      },
      moveElementsInParallelSimply: () => {
        elem1.animator
          .inParallel([
            elem1.moveTo({ target: p1, duration: 1, progression: 'linear' }),
            elem2.moveTo({ target: p1, duration: 1, progression: 'linear' }),
          ], { completeOnCancel: false })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .start();
      },
      animatorCallbackStop: () => {
        elem1.animator
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .whenFinished(callback)
          .ifCanceledThenStop()
          .start();
      },
      animatorCallbackComplete: () => {
        elem1.animator
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .whenFinished(callback)
          .ifCanceledThenComplete()
          .start();
      },
      nesting: () => {
        elem1.animator
          // Only e1 moves to p1
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          // e1 moves to p2
          // e2 moves to p1
          .inParallel([
            elem1.moveTo({ target: p2, duration: 1, progression: 'linear' }),
            elem2.moveTo({ target: p1, duration: 1, progression: 'linear' }),
          ])
          // e1 moves to p1, delays 1, moves to p2
          // e2 moves to p2
          .inParallel([
            elem1.sequence()
              .moveTo({ target: p1, duration: 1, progression: 'linear' })
              .delay(1)
              .moveTo({ target: p2, duration: 1, progression: 'linear' }),
            elem2.moveTo({ target: p2, duration: 1, progression: 'linear' }),
          ])
          // both e1 and e2 move to p1
          .inParallel([
            inSerial([
              elem1.moveTo({ target: p1, duration: 1, progression: 'linear' }),
              delay(1),
            ]),
            inSerial([
              delay(1),
              elem2.moveTo({ target: p1, duration: 1, progression: 'linear' }),
            ]),
          ])
          .start();
      },
    };
  });
  test('Move Element Simple', () => {
    examples.moveElementSimple();
    elem1.animator.nextFrame(100);
    elem1.animator.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animator.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animator.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Parallel Step', () => {
    examples.moveElementsInParallel();
    elem1.animator.nextFrame(100);
    elem1.animator.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(elem2.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animator.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animator.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Parallel Step Simple', () => {
    examples.moveElementsInParallelSimply();
    expect(elem1.animator.steps[0].completeOnCancel).toBe(false);
    elem1.animator.nextFrame(100);
    elem1.animator.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(elem2.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animator.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animator.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Cancel, check callback and stop', () => {
    examples.animatorCallbackStop();
    // console.log(elem1.animator)
    elem1.animator.nextFrame(100);
    elem1.animator.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(callbackFlag).toBe(0);

    elem1.animator.cancel();
    expect(callbackFlag).toBe(1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
  });
  test('Cancel, check callback and complete', () => {
    examples.animatorCallbackComplete();
    // console.log(elem1.animator)
    elem1.animator.nextFrame(100);
    elem1.animator.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(callbackFlag).toBe(0);

    elem1.animator.cancel();
    expect(callbackFlag).toBe(1);
    expect(elem1.getPosition().round()).toEqual(point(2));
  });
  test('Nesting', () => {
    examples.nesting();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(0.5);

    expect(elem1.getPosition().round()).toEqual(point(0.5));
    expect(elem2.getPosition().round()).toEqual(point(0));

    elem1.animator.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(0.5));

    elem1.animator.nextFrame(2.4);
    expect(elem1.getPosition().round()).toEqual(point(1.6));
    expect(elem2.getPosition().round()).toEqual(point(1.4));

    elem1.animator.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animator.nextFrame(4.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animator.nextFrame(4.9);
    expect(elem1.getPosition().round()).toEqual(point(1.9));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animator.nextFrame(5);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animator.nextFrame(5.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animator.nextFrame(6.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(1.5));

    const remaining = elem1.animator.nextFrame(7.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(remaining);
  });
});
