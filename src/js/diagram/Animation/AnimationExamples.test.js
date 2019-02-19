import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

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
});
