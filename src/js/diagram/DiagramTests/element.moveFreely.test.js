import {
  Point,
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
    a = diagram.elements._a;
    // a.move.freely.deceleration = { translation: 2 };
    // a.move.maxVelocity = { translation: 100 };
    a.setMovable(true);
    diagram.initialize();
  });
  test('Moving Freely', () => {
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
    // After 5s the displacement will be:
    //  s = v0 * t + 0.5at^2
    //    = 10 * 5 - 0.5 * 2 * 5^2
    //    = 50 - 25 = 25

    expect(a.state.movement.velocity.t().round(3).x).toBe(10);
    expect(a.getPosition().round(3).x).toEqual(1);
    expect(round(a.getRemainingMovingFreelyTime(), 2)).toBe(5);
    expect(a.state.isMovingFreely).toBe(true);

    diagram.mock.timeStep(1);
    expect(a.getPosition().round(3).x).toEqual(10);
    expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(4);
    expect(a.state.isMovingFreely).toBe(true);

    diagram.mock.timeStep(4);
    expect(a.getPosition().round(3).x).toEqual(26);
    expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(0);
    expect(a.state.isMovingFreely).toBe(false);
  });
});
