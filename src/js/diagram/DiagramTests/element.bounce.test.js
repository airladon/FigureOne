import {
  Point, rectToPolar,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();

describe('Move Freely', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
          sides: 4,
          // rotation: Math.PI / 4,
        },
        mods: {
          move: {
            bounds: {
              translation: {
                left: -10, bottom: -10, right: 10, top: 10,
              },
            },
            maxVelocity: 100,
            freely: {
              deceleration: 2,
              bounceLoss: 0.5,
            },
          },
        },
      },
    ]);
    a = diagram.elements._a;
    a.setMovable(true);
    diagram.initialize();
  });
  test('Bounce', () => {
    diagram.mock.timeStep(0);
    diagram.mock.touchDown([0, 0]);
    diagram.mock.timeStep(0.1);
    diagram.mock.touchMove([1, 0]);
    diagram.mock.touchUp();
    // Now moving at 10 units/s
    // With a deceleration of 2 units / s / s, the moving will last 10 / 2 = 5s
    // After 1s the displacement will be:
    //  s = v0 * t + 0.5at^2
    //    = 10 * 1 - 0.5 * 2 * 1^2
    //    = 10 - 1 = 9
    // After 1s, the velocity will be 8 units / s
    // On bounce, velocity will be -4 units / s
    // This will mean only 2s remain for moving, for which the
    // displacement will be:
    //  s = v0 * t + 0.5at^2
    //    = 4 * 2 - 0.5 * 2 * 2^2
    //    = 8 - 4 = 4
    expect(a.getPosition().round(3).x).toEqual(1);
    expect(a.state.movement.velocity.t().round(3).x).toBe(10);
    // debugger;
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(3);
    expect(a.state.isMovingFreely).toBe(true);
    // debugger;
    diagram.mock.timeStep(1);
    expect(a.getPosition().round(3).x).toEqual(10);
    expect(a.state.movement.velocity.t().round(3).x).toBe(8);
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(2);
    expect(a.state.isMovingFreely).toBe(true);

    diagram.mock.timeStep(2);
    expect(a.getPosition().round(3).x).toEqual(6);
    expect(a.state.movement.velocity.t().round(3).x).toBe(0);
    expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(0);
    expect(a.state.isMovingFreely).toBe(false);
  });
  test('Bounce of two walls at an angle', () => {
    a.move.freely.deceleration = 1;
    a.move.freely.bounceLoss = 0;
    a.move.freely.zeroVelocityThreshold = 0.0000001;
    diagram.mock.timeStep(0);
    a.setMoveBounds({
      translation: {
        left: -9, bottom: -9, right: 9, top: 9,
      },
    });
    a.setPosition([0, -9]);
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, -9));

    diagram.mock.timeStep(0);
    diagram.mock.touchDown([0, -9]);
    diagram.mock.timeStep(0.1);
    diagram.mock.touchMove([1 * Math.cos(Math.PI / 4), -9 + 1 * Math.sin(Math.PI / 4)]);
    diagram.mock.touchUp();
    //
    // v0 = 10
    // s0 = (1, -8)
    expect(a.getPosition().round(3)).toEqual(new Point(1 / Math.sqrt(2), -9 + 1 / Math.sqrt(2)).round(3));
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toEqual(10);
    expect(a.state.isMovingFreely).toBe(true);
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(10);
    // Moving at 10 units per second in a 20 x 20 box at the origin
    // But the object has radius 1, so actually the border for the transform is 18 x 18
    // Total time till stop = 10s
    // Distance travelled = v0 * t - 0.5 * a * t^2
    //    = 10 * 10 - 0.5 * 10 * 10
    //    = 50
    //
    // Distance between halfway points on border
    //    Math.sqrt(9 ** 2 + 9 ** 2) = 12.7279
    const v0 = 10;
    const d = Math.sqrt(9 * 9 + 9 * 9);
    // Therefore there are 4 full bounces with 0.088311 left over
    const remaining = 50 - (d - 1) - 3 * d;
    // Bounces will happen at (9, 0), (0, 9), (-9, 0), (0, -9)
    // First bounce will happen after:
    // s = v0 * t - 0.5 * 1 * t^2
    // 0 = -0.5t^2 + v0t - s
    // t = 1.366104246s
    let B = v0;
    let A = -0.5;
    let C = -d + 1;
    const t1 = Math.abs(-B - Math.sqrt(B ** 2 - 4 * A * C) / (2 * A));

    diagram.mock.timeStep(t1);
    // After t1, the velocity v1 will be
    //   v1 = v0 - a * t1
    //      = 8.634
    const v1 = v0 - 1 * t1;
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toEqual(round(v1, 3));
    expect(a.getPosition().round(3)).toEqual(new Point(9, 0));

    // Second bounce will happen after:
    // s = v1 * t - 0.5 * 1 * t^2
    // 0 = -0.5t^2 + v1t - s
    // t = 1.6013428
    B = v1;
    A = -0.5;
    C = -d;
    const t2 = Math.abs(-B - Math.sqrt(B ** 2 - 4 * A * C) / (2 * A));
    console.log(t2)
    const v2 = v1 - 1 * t2;
    diagram.mock.timeStep(t2);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toEqual(round(v2, 3));
    expect(a.getPosition().round(3)).toEqual(new Point(0, 9));

    // Third bounce will happen after:
    // s = v2 * t - 0.5 * 1 * t^2
    // 0 = -0.5t^2 + v2t - s
    // t = 2.08475708
    B = v2;
    A = -0.5;
    C = -d;
    const t3 = Math.abs(-B - Math.sqrt(B ** 2 - 4 * A * C) / (2 * A));
    const v3 = v2 - 1 * t3;
    diagram.mock.timeStep(t3);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toEqual(round(v3, 3));
    expect(a.getPosition().round(3)).toEqual(new Point(-9, 0));

    // Forth bounce will happen after:
    // s = v3 * t - 0.5 * 1 * t^2
    // 0 = -0.5t^2 + v3t - s
    // t = 4.64258573
    B = v3;
    A = -0.5;
    C = -d;
    const t4 = Math.abs(-B - Math.sqrt(B ** 2 - 4 * A * C) / (2 * A));
    const v4 = v3 - 1 * t4;
    diagram.mock.timeStep(t4);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toEqual(round(v4, 3));
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(round(10 - t1 - t2 - t3 - t4, 2));
  });
});
