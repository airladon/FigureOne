import {
  Point,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import makeFigure from '../__mocks__/makeFigure';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');
jest.useFakeTimers();

describe('Move Freely', () => {
  let figure;
  let a;
  let click;
  beforeEach(() => {
    figure = makeFigure();
    figure.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
          sides: 4,
          rotation: Math.PI / 4,
        },
      },
    ]);
    a = figure.elements._a;
    a.move.freely.deceleration = { translation: 1 };
    a.setMovable(true);
    click = jest.fn();
    a.onClick = click;
    figure.initialize();
  });
  describe('Touch in bounds', () => {
    test('In Bounds', () => {
      expect(click.mock.calls.length).toBe(0);
      figure.mock.touchDown([0, 0]);
      expect(click.mock.calls.length).toBe(1);
    });
    test('On Edge', () => {
      expect(click.mock.calls.length).toBe(0);
      figure.mock.touchDown([1 / Math.sqrt(2) - 0.001, 0]);
      expect(click.mock.calls.length).toBe(1);
    });
    test('Out of bounds', () => {
      expect(click.mock.calls.length).toBe(0);
      figure.mock.touchDown([1 / Math.sqrt(2) + 0.001, 0]);
      expect(click.mock.calls.length).toBe(0);
    });
  });
  describe('Move', () => {
    test('One Step', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      figure.mock.touchDown([0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
    });
    test('One Step with time', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      figure.mock.touchDown([0, 0]);
      figure.mock.timeStep(0.1);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
    });
    test('Two Steps with time', () => {
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      figure.mock.touchDown([0, 0]);
      figure.mock.timeStep(0.1);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 0));
      figure.mock.timeStep(0.1);
      figure.mock.touchMove([1, 1]);
      expect(a.getPosition().round(3)).toEqual(new Point(1, 1));
    });
    test('Moving Freely', () => {
      figure.mock.timeStep(0);
      figure.mock.touchDown([0, 0]);
      figure.mock.touchMove([-5, 0]);
      figure.mock.timeStep(1);
      figure.mock.touchMove([0, 0]);
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      figure.mock.touchUp();
      expect(a.getPosition().round(3)).toEqual(new Point(0, 0));
      // figure.mock.timeStep(0);
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(5);
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3)).toEqual(new Point(4.5, 0));
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(4);
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3)).toEqual(new Point(8, 0));
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(3);
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3)).toEqual(new Point(10.5, 0));
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(2);
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3)).toEqual(new Point(12, 0));
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(1);
      expect(a.state.isMovingFreely).toBe(true);
      figure.mock.timeStep(1);
      expect(a.getPosition().round(3)).toEqual(new Point(12.5, 0));
      expect(round(a.getRemainingMovingFreelyTime(), 3)).toBe(0);
      expect(a.state.isMovingFreely).toBe(false);
    });
  });
});
