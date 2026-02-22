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
      figure.mock.touchDown([0, 0]);
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
      figure.mock.touchDown([0, 0]);
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
      figure.mock.touchDown([0, 0]);
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
      figure.mock.touchDown([0, 0]);
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
        bounds: { left: -4, right: 4, bottom: -1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
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
        bounds: { left: -1, right: 2, bottom: -1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
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
        bounds: { left: -1, right: 2, bottom: -1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
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
        bounds: { left: -1, right: 2, bottom: -1, top: 1 },
      });
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
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
      expect(a.getRemainingMovingFreelyTime()).toBe(null);

      figure.mock.timeStep(1);
      expect(round(a.getRotation())).toEqual(2);
      expect(round(a.state.movement.velocity)).toEqual(1);
      figure.mock.timeStep(7);
      expect(round(a.getRotation())).toEqual(9);
      expect(round(a.state.movement.velocity)).toEqual(1);
    });
    test('Rotation, deceleration', () => {
      move3({
        type: 'rotation',
        freely: {
          deceleration: 0.1,
          zeroVelocityThreshold: 0.00001,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0.4, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([0.4 * Math.cos(-1), 0.4 * Math.sin(-1)]);
      expect(round(a.getRotation())).toEqual(-1);
      figure.mock.touchUp();
      expect(round(a.getRotation())).toEqual(-1);
      expect(round(a.state.movement.velocity)).toEqual(-1);
      expect(a.state.isMovingFreely).toBe(true);
      expect(a.getRemainingMovingFreelyTime()).toBe(9.9999);
    });
    test('Rotation, deceleration and bounce', () => {
      move3({
        type: 'rotation',
        freely: {
          deceleration: 0.1,
          zeroVelocityThreshold: 0.00001,
        },
        bounds: {
          min: -1, max: 2,
        },
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0.4, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([0.4 * Math.cos(1), 0.4 * Math.sin(1)]);
      expect(round(a.getRotation())).toEqual(1);
      figure.mock.touchUp();

      // Find time for s = 1 (bounce) at angle = 2 when decel = 0.1
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
      expect(round(a.getRotation())).toEqual(2);
      expect(round(a.state.movement.velocity, 5)).toEqual(-0.44721);
      expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(4.47);
    });
  });
  describe('3D', () => {
    test('Translation YZ at X=-1', () => {
      move3({
        type: 'translation',
        plane: [[-1, 0, 0], [1, 0, 0]],
        bounds: {
          rightDirection: [0, 0, -1],
          left: -1,
          bottom: -2,
          top: 3,
          right: 4,
        },
        freely: {
          bounceLoss: 0.5,
          deceleration: 0.1,
        },
      }, [-1, 0, 0]);
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });

      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [-1, 0, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([-1, 1, -1]);
      expect(a.getPosition('figure').toArray()).toEqual([-1, 1, -1]);
      figure.mock.touchUp();
      expect(a.state.isMovingFreely).toBe(true);
      // Intersect will be at (-1, 3, -3) with reflection in y: (-1, -3, -3)
      // Distance s: (-1, 1, -1) -> (-1, 3, -3) = Math.sqrt(8)
      // Velocity Mag: √2
      // Find time for s = √8 (bounce) when decel = 0.1
      // s = vt - 0.5at^2 => -0.5at^2 + vt - s = 0
      // t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
      // a = -0.05, b = Math.sqrt(2), c = -Math.sqrt(8)
      // t = 2.1658483231909287
      //
      // At 2.1658s:
      // v1 = v0 - a * t = Math.sqrt(2) - 0.1 * 2.1658483231909287 = 1.1976287300540023
      //    = (x, y) = (0.8468513963650182, 0.8468513963650182)
      // After bounce = v1 * 0.5 = 0.5988143650270011 = (0.4234256981825091, 0.4234256981825091)
      //
      // Just before bounce
      figure.mock.timeStep(2.1658482);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([-1, 3, -3]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0, 0.84685, -0.84685]);
      figure.mock.timeStep(0.0000002);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0, -0.42343, -0.42343]);
    });
    test('Translation along line in YZ plane at X = -1', () => {
      move3({
        type: 'translation',
        plane: [[-1, 0, 0], [1, 0, 0]],
        bounds: {
          p1: [-1, -1, 1],
          p2: [-1, 1.5, -1.5],
        },
        freely: {
          bounceLoss: 0.5,
          deceleration: 0.1,
        },
      }, [-1, 0, 0]);
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });

      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [-1, 0, 0]);
      figure.mock.timeStep(0.5);
      figure.mock.touchMove([-1, 0.5, -0.5]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-1, 0.5, -0.5]);
      figure.mock.touchUp();
      expect(a.state.isMovingFreely).toBe(true);
      // Intersect will be at (-1, 1, -1) with reflection: (-1, -1, 1)
      // Distance s: (-1, 0.5, -0.5) -> (-1, 1.5, -1.5) = Math.sqrt(2)
      // Velocity Mag: √2
      // Find time for s = √2 (bounce) when decel = 0.1
      // s = vt - 0.5at^2 => -0.5at^2 + vt - s = 0
      // t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
      // a = -0.05, b = Math.sqrt(2), c = -Math.sqrt(2)
      // t = 1.0381007965283717
      //
      // At 1.03810s:
      // v1 = v0 - a * t = Math.sqrt(2) - 0.1 * 1.0381007965283717 = 1.310403482720258
      //    = (x, y) = (0.9265951887219632, 0.9265951887219632)
      // After bounce = v1 * 0.5 = 0.655201741360129 = (0.4632975943609816, 0.4632975943609816)
      //
      // Just before bounce
      figure.mock.timeStep(1.0381007);
      expect(a.getPosition('figure').round(5).toArray()).toEqual([-1, 1.5, -1.5]);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0, 0.92660, -0.92660]);
      figure.mock.timeStep(0.0000002);
      expect(a.state.movement.velocity.round(5).toArray()).toEqual([0, -0.46330, 0.46330]);
    });
    test('Rotation with bounds in XZ with Y offset', () => {
      move3({
        type: 'rotation',
        plane: [[0, 1, 0], [0, 1, 0]],
        bounds: { min: -1, max: 1 },
        freely: {
          deceleration: 0.1,
          bounceLoss: 0.5,
        },
      }, [0, 1, 0]);
      a.transform.updateRotation(0, [0, 1, 0]);
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.mock.timeStep(0);
      figure.mock.touchElement(a, [0.4, 1, 0]);
      figure.mock.timeStep(0.5);
      figure.mock.touchMove([0.4 * Math.cos(0.5), 1, -0.4 * Math.sin(0.5)]);
      figure.mock.touchUp();
      expect(a.state.isMovingFreely).toBe(true);
      expect(round(a.state.movement.velocity, 5)).toEqual(1);
      // Velocity is 1 rad / s
      // Distance to bound is 0.5
      // Find time for s = 0.5 (bounce) when decel = 0.1
      // s = vt - 0.5at^2 => -0.5at^2 + vt - s = 0
      // t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
      // a = -0.05, b = 1, c = -0.5
      // t = 0.5131670194948623
      //
      // At 0.5131670194948623:
      // v1 = v0 - a * t = 1 - 0.1 * 0.5131670194948623 = 0.9486832980505138
      // After bounce = v1 * 0.5 = 0.4743416490252569
      figure.mock.timeStep(0.51316700);
      expect(round(a.getRotation(), 5)).toBe(1);
      expect(round(a.state.movement.velocity, 5)).toEqual(0.94868);
      figure.mock.timeStep(0.0000002);
      expect(round(a.state.movement.velocity, 5)).toEqual(-0.47434);
    });
  });
});
