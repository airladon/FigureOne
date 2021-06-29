/* eslint-disable object-curly-newline, object-property-newline */
import {
  round,
} from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';
import { cube } from '../../../tools/g2';

jest.useFakeTimers();

describe('Element Move', () => {
  let figure;
  let a;
  let move;
  let move3;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    move = (moveOptions) => {
      a = figure.add({
        name: 'a',
        make: 'polygon',
        radius: 0.5,
        move: moveOptions,
      });
    };
    move3 = (moveOptions, position = [0, 0, 0]) => {
      const [cubeV] = cube({
        side: 0.5,
        position: [0, 0, 0],
      });
      a = figure.add({
        name: 'a',
        make: 'gl',
        vertexShader: { dimension: 3 },
        vertices3: { data: cubeV },
        position,
        move: moveOptions,
      });
    };
  });
  // When something is running freely with 0 deceleration and 0 bounce loss, it will
  // go on forever calling animation frames. Therefore, let's clean this up so we can
  // quickly move onto the next test.
  afterEach(() => {
    a.state.isMovingFreely = false;
    jest.runAllTimers();
  });
  describe('2D', () => {
    test('Translation', () => {
      move(true);
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([2, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([2, 0, 0]);
      expect(a.state.isMovingFreely).toBe(false);
      figure.mock.touchUp();
      expect(a.getPosition('figure').toArray()).toEqual([2, 0, 0]);
      expect(a.state.movement.velocity.round().toArray()).toEqual([1, 0, 0]);
      expect(a.state.isMovingFreely).toBe(true);
    });
    test('Translation, no deceleration', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      figure.mock.timeStep(1);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([2, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.getRemainingMovingFreelyTime()).toBe(null);
    });
    test('Translation, deceleration', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0.1,
          zeroVelocityThreshold: 0.0001,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      figure.mock.timeStep(1);
      // v1 = v0 - a * t = 1 - 0.1 * 1 = 0.9
      // s = vt + 0.5 * at^2 = 1 * 1 - 0.5 * 0.1 * 1 * 1 = 0.95
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1.95, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0.9, 0, 0]);
      // Remaining time is not exactly 9 because of the zeroVelocityThreshold
      expect(round(a.getRemainingMovingFreelyTime())).toBe(8.999);
    });
    test('Translation, mag deceleration', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0.1,
          zeroVelocityThreshold: 0.0001,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 1]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 1, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 1, 0]);
      figure.mock.timeStep(1);
      // Mag velocity = √2
      // v1 = v0 - a * t = √2 - 0.1 * 1 = 1.31421 => x, y = 0.929289
      // s = vt + 0.5 * at^2 = √2 * 1 - 0.5 * 0.1 * 1 * 1 = 1.36421 => x, y = 0.964644
      // Remaining time = (√2 - 0.0001) / 0.1 - 1 = 13.141135
      expect(a.getPosition('figure').round(4).toArray()).toEqual([1.9646, 1.9646, 0]);
      expect(a.state.movement.velocity.round(4).toArray()).toEqual([0.9293, 0.9293, 0]);
      // Remaining time is not exactly 9 because of the zeroVelocityThreshold
      expect(round(a.getRemainingMovingFreelyTime(), 4)).toBe(13.1411);
    });
    test('Translation, no deceleration, no bounce loss, bounds', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0,
          bounceLoss: 0,
        },
        bounds: { left: 4, right: 4, bottom: 1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      figure.mock.timeStep(1);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([2, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      figure.mock.timeStep(3);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([3, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([-1, 0, 0]);
      expect(a.getRemainingMovingFreelyTime()).toBe(null);
    });
    test('Translation, no deceleration, bounce loss, bounds', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0,
          bounceLoss: 0.9,
          zeroVelocityThreshold: 0.01,
        },
        bounds: { left: 1, right: 2, bottom: 1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      // Remaining Time:
      // 1s to get to first wall
      // Velocity goes to 0.9 * 1 = 0.1
      // 30s to get to left wall
      expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(31);

      figure.mock.timeStep(1);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([2, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);

      figure.mock.timeStep(20);
      expect(a.getPosition('figure').round(3).toArray()).toEqual([0, 0, 0]);
      expect(a.state.movement.velocity.round(3).toArray()).toEqual([-0.1, 0, 0]);

      figure.mock.timeStep(11);
      expect(a.getPosition('figure').round(3).toArray()).toEqual([-1, 0, 0]);
      expect(a.state.movement.velocity.round(3).toArray()).toEqual([0, 0, 0]);
    });
    test('Translation, deceleration, no bounce loss, bounds', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0.1,
          bounceLoss: 0,
          zeroVelocityThreshold: 0.00001,
        },
        bounds: { left: 1, right: 2, bottom: 1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      // Remaining Time: 10s
      // After 2s:
      // v1 = v0 - a * t = 1 * 2 - 0.1 * 2 = 1.8
      // s = vt + 0.5 * at^2 = 1 * 2 - 0.5 * 0.1 * 2 * 2 = 2 - 0.2 = 1.8
      expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(10);
      figure.mock.timeStep(2);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1.2, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([-0.8, 0, 0]);
    });
    test('Translation, deceleration, bounce loss, bounds', () => {
      move({
        type: 'translation',
        freely: {
          deceleration: 0.1,
          bounceLoss: 0.5,
          zeroVelocityThreshold: 0.00001,
        },
        bounds: { left: 1, right: 2, bottom: 1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([1, 0]);
      figure.mock.touchUp();
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([1, 0, 0]);
      // Find time for s = 1 (bounce) when decel = 0.1
      // 1 = vt - 0.5 * 0.1 * t^2
      // t = (-b + √(b ** 2 - 4 * a * c)) / (2 * a);
      // b = 1, a = -0.05, c = -1
      // t = (-1 + √(1 - 4 * -1 * -0.05)) / -0.1
      //   = (-1 + √0.8) / -0.1
      //   = 1.0557281
      //
      // At 1.055:
      // v1 = v0 - a * t = 1 - 0.1 * 1.055 = 0.89442719
      // After bounce = v1 * 0.5 = 0.447213595
      //
      // Remaining Time = (0.4472 - 0.00001) / 0.1 = 4.472035954999579
      // Remaining distance:
      // s = vt + 0.5 * at^2 = 0.4472 * 4.47 - 0.5 * 0.1 * 4.47 * 4.47 = 0.99999999
      figure.mock.timeStep(1.0557282);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([2, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([-0.44721, 0, 0]);
      expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(4.47);

      figure.mock.timeStep(5);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([1, 0, 0]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0, 0, 0]);
    });
    test('Rotation, no deceleration', () => {
      move3({
        type: 'rotation',
        freely: {
          deceleration: 0,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0.4, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([0.4 * Math.cos(1), 0.4 * Math.sin(1)]);
      expect(round(a.getRotation())).toEqual(1);
      figure.mock.touchUp();
      expect(round(a.getRotation())).toEqual(1);
      expect(round(a.state.movement.velocity)).toEqual(1);
      expect(a.state.isMovingFreely).toBe(true);

      figure.mock.timeStep(1);
      expect(round(a.getRotation())).toEqual(2);
      expect(round(a.state.movement.velocity)).toEqual(1);

      figure.mock.timeStep(7);
      expect(round(a.getRotation())).toEqual(9);
      expect(round(a.state.movement.velocity)).toEqual(1);
    });
  });
});
