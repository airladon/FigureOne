import { Point, Transform } from '../../../../tools/g2';
import { round } from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
// import timeStep from '../../../../__mocks__/timeStep';

// tools.isTouchDevice = jest.fn();

describe('Diagram Recorder', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          color: [1, 0, 0, 1],
        },
      },
    ]);
    diagram.initialize();
    a = diagram.getElement('a');
  });
  test('Simple Position', () => {
    a.animations.new()
      .scenario({ target: { position: [1, 1] }, duration: 1 })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
  });
  test('Transform', () => {
    a.animations.new()
      .scenario({
        target: {
          transform: new Transform().scale(2, 2).rotate(1).translate(1, 1),
        },
        duration: 1,
      })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    expect(a.getScale()).toEqual(new Point(1, 1));
    expect(a.getRotation()).toBe(0);
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    expect(a.getScale()).toEqual(new Point(1.5, 1.5));
    expect(a.getRotation()).toBe(0.5);
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.getScale()).toEqual(new Point(2, 2));
    expect(a.getRotation()).toBe(1);
  });
  test('Position, Rotation, Scale, Color, isShown', () => {
    a.animations.new()
      .scenario({
        target: {
          position: [1, 1],
          isShown: false,
          rotation: 1,
          scale: 2,
          color: [0, 1, 0, 1],
        },
        duration: 1,
      })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    expect(a.getScale()).toEqual(new Point(1, 1));
    expect(a.getRotation()).toBe(0);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([1, 0, 0, 1]);
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    expect(a.getScale()).toEqual(new Point(1.5, 1.5));
    expect(a.getRotation()).toBe(0.5);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0.5, 0.5, 0, 1]);
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.getScale()).toEqual(new Point(2, 2));
    expect(a.getRotation()).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(false);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Position, Rotation, Scale, Color, isShown with Start', () => {
    a.animations.new()
      .scenario({
        start: {
          position: [2, 2],
          isShown: false,
          rotation: 2,
          scale: 3,
          color: [0, 0, 1, 0.5],
        },
        target: {
          position: [1, 1],
          isShown: true,
          rotation: 1,
          scale: 2,
          color: [0, 1, 0, 1],
        },
        duration: 1,
      })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(2, 2));
    expect(a.getScale()).toEqual(new Point(3, 3));
    expect(a.getRotation()).toBe(2);
    expect(a.opacity).toBe(0.001);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 0, 1, 0.5]);
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(1.5, 1.5));
    expect(a.getScale()).toEqual(new Point(2.5, 2.5));
    expect(a.getRotation()).toBe(1.5);
    expect(a.opacity).toBe(0.5005);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 0.5, 0.5, 0.75]);
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.getScale()).toEqual(new Point(2, 2));
    expect(a.getRotation()).toBe(1);
    expect(a.opacity).toBe(1);
    expect(a.isShown).toBe(true);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity Position', () => {
    a.animations.new()
      .scenario({ target: { position: [1, 1] }, velocity: { translation: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    diagram.mock.timeStep(2);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity Rotation', () => {
    a.animations.new()
      .scenario({ target: { rotation: 1 }, velocity: { rotation: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getRotation()).toEqual(0);
    diagram.mock.timeStep(1);
    expect(a.getRotation()).toEqual(0.5);
    diagram.mock.timeStep(2);
    expect(a.getRotation()).toEqual(1);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity Scale', () => {
    a.animations.new()
      .scenario({ target: { scale: [2, 2] }, velocity: { scale: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getScale()).toEqual(new Point(1, 1));
    diagram.mock.timeStep(1);
    expect(a.getScale()).toEqual(new Point(1.5, 1.5));
    diagram.mock.timeStep(2);
    expect(a.getScale()).toEqual(new Point(2, 2));
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity Transform', () => {
    a.animations.new()
      .scenario({
        target: {
          transform: new Transform().scale(2, 2).rotate(1).translate(1, 1),
        },
        velocity: {
          transform: new Transform().scale(0.5, 0.5).rotate(0.5).translate(0.5, 0.5),
        },
      })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    expect(a.getScale()).toEqual(new Point(1, 1));
    expect(a.getRotation()).toBe(0);
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    expect(a.getScale()).toEqual(new Point(1.5, 1.5));
    expect(a.getRotation()).toBe(0.5);
    diagram.mock.timeStep(2);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.getScale()).toEqual(new Point(2, 2));
    expect(a.getRotation()).toBe(1);
  });
  test('Velocity Color', () => {
    a.animations.new()
      .scenario({ target: { color: [0, 1, 0, 1] }, velocity: { color: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.color).toEqual([1, 0, 0, 1]);
    diagram.mock.timeStep(1);
    expect(a.color).toEqual([0.5, 0.5, 0, 1]);
    diagram.mock.timeStep(2);
    expect(a.color).toEqual([0, 1, 0, 1]);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity Opacity Show', () => {
    a.hide();
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    a.animations.new()
      .scenario({ target: { isShown: true }, velocity: { opacity: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.opacity).toEqual(0.001);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(1);
    expect(a.opacity).toEqual(0.5005);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(true);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity opacity hide', () => {
    a.animations.new()
      .scenario({ target: { isShown: false }, velocity: { opacity: 0.5 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(1);
    expect(a.opacity).toEqual(0.5005);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Mid dissolve out', () => {
    a.setOpacity(0.2);
    a.animations.new()
      .scenario({ target: { isShown: false }, velocity: { opacity: 0.1 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.opacity).toEqual(0.2);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(1);
    expect(a.opacity).toEqual(0.1005);
    expect(a.isShown).toBe(true);
    diagram.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(a.isShown).toBe(false);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Mid dissolve in', () => {
    a.setOpacity(0.8);
    a.animations.new()
      .scenario({ target: { isShown: true }, velocity: { opacity: 0.1 } })
      .start();
    diagram.mock.timeStep(0);
    expect(a.opacity).toEqual(0.8);
    diagram.mock.timeStep(1);
    expect(a.opacity).toEqual(0.9);
    diagram.mock.timeStep(2);
    expect(a.opacity).toEqual(1);
    expect(diagram.isAnimating()).toBe(false);
  });
  test('Velocity all same duration', () => {});
  test('Velocity different durations', () => {});
  test('Velocity zero threshold', () => {});
  test('Velocity maxTime', () => {});
  test('Velocity 0 movement', () => {});
});
