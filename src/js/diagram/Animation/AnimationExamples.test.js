import {
  Point, Transform,
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

describe('Animation Examples', () => {
  let diagram;
  let elem1;
  let elem2;
  let examples;
  let p1;
  let p2;
  let r1;
  let r2;
  let s1;
  let s2;
  let callbackFlag;
  let callback;
  beforeEach(() => {
    p1 = new Point(1, 1);
    p2 = new Point(2, 2);
    r1 = 1;
    r2 = 2;
    s1 = new Point(1, 1);
    s2 = new Point(2, 2);
    diagram = makeDiagram();
    elem1 = diagram.objects.line();
    elem2 = diagram.objects.line();
    diagram.elements.add('elem1', elem1);
    diagram.elements.add('elem2', elem2);
    elem1.transform = elem1.transform.zero();
    elem2.transform = elem2.transform.zero();
    elem1.scenarios = {
      scenario1: { position: p1, rotation: r1, scale: s1 },
      scenario2: { position: p2, rotation: r2, scale: s2 },
    };
    callbackFlag = 0;
    callback = () => { callbackFlag = 1; };
    examples = {
      simpleMovePossibilities: {
        animations: () => {
          elem1.animations.new()
            .moveTo({ target: p1, duration: 1 })
            .start();
        },
        element: () => {
          elem1.animations.new(
            elem1.anim.position({ target: p1, duration: 1 }),
          ).start();
        },
      },
      moveToPossibilities: {
        scenarios: () => {
          elem1.animations.new()
            .moveToScenario({ target: 'scenario1', duration: 1 })
            .moveToScenario({ target: 'scenario2', duration: 1 })
            .start();
        },
        separateTransformElementsSeparateStart: () => {
          elem1.animations.new()
            .moveTo({ target: p1, duration: 1 })
            .moveTo({ target: p2, duration: 1 });
          elem1.animations.new()
            .scaleTo({ target: s1, duration: 1 })
            .scaleTo({ target: s2, duration: 1 });
          elem1.animations.new()
            .rotation({ target: r1, duration: 1 })
            .rotation({ target: r2, duration: 1 });
          elem1.animations.start();
        },
        separateTransformElements: () => {
          elem1.animations.new()
            .moveTo({ target: p1, duration: 1 })
            .moveTo({ target: p2, duration: 1 })
            .start();
          elem1.animations.new()
            .scaleTo({ target: s1, duration: 1 })
            .scaleTo({ target: s2, duration: 1 })
            .start();
          elem1.animations.new()
            .rotation({ target: r1, duration: 1 })
            .rotation({ target: r2, duration: 1 })
            .start();
        },
        asParallelAndSerial: () => {
          elem1.animations.new()
            .inParallel([
              inSerial([
                elem1.anim.position({ target: p1, duration: 1 }),
                elem1.anim.position({ target: p2, duration: 1 }),
              ]),
              inSerial([
                elem1.anim.scale({ target: s1, duration: 1 }),
                elem1.anim.scale({ target: s2, duration: 1 }),
              ]),
              inSerial([
                elem1.anim.rotation({ target: r1, duration: 1 }),
                elem1.anim.rotation({ target: r2, duration: 1 }),
              ]),
            ])
            .start();
        },
        asTransforms: () => {
          const t1 = new Transform().scale(s1).rotate(r1).translate(p1);
          const t2 = new Transform().scale(s2).rotate(r2).translate(p2);
          elem1.animations.new()
            .moveToTransform({ target: t1, duration: 1 })
            .moveToTransform({ target: t2, duration: 1 })
            .start();
        },
      },
      // allStepsInBuilder: () => {
      //   elem1.animations.new()
      //     .moveTo({ target: p1, duration: 1 })
      //     .positionTo({ target: p1, duration: 1 })
      //     .rotateTo({ target: r1, duration: 1 })
      //     .scaleTo({ target: s1, duration: 1 })
      //     .transformTo({ target: t1, duration: 1})
      //     .delay(1)
      //     .position({ target: p1, duration: 1 })
      //     .scale({ target: s1, duration: 1 })
      //     .rotation({ target: r1, duration: 1 })
      //     .transform({ target: t1, duration: 1 })
      //     .scenario({ scenario: 'scenario1', duration: 1})
      //     .color({ target: c1, duration: 1})
      //     .dissolveIn(1)
      //     .dissolveOut(2)
      //     .trigger(t1)
      //     .custom(c1)
      //     .inParallel()
      //     .inSerial()
      //     .reset()
      //     .
      //     .delay(1)
      //     .dissolveOut(1)
      //     .dissolveIn(1)
      //     .colorTo({ target: [0, 1, 0, 1], duration: 1 })
      // }
      moveElementSimple: () => {
        elem1.animations.new()
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .start();
      },
      // Elements 1 and 2 move together in parallel for first second
      // Then just element 1 moves onward for another second
      moveElementsInParallel: () => {
        elem1.animations.new()
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
        elem1.animations.new()
          .inParallel([
            elem1.moveTo({ target: p1, duration: 1, progression: 'linear' }),
            elem2.moveTo({ target: p1, duration: 1, progression: 'linear' }),
          ], { completeOnCancel: false })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .start();
      },
      animationCallbackStop: () => {
        elem1.animations.new()
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .whenFinished(callback)
          .ifCanceledThenStop()
          .start();
      },
      animationCallbackComplete: () => {
        elem1.animations.new()
          .moveTo({ target: p1, duration: 1, progression: 'linear' })
          .moveTo({ target: p2, duration: 1, progression: 'linear' })
          .whenFinished(callback)
          .ifCanceledThenComplete()
          .start();
      },
      nesting: () => {
        elem1.animations.new()
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
            elem1.animationBuilder()
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
    elem1.animations.nextFrame(100);
    elem1.animations.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animations.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animations.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Parallel Step', () => {
    examples.moveElementsInParallel();
    elem1.animations.nextFrame(100);
    elem1.animations.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(elem2.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animations.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animations.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Parallel Step Simple', () => {
    examples.moveElementsInParallelSimply();
    expect(elem1.animations.animations[0].steps[0].completeOnCancel).toBe(false);
    elem1.animations.nextFrame(100);
    elem1.animations.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(elem2.getPosition().round()).toEqual(point(0.1));

    let remaining = elem1.animations.nextFrame(101.1);
    expect(elem1.getPosition().round()).toEqual(point(1.1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0);

    remaining = elem1.animations.nextFrame(102.1);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(0.1);
  });
  test('Cancel, check callback and stop', () => {
    examples.animationCallbackStop();
    // console.log(elem1.animator)
    elem1.animations.nextFrame(100);
    elem1.animations.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(callbackFlag).toBe(0);

    elem1.animations.cancelAll();
    expect(callbackFlag).toBe(1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
  });
  test('Cancel, check callback and complete', () => {
    examples.animationCallbackComplete();
    // console.log(elem1.animator)
    elem1.animations.nextFrame(100);
    elem1.animations.nextFrame(100.1);
    expect(elem1.getPosition().round()).toEqual(point(0.1));
    expect(callbackFlag).toBe(0);

    elem1.animations.cancelAll();
    expect(callbackFlag).toBe(1);
    expect(elem1.getPosition().round()).toEqual(point(2));
  });
  test('Nesting', () => {
    examples.nesting();
    elem1.animations.nextFrame(0);
    elem1.animations.nextFrame(0.5);

    expect(elem1.getPosition().round()).toEqual(point(0.5));
    expect(elem2.getPosition().round()).toEqual(point(0));

    elem1.animations.nextFrame(1.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(0.5));

    elem1.animations.nextFrame(2.4);
    expect(elem1.getPosition().round()).toEqual(point(1.6));
    expect(elem2.getPosition().round()).toEqual(point(1.4));

    elem1.animations.nextFrame(3.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animations.nextFrame(4.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animations.nextFrame(4.9);
    expect(elem1.getPosition().round()).toEqual(point(1.9));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animations.nextFrame(5);
    expect(elem1.getPosition().round()).toEqual(point(2));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animations.nextFrame(5.5);
    expect(elem1.getPosition().round()).toEqual(point(1.5));
    expect(elem2.getPosition().round()).toEqual(point(2));

    elem1.animations.nextFrame(6.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(1.5));

    const remaining = elem1.animations.nextFrame(7.5);
    expect(elem1.getPosition().round()).toEqual(point(1));
    expect(elem2.getPosition().round()).toEqual(point(1));
    expect(math.round(remaining)).toBe(remaining);
  });
  describe('Simple moveto possibilities', () => {
    let tester;
    beforeEach(() => {
      tester = () => {
        diagram.draw(0);
        expect(elem1.getPosition().round()).toEqual(point(0));
        diagram.draw(0.5);
        expect(elem1.getPosition().round()).toEqual(point(0.5));
        diagram.draw(1);
        expect(elem1.getPosition().round()).toEqual(point(1));
        diagram.draw(1.5);
        expect(elem1.getPosition().round()).toEqual(point(1));
      };
    });
    test('Separate Transform Elements', () => {
      examples.simpleMovePossibilities.animations();
      tester();
    });
    test('Separate Transform Elements with separate start', () => {
      examples.simpleMovePossibilities.element();
      tester();
    });
  });
  describe('All moveto possibilities', () => {
    let tester;
    beforeEach(() => {
      tester = () => {
        diagram.draw(0);
        expect(elem1.getPosition().round()).toEqual(point(0));
        expect(elem1.getScale().round()).toEqual(point(0));
        expect(math.round(elem1.getRotation(), 2)).toEqual(0);
        diagram.draw(0.5);
        expect(elem1.getPosition().round()).toEqual(point(0.5));
        expect(elem1.getScale().round()).toEqual(point(0.5));
        expect(math.round(elem1.getRotation(), 2)).toEqual(0.5);
        diagram.draw(1);
        expect(elem1.getPosition().round()).toEqual(point(1));
        expect(elem1.getScale().round()).toEqual(point(1));
        expect(math.round(elem1.getRotation(), 2)).toEqual(1);
        diagram.draw(1.5);
        expect(elem1.getPosition().round()).toEqual(point(1.5));
        expect(elem1.getScale().round()).toEqual(point(1.5));
        expect(math.round(elem1.getRotation(), 2)).toEqual(1.5);
        diagram.draw(2);
        expect(elem1.getPosition().round()).toEqual(point(2));
        expect(elem1.getScale().round()).toEqual(point(2));
        expect(math.round(elem1.getRotation(), 2)).toEqual(2);
        diagram.draw(2.5);
        expect(elem1.getPosition().round()).toEqual(point(2));
        expect(elem1.getScale().round()).toEqual(point(2));
        expect(math.round(elem1.getRotation(), 2)).toEqual(2);
      };
    });
    test('Separate Transform Elements', () => {
      examples.moveToPossibilities.separateTransformElements();
      tester();
    });
    test('Separate Transform Elements with separate start', () => {
      examples.moveToPossibilities.separateTransformElementsSeparateStart();
      tester();
    });
    test('Scenarios', () => {
      examples.moveToPossibilities.scenarios();
      tester();
    });
    test('Parallel and Serial', () => {
      examples.moveToPossibilities.asParallelAndSerial();
      tester();
    });
    test('Transforms', () => {
      examples.moveToPossibilities.asTransforms();
      tester();
    });
  });
});
