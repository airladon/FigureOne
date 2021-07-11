import * as tools from '../../../../tools/tools';
import makeFigure from '../../../../__mocks__/makeFigure';
import { round } from '../../../../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Rotation Animation Step', () => {
  let elem1;
  let figure;
  beforeEach(() => {
    figure = makeFigure();
    elem1 = figure.collections.line();
    elem1.setRotation(0);
    figure.elements.add('elem1', elem1);
  });
  test('Simple rotate', () => {
    elem1.animations.new()
      .rotation({ target: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(round(elem1.getRotation())).toBe(1);
  });
  test('Simple rotate to delta', () => {
    elem1.animations.new()
      .rotation({ delta: 1, duration: 1 })
      .start();

    elem1.animations.nextFrame(0);
    expect(round(elem1.getRotation())).toBe(0);

    elem1.animations.nextFrame(0.5);
    expect(round(elem1.getRotation())).toBe(0.5);

    elem1.animations.nextFrame(1.0);
    expect(round(elem1.getRotation())).toBe(1);

    elem1.animations.nextFrame(1.1);
    expect(round(elem1.getRotation())).toBe(1);
  });
  // test('Rotate counter clock wise', () => {
  //   elem1.animations.new()
  //     .rotation({
  //       start: 1, target: 0, direction: 1, duration: 1,
  //     })
  //     .start();

  //   elem1.animations.nextFrame(0);
  //   expect(round(elem1.getRotation())).toBe(1);

  //   elem1.animations.nextFrame(0.5);
  //   expect(round(elem1.getRotation(), 2)).toBe(3.64);

  //   elem1.animations.nextFrame(1.0);
  //   expect(round(elem1.getRotation(), 2)).toBe(0);
  // });
  describe('Rotation Types', () => {
    describe('2D', () => {
      test('r', () => {
        elem1.transform.updateRotation(['r', 0]);
        elem1.animations.new().rotation({ target: ['r', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('2D', () => {
        elem1.transform.updateRotation(['2D', 0]);
        elem1.animations.new().rotation({ target: ['2D', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('number', () => {
        elem1.transform.updateRotation(0);
        elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
      test('mix', () => {
        elem1.transform.updateRotation(0);
        elem1.animations.new().rotation({ target: ['2D', 1], duration: 1 }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation())).toBe(0);
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 2)).toBe(0.5);
      });
    });
    describe('cartesian', () => {
      test('rc', () => {
        elem1.transform.updateRotation(['rc', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['rc', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
      test('xyz', () => {
        elem1.transform.updateRotation(['xyz', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['xyz', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rc', 0, 0, 0]);
        elem1.animations.new().rotation({ target: ['xyz', 1, 2, 3], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rc', 0, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rc', 0.5, 1, 1.5]));
      });
    });
    describe('axis angle', () => {
      test('ra', () => {
        elem1.transform.updateRotation(['ra', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['ra', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('ra numbers', () => {
        elem1.transform.updateRotation(['ra', 0, 1, 0, 0]);
        elem1.animations.new().rotation({ target: ['ra', 0, 1, 0, 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('axis', () => {
        elem1.transform.updateRotation(['axis', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['axis', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['ra', [0, 1, 0], 0]);
        elem1.animations.new().rotation({ target: ['axis', [0, 1, 0], 1], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['ra', 0, 1, 0, 0.5]));
      });
    });
    describe('direction', () => {
      test('rd', () => {
        elem1.transform.updateRotation(['rd', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['rd', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('rd numbers', () => {
        elem1.transform.updateRotation(['rd', 1, 0, 0]);
        elem1.animations.new().rotation({ target: ['rd', 0, 1, 0], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('dir', () => {
        elem1.transform.updateRotation(['dir', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['dir', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rd', [1, 0, 0]]);
        elem1.animations.new().rotation({ target: ['dir', [0, 1, 0]], duration: 1 }).start();
        const t = elem1.getTransform.bind(elem1);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rd', 1, 0, 0]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rd', 0.5, 0.5, 0]));
      });
    });
    describe('rbasis', () => {
      test('rb', () => {
        elem1.transform.updateRotation(['rb', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rb', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('rb numbers', () => {
        elem1.transform.updateRotation(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]);
        elem1.animations.new().rotation({
          target: ['rb', 0, 0, 1, 0, 1, 0, -1, 0, 0],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('rbasis', () => {
        elem1.transform.updateRotation(['rbasis', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rbasis', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
      test('mix', () => {
        elem1.transform.updateRotation(['rb', { x: [1, 0, 0], y: [0, 1, 0] }]);
        elem1.animations.new().rotation({
          target: ['rbasis', { x: [0, 0, 1], y: [0, 1, 0] }],
          duration: 1,
        }).start();
        const t = elem1.getTransform.bind(elem1);
        const r2 = 1 / Math.sqrt(2);
        elem1.animations.nextFrame(0);
        expect(round(t().rDef())).toEqual(round(['rb', 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        elem1.animations.nextFrame(0.5);
        expect(round(t().rDef())).toEqual(round(['rb', r2, 0, r2, 0, 1, 0, -r2, 0, r2]));
      });
    });
  });
  describe('Rotations', () => {
    let testTarget;
    beforeEach(() => {
      testTarget = (start, target, startExpect, halfExpect, targetExpect) => {
        elem1.transform.updateRotation(start);
        elem1.animations.new().rotation({
          target,
          duration: 1,
        }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.transform.rDef(), 3)).toEqual(round(startExpect, 3));
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.transform.rDef(), 3)).toEqual(round(halfExpect, 3));
        elem1.animations.nextFrame(1);
        expect(round(elem1.transform.rDef(), 3)).toEqual(round(targetExpect, 3));
      };
    });
    describe('2D', () => {
      test('positive', () => {
        testTarget(
          ['r', 0],   // start
          ['r', 1],   // target
          ['r', 0],   // test at start
          ['r', 0.5], // test half way
          ['r', 1],   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['r', 1],   // start
          ['r', 0],   // target
          ['r', 1],   // test at start
          ['r', 0.5], // test half way
          ['r', 0],   // test at target
        );
      });
      test('>2π', () => {
        testTarget(
          ['r', 0],
          ['r', 3 * Math.PI],
          ['r', 0],
          ['r', 1.5 * Math.PI],
          ['r', 3 * Math.PI],
        );
      });
      test('<-2π', () => {
        testTarget(
          ['r', 0],
          ['r', -3 * Math.PI],
          ['r', 0],
          ['r', -1.5 * Math.PI],
          ['r', -3 * Math.PI],
        );
      });
    });
    describe('axis angle', () => {
      test('positive', () => {
        testTarget(
          ['ra', 1, 0, 0, 0],   // start
          ['ra', 1, 0, 0, 1],   // target
          ['ra', 1, 0, 0, 0],   // test at start
          ['ra', 1, 0, 0, 0.5], // test half way
          ['ra', 1, 0, 0, 1],   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['ra', 1, 0, 0, 1],
          ['ra', 1, 0, 0, 0],
          ['ra', 1, 0, 0, 1],
          ['ra', 1, 0, 0, 0.5],
          ['ra', 1, 0, 0, 0],
        );
      });
      test('>2π', () => {
        testTarget(
          ['ra', 1, 0, 0, 0],
          ['ra', 1, 0, 0, Math.PI * 3],
          ['ra', 1, 0, 0, 0],
          ['ra', 1, 0, 0, Math.PI * 1.5],
          ['ra', 1, 0, 0, Math.PI * 3],
        );
      });
      test('<-2π', () => {
        testTarget(
          ['ra', 1, 0, 0, 0],
          ['ra', 1, 0, 0, -Math.PI * 3],
          ['ra', 1, 0, 0, 0],
          ['ra', 1, 0, 0, -Math.PI * 1.5],
          ['ra', 1, 0, 0, -Math.PI * 3],
        );
      });
      test('Axis Moves', () => {
        testTarget(
          ['ra', 1, 0, 0, 0],
          ['ra', 0, 1, 0, 1],
          ['ra', 1, 0, 0, 0],
          ['ra', 0.5, 0.5, 0, 0.5],
          ['ra', 0, 1, 0, 1],
        );
      });
    });
    describe('xyz', () => {
      test('x', () => {
        testTarget(
          ['rc', 0, 0, 0],   // start
          ['rc', 1, 0, 0],   // target
          ['rc', 0, 0, 0],   // test at start
          ['rc', 0.5, 0, 0], // test half way
          ['rc', 1, 0, 0],   // test at target
        );
      });
    });
  });
  describe('Velocity', () => {
    describe('Use Velocity to Define Duration', () => {
      let testV;
      beforeEach(() => {
        testV = (start, target, velocity, startExpect, halfExpect, targetExpect) => {
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            target,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(0.5);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(halfExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(targetExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          ['r', 2],
          ['r', 2],
          ['r', 0],
          ['r', 1],
          ['r', 2],
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, 1, 0, 0],
          ['ra', 0, 1, 0, 2],
          ['ra', 0, 0, 0, 2],
          ['ra', 0, 1, 0, 0],
          ['ra', 0, 1, 0, 1],
          ['ra', 0, 1, 0, 2],
        );
      });
      test('xyz', () => {
        testV(
          ['rc', 0, 0, 0],
          ['rc', 1, 2, 3],
          ['rc', 1, 2, 3],
          ['rc', 0, 0, 0],
          ['rc', 0.5, 1, 1.5],
          ['rc', 1, 2, 3],
        );
      });
    });
    describe('Use Velocity to Define Target', () => {
      let testV;
      beforeEach(() => {
        testV = (start, duration, velocity, startExpect, halfExpect, targetExpect) => {
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            duration,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(0.5);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(halfExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(targetExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          1,
          ['r', 2],
          ['r', 0],
          ['r', 1],
          ['r', 2],
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, 1, 0, 0],
          1,
          ['ra', 0, 0, 0, 2],
          ['ra', 0, 1, 0, 0],
          ['ra', 0, 1, 0, 1],
          ['ra', 0, 1, 0, 2],
        );
      });
      test('xyz', () => {
        testV(
          ['rc', 0, 0, 0],
          1,
          ['rc', 1, 2, 3],
          ['rc', 0, 0, 0],
          ['rc', 0.5, 1, 1.5],
          ['rc', 1, 2, 3],
        );
      });
    });
    describe('Use Velocity in infinite rotation', () => {
      let testV;
      beforeEach(() => {
        testV = (start, velocity, startExpect, oneSExpect, tenSExpect) => {
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            duration: null,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(oneSExpect, 3));
          elem1.animations.nextFrame(10);
          expect(round(elem1.transform.rDef(), 3)).toEqual(round(tenSExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          ['r', 1],
          ['r', 0],
          ['r', 1],
          ['r', 10],
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, 1, 0, 0],
          ['ra', 0, 0, 0, 2],
          ['ra', 0, 1, 0, 0],
          ['ra', 0, 1, 0, 2],
          ['ra', 0, 1, 0, 20],
        );
      });
      test('xyz', () => {
        testV(
          ['rc', 0, 0, 0],
          ['rc', 1, 2, 3],
          ['rc', 0, 0, 0],
          ['rc', 1, 2, 3],
          ['rc', 10, 20, 30],
        );
      });
    });
  });
});
