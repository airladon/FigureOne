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
  describe('Rotation Types', () => {
    test('r', () => {
      elem1.transform.setComponent(1, ['r', 0]);
      elem1.transform.updateRotation(0);
      elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
      elem1.animations.nextFrame(0);
      expect(round(elem1.getRotation())).toBe(0);
      elem1.animations.nextFrame(0.5);
      expect(round(elem1.getRotation(), 2)).toBe(0.5);
    });
    test('rx', () => {
      elem1.transform.setComponent(1, ['rx', 0]);
      elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
      elem1.animations.nextFrame(0);
      expect(round(elem1.getRotation())).toBe(0);
      elem1.animations.nextFrame(0.5);
      expect(round(elem1.getRotation(), 2)).toBe(0.5);
    });
    test('ry', () => {
      elem1.transform.setComponent(1, ['ry', 0]);
      elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
      elem1.animations.nextFrame(0);
      expect(round(elem1.getRotation())).toBe(0);
      elem1.animations.nextFrame(0.5);
      expect(round(elem1.getRotation(), 2)).toBe(0.5);
    });
    test('rz', () => {
      elem1.transform.setComponent(1, ['rz', 0]);
      elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
      elem1.animations.nextFrame(0);
      expect(round(elem1.getRotation())).toBe(0);
      elem1.animations.nextFrame(0.5);
      expect(round(elem1.getRotation(), 2)).toBe(0.5);
    });
    test('ra', () => {
      elem1.transform.setComponent(1, ['ra', 0]);
      elem1.animations.new().rotation({ target: 1, duration: 1 }).start();
      elem1.animations.nextFrame(0);
      expect(round(elem1.getRotation())).toBe(0);
      elem1.animations.nextFrame(0.5);
      expect(round(elem1.getRotation(), 2)).toBe(0.5);
    });
  });
  describe('Rotations', () => {
    let testTarget;
    beforeEach(() => {
      testTarget = (initial, start, target, startExpect, halfExpect, targetExpect) => {
        elem1.transform.setComponent(1, initial);
        elem1.transform.updateRotation(start);
        elem1.animations.new().rotation({
          target,
          duration: 1,
        }).start();
        elem1.animations.nextFrame(0);
        expect(round(elem1.getRotation(), 3)).toEqual(round(startExpect, 3));
        elem1.animations.nextFrame(0.5);
        expect(round(elem1.getRotation(), 3)).toEqual(round(halfExpect, 3));
        elem1.animations.nextFrame(1);
        expect(round(elem1.getRotation(), 3)).toEqual(round(targetExpect, 3));
      };
    });
    describe('2D', () => {
      test('positive', () => {
        testTarget(
          ['r', 0],
          0,   // start
          1,   // target
          0,   // test at start
          0.5, // test half way
          1,   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['r', 0],
          1,   // start
          0,   // target
          1,   // test at start
          0.5, // test half way
          0,   // test at target
        );
      });
      test('>2π', () => {
        testTarget(
          ['r', 0],
          0,
          3 * Math.PI,
          0,
          1.5 * Math.PI,
          3 * Math.PI,
        );
      });
      test('<-2π', () => {
        testTarget(
          ['r', 0],
          0,
          -3 * Math.PI,
          0,
          -1.5 * Math.PI,
          -3 * Math.PI,
        );
      });
    });
    describe('rx', () => {
      test('positive', () => {
        testTarget(
          ['rx', 0],
          0,   // start
          1,   // target
          0,   // test at start
          0.5, // test half way
          1,   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['rx', 0],
          1,   // start
          0,   // target
          1,   // test at start
          0.5, // test half way
          0,   // test at target
        );
      });
      test('>2π', () => {
        testTarget(
          ['rx', 0],
          0,
          3 * Math.PI,
          0,
          1.5 * Math.PI,
          3 * Math.PI,
        );
      });
      test('<-2π', () => {
        testTarget(
          ['rx', 0],
          0,
          -3 * Math.PI,
          0,
          -1.5 * Math.PI,
          -3 * Math.PI,
        );
      });
    });
    describe('ry', () => {
      test('positive', () => {
        testTarget(
          ['ry', 0],
          0,   // start
          1,   // target
          0,   // test at start
          0.5, // test half way
          1,   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['ry', 0],
          1,   // start
          0,   // target
          1,   // test at start
          0.5, // test half way
          0,   // test at target
        );
      });
      test('>2π', () => {
        testTarget(
          ['ry', 0],
          0,
          3 * Math.PI,
          0,
          1.5 * Math.PI,
          3 * Math.PI,
        );
      });
      test('<-2π', () => {
        testTarget(
          ['ry', 0],
          0,
          -3 * Math.PI,
          0,
          -1.5 * Math.PI,
          -3 * Math.PI,
        );
      });
    });
    describe('rz', () => {
      test('positive', () => {
        testTarget(
          ['rz', 0],
          0,   // start
          1,   // target
          0,   // test at start
          0.5, // test half way
          1,   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['rz', 0],
          1,   // start
          0,   // target
          1,   // test at start
          0.5, // test half way
          0,   // test at target
        );
      });
      test('>2π', () => {
        testTarget(
          ['rz', 0],
          0,
          3 * Math.PI,
          0,
          1.5 * Math.PI,
          3 * Math.PI,
        );
      });
      test('<-2π', () => {
        testTarget(
          ['rz', 0],
          0,
          -3 * Math.PI,
          0,
          -1.5 * Math.PI,
          -3 * Math.PI,
        );
      });
    });
    describe('axis angle', () => {
      test('positive', () => {
        testTarget(
          ['ra', 1, [1, 0, 0]],
          0,   // start
          1,   // target
          0,   // test at start
          0.5, // test half way
          1,   // test at target
        );
      });
      test('negative', () => {
        testTarget(
          ['ra', 1, [1, 0, 0]],
          1,
          0,
          1,
          0.5,
          0,
        );
      });
      test('>2π', () => {
        testTarget(
          ['ra', 1, [1, 0, 0]],
          0,
          Math.PI * 3,
          0,
          Math.PI * 1.5,
          Math.PI * 3,
        );
      });
      test('<-2π', () => {
        testTarget(
          ['ra', 1, [1, 0, 0]],
          0,
          -Math.PI * 3,
          0,
          -Math.PI * 1.5,
          -Math.PI * 3,
        );
      });
    });
  });
  describe('Velocity', () => {
    describe('Use Velocity to Define Duration', () => {
      let testV;
      beforeEach(() => {
        testV = (initial, start, target, velocity, startExpect, halfExpect, targetExpect) => {
          elem1.transform.setComponent(1, initial);
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            target,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.getRotation(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(0.5);
          expect(round(elem1.getRotation(), 3)).toEqual(round(halfExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.getRotation(), 3)).toEqual(round(targetExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          0,
          2,
          2,
          0,
          1,
          2,
        );
      });
      test('rx', () => {
        testV(
          ['rx', 0],
          0,
          2,
          2,
          0,
          1,
          2,
        );
      });
      test('ry', () => {
        testV(
          ['ry', 0],
          0,
          2,
          2,
          0,
          1,
          2,
        );
      });
      test('rz', () => {
        testV(
          ['rz', 0],
          0,
          2,
          2,
          0,
          1,
          2,
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, [1, 0, 0]],
          0,
          2,
          2,
          0,
          1,
          2,
        );
      });
    });
    describe('Use Velocity to Define Target', () => {
      let testV;
      beforeEach(() => {
        testV = (initial, start, duration, velocity, startExpect, halfExpect, targetExpect) => {
          elem1.transform.setComponent(1, initial);
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            duration,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.getRotation(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(0.5);
          expect(round(elem1.getRotation(), 3)).toEqual(round(halfExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.getRotation(), 3)).toEqual(round(targetExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          0,
          1,
          2,
          0,
          1,
          2,
        );
      });
      test('rx', () => {
        testV(
          ['rx', 0],
          0,
          1,
          2,
          0,
          1,
          2,
        );
      });
      test('ry', () => {
        testV(
          ['ry', 0],
          0,
          1,
          2,
          0,
          1,
          2,
        );
      });
      test('rz', () => {
        testV(
          ['rz', 0],
          0,
          1,
          2,
          0,
          1,
          2,
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, [1, 0, 0]],
          0,
          1,
          2,
          0,
          1,
          2,
        );
      });
    });
    describe('Use Velocity in infinite rotation', () => {
      let testV;
      beforeEach(() => {
        testV = (initial, start, velocity, startExpect, oneSExpect, tenSExpect) => {
          elem1.transform.setComponent(1, initial);
          elem1.transform.updateRotation(start);
          elem1.animations.new().rotation({
            duration: null,
            velocity,
          }).start();
          elem1.animations.nextFrame(0);
          expect(round(elem1.getRotation(), 3)).toEqual(round(startExpect, 3));
          elem1.animations.nextFrame(1);
          expect(round(elem1.getRotation(), 3)).toEqual(round(oneSExpect, 3));
          elem1.animations.nextFrame(10);
          expect(round(elem1.getRotation(), 3)).toEqual(round(tenSExpect, 3));
        };
      });
      test('2D', () => {
        testV(
          ['r', 0],
          0,
          1,
          0,
          1,
          10,
        );
      });
      test('rx', () => {
        testV(
          ['rx', 0],
          0,
          1,
          0,
          1,
          10,
        );
      });
      test('ry', () => {
        testV(
          ['ry', 0],
          0,
          1,
          0,
          1,
          10,
        );
      });
      test('rz', () => {
        testV(
          ['rz', 0],
          0,
          1,
          0,
          1,
          10,
        );
      });
      test('Axis/Angle', () => {
        testV(
          ['ra', 0, [1, 0, 0]],
          0,
          2,
          0,
          2,
          20,
        );
      });
    });
  });
});
