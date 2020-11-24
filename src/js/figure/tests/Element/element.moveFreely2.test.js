import {
  Line, rectToPolar,
} from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Move Freely', () => {
  let figure;
  let a;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
          sides: 4,
          rotation: Math.PI / 4,
        },
        mods: {
          move: {
            maxVelocity: { translation: 100 },
            freely: {
              deceleration: { translation: 2 },
            },
          },
        },
      },
    ]);
    a = figure.elements._a;
    // a.move.freely.deceleration = { translation: 2 };
    // a.move.maxVelocity = { translation: 100 };
    a.setMovable(true);
    figure.initialize();
  });
  test('Moving Freely', () => {
    figure.mock.timeStep(0);
    figure.mock.touchDown([0, 0]);
    figure.mock.timeStep(0.1);
    figure.mock.touchMove([1, 0]);
    figure.mock.touchUp();
    // Now moving at 10 units/s
    // With a deceleration of 2 units / s / s, the moving will last 10 / 2 = 5s
    // After 1s the displacement will be:
    //  s = v0 * t + 0.5at^2
    //    = 10 * 1 - 0.5 * 2 * 1^2
    //    = 10 - 1 = 9
    // After 5s the displacement will be:
    //  s = v0 * t + 0.5at^2
    //    = 10 * 5 - 0.5 * 2 * 5^2
    //    = 50 - 25 = 25

    expect(a.state.movement.velocity.t().round(3).x).toBe(10);
    expect(a.getPosition().round(3).x).toEqual(1);
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(5);
    expect(a.state.isMovingFreely).toBe(true);

    figure.mock.timeStep(1);
    expect(a.getPosition().round(3).x).toEqual(10);
    expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(4);
    expect(a.state.isMovingFreely).toBe(true);

    figure.mock.timeStep(4);
    expect(a.getPosition().round(3).x).toEqual(26);
    expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(0);
    expect(a.state.isMovingFreely).toBe(false);
  });
  test('Move freely along a line', () => {
    a.move.bounds.updateTranslation(new Line([0, 0], [50, 50]));
    a.move.freely.deceleration = 1;
    figure.mock.timeStep(0);
    figure.mock.touchDown([0, 0]);
    figure.mock.timeStep(0.1);
    figure.mock.touchMove([0.5 * Math.sqrt(2), 0]);
    figure.mock.touchUp();

    // Moving at 5 units/s
    // Total time = 5s
    // Distance: s = v0t - 0.5*1*t^2 = 25 - 12.5 = 12.5;
    const x = 0.5 / Math.sqrt(2);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toBe(5);
    expect(a.getPosition().round(3).x).toEqual(round(x, 3));
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(5);
    expect(a.state.isMovingFreely).toBe(true);

    // After 1s:
    //  v1 = v0 - at = 5 - 1 = 4
    //  s  = 5 - 0.5 = 4.5
    figure.mock.timeStep(1);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toBe(4);
    expect(a.getPosition().round(3).x).toEqual(round(x + 4.5 / Math.sqrt(2), 3));
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(4);
    expect(a.state.isMovingFreely).toBe(true);

    // After 2s:
    //  v2 = v1 - at = 4 - 1 = 3
    //  s  = 4 - 0.5 = 3.5 (+4.5)
    figure.mock.timeStep(1);
    expect(round(rectToPolar(a.state.movement.velocity.t()).mag, 3)).toBe(3);
    expect(a.getPosition().round(3).x).toEqual(round(x + (4.5 + 3.5) / Math.sqrt(2), 3));
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(3);
    expect(a.state.isMovingFreely).toBe(true);
  });
});
