import {
  Point,
} from '../../tools/g2';
import * as tools from '../../tools/tools';
// import * as math from '../../tools/math';
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
  let elem3;
  let examples;
  let p1;
  let p2;
  let target1;
  let target2;
  // let callbackFlag;
  // let callback;
  beforeEach(() => {
    const diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem2 = diagram.objects.line();
    elem3 = diagram.objects.line();
    elem1.transform = elem1.transform.zero();
    elem2.transform = elem2.transform.zero();
    elem3.transform = elem3.transform.zero();
    elem1.uid = 'uid1';     // For debug
    elem2.uid = 'uid2';     // For debug
    elem3.uid = 'uid3';     // For debug
    p1 = new Point(1, 1);
    p2 = new Point(2, 2);
    target1 = { target: p1, duration: 1, progression: 'linear' };
    target2 = { target: p2, duration: 1, progression: 'linear' };
    // callbackFlag = 0;
    // callback = () => { callbackFlag = 1; };
    examples = {
      timeSkipSimple: () => {
        elem1.animator
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .start();
      },
      timeSkipNested: () => {
        elem1.animator
          .inParallel([
            inSerial([
              elem1.moveTo(target1), delay(1), elem1.moveTo(target2),
            ]),
            inSerial([
              elem2.moveTo(target1), delay(1), elem2.moveTo(target2),
            ]),
          ])
          .start();
      },
      timeSkipComplexNest: () => {
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
            elem3.moveTo({ target: p1, duration: 1, progression: 'linear' }),
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
  test('Time skip 1 step', () => {
    examples.timeSkipSimple();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
  });
  test('Time skip 2 steps', () => {
    examples.timeSkipSimple();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(2.4);
    expect(elem1.getPosition().round()).toEqual(point(1.6));
  });
  test('Time skip 2 steps in nest', () => {
    examples.timeSkipNested();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(2.4);
    expect(elem1.getPosition().round()).toEqual(point(1.4));
    expect(elem2.getPosition().round()).toEqual(point(1.4));
  });
  test('Time skip 2 parrallel nests', () => {
    examples.timeSkipComplexNest();
    elem1.animator.nextFrame(0);
    elem1.animator.nextFrame(5.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(2));
    expect(elem3.getPosition().round()).toEqual(point(1));
  });
});
